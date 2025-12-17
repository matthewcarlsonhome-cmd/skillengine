/**
 * AI Proxy Edge Function
 *
 * This Supabase Edge Function acts as a secure proxy for AI API calls.
 * It allows users to use platform-provided API keys instead of their own.
 *
 * Features:
 * - Validates user authentication
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
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance, tier')
      .eq('user_id', user.id)
      .single();

    if (creditsError && creditsError.code !== 'PGRST116') {
      console.error('Credits check error:', creditsError);
    }

    const balance = userCredits?.balance ?? 0;
    const estimatedCost = 50; // Rough estimate of 50 cents for checking

    if (balance < estimatedCost) {
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

    // 6. Make the API call based on provider
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

    // 8. Deduct credits from user
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: totalCostCents,
    });

    // 9. Record usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      model: model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_cents: totalCostCents,
      created_at: new Date().toISOString(),
    });

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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];
  if (systemPrompt) {
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
