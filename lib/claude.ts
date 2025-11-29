
export async function runSkillStream(
  apiKey: string,
  promptData: { systemInstruction: string; userPrompt: string; }
): Promise<Response> {
  if (!apiKey) {
    throw new Error("API key is missing. Please provide a valid Claude API key.");
  }

  const API_URL = "https://api.anthropic.com/v1/messages";
  const MODEL_NAME = "claude-3-5-sonnet-20240620";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 4096,
        system: promptData.systemInstruction,
        messages: [{ role: 'user', content: promptData.userPrompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Error from Claude API:", errorBody);
        throw new Error(`Claude API Error: ${errorBody.error?.message || response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error calling Claude API:", error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Failed to connect to Claude API. Try disabling ad blockers or check network restrictions.');
    }
    if (error instanceof Error) {
        throw new Error(`Failed to get response from Claude: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling the Claude API.");
  }
}
