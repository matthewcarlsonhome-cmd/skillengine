/**
 * Skeleton - Loading State Components
 *
 * Standardized skeleton loading states for consistent UX:
 * - Text lines
 * - Cards
 * - Form fields
 * - Runner page sections
 */

import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// BASE SKELETON
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

// ═══════════════════════════════════════════════════════════════════════════
// TEXT SKELETON
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// CARD SKELETON
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonCardProps {
  hasIcon?: boolean;
  hasTitle?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasIcon = true,
  hasTitle = true,
  lines = 2,
  className = '',
}) => (
  <div className={`rounded-xl border bg-card p-6 ${className}`}>
    <div className="flex items-start gap-3">
      {hasIcon && <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />}
      <div className="flex-1 space-y-3">
        {hasTitle && <Skeleton className="h-6 w-1/3" />}
        <SkeletonText lines={lines} />
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// FORM FIELD SKELETON
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonFieldProps {
  type?: 'input' | 'textarea' | 'select';
  hasLabel?: boolean;
  className?: string;
}

export const SkeletonField: React.FC<SkeletonFieldProps> = ({
  type = 'input',
  hasLabel = true,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {hasLabel && <Skeleton className="h-4 w-24" />}
    <Skeleton
      className={`w-full ${
        type === 'textarea' ? 'h-32' : type === 'select' ? 'h-10' : 'h-10'
      }`}
    />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// FORM SKELETON
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonFormProps {
  fields?: number;
  hasTextareas?: number;
  className?: string;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 3,
  hasTextareas = 1,
  className = '',
}) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, i) => (
      <SkeletonField
        key={i}
        type={i < hasTextareas ? 'textarea' : 'input'}
      />
    ))}
    {/* Button skeleton */}
    <div className="flex justify-center pt-4">
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// OUTPUT SKELETON - For streaming output area
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonOutputProps {
  className?: string;
}

export const SkeletonOutput: React.FC<SkeletonOutputProps> = ({ className = '' }) => (
  <div className={`rounded-xl border bg-muted/50 p-6 ${className}`}>
    <div className="space-y-4">
      {/* Title skeleton */}
      <Skeleton className="h-6 w-1/4" />
      {/* Paragraph skeletons */}
      <SkeletonText lines={4} />
      <SkeletonText lines={3} />
      {/* List skeleton */}
      <div className="space-y-2 pl-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" style={{ width: `${70 + Math.random() * 30}%` }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// RUNNER PAGE SKELETON - Full page loading state
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonRunnerPageProps {
  className?: string;
}

export const SkeletonRunnerPage: React.FC<SkeletonRunnerPageProps> = ({ className = '' }) => (
  <div className={`container mx-auto max-w-7xl px-4 py-8 ${className}`}>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar skeleton */}
      <div className="lg:col-span-1 space-y-4">
        <SkeletonCard hasIcon lines={3} />
        <SkeletonCard hasIcon={false} lines={5} />
      </div>

      {/* Main content skeleton */}
      <div className="lg:col-span-2 space-y-6">
        {/* Config section */}
        <div className="rounded-xl border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonField type="select" />
            <SkeletonField type="input" />
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-6">
          <SkeletonField type="input" />
          <SkeletonField type="textarea" />
          <SkeletonField type="textarea" />
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <Skeleton className="h-12 w-40 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// STEP SKELETON - For workflow step items
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonStepProps {
  count?: number;
  className?: string;
}

export const SkeletonSteps: React.FC<SkeletonStepProps> = ({
  count = 4,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
      >
        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// STREAMING SKELETON - Animated dots for streaming indicator
// ═══════════════════════════════════════════════════════════════════════════

interface StreamingIndicatorProps {
  label?: string;
  className?: string;
}

export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  label = 'AI is thinking',
  className = '',
}) => (
  <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
    <span className="text-sm">{label}</span>
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

export default Skeleton;
