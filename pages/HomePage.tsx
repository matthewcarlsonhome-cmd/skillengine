/**
 * HomePage.tsx - Main Landing Page
 *
 * Redesigned to serve two audiences:
 * 1. Job Seekers - Resume, interview prep, job search automation
 * 2. Working Professionals - Role-specific skills for daily work automation
 *
 * Key Features:
 * - Two-path hero showing clear value for both audiences
 * - Platform stats banner showing scope (100+ skills, 20+ roles)
 * - Featured Skill Library section with role categories
 * - Clear paths to custom skill creation and pre-built templates
 * - Emphasis on exportability for use in any LLM
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
  HelpCircle,
  Circle,
  Compass,
} from 'lucide-react';
import { getUserProfile } from './UserProfilePage';
import { ROLE_DEFINITIONS } from '../lib/skillLibrary';
import { hasStoredKey } from '../lib/apiKeyStorage';
import { getUserCredits, isAdmin } from '../lib/billing';
import { useAuth } from '../hooks/useAuth';

// Featured skills for quick access - curated top 6 most useful
const FEATURED_SKILLS = [
  {
    id: 'resume-customizer',
    name: 'Resume Customizer',
    description: 'Tailor your resume for specific job applications',
    icon: FileText,
    color: 'amber',
    category: 'Job Search',
    isBuiltin: true,
  },
  {
    id: 'cover-letter-generator',
    name: 'Cover Letter Generator',
    description: 'Create personalized cover letters in minutes',
    icon: MessageSquare,
    color: 'rose',
    category: 'Job Search',
    isBuiltin: true,
  },
  {
    id: 'interview-prep',
    name: 'Interview Prep',
    description: 'Get ready with role-specific questions & answers',
    icon: Users,
    color: 'violet',
    category: 'Interview',
    isBuiltin: true,
  },
  {
    id: 'ats-optimization-checker',
    name: 'ATS Optimizer',
    description: 'Ensure your resume passes ATS filters',
    icon: FileCheck,
    color: 'green',
    category: 'Job Search',
    isBuiltin: true,
  },
  {
    id: 'linkedin-optimizer-pro',
    name: 'LinkedIn Optimizer',
    description: 'Optimize your profile for recruiter searches',
    icon: Linkedin,
    color: 'sky',
    category: 'Networking',
    isBuiltin: true,
  },
  {
    id: 'salary-negotiation-master',
    name: 'Salary Negotiator',
    description: 'Scripts and strategies for better offers',
    icon: DollarSign,
    color: 'yellow',
    category: 'Negotiation',
    isBuiltin: true,
  },
];

// Featured roles to display on homepage
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
          HERO SECTION - Two-Path Approach
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
          {/* Main Headline */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>100+ Expert-Level AI Skills</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
              AI Skills for{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Professionals
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
              Automate hours of work with production-ready AI prompts. Pre-built for 20+ professions
              or custom-generated from any job description.
            </p>
          </div>

          {/* Two-Path Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Job Seekers Path */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative rounded-2xl border-2 border-blue-500/30 bg-card p-8 h-full hover:border-blue-500/50 transition-all">
                <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Job Seekers</h2>
                <p className="text-muted-foreground mb-6">
                  Land your dream job faster with AI-powered tools for every step of your search.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                    <span>Resume optimization & ATS scoring</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                    <span>Personalized cover letters</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                    <span>Interview prep & mock interviews</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                    <span>Salary negotiation scripts</span>
                  </li>
                </ul>
                <Link to="/library?useCase=job-search">
                  <Button size="lg" className="w-full bg-blue-500 hover:bg-blue-600">
                    Start Job Search
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Job search, interview prep & career growth skills
                </p>
              </div>
            </div>

            {/* Working Professionals Path */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative rounded-2xl border-2 border-purple-500/30 bg-card p-8 h-full hover:border-purple-500/50 transition-all">
                <div className="h-14 w-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                  <Library className="h-7 w-7 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Working Professionals</h2>
                <p className="text-muted-foreground mb-6">
                  Automate your daily work with role-specific AI skills built by industry experts.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
                    <span>100+ production-ready skills</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
                    <span>20+ professional roles covered</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
                    <span>Expert-level system prompts</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
                    <span>Export for any LLM (ChatGPT, Claude, etc.)</span>
                  </li>
                </ul>
                <Link to="/library">
                  <Button size="lg" className="w-full bg-purple-500 hover:bg-purple-600">
                    Browse Skill Library
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Filter by role, category, or use case
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          STATS BANNER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground mt-1">AI Skills</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">20+</div>
              <div className="text-sm text-muted-foreground mt-1">Professional Roles</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground mt-1">Skill Categories</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground mt-1">Custom Skills</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* ═══════════════════════════════════════════════════════════════════════════
            GETTING STARTED SECTION
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Setup Checklist */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Quick Setup</h2>
                {setupStatus.isConfigured && (
                  <span className="ml-auto text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full">
                    Ready to use
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Complete these steps once to run any skill:
              </p>
              <div className="space-y-3">
                {/* API Key Setup */}
                <div className="flex items-center gap-3">
                  {setupStatus.hasApiKey ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${setupStatus.hasApiKey ? 'text-green-600' : ''}`}>
                      Configure API Key
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {setupStatus.hasApiKey ? 'API key configured' : 'Required to run AI skills'}
                    </div>
                  </div>
                  {!setupStatus.hasApiKey && (
                    <Link to="/account">
                      <Button size="sm" variant="outline">
                        <Key className="h-3 w-3 mr-1" />
                        Setup
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Profile Setup */}
                <div className="flex items-center gap-3">
                  {setupStatus.hasProfile ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${setupStatus.hasProfile ? 'text-green-600' : ''}`}>
                      Add Your Resume
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {setupStatus.hasProfile ? 'Profile saved' : 'Optional - personalizes all outputs'}
                    </div>
                  </div>
                  {!setupStatus.hasProfile && (
                    <Link to="/profile">
                      <Button size="sm" variant="ghost">
                        Add
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Admin indicator */}
                {setupStatus.isAdminUser && (
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <CheckCircle2 className="h-5 w-5 text-yellow-500 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-yellow-600">Admin Access</div>
                      <div className="text-xs text-muted-foreground">All models unlocked</div>
                    </div>
                  </div>
                )}
              </div>

              {!setupStatus.hasApiKey && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-amber-600">Need an API key?</span>{' '}
                      Go to <Link to="/account" className="text-primary hover:underline">Account Settings</Link> to configure your keys for Gemini, Claude, or ChatGPT.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Find Your Skills Quiz */}
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Not sure where to start?</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Take a 30-second quiz to discover the AI skills most relevant to your situation and goals.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>3 quick questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Personalized skill recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Filter 270+ skills to your needs</span>
                </li>
              </ul>
              <Link to="/discover">
                <Button size="lg" className="w-full">
                  <Compass className="h-4 w-4 mr-2" />
                  Find My Skills
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            FEATURED SKILLS - Quick Launch
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-2xl font-bold">Top Skills</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Most popular skills - click to run instantly
              </p>
            </div>
            <Link to="/library">
              <Button variant="ghost" size="sm">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURED_SKILLS.map((skill) => {
              const Icon = skill.icon;
              return (
                <Link
                  key={skill.id}
                  to={`/skill/${skill.id}`}
                  className="group"
                >
                  <div className={`rounded-xl border bg-card p-4 h-full hover:border-${skill.color}-500/50 hover:shadow-md transition-all`}>
                    <div className={`h-10 w-10 rounded-lg bg-${skill.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-5 w-5 text-${skill.color}-400`} />
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {skill.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Play className="h-3 w-3" />
                      <span>Run now</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick category chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground mr-2 self-center">Filter by:</span>
            <Link to="/library?useCase=job-search">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium hover:bg-blue-500/20 transition-colors cursor-pointer">
                Job Search
              </span>
            </Link>
            <Link to="/library?useCase=interview-prep">
              <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-medium hover:bg-violet-500/20 transition-colors cursor-pointer">
                Interview Prep
              </span>
            </Link>
            <Link to="/library?useCase=career-growth">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer">
                Career Growth
              </span>
            </Link>
            <Link to="/library?useCase=daily-work">
              <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium hover:bg-orange-500/20 transition-colors cursor-pointer">
                Daily Work
              </span>
            </Link>
            <Link to="/library?useCase=networking">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-medium hover:bg-cyan-500/20 transition-colors cursor-pointer">
                Networking
              </span>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            PROFILE SETUP BANNER
        ═══════════════════════════════════════════════════════════════════════════ */}
        {!hasProfile && (
          <section className="mb-12">
            <Link to="/profile">
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      Set Up Your Profile
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        Recommended
                      </span>
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Add your resume once, then all AI skills automatically personalize results to your background.
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary shrink-0" />
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════════
            TIME SAVINGS SHOWCASE
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Save Hours Every Week</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each skill is crafted by industry experts with 15-20+ years of experience.
              Get production-quality output in minutes instead of hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {USE_CASES.map((useCase, i) => {
              const Icon = useCase.icon;
              return (
                <div key={i} className="rounded-xl border bg-card p-6">
                  <div className={`h-12 w-12 rounded-lg bg-${useCase.color}-500/20 flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 text-${useCase.color}-400`} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">{useCase.role}</div>
                  <h3 className="text-lg font-bold mb-4">{useCase.task}</h3>
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
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            SKILL LIBRARY PREVIEW
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Skill Library</h2>
              <p className="text-muted-foreground">
                Pre-built skills for every profession. Browse by role or explore all categories.
              </p>
            </div>
            <Link to="/library">
              <Button variant="outline" size="lg">
                View All Skills
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Role Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {FEATURED_ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <Link key={role.id} to={`/library?role=${role.id}`}>
                  <div className={`rounded-xl border bg-card p-4 hover:border-${role.color}-500/50 hover:bg-${role.color}-500/5 transition-all group`}>
                    <div className={`h-10 w-10 rounded-lg bg-${role.color}-500/20 flex items-center justify-center mb-3`}>
                      <Icon className={`h-5 w-5 text-${role.color}-400`} />
                    </div>
                    <h3 className="font-semibold text-sm">{role.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">
                      View skills →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View More Roles Link */}
          <div className="text-center">
            <Link to="/role-templates" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              + {ROLE_DEFINITIONS.length - FEATURED_ROLES.length} more professional roles
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            THREE WAYS TO GET SKILLS
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Three Ways to Get AI Skills</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Use pre-built skills, generate custom ones from job descriptions, or export prompts to use in any AI tool.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Pre-Built Skills */}
            <div className="rounded-xl border bg-card p-6 hover:border-purple-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Library className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pre-Built by Role</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Browse 100+ skills organized by profession. Each skill is crafted by domain experts
                with production-ready prompts.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Expert-level system prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Industry frameworks built-in</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Ready to use immediately</span>
                </li>
              </ul>
              <Link to="/library">
                <Button variant="outline" className="w-full">
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
              <h3 className="text-xl font-bold mb-2">Custom Generation</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Paste any job description and we'll analyze it to generate AI skills tailored
                to that specific role and company.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Role-specific skill suggestions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Company context awareness</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Customizable prompts</span>
                </li>
              </ul>
              <Link to="/analyze">
                <Button variant="outline" className="w-full">
                  Generate Custom Skills
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Export & Download */}
            <div className="rounded-xl border bg-card p-6 hover:border-green-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Export for Any LLM</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Download skill prompts as CSV or TXT files. Use them in ChatGPT, Claude, Gemini,
                or any AI tool of your choice.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>CSV & TXT export formats</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Full system prompts included</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Refine & customize anywhere</span>
                </li>
              </ul>
              <Link to="/export-skills">
                <Button variant="outline" className="w-full">
                  Export Skills
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            AI WORKFLOWS CTA
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <Layers className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Workflows</h2>
                    <p className="text-muted-foreground text-sm">
                      Chain multiple skills together for complete automation
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Run multi-step workflows that combine AI skills into production-ready deliverables.
                  Enter your information once and get comprehensive results in minutes.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>9+ workflows</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>5 categories</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>30+ total steps</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/workflows">
                    <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600">
                      <Layers className="mr-2 h-5 w-5" />
                      View All Workflows
                    </Button>
                  </Link>
                  <Link to="/workflow/job-application">
                    <Button size="lg" variant="outline">
                      <Play className="mr-2 h-5 w-5" />
                      Try Job Application
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Featured Workflow Preview */}
              <div className="md:w-80 shrink-0">
                <Link to="/workflow/job-application">
                  <div className="rounded-xl border bg-card p-5 hover:border-primary/50 transition-all hover:shadow-md group">
                    <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-2">
                      <Zap className="h-3 w-3" />
                      FEATURED WORKFLOW
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                      <Briefcase className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">Job Application Package</h3>
                    <p className="text-sm text-muted-foreground mb-3">Complete application materials in one workflow</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        15-20 min
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        4 steps
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            WORKSPACES SECTION
        ═══════════════════════════════════════════════════════════════════════════ */}
        {!workspacesLoading && workspaces.length > 0 && (
          <section className="mb-12">
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
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════════
            BOTTOM CTA
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Automate Your Work?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Start with pre-built skills for your profession, or create custom skills from any job description.
              Export prompts to use in any AI tool.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/library">
                <Button size="lg" className="bg-purple-500 hover:bg-purple-600">
                  <Library className="mr-2 h-5 w-5" />
                  Browse Skill Library
                </Button>
              </Link>
              <Link to="/analyze">
                <Button size="lg" variant="outline">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Create Custom Skills
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
