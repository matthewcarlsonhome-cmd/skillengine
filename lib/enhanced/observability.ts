/**
 * Observability Service
 *
 * Provides tracing, latency budgets, error budgets, and alerting
 * for skills and workflows.
 */

import type {
  TraceSpan,
  ExecutionTrace,
  LatencyBudget,
  ErrorBudget,
  AlertRule,
  AlertEvent,
  TraceLog,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// TRACE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const activeTraces: Map<string, ExecutionTrace> = new Map();
const completedTraces: ExecutionTrace[] = [];
const MAX_COMPLETED_TRACES = 1000;

/**
 * Generate unique trace ID
 */
export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate unique span ID
 */
export function generateSpanId(): string {
  return `span_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Start a new execution trace
 */
export function startTrace(params: {
  type: 'skill' | 'workflow' | 'step';
  entityId: string;
  entityName: string;
  provider: string;
  model: string;
  userId?: string;
  sessionId?: string;
  parentTraceId?: string;
}): ExecutionTrace {
  const trace: ExecutionTrace = {
    id: generateTraceId(),
    type: params.type,
    entityId: params.entityId,
    entityName: params.entityName,
    startedAt: new Date().toISOString(),
    status: 'running',
    retryCount: 0,
    childTraceIds: [],
    provider: params.provider,
    model: params.model,
    userId: params.userId,
    sessionId: params.sessionId,
    parentTraceId: params.parentTraceId,
  };

  activeTraces.set(trace.id, trace);

  // Link to parent if exists
  if (params.parentTraceId) {
    const parent = activeTraces.get(params.parentTraceId);
    if (parent) {
      parent.childTraceIds.push(trace.id);
    }
  }

  return trace;
}

/**
 * Update trace with execution details
 */
export function updateTrace(
  traceId: string,
  update: Partial<ExecutionTrace>
): ExecutionTrace | null {
  const trace = activeTraces.get(traceId);
  if (!trace) return null;

  Object.assign(trace, update);
  return trace;
}

/**
 * Complete a trace successfully
 */
export function completeTrace(
  traceId: string,
  params: {
    inputTokens?: number;
    outputTokens?: number;
    modelLatencyMs?: number;
    estimatedCost?: number;
    actualCost?: number;
  }
): ExecutionTrace | null {
  const trace = activeTraces.get(traceId);
  if (!trace) return null;

  const now = new Date();
  trace.completedAt = now.toISOString();
  trace.durationMs = now.getTime() - new Date(trace.startedAt).getTime();
  trace.totalLatencyMs = trace.durationMs;
  trace.status = 'success';
  trace.inputTokens = params.inputTokens;
  trace.outputTokens = params.outputTokens;
  trace.modelLatencyMs = params.modelLatencyMs;
  trace.estimatedCost = params.estimatedCost;
  trace.actualCost = params.actualCost;

  // Move to completed
  activeTraces.delete(traceId);
  completedTraces.unshift(trace);

  // Trim old traces
  if (completedTraces.length > MAX_COMPLETED_TRACES) {
    completedTraces.pop();
  }

  // Check budgets and alerts
  checkLatencyBudgets(trace);
  checkErrorBudgets(trace);

  return trace;
}

/**
 * Fail a trace
 */
export function failTrace(
  traceId: string,
  error: {
    code: string;
    message: string;
    stack?: string;
    retryable?: boolean;
  }
): ExecutionTrace | null {
  const trace = activeTraces.get(traceId);
  if (!trace) return null;

  const now = new Date();
  trace.completedAt = now.toISOString();
  trace.durationMs = now.getTime() - new Date(trace.startedAt).getTime();
  trace.status = 'error';
  trace.error = {
    code: error.code,
    message: error.message,
    stack: error.stack,
    retryable: error.retryable ?? false,
  };

  // Move to completed
  activeTraces.delete(traceId);
  completedTraces.unshift(trace);

  // Check error budgets
  checkErrorBudgets(trace);

  // Trigger alerts
  triggerErrorAlert(trace);

  return trace;
}

/**
 * Get trace by ID
 */
export function getTrace(traceId: string): ExecutionTrace | null {
  return activeTraces.get(traceId) || completedTraces.find(t => t.id === traceId) || null;
}

/**
 * Get recent traces
 */
export function getRecentTraces(params: {
  type?: 'skill' | 'workflow' | 'step';
  entityId?: string;
  status?: ExecutionTrace['status'];
  limit?: number;
}): ExecutionTrace[] {
  let traces = [...completedTraces, ...Array.from(activeTraces.values())];

  if (params.type) {
    traces = traces.filter(t => t.type === params.type);
  }
  if (params.entityId) {
    traces = traces.filter(t => t.entityId === params.entityId);
  }
  if (params.status) {
    traces = traces.filter(t => t.status === params.status);
  }

  return traces.slice(0, params.limit || 100);
}

// ═══════════════════════════════════════════════════════════════════════════
// LATENCY BUDGETS
// ═══════════════════════════════════════════════════════════════════════════

const latencyBudgets: Map<string, LatencyBudget> = new Map();
const latencyMetrics: Map<string, number[]> = new Map(); // entityId -> latencies

/**
 * Create or update a latency budget
 */
export function setLatencyBudget(budget: LatencyBudget): void {
  latencyBudgets.set(budget.id, budget);
}

/**
 * Get latency budget
 */
export function getLatencyBudget(budgetId: string): LatencyBudget | null {
  return latencyBudgets.get(budgetId) || null;
}

/**
 * Get all latency budgets
 */
export function getAllLatencyBudgets(): LatencyBudget[] {
  return Array.from(latencyBudgets.values());
}

/**
 * Check if trace meets latency budget
 */
function checkLatencyBudgets(trace: ExecutionTrace): void {
  if (!trace.durationMs) return;

  // Get latencies for this entity
  const entityId = trace.entityId;
  const latencies = latencyMetrics.get(entityId) || [];
  latencies.push(trace.durationMs);

  // Keep only recent samples (last 1000)
  if (latencies.length > 1000) {
    latencies.shift();
  }
  latencyMetrics.set(entityId, latencies);

  // Check against budgets
  latencyBudgets.forEach(budget => {
    if (latencies.length < 10) return; // Need minimum samples

    const sorted = [...latencies].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    budget.currentP50Ms = p50;
    budget.currentP95Ms = p95;
    budget.currentP99Ms = p99;
    budget.withinBudget = p95 <= budget.targetP95Ms && p99 <= budget.targetP99Ms;
    budget.lastUpdated = new Date().toISOString();

    // Trigger alert if over budget
    if (!budget.withinBudget) {
      triggerLatencyAlert(budget, trace);
    }
  });
}

/**
 * Calculate latency percentiles
 */
export function calculateLatencyPercentiles(entityId: string): {
  p50: number;
  p95: number;
  p99: number;
  sampleCount: number;
} | null {
  const latencies = latencyMetrics.get(entityId);
  if (!latencies || latencies.length < 10) return null;

  const sorted = [...latencies].sort((a, b) => a - b);
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    sampleCount: sorted.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR BUDGETS
// ═══════════════════════════════════════════════════════════════════════════

const errorBudgets: Map<string, ErrorBudget> = new Map();
const errorMetrics: Map<string, { success: number; error: number }> = new Map();

/**
 * Create or update an error budget
 */
export function setErrorBudget(budget: ErrorBudget): void {
  errorBudgets.set(budget.id, budget);
}

/**
 * Get error budget
 */
export function getErrorBudget(budgetId: string): ErrorBudget | null {
  return errorBudgets.get(budgetId) || null;
}

/**
 * Get all error budgets
 */
export function getAllErrorBudgets(): ErrorBudget[] {
  return Array.from(errorBudgets.values());
}

/**
 * Check error budget after trace completion
 */
function checkErrorBudgets(trace: ExecutionTrace): void {
  const entityId = trace.entityId;
  const metrics = errorMetrics.get(entityId) || { success: 0, error: 0 };

  if (trace.status === 'success') {
    metrics.success++;
  } else if (trace.status === 'error') {
    metrics.error++;
  }

  errorMetrics.set(entityId, metrics);

  // Update budgets
  errorBudgets.forEach(budget => {
    const total = metrics.success + metrics.error;
    if (total < 10) return;

    budget.errorCount = metrics.error;
    budget.totalCount = total;
    budget.currentSuccessRate = metrics.success / total;
    budget.budgetRemaining = Math.max(
      0,
      ((budget.currentSuccessRate - budget.targetSuccessRate) / (1 - budget.targetSuccessRate)) * 100
    );
    budget.lastUpdated = new Date().toISOString();

    // Alert if budget exhausted
    if (budget.budgetRemaining <= 0) {
      triggerErrorBudgetAlert(budget);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTING
// ═══════════════════════════════════════════════════════════════════════════

const alertRules: Map<string, AlertRule> = new Map();
const alertEvents: AlertEvent[] = [];
const alertCallbacks: ((event: AlertEvent) => void)[] = [];

/**
 * Create or update an alert rule
 */
export function setAlertRule(rule: AlertRule): void {
  alertRules.set(rule.id, rule);
}

/**
 * Get alert rule
 */
export function getAlertRule(ruleId: string): AlertRule | null {
  return alertRules.get(ruleId) || null;
}

/**
 * Get all alert rules
 */
export function getAllAlertRules(): AlertRule[] {
  return Array.from(alertRules.values());
}

/**
 * Register alert callback
 */
export function onAlert(callback: (event: AlertEvent) => void): () => void {
  alertCallbacks.push(callback);
  return () => {
    const index = alertCallbacks.indexOf(callback);
    if (index >= 0) alertCallbacks.splice(index, 1);
  };
}

/**
 * Get recent alert events
 */
export function getAlertEvents(limit = 100): AlertEvent[] {
  return alertEvents.slice(0, limit);
}

/**
 * Trigger an alert
 */
function triggerAlert(event: AlertEvent): void {
  alertEvents.unshift(event);
  if (alertEvents.length > 1000) alertEvents.pop();

  // Update rule
  const rule = alertRules.get(event.ruleId);
  if (rule) {
    rule.lastTriggered = event.triggeredAt;
    rule.triggerCount++;
  }

  // Notify callbacks
  alertCallbacks.forEach(cb => {
    try {
      cb(event);
    } catch (e) {
      console.error('Alert callback error:', e);
    }
  });

  // Send webhook if configured
  if (rule?.webhookUrl) {
    sendAlertWebhook(rule.webhookUrl, event);
  }
}

/**
 * Trigger latency alert
 */
function triggerLatencyAlert(budget: LatencyBudget, trace: ExecutionTrace): void {
  const event: AlertEvent = {
    id: `alert_${Date.now()}`,
    ruleId: `latency_budget_${budget.id}`,
    ruleName: `Latency Budget: ${budget.name}`,
    severity: 'warning',
    triggeredAt: new Date().toISOString(),
    message: `Latency budget exceeded. P95: ${budget.currentP95Ms}ms (target: ${budget.targetP95Ms}ms)`,
    metricValue: budget.currentP95Ms || 0,
    threshold: budget.targetP95Ms,
    metadata: {
      traceId: trace.id,
      entityId: trace.entityId,
      entityName: trace.entityName,
    },
  };
  triggerAlert(event);
}

/**
 * Trigger error alert
 */
function triggerErrorAlert(trace: ExecutionTrace): void {
  const event: AlertEvent = {
    id: `alert_${Date.now()}`,
    ruleId: `error_${trace.entityId}`,
    ruleName: `Execution Error: ${trace.entityName}`,
    severity: 'critical',
    triggeredAt: new Date().toISOString(),
    message: `Execution failed: ${trace.error?.message || 'Unknown error'}`,
    metricValue: 1,
    threshold: 0,
    metadata: {
      traceId: trace.id,
      entityId: trace.entityId,
      errorCode: trace.error?.code,
    },
  };
  triggerAlert(event);
}

/**
 * Trigger error budget alert
 */
function triggerErrorBudgetAlert(budget: ErrorBudget): void {
  const event: AlertEvent = {
    id: `alert_${Date.now()}`,
    ruleId: `error_budget_${budget.id}`,
    ruleName: `Error Budget: ${budget.name}`,
    severity: 'critical',
    triggeredAt: new Date().toISOString(),
    message: `Error budget exhausted. Success rate: ${((budget.currentSuccessRate || 0) * 100).toFixed(2)}%`,
    metricValue: budget.currentSuccessRate || 0,
    threshold: budget.targetSuccessRate,
    metadata: {
      errorCount: budget.errorCount,
      totalCount: budget.totalCount,
    },
  };
  triggerAlert(event);
}

/**
 * Send alert to webhook
 */
async function sendAlertWebhook(url: string, event: AlertEvent): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error('Failed to send alert webhook:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// METRICS AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════

export interface MetricsSummary {
  totalExecutions: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalCost: number;
  avgCost: number;
}

/**
 * Get metrics summary for an entity
 */
export function getMetricsSummary(entityId: string): MetricsSummary | null {
  const traces = completedTraces.filter(t => t.entityId === entityId);
  if (traces.length === 0) return null;

  const successTraces = traces.filter(t => t.status === 'success');
  const latencies = traces
    .filter(t => t.durationMs !== undefined)
    .map(t => t.durationMs!)
    .sort((a, b) => a - b);
  const costs = traces
    .filter(t => t.actualCost !== undefined)
    .map(t => t.actualCost!);

  return {
    totalExecutions: traces.length,
    successCount: successTraces.length,
    errorCount: traces.length - successTraces.length,
    successRate: successTraces.length / traces.length,
    avgLatencyMs: latencies.reduce((a, b) => a + b, 0) / latencies.length || 0,
    p50LatencyMs: latencies[Math.floor(latencies.length * 0.5)] || 0,
    p95LatencyMs: latencies[Math.floor(latencies.length * 0.95)] || 0,
    p99LatencyMs: latencies[Math.floor(latencies.length * 0.99)] || 0,
    totalCost: costs.reduce((a, b) => a + b, 0),
    avgCost: costs.reduce((a, b) => a + b, 0) / costs.length || 0,
  };
}

/**
 * Get global metrics summary
 */
export function getGlobalMetricsSummary(): MetricsSummary {
  const traces = completedTraces;
  const successTraces = traces.filter(t => t.status === 'success');
  const latencies = traces
    .filter(t => t.durationMs !== undefined)
    .map(t => t.durationMs!)
    .sort((a, b) => a - b);
  const costs = traces
    .filter(t => t.actualCost !== undefined)
    .map(t => t.actualCost!);

  return {
    totalExecutions: traces.length,
    successCount: successTraces.length,
    errorCount: traces.length - successTraces.length,
    successRate: traces.length > 0 ? successTraces.length / traces.length : 1,
    avgLatencyMs: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
    p50LatencyMs: latencies[Math.floor(latencies.length * 0.5)] || 0,
    p95LatencyMs: latencies[Math.floor(latencies.length * 0.95)] || 0,
    p99LatencyMs: latencies[Math.floor(latencies.length * 0.99)] || 0,
    totalCost: costs.reduce((a, b) => a + b, 0),
    avgCost: costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize default latency budgets
 */
export function initializeDefaultLatencyBudgets(): void {
  setLatencyBudget({
    id: 'default-skill-latency',
    name: 'Default Skill Latency',
    targetP50Ms: 5000,
    targetP95Ms: 15000,
    targetP99Ms: 30000,
    maxMs: 60000,
    windowMinutes: 60,
    withinBudget: true,
  });

  setLatencyBudget({
    id: 'default-workflow-latency',
    name: 'Default Workflow Latency',
    targetP50Ms: 30000,
    targetP95Ms: 90000,
    targetP99Ms: 180000,
    maxMs: 300000,
    windowMinutes: 60,
    withinBudget: true,
  });
}

/**
 * Initialize default error budgets
 */
export function initializeDefaultErrorBudgets(): void {
  setErrorBudget({
    id: 'default-error-budget',
    name: 'Default Error Budget',
    targetSuccessRate: 0.95,
    windowDays: 7,
    currentSuccessRate: 1,
    errorCount: 0,
    totalCount: 0,
    budgetRemaining: 100,
  });
}

// Initialize defaults
initializeDefaultLatencyBudgets();
initializeDefaultErrorBudgets();
