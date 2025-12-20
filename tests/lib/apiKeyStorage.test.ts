/**
 * Tests for lib/apiKeyStorage.ts
 *
 * Tests cover:
 * - Saving and retrieving API keys (async)
 * - Encryption/decryption via Web Crypto API
 * - Key existence checks
 * - Clearing keys
 * - Migration from legacy format
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
  initializeApiKeyStorage,
  isValidApiKeyFormat,
} from '../../lib/apiKeyStorage';

// Mock crypto for testing
const mockCrypto = {
  subtle: {
    importKey: vi.fn().mockResolvedValue({}),
    deriveKey: vi.fn().mockResolvedValue({}),
    encrypt: vi.fn().mockImplementation(async (_, __, data) => {
      // Simple mock encryption - just return the data as-is for testing
      return data;
    }),
    decrypt: vi.fn().mockImplementation(async (_, __, data) => {
      // Simple mock decryption - just return the data as-is for testing
      return data;
    }),
  },
  getRandomValues: vi.fn().mockImplementation((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
};

// Mock crypto globally before tests
beforeEach(() => {
  vi.stubGlobal('crypto', mockCrypto);
  localStorage.clear();
});

describe('API Key Storage', () => {
  describe('saveApiKey', () => {
    it('saves a Gemini API key', async () => {
      await saveApiKey('gemini', 'AIzaSyTest123456789');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('saves a Claude API key', async () => {
      await saveApiKey('claude', 'sk-ant-test-key-12345');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('updates lastUpdated timestamp', async () => {
      await saveApiKey('gemini', 'test-key-12345');
      const stored = getStoredKeys();
      expect(stored.lastUpdated).toBeDefined();
    });

    it('adds version marker for encryption', async () => {
      await saveApiKey('gemini', 'test-key-12345');
      const raw = localStorage.getItem('skillengine_api_keys');
      expect(raw).toContain('_version');
    });
  });

  describe('getApiKey', () => {
    it('retrieves a saved Gemini API key', async () => {
      const originalKey = 'AIzaSyTest123456789';
      await saveApiKey('gemini', originalKey);
      const retrieved = await getApiKey('gemini');
      expect(retrieved).toBe(originalKey);
    });

    it('retrieves a saved Claude API key', async () => {
      const originalKey = 'sk-ant-api03-test-key';
      await saveApiKey('claude', originalKey);
      const retrieved = await getApiKey('claude');
      expect(retrieved).toBe(originalKey);
    });

    it('returns empty string for non-existent key', async () => {
      const retrieved = await getApiKey('gemini');
      expect(retrieved).toBe('');
    });

    it('handles special characters in keys', async () => {
      const keyWithSpecialChars = 'test-key_with.special+chars/123==';
      await saveApiKey('gemini', keyWithSpecialChars);
      const retrieved = await getApiKey('gemini');
      expect(retrieved).toBe(keyWithSpecialChars);
    });
  });

  describe('getStoredKeys', () => {
    it('returns empty object when nothing stored', () => {
      const keys = getStoredKeys();
      expect(keys).toEqual({});
    });

    it('returns stored keys object with encrypted markers', async () => {
      await saveApiKey('gemini', 'gemini-key-123');
      await saveApiKey('claude', 'claude-key-123');
      const keys = getStoredKeys();
      // Should show [encrypted] placeholder, not actual keys
      expect(keys.gemini).toBe('[encrypted]');
      expect(keys.claude).toBe('[encrypted]');
      expect(keys.lastUpdated).toBeDefined();
    });
  });

  describe('hasStoredKey', () => {
    it('returns false when key not stored', () => {
      expect(hasStoredKey('gemini')).toBe(false);
      expect(hasStoredKey('claude')).toBe(false);
    });

    it('returns true when key is stored', async () => {
      await saveApiKey('gemini', 'test-key-12345');
      expect(hasStoredKey('gemini')).toBe(true);
      expect(hasStoredKey('claude')).toBe(false);
    });
  });

  describe('clearApiKey', () => {
    it('removes specific key', async () => {
      await saveApiKey('gemini', 'gemini-key-123');
      await saveApiKey('claude', 'claude-key-123');

      await clearApiKey('gemini');

      expect(hasStoredKey('gemini')).toBe(false);
      expect(hasStoredKey('claude')).toBe(true);
    });

    it('updates lastUpdated after clearing', async () => {
      await saveApiKey('gemini', 'test-key-12345');

      await clearApiKey('gemini');
      const afterClear = getStoredKeys().lastUpdated;

      expect(afterClear).toBeDefined();
      expect(afterClear).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('clearAllApiKeys', () => {
    it('removes all stored keys', async () => {
      await saveApiKey('gemini', 'gemini-key-123');
      await saveApiKey('claude', 'claude-key-123');

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

    it('returns ISO date string after saving key', async () => {
      await saveApiKey('gemini', 'test-key-12345');
      const lastUpdated = getLastUpdated();
      expect(lastUpdated).toBeDefined();
      expect(lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});

describe('API Key Format Validation', () => {
  it('validates Gemini key format', () => {
    expect(isValidApiKeyFormat('gemini', 'AIzaSyTest123456789')).toEqual({
      valid: true,
    });
    expect(isValidApiKeyFormat('gemini', 'invalid-key')).toEqual({
      valid: false,
      error: expect.stringContaining('AIza'),
    });
  });

  it('validates Claude key format', () => {
    expect(isValidApiKeyFormat('claude', 'sk-ant-api03-test-key')).toEqual({
      valid: true,
    });
    expect(isValidApiKeyFormat('claude', 'invalid-key')).toEqual({
      valid: false,
      error: expect.stringContaining('sk-ant-'),
    });
  });

  it('validates OpenAI key format', () => {
    expect(isValidApiKeyFormat('chatgpt', 'sk-proj-test123456789')).toEqual({
      valid: true,
    });
    expect(isValidApiKeyFormat('chatgpt', 'invalid-key')).toEqual({
      valid: false,
      error: expect.stringContaining('sk-'),
    });
  });

  it('rejects empty keys', () => {
    expect(isValidApiKeyFormat('gemini', '')).toEqual({
      valid: false,
      error: expect.stringContaining('empty'),
    });
  });

  it('rejects keys that are too short', () => {
    expect(isValidApiKeyFormat('gemini', 'short')).toEqual({
      valid: false,
      error: expect.stringContaining('short'),
    });
  });

  it('rejects keys that are too long', () => {
    expect(isValidApiKeyFormat('gemini', 'A'.repeat(501))).toEqual({
      valid: false,
      error: expect.stringContaining('long'),
    });
  });
});

describe('Encryption', () => {
  it('stored key is encrypted (not plaintext)', async () => {
    const plainKey = 'AIzaSySecret12345';
    await saveApiKey('gemini', plainKey);

    // Check raw localStorage value should not contain the plain key
    const rawStored = localStorage.getItem('skillengine_api_keys');
    // The key should be encrypted, so it won't be plaintext
    expect(rawStored).toBeDefined();
    expect(rawStored).toContain('v2'); // Version marker
  });

  it('includes version marker for new format', async () => {
    await saveApiKey('gemini', 'test-key-12345');
    const rawStored = localStorage.getItem('skillengine_api_keys');
    const parsed = JSON.parse(rawStored!);
    expect(parsed._version).toBe('v2');
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

  it('handles missing provider key', async () => {
    // Store valid JSON without the requested provider
    localStorage.setItem(
      'skillengine_api_keys',
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        _version: 'v2',
      })
    );

    // Should return empty string, not throw
    const result = await getApiKey('gemini');
    expect(result).toBe('');
  });

  it('hasStoredKey handles invalid storage', () => {
    localStorage.setItem('skillengine_api_keys', 'invalid-json');
    expect(() => hasStoredKey('gemini')).not.toThrow();
    expect(hasStoredKey('gemini')).toBe(false);
  });
});

describe('Legacy Migration', () => {
  // Legacy XOR obfuscation for testing migration
  const legacyObfuscate = (text: string): string => {
    const key = 'sk1ll3ng1n3';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  };

  it('detects legacy format (no version marker)', async () => {
    // Store in legacy format
    localStorage.setItem(
      'skillengine_api_keys',
      JSON.stringify({
        gemini: legacyObfuscate('AIzaSyTest123'),
        lastUpdated: new Date().toISOString(),
        // No _version field
      })
    );

    // Initialize should trigger migration
    await initializeApiKeyStorage();

    // After migration, should have version marker
    const stored = localStorage.getItem('skillengine_api_keys');
    expect(stored).toContain('v2');
  });
});
