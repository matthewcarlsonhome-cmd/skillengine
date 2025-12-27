/**
 * Enterprise Skills Module
 *
 * Contains 4 enterprise communication and operations skills:
 * - Executive Communication Pack
 * - Steering Committee Pack
 * - Contract Review Accelerator
 * - Automation Opportunity Assessment
 */

import { Skill } from '../../../types';
import {
  PresentationIcon,
  UsersIcon,
  FileContractIcon,
  CpuIcon,
} from '../../../components/icons';
import { createUserPrompt } from '../shared';

export const ENTERPRISE_SKILLS: Record<string, Skill> = {
  'executive-communication-pack': {
    id: 'executive-communication-pack',
    name: 'Executive Communication Pack',
    description: 'Transform technical or detailed content into executive-ready communications including summaries, talking points, and Q&A.',
    longDescription: 'This skill takes complex information and creates a complete executive communication package. Includes executive summary, key messages, anticipated questions with answers, and stakeholder-specific talking points.',
    whatYouGet: ['Executive Summary', 'Key Messages', 'Talking Points', 'Q&A Document', 'Stakeholder Communications'],
    theme: { primary: 'text-indigo-400', secondary: 'bg-indigo-900/20', gradient: 'from-indigo-500/20 to-transparent' },
    icon: PresentationIcon,
    inputs: [
      { id: 'sourceContent', label: 'Source Content', type: 'textarea', placeholder: 'Paste the detailed content to summarize...', required: true, rows: 12 },
      { id: 'communicationPurpose', label: 'Communication Purpose', type: 'select', options: ['Status Update', 'Decision Request', 'Risk Escalation', 'Achievement Announcement', 'Change Communication', 'Budget/Resource Request'], required: true },
      { id: 'targetAudience', label: 'Target Audience', type: 'select', options: ['Board of Directors', 'C-Suite', 'Department Heads', 'Cross-functional Leadership', 'External Stakeholders'], required: true },
      { id: 'keyMessage', label: 'Core Message', type: 'textarea', placeholder: 'What is the ONE thing you need them to understand/decide/approve?', required: true, rows: 3 },
      { id: 'sensitiveTopics', label: 'Sensitive Topics (Optional)', type: 'textarea', placeholder: 'Any areas requiring careful messaging?', rows: 3 },
    ],
    generatePrompt: (inputs) => ({
      systemInstruction: `You are an executive communications specialist who transforms complex content into clear, actionable executive communications. Your output should:

1. LEAD with the bottom line (what, so what, now what)
2. USE executive-appropriate language (concise, decisive)
3. ANTICIPATE questions and objections
4. PROVIDE talking points for different scenarios
5. INCLUDE the "ask" clearly if there is one

OUTPUT STRUCTURE:
1. Executive Summary (1 paragraph, bottom-line up front)
2. Key Messages (3-5 bullet points)
3. Supporting Details
   - Organized by importance
   - Data points that matter
4. Talking Points
   - For different stakeholders
   - For different scenarios
5. Anticipated Q&A
   - Likely questions
   - Recommended responses
6. The Ask (if applicable)
   - What you need
   - By when
   - From whom

Use professional, concise language. Avoid jargon unless industry-standard.`,
      userPrompt: createUserPrompt("Executive Communication", inputs, {
        sourceContent: "Source Content",
        communicationPurpose: "Communication Purpose",
        targetAudience: "Target Audience",
        keyMessage: "Core Message",
        sensitiveTopics: "Sensitive Topics"
      })
    }),
  },

  'steering-committee-pack': {
    id: 'steering-committee-pack',
    name: 'Steering Committee Pack Builder',
    description: 'Create comprehensive steering committee materials including status reports, decision logs, and escalation briefs.',
    longDescription: 'This skill generates professional steering committee documentation. Includes status dashboards, RAID log updates, decision requests, and action item tracking. Perfect for program managers and project sponsors.',
    whatYouGet: ['Status Dashboard', 'RAID Log Update', 'Decision Requests', 'Action Items', 'Next Steps'],
    theme: { primary: 'text-cyan-400', secondary: 'bg-cyan-900/20', gradient: 'from-cyan-500/20 to-transparent' },
    icon: UsersIcon,
    inputs: [
      { id: 'programName', label: 'Program/Project Name', type: 'text', placeholder: 'e.g., Digital Transformation Initiative', required: true },
      { id: 'reportingPeriod', label: 'Reporting Period', type: 'text', placeholder: 'e.g., Week of Dec 9, 2024', required: true },
      { id: 'currentStatus', label: 'Current Status & Progress', type: 'textarea', placeholder: 'Overall status, key accomplishments, progress against milestones...', required: true, rows: 8 },
      { id: 'raidItems', label: 'RAID Items (Risks, Actions, Issues, Decisions)', type: 'textarea', placeholder: 'List current risks, open actions, issues, and pending decisions...', required: true, rows: 8 },
      { id: 'decisionsNeeded', label: 'Decisions Needed', type: 'textarea', placeholder: 'What decisions do you need from the steering committee?', rows: 4 },
      { id: 'escalations', label: 'Escalations (Optional)', type: 'textarea', placeholder: 'Any items requiring escalation or intervention?', rows: 3 },
    ],
    generatePrompt: (inputs) => ({
      systemInstruction: `You are a senior program manager who creates professional steering committee materials. Your pack should:

1. LEAD with overall status (Red/Amber/Green)
2. HIGHLIGHT what needs attention
3. CLEARLY state decisions needed
4. TRACK actions with owners and dates
5. KEEP it scannable (executives skim)

OUTPUT STRUCTURE:
1. Executive Dashboard
   - Overall Status (RAG)
   - Key Metrics
   - Timeline Status
2. Accomplishments This Period
   - Completed milestones
   - Key deliverables
3. RAID Log Update
   - Risks (with mitigation status)
   - Actions (with owners/dates)
   - Issues (with resolution path)
   - Decisions (needed/made)
4. Decision Requests
   - Decision needed
   - Options/recommendation
   - Impact if delayed
5. Escalations
   - Issue description
   - Support needed
6. Next Period Focus
   - Key activities
   - Milestones coming up

Use tables, RAG status colors, and clear formatting.`,
      userPrompt: createUserPrompt("Steering Committee Pack", inputs, {
        programName: "Program Name",
        reportingPeriod: "Reporting Period",
        currentStatus: "Current Status",
        raidItems: "RAID Items",
        decisionsNeeded: "Decisions Needed",
        escalations: "Escalations"
      })
    }),
  },

  'contract-review-accelerator': {
    id: 'contract-review-accelerator',
    name: 'Contract Review Accelerator',
    description: 'Accelerate contract review by identifying key terms, risks, and negotiation points in legal agreements.',
    longDescription: 'This skill analyzes contracts to identify critical terms, flag potential risks, highlight areas for negotiation, and summarize key obligations. Not legal advice, but accelerates initial review for business teams.',
    whatYouGet: ['Key Terms Summary', 'Risk Flags', 'Negotiation Points', 'Obligation Summary', 'Questions for Legal'],
    theme: { primary: 'text-amber-400', secondary: 'bg-amber-900/20', gradient: 'from-amber-500/20 to-transparent' },
    icon: FileContractIcon,
    inputs: [
      { id: 'contractText', label: 'Contract Text', type: 'textarea', placeholder: 'Paste the contract text or key sections...', required: true, rows: 15 },
      { id: 'contractType', label: 'Contract Type', type: 'select', options: ['SaaS/Software Agreement', 'Master Service Agreement', 'NDA/Confidentiality', 'Vendor/Supplier Agreement', 'Employment/Consulting', 'Lease/Real Estate', 'Partnership/JV', 'Other'], required: true },
      { id: 'yourPosition', label: 'Your Position', type: 'select', options: ['Buyer/Customer', 'Seller/Vendor', 'Partner (Mutual)'], required: true },
      { id: 'keyConcerns', label: 'Key Concerns', type: 'textarea', placeholder: 'What are you most concerned about in this contract?', required: true, rows: 3 },
      { id: 'industryContext', label: 'Industry Context (Optional)', type: 'textarea', placeholder: 'Industry-specific considerations, regulatory requirements...', rows: 3 },
    ],
    generatePrompt: (inputs) => ({
      systemInstruction: `You are a contract analyst who helps business teams understand agreements before legal review. Your analysis should:

1. IDENTIFY key terms and obligations clearly
2. FLAG potential risks (without practicing law)
3. HIGHLIGHT negotiation opportunities
4. SUMMARIZE in business language
5. GENERATE questions for legal counsel

IMPORTANT DISCLAIMER:
This is NOT legal advice. This analysis is for initial business review only. All contracts should be reviewed by qualified legal counsel before signing.

OUTPUT STRUCTURE:
1. Contract Overview
   - Type, parties, term, value
   - Purpose in plain language
2. Key Terms Summary
   - Payment terms
   - Deliverables/scope
   - Term and termination
   - Key dates
3. Risk Flags
   - Potential concerns (with section references)
   - Unusual terms
   - One-sided provisions
4. Negotiation Opportunities
   - Terms that are typically negotiable
   - Standard market alternatives
5. Obligations Summary
   - What you must do
   - What they must do
   - Key deadlines
6. Questions for Legal Counsel
   - Specific areas to review
   - Clarifications needed

Include section references where possible.`,
      userPrompt: createUserPrompt("Contract Review", inputs, {
        contractText: "Contract Text",
        contractType: "Contract Type",
        yourPosition: "Your Position",
        keyConcerns: "Key Concerns",
        industryContext: "Industry Context"
      })
    }),
  },

  'automation-opportunity-assessment': {
    id: 'automation-opportunity-assessment',
    name: 'Automation Opportunity Assessment',
    description: 'Identify and prioritize automation opportunities in your processes with ROI analysis and implementation roadmap.',
    longDescription: 'This skill analyzes your current processes to identify automation opportunities. It evaluates complexity, estimates ROI, and provides an implementation roadmap. Perfect for digital transformation initiatives.',
    whatYouGet: ['Opportunity Inventory', 'ROI Analysis', 'Complexity Assessment', 'Implementation Roadmap', 'Quick Wins List'],
    theme: { primary: 'text-violet-400', secondary: 'bg-violet-900/20', gradient: 'from-violet-500/20 to-transparent' },
    icon: CpuIcon,
    inputs: [
      { id: 'processDescription', label: 'Process Description', type: 'textarea', placeholder: 'Describe the process(es) to analyze for automation...', required: true, rows: 8 },
      { id: 'currentMetrics', label: 'Current Metrics', type: 'textarea', placeholder: 'Volume, frequency, time spent, error rates, FTE involved...', required: true, rows: 5 },
      { id: 'painPoints', label: 'Pain Points', type: 'textarea', placeholder: 'What problems are you trying to solve? Bottlenecks, errors, delays...', required: true, rows: 4 },
      { id: 'technologyLandscape', label: 'Technology Landscape', type: 'textarea', placeholder: 'What systems are involved? Integration capabilities, existing automation tools...', required: true, rows: 4 },
      { id: 'constraints', label: 'Constraints (Optional)', type: 'textarea', placeholder: 'Budget limits, compliance requirements, technology restrictions...', rows: 3 },
    ],
    generatePrompt: (inputs) => ({
      systemInstruction: `You are an automation and process improvement expert who identifies and prioritizes automation opportunities. Your assessment should:

1. IDENTIFY concrete automation opportunities
2. ESTIMATE ROI with reasonable assumptions
3. ASSESS complexity and risk
4. PRIORITIZE by value and feasibility
5. PROVIDE actionable implementation guidance

OUTPUT STRUCTURE:
1. Executive Summary
   - Total automation potential
   - Top 3 opportunities
   - Recommended approach
2. Opportunity Inventory
   | Process Area | Automation Type | Current State | Future State | Effort | Value |
3. ROI Analysis
   - Cost savings estimates
   - Time savings
   - Error reduction
   - Payback period
4. Complexity Assessment
   - Technical complexity
   - Change management
   - Integration requirements
5. Implementation Roadmap
   - Quick wins (0-3 months)
   - Medium-term (3-6 months)
   - Strategic (6-12 months)
6. Technology Recommendations
   - RPA, AI/ML, workflow automation
   - Build vs buy considerations
7. Risk & Dependencies

Use tables and clear prioritization frameworks.`,
      userPrompt: createUserPrompt("Automation Assessment", inputs, {
        processDescription: "Process Description",
        currentMetrics: "Current Metrics",
        painPoints: "Pain Points",
        technologyLandscape: "Technology Landscape",
        constraints: "Constraints"
      })
    }),
  },
};
