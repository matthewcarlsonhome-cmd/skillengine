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
      skillId: 'ats-optimization-checker',
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
      skillId: 'salary-negotiation-master',
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
      skillId: 'networking-script-generator',
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
      skillId: 'onboarding-accelerator-pro',
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
// WORKFLOW 4: TRAINING WORKSHOP SETUP
// Complete workshop preparation from needs assessment to marketing
// ═══════════════════════════════════════════════════════════════════════════

export const TRAINING_WORKSHOP_WORKFLOW: Workflow = {
  id: 'training-workshop',
  name: 'Training Workshop Setup',
  description: 'Create a complete workshop package from curriculum to marketing',
  longDescription: 'This workflow guides you through creating a professional training workshop. It starts with needs assessment, designs the curriculum, builds the presentation, creates interactive exercises, polishes all content, and generates marketing materials.',
  icon: 'GraduationCap',
  color: 'amber',
  estimatedTime: '15-20 minutes',

  outputs: [
    'Training needs assessment report',
    'Complete workshop curriculum',
    'Presentation framework and slides outline',
    'Interactive exercises and activities',
    'Polished, professional content',
    'Marketing and promotional materials'
  ],

  globalInputs: [
    {
      id: 'workshopTopic',
      label: 'Workshop Topic',
      type: 'text',
      placeholder: 'e.g., AI Tools for Productivity, Excel Advanced Functions, Leadership Communication',
      required: true,
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      type: 'textarea',
      placeholder: 'Who are you training? (e.g., "Marketing professionals with 3-5 years experience, familiar with basic digital tools, looking to improve efficiency")',
      required: true,
      rows: 3,
    },
    {
      id: 'duration',
      label: 'Workshop Duration',
      type: 'select',
      options: ['1 hour webinar', '2 hour workshop', 'Half-day (4 hours)', 'Full-day (8 hours)', '2-day intensive'],
      required: true,
    },
    {
      id: 'deliveryFormat',
      label: 'Delivery Format',
      type: 'select',
      options: ['In-person', 'Virtual/Online', 'Hybrid'],
      required: true,
    },
    {
      id: 'learningObjectives',
      label: 'Key Learning Objectives',
      type: 'textarea',
      placeholder: 'What should participants be able to do after the workshop? List 3-5 specific outcomes...',
      required: true,
      rows: 4,
    },
    {
      id: 'organizationContext',
      label: 'Organization/Client Context (Optional)',
      type: 'textarea',
      placeholder: 'Any specific organizational needs, industry context, or constraints to consider...',
      required: false,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-needs',
      skillId: 'trainer-training-needs-assessment-generator',
      name: 'Assess Training Needs',
      description: 'Analyze the audience and learning objectives to create a comprehensive needs assessment',
      inputMappings: {
        trainingTopic: { type: 'global', inputId: 'workshopTopic' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        organizationalContext: { type: 'computed', template: 'Duration: {{duration}}. Format: {{deliveryFormat}}. Learning Objectives: {{learningObjectives}}. Context: {{organizationContext}}' },
        currentSkillLevel: { type: 'static', value: 'Mixed levels - assess during workshop' },
        desiredOutcomes: { type: 'global', inputId: 'learningObjectives' },
      },
      outputKey: 'needsAssessment',
    },
    {
      id: 'step-curriculum',
      skillId: 'trainer-workshop-curriculum-designer',
      name: 'Design Curriculum',
      description: 'Create a detailed curriculum with modules, timing, and learning activities',
      inputMappings: {
        workshopTopic: { type: 'global', inputId: 'workshopTopic' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        duration: { type: 'global', inputId: 'duration' },
        learningObjectives: { type: 'global', inputId: 'learningObjectives' },
        deliveryFormat: { type: 'global', inputId: 'deliveryFormat' },
        additionalRequirements: { type: 'computed', template: 'Based on needs assessment: {{needsAssessment}}' },
      },
      outputKey: 'curriculum',
    },
    {
      id: 'step-presentation',
      skillId: 'trainer-training-presentation-builder',
      name: 'Build Presentation',
      description: 'Create the presentation framework and slide structure',
      inputMappings: {
        presentationTopic: { type: 'global', inputId: 'workshopTopic' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        keyMessages: { type: 'global', inputId: 'learningObjectives' },
        duration: { type: 'global', inputId: 'duration' },
        presentationType: { type: 'static', value: 'Training Workshop' },
        additionalContext: { type: 'computed', template: 'Follow this curriculum structure: {{curriculum}}' },
      },
      outputKey: 'presentation',
    },
    {
      id: 'step-exercises',
      skillId: 'trainer-interactive-exercise-activity-generator',
      name: 'Create Interactive Exercises',
      description: 'Design hands-on activities, discussions, and practice exercises',
      inputMappings: {
        trainingTopic: { type: 'global', inputId: 'workshopTopic' },
        learningObjectives: { type: 'global', inputId: 'learningObjectives' },
        audienceProfile: { type: 'global', inputId: 'targetAudience' },
        sessionDuration: { type: 'global', inputId: 'duration' },
        deliveryFormat: { type: 'global', inputId: 'deliveryFormat' },
        additionalContext: { type: 'computed', template: 'Curriculum modules to support: {{curriculum}}' },
      },
      outputKey: 'exercises',
    },
    {
      id: 'step-polish',
      skillId: 'trainer-training-content-copy-editor',
      name: 'Polish Content',
      description: 'Review and refine all training materials for clarity and professionalism',
      inputMappings: {
        contentToEdit: { type: 'computed', template: '# Workshop Materials to Polish\n\n## Curriculum\n{{curriculum}}\n\n## Presentation Outline\n{{presentation}}\n\n## Exercises & Activities\n{{exercises}}' },
        contentType: { type: 'static', value: 'Training Materials' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        toneAndStyle: { type: 'static', value: 'Professional, engaging, educational' },
        specificFocus: { type: 'static', value: 'Clarity, engagement, actionable instructions' },
      },
      outputKey: 'polishedContent',
    },
    {
      id: 'step-marketing',
      skillId: 'trainer-workshop-event-marketing-promotion',
      name: 'Generate Marketing Materials',
      description: 'Create promotional content to attract participants',
      inputMappings: {
        eventName: { type: 'global', inputId: 'workshopTopic' },
        eventDescription: { type: 'computed', template: 'A {{duration}} {{deliveryFormat}} workshop on {{workshopTopic}}. Learning Objectives: {{learningObjectives}}' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        keyBenefits: { type: 'global', inputId: 'learningObjectives' },
        eventDetails: { type: 'computed', template: 'Duration: {{duration}}, Format: {{deliveryFormat}}' },
        promotionChannels: { type: 'static', value: 'Email, LinkedIn, Website' },
      },
      outputKey: 'marketing',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 5: SEO/GEO CLIENT ONBOARDING
// Complete SEO audit and strategy for new clients
// ═══════════════════════════════════════════════════════════════════════════

export const SEO_CLIENT_ONBOARDING_WORKFLOW: Workflow = {
  id: 'seo-client-onboarding',
  name: 'SEO/GEO Client Onboarding',
  description: 'Complete SEO audit and strategy package for new clients',
  longDescription: 'This workflow creates a comprehensive SEO onboarding package including technical audit, keyword research, AI search optimization analysis, content refresh priorities, competitive analysis, and initial content briefs.',
  icon: 'Search',
  color: 'green',
  estimatedTime: '18-25 minutes',

  outputs: [
    'Technical SEO site audit with prioritized fixes',
    'Keyword research and content strategy',
    'AEO/GEO optimization analysis for AI search',
    'Content refresh prioritization',
    'Competitive SERP analysis',
    'Initial content briefs'
  ],

  globalInputs: [
    {
      id: 'websiteUrl',
      label: 'Client Website URL',
      type: 'text',
      placeholder: 'e.g., https://example.com',
      required: true,
    },
    {
      id: 'businessDescription',
      label: 'Business Description',
      type: 'textarea',
      placeholder: 'Describe the client\'s business, products/services, and unique value proposition...',
      required: true,
      rows: 4,
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      type: 'textarea',
      placeholder: 'Who are the ideal customers? Demographics, pain points, search behavior...',
      required: true,
      rows: 3,
    },
    {
      id: 'competitors',
      label: 'Main Competitors',
      type: 'textarea',
      placeholder: 'List 3-5 main competitors with their websites...',
      required: true,
      rows: 3,
    },
    {
      id: 'businessGoals',
      label: 'SEO/Business Goals',
      type: 'textarea',
      placeholder: 'What does the client want to achieve? (e.g., increase organic traffic 50%, rank for specific keywords, improve local visibility)',
      required: true,
      rows: 3,
    },
    {
      id: 'currentPerformance',
      label: 'Current Performance (Optional)',
      type: 'textarea',
      placeholder: 'Any known metrics: current traffic, rankings, domain authority, existing issues...',
      required: false,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-technical-audit',
      skillId: 'seo-specialist-technical-seo-site-audit',
      name: 'Technical SEO Audit',
      description: 'Comprehensive technical audit of site health, crawlability, and performance',
      inputMappings: {
        websiteUrl: { type: 'global', inputId: 'websiteUrl' },
        crawlData: { type: 'computed', template: 'Business: {{businessDescription}}. Goals: {{businessGoals}}. Current state: {{currentPerformance}}' },
        focusAreas: { type: 'static', value: 'Core Web Vitals, Mobile Usability, Indexation, Site Architecture, Security' },
        priorityLevel: { type: 'static', value: 'Full Audit' },
      },
      outputKey: 'technicalAudit',
    },
    {
      id: 'step-keyword-research',
      skillId: 'seo-specialist-keyword-research-content-strategy',
      name: 'Keyword Research',
      description: 'Identify target keywords and develop content strategy',
      inputMappings: {
        businessDescription: { type: 'global', inputId: 'businessDescription' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        competitors: { type: 'global', inputId: 'competitors' },
        currentKeywords: { type: 'global', inputId: 'currentPerformance' },
        goals: { type: 'global', inputId: 'businessGoals' },
      },
      outputKey: 'keywordResearch',
    },
    {
      id: 'step-aeo-geo',
      skillId: 'seo-specialist-aeo-geo-optimization-analyzer',
      name: 'AEO/GEO Analysis',
      description: 'Analyze readiness for AI search engines and generative search',
      inputMappings: {
        websiteUrl: { type: 'global', inputId: 'websiteUrl' },
        businessDescription: { type: 'global', inputId: 'businessDescription' },
        targetQueries: { type: 'computed', template: 'Based on keyword research: {{keywordResearch}}' },
        contentSamples: { type: 'global', inputId: 'currentPerformance' },
        competitors: { type: 'global', inputId: 'competitors' },
      },
      outputKey: 'aeoGeoAnalysis',
    },
    {
      id: 'step-content-refresh',
      skillId: 'seo-specialist-content-refresh-analyzer',
      name: 'Content Refresh Analysis',
      description: 'Identify existing content that needs updating or optimization',
      inputMappings: {
        websiteUrl: { type: 'global', inputId: 'websiteUrl' },
        contentInventory: { type: 'computed', template: 'Business: {{businessDescription}}. Target keywords from research: {{keywordResearch}}' },
        performanceData: { type: 'global', inputId: 'currentPerformance' },
        goals: { type: 'global', inputId: 'businessGoals' },
        competitors: { type: 'global', inputId: 'competitors' },
      },
      outputKey: 'contentRefresh',
    },
    {
      id: 'step-competitor-serp',
      skillId: 'seo-specialist-competitor-serp-analyzer',
      name: 'Competitive Analysis',
      description: 'Analyze competitor SERP presence and identify opportunities',
      inputMappings: {
        targetKeywords: { type: 'computed', template: 'Priority keywords from research: {{keywordResearch}}' },
        competitors: { type: 'global', inputId: 'competitors' },
        yourWebsite: { type: 'global', inputId: 'websiteUrl' },
        industryContext: { type: 'global', inputId: 'businessDescription' },
        analysisGoals: { type: 'global', inputId: 'businessGoals' },
      },
      outputKey: 'competitorAnalysis',
    },
    {
      id: 'step-content-briefs',
      skillId: 'seo-specialist-seo-content-brief-generator',
      name: 'Create Content Briefs',
      description: 'Generate initial content briefs for priority pages',
      inputMappings: {
        targetKeyword: { type: 'computed', template: 'Top priority keywords from: {{keywordResearch}}' },
        searchIntent: { type: 'computed', template: 'Based on audience: {{targetAudience}} and competitor analysis: {{competitorAnalysis}}' },
        businessContext: { type: 'global', inputId: 'businessDescription' },
        competitorContent: { type: 'computed', template: 'Competitor insights: {{competitorAnalysis}}' },
        contentGoals: { type: 'global', inputId: 'businessGoals' },
      },
      outputKey: 'contentBriefs',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 6: DIGITAL MARKETING CAMPAIGN LAUNCH
// Complete multi-channel marketing campaign setup
// ═══════════════════════════════════════════════════════════════════════════

export const MARKETING_CAMPAIGN_WORKFLOW: Workflow = {
  id: 'marketing-campaign',
  name: 'Digital Marketing Campaign Launch',
  description: 'Create a complete multi-channel marketing campaign',
  longDescription: 'This workflow helps you launch a comprehensive digital marketing campaign. It creates competitive research, content strategy, content calendar, social media content, email sequences, and paid ad campaigns for Google and Meta.',
  icon: 'Rocket',
  color: 'pink',
  estimatedTime: '20-30 minutes',

  outputs: [
    'Competitor and market research analysis',
    'Content strategy brief',
    'Content calendar (90 days)',
    'Social media content package',
    'Email campaign sequences',
    'Google Ads campaign structure',
    'Meta Ads campaign structure'
  ],

  globalInputs: [
    {
      id: 'productService',
      label: 'Product/Service',
      type: 'textarea',
      placeholder: 'Describe your product or service, its key features, and unique value proposition...',
      required: true,
      rows: 4,
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      type: 'textarea',
      placeholder: 'Describe your ideal customer: demographics, pain points, desires, where they spend time online...',
      required: true,
      rows: 4,
    },
    {
      id: 'campaignGoal',
      label: 'Campaign Goal',
      type: 'select',
      options: ['Brand Awareness', 'Lead Generation', 'Product Launch', 'Sales/Conversions', 'Event Promotion', 'Content Marketing'],
      required: true,
    },
    {
      id: 'budget',
      label: 'Monthly Budget Range',
      type: 'select',
      options: ['Under $1,000', '$1,000-$5,000', '$5,000-$15,000', '$15,000-$50,000', '$50,000+'],
      required: true,
    },
    {
      id: 'brandVoice',
      label: 'Brand Voice',
      type: 'select',
      options: ['Professional & Authoritative', 'Friendly & Conversational', 'Bold & Disruptive', 'Inspirational & Motivational', 'Educational & Informative', 'Playful & Humorous'],
      required: true,
    },
    {
      id: 'competitors',
      label: 'Main Competitors',
      type: 'textarea',
      placeholder: 'List 3-5 main competitors...',
      required: true,
      rows: 2,
    },
    {
      id: 'existingAssets',
      label: 'Existing Assets (Optional)',
      type: 'textarea',
      placeholder: 'Any existing content, landing pages, email lists, social accounts to leverage...',
      required: false,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-competitor-research',
      skillId: 'marketing-specialist-competitor-analysis-market-research',
      name: 'Competitor & Market Research',
      description: 'Analyze competitors and market landscape',
      inputMappings: {
        industry: { type: 'global', inputId: 'productService' },
        competitors: { type: 'global', inputId: 'competitors' },
        targetMarket: { type: 'global', inputId: 'targetAudience' },
        analysisGoals: { type: 'global', inputId: 'campaignGoal' },
        focusAreas: { type: 'static', value: 'Messaging, Positioning, Channel Strategy, Content Themes' },
      },
      outputKey: 'competitorResearch',
    },
    {
      id: 'step-content-strategy',
      skillId: 'content-writer-content-strategy-brief-generator',
      name: 'Content Strategy Brief',
      description: 'Create comprehensive content strategy',
      inputMappings: {
        businessContext: { type: 'global', inputId: 'productService' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        contentGoals: { type: 'global', inputId: 'campaignGoal' },
        brandVoice: { type: 'global', inputId: 'brandVoice' },
        competitorInsights: { type: 'computed', template: 'Competitor research findings: {{competitorResearch}}' },
        existingContent: { type: 'global', inputId: 'existingAssets' },
      },
      outputKey: 'contentStrategy',
    },
    {
      id: 'step-content-calendar',
      skillId: 'marketing-specialist-content-calendar-strategy-planner',
      name: 'Content Calendar',
      description: 'Build 90-day content calendar',
      inputMappings: {
        businessGoals: { type: 'global', inputId: 'campaignGoal' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        contentPillars: { type: 'computed', template: 'Based on content strategy: {{contentStrategy}}' },
        publishingFrequency: { type: 'static', value: '3-5 posts per week across channels' },
        channels: { type: 'static', value: 'Blog, LinkedIn, Instagram, Email, Twitter/X' },
        campaignDuration: { type: 'static', value: '90 days' },
      },
      outputKey: 'contentCalendar',
    },
    {
      id: 'step-social-content',
      skillId: 'marketing-specialist-multi-platform-social-media-content-suite',
      name: 'Social Media Content',
      description: 'Create social media content package',
      inputMappings: {
        platform: { type: 'static', value: 'All Platforms (Cross-Platform Campaign)' },
        contentGoal: { type: 'global', inputId: 'campaignGoal' },
        topic: { type: 'computed', template: 'Product/Service: {{productService}}. Campaign theme from strategy: {{contentStrategy}}' },
        brandVoice: { type: 'global', inputId: 'brandVoice' },
        audience: { type: 'global', inputId: 'targetAudience' },
        cta: { type: 'computed', template: 'Based on campaign goal: {{campaignGoal}}' },
        hashtags: { type: 'static', value: 'true' },
        variations: { type: 'static', value: 'true' },
      },
      outputKey: 'socialContent',
    },
    {
      id: 'step-email-campaign',
      skillId: 'marketing-specialist-email-campaign-automation-suite',
      name: 'Email Campaigns',
      description: 'Create email sequences and automation',
      inputMappings: {
        campaignType: { type: 'global', inputId: 'campaignGoal' },
        audience: { type: 'global', inputId: 'targetAudience' },
        productService: { type: 'global', inputId: 'productService' },
        brandVoice: { type: 'global', inputId: 'brandVoice' },
        campaignGoals: { type: 'computed', template: 'Campaign goal: {{campaignGoal}}. Strategy: {{contentStrategy}}' },
        existingAssets: { type: 'global', inputId: 'existingAssets' },
      },
      outputKey: 'emailCampaign',
    },
    {
      id: 'step-google-ads',
      skillId: 'marketing-specialist-google-ads-campaign-builder',
      name: 'Google Ads Campaign',
      description: 'Build Google Ads campaign structure',
      inputMappings: {
        businessDescription: { type: 'global', inputId: 'productService' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        campaignObjective: { type: 'global', inputId: 'campaignGoal' },
        budget: { type: 'global', inputId: 'budget' },
        competitors: { type: 'global', inputId: 'competitors' },
        landingPage: { type: 'global', inputId: 'existingAssets' },
      },
      outputKey: 'googleAds',
    },
    {
      id: 'step-meta-ads',
      skillId: 'marketing-specialist-meta-ads-campaign-builder',
      name: 'Meta Ads Campaign',
      description: 'Build Meta (Facebook/Instagram) Ads campaign',
      inputMappings: {
        businessDescription: { type: 'global', inputId: 'productService' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        campaignObjective: { type: 'global', inputId: 'campaignGoal' },
        budget: { type: 'global', inputId: 'budget' },
        creativeAssets: { type: 'computed', template: 'Social content to use: {{socialContent}}' },
        landingPage: { type: 'global', inputId: 'existingAssets' },
      },
      outputKey: 'metaAds',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 7: CONSULTING ENGAGEMENT KICKOFF
// Complete consulting proposal and engagement package
// ═══════════════════════════════════════════════════════════════════════════

export const CONSULTING_ENGAGEMENT_WORKFLOW: Workflow = {
  id: 'consulting-engagement',
  name: 'Consulting Engagement Kickoff',
  description: 'Create a complete consulting proposal and engagement package',
  longDescription: 'This workflow helps consultants create a comprehensive engagement package including proposal, gap analysis, process optimization recommendations, business case, workshop guide, and strategy presentation deck.',
  icon: 'Briefcase',
  color: 'indigo',
  estimatedTime: '20-25 minutes',

  outputs: [
    'Professional client proposal',
    'Gap analysis and strategic roadmap',
    'Process optimization recommendations',
    'Business case with ROI analysis',
    'Workshop facilitation guide',
    'Strategy consulting deck'
  ],

  globalInputs: [
    {
      id: 'clientName',
      label: 'Client/Organization Name',
      type: 'text',
      placeholder: 'e.g., Acme Corporation',
      required: true,
    },
    {
      id: 'clientBackground',
      label: 'Client Background',
      type: 'textarea',
      placeholder: 'Describe the client: industry, size, current situation, history...',
      required: true,
      rows: 4,
    },
    {
      id: 'problemStatement',
      label: 'Problem Statement / Engagement Scope',
      type: 'textarea',
      placeholder: 'What problem is the client trying to solve? What is the scope of the engagement?',
      required: true,
      rows: 4,
    },
    {
      id: 'currentState',
      label: 'Current State',
      type: 'textarea',
      placeholder: 'Describe the current processes, systems, capabilities, and pain points...',
      required: true,
      rows: 4,
    },
    {
      id: 'desiredOutcome',
      label: 'Desired Outcome / Future State',
      type: 'textarea',
      placeholder: 'What does success look like? What should be different after the engagement?',
      required: true,
      rows: 3,
    },
    {
      id: 'constraints',
      label: 'Constraints & Considerations',
      type: 'textarea',
      placeholder: 'Budget, timeline, resources, organizational factors, change readiness...',
      required: false,
      rows: 3,
    },
    {
      id: 'stakeholders',
      label: 'Key Stakeholders',
      type: 'textarea',
      placeholder: 'Who are the decision makers and key stakeholders involved?',
      required: true,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-proposal',
      skillId: 'consultant-client-proposal-generator',
      name: 'Generate Proposal',
      description: 'Create a professional consulting proposal',
      inputMappings: {
        clientName: { type: 'global', inputId: 'clientName' },
        clientBackground: { type: 'global', inputId: 'clientBackground' },
        projectScope: { type: 'global', inputId: 'problemStatement' },
        objectives: { type: 'global', inputId: 'desiredOutcome' },
        constraints: { type: 'global', inputId: 'constraints' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
      },
      outputKey: 'proposal',
    },
    {
      id: 'step-gap-analysis',
      skillId: 'business-analyst-gap-analysis-strategic-roadmap',
      name: 'Gap Analysis',
      description: 'Analyze current vs. future state and create strategic roadmap',
      inputMappings: {
        currentState: { type: 'global', inputId: 'currentState' },
        futureState: { type: 'global', inputId: 'desiredOutcome' },
        constraints: { type: 'global', inputId: 'constraints' },
        scope: { type: 'computed', template: 'Client: {{clientName}}. Engagement: {{problemStatement}}' },
      },
      outputKey: 'gapAnalysis',
    },
    {
      id: 'step-process-analysis',
      skillId: 'business-analyst-process-analysis-optimization-report',
      name: 'Process Optimization',
      description: 'Identify process improvement opportunities',
      inputMappings: {
        processName: { type: 'computed', template: 'Core processes at {{clientName}}' },
        processSteps: { type: 'global', inputId: 'currentState' },
        volumeMetrics: { type: 'global', inputId: 'clientBackground' },
        painPoints: { type: 'global', inputId: 'problemStatement' },
        systemsUsed: { type: 'global', inputId: 'currentState' },
        optimizationGoal: { type: 'static', value: 'Improve Customer Satisfaction' },
      },
      outputKey: 'processAnalysis',
    },
    {
      id: 'step-business-case',
      skillId: 'consultant-business-case-roi-analysis',
      name: 'Business Case & ROI',
      description: 'Build quantified business case for recommendations',
      inputMappings: {
        initiative: { type: 'global', inputId: 'problemStatement' },
        currentState: { type: 'computed', template: 'Current state: {{currentState}}. Gap analysis findings: {{gapAnalysis}}' },
        proposedSolution: { type: 'computed', template: 'Process optimization recommendations: {{processAnalysis}}' },
        investmentRequired: { type: 'global', inputId: 'constraints' },
        organizationalContext: { type: 'global', inputId: 'clientBackground' },
      },
      outputKey: 'businessCase',
    },
    {
      id: 'step-workshop-guide',
      skillId: 'consultant-client-workshop-facilitator-guide',
      name: 'Workshop Guide',
      description: 'Create facilitation guide for client kickoff workshop',
      inputMappings: {
        workshopObjective: { type: 'computed', template: 'Kickoff engagement with {{clientName}} to address: {{problemStatement}}' },
        participants: { type: 'global', inputId: 'stakeholders' },
        duration: { type: 'static', value: '4 hours' },
        clientContext: { type: 'global', inputId: 'clientBackground' },
        desiredOutcomes: { type: 'global', inputId: 'desiredOutcome' },
        priorAnalysis: { type: 'computed', template: 'Gap analysis: {{gapAnalysis}}. Business case: {{businessCase}}' },
      },
      outputKey: 'workshopGuide',
    },
    {
      id: 'step-strategy-deck',
      skillId: 'consultant-strategy-consulting-deck-builder',
      name: 'Strategy Deck',
      description: 'Build executive strategy presentation',
      inputMappings: {
        clientName: { type: 'global', inputId: 'clientName' },
        engagementContext: { type: 'global', inputId: 'problemStatement' },
        keyFindings: { type: 'computed', template: 'Gap Analysis: {{gapAnalysis}}\n\nProcess Analysis: {{processAnalysis}}' },
        recommendations: { type: 'computed', template: 'Business case and recommendations: {{businessCase}}' },
        audienceLevel: { type: 'static', value: 'C-Suite / Executive Leadership' },
        presentationGoal: { type: 'global', inputId: 'desiredOutcome' },
      },
      outputKey: 'strategyDeck',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 8: STARTUP INVESTOR PITCH
// Complete investor pitch preparation package for founders
// ═══════════════════════════════════════════════════════════════════════════

export const STARTUP_INVESTOR_PITCH_WORKFLOW: Workflow = {
  id: 'startup-investor-pitch',
  name: 'Startup Investor Pitch',
  description: 'Complete investor pitch preparation with deck, financials, and Q&A prep',
  longDescription: 'This workflow helps founders prepare a comprehensive investor pitch package. It creates market analysis, financial projections, pitch deck structure, due diligence Q&A preparation, and investor outreach materials - everything needed to confidently approach investors.',
  icon: 'TrendingUp',
  color: 'emerald',
  estimatedTime: '25-35 minutes',

  outputs: [
    'Market analysis and competitive intelligence',
    'Financial projections with multiple scenarios',
    'Complete pitch deck structure and content',
    'Investor due diligence Q&A preparation',
    'Investor outreach email templates',
    'Executive summary one-pager'
  ],

  globalInputs: [
    {
      id: 'companyName',
      label: 'Company Name',
      type: 'text',
      placeholder: 'e.g., TechStartup Inc.',
      required: true,
    },
    {
      id: 'businessDescription',
      label: 'Business Description',
      type: 'textarea',
      placeholder: 'What does your company do? What problem are you solving and how? Include your unique value proposition...',
      required: true,
      rows: 5,
    },
    {
      id: 'targetMarket',
      label: 'Target Market',
      type: 'textarea',
      placeholder: 'Who are your customers? Describe your TAM, SAM, SOM and target customer segments...',
      required: true,
      rows: 4,
    },
    {
      id: 'businessModel',
      label: 'Business Model & Revenue',
      type: 'textarea',
      placeholder: 'How do you make money? Pricing, revenue streams, current/projected revenue, unit economics...',
      required: true,
      rows: 4,
    },
    {
      id: 'traction',
      label: 'Traction & Milestones',
      type: 'textarea',
      placeholder: 'Key achievements, metrics (users, revenue, growth rate), major milestones reached...',
      required: true,
      rows: 4,
    },
    {
      id: 'competitors',
      label: 'Competitors',
      type: 'textarea',
      placeholder: 'List main competitors and your differentiation/competitive advantages...',
      required: true,
      rows: 3,
    },
    {
      id: 'fundingAsk',
      label: 'Funding Ask',
      type: 'textarea',
      placeholder: 'How much are you raising? What stage (pre-seed, seed, Series A)? Use of funds?',
      required: true,
      rows: 3,
    },
    {
      id: 'teamBackground',
      label: 'Team Background',
      type: 'textarea',
      placeholder: 'Founder backgrounds, key team members, relevant experience, advisors...',
      required: true,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-market-analysis',
      skillId: 'entrepreneur-founder-market-analysis-competitor-intelligence',
      name: 'Market & Competitor Analysis',
      description: 'Deep dive into market opportunity and competitive landscape',
      inputMappings: {
        businessDescription: { type: 'global', inputId: 'businessDescription' },
        targetMarket: { type: 'global', inputId: 'targetMarket' },
        competitors: { type: 'global', inputId: 'competitors' },
        analysisGoals: { type: 'computed', template: 'Investor pitch preparation for {{companyName}}. Need compelling market size and competitive differentiation data.' },
      },
      outputKey: 'marketAnalysis',
    },
    {
      id: 'step-financials',
      skillId: 'entrepreneur-founder-financial-projections-scenario-modeler',
      name: 'Financial Projections',
      description: 'Create investor-ready financial projections with scenarios',
      inputMappings: {
        businessModel: { type: 'global', inputId: 'businessModel' },
        currentTraction: { type: 'global', inputId: 'traction' },
        fundingAmount: { type: 'global', inputId: 'fundingAsk' },
        marketContext: { type: 'computed', template: 'Market analysis: {{marketAnalysis}}' },
        projectionPeriod: { type: 'static', value: '3-5 year projections' },
      },
      outputKey: 'financials',
    },
    {
      id: 'step-pitch-deck',
      skillId: 'entrepreneur-founder-pitch-deck-builder',
      name: 'Build Pitch Deck',
      description: 'Create compelling pitch deck structure and content',
      inputMappings: {
        companyName: { type: 'global', inputId: 'companyName' },
        businessDescription: { type: 'global', inputId: 'businessDescription' },
        targetMarket: { type: 'computed', template: 'Market analysis: {{marketAnalysis}}' },
        traction: { type: 'global', inputId: 'traction' },
        businessModel: { type: 'computed', template: 'Business model: {{businessModel}}. Financial projections: {{financials}}' },
        fundingAsk: { type: 'global', inputId: 'fundingAsk' },
        team: { type: 'global', inputId: 'teamBackground' },
      },
      outputKey: 'pitchDeck',
    },
    {
      id: 'step-due-diligence',
      skillId: 'entrepreneur-founder-investor-due-diligence-q-a-prep',
      name: 'Due Diligence Q&A Prep',
      description: 'Prepare for tough investor questions and due diligence',
      inputMappings: {
        companyOverview: { type: 'computed', template: 'Company: {{companyName}}. {{businessDescription}}' },
        businessModel: { type: 'global', inputId: 'businessModel' },
        financials: { type: 'computed', template: 'Financial projections: {{financials}}' },
        marketPosition: { type: 'computed', template: 'Market analysis: {{marketAnalysis}}' },
        teamBackground: { type: 'global', inputId: 'teamBackground' },
        traction: { type: 'global', inputId: 'traction' },
        fundingDetails: { type: 'global', inputId: 'fundingAsk' },
      },
      outputKey: 'dueDiligencePrep',
    },
    {
      id: 'step-investor-outreach',
      skillId: 'entrepreneur-founder-investor-outreach-communication-suite',
      name: 'Investor Outreach Materials',
      description: 'Create personalized investor outreach templates',
      inputMappings: {
        companyName: { type: 'global', inputId: 'companyName' },
        elevatorPitch: { type: 'computed', template: 'Key pitch points from deck: {{pitchDeck}}' },
        traction: { type: 'global', inputId: 'traction' },
        fundingAsk: { type: 'global', inputId: 'fundingAsk' },
        targetInvestors: { type: 'static', value: 'Angel investors, Seed-stage VCs, Strategic investors' },
        uniqueHook: { type: 'computed', template: 'Market opportunity: {{marketAnalysis}}' },
      },
      outputKey: 'investorOutreach',
    },
    {
      id: 'step-executive-summary',
      skillId: 'entrepreneur-founder-executive-summary-one-pager-creator',
      name: 'Executive Summary',
      description: 'Create one-page executive summary for investors',
      inputMappings: {
        companyName: { type: 'global', inputId: 'companyName' },
        businessOverview: { type: 'global', inputId: 'businessDescription' },
        marketOpportunity: { type: 'computed', template: 'Market analysis: {{marketAnalysis}}' },
        financialHighlights: { type: 'computed', template: 'Key financials: {{financials}}' },
        traction: { type: 'global', inputId: 'traction' },
        fundingAsk: { type: 'global', inputId: 'fundingAsk' },
        team: { type: 'global', inputId: 'teamBackground' },
      },
      outputKey: 'executiveSummary',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 9: SALES ACCOUNT PURSUIT
// Complete account-based selling package for strategic deals
// ═══════════════════════════════════════════════════════════════════════════

export const SALES_ACCOUNT_PURSUIT_WORKFLOW: Workflow = {
  id: 'sales-account-pursuit',
  name: 'Sales Account Pursuit',
  description: 'Complete strategic account pursuit package for winning big deals',
  longDescription: 'This workflow helps sales professionals pursue strategic accounts systematically. It creates comprehensive account intelligence, discovery call preparation, objection handling playbook, ROI value proposition, and a professional proposal - everything needed to win complex B2B deals.',
  icon: 'Target',
  color: 'orange',
  estimatedTime: '20-30 minutes',

  outputs: [
    'Comprehensive account intelligence brief',
    'Discovery call question framework',
    'Objection handling playbook',
    'ROI and value proposition calculator',
    'Professional sales proposal/RFP response',
    'Follow-up sequence strategy'
  ],

  globalInputs: [
    {
      id: 'targetCompany',
      label: 'Target Company Name',
      type: 'text',
      placeholder: 'e.g., Enterprise Corp',
      required: true,
    },
    {
      id: 'companyContext',
      label: 'Company Background',
      type: 'textarea',
      placeholder: 'What do you know about this company? Industry, size, recent news, known initiatives...',
      required: true,
      rows: 4,
    },
    {
      id: 'yourProduct',
      label: 'Your Product/Solution',
      type: 'textarea',
      placeholder: 'Describe your product/service, key features, and typical value delivered...',
      required: true,
      rows: 4,
    },
    {
      id: 'identifiedNeed',
      label: 'Identified Need/Opportunity',
      type: 'textarea',
      placeholder: 'What pain points or opportunities have you identified? Why might they need your solution?',
      required: true,
      rows: 4,
    },
    {
      id: 'stakeholders',
      label: 'Known Stakeholders',
      type: 'textarea',
      placeholder: 'List known contacts, their roles, and any relationship history...',
      required: true,
      rows: 3,
    },
    {
      id: 'dealSize',
      label: 'Expected Deal Size',
      type: 'select',
      options: ['Under $25K', '$25K-$100K', '$100K-$500K', '$500K-$1M', '$1M+'],
      required: true,
    },
    {
      id: 'salesStage',
      label: 'Current Sales Stage',
      type: 'select',
      options: ['Prospecting/Research', 'Initial Outreach', 'Discovery', 'Solution Presentation', 'Proposal/Negotiation', 'Closing'],
      required: true,
    },
    {
      id: 'competitors',
      label: 'Known Competitors in Deal',
      type: 'textarea',
      placeholder: 'What competitors might they be evaluating? Any incumbent solutions?',
      required: false,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-account-intel',
      skillId: 'sales-representative-target-account-intelligence-research',
      name: 'Account Intelligence',
      description: 'Build comprehensive intelligence brief on the target account',
      inputMappings: {
        targetCompany: { type: 'global', inputId: 'targetCompany' },
        knownContext: { type: 'global', inputId: 'companyContext' },
        yourSolution: { type: 'global', inputId: 'yourProduct' },
        keyStakeholders: { type: 'global', inputId: 'stakeholders' },
        researchGoals: { type: 'computed', template: 'Pursuing {{dealSize}} deal. Stage: {{salesStage}}. Need: {{identifiedNeed}}' },
      },
      outputKey: 'accountIntel',
    },
    {
      id: 'step-discovery-framework',
      skillId: 'sales-representative-discovery-call-question-framework-builder',
      name: 'Discovery Call Framework',
      description: 'Create tailored discovery questions based on account intelligence',
      inputMappings: {
        prospect: { type: 'computed', template: 'Account: {{targetCompany}}. Intelligence: {{accountIntel}}' },
        yourSolution: { type: 'global', inputId: 'yourProduct' },
        identifiedPainPoints: { type: 'global', inputId: 'identifiedNeed' },
        stakeholderRoles: { type: 'global', inputId: 'stakeholders' },
        dealContext: { type: 'computed', template: 'Deal size: {{dealSize}}. Stage: {{salesStage}}' },
      },
      outputKey: 'discoveryFramework',
    },
    {
      id: 'step-objection-handling',
      skillId: 'sales-representative-sales-objection-handling-response-trainer',
      name: 'Objection Handling Playbook',
      description: 'Prepare responses for likely objections',
      inputMappings: {
        product: { type: 'global', inputId: 'yourProduct' },
        targetAccount: { type: 'computed', template: 'Account: {{targetCompany}}. Intel: {{accountIntel}}' },
        competitors: { type: 'global', inputId: 'competitors' },
        dealSize: { type: 'global', inputId: 'dealSize' },
        knownConcerns: { type: 'global', inputId: 'identifiedNeed' },
      },
      outputKey: 'objectionPlaybook',
    },
    {
      id: 'step-roi-calculator',
      skillId: 'sales-representative-value-proposition-roi-calculator-generator',
      name: 'ROI Value Proposition',
      description: 'Build quantified ROI and value proposition',
      inputMappings: {
        product: { type: 'global', inputId: 'yourProduct' },
        prospect: { type: 'computed', template: 'Account: {{targetCompany}}. Business context: {{accountIntel}}' },
        identifiedNeeds: { type: 'global', inputId: 'identifiedNeed' },
        dealSize: { type: 'global', inputId: 'dealSize' },
        competitiveLandscape: { type: 'global', inputId: 'competitors' },
      },
      outputKey: 'roiCalculator',
    },
    {
      id: 'step-proposal',
      skillId: 'sales-representative-proposal-rfp-response-writer',
      name: 'Sales Proposal',
      description: 'Generate professional proposal tailored to the account',
      inputMappings: {
        prospect: { type: 'global', inputId: 'targetCompany' },
        prospectContext: { type: 'computed', template: 'Account intelligence: {{accountIntel}}' },
        yourSolution: { type: 'global', inputId: 'yourProduct' },
        identifiedNeeds: { type: 'global', inputId: 'identifiedNeed' },
        valueProposition: { type: 'computed', template: 'ROI analysis: {{roiCalculator}}' },
        pricingRange: { type: 'global', inputId: 'dealSize' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
      },
      outputKey: 'proposal',
    },
    {
      id: 'step-followup-strategy',
      skillId: 'sales-representative-deal-strategy-next-steps-planner',
      name: 'Follow-Up Strategy',
      description: 'Create strategic follow-up plan to advance the deal',
      inputMappings: {
        account: { type: 'global', inputId: 'targetCompany' },
        currentStage: { type: 'global', inputId: 'salesStage' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        dealContext: { type: 'computed', template: 'Deal size: {{dealSize}}. Account intel: {{accountIntel}}' },
        keyInsights: { type: 'computed', template: 'Discovery insights: {{discoveryFramework}}. Objection prep: {{objectionPlaybook}}' },
        proposalSummary: { type: 'computed', template: 'Proposal highlights: {{proposal}}' },
      },
      outputKey: 'followUpStrategy',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW REGISTRY
// Export all workflows for use throughout the app
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 10: CUSTOMER CHURN PREVENTION
// Proactive retention workflow for at-risk customers
// ═══════════════════════════════════════════════════════════════════════════

export const CUSTOMER_CHURN_PREVENTION_WORKFLOW: Workflow = {
  id: 'customer-churn-prevention',
  name: 'Customer Churn Prevention',
  description: 'Identify at-risk customers and execute targeted retention strategies',
  longDescription: 'This workflow helps Customer Success teams proactively identify churn risk, analyze root causes, and develop personalized save strategies. It combines risk prediction, root cause analysis, and tailored retention offers to maximize customer retention and protect recurring revenue.',
  icon: 'Shield',
  color: 'rose',
  estimatedTime: '15-20 minutes',

  outputs: [
    'Churn risk segmentation and prioritization',
    'Root cause analysis for at-risk accounts',
    'Personalized save offer recommendations',
    'Retention playbook by risk type',
    'Executive summary for leadership'
  ],

  globalInputs: [
    {
      id: 'customerPortfolio',
      label: 'Customer Portfolio Data',
      type: 'textarea',
      placeholder: 'List customers with: name, ARR, tenure, usage metrics, health scores, NPS, support tickets, renewal dates...',
      required: true,
      rows: 8,
    },
    {
      id: 'historicalChurnData',
      label: 'Historical Churn Patterns',
      type: 'textarea',
      placeholder: 'What patterns have you observed in churned customers? Common warning signs, typical timeline, segments most at risk...',
      required: true,
      rows: 4,
    },
    {
      id: 'exitFeedback',
      label: 'Recent Exit Feedback',
      type: 'textarea',
      placeholder: 'Feedback from recently churned customers, cancellation reasons, exit survey data...',
      required: false,
      rows: 4,
    },
    {
      id: 'saveOfferGuidelines',
      label: 'Save Offer Guidelines',
      type: 'textarea',
      placeholder: 'Approved discount levels, term options, service add-ons, approval thresholds for retention offers...',
      required: true,
      rows: 3,
    },
    {
      id: 'csmCapacity',
      label: 'CSM Team Capacity',
      type: 'textarea',
      placeholder: 'Number of CSMs, accounts per CSM, available bandwidth for high-touch interventions...',
      required: false,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-risk-prediction',
      skillId: 'cs-churn-risk-predictor',
      name: 'Predict Churn Risk',
      description: 'Analyze customer health signals to segment portfolio by risk level',
      inputMappings: {
        customerData: { type: 'global', inputId: 'customerPortfolio' },
        historicalChurn: { type: 'global', inputId: 'historicalChurnData' },
        healthMetrics: { type: 'computed', template: 'Analyze all available health metrics from: {{customerPortfolio}}' },
        renewalTimeline: { type: 'computed', template: 'Extract renewal dates from: {{customerPortfolio}}' },
        resourceConstraints: { type: 'global', inputId: 'csmCapacity' },
      },
      outputKey: 'riskAnalysis',
    },
    {
      id: 'step-root-cause',
      skillId: 'cs-churn-root-cause-analyzer',
      name: 'Analyze Root Causes',
      description: 'Deep dive into why customers are at risk based on patterns',
      inputMappings: {
        churnedAccounts: { type: 'computed', template: 'High-risk accounts from analysis: {{riskAnalysis}}' },
        exitFeedback: { type: 'global', inputId: 'exitFeedback' },
        journeyData: { type: 'global', inputId: 'customerPortfolio' },
        competitorInfo: { type: 'static', value: 'Identify any competitive threats mentioned' },
        timeframe: { type: 'static', value: 'Last 6 Months' },
      },
      outputKey: 'rootCauseAnalysis',
    },
    {
      id: 'step-save-offers',
      skillId: 'cs-save-offer-calculator',
      name: 'Calculate Save Offers',
      description: 'Develop personalized retention offers for top at-risk accounts',
      inputMappings: {
        customerProfile: { type: 'computed', template: 'Top 10 at-risk accounts from: {{riskAnalysis}}' },
        churnReason: { type: 'computed', template: 'Root causes identified: {{rootCauseAnalysis}}' },
        competitorOffer: { type: 'static', value: 'Unknown - assess during save conversation' },
        relationshipHistory: { type: 'global', inputId: 'customerPortfolio' },
        companyGuidelines: { type: 'global', inputId: 'saveOfferGuidelines' },
      },
      outputKey: 'saveOffers',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 11: ENTERPRISE ACCOUNT EXPANSION
// Strategic expansion workflow for existing enterprise customers
// ═══════════════════════════════════════════════════════════════════════════

export const ENTERPRISE_ACCOUNT_EXPANSION_WORKFLOW: Workflow = {
  id: 'enterprise-account-expansion',
  name: 'Enterprise Account Expansion',
  description: 'Identify and execute expansion opportunities within strategic accounts',
  longDescription: 'This workflow helps Enterprise Account Executives systematically identify whitespace opportunities, map stakeholder influence, and create champion enablement materials. It transforms account management from reactive to proactive, maximizing expansion revenue from existing customers.',
  icon: 'TrendingUp',
  color: 'indigo',
  estimatedTime: '18-25 minutes',

  outputs: [
    'Whitespace opportunity map with prioritization',
    'Stakeholder power map and engagement strategy',
    'Champion enablement kit for internal selling',
    'Expansion action plan with timeline',
    'Executive briefing document'
  ],

  globalInputs: [
    {
      id: 'accountProfile',
      label: 'Account Profile',
      type: 'textarea',
      placeholder: 'Company name, size, industry, current ARR, products owned, contract terms, key milestones...',
      required: true,
      rows: 5,
    },
    {
      id: 'organizationalStructure',
      label: 'Organizational Structure',
      type: 'textarea',
      placeholder: 'Divisions, business units, geographic presence, subsidiaries, department structure...',
      required: true,
      rows: 4,
    },
    {
      id: 'currentFootprint',
      label: 'Current Footprint',
      type: 'textarea',
      placeholder: 'Users, licenses, features adopted, use cases deployed, departments using solution...',
      required: true,
      rows: 4,
    },
    {
      id: 'stakeholders',
      label: 'Known Stakeholders',
      type: 'textarea',
      placeholder: 'List key contacts: name, title, department, relationship status, influence level, priorities...',
      required: true,
      rows: 5,
    },
    {
      id: 'productPortfolio',
      label: 'Your Product Portfolio',
      type: 'textarea',
      placeholder: 'All products/services you offer, pricing tiers, common expansion paths...',
      required: true,
      rows: 3,
    },
    {
      id: 'expansionGoals',
      label: 'Expansion Goals',
      type: 'textarea',
      placeholder: 'Target expansion revenue, timeline, strategic priorities, executive sponsors...',
      required: true,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-whitespace',
      skillId: 'eae-whitespace-expansion-mapper',
      name: 'Map Whitespace Opportunities',
      description: 'Identify untapped expansion opportunities across the account',
      inputMappings: {
        accountProfile: { type: 'global', inputId: 'accountProfile' },
        orgStructure: { type: 'global', inputId: 'organizationalStructure' },
        currentFootprint: { type: 'global', inputId: 'currentFootprint' },
        productPortfolio: { type: 'global', inputId: 'productPortfolio' },
        competitorPresence: { type: 'static', value: 'Research during stakeholder conversations' },
      },
      outputKey: 'whitespaceMap',
    },
    {
      id: 'step-stakeholder-map',
      skillId: 'eae-stakeholder-power-mapper',
      name: 'Map Stakeholder Influence',
      description: 'Understand the buying committee and develop engagement strategy',
      inputMappings: {
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        dealContext: { type: 'computed', template: 'Expansion opportunities: {{whitespaceMap}}. Goals: {{expansionGoals}}' },
        organizationalDynamics: { type: 'global', inputId: 'organizationalStructure' },
        yourChampion: { type: 'computed', template: 'Identify champions from: {{stakeholders}}' },
        blockers: { type: 'static', value: 'Identify potential blockers during analysis' },
      },
      outputKey: 'stakeholderMap',
    },
    {
      id: 'step-champion-kit',
      skillId: 'eae-champion-enablement-kit',
      name: 'Create Champion Enablement Kit',
      description: 'Arm your internal champion with materials to sell internally',
      inputMappings: {
        championProfile: { type: 'computed', template: 'Champion details from: {{stakeholderMap}}' },
        solution: { type: 'computed', template: 'Priority expansion opportunities: {{whitespaceMap}}' },
        businessCase: { type: 'computed', template: 'ROI and value based on current footprint: {{currentFootprint}}. Expansion goals: {{expansionGoals}}' },
        targetAudience: { type: 'computed', template: 'Key stakeholders to convince: {{stakeholderMap}}' },
        objections: { type: 'computed', template: 'Anticipated objections based on stakeholder analysis: {{stakeholderMap}}' },
      },
      outputKey: 'championKit',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 12: RFP RESPONSE CENTER
// Complete RFP analysis and response workflow
// ═══════════════════════════════════════════════════════════════════════════

export const RFP_RESPONSE_CENTER_WORKFLOW: Workflow = {
  id: 'rfp-response-center',
  name: 'RFP Response Center',
  description: 'Systematically analyze RFPs and develop winning response strategies',
  longDescription: 'This workflow transforms RFP response from reactive scrambling to strategic execution. It analyzes requirements, provides go/no-go recommendations, generates compliance matrices, and develops competitive pricing strategies - everything needed to maximize win rates on high-value opportunities.',
  icon: 'FileCheck',
  color: 'sky',
  estimatedTime: '25-35 minutes',

  outputs: [
    'RFP analysis with go/no-go recommendation',
    'Structured bid decision framework',
    'Comprehensive compliance matrix',
    'Competitive pricing strategy',
    'Win themes and differentiators'
  ],

  globalInputs: [
    {
      id: 'rfpDocument',
      label: 'RFP Document Content',
      type: 'textarea',
      placeholder: 'Paste the RFP requirements, scope of work, evaluation criteria, mandatory requirements, timeline...',
      required: true,
      rows: 12,
    },
    {
      id: 'companyCapabilities',
      label: 'Your Capabilities',
      type: 'textarea',
      placeholder: 'Product features, services, certifications, past performance, case studies, differentiators...',
      required: true,
      rows: 6,
    },
    {
      id: 'companyProfile',
      label: 'Company Profile',
      type: 'textarea',
      placeholder: 'Company size, years in business, industry experience, compliance certifications, references...',
      required: true,
      rows: 4,
    },
    {
      id: 'competitorIntel',
      label: 'Competitor Intelligence',
      type: 'textarea',
      placeholder: 'Known competitors likely to bid, their strengths/weaknesses, incumbent information, market positioning...',
      required: false,
      rows: 4,
    },
    {
      id: 'costStructure',
      label: 'Cost Structure',
      type: 'textarea',
      placeholder: 'Direct costs, labor rates, overhead, target margins, volume discounts, pricing flexibility...',
      required: true,
      rows: 3,
    },
    {
      id: 'customerRelationship',
      label: 'Customer Relationship',
      type: 'textarea',
      placeholder: 'Existing relationship with buyer? Previous work, key contacts, intelligence gathered...',
      required: false,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-requirements-analysis',
      skillId: 'rfp-requirements-analyzer',
      name: 'Analyze Requirements',
      description: 'Parse requirements and assess competitive position',
      inputMappings: {
        rfpContent: { type: 'global', inputId: 'rfpDocument' },
        yourCapabilities: { type: 'global', inputId: 'companyCapabilities' },
        companyProfile: { type: 'global', inputId: 'companyProfile' },
        competitorIntel: { type: 'global', inputId: 'competitorIntel' },
        relationship: { type: 'global', inputId: 'customerRelationship' },
      },
      outputKey: 'requirementsAnalysis',
    },
    {
      id: 'step-bid-decision',
      skillId: 'rfp-bid-decision-framework',
      name: 'Bid Decision Framework',
      description: 'Structured go/no-go analysis',
      inputMappings: {
        opportunityOverview: { type: 'computed', template: 'RFP overview from: {{requirementsAnalysis}}' },
        strategicAlignment: { type: 'computed', template: 'Based on company profile: {{companyProfile}} and capabilities: {{companyCapabilities}}' },
        winFactors: { type: 'computed', template: 'Win factors from analysis: {{requirementsAnalysis}}' },
        riskFactors: { type: 'computed', template: 'Risk factors from analysis: {{requirementsAnalysis}}' },
        resourceRequirements: { type: 'static', value: 'Estimate based on RFP complexity and timeline' },
      },
      outputKey: 'bidDecision',
    },
    {
      id: 'step-compliance-matrix',
      skillId: 'rfp-compliance-matrix-generator',
      name: 'Generate Compliance Matrix',
      description: 'Map requirements to capabilities with evidence',
      inputMappings: {
        rfpRequirements: { type: 'global', inputId: 'rfpDocument' },
        evaluationCriteria: { type: 'computed', template: 'Evaluation criteria from: {{requirementsAnalysis}}' },
        yourCapabilities: { type: 'global', inputId: 'companyCapabilities' },
        pastPerformance: { type: 'global', inputId: 'companyProfile' },
        gapMitigation: { type: 'computed', template: 'Gap mitigation strategies from: {{requirementsAnalysis}}' },
      },
      outputKey: 'complianceMatrix',
    },
    {
      id: 'step-pricing-strategy',
      skillId: 'rfp-competitive-pricing-strategist',
      name: 'Develop Pricing Strategy',
      description: 'Create competitive pricing that maximizes win probability',
      inputMappings: {
        opportunityDetails: { type: 'computed', template: 'Opportunity details from: {{requirementsAnalysis}}' },
        costStructure: { type: 'global', inputId: 'costStructure' },
        competitorPricing: { type: 'global', inputId: 'competitorIntel' },
        customerPriorities: { type: 'computed', template: 'Customer priorities from: {{requirementsAnalysis}}' },
        differentiators: { type: 'computed', template: 'Key differentiators from: {{complianceMatrix}}' },
      },
      outputKey: 'pricingStrategy',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 13: REVENUE OPERATIONS OPTIMIZATION
// Full-funnel RevOps analysis and optimization workflow
// ═══════════════════════════════════════════════════════════════════════════

export const REVENUE_OPERATIONS_OPTIMIZATION_WORKFLOW: Workflow = {
  id: 'revenue-operations-optimization',
  name: 'Revenue Operations Optimization',
  description: 'Optimize your revenue engine from lead to cash',
  longDescription: 'This workflow provides a comprehensive RevOps assessment including funnel analysis, lead scoring optimization, marketing-sales SLA creation, and tech stack evaluation. It identifies bottlenecks, quantifies improvement opportunities, and delivers actionable recommendations to accelerate revenue growth.',
  icon: 'BarChart3',
  color: 'blue',
  estimatedTime: '20-30 minutes',

  outputs: [
    'Full-funnel conversion analysis with benchmarks',
    'Optimized lead scoring model',
    'Marketing-Sales SLA document',
    'Tech stack audit with recommendations',
    'Prioritized improvement roadmap'
  ],

  globalInputs: [
    {
      id: 'funnelMetrics',
      label: 'Funnel Metrics',
      type: 'textarea',
      placeholder: 'Monthly data: leads, MQLs, SQLs, opportunities, proposals, closed-won, by source/segment if available...',
      required: true,
      rows: 6,
    },
    {
      id: 'leadData',
      label: 'Lead & Conversion Data',
      type: 'textarea',
      placeholder: 'Win/loss patterns, ideal customer profile, data captured on leads, sales team feedback on lead quality...',
      required: true,
      rows: 5,
    },
    {
      id: 'currentProcess',
      label: 'Current Lead Handoff Process',
      type: 'textarea',
      placeholder: 'How leads flow from marketing to sales, current definitions (MQL/SQL), response time, follow-up cadence...',
      required: true,
      rows: 4,
    },
    {
      id: 'techStack',
      label: 'Revenue Technology Stack',
      type: 'textarea',
      placeholder: 'List all tools: CRM, MAP, sales engagement, CPQ, analytics, integrations, pain points...',
      required: true,
      rows: 4,
    },
    {
      id: 'teamStructure',
      label: 'Team Structure',
      type: 'textarea',
      placeholder: 'Marketing team size, SDR/BDR count, AE count, CS team, key processes each executes...',
      required: true,
      rows: 3,
    },
    {
      id: 'businessContext',
      label: 'Business Context',
      type: 'textarea',
      placeholder: 'Industry, company size, average deal size, sales cycle length, growth goals...',
      required: true,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-funnel-analysis',
      skillId: 'revops-full-funnel-conversion-analysis',
      name: 'Analyze Revenue Funnel',
      description: 'Deep dive into conversion rates and identify bottlenecks',
      inputMappings: {
        funnelData: { type: 'global', inputId: 'funnelMetrics' },
        timeframe: { type: 'static', value: 'Last 6 Months' },
        segments: { type: 'computed', template: 'Analyze by channel, product, rep if data available in: {{funnelMetrics}}' },
        industryBenchmarks: { type: 'global', inputId: 'businessContext' },
        knownIssues: { type: 'computed', template: 'Known issues from process description: {{currentProcess}}' },
      },
      outputKey: 'funnelAnalysis',
    },
    {
      id: 'step-lead-scoring',
      skillId: 'revops-lead-scoring-model-builder',
      name: 'Optimize Lead Scoring',
      description: 'Design or improve lead scoring model',
      inputMappings: {
        historicalData: { type: 'global', inputId: 'leadData' },
        currentScoring: { type: 'computed', template: 'Current process: {{currentProcess}}' },
        idealCustomerProfile: { type: 'global', inputId: 'leadData' },
        availableData: { type: 'computed', template: 'Data points available in tech stack: {{techStack}}' },
        salesFeedback: { type: 'computed', template: 'Feedback implied from funnel analysis: {{funnelAnalysis}}' },
      },
      outputKey: 'leadScoringModel',
    },
    {
      id: 'step-sla-creation',
      skillId: 'revops-marketing-sales-sla-generator',
      name: 'Create Marketing-Sales SLA',
      description: 'Define clear handoff and accountability framework',
      inputMappings: {
        currentProcess: { type: 'global', inputId: 'currentProcess' },
        leadDefinitions: { type: 'computed', template: 'Lead definitions from scoring model: {{leadScoringModel}}' },
        volumeMetrics: { type: 'global', inputId: 'funnelMetrics' },
        painPoints: { type: 'computed', template: 'Pain points from funnel analysis: {{funnelAnalysis}}' },
        techStack: { type: 'global', inputId: 'techStack' },
      },
      outputKey: 'marketingSalesSLA',
    },
    {
      id: 'step-tech-audit',
      skillId: 'revops-tech-stack-audit',
      name: 'Audit Tech Stack',
      description: 'Evaluate technology for gaps and optimization',
      inputMappings: {
        currentStack: { type: 'global', inputId: 'techStack' },
        integrations: { type: 'computed', template: 'Integrations mentioned in: {{techStack}}' },
        painPoints: { type: 'computed', template: 'Technology issues from funnel analysis: {{funnelAnalysis}} and SLA requirements: {{marketingSalesSLA}}' },
        teamStructure: { type: 'global', inputId: 'teamStructure' },
        budget: { type: 'static', value: 'Maintain current spend' },
      },
      outputKey: 'techStackAudit',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 14: PARTNER CHANNEL ENABLEMENT
// Complete partner program and enablement workflow
// ═══════════════════════════════════════════════════════════════════════════

export const PARTNER_CHANNEL_ENABLEMENT_WORKFLOW: Workflow = {
  id: 'partner-channel-enablement',
  name: 'Partner Channel Enablement',
  description: 'Design and enable high-performing partner channels',
  longDescription: 'This workflow helps Channel Managers build or optimize partner programs from the ground up. It creates program frameworks, sales playbooks, and deal registration processes that attract the right partners and enable them to sell effectively.',
  icon: 'Users',
  color: 'violet',
  estimatedTime: '22-30 minutes',

  outputs: [
    'Complete partner program framework',
    'Partner sales playbook',
    'Deal registration process design',
    'Partner onboarding checklist',
    'Success metrics and KPIs'
  ],

  globalInputs: [
    {
      id: 'businessModel',
      label: 'Business Model',
      type: 'textarea',
      placeholder: 'Your products/services, target market, sales motion, current revenue mix (direct vs. channel), ASP...',
      required: true,
      rows: 4,
    },
    {
      id: 'targetPartners',
      label: 'Target Partner Types',
      type: 'textarea',
      placeholder: 'Resellers, VARs, SIs, consultants, ISVs, MSPs, technology partners - which are you targeting?',
      required: true,
      rows: 3,
    },
    {
      id: 'solutionOverview',
      label: 'Solution Overview',
      type: 'textarea',
      placeholder: 'Product/service description, key features, use cases, pricing model, implementation approach...',
      required: true,
      rows: 4,
    },
    {
      id: 'idealCustomer',
      label: 'Ideal Customer Profile',
      type: 'textarea',
      placeholder: 'Target company size, industry, pain points, buying triggers, decision makers...',
      required: true,
      rows: 3,
    },
    {
      id: 'competitors',
      label: 'Competitive Landscape',
      type: 'textarea',
      placeholder: 'Main competitors, their partner programs, your differentiation, competitive win/loss patterns...',
      required: true,
      rows: 3,
    },
    {
      id: 'channelGoals',
      label: 'Channel Goals',
      type: 'textarea',
      placeholder: 'Revenue targets, partner count goals, geographic coverage, timeline, strategic priorities...',
      required: true,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-program-framework',
      skillId: 'partner-program-framework',
      name: 'Design Partner Program',
      description: 'Create comprehensive program structure',
      inputMappings: {
        businessModel: { type: 'global', inputId: 'businessModel' },
        partnerTypes: { type: 'global', inputId: 'targetPartners' },
        currentProgram: { type: 'static', value: 'New program design' },
        competitorPrograms: { type: 'global', inputId: 'competitors' },
        objectives: { type: 'global', inputId: 'channelGoals' },
      },
      outputKey: 'programFramework',
    },
    {
      id: 'step-sales-playbook',
      skillId: 'partner-sales-playbook-generator',
      name: 'Create Sales Playbook',
      description: 'Build enablement materials for partner selling',
      inputMappings: {
        solution: { type: 'global', inputId: 'solutionOverview' },
        idealCustomer: { type: 'global', inputId: 'idealCustomer' },
        valueProposition: { type: 'computed', template: 'Value proposition based on: {{solutionOverview}} for {{idealCustomer}}' },
        competitors: { type: 'global', inputId: 'competitors' },
        partnerContext: { type: 'computed', template: 'Partner context from program: {{programFramework}}' },
      },
      outputKey: 'salesPlaybook',
    },
    {
      id: 'step-deal-registration',
      skillId: 'partner-deal-registration-process',
      name: 'Design Deal Registration',
      description: 'Create fair and motivating deal protection system',
      inputMappings: {
        currentProcess: { type: 'static', value: 'New process design' },
        channelStructure: { type: 'computed', template: 'Channel structure from program: {{programFramework}}' },
        salesCycle: { type: 'computed', template: 'Typical sales cycle based on: {{businessModel}} selling to {{idealCustomer}}' },
        conflictScenarios: { type: 'computed', template: 'Potential conflicts based on: {{businessModel}} and {{targetPartners}}' },
        objectives: { type: 'global', inputId: 'channelGoals' },
      },
      outputKey: 'dealRegistration',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 15: TECHNICAL DEBT ASSESSMENT
// Engineering economics and tech debt prioritization workflow
// ═══════════════════════════════════════════════════════════════════════════

export const TECHNICAL_DEBT_ASSESSMENT_WORKFLOW: Workflow = {
  id: 'technical-debt-assessment',
  name: 'Technical Debt Assessment',
  description: 'Quantify and prioritize technical debt for strategic investment decisions',
  longDescription: 'This workflow helps Engineering Managers systematically inventory technical debt, quantify its business impact, and build compelling cases for remediation investment. It translates technical concerns into business language that resonates with executives and finance.',
  icon: 'Code2',
  color: 'slate',
  estimatedTime: '18-25 minutes',

  outputs: [
    'Comprehensive technical debt inventory',
    'Business impact quantification',
    'ROI analysis for remediation',
    'Prioritized investment recommendations',
    'Executive summary for leadership'
  ],

  globalInputs: [
    {
      id: 'systemsOverview',
      label: 'Systems Overview',
      type: 'textarea',
      placeholder: 'Describe your systems, architecture, tech stack, team structure, development practices, deployment frequency...',
      required: true,
      rows: 5,
    },
    {
      id: 'knownIssues',
      label: 'Known Technical Issues',
      type: 'textarea',
      placeholder: 'List known debt items: legacy code, outdated dependencies, architectural issues, test gaps, documentation gaps, security concerns...',
      required: true,
      rows: 6,
    },
    {
      id: 'symptoms',
      label: 'Observable Symptoms',
      type: 'textarea',
      placeholder: 'Slow deployments, frequent bugs, scaling issues, onboarding difficulties, incident patterns, developer complaints...',
      required: true,
      rows: 4,
    },
    {
      id: 'teamMetrics',
      label: 'Team Metrics',
      type: 'textarea',
      placeholder: 'Team size, velocity trends, time on maintenance vs. features, deployment frequency, incident rates, MTTR...',
      required: true,
      rows: 4,
    },
    {
      id: 'businessContext',
      label: 'Business Context',
      type: 'textarea',
      placeholder: 'Engineering cost rates, revenue impact of incidents, opportunity cost of delayed features, strategic priorities...',
      required: true,
      rows: 3,
    },
    {
      id: 'teamFeedback',
      label: 'Team Feedback',
      type: 'textarea',
      placeholder: 'What do engineers complain about? Friction points, areas they avoid, wishlist items, retention concerns...',
      required: false,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-inventory',
      skillId: 'eng-tech-debt-inventory',
      name: 'Create Debt Inventory',
      description: 'Systematically catalog and classify all technical debt',
      inputMappings: {
        systemsOverview: { type: 'global', inputId: 'systemsOverview' },
        knownIssues: { type: 'global', inputId: 'knownIssues' },
        symptoms: { type: 'global', inputId: 'symptoms' },
        recentChanges: { type: 'computed', template: 'Recent patterns from: {{teamMetrics}}' },
        teamFeedback: { type: 'global', inputId: 'teamFeedback' },
      },
      outputKey: 'debtInventory',
    },
    {
      id: 'step-business-impact',
      skillId: 'eng-tech-debt-business-impact',
      name: 'Calculate Business Impact',
      description: 'Quantify the cost of technical debt in business terms',
      inputMappings: {
        debtItems: { type: 'computed', template: 'Debt inventory: {{debtInventory}}' },
        teamMetrics: { type: 'global', inputId: 'teamMetrics' },
        incidentData: { type: 'global', inputId: 'symptoms' },
        businessContext: { type: 'global', inputId: 'businessContext' },
        remediationCosts: { type: 'computed', template: 'Remediation estimates from inventory: {{debtInventory}}' },
      },
      outputKey: 'businessImpact',
    },
  ],
};

export const WORKFLOWS: Record<string, Workflow> = {
  'job-application': JOB_APPLICATION_WORKFLOW,
  'interview-prep': INTERVIEW_PREP_WORKFLOW,
  'post-interview': POST_INTERVIEW_WORKFLOW,
  'training-workshop': TRAINING_WORKSHOP_WORKFLOW,
  'seo-client-onboarding': SEO_CLIENT_ONBOARDING_WORKFLOW,
  'marketing-campaign': MARKETING_CAMPAIGN_WORKFLOW,
  'consulting-engagement': CONSULTING_ENGAGEMENT_WORKFLOW,
  'startup-investor-pitch': STARTUP_INVESTOR_PITCH_WORKFLOW,
  'sales-account-pursuit': SALES_ACCOUNT_PURSUIT_WORKFLOW,
  'customer-churn-prevention': CUSTOMER_CHURN_PREVENTION_WORKFLOW,
  'enterprise-account-expansion': ENTERPRISE_ACCOUNT_EXPANSION_WORKFLOW,
  'rfp-response-center': RFP_RESPONSE_CENTER_WORKFLOW,
  'revenue-operations-optimization': REVENUE_OPERATIONS_OPTIMIZATION_WORKFLOW,
  'partner-channel-enablement': PARTNER_CHANNEL_ENABLEMENT_WORKFLOW,
  'technical-debt-assessment': TECHNICAL_DEBT_ASSESSMENT_WORKFLOW,
};

export const WORKFLOW_LIST: Workflow[] = Object.values(WORKFLOWS);
