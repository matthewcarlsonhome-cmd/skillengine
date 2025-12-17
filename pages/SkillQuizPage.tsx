/**
 * SkillQuizPage - Skill Discovery Survey
 *
 * A short quiz that helps users find the most relevant AI skills
 * based on their situation, role, and goals.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Briefcase,
  GraduationCap,
  Rocket,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  Users,
  TrendingUp,
  FileText,
  MessageSquare,
  Search,
  DollarSign,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/theme';

// ═══════════════════════════════════════════════════════════════════════════
// QUIZ QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════

interface QuizOption {
  id: string;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  filters: {
    useCases?: string[];
    roles?: string[];
    categories?: string[];
  };
}

interface QuizQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: QuizOption[];
  allowMultiple?: boolean;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'situation',
    title: "What's your current situation?",
    subtitle: "This helps us show you the most relevant skills",
    options: [
      {
        id: 'job-seeking',
        label: 'Looking for a new job',
        description: 'Resume help, interview prep, job search tools',
        icon: Search,
        filters: {
          useCases: ['job-search', 'interview-prep', 'career-growth'],
        },
      },
      {
        id: 'career-growth',
        label: 'Growing in my current role',
        description: 'Skill development, performance, advancement',
        icon: TrendingUp,
        filters: {
          useCases: ['career-growth', 'daily-work'],
        },
      },
      {
        id: 'daily-work',
        label: 'Automating daily tasks',
        description: 'Save time on routine work with AI',
        icon: Clock,
        filters: {
          useCases: ['daily-work'],
        },
      },
      {
        id: 'exploring',
        label: 'Just exploring',
        description: "See what's possible with AI skills",
        icon: Sparkles,
        filters: {},
      },
    ],
  },
  {
    id: 'role',
    title: "What's your profession?",
    subtitle: "We'll show skills tailored to your field",
    options: [
      {
        id: 'tech',
        label: 'Technology / Engineering',
        description: 'Software, data, IT, product management',
        icon: Rocket,
        filters: {
          roles: ['software-engineer', 'data-analyst', 'product-manager'],
        },
      },
      {
        id: 'business',
        label: 'Business / Finance',
        description: 'Finance, consulting, operations, strategy',
        icon: Briefcase,
        filters: {
          roles: ['financial-analyst', 'consultant', 'operations-manager'],
        },
      },
      {
        id: 'creative',
        label: 'Creative / Marketing',
        description: 'Design, content, marketing, communications',
        icon: Target,
        filters: {
          roles: ['marketing-manager', 'creative-director', 'content-writer'],
        },
      },
      {
        id: 'people',
        label: 'People / Management',
        description: 'HR, recruiting, team leadership, training',
        icon: Users,
        filters: {
          roles: ['hr-professional', 'recruiter', 'project-manager'],
        },
      },
      {
        id: 'student',
        label: 'Student / Recent Grad',
        description: 'Starting career, internships, entry-level',
        icon: GraduationCap,
        filters: {
          useCases: ['job-search', 'career-growth'],
        },
      },
      {
        id: 'other',
        label: 'Other / General',
        description: 'Show me skills for all professions',
        icon: Sparkles,
        filters: {},
      },
    ],
  },
  {
    id: 'priority',
    title: 'What would help you most right now?',
    subtitle: 'Select all that apply',
    allowMultiple: true,
    options: [
      {
        id: 'resume',
        label: 'Improve my resume',
        description: 'Stand out to recruiters and ATS',
        icon: FileText,
        filters: {
          categories: ['resume'],
        },
      },
      {
        id: 'interview',
        label: 'Ace interviews',
        description: 'Prepare answers, practice questions',
        icon: MessageSquare,
        filters: {
          categories: ['interview'],
        },
      },
      {
        id: 'networking',
        label: 'Expand my network',
        description: 'LinkedIn, outreach, referrals',
        icon: Users,
        filters: {
          useCases: ['networking'],
        },
      },
      {
        id: 'salary',
        label: 'Negotiate better pay',
        description: 'Salary research, negotiation scripts',
        icon: DollarSign,
        filters: {
          categories: ['negotiation'],
        },
      },
      {
        id: 'productivity',
        label: 'Work faster & smarter',
        description: 'Automate repetitive tasks',
        icon: Clock,
        filters: {
          useCases: ['daily-work'],
        },
      },
      {
        id: 'growth',
        label: 'Advance my career',
        description: 'Skills gap, career planning',
        icon: TrendingUp,
        filters: {
          useCases: ['career-growth'],
        },
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// QUIZ COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const SkillQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

  // Handle option selection
  const handleSelect = (optionId: string) => {
    const questionId = currentQuestion.id;

    if (currentQuestion.allowMultiple) {
      // Toggle selection for multi-select
      setAnswers((prev) => {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      });
    } else {
      // Single select - auto advance
      setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
      if (!isLastStep) {
        setTimeout(() => setCurrentStep((s) => s + 1), 300);
      }
    }
  };

  // Check if option is selected
  const isSelected = (optionId: string) => {
    return (answers[currentQuestion.id] || []).includes(optionId);
  };

  // Build filter URL from answers
  const buildFilterUrl = (): string => {
    const params = new URLSearchParams();
    const useCases = new Set<string>();
    const roles = new Set<string>();
    const categories = new Set<string>();

    // Collect all filters from selected options
    Object.entries(answers).forEach(([questionId, selectedIds]) => {
      const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
      if (!question) return;

      selectedIds.forEach((optionId) => {
        const option = question.options.find((o) => o.id === optionId);
        if (!option) return;

        option.filters.useCases?.forEach((uc) => useCases.add(uc));
        option.filters.roles?.forEach((r) => roles.add(r));
        option.filters.categories?.forEach((c) => categories.add(c));
      });
    });

    // Add to URL params (library page will parse these)
    if (useCases.size > 0) {
      params.set('useCases', Array.from(useCases).join(','));
    }
    if (roles.size > 0) {
      params.set('roles', Array.from(roles).join(','));
    }
    if (categories.size > 0) {
      params.set('categories', Array.from(categories).join(','));
    }

    // Mark as coming from quiz for special handling
    params.set('fromQuiz', 'true');

    return `/library?${params.toString()}`;
  };

  // Handle next/finish
  const handleNext = () => {
    if (isLastStep) {
      // Navigate to library with filters
      const url = buildFilterUrl();
      navigate(url);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      navigate('/');
    }
  };

  // Skip quiz
  const handleSkip = () => {
    navigate('/library');
  };

  const hasSelection = (answers[currentQuestion.id] || []).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentStep + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip quiz
            </button>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{currentQuestion.title}</h1>
          <p className="text-muted-foreground">{currentQuestion.subtitle}</p>
          {currentQuestion.allowMultiple && (
            <p className="text-sm text-primary mt-2">Select all that apply</p>
          )}
        </div>

        {/* Options */}
        <div className="grid gap-3 mb-8">
          {currentQuestion.options.map((option) => {
            const Icon = option.icon;
            const selected = isSelected(option.id);

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  'relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                )}
              >
                <div
                  className={cn(
                    'h-12 w-12 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'bg-primary/20' : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-colors',
                      selected ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
                {selected && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 0 ? 'Home' : 'Back'}
          </Button>

          {(currentQuestion.allowMultiple || isLastStep) && (
            <Button
              onClick={handleNext}
              disabled={!hasSelection && currentQuestion.allowMultiple}
            >
              {isLastStep ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Show My Skills
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Your answers help us filter 270+ skills to show you the most relevant ones.
          <br />
          You can always explore the full library later.
        </p>
      </div>
    </div>
  );
};

export default SkillQuizPage;
