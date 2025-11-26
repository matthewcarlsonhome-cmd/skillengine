
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- IMPORTANT ---
// PASTE YOUR GOOGLE GEMINI API KEY HERE
// Replace "your_actual_api_key_here" with your real key.
const API_KEY = "your_actual_api_key_here";

let ai: GoogleGenerativeAI | undefined;

// FIX: Corrected the condition to check against the placeholder string.
if (API_KEY && API_KEY !== "your_actual_api_key_here") {
    ai = new GoogleGenerativeAI(API_KEY);
} else {
    console.error("API_KEY not set in lib/gemini.ts. The application's AI features will not work. Please open this file and add your key.");
}

export async function* runSkillStream(
  prompt: string
): AsyncGenerator<{ text: string }, void, unknown> {
  if (!ai) {
    const errorMessage = "Gemini AI client is not initialized. Please ensure you have added your API key to lib/gemini.ts.";
    throw new Error(errorMessage);
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      yield { text };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided API key is not valid. Please check your configuration in lib/gemini.ts.");
    }
    throw new Error("Failed to get response from AI. Please check your network connection.");
  }
}
