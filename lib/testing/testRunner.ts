/**
 * testRunner.ts - Automated Test Runner for Skills and Workflows
 *
 * Runs test suites against all skills and workflows, validating outputs
 * and optionally running the grading pass.
 */

import {
  getAllSkillSchemas,
  getAllWorkflowSchemas,
  getSkillSchema,
  type SkillSchema,
  type WorkflowSchema,
} from './registrySnapshot';
import {
  generateSkillTestSuite,
  generateWorkflowTestSuite,
  type TestCase,
  type SkillTestSuite,
  type WorkflowTestSuite,
} from './testCaseGenerator';
import {
  generateGradingPrompt,
  parseGradingResponse,
  createEvalRecord,
  validateOutputStructure,
  type EvalRecord,
} from './grader';
import {
  saveEvalRecord,
  saveSkillTestSuite,
  getSkillTestSuite,
  getWorkflowTestSuite,
  saveWorkflowTestSuite,
} from './evalStorage';
import { SKILLS } from '../skills/static';
import { callGeminiAPI } from './apiHelper';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TestRunResult {
  skillId?: string;
  workflowId?: string;
  testCaseId: string;
  testType: string;
  status: 'passed' | 'failed' | 'error' | 'skipped';
  structuralValidation: {
    passed: boolean;
    issues: string[];
  };
  output?: string;
  errorMessage?: string;
  executionTimeMs: number;
  evalRecord?: EvalRecord;
}

export interface TestSuiteResult {
  itemId: string;
  itemName: string;
  itemType: 'skill' | 'workflow';
  totalTests: number;
  passed: number;
  failed: number;
  errors: number;
  skipped: number;
  testResults: TestRunResult[];
  overallStatus: 'passed' | 'failed' | 'error';
  averageScore?: number;
}

export interface FullTestRunResult {
  startTime: string;
  endTime: string;
  totalDurationMs: number;
  summary: {
    totalItems: number;
    totalTests: number;
    passed: number;
    failed: number;
    errors: number;
    skipped: number;
  };
  suiteResults: TestSuiteResult[];
}

export interface TestRunOptions {
  apiKey: string;
  modelId?: string;
  skillIds?: string[]; // If not provided, runs all skills
  workflowIds?: string[]; // If not provided, runs all workflows
  testTypes?: ('happy-path' | 'edge-case' | 'variant')[]; // Filter test types
  runGrading?: boolean; // Whether to run AI grading (slower)
  onProgress?: (progress: { completed: number; total: number; current: string }) => void;
  onTestComplete?: (result: TestRunResult) => void;
  concurrency?: number; // Max parallel tests (default 1 for rate limiting)
  delayBetweenTests?: number; // Delay in ms between tests (default 1000)
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run a single skill test case
 */
async function runSkillTest(
  skill: SkillSchema,
  testCase: TestCase,
  options: TestRunOptions
): Promise<TestRunResult> {
  const startTime = Date.now();

  try {
    // Check if skill exists in static skills
    const skillDef = SKILLS[skill.id];

    if (!skillDef) {
      // For role-based skills, we don't have the skill definition loaded
      // Skip with a message
      return {
        skillId: skill.id,
        testCaseId: testCase.id,
        testType: testCase.type,
        status: 'skipped',
        structuralValidation: { passed: true, issues: [] },
        errorMessage: 'Role-based skill not loaded in static registry',
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Generate prompt
    const { systemInstruction, userPrompt } = skillDef.generatePrompt(testCase.inputPayload);

    // Call API
    const result = await callGeminiAPI(
      systemInstruction,
      userPrompt,
      options.apiKey,
      options.modelId || 'gemini-1.5-flash-latest'
    );

    const output = result.response;
    const executionTimeMs = Date.now() - startTime;

    // Validate structure
    const structuralValidation = validateOutputStructure(output);

    // Determine pass/fail based on structural validation
    const status = structuralValidation.passed ? 'passed' : 'failed';

    const testResult: TestRunResult = {
      skillId: skill.id,
      testCaseId: testCase.id,
      testType: testCase.type,
      status,
      structuralValidation: {
        passed: structuralValidation.isValid,
        issues: structuralValidation.issues,
      },
      output,
      executionTimeMs,
    };

    // Optionally run grading
    if (options.runGrading) {
      const { systemPrompt, userPrompt: gradingPrompt } = generateGradingPrompt(
        testCase,
        output,
        skill.name
      );

      const gradingResult = await callGeminiAPI(
        systemPrompt,
        gradingPrompt,
        options.apiKey,
        options.modelId || 'gemini-1.5-flash-latest'
      );

      const parsedGrading = parseGradingResponse(gradingResult.response, testCase, skill.id);

      const evalRecord = createEvalRecord(
        skill.id,
        undefined,
        testCase,
        output,
        parsedGrading,
        { executionTimeMs, modelUsed: options.modelId || 'gemini-1.5-flash-latest' }
      );

      await saveEvalRecord(evalRecord);
      testResult.evalRecord = evalRecord;
    }

    return testResult;
  } catch (error) {
    return {
      skillId: skill.id,
      testCaseId: testCase.id,
      testType: testCase.type,
      status: 'error',
      structuralValidation: { passed: false, issues: [] },
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: Date.now() - startTime,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Run tests for a single skill
 */
export async function runSkillTests(
  skillId: string,
  options: TestRunOptions
): Promise<TestSuiteResult> {
  const skill = getSkillSchema(skillId);
  if (!skill) {
    return {
      itemId: skillId,
      itemName: 'Unknown Skill',
      itemType: 'skill',
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: 0,
      skipped: 1,
      testResults: [],
      overallStatus: 'error',
    };
  }

  // Get or generate test suite
  let testSuite = await getSkillTestSuite(skillId);
  if (!testSuite) {
    testSuite = generateSkillTestSuite(skill);
    await saveSkillTestSuite(testSuite);
  }

  // Filter test cases by type if specified
  let testCases = testSuite.tests;
  if (options.testTypes && options.testTypes.length > 0) {
    testCases = testCases.filter((tc) => options.testTypes!.includes(tc.type));
  }

  const testResults: TestRunResult[] = [];
  let passed = 0;
  let failed = 0;
  let errors = 0;
  let skipped = 0;
  let totalScore = 0;
  let scoredCount = 0;

  for (const testCase of testCases) {
    const result = await runSkillTest(skill, testCase, options);
    testResults.push(result);

    switch (result.status) {
      case 'passed':
        passed++;
        break;
      case 'failed':
        failed++;
        break;
      case 'error':
        errors++;
        break;
      case 'skipped':
        skipped++;
        break;
    }

    if (result.evalRecord) {
      totalScore += result.evalRecord.gradingResult.overallScore;
      scoredCount++;
    }

    options.onTestComplete?.(result);

    // Delay between tests to avoid rate limiting
    if (options.delayBetweenTests) {
      await sleep(options.delayBetweenTests);
    }
  }

  return {
    itemId: skillId,
    itemName: skill.name,
    itemType: 'skill',
    totalTests: testCases.length,
    passed,
    failed,
    errors,
    skipped,
    testResults,
    overallStatus: errors > 0 ? 'error' : failed > 0 ? 'failed' : 'passed',
    averageScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : undefined,
  };
}

/**
 * Run all skill tests
 */
export async function runAllSkillTests(options: TestRunOptions): Promise<FullTestRunResult> {
  const startTime = new Date();
  const allSkills = getAllSkillSchemas();

  // Filter to static skills only (we can't run role-based skills without full loading)
  const staticSkills = allSkills.filter((s) => s.source === 'static');

  // Filter by specific IDs if provided
  const skillsToTest = options.skillIds
    ? staticSkills.filter((s) => options.skillIds!.includes(s.id))
    : staticSkills;

  const suiteResults: TestSuiteResult[] = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalErrors = 0;
  let totalSkipped = 0;

  for (let i = 0; i < skillsToTest.length; i++) {
    const skill = skillsToTest[i];

    options.onProgress?.({
      completed: i,
      total: skillsToTest.length,
      current: skill.name,
    });

    const result = await runSkillTests(skill.id, options);
    suiteResults.push(result);

    totalTests += result.totalTests;
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalErrors += result.errors;
    totalSkipped += result.skipped;
  }

  const endTime = new Date();

  return {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    totalDurationMs: endTime.getTime() - startTime.getTime(),
    summary: {
      totalItems: skillsToTest.length,
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      errors: totalErrors,
      skipped: totalSkipped,
    },
    suiteResults,
  };
}

/**
 * Quick structural validation run (no AI calls)
 */
export async function runStructuralValidation(
  skillId: string
): Promise<{ passed: boolean; issues: string[] }> {
  const skill = getSkillSchema(skillId);
  if (!skill) {
    return { passed: false, issues: ['Skill not found'] };
  }

  const skillDef = SKILLS[skillId];
  if (!skillDef) {
    return { passed: false, issues: ['Skill definition not loaded'] };
  }

  // Just verify the skill can generate a prompt without errors
  try {
    const testInputs: Record<string, string> = {};
    for (const input of skill.inputs) {
      if (input.required) {
        testInputs[input.id] = input.type === 'select' ? (input.options?.[0] || 'test') : 'test';
      }
    }

    const { systemInstruction, userPrompt } = skillDef.generatePrompt(testInputs);

    const issues: string[] = [];

    if (!systemInstruction || systemInstruction.length < 100) {
      issues.push('System instruction is too short or missing');
    }

    if (!userPrompt || userPrompt.length < 20) {
      issues.push('User prompt is too short or missing');
    }

    return { passed: issues.length === 0, issues };
  } catch (error) {
    return {
      passed: false,
      issues: [`Prompt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Generate test report as markdown
 */
export function generateTestReport(result: FullTestRunResult): string {
  const lines: string[] = [];

  lines.push('# Skill Test Run Report');
  lines.push('');
  lines.push(`**Run Time:** ${result.startTime} to ${result.endTime}`);
  lines.push(`**Duration:** ${(result.totalDurationMs / 1000).toFixed(1)}s`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Skills | ${result.summary.totalItems} |`);
  lines.push(`| Total Tests | ${result.summary.totalTests} |`);
  lines.push(`| Passed | ${result.summary.passed} |`);
  lines.push(`| Failed | ${result.summary.failed} |`);
  lines.push(`| Errors | ${result.summary.errors} |`);
  lines.push(`| Skipped | ${result.summary.skipped} |`);
  lines.push('');

  lines.push('## Results by Skill');
  lines.push('');

  for (const suite of result.suiteResults) {
    const statusEmoji = suite.overallStatus === 'passed' ? '✅' : suite.overallStatus === 'failed' ? '❌' : '⚠️';

    lines.push(`### ${statusEmoji} ${suite.itemName}`);
    lines.push('');
    lines.push(`- Passed: ${suite.passed}/${suite.totalTests}`);

    if (suite.averageScore !== undefined) {
      lines.push(`- Average Score: ${suite.averageScore}/100`);
    }

    if (suite.failed > 0 || suite.errors > 0) {
      lines.push('');
      lines.push('**Issues:**');

      for (const test of suite.testResults) {
        if (test.status === 'failed' || test.status === 'error') {
          lines.push(`- [${test.testType}] ${test.errorMessage || test.structuralValidation.issues.join(', ')}`);
        }
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}
