/**
 * localStorage Utility - Centralized localStorage management
 *
 * Features:
 * - Type-safe get/set operations with generics
 * - Automatic JSON serialization/deserialization
 * - Consistent key prefixing
 * - Error handling with fallbacks
 * - Storage quota checking
 * - Event-based storage change notifications
 *
 * Usage:
 *   import { storage } from './lib/storage/localStorage';
 *
 *   // Set a value
 *   storage.set('theme', 'dark');
 *
 *   // Get a value with type safety
 *   const theme = storage.get<'light' | 'dark'>('theme', 'light');
 *
 *   // Remove a value
 *   storage.remove('theme');
 */

import { logger } from '../logger';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Prefix for all SkillEngine localStorage keys */
const STORAGE_PREFIX = 'skillengine_';

/** Known storage keys - helps with autocomplete and prevents typos */
export const STORAGE_KEYS = {
  // Authentication & User
  API_KEYS: 'api_keys',
  APP_USER: 'app_user',
  PROFILE: 'profile',

  // Preferences
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  PREFERRED_PROVIDER: 'preferred_provider',
  COMMAND_PALETTE_RECENT: 'command_palette_recent',

  // Feature State
  FIRST_SKILL_CELEBRATED: 'first_skill_celebrated',
  WELCOME_COMPLETED: 'welcome_completed',
  ONBOARDING_STEP: 'onboarding_step',

  // Job Search Tools
  JOBS: 'jobs',
  INTERVIEW_BANK: 'interview_bank',
  COMPANY_NOTES: 'company_notes',
  FOLLOW_UPS: 'follow_ups',
  AUTOFILL_VAULT: 'autofill_vault',
  REFERRAL_NETWORK: 'referral_network',
  DAILY_PLANNER: 'daily_planner',

  // Debug & Logs
  ERRORS: 'errors',
  LOGS: 'logs',

  // Achievements & Progress
  ACHIEVEMENTS: 'achievements',
  SKILL_USAGE: 'skill_usage',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface StorageOptions {
  /** Whether to use the prefix (default: true) */
  usePrefix?: boolean;
  /** Maximum age in milliseconds (for TTL-based expiry) */
  maxAge?: number;
}

interface StoredValue<T> {
  value: T;
  timestamp: number;
  version?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the full key with prefix
 */
function getFullKey(key: string, usePrefix = true): string {
  return usePrefix ? `${STORAGE_PREFIX}${key}` : key;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get approximate localStorage usage in bytes
 */
function getStorageUsage(): { used: number; total: number; percentage: number } {
  let used = 0;
  try {
    for (const key of Object.keys(localStorage)) {
      const value = localStorage.getItem(key);
      if (value) {
        used += key.length + value.length;
      }
    }
  } catch {
    // Ignore errors
  }
  // Most browsers have ~5MB limit
  const total = 5 * 1024 * 1024;
  return {
    used,
    total,
    percentage: Math.round((used / total) * 100),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN STORAGE UTILITY
// ═══════════════════════════════════════════════════════════════════════════

export const storage = {
  /**
   * Check if localStorage is available
   */
  isAvailable: isLocalStorageAvailable,

  /**
   * Get a value from localStorage
   * @param key - The storage key
   * @param defaultValue - Default value if key doesn't exist
   * @param options - Storage options
   */
  get<T>(key: string, defaultValue: T, options: StorageOptions = {}): T {
    const { usePrefix = true, maxAge } = options;

    if (!isLocalStorageAvailable()) {
      return defaultValue;
    }

    try {
      const fullKey = getFullKey(key, usePrefix);
      const raw = localStorage.getItem(fullKey);

      if (raw === null) {
        return defaultValue;
      }

      // Try to parse as JSON with metadata
      try {
        const parsed = JSON.parse(raw) as StoredValue<T> | T;

        // Check if it's a wrapped value with timestamp
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'value' in parsed &&
          'timestamp' in parsed
        ) {
          const storedValue = parsed as StoredValue<T>;

          // Check TTL if maxAge is specified
          if (maxAge && Date.now() - storedValue.timestamp > maxAge) {
            // Value has expired, remove it
            localStorage.removeItem(fullKey);
            return defaultValue;
          }

          return storedValue.value;
        }

        // It's a plain value
        return parsed as T;
      } catch {
        // Not JSON, return as string (for backward compatibility)
        return raw as unknown as T;
      }
    } catch (error) {
      logger.warn('Failed to get localStorage value', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return defaultValue;
    }
  },

  /**
   * Set a value in localStorage
   * @param key - The storage key
   * @param value - The value to store
   * @param options - Storage options
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    const { usePrefix = true, maxAge } = options;

    if (!isLocalStorageAvailable()) {
      return false;
    }

    try {
      const fullKey = getFullKey(key, usePrefix);

      // Wrap with metadata if TTL is specified
      const toStore = maxAge
        ? JSON.stringify({ value, timestamp: Date.now() } as StoredValue<T>)
        : JSON.stringify(value);

      localStorage.setItem(fullKey, toStore);
      return true;
    } catch (error) {
      // Check if it's a quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        logger.error('localStorage quota exceeded', {
          key,
          usage: getStorageUsage(),
        });
      } else {
        logger.warn('Failed to set localStorage value', {
          key,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return false;
    }
  },

  /**
   * Remove a value from localStorage
   * @param key - The storage key
   * @param options - Storage options
   */
  remove(key: string, options: StorageOptions = {}): boolean {
    const { usePrefix = true } = options;

    if (!isLocalStorageAvailable()) {
      return false;
    }

    try {
      const fullKey = getFullKey(key, usePrefix);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      logger.warn('Failed to remove localStorage value', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  },

  /**
   * Check if a key exists in localStorage
   * @param key - The storage key
   * @param options - Storage options
   */
  has(key: string, options: StorageOptions = {}): boolean {
    const { usePrefix = true } = options;

    if (!isLocalStorageAvailable()) {
      return false;
    }

    try {
      const fullKey = getFullKey(key, usePrefix);
      return localStorage.getItem(fullKey) !== null;
    } catch {
      return false;
    }
  },

  /**
   * Get all SkillEngine keys from localStorage
   */
  getKeys(): string[] {
    if (!isLocalStorageAvailable()) {
      return [];
    }

    try {
      return Object.keys(localStorage).filter((key) =>
        key.startsWith(STORAGE_PREFIX)
      );
    } catch {
      return [];
    }
  },

  /**
   * Clear all SkillEngine data from localStorage
   */
  clearAll(): boolean {
    if (!isLocalStorageAvailable()) {
      return false;
    }

    try {
      const keys = this.getKeys();
      keys.forEach((key) => localStorage.removeItem(key));
      logger.info('Cleared all SkillEngine localStorage data', {
        clearedKeys: keys.length,
      });
      return true;
    } catch (error) {
      logger.error('Failed to clear localStorage', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  },

  /**
   * Get storage usage information
   */
  getUsage: getStorageUsage,

  /**
   * Update a stored value using a callback
   * Useful for incrementing counters or modifying arrays
   * @param key - The storage key
   * @param updater - Function to update the value
   * @param defaultValue - Default value if key doesn't exist
   * @param options - Storage options
   */
  update<T>(
    key: string,
    updater: (current: T) => T,
    defaultValue: T,
    options: StorageOptions = {}
  ): boolean {
    const current = this.get<T>(key, defaultValue, options);
    const updated = updater(current);
    return this.set(key, updated, options);
  },

  /**
   * Append to an array stored in localStorage
   * @param key - The storage key
   * @param item - Item to append
   * @param maxItems - Maximum items to keep (removes oldest)
   * @param options - Storage options
   */
  appendToArray<T>(
    key: string,
    item: T,
    maxItems = 100,
    options: StorageOptions = {}
  ): boolean {
    return this.update<T[]>(
      key,
      (current) => {
        const updated = [...current, item];
        // Keep only the most recent items
        return updated.slice(-maxItems);
      },
      [],
      options
    );
  },

  /**
   * Prepend to an array stored in localStorage
   * @param key - The storage key
   * @param item - Item to prepend
   * @param maxItems - Maximum items to keep (removes oldest)
   * @param options - Storage options
   */
  prependToArray<T>(
    key: string,
    item: T,
    maxItems = 100,
    options: StorageOptions = {}
  ): boolean {
    return this.update<T[]>(
      key,
      (current) => {
        const updated = [item, ...current];
        // Keep only the most recent items
        return updated.slice(0, maxItems);
      },
      [],
      options
    );
  },
};

export default storage;
