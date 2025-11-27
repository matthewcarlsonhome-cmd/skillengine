
import { GoogleGenAI, GenerateContentStreamResult, GenerateContentRequest } from '@google/genai';

export async function runSkillStream(
  apiKey: string,
  promptData: { systemInstruction: string; userPrompt: string; },
  useGoogleSearch: boolean = false
): Promise<GenerateContentStreamResult> {
  if (!apiKey) {
    throw new Error("API key is missing. Please provide a valid API key.");
  }

  const ai = new GoogleGenAI({ apiKey, vertexai: true });
  
  const request: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: promptData.userPrompt }] }],
      systemInstruction: { parts: [{ text: promptData.systemInstruction }] }
  };

  if (useGoogleSearch) {
    request.tools = [{ googleSearch: {} }];
  }

  try {
    const result = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        ...request
    });
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided API key is not valid. Please check your key and try again.");
    }
    throw new Error("Failed to get response from AI. Please check your API key and network connection.");
  }
}
