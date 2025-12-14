/**
 * defaultTestData.ts - Default Test Data for Skills and Workflows
 *
 * Provides pre-defined test data for every skill and workflow that can be:
 * - Loaded into form fields via "Test Output" buttons
 * - Used by automated tests and the Developer Playground
 * - Extended with additional test cases
 *
 * Each skill has a "default" test case (usually the first happy-path) that is
 * used for quick testing via the UI "Test Output" button.
 */

import type { TestCase, SkillTestSuite, WorkflowTestSuite } from './testCaseGenerator';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillDefaultTestData {
  skillId: string;
  defaultTestCaseId: string;
  description: string;
  inputPayload: Record<string, string>;
}

export interface WorkflowDefaultTestData {
  workflowId: string;
  defaultTestCaseId: string;
  description: string;
  inputPayload: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED TEST DATA TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const SAMPLE_RESUME = `PROFESSIONAL SUMMARY
Results-driven software professional with 6+ years of experience in full-stack development and team leadership. Proven track record of delivering scalable solutions that drive business growth. Strong background in agile methodologies and cross-functional collaboration.

EXPERIENCE

Senior Software Engineer, TechScale Solutions, 2021-Present
- Led development of microservices platform handling 1.5M daily transactions
- Reduced API response times by 45% through performance optimization
- Mentored team of 5 junior developers, conducting weekly code reviews
- Implemented CI/CD pipelines reducing deployment time from 4 hours to 15 minutes

Software Engineer, StartupGrow Inc, 2018-2021
- Built customer portal used by 50,000+ monthly active users
- Developed real-time notification system using WebSockets
- Collaborated with product team on feature prioritization and roadmap
- Created internal tools that saved 10+ engineering hours per week

Junior Developer, WebAgency Co, 2017-2018
- Developed responsive websites for 20+ clients
- Maintained legacy PHP applications
- Assisted senior developers with database optimization

EDUCATION
B.S. Computer Science, State University, 2017
Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering

TECHNICAL SKILLS
Languages: TypeScript, Python, JavaScript, SQL, Go
Frameworks: React, Node.js, Express, Django, FastAPI
Cloud: AWS (EC2, Lambda, RDS, S3), Docker, Kubernetes
Tools: Git, GitHub Actions, Terraform, DataDog

CERTIFICATIONS
- AWS Solutions Architect Associate (2023)
- Certified Scrum Master (2022)`;

const SAMPLE_JOB_DESCRIPTION = `SENIOR SOFTWARE ENGINEER

About TechForward Inc:
TechForward is a fast-growing B2B SaaS company revolutionizing how enterprises manage their data infrastructure. We've raised $75M Series C and serve 500+ enterprise customers globally.

About the Role:
We're seeking a Senior Software Engineer to join our Platform team. You'll design and build core infrastructure powering our product, working closely with product and design to deliver exceptional user experiences.

What You'll Do:
- Design and implement scalable, reliable backend services
- Lead technical architecture discussions and code reviews
- Mentor junior engineers and contribute to engineering culture
- Collaborate with cross-functional teams on product features
- Own end-to-end delivery of major platform initiatives

Requirements:
- 5+ years of software engineering experience
- Strong proficiency in one or more backend languages (Python, Go, Java, TypeScript)
- Experience with cloud platforms (AWS, GCP, or Azure)
- Solid understanding of distributed systems and microservices
- Experience with databases (PostgreSQL, Redis, MongoDB)
- Strong communication and collaboration skills

Nice to Have:
- Experience with Kubernetes and container orchestration
- Background in developer tools or infrastructure
- Contributions to open-source projects

Benefits:
- Competitive salary: $180,000-$220,000 + equity
- Remote-first with optional office in SF and NYC
- Unlimited PTO and flexible working hours
- $5,000 annual learning budget
- Comprehensive health, dental, vision coverage
- 401(k) with 4% company match

TechForward is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment.`;

const SAMPLE_LINKEDIN_PROFILE = `HEADLINE
Senior Software Engineer | Building Scalable Systems | AWS Certified | Open Source Contributor

ABOUT
I'm a software engineer passionate about building products that scale. Over the past 6 years, I've worked across the stack, from designing microservices architectures to crafting intuitive user interfaces.

Currently, I'm focused on platform engineering at TechScale Solutions, where I lead initiatives to improve system reliability and developer experience. I'm particularly interested in distributed systems, developer tooling, and the intersection of engineering and product.

When I'm not coding, I contribute to open-source projects and write about software architecture on my blog. I'm always open to connecting with fellow engineers and discussing interesting technical challenges.

EXPERIENCE
Senior Software Engineer at TechScale Solutions (3 years)
Software Engineer at StartupGrow Inc (3 years)
Junior Developer at WebAgency Co (1 year)

EDUCATION
B.S. Computer Science, State University

SKILLS
TypeScript, Python, React, Node.js, AWS, Kubernetes, PostgreSQL, System Design`;

// ═══════════════════════════════════════════════════════════════════════════
// JOB SEEKER SKILLS - DEFAULT TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const JOB_SEEKER_DEFAULT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'job-readiness-score': {
    skillId: 'job-readiness-score',
    defaultTestCaseId: 'job-readiness-default-1',
    description: 'Senior Software Engineer applying to B2B SaaS company',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      userBackground: SAMPLE_RESUME,
      additionalContext: 'I have been in my current role for 3 years and am looking for a more senior position with greater impact. My primary motivation is to work on larger-scale distributed systems.',
    },
  },

  'skills-gap-analyzer': {
    skillId: 'skills-gap-analyzer',
    defaultTestCaseId: 'skills-gap-default-1',
    description: 'Analyzing skills gap for Platform Engineering role',
    inputPayload: {
      jobTitle: 'Senior Platform Engineer',
      companyName: 'CloudScale Solutions',
      jobDescription: `SENIOR PLATFORM ENGINEER

We're looking for a Senior Platform Engineer to design and maintain our cloud infrastructure supporting 10M+ daily API calls.

Requirements:
- 5+ years experience with cloud platforms (AWS/GCP)
- Strong Kubernetes and container orchestration expertise
- Experience with Terraform or similar IaC tools
- Background in building developer platforms and tooling
- Experience with observability stack (Prometheus, Grafana, DataDog)
- Strong Python or Go programming skills

Nice to have:
- Experience with service mesh (Istio, Linkerd)
- Background in platform as a service (PaaS) development
- Contributions to CNCF projects`,
      userBackground: SAMPLE_RESUME,
      timeline: 'Applying in 3 weeks',
    },
  },

  'linkedin-optimizer-pro': {
    skillId: 'linkedin-optimizer-pro',
    defaultTestCaseId: 'linkedin-optimizer-default-1',
    description: 'Optimizing LinkedIn profile for engineering leadership roles',
    inputPayload: {
      linkedinProfile: SAMPLE_LINKEDIN_PROFILE,
      targetRole: 'Engineering Manager',
      industry: 'B2B SaaS / Developer Tools',
      additionalContext: 'Looking to transition from senior IC to engineering management. Have been leading a small team informally for the past year.',
    },
  },

  'ats-optimization-checker': {
    skillId: 'ats-optimization-checker',
    defaultTestCaseId: 'ats-checker-default-1',
    description: 'Checking resume ATS compatibility for tech role',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      userBackground: SAMPLE_RESUME,
    },
  },

  'resume-customizer': {
    skillId: 'resume-customizer',
    defaultTestCaseId: 'resume-customizer-default-1',
    description: 'Customizing resume for Senior Software Engineer position',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      userBackground: SAMPLE_RESUME,
      additionalContext: 'Want to emphasize my experience with microservices and team leadership. Currently at TechScale Solutions for 3 years.',
    },
  },

  'cover-letter-generator': {
    skillId: 'cover-letter-generator',
    defaultTestCaseId: 'cover-letter-default-1',
    description: 'Generating cover letter for B2B SaaS company',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      userBackground: SAMPLE_RESUME,
      additionalContext: 'I discovered TechForward through their engineering blog posts about event-driven architecture. Their approach to solving complex data problems aligns with my interests.',
    },
  },

  'networking-script-generator': {
    skillId: 'networking-script-generator',
    defaultTestCaseId: 'networking-default-1',
    description: 'Creating networking scripts for informational interviews',
    inputPayload: {
      targetRole: 'Engineering Manager',
      targetCompany: 'TechForward Inc',
      connectionContext: 'We attended the same university and they spoke at a recent tech meetup I attended. They are currently a Senior Engineering Manager at the company.',
      userBackground: SAMPLE_RESUME,
      networkingGoal: 'Learn about the engineering culture and what qualities they look for in engineering managers. Also understand the career path from senior IC to management.',
      additionalContext: 'I have been doing some informal team leadership at my current company and want to make the formal transition to management.',
    },
  },

  'company-research': {
    skillId: 'company-research',
    defaultTestCaseId: 'company-research-default-1',
    description: 'Researching B2B SaaS company before interview',
    inputPayload: {
      companyName: 'TechForward Inc',
      roleApplying: 'Senior Software Engineer',
      userBackground: SAMPLE_RESUME,
      specificQuestions: 'What is their tech stack? What is the engineering culture like? What are their growth plans? Who are their main competitors?',
    },
  },

  'interview-prep': {
    skillId: 'interview-prep',
    defaultTestCaseId: 'interview-prep-default-1',
    description: 'Preparing for technical interview at B2B SaaS company',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      userBackground: SAMPLE_RESUME,
      interviewType: 'Technical + Behavioral',
      additionalContext: 'The recruiter mentioned there will be a system design round focused on data pipelines, plus a behavioral round with the hiring manager.',
    },
  },

  'thank-you-note-generator': {
    skillId: 'thank-you-note-generator',
    defaultTestCaseId: 'thank-you-default-1',
    description: 'Generating thank you note after technical interview',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      interviewerName: 'Sarah Chen',
      interviewerRole: 'Engineering Manager',
      interviewHighlights: 'We discussed the architecture of their event-driven system and how they handle data consistency across microservices. Sarah mentioned they are scaling to support 10x traffic growth. We also talked about their mentorship culture and how they support career growth.',
      userBackground: SAMPLE_RESUME,
      additionalContext: 'The interview went well overall. I felt particularly strong on the system design portion where I proposed a CQRS pattern that Sarah seemed interested in.',
    },
  },

  'offer-evaluation-pro': {
    skillId: 'offer-evaluation-pro',
    defaultTestCaseId: 'offer-eval-default-1',
    description: 'Evaluating job offer from B2B SaaS company',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      location: 'San Francisco, CA (Remote-first)',
      baseSalary: '$195,000',
      bonus: '15% target bonus',
      equity: '0.05% equity vesting over 4 years with 1-year cliff',
      benefits: 'Comprehensive health/dental/vision, 401k with 4% match, unlimited PTO, $5,000 learning budget, home office stipend',
      otherOffers: 'Also have an offer from DataScale Corp: $185,000 base, 10% bonus, 0.03% equity, standard benefits. DataScale is more established but slower growth.',
      userBackground: SAMPLE_RESUME,
      priorities: 'My top priorities are: 1) Growth potential and learning opportunities, 2) Work-life balance, 3) Total compensation. I am currently making $175,000 base.',
    },
  },

  'salary-negotiation-master': {
    skillId: 'salary-negotiation-master',
    defaultTestCaseId: 'salary-neg-default-1',
    description: 'Preparing salary negotiation for senior engineer role',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      location: 'San Francisco, CA',
      currentOffer: '$195,000 base + 15% bonus + 0.05% equity over 4 years',
      targetCompensation: '$215,000 base or equivalent equity increase',
      leverage: 'I have a competing offer from DataScale Corp at similar base but less equity. I also have a strong performance record at my current company with documented impact.',
      concerns: 'I want to negotiate respectfully without risking the offer. The recruiter mentioned the budget is somewhat flexible for strong candidates.',
      userBackground: SAMPLE_RESUME,
    },
  },

  'onboarding-accelerator-pro': {
    skillId: 'onboarding-accelerator-pro',
    defaultTestCaseId: 'onboarding-default-1',
    description: 'Planning 90-day onboarding for new senior engineer role',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      startDate: 'January 15, 2025',
      teamInfo: 'Joining the Platform team of 8 engineers. My manager is Sarah Chen (Engineering Manager). The team is responsible for core infrastructure including API gateway, service mesh, and developer tooling.',
      userBackground: SAMPLE_RESUME,
      personalGoals: 'I want to ship meaningful code in my first month, build relationships with key stakeholders, and understand the architectural decisions behind the platform. Long-term, I am interested in taking on tech lead responsibilities.',
      knownChallenges: 'The codebase is large with some legacy components. The team has been working on a major migration project that I will likely join.',
    },
  },

  'day-in-the-life-generator': {
    skillId: 'day-in-the-life-generator',
    defaultTestCaseId: 'day-in-life-default-1',
    description: 'Understanding daily life as Senior Software Engineer',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      industry: 'B2B SaaS',
      companySize: 'Mid-size (200-500 employees)',
      userBackground: SAMPLE_RESUME,
    },
  },

  'role-ai-automation-analyzer': {
    skillId: 'role-ai-automation-analyzer',
    defaultTestCaseId: 'ai-automation-default-1',
    description: 'Analyzing AI automation potential for software engineering',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      industry: 'B2B SaaS',
      currentSkills: 'Full-stack development (TypeScript, Python, React), system design, code review, mentoring junior developers, technical documentation, sprint planning',
      additionalContext: 'I am curious about how AI tools like GitHub Copilot and ChatGPT might change the software engineering role over the next 5 years.',
    },
  },

  'healthcare-resume-parser': {
    skillId: 'healthcare-resume-parser',
    defaultTestCaseId: 'healthcare-resume-default-1',
    description: 'Parsing healthcare professional resume',
    inputPayload: {
      userBackground: `REGISTERED NURSE - BSN, RN

PROFESSIONAL SUMMARY
Compassionate and detail-oriented Registered Nurse with 5+ years of experience in acute care settings. Specialized in cardiac care with expertise in patient assessment, care planning, and family education. Strong advocate for patient safety and evidence-based practice.

LICENSURE & CERTIFICATIONS
- Registered Nurse, State Board of Nursing (Active)
- Basic Life Support (BLS) - American Heart Association
- Advanced Cardiac Life Support (ACLS) - American Heart Association
- Certified Critical Care Nurse (CCRN) - AACN

CLINICAL EXPERIENCE

Staff Nurse - Cardiac ICU, Metro General Hospital, 2020-Present
- Provide specialized care for post-cardiac surgery and acute MI patients
- Manage continuous cardiac monitoring for unit of 12 patients
- Precept new graduate nurses and nursing students
- Participate in rapid response and code blue teams
- Champion for unit-based falls prevention committee

Staff Nurse - Medical-Surgical Unit, Community Hospital, 2018-2020
- Managed care for 6-8 patients with diverse diagnoses
- Collaborated with interdisciplinary team for discharge planning
- Implemented evidence-based practice for pressure ulcer prevention

EDUCATION
Bachelor of Science in Nursing (BSN), State University, 2018
GPA: 3.7/4.0 | Dean's List

SKILLS
- Electronic Health Records: Epic, Cerner
- Clinical: Cardiac monitoring, ventilator management, IV therapy, medication administration
- Languages: English (native), Spanish (conversational)`,
      targetRole: 'ICU Nurse - Travel Position',
      additionalContext: 'Looking to transition to travel nursing. Interested in Level 1 trauma centers and academic medical centers.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE SKILLS - DEFAULT TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const ENTERPRISE_DEFAULT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'contract-review-accelerator': {
    skillId: 'contract-review-accelerator',
    defaultTestCaseId: 'contract-review-default-1',
    description: 'Reviewing SaaS vendor agreement',
    inputPayload: {
      contractText: `SOFTWARE AS A SERVICE AGREEMENT

This Software as a Service Agreement ("Agreement") is entered into as of January 1, 2025 ("Effective Date") by and between:

CloudVendor Inc., a Delaware corporation ("Provider")
AND
Enterprise Customer Corp., a California corporation ("Customer")

1. SERVICES
Provider shall provide Customer with access to its cloud-based analytics platform ("Service") as described in Exhibit A.

2. TERM AND RENEWAL
Initial term: 36 months from Effective Date
Auto-renewal: Annual periods unless either party provides 90 days written notice

3. FEES AND PAYMENT
Annual subscription fee: $150,000 USD
Payment terms: Net 30 from invoice date
Annual price increase: Up to 7% upon renewal

4. DATA RIGHTS
4.1 Customer Data remains Customer's property
4.2 Provider may use anonymized, aggregated data for product improvement
4.3 Provider shall not sell Customer Data to third parties

5. SERVICE LEVELS
Availability: 99.5% monthly uptime
Support: 24/7 for critical issues, business hours for standard
Credits: 10% monthly credit for each 1% below SLA

6. LIABILITY
Provider's total liability: Not to exceed fees paid in prior 12 months
Exclusions: Indirect, consequential, punitive damages

7. DATA SECURITY
SOC 2 Type II certified
Data encrypted at rest and in transit
Annual penetration testing

8. TERMINATION
For cause: 30 days notice for material breach
For convenience: Customer may terminate with 180 days notice and pro-rata refund

9. GOVERNING LAW
State of Delaware`,
      contractType: 'SaaS Vendor Agreement',
      reviewFocus: 'Identify unfavorable terms, missing protections, and negotiation opportunities. Focus on data security, liability, and termination provisions.',
      companyContext: 'We are a mid-size financial services company. This would be our primary analytics platform handling customer financial data. Budget for the project is $175,000 annually.',
    },
  },

  'budget-variance-narrator': {
    skillId: 'budget-variance-narrator',
    defaultTestCaseId: 'budget-variance-default-1',
    description: 'Explaining Q3 budget variances for engineering department',
    inputPayload: {
      budgetData: `ENGINEERING DEPARTMENT - Q3 2024 BUDGET VS ACTUAL

Category | Budget | Actual | Variance | Variance %
Personnel | $2,500,000 | $2,750,000 | ($250,000) | -10.0%
Cloud Infrastructure | $800,000 | $920,000 | ($120,000) | -15.0%
Software Licenses | $300,000 | $275,000 | $25,000 | 8.3%
Contractors | $400,000 | $580,000 | ($180,000) | -45.0%
Training & Development | $100,000 | $45,000 | $55,000 | 55.0%
Travel | $75,000 | $30,000 | $45,000 | 60.0%
Equipment | $150,000 | $200,000 | ($50,000) | -33.3%
Miscellaneous | $50,000 | $35,000 | $15,000 | 30.0%

TOTAL | $4,375,000 | $4,835,000 | ($460,000) | -10.5%

Additional Context:
- Headcount: Budgeted 45 FTE, Actual 48 FTE (3 unplanned hires)
- Major project: Platform migration project accelerated by 2 months
- Cloud costs: Unexpected traffic spike in August (+200%)`,
      audience: 'CFO and Finance Committee',
      analysisDepth: 'Executive summary with supporting details. Explain root causes, one-time vs recurring impacts, and forecast implications for Q4.',
      additionalContext: 'The platform migration was accelerated at CEO request to meet a key customer deadline. Training budget was deferred to Q4.',
    },
  },

  'steering-committee-pack': {
    skillId: 'steering-committee-pack',
    defaultTestCaseId: 'steering-committee-default-1',
    description: 'Preparing steering committee materials for platform modernization',
    inputPayload: {
      programName: 'Platform Modernization Initiative',
      programStatus: `PROGRAM STATUS SUMMARY

Overall Health: Yellow (At Risk)

Timeline: Original completion Dec 2025, current forecast Mar 2026 (+3 months)
Budget: $4.5M approved, $3.2M spent to date, $1.8M forecast to complete (10% over)
Scope: 85% of planned features, 2 features descoped, 1 added

Key Milestones:
- Phase 1 (Foundation): Complete ✓
- Phase 2 (Core Migration): 75% complete, 3 weeks behind
- Phase 3 (Integration): Not started, at risk
- Phase 4 (Cutover): Not started

Current Issues:
1. Legacy API compatibility taking longer than estimated
2. Key architect on medical leave for 6 weeks
3. Vendor dependency for integration module

Current Risks:
1. Holiday code freeze may impact timeline
2. Customer commitments dependent on new platform
3. Team burnout after sustained overtime`,
      keyMetrics: `Sprint Velocity: 45 points (target 50)
Defect Rate: 12 per sprint (target <10)
Test Coverage: 72% (target 80%)
Team Utilization: 95% (target 85%)`,
      risks: `R1: Schedule slip of 3+ months if integration delays continue (High likelihood, High impact)
R2: Budget overrun of 15-20% if contractor extension needed (Medium likelihood, Medium impact)
R3: Quality issues if testing compressed (Low likelihood, High impact)`,
      decisions: `D1: Approve additional $200K for contractor extension (Recommended: Yes)
D2: Defer Feature X to Phase 2 release (Recommended: Yes)
D3: Approve 2-week schedule buffer for integration testing (Recommended: Yes)`,
    },
  },

  'executive-communication-pack': {
    skillId: 'executive-communication-pack',
    defaultTestCaseId: 'exec-comm-default-1',
    description: 'Creating executive communication for major initiative',
    inputPayload: {
      topic: 'Launch of AI-Powered Customer Support Platform',
      keyMessage: 'We are launching an AI-powered customer support platform that will reduce response times by 60% and improve customer satisfaction scores. This represents a $2M investment with expected ROI of 300% over 3 years.',
      audience: 'Board of Directors, Executive Leadership Team, All Employees',
      context: 'We have been piloting AI support for 6 months with excellent results. The board previously approved the concept in Q2. This communication announces the full rollout.',
      tone: 'Professional, optimistic, acknowledging the journey ahead',
      supportingData: `Pilot Results (6 months):
- Response time: 4 hours → 1.5 hours (-62%)
- CSAT: 72 → 84 (+12 points)
- Ticket resolution rate: 68% → 82%
- Cost per ticket: $15 → $8 (-47%)
- Employee satisfaction with tools: 85% positive

Investment: $2M over 18 months
Expected savings: $6M over 3 years
Jobs impacted: 0 layoffs; 15 support agents retrained to handle escalations`,
      timing: 'Announce at all-hands meeting next Tuesday, board update Friday',
    },
  },

  'automation-opportunity-assessment': {
    skillId: 'automation-opportunity-assessment',
    defaultTestCaseId: 'automation-assessment-default-1',
    description: 'Assessing invoice processing for automation potential',
    inputPayload: {
      processName: 'Invoice Processing and Approval',
      processDescription: `Current Process:
1. Invoices arrive via email (60%), mail (30%), or vendor portal (10%)
2. AP clerk manually enters invoice data into ERP (15 min average)
3. Clerk matches invoice to PO in system (5 min)
4. If match, routes to budget owner for approval via email
5. Budget owner reviews and approves in ERP (variable, 1-5 days wait)
6. AP processes payment batch weekly

Volume: 2,500 invoices per month
Staff: 3 FTE AP clerks + 50 budget approvers
Error rate: 4% require rework
Current cost: $45 per invoice processed`,
      currentMetrics: `Processing time: 15-20 minutes per invoice
Approval cycle: 3-5 business days average
Error rate: 4% (data entry errors, wrong GL coding)
Late payment rate: 8% (vendor complaints)
Staff overtime: 15 hours/week average`,
      painPoints: `1. Manual data entry is tedious and error-prone
2. Email approval creates bottleneck and lacks visibility
3. No real-time status tracking for invoices
4. Month-end close requires overtime
5. Vendors frequently call to check payment status`,
      constraints: `Budget: $150K implementation + $50K annual
Timeline: Must complete before fiscal year end (6 months)
Technical: Must integrate with existing Oracle ERP
Change management: Finance team resistant to new tools`,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXCEL SKILLS - DEFAULT TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const EXCEL_DEFAULT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'excel-data-analyzer': {
    skillId: 'excel-data-analyzer',
    defaultTestCaseId: 'excel-analyzer-default-1',
    description: 'Analyzing sales data for quarterly trends',
    inputPayload: {
      dataDescription: `Sales Performance Dataset - Q1-Q3 2024

Columns:
- Date (daily records from Jan 1 - Sep 30, 2024)
- Region (North, South, East, West)
- Product Category (Software, Hardware, Services)
- Sales Rep Name (50 unique reps)
- Deal Size (Small <$10K, Medium $10-50K, Large >$50K)
- Revenue (USD)
- Units Sold
- Customer Type (New, Existing, Renewal)
- Sales Cycle Days
- Win Rate (%)

Dataset size: ~15,000 rows
Notable: Software sales spiked in March (new product launch)
Notable: West region added 5 new reps in Q2`,
      analysisGoal: 'Identify top performing reps and regions, understand seasonality patterns, and find factors that correlate with faster sales cycles and higher win rates.',
      specificQuestions: `1. Which region has the highest revenue growth rate Q-over-Q?
2. Is there a correlation between deal size and sales cycle length?
3. Who are the top 10 performers by revenue and win rate?
4. What is the customer acquisition vs retention revenue split?
5. Are there any concerning trends in the data?`,
    },
  },

  'excel-formula-builder': {
    skillId: 'excel-formula-builder',
    defaultTestCaseId: 'excel-formula-default-1',
    description: 'Building commission calculation formula',
    inputPayload: {
      taskDescription: `Need to calculate sales commission with tiered rates:
- 0-$50K quota: 5% commission
- $50K-$100K: 8% commission on amount over $50K
- $100K-$200K: 10% commission on amount over $100K
- Over $200K: 12% commission on amount over $200K

Plus, if they hit 150% of quota, add a 2% bonus on total sales.
If they are a "Senior" rep (indicated in column D), add an extra 1% base rate to all tiers.`,
      currentSetup: `Column A: Rep Name
Column B: Quota Amount
Column C: Actual Sales
Column D: Rep Level (Junior/Senior)
Column E: Commission (need formula)
Column F: Bonus (need formula)
Column G: Total Payout (need formula)`,
      exampleData: `Row 2: John Smith, $100,000 quota, $175,000 sales, Senior
Row 3: Jane Doe, $75,000 quota, $120,000 sales, Junior
Row 4: Bob Wilson, $150,000 quota, $250,000 sales, Senior`,
    },
  },

  'excel-chart-designer': {
    skillId: 'excel-chart-designer',
    defaultTestCaseId: 'excel-chart-default-1',
    description: 'Creating executive dashboard charts',
    inputPayload: {
      dataOverview: `Monthly performance metrics for 2024:
- Revenue (by product line: SaaS, Professional Services, Hardware)
- Customer count (New, Churned, Net)
- NPS Score (0-100)
- Support ticket volume and resolution time
- Employee headcount and satisfaction

Currently have raw data in multiple tabs. Need to create an executive dashboard that tells the story of our growth while highlighting areas needing attention.`,
      visualizationGoal: 'Create a one-page executive dashboard showing key business metrics with appropriate visualizations. Should be printable and suitable for board meetings.',
      audience: 'Board of Directors and Executive Team - prefer clean, professional look with minimal color. They want to see trends over time and comparisons to plan/targets.',
      specificCharts: `Must include:
1. Revenue trend with target line
2. Customer acquisition funnel
3. Product mix breakdown
4. Key metric scorecard (4-6 KPIs)

Optional:
- Geographic performance map
- YoY comparison`,
    },
  },

  'excel-pivot-architect': {
    skillId: 'excel-pivot-architect',
    defaultTestCaseId: 'excel-pivot-default-1',
    description: 'Designing pivot tables for financial analysis',
    inputPayload: {
      datasetDescription: `Transaction-level general ledger data for FY2024:
- 50,000+ rows of journal entries
- Fields: Date, Account Code, Account Name, Department, Cost Center, Project Code, Debit, Credit, Description, Posted By, Approval Status

Need to analyze spending by department, track budget vs actual, and identify unusual patterns for the audit committee.`,
      analysisNeeds: `Primary analyses needed:
1. Monthly spending by department with YoY comparison
2. Top 10 vendors by spend with trend
3. Budget variance by cost center
4. Expense distribution by category
5. Unusual transactions (outliers, round numbers, specific keywords)

Should be able to drill down from summary to detail.`,
      outputFormat: 'Interactive pivot tables with slicers for department, date range, and cost center. Include calculated fields for variance % and running totals.',
    },
  },

  'excel-marketing-dashboard': {
    skillId: 'excel-marketing-dashboard',
    defaultTestCaseId: 'excel-marketing-default-1',
    description: 'Building marketing campaign performance dashboard',
    inputPayload: {
      campaignData: `Marketing Campaign Data (Jan-Sep 2024):

Channels tracked: Google Ads, LinkedIn, Facebook, Email, Content/SEO, Events
Metrics available: Impressions, Clicks, Cost, Leads, MQLs, SQLs, Opportunities, Closed Won

Budget allocation:
- Digital Ads: 45% ($450K)
- Content/SEO: 25% ($250K)
- Events: 20% ($200K)
- Email: 10% ($100K)

Goals:
- Generate 5,000 MQLs
- Achieve CAC under $500
- 3:1 pipeline to spend ratio`,
      stakeholders: 'CMO (weekly), CEO (monthly), Sales Leadership (weekly), Board (quarterly)',
      kpisTracked: `Primary KPIs:
- Cost per Lead (CPL)
- Cost per MQL
- MQL to SQL conversion rate
- SQL to Opportunity rate
- Marketing-sourced pipeline
- Marketing-influenced revenue
- CAC by channel
- ROI by campaign type`,
    },
  },

  'excel-data-cleaner': {
    skillId: 'excel-data-cleaner',
    defaultTestCaseId: 'excel-cleaner-default-1',
    description: 'Cleaning messy customer data export',
    inputPayload: {
      dataIssues: `Customer database export with 25,000 rows. Known issues:

1. Names: Mixed formats (JOHN SMITH, john smith, Smith, John), some with titles (Mr., Dr.)
2. Phone numbers: Various formats (555-123-4567, (555) 123-4567, 5551234567, +1-555-123-4567)
3. Addresses: Inconsistent abbreviations (Street vs St vs St., missing zip+4)
4. Dates: Mixed formats (1/15/2024, 15-Jan-24, 2024-01-15, January 15, 2024)
5. Duplicates: ~5% estimated duplicate records (same email, different name spellings)
6. Missing data: ~10% missing phone, ~3% missing email
7. Invalid emails: Some obvious typos (@gmial.com, @yaho.com)
8. Status field: Mix of Active/active/ACTIVE/A/1/Yes`,
      targetFormat: `Clean format needed:
- Name: First Name, Last Name (separate columns, proper case)
- Phone: (XXX) XXX-XXXX
- Address: Street, City, State (2-letter), ZIP (5-digit)
- Date: YYYY-MM-DD
- Status: Active/Inactive only
- Email: lowercase, validated format
- One row per unique customer (deduplicated)`,
      outputRequirements: 'Provide step-by-step cleaning process with formulas. Flag records that need manual review. Create summary of changes made.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW DEFAULT TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const WORKFLOW_DEFAULT_TEST_DATA: Record<string, WorkflowDefaultTestData> = {
  'job-application': {
    workflowId: 'job-application',
    defaultTestCaseId: 'job-app-workflow-default-1',
    description: 'Complete job application package for Senior Software Engineer',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      resume: SAMPLE_RESUME,
      additionalContext: 'I am particularly excited about this role because of their focus on developer experience and platform engineering.',
    },
  },

  'interview-prep': {
    workflowId: 'interview-prep',
    defaultTestCaseId: 'interview-workflow-default-1',
    description: 'Complete interview preparation for tech company',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      resume: SAMPLE_RESUME,
      additionalContext: 'Interview is in 3 days. Will have system design round and behavioral round.',
    },
  },

  'post-interview': {
    workflowId: 'post-interview',
    defaultTestCaseId: 'post-interview-workflow-default-1',
    description: 'Post-interview follow-up package',
    inputPayload: {
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechForward Inc',
      interviewerName: 'Sarah Chen',
      interviewerRole: 'Engineering Manager',
      interviewHighlights: 'Discussed system design for event-driven architecture. Sarah seemed impressed with my CQRS proposal. Also talked about team culture and growth opportunities.',
      resume: SAMPLE_RESUME,
    },
  },

  'ai-governance-implementation': {
    workflowId: 'ai-governance-implementation',
    defaultTestCaseId: 'ai-gov-workflow-default-1',
    description: 'Complete AI governance program implementation',
    inputPayload: {
      organizationSize: '501-2000 employees',
      industry: 'Technology',
      currentAIUsage: 'ChatGPT Enterprise for support, GitHub Copilot for engineering, exploring AI analytics. Some shadow IT with personal AI accounts.',
      dataClassifications: 'Public, Internal, Confidential, Restricted. Customer PII and some enterprise client financial data.',
      keyConcerns: 'Data leakage through AI prompts, compliance with SOC2 and GDPR, IP protection, inconsistent usage policies.',
      approvedAITools: 'ChatGPT Enterprise, GitHub Copilot, Grammarly',
      regulatoryRequirements: 'SOC2 Type II, GDPR, working toward HIPAA',
      existingPolicies: 'IT Security Policy, Acceptable Use Policy, Data Privacy Policy (no AI-specific)',
    },
  },

  'compliance-program-builder': {
    workflowId: 'compliance-program-builder',
    defaultTestCaseId: 'compliance-workflow-default-1',
    description: 'SOC2 Type II audit preparation and policy generation',
    inputPayload: {
      auditType: 'SOC2 Type II',
      auditScope: 'All production systems, customer data handling, security controls for SaaS platform',
      auditTimeline: 'Audit fieldwork begins in 10 weeks',
      controlFramework: 'Trust Services Criteria: Security, Availability, Confidentiality',
      availableEvidence: 'We have access logs, change management records, incident reports, security training completion. Missing: formal policies for several areas.',
      organizationContext: 'B2B SaaS company, 150 employees, handling customer business data including some financial information',
      knownGaps: 'Missing formal incident response policy, vendor management policy needs update, access review process not documented',
      previousFindings: 'First SOC2 audit',
      policyNeeded: 'Incident Response Policy',
    },
  },

  'incident-to-improvement': {
    workflowId: 'incident-to-improvement',
    defaultTestCaseId: 'incident-workflow-default-1',
    description: 'Production incident postmortem and remediation change request',
    inputPayload: {
      incidentTitle: 'API Gateway Outage - Payment Processing',
      severity: 'SEV1 - Critical (major outage, data loss)',
      incidentTimeline: `14:32 UTC - Monitoring alert: API gateway error rate >50%
14:35 UTC - On-call engineer paged
14:38 UTC - Initial investigation, identified memory leak in gateway
14:45 UTC - Attempted restart of affected pods
14:50 UTC - Restart failed, OOM killer triggering
15:05 UTC - Rolled back to previous gateway version
15:15 UTC - Services recovering
15:30 UTC - Full service restoration confirmed
15:45 UTC - Incident declared resolved`,
      impactDescription: 'Payment processing unavailable for 58 minutes during peak hours. Estimated 2,500 failed transactions, $125,000 revenue at risk. 50+ customer complaints received.',
      rootCauseAnalysis: 'Memory leak introduced in gateway v2.4.0 release. The leak occurred during request retry logic when downstream services were slow. Under normal load, leak was gradual. High traffic caused rapid memory exhaustion.',
      responseActions: 'Rolled back to gateway v2.3.5. Increased memory limits as temporary measure. Disabled retry logic for non-critical paths.',
      contributingFactors: 'Load testing did not simulate sustained high traffic. Memory monitoring alert threshold was too high (90% vs recommended 80%).',
      lessonsLearned: 'Need better load testing for edge cases. Need lower memory alert thresholds. Need runbook for gateway issues.',
      proposedRemediation: 'Fix memory leak in retry logic, add memory usage unit tests, lower monitoring threshold to 75%, create gateway troubleshooting runbook.',
      scheduledWindow: 'Next maintenance window - Saturday 2:00 AM PST',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED DEFAULT TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All skill default test data combined
 */
export const ALL_SKILL_DEFAULT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  ...JOB_SEEKER_DEFAULT_TEST_DATA,
  ...ENTERPRISE_DEFAULT_TEST_DATA,
  ...EXCEL_DEFAULT_TEST_DATA,
};

/**
 * All workflow default test data combined
 */
export const ALL_WORKFLOW_DEFAULT_TEST_DATA: Record<string, WorkflowDefaultTestData> = {
  ...WORKFLOW_DEFAULT_TEST_DATA,
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get default test data for a skill
 */
export function getSkillDefaultTestData(skillId: string): SkillDefaultTestData | undefined {
  return ALL_SKILL_DEFAULT_TEST_DATA[skillId];
}

/**
 * Get default test data for a workflow
 */
export function getWorkflowDefaultTestData(workflowId: string): WorkflowDefaultTestData | undefined {
  return ALL_WORKFLOW_DEFAULT_TEST_DATA[workflowId];
}

/**
 * Check if a skill has default test data
 */
export function hasSkillDefaultTestData(skillId: string): boolean {
  return skillId in ALL_SKILL_DEFAULT_TEST_DATA;
}

/**
 * Check if a workflow has default test data
 */
export function hasWorkflowDefaultTestData(workflowId: string): boolean {
  return workflowId in ALL_WORKFLOW_DEFAULT_TEST_DATA;
}

/**
 * Get all skill IDs that have default test data
 */
export function getSkillsWithDefaultTestData(): string[] {
  return Object.keys(ALL_SKILL_DEFAULT_TEST_DATA);
}

/**
 * Get all workflow IDs that have default test data
 */
export function getWorkflowsWithDefaultTestData(): string[] {
  return Object.keys(ALL_WORKFLOW_DEFAULT_TEST_DATA);
}

/**
 * Convert default test data to a TestCase for the testing framework
 */
export function defaultTestDataToTestCase(data: SkillDefaultTestData): TestCase {
  return {
    id: data.defaultTestCaseId,
    type: 'happy-path',
    description: data.description,
    inputPayload: data.inputPayload,
    rubric: {
      criteria: [
        { id: 'completeness', description: 'Output addresses all key aspects of the input', weight: 30 },
        { id: 'accuracy', description: 'Information is accurate and relevant', weight: 25 },
        { id: 'actionability', description: 'Output provides actionable recommendations', weight: 25 },
        { id: 'formatting', description: 'Output is well-structured and easy to read', weight: 20 },
      ],
    },
  };
}

/**
 * Create a full test suite from default test data for a skill
 */
export function createDefaultTestSuite(skillId: string, skillName: string): SkillTestSuite | undefined {
  const defaultData = getSkillDefaultTestData(skillId);
  if (!defaultData) return undefined;

  return {
    skillId,
    skillName,
    generatedAt: new Date().toISOString(),
    tests: [defaultTestDataToTestCase(defaultData)],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FORM INJECTION HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply default test data to a form state object.
 * Returns a new object with the default values merged in.
 *
 * @param currentFormState - Current form state
 * @param defaultData - Default test data to apply
 * @param skillInputIds - List of valid input IDs for the skill (optional, for validation)
 * @returns New form state with default values applied
 */
export function applyDefaultTestDataToForm(
  currentFormState: Record<string, unknown>,
  defaultData: SkillDefaultTestData | WorkflowDefaultTestData,
  skillInputIds?: string[]
): Record<string, unknown> {
  const newState = { ...currentFormState };

  for (const [key, value] of Object.entries(defaultData.inputPayload)) {
    // If skillInputIds provided, only set known fields
    if (skillInputIds && !skillInputIds.includes(key)) {
      console.warn(`[defaultTestData] Unknown input field: ${key}`);
      continue;
    }

    // Apply the value
    newState[key] = value;
  }

  return newState;
}

/**
 * Get input IDs from a skill or workflow schema
 */
export function extractInputIds(inputs: Array<{ id: string }>): string[] {
  return inputs.map((input) => input.id);
}
