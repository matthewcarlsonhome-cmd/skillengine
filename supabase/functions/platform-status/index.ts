/**
 * Platform Status Edge Function
 *
 * Returns which AI providers have platform keys configured.
 * This allows the frontend to show/hide the Platform Key option
 * based on whether the admin has set up the API keys.
 *
 * No authentication required - this is a public endpoint that just
 * reports which providers are available (not the keys themselves).
 *
 * Rate limited to prevent enumeration attacks.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  rateLimitMiddleware,
  getIdentifier,
} from '../_shared/rateLimit.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limits (no user ID for this public endpoint)
    const rateLimitResponse = rateLimitMiddleware(req, undefined, 'platform-status', corsHeaders);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check which API keys are configured
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const claudeKey = Deno.env.get('CLAUDE_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    // A key is considered "configured" if it exists and has a reasonable length
    const isConfigured = (key: string | undefined): boolean => {
      return !!key && key.length > 10 && !key.includes('your-') && !key.includes('YOUR_');
    };

    const providers = {
      gemini: isConfigured(geminiKey),
      claude: isConfigured(claudeKey),
      openai: isConfigured(openaiKey),
    };

    // Platform is available if at least one provider is configured
    const available = providers.gemini || providers.claude || providers.openai;

    return new Response(
      JSON.stringify({
        available,
        providers,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Platform status error:', error);
    return new Response(
      JSON.stringify({
        available: false,
        providers: { gemini: false, claude: false, openai: false },
        error: 'Failed to check platform status',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
