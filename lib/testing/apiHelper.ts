/**
 * apiHelper.ts - Simple API Helper for Testing
 *
 * Provides a non-streaming wrapper around the Gemini API for testing purposes.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ApiCallResult {
  response: string;
  tokenCount?: number;
}

/**
 * Call Gemini API with system instruction and user prompt
 * Returns the full response (non-streaming)
 */
export async function callGeminiAPI(
  systemInstruction: string,
  userPrompt: string,
  apiKey: string,
  modelId: string = 'gemini-1.5-flash-latest'
): Promise<ApiCallResult> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction,
  });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    });

    const response = result.response;
    const text = response.text();

    return {
      response: text,
      tokenCount: response.usageMetadata?.totalTokenCount,
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error('The provided API key is not valid. Please check your key and try again.');
    }
    throw new Error('Failed to get response from AI. Please check your API key and network connection.');
  }
}
