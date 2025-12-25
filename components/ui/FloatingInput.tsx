/**
 * FloatingInput - Input with animated floating label
 *
 * Features:
 * - Label floats up when input is focused or has value
 * - Smooth CSS transitions
 * - Character counter for textareas
 * - Validation states (success, error)
 * - Required indicator
 */

import React, { useState, useId } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING INPUT
// ═══════════════════════════════════════════════════════════════════════════

export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, success, helperText, required, className, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const inputId = props.id || id;

    const hasValue = value !== undefined && value !== '';
    const isFloating = isFocused || hasValue;

    const borderColor = error
      ? 'border-red-500 focus-within:ring-red-500/20'
      : success
      ? 'border-emerald-500 focus-within:ring-emerald-500/20'
      : 'border-input focus-within:border-primary focus-within:ring-primary/20';

    return (
      <div className={`relative ${className || ''}`}>
        <div className={`relative rounded-lg border bg-background transition-all duration-200 focus-within:ring-2 ${borderColor}`}>
          <input
            ref={ref}
            id={inputId}
            value={value}
            className="peer w-full bg-transparent px-4 pt-5 pb-2 text-sm outline-none placeholder-transparent"
            placeholder={label}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              isFloating
                ? 'top-1.5 text-xs text-muted-foreground'
                : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-xs'
            } ${error ? 'text-red-500' : success ? 'text-emerald-500' : ''}`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-xs ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = 'FloatingInput';

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING TEXTAREA
// ═══════════════════════════════════════════════════════════════════════════

export interface FloatingTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, success, helperText, required, className, value, maxLength, showCount = true, rows = 4, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const inputId = props.id || id;

    const hasValue = value !== undefined && value !== '';
    const isFloating = isFocused || hasValue;
    const charCount = typeof value === 'string' ? value.length : 0;

    const borderColor = error
      ? 'border-red-500 focus-within:ring-red-500/20'
      : success
      ? 'border-emerald-500 focus-within:ring-emerald-500/20'
      : 'border-input focus-within:border-primary focus-within:ring-primary/20';

    return (
      <div className={`relative ${className || ''}`}>
        <div className={`relative rounded-lg border bg-background transition-all duration-200 focus-within:ring-2 ${borderColor}`}>
          <textarea
            ref={ref}
            id={inputId}
            value={value}
            rows={rows}
            maxLength={maxLength}
            className="peer w-full bg-transparent px-4 pt-6 pb-2 text-sm outline-none placeholder-transparent resize-none"
            placeholder={label}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              isFloating
                ? 'top-2 text-xs text-muted-foreground'
                : 'top-4 text-sm text-muted-foreground peer-focus:top-2 peer-focus:text-xs'
            } ${error ? 'text-red-500' : success ? 'text-emerald-500' : ''}`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {showCount && maxLength && (
            <div className="absolute right-3 bottom-2 text-xs text-muted-foreground">
              {charCount}/{maxLength}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-xs ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
FloatingTextarea.displayName = 'FloatingTextarea';

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING SELECT
// ═══════════════════════════════════════════════════════════════════════════

export interface FloatingSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  options: { value: string; label: string }[];
}

const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, error, success, helperText, required, className, value, options, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const inputId = props.id || id;

    const hasValue = value !== undefined && value !== '';
    const isFloating = isFocused || hasValue;

    const borderColor = error
      ? 'border-red-500 focus-within:ring-red-500/20'
      : success
      ? 'border-emerald-500 focus-within:ring-emerald-500/20'
      : 'border-input focus-within:border-primary focus-within:ring-primary/20';

    return (
      <div className={`relative ${className || ''}`}>
        <div className={`relative rounded-lg border bg-background transition-all duration-200 focus-within:ring-2 ${borderColor}`}>
          <select
            ref={ref}
            id={inputId}
            value={value}
            className="peer w-full bg-transparent px-4 pt-5 pb-2 text-sm outline-none appearance-none cursor-pointer"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label
            htmlFor={inputId}
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              isFloating
                ? 'top-1.5 text-xs text-muted-foreground'
                : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground'
            } ${error ? 'text-red-500' : success ? 'text-emerald-500' : ''}`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-xs ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
FloatingSelect.displayName = 'FloatingSelect';

// ═══════════════════════════════════════════════════════════════════════════
// INPUT GROUP - Grouped inputs with shared styling
// ═══════════════════════════════════════════════════════════════════════════

export interface InputGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ children, label, className }) => (
  <div className={`space-y-4 rounded-xl bg-muted/30 p-4 ${className || ''}`}>
    {label && (
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </h4>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export { FloatingInput, FloatingTextarea, FloatingSelect, InputGroup };
