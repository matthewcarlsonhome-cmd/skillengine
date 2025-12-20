/**
 * FormBuilder Component
 *
 * A flexible, type-safe form builder that renders forms based on a schema definition.
 * Provides consistent form rendering across the application with built-in:
 * - Validation
 * - File upload support
 * - Pre-fill from context
 * - Error handling
 * - Accessibility
 *
 * Usage:
 * ```tsx
 * <FormBuilder
 *   inputs={skill.inputs}
 *   values={formState}
 *   onChange={handleChange}
 *   onSubmit={handleSubmit}
 *   prefillData={{ resume: contextResume }}
 * />
 * ```
 */

import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, HelpCircle, Check, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { Button } from './ui/Button';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FormInput {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'email' | 'url';
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
  rows?: number;
  min?: number;
  max?: number;
  pattern?: string;
  /** Field IDs that support file upload */
  allowFileUpload?: boolean;
  /** Validation function - return error message or null if valid */
  validate?: (value: unknown) => string | null;
  /** Condition for showing this field */
  showWhen?: (values: Record<string, unknown>) => boolean;
}

export interface FormBuilderProps {
  /** Form field definitions */
  inputs: FormInput[];
  /** Current form values */
  values: Record<string, unknown>;
  /** Called when any field changes */
  onChange: (id: string, value: unknown) => void;
  /** Called when form is submitted */
  onSubmit?: () => void;
  /** Data to pre-fill fields with */
  prefillData?: Record<string, unknown>;
  /** Field IDs that allow file upload */
  uploadableFields?: string[];
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Submit button text */
  submitLabel?: string;
  /** Whether to show validation errors */
  showValidation?: boolean;
  /** Custom class for the form container */
  className?: string;
  /** Layout mode */
  layout?: 'vertical' | 'horizontal' | 'grid';
  /** Number of columns for grid layout */
  columns?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const defaultValidators = {
  required: (value: unknown, label: string): string | null => {
    if (value === undefined || value === null || value === '') {
      return `${label} is required`;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return `${label} is required`;
    }
    return null;
  },

  email: (value: unknown): string | null => {
    if (typeof value !== 'string' || !value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  url: (value: unknown): string | null => {
    if (typeof value !== 'string' || !value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  minLength: (value: unknown, min: number, label: string): string | null => {
    if (typeof value !== 'string') return null;
    if (value.length < min) {
      return `${label} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value: unknown, max: number, label: string): string | null => {
    if (typeof value !== 'string') return null;
    if (value.length > max) {
      return `${label} must be less than ${max} characters`;
    }
    return null;
  },

  pattern: (value: unknown, pattern: string, label: string): string | null => {
    if (typeof value !== 'string' || !value) return null;
    try {
      // Validate the regex pattern first to prevent ReDoS attacks
      const regex = new RegExp(pattern);

      // Limit input length to prevent exponential backtracking
      const testValue = value.length > 10000 ? value.substring(0, 10000) : value;
      if (!regex.test(testValue)) {
        return `${label} format is invalid`;
      }
      return null;
    } catch {
      // Invalid regex pattern - reject gracefully
      return `${label} has an invalid validation pattern`;
    }
  },
};

export function validateForm(
  inputs: FormInput[],
  values: Record<string, unknown>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const input of inputs) {
    // Skip hidden fields
    if (input.showWhen && !input.showWhen(values)) {
      continue;
    }

    const value = values[input.id];

    // Required validation
    if (input.required) {
      const error = defaultValidators.required(value, input.label);
      if (error) {
        errors[input.id] = error;
        continue;
      }
    }

    // Type-specific validation
    if (input.type === 'email') {
      const error = defaultValidators.email(value);
      if (error) {
        errors[input.id] = error;
        continue;
      }
    }

    if (input.type === 'url') {
      const error = defaultValidators.url(value);
      if (error) {
        errors[input.id] = error;
        continue;
      }
    }

    // Pattern validation
    if (input.pattern) {
      const error = defaultValidators.pattern(value, input.pattern, input.label);
      if (error) {
        errors[input.id] = error;
        continue;
      }
    }

    // Custom validation
    if (input.validate) {
      const error = input.validate(value);
      if (error) {
        errors[input.id] = error;
        continue;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FORM BUILDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function FormBuilder({
  inputs,
  values,
  onChange,
  onSubmit,
  prefillData,
  uploadableFields = ['jobDescription', 'userBackground', 'additionalContext', 'resume'],
  isSubmitting = false,
  submitLabel = 'Submit',
  showValidation = true,
  className = '',
  layout = 'vertical',
  columns = 2,
}: FormBuilderProps): JSX.Element {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (id: string, value: unknown) => {
      onChange(id, value);

      // Clear error when field is modified
      if (errors[id]) {
        setErrors(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [onChange, errors]
  );

  const handleBlur = useCallback((id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, inputId: string) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          handleChange(inputId, text);
        }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset file input
    },
    [handleChange]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const validation = validateForm(inputs, values);

      if (!validation.valid) {
        setErrors(validation.errors);
        // Mark all fields with errors as touched
        const newTouched: Record<string, boolean> = {};
        Object.keys(validation.errors).forEach(id => {
          newTouched[id] = true;
        });
        setTouched(prev => ({ ...prev, ...newTouched }));
        return;
      }

      setErrors({});
      onSubmit?.();
    },
    [inputs, values, onSubmit]
  );

  const getLayoutClass = (): string => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-4';
      case 'grid':
        return `grid grid-cols-1 md:grid-cols-${columns} gap-4`;
      default:
        return 'space-y-4';
    }
  };

  const renderInput = (input: FormInput): JSX.Element | null => {
    // Check conditional rendering
    if (input.showWhen && !input.showWhen(values)) {
      return null;
    }

    const value = values[input.id];
    const error = showValidation && touched[input.id] ? errors[input.id] : undefined;
    const isUploadable = uploadableFields.includes(input.id) && input.type === 'textarea';

    const inputId = `form-${input.id}`;

    return (
      <div key={input.id} className="space-y-2">
        {/* Label */}
        {input.type !== 'checkbox' && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="text-sm font-medium flex items-center gap-1"
            >
              {input.label}
              {input.required && <span className="text-destructive">*</span>}
              {input.helpText && (
                <span className="text-muted-foreground" title={input.helpText}>
                  <HelpCircle className="h-3 w-3" />
                </span>
              )}
            </label>
            {isUploadable && (
              <label className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="h-3 w-3" />
                Upload File
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.doc,.docx,.pdf"
                  onChange={(e) => handleFileUpload(e, input.id)}
                />
              </label>
            )}
          </div>
        )}

        {/* Input Field */}
        {(() => {
          switch (input.type) {
            case 'text':
            case 'email':
            case 'url':
              return (
                <Input
                  id={inputId}
                  type={input.type}
                  placeholder={input.placeholder}
                  value={(value as string) || ''}
                  onChange={(e) => handleChange(input.id, e.target.value)}
                  onBlur={() => handleBlur(input.id)}
                  required={input.required}
                  className={error ? 'border-destructive' : ''}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                />
              );

            case 'number':
              return (
                <Input
                  id={inputId}
                  type="number"
                  placeholder={input.placeholder}
                  value={(value as number) || ''}
                  onChange={(e) => handleChange(input.id, Number(e.target.value))}
                  onBlur={() => handleBlur(input.id)}
                  min={input.min}
                  max={input.max}
                  required={input.required}
                  className={error ? 'border-destructive' : ''}
                />
              );

            case 'textarea':
              return (
                <Textarea
                  id={inputId}
                  placeholder={input.placeholder}
                  value={(value as string) || ''}
                  onChange={(e) => handleChange(input.id, e.target.value)}
                  onBlur={() => handleBlur(input.id)}
                  rows={input.rows || 5}
                  required={input.required}
                  className={error ? 'border-destructive' : ''}
                />
              );

            case 'select':
              return (
                <Select
                  id={inputId}
                  value={(value as string) || ''}
                  onChange={(e) => handleChange(input.id, e.target.value)}
                  onBlur={() => handleBlur(input.id)}
                  required={input.required}
                  className={error ? 'border-destructive' : ''}
                >
                  <option value="">Select {input.label}</option>
                  {input.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              );

            case 'checkbox':
              return (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={inputId}
                    checked={!!value}
                    onCheckedChange={(checked) => handleChange(input.id, checked)}
                  />
                  <label
                    htmlFor={inputId}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {input.label}
                    {input.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                </div>
              );

            default:
              return null;
          }
        })()}

        {/* Help Text */}
        {input.helpText && input.type !== 'checkbox' && (
          <p className="text-xs text-muted-foreground">{input.helpText}</p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-destructive flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={getLayoutClass()}>{inputs.map(renderInput)}</div>

      {onSubmit && (
        <div className="mt-6">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Processing...' : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK: useFormState
// A hook for managing form state with validation
// ═══════════════════════════════════════════════════════════════════════════

export interface UseFormStateOptions<T extends Record<string, unknown>> {
  initialValues: T;
  inputs: FormInput[];
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useFormState<T extends Record<string, unknown>>({
  initialValues,
  inputs,
  onSubmit,
}: UseFormStateOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((id: string, value: unknown) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const validation = validateForm(inputs, values);
    if (!validation.valid) {
      return validation;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }

    return validation;
  }, [inputs, values, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  const setFieldValue = useCallback((id: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

  return {
    values,
    setValues,
    handleChange,
    handleSubmit,
    isSubmitting,
    reset,
    setFieldValue,
    validate: () => validateForm(inputs, values),
  };
}

export default FormBuilder;
