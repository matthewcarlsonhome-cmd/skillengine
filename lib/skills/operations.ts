/**
 * Compliance & IT Operations Skills
 *
 * Skills for compliance audit preparation, policy generation, incident management,
 * and IT change management. Designed for Compliance Officers, IT Operations,
 * SRE teams, and Internal Audit professionals.
 */

import type { SkillDefinition } from '../storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function createUserPrompt(inputs: Record<string, string>, fields: string[]): string {
  return fields
    .filter((field) => inputs[field]?.trim())
    .map((field) => {
      const label = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
      return `**${label}:**\n${inputs[field]}`;
    })
    .join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 1: COMPLIANCE AUDIT PREPARATION ASSISTANT
// ═══════════════════════════════════════════════════════════════════════════

export const COMPLIANCE_AUDIT_PREP_SKILL: SkillDefinition = {
  id: 'compliance-audit-prep-assistant',
  name: 'Compliance Audit Preparation Assistant',
  description: 'Prepare for compliance audits with evidence checklists, gap analysis, interview prep, and readiness assessments.',
  longDescription: 'Transform audit preparation from last-minute chaos to organized execution. This skill analyzes your audit scope, available evidence, and known gaps to create a comprehensive preparation plan. Generates evidence checklists, interview preparation guides, and identifies risks before auditors arrive. Supports SOC2, ISO 27001, HIPAA, PCI-DSS, and custom frameworks.',
  category: 'compliance',
  icon: 'ClipboardCheck',
  color: 'blue',
  estimatedTime: '12-18 minutes',
  tags: ['enterprise', 'compliance', 'audit', 'risk', 'security'],

  inputs: [
    {
      id: 'auditType',
      label: 'Audit Type',
      type: 'select',
      required: true,
      options: ['SOC2 Type II', 'SOC2 Type I', 'ISO 27001', 'HIPAA', 'PCI-DSS', 'GDPR Assessment', 'Internal Audit', 'Custom Framework'],
      placeholder: 'Select the audit type',
    },
    {
      id: 'auditScope',
      label: 'Audit Scope',
      type: 'textarea',
      required: true,
      placeholder: 'What is included in the audit scope?\n\nExamples:\n- Cloud infrastructure (AWS, Azure)\n- Customer data handling processes\n- Access management and identity\n- Incident response procedures\n- Vendor management\n- Change management\n- Business continuity',
      rows: 6,
    },
    {
      id: 'auditTimeline',
      label: 'Audit Timeline',
      type: 'text',
      required: true,
      placeholder: 'e.g., "Audit fieldwork begins March 15, 2025" or "4 weeks until audit"',
    },
    {
      id: 'controlFramework',
      label: 'Control Framework / Requirements',
      type: 'textarea',
      required: true,
      placeholder: 'What controls or criteria apply?\n\nExamples for SOC2:\n- CC1-CC9 (Common Criteria)\n- Availability criteria\n- Confidentiality criteria\n- Processing integrity\n\nOr list specific control IDs...',
      rows: 5,
    },
    {
      id: 'availableEvidence',
      label: 'Available Evidence',
      type: 'textarea',
      required: true,
      placeholder: 'What documentation and evidence do you have?\n\nExamples:\n- AWS CloudTrail logs\n- Okta access review reports\n- Jira tickets for changes\n- Confluence policies and procedures\n- Security awareness training records\n- Penetration test reports',
      rows: 6,
    },
    {
      id: 'knownGaps',
      label: 'Known Gaps (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What gaps are you already aware of?\n\nExamples:\n- Missing quarterly access reviews for Q2\n- BCP testing documentation incomplete\n- Vendor security assessments overdue\n- Policy update needed for remote work',
      rows: 4,
    },
    {
      id: 'previousFindings',
      label: 'Previous Audit Findings (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What did last year\'s audit find?\n\nExamples:\n- 2 observations on access review timeliness\n- 1 finding on vendor management documentation\n- Recommendation to improve change management',
      rows: 4,
    },
  ],

  generatePrompt: (inputs: Record<string, string>) => ({
    systemInstruction: `You are a compliance audit expert helping organizations prepare for certification and regulatory audits. Your preparation plan should be:

1. COMPREHENSIVE: Cover all control areas in scope
2. PRACTICAL: Focus on what auditors actually look for
3. PRIORITIZED: Address highest-risk gaps first
4. TIMELINE-AWARE: Account for time remaining before audit
5. EVIDENCE-FOCUSED: Specify exactly what documentation is needed

IMPORTANT NOTES:
- This is preparation guidance, not audit assurance
- Recommend engaging qualified auditors for formal assessment
- Previous findings often receive extra scrutiny—address them first
- Evidence quality matters as much as existence

OUTPUT STRUCTURE:
1. Audit Readiness Score
   - Overall percentage ready
   - Breakdown by control area
   - Confidence level assessment
2. Evidence Checklist
   - Required items with availability status
   - Format requirements for each
   - Where to locate/generate missing items
3. Gap Remediation Plan
   - Prioritized actions before audit
   - Owner suggestions
   - Effort estimates
   - Dependencies
4. Control-to-Evidence Matrix
   - Each control mapped to supporting evidence
   - Primary and secondary evidence sources
5. Interview Preparation Guide
   - Likely questions by control area
   - Key personnel who should be prepared
   - Suggested talking points
6. Document Request Anticipation
   - What auditors will request
   - Recommended organization/naming
   - Access provisioning needed
7. Risk Areas Summary
   - Where findings are most likely
   - Mitigation strategies
   - Escalation recommendations
8. Daily Prep Timeline
   - Countdown activities to audit date
   - Milestones and checkpoints

Use markdown formatting with clear tables and checklists.`,

    userPrompt: createUserPrompt(inputs, [
      'auditType',
      'auditScope',
      'auditTimeline',
      'controlFramework',
      'availableEvidence',
      'knownGaps',
      'previousFindings',
    ]),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 2: POLICY DOCUMENT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export const POLICY_DOCUMENT_GENERATOR_SKILL: SkillDefinition = {
  id: 'policy-document-generator',
  name: 'Policy Document Generator',
  description: 'Generate professional security, privacy, and operational policies tailored to your organization\'s context and compliance requirements.',
  longDescription: 'Create comprehensive policy documents in minutes instead of days. This skill generates professionally formatted policies that meet compliance requirements while reflecting your actual practices. Includes implementation checklists, training requirements, and exception processes. Output is ready for legal review and approval.',
  category: 'compliance',
  icon: 'FileText',
  color: 'indigo',
  estimatedTime: '10-15 minutes',
  tags: ['enterprise', 'compliance', 'policy', 'security', 'governance'],

  inputs: [
    {
      id: 'policyType',
      label: 'Policy Type',
      type: 'select',
      required: true,
      options: [
        'Information Security Policy',
        'Data Privacy Policy',
        'Acceptable Use Policy',
        'Data Retention Policy',
        'Incident Response Policy',
        'Access Control Policy',
        'Vendor Management Policy',
        'Business Continuity Policy',
        'Remote Work Policy',
        'AI/ML Usage Policy',
        'Change Management Policy',
        'Password/Authentication Policy',
      ],
      placeholder: 'Select the policy type to generate',
    },
    {
      id: 'organizationContext',
      label: 'Organization Context',
      type: 'textarea',
      required: true,
      placeholder: 'Describe your organization...\n\nExamples:\n- 500-person technology company\n- SaaS product serving enterprise clients\n- Remote-first workforce\n- SOC2 and GDPR compliant\n- Handles customer PII and financial data',
      rows: 5,
    },
    {
      id: 'regulatoryRequirements',
      label: 'Regulatory Requirements',
      type: 'textarea',
      required: true,
      placeholder: 'What regulations must this policy address?\n\nExamples:\n- GDPR (EU customers)\n- CCPA (California residents)\n- SOC2 trust service criteria\n- HIPAA (healthcare clients)\n- PCI-DSS (payment processing)',
      rows: 4,
    },
    {
      id: 'existingPractices',
      label: 'Existing Practices',
      type: 'textarea',
      required: true,
      placeholder: 'What practices are already in place?\n\nExamples:\n- Okta SSO with MFA required\n- 90-day password rotation\n- Annual security awareness training\n- Quarterly access reviews\n- Background checks for all employees',
      rows: 5,
    },
    {
      id: 'approvalAuthority',
      label: 'Approval Authority',
      type: 'text',
      required: true,
      placeholder: 'e.g., "CISO with CEO sign-off" or "VP of Engineering"',
    },
    {
      id: 'reviewCycle',
      label: 'Review Cycle',
      type: 'select',
      required: true,
      options: ['Annual', 'Semi-annual', 'Quarterly', 'As Needed'],
      placeholder: 'How often should this policy be reviewed?',
    },
    {
      id: 'audienceScope',
      label: 'Audience Scope',
      type: 'select',
      required: true,
      options: ['All Employees', 'IT Staff Only', 'Management', 'Contractors Included', 'Specific Departments'],
      placeholder: 'Who must comply with this policy?',
    },
  ],

  generatePrompt: (inputs: Record<string, string>) => ({
    systemInstruction: `You are a policy documentation expert creating professional, compliance-ready policy documents. Your policies should be:

1. COMPREHENSIVE: Cover all required elements for the policy type
2. PRACTICAL: Reflect actual practices, not aspirational statements
3. ENFORCEABLE: Clear enough to audit and enforce
4. COMPLIANT: Meet specified regulatory requirements
5. READABLE: Accessible to the intended audience

IMPORTANT NOTES:
- This is a draft for legal/compliance review before adoption
- Include version control and approval signatures section
- Policies should be specific enough to be actionable
- Avoid overly complex language that reduces compliance

OUTPUT STRUCTURE:
1. Policy Header
   - Policy name and ID
   - Version, effective date, review date
   - Owner and approval authority
   - Classification level
2. Purpose and Scope
   - Why this policy exists
   - Who it applies to
   - What it covers
3. Definitions
   - Key terms used in the policy
4. Policy Statements
   - Core requirements (numbered)
   - Specific mandates and prohibitions
   - Standards and baselines
5. Roles and Responsibilities
   - Who is responsible for what
   - Escalation paths
6. Procedures
   - How to comply (high-level)
   - Reference to detailed procedures
7. Exceptions
   - How to request exceptions
   - Approval process
   - Documentation requirements
8. Enforcement
   - Consequences of non-compliance
   - Reporting violations
9. Related Documents
   - Other policies referenced
   - Supporting procedures
10. Revision History
    - Version tracking table

ALSO GENERATE:
- One-page executive summary
- Implementation checklist
- Training requirements
- Metrics for measuring compliance

Use professional formatting with numbered sections and clear hierarchy.`,

    userPrompt: createUserPrompt(inputs, [
      'policyType',
      'organizationContext',
      'regulatoryRequirements',
      'existingPractices',
      'approvalAuthority',
      'reviewCycle',
      'audienceScope',
    ]),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 3: INCIDENT POSTMORTEM GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export const INCIDENT_POSTMORTEM_SKILL: SkillDefinition = {
  id: 'incident-postmortem-generator',
  name: 'Incident Postmortem Generator',
  description: 'Create comprehensive, blameless postmortems with root cause analysis, action items, and prevention recommendations.',
  longDescription: 'Transform incident data into structured, actionable postmortems. This skill applies the 5 Whys framework, identifies contributing factors across people, process, and technology, and generates specific action items with owners. Produces both executive summaries and technical details for different audiences.',
  category: 'operations',
  icon: 'AlertTriangle',
  color: 'red',
  estimatedTime: '10-15 minutes',
  tags: ['enterprise', 'it-ops', 'sre', 'devops', 'incident-management'],

  inputs: [
    {
      id: 'incidentTitle',
      label: 'Incident Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., "Production Database Outage - Order Processing System"',
    },
    {
      id: 'severity',
      label: 'Severity Level',
      type: 'select',
      required: true,
      options: ['SEV1 - Critical (major outage, data loss)', 'SEV2 - Major (significant impact, degraded service)', 'SEV3 - Minor (limited impact, workaround available)', 'SEV4 - Low (minimal impact, cosmetic issues)'],
      placeholder: 'Select incident severity',
    },
    {
      id: 'incidentTimeline',
      label: 'Incident Timeline',
      type: 'textarea',
      required: true,
      placeholder: 'Chronological events with timestamps...\n\nExample:\n14:32 - Alert fired for DB connection errors\n14:35 - On-call engineer paged\n14:42 - Identified connection pool exhaustion\n14:55 - Implemented temporary fix (increased pool)\n15:10 - Service fully restored\n15:30 - Root cause confirmed',
      rows: 8,
    },
    {
      id: 'impactDescription',
      label: 'Impact Description',
      type: 'textarea',
      required: true,
      placeholder: 'What was the business impact?\n\nExamples:\n- Order processing unavailable for 47 minutes\n- ~$50K estimated revenue impact\n- 1,200 customers affected\n- 15 support tickets opened\n- SLA breach for 3 enterprise customers',
      rows: 5,
    },
    {
      id: 'rootCauseAnalysis',
      label: 'Root Cause Analysis',
      type: 'textarea',
      required: true,
      placeholder: 'What caused the incident?\n\nExample:\n- Connection pool sized for 100 connections\n- Black Friday traffic spike caused 300 concurrent requests\n- Pool exhaustion caused cascading failures\n- No autoscaling configured for connection pool\n- Monitoring threshold set too high to catch early',
      rows: 6,
    },
    {
      id: 'responseActions',
      label: 'Response Actions Taken',
      type: 'textarea',
      required: true,
      placeholder: 'What did the team do to resolve it?\n\nExamples:\n- Increased connection pool to 500\n- Added monitoring for connection count\n- Implemented circuit breaker pattern\n- Scaled up database instance\n- Communicated status to affected customers',
      rows: 5,
    },
    {
      id: 'contributingFactors',
      label: 'Contributing Factors (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What else contributed to this incident?\n\nExamples:\n- No load testing performed for Black Friday\n- Monitoring threshold too high (90% vs 70%)\n- Runbook for this scenario was outdated\n- On-call engineer unfamiliar with this system',
      rows: 4,
    },
    {
      id: 'lessonsLearned',
      label: 'Lessons Learned (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What did the team learn?\n\nExamples:\n- Need capacity planning for peak events\n- Should improve alert thresholds\n- Runbooks need quarterly review\n- Cross-training needed for on-call rotation',
      rows: 4,
    },
  ],

  generatePrompt: (inputs: Record<string, string>) => ({
    systemInstruction: `You are an SRE/incident management expert creating blameless, actionable postmortems. Your postmortem should be:

1. BLAMELESS: Focus on systems and processes, not individuals
2. THOROUGH: Cover all aspects of the incident lifecycle
3. ACTIONABLE: Every finding should lead to specific improvements
4. LEARNING-FOCUSED: Emphasize what can be improved
5. AUDIENCE-APPROPRIATE: Executive summary + technical details

IMPORTANT PRINCIPLES:
- Use "the system" or "the process" instead of naming individuals negatively
- Celebrate good responses and quick recoveries
- Focus on systemic improvements, not heroic firefighting
- Action items must be specific, owned, and time-bound
- Include both quick fixes and long-term improvements

OUTPUT STRUCTURE:
1. Executive Summary
   - Non-technical overview (3-4 sentences)
   - Impact summary
   - Key action items
2. Incident Overview
   - Title, severity, duration
   - Services affected
   - Detection method
3. Timeline
   - Structured chronological view
   - Key decision points highlighted
   - Time to detect, time to mitigate, time to resolve
4. Impact Analysis
   - Quantified business impact
   - Customer impact
   - SLA implications
   - Reputational considerations
5. Root Cause Analysis
   - 5 Whys analysis (go deep!)
   - Primary vs. contributing causes
   - Chain of events diagram (text description)
6. Contributing Factors
   - People factors (training, staffing, fatigue)
   - Process factors (procedures, communication)
   - Technology factors (monitoring, tooling, architecture)
7. What Went Well
   - Effective responses to celebrate
   - Systems that worked as designed
8. What Could Be Improved
   - Detection improvements
   - Response improvements
   - Prevention improvements
9. Action Items
   - Specific tasks with owners
   - Priority (P1/P2/P3)
   - Due dates
   - Success criteria
10. Metrics to Track
    - Leading indicators to prevent recurrence
    - Monitoring improvements
11. Follow-up Schedule
    - Review date for action items
    - Next postmortem review

Use markdown formatting with clear headers and tables.`,

    userPrompt: createUserPrompt(inputs, [
      'incidentTitle',
      'severity',
      'incidentTimeline',
      'impactDescription',
      'rootCauseAnalysis',
      'responseActions',
      'contributingFactors',
      'lessonsLearned',
    ]),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 4: CHANGE REQUEST DOCUMENTATION BUILDER
// ═══════════════════════════════════════════════════════════════════════════

export const CHANGE_REQUEST_DOC_SKILL: SkillDefinition = {
  id: 'change-request-doc-builder',
  name: 'Change Request Documentation Builder',
  description: 'Generate comprehensive CAB-ready change request documentation with risk assessments, rollback plans, and communication templates.',
  longDescription: 'Create professional change request packages that pass CAB review on the first submission. This skill generates risk assessments, implementation checklists, rollback procedures, stakeholder notifications, and go/no-go criteria. Reduces change documentation time from hours to minutes while improving completeness.',
  category: 'operations',
  icon: 'GitPullRequest',
  color: 'amber',
  estimatedTime: '8-12 minutes',
  tags: ['enterprise', 'it-ops', 'change-management', 'devops', 'itil'],

  inputs: [
    {
      id: 'changeSummary',
      label: 'Change Summary',
      type: 'textarea',
      required: true,
      placeholder: 'What is being changed and why?\n\nExample:\nDeploy new authentication microservice to production, replacing legacy auth module. This enables SSO integration and improves login performance by 40%.',
      rows: 4,
    },
    {
      id: 'changeType',
      label: 'Change Type',
      type: 'select',
      required: true,
      options: ['Standard (pre-approved, low risk)', 'Normal (requires CAB approval)', 'Emergency (expedited approval needed)'],
      placeholder: 'Select change type',
    },
    {
      id: 'systemsAffected',
      label: 'Systems Affected',
      type: 'textarea',
      required: true,
      placeholder: 'What systems, services, and integrations are impacted?\n\nExamples:\n- Authentication service (primary)\n- User database\n- API gateway\n- Mobile apps (iOS, Android)\n- Web portal\n- Third-party SSO integrations',
      rows: 5,
    },
    {
      id: 'implementationSteps',
      label: 'Implementation Steps',
      type: 'textarea',
      required: true,
      placeholder: 'Step-by-step implementation plan...\n\nExample:\n1. Deploy to staging environment (2h)\n2. Run integration test suite (1h)\n3. Deploy to production with canary (2h)\n4. Monitor metrics for 30 min\n5. Gradual rollout to 100% (1h)\n6. Post-deployment validation (30m)',
      rows: 7,
    },
    {
      id: 'testingEvidence',
      label: 'Testing Evidence',
      type: 'textarea',
      required: true,
      placeholder: 'What testing has been completed?\n\nExamples:\n- Unit tests: 98% pass rate\n- Integration tests: 95% pass rate\n- Load test: handled 2x expected traffic\n- Security scan: no critical findings\n- UAT sign-off from product team',
      rows: 5,
    },
    {
      id: 'rollbackPlan',
      label: 'Rollback Plan',
      type: 'textarea',
      required: true,
      placeholder: 'How will you rollback if issues arise?\n\nExample:\n1. Revert container image to previous version\n2. Rollback database migration script\n3. Restore configuration from backup\n4. If data corruption: restore from snapshot\n5. Estimated rollback time: 15 minutes',
      rows: 5,
    },
    {
      id: 'scheduledWindow',
      label: 'Scheduled Implementation Window',
      type: 'text',
      required: true,
      placeholder: 'e.g., "Saturday 2:00 AM - 6:00 AM EST (low traffic period)"',
    },
    {
      id: 'riskAssessment',
      label: 'Risk Assessment (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What are the known risks?\n\nExamples:\n- Medium risk: affects all user logins\n- Mitigated by canary deployment\n- Quick rollback capability available\n- Monitoring will detect issues within 2 min',
      rows: 4,
    },
  ],

  generatePrompt: (inputs: Record<string, string>) => ({
    systemInstruction: `You are an IT change management expert creating comprehensive, CAB-ready change documentation. Your change request should be:

1. COMPLETE: Include all information CAB needs to approve
2. CLEAR: Unambiguous implementation and rollback steps
3. RISK-AWARE: Honest assessment with mitigations
4. PROFESSIONAL: Ready for formal review process
5. ACTIONABLE: Clear go/no-go criteria and decision points

IMPORTANT PRINCIPLES:
- Be specific about timing and duration
- Include communication templates for stakeholders
- Address "what if" scenarios in rollback planning
- Define success criteria clearly
- Consider downstream impacts on dependent systems

OUTPUT STRUCTURE:
1. Change Request Summary
   - One-page executive overview
   - Change ID placeholder
   - Requestor, approver fields
   - Classification and priority
2. Business Justification
   - Why this change is needed
   - Impact of not implementing
   - Expected benefits
3. Technical Details
   - Systems affected (detailed)
   - Architecture changes
   - Data impact assessment
4. Risk Assessment Matrix
   - Risk identification
   - Likelihood x Impact scoring
   - Mitigation strategies
   - Residual risk
5. Implementation Plan
   - Detailed step-by-step
   - Time estimates per step
   - Resource requirements
   - Dependencies
6. Rollback Plan
   - Trigger criteria (when to rollback)
   - Step-by-step rollback procedure
   - Decision tree for different failure modes
   - Data recovery procedures
7. Testing Summary
   - Tests performed
   - Results and coverage
   - Outstanding risks from testing
8. Stakeholder Notification Plan
   - Who to notify
   - When to notify
   - Communication templates
9. Go/No-Go Criteria
   - Pre-implementation checklist
   - Conditions for proceeding
   - Stop criteria during implementation
10. Post-Implementation
    - Verification steps
    - Success criteria
    - Monitoring period
    - Sign-off requirements
11. Communication Templates
    - Change start notification
    - Completion notification
    - Rollback notification (if needed)

Use markdown formatting with checklists and tables.`,

    userPrompt: createUserPrompt(inputs, [
      'changeSummary',
      'changeType',
      'systemsAffected',
      'implementationSteps',
      'testingEvidence',
      'rollbackPlan',
      'scheduledWindow',
      'riskAssessment',
    ]),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL COMPLIANCE & IT OPERATIONS SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const OPERATIONS_SKILLS: Record<string, SkillDefinition> = {
  'compliance-audit-prep-assistant': COMPLIANCE_AUDIT_PREP_SKILL,
  'policy-document-generator': POLICY_DOCUMENT_GENERATOR_SKILL,
  'incident-postmortem-generator': INCIDENT_POSTMORTEM_SKILL,
  'change-request-doc-builder': CHANGE_REQUEST_DOC_SKILL,
};

export const OPERATIONS_SKILLS_LIST: SkillDefinition[] = Object.values(OPERATIONS_SKILLS);
