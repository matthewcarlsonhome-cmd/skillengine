// Skill Builder - Generates full skill definitions from recommendations

import type { JDAnalysis, SkillRecommendation, DynamicSkill, DynamicFormInput } from '../../storage/types';

// Theme palette for generated skills
const THEME_PALETTE = [
  { primary: 'text-blue-400', secondary: 'bg-blue-900/20', gradient: 'from-blue-500/20 to-transparent', iconName: 'FileText' },
  { primary: 'text-emerald-400', secondary: 'bg-emerald-900/20', gradient: 'from-emerald-500/20 to-transparent', iconName: 'CheckCircle' },
  { primary: 'text-purple-400', secondary: 'bg-purple-900/20', gradient: 'from-purple-500/20 to-transparent', iconName: 'Users' },
  { primary: 'text-orange-400', secondary: 'bg-orange-900/20', gradient: 'from-orange-500/20 to-transparent', iconName: 'Zap' },
  { primary: 'text-cyan-400', secondary: 'bg-cyan-900/20', gradient: 'from-cyan-500/20 to-transparent', iconName: 'BarChart' },
  { primary: 'text-rose-400', secondary: 'bg-rose-900/20', gradient: 'from-rose-500/20 to-transparent', iconName: 'MessageSquare' },
  { primary: 'text-lime-400', secondary: 'bg-lime-900/20', gradient: 'from-lime-500/20 to-transparent', iconName: 'Target' },
  { primary: 'text-indigo-400', secondary: 'bg-indigo-900/20', gradient: 'from-indigo-500/20 to-transparent', iconName: 'Lightbulb' },
  { primary: 'text-amber-400', secondary: 'bg-amber-900/20', gradient: 'from-amber-500/20 to-transparent', iconName: 'Clock' },
  { primary: 'text-teal-400', secondary: 'bg-teal-900/20', gradient: 'from-teal-500/20 to-transparent', iconName: 'Search' },
];

// System prompt for building full skill definitions
const SKILL_BUILDER_SYSTEM_PROMPT = `You are a Skill Architect for an AI-powered productivity platform. Your job is to create complete, production-ready skill definitions.

A skill is an AI-powered tool that helps users complete specific tasks. Each skill must be:
1. Focused on ONE clear outcome
2. Have well-defined inputs that are easy to fill out
3. Produce actionable, high-quality output
4. Be immediately usable without additional configuration

You must respond with ONLY valid JSON (no markdown, no explanation, just the JSON object).

Output JSON Schema:
{
  "name": "string - skill display name",
  "description": "string - one sentence description",
  "longDescription": "string - 2-3 sentence detailed description",
  "inputs": [
    {
      "id": "string - camelCase identifier",
      "label": "string - display label",
      "type": "text|textarea|select|checkbox|number",
      "placeholder": "string - helpful placeholder text",
      "helpText": "string - additional guidance for the user",
      "options": ["array of options for select type"],
      "defaultValue": "string|boolean|number - optional default",
      "validation": {
        "required": boolean,
        "minLength": number (optional),
        "maxLength": number (optional)
      }
    }
  ],
  "prompts": {
    "systemInstruction": "string - detailed system prompt (300-500 words) that defines the AI's role and output format",
    "userPromptTemplate": "string - user prompt template using {{inputId}} placeholders for each form input",
    "outputFormat": "markdown|json|table"
  },
  "config": {
    "recommendedModel": "gemini|claude|any",
    "useWebSearch": boolean,
    "maxTokens": number (2048-4096),
    "temperature": number (0.1-0.7)
  }
}

Guidelines for form inputs:
- Keep inputs minimal but sufficient (3-7 inputs typical)
- Use textarea for longer content, text for short inputs
- Use select for categorical choices
- Always include helpful placeholder text
- Mark critical inputs as required

Guidelines for system prompts:
- Be specific about the role and expertise
- Define clear output structure
- Include quality standards
- Mention the domain context when relevant

Guidelines for user prompt templates:
- Use {{inputId}} syntax for placeholders
- Structure the prompt clearly with sections
- Include all form inputs in the template`;

export interface BuildSkillOptions {
  recommendation: SkillRecommendation;
  jdAnalysis: JDAnalysis;
  originalJD: string;
  workspaceId: string;
  apiKey: string;
  provider: 'gemini' | 'claude';
}

export interface BuildProgress {
  skillId: string;
  skillName: string;
  status: 'pending' | 'building' | 'complete' | 'error';
  error?: string;
}

export async function buildSkill(options: BuildSkillOptions): Promise<DynamicSkill> {
  const { recommendation, jdAnalysis, originalJD, workspaceId, apiKey, provider } = options;

  const userPrompt = `Create a complete skill definition for the following skill concept.

## Skill Concept
Name: ${recommendation.name}
Description: ${recommendation.description}
Category: ${recommendation.category}
Value: ${recommendation.valueProposition}
Estimated Time Saved: ${recommendation.estimatedTimeSaved}

## Role Context
Title: ${jdAnalysis.role.title}
Department: ${jdAnalysis.role.department}
Level: ${jdAnalysis.role.level}

## Key Responsibilities Related to This Skill
${jdAnalysis.responsibilities
  .filter(r => r.automationPotential === 'high' || r.automationPotential === 'medium')
  .slice(0, 5)
  .map(r => `- ${r.task} (${r.frequency}, ${r.automationPotential} automation potential)`)
  .join('\n')}

## Tools Commonly Used
${jdAnalysis.toolsAndPlatforms.slice(0, 5).map(t => `- ${t.name} (${t.category})`).join('\n')}

## Original Job Description (for context)
${originalJD.slice(0, 2000)}

Generate a complete skill definition as JSON.`;

  let responseText: string;

  if (provider === 'gemini') {
    responseText = await callGemini(apiKey, SKILL_BUILDER_SYSTEM_PROMPT, userPrompt);
  } else {
    responseText = await callClaude(apiKey, SKILL_BUILDER_SYSTEM_PROMPT, userPrompt);
  }

  // Parse the response
  const cleaned = cleanJsonResponse(responseText);
  const parsed = JSON.parse(cleaned);

  // Assign a theme based on the recommendation index
  const themeIndex = Math.floor(Math.random() * THEME_PALETTE.length);
  const theme = THEME_PALETTE[themeIndex];

  // Construct the full DynamicSkill object
  const now = new Date().toISOString();
  const skill: DynamicSkill = {
    id: crypto.randomUUID(),
    workspaceId,
    version: 1,
    createdAt: now,
    updatedAt: now,

    name: parsed.name || recommendation.name,
    description: parsed.description || recommendation.description,
    longDescription: parsed.longDescription || recommendation.valueProposition,
    category: recommendation.category,
    estimatedTimeSaved: recommendation.estimatedTimeSaved,

    theme,

    inputs: validateInputs(parsed.inputs || []),

    prompts: {
      systemInstruction: parsed.prompts?.systemInstruction || generateFallbackSystemPrompt(recommendation),
      userPromptTemplate: parsed.prompts?.userPromptTemplate || generateFallbackUserPrompt(parsed.inputs || []),
      outputFormat: parsed.prompts?.outputFormat || 'markdown',
    },

    config: {
      recommendedModel: parsed.config?.recommendedModel || 'any',
      useWebSearch: parsed.config?.useWebSearch || false,
      maxTokens: parsed.config?.maxTokens || 4096,
      temperature: parsed.config?.temperature || 0.4,
    },

    executionCount: 0,
  };

  return skill;
}

export async function buildMultipleSkills(
  recommendations: SkillRecommendation[],
  jdAnalysis: JDAnalysis,
  originalJD: string,
  workspaceId: string,
  apiKey: string,
  provider: 'gemini' | 'claude',
  onProgress?: (progress: BuildProgress[]) => void
): Promise<DynamicSkill[]> {
  const skills: DynamicSkill[] = [];
  const progress: BuildProgress[] = recommendations.map(r => ({
    skillId: r.id,
    skillName: r.name,
    status: 'pending'
  }));

  onProgress?.(progress);

  for (let i = 0; i < recommendations.length; i++) {
    const recommendation = recommendations[i];

    // Update progress
    progress[i].status = 'building';
    onProgress?.([...progress]);

    try {
      const skill = await buildSkill({
        recommendation,
        jdAnalysis,
        originalJD,
        workspaceId,
        apiKey,
        provider,
      });

      skills.push(skill);
      progress[i].status = 'complete';
    } catch (error) {
      console.error(`Failed to build skill ${recommendation.name}:`, error);
      progress[i].status = 'error';
      progress[i].error = error instanceof Error ? error.message : 'Unknown error';
    }

    onProgress?.([...progress]);

    // Small delay between builds to avoid rate limiting
    if (i < recommendations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return skills;
}

// Validate and normalize form inputs
function validateInputs(inputs: unknown[]): DynamicFormInput[] {
  if (!Array.isArray(inputs)) return getDefaultInputs();

  return inputs.map((input: unknown, index: number) => {
    const i = input as Record<string, unknown>;
    return {
      id: String(i.id || `input${index}`),
      label: String(i.label || `Input ${index + 1}`),
      type: validateInputType(i.type),
      placeholder: i.placeholder ? String(i.placeholder) : undefined,
      helpText: i.helpText ? String(i.helpText) : undefined,
      options: Array.isArray(i.options) ? i.options.map(String) : undefined,
      defaultValue: i.defaultValue as string | boolean | number | undefined,
      validation: i.validation as DynamicFormInput['validation'],
    };
  });
}

function validateInputType(type: unknown): DynamicFormInput['type'] {
  const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
  return validTypes.includes(String(type)) ? String(type) as DynamicFormInput['type'] : 'textarea';
}

function getDefaultInputs(): DynamicFormInput[] {
  return [
    {
      id: 'primaryInput',
      label: 'Primary Input',
      type: 'textarea',
      placeholder: 'Enter your content here...',
      validation: { required: true },
    },
    {
      id: 'additionalContext',
      label: 'Additional Context (Optional)',
      type: 'textarea',
      placeholder: 'Any additional information...',
    },
  ];
}

function generateFallbackSystemPrompt(recommendation: SkillRecommendation): string {
  return `You are an AI assistant specialized in ${recommendation.category} tasks. Your role is to help with: ${recommendation.description}

You should:
1. Provide clear, actionable output
2. Be thorough but concise
3. Use professional language appropriate for a business context
4. Structure your response for easy reading

Value you provide: ${recommendation.valueProposition}`;
}

function generateFallbackUserPrompt(inputs: unknown[]): string {
  if (!Array.isArray(inputs) || inputs.length === 0) {
    return 'Please analyze the following:\n\n{{primaryInput}}\n\nAdditional context:\n{{additionalContext}}';
  }

  let prompt = 'Please help with the following:\n\n';
  for (const input of inputs) {
    const i = input as Record<string, unknown>;
    if (i.id) {
      prompt += `## ${i.label || i.id}\n{{${i.id}}}\n\n`;
    }
  }
  return prompt;
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    }
  });

  return result.response.text() || '';
}

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}
