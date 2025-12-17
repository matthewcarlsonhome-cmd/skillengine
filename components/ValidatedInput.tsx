/**
 * ValidatedInput - Real-time Validated Form Input Component
 *
 * Enhanced input/textarea with:
 * - Real-time validation with debounce
 * - Visual status indicators (valid/invalid/empty)
 * - Character count display
 * - Required field badge
 * - Helper text/microcopy support
 * - Highlight animation when auto-filled
 *
 * Features:
 * - Accessible with ARIA attributes
 * - Keyboard navigation support
 * - Custom validation functions
 * - File upload support for textareas
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '../lib/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidatedInputProps {
  /** Unique identifier for the input */
  id: string;
  /** Label text */
  label: string;
  /** Input type: 'text', 'textarea', 'select' */
  type?: 'text' | 'textarea' | 'select';
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Helper text/microcopy shown below the input */
  helperText?: string;
  /** Custom validation function */
  validate?: (value: string) => string | null;
  /** Debounce delay for validation in ms */
  validationDelay?: number;
  /** Maximum character count */
  maxLength?: number;
  /** Number of rows for textarea */
  rows?: number;
  /** Options for select type */
  options?: { value: string; label: string }[];
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether to show file upload button (for textarea) */
  allowFileUpload?: boolean;
  /** Accepted file types for upload */
  acceptedFileTypes?: string;
  /** Whether the field was recently auto-filled (triggers highlight) */
  wasAutoFilled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface ValidationState {
  status: 'idle' | 'valid' | 'invalid' | 'validating';
  message: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  helperText,
  validate,
  validationDelay = 300,
  maxLength,
  rows = 4,
  options = [],
  disabled = false,
  allowFileUpload = false,
  acceptedFileTypes = '.txt,.pdf,.doc,.docx',
  wasAutoFilled = false,
  className = '',
}) => {
  const [validation, setValidation] = useState<ValidationState>({
    status: 'idle',
    message: null,
  });
  const [showHighlight, setShowHighlight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle auto-fill highlight animation
  useEffect(() => {
    if (wasAutoFilled && value) {
      setShowHighlight(true);
      const timer = setTimeout(() => setShowHighlight(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [wasAutoFilled, value]);

  // Debounced validation
  const runValidation = useCallback((val: string) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (!val && !required) {
      setValidation({ status: 'idle', message: null });
      return;
    }

    if (!val && required) {
      setValidation({ status: 'invalid', message: 'This field is required' });
      return;
    }

    if (validate) {
      setValidation({ status: 'validating', message: null });
      validationTimeoutRef.current = setTimeout(() => {
        const error = validate(val);
        setValidation({
          status: error ? 'invalid' : 'valid',
          message: error,
        });
      }, validationDelay);
    } else if (required && val) {
      setValidation({ status: 'valid', message: null });
    }
  }, [required, validate, validationDelay]);

  useEffect(() => {
    runValidation(value);
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [value, runValidation]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      onChange(text);
    } catch (error) {
      console.error('Error reading file:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const characterCount = value.length;
  const isOverLimit = maxLength ? characterCount > maxLength : false;

  // Base input classes
  const inputBaseClasses = cn(
    'w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all',
    'placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-primary/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    validation.status === 'valid' && 'border-green-500/50 focus:ring-green-500/50',
    validation.status === 'invalid' && 'border-red-500/50 focus:ring-red-500/50',
    validation.status === 'idle' && 'border-border',
    showHighlight && 'animate-highlight bg-yellow-100 dark:bg-yellow-900/20',
    isOverLimit && 'border-red-500'
  );

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium flex items-center gap-2"
        >
          {label}
          {required && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Required
            </span>
          )}
        </label>
        {/* Validation Status Icon */}
        {validation.status === 'valid' && (
          <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
        )}
        {validation.status === 'invalid' && (
          <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
        )}
      </div>

      {/* Input Element */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={cn(inputBaseClasses, 'resize-none')}
            aria-required={required}
            aria-invalid={validation.status === 'invalid'}
            aria-describedby={`${id}-helper ${id}-error`}
          />
        ) : type === 'select' ? (
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={inputBaseClasses}
            aria-required={required}
            aria-invalid={validation.status === 'invalid'}
            aria-describedby={`${id}-helper ${id}-error`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={inputBaseClasses}
            aria-required={required}
            aria-invalid={validation.status === 'invalid'}
            aria-describedby={`${id}-helper ${id}-error`}
          />
        )}

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* File Upload for Textarea */}
      {type === 'textarea' && allowFileUpload && (
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileUpload}
            className="hidden"
            id={`${id}-file-upload`}
          />
          <label
            htmlFor={`${id}-file-upload`}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors',
              'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File
          </label>
        </div>
      )}

      {/* Helper Text / Error Message / Character Count */}
      <div className="flex items-start justify-between gap-2 min-h-[20px]">
        <div className="flex-1">
          {validation.status === 'invalid' && validation.message ? (
            <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
              {validation.message}
            </p>
          ) : helperText ? (
            <p id={`${id}-helper`} className="text-xs text-muted-foreground">
              {helperText}
            </p>
          ) : null}
        </div>
        {maxLength && (
          <p className={cn(
            'text-xs tabular-nums',
            isOverLimit ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HIGHLIGHT ANIMATION STYLE (add to global CSS)
// ═══════════════════════════════════════════════════════════════════════════

// Add this to your global CSS or tailwind config:
// @keyframes highlight {
//   0% { background-color: rgb(254 249 195); }
//   100% { background-color: transparent; }
// }
// .animate-highlight {
//   animation: highlight 1.5s ease-out;
// }

export default ValidatedInput;
