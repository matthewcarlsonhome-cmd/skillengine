/**
 * Recursive Self-Improvement Types
 *
 * This module defines the types for the skill self-improvement system.
 * Skills track user feedback, and when enough grades are collected,
 * the system analyzes patterns and suggests/implements prompt improvements.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SKILL VERSION STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillVersion {
  id: string;
  skillId: string;
  version: number;

  // Prompt content at this version
  systemInstruction: string;
  userPromptTemplate: string;

  // Version metadata
  createdAt: string;
  createdBy: 'system' | 'user' | 'ai-improvement';
  changeReason?: string;

  // Aggregate scores for this version
  scores: SkillVersionScores;

  // Whether this is the active version
  isActive: boolean;

  // Reference to previous version (for rollback)
  previousVersionId?: string;
}

export interface SkillVersionScores {
  // Number of times this version was graded
  gradeCount: number;

  // Required grades before improvement is triggered
  requiredGrades: number;

  // Aggregate scores (0-5 scale)
  averageOverallScore: number;

  // Dimension-specific scores
  dimensionScores: DimensionScore[];

  // Improvement eligibility
  improvementThreshold: number; // Score below which improvement is triggered
  lastGradedAt?: string;
}

export interface DimensionScore {
  dimension: QualityDimension;
  averageScore: number;
  gradeCount: number;
}

export type QualityDimension =
  | 'relevance'      // Output matches the user's intent
  | 'accuracy'       // Information is correct and reliable
  | 'completeness'   // All aspects of the request are addressed
  | 'clarity'        // Output is clear and well-organized
  | 'actionability'  // Output provides actionable guidance
  | 'professionalism'; // Tone and format are professional

// ═══════════════════════════════════════════════════════════════════════════
// USER FEEDBACK / GRADING
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillGrade {
  id: string;
  skillId: string;
  skillVersionId: string;
  userId: string;

  // Execution context
  executionId: string;
  inputsHash: string; // Hash of inputs for deduplication

  // Scores (1-5 scale)
  overallScore: number;
  dimensionScores: {
    dimension: QualityDimension;
    score: number;
  }[];

  // Qualitative feedback
  feedback?: string;
  improvementSuggestion?: string;

  // What the user expected vs what they got
  expectedOutput?: string;
  wasOutputUsed: boolean; // Did user copy/use the output?

  // Timestamps
  gradedAt: string;
  executedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPROVEMENT TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export interface ImprovementRequest {
  id: string;
  skillId: string;
  skillVersionId: string;

  // Trigger information
  triggeredAt: string;
  triggerReason: ImprovementTrigger;

  // Analysis of issues
  issueAnalysis: IssueAnalysis;

  // Proposed changes
  proposedChanges: ProposedChange[];

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'implemented' | 'rolled-back';

  // If implemented, link to new version
  newVersionId?: string;

  // Review information
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export type ImprovementTrigger =
  | 'low-score-threshold'     // Average score fell below threshold
  | 'dimension-weakness'      // Specific dimension consistently weak
  | 'user-feedback-pattern'   // Common feedback themes detected
  | 'manual-request'          // Admin requested improvement
  | 'periodic-review';        // Scheduled improvement cycle

export interface IssueAnalysis {
  // Pattern detection from grades
  commonIssues: string[];
  weakestDimensions: QualityDimension[];

  // Feedback themes (extracted via NLP)
  feedbackThemes: {
    theme: string;
    frequency: number;
    exampleFeedback: string[];
  }[];

  // Statistical summary
  sampleSize: number;
  averageScore: number;
  scoreDistribution: { score: number; count: number }[];

  // Comparison to other skills
  performancePercentile: number;
}

export interface ProposedChange {
  id: string;
  changeType: 'system-instruction' | 'user-prompt' | 'input-field' | 'config';

  // What's changing
  field: string;
  oldValue: string;
  newValue: string;

  // Explanation
  rationale: string;
  expectedImpact: string;

  // Confidence
  confidence: 'high' | 'medium' | 'low';
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPROVEMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export interface ImprovementConfig {
  // How many grades before improvement can be considered
  minGradesForImprovement: number;

  // Score threshold (0-5) below which improvement is triggered
  improvementThreshold: number;

  // Whether to auto-implement or require review
  autoImplement: boolean;

  // Maximum improvement iterations per period
  maxImprovementsPerWeek: number;

  // Rollback settings
  rollbackThreshold: number; // If new version scores worse, rollback
  rollbackGraceGrades: number; // Grades to wait before rollback decision

  // Dimension weights for overall score
  dimensionWeights: {
    [key in QualityDimension]: number;
  };
}

export const DEFAULT_IMPROVEMENT_CONFIG: ImprovementConfig = {
  minGradesForImprovement: 10,
  improvementThreshold: 3.5, // Below 3.5/5 triggers improvement
  autoImplement: false,
  maxImprovementsPerWeek: 2,
  rollbackThreshold: 0.3, // Rollback if new version is 0.3+ worse
  rollbackGraceGrades: 5,
  dimensionWeights: {
    relevance: 0.25,
    accuracy: 0.20,
    completeness: 0.15,
    clarity: 0.15,
    actionability: 0.15,
    professionalism: 0.10,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// IMPROVEMENT ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillImprovementHistory {
  skillId: string;
  skillName: string;

  // Version history
  versions: SkillVersionSummary[];

  // Overall trajectory
  scoreTrajectory: { date: string; score: number }[];

  // Improvement stats
  totalImprovements: number;
  successfulImprovements: number;
  rolledBackImprovements: number;

  // Current status
  currentVersion: number;
  currentScore: number;
  gradesUntilNextReview: number;
}

export interface SkillVersionSummary {
  versionId: string;
  version: number;
  createdAt: string;
  averageScore: number;
  gradeCount: number;
  changeReason?: string;
  wasRolledBack: boolean;
}
