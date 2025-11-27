
import { Skill, FormInput } from '../types.ts';
import { 
  ReadinessIcon,
  SkillsGapIcon,
  LinkedInIcon,
  KeywordIcon,
  ResumeIcon,
  CoverLetterIcon,
  NetworkingIcon,
  CompanyResearchIcon,
  InterviewIcon,
  OfferIcon,
  SalaryIcon,
  OnboardingIcon,
  DayInLifeIcon,
  AutomationIcon
} from '../components/icons.tsx';

// Shared inputs for many job-seeker related skills to promote code reuse
const sharedJobSeekerInputs: FormInput[] = [
  { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Product Manager', required: true },
  { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g., Google', required: true },
  { id: 'jobDescription', label: 'Job Description', type: 'textarea', placeholder: 'Content is pre-filled from home page upload.', required: true, rows: 8 },
  { id: 'userBackground', label: 'Your Resume / Background', type: 'textarea', placeholder: 'Content is pre-filled from home page upload.', required: true, rows: 8 },
];

const additionalContextInput: FormInput = { 
    id: 'additionalContext', 
    label: 'Additional Context (Optional)', 
    type: 'textarea', 
    placeholder: 'Content is pre-filled from home page upload. Paste performance reviews, project details, or specific achievements here.', 
    rows: 5 
};

// Helper to create the final user prompt string
const createUserPrompt = (title: string, inputs: Record<string, any>, inputMapping: Record<string, string>) => {
  let prompt = `Based on the user's request, please now perform the ${title} analysis.\n\n`;
  for (const [key, label] of Object.entries(inputMapping)) {
    if (inputs[key]) {
      prompt += `**${label}:**\n\`\`\`\n${inputs[key]}\n\`\`\`\n\n`;
    }
  }
  return prompt;
};

export const SKILLS: Record<string, Skill> = {
  // --- ORDERED SKILLS FOR JOB SEARCH WORKFLOW ---
  'job-readiness-score': {
    id: 'job-readiness-score',
    name: 'Job Readiness Scorer',
    description: 'Quantified 0-100 assessment of candidate fit for any role with actionable improvement plan.',
    longDescription: 'Analyzes resume against job description to score Hard Skills, Experience Relevance, Soft Skills, Career Trajectory, and Resume Optimization. Provides specific strengths, gaps, and prioritized action items.',
    whatYouGet: ['Overall Readiness Score (0-100)', 'Weighted Component Breakdown', 'Top 5 Strengths & All Gaps', 'Prioritized Action Plan', 'Interview Likelihood Estimate'],
    theme: { primary: 'text-blue-400', secondary: 'bg-blue-900/20', gradient: 'from-blue-500/20 to-transparent' },
    icon: ReadinessIcon,
    inputs: [...sharedJobSeekerInputs, additionalContextInput],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR job-readiness-scorer]...`,
        userPrompt: createUserPrompt("Job Readiness Score", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            jobDescription: "Job Description",
            userBackground: "Candidate Background",
            additionalContext: "Additional Context"
        })
    }),
  },
  'skills-gap-analyzer': {
    id: 'skills-gap-analyzer',
    name: 'Skills Gap Analyzer',
    description: 'Comprehensive analysis of skill gaps between a candidate\'s current qualifications and target job requirements.',
    longDescription: 'Identifies missing skills, provides learning paths, estimates time to close gaps, and develops interview strategies to address weaknesses.',
    whatYouGet: ['Qualification Score (0-100)', 'Prioritized Gap Ranking', 'Specific Learning Paths', 'Interview Gap Strategy'],
    theme: { primary: 'text-violet-400', secondary: 'bg-violet-900/20', gradient: 'from-violet-500/20 to-transparent' },
    icon: SkillsGapIcon,
    inputs: [
        ...sharedJobSeekerInputs,
        { id: 'timeline', label: 'Application Timeline (Optional)', type: 'text', placeholder: 'e.g., Applying in 2 weeks' },
        { id: 'learning_preferences', label: 'Learning Preferences (Optional)', type: 'text', placeholder: 'e.g., Online courses, books, hands-on projects' },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR skills-gap-analyzer]...`,
        userPrompt: createUserPrompt("Skills Gap Analyzer Pro", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            jobDescription: "Job Description",
            userBackground: "Candidate Background",
            timeline: "Timeline",
            learning_preferences: "Learning Preferences"
        })
    }),
  },
  'linkedin-optimizer-pro': {
    id: 'linkedin-optimizer-pro',
    name: 'LinkedIn Optimizer Pro',
    description: 'Comprehensive LinkedIn profile optimization to maximize recruiter discovery and engagement.',
    longDescription: 'Analyzes and enhances all profile sections to maximize recruiter discovery, engagement, and conversion. Includes headline optimization, About section rewrite, and keyword strategy.',
    whatYouGet: ['Profile Audit Score (0-100)', 'Optimized Headline & About Section', 'Achievement-Focused Experience Bullets', 'Strategic Keyword Plan'],
    theme: { primary: 'text-blue-500', secondary: 'bg-blue-900/30', gradient: 'from-blue-600/20 to-transparent' },
    icon: LinkedInIcon,
    inputs: [
        { id: 'jobTitleTarget', label: 'Target Job Title(s)', type: 'text', placeholder: 'e.g., Product Manager, Senior PM', required: true },
        { id: 'industry', label: 'Target Industry', type: 'text', placeholder: 'e.g., B2B SaaS', required: true },
        { id: 'currentLinkedinProfile', label: 'Current LinkedIn Profile Content (Optional)', type: 'textarea', placeholder: 'Paste content from your profile for analysis.', rows: 8 },
        { id: 'userBackground', label: 'Your Resume (Optional)', type: 'textarea', placeholder: 'Paste your resume for more context.', rows: 8 },
        { id: 'jobDescription', label: 'Sample Job Description (Optional)', type: 'textarea', placeholder: 'Paste a target job description for keyword alignment.', rows: 5 },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR linkedin-optimizer-pro]...`,
        userPrompt: createUserPrompt("LinkedIn Optimizer Pro", inputs, {
            jobTitleTarget: "Target Role",
            industry: "Target Industry",
            currentLinkedinProfile: "Current Profile",
            userBackground: "Resume",
            jobDescription: "Sample Job Description",
            additionalContext: "Additional Context"
        })
    }),
  },
  'ats-optimization-checker': {
    id: 'ats-optimization-checker',
    name: 'ATS Optimization Checker',
    description: 'Comprehensive ATS compatibility analysis and optimization.',
    longDescription: 'Scans resumes against job descriptions to identify keyword gaps, formatting issues, and scoring factors to help you pass automated screening.',
    whatYouGet: ['ATS Compatibility Score (0-100)', 'Keyword Match Analysis', 'Formatting Audit', 'Prioritized Action Plan'],
    theme: { primary: 'text-emerald-400', secondary: 'bg-emerald-900/20', gradient: 'from-emerald-500/20 to-transparent' },
    icon: KeywordIcon,
    inputs: [...sharedJobSeekerInputs, additionalContextInput],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR ats-optimization-checker]...`,
        userPrompt: createUserPrompt("ATS Optimization Checker Pro", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            jobDescription: "Job Description",
            userBackground: "Candidate Background",
            additionalContext: "Additional Context"
        })
    }),
  },
  'resume-customizer': {
    id: 'resume-customizer',
    name: 'Resume Customizer Pro',
    description: 'ATS-optimized resume rewrite with before/after comparisons.',
    longDescription: 'Transforms a generic resume into a targeted, ATS-optimized document. Get a keyword heatmap, before/after bullet transformations, and an improved ATS score.',
    whatYouGet: ['Improved ATS Score', 'Keyword Heatmap', 'Before/After Bullet Rewrites', 'Skills Translation Matrix', 'Complete Optimized Resume'],
    theme: { primary: 'text-sky-400', secondary: 'bg-sky-900/20', gradient: 'from-sky-500/20 to-transparent' },
    icon: ResumeIcon,
    inputs: [...sharedJobSeekerInputs, additionalContextInput],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR resume-customizer-pro]...`,
        userPrompt: createUserPrompt("Resume Customizer Pro", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            jobDescription: "Job Description",
            userBackground: "Candidate Background",
            additionalContext: "Additional Context"
        })
    }),
  },
  'cover-letter-generator': {
    id: 'cover-letter-generator',
    name: 'Cover Letter Generator Pro',
    description: 'Creates compelling, personalized 3-4 paragraph cover letters with company-specific hooks.',
    longDescription: 'Generates personalized cover letters with company-specific hooks, quantified achievements, and strong calls-to-action, ensuring every sentence is customized to the role.',
    whatYouGet: ['Company-Specific Opening Hook', 'Achievement-Focused Paragraphs', 'Strong Call to Action', 'Cover Letter Quality Score'],
    theme: { primary: 'text-cyan-400', secondary: 'bg-cyan-900/20', gradient: 'from-cyan-500/20 to-transparent' },
    icon: CoverLetterIcon,
    inputs: [...sharedJobSeekerInputs, additionalContextInput],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR cover-letter-generator-pro]...`,
        userPrompt: createUserPrompt("Cover Letter Generator Pro", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            jobDescription: "Job Description",
            userBackground: "Candidate Background",
            additionalContext: "Additional Context (e.g., why you're interested)"
        })
    }),
  },
  'networking-script-generator': {
    id: 'networking-script-generator',
    name: 'Networking Script Generator',
    description: 'Generate personalized scripts for all networking scenarios.',
    longDescription: 'Creates authentic, effective scripts for informational interviews, LinkedIn outreach, cold emails, coffee chats, and networking events to help you build valuable professional connections.',
    whatYouGet: ['Cold Outreach Scripts (Email/LinkedIn)', 'Informational Interview Framework', 'Networking Event Scripts', 'Referral Request Templates'],
    theme: { primary: 'text-orange-400', secondary: 'bg-orange-900/20', gradient: 'from-orange-500/20 to-transparent' },
    icon: NetworkingIcon,
    inputs: [
        { id: 'networkingScenario', label: 'Networking Scenario', type: 'select', options: ['Informational Interview', 'Cold LinkedIn Outreach', 'Cold Email', 'Networking Event', 'Referral Request'], required: true },
        { id: 'targetPerson', label: 'Target Person Details', type: 'textarea', placeholder: 'Who are you connecting with? (e.g., "Jane Doe, Director of Marketing at Google, Alumni")', required: true, rows: 3 },
        { id: 'jobTitleTarget', label: 'Your Career Goal', type: 'text', placeholder: 'e.g., "Transition into Product Management"', required: true },
        { id: 'userBackground', label: 'Your Resume/Background (Optional)', type: 'textarea', placeholder: 'Paste your resume for more context.', rows: 5 },
        { id: 'specificGoal', label: 'Specific Goal (Optional)', type: 'textarea', placeholder: 'e.g., "Learn about the company culture", "Get a referral"', rows: 2 },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR networking-script-generator]...`,
        userPrompt: createUserPrompt("Networking Script Generator Pro", inputs, {
            networkingScenario: "Scenario",
            targetPerson: "Target Person",
            jobTitleTarget: "Your Goal",
            userBackground: "Your Background",
            specificGoal: "Specific Goal"
        })
    }),
  },
  'company-research': {
    id: 'company-research',
    name: 'Company Research Pro',
    description: 'Deep-dive company & competitive intelligence for interviews.',
    longDescription: 'Get a comprehensive research brief on a company, including its financials, leadership, culture, recent news, and a detailed competitive analysis to prepare you for any interview.',
    whatYouGet: ['Financial Health Analysis', 'Leadership & Culture Insights', 'Competitive Landscape Matrix', 'Product Differentiation', 'Interview Talking Points'],
    theme: { primary: 'text-teal-400', secondary: 'bg-teal-900/20', gradient: 'from-teal-500/20 to-transparent' },
    icon: CompanyResearchIcon,
    inputs: [
        { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g., Google', required: true },
        { id: 'jobTitle', label: 'Your Target Job Title (Optional)', type: 'text', placeholder: 'e.g., Senior Product Manager' },
        { id: 'jobDescription', label: 'Job Description (Optional)', type: 'textarea', placeholder: 'Content is pre-filled from home page upload.', rows: 5 },
        { id: 'researchDepth', label: 'Research Depth (Optional)', type: 'select', options: ['Quick Overview', 'Deep Dive'] },
    ],
    useGoogleSearch: true,
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR company-research-pro]...`,
        userPrompt: createUserPrompt("Company Research Pro", inputs, {
            companyName: "Company to Research",
            jobTitle: "Target Role (for context)",
            jobDescription: "Job Description (for context)",
            researchDepth: "Research Depth"
        })
    }),
  },
  'interview-prep': {
    id: 'interview-prep',
    name: 'Interview Prep Master',
    description: 'Comprehensive prep with likely questions & STAR-method answers.',
    longDescription: 'Get comprehensive interview preparation including likely questions, STAR-method answers based on your resume, company research, and strategies for handling red flags.',
    whatYouGet: ['Likely Interview Questions', 'STAR-Method Answer Frameworks', 'Your Personal Story Bank', 'Red Flag Handling Scripts', 'Questions to Ask Interviewers'],
    theme: { primary: 'text-indigo-400', secondary: 'bg-indigo-900/20', gradient: 'from-indigo-500/20 to-transparent' },
    icon: InterviewIcon,
    inputs: [
        ...sharedJobSeekerInputs,
        additionalContextInput,
        { id: 'interviewType', label: 'Interview Type (Optional)', type: 'select', options: ['Phone Screen', 'Technical', 'Behavioral', 'Case Study', 'Final Round'], placeholder: 'Select interview stage' },
        { id: 'interviewerNames', label: 'Interviewer Name(s) (Optional)', type: 'text', placeholder: 'e.g., Jane Doe, John Smith' },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR interview-prep-master]...`,
        userPrompt: createUserPrompt("Interview Prep Master", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            jobDescription: "Job Description",
            userBackground: "Candidate Background",
            additionalContext: "Additional Context",
            interviewType: "Interview Type",
            interviewerNames: "Interviewer(s)"
        })
    }),
  },
  'thank-you-note-generator': {
    id: 'thank-you-note-generator',
    name: 'Thank You Note Generator',
    description: 'Generate personalized, impactful thank you notes after job interviews.',
    longDescription: 'Creates tailored messages for each interviewer that reinforce your candidacy, address concerns raised, and leave a lasting positive impression.',
    whatYouGet: ['Unique Note for Each Interviewer', 'Concern Mitigation Language', 'Value Reinforcement Points', 'Strategic Follow-Up Plan'],
    theme: { primary: 'text-rose-400', secondary: 'bg-rose-900/20', gradient: 'from-rose-500/20 to-transparent' },
    icon: CoverLetterIcon,
    inputs: [
        { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Product Manager', required: true },
        { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g., Google', required: true },
        { id: 'interviewerDetails', label: 'Interviewer Details', type: 'textarea', placeholder: 'Enter each interviewer\'s name, title, and topics discussed on a new line.', required: true, rows: 5 },
        { id: 'interviewHighlights', label: 'Interview Highlights (Optional)', type: 'textarea', placeholder: 'Key moments, questions asked, concerns raised.', rows: 4 },
        additionalContextInput,
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR interview-thank-you-generator]...`,
        userPrompt: createUserPrompt("Thank You Note Generator Pro", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            interviewerDetails: "Interviewer Details",
            interviewHighlights: "Interview Highlights",
            additionalContext: "Additional Context"
        })
    }),
  },
  'offer-evaluation': {
    id: 'offer-evaluation-pro',
    name: 'Offer Evaluation Pro',
    description: 'Comprehensive job offer analysis and comparison toolkit.',
    longDescription: 'Evaluates total compensation, benefits, career trajectory, and quality of life factors to help make informed career decisions when comparing multiple offers.',
    whatYouGet: ['Total Compensation Calculation', 'Benefits Valuation', 'Offer Comparison Matrix', 'Career Trajectory Score'],
    theme: { primary: 'text-lime-400', secondary: 'bg-lime-900/20', gradient: 'from-lime-500/20 to-transparent' },
    icon: OfferIcon,
    inputs: [
        { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Product Manager', required: true },
        { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g., Google', required: true },
        { id: 'offerDetails', label: 'Offer Details', type: 'textarea', placeholder: 'Enter base salary, bonus, equity, etc.', required: true, rows: 5 },
        { id: 'location', label: 'Job Location', type: 'text', placeholder: 'e.g., San Francisco, CA', required: true },
        { id: 'currentCompensation', label: 'Current Compensation (Optional)', type: 'textarea', placeholder: 'For comparison purposes.', rows: 4 },
        { id: 'otherOffers', label: 'Other Offers (Optional)', type: 'textarea', placeholder: 'Enter details of competing offers.', rows: 4 },
        { id: 'careerGoals', label: 'Your Career Goals (Optional)', type: 'textarea', placeholder: 'What are your priorities? (e.g., growth, work-life balance)', rows: 3 },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR offer-evaluation-pro]...`,
        userPrompt: createUserPrompt("Offer Evaluation Pro", inputs, {
            offerDetails: "Offer Details",
            jobTitle: "Job Title",
            companyName: "Company",
            location: "Location",
            currentCompensation: "Current Compensation",
            otherOffers: "Other Offers",
            careerGoals: "Career Goals"
        })
    }),
  },
  'salary-negotiation': {
    id: 'salary-negotiation-master',
    name: 'Salary Negotiation Master',
    description: 'Comprehensive salary and compensation negotiation strategies, scripts, and tactics.',
    longDescription: 'Guides job seekers through research, preparation, and execution of salary negotiations to maximize total compensation, using proven scripts and strategies.',
    whatYouGet: ['Market Rate Analysis', 'Your Negotiating Leverage Score', 'Specific Counter-Offer Scripts', 'Objection Handling Tactics'],
    theme: { primary: 'text-yellow-400', secondary: 'bg-yellow-900/20', gradient: 'from-yellow-500/20 to-transparent' },
    icon: SalaryIcon,
    inputs: [
        { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Product Manager', required: true },
        { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g., Google', required: true },
        { id: 'offerDetails', label: 'Offer Details', type: 'textarea', placeholder: 'Enter base salary, bonus, equity offered', required: true, rows: 4 },
        { id: 'location', label: 'Job Location', type: 'text', placeholder: 'e.g., San Francisco, CA', required: true },
        { id: 'userBackground', label: 'Your Resume (Optional)', type: 'textarea', placeholder: 'Paste your resume for leverage points.', rows: 5 },
        { id: 'currentCompensation', label: 'Current Compensation (Optional)', type: 'textarea', placeholder: 'For comparison purposes.', rows: 3 },
        { id: 'competingOffers', label: 'Competing Offers (Optional)', type: 'textarea', placeholder: 'Details of other offers.', rows: 3 },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR salary-negotiation-master]...`,
        userPrompt: createUserPrompt("Salary Negotiation Master", inputs, {
            offerDetails: "Offer Details",
            jobTitle: "Job Title",
            companyName: "Company",
            location: "Location",
            userBackground: "Candidate Context",
            currentCompensation: "Current Compensation",
            competingOffers: "Competing Offers"
        })
    }),
  },
  'onboarding-accelerator': {
    id: 'onboarding-accelerator-pro',
    name: 'Onboarding Accelerator Pro',
    description: 'Comprehensive new job onboarding strategy to accelerate time-to-impact.',
    longDescription: 'Creates personalized 30-60-90 day plans, stakeholder mapping, quick win identification, and learning acceleration strategies to ensure you succeed in a new role.',
    whatYouGet: ['30-60-90 Day Plan', 'Stakeholder Map & Meeting Strategy', 'Quick Win Identification', 'Manager Alignment Framework'],
    theme: { primary: 'text-green-400', secondary: 'bg-green-900/20', gradient: 'from-green-500/20 to-transparent' },
    icon: OnboardingIcon,
    inputs: [
        { id: 'jobTitle', label: 'New Job Title', type: 'text', placeholder: 'e.g., Senior Product Manager', required: true },
        { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g., Google', required: true },
        { id: 'jobDescription', label: 'Job Description (Optional)', type: 'textarea', placeholder: 'Paste job description for more context.', rows: 5 },
        { id: 'userBackground', label: 'Your Resume (Optional)', type: 'textarea', placeholder: 'Paste your resume for context.', rows: 5 },
        { id: 'startDate', label: 'Start Date (Optional)', type: 'text', placeholder: 'e.g., 2 weeks from now' },
        { id: 'managerInfo', label: 'Manager Info (Optional)', type: 'text', placeholder: 'e.g., Jane Doe, hands-on style' },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR onboarding-accelerator-pro]...`,
        userPrompt: createUserPrompt("Onboarding Accelerator Pro", inputs, {
            jobTitle: "New Job Title",
            companyName: "Company",
            startDate: "Start Date",
            jobDescription: "Job Description",
            userBackground: "Your Background",
            managerInfo: "Manager Info"
        })
    }),
  },
  'day-in-the-life': {
    id: 'day-in-the-life-generator',
    name: 'Day in the Life Generator',
    description: 'Generate realistic, detailed narratives of what a typical workday looks like for any job role.',
    longDescription: 'Creates immersive descriptions covering daily activities, interactions, challenges, tools used, and work environment to help job seekers understand roles before applying or interviewing.',
    whatYouGet: ['Hour-by-Hour Timeline', 'Meeting & Tool Stack Overview', 'Weekly/Quarterly Rhythms', 'Unwritten Realities of the Role'],
    theme: { primary: 'text-fuchsia-400', secondary: 'bg-fuchsia-900/20', gradient: 'from-fuchsia-500/20 to-transparent' },
    icon: DayInLifeIcon,
    inputs: [
        { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Product Manager', required: true },
        { id: 'companyName', label: 'Company Name (Optional)', type: 'text', placeholder: 'e.g., Google' },
        { id: 'jobDescription', label: 'Job Description (Optional)', type: 'textarea', placeholder: 'Paste job description for more accuracy.', rows: 5 },
        { id: 'industry', label: 'Industry (Optional)', type: 'text', placeholder: 'e.g., SaaS, Healthcare, Finance' },
        { id: 'companySize', label: 'Company Size (Optional)', type: 'select', options: ['Startup (1-50)', 'SMB (51-500)', 'Enterprise (501+)'] },
        { id: 'workArrangement', label: 'Work Arrangement (Optional)', type: 'select', options: ['Remote', 'Hybrid', 'On-site'] },
        { id: 'seniorityLevel', label: 'Seniority Level (Optional)', type: 'select', options: ['Entry-level', 'Mid-level', 'Senior', 'Lead/Manager', 'Executive'] },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR day-in-the-life-generator]...`,
        userPrompt: createUserPrompt("Day in the Life Generator", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            jobDescription: "Job Description",
            industry: "Industry",
            companySize: "Company Size",
            workArrangement: "Work Arrangement",
            seniorityLevel: "Seniority Level"
        })
    }),
  },
  'role-ai-automation-analyzer': {
    id: 'role-ai-automation-analyzer',
    name: 'Role AI Automation Analyzer',
    description: 'Analyze any job description to identify AI automation opportunities and tools.',
    longDescription: 'Identifies AI automation opportunities, recommends tools to learn, and develops interview talking points that demonstrate a forward-thinking automation mindset.',
    whatYouGet: ['Automation Potential Score (0-100)', 'AI Tool Recommendations', 'Interview Talking Points', 'Future-Proofing Strategy'],
    theme: { primary: 'text-purple-400', secondary: 'bg-purple-900/20', gradient: 'from-purple-500/20 to-transparent' },
    icon: AutomationIcon,
    inputs: [
        { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Marketing Manager', required: true },
        { id: 'jobDescription', label: 'Job Description', type: 'textarea', placeholder: 'Content is pre-filled from home page upload.', required: true, rows: 10 },
        { id: 'companyName', label: 'Company Name (Optional)', type: 'text', placeholder: 'e.g., Google' },
        { id: 'industry', label: 'Industry (Optional)', type: 'text', placeholder: 'e.g., SaaS, Healthcare' },
        { id: 'userBackground', label: 'Your Resume (Optional)', type: 'textarea', placeholder: 'Paste your resume for more tailored positioning.', rows: 6 },
        additionalContextInput,
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `...[FULL PROMPT FOR role-ai-automation-analyzer]...`,
        userPrompt: createUserPrompt("Role AI Automation Analyzer", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            jobDescription: "Job Description",
            industry: "Industry",
            userBackground: "Resume",
            additionalContext: "Additional Context"
        })
    }),
  },
};
