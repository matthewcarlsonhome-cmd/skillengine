/**
 * StreamingText - Animated text display for AI streaming output
 *
 * Features:
 * - Typing cursor animation
 * - Character-by-character reveal (optional)
 * - Smooth fade-in for chunks
 * - Copy button with animation
 * - Auto-scroll to bottom
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPING CURSOR
// ═══════════════════════════════════════════════════════════════════════════

export const TypingCursor: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={`inline-block w-2 h-5 bg-primary ml-0.5 animate-pulse ${className || ''}`}
    style={{
      animation: 'cursor-blink 1s step-end infinite',
    }}
  />
);

// ═══════════════════════════════════════════════════════════════════════════
// STREAMING INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

export interface StreamingIndicatorProps {
  label?: string;
  className?: string;
}

export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  label = 'AI is generating',
  className,
}) => (
  <div className={`flex items-center gap-2 text-muted-foreground ${className || ''}`}>
    <Loader2 className="h-4 w-4 animate-spin text-primary" />
    <span className="text-sm">{label}</span>
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// STREAMING TEXT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  showCursor?: boolean;
  autoScroll?: boolean;
  className?: string;
  onCopy?: () => void;
  copyLabel?: string;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  isStreaming = false,
  showCursor = true,
  autoScroll = true,
  className,
  onCopy,
  copyLabel = 'Copy',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (autoScroll && containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text, autoScroll, isStreaming]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className || ''}`}>
      {/* Copy button */}
      {text && (
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 group-hover:opacity-100'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              {copyLabel}
            </>
          )}
        </button>
      )}

      {/* Content */}
      <div
        ref={containerRef}
        className="overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>

        {/* Typing cursor */}
        {isStreaming && showCursor && <TypingCursor />}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STREAMING OUTPUT CONTAINER
// ═══════════════════════════════════════════════════════════════════════════

export interface StreamingOutputProps {
  text: string;
  isStreaming?: boolean;
  error?: string | null;
  placeholder?: string;
  className?: string;
  onCopy?: () => void;
  onRetry?: () => void;
}

export const StreamingOutput: React.FC<StreamingOutputProps> = ({
  text,
  isStreaming = false,
  error,
  placeholder = 'Output will appear here...',
  className,
  onCopy,
  onRetry,
}) => {
  return (
    <div
      className={`relative rounded-xl border bg-muted/30 min-h-[200px] ${
        error ? 'border-red-500/50' : isStreaming ? 'border-primary/50' : ''
      } ${className || ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              error
                ? 'bg-red-500'
                : isStreaming
                ? 'bg-primary animate-pulse'
                : text
                ? 'bg-emerald-500'
                : 'bg-muted-foreground/30'
            }`}
          />
          <span className="text-sm font-medium">
            {error
              ? 'Error'
              : isStreaming
              ? 'Generating...'
              : text
              ? 'Output'
              : 'Ready'}
          </span>
        </div>
        {isStreaming && (
          <StreamingIndicator label="" className="text-xs" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {error ? (
          <div className="text-red-500">
            <p className="font-medium mb-2">An error occurred</p>
            <p className="text-sm opacity-80">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        ) : text ? (
          <StreamingText
            text={text}
            isStreaming={isStreaming}
            onCopy={onCopy}
            className="max-h-[60vh] overflow-y-auto"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm">{placeholder}</p>
          </div>
        )}
      </div>

      {/* Streaming gradient effect at bottom */}
      {isStreaming && text && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none rounded-b-xl" />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CSS FOR CURSOR ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

// Add this to your global CSS:
// @keyframes cursor-blink {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0; }
// }

export default StreamingText;
