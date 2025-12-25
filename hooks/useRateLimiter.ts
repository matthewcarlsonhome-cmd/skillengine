/**
 * useRateLimiter Hook
 *
 * Client-side rate limiting for expensive operations like AI API calls.
 * Prevents users from accidentally triggering multiple calls by spam-clicking.
 *
 * Features:
 * - Configurable cooldown period between calls
 * - Maximum concurrent requests
 * - Request queue with timeout
 * - Automatic retry with exponential backoff
 *
 * Usage:
 *   const { execute, isLimited, cooldownRemaining, pendingCount } = useRateLimiter({
 *     maxConcurrent: 1,
 *     cooldownMs: 2000,
 *   });
 *
 *   const handleSubmit = () => {
 *     execute(async () => {
 *       await callAI(prompt);
 *     });
 *   };
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RateLimiterConfig {
  /** Maximum concurrent requests (default: 1) */
  maxConcurrent?: number;
  /** Cooldown period in ms after each request (default: 1000) */
  cooldownMs?: number;
  /** Maximum queue size (default: 3) */
  maxQueueSize?: number;
  /** Request timeout in ms (default: 60000) */
  timeoutMs?: number;
  /** Enable automatic retry on failure (default: false) */
  enableRetry?: boolean;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms (default: 1000) */
  retryBaseDelayMs?: number;
}

export interface RateLimiterState {
  /** Whether rate limit is currently active */
  isLimited: boolean;
  /** Time remaining on cooldown in ms */
  cooldownRemaining: number;
  /** Number of pending requests in queue */
  pendingCount: number;
  /** Number of currently executing requests */
  activeCount: number;
  /** Whether currently executing a request */
  isExecuting: boolean;
}

export interface RateLimiterResult<T> extends RateLimiterState {
  /** Execute a rate-limited function */
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  /** Reset the rate limiter state */
  reset: () => void;
}

interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T | null) => void;
  reject: (error: Error) => void;
  retryCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: Required<RateLimiterConfig> = {
  maxConcurrent: 1,
  cooldownMs: 1000,
  maxQueueSize: 3,
  timeoutMs: 60000,
  enableRetry: false,
  maxRetries: 3,
  retryBaseDelayMs: 1000,
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export function useRateLimiter<T = unknown>(
  config: RateLimiterConfig = {}
): RateLimiterResult<T> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // State
  const [isLimited, setIsLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  // Refs for mutable state
  const queueRef = useRef<QueuedRequest<T>[]>([]);
  const activeCountRef = useRef(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastExecutionRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  /**
   * Process the next item in the queue
   */
  const processQueue = useCallback(async () => {
    // Check if we can process more requests
    if (activeCountRef.current >= mergedConfig.maxConcurrent) return;
    if (queueRef.current.length === 0) return;

    // Check cooldown
    const timeSinceLastExecution = Date.now() - lastExecutionRef.current;
    if (timeSinceLastExecution < mergedConfig.cooldownMs && lastExecutionRef.current > 0) {
      const remainingCooldown = mergedConfig.cooldownMs - timeSinceLastExecution;
      setIsLimited(true);
      setCooldownRemaining(remainingCooldown);

      // Schedule processing after cooldown
      if (!cooldownTimerRef.current) {
        cooldownTimerRef.current = setTimeout(() => {
          cooldownTimerRef.current = null;
          setIsLimited(false);
          setCooldownRemaining(0);
          processQueue();
        }, remainingCooldown);

        // Update cooldown remaining periodically
        cooldownIntervalRef.current = setInterval(() => {
          const remaining = Math.max(
            0,
            mergedConfig.cooldownMs - (Date.now() - lastExecutionRef.current)
          );
          setCooldownRemaining(remaining);
          if (remaining <= 0 && cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
          }
        }, 100);
      }
      return;
    }

    // Get next request from queue
    const request = queueRef.current.shift();
    if (!request) return;

    activeCountRef.current++;
    setActiveCount(activeCountRef.current);
    setPendingCount(queueRef.current.length);

    try {
      // Execute with timeout
      const result = await Promise.race([
        request.fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), mergedConfig.timeoutMs)
        ),
      ]);

      lastExecutionRef.current = Date.now();
      request.resolve(result);
    } catch (error) {
      // Handle retry
      if (
        mergedConfig.enableRetry &&
        request.retryCount < mergedConfig.maxRetries &&
        error instanceof Error &&
        error.message !== 'Request timeout'
      ) {
        // Exponential backoff
        const delay = mergedConfig.retryBaseDelayMs * Math.pow(2, request.retryCount);
        request.retryCount++;

        setTimeout(() => {
          queueRef.current.unshift(request);
          setPendingCount(queueRef.current.length);
          processQueue();
        }, delay);
      } else {
        request.reject(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      activeCountRef.current--;
      setActiveCount(activeCountRef.current);
      lastExecutionRef.current = Date.now();

      // Start cooldown
      setIsLimited(true);
      setCooldownRemaining(mergedConfig.cooldownMs);

      // Process next after cooldown
      cooldownTimerRef.current = setTimeout(() => {
        cooldownTimerRef.current = null;
        setIsLimited(false);
        setCooldownRemaining(0);
        processQueue();
      }, mergedConfig.cooldownMs);
    }
  }, [mergedConfig]);

  /**
   * Execute a rate-limited function
   */
  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      // Check queue size limit
      if (queueRef.current.length >= mergedConfig.maxQueueSize) {
        return null;
      }

      return new Promise<T | null>((resolve, reject) => {
        queueRef.current.push({
          fn,
          resolve,
          reject,
          retryCount: 0,
        });
        setPendingCount(queueRef.current.length);
        processQueue();
      });
    },
    [mergedConfig.maxQueueSize, processQueue]
  );

  /**
   * Reset the rate limiter state
   */
  const reset = useCallback(() => {
    // Clear queue
    queueRef.current.forEach((request) => request.resolve(null));
    queueRef.current = [];

    // Clear timers
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }

    // Reset state
    activeCountRef.current = 0;
    lastExecutionRef.current = 0;
    setIsLimited(false);
    setCooldownRemaining(0);
    setPendingCount(0);
    setActiveCount(0);
  }, []);

  return {
    execute,
    reset,
    isLimited,
    cooldownRemaining,
    pendingCount,
    activeCount,
    isExecuting: activeCount > 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pre-configured rate limiter for AI API calls
 * - 1 concurrent request
 * - 2 second cooldown between requests
 * - 3 queued requests max
 * - 60 second timeout
 */
export function useAIRateLimiter<T = unknown>(): RateLimiterResult<T> {
  return useRateLimiter<T>({
    maxConcurrent: 1,
    cooldownMs: 2000,
    maxQueueSize: 3,
    timeoutMs: 60000,
    enableRetry: true,
    maxRetries: 2,
    retryBaseDelayMs: 2000,
  });
}

/**
 * Pre-configured rate limiter for skill execution
 * - 1 concurrent execution
 * - 1 second cooldown
 * - No queue (immediate rejection if busy)
 */
export function useSkillRateLimiter<T = unknown>(): RateLimiterResult<T> {
  return useRateLimiter<T>({
    maxConcurrent: 1,
    cooldownMs: 1000,
    maxQueueSize: 1,
    timeoutMs: 120000,
    enableRetry: false,
  });
}

/**
 * Pre-configured rate limiter for batch operations
 * - 3 concurrent requests
 * - 500ms cooldown
 * - 10 queued requests
 */
export function useBatchRateLimiter<T = unknown>(): RateLimiterResult<T> {
  return useRateLimiter<T>({
    maxConcurrent: 3,
    cooldownMs: 500,
    maxQueueSize: 10,
    timeoutMs: 120000,
    enableRetry: true,
    maxRetries: 2,
    retryBaseDelayMs: 1000,
  });
}

export default useRateLimiter;
