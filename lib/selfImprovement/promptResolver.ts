/**
 * Prompt Resolver
 *
 * Resolves skill prompts from the registry, falling back to code-defined prompts
 * if the skill isn't registered or if the registry is unavailable.
 *
 * This enables the self-improvement system: when prompts are improved via AI,
 * the improved versions are stored in the registry and served to users.
 */

import { getSkillPrompt, skillExistsInRegistry } from './supabaseGrading';
import { logger } from '../logger';

export interface ResolvedPrompt {
  systemInstruction: string;
  userPrompt: string;
  version: number;
  source: 'registry' | 'fallback';
}

/**
 * Get the effective prompt for a skill, preferring registry over code-defined
 *
 * @param skillId - The skill identifier
 * @param fallbackPrompt - The code-defined prompt to use if registry is unavailable
 * @param interpolatedUserPrompt - If provided, use this as the user prompt (already interpolated)
 */
export async function getEffectivePrompt(
  skillId: string,
  fallbackPrompt: {
    systemInstruction: string;
    userPrompt: string;
  },
  interpolatedUserPrompt?: string
): Promise<ResolvedPrompt> {
  try {
    // Try to get improved prompt from Supabase registry
    const registryPrompt = await getSkillPrompt(skillId);

    if (registryPrompt) {
      return {
        systemInstruction: registryPrompt.systemInstruction,
        // For user prompt: use the interpolated version if provided,
        // otherwise use the template from registry (caller needs to interpolate)
        userPrompt: interpolatedUserPrompt || registryPrompt.userPromptTemplate,
        version: registryPrompt.version,
        source: 'registry',
      };
    }
  } catch (err) {
    logger.warn(`Failed to fetch prompt from registry for ${skillId}`, { error: err instanceof Error ? err.message : String(err) });
  }

  // Fall back to code-defined prompt
  return {
    systemInstruction: fallbackPrompt.systemInstruction,
    userPrompt: interpolatedUserPrompt || fallbackPrompt.userPrompt,
    version: 1,
    source: 'fallback',
  };
}

/**
 * Check if a skill has an improved version in the registry
 */
export async function hasImprovedPrompt(skillId: string): Promise<boolean> {
  try {
    const prompt = await getSkillPrompt(skillId);
    return prompt !== null && prompt.version > 1;
  } catch {
    return false;
  }
}

/**
 * Get prompt version for a skill
 */
export async function getPromptVersion(skillId: string): Promise<number> {
  try {
    const prompt = await getSkillPrompt(skillId);
    return prompt?.version ?? 1;
  } catch {
    return 1;
  }
}

/**
 * Interpolate a template with values
 * Replaces {{key}} placeholders with corresponding values
 */
export function interpolateTemplate(
  template: string,
  values: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = values[key];
    if (value === undefined || value === null) {
      return match; // Keep placeholder if value not found
    }
    return String(value);
  });
}

/**
 * Higher-order function to create a prompt generator that uses the registry
 *
 * @param skillId - The skill identifier
 * @param codeDefinedGenerator - The original generatePrompt function from code
 */
export function createRegistryAwarePromptGenerator(
  skillId: string,
  codeDefinedGenerator: (inputs: Record<string, unknown>) => {
    systemInstruction: string;
    userPrompt: string;
  }
): (inputs: Record<string, unknown>) => Promise<ResolvedPrompt> {
  return async (inputs: Record<string, unknown>) => {
    // First, generate the code-defined prompt (for fallback and interpolation)
    const codePrompt = codeDefinedGenerator(inputs);

    // Try to get improved system instruction from registry
    // but use the interpolated user prompt from code
    return getEffectivePrompt(skillId, codePrompt, codePrompt.userPrompt);
  };
}
