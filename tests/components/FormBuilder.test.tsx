/**
 * FormBuilder Component Tests
 *
 * Tests for the dynamic form builder component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormBuilder, { FormInput } from '../../components/FormBuilder';

// Mock inputs for testing
const mockInputs: FormInput[] = [
  {
    id: 'textInput',
    label: 'Text Input',
    type: 'text',
    required: true,
    placeholder: 'Enter text...',
  },
  {
    id: 'textareaInput',
    label: 'Textarea Input',
    type: 'textarea',
    required: false,
    placeholder: 'Enter longer text...',
  },
  {
    id: 'selectInput',
    label: 'Select Input',
    type: 'select',
    required: true,
    options: ['Option 1', 'Option 2', 'Option 3'],
  },
  {
    id: 'checkboxInput',
    label: 'Checkbox Input',
    type: 'checkbox',
    required: false,
  },
];

describe('FormBuilder Component', () => {
  describe('Rendering', () => {
    it('renders form with all input fields', () => {
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
        />
      );

      expect(screen.getByLabelText(/text input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/textarea input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/select input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/checkbox input/i)).toBeInTheDocument();
    });

    it('renders submit button when onSubmit provided', () => {
      const handleChange = vi.fn();
      const handleSubmit = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /submit|run|generate/i })).toBeInTheDocument();
    });

    it('renders custom submit label', () => {
      const handleChange = vi.fn();
      const handleSubmit = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Generate Report"
        />
      );

      expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();
    });

    it('renders placeholders correctly', () => {
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
        />
      );

      expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter longer text/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('disables submit button when isSubmitting', () => {
      const handleChange = vi.fn();
      const handleSubmit = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when typing in text input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
        />
      );

      const textInput = screen.getByLabelText(/text input/i);
      await user.type(textInput, 'H');

      expect(handleChange).toHaveBeenCalledWith('textInput', 'H');
    });

    it('calls onChange when typing in textarea', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
        />
      );

      const textarea = screen.getByLabelText(/textarea input/i);
      await user.type(textarea, 'L');

      expect(handleChange).toHaveBeenCalledWith('textareaInput', 'L');
    });

    it('calls onChange when selecting from dropdown', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
        />
      );

      const select = screen.getByLabelText(/select input/i);
      await user.selectOptions(select, 'Option 2');

      expect(handleChange).toHaveBeenCalledWith('selectInput', 'Option 2');
    });

    it('calls onChange when clicking checkbox', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
        />
      );

      const checkbox = screen.getByLabelText(/checkbox input/i);
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith('checkboxInput', true);
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleSubmit = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{ textInput: 'test', selectInput: 'Option 1' }}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit|run|generate/i });
      await user.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Values Display', () => {
    it('displays provided values in form fields', () => {
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{
            textInput: 'Initial text',
            textareaInput: 'Initial textarea content',
            selectInput: 'Option 2',
          }}
          onChange={handleChange}
        />
      );

      expect(screen.getByLabelText(/text input/i)).toHaveValue('Initial text');
      expect(screen.getByLabelText(/textarea input/i)).toHaveValue('Initial textarea content');
      expect(screen.getByLabelText(/select input/i)).toHaveValue('Option 2');
    });
  });

  describe('Accessibility', () => {
    it('has proper label associations', () => {
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
        />
      );

      // Each input should be accessible by its label
      expect(screen.getByLabelText(/text input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/textarea input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/select input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/checkbox input/i)).toBeInTheDocument();
    });

    it('form is keyboard navigable', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <FormBuilder
          inputs={mockInputs}
          values={{}}
          onChange={handleChange}
        />
      );

      // Tab through form fields
      await user.tab();

      // First focusable element should be focused
      expect(document.activeElement).not.toBe(document.body);
    });
  });
});
