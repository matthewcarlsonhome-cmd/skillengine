/**
 * Logger Service Tests
 *
 * Tests the centralized logging service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(global, 'window', {
  value: {
    location: {
      hostname: 'localhost',
    },
  },
});

// Import after mocks
import { logger, LogEntry } from '../../lib/logger';

describe('Logger Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    logger.clearStoredLogs();
    // Configure for testing
    logger.configure({
      minLevel: 'debug',
      enableConsole: false,
      enableStorage: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Log Levels', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { key: 'value' });
      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('debug');
      expect(logs[0].message).toBe('Debug message');
    });

    it('should log info messages', () => {
      logger.info('Info message');
      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('info');
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');
      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('warn');
    });

    it('should log error messages', () => {
      logger.error('Error message');
      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('error');
    });
  });

  describe('Log Filtering', () => {
    it('should respect minimum log level', () => {
      logger.configure({ minLevel: 'warn' });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(2);
      expect(logs.map((l) => l.level)).toEqual(['error', 'warn']);
    });

    it('should log all levels when minLevel is debug', () => {
      logger.configure({ minLevel: 'debug' });

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(4);
    });
  });

  describe('Context', () => {
    it('should include context in log entries', () => {
      logger.info('User action', { userId: '123', action: 'click' });
      const logs = logger.getStoredLogs();

      expect(logs[0].context).toEqual({
        userId: '123',
        action: 'click',
      });
    });

    it('should handle undefined context', () => {
      logger.info('Simple message');
      const logs = logger.getStoredLogs();

      expect(logs[0].context).toBeUndefined();
    });
  });

  describe('Exception Logging', () => {
    it('should log exceptions with stack trace', () => {
      const error = new Error('Test error');
      logger.exception('Operation failed', error, { operation: 'test' });

      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].context?.errorName).toBe('Error');
      expect(logs[0].context?.errorMessage).toBe('Test error');
      expect(logs[0].context?.errorStack).toBeDefined();
      expect(logs[0].context?.operation).toBe('test');
    });
  });

  describe('Storage Management', () => {
    it('should limit stored logs', () => {
      logger.configure({ maxStoredLogs: 5 });

      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(5);
      // Most recent should be first
      expect(logs[0].message).toBe('Message 9');
    });

    it('should clear stored logs', () => {
      logger.info('Test message');
      expect(logger.getStoredLogs().length).toBe(1);

      logger.clearStoredLogs();
      expect(logger.getStoredLogs().length).toBe(0);
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with default context', () => {
      const childLogger = logger.child({ component: 'TestComponent' });

      childLogger.info('Child message', { extra: 'data' });

      const logs = logger.getStoredLogs();
      expect(logs[0].context).toEqual({
        component: 'TestComponent',
        extra: 'data',
      });
    });

    it('should allow overriding default context', () => {
      const childLogger = logger.child({ component: 'Original' });

      childLogger.info('Message', { component: 'Override' });

      const logs = logger.getStoredLogs();
      expect(logs[0].context?.component).toBe('Override');
    });
  });

  describe('Timestamp', () => {
    it('should include ISO timestamp', () => {
      logger.info('Test');
      const logs = logger.getStoredLogs();

      expect(logs[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
