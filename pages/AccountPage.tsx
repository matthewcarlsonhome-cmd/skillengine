/**
 * AccountPage - User Account & Credits Management
 *
 * Features:
 * - View current tier and credits
 * - Upgrade tier options
 * - Admin setup for universal API keys
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
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
  type UserTier,
  type UserCredits,
} from '../lib/billing';
import { saveApiKey, getApiKey, hasStoredKey } from '../lib/apiKeyStorage';
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
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const AccountPage: React.FC = () => {
  const { user, appUser } = useAuth();
  const { addToast } = useToast();

  const [credits, setCredits] = useState<UserCredits>(getUserCredits());
  const [adminEmails, setAdminEmailsState] = useState<string[]>(getAdminEmails());
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAdminSection, setShowAdminSection] = useState(false);

  // API Key states
  const [geminiKey, setGeminiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [chatgptKey, setChatgptKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);

  const userEmail = appUser?.email || user?.email;
  const userIsAdmin = isAdmin(userEmail);

  // Load stored keys
  useEffect(() => {
    setGeminiKey(getApiKey('gemini') || '');
    setClaudeKey(getApiKey('claude') || '');
    setChatgptKey(getApiKey('chatgpt') || '');
  }, []);

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

  // Handle save API key
  const handleSaveKey = (provider: 'gemini' | 'claude' | 'chatgpt', key: string) => {
    saveApiKey(provider, key);
    addToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved`, 'success');
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

            {/* Universal API Keys */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                API Keys
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeys(!showKeys)}
                >
                  {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                These keys are stored locally in your browser. For production, configure platform keys server-side.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Google Gemini</label>
                  <div className="flex gap-2">
                    <Input
                      type={showKeys ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIza..."
                      className="flex-1"
                    />
                    <Button onClick={() => handleSaveKey('gemini', geminiKey)}>Save</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Anthropic Claude</label>
                  <div className="flex gap-2">
                    <Input
                      type={showKeys ? 'text' : 'password'}
                      value={claudeKey}
                      onChange={(e) => setClaudeKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="flex-1"
                    />
                    <Button onClick={() => handleSaveKey('claude', claudeKey)}>Save</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">OpenAI ChatGPT</label>
                  <div className="flex gap-2">
                    <Input
                      type={showKeys ? 'text' : 'password'}
                      value={chatgptKey}
                      onChange={(e) => setChatgptKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1"
                    />
                    <Button onClick={() => handleSaveKey('chatgpt', chatgptKey)}>Save</Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600">Security Note</p>
                    <p className="text-muted-foreground">
                      For production deployment, API keys should be stored server-side using Supabase Edge Functions
                      or environment variables. See <Link to="/docs/platform-keys" className="text-primary hover:underline">documentation</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
