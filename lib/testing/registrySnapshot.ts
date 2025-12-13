/**
 * registrySnapshot.ts - Unified Registry of All Skills and Workflows
 *
 * Auto-generated catalog of all skills and workflows with their input schemas,
 * used by the Developer Test Playground for test case generation and validation.
 */

import { SKILLS } from '../skills/static';
import { WORKFLOWS, WORKFLOW_LIST } from '../workflows';
import { ROLE_TEMPLATES } from '../roleTemplates';
import { ENTERPRISE_SKILLS } from '../skills/enterprise';
import { EXCEL_SKILLS } from '../skills/excel';
import { AI_GOVERNANCE_SKILLS } from '../skills/governance';
import { OPERATIONS_SKILLS } from '../skills/operations';
import type { Workflow, SkillDefinition } from '../storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface InputFieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
  rows?: number;
  minLength?: number;
}

export interface SkillSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  source: 'static' | 'role-template';
  roleId?: string;
  inputs: InputFieldSchema[];
  outputFormat?: string;
}

export interface WorkflowSchema {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  stepCount: number;
  globalInputs: InputFieldSchema[];
  steps: {
    id: string;
    name: string;
    skillId: string;
  }[];
}

export interface RegistrySnapshot {
  generatedAt: string;
  summary: {
    totalStaticSkills: number;
    totalRoleBasedSkills: number;
    totalWorkflows: number;
    totalRoleTemplates: number;
  };
  skills: SkillSchema[];
  workflows: WorkflowSchema[];
  roleTemplates: {
    id: string;
    name: string;
    skillCount: number;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract input schema from a skill definition
 */
function extractSkillInputs(skill: SkillDefinition): InputFieldSchema[] {
  return skill.inputs.map((input) => ({
    id: input.id,
    label: input.label,
    type: input.type as InputFieldSchema['type'],
    required: input.required ?? false,
    placeholder: input.placeholder,
    options: input.options,
    rows: input.rows,
    minLength: input.minLength,
  }));
}

/**
 * Extract schema for a static skill (legacy Skill type from static.ts)
 */
function extractStaticSkillSchema(skill: SkillDefinition): SkillSchema {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category || 'general',
    source: 'static',
    inputs: extractSkillInputs(skill),
  };
}

/**
 * Extract schema for enterprise/excel skills (SkillDefinition type)
 */
function extractEnterpriseSkillSchema(skill: SkillDefinition, category: string): SkillSchema {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category || category,
    source: 'static',
    inputs: skill.inputs.map((input) => ({
      id: input.id,
      label: input.label,
      type: input.type as InputFieldSchema['type'],
      required: input.required ?? false,
      placeholder: input.placeholder,
      options: input.options,
      rows: input.rows,
      minLength: input.minLength,
    })),
  };
}

/**
 * Generate skill ID from role and skill name
 */
function generateRoleSkillId(roleId: string, skillName: string): string {
  return `${roleId}-${skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
}

/**
 * Extract schemas for role-based skills
 */
function extractRoleBasedSkillSchemas(): SkillSchema[] {
  const schemas: SkillSchema[] = [];

  for (const role of ROLE_TEMPLATES) {
    for (const skill of role.skills) {
      const skillId = generateRoleSkillId(role.id, skill.name);

      schemas.push({
        id: skillId,
        name: skill.name,
        description: skill.description,
        category: skill.category || 'role-specific',
        source: 'role-template',
        roleId: role.id,
        inputs: skill.inputs?.map((input) => ({
          id: input.id,
          label: input.label,
          type: (input.type || 'textarea') as InputFieldSchema['type'],
          required: input.required ?? false,
          placeholder: input.placeholder,
          options: input.options,
          rows: input.rows,
          minLength: input.minLength,
        })) || [],
      });
    }
  }

  return schemas;
}

/**
 * Extract workflow schema
 */
function extractWorkflowSchema(workflow: Workflow): WorkflowSchema {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    estimatedTime: workflow.estimatedTime,
    stepCount: workflow.steps.length,
    globalInputs: workflow.globalInputs.map((input) => ({
      id: input.id,
      label: input.label,
      type: input.type as InputFieldSchema['type'],
      required: input.required ?? false,
      placeholder: input.placeholder,
      options: input.options,
      rows: input.rows,
    })),
    steps: workflow.steps.map((step) => ({
      id: step.id,
      name: step.name,
      skillId: step.skillId,
    })),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate the complete registry snapshot
 */
export function generateRegistrySnapshot(): RegistrySnapshot {
  const staticSkills = Object.values(SKILLS).map(extractStaticSkillSchema);
  const enterpriseSkills = Object.values(ENTERPRISE_SKILLS).map((s) => extractEnterpriseSkillSchema(s, 'enterprise'));
  const excelSkills = Object.values(EXCEL_SKILLS).map((s) => extractEnterpriseSkillSchema(s, 'excel'));
  const governanceSkills = Object.values(AI_GOVERNANCE_SKILLS).map((s) => extractEnterpriseSkillSchema(s, 'governance'));
  const operationsSkills = Object.values(OPERATIONS_SKILLS).map((s) => extractEnterpriseSkillSchema(s, 'operations'));
  const roleBasedSkills = extractRoleBasedSkillSchemas();
  const workflows = WORKFLOW_LIST.map(extractWorkflowSchema);

  const allStaticSkills = [...staticSkills, ...enterpriseSkills, ...excelSkills, ...governanceSkills, ...operationsSkills];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalStaticSkills: allStaticSkills.length,
      totalRoleBasedSkills: roleBasedSkills.length,
      totalWorkflows: workflows.length,
      totalRoleTemplates: ROLE_TEMPLATES.length,
    },
    skills: [...allStaticSkills, ...roleBasedSkills],
    workflows,
    roleTemplates: ROLE_TEMPLATES.map((role) => ({
      id: role.id,
      name: role.name,
      skillCount: role.skills.length,
    })),
  };
}

/**
 * Get all skill schemas (static + enterprise + excel + governance + operations + role-based)
 */
export function getAllSkillSchemas(): SkillSchema[] {
  const staticSkills = Object.values(SKILLS).map(extractStaticSkillSchema);
  const enterpriseSkills = Object.values(ENTERPRISE_SKILLS).map((s) => extractEnterpriseSkillSchema(s, 'enterprise'));
  const excelSkills = Object.values(EXCEL_SKILLS).map((s) => extractEnterpriseSkillSchema(s, 'excel'));
  const governanceSkills = Object.values(AI_GOVERNANCE_SKILLS).map((s) => extractEnterpriseSkillSchema(s, 'governance'));
  const operationsSkills = Object.values(OPERATIONS_SKILLS).map((s) => extractEnterpriseSkillSchema(s, 'operations'));
  const roleBasedSkills = extractRoleBasedSkillSchemas();
  return [...staticSkills, ...enterpriseSkills, ...excelSkills, ...governanceSkills, ...operationsSkills, ...roleBasedSkills];
}

/**
 * Get skill schema by ID
 */
export function getSkillSchema(skillId: string): SkillSchema | undefined {
  return getAllSkillSchemas().find((s) => s.id === skillId);
}

/**
 * Get all workflow schemas
 */
export function getAllWorkflowSchemas(): WorkflowSchema[] {
  return WORKFLOW_LIST.map(extractWorkflowSchema);
}

/**
 * Get workflow schema by ID
 */
export function getWorkflowSchema(workflowId: string): WorkflowSchema | undefined {
  const workflow = WORKFLOWS[workflowId];
  return workflow ? extractWorkflowSchema(workflow) : undefined;
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: string): SkillSchema[] {
  return getAllSkillSchemas().filter((s) => s.category === category);
}

/**
 * Get skills by role
 */
export function getSkillsByRole(roleId: string): SkillSchema[] {
  return getAllSkillSchemas().filter((s) => s.roleId === roleId);
}

/**
 * Get static skills only
 */
export function getStaticSkills(): SkillSchema[] {
  return Object.values(SKILLS).map(extractStaticSkillSchema);
}

/**
 * Get unique categories
 */
export function getUniqueCategories(): string[] {
  const categories = new Set(getAllSkillSchemas().map((s) => s.category));
  return Array.from(categories).sort();
}

// Pre-generated snapshot for quick access
let cachedSnapshot: RegistrySnapshot | null = null;

/**
 * Get cached registry snapshot (generates on first call)
 */
export function getRegistrySnapshot(): RegistrySnapshot {
  if (!cachedSnapshot) {
    cachedSnapshot = generateRegistrySnapshot();
  }
  return cachedSnapshot;
}

/**
 * Clear the cached snapshot (useful after updates)
 */
export function clearSnapshotCache(): void {
  cachedSnapshot = null;
}
