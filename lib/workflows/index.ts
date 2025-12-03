/**
 * workflows/index.ts - Pre-built Workflow Definitions
 *
 * This file contains the three pre-built workflow templates that chain
 * multiple AI skills together for common job search scenarios.
 *
 * WORKFLOW STRUCTURE:
 * ==================
 * Each workflow defines:
 * - globalInputs: Collected once at the start
 * - steps: Ordered sequence of skills to run
 * - inputMappings: How each step gets its inputs (from global or previous steps)
 *
 * DATA FLOW:
 * ==========
 * Global Inputs → Step 1 → Step 2 → Step 3 → Final Output Package
 *                    ↓         ↓
 *              (output flows to next steps as input)
 */

import type { Workflow } from '../storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 1: JOB APPLICATION PACKAGE
// Creates a complete application package: optimized resume + cover letter
// ═══════════════════════════════════════════════════════════════════════════

export const JOB_APPLICATION_WORKFLOW: Workflow = {
  id: 'job-application',
  name: 'Job Application Package',
  description: 'Create a complete, optimized application package in one workflow',
  longDescription: 'This workflow analyzes your fit for a role, customizes your resume, optimizes it for ATS systems, generates a tailored cover letter, and researches the company - all in one automated sequence.',
  icon: 'Briefcase',
  color: 'blue',
  estimatedTime: '8-12 minutes',

  outputs: [
    'Job readiness score with gap analysis',
    'Customized resume tailored to the role',
    'ATS-optimized resume with keyword improvements',
    'Personalized cover letter',
    'Company research insights'
  ],

  globalInputs: [
    {
      id: 'jobTitle',
      label: 'Job Title',
      type: 'text',
      placeholder: 'e.g., Senior Product Manager',
      required: true,
    },
    {
      id: 'companyName',
      label: 'Company Name',
      type: 'text',
      placeholder: 'e.g., Google',
      required: true,
    },
    {
      id: 'jobDescription',
      label: 'Job Description',
      type: 'textarea',
      placeholder: 'Paste the full job description here...',
      helpText: 'Include all requirements, responsibilities, and qualifications from the job posting.',
      required: true,
      rows: 10,
      prefillFrom: 'jobDescription',
    },
    {
      id: 'resume',
      label: 'Your Resume',
      type: 'textarea',
      placeholder: 'Paste your current resume here...',
      helpText: 'Your resume will be customized and optimized for this specific role.',
      required: true,
      rows: 12,
      prefillFrom: 'resume',
    },
    {
      id: 'additionalContext',
      label: 'Additional Context (Optional)',
      type: 'textarea',
      placeholder: 'Any specific achievements, projects, or context you want to highlight...',
      required: false,
      rows: 4,
    },
  ],

  steps: [
    {
      id: 'step-readiness',
      skillId: 'job-readiness-score',
      name: 'Assess Job Fit',
      description: 'Analyze your qualifications against the job requirements and identify gaps',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'global', inputId: 'resume' },
      },
      outputKey: 'readinessAnalysis',
    },
    {
      id: 'step-customize',
      skillId: 'resume-customizer',
      name: 'Customize Resume',
      description: 'Tailor your resume to highlight relevant experience for this role',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'global', inputId: 'resume' },
        additionalContext: { type: 'global', inputId: 'additionalContext' },
      },
      outputKey: 'customizedResume',
    },
    {
      id: 'step-ats',
      skillId: 'ats-keyword-optimizer',
      name: 'Optimize for ATS',
      description: 'Add missing keywords and optimize formatting for applicant tracking systems',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'previous', stepId: 'step-customize', outputKey: 'customizedResume' },
      },
      outputKey: 'atsOptimizedResume',
    },
    {
      id: 'step-cover-letter',
      skillId: 'cover-letter-generator',
      name: 'Generate Cover Letter',
      description: 'Create a compelling, personalized cover letter',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'previous', stepId: 'step-ats', outputKey: 'atsOptimizedResume' },
        additionalContext: { type: 'global', inputId: 'additionalContext' },
      },
      outputKey: 'coverLetter',
    },
    {
      id: 'step-research',
      skillId: 'company-research',
      name: 'Research Company',
      description: 'Gather insights about the company culture, recent news, and interview tips',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'global', inputId: 'resume' },
      },
      outputKey: 'companyResearch',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 2: INTERVIEW PREPARATION
// Comprehensive prep package for upcoming interviews
// ═══════════════════════════════════════════════════════════════════════════

export const INTERVIEW_PREP_WORKFLOW: Workflow = {
  id: 'interview-prep',
  name: 'Interview Preparation',
  description: 'Comprehensive preparation package for your upcoming interview',
  longDescription: 'Get fully prepared for your interview with company research, likely questions with STAR-format answers, salary insights, and smart questions to ask the interviewer.',
  icon: 'MessageSquare',
  color: 'purple',
  estimatedTime: '10-15 minutes',

  outputs: [
    'Company research and culture insights',
    'Likely interview questions with suggested answers',
    'STAR-format stories for behavioral questions',
    'Salary range and negotiation points',
    'Smart questions to ask the interviewer'
  ],

  globalInputs: [
    {
      id: 'jobTitle',
      label: 'Job Title',
      type: 'text',
      placeholder: 'e.g., Senior Software Engineer',
      required: true,
    },
    {
      id: 'companyName',
      label: 'Company Name',
      type: 'text',
      placeholder: 'e.g., Microsoft',
      required: true,
    },
    {
      id: 'jobDescription',
      label: 'Job Description',
      type: 'textarea',
      placeholder: 'Paste the job description here...',
      helpText: 'This helps generate role-specific interview questions.',
      required: true,
      rows: 8,
      prefillFrom: 'jobDescription',
    },
    {
      id: 'resume',
      label: 'Your Resume / Background',
      type: 'textarea',
      placeholder: 'Paste your resume here...',
      helpText: 'Used to prepare personalized STAR stories from your experience.',
      required: true,
      rows: 10,
      prefillFrom: 'resume',
    },
    {
      id: 'interviewType',
      label: 'Interview Type',
      type: 'select',
      options: ['Phone Screen', 'Video Interview', 'On-site', 'Panel Interview', 'Technical Interview', 'Behavioral Interview'],
      required: true,
    },
    {
      id: 'specificConcerns',
      label: 'Specific Concerns (Optional)',
      type: 'textarea',
      placeholder: 'Any areas you want to focus on or concerns about the interview...',
      required: false,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-company',
      skillId: 'company-research',
      name: 'Research Company',
      description: 'Deep dive into company culture, values, recent news, and what to expect',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'global', inputId: 'resume' },
      },
      outputKey: 'companyResearch',
    },
    {
      id: 'step-interview',
      skillId: 'interview-prep',
      name: 'Generate Interview Questions',
      description: 'Predict likely questions and prepare compelling answers',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'global', inputId: 'resume' },
        additionalContext: { type: 'computed', template: 'Interview Type: {{interviewType}}. Concerns: {{specificConcerns}}' },
      },
      outputKey: 'interviewQuestions',
    },
    {
      id: 'step-salary',
      skillId: 'salary-negotiation',
      name: 'Research Salary Range',
      description: 'Get salary insights and negotiation talking points',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'global', inputId: 'resume' },
      },
      outputKey: 'salaryResearch',
    },
    {
      id: 'step-questions',
      skillId: 'networking-scripts',
      name: 'Questions to Ask',
      description: 'Generate thoughtful questions that show your interest and insight',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'global', inputId: 'jobDescription' },
        userBackground: { type: 'global', inputId: 'resume' },
        additionalContext: { type: 'computed', template: 'Generate 8-10 thoughtful questions to ask the interviewer based on the company research: {{companyResearch}}' },
      },
      outputKey: 'questionsToAsk',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 3: POST-INTERVIEW FOLLOW-UP
// Everything needed after an interview: thank you notes, self-assessment
// ═══════════════════════════════════════════════════════════════════════════

export const POST_INTERVIEW_WORKFLOW: Workflow = {
  id: 'post-interview',
  name: 'Post-Interview Follow-Up',
  description: 'Complete your interview follow-up with thank you notes and next steps',
  longDescription: 'Send professional thank you notes, assess your interview performance, and plan your follow-up strategy to maximize your chances of landing the offer.',
  icon: 'Mail',
  color: 'green',
  estimatedTime: '5-8 minutes',

  outputs: [
    'Personalized thank you email(s)',
    'Self-assessment of interview performance',
    'Follow-up timeline and strategy',
    'Areas to address in next round (if applicable)'
  ],

  globalInputs: [
    {
      id: 'jobTitle',
      label: 'Job Title',
      type: 'text',
      placeholder: 'e.g., Product Manager',
      required: true,
    },
    {
      id: 'companyName',
      label: 'Company Name',
      type: 'text',
      placeholder: 'e.g., Amazon',
      required: true,
    },
    {
      id: 'interviewerNames',
      label: 'Interviewer Name(s)',
      type: 'textarea',
      placeholder: 'e.g., Sarah Johnson (Hiring Manager), Mike Chen (Team Lead)',
      helpText: 'List each interviewer with their role if known. Separate multiple interviewers with commas or new lines.',
      required: true,
      rows: 3,
    },
    {
      id: 'interviewNotes',
      label: 'Interview Notes',
      type: 'textarea',
      placeholder: 'What topics were discussed? What questions were asked? Any specific moments or conversations to reference?',
      helpText: 'Include key discussion points, questions asked, and your responses. The more detail, the better your thank you note.',
      required: true,
      rows: 8,
    },
    {
      id: 'interviewDate',
      label: 'Interview Date',
      type: 'text',
      placeholder: 'e.g., Today, Yesterday, December 3rd',
      required: true,
    },
    {
      id: 'whatWentWell',
      label: 'What Went Well',
      type: 'textarea',
      placeholder: 'Moments where you felt confident, good connections made, strong answers...',
      required: false,
      rows: 3,
    },
    {
      id: 'concerns',
      label: 'Concerns or Areas to Address',
      type: 'textarea',
      placeholder: 'Questions you struggled with, topics you wish you had elaborated on...',
      required: false,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-thankyou',
      skillId: 'thank-you-note-generator',
      name: 'Generate Thank You Notes',
      description: 'Create personalized thank you emails for each interviewer',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'computed', template: 'Interviewers: {{interviewerNames}}. Interview Date: {{interviewDate}}' },
        userBackground: { type: 'global', inputId: 'interviewNotes' },
        additionalContext: { type: 'computed', template: 'Topics discussed: {{interviewNotes}}. What went well: {{whatWentWell}}' },
      },
      outputKey: 'thankYouNotes',
    },
    {
      id: 'step-assessment',
      skillId: 'skills-gap-analyzer',
      name: 'Self-Assessment',
      description: 'Analyze your interview performance and identify improvement areas',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'computed', template: 'Interview self-assessment for {{jobTitle}} at {{companyName}}' },
        userBackground: { type: 'computed', template: 'Interview Notes: {{interviewNotes}}\n\nWhat Went Well: {{whatWentWell}}\n\nConcerns: {{concerns}}' },
      },
      outputKey: 'selfAssessment',
    },
    {
      id: 'step-followup',
      skillId: 'onboarding-accelerator',
      name: 'Follow-Up Strategy',
      description: 'Create a follow-up timeline and next steps plan',
      inputMappings: {
        jobTitle: { type: 'global', inputId: 'jobTitle' },
        companyName: { type: 'global', inputId: 'companyName' },
        jobDescription: { type: 'computed', template: 'Create a post-interview follow-up strategy for {{jobTitle}} at {{companyName}}. Interview date: {{interviewDate}}. Include: 1) Timeline for follow-up emails, 2) What to do if no response, 3) How to prepare for next round, 4) How to address any concerns from the interview.' },
        userBackground: { type: 'computed', template: 'Interview Summary:\n{{interviewNotes}}\n\nInterviewers: {{interviewerNames}}\n\nConcerns to address: {{concerns}}' },
      },
      outputKey: 'followUpStrategy',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW REGISTRY
// Export all workflows for use throughout the app
// ═══════════════════════════════════════════════════════════════════════════

export const WORKFLOWS: Record<string, Workflow> = {
  'job-application': JOB_APPLICATION_WORKFLOW,
  'interview-prep': INTERVIEW_PREP_WORKFLOW,
  'post-interview': POST_INTERVIEW_WORKFLOW,
};

export const WORKFLOW_LIST: Workflow[] = Object.values(WORKFLOWS);
