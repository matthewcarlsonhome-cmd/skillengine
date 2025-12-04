/**
 * useSkillExecution Hook
 *
 * A unified hook for executing AI skills across all skill types:
 * - Static skills (pre-built)
 * - Dynamic skills (user-generated)
 * - Community skills (shared)
 * - Workflow steps
 *
 * This hook centralizes:
 * - API key management
 * - Streaming response handling
 * - Progress tracking
 * - Error handling with retry logic
 * - Execution history tracking
 * - Usage analytics
 */

import { useState, useCallback, useRef } from 'react';
import { runSkillStream as runGeminiSkillStream } from '../lib/gemini';
import { runSkillStream as runClaudeSkillStream } from '../lib/claude';
import { db } from '../lib/storage/indexeddb';
import { trackSkillUsage } from '../lib/admin';
import { getApiKey } from '../lib/apiKeyStorage';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import type { SkillExecution } from '../lib/storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ApiProvider = 'gemini' | 'claude' | 'chatgpt';
export type ClaudeModel = 'haiku' | 'sonnet' | 'opus';
export type SkillSource = 'static' | 'dynamic' | 'community';

export interface PromptData {
  systemInstruction: string;
  userPrompt: string;
}

export interface ExecutionConfig {
  apiProvider: ApiProvider;
  apiKey: string;
  claudeModel?: ClaudeModel;
  useGoogleSearch?: boolean;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export interface ExecutionResult {
  output: string;
  citations: Citation[];
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface Citation {
  web: {
    uri: string;
    title?: string;
  };
}

export interface SkillMetadata {
  id: string;
  name: string;
  source: SkillSource;
  workspaceId?: string;
}

export interface UseSkillExecutionOptions {
  onProgress?: (progress: number) => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (result: ExecutionResult) => void;
  onError?: (error: Error) => void;
  trackUsage?: boolean;
  saveExecution?: boolean;
}

export interface UseSkillExecutionReturn {
  execute: (
    promptData: PromptData,
    config: ExecutionConfig,
    skillMetadata: SkillMetadata,
    inputs?: Record<string, unknown>
  ) => Promise<ExecutionResult>;
  cancel: () => void;
  output: string;
  citations: Citation[];
  isLoading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════

export class SkillExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'SkillExecutionError';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export function useSkillExecution(
  options: UseSkillExecutionOptions = {}
): UseSkillExecutionReturn {
  const {
    onProgress,
    onChunk,
    onComplete,
    onError,
    trackUsage = true,
    saveExecution = true,
  } = options;

  const { user, appUser } = useAuth();
  const { addToast } = useToast();

  const [output, setOutput] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setOutput('');
    setCitations([]);
    setIsLoading(false);
    setProgress(0);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(value);
    onProgress?.(value);
  }, [onProgress]);

  const executeWithRetry = useCallback(async (
    fn: () => Promise<ExecutionResult>,
    attempts: number,
    delayMs: number
  ): Promise<ExecutionResult> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Don't retry on non-retryable errors
        if (err instanceof SkillExecutionError && !err.retryable) {
          throw err;
        }

        // Don't retry on abort
        if (lastError.name === 'AbortError') {
          throw lastError;
        }

        if (attempt < attempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }

    throw lastError;
  }, []);

  const executeGemini = useCallback(async (
    apiKey: string,
    promptData: PromptData,
    useGoogleSearch: boolean
  ): Promise<{ output: string; citations: Citation[] }> => {
    const result = await runGeminiSkillStream(apiKey, promptData, useGoogleSearch);
    const stream = result && result.stream ? result.stream : result;

    if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
      throw new SkillExecutionError(
        'Invalid response from Gemini service',
        'INVALID_RESPONSE',
        true
      );
    }

    let fullOutput = '';
    for await (const chunk of stream) {
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Execution cancelled');
      }
      const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
      if (text) {
        fullOutput += text;
        setOutput(fullOutput);
        onChunk?.(text);
      }
    }

    // Extract citations
    let extractedCitations: Citation[] = [];
    try {
      const finalResponse = await result.response;
      if (finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        extractedCitations = finalResponse.candidates[0].groundingMetadata.groundingChunks;
      }
    } catch {
      // Citations may not be available
    }

    return { output: fullOutput, citations: extractedCitations };
  }, [onChunk]);

  const executeClaude = useCallback(async (
    apiKey: string,
    promptData: PromptData,
    model: ClaudeModel
  ): Promise<{ output: string; citations: Citation[] }> => {
    const response = await runClaudeSkillStream(apiKey, promptData, model);

    if (!response.body) {
      throw new SkillExecutionError(
        'Empty response from Claude service',
        'EMPTY_RESPONSE',
        true
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullOutput = '';

    try {
      while (true) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Execution cancelled');
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            if (jsonStr.trim() === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                fullOutput += parsed.delta.text;
                setOutput(fullOutput);
                onChunk?.(parsed.delta.text);
              }
            } catch {
              // Ignore parsing errors for incomplete JSON chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { output: fullOutput, citations: [] };
  }, [onChunk]);

  const execute = useCallback(async (
    promptData: PromptData,
    config: ExecutionConfig,
    skillMetadata: SkillMetadata,
    inputs?: Record<string, unknown>
  ): Promise<ExecutionResult> => {
    const {
      apiProvider,
      apiKey,
      claudeModel = 'haiku',
      useGoogleSearch = false,
      retryAttempts = 2,
      retryDelayMs = 1000,
    } = config;

    // Validate API key
    if (!apiKey) {
      const storedKey = getApiKey(apiProvider as 'gemini' | 'claude');
      if (!storedKey) {
        throw new SkillExecutionError(
          'API key is required',
          'MISSING_API_KEY',
          false
        );
      }
    }

    // Reset state
    reset();
    setIsLoading(true);
    setError(null);

    // Set up abort controller
    abortControllerRef.current = new AbortController();

    // Start progress animation
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 2, 95);
        onProgress?.(newProgress);
        return newProgress;
      });
    }, 200);

    const startTime = Date.now();

    try {
      const result = await executeWithRetry(async () => {
        let executionResult: { output: string; citations: Citation[] };

        switch (apiProvider) {
          case 'gemini':
            executionResult = await executeGemini(apiKey, promptData, useGoogleSearch);
            break;
          case 'claude':
            executionResult = await executeClaude(apiKey, promptData, claudeModel);
            break;
          default:
            throw new SkillExecutionError(
              `API provider "${apiProvider}" is not supported`,
              'UNSUPPORTED_PROVIDER',
              false
            );
        }

        return {
          ...executionResult,
          durationMs: Date.now() - startTime,
          success: true,
        };
      }, retryAttempts, retryDelayMs);

      setCitations(result.citations);
      updateProgress(100);

      // Save execution to history
      if (saveExecution) {
        const execution: SkillExecution = {
          id: crypto.randomUUID(),
          skillId: skillMetadata.id,
          skillName: skillMetadata.name,
          skillSource: skillMetadata.source,
          workspaceId: skillMetadata.workspaceId,
          createdAt: new Date().toISOString(),
          inputs: inputs || {},
          output: result.output,
          model: apiProvider as 'gemini' | 'claude',
          durationMs: result.durationMs,
        };
        await db.saveExecution(execution);
      }

      // Track usage for analytics
      if (trackUsage) {
        const userId = appUser?.id || user?.id || 'anonymous';
        const userEmail = appUser?.email || user?.email || 'anonymous';
        trackSkillUsage(
          userId,
          userEmail,
          skillMetadata.id,
          skillMetadata.name,
          skillMetadata.source
        );
      }

      onComplete?.(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      onError?.(err instanceof Error ? err : new Error(errorMessage));

      return {
        output: '',
        citations: [],
        durationMs: Date.now() - startTime,
        success: false,
        error: errorMessage,
      };

    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [
    reset,
    executeWithRetry,
    executeGemini,
    executeClaude,
    updateProgress,
    saveExecution,
    trackUsage,
    appUser,
    user,
    addToast,
    onComplete,
    onError,
    onProgress,
  ]);

  return {
    execute,
    cancel,
    output,
    citations,
    isLoading,
    progress,
    error,
    reset,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY: Get API key with fallback
// ═══════════════════════════════════════════════════════════════════════════

export function getApiKeyWithFallback(
  provider: ApiProvider,
  providedKey?: string
): string {
  if (providedKey) return providedKey;
  return getApiKey(provider as 'gemini' | 'claude') || '';
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY: Validate API key format
// ═══════════════════════════════════════════════════════════════════════════

export function validateApiKey(provider: ApiProvider, key: string): boolean {
  if (!key || key.length < 10) return false;

  switch (provider) {
    case 'gemini':
      // Gemini keys typically start with 'AIza'
      return key.startsWith('AIza') || key.length > 30;
    case 'claude':
      // Claude keys start with 'sk-ant-'
      return key.startsWith('sk-ant-') || key.length > 50;
    default:
      return key.length > 20;
  }
}

export default useSkillExecution;
