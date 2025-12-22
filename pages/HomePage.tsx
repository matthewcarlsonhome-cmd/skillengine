/**
 * HomePage.tsx - Main Landing Page
 *
 * Redesigned for clarity and guided linear flow:
 * 1. What is SkillEngine? - Clear value proposition
 * 2. How It Works - 3 simple steps
 * 3. Setup - Consolidated setup panel
 * 4. Choose Your Path - Skills vs Workflows
 * 5. Learn More - Additional details for curious users
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspaces } from '../hooks/useStorage';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Briefcase,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  User,
  Package,
  Wand2,
  ArrowRight,
  CheckCircle2,
  Play,
  Zap,
  Library,
  Download,
  Target,
  TrendingUp,
  Code,
  BarChart3,
  Palette,
  Users,
  FileText,
  Settings,
  Layers,
  Star,
  FileCheck,
  MessageSquare,
  DollarSign,
  Linkedin,
  Key,
  Circle,
  Lightbulb,
  FileOutput,
  Bot,
  ChevronDown,
} from 'lucide-react';
import { getUserProfile } from './UserProfilePage';
import { ROLE_DEFINITIONS } from '../lib/skillLibrary';
import { hasStoredKey } from '../lib/apiKeyStorage';
import { isAdmin } from '../lib/billing';
import { useAuth } from '../hooks/useAuth';

// Featured roles for "Learn More" section
const FEATURED_ROLES = [
  { id: 'software-engineer', name: 'Software Engineer', icon: Code, color: 'blue' },
  { id: 'product-manager', name: 'Product Manager', icon: Package, color: 'indigo' },
  { id: 'financial-analyst', name: 'Financial Analyst', icon: TrendingUp, color: 'green' },
  { id: 'marketing-manager', name: 'Marketing Manager', icon: Target, color: 'pink' },
  { id: 'data-analyst', name: 'Data Analyst', icon: BarChart3, color: 'purple' },
  { id: 'creative-director', name: 'Creative Director', icon: Palette, color: 'orange' },
  { id: 'hr-professional', name: 'HR Professional', icon: Users, color: 'teal' },
  { id: 'project-manager', name: 'Project Manager', icon: Settings, color: 'amber' },
];

// Use case examples showing time savings
const USE_CASES = [
  {
    role: 'Financial Analyst',
    task: 'DCF Valuation Analysis',
    before: '4-6 hours',
    after: '15 minutes',
    icon: TrendingUp,
    color: 'green',
  },
  {
    role: 'Product Manager',
    task: 'PRD Document',
    before: '6-8 hours',
    after: '20 minutes',
    icon: FileText,
    color: 'indigo',
  },
  {
    role: 'Creative Director',
    task: 'Creative Brief',
    before: '3-4 hours',
    after: '10 minutes',
    icon: Palette,
    color: 'orange',
  },
];

const HomePage: React.FC = () => {
  const { workspaces, deleteWorkspace, loading: workspacesLoading } = useWorkspaces();
  const navigate = useNavigate();
  const { user, appUser } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [setupStatus, setSetupStatus] = useState({
    hasApiKey: false,
    hasProfile: false,
    isConfigured: false,
    isAdminUser: false,
  });

  useEffect(() => {
    const profile = getUserProfile();
    const hasData = profile.fullName || profile.resumeText || profile.professionalTitle;
    setHasProfile(!!hasData);

    // Check setup status
    const hasAnyKey = hasStoredKey('gemini') || hasStoredKey('claude') || hasStoredKey('chatgpt');
    const userEmail = appUser?.email || user?.email;
    const adminUser = isAdmin(userEmail);

    setSetupStatus({
      hasApiKey: hasAnyKey,
      hasProfile: !!hasData,
      isConfigured: hasAnyKey,
      isAdminUser: adminUser,
    });
  }, [user, appUser]);

  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 1: WHAT IS SKILLENGINE?
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b">
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Welcome to SkillEngine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              SkillEngine turns AI into a library of ready-to-use professional skills.
            </h1>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Each skill is a proven, expert-designed prompt that helps you produce real work—resumes,
              analysis, strategy, content, and more—in minutes.
            </p>
          </div>

          {/* Visual explanation of what a "Skill" is */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-6 sm:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Input side */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Lightbulb className="h-4 w-4" />
                    YOUR CONTEXT
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <p className="font-medium mb-1">You provide:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Job description or context</li>
                      <li>• Your resume or background</li>
                      <li>• Specific requirements</li>
                    </ul>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary">AI Skill</span>
                </div>

                {/* Output side */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <FileOutput className="h-4 w-4" />
                    EXPERT-READY OUTPUT
                  </div>
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm">
                    <p className="font-medium mb-1 text-green-600">You get:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Tailored cover letters</li>
                      <li>• Professional documents</li>
                      <li>• Strategic analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="font-semibold text-sm">Save Hours</div>
                <div className="text-xs text-muted-foreground">What took hours now takes minutes</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <Star className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="font-semibold text-sm">Expert Quality</div>
                <div className="text-xs text-muted-foreground">Prompts crafted by professionals</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                <Download className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="font-semibold text-sm">Use Anywhere</div>
                <div className="text-xs text-muted-foreground">Export to ChatGPT, Claude, etc.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 2: HOW IT WORKS - 3 Simple Steps
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 border-b">
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How it works (3 simple steps)</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="rounded-xl border-2 border-primary/20 bg-card p-6 h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Connect your AI</h3>
                <p className="text-sm text-muted-foreground">
                  Add your API key from Gemini, Claude, or ChatGPT. Free tiers work.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="rounded-xl border-2 border-primary/20 bg-card p-6 h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Library className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Choose a skill</h3>
                <p className="text-sm text-muted-foreground">
                  Pick from 270+ skills organized by profession and use case.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="rounded-xl border-2 border-primary/20 bg-card p-6 h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Run and refine</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in your details and get polished results in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 3: SETUP - Consolidated Setup Panel
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="border-b">
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Set up once. Use any skill instantly.</h2>
              <p className="text-muted-foreground">
                Setup takes about 2 minutes. Your key stays in your browser.
              </p>
            </div>

            <div className="rounded-xl border-2 border-primary/30 bg-card p-6">
              {/* Setup Checklist */}
              <div className="space-y-4 mb-6">
                {/* API Key Setup */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  {setupStatus.hasApiKey ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${setupStatus.hasApiKey ? 'text-green-600' : 'text-amber-600'}`}>
                      {setupStatus.hasApiKey ? 'AI Key Connected' : 'Connect AI Key'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {setupStatus.hasApiKey ? 'Ready to run all skills' : 'Required to run skills'}
                    </div>
                  </div>
                  {!setupStatus.hasApiKey && (
                    <Link to="/account">
                      <Button size="sm" variant="default">
                        Connect
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Profile Setup */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  {setupStatus.hasProfile ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${setupStatus.hasProfile ? 'text-green-600' : ''}`}>
                      {setupStatus.hasProfile ? 'Profile Added (optional)' : 'Add Profile (optional)'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {setupStatus.hasProfile ? 'Skills will personalize output' : 'Personalizes your results'}
                    </div>
                  </div>
                  <Link to="/profile">
                    <Button size="sm" variant="ghost">
                      {setupStatus.hasProfile ? 'Edit' : 'Add'}
                    </Button>
                  </Link>
                </div>

                {/* Admin indicator */}
                {setupStatus.isAdminUser && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <CheckCircle2 className="h-5 w-5 text-yellow-500 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-yellow-600">Admin Access</div>
                      <div className="text-xs text-muted-foreground">All models unlocked</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary CTA */}
              <div className="text-center">
                {!setupStatus.isConfigured ? (
                  <Link to="/account">
                    <Button size="lg" className="w-full sm:w-auto px-8">
                      <Key className="h-5 w-5 mr-2" />
                      Set Up Now
                    </Button>
                  </Link>
                ) : (
                  <Link to="/library">
                    <Button size="lg" className="w-full sm:w-auto px-8">
                      <Play className="h-5 w-5 mr-2" />
                      Go to Skills
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 4: CHOOSE YOUR PATH - Skills vs Workflows
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-background to-muted/30 border-b">
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Choose your next step</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Skills Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative rounded-2xl border-2 border-purple-500/30 bg-card p-8 h-full hover:border-purple-500/50 transition-all">
                <div className="h-14 w-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                  <Library className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Explore Skills</h3>
                <p className="text-muted-foreground mb-6">
                  Browse 270+ expert-built skills by role, category, or use case.
                </p>
                <Link to="/library">
                  <Button size="lg" variant="ghost" className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    Browse Skills
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Workflows Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative rounded-2xl border-2 border-indigo-500/30 bg-card p-8 h-full hover:border-indigo-500/50 transition-all">
                <div className="h-14 w-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
                  <Layers className="h-7 w-7 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Run Workflows</h3>
                <p className="text-muted-foreground mb-6">
                  Complete multi-step deliverables with one guided run.
                </p>
                <Link to="/workflows">
                  <Button size="lg" variant="ghost" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                    View Workflows
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 5: LEARN MORE (Collapsible)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="border-b">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <button
            onClick={() => setShowLearnMore(!showLearnMore)}
            className="w-full flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-lg font-semibold">Want more detail?</span>
            <ChevronDown className={`h-5 w-5 transition-transform ${showLearnMore ? 'rotate-180' : ''}`} />
          </button>

          {showLearnMore && (
            <div className="pt-4 pb-8">
              <p className="text-center text-muted-foreground mb-10">
                Explore examples and deep dives below.
              </p>

              {/* Who Is This For? */}
              <div className="mb-16">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Who Is This For?</h3>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Whether you're job hunting or optimizing your daily work, we have skills built for you.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* Job Seekers */}
                  <div className="rounded-xl border bg-card p-6">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Job Seekers</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Land your dream job faster with AI-powered tools for every step of your search.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        <span>Resume optimization & ATS scoring</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        <span>Personalized cover letters</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        <span>Interview prep & mock interviews</span>
                      </li>
                    </ul>
                  </div>

                  {/* Working Professionals */}
                  <div className="rounded-xl border bg-card p-6">
                    <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                      <Library className="h-6 w-6 text-purple-400" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Working Professionals</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Automate your daily work with role-specific AI skills built by industry experts.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        <span>270+ production-ready skills</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        <span>20+ professional roles covered</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        <span>Expert-level system prompts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Time Savings Showcase */}
              <div className="mb-16">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Save Hours Every Week</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Each skill is crafted by industry experts. Get production-quality output in minutes instead of hours.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {USE_CASES.map((useCase, i) => {
                    const Icon = useCase.icon;
                    return (
                      <div key={i} className="rounded-xl border bg-card p-6">
                        <div className={`h-12 w-12 rounded-lg bg-${useCase.color}-500/20 flex items-center justify-center mb-4`}>
                          <Icon className={`h-6 w-6 text-${useCase.color}-400`} />
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">{useCase.role}</div>
                        <h4 className="text-lg font-bold mb-4">{useCase.task}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Traditional</div>
                            <div className="text-lg font-semibold text-red-400 line-through opacity-60">
                              {useCase.before}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">With AI</div>
                            <div className="text-lg font-semibold text-green-400">{useCase.after}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Three Ways to Get Skills */}
              <div className="mb-16">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Three Ways to Get AI Skills</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Use pre-built skills, generate custom ones, or export prompts to use anywhere.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {/* Pre-Built Skills */}
                  <div className="rounded-xl border bg-card p-6 hover:border-purple-500/50 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                      <Library className="h-6 w-6 text-purple-400" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">Pre-Built by Role</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Browse 270+ skills organized by profession with production-ready prompts.
                    </p>
                    <Link to="/library">
                      <Button variant="outline" className="w-full" size="sm">
                        Browse Library
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Custom Generation */}
                  <div className="rounded-xl border bg-card p-6 hover:border-orange-500/50 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                      <Wand2 className="h-6 w-6 text-orange-400" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">Custom Generation</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Paste any job description and generate AI skills tailored to that role.
                    </p>
                    <Link to="/analyze">
                      <Button variant="outline" className="w-full" size="sm">
                        Generate Skills
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Export */}
                  <div className="rounded-xl border bg-card p-6 hover:border-green-500/50 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                      <Download className="h-6 w-6 text-green-400" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">Export for Any LLM</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Download prompts as CSV or TXT to use in ChatGPT, Claude, or any AI tool.
                    </p>
                    <Link to="/export-skills">
                      <Button variant="outline" className="w-full" size="sm">
                        Export Skills
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Role Grid */}
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Skills by Role</h3>
                  <p className="text-muted-foreground">
                    Pre-built skills for every profession.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-4">
                  {FEATURED_ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <Link key={role.id} to={`/library?role=${role.id}`}>
                        <div className={`rounded-xl border bg-card p-4 hover:border-${role.color}-500/50 hover:bg-${role.color}-500/5 transition-all group`}>
                          <div className={`h-10 w-10 rounded-lg bg-${role.color}-500/20 flex items-center justify-center mb-3`}>
                            <Icon className={`h-5 w-5 text-${role.color}-400`} />
                          </div>
                          <h4 className="font-semibold text-sm">{role.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">
                            View skills →
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="text-center">
                  <Link to="/role-templates" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    + {ROLE_DEFINITIONS.length - FEATURED_ROLES.length} more professional roles
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          WORKSPACES SECTION (if user has any)
      ═══════════════════════════════════════════════════════════════════════════ */}
      {!workspacesLoading && workspaces.length > 0 && (
        <section className="border-b">
          <div className="container mx-auto max-w-6xl px-4 py-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Workspaces</h2>
              <Link to="/analyze">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Workspace
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.slice(0, 6).map((workspace) => (
                <div
                  key={workspace.id}
                  className="group relative rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm('Delete this workspace and all its skills?')) {
                        deleteWorkspace(workspace.id);
                      }
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                  <Link to={`/workspace/${workspace.id}`}>
                    <h3 className="font-semibold pr-8">{workspace.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workspace.jdAnalysis.role.title} • {workspace.jdAnalysis.role.level}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(workspace.updatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{workspace.selectedSkillIds.length} skills</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Set up in 2 minutes, then run any of 270+ professional AI skills.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!setupStatus.isConfigured ? (
                <Link to="/account">
                  <Button size="lg" className="px-8">
                    <Key className="mr-2 h-5 w-5" />
                    Set Up Now
                  </Button>
                </Link>
              ) : (
                <Link to="/library">
                  <Button size="lg" className="px-8">
                    <Play className="mr-2 h-5 w-5" />
                    Go to Skills
                  </Button>
                </Link>
              )}
              <Link to="/workflows">
                <Button size="lg" variant="outline">
                  <Layers className="mr-2 h-5 w-5" />
                  View Workflows
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
