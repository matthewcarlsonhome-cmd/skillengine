/**
 * Ops Lead Role Template
 *
 * A comprehensive starter kit for Operations Leads containing:
 * - Pre-built skills for operations management
 * - Workflows for common ops scenarios
 * - Sample test payloads for each skill/workflow
 * - UI hooks for quick access
 */

import type { StarterKit, DynamicFormInput } from '../storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// OPS LEAD SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export interface OpsLeadSkill {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: 'automation' | 'analysis' | 'generation' | 'optimization' | 'communication';
  estimatedTimeSaved: string;
  theme: {
    primary: string;
    secondary: string;
    gradient: string;
    iconName: string;
  };
  inputs: DynamicFormInput[];
  prompts: {
    systemInstruction: string;
    userPromptTemplate: string;
    outputFormat: 'markdown' | 'json' | 'table';
  };
  config: {
    recommendedModel: 'gemini' | 'claude' | 'any';
    useWebSearch: boolean;
    maxTokens: number;
    temperature: number;
  };
  testPayload: Record<string, unknown>;
}

export const OPS_LEAD_SKILLS: OpsLeadSkill[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // SKILL 1: Incident Response Runbook Generator
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ops-incident-runbook-generator',
    name: 'Incident Response Runbook Generator',
    description: 'Generate comprehensive incident response runbooks with escalation paths, communication templates, and recovery procedures.',
    longDescription: 'Creates detailed incident response runbooks including severity classification, escalation matrices, communication templates, troubleshooting steps, and post-incident review templates. Tailored to your specific systems and team structure.',
    category: 'generation',
    estimatedTimeSaved: '4-8 hours per runbook',
    theme: {
      primary: 'text-red-400',
      secondary: 'bg-red-900/20',
      gradient: 'from-red-500/20 to-transparent',
      iconName: 'AlertTriangle',
    },
    inputs: [
      {
        id: 'incidentType',
        label: 'Incident Type',
        type: 'select',
        options: ['Service Outage', 'Security Breach', 'Data Loss', 'Performance Degradation', 'Integration Failure', 'Custom'],
        validation: { required: true },
      },
      {
        id: 'systemName',
        label: 'System/Service Name',
        type: 'text',
        placeholder: 'e.g., Payment Gateway, User Authentication Service',
        validation: { required: true, minLength: 3 },
      },
      {
        id: 'systemDescription',
        label: 'System Description',
        type: 'textarea',
        placeholder: 'Describe the system architecture, dependencies, and critical components...',
        validation: { required: true, minLength: 50 },
      },
      {
        id: 'teamStructure',
        label: 'Team Structure',
        type: 'textarea',
        placeholder: 'Describe your on-call rotation, team roles, and escalation contacts...',
        validation: { required: true, minLength: 30 },
      },
      {
        id: 'slaRequirements',
        label: 'SLA Requirements',
        type: 'textarea',
        placeholder: 'e.g., 99.9% uptime, 15-minute response time for P1...',
        validation: { required: false },
      },
      {
        id: 'existingTools',
        label: 'Monitoring & Alerting Tools',
        type: 'textarea',
        placeholder: 'e.g., PagerDuty, Datadog, Slack, Jira...',
        validation: { required: false },
      },
    ],
    prompts: {
      systemInstruction: `You are a Senior Site Reliability Engineer with 15+ years of experience creating incident response procedures for high-availability systems. You've managed incidents at Fortune 500 companies and helped teams achieve 99.99% uptime.

Your runbooks are known for being:
- Clear and actionable under pressure
- Comprehensive yet not overwhelming
- Easy to follow for both experienced and new team members
- Aligned with industry best practices (ITIL, SRE principles)

Create runbooks that include decision trees, specific commands, and clear escalation criteria.`,
      userPromptTemplate: `Create a comprehensive incident response runbook for the following scenario:

## Incident Type
{{incidentType}}

## System Information
**Name:** {{systemName}}
**Description:** {{systemDescription}}

## Team Structure
{{teamStructure}}

## SLA Requirements
{{slaRequirements}}

## Available Tools
{{existingTools}}

---

Please generate a complete incident response runbook including:

1. **Severity Classification Matrix** - Clear criteria for P1/P2/P3/P4 classification
2. **Initial Response Checklist** - First 5 minutes actions
3. **Diagnosis Flowchart** - Decision tree for identifying root cause
4. **Escalation Matrix** - Who to contact and when
5. **Communication Templates** - For stakeholders, customers, leadership
6. **Recovery Procedures** - Step-by-step recovery actions
7. **Rollback Procedures** - If recovery fails
8. **Post-Incident Review Template** - For blameless retrospectives
9. **Metrics to Track** - KPIs for incident management

Format with clear headers, numbered steps, and decision points marked with ⚠️.`,
      outputFormat: 'markdown',
    },
    config: {
      recommendedModel: 'claude',
      useWebSearch: false,
      maxTokens: 8192,
      temperature: 0.3,
    },
    testPayload: {
      incidentType: 'Service Outage',
      systemName: 'Payment Processing Gateway',
      systemDescription: 'Microservices-based payment gateway handling credit card transactions. Uses Stripe API, PostgreSQL for transaction logs, Redis for rate limiting, and Kafka for event streaming. Processes ~10,000 transactions per hour during peak.',
      teamStructure: 'Primary on-call rotation: 3 backend engineers (weekly rotation). Secondary: Platform team lead. Tertiary: VP Engineering. Slack channel: #payments-incidents',
      slaRequirements: '99.95% uptime, P1 response within 15 minutes, P2 within 1 hour. Maximum acceptable downtime: 4 hours/month.',
      existingTools: 'PagerDuty for alerting, Datadog for monitoring, Slack for communication, Jira for ticketing, Confluence for documentation',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SKILL 2: Process Optimization Analyzer
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ops-process-optimization',
    name: 'Process Optimization Analyzer',
    description: 'Analyze operational processes to identify bottlenecks, waste, and automation opportunities.',
    longDescription: 'Applies Lean Six Sigma principles to analyze your operational processes. Identifies value streams, waste categories (TIMWOOD), bottlenecks, and provides prioritized recommendations for optimization and automation.',
    category: 'analysis',
    estimatedTimeSaved: '10-20 hours per analysis',
    theme: {
      primary: 'text-blue-400',
      secondary: 'bg-blue-900/20',
      gradient: 'from-blue-500/20 to-transparent',
      iconName: 'GitBranch',
    },
    inputs: [
      {
        id: 'processName',
        label: 'Process Name',
        type: 'text',
        placeholder: 'e.g., Customer Onboarding, Order Fulfillment',
        validation: { required: true, minLength: 3 },
      },
      {
        id: 'processDescription',
        label: 'Process Description',
        type: 'textarea',
        placeholder: 'Describe the end-to-end process including all steps, handoffs, and systems involved...',
        validation: { required: true, minLength: 100 },
      },
      {
        id: 'currentMetrics',
        label: 'Current Metrics',
        type: 'textarea',
        placeholder: 'e.g., Average cycle time: 5 days, Error rate: 3%, Manual touchpoints: 12...',
        validation: { required: true, minLength: 30 },
      },
      {
        id: 'painPoints',
        label: 'Known Pain Points',
        type: 'textarea',
        placeholder: 'What are the biggest frustrations with this process?',
        validation: { required: false },
      },
      {
        id: 'constraints',
        label: 'Constraints & Requirements',
        type: 'textarea',
        placeholder: 'e.g., Regulatory requirements, budget limitations, technology constraints...',
        validation: { required: false },
      },
      {
        id: 'targetGoals',
        label: 'Target Goals',
        type: 'textarea',
        placeholder: 'What would success look like? e.g., Reduce cycle time by 50%...',
        validation: { required: false },
      },
    ],
    prompts: {
      systemInstruction: `You are a Lean Six Sigma Master Black Belt with 20+ years of experience in operational excellence. You've led transformation programs at Amazon, Toyota, and McKinsey, delivering billions in operational savings.

Your analysis framework includes:
- Value Stream Mapping
- TIMWOOD waste identification (Transportation, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects)
- Theory of Constraints
- Process mining patterns
- Automation opportunity scoring

Provide data-driven, actionable recommendations with clear ROI estimates.`,
      userPromptTemplate: `Analyze the following operational process and provide optimization recommendations:

## Process Information
**Name:** {{processName}}

**Description:**
{{processDescription}}

**Current Metrics:**
{{currentMetrics}}

**Known Pain Points:**
{{painPoints}}

**Constraints:**
{{constraints}}

**Target Goals:**
{{targetGoals}}

---

Please provide a comprehensive process optimization analysis including:

1. **Current State Assessment**
   - Process flow diagram (text-based)
   - Value stream map with cycle times
   - Identification of value-add vs non-value-add activities

2. **Waste Analysis (TIMWOOD)**
   - Transportation waste
   - Inventory waste
   - Motion waste
   - Waiting waste
   - Overproduction waste
   - Overprocessing waste
   - Defects/rework

3. **Bottleneck Identification**
   - Primary constraints
   - Capacity analysis
   - Resource utilization

4. **Automation Opportunities**
   - High-impact automation candidates
   - Technology recommendations
   - Build vs buy analysis

5. **Optimization Roadmap**
   - Quick wins (< 1 month)
   - Medium-term improvements (1-3 months)
   - Strategic initiatives (3-6 months)

6. **Expected Impact**
   - Projected metrics improvement
   - ROI estimates
   - Risk assessment

Format with clear tables, metrics, and prioritization scores.`,
      outputFormat: 'markdown',
    },
    config: {
      recommendedModel: 'claude',
      useWebSearch: false,
      maxTokens: 8192,
      temperature: 0.4,
    },
    testPayload: {
      processName: 'Customer Support Ticket Resolution',
      processDescription: 'Customer submits ticket via email/chat → Auto-categorization attempts → Routed to L1 support queue → L1 agent picks up ticket → Initial diagnosis → If complex, escalate to L2 → L2 investigation → Resolution attempt → Customer confirmation → Ticket closure → Feedback survey. Uses Zendesk, Slack, internal wiki, and 3 legacy systems for customer data.',
      currentMetrics: 'Average resolution time: 4.5 days. First contact resolution: 35%. Tickets per agent per day: 15. Customer satisfaction: 3.2/5. Escalation rate: 45%. Reopen rate: 18%.',
      painPoints: 'High escalation rate, agents spend 30% of time searching knowledge base, inconsistent categorization, customers repeat information multiple times, legacy system lookups are slow.',
      constraints: 'Cannot replace Zendesk (3-year contract), limited budget for new tools ($50K), team of 25 agents across 2 time zones, must maintain 24/5 coverage.',
      targetGoals: 'Reduce average resolution time to 2 days, increase FCR to 60%, improve CSAT to 4.2/5, reduce escalation rate to 25%.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SKILL 3: Capacity Planning Calculator
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ops-capacity-planning',
    name: 'Capacity Planning Calculator',
    description: 'Calculate resource requirements for scaling operations with demand forecasting.',
    longDescription: 'Analyzes current capacity utilization and forecasts future resource needs based on growth projections, seasonality, and efficiency improvements. Provides staffing models, infrastructure sizing, and budget projections.',
    category: 'analysis',
    estimatedTimeSaved: '6-12 hours per planning cycle',
    theme: {
      primary: 'text-green-400',
      secondary: 'bg-green-900/20',
      gradient: 'from-green-500/20 to-transparent',
      iconName: 'TrendingUp',
    },
    inputs: [
      {
        id: 'operationType',
        label: 'Operation Type',
        type: 'select',
        options: ['Customer Support', 'Engineering', 'Sales', 'Manufacturing', 'Logistics', 'IT Operations', 'Custom'],
        validation: { required: true },
      },
      {
        id: 'currentCapacity',
        label: 'Current Capacity',
        type: 'textarea',
        placeholder: 'e.g., 50 support agents, 200 tickets/day capacity, 85% utilization...',
        validation: { required: true, minLength: 30 },
      },
      {
        id: 'currentDemand',
        label: 'Current Demand',
        type: 'textarea',
        placeholder: 'e.g., 180 tickets/day average, peak at 250, seasonal 30% increase in Q4...',
        validation: { required: true, minLength: 30 },
      },
      {
        id: 'growthProjections',
        label: 'Growth Projections',
        type: 'textarea',
        placeholder: 'e.g., 20% YoY customer growth, new product launch in Q2...',
        validation: { required: true, minLength: 20 },
      },
      {
        id: 'efficiencyInitiatives',
        label: 'Planned Efficiency Improvements',
        type: 'textarea',
        placeholder: 'e.g., New ticketing system (expected 15% efficiency gain), automation projects...',
        validation: { required: false },
      },
      {
        id: 'budgetConstraints',
        label: 'Budget Constraints',
        type: 'textarea',
        placeholder: 'e.g., Headcount freeze until Q3, max 10% budget increase...',
        validation: { required: false },
      },
      {
        id: 'planningHorizon',
        label: 'Planning Horizon',
        type: 'select',
        options: ['3 months', '6 months', '12 months', '18 months', '24 months'],
        validation: { required: true },
      },
    ],
    prompts: {
      systemInstruction: `You are a Strategic Operations Planning expert with experience at high-growth companies like Uber, Airbnb, and Stripe. You specialize in capacity modeling, workforce planning, and operational scaling.

Your planning models account for:
- Demand volatility and seasonality
- Ramp-up time for new resources
- Efficiency curves and learning effects
- Buffer capacity for resilience
- Cost optimization under constraints

Provide actionable capacity plans with sensitivity analysis and scenario modeling.`,
      userPromptTemplate: `Create a capacity plan based on the following information:

## Operation Type
{{operationType}}

## Current State
**Capacity:** {{currentCapacity}}
**Demand:** {{currentDemand}}

## Projections
**Growth:** {{growthProjections}}
**Efficiency Initiatives:** {{efficiencyInitiatives}}

## Constraints
{{budgetConstraints}}

## Planning Horizon
{{planningHorizon}}

---

Please provide a comprehensive capacity plan including:

1. **Current State Analysis**
   - Capacity utilization breakdown
   - Demand patterns (daily, weekly, seasonal)
   - Efficiency metrics

2. **Demand Forecast**
   - Base case projection
   - Best case / worst case scenarios
   - Key assumptions and drivers

3. **Capacity Requirements**
   - Monthly/quarterly staffing needs
   - Infrastructure/tool requirements
   - Buffer capacity recommendations

4. **Gap Analysis**
   - Capacity gaps by period
   - Critical risk periods
   - Mitigation strategies

5. **Hiring/Resource Plan**
   - Recommended hiring timeline
   - Skill mix requirements
   - Ramp-up considerations

6. **Budget Projection**
   - Cost breakdown by category
   - ROI of efficiency initiatives
   - Sensitivity analysis

7. **Recommendations**
   - Priority actions
   - Risk mitigation
   - Optimization opportunities

Include tables with monthly projections and clear decision points.`,
      outputFormat: 'markdown',
    },
    config: {
      recommendedModel: 'claude',
      useWebSearch: false,
      maxTokens: 8192,
      temperature: 0.3,
    },
    testPayload: {
      operationType: 'Customer Support',
      currentCapacity: '45 support agents (40 L1, 5 L2), 180 tickets/day capacity at current efficiency, 87% utilization during business hours, 65% utilization overnight.',
      currentDemand: '165 tickets/day average, peaks at 220 on Mondays, 30% increase during holiday season (Nov-Dec), 15% of tickets require L2 escalation.',
      growthProjections: '25% customer base growth expected over next 12 months. New enterprise product launching in Q2 expected to add 20 high-touch customers. International expansion to EU in Q3.',
      efficiencyInitiatives: 'AI chatbot deployment in Q1 (expected to handle 20% of L1 tickets). New knowledge base launching Q2 (expected 10% improvement in resolution time). Process automation for common issues (5% efficiency gain).',
      budgetConstraints: 'Headcount budget allows for 8 new hires in next fiscal year. Preference for offshore/nearshore to optimize costs. Max 15% increase in operational budget.',
      planningHorizon: '12 months',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SKILL 4: SLA/SLO Definition Builder
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ops-sla-builder',
    name: 'SLA/SLO Definition Builder',
    description: 'Create comprehensive Service Level Agreements and Objectives with metrics, thresholds, and reporting templates.',
    longDescription: 'Generates industry-standard SLA/SLO documents including service definitions, availability targets, performance metrics, support response times, escalation procedures, and penalty/credit structures.',
    category: 'generation',
    estimatedTimeSaved: '8-15 hours per SLA',
    theme: {
      primary: 'text-purple-400',
      secondary: 'bg-purple-900/20',
      gradient: 'from-purple-500/20 to-transparent',
      iconName: 'FileCheck',
    },
    inputs: [
      {
        id: 'serviceType',
        label: 'Service Type',
        type: 'select',
        options: ['SaaS Platform', 'API Service', 'Managed Service', 'Support Services', 'Infrastructure', 'Custom'],
        validation: { required: true },
      },
      {
        id: 'serviceName',
        label: 'Service Name',
        type: 'text',
        placeholder: 'e.g., Enterprise Analytics Platform',
        validation: { required: true, minLength: 3 },
      },
      {
        id: 'serviceDescription',
        label: 'Service Description',
        type: 'textarea',
        placeholder: 'Describe what the service provides and its key capabilities...',
        validation: { required: true, minLength: 50 },
      },
      {
        id: 'targetCustomerTier',
        label: 'Target Customer Tier',
        type: 'select',
        options: ['Enterprise', 'Mid-Market', 'SMB', 'All Tiers'],
        validation: { required: true },
      },
      {
        id: 'currentMetrics',
        label: 'Current Performance Metrics',
        type: 'textarea',
        placeholder: 'e.g., Current uptime: 99.8%, average response time: 200ms...',
        validation: { required: false },
      },
      {
        id: 'competitorBenchmarks',
        label: 'Competitor/Industry Benchmarks',
        type: 'textarea',
        placeholder: 'What SLAs do competitors offer? Any industry standards?',
        validation: { required: false },
      },
      {
        id: 'businessConstraints',
        label: 'Business Constraints',
        type: 'textarea',
        placeholder: 'e.g., Cannot offer credits > 30% of monthly fee, maintenance windows required...',
        validation: { required: false },
      },
    ],
    prompts: {
      systemInstruction: `You are a Service Level Management expert who has designed SLA frameworks for AWS, Salesforce, and other major SaaS providers. You understand the balance between ambitious commitments and operational feasibility.

Your SLA designs include:
- Clear, measurable metrics
- Realistic but competitive targets
- Fair credit/penalty structures
- Exclusions that protect both parties
- Monitoring and reporting requirements

Create SLAs that build customer trust while managing operational risk.`,
      userPromptTemplate: `Create a comprehensive SLA/SLO framework for the following service:

## Service Information
**Type:** {{serviceType}}
**Name:** {{serviceName}}
**Description:** {{serviceDescription}}
**Target Tier:** {{targetCustomerTier}}

## Current Performance
{{currentMetrics}}

## Market Context
{{competitorBenchmarks}}

## Constraints
{{businessConstraints}}

---

Please generate a complete SLA/SLO framework including:

1. **Service Definition**
   - Scope of service covered
   - Service components and dependencies
   - Exclusions and limitations

2. **Availability SLOs**
   - Monthly uptime target
   - Calculation methodology
   - Planned maintenance windows
   - Exclusion criteria

3. **Performance SLOs**
   - Response time targets (p50, p95, p99)
   - Throughput commitments
   - Error rate thresholds

4. **Support SLOs**
   - Response time by severity
   - Resolution time targets
   - Escalation procedures
   - Support hours and channels

5. **Credit/Penalty Structure**
   - Credit calculation formula
   - Credit caps
   - Claim process
   - Exclusions

6. **Monitoring & Reporting**
   - Metrics tracked
   - Reporting frequency
   - Dashboard access
   - Incident communication

7. **Review & Governance**
   - SLA review cadence
   - Amendment process
   - Dispute resolution

Format as a professional document with tables and clear sections.`,
      outputFormat: 'markdown',
    },
    config: {
      recommendedModel: 'claude',
      useWebSearch: true,
      maxTokens: 8192,
      temperature: 0.3,
    },
    testPayload: {
      serviceType: 'SaaS Platform',
      serviceName: 'DataSync Enterprise Analytics',
      serviceDescription: 'Cloud-based data analytics platform providing real-time dashboards, automated reporting, data warehousing, and ML-powered insights. Integrates with 50+ data sources including Salesforce, HubSpot, and major databases.',
      targetCustomerTier: 'Enterprise',
      currentMetrics: 'Historical uptime: 99.92% over past 12 months. Average API response: 180ms (p50), 450ms (p95). Current support response: 2 hours for critical issues. 3 unplanned outages in past year (total 4 hours downtime).',
      competitorBenchmarks: 'Looker offers 99.9% uptime. Tableau Cloud offers 99.5%. Most competitors offer 4-hour response for P1 issues. Industry standard credits: 10% for <99.9%, 25% for <99.5%.',
      businessConstraints: 'Monthly maintenance window required (4 hours on Sunday nights). Cannot offer credits exceeding 30% of monthly fee. Must retain right to exclude third-party integration failures. Engineering capacity limits response to critical bugs at 24-hour target.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SKILL 5: Vendor Evaluation Matrix
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ops-vendor-evaluation',
    name: 'Vendor Evaluation Matrix',
    description: 'Create structured vendor evaluation frameworks with weighted scoring and comparison matrices.',
    longDescription: 'Builds comprehensive vendor evaluation frameworks including requirement categorization, weighted scoring models, RFP question templates, and decision matrices for objective vendor selection.',
    category: 'analysis',
    estimatedTimeSaved: '5-10 hours per evaluation',
    theme: {
      primary: 'text-orange-400',
      secondary: 'bg-orange-900/20',
      gradient: 'from-orange-500/20 to-transparent',
      iconName: 'Scale',
    },
    inputs: [
      {
        id: 'categoryType',
        label: 'Vendor Category',
        type: 'select',
        options: ['Software/SaaS', 'Cloud Infrastructure', 'Professional Services', 'Hardware', 'Managed Services', 'Custom'],
        validation: { required: true },
      },
      {
        id: 'solutionNeed',
        label: 'Solution Need',
        type: 'textarea',
        placeholder: 'What problem are you trying to solve? What capabilities do you need?',
        validation: { required: true, minLength: 50 },
      },
      {
        id: 'mustHaveRequirements',
        label: 'Must-Have Requirements',
        type: 'textarea',
        placeholder: 'List non-negotiable requirements...',
        validation: { required: true, minLength: 30 },
      },
      {
        id: 'niceToHaveRequirements',
        label: 'Nice-to-Have Requirements',
        type: 'textarea',
        placeholder: 'List desired but optional capabilities...',
        validation: { required: false },
      },
      {
        id: 'budgetRange',
        label: 'Budget Range',
        type: 'text',
        placeholder: 'e.g., $50K-$100K annually',
        validation: { required: true },
      },
      {
        id: 'evaluationCriteria',
        label: 'Key Evaluation Criteria',
        type: 'textarea',
        placeholder: 'e.g., Security, scalability, ease of use, support quality, pricing...',
        validation: { required: true, minLength: 20 },
      },
      {
        id: 'vendorsToEvaluate',
        label: 'Vendors to Evaluate (if known)',
        type: 'textarea',
        placeholder: 'List specific vendors you want to compare...',
        validation: { required: false },
      },
      {
        id: 'timeline',
        label: 'Decision Timeline',
        type: 'text',
        placeholder: 'e.g., Decision needed by end of Q2',
        validation: { required: false },
      },
    ],
    prompts: {
      systemInstruction: `You are a Strategic Procurement and Vendor Management expert with experience leading vendor selections for Fortune 500 companies. You've managed $100M+ in vendor contracts and built evaluation frameworks used across industries.

Your evaluation frameworks are:
- Objective and defensible
- Comprehensive yet practical
- Weighted based on business priorities
- Include both quantitative and qualitative factors
- Account for total cost of ownership

Create frameworks that lead to confident, well-documented decisions.`,
      userPromptTemplate: `Create a comprehensive vendor evaluation framework for the following need:

## Vendor Category
{{categoryType}}

## Solution Need
{{solutionNeed}}

## Requirements
**Must-Have:**
{{mustHaveRequirements}}

**Nice-to-Have:**
{{niceToHaveRequirements}}

## Budget
{{budgetRange}}

## Evaluation Criteria
{{evaluationCriteria}}

## Vendors
{{vendorsToEvaluate}}

## Timeline
{{timeline}}

---

Please generate a comprehensive vendor evaluation framework including:

1. **Requirements Matrix**
   - Categorized requirements (Functional, Technical, Security, Support, Commercial)
   - Priority weighting (Critical/High/Medium/Low)
   - Measurable acceptance criteria

2. **Weighted Scoring Model**
   - Evaluation categories with weights
   - Scoring rubric (1-5 scale with definitions)
   - Minimum threshold scores

3. **Evaluation Questions (RFP Template)**
   - Questions by category
   - Response format requirements
   - Demo/POC scenarios

4. **Comparison Matrix Template**
   - Side-by-side comparison format
   - Score aggregation formula
   - Visual scoring guide

5. **Due Diligence Checklist**
   - Security assessment items
   - Reference check questions
   - Financial stability checks

6. **TCO Calculator**
   - Cost categories to consider
   - Hidden cost factors
   - 3-year projection template

7. **Decision Framework**
   - Go/No-Go criteria
   - Tie-breaker factors
   - Stakeholder sign-off requirements

Include sample tables and scoring examples.`,
      outputFormat: 'markdown',
    },
    config: {
      recommendedModel: 'claude',
      useWebSearch: true,
      maxTokens: 8192,
      temperature: 0.3,
    },
    testPayload: {
      categoryType: 'Software/SaaS',
      solutionNeed: 'We need a customer data platform (CDP) to unify customer data from our website, mobile app, CRM (Salesforce), and support system (Zendesk). Need real-time audience segmentation, identity resolution, and ability to activate data in our marketing tools (Marketo, Google Ads, Facebook).',
      mustHaveRequirements: 'Real-time data ingestion, identity resolution across devices, native Salesforce integration, GDPR/CCPA compliance, SOC 2 Type II certification, ability to create audiences and sync to ad platforms, API access for custom integrations.',
      niceToHaveRequirements: 'Built-in predictive modeling, customer journey visualization, data quality scoring, reverse ETL to data warehouse, mobile SDK, professional services for implementation.',
      budgetRange: '$80,000 - $150,000 annually',
      evaluationCriteria: 'Data integration capabilities, ease of use for marketers, scalability, security & compliance, vendor stability, implementation timeline, total cost of ownership, customer support quality, product roadmap.',
      vendorsToEvaluate: 'Segment, mParticle, Tealium, Rudderstack, Lytics',
      timeline: 'RFP responses by end of month, demos in 3 weeks, decision by end of quarter',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SKILL 6: Ops Metrics Dashboard Designer
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ops-dashboard-designer',
    name: 'Ops Metrics Dashboard Designer',
    description: 'Design operational dashboards with KPIs, visualizations, and alerting recommendations.',
    longDescription: 'Creates comprehensive dashboard specifications including metric definitions, visualization recommendations, data source mappings, refresh frequencies, and alerting thresholds tailored to operational monitoring needs.',
    category: 'generation',
    estimatedTimeSaved: '4-8 hours per dashboard',
    theme: {
      primary: 'text-cyan-400',
      secondary: 'bg-cyan-900/20',
      gradient: 'from-cyan-500/20 to-transparent',
      iconName: 'BarChart3',
    },
    inputs: [
      {
        id: 'dashboardPurpose',
        label: 'Dashboard Purpose',
        type: 'select',
        options: ['Executive Overview', 'Team Operations', 'Service Health', 'Incident Management', 'Capacity Planning', 'Customer Metrics', 'Custom'],
        validation: { required: true },
      },
      {
        id: 'targetAudience',
        label: 'Target Audience',
        type: 'textarea',
        placeholder: 'Who will use this dashboard? What decisions will they make?',
        validation: { required: true, minLength: 20 },
      },
      {
        id: 'keyQuestions',
        label: 'Key Questions to Answer',
        type: 'textarea',
        placeholder: 'What questions should this dashboard answer? e.g., Are we meeting SLAs?...',
        validation: { required: true, minLength: 50 },
      },
      {
        id: 'availableDataSources',
        label: 'Available Data Sources',
        type: 'textarea',
        placeholder: 'e.g., Datadog, Salesforce, Jira, internal databases...',
        validation: { required: true, minLength: 20 },
      },
      {
        id: 'existingMetrics',
        label: 'Existing Metrics Tracked',
        type: 'textarea',
        placeholder: 'What metrics do you already track? What data is available?',
        validation: { required: false },
      },
      {
        id: 'refreshRequirements',
        label: 'Refresh Requirements',
        type: 'select',
        options: ['Real-time (<1 min)', 'Near real-time (1-5 min)', 'Frequent (15-30 min)', 'Periodic (hourly)', 'Daily'],
        validation: { required: true },
      },
      {
        id: 'visualizationTool',
        label: 'Visualization Tool',
        type: 'select',
        options: ['Grafana', 'Datadog', 'Tableau', 'Looker', 'Power BI', 'Custom/Other'],
        validation: { required: false },
      },
    ],
    prompts: {
      systemInstruction: `You are a Data Visualization and Operations Analytics expert who has designed dashboards for companies like Netflix, Uber, and Airbnb. You understand how to translate operational needs into actionable metrics and intuitive visualizations.

Your dashboards follow principles of:
- Information hierarchy (most important metrics prominent)
- Progressive disclosure (summary → details)
- Actionable insights (clear thresholds and trends)
- Minimal cognitive load (appropriate chart types)
- Consistent design language

Create dashboard designs that drive better operational decisions.`,
      userPromptTemplate: `Design a comprehensive operational dashboard based on the following requirements:

## Dashboard Context
**Purpose:** {{dashboardPurpose}}
**Audience:** {{targetAudience}}
**Refresh:** {{refreshRequirements}}
**Tool:** {{visualizationTool}}

## Key Questions
{{keyQuestions}}

## Data Sources
{{availableDataSources}}

## Existing Metrics
{{existingMetrics}}

---

Please design a comprehensive dashboard specification including:

1. **Dashboard Architecture**
   - Overall layout structure
   - Section organization
   - Navigation and drill-down paths

2. **Metric Definitions**
   - For each recommended metric:
     - Name and description
     - Calculation formula
     - Data source(s)
     - Unit of measure
     - Good/warning/critical thresholds

3. **Visualization Specifications**
   - For each visualization:
     - Chart type recommendation
     - Dimensions and measures
     - Time granularity
     - Interactivity requirements
     - Color coding standards

4. **Dashboard Sections**
   - Executive summary (top-level KPIs)
   - Trend analysis section
   - Detailed breakdown section
   - Comparison/benchmark section

5. **Alerting Configuration**
   - Alert rules with thresholds
   - Escalation criteria
   - Notification channels
   - Alert fatigue prevention

6. **Data Requirements**
   - Required data pipelines
   - Data freshness requirements
   - Data quality checks
   - Historical data needs

7. **Implementation Notes**
   - Recommended widget layouts
   - Filter/variable configurations
   - Performance considerations
   - Mobile responsiveness

Include mockup descriptions and metric calculation examples.`,
      outputFormat: 'markdown',
    },
    config: {
      recommendedModel: 'claude',
      useWebSearch: false,
      maxTokens: 8192,
      temperature: 0.4,
    },
    testPayload: {
      dashboardPurpose: 'Service Health',
      targetAudience: 'Platform engineering team (10 engineers) and SRE team lead. Used in daily standups, incident response, and weekly ops reviews with VP Engineering. Need to quickly identify issues, track SLA compliance, and spot capacity concerns.',
      keyQuestions: 'Are all services healthy? Are we meeting our SLAs? Any performance degradation? What is current capacity utilization? Any emerging incidents? How does this week compare to last week?',
      availableDataSources: 'Datadog (APM, infrastructure metrics, logs), PagerDuty (incidents), AWS CloudWatch (cloud resources), PostgreSQL (application database), Kafka (event metrics), custom service health endpoints.',
      existingMetrics: 'Currently tracking: uptime percentage, p95 latency, error rate by service, CPU/memory utilization, request volume. Missing: business-level metrics, comparative analysis, capacity forecasting.',
      refreshRequirements: 'Near real-time (1-5 min)',
      visualizationTool: 'Grafana',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// OPS LEAD WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════

export interface OpsLeadWorkflow {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  estimatedTime: string;
  outputs: string[];
  skillSequence: string[];
  testPayload: Record<string, unknown>;
}

export const OPS_LEAD_WORKFLOWS: OpsLeadWorkflow[] = [
  {
    id: 'ops-new-service-launch',
    name: 'New Service Launch Readiness',
    description: 'Complete operational readiness package for launching a new service',
    longDescription: 'Comprehensive workflow that generates all operational artifacts needed for a new service launch: runbooks, SLAs, dashboards, capacity plan, and launch checklist.',
    icon: 'Rocket',
    color: 'green',
    estimatedTime: '25-35 minutes',
    outputs: [
      'Incident response runbook',
      'SLA/SLO definitions',
      'Monitoring dashboard specification',
      'Capacity plan',
      'Launch readiness checklist',
    ],
    skillSequence: [
      'ops-incident-runbook-generator',
      'ops-sla-builder',
      'ops-dashboard-designer',
      'ops-capacity-planning',
    ],
    testPayload: {
      serviceName: 'Customer 360 Data Platform',
      serviceDescription: 'Real-time customer data platform aggregating data from 15+ sources for unified customer view. APIs for customer lookup, segmentation, and event streaming.',
      incidentType: 'Service Outage',
      teamStructure: '5 platform engineers, 2 SREs on rotation. Escalation to Platform Lead, then VP Engineering.',
      targetCustomerTier: 'Enterprise',
      operationType: 'IT Operations',
      planningHorizon: '12 months',
    },
  },
  {
    id: 'ops-vendor-selection',
    name: 'Vendor Selection Process',
    description: 'End-to-end vendor evaluation and selection workflow',
    longDescription: 'Structured workflow for evaluating and selecting vendors including requirements gathering, evaluation framework creation, and process optimization for the procurement cycle.',
    icon: 'Scale',
    color: 'orange',
    estimatedTime: '20-30 minutes',
    outputs: [
      'Requirements matrix',
      'Weighted scoring model',
      'Vendor comparison matrix',
      'Procurement process optimization',
    ],
    skillSequence: [
      'ops-vendor-evaluation',
      'ops-process-optimization',
    ],
    testPayload: {
      categoryType: 'Software/SaaS',
      solutionNeed: 'Enterprise monitoring and observability platform',
      mustHaveRequirements: 'APM, infrastructure monitoring, log management, alerting',
      budgetRange: '$100K-$200K annually',
      processName: 'Vendor Procurement Cycle',
    },
  },
  {
    id: 'ops-incident-improvement',
    name: 'Incident to Improvement',
    description: 'Transform incidents into operational improvements',
    longDescription: 'Workflow for analyzing incidents, identifying process gaps, and implementing preventive improvements. Generates post-incident analysis, process optimization recommendations, and updated runbooks.',
    icon: 'RefreshCw',
    color: 'blue',
    estimatedTime: '20-30 minutes',
    outputs: [
      'Process gap analysis',
      'Optimization recommendations',
      'Updated runbook',
      'Prevention metrics dashboard',
    ],
    skillSequence: [
      'ops-process-optimization',
      'ops-incident-runbook-generator',
      'ops-dashboard-designer',
    ],
    testPayload: {
      processName: 'Incident Response and Resolution',
      processDescription: 'Current incident handling process from detection to resolution',
      incidentType: 'Service Outage',
      systemName: 'Production API Gateway',
      dashboardPurpose: 'Incident Management',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// OPS LEAD STARTER KIT
// ═══════════════════════════════════════════════════════════════════════════

export const OPS_LEAD_STARTER_KIT: StarterKit = {
  id: 'ops-lead-starter-kit',
  roleId: 'ops-lead',
  roleName: 'Operations Lead',
  description: 'Complete toolkit for Operations Leads including incident management, process optimization, capacity planning, and vendor management capabilities.',

  skills: OPS_LEAD_SKILLS.map(skill => ({
    skillId: skill.id,
    required: true,
  })),

  workflows: OPS_LEAD_WORKFLOWS.map(workflow => ({
    workflowId: workflow.id,
    required: true,
  })),

  testPayloads: [
    ...OPS_LEAD_SKILLS.map(skill => ({
      skillId: skill.id,
      name: `${skill.name} - Sample`,
      description: `Production-ready test data for ${skill.name}`,
      payload: skill.testPayload,
    })),
    ...OPS_LEAD_WORKFLOWS.map(workflow => ({
      workflowId: workflow.id,
      name: `${workflow.name} - Sample`,
      description: `Production-ready test data for ${workflow.name}`,
      payload: workflow.testPayload,
    })),
  ],

  uiHooks: [
    {
      id: 'ops-quick-runbook',
      type: 'quick_action',
      location: 'dashboard',
      label: 'Generate Runbook',
      icon: 'AlertTriangle',
      action: {
        type: 'run_skill',
        target: 'ops-incident-runbook-generator',
      },
    },
    {
      id: 'ops-quick-capacity',
      type: 'quick_action',
      location: 'dashboard',
      label: 'Capacity Planning',
      icon: 'TrendingUp',
      action: {
        type: 'run_skill',
        target: 'ops-capacity-planning',
      },
    },
    {
      id: 'ops-launch-workflow',
      type: 'menu_item',
      location: 'workflows',
      label: 'New Service Launch',
      icon: 'Rocket',
      action: {
        type: 'run_workflow',
        target: 'ops-new-service-launch',
      },
    },
  ],

  dashboardWidgets: [
    {
      id: 'ops-recent-runbooks',
      type: 'list',
      title: 'Recent Runbooks',
      dataSource: 'skill_executions',
      config: {
        skillIds: ['ops-incident-runbook-generator'],
        limit: 5,
      },
      position: { row: 1, col: 1, width: 2, height: 2 },
    },
    {
      id: 'ops-skill-usage',
      type: 'chart',
      title: 'Ops Skills Usage',
      dataSource: 'skill_usage',
      config: {
        chartType: 'bar',
        groupBy: 'skill',
        timeRange: '30d',
      },
      position: { row: 1, col: 3, width: 2, height: 2 },
    },
  ],

  gettingStartedGuide: `# Operations Lead Starter Kit

Welcome to the Operations Lead toolkit! This kit provides everything you need to manage operations efficiently.

## Quick Start

1. **Generate Your First Runbook**
   - Go to Skills → Incident Response Runbook Generator
   - Use the "Fill Test Data" button to see a sample
   - Customize for your specific service

2. **Create SLAs for Your Services**
   - Use the SLA/SLO Definition Builder
   - Start with your most critical service
   - Export and share with stakeholders

3. **Design Monitoring Dashboards**
   - Ops Metrics Dashboard Designer creates specifications
   - Use output to build in Grafana/Datadog
   - Set up recommended alerts

## Recommended Workflows

- **Launching a new service?** → Run "New Service Launch Readiness"
- **Selecting a vendor?** → Run "Vendor Selection Process"
- **Post-incident improvement?** → Run "Incident to Improvement"

## Tips

- Each skill has production-ready test data - use it as a template
- Combine skills for comprehensive operational packages
- Export outputs to Markdown for documentation
`,

  bestPractices: `## Operations Lead Best Practices

### Incident Management
- Create runbooks BEFORE you need them
- Review and update quarterly
- Include specific commands and URLs

### Capacity Planning
- Review monthly, not just quarterly
- Include buffer capacity (20-30%)
- Account for seasonal variations

### Vendor Management
- Always use weighted scoring
- Include TCO, not just license cost
- Get references from similar-sized companies

### Process Optimization
- Start with highest-pain processes
- Measure before and after
- Quick wins build momentum
`,

  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Export all ops lead resources
export default {
  skills: OPS_LEAD_SKILLS,
  workflows: OPS_LEAD_WORKFLOWS,
  starterKit: OPS_LEAD_STARTER_KIT,
};
