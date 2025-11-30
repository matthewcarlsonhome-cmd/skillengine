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
];

export function getRoleTemplate(roleId: string): RoleTemplate | undefined {
  return ROLE_TEMPLATES.find(r => r.id === roleId);
}

export function getRoleTemplateIds(): string[] {
  return ROLE_TEMPLATES.map(r => r.id);
}
