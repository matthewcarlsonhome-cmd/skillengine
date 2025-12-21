/**
 * Professional Skills Index
 *
 * Exports all professional-grade skills for:
 * - Marketing (8 skills)
 * - Digital Marketing (8 skills)
 * - Project Management (7 skills)
 * - Business Analysis (7 skills)
 *
 * Total: 30 production-ready skills
 */

export { MARKETING_SKILLS } from './marketing';
export { DIGITAL_MARKETING_SKILLS } from './digitalMarketing';
export { PROJECT_MANAGER_SKILLS } from './projectManager';
export { BUSINESS_ANALYST_SKILLS } from './businessAnalyst';

// Combined export for easy access
import { MARKETING_SKILLS } from './marketing';
import { DIGITAL_MARKETING_SKILLS } from './digitalMarketing';
import { PROJECT_MANAGER_SKILLS } from './projectManager';
import { BUSINESS_ANALYST_SKILLS } from './businessAnalyst';

export const ALL_PROFESSIONAL_SKILLS = [
  ...MARKETING_SKILLS,
  ...DIGITAL_MARKETING_SKILLS,
  ...PROJECT_MANAGER_SKILLS,
  ...BUSINESS_ANALYST_SKILLS,
];

// Skill counts for documentation
export const PROFESSIONAL_SKILL_COUNTS = {
  marketing: MARKETING_SKILLS.length,
  digitalMarketing: DIGITAL_MARKETING_SKILLS.length,
  projectManagement: PROJECT_MANAGER_SKILLS.length,
  businessAnalysis: BUSINESS_ANALYST_SKILLS.length,
  total: ALL_PROFESSIONAL_SKILLS.length,
};
