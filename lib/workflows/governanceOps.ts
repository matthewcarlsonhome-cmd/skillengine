/**
 * AI Governance & Operations Workflows
 *
 * Multi-step workflows that chain AI governance, compliance, and IT operations
 * skills together for comprehensive enterprise deliverables.
 */

import type { Workflow } from '../storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 1: AI GOVERNANCE IMPLEMENTATION PACK
// Assessment → Playbook → Client Brief
// ═══════════════════════════════════════════════════════════════════════════

export const AI_GOVERNANCE_IMPLEMENTATION_WORKFLOW: Workflow = {
  id: 'ai-governance-implementation',
  name: 'AI Governance Implementation Pack',
  description: 'Build a complete AI governance program from assessment to policies to stakeholder communication',
  longDescription: 'This workflow takes your organization from AI governance uncertainty to a comprehensive framework. It assesses your current state, generates practical usage policies tailored to your context, and creates client/stakeholder materials to communicate your governance posture. Perfect for organizations starting their AI governance journey or formalizing existing practices.',
  icon: 'Shield',
  color: 'blue',
  estimatedTime: '25-35 minutes',

  outputs: [
    'AI governance maturity assessment with roadmap',
    'Secure AI usage playbook for employees',
    'Client-ready governance brief for stakeholders',
    'Implementation checklist and training outline',
  ],

  globalInputs: [
    {
      id: 'organizationSize',
      label: 'Organization Size',
      type: 'select',
      options: ['1-100 employees', '101-500 employees', '501-2000 employees', '2001-10000 employees', '10000+ employees'],
      required: true,
    },
    {
      id: 'industry',
      label: 'Industry',
      type: 'select',
      options: ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail/E-commerce', 'Professional Services', 'Government/Public Sector', 'Education', 'Other'],
      required: true,
    },
    {
      id: 'currentAIUsage',
      label: 'Current AI Usage',
      type: 'textarea',
      placeholder: 'Describe how AI is currently used in your organization...',
      helpText: 'Include tools, use cases, and departments using AI.',
      required: true,
      rows: 6,
    },
    {
      id: 'dataClassifications',
      label: 'Data Classifications & Sensitivity',
      type: 'textarea',
      placeholder: 'Describe your data classification scheme and sensitive data types...',
      required: true,
      rows: 5,
    },
    {
      id: 'keyConcerns',
      label: 'Key Concerns About AI',
      type: 'textarea',
      placeholder: 'What are your primary concerns about AI governance?',
      required: true,
      rows: 4,
    },
    {
      id: 'approvedAITools',
      label: 'Approved AI Tools',
      type: 'textarea',
      placeholder: 'List AI tools approved or being considered (e.g., ChatGPT Enterprise, GitHub Copilot)...',
      required: true,
      rows: 4,
    },
    {
      id: 'regulatoryRequirements',
      label: 'Regulatory Requirements',
      type: 'textarea',
      placeholder: 'GDPR, HIPAA, SOC2, EU AI Act, etc.',
      required: false,
      rows: 3,
    },
    {
      id: 'existingPolicies',
      label: 'Existing Policies (Optional)',
      type: 'textarea',
      placeholder: 'What relevant policies do you already have?',
      required: false,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-governance-assessment',
      skillId: 'ai-governance-readiness-assessment',
      name: 'Assess AI Governance Readiness',
      description: 'Evaluate current AI governance maturity and identify gaps',
      inputMappings: {
        organizationSize: { type: 'global', inputId: 'organizationSize' },
        industry: { type: 'global', inputId: 'industry' },
        currentAIUsage: { type: 'global', inputId: 'currentAIUsage' },
        dataClassifications: { type: 'global', inputId: 'dataClassifications' },
        existingPolicies: { type: 'global', inputId: 'existingPolicies' },
        keyConcerns: { type: 'global', inputId: 'keyConcerns' },
        regulatoryRequirements: { type: 'global', inputId: 'regulatoryRequirements' },
      },
      outputKey: 'governanceAssessment',
    },
    {
      id: 'step-usage-playbook',
      skillId: 'secure-ai-usage-playbook',
      name: 'Generate AI Usage Playbook',
      description: 'Create employee-ready guidelines based on assessment findings',
      inputMappings: {
        approvedAITools: { type: 'global', inputId: 'approvedAITools' },
        commonUseCases: { type: 'computed', template: 'Based on assessment: {{governanceAssessment}}\n\nCurrent usage patterns:\n{{currentAIUsage}}' },
        prohibitedActivities: { type: 'computed', template: 'Based on governance gaps and concerns identified:\n{{keyConcerns}}\n\nData sensitivity:\n{{dataClassifications}}' },
        dataHandlingRules: { type: 'computed', template: 'Data classifications:\n{{dataClassifications}}\n\nRegulatory requirements:\n{{regulatoryRequirements}}' },
        regulatoryContext: { type: 'global', inputId: 'regulatoryRequirements' },
        audienceLevel: { type: 'static', value: 'All Employees' },
      },
      outputKey: 'usagePlaybook',
    },
    {
      id: 'step-client-brief',
      skillId: 'ai-governance-client-brief',
      name: 'Create Stakeholder Brief',
      description: 'Generate professional materials for clients and stakeholders',
      inputMappings: {
        clientIndustry: { type: 'global', inputId: 'industry' },
        clientRiskPosture: { type: 'static', value: 'Moderate (standard security review)' },
        mainObjections: { type: 'computed', template: 'Key concerns to address:\n{{keyConcerns}}\n\nGovernance assessment findings:\n{{governanceAssessment}}' },
        yourAICapabilities: { type: 'global', inputId: 'currentAIUsage' },
        dataHandlingPractices: { type: 'computed', template: 'Data classifications:\n{{dataClassifications}}\n\nUsage playbook guidelines:\n{{usagePlaybook}}' },
        complianceCertifications: { type: 'global', inputId: 'regulatoryRequirements' },
      },
      outputKey: 'stakeholderBrief',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 2: AI DATA PROTECTION ASSESSMENT
// Risk mapping → Usage playbook with data-specific controls
// ═══════════════════════════════════════════════════════════════════════════

export const AI_DATA_PROTECTION_WORKFLOW: Workflow = {
  id: 'ai-data-protection-assessment',
  name: 'AI Data Protection Assessment',
  description: 'Map AI data flows, identify risks, and generate data-specific usage guidelines',
  longDescription: 'This workflow provides a deep dive into how your data intersects with AI systems. It maps all AI touchpoints in your data ecosystem, identifies security risks and control gaps, then generates targeted usage guidelines focused on data protection. Essential for security architects, DPOs, and organizations preparing for AI-related audits.',
  icon: 'Lock',
  color: 'red',
  estimatedTime: '20-30 minutes',

  outputs: [
    'Comprehensive AI data flow risk map',
    'Third-party AI vendor risk summary',
    'Data-specific usage guidelines',
    'Control gap analysis with remediation priorities',
  ],

  globalInputs: [
    {
      id: 'keySystemsInventory',
      label: 'Key Systems Inventory',
      type: 'textarea',
      placeholder: 'List major systems: CRM, ERP, data warehouse, document management...',
      required: true,
      rows: 6,
    },
    {
      id: 'dataTypesProcessed',
      label: 'Data Types Processed',
      type: 'textarea',
      placeholder: 'Customer PII, financial data, healthcare data, IP, etc.',
      required: true,
      rows: 5,
    },
    {
      id: 'aiIntegrations',
      label: 'Current AI Integrations',
      type: 'textarea',
      placeholder: 'How is AI integrated with your systems?',
      required: true,
      rows: 6,
    },
    {
      id: 'approvedAITools',
      label: 'Approved AI Tools',
      type: 'textarea',
      placeholder: 'List approved AI tools and their data access...',
      required: true,
      rows: 4,
    },
    {
      id: 'dataResidencyRequirements',
      label: 'Data Residency Requirements',
      type: 'textarea',
      placeholder: 'Geographic restrictions on data (EU data stays in EU, etc.)',
      required: false,
      rows: 3,
    },
    {
      id: 'currentSecurityControls',
      label: 'Current Security Controls',
      type: 'textarea',
      placeholder: 'SSO/MFA, DLP, encryption, network segmentation...',
      required: false,
      rows: 4,
    },
    {
      id: 'plannedAIExpansions',
      label: 'Planned AI Expansions (Optional)',
      type: 'textarea',
      placeholder: 'Upcoming AI initiatives to assess...',
      required: false,
      rows: 3,
    },
  ],

  steps: [
    {
      id: 'step-data-flow-risk-map',
      skillId: 'ai-data-flow-risk-map',
      name: 'Map AI Data Flow Risks',
      description: 'Create comprehensive view of AI touchpoints and identify risk areas',
      inputMappings: {
        keySystemsInventory: { type: 'global', inputId: 'keySystemsInventory' },
        dataTypesProcessed: { type: 'global', inputId: 'dataTypesProcessed' },
        aiIntegrations: { type: 'global', inputId: 'aiIntegrations' },
        dataResidencyRequirements: { type: 'global', inputId: 'dataResidencyRequirements' },
        currentSecurityControls: { type: 'global', inputId: 'currentSecurityControls' },
        plannedAIExpansions: { type: 'global', inputId: 'plannedAIExpansions' },
      },
      outputKey: 'dataFlowRiskMap',
    },
    {
      id: 'step-data-usage-playbook',
      skillId: 'secure-ai-usage-playbook',
      name: 'Generate Data-Focused Usage Guidelines',
      description: 'Create usage guidelines specifically addressing identified data risks',
      inputMappings: {
        approvedAITools: { type: 'global', inputId: 'approvedAITools' },
        commonUseCases: { type: 'computed', template: 'Current AI integrations:\n{{aiIntegrations}}\n\nPlanned expansions:\n{{plannedAIExpansions}}' },
        prohibitedActivities: { type: 'computed', template: 'Based on risk map findings:\n{{dataFlowRiskMap}}\n\nHigh-risk data types:\n{{dataTypesProcessed}}' },
        dataHandlingRules: { type: 'computed', template: 'Data types:\n{{dataTypesProcessed}}\n\nResidency requirements:\n{{dataResidencyRequirements}}\n\nRisk analysis:\n{{dataFlowRiskMap}}' },
        regulatoryContext: { type: 'global', inputId: 'dataResidencyRequirements' },
        audienceLevel: { type: 'static', value: 'All Employees' },
      },
      outputKey: 'dataUsagePlaybook',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 3: COMPLIANCE PROGRAM BUILDER
// Audit prep → Policy generation for gaps
// ═══════════════════════════════════════════════════════════════════════════

export const COMPLIANCE_PROGRAM_WORKFLOW: Workflow = {
  id: 'compliance-program-builder',
  name: 'Compliance Program Builder',
  description: 'Prepare for compliance audits and generate policies to address identified gaps',
  longDescription: 'This workflow streamlines compliance program development by first assessing your audit readiness, then generating policies to fill the gaps. It creates comprehensive audit preparation materials plus draft policies ready for legal review. Perfect for organizations preparing for SOC2, ISO 27001, HIPAA, or other compliance certifications.',
  icon: 'ClipboardCheck',
  color: 'indigo',
  estimatedTime: '25-35 minutes',

  outputs: [
    'Audit readiness assessment with gap analysis',
    'Evidence checklist and interview preparation',
    'Draft compliance policy documents',
    'Implementation checklists and training requirements',
  ],

  globalInputs: [
    {
      id: 'auditType',
      label: 'Audit Type',
      type: 'select',
      options: ['SOC2 Type II', 'SOC2 Type I', 'ISO 27001', 'HIPAA', 'PCI-DSS', 'GDPR Assessment', 'Internal Audit', 'Custom Framework'],
      required: true,
    },
    {
      id: 'auditScope',
      label: 'Audit Scope',
      type: 'textarea',
      placeholder: 'What is included in the audit scope?',
      required: true,
      rows: 6,
    },
    {
      id: 'auditTimeline',
      label: 'Audit Timeline',
      type: 'text',
      placeholder: 'e.g., "Audit fieldwork begins in 8 weeks"',
      required: true,
    },
    {
      id: 'controlFramework',
      label: 'Control Framework / Requirements',
      type: 'textarea',
      placeholder: 'What controls or criteria apply?',
      required: true,
      rows: 5,
    },
    {
      id: 'availableEvidence',
      label: 'Available Evidence',
      type: 'textarea',
      placeholder: 'What documentation and evidence do you have?',
      required: true,
      rows: 6,
    },
    {
      id: 'organizationContext',
      label: 'Organization Context',
      type: 'textarea',
      placeholder: 'Describe your organization (size, industry, data handled...)',
      required: true,
      rows: 4,
    },
    {
      id: 'knownGaps',
      label: 'Known Gaps (Optional)',
      type: 'textarea',
      placeholder: 'What gaps are you already aware of?',
      required: false,
      rows: 4,
    },
    {
      id: 'previousFindings',
      label: 'Previous Audit Findings (Optional)',
      type: 'textarea',
      placeholder: 'What did previous audits find?',
      required: false,
      rows: 4,
    },
    {
      id: 'policyNeeded',
      label: 'Policy Type to Generate',
      type: 'select',
      options: [
        'Information Security Policy',
        'Data Privacy Policy',
        'Acceptable Use Policy',
        'Data Retention Policy',
        'Incident Response Policy',
        'Access Control Policy',
        'Vendor Management Policy',
        'Business Continuity Policy',
        'Change Management Policy',
      ],
      required: true,
    },
  ],

  steps: [
    {
      id: 'step-audit-prep',
      skillId: 'compliance-audit-prep-assistant',
      name: 'Assess Audit Readiness',
      description: 'Analyze current state and identify compliance gaps',
      inputMappings: {
        auditType: { type: 'global', inputId: 'auditType' },
        auditScope: { type: 'global', inputId: 'auditScope' },
        auditTimeline: { type: 'global', inputId: 'auditTimeline' },
        controlFramework: { type: 'global', inputId: 'controlFramework' },
        availableEvidence: { type: 'global', inputId: 'availableEvidence' },
        knownGaps: { type: 'global', inputId: 'knownGaps' },
        previousFindings: { type: 'global', inputId: 'previousFindings' },
      },
      outputKey: 'auditReadiness',
    },
    {
      id: 'step-generate-policy',
      skillId: 'policy-document-generator',
      name: 'Generate Compliance Policy',
      description: 'Create policy document to address identified gaps',
      inputMappings: {
        policyType: { type: 'global', inputId: 'policyNeeded' },
        organizationContext: { type: 'global', inputId: 'organizationContext' },
        regulatoryRequirements: { type: 'computed', template: 'Audit type: {{auditType}}\n\nControl framework:\n{{controlFramework}}\n\nGaps identified:\n{{auditReadiness}}' },
        existingPractices: { type: 'global', inputId: 'availableEvidence' },
        approvalAuthority: { type: 'static', value: 'CISO / Compliance Officer' },
        reviewCycle: { type: 'static', value: 'Annual' },
        audienceScope: { type: 'static', value: 'All Employees' },
      },
      outputKey: 'policyDocument',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW 4: INCIDENT TO IMPROVEMENT WORKFLOW
// Postmortem → Change request for remediation
// ═══════════════════════════════════════════════════════════════════════════

export const INCIDENT_TO_IMPROVEMENT_WORKFLOW: Workflow = {
  id: 'incident-to-improvement',
  name: 'Incident to Improvement Workflow',
  description: 'Transform incident analysis into formal change requests for systemic improvements',
  longDescription: 'This workflow closes the loop between incidents and improvements. It generates a comprehensive blameless postmortem, then automatically creates change request documentation for the most critical remediation actions. Ensures that lessons learned translate into actual changes, not just documentation.',
  icon: 'ArrowUpCircle',
  color: 'green',
  estimatedTime: '20-30 minutes',

  outputs: [
    'Blameless incident postmortem document',
    'Root cause analysis with action items',
    'CAB-ready change request for remediation',
    'Stakeholder communication templates',
  ],

  globalInputs: [
    {
      id: 'incidentTitle',
      label: 'Incident Title',
      type: 'text',
      placeholder: 'e.g., "Production Database Outage - Order Processing System"',
      required: true,
    },
    {
      id: 'severity',
      label: 'Severity Level',
      type: 'select',
      options: ['SEV1 - Critical (major outage, data loss)', 'SEV2 - Major (significant impact, degraded service)', 'SEV3 - Minor (limited impact, workaround available)', 'SEV4 - Low (minimal impact, cosmetic issues)'],
      required: true,
    },
    {
      id: 'incidentTimeline',
      label: 'Incident Timeline',
      type: 'textarea',
      placeholder: 'Chronological events with timestamps...',
      required: true,
      rows: 8,
    },
    {
      id: 'impactDescription',
      label: 'Impact Description',
      type: 'textarea',
      placeholder: 'Business impact, customers affected, revenue implications...',
      required: true,
      rows: 5,
    },
    {
      id: 'rootCauseAnalysis',
      label: 'Root Cause Analysis',
      type: 'textarea',
      placeholder: 'What caused the incident? Apply 5 Whys...',
      required: true,
      rows: 6,
    },
    {
      id: 'responseActions',
      label: 'Response Actions Taken',
      type: 'textarea',
      placeholder: 'What did the team do to resolve it?',
      required: true,
      rows: 5,
    },
    {
      id: 'contributingFactors',
      label: 'Contributing Factors (Optional)',
      type: 'textarea',
      placeholder: 'Other factors that contributed to the incident...',
      required: false,
      rows: 4,
    },
    {
      id: 'lessonsLearned',
      label: 'Lessons Learned (Optional)',
      type: 'textarea',
      placeholder: 'What did the team learn?',
      required: false,
      rows: 4,
    },
    {
      id: 'proposedRemediation',
      label: 'Proposed Remediation Change',
      type: 'textarea',
      placeholder: 'Describe the primary improvement/change needed to prevent recurrence...',
      required: true,
      rows: 5,
    },
    {
      id: 'scheduledWindow',
      label: 'Preferred Implementation Window',
      type: 'text',
      placeholder: 'e.g., "Next maintenance window - Saturday 2:00 AM"',
      required: true,
    },
  ],

  steps: [
    {
      id: 'step-postmortem',
      skillId: 'incident-postmortem-generator',
      name: 'Generate Incident Postmortem',
      description: 'Create comprehensive blameless postmortem with action items',
      inputMappings: {
        incidentTitle: { type: 'global', inputId: 'incidentTitle' },
        severity: { type: 'global', inputId: 'severity' },
        incidentTimeline: { type: 'global', inputId: 'incidentTimeline' },
        impactDescription: { type: 'global', inputId: 'impactDescription' },
        rootCauseAnalysis: { type: 'global', inputId: 'rootCauseAnalysis' },
        responseActions: { type: 'global', inputId: 'responseActions' },
        contributingFactors: { type: 'global', inputId: 'contributingFactors' },
        lessonsLearned: { type: 'global', inputId: 'lessonsLearned' },
      },
      outputKey: 'postmortem',
    },
    {
      id: 'step-change-request',
      skillId: 'change-request-doc-builder',
      name: 'Generate Remediation Change Request',
      description: 'Create CAB-ready change request for primary remediation',
      inputMappings: {
        changeSummary: { type: 'computed', template: 'Post-incident remediation for: {{incidentTitle}}\n\nProposed change:\n{{proposedRemediation}}\n\nPostmortem findings:\n{{postmortem}}' },
        changeType: { type: 'static', value: 'Normal (requires CAB approval)' },
        systemsAffected: { type: 'computed', template: 'Based on incident analysis:\n{{postmortem}}\n\nOriginal response actions:\n{{responseActions}}' },
        implementationSteps: { type: 'global', inputId: 'proposedRemediation' },
        testingEvidence: { type: 'computed', template: 'This change addresses findings from incident postmortem:\n{{postmortem}}\n\nTesting will be conducted in staging before production deployment.' },
        rollbackPlan: { type: 'computed', template: 'Rollback to pre-change state if issues detected. Based on incident response experience:\n{{responseActions}}' },
        scheduledWindow: { type: 'global', inputId: 'scheduledWindow' },
        riskAssessment: { type: 'computed', template: 'Risk of not implementing: Recurrence of incident {{incidentTitle}}\nImpact of recurrence: {{impactDescription}}\n\nImplementation risk: Lower than incident recurrence risk.' },
      },
      outputKey: 'changeRequest',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL GOVERNANCE & OPERATIONS WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════

export const GOVERNANCE_OPS_WORKFLOWS: Record<string, Workflow> = {
  'ai-governance-implementation': AI_GOVERNANCE_IMPLEMENTATION_WORKFLOW,
  'ai-data-protection-assessment': AI_DATA_PROTECTION_WORKFLOW,
  'compliance-program-builder': COMPLIANCE_PROGRAM_WORKFLOW,
  'incident-to-improvement': INCIDENT_TO_IMPROVEMENT_WORKFLOW,
};

export const GOVERNANCE_OPS_WORKFLOW_LIST: Workflow[] = Object.values(GOVERNANCE_OPS_WORKFLOWS);
