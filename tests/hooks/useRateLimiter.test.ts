/**
 * useRateLimiter Hook Tests
 *
 * Tests the client-side rate limiting hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimiter, useAIRateLimiter, useSkillRateLimiter } from '../../hooks/useRateLimiter';

describe('useRateLimiter Hook', () => {
  describe('Initial State', () => {
    it('should start with correct initial state', () => {
      const { result } = renderHook(() => useRateLimiter({ cooldownMs: 1000 }));

      expect(result.current.isLimited).toBe(false);
      expect(result.current.cooldownRemaining).toBe(0);
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.activeCount).toBe(0);
      expect(result.current.isExecuting).toBe(false);
    });

    it('should provide execute and reset functions', () => {
      const { result } = renderHook(() => useRateLimiter());

      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('Basic Execution', () => {
    it('should execute a function and return result', async () => {
      const { result } = renderHook(() => useRateLimiter<string>({ cooldownMs: 100 }));

      let returnValue: string | null = null;
      await act(async () => {
        returnValue = await result.current.execute(async () => 'test-result');
      });

      expect(returnValue).toBe('test-result');
    });

    it('should execute with complex return types', async () => {
      const { result } = renderHook(() =>
        useRateLimiter<{ id: number; name: string }>({ cooldownMs: 100 })
      );

      let returnValue: { id: number; name: string } | null = null;
      await act(async () => {
        returnValue = await result.current.execute(async () => ({
          id: 1,
          name: 'test',
        }));
      });

      expect(returnValue).toEqual({ id: 1, name: 'test' });
    });

    it('should handle async functions that throw', async () => {
      const { result } = renderHook(() => useRateLimiter({ cooldownMs: 100 }));

      await act(async () => {
        try {
          await result.current.execute(async () => {
            throw new Error('Test error');
          });
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect((e as Error).message).toBe('Test error');
        }
      });
    });
  });

  describe('Queue Management', () => {
    it('should reject when queue is full', async () => {
      const { result } = renderHook(() =>
        useRateLimiter({
          maxConcurrent: 1,
          maxQueueSize: 0, // No queue allowed
          cooldownMs: 5000,
        })
      );

      // Start a long-running execution
      let firstStarted = false;
      act(() => {
        result.current.execute(async () => {
          firstStarted = true;
          await new Promise((resolve) => setTimeout(resolve, 10000));
          return 'first';
        });
      });

      // Wait a tick for the execution to start
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Second request should be rejected (queue size is 0)
      let secondResult: unknown = 'not-null';
      await act(async () => {
        secondResult = await result.current.execute(async () => 'second');
      });

      expect(secondResult).toBeNull();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset state correctly', async () => {
      const { result } = renderHook(() => useRateLimiter({ cooldownMs: 5000 }));

      // Execute something
      await act(async () => {
        await result.current.execute(async () => 'done');
      });

      // Should be in cooldown
      expect(result.current.isLimited).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      // Should be reset
      expect(result.current.isLimited).toBe(false);
      expect(result.current.cooldownRemaining).toBe(0);
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.activeCount).toBe(0);
    });
  });

  describe('Cooldown Behavior', () => {
    it('should be limited after execution', async () => {
      const { result } = renderHook(() => useRateLimiter({ cooldownMs: 5000 }));

      expect(result.current.isLimited).toBe(false);

      await act(async () => {
        await result.current.execute(async () => 'done');
      });

      expect(result.current.isLimited).toBe(true);
      expect(result.current.cooldownRemaining).toBeGreaterThan(0);
    });
  });
});

describe('Specialized Rate Limiters', () => {
  describe('useAIRateLimiter', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAIRateLimiter());

      expect(result.current.isLimited).toBe(false);
      expect(result.current.pendingCount).toBe(0);
      expect(typeof result.current.execute).toBe('function');
    });

    it('should execute and return result', async () => {
      const { result } = renderHook(() => useAIRateLimiter<string>());

      let value: string | null = null;
      await act(async () => {
        value = await result.current.execute(async () => 'ai-result');
      });

      expect(value).toBe('ai-result');
    });
  });

  describe('useSkillRateLimiter', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSkillRateLimiter());

      expect(result.current.isLimited).toBe(false);
      expect(typeof result.current.execute).toBe('function');
    });

    it('should execute and return result', async () => {
      const { result } = renderHook(() => useSkillRateLimiter<number>());

      let value: number | null = null;
      await act(async () => {
        value = await result.current.execute(async () => 42);
      });

      expect(value).toBe(42);
    });
  });
});
