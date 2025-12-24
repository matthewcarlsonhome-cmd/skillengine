/**
 * Centralized Logger Service
 *
 * Provides structured logging with log levels and production-safe behavior.
 * In development: logs to console with formatting
 * In production: silent by default, can be configured to send to external services
 *
 * Usage:
 *   import { logger } from './lib/logger';
 *   logger.info('User logged in', { userId: '123' });
 *   logger.error('API call failed', { error, endpoint });
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerConfig {
  /** Minimum log level to output (debug < info < warn < error) */
  minLevel: LogLevel;
  /** Enable console output */
  enableConsole: boolean;
  /** Enable localStorage persistence for debugging */
  enableStorage: boolean;
  /** Maximum stored logs */
  maxStoredLogs: number;
  /** Custom log handler for external services */
  externalHandler?: (entry: LogEntry) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const STORAGE_KEY = 'skillengine_logs';

const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  !window.location.hostname.includes('127.0.0.1');

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: isProduction ? 'warn' : 'debug',
  enableConsole: !isProduction,
  enableStorage: true,
  maxStoredLogs: 100,
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGGER CLASS
// ═══════════════════════════════════════════════════════════════════════════

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  /**
   * Format and output a log entry
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Storage persistence
    if (this.config.enableStorage) {
      this.logToStorage(entry);
    }

    // External handler (e.g., Sentry, LogRocket)
    if (this.config.externalHandler) {
      try {
        this.config.externalHandler(entry);
      } catch {
        // Silently fail external logging
      }
    }
  }

  /**
   * Output to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.split('T')[1].split('.')[0]}] [${entry.level.toUpperCase()}]`;
    const args: unknown[] = [prefix, entry.message];

    if (entry.context && Object.keys(entry.context).length > 0) {
      args.push(entry.context);
    }

    switch (entry.level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(...args);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(...args);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(...args);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(...args);
        break;
    }
  }

  /**
   * Persist log to localStorage for debugging
   */
  private logToStorage(entry: LogEntry): void {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as LogEntry[];
      stored.unshift(entry);

      // Trim to max size
      const trimmed = stored.slice(0, this.config.maxStoredLogs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Silently fail if localStorage unavailable
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Debug level - verbose information for development
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Info level - general operational information
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Warn level - potentially problematic situations
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Error level - errors that need attention
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Log an error with full stack trace
   */
  exception(message: string, error: Error, context?: Record<string, unknown>): void {
    this.log('error', message, {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    });
  }

  /**
   * Get stored logs for debugging
   */
  getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearStoredLogs(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail
    }
  }

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, defaultContext);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHILD LOGGER
// ═══════════════════════════════════════════════════════════════════════════

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: Record<string, unknown>
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.defaultContext, ...context });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.defaultContext, ...context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.defaultContext, ...context });
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.parent.error(message, { ...this.defaultContext, ...context });
  }

  exception(message: string, error: Error, context?: Record<string, unknown>): void {
    this.parent.exception(message, error, { ...this.defaultContext, ...context });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const logger = new Logger();

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default logger;
