/**
 * static.ts - Static AI Skill Definitions
 *
 * This file combines all skill categories into a single SKILLS export.
 * Skills are organized into modular category files for maintainability.
 *
 * SKILL CATEGORIES:
 * =================
 * 1. JOB SEEKER (16 skills) - ./job-seeker/
 *    Career assessment, resume optimization, interview prep
 *
 * 2. GOVERNANCE (8 skills) - ./governance/
 *    AI governance, compliance, policy management
 *
 * 3. EXCEL (5 skills) - ./excel/
 *    Spreadsheet analysis, data cleaning, visualization
 *
 * 4. ENTERPRISE (4 skills) - ./enterprise/
 *    Executive communication, contract review, automation
 *
 * 5. EXTENDED (20 skills) - ./extended/
 *    Advanced professional skills (Wave 1-5)
 *
 * TOTAL: 53 skills
 *
 * ADDING NEW SKILLS:
 * ==================
 * 1. Add the skill to the appropriate category module
 * 2. Update the category's index.ts with the new skill ID
 * 3. The skill automatically appears in SKILLS export
 */

import { Skill } from '../../types';

// Import all skill category modules
import { JOB_SEEKER_SKILLS } from './job-seeker';
import { GOVERNANCE_SKILLS } from './governance';
import { EXCEL_SKILLS } from './excel';
import { ENTERPRISE_SKILLS } from './enterprise';
import { EXTENDED_SKILLS } from './extended';

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS EXPORT
// Combines all skill category modules into a single export
// ─────────────────────────────────────────────────────────────────────────────

export const SKILLS: Record<string, Skill> = {
  // Job Seeker Skills (16)
  ...JOB_SEEKER_SKILLS,

  // AI Governance & Compliance Skills (8)
  ...GOVERNANCE_SKILLS,

  // Excel & Analytics Skills (5)
  ...EXCEL_SKILLS,

  // Enterprise Skills (4)
  ...ENTERPRISE_SKILLS,

  // Extended/Wave Skills (20)
  ...EXTENDED_SKILLS,
};

// Re-export category modules for direct access if needed
export {
  JOB_SEEKER_SKILLS,
  GOVERNANCE_SKILLS,
  EXCEL_SKILLS,
  ENTERPRISE_SKILLS,
  EXTENDED_SKILLS,
};
