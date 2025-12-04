/**
 * Tests for lib/apiKeyStorage.ts
 *
 * Tests cover:
 * - Saving and retrieving API keys
 * - Obfuscation/deobfuscation
 * - Key existence checks
 * - Clearing keys
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveApiKey,
  getApiKey,
  getStoredKeys,
  hasStoredKey,
  clearApiKey,
  clearAllApiKeys,
  getLastUpdated,
} from '../../lib/apiKeyStorage';

// Mock btoa/atob for Node.js environment
beforeEach(() => {
  // btoa and atob are available in jsdom, but we ensure they work
  if (typeof global.btoa === 'undefined') {
    global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
    global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
  }
});

describe('API Key Storage', () => {
  describe('saveApiKey', () => {
    it('saves a Gemini API key', () => {
      saveApiKey('gemini', 'test-gemini-key-12345');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('saves a Claude API key', () => {
      saveApiKey('claude', 'sk-ant-test-key-12345');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('updates lastUpdated timestamp', () => {
      saveApiKey('gemini', 'test-key');
      const stored = getStoredKeys();
      expect(stored.lastUpdated).toBeDefined();
    });
  });

  describe('getApiKey', () => {
    it('retrieves a saved Gemini API key', () => {
      const originalKey = 'AIzaSyTest123456789';
      saveApiKey('gemini', originalKey);
      const retrieved = getApiKey('gemini');
      expect(retrieved).toBe(originalKey);
    });

    it('retrieves a saved Claude API key', () => {
      const originalKey = 'sk-ant-api03-test-key';
      saveApiKey('claude', originalKey);
      const retrieved = getApiKey('claude');
      expect(retrieved).toBe(originalKey);
    });

    it('returns empty string for non-existent key', () => {
      const retrieved = getApiKey('gemini');
      expect(retrieved).toBe('');
    });

    it('handles special characters in keys', () => {
      const keyWithSpecialChars = 'test-key_with.special+chars/123==';
      saveApiKey('gemini', keyWithSpecialChars);
      const retrieved = getApiKey('gemini');
      expect(retrieved).toBe(keyWithSpecialChars);
    });
  });

  describe('getStoredKeys', () => {
    it('returns empty object when nothing stored', () => {
      const keys = getStoredKeys();
      expect(keys).toEqual({});
    });

    it('returns stored keys object', () => {
      saveApiKey('gemini', 'gemini-key');
      saveApiKey('claude', 'claude-key');
      const keys = getStoredKeys();
      expect(keys.gemini).toBeDefined();
      expect(keys.claude).toBeDefined();
      expect(keys.lastUpdated).toBeDefined();
    });
  });

  describe('hasStoredKey', () => {
    it('returns false when key not stored', () => {
      expect(hasStoredKey('gemini')).toBe(false);
      expect(hasStoredKey('claude')).toBe(false);
    });

    it('returns true when key is stored', () => {
      saveApiKey('gemini', 'test-key');
      expect(hasStoredKey('gemini')).toBe(true);
      expect(hasStoredKey('claude')).toBe(false);
    });
  });

  describe('clearApiKey', () => {
    it('removes specific key', () => {
      saveApiKey('gemini', 'gemini-key');
      saveApiKey('claude', 'claude-key');

      clearApiKey('gemini');

      expect(hasStoredKey('gemini')).toBe(false);
      expect(hasStoredKey('claude')).toBe(true);
    });

    it('updates lastUpdated after clearing', () => {
      saveApiKey('gemini', 'test-key');

      clearApiKey('gemini');
      const afterClear = getStoredKeys().lastUpdated;

      // lastUpdated should still be defined after clearing
      expect(afterClear).toBeDefined();
      expect(afterClear).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('clearAllApiKeys', () => {
    it('removes all stored keys', () => {
      saveApiKey('gemini', 'gemini-key');
      saveApiKey('claude', 'claude-key');

      clearAllApiKeys();

      expect(hasStoredKey('gemini')).toBe(false);
      expect(hasStoredKey('claude')).toBe(false);
      expect(getStoredKeys()).toEqual({});
    });
  });

  describe('getLastUpdated', () => {
    it('returns null when no keys stored', () => {
      expect(getLastUpdated()).toBeNull();
    });

    it('returns ISO date string after saving key', () => {
      saveApiKey('gemini', 'test-key');
      const lastUpdated = getLastUpdated();
      expect(lastUpdated).toBeDefined();
      expect(lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});

describe('Obfuscation', () => {
  it('stored key is not plaintext', () => {
    const plainKey = 'my-secret-api-key-12345';
    saveApiKey('gemini', plainKey);

    // Check raw localStorage value
    const rawStored = localStorage.getItem('skillengine_api_keys');
    expect(rawStored).not.toContain(plainKey);
  });

  it('different keys produce different obfuscated values', () => {
    saveApiKey('gemini', 'key-one');
    const stored1 = getStoredKeys().gemini;

    clearAllApiKeys();

    saveApiKey('gemini', 'key-two');
    const stored2 = getStoredKeys().gemini;

    expect(stored1).not.toBe(stored2);
  });

  it('round-trip preserves key exactly', () => {
    const testKeys = [
      'simple-key',
      'key-with-numbers-12345',
      'KEY_WITH_UNDERSCORE',
      'key.with.dots',
      'key/with/slashes',
      'key+with+plus',
      'key=with=equals==',
      'very-long-key-' + 'a'.repeat(100),
    ];

    for (const key of testKeys) {
      clearAllApiKeys();
      saveApiKey('gemini', key);
      const retrieved = getApiKey('gemini');
      expect(retrieved).toBe(key);
    }
  });
});

describe('Error Handling', () => {
  it('handles corrupted localStorage gracefully', () => {
    // Directly set invalid JSON
    localStorage.setItem('skillengine_api_keys', 'not-valid-json');

    // Should not throw
    expect(() => getStoredKeys()).not.toThrow();
    expect(getStoredKeys()).toEqual({});
  });

  it('handles invalid base64 in stored key', () => {
    // Store valid JSON with invalid obfuscated key
    localStorage.setItem('skillengine_api_keys', JSON.stringify({
      gemini: 'not-valid-base64!!!',
      lastUpdated: new Date().toISOString(),
    }));

    // Should return empty string, not throw
    expect(() => getApiKey('gemini')).not.toThrow();
    expect(getApiKey('gemini')).toBe('');
  });
});
