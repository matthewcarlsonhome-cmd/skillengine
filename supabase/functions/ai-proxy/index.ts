/**
 * AI Proxy Edge Function
 *
 * This Supabase Edge Function acts as a secure proxy for AI API calls.
 * It allows users to use platform-provided API keys instead of their own.
 *
 * Features:
 * - Validates user authentication
 * - Rate limiting to prevent abuse
 * - Checks user credits before making calls
 * - Routes requests to Gemini, Claude, or ChatGPT
 * - Deducts credits based on actual token usage
 * - Records usage for billing/analytics
 *
 * Environment Variables Required:
 * - GEMINI_API_KEY: Google AI Studio API key
 * - CLAUDE_API_KEY: Anthropic API key
 * - OPENAI_API_KEY: OpenAI API key
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  rateLimitMiddleware,
  getRateLimitHeaders,
  checkRateLimit,
  getIdentifier,
  RATE_LIMITS,
} from '../_shared/rateLimit.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model pricing per 1M tokens (in cents)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.0-flash-exp': { input: 7.5, output: 30 },
  'gemini-1.5-pro': { input: 125, output: 500 },
  'claude-3-haiku-20240307': { input: 25, output: 125 },
  'claude-3-5-sonnet-20241022': { input: 300, output: 1500 },
  'claude-3-opus-20240229': { input: 1500, output: 7500 },
  'gpt-4o-mini': { input: 15, output: 60 },
  'gpt-4o': { input: 250, output: 1000 },
};

// Map simple model IDs to full API model names and max tokens
const MODEL_MAP: Record<string, { provider: string; apiModel: string; maxTokens: number }> = {
  'gemini-2.0-flash': { provider: 'gemini', apiModel: 'gemini-2.0-flash-exp', maxTokens: 8192 },
  'gemini-1.5-pro': { provider: 'gemini', apiModel: 'gemini-1.5-pro', maxTokens: 8192 },
  'haiku': { provider: 'claude', apiModel: 'claude-3-haiku-20240307', maxTokens: 8192 },
  'sonnet': { provider: 'claude', apiModel: 'claude-3-5-sonnet-20241022', maxTokens: 8192 },
  'opus': { provider: 'claude', apiModel: 'claude-3-opus-20240229', maxTokens: 4096 },
  'gpt-4o-mini': { provider: 'openai', apiModel: 'gpt-4o-mini', maxTokens: 16384 },
  'gpt-4o': { provider: 'openai', apiModel: 'gpt-4o', maxTokens: 16384 },
};

interface RequestBody {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

// Streaming headers for SSE
const streamHeaders = {
  ...corsHeaders,
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
};

interface UsageRecord {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1.5. Check rate limits
    const rateLimitResponse = rateLimitMiddleware(req, user.id, 'ai-proxy', corsHeaders);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Also check burst rate limit
    const burstLimitResponse = rateLimitMiddleware(req, user.id, 'ai-proxy-burst', corsHeaders);
    if (burstLimitResponse) {
      return burstLimitResponse;
    }

    // 2. Parse request body
    const body: RequestBody = await req.json();
    const { model, prompt, systemPrompt, maxTokens = 4096, temperature = 0.7, stream = false } = body;

    if (!model || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: model, prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Resolve model to provider
    const modelInfo = MODEL_MAP[model];
    if (!modelInfo) {
      return new Response(
        JSON.stringify({ error: `Unknown model: ${model}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enforce model-specific max token limit
    const effectiveMaxTokens = Math.min(maxTokens, modelInfo.maxTokens);

    // 4. Check user credits (get from database)
    // Credit checking is OPTIONAL - if the table doesn't exist or user has no row,
    // we allow the request (for development/new deployments).
    // Set ENFORCE_CREDITS=true in environment to require credits.
    const enforceCredits = Deno.env.get('ENFORCE_CREDITS') === 'true';

    let balance = 0;
    let skipCreditCheck = !enforceCredits; // Skip by default unless enforced

    try {
      const { data: userCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select('balance, tier')
        .eq('user_id', user.id)
        .single();

      if (creditsError) {
        // PGRST116 = no rows found (user has no credits row)
        // 42P01 = table doesn't exist
        if (creditsError.code === 'PGRST116' || creditsError.code === '42P01') {
          console.log('Credits table/row not found, skipping credit check');
          skipCreditCheck = true;
        } else {
          console.error('Credits check error:', creditsError);
          skipCreditCheck = true; // Don't block on DB errors
        }
      } else if (userCredits) {
        balance = userCredits.balance ?? 0;
        skipCreditCheck = false; // User has credits row, enforce check
      }
    } catch (err) {
      console.error('Credits check exception:', err);
      skipCreditCheck = true; // Don't block on exceptions
    }

    const estimatedCost = 50; // Rough estimate of 50 cents for checking

    // Only enforce credit check if:
    // 1. ENFORCE_CREDITS is true, OR
    // 2. User explicitly has a credits row with insufficient balance
    if (!skipCreditCheck && balance < estimatedCost) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          balance,
          required: estimatedCost
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Get the appropriate API key
    let apiKey: string | undefined;
    switch (modelInfo.provider) {
      case 'gemini':
        apiKey = Deno.env.get('GEMINI_API_KEY');
        break;
      case 'claude':
        apiKey = Deno.env.get('CLAUDE_API_KEY');
        break;
      case 'openai':
        apiKey = Deno.env.get('OPENAI_API_KEY');
        break;
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `Platform key not configured for ${modelInfo.provider}` }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Handle streaming vs non-streaming
    if (stream && modelInfo.provider === 'openai') {
      // ═══════════════════════════════════════════════════════════════════
      // STREAMING MODE (OpenAI only for now)
      // ═══════════════════════════════════════════════════════════════════
      return handleOpenAIStream(
        apiKey,
        modelInfo.apiModel,
        prompt,
        systemPrompt,
        effectiveMaxTokens,
        temperature,
        user.id,
        model,
        skipCreditCheck,
        supabase
      );
    } else if (stream && modelInfo.provider === 'claude') {
      // Claude streaming
      return handleClaudeStream(
        apiKey,
        modelInfo.apiModel,
        prompt,
        systemPrompt,
        effectiveMaxTokens,
        temperature,
        user.id,
        model,
        skipCreditCheck,
        supabase
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NON-STREAMING MODE
    // ═══════════════════════════════════════════════════════════════════════
    let response: Response;
    let inputTokens = 0;
    let outputTokens = 0;
    let outputText = '';

    if (modelInfo.provider === 'gemini') {
      response = await callGemini(apiKey, modelInfo.apiModel, prompt, systemPrompt, effectiveMaxTokens, temperature);
      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        outputText = data.candidates[0].content.parts[0].text;
      }
      inputTokens = data.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
      outputTokens = data.usageMetadata?.candidatesTokenCount || Math.ceil(outputText.length / 4);
    } else if (modelInfo.provider === 'claude') {
      response = await callClaude(apiKey, modelInfo.apiModel, prompt, systemPrompt, effectiveMaxTokens, temperature);
      const data = await response.json();
      if (data.content?.[0]?.text) {
        outputText = data.content[0].text;
      }
      inputTokens = data.usage?.input_tokens || Math.ceil(prompt.length / 4);
      outputTokens = data.usage?.output_tokens || Math.ceil(outputText.length / 4);
    } else if (modelInfo.provider === 'openai') {
      response = await callOpenAI(apiKey, modelInfo.apiModel, prompt, systemPrompt, effectiveMaxTokens, temperature);
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        outputText = data.choices[0].message.content;
      }
      inputTokens = data.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
      outputTokens = data.usage?.completion_tokens || Math.ceil(outputText.length / 4);
    } else {
      return new Response(
        JSON.stringify({ error: 'Unknown provider' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Calculate actual cost
    const pricing = MODEL_PRICING[modelInfo.apiModel] || { input: 10, output: 30 };
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    const totalCostCents = Math.ceil((inputCost + outputCost) * 100);

    // 8. Deduct credits from user (if credits table exists)
    if (!skipCreditCheck) {
      try {
        await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: totalCostCents,
        });
      } catch (err) {
        console.warn('Failed to deduct credits (table may not exist):', err);
      }
    }

    // 9. Record usage (if usage_logs table exists)
    try {
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        model: model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_cents: totalCostCents,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to log usage (table may not exist):', err);
    }

    // 10. Return the response
    return new Response(
      JSON.stringify({
        output: outputText,
        usage: {
          inputTokens,
          outputTokens,
          costCents: totalCostCents,
        },
        model: modelInfo.apiModel,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('AI Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER API CALLS
// ═══════════════════════════════════════════════════════════════════════════

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 4096,
  temperature: number = 0.7
): Promise<Response> {
  // Use header-based authentication instead of query parameter
  // to prevent API key exposure in logs and referrer headers
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const contents = [];
  if (systemPrompt) {
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    }),
  });
}

async function callClaude(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 4096,
  temperature: number = 0.7
): Promise<Response> {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt || '',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
}

async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 4096,
  temperature: number = 0.7
): Promise<Response> {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// STREAMING HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle OpenAI streaming response
 * Forwards SSE chunks directly to client and tracks usage
 */
async function handleOpenAIStream(
  apiKey: string,
  apiModel: string,
  prompt: string,
  systemPrompt: string | undefined,
  maxTokens: number,
  temperature: number,
  userId: string,
  requestModel: string,
  skipCreditCheck: boolean,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: apiModel,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
      stream_options: { include_usage: true },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(
      JSON.stringify({ error: `OpenAI API error: ${error}` }),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Track usage for billing after stream completes
  let inputTokens = 0;
  let outputTokens = 0;

  // Create a transform stream that forwards chunks and tracks usage
  const { readable, writable } = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
  });

  // Process the stream in the background
  (async () => {
    const reader = response.body!.getReader();
    const writer = writable.getWriter();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Forward the chunk
        await writer.write(value);

        // Parse for usage info (comes in final chunk)
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.usage) {
                inputTokens = data.usage.prompt_tokens || 0;
                outputTokens = data.usage.completion_tokens || 0;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      await writer.close();

      // Record usage after stream completes
      if (inputTokens > 0 || outputTokens > 0) {
        const pricing = MODEL_PRICING[apiModel] || { input: 10, output: 30 };
        const inputCost = (inputTokens / 1_000_000) * pricing.input;
        const outputCost = (outputTokens / 1_000_000) * pricing.output;
        const totalCostCents = Math.ceil((inputCost + outputCost) * 100);

        // Deduct credits
        if (!skipCreditCheck) {
          try {
            await supabase.rpc('deduct_credits', {
              p_user_id: userId,
              p_amount: totalCostCents,
            });
          } catch (err) {
            console.warn('Failed to deduct credits:', err);
          }
        }

        // Log usage
        try {
          await supabase.from('usage_logs').insert({
            user_id: userId,
            model: requestModel,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost_cents: totalCostCents,
            created_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Failed to log usage:', err);
        }
      }
    }
  })();

  return new Response(readable, {
    headers: streamHeaders,
  });
}

/**
 * Handle Claude streaming response
 * Forwards SSE chunks directly to client and tracks usage
 */
async function handleClaudeStream(
  apiKey: string,
  apiModel: string,
  prompt: string,
  systemPrompt: string | undefined,
  maxTokens: number,
  temperature: number,
  userId: string,
  requestModel: string,
  skipCreditCheck: boolean,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: apiModel,
      max_tokens: maxTokens,
      temperature,
      stream: true,
      system: systemPrompt || '',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(
      JSON.stringify({ error: `Claude API error: ${error}` }),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Track usage for billing after stream completes
  let inputTokens = 0;
  let outputTokens = 0;

  // Create a transform stream that forwards chunks and tracks usage
  const { readable, writable } = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
  });

  // Process the stream in the background
  (async () => {
    const reader = response.body!.getReader();
    const writer = writable.getWriter();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Forward the chunk
        await writer.write(value);

        // Parse for usage info from Claude events
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              // Claude sends usage in message_start and message_delta events
              if (data.type === 'message_start' && data.message?.usage) {
                inputTokens = data.message.usage.input_tokens || 0;
              }
              if (data.type === 'message_delta' && data.usage) {
                outputTokens = data.usage.output_tokens || 0;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      await writer.close();

      // Record usage after stream completes
      if (inputTokens > 0 || outputTokens > 0) {
        const pricing = MODEL_PRICING[apiModel] || { input: 10, output: 30 };
        const inputCost = (inputTokens / 1_000_000) * pricing.input;
        const outputCost = (outputTokens / 1_000_000) * pricing.output;
        const totalCostCents = Math.ceil((inputCost + outputCost) * 100);

        // Deduct credits
        if (!skipCreditCheck) {
          try {
            await supabase.rpc('deduct_credits', {
              p_user_id: userId,
              p_amount: totalCostCents,
            });
          } catch (err) {
            console.warn('Failed to deduct credits:', err);
          }
        }

        // Log usage
        try {
          await supabase.from('usage_logs').insert({
            user_id: userId,
            model: requestModel,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost_cents: totalCostCents,
            created_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Failed to log usage:', err);
        }
      }
    }
  })();

  return new Response(readable, {
    headers: streamHeaders,
  });
}
