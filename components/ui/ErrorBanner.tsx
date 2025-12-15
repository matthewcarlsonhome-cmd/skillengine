/**
 * ErrorBanner - Standardized Error Display Component
 *
 * A reusable error banner with:
 * - Clear error messaging
 * - Retry action support
 * - Support/help links
 * - Dismissible option
 * - ARIA announcements for accessibility
 */

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw, X, ExternalLink, Copy } from 'lucide-react';
import { Button } from './Button';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ErrorBannerProps {
  /** Error message to display */
  message: string;
  /** Optional error title (defaults to "Error") */
  title?: string;
  /** Optional error code or request ID for debugging */
  errorCode?: string;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Label for retry button (defaults to "Try Again") */
  retryLabel?: string;
  /** Whether retry is currently in progress */
  isRetrying?: boolean;
  /** Callback to dismiss the banner */
  onDismiss?: () => void;
  /** URL for support/help documentation */
  supportUrl?: string;
  /** Custom support link label */
  supportLabel?: string;
  /** Variant for different severity levels */
  variant?: 'error' | 'warning' | 'info';
  /** Additional CSS classes */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT STYLES
// ═══════════════════════════════════════════════════════════════════════════

const variantStyles = {
  error: {
    container: 'bg-red-500/10 border-red-500/30',
    icon: 'text-red-500',
    title: 'text-red-600 dark:text-red-400',
    code: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/30',
    icon: 'text-amber-500',
    title: 'text-amber-600 dark:text-amber-400',
    code: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  info: {
    container: 'bg-blue-500/10 border-blue-500/30',
    icon: 'text-blue-500',
    title: 'text-blue-600 dark:text-blue-400',
    code: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  title = 'Error',
  errorCode,
  onRetry,
  retryLabel = 'Try Again',
  isRetrying = false,
  onDismiss,
  supportUrl,
  supportLabel = 'Get Help',
  variant = 'error',
  className = '',
}) => {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const styles = variantStyles[variant];

  // Announce error to screen readers
  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `${title}: ${message}`;
    }
  }, [title, message]);

  const copyErrorCode = () => {
    if (errorCode) {
      navigator.clipboard.writeText(errorCode);
    }
  };

  return (
    <>
      {/* ARIA live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="alert"
        aria-live="assertive"
        className="sr-only"
      />

      <div
        className={`rounded-lg border p-4 ${styles.container} ${className}`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className={`font-semibold ${styles.title}`}>{title}</h4>

            {/* Message */}
            <p className="mt-1 text-sm text-foreground/80">{message}</p>

            {/* Error Code */}
            {errorCode && (
              <div className="mt-2 flex items-center gap-2">
                <code
                  className={`text-xs px-2 py-1 rounded font-mono ${styles.code}`}
                >
                  {errorCode}
                </code>
                <button
                  onClick={copyErrorCode}
                  className="text-muted-foreground hover:text-foreground p-1"
                  title="Copy error code"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Actions */}
            {(onRetry || supportUrl) && (
              <div className="mt-3 flex items-center gap-3">
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : retryLabel}
                  </Button>
                )}

                {supportUrl && (
                  <a
                    href={supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {supportLabel}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// INLINE ERROR - Compact version for form fields
// ═══════════════════════════════════════════════════════════════════════════

interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className = '' }) => (
  <div
    role="alert"
    className={`flex items-center gap-2 text-sm text-red-500 ${className}`}
  >
    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

export default ErrorBanner;
