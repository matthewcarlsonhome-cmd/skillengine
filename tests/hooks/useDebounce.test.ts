/**
 * useDebounce Hook Unit Tests
 *
 * Tests for the debounce hook functionality including:
 * - useDebounce (value debouncing)
 * - useDebouncedCallback (callback debouncing)
 * - useDebouncedSearch (search input integration)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useDebounce,
  useDebouncedCallback,
  useDebouncedSearch,
} from '../../hooks/useDebounce';

// ═══════════════════════════════════════════════════════════════════════════
// TEST SETUP
// ═══════════════════════════════════════════════════════════════════════════

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ═══════════════════════════════════════════════════════════════════════════
// useDebounce TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('useDebounce', () => {
  describe('initial value', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 100));
      expect(result.current).toBe('initial');
    });

    it('works with numbers', () => {
      const { result } = renderHook(() => useDebounce(42, 100));
      expect(result.current).toBe(42);
    });

    it('works with objects', () => {
      const obj = { foo: 'bar' };
      const { result } = renderHook(() => useDebounce(obj, 100));
      expect(result.current).toEqual(obj);
    });

    it('works with arrays', () => {
      const arr = [1, 2, 3];
      const { result } = renderHook(() => useDebounce(arr, 100));
      expect(result.current).toEqual(arr);
    });

    it('works with null', () => {
      const { result } = renderHook(() => useDebounce(null, 100));
      expect(result.current).toBeNull();
    });

    it('works with undefined', () => {
      const { result } = renderHook(() => useDebounce(undefined, 100));
      expect(result.current).toBeUndefined();
    });
  });

  describe('debouncing behavior', () => {
    it('does not update value before delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // Value should still be initial
      expect(result.current).toBe('initial');
    });

    it('updates value after delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe('updated');
    });

    it('cancels pending update when value changes again', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'initial' } }
      );

      // First update
      rerender({ value: 'first update' });
      act(() => {
        vi.advanceTimersByTime(50); // Half the delay
      });

      // Second update before first completes
      rerender({ value: 'second update' });
      act(() => {
        vi.advanceTimersByTime(50); // Still within first delay
      });

      // First update should have been cancelled, still showing initial
      expect(result.current).toBe('initial');

      // Complete the second delay
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Now should show second update
      expect(result.current).toBe('second update');
    });

    it('handles rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'a' } }
      );

      // Rapid changes
      rerender({ value: 'ab' });
      act(() => vi.advanceTimersByTime(20));

      rerender({ value: 'abc' });
      act(() => vi.advanceTimersByTime(20));

      rerender({ value: 'abcd' });
      act(() => vi.advanceTimersByTime(20));

      rerender({ value: 'abcde' });

      // Still showing initial
      expect(result.current).toBe('a');

      // Complete delay
      act(() => vi.advanceTimersByTime(100));

      // Should show final value
      expect(result.current).toBe('abcde');
    });
  });

  describe('delay parameter', () => {
    it('uses default delay of 150ms', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => vi.advanceTimersByTime(149));
      expect(result.current).toBe('initial');

      act(() => vi.advanceTimersByTime(1));
      expect(result.current).toBe('updated');
    });

    it('respects custom delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => vi.advanceTimersByTime(499));
      expect(result.current).toBe('initial');

      act(() => vi.advanceTimersByTime(1));
      expect(result.current).toBe('updated');
    });

    it('handles zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => vi.advanceTimersByTime(0));
      expect(result.current).toBe('updated');
    });
  });

  describe('cleanup', () => {
    it('clears timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// useDebouncedCallback TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('useDebouncedCallback', () => {
  describe('basic functionality', () => {
    it('calls callback after delay', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 100));

      act(() => {
        result.current();
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to callback', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 100)
      );

      act(() => {
        result.current('arg1', 'arg2', 123);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('cancels previous call when called again', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 100));

      act(() => {
        result.current('first');
      });

      act(() => {
        vi.advanceTimersByTime(50);
      });

      act(() => {
        result.current('second');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });
  });

  describe('rapid calls', () => {
    it('only calls once for rapid invocations', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 100));

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current(i);
        }
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(9); // Last value
    });
  });

  describe('callback updates', () => {
    it('uses latest callback reference', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ cb }) => useDebouncedCallback(cb, 100),
        { initialProps: { cb: callback1 } }
      );

      act(() => {
        result.current();
      });

      // Update callback before delay completes
      rerender({ cb: callback2 });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should call the updated callback
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('clears timeout on unmount', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, 100)
      );

      act(() => {
        result.current();
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('delay parameter', () => {
    it('uses default delay of 150ms', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback));

      act(() => {
        result.current();
      });

      act(() => {
        vi.advanceTimersByTime(149);
      });
      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// useDebouncedSearch TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('useDebouncedSearch', () => {
  describe('initial state', () => {
    it('initializes with empty string by default', () => {
      const { result } = renderHook(() => useDebouncedSearch());

      expect(result.current.inputValue).toBe('');
      expect(result.current.debouncedValue).toBe('');
    });

    it('initializes with provided value', () => {
      const { result } = renderHook(() => useDebouncedSearch('initial'));

      expect(result.current.inputValue).toBe('initial');
      expect(result.current.debouncedValue).toBe('initial');
    });
  });

  describe('setInputValue', () => {
    it('updates input value immediately', () => {
      const { result } = renderHook(() => useDebouncedSearch());

      act(() => {
        result.current.setInputValue('new value');
      });

      expect(result.current.inputValue).toBe('new value');
    });

    it('debounces the search value', () => {
      const { result } = renderHook(() => useDebouncedSearch('', 100));

      act(() => {
        result.current.setInputValue('search term');
      });

      expect(result.current.inputValue).toBe('search term');
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.debouncedValue).toBe('search term');
    });
  });

  describe('handleChange', () => {
    it('handles input change events', () => {
      const { result } = renderHook(() => useDebouncedSearch());

      const event = {
        target: { value: 'typed value' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.inputValue).toBe('typed value');
    });

    it('debounces change events', () => {
      const { result } = renderHook(() => useDebouncedSearch('', 100));

      const event = {
        target: { value: 'search' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.debouncedValue).toBe('search');
    });
  });

  describe('clear', () => {
    it('clears the input value', () => {
      const { result } = renderHook(() => useDebouncedSearch('initial'));

      act(() => {
        result.current.clear();
      });

      expect(result.current.inputValue).toBe('');
    });

    it('eventually clears debounced value', () => {
      const { result } = renderHook(() => useDebouncedSearch('initial', 100));

      act(() => {
        result.current.clear();
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.debouncedValue).toBe('');
    });
  });

  describe('returned object stability', () => {
    it('handleChange is stable across renders', () => {
      const { result, rerender } = renderHook(() => useDebouncedSearch());

      const handleChange1 = result.current.handleChange;
      rerender();
      const handleChange2 = result.current.handleChange;

      expect(handleChange1).toBe(handleChange2);
    });

    it('clear is stable across renders', () => {
      const { result, rerender } = renderHook(() => useDebouncedSearch());

      const clear1 = result.current.clear;
      rerender();
      const clear2 = result.current.clear;

      expect(clear1).toBe(clear2);
    });
  });

  describe('custom delay', () => {
    it('uses default delay of 150ms', () => {
      const { result } = renderHook(() => useDebouncedSearch());

      act(() => {
        result.current.setInputValue('test');
      });

      act(() => {
        vi.advanceTimersByTime(149);
      });
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.debouncedValue).toBe('test');
    });

    it('respects custom delay', () => {
      const { result } = renderHook(() => useDebouncedSearch('', 500));

      act(() => {
        result.current.setInputValue('test');
      });

      act(() => {
        vi.advanceTimersByTime(499);
      });
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.debouncedValue).toBe('test');
    });
  });

  describe('real-world search scenario', () => {
    it('handles typical typing pattern', () => {
      const { result } = renderHook(() => useDebouncedSearch('', 100));

      // User types "react hooks"
      const events = ['r', 're', 'rea', 'reac', 'react', 'react ', 'react h', 'react ho', 'react hoo', 'react hook', 'react hooks'];

      for (let i = 0; i < events.length; i++) {
        act(() => {
          result.current.setInputValue(events[i]);
        });
        act(() => {
          vi.advanceTimersByTime(50); // 50ms between keystrokes
        });
      }

      // Input value shows latest
      expect(result.current.inputValue).toBe('react hooks');
      // Debounced still waiting
      expect(result.current.debouncedValue).toBe('');

      // Complete the debounce
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Now debounced value updates
      expect(result.current.debouncedValue).toBe('react hooks');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Debounce Integration', () => {
  it('useDebounce and useDebouncedSearch have consistent behavior', () => {
    const delay = 100;
    const { result: result1 } = renderHook(
      ({ value }) => useDebounce(value, delay),
      { initialProps: { value: '' } }
    );
    const { result: result2 } = renderHook(() =>
      useDebouncedSearch('', delay)
    );

    // Update both
    const { rerender } = renderHook(
      ({ value }) => useDebounce(value, delay),
      { initialProps: { value: '' } }
    );

    rerender({ value: 'test' });
    act(() => {
      result2.current.setInputValue('test');
    });

    // Both should be pending
    expect(result2.current.debouncedValue).toBe('');

    // Complete delay
    act(() => {
      vi.advanceTimersByTime(delay);
    });

    // Both should be updated
    expect(result2.current.debouncedValue).toBe('test');
  });
});
