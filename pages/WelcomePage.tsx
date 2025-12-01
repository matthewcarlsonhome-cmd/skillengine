// Welcome Page - Onboarding flow for new users

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { saveApiKey, hasStoredKey } from '../lib/apiKeyStorage';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Key,
  Briefcase,
  Zap,
  Users,
  Check,
  ExternalLink,
  Rocket,
  Target,
  FileText,
  MessageSquare,
} from 'lucide-react';

type Step = 'intro' | 'apikeys' | 'roles' | 'complete';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [geminiKey, setGeminiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [hasGemini, setHasGemini] = useState(false);
  const [hasClaude, setHasClaude] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    setHasGemini(hasStoredKey('gemini'));
    setHasClaude(hasStoredKey('claude'));
  }, []);

  const handleSaveGeminiKey = () => {
    if (geminiKey.trim()) {
      saveApiKey('gemini', geminiKey.trim());
      setHasGemini(true);
      setGeminiKey('');
    }
  };

  const handleSaveClaudeKey = () => {
    if (claudeKey.trim()) {
      saveApiKey('claude', claudeKey.trim());
      setHasClaude(true);
      setClaudeKey('');
    }
  };

  const roles = [
    { id: 'software-engineer', name: 'Software Engineer', icon: '💻' },
    { id: 'product-manager', name: 'Product Manager', icon: '📊' },
    { id: 'data-analyst', name: 'Data Analyst', icon: '📈' },
    { id: 'ux-designer', name: 'UX Designer', icon: '🎨' },
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'sales', name: 'Sales', icon: '🤝' },
    { id: 'other', name: 'Other', icon: '✨' },
  ];

  const features = [
    {
      icon: Target,
      title: 'AI-Powered Resume Optimization',
      description: 'Tailor your resume to any job description instantly',
    },
    {
      icon: MessageSquare,
      title: 'Interview Prep',
      description: 'Generate practice questions and ace your interviews',
    },
    {
      icon: FileText,
      title: 'Cover Letter Generator',
      description: 'Create compelling cover letters in seconds',
    },
    {
      icon: Rocket,
      title: 'Role-Specific Skills',
      description: 'Access specialized tools for your profession',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Progress Bar */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-16 z-30">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {['intro', 'apikeys', 'roles', 'complete'].map((step, i) => (
              <div
                key={step}
                className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : ['intro', 'apikeys', 'roles', 'complete'].indexOf(currentStep) > i
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {['intro', 'apikeys', 'roles', 'complete'].indexOf(currentStep) > i ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      ['intro', 'apikeys', 'roles', 'complete'].indexOf(currentStep) > i
                        ? 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Welcome</span>
            <span>API Keys</span>
            <span>Your Role</span>
            <span>Ready!</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto max-w-3xl px-4 py-12">
        {/* Step 1: Intro */}
        {currentStep === 'intro' && (
          <div className="text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Welcome to SkillEngine
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Your AI-powered career assistant. Let's get you set up to supercharge your job search!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="border rounded-xl p-4 text-left">
                    <Icon className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <Button size="lg" onClick={() => setCurrentStep('apikeys')}>
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: API Keys */}
        {currentStep === 'apikeys' && (
          <div>
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Set Up Your AI Keys</h2>
              <p className="text-muted-foreground">
                SkillEngine uses your own API keys for AI features. Both providers offer generous free tiers!
              </p>
            </div>

            <div className="space-y-6">
              {/* Gemini */}
              <div className="border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Google Gemini</h3>
                      <p className="text-sm text-muted-foreground">Recommended - Fast & free tier</p>
                    </div>
                  </div>
                  {hasGemini && (
                    <span className="flex items-center gap-1 text-green-500 text-sm">
                      <Check className="h-4 w-4" />
                      Configured
                    </span>
                  )}
                </div>
                {!hasGemini ? (
                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="Enter your Gemini API key"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSaveGeminiKey} disabled={!geminiKey.trim()}>
                        Save Key
                      </Button>
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Get free key
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your Gemini key is saved and ready to use.
                  </p>
                )}
              </div>

              {/* Claude */}
              <div className="border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Anthropic Claude</h3>
                      <p className="text-sm text-muted-foreground">Advanced reasoning capabilities</p>
                    </div>
                  </div>
                  {hasClaude && (
                    <span className="flex items-center gap-1 text-green-500 text-sm">
                      <Check className="h-4 w-4" />
                      Configured
                    </span>
                  )}
                </div>
                {!hasClaude ? (
                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="Enter your Claude API key"
                      value={claudeKey}
                      onChange={(e) => setClaudeKey(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSaveClaudeKey} disabled={!claudeKey.trim()}>
                        Save Key
                      </Button>
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Get API key
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your Claude key is saved and ready to use.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={() => setCurrentStep('intro')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep('roles')}>
                {hasGemini || hasClaude ? 'Continue' : 'Skip for now'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Role Selection */}
        {currentStep === 'roles' && (
          <div>
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">What's Your Role?</h2>
              <p className="text-muted-foreground">
                We'll customize your experience with role-specific AI tools
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 border rounded-xl text-left transition-all ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{role.icon}</span>
                  <span className="font-medium">{role.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep('apikeys')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep('complete')}>
                {selectedRole ? 'Continue' : 'Skip'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && (
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">You're All Set!</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Your SkillEngine is ready. Let's supercharge your career!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => navigate('/skills')}
                className="p-6 border rounded-xl hover:border-primary transition-colors text-left"
              >
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Browse Job Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Optimize resumes, prep for interviews, and more
                </p>
              </button>
              <button
                onClick={() => navigate('/role-templates')}
                className="p-6 border rounded-xl hover:border-primary transition-colors text-left"
              >
                <Users className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-1">Role Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Install skill bundles for your profession
                </p>
              </button>
              <button
                onClick={() => navigate('/analyze')}
                className="p-6 border rounded-xl hover:border-primary transition-colors text-left"
              >
                <Target className="h-8 w-8 text-orange-500 mb-3" />
                <h3 className="font-semibold mb-1">Analyze a Role</h3>
                <p className="text-sm text-muted-foreground">
                  Generate custom skills for any job posting
                </p>
              </button>
            </div>

            <Button size="lg" onClick={() => navigate('/dashboard')}>
              <Rocket className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
