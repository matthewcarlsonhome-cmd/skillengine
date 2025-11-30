// Dynamic Skill Executor - Runs generated skills

import type { DynamicSkill } from '../../storage/types';

export interface ExecuteSkillOptions {
  skill: DynamicSkill;
  formInputs: Record<string, unknown>;
  apiKey: string;
  provider: 'gemini' | 'claude';
}

// Interpolate template placeholders with form values
export function interpolateTemplate(
  template: string,
  values: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = values[key];
    if (value === undefined || value === null || value === '') {
      return '';
    }
    return String(value);
  });
}

// Stream execution for Gemini
export async function* executeWithGemini(
  options: ExecuteSkillOptions
): AsyncGenerator<string> {
  const { skill, formInputs, apiKey } = options;

  const systemPrompt = skill.prompts.systemInstruction;
  const userPrompt = interpolateTemplate(skill.prompts.userPromptTemplate, formInputs);

  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: skill.config.temperature,
      maxOutputTokens: skill.config.maxTokens,
    },
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

// Stream execution for Claude
export async function* executeWithClaude(
  options: ExecuteSkillOptions
): AsyncGenerator<string> {
  const { skill, formInputs, apiKey } = options;

  const systemPrompt = skill.prompts.systemInstruction;
  const userPrompt = interpolateTemplate(skill.prompts.userPromptTemplate, formInputs);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: skill.config.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield parsed.delta.text;
          }
        } catch {
          // Ignore parse errors for incomplete JSON
        }
      }
    }
  }
}

// Main execution function
export async function* executeDynamicSkill(
  options: ExecuteSkillOptions
): AsyncGenerator<string> {
  const { provider } = options;

  if (provider === 'gemini') {
    yield* executeWithGemini(options);
  } else {
    yield* executeWithClaude(options);
  }
}

// Non-streaming execution (for when you need complete output)
export async function executeDynamicSkillComplete(
  options: ExecuteSkillOptions
): Promise<string> {
  let output = '';
  for await (const chunk of executeDynamicSkill(options)) {
    output += chunk;
  }
  return output;
}
