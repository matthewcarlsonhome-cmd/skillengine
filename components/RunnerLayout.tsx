/**
 * RunnerLayout - Shared Layout Component for Skill/Workflow Runners
 *
 * Standardized layout with:
 * - Header: Title, description, tags
 * - Left column: Info panel, test data presets, validation helpers
 * - Right column: Inputs, LLM output with formatting
 * - Footer: Action buttons, status
 *
 * Responsive behavior:
 * - Two-column layout on desktop (>= 1024px)
 * - Single column on tablet/mobile
 * - Typography scaled for projector/recording readability
 */

import React, { memo, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { layout, typography, cards, cn } from '../lib/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RunnerLayoutProps {
  /** Back link URL */
  backUrl?: string;
  /** Back link label */
  backLabel?: string;
  /** Left sidebar content */
  sidebar: ReactNode;
  /** Main content area */
  children: ReactNode;
  /** Additional CSS classes for container */
  className?: string;
}

export interface RunnerHeaderProps {
  /** Icon component to display */
  icon: React.FC<{ className?: string }>;
  /** Icon background color class */
  iconBg?: string;
  /** Icon color class */
  iconColor?: string;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Optional tags/badges */
  tags?: ReactNode;
  /** Right side actions */
  actions?: ReactNode;
}

export interface RunnerSidebarProps {
  children: ReactNode;
  className?: string;
}

export interface RunnerMainProps {
  children: ReactNode;
  className?: string;
}

export interface InfoCardProps {
  icon?: React.FC<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export interface ActionFooterProps {
  children: ReactNode;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const RunnerLayout: React.FC<RunnerLayoutProps> = memo(({
  backUrl = '/',
  backLabel = 'Back',
  sidebar,
  children,
  className = '',
}) => {
  return (
    <div className={cn(layout.container.default, 'px-4 py-6 lg:py-8', className)}>
      {/* Back navigation */}
      <Link
        to={backUrl}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 lg:mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* Grid layout */}
      <div className={layout.runnerGrid}>
        {/* Sidebar */}
        <aside className={layout.sidebar}>
          {sidebar}
        </aside>

        {/* Main content */}
        <main className={layout.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
});

RunnerLayout.displayName = 'RunnerLayout';

// ═══════════════════════════════════════════════════════════════════════════
// HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const RunnerHeader: React.FC<RunnerHeaderProps> = memo(({
  icon: Icon,
  iconBg = 'bg-primary/20',
  iconColor = 'text-primary',
  title,
  description,
  tags,
  actions,
}) => {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className={cn(
            'h-12 w-12 lg:h-14 lg:w-14 rounded-xl flex items-center justify-center flex-shrink-0',
            iconBg
          )}>
            <Icon className={cn('h-6 w-6 lg:h-7 lg:w-7', iconColor)} />
          </div>
          <div>
            <h1 className={typography.pageTitle}>{title}</h1>
            <p className="text-muted-foreground text-sm lg:text-base mt-0.5">{description}</p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      {tags && (
        <div className="flex flex-wrap gap-2 mt-3 lg:mt-4">
          {tags}
        </div>
      )}
    </div>
  );
});

RunnerHeader.displayName = 'RunnerHeader';

// ═══════════════════════════════════════════════════════════════════════════
// INFO CARD COMPONENT (for sidebar)
// ═══════════════════════════════════════════════════════════════════════════

export const InfoCard: React.FC<InfoCardProps> = memo(({
  icon: Icon,
  iconBg = 'bg-primary/20',
  iconColor = 'text-primary',
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={cn(cards.padded, className)}>
      {Icon && (
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          <h2 className={typography.cardTitle}>{title}</h2>
        </div>
      )}
      {!Icon && title && (
        <h2 className={cn(typography.cardTitle, 'mb-3')}>{title}</h2>
      )}
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
      {children}
    </div>
  );
});

InfoCard.displayName = 'InfoCard';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ConfigPanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = memo(({
  title = 'Configuration',
  children,
  className = '',
}) => {
  return (
    <div className={cn(cards.padded, className)}>
      <h3 className={cn(typography.cardTitle, 'mb-4')}>{title}</h3>
      <div className={layout.formGrid}>
        {children}
      </div>
    </div>
  );
});

ConfigPanel.displayName = 'ConfigPanel';

// ═══════════════════════════════════════════════════════════════════════════
// OUTPUT PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OutputPanelProps {
  title?: string;
  isLoading?: boolean;
  hasOutput?: boolean;
  hasError?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const OutputPanel: React.FC<OutputPanelProps> = memo(({
  title = 'Output',
  isLoading = false,
  hasOutput = false,
  hasError = false,
  actions,
  children,
  className = '',
}) => {
  if (!isLoading && !hasOutput && !hasError) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h2 className={typography.sectionTitle}>{title}</h2>
        {actions && hasOutput && !isLoading && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <div
        className="relative rounded-xl border bg-muted/50 min-h-[200px]"
        role="region"
        aria-label="Output content"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {children}
      </div>
    </div>
  );
});

OutputPanel.displayName = 'OutputPanel';

// ═══════════════════════════════════════════════════════════════════════════
// ACTION FOOTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ActionFooter: React.FC<ActionFooterProps> = memo(({
  children,
  className = '',
}) => {
  return (
    <div className={cn('flex justify-center py-6 lg:py-8', className)}>
      {children}
    </div>
  );
});

ActionFooter.displayName = 'ActionFooter';

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE LIST COMPONENT (for "What you'll get" sections)
// ═══════════════════════════════════════════════════════════════════════════

interface FeatureListProps {
  title?: string;
  items: string[];
  icon?: React.FC<{ className?: string }>;
  iconColor?: string;
  className?: string;
}

export const FeatureList: React.FC<FeatureListProps> = memo(({
  title = "What you'll get",
  items,
  icon: Icon,
  iconColor = 'text-green-500',
  className = '',
}) => {
  // Default checkmark icon if none provided
  const DefaultIcon = () => (
    <svg className={cn('h-4 w-4 flex-shrink-0', iconColor)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const ItemIcon = Icon || DefaultIcon;

  return (
    <div className={className}>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <ItemIcon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', iconColor)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

FeatureList.displayName = 'FeatureList';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION DIVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface SectionDividerProps {
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = memo(({ className = '' }) => (
  <div className={cn('border-t my-4', className)} />
));

SectionDivider.displayName = 'SectionDivider';

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════════════════════

interface StatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  label?: string;
  className?: string;
}

const statusStyles = {
  pending: 'bg-muted text-muted-foreground',
  running: 'bg-blue-500/20 text-blue-500',
  completed: 'bg-green-500/20 text-green-500',
  error: 'bg-red-500/20 text-red-500',
  skipped: 'bg-yellow-500/20 text-yellow-500',
};

const statusLabels = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  error: 'Error',
  skipped: 'Skipped',
};

export const StatusBadge: React.FC<StatusBadgeProps> = memo(({
  status,
  label,
  className = '',
}) => (
  <span className={cn(
    'text-xs px-2 py-0.5 rounded-full font-medium',
    statusStyles[status],
    className
  )}>
    {label || statusLabels[status]}
  </span>
));

StatusBadge.displayName = 'StatusBadge';

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default RunnerLayout;
