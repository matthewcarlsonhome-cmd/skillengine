/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',

    // Setup files run before each test file
    setupFiles: ['./tests/setup.ts'],

    // Global test utilities (describe, it, expect, etc.)
    globals: true,

    // Include patterns for test files
    include: ['tests/**/*.test.{ts,tsx}', 'lib/**/*.test.ts', 'pages/**/*.test.tsx'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts', 'pages/**/*.tsx', 'hooks/**/*.tsx', 'components/**/*.tsx'],
      exclude: [
        'lib/database.types.ts',
        'lib/roleTemplates.ts', // Large static data file
        '**/*.d.ts',
      ],
    },

    // Timeout for tests (ms)
    testTimeout: 10000,

    // Reporter configuration
    reporters: ['verbose'],
  },
});
