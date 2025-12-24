/**
 * promptOptimizer.ts - Recursive System Prompt Optimization
 *
 * Analyzes evaluation records to identify systematic issues and proposes
 * targeted improvements to skill system prompts.
 */

import {
  getEvalRecordsForSkill,
  getPromptVersionsForSkill,
  savePromptVersion,
  getSkillEvalStats,
  type PromptVersion,
  type SkillEvalStats,
} from './evalStorage';
import { analyzeEvalRecords, type EvalRecord } from './grader';
import type { SkillSchema } from './registrySnapshot';
import { SKILLS } from '../skills/static';
import { callGeminiAPI } from './apiHelper';
import { logger } from '../logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface OptimizationAnalysis {
  skillId: string;
  skillName: string;
  evalCount: number;
  averageScore: number;
  scoresByType: Record<string, number>;
  criterionAverages: Record<string, number>;
  weakestCriteria: { id: string; score: number }[];
  commonIssues: string[];
  consistentStrengths: string[];
  recommendsOptimization: boolean;
  reason: string;
}

export interface PromptOptimizationProposal {
  skillId: string;
  currentPromptSummary: string;
  proposedChanges: {
    section: string;
    change: string;
    rationale: string;
  }[];
  expectedImprovements: string[];
  risks: string[];
  proposedPrompt: string;
}

export interface OptimizationResult {
  skillId: string;
  success: boolean;
  previousScore: number;
  newScore?: number;
  improvement?: number;
  changeDescription: string;
  promptVersion?: PromptVersion;
  errorMessage?: string;
}

export interface OptimizationOptions {
  apiKey: string;
  modelId?: string;
  minEvalCount?: number; // Minimum evals before optimization (default 3)
  minScoreThreshold?: number; // Only optimize if below this score (default 75)
  skipIfImproving?: boolean; // Skip if trend is already improving
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze a skill's evaluation records to determine if optimization is needed
 */
export async function analyzeSkillForOptimization(
  skillId: string,
  options: OptimizationOptions
): Promise<OptimizationAnalysis> {
  const records = await getEvalRecordsForSkill(skillId);
  const stats = await getSkillEvalStats(skillId);
  const skill = SKILLS[skillId];

  const minEvalCount = options.minEvalCount ?? 3;
  const minScoreThreshold = options.minScoreThreshold ?? 75;

  // Default analysis for insufficient data
  if (records.length < minEvalCount) {
    return {
      skillId,
      skillName: skill?.name || skillId,
      evalCount: records.length,
      averageScore: stats.averageScore,
      scoresByType: stats.scoresByType,
      criterionAverages: {},
      weakestCriteria: [],
      commonIssues: [],
      consistentStrengths: [],
      recommendsOptimization: false,
      reason: `Insufficient evaluations (${records.length}/${minEvalCount} required)`,
    };
  }

  // Analyze the records
  const analysis = analyzeEvalRecords(records);

  // Find weakest criteria
  const weakestCriteria = Object.entries(analysis.criterionAverages)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Determine if optimization is recommended
  let recommendsOptimization = false;
  let reason = '';

  if (stats.averageScore < minScoreThreshold) {
    recommendsOptimization = true;
    reason = `Average score (${stats.averageScore}) is below threshold (${minScoreThreshold})`;
  } else if (stats.trend === 'declining') {
    recommendsOptimization = true;
    reason = 'Score trend is declining';
  } else if (weakestCriteria.length > 0 && weakestCriteria[0].score < 3) {
    recommendsOptimization = true;
    reason = `Critical weakness in '${weakestCriteria[0].id}' criterion (score: ${weakestCriteria[0].score.toFixed(1)})`;
  } else if (options.skipIfImproving && stats.trend === 'improving') {
    reason = 'Trend is already improving, skipping optimization';
  } else {
    reason = 'Skill is performing adequately';
  }

  return {
    skillId,
    skillName: skill?.name || skillId,
    evalCount: records.length,
    averageScore: stats.averageScore,
    scoresByType: stats.scoresByType,
    criterionAverages: analysis.criterionAverages,
    weakestCriteria,
    commonIssues: analysis.commonIssues,
    consistentStrengths: analysis.consistentStrengths,
    recommendsOptimization,
    reason,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// OPTIMIZATION PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate the prompt for AI-assisted prompt optimization
 */
function generateOptimizationPrompt(
  analysis: OptimizationAnalysis,
  currentPrompt: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are an expert prompt engineer specializing in optimizing AI system prompts for career and job search tools.

Your task is to analyze evaluation feedback and propose targeted improvements to a skill's system prompt.

OPTIMIZATION PRINCIPLES:
1. Make small, focused changes that address specific issues
2. Preserve what's working well (identified strengths)
3. Address the weakest evaluation criteria first
4. Maintain the overall structure and tone
5. Never remove safety guidelines or ethical constraints
6. Keep changes explainable and reversible

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "currentPromptSummary": "Brief summary of current prompt approach (1-2 sentences)",
  "proposedChanges": [
    {
      "section": "Which part of the prompt to modify",
      "change": "Specific change to make",
      "rationale": "Why this change addresses the identified issue"
    }
  ],
  "expectedImprovements": ["List of expected improvements"],
  "risks": ["Any potential risks or trade-offs"],
  "proposedPrompt": "The complete new prompt with changes applied"
}`;

  const userPrompt = `# PROMPT OPTIMIZATION TASK

## Skill Information
**Skill ID:** ${analysis.skillId}
**Skill Name:** ${analysis.skillName}

## Evaluation Analysis
- **Total Evaluations:** ${analysis.evalCount}
- **Average Score:** ${analysis.averageScore}/100
- **Recommendation:** ${analysis.recommendsOptimization ? 'OPTIMIZE' : 'MAINTAIN'}
- **Reason:** ${analysis.reason}

## Criterion Scores (Lower = Priority for Improvement)
${analysis.weakestCriteria.map((c) => `- ${c.id}: ${c.score.toFixed(2)}/5`).join('\n')}

## Common Issues Identified
${analysis.commonIssues.length > 0 ? analysis.commonIssues.map((i) => `- ${i}`).join('\n') : '- No common issues identified'}

## Consistent Strengths (Preserve These)
${analysis.consistentStrengths.length > 0 ? analysis.consistentStrengths.map((s) => `- ${s}`).join('\n') : '- No consistent strengths identified'}

## Current System Prompt
\`\`\`
${currentPrompt}
\`\`\`

Please analyze the evaluation feedback and propose targeted improvements to address the identified weaknesses while preserving the strengths.`;

  return { systemPrompt, userPrompt };
}

// ═══════════════════════════════════════════════════════════════════════════
// OPTIMIZATION EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate an optimization proposal for a skill
 */
export async function generateOptimizationProposal(
  skillId: string,
  options: OptimizationOptions
): Promise<PromptOptimizationProposal | null> {
  const skill = SKILLS[skillId];
  if (!skill) {
    logger.error(`Skill not found: ${skillId}`);
    return null;
  }

  // Analyze the skill
  const analysis = await analyzeSkillForOptimization(skillId, options);

  if (!analysis.recommendsOptimization) {
    logger.info(`Optimization not recommended for ${skillId}: ${analysis.reason}`);
    return null;
  }

  // Get current prompt (use a sample input to generate it)
  const sampleInputs: Record<string, string> = {};
  for (const input of skill.inputs) {
    sampleInputs[input.id] = input.type === 'select' ? (input.options?.[0] || 'sample') : 'sample';
  }

  const { systemInstruction } = skill.generatePrompt(sampleInputs);

  // Generate optimization prompt
  const { systemPrompt, userPrompt } = generateOptimizationPrompt(analysis, systemInstruction);

  try {
    const result = await callGeminiAPI(
      systemPrompt,
      userPrompt,
      options.apiKey,
      options.modelId || 'gemini-1.5-flash-latest'
    );

    // Parse the response
    let parsed;
    try {
      let jsonStr = result.response;
      const jsonMatch = result.response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      parsed = JSON.parse(jsonStr);
    } catch {
      logger.error('Failed to parse optimization response');
      return null;
    }

    return {
      skillId,
      currentPromptSummary: parsed.currentPromptSummary || 'Unable to summarize',
      proposedChanges: parsed.proposedChanges || [],
      expectedImprovements: parsed.expectedImprovements || [],
      risks: parsed.risks || [],
      proposedPrompt: parsed.proposedPrompt || '',
    };
  } catch (error) {
    logger.error('Optimization generation failed', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Record a prompt version after optimization
 */
export async function recordPromptOptimization(
  skillId: string,
  newPrompt: string,
  changeDescription: string,
  evalScoreBefore: number
): Promise<PromptVersion> {
  const versions = await getPromptVersionsForSkill(skillId);
  const nextVersion = versions.length + 1;

  const version: PromptVersion = {
    id: `prompt-${skillId}-v${nextVersion}-${Date.now()}`,
    skillId,
    version: nextVersion,
    timestamp: new Date().toISOString(),
    promptContent: newPrompt,
    changeDescription,
    evalScoreBefore,
  };

  await savePromptVersion(version);
  return version;
}

/**
 * Update the eval score after re-testing
 */
export async function updatePromptVersionScore(
  versionId: string,
  evalScoreAfter: number
): Promise<void> {
  const versions = await getPromptVersionsForSkill(versionId.split('-')[1]);
  const version = versions.find((v) => v.id === versionId);

  if (version) {
    version.evalScoreAfter = evalScoreAfter;
    await savePromptVersion(version);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze all skills and return those needing optimization
 */
export async function findSkillsNeedingOptimization(
  options: OptimizationOptions
): Promise<OptimizationAnalysis[]> {
  const staticSkillIds = Object.keys(SKILLS);
  const analyses: OptimizationAnalysis[] = [];

  for (const skillId of staticSkillIds) {
    const analysis = await analyzeSkillForOptimization(skillId, options);
    if (analysis.recommendsOptimization) {
      analyses.push(analysis);
    }
  }

  // Sort by average score (lowest first)
  analyses.sort((a, b) => a.averageScore - b.averageScore);

  return analyses;
}

/**
 * Generate optimization report
 */
export function generateOptimizationReport(
  analyses: OptimizationAnalysis[]
): string {
  const lines: string[] = [];

  lines.push('# Skill Optimization Analysis Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Skills Analyzed:** ${analyses.length} skills need optimization`);
  lines.push('');

  if (analyses.length === 0) {
    lines.push('All skills are performing adequately. No optimization needed.');
    return lines.join('\n');
  }

  lines.push('## Skills Requiring Optimization');
  lines.push('');

  for (const analysis of analyses) {
    lines.push(`### ${analysis.skillName}`);
    lines.push('');
    lines.push(`- **Skill ID:** ${analysis.skillId}`);
    lines.push(`- **Average Score:** ${analysis.averageScore}/100`);
    lines.push(`- **Evaluations:** ${analysis.evalCount}`);
    lines.push(`- **Reason:** ${analysis.reason}`);
    lines.push('');

    if (analysis.weakestCriteria.length > 0) {
      lines.push('**Weakest Criteria:**');
      for (const criterion of analysis.weakestCriteria) {
        lines.push(`- ${criterion.id}: ${criterion.score.toFixed(2)}/5`);
      }
      lines.push('');
    }

    if (analysis.commonIssues.length > 0) {
      lines.push('**Common Issues:**');
      for (const issue of analysis.commonIssues) {
        lines.push(`- ${issue}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// SAFETY CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate that a proposed prompt doesn't remove safety constraints
 */
export function validatePromptSafety(
  originalPrompt: string,
  proposedPrompt: string
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for safety-related keywords that should be preserved
  const safetyKeywords = [
    'ethical',
    'appropriate',
    'professional',
    'respectful',
    'accurate',
    'honest',
    'not provide',
    'cannot',
    'should not',
    'must not',
    'avoid',
    'never',
    'legal',
    'medical',
    'financial advice',
  ];

  for (const keyword of safetyKeywords) {
    const inOriginal = originalPrompt.toLowerCase().includes(keyword.toLowerCase());
    const inProposed = proposedPrompt.toLowerCase().includes(keyword.toLowerCase());

    if (inOriginal && !inProposed) {
      issues.push(`Safety keyword "${keyword}" was present in original but missing in proposed prompt`);
    }
  }

  // Check minimum length (prompt shouldn't be drastically shortened)
  if (proposedPrompt.length < originalPrompt.length * 0.5) {
    issues.push('Proposed prompt is less than 50% the length of the original');
  }

  // Check that key structural elements remain
  const structuralElements = ['##', '**', '- ', '1.'];
  for (const element of structuralElements) {
    const originalCount = (originalPrompt.match(new RegExp(element, 'g')) || []).length;
    const proposedCount = (proposedPrompt.match(new RegExp(element, 'g')) || []).length;

    if (originalCount > 0 && proposedCount === 0) {
      issues.push(`Structural element "${element}" was removed from prompt`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
