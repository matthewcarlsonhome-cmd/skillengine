/**
 * Sales & Revenue Skills Module
 */
export { SALES_SKILLS } from './skills';

export const SALES_SKILL_IDS = [
  'sales-call-prep-pro',
  'proposal-builder',
  'customer-health-scorecard',
  'competitive-battle-card',
] as const;

export type SalesSkillId = typeof SALES_SKILL_IDS[number];
