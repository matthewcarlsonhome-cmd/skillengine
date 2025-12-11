// Claude API configuration
// Note: Direct browser access to Claude API requires special API key permissions
// See: https://docs.anthropic.com/en/api/client-sdks#browser-usage

// Available Claude models (fastest to most capable):
// Using -latest aliases for reliability - these auto-update to newest snapshots
// - claude-3-5-haiku-latest: Fastest, most cost-effective
// - claude-3-5-sonnet-latest: Balanced speed and capability
// - claude-3-opus-latest: Most capable, slowest (may require higher API tier)
const CLAUDE_MODELS = {
  haiku: 'claude-3-5-haiku-latest',
  sonnet: 'claude-3-5-sonnet-latest',
  opus: 'claude-3-opus-latest',
} as const;

// Human-readable names for error messages
const MODEL_NAMES = {
  haiku: 'Claude 3.5 Haiku',
  sonnet: 'Claude 3.5 Sonnet',
  opus: 'Claude 3 Opus',
} as const;

// Default to Haiku for fastest responses
const DEFAULT_MODEL = CLAUDE_MODELS.haiku;

export async function runSkillStream(
  apiKey: string,
  promptData: { systemInstruction: string; userPrompt: string; },
  modelType: 'haiku' | 'sonnet' | 'opus' = 'haiku'
): Promise<Response> {
  if (!apiKey) {
    throw new Error("API key is missing. Please provide a valid Claude API key.");
  }

  const API_URL = "https://api.anthropic.com/v1/messages";
  const MODEL_NAME = CLAUDE_MODELS[modelType] || DEFAULT_MODEL;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        // Required for browser access - API key must have this permission enabled
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 8192, // Claude 3.5 models support up to 8192 output tokens
        system: promptData.systemInstruction,
        messages: [{ role: 'user', content: promptData.userPrompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const modelDisplayName = MODEL_NAMES[modelType] || modelType;
      console.error(`Error from Claude API (${modelDisplayName}):`, errorBody);

      // Provide specific error messages
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Claude API key.');
      }
      if (response.status === 403) {
        throw new Error(`Access denied for ${modelDisplayName}. Your API key may not have access to this model or browser access may not be enabled.`);
      }
      if (response.status === 404) {
        throw new Error(`Model ${modelDisplayName} not found. This model may not be available for your API key tier. Try using Haiku instead.`);
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 400 && errorBody.error?.message?.includes('model')) {
        throw new Error(`${modelDisplayName} is not available. Try using Haiku or Sonnet instead.`);
      }

      throw new Error(`Claude API Error (${modelDisplayName}): ${errorBody.error?.message || response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error calling Claude API:", error);

    // CORS or network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        'Failed to connect to Claude API. This is likely a CORS restriction. ' +
        'Claude API requires special API key permissions for browser access. ' +
        'Options: 1) Use Gemini instead (recommended), ' +
        '2) Contact Anthropic to enable browser access for your API key, ' +
        '3) Disable ad blockers/extensions that may block the request.'
      );
    }

    if (error instanceof Error) {
      throw new Error(`Failed to get response from Claude: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling the Claude API.");
  }
}
