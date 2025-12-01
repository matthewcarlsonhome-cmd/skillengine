// API Key Storage - Securely store and retrieve API keys from localStorage
// Keys are stored with basic obfuscation (not true encryption, but prevents casual viewing)

const STORAGE_KEY = 'skillengine_api_keys';
const OBFUSCATION_KEY = 'sk1ll3ng1n3'; // Simple XOR key for obfuscation

interface StoredKeys {
  gemini?: string;
  claude?: string;
  lastUpdated?: string;
}

// Simple XOR obfuscation (not cryptographically secure, but prevents casual viewing)
function obfuscate(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
    );
  }
  return btoa(result); // Base64 encode
}

function deobfuscate(encoded: string): string {
  try {
    const decoded = atob(encoded); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

export function saveApiKey(provider: 'gemini' | 'claude', key: string): void {
  try {
    const existing = getStoredKeys();
    const updated: StoredKeys = {
      ...existing,
      [provider]: obfuscate(key),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
}

export function getApiKey(provider: 'gemini' | 'claude'): string {
  try {
    const stored = getStoredKeys();
    const obfuscatedKey = stored[provider];
    if (obfuscatedKey) {
      return deobfuscate(obfuscatedKey);
    }
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
  }
  return '';
}

export function getStoredKeys(): StoredKeys {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse stored keys:', error);
  }
  return {};
}

export function hasStoredKey(provider: 'gemini' | 'claude'): boolean {
  const stored = getStoredKeys();
  return !!stored[provider];
}

export function clearApiKey(provider: 'gemini' | 'claude'): void {
  try {
    const existing = getStoredKeys();
    delete existing[provider];
    existing.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to clear API key:', error);
  }
}

export function clearAllApiKeys(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear all API keys:', error);
  }
}

export function getLastUpdated(): string | null {
  const stored = getStoredKeys();
  return stored.lastUpdated || null;
}
