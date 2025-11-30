
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function runSkillStream(
  apiKeyFromInput: string,
  promptData: { systemInstruction: string; userPrompt: string; },
  useGoogleSearch: boolean = false
) {

  if (!apiKeyFromInput) {
    throw new Error("API key is missing. Please provide it in the UI.");
  }

  const genAI = new GoogleGenerativeAI(apiKeyFromInput);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-pro-preview',
    systemInstruction: promptData.systemInstruction,
  });

  try {
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: promptData.userPrompt }] }],
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
