/**
 * Self-Improvement Engine
 *
 * Core logic for the recursive skill self-improvement system.
 * Analyzes user grades, detects patterns, and generates prompt improvements.
 */

import type {
  SkillVersion,
  SkillGrade,
  ImprovementRequest,
  ImprovementConfig,
  IssueAnalysis,
  ProposedChange,
  QualityDimension,
  ImprovementTrigger,
  SkillImprovementHistory,
} from './types';
import { DEFAULT_IMPROVEMENT_CONFIG } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// GRADE STORAGE AND AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Store a new grade for a skill execution
 */
export async function recordGrade(
  grade: Omit<SkillGrade, 'id' | 'gradedAt'>
): Promise<SkillGrade> {
  const storedGrade: SkillGrade = {
    ...grade,
    id: generateId(),
    gradedAt: new Date().toISOString(),
  };

  // Store in local storage (would be Supabase in production)
  const grades = getStoredGrades();
  grades.push(storedGrade);
  localStorage.setItem('skill_grades', JSON.stringify(grades));

  // Check if improvement should be triggered
  await checkImprovementTrigger(grade.skillId, grade.skillVersionId);

  return storedGrade;
}

/**
 * Get all grades for a skill version
 */
export function getGradesForVersion(
  skillId: string,
  versionId?: string
): SkillGrade[] {
  const grades = getStoredGrades();
  return grades.filter(
    (g) => g.skillId === skillId && (!versionId || g.skillVersionId === versionId)
  );
}

/**
 * Calculate aggregate scores for a skill version
 */
export function calculateAggregateScores(grades: SkillGrade[]): {
  averageOverall: number;
  dimensionAverages: Map<QualityDimension, number>;
  gradeCount: number;
} {
  if (grades.length === 0) {
    return {
      averageOverall: 0,
      dimensionAverages: new Map(),
      gradeCount: 0,
    };
  }

  const overallSum = grades.reduce((sum, g) => sum + g.overallScore, 0);
  const averageOverall = overallSum / grades.length;

  const dimensionSums = new Map<QualityDimension, { sum: number; count: number }>();

  for (const grade of grades) {
    for (const ds of grade.dimensionScores) {
      const existing = dimensionSums.get(ds.dimension) || { sum: 0, count: 0 };
      dimensionSums.set(ds.dimension, {
        sum: existing.sum + ds.score,
        count: existing.count + 1,
      });
    }
  }

  const dimensionAverages = new Map<QualityDimension, number>();
  for (const [dim, data] of dimensionSums) {
    dimensionAverages.set(dim, data.sum / data.count);
  }

  return {
    averageOverall,
    dimensionAverages,
    gradeCount: grades.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPROVEMENT TRIGGER DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if improvement should be triggered for a skill
 */
async function checkImprovementTrigger(
  skillId: string,
  versionId: string,
  config: ImprovementConfig = DEFAULT_IMPROVEMENT_CONFIG
): Promise<ImprovementTrigger | null> {
  const grades = getGradesForVersion(skillId, versionId);

  // Not enough grades yet
  if (grades.length < config.minGradesForImprovement) {
    return null;
  }

  const { averageOverall, dimensionAverages } = calculateAggregateScores(grades);

  // Check overall score threshold
  if (averageOverall < config.improvementThreshold) {
    await createImprovementRequest(skillId, versionId, 'low-score-threshold', grades);
    return 'low-score-threshold';
  }

  // Check for weak dimensions (below 3.0)
  for (const [dimension, avgScore] of dimensionAverages) {
    if (avgScore < 3.0) {
      await createImprovementRequest(skillId, versionId, 'dimension-weakness', grades);
      return 'dimension-weakness';
    }
  }

  // Check for feedback patterns (if many grades have similar feedback)
  const feedbackPatterns = detectFeedbackPatterns(grades);
  if (feedbackPatterns.length > 0 && feedbackPatterns[0].frequency >= 3) {
    await createImprovementRequest(skillId, versionId, 'user-feedback-pattern', grades);
    return 'user-feedback-pattern';
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// PATTERN DETECTION
// ═══════════════════════════════════════════════════════════════════════════

interface FeedbackPattern {
  theme: string;
  frequency: number;
  examples: string[];
}

/**
 * Detect common patterns in user feedback
 */
function detectFeedbackPatterns(grades: SkillGrade[]): FeedbackPattern[] {
  const feedbackTexts = grades
    .filter((g) => g.feedback || g.improvementSuggestion)
    .map((g) => (g.feedback || '') + ' ' + (g.improvementSuggestion || ''));

  if (feedbackTexts.length < 3) {
    return [];
  }

  // Simple keyword-based pattern detection
  // In production, this would use NLP/embeddings for semantic clustering
  const keywordPatterns: { [key: string]: { theme: string; keywords: string[] } } = {
    too_long: {
      theme: 'Output is too long/verbose',
      keywords: ['too long', 'verbose', 'shorter', 'concise', 'wordy'],
    },
    too_short: {
      theme: 'Output is too short/lacking detail',
      keywords: ['too short', 'more detail', 'lacking', 'incomplete', 'not enough'],
    },
    not_relevant: {
      theme: 'Output not relevant to request',
      keywords: ['not relevant', 'off topic', 'wrong', 'different', 'didn\'t ask'],
    },
    too_generic: {
      theme: 'Output is too generic',
      keywords: ['generic', 'specific', 'customized', 'personalized', 'template'],
    },
    format_issues: {
      theme: 'Formatting or structure issues',
      keywords: ['format', 'structure', 'layout', 'organize', 'readable'],
    },
    tone_issues: {
      theme: 'Tone or style needs adjustment',
      keywords: ['tone', 'formal', 'casual', 'professional', 'style'],
    },
  };

  const patternCounts: { [key: string]: { count: number; examples: string[] } } = {};

  for (const text of feedbackTexts) {
    const lowerText = text.toLowerCase();
    for (const [patternKey, { theme, keywords }] of Object.entries(keywordPatterns)) {
      if (keywords.some((kw) => lowerText.includes(kw))) {
        if (!patternCounts[patternKey]) {
          patternCounts[patternKey] = { count: 0, examples: [] };
        }
        patternCounts[patternKey].count++;
        if (patternCounts[patternKey].examples.length < 3) {
          patternCounts[patternKey].examples.push(text.slice(0, 200));
        }
      }
    }
  }

  const patterns: FeedbackPattern[] = Object.entries(patternCounts)
    .map(([key, data]) => ({
      theme: keywordPatterns[key].theme,
      frequency: data.count,
      examples: data.examples,
    }))
    .filter((p) => p.frequency >= 2)
    .sort((a, b) => b.frequency - a.frequency);

  return patterns;
}

/**
 * Analyze issues from grades to inform improvement
 */
function analyzeIssues(grades: SkillGrade[]): IssueAnalysis {
  const { averageOverall, dimensionAverages } = calculateAggregateScores(grades);

  // Find weakest dimensions (below 3.5)
  const weakestDimensions: QualityDimension[] = [];
  for (const [dim, avg] of dimensionAverages) {
    if (avg < 3.5) {
      weakestDimensions.push(dim);
    }
  }

  // Sort by weakness
  weakestDimensions.sort((a, b) => {
    const aScore = dimensionAverages.get(a) || 0;
    const bScore = dimensionAverages.get(b) || 0;
    return aScore - bScore;
  });

  // Get feedback patterns
  const feedbackPatterns = detectFeedbackPatterns(grades);

  // Calculate score distribution
  const scoreDistribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: grades.filter((g) => Math.round(g.overallScore) === score).length,
  }));

  // Common issues based on weak dimensions
  const commonIssues: string[] = [];
  if (weakestDimensions.includes('relevance')) {
    commonIssues.push('Output often doesn\'t match user intent or request');
  }
  if (weakestDimensions.includes('accuracy')) {
    commonIssues.push('Information accuracy needs improvement');
  }
  if (weakestDimensions.includes('completeness')) {
    commonIssues.push('Outputs are missing key elements or sections');
  }
  if (weakestDimensions.includes('clarity')) {
    commonIssues.push('Output structure or organization could be clearer');
  }
  if (weakestDimensions.includes('actionability')) {
    commonIssues.push('Outputs lack actionable, specific guidance');
  }
  if (weakestDimensions.includes('professionalism')) {
    commonIssues.push('Tone or format needs to be more professional');
  }

  return {
    commonIssues,
    weakestDimensions,
    feedbackThemes: feedbackPatterns.map((p) => ({
      theme: p.theme,
      frequency: p.frequency,
      exampleFeedback: p.examples,
    })),
    sampleSize: grades.length,
    averageScore: averageOverall,
    scoreDistribution,
    performancePercentile: 50, // Would calculate vs other skills in production
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPROVEMENT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create an improvement request based on grade analysis
 */
async function createImprovementRequest(
  skillId: string,
  versionId: string,
  trigger: ImprovementTrigger,
  grades: SkillGrade[]
): Promise<ImprovementRequest> {
  const issueAnalysis = analyzeIssues(grades);
  const proposedChanges = generateProposedChanges(skillId, issueAnalysis);

  const request: ImprovementRequest = {
    id: generateId(),
    skillId,
    skillVersionId: versionId,
    triggeredAt: new Date().toISOString(),
    triggerReason: trigger,
    issueAnalysis,
    proposedChanges,
    status: 'pending',
  };

  // Store the improvement request
  const requests = getStoredImprovementRequests();
  requests.push(request);
  localStorage.setItem('improvement_requests', JSON.stringify(requests));

  return request;
}

/**
 * Generate proposed changes based on issue analysis
 */
function generateProposedChanges(
  skillId: string,
  analysis: IssueAnalysis
): ProposedChange[] {
  const changes: ProposedChange[] = [];

  // Get current skill version (simplified - would fetch from actual storage)
  const currentVersion = getActiveSkillVersion(skillId);
  if (!currentVersion) return changes;

  // Generate improvement suggestions based on weakest dimensions
  for (const dimension of analysis.weakestDimensions) {
    const change = generateDimensionImprovement(
      dimension,
      currentVersion,
      analysis
    );
    if (change) {
      changes.push(change);
    }
  }

  // Generate improvements based on feedback themes
  for (const theme of analysis.feedbackThemes) {
    const change = generateFeedbackBasedImprovement(
      theme.theme,
      currentVersion,
      analysis
    );
    if (change) {
      changes.push(change);
    }
  }

  return changes;
}

/**
 * Generate improvement for a specific weak dimension
 */
function generateDimensionImprovement(
  dimension: QualityDimension,
  currentVersion: SkillVersion,
  analysis: IssueAnalysis
): ProposedChange | null {
  const improvements: { [key in QualityDimension]: { addition: string; rationale: string } } = {
    relevance: {
      addition: `
CRITICAL: OUTPUT RELEVANCE
- Before generating output, explicitly identify the user's core intent
- List the specific requirements from the user's input
- Ensure every section of your output directly addresses a stated requirement
- Remove any content that doesn't serve the user's explicit needs`,
      rationale: 'Users report outputs don\'t match their intent. Adding explicit intent-matching instructions.',
    },
    accuracy: {
      addition: `
ACCURACY REQUIREMENTS:
- Only include information you are highly confident is accurate
- When providing statistics, cite the general source or timeframe
- If uncertain about any claim, note it as "typically" or "generally"
- Avoid making specific claims about current events, prices, or rapidly changing data`,
      rationale: 'Accuracy scores are below threshold. Adding verification and confidence guidelines.',
    },
    completeness: {
      addition: `
COMPLETENESS CHECKLIST:
Before finalizing your response, verify you have addressed:
1. All explicit requirements from the user's input
2. Standard components expected for this type of output
3. Both "what" and "how" (not just identifying issues, but solving them)
4. Concrete examples or templates where applicable`,
      rationale: 'Users report incomplete outputs. Adding explicit completeness requirements.',
    },
    clarity: {
      addition: `
STRUCTURE & CLARITY:
- Use clear hierarchical headings (##, ###) to organize content
- Lead each section with a one-sentence summary
- Use bullet points for lists of 3+ items
- Bold key terms and action items
- Keep paragraphs to 3-4 sentences maximum`,
      rationale: 'Clarity scores indicate structure issues. Adding explicit formatting guidelines.',
    },
    actionability: {
      addition: `
ACTIONABILITY REQUIREMENTS:
Every recommendation must include:
1. The specific action to take
2. How to implement it (concrete steps)
3. Expected outcome or benefit
4. Example or template when applicable
Avoid vague advice like "consider improving" - instead say exactly what to do`,
      rationale: 'Users need more actionable outputs. Adding specificity requirements.',
    },
    professionalism: {
      addition: `
PROFESSIONAL TONE:
- Maintain a confident, authoritative tone without being condescending
- Use industry-standard terminology appropriate to the context
- Avoid casual language, slang, or overly enthusiastic expressions
- Format output as you would for a senior executive audience`,
      rationale: 'Tone needs adjustment. Adding professional communication guidelines.',
    },
  };

  const improvement = improvements[dimension];
  if (!improvement) return null;

  // Append to existing system instruction
  const newSystemInstruction = currentVersion.systemInstruction + '\n\n' + improvement.addition;

  return {
    id: generateId(),
    changeType: 'system-instruction',
    field: 'systemInstruction',
    oldValue: currentVersion.systemInstruction.slice(-500) + '...', // Last 500 chars
    newValue: newSystemInstruction.slice(-500) + '...', // Show addition
    rationale: improvement.rationale,
    expectedImpact: `Expected to improve ${dimension} scores by 0.5-1.0 points`,
    confidence: 'medium',
  };
}

/**
 * Generate improvement based on user feedback theme
 */
function generateFeedbackBasedImprovement(
  theme: string,
  currentVersion: SkillVersion,
  analysis: IssueAnalysis
): ProposedChange | null {
  const themeImprovements: { [key: string]: { addition: string; rationale: string } } = {
    'Output is too long/verbose': {
      addition: `
LENGTH CONSTRAINT:
- Keep total output under 800 words unless specifically requested otherwise
- Front-load the most important information
- Use concise, direct language
- Eliminate redundancy and filler phrases`,
      rationale: 'Users consistently report outputs are too long. Adding length constraints.',
    },
    'Output is too short/lacking detail': {
      addition: `
DEPTH REQUIREMENT:
- Provide comprehensive coverage of all aspects
- Include specific examples and illustrations
- Explain the reasoning behind recommendations
- Add relevant context and background where helpful`,
      rationale: 'Users want more detailed outputs. Removing constraints and encouraging depth.',
    },
    'Output is too generic': {
      addition: `
PERSONALIZATION REQUIREMENT:
- Reference specific details from the user's input throughout your response
- Customize all examples to the user's context
- Avoid generic templates - adapt language and content to the specific situation
- Include user-specific data points and metrics where provided`,
      rationale: 'Users want more personalized outputs. Adding customization requirements.',
    },
  };

  const improvement = themeImprovements[theme];
  if (!improvement) return null;

  const newSystemInstruction = currentVersion.systemInstruction + '\n\n' + improvement.addition;

  return {
    id: generateId(),
    changeType: 'system-instruction',
    field: 'systemInstruction',
    oldValue: currentVersion.systemInstruction.slice(-500) + '...',
    newValue: newSystemInstruction.slice(-500) + '...',
    rationale: improvement.rationale,
    expectedImpact: 'Address common user complaint pattern',
    confidence: 'high',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply approved improvements and create new version
 */
export async function applyImprovements(
  requestId: string
): Promise<SkillVersion | null> {
  const requests = getStoredImprovementRequests();
  const request = requests.find((r) => r.id === requestId);

  if (!request || request.status !== 'pending') {
    return null;
  }

  const currentVersion = getActiveSkillVersion(request.skillId);
  if (!currentVersion) {
    return null;
  }

  // Build new prompt content from approved changes
  let newSystemInstruction = currentVersion.systemInstruction;
  let newUserPrompt = currentVersion.userPromptTemplate;

  for (const change of request.proposedChanges) {
    if (change.changeType === 'system-instruction') {
      // Apply the full new value (which includes the addition)
      newSystemInstruction = change.newValue.replace('...', '');
    } else if (change.changeType === 'user-prompt') {
      newUserPrompt = change.newValue;
    }
  }

  // Create new version
  const newVersion: SkillVersion = {
    id: generateId(),
    skillId: request.skillId,
    version: currentVersion.version + 1,
    systemInstruction: newSystemInstruction,
    userPromptTemplate: newUserPrompt,
    createdAt: new Date().toISOString(),
    createdBy: 'ai-improvement',
    changeReason: `Improvement from ${request.triggerReason}: ${request.issueAnalysis.commonIssues.join('; ')}`,
    scores: {
      gradeCount: 0,
      requiredGrades: DEFAULT_IMPROVEMENT_CONFIG.minGradesForImprovement,
      averageOverallScore: 0,
      dimensionScores: [],
      improvementThreshold: DEFAULT_IMPROVEMENT_CONFIG.improvementThreshold,
    },
    isActive: true,
    previousVersionId: currentVersion.id,
  };

  // Deactivate old version
  currentVersion.isActive = false;

  // Store versions
  const versions = getStoredVersions();
  const oldIndex = versions.findIndex((v) => v.id === currentVersion.id);
  if (oldIndex >= 0) {
    versions[oldIndex] = currentVersion;
  }
  versions.push(newVersion);
  localStorage.setItem('skill_versions', JSON.stringify(versions));

  // Update request status
  request.status = 'implemented';
  request.newVersionId = newVersion.id;
  localStorage.setItem('improvement_requests', JSON.stringify(requests));

  return newVersion;
}

/**
 * Rollback to previous version if new version performs worse
 */
export async function rollbackVersion(
  skillId: string,
  reason: string
): Promise<SkillVersion | null> {
  const versions = getStoredVersions();
  const activeVersion = versions.find((v) => v.skillId === skillId && v.isActive);

  if (!activeVersion || !activeVersion.previousVersionId) {
    return null;
  }

  const previousVersion = versions.find((v) => v.id === activeVersion.previousVersionId);
  if (!previousVersion) {
    return null;
  }

  // Deactivate current, reactivate previous
  activeVersion.isActive = false;
  previousVersion.isActive = true;
  previousVersion.changeReason = `Rolled back: ${reason}`;

  localStorage.setItem('skill_versions', JSON.stringify(versions));

  return previousVersion;
}

/**
 * Get improvement history for a skill
 */
export function getImprovementHistory(skillId: string): SkillImprovementHistory {
  const versions = getStoredVersions().filter((v) => v.skillId === skillId);
  const grades = getStoredGrades().filter((g) => g.skillId === skillId);
  const requests = getStoredImprovementRequests().filter((r) => r.skillId === skillId);

  const activeVersion = versions.find((v) => v.isActive);

  const versionSummaries = versions.map((v) => ({
    versionId: v.id,
    version: v.version,
    createdAt: v.createdAt,
    averageScore: v.scores.averageOverallScore,
    gradeCount: v.scores.gradeCount,
    changeReason: v.changeReason,
    wasRolledBack: requests.some(
      (r) => r.newVersionId === v.id && r.status === 'rolled-back'
    ),
  }));

  // Build score trajectory
  const scoresByDate = new Map<string, { sum: number; count: number }>();
  for (const grade of grades) {
    const date = grade.gradedAt.split('T')[0];
    const existing = scoresByDate.get(date) || { sum: 0, count: 0 };
    scoresByDate.set(date, {
      sum: existing.sum + grade.overallScore,
      count: existing.count + 1,
    });
  }

  const scoreTrajectory = Array.from(scoresByDate.entries())
    .map(([date, data]) => ({
      date,
      score: data.sum / data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    skillId,
    skillName: '', // Would fetch from skill registry
    versions: versionSummaries,
    scoreTrajectory,
    totalImprovements: requests.length,
    successfulImprovements: requests.filter((r) => r.status === 'implemented').length,
    rolledBackImprovements: requests.filter((r) => r.status === 'rolled-back').length,
    currentVersion: activeVersion?.version || 1,
    currentScore: activeVersion?.scores.averageOverallScore || 0,
    gradesUntilNextReview: activeVersion
      ? Math.max(0, activeVersion.scores.requiredGrades - activeVersion.scores.gradeCount)
      : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getStoredGrades(): SkillGrade[] {
  try {
    return JSON.parse(localStorage.getItem('skill_grades') || '[]');
  } catch {
    return [];
  }
}

function getStoredVersions(): SkillVersion[] {
  try {
    return JSON.parse(localStorage.getItem('skill_versions') || '[]');
  } catch {
    return [];
  }
}

function getStoredImprovementRequests(): ImprovementRequest[] {
  try {
    return JSON.parse(localStorage.getItem('improvement_requests') || '[]');
  } catch {
    return [];
  }
}

function getActiveSkillVersion(skillId: string): SkillVersion | null {
  const versions = getStoredVersions();
  return versions.find((v) => v.skillId === skillId && v.isActive) || null;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  analyzeIssues,
  detectFeedbackPatterns,
  generateProposedChanges,
};
