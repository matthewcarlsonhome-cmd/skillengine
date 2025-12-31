/**
 * Legal & Operations Skills Module
 */
export { OPERATIONS_SKILLS } from './skills';

export const OPERATIONS_SKILL_IDS = [
  'sop-documentation-builder',
  'vendor-comparison-matrix',
  'meeting-minutes-pro',
  'policy-gap-analyzer',
] as const;

export type OperationsSkillId = typeof OPERATIONS_SKILL_IDS[number];
