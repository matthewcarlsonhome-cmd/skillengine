/**
 * ExecutionSummary - Post-Execution Summary Card
 *
 * Displays execution results summary including:
 * - Completion status with timing
 * - Token usage and cost
 * - Model used
 * - Quick action buttons (copy, download, save)
 *
 * Features:
 * - Success/error states with appropriate styling
 * - Copy to clipboard functionality
 * - Download as text file
 * - Save to dashboard
 * - Accessible with ARIA labels
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Cpu,
  Copy,
  Download,
  Save,
  Check,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ExecutionSummaryProps {
  /** Whether execution completed successfully */
  success: boolean;
  /** Total execution time in milliseconds */
  durationMs?: number;
  /** Time to first token in milliseconds */
  ttftMs?: number;
  /** Number of input tokens used */
  inputTokens?: number;
  /** Number of output tokens generated */
  outputTokens?: number;
  /** Cost in dollars */
  costDollars?: number;
  /** Model name used */
  modelName?: string;
  /** Provider name */
  providerName?: string;
  /** Error message if failed */
  errorMessage?: string;
  /** The output text for copy/download */
  outputText?: string;
  /** Callback for copy action */
  onCopy?: () => void;
  /** Callback for download action */
  onDownload?: () => void;
  /** Callback for save to dashboard */
  onSave?: () => void;
  /** Callback to run again with same inputs */
  onRunAgain?: () => void;
  /** Callback to edit inputs */
  onEditInputs?: () => void;
  /** Whether the output has been saved */
  isSaved?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTokens(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ExecutionSummary: React.FC<ExecutionSummaryProps> = ({
  success,
  durationMs,
  ttftMs,
  inputTokens,
  outputTokens,
  costDollars,
  modelName,
  providerName,
  errorMessage,
  outputText,
  onCopy,
  onDownload,
  onSave,
  onRunAgain,
  onEditInputs,
  isSaved = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else if (outputText) {
      await navigator.clipboard.writeText(outputText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skill-output-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const totalTokens = (inputTokens || 0) + (outputTokens || 0);

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 transition-all',
        success
          ? 'border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5'
          : 'border-red-500/30 bg-gradient-to-r from-red-500/5 to-rose-500/5',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={success ? 'Execution completed successfully' : 'Execution failed'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {success ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <h3 className={cn(
            'font-semibold',
            success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          )}>
            {success ? 'Completed Successfully' : 'Execution Failed'}
          </h3>
        </div>
        {durationMs !== undefined && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(durationMs)}
          </span>
        )}
      </div>

      {/* Error Message */}
      {!success && errorMessage && (
        <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Stats Grid */}
      {success && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {/* Model */}
          {modelName && (
            <div className="flex items-center gap-2 text-sm">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="font-medium truncate" title={modelName}>
                  {modelName}
                </p>
              </div>
            </div>
          )}

          {/* Tokens */}
          {totalTokens > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground text-lg">⚡</span>
              <div>
                <p className="text-xs text-muted-foreground">Tokens</p>
                <p className="font-medium">
                  {formatTokens(totalTokens)}
                  {inputTokens && outputTokens && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({formatTokens(inputTokens)} in / {formatTokens(outputTokens)} out)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Cost */}
          {costDollars !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="font-medium">${costDollars.toFixed(4)}</p>
              </div>
            </div>
          )}

          {/* TTFT */}
          {ttftMs !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time to First Token</p>
                <p className="font-medium">{formatDuration(ttftMs)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {success && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>

            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                className={cn(
                  'flex items-center gap-1.5',
                  isSaved && 'text-green-600 border-green-500/30'
                )}
              >
                {isSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {/* Run Again / Edit Inputs */}
        <div className="ml-auto flex items-center gap-2">
          {onEditInputs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditInputs}
              className="flex items-center gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Inputs
            </Button>
          )}
          {onRunAgain && (
            <Button
              variant={success ? 'outline' : 'default'}
              size="sm"
              onClick={onRunAgain}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {success ? 'Run Again' : 'Retry'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionSummary;
