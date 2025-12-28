/**
 * Shared Input Definitions
 *
 * Common form fields reused across multiple skills.
 * Centralizing these reduces duplication and ensures consistency.
 */

import { FormInput } from '../../../types';

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD JOB SEEKER INPUTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standard job seeker inputs used by most skills
 * These fields are pre-filled from the home page uploads when available
 */
export const sharedJobSeekerInputs: FormInput[] = [
  { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Product Manager', required: true },
  { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g., Google', required: true },
  { id: 'jobDescription', label: 'Job Description', type: 'textarea', placeholder: 'Content is pre-filled from home page upload.', required: true, rows: 8 },
  { id: 'userBackground', label: 'Your Resume / Background', type: 'textarea', placeholder: 'Content is pre-filled from home page upload.', required: true, rows: 8 },
];

/**
 * Optional additional context field for extra information
 * (performance reviews, project details, specific achievements)
 */
export const additionalContextInput: FormInput = {
  id: 'additionalContext',
  label: 'Additional Context (Optional)',
  type: 'textarea',
  placeholder: 'Content is pre-filled from home page upload. Paste performance reviews, project details, or specific achievements here.',
  rows: 5
};

// ─────────────────────────────────────────────────────────────────────────────
// ENTERPRISE/PROFESSIONAL INPUTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common enterprise context inputs
 */
export const enterpriseContextInput: FormInput = {
  id: 'businessContext',
  label: 'Business Context',
  type: 'textarea',
  placeholder: 'Describe the business situation, goals, or challenges...',
  rows: 6,
  required: true,
};

/**
 * Data/metrics input for analytics skills
 */
export const dataInput: FormInput = {
  id: 'data',
  label: 'Data / Metrics',
  type: 'textarea',
  placeholder: 'Paste your data, metrics, or spreadsheet content here...',
  rows: 10,
  required: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a formatted user prompt from form inputs
 *
 * Takes the user's form data and formats it into a structured prompt
 * with labeled sections in markdown format.
 *
 * @param title - The name of the skill/analysis being performed
 * @param inputs - Record of form field values keyed by field ID
 * @param inputMapping - Maps field IDs to display labels
 * @returns Formatted prompt string with all non-empty inputs
 *
 * @example
 * createUserPrompt("Resume Analysis", { jobTitle: "PM", company: "Google" }, { jobTitle: "Job", company: "Company" })
 * // Returns:
 * // "Based on the user's request, please now perform the Resume Analysis analysis.
 * //
 * // **Job:**
 * // \`\`\`
 * // PM
 * // \`\`\`
 * //
 * // **Company:**
 * // \`\`\`
 * // Google
 * // \`\`\`"
 */
export const createUserPrompt = (
  title: string,
  inputs: Record<string, string>,
  inputMapping: Record<string, string>
): string => {
  let prompt = `Based on the user's request, please now perform the ${title} analysis.\n\n`;
  for (const [key, label] of Object.entries(inputMapping)) {
    if (inputs[key]) {
      prompt += `**${label}:**\n\`\`\`\n${inputs[key]}\n\`\`\`\n\n`;
    }
  }
  return prompt;
};

/**
 * Standard input mapping for job seeker skills
 */
export const standardJobSeekerMapping: Record<string, string> = {
  jobTitle: 'Target Job Title',
  companyName: 'Target Company',
  jobDescription: 'Job Description',
  userBackground: 'Resume / Background',
  additionalContext: 'Additional Context',
};
