/**
 * HR & People Operations Skills Module
 */
export { HR_SKILLS } from './skills';

export const HR_SKILL_IDS = [
  'job-description-optimizer',
  'performance-review-writer',
  'employee-onboarding-planner',
  'exit-interview-analyzer',
] as const;

export type HrSkillId = typeof HR_SKILL_IDS[number];
