/**
 * grader.ts - AI-Powered Output Grading System
 *
 * Uses AI to evaluate skill/workflow outputs against rubrics,
 * producing scored assessments with rationales.
 */

import type { RubricCriterion, TestCase } from './testCaseGenerator';
import { logger } from '../logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CriterionScore {
  criterionId: string;
  score: number; // 1-5 scale
  rationale: string;
  weightedScore: number;
}

export interface GradingResult {
  testCaseId: string;
  skillOrWorkflowId: string;
  timestamp: string;
  overallScore: number; // 0-100 scale
  criterionScores: CriterionScore[];
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface EvalRecord {
  id: string;
  skillId?: string;
  workflowId?: string;
  testCaseId: string;
  testType: 'happy-path' | 'edge-case' | 'variant';
  timestamp: string;
  inputPayload: Record<string, string>;
  rawOutput: string;
  gradingResult: GradingResult;
  metadata: {
    modelUsed?: string;
    executionTimeMs?: number;
    tokenCount?: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GRADING PROMPT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate the grading prompt for AI evaluation
 */
export function generateGradingPrompt(
  testCase: TestCase,
  output: string,
  skillOrWorkflowName: string
): { systemPrompt: string; userPrompt: string } {
  const criteriaList = testCase.rubric.criteria
    .map((c, i) => `${i + 1}. **${c.id}** (weight: ${(c.weight * 100).toFixed(0)}%): ${c.description}`)
    .join('\n');

  const systemPrompt = `You are an expert evaluator for AI-generated career content. Your task is to grade outputs from AI skills against specific rubrics.

GRADING SCALE (1-5):
- 5: Exceptional - Exceeds expectations, highly polished
- 4: Good - Meets expectations with minor room for improvement
- 3: Acceptable - Meets basic requirements but has clear gaps
- 2: Below Average - Partially meets requirements, significant issues
- 1: Poor - Fails to meet basic requirements

EVALUATION PRINCIPLES:
- Be objective and consistent
- Provide specific, actionable feedback
- Reference concrete examples from the output
- Consider both content quality and format
- Weight scores according to the rubric weights

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "criterionScores": [
    {
      "criterionId": "string",
      "score": number,
      "rationale": "string (2-3 sentences)"
    }
  ],
  "summary": "string (1-2 sentences overall assessment)",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"]
}`;

  const userPrompt = `# GRADING TASK

**Skill/Workflow:** ${skillOrWorkflowName}
**Test Case:** ${testCase.description}

## RUBRIC CRITERIA
${criteriaList}

## INPUT PROVIDED
\`\`\`json
${JSON.stringify(testCase.inputPayload, null, 2)}
\`\`\`

## OUTPUT TO GRADE
\`\`\`
${output}
\`\`\`

Please evaluate the output against each criterion and provide your assessment in the specified JSON format.`;

  return { systemPrompt, userPrompt };
}

// ═══════════════════════════════════════════════════════════════════════════
// GRADING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse AI grading response into structured result
 */
export function parseGradingResponse(
  response: string,
  testCase: TestCase,
  skillOrWorkflowId: string
): GradingResult {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Calculate weighted scores
    const criterionScores: CriterionScore[] = testCase.rubric.criteria.map((criterion) => {
      const scoreData = parsed.criterionScores?.find(
        (s: { criterionId: string }) => s.criterionId === criterion.id
      ) || { score: 3, rationale: 'No specific feedback provided' };

      return {
        criterionId: criterion.id,
        score: Math.min(5, Math.max(1, scoreData.score || 3)),
        rationale: scoreData.rationale || 'No rationale provided',
        weightedScore: (scoreData.score || 3) * criterion.weight,
      };
    });

    // Calculate overall score (convert 1-5 scale to 0-100)
    const totalWeightedScore = criterionScores.reduce((sum, cs) => sum + cs.weightedScore, 0);
    const maxPossible = 5; // Max score on 1-5 scale
    const overallScore = Math.round((totalWeightedScore / maxPossible) * 100);

    return {
      testCaseId: testCase.id,
      skillOrWorkflowId,
      timestamp: new Date().toISOString(),
      overallScore,
      criterionScores,
      summary: parsed.summary || 'Evaluation completed',
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    };
  } catch (error) {
    // Return default scores if parsing fails
    logger.error('Failed to parse grading response', { error: error instanceof Error ? error.message : String(error) });

    return {
      testCaseId: testCase.id,
      skillOrWorkflowId,
      timestamp: new Date().toISOString(),
      overallScore: 60,
      criterionScores: testCase.rubric.criteria.map((c) => ({
        criterionId: c.id,
        score: 3,
        rationale: 'Unable to parse AI grading response',
        weightedScore: 3 * c.weight,
      })),
      summary: 'Grading completed with parsing errors',
      strengths: [],
      improvements: ['Unable to extract detailed feedback from grading response'],
    };
  }
}

/**
 * Create an eval record from a grading result
 */
export function createEvalRecord(
  skillId: string | undefined,
  workflowId: string | undefined,
  testCase: TestCase,
  output: string,
  gradingResult: GradingResult,
  metadata: EvalRecord['metadata'] = {}
): EvalRecord {
  return {
    id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    skillId,
    workflowId,
    testCaseId: testCase.id,
    testType: testCase.type,
    timestamp: new Date().toISOString(),
    inputPayload: testCase.inputPayload,
    rawOutput: output,
    gradingResult,
    metadata,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK STRUCTURAL VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Perform quick structural validation without AI
 */
export function validateOutputStructure(output: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for empty output
  if (!output || output.trim().length === 0) {
    issues.push('Output is empty');
    return { isValid: false, issues };
  }

  // Check minimum length
  if (output.length < 100) {
    issues.push('Output is suspiciously short (< 100 characters)');
  }

  // Check for error indicators
  const errorPatterns = [
    /error/i,
    /failed/i,
    /unable to/i,
    /cannot process/i,
    /invalid/i,
  ];

  for (const pattern of errorPatterns) {
    if (pattern.test(output.substring(0, 200))) {
      issues.push(`Output may contain an error message: "${output.substring(0, 100)}..."`);
    }
  }

  // Check for markdown structure (most outputs should have some)
  const hasHeadings = /^#+\s/m.test(output);
  const hasBullets = /^[-*]\s/m.test(output);
  const hasNumberedList = /^\d+\.\s/m.test(output);

  if (!hasHeadings && !hasBullets && !hasNumberedList && output.length > 500) {
    issues.push('Long output lacks structural elements (headings, bullets, lists)');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze eval records to find patterns and issues
 */
export function analyzeEvalRecords(records: EvalRecord[]): {
  averageScore: number;
  scoresByType: Record<string, number>;
  commonIssues: string[];
  consistentStrengths: string[];
  criterionAverages: Record<string, number>;
} {
  if (records.length === 0) {
    return {
      averageScore: 0,
      scoresByType: {},
      commonIssues: [],
      consistentStrengths: [],
      criterionAverages: {},
    };
  }

  // Calculate average score
  const averageScore =
    records.reduce((sum, r) => sum + r.gradingResult.overallScore, 0) / records.length;

  // Group scores by test type
  const scoresByType: Record<string, number[]> = {};
  for (const record of records) {
    if (!scoresByType[record.testType]) {
      scoresByType[record.testType] = [];
    }
    scoresByType[record.testType].push(record.gradingResult.overallScore);
  }

  const avgScoresByType: Record<string, number> = {};
  for (const [type, scores] of Object.entries(scoresByType)) {
    avgScoresByType[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Find common improvements (issues that appear in >50% of records)
  const improvementCounts: Record<string, number> = {};
  for (const record of records) {
    for (const improvement of record.gradingResult.improvements) {
      improvementCounts[improvement] = (improvementCounts[improvement] || 0) + 1;
    }
  }

  const commonIssues = Object.entries(improvementCounts)
    .filter(([, count]) => count > records.length * 0.5)
    .map(([issue]) => issue);

  // Find consistent strengths (appear in >50% of records)
  const strengthCounts: Record<string, number> = {};
  for (const record of records) {
    for (const strength of record.gradingResult.strengths) {
      strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
    }
  }

  const consistentStrengths = Object.entries(strengthCounts)
    .filter(([, count]) => count > records.length * 0.5)
    .map(([strength]) => strength);

  // Calculate criterion averages
  const criterionScores: Record<string, number[]> = {};
  for (const record of records) {
    for (const cs of record.gradingResult.criterionScores) {
      if (!criterionScores[cs.criterionId]) {
        criterionScores[cs.criterionId] = [];
      }
      criterionScores[cs.criterionId].push(cs.score);
    }
  }

  const criterionAverages: Record<string, number> = {};
  for (const [criterion, scores] of Object.entries(criterionScores)) {
    criterionAverages[criterion] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  return {
    averageScore,
    scoresByType: avgScoresByType,
    commonIssues,
    consistentStrengths,
    criterionAverages,
  };
}
