/**
 * ErrorBoundary Component
 *
 * A React error boundary that catches JavaScript errors in child components,
 * logs them, and displays a fallback UI instead of crashing the entire app.
 *
 * Features:
 * - Catches render errors in child components
 * - Provides retry functionality
 * - Logs errors for debugging
 * - Customizable fallback UI
 * - Reports errors to analytics (when configured)
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/Button';
import { logger } from '../lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI to render on error */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show technical error details (for development) */
  showDetails?: boolean;
  /** Custom title for the error message */
  title?: string;
  /** Custom description for the error message */
  description?: string;
  /** Level of the error boundary (page, section, component) */
  level?: 'page' | 'section' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY CLASS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error,
      errorId: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error using centralized logger
    logger.error('ErrorBoundary caught an error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to localStorage for debugging
    this.logError(error, errorInfo);
  }

  logError(error: Error, errorInfo: ErrorInfo): void {
    try {
      const errorLog = {
        id: this.state.errorId,
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Store in localStorage (keep last 10 errors)
      const storedErrors = JSON.parse(localStorage.getItem('skillengine_errors') || '[]');
      storedErrors.unshift(errorLog);
      localStorage.setItem('skillengine_errors', JSON.stringify(storedErrors.slice(0, 10)));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  copyErrorDetails = (): void => {
    const { error, errorInfo, errorId } = this.state;
    const details = `Error ID: ${errorId}
Message: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Time: ${new Date().toISOString()}`;

    navigator.clipboard.writeText(details);
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorId } = this.state;
    const {
      children,
      fallback,
      showDetails = false,
      title = 'Something went wrong',
      description = 'An unexpected error occurred. Please try again.',
      level = 'page',
    } = this.props;

    if (hasError) {
      // Return custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Determine container styles based on level
      const containerStyles = {
        page: 'min-h-screen flex items-center justify-center p-4',
        section: 'min-h-[400px] flex items-center justify-center p-4',
        component: 'min-h-[200px] flex items-center justify-center p-4',
      };

      const cardStyles = {
        page: 'max-w-lg w-full',
        section: 'max-w-md w-full',
        component: 'max-w-sm w-full',
      };

      return (
        <div className={containerStyles[level]}>
          <div className={`${cardStyles[level]} rounded-xl border bg-card p-6 text-center`}>
            {/* Error Icon */}
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            {/* Error Title & Description */}
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-6">{description}</p>

            {/* Error ID */}
            {errorId && (
              <p className="text-xs text-muted-foreground mb-4">
                Error ID: <code className="bg-muted px-1 py-0.5 rounded">{errorId}</code>
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              {level === 'page' && (
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>

            {/* Technical Details (Development Mode) */}
            {showDetails && error && (
              <div className="mt-6 pt-6 border-t text-left">
                <button
                  onClick={this.copyErrorDetails}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-2"
                >
                  <Bug className="h-3 w-3" />
                  Copy Error Details
                </button>
                <div className="bg-muted/50 rounded-lg p-3 overflow-auto max-h-48">
                  <p className="text-xs font-mono text-destructive mb-2">{error.message}</p>
                  {error.stack && (
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                      {error.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCTIONAL WRAPPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Page-level error boundary wrapper
 * Use this to wrap entire pages
 */
export function PageErrorBoundary({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ErrorBoundary
      level="page"
      title="Page Error"
      description="This page encountered an error. Please try refreshing or return to the home page."
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Section-level error boundary wrapper
 * Use this to wrap major sections within a page
 */
export function SectionErrorBoundary({
  children,
  title = 'Section Error',
}: {
  children: ReactNode;
  title?: string;
}): JSX.Element {
  return (
    <ErrorBoundary
      level="section"
      title={title}
      description="This section encountered an error. Please try again."
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level error boundary wrapper
 * Use this to wrap individual components that might fail
 */
export function ComponentErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}): JSX.Element {
  return (
    <ErrorBoundary level="component" fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Route-level error boundary wrapper
 * Use this to wrap individual route elements for independent error handling
 */
export function RouteErrorBoundary({
  children,
  pageName,
}: {
  children: ReactNode;
  pageName?: string;
}): JSX.Element {
  return (
    <ErrorBoundary
      level="page"
      title={pageName ? `Error in ${pageName}` : 'Page Error'}
      description="This page encountered an error. Please try refreshing or return to the home page."
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Higher-order component to wrap a component with RouteErrorBoundary
 * Useful for wrapping route elements: withRouteErrorBoundary(MyPage, 'My Page')
 */
export function withRouteErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName?: string
): React.FC<P> {
  const displayName = pageName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithRouteErrorBoundary: React.FC<P> = (props) => (
    <RouteErrorBoundary pageName={displayName}>
      <WrappedComponent {...props} />
    </RouteErrorBoundary>
  );

  WithRouteErrorBoundary.displayName = `WithRouteErrorBoundary(${displayName})`;
  return WithRouteErrorBoundary;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY: Get stored errors for debugging
// ═══════════════════════════════════════════════════════════════════════════

export function getStoredErrors(): unknown[] {
  try {
    return JSON.parse(localStorage.getItem('skillengine_errors') || '[]');
  } catch {
    return [];
  }
}

export function clearStoredErrors(): void {
  localStorage.removeItem('skillengine_errors');
}

export default ErrorBoundary;
