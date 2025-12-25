/**
 * conditions.ts - Conditional Step Execution Evaluator
 *
 * Evaluates conditions for workflow steps to determine if they should run.
 * Supports various operators for comparing step outputs.
 */

import { logger } from '../logger';
import type { StepCondition, WorkflowStep } from '../storage/types';

/**
 * Extract a value from a step output using a field path
 *
 * @param output - The step output (string, possibly containing JSON)
 * @param fieldPath - Dot-separated path like 'score' or 'risk.level'
 * @returns The extracted value or the entire output if no field specified
 */
export function extractField(output: string, fieldPath?: string): string | number | boolean | null {
  if (!fieldPath) {
    return output;
  }

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(output);
    const parts = fieldPath.split('.');
    let value: unknown = parsed;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return null;
      }
      if (typeof value === 'object' && part in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    return JSON.stringify(value);
  } catch {
    // Not JSON, try to find the field in the text
    // Look for patterns like "field: value" or "field = value"
    const patterns = [
      new RegExp(`${fieldPath}[:\\s]+([\\d.]+)`, 'i'),        // fieldPath: 75 or fieldPath 75
      new RegExp(`${fieldPath}[:\\s]+"([^"]+)"`, 'i'),        // fieldPath: "value"
      new RegExp(`${fieldPath}[:\\s]+'([^']+)'`, 'i'),        // fieldPath: 'value'
      new RegExp(`${fieldPath}[:\\s]+([^\\s,]+)`, 'i'),       // fieldPath: value
      new RegExp(`\\*\\*${fieldPath}\\*\\*[:\\s]+([\\d.]+)`, 'i'), // **fieldPath**: 75 (markdown)
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match && match[1]) {
        const numValue = parseFloat(match[1]);
        return isNaN(numValue) ? match[1] : numValue;
      }
    }

    // Check if the field name exists anywhere in the output
    if (output.toLowerCase().includes(fieldPath.toLowerCase())) {
      return true;
    }

    return null;
  }
}

/**
 * Evaluate a condition against step outputs
 *
 * @param condition - The condition to evaluate
 * @param stepOutputs - Map of outputKey -> output value
 * @param steps - All workflow steps (to look up outputKey from step ID)
 * @returns true if condition is met, false otherwise
 */
export function evaluateCondition(
  condition: StepCondition,
  stepOutputs: Record<string, string>,
  steps: WorkflowStep[]
): boolean {
  // Find the source step's output key
  const sourceStep = steps.find((s) => s.id === condition.sourceStep);
  if (!sourceStep) {
    logger.warn('Condition references unknown step', { sourceStep: condition.sourceStep });
    return true; // Default to running if step not found
  }

  const output = stepOutputs[sourceStep.outputKey];
  if (output === undefined) {
    // Step hasn't run yet or had an error
    return false;
  }

  const extractedValue = extractField(output, condition.field);

  switch (condition.operator) {
    case 'exists':
      return extractedValue !== null && extractedValue !== undefined && extractedValue !== '';

    case 'notExists':
      return extractedValue === null || extractedValue === undefined || extractedValue === '';

    case 'equals':
      if (typeof extractedValue === 'number' && typeof condition.value === 'number') {
        return extractedValue === condition.value;
      }
      return String(extractedValue).toLowerCase() === String(condition.value).toLowerCase();

    case 'notEquals':
      if (typeof extractedValue === 'number' && typeof condition.value === 'number') {
        return extractedValue !== condition.value;
      }
      return String(extractedValue).toLowerCase() !== String(condition.value).toLowerCase();

    case 'contains':
      return String(extractedValue).toLowerCase().includes(String(condition.value).toLowerCase());

    case 'notContains':
      return !String(extractedValue).toLowerCase().includes(String(condition.value).toLowerCase());

    case 'greaterThan': {
      const numExtracted = typeof extractedValue === 'number' ? extractedValue : parseFloat(String(extractedValue));
      const numValue = typeof condition.value === 'number' ? condition.value : parseFloat(String(condition.value));
      return !isNaN(numExtracted) && !isNaN(numValue) && numExtracted > numValue;
    }

    case 'lessThan': {
      const numExtracted = typeof extractedValue === 'number' ? extractedValue : parseFloat(String(extractedValue));
      const numValue = typeof condition.value === 'number' ? condition.value : parseFloat(String(condition.value));
      return !isNaN(numExtracted) && !isNaN(numValue) && numExtracted < numValue;
    }

    default:
      logger.warn('Unknown condition operator', { operator: condition.operator });
      return true;
  }
}

/**
 * Get a human-readable description of a condition
 */
export function describeCondition(condition: StepCondition): string {
  const fieldDesc = condition.field ? `"${condition.field}"` : 'output';

  switch (condition.operator) {
    case 'exists':
      return `${fieldDesc} exists`;
    case 'notExists':
      return `${fieldDesc} does not exist`;
    case 'equals':
      return `${fieldDesc} equals "${condition.value}"`;
    case 'notEquals':
      return `${fieldDesc} does not equal "${condition.value}"`;
    case 'contains':
      return `${fieldDesc} contains "${condition.value}"`;
    case 'notContains':
      return `${fieldDesc} does not contain "${condition.value}"`;
    case 'greaterThan':
      return `${fieldDesc} > ${condition.value}`;
    case 'lessThan':
      return `${fieldDesc} < ${condition.value}`;
    default:
      return `condition on ${fieldDesc}`;
  }
}
