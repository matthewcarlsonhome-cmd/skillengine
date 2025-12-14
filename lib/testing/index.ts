/**
 * Testing Module - Developer Test Playground Infrastructure
 *
 * Provides tools for testing, grading, and optimizing AI skills and workflows.
 */

// Registry snapshot
export {
  generateRegistrySnapshot,
  getAllSkillSchemas,
  getSkillSchema,
  getAllWorkflowSchemas,
  getWorkflowSchema,
  getSkillsByCategory,
  getSkillsByRole,
  getStaticSkills,
  getUniqueCategories,
  getRegistrySnapshot,
  clearSnapshotCache,
  type SkillSchema,
  type WorkflowSchema,
  type InputFieldSchema,
  type RegistrySnapshot,
} from './registrySnapshot';

// Test case generation
export {
  generateSkillTestSuite,
  generateWorkflowTestSuite,
  generateAllSkillTestSuites,
  generateAllWorkflowTestSuites,
  type TestCase,
  type RubricCriterion,
  type SkillTestSuite,
  type WorkflowTestSuite,
} from './testCaseGenerator';

// Grading
export {
  generateGradingPrompt,
  parseGradingResponse,
  createEvalRecord,
  validateOutputStructure,
  analyzeEvalRecords,
  type CriterionScore,
  type GradingResult,
  type EvalRecord,
} from './grader';

// Storage
export {
  saveEvalRecord,
  getEvalRecordsForSkill,
  getEvalRecordsForWorkflow,
  getRecentEvalRecords,
  deleteEvalRecord,
  clearEvalRecordsForSkill,
  saveSkillTestSuite,
  getSkillTestSuite,
  getAllSkillTestSuites,
  saveWorkflowTestSuite,
  getWorkflowTestSuite,
  getAllWorkflowTestSuites,
  savePromptVersion,
  getPromptVersionsForSkill,
  getLatestPromptVersion,
  getSkillEvalStats,
  getAllSkillEvalStats,
  exportAllEvalData,
  clearAllTestingData,
  type PromptVersion,
  type SkillEvalStats,
} from './evalStorage';

// Test Runner
export {
  runSkillTests,
  runAllSkillTests,
  runStructuralValidation,
  generateTestReport,
  type TestRunResult,
  type TestSuiteResult,
  type FullTestRunResult,
  type TestRunOptions,
} from './testRunner';

// Prompt Optimizer
export {
  analyzeSkillForOptimization,
  generateOptimizationProposal,
  recordPromptOptimization,
  updatePromptVersionScore,
  findSkillsNeedingOptimization,
  generateOptimizationReport,
  validatePromptSafety,
  type OptimizationAnalysis,
  type PromptOptimizationProposal,
  type OptimizationResult,
  type OptimizationOptions,
} from './promptOptimizer';

// Default Test Data
export {
  getSkillDefaultTestData,
  getWorkflowDefaultTestData,
  hasSkillDefaultTestData,
  hasWorkflowDefaultTestData,
  getSkillsWithDefaultTestData,
  getWorkflowsWithDefaultTestData,
  applyDefaultTestDataToForm,
  extractInputIds,
  defaultTestDataToTestCase,
  createDefaultTestSuite,
  ALL_SKILL_DEFAULT_TEST_DATA,
  ALL_WORKFLOW_DEFAULT_TEST_DATA,
  JOB_SEEKER_DEFAULT_TEST_DATA,
  ENTERPRISE_DEFAULT_TEST_DATA,
  EXCEL_DEFAULT_TEST_DATA,
  WORKFLOW_DEFAULT_TEST_DATA,
  type SkillDefaultTestData,
  type WorkflowDefaultTestData,
} from './defaultTestData';
