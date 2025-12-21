/**
 * Professional Workflows
 *
 * 10 production-ready workflows for professionals:
 * 1. Marketing Campaign Launch - Complete campaign creation workflow
 * 2. Product Launch GTM - Go-to-market strategy workflow
 * 3. Brand Development - Full brand positioning workflow
 * 4. Digital Marketing Audit - Comprehensive digital presence analysis
 * 5. Project Initiation - Complete project startup workflow
 * 6. Sprint Delivery - End-to-end sprint workflow
 * 7. Business Case Development - Full business case creation
 * 8. Requirements Gathering - Complete requirements workflow
 * 9. Process Improvement - Current to future state workflow
 * 10. Stakeholder Engagement - Communication and alignment workflow
 */

import type { Workflow } from '../storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 1: MARKETING CAMPAIGN LAUNCH
// Complete workflow from strategy to execution plan
// ═══════════════════════════════════════════════════════════════════════════

export const MARKETING_CAMPAIGN_WORKFLOW: Workflow = {
  id: 'marketing-campaign-launch',
  name: 'Marketing Campaign Launch',
  description: 'Create a complete marketing campaign from strategy to execution',
  longDescription: 'This workflow guides you through creating a comprehensive marketing campaign. Start with strategy and positioning, develop your content plan, create campaign assets, and build your measurement framework.',
  icon: 'Target',
  color: 'orange',
  estimatedTime: '45-60 minutes',

  outputs: [
    'Complete campaign strategy document',
    'Customer personas for targeting',
    'Content calendar with social posts',
    'Email campaign sequence',
    'Performance measurement framework'
  ],

  globalInputs: [
    {
      id: 'campaignGoal',
      label: 'Campaign Goal',
      type: 'select',
      options: ['Brand Awareness', 'Lead Generation', 'Product Launch', 'Customer Acquisition', 'Retention/Loyalty'],
      required: true,
    },
    {
      id: 'product',
      label: 'Product/Service',
      type: 'textarea',
      placeholder: 'What are you marketing? Key features and benefits...',
      required: true,
      rows: 4,
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      type: 'textarea',
      placeholder: 'Who are you trying to reach? Demographics, behaviors, pain points...',
      required: true,
      rows: 4,
    },
    {
      id: 'budget',
      label: 'Budget Range',
      type: 'select',
      options: ['Under $10K', '$10K-$50K', '$50K-$100K', '$100K+'],
      required: true,
    },
    {
      id: 'timeline',
      label: 'Campaign Duration',
      type: 'select',
      options: ['1 month', '3 months', '6 months'],
      required: true,
    },
    {
      id: 'channels',
      label: 'Available Channels',
      type: 'textarea',
      placeholder: 'Which channels can you use? (email, social, paid ads, content, events...)',
      required: false,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-strategy',
      skillId: 'campaign-strategy-builder',
      name: 'Create Campaign Strategy',
      description: 'Develop comprehensive campaign strategy with objectives, positioning, and channel mix',
      inputMappings: {
        campaignGoal: { type: 'global', inputId: 'campaignGoal' },
        product: { type: 'global', inputId: 'product' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
        budget: { type: 'global', inputId: 'budget' },
        timeline: { type: 'global', inputId: 'timeline' },
        channels: { type: 'global', inputId: 'channels' },
        competitors: { type: 'static', value: 'To be analyzed based on industry context' },
      },
      outputKey: 'campaignStrategy',
    },
    {
      id: 'step-persona',
      skillId: 'customer-persona-builder',
      name: 'Build Customer Personas',
      description: 'Create detailed buyer personas for campaign targeting',
      inputMappings: {
        product: { type: 'global', inputId: 'product' },
        audienceData: { type: 'global', inputId: 'targetAudience' },
        industry: { type: 'static', value: '' },
        personaType: { type: 'static', value: 'B2C Primary Buyer' },
        numberOfPersonas: { type: 'static', value: '2 Personas (Primary + Secondary)' },
        existingPersonas: { type: 'static', value: '' },
      },
      outputKey: 'personas',
    },
    {
      id: 'step-content-calendar',
      skillId: 'social-media-content-calendar',
      name: 'Create Content Calendar',
      description: 'Generate social media content calendar aligned with campaign',
      inputMappings: {
        platforms: { type: 'static', value: 'Instagram, LinkedIn, Twitter/X' },
        brand: { type: 'global', inputId: 'product' },
        audience: { type: 'previous', stepId: 'step-persona', outputKey: 'personas' },
        goals: { type: 'global', inputId: 'campaignGoal' },
        contentPillars: { type: 'previous', stepId: 'step-strategy', outputKey: 'campaignStrategy' },
        period: { type: 'static', value: '1 Month' },
        frequency: { type: 'static', value: 'Instagram: 5x/week, LinkedIn: 3x/week' },
        campaigns: { type: 'previous', stepId: 'step-strategy', outputKey: 'campaignStrategy' },
      },
      outputKey: 'contentCalendar',
    },
    {
      id: 'step-email',
      skillId: 'email-marketing-campaign-designer',
      name: 'Design Email Campaign',
      description: 'Create email sequences for lead nurturing and conversion',
      inputMappings: {
        campaignType: { type: 'static', value: 'Promotional Campaign' },
        audience: { type: 'previous', stepId: 'step-persona', outputKey: 'personas' },
        goal: { type: 'global', inputId: 'campaignGoal' },
        product: { type: 'global', inputId: 'product' },
        numberOfEmails: { type: 'static', value: '5 Email Sequence' },
        brandVoice: { type: 'previous', stepId: 'step-strategy', outputKey: 'campaignStrategy' },
        existingData: { type: 'static', value: '' },
      },
      outputKey: 'emailCampaign',
    },
    {
      id: 'step-analytics',
      skillId: 'marketing-analytics-dashboard-designer',
      name: 'Design Measurement Framework',
      description: 'Create analytics dashboard specifications for campaign tracking',
      inputMappings: {
        stakeholders: { type: 'static', value: 'Marketing Leadership' },
        objectives: { type: 'global', inputId: 'campaignGoal' },
        channels: { type: 'global', inputId: 'channels' },
        tools: { type: 'static', value: 'Google Analytics, social platforms, email platform' },
        platform: { type: 'static', value: 'Looker Studio (Data Studio)' },
        refreshFrequency: { type: 'static', value: 'Daily' },
        existingMetrics: { type: 'static', value: '' },
      },
      outputKey: 'measurementFramework',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 2: PRODUCT LAUNCH GTM
// Complete go-to-market strategy for product launches
// ═══════════════════════════════════════════════════════════════════════════

export const PRODUCT_LAUNCH_GTM_WORKFLOW: Workflow = {
  id: 'product-launch-gtm',
  name: 'Product Launch GTM',
  description: 'Complete go-to-market strategy for launching a product or service',
  longDescription: 'This workflow creates a comprehensive go-to-market strategy for product launches. Covers market analysis, positioning, pricing, channel strategy, and launch execution planning.',
  icon: 'Rocket',
  color: 'blue',
  estimatedTime: '50-70 minutes',

  outputs: [
    'Complete GTM strategy document',
    'Competitive analysis report',
    'Brand positioning framework',
    'Marketing budget plan',
    'Launch campaign strategy'
  ],

  globalInputs: [
    {
      id: 'product',
      label: 'Product/Service',
      type: 'textarea',
      placeholder: 'Describe your product, key features, and unique value proposition...',
      required: true,
      rows: 6,
    },
    {
      id: 'targetMarket',
      label: 'Target Market',
      type: 'textarea',
      placeholder: 'Who is this for? ICP, market size, geographic focus...',
      required: true,
      rows: 4,
    },
    {
      id: 'competition',
      label: 'Competitive Landscape',
      type: 'textarea',
      placeholder: 'Key competitors, their strengths, your differentiation...',
      required: true,
      rows: 4,
    },
    {
      id: 'launchDate',
      label: 'Target Launch Date',
      type: 'text',
      placeholder: 'e.g., Q2 2024, June 2024',
      required: true,
    },
    {
      id: 'budget',
      label: 'Marketing Budget',
      type: 'text',
      placeholder: 'e.g., $100,000',
      required: true,
    },
  ],

  steps: [
    {
      id: 'step-competitive',
      skillId: 'competitive-analysis-report',
      name: 'Analyze Competition',
      description: 'Deep dive into competitive landscape and positioning opportunities',
      inputMappings: {
        yourCompany: { type: 'global', inputId: 'product' },
        competitors: { type: 'global', inputId: 'competition' },
        industry: { type: 'static', value: '' },
        focusAreas: { type: 'static', value: 'Product features, pricing, marketing, positioning' },
        targetMarket: { type: 'global', inputId: 'targetMarket' },
        objectives: { type: 'static', value: 'Identify differentiation opportunities for product launch' },
      },
      outputKey: 'competitiveAnalysis',
    },
    {
      id: 'step-positioning',
      skillId: 'brand-positioning-framework',
      name: 'Define Positioning',
      description: 'Create brand positioning and messaging framework',
      inputMappings: {
        brandName: { type: 'static', value: '' },
        industry: { type: 'static', value: '' },
        currentPositioning: { type: 'static', value: 'New product launch' },
        targetAudience: { type: 'global', inputId: 'targetMarket' },
        competitors: { type: 'previous', stepId: 'step-competitive', outputKey: 'competitiveAnalysis' },
        differentiators: { type: 'global', inputId: 'product' },
        brandValues: { type: 'static', value: '' },
        aspirations: { type: 'static', value: '' },
      },
      outputKey: 'positioning',
    },
    {
      id: 'step-gtm',
      skillId: 'go-to-market-strategy',
      name: 'Build GTM Strategy',
      description: 'Complete go-to-market strategy with channel and pricing plans',
      inputMappings: {
        product: { type: 'global', inputId: 'product' },
        gtmType: { type: 'static', value: 'New Product Launch' },
        targetMarket: { type: 'global', inputId: 'targetMarket' },
        competition: { type: 'previous', stepId: 'step-competitive', outputKey: 'competitiveAnalysis' },
        pricing: { type: 'static', value: '' },
        resources: { type: 'global', inputId: 'budget' },
        timeline: { type: 'global', inputId: 'launchDate' },
        successMetrics: { type: 'static', value: '' },
      },
      outputKey: 'gtmStrategy',
    },
    {
      id: 'step-budget',
      skillId: 'marketing-budget-planner',
      name: 'Plan Marketing Budget',
      description: 'Allocate marketing budget across channels and tactics',
      inputMappings: {
        totalBudget: { type: 'global', inputId: 'budget' },
        objectives: { type: 'previous', stepId: 'step-gtm', outputKey: 'gtmStrategy' },
        currentSpend: { type: 'static', value: 'New launch - no current spend' },
        channels: { type: 'previous', stepId: 'step-gtm', outputKey: 'gtmStrategy' },
        audience: { type: 'global', inputId: 'targetMarket' },
        salesCycle: { type: 'static', value: 'Medium (1-3 months)' },
        constraints: { type: 'static', value: '' },
      },
      outputKey: 'budgetPlan',
    },
    {
      id: 'step-launch-campaign',
      skillId: 'campaign-strategy-builder',
      name: 'Create Launch Campaign',
      description: 'Design the launch campaign strategy',
      inputMappings: {
        campaignGoal: { type: 'static', value: 'Product Launch' },
        targetAudience: { type: 'global', inputId: 'targetMarket' },
        product: { type: 'global', inputId: 'product' },
        budget: { type: 'global', inputId: 'budget' },
        timeline: { type: 'static', value: '3 months' },
        channels: { type: 'previous', stepId: 'step-gtm', outputKey: 'gtmStrategy' },
        competitors: { type: 'previous', stepId: 'step-competitive', outputKey: 'competitiveAnalysis' },
      },
      outputKey: 'launchCampaign',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 3: DIGITAL MARKETING AUDIT
// Comprehensive digital presence analysis
// ═══════════════════════════════════════════════════════════════════════════

export const DIGITAL_MARKETING_AUDIT_WORKFLOW: Workflow = {
  id: 'digital-marketing-audit',
  name: 'Digital Marketing Audit',
  description: 'Comprehensive audit of your digital marketing presence and strategy',
  longDescription: 'Analyze your entire digital marketing ecosystem including SEO, paid advertising, social media, and automation. Get actionable recommendations for improvement.',
  icon: 'Search',
  color: 'green',
  estimatedTime: '35-45 minutes',

  outputs: [
    'SEO content optimization report',
    'Landing page conversion analysis',
    'PPC campaign recommendations',
    'Marketing automation assessment',
  ],

  globalInputs: [
    {
      id: 'website',
      label: 'Website URL',
      type: 'text',
      placeholder: 'https://yoursite.com',
      required: true,
    },
    {
      id: 'business',
      label: 'Business Description',
      type: 'textarea',
      placeholder: 'Describe your business, products/services, and target market...',
      required: true,
      rows: 4,
    },
    {
      id: 'goals',
      label: 'Marketing Goals',
      type: 'textarea',
      placeholder: 'What are your primary marketing goals? (leads, sales, awareness...)',
      required: true,
      rows: 2,
    },
    {
      id: 'currentEfforts',
      label: 'Current Marketing Efforts',
      type: 'textarea',
      placeholder: 'What channels are you currently using? Any performance data...',
      required: true,
      rows: 4,
    },
    {
      id: 'competitors',
      label: 'Key Competitors',
      type: 'textarea',
      placeholder: 'List 3-5 competitors...',
      required: false,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-seo',
      skillId: 'seo-content-optimizer',
      name: 'SEO Analysis',
      description: 'Analyze content and provide SEO optimization recommendations',
      inputMappings: {
        content: { type: 'global', inputId: 'business' },
        targetKeyword: { type: 'static', value: '' },
        secondaryKeywords: { type: 'static', value: '' },
        searchIntent: { type: 'static', value: 'Commercial Investigation' },
        currentRanking: { type: 'static', value: 'Unknown' },
        competitors: { type: 'global', inputId: 'competitors' },
      },
      outputKey: 'seoAnalysis',
    },
    {
      id: 'step-landing',
      skillId: 'landing-page-conversion-optimizer',
      name: 'Landing Page Audit',
      description: 'Analyze landing pages for conversion optimization',
      inputMappings: {
        pageUrl: { type: 'global', inputId: 'website' },
        pageContent: { type: 'global', inputId: 'business' },
        conversionGoal: { type: 'static', value: 'Lead Form Submission' },
        audience: { type: 'global', inputId: 'business' },
        trafficSource: { type: 'static', value: 'Organic Search' },
        currentRate: { type: 'static', value: 'Unknown' },
        issues: { type: 'static', value: '' },
      },
      outputKey: 'landingPageAudit',
    },
    {
      id: 'step-ppc',
      skillId: 'ppc-campaign-builder',
      name: 'PPC Strategy',
      description: 'Develop paid advertising strategy recommendations',
      inputMappings: {
        platform: { type: 'static', value: 'Google Ads - Search' },
        objective: { type: 'static', value: 'Lead Generation' },
        product: { type: 'global', inputId: 'business' },
        audience: { type: 'global', inputId: 'business' },
        budget: { type: 'static', value: 'To be determined' },
        competitors: { type: 'global', inputId: 'competitors' },
        landingPage: { type: 'global', inputId: 'website' },
        existingData: { type: 'global', inputId: 'currentEfforts' },
      },
      outputKey: 'ppcStrategy',
    },
    {
      id: 'step-automation',
      skillId: 'marketing-automation-workflow-designer',
      name: 'Automation Assessment',
      description: 'Recommend marketing automation workflows',
      inputMappings: {
        workflowType: { type: 'static', value: 'Lead Nurture' },
        platform: { type: 'static', value: 'HubSpot' },
        objective: { type: 'global', inputId: 'goals' },
        audience: { type: 'global', inputId: 'business' },
        channels: { type: 'static', value: 'Email, website' },
        dataPoints: { type: 'global', inputId: 'currentEfforts' },
        salesProcess: { type: 'static', value: '' },
      },
      outputKey: 'automationPlan',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 4: PROJECT INITIATION
// Complete project startup workflow
// ═══════════════════════════════════════════════════════════════════════════

export const PROJECT_INITIATION_WORKFLOW: Workflow = {
  id: 'project-initiation',
  name: 'Project Initiation',
  description: 'Complete project initiation with charter, stakeholders, and risk assessment',
  longDescription: 'Launch your project with all essential documentation. Create the project charter, identify and plan stakeholder communications, and conduct initial risk assessment.',
  icon: 'FileText',
  color: 'indigo',
  estimatedTime: '40-55 minutes',

  outputs: [
    'Project charter document',
    'Stakeholder communication plan',
    'Risk assessment matrix',
    'Resource capacity plan'
  ],

  globalInputs: [
    {
      id: 'projectName',
      label: 'Project Name',
      type: 'text',
      placeholder: 'e.g., Customer Portal Redesign',
      required: true,
    },
    {
      id: 'businessNeed',
      label: 'Business Need',
      type: 'textarea',
      placeholder: 'What business problem does this project solve? Why now?',
      required: true,
      rows: 4,
    },
    {
      id: 'objectives',
      label: 'Project Objectives',
      type: 'textarea',
      placeholder: 'What are the desired outcomes? Be specific and measurable...',
      required: true,
      rows: 3,
    },
    {
      id: 'scope',
      label: 'Project Scope',
      type: 'textarea',
      placeholder: 'What\'s included? What\'s out of scope?',
      required: true,
      rows: 4,
    },
    {
      id: 'stakeholders',
      label: 'Key Stakeholders',
      type: 'textarea',
      placeholder: 'Sponsor, stakeholders, team members with roles...',
      required: true,
      rows: 4,
    },
    {
      id: 'timeline',
      label: 'Target Timeline',
      type: 'text',
      placeholder: 'e.g., 6 months, Q2-Q4 2024',
      required: true,
    },
    {
      id: 'budget',
      label: 'Budget',
      type: 'text',
      placeholder: 'e.g., $250,000',
      required: false,
    },
  ],

  steps: [
    {
      id: 'step-charter',
      skillId: 'project-charter-generator',
      name: 'Create Project Charter',
      description: 'Generate comprehensive project charter document',
      inputMappings: {
        projectName: { type: 'global', inputId: 'projectName' },
        businessNeed: { type: 'global', inputId: 'businessNeed' },
        objectives: { type: 'global', inputId: 'objectives' },
        scope: { type: 'global', inputId: 'scope' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        constraints: { type: 'static', value: '' },
        timeline: { type: 'global', inputId: 'timeline' },
        budget: { type: 'global', inputId: 'budget' },
      },
      outputKey: 'projectCharter',
    },
    {
      id: 'step-stakeholders',
      skillId: 'stakeholder-communication-plan',
      name: 'Plan Stakeholder Communication',
      description: 'Develop stakeholder analysis and communication strategy',
      inputMappings: {
        projectName: { type: 'global', inputId: 'projectName' },
        projectDescription: { type: 'global', inputId: 'businessNeed' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        challenges: { type: 'static', value: '' },
        existingChannels: { type: 'static', value: 'Email, Teams/Slack, SharePoint' },
        projectPhase: { type: 'static', value: 'Initiation' },
      },
      outputKey: 'communicationPlan',
    },
    {
      id: 'step-risks',
      skillId: 'risk-assessment-matrix',
      name: 'Assess Project Risks',
      description: 'Identify and analyze initial project risks',
      inputMappings: {
        projectDescription: { type: 'previous', stepId: 'step-charter', outputKey: 'projectCharter' },
        projectType: { type: 'static', value: 'Software Development' },
        knownRisks: { type: 'static', value: '' },
        constraints: { type: 'static', value: '' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        pastProjects: { type: 'static', value: '' },
      },
      outputKey: 'riskAssessment',
    },
    {
      id: 'step-resources',
      skillId: 'resource-capacity-planner',
      name: 'Plan Resource Capacity',
      description: 'Create initial resource and capacity plan',
      inputMappings: {
        planningPeriod: { type: 'global', inputId: 'timeline' },
        teamMembers: { type: 'global', inputId: 'stakeholders' },
        projects: { type: 'previous', stepId: 'step-charter', outputKey: 'projectCharter' },
        constraints: { type: 'static', value: '' },
        skills: { type: 'static', value: '' },
        priorities: { type: 'static', value: '' },
      },
      outputKey: 'resourcePlan',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 5: SPRINT DELIVERY
// End-to-end sprint workflow
// ═══════════════════════════════════════════════════════════════════════════

export const SPRINT_DELIVERY_WORKFLOW: Workflow = {
  id: 'sprint-delivery',
  name: 'Sprint Delivery',
  description: 'Complete sprint planning with stories, planning, and review preparation',
  longDescription: 'Run a complete sprint cycle with user story creation, sprint planning, status reporting, and retrospective facilitation.',
  icon: 'Layers',
  color: 'purple',
  estimatedTime: '30-40 minutes',

  outputs: [
    'User stories with acceptance criteria',
    'Sprint plan with capacity',
    'Sprint status report template',
    'Retrospective meeting guide'
  ],

  globalInputs: [
    {
      id: 'sprintNumber',
      label: 'Sprint Number',
      type: 'text',
      placeholder: 'e.g., Sprint 14',
      required: true,
    },
    {
      id: 'sprintGoal',
      label: 'Sprint Goal',
      type: 'textarea',
      placeholder: 'What is the objective for this sprint?',
      required: true,
      rows: 2,
    },
    {
      id: 'backlogItems',
      label: 'Backlog Items',
      type: 'textarea',
      placeholder: 'Features and stories being considered for this sprint...',
      required: true,
      rows: 6,
    },
    {
      id: 'teamCapacity',
      label: 'Team Capacity',
      type: 'textarea',
      placeholder: 'Team members, availability, past velocity...',
      required: true,
      rows: 3,
    },
    {
      id: 'sprintLength',
      label: 'Sprint Length',
      type: 'select',
      options: ['1 week', '2 weeks', '3 weeks'],
      required: true,
    },
  ],

  steps: [
    {
      id: 'step-stories',
      skillId: 'user-story-generator',
      name: 'Create User Stories',
      description: 'Break down backlog items into sprint-ready user stories',
      inputMappings: {
        feature: { type: 'global', inputId: 'backlogItems' },
        userTypes: { type: 'static', value: 'End users, administrators' },
        context: { type: 'global', inputId: 'sprintGoal' },
        constraints: { type: 'static', value: '' },
        existingFeatures: { type: 'static', value: '' },
        storyDepth: { type: 'static', value: 'Sprint-Ready Stories' },
      },
      outputKey: 'userStories',
    },
    {
      id: 'step-planning',
      skillId: 'sprint-planning-assistant',
      name: 'Plan Sprint',
      description: 'Create sprint plan with capacity and commitment',
      inputMappings: {
        sprintGoal: { type: 'global', inputId: 'sprintGoal' },
        backlogItems: { type: 'previous', stepId: 'step-stories', outputKey: 'userStories' },
        teamCapacity: { type: 'global', inputId: 'teamCapacity' },
        sprintLength: { type: 'global', inputId: 'sprintLength' },
        techDebt: { type: 'static', value: '' },
        dependencies: { type: 'static', value: '' },
        pastSprints: { type: 'static', value: '' },
      },
      outputKey: 'sprintPlan',
    },
    {
      id: 'step-status',
      skillId: 'project-status-report-generator',
      name: 'Prepare Status Template',
      description: 'Create sprint status report template',
      inputMappings: {
        projectName: { type: 'global', inputId: 'sprintNumber' },
        reportPeriod: { type: 'global', inputId: 'sprintLength' },
        overallStatus: { type: 'static', value: 'Green - On Track' },
        accomplishments: { type: 'previous', stepId: 'step-planning', outputKey: 'sprintPlan' },
        milestones: { type: 'global', inputId: 'sprintGoal' },
        risksIssues: { type: 'static', value: 'To be updated during sprint' },
        nextSteps: { type: 'static', value: 'To be updated' },
        decisions: { type: 'static', value: '' },
        budget: { type: 'static', value: 'N/A' },
        resources: { type: 'global', inputId: 'teamCapacity' },
      },
      outputKey: 'statusTemplate',
    },
    {
      id: 'step-retro',
      skillId: 'meeting-agenda-minutes-generator',
      name: 'Prepare Retrospective',
      description: 'Create retrospective meeting agenda',
      inputMappings: {
        documentType: { type: 'static', value: 'Meeting Agenda' },
        meetingType: { type: 'static', value: 'Retrospective' },
        meetingDetails: { type: 'computed', template: '{{sprintNumber}} Retrospective' },
        objectives: { type: 'static', value: 'Identify what went well, what can improve, and action items for next sprint' },
        topics: { type: 'previous', stepId: 'step-planning', outputKey: 'sprintPlan' },
        previousActions: { type: 'static', value: '' },
        decisions: { type: 'static', value: '' },
      },
      outputKey: 'retroAgenda',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 6: BUSINESS CASE DEVELOPMENT
// Full business case creation workflow
// ═══════════════════════════════════════════════════════════════════════════

export const BUSINESS_CASE_WORKFLOW: Workflow = {
  id: 'business-case-development',
  name: 'Business Case Development',
  description: 'Create a comprehensive business case with financial analysis and recommendations',
  longDescription: 'Develop a complete business case including gap analysis, requirements gathering, financial justification, and executive presentation.',
  icon: 'TrendingUp',
  color: 'green',
  estimatedTime: '45-60 minutes',

  outputs: [
    'Gap analysis report',
    'Business requirements document',
    'Business case with financials',
    'Executive presentation outline'
  ],

  globalInputs: [
    {
      id: 'initiativeName',
      label: 'Initiative Name',
      type: 'text',
      placeholder: 'e.g., CRM Implementation',
      required: true,
    },
    {
      id: 'problem',
      label: 'Problem/Opportunity',
      type: 'textarea',
      placeholder: 'What problem are we solving or opportunity are we capturing?',
      required: true,
      rows: 4,
    },
    {
      id: 'currentState',
      label: 'Current State',
      type: 'textarea',
      placeholder: 'Describe current capabilities, processes, and pain points...',
      required: true,
      rows: 4,
    },
    {
      id: 'desiredState',
      label: 'Desired Future State',
      type: 'textarea',
      placeholder: 'What does success look like? Target capabilities...',
      required: true,
      rows: 4,
    },
    {
      id: 'costs',
      label: 'Estimated Costs',
      type: 'textarea',
      placeholder: 'Implementation costs, ongoing costs, resources needed...',
      required: true,
      rows: 3,
    },
    {
      id: 'benefits',
      label: 'Expected Benefits',
      type: 'textarea',
      placeholder: 'Revenue increase, cost reduction, risk reduction, strategic value...',
      required: true,
      rows: 3,
    },
    {
      id: 'stakeholders',
      label: 'Key Stakeholders',
      type: 'textarea',
      placeholder: 'Decision makers and influencers...',
      required: true,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-gap',
      skillId: 'gap-analysis-report',
      name: 'Analyze Gaps',
      description: 'Conduct comprehensive gap analysis between current and future state',
      inputMappings: {
        analysisSubject: { type: 'global', inputId: 'initiativeName' },
        currentState: { type: 'global', inputId: 'currentState' },
        desiredState: { type: 'global', inputId: 'desiredState' },
        context: { type: 'global', inputId: 'problem' },
        constraints: { type: 'static', value: '' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        priority: { type: 'static', value: '' },
      },
      outputKey: 'gapAnalysis',
    },
    {
      id: 'step-requirements',
      skillId: 'business-requirements-document-generator',
      name: 'Document Requirements',
      description: 'Create business requirements based on gap analysis',
      inputMappings: {
        projectName: { type: 'global', inputId: 'initiativeName' },
        businessContext: { type: 'global', inputId: 'problem' },
        objectives: { type: 'global', inputId: 'desiredState' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        scope: { type: 'previous', stepId: 'step-gap', outputKey: 'gapAnalysis' },
        requirements: { type: 'previous', stepId: 'step-gap', outputKey: 'gapAnalysis' },
        constraints: { type: 'static', value: '' },
        assumptions: { type: 'static', value: '' },
      },
      outputKey: 'requirements',
    },
    {
      id: 'step-case',
      skillId: 'business-case-builder',
      name: 'Build Business Case',
      description: 'Create comprehensive business case with financial analysis',
      inputMappings: {
        initiativeName: { type: 'global', inputId: 'initiativeName' },
        problem: { type: 'global', inputId: 'problem' },
        solution: { type: 'previous', stepId: 'step-requirements', outputKey: 'requirements' },
        alternatives: { type: 'static', value: 'Do nothing, phased approach, full implementation' },
        costs: { type: 'global', inputId: 'costs' },
        benefits: { type: 'global', inputId: 'benefits' },
        timeline: { type: 'static', value: '12 months implementation' },
        risks: { type: 'previous', stepId: 'step-gap', outputKey: 'gapAnalysis' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
      },
      outputKey: 'businessCase',
    },
    {
      id: 'step-presentation',
      skillId: 'meeting-agenda-minutes-generator',
      name: 'Prepare Presentation',
      description: 'Create executive presentation agenda',
      inputMappings: {
        documentType: { type: 'static', value: 'Meeting Agenda' },
        meetingType: { type: 'static', value: 'Decision Meeting' },
        meetingDetails: { type: 'computed', template: '{{initiativeName}} Business Case Review' },
        objectives: { type: 'static', value: 'Review business case and obtain approval decision' },
        topics: { type: 'previous', stepId: 'step-case', outputKey: 'businessCase' },
        previousActions: { type: 'static', value: '' },
        decisions: { type: 'static', value: 'Approve/Reject/Defer initiative, approve budget' },
      },
      outputKey: 'presentationAgenda',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 7: REQUIREMENTS GATHERING
// Complete requirements elicitation workflow
// ═══════════════════════════════════════════════════════════════════════════

export const REQUIREMENTS_GATHERING_WORKFLOW: Workflow = {
  id: 'requirements-gathering',
  name: 'Requirements Gathering',
  description: 'Complete requirements elicitation from stakeholder interviews to documentation',
  longDescription: 'Conduct thorough requirements gathering with interview preparation, process analysis, requirements documentation, and user story creation.',
  icon: 'ClipboardList',
  color: 'amber',
  estimatedTime: '35-45 minutes',

  outputs: [
    'Stakeholder interview guides',
    'Process flow documentation',
    'Business requirements document',
    'User stories for development'
  ],

  globalInputs: [
    {
      id: 'projectName',
      label: 'Project/Initiative',
      type: 'text',
      placeholder: 'e.g., Customer Portal Enhancement',
      required: true,
    },
    {
      id: 'businessContext',
      label: 'Business Context',
      type: 'textarea',
      placeholder: 'What is the business need? Why is this project happening?',
      required: true,
      rows: 4,
    },
    {
      id: 'stakeholders',
      label: 'Key Stakeholders',
      type: 'textarea',
      placeholder: 'List stakeholders to interview with their roles...',
      required: true,
      rows: 4,
    },
    {
      id: 'processes',
      label: 'Affected Processes',
      type: 'textarea',
      placeholder: 'What business processes will be impacted or analyzed?',
      required: true,
      rows: 3,
    },
    {
      id: 'knownRequirements',
      label: 'Known Requirements',
      type: 'textarea',
      placeholder: 'Any requirements already identified...',
      required: false,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-interview',
      skillId: 'stakeholder-interview-guide',
      name: 'Prepare Interview Guides',
      description: 'Create structured interview guides for stakeholder interviews',
      inputMappings: {
        interviewPurpose: { type: 'global', inputId: 'businessContext' },
        stakeholderRole: { type: 'static', value: 'Business stakeholder' },
        projectContext: { type: 'global', inputId: 'businessContext' },
        focusAreas: { type: 'global', inputId: 'processes' },
        knownInfo: { type: 'global', inputId: 'knownRequirements' },
        interviewType: { type: 'static', value: 'Requirements Gathering' },
        duration: { type: 'static', value: '60 minutes' },
      },
      outputKey: 'interviewGuide',
    },
    {
      id: 'step-process',
      skillId: 'process-flow-mapper',
      name: 'Map Processes',
      description: 'Document current business processes',
      inputMappings: {
        processName: { type: 'global', inputId: 'processes' },
        processDescription: { type: 'global', inputId: 'businessContext' },
        steps: { type: 'static', value: 'To be gathered from interviews' },
        actors: { type: 'global', inputId: 'stakeholders' },
        painPoints: { type: 'static', value: 'To be identified' },
        systems: { type: 'static', value: '' },
        analysisGoal: { type: 'static', value: 'Document Current State' },
      },
      outputKey: 'processDocumentation',
    },
    {
      id: 'step-brd',
      skillId: 'business-requirements-document-generator',
      name: 'Create BRD',
      description: 'Document business requirements',
      inputMappings: {
        projectName: { type: 'global', inputId: 'projectName' },
        businessContext: { type: 'global', inputId: 'businessContext' },
        objectives: { type: 'static', value: '' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        scope: { type: 'previous', stepId: 'step-process', outputKey: 'processDocumentation' },
        requirements: { type: 'global', inputId: 'knownRequirements' },
        constraints: { type: 'static', value: '' },
        assumptions: { type: 'static', value: '' },
      },
      outputKey: 'brd',
    },
    {
      id: 'step-stories',
      skillId: 'user-story-generator',
      name: 'Generate User Stories',
      description: 'Convert requirements into development-ready user stories',
      inputMappings: {
        feature: { type: 'previous', stepId: 'step-brd', outputKey: 'brd' },
        userTypes: { type: 'global', inputId: 'stakeholders' },
        context: { type: 'global', inputId: 'businessContext' },
        constraints: { type: 'static', value: '' },
        existingFeatures: { type: 'static', value: '' },
        storyDepth: { type: 'static', value: 'Feature Level' },
      },
      outputKey: 'userStories',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 8: PROCESS IMPROVEMENT
// Current to future state workflow
// ═══════════════════════════════════════════════════════════════════════════

export const PROCESS_IMPROVEMENT_WORKFLOW: Workflow = {
  id: 'process-improvement',
  name: 'Process Improvement',
  description: 'Complete process improvement from current state analysis to implementation plan',
  longDescription: 'Analyze existing processes, identify improvement opportunities, design future state, and create implementation roadmap.',
  icon: 'GitBranch',
  color: 'cyan',
  estimatedTime: '40-50 minutes',

  outputs: [
    'Current state process documentation',
    'Gap analysis with improvement opportunities',
    'Future state process design',
    'Implementation roadmap'
  ],

  globalInputs: [
    {
      id: 'processName',
      label: 'Process Name',
      type: 'text',
      placeholder: 'e.g., Order Fulfillment Process',
      required: true,
    },
    {
      id: 'processDescription',
      label: 'Process Description',
      type: 'textarea',
      placeholder: 'Describe the process, its purpose, and why improvement is needed...',
      required: true,
      rows: 4,
    },
    {
      id: 'currentSteps',
      label: 'Current Process Steps',
      type: 'textarea',
      placeholder: 'Describe the current process steps...',
      required: true,
      rows: 6,
    },
    {
      id: 'painPoints',
      label: 'Known Pain Points',
      type: 'textarea',
      placeholder: 'Current issues, inefficiencies, bottlenecks...',
      required: true,
      rows: 4,
    },
    {
      id: 'desiredOutcomes',
      label: 'Desired Outcomes',
      type: 'textarea',
      placeholder: 'What does the improved process look like? Target metrics...',
      required: true,
      rows: 3,
    },
    {
      id: 'stakeholders',
      label: 'Stakeholders',
      type: 'textarea',
      placeholder: 'Who is involved in this process?',
      required: true,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-current',
      skillId: 'process-flow-mapper',
      name: 'Document Current State',
      description: 'Map and document current process in detail',
      inputMappings: {
        processName: { type: 'global', inputId: 'processName' },
        processDescription: { type: 'global', inputId: 'processDescription' },
        steps: { type: 'global', inputId: 'currentSteps' },
        actors: { type: 'global', inputId: 'stakeholders' },
        painPoints: { type: 'global', inputId: 'painPoints' },
        systems: { type: 'static', value: '' },
        analysisGoal: { type: 'static', value: 'Identify Improvements' },
      },
      outputKey: 'currentState',
    },
    {
      id: 'step-gap',
      skillId: 'gap-analysis-report',
      name: 'Analyze Gaps',
      description: 'Identify gaps between current and desired state',
      inputMappings: {
        analysisSubject: { type: 'global', inputId: 'processName' },
        currentState: { type: 'previous', stepId: 'step-current', outputKey: 'currentState' },
        desiredState: { type: 'global', inputId: 'desiredOutcomes' },
        context: { type: 'global', inputId: 'processDescription' },
        constraints: { type: 'static', value: '' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
        priority: { type: 'global', inputId: 'painPoints' },
      },
      outputKey: 'gapAnalysis',
    },
    {
      id: 'step-future',
      skillId: 'process-flow-mapper',
      name: 'Design Future State',
      description: 'Design optimized future state process',
      inputMappings: {
        processName: { type: 'computed', template: '{{processName}} (Future State)' },
        processDescription: { type: 'global', inputId: 'desiredOutcomes' },
        steps: { type: 'previous', stepId: 'step-gap', outputKey: 'gapAnalysis' },
        actors: { type: 'global', inputId: 'stakeholders' },
        painPoints: { type: 'static', value: 'Addressed in redesign' },
        systems: { type: 'static', value: '' },
        analysisGoal: { type: 'static', value: 'Design Future State' },
      },
      outputKey: 'futureState',
    },
    {
      id: 'step-roadmap',
      skillId: 'business-case-builder',
      name: 'Create Implementation Roadmap',
      description: 'Build implementation plan with timeline and resources',
      inputMappings: {
        initiativeName: { type: 'computed', template: '{{processName}} Improvement' },
        problem: { type: 'global', inputId: 'painPoints' },
        solution: { type: 'previous', stepId: 'step-future', outputKey: 'futureState' },
        alternatives: { type: 'static', value: '' },
        costs: { type: 'static', value: 'To be estimated' },
        benefits: { type: 'global', inputId: 'desiredOutcomes' },
        timeline: { type: 'static', value: '' },
        risks: { type: 'previous', stepId: 'step-gap', outputKey: 'gapAnalysis' },
        stakeholders: { type: 'global', inputId: 'stakeholders' },
      },
      outputKey: 'implementationPlan',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 9: INFLUENCER CAMPAIGN
// Complete influencer marketing workflow
// ═══════════════════════════════════════════════════════════════════════════

export const INFLUENCER_CAMPAIGN_WORKFLOW: Workflow = {
  id: 'influencer-campaign',
  name: 'Influencer Campaign',
  description: 'Plan and launch a complete influencer marketing campaign',
  longDescription: 'Create a comprehensive influencer marketing campaign from strategy to content creation and measurement.',
  icon: 'Users',
  color: 'rose',
  estimatedTime: '35-45 minutes',

  outputs: [
    'Influencer marketing strategy',
    'Target persona profiles',
    'Content calendar for influencer posts',
    'Measurement dashboard specs'
  ],

  globalInputs: [
    {
      id: 'brand',
      label: 'Brand/Product',
      type: 'textarea',
      placeholder: 'Your brand, product, and brand values...',
      required: true,
      rows: 4,
    },
    {
      id: 'objective',
      label: 'Campaign Objective',
      type: 'select',
      options: ['Brand Awareness', 'Product Launch', 'Sales/Conversions', 'Content Creation'],
      required: true,
    },
    {
      id: 'audience',
      label: 'Target Audience',
      type: 'textarea',
      placeholder: 'Who are you trying to reach?',
      required: true,
      rows: 3,
    },
    {
      id: 'budget',
      label: 'Budget Range',
      type: 'select',
      options: ['Under $5K', '$5K-$25K', '$25K-$100K', '$100K+'],
      required: true,
    },
    {
      id: 'platforms',
      label: 'Target Platforms',
      type: 'textarea',
      placeholder: 'Instagram, TikTok, YouTube...',
      required: true,
      rows: 1,
    },
    {
      id: 'timeline',
      label: 'Campaign Timeline',
      type: 'text',
      placeholder: 'e.g., 3 months, Q1 2024',
      required: true,
    },
  ],

  steps: [
    {
      id: 'step-strategy',
      skillId: 'influencer-marketing-strategy',
      name: 'Develop Strategy',
      description: 'Create comprehensive influencer marketing strategy',
      inputMappings: {
        brand: { type: 'global', inputId: 'brand' },
        objective: { type: 'global', inputId: 'objective' },
        audience: { type: 'global', inputId: 'audience' },
        budget: { type: 'global', inputId: 'budget' },
        platforms: { type: 'global', inputId: 'platforms' },
        timeline: { type: 'global', inputId: 'timeline' },
        pastExperience: { type: 'static', value: '' },
      },
      outputKey: 'influencerStrategy',
    },
    {
      id: 'step-personas',
      skillId: 'customer-persona-builder',
      name: 'Build Target Personas',
      description: 'Create audience personas for influencer targeting',
      inputMappings: {
        product: { type: 'global', inputId: 'brand' },
        audienceData: { type: 'global', inputId: 'audience' },
        industry: { type: 'static', value: '' },
        personaType: { type: 'static', value: 'B2C Primary Buyer' },
        numberOfPersonas: { type: 'static', value: '2 Personas (Primary + Secondary)' },
        existingPersonas: { type: 'static', value: '' },
      },
      outputKey: 'targetPersonas',
    },
    {
      id: 'step-content',
      skillId: 'social-media-content-calendar',
      name: 'Plan Influencer Content',
      description: 'Create content calendar for influencer campaign',
      inputMappings: {
        platforms: { type: 'global', inputId: 'platforms' },
        brand: { type: 'global', inputId: 'brand' },
        audience: { type: 'previous', stepId: 'step-personas', outputKey: 'targetPersonas' },
        goals: { type: 'global', inputId: 'objective' },
        contentPillars: { type: 'previous', stepId: 'step-strategy', outputKey: 'influencerStrategy' },
        period: { type: 'static', value: '1 Month' },
        frequency: { type: 'static', value: 'Per influencer cadence' },
        campaigns: { type: 'previous', stepId: 'step-strategy', outputKey: 'influencerStrategy' },
      },
      outputKey: 'contentCalendar',
    },
    {
      id: 'step-measurement',
      skillId: 'marketing-analytics-dashboard-designer',
      name: 'Design Measurement',
      description: 'Create dashboard for tracking influencer campaign performance',
      inputMappings: {
        stakeholders: { type: 'static', value: 'Marketing Leadership' },
        objectives: { type: 'global', inputId: 'objective' },
        channels: { type: 'global', inputId: 'platforms' },
        tools: { type: 'static', value: 'Social platforms, Google Analytics, UTM tracking' },
        platform: { type: 'static', value: 'Looker Studio (Data Studio)' },
        refreshFrequency: { type: 'static', value: 'Weekly' },
        existingMetrics: { type: 'static', value: '' },
      },
      outputKey: 'measurementDashboard',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 10: COMPETITIVE INTELLIGENCE
// Complete competitive analysis workflow
// ═══════════════════════════════════════════════════════════════════════════

export const COMPETITIVE_INTELLIGENCE_WORKFLOW: Workflow = {
  id: 'competitive-intelligence',
  name: 'Competitive Intelligence',
  description: 'Comprehensive competitive analysis and strategic positioning',
  longDescription: 'Conduct thorough competitive analysis, develop differentiated positioning, and create strategic recommendations.',
  icon: 'Search',
  color: 'red',
  estimatedTime: '40-50 minutes',

  outputs: [
    'Competitive analysis report',
    'Brand positioning framework',
    'Go-to-market differentiation strategy',
    'Marketing performance benchmarks'
  ],

  globalInputs: [
    {
      id: 'company',
      label: 'Your Company/Product',
      type: 'textarea',
      placeholder: 'Describe your company, products, and current market position...',
      required: true,
      rows: 4,
    },
    {
      id: 'competitors',
      label: 'Key Competitors',
      type: 'textarea',
      placeholder: 'List 3-5 competitors with what you know about each...',
      required: true,
      rows: 6,
    },
    {
      id: 'industry',
      label: 'Industry/Market',
      type: 'text',
      placeholder: 'e.g., Enterprise SaaS, Consumer Health',
      required: true,
    },
    {
      id: 'targetMarket',
      label: 'Target Market',
      type: 'textarea',
      placeholder: 'Who are you competing for?',
      required: true,
      rows: 3,
    },
    {
      id: 'objectives',
      label: 'Strategic Objectives',
      type: 'textarea',
      placeholder: 'What decisions will this analysis inform?',
      required: true,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-analysis',
      skillId: 'competitive-analysis-report',
      name: 'Analyze Competition',
      description: 'Conduct comprehensive competitive analysis',
      inputMappings: {
        yourCompany: { type: 'global', inputId: 'company' },
        competitors: { type: 'global', inputId: 'competitors' },
        industry: { type: 'global', inputId: 'industry' },
        focusAreas: { type: 'static', value: 'Product, pricing, marketing, positioning, strengths/weaknesses' },
        targetMarket: { type: 'global', inputId: 'targetMarket' },
        objectives: { type: 'global', inputId: 'objectives' },
      },
      outputKey: 'competitiveAnalysis',
    },
    {
      id: 'step-positioning',
      skillId: 'brand-positioning-framework',
      name: 'Develop Positioning',
      description: 'Create differentiated brand positioning based on competitive insights',
      inputMappings: {
        brandName: { type: 'static', value: '' },
        industry: { type: 'global', inputId: 'industry' },
        currentPositioning: { type: 'global', inputId: 'company' },
        targetAudience: { type: 'global', inputId: 'targetMarket' },
        competitors: { type: 'previous', stepId: 'step-analysis', outputKey: 'competitiveAnalysis' },
        differentiators: { type: 'previous', stepId: 'step-analysis', outputKey: 'competitiveAnalysis' },
        brandValues: { type: 'static', value: '' },
        aspirations: { type: 'static', value: '' },
      },
      outputKey: 'positioning',
    },
    {
      id: 'step-gtm',
      skillId: 'go-to-market-strategy',
      name: 'Develop GTM Strategy',
      description: 'Create differentiated go-to-market approach',
      inputMappings: {
        product: { type: 'global', inputId: 'company' },
        gtmType: { type: 'static', value: 'Segment Expansion' },
        targetMarket: { type: 'global', inputId: 'targetMarket' },
        competition: { type: 'previous', stepId: 'step-analysis', outputKey: 'competitiveAnalysis' },
        pricing: { type: 'static', value: '' },
        resources: { type: 'static', value: '' },
        timeline: { type: 'static', value: '' },
        successMetrics: { type: 'global', inputId: 'objectives' },
      },
      outputKey: 'gtmStrategy',
    },
    {
      id: 'step-benchmarks',
      skillId: 'marketing-performance-report',
      name: 'Set Benchmarks',
      description: 'Create performance benchmarks based on competitive context',
      inputMappings: {
        reportPeriod: { type: 'static', value: 'Competitive Benchmarking' },
        metrics: { type: 'previous', stepId: 'step-analysis', outputKey: 'competitiveAnalysis' },
        goals: { type: 'global', inputId: 'objectives' },
        campaigns: { type: 'static', value: '' },
        audience: { type: 'static', value: 'Marketing Leadership' },
        focus: { type: 'static', value: 'Competitive benchmarks and targets' },
        context: { type: 'previous', stepId: 'step-gtm', outputKey: 'gtmStrategy' },
      },
      outputKey: 'performanceBenchmarks',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL PROFESSIONAL WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════

export const PROFESSIONAL_WORKFLOWS: Workflow[] = [
  MARKETING_CAMPAIGN_WORKFLOW,
  PRODUCT_LAUNCH_GTM_WORKFLOW,
  DIGITAL_MARKETING_AUDIT_WORKFLOW,
  PROJECT_INITIATION_WORKFLOW,
  SPRINT_DELIVERY_WORKFLOW,
  BUSINESS_CASE_WORKFLOW,
  REQUIREMENTS_GATHERING_WORKFLOW,
  PROCESS_IMPROVEMENT_WORKFLOW,
  INFLUENCER_CAMPAIGN_WORKFLOW,
  COMPETITIVE_INTELLIGENCE_WORKFLOW,
];

export default PROFESSIONAL_WORKFLOWS;
