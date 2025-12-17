/**
 * Platform Key Management System
 *
 * Manages admin-configured API keys for platform-wide use.
 * Users can either use platform-provided keys (with usage tracking)
 * or bring their own keys (BYOK mode).
 *
 * SECURITY NOTE: Platform keys should be loaded from environment variables
 * or a secure backend. Never expose raw keys in client-side code.
 */

import { getApiKey, hasStoredKey } from './apiKeyStorage';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ApiProvider = 'gemini' | 'claude' | 'chatgpt';
export type KeyMode = 'platform' | 'personal';

export interface PlatformKeyConfig {
  provider: ApiProvider;
  isAvailable: boolean;
  balance?: number; // Remaining credits/balance in cents
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface KeyModeSelection {
  mode: KeyMode;
  provider: ApiProvider;
  model: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  costPer1kTokens: number; // in cents
  speedTier: 'fast' | 'standard' | 'slow';
  qualityTier: 'basic' | 'standard' | 'premium';
  maxTokens: number;
  supportsStreaming: boolean;
  isDefault?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODEL CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const GEMINI_MODELS: ModelOption[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Fast, efficient model for most tasks',
    costPer1kTokens: 0.01,
    speedTier: 'fast',
    qualityTier: 'standard',
    maxTokens: 8192,
    supportsStreaming: true,
    isDefault: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'High-quality model with large context window',
    costPer1kTokens: 0.125,
    speedTier: 'standard',
    qualityTier: 'premium',
    maxTokens: 8192,
    supportsStreaming: true,
  },
];

export const CLAUDE_MODELS: ModelOption[] = [
  {
    id: 'haiku',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and cost-effective for simple tasks',
    costPer1kTokens: 0.08,
    speedTier: 'fast',
    qualityTier: 'basic',
    maxTokens: 8192,
    supportsStreaming: true,
    isDefault: true,
  },
  {
    id: 'sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Balanced performance and quality',
    costPer1kTokens: 0.3,
    speedTier: 'standard',
    qualityTier: 'standard',
    maxTokens: 8192,
    supportsStreaming: true,
  },
  {
    id: 'opus',
    name: 'Claude Opus 4',
    description: 'Most capable model for complex tasks',
    costPer1kTokens: 0.09, // $15/1M in, $75/1M out = ~$0.09/1K average
    speedTier: 'slow',
    qualityTier: 'premium',
    maxTokens: 4096,
    supportsStreaming: true,
  },
];

export const CHATGPT_MODELS: ModelOption[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and affordable for most tasks',
    costPer1kTokens: 0.015,
    speedTier: 'fast',
    qualityTier: 'standard',
    maxTokens: 4096,
    supportsStreaming: true,
    isDefault: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most capable GPT-4 model',
    costPer1kTokens: 0.5,
    speedTier: 'standard',
    qualityTier: 'premium',
    maxTokens: 4096,
    supportsStreaming: true,
  },
  {
    id: 'o1-mini',
    name: 'o1-mini',
    description: 'Reasoning model for complex problems',
    costPer1kTokens: 0.3,
    speedTier: 'slow',
    qualityTier: 'premium',
    maxTokens: 4096,
    supportsStreaming: false,
  },
  {
    id: 'o1-preview',
    name: 'o1-preview',
    description: 'Advanced reasoning (preview)',
    costPer1kTokens: 1.5,
    speedTier: 'slow',
    qualityTier: 'premium',
    maxTokens: 4096,
    supportsStreaming: false,
  },
];

export function getModelsForProvider(provider: ApiProvider): ModelOption[] {
  switch (provider) {
    case 'gemini':
      return GEMINI_MODELS;
    case 'claude':
      return CLAUDE_MODELS;
    case 'chatgpt':
      return CHATGPT_MODELS;
    default:
      return [];
  }
}

export function getDefaultModel(provider: ApiProvider): ModelOption | undefined {
  const models = getModelsForProvider(provider);
  return models.find(m => m.isDefault) || models[0];
}

export function getModelById(provider: ApiProvider, modelId: string): ModelOption | undefined {
  const models = getModelsForProvider(provider);
  return models.find(m => m.id === modelId);
}

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM KEY STATUS (simulated - would be backend in production)
// ═══════════════════════════════════════════════════════════════════════════

const PLATFORM_KEY_STORAGE = 'skillengine_platform_config';

interface PlatformConfig {
  geminiEnabled: boolean;
  claudeEnabled: boolean;
  chatgptEnabled: boolean;
  balances: {
    gemini: number;
    claude: number;
    chatgpt: number;
  };
  lastUpdated: string;
}

function getDefaultPlatformConfig(): PlatformConfig {
  return {
    geminiEnabled: false,
    claudeEnabled: false,
    chatgptEnabled: false,
    balances: {
      gemini: 0,
      claude: 0,
      chatgpt: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function getPlatformConfig(): PlatformConfig {
  try {
    const stored = localStorage.getItem(PLATFORM_KEY_STORAGE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load platform config:', error);
  }
  return getDefaultPlatformConfig();
}

export function savePlatformConfig(config: Partial<PlatformConfig>): void {
  try {
    const existing = getPlatformConfig();
    const updated = {
      ...existing,
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(PLATFORM_KEY_STORAGE, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save platform config:', error);
  }
}

/**
 * Check if platform keys are available for a provider
 */
export function isPlatformKeyAvailable(provider: ApiProvider): boolean {
  const config = getPlatformConfig();
  switch (provider) {
    case 'gemini':
      return config.geminiEnabled && config.balances.gemini > 0;
    case 'claude':
      return config.claudeEnabled && config.balances.claude > 0;
    case 'chatgpt':
      return config.chatgptEnabled && config.balances.chatgpt > 0;
    default:
      return false;
  }
}

/**
 * Get platform balance for a provider (in cents)
 */
export function getPlatformBalance(provider: ApiProvider): number {
  const config = getPlatformConfig();
  return config.balances[provider] || 0;
}

/**
 * Deduct from platform balance (returns new balance)
 */
export function deductPlatformBalance(provider: ApiProvider, amount: number): number {
  const config = getPlatformConfig();
  const newBalance = Math.max(0, (config.balances[provider] || 0) - amount);
  savePlatformConfig({
    balances: {
      ...config.balances,
      [provider]: newBalance,
    },
  });
  return newBalance;
}

// ═══════════════════════════════════════════════════════════════════════════
// KEY MODE SELECTION
// ═══════════════════════════════════════════════════════════════════════════

const KEY_MODE_STORAGE = 'skillengine_key_mode';

interface StoredKeyMode {
  mode: KeyMode;
  provider: ApiProvider;
  models: Record<ApiProvider, string>;
}

export function getStoredKeyMode(): StoredKeyMode {
  try {
    const stored = localStorage.getItem(KEY_MODE_STORAGE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load key mode:', error);
  }
  return {
    mode: 'personal', // Default to personal keys until platform is set up
    provider: 'gemini',
    models: {
      gemini: 'gemini-2.0-flash',
      claude: 'haiku',
      chatgpt: 'gpt-4o-mini',
    },
  };
}

export function saveKeyMode(mode: KeyMode): void {
  const existing = getStoredKeyMode();
  localStorage.setItem(KEY_MODE_STORAGE, JSON.stringify({
    ...existing,
    mode,
  }));
}

export function saveSelectedProvider(provider: ApiProvider): void {
  const existing = getStoredKeyMode();
  localStorage.setItem(KEY_MODE_STORAGE, JSON.stringify({
    ...existing,
    provider,
  }));
}

export function saveSelectedModel(provider: ApiProvider, modelId: string): void {
  const existing = getStoredKeyMode();
  localStorage.setItem(KEY_MODE_STORAGE, JSON.stringify({
    ...existing,
    models: {
      ...existing.models,
      [provider]: modelId,
    },
  }));
}

export function getSelectedModel(provider: ApiProvider): string {
  const stored = getStoredKeyMode();
  return stored.models[provider] || getDefaultModel(provider)?.id || '';
}

// ═══════════════════════════════════════════════════════════════════════════
// KEY RESOLUTION (determines which key to use)
// ═══════════════════════════════════════════════════════════════════════════

export interface ResolvedKey {
  key: string;
  source: 'platform' | 'personal';
  provider: ApiProvider;
  model: string;
  costEstimate?: number;
}

/**
 * Resolve which API key to use based on current mode and availability
 */
export function resolveApiKey(
  provider: ApiProvider,
  personalKeyOverride?: string
): ResolvedKey | null {
  const stored = getStoredKeyMode();
  const model = stored.models[provider] || getDefaultModel(provider)?.id || '';

  // If personal key provided directly, use it
  if (personalKeyOverride) {
    return {
      key: personalKeyOverride,
      source: 'personal',
      provider,
      model,
    };
  }

  // Check mode preference
  if (stored.mode === 'platform') {
    // TODO: In production, fetch platform key from secure backend
    // For now, platform keys require admin setup
    if (isPlatformKeyAvailable(provider)) {
      // Platform key would come from secure backend call
      return {
        key: '', // Placeholder - actual key from backend
        source: 'platform',
        provider,
        model,
      };
    }
  }

  // Fall back to personal key
  const personalKey = getApiKey(provider);
  if (personalKey) {
    return {
      key: personalKey,
      source: 'personal',
      provider,
      model,
    };
  }

  return null;
}

/**
 * Check if user can run a skill with current configuration
 */
export function canRunSkill(provider: ApiProvider): {
  canRun: boolean;
  reason?: string;
  suggestion?: string;
} {
  const stored = getStoredKeyMode();

  if (stored.mode === 'platform') {
    if (isPlatformKeyAvailable(provider)) {
      return { canRun: true };
    }
    // Check if personal key available as fallback
    if (hasStoredKey(provider)) {
      return {
        canRun: true,
        reason: 'Platform key unavailable, using your personal key',
      };
    }
    return {
      canRun: false,
      reason: `Platform credits not available for ${provider}`,
      suggestion: 'Switch to "Use my key" mode or contact admin to add credits',
    };
  }

  // Personal key mode
  if (hasStoredKey(provider)) {
    return { canRun: true };
  }

  return {
    canRun: false,
    reason: `No ${provider} API key configured`,
    suggestion: `Add your ${provider} API key in Settings, or switch to platform mode`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Admin: Enable platform key for a provider
 */
export function adminEnablePlatformKey(provider: ApiProvider, initialBalance: number): void {
  const config = getPlatformConfig();
  savePlatformConfig({
    [`${provider}Enabled`]: true,
    balances: {
      ...config.balances,
      [provider]: initialBalance,
    },
  });
}

/**
 * Admin: Add credits to platform balance
 */
export function adminAddCredits(provider: ApiProvider, amount: number): void {
  const config = getPlatformConfig();
  savePlatformConfig({
    balances: {
      ...config.balances,
      [provider]: (config.balances[provider] || 0) + amount,
    },
  });
}

/**
 * Admin: Disable platform key for a provider
 */
export function adminDisablePlatformKey(provider: ApiProvider): void {
  savePlatformConfig({
    [`${provider}Enabled`]: false,
  });
}
