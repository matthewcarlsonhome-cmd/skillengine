/**
 * Enterprise Workflows - Multi-step processes for large organizations
 *
 * These workflows chain enterprise skills together to create comprehensive
 * deliverables for contract review, financial reporting, program governance,
 * marketing analytics, and process automation assessment.
 */

import type { Workflow } from '../storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 1: FINANCIAL ANALYSIS PACK
// Data analysis → Budget variance → Executive summary
// ═══════════════════════════════════════════════════════════════════════════

export const FINANCIAL_ANALYSIS_WORKFLOW: Workflow = {
  id: 'financial-analysis-pack',
  name: 'Financial Analysis Pack',
  description: 'Transform raw financial data into executive-ready variance analysis with insights',
  longDescription: 'This workflow analyzes your financial data, identifies patterns and anomalies, generates budget variance narratives, and creates an executive communication pack for stakeholder reporting. Perfect for FP&A teams during monthly/quarterly close.',
  icon: 'Calculator',
  color: 'green',
  estimatedTime: '10-15 minutes',

  outputs: [
    'Data analysis with trends and anomalies',
    'Budget variance narrative with root causes',
    'Executive summary for leadership review',
    'Stakeholder communication materials',
  ],

  globalInputs: [
    {
      id: 'reportingPeriod',
      label: 'Reporting Period',
      type: 'text',
      placeholder: 'e.g., Q4 2024, October 2024',
      required: true,
    },
    {
      id: 'budgetData',
      label: 'Budget Data',
      type: 'textarea',
      placeholder: 'Paste your budget figures by category/department...',
      helpText: 'Include line items, amounts, and any relevant breakdowns.',
      required: true,
      rows: 8,
    },
    {
      id: 'actualData',
      label: 'Actual Data',
      type: 'textarea',
      placeholder: 'Paste actual spend/revenue by category/department...',
      helpText: 'Match the structure of budget data for accurate comparison.',
      required: true,
      rows: 8,
    },
    {
      id: 'audienceLevel',
      label: 'Report Audience',
      type: 'select',
      options: ['Board of Directors', 'Executive Leadership (C-Suite)', 'Department Heads', 'Detailed Analysis (Full)'],
      required: true,
    },
    {
      id: 'knownFactors',
      label: 'Known Factors (Optional)',
      type: 'textarea',
      placeholder: 'One-time events, timing shifts, known causes of variances...',
      required: false,
      rows: 4,
    },
  ],

  steps: [
    {
      id: 'step-analyze-data',
      skillId: 'excel-data-analyzer',
      name: 'Analyze Financial Data',
      description: 'Identify patterns, trends, and anomalies in the financial data',
      inputMappings: {
        dataDescription: { type: 'computed', template: 'Financial data for {{reportingPeriod}}. Budget vs Actual comparison for variance analysis.' },
        dataSample: { type: 'computed', template: 'BUDGET DATA:\n{{budgetData}}\n\nACTUAL DATA:\n{{actualData}}' },
        analysisGoal: { type: 'static', value: 'Identify Trends & Patterns' },
        contextInfo: { type: 'computed', template: 'Known factors: {{knownFactors}}. Audience: {{audienceLevel}}' },
      },
      outputKey: 'dataAnalysis',
    },
    {
      id: 'step-variance-narrative',
      skillId: 'budget-variance-narrator',
      name: 'Generate Variance Narrative',
      description: 'Create executive-ready variance explanations with root cause analysis',
      inputMappings: {
        periodName: { type: 'global', inputId: 'reportingPeriod' },
        budgetData: { type: 'global', inputId: 'budgetData' },
        actualData: { type: 'global', inputId: 'actualData' },
        knownFactors: { type: 'computed', template: 'Data analysis insights: {{dataAnalysis}}\n\nKnown factors: {{knownFactors}}' },
        audienceLevel: { type: 'global', inputId: 'audienceLevel' },
      },
      outputKey: 'varianceNarrative',
    },
    {
      id: 'step-exec-comms',
      skillId: 'executive-communication-pack',
      name: 'Create Executive Communication',
      description: 'Package findings into stakeholder-ready communications',
      inputMappings: {
        announcementType: { type: 'static', value: 'Other Significant Change' },
        keyMessage: { type: 'computed', template: 'Financial performance update for {{reportingPeriod}}:\n\n{{varianceNarrative}}' },
        audienceSegments: { type: 'computed', template: 'Primary audience: {{audienceLevel}}. Also: Finance team, budget owners, executive sponsors.' },
        timing: { type: 'computed', template: 'Monthly/Quarterly close reporting for {{reportingPeriod}}' },
      },
      outputKey: 'execCommunication',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 2: MARKETING ANALYTICS DASHBOARD
// Data cleaning → Analysis → Dashboard design → Chart recommendations
// ═══════════════════════════════════════════════════════════════════════════

export const MARKETING_ANALYTICS_WORKFLOW: Workflow = {
  id: 'marketing-analytics-dashboard',
  name: 'Marketing Analytics Dashboard',
  description: 'Build comprehensive marketing dashboards from raw campaign data',
  longDescription: 'Transform messy marketing data into a professional analytics dashboard. This workflow cleans your data, identifies key insights, designs KPI tracking, and creates visualizations for campaign performance reporting.',
  icon: 'PieChart',
  color: 'pink',
  estimatedTime: '12-18 minutes',

  outputs: [
    'Cleaned and standardized marketing data',
    'Performance analysis with key insights',
    'Dashboard design with KPI recommendations',
    'Chart and visualization specifications',
  ],

  globalInputs: [
    {
      id: 'marketingChannels',
      label: 'Marketing Channels',
      type: 'textarea',
      placeholder: 'List your channels: Paid Search, Social, Email, Content, Events...',
      required: true,
      rows: 3,
    },
    {
      id: 'rawData',
      label: 'Marketing Data (paste from Excel/CSV)',
      type: 'textarea',
      placeholder: 'Paste your raw marketing data here (include headers)...',
      helpText: 'Include metrics like impressions, clicks, conversions, spend, revenue.',
      required: true,
      rows: 10,
    },
    {
      id: 'reportingFrequency',
      label: 'Reporting Frequency',
      type: 'select',
      options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Campaign-based'],
      required: true,
    },
    {
      id: 'primaryGoals',
      label: 'Primary Marketing Goals',
      type: 'select',
      options: ['Lead Generation', 'Brand Awareness', 'Sales/Revenue', 'Customer Acquisition', 'Engagement', 'Multi-Goal'],
      required: true,
    },
    {
      id: 'targetAudience',
      label: 'Dashboard Audience',
      type: 'select',
      options: ['CMO/Executive', 'Marketing Manager', 'Marketing Team', 'Cross-functional Stakeholders'],
      required: true,
    },
    {
      id: 'dataIssues',
      label: 'Known Data Issues (Optional)',
      type: 'textarea',
      placeholder: 'Any data quality problems you\'ve noticed...',
      required: false,
      rows: 2,
    },
  ],

  steps: [
    {
      id: 'step-clean-data',
      skillId: 'excel-data-cleaner',
      name: 'Clean Marketing Data',
      description: 'Standardize and clean the raw marketing data for analysis',
      inputMappings: {
        dataDescription: { type: 'computed', template: 'Marketing performance data for channels: {{marketingChannels}}. Issues: {{dataIssues}}' },
        dataSample: { type: 'global', inputId: 'rawData' },
        desiredFormat: { type: 'static', value: 'Standardized columns: Date, Channel, Campaign, Impressions, Clicks, Conversions, Spend, Revenue. Clean numeric formats, consistent date formatting.' },
        dataVolume: { type: 'static', value: 'Medium (1,000-50,000 rows)' },
      },
      outputKey: 'cleanedData',
    },
    {
      id: 'step-analyze-performance',
      skillId: 'excel-data-analyzer',
      name: 'Analyze Campaign Performance',
      description: 'Identify trends, patterns, and insights from marketing data',
      inputMappings: {
        dataDescription: { type: 'computed', template: 'Cleaned marketing data for {{marketingChannels}}. Goals: {{primaryGoals}}.' },
        dataSample: { type: 'computed', template: 'Cleaned data summary:\n{{cleanedData}}\n\nOriginal data:\n{{rawData}}' },
        analysisGoal: { type: 'static', value: 'Marketing Performance Analysis' },
        contextInfo: { type: 'computed', template: 'Reporting frequency: {{reportingFrequency}}. Primary goals: {{primaryGoals}}. Audience: {{targetAudience}}' },
      },
      outputKey: 'performanceAnalysis',
    },
    {
      id: 'step-design-dashboard',
      skillId: 'excel-marketing-dashboard',
      name: 'Design Marketing Dashboard',
      description: 'Create dashboard layout with KPIs and metrics',
      inputMappings: {
        marketingChannels: { type: 'global', inputId: 'marketingChannels' },
        availableData: { type: 'computed', template: 'Analysis insights: {{performanceAnalysis}}\n\nCleaning notes: {{cleanedData}}' },
        reportingPeriod: { type: 'global', inputId: 'reportingFrequency' },
        primaryGoals: { type: 'global', inputId: 'primaryGoals' },
        targetAudience: { type: 'global', inputId: 'targetAudience' },
      },
      outputKey: 'dashboardDesign',
    },
    {
      id: 'step-chart-design',
      skillId: 'excel-chart-designer',
      name: 'Design Visualizations',
      description: 'Create chart specifications for key metrics',
      inputMappings: {
        dataDescription: { type: 'computed', template: 'Dashboard KPIs and metrics from: {{dashboardDesign}}' },
        visualizationGoal: { type: 'static', value: 'Marketing Campaign Performance' },
        audience: { type: 'global', inputId: 'targetAudience' },
        keyMessage: { type: 'computed', template: 'Key findings: {{performanceAnalysis}}' },
      },
      outputKey: 'chartDesigns',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 3: PROGRAM GOVERNANCE PACK
// Status reporting → Steering committee pack → Executive communications
// ═══════════════════════════════════════════════════════════════════════════

export const PROGRAM_GOVERNANCE_WORKFLOW: Workflow = {
  id: 'program-governance-pack',
  name: 'Program Governance Pack',
  description: 'Generate complete governance materials for steering committee reviews',
  longDescription: 'Create comprehensive program governance materials including steering committee packs, executive dashboards, risk summaries, and stakeholder communications. Perfect for PMO teams managing enterprise programs.',
  icon: 'Users',
  color: 'purple',
  estimatedTime: '12-18 minutes',

  outputs: [
    'Steering committee presentation pack',
    'Executive dashboard with RAG status',
    'Risk register and escalation summary',
    'Stakeholder communication materials',
  ],

  globalInputs: [
    {
      id: 'programName',
      label: 'Program/Project Name',
      type: 'text',
      placeholder: 'e.g., Digital Transformation Initiative',
      required: true,
    },
    {
      id: 'reportingPeriod',
      label: 'Reporting Period',
      type: 'text',
      placeholder: 'e.g., Q4 2024, Sprint 15-16',
      required: true,
    },
    {
      id: 'statusSummary',
      label: 'Current Status Summary',
      type: 'textarea',
      placeholder: 'Overall health, key accomplishments, current phase...',
      required: true,
      rows: 6,
    },
    {
      id: 'milestoneStatus',
      label: 'Milestone Status',
      type: 'textarea',
      placeholder: 'Planned vs. actual milestones, completion percentages...',
      required: true,
      rows: 6,
    },
    {
      id: 'budgetStatus',
      label: 'Budget Status',
      type: 'textarea',
      placeholder: 'Budget allocated, spent to date, forecast, variance...',
      required: true,
      rows: 5,
    },
    {
      id: 'risks',
      label: 'Risks and Issues',
      type: 'textarea',
      placeholder: 'Active risks with likelihood/impact, issues requiring escalation...',
      required: true,
      rows: 6,
    },
    {
      id: 'decisions',
      label: 'Decisions Required (Optional)',
      type: 'textarea',
      placeholder: 'Decisions needed from steering committee...',
      required: false,
      rows: 4,
    },
    {
      id: 'audienceLevel',
      label: 'Audience Level',
      type: 'select',
      options: ['Board of Directors', 'Executive Steering Committee', 'Program Steering Committee', 'Working Team'],
      required: true,
    },
  ],

  steps: [
    {
      id: 'step-steering-pack',
      skillId: 'steering-committee-pack',
      name: 'Generate Steering Committee Pack',
      description: 'Create comprehensive program status pack with dashboards and analysis',
      inputMappings: {
        programName: { type: 'global', inputId: 'programName' },
        reportingPeriod: { type: 'global', inputId: 'reportingPeriod' },
        statusSummary: { type: 'global', inputId: 'statusSummary' },
        milestoneStatus: { type: 'global', inputId: 'milestoneStatus' },
        budgetStatus: { type: 'global', inputId: 'budgetStatus' },
        risks: { type: 'global', inputId: 'risks' },
        decisions: { type: 'global', inputId: 'decisions' },
        audienceLevel: { type: 'global', inputId: 'audienceLevel' },
      },
      outputKey: 'steeringPack',
    },
    {
      id: 'step-exec-comms',
      skillId: 'executive-communication-pack',
      name: 'Create Executive Communications',
      description: 'Generate stakeholder communications for program updates',
      inputMappings: {
        announcementType: { type: 'static', value: 'Strategy Change' },
        keyMessage: { type: 'computed', template: 'Program update for {{programName}} - {{reportingPeriod}}:\n\nSteering Committee Summary:\n{{steeringPack}}' },
        audienceSegments: { type: 'computed', template: 'Steering committee members, executive sponsors, program team leads, affected business units. Audience level: {{audienceLevel}}' },
        sensitivePoints: { type: 'computed', template: 'Risks to address: {{risks}}\n\nDecisions required: {{decisions}}' },
        timing: { type: 'computed', template: 'Steering committee meeting for {{reportingPeriod}}' },
      },
      outputKey: 'execCommunications',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 4: CONTRACT REVIEW WORKFLOW
// Contract analysis → Risk summary → Negotiation strategy → Communication
// ═══════════════════════════════════════════════════════════════════════════

export const CONTRACT_REVIEW_WORKFLOW: Workflow = {
  id: 'contract-review-workflow',
  name: 'Contract Review Workflow',
  description: 'Complete contract review from analysis to negotiation strategy and stakeholder communication',
  longDescription: 'Accelerate contract review cycles with AI-powered analysis, risk assessment, and negotiation recommendations. Generates comprehensive review packages including executive summaries and stakeholder communications.',
  icon: 'FileText',
  color: 'indigo',
  estimatedTime: '10-15 minutes',

  outputs: [
    'Contract analysis with key terms extracted',
    'Risk assessment with severity ratings',
    'Negotiation strategy and talking points',
    'Stakeholder communication for approval',
  ],

  globalInputs: [
    {
      id: 'contractText',
      label: 'Contract Text',
      type: 'textarea',
      placeholder: 'Paste the full contract text or key sections...',
      helpText: 'Include all major clauses and terms for comprehensive analysis.',
      required: true,
      rows: 12,
    },
    {
      id: 'contractType',
      label: 'Contract Type',
      type: 'select',
      options: ['Master Service Agreement (MSA)', 'Statement of Work (SOW)', 'Non-Disclosure Agreement (NDA)', 'SaaS/Software Agreement', 'Vendor/Supplier Agreement', 'Professional Services', 'Lease Agreement', 'Employment Agreement', 'Partnership Agreement', 'Other'],
      required: true,
    },
    {
      id: 'organizationStandards',
      label: 'Organization Standards (Optional)',
      type: 'textarea',
      placeholder: 'Standard terms, acceptable thresholds, required clauses...',
      required: false,
      rows: 6,
    },
    {
      id: 'riskTolerance',
      label: 'Risk Tolerance',
      type: 'select',
      options: ['Conservative (flag everything)', 'Moderate (standard business terms)', 'Aggressive (focus on critical issues only)'],
      required: true,
    },
    {
      id: 'counterparty',
      label: 'Counterparty/Vendor Name',
      type: 'text',
      placeholder: 'e.g., Acme Corporation',
      required: true,
    },
    {
      id: 'dealValue',
      label: 'Deal Value (Optional)',
      type: 'text',
      placeholder: 'e.g., $500K annually',
      required: false,
    },
  ],

  steps: [
    {
      id: 'step-contract-review',
      skillId: 'contract-review-accelerator',
      name: 'Analyze Contract',
      description: 'Extract key terms, identify risks, and flag deviations',
      inputMappings: {
        contractText: { type: 'global', inputId: 'contractText' },
        contractType: { type: 'global', inputId: 'contractType' },
        organizationStandards: { type: 'global', inputId: 'organizationStandards' },
        riskTolerance: { type: 'global', inputId: 'riskTolerance' },
      },
      outputKey: 'contractAnalysis',
    },
    {
      id: 'step-exec-comms',
      skillId: 'executive-communication-pack',
      name: 'Create Approval Communication',
      description: 'Generate stakeholder communication for contract approval',
      inputMappings: {
        announcementType: { type: 'static', value: 'Policy Change' },
        keyMessage: { type: 'computed', template: 'Contract review complete for {{contractType}} with {{counterparty}}. Deal value: {{dealValue}}.\n\nAnalysis Summary:\n{{contractAnalysis}}' },
        audienceSegments: { type: 'static', value: 'Legal team, procurement, budget owner, executive sponsor, signing authority' },
        sensitivePoints: { type: 'computed', template: 'Based on the contract analysis, the following risks and concerns require attention:\n\n{{contractAnalysis}}' },
        timing: { type: 'static', value: 'Contract review completion - approval needed' },
      },
      outputKey: 'approvalCommunication',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 5: AUTOMATION DISCOVERY WORKFLOW
// Process assessment → ROI analysis → Implementation recommendation
// ═══════════════════════════════════════════════════════════════════════════

export const AUTOMATION_DISCOVERY_WORKFLOW: Workflow = {
  id: 'automation-discovery-workflow',
  name: 'Automation Discovery Workflow',
  description: 'Evaluate business processes for automation potential with ROI projections',
  longDescription: 'Comprehensive automation opportunity assessment that analyzes processes, calculates ROI, and provides implementation recommendations. Includes data analysis for process metrics and executive communication for stakeholder buy-in.',
  icon: 'Cog',
  color: 'amber',
  estimatedTime: '12-18 minutes',

  outputs: [
    'Automation feasibility assessment',
    'ROI analysis with payback projections',
    'Implementation roadmap and recommendations',
    'Executive business case communication',
  ],

  globalInputs: [
    {
      id: 'processName',
      label: 'Process Name',
      type: 'text',
      placeholder: 'e.g., Invoice Processing, Employee Onboarding',
      required: true,
    },
    {
      id: 'processDescription',
      label: 'Process Description',
      type: 'textarea',
      placeholder: 'Describe the process step-by-step: triggers, inputs, actions, decisions, outputs...',
      required: true,
      rows: 8,
    },
    {
      id: 'currentMetrics',
      label: 'Current Process Metrics',
      type: 'textarea',
      placeholder: 'Volume, frequency, processing time, error rate, cost, FTEs...',
      required: true,
      rows: 5,
    },
    {
      id: 'painPoints',
      label: 'Pain Points',
      type: 'textarea',
      placeholder: 'Where does time get wasted? What errors occur? What frustrates employees?',
      required: true,
      rows: 4,
    },
    {
      id: 'systemsInvolved',
      label: 'Systems and Tools Involved',
      type: 'textarea',
      placeholder: 'List all applications, databases, spreadsheets used...',
      required: true,
      rows: 4,
    },
    {
      id: 'constraints',
      label: 'Constraints (Optional)',
      type: 'textarea',
      placeholder: 'Technical limitations, regulatory requirements, budget constraints...',
      required: false,
      rows: 3,
    },
    {
      id: 'businessUnit',
      label: 'Business Unit/Department',
      type: 'text',
      placeholder: 'e.g., Finance, HR, Operations',
      required: true,
    },
  ],

  steps: [
    {
      id: 'step-analyze-metrics',
      skillId: 'excel-data-analyzer',
      name: 'Analyze Process Metrics',
      description: 'Analyze current process metrics to establish baseline',
      inputMappings: {
        dataDescription: { type: 'computed', template: 'Process metrics for {{processName}} in {{businessUnit}}. Looking for patterns, bottlenecks, and improvement opportunities.' },
        dataSample: { type: 'computed', template: 'Current Metrics:\n{{currentMetrics}}\n\nSystems Involved:\n{{systemsInvolved}}' },
        analysisGoal: { type: 'static', value: 'General Insights' },
        contextInfo: { type: 'computed', template: 'Pain points: {{painPoints}}\nConstraints: {{constraints}}' },
      },
      outputKey: 'metricsAnalysis',
    },
    {
      id: 'step-automation-assessment',
      skillId: 'automation-opportunity-assessment',
      name: 'Assess Automation Potential',
      description: 'Evaluate process for automation opportunities with ROI',
      inputMappings: {
        processName: { type: 'global', inputId: 'processName' },
        processDescription: { type: 'global', inputId: 'processDescription' },
        currentMetrics: { type: 'computed', template: 'Metrics analysis: {{metricsAnalysis}}\n\nRaw metrics: {{currentMetrics}}' },
        painPoints: { type: 'global', inputId: 'painPoints' },
        systemsInvolved: { type: 'global', inputId: 'systemsInvolved' },
        constraints: { type: 'global', inputId: 'constraints' },
      },
      outputKey: 'automationAssessment',
    },
    {
      id: 'step-business-case',
      skillId: 'executive-communication-pack',
      name: 'Create Business Case Communication',
      description: 'Package automation recommendation for executive approval',
      inputMappings: {
        announcementType: { type: 'static', value: 'Strategy Change' },
        keyMessage: { type: 'computed', template: 'Automation opportunity identified for {{processName}} in {{businessUnit}}.\n\nAssessment Summary:\n{{automationAssessment}}' },
        audienceSegments: { type: 'computed', template: '{{businessUnit}} leadership, IT/Digital transformation team, Finance (for budget), Process owners, Executive sponsor' },
        sensitivePoints: { type: 'computed', template: 'Process automation may impact current roles. Constraints to address: {{constraints}}' },
        timing: { type: 'static', value: 'Automation initiative planning phase' },
      },
      outputKey: 'businessCase',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL ENTERPRISE WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════

export const ENTERPRISE_WORKFLOWS: Record<string, Workflow> = {
  'financial-analysis-pack': FINANCIAL_ANALYSIS_WORKFLOW,
  'marketing-analytics-dashboard': MARKETING_ANALYTICS_WORKFLOW,
  'program-governance-pack': PROGRAM_GOVERNANCE_WORKFLOW,
  'contract-review-workflow': CONTRACT_REVIEW_WORKFLOW,
  'automation-discovery-workflow': AUTOMATION_DISCOVERY_WORKFLOW,
};

export const ENTERPRISE_WORKFLOW_LIST: Workflow[] = Object.values(ENTERPRISE_WORKFLOWS);
