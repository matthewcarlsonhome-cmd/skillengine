/**
 * ProviderConfig Component
 *
 * Unified provider selection and API key configuration.
 * Supports both platform keys and personal keys with model selection.
 */

import React, { useState, useEffect } from 'react';
import {
  Key,
  Sparkles,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
  Crown,
  Clock,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import {
  type ApiProvider,
  type KeyMode,
  type ModelOption,
  getModelsForProvider,
  getDefaultModel,
  getStoredKeyMode,
  saveKeyMode,
  saveSelectedProvider,
  saveSelectedModel,
  getSelectedModel,
  isPlatformKeyAvailable,
  getPlatformBalance,
  canRunSkill,
} from '../lib/platformKeys';
import { getApiKey, hasStoredKey, saveApiKey } from '../lib/apiKeyStorage';
import {
  getUserCredits,
  isAdmin,
  getAllowedModels,
  getMaxOutputTokens,
  type UserTier,
  TIER_CONFIGS,
} from '../lib/billing';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ProviderConfigProps {
  /** Currently selected provider */
  selectedProvider: ApiProvider;
  /** Callback when provider changes */
  onProviderChange: (provider: ApiProvider) => void;
  /** Currently selected model ID */
  selectedModel: string;
  /** Callback when model changes */
  onModelChange: (modelId: string) => void;
  /** Current key mode */
  keyMode: KeyMode;
  /** Callback when key mode changes */
  onKeyModeChange: (mode: KeyMode) => void;
  /** API key value (for personal mode) */
  apiKey: string;
  /** Callback when API key changes */
  onApiKeyChange: (key: string) => void;
  /** Whether the form is currently submitting */
  isRunning?: boolean;
  /** Compact mode for smaller layouts */
  compact?: boolean;
  /** Show model selector */
  showModelSelector?: boolean;
  /** Override available models (if not provided, uses tier-filtered models) */
  availableModels?: ModelOption[];
  /** User tier for display */
  userTier?: UserTier;
  /** User credits for display */
  userCredits?: number;
  /** Whether user is admin */
  isUserAdmin?: boolean;
}

export interface ProviderConfigState {
  provider: ApiProvider;
  model: string;
  keyMode: KeyMode;
  apiKey: string;
  tier: UserTier;
  credits: number;
  isAdmin: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK: useProviderConfig
// ═══════════════════════════════════════════════════════════════════════════

export function useProviderConfig(): {
  state: ProviderConfigState;
  setProvider: (provider: ApiProvider) => void;
  setModel: (modelId: string) => void;
  setKeyMode: (mode: KeyMode) => void;
  setApiKey: (key: string) => void;
  canRun: boolean;
  runStatus: ReturnType<typeof canRunSkill>;
  availableModels: ModelOption[];
  maxOutputTokens: number;
} {
  const stored = getStoredKeyMode();
  const { user, appUser } = useAuth();

  const [provider, setProviderState] = useState<ApiProvider>(stored.provider);
  const [model, setModelState] = useState<string>(stored.models[stored.provider] || getDefaultModel(stored.provider)?.id || '');
  const [keyMode, setKeyModeState] = useState<KeyMode>(stored.mode);
  const [apiKey, setApiKeyState] = useState<string>('');

  // Get user tier and admin status
  const userEmail = appUser?.email || user?.email;
  const userCredits = getUserCredits();
  const userIsAdmin = isAdmin(userEmail);

  // Get available models based on tier (admins get all)
  const availableModels = userIsAdmin
    ? getModelsForProvider(provider)
    : getAllowedModels(userCredits.tier, provider);

  // Get max output tokens for current model/tier
  const maxOutputTokens = userIsAdmin ? 32768 : getMaxOutputTokens(userCredits.tier, model);

  // Load stored API key on mount
  useEffect(() => {
    const storedKey = getApiKey(provider);
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, [provider]);

  const setProvider = (newProvider: ApiProvider) => {
    setProviderState(newProvider);
    saveSelectedProvider(newProvider);
    // Update model to default for new provider (respecting tier)
    const newAvailableModels = userIsAdmin
      ? getModelsForProvider(newProvider)
      : getAllowedModels(userCredits.tier, newProvider);
    const defaultModel = newAvailableModels[0] || getDefaultModel(newProvider);
    if (defaultModel) {
      setModelState(defaultModel.id);
      saveSelectedModel(newProvider, defaultModel.id);
    }
    // Load stored API key for new provider
    const storedKey = getApiKey(newProvider);
    setApiKeyState(storedKey || '');
  };

  const setModel = (modelId: string) => {
    setModelState(modelId);
    saveSelectedModel(provider, modelId);
  };

  const setKeyMode = (mode: KeyMode) => {
    setKeyModeState(mode);
    saveKeyMode(mode);
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (key) {
      saveApiKey(provider, key);
    }
  };

  const runStatus = canRunSkill(provider);

  return {
    state: {
      provider,
      model,
      keyMode,
      apiKey,
      tier: userCredits.tier,
      credits: userCredits.balance,
      isAdmin: userIsAdmin,
    },
    setProvider,
    setModel,
    setKeyMode,
    setApiKey,
    canRun: runStatus.canRun || !!apiKey,
    runStatus,
    availableModels,
    maxOutputTokens,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER CONFIG COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PROVIDER_INFO: Record<ApiProvider, { name: string; color: string; description: string }> = {
  gemini: {
    name: 'Google Gemini',
    color: 'text-blue-500',
    description: 'Fast and efficient, great for most tasks',
  },
  claude: {
    name: 'Anthropic Claude',
    color: 'text-purple-500',
    description: 'Excellent for complex reasoning and writing',
  },
  chatgpt: {
    name: 'OpenAI ChatGPT',
    color: 'text-green-500',
    description: 'Versatile with strong general capabilities',
  },
};

export const ProviderConfig: React.FC<ProviderConfigProps> = ({
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  keyMode,
  onKeyModeChange,
  apiKey,
  onApiKeyChange,
  isRunning = false,
  compact = false,
  showModelSelector = true,
  availableModels: propModels,
  userTier,
  userCredits,
  isUserAdmin,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const { user, appUser } = useAuth();

  // Get user tier info if not provided via props
  const userEmail = appUser?.email || user?.email;
  const credits = userCredits ?? getUserCredits().balance;
  const tier = userTier ?? getUserCredits().tier;
  const userIsAdmin = isUserAdmin ?? isAdmin(userEmail);
  const tierConfig = TIER_CONFIGS[tier];

  // Use provided models or get tier-filtered models
  const models = propModels ?? (userIsAdmin
    ? getModelsForProvider(selectedProvider)
    : getAllowedModels(tier, selectedProvider));

  const currentModel = models.find(m => m.id === selectedModel) || models[0];
  const providerInfo = PROVIDER_INFO[selectedProvider];

  const platformAvailable = isPlatformKeyAvailable(selectedProvider);
  const platformBalance = getPlatformBalance(selectedProvider);
  const hasPersonalKey = hasStoredKey(selectedProvider);

  const runStatus = canRunSkill(selectedProvider);

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {/* Tier Info Banner */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {userIsAdmin ? (
              <>
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Admin Access</span>
                <span className="text-xs text-muted-foreground">• All models unlocked</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{tierConfig.name} Tier</span>
                <span className="text-xs text-muted-foreground">
                  • ${(credits / 100).toFixed(2)} credits
                </span>
              </>
            )}
          </div>
          <Link
            to="/account"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {userIsAdmin ? 'Settings' : 'Upgrade'}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Key Mode Toggle */}
      <div>
        <label className="text-sm font-medium mb-2 block">API Key Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => onKeyModeChange('platform')}
            disabled={isRunning}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              keyMode === 'platform'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-muted-foreground/50'
            } ${!platformAvailable ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Platform Key</span>
            </div>
            {platformAvailable && (
              <div className="text-xs text-muted-foreground mt-1">
                ${(platformBalance / 100).toFixed(2)} credits
              </div>
            )}
            {!platformAvailable && (
              <div className="text-xs text-muted-foreground mt-1">
                Not configured
              </div>
            )}
          </button>
          <button
            onClick={() => onKeyModeChange('personal')}
            disabled={isRunning}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              keyMode === 'personal'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-muted-foreground/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Key className="h-4 w-4" />
              <span>My Key</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {hasPersonalKey ? 'Configured' : 'Not set'}
            </div>
          </button>
        </div>
      </div>

      {/* Provider Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">AI Provider</label>
        <div className="relative">
          <button
            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
            disabled={isRunning}
            className="w-full px-3 py-2 rounded-lg border bg-background text-left flex items-center justify-between hover:border-muted-foreground/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`font-medium ${providerInfo.color}`}>
                {providerInfo.name}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showProviderDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProviderDropdown(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-card shadow-lg z-50">
                {(['gemini', 'claude', 'chatgpt'] as ApiProvider[]).map((provider) => {
                  const info = PROVIDER_INFO[provider];
                  const isAvailable = keyMode === 'platform'
                    ? isPlatformKeyAvailable(provider)
                    : hasStoredKey(provider);

                  return (
                    <button
                      key={provider}
                      onClick={() => {
                        onProviderChange(provider);
                        setShowProviderDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedProvider === provider ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${info.color}`}>{info.name}</span>
                        {isAvailable && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Model Selection */}
      {showModelSelector && (
        <div>
          <label className="text-sm font-medium mb-2 block">Model</label>
          <div className="grid grid-cols-1 gap-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                disabled={isRunning}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{model.name}</span>
                    {model.qualityTier === 'premium' && (
                      <Crown className="h-3.5 w-3.5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {model.speedTier === 'fast' && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        Fast
                      </span>
                    )}
                    {model.speedTier === 'slow' && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Slower
                      </span>
                    )}
                    <span>${model.costPer1kTokens.toFixed(3)}/1k</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* API Key Input (Personal Mode Only) */}
      {keyMode === 'personal' && (
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center justify-between">
            <span>{providerInfo.name} API Key</span>
            <Link
              to="/api-keys"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              How to get a key
              <ExternalLink className="h-3 w-3" />
            </Link>
          </label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={`Enter your ${providerInfo.name} API key...`}
              disabled={isRunning}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {!apiKey && !hasPersonalKey && (
            <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              API key required to run skills
            </p>
          )}
        </div>
      )}

      {/* Status Message */}
      {!runStatus.canRun && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-500">{runStatus.reason}</p>
              {runStatus.suggestion && (
                <p className="text-xs text-muted-foreground mt-1">{runStatus.suggestion}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Platform Mode Info */}
      {keyMode === 'platform' && platformAvailable && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-500">Platform key active</p>
              <p className="text-xs text-muted-foreground mt-1">
                Usage will be billed to platform credits. ${(platformBalance / 100).toFixed(2)} available.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT PROVIDER SELECTOR (for inline use)
// ═══════════════════════════════════════════════════════════════════════════

export interface CompactProviderSelectorProps {
  provider: ApiProvider;
  onProviderChange: (provider: ApiProvider) => void;
  model: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export const CompactProviderSelector: React.FC<CompactProviderSelectorProps> = ({
  provider,
  onProviderChange,
  model,
  onModelChange,
  disabled = false,
}) => {
  const models = getModelsForProvider(provider);
  const providerInfo = PROVIDER_INFO[provider];

  return (
    <div className="flex items-center gap-2">
      <select
        value={provider}
        onChange={(e) => onProviderChange(e.target.value as ApiProvider)}
        disabled={disabled}
        className="text-sm border rounded-md px-2 py-1 bg-background"
      >
        <option value="gemini">Gemini</option>
        <option value="claude">Claude</option>
        <option value="chatgpt">ChatGPT</option>
      </select>
      <select
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled}
        className="text-sm border rounded-md px-2 py-1 bg-background"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER CONFIG STATUS (Simplified view for skill pages)
// Shows current configuration with link to change settings
// ═══════════════════════════════════════════════════════════════════════════

export interface ProviderConfigStatusProps {
  /** Current provider state from useProviderConfig */
  providerState: ProviderConfigState;
  /** Available models for current provider */
  availableModels: ModelOption[];
  /** Whether user can run skills */
  canRun: boolean;
  /** Callbacks for quick model changes */
  onProviderChange: (provider: ApiProvider) => void;
  onModelChange: (modelId: string) => void;
  /** Whether currently running */
  isRunning?: boolean;
}

export const ProviderConfigStatus: React.FC<ProviderConfigStatusProps> = ({
  providerState,
  availableModels,
  canRun,
  onProviderChange,
  onModelChange,
  isRunning = false,
}) => {
  const { provider, model, apiKey, tier, isAdmin: userIsAdmin } = providerState;
  const hasKey = !!apiKey || hasStoredKey(provider);
  const tierConfig = TIER_CONFIGS[tier];
  const currentModel = availableModels.find(m => m.id === model) || availableModels[0];
  const providerInfo = PROVIDER_INFO[provider];

  // If not configured, show setup prompt
  if (!hasKey) {
    return (
      <div className="rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Key className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Setup Required</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Configure your API key once to run any skill. Keys are stored securely in your browser.
            </p>
            <Link to="/account">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure API Keys
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Configured state - show compact info
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        {/* Status */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Ready to run</span>
              {userIsAdmin && (
                <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Using {providerInfo.name}
            </div>
          </div>
        </div>

        {/* Quick Settings */}
        <Link to="/account" className="text-sm text-primary hover:underline flex items-center gap-1">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      {/* Model Selector */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <label className="text-sm font-medium whitespace-nowrap">Provider & Model:</label>
            <div className="flex items-center gap-2 flex-1">
              <select
                value={provider}
                onChange={(e) => onProviderChange(e.target.value as ApiProvider)}
                disabled={isRunning}
                className="text-sm border rounded-lg px-3 py-2 bg-background flex-1"
              >
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="chatgpt">ChatGPT</option>
              </select>
              <select
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                disabled={isRunning}
                className="text-sm border rounded-lg px-3 py-2 bg-background flex-1"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Model info */}
        {currentModel && (
          <div className="mt-2 text-xs text-muted-foreground">
            {currentModel.qualityTier === 'premium' && '👑 Premium model • '}
            {currentModel.qualityTier === 'basic' && '⚡ Fast & economical • '}
            Est. ${((currentModel.costPer1kTokens || 0.1) * 3).toFixed(3)}/run
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderConfig;
