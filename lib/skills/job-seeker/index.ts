/**
 * Job Seeker Skills Module
 *
 * Exports all 16 job-seeker related AI skills.
 */

export { JOB_SEEKER_SKILLS } from './skills';

// Re-export skill IDs for reference
export const JOB_SEEKER_SKILL_IDS = [
  'job-readiness-score',
  'skills-gap-analyzer',
  'linkedin-optimizer-pro',
  'ats-optimization-checker',
  'resume-customizer',
  'cover-letter-generator',
  'networking-script-generator',
  'company-research',
  'interview-prep',
  'thank-you-note-generator',
  'offer-evaluation-pro',
  'salary-negotiation-master',
  'onboarding-accelerator-pro',
  'day-in-the-life-generator',
  'role-ai-automation-analyzer',
  'healthcare-resume-parser',
] as const;

export type JobSeekerSkillId = typeof JOB_SEEKER_SKILL_IDS[number];
