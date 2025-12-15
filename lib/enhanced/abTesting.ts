/**
 * A/B Testing Framework
 *
 * Enables experiments on skills and workflows to optimize performance,
 * test different prompts, and measure success metrics.
 */

import type {
  ABExperiment,
  ABVariant,
  ABMetric,
  ABAssignment,
  ABResult,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORES (Replace with database in production)
// ═══════════════════════════════════════════════════════════════════════════

const experiments = new Map<string, ABExperiment>();
const assignments = new Map<string, ABAssignment[]>(); // experimentId -> assignments
const userAssignments = new Map<string, Map<string, string>>(); // userId -> experimentId -> variantId

// ═══════════════════════════════════════════════════════════════════════════
// EXPERIMENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new A/B experiment
 */
export function createExperiment(params: {
  name: string;
  description: string;
  targetSkillId?: string;
  targetWorkflowId?: string;
  targetStepId?: string;
  variants: Omit<ABVariant, 'sampleSize' | 'conversions' | 'metricValues'>[];
  controlVariantId: string;
  trafficPercentage: number;
  primaryMetric: ABMetric;
  secondaryMetrics?: ABMetric[];
  minSampleSize?: number;
  confidenceLevel?: number;
  createdBy: string;
}): ABExperiment {
  const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const variants: ABVariant[] = params.variants.map((v) => ({
    ...v,
    sampleSize: 0,
    conversions: 0,
    metricValues: {},
  }));

  const experiment: ABExperiment = {
    id,
    name: params.name,
    description: params.description,
    status: 'draft',
    targetSkillId: params.targetSkillId,
    targetWorkflowId: params.targetWorkflowId,
    targetStepId: params.targetStepId,
    variants,
    controlVariantId: params.controlVariantId,
    trafficPercentage: params.trafficPercentage,
    primaryMetric: params.primaryMetric,
    secondaryMetrics: params.secondaryMetrics || [],
    minSampleSize: params.minSampleSize || 100,
    confidenceLevel: params.confidenceLevel || 0.95,
    createdBy: params.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  experiments.set(id, experiment);
  assignments.set(id, []);

  return experiment;
}

/**
 * Get an experiment by ID
 */
export function getExperiment(id: string): ABExperiment | null {
  return experiments.get(id) || null;
}

/**
 * Get all experiments
 */
export function getAllExperiments(params?: {
  status?: ABExperiment['status'];
  targetSkillId?: string;
  targetWorkflowId?: string;
}): ABExperiment[] {
  let result = Array.from(experiments.values());

  if (params?.status) {
    result = result.filter((e) => e.status === params.status);
  }
  if (params?.targetSkillId) {
    result = result.filter((e) => e.targetSkillId === params.targetSkillId);
  }
  if (params?.targetWorkflowId) {
    result = result.filter((e) => e.targetWorkflowId === params.targetWorkflowId);
  }

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Update an experiment
 */
export function updateExperiment(
  id: string,
  updates: Partial<
    Pick<
      ABExperiment,
      | 'name'
      | 'description'
      | 'trafficPercentage'
      | 'minSampleSize'
      | 'confidenceLevel'
    >
  >
): ABExperiment | null {
  const experiment = experiments.get(id);
  if (!experiment) return null;

  // Only allow updates if experiment is in draft status
  if (experiment.status !== 'draft') {
    console.warn('Cannot update running or completed experiments');
    return experiment;
  }

  Object.assign(experiment, updates, { updatedAt: new Date().toISOString() });
  return experiment;
}

/**
 * Start an experiment
 */
export function startExperiment(id: string): ABExperiment | null {
  const experiment = experiments.get(id);
  if (!experiment) return null;

  if (experiment.status !== 'draft' && experiment.status !== 'paused') {
    console.warn('Can only start draft or paused experiments');
    return experiment;
  }

  experiment.status = 'running';
  experiment.startedAt = experiment.startedAt || new Date().toISOString();
  experiment.updatedAt = new Date().toISOString();

  return experiment;
}

/**
 * Pause an experiment
 */
export function pauseExperiment(id: string): ABExperiment | null {
  const experiment = experiments.get(id);
  if (!experiment) return null;

  if (experiment.status !== 'running') {
    console.warn('Can only pause running experiments');
    return experiment;
  }

  experiment.status = 'paused';
  experiment.updatedAt = new Date().toISOString();

  return experiment;
}

/**
 * Complete an experiment
 */
export function completeExperiment(
  id: string,
  winnerId?: string
): ABExperiment | null {
  const experiment = experiments.get(id);
  if (!experiment) return null;

  experiment.status = 'completed';
  experiment.endedAt = new Date().toISOString();
  experiment.updatedAt = experiment.endedAt;

  if (winnerId) {
    const result = calculateResults(id);
    experiment.winner = winnerId;
    experiment.winnerConfidence = result?.pValue ? 1 - result.pValue : undefined;
  }

  return experiment;
}

/**
 * Archive an experiment
 */
export function archiveExperiment(id: string): ABExperiment | null {
  const experiment = experiments.get(id);
  if (!experiment) return null;

  experiment.status = 'archived';
  experiment.updatedAt = new Date().toISOString();

  return experiment;
}

/**
 * Delete an experiment
 */
export function deleteExperiment(id: string): boolean {
  const deleted = experiments.delete(id);
  assignments.delete(id);

  // Clean up user assignments
  userAssignments.forEach((expMap) => {
    expMap.delete(id);
  });

  return deleted;
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add a variant to an experiment
 */
export function addVariant(
  experimentId: string,
  variant: Omit<ABVariant, 'sampleSize' | 'conversions' | 'metricValues'>
): ABExperiment | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) return null;

  if (experiment.status !== 'draft') {
    console.warn('Cannot add variants to non-draft experiments');
    return experiment;
  }

  experiment.variants.push({
    ...variant,
    sampleSize: 0,
    conversions: 0,
    metricValues: {},
  });

  experiment.updatedAt = new Date().toISOString();
  return experiment;
}

/**
 * Update a variant
 */
export function updateVariant(
  experimentId: string,
  variantId: string,
  updates: Partial<Pick<ABVariant, 'name' | 'description' | 'trafficWeight' | 'changes'>>
): ABExperiment | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) return null;

  const variant = experiment.variants.find((v) => v.id === variantId);
  if (!variant) return null;

  Object.assign(variant, updates);
  experiment.updatedAt = new Date().toISOString();

  return experiment;
}

/**
 * Remove a variant from an experiment
 */
export function removeVariant(
  experimentId: string,
  variantId: string
): ABExperiment | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) return null;

  if (experiment.status !== 'draft') {
    console.warn('Cannot remove variants from non-draft experiments');
    return experiment;
  }

  if (variantId === experiment.controlVariantId) {
    console.warn('Cannot remove control variant');
    return experiment;
  }

  experiment.variants = experiment.variants.filter((v) => v.id !== variantId);
  experiment.updatedAt = new Date().toISOString();

  return experiment;
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get or assign a variant for a user in an experiment
 */
export function getVariantAssignment(params: {
  experimentId: string;
  userId: string;
  sessionId?: string;
}): {
  assigned: boolean;
  variantId: string | null;
  variant: ABVariant | null;
  inExperiment: boolean;
} {
  const experiment = experiments.get(params.experimentId);
  if (!experiment || experiment.status !== 'running') {
    return { assigned: false, variantId: null, variant: null, inExperiment: false };
  }

  // Check for existing assignment
  let userExpMap = userAssignments.get(params.userId);
  if (userExpMap?.has(params.experimentId)) {
    const variantId = userExpMap.get(params.experimentId)!;
    const variant = experiment.variants.find((v) => v.id === variantId) || null;
    return { assigned: true, variantId, variant, inExperiment: true };
  }

  // Check if user should be in experiment based on traffic percentage
  const hash = hashString(`${params.experimentId}:${params.userId}`);
  const bucket = hash % 100;

  if (bucket >= experiment.trafficPercentage) {
    return { assigned: false, variantId: null, variant: null, inExperiment: false };
  }

  // Assign variant based on traffic weights
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.trafficWeight, 0);
  const randomValue = (hash % 10000) / 10000;
  let cumulative = 0;
  let selectedVariant: ABVariant | null = null;

  for (const variant of experiment.variants) {
    cumulative += variant.trafficWeight / totalWeight;
    if (randomValue <= cumulative) {
      selectedVariant = variant;
      break;
    }
  }

  // Fallback to first variant
  if (!selectedVariant) {
    selectedVariant = experiment.variants[0];
  }

  // Store assignment
  if (!userExpMap) {
    userExpMap = new Map();
    userAssignments.set(params.userId, userExpMap);
  }
  userExpMap.set(params.experimentId, selectedVariant.id);

  // Record assignment
  const assignment: ABAssignment = {
    experimentId: params.experimentId,
    variantId: selectedVariant.id,
    userId: params.userId,
    sessionId: params.sessionId,
    assignedAt: new Date().toISOString(),
    exposed: false,
    converted: false,
  };

  const expAssignments = assignments.get(params.experimentId) || [];
  expAssignments.push(assignment);
  assignments.set(params.experimentId, expAssignments);

  return {
    assigned: true,
    variantId: selectedVariant.id,
    variant: selectedVariant,
    inExperiment: true,
  };
}

/**
 * Get the active experiment for a skill or workflow step
 */
export function getActiveExperiment(params: {
  skillId?: string;
  workflowId?: string;
  stepId?: string;
}): ABExperiment | null {
  const runningExperiments = getAllExperiments({ status: 'running' });

  for (const exp of runningExperiments) {
    if (params.skillId && exp.targetSkillId === params.skillId) {
      return exp;
    }
    if (params.workflowId && exp.targetWorkflowId === params.workflowId) {
      if (!params.stepId || exp.targetStepId === params.stepId) {
        return exp;
      }
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPOSURE AND CONVERSION TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record that a user was exposed to a variant
 */
export function recordExposure(params: {
  experimentId: string;
  userId: string;
}): boolean {
  const expAssignments = assignments.get(params.experimentId);
  if (!expAssignments) return false;

  const assignment = expAssignments.find((a) => a.userId === params.userId);
  if (!assignment) return false;

  if (!assignment.exposed) {
    assignment.exposed = true;

    // Update variant sample size
    const experiment = experiments.get(params.experimentId);
    if (experiment) {
      const variant = experiment.variants.find((v) => v.id === assignment.variantId);
      if (variant) {
        variant.sampleSize++;
      }
    }
  }

  return true;
}

/**
 * Record a conversion for a user
 */
export function recordConversion(params: {
  experimentId: string;
  userId: string;
  metricValues?: Record<string, number>;
}): boolean {
  const expAssignments = assignments.get(params.experimentId);
  if (!expAssignments) return false;

  const assignment = expAssignments.find((a) => a.userId === params.userId);
  if (!assignment || !assignment.exposed) return false;

  if (!assignment.converted) {
    assignment.converted = true;
    assignment.metricValues = params.metricValues;

    // Update variant conversions
    const experiment = experiments.get(params.experimentId);
    if (experiment) {
      const variant = experiment.variants.find((v) => v.id === assignment.variantId);
      if (variant) {
        variant.conversions++;

        // Update metric values
        if (params.metricValues) {
          for (const [key, value] of Object.entries(params.metricValues)) {
            const current = variant.metricValues[key] || 0;
            const count = variant.sampleSize || 1;
            // Running average
            variant.metricValues[key] = (current * (count - 1) + value) / count;
          }
        }
      }
    }
  }

  return true;
}

/**
 * Record a metric value for a user (without conversion)
 */
export function recordMetric(params: {
  experimentId: string;
  userId: string;
  metricId: string;
  value: number;
}): boolean {
  const expAssignments = assignments.get(params.experimentId);
  if (!expAssignments) return false;

  const assignment = expAssignments.find((a) => a.userId === params.userId);
  if (!assignment || !assignment.exposed) return false;

  if (!assignment.metricValues) {
    assignment.metricValues = {};
  }
  assignment.metricValues[params.metricId] = params.value;

  // Update variant metric values
  const experiment = experiments.get(params.experimentId);
  if (experiment) {
    const variant = experiment.variants.find((v) => v.id === assignment.variantId);
    if (variant) {
      const current = variant.metricValues[params.metricId] || 0;
      const count = variant.sampleSize || 1;
      variant.metricValues[params.metricId] = (current * (count - 1) + params.value) / count;
    }
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICAL ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate experiment results
 */
export function calculateResults(experimentId: string): ABResult | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) return null;

  const variantResults: ABResult['variantResults'] = [];

  for (const variant of experiment.variants) {
    const conversionRate =
      variant.sampleSize > 0 ? variant.conversions / variant.sampleSize : 0;

    // Calculate standard deviation for conversion rate
    const p = conversionRate;
    const n = variant.sampleSize;
    const standardError = n > 0 ? Math.sqrt((p * (1 - p)) / n) : 0;

    // 95% confidence interval
    const z = 1.96; // For 95% confidence
    const confidenceInterval: [number, number] = [
      Math.max(0, p - z * standardError),
      Math.min(1, p + z * standardError),
    ];

    variantResults.push({
      variantId: variant.id,
      sampleSize: variant.sampleSize,
      conversionRate,
      meanValue: variant.metricValues[experiment.primaryMetric.id],
      standardDeviation: standardError,
      confidenceInterval,
    });
  }

  // Calculate p-value using chi-square test for conversion rates
  const controlVariant = experiment.variants.find(
    (v) => v.id === experiment.controlVariantId
  );
  const treatmentVariants = experiment.variants.filter(
    (v) => v.id !== experiment.controlVariantId
  );

  let pValue: number | undefined;
  let recommendedVariant: string | undefined;
  let isSignificant = false;

  if (controlVariant && treatmentVariants.length > 0) {
    // Simple two-proportion z-test for the primary treatment variant
    const treatment = treatmentVariants[0];
    const p1 = controlVariant.sampleSize > 0
      ? controlVariant.conversions / controlVariant.sampleSize
      : 0;
    const p2 = treatment.sampleSize > 0
      ? treatment.conversions / treatment.sampleSize
      : 0;
    const n1 = controlVariant.sampleSize;
    const n2 = treatment.sampleSize;

    if (n1 > 0 && n2 > 0) {
      const pooledP = (controlVariant.conversions + treatment.conversions) / (n1 + n2);
      const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

      if (se > 0) {
        const z = (p2 - p1) / se;
        // Approximate p-value from z-score (two-tailed)
        pValue = 2 * (1 - normalCDF(Math.abs(z)));
        isSignificant = pValue < (1 - experiment.confidenceLevel);

        // Determine winner
        if (isSignificant) {
          recommendedVariant = p2 > p1 ? treatment.id : controlVariant.id;
        }
      }
    }
  }

  // Determine recommendation
  let recommendation = '';
  if (experiment.variants.some((v) => v.sampleSize < experiment.minSampleSize)) {
    recommendation = `Insufficient sample size. Need at least ${experiment.minSampleSize} samples per variant.`;
  } else if (!isSignificant) {
    recommendation = 'Results are not statistically significant. Consider running longer.';
  } else if (recommendedVariant === experiment.controlVariantId) {
    recommendation = 'Control variant is winning. Consider keeping the original.';
  } else {
    const winningVariant = experiment.variants.find(
      (v) => v.id === recommendedVariant
    );
    recommendation = `Variant "${winningVariant?.name}" is winning with ${((pValue ? 1 - pValue : 0) * 100).toFixed(1)}% confidence.`;
  }

  return {
    experimentId,
    calculatedAt: new Date().toISOString(),
    variantResults,
    pValue,
    isSignificant,
    recommendedVariant,
    recommendation,
  };
}

/**
 * Get experiment statistics summary
 */
export function getExperimentStats(experimentId: string): {
  totalAssignments: number;
  totalExposures: number;
  totalConversions: number;
  variantBreakdown: {
    variantId: string;
    variantName: string;
    assignments: number;
    exposures: number;
    conversions: number;
    conversionRate: number;
  }[];
} | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) return null;

  const expAssignments = assignments.get(experimentId) || [];

  const variantBreakdown = experiment.variants.map((variant) => {
    const variantAssignments = expAssignments.filter(
      (a) => a.variantId === variant.id
    );
    const exposures = variantAssignments.filter((a) => a.exposed).length;
    const conversions = variantAssignments.filter((a) => a.converted).length;

    return {
      variantId: variant.id,
      variantName: variant.name,
      assignments: variantAssignments.length,
      exposures,
      conversions,
      conversionRate: exposures > 0 ? conversions / exposures : 0,
    };
  });

  return {
    totalAssignments: expAssignments.length,
    totalExposures: expAssignments.filter((a) => a.exposed).length,
    totalConversions: expAssignments.filter((a) => a.converted).length,
    variantBreakdown,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple string hash function for consistent bucketing
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Approximation of normal CDF
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply A/B test variant to skill execution
 * Returns the modified configuration based on variant
 */
export function applyVariant(params: {
  skillId: string;
  workflowId?: string;
  stepId?: string;
  userId: string;
  originalConfig: Record<string, unknown>;
}): {
  config: Record<string, unknown>;
  experimentId: string | null;
  variantId: string | null;
} {
  // Find active experiment
  const experiment = getActiveExperiment({
    skillId: params.skillId,
    workflowId: params.workflowId,
    stepId: params.stepId,
  });

  if (!experiment) {
    return {
      config: params.originalConfig,
      experimentId: null,
      variantId: null,
    };
  }

  // Get variant assignment
  const assignment = getVariantAssignment({
    experimentId: experiment.id,
    userId: params.userId,
  });

  if (!assignment.inExperiment || !assignment.variant) {
    return {
      config: params.originalConfig,
      experimentId: null,
      variantId: null,
    };
  }

  // Record exposure
  recordExposure({
    experimentId: experiment.id,
    userId: params.userId,
  });

  // Apply variant changes
  const modifiedConfig = { ...params.originalConfig };

  for (const [key, value] of Object.entries(assignment.variant.changes)) {
    modifiedConfig[key] = value;
  }

  return {
    config: modifiedConfig,
    experimentId: experiment.id,
    variantId: assignment.variantId,
  };
}
