/**
 * Role Template Test Data
 *
 * Production-grade test data for all dynamic role template skills.
 * Organized by role for maintainability.
 */

import type { SkillDefaultTestData } from './defaultTestData';

// ═══════════════════════════════════════════════════════════════════════════
// SOFTWARE ENGINEER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const SOFTWARE_ENGINEER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'software-engineer-code-review-assistant': {
    skillId: 'software-engineer-code-review-assistant',
    defaultTestCaseId: 'code-review-default-1',
    description: 'Reviewing a TypeScript authentication service',
    inputPayload: {
      code: `import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private secretKey = 'my-secret-key-123';

  async login(email: string, password: string) {
    const user = await db.query('SELECT * FROM users WHERE email = "' + email + '"');
    if (!user) throw new Error('User not found');

    const valid = await compare(password, user.password);
    if (!valid) throw new Error('Invalid password');

    const token = jwt.sign({ userId: user.id, email }, this.secretKey);
    return { token, user };
  }

  async register(email, password) {
    const hashedPassword = await hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password) VALUES ("' + email + '", "' + hashedPassword + '")'
    );
    return result;
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch {
      return null;
    }
  }
}`,
      language: 'TypeScript',
      codeType: 'Backend Service',
      context: 'This is our authentication service handling user login and registration. We are preparing for a security audit and want to ensure this code follows best practices.',
      severity: 'Deep Review (comprehensive)',
    },
  },

  'software-engineer-technical-documentation-generator': {
    skillId: 'software-engineer-technical-documentation-generator',
    defaultTestCaseId: 'tech-docs-default-1',
    description: 'Documenting a payment processing API',
    inputPayload: {
      docType: 'API Reference (OpenAPI style)',
      projectInfo: `Payment Gateway API - RESTful API for processing credit card payments, handling refunds, and managing subscriptions. Built with Node.js/Express, uses Stripe as payment processor.

Sample Endpoints:
POST /api/v1/payments/charge
Request: { amount: number, currency: string, customerId: string, paymentMethodId: string }
Response: { paymentId: string, status: 'succeeded' | 'failed', receiptUrl: string }

POST /api/v1/subscriptions/create
Request: { customerId: string, priceId: string, trialDays?: number }
Response: { subscriptionId: string, status: string, currentPeriodEnd: string }

POST /api/v1/refunds/create
Request: { paymentId: string, amount?: number, reason: string }
Response: { refundId: string, status: string, amount: number }`,
      audience: 'External API Consumers',
      existingDocs: 'Basic README exists but is outdated. No API reference currently.',
      requirements: 'Include authentication section, rate limiting info, and code examples in JavaScript, Python, and cURL.',
    },
  },

  'software-engineer-system-design-architect': {
    skillId: 'software-engineer-system-design-architect',
    defaultTestCaseId: 'system-design-default-1',
    description: 'Designing a real-time messaging system',
    inputPayload: {
      problem: `Design an Enterprise Real-Time Messaging Platform with:
Functional Requirements:
- Support 1-1 and group messaging (up to 500 members per group)
- Real-time message delivery with <100ms latency
- Message history and search
- File/image sharing up to 50MB
- Read receipts and typing indicators
- Offline message queuing

Non-Functional Requirements:
- 10 million daily active users
- 99.99% uptime SLA
- End-to-end encryption for all messages
- GDPR and SOC2 compliance
- Mobile and web clients`,
      scale: `Users: 10 million DAU, 50 million registered
Messages: 500 million messages/day, 50TB storage/year
Peak load: 100K concurrent connections
Growth: 20% MoM for next 18 months`,
      focus: 'High Availability & Fault Tolerance',
      constraints: 'Budget: $50K/month infrastructure. Team: 5 backend engineers. Timeline: MVP in 3 months.',
      context: 'Greenfield (new system)',
    },
  },

  'software-engineer-technical-debt-scanner': {
    skillId: 'software-engineer-technical-debt-scanner',
    defaultTestCaseId: 'tech-debt-default-1',
    description: 'Scanning e-commerce codebase for technical debt',
    inputPayload: {
      codebaseInfo: `E-commerce platform built over 5 years:
- 250K lines of code across 3 services
- Node.js backend (v12, needs upgrade)
- React frontend (class components, no hooks)
- MongoDB database with no schema validation
- No automated tests (manual QA only)
- Deployment via FTP to EC2 instances
- jQuery mixed with React in some pages
- 15 npm packages with known vulnerabilities`,
      architectureContext: `Monolithic architecture with 3 loosely coupled services:
- Main API (handles 90% of traffic)
- Payment service (Stripe integration)
- Notification service (email/SMS)
All services share a single MongoDB instance. No message queue. Direct HTTP calls between services.`,
      knownIssues: 'Frequent production outages during sales events. New features take 3x longer than estimated. Onboarding new developers takes 2+ months.',
      assessmentScope: 'Full Assessment (architecture, code, security, performance)',
      businessContext: 'Preparing for 10x traffic growth due to expansion into 3 new markets.',
    },
  },

  'software-engineer-tech-debt-stakeholder-brief': {
    skillId: 'software-engineer-tech-debt-stakeholder-brief',
    defaultTestCaseId: 'tech-debt-brief-default-1',
    description: 'Creating executive brief on technical debt impact',
    inputPayload: {
      debtSummary: `Critical Issues Found:
1. No automated testing - 40% of releases have bugs
2. Outdated dependencies with 15 security vulnerabilities (3 critical)
3. Monolithic architecture causing 2-hour deployments
4. Database queries not optimized - 5s average response time
5. No disaster recovery plan - single point of failure`,
      businessImpact: `Current Impact:
- $50K/month in bug fixes and hotfixes
- 3 production outages in last quarter ($200K revenue loss)
- Customer churn up 15% due to performance issues
- Developer velocity down 40% vs industry benchmark

Future Risk:
- Cannot scale for planned 10x growth
- Security audit failures could block enterprise deals
- Technical limitations blocking 3 major feature requests`,
      audience: 'C-Suite (CEO, CFO, CTO)',
      requestedOutcome: 'Budget Approval (requesting specific investment)',
      competingPriorities: 'Q4 feature roadmap includes 5 major features requested by enterprise customers. Series B fundraising in 6 months.',
    },
  },

  'software-engineer-remediation-priority-ranker': {
    skillId: 'software-engineer-remediation-priority-ranker',
    defaultTestCaseId: 'remediation-default-1',
    description: 'Prioritizing technical debt remediation',
    inputPayload: {
      debtItems: `1. Upgrade Node.js from v12 to v20 (EOL security risk)
2. Add unit test coverage (currently 0%)
3. Migrate from MongoDB to PostgreSQL (schema issues)
4. Refactor monolith to microservices
5. Implement CI/CD pipeline (currently manual deploys)
6. Fix 15 npm security vulnerabilities
7. Add API rate limiting (DDoS vulnerable)
8. Implement proper logging and monitoring
9. Database query optimization
10. Add Redis caching layer`,
      teamCapacity: `Team: 5 engineers (3 senior, 2 mid-level)
Availability: 60% capacity for debt work (40% feature work)
Timeline: 6-month window before Series B
Skills: Strong in Node.js, limited database expertise`,
      priorityWeights: 'Security First (compliance and risk focused)',
      constraints: 'Cannot have more than 1 day of downtime. Must maintain feature velocity for top 3 enterprise customers.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BUSINESS ANALYST SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const BUSINESS_ANALYST_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'business-analyst-business-requirements-document-brd-generator': {
    skillId: 'business-analyst-business-requirements-document-brd-generator',
    defaultTestCaseId: 'brd-default-1',
    description: 'Creating BRD for customer portal redesign',
    inputPayload: {
      projectName: 'Customer Self-Service Portal 2.0',
      rawInput: `Meeting notes from stakeholder sessions:
- VP Customer Success: "We need to reduce support ticket volume by at least 40%. Customers should be able to self-serve 24/7."
- Support Team Lead: "Most tickets are about billing questions and account updates. If customers could do this themselves, we'd save 100 hours/week."
- IT Director: "We have Zendesk, Salesforce, and Stripe. New portal must integrate with all three."
- Enterprise Customer A: "We need role-based access so managers can see team usage but not billing."
- Enterprise Customer B: "Mobile access is essential - our teams are often on the road."

Scope discussion:
- In scope: Account management, billing history, support ticket creation, knowledge base
- Out of scope: Live chat, phone support integration (Phase 2)
- Must integrate with existing Zendesk, Salesforce CRM, Stripe billing, PostgreSQL customer database`,
      businessObjective: 'Reduce support ticket volume by 40% and improve customer satisfaction score from 72 to 85 by enabling 24/7 self-service capabilities',
    },
  },

  'business-analyst-user-story-acceptance-criteria-generator': {
    skillId: 'business-analyst-user-story-acceptance-criteria-generator',
    defaultTestCaseId: 'user-story-default-1',
    description: 'Writing user stories for checkout flow',
    inputPayload: {
      featureDescription: 'Multi-step checkout process with address validation, payment method selection, order review, and confirmation. Must support saved addresses, multiple payment methods, gift options, and order splitting for different shipping addresses.',
      userPersonas: `Primary: Sarah, 35, busy professional who shops on mobile during commute. Values speed and simplicity. Has saved payment methods and addresses.
Secondary: Mike, 55, occasional shopper who needs guidance through the process. Prefers desktop, wants to review everything carefully.
Edge case: Corporate buyer who needs to split orders across cost centers with different billing.`,
      storyCount: '8-10 stories',
      businessContext: 'Cart abandonment rate is 68%. Competitors offer 1-click checkout. Average checkout time is 4.5 minutes.',
      technicalConstraints: 'Must integrate with existing cart API, Stripe payments, and ShipStation for shipping rates. Mobile-first design required.',
    },
  },

  'business-analyst-process-analysis-optimization-report': {
    skillId: 'business-analyst-process-analysis-optimization-report',
    defaultTestCaseId: 'process-analysis-default-1',
    description: 'Analyzing employee onboarding process',
    inputPayload: {
      processName: 'New Employee Onboarding',
      processSteps: `1. HR Paperwork (Day 1, 2 hours) - Forms, I-9, benefits enrollment
2. IT Equipment Setup (Day 1, 3 hour wait) - Laptop imaging, account creation
3. Badge Creation (Day 1, 1 hour) - Photo, badge printing, access provisioning
4. Department Orientation (Days 2-5) - Team intros, culture training
5. System Access Requests (Days 2-5, 24-48hr each) - 5-8 different systems
6. Compliance Training (Week 1) - Security, harassment, safety
7. Role-specific Training (Week 2) - Tools, processes, documentation
8. Shadow Period (Weeks 3-4) - Work alongside experienced employee

Pain points: IT equipment often not ready, system access delayed, no single source of information, inconsistent experience across departments`,
      volumeMetrics: `New hires per month: 25-30
Time to productivity: 45 days
New hire satisfaction (survey): 65%
IT tickets per new hire: 12 tickets avg
Manager time spent per new hire: 15 hours
System access average wait time: 36 hours
Equipment ready on Day 1: 60% of time`,
      optimizationGoal: 'Reduce time to productivity by 50%',
    },
  },

  'business-analyst-data-analysis-insights-report-generator': {
    skillId: 'business-analyst-data-analysis-insights-report-generator',
    defaultTestCaseId: 'data-insights-default-1',
    description: 'Analyzing customer churn data',
    inputPayload: {
      analysisObjective: 'Identify leading indicators of customer churn, segment high-risk customers, and quantify revenue impact to prioritize retention initiatives',
      dataDescription: `12-month customer data with 50,000 records including:
- Customer demographics (industry, company size, location)
- Subscription tier and pricing
- Feature usage (login frequency, features used, support tickets)
- NPS scores and survey responses
- Churn flag (15% annual churn rate)
- Contract value and renewal dates
- Support ticket history and resolution times`,
      audience: 'Customer Success leadership and Executive team',
      analysisQuestions: '1. What are the leading indicators of churn? 2. Which customer segments have highest/lowest churn? 3. Is there a correlation between support tickets and churn? 4. What is the revenue impact of churn?',
    },
  },

  'business-analyst-executive-stakeholder-communication': {
    skillId: 'business-analyst-executive-stakeholder-communication',
    defaultTestCaseId: 'exec-comm-default-1',
    description: 'Creating executive update on digital transformation',
    inputPayload: {
      commType: 'Status Update/Progress Report',
      audience: 'C-Suite (CEO, CFO, CTO)',
      keyMessage: `Digital Transformation Program - Q3 Status Update:
- Program is 2 months behind schedule due to vendor delays
- Budget is on track ($2.5M of $4M spent)
- Quick wins delivered: automated reporting (saving 20 hrs/week), new CRM live with 85% adoption
- Key risks: integration complexity, change resistance in sales team
- Requesting decision on vendor replacement option`,
      urgency: 'Standard (informational, regular update)',
      supportingData: 'Timeline: 60% complete. ROI projection: $8M over 3 years. Risk mitigation options attached.',
    },
  },

  'business-analyst-sql-query-builder-optimizer': {
    skillId: 'business-analyst-sql-query-builder-optimizer',
    defaultTestCaseId: 'sql-builder-default-1',
    description: 'Building sales analytics query',
    inputPayload: {
      dataRequest: 'Monthly revenue by product category, customer segment, and region for the last 12 months with YoY comparison. Include growth rates and contribution percentages.',
      tableStructure: `Tables:
- orders (order_id, customer_id, order_date, total_amount, status)
- order_items (order_id, product_id, quantity, unit_price)
- products (product_id, name, category_id, cost)
- categories (category_id, name)
- customers (customer_id, name, segment, region)`,
      database: 'PostgreSQL',
      complexity: 'Advanced - include CTEs and window functions',
      outputFormat: 'Pivot-style for Excel import',
    },
  },

  'business-analyst-gap-analysis-strategic-roadmap': {
    skillId: 'business-analyst-gap-analysis-strategic-roadmap',
    defaultTestCaseId: 'gap-analysis-default-1',
    description: 'Gap analysis for market expansion',
    inputPayload: {
      currentState: 'B2B SaaS serving 500 SMB customers in US. $5M ARR. 15 employees. Single product for project management. No enterprise features. US-only data residency. Basic support (email only, business hours).',
      futureState: 'Expand to Enterprise segment (companies 500+ employees), launch in EU market with GDPR compliance, $20M ARR in 3 years, full product suite including resource management and advanced reporting. 24/7 support. SOC 2 Type II certified.',
      scope: 'Product capabilities, sales/marketing, operations, compliance, technology',
      constraints: 'Available investment: $10M Series A. Cannot hire more than 50 people in 18 months. Must maintain SMB business during transition.',
    },
  },

  'business-analyst-rfp-requirements-analyzer': {
    skillId: 'business-analyst-rfp-requirements-analyzer',
    defaultTestCaseId: 'rfp-analyzer-default-1',
    description: 'Analyzing government RFP requirements',
    inputPayload: {
      rfpContent: `RFP #2024-IT-001: Cloud Migration Services
Agency: Department of Transportation
Budget: $5-10M over 3 years

Key Requirements:
- Migrate 50+ legacy applications to FedRAMP High cloud
- Zero downtime for mission-critical systems
- 24/7 support with 15-min response SLA
- Data residency: US only
- Security: NIST 800-53 compliance
- Team: Project manager, 5 engineers, security specialist on-site

Evaluation Criteria:
- Technical approach (40%)
- Past performance (30%)
- Price (20%)
- Small business participation (10%)

Submission deadline: 45 days
Period of performance: 3 years`,
      companyCapabilities: 'FedRAMP Moderate authorized (High in progress). 3 similar contracts completed ($2-4M each). Team of 20 cloud engineers. Not a small business but have SB teaming partners.',
      resourceAvailability: `Available resources:
- 2 Project Managers (1 PMP certified, 1 with DOT experience)
- 8 Cloud Engineers (5 AWS certified, 3 Azure)
- 1 Security Specialist (CISSP)
- Note: Would need to hire 2 additional engineers for this contract`,
    },
  },

  'business-analyst-rfp-compliance-matrix-generator': {
    skillId: 'business-analyst-rfp-compliance-matrix-generator',
    defaultTestCaseId: 'rfp-compliance-default-1',
    description: 'Creating RFP compliance matrix',
    inputPayload: {
      requirements: `Section C - Technical Requirements:
C.1 - Vendor must provide 99.99% uptime SLA
C.2 - All data must be encrypted at rest (AES-256) and in transit (TLS 1.3)
C.3 - System must support 10,000 concurrent users
C.4 - Vendor must have SOC 2 Type II certification
C.5 - 24/7 support with dedicated account manager
C.6 - Implementation within 90 days of contract award
C.7 - Training for up to 500 users included
C.8 - Integration with existing Active Directory`,
      proposalOutline: `1. Executive Summary
2. Technical Approach
3. Management Approach
4. Past Performance
5. Pricing
6. Appendices (certifications, resumes)`,
      capabilityEvidence: `Evidence available:
- SOC 2 Type II report (dated 3 months ago)
- Uptime report showing 99.97% over 12 months
- Load test results showing 25K concurrent users
- Case studies from 3 similar implementations
- Training materials and curriculum
- Integration documentation`,
      matrixFormat: 'Detailed with compliance status, evidence location, and gap remediation plan',
    },
  },

  'business-analyst-rfp-section-response-writer': {
    skillId: 'business-analyst-rfp-section-response-writer',
    defaultTestCaseId: 'rfp-response-default-1',
    description: 'Writing technical approach section',
    inputPayload: {
      requirements: 'Describe your approach to migrating 50 legacy applications to cloud, including assessment, planning, execution, and validation phases. Address risk mitigation and how you will ensure zero downtime for mission-critical systems.',
      solutionContent: `Our approach leverages our proprietary MigrateIQ assessment tool and proven methodology:
1. Discovery & Assessment (Weeks 1-4): Automated application dependency mapping, cloud readiness scoring
2. Planning (Weeks 5-8): Migration waves, rollback procedures, success criteria
3. Execution (Weeks 9-24): Phased migration with blue-green deployments
4. Validation (Ongoing): Automated testing, performance benchmarking, security scanning

For zero-downtime: Database replication, DNS-based traffic shifting, automated rollback triggers`,
      winThemes: 'Proven methodology (200+ successful migrations), proprietary tooling (40% faster), risk mitigation focus (zero failed migrations)',
      sectionType: 'Technical Approach',
      pageLimit: '10 pages',
    },
  },

  'business-analyst-proposal-executive-summary-generator': {
    skillId: 'business-analyst-proposal-executive-summary-generator',
    defaultTestCaseId: 'proposal-summary-default-1',
    description: 'Writing proposal executive summary',
    inputPayload: {
      opportunityOverview: 'Enterprise CRM implementation at Fortune 500 manufacturing company (Acme Manufacturing). $3M contract over 2 years. Competitive bid against 4 other vendors. Decision in 60 days.',
      winThemes: `1. Manufacturing Industry Expertise - 50+ manufacturing implementations, understand unique challenges (CPQ complexity, dealer networks, field service)
2. Proven Integration Framework - Reduce integration time by 40% with pre-built connectors for SAP, Oracle
3. Delivery Excellence - 98% on-time delivery, dedicated manufacturing practice lead
4. Change Management Included - Full adoption program at no additional cost`,
      solutionHighlights: `- Salesforce Sales Cloud + CPQ implementation
- Integration with existing SAP ERP (real-time inventory, pricing)
- Custom dealer portal for 500+ dealer locations
- Mobile app for 200 field sales reps
- Analytics dashboards for 15 business units`,
      proofPoints: `- Similar implementation at Global Industrial Corp: $4M, completed on time, 90% adoption in 6 months
- Manufacturing CPQ expertise: 12 implementations with complex configuration rules
- Reference customers: 3 Fortune 500 manufacturers willing to speak
- Team: 8 manufacturing-certified consultants, led by 15-year industry veteran`,
      pageLimit: '2 pages',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MARKETING SPECIALIST SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const MARKETING_SPECIALIST_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'marketing-specialist-multi-platform-social-media-content-suite': {
    skillId: 'marketing-specialist-multi-platform-social-media-content-suite',
    defaultTestCaseId: 'social-media-default-1',
    description: 'Creating product launch social campaign',
    inputPayload: {
      platform: 'LinkedIn, Twitter/X, Instagram, Facebook',
      contentGoal: 'Product Launch Announcement',
      topic: 'Launch of AI-powered analytics dashboard for SMBs - no more spreadsheet chaos, insights in 60 seconds, affordable enterprise-grade analytics, free 14-day trial',
      brandVoice: 'Professional but approachable, data-driven, empowering small business owners',
      audience: 'Small business owners and marketing managers at companies with 10-100 employees who struggle with data analysis',
    },
  },

  'marketing-specialist-email-campaign-automation-suite': {
    skillId: 'marketing-specialist-email-campaign-automation-suite',
    defaultTestCaseId: 'email-campaign-default-1',
    description: 'Building onboarding email sequence',
    inputPayload: {
      campaignType: 'Onboarding/Welcome Series',
      emailCount: '7 emails',
      product: 'SaaS analytics dashboard with trial-to-paid conversion focus. Key actions: complete profile, connect data source, create first dashboard, invite team member, upgrade to paid.',
      audience: 'SaaS trial signups - marketing managers at mid-size companies who need data insights but lack technical skills',
      brand: 'DataPulse Analytics',
    },
  },

  'marketing-specialist-seo-content-optimizer-audit-tool': {
    skillId: 'marketing-specialist-seo-content-optimizer-audit-tool',
    defaultTestCaseId: 'seo-content-default-1',
    description: 'Optimizing blog post for search',
    inputPayload: {
      content: `Marketing Automation: A Complete Guide

Marketing automation helps businesses streamline their marketing efforts. In this guide, we cover everything you need to know about marketing automation.

What is Marketing Automation?
Marketing automation uses software to automate marketing tasks. It helps marketers save time and improve efficiency. Common uses include email marketing, social media posting, and lead nurturing.

Benefits of Marketing Automation:
1. Save time on repetitive tasks
2. Improve lead nurturing
3. Better customer segmentation
4. Increased ROI on marketing spend
5. More personalized customer experiences

[Current article is 2000 words and ranks on page 3 for target keywords]`,
      targetKeyword: 'marketing automation',
      contentType: 'Blog Post / Article',
      searchIntent: 'Informational',
      competitorUrls: 'HubSpot, Mailchimp, and ActiveCampaign rank for these terms on page 1',
    },
  },

  'marketing-specialist-campaign-performance-analyzer': {
    skillId: 'marketing-specialist-campaign-performance-analyzer',
    defaultTestCaseId: 'campaign-performance-default-1',
    description: 'Analyzing Q3 paid campaign performance',
    inputPayload: {
      campaignData: `Q3 2024 Paid Campaign Results:

Google Ads:
- Spend: $45,000
- Impressions: 2.5M
- Clicks: 35,000
- Conversions: 280
- Revenue attributed: $84,000

LinkedIn Ads:
- Spend: $25,000
- Impressions: 500K
- Clicks: 4,500
- Conversions: 45
- Revenue attributed: $67,500

Meta Ads:
- Spend: $15,000
- Impressions: 1.2M
- Clicks: 18,000
- Conversions: 95
- Revenue attributed: $28,500`,
      channel: 'Cross-Channel / Multi-Platform',
      campaignGoal: 'Lead Generation',
      goals: 'Target CAC: $250, Target ROAS: 3.0, MQL goal: 500',
    },
  },

  'marketing-specialist-content-calendar-strategy-planner': {
    skillId: 'marketing-specialist-content-calendar-strategy-planner',
    defaultTestCaseId: 'content-calendar-default-1',
    description: 'Planning Q1 content calendar',
    inputPayload: {
      duration: 'Quarterly (3 months)',
      channels: 'Blog, LinkedIn, YouTube, Newsletter (15K subscribers)',
      business: 'HR tech SaaS company focused on AI-powered workforce analytics. Target audience: HR directors and CHROs at mid-size companies. Differentiated by AI capabilities and ease of use.',
      goals: 'Increase organic traffic by 50%, generate 200 MQLs from content, establish thought leadership in AI for HR',
      contentPillars: 'AI in HR, Employee Experience, HR Analytics, Future of Work',
    },
  },

  'marketing-specialist-competitor-analysis-market-research': {
    skillId: 'marketing-specialist-competitor-analysis-market-research',
    defaultTestCaseId: 'competitor-analysis-default-1',
    description: 'Analyzing competitor positioning',
    inputPayload: {
      yourBusiness: 'AI-powered customer feedback analysis platform for mid-market SaaS companies. Key differentiators: AI-native, purpose-built for SaaS, integrates with product analytics, 10x faster insights.',
      competitors: 'Medallia, Qualtrics, SurveyMonkey, Typeform',
      industry: 'B2B SaaS / Customer Experience Software',
      researchFocus: 'Pricing strategy, feature comparison, messaging and positioning, market share, recent product launches',
    },
  },

  'marketing-specialist-a-b-test-conversion-optimizer': {
    skillId: 'marketing-specialist-a-b-test-conversion-optimizer',
    defaultTestCaseId: 'ab-test-default-1',
    description: 'Designing pricing page A/B test',
    inputPayload: {
      testType: 'Page Layout / Design',
      currentState: 'SaaS Pricing Page with 3 tiers ($29, $79, $199). Simple layout with feature comparison table. No social proof elements. Desktop and mobile responsive.',
      metrics: 'Current conversion rate: 2.3%, Bounce rate: 45%, Average time on page: 2.5 minutes, Monthly traffic: 10,000 visitors',
      audienceSize: '10,000 visitors/month',
      hypothesis: 'Adding a fourth enterprise tier and social proof (customer logos, testimonials) will increase both conversion rate and average deal size',
    },
  },

  'marketing-specialist-google-ads-campaign-builder': {
    skillId: 'marketing-specialist-google-ads-campaign-builder',
    defaultTestCaseId: 'google-ads-default-1',
    description: 'Building Google Ads campaign for SaaS product',
    inputPayload: {
      businessInfo: 'Project management software for creative agencies. Key features: visual project timelines, client collaboration, resource management, time tracking. Priced at $15/user/month.',
      campaignGoals: 'Generate demo requests at $150 CAC, 100 demos/month target, focus on high-intent keywords',
      targetAudience: 'Creative directors, agency owners, project managers at agencies with 10-100 employees in US, UK, Canada',
      budget: '$10,000/month',
      campaignType: 'Search + Display Remarketing',
    },
  },

  'marketing-specialist-meta-ads-campaign-builder': {
    skillId: 'marketing-specialist-meta-ads-campaign-builder',
    defaultTestCaseId: 'meta-ads-default-1',
    description: 'Building Meta retargeting campaign',
    inputPayload: {
      businessInfo: 'B2B SaaS project management tool targeting marketing teams. $29-199/month pricing. Main competitors: Monday.com, Asana, ClickUp.',
      campaignObjective: 'Conversions (sign-ups)',
      targetAudience: 'Retarget: Visited pricing page in last 30 days, did not sign up. US-based B2B decision makers, marketing managers, project managers.',
      budget: '$5,000/month',
      creativeCapabilities: 'Customer testimonial videos (3), product demo screenshots (10), case study graphics (5), team member faces available for ads',
      funnelStage: 'Bottom Funnel (retargeting/conversion)',
    },
  },

  'marketing-specialist-google-shopping-campaign-builder': {
    skillId: 'marketing-specialist-google-shopping-campaign-builder',
    defaultTestCaseId: 'google-shopping-default-1',
    description: 'Building Google Shopping campaign for e-commerce',
    inputPayload: {
      businessInfo: 'Premium office furniture e-commerce. Standing desks ($500-1500), ergonomic chairs ($400-1200). Premium positioning with 10-year warranty. Free shipping over $500.',
      productCatalog: '150 SKUs across 4 categories: standing desks, ergonomic chairs, desk accessories, monitor arms. Price range $300-$2000. Average margin 40%.',
      campaignGoals: 'Target ROAS 400%, scale to $50K/month in profitable spend, acquire new customers',
      budget: '$20,000/month',
      targetMarkets: 'United States (primary), Canada (secondary)',
      campaignType: 'Standard Shopping + Performance Max',
    },
  },

  'marketing-specialist-google-local-inventory-ads-builder': {
    skillId: 'marketing-specialist-google-local-inventory-ads-builder',
    defaultTestCaseId: 'local-inventory-default-1',
    description: 'Setting up Local Inventory Ads for retail chain',
    inputPayload: {
      businessInfo: 'Regional sporting goods retailer. 25 stores across California, Texas, and Florida. Average store size 15K sqft. Mix of national brands and private label.',
      storeLocations: '25 stores: 12 in California, 8 in Texas, 5 in Florida. High-traffic mall and strip center locations.',
      inventorySystem: 'Retail Pro POS syncing inventory hourly to Google Merchant Center via API integration',
      campaignGoals: 'Drive 500 monthly store visits, 10% increase in omnichannel revenue, reduce inventory aging',
      budget: '$15,000/month',
      fulfillmentOptions: 'In-store pickup, same-day delivery (metro areas), ship from store',
      storeVisitTracking: 'Yes, using Google store visit conversions',
    },
  },

  'marketing-specialist-linkedin-ads-campaign-builder': {
    skillId: 'marketing-specialist-linkedin-ads-campaign-builder',
    defaultTestCaseId: 'linkedin-ads-default-1',
    description: 'Building LinkedIn ABM campaign',
    inputPayload: {
      businessInfo: 'Enterprise cloud infrastructure company offering multi-cloud management platform. Average deal size $250K. 12-month sales cycle.',
      campaignGoals: 'Generate 50 MQLs from target accounts, achieve 3% engagement rate, build awareness with buying committee',
      targetAudience: '500 target accounts in Fortune 1000. Primary: CIO, CTO, VP of IT, Cloud Architects. Secondary: CFO, Procurement.',
      budget: '$15,000/month',
      campaignType: 'Sponsored Content + Message Ads',
    },
  },

  'marketing-specialist-podcast-youtube-script-generator': {
    skillId: 'marketing-specialist-podcast-youtube-script-generator',
    defaultTestCaseId: 'podcast-script-default-1',
    description: 'Creating podcast episode script',
    inputPayload: {
      topic: 'Building a Content Engine That Scales - Interview with VP of Marketing who grew organic traffic 10x in 2 years at a $100M ARR SaaS company',
      format: 'Interview (with guest)',
      audience: 'Marketing leaders at growth-stage SaaS companies (Series A-C) who are building content marketing programs',
      duration: '45-60 minutes',
      style: 'Educational / How-To',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MARKETING MANAGER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const MARKETING_MANAGER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'marketing-manager-integrated-marketing-strategy-builder': {
    skillId: 'marketing-manager-integrated-marketing-strategy-builder',
    defaultTestCaseId: 'marketing-strategy-default-1',
    description: 'Building annual marketing strategy',
    inputPayload: {
      product: 'AI-powered HR software platform with core modules for recruiting, onboarding, performance management, and people analytics. Key differentiators: AI features, ease of use, modern UX.',
      targetMarket: 'Mid-market companies (100-1000 employees) with growing HR teams. Primary buyers: HR Directors and CHROs. Industries: Tech, Professional Services, Healthcare.',
      budget: '$3M annual marketing budget (20% of target ARR)',
      timeline: 'Annual (12 months)',
      goals: 'Grow from $15M to $30M ARR, expand from SMB to mid-market, launch 2 new products, increase brand awareness by 50%',
      businessType: 'B2B SaaS',
    },
  },

  'marketing-manager-marketing-performance-intelligence': {
    skillId: 'marketing-manager-marketing-performance-intelligence',
    defaultTestCaseId: 'marketing-intelligence-default-1',
    description: 'Monthly marketing performance review',
    inputPayload: {
      metrics: `October 2024 Marketing Performance:

Pipeline Generated: $2.1M (target: $2.5M)
MQLs: 450 (target: 500)
SQLs: 180 (target: 200)
Marketing Influenced Revenue: $850K closed (target: $1M)

Channel Performance:
- Organic: 40% of MQLs, $0 CAC
- Paid Search: 25% of MQLs, $185 CAC
- LinkedIn: 15% of MQLs, $320 CAC
- Events: 10% of MQLs, $450 CAC
- Other: 10% of MQLs`,
      campaignType: 'Cross-Channel (multiple)',
      goals: 'Target CAC: $200, Pipeline target: $2.5M/month, MQL target: 500/month, ROAS target: 5x',
      timeframe: 'Monthly',
    },
  },

  'marketing-manager-content-marketing-calendar-generator': {
    skillId: 'marketing-manager-content-marketing-calendar-generator',
    defaultTestCaseId: 'content-marketing-default-1',
    description: 'Q1 content marketing calendar',
    inputPayload: {
      business: 'HR tech SaaS company ($15M ARR) targeting mid-market companies. Content drives 40% of pipeline. SEO is primary acquisition channel.',
      audience: 'HR Directors, CHROs, People Operations leaders at mid-market companies (100-1000 employees)',
      topics: 'HR Technology Trends, Employee Experience, People Analytics, Remote Work, AI in HR',
      timeframe: 'Quarterly (3 months)',
      channels: 'Blog (3x/week), LinkedIn (daily), Newsletter (weekly), YouTube (2x/month)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATIVE DIRECTOR SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const CREATIVE_DIRECTOR_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'creative-director-strategic-creative-brief-generator': {
    skillId: 'creative-director-strategic-creative-brief-generator',
    defaultTestCaseId: 'creative-brief-default-1',
    description: 'Creating brief for brand campaign',
    inputPayload: {
      project: 'Q1 Brand Awareness Campaign - "Work Smarter" - Hero video (60s, 30s, 15s cuts), print ads, digital banners, social content, OOH',
      businessContext: 'HR tech SaaS company looking to increase unaided brand awareness from 12% to 25% in target market. Challenger brand against Workday and BambooHR.',
      audienceInsight: 'HR leaders at mid-size companies (500-2000 employees) who are frustrated with legacy HR systems that feel like they were designed for IT, not people. They want modern tools that respect their time.',
      brandStrategy: 'Modern HR software that makes work feel less like work. Position as the human-first alternative to complex enterprise systems.',
    },
  },

  'creative-director-enterprise-brand-identity-system': {
    skillId: 'creative-director-enterprise-brand-identity-system',
    defaultTestCaseId: 'brand-identity-default-1',
    description: 'Developing brand identity system',
    inputPayload: {
      brandName: 'Elevate HR',
      brandPurpose: 'To humanize the workplace by giving HR teams the tools to focus on people, not paperwork. We believe every employee deserves an exceptional work experience.',
      positioning: 'The human-first HR platform that elevates the employee experience. Competitors: Workday (corporate, complex), BambooHR (casual, SMB), Gusto (friendly, payroll-focused).',
      targetAudience: 'HR professionals who believe people are a company\'s greatest asset',
    },
  },

  'creative-director-award-worthy-campaign-concept-engine': {
    skillId: 'creative-director-award-worthy-campaign-concept-engine',
    defaultTestCaseId: 'campaign-concept-default-1',
    description: 'Developing award-worthy campaign concept',
    inputPayload: {
      brief: 'Launch campaign for AI-powered recruiting feature that reduces time-to-hire by 50%. Budget: $500K production, $2M media. Must work globally. Targeting Cannes Lions, One Show, Clio Awards.',
      brandTruth: 'We believe hiring should be about finding the right person, not drowning in process. Our AI removes the tedious parts so recruiters can focus on human connection.',
      audienceInsight: 'Talent acquisition leaders at fast-growing tech companies are burned out from processing hundreds of applications. They got into recruiting to find great people, not to be data entry clerks.',
    },
  },

  'creative-director-creative-work-critique-feedback': {
    skillId: 'creative-director-creative-work-critique-feedback',
    defaultTestCaseId: 'creative-critique-default-1',
    description: 'Reviewing campaign creative work',
    inputPayload: {
      workDescription: 'Video ad for B2B software product. 30-second spot showing a stressed HR manager drowning in paperwork, then discovering our product and becoming calm and productive. Ends with product logo and tagline "HR Made Human."',
      brief: 'Show the transformation from chaos to clarity when using our HR platform. Target: HR managers at mid-size companies. Tone: Empowering, modern. Key message: Focus on people, not paperwork.',
      stage: 'Rough Cut / Draft',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT MANAGER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const PRODUCT_MANAGER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'product-manager-enterprise-prd-generator': {
    skillId: 'product-manager-enterprise-prd-generator',
    defaultTestCaseId: 'prd-default-1',
    description: 'Creating PRD for AI features',
    inputPayload: {
      feature: 'AI-Powered Resume Screening',
      problem: 'Recruiters spend 23 hours per week screening resumes. 88% of resumes received are unqualified. This creates bottlenecks, delays hiring by 2-3 weeks, and causes recruiter burnout.',
      userResearch: `Key findings from 12 recruiter interviews:
- Average time to screen one resume: 7 minutes
- 65% of time spent on clearly unqualified candidates
- Top request: "Just show me the good ones first"
- Fear: Missing a great candidate in the pile
Survey (n=200): 78% would pay extra for AI screening if it maintained quality`,
      solution: 'AI-powered resume screening that automatically scores and ranks candidates based on job requirements. Shows explainable match scores with highlighted qualifications. Flags potential concerns. Learns from recruiter feedback.',
      audience: 'Engineering team, Design team, Legal review, Executive stakeholders',
    },
  },

  'product-manager-user-research-synthesis-engine': {
    skillId: 'product-manager-user-research-synthesis-engine',
    defaultTestCaseId: 'research-synthesis-default-1',
    description: 'Synthesizing user interview findings',
    inputPayload: {
      researchData: `Interview 1 (HR Manager, 500-person company): "Onboarding is chaos. New hires don't know where to go for information. IT tickets take days."

Interview 2 (New Hire, Week 2): "I still don't have access to half the systems I need. My manager has been too busy to meet with me."

Interview 3 (Department Head): "I spend 20% of my time onboarding people. There's no standard process."

Survey Results (n=150): 65% rate onboarding as "poor" or "very poor". Top issues: system access (78%), unclear expectations (65%), lack of manager time (54%).`,
      researchGoal: 'Understand pain points in the employee onboarding experience to inform major product investment decision',
      researchType: 'Discovery (understanding problems/needs)',
    },
  },

  'product-manager-strategic-feature-prioritization': {
    skillId: 'product-manager-strategic-feature-prioritization',
    defaultTestCaseId: 'feature-prioritization-default-1',
    description: 'Prioritizing product roadmap features',
    inputPayload: {
      features: `1. AI Resume Screening (Large - 3 months)
2. Advanced Reporting Dashboard (Medium - 6 weeks)
3. Mobile App Redesign (Large - 4 months)
4. Slack Integration (Small - 2 weeks)
5. Bulk Data Import Tool (Medium - 4 weeks)
6. SSO/SAML Support (Medium - 6 weeks)
7. Custom Workflows Builder (Large - 5 months)
8. API Rate Limit Increase (Small - 1 week)`,
      framework: 'RICE (Reach, Impact, Confidence, Effort)',
      context: 'Moving upmarket to enterprise. Current ARR $10M, target $25M in 2 years. Enterprise deals require SSO and advanced reporting. Sales (wants SSO urgently), CS (wants bulk import), CEO (wants AI features for differentiation). Q1 engineering capacity: ~16 weeks.',
    },
  },

  'product-manager-competitive-intelligence-report': {
    skillId: 'product-manager-competitive-intelligence-report',
    defaultTestCaseId: 'competitive-intel-default-1',
    description: 'Competitive analysis report',
    inputPayload: {
      yourProduct: 'Mid-market HR platform with core HR, payroll, and benefits administration. $10M ARR, 500 customers.',
      competitors: 'Rippling, Gusto, Paylocity, Paycom',
      focus: 'Feature Comparison',
      goal: 'Q4 planning - need to inform 2025 roadmap decisions. Specifically: Where are we losing deals? What features do competitors have that we lack? What is their AI strategy?',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA ANALYST SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const DATA_ANALYST_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'data-analyst-advanced-sql-query-generator': {
    skillId: 'data-analyst-advanced-sql-query-generator',
    defaultTestCaseId: 'sql-query-default-1',
    description: 'Building customer cohort analysis query',
    inputPayload: {
      question: 'Analyze customer retention by signup cohort and identify which features drive retention',
      schema: `users (user_id, signup_date, plan_type, industry, company_size)
subscriptions (subscription_id, user_id, start_date, end_date, mrr, status)
feature_usage (user_id, feature_name, usage_date, usage_count)
events (user_id, event_name, event_date, properties)`,
      sampleData: 'User 1001: signed up 2024-01-15, Professional plan, SaaS industry; Subscription active since signup, $299 MRR; Used dashboard feature 45 times in Jan',
      dialect: 'PostgreSQL',
      queryType: 'Aggregation with Window Functions',
      performance: 'Query will run on 5M+ rows, needs to complete in < 30 seconds',
    },
  },

  'data-analyst-executive-data-analysis-report': {
    skillId: 'data-analyst-executive-data-analysis-report',
    defaultTestCaseId: 'data-report-default-1',
    description: 'Creating executive KPI report',
    inputPayload: {
      data: `Revenue: $1.2M (up 15% MoM)
Customers: 850 (up 8% MoM)
Churn: 3.2% (down from 4.1%)
NPS: 42 (up from 38)
CAC: $1,200 (down from $1,450)
LTV: $18,000
LTV:CAC: 15:1`,
      question: 'What are the key business insights and trends for the monthly board meeting?',
      context: 'Q4 planning season, board expects growth acceleration narrative, previous quarter missed targets by 5%',
      audience: 'Board of Directors and CEO',
      analysisType: 'Executive Summary',
      urgency: 'Board meeting in 3 days',
    },
  },

  'data-analyst-bi-dashboard-architect': {
    skillId: 'data-analyst-bi-dashboard-architect',
    defaultTestCaseId: 'bi-dashboard-default-1',
    description: 'Designing sales performance dashboard',
    inputPayload: {
      purpose: 'Real-time sales team performance tracking for VP of Sales',
      audience: 'VP Sales (executive view), Sales Managers (team view), Sales Reps (individual view)',
      data: 'Salesforce CRM via Fivetran to Snowflake - Opportunities, Activities, Accounts, Users tables',
      kpis: 'Pipeline value, conversion rates by stage, rep performance, forecast accuracy, activity metrics',
      tool: 'Looker',
      complexity: 'Advanced - include drill-downs, alerts, and predictive elements',
    },
  },

  'data-analyst-data-quality-auditor': {
    skillId: 'data-analyst-data-quality-auditor',
    defaultTestCaseId: 'data-quality-default-1',
    description: 'Auditing CRM data quality',
    inputPayload: {
      dataProfile: 'Salesforce CRM - Accounts (50K records), Contacts (150K records), Opportunities (25K records)',
      context: 'Duplicate accounts suspected, missing contact emails, inconsistent industry coding',
      critical: 'Marketing campaigns have 20% bounce rate, sales territories incorrectly assigned',
      dataType: 'CRM Master Data',
      regulations: 'GDPR compliance required for EU contacts',
    },
  },

  'data-analyst-a-b-test-statistical-analyzer': {
    skillId: 'data-analyst-a-b-test-statistical-analyzer',
    defaultTestCaseId: 'ab-test-analyzer-default-1',
    description: 'Analyzing pricing page A/B test results',
    inputPayload: {
      testData: `Control (Current):
- Visitors: 15,000
- Conversions: 345
- Revenue: $52,000

Variant (New):
- Visitors: 15,200
- Conversions: 402
- Revenue: $58,500`,
      hypothesis: 'Simplified 3-tier pricing will increase conversion rate by reducing decision paralysis',
      testDuration: '28 days',
      primaryMetric: 'Conversion rate',
      secondaryMetrics: 'Revenue per visitor, average deal size',
      mde: '10% relative improvement (from 2.3% to 2.53% conversion)',
    },
  },

  'data-analyst-insight-pack-generator': {
    skillId: 'data-analyst-insight-pack-generator',
    defaultTestCaseId: 'insight-pack-default-1',
    description: 'Creating weekly insights pack',
    inputPayload: {
      analysisGoal: 'Weekly business insights pack highlighting key trends and anomalies',
      dataSample: 'Feature X adoption dropped 15%, Enterprise segment NPS up 8 points, 3 accounts showing churn signals',
      dataDescription: 'Product usage, customer health, revenue metrics for the past week across 850 active accounts',
      audience: 'Product, Customer Success, and Executive leadership',
      visualPreferences: 'Slide deck with key insights, supporting data, and recommended actions',
      guardrails: 'Focus on actionable insights. Max 10 slides. Include confidence levels.',
    },
  },

  'data-analyst-data-quality-sla-monitor': {
    skillId: 'data-analyst-data-quality-sla-monitor',
    defaultTestCaseId: 'data-sla-default-1',
    description: 'Setting up data quality monitoring',
    inputPayload: {
      dataSource: 'Salesforce → Fivetran → Snowflake → Looker pipeline',
      dataSchema: 'dim_customers, dim_products, fact_orders, fact_usage_events',
      businessCriticality: 'High - powers executive dashboards and sales compensation calculations',
      knownIssues: 'Occasional Fivetran sync delays, NULL values in fact_usage_events.user_id',
      stakeholders: 'Data consumers in Sales, Marketing, Finance, and Product',
      refreshFrequency: 'Hourly for facts, daily for dimensions',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT MANAGER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const PROJECT_MANAGER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'project-manager-project-plan-generator': {
    skillId: 'project-manager-project-plan-generator',
    defaultTestCaseId: 'project-plan-default-1',
    description: 'Creating website redesign project plan',
    inputPayload: {
      project: 'Corporate Website Redesign - Modernize brand presence, improve conversion rate from 1.5% to 3%, enhance mobile experience',
      deliverables: 'Full redesign of 50+ page corporate website including new CMS implementation, responsive design, SEO migration',
      timeline: 'Must launch before annual conference in 16 weeks',
      team: 'Project manager, 2 designers, 3 developers, content writer, SEO specialist',
      budget: '$150,000 total budget',
      methodology: 'Agile/Scrum',
      complexity: 'High - multiple stakeholder groups, legacy content migration, SEO preservation',
    },
  },

  'project-manager-risk-assessment-matrix': {
    skillId: 'project-manager-risk-assessment-matrix',
    defaultTestCaseId: 'risk-matrix-default-1',
    description: 'Creating risk assessment for ERP implementation',
    inputPayload: {
      project: 'NetSuite ERP implementation replacing legacy accounting system. $500K budget, 9-month timeline.',
      knownRisks: 'Data migration complexity, user adoption resistance, integration with existing CRM, vendor resource availability',
      constraints: 'Go-live must align with fiscal year end, limited IT staff availability during Q4 close',
      industry: 'Financial Services',
      riskAppetite: 'Low - critical business system, cannot afford extended downtime',
    },
  },

  'project-manager-executive-status-report-generator': {
    skillId: 'project-manager-executive-status-report-generator',
    defaultTestCaseId: 'status-report-default-1',
    description: 'Creating executive project status report',
    inputPayload: {
      projectName: 'Cloud Migration Initiative',
      reportingPeriod: 'Week ending December 20, 2024',
      progress: 'Phase 2 of 4, 2 weeks behind schedule due to security compliance requirements. Completed infrastructure setup, migrated 15 of 45 applications.',
      metrics: 'Budget: 65% spent, Schedule: 2 weeks behind, Quality: 0 critical defects, Scope: On track',
      issues: 'Vendor delays on integration component, potential budget overrun of 10%',
      nextSteps: 'Database migration (Week 3), User acceptance testing (Week 5)',
      escalations: 'Need approval for $50K additional budget for security tooling',
      audience: 'Steering Committee and Executive Sponsors',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UX DESIGNER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const UX_DESIGNER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'ux-designer-ux-content-design-system': {
    skillId: 'ux-designer-ux-content-design-system',
    defaultTestCaseId: 'ux-content-default-1',
    description: 'Creating UX copy for checkout flow',
    inputPayload: {
      context: 'E-commerce checkout flow with 4 steps: Cart Review, Shipping Address, Payment Method, Order Confirmation. Users frequently abandon at payment step. Need to reduce anxiety and build trust.',
      copyType: 'Full Screen/Flow Copy',
      brandVoice: 'Friendly and reassuring, never pushy. We speak like a helpful friend who works in retail - knowledgeable but not condescending. Use "you/your" language.',
      userContext: 'Shoppers who have items in cart, mix of first-time and returning customers. May be anxious about security when entering payment info.',
      constraints: 'Primary CTA buttons max 20 characters. Error messages must be actionable. Must work for mobile (shorter viewport).',
    },
  },

  'ux-designer-research-based-persona-builder': {
    skillId: 'ux-designer-research-based-persona-builder',
    defaultTestCaseId: 'persona-builder-default-1',
    description: 'Building personas for B2B project management tool',
    inputPayload: {
      product: 'Cloud-based project management tool for marketing teams. Features include campaign tracking, asset management, team collaboration, and client reporting.',
      userInfo: `Interview findings:
- Marketing managers (n=12): Struggle with visibility across campaigns, spend 5+ hours/week on status reports
- Creative directors (n=8): Need faster asset approval workflows, frustrated by email chains
- Agency account managers (n=6): Want client-facing dashboards, tired of manual report creation
Survey (n=150): 78% cite "lack of visibility" as top pain point, 65% use 3+ tools for project tracking`,
      businessContext: 'Series A startup, $5M ARR, competing against Monday.com and Asana. Differentiator is marketing-specific features.',
      personaCount: '3 Personas (Full Set)',
      framework: 'Jobs-to-be-Done Focus',
    },
  },

  'ux-designer-usability-research-protocol-builder': {
    skillId: 'ux-designer-usability-research-protocol-builder',
    defaultTestCaseId: 'usability-protocol-default-1',
    description: 'Creating usability test for mobile banking app',
    inputPayload: {
      product: 'Mobile banking app redesign - new navigation structure, updated money transfer flow, and new budgeting feature. High-fidelity Figma prototype with limited interactivity.',
      goals: '1. Can users successfully transfer money to a new recipient? 2. Do users understand the new navigation categories? 3. Is the budgeting feature discoverable? 4. What is the perceived trustworthiness of the new design?',
      participants: 'Current mobile banking users aged 25-55 who transfer money at least once per month. Mix of tech-savvy and tech-hesitant. Exclude banking/fintech employees.',
      testType: 'Moderated Remote (Zoom/Teams)',
      duration: '45 minutes',
    },
  },

  'ux-designer-ux-heuristic-evaluation': {
    skillId: 'ux-designer-ux-heuristic-evaluation',
    defaultTestCaseId: 'heuristic-eval-default-1',
    description: 'Evaluating SaaS dashboard design',
    inputPayload: {
      design: `Analytics dashboard for SaaS product:
- Left sidebar navigation with 12 menu items, no grouping
- Main area shows 8 data widgets in 2x4 grid
- Date range picker in top right (defaults to "Last 30 days")
- No loading states visible in prototype
- Color-coded metrics (red/yellow/green) without legend
- Small text (12px) throughout
- Export button buried in overflow menu (...)
- No keyboard shortcuts visible
- Mobile version just stacks desktop layout vertically`,
      context: 'B2B SaaS product for marketing analytics. Users are marketing managers who check dashboard daily. Primary task is identifying campaign performance issues.',
      focus: 'Full Heuristic Evaluation',
      platform: 'Web (Responsive)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SALES REPRESENTATIVE SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const SALES_REPRESENTATIVE_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'sales-representative-multi-touch-outreach-sequence-builder': {
    skillId: 'sales-representative-multi-touch-outreach-sequence-builder',
    defaultTestCaseId: 'outreach-sequence-default-1',
    description: 'Building outreach sequence for enterprise prospects',
    inputPayload: {
      prospect: 'VP of Engineering at mid-market SaaS companies (200-1000 employees). Pain points: developer productivity, technical debt, hiring challenges.',
      product: 'Developer productivity platform that reduces code review time by 50% and automates documentation. $50K-200K ACV.',
      icp: 'Mid-market SaaS companies, 200-1000 employees, Series B+, engineering teams of 20-100',
      channel: 'Email, LinkedIn, Phone',
      cta: 'Book a 15-minute demo to see how we reduced code review time by 50% for similar companies',
      sequenceLength: '8 touches over 21 days',
    },
  },

  'sales-representative-sales-objection-mastery-playbook': {
    skillId: 'sales-representative-sales-objection-mastery-playbook',
    defaultTestCaseId: 'objection-playbook-default-1',
    description: 'Creating objection handling playbook',
    inputPayload: {
      objection: 'We already have CrowdStrike and are not looking to switch security vendors right now.',
      context: 'Mid-funnel (discovery completed, entering evaluation). CISO mentioned recent board pressure on security posture.',
      product: 'Enterprise cybersecurity platform - endpoint detection and response (EDR) with AI-powered threat hunting.',
      competitor: 'CrowdStrike, SentinelOne, Microsoft Defender. Our edge: better AI detection, lower false positives, included MDR service.',
      dealSize: '$100K-500K annual deal',
    },
  },

  'sales-representative-enterprise-sales-proposal-generator': {
    skillId: 'sales-representative-enterprise-sales-proposal-generator',
    defaultTestCaseId: 'sales-proposal-default-1',
    description: 'Generating enterprise software proposal',
    inputPayload: {
      client: 'Global manufacturing company with 15 distribution centers, $2B annual logistics spend. Decision by end of Q1, go-live needed by June.',
      discovery: `Must-haves: Real-time shipment tracking, carrier performance analytics, exception management
Nice-to-haves: Predictive ETAs, carbon footprint tracking, supplier portal
Integration: SAP S/4HANA, existing TMS (Oracle)`,
      solution: 'Supply chain visibility platform with real-time tracking, predictive analytics, and native SAP integration',
      pricing: '3-year deal, $450K ARR, implementation services $150K',
      competition: 'Also evaluating project44 and FourKites. We won on carrier network breadth and SAP integration.',
      proposalType: 'Enterprise',
    },
  },

  'sales-representative-discovery-call-preparation': {
    skillId: 'sales-representative-discovery-call-preparation',
    defaultTestCaseId: 'discovery-prep-default-1',
    description: 'Preparing for enterprise discovery call',
    inputPayload: {
      prospect: 'Regional healthcare system with 12 hospitals, 50+ clinics. $3B annual revenue. Recently announced digital transformation initiative.',
      source: 'Inbound from website (downloaded ROI calculator). Contact is VP of Digital Health.',
      product: 'Patient engagement platform - appointment scheduling, telehealth, patient portal, care coordination. Focus on reducing no-shows and improving patient satisfaction.',
      framework: 'MEDDIC',
      callLength: '30 minutes (CIO may join for last 10 minutes)',
    },
  },

  'sales-representative-target-account-intelligence-research': {
    skillId: 'sales-representative-target-account-intelligence-research',
    defaultTestCaseId: 'account-research-default-1',
    description: 'Researching target enterprise account',
    inputPayload: {
      company: 'Acme Financial Services',
      companyInfo: 'Mid-size regional bank, $50B in assets, 200 branches across 5 states. Posted job for "Digital Transformation Lead" last month. Mobile app has 2.3 stars with complaints about account opening.',
      contacts: 'Target: VP Digital Banking, CTO, Head of Retail Banking',
      yourSolution: 'Digital account opening platform that reduces time-to-fund from 5 days to same-day. Includes identity verification, fraud detection, and compliance automation.',
      objective: 'Identify key decision makers, understand their digital banking strategy, find pain points and trigger events',
      dealSize: '$200K-400K ARR',
    },
  },

  'sales-representative-value-proposition-roi-calculator-generator': {
    skillId: 'sales-representative-value-proposition-roi-calculator-generator',
    defaultTestCaseId: 'roi-calculator-default-1',
    description: 'Building ROI calculator for prospect',
    inputPayload: {
      product: 'AI-powered accounts payable automation. Automates invoice processing, approval workflows, and payment execution.',
      prospect: 'Mid-market manufacturer processing 5,000 invoices/month. 3 FTEs in AP department.',
      identifiedNeeds: '1. Labor savings from automation, 2. Early payment discounts captured, 3. Reduced duplicate payments, 4. Faster close cycle, 5. Audit cost reduction',
      dealSize: '$3 per invoice processed + $500/month platform fee (~$16K/month)',
      competitiveLandscape: 'Competing against Tipalti and Bill.com. Differentiator is manufacturing-specific integrations.',
    },
  },

  'sales-representative-deal-strategy-next-steps-planner': {
    skillId: 'sales-representative-deal-strategy-next-steps-planner',
    defaultTestCaseId: 'deal-strategy-default-1',
    description: 'Planning strategy for complex enterprise deal',
    inputPayload: {
      account: 'Fortune 500 retailer evaluating workforce management platform. $800K ARR opportunity.',
      currentStage: 'Technical validation complete, entering procurement. Our quarter ends in 6 weeks.',
      stakeholders: 'Champion: VP Store Operations (strong supporter). Economic Buyer: COO (met once, positive). Blockers: IT Security (cloud concerns), Procurement (40% discount push).',
      dealContext: 'They want to pilot in Q2, full rollout before holiday season. Incumbent is legacy on-prem solution.',
      keyInsights: 'Security review not scheduled yet. No executive sponsor meeting confirmed. Legal terms not discussed. Also talking to Workday and UKG.',
      proposalSummary: 'Full workforce management suite with predictive scheduling, labor forecasting, and mobile time tracking for all 500+ locations.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HR PROFESSIONAL SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const HR_PROFESSIONAL_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'hr-professional-inclusive-job-description-generator': {
    skillId: 'hr-professional-inclusive-job-description-generator',
    defaultTestCaseId: 'job-desc-default-1',
    description: 'Creating inclusive senior engineer job description',
    inputPayload: {
      jobTitle: 'Senior Software Engineer - Platform Team',
      department: 'Engineering',
      level: 'Senior (IC4)',
      requirements: '5+ years software engineering experience, strong in Python or Go, experience with distributed systems, familiarity with cloud platforms (AWS/GCP)',
      responsibilities: 'Design and build core platform services, mentor junior engineers, lead technical projects, participate in on-call rotation, contribute to architecture decisions',
      companyInfo: 'Series C startup, 200 employees, remote-first, building B2B SaaS for financial services',
      compensation: '$180,000 - $220,000 base + equity + benefits',
    },
  },

  'hr-professional-structured-interview-system': {
    skillId: 'hr-professional-structured-interview-system',
    defaultTestCaseId: 'interview-system-default-1',
    description: 'Designing interview process for product manager role',
    inputPayload: {
      role: 'Senior Product Manager - Growth',
      level: 'Senior (L5)',
      competencies: 'Data-driven decision making, experimentation mindset, cross-functional leadership, customer empathy, strategic thinking',
      interviewType: 'Full Loop (5 stages)',
      teamContext: 'Growth team of 2 PMs, 8 engineers, 2 designers. Reports to VP Product. Focus on user acquisition and activation.',
    },
  },

  'hr-professional-hr-policy-handbook-generator': {
    skillId: 'hr-professional-hr-policy-handbook-generator',
    defaultTestCaseId: 'hr-policy-default-1',
    description: 'Creating remote work policy',
    inputPayload: {
      policyType: 'Remote & Hybrid Work Policy',
      companyContext: 'Tech company, 500 employees, headquarters in Austin TX, employees in 30 states. Moving from fully remote to hybrid model.',
      jurisdiction: 'Multi-state (30 states), with specific compliance requirements for CA and NY',
      specificRequirements: `Must address:
- Who is eligible for remote vs hybrid vs in-office
- Core collaboration hours
- Home office requirements and stipend
- In-office expectations for hybrid employees
- Travel requirements for remote employees
- Equipment and expense policies`,
    },
  },

  'hr-professional-performance-review-system': {
    skillId: 'hr-professional-performance-review-system',
    defaultTestCaseId: 'perf-review-default-1',
    description: 'Redesigning performance management system',
    inputPayload: {
      employeeInfo: 'Sarah Chen, Senior Software Engineer, Platform Team, 2.5 years tenure',
      reviewPeriod: 'H2 2024 (July - December)',
      accomplishments: 'Led migration to Kubernetes reducing infrastructure costs 40%. Mentored 2 junior engineers. Shipped 3 major features on time.',
      challenges: 'Initial delays on payment processing project due to unclear requirements. Communication gaps with product team.',
      reviewType: 'Semi-annual performance review',
      goals: 'Technical lead role by Q2 2025. Improve cross-team communication. Complete system design certification.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL ANALYST SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const FINANCIAL_ANALYST_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'financial-analyst-enterprise-financial-analysis-engine': {
    skillId: 'financial-analyst-enterprise-financial-analysis-engine',
    defaultTestCaseId: 'financial-analysis-default-1',
    description: 'Analyzing quarterly financial performance',
    inputPayload: {
      financialData: `Q3 2024 vs Q3 2023:
Revenue: $45M vs $38M (+18%)
Gross Margin: 68% vs 71% (-3pp)
Operating Expenses: $28M vs $22M (+27%)
EBITDA: $8M vs $9M (-11%)
Cash: $25M vs $35M
ARR: $180M vs $145M (+24%)
Net Revenue Retention: 112%`,
      company: 'Series C SaaS company targeting profitability by Q2 next year',
      analysisType: 'Quarterly Performance Review',
      focusAreas: 'Gross margin compression, path to profitability, operating expense efficiency',
      benchmarks: 'SaaS Capital benchmarks for $150-200M ARR companies',
    },
  },

  'financial-analyst-fp-a-budget-intelligence-system': {
    skillId: 'financial-analyst-fp-a-budget-intelligence-system',
    defaultTestCaseId: 'budget-intel-default-1',
    description: 'Building annual budget model',
    inputPayload: {
      budgetData: `FY2025 Targets:
Revenue: $225M (35% growth)
Gross Margin: 70%
S&M: $80M (36% of revenue)
R&D: $55M (24% of revenue)
G&A: $28M (12% of revenue)`,
      period: 'FY2025 Annual Budget',
      businessContext: 'Revenue growth target: 35%. Hiring to resume Q2. New product launch in Q3. Price increase of 5% on renewals.',
      priorPeriod: `FY2024 Actuals: Revenue $165M (92% attainment), GM 69%, Headcount 450`,
      analysisDepth: 'Detailed with monthly breakdown and 2 scenarios (base and downside)',
    },
  },

  'financial-analyst-financial-modeling-architect': {
    skillId: 'financial-analyst-financial-modeling-architect',
    defaultTestCaseId: 'financial-model-default-1',
    description: 'Building 3-statement financial model',
    inputPayload: {
      modelPurpose: 'Series B fundraise - investor-ready 3-statement model',
      modelScope: 'B2B SaaS vertical software for restaurants. Current ARR $8M, 500 customers, $15K ACV. 5-year projections (2025-2029)',
      assumptions: 'Revenue CAGR 80%. Gross margin improving from 60% to 72%. CAC payback 15 months. Net retention 115%.',
      outputType: 'Full 3-Statement Model (P&L, Balance Sheet, Cash Flow)',
      standards: 'GAAP-compliant with SaaS metrics overlay',
    },
  },

  'financial-analyst-investment-valuation-analyst': {
    skillId: 'financial-analyst-investment-valuation-analyst',
    defaultTestCaseId: 'valuation-default-1',
    description: 'Performing company valuation analysis',
    inputPayload: {
      company: 'Restaurant tech SaaS company seeking Series B',
      financials: `Current ARR: $12M, growing 100% YoY
Gross Margin: 75%
Net Revenue Retention: 125%
CAC Payback: 18 months
Burn: $800K/month
Runway: 14 months`,
      purpose: 'Determine fair valuation range for $30M Series B raise',
      comparables: 'Toast, Lightspeed, Olo (restaurant tech sector)',
      assumptions: 'Revenue multiples 15-25x for high-growth vertical SaaS. Comparable transactions in restaurant tech at 20x forward ARR.',
    },
  },

  'financial-analyst-pipeline-health-analyzer': {
    skillId: 'financial-analyst-pipeline-health-analyzer',
    defaultTestCaseId: 'pipeline-health-default-1',
    description: 'Analyzing sales pipeline health',
    inputPayload: {
      pipelineData: `Current Pipeline: $15M weighted
Stage breakdown:
- Discovery: $8M (10% probability)
- Evaluation: $4M (30% probability)
- Negotiation: $2M (60% probability)
- Verbal Commit: $1M (90% probability)

Q4 Quota: $5M
Current Q4 Closed: $1.2M`,
      teamStructure: '8 AEs (6 ramped, 2 ramping), 2 Sales Managers, 1 VP Sales',
      salesProcess: 'Discovery→Evaluation→Negotiation→Verbal Commit→Closed. Historical conversion: Discovery→Close 15%, Eval→Close 35%',
      analysisTimeframe: 'Q4 2024, 45 days remaining',
    },
  },

  'financial-analyst-sales-forecast-optimizer': {
    skillId: 'financial-analyst-sales-forecast-optimizer',
    defaultTestCaseId: 'sales-forecast-default-1',
    description: 'Building sales forecast model',
    inputPayload: {
      currentPipeline: '$12M total pipeline, $4.5M weighted. 8 AEs, average quota $500K/quarter, average attainment 85%.',
      historicalData: 'Q1 is historically weakest (80% of average quarter). January slow due to holidays. New product launching Feb 1.',
      targets: '$4M target for Q1 2025',
      forecastPeriod: 'Q1 2025',
      forecastType: 'Bottoms-up by AE with pipeline-based probability weighting',
    },
  },

  'financial-analyst-win-loss-analysis-generator': {
    skillId: 'financial-analyst-win-loss-analysis-generator',
    defaultTestCaseId: 'win-loss-default-1',
    description: 'Analyzing Q3 win/loss patterns',
    inputPayload: {
      dealData: `Q3 2024 Results:
Wins (45 deals, $2.8M): Avg deal $62K, 45-day cycle, Mid-market 70%/Enterprise 30%
Losses (30 deals, $2.1M): Avg deal $70K, 65-day cycle
Win rate dropped from 62% to 60%.`,
      analysisScope: 'Q3 2024 closed deals with focus on enterprise segment concerns',
      competitorInfo: 'Lost to: Competitor A (40%), No decision (35%), Competitor B (15%). Top loss reasons: Missing features (45%), price (30%), implementation concerns (25%)',
      salesProcess: 'Discovery→Demo→Technical Validation→Negotiation→Close. Average 45 days for wins, 65 days for losses.',
    },
  },

  'financial-analyst-revenue-process-bottleneck-finder': {
    skillId: 'financial-analyst-revenue-process-bottleneck-finder',
    defaultTestCaseId: 'bottleneck-finder-default-1',
    description: 'Finding revenue process inefficiencies',
    inputPayload: {
      processDescription: `Lead-to-cash full cycle:
Lead to MQL: 3 days → MQL to SQL: 5 days → SQL to Opportunity: 2 days → Opportunity to Close: 45 days → Close to Contract: 8 days → Contract to Go-Live: 21 days → Go-Live to Invoice: 5 days`,
      painPoints: 'Legal review takes too long. Deals often stall after technical win. Implementation backlog growing.',
      systems: 'Salesforce CRM, Marketo, DocuSign, Jira, NetSuite',
      teamMetrics: 'Sales: 8 AEs, Legal: 1 contract manager, Impl: 4 consultants. Industry average cycle 35 days, our target 40 days.',
      priority: 'Reduce overall deal cycle by 20% while maintaining quality',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT WRITER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const CONTENT_WRITER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'content-writer-professional-blog-post-generator': {
    skillId: 'content-writer-professional-blog-post-generator',
    defaultTestCaseId: 'blog-post-default-1',
    description: 'Writing thought leadership blog post',
    inputPayload: {
      topic: 'The Future of AI in Customer Service: Beyond Chatbots',
      audience: 'Customer service leaders at mid-market and enterprise companies',
      tone: 'Authoritative but accessible, forward-looking, backed by data',
      keyPoints: '1. AI is augmenting agents, not replacing them. 2. Predictive service is the next frontier. 3. Personalization at scale is now possible. 4. Implementation challenges.',
      targetKeyword: 'AI customer service automation',
      wordCount: '2000-2500',
      contentGoal: 'Thought leadership to establish authority and drive demo requests',
    },
  },

  'content-writer-content-strategy-brief-generator': {
    skillId: 'content-writer-content-strategy-brief-generator',
    defaultTestCaseId: 'content-strategy-default-1',
    description: 'Creating content strategy for product launch',
    inputPayload: {
      contentTopic: 'New AI analytics feature launch',
      contentType: 'Product Launch Campaign',
      businessGoals: 'Generate 500 qualified leads in first 60 days, establish thought leadership in AI analytics space',
      audience: 'Data analysts and analytics managers at companies with 100-1000 employees',
    },
  },

  'content-writer-content-atomization-repurposing-engine': {
    skillId: 'content-writer-content-atomization-repurposing-engine',
    defaultTestCaseId: 'atomization-default-1',
    description: 'Repurposing whitepaper into multi-format content',
    inputPayload: {
      originalContent: 'Whitepaper: "The State of Marketing Analytics 2025" - 25 pages covering trends, benchmarks, and best practices in marketing measurement',
      contentType: 'Whitepaper / Research Report',
      targetPlatforms: 'Blog, LinkedIn, email newsletter, infographics, podcast',
      brandVoice: 'Professional, data-driven, authoritative yet accessible. B2B marketing audience.',
    },
  },

  'content-writer-copywriting-formula-generator': {
    skillId: 'content-writer-copywriting-formula-generator',
    defaultTestCaseId: 'copywriting-default-1',
    description: 'Writing landing page copy',
    inputPayload: {
      copyType: 'Product landing page',
      product: 'AI-powered proposal software that helps sales teams create winning proposals 10x faster',
      audience: 'Sales leaders and revenue ops at B2B companies frustrated with slow, inconsistent proposals',
      framework: 'PAS (Problem-Agitation-Solution)',
      desiredAction: 'Start free trial',
      constraints: 'Hero section needs headline + subhead + CTA. Keep benefit sections scannable.',
    },
  },

  'content-writer-content-editing-style-guide-enforcer': {
    skillId: 'content-writer-content-editing-style-guide-enforcer',
    defaultTestCaseId: 'style-guide-default-1',
    description: 'Editing content to match brand style guide',
    inputPayload: {
      draftContent: `Our software is the best solution for managing your company's data. We have been in business for over 10 years and have lots of customers who love us. Click here to learn more about our amazing product features. Our team of experts will help you every step of the way!!!`,
      contentType: 'Homepage Hero Section',
      editingFocus: 'Voice, tone, and brand compliance',
      styleGuide: `Voice: Confident but not arrogant. Show, don't tell.
Avoid: Superlatives (best, amazing), exclamation marks, "click here", passive voice
Prefer: Specific proof points, active voice, customer benefit focus`,
    },
  },

  'content-writer-ai-optimized-content-geo-aeo-': {
    skillId: 'content-writer-ai-optimized-content-geo-aeo-',
    defaultTestCaseId: 'geo-aeo-default-1',
    description: 'Creating AI-optimized content for search',
    inputPayload: {
      topic: 'How to choose the right CRM for your small business',
      targetQueries: 'best CRM for small business, CRM comparison, how to choose CRM',
      contentType: 'Comprehensive guide',
      audience: 'Small business owners and operators evaluating CRM solutions',
      expertise: 'CRM implementation consultants with 10+ years advising SMBs on sales technology',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMER SUCCESS MANAGER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const CUSTOMER_SUCCESS_MANAGER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'customer-success-manager-customer-health-score-analyzer': {
    skillId: 'customer-success-manager-customer-health-score-analyzer',
    defaultTestCaseId: 'health-score-default-1',
    description: 'Analyzing customer health score trends',
    inputPayload: {
      customerData: `Product Usage: 45% DAU/MAU (down from 62% last quarter)
Support Tickets: 8 this month (up from 3)
NPS Response: Detractor (score 4, was Promoter at 9)
Feature Adoption: Core features 85%, new features 15%
Executive Engagement: No exec meeting in 6 months`,
      accountInfo: 'TechCorp Industries - $150K ARR, renews in 4 months',
      recentActivity: 'Key champion (VP Ops) left 2 months ago. New VP started last month. They asked about downsizing during last call.',
      industryBenchmarks: 'Industry average DAU/MAU 55%, NPS 35, support tickets 4/month per $100K ARR',
    },
  },

  'customer-success-manager-executive-qbr-deck-generator': {
    skillId: 'customer-success-manager-executive-qbr-deck-generator',
    defaultTestCaseId: 'qbr-deck-default-1',
    description: 'Creating QBR presentation deck',
    inputPayload: {
      accountName: 'Global Retail Corp',
      accountContext: '$500K ARR, 3-year customer, using platform for inventory management across 200 stores',
      metrics: 'Inventory accuracy: 99.2% (target 98%), Stockout reduction: 35%, API uptime: 99.9%, Active users: 450/500 licensed',
      highlights: 'Achieved 99.2% inventory accuracy (up from 94%). Reduced stockouts by 35%. Completed API integration with their ERP.',
      challenges: 'Delayed training rollout due to customer resource constraints. Some stores still on old process.',
      expansionGoals: 'Complete rollout to remaining 50 stores. Launch demand forecasting module. Workforce management module ($200K opportunity).',
    },
  },

  'customer-success-manager-customer-lifecycle-email-templates': {
    skillId: 'customer-success-manager-customer-lifecycle-email-templates',
    defaultTestCaseId: 'lifecycle-email-default-1',
    description: 'Creating customer lifecycle email templates',
    inputPayload: {
      emailType: 'Onboarding Check-in (Day 30)',
      customerContext: 'Mid-market (50-500 employees), self-serve onboarding, Project management SaaS, completed basic setup but low feature adoption',
      keyPoints: 'Drive activation of key features (timeline view, integrations), identify blockers, offer training',
      tone: 'Helpful and proactive, not pushy',
      senderInfo: 'CSM name, title, direct calendar link, phone number',
    },
  },

  'customer-success-manager-renewal-playbook-generator': {
    skillId: 'customer-success-manager-renewal-playbook-generator',
    defaultTestCaseId: 'renewal-playbook-default-1',
    description: 'Building renewal playbook for key account',
    inputPayload: {
      accountInfo: '$300K ARR, 18-month customer, contract expires in 90 days',
      stakeholders: 'Economic buyer (CFO) - neutral, Champion (Dir of Ops) - supportive, Blocker (IT Director) - concerned about security',
      healthStatus: 'Yellow (72) - usage strong but engagement declining, IT has unresolved security tickets',
      knownConcerns: 'Competitor (Monday.com) ran a demo last month. CFO asking about cost reduction.',
      renewalGoal: 'Flat renewal minimum, target 10% uplift with European expansion (+100 seats)',
    },
  },

  'customer-success-manager-churn-risk-early-warning-system': {
    skillId: 'customer-success-manager-churn-risk-early-warning-system',
    defaultTestCaseId: 'churn-risk-default-1',
    description: 'Assessing churn risk signals',
    inputPayload: {
      accountList: 'FastGrow Startup - $85K ARR, renews in 5 months, Health Score 58 (Red)',
      behaviorChanges: `Login frequency dropped 60% over 3 months
3 support escalations (2 unresolved)
Champion left company 6 weeks ago
Skipped last 2 scheduled CSM calls
Competitor job posting mentions our competitor by name`,
      industryContext: 'SaaS startup segment, typically higher churn (25% annually). Started as enthusiastic early adopter, expanded 2x in year 1.',
      timeframe: '5 months until renewal, need intervention plan within 2 weeks',
    },
  },

  'customer-success-manager-win-back-campaign-generator': {
    skillId: 'customer-success-manager-win-back-campaign-generator',
    defaultTestCaseId: 'win-back-default-1',
    description: 'Creating win-back campaign for churned customer',
    inputPayload: {
      customerInfo: 'DataFlow Analytics - was $120K ARR, 2-year customer. Champion (now CTO) was supportive. Left on good terms.',
      churnReason: 'Switched to competitor citing lower price and better reporting features',
      productUpdates: 'Since they left: Launched advanced reporting (addresses their concern), new AI features, 15% price reduction on enterprise tier',
      campaignGoal: 'Re-engage CTO, demonstrate product improvements, offer competitive pricing to win back',
      timeSinceChurn: '8 months - CTO still connected on LinkedIn, presenting at industry conference next month',
    },
  },

  'customer-success-manager-at-risk-account-escalation-brief': {
    skillId: 'customer-success-manager-at-risk-account-escalation-brief',
    defaultTestCaseId: 'escalation-brief-default-1',
    description: 'Creating executive escalation brief',
    inputPayload: {
      accountDetails: 'MegaCorp Financial - $750K ARR, reference customer and case study',
      riskSituation: 'VP of Operations sent email stating they will not renew unless we address ongoing performance issues. Platform latency in APAC for 6 weeks.',
      stakeholderMap: 'VP Operations (decision maker, frustrated), CTO (neutral), CFO (unaware of issues), Our exec sponsor: VP CS',
      attemptedActions: '5 support tickets opened, 2 escalations to engineering. CSM calls weekly. Engineering says fix is 4 weeks out.',
      requestedSupport: 'Need exec-to-exec call to rebuild trust. Requesting temporary SLA credits and dedicated engineering resource.',
    },
  },

  'customer-success-manager-account-whitespace-analyzer': {
    skillId: 'customer-success-manager-account-whitespace-analyzer',
    defaultTestCaseId: 'whitespace-default-1',
    description: 'Analyzing expansion opportunities',
    inputPayload: {
      accountProfile: 'Enterprise customer, $400K ARR, 2 years remaining on contract',
      currentState: 'Current Products: Core Platform, Analytics Module. Users: 500 licensed, 380 active. Departments: Operations (primary), Finance (pilot)',
      productPortfolio: 'Core Platform, Analytics, Automation, AI Assistant, Mobile, API Premium, Professional Services',
      knownOpportunities: 'CFO mentioned automation interest on last call. IT wants better API access. Operations expanding to 3 new regions.',
      competitorPresence: 'Using Competitor X for automation workflows. Evaluating our solution vs. theirs.',
    },
  },

  'customer-success-manager-expansion-opportunity-scorer': {
    skillId: 'customer-success-manager-expansion-opportunity-scorer',
    defaultTestCaseId: 'expansion-scorer-default-1',
    description: 'Scoring expansion opportunities in portfolio',
    inputPayload: {
      opportunities: `1. Acme Corp - Adding 200 seats ($40K ARR) - Champion supportive, budget approved
2. TechFlow - Premium tier upgrade ($60K ARR) - Interest expressed, no budget discussion yet
3. GlobalRetail - New module ($150K ARR) - Strong need identified, procurement involved
4. StartupXYZ - Expanding to new team ($25K ARR) - Verbal commitment, contract not started
5. Enterprise Inc - Professional services ($80K ARR) - RFP stage, competing with consultancy`,
      scoringPriorities: 'Likelihood to close, time to close, strategic value, resource required',
      resourceConstraints: '2 CSMs available for expansion motions, limited solutions engineering bandwidth',
      timeHorizon: 'Q4 2024, 45 days remaining, $200K expansion ARR target',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// DEVOPS ENGINEER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const DEVOPS_ENGINEER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'devops-engineer-infrastructure-as-code-generator': {
    skillId: 'devops-engineer-infrastructure-as-code-generator',
    defaultTestCaseId: 'iac-default-1',
    description: 'Generating Terraform for AWS infrastructure',
    inputPayload: {
      infrastructure: `Production-ready Kubernetes cluster with:
- EKS cluster with 3 node groups (system, application, spot)
- Application Load Balancer with WAF
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis cluster
- S3 buckets for assets and backups
- CloudWatch dashboards and alarms`,
      tool: 'Terraform',
      cloud: 'AWS',
      environment: 'Production (VPC and networking already provisioned, using AWS Organizations)',
      securityLevel: 'High - PCI-DSS compliance required, AWS Well-Architected Framework',
      costOptimization: 'Use spot instances for non-critical workloads, reserved instances for baseline capacity',
    },
  },

  'devops-engineer-ci-cd-pipeline-designer': {
    skillId: 'devops-engineer-ci-cd-pipeline-designer',
    defaultTestCaseId: 'cicd-default-1',
    description: 'Designing CI/CD pipeline for microservices',
    inputPayload: {
      projectType: 'Node.js microservices architecture, 12 services, Docker containers',
      platform: 'GitHub Actions',
      stages: 'Build (lint, test, security scan, Docker build), Test (unit >80%, integration), Deploy (dev, staging, prod)',
      deployTarget: 'Kubernetes cluster (EKS)',
      deployStrategy: 'Blue-green for prod, rolling for staging/dev',
      securityScanning: 'SonarQube for code quality, Snyk for vulnerabilities, 0 critical vulns gate',
    },
  },

  'devops-engineer-incident-runbook-generator': {
    skillId: 'devops-engineer-incident-runbook-generator',
    defaultTestCaseId: 'runbook-default-1',
    description: 'Creating incident response runbook',
    inputPayload: {
      runbookType: 'Database Failover',
      system: 'PostgreSQL RDS',
      architecture: 'Primary in us-east-1, synchronous replica in us-east-2, async replica for reporting',
      accessInfo: 'AWS Console and CLI access, PagerDuty for alerting, Runbook stored in Confluence',
      escalationPath: 'On-call SRE → Database team → Application team leads → Customer Success (for communication)',
      slaRequirements: 'RTO: 15 minutes, RPO: 0 (synchronous replication)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HEALTHCARE PROFESSIONAL SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const HEALTHCARE_PROFESSIONAL_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'healthcare-professional-patient-education-material-creator': {
    skillId: 'healthcare-professional-patient-education-material-creator',
    defaultTestCaseId: 'patient-ed-default-1',
    description: 'Creating diabetes management education materials',
    inputPayload: {
      topic: 'Type 2 Diabetes Self-Management: Diet, Exercise, and Medication Adherence',
      audience: 'Newly diagnosed Type 2 diabetics, ages 45-70, mix of education levels',
      format: 'Patient handout (2 pages) + teach-back questions',
      readingLevel: '6th grade reading level',
      keyPoints: 'Blood sugar monitoring frequency, carb counting basics, medication timing importance, warning signs requiring immediate medical attention',
    },
  },

  'healthcare-professional-clinical-documentation-improvement-assistant': {
    skillId: 'healthcare-professional-clinical-documentation-improvement-assistant',
    defaultTestCaseId: 'cdi-default-1',
    description: 'Improving clinical documentation for accurate coding',
    inputPayload: {
      noteContent: `72 y/o male admitted for SOB. History of CHF, COPD, CKD stage 3. On admission, BNP elevated at 1200, creatinine 2.1 (baseline 1.8). Started on IV Lasix with good response. O2 sat improved from 88% to 94% on room air. Echo shows EF 35%.`,
      noteType: 'Inpatient Progress Note',
      specialty: 'Internal Medicine / Cardiology',
      improvements: 'Improve specificity for accurate DRG assignment, support medical necessity and severity of illness for Medicare',
    },
  },

  'healthcare-professional-comprehensive-care-plan-generator': {
    skillId: 'healthcare-professional-comprehensive-care-plan-generator',
    defaultTestCaseId: 'care-plan-default-1',
    description: 'Creating care plan for post-surgical patient',
    inputPayload: {
      patientSummary: '58 y/o female, BMI 32, Type 2 diabetes (A1c 7.8), hypertension. Lives alone, 5 steps to enter home, limited family support.',
      primaryDiagnosis: 'Post total knee replacement (day 2) - Pain controlled on oral meds, able to ambulate 50ft with walker, wound clean.',
      careSetting: 'Acute Inpatient transitioning to Home with Home Health',
      careGoals: 'Safe discharge to home within 3 days. Independent ambulation with walker. Pain management transition to non-opioid.',
      teamMembers: 'Orthopedic surgeon, hospitalist, PT, OT, case manager, diabetes educator',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONS MANAGER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const OPERATIONS_MANAGER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'operations-manager-enterprise-sop-generator': {
    skillId: 'operations-manager-enterprise-sop-generator',
    defaultTestCaseId: 'sop-default-1',
    description: 'Creating customer onboarding SOP',
    inputPayload: {
      processName: 'Enterprise Customer Onboarding',
      processDescription: 'All new enterprise customers (>$50K ARR) from contract signing through go-live',
      currentSteps: 'Sales handoff → Kickoff call → Requirements gathering → Implementation → Training → Go-live',
      compliance: 'SOC 2 requirements for data handling, customer data classification',
      department: 'Customer Success Operations',
      riskLevel: 'High - revenue recognition tied to go-live, customer satisfaction at stake',
    },
  },

  'operations-manager-strategic-resource-capacity-planner': {
    skillId: 'operations-manager-strategic-resource-capacity-planner',
    defaultTestCaseId: 'capacity-default-1',
    description: 'Planning implementation team capacity',
    inputPayload: {
      teamInfo: '8 implementation consultants, 2 technical leads, 1 manager. Average project: 6 weeks, 40 hours consultant time.',
      workload: '12 active projects, 8 in queue. 2 consultants at 120% utilization, 3 under 70%.',
      constraints: 'Q1 hiring freeze. 1 consultant on parental leave starting Feb. Holiday period in December.',
      timeframe: 'Q1 2025 planning',
      industry: 'B2B SaaS Implementation Services',
      planningGoal: 'Maximize throughput without burnout. Identify when to push back on sales. 15 new projects expected from pipeline.',
    },
  },

  'operations-manager-operational-metrics-kpi-dashboard-designer': {
    skillId: 'operations-manager-operational-metrics-kpi-dashboard-designer',
    defaultTestCaseId: 'kpi-dashboard-default-1',
    description: 'Designing operations KPI dashboard',
    inputPayload: {
      operationType: 'Customer Support Operations',
      goals: 'Reduce support costs by 20% while maintaining CSAT above 90%. Increase self-service resolution.',
      currentMetrics: 'Tracking: ticket volume, first response time, resolution time, CSAT. Not tracking: cost per ticket, agent utilization, deflection rate.',
      industry: 'B2B SaaS',
      maturity: 'Growing - established team but metrics framework needs optimization',
      audience: 'Support managers (daily), VP Operations (weekly), CEO (monthly)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TEACHER / EDUCATOR SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const TEACHER_EDUCATOR_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'teacher-educator-standards-aligned-lesson-plan-generator': {
    skillId: 'teacher-educator-standards-aligned-lesson-plan-generator',
    defaultTestCaseId: 'lesson-plan-default-1',
    description: 'Creating standards-aligned math lesson',
    inputPayload: {
      topic: 'Algebraic Expressions - Adding and Subtracting',
      subject: 'Mathematics',
      gradeLevel: '7th Grade',
      standards: 'CCSS.MATH.CONTENT.7.EE.A.1 - Apply properties of operations to add, subtract, factor, and expand linear expressions',
      duration: '50-minute class period',
      classContext: '28 students, mixed ability levels, 4 students with IEPs (extended time, preferential seating), 3 ELL students',
    },
  },

  'teacher-educator-comprehensive-assessment-generator': {
    skillId: 'teacher-educator-comprehensive-assessment-generator',
    defaultTestCaseId: 'assessment-default-1',
    description: 'Creating unit assessment for biology',
    inputPayload: {
      assessmentType: 'Unit Test',
      topic: 'Cell Structure and Function - Biology. NGSS HS-LS1-2: Develop and use a model to illustrate the hierarchical organization of interacting systems',
      gradeLevel: 'High School (9-12)',
      questionTypes: 'Multiple Choice, Short Answer, Diagram/Visual, Extended Response',
      dokLevels: 'DOK 1 (recall), DOK 2 (application), DOK 3 (analysis)',
    },
  },

  'teacher-educator-professional-parent-communication-suite': {
    skillId: 'teacher-educator-professional-parent-communication-suite',
    defaultTestCaseId: 'parent-comm-default-1',
    description: 'Writing parent communication about student progress',
    inputPayload: {
      commType: 'Progress Concern Email',
      studentInfo: '8th grader, previously strong student, grades dropping in past 6 weeks. Missing assignments, disengaged in class.',
      content: 'Math grade dropped from A to C. 5 missing assignments. Seems distracted and tired in class. Requesting parent conference.',
      tone: 'Caring and collaborative, not accusatory. Want to partner with parents.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LEGAL PROFESSIONAL SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const LEGAL_PROFESSIONAL_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'legal-professional-contract-risk-analyzer': {
    skillId: 'legal-professional-contract-risk-analyzer',
    defaultTestCaseId: 'contract-risk-default-1',
    description: 'Analyzing SaaS vendor contract risks',
    inputPayload: {
      contractText: `Term: 3 years, auto-renews for 1-year periods
Termination: 90 days notice, termination for convenience with 12-month penalty
Data: Vendor retains right to use aggregated/anonymized data
SLA: 99.5% uptime, credits capped at 10% monthly fee
Liability: Capped at 12 months fees
Insurance: $1M cyber liability
Indemnification: Mutual for IP infringement only`,
      contractType: 'Enterprise SaaS Subscription Agreement',
      perspective: 'Customer (Fortune 500 financial services company, heavy regulatory scrutiny)',
      dealValue: '$500K total value over 3-year term',
      riskTolerance: 'Moderate - we need the solution but cannot accept significant data or business continuity risks',
      specificConcerns: 'Vendor is Series B startup - financial stability concerns. Previous vendor bankruptcy caused major issues.',
    },
  },

  'legal-professional-executive-legal-document-summarizer': {
    skillId: 'legal-professional-executive-legal-document-summarizer',
    defaultTestCaseId: 'legal-summary-default-1',
    description: 'Summarizing acquisition agreement for board',
    inputPayload: {
      document: 'Asset Purchase Agreement - 85-page agreement plus schedules. Seller has ongoing litigation, key employees have competing offers, IP assignment chain has gaps.',
      documentType: 'Asset Purchase Agreement',
      audience: 'Board of Directors (mix of legal and non-legal backgrounds)',
      urgency: 'Board meeting in 48 hours. Need 2-page executive summary plus risk matrix.',
      focusAreas: 'Purchase price and structure, representations and warranties, indemnification, conditions to closing, employee matters, IP transfer',
    },
  },

  'legal-professional-legal-research-memorandum-drafter': {
    skillId: 'legal-professional-legal-research-memorandum-drafter',
    defaultTestCaseId: 'legal-memo-default-1',
    description: 'Drafting legal research memo on employment law',
    inputPayload: {
      issue: 'Can we require employees to sign non-compete agreements as a condition of receiving equity grants?',
      facts: 'Tech company implementing new equity program. Want to tie RSU grants to signing non-compete. Some employees already have equity without non-competes. Recently lost 3 engineers to competitor.',
      jurisdiction: 'California (primary), with employees also in Texas, New York, and remote in 15 other states',
      practiceArea: 'Employment Law / Executive Compensation',
      memoType: 'Preliminary analysis for exec team meeting in 3 days',
      audience: 'General Counsel, CEO, VP HR',
      existingResearch: 'Aware that California restricts non-competes. Need multi-state analysis.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SUPPLY CHAIN MANAGER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const SUPPLY_CHAIN_MANAGER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'supply-chain-manager-strategic-vendor-evaluation-scorecard-generator': {
    skillId: 'supply-chain-manager-strategic-vendor-evaluation-scorecard-generator',
    defaultTestCaseId: 'vendor-scorecard-default-1',
    description: 'Creating vendor evaluation scorecard',
    inputPayload: {
      vendorType: 'Contract Manufacturing - Electronics Assembly',
      priorities: 'Quality (30%), Cost (25%), Delivery reliability (20%), Technical capability (15%), Financial stability (10%)',
      industryContext: 'Consumer electronics, ISO 9001/IPC-A-610 Class 2 required, North America/Mexico preferred',
      evaluationType: 'RFP Evaluation - 5 vendors have passed initial screening',
      compliance: 'ISO 9001 certified, IPC-A-610 Class 2 minimum, SOC 2 for data handling',
      spendLevel: '$10M annual spend expected',
    },
  },

  'supply-chain-manager-supply-chain-risk-assessment-mitigation-planner': {
    skillId: 'supply-chain-manager-supply-chain-risk-assessment-mitigation-planner',
    defaultTestCaseId: 'supply-risk-default-1',
    description: 'Assessing supply chain risks',
    inputPayload: {
      supplyChain: `Tier 1: Contract manufacturer in Shenzhen
Tier 2: Battery cells (2 suppliers, both China), chipsets (1 supplier, Taiwan), plastics (3 suppliers, Vietnam/Malaysia)
Logistics: Ocean freight to US West Coast, distributed from 2 DCs`,
      industry: 'Consumer Electronics',
      knownRisks: 'Taiwan tensions affecting chipset supply. Recent quality issues with one battery supplier. Shipping costs up 40% YoY.',
      criticalProducts: 'Wireless earbuds - flagship product line, major retail launch in Q4',
      riskAppetite: 'Low tolerance for production disruption',
      timeHorizon: 'Q4 retail launch critical, $500K available for risk mitigation investments',
    },
  },

  'supply-chain-manager-inventory-optimization-planning-advisor': {
    skillId: 'supply-chain-manager-inventory-optimization-planning-advisor',
    defaultTestCaseId: 'inventory-opt-default-1',
    description: 'Optimizing inventory strategy',
    inputPayload: {
      inventoryData: `Inventory turns: 4x annually (industry benchmark: 6x)
Stockout rate: 8% (target: 2%)
Overstock (>6 months supply): 15% of SKUs
Carrying cost: 25% annually`,
      challenges: 'Highly seasonal (60% of sales in Q4). Long tail of slow movers. Frequent new product introductions. Cash constrained.',
      goals: 'Reduce inventory investment by $3M while maintaining service levels. Improve turns from 4x to 6x.',
      industry: 'E-commerce / Home Goods',
      inventoryValue: '$15M across 5,000 SKUs, 3 warehouses (East, Central, West)',
      targetServiceLevel: '98% in-stock rate (currently 92%)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SEO SPECIALIST SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const SEO_SPECIALIST_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'seo-specialist-technical-seo-site-audit': {
    skillId: 'seo-specialist-technical-seo-site-audit',
    defaultTestCaseId: 'tech-seo-audit-default-1',
    description: 'Conducting technical SEO audit',
    inputPayload: {
      websiteUrl: 'https://example-saas.com',
      crawlData: 'Full site (~500 pages, built on Next.js, blog on subdirectory /blog). GSC, Screaming Frog, Ahrefs data available. Competitor A: 95 Performance score, Competitor B: 88 Performance score.',
      businessType: 'SaaS/B2B',
      priority: 'Core Web Vitals',
    },
  },

  'seo-specialist-keyword-research-content-strategy': {
    skillId: 'seo-specialist-keyword-research-content-strategy',
    defaultTestCaseId: 'keyword-research-default-1',
    description: 'Building keyword strategy for content hub',
    inputPayload: {
      businessInfo: 'Project management software company. Targeting marketing teams at mid-size companies (100-1000 employees). Can produce 4 articles/month.',
      seedKeywords: 'marketing project management, campaign management, marketing workflow, marketing team collaboration',
      industry: 'B2B SaaS / Project Management',
      contentGoal: 'Build content hub with long-form blog posts, comparison guides, and templates. Mix of informational and commercial intent.',
    },
  },

  'seo-specialist-aeo-geo-optimization-analyzer': {
    skillId: 'seo-specialist-aeo-geo-optimization-analyzer',
    defaultTestCaseId: 'aeo-geo-default-1',
    description: 'Optimizing for AI and generative search',
    inputPayload: {
      content: 'Financial advice and product comparison content. Strong traditional SEO rankings but not appearing in AI answers or voice search results. United States primary market.',
      targetQuery: 'Best savings accounts 2025, how to build credit score, investment app comparison, what is the best bank for savings',
      contentType: 'Comparison/Review Content',
      industry: 'Fintech / Personal Finance',
    },
  },

  'seo-specialist-schema-markup-generator': {
    skillId: 'seo-specialist-schema-markup-generator',
    defaultTestCaseId: 'schema-default-1',
    description: 'Generating schema markup for e-commerce',
    inputPayload: {
      pageUrl: 'https://example-store.com/running-shoes/mens-ultraboost',
      pageType: 'Product page',
      pageContent: 'Selling running shoes. Page includes: product name, price ($129.99), reviews (4.5 stars, 342 reviews), sizes, colors, availability, brand, product images',
      schemaTypes: 'Product, Offer, AggregateRating, Brand',
    },
  },

  'seo-specialist-local-seo-audit-strategy': {
    skillId: 'seo-specialist-local-seo-audit-strategy',
    defaultTestCaseId: 'local-seo-default-1',
    description: 'Auditing local SEO for multi-location business',
    inputPayload: {
      businessInfo: 'Smile Dental Group with 12 locations across Austin, Dallas, and Houston, Texas. GBPs exist but inconsistent, reviews sparse.',
      targetKeywords: 'dentist near me, dental implants [city], emergency dentist [city], teeth whitening [city]',
      businessType: 'Multi-Location Service Business',
    },
  },

  'seo-specialist-seo-content-brief-generator': {
    skillId: 'seo-specialist-seo-content-brief-generator',
    defaultTestCaseId: 'content-brief-default-1',
    description: 'Creating SEO content brief',
    inputPayload: {
      targetKeyword: 'how to create a marketing budget',
      serpData: 'Top 5 results are comprehensive guides (2000-4000 words) with templates and examples. Informational intent.',
      contentType: 'Ultimate guide with downloadable template',
      businessContext: 'We sell marketing planning software. Want to rank for this term and drive demo requests.',
    },
  },

  'seo-specialist-redirect-mapping-tool': {
    skillId: 'seo-specialist-redirect-mapping-tool',
    defaultTestCaseId: 'redirect-mapping-default-1',
    description: 'Creating redirect map for site migration',
    inputPayload: {
      oldUrls: '/blog/category/post-title format - 850 pages total',
      newUrls: '/resources/post-title, /solutions/product-name format',
      migrationType: 'Full site migration - CMS change with URL restructure',
    },
  },

  'seo-specialist-backlink-gap-analyzer': {
    skillId: 'seo-specialist-backlink-gap-analyzer',
    defaultTestCaseId: 'backlink-gap-default-1',
    description: 'Analyzing backlink gap vs competitors',
    inputPayload: {
      yourDomain: 'example-hrtech.com (currently DR 45, 2,500 referring domains)',
      competitorBacklinks: 'bamboohr.com (DR 75, 15K domains), gusto.com (DR 80, 25K domains), rippling.com (DR 70, 10K domains)',
      industry: 'HR Tech / HRIS Software',
      linkGoals: 'Identify high-value link opportunities competitors have that we do not. Improve from DR 45 to DR 60+.',
      resources: '$5K/month for outreach and content. Prioritized opportunity list with outreach templates needed.',
    },
  },

  'seo-specialist-meta-tag-bulk-optimizer': {
    skillId: 'seo-specialist-meta-tag-bulk-optimizer',
    defaultTestCaseId: 'meta-tag-default-1',
    description: 'Bulk optimizing meta tags',
    inputPayload: {
      pageData: `Product pages (150): Currently using product name only as title
Blog posts (200): Inconsistent format, many truncated
Category pages (25): Generic "Category Name | Brand"
Landing pages (15): Keyword stuffed, poor CTR`,
      brandName: 'TechFlow',
      brandPosition: 'End of Title',
      toneStyle: 'Professional, benefit-focused, action-oriented',
    },
  },

  'seo-specialist-content-refresh-analyzer': {
    skillId: 'seo-specialist-content-refresh-analyzer',
    defaultTestCaseId: 'content-refresh-default-1',
    description: 'Identifying content refresh opportunities',
    inputPayload: {
      contentData: '300 blog posts over 5 years. 50 posts = 80% traffic. 100 posts = zero traffic. 150 declining. Mix from 2019-2024.',
      industry: 'B2B SaaS / Marketing Technology',
      contentTypes: 'How-to guides, product comparisons, industry trends, case studies',
      resources: '1 content writer, 1 editor. Goal: Revive declining content, consolidate zero-traffic pages, update outdated statistics.',
    },
  },

  'seo-specialist-internal-linking-optimizer': {
    skillId: 'seo-specialist-internal-linking-optimizer',
    defaultTestCaseId: 'internal-link-default-1',
    description: 'Optimizing internal linking structure',
    inputPayload: {
      siteStructure: 'Hub and spoke model with pillar pages linking to cluster content. Orphan pages (30+), over-linked homepage, pillar pages not linking to supporting content.',
      targetPages: '10 money pages to boost: /pricing, /features/*, /solutions/* - these drive conversions',
      siteType: 'B2B SaaS (500 pages: 20 pillar, 150 blog, 50 product, 280 support docs)',
    },
  },

  'seo-specialist-competitor-serp-analyzer': {
    skillId: 'seo-specialist-competitor-serp-analyzer',
    defaultTestCaseId: 'serp-analysis-default-1',
    description: 'Analyzing competitor SERP presence',
    inputPayload: {
      targetKeyword: 'project management software',
      serpData: 'monday.com (#1), asana.com (#2), clickup.com (#3), notion.so (#4). Featured snippets, PAA boxes present.',
      businessValue: 'High intent commercial keyword, 50K monthly searches, primary conversion driver',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TRAINER / PROFESSIONAL DEVELOPMENT SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const TRAINER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'trainer-training-presentation-builder': {
    skillId: 'trainer-training-presentation-builder',
    defaultTestCaseId: 'training-pres-default-1',
    description: 'Building leadership training presentation',
    inputPayload: {
      topic: 'Giving Effective Feedback: A Manager\'s Guide',
      audience: 'Middle Management',
      duration: '90-minute Deep Dive',
      format: 'Interactive Workshop',
      objectives: '1. Understand the SBI (Situation-Behavior-Impact) feedback model, 2. Practice delivering constructive criticism, 3. Handle defensive reactions professionally, 4. Create a feedback-rich team culture',
      context: 'Remote delivery via Zoom for 25 first-time managers promoted from individual contributor roles. Need engaging activities to maintain attention.',
    },
  },

  'trainer-workshop-event-marketing-promotion': {
    skillId: 'trainer-workshop-event-marketing-promotion',
    defaultTestCaseId: 'workshop-marketing-default-1',
    description: 'Creating marketing for public workshop',
    inputPayload: {
      eventName: 'AI for Business Leaders: Practical Applications & Strategy',
      eventType: 'Full-Day Training',
      targetAudience: 'C-suite and VP-level executives at mid-market companies. Decision makers evaluating AI investments.',
      eventDetails: '1-day in-person workshop, $1,500 per attendee, includes lunch and networking. 30 attendees minimum, 50 maximum capacity.',
      uniqueValue: 'Hands-on with real AI tools, not theoretical. Led by former Fortune 500 CTO.',
      timeline: '8+ weeks before event',
    },
  },

  'trainer-training-content-copy-editor': {
    skillId: 'trainer-training-content-copy-editor',
    defaultTestCaseId: 'training-editor-default-1',
    description: 'Editing training materials for clarity',
    inputPayload: {
      content: `This module will help you to understand the various aspects of project management methodologies and their application in real-world scenarios. We will be covering Waterfall, Agile, and Hybrid approaches. It is important to note that there is no one-size-fits-all solution and the methodology you choose should be dependent on various factors including but not limited to team size, project complexity, stakeholder expectations, and organizational culture.`,
      contentType: 'Video Script',
      audience: 'Mid-Level Professionals',
      editingFocus: 'Clarity & Readability',
    },
  },

  'trainer-workshop-curriculum-designer': {
    skillId: 'trainer-workshop-curriculum-designer',
    defaultTestCaseId: 'curriculum-default-1',
    description: 'Designing multi-session training curriculum',
    inputPayload: {
      programName: 'New Manager Development Program',
      programType: 'Workshop Series',
      audience: 'Newly promoted managers (0-12 months in role) across all departments. Cohort-based delivery with hybrid format.',
      outcomes: 'Build core management skills: delegation, feedback, performance management, team building, conflict resolution, time management',
      contentAreas: 'Leadership fundamentals, giving/receiving feedback, delegation techniques, performance management, conflict resolution, time management best practices',
      assessment: 'Skills Demonstration',
    },
  },

  'trainer-training-needs-assessment-generator': {
    skillId: 'trainer-training-needs-assessment-generator',
    defaultTestCaseId: 'needs-assessment-default-1',
    description: 'Conducting training needs assessment',
    inputPayload: {
      assessmentScope: 'Team/Department',
      context: 'Fast-growing tech company, 500 employees, doubled in size last year. Seeing issues with manager effectiveness across all 85 people managers. Limited L&D team (2 people).',
      currentSkills: 'Ad hoc lunch-and-learns, no formal management development program. Inconsistent performance reviews, employee survey shows "manager effectiveness" as bottom quartile.',
      desiredState: 'Consistent, effective management practices across all teams. Reduced turnover on problem teams. Improved employee satisfaction scores for manager effectiveness.',
      timeline: 'Short-term (3-6 months)',
    },
  },

  'trainer-interactive-exercise-activity-generator': {
    skillId: 'trainer-interactive-exercise-activity-generator',
    defaultTestCaseId: 'exercise-default-1',
    description: 'Creating interactive training exercises',
    inputPayload: {
      topic: 'Active Listening Skills',
      learningObjective: 'Participants should be able to demonstrate active listening techniques: paraphrasing, asking clarifying questions, non-verbal cues',
      activityType: 'Pair Activity',
      audience: 'Professional Staff',
      duration: '25-40 minutes',
      format: 'In-Person',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MANAGEMENT CONSULTANT SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const CONSULTANT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'consultant-strategy-consulting-deck-builder': {
    skillId: 'consultant-strategy-consulting-deck-builder',
    defaultTestCaseId: 'strategy-deck-default-1',
    description: 'Building strategic recommendation deck',
    inputPayload: {
      objective: 'Market entry strategy for US healthcare company expanding to UK market',
      context: 'Mid-size healthcare technology company, $200M revenue, strong US presence, no international operations',
      findings: `Market size: £15B UK digital health market growing 12% annually
Regulatory: NHS procurement complex, MHRA approval needed
Competition: 3 established players, fragmented market otherwise
Entry options analyzed: Direct entry, partnership, acquisition
Recommendation: Partnership strategy with established NHS supplier, followed by acquisition in 18-24 months`,
      deckType: 'Board Recommendation',
      audience: 'Board of Directors',
      length: '15-20 slides',
    },
  },

  'consultant-client-proposal-generator': {
    skillId: 'consultant-client-proposal-generator',
    defaultTestCaseId: 'proposal-default-1',
    description: 'Writing consulting engagement proposal',
    inputPayload: {
      clientNeed: 'Digital transformation assessment for regional bank - CEO wants to compete with digital-first challengers',
      clientContext: '$5B asset regional bank, 50 branches, legacy core banking system. Competing against Big 4 firm and boutique fintech consultancy.',
      yourFirm: 'Banking technology expertise, similar project delivered for comparable bank last year. Target: $450K.',
      proposalType: 'Strategy & Assessment',
      timeline: '8-week assessment of current state, competitive analysis, roadmap development, business case for transformation',
    },
  },

  'consultant-executive-memo-recommendation-writer': {
    skillId: 'consultant-executive-memo-recommendation-writer',
    defaultTestCaseId: 'exec-memo-default-1',
    description: 'Writing executive recommendation memo',
    inputPayload: {
      question: 'Should we restructure the sales organization to improve effectiveness?',
      recommendation: 'Restructure into pod model, realign territories, revise compensation, implement SLA with marketing. Must be implementable without major headcount changes. Q1 implementation target.',
      evidence: `Current state: 45 reps, $50M quota, 72% attainment
Territory overlap causing deal conflicts (15% of deals disputed)
Comp plan rewards individual over team (no collaboration incentive)
Marketing leads not followed up (40% SLA breach)`,
      audience: 'C-Suite',
      length: '2-3 pages',
    },
  },

  'consultant-client-workshop-facilitator-guide': {
    skillId: 'consultant-client-workshop-facilitator-guide',
    defaultTestCaseId: 'workshop-guide-default-1',
    description: 'Creating workshop facilitator guide',
    inputPayload: {
      objective: 'Strategy alignment session - get executive team agreement on 3-year strategic priorities. Desired outcomes: Agreed top 5 strategic priorities, resource allocation principles, next steps with owners.',
      participants: '12 executives (CEO + direct reports), history of disagreement on priorities. CFO and CRO historically at odds. CEO tends to dominate. Some participants not vocal.',
      duration: 'Full-day (6-8 hours)',
      workshopType: 'Strategy/Planning Session',
    },
  },

  'consultant-business-case-roi-analysis': {
    skillId: 'consultant-business-case-roi-analysis',
    defaultTestCaseId: 'business-case-default-1',
    description: 'Building business case for technology investment',
    inputPayload: {
      initiative: 'Enterprise CRM implementation (Salesforce). Currently using spreadsheets and basic contact database with no pipeline visibility.',
      investment: 'Salesforce Enterprise: $300K year 1 (licenses + implementation), $150K/year ongoing',
      benefits: '1. Increased sales productivity (15%), 2. Improved win rates (5pp), 3. Reduced admin time (10 hrs/rep/month), 4. Better forecasting',
      assumptions: 'Payback period must be under 18 months. Need conservative assumptions. CFO skeptical of tech ROI, CRO is champion.',
      timeframe: '3 years',
      audience: 'C-Suite & Board',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ENTREPRENEUR / FOUNDER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const ENTREPRENEUR_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'entrepreneur-investor-pitch-deck-builder': {
    skillId: 'entrepreneur-investor-pitch-deck-builder',
    defaultTestCaseId: 'pitch-deck-default-1',
    description: 'Building Series A pitch deck',
    inputPayload: {
      startup: 'AI-powered legal document automation for SMBs. Legal tech market, $25B TAM. SMB segment underserved.',
      problem: 'SMBs spend thousands on legal documents and contracts, often using outdated templates or expensive lawyers for routine paperwork.',
      solution: 'AI-powered platform that automates legal document creation, review, and management specifically designed for SMB workflows.',
      traction: '$1.2M ARR, 150 customers, 15% MoM growth, 120% NRR, $8K ACV',
      team: 'CEO (ex-Google PM), CTO (Stanford CS PhD), COO (ex-McKinsey). 12 FTEs total.',
      raise: '$8M for 18 months runway. Use: 60% engineering, 25% GTM, 15% G&A',
      stage: 'Series A',
    },
  },

  'entrepreneur-business-plan-generator': {
    skillId: 'entrepreneur-business-plan-generator',
    defaultTestCaseId: 'business-plan-default-1',
    description: 'Creating comprehensive business plan',
    inputPayload: {
      business: 'Subscription meal kit service for people with dietary restrictions (celiac, diabetes, kidney disease). Pre-launch, seeking $500K seed funding.',
      market: '35M Americans with dietary restrictions. Initial focus: celiac/gluten-free market (3M people).',
      model: 'D2C subscription model, physician/dietitian referrals, health system partnerships. Monthly subscription boxes.',
      operations: '2 founders: one former healthcare dietitian, one operations/logistics background from Blue Apron. Initial production in commercial kitchen, scaling to dedicated facility.',
      financials: 'Seeking $500K to launch pilot in 3 metro areas, prove unit economics, then raise Series A. Target break-even at 5,000 subscribers.',
      planType: 'Investor Business Plan',
    },
  },

  'entrepreneur-go-to-market-strategy-builder': {
    skillId: 'entrepreneur-go-to-market-strategy-builder',
    defaultTestCaseId: 'gtm-strategy-default-1',
    description: 'Building go-to-market strategy',
    inputPayload: {
      product: 'B2B SaaS - AI meeting assistant that records, transcribes, and extracts action items. Considering: $15/user/month or $200/user/year.',
      market: 'Initially: sales teams at tech companies (100-1000 employees). ICP: VP Sales, Sales Ops.',
      competition: 'Otter.ai, Fireflies.ai, Gong for enterprise. Differentiation is better action item extraction and CRM integration.',
      resources: '$100K for first 6 months GTM. Product ready, 10 beta customers (free), $0 revenue.',
      gtmType: 'Product-Led Growth (PLG)',
      timeline: 'Reach $100K ARR in first 12 months',
    },
  },

  'entrepreneur-startup-financial-model-builder': {
    skillId: 'entrepreneur-startup-financial-model-builder',
    defaultTestCaseId: 'financial-model-default-1',
    description: 'Building startup financial model',
    inputPayload: {
      businessModel: 'B2B SaaS, subscription revenue, land-and-expand model',
      currentState: 'Pre-revenue, 5 pilot customers, expected $5K ACV at launch. 2 founders, planning to hire 1 engineer month 3, 1 salesperson month 6.',
      assumptions: `Customer acquisition: 10 new customers month 1, growing 20% MoM
ACV: $5K year 1, expanding to $8K year 2
Churn: 5% monthly initially, improving to 3%
CAC: $2,000 (paid channels), $500 (organic)`,
      funding: '$1M seed round target',
      modelType: 'Fundraising Model',
      timeframe: '36 months (3 years)',
    },
  },

  'entrepreneur-investor-update-email-generator': {
    skillId: 'entrepreneur-investor-update-email-generator',
    defaultTestCaseId: 'investor-update-default-1',
    description: 'Writing monthly investor update',
    inputPayload: {
      metrics: `MRR: $45K (up from $32K)
Customers: 28 (up from 22)
Burn: $120K/month
Runway: 14 months
Pipeline: $300K (up from $180K)`,
      wins: 'Closed first enterprise deal ($50K ACV), launched v2.0 with AI features, hired VP Sales. Next month: Enterprise pilot go-lives, team offsite, beginning Series A prep.',
      challenges: 'Sales cycle longer than expected for enterprise (90+ days). One key engineer gave notice. Looking for intros to: enterprise SaaS sales leaders, senior ML engineers.',
      frequency: 'Monthly',
      stage: 'Seed',
    },
  },

  'entrepreneur-investor-due-diligence-q-a-prep': {
    skillId: 'entrepreneur-investor-due-diligence-q-a-prep',
    defaultTestCaseId: 'dd-prep-default-1',
    description: 'Preparing for investor due diligence',
    inputPayload: {
      startup: 'B2B SaaS company, $2M ARR, 18 months old, 20 employees, burning $200K/month. Top-tier SaaS-focused VC with term sheet contingent on DD.',
      market: 'Enterprise software market, land-and-expand model targeting mid-market companies.',
      financials: '$2M ARR, $200K/month burn, 14 months runway. Customer concentration concern: top 3 = 40% revenue.',
      team: '20 employees total. Note: co-founder departed 6 months ago. DD areas include: Financial, legal, technical, customer references.',
      risks: 'Customer concentration (top 3 = 40% revenue), co-founder departed 6 months ago, pivot from original idea. 3 weeks to close.',
      stage: 'Series A',
      investorType: 'Venture Capital (VC)',
    },
  },

  'entrepreneur-market-analysis-competitor-intelligence': {
    skillId: 'entrepreneur-market-analysis-competitor-intelligence',
    defaultTestCaseId: 'market-analysis-default-1',
    description: 'Conducting market and competitor analysis',
    inputPayload: {
      businessDescription: 'Employee engagement and recognition software focused on frontline/deskless workers (60% of workforce, underserved by current solutions)',
      targetMarket: 'Frontline and deskless workers in retail, manufacturing, healthcare, and logistics industries.',
      competitors: 'Lattice, 15Five, Culture Amp, Bonusly, Motivosity',
      analysisGoals: 'Series A pitch preparation - need TAM/SAM/SOM, competitor positioning, pricing benchmarks, market trends, gaps we can exploit',
    },
  },

  'entrepreneur-financial-projections-scenario-modeler': {
    skillId: 'entrepreneur-financial-projections-scenario-modeler',
    defaultTestCaseId: 'scenario-model-default-1',
    description: 'Building financial scenario models',
    inputPayload: {
      businessModel: 'B2B SaaS, subscription revenue. Key variables: Hiring pace, marketing spend, sales capacity, pricing changes.',
      currentTraction: '$1M ARR, $150K MRR, 100 customers, $15K burn/month',
      fundingAmount: '$2M current cash. Cannot raise for 6+ months (market conditions). Need to make hiring decisions for Q1.',
      marketContext: 'Board wants 3 scenarios: aggressive growth (raise now), moderate (extend runway), conservative (path to profitability).',
      projectionPeriod: '24 months',
    },
  },

  'entrepreneur-investor-outreach-communication-suite': {
    skillId: 'entrepreneur-investor-outreach-communication-suite',
    defaultTestCaseId: 'investor-outreach-default-1',
    description: 'Creating investor outreach campaign',
    inputPayload: {
      companyName: 'GreenTrack',
      elevatorPitch: 'SaaS platform helping companies measure and reduce carbon footprint. Making sustainability tracking simple and actionable.',
      traction: 'Product launched, $100K ARR, 15 customers',
      fundingAsk: 'Seed round, targeting $2M. Want to close in 10 weeks.',
      targetInvestors: 'Climate-focused VCs, impact investors, angels with climate/enterprise background',
      uniqueHook: 'First platform to integrate real-time carbon tracking with automated compliance reporting. Warm intros preferred but need cold outreach strategy too.',
    },
  },

  'entrepreneur-executive-summary-one-pager-creator': {
    skillId: 'entrepreneur-executive-summary-one-pager-creator',
    defaultTestCaseId: 'exec-summary-default-1',
    description: 'Creating investor one-pager',
    inputPayload: {
      companyName: 'CodePilot AI',
      businessOverview: 'Enterprise-grade AI coding assistant that integrates with existing developer workflows, trained on company codebase.',
      marketOpportunity: 'Developer productivity tools market, $20B TAM. Enterprise segment seeking AI solutions that work with their proprietary codebases.',
      financialHighlights: 'Use of funds: Scale sales (hire 10 AEs), expand engineering (ML team), enterprise security features.',
      traction: '$500K ARR, 20 enterprise customers (pilot and paid), 3 Fortune 500 in pipeline',
      team: 'Founding team from Google Brain and Microsoft (VSCode team)',
      fundingAsk: 'Series A, $15M at $60M pre',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REVENUE OPERATIONS MANAGER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const REVENUE_OPERATIONS_MANAGER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'revenue-operations-manager-revops-pipeline-hygiene-kit': {
    skillId: 'revenue-operations-manager-revops-pipeline-hygiene-kit',
    defaultTestCaseId: 'pipeline-hygiene-default-1',
    description: 'Auditing and cleaning sales pipeline',
    inputPayload: {
      crmPlatform: 'Salesforce',
      pipelineData: `Total Pipeline: $25M
Stage Distribution:
- Qualification: $8M (125 opps, avg age 45 days)
- Discovery: $6M (80 opps, avg age 60 days)
- Proposal: $5M (40 opps, avg age 75 days)
- Negotiation: $4M (25 opps, avg age 90 days)
- Verbal: $2M (10 opps, avg age 30 days)
Hygiene Issues: No activity in 30+ days: 45 opps. Past close date: 30 opps. No next step: 60 opps. No decision maker: 25 opps.`,
      salesProcess: 'MEDDIC qualification methodology with 5-stage pipeline. 12 AEs, 3 managers.',
      stageDefinitions: 'Qualification → Discovery → Proposal → Negotiation → Verbal → Closed. Exit criteria defined for each stage.',
      avgCycleLength: '75 days average. $8M quarterly goal, currently at $3M with 6 weeks left.',
      forecastAccuracyTarget: '90% accuracy on commit forecast',
    },
  },

  'revenue-operations-manager-forecast-variance-explainer': {
    skillId: 'revenue-operations-manager-forecast-variance-explainer',
    defaultTestCaseId: 'forecast-variance-default-1',
    description: 'Explaining forecast miss to leadership',
    inputPayload: {
      forecastPeriod: 'Q3 2024',
      forecastedRevenue: 'Commit: $5M, Best Case: $6.5M, Pipeline: $8M',
      actualRevenue: '$4.2M closed',
      dealChanges: `Slipped deals: 3 deals ($800K) pushed to Q4 due to customer budget cycles
Lost deals: 2 deals ($400K) lost to competitor in final stages
Reduced scope: 4 deals closed at lower value than forecasted ($300K delta)
New business shortfall: 5 fewer new logos than planned
Forecast process: Weekly calls with reps, stage-weighted pipeline, manager judgment overlay`,
      audienceLevel: 'C-Suite (CRO, CFO, CEO)',
    },
  },

  'revenue-operations-manager-gtm-tech-stack-audit': {
    skillId: 'revenue-operations-manager-gtm-tech-stack-audit',
    defaultTestCaseId: 'gtm-tech-stack-default-1',
    description: 'Auditing GTM technology stack for optimization',
    inputPayload: {
      currentStack: `CRM: Salesforce Enterprise
Marketing Automation: HubSpot Marketing Hub Pro
Sales Engagement: Outreach.io
Conversation Intelligence: Gong
Data Enrichment: ZoomInfo + Clearbit
BI/Analytics: Tableau + Looker
CPQ: Salesforce CPQ
Revenue Intelligence: Clari
Document Management: DocuSign
Calendar Scheduling: Calendly Teams`,
      monthlySpend: '$85,000/month across all tools',
      teamSize: '45 sales reps, 12 SDRs, 8 marketing, 4 RevOps',
      painPoints: `Duplicate data entry between HubSpot and Salesforce
Low adoption of Gong (only 30% of reps using consistently)
No single source of truth for pipeline data
Manual reporting takes 10+ hours per week
Integration gaps causing data sync issues`,
      objectives: 'Reduce tool sprawl, improve data quality, increase rep productivity, enable self-serve reporting',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// AI SOLUTIONS ARCHITECT SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const AI_SOLUTIONS_ARCHITECT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'ai-solutions-architect-governed-prompt-packager': {
    skillId: 'ai-solutions-architect-governed-prompt-packager',
    defaultTestCaseId: 'prompt-packager-default-1',
    description: 'Creating governed prompt templates',
    inputPayload: {
      promptPurpose: 'Customer support email response generation for Fortune 500 financial services company',
      basePrompt: 'You are a customer service assistant for a financial services company. Help customers with their inquiries while maintaining compliance.',
      dataClassification: 'Confidential - PII',
      outputConstraints: 'Must be brand-consistent, compliant with financial regulations, include required disclosures. Cannot provide investment advice, cannot discuss competitors.',
      complianceFrameworks: 'SEC regulations, FINRA guidelines, internal compliance policies',
      approvers: 'Legal review required for template changes. Compliance must sign off on guardrails.',
    },
  },

  'ai-solutions-architect-ai-vendor-evaluation-matrix': {
    skillId: 'ai-solutions-architect-ai-vendor-evaluation-matrix',
    defaultTestCaseId: 'ai-vendor-eval-default-1',
    description: 'Evaluating AI vendors for enterprise deployment',
    inputPayload: {
      useCase: 'Document processing and extraction for insurance claims. Decision in 6 weeks, POC with shortlisted vendors.',
      vendors: 'AWS Textract, Google Document AI, Microsoft Azure Form Recognizer, ABBYY, Hyperscience',
      requirements: 'Functional: Process 10K documents/day, support PDFs and images, 95%+ accuracy. Technical: On-premise or private cloud deployment, API integration, audit logging.',
      securityRequirements: 'SOC 2, data residency in US, no data retention by vendor',
      complianceNeeds: 'Insurance industry regulations, data privacy requirements',
      budgetRange: '$200K annual budget',
    },
  },

  'ai-solutions-architect-ai-use-case-prioritization-framework': {
    skillId: 'ai-solutions-architect-ai-use-case-prioritization-framework',
    defaultTestCaseId: 'ai-prioritization-default-1',
    description: 'Prioritizing AI use cases for roadmap',
    inputPayload: {
      industry: 'Financial Services',
      companySize: 'Enterprise (1000+ employees)',
      aiMaturityLevel: 'Developing (some AI projects)',
      strategicPriorities: 'Customer experience improvement, operational efficiency, cost reduction',
      useCasesToEvaluate: `1. Customer service chatbot
2. Document classification and routing
3. Fraud detection enhancement
4. Sales forecasting improvement
5. Automated report generation
6. Code review assistance
7. Marketing content generation
8. HR resume screening`,
      budgetRange: '$500K for year 1',
      timelineConstraints: 'Limited AI/ML team (3 people). Need quick wins to build momentum.',
    },
  },

  'ai-solutions-architect-ai-data-readiness-audit': {
    skillId: 'ai-solutions-architect-ai-data-readiness-audit',
    defaultTestCaseId: 'data-readiness-default-1',
    description: 'Assessing data readiness for AI project',
    inputPayload: {
      companyName: 'TechCorp Solutions',
      industry: 'Technology / SaaS',
      companySize: 'Mid-Market (201-1000 employees)',
      currentDataPlatform: 'Snowflake data warehouse, dbt for transforms, Fivetran for ingestion',
      plannedAIUseCases: 'Customer churn prediction model - need to predict churn 90 days in advance with >80% accuracy',
      targetTimeline: '6-12 months',
      dataBudget: '$100K-250K',
      primaryDataSources: `Customer data: 3 years history, 500K customers
Usage data: Product analytics from last 18 months
Support data: Zendesk tickets (unstructured)
Financial data: Billing and payment history
Survey data: NPS and satisfaction surveys (quarterly)
Quality concerns: Missing values in customer demographics (30%), inconsistent product naming, no data dictionary`,
    },
  },

  'ai-solutions-architect-ai-risk-assessment-mitigation-plan': {
    skillId: 'ai-solutions-architect-ai-risk-assessment-mitigation-plan',
    defaultTestCaseId: 'ai-risk-default-1',
    description: 'Assessing AI implementation risks',
    inputPayload: {
      companyName: 'First National Bank',
      industry: 'Financial Services / Banking',
      companySize: 'Enterprise (1000+ employees)',
      riskAppetite: 'Conservative',
      aiUseCase: 'Automated loan underwriting assistant - AI provides loan approval recommendations to human underwriters. Factors in credit score, income, employment, debt ratios.',
      technologyStack: 'Python ML models, AWS SageMaker, PostgreSQL database',
      dataSources: 'Credit bureau data, internal customer data, employment verification systems',
      targetUsers: 'Loan underwriters (50 users), start with 10% of applications, human review of all decisions',
      decisionImpact: 'High - affects customer loan approvals and financial decisions',
      applicableRegulations: 'ECOA, Fair Housing Act, FCRA. OCC and CFPB oversight.',
    },
  },

  'ai-solutions-architect-ai-integration-architecture-blueprint': {
    skillId: 'ai-solutions-architect-ai-integration-architecture-blueprint',
    defaultTestCaseId: 'ai-architecture-default-1',
    description: 'Designing AI integration architecture',
    inputPayload: {
      companyName: 'ShopMax E-commerce',
      industry: 'Retail / E-commerce',
      companySize: 'Mid-Market (201-1000 employees)',
      currentTechStack: 'Monolithic e-commerce platform on AWS, PostgreSQL database, Redis cache',
      useCaseDescription: 'Real-time product recommendations for e-commerce platform. Cannot modify core commerce platform significantly.',
      predictionsPerDay: '50K-100K predictions/day',
      latencyRequirement: '<100ms latency',
      availabilityRequirement: '99.9% uptime, handle traffic spikes (10x during sales)',
      sourceSystems: 'Product catalog, user behavior events, shopping cart',
      targetSystems: 'Checkout page, email marketing, homepage recommendations',
      cloudProvider: 'AWS',
      budgetRange: '$50K-100K initial + ongoing compute costs',
    },
  },

  'ai-solutions-architect-ai-cost-benefit-analysis-calculator': {
    skillId: 'ai-solutions-architect-ai-cost-benefit-analysis-calculator',
    defaultTestCaseId: 'ai-cost-benefit-default-1',
    description: 'Calculating AI project ROI',
    inputPayload: {
      companyName: 'GlobalCorp Manufacturing',
      industry: 'Manufacturing',
      annualRevenue: '$500M-1B',
      discountRate: '10%',
      aiUseCase: 'Intelligent document processing for accounts payable. Currently 5 FTEs processing 3,000 invoices/month manually. Error rate 3%. Processing time 15 min/invoice.',
      projectScope: 'AI-powered invoice extraction with human-in-the-loop for exceptions. Expected 80% automation rate, 0.5% error rate, 2 FTE reallocation possible.',
      expectedDuration: '3 years',
      initialInvestment: 'Software: $50K/year, Implementation: $100K one-time, Training: $20K, Ongoing support: $30K/year',
    },
  },

  'ai-solutions-architect-ai-change-management-playbook': {
    skillId: 'ai-solutions-architect-ai-change-management-playbook',
    defaultTestCaseId: 'ai-change-mgmt-default-1',
    description: 'Creating AI change management plan',
    inputPayload: {
      companyName: 'ServiceFirst Corp',
      industry: 'Customer Service / BPO',
      employeeCount: '1000-5000',
      geographicSpread: 'Multi-region (US East, US West, Philippines)',
      organizationalCulture: 'Traditional, some resistance to change. Union considerations for hourly workers.',
      aiUseCase: 'AI-powered customer service assistant - AI will handle tier-1 inquiries, agents focus on complex issues, new workflows and KPIs',
      departmentsAffected: 'Customer Service, Quality Assurance, Training',
      rolesImpacted: 'Customer service agents (150), supervisors (15), QA team (8)',
      estimatedUsers: '173 direct users, pilot in 2 months, full rollout in 6 months',
      goLiveDate: 'Pilot: 2 months, Full rollout: 6 months. Success metrics: Adoption rate >90%, CSAT maintained',
    },
  },

  'ai-solutions-architect-ai-pilot-program-designer': {
    skillId: 'ai-solutions-architect-ai-pilot-program-designer',
    defaultTestCaseId: 'ai-pilot-default-1',
    description: 'Designing AI pilot program',
    inputPayload: {
      companyName: 'TechForward Inc',
      industry: 'Technology',
      companySize: 'Mid-Market (201-1000 employees)',
      aiMaturityLevel: 'Developing (some AI projects)',
      aiUseCase: 'Generative AI for internal knowledge management and Q&A - IT Help Desk using AI to answer employee questions about policies, procedures, systems',
      businessObjectives: 'Reduce ticket resolution time by 20%, user satisfaction >80%, <5% hallucination rate',
      technicalApproach: 'RAG-based system using company knowledge base, human review of AI responses initially, clear escalation path',
      targetUsers: 'IT Help Desk team (25 people)',
      geographicScope: 'Single location (HQ)',
      pilotDuration: '8 weeks',
      pilotBudget: '$25K - includes 1 AI engineer, 1 product manager, IT Help Desk lead',
    },
  },

  'ai-solutions-architect-ai-performance-monitoring-dashboard-spec': {
    skillId: 'ai-solutions-architect-ai-performance-monitoring-dashboard-spec',
    defaultTestCaseId: 'ai-monitoring-default-1',
    description: 'Specifying AI monitoring dashboard',
    inputPayload: {
      companyName: 'CreditSmart Financial',
      industry: 'Financial Services',
      companySize: 'Enterprise (1000+ employees)',
      aiUseCase: 'Production ML model for credit scoring',
      modelTypes: 'Gradient Boosting classifier, feature store integration',
      predictionVolume: '10K-50K predictions/day',
      deploymentArchitecture: 'AWS SageMaker endpoints, real-time and batch scoring',
      dashboardUsers: 'Data science team (technical metrics), Risk team (fairness metrics), Ops team (system health)',
      slaRequirements: 'Immediate alert on accuracy drop >5%, daily drift reports, weekly model health summary',
      cloudPlatform: 'AWS (existing monitoring: Datadog for infra, custom dashboards in Looker)',
    },
  },

  'ai-solutions-architect-ai-security-privacy-compliance-checker': {
    skillId: 'ai-solutions-architect-ai-security-privacy-compliance-checker',
    defaultTestCaseId: 'ai-compliance-default-1',
    description: 'Checking AI security and privacy compliance',
    inputPayload: {
      companyName: 'HealthFirst Medical Group',
      industry: 'Healthcare',
      companySize: 'Mid-Market (201-1000 employees)',
      geographicPresence: 'United States (multi-state)',
      aiUseCase: 'Customer-facing AI chatbot for patient inquiries and scheduling',
      dataTypes: 'Customer names, account info, potentially PHI in conversation',
      modelArchitecture: 'LLM-based chatbot with RAG for knowledge base',
      deploymentModel: 'Cloud-based (Azure), third-party AI vendor (OpenAI)',
      applicableRegulations: 'HIPAA, state privacy laws, FDA (if clinical advice), SOC 2',
      dataSources: 'Patient records (encrypted), scheduling system, knowledge base. Data processing agreement needed, BAA for HIPAA, data residency requirements.',
    },
  },

  'ai-solutions-architect-ai-stakeholder-communication-package': {
    skillId: 'ai-solutions-architect-ai-stakeholder-communication-package',
    defaultTestCaseId: 'ai-comm-package-default-1',
    description: 'Creating AI communication materials',
    inputPayload: {
      companyName: 'GlobalEnterprises Inc',
      industry: 'Professional Services',
      employeeCount: '5000+',
      brandVoice: 'Professional, approachable, innovation-forward',
      initiativeName: 'AI Assist - Enterprise AI Assistant',
      aiUseCase: 'Enterprise-wide AI assistant rollout (like ChatGPT for work) - AI augments not replaces, data stays private, guardrails in place',
      businessImpact: 'Improve employee productivity, reduce time on routine tasks, enhance decision-making',
      timeline: 'Pilot: 3 months, Full rollout: 6 months',
      keyAudiences: 'Executive team, middle management, end users, IT team, legal/compliance, union',
      primaryGoals: 'Build excitement, address concerns, explain governance, drive adoption. Deliverables: Executive presentation, manager talking points, employee FAQ, training announcement.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMER SUCCESS LEADER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const CUSTOMER_SUCCESS_LEADER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'customer-success-leader-qbr-prep-synthesizer': {
    skillId: 'customer-success-leader-qbr-prep-synthesizer',
    defaultTestCaseId: 'qbr-prep-default-1',
    description: 'Preparing for strategic customer QBR',
    inputPayload: {
      customerName: 'Enterprise Manufacturing Co',
      accountTier: 'Enterprise',
      contractValue: '$2M ARR',
      renewalDate: '6 months from now',
      usageData: 'Successful rollout to APAC region (+500 users), achieved 99.5% uptime, completed custom integration. Using 3 product modules.',
      supportHistory: 'Adoption in European subsidiary lagging (40% vs 85% target). Support tickets up 25%.',
      stakeholderNotes: 'CIO (exec sponsor), VP Operations (champion), IT Director (day-to-day), Procurement (renewal)',
      businessObjectives: 'Value delivered, roadmap preview, adoption plan for EU, renewal discussion',
    },
  },

  'customer-success-leader-renewal-risk-mitigator': {
    skillId: 'customer-success-leader-renewal-risk-mitigator',
    defaultTestCaseId: 'renewal-risk-default-1',
    description: 'Mitigating renewal risk for key account',
    inputPayload: {
      customerName: 'TechStart Solutions',
      arrAtRisk: '$500K ARR',
      renewalDate: '60 days from now',
      riskSignals: `Health score dropped from 85 to 62
Executive sponsor departed
Competitor demo scheduled
Usage declined 30% after layoffs
Budget review ongoing`,
      stakeholders: '3-year customer, was reference customer, expanded 2x. New VP making changes.',
      valueDelivered: 'Available levers: Pricing flexibility (up to 10%), extended term discount, professional services credits, product roadmap influence',
    },
  },

  'customer-success-leader-voice-of-customer-synthesizer': {
    skillId: 'customer-success-leader-voice-of-customer-synthesizer',
    defaultTestCaseId: 'voc-synthesizer-default-1',
    description: 'Synthesizing customer feedback across channels',
    inputPayload: {
      feedbackSources: `NPS Survey (Q4 2024):
- Promoters (9-10): 45% - "Love the automation features", "Support team is excellent"
- Passives (7-8): 30% - "Good product but expensive", "Missing mobile app"
- Detractors (0-6): 25% - "Too complex", "Integration issues", "Slow performance"

Support Tickets (Last 90 days):
- 340 total tickets
- Top issues: API timeouts (45), Dashboard slow loading (38), Export failures (25)
- Avg resolution: 4.2 hours

G2 Reviews (Last 6 months):
- 4.2/5 average (87 reviews)
- Pros: Feature-rich, Good integrations, Helpful support
- Cons: Steep learning curve, Pricing, Mobile experience

QBR Feedback:
- 5 enterprise customers expressed concerns about performance at scale
- 3 customers requested better reporting capabilities
- 2 customers considering competitors due to pricing`,
      timePeriod: 'Q4 2024',
      customerSegment: 'Enterprise ($50K+ ARR)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY & COMPLIANCE ANALYST SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const SECURITY_COMPLIANCE_ANALYST_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'security-compliance-analyst-policy-to-control-mapper': {
    skillId: 'security-compliance-analyst-policy-to-control-mapper',
    defaultTestCaseId: 'policy-control-default-1',
    description: 'Mapping policies to security controls',
    inputPayload: {
      framework: 'SOC 2 Type II',
      controlDomain: 'Access Control',
      currentPolicies: `Access Control Policy v2.1:
- All access requires manager approval
- Quarterly access reviews required
- MFA required for all systems
- Privileged access requires additional approval
- Access removed within 24 hours of termination`,
      existingEvidence: 'Primary systems: AWS, Okta, GitHub, Salesforce, Slack. Need to map policy to specific technical and operational controls with evidence requirements.',
      auditTimeline: 'SOC 2 audit in 3 months',
    },
  },

  'security-compliance-analyst-security-incident-communicator': {
    skillId: 'security-compliance-analyst-security-incident-communicator',
    defaultTestCaseId: 'incident-comm-default-1',
    description: 'Creating security incident communications',
    inputPayload: {
      incidentType: 'Data Breach',
      severity: 'High',
      incidentDetails: 'Unauthorized access to customer data detected. Attacker gained access via compromised employee credentials. 500 customer records potentially exposed. Detected: 2pm today. Contained: 5pm. Investigation ongoing.',
      impactAssessment: 'Customer PII (names, emails, phone numbers). No financial data or passwords exposed. Affected customers identified. GDPR applies (EU customers affected). State breach notification laws may apply.',
      mitigationStatus: 'Contained. Internal within 24 hours, external within 72 hours per GDPR.',
      audiences: 'Internal leadership, affected customers, regulators (if required), employees',
    },
  },

  'security-compliance-analyst-vendor-security-assessment': {
    skillId: 'security-compliance-analyst-vendor-security-assessment',
    defaultTestCaseId: 'vendor-security-default-1',
    description: 'Assessing vendor security posture',
    inputPayload: {
      vendorName: 'DataSync Cloud Services',
      vendorCategory: 'SaaS - Data Integration',
      dataAccess: 'Will have access to customer PII, financial data, and proprietary business metrics. API integration with production systems.',
      questionnaireResponses: `SOC 2 Type II: Yes, report available (dated 6 months ago)
Encryption: AES-256 at rest, TLS 1.3 in transit
Data Centers: AWS US-East-1, EU-West-1, with disaster recovery
Penetration Testing: Annual third-party pentests, last completed 3 months ago
Access Control: SSO via SAML, RBAC, MFA enforced
Incident Response: 24/7 SOC, documented IR plan, 4-hour SLA for critical issues
Data Retention: Configurable, default 90 days, compliant delete within 30 days
Subprocessors: 3 listed (AWS, Datadog, PagerDuty)
Insurance: $5M cyber liability coverage`,
      companyRequirements: `Must comply with: SOC 2, GDPR, CCPA, HIPAA (we have healthcare customers)
Require: Annual pentests, MFA, encryption at rest/transit, data residency options
Prefer: Zero-trust architecture, FedRAMP (future government contracts)
Risk appetite: Medium - strategic vendor, willing to accept reasonable risks with mitigations`,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MARKETING OPERATIONS SPECIALIST SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const MARKETING_OPERATIONS_SPECIALIST_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'marketing-operations-specialist-campaign-qa-attribution-audit': {
    skillId: 'marketing-operations-specialist-campaign-qa-attribution-audit',
    defaultTestCaseId: 'campaign-qa-default-1',
    description: 'Auditing campaign tracking and attribution',
    inputPayload: {
      campaignName: 'Q4 Product Launch Campaign',
      channels: 'Paid social (LinkedIn, Facebook), paid search (Google), email, webinar',
      utmStructure: 'utm_source/medium/campaign/content/term. 5 unique landing pages with form submissions.',
      crmMappings: 'HubSpot (marketing automation) to Salesforce (CRM). Some leads showing "direct" source. LinkedIn data not syncing to Salesforce.',
      leadRouting: 'Form submissions route to sales based on company size and geography. Webinar attribution unclear.',
      attributionModel: 'First-touch for MQLs, multi-touch for pipeline. Using GA4 and Segment for tracking.',
    },
  },

  'marketing-operations-specialist-marketing-automation-flow-builder': {
    skillId: 'marketing-operations-specialist-marketing-automation-flow-builder',
    defaultTestCaseId: 'automation-flow-default-1',
    description: 'Building marketing automation workflow',
    inputPayload: {
      automationGoal: 'Lead nurture sequence for trial signups who have not converted after 14 days',
      targetAudience: 'Trial signup date was 14+ days ago AND status is not "Converted" AND has not unsubscribed',
      triggerEvents: 'Day 0: Check product usage score. High usage → Path A (close to conversion). Low usage → Path B (needs education). No usage → Path C (re-engagement).',
      channels: 'Email (primary), in-app notifications (secondary)',
      contentAssets: 'Each path has 3-5 emails over 14 days with exit conditions. Product usage data synced from Segment, updated daily.',
      mapPlatform: 'HubSpot',
      flowLength: 'Multi-week (2-4 weeks). Must respect send frequency limits (max 2 emails/week per contact)',
    },
  },

  'marketing-operations-specialist-data-enrichment-pipeline-designer': {
    skillId: 'marketing-operations-specialist-data-enrichment-pipeline-designer',
    defaultTestCaseId: 'data-enrichment-default-1',
    description: 'Designing data enrichment pipeline for lead scoring',
    inputPayload: {
      enrichmentGoals: 'Improve lead scoring accuracy by enriching firmographic and technographic data. Enable better segmentation for personalized campaigns.',
      currentSources: `Current data sources:
- Form submissions (basic contact info)
- Website activity (Segment)
- Email engagement (HubSpot)
- CRM records (Salesforce)`,
      dataQualityIssues: `40% of records missing company size
60% missing industry classification
Job titles inconsistent (CEO vs Chief Executive Officer)
Duplicate records estimated at 15%
Phone numbers often invalid/outdated`,
      scoringCriteria: `Current lead scoring:
- Form fills: +10 points
- Email opens: +2 points
- Website visits: +5 points
- Demo request: +50 points
Need to add: company fit score, buying intent signals`,
      techStack: 'HubSpot (marketing automation), Salesforce (CRM), Segment (CDP), Snowflake (data warehouse)',
      budget: '$5,000/month for enrichment tools',
      volumeEstimate: '10,000 new leads per month, 500,000 existing records needing enrichment',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT DISCOVERY LEAD SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const PRODUCT_DISCOVERY_LEAD_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'product-discovery-lead-discovery-sprint-coach': {
    skillId: 'product-discovery-lead-discovery-sprint-coach',
    defaultTestCaseId: 'discovery-sprint-default-1',
    description: 'Facilitating product discovery sprint',
    inputPayload: {
      productArea: 'User Onboarding Flow',
      desiredOutcome: 'Validated solution hypothesis ready for design sprint or direct implementation. 2-week discovery sprint.',
      targetPersona: 'New users attempting product onboarding. Team is 1 PM, 2 designers, 3 engineers, 1 data analyst (new to structured discovery).',
      hypotheses: 'Users are abandoning our onboarding flow at 60% rate due to complexity or unclear value proposition.',
      existingData: 'Analytics showing drop-off points, 3 support tickets about onboarding confusion, one customer churn exit survey mention',
      interviewDuration: '45 minutes. Limited access to users (can schedule 5-8 interviews). Engineering capacity for prototyping is 1 engineer for 1 week.',
    },
  },

  'product-discovery-lead-research-insight-synthesizer': {
    skillId: 'product-discovery-lead-research-insight-synthesizer',
    defaultTestCaseId: 'insight-synthesizer-default-1',
    description: 'Synthesizing discovery research findings',
    inputPayload: {
      researchObjective: 'Identify top 3 opportunities with supporting evidence and confidence levels for roadmap planning',
      researchNotes: `8 user interviews (mix of churned and active users). Competitive analysis of 5 competitors. Analytics review of last 90 days. Support ticket analysis (50 tickets reviewed). Sales call recordings (10 calls).
Findings:
- Interviews: Users confused by pricing tiers, want simpler setup, value integrations most
- Competitive: Competitors offer guided setup wizards, better mobile experience
- Analytics: 70% drop at step 3 of onboarding, mobile users 2x more likely to abandon
- Support: Top issue is integration setup, second is billing questions
- Sales: Prospects ask about time-to-value, compare us to Competitor X`,
      participantContext: 'Mix of churned and active users from mid-market segment. 8 participants interviewed.',
      stakeholders: 'Product leadership and stakeholders for roadmap planning',
      outputFormat: 'Insight cards with evidence',
    },
  },

  'product-discovery-lead-assumption-testing-protocol': {
    skillId: 'product-discovery-lead-assumption-testing-protocol',
    defaultTestCaseId: 'assumption-testing-default-1',
    description: 'Creating protocol to test product assumptions',
    inputPayload: {
      assumption: 'Enterprise customers will pay 3x more for a dedicated account manager and SLA guarantees.',
      context: 'We are launching an Enterprise tier. Current largest customers pay $500/month. Proposed Enterprise tier would be $1,500/month with dedicated support.',
      riskLevel: 'High (pricing strategy depends on this)',
      constraints: `Time: 2 weeks to validate
Budget: $2,000 for incentives/research
Access: Have relationships with 20 enterprise prospects, 5 current large customers`,
      experimentType: 'Qualitative + Quantitative Mix',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS ENGINEER SKILLS
// ═══════════════════════════════════════════════════════════════════════════

export const ANALYTICS_ENGINEER_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'analytics-engineer-insight-pack-generator': {
    skillId: 'analytics-engineer-insight-pack-generator',
    defaultTestCaseId: 'insight-pack-default-1',
    description: 'Generating data insight pack for stakeholders',
    inputPayload: {
      analysisGoal: 'Understand why Q4 revenue was 15% below forecast. Identify root causes and leading indicators we missed.',
      dataSample: `Monthly Revenue (millions):
Oct: $4.2 (forecast: $4.8)
Nov: $3.9 (forecast: $5.0)
Dec: $4.1 (forecast: $5.2)

By Segment:
Enterprise: $7.8 (on target)
Mid-Market: $3.2 (20% below)
SMB: $1.2 (35% below)

Pipeline at Start of Q4: $45M
Pipeline at End of Q4: $28M
Win Rate: 18% (vs 25% historical)`,
      dataDescription: 'Revenue data from Salesforce, pipeline metrics, segment breakdown. 3 years of historical data available for comparison.',
      audience: 'CFO and revenue leadership team',
      visualPreferences: 'Clear, executive-friendly charts. Waterfall for variance analysis. Trend lines for patterns.',
    },
  },

  'analytics-engineer-data-quality-sla-monitor': {
    skillId: 'analytics-engineer-data-quality-sla-monitor',
    defaultTestCaseId: 'data-quality-sla-default-1',
    description: 'Creating data quality SLA monitoring framework',
    inputPayload: {
      dataSource: 'Customer 360 Data Product',
      dataSchema: `Tables:
- customers (customer_id, name, email, created_at, segment, health_score)
- events (event_id, customer_id, event_type, timestamp, properties)
- subscriptions (sub_id, customer_id, plan, mrr, start_date, end_date)
- support_tickets (ticket_id, customer_id, created_at, resolved_at, category)

Refresh: Customers/Subscriptions hourly, Events real-time, Tickets every 15 min`,
      businessCriticality: 'Critical - powers customer success dashboards, executive reporting, and automated health alerts',
      knownIssues: `Occasional duplicate events (estimated 0.5%)
Health score sometimes null for new customers
MRR doesn't always match billing system
Timezone inconsistencies in timestamps`,
      stakeholders: 'Customer Success (primary), Finance (secondary), Product Analytics (tertiary)',
      refreshFrequency: 'Hourly for most tables, real-time for events stream',
    },
  },

  'analytics-engineer-self-serve-analytics-enabler': {
    skillId: 'analytics-engineer-self-serve-analytics-enabler',
    defaultTestCaseId: 'self-serve-analytics-default-1',
    description: 'Enabling self-serve analytics for business users',
    inputPayload: {
      businessDomain: 'E-commerce operations - order fulfillment, inventory, and customer satisfaction',
      targetUsers: `Ops Managers (5): Need daily operational dashboards, ad-hoc queries on fulfillment times
Merchandising Team (8): Product performance, inventory levels, reorder triggers
Customer Service Leads (3): Customer satisfaction trends, return analysis
Current SQL skill level: Basic (can filter and group) to None`,
      dataSources: `Available in Snowflake:
- orders (10M rows, 3 years)
- order_items (50M rows)
- inventory (updated hourly)
- products (50K SKUs)
- customers (2M records)
- returns (500K records)
- customer_feedback (200K surveys)`,
      keyMetrics: `Must support:
- Fulfillment rate and time (by warehouse, product category)
- Inventory turnover and stockout rates
- Customer satisfaction (NPS, CSAT) by segment
- Return rates and reasons
- Revenue by product/category/region`,
      existingTools: 'Looker (limited adoption), Snowflake (analytics engineers only), Google Sheets (heavily used)',
      currentChallenges: 'Users rely on analytics team for basic questions. Looker dashboards outdated. No documentation. Metrics definitions inconsistent.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED EXPORT - All role template test data
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_TEMPLATE_DEFAULT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  ...SOFTWARE_ENGINEER_TEST_DATA,
  ...BUSINESS_ANALYST_TEST_DATA,
  ...MARKETING_SPECIALIST_TEST_DATA,
  ...MARKETING_MANAGER_TEST_DATA,
  ...CREATIVE_DIRECTOR_TEST_DATA,
  ...PRODUCT_MANAGER_TEST_DATA,
  ...DATA_ANALYST_TEST_DATA,
  ...PROJECT_MANAGER_TEST_DATA,
  ...UX_DESIGNER_TEST_DATA,
  ...SALES_REPRESENTATIVE_TEST_DATA,
  ...HR_PROFESSIONAL_TEST_DATA,
  ...FINANCIAL_ANALYST_TEST_DATA,
  ...CONTENT_WRITER_TEST_DATA,
  ...CUSTOMER_SUCCESS_MANAGER_TEST_DATA,
  ...DEVOPS_ENGINEER_TEST_DATA,
  ...HEALTHCARE_PROFESSIONAL_TEST_DATA,
  ...OPERATIONS_MANAGER_TEST_DATA,
  ...TEACHER_EDUCATOR_TEST_DATA,
  ...LEGAL_PROFESSIONAL_TEST_DATA,
  ...SUPPLY_CHAIN_MANAGER_TEST_DATA,
  ...SEO_SPECIALIST_TEST_DATA,
  ...TRAINER_TEST_DATA,
  ...CONSULTANT_TEST_DATA,
  ...ENTREPRENEUR_TEST_DATA,
  ...REVENUE_OPERATIONS_MANAGER_TEST_DATA,
  ...AI_SOLUTIONS_ARCHITECT_TEST_DATA,
  ...CUSTOMER_SUCCESS_LEADER_TEST_DATA,
  ...SECURITY_COMPLIANCE_ANALYST_TEST_DATA,
  ...MARKETING_OPERATIONS_SPECIALIST_TEST_DATA,
  ...PRODUCT_DISCOVERY_LEAD_TEST_DATA,
  ...ANALYTICS_ENGINEER_TEST_DATA,
};
