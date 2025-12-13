/**
 * AI Data Governance & Security Skills
 *
 * Skills to help organizations adopt AI safely, establish governance frameworks,
 * and address data protection concerns. Designed for Security, Compliance,
 * Legal, and IT leadership teams.
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
// SKILL 1: AI GOVERNANCE READINESS ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════

export const AI_GOVERNANCE_ASSESSMENT_SKILL: SkillDefinition = {
  id: 'ai-governance-readiness-assessment',
  name: 'AI Governance Readiness Assessment',
  description: 'Assess your organization\'s AI governance maturity and get a prioritized roadmap for establishing effective AI oversight.',
  longDescription: 'This skill evaluates your current AI usage, policies, and controls against industry best practices. It generates a governance maturity snapshot, identifies gaps and risks, and provides a phased roadmap for building robust AI governance. Ideal for security leaders, compliance officers, and executives planning AI adoption strategies.',
  category: 'governance',
  icon: 'Shield',
  color: 'blue',
  estimatedTime: '10-15 minutes',
  tags: ['enterprise', 'governance', 'security', 'compliance', 'ai-risk'],

  inputs: [
    {
      id: 'organizationSize',
      label: 'Organization Size',
      type: 'select',
      required: true,
      options: ['1-100 employees', '101-500 employees', '501-2000 employees', '2001-10000 employees', '10000+ employees'],
      placeholder: 'Select your organization size',
    },
    {
      id: 'industry',
      label: 'Industry',
      type: 'select',
      required: true,
      options: ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail/E-commerce', 'Professional Services', 'Government/Public Sector', 'Education', 'Other'],
      placeholder: 'Select your industry',
    },
    {
      id: 'currentAIUsage',
      label: 'Current AI Usage',
      type: 'textarea',
      required: true,
      placeholder: 'Describe how AI is currently used in your organization...\n\nExamples:\n- ChatGPT for marketing copy and customer emails\n- GitHub Copilot for software development\n- AI-powered customer service chatbot\n- Internal document search with RAG',
      rows: 6,
    },
    {
      id: 'dataClassifications',
      label: 'Data Classifications & Sensitivity',
      type: 'textarea',
      required: true,
      placeholder: 'Describe your data classification scheme and what sensitive data you handle...\n\nExamples:\n- Public, Internal, Confidential, Restricted\n- Handle customer PII (names, emails, addresses)\n- Some PHI for healthcare clients\n- Financial transaction data',
      rows: 5,
    },
    {
      id: 'existingPolicies',
      label: 'Existing Policies (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What relevant policies do you already have?\n\nExamples:\n- IT Security Policy\n- Acceptable Use Policy\n- Data Privacy Policy\n- No AI-specific policies yet',
      rows: 4,
    },
    {
      id: 'keyConcerns',
      label: 'Key Concerns',
      type: 'textarea',
      required: true,
      placeholder: 'What are your primary concerns about AI governance?\n\nExamples:\n- Data leakage to AI vendors\n- Compliance with GDPR/CCPA\n- Employee misuse of AI tools\n- Intellectual property exposure\n- Bias in AI-generated content',
      rows: 5,
    },
    {
      id: 'regulatoryRequirements',
      label: 'Regulatory Requirements (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What regulations apply to your organization?\n\nExamples: GDPR, CCPA, HIPAA, SOC2, PCI-DSS, EU AI Act, State privacy laws',
      rows: 3,
    },
  ],

  generatePrompt: (inputs: Record<string, string>) => ({
    systemInstruction: `You are an AI governance expert helping organizations establish frameworks for safe, responsible AI adoption. Your assessment should be:

1. PRACTICAL: Focus on actionable recommendations, not theoretical frameworks
2. RISK-AWARE: Identify specific risks without being alarmist
3. PRIORITIZED: Clearly distinguish quick wins from longer-term initiatives
4. INDUSTRY-APPROPRIATE: Tailor recommendations to the organization's sector and size
5. BALANCED: Consider both enabling innovation and managing risk

IMPORTANT DISCLAIMERS TO INCLUDE:
- This assessment provides guidance for internal planning purposes
- It does not constitute legal or compliance advice
- Organizations should validate recommendations with qualified legal counsel
- Specific regulatory requirements may vary by jurisdiction

OUTPUT STRUCTURE:
1. Executive Summary (2-3 paragraphs)
2. Governance Maturity Snapshot (1-5 scale across 6 dimensions)
3. Gap Analysis (what's missing vs. best practices)
4. Risk Heat Map (prioritized risks by likelihood and impact)
5. Recommendations Roadmap:
   - Quick Wins (0-30 days)
   - Short-term (1-3 months)
   - Medium-term (3-6 months)
6. Policy Framework Outline (key policies needed)
7. Stakeholder Roles (who should own what)
8. Resource Estimates (rough effort levels)

Use markdown formatting with clear headers and bullet points.`,

    userPrompt: createUserPrompt(inputs, [
      'organizationSize',
      'industry',
      'currentAIUsage',
      'dataClassifications',
      'existingPolicies',
      'keyConcerns',
      'regulatoryRequirements',
    ]),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 2: SECURE AI USAGE PLAYBOOK BUILDER
// ═══════════════════════════════════════════════════════════════════════════

export const SECURE_AI_PLAYBOOK_SKILL: SkillDefinition = {
  id: 'secure-ai-usage-playbook',
  name: 'Secure AI Usage Playbook Builder',
  description: 'Generate comprehensive AI usage guidelines and policies tailored to your organization\'s approved tools and risk tolerance.',
  longDescription: 'Create practical, employee-ready guidelines for using AI tools safely. This skill generates acceptable use policies, data handling rules, decision trees for appropriate AI use, and training outlines. Output is ready for HR/Legal review and employee distribution.',
  category: 'governance',
  icon: 'BookOpen',
  color: 'green',
  estimatedTime: '8-12 minutes',
  tags: ['enterprise', 'governance', 'policy', 'training', 'hr'],

  inputs: [
    {
      id: 'approvedAITools',
      label: 'Approved AI Tools',
      type: 'textarea',
      required: true,
      placeholder: 'List the AI tools approved for use in your organization...\n\nExamples:\n- ChatGPT Enterprise (all employees)\n- Microsoft Copilot (Office suite)\n- GitHub Copilot (engineering only)\n- Midjourney (marketing team)',
      rows: 5,
    },
    {
      id: 'commonUseCases',
      label: 'Common Use Cases',
      type: 'textarea',
      required: true,
      placeholder: 'What do employees typically use AI for?\n\nExamples:\n- Drafting customer support responses\n- Code assistance and review\n- Marketing content creation\n- Data analysis and summarization\n- Translation and localization\n- Meeting notes and summaries',
      rows: 5,
    },
    {
      id: 'prohibitedActivities',
      label: 'Prohibited Activities',
      type: 'textarea',
      required: true,
      placeholder: 'What should employees NEVER do with AI?\n\nExamples:\n- Input customer PII into non-enterprise AI\n- Generate legal contracts or advice\n- Make hiring/firing decisions\n- Create content claiming human authorship\n- Process regulated data (HIPAA, PCI)',
      rows: 5,
    },
    {
      id: 'dataHandlingRules',
      label: 'Data Handling Rules',
      type: 'textarea',
      required: true,
      placeholder: 'What data restrictions apply to AI usage?\n\nExamples:\n- No customer names in prompts\n- No financial data in free AI tiers\n- No source code in public AI tools\n- Anonymize data before AI processing\n- No confidential documents without approval',
      rows: 5,
    },
    {
      id: 'regulatoryContext',
      label: 'Regulatory Context (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'Any specific regulations affecting AI usage?\n\nExamples:\n- Financial services (SEC, FINRA rules)\n- Healthcare (HIPAA)\n- EU operations (GDPR, AI Act)\n- Government contractor requirements',
      rows: 3,
    },
    {
      id: 'audienceLevel',
      label: 'Target Audience',
      type: 'select',
      required: true,
      options: ['All Employees', 'Technical Staff Only', 'Management Only', 'Specific Departments', 'Contractors/Vendors'],
      placeholder: 'Who will use this playbook?',
    },
  ],

  generatePrompt: (inputs: Record<string, string>) => ({
    systemInstruction: `You are an AI policy expert creating practical, employee-friendly guidelines for safe AI usage. Your playbook should be:

1. CLEAR: Written for non-technical employees to understand
2. ACTIONABLE: Specific do's and don'ts, not vague principles
3. PRACTICAL: Real-world examples and decision guidance
4. BALANCED: Enable productivity while managing risk
5. ENFORCEABLE: Clear enough to audit and enforce

IMPORTANT NOTES:
- This is a draft for HR/Legal review before distribution
- Include acknowledgment that employees should sign
- Provide escalation paths for unclear situations
- Avoid overly restrictive rules that employees will ignore

OUTPUT STRUCTURE:
1. Executive Summary (purpose and scope)
2. Acceptable Use Guidelines
   - Approved activities
   - Prohibited activities
   - Gray areas requiring approval
3. Tool-Specific Rules (by approved tool)
4. Data Classification Quick Reference
   - What CAN go into AI
   - What CANNOT go into AI
   - Examples for each category
5. Use Case Decision Tree
   - "Is this AI use appropriate?" flowchart logic
6. Required Disclosures
   - When to disclose AI assistance
   - How to attribute AI-generated content
7. Escalation Procedures
   - Who to ask when uncertain
   - How to report misuse
8. Employee Acknowledgment Form Template
9. Training Outline (key topics for onboarding)

Use markdown formatting. Make it scannable with headers, bullets, and tables.`,

    userPrompt: createUserPrompt(inputs, [
      'approvedAITools',
      'commonUseCases',
      'prohibitedActivities',
      'dataHandlingRules',
      'regulatoryContext',
      'audienceLevel',
    ]),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 3: AI DATA FLOW RISK MAPPER
// ═══════════════════════════════════════════════════════════════════════════

export const AI_DATA_FLOW_RISK_MAP_SKILL: SkillDefinition = {
  id: 'ai-data-flow-risk-map',
  name: 'AI Data Flow Risk Mapper',
  description: 'Map how your data flows through AI systems and identify security risks, control gaps, and compliance concerns.',
  longDescription: 'This skill creates a comprehensive view of AI touchpoints in your data ecosystem. It identifies where sensitive data meets AI systems, highlights risk points, and recommends mitigations. Essential for security architects, DPOs, and compliance teams preparing for audits or AI expansion.',
  category: 'governance',
  icon: 'GitBranch',
  color: 'red',
  estimatedTime: '10-15 minutes',
  tags: ['enterprise', 'security', 'privacy', 'compliance', 'data-protection'],

  inputs: [
    {
      id: 'keySystemsInventory',
      label: 'Key Systems Inventory',
      type: 'textarea',
      required: true,
      placeholder: 'List the major systems in your environment...\n\nExamples:\n- Salesforce CRM (customer data)\n- SAP ERP (financial, HR data)\n- Zendesk (support tickets)\n- SharePoint/Google Drive (documents)\n- AWS S3 (data lake)\n- Snowflake (analytics)',
      rows: 6,
    },
    {
      id: 'dataTypesProcessed',
      label: 'Data Types Processed',
      type: 'textarea',
      required: true,
      placeholder: 'What types of sensitive data do you handle?\n\nExamples:\n- Customer PII (names, emails, addresses, phone)\n- Financial transactions and payment data\n- Employee HR data (SSN, salary, performance)\n- Healthcare/PHI data\n- Intellectual property and trade secrets\n- Legal documents and contracts',
      rows: 5,
    },
    {
      id: 'aiIntegrations',
      label: 'Current AI Integrations',
      type: 'textarea',
      required: true,
      placeholder: 'How is AI integrated with your systems?\n\nExamples:\n- Salesforce Einstein for lead scoring\n- ChatGPT via Zapier for ticket responses\n- GitHub Copilot for code completion\n- Custom RAG chatbot on internal docs\n- AI-powered document processing\n- Automated report generation',
      rows: 6,
    },
    {
      id: 'dataResidencyRequirements',
      label: 'Data Residency Requirements (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'Any geographic restrictions on data?\n\nExamples:\n- EU customer data must stay in EU\n- HIPAA data cannot leave US\n- Government data requires US-based processing\n- No data to China-based services',
      rows: 3,
    },
    {
      id: 'currentSecurityControls',
      label: 'Current Security Controls (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What security controls are in place?\n\nExamples:\n- SSO/MFA for all systems\n- DLP on email and endpoints\n- Network segmentation\n- Encryption at rest/in transit\n- No AI-specific controls yet',
      rows: 4,
    },
    {
      id: 'plannedAIExpansions',
      label: 'Planned AI Expansions (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What AI initiatives are planned?\n\nExamples:\n- AI customer service chatbot\n- Document processing automation\n- AI-powered analytics dashboard\n- Copilot rollout to all employees',
      rows: 3,
    },
  ],

  generatePrompt: (inputs: Record<string, string>) => ({
    systemInstruction: `You are a security architect specializing in AI systems and data protection. Your risk mapping should be:

1. COMPREHENSIVE: Cover all AI touchpoints, not just obvious ones
2. SPECIFIC: Name actual risks, not generic warnings
3. PRIORITIZED: Focus on highest-impact risks first
4. ACTIONABLE: Each risk should have concrete mitigations
5. COMPLIANT: Consider regulatory implications

IMPORTANT NOTES:
- This is a planning document, not a certified assessment
- Recommend validation with security/privacy professionals
- Consider both current state and planned expansions
- Address third-party AI vendor risks explicitly

OUTPUT STRUCTURE:
1. Executive Summary (key findings and top risks)
2. Data Flow Overview
   - Systems inventory with data types
   - AI integration points
   - Data movement patterns
3. Risk Point Inventory
   - Where sensitive data meets AI
   - Risk rating (High/Medium/Low)
   - Specific vulnerability description
4. Third-Party AI Risk Summary
   - External vendors and their data access
   - Data retention policies
   - Contractual protections needed
5. Control Gap Analysis
   - Missing security controls by risk point
   - Priority for remediation
6. Recommended Mitigations
   - Technical controls (encryption, access control, logging)
   - Process controls (approval workflows, audits)
   - Contractual controls (DPAs, BAAs)
7. Data Minimization Opportunities
   - Where to reduce AI data exposure
   - Anonymization/pseudonymization options
8. Compliance Checkpoint Matrix
   - Requirements mapped to current state
   - Gaps requiring attention
9. Monitoring Recommendations
   - What to track for ongoing risk management
   - Alerting thresholds

Use markdown formatting with tables for matrices and clear visual hierarchy.`,

    userPrompt: createUserPrompt(inputs, [
      'keySystemsInventory',
      'dataTypesProcessed',
      'aiIntegrations',
      'dataResidencyRequirements',
      'currentSecurityControls',
      'plannedAIExpansions',
    ]),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 4: AI GOVERNANCE CLIENT BRIEF GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export const AI_GOVERNANCE_CLIENT_BRIEF_SKILL: SkillDefinition = {
  id: 'ai-governance-client-brief',
  name: 'AI Governance Client Brief Generator',
  description: 'Create professional materials to address client concerns about AI governance, data handling, and security in your products or services.',
  longDescription: 'When selling to or advising enterprise clients, AI governance questions are now standard. This skill generates client-ready materials including executive briefs, FAQ documents, talking points, and technical summaries that address concerns without creating fear. Perfect for sales engineers, consultants, and customer success teams.',
  category: 'governance',
  icon: 'FileText',
  color: 'purple',
  estimatedTime: '8-12 minutes',
  tags: ['enterprise', 'sales', 'consulting', 'client-facing', 'security'],

  inputs: [
    {
      id: 'clientIndustry',
      label: 'Client Industry',
      type: 'select',
      required: true,
      options: ['Financial Services', 'Healthcare', 'Government/Public Sector', 'Technology', 'Manufacturing', 'Retail/E-commerce', 'Professional Services', 'Education', 'Other'],
      placeholder: 'Select the client\'s industry',
    },
    {
      id: 'clientRiskPosture',
      label: 'Client Risk Posture',
      type: 'select',
      required: true,
      options: ['Very Conservative (extensive due diligence)', 'Conservative (thorough review required)', 'Moderate (standard security review)', 'Progressive (early AI adopters)'],
      placeholder: 'How risk-averse is this client?',
    },
    {
      id: 'mainObjections',
      label: 'Main Objections/Concerns',
      type: 'textarea',
      required: true,
      placeholder: 'What concerns has the client raised about AI?\n\nExamples:\n- Worried about data being used to train models\n- Concerned about regulatory compliance\n- Board asking about AI risks\n- Questions about data residency\n- Liability for AI-generated content\n- Accuracy and hallucination concerns',
      rows: 5,
    },
    {
      id: 'yourAICapabilities',
      label: 'Your AI Capabilities',
      type: 'textarea',
      required: true,
      placeholder: 'How does your product/service use AI?\n\nExamples:\n- Use GPT-4 for document analysis\n- AI-powered search and recommendations\n- Automated report generation\n- Chatbot for customer inquiries\n- Predictive analytics features',
      rows: 5,
    },
    {
      id: 'dataHandlingPractices',
      label: 'Data Handling Practices',
      type: 'textarea',
      required: true,
      placeholder: 'How do you handle client data with AI?\n\nExamples:\n- Data encrypted at rest and in transit\n- No data retention by AI vendors\n- Customer data never leaves our environment\n- Anonymization before AI processing\n- Opt-out available for AI features',
      rows: 5,
    },
    {
      id: 'complianceCertifications',
      label: 'Compliance Certifications (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'What certifications/compliance do you have?\n\nExamples:\n- SOC2 Type II certified\n- GDPR compliant\n- HIPAA BAA available\n- ISO 27001 certified\n- FedRAMP authorized',
      rows: 3,
    },
  ],

  generatePrompt: (inputs: Record<string, string>) => ({
    systemInstruction: `You are an AI governance communications expert helping organizations address client concerns about AI usage. Your materials should be:

1. REASSURING: Address concerns without dismissing them
2. TRANSPARENT: Honest about capabilities and limitations
3. PROFESSIONAL: Executive-ready language and formatting
4. SPECIFIC: Concrete answers, not vague assurances
5. INDUSTRY-AWARE: Tailored to the client's sector and risk profile

IMPORTANT GUIDELINES:
- Never make claims you can't substantiate
- Acknowledge legitimate concerns before addressing them
- Provide specific technical details where relevant
- Include options for additional safeguards if needed
- Position AI as a tool that enhances (not replaces) human judgment

OUTPUT STRUCTURE:
1. Executive Summary Brief (1 page)
   - Non-technical explanation of AI governance approach
   - Key assurances for leadership
2. Data Handling Explainer
   - What happens to client data (step by step)
   - What data is/isn't sent to AI systems
   - Retention and deletion policies
3. Security Controls Summary
   - Technical safeguards in accessible language
   - Compliance with industry standards
4. Compliance Alignment Matrix
   - How capabilities map to common frameworks
   - Specific regulatory considerations for their industry
5. FAQ Document
   - 10-15 anticipated questions with clear answers
   - Technical and non-technical versions
6. Talking Points
   - Key messages for different stakeholder conversations
   - Objection handling scripts
7. Risk Mitigation Summary
   - How each concern is specifically addressed
   - Residual risks and how they're managed
8. Next Steps Recommendations
   - What additional information you can provide
   - Suggested path forward for engagement

Use markdown formatting. Make it professional and ready to share.`,

    userPrompt: createUserPrompt(inputs, [
      'clientIndustry',
      'clientRiskPosture',
      'mainObjections',
      'yourAICapabilities',
      'dataHandlingPractices',
      'complianceCertifications',
    ]),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL AI GOVERNANCE SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const AI_GOVERNANCE_SKILLS: Record<string, SkillDefinition> = {
  'ai-governance-readiness-assessment': AI_GOVERNANCE_ASSESSMENT_SKILL,
  'secure-ai-usage-playbook': SECURE_AI_PLAYBOOK_SKILL,
  'ai-data-flow-risk-map': AI_DATA_FLOW_RISK_MAP_SKILL,
  'ai-governance-client-brief': AI_GOVERNANCE_CLIENT_BRIEF_SKILL,
};

export const AI_GOVERNANCE_SKILLS_LIST: SkillDefinition[] = Object.values(AI_GOVERNANCE_SKILLS);
