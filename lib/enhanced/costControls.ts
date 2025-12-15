/**
 * Cost Controls Service
 *
 * Provides cost estimation, budget management, and provider routing
 * for skills and workflows.
 */

import type {
  CostEstimate,
  BudgetConfig,
  ProviderRoutingConfig,
  ProviderConfig,
  RoutingRule,
  CostRecord,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// PRICING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Token pricing by provider and model (per 1M tokens in USD)
 */
export const TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  // Claude models
  'claude-3-5-sonnet': { input: 3.00, output: 15.00 },
  'claude-3-5-haiku': { input: 0.80, output: 4.00 },
  'claude-3-opus': { input: 15.00, output: 75.00 },

  // Gemini models
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },

  // GPT models (for future expansion)
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-4o': { input: 5.00, output: 15.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
};

/**
 * Average tokens per character (approximation)
 */
const TOKENS_PER_CHAR = 0.25;

/**
 * Average output tokens per input token (varies by task)
 */
const DEFAULT_OUTPUT_RATIO = 2.0;

// ═══════════════════════════════════════════════════════════════════════════
// COST ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Estimate cost for a skill execution
 */
export function estimateSkillCost(params: {
  skillId: string;
  inputs: Record<string, unknown>;
  provider: string;
  model: string;
  maxTokens?: number;
}): CostEstimate {
  // Calculate input size
  const inputText = Object.values(params.inputs)
    .filter(v => typeof v === 'string')
    .join(' ');
  const estimatedInputTokens = Math.ceil(inputText.length * TOKENS_PER_CHAR);

  // Estimate output tokens
  const maxOutputTokens = params.maxTokens || 4096;
  const estimatedOutputTokens = Math.min(
    estimatedInputTokens * DEFAULT_OUTPUT_RATIO,
    maxOutputTokens
  );

  return calculateCost({
    skillId: params.skillId,
    estimatedInputTokens,
    estimatedOutputTokens,
    provider: params.provider,
    model: params.model,
  });
}

/**
 * Estimate cost for a workflow execution
 */
export function estimateWorkflowCost(params: {
  workflowId: string;
  steps: { skillId: string; provider: string; model: string; maxTokens?: number }[];
  globalInputs: Record<string, unknown>;
}): CostEstimate {
  // Calculate base input size
  const baseInputText = Object.values(params.globalInputs)
    .filter(v => typeof v === 'string')
    .join(' ');
  const baseInputTokens = Math.ceil(baseInputText.length * TOKENS_PER_CHAR);

  // Sum up step costs
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;

  for (const step of params.steps) {
    // Each step gets base input plus accumulated context
    const stepInputTokens = baseInputTokens + totalOutputTokens * 0.3; // 30% of previous outputs as context
    const maxOutputTokens = step.maxTokens || 4096;
    const stepOutputTokens = Math.min(stepInputTokens * DEFAULT_OUTPUT_RATIO, maxOutputTokens);

    const stepCost = calculateCost({
      skillId: step.skillId,
      estimatedInputTokens: stepInputTokens,
      estimatedOutputTokens: stepOutputTokens,
      provider: step.provider,
      model: step.model,
    });

    totalInputTokens += stepInputTokens;
    totalOutputTokens += stepOutputTokens;
    totalCost += stepCost.totalCost;
  }

  // Use the most common model for pricing display
  const primaryStep = params.steps[0];
  const pricing = TOKEN_PRICING[primaryStep.model] || TOKEN_PRICING['claude-3-5-haiku'];

  return {
    workflowId: params.workflowId,
    estimatedInputTokens: Math.round(totalInputTokens),
    estimatedOutputTokens: Math.round(totalOutputTokens),
    inputCost: (totalInputTokens / 1_000_000) * pricing.input,
    outputCost: (totalOutputTokens / 1_000_000) * pricing.output,
    totalCost,
    currency: 'USD',
    provider: primaryStep.provider,
    model: primaryStep.model,
    pricePerInputToken: pricing.input / 1_000_000,
    pricePerOutputToken: pricing.output / 1_000_000,
    confidence: 'medium',
    estimatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate cost from token counts
 */
function calculateCost(params: {
  skillId?: string;
  workflowId?: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  provider: string;
  model: string;
}): CostEstimate {
  const pricing = TOKEN_PRICING[params.model] || { input: 1.0, output: 3.0 };

  const inputCost = (params.estimatedInputTokens / 1_000_000) * pricing.input;
  const outputCost = (params.estimatedOutputTokens / 1_000_000) * pricing.output;

  return {
    skillId: params.skillId,
    workflowId: params.workflowId,
    estimatedInputTokens: params.estimatedInputTokens,
    estimatedOutputTokens: params.estimatedOutputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    currency: 'USD',
    provider: params.provider,
    model: params.model,
    pricePerInputToken: pricing.input / 1_000_000,
    pricePerOutputToken: pricing.output / 1_000_000,
    confidence: params.estimatedInputTokens > 1000 ? 'high' : 'medium',
    estimatedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BUDGET MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const budgets: Map<string, BudgetConfig> = new Map();

/**
 * Create or update a budget
 */
export function setBudget(budget: BudgetConfig): void {
  budgets.set(budget.id, budget);
}

/**
 * Get budget by ID
 */
export function getBudget(budgetId: string): BudgetConfig | null {
  return budgets.get(budgetId) || null;
}

/**
 * Get all budgets
 */
export function getAllBudgets(): BudgetConfig[] {
  return Array.from(budgets.values());
}

/**
 * Get applicable budget for a user/team/skill
 */
export function getApplicableBudget(params: {
  userId?: string;
  teamId?: string;
  skillId?: string;
  workflowId?: string;
}): BudgetConfig | null {
  for (const budget of budgets.values()) {
    // Check user scope
    if (budget.scope.userId && budget.scope.userId !== params.userId) {
      continue;
    }

    // Check team scope
    if (budget.scope.teamId && budget.scope.teamId !== params.teamId) {
      continue;
    }

    // Check skill scope
    if (budget.scope.skills && params.skillId) {
      if (!budget.scope.skills.includes(params.skillId)) {
        continue;
      }
    }

    // Check workflow scope
    if (budget.scope.workflows && params.workflowId) {
      if (!budget.scope.workflows.includes(params.workflowId)) {
        continue;
      }
    }

    return budget;
  }

  return null;
}

/**
 * Check if budget allows execution
 */
export function checkBudget(params: {
  budgetId?: string;
  userId?: string;
  teamId?: string;
  estimatedCost: number;
}): {
  allowed: boolean;
  reason?: string;
  remainingDaily?: number;
  remainingWeekly?: number;
  remainingMonthly?: number;
} {
  let budget: BudgetConfig | null = null;

  if (params.budgetId) {
    budget = getBudget(params.budgetId);
  } else {
    budget = getApplicableBudget({
      userId: params.userId,
      teamId: params.teamId,
    });
  }

  if (!budget) {
    return { allowed: true }; // No budget configured
  }

  // Check per-run limit
  if (budget.perRunLimit > 0 && params.estimatedCost > budget.perRunLimit) {
    return {
      allowed: false,
      reason: `Estimated cost $${params.estimatedCost.toFixed(4)} exceeds per-run limit of $${budget.perRunLimit.toFixed(4)}`,
    };
  }

  // Check daily limit
  const remainingDaily = budget.dailyLimit - budget.currentDailyUsage;
  if (budget.dailyLimit > 0 && params.estimatedCost > remainingDaily) {
    return {
      allowed: false,
      reason: `Daily budget exhausted. Remaining: $${remainingDaily.toFixed(4)}`,
      remainingDaily,
    };
  }

  // Check weekly limit
  const remainingWeekly = budget.weeklyLimit - budget.currentWeeklyUsage;
  if (budget.weeklyLimit > 0 && params.estimatedCost > remainingWeekly) {
    return {
      allowed: false,
      reason: `Weekly budget exhausted. Remaining: $${remainingWeekly.toFixed(4)}`,
      remainingWeekly,
    };
  }

  // Check monthly limit
  const remainingMonthly = budget.monthlyLimit - budget.currentMonthlyUsage;
  if (budget.monthlyLimit > 0 && params.estimatedCost > remainingMonthly) {
    return {
      allowed: false,
      reason: `Monthly budget exhausted. Remaining: $${remainingMonthly.toFixed(4)}`,
      remainingMonthly,
    };
  }

  return {
    allowed: true,
    remainingDaily,
    remainingWeekly,
    remainingMonthly,
  };
}

/**
 * Record cost usage against budget
 */
export function recordCostUsage(params: {
  budgetId?: string;
  userId?: string;
  teamId?: string;
  actualCost: number;
}): void {
  let budget: BudgetConfig | null = null;

  if (params.budgetId) {
    budget = getBudget(params.budgetId);
  } else {
    budget = getApplicableBudget({
      userId: params.userId,
      teamId: params.teamId,
    });
  }

  if (!budget) return;

  budget.currentDailyUsage += params.actualCost;
  budget.currentWeeklyUsage += params.actualCost;
  budget.currentMonthlyUsage += params.actualCost;

  // Check notification thresholds
  checkBudgetNotifications(budget);
}

/**
 * Check if budget notifications should be sent
 */
function checkBudgetNotifications(budget: BudgetConfig): void {
  const monthlyPercentage = (budget.currentMonthlyUsage / budget.monthlyLimit) * 100;

  for (const threshold of budget.notifyAt) {
    if (monthlyPercentage >= threshold) {
      // Emit notification (would integrate with alerting system)
      console.log(`Budget ${budget.name} reached ${threshold}% of monthly limit`);
    }
  }
}

/**
 * Reset daily budget counters
 */
export function resetDailyBudgets(): void {
  for (const budget of budgets.values()) {
    budget.currentDailyUsage = 0;
  }
}

/**
 * Reset weekly budget counters
 */
export function resetWeeklyBudgets(): void {
  for (const budget of budgets.values()) {
    budget.currentWeeklyUsage = 0;
  }
}

/**
 * Reset monthly budget counters
 */
export function resetMonthlyBudgets(): void {
  for (const budget of budgets.values()) {
    budget.currentMonthlyUsage = 0;
    budget.lastResetAt = new Date().toISOString();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER ROUTING
// ═══════════════════════════════════════════════════════════════════════════

const routingConfigs: Map<string, ProviderRoutingConfig> = new Map();

/**
 * Set provider routing configuration
 */
export function setRoutingConfig(config: ProviderRoutingConfig): void {
  routingConfigs.set(config.id, config);
}

/**
 * Get routing configuration
 */
export function getRoutingConfig(configId: string): ProviderRoutingConfig | null {
  return routingConfigs.get(configId) || null;
}

/**
 * Get all routing configurations
 */
export function getAllRoutingConfigs(): ProviderRoutingConfig[] {
  return Array.from(routingConfigs.values());
}

/**
 * Select provider and model based on routing rules
 */
export function selectProvider(params: {
  skillCategory?: string;
  estimatedCost?: number;
  tokenCount?: number;
  userTier?: string;
  preferredProvider?: string;
}): { provider: string; model: string; reason: string } {
  // Get active routing config
  const config = Array.from(routingConfigs.values()).find(c => c.enabled);

  if (!config) {
    // Default to Claude Haiku
    return {
      provider: 'claude',
      model: 'claude-3-5-haiku',
      reason: 'Default provider (no routing config)',
    };
  }

  // Check routing rules in priority order
  const sortedRules = [...config.rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    const matches = evaluateRoutingCondition(rule.condition, params);
    if (matches) {
      if (rule.action.type === 'use_provider' && rule.action.provider) {
        const providerConfig = config.providerPriority.find(
          p => p.provider === rule.action.provider && p.enabled
        );
        if (providerConfig) {
          return {
            provider: providerConfig.provider,
            model: rule.action.model || providerConfig.model,
            reason: rule.name,
          };
        }
      }
    }
  }

  // Use priority order
  const availableProviders = config.providerPriority.filter(p => p.enabled);
  if (availableProviders.length > 0) {
    // Weighted random selection for load balancing
    const totalWeight = availableProviders.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;

    for (const provider of availableProviders) {
      random -= provider.weight;
      if (random <= 0) {
        return {
          provider: provider.provider,
          model: provider.model,
          reason: 'Priority order with load balancing',
        };
      }
    }
  }

  // Fallback
  return {
    provider: config.fallbackProvider || 'claude',
    model: 'claude-3-5-haiku',
    reason: 'Fallback provider',
  };
}

/**
 * Evaluate a routing condition
 */
function evaluateRoutingCondition(
  condition: RoutingRule['condition'],
  params: {
    skillCategory?: string;
    estimatedCost?: number;
    tokenCount?: number;
    userTier?: string;
  }
): boolean {
  switch (condition.type) {
    case 'skill_category':
      if (!params.skillCategory) return false;
      if (condition.operator === 'eq') return params.skillCategory === condition.value;
      if (condition.operator === 'in') return (condition.value as string[]).includes(params.skillCategory);
      return false;

    case 'estimated_cost':
      if (params.estimatedCost === undefined) return false;
      if (condition.operator === 'gt') return params.estimatedCost > (condition.value as number);
      if (condition.operator === 'lt') return params.estimatedCost < (condition.value as number);
      return false;

    case 'token_count':
      if (params.tokenCount === undefined) return false;
      if (condition.operator === 'gt') return params.tokenCount > (condition.value as number);
      if (condition.operator === 'lt') return params.tokenCount < (condition.value as number);
      return false;

    case 'user_tier':
      if (!params.userTier) return false;
      if (condition.operator === 'eq') return params.userTier === condition.value;
      if (condition.operator === 'in') return (condition.value as string[]).includes(params.userTier);
      return false;

    default:
      return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COST TRACKING
// ═══════════════════════════════════════════════════════════════════════════

const costRecords: CostRecord[] = [];
const MAX_COST_RECORDS = 10000;

/**
 * Record actual cost after execution
 */
export function recordCost(record: Omit<CostRecord, 'id' | 'timestamp'>): CostRecord {
  const fullRecord: CostRecord = {
    ...record,
    id: `cost_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  costRecords.unshift(fullRecord);

  // Trim old records
  if (costRecords.length > MAX_COST_RECORDS) {
    costRecords.pop();
  }

  // Update budget usage
  recordCostUsage({
    userId: record.userId,
    teamId: record.teamId,
    actualCost: record.cost,
  });

  return fullRecord;
}

/**
 * Get cost records with filtering
 */
export function getCostRecords(params?: {
  userId?: string;
  teamId?: string;
  skillId?: string;
  workflowId?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): CostRecord[] {
  let records = [...costRecords];

  if (params?.userId) {
    records = records.filter(r => r.userId === params.userId);
  }
  if (params?.teamId) {
    records = records.filter(r => r.teamId === params.teamId);
  }
  if (params?.skillId) {
    records = records.filter(r => r.skillId === params.skillId);
  }
  if (params?.workflowId) {
    records = records.filter(r => r.workflowId === params.workflowId);
  }
  if (params?.provider) {
    records = records.filter(r => r.provider === params.provider);
  }
  if (params?.startDate) {
    records = records.filter(r => r.timestamp >= params.startDate!);
  }
  if (params?.endDate) {
    records = records.filter(r => r.timestamp <= params.endDate!);
  }

  return records.slice(0, params?.limit || 100);
}

/**
 * Get cost summary
 */
export function getCostSummary(params?: {
  userId?: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
}): {
  totalCost: number;
  totalTokens: number;
  executionCount: number;
  avgCostPerExecution: number;
  byProvider: Record<string, { cost: number; tokens: number; count: number }>;
  byModel: Record<string, { cost: number; tokens: number; count: number }>;
} {
  const records = getCostRecords({
    userId: params?.userId,
    teamId: params?.teamId,
    startDate: params?.startDate,
    endDate: params?.endDate,
    limit: MAX_COST_RECORDS,
  });

  const summary = {
    totalCost: 0,
    totalTokens: 0,
    executionCount: records.length,
    avgCostPerExecution: 0,
    byProvider: {} as Record<string, { cost: number; tokens: number; count: number }>,
    byModel: {} as Record<string, { cost: number; tokens: number; count: number }>,
  };

  for (const record of records) {
    summary.totalCost += record.cost;
    summary.totalTokens += record.totalTokens;

    // By provider
    if (!summary.byProvider[record.provider]) {
      summary.byProvider[record.provider] = { cost: 0, tokens: 0, count: 0 };
    }
    summary.byProvider[record.provider].cost += record.cost;
    summary.byProvider[record.provider].tokens += record.totalTokens;
    summary.byProvider[record.provider].count++;

    // By model
    if (!summary.byModel[record.model]) {
      summary.byModel[record.model] = { cost: 0, tokens: 0, count: 0 };
    }
    summary.byModel[record.model].cost += record.cost;
    summary.byModel[record.model].tokens += record.totalTokens;
    summary.byModel[record.model].count++;
  }

  summary.avgCostPerExecution = records.length > 0 ? summary.totalCost / records.length : 0;

  return summary;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize default budget
 */
export function initializeDefaultBudget(): void {
  setBudget({
    id: 'default-budget',
    name: 'Default Budget',
    dailyLimit: 10.0,
    weeklyLimit: 50.0,
    monthlyLimit: 150.0,
    perRunLimit: 1.0,
    scope: {},
    onLimitReached: 'warn',
    notifyAt: [50, 80, 90, 100],
    currentDailyUsage: 0,
    currentWeeklyUsage: 0,
    currentMonthlyUsage: 0,
    lastResetAt: new Date().toISOString(),
  });
}

/**
 * Initialize default routing config
 */
export function initializeDefaultRouting(): void {
  setRoutingConfig({
    id: 'default-routing',
    name: 'Default Provider Routing',
    enabled: true,
    providerPriority: [
      {
        provider: 'claude',
        model: 'claude-3-5-haiku',
        enabled: true,
        weight: 70,
        maxConcurrent: 10,
        inputTokenPrice: 0.80,
        outputTokenPrice: 4.00,
        rateLimit: 50,
        maxTokens: 8192,
      },
      {
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        enabled: true,
        weight: 30,
        maxConcurrent: 10,
        inputTokenPrice: 0.075,
        outputTokenPrice: 0.30,
        rateLimit: 60,
        maxTokens: 8192,
      },
    ],
    rules: [
      {
        id: 'high-cost-downgrade',
        name: 'Downgrade high-cost requests',
        condition: {
          type: 'estimated_cost',
          operator: 'gt',
          value: 0.50,
        },
        action: {
          type: 'use_provider',
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          reason: 'Cost optimization',
        },
        priority: 1,
      },
    ],
    fallbackProvider: 'claude',
    fallbackOnError: true,
    fallbackOnRateLimit: true,
    fallbackOnBudget: false,
  });
}

// Initialize defaults
initializeDefaultBudget();
initializeDefaultRouting();
