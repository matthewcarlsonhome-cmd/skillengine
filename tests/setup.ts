/**
 * Vitest Test Setup
 *
 * This file runs before each test file. It sets up:
 * - DOM matchers (@testing-library/jest-dom)
 * - localStorage mock
 * - Global test utilities
 */

import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// LOCALSTORAGE MOCK
// ═══════════════════════════════════════════════════════════════════════════

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ═══════════════════════════════════════════════════════════════════════════
// CRYPTO.RANDOMUUID MOCK
// ═══════════════════════════════════════════════════════════════════════════

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => `test-uuid-${Math.random().toString(36).substr(2, 9)}`),
  },
  writable: true,
});

// ═══════════════════════════════════════════════════════════════════════════
// CLEANUP BETWEEN TESTS
// ═══════════════════════════════════════════════════════════════════════════

beforeEach(() => {
  // Clear localStorage before each test
  localStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up any DOM modifications
  document.body.innerHTML = '';
});

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL TEST HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Helper to set up localStorage with initial data
 */
export function setLocalStorage(key: string, value: unknown): void {
  localStorageMock.setItem(key, JSON.stringify(value));
}

/**
 * Helper to get parsed localStorage data
 */
export function getLocalStorage<T>(key: string): T | null {
  const item = localStorageMock.getItem(key);
  return item ? JSON.parse(item) : null;
}

/**
 * Helper to clear all localStorage mocks
 */
export function clearLocalStorage(): void {
  localStorageMock.clear();
}
