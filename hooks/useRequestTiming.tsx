/**
 * useRequestTiming Hook
 *
 * Provides client-side timing markers and observability for LLM requests.
 * Useful for demo debugging and performance monitoring.
 *
 * Features:
 * - Request ID generation for tracking
 * - Timing markers (start, first-token, complete)
 * - Duration calculations
 * - Console logging for demo debugging
 * - Performance.mark() integration
 */

import { useCallback, useRef, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TimingMarkers {
  requestId: string;
  startTime: number;
  firstTokenTime: number | null;
  completeTime: number | null;
  // Derived values
  timeToFirstToken: number | null;
  totalDuration: number | null;
}

export interface RequestMetadata {
  skillId?: string;
  skillName?: string;
  workflowId?: string;
  provider?: string;
  model?: string;
  inputSizeChars?: number;
}

export interface TimingLog {
  requestId: string;
  event: 'start' | 'first-token' | 'chunk' | 'complete' | 'error' | 'cancel';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export function useRequestTiming() {
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [timing, setTiming] = useState<TimingMarkers | null>(null);
  const [isActive, setIsActive] = useState(false);

  const logsRef = useRef<TimingLog[]>([]);
  const metadataRef = useRef<RequestMetadata | null>(null);
  const chunkCountRef = useRef(0);
  const outputSizeRef = useRef(0);

  /**
   * Generate a unique request ID
   */
  const generateRequestId = useCallback((): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req_${timestamp}_${random}`;
  }, []);

  /**
   * Log a timing event (for demo debugging)
   */
  const logEvent = useCallback((
    requestId: string,
    event: TimingLog['event'],
    metadata?: Record<string, unknown>
  ) => {
    const log: TimingLog = {
      requestId,
      event,
      timestamp: performance.now(),
      metadata,
    };

    logsRef.current.push(log);

    // Console logging for demo debugging
    const prefix = `[Request ${requestId}]`;
    const time = new Date().toISOString().split('T')[1];

    switch (event) {
      case 'start':
        console.log(
          `%c${prefix} Started at ${time}`,
          'color: #3b82f6; font-weight: bold',
          metadata
        );
        // Add performance mark
        performance.mark(`request-start-${requestId}`);
        break;

      case 'first-token':
        console.log(
          `%c${prefix} First token received`,
          'color: #22c55e',
          metadata
        );
        performance.mark(`request-first-token-${requestId}`);
        break;

      case 'complete':
        console.log(
          `%c${prefix} Completed`,
          'color: #22c55e; font-weight: bold',
          metadata
        );
        performance.mark(`request-complete-${requestId}`);
        // Measure duration
        try {
          performance.measure(
            `request-duration-${requestId}`,
            `request-start-${requestId}`,
            `request-complete-${requestId}`
          );
        } catch {
          // Marks may not exist
        }
        break;

      case 'error':
        console.error(
          `%c${prefix} Error`,
          'color: #ef4444; font-weight: bold',
          metadata
        );
        break;

      case 'cancel':
        console.warn(
          `%c${prefix} Cancelled`,
          'color: #f59e0b',
          metadata
        );
        break;
    }
  }, []);

  /**
   * Start timing a new request
   */
  const startRequest = useCallback((metadata?: RequestMetadata): string => {
    const requestId = generateRequestId();
    const startTime = performance.now();

    setCurrentRequestId(requestId);
    setIsActive(true);
    setTiming({
      requestId,
      startTime,
      firstTokenTime: null,
      completeTime: null,
      timeToFirstToken: null,
      totalDuration: null,
    });

    metadataRef.current = metadata || null;
    chunkCountRef.current = 0;
    outputSizeRef.current = 0;
    logsRef.current = [];

    logEvent(requestId, 'start', {
      ...metadata,
      startTime: new Date().toISOString(),
    });

    return requestId;
  }, [generateRequestId, logEvent]);

  /**
   * Mark when first token is received
   */
  const markFirstToken = useCallback(() => {
    if (!timing || timing.firstTokenTime !== null) return;

    const firstTokenTime = performance.now();
    const timeToFirstToken = firstTokenTime - timing.startTime;

    setTiming(prev => prev ? {
      ...prev,
      firstTokenTime,
      timeToFirstToken,
    } : null);

    logEvent(timing.requestId, 'first-token', {
      timeToFirstToken: `${timeToFirstToken.toFixed(0)}ms`,
    });
  }, [timing, logEvent]);

  /**
   * Track a chunk (for streaming responses)
   */
  const trackChunk = useCallback((chunkSize: number) => {
    chunkCountRef.current += 1;
    outputSizeRef.current += chunkSize;

    // Mark first token on first chunk
    if (chunkCountRef.current === 1) {
      markFirstToken();
    }
  }, [markFirstToken]);

  /**
   * Mark request as complete
   */
  const completeRequest = useCallback((additionalMetadata?: Record<string, unknown>) => {
    if (!timing) return;

    const completeTime = performance.now();
    const totalDuration = completeTime - timing.startTime;
    const timeToFirstToken = timing.timeToFirstToken || totalDuration;

    const finalTiming: TimingMarkers = {
      ...timing,
      completeTime,
      totalDuration,
      timeToFirstToken,
    };

    setTiming(finalTiming);
    setIsActive(false);

    logEvent(timing.requestId, 'complete', {
      totalDuration: `${totalDuration.toFixed(0)}ms`,
      timeToFirstToken: `${timeToFirstToken.toFixed(0)}ms`,
      chunkCount: chunkCountRef.current,
      outputSizeChars: outputSizeRef.current,
      ...additionalMetadata,
    });

    return finalTiming;
  }, [timing, logEvent]);

  /**
   * Mark request as failed
   */
  const failRequest = useCallback((error: string | Error) => {
    if (!timing) return;

    const errorMessage = error instanceof Error ? error.message : error;
    const completeTime = performance.now();
    const totalDuration = completeTime - timing.startTime;

    setTiming(prev => prev ? {
      ...prev,
      completeTime,
      totalDuration,
    } : null);
    setIsActive(false);

    logEvent(timing.requestId, 'error', {
      error: errorMessage,
      duration: `${totalDuration.toFixed(0)}ms`,
      chunkCount: chunkCountRef.current,
    });
  }, [timing, logEvent]);

  /**
   * Mark request as cancelled
   */
  const cancelRequest = useCallback(() => {
    if (!timing) return;

    const completeTime = performance.now();
    const totalDuration = completeTime - timing.startTime;

    setTiming(prev => prev ? {
      ...prev,
      completeTime,
      totalDuration,
    } : null);
    setIsActive(false);

    logEvent(timing.requestId, 'cancel', {
      duration: `${totalDuration.toFixed(0)}ms`,
      chunkCount: chunkCountRef.current,
    });
  }, [timing, logEvent]);

  /**
   * Get timing summary for display
   */
  const getTimingSummary = useCallback(() => {
    if (!timing) return null;

    return {
      requestId: timing.requestId,
      timeToFirstToken: timing.timeToFirstToken
        ? `${timing.timeToFirstToken.toFixed(0)}ms`
        : null,
      totalDuration: timing.totalDuration
        ? `${(timing.totalDuration / 1000).toFixed(1)}s`
        : null,
      chunkCount: chunkCountRef.current,
      outputSize: outputSizeRef.current,
      isActive,
    };
  }, [timing, isActive]);

  /**
   * Get all logs for debugging
   */
  const getLogs = useCallback(() => {
    return [...logsRef.current];
  }, []);

  /**
   * Reset timing state
   */
  const reset = useCallback(() => {
    setCurrentRequestId(null);
    setTiming(null);
    setIsActive(false);
    logsRef.current = [];
    metadataRef.current = null;
    chunkCountRef.current = 0;
    outputSizeRef.current = 0;
  }, []);

  return {
    // State
    currentRequestId,
    timing,
    isActive,

    // Actions
    startRequest,
    markFirstToken,
    trackChunk,
    completeRequest,
    failRequest,
    cancelRequest,
    reset,

    // Utilities
    getTimingSummary,
    getLogs,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMING DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TimingDisplayProps {
  timing: TimingMarkers | null;
  className?: string;
}

export const TimingDisplay: React.FC<TimingDisplayProps> = ({ timing, className = '' }) => {
  if (!timing) return null;

  return (
    <div className={`flex items-center gap-4 text-xs text-muted-foreground ${className}`}>
      <span className="font-mono opacity-60">{timing.requestId}</span>
      {timing.timeToFirstToken && (
        <span title="Time to first token">
          TTFT: <span className="font-medium text-foreground">{timing.timeToFirstToken.toFixed(0)}ms</span>
        </span>
      )}
      {timing.totalDuration && (
        <span title="Total duration">
          Total: <span className="font-medium text-foreground">{(timing.totalDuration / 1000).toFixed(1)}s</span>
        </span>
      )}
    </div>
  );
};

export default useRequestTiming;
