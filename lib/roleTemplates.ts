// Role Templates - Pre-built skill bundles for common professional roles
import type { DynamicSkill } from './storage/types';

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  staticSkillIds: string[]; // IDs from SKILLS object
  dynamicSkills: Omit<DynamicSkill, 'id' | 'workspaceId' | 'version' | 'createdAt' | 'updatedAt' | 'executionCount'>[];
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  // 1. Software Engineer
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    description: 'Full-stack development, code review, technical documentation, and engineering best practices.',
    icon: 'Code2',
    color: 'text-blue-500',
    staticSkillIds: [
      'job-readiness-score',
      'skills-gap-analyzer',
      'interview-prep',
      'salary-negotiation-master',
      'linkedin-optimizer-pro',
    ],
    dynamicSkills: [
      {
        name: 'Code Review Assistant',
        description: 'Analyze code for bugs, security issues, and best practices.',
        longDescription: 'Provides comprehensive code review including bug detection, security vulnerabilities, performance optimizations, and adherence to coding standards.',
        category: 'analysis',
        estimatedTimeSaved: '30-60 min per review',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'Code2',
        },
        inputs: [
          { id: 'code', label: 'Code to Review', type: 'textarea', placeholder: 'Paste your code here...', validation: { required: true } },
          { id: 'language', label: 'Programming Language', type: 'select', options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Other'] },
          { id: 'context', label: 'Context (Optional)', type: 'textarea', placeholder: 'What does this code do? Any specific concerns?' },
        ],
        prompts: {
          systemInstruction: `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization. Analyze the provided code and give actionable feedback.

Your review should cover:
1. **Bugs & Logic Errors**: Identify potential bugs or incorrect logic
2. **Security Issues**: Flag any security vulnerabilities (injection, XSS, etc.)
3. **Performance**: Suggest optimizations for better performance
4. **Code Quality**: Check naming conventions, readability, DRY principles
5. **Best Practices**: Recommend industry standards and patterns

Format your response with clear sections and provide specific line references where applicable.`,
          userPromptTemplate: `Please review the following {{language}} code:

\`\`\`
{{code}}
\`\`\`

{{#if context}}
Additional context: {{context}}
{{/if}}

Provide a thorough code review with actionable feedback.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
      {
        name: 'Technical Documentation Generator',
        description: 'Generate comprehensive technical documentation from code or specifications.',
        longDescription: 'Creates README files, API documentation, architecture docs, and inline comments from your code or project specifications.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per document',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'docType', label: 'Documentation Type', type: 'select', options: ['README', 'API Documentation', 'Architecture Overview', 'Setup Guide', 'Contributing Guide'], validation: { required: true } },
          { id: 'projectInfo', label: 'Project/Code Information', type: 'textarea', placeholder: 'Paste code, describe your project, or provide existing docs to improve...', validation: { required: true } },
          { id: 'audience', label: 'Target Audience', type: 'select', options: ['Developers', 'End Users', 'DevOps/SRE', 'All'] },
        ],
        prompts: {
          systemInstruction: `You are a technical writer specializing in software documentation. Create clear, comprehensive, and well-structured documentation that follows industry best practices.

Documentation principles:
- Start with a clear overview/purpose
- Use consistent formatting and headings
- Include practical examples
- Cover edge cases and troubleshooting
- Make it scannable with bullet points and tables where appropriate`,
          userPromptTemplate: `Create a {{docType}} document based on the following information:

{{projectInfo}}

Target audience: {{audience}}

Generate comprehensive, well-structured documentation.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'System Design Helper',
        description: 'Get guidance on system architecture and design decisions.',
        longDescription: 'Helps you think through system design problems, scalability concerns, and architectural trade-offs for technical interviews or real projects.',
        category: 'analysis',
        estimatedTimeSaved: '2-4 hours research',
        theme: {
          primary: 'text-purple-400',
          secondary: 'bg-purple-900/20',
          gradient: 'from-purple-500/20 to-transparent',
          iconName: 'Network',
        },
        inputs: [
          { id: 'problem', label: 'System/Problem Description', type: 'textarea', placeholder: 'Describe the system you need to design (e.g., "Design a URL shortener like bit.ly")', validation: { required: true } },
          { id: 'constraints', label: 'Requirements & Constraints', type: 'textarea', placeholder: 'Scale expectations, latency requirements, budget constraints...' },
          { id: 'focus', label: 'Focus Areas', type: 'select', options: ['Full Design', 'Scalability', 'Database Design', 'API Design', 'Caching Strategy', 'Security'] },
        ],
        prompts: {
          systemInstruction: `You are a senior systems architect with experience designing large-scale distributed systems. Help analyze system design problems and provide well-reasoned architectural recommendations.

Cover these aspects as relevant:
1. Requirements clarification
2. High-level design with components
3. Database schema and storage decisions
4. API design
5. Scalability considerations
6. Trade-offs and alternatives
7. Potential bottlenecks and solutions`,
          userPromptTemplate: `Help me design a system for the following:

**Problem**: {{problem}}

**Requirements/Constraints**: {{constraints}}

**Focus Area**: {{focus}}

Provide a comprehensive system design analysis.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 2. Business Analyst
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    description: 'Requirements gathering, process analysis, stakeholder communication, and data-driven insights.',
    icon: 'BarChart3',
    color: 'text-emerald-500',
    staticSkillIds: [
      'job-readiness-score',
      'skills-gap-analyzer',
      'interview-prep',
      'company-research',
      'networking-script-generator',
    ],
    dynamicSkills: [
      {
        name: 'Requirements Document Generator',
        description: 'Create comprehensive BRD/PRD documents from meeting notes or descriptions.',
        longDescription: 'Transforms rough notes, stakeholder feedback, or verbal descriptions into structured business or product requirements documents.',
        category: 'generation',
        estimatedTimeSaved: '2-4 hours per document',
        theme: {
          primary: 'text-emerald-400',
          secondary: 'bg-emerald-900/20',
          gradient: 'from-emerald-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'docType', label: 'Document Type', type: 'select', options: ['Business Requirements (BRD)', 'Product Requirements (PRD)', 'Functional Specification', 'User Stories'], validation: { required: true } },
          { id: 'rawInput', label: 'Raw Information', type: 'textarea', placeholder: 'Paste meeting notes, stakeholder feedback, or describe the requirements...', validation: { required: true } },
          { id: 'projectContext', label: 'Project Context', type: 'textarea', placeholder: 'Background on the project, existing systems, constraints...' },
        ],
        prompts: {
          systemInstruction: `You are an experienced Business Analyst skilled at transforming unstructured information into clear, actionable requirements documents.

Follow these principles:
- Use clear, unambiguous language
- Include acceptance criteria for each requirement
- Identify assumptions and dependencies
- Prioritize requirements (MoSCoW or similar)
- Include relevant diagrams descriptions where helpful`,
          userPromptTemplate: `Create a {{docType}} from the following information:

**Raw Input/Notes**:
{{rawInput}}

**Project Context**:
{{projectContext}}

Generate a comprehensive, well-structured requirements document.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
      {
        name: 'Process Flow Analyzer',
        description: 'Analyze business processes and identify optimization opportunities.',
        longDescription: 'Maps current-state processes, identifies bottlenecks and inefficiencies, and recommends improvements with estimated impact.',
        category: 'analysis',
        estimatedTimeSaved: '3-5 hours of analysis',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'GitBranch',
        },
        inputs: [
          { id: 'processDescription', label: 'Process Description', type: 'textarea', placeholder: 'Describe the current process step by step...', validation: { required: true } },
          { id: 'painPoints', label: 'Known Pain Points (Optional)', type: 'textarea', placeholder: 'What issues have been reported? Where are delays?' },
          { id: 'goals', label: 'Optimization Goals', type: 'select', options: ['Reduce Time', 'Reduce Cost', 'Improve Quality', 'Increase Automation', 'All of the Above'] },
        ],
        prompts: {
          systemInstruction: `You are a process improvement expert with Six Sigma and Lean methodology expertise. Analyze business processes to identify inefficiencies and recommend optimizations.

Your analysis should include:
1. Current state process map (described in text)
2. Identified bottlenecks and waste
3. Root cause analysis
4. Recommended improvements (quick wins and strategic)
5. Expected impact and ROI estimates
6. Implementation considerations`,
          userPromptTemplate: `Analyze the following business process:

**Current Process**:
{{processDescription}}

**Known Pain Points**:
{{painPoints}}

**Optimization Goal**: {{goals}}

Provide a comprehensive process analysis with actionable recommendations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Stakeholder Communication Drafter',
        description: 'Draft professional communications for different stakeholder audiences.',
        longDescription: 'Creates tailored communications including status updates, executive summaries, change requests, and project updates for various audiences.',
        category: 'communication',
        estimatedTimeSaved: '30-60 min per communication',
        theme: {
          primary: 'text-orange-400',
          secondary: 'bg-orange-900/20',
          gradient: 'from-orange-500/20 to-transparent',
          iconName: 'Mail',
        },
        inputs: [
          { id: 'commType', label: 'Communication Type', type: 'select', options: ['Executive Summary', 'Status Update', 'Change Request', 'Risk Escalation', 'Project Kickoff', 'Meeting Minutes'], validation: { required: true } },
          { id: 'audience', label: 'Target Audience', type: 'select', options: ['C-Suite', 'Project Sponsors', 'Technical Team', 'Business Users', 'Mixed Audience'], validation: { required: true } },
          { id: 'content', label: 'Key Information', type: 'textarea', placeholder: 'What needs to be communicated? Include facts, figures, concerns...', validation: { required: true } },
          { id: 'tone', label: 'Tone', type: 'select', options: ['Formal', 'Professional', 'Urgent', 'Positive/Celebratory'] },
        ],
        prompts: {
          systemInstruction: `You are an expert business communicator who excels at tailoring messages for different audiences. Create clear, professional communications that get the right message to the right people.

Communication principles:
- Lead with the most important information
- Tailor complexity to audience
- Be clear about any asks or action items
- Use data to support points
- Keep it concise but complete`,
          userPromptTemplate: `Draft a {{commType}} for {{audience}} stakeholders.

**Key Information**:
{{content}}

**Tone**: {{tone}}

Create a professional, well-structured communication.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.4,
        },
      },
    ],
  },

  // 3. Marketing Specialist
  {
    id: 'marketing-specialist',
    name: 'Marketing Specialist',
    description: 'Content creation, campaign optimization, social media management, and marketing analytics.',
    icon: 'Megaphone',
    color: 'text-pink-500',
    staticSkillIds: [
      'job-readiness-score',
      'linkedin-optimizer-pro',
      'cover-letter-generator',
      'networking-script-generator',
      'interview-prep',
    ],
    dynamicSkills: [
      {
        name: 'Social Media Content Generator',
        description: 'Create engaging social media posts for multiple platforms.',
        longDescription: 'Generates platform-optimized content for LinkedIn, Twitter/X, Instagram, Facebook, and TikTok with hashtags and engagement hooks.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per content batch',
        theme: {
          primary: 'text-pink-400',
          secondary: 'bg-pink-900/20',
          gradient: 'from-pink-500/20 to-transparent',
          iconName: 'Share2',
        },
        inputs: [
          { id: 'platform', label: 'Platform', type: 'select', options: ['LinkedIn', 'Twitter/X', 'Instagram', 'Facebook', 'TikTok', 'All Platforms'], validation: { required: true } },
          { id: 'topic', label: 'Topic/Message', type: 'textarea', placeholder: 'What do you want to communicate?', validation: { required: true } },
          { id: 'tone', label: 'Brand Voice', type: 'select', options: ['Professional', 'Casual/Friendly', 'Witty/Humorous', 'Inspirational', 'Educational'] },
          { id: 'cta', label: 'Call to Action (Optional)', type: 'text', placeholder: 'e.g., Visit our website, Sign up now' },
        ],
        prompts: {
          systemInstruction: `You are a social media marketing expert who creates viral, engaging content. Understand platform-specific best practices and create content that drives engagement.

Platform guidelines:
- LinkedIn: Professional, thought leadership, 1300 char max
- Twitter/X: Punchy, conversational, 280 char max
- Instagram: Visual-first captions, emoji-friendly, hashtag heavy
- Facebook: Conversational, community-focused
- TikTok: Trendy, hook in first 3 seconds, casual`,
          userPromptTemplate: `Create social media content for {{platform}}.

**Topic/Message**: {{topic}}

**Brand Voice**: {{tone}}

{{#if cta}}**Call to Action**: {{cta}}{{/if}}

Generate engaging, platform-optimized content with relevant hashtags.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.7,
        },
      },
      {
        name: 'Email Campaign Writer',
        description: 'Create compelling email sequences for marketing campaigns.',
        longDescription: 'Generates email subject lines, body copy, and CTAs optimized for open rates and conversions across welcome sequences, promotions, and nurture campaigns.',
        category: 'generation',
        estimatedTimeSaved: '2-3 hours per campaign',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'Mail',
        },
        inputs: [
          { id: 'campaignType', label: 'Campaign Type', type: 'select', options: ['Welcome Sequence', 'Product Launch', 'Promotional Sale', 'Newsletter', 'Re-engagement', 'Event Invitation'], validation: { required: true } },
          { id: 'product', label: 'Product/Service', type: 'textarea', placeholder: 'Describe what you\'re promoting...', validation: { required: true } },
          { id: 'audience', label: 'Target Audience', type: 'textarea', placeholder: 'Who is this email for?' },
          { id: 'emailCount', label: 'Number of Emails', type: 'select', options: ['Single Email', '3-Email Sequence', '5-Email Sequence', '7-Email Sequence'] },
        ],
        prompts: {
          systemInstruction: `You are an email marketing expert who writes high-converting email campaigns. Create compelling emails that get opened, read, and drive action.

Email best practices:
- Subject lines: 6-10 words, create curiosity or urgency
- Preview text: Complement the subject line
- Opening: Hook within first line
- Body: Benefits over features, scannable
- CTA: Clear, single focus, action-oriented`,
          userPromptTemplate: `Create a {{campaignType}} email campaign ({{emailCount}}).

**Product/Service**: {{product}}

**Target Audience**: {{audience}}

Generate compelling emails with subject lines, preview text, body copy, and CTAs.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.6,
        },
      },
      {
        name: 'SEO Content Optimizer',
        description: 'Optimize content for search engines while maintaining readability.',
        longDescription: 'Analyzes and improves content for SEO including keyword integration, meta descriptions, headers, and readability scores.',
        category: 'optimization',
        estimatedTimeSaved: '1-2 hours per piece',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'Search',
        },
        inputs: [
          { id: 'content', label: 'Content to Optimize', type: 'textarea', placeholder: 'Paste your article or page content...', validation: { required: true } },
          { id: 'targetKeyword', label: 'Target Keyword', type: 'text', placeholder: 'Primary keyword to rank for', validation: { required: true } },
          { id: 'secondaryKeywords', label: 'Secondary Keywords (Optional)', type: 'text', placeholder: 'Comma-separated list of related keywords' },
          { id: 'contentType', label: 'Content Type', type: 'select', options: ['Blog Post', 'Landing Page', 'Product Page', 'Service Page'] },
        ],
        prompts: {
          systemInstruction: `You are an SEO expert who optimizes content for search rankings while maintaining excellent readability. Balance keyword optimization with natural, engaging writing.

SEO optimization checklist:
- Keyword in title, H1, first paragraph
- Natural keyword density (1-2%)
- Optimized meta title (50-60 chars) and description (150-160 chars)
- Header hierarchy (H2, H3)
- Internal/external linking suggestions
- Readability improvements`,
          userPromptTemplate: `Optimize this content for SEO:

**Content**:
{{content}}

**Target Keyword**: {{targetKeyword}}
**Secondary Keywords**: {{secondaryKeywords}}
**Content Type**: {{contentType}}

Provide optimized content with SEO recommendations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 4. Marketing Manager
  {
    id: 'marketing-manager',
    name: 'Marketing Manager',
    description: 'Strategic planning, team leadership, campaign management, and marketing analytics.',
    icon: 'TrendingUp',
    color: 'text-violet-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'company-research',
      'salary-negotiation-master',
    ],
    dynamicSkills: [
      {
        name: 'Marketing Strategy Generator',
        description: 'Develop comprehensive marketing strategies and plans.',
        longDescription: 'Creates detailed marketing strategies including market analysis, positioning, channel mix, budget allocation, and KPIs.',
        category: 'generation',
        estimatedTimeSaved: '4-8 hours per strategy',
        theme: {
          primary: 'text-violet-400',
          secondary: 'bg-violet-900/20',
          gradient: 'from-violet-500/20 to-transparent',
          iconName: 'Target',
        },
        inputs: [
          { id: 'product', label: 'Product/Service', type: 'textarea', placeholder: 'Describe your product or service...', validation: { required: true } },
          { id: 'targetMarket', label: 'Target Market', type: 'textarea', placeholder: 'Who is your ideal customer?', validation: { required: true } },
          { id: 'budget', label: 'Budget Range', type: 'select', options: ['Under $10K', '$10K-$50K', '$50K-$100K', '$100K-$500K', '$500K+'] },
          { id: 'timeline', label: 'Campaign Timeline', type: 'select', options: ['1 Month', 'Quarter', '6 Months', 'Annual'] },
          { id: 'goals', label: 'Primary Goals', type: 'textarea', placeholder: 'What do you want to achieve? (awareness, leads, sales)' },
        ],
        prompts: {
          systemInstruction: `You are a senior marketing strategist with experience across B2B and B2C. Create comprehensive marketing strategies that drive measurable results.

Strategy components:
1. Situation analysis (market, competition, SWOT)
2. Target audience personas
3. Positioning and messaging
4. Channel strategy with budget allocation
5. Campaign calendar
6. KPIs and measurement framework
7. Risk mitigation`,
          userPromptTemplate: `Develop a marketing strategy for:

**Product/Service**: {{product}}
**Target Market**: {{targetMarket}}
**Budget**: {{budget}}
**Timeline**: {{timeline}}
**Goals**: {{goals}}

Create a comprehensive, actionable marketing strategy.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.5,
        },
      },
      {
        name: 'Campaign Performance Analyzer',
        description: 'Analyze marketing campaign data and generate insights.',
        longDescription: 'Interprets campaign metrics, identifies trends, calculates ROI, and provides actionable recommendations for optimization.',
        category: 'analysis',
        estimatedTimeSaved: '2-4 hours per analysis',
        theme: {
          primary: 'text-cyan-400',
          secondary: 'bg-cyan-900/20',
          gradient: 'from-cyan-500/20 to-transparent',
          iconName: 'BarChart3',
        },
        inputs: [
          { id: 'metrics', label: 'Campaign Metrics', type: 'textarea', placeholder: 'Paste your campaign data (impressions, clicks, conversions, spend, etc.)', validation: { required: true } },
          { id: 'campaignType', label: 'Campaign Type', type: 'select', options: ['Paid Social', 'Paid Search', 'Email', 'Content Marketing', 'Influencer', 'Multi-Channel'] },
          { id: 'goals', label: 'Campaign Goals', type: 'textarea', placeholder: 'What were the objectives? What\'s the benchmark?' },
          { id: 'timeframe', label: 'Time Period', type: 'text', placeholder: 'e.g., Q1 2024, Last 30 days' },
        ],
        prompts: {
          systemInstruction: `You are a marketing analytics expert who transforms data into actionable insights. Analyze campaign performance and provide clear recommendations.

Analysis framework:
1. Performance summary vs goals
2. Key metrics breakdown
3. Trend analysis
4. Audience insights
5. Channel/creative performance
6. ROI calculation
7. Optimization recommendations
8. A/B test suggestions`,
          userPromptTemplate: `Analyze this {{campaignType}} campaign performance:

**Metrics**:
{{metrics}}

**Campaign Goals**: {{goals}}
**Time Period**: {{timeframe}}

Provide comprehensive analysis with actionable insights.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
      {
        name: 'Competitor Analysis Report',
        description: 'Generate detailed competitive analysis reports.',
        longDescription: 'Analyzes competitor positioning, messaging, channels, and strategies to identify opportunities and threats.',
        category: 'analysis',
        estimatedTimeSaved: '3-6 hours per report',
        theme: {
          primary: 'text-red-400',
          secondary: 'bg-red-900/20',
          gradient: 'from-red-500/20 to-transparent',
          iconName: 'Users',
        },
        inputs: [
          { id: 'yourCompany', label: 'Your Company/Product', type: 'textarea', placeholder: 'Describe your offering...', validation: { required: true } },
          { id: 'competitors', label: 'Competitors to Analyze', type: 'textarea', placeholder: 'List competitors and any info you have about them...', validation: { required: true } },
          { id: 'focusAreas', label: 'Focus Areas', type: 'select', options: ['Full Analysis', 'Pricing', 'Messaging/Positioning', 'Product Features', 'Marketing Channels'] },
        ],
        prompts: {
          systemInstruction: `You are a competitive intelligence analyst. Create thorough competitor analyses that reveal strategic opportunities.

Analysis framework:
1. Competitor overview and positioning
2. Product/service comparison
3. Pricing analysis
4. Marketing channel assessment
5. Messaging and content strategy
6. Strengths and weaknesses
7. Market positioning map
8. Strategic recommendations`,
          userPromptTemplate: `Create a competitor analysis:

**Your Company/Product**: {{yourCompany}}

**Competitors**: {{competitors}}

**Focus**: {{focusAreas}}

Generate a comprehensive competitive analysis report.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 5. Creative Director
  {
    id: 'creative-director',
    name: 'Creative Director',
    description: 'Brand strategy, creative campaigns, visual direction, and team leadership.',
    icon: 'Palette',
    color: 'text-orange-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'company-research',
      'networking-script-generator',
    ],
    dynamicSkills: [
      {
        name: 'Creative Brief Generator',
        description: 'Create comprehensive creative briefs for campaigns and projects.',
        longDescription: 'Generates detailed creative briefs including objectives, target audience, key messages, tone, deliverables, and success metrics.',
        category: 'generation',
        estimatedTimeSaved: '2-3 hours per brief',
        theme: {
          primary: 'text-orange-400',
          secondary: 'bg-orange-900/20',
          gradient: 'from-orange-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'project', label: 'Project/Campaign Name', type: 'text', placeholder: 'e.g., Summer Product Launch', validation: { required: true } },
          { id: 'background', label: 'Background & Objectives', type: 'textarea', placeholder: 'What is this project about? What are we trying to achieve?', validation: { required: true } },
          { id: 'audience', label: 'Target Audience', type: 'textarea', placeholder: 'Who are we talking to?' },
          { id: 'deliverables', label: 'Required Deliverables', type: 'textarea', placeholder: 'What needs to be created? (video, print, digital, etc.)' },
          { id: 'budget', label: 'Budget & Timeline', type: 'text', placeholder: 'e.g., $50K, 6 weeks' },
        ],
        prompts: {
          systemInstruction: `You are an experienced Creative Director who writes clear, inspiring creative briefs that set teams up for success.

Brief components:
1. Project overview and background
2. Business objectives
3. Target audience insights
4. Key message and supporting points
5. Tone and manner
6. Mandatory elements/constraints
7. Deliverables list with specs
8. Timeline and milestones
9. Success metrics
10. Inspiration and references section`,
          userPromptTemplate: `Create a creative brief for:

**Project**: {{project}}
**Background & Objectives**: {{background}}
**Target Audience**: {{audience}}
**Deliverables**: {{deliverables}}
**Budget & Timeline**: {{budget}}

Generate a comprehensive creative brief that inspires great work.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.5,
        },
      },
      {
        name: 'Brand Voice Guide Creator',
        description: 'Develop comprehensive brand voice and tone guidelines.',
        longDescription: 'Creates detailed brand voice documentation including personality, tone variations, do\'s and don\'ts, and example copy.',
        category: 'generation',
        estimatedTimeSaved: '4-8 hours per guide',
        theme: {
          primary: 'text-purple-400',
          secondary: 'bg-purple-900/20',
          gradient: 'from-purple-500/20 to-transparent',
          iconName: 'MessageSquare',
        },
        inputs: [
          { id: 'brandName', label: 'Brand Name', type: 'text', placeholder: 'Your brand name', validation: { required: true } },
          { id: 'brandDescription', label: 'Brand Description', type: 'textarea', placeholder: 'What does your brand do? What are its values?', validation: { required: true } },
          { id: 'audience', label: 'Target Audience', type: 'textarea', placeholder: 'Who does your brand speak to?' },
          { id: 'competitors', label: 'Competitor Voices to Differentiate From', type: 'textarea', placeholder: 'How do competitors sound? How should you be different?' },
          { id: 'adjectives', label: 'Brand Personality Adjectives', type: 'text', placeholder: 'e.g., Bold, Friendly, Expert, Playful' },
        ],
        prompts: {
          systemInstruction: `You are a brand strategist specializing in voice and tone development. Create comprehensive voice guidelines that ensure consistent, compelling communication.

Guide components:
1. Brand voice overview
2. Personality traits (with scales)
3. Tone variations by context
4. Word choice guidelines
5. Grammar and style rules
6. Do's and Don'ts
7. Example copy for different channels
8. Voice checklist for writers`,
          userPromptTemplate: `Create a brand voice guide for:

**Brand**: {{brandName}}
**Description**: {{brandDescription}}
**Audience**: {{audience}}
**Differentiation**: {{competitors}}
**Personality**: {{adjectives}}

Generate a comprehensive brand voice and tone guide.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.5,
        },
      },
      {
        name: 'Campaign Concept Generator',
        description: 'Generate creative campaign concepts and big ideas.',
        longDescription: 'Brainstorms multiple creative campaign concepts with taglines, visual directions, and activation ideas.',
        category: 'generation',
        estimatedTimeSaved: '3-6 hours brainstorming',
        theme: {
          primary: 'text-yellow-400',
          secondary: 'bg-yellow-900/20',
          gradient: 'from-yellow-500/20 to-transparent',
          iconName: 'Lightbulb',
        },
        inputs: [
          { id: 'brief', label: 'Campaign Brief/Objective', type: 'textarea', placeholder: 'What is the campaign trying to achieve?', validation: { required: true } },
          { id: 'brand', label: 'Brand & Product', type: 'textarea', placeholder: 'Describe the brand and product/service' },
          { id: 'audience', label: 'Target Audience', type: 'textarea', placeholder: 'Who are we trying to reach and move?' },
          { id: 'channels', label: 'Primary Channels', type: 'text', placeholder: 'e.g., Social, TV, OOH, Digital' },
          { id: 'constraints', label: 'Constraints/Mandatories', type: 'textarea', placeholder: 'Budget, timeline, brand guidelines, etc.' },
        ],
        prompts: {
          systemInstruction: `You are an award-winning Creative Director known for breakthrough campaign ideas. Generate multiple creative concepts that are strategic, memorable, and executable.

For each concept include:
1. Big idea/insight
2. Tagline options
3. Visual direction description
4. Key executions by channel
5. Hero activation idea
6. Why it will work (strategy link)`,
          userPromptTemplate: `Generate campaign concepts for:

**Objective**: {{brief}}
**Brand & Product**: {{brand}}
**Audience**: {{audience}}
**Channels**: {{channels}}
**Constraints**: {{constraints}}

Provide 3-4 distinct creative concepts with full detail.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.8,
        },
      },
    ],
  },

  // 6. Product Manager
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Product strategy, roadmap planning, stakeholder management, and user research synthesis.',
    icon: 'Package',
    color: 'text-indigo-500',
    staticSkillIds: [
      'job-readiness-score',
      'skills-gap-analyzer',
      'interview-prep',
      'company-research',
      'salary-negotiation-master',
    ],
    dynamicSkills: [
      {
        name: 'PRD Generator',
        description: 'Create comprehensive Product Requirements Documents.',
        longDescription: 'Generates detailed PRDs including problem statement, user stories, requirements, success metrics, and technical considerations.',
        category: 'generation',
        estimatedTimeSaved: '3-5 hours per PRD',
        theme: {
          primary: 'text-indigo-400',
          secondary: 'bg-indigo-900/20',
          gradient: 'from-indigo-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'feature', label: 'Feature/Product Name', type: 'text', placeholder: 'e.g., User Dashboard Redesign', validation: { required: true } },
          { id: 'problem', label: 'Problem Statement', type: 'textarea', placeholder: 'What problem are we solving? Who has this problem?', validation: { required: true } },
          { id: 'solution', label: 'Proposed Solution', type: 'textarea', placeholder: 'High-level description of the solution' },
          { id: 'metrics', label: 'Success Metrics', type: 'textarea', placeholder: 'How will we measure success?' },
          { id: 'constraints', label: 'Constraints & Dependencies', type: 'textarea', placeholder: 'Technical constraints, dependencies, timeline...' },
        ],
        prompts: {
          systemInstruction: `You are a senior Product Manager skilled at writing clear, comprehensive PRDs. Create documents that align stakeholders and guide engineering teams.

PRD structure:
1. Executive Summary
2. Problem Statement & Opportunity
3. Goals and Success Metrics
4. User Personas & Use Cases
5. User Stories with Acceptance Criteria
6. Functional Requirements
7. Non-functional Requirements
8. UX/Design Considerations
9. Technical Considerations
10. Dependencies & Risks
11. Launch Plan
12. Future Considerations`,
          userPromptTemplate: `Create a PRD for:

**Feature**: {{feature}}
**Problem**: {{problem}}
**Solution**: {{solution}}
**Success Metrics**: {{metrics}}
**Constraints**: {{constraints}}

Generate a comprehensive Product Requirements Document.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'User Research Synthesizer',
        description: 'Synthesize user research into actionable insights.',
        longDescription: 'Analyzes user interview transcripts, survey data, and feedback to identify patterns, insights, and product recommendations.',
        category: 'analysis',
        estimatedTimeSaved: '4-8 hours of synthesis',
        theme: {
          primary: 'text-teal-400',
          secondary: 'bg-teal-900/20',
          gradient: 'from-teal-500/20 to-transparent',
          iconName: 'Users',
        },
        inputs: [
          { id: 'researchData', label: 'Research Data', type: 'textarea', placeholder: 'Paste interview transcripts, survey responses, or user feedback...', validation: { required: true } },
          { id: 'researchGoal', label: 'Research Goal', type: 'textarea', placeholder: 'What were you trying to learn?' },
          { id: 'researchType', label: 'Research Type', type: 'select', options: ['User Interviews', 'Survey Results', 'Usability Testing', 'Customer Feedback', 'Mixed Methods'] },
        ],
        prompts: {
          systemInstruction: `You are a UX researcher expert at synthesizing qualitative and quantitative data into actionable product insights.

Synthesis framework:
1. Research summary and methodology
2. Key themes and patterns
3. User quotes that illustrate insights
4. Pain points (prioritized)
5. Unmet needs and opportunities
6. Persona refinements
7. Product recommendations
8. Questions for further research`,
          userPromptTemplate: `Synthesize this {{researchType}} data:

**Research Goal**: {{researchGoal}}

**Data**:
{{researchData}}

Provide comprehensive research synthesis with actionable insights.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Feature Prioritization Framework',
        description: 'Prioritize features using proven frameworks.',
        longDescription: 'Applies RICE, ICE, MoSCoW, or value/effort frameworks to prioritize a list of features with clear rationale.',
        category: 'analysis',
        estimatedTimeSaved: '2-4 hours per prioritization',
        theme: {
          primary: 'text-amber-400',
          secondary: 'bg-amber-900/20',
          gradient: 'from-amber-500/20 to-transparent',
          iconName: 'ListOrdered',
        },
        inputs: [
          { id: 'features', label: 'Features to Prioritize', type: 'textarea', placeholder: 'List features with brief descriptions...', validation: { required: true } },
          { id: 'framework', label: 'Prioritization Framework', type: 'select', options: ['RICE (Reach, Impact, Confidence, Effort)', 'ICE (Impact, Confidence, Ease)', 'Value vs Effort', 'MoSCoW', 'Kano Model'], validation: { required: true } },
          { id: 'context', label: 'Business Context', type: 'textarea', placeholder: 'Current goals, resources, constraints...' },
        ],
        prompts: {
          systemInstruction: `You are a product strategy expert who helps teams make data-driven prioritization decisions. Apply frameworks rigorously and explain your reasoning.

For each framework:
- RICE: Score Reach (users/quarter), Impact (0.25-3x), Confidence (%), Effort (person-months)
- ICE: Score Impact, Confidence, Ease (1-10 each)
- Value/Effort: Plot on 2x2 matrix
- MoSCoW: Categorize as Must/Should/Could/Won't
- Kano: Categorize as Basic/Performance/Delighter`,
          userPromptTemplate: `Prioritize these features using {{framework}}:

**Features**:
{{features}}

**Context**: {{context}}

Provide detailed prioritization with scores, rationale, and final ranking.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
    ],
  },

  // 7. Data Analyst
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Data visualization, SQL queries, statistical analysis, and business intelligence.',
    icon: 'PieChart',
    color: 'text-cyan-500',
    staticSkillIds: [
      'job-readiness-score',
      'skills-gap-analyzer',
      'interview-prep',
      'linkedin-optimizer-pro',
      'role-ai-automation-analyzer',
    ],
    dynamicSkills: [
      {
        name: 'SQL Query Generator',
        description: 'Generate SQL queries from natural language descriptions.',
        longDescription: 'Converts plain English data questions into optimized SQL queries with explanations.',
        category: 'generation',
        estimatedTimeSaved: '15-30 min per query',
        theme: {
          primary: 'text-cyan-400',
          secondary: 'bg-cyan-900/20',
          gradient: 'from-cyan-500/20 to-transparent',
          iconName: 'Database',
        },
        inputs: [
          { id: 'question', label: 'What data do you need?', type: 'textarea', placeholder: 'Describe in plain English what you want to query...', validation: { required: true } },
          { id: 'schema', label: 'Table Schema (Optional)', type: 'textarea', placeholder: 'Describe your tables and columns...' },
          { id: 'dialect', label: 'SQL Dialect', type: 'select', options: ['PostgreSQL', 'MySQL', 'SQL Server', 'BigQuery', 'Snowflake', 'SQLite'] },
        ],
        prompts: {
          systemInstruction: `You are a SQL expert who writes clean, efficient, and well-documented queries. Generate SQL that is:
- Correct and handles edge cases
- Optimized for performance
- Well-formatted and readable
- Commented where helpful
- Following best practices for the specified dialect`,
          userPromptTemplate: `Generate a {{dialect}} query for:

**Question**: {{question}}

{{#if schema}}**Schema**: {{schema}}{{/if}}

Provide the query with explanation of the logic.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.2,
        },
      },
      {
        name: 'Data Analysis Report Generator',
        description: 'Generate comprehensive data analysis reports from datasets.',
        longDescription: 'Analyzes data patterns, generates insights, and creates presentation-ready reports with visualization recommendations.',
        category: 'analysis',
        estimatedTimeSaved: '2-4 hours per report',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'FileBarChart',
        },
        inputs: [
          { id: 'data', label: 'Data Summary/Statistics', type: 'textarea', placeholder: 'Paste data summary, key statistics, or describe your dataset...', validation: { required: true } },
          { id: 'question', label: 'Analysis Question', type: 'textarea', placeholder: 'What business question are you trying to answer?', validation: { required: true } },
          { id: 'audience', label: 'Report Audience', type: 'select', options: ['Executive/C-Suite', 'Business Stakeholders', 'Technical Team', 'General'] },
        ],
        prompts: {
          systemInstruction: `You are a data analyst who transforms data into compelling narratives and actionable insights. Create reports that are:
- Clear and well-structured
- Insight-driven (not just descriptive)
- Tailored to the audience level
- Actionable with clear recommendations
- Visualization-ready`,
          userPromptTemplate: `Create a data analysis report:

**Data**:
{{data}}

**Question**: {{question}}
**Audience**: {{audience}}

Generate a comprehensive analysis report with insights and recommendations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Dashboard Design Planner',
        description: 'Plan effective dashboards with the right metrics and visualizations.',
        longDescription: 'Designs dashboard layouts with appropriate KPIs, chart types, and user experience considerations for business intelligence tools.',
        category: 'generation',
        estimatedTimeSaved: '2-3 hours planning',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'LayoutDashboard',
        },
        inputs: [
          { id: 'purpose', label: 'Dashboard Purpose', type: 'textarea', placeholder: 'What decisions should this dashboard support?', validation: { required: true } },
          { id: 'audience', label: 'Target Users', type: 'textarea', placeholder: 'Who will use this dashboard? How often?' },
          { id: 'data', label: 'Available Data', type: 'textarea', placeholder: 'What data sources and metrics do you have?' },
          { id: 'tool', label: 'BI Tool', type: 'select', options: ['Tableau', 'Power BI', 'Looker', 'Metabase', 'Custom/Other'] },
        ],
        prompts: {
          systemInstruction: `You are a BI expert who designs effective, user-friendly dashboards. Create dashboard specifications that are:
- Purpose-driven with clear KPIs
- Using appropriate visualizations for each metric
- Following dashboard design best practices
- Considering user workflow and interactivity
- Tool-appropriate`,
          userPromptTemplate: `Design a dashboard:

**Purpose**: {{purpose}}
**Users**: {{audience}}
**Available Data**: {{data}}
**Tool**: {{tool}}

Provide comprehensive dashboard specifications with layout, metrics, and visualizations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 8. Project Manager
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Project planning, risk management, team coordination, and stakeholder reporting.',
    icon: 'ClipboardList',
    color: 'text-amber-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'networking-script-generator',
      'onboarding-accelerator-pro',
    ],
    dynamicSkills: [
      {
        name: 'Project Plan Generator',
        description: 'Create detailed project plans with phases, tasks, and timelines.',
        longDescription: 'Generates comprehensive project plans including WBS, milestones, resource allocation, and Gantt chart-ready task lists.',
        category: 'generation',
        estimatedTimeSaved: '4-8 hours per plan',
        theme: {
          primary: 'text-amber-400',
          secondary: 'bg-amber-900/20',
          gradient: 'from-amber-500/20 to-transparent',
          iconName: 'CalendarDays',
        },
        inputs: [
          { id: 'project', label: 'Project Name & Description', type: 'textarea', placeholder: 'Describe the project scope and objectives...', validation: { required: true } },
          { id: 'deliverables', label: 'Key Deliverables', type: 'textarea', placeholder: 'What needs to be delivered?' },
          { id: 'timeline', label: 'Timeline', type: 'text', placeholder: 'e.g., 3 months, Q2 2024' },
          { id: 'team', label: 'Team & Resources', type: 'textarea', placeholder: 'Available team members and roles...' },
          { id: 'methodology', label: 'Methodology', type: 'select', options: ['Agile/Scrum', 'Waterfall', 'Hybrid', 'Kanban'] },
        ],
        prompts: {
          systemInstruction: `You are an experienced Project Manager who creates thorough, realistic project plans. Generate plans that include:
1. Project overview and objectives
2. Work Breakdown Structure (WBS)
3. Phase breakdown with milestones
4. Task list with dependencies and durations
5. Resource allocation
6. Risk identification
7. Communication plan
8. Success criteria`,
          userPromptTemplate: `Create a project plan:

**Project**: {{project}}
**Deliverables**: {{deliverables}}
**Timeline**: {{timeline}}
**Team**: {{team}}
**Methodology**: {{methodology}}

Generate a comprehensive, actionable project plan.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Risk Assessment Matrix',
        description: 'Identify and assess project risks with mitigation strategies.',
        longDescription: 'Generates comprehensive risk registers with probability, impact, and mitigation plans for projects.',
        category: 'analysis',
        estimatedTimeSaved: '2-4 hours per assessment',
        theme: {
          primary: 'text-red-400',
          secondary: 'bg-red-900/20',
          gradient: 'from-red-500/20 to-transparent',
          iconName: 'AlertTriangle',
        },
        inputs: [
          { id: 'project', label: 'Project Description', type: 'textarea', placeholder: 'Describe the project, its scope, and context...', validation: { required: true } },
          { id: 'knownRisks', label: 'Known Risks (Optional)', type: 'textarea', placeholder: 'Any risks already identified?' },
          { id: 'constraints', label: 'Key Constraints', type: 'textarea', placeholder: 'Budget, timeline, resource, technical constraints...' },
        ],
        prompts: {
          systemInstruction: `You are a risk management expert. Identify and assess project risks comprehensively.

For each risk provide:
1. Risk description
2. Category (Technical, Resource, Schedule, External, etc.)
3. Probability (High/Medium/Low)
4. Impact (High/Medium/Low)
5. Risk score
6. Mitigation strategy
7. Contingency plan
8. Risk owner recommendation`,
          userPromptTemplate: `Create a risk assessment for:

**Project**: {{project}}
**Known Risks**: {{knownRisks}}
**Constraints**: {{constraints}}

Generate a comprehensive risk register with mitigation strategies.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Status Report Generator',
        description: 'Generate professional project status reports.',
        longDescription: 'Creates executive-ready status reports with progress updates, risks, blockers, and next steps.',
        category: 'communication',
        estimatedTimeSaved: '1-2 hours per report',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'projectName', label: 'Project Name', type: 'text', placeholder: 'e.g., Website Redesign', validation: { required: true } },
          { id: 'progress', label: 'Progress Update', type: 'textarea', placeholder: 'What was accomplished? What is the current status?', validation: { required: true } },
          { id: 'issues', label: 'Issues & Blockers', type: 'textarea', placeholder: 'Current challenges, risks, blockers...' },
          { id: 'nextSteps', label: 'Planned Next Steps', type: 'textarea', placeholder: 'What\'s coming up next?' },
          { id: 'audience', label: 'Report Audience', type: 'select', options: ['Executive/Steering Committee', 'Project Sponsors', 'Full Team', 'Client'] },
        ],
        prompts: {
          systemInstruction: `You are a project manager who writes clear, professional status reports. Create reports that are:
- Appropriately detailed for the audience
- Honest about challenges
- Clear on next steps and asks
- Using RAG status indicators where appropriate`,
          userPromptTemplate: `Create a status report for {{audience}}:

**Project**: {{projectName}}
**Progress**: {{progress}}
**Issues**: {{issues}}
**Next Steps**: {{nextSteps}}

Generate a professional project status report.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.4,
        },
      },
    ],
  },

  // 9. UX Designer
  {
    id: 'ux-designer',
    name: 'UX Designer',
    description: 'User research, wireframing, prototyping, and design systems.',
    icon: 'Figma',
    color: 'text-rose-500',
    staticSkillIds: [
      'job-readiness-score',
      'skills-gap-analyzer',
      'interview-prep',
      'linkedin-optimizer-pro',
      'day-in-the-life-generator',
    ],
    dynamicSkills: [
      {
        name: 'UX Copy Writer',
        description: 'Write clear, user-friendly UI copy and microcopy.',
        longDescription: 'Generates interface copy including buttons, labels, error messages, empty states, and onboarding flows.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per project',
        theme: {
          primary: 'text-rose-400',
          secondary: 'bg-rose-900/20',
          gradient: 'from-rose-500/20 to-transparent',
          iconName: 'Type',
        },
        inputs: [
          { id: 'context', label: 'Screen/Feature Context', type: 'textarea', placeholder: 'Describe the screen or feature that needs copy...', validation: { required: true } },
          { id: 'copyType', label: 'Copy Type', type: 'select', options: ['Buttons & CTAs', 'Form Labels & Hints', 'Error Messages', 'Empty States', 'Onboarding', 'Full Screen Copy'], validation: { required: true } },
          { id: 'brandVoice', label: 'Brand Voice', type: 'text', placeholder: 'e.g., Friendly, Professional, Playful' },
          { id: 'constraints', label: 'Character Limits (Optional)', type: 'text', placeholder: 'e.g., Button max 20 chars' },
        ],
        prompts: {
          systemInstruction: `You are a UX writer who creates clear, helpful, and on-brand interface copy. Your copy should:
- Be concise and scannable
- Use active voice
- Guide users toward their goals
- Be empathetic in error states
- Match the brand voice
- Consider accessibility`,
          userPromptTemplate: `Write {{copyType}} for:

**Context**: {{context}}
**Brand Voice**: {{brandVoice}}
{{#if constraints}}**Constraints**: {{constraints}}{{/if}}

Generate multiple options with rationale for key choices.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.6,
        },
      },
      {
        name: 'User Persona Generator',
        description: 'Create detailed user personas from research or assumptions.',
        longDescription: 'Generates comprehensive user personas including demographics, goals, pain points, behaviors, and design implications.',
        category: 'generation',
        estimatedTimeSaved: '2-3 hours per persona',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'UserCircle',
        },
        inputs: [
          { id: 'product', label: 'Product/Service', type: 'textarea', placeholder: 'What is your product or service?', validation: { required: true } },
          { id: 'userInfo', label: 'User Information', type: 'textarea', placeholder: 'Any research data, user feedback, or assumptions about your users...' },
          { id: 'personaCount', label: 'Number of Personas', type: 'select', options: ['1 Primary Persona', '2 Personas', '3 Personas'] },
        ],
        prompts: {
          systemInstruction: `You are a UX researcher who creates actionable user personas. Each persona should include:
1. Name and photo description
2. Demographics
3. Bio/background
4. Goals (primary and secondary)
5. Pain points and frustrations
6. Behaviors and habits
7. Technology comfort level
8. Quoted user statement
9. Design implications/recommendations`,
          userPromptTemplate: `Create {{personaCount}} for:

**Product**: {{product}}
**User Information**: {{userInfo}}

Generate detailed, actionable user personas.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.5,
        },
      },
      {
        name: 'Usability Test Script Creator',
        description: 'Create structured usability testing scripts and protocols.',
        longDescription: 'Generates complete usability test plans including screener questions, tasks, follow-up questions, and analysis frameworks.',
        category: 'generation',
        estimatedTimeSaved: '2-4 hours per script',
        theme: {
          primary: 'text-purple-400',
          secondary: 'bg-purple-900/20',
          gradient: 'from-purple-500/20 to-transparent',
          iconName: 'ClipboardCheck',
        },
        inputs: [
          { id: 'product', label: 'Product Being Tested', type: 'textarea', placeholder: 'What are you testing?', validation: { required: true } },
          { id: 'goals', label: 'Research Goals', type: 'textarea', placeholder: 'What do you want to learn?' },
          { id: 'testType', label: 'Test Type', type: 'select', options: ['Moderated In-Person', 'Moderated Remote', 'Unmoderated Remote'] },
          { id: 'participants', label: 'Target Participants', type: 'textarea', placeholder: 'Who should participate in testing?' },
        ],
        prompts: {
          systemInstruction: `You are a UX researcher experienced in usability testing. Create comprehensive test scripts including:
1. Introduction script
2. Screener questions
3. Pre-test questions
4. Task scenarios (with success criteria)
5. Post-task questions
6. Post-test questions (SUS or custom)
7. Moderator notes/tips
8. Data collection template`,
          userPromptTemplate: `Create a {{testType}} usability test script:

**Product**: {{product}}
**Goals**: {{goals}}
**Participants**: {{participants}}

Generate a complete usability testing protocol.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 10. Sales Representative
  {
    id: 'sales-representative',
    name: 'Sales Representative',
    description: 'Prospecting, outreach, objection handling, and deal management.',
    icon: 'HandCoins',
    color: 'text-green-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'networking-script-generator',
      'salary-negotiation-master',
    ],
    dynamicSkills: [
      {
        name: 'Cold Outreach Generator',
        description: 'Create personalized cold emails and LinkedIn messages.',
        longDescription: 'Generates highly personalized outreach sequences that stand out and get responses.',
        category: 'generation',
        estimatedTimeSaved: '30-60 min per prospect',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'Send',
        },
        inputs: [
          { id: 'prospect', label: 'Prospect Information', type: 'textarea', placeholder: 'Name, title, company, LinkedIn info, recent news...', validation: { required: true } },
          { id: 'product', label: 'Your Product/Service', type: 'textarea', placeholder: 'What are you selling? Key value props?', validation: { required: true } },
          { id: 'channel', label: 'Outreach Channel', type: 'select', options: ['Cold Email', 'LinkedIn Message', 'Email + LinkedIn Sequence'] },
          { id: 'cta', label: 'Call to Action', type: 'select', options: ['Meeting Request', 'Demo', 'Resource/Content', 'Intro Call'] },
        ],
        prompts: {
          systemInstruction: `You are an expert B2B sales rep who writes personalized outreach that gets responses. Your messages:
- Lead with relevance (personalization)
- Focus on prospect's challenges
- Keep it concise (under 100 words for email)
- Have clear, low-friction CTAs
- Avoid salesy language`,
          userPromptTemplate: `Create {{channel}} outreach for:

**Prospect**: {{prospect}}
**Product**: {{product}}
**Goal**: {{cta}}

Generate personalized, compelling outreach with variations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.6,
        },
      },
      {
        name: 'Objection Handler',
        description: 'Get responses to common sales objections.',
        longDescription: 'Provides tailored responses to sales objections with multiple approaches and follow-up questions.',
        category: 'communication',
        estimatedTimeSaved: '15-30 min per objection',
        theme: {
          primary: 'text-yellow-400',
          secondary: 'bg-yellow-900/20',
          gradient: 'from-yellow-500/20 to-transparent',
          iconName: 'MessageCircle',
        },
        inputs: [
          { id: 'objection', label: 'Objection', type: 'textarea', placeholder: 'What did the prospect say?', validation: { required: true } },
          { id: 'context', label: 'Deal Context', type: 'textarea', placeholder: 'What are you selling? What stage is the deal?' },
          { id: 'product', label: 'Product/Service', type: 'textarea', placeholder: 'Key features and differentiators' },
        ],
        prompts: {
          systemInstruction: `You are a sales expert who handles objections with empathy and skill. Provide responses that:
- Acknowledge the concern genuinely
- Ask clarifying questions
- Reframe the objection
- Provide proof points/social proof
- Guide toward next steps

Provide multiple response approaches.`,
          userPromptTemplate: `Handle this sales objection:

**Objection**: "{{objection}}"

**Context**: {{context}}
**Product**: {{product}}

Provide multiple response approaches with follow-up questions.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.5,
        },
      },
      {
        name: 'Proposal Generator',
        description: 'Create professional sales proposals and SOWs.',
        longDescription: 'Generates customized sales proposals including executive summary, solution overview, pricing, and terms.',
        category: 'generation',
        estimatedTimeSaved: '2-4 hours per proposal',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'client', label: 'Client & Opportunity', type: 'textarea', placeholder: 'Client name, their challenges, what they need...', validation: { required: true } },
          { id: 'solution', label: 'Proposed Solution', type: 'textarea', placeholder: 'What are you proposing? Scope, deliverables...', validation: { required: true } },
          { id: 'pricing', label: 'Pricing', type: 'textarea', placeholder: 'Pricing details, options, terms...' },
          { id: 'proposalType', label: 'Proposal Type', type: 'select', options: ['Full Proposal', 'Executive Summary', 'Statement of Work'] },
        ],
        prompts: {
          systemInstruction: `You are a sales professional who creates winning proposals. Structure proposals with:
1. Executive Summary
2. Understanding of Client Needs
3. Proposed Solution
4. Deliverables & Timeline
5. Pricing Options
6. Why Us / Differentiators
7. Team / About Us
8. Terms & Next Steps`,
          userPromptTemplate: `Create a {{proposalType}}:

**Client**: {{client}}
**Solution**: {{solution}}
**Pricing**: {{pricing}}

Generate a professional, persuasive proposal.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 11. HR Professional
  {
    id: 'hr-professional',
    name: 'HR Professional',
    description: 'Talent acquisition, employee relations, HR policies, and organizational development.',
    icon: 'Users',
    color: 'text-teal-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'networking-script-generator',
      'company-research',
    ],
    dynamicSkills: [
      {
        name: 'Job Description Writer',
        description: 'Create compelling, inclusive job descriptions that attract top talent.',
        longDescription: 'Generates well-structured job descriptions with clear responsibilities, requirements, and company culture highlights while ensuring inclusive language.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per JD',
        theme: {
          primary: 'text-teal-400',
          secondary: 'bg-teal-900/20',
          gradient: 'from-teal-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Software Engineer', validation: { required: true } },
          { id: 'department', label: 'Department/Team', type: 'text', placeholder: 'e.g., Engineering, Marketing' },
          { id: 'requirements', label: 'Key Requirements', type: 'textarea', placeholder: 'Must-have skills, experience level, qualifications...', validation: { required: true } },
          { id: 'responsibilities', label: 'Main Responsibilities', type: 'textarea', placeholder: 'What will this person do day-to-day?' },
          { id: 'companyInfo', label: 'Company/Culture Info', type: 'textarea', placeholder: 'Company description, values, benefits...' },
        ],
        prompts: {
          systemInstruction: `You are an experienced HR professional and talent acquisition specialist. Create compelling job descriptions that:
- Use clear, inclusive language (avoid gendered terms, jargon)
- Distinguish between required and preferred qualifications
- Highlight growth opportunities and company culture
- Are scannable with bullet points
- Include salary range placeholder and benefits section
- Follow best practices for attracting diverse candidates`,
          userPromptTemplate: `Create a job description for:

**Title**: {{jobTitle}}
**Department**: {{department}}
**Requirements**: {{requirements}}
**Responsibilities**: {{responsibilities}}
**Company Info**: {{companyInfo}}

Generate a compelling, inclusive job description.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.4,
        },
      },
      {
        name: 'Interview Question Generator',
        description: 'Generate behavioral and technical interview questions for any role.',
        longDescription: 'Creates structured interview questions including behavioral, situational, and role-specific questions with evaluation criteria.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per interview',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'MessageSquare',
        },
        inputs: [
          { id: 'role', label: 'Role Being Interviewed', type: 'text', placeholder: 'e.g., Product Manager', validation: { required: true } },
          { id: 'level', label: 'Seniority Level', type: 'select', options: ['Entry Level', 'Mid Level', 'Senior', 'Lead/Manager', 'Director+'] },
          { id: 'competencies', label: 'Key Competencies to Assess', type: 'textarea', placeholder: 'Leadership, problem-solving, technical skills...' },
          { id: 'interviewType', label: 'Interview Type', type: 'select', options: ['Phone Screen', 'Behavioral', 'Technical', 'Culture Fit', 'Final Round'] },
        ],
        prompts: {
          systemInstruction: `You are an experienced HR interviewer. Create structured interview questions that:
- Follow STAR format for behavioral questions
- Include scoring rubrics/what to look for
- Cover the key competencies
- Are legally compliant (avoid discriminatory questions)
- Progress from warm-up to in-depth questions
- Include follow-up probes`,
          userPromptTemplate: `Create interview questions for:

**Role**: {{role}}
**Level**: {{level}}
**Competencies**: {{competencies}}
**Interview Type**: {{interviewType}}

Generate comprehensive interview questions with evaluation criteria.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 3072,
          temperature: 0.4,
        },
      },
      {
        name: 'HR Policy Drafter',
        description: 'Draft clear HR policies and employee handbook sections.',
        longDescription: 'Creates professional HR policies covering various topics with clear language, procedures, and compliance considerations.',
        category: 'generation',
        estimatedTimeSaved: '3-5 hours per policy',
        theme: {
          primary: 'text-purple-400',
          secondary: 'bg-purple-900/20',
          gradient: 'from-purple-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'policyType', label: 'Policy Type', type: 'select', options: ['Remote Work', 'PTO/Leave', 'Code of Conduct', 'Anti-Harassment', 'Performance Management', 'Onboarding', 'Termination', 'Other'], validation: { required: true } },
          { id: 'companyContext', label: 'Company Context', type: 'textarea', placeholder: 'Company size, industry, existing policies...' },
          { id: 'specificRequirements', label: 'Specific Requirements', type: 'textarea', placeholder: 'What should this policy cover? Any specific situations?' },
        ],
        prompts: {
          systemInstruction: `You are an HR policy expert. Draft clear, comprehensive policies that:
- Use plain language employees can understand
- Include purpose, scope, and procedures
- Define roles and responsibilities
- Address common scenarios and exceptions
- Include compliance considerations
- Are fair and consistently applicable`,
          userPromptTemplate: `Draft an HR policy:

**Policy Type**: {{policyType}}
**Company Context**: {{companyContext}}
**Requirements**: {{specificRequirements}}

Create a comprehensive, clear HR policy document.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
    ],
  },

  // 12. Financial Analyst
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    description: 'Financial modeling, reporting, budgeting, and investment analysis.',
    icon: 'DollarSign',
    color: 'text-green-600',
    staticSkillIds: [
      'job-readiness-score',
      'skills-gap-analyzer',
      'interview-prep',
      'salary-negotiation-master',
      'company-research',
    ],
    dynamicSkills: [
      {
        name: 'Financial Report Summarizer',
        description: 'Summarize and analyze financial reports and earnings calls.',
        longDescription: 'Analyzes financial statements, earnings reports, and investor communications to extract key insights and trends.',
        category: 'analysis',
        estimatedTimeSaved: '2-3 hours per report',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'FileBarChart',
        },
        inputs: [
          { id: 'reportContent', label: 'Report Content', type: 'textarea', placeholder: 'Paste financial report, earnings call transcript, or key metrics...', validation: { required: true } },
          { id: 'reportType', label: 'Report Type', type: 'select', options: ['Quarterly Earnings', 'Annual Report', '10-K/10-Q', 'Earnings Call Transcript', 'Investor Presentation'] },
          { id: 'focusAreas', label: 'Focus Areas', type: 'textarea', placeholder: 'What aspects are most important? Revenue, margins, guidance...' },
        ],
        prompts: {
          systemInstruction: `You are a senior financial analyst. Analyze financial reports and provide:
1. Executive summary of key highlights
2. Revenue and profitability analysis
3. Key metrics and YoY/QoQ comparisons
4. Management guidance and outlook
5. Risks and concerns
6. Investment implications
Use clear financial terminology and cite specific numbers.`,
          userPromptTemplate: `Analyze this {{reportType}}:

{{reportContent}}

**Focus Areas**: {{focusAreas}}

Provide a comprehensive financial analysis.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
      {
        name: 'Budget Variance Analyzer',
        description: 'Analyze budget vs actual variances and provide insights.',
        longDescription: 'Compares budgeted figures to actuals, identifies variances, and provides actionable recommendations.',
        category: 'analysis',
        estimatedTimeSaved: '2-4 hours per analysis',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'Calculator',
        },
        inputs: [
          { id: 'budgetData', label: 'Budget vs Actual Data', type: 'textarea', placeholder: 'Paste budget and actual figures...', validation: { required: true } },
          { id: 'period', label: 'Time Period', type: 'text', placeholder: 'e.g., Q3 2024, FY 2024' },
          { id: 'context', label: 'Business Context', type: 'textarea', placeholder: 'Any known factors affecting variances?' },
        ],
        prompts: {
          systemInstruction: `You are a financial planning and analysis (FP&A) expert. Analyze budget variances by:
1. Calculating variance amounts and percentages
2. Categorizing variances (favorable/unfavorable)
3. Identifying root causes
4. Distinguishing volume vs. price variances where applicable
5. Providing actionable recommendations
6. Highlighting items requiring management attention`,
          userPromptTemplate: `Analyze budget variances for {{period}}:

**Data**:
{{budgetData}}

**Context**: {{context}}

Provide detailed variance analysis with recommendations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
      {
        name: 'Financial Model Documentation',
        description: 'Create documentation for financial models and assumptions.',
        longDescription: 'Generates clear documentation for financial models including assumptions, methodology, and user guides.',
        category: 'generation',
        estimatedTimeSaved: '2-3 hours per model',
        theme: {
          primary: 'text-purple-400',
          secondary: 'bg-purple-900/20',
          gradient: 'from-purple-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'modelDescription', label: 'Model Description', type: 'textarea', placeholder: 'Describe your financial model, its purpose, and structure...', validation: { required: true } },
          { id: 'assumptions', label: 'Key Assumptions', type: 'textarea', placeholder: 'List major assumptions and drivers...' },
          { id: 'docType', label: 'Documentation Type', type: 'select', options: ['Full Documentation', 'Assumptions Log', 'User Guide', 'Methodology Note'] },
        ],
        prompts: {
          systemInstruction: `You are a financial modeling expert. Create clear documentation that:
- Explains the model's purpose and scope
- Documents all key assumptions with rationale
- Describes calculation methodology
- Includes sensitivity analysis guidance
- Provides user instructions
- Notes limitations and caveats`,
          userPromptTemplate: `Create {{docType}} for:

**Model**: {{modelDescription}}
**Assumptions**: {{assumptions}}

Generate comprehensive financial model documentation.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 13. Content Writer
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Blog posts, articles, copywriting, and content strategy.',
    icon: 'PenTool',
    color: 'text-orange-500',
    staticSkillIds: [
      'job-readiness-score',
      'linkedin-optimizer-pro',
      'cover-letter-generator',
      'networking-script-generator',
      'interview-prep',
    ],
    dynamicSkills: [
      {
        name: 'Blog Post Generator',
        description: 'Create engaging, SEO-optimized blog posts on any topic.',
        longDescription: 'Generates well-structured blog posts with compelling headlines, clear sections, and SEO best practices.',
        category: 'generation',
        estimatedTimeSaved: '2-4 hours per post',
        theme: {
          primary: 'text-orange-400',
          secondary: 'bg-orange-900/20',
          gradient: 'from-orange-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'topic', label: 'Blog Topic', type: 'text', placeholder: 'What should the blog post be about?', validation: { required: true } },
          { id: 'targetKeyword', label: 'Target Keyword (Optional)', type: 'text', placeholder: 'Primary SEO keyword' },
          { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who is this for?' },
          { id: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Conversational', 'Educational', 'Entertaining', 'Authoritative'] },
          { id: 'wordCount', label: 'Approximate Length', type: 'select', options: ['Short (500-800)', 'Medium (1000-1500)', 'Long (2000+)'] },
        ],
        prompts: {
          systemInstruction: `You are an expert content writer and SEO specialist. Create blog posts that:
- Have compelling, click-worthy headlines
- Include a strong hook in the introduction
- Use clear subheadings (H2, H3)
- Incorporate the target keyword naturally
- Include actionable takeaways
- End with a clear call-to-action
- Are scannable with bullet points where appropriate`,
          userPromptTemplate: `Write a {{wordCount}} blog post:

**Topic**: {{topic}}
**Keyword**: {{targetKeyword}}
**Audience**: {{audience}}
**Tone**: {{tone}}

Create an engaging, well-structured blog post.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.6,
        },
      },
      {
        name: 'Content Brief Creator',
        description: 'Create detailed content briefs for writers and teams.',
        longDescription: 'Generates comprehensive content briefs including outline, keywords, competitor analysis, and success criteria.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per brief',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'ClipboardList',
        },
        inputs: [
          { id: 'contentTopic', label: 'Content Topic', type: 'text', placeholder: 'What content needs to be created?', validation: { required: true } },
          { id: 'contentType', label: 'Content Type', type: 'select', options: ['Blog Post', 'Landing Page', 'Email', 'Social Media', 'White Paper', 'Case Study'] },
          { id: 'goals', label: 'Content Goals', type: 'textarea', placeholder: 'What should this content achieve?' },
          { id: 'competitorUrls', label: 'Competitor Content (Optional)', type: 'textarea', placeholder: 'URLs or descriptions of competitor content...' },
        ],
        prompts: {
          systemInstruction: `You are a content strategist. Create detailed briefs including:
1. Content overview and goals
2. Target audience persona
3. Primary and secondary keywords
4. Detailed outline with section descriptions
5. Key points to cover
6. Tone and style guidelines
7. Internal/external linking suggestions
8. Success metrics
9. SEO requirements`,
          userPromptTemplate: `Create a content brief for {{contentType}}:

**Topic**: {{contentTopic}}
**Goals**: {{goals}}
**Competitor Reference**: {{competitorUrls}}

Generate a comprehensive content brief.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 3072,
          temperature: 0.4,
        },
      },
      {
        name: 'Content Repurposer',
        description: 'Transform content into multiple formats and platforms.',
        longDescription: 'Takes existing content and repurposes it for different channels, formats, and audiences.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per piece',
        theme: {
          primary: 'text-purple-400',
          secondary: 'bg-purple-900/20',
          gradient: 'from-purple-500/20 to-transparent',
          iconName: 'RefreshCw',
        },
        inputs: [
          { id: 'originalContent', label: 'Original Content', type: 'textarea', placeholder: 'Paste your existing content...', validation: { required: true } },
          { id: 'targetFormats', label: 'Target Formats', type: 'select', options: ['Social Media Posts', 'Email Newsletter', 'Video Script', 'Infographic Outline', 'Podcast Talking Points', 'All Formats'] },
          { id: 'brandVoice', label: 'Brand Voice', type: 'text', placeholder: 'e.g., Professional, Friendly, Bold' },
        ],
        prompts: {
          systemInstruction: `You are a content repurposing expert. Transform content while:
- Maintaining the core message and value
- Adapting tone and format for each platform
- Optimizing length for each channel
- Adding platform-specific elements (hashtags, hooks, etc.)
- Ensuring consistency across formats`,
          userPromptTemplate: `Repurpose this content for {{targetFormats}}:

**Original Content**:
{{originalContent}}

**Brand Voice**: {{brandVoice}}

Create optimized versions for each target format.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.6,
        },
      },
    ],
  },

  // 14. Customer Success Manager
  {
    id: 'customer-success-manager',
    name: 'Customer Success Manager',
    description: 'Client relationships, retention strategies, onboarding, and account growth.',
    icon: 'HeartHandshake',
    color: 'text-pink-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'networking-script-generator',
      'salary-negotiation-master',
    ],
    dynamicSkills: [
      {
        name: 'Customer Health Score Analyzer',
        description: 'Analyze customer data and generate health assessments.',
        longDescription: 'Evaluates customer engagement, usage, and satisfaction data to identify at-risk accounts and growth opportunities.',
        category: 'analysis',
        estimatedTimeSaved: '1-2 hours per analysis',
        theme: {
          primary: 'text-pink-400',
          secondary: 'bg-pink-900/20',
          gradient: 'from-pink-500/20 to-transparent',
          iconName: 'Heart',
        },
        inputs: [
          { id: 'customerData', label: 'Customer Data', type: 'textarea', placeholder: 'Usage metrics, support tickets, engagement data, NPS scores...', validation: { required: true } },
          { id: 'accountInfo', label: 'Account Info', type: 'textarea', placeholder: 'Contract value, tenure, key stakeholders, goals...' },
          { id: 'recentActivity', label: 'Recent Activity', type: 'textarea', placeholder: 'Recent interactions, meetings, concerns raised...' },
        ],
        prompts: {
          systemInstruction: `You are a customer success expert. Analyze customer health by:
1. Evaluating engagement and usage trends
2. Identifying risk indicators
3. Spotting expansion opportunities
4. Recommending proactive actions
5. Prioritizing outreach focus areas
6. Suggesting talking points for next interaction`,
          userPromptTemplate: `Analyze customer health:

**Customer Data**: {{customerData}}
**Account Info**: {{accountInfo}}
**Recent Activity**: {{recentActivity}}

Provide a comprehensive health assessment with recommendations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 3072,
          temperature: 0.4,
        },
      },
      {
        name: 'QBR Deck Generator',
        description: 'Create Quarterly Business Review presentations.',
        longDescription: 'Generates structured QBR content including performance metrics, achievements, recommendations, and next steps.',
        category: 'generation',
        estimatedTimeSaved: '3-4 hours per QBR',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'Presentation',
        },
        inputs: [
          { id: 'accountName', label: 'Account Name', type: 'text', placeholder: 'Customer/Account name', validation: { required: true } },
          { id: 'metrics', label: 'Key Metrics & Results', type: 'textarea', placeholder: 'Usage stats, ROI achieved, goals met...', validation: { required: true } },
          { id: 'highlights', label: 'Key Highlights', type: 'textarea', placeholder: 'Major wins, milestones, initiatives...' },
          { id: 'challenges', label: 'Challenges & Opportunities', type: 'textarea', placeholder: 'Issues faced, areas for improvement...' },
        ],
        prompts: {
          systemInstruction: `You are a customer success manager creating a QBR. Structure the presentation with:
1. Executive Summary
2. Goals Recap & Progress
3. Key Metrics Dashboard
4. Wins & Success Stories
5. Challenges & Solutions
6. Product Updates & Roadmap
7. Recommendations
8. Next Quarter Goals
9. Action Items`,
          userPromptTemplate: `Create a QBR presentation for {{accountName}}:

**Metrics**: {{metrics}}
**Highlights**: {{highlights}}
**Challenges**: {{challenges}}

Generate a comprehensive QBR deck outline with talking points.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Customer Email Composer',
        description: 'Write professional customer communications for various scenarios.',
        longDescription: 'Creates tailored customer emails for onboarding, check-ins, escalations, renewals, and more.',
        category: 'communication',
        estimatedTimeSaved: '15-30 min per email',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'Mail',
        },
        inputs: [
          { id: 'emailType', label: 'Email Type', type: 'select', options: ['Onboarding Welcome', 'Check-in', 'Escalation Response', 'Renewal Reminder', 'Upsell/Cross-sell', 'Win-back', 'Feedback Request'], validation: { required: true } },
          { id: 'customerContext', label: 'Customer Context', type: 'textarea', placeholder: 'Customer name, situation, history...', validation: { required: true } },
          { id: 'keyPoints', label: 'Key Points to Cover', type: 'textarea', placeholder: 'What needs to be communicated?' },
          { id: 'tone', label: 'Tone', type: 'select', options: ['Warm & Friendly', 'Professional', 'Empathetic', 'Urgent'] },
        ],
        prompts: {
          systemInstruction: `You are a customer success manager writing customer emails. Create emails that:
- Are personalized and reference specific context
- Have a clear purpose and call-to-action
- Maintain the appropriate tone
- Are concise but thorough
- Build relationship and trust
- Include next steps`,
          userPromptTemplate: `Write a {{emailType}} email:

**Context**: {{customerContext}}
**Key Points**: {{keyPoints}}
**Tone**: {{tone}}

Create a professional, effective customer email.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 1024,
          temperature: 0.5,
        },
      },
    ],
  },

  // 15. DevOps Engineer
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'CI/CD pipelines, infrastructure automation, monitoring, and cloud operations.',
    icon: 'Server',
    color: 'text-slate-500',
    staticSkillIds: [
      'job-readiness-score',
      'skills-gap-analyzer',
      'interview-prep',
      'salary-negotiation-master',
      'linkedin-optimizer-pro',
    ],
    dynamicSkills: [
      {
        name: 'Infrastructure as Code Generator',
        description: 'Generate Terraform, CloudFormation, or other IaC templates.',
        longDescription: 'Creates infrastructure as code templates with best practices for security, scalability, and maintainability.',
        category: 'generation',
        estimatedTimeSaved: '2-4 hours per template',
        theme: {
          primary: 'text-slate-400',
          secondary: 'bg-slate-900/20',
          gradient: 'from-slate-500/20 to-transparent',
          iconName: 'Code2',
        },
        inputs: [
          { id: 'infrastructure', label: 'Infrastructure Requirements', type: 'textarea', placeholder: 'Describe the infrastructure needed (VPC, EC2, RDS, etc.)', validation: { required: true } },
          { id: 'tool', label: 'IaC Tool', type: 'select', options: ['Terraform', 'AWS CloudFormation', 'Pulumi', 'Ansible', 'Kubernetes YAML'], validation: { required: true } },
          { id: 'cloud', label: 'Cloud Provider', type: 'select', options: ['AWS', 'GCP', 'Azure', 'Multi-cloud'] },
          { id: 'environment', label: 'Environment', type: 'select', options: ['Development', 'Staging', 'Production', 'All'] },
        ],
        prompts: {
          systemInstruction: `You are a senior DevOps engineer. Generate IaC code that:
- Follows security best practices (least privilege, encryption)
- Is modular and reusable
- Includes proper tagging and naming conventions
- Has appropriate comments
- Considers cost optimization
- Includes variable definitions and outputs`,
          userPromptTemplate: `Generate {{tool}} code for {{cloud}}:

**Infrastructure**: {{infrastructure}}
**Environment**: {{environment}}

Create production-ready infrastructure as code.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.2,
        },
      },
      {
        name: 'CI/CD Pipeline Designer',
        description: 'Design and document CI/CD pipelines for various platforms.',
        longDescription: 'Creates CI/CD pipeline configurations and documentation for GitHub Actions, GitLab CI, Jenkins, and more.',
        category: 'generation',
        estimatedTimeSaved: '2-3 hours per pipeline',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'GitBranch',
        },
        inputs: [
          { id: 'projectType', label: 'Project Type', type: 'text', placeholder: 'e.g., Node.js API, Python ML, React App', validation: { required: true } },
          { id: 'platform', label: 'CI/CD Platform', type: 'select', options: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Azure DevOps'], validation: { required: true } },
          { id: 'stages', label: 'Required Stages', type: 'textarea', placeholder: 'Build, test, lint, deploy, etc.' },
          { id: 'deployTarget', label: 'Deployment Target', type: 'text', placeholder: 'e.g., AWS ECS, Kubernetes, Vercel' },
        ],
        prompts: {
          systemInstruction: `You are a DevOps expert. Create CI/CD pipelines that:
- Include all standard stages (lint, test, build, deploy)
- Use caching for faster builds
- Include security scanning
- Have proper environment separation
- Include rollback capabilities
- Are well-documented with comments`,
          userPromptTemplate: `Design a {{platform}} pipeline for {{projectType}}:

**Stages**: {{stages}}
**Deploy Target**: {{deployTarget}}

Create a comprehensive CI/CD pipeline configuration.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.2,
        },
      },
      {
        name: 'Runbook Generator',
        description: 'Create operational runbooks for incident response and procedures.',
        longDescription: 'Generates detailed runbooks with step-by-step procedures for common operations and incident response.',
        category: 'generation',
        estimatedTimeSaved: '2-4 hours per runbook',
        theme: {
          primary: 'text-red-400',
          secondary: 'bg-red-900/20',
          gradient: 'from-red-500/20 to-transparent',
          iconName: 'AlertTriangle',
        },
        inputs: [
          { id: 'runbookType', label: 'Runbook Type', type: 'select', options: ['Incident Response', 'Deployment', 'Rollback', 'Scaling', 'Database Operations', 'Security Incident', 'Disaster Recovery'], validation: { required: true } },
          { id: 'system', label: 'System/Service', type: 'text', placeholder: 'What system is this for?', validation: { required: true } },
          { id: 'context', label: 'System Context', type: 'textarea', placeholder: 'Architecture, dependencies, access info...' },
        ],
        prompts: {
          systemInstruction: `You are a site reliability engineer. Create runbooks that:
- Have clear, numbered steps
- Include prerequisites and access requirements
- Provide commands that can be copy-pasted
- Include verification steps after each action
- Have rollback procedures
- Include escalation paths
- Are usable by on-call engineers at 3 AM`,
          userPromptTemplate: `Create a {{runbookType}} runbook for {{system}}:

**Context**: {{context}}

Generate a comprehensive, actionable runbook.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
    ],
  },

  // 16. Healthcare Professional
  {
    id: 'healthcare-professional',
    name: 'Healthcare Professional',
    description: 'Patient care documentation, clinical notes, and healthcare communication.',
    icon: 'Stethoscope',
    color: 'text-red-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'skills-gap-analyzer',
      'networking-script-generator',
    ],
    dynamicSkills: [
      {
        name: 'Patient Education Material Creator',
        description: 'Create clear, accessible patient education materials.',
        longDescription: 'Generates patient-friendly educational content about conditions, procedures, and treatments at appropriate reading levels.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per document',
        theme: {
          primary: 'text-red-400',
          secondary: 'bg-red-900/20',
          gradient: 'from-red-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Diabetes Management, Post-Surgery Care', validation: { required: true } },
          { id: 'audience', label: 'Patient Audience', type: 'select', options: ['General Adult', 'Elderly', 'Pediatric (for parents)', 'Low Health Literacy', 'Caregiver'] },
          { id: 'keyPoints', label: 'Key Points to Cover', type: 'textarea', placeholder: 'What should patients understand?' },
          { id: 'format', label: 'Format', type: 'select', options: ['Information Sheet', 'FAQ', 'Step-by-Step Guide', 'Checklist'] },
        ],
        prompts: {
          systemInstruction: `You are a healthcare educator. Create patient materials that:
- Use plain language (6th-8th grade reading level)
- Avoid medical jargon or explain it clearly
- Include actionable steps
- Address common questions and concerns
- Use bullet points for scannability
- Include when to seek help
- Are culturally sensitive`,
          userPromptTemplate: `Create a {{format}} about {{topic}} for {{audience}} patients:

**Key Points**: {{keyPoints}}

Generate clear, accessible patient education material.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 2048,
          temperature: 0.4,
        },
      },
      {
        name: 'Clinical Documentation Assistant',
        description: 'Help structure and improve clinical documentation.',
        longDescription: 'Assists with organizing clinical notes, ensuring completeness, and improving clarity while maintaining accuracy.',
        category: 'analysis',
        estimatedTimeSaved: '30-60 min per note',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'ClipboardCheck',
        },
        inputs: [
          { id: 'noteContent', label: 'Draft Notes', type: 'textarea', placeholder: 'Paste your draft clinical notes...', validation: { required: true } },
          { id: 'noteType', label: 'Note Type', type: 'select', options: ['Progress Note', 'H&P', 'Discharge Summary', 'Consultation Note', 'Procedure Note'] },
          { id: 'improvements', label: 'Areas to Improve', type: 'select', options: ['Organization', 'Completeness', 'Clarity', 'All Areas'] },
        ],
        prompts: {
          systemInstruction: `You are a clinical documentation specialist. Help improve notes by:
- Organizing into standard sections (subjective, objective, assessment, plan)
- Ensuring completeness of required elements
- Improving clarity while maintaining accuracy
- Suggesting areas that may need more detail
- DO NOT fabricate any clinical information
- Only reorganize and clarify what is provided`,
          userPromptTemplate: `Review and improve this {{noteType}}:

{{noteContent}}

**Focus**: {{improvements}}

Provide suggestions for improving this documentation.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 3072,
          temperature: 0.3,
        },
      },
      {
        name: 'Care Plan Generator',
        description: 'Create structured patient care plans.',
        longDescription: 'Generates comprehensive care plans with goals, interventions, and evaluation criteria.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per plan',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'Heart',
        },
        inputs: [
          { id: 'patientSummary', label: 'Patient Summary', type: 'textarea', placeholder: 'Brief patient background, conditions, needs...', validation: { required: true } },
          { id: 'primaryDiagnosis', label: 'Primary Diagnosis/Concern', type: 'text', placeholder: 'Main health issue being addressed' },
          { id: 'careSetting', label: 'Care Setting', type: 'select', options: ['Inpatient', 'Outpatient', 'Home Health', 'Long-term Care', 'Rehabilitation'] },
        ],
        prompts: {
          systemInstruction: `You are a nursing care planning expert. Create care plans that:
- Use nursing diagnosis format (problem, etiology, evidence)
- Include SMART goals (specific, measurable, achievable, relevant, time-bound)
- List evidence-based interventions
- Include patient/family teaching
- Specify evaluation criteria
- Are individualized to patient needs`,
          userPromptTemplate: `Create a care plan for {{careSetting}}:

**Patient**: {{patientSummary}}
**Primary Issue**: {{primaryDiagnosis}}

Generate a comprehensive, individualized care plan.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 17. Operations Manager
  {
    id: 'operations-manager',
    name: 'Operations Manager',
    description: 'Process optimization, team management, resource planning, and operational excellence.',
    icon: 'Settings',
    color: 'text-gray-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'salary-negotiation-master',
      'company-research',
    ],
    dynamicSkills: [
      {
        name: 'SOP Generator',
        description: 'Create detailed Standard Operating Procedures.',
        longDescription: 'Generates comprehensive SOPs with clear steps, roles, and quality checkpoints.',
        category: 'generation',
        estimatedTimeSaved: '3-5 hours per SOP',
        theme: {
          primary: 'text-gray-400',
          secondary: 'bg-gray-900/20',
          gradient: 'from-gray-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'processName', label: 'Process Name', type: 'text', placeholder: 'e.g., Customer Order Fulfillment', validation: { required: true } },
          { id: 'processDescription', label: 'Process Description', type: 'textarea', placeholder: 'Describe the process, who does it, when...', validation: { required: true } },
          { id: 'currentSteps', label: 'Current Steps (if any)', type: 'textarea', placeholder: 'Existing process steps or notes...' },
          { id: 'compliance', label: 'Compliance Requirements', type: 'text', placeholder: 'ISO, HIPAA, SOX, etc.' },
        ],
        prompts: {
          systemInstruction: `You are an operations expert. Create SOPs that:
- Have clear purpose and scope
- Define roles and responsibilities
- Include numbered, actionable steps
- Specify required tools/materials
- Include quality checkpoints
- Address exceptions and escalations
- Are audit-ready with version control section`,
          userPromptTemplate: `Create an SOP for {{processName}}:

**Description**: {{processDescription}}
**Current Steps**: {{currentSteps}}
**Compliance**: {{compliance}}

Generate a comprehensive Standard Operating Procedure.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
      {
        name: 'Resource Capacity Planner',
        description: 'Analyze workload and plan resource allocation.',
        longDescription: 'Helps analyze team capacity, workload distribution, and resource planning.',
        category: 'analysis',
        estimatedTimeSaved: '2-4 hours per plan',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'Users',
        },
        inputs: [
          { id: 'teamInfo', label: 'Team Information', type: 'textarea', placeholder: 'Team size, roles, current allocation...', validation: { required: true } },
          { id: 'workload', label: 'Workload/Demand', type: 'textarea', placeholder: 'Projects, tasks, expected demand...' },
          { id: 'constraints', label: 'Constraints', type: 'textarea', placeholder: 'Budget, skills gaps, availability...' },
          { id: 'timeframe', label: 'Planning Timeframe', type: 'select', options: ['Weekly', 'Monthly', 'Quarterly', 'Annual'] },
        ],
        prompts: {
          systemInstruction: `You are an operations planning expert. Analyze capacity and provide:
1. Current utilization analysis
2. Capacity vs demand comparison
3. Bottleneck identification
4. Resource allocation recommendations
5. Hiring/training needs
6. Risk mitigation strategies
7. Optimization opportunities`,
          userPromptTemplate: `Create a {{timeframe}} resource plan:

**Team**: {{teamInfo}}
**Workload**: {{workload}}
**Constraints**: {{constraints}}

Provide comprehensive capacity analysis and recommendations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Operational Metrics Dashboard Designer',
        description: 'Design KPI dashboards and metrics frameworks.',
        longDescription: 'Creates operational metrics frameworks with KPIs, targets, and visualization recommendations.',
        category: 'generation',
        estimatedTimeSaved: '2-3 hours per framework',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'BarChart3',
        },
        inputs: [
          { id: 'operationType', label: 'Operation Type', type: 'text', placeholder: 'e.g., Customer Service, Manufacturing, Logistics', validation: { required: true } },
          { id: 'goals', label: 'Business Goals', type: 'textarea', placeholder: 'What are you trying to achieve?' },
          { id: 'currentMetrics', label: 'Current Metrics (if any)', type: 'textarea', placeholder: 'What do you currently track?' },
        ],
        prompts: {
          systemInstruction: `You are an operations metrics expert. Design dashboards that:
- Include leading and lagging indicators
- Define clear KPI calculations
- Set realistic targets and benchmarks
- Recommend visualization types
- Include drill-down hierarchies
- Consider data availability
- Enable actionable insights`,
          userPromptTemplate: `Design a metrics dashboard for {{operationType}}:

**Goals**: {{goals}}
**Current Metrics**: {{currentMetrics}}

Create a comprehensive operational metrics framework.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },

  // 18. Teacher / Educator
  {
    id: 'teacher-educator',
    name: 'Teacher / Educator',
    description: 'Lesson planning, curriculum design, assessment creation, and student engagement.',
    icon: 'GraduationCap',
    color: 'text-blue-600',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'skills-gap-analyzer',
      'cover-letter-generator',
    ],
    dynamicSkills: [
      {
        name: 'Lesson Plan Generator',
        description: 'Create comprehensive lesson plans for any subject.',
        longDescription: 'Generates detailed lesson plans with objectives, activities, assessments, and differentiation strategies.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per lesson',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'BookOpen',
        },
        inputs: [
          { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Math, English, Science', validation: { required: true } },
          { id: 'topic', label: 'Topic', type: 'text', placeholder: 'Specific lesson topic', validation: { required: true } },
          { id: 'gradeLevel', label: 'Grade Level', type: 'select', options: ['K-2', '3-5', '6-8', '9-12', 'Higher Education', 'Adult Education'] },
          { id: 'duration', label: 'Class Duration', type: 'select', options: ['30 minutes', '45 minutes', '60 minutes', '90 minutes'] },
          { id: 'standards', label: 'Standards (Optional)', type: 'text', placeholder: 'Common Core, State standards...' },
        ],
        prompts: {
          systemInstruction: `You are an experienced educator. Create lesson plans that include:
1. Learning objectives (measurable)
2. Materials needed
3. Warm-up/hook activity
4. Direct instruction
5. Guided practice
6. Independent practice
7. Assessment/check for understanding
8. Closure
9. Differentiation strategies (ELL, advanced, struggling)
10. Extension activities`,
          userPromptTemplate: `Create a {{duration}} lesson plan for {{gradeLevel}} {{subject}}:

**Topic**: {{topic}}
**Standards**: {{standards}}

Generate a comprehensive, engaging lesson plan.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.5,
        },
      },
      {
        name: 'Assessment Generator',
        description: 'Create quizzes, tests, and rubrics.',
        longDescription: 'Generates various assessment types including multiple choice, short answer, essays, and rubrics.',
        category: 'generation',
        estimatedTimeSaved: '1-2 hours per assessment',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'ClipboardCheck',
        },
        inputs: [
          { id: 'assessmentType', label: 'Assessment Type', type: 'select', options: ['Multiple Choice Quiz', 'Short Answer Test', 'Essay Prompts', 'Rubric', 'Performance Task', 'Exit Ticket'], validation: { required: true } },
          { id: 'topic', label: 'Topic/Content', type: 'textarea', placeholder: 'What should be assessed?', validation: { required: true } },
          { id: 'gradeLevel', label: 'Grade Level', type: 'select', options: ['K-2', '3-5', '6-8', '9-12', 'Higher Education'] },
          { id: 'bloomsLevel', label: 'Cognitive Level', type: 'select', options: ['Remember/Understand', 'Apply/Analyze', 'Evaluate/Create', 'Mixed'] },
        ],
        prompts: {
          systemInstruction: `You are an assessment design expert. Create assessments that:
- Align with learning objectives
- Include various difficulty levels
- Have clear instructions
- Include answer keys where appropriate
- Follow best practices for the assessment type
- Are fair and unbiased
- Include rubrics with clear criteria for open-ended items`,
          userPromptTemplate: `Create a {{assessmentType}} for {{gradeLevel}}:

**Topic**: {{topic}}
**Cognitive Level**: {{bloomsLevel}}

Generate a comprehensive assessment with answer key/rubric.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Parent Communication Drafter',
        description: 'Write professional communications to parents and guardians.',
        longDescription: 'Creates various parent communications including progress reports, newsletters, and meeting notes.',
        category: 'communication',
        estimatedTimeSaved: '30-60 min per communication',
        theme: {
          primary: 'text-purple-400',
          secondary: 'bg-purple-900/20',
          gradient: 'from-purple-500/20 to-transparent',
          iconName: 'Mail',
        },
        inputs: [
          { id: 'commType', label: 'Communication Type', type: 'select', options: ['Progress Report', 'Newsletter', 'Behavior Update', 'Conference Summary', 'Event Announcement', 'Welcome Letter'], validation: { required: true } },
          { id: 'content', label: 'Key Information', type: 'textarea', placeholder: 'What needs to be communicated?', validation: { required: true } },
          { id: 'tone', label: 'Tone', type: 'select', options: ['Warm & Positive', 'Concerned but Supportive', 'Informational', 'Celebratory'] },
        ],
        prompts: {
          systemInstruction: `You are an experienced teacher communicating with parents. Write messages that:
- Are professional yet warm
- Focus on student growth and potential
- Include specific examples when relevant
- Offer partnership language
- Include clear action items if needed
- Are culturally sensitive
- Avoid educational jargon`,
          userPromptTemplate: `Write a {{commType}} to parents:

**Content**: {{content}}
**Tone**: {{tone}}

Create a professional, effective parent communication.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 1536,
          temperature: 0.5,
        },
      },
    ],
  },

  // 19. Legal Professional
  {
    id: 'legal-professional',
    name: 'Legal Professional',
    description: 'Legal research, contract review, document drafting, and case analysis.',
    icon: 'Scale',
    color: 'text-amber-600',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'skills-gap-analyzer',
      'salary-negotiation-master',
    ],
    dynamicSkills: [
      {
        name: 'Contract Clause Analyzer',
        description: 'Analyze contract clauses and identify key terms and risks.',
        longDescription: 'Reviews contract language, identifies important clauses, and highlights potential risks or issues.',
        category: 'analysis',
        estimatedTimeSaved: '1-2 hours per contract',
        theme: {
          primary: 'text-amber-400',
          secondary: 'bg-amber-900/20',
          gradient: 'from-amber-500/20 to-transparent',
          iconName: 'FileSearch',
        },
        inputs: [
          { id: 'contractText', label: 'Contract Text', type: 'textarea', placeholder: 'Paste the contract or specific clauses...', validation: { required: true } },
          { id: 'contractType', label: 'Contract Type', type: 'select', options: ['Employment', 'NDA', 'SaaS/Software', 'Vendor/Supplier', 'Lease', 'Partnership', 'Other'] },
          { id: 'perspective', label: 'Reviewing As', type: 'select', options: ['Party A (Drafter)', 'Party B (Recipient)', 'Neutral Review'] },
        ],
        prompts: {
          systemInstruction: `You are a contract review specialist. Analyze contracts to:
1. Identify key terms and obligations
2. Highlight unusual or concerning clauses
3. Note missing standard protections
4. Flag ambiguous language
5. Summarize rights and obligations by party
6. Suggest negotiation points

DISCLAIMER: This is for informational purposes only and not legal advice.`,
          userPromptTemplate: `Analyze this {{contractType}} contract from {{perspective}} perspective:

{{contractText}}

Provide a comprehensive clause-by-clause analysis.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
      {
        name: 'Legal Document Summarizer',
        description: 'Summarize complex legal documents in plain language.',
        longDescription: 'Creates clear, accessible summaries of legal documents for non-lawyers.',
        category: 'analysis',
        estimatedTimeSaved: '1-2 hours per document',
        theme: {
          primary: 'text-blue-400',
          secondary: 'bg-blue-900/20',
          gradient: 'from-blue-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'document', label: 'Legal Document', type: 'textarea', placeholder: 'Paste the legal document...', validation: { required: true } },
          { id: 'audience', label: 'Summary For', type: 'select', options: ['Executive/Business', 'General Public', 'Technical Team', 'Compliance'] },
          { id: 'focusAreas', label: 'Focus Areas', type: 'textarea', placeholder: 'Any specific aspects to emphasize?' },
        ],
        prompts: {
          systemInstruction: `You are a legal communications specialist. Create summaries that:
- Use plain language (no legalese)
- Highlight key takeaways first
- Explain implications clearly
- Note important dates and deadlines
- Identify action items
- Flag areas requiring attention

DISCLAIMER: This summary is for informational purposes and not legal advice.`,
          userPromptTemplate: `Summarize this legal document for {{audience}}:

{{document}}

**Focus Areas**: {{focusAreas}}

Create a clear, accessible summary.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 3072,
          temperature: 0.3,
        },
      },
      {
        name: 'Legal Memo Drafter',
        description: 'Draft legal research memos and analysis.',
        longDescription: 'Creates structured legal memoranda with issue analysis, relevant law, and conclusions.',
        category: 'generation',
        estimatedTimeSaved: '2-4 hours per memo',
        theme: {
          primary: 'text-purple-400',
          secondary: 'bg-purple-900/20',
          gradient: 'from-purple-500/20 to-transparent',
          iconName: 'FileText',
        },
        inputs: [
          { id: 'issue', label: 'Legal Issue', type: 'textarea', placeholder: 'What is the legal question?', validation: { required: true } },
          { id: 'facts', label: 'Relevant Facts', type: 'textarea', placeholder: 'Key facts of the situation...' },
          { id: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'e.g., California, Federal, UK' },
          { id: 'memoType', label: 'Memo Type', type: 'select', options: ['Objective Analysis', 'Advocacy/Brief', 'Client Advisory'] },
        ],
        prompts: {
          systemInstruction: `You are a legal research specialist. Draft memos with:
1. Issue statement
2. Brief answer
3. Statement of facts
4. Discussion/analysis
5. Conclusion

Follow IRAC format. Note that legal research may need verification.
DISCLAIMER: This is a draft for informational purposes and requires attorney review.`,
          userPromptTemplate: `Draft a {{memoType}} memo:

**Issue**: {{issue}}
**Facts**: {{facts}}
**Jurisdiction**: {{jurisdiction}}

Create a structured legal memorandum.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.3,
        },
      },
    ],
  },

  // 20. Supply Chain Manager
  {
    id: 'supply-chain-manager',
    name: 'Supply Chain Manager',
    description: 'Logistics, inventory management, vendor relations, and supply chain optimization.',
    icon: 'Truck',
    color: 'text-indigo-500',
    staticSkillIds: [
      'job-readiness-score',
      'interview-prep',
      'linkedin-optimizer-pro',
      'salary-negotiation-master',
      'company-research',
    ],
    dynamicSkills: [
      {
        name: 'Vendor Evaluation Scorecard',
        description: 'Create comprehensive vendor evaluation frameworks.',
        longDescription: 'Generates vendor assessment scorecards with weighted criteria and evaluation methodology.',
        category: 'generation',
        estimatedTimeSaved: '2-3 hours per scorecard',
        theme: {
          primary: 'text-indigo-400',
          secondary: 'bg-indigo-900/20',
          gradient: 'from-indigo-500/20 to-transparent',
          iconName: 'ClipboardList',
        },
        inputs: [
          { id: 'vendorType', label: 'Vendor Type', type: 'text', placeholder: 'e.g., Raw Materials, Logistics, IT Services', validation: { required: true } },
          { id: 'priorities', label: 'Key Priorities', type: 'textarea', placeholder: 'Cost, quality, reliability, sustainability...', validation: { required: true } },
          { id: 'industryContext', label: 'Industry Context', type: 'text', placeholder: 'e.g., Manufacturing, Retail, Healthcare' },
        ],
        prompts: {
          systemInstruction: `You are a procurement expert. Create vendor scorecards that include:
1. Evaluation categories with weights
2. Specific criteria under each category
3. Scoring scale with definitions
4. Red flag indicators
5. Documentation requirements
6. Scoring methodology
7. Decision framework`,
          userPromptTemplate: `Create a vendor evaluation scorecard for {{vendorType}} in {{industryContext}}:

**Priorities**: {{priorities}}

Generate a comprehensive vendor evaluation framework.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Supply Chain Risk Analyzer',
        description: 'Identify and assess supply chain risks.',
        longDescription: 'Analyzes supply chain vulnerabilities and provides risk mitigation strategies.',
        category: 'analysis',
        estimatedTimeSaved: '3-5 hours per analysis',
        theme: {
          primary: 'text-red-400',
          secondary: 'bg-red-900/20',
          gradient: 'from-red-500/20 to-transparent',
          iconName: 'AlertTriangle',
        },
        inputs: [
          { id: 'supplyChain', label: 'Supply Chain Description', type: 'textarea', placeholder: 'Describe your supply chain, key suppliers, locations...', validation: { required: true } },
          { id: 'knownRisks', label: 'Known Risks/Concerns', type: 'textarea', placeholder: 'Any current issues or concerns?' },
          { id: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g., Electronics, Food & Beverage' },
        ],
        prompts: {
          systemInstruction: `You are a supply chain risk expert. Analyze risks including:
1. Supplier concentration risk
2. Geographic/geopolitical risks
3. Single points of failure
4. Demand volatility risks
5. Quality/compliance risks
6. Financial stability risks
7. Sustainability/ESG risks

Provide risk ratings and mitigation strategies.`,
          userPromptTemplate: `Analyze supply chain risks for {{industry}}:

**Supply Chain**: {{supplyChain}}
**Known Risks**: {{knownRisks}}

Provide comprehensive risk analysis with mitigation strategies.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
      {
        name: 'Inventory Optimization Advisor',
        description: 'Get recommendations for inventory management.',
        longDescription: 'Analyzes inventory data and provides optimization recommendations for stock levels and ordering.',
        category: 'analysis',
        estimatedTimeSaved: '2-4 hours per analysis',
        theme: {
          primary: 'text-green-400',
          secondary: 'bg-green-900/20',
          gradient: 'from-green-500/20 to-transparent',
          iconName: 'Package',
        },
        inputs: [
          { id: 'inventoryData', label: 'Inventory Information', type: 'textarea', placeholder: 'SKU data, turnover rates, lead times, current stock levels...', validation: { required: true } },
          { id: 'challenges', label: 'Current Challenges', type: 'textarea', placeholder: 'Stockouts, excess inventory, carrying costs...' },
          { id: 'goals', label: 'Optimization Goals', type: 'select', options: ['Reduce Carrying Costs', 'Improve Service Levels', 'Reduce Stockouts', 'Balance All'] },
        ],
        prompts: {
          systemInstruction: `You are an inventory management expert. Provide recommendations for:
1. Safety stock levels
2. Reorder points
3. Order quantities (EOQ considerations)
4. ABC/XYZ classification
5. Slow-moving inventory actions
6. Seasonal planning
7. KPIs to track`,
          userPromptTemplate: `Optimize inventory with goal to {{goals}}:

**Inventory Data**: {{inventoryData}}
**Challenges**: {{challenges}}

Provide actionable inventory optimization recommendations.`,
          outputFormat: 'markdown',
        },
        config: {
          recommendedModel: 'any',
          useWebSearch: false,
          maxTokens: 4096,
          temperature: 0.4,
        },
      },
    ],
  },
];

export function getRoleTemplate(roleId: string): RoleTemplate | undefined {
  return ROLE_TEMPLATES.find(r => r.id === roleId);
}

export function getRoleTemplateIds(): string[] {
  return ROLE_TEMPLATES.map(r => r.id);
}
