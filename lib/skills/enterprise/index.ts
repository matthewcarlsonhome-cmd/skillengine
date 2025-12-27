/**
 * Enterprise Skills Module
 */
export { ENTERPRISE_SKILLS } from './skills';

export const ENTERPRISE_SKILL_IDS = [
  'executive-communication-pack',
  'steering-committee-pack',
  'contract-review-accelerator',
  'automation-opportunity-assessment',
] as const;

export type EnterpriseSkillId = typeof ENTERPRISE_SKILL_IDS[number];
