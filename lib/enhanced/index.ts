/**
 * Enhanced SkillEngine Module
 *
 * This module provides advanced capabilities for enterprise use:
 * - Schema validation and lineage tracking
 * - Observability (tracing, latency budgets, alerting)
 * - Compliance (policy checks, audit logging, PII redaction)
 * - Cost controls (estimates, budget caps, provider routing)
 * - A/B testing framework
 * - Collaboration features (drafts, comments, approvals)
 * - Advanced workflow chaining
 */

// Export all types
export * from './types';

// Export observability
export {
  // Trace management
  generateTraceId,
  generateSpanId,
  startTrace,
  updateTrace,
  completeTrace,
  failTrace,
  getTrace,
  getRecentTraces,

  // Latency budgets
  setLatencyBudget,
  getLatencyBudget,
  getAllLatencyBudgets,
  calculateLatencyPercentiles,

  // Error budgets
  setErrorBudget,
  getErrorBudget,
  getAllErrorBudgets,

  // Alerting
  setAlertRule,
  getAlertRule,
  getAllAlertRules,
  onAlert,
  getAlertEvents,

  // Metrics
  getMetricsSummary,
  getGlobalMetricsSummary,
  type MetricsSummary,
} from './observability';

// Export compliance
export {
  // Policy management
  setPolicy,
  getPolicy,
  getAllPolicies,
  getApplicablePolicies,
  deletePolicy,
  checkPolicies,

  // PII detection
  setPIIConfig,
  getPIIConfig,
  detectPII,
  redactPII,

  // Audit logging
  logAudit,
  getAuditLog,
  onAuditLog,
  exportAuditLog,
} from './compliance';

// Export cost controls
export {
  // Pricing
  TOKEN_PRICING,

  // Cost estimation
  estimateSkillCost,
  estimateWorkflowCost,

  // Budget management
  setBudget,
  getBudget,
  getAllBudgets,
  getApplicableBudget,
  checkBudget,
  recordCostUsage,
  resetDailyBudgets,
  resetWeeklyBudgets,
  resetMonthlyBudgets,

  // Provider routing
  setRoutingConfig,
  getRoutingConfig,
  getAllRoutingConfigs,
  selectProvider,

  // Cost tracking
  recordCost,
  getCostRecords,
  getCostSummary,
} from './costControls';

// Export collaboration
export {
  // Draft management
  createDraft,
  getDraft,
  getDrafts,
  updateDraft,
  deleteDraft,
  addCollaborator,
  removeCollaborator,

  // Comments
  addComment,
  getComments,
  updateComment,
  addReaction,
  deleteComment,

  // Approvals
  requestApproval,
  getApprovalRequest,
  getApprovalRequestsForDraft,
  getPendingApprovalsForUser,
  submitApproval,
  cancelApproval,

  // Publish gates
  setPublishGate,
  getPublishGate,
  getAllPublishGates,
  checkPublishGates,
  publishDraft,

  // Events
  onCollaborationEvent,
  getCollaborationEvents,

  // Summary
  getCollaborationSummary,
  type CollaborationSummary,
} from './collaboration';

// Export A/B testing
export {
  // Experiment management
  createExperiment,
  getExperiment,
  getAllExperiments,
  updateExperiment,
  startExperiment,
  pauseExperiment,
  completeExperiment,
  archiveExperiment,
  deleteExperiment,

  // Variant management
  addVariant,
  updateVariant,
  removeVariant,

  // Variant assignment
  getVariantAssignment,
  getActiveExperiment,

  // Tracking
  recordExposure,
  recordConversion,
  recordMetric,

  // Analysis
  calculateResults,
  getExperimentStats,

  // Workflow integration
  applyVariant,
} from './abTesting';

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

import {
  startTrace,
  completeTrace,
  failTrace,
} from './observability';

import {
  checkPolicies,
  logAudit,
  detectPII,
  redactPII,
} from './compliance';

import {
  estimateSkillCost,
  checkBudget,
  selectProvider,
  recordCost,
} from './costControls';

import type {
  ExecutionTrace,
  PolicyCheckResult,
  CostEstimate,
  AuditAction,
} from './types';

/**
 * Pre-execution hook for skills
 * Performs all pre-flight checks and returns execution context
 */
export async function preExecutionCheck(params: {
  skillId: string;
  skillName: string;
  inputs: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  userRole?: string;
}): Promise<{
  allowed: boolean;
  trace: ExecutionTrace;
  provider: string;
  model: string;
  costEstimate: CostEstimate;
  policyResults: PolicyCheckResult[];
  warnings: string[];
  blockedReason?: string;
}> {
  const warnings: string[] = [];
  let blockedReason: string | undefined;

  // 1. Select provider
  const providerSelection = selectProvider({
    userTier: params.userRole,
  });

  // 2. Estimate cost
  const costEstimate = estimateSkillCost({
    skillId: params.skillId,
    inputs: params.inputs,
    provider: providerSelection.provider,
    model: providerSelection.model,
  });

  // 3. Check budget
  const budgetCheck = checkBudget({
    userId: params.userId,
    estimatedCost: costEstimate.totalCost,
  });

  if (!budgetCheck.allowed) {
    blockedReason = budgetCheck.reason;
  }

  // 4. Check policies
  const policyResults = checkPolicies({
    skillId: params.skillId,
    userRole: params.userRole,
    inputs: params.inputs,
  });

  for (const result of policyResults) {
    if (!result.passed) {
      const blockingViolation = result.violations.find(v => v.action === 'blocked');
      if (blockingViolation) {
        blockedReason = blockedReason || blockingViolation.message;
      }
    }
    // Collect warnings
    result.warnings.forEach(w => warnings.push(w.message));
  }

  // 5. Start trace
  const trace = startTrace({
    type: 'skill',
    entityId: params.skillId,
    entityName: params.skillName,
    provider: providerSelection.provider,
    model: providerSelection.model,
    userId: params.userId,
  });

  // 6. Log audit entry
  logAudit({
    actorId: params.userId || 'anonymous',
    actorEmail: params.userEmail || 'anonymous',
    actorRole: params.userRole || 'free',
    action: 'execute' as AuditAction,
    resourceType: 'skill',
    resourceId: params.skillId,
    resourceName: params.skillName,
    details: {
      provider: providerSelection.provider,
      model: providerSelection.model,
      estimatedCost: costEstimate.totalCost,
    },
    result: blockedReason ? 'blocked' : 'success',
    errorMessage: blockedReason,
    policyChecks: policyResults,
    piiRedacted: false,
  });

  return {
    allowed: !blockedReason,
    trace,
    provider: providerSelection.provider,
    model: providerSelection.model,
    costEstimate,
    policyResults,
    warnings,
    blockedReason,
  };
}

/**
 * Post-execution hook for skills
 * Records metrics and costs
 */
export function postExecutionComplete(params: {
  traceId: string;
  userId?: string;
  teamId?: string;
  skillId: string;
  inputTokens: number;
  outputTokens: number;
  modelLatencyMs: number;
  provider: string;
  model: string;
  output?: string;
}): ExecutionTrace | null {
  // Calculate actual cost
  const pricing = { input: 0.80, output: 4.00 }; // Default Claude Haiku
  const actualCost =
    (params.inputTokens / 1_000_000) * pricing.input +
    (params.outputTokens / 1_000_000) * pricing.output;

  // Complete trace
  const trace = completeTrace(params.traceId, {
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    modelLatencyMs: params.modelLatencyMs,
    actualCost,
  });

  // Record cost
  recordCost({
    executionId: params.traceId,
    skillId: params.skillId,
    userId: params.userId || 'anonymous',
    teamId: params.teamId,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    totalTokens: params.inputTokens + params.outputTokens,
    cost: actualCost,
    currency: 'USD',
    provider: params.provider,
    model: params.model,
  });

  // Check for PII in output
  if (params.output) {
    const piiResult = detectPII(params.output);
    if (piiResult.found) {
      console.warn('PII detected in output:', piiResult.detections.length, 'instances');
    }
  }

  return trace;
}

/**
 * Post-execution hook for failed executions
 */
export function postExecutionFailed(params: {
  traceId: string;
  errorCode: string;
  errorMessage: string;
  retryable?: boolean;
}): ExecutionTrace | null {
  return failTrace(params.traceId, {
    code: params.errorCode,
    message: params.errorMessage,
    retryable: params.retryable,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════

import { getGlobalMetricsSummary, getAllLatencyBudgets, getAllErrorBudgets, getAlertEvents } from './observability';
import { getCostSummary } from './costControls';

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
  }[];
  metrics: {
    successRate: number;
    avgLatencyMs: number;
    activeAlerts: number;
    totalCostToday: number;
  };
  timestamp: string;
}

/**
 * Get overall system health status
 */
export function getHealthStatus(): HealthStatus {
  const metrics = getGlobalMetricsSummary();
  const latencyBudgets = getAllLatencyBudgets();
  const errorBudgets = getAllErrorBudgets();
  const alerts = getAlertEvents(100);
  const costSummary = getCostSummary();

  const components: HealthStatus['components'] = [];

  // Check success rate
  const successStatus = metrics.successRate >= 0.95 ? 'healthy' :
    metrics.successRate >= 0.90 ? 'degraded' : 'unhealthy';
  components.push({
    name: 'Success Rate',
    status: successStatus,
    message: `${(metrics.successRate * 100).toFixed(1)}% success rate`,
  });

  // Check latency
  const latencyStatus = latencyBudgets.every(b => b.withinBudget) ? 'healthy' :
    latencyBudgets.some(b => b.withinBudget) ? 'degraded' : 'unhealthy';
  components.push({
    name: 'Latency',
    status: latencyStatus,
    message: `P95: ${metrics.p95LatencyMs.toFixed(0)}ms`,
  });

  // Check error budget
  const errorBudgetStatus = errorBudgets.every(b => (b.budgetRemaining || 0) > 20) ? 'healthy' :
    errorBudgets.some(b => (b.budgetRemaining || 0) > 0) ? 'degraded' : 'unhealthy';
  components.push({
    name: 'Error Budget',
    status: errorBudgetStatus,
    message: `${errorBudgets[0]?.budgetRemaining?.toFixed(0) || 100}% remaining`,
  });

  // Check active alerts
  const activeAlerts = alerts.filter(a => !a.resolvedAt);
  const alertStatus = activeAlerts.length === 0 ? 'healthy' :
    activeAlerts.some(a => a.severity === 'critical') ? 'unhealthy' : 'degraded';
  components.push({
    name: 'Alerts',
    status: alertStatus,
    message: `${activeAlerts.length} active alerts`,
  });

  // Overall status
  const overall = components.some(c => c.status === 'unhealthy') ? 'unhealthy' :
    components.some(c => c.status === 'degraded') ? 'degraded' : 'healthy';

  return {
    overall,
    components,
    metrics: {
      successRate: metrics.successRate,
      avgLatencyMs: metrics.avgLatencyMs,
      activeAlerts: activeAlerts.length,
      totalCostToday: costSummary.totalCost,
    },
    timestamp: new Date().toISOString(),
  };
}
