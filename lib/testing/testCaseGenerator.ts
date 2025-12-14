/**
 * testCaseGenerator.ts - Auto-generates Test Cases for Skills and Workflows
 *
 * Creates realistic test data with:
 * - Happy path (typical user scenario)
 * - Edge case (sparse/complex inputs)
 * - Variant case (different industry/role)
 */

import type { SkillSchema, WorkflowSchema, InputFieldSchema } from './registrySnapshot';
import {
  getSkillDefaultTestData,
  getWorkflowDefaultTestData,
  hasSkillDefaultTestData,
  hasWorkflowDefaultTestData,
} from './defaultTestData';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RubricCriterion {
  id: string;
  description: string;
  weight: number;
}

export interface TestCase {
  id: string;
  type: 'happy-path' | 'edge-case' | 'variant';
  description: string;
  inputPayload: Record<string, string>;
  rubric: {
    criteria: RubricCriterion[];
  };
}

export interface SkillTestSuite {
  skillId: string;
  skillName: string;
  generatedAt: string;
  tests: TestCase[];
}

export interface WorkflowTestSuite {
  workflowId: string;
  workflowName: string;
  generatedAt: string;
  tests: TestCase[];
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST DATA TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const JOB_TITLES = {
  tech: ['Senior Software Engineer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'UX Designer'],
  business: ['Marketing Manager', 'Financial Analyst', 'Project Manager', 'Business Analyst', 'Account Executive'],
  other: ['Registered Nurse', 'High School Teacher', 'Civil Engineer', 'Social Media Manager', 'HR Generalist'],
};

const COMPANIES = {
  tech: ['TechCorp Industries', 'CloudScale Solutions', 'DataDrive Analytics', 'Innovate Labs', 'NextGen Systems'],
  business: ['Global Finance Group', 'Apex Consulting', 'Premier Marketing Co', 'Strategic Partners LLC', 'Enterprise Solutions Inc'],
  other: ['City General Hospital', 'Greenwood School District', 'Metro Engineering Firm', 'Creative Media Agency', 'People First HR'],
};

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting'];

// Sample resume snippets for different experience levels
const RESUMES = {
  entry: `PROFESSIONAL SUMMARY
Recent graduate with internship experience seeking entry-level position. Strong academic background with relevant coursework and project experience.

EDUCATION
B.S. Computer Science, State University, 2024
GPA: 3.6/4.0

EXPERIENCE
Software Development Intern, Tech Startup Inc, Summer 2023
- Developed RESTful APIs using Node.js and Express
- Collaborated with senior developers on feature implementation
- Participated in agile sprints and code reviews

SKILLS
Languages: JavaScript, Python, Java
Frameworks: React, Node.js, Express
Tools: Git, VS Code, Jira`,

  mid: `PROFESSIONAL SUMMARY
Results-driven professional with 5+ years of experience delivering high-impact solutions. Proven track record of leading cross-functional teams and driving measurable business outcomes.

EXPERIENCE
Senior Software Engineer, Enterprise Tech Co, 2021-Present
- Led development of microservices architecture serving 2M+ users
- Reduced system latency by 40% through performance optimization
- Mentored team of 4 junior developers

Software Engineer, Growth Startup Inc, 2019-2021
- Built customer-facing features increasing engagement by 25%
- Implemented CI/CD pipelines reducing deployment time by 60%
- Collaborated with product team on roadmap planning

EDUCATION
M.S. Computer Science, Tech University, 2019
B.S. Computer Science, State College, 2017

SKILLS
Languages: TypeScript, Python, Go, SQL
Cloud: AWS (EC2, Lambda, RDS, S3), Docker, Kubernetes
Leadership: Team mentoring, Technical documentation, Agile/Scrum`,

  senior: `EXECUTIVE SUMMARY
Strategic technology leader with 12+ years transforming organizations through innovative solutions. Track record of building high-performance teams and delivering $10M+ initiatives.

EXPERIENCE
VP of Engineering, Fortune 500 Tech, 2020-Present
- Built and scaled engineering org from 25 to 80+ engineers
- Drove platform modernization saving $5M annually
- Established engineering excellence practices across 8 teams

Director of Engineering, High-Growth Startup, 2016-2020
- Led technical due diligence for $50M Series C funding
- Architected platform handling 500K daily transactions
- Built strategic partnerships with AWS, Google Cloud

Senior Software Engineer → Engineering Manager, Big Tech Co, 2012-2016
- Promoted twice in 4 years based on consistent delivery
- Led migration to cloud-native architecture
- Managed team of 8 engineers across 2 time zones

EDUCATION
M.S. Computer Science, Elite University, 2012
B.S. Computer Engineering, State Tech, 2010

CERTIFICATIONS
AWS Solutions Architect Professional
Google Cloud Professional Data Engineer`,
};

const JOB_DESCRIPTIONS = {
  tech: `SENIOR SOFTWARE ENGINEER

About the Role:
We're looking for a Senior Software Engineer to join our Platform team. You'll be responsible for designing and implementing scalable backend services that power our core product.

Responsibilities:
- Design and build highly available, distributed systems
- Lead technical discussions and code reviews
- Mentor junior engineers and contribute to hiring
- Collaborate with product and design on feature development
- Own end-to-end delivery of major features

Requirements:
- 5+ years of software development experience
- Strong proficiency in at least one backend language (Python, Go, Java)
- Experience with cloud platforms (AWS, GCP, or Azure)
- Solid understanding of system design and architecture
- Excellent communication and collaboration skills

Nice to Have:
- Experience with Kubernetes and containerization
- Background in high-traffic, real-time systems
- Open source contributions

Benefits:
- Competitive salary and equity package
- Remote-first culture with optional office space
- Unlimited PTO and flexible hours
- Professional development budget
- Comprehensive health benefits`,

  business: `MARKETING MANAGER

About the Role:
We're seeking a Marketing Manager to lead our demand generation efforts. You'll develop and execute multi-channel campaigns that drive qualified leads and support our growth targets.

Responsibilities:
- Plan and execute integrated marketing campaigns across digital channels
- Manage marketing budget and optimize spend for ROI
- Collaborate with sales team on lead qualification and handoff
- Analyze campaign performance and report on key metrics
- Lead content strategy and oversee content production

Requirements:
- 4+ years of B2B marketing experience
- Proven track record of driving measurable results
- Experience with marketing automation platforms (HubSpot, Marketo)
- Strong analytical skills and data-driven mindset
- Excellent project management and communication skills

Nice to Have:
- SaaS or technology industry experience
- Experience with ABM strategies
- Background in demand generation

Benefits:
- Competitive base salary plus performance bonus
- Equity participation
- Flexible work arrangements
- Health, dental, and vision coverage
- 401(k) with company match`,

  other: `REGISTERED NURSE - EMERGENCY DEPARTMENT

About the Role:
City General Hospital is seeking an experienced RN to join our Emergency Department team. You'll provide critical care to patients in a fast-paced environment.

Responsibilities:
- Assess and triage patients presenting to the ED
- Administer medications and treatments per physician orders
- Document patient care accurately in electronic health records
- Collaborate with interdisciplinary care teams
- Educate patients and families on care plans

Requirements:
- Active RN license in state
- BSN preferred; ADN with experience considered
- BLS and ACLS certifications required
- 2+ years ED or acute care experience
- Strong clinical assessment skills

Nice to Have:
- TNCC or ENPC certification
- Trauma center experience
- Bilingual (Spanish/English)

Benefits:
- Competitive hourly rate with shift differentials
- Sign-on bonus for eligible candidates
- Tuition reimbursement program
- Comprehensive medical and dental benefits
- Retirement plan with employer match`,
};

// ═══════════════════════════════════════════════════════════════════════════
// RUBRIC TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_RUBRIC: RubricCriterion[] = [
  { id: 'structure', description: 'Output has all required sections and proper formatting', weight: 0.25 },
  { id: 'clarity', description: 'Content is clear, concise, and non-repetitive', weight: 0.25 },
  { id: 'relevance', description: 'Content is relevant to the specific inputs provided', weight: 0.25 },
  { id: 'actionability', description: 'Contains concrete, directly usable advice or templates', weight: 0.25 },
];

const SKILL_SPECIFIC_RUBRICS: Record<string, RubricCriterion[]> = {
  'job-readiness-score': [
    { id: 'score-validity', description: 'Score is between 0-100 with justified breakdown', weight: 0.3 },
    { id: 'gap-identification', description: 'Identifies specific gaps between resume and job requirements', weight: 0.3 },
    { id: 'actionability', description: 'Provides prioritized, concrete improvement steps', weight: 0.25 },
    { id: 'structure', description: 'Uses proper sections: Score, Strengths, Gaps, Action Plan', weight: 0.15 },
  ],
  'resume-customizer': [
    { id: 'ats-optimization', description: 'Incorporates relevant keywords from job description', weight: 0.3 },
    { id: 'impact-statements', description: 'Uses strong action verbs and quantified achievements', weight: 0.25 },
    { id: 'customization', description: 'Tailored specifically to the target role/company', weight: 0.25 },
    { id: 'format', description: 'Clean, ATS-friendly format with proper sections', weight: 0.2 },
  ],
  'cover-letter-generator': [
    { id: 'personalization', description: 'Addresses specific company and role details', weight: 0.3 },
    { id: 'value-proposition', description: 'Clearly articulates candidate value to employer', weight: 0.3 },
    { id: 'tone', description: 'Professional yet engaging tone appropriate to company culture', weight: 0.2 },
    { id: 'length', description: 'Appropriate length (3-4 paragraphs)', weight: 0.2 },
  ],
  'interview-prep': [
    { id: 'question-variety', description: 'Covers behavioral, technical, and situational questions', weight: 0.3 },
    { id: 'answer-quality', description: 'Sample answers use STAR method with specific examples', weight: 0.3 },
    { id: 'relevance', description: 'Questions tailored to specific role and company', weight: 0.25 },
    { id: 'completeness', description: 'Includes company research and questions to ask', weight: 0.15 },
  ],
  'company-research': [
    { id: 'depth', description: 'Covers company history, culture, products, and recent news', weight: 0.3 },
    { id: 'interview-readiness', description: 'Highlights talking points for interviews', weight: 0.25 },
    { id: 'competitive-context', description: 'Provides industry and competitive landscape', weight: 0.25 },
    { id: 'accuracy', description: 'Information appears factual and well-researched', weight: 0.2 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// TEST DATA GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate test value for a specific input field
 */
function generateFieldValue(
  field: InputFieldSchema,
  context: { type: 'happy-path' | 'edge-case' | 'variant'; industry: string }
): string {
  const { type, industry } = context;

  // Handle select fields
  if (field.type === 'select' && field.options?.length) {
    if (type === 'edge-case') {
      return field.options[field.options.length - 1]; // Last option (often less common)
    }
    return field.options[0]; // Default to first option
  }

  // Generate based on field ID patterns
  const fieldId = field.id.toLowerCase();

  // Job title fields
  if (fieldId.includes('jobtitle') || fieldId === 'jobtitletarget') {
    const titles = industry === 'tech' ? JOB_TITLES.tech : industry === 'business' ? JOB_TITLES.business : JOB_TITLES.other;
    const index = type === 'variant' ? Math.min(2, titles.length - 1) : 0;
    return titles[index];
  }

  // Company name fields
  if (fieldId.includes('company')) {
    const companies = industry === 'tech' ? COMPANIES.tech : industry === 'business' ? COMPANIES.business : COMPANIES.other;
    const index = type === 'variant' ? Math.min(2, companies.length - 1) : 0;
    return companies[index];
  }

  // Job description fields
  if (fieldId.includes('jobdescription') || fieldId === 'jobdesc') {
    if (type === 'edge-case') {
      return 'Software Engineer role. Requirements: coding skills, teamwork.'; // Sparse
    }
    const jd = industry === 'tech' ? JOB_DESCRIPTIONS.tech : industry === 'business' ? JOB_DESCRIPTIONS.business : JOB_DESCRIPTIONS.other;
    return jd;
  }

  // Resume/background fields
  if (fieldId.includes('resume') || fieldId.includes('background') || fieldId === 'userbackground') {
    if (type === 'edge-case') {
      return RESUMES.entry; // Entry-level for edge case
    }
    if (type === 'variant') {
      return RESUMES.senior; // Senior for variant
    }
    return RESUMES.mid; // Mid-level for happy path
  }

  // Industry field
  if (fieldId.includes('industry')) {
    return INDUSTRIES[type === 'variant' ? 3 : 0];
  }

  // Location fields
  if (fieldId.includes('location')) {
    const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Remote'];
    return locations[type === 'variant' ? 3 : 0];
  }

  // Interviewer fields
  if (fieldId.includes('interviewer')) {
    return type === 'edge-case'
      ? 'Sarah (HR)'
      : 'John Smith (Hiring Manager), Emily Chen (Team Lead), Mike Johnson (VP Engineering)';
  }

  // Target person (for networking)
  if (fieldId.includes('targetperson')) {
    return 'Sarah Chen, Senior Product Manager at TechCorp. Previously at Google. Active on LinkedIn with posts about product strategy. Connected through mutual colleague Jane.';
  }

  // Additional context fields (optional, so sometimes empty)
  if (fieldId.includes('additional') || fieldId.includes('context') || fieldId.includes('notes')) {
    if (type === 'edge-case') {
      return ''; // Empty for edge case
    }
    return 'Led successful product launch that increased revenue by 35%. Strong presentation skills demonstrated in quarterly business reviews. Looking to transition into more strategic role.';
  }

  // URL fields
  if (fieldId.includes('url') || fieldId.includes('website')) {
    return 'https://example-company.com';
  }

  // Default textarea content
  if (field.type === 'textarea') {
    if (type === 'edge-case') {
      return 'Brief content for testing minimal input handling.';
    }
    return `Sample content for ${field.label}. This field contains representative test data that simulates realistic user input for the ${field.id} parameter.`;
  }

  // Default text content
  return `Test value for ${field.label}`;
}

/**
 * Generate a complete input payload for a skill
 */
function generateInputPayload(
  inputs: InputFieldSchema[],
  type: 'happy-path' | 'edge-case' | 'variant',
  industry: string
): Record<string, string> {
  const payload: Record<string, string> = {};

  for (const field of inputs) {
    // For edge cases, sometimes skip optional fields
    if (type === 'edge-case' && !field.required && Math.random() > 0.5) {
      continue;
    }

    payload[field.id] = generateFieldValue(field, { type, industry });
  }

  return payload;
}

/**
 * Get rubric for a specific skill
 */
function getRubricForSkill(skillId: string): RubricCriterion[] {
  return SKILL_SPECIFIC_RUBRICS[skillId] || DEFAULT_RUBRIC;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate test suite for a skill
 *
 * If default test data is available for this skill, it will be used as the
 * primary happy-path test case. Additional auto-generated tests are still included.
 */
export function generateSkillTestSuite(skill: SkillSchema): SkillTestSuite {
  const timestamp = Date.now();
  const tests: TestCase[] = [];

  // Check if we have curated default test data for this skill
  if (hasSkillDefaultTestData(skill.id)) {
    const defaultData = getSkillDefaultTestData(skill.id)!;
    tests.push({
      id: defaultData.defaultTestCaseId,
      type: 'happy-path',
      description: defaultData.description,
      inputPayload: defaultData.inputPayload,
      rubric: { criteria: getRubricForSkill(skill.id) },
    });
  } else {
    // Generate a happy-path test if no default data available
    tests.push({
      id: `${skill.id}-happy-${timestamp}`,
      type: 'happy-path',
      description: `Happy path test for ${skill.name} with typical user inputs`,
      inputPayload: generateInputPayload(skill.inputs, 'happy-path', 'tech'),
      rubric: { criteria: getRubricForSkill(skill.id) },
    });
  }

  // Always add edge case and variant tests (auto-generated)
  tests.push(
    {
      id: `${skill.id}-edge-${timestamp}`,
      type: 'edge-case',
      description: `Edge case test for ${skill.name} with minimal/sparse inputs`,
      inputPayload: generateInputPayload(skill.inputs, 'edge-case', 'tech'),
      rubric: { criteria: getRubricForSkill(skill.id) },
    },
    {
      id: `${skill.id}-variant-${timestamp}`,
      type: 'variant',
      description: `Variant test for ${skill.name} with different industry/role`,
      inputPayload: generateInputPayload(skill.inputs, 'variant', 'other'),
      rubric: { criteria: getRubricForSkill(skill.id) },
    }
  );

  return {
    skillId: skill.id,
    skillName: skill.name,
    generatedAt: new Date().toISOString(),
    tests,
  };
}

/**
 * Generate test suite for a workflow
 *
 * If default test data is available for this workflow, it will be used as the
 * primary happy-path test case. Additional auto-generated tests are still included.
 */
export function generateWorkflowTestSuite(workflow: WorkflowSchema): WorkflowTestSuite {
  const timestamp = Date.now();
  const tests: TestCase[] = [];

  // Default workflow rubric
  const defaultRubric = {
    criteria: [
      { id: 'completion', description: 'All workflow steps complete successfully', weight: 0.3 },
      { id: 'coherence', description: 'Outputs from each step build on previous steps', weight: 0.25 },
      { id: 'quality', description: 'Final output meets quality standards', weight: 0.25 },
      { id: 'timing', description: 'Execution completes within expected time', weight: 0.2 },
    ],
  };

  // Check if we have curated default test data for this workflow
  if (hasWorkflowDefaultTestData(workflow.id)) {
    const defaultData = getWorkflowDefaultTestData(workflow.id)!;
    tests.push({
      id: defaultData.defaultTestCaseId,
      type: 'happy-path',
      description: defaultData.description,
      inputPayload: defaultData.inputPayload,
      rubric: defaultRubric,
    });
  } else {
    // Generate a happy-path test if no default data available
    tests.push({
      id: `${workflow.id}-happy-${timestamp}`,
      type: 'happy-path',
      description: `Happy path test for ${workflow.name} workflow with complete inputs`,
      inputPayload: generateInputPayload(workflow.globalInputs, 'happy-path', 'tech'),
      rubric: defaultRubric,
    });
  }

  // Always add edge case and variant tests (auto-generated)
  tests.push(
    {
      id: `${workflow.id}-edge-${timestamp}`,
      type: 'edge-case',
      description: `Edge case test for ${workflow.name} workflow with minimal inputs`,
      inputPayload: generateInputPayload(workflow.globalInputs, 'edge-case', 'tech'),
      rubric: {
        criteria: [
          { id: 'graceful-handling', description: 'Handles missing optional inputs gracefully', weight: 0.35 },
          { id: 'completion', description: 'Core workflow steps complete', weight: 0.35 },
          { id: 'quality', description: 'Output quality acceptable despite sparse inputs', weight: 0.3 },
        ],
      },
    },
    {
      id: `${workflow.id}-variant-${timestamp}`,
      type: 'variant',
      description: `Variant test for ${workflow.name} workflow with different industry`,
      inputPayload: generateInputPayload(workflow.globalInputs, 'variant', 'other'),
      rubric: {
        criteria: [
          { id: 'adaptability', description: 'Output adapts to different industry context', weight: 0.35 },
          { id: 'completion', description: 'All workflow steps complete successfully', weight: 0.3 },
          { id: 'relevance', description: 'Content relevant to non-tech industry', weight: 0.35 },
        ],
      },
    }
  );

  return {
    workflowId: workflow.id,
    workflowName: workflow.name,
    generatedAt: new Date().toISOString(),
    tests,
  };
}

/**
 * Generate all test suites for all skills
 */
export function generateAllSkillTestSuites(skills: SkillSchema[]): SkillTestSuite[] {
  return skills.map(generateSkillTestSuite);
}

/**
 * Generate all test suites for all workflows
 */
export function generateAllWorkflowTestSuites(workflows: WorkflowSchema[]): WorkflowTestSuite[] {
  return workflows.map(generateWorkflowTestSuite);
}
