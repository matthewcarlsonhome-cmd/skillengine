/**
 * Tests for lib/workflows/index.ts
 *
 * Tests cover:
 * - Workflow structure validation
 * - Input/output mappings
 * - Step configurations
 * - Skill ID references
 */

import { describe, it, expect } from 'vitest';
import {
  JOB_APPLICATION_WORKFLOW,
  INTERVIEW_PREP_WORKFLOW,
  POST_INTERVIEW_WORKFLOW,
  WORKFLOWS,
  WORKFLOW_LIST,
} from '../../lib/workflows';
import { SKILLS } from '../../lib/skills/static';
import type { Workflow, WorkflowStep } from '../../lib/storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

function validateWorkflowStructure(workflow: Workflow) {
  // Required fields
  expect(workflow.id).toBeDefined();
  expect(workflow.name).toBeDefined();
  expect(workflow.description).toBeDefined();
  expect(workflow.globalInputs).toBeDefined();
  expect(workflow.steps).toBeDefined();
  expect(workflow.steps.length).toBeGreaterThan(0);
}

function validateStepSkillExists(step: WorkflowStep): { valid: boolean } {
  const skillExists = step.skillId in SKILLS;
  if (!skillExists) {
    throw new Error(`Skill "${step.skillId}" in step "${step.id}" does not exist in SKILLS registry`);
  }
  return { valid: true };
}

function validateInputMappings(workflow: Workflow) {
  const globalInputIds = workflow.globalInputs.map(input => input.id);
  const stepOutputKeys = new Map<string, string>();

  for (const step of workflow.steps) {
    // Track this step's output for future reference
    stepOutputKeys.set(step.id, step.outputKey);

    for (const [inputName, mapping] of Object.entries(step.inputMappings)) {
      if (mapping.type === 'global') {
        if (!globalInputIds.includes(mapping.inputId)) {
          throw new Error(
            `Step "${step.id}" references global input "${mapping.inputId}" which doesn't exist. ` +
            `Available global inputs: ${globalInputIds.join(', ')}`
          );
        }
      } else if (mapping.type === 'previous') {
        const prevStepIndex = workflow.steps.findIndex(s => s.id === mapping.stepId);
        const currentStepIndex = workflow.steps.findIndex(s => s.id === step.id);

        if (prevStepIndex === -1) {
          throw new Error(
            `Step "${step.id}" references previous step "${mapping.stepId}" which doesn't exist`
          );
        }

        if (prevStepIndex >= currentStepIndex) {
          throw new Error(
            `Step "${step.id}" references step "${mapping.stepId}" which comes after it in the workflow`
          );
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW REGISTRY TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Workflow Registry', () => {
  it('exports WORKFLOWS object with all workflows', () => {
    expect(WORKFLOWS).toBeDefined();
    expect(Object.keys(WORKFLOWS)).toContain('job-application');
    expect(Object.keys(WORKFLOWS)).toContain('interview-prep');
    expect(Object.keys(WORKFLOWS)).toContain('post-interview');
  });

  it('exports WORKFLOW_LIST array', () => {
    expect(WORKFLOW_LIST).toBeDefined();
    expect(Array.isArray(WORKFLOW_LIST)).toBe(true);
    expect(WORKFLOW_LIST.length).toBe(3);
  });

  it('WORKFLOW_LIST contains same workflows as WORKFLOWS object', () => {
    const workflowIds = WORKFLOW_LIST.map(w => w.id);
    expect(workflowIds).toContain('job-application');
    expect(workflowIds).toContain('interview-prep');
    expect(workflowIds).toContain('post-interview');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// JOB APPLICATION WORKFLOW TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Job Application Workflow', () => {
  const workflow = JOB_APPLICATION_WORKFLOW;

  it('has valid structure', () => {
    validateWorkflowStructure(workflow);
  });

  it('has correct id', () => {
    expect(workflow.id).toBe('job-application');
  });

  it('has required global inputs', () => {
    const inputIds = workflow.globalInputs.map(i => i.id);
    expect(inputIds).toContain('jobTitle');
    expect(inputIds).toContain('companyName');
    expect(inputIds).toContain('jobDescription');
    expect(inputIds).toContain('resume');
  });

  it('has 5 steps', () => {
    expect(workflow.steps).toHaveLength(5);
  });

  it('all steps reference valid skills', () => {
    for (const step of workflow.steps) {
      expect(() => validateStepSkillExists(step)).not.toThrow();
    }
  });

  it('has valid input mappings', () => {
    expect(() => validateInputMappings(workflow)).not.toThrow();
  });

  it('step order is correct', () => {
    const stepIds = workflow.steps.map(s => s.id);
    expect(stepIds).toEqual([
      'step-readiness',
      'step-customize',
      'step-ats',
      'step-cover-letter',
      'step-research',
    ]);
  });

  it('ATS step uses customized resume from previous step', () => {
    const atsStep = workflow.steps.find(s => s.id === 'step-ats');
    expect(atsStep).toBeDefined();
    expect(atsStep?.inputMappings.userBackground).toEqual({
      type: 'previous',
      stepId: 'step-customize',
      outputKey: 'customizedResume',
    });
  });

  it('uses correct ATS skill ID', () => {
    const atsStep = workflow.steps.find(s => s.id === 'step-ats');
    expect(atsStep?.skillId).toBe('ats-optimization-checker');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTERVIEW PREP WORKFLOW TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Interview Prep Workflow', () => {
  const workflow = INTERVIEW_PREP_WORKFLOW;

  it('has valid structure', () => {
    validateWorkflowStructure(workflow);
  });

  it('has correct id', () => {
    expect(workflow.id).toBe('interview-prep');
  });

  it('has interview type input with options', () => {
    const interviewTypeInput = workflow.globalInputs.find(i => i.id === 'interviewType');
    expect(interviewTypeInput).toBeDefined();
    expect(interviewTypeInput?.type).toBe('select');
    expect(interviewTypeInput?.options).toContain('Phone Screen');
    expect(interviewTypeInput?.options).toContain('Technical Interview');
  });

  it('has 4 steps', () => {
    expect(workflow.steps).toHaveLength(4);
  });

  it('all steps reference valid skills', () => {
    for (const step of workflow.steps) {
      expect(() => validateStepSkillExists(step)).not.toThrow();
    }
  });

  it('has valid input mappings', () => {
    expect(() => validateInputMappings(workflow)).not.toThrow();
  });

  it('includes computed input mappings', () => {
    const interviewStep = workflow.steps.find(s => s.id === 'step-interview');
    expect(interviewStep?.inputMappings.additionalContext?.type).toBe('computed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// POST-INTERVIEW WORKFLOW TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Post-Interview Workflow', () => {
  const workflow = POST_INTERVIEW_WORKFLOW;

  it('has valid structure', () => {
    validateWorkflowStructure(workflow);
  });

  it('has correct id', () => {
    expect(workflow.id).toBe('post-interview');
  });

  it('has interviewer names input', () => {
    const interviewerInput = workflow.globalInputs.find(i => i.id === 'interviewerNames');
    expect(interviewerInput).toBeDefined();
    expect(interviewerInput?.required).toBe(true);
  });

  it('has 3 steps', () => {
    expect(workflow.steps).toHaveLength(3);
  });

  it('all steps reference valid skills', () => {
    for (const step of workflow.steps) {
      expect(() => validateStepSkillExists(step)).not.toThrow();
    }
  });

  it('has valid input mappings', () => {
    expect(() => validateInputMappings(workflow)).not.toThrow();
  });

  it('thank you step is first', () => {
    expect(workflow.steps[0].id).toBe('step-thankyou');
    expect(workflow.steps[0].skillId).toBe('thank-you-note-generator');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-WORKFLOW VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

describe('Cross-Workflow Validation', () => {
  it('all workflows have unique IDs', () => {
    const ids = WORKFLOW_LIST.map(w => w.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all workflows have output descriptions', () => {
    for (const workflow of WORKFLOW_LIST) {
      expect(workflow.outputs).toBeDefined();
      expect(workflow.outputs.length).toBeGreaterThan(0);
    }
  });

  it('all workflows have estimated time', () => {
    for (const workflow of WORKFLOW_LIST) {
      expect(workflow.estimatedTime).toBeDefined();
      expect(workflow.estimatedTime).toMatch(/\d+-\d+ minutes/);
    }
  });

  it('all workflows have icon and color', () => {
    for (const workflow of WORKFLOW_LIST) {
      expect(workflow.icon).toBeDefined();
      expect(workflow.color).toBeDefined();
    }
  });

  it('all step outputKeys are unique within each workflow', () => {
    for (const workflow of WORKFLOW_LIST) {
      const outputKeys = workflow.steps.map(s => s.outputKey);
      const uniqueKeys = new Set(outputKeys);
      expect(uniqueKeys.size).toBe(outputKeys.length);
    }
  });
});
