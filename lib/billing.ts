/**
 * Billing System
 *
 * Handles user credits, tier-based model access, and cost calculations.
 * Steers free users to cheaper models, paid users to premium models.
 */

import type { ApiProvider, ModelOption } from './platformKeys';
import {
  GEMINI_MODELS,
  CLAUDE_MODELS,
  CHATGPT_MODELS,
  getModelsForProvider,
} from './platformKeys';
import { logger } from './logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type UserTier = 'free' | 'starter' | 'pro' | 'power' | 'team' | 'custom';

export interface UserCredits {
  tier: UserTier;
  balance: number; // in cents
  monthlyAllocation: number;
  usedThisMonth: number;
  resetDate: string; // ISO date
}

export interface TierConfig {
  name: string;
  monthlyPrice: number; // in cents
  monthlyCredits: number; // in cents
  allowedModels: Record<ApiProvider, string[]>;
  maxOutputTokens: Record<string, number>;
  features: string[];
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  inputCost: number; // cents
  outputCost: number; // cents
  totalCost: number; // cents
  model: string;
  provider: ApiProvider;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    monthlyCredits: 50, // $0.50 - about 10-20 runs with cheap models
    allowedModels: {
      gemini: ['gemini-2.0-flash'],
      claude: ['haiku'],
      chatgpt: ['gpt-4o-mini'],
    },
    maxOutputTokens: {
      'gemini-2.0-flash': 2048,
      'haiku': 2048,
      'gpt-4o-mini': 2048,
    },
    features: ['Basic skills', '10-20 runs/month', 'Standard output'],
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 900, // $9
    monthlyCredits: 500, // $5.00 - about 50-100 runs
    allowedModels: {
      gemini: ['gemini-2.0-flash', 'gemini-1.5-pro'],
      claude: ['haiku', 'sonnet'],
      chatgpt: ['gpt-4o-mini', 'gpt-4o'],
    },
    maxOutputTokens: {
      'gemini-2.0-flash': 4096,
      'gemini-1.5-pro': 4096,
      'haiku': 4096,
      'sonnet': 4096,
      'gpt-4o-mini': 4096,
      'gpt-4o': 4096,
    },
    features: ['All basic models', '50-100 runs/month', 'Extended output'],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 2900, // $29
    monthlyCredits: 2000, // $20.00 - about 200-400 runs
    allowedModels: {
      gemini: ['gemini-2.0-flash', 'gemini-1.5-pro'],
      claude: ['haiku', 'sonnet', 'opus'],
      chatgpt: ['gpt-4o-mini', 'gpt-4o', 'o1-mini'],
    },
    maxOutputTokens: {
      'gemini-2.0-flash': 8192,
      'gemini-1.5-pro': 8192,
      'haiku': 8192,
      'sonnet': 8192,
      'opus': 4096,
      'gpt-4o-mini': 4096,
      'gpt-4o': 4096,
      'o1-mini': 4096,
    },
    features: ['Premium models', '200-400 runs/month', 'Full output', 'Workflows'],
  },
  power: {
    name: 'Power',
    monthlyPrice: 7900, // $79
    monthlyCredits: 8000, // $80.00 - about 800-1500 runs
    allowedModels: {
      gemini: ['gemini-2.0-flash', 'gemini-1.5-pro'],
      claude: ['haiku', 'sonnet', 'opus'],
      chatgpt: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o1-preview'],
    },
    maxOutputTokens: {
      'gemini-2.0-flash': 8192,
      'gemini-1.5-pro': 8192,
      'haiku': 8192,
      'sonnet': 8192,
      'opus': 4096,
      'gpt-4o-mini': 16384,
      'gpt-4o': 16384,
      'o1-mini': 16384,
      'o1-preview': 16384,
    },
    features: ['All models', '800+ runs/month', 'Maximum output', 'Priority'],
  },
  team: {
    name: 'Team',
    monthlyPrice: 19900, // $199
    monthlyCredits: 25000, // $250.00
    allowedModels: {
      gemini: ['gemini-2.0-flash', 'gemini-1.5-pro'],
      claude: ['haiku', 'sonnet', 'opus'],
      chatgpt: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o1-preview'],
    },
    maxOutputTokens: {
      'gemini-2.0-flash': 8192,
      'gemini-1.5-pro': 8192,
      'haiku': 8192,
      'sonnet': 8192,
      'opus': 4096,
      'gpt-4o-mini': 16384,
      'gpt-4o': 16384,
      'o1-mini': 32768,
      'o1-preview': 32768,
    },
    features: ['All models', 'Unlimited team', 'Maximum output', 'Dedicated support'],
  },
  custom: {
    name: 'Custom',
    monthlyPrice: 0,
    monthlyCredits: 100000, // Admin tier
    allowedModels: {
      gemini: ['gemini-2.0-flash', 'gemini-1.5-pro'],
      claude: ['haiku', 'sonnet', 'opus'],
      chatgpt: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o1-preview'],
    },
    maxOutputTokens: {
      'gemini-2.0-flash': 8192,
      'gemini-1.5-pro': 8192,
      'haiku': 8192,
      'sonnet': 8192,
      'opus': 4096,
      'gpt-4o-mini': 16384,
      'gpt-4o': 16384,
      'o1-mini': 32768,
      'o1-preview': 32768,
    },
    features: ['All features', 'Custom limits'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MODEL PRICING (Accurate as of Dec 2024)
// Cost per 1 MILLION tokens in DOLLARS
// ═══════════════════════════════════════════════════════════════════════════

export const MODEL_PRICING = {
  // Gemini (very affordable)
  'gemini-2.0-flash': { input: 0.075, output: 0.30 }, // $0.075/1M in, $0.30/1M out
  'gemini-1.5-pro': { input: 1.25, output: 5.00 }, // $1.25/1M in, $5.00/1M out

  // Claude (Dec 2024 pricing)
  'haiku': { input: 0.25, output: 1.25 }, // Claude 3.5 Haiku: $0.25/1M in, $1.25/1M out
  'sonnet': { input: 3.00, output: 15.00 }, // Claude 3.5 Sonnet: $3/1M in, $15/1M out
  'opus': { input: 15.00, output: 75.00 }, // Claude Opus 4: $15/1M in, $75/1M out

  // ChatGPT
  'gpt-4o-mini': { input: 0.15, output: 0.60 }, // $0.15/1M in, $0.60/1M out
  'gpt-4o': { input: 2.50, output: 10.00 }, // $2.50/1M in, $10.00/1M out
  'o1-mini': { input: 3.00, output: 12.00 }, // $3/1M in, $12/1M out
  'o1-preview': { input: 15.00, output: 60.00 }, // $15/1M in, $60/1M out
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPICAL TOKEN USAGE
// ═══════════════════════════════════════════════════════════════════════════

// Average token counts based on skill complexity
export const TYPICAL_USAGE = {
  // Single skill run
  skill: {
    simple: { input: 500, output: 800 },
    standard: { input: 1500, output: 1500 },
    complex: { input: 3000, output: 3000 },
  },
  // Workflow (multiple steps)
  workflow: {
    small: { input: 3000, output: 4000, steps: 3 }, // 3-step workflow
    medium: { input: 6000, output: 8000, steps: 5 }, // 5-step workflow
    large: { input: 10000, output: 15000, steps: 7 }, // 7+ step workflow
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COST CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate cost for a given model and token usage
 * Returns cost in CENTS
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): CostEstimate {
  const pricing = MODEL_PRICING[modelId as keyof typeof MODEL_PRICING];
  if (!pricing) {
    return {
      inputTokens,
      outputTokens,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      model: modelId,
      provider: 'gemini',
    };
  }

  // Price is per million tokens, convert to cents
  const inputCost = (inputTokens / 1_000_000) * pricing.input * 100;
  const outputCost = (outputTokens / 1_000_000) * pricing.output * 100;

  // Determine provider
  let provider: ApiProvider = 'gemini';
  if (['haiku', 'sonnet', 'opus'].includes(modelId)) provider = 'claude';
  if (['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o1-preview'].includes(modelId)) provider = 'chatgpt';

  return {
    inputTokens,
    outputTokens,
    inputCost: Math.round(inputCost * 100) / 100,
    outputCost: Math.round(outputCost * 100) / 100,
    totalCost: Math.round((inputCost + outputCost) * 100) / 100,
    model: modelId,
    provider,
  };
}

/**
 * Estimate cost for a skill run
 */
export function estimateSkillCost(
  modelId: string,
  complexity: 'simple' | 'standard' | 'complex' = 'standard'
): CostEstimate {
  const usage = TYPICAL_USAGE.skill[complexity];
  return calculateCost(modelId, usage.input, usage.output);
}

/**
 * Estimate cost for a workflow
 */
export function estimateWorkflowCost(
  modelId: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): CostEstimate {
  const usage = TYPICAL_USAGE.workflow[size];
  return calculateCost(modelId, usage.input, usage.output);
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER-BASED MODEL SELECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the recommended model for a user's tier
 * Free users get cheap models, paid users get premium
 */
export function getRecommendedModel(tier: UserTier, provider: ApiProvider): string {
  const tierConfig = TIER_CONFIGS[tier];
  const allowedModels = tierConfig.allowedModels[provider];

  // For paid tiers, recommend the best available model
  if (tier !== 'free') {
    // Prefer premium models for paid users
    const premiumOrder = {
      gemini: ['gemini-1.5-pro', 'gemini-2.0-flash'],
      claude: ['sonnet', 'opus', 'haiku'], // Sonnet is best value for quality
      chatgpt: ['gpt-4o', 'gpt-4o-mini', 'o1-mini'],
    };

    for (const model of premiumOrder[provider]) {
      if (allowedModels.includes(model)) {
        return model;
      }
    }
  }

  // For free tier, return the cheapest model
  const cheapOrder = {
    gemini: ['gemini-2.0-flash'],
    claude: ['haiku'],
    chatgpt: ['gpt-4o-mini'],
  };

  return cheapOrder[provider][0];
}

/**
 * Check if a model is allowed for a tier
 */
export function isModelAllowedForTier(tier: UserTier, provider: ApiProvider, modelId: string): boolean {
  const tierConfig = TIER_CONFIGS[tier];
  return tierConfig.allowedModels[provider].includes(modelId);
}

/**
 * Get allowed models for a tier
 */
export function getAllowedModels(tier: UserTier, provider: ApiProvider): ModelOption[] {
  const tierConfig = TIER_CONFIGS[tier];
  const allowedIds = tierConfig.allowedModels[provider];
  const allModels = getModelsForProvider(provider);

  return allModels.filter(m => allowedIds.includes(m.id));
}

/**
 * Get max output tokens for a model based on tier
 */
export function getMaxOutputTokens(tier: UserTier, modelId: string): number {
  const tierConfig = TIER_CONFIGS[tier];
  return tierConfig.maxOutputTokens[modelId] || 2048;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER CREDITS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const CREDITS_STORAGE_KEY = 'skillengine_user_credits';
const ADMIN_EMAILS_KEY = 'skillengine_admin_emails';

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if current user is an admin (has full access to all models)
 */
export function isAdmin(userEmail?: string | null): boolean {
  // Check localStorage for admin emails list
  try {
    const adminEmails = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (adminEmails && userEmail) {
      const emails = JSON.parse(adminEmails) as string[];
      return emails.includes(userEmail.toLowerCase());
    }
  } catch {
    // Ignore
  }

  // Check for admin tier
  const credits = getUserCredits();
  return credits.tier === 'custom' || credits.tier === 'team';
}

/**
 * Set admin emails (for initial setup)
 */
export function setAdminEmails(emails: string[]): void {
  localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(emails.map(e => e.toLowerCase())));
}

/**
 * Add an admin email
 */
export function addAdminEmail(email: string): void {
  try {
    const existing = localStorage.getItem(ADMIN_EMAILS_KEY);
    const emails = existing ? JSON.parse(existing) : [];
    if (!emails.includes(email.toLowerCase())) {
      emails.push(email.toLowerCase());
      localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(emails));
    }
  } catch {
    localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify([email.toLowerCase()]));
  }
}

/**
 * Get list of admin emails
 */
export function getAdminEmails(): string[] {
  try {
    const adminEmails = localStorage.getItem(ADMIN_EMAILS_KEY);
    return adminEmails ? JSON.parse(adminEmails) : [];
  } catch {
    return [];
  }
}

export function getUserCredits(): UserCredits {
  try {
    const stored = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (stored) {
      const credits = JSON.parse(stored);
      // Check if we need to reset monthly allocation
      const resetDate = new Date(credits.resetDate);
      const now = new Date();
      if (now > resetDate) {
        // Reset monthly usage
        const tierConfig = TIER_CONFIGS[credits.tier as UserTier];
        return {
          ...credits,
          balance: credits.balance + tierConfig.monthlyCredits,
          usedThisMonth: 0,
          resetDate: getNextResetDate(),
        };
      }
      return credits;
    }
  } catch (error) {
    logger.error('Failed to load user credits', { error: error instanceof Error ? error.message : String(error) });
  }

  // Default: free tier
  return {
    tier: 'free',
    balance: TIER_CONFIGS.free.monthlyCredits,
    monthlyAllocation: TIER_CONFIGS.free.monthlyCredits,
    usedThisMonth: 0,
    resetDate: getNextResetDate(),
  };
}

export function saveUserCredits(credits: UserCredits): void {
  try {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits));
  } catch (error) {
    logger.error('Failed to save user credits', { error: error instanceof Error ? error.message : String(error) });
  }
}

export function deductCredits(amount: number): boolean {
  const credits = getUserCredits();
  if (credits.balance < amount) {
    return false; // Insufficient credits
  }

  saveUserCredits({
    ...credits,
    balance: credits.balance - amount,
    usedThisMonth: credits.usedThisMonth + amount,
  });

  return true;
}

export function addCredits(amount: number): void {
  const credits = getUserCredits();
  saveUserCredits({
    ...credits,
    balance: credits.balance + amount,
  });
}

export function setUserTier(tier: UserTier): void {
  const credits = getUserCredits();
  const tierConfig = TIER_CONFIGS[tier];

  saveUserCredits({
    ...credits,
    tier,
    monthlyAllocation: tierConfig.monthlyCredits,
  });
}

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

// ═══════════════════════════════════════════════════════════════════════════
// COST ESTIMATE REPORT
// ═══════════════════════════════════════════════════════════════════════════

export interface CostReport {
  model: string;
  provider: ApiProvider;
  skillCost: {
    simple: string;
    standard: string;
    complex: string;
  };
  workflowCost: {
    small: string;
    medium: string;
    large: string;
  };
  runsPerDollar: {
    skill: number;
    workflow: number;
  };
}

/**
 * Generate cost report for all models
 */
export function generateCostReport(): CostReport[] {
  const models = [
    ...GEMINI_MODELS.map(m => ({ ...m, provider: 'gemini' as ApiProvider })),
    ...CLAUDE_MODELS.map(m => ({ ...m, provider: 'claude' as ApiProvider })),
    ...CHATGPT_MODELS.map(m => ({ ...m, provider: 'chatgpt' as ApiProvider })),
  ];

  return models.map(model => {
    const skillSimple = estimateSkillCost(model.id, 'simple');
    const skillStandard = estimateSkillCost(model.id, 'standard');
    const skillComplex = estimateSkillCost(model.id, 'complex');
    const workflowSmall = estimateWorkflowCost(model.id, 'small');
    const workflowMedium = estimateWorkflowCost(model.id, 'medium');
    const workflowLarge = estimateWorkflowCost(model.id, 'large');

    return {
      model: model.name,
      provider: model.provider,
      skillCost: {
        simple: `$${(skillSimple.totalCost / 100).toFixed(4)}`,
        standard: `$${(skillStandard.totalCost / 100).toFixed(4)}`,
        complex: `$${(skillComplex.totalCost / 100).toFixed(4)}`,
      },
      workflowCost: {
        small: `$${(workflowSmall.totalCost / 100).toFixed(4)}`,
        medium: `$${(workflowMedium.totalCost / 100).toFixed(4)}`,
        large: `$${(workflowLarge.totalCost / 100).toFixed(4)}`,
      },
      runsPerDollar: {
        skill: Math.floor(100 / skillStandard.totalCost), // $1.00 = 100 cents
        workflow: Math.floor(100 / workflowMedium.totalCost),
      },
    };
  });
}
