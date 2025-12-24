/**
 * SkillGrading Component
 *
 * Allows users to grade skill outputs after execution.
 * Collects overall score, dimension scores, and optional feedback.
 * Integrates with the self-improvement engine for skill evolution.
 */

import React, { useState, useCallback } from 'react';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  CheckCircle,
  BookOpen,
  Zap,
  Award,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { cn } from '../lib/theme';
import type { QualityDimension } from '../lib/selfImprovement/types';
import { submitGrade, hashInputs, getSkillVersion } from '../lib/selfImprovement/supabaseGrading';
import { logger } from '../lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillGradingProps {
  /** Skill ID being graded */
  skillId: string;
  /** Skill version (optional, will fetch from registry if not provided) */
  skillVersion?: number;
  /** Unique execution ID (for deduplication) */
  executionId: string;
  /** Original inputs (used for deduplication hash) */
  inputs?: Record<string, unknown>;
  /** Callback when grading is complete */
  onGradeSubmitted?: (success: boolean) => void;
  /** Callback to dismiss the grading UI */
  onDismiss?: () => void;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface DimensionConfig {
  dimension: QualityDimension;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// DIMENSION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DIMENSIONS: DimensionConfig[] = [
  {
    dimension: 'relevance',
    label: 'Relevance',
    description: 'Output matched what you asked for',
    icon: <Target className="h-4 w-4" />,
  },
  {
    dimension: 'accuracy',
    label: 'Accuracy',
    description: 'Information is correct and reliable',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    dimension: 'completeness',
    label: 'Completeness',
    description: 'All aspects were addressed',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    dimension: 'clarity',
    label: 'Clarity',
    description: 'Output is clear and organized',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    dimension: 'actionability',
    label: 'Actionability',
    description: 'Provides actionable guidance',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    dimension: 'professionalism',
    label: 'Professionalism',
    description: 'Appropriate tone and format',
    icon: <Award className="h-4 w-4" />,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// STAR RATING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = 'md',
  disabled = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          className={cn(
            'transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          )}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= displayValue
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/40'
            )}
          />
        </button>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// QUICK FEEDBACK COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QuickFeedbackProps {
  onQuickGrade: (positive: boolean) => void;
  selected: boolean | null;
}

const QuickFeedback: React.FC<QuickFeedbackProps> = ({ onQuickGrade, selected }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2">Was this helpful?</span>
      <Button
        variant={selected === true ? 'default' : 'outline'}
        size="sm"
        onClick={() => onQuickGrade(true)}
        className={cn(
          'h-8 w-8 p-0',
          selected === true && 'bg-green-500 hover:bg-green-600'
        )}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant={selected === false ? 'default' : 'outline'}
        size="sm"
        onClick={() => onQuickGrade(false)}
        className={cn(
          'h-8 w-8 p-0',
          selected === false && 'bg-red-500 hover:bg-red-600'
        )}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const SkillGrading: React.FC<SkillGradingProps> = ({
  skillId,
  skillVersion,
  executionId,
  inputs,
  onGradeSubmitted,
  onDismiss,
  compact = false,
  className = '',
}) => {
  // Get skill version from registry if not provided
  const [resolvedVersion, setResolvedVersion] = React.useState<number>(skillVersion || 1);

  React.useEffect(() => {
    if (!skillVersion) {
      getSkillVersion(skillId).then(setResolvedVersion);
    }
  }, [skillId, skillVersion]);
  // State
  const [overallScore, setOverallScore] = useState(0);
  const [dimensionScores, setDimensionScores] = useState<Record<QualityDimension, number>>(
    {} as Record<QualityDimension, number>
  );
  const [feedback, setFeedback] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [wasOutputUsed, setWasOutputUsed] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<boolean | null>(null);

  // Handle quick thumbs up/down
  const handleQuickGrade = useCallback(
    async (positive: boolean) => {
      setQuickFeedback(positive);

      // Quick grade translates to overall score
      const score = positive ? 5 : 2;
      setOverallScore(score);
      setWasOutputUsed(positive);

      // Auto-submit quick grade
      try {
        setIsSubmitting(true);
        const result = await submitGrade({
          skillId,
          skillVersion: resolvedVersion,
          overallScore: score,
          wasOutputUsed: positive,
          inputsHash: inputs ? hashInputs(inputs) : executionId,
        });

        if (result.success) {
          setSubmitted(true);
          onGradeSubmitted?.(true);

          // Auto-dismiss after 2 seconds
          setTimeout(() => {
            onDismiss?.();
          }, 2000);
        } else {
          logger.error('Failed to submit quick grade', { error: result.error });
        }
      } catch (error) {
        logger.error('Failed to submit quick grade', { error: error instanceof Error ? error.message : String(error) });
      } finally {
        setIsSubmitting(false);
      }
    },
    [skillId, resolvedVersion, executionId, inputs, onGradeSubmitted, onDismiss]
  );

  // Handle dimension score change
  const handleDimensionScore = (dimension: QualityDimension, score: number) => {
    setDimensionScores((prev) => ({ ...prev, [dimension]: score }));
  };

  // Submit detailed grade
  const handleSubmit = async () => {
    if (overallScore === 0) return;

    try {
      setIsSubmitting(true);

      const result = await submitGrade({
        skillId,
        skillVersion: resolvedVersion,
        overallScore,
        dimensionScores: {
          relevance: dimensionScores.relevance,
          accuracy: dimensionScores.accuracy,
          completeness: dimensionScores.completeness,
          clarity: dimensionScores.clarity,
          actionability: dimensionScores.actionability,
          professionalism: dimensionScores.professionalism,
        },
        feedback: feedback.trim() || undefined,
        improvementSuggestion: improvementSuggestion.trim() || undefined,
        wasOutputUsed: wasOutputUsed ?? false,
        inputsHash: inputs ? hashInputs(inputs) : executionId,
      });

      if (result.success) {
        setSubmitted(true);
        onGradeSubmitted?.(true);

        // Auto-dismiss after delay
        setTimeout(() => {
          onDismiss?.();
        }, 2000);
      } else {
        logger.error('Failed to submit grade', { error: result.error });
      }
    } catch (error) {
      logger.error('Failed to submit grade', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submitted state
  if (submitted) {
    return (
      <div className={cn('rounded-xl border bg-card p-6 text-center', className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="font-semibold">Thanks for your feedback!</h3>
          <p className="text-sm text-muted-foreground">
            Your input helps improve this skill.
          </p>
        </div>
      </div>
    );
  }

  // Compact mode - just thumbs up/down
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border bg-card px-4 py-3',
          className
        )}
      >
        <QuickFeedback onQuickGrade={handleQuickGrade} selected={quickFeedback} />
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Full grading mode
  return (
    <div className={cn('rounded-xl border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Rate this output</h3>
            <p className="text-sm text-muted-foreground">
              Help improve this skill with your feedback
            </p>
          </div>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick feedback */}
        <div className="flex items-center justify-center pb-4 border-b">
          <QuickFeedback onQuickGrade={handleQuickGrade} selected={quickFeedback} />
        </div>

        {/* Overall rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Overall Rating</label>
          <div className="flex items-center gap-4">
            <StarRating value={overallScore} onChange={setOverallScore} size="lg" />
            {overallScore > 0 && (
              <span className="text-sm text-muted-foreground">
                {overallScore === 1 && 'Poor'}
                {overallScore === 2 && 'Below Average'}
                {overallScore === 3 && 'Average'}
                {overallScore === 4 && 'Good'}
                {overallScore === 5 && 'Excellent'}
              </span>
            )}
          </div>
        </div>

        {/* Dimension ratings (expandable) */}
        <div>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Rate specific aspects
          </button>

          {showDetails && (
            <div className="mt-4 space-y-4">
              {DIMENSIONS.map((dim) => (
                <div
                  key={dim.dimension}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{dim.icon}</span>
                    <div>
                      <span className="text-sm font-medium">{dim.label}</span>
                      <p className="text-xs text-muted-foreground">{dim.description}</p>
                    </div>
                  </div>
                  <StarRating
                    value={dimensionScores[dim.dimension] || 0}
                    onChange={(score) => handleDimensionScore(dim.dimension, score)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Did you use this output? */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Did you use this output?</label>
          <div className="flex gap-2">
            <Button
              variant={wasOutputUsed === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWasOutputUsed(true)}
            >
              Yes, I used it
            </Button>
            <Button
              variant={wasOutputUsed === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWasOutputUsed(false)}
            >
              No, I didn't
            </Button>
          </div>
        </div>

        {/* Feedback text */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Additional feedback (optional)
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What worked well? What could be improved?"
            rows={2}
          />
        </div>

        {/* Improvement suggestion */}
        {wasOutputUsed === false && (
          <div className="space-y-2">
            <label className="text-sm font-medium">What would have made this better?</label>
            <Textarea
              value={improvementSuggestion}
              onChange={(e) => setImprovementSuggestion(e.target.value)}
              placeholder="Describe what you expected or needed..."
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-muted/30">
        <Button
          onClick={handleSubmit}
          disabled={overallScore === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SkillGrading;
