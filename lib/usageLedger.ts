/**
 * Usage Ledger System
 *
 * Records all AI provider usage for billing and analytics.
 * Supports both platform-billed and user-billed runs.
 *
 * In production, this would sync with a backend database.
 * Currently uses IndexedDB for local storage.
 */

import type { ApiProvider } from './platformKeys';
import { getModelById, deductPlatformBalance } from './platformKeys';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UsageRecord {
  id: string;
  timestamp: string;

  // User info
  userId: string | null; // null for anonymous
  userEmail?: string;
  userRole?: string;

  // Execution info
  skillId: string;
  skillName: string;
  workflowId?: string;
  workflowStep?: number;

  // Provider info
  provider: ApiProvider;
  model: string;

  // Token usage
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  // Cost (in cents)
  estimatedCost: number;

  // Billing
  billingMode: 'platform' | 'personal';
  billed: boolean;

  // Execution details
  durationMs: number;
  success: boolean;
  errorMessage?: string;
}

export interface UsageSummary {
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<ApiProvider, {
    runs: number;
    tokens: number;
    cost: number;
  }>;
  byModel: Record<string, {
    runs: number;
    tokens: number;
    cost: number;
  }>;
  byBillingMode: {
    platform: { runs: number; cost: number };
    personal: { runs: number; cost: number };
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE (IndexedDB)
// ═══════════════════════════════════════════════════════════════════════════

const DB_NAME = 'skillengine_usage';
const STORE_NAME = 'usage_records';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('provider', 'provider', { unique: false });
        store.createIndex('billingMode', 'billingMode', { unique: false });
        store.createIndex('skillId', 'skillId', { unique: false });
      }
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// COST ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Estimate cost for a given token usage
 */
export function estimateCost(
  provider: ApiProvider,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const modelConfig = getModelById(provider, model);
  if (!modelConfig) return 0;

  // Cost per 1k tokens (in cents)
  const costPer1k = modelConfig.costPer1kTokens;

  // Input tokens are typically cheaper (about 1/3 the cost)
  const inputCost = (inputTokens / 1000) * costPer1k * 0.33;
  const outputCost = (outputTokens / 1000) * costPer1k;

  return Math.round((inputCost + outputCost) * 100) / 100; // Round to 2 decimal places
}

/**
 * Estimate tokens from text (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

// ═══════════════════════════════════════════════════════════════════════════
// RECORD MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record a usage event
 */
export async function recordUsage(
  record: Omit<UsageRecord, 'id' | 'timestamp' | 'billed'>
): Promise<UsageRecord> {
  const db = await getDB();

  const fullRecord: UsageRecord = {
    ...record,
    id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    billed: false,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(fullRecord);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // If platform billing, deduct from balance
      if (record.billingMode === 'platform' && record.success) {
        deductPlatformBalance(record.provider, record.estimatedCost);
      }
      resolve(fullRecord);
    };
  });
}

/**
 * Get all usage records
 */
export async function getUsageRecords(
  filters?: {
    userId?: string;
    provider?: ApiProvider;
    billingMode?: 'platform' | 'personal';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<UsageRecord[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      let records: UsageRecord[] = request.result;

      // Apply filters
      if (filters) {
        if (filters.userId !== undefined) {
          records = records.filter(r => r.userId === filters.userId);
        }
        if (filters.provider) {
          records = records.filter(r => r.provider === filters.provider);
        }
        if (filters.billingMode) {
          records = records.filter(r => r.billingMode === filters.billingMode);
        }
        if (filters.startDate) {
          records = records.filter(r => r.timestamp >= filters.startDate!);
        }
        if (filters.endDate) {
          records = records.filter(r => r.timestamp <= filters.endDate!);
        }
      }

      // Sort by timestamp descending
      records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply limit
      if (filters?.limit) {
        records = records.slice(0, filters.limit);
      }

      resolve(records);
    };
  });
}

/**
 * Get usage summary for a time period
 */
export async function getUsageSummary(
  startDate?: string,
  endDate?: string,
  userId?: string
): Promise<UsageSummary> {
  const records = await getUsageRecords({
    startDate,
    endDate,
    userId,
  });

  const summary: UsageSummary = {
    totalRuns: 0,
    totalTokens: 0,
    totalCost: 0,
    byProvider: {
      gemini: { runs: 0, tokens: 0, cost: 0 },
      claude: { runs: 0, tokens: 0, cost: 0 },
      chatgpt: { runs: 0, tokens: 0, cost: 0 },
    },
    byModel: {},
    byBillingMode: {
      platform: { runs: 0, cost: 0 },
      personal: { runs: 0, cost: 0 },
    },
  };

  for (const record of records) {
    summary.totalRuns++;
    summary.totalTokens += record.totalTokens;
    summary.totalCost += record.estimatedCost;

    // By provider
    summary.byProvider[record.provider].runs++;
    summary.byProvider[record.provider].tokens += record.totalTokens;
    summary.byProvider[record.provider].cost += record.estimatedCost;

    // By model
    if (!summary.byModel[record.model]) {
      summary.byModel[record.model] = { runs: 0, tokens: 0, cost: 0 };
    }
    summary.byModel[record.model].runs++;
    summary.byModel[record.model].tokens += record.totalTokens;
    summary.byModel[record.model].cost += record.estimatedCost;

    // By billing mode
    summary.byBillingMode[record.billingMode].runs++;
    summary.byBillingMode[record.billingMode].cost += record.estimatedCost;
  }

  return summary;
}

/**
 * Get recent usage for display
 */
export async function getRecentUsage(limit: number = 10): Promise<UsageRecord[]> {
  return getUsageRecords({ limit });
}

/**
 * Clear all usage records (admin function)
 */
export async function clearAllUsageRecords(): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FOR SKILL EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a usage record from skill execution
 */
export function createUsageRecordFromExecution(params: {
  userId: string | null;
  userEmail?: string;
  userRole?: string;
  skillId: string;
  skillName: string;
  workflowId?: string;
  workflowStep?: number;
  provider: ApiProvider;
  model: string;
  inputText: string;
  outputText: string;
  billingMode: 'platform' | 'personal';
  durationMs: number;
  success: boolean;
  errorMessage?: string;
}): Omit<UsageRecord, 'id' | 'timestamp' | 'billed'> {
  const inputTokens = estimateTokens(params.inputText);
  const outputTokens = estimateTokens(params.outputText);
  const estimatedCost = params.success
    ? estimateCost(params.provider, params.model, inputTokens, outputTokens)
    : 0;

  return {
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    skillId: params.skillId,
    skillName: params.skillName,
    workflowId: params.workflowId,
    workflowStep: params.workflowStep,
    provider: params.provider,
    model: params.model,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCost,
    billingMode: params.billingMode,
    durationMs: params.durationMs,
    success: params.success,
    errorMessage: params.errorMessage,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BUDGET ALERTS
// ═══════════════════════════════════════════════════════════════════════════

export interface BudgetAlert {
  type: 'warning' | 'critical' | 'exceeded';
  provider: ApiProvider;
  currentBalance: number;
  threshold: number;
  message: string;
}

const BUDGET_THRESHOLDS = {
  warning: 500, // $5.00 remaining
  critical: 100, // $1.00 remaining
};

/**
 * Check if budget alerts should be shown
 */
export function checkBudgetAlerts(provider: ApiProvider, balance: number): BudgetAlert | null {
  if (balance <= 0) {
    return {
      type: 'exceeded',
      provider,
      currentBalance: balance,
      threshold: 0,
      message: `${provider} credits depleted. Add more credits to continue using platform keys.`,
    };
  }

  if (balance <= BUDGET_THRESHOLDS.critical) {
    return {
      type: 'critical',
      provider,
      currentBalance: balance,
      threshold: BUDGET_THRESHOLDS.critical,
      message: `Low ${provider} credits! Only $${(balance / 100).toFixed(2)} remaining.`,
    };
  }

  if (balance <= BUDGET_THRESHOLDS.warning) {
    return {
      type: 'warning',
      provider,
      currentBalance: balance,
      threshold: BUDGET_THRESHOLDS.warning,
      message: `${provider} credits running low. $${(balance / 100).toFixed(2)} remaining.`,
    };
  }

  return null;
}
