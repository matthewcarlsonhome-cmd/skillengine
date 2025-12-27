/**
 * Extended Skills Module (Wave 1-5)
 */
export { EXTENDED_SKILLS } from './skills';

export const EXTENDED_SKILL_IDS = [
  'executive-decision-memo',
  'one-on-one-meeting-prep',
  'team-retrospective-facilitator',
  'ab-test-analysis-reporter',
  'board-presentation-builder',
  'prompt-engineering-optimizer',
  'kpi-framework-designer',
  'ml-model-card-generator',
  'sql-query-optimizer',
  'api-documentation-generator',
  'adr-writer',
  'data-quality-assessment',
  'rag-system-design',
  'ai-ethics-review',
  'process-automation-spec',
  'crisis-communication-playbook',
  'all-hands-meeting-script',
  'rfp-response-generator',
  'role-transition-playbook',
  'skills-development-path',
] as const;

export type ExtendedSkillId = typeof EXTENDED_SKILL_IDS[number];
