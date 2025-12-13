/**
 * batch.ts - Batch Workflow Execution
 *
 * Executes workflows with multiple input sets in parallel with rate limiting.
 */

import type { Workflow, WorkflowExecution, WorkflowStep } from '../storage/types';

/**
 * A single item in a batch execution
 */
export interface BatchItem {
  id: string;
  inputs: Record<string, string>;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: WorkflowExecution;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Batch execution state
 */
export interface BatchExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  items: BatchItem[];
  status: 'pending' | 'running' | 'paused' | 'completed' | 'error';
  concurrency: number;
  startedAt?: string;
  completedAt?: string;
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
}

/**
 * Options for batch execution
 */
export interface BatchOptions {
  concurrency?: number;  // Max parallel executions (default: 3)
  delayMs?: number;      // Delay between starting items (default: 500)
  onItemStart?: (item: BatchItem) => void;
  onItemComplete?: (item: BatchItem) => void;
  onItemError?: (item: BatchItem, error: string) => void;
  onProgress?: (progress: BatchExecution['progress']) => void;
}

/**
 * Create a new batch execution
 */
export function createBatchExecution(
  workflow: Workflow,
  inputSets: Record<string, string>[],
  options: BatchOptions = {}
): BatchExecution {
  const items: BatchItem[] = inputSets.map((inputs, index) => ({
    id: `batch-item-${index}-${Date.now()}`,
    inputs,
    status: 'pending',
  }));

  return {
    id: `batch-${workflow.id}-${Date.now()}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    items,
    status: 'pending',
    concurrency: options.concurrency || 3,
    progress: {
      total: items.length,
      completed: 0,
      failed: 0,
    },
  };
}

/**
 * Parse CSV text into input sets
 */
export function parseCSVToInputSets(
  csvText: string,
  columnMapping: Record<string, string>  // CSV column -> workflow input ID
): Record<string, string>[] {
  const lines = csvText.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

  // Parse data rows
  const inputSets: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const inputs: Record<string, string> = {};

    for (const [csvColumn, inputId] of Object.entries(columnMapping)) {
      const columnIndex = headers.indexOf(csvColumn);
      if (columnIndex !== -1 && values[columnIndex]) {
        inputs[inputId] = values[columnIndex];
      }
    }

    if (Object.keys(inputs).length > 0) {
      inputSets.push(inputs);
    }
  }

  return inputSets;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Export batch results to CSV
 */
export function exportBatchResultsToCSV(
  batch: BatchExecution,
  workflow: Workflow
): string {
  const headers = [
    'Item ID',
    'Status',
    'Started At',
    'Completed At',
    ...workflow.globalInputs.map((i) => `Input: ${i.label}`),
    ...workflow.steps.map((s) => `Output: ${s.name}`),
  ];

  const rows = batch.items.map((item) => {
    const inputValues = workflow.globalInputs.map((i) =>
      escapeCSVValue(item.inputs[i.id] || '')
    );

    const outputValues = workflow.steps.map((s) =>
      escapeCSVValue(item.result?.stepOutputs[s.outputKey] || '')
    );

    return [
      item.id,
      item.status,
      item.startedAt || '',
      item.completedAt || '',
      ...inputValues,
      ...outputValues,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Escape a value for CSV
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Get batch execution summary
 */
export function getBatchSummary(batch: BatchExecution): {
  totalItems: number;
  completed: number;
  failed: number;
  pending: number;
  running: number;
  successRate: number;
  avgDurationMs: number;
} {
  let completed = 0;
  let failed = 0;
  let pending = 0;
  let running = 0;
  let totalDurationMs = 0;
  let durationsCount = 0;

  for (const item of batch.items) {
    switch (item.status) {
      case 'completed':
        completed++;
        if (item.startedAt && item.completedAt) {
          totalDurationMs += new Date(item.completedAt).getTime() - new Date(item.startedAt).getTime();
          durationsCount++;
        }
        break;
      case 'error':
        failed++;
        break;
      case 'running':
        running++;
        break;
      default:
        pending++;
    }
  }

  return {
    totalItems: batch.items.length,
    completed,
    failed,
    pending,
    running,
    successRate: batch.items.length > 0 ? (completed / batch.items.length) * 100 : 0,
    avgDurationMs: durationsCount > 0 ? totalDurationMs / durationsCount : 0,
  };
}
