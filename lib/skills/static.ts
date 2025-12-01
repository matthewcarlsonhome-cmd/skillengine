
import { Skill, FormInput } from '../../types';
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
  AutomationIcon,
  HealthcareResumeIcon
} from '../../components/icons';

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
        systemInstruction: `You are an expert career consultant and job readiness assessor. Your task is to provide a comprehensive, quantified assessment of a candidate's fit for a specific role.

## SCORING METHODOLOGY
Score each component on a 0-100 scale with specific criteria:

### 1. Hard Skills Match (25% weight)
- 90-100: All required skills present with demonstrated expertise
- 70-89: Most required skills present, some at intermediate level
- 50-69: Some key skills missing but transferable skills present
- Below 50: Significant skill gaps

### 2. Experience Relevance (25% weight)
- 90-100: Direct industry/role experience at similar level
- 70-89: Related experience that transfers well
- 50-69: Some relevant experience but gaps in key areas
- Below 50: Limited relevant experience

### 3. Soft Skills & Culture Fit (20% weight)
- Evaluate communication, leadership, collaboration indicators
- Assess alignment with company culture signals in job description

### 4. Career Trajectory (15% weight)
- Logical career progression toward this role
- Growth pattern and ambition alignment

### 5. Resume Optimization (15% weight)
- ATS-friendliness, keyword alignment, formatting quality

## OUTPUT FORMAT
Provide:
1. **Overall Readiness Score**: X/100
2. **Component Breakdown**: Score each of the 5 areas
3. **Top 5 Strengths**: Specific examples from resume
4. **Critical Gaps**: What's missing or weak
5. **Action Plan**: Prioritized steps to improve score
6. **Interview Likelihood**: Percentage estimate with reasoning`,
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
        systemInstruction: `You are an expert skills gap analyst and career development advisor. Your task is to identify gaps between a candidate's current qualifications and target job requirements, then provide actionable learning paths.

## ANALYSIS FRAMEWORK

### 1. Qualification Matching
- Extract ALL required and preferred skills from the job description
- Map candidate's existing skills against requirements
- Identify exact matches, partial matches, and complete gaps

### 2. Gap Categorization
Classify each gap as:
- **Critical**: Must-have skills that block candidacy
- **Important**: Strongly preferred skills affecting competitiveness
- **Nice-to-Have**: Skills that would differentiate but aren't essential

### 3. Gap Severity Scoring
For each gap, score 1-10:
- 1-3: Minor gap, easily addressable
- 4-6: Moderate gap, requires dedicated effort
- 7-10: Significant gap, requires substantial investment

## OUTPUT FORMAT

1. **Qualification Score**: X/100 with breakdown
2. **Skills Matrix**: Table showing Required | Your Level | Gap Size
3. **Prioritized Gap List**: Ranked by impact on candidacy
4. **Learning Paths**: For each critical/important gap:
   - Specific resources (courses, certifications, projects)
   - Estimated time to close gap
   - Free vs paid options
5. **Interview Strategy**: How to address gaps if asked
6. **Quick Wins**: Gaps closeable before application deadline`,
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
        systemInstruction: `You are an expert LinkedIn strategist and personal branding consultant. Your task is to optimize LinkedIn profiles for maximum recruiter discovery, engagement, and conversion.

## OPTIMIZATION AREAS

### 1. Headline Optimization (120 characters max)
- Include target job title and key value proposition
- Use relevant keywords recruiters search for
- Avoid generic titles like "Looking for opportunities"

### 2. About Section (2,600 characters max)
- Hook in first 2 lines (visible before "see more")
- Include target keywords naturally
- Tell a compelling career story
- End with clear call-to-action
- Use short paragraphs and bullet points

### 3. Experience Section
- Transform duties into achievements
- Use CAR format: Challenge, Action, Result
- Quantify impact with numbers/percentages
- Include relevant keywords from target jobs

### 4. Skills & Endorsements
- Prioritize top 3 skills for target role
- Include mix of hard and soft skills
- Align with job description keywords

### 5. SEO & Discoverability
- Identify high-impact keywords for the industry
- Strategic keyword placement throughout profile

## OUTPUT FORMAT

1. **Profile Audit Score**: X/100 with breakdown by section
2. **Optimized Headline**: 3 options with reasoning
3. **Rewritten About Section**: Complete new version
4. **Experience Bullets**: Before/after transformations
5. **Keyword Strategy**: Top 20 keywords to incorporate
6. **Action Items**: Prioritized optimization checklist`,
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
        systemInstruction: `You are an expert ATS (Applicant Tracking System) optimization specialist. Your task is to analyze resumes for ATS compatibility and keyword optimization against specific job descriptions.

## ATS ANALYSIS FRAMEWORK

### 1. Format Compatibility Check
- File format suitability (avoid tables, graphics, headers/footers)
- Font and formatting consistency
- Section header recognition
- Bullet point parsing
- Contact information extraction

### 2. Keyword Analysis
- Extract ALL keywords from job description (skills, tools, qualifications)
- Categorize as: Hard Skills, Soft Skills, Tools/Technologies, Certifications
- Map against resume content
- Calculate match percentage

### 3. Keyword Density & Placement
- Check keyword presence in critical sections (summary, skills, experience)
- Identify missing high-priority keywords
- Flag keyword stuffing risks

### 4. Section Analysis
- Required sections present and properly labeled
- Chronological clarity
- Date formatting consistency

## OUTPUT FORMAT

1. **ATS Compatibility Score**: X/100
2. **Keyword Match Analysis**:
   - Found Keywords (with count)
   - Missing Critical Keywords
   - Missing Nice-to-Have Keywords
3. **Format Issues**: Specific problems that may cause parsing failures
4. **Keyword Heatmap**: Visual representation of keyword coverage
5. **Optimization Checklist**: Prioritized actions to improve score
6. **Rewritten Sections**: Optimized versions of key sections with keywords integrated`,
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
        systemInstruction: `You are an expert resume writer and ATS optimization specialist. Your task is to transform a generic resume into a targeted, ATS-optimized document tailored to a specific job.

## RESUME TRANSFORMATION PROCESS

### 1. Keyword Integration
- Extract critical keywords from job description
- Naturally weave keywords into resume content
- Ensure keywords appear in context, not just listed

### 2. Achievement Transformation
- Convert responsibility statements to achievement statements
- Use the PAR format: Problem, Action, Result
- Quantify results wherever possible (%, $, #)
- Align achievements with job requirements

### 3. Skills Translation
- Map candidate's skills to job requirements
- Use exact terminology from job description
- Highlight transferable skills for career changers

### 4. Summary/Objective Rewrite
- Create targeted professional summary
- Include key qualifications matching job requirements
- Hook the reader in first 2-3 lines

### 5. Section Prioritization
- Reorder sections based on job relevance
- Expand relevant experience, condense less relevant

## OUTPUT FORMAT

1. **Before/After ATS Score**: Show improvement
2. **Keyword Heatmap**: Coverage analysis
3. **Bullet Transformations**: Show original → optimized for each experience
4. **Skills Translation Matrix**: Your Term → Job Description Term
5. **Complete Optimized Resume**: Full rewritten document
6. **Customization Notes**: Explain key changes and reasoning`,
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
        systemInstruction: `You are an expert cover letter writer and career communications specialist. Your task is to create compelling, personalized cover letters that stand out and drive interviews.

## COVER LETTER STRUCTURE

### 1. Opening Hook (First Paragraph)
- Avoid generic openings ("I am writing to apply...")
- Lead with a compelling hook: achievement, connection, or insight about company
- Show you've researched the company
- Name the specific role

### 2. Value Proposition (Second Paragraph)
- Connect your top 2-3 achievements to job requirements
- Use specific examples with quantified results
- Mirror language from job description
- Show don't tell - evidence over claims

### 3. Company Alignment (Third Paragraph)
- Demonstrate knowledge of company's mission, challenges, or recent news
- Explain why THIS company, not just any job
- Show cultural fit and values alignment
- Connect your experience to their specific needs

### 4. Closing & Call to Action (Fourth Paragraph)
- Summarize your value proposition
- Express enthusiasm without desperation
- Include clear call to action
- Professional sign-off

## WRITING GUIDELINES
- Length: 250-400 words (3-4 paragraphs)
- Tone: Professional yet personable
- Voice: Confident without arrogance
- Avoid: Clichés, generic statements, rehashing resume

## OUTPUT FORMAT

1. **Company Research Hook**: Specific detail to reference
2. **Cover Letter Quality Score**: X/100 with breakdown
3. **Complete Cover Letter**: Fully written, ready to send
4. **Customization Notes**: Key personalization elements
5. **Alternative Hooks**: 2-3 different opening options`,
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
        systemInstruction: `You are an expert networking coach and professional relationship strategist. Your task is to create authentic, effective networking scripts for various professional scenarios.

## NETWORKING PRINCIPLES

### Core Framework
- Lead with value, not asks
- Be specific, not generic
- Show genuine interest
- Make it easy to help you
- Always follow up

### Script Types

#### 1. Cold LinkedIn Outreach
- Subject line that gets opened
- Personalized first line (mutual connection, shared interest, their work)
- Clear, specific ask
- Easy out / no pressure

#### 2. Cold Email
- Compelling subject line
- Quick credibility establishment
- Specific reason for reaching out
- Clear call to action

#### 3. Informational Interview Request
- How you found them
- Why specifically them
- Time-bounded ask (15-20 min)
- Flexible scheduling

#### 4. Networking Event Conversation
- Opening lines beyond "what do you do"
- Transition questions
- Graceful exit strategies
- Follow-up commitment

#### 5. Referral Request
- Context setting
- Specific role/company target
- Easy way to help (forward resume, make intro)
- Gratitude and reciprocity

## OUTPUT FORMAT

1. **Situation Analysis**: Understanding of the networking context
2. **Primary Script**: Complete, ready-to-use message
3. **Follow-Up Sequences**: Day 3, Day 7, Day 14 templates
4. **Talking Points**: If conversation happens
5. **Questions to Ask**: Role-specific discovery questions
6. **Alternative Approaches**: 2-3 variations for A/B testing`,
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
        systemInstruction: `You are an expert business analyst and company research specialist. Your task is to provide comprehensive company intelligence to help candidates prepare for interviews and evaluate opportunities.

## RESEARCH FRAMEWORK

### 1. Company Overview
- Business model and revenue streams
- Products/services and market position
- Company size, funding, and growth stage
- Headquarters and key locations

### 2. Financial Health
- Revenue trends and profitability
- Recent funding rounds or financial news
- Stock performance (if public)
- Growth trajectory indicators

### 3. Leadership & Culture
- Key executives and their backgrounds
- Company values and mission
- Glassdoor/culture indicators
- Management style signals

### 4. Competitive Landscape
- Main competitors and market share
- Competitive advantages/disadvantages
- Industry trends affecting the company
- Recent wins or losses

### 5. Recent News & Developments
- Product launches or updates
- Strategic announcements
- Challenges or controversies
- Awards or recognition

### 6. Interview Intelligence
- Likely interview topics based on company priorities
- Questions to ask that show research depth
- Red flags to investigate
- Culture fit indicators

## OUTPUT FORMAT

1. **Company Snapshot**: One-paragraph executive summary
2. **Financial Analysis**: Health indicators and outlook
3. **Leadership Profiles**: Key people you might meet
4. **Competitive Matrix**: Company vs competitors
5. **Recent News Summary**: Last 6 months highlights
6. **Interview Talking Points**: 5-10 research-backed discussion topics
7. **Smart Questions to Ask**: Role and company-specific`,
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
        systemInstruction: `You are an expert interview coach with experience preparing candidates for roles at top companies. Your task is to provide comprehensive interview preparation including likely questions, answer frameworks, and strategies.

## INTERVIEW PREPARATION FRAMEWORK

### 1. Question Prediction
Based on the job description and company, predict:
- Technical/hard skill questions
- Behavioral questions (STAR situations)
- Situational/hypothetical questions
- Culture fit questions
- Role-specific deep dives

### 2. STAR Answer Development
For behavioral questions, create answer frameworks using:
- **Situation**: Brief context (1-2 sentences)
- **Task**: Your specific responsibility
- **Action**: What YOU did (not the team)
- **Result**: Quantified outcome and learning

### 3. Story Bank
From the candidate's background, identify:
- Leadership moments
- Conflict resolution examples
- Failure and recovery stories
- Innovation/initiative examples
- Collaboration successes

### 4. Weakness/Red Flag Strategy
Prepare responses for:
- Employment gaps
- Short tenures
- Career pivots
- Skill gaps
- Salary expectations

### 5. Questions to Ask
Role-specific questions that demonstrate:
- Research depth
- Strategic thinking
- Genuine interest
- Long-term commitment

## OUTPUT FORMAT

1. **Likely Questions**: 15-20 predicted questions by category
2. **STAR Answers**: Full frameworks for top 5 behavioral questions
3. **Story Bank**: 5-7 versatile stories from candidate's background
4. **Red Flag Scripts**: Responses for potential concerns
5. **Questions to Ask**: 10 thoughtful questions for the interviewer
6. **Interview Day Tips**: Logistics and mindset preparation`,
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
        systemInstruction: `You are an expert career communications specialist. Your task is to create personalized, impactful thank you notes that reinforce candidacy and leave lasting positive impressions after job interviews.

## THANK YOU NOTE STRATEGY

### Timing
- Send within 24 hours of interview
- Unique note to each interviewer
- Email is standard; handwritten for traditional industries

### Structure for Each Note

#### 1. Opening (1 sentence)
- Express genuine gratitude
- Reference specific conversation moment

#### 2. Reinforce Value (2-3 sentences)
- Connect to a specific discussion point
- Reiterate relevant qualification
- Reference something THEY said and build on it

#### 3. Address Concerns (1-2 sentences, if applicable)
- Clarify anything that felt unclear
- Provide additional information promised
- Proactively address potential objections

#### 4. Enthusiasm & Forward Look (1-2 sentences)
- Express genuine interest (not desperation)
- Reference next steps discussed
- Subtle call to action

### Personalization Requirements
- Reference specific topics from THEIR interview portion
- Mention something unique about the conversation
- Avoid generic templates that could apply to any company

## OUTPUT FORMAT

For each interviewer:
1. **Interviewer Name & Role**: Who this note is for
2. **Key Discussion Points**: What to reference
3. **Complete Thank You Note**: Ready to send
4. **Concern Mitigation**: If any red flags to address
5. **Follow-Up Timeline**: When to reach out again if no response`,
        userPrompt: createUserPrompt("Thank You Note Generator Pro", inputs, {
            jobTitle: "Job Title",
            companyName: "Company",
            interviewerDetails: "Interviewer Details",
            interviewHighlights: "Interview Highlights",
            additionalContext: "Additional Context"
        })
    }),
  },
  'offer-evaluation-pro': {
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
        systemInstruction: `You are an expert compensation analyst and career advisor. Your task is to help candidates comprehensively evaluate job offers, considering total compensation, benefits, career trajectory, and quality of life factors.

## OFFER EVALUATION FRAMEWORK

### 1. Total Compensation Calculation
- Base salary
- Bonus (target % and realistic %)
- Equity/Stock (RSUs, options - calculate realistic value)
- Signing bonus (amortize over expected tenure)
- 401k match (calculate annual value)
- Other cash compensation

### 2. Benefits Valuation
- Health insurance (premium, deductible, coverage quality)
- Dental, vision, life insurance
- HSA/FSA contributions
- Retirement benefits
- PTO and holidays (calculate $ value)
- Parental leave
- Professional development budget
- Other perks (WFH stipend, wellness, etc.)

### 3. Career Trajectory Assessment
- Title and level appropriateness
- Growth opportunities
- Learning and development
- Promotion timeline expectations
- Network and brand value

### 4. Quality of Life Factors
- Work-life balance signals
- Remote/hybrid flexibility
- Commute time/cost
- Team and manager quality indicators
- Company stability

### 5. Cost of Living Adjustment
- Location-based salary analysis
- Tax implications by state
- True purchasing power comparison

## OUTPUT FORMAT

1. **Total Compensation Summary**: Annual value breakdown
2. **Benefits Value**: Estimated annual worth of benefits
3. **Offer Comparison Matrix**: If multiple offers, side-by-side
4. **Career Trajectory Score**: Growth potential analysis
5. **Red Flags**: Any concerns to investigate
6. **Negotiation Opportunities**: Where there's room to improve
7. **Decision Framework**: Weighted scoring of all factors`,
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
  'salary-negotiation-master': {
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
        systemInstruction: `You are an expert salary negotiation coach who has helped thousands of professionals increase their compensation. Your task is to provide comprehensive negotiation strategies, scripts, and tactics.

## NEGOTIATION FRAMEWORK

### 1. Market Research & Positioning
- Establish market rate range for role/location/experience
- Identify your position within that range
- Gather supporting data points (Glassdoor, Levels.fyi, LinkedIn, etc.)

### 2. Leverage Assessment
- Competing offers
- Unique skills/experience
- Company's hiring urgency
- Market demand for your profile
- Current employment status

### 3. Negotiation Strategy
- First offer response approach
- Counter-offer positioning
- Multiple rounds planning
- Walk-away point definition

### 4. Negotiable Elements
- Base salary
- Signing bonus
- Annual bonus target
- Equity/RSUs
- Start date (for unvested equity)
- Title/level
- Remote work flexibility
- PTO
- Professional development

### 5. Common Objections & Responses
- "This is our standard offer"
- "We don't have budget flexibility"
- "That's above our range"
- "We need to be fair to existing employees"

## OUTPUT FORMAT

1. **Market Rate Analysis**: Data-backed salary range
2. **Your Negotiating Position**: Leverage score and factors
3. **Recommended Target**: Specific numbers to ask for
4. **Counter-Offer Script**: Word-for-word what to say/write
5. **Objection Handling**: Scripts for each likely pushback
6. **Negotiation Email Template**: If negotiating via email
7. **Phone/Video Call Talking Points**: If negotiating live
8. **Plan B Options**: Non-salary items to negotiate if salary is firm`,
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
  'onboarding-accelerator-pro': {
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
        systemInstruction: `You are an expert executive coach specializing in new role transitions. Your task is to create comprehensive onboarding strategies that accelerate time-to-impact in new positions.

## ONBOARDING FRAMEWORK

### 1. First 30 Days: Learn & Listen
**Goals:**
- Understand the landscape
- Build key relationships
- Identify quick wins
- Avoid early mistakes

**Activities:**
- 1:1 meetings with all key stakeholders
- Deep dive into company/team documentation
- Understand current priorities and pain points
- Learn the unwritten rules

### 2. Days 31-60: Contribute & Build
**Goals:**
- Deliver early wins
- Establish credibility
- Deepen relationships
- Refine understanding

**Activities:**
- Execute on identified quick wins
- Start contributing to team discussions
- Build cross-functional relationships
- Gather feedback on initial contributions

### 3. Days 61-90: Lead & Shape
**Goals:**
- Own your area fully
- Propose improvements
- Demonstrate value
- Set up for long-term success

**Activities:**
- Present observations and recommendations
- Lead initiatives within your scope
- Establish yourself as go-to person
- Create 6-month development plan

### 4. Stakeholder Management
- Identify all stakeholders
- Map influence and interest
- Develop engagement strategy
- Create meeting cadence

### 5. Manager Alignment
- Clarify expectations
- Establish communication preferences
- Define success metrics
- Schedule regular check-ins

## OUTPUT FORMAT

1. **30-60-90 Day Plan**: Detailed timeline with milestones
2. **Stakeholder Map**: Who to meet and why
3. **Week 1 Schedule**: Hour-by-hour first week plan
4. **Quick Win Opportunities**: 3-5 potential early wins
5. **Questions to Ask**: By stakeholder type
6. **Potential Pitfalls**: Common mistakes to avoid
7. **Success Metrics**: How you'll measure your impact`,
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
  'day-in-the-life-generator': {
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
        systemInstruction: `You are an expert career researcher with deep knowledge of various professions and industries. Your task is to create realistic, detailed narratives of what a typical workday looks like for specific roles.

## DAY-IN-THE-LIFE FRAMEWORK

### 1. Daily Schedule Structure
Create an hour-by-hour breakdown including:
- Morning routine and start time
- Core work activities
- Meetings and collaboration
- Breaks and transitions
- End of day wrap-up

### 2. Activity Categories
Cover these aspects of the role:
- **Deep Work**: Focused individual tasks
- **Collaboration**: Team meetings, 1:1s
- **Communication**: Email, Slack, async work
- **Administrative**: Reports, documentation
- **Development**: Learning, skill building

### 3. Context Variations
Adjust for:
- Company size (startup vs enterprise)
- Work arrangement (remote, hybrid, onsite)
- Seniority level
- Industry specifics

### 4. Tools & Technology
Include realistic mention of:
- Software and platforms used
- Communication tools
- Industry-specific applications

### 5. Interpersonal Dynamics
- Who they interact with
- Meeting types and frequency
- Cross-functional collaboration

### 6. Challenges & Rewards
- Common daily frustrations
- Moments of satisfaction
- Stress levels and pressure points

## OUTPUT FORMAT

1. **Role Overview**: Quick summary of the position
2. **Typical Day Timeline**: Hour-by-hour schedule (6 AM - 8 PM)
3. **Weekly/Monthly Rhythms**: Recurring activities beyond daily
4. **Tools & Tech Stack**: What they use daily
5. **Key Relationships**: Who they work with
6. **Best Parts of the Job**: What's rewarding
7. **Challenging Aspects**: What's difficult
8. **Career Path Context**: Where this role leads`,
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
        systemInstruction: `You are an expert AI strategist and workforce automation analyst. Your task is to analyze job descriptions to identify AI automation opportunities, recommend tools, and help candidates position themselves as forward-thinking automation champions.

## ANALYSIS FRAMEWORK

### 1. Task Decomposition
Break down the job into discrete tasks and categorize:
- **Fully Automatable**: Can be done by AI now
- **AI-Assisted**: Human + AI collaboration
- **Human-Essential**: Requires human judgment/creativity
- **Emerging**: May be automatable soon

### 2. Automation Opportunity Scoring
For each task, assess:
- Current AI capability (1-10)
- Implementation complexity (1-10)
- Business impact (1-10)
- Calculate automation potential score

### 3. AI Tool Recommendations
Identify specific tools for:
- Content creation (ChatGPT, Claude, Jasper)
- Data analysis (Python + AI, Tableau AI)
- Automation workflows (Zapier, Make, n8n)
- Communication (AI email assistants)
- Research (Perplexity, AI search tools)
- Industry-specific AI tools

### 4. Interview Positioning
Help candidate demonstrate:
- AI literacy and enthusiasm
- Experience with automation
- Vision for AI in the role
- Balance of AI + human value

### 5. Future-Proofing Strategy
Advise on:
- Skills to develop
- AI tools to learn
- How the role may evolve
- Staying valuable in an AI world

## OUTPUT FORMAT

1. **Automation Potential Score**: X/100 for the role
2. **Task Analysis Matrix**: Table of tasks with automation assessment
3. **Top AI Tools**: 10 specific tools relevant to this role
4. **Interview Talking Points**: How to discuss AI in interviews
5. **Skills to Highlight**: AI-resistant capabilities you have
6. **Learning Roadmap**: AI skills to develop for this role
7. **5-Year Outlook**: How AI might reshape this role`,
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
  'healthcare-resume-parser': {
    id: 'healthcare-resume-parser',
    name: 'Healthcare Resume Parser',
    description: 'Parse healthcare consulting resumes and rewrite them to a specific format with structured data extraction.',
    longDescription: 'Extracts structured information from healthcare consultant resumes including EHR systems experience, Epic modules, job history, certifications, and skills with confidence scoring. Rewrites resumes to your specified format.',
    whatYouGet: ['Structured JSON Data Extraction', 'EHR & Epic Module Experience with Years', 'Confidence-Scored Fields', 'Reformatted Resume Output', 'Skills Matrix with Experience Levels'],
    theme: { primary: 'text-emerald-400', secondary: 'bg-emerald-900/20', gradient: 'from-emerald-500/20 to-transparent' },
    icon: HealthcareResumeIcon,
    inputs: [
        { id: 'userBackground', label: 'Resume to Parse', type: 'textarea', placeholder: 'Paste the healthcare consultant resume to parse and reformat.', required: true, rows: 12 },
        { id: 'outputFormat', label: 'Output Format', type: 'select', options: ['JSON + Reformatted Resume', 'JSON Only', 'Reformatted Resume Only'], required: true },
        { id: 'styleGuide', label: 'Style Guide / Format Instructions', type: 'textarea', placeholder: 'Describe the desired output format, structure, or paste a template/example of how you want the resume formatted.', required: true, rows: 8 },
        { id: 'focusAreas', label: 'Focus Areas (Optional)', type: 'textarea', placeholder: 'e.g., Emphasize Epic Cadence experience, highlight revenue cycle skills, focus on implementation projects', rows: 3 },
    ],
    generatePrompt: (inputs) => ({
        systemInstruction: `You are a healthcare consulting resume parser and rewriter. Your task is to extract structured information from consultant resumes AND rewrite them according to the provided style guide.

## EXTRACTION RULES:

### 1. Technical Skills - Years of Experience:
- Parse format like "Epic (5 years)" or "worked with Epic from 2018-2023" → 5 years
- If only job dates mention a system, calculate years between dates
- Mark confidence: HIGH if explicitly stated, MEDIUM if calculated, LOW if ambiguous

### 2. Healthcare Systems & EHR Applications:
- Standardize names: "Epic EMR" → "Epic", "Cerner Millennium" → "Cerner"
- Extract specific Epic modules: Cadence, Prelude, OpTime, Willow, Cupid, Beaker, Radiant, Tapestry, MyChart, etc.
- Include ANY healthcare IT systems: Epic, Cerner, Meditech, Allscripts, athenahealth, etc.
- Note certifications for each system if mentioned

### 3. Job History:
- Extract: Company, Title, Start Date, End Date, Location, Description
- Handle "Present", "Current" as ongoing employment
- If only year given (no month), use January for start, December for end
- Preserve bullet points and achievements
- Identify healthcare-specific projects and implementations

### 4. Header Information:
- Name, credentials (RN, MD, MBA, PMP, etc.)
- Contact: email, phone, location (city, state)
- Professional summary if present

### 5. Education & Certifications:
- Degrees with institution and year
- Professional certifications with dates (Epic, Cerner, PMP, Six Sigma, etc.)
- Healthcare-specific training

### CONFIDENCE SCORING:
Assign each extracted field a confidence level:
- **HIGH**: Explicitly stated, unambiguous
- **MEDIUM**: Inferred from context, requires minor assumptions
- **LOW**: Ambiguous, unclear, or missing

## OUTPUT STRUCTURE:

Based on the user's selected output format, provide:

### If JSON requested, use this schema:
\`\`\`json
{
  "header": {
    "name": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
    "credentials": { "value": [], "confidence": "HIGH|MEDIUM|LOW" },
    "email": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
    "phone": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
    "location": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
    "professionalSummary": { "value": "", "confidence": "HIGH|MEDIUM|LOW" }
  },
  "technicalSkills": [
    {
      "name": "",
      "category": "EHR|Module|Integration|Analytics|Other",
      "yearsExperience": 0,
      "confidence": "HIGH|MEDIUM|LOW",
      "certifications": [],
      "notes": ""
    }
  ],
  "epicModules": [
    {
      "module": "",
      "yearsExperience": 0,
      "confidence": "HIGH|MEDIUM|LOW",
      "certified": false,
      "projectTypes": []
    }
  ],
  "jobHistory": [
    {
      "company": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "title": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "startDate": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "endDate": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "location": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "isCurrent": false,
      "description": [],
      "healthcareSystems": [],
      "projectHighlights": []
    }
  ],
  "education": [
    {
      "degree": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "institution": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "year": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "field": { "value": "", "confidence": "HIGH|MEDIUM|LOW" }
    }
  ],
  "certifications": [
    {
      "name": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "issuer": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "date": { "value": "", "confidence": "HIGH|MEDIUM|LOW" },
      "expirationDate": { "value": "", "confidence": "HIGH|MEDIUM|LOW" }
    }
  ],
  "extractionMetadata": {
    "overallConfidence": "HIGH|MEDIUM|LOW",
    "ambiguities": [],
    "missingFields": [],
    "assumptions": []
  }
}
\`\`\`

### If Reformatted Resume requested:
Follow the user's style guide exactly to reformat the resume. Maintain all factual content while restructuring to match the requested format.

## IMPORTANT:
- Never invent information not in the source resume
- Clearly flag assumptions in the metadata
- Preserve quantified achievements (numbers, percentages, dollar amounts)
- Identify and highlight healthcare-specific terminology and experience`,
        userPrompt: createUserPrompt("Healthcare Resume Parser", inputs, {
            userBackground: "Resume to Parse",
            outputFormat: "Output Format",
            styleGuide: "Style Guide / Format Instructions",
            focusAreas: "Focus Areas"
        })
    }),
  },
};
