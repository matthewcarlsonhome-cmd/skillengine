/**
 * Platform Proxy Client
 *
 * Handles communication with the Supabase Edge Function for platform-managed API keys.
 * When users select "Platform Key" mode, API calls go through this proxy instead of
 * directly to the AI providers.
 */

import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PlatformStatus {
  available: boolean;
  providers: {
    gemini: boolean;
    claude: boolean;
    openai: boolean;
  };
}

export interface ProxyRequest {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ProxyResponse {
  output: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costCents: number;
  };
  model: string;
}

export interface ProxyError {
  error: string;
  balance?: number;
  required?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Cache for platform status (check once per session)
let platformStatusCache: PlatformStatus | null = null;
let platformStatusPromise: Promise<PlatformStatus> | null = null;

// Get Supabase URL from environment or client
function getSupabaseUrl(): string {
  // Try environment variable first
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  // Fallback to supabase client URL
  return supabase?.supabaseUrl || '';
}

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM STATUS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if platform keys are available
 * Results are cached for the session
 */
export async function checkPlatformStatus(): Promise<PlatformStatus> {
  // Return cached result
  if (platformStatusCache) {
    return platformStatusCache;
  }

  // Return existing promise if already fetching
  if (platformStatusPromise) {
    return platformStatusPromise;
  }

  // Check if platform keys are enabled via env
  const platformEnabled = typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_PLATFORM_KEYS_ENABLED === 'true';

  if (!platformEnabled) {
    platformStatusCache = {
      available: false,
      providers: { gemini: false, claude: false, openai: false }
    };
    return platformStatusCache;
  }

  // Fetch from edge function
  platformStatusPromise = (async () => {
    try {
      const supabaseUrl = getSupabaseUrl();
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/platform-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      platformStatusCache = {
        available: data.available ?? false,
        providers: data.providers ?? { gemini: false, claude: false, openai: false }
      };
      return platformStatusCache;
    } catch (error) {
      console.warn('Platform status check failed:', error);
      platformStatusCache = {
        available: false,
        providers: { gemini: false, claude: false, openai: false }
      };
      return platformStatusCache;
    } finally {
      platformStatusPromise = null;
    }
  })();

  return platformStatusPromise;
}

/**
 * Check if a specific provider has platform keys available
 */
export async function isProviderAvailable(provider: 'gemini' | 'claude' | 'chatgpt'): Promise<boolean> {
  const status = await checkPlatformStatus();
  if (provider === 'chatgpt') {
    return status.providers.openai;
  }
  return status.providers[provider];
}

/**
 * Clear the cached platform status (useful after login/logout)
 */
export function clearPlatformStatusCache(): void {
  platformStatusCache = null;
  platformStatusPromise = null;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROXY API CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Make an AI API call through the platform proxy
 * This is used when the user has selected "Platform Key" mode
 */
export async function callProxyAPI(request: ProxyRequest): Promise<ProxyResponse> {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  // Get the current session for auth
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to use Platform Keys');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ProxyError;
    if (response.status === 402) {
      throw new Error(`Insufficient credits. Balance: ${error.balance ?? 0} cents. Required: ${error.required ?? 0} cents.`);
    }
    throw new Error(error.error || `Proxy call failed: ${response.status}`);
  }

  return data as ProxyResponse;
}

/**
 * Stream AI response through the platform proxy
 * Returns SSE stream from the Edge Function for real-time responses
 */
export async function* streamProxyAPI(request: ProxyRequest): AsyncGenerator<string, void, unknown> {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  // Get the current session for auth
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to use Platform Keys');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (response.status === 402) {
      throw new Error(`Insufficient credits. Balance: ${errorData.balance ?? 0} cents. Required: ${errorData.required ?? 0} cents.`);
    }
    throw new Error(errorData.error || `Proxy call failed: ${response.status}`);
  }

  // Check if we got a streaming response
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/event-stream')) {
    // Non-streaming response (fallback)
    const data = await response.json();
    yield data.output;
    return;
  }

  // Process SSE stream
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);

            // Handle OpenAI format
            const openaiContent = data.choices?.[0]?.delta?.content;
            if (openaiContent) {
              yield openaiContent;
              continue;
            }

            // Handle Claude format
            if (data.type === 'content_block_delta' && data.delta?.text) {
              yield data.delta.text;
              continue;
            }
          } catch {
            // Ignore JSON parse errors for partial chunks
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.startsWith('data: ')) {
      const jsonStr = buffer.slice(6).trim();
      if (jsonStr && jsonStr !== '[DONE]') {
        try {
          const data = JSON.parse(jsonStr);
          const content = data.choices?.[0]?.delta?.content || data.delta?.text;
          if (content) {
            yield content;
          }
        } catch {
          // Ignore
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Get raw streaming Response from platform proxy
 * Used when you need direct access to the SSE stream
 */
export async function streamProxyAPIRaw(request: ProxyRequest): Promise<Response> {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to use Platform Keys');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (response.status === 402) {
      throw new Error(`Insufficient credits. Balance: ${errorData.balance ?? 0} cents.`);
    }
    throw new Error(errorData.error || `Proxy call failed: ${response.status}`);
  }

  return response;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER CREDITS
// ═══════════════════════════════════════════════════════════════════════════

export interface UserCreditsInfo {
  balance: number;
  tier: string;
  monthlyAllocation: number;
  usedThisMonth: number;
}

/**
 * Get the current user's credits from the database
 */
export async function getUserCreditsFromDB(): Promise<UserCreditsInfo | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_credits')
    .select('balance, tier, monthly_allocation, used_this_month')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  return {
    balance: data.balance,
    tier: data.tier,
    monthlyAllocation: data.monthly_allocation,
    usedThisMonth: data.used_this_month,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Execute a skill using either platform proxy or direct API based on key mode
 */
export async function executeWithKeyMode(
  keyMode: 'platform' | 'personal',
  directCall: () => AsyncGenerator<string, void, unknown>,
  proxyRequest: ProxyRequest
): AsyncGenerator<string, void, unknown> {
  if (keyMode === 'platform') {
    return streamProxyAPI(proxyRequest);
  } else {
    return directCall();
  }
}
