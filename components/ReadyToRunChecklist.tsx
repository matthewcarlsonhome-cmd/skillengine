/**
 * ReadyToRunChecklist - Pre-execution Checklist Component
 *
 * Shows users at a glance what's configured and what's still needed:
 * - Provider/model selection status
 * - API key mode status
 * - Required input field completion
 * - Test data availability
 *
 * Features:
 * - Real-time validation status updates
 * - Quick links to fix missing items
 * - Test data shortcut button
 * - Accessible with ARIA labels
 */

import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Zap,
  Key,
  FileText,
  FlaskConical,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/theme';
import type { ApiProvider, KeyMode, ModelOption } from '../lib/platformKeys';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RequiredInput {
  id: string;
  label: string;
  filled: boolean;
}

export interface ReadyToRunChecklistProps {
  /** Current provider name for display */
  providerName: string;
  /** Current model name for display */
  modelName: string;
  /** Current key mode */
  keyMode: KeyMode;
  /** Whether the key is configured (platform available or personal key set) */
  keyConfigured: boolean;
  /** Platform key balance (if applicable) */
  platformBalance?: number;
  /** List of required inputs with their completion status */
  requiredInputs: RequiredInput[];
  /** Whether test data is available */
  hasTestData?: boolean;
  /** Whether test data has been applied */
  testDataApplied?: boolean;
  /** Callback to load test data */
  onLoadTestData?: () => void;
  /** Whether the skill is ready to run */
  canRun: boolean;
  /** Estimated run time in seconds */
  estimatedTime?: number;
  /** Estimated cost per run */
  estimatedCost?: number;
  /** Additional CSS classes */
  className?: string;
}

interface ChecklistItemProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  status: 'complete' | 'incomplete' | 'warning';
  detail?: string;
  action?: React.ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  icon: Icon,
  label,
  status,
  detail,
  action,
}) => {
  const statusIcon = useMemo(() => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
    }
  }, [status]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
        status === 'complete' && 'bg-green-500/5',
        status === 'incomplete' && 'bg-muted/50',
        status === 'warning' && 'bg-amber-500/5'
      )}
      role="listitem"
      aria-label={`${label}: ${status === 'complete' ? 'Complete' : status === 'warning' ? 'Warning' : 'Incomplete'}`}
    >
      {statusIcon}
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className={cn(
          'text-sm font-medium',
          status === 'complete' && 'text-green-700 dark:text-green-400',
          status === 'incomplete' && 'text-muted-foreground',
          status === 'warning' && 'text-amber-700 dark:text-amber-400'
        )}>
          {label}
        </span>
        {detail && (
          <span className="ml-2 text-xs text-muted-foreground">
            {detail}
          </span>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ReadyToRunChecklist: React.FC<ReadyToRunChecklistProps> = ({
  providerName,
  modelName,
  keyMode,
  keyConfigured,
  platformBalance,
  requiredInputs,
  hasTestData = false,
  testDataApplied = false,
  onLoadTestData,
  canRun,
  estimatedTime,
  estimatedCost,
  className = '',
}) => {
  // Calculate completion stats
  const filledInputs = requiredInputs.filter(i => i.filled).length;
  const totalInputs = requiredInputs.length;
  const allInputsFilled = filledInputs === totalInputs;

  // Determine overall status
  const overallStatus = useMemo(() => {
    if (canRun && allInputsFilled) return 'ready';
    if (!keyConfigured) return 'needs-key';
    return 'needs-inputs';
  }, [canRun, allInputsFilled, keyConfigured]);

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 transition-colors',
        overallStatus === 'ready' && 'border-green-500/30 bg-green-500/5',
        overallStatus === 'needs-key' && 'border-amber-500/30 bg-amber-500/5',
        overallStatus === 'needs-inputs' && 'border-border bg-card',
        className
      )}
      role="region"
      aria-label="Ready to run checklist"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn(
          'text-sm font-semibold flex items-center gap-2',
          overallStatus === 'ready' && 'text-green-700 dark:text-green-400',
          overallStatus !== 'ready' && 'text-foreground'
        )}>
          {overallStatus === 'ready' ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Ready to Run
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Setup Checklist
            </>
          )}
        </h3>
        {estimatedTime && estimatedCost !== undefined && overallStatus === 'ready' && (
          <span className="text-xs text-muted-foreground">
            ~{estimatedTime}s • ${estimatedCost.toFixed(4)}
          </span>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-1" role="list">
        {/* Provider/Model */}
        <ChecklistItem
          icon={Zap}
          label={`${providerName} • ${modelName}`}
          status="complete"
          action={
            <Link
              to="/account"
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              Change <ChevronRight className="h-3 w-3" />
            </Link>
          }
        />

        {/* Key Mode */}
        <ChecklistItem
          icon={Key}
          label={keyMode === 'platform' ? 'Platform Key' : 'Personal Key'}
          status={keyConfigured ? 'complete' : 'warning'}
          detail={
            keyConfigured
              ? keyMode === 'platform' && platformBalance !== undefined
                ? `$${platformBalance.toFixed(2)} credits`
                : 'Configured'
              : 'Not configured'
          }
          action={
            !keyConfigured && (
              <Link
                to="/account"
                className="text-xs text-amber-600 hover:underline flex items-center gap-0.5"
              >
                Setup <ChevronRight className="h-3 w-3" />
              </Link>
            )
          }
        />

        {/* Required Inputs */}
        {requiredInputs.map((input) => (
          <ChecklistItem
            key={input.id}
            icon={FileText}
            label={input.label}
            status={input.filled ? 'complete' : 'incomplete'}
            detail={input.filled ? '' : 'Required'}
          />
        ))}
      </div>

      {/* Test Data Shortcut */}
      {hasTestData && !allInputsFilled && onLoadTestData && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={onLoadTestData}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
              testDataApplied
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            <FlaskConical className="h-4 w-4" />
            {testDataApplied ? 'Test Data Applied' : 'Load Test Data to Auto-fill'}
          </button>
        </div>
      )}

      {/* Status Summary */}
      {!canRun && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          {!keyConfigured
            ? 'Configure your API key to enable running skills'
            : `Fill in ${totalInputs - filledInputs} required field${totalInputs - filledInputs !== 1 ? 's' : ''} to run`
          }
        </p>
      )}
    </div>
  );
};

export default ReadyToRunChecklist;
