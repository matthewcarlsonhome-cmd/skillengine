/**
 * Technical & Engineering Skills Module
 */
export { TECHNICAL_SKILLS } from './skills';

export const TECHNICAL_SKILL_IDS = [
  'technical-spec-writer',
  'incident-postmortem-pro',
  'code-review-feedback-generator',
  'security-assessment-questionnaire',
] as const;

export type TechnicalSkillId = typeof TECHNICAL_SKILL_IDS[number];
