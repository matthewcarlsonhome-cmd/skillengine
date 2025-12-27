/**
 * AI Governance & Compliance Skills Module
 */
export { GOVERNANCE_SKILLS } from './skills';

export const GOVERNANCE_SKILL_IDS = [
  'ai-governance-readiness-assessment',
  'secure-ai-usage-playbook',
  'ai-data-flow-risk-map',
  'ai-governance-client-brief',
  'compliance-audit-prep-assistant',
  'policy-document-generator',
  'incident-postmortem-generator',
  'change-request-doc-builder',
] as const;

export type GovernanceSkillId = typeof GOVERNANCE_SKILL_IDS[number];
