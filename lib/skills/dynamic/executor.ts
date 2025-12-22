// Dynamic Skill Executor - Runs generated skills

import type { DynamicSkill } from '../../storage/types';
import type { ChatGPTModelType } from '../../chatgpt';
import type { KeyMode } from '../../platformKeys';

export interface ExecuteSkillOptions {
  skill: DynamicSkill;
  formInputs: Record<string, unknown>;
  apiKey: string;
  provider: 'gemini' | 'claude' | 'chatgpt';
  claudeModel?: 'haiku' | 'sonnet' | 'opus';
  chatgptModel?: ChatGPTModelType;
  /** Key mode: 'platform' uses AI proxy, 'personal' uses direct API calls */
  keyMode?: KeyMode;
}

// Claude model mapping - using -latest aliases for reliability
const CLAUDE_MODELS = {
  haiku: 'claude-3-5-haiku-latest',
  sonnet: 'claude-3-5-sonnet-latest',
  opus: 'claude-3-opus-latest',
} as const;

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
      // Gemini 2.0 Flash supports up to 65K output tokens - use 16384 for comprehensive responses
      maxOutputTokens: Math.max(skill.config.maxTokens, 16384),
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
  const { skill, formInputs, apiKey, claudeModel = 'haiku' } = options;

  const systemPrompt = skill.prompts.systemInstruction;
  const userPrompt = interpolateTemplate(skill.prompts.userPromptTemplate, formInputs);
  const modelId = CLAUDE_MODELS[claudeModel];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelId,
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

// Stream execution for ChatGPT
export async function* executeWithChatGPT(
  options: ExecuteSkillOptions
): AsyncGenerator<string> {
  const { skill, formInputs, apiKey, chatgptModel = 'gpt-4o-mini' } = options;

  const systemPrompt = skill.prompts.systemInstruction;
  const userPrompt = interpolateTemplate(skill.prompts.userPromptTemplate, formInputs);

  const { runSkillStream } = await import('../../chatgpt');

  const response = await runSkillStream(
    apiKey,
    { systemInstruction: systemPrompt, userPrompt },
    chatgptModel
  );

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
        if (data.trim() === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Ignore parse errors for incomplete JSON
        }
      }
    }
  }
}

// Execute using platform AI proxy
async function* executeWithPlatformProxy(
  options: ExecuteSkillOptions
): AsyncGenerator<string> {
  const { skill, formInputs, provider, claudeModel = 'haiku', chatgptModel = 'gpt-4o-mini' } = options;

  const { callAIProxy } = await import('../../platformKeys');

  const systemPrompt = skill.prompts.systemInstruction;
  const userPrompt = interpolateTemplate(skill.prompts.userPromptTemplate, formInputs);

  // Map provider and model to proxy model ID
  let proxyModel: string;
  if (provider === 'gemini') {
    proxyModel = 'gemini-2.0-flash';
  } else if (provider === 'claude') {
    proxyModel = claudeModel; // haiku, sonnet, opus
  } else {
    proxyModel = chatgptModel; // gpt-4o-mini, gpt-4o, etc.
  }

  // Call platform proxy (non-streaming for now)
  const response = await callAIProxy({
    model: proxyModel,
    prompt: userPrompt,
    systemPrompt,
    maxTokens: skill.config.maxTokens,
    temperature: skill.config.temperature,
  });

  // Yield the complete response
  yield response.output;
}

// Main execution function
export async function* executeDynamicSkill(
  options: ExecuteSkillOptions
): AsyncGenerator<string> {
  const { provider, keyMode = 'personal', apiKey } = options;

  // If platform mode is selected, use the AI proxy
  if (keyMode === 'platform') {
    yield* executeWithPlatformProxy(options);
    return;
  }

  // Personal mode - require API key
  if (!apiKey) {
    throw new Error(`No API key provided for ${provider}. Please configure your API key in Settings.`);
  }

  if (provider === 'gemini') {
    yield* executeWithGemini(options);
  } else if (provider === 'chatgpt') {
    yield* executeWithChatGPT(options);
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
