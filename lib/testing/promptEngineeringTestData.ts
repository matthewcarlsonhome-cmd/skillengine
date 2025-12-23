/**
 * Prompt Engineering Skills - Test Data
 *
 * Comprehensive test cases for the 6 prompt engineering skills:
 * 1. Prompt Intake Analyzer
 * 2. Multi-Tier Prompt Architect
 * 3. Verification Mechanism Builder
 * 4. Research-Grounded Prompt Builder
 * 5. Prompt Critique & Optimizer
 * 6. Production Prompt Generator
 *
 * Each skill has multiple test cases covering different scenarios.
 */

import type { SkillDefaultTestData } from './defaultTestData';

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE DATA TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const SAMPLE_ROUGH_IDEA_RESEARCH = `I need a prompt that helps me research market trends for a new product launch.
The AI should look at competitor analysis, customer sentiment, and industry reports.
It needs to be thorough but not overwhelming. Something I can use to make actual business decisions.`;

const SAMPLE_ROUGH_IDEA_CODE = `I want the AI to review my code and give me feedback.
It should check for bugs, security issues, and performance problems.
I need it to be helpful but not nitpicky about style stuff unless it matters.`;

const SAMPLE_ROUGH_IDEA_CONTENT = `Create something that helps me write better blog posts about technology topics.
I want it to help with research, outline creation, and making the content engaging.
It should sound professional but not boring.`;

const SAMPLE_EXISTING_PROMPT_BASIC = `You are a helpful assistant.

Analyze the code I provide and tell me if there are any problems.
Give me suggestions for improvement.
Be thorough but concise.

Here is my code:
[CODE]`;

const SAMPLE_EXISTING_PROMPT_MEDIUM = `You are an expert software engineer with 10 years of experience.

Review the following code for:
- Bugs and logical errors
- Security vulnerabilities
- Performance issues
- Code quality and maintainability

Provide your analysis in a structured format with:
1. Executive Summary
2. Critical Issues
3. Recommendations
4. Overall Assessment

Code to review:
[INSERT CODE HERE]`;

const SAMPLE_EXISTING_PROMPT_COMPLEX = `<role>
You are a Senior Code Review Specialist with expertise in security analysis.
</role>

<instructions>
Analyze the provided code for security vulnerabilities, performance issues, and code quality.
Focus on OWASP Top 10 vulnerabilities.
Provide actionable recommendations.
</instructions>

<output_format>
Structure your response as:
- Summary
- Findings (with severity)
- Recommendations
</output_format>

<code>
[USER CODE]
</code>`;

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT INTAKE ANALYZER - TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const PROMPT_INTAKE_ANALYZER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'prompt-engineer-prompt-intake-analyzer': {
    skillId: 'prompt-engineer-prompt-intake-analyzer',
    defaultTestCaseId: 'intake-research-1',
    description: 'Market research prompt idea - business context',
    inputPayload: {
      roughIdea: SAMPLE_ROUGH_IDEA_RESEARCH,
      intendedUse: 'Research & Analysis',
      targetAI: 'Claude (Anthropic)',
      additionalContext: 'This is for a B2B SaaS product in the HR tech space. We need to present findings to the executive team. Timeline is 2 weeks.',
    },
  },
  'prompt-intake-analyzer-code': {
    skillId: 'prompt-engineer-prompt-intake-analyzer',
    defaultTestCaseId: 'intake-code-1',
    description: 'Code review prompt idea - technical context',
    inputPayload: {
      roughIdea: SAMPLE_ROUGH_IDEA_CODE,
      intendedUse: 'Code Generation',
      targetAI: 'GPT-4 (OpenAI)',
      additionalContext: 'Primarily Python and TypeScript code. Enterprise environment with strict security requirements.',
    },
  },
  'prompt-intake-analyzer-content': {
    skillId: 'prompt-engineer-prompt-intake-analyzer',
    defaultTestCaseId: 'intake-content-1',
    description: 'Content creation prompt idea - creative context',
    inputPayload: {
      roughIdea: SAMPLE_ROUGH_IDEA_CONTENT,
      intendedUse: 'Content Creation',
      targetAI: 'General Purpose (Any)',
      additionalContext: 'Writing for a developer audience. Posts are typically 1500-2000 words. SEO is important.',
    },
  },
  'prompt-intake-analyzer-vague': {
    skillId: 'prompt-engineer-prompt-intake-analyzer',
    defaultTestCaseId: 'intake-vague-1',
    description: 'Very vague idea requiring extensive clarification',
    inputPayload: {
      roughIdea: 'I want the AI to help me with my work stuff. It should be smart and useful.',
      intendedUse: 'Other',
      targetAI: 'General Purpose (Any)',
      additionalContext: '',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-TIER PROMPT ARCHITECT - TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const MULTI_TIER_PROMPT_ARCHITECT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'prompt-engineer-multi-tier-prompt-architect': {
    skillId: 'prompt-engineer-multi-tier-prompt-architect',
    defaultTestCaseId: 'architect-analysis-1',
    description: 'Financial analysis prompt - enterprise tier',
    inputPayload: {
      objective: 'Analyze quarterly financial reports to identify trends, risks, and opportunities. Compare performance against industry benchmarks and provide actionable recommendations for the executive team.',
      roleExpertise: 'A Chief Financial Analyst with 20+ years at Fortune 500 companies including Goldman Sachs and McKinsey. MBA from Wharton, CFA certified. Expert in financial modeling, risk assessment, and strategic planning.',
      constraints: `ACCURACY: All financial figures must be verified. Cite sources for benchmarks.
OBJECTIVITY: Present both bullish and bearish interpretations.
SCOPE: Focus on Q4 2024 data. Do not speculate on future quarters without clear basis.
FORMAT: Executive-friendly language. Avoid excessive jargon.
COMPLIANCE: Ensure all analysis complies with SEC reporting standards.`,
      outputFormat: 'Detailed Report (structured sections)',
      verificationLevel: 'Maximum (all claims sourced, citations required)',
      additionalRequirements: 'Include SWOT analysis. Compare to top 3 competitors. Flag any potential audit concerns.',
    },
  },
  'multi-tier-architect-code-review': {
    skillId: 'prompt-engineer-multi-tier-prompt-architect',
    defaultTestCaseId: 'architect-code-1',
    description: 'Security-focused code review prompt',
    inputPayload: {
      objective: 'Perform comprehensive security review of authentication and authorization code. Identify vulnerabilities, assess severity, and provide remediation guidance.',
      roleExpertise: 'Application Security Engineer with 15+ years specializing in OWASP vulnerabilities, penetration testing, and secure coding practices. CISSP and OSCP certified. Former security lead at major tech companies.',
      constraints: `SECURITY: Apply OWASP Top 10 (2021) checklist to all findings.
SEVERITY: Use CVSS v3.1 scoring for vulnerability severity.
SCOPE: Focus on authentication, authorization, and session management.
CONFIDENTIALITY: Do not suggest disclosing vulnerabilities publicly.
ACTIONABILITY: Every finding must have a specific remediation step.`,
      outputFormat: 'Step-by-Step Guide (actionable instructions)',
      verificationLevel: 'High (key claims verified, sources noted)',
      additionalRequirements: 'Include CWE identifiers for each vulnerability type. Prioritize findings by exploitability.',
    },
  },
  'multi-tier-architect-creative': {
    skillId: 'prompt-engineer-multi-tier-prompt-architect',
    defaultTestCaseId: 'architect-creative-1',
    description: 'Creative writing assistant prompt',
    inputPayload: {
      objective: 'Help users develop compelling science fiction short stories with rich world-building, complex characters, and thought-provoking themes.',
      roleExpertise: 'Award-winning science fiction author and writing instructor. Published 12 novels, won Hugo and Nebula awards. MFA in Creative Writing. Former editor at major SF magazine. Expert in speculative world-building.',
      constraints: `ORIGINALITY: Avoid clichés and tropes unless deliberately subverted.
VOICE: Preserve the user\'s unique voice; enhance, don\'t replace.
SENSITIVITY: Handle social themes thoughtfully without being preachy.
LENGTH: Short stories should be 3,000-7,500 words unless specified.
FEEDBACK: Be encouraging but honest about areas for improvement.`,
      outputFormat: 'Creative Content (narrative/prose)',
      verificationLevel: 'Creative (originality over verification)',
      additionalRequirements: 'Apply the "Show, don\'t tell" principle. Include sensory details. Develop character arcs even in short form.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION MECHANISM BUILDER - TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const VERIFICATION_MECHANISM_BUILDER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'prompt-engineer-verification-mechanism-builder': {
    skillId: 'prompt-engineer-verification-mechanism-builder',
    defaultTestCaseId: 'verification-high-1',
    description: 'High-stakes medical information prompt',
    inputPayload: {
      existingPrompt: `You are a medical information assistant. Help users understand their health conditions and treatment options.

When a user asks about a medical topic:
1. Explain the condition in simple terms
2. Describe common treatments
3. Mention when to see a doctor

Always remind users to consult healthcare professionals for personalized advice.`,
      verificationPriority: 'Factual Accuracy (citations, sources)',
      riskLevel: 'High Stakes (medical, legal, financial)',
      specificConcerns: 'Ensure no information could be misinterpreted as personal medical advice. All statistics should be from peer-reviewed sources within the last 5 years. Drug information must match current FDA guidelines.',
    },
  },
  'verification-builder-research': {
    skillId: 'prompt-engineer-verification-mechanism-builder',
    defaultTestCaseId: 'verification-research-1',
    description: 'Research analysis prompt needing objectivity checks',
    inputPayload: {
      existingPrompt: `Analyze the provided research papers and summarize the key findings.

Compare methodologies across studies.
Identify consensus and disagreements in the literature.
Suggest areas for further research.

Present findings in an academic style.`,
      verificationPriority: 'Objectivity (bias detection)',
      riskLevel: 'Professional (business decisions)',
      specificConcerns: 'Check for cherry-picking of sources. Ensure controversial findings are presented with appropriate caveats. Verify that conclusions are supported by the cited evidence.',
    },
  },
  'verification-builder-code': {
    skillId: 'prompt-engineer-verification-mechanism-builder',
    defaultTestCaseId: 'verification-code-1',
    description: 'Code generation prompt needing completeness checks',
    inputPayload: {
      existingPrompt: SAMPLE_EXISTING_PROMPT_MEDIUM,
      verificationPriority: 'Completeness (all aspects covered)',
      riskLevel: 'Professional (business decisions)',
      specificConcerns: 'Ensure all edge cases are considered. Verify error handling is comprehensive. Check that security implications are always addressed.',
    },
  },
  'verification-builder-balanced': {
    skillId: 'prompt-engineer-verification-mechanism-builder',
    defaultTestCaseId: 'verification-balanced-1',
    description: 'Business analysis prompt needing balanced verification',
    inputPayload: {
      existingPrompt: `You are a business analyst helping with market research.

Analyze the market opportunity for the proposed product.
Include competitor analysis, market size, and growth projections.
Provide recommendations for go-to-market strategy.`,
      verificationPriority: 'Balanced (all dimensions)',
      riskLevel: 'Professional (business decisions)',
      specificConcerns: 'Market size estimates should cite sources. Competitor information should be current (2024). Recommendations should acknowledge uncertainty.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// RESEARCH-GROUNDED PROMPT BUILDER - TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const RESEARCH_GROUNDED_PROMPT_BUILDER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'prompt-engineer-research-grounded-prompt-builder': {
    skillId: 'prompt-engineer-research-grounded-prompt-builder',
    defaultTestCaseId: 'research-ai-ethics-1',
    description: 'AI ethics analysis prompt requiring current research',
    inputPayload: {
      promptTopic: 'AI ethics and responsible AI development, specifically around bias in large language models and mitigation strategies',
      promptPurpose: 'Expert Analysis/Research',
      researchFocus: 'Recent Developments (2023-2024)',
      knownConstraints: 'Must cover both technical and policy perspectives. Should be accessible to non-technical executives. Need to address EU AI Act implications.',
    },
  },
  'research-builder-devops': {
    skillId: 'prompt-engineer-research-grounded-prompt-builder',
    defaultTestCaseId: 'research-devops-1',
    description: 'DevOps best practices prompt',
    inputPayload: {
      promptTopic: 'Modern DevOps practices for Kubernetes deployments, including GitOps, progressive delivery, and observability',
      promptPurpose: 'Code/Technical Generation',
      researchFocus: 'Best Practices & Standards',
      knownConstraints: 'Environment is AWS EKS. Team size is 5 engineers. Must support SOC2 compliance requirements.',
    },
  },
  'research-builder-content-strategy': {
    skillId: 'prompt-engineer-research-grounded-prompt-builder',
    defaultTestCaseId: 'research-content-1',
    description: 'Content marketing strategy prompt',
    inputPayload: {
      promptTopic: 'B2B content marketing strategy for technical products, focusing on developer audience engagement',
      promptPurpose: 'Content Creation',
      researchFocus: 'Frameworks & Methodologies',
      knownConstraints: 'Target audience is senior engineers and CTOs. Content will be used across blog, LinkedIn, and developer communities.',
    },
  },
  'research-builder-pitfalls': {
    skillId: 'prompt-engineer-research-grounded-prompt-builder',
    defaultTestCaseId: 'research-pitfalls-1',
    description: 'Prompt focused on avoiding common mistakes',
    inputPayload: {
      promptTopic: 'Microservices architecture design and implementation for startups transitioning from monolith',
      promptPurpose: 'Decision Support',
      researchFocus: 'Common Mistakes & Pitfalls',
      knownConstraints: 'Team has limited distributed systems experience. Budget constraints require pragmatic solutions.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT CRITIQUE & OPTIMIZER - TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const PROMPT_CRITIQUE_OPTIMIZER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'prompt-engineer-prompt-critique-optimizer': {
    skillId: 'prompt-engineer-prompt-critique-optimizer',
    defaultTestCaseId: 'critique-basic-1',
    description: 'Basic prompt needing significant improvement',
    inputPayload: {
      promptToCritique: SAMPLE_EXISTING_PROMPT_BASIC,
      knownIssues: 'Outputs are inconsistent. Sometimes too brief, sometimes too verbose. Often misses security issues.',
      optimizationGoal: 'Comprehensive Optimization (All)',
      targetAI: 'Claude (Anthropic)',
    },
  },
  'critique-optimizer-medium': {
    skillId: 'prompt-engineer-prompt-critique-optimizer',
    defaultTestCaseId: 'critique-medium-1',
    description: 'Medium-quality prompt needing refinement',
    inputPayload: {
      promptToCritique: SAMPLE_EXISTING_PROMPT_MEDIUM,
      knownIssues: 'Good structure but outputs lack depth. Security analysis is surface-level. Recommendations are generic.',
      optimizationGoal: 'Improve Output Quality',
      targetAI: 'GPT-4 (OpenAI)',
    },
  },
  'critique-optimizer-complex': {
    skillId: 'prompt-engineer-prompt-critique-optimizer',
    defaultTestCaseId: 'critique-complex-1',
    description: 'Complex prompt with XML structure needing fine-tuning',
    inputPayload: {
      promptToCritique: SAMPLE_EXISTING_PROMPT_COMPLEX,
      knownIssues: 'Outputs are good but inconsistent in format. Sometimes skips severity ratings. Verification is weak.',
      optimizationGoal: 'Increase Consistency/Reliability',
      targetAI: 'Claude (Anthropic)',
    },
  },
  'critique-optimizer-verification': {
    skillId: 'prompt-engineer-prompt-critique-optimizer',
    defaultTestCaseId: 'critique-verification-1',
    description: 'Prompt specifically needing better verification',
    inputPayload: {
      promptToCritique: `You are a research analyst. Analyze the market data provided and give me insights about trends and opportunities.

Consider:
- Historical trends
- Competitive landscape
- Growth projections

Provide a comprehensive report with your findings and recommendations.`,
      knownIssues: 'Outputs make claims without sources. Projections are presented as facts. No confidence levels.',
      optimizationGoal: 'Stronger Verification/Accuracy',
      targetAI: 'General Purpose (Any)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTION PROMPT GENERATOR - TEST DATA
// ═══════════════════════════════════════════════════════════════════════════

export const PRODUCTION_PROMPT_GENERATOR_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'prompt-engineer-production-prompt-generator': {
    skillId: 'prompt-engineer-production-prompt-generator',
    defaultTestCaseId: 'production-enterprise-1',
    description: 'Enterprise-grade financial analysis prompt',
    inputPayload: {
      roughIdea: 'I need something that can analyze our quarterly financial data and compare it to competitors. It should identify risks, opportunities, and give strategic recommendations. This will be used by our CFO and board.',
      useCase: 'Research & Analysis',
      qualityLevel: 'Enterprise (maximum rigor, full verification)',
      targetAI: 'Claude (Anthropic) - Best for nuanced tasks',
      specialRequirements: 'Must comply with SEC disclosure requirements. Should include confidence levels for projections. Compare against S&P 500 benchmarks.',
    },
  },
  'production-generator-professional': {
    skillId: 'prompt-engineer-production-prompt-generator',
    defaultTestCaseId: 'production-professional-1',
    description: 'Professional code review prompt',
    inputPayload: {
      roughIdea: 'A thorough code review assistant that checks for bugs, security issues, and gives me actionable feedback. Should work with Python and TypeScript. Needs to be detailed but not overwhelming.',
      useCase: 'Code Generation',
      qualityLevel: 'Professional (high quality, standard verification)',
      targetAI: 'GPT-4 (OpenAI) - Best for broad knowledge',
      specialRequirements: 'Apply OWASP Top 10 for security. Use severity ratings. Include code examples for fixes.',
    },
  },
  'production-generator-standard': {
    skillId: 'prompt-engineer-production-prompt-generator',
    defaultTestCaseId: 'production-standard-1',
    description: 'Standard content writing prompt',
    inputPayload: {
      roughIdea: 'Help me write better technical blog posts. Should help with research, outlining, and making content engaging. Target audience is software developers.',
      useCase: 'Content Creation',
      qualityLevel: 'Standard (good quality, basic checks)',
      targetAI: 'Any/Universal - Cross-platform compatible',
      specialRequirements: 'SEO optimization. Include code examples. 1500-2500 word target length.',
    },
  },
  'production-generator-rapid': {
    skillId: 'prompt-engineer-production-prompt-generator',
    defaultTestCaseId: 'production-rapid-1',
    description: 'Rapid prototyping prompt',
    inputPayload: {
      roughIdea: 'Quick brainstorming helper for product feature ideas. Just need fast, creative suggestions without lots of overhead.',
      useCase: 'Decision Support',
      qualityLevel: 'Rapid (functional, minimal overhead)',
      targetAI: 'Gemini (Google) - Best for multimodal',
      specialRequirements: 'Keep it lightweight. Quantity over polish. Easy to iterate.',
    },
  },
  'production-generator-data': {
    skillId: 'prompt-engineer-production-prompt-generator',
    defaultTestCaseId: 'production-data-1',
    description: 'Data analysis workflow prompt',
    inputPayload: {
      roughIdea: 'Analyze datasets and find patterns, anomalies, and insights. Should explain findings clearly for non-technical stakeholders. Generate visualizations recommendations.',
      useCase: 'Data Analysis',
      qualityLevel: 'Professional (high quality, standard verification)',
      targetAI: 'Claude (Anthropic) - Best for nuanced tasks',
      specialRequirements: 'Statistical rigor required. Explain methodology. Include confidence intervals where applicable.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const PROMPT_ENGINEERING_DEFAULT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  ...PROMPT_INTAKE_ANALYZER_TEST_DATA,
  ...MULTI_TIER_PROMPT_ARCHITECT_TEST_DATA,
  ...VERIFICATION_MECHANISM_BUILDER_TEST_DATA,
  ...RESEARCH_GROUNDED_PROMPT_BUILDER_TEST_DATA,
  ...PROMPT_CRITIQUE_OPTIMIZER_TEST_DATA,
  ...PRODUCTION_PROMPT_GENERATOR_TEST_DATA,
};

// Default test case for each skill (maps skill ID to test data key)
export const PROMPT_ENGINEERING_SKILL_DEFAULTS: Record<string, string> = {
  'prompt-engineer-prompt-intake-analyzer': 'prompt-engineer-prompt-intake-analyzer',
  'prompt-engineer-multi-tier-prompt-architect': 'prompt-engineer-multi-tier-prompt-architect',
  'prompt-engineer-verification-mechanism-builder': 'prompt-engineer-verification-mechanism-builder',
  'prompt-engineer-research-grounded-prompt-builder': 'prompt-engineer-research-grounded-prompt-builder',
  'prompt-engineer-prompt-critique-optimizer': 'prompt-engineer-prompt-critique-optimizer',
  'prompt-engineer-production-prompt-generator': 'prompt-engineer-production-prompt-generator',
};

export default PROMPT_ENGINEERING_DEFAULT_TEST_DATA;
