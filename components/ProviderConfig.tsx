/**
 * ProviderConfig Component
 *
 * Unified provider selection and API key configuration.
 * Supports both platform keys and personal keys with model selection.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Settings,
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
  const [focusedProviderIndex, setFocusedProviderIndex] = useState(-1);
  const { user, appUser } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const providerButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const providers: ApiProvider[] = ['gemini', 'claude', 'chatgpt'];

  // Handle keyboard navigation for provider dropdown
  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showProviderDropdown) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setShowProviderDropdown(true);
        setFocusedProviderIndex(providers.indexOf(selectedProvider));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedProviderIndex(prev => Math.min(prev + 1, providers.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedProviderIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedProviderIndex >= 0) {
          onProviderChange(providers[focusedProviderIndex]);
          setShowProviderDropdown(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowProviderDropdown(false);
        break;
      case 'Tab':
        setShowProviderDropdown(false);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedProviderIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedProviderIndex(providers.length - 1);
        break;
    }
  }, [showProviderDropdown, focusedProviderIndex, providers, selectedProvider, onProviderChange]);

  // Focus the selected item when dropdown opens
  useEffect(() => {
    if (showProviderDropdown && focusedProviderIndex >= 0 && providerButtonRefs.current[focusedProviderIndex]) {
      providerButtonRefs.current[focusedProviderIndex]?.focus();
    }
  }, [showProviderDropdown, focusedProviderIndex]);

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
        <label id="keymode-label" className="text-sm font-medium mb-2 block">API Key Mode</label>
        <div className="flex gap-2" role="radiogroup" aria-labelledby="keymode-label">
          <button
            onClick={() => onKeyModeChange('platform')}
            disabled={isRunning}
            role="radio"
            aria-checked={keyMode === 'platform'}
            aria-label={`Use platform key${platformAvailable ? `, ${(platformBalance / 100).toFixed(2)} credits available` : ', not configured'}`}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              keyMode === 'platform'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-muted-foreground/50'
            } ${!platformAvailable ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
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
            role="radio"
            aria-checked={keyMode === 'personal'}
            aria-label={`Use personal API key${hasPersonalKey ? ', configured' : ', not set'}`}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              keyMode === 'personal'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-muted-foreground/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Key className="h-4 w-4" aria-hidden="true" />
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
        <label id="provider-label" className="text-sm font-medium mb-2 block">AI Provider</label>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
            onKeyDown={handleDropdownKeyDown}
            disabled={isRunning}
            aria-haspopup="listbox"
            aria-expanded={showProviderDropdown}
            aria-labelledby="provider-label"
            aria-controls="provider-listbox"
            className="w-full px-3 py-2 rounded-lg border bg-background text-left flex items-center justify-between hover:border-muted-foreground/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="flex items-center gap-2">
              <span className={`font-medium ${providerInfo.color}`}>
                {providerInfo.name}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {showProviderDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProviderDropdown(false)} aria-hidden="true" />
              <div
                id="provider-listbox"
                role="listbox"
                aria-labelledby="provider-label"
                aria-activedescendant={focusedProviderIndex >= 0 ? `provider-option-${providers[focusedProviderIndex]}` : undefined}
                className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-card shadow-lg z-50"
                onKeyDown={handleDropdownKeyDown}
              >
                {providers.map((provider, index) => {
                  const info = PROVIDER_INFO[provider];
                  const isAvailable = keyMode === 'platform'
                    ? isPlatformKeyAvailable(provider)
                    : hasStoredKey(provider);

                  return (
                    <button
                      key={provider}
                      id={`provider-option-${provider}`}
                      ref={(el) => { providerButtonRefs.current[index] = el; }}
                      role="option"
                      aria-selected={selectedProvider === provider}
                      onClick={() => {
                        onProviderChange(provider);
                        setShowProviderDropdown(false);
                      }}
                      onKeyDown={handleDropdownKeyDown}
                      className={`w-full px-3 py-2 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-primary/10 ${
                        selectedProvider === provider ? 'bg-muted' : ''
                      } ${focusedProviderIndex === index ? 'bg-primary/10' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${info.color}`}>{info.name}</span>
                        {isAvailable && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="Available" />
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
          <label id="model-label" className="text-sm font-medium mb-2 block">Model</label>
          <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-labelledby="model-label">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                disabled={isRunning}
                role="radio"
                aria-checked={selectedModel === model.id}
                aria-label={`${model.name}${model.qualityTier === 'premium' ? ', premium model' : ''}, ${model.speedTier === 'fast' ? 'fast' : model.speedTier === 'slow' ? 'slower' : 'balanced'}, $${model.costPer1kTokens.toFixed(3)} per 1000 tokens`}
                className={`px-3 py-2 rounded-lg border text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{model.name}</span>
                    {model.qualityTier === 'premium' && (
                      <Crown className="h-3.5 w-3.5 text-yellow-500" aria-label="Premium model" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {model.speedTier === 'fast' && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" aria-hidden="true" />
                        Fast
                      </span>
                    )}
                    {model.speedTier === 'slow' && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
              aria-pressed={showKey}
            >
              {showKey ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
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
// PROVIDER CONFIG STATUS (Minimal view for skill pages)
// Shows ONLY status - all configuration happens at /account
// ═══════════════════════════════════════════════════════════════════════════

export interface ProviderConfigStatusProps {
  /** Current provider state from useProviderConfig */
  providerState: ProviderConfigState;
  /** Available models for current provider */
  availableModels: ModelOption[];
  /** Whether user can run skills */
  canRun: boolean;
}

export const ProviderConfigStatus: React.FC<ProviderConfigStatusProps> = ({
  providerState,
  availableModels,
  canRun,
}) => {
  const { provider, model, apiKey, tier, isAdmin: userIsAdmin } = providerState;
  const hasKey = !!apiKey || hasStoredKey(provider);
  const tierConfig = TIER_CONFIGS[tier];
  const currentModel = availableModels.find(m => m.id === model) || availableModels[0];
  const providerInfo = PROVIDER_INFO[provider];

  // If not configured, show setup prompt
  if (!hasKey) {
    return (
      <div className="rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Key className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Setup Required</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Configure your API key once to run all skills. This only takes a minute.
            </p>
            <Link to="/account">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Go to Setup
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Configured state - show minimal status (no selectors!)
  return (
    <div className="rounded-lg border bg-green-500/5 border-green-500/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-green-600">Ready</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {providerInfo.name} {currentModel?.name || model}
            </span>
            {userIsAdmin && (
              <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>
        </div>
        <Link
          to="/account"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Change
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default ProviderConfig;
