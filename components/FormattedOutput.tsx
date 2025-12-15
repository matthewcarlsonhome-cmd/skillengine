/**
 * FormattedOutput - LLM Output Rendering Component
 *
 * Renders LLM streaming output with:
 * - Markdown formatting with ReactMarkdown
 * - Custom styled components for tables, code, blockquotes
 * - Loading states with progress indicator
 * - Error states with retry support
 * - Copy/download actions
 * - ARIA live regions for streaming updates
 */

import React, { memo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Clipboard,
  Download,
  Save,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { StreamingIndicator } from './ui/Skeleton';
import { ErrorBanner } from './ui/ErrorBanner';
import { prose, cn } from '../lib/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FormattedOutputProps {
  /** The output text to render */
  output: string;
  /** Whether currently loading/streaming */
  isLoading?: boolean;
  /** Progress percentage (0-100) for loading state */
  progress?: number;
  /** Error message if any */
  error?: string | null;
  /** Callback for retry on error */
  onRetry?: () => void;
  /** Callback for copy action */
  onCopy?: () => void;
  /** Callback for download action */
  onDownload?: () => void;
  /** Callback for save action */
  onSave?: () => void;
  /** Whether output has been saved */
  isSaved?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom loading message */
  loadingMessage?: string;
  /** Show action buttons */
  showActions?: boolean;
  /** Request ID for debugging display */
  requestId?: string;
  /** Timing info to display */
  timingInfo?: {
    timeToFirstToken?: string;
    totalDuration?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKDOWN COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const markdownComponents = {
  hr: ({ ...props }: React.ComponentPropsWithoutRef<'hr'>) => (
    <hr className="my-8 border-border border-t-2" {...props} />
  ),
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="flex items-center gap-2 text-xl font-bold border-b border-border pb-2 mt-8 mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="text-lg font-semibold text-foreground/90 mt-6 mb-3" {...props}>
      {children}
    </h3>
  ),
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-border rounded-md overflow-hidden" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.ComponentPropsWithoutRef<'thead'>) => (
    <thead className="bg-muted" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <td className="px-4 py-3 text-sm border-b border-border" {...props}>
      {children}
    </td>
  ),
  blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-4 border-primary bg-muted/50 py-3 px-4 my-4 rounded-r-md not-italic" {...props}>
      {children}
    </blockquote>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul className="list-disc pl-6 space-y-2 my-4" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol className="list-decimal pl-6 space-y-2 my-4" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
    <li className="leading-relaxed" {...props}>{children}</li>
  ),
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && !className;
    return isInline ? (
      <code className="bg-muted font-mono text-sm px-1.5 py-0.5 rounded-md text-primary" {...props}>
        {children}
      </code>
    ) : (
      <code className="block bg-muted font-mono text-sm p-4 rounded-md overflow-x-auto my-4 border border-border" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) => (
    <pre className="bg-muted rounded-md overflow-x-auto my-4 border border-border" {...props}>
      {children}
    </pre>
  ),
  strong: ({ children, ...props }: React.ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-foreground" {...props}>{children}</strong>
  ),
  a: ({ children, href, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
    <a
      href={href}
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const FormattedOutput: React.FC<FormattedOutputProps> = memo(({
  output,
  isLoading = false,
  progress = 0,
  error = null,
  onRetry,
  onCopy,
  onDownload,
  onSave,
  isSaved = false,
  className = '',
  loadingMessage = 'AI is thinking...',
  showActions = true,
  requestId,
  timingInfo,
}) => {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (isLoading && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isLoading]);

  // Update ARIA live region for streaming
  useEffect(() => {
    if (liveRegionRef.current) {
      if (isLoading) {
        liveRegionRef.current.textContent = 'Generating response...';
      } else if (error) {
        liveRegionRef.current.textContent = `Error: ${error}`;
      } else if (output) {
        liveRegionRef.current.textContent = 'Response complete.';
      }
    }
  }, [isLoading, error, output]);

  const hasOutput = output.length > 0;

  return (
    <div className={cn('relative', className)}>
      {/* ARIA live region */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Action buttons - positioned in top right */}
      {showActions && hasOutput && !isLoading && (
        <div className="absolute top-2 right-2 flex gap-1.5 z-10">
          {onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
              title={isSaved ? 'Saved' : 'Save to Dashboard'}
              className={cn('h-8 w-8', isSaved && 'text-green-500')}
            >
              {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            </Button>
          )}
          {onCopy && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCopy}
              title="Copy to Clipboard"
              className="h-8 w-8"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              title="Download"
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-4 space-y-3">
          <Progress value={progress} className="w-full" />
          <StreamingIndicator label={loadingMessage} className="justify-center" />
        </div>
      )}

      {/* Output content */}
      {hasOutput && (
        <div
          ref={outputRef}
          className={cn(
            prose.container,
            'max-h-[60vh] overflow-y-auto',
            isLoading && 'opacity-90'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {output}
          </ReactMarkdown>

          {/* Streaming cursor */}
          {isLoading && (
            <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1" />
          )}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4">
          <ErrorBanner
            message={error}
            onRetry={onRetry}
            errorCode={requestId}
          />
        </div>
      )}

      {/* Empty state */}
      {!hasOutput && !isLoading && !error && (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p className="text-sm">Output will appear here after execution</p>
        </div>
      )}

      {/* Timing info footer */}
      {timingInfo && !isLoading && hasOutput && (
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {timingInfo.timeToFirstToken && (
              <span>
                TTFT: <span className="font-medium text-foreground">{timingInfo.timeToFirstToken}</span>
              </span>
            )}
            {timingInfo.totalDuration && (
              <span>
                Total: <span className="font-medium text-foreground">{timingInfo.totalDuration}</span>
              </span>
            )}
          </div>
          {requestId && (
            <span className="font-mono opacity-60">{requestId}</span>
          )}
        </div>
      )}
    </div>
  );
});

FormattedOutput.displayName = 'FormattedOutput';

// ═══════════════════════════════════════════════════════════════════════════
// CITATIONS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CitationsProps {
  citations: Array<{
    web: {
      uri: string;
      title?: string;
    };
  }>;
  className?: string;
}

export const Citations: React.FC<CitationsProps> = memo(({ citations, className = '' }) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-lg font-semibold">Sources</h3>
      <div className="p-4 border rounded-lg bg-card text-sm">
        <ul className="space-y-2">
          {citations.map((citation, index) => (
            <li key={index} className="flex items-start gap-2">
              <svg
                className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <a
                href={citation.web.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
                title={citation.web.uri}
              >
                {citation.web.title || citation.web.uri}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

Citations.displayName = 'Citations';

export default FormattedOutput;
