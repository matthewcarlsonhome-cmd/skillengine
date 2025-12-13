/**
 * parallelExecutor.ts - Parallel Workflow Step Execution
 *
 * This module provides utilities for executing workflow steps in parallel
 * when they don't have dependencies on each other. It analyzes the step
 * dependencies and groups independent steps together.
 */

import type { WorkflowStep } from '../storage/types';

/**
 * Represents a group of steps that can run in parallel
 */
export interface ExecutionGroup {
  groupIndex: number;
  stepIds: string[];
}

/**
 * Build execution groups from workflow steps based on dependencies
 *
 * Steps are grouped such that:
 * 1. All steps in a group have their dependencies satisfied by previous groups
 * 2. Steps within a group can run in parallel
 *
 * @param steps - The workflow steps to analyze
 * @returns Array of execution groups in order
 */
export function buildExecutionGroups(steps: WorkflowStep[]): ExecutionGroup[] {
  if (steps.length === 0) return [];

  // Build dependency map
  const stepMap = new Map<string, WorkflowStep>();
  steps.forEach((step) => stepMap.set(step.id, step));

  // Resolve dependencies for each step
  const dependencies = new Map<string, Set<string>>();
  steps.forEach((step, index) => {
    if (step.dependsOn && step.dependsOn.length > 0) {
      // Use explicit dependencies
      dependencies.set(step.id, new Set(step.dependsOn));
    } else if (index > 0) {
      // Default: depend on the previous step
      dependencies.set(step.id, new Set([steps[index - 1].id]));
    } else {
      // First step has no dependencies
      dependencies.set(step.id, new Set());
    }
  });

  // Build execution groups using topological sort
  const groups: ExecutionGroup[] = [];
  const completed = new Set<string>();
  const remaining = new Set(steps.map((s) => s.id));

  let groupIndex = 0;
  while (remaining.size > 0) {
    // Find all steps whose dependencies are satisfied
    const readySteps: string[] = [];
    for (const stepId of remaining) {
      const deps = dependencies.get(stepId) || new Set();
      const depsArray = Array.from(deps);
      if (depsArray.every((dep) => completed.has(dep))) {
        readySteps.push(stepId);
      }
    }

    if (readySteps.length === 0) {
      // Circular dependency or missing dependency
      console.error('Circular or missing dependency detected');
      // Add remaining steps as a sequential fallback
      for (const stepId of remaining) {
        groups.push({ groupIndex: groupIndex++, stepIds: [stepId] });
        completed.add(stepId);
      }
      break;
    }

    // Create a group with all ready steps
    groups.push({ groupIndex: groupIndex++, stepIds: readySteps });

    // Mark these steps as completed
    readySteps.forEach((stepId) => {
      completed.add(stepId);
      remaining.delete(stepId);
    });
  }

  return groups;
}

/**
 * Check if a workflow has any parallel execution opportunities
 *
 * @param steps - The workflow steps
 * @returns true if any group has more than one step
 */
export function hasParallelSteps(steps: WorkflowStep[]): boolean {
  const groups = buildExecutionGroups(steps);
  return groups.some((group) => group.stepIds.length > 1);
}

/**
 * Get the maximum parallelism in a workflow
 *
 * @param steps - The workflow steps
 * @returns The maximum number of steps that can run at once
 */
export function getMaxParallelism(steps: WorkflowStep[]): number {
  const groups = buildExecutionGroups(steps);
  return Math.max(...groups.map((g) => g.stepIds.length), 1);
}

/**
 * Visualize the execution plan as a text diagram
 *
 * @param steps - The workflow steps
 * @returns A text representation of the execution plan
 */
export function visualizeExecutionPlan(steps: WorkflowStep[]): string {
  const groups = buildExecutionGroups(steps);
  const stepMap = new Map<string, WorkflowStep>();
  steps.forEach((step) => stepMap.set(step.id, step));

  const lines: string[] = [];
  lines.push('Execution Plan:');
  lines.push('===============');

  groups.forEach((group, index) => {
    const stepNames = group.stepIds.map((id) => stepMap.get(id)?.name || id);
    if (stepNames.length === 1) {
      lines.push(`${index + 1}. ${stepNames[0]}`);
    } else {
      lines.push(`${index + 1}. [PARALLEL]`);
      stepNames.forEach((name) => {
        lines.push(`   ├─ ${name}`);
      });
    }
  });

  return lines.join('\n');
}
