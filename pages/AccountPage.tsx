/**
 * AccountPage - User Account & Credits Management
 *
 * Features:
 * - View current tier and credits
 * - Upgrade tier options
 * - Unified AI Configuration (key mode, provider, model)
 * - Admin setup for platform keys
 * - Usage history
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Zap,
  Key,
  Shield,
  CreditCard,
  Settings,
  ChevronRight,
  Check,
  AlertCircle,
  Info,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  User,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  getUserCredits,
  setUserTier,
  addCredits,
  isAdmin,
  addAdminEmail,
  getAdminEmails,
  setAdminEmails,
  TIER_CONFIGS,
  MODEL_PRICING,
  estimateSkillCost,
  estimateWorkflowCost,
  type UserTier,
  type UserCredits,
} from '../lib/billing';
import { saveApiKey, getApiKey, hasStoredKey } from '../lib/apiKeyStorage';
import {
  getModelsForProvider,
  type ApiProvider,
  type ModelOption,
  GEMINI_MODELS,
  CLAUDE_MODELS,
  CHATGPT_MODELS,
} from '../lib/platformKeys';
import { useProviderConfig } from '../components/ProviderConfig';
import { checkPlatformStatus, type PlatformStatus } from '../lib/platformProxy';
import { cn } from '../lib/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TIER CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TierCardProps {
  tier: UserTier;
  isCurrentTier: boolean;
  onSelect: () => void;
}

const TierCard: React.FC<TierCardProps> = ({ tier, isCurrentTier, onSelect }) => {
  const config = TIER_CONFIGS[tier];

  const tierColors: Record<UserTier, string> = {
    free: 'border-gray-300',
    starter: 'border-blue-400',
    pro: 'border-purple-500',
    power: 'border-orange-500',
    team: 'border-yellow-500',
    custom: 'border-yellow-500',
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 transition-all',
        isCurrentTier ? `${tierColors[tier]} bg-primary/5` : 'border-border hover:border-muted-foreground/50',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">{config.name}</h3>
        {isCurrentTier && (
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            Current
          </span>
        )}
      </div>

      <div className="mb-4">
        <span className="text-3xl font-bold">
          ${(config.monthlyPrice / 100).toFixed(0)}
        </span>
        <span className="text-muted-foreground">/mo</span>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        ${(config.monthlyCredits / 100).toFixed(2)} credits/month
      </div>

      <ul className="space-y-2 mb-4">
        {config.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {!isCurrentTier && tier !== 'custom' && (
        <Button
          variant={tier === 'pro' ? 'default' : 'outline'}
          className="w-full"
          onClick={onSelect}
        >
          {config.monthlyPrice > 0 ? 'Select Plan' : 'Downgrade'}
        </Button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// AI CONFIGURATION SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PROVIDER_INFO: Record<ApiProvider, { name: string; color: string; keyUrl: string; keyPlaceholder: string }> = {
  gemini: {
    name: 'Google Gemini',
    color: 'bg-blue-500',
    keyUrl: 'https://aistudio.google.com/',
    keyPlaceholder: 'AIza...',
  },
  claude: {
    name: 'Anthropic Claude',
    color: 'bg-purple-500',
    keyUrl: 'https://console.anthropic.com/',
    keyPlaceholder: 'sk-ant-...',
  },
  chatgpt: {
    name: 'OpenAI ChatGPT',
    color: 'bg-green-500',
    keyUrl: 'https://platform.openai.com/',
    keyPlaceholder: 'sk-...',
  },
};

const AIConfigurationSection: React.FC = () => {
  const { addToast } = useToast();
  const {
    state: providerState,
    setProvider,
    setModel,
    setKeyMode,
    setApiKey,
    availableModels,
    canRun,
  } = useProviderConfig();

  const [showKey, setShowKey] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(providerState.apiKey);
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);
  const [checkingPlatform, setCheckingPlatform] = useState(true);

  // Check platform key availability on mount
  useEffect(() => {
    checkPlatformStatus()
      .then(setPlatformStatus)
      .finally(() => setCheckingPlatform(false));
  }, []);

  // Sync local key with provider state
  useEffect(() => {
    setLocalApiKey(providerState.apiKey);
  }, [providerState.apiKey, providerState.provider]);

  const handleSaveKey = () => {
    setApiKey(localApiKey);
    addToast(`${PROVIDER_INFO[providerState.provider].name} API key saved`, 'success');
  };

  const providerInfo = PROVIDER_INFO[providerState.provider];
  const currentModel = availableModels.find(m => m.id === providerState.model) || availableModels[0];

  // Check if platform key is available for current provider
  const platformKeyAvailable = platformStatus?.available ?? false;
  const currentProviderHasPlatformKey = platformStatus?.providers?.[
    providerState.provider === 'chatgpt' ? 'openai' : providerState.provider
  ] ?? false;

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure once, use everywhere across all skills and workflows
          </p>
        </div>
        {canRun && (
          <span className="ml-auto text-xs bg-green-500/20 text-green-600 px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" /> Ready to Run
          </span>
        )}
      </div>

      {/* Step 1: Key Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">
          Step 1: Choose Key Mode
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Personal Key Option */}
          <button
            onClick={() => setKeyMode('personal')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              providerState.keyMode === 'personal'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center',
                providerState.keyMode === 'personal' ? 'bg-primary/20' : 'bg-muted'
              )}>
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">My Own Key</div>
                <div className="text-xs text-muted-foreground">BYOK - Bring Your Own Key</div>
              </div>
              {providerState.keyMode === 'personal' && (
                <Check className="h-5 w-5 text-primary ml-auto" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Use your personal API key. No usage limits, pay directly to provider.
            </p>
          </button>

          {/* Platform Key Option */}
          <button
            onClick={() => platformKeyAvailable && setKeyMode('platform')}
            disabled={!platformKeyAvailable || checkingPlatform}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all relative',
              providerState.keyMode === 'platform'
                ? 'border-primary bg-primary/10'
                : platformKeyAvailable
                  ? 'border-border hover:border-muted-foreground/50'
                  : 'border-border opacity-60 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center',
                providerState.keyMode === 'platform' ? 'bg-primary/20' : 'bg-muted'
              )}>
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Platform Key</div>
                <div className="text-xs text-muted-foreground">Use shared platform API</div>
              </div>
              {providerState.keyMode === 'platform' && (
                <Check className="h-5 w-5 text-primary ml-auto" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              No setup required. Usage deducted from your credits.
            </p>
            {platformKeyAvailable && platformStatus && (
              <div className="mt-2 flex gap-2">
                {platformStatus.providers.gemini && (
                  <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded">Gemini</span>
                )}
                {platformStatus.providers.claude && (
                  <span className="text-xs bg-purple-500/20 text-purple-600 px-2 py-0.5 rounded">Claude</span>
                )}
                {platformStatus.providers.openai && (
                  <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">ChatGPT</span>
                )}
              </div>
            )}
            {!platformKeyAvailable && !checkingPlatform && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
                  Not Configured
                </span>
              </div>
            )}
            {checkingPlatform && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
                  Checking...
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Admin hint for platform key setup */}
        {!platformKeyAvailable && !checkingPlatform && (
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Admin:</strong> To enable Platform Keys, see{' '}
            <a href="/docs/PLATFORM_KEYS_SETUP.md" className="text-primary hover:underline">
              Platform Keys Setup Guide
            </a>
          </p>
        )}
      </div>

      {/* Step 2: Provider Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">
          Step 2: Select AI Provider
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['gemini', 'claude', 'chatgpt'] as ApiProvider[]).map((provider) => {
            const info = PROVIDER_INFO[provider];
            const isSelected = providerState.provider === provider;
            const hasKey = hasStoredKey(provider);
            return (
              <button
                key={provider}
                onClick={() => setProvider(provider)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('h-3 w-3 rounded-full', info.color)} />
                  <span className="font-medium text-sm">{info.name}</span>
                </div>
                {hasKey && providerState.keyMode === 'personal' && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Key saved
                  </span>
                )}
                {!hasKey && providerState.keyMode === 'personal' && (
                  <span className="text-xs text-amber-600">Needs key</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">
          Step 3: Select Model
        </label>
        <Select
          value={providerState.model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full"
        >
          {availableModels.map((model) => {
            const skillCost = estimateSkillCost(model.id, 'standard');
            return (
              <option key={model.id} value={model.id}>
                {model.name} - ~${(skillCost.totalCost / 100).toFixed(4)}/skill
              </option>
            );
          })}
        </Select>
        {currentModel && (
          <p className="text-xs text-muted-foreground mt-2">
            {currentModel.description}
          </p>
        )}
      </div>

      {/* Step 4: API Key (only for personal mode) */}
      {providerState.keyMode === 'personal' && (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">
            Step 4: Enter Your {providerInfo.name} API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder={providerInfo.keyPlaceholder}
                className="pr-10"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={handleSaveKey} disabled={!localApiKey}>
              Save Key
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Get your key from{' '}
            <a
              href={providerInfo.keyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {providerInfo.keyUrl.replace('https://', '')}
            </a>
          </p>
        </div>
      )}

      {/* Status Summary */}
      <div className={cn(
        'p-4 rounded-lg border',
        canRun ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'
      )}>
        <div className="flex items-center gap-3">
          {canRun ? (
            <>
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium text-green-600">Ready to Run Skills!</div>
                <div className="text-sm text-muted-foreground">
                  Using {providerInfo.name} • {currentModel?.name || 'Default model'}
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div>
                <div className="font-medium text-amber-600">Setup Required</div>
                <div className="text-sm text-muted-foreground">
                  Enter your {providerInfo.name} API key above to start using skills
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            Your selection is saved automatically and applies to all skills and workflows.
            Keys are stored securely in your browser's local storage.
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const AccountPage: React.FC = () => {
  const { user, appUser } = useAuth();
  const { addToast } = useToast();

  const [credits, setCredits] = useState<UserCredits>(getUserCredits());
  const [adminEmails, setAdminEmailsState] = useState<string[]>(getAdminEmails());
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAdminSection, setShowAdminSection] = useState(false);

  const userEmail = appUser?.email || user?.email;
  const userIsAdmin = isAdmin(userEmail);

  // Refresh credits
  const refreshCredits = () => {
    setCredits(getUserCredits());
    addToast('Credits refreshed', 'success');
  };

  // Handle tier change
  const handleTierChange = (tier: UserTier) => {
    setUserTier(tier);
    setCredits(getUserCredits());
    addToast(`Tier changed to ${TIER_CONFIGS[tier].name}`, 'success');
  };

  // Handle add admin
  const handleAddAdmin = () => {
    if (!newAdminEmail.trim()) return;
    addAdminEmail(newAdminEmail.trim());
    setAdminEmailsState(getAdminEmails());
    setNewAdminEmail('');
    addToast(`Added ${newAdminEmail} as admin`, 'success');
  };

  // Handle remove admin
  const handleRemoveAdmin = (email: string) => {
    const updated = adminEmails.filter(e => e !== email);
    setAdminEmails(updated);
    setAdminEmailsState(updated);
    addToast(`Removed ${email} from admins`, 'success');
  };

  const tierConfig = TIER_CONFIGS[credits.tier];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your subscription, credits, and API keys
        </p>
      </div>

      {/* Current Status */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Tier Card */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {userIsAdmin ? (
                <>
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Admin Account
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 text-primary" />
                  {tierConfig.name} Plan
                </>
              )}
            </h2>
            <Button variant="ghost" size="sm" onClick={refreshCredits}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Credits Balance</div>
              <div className="text-2xl font-bold">${(credits.balance / 100).toFixed(2)}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Monthly Allocation</div>
              <div className="text-lg">${(credits.monthlyAllocation / 100).toFixed(2)}/mo</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Used This Month</div>
              <div className="text-lg">${(credits.usedThisMonth / 100).toFixed(2)}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Resets On</div>
              <div className="text-lg">
                {new Date(credits.resetDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </h2>

          <div className="space-y-3">
            {userIsAdmin && (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowAdminSection(!showAdminSection)}
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Settings
                </span>
                <ChevronRight className={cn('h-4 w-4 transition-transform', showAdminSection && 'rotate-90')} />
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                addCredits(1000); // Add $10.00
                setCredits(getUserCredits());
                addToast('Added $10.00 credits (demo)', 'success');
              }}
            >
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Add Credits (Demo)
              </span>
              <span className="text-muted-foreground">+$10.00</span>
            </Button>

            <Link to="/api-keys">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key Help
                </span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Section */}
      {userIsAdmin && showAdminSection && (
        <div className="rounded-xl border bg-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            Administrator Settings
          </h2>

          <div className="space-y-6">
            {/* Admin Emails */}
            <div>
              <h3 className="font-medium mb-3">Admin Users</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Admin users have access to all models regardless of tier. Add email addresses to grant admin access.
              </p>

              <div className="flex gap-2 mb-3">
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddAdmin}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {adminEmails.length > 0 ? (
                <div className="space-y-2">
                  {adminEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <span className="text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdmin(email)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No admin emails configured. Users with Team or Custom tier are automatically admins.
                </p>
              )}
            </div>

            {/* Platform Keys (Server-side) Info */}
            <div>
              <h3 className="font-medium mb-3">Platform Keys (for Production)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                To enable platform-managed API keys where users don't need their own keys:
              </p>

              <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-3">
                <div>
                  <p className="font-medium mb-1">1. Store keys server-side</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                    supabase secrets set GEMINI_API_KEY=your-key
                  </code>
                </div>
                <div>
                  <p className="font-medium mb-1">2. Create an Edge Function proxy</p>
                  <p className="text-muted-foreground">
                    The proxy validates user auth, checks credits, makes API calls, and records usage.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">3. Enable in admin settings</p>
                  <p className="text-muted-foreground">
                    Users will see "Platform Key" option and usage will deduct from their credits.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600">Current Mode: Browser-only</p>
                    <p className="text-muted-foreground">
                      API keys in the "API Key Setup" section are stored locally in each user's browser.
                      For shared/managed keys, implement the server-side proxy as described above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          AI CONFIGURATION - Unified Setup Section
      ═══════════════════════════════════════════════════════════════════════════ */}
      <AIConfigurationSection />

      {/* Model Costs Section */}
      <div className="rounded-xl border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Model Costs
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Estimated costs per skill run and workflow. Actual costs depend on input/output length.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium">Provider</th>
                <th className="text-left py-2 px-2 font-medium">Model</th>
                <th className="text-right py-2 px-2 font-medium">Skill Run</th>
                <th className="text-right py-2 px-2 font-medium">Workflow (5 steps)</th>
                <th className="text-right py-2 px-2 font-medium">Skills per $1</th>
              </tr>
            </thead>
            <tbody>
              {/* Gemini Models */}
              {getModelsForProvider('gemini').map((model) => {
                const skillCost = estimateSkillCost(model.id, 'standard');
                const workflowCost = estimateWorkflowCost(model.id, 'medium');
                const skillsPerDollar = Math.floor(100 / skillCost.totalCost);
                return (
                  <tr key={model.id} className="border-b border-muted/50">
                    <td className="py-2 px-2">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Gemini
                      </span>
                    </td>
                    <td className="py-2 px-2">{model.name}</td>
                    <td className="py-2 px-2 text-right font-mono">${(skillCost.totalCost / 100).toFixed(4)}</td>
                    <td className="py-2 px-2 text-right font-mono">${(workflowCost.totalCost / 100).toFixed(4)}</td>
                    <td className="py-2 px-2 text-right text-green-600 font-medium">{skillsPerDollar}</td>
                  </tr>
                );
              })}
              {/* Claude Models */}
              {getModelsForProvider('claude').map((model) => {
                const skillCost = estimateSkillCost(model.id, 'standard');
                const workflowCost = estimateWorkflowCost(model.id, 'medium');
                const skillsPerDollar = Math.floor(100 / skillCost.totalCost);
                return (
                  <tr key={model.id} className="border-b border-muted/50">
                    <td className="py-2 px-2">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        Claude
                      </span>
                    </td>
                    <td className="py-2 px-2">{model.name}</td>
                    <td className="py-2 px-2 text-right font-mono">${(skillCost.totalCost / 100).toFixed(4)}</td>
                    <td className="py-2 px-2 text-right font-mono">${(workflowCost.totalCost / 100).toFixed(4)}</td>
                    <td className="py-2 px-2 text-right text-green-600 font-medium">{skillsPerDollar}</td>
                  </tr>
                );
              })}
              {/* ChatGPT Models */}
              {getModelsForProvider('chatgpt').map((model) => {
                const skillCost = estimateSkillCost(model.id, 'standard');
                const workflowCost = estimateWorkflowCost(model.id, 'medium');
                const skillsPerDollar = Math.floor(100 / skillCost.totalCost);
                return (
                  <tr key={model.id} className="border-b border-muted/50">
                    <td className="py-2 px-2">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        ChatGPT
                      </span>
                    </td>
                    <td className="py-2 px-2">{model.name}</td>
                    <td className="py-2 px-2 text-right font-mono">${(skillCost.totalCost / 100).toFixed(4)}</td>
                    <td className="py-2 px-2 text-right font-mono">${(workflowCost.totalCost / 100).toFixed(4)}</td>
                    <td className="py-2 px-2 text-right text-green-600 font-medium">{skillsPerDollar}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p>
            💡 <strong>Tip:</strong> Gemini 2.0 Flash offers the best value for most tasks.
            Use Claude Sonnet or GPT-4o for complex writing that needs premium quality.
          </p>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(['free', 'starter', 'pro', 'power', 'team'] as UserTier[]).map((tier) => (
            <TierCard
              key={tier}
              tier={tier}
              isCurrentTier={credits.tier === tier}
              onSelect={() => handleTierChange(tier)}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          * Demo mode: Tier changes are immediate and stored locally. In production, this would connect to a payment processor.
        </p>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Info className="h-5 w-5" />
          How Credits Work
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Credits are deducted based on actual token usage when using Platform Key mode</li>
          <li>• Each tier gives you access to different AI models (free = basic, pro = premium)</li>
          <li>• Premium models like Claude Sonnet and GPT-4o produce higher quality output</li>
          <li>• Using your own API key ("My Key" mode) doesn't consume credits</li>
          <li>• Unused credits roll over (up to 2x your monthly allocation)</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountPage;
