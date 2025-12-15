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
      projectName: 'Payment Gateway API',
      projectDescription: 'RESTful API for processing credit card payments, handling refunds, and managing subscriptions. Built with Node.js/Express, uses Stripe as payment processor.',
      targetAudience: 'External developers integrating our payment system',
      documentationType: 'API Reference Documentation',
      existingCode: `// Sample endpoint
POST /api/v1/payments/charge
Request: { amount: number, currency: string, customerId: string, paymentMethodId: string }
Response: { paymentId: string, status: 'succeeded' | 'failed', receiptUrl: string }

POST /api/v1/subscriptions/create
Request: { customerId: string, priceId: string, trialDays?: number }
Response: { subscriptionId: string, status: string, currentPeriodEnd: string }`,
    },
  },

  'software-engineer-system-design-architect': {
    skillId: 'software-engineer-system-design-architect',
    defaultTestCaseId: 'system-design-default-1',
    description: 'Designing a real-time messaging system',
    inputPayload: {
      systemName: 'Enterprise Real-Time Messaging Platform',
      requirements: `Functional Requirements:
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
      constraints: 'Budget: $50K/month infrastructure. Team: 5 backend engineers. Timeline: MVP in 3 months.',
      existingSystems: 'We have an existing monolithic Django application for user management. PostgreSQL for user data. AWS infrastructure.',
    },
  },

  'software-engineer-technical-debt-scanner': {
    skillId: 'software-engineer-technical-debt-scanner',
    defaultTestCaseId: 'tech-debt-default-1',
    description: 'Scanning e-commerce codebase for technical debt',
    inputPayload: {
      codebaseDescription: `E-commerce platform built over 5 years:
- 250K lines of code across 3 services
- Node.js backend (v12, needs upgrade)
- React frontend (class components, no hooks)
- MongoDB database with no schema validation
- No automated tests (manual QA only)
- Deployment via FTP to EC2 instances
- jQuery mixed with React in some pages
- 15 npm packages with known vulnerabilities`,
      knownIssues: 'Frequent production outages during sales events. New features take 3x longer than estimated. Onboarding new developers takes 2+ months.',
      assessmentScope: 'Full codebase assessment focusing on scalability, maintainability, and security',
    },
  },

  'software-engineer-tech-debt-stakeholder-brief': {
    skillId: 'software-engineer-tech-debt-stakeholder-brief',
    defaultTestCaseId: 'tech-debt-brief-default-1',
    description: 'Creating executive brief on technical debt impact',
    inputPayload: {
      technicalFindings: `Critical Issues Found:
1. No automated testing - 40% of releases have bugs
2. Outdated dependencies with 15 security vulnerabilities
3. Monolithic architecture causing 2-hour deployments
4. Database queries not optimized - 5s average response time
5. No disaster recovery plan

Business Impact:
- $50K/month in bug fixes
- 3 production outages in last quarter
- Customer churn up 15% due to performance issues`,
      audience: 'CEO, CFO, and Board of Directors',
      businessContext: 'Company is preparing for Series B fundraising. Investors have asked about technical scalability.',
      competingPriorities: 'Q4 feature roadmap includes 5 major features requested by enterprise customers',
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
9. Database index optimization
10. Migrate from jQuery to React`,
      teamCapacity: '2 senior engineers, 3 mid-level engineers. Can dedicate 30% of sprint to debt.',
      businessConstraints: 'Black Friday in 8 weeks - must maintain stability. Q1 launch of mobile app depends on API stability.',
      riskTolerance: 'Medium - willing to accept some short-term risk for long-term stability',
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
      businessObjectives: 'Reduce support ticket volume by 40%, improve customer satisfaction score from 72 to 85, enable 24/7 self-service capabilities',
      stakeholders: 'VP Customer Success (sponsor), Support Team Lead, IT Director, 3 Enterprise Customers (advisory)',
      scope: 'In scope: Account management, billing history, support ticket creation, knowledge base. Out of scope: Live chat, phone support integration',
      existingSystems: 'Current Zendesk integration, Salesforce CRM, Stripe billing, PostgreSQL customer database',
    },
  },

  'business-analyst-user-story-acceptance-criteria-generator': {
    skillId: 'business-analyst-user-story-acceptance-criteria-generator',
    defaultTestCaseId: 'user-story-default-1',
    description: 'Writing user stories for checkout flow',
    inputPayload: {
      featureDescription: 'Multi-step checkout process with address validation, payment method selection, order review, and confirmation',
      userPersona: 'Sarah, 35, busy professional who shops on mobile during commute. Values speed and simplicity. Has saved payment methods.',
      businessContext: 'Cart abandonment rate is 68%. Competitors offer 1-click checkout. Average checkout time is 4.5 minutes.',
      technicalConstraints: 'Must integrate with existing cart API, Stripe payments, and ShipStation for shipping rates. Mobile-first design required.',
      storyCount: '8-10 stories',
    },
  },

  'business-analyst-process-analysis-optimization-report': {
    skillId: 'business-analyst-process-analysis-optimization-report',
    defaultTestCaseId: 'process-analysis-default-1',
    description: 'Analyzing employee onboarding process',
    inputPayload: {
      processName: 'New Employee Onboarding',
      currentProcess: `Day 1: HR paperwork (2 hrs), IT equipment setup (3 hrs wait), Badge creation (1 hr)
Days 2-5: Department orientation, system access requests (24-48hr each), compliance training
Week 2: Role-specific training begins
Week 3-4: Shadow existing employee

Pain points: IT equipment often not ready, system access delayed, no single source of information`,
      metrics: 'Time to productivity: 45 days. New hire satisfaction: 65%. IT ticket volume per new hire: 12 tickets. Manager time spent: 15 hours per new hire.',
      optimizationGoal: 'Reduce time to productivity to 21 days, improve satisfaction to 85%',
    },
  },

  'business-analyst-data-analysis-insights-report-generator': {
    skillId: 'business-analyst-data-analysis-insights-report-generator',
    defaultTestCaseId: 'data-insights-default-1',
    description: 'Analyzing customer churn data',
    inputPayload: {
      dataDescription: `12-month customer data with 50,000 records:
- Customer demographics (industry, company size, location)
- Subscription tier and pricing
- Feature usage (login frequency, features used, support tickets)
- NPS scores and survey responses
- Churn flag (15% annual churn rate)`,
      analysisQuestions: '1. What are the leading indicators of churn? 2. Which customer segments have highest/lowest churn? 3. Is there a correlation between support tickets and churn? 4. What is the revenue impact of churn?',
      audience: 'Customer Success leadership and Executive team',
      format: 'Executive summary with detailed appendix',
    },
  },

  'business-analyst-executive-stakeholder-communication': {
    skillId: 'business-analyst-executive-stakeholder-communication',
    defaultTestCaseId: 'exec-comm-default-1',
    description: 'Creating executive update on digital transformation',
    inputPayload: {
      topic: 'Digital Transformation Program - Q3 Status Update',
      keyMessages: 'Program is 2 months behind schedule due to vendor delays. Budget is on track. Quick wins delivered: automated reporting (saving 20 hrs/week), new CRM live with 85% adoption. Risks: integration complexity, change resistance.',
      audience: 'CEO, CFO, COO, Board of Directors',
      tone: 'Transparent, solution-oriented, confident',
      supportingData: 'Budget: $2.5M spent of $4M. Timeline: 60% complete. ROI projection: $8M over 3 years.',
    },
  },

  'business-analyst-sql-query-builder-optimizer': {
    skillId: 'business-analyst-sql-query-builder-optimizer',
    defaultTestCaseId: 'sql-builder-default-1',
    description: 'Building sales analytics query',
    inputPayload: {
      dataRequest: 'Monthly revenue by product category, customer segment, and region for the last 12 months with YoY comparison',
      tableStructure: `Tables:
- orders (order_id, customer_id, order_date, total_amount, status)
- order_items (order_id, product_id, quantity, unit_price)
- products (product_id, name, category_id, cost)
- categories (category_id, name)
- customers (customer_id, name, segment, region)`,
      complexity: 'Advanced - include CTEs and window functions',
      outputFormat: 'Pivot-style for Excel import',
    },
  },

  'business-analyst-gap-analysis-strategic-roadmap': {
    skillId: 'business-analyst-gap-analysis-strategic-roadmap',
    defaultTestCaseId: 'gap-analysis-default-1',
    description: 'Gap analysis for market expansion',
    inputPayload: {
      currentState: 'B2B SaaS serving 500 SMB customers in US. $5M ARR. 15 employees. Single product for project management.',
      desiredState: 'Expand to Enterprise segment, launch in EU market, $20M ARR in 3 years, full product suite including resource management and reporting.',
      scope: 'Product capabilities, sales/marketing, operations, compliance, technology',
      constraints: 'Available investment: $10M Series A. Cannot hire more than 50 people in 18 months.',
      resourceAvailability: 'Current team stretched thin. Key hires needed: VP Sales, EU GM, 5 enterprise AEs.',
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
- Small business participation (10%)`,
      companyCapabilities: 'FedRAMP Moderate authorized. 3 similar contracts completed. Team of 20 cloud engineers. Not a small business.',
      strategicFit: 'Aligns with government practice growth strategy. Would be largest contract to date.',
    },
  },

  'business-analyst-rfp-compliance-matrix-generator': {
    skillId: 'business-analyst-rfp-compliance-matrix-generator',
    defaultTestCaseId: 'rfp-compliance-default-1',
    description: 'Creating RFP compliance matrix',
    inputPayload: {
      rfpRequirements: `Section C - Technical Requirements:
C.1 - Vendor must provide 99.99% uptime SLA
C.2 - All data must be encrypted at rest (AES-256) and in transit (TLS 1.3)
C.3 - System must support 10,000 concurrent users
C.4 - Vendor must have SOC 2 Type II certification
C.5 - 24/7 support with dedicated account manager
C.6 - Implementation within 90 days of contract award
C.7 - Training for up to 500 users included`,
      productCapabilities: 'SaaS platform, 99.95% historical uptime, AES-256 encryption, SOC 2 Type II certified, scales to 50K users, typical implementation 60-90 days',
      matrixFormat: 'Detailed with compliance status, evidence location, and gap remediation plan',
    },
  },

  'business-analyst-rfp-section-response-writer': {
    skillId: 'business-analyst-rfp-section-response-writer',
    defaultTestCaseId: 'rfp-response-default-1',
    description: 'Writing technical approach section',
    inputPayload: {
      sectionTitle: 'Technical Approach - Cloud Migration Methodology',
      requirements: 'Describe your approach to migrating 50 legacy applications to cloud, including assessment, planning, execution, and validation phases.',
      companyDifferentiators: 'Proprietary migration assessment tool (MigrateIQ), 200+ successful migrations, average 40% cost reduction, automated testing framework',
      pageLimit: '10 pages',
      constraints: 'Must reference past performance. Include risk mitigation. Address FedRAMP compliance.',
    },
  },

  'business-analyst-proposal-executive-summary-generator': {
    skillId: 'business-analyst-proposal-executive-summary-generator',
    defaultTestCaseId: 'proposal-summary-default-1',
    description: 'Writing proposal executive summary',
    inputPayload: {
      proposalContext: 'Response to RFP for enterprise CRM implementation at Fortune 500 manufacturing company. $3M contract over 2 years.',
      keyDifferentiators: '1. Manufacturing industry expertise (50+ implementations), 2. Proprietary integration framework, 3. 98% on-time delivery, 4. Included change management services',
      clientPainPoints: 'Disconnected sales data across 15 business units, no pipeline visibility, lost deals due to slow quote process',
      proposedSolution: 'Salesforce implementation with custom CPQ, unified reporting, mobile access for field sales',
      competitiveAdvantage: 'Only vendor with manufacturing-specific accelerator. 3 similar implementations at competitors.',
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
      campaign: 'Launch of AI-powered analytics dashboard for SMBs',
      platforms: 'LinkedIn, Twitter/X, Instagram, Facebook',
      brandVoice: 'Professional but approachable, data-driven, empowering small business owners',
      keyMessages: '1. No more spreadsheet chaos, 2. Insights in 60 seconds, 3. Affordable enterprise-grade analytics, 4. Free 14-day trial',
      variations: '3 variations per platform',
    },
  },

  'marketing-specialist-email-campaign-automation-suite': {
    skillId: 'marketing-specialist-email-campaign-automation-suite',
    defaultTestCaseId: 'email-campaign-default-1',
    description: 'Building onboarding email sequence',
    inputPayload: {
      campaignGoal: 'Activate new trial users within 7 days',
      audience: 'SaaS trial signups - marketing managers at mid-size companies',
      sequenceLength: '7 emails over 14 days',
      keyActions: 'Complete profile, connect data source, create first dashboard, invite team member, upgrade to paid',
      framework: 'Jobs-to-be-done framework',
    },
  },

  'marketing-specialist-seo-content-optimizer-audit-tool': {
    skillId: 'marketing-specialist-seo-content-optimizer-audit-tool',
    defaultTestCaseId: 'seo-content-default-1',
    description: 'Optimizing blog post for search',
    inputPayload: {
      contentUrl: 'https://example.com/blog/marketing-automation-guide',
      targetKeywords: 'marketing automation, marketing automation software, email automation',
      currentContent: `Marketing Automation: A Complete Guide

Marketing automation helps businesses streamline their marketing efforts. In this guide, we cover everything you need to know about marketing automation.

What is Marketing Automation?
Marketing automation uses software to automate marketing tasks...

[2000 word article continues]`,
      competitorUrls: 'HubSpot, Mailchimp, and ActiveCampaign rank for these terms',
      wordCountTarget: '3000 words',
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
      goals: 'Target CAC: $250, Target ROAS: 3.0, MQL goal: 500',
      benchmarks: 'Industry average CTR: 2.5%, Industry average conversion rate: 3%',
    },
  },

  'marketing-specialist-content-calendar-strategy-planner': {
    skillId: 'marketing-specialist-content-calendar-strategy-planner',
    defaultTestCaseId: 'content-calendar-default-1',
    description: 'Planning Q1 content calendar',
    inputPayload: {
      businessGoals: 'Increase organic traffic by 50%, generate 200 MQLs from content, establish thought leadership in AI for HR',
      contentPillars: 'AI in HR, Employee Experience, HR Analytics, Future of Work',
      resources: '1 content manager, 2 freelance writers, $5K/month budget for promotion',
      channels: 'Blog, LinkedIn, YouTube, Newsletter (15K subscribers)',
      events: 'HR Tech Conference (March), Product launch (February), Annual report (January)',
    },
  },

  'marketing-specialist-competitor-analysis-market-research': {
    skillId: 'marketing-specialist-competitor-analysis-market-research',
    defaultTestCaseId: 'competitor-analysis-default-1',
    description: 'Analyzing competitor positioning',
    inputPayload: {
      ourProduct: 'AI-powered customer feedback analysis platform for mid-market SaaS companies',
      competitors: 'Medallia, Qualtrics, SurveyMonkey, Typeform',
      researchFocus: 'Pricing strategy, feature comparison, messaging and positioning, market share, recent product launches',
      ourDifferentiators: 'AI-native, purpose-built for SaaS, integrates with product analytics, 10x faster insights',
      targetMarket: 'B2B SaaS companies with 50-500 employees',
    },
  },

  'marketing-specialist-a-b-test-conversion-optimizer': {
    skillId: 'marketing-specialist-a-b-test-conversion-optimizer',
    defaultTestCaseId: 'ab-test-default-1',
    description: 'Designing pricing page A/B test',
    inputPayload: {
      pageType: 'SaaS Pricing Page',
      currentPerformance: 'Conversion rate: 2.3%, Average traffic: 10,000 visitors/month, Current pricing: 3 tiers ($29, $79, $199)',
      hypothesis: 'Adding a fourth enterprise tier and social proof will increase both conversion rate and average deal size',
      goals: 'Increase conversion rate to 3%, increase ARPU by 20%',
      constraints: 'Cannot change actual prices. Must maintain mobile responsiveness. Test duration: 4 weeks minimum.',
    },
  },

  'marketing-specialist-google-ads-campaign-builder': {
    skillId: 'marketing-specialist-google-ads-campaign-builder',
    defaultTestCaseId: 'google-ads-default-1',
    description: 'Building Google Ads campaign for SaaS product',
    inputPayload: {
      product: 'Project management software for creative agencies',
      budget: '$10,000/month',
      targetAudience: 'Creative directors, agency owners, project managers at agencies with 10-100 employees',
      goals: 'Generate demo requests at $150 CAC',
      competitors: 'Monday.com, Asana, Basecamp, Teamwork',
      landingPage: 'https://example.com/creative-agencies',
    },
  },

  'marketing-specialist-meta-ads-campaign-builder': {
    skillId: 'marketing-specialist-meta-ads-campaign-builder',
    defaultTestCaseId: 'meta-ads-default-1',
    description: 'Building Meta retargeting campaign',
    inputPayload: {
      objective: 'Retarget website visitors who viewed pricing but did not convert',
      budget: '$5,000/month',
      targetAudience: 'Visited pricing page in last 30 days, did not sign up, US-based, B2B decision makers',
      creativeAssets: 'Customer testimonial videos, product demo screenshots, case study graphics',
      offer: '20% discount for annual plan, extended 30-day trial',
      competitors: 'Similar campaigns from Notion, ClickUp, Airtable',
    },
  },

  'marketing-specialist-google-shopping-campaign-builder': {
    skillId: 'marketing-specialist-google-shopping-campaign-builder',
    defaultTestCaseId: 'google-shopping-default-1',
    description: 'Building Google Shopping campaign for e-commerce',
    inputPayload: {
      productCategory: 'Premium office furniture - standing desks and ergonomic chairs',
      budget: '$20,000/month',
      targetRoas: '400%',
      productFeed: '150 SKUs, price range $300-$2000, free shipping over $500',
      competitivePosition: 'Premium positioning, higher price than Amazon but better quality and warranty',
      seasonality: 'Peak in January (New Year resolutions) and August (back to school/office)',
    },
  },

  'marketing-specialist-google-local-inventory-ads-builder': {
    skillId: 'marketing-specialist-google-local-inventory-ads-builder',
    defaultTestCaseId: 'local-inventory-default-1',
    description: 'Setting up Local Inventory Ads for retail chain',
    inputPayload: {
      businessType: 'Sporting goods retailer with 25 locations',
      productCategories: 'Running shoes, fitness equipment, outdoor gear',
      inventorySystem: 'Retail Pro POS syncing inventory hourly',
      storeLocations: '25 stores across California, Texas, and Florida',
      storeVisitTracking: 'Yes, using Google store visit conversions',
    },
  },

  'marketing-specialist-linkedin-ads-campaign-builder': {
    skillId: 'marketing-specialist-linkedin-ads-campaign-builder',
    defaultTestCaseId: 'linkedin-ads-default-1',
    description: 'Building LinkedIn ABM campaign',
    inputPayload: {
      objective: 'Account-Based Marketing campaign targeting enterprise IT buyers',
      budget: '$15,000/month',
      targetAccounts: '500 target accounts in Fortune 1000, IT decision makers (CIO, CTO, VP IT)',
      contentAssets: 'Whitepaper: Enterprise Cloud Strategy 2025, Webinar recording, ROI calculator',
      campaignType: 'Sponsored Content + Message Ads + Conversation Ads',
      competitors: 'AWS, Azure, Google Cloud targeting same accounts',
    },
  },

  'marketing-specialist-podcast-youtube-script-generator': {
    skillId: 'marketing-specialist-podcast-youtube-script-generator',
    defaultTestCaseId: 'podcast-script-default-1',
    description: 'Creating podcast episode script',
    inputPayload: {
      showFormat: 'Interview-style B2B marketing podcast, 45 minutes',
      episode: 'Episode on "Building a Content Engine That Scales"',
      guest: 'VP of Marketing at a $100M ARR SaaS company who grew organic traffic 10x in 2 years',
      audience: 'Marketing leaders at growth-stage SaaS companies',
      sponsorIntegration: 'Mid-roll sponsor: Marketing automation platform',
      cta: 'Download our content strategy template',
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
      companyContext: 'B2B SaaS, $15M ARR, Series B funded, selling HR software to mid-market companies (100-1000 employees)',
      businessGoals: 'Grow to $30M ARR, expand from SMB to mid-market, launch 2 new products',
      budget: '$3M annual marketing budget (20% of target ARR)',
      currentChannels: 'Content marketing, Google Ads, LinkedIn, events (4 conferences)',
      competitivePosition: 'Challenger brand against Workday and BambooHR. Differentiated on AI features and ease of use.',
      businessType: 'B2B SaaS',
    },
  },

  'marketing-manager-marketing-performance-intelligence': {
    skillId: 'marketing-manager-marketing-performance-intelligence',
    defaultTestCaseId: 'marketing-intelligence-default-1',
    description: 'Monthly marketing performance review',
    inputPayload: {
      periodData: `October 2024 Marketing Performance:

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
      context: 'Q4 push for pipeline. Sales team at 85% of quota. Two competitors launched major campaigns.',
      priorities: 'Identify quick wins to close gap. Reallocate budget if needed. Prepare recommendations for leadership.',
    },
  },

  'marketing-manager-content-marketing-calendar-generator': {
    skillId: 'marketing-manager-content-marketing-calendar-generator',
    defaultTestCaseId: 'content-marketing-default-1',
    description: 'Q1 content marketing calendar',
    inputPayload: {
      contentPillars: 'HR Technology Trends, Employee Experience, People Analytics, Remote Work',
      businessPriorities: 'Product launch in February, Annual HR Tech report in January, Customer conference in March',
      resources: '1 content director, 2 writers, 1 designer, $10K monthly freelance budget',
      channels: 'Blog (3x/week), LinkedIn (daily), Newsletter (weekly), YouTube (2x/month)',
      context: 'Content drives 40% of our pipeline. SEO is primary acquisition channel.',
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
      projectName: 'Q1 Brand Awareness Campaign - "Work Smarter"',
      businessObjective: 'Increase unaided brand awareness from 12% to 25% in target market',
      targetAudience: 'HR leaders at mid-size companies (500-2000 employees) who are frustrated with legacy HR systems and open to modern solutions',
      keyMessage: 'Modern HR software that makes work feel less like work',
      deliverables: 'Hero video (60s, 30s, 15s cuts), print ads, digital banners, social content, OOH',
      mandatories: 'Include product UI shots, customer testimonial elements, new brand colors',
    },
  },

  'creative-director-enterprise-brand-identity-system': {
    skillId: 'creative-director-enterprise-brand-identity-system',
    defaultTestCaseId: 'brand-identity-default-1',
    description: 'Developing brand identity system',
    inputPayload: {
      brandName: 'Elevate HR',
      brandPositioning: 'The human-first HR platform that elevates the employee experience',
      brandPersonality: 'Innovative, approachable, empowering, trustworthy, modern',
      targetAudience: 'HR professionals who believe people are a company\'s greatest asset',
      competitors: 'Workday (corporate, complex), BambooHR (casual, SMB), Gusto (friendly, payroll-focused)',
      touchpoints: 'Product UI, marketing website, sales materials, event booths, swag, office environment',
    },
  },

  'creative-director-award-worthy-campaign-concept-engine': {
    skillId: 'creative-director-award-worthy-campaign-concept-engine',
    defaultTestCaseId: 'campaign-concept-default-1',
    description: 'Developing award-worthy campaign concept',
    inputPayload: {
      brief: 'Launch campaign for AI-powered recruiting feature that reduces time-to-hire by 50%',
      targetAudience: 'Talent acquisition leaders at fast-growing tech companies',
      brand: 'Innovative, bold, human-centered HR tech company',
      budget: '$500K production budget, $2M media spend',
      awardTargets: 'Cannes Lions, One Show, Clio Awards',
      constraints: 'Must work globally (no region-specific humor), must include product demo component',
    },
  },

  'creative-director-creative-work-critique-feedback': {
    skillId: 'creative-director-creative-work-critique-feedback',
    defaultTestCaseId: 'creative-critique-default-1',
    description: 'Reviewing campaign creative work',
    inputPayload: {
      workDescription: 'Video ad for B2B software product. 30-second spot showing a stressed HR manager drowning in paperwork, then discovering our product and becoming calm and productive. Ends with product logo and tagline "HR Made Human."',
      originalBrief: 'Show the transformation from chaos to clarity when using our HR platform. Target: HR managers. Tone: Empowering, modern.',
      specificConcerns: 'Does the "drowning in paperwork" metaphor feel dated? Is the transformation believable? Does it differentiate from competitors?',
      feedbackType: 'Constructive critique with specific recommendations',
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
      featureName: 'AI-Powered Resume Screening',
      problemStatement: 'Recruiters spend 23 hours per week screening resumes. 88% of resumes received are unqualified. This creates bottlenecks and delays hiring.',
      targetUsers: 'Recruiters and hiring managers at companies with 50+ open roles',
      successMetrics: 'Reduce time-to-screen by 75%, maintain 95% qualified candidate pass-through rate, NPS > 50 from recruiters',
      constraints: 'Must comply with EEOC guidelines, cannot use protected characteristics, must be explainable',
      audience: 'Engineering team, Design team, Legal review, Executive stakeholders',
    },
  },

  'product-manager-user-research-synthesis-engine': {
    skillId: 'product-manager-user-research-synthesis-engine',
    defaultTestCaseId: 'research-synthesis-default-1',
    description: 'Synthesizing user interview findings',
    inputPayload: {
      researchObjective: 'Understand pain points in the employee onboarding experience',
      rawFindings: `Interview 1 (HR Manager, 500-person company): "Onboarding is chaos. New hires don't know where to go for information. IT tickets take days."

Interview 2 (New Hire, Week 2): "I still don't have access to half the systems I need. My manager has been too busy to meet with me."

Interview 3 (Department Head): "I spend 20% of my time onboarding people. There's no standard process."

Survey Results (n=150): 65% rate onboarding as "poor" or "very poor". Top issues: system access (78%), unclear expectations (65%), lack of manager time (54%).`,
      productContext: 'We offer HR software with basic onboarding checklists. Considering major investment in onboarding module.',
    },
  },

  'product-manager-strategic-feature-prioritization': {
    skillId: 'product-manager-strategic-feature-prioritization',
    defaultTestCaseId: 'feature-prioritization-default-1',
    description: 'Prioritizing product roadmap features',
    inputPayload: {
      featureList: `1. AI Resume Screening (Large - 3 months)
2. Advanced Reporting Dashboard (Medium - 6 weeks)
3. Mobile App Redesign (Large - 4 months)
4. Slack Integration (Small - 2 weeks)
5. Bulk Data Import Tool (Medium - 4 weeks)
6. SSO/SAML Support (Medium - 6 weeks)
7. Custom Workflows Builder (Large - 5 months)
8. API Rate Limit Increase (Small - 1 week)`,
      strategicContext: 'Moving upmarket to enterprise. Current ARR $10M, target $25M in 2 years. Enterprise deals require SSO and advanced reporting.',
      constraints: 'Engineering team: 12 developers. Q1 capacity: ~16 engineering weeks after maintenance.',
      stakeholders: 'Sales (wants SSO urgently), CS (wants bulk import), CEO (wants AI features for differentiation)',
    },
  },

  'product-manager-competitive-intelligence-report': {
    skillId: 'product-manager-competitive-intelligence-report',
    defaultTestCaseId: 'competitive-intel-default-1',
    description: 'Competitive analysis report',
    inputPayload: {
      ourProduct: 'Mid-market HR platform with core HR, payroll, and benefits administration',
      competitors: 'Rippling, Gusto, Paylocity, Paycom',
      researchFocus: 'Feature gaps, pricing comparison, win/loss patterns, product roadmap signals',
      urgency: 'Q4 planning - need to inform 2025 roadmap decisions',
      specificQuestions: '1. Where are we losing deals and why? 2. What features do competitors have that we lack? 3. What is their AI strategy?',
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
      analysisGoal: 'Analyze customer retention by signup cohort and identify which features drive retention',
      tableSchema: `users (user_id, signup_date, plan_type, industry, company_size)
subscriptions (subscription_id, user_id, start_date, end_date, mrr, status)
feature_usage (user_id, feature_name, usage_date, usage_count)
events (user_id, event_name, event_date, properties)`,
      outputRequirements: 'Monthly cohort retention rates, feature adoption correlation with retention, segmented by plan type',
      performance: 'Query will run on 5M+ rows, needs to complete in < 30 seconds',
    },
  },

  'data-analyst-executive-data-analysis-report': {
    skillId: 'data-analyst-executive-data-analysis-report',
    defaultTestCaseId: 'data-report-default-1',
    description: 'Creating executive KPI report',
    inputPayload: {
      reportPurpose: 'Monthly board meeting - present key business metrics and insights',
      metrics: `Revenue: $1.2M (up 15% MoM)
Customers: 850 (up 8% MoM)
Churn: 3.2% (down from 4.1%)
NPS: 42 (up from 38)
CAC: $1,200 (down from $1,450)
LTV: $18,000
LTV:CAC: 15:1`,
      audience: 'Board of Directors and CEO',
      urgency: 'Board meeting in 3 days',
    },
  },

  'data-analyst-bi-dashboard-architect': {
    skillId: 'data-analyst-bi-dashboard-architect',
    defaultTestCaseId: 'bi-dashboard-default-1',
    description: 'Designing sales performance dashboard',
    inputPayload: {
      dashboardPurpose: 'Real-time sales team performance tracking for VP of Sales',
      keyMetrics: 'Pipeline value, conversion rates by stage, rep performance, forecast accuracy, activity metrics',
      dataSource: 'Salesforce CRM via Fivetran to Snowflake',
      users: 'VP Sales (executive view), Sales Managers (team view), Sales Reps (individual view)',
      complexity: 'Advanced - include drill-downs, alerts, and predictive elements',
    },
  },

  'data-analyst-data-quality-auditor': {
    skillId: 'data-analyst-data-quality-auditor',
    defaultTestCaseId: 'data-quality-default-1',
    description: 'Auditing CRM data quality',
    inputPayload: {
      dataSource: 'Salesforce CRM - Accounts, Contacts, Opportunities',
      knownIssues: 'Duplicate accounts suspected, missing contact emails, inconsistent industry coding',
      businessImpact: 'Marketing campaigns have 20% bounce rate, sales territories incorrectly assigned',
      regulations: 'GDPR compliance required for EU contacts',
    },
  },

  'data-analyst-a-b-test-statistical-analyzer': {
    skillId: 'data-analyst-a-b-test-statistical-analyzer',
    defaultTestCaseId: 'ab-test-analyzer-default-1',
    description: 'Analyzing pricing page A/B test results',
    inputPayload: {
      testDescription: 'Testing new pricing page design with simplified tiers vs. current 4-tier pricing',
      results: `Control (Current):
- Visitors: 15,000
- Conversions: 345
- Revenue: $52,000

Variant (New):
- Visitors: 15,200
- Conversions: 402
- Revenue: $58,500`,
      testDuration: '28 days',
      primaryMetric: 'Conversion rate',
      secondaryMetrics: 'Revenue per visitor, average deal size',
    },
  },

  'data-analyst-insight-pack-generator': {
    skillId: 'data-analyst-insight-pack-generator',
    defaultTestCaseId: 'insight-pack-default-1',
    description: 'Creating weekly insights pack',
    inputPayload: {
      dataScope: 'Product usage, customer health, revenue metrics for the past week',
      keyFindings: 'Feature X adoption dropped 15%, Enterprise segment NPS up 8 points, 3 accounts showing churn signals',
      audience: 'Product, Customer Success, and Executive leadership',
      format: 'Slide deck with key insights, supporting data, and recommended actions',
      guardrails: 'Focus on actionable insights. Max 10 slides. Include confidence levels.',
    },
  },

  'data-analyst-data-quality-sla-monitor': {
    skillId: 'data-analyst-data-quality-sla-monitor',
    defaultTestCaseId: 'data-sla-default-1',
    description: 'Setting up data quality monitoring',
    inputPayload: {
      dataPipeline: 'Salesforce → Fivetran → Snowflake → Looker',
      criticalTables: 'dim_customers, dim_products, fact_orders, fact_usage_events',
      slaRequirements: 'Data freshness: < 1 hour, Completeness: > 99%, Accuracy: > 99.9%',
      stakeholders: 'Data consumers in Sales, Marketing, Finance, and Product',
      alerting: 'Slack alerts for SLA breaches, weekly summary report',
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
      projectName: 'Corporate Website Redesign',
      objectives: 'Modernize brand presence, improve conversion rate from 1.5% to 3%, enhance mobile experience',
      scope: 'Full redesign of 50+ page corporate website including new CMS implementation',
      timeline: 'Must launch before annual conference in 16 weeks',
      resources: 'Project manager, 2 designers, 3 developers, content writer, SEO specialist',
      complexity: 'High - multiple stakeholder groups, legacy content migration, SEO preservation',
    },
  },

  'project-manager-risk-assessment-matrix': {
    skillId: 'project-manager-risk-assessment-matrix',
    defaultTestCaseId: 'risk-matrix-default-1',
    description: 'Creating risk assessment for ERP implementation',
    inputPayload: {
      projectContext: 'NetSuite ERP implementation replacing legacy accounting system. $500K budget, 9-month timeline.',
      knownRisks: 'Data migration complexity, user adoption resistance, integration with existing CRM, vendor resource availability',
      stakeholders: 'CFO (sponsor), Finance team, IT, Operations, Sales',
      riskAppetite: 'Low - critical business system, cannot afford extended downtime',
    },
  },

  'project-manager-executive-status-report-generator': {
    skillId: 'project-manager-executive-status-report-generator',
    defaultTestCaseId: 'status-report-default-1',
    description: 'Creating executive project status report',
    inputPayload: {
      projectName: 'Cloud Migration Initiative',
      currentStatus: 'Phase 2 of 4, 2 weeks behind schedule due to security compliance requirements',
      accomplishments: 'Completed infrastructure setup, migrated 15 of 45 applications, achieved FedRAMP authorization',
      upcomingMilestones: 'Database migration (Week 3), User acceptance testing (Week 5)',
      issuesRisks: 'Vendor delays on integration component, potential budget overrun of 10%',
      decisions: 'Need approval for $50K additional budget for security tooling',
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
      targetPersona: 'VP of Engineering at mid-market SaaS companies (200-1000 employees). Pain points: developer productivity, technical debt, hiring challenges.',
      product: 'Developer productivity platform that reduces code review time by 50% and automates documentation. $50K-200K ACV.',
      sequenceLength: '8 touches over 21 days',
      channels: 'Email, LinkedIn, Phone',
      differentiators: 'Only solution with AI-powered code analysis, integrates with all major IDEs, deployed at 3 Fortune 500 companies',
    },
  },

  'sales-representative-sales-objection-mastery-playbook': {
    skillId: 'sales-representative-sales-objection-mastery-playbook',
    defaultTestCaseId: 'objection-playbook-default-1',
    description: 'Creating objection handling playbook',
    inputPayload: {
      product: 'Enterprise cybersecurity platform - endpoint detection and response (EDR) with AI-powered threat hunting. $100K-500K deals.',
      commonObjections: `1. "We already have CrowdStrike/SentinelOne"
2. "Your price is 30% higher than competitors"
3. "We don't have budget until next fiscal year"
4. "Our IT team doesn't have bandwidth for another tool"
5. "We need to see a POC before any commitment"`,
      competitiveContext: 'Main competitors: CrowdStrike, SentinelOne, Microsoft Defender. Our edge: better AI detection, lower false positives, included MDR service.',
      salesStage: 'Mid-funnel (discovery completed, entering evaluation)',
    },
  },

  'sales-representative-enterprise-sales-proposal-generator': {
    skillId: 'sales-representative-enterprise-sales-proposal-generator',
    defaultTestCaseId: 'sales-proposal-default-1',
    description: 'Generating enterprise software proposal',
    inputPayload: {
      opportunity: 'Global manufacturing company evaluating our supply chain visibility platform. 15 distribution centers, $2B annual logistics spend.',
      requirements: `Must-haves: Real-time shipment tracking, carrier performance analytics, exception management
Nice-to-haves: Predictive ETAs, carbon footprint tracking, supplier portal
Integration: SAP S/4HANA, existing TMS (Oracle)`,
      pricing: '3-year deal, $450K ARR, implementation services $150K',
      competitorContext: 'Also evaluating project44 and FourKites. We won on carrier network breadth and SAP integration.',
      timeline: 'Decision by end of Q1, go-live needed by June',
    },
  },

  'sales-representative-discovery-call-preparation': {
    skillId: 'sales-representative-discovery-call-preparation',
    defaultTestCaseId: 'discovery-prep-default-1',
    description: 'Preparing for enterprise discovery call',
    inputPayload: {
      prospect: 'Regional healthcare system with 12 hospitals, 50+ clinics. $3B annual revenue. Recently announced digital transformation initiative.',
      yourProduct: 'Patient engagement platform - appointment scheduling, telehealth, patient portal, care coordination. Focus on reducing no-shows and improving patient satisfaction.',
      knownInfo: 'Inbound from website (downloaded ROI calculator). Contact is VP of Digital Health. Current patient portal is 8 years old, considering replacement.',
      meetingContext: '30-minute intro call scheduled. CIO may join for last 10 minutes.',
    },
  },

  'sales-representative-target-account-intelligence-research': {
    skillId: 'sales-representative-target-account-intelligence-research',
    defaultTestCaseId: 'account-research-default-1',
    description: 'Researching target enterprise account',
    inputPayload: {
      targetAccount: 'Acme Financial Services - mid-size regional bank, $50B in assets, 200 branches across 5 states',
      yourProduct: 'Digital account opening platform that reduces time-to-fund from 5 days to same-day. Includes identity verification, fraud detection, and compliance automation.',
      researchGoals: 'Identify key decision makers, understand their digital banking strategy, find pain points and trigger events, competitive intelligence',
      existingIntel: 'They posted a job for "Digital Transformation Lead" last month. Their mobile app has 2.3 stars in app store with complaints about account opening.',
    },
  },

  'sales-representative-value-proposition-roi-calculator-generator': {
    skillId: 'sales-representative-value-proposition-roi-calculator-generator',
    defaultTestCaseId: 'roi-calculator-default-1',
    description: 'Building ROI calculator for prospect',
    inputPayload: {
      product: 'AI-powered accounts payable automation. Automates invoice processing, approval workflows, and payment execution.',
      prospectContext: 'Mid-market manufacturer processing 5,000 invoices/month. 3 FTEs in AP department. Current process: manual data entry, email-based approvals, checks for 60% of payments.',
      valueDrivers: '1. Labor savings from automation, 2. Early payment discounts captured, 3. Reduced duplicate payments, 4. Faster close cycle, 5. Audit cost reduction',
      pricingModel: '$3 per invoice processed + $500/month platform fee',
    },
  },

  'sales-representative-deal-strategy-next-steps-planner': {
    skillId: 'sales-representative-deal-strategy-next-steps-planner',
    defaultTestCaseId: 'deal-strategy-default-1',
    description: 'Planning strategy for complex enterprise deal',
    inputPayload: {
      dealContext: `$800K ARR opportunity at Fortune 500 retailer for our workforce management platform.
Stage: Technical validation complete, entering procurement
Champion: VP Store Operations (strong supporter)
Economic Buyer: COO (met once, seemed positive)
Blockers: IT Security (concerns about cloud), Procurement (pushing for 40% discount)`,
      timeline: 'They want to pilot in Q2, full rollout before holiday season. Our quarter ends in 6 weeks.',
      competition: 'Incumbent is legacy on-prem solution. Also talking to Workday and UKG.',
      currentRisks: 'Security review not scheduled yet. No executive sponsor meeting confirmed. Legal terms not discussed.',
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
      responsibilities: 'Design and build core platform services, mentor junior engineers, lead technical projects, participate in on-call rotation, contribute to architecture decisions',
      requirements: '5+ years software engineering experience, strong in Python or Go, experience with distributed systems, familiarity with cloud platforms (AWS/GCP)',
      compensation: '$180,000 - $220,000 base + equity + benefits',
      companyContext: 'Series C startup, 200 employees, remote-first, building B2B SaaS for financial services',
    },
  },

  'hr-professional-structured-interview-system': {
    skillId: 'hr-professional-structured-interview-system',
    defaultTestCaseId: 'interview-system-default-1',
    description: 'Designing interview process for product manager role',
    inputPayload: {
      role: 'Senior Product Manager - Growth',
      keyCompetencies: 'Data-driven decision making, experimentation mindset, cross-functional leadership, customer empathy, strategic thinking',
      teamContext: 'Growth team of 2 PMs, 8 engineers, 2 designers. Reports to VP Product. Focus on user acquisition and activation.',
      interviewStages: 'Recruiter screen, Hiring manager, Technical PM interview, Cross-functional panel, Executive final',
      specialConsiderations: 'We value diverse perspectives. Previous growth PM left due to burnout - need someone who can set boundaries.',
    },
  },

  'hr-professional-hr-policy-handbook-generator': {
    skillId: 'hr-professional-hr-policy-handbook-generator',
    defaultTestCaseId: 'hr-policy-default-1',
    description: 'Creating remote work policy',
    inputPayload: {
      policyType: 'Remote & Hybrid Work Policy',
      companyContext: 'Tech company, 500 employees, headquarters in Austin TX, employees in 30 states. Moving from fully remote to hybrid model.',
      requirements: `Must address:
- Who is eligible for remote vs hybrid vs in-office
- Core collaboration hours
- Home office requirements and stipend
- In-office expectations for hybrid employees
- Travel requirements for remote employees
- Equipment and expense policies`,
      compliance: 'Must comply with state-specific employment laws, especially CA and NY',
      culture: 'We value flexibility and trust but also collaboration and connection',
    },
  },

  'hr-professional-performance-review-system': {
    skillId: 'hr-professional-performance-review-system',
    defaultTestCaseId: 'perf-review-default-1',
    description: 'Redesigning performance management system',
    inputPayload: {
      currentState: 'Annual reviews only, forced ranking (20/70/10), manager-only feedback, no connection to compensation until year-end',
      desiredOutcomes: 'More frequent feedback, growth-oriented culture, fair and transparent process, better manager-employee conversations',
      companySize: '800 employees across 5 departments',
      constraints: 'Must integrate with Workday HRIS. Cannot increase HR headcount. Managers already feel overloaded.',
      timeline: 'Need to launch new system for next review cycle (Q2)',
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
      analysisType: 'Quarterly Performance Review',
      financialData: `Q3 2024 vs Q3 2023:
Revenue: $45M vs $38M (+18%)
Gross Margin: 68% vs 71% (-3pp)
Operating Expenses: $28M vs $22M (+27%)
EBITDA: $8M vs $9M (-11%)
Cash: $25M vs $35M
ARR: $180M vs $145M (+24%)
Net Revenue Retention: 112%`,
      context: 'SaaS company, Series C, targeting profitability by Q2 next year',
      audience: 'Board of Directors, CEO, CFO',
      focus: 'Explain gross margin compression and path to profitability',
    },
  },

  'financial-analyst-fp-a-budget-intelligence-system': {
    skillId: 'financial-analyst-fp-a-budget-intelligence-system',
    defaultTestCaseId: 'budget-intel-default-1',
    description: 'Building annual budget model',
    inputPayload: {
      budgetPeriod: 'FY2025 Annual Budget',
      historicalData: `FY2024 Actuals:
Revenue: $165M (plan was $180M, 92% attainment)
Gross Margin: 69%
S&M: $65M (39% of revenue)
R&D: $45M (27% of revenue)
G&A: $25M (15% of revenue)
Headcount: 450 (plan was 500)`,
      assumptions: 'Revenue growth target: 35%. Hiring to resume Q2. New product launch in Q3. Price increase of 5% on renewals.',
      constraints: 'Must show path to breakeven by Q4. Board wants to see 2 scenarios (base and downside).',
    },
  },

  'financial-analyst-financial-modeling-architect': {
    skillId: 'financial-analyst-financial-modeling-architect',
    defaultTestCaseId: 'financial-model-default-1',
    description: 'Building 3-statement financial model',
    inputPayload: {
      modelPurpose: 'Series B fundraise - investor-ready 3-statement model',
      businessDescription: 'B2B SaaS, vertical software for restaurants. Current ARR $8M, 500 customers, $15K ACV.',
      historicalData: '3 years of historical financials available. Revenue CAGR 80%. Gross margin improving from 60% to 72%.',
      projectionPeriod: '5-year projections (2025-2029)',
      keyMetrics: 'ARR, customer count, ACV, gross margin, CAC, LTV, burn rate, runway',
    },
  },

  'financial-analyst-investment-valuation-analyst': {
    skillId: 'financial-analyst-investment-valuation-analyst',
    defaultTestCaseId: 'valuation-default-1',
    description: 'Performing company valuation analysis',
    inputPayload: {
      valuationType: 'Pre-money valuation for Series B',
      companyMetrics: `Current ARR: $12M, growing 100% YoY
Gross Margin: 75%
Net Revenue Retention: 125%
CAC Payback: 18 months
Burn: $800K/month
Runway: 14 months`,
      comparables: 'Toast, Lightspeed, Olo (restaurant tech sector)',
      purpose: 'Determine fair valuation range for $30M Series B raise',
      methodology: 'Revenue multiples, comparable transactions, DCF sensitivity',
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
Current Q4 Closed: $1.2M
Days remaining: 45`,
      historicalConversion: 'Discovery→Close: 15%, Eval→Close: 35%, Negotiation→Close: 65%',
      concerns: 'Pipeline coverage is 3x but seems top-heavy. Several large deals slipping.',
    },
  },

  'financial-analyst-sales-forecast-optimizer': {
    skillId: 'financial-analyst-sales-forecast-optimizer',
    defaultTestCaseId: 'sales-forecast-default-1',
    description: 'Building sales forecast model',
    inputPayload: {
      forecastPeriod: 'Q1 2025',
      currentPipeline: '$12M total pipeline, $4.5M weighted',
      teamCapacity: '8 AEs, average quota $500K/quarter, average attainment 85%',
      historicalData: 'Q1 is historically weakest (80% of average quarter). January slow due to holidays.',
      factors: 'New product launching Feb 1. 2 AEs ramping. Key competitor raised prices 20%.',
    },
  },

  'financial-analyst-win-loss-analysis-generator': {
    skillId: 'financial-analyst-win-loss-analysis-generator',
    defaultTestCaseId: 'win-loss-default-1',
    description: 'Analyzing Q3 win/loss patterns',
    inputPayload: {
      period: 'Q3 2024',
      winData: `Wins (45 deals, $2.8M):
- Average deal size: $62K
- Average sales cycle: 45 days
- Top reasons: Product capabilities (60%), price (20%), support (20%)
- Segments: Mid-market 70%, Enterprise 30%`,
      lossData: `Losses (30 deals, $2.1M):
- Average deal size: $70K
- Average sales cycle: 65 days
- Lost to: Competitor A (40%), No decision (35%), Competitor B (15%), Other (10%)
- Top loss reasons: Missing features (45%), price (30%), implementation concerns (25%)`,
      context: 'Win rate dropped from 62% to 60%. Concerned about enterprise segment.',
    },
  },

  'financial-analyst-revenue-process-bottleneck-finder': {
    skillId: 'financial-analyst-revenue-process-bottleneck-finder',
    defaultTestCaseId: 'bottleneck-finder-default-1',
    description: 'Finding revenue process inefficiencies',
    inputPayload: {
      processScope: 'Lead-to-cash full cycle analysis',
      currentMetrics: `Lead to MQL: 3 days average
MQL to SQL: 5 days average
SQL to Opportunity: 2 days average
Opportunity to Close: 45 days average
Close to Contract Signed: 8 days average
Contract to Go-Live: 21 days average
Go-Live to First Invoice: 5 days average`,
      painPoints: 'Legal review takes too long. Deals often stall after technical win. Implementation backlog growing.',
      benchmark: 'Industry average deal cycle is 35 days. Our target is 40 days.',
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
      keyPoints: '1. AI is augmenting agents, not replacing them. 2. Predictive service is the next frontier. 3. Personalization at scale is now possible. 4. Implementation challenges and how to overcome them.',
      length: '2000-2500 words',
      seoKeywords: 'AI customer service, customer service automation, AI chatbots, customer experience AI',
    },
  },

  'content-writer-content-strategy-brief-generator': {
    skillId: 'content-writer-content-strategy-brief-generator',
    defaultTestCaseId: 'content-strategy-default-1',
    description: 'Creating content strategy for product launch',
    inputPayload: {
      initiative: 'New AI analytics feature launch',
      businessGoal: 'Generate 500 qualified leads in first 60 days, establish thought leadership in AI analytics space',
      targetAudience: 'Data analysts and analytics managers at companies with 100-1000 employees',
      channels: 'Blog, LinkedIn, email newsletter, webinar',
      timeline: '8 weeks pre-launch through 4 weeks post-launch',
      resources: '1 content writer, 1 designer, $5K promotion budget',
    },
  },

  'content-writer-content-atomization-repurposing-engine': {
    skillId: 'content-writer-content-atomization-repurposing-engine',
    defaultTestCaseId: 'atomization-default-1',
    description: 'Repurposing whitepaper into multi-format content',
    inputPayload: {
      sourceContent: 'Whitepaper: "The State of Marketing Analytics 2025" - 25 pages covering trends, benchmarks, and best practices in marketing measurement',
      targetFormats: 'Blog series, LinkedIn posts, email sequence, infographics, podcast talking points',
      distributionGoal: 'Maximize reach across owned channels over 8 weeks',
      brandVoice: 'Data-driven, helpful, slightly provocative, avoids jargon',
    },
  },

  'content-writer-copywriting-formula-generator': {
    skillId: 'content-writer-copywriting-formula-generator',
    defaultTestCaseId: 'copywriting-default-1',
    description: 'Writing landing page copy',
    inputPayload: {
      copyType: 'Product landing page',
      product: 'AI-powered proposal software that helps sales teams create winning proposals 10x faster',
      targetAudience: 'Sales leaders and revenue ops at B2B companies frustrated with slow, inconsistent proposals',
      formula: 'PAS (Problem-Agitation-Solution)',
      desiredAction: 'Start free trial',
      constraints: 'Hero section needs headline + subhead + CTA. Keep benefit sections scannable.',
    },
  },

  'content-writer-content-editing-style-guide-enforcer': {
    skillId: 'content-writer-content-editing-style-guide-enforcer',
    defaultTestCaseId: 'style-guide-default-1',
    description: 'Editing content to match brand style guide',
    inputPayload: {
      contentToEdit: `Our software is the best solution for managing your company's data. We have been in business for over 10 years and have lots of customers who love us. Click here to learn more about our amazing product features. Our team of experts will help you every step of the way!!!`,
      styleGuide: `Voice: Confident but not arrogant. Show, don't tell.
Avoid: Superlatives (best, amazing), exclamation marks, "click here", passive voice
Prefer: Specific proof points, active voice, customer benefit focus
Formatting: Sentence case headlines, Oxford comma, em-dashes for emphasis`,
      context: 'Homepage hero section for B2B data management platform',
    },
  },

  'content-writer-ai-optimized-content-geo-aeo-': {
    skillId: 'content-writer-ai-optimized-content-geo-aeo-',
    defaultTestCaseId: 'geo-aeo-default-1',
    description: 'Creating AI-optimized content for search',
    inputPayload: {
      topic: 'How to choose the right CRM for your small business',
      targetQueries: 'best CRM for small business, CRM comparison, how to choose CRM, CRM features small business',
      contentType: 'Comprehensive guide',
      competitorContent: 'Existing top results are listicles with 10-15 CRMs. Opportunity for more decision-focused content.',
      aiOptimization: 'Optimize for both traditional SEO and AI-generated responses (ChatGPT, Perplexity, Google SGE)',
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
      accountName: 'TechCorp Industries',
      healthMetrics: `Product Usage: 45% DAU/MAU (down from 62% last quarter)
Support Tickets: 8 this month (up from 3)
NPS Response: Detractor (score 4, was Promoter at 9)
Feature Adoption: Core features 85%, new features 15%
Executive Engagement: No exec meeting in 6 months
Contract: $150K ARR, renews in 4 months`,
      recentEvents: 'Key champion (VP Ops) left 2 months ago. New VP started last month. They asked about downsizing during last call.',
      goal: 'Develop intervention strategy to save this account',
    },
  },

  'customer-success-manager-executive-qbr-deck-generator': {
    skillId: 'customer-success-manager-executive-qbr-deck-generator',
    defaultTestCaseId: 'qbr-deck-default-1',
    description: 'Creating QBR presentation deck',
    inputPayload: {
      accountName: 'Global Retail Corp',
      accountContext: '$500K ARR, 3-year customer, using platform for inventory management across 200 stores',
      quarterHighlights: 'Achieved 99.2% inventory accuracy (up from 94%). Reduced stockouts by 35%. Completed API integration with their ERP.',
      challengesFaced: 'Delayed training rollout due to customer resource constraints. Some stores still on old process.',
      nextQuarterGoals: 'Complete rollout to remaining 50 stores. Launch demand forecasting module. Expand to 2 new regions.',
      expansionOpportunity: 'They expressed interest in our workforce management module ($200K opportunity)',
    },
  },

  'customer-success-manager-customer-lifecycle-email-templates': {
    skillId: 'customer-success-manager-customer-lifecycle-email-templates',
    defaultTestCaseId: 'lifecycle-email-default-1',
    description: 'Creating customer lifecycle email templates',
    inputPayload: {
      lifecycleStage: 'Onboarding - Day 30 check-in',
      customerSegment: 'Mid-market (50-500 employees), self-serve onboarding',
      productContext: 'Project management SaaS, customer has completed basic setup but low feature adoption',
      goals: 'Drive activation of key features (timeline view, integrations), identify blockers, offer training',
      tone: 'Helpful and proactive, not pushy',
    },
  },

  'customer-success-manager-renewal-playbook-generator': {
    skillId: 'customer-success-manager-renewal-playbook-generator',
    defaultTestCaseId: 'renewal-playbook-default-1',
    description: 'Building renewal playbook for key account',
    inputPayload: {
      accountProfile: '$300K ARR, 18-month customer, health score: yellow (72)',
      renewalTimeline: 'Contract expires in 90 days',
      stakeholders: 'Economic buyer (CFO) - neutral, Champion (Dir of Ops) - supportive, Blocker (IT Director) - concerned about security',
      risks: 'Competitor (Monday.com) ran a demo last month. CFO asking about cost reduction. IT has unresolved security tickets.',
      opportunities: 'They want to expand to European team (+100 seats). New AI features align with their digital strategy.',
    },
  },

  'customer-success-manager-churn-risk-early-warning-system': {
    skillId: 'customer-success-manager-churn-risk-early-warning-system',
    defaultTestCaseId: 'churn-risk-default-1',
    description: 'Assessing churn risk signals',
    inputPayload: {
      accountData: `Account: FastGrow Startup
ARR: $85K
Contract: Renews in 5 months
Health Score: 58 (Red)

Warning Signals:
- Login frequency dropped 60% over 3 months
- 3 support escalations (2 unresolved)
- Champion left company 6 weeks ago
- Skipped last 2 scheduled CSM calls
- Competitor job posting mentions our competitor by name`,
      historicalContext: 'Started as enthusiastic early adopter. Expanded 2x in year 1. Flat in year 2.',
      goal: 'Triage risk level and develop save strategy',
    },
  },

  'customer-success-manager-win-back-campaign-generator': {
    skillId: 'customer-success-manager-win-back-campaign-generator',
    defaultTestCaseId: 'win-back-default-1',
    description: 'Creating win-back campaign for churned customer',
    inputPayload: {
      formerCustomer: 'DataFlow Analytics - churned 8 months ago after 2 years',
      churnReason: 'Switched to competitor citing lower price and better reporting features',
      relationshipHistory: 'Generally positive relationship. Champion (now CTO) was supportive. Left on good terms.',
      productUpdates: 'Since they left: Launched advanced reporting (addresses their concern), new AI features, 15% price reduction on enterprise tier',
      contactStrategy: 'CTO still connected on LinkedIn. They are presenting at industry conference next month.',
    },
  },

  'customer-success-manager-at-risk-account-escalation-brief': {
    skillId: 'customer-success-manager-at-risk-account-escalation-brief',
    defaultTestCaseId: 'escalation-brief-default-1',
    description: 'Creating executive escalation brief',
    inputPayload: {
      accountName: 'MegaCorp Financial',
      situation: '$750K ARR account threatening to churn. VP of Operations sent email stating they will not renew unless we address ongoing performance issues.',
      impactAssessment: 'Logo loss would be significant - they are a reference customer and case study. Also $750K ARR hit.',
      issuesSummary: 'Platform latency issues in their region (APAC) for past 6 weeks. 5 support tickets, 2 escalations. Engineering says fix is 4 weeks out.',
      requestedAction: 'Need exec-to-exec call to rebuild trust. Requesting temporary SLA credits and dedicated engineering resource.',
    },
  },

  'customer-success-manager-account-whitespace-analyzer': {
    skillId: 'customer-success-manager-account-whitespace-analyzer',
    defaultTestCaseId: 'whitespace-default-1',
    description: 'Analyzing expansion opportunities',
    inputPayload: {
      accountProfile: `Enterprise customer, $400K ARR
Current Products: Core Platform, Analytics Module
Users: 500 licensed, 380 active
Departments: Operations (primary), Finance (pilot)
Contract: 2 years remaining`,
      productCatalog: 'Core Platform, Analytics, Automation, AI Assistant, Mobile, API Premium, Professional Services',
      knownNeeds: 'CFO mentioned automation interest on last call. IT wants better API access. Operations expanding to 3 new regions.',
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
      scoringCriteria: 'Likelihood to close, time to close, strategic value, resource required',
      quarterTarget: '$200K expansion ARR, 45 days remaining',
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
      infrastructure: 'Production-ready Kubernetes cluster on AWS with auto-scaling, load balancing, and monitoring',
      requirements: `- EKS cluster with 3 node groups (system, application, spot)
- Application Load Balancer with WAF
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis cluster
- S3 buckets for assets and backups
- CloudWatch dashboards and alarms`,
      iacTool: 'Terraform',
      compliance: 'Must follow AWS Well-Architected Framework. PCI-DSS compliance required.',
      existingInfra: 'VPC and networking already provisioned. Using AWS Organizations with multiple accounts.',
    },
  },

  'devops-engineer-ci-cd-pipeline-designer': {
    skillId: 'devops-engineer-ci-cd-pipeline-designer',
    defaultTestCaseId: 'cicd-default-1',
    description: 'Designing CI/CD pipeline for microservices',
    inputPayload: {
      application: 'Node.js microservices architecture, 12 services, Docker containers, Kubernetes deployment',
      requirements: `Build: lint, test, security scan, Docker build
Environments: dev, staging, prod
Deployment: Blue-green for prod, rolling for others
Gates: Unit tests >80% coverage, 0 critical vulnerabilities, load test pass`,
      platform: 'GitHub Actions',
      integrations: 'SonarQube, Snyk, Datadog, Slack notifications',
      constraints: 'Max build time 15 minutes. Self-hosted runners for production deploys.',
    },
  },

  'devops-engineer-incident-runbook-generator': {
    skillId: 'devops-engineer-incident-runbook-generator',
    defaultTestCaseId: 'runbook-default-1',
    description: 'Creating incident response runbook',
    inputPayload: {
      incidentType: 'Database failover and recovery',
      systemContext: 'Primary PostgreSQL RDS instance in us-east-1, synchronous replica in us-east-2, async replica for reporting',
      stakeholders: 'On-call SRE, Database team, Application team leads, Customer Success (for communication)',
      slaRequirements: 'RTO: 15 minutes, RPO: 0 (synchronous replication)',
      tooling: 'PagerDuty for alerting, Runbook stored in Confluence, AWS Console and CLI access',
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
      languages: 'English and Spanish versions needed',
      keyMessages: 'Blood sugar monitoring, carb counting basics, importance of medication timing, when to call the doctor',
    },
  },

  'healthcare-professional-clinical-documentation-improvement-assistant': {
    skillId: 'healthcare-professional-clinical-documentation-improvement-assistant',
    defaultTestCaseId: 'cdi-default-1',
    description: 'Improving clinical documentation for accurate coding',
    inputPayload: {
      clinicalNote: `72 y/o male admitted for SOB. History of CHF, COPD, CKD stage 3. On admission, BNP elevated at 1200, creatinine 2.1 (baseline 1.8). Started on IV Lasix with good response. O2 sat improved from 88% to 94% on room air. Echo shows EF 35%.`,
      documentationType: 'Inpatient progress note',
      goal: 'Identify opportunities to improve specificity for accurate DRG assignment',
      complianceContext: 'Medicare patient, need to support medical necessity and severity of illness',
    },
  },

  'healthcare-professional-comprehensive-care-plan-generator': {
    skillId: 'healthcare-professional-comprehensive-care-plan-generator',
    defaultTestCaseId: 'care-plan-default-1',
    description: 'Creating care plan for post-surgical patient',
    inputPayload: {
      patientProfile: '58 y/o female, BMI 32, Type 2 diabetes (A1c 7.8), hypertension, post total knee replacement (day 2)',
      currentStatus: 'Pain controlled on oral meds. PT eval complete - able to ambulate 50ft with walker. Wound clean, no signs of infection.',
      careGoals: 'Safe discharge to home within 3 days. Independent ambulation with walker. Pain management transition to non-opioid.',
      barriers: 'Lives alone, 5 steps to enter home, limited family support, transportation challenges for follow-up',
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
      processOwner: 'Customer Success Operations',
      scope: 'All new enterprise customers (>$50K ARR) from contract signing through go-live',
      currentChallenges: 'Inconsistent handoffs between sales and CS, missed implementation milestones, unclear RACI',
      compliance: 'SOC 2 requirements for data handling, customer data classification',
      systems: 'Salesforce (CRM), Gainsight (CS platform), Jira (project tracking), Slack',
    },
  },

  'operations-manager-strategic-resource-capacity-planner': {
    skillId: 'operations-manager-strategic-resource-capacity-planner',
    defaultTestCaseId: 'capacity-default-1',
    description: 'Planning implementation team capacity',
    inputPayload: {
      teamContext: '8 implementation consultants, 2 technical leads, 1 manager. Average project: 6 weeks, 40 hours consultant time.',
      currentWorkload: '12 active projects, 8 in queue. 2 consultants at 120% utilization, 3 under 70%.',
      forecastedDemand: 'Sales pipeline shows 15 new projects expected in Q1. 3 are complex (100+ hour estimates).',
      constraints: 'Q1 hiring freeze. 1 consultant on parental leave starting Feb. Holiday period in December.',
      goal: 'Create capacity plan that maximizes throughput without burnout. Identify when to push back on sales.',
    },
  },

  'operations-manager-operational-metrics-kpi-dashboard-designer': {
    skillId: 'operations-manager-operational-metrics-kpi-dashboard-designer',
    defaultTestCaseId: 'kpi-dashboard-default-1',
    description: 'Designing operations KPI dashboard',
    inputPayload: {
      teamFunction: 'Customer Support Operations',
      currentMetrics: 'Tracking: ticket volume, first response time, resolution time, CSAT. Not tracking: cost per ticket, agent utilization, deflection rate.',
      businessGoals: 'Reduce support costs by 20% while maintaining CSAT above 90%. Increase self-service resolution.',
      dataSource: 'Zendesk for tickets, Salesforce for customer data, internal data warehouse',
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
      subject: 'Mathematics - Algebraic Expressions',
      gradeLevel: '7th Grade',
      standards: 'CCSS.MATH.CONTENT.7.EE.A.1 - Apply properties of operations to add, subtract, factor, and expand linear expressions',
      duration: '50-minute class period',
      classContext: '28 students, mixed ability levels, 4 students with IEPs (extended time, preferential seating), 3 ELL students',
      resources: 'Chromebooks (1:1), interactive whiteboard, manipulatives available',
    },
  },

  'teacher-educator-comprehensive-assessment-generator': {
    skillId: 'teacher-educator-comprehensive-assessment-generator',
    defaultTestCaseId: 'assessment-default-1',
    description: 'Creating unit assessment for biology',
    inputPayload: {
      subject: 'Biology - Cell Structure and Function',
      gradeLevel: '9th Grade',
      standards: 'NGSS HS-LS1-2: Develop and use a model to illustrate the hierarchical organization of interacting systems',
      assessmentType: 'End of unit summative assessment',
      coverage: 'Cell theory, organelle functions, prokaryotic vs eukaryotic cells, cell membrane structure, transport mechanisms',
      accommodations: 'Need versions for: standard, extended time, read-aloud, simplified language for ELL',
    },
  },

  'teacher-educator-professional-parent-communication-suite': {
    skillId: 'teacher-educator-professional-parent-communication-suite',
    defaultTestCaseId: 'parent-comm-default-1',
    description: 'Writing parent communication about student progress',
    inputPayload: {
      communicationType: 'Progress concern email',
      studentContext: '8th grader, previously strong student, grades dropping in past 6 weeks. Missing assignments, disengaged in class. Parents unaware of issues.',
      specificConcerns: 'Math grade dropped from A to C. 5 missing assignments. Seems distracted and tired in class.',
      tone: 'Caring and collaborative, not accusatory. Want to partner with parents.',
      nextSteps: 'Requesting parent conference, proposing tutoring support, suggesting possible check-in on social-emotional wellbeing',
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
      contractType: 'Enterprise SaaS Subscription Agreement',
      contractContext: 'Evaluating contract from new HR software vendor. 3-year term, $500K total value. Vendor is Series B startup.',
      keyTerms: `Term: 3 years, auto-renews for 1-year periods
Termination: 90 days notice, termination for convenience with 12-month penalty
Data: Vendor retains right to use aggregated/anonymized data
SLA: 99.5% uptime, credits capped at 10% monthly fee
Liability: Capped at 12 months fees
Insurance: $1M cyber liability
Indemnification: Mutual for IP infringement only`,
      riskTolerance: 'Moderate - we need the solution but cannot accept significant data or business continuity risks',
      companyContext: 'Fortune 500 financial services company. Heavy regulatory scrutiny. Previous vendor bankruptcy caused major issues.',
    },
  },

  'legal-professional-executive-legal-document-summarizer': {
    skillId: 'legal-professional-executive-legal-document-summarizer',
    defaultTestCaseId: 'legal-summary-default-1',
    description: 'Summarizing acquisition agreement for board',
    inputPayload: {
      documentType: 'Asset Purchase Agreement - Summary for Board Review',
      documentLength: '85-page agreement plus schedules',
      audience: 'Board of Directors (mix of legal and non-legal backgrounds)',
      keyAreas: 'Purchase price and structure, representations and warranties, indemnification, conditions to closing, employee matters, IP transfer',
      urgency: 'Board meeting in 48 hours. Need 2-page executive summary plus risk matrix.',
      sensitiveIssues: 'Seller has ongoing litigation. Key employees have competing offers. IP assignment chain has gaps.',
    },
  },

  'legal-professional-legal-research-memorandum-drafter': {
    skillId: 'legal-professional-legal-research-memorandum-drafter',
    defaultTestCaseId: 'legal-memo-default-1',
    description: 'Drafting legal research memo on employment law',
    inputPayload: {
      researchQuestion: 'Can we require employees to sign non-compete agreements as a condition of receiving equity grants?',
      jurisdiction: 'California (primary), with employees also in Texas, New York, and remote in 15 other states',
      factPattern: 'Tech company implementing new equity program. Want to tie RSU grants to signing non-compete. Some employees already have equity without non-competes.',
      deadline: 'Need preliminary analysis for exec team meeting in 3 days',
      additionalContext: 'Recently saw competitor hire 3 of our engineers who had access to proprietary algorithms.',
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
      vendorCategory: 'Contract Manufacturing - Electronics Assembly',
      evaluationPurpose: 'Selecting primary manufacturing partner for new product line. $10M annual spend expected.',
      keyRequirements: `Quality: ISO 9001, IPC-A-610 Class 2 minimum
Capacity: 50K units/month, scalable to 200K
Location: Prefer North America or Mexico for supply chain resilience
Lead time: 4-6 week standard, 2-week expedite capability
Financial: Stable, >$50M revenue`,
      vendors: '5 vendors have passed initial screening and submitted RFP responses',
      weightingPriorities: 'Quality (30%), Cost (25%), Delivery reliability (20%), Technical capability (15%), Financial stability (10%)',
    },
  },

  'supply-chain-manager-supply-chain-risk-assessment-mitigation-planner': {
    skillId: 'supply-chain-manager-supply-chain-risk-assessment-mitigation-planner',
    defaultTestCaseId: 'supply-risk-default-1',
    description: 'Assessing supply chain risks',
    inputPayload: {
      productLine: 'Consumer electronics - wireless earbuds',
      supplyChainScope: `Tier 1: Contract manufacturer in Shenzhen
Tier 2: Battery cells (2 suppliers, both China), chipsets (1 supplier, Taiwan), plastics (3 suppliers, Vietnam/Malaysia)
Logistics: Ocean freight to US West Coast, distributed from 2 DCs`,
      currentConcerns: 'Taiwan tensions affecting chipset supply. Recent quality issues with one battery supplier. Shipping costs up 40% YoY.',
      riskAppetite: 'Low tolerance for production disruption - we have major retail launch in Q4',
      budget: '$500K available for risk mitigation investments',
    },
  },

  'supply-chain-manager-inventory-optimization-planning-advisor': {
    skillId: 'supply-chain-manager-inventory-optimization-planning-advisor',
    defaultTestCaseId: 'inventory-opt-default-1',
    description: 'Optimizing inventory strategy',
    inputPayload: {
      businessContext: 'E-commerce company selling home goods. 5,000 SKUs, 3 warehouses (East, Central, West).',
      currentState: `Inventory value: $15M
Inventory turns: 4x annually (industry benchmark: 6x)
Stockout rate: 8% (target: 2%)
Overstock (>6 months supply): 15% of SKUs
Carrying cost: 25% annually`,
      demandProfile: 'Highly seasonal (60% of sales in Q4). Long tail of slow movers. Frequent new product introductions.',
      constraints: 'Cash constrained - need to reduce inventory investment by $3M while maintaining service levels.',
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
      siteInfo: 'B2B SaaS website, ~500 pages, built on Next.js, blog on subdirectory (/blog)',
      knownIssues: 'Core Web Vitals failing on mobile. Indexation dropped 20% after recent redesign. Some orphan pages.',
      priorities: 'Recover lost indexation, improve page speed, fix crawl budget waste',
      tools: 'Have access to: Google Search Console, Screaming Frog, Ahrefs, PageSpeed Insights',
    },
  },

  'seo-specialist-keyword-research-content-strategy': {
    skillId: 'seo-specialist-keyword-research-content-strategy',
    defaultTestCaseId: 'keyword-research-default-1',
    description: 'Building keyword strategy for content hub',
    inputPayload: {
      businessContext: 'Project management software company. Targeting marketing teams at mid-size companies.',
      currentState: 'Ranking for brand terms only. No significant organic traffic for non-brand.',
      contentGoal: 'Build topical authority around "marketing project management" and related themes',
      competitors: 'Monday.com, Asana, Wrike all have strong content presence',
      budget: 'Can produce 4 high-quality articles per month',
    },
  },

  'seo-specialist-aeo-geo-optimization-analyzer': {
    skillId: 'seo-specialist-aeo-geo-optimization-analyzer',
    defaultTestCaseId: 'aeo-geo-default-1',
    description: 'Optimizing for AI and generative search',
    inputPayload: {
      websiteUrl: 'https://example-fintech.com',
      contentType: 'Financial advice and product comparison content',
      currentPerformance: 'Strong traditional SEO rankings but not appearing in AI-generated answers or featured snippets',
      targetQueries: 'Best savings accounts 2025, how to build credit score, investment app comparison',
      competitorPresence: 'NerdWallet and Bankrate dominate AI answers in this space',
    },
  },

  'seo-specialist-schema-markup-generator': {
    skillId: 'seo-specialist-schema-markup-generator',
    defaultTestCaseId: 'schema-default-1',
    description: 'Generating schema markup for e-commerce',
    inputPayload: {
      pageType: 'Product page',
      pageContent: 'Selling running shoes. Page includes: product name, price ($129.99), reviews (4.5 stars, 342 reviews), sizes, colors, availability, brand, product images',
      currentSchema: 'Basic Product schema only, missing reviews, offers, brand',
      goals: 'Qualify for rich results, improve CTR, support Google Shopping',
      platform: 'Shopify',
    },
  },

  'seo-specialist-local-seo-audit-strategy': {
    skillId: 'seo-specialist-local-seo-audit-strategy',
    defaultTestCaseId: 'local-seo-default-1',
    description: 'Auditing local SEO for multi-location business',
    inputPayload: {
      businessType: 'Dental practice with 12 locations across 3 cities (Austin, Dallas, Houston)',
      currentState: 'Google Business Profiles exist but inconsistent. Reviews sparse. No local landing pages.',
      competition: 'Strong local competitors with 500+ reviews and optimized profiles',
      goals: 'Improve local pack rankings, increase appointment bookings from search',
      challenges: 'Different services at different locations. Staff turnover makes GBP management difficult.',
    },
  },

  'seo-specialist-seo-content-brief-generator': {
    skillId: 'seo-specialist-seo-content-brief-generator',
    defaultTestCaseId: 'content-brief-default-1',
    description: 'Creating SEO content brief',
    inputPayload: {
      targetKeyword: 'how to create a marketing budget',
      searchIntent: 'Informational - marketers looking for guidance on budget creation process',
      competitorAnalysis: 'Top 5 results are comprehensive guides (2000-4000 words) with templates and examples',
      businessContext: 'We sell marketing planning software. Want to rank for this term and drive demo requests.',
      contentFormat: 'Ultimate guide with downloadable template',
    },
  },

  'seo-specialist-redirect-mapping-tool': {
    skillId: 'seo-specialist-redirect-mapping-tool',
    defaultTestCaseId: 'redirect-mapping-default-1',
    description: 'Creating redirect map for site migration',
    inputPayload: {
      migrationContext: 'Migrating from old CMS to new platform. URL structure changing completely.',
      scope: '850 pages need redirects. 200 pages being consolidated. 100 pages being removed.',
      oldStructure: '/blog/category/post-title, /products/category/product-name',
      newStructure: '/resources/post-title, /solutions/product-name',
      priorities: 'Preserve link equity for top 50 pages (80% of organic traffic). Maintain rankings for money keywords.',
    },
  },

  'seo-specialist-backlink-gap-analyzer': {
    skillId: 'seo-specialist-backlink-gap-analyzer',
    defaultTestCaseId: 'backlink-gap-default-1',
    description: 'Analyzing backlink gap vs competitors',
    inputPayload: {
      yourDomain: 'example-hrtech.com',
      competitors: 'bamboohr.com, gusto.com, rippling.com',
      focusAreas: 'Identify high-value link opportunities competitors have that we do not',
      currentProfile: 'DR 45, 2,500 referring domains, mostly from directories and guest posts',
      linkBuildingBudget: '$5K/month for outreach and content',
    },
  },

  'seo-specialist-meta-tag-bulk-optimizer': {
    skillId: 'seo-specialist-meta-tag-bulk-optimizer',
    defaultTestCaseId: 'meta-tag-default-1',
    description: 'Bulk optimizing meta tags',
    inputPayload: {
      pageList: `Product pages (150): Currently using product name only as title
Blog posts (200): Inconsistent format, many truncated
Category pages (25): Generic "Category Name | Brand"
Landing pages (15): Keyword stuffed, poor CTR`,
      brandName: 'TechFlow',
      guidelines: 'Title max 60 chars, description 150-160 chars, include primary keyword naturally',
      goals: 'Improve CTR from search results, maintain keyword targeting',
    },
  },

  'seo-specialist-content-refresh-analyzer': {
    skillId: 'seo-specialist-content-refresh-analyzer',
    defaultTestCaseId: 'content-refresh-default-1',
    description: 'Identifying content refresh opportunities',
    inputPayload: {
      contentInventory: '300 blog posts published over 5 years',
      performanceData: '50 posts drive 80% of organic traffic. 100 posts get zero traffic. 150 posts declining.',
      refreshCriteria: 'Outdated information, declining rankings, thin content, consolidation opportunities',
      resources: 'Writer can refresh 8 posts per month',
      prioritization: 'Focus on posts with highest traffic recovery potential',
    },
  },

  'seo-specialist-internal-linking-optimizer': {
    skillId: 'seo-specialist-internal-linking-optimizer',
    defaultTestCaseId: 'internal-link-default-1',
    description: 'Optimizing internal linking structure',
    inputPayload: {
      siteStructure: '500 pages: 20 pillar pages, 150 blog posts, 50 product pages, 280 support docs',
      currentIssues: 'Orphan pages (30+), over-linked homepage, pillar pages not linking to supporting content',
      topPages: 'Want to boost rankings for 10 money pages through strategic internal linking',
      crawlData: 'Screaming Frog export available showing current link distribution',
      cmsCapabilities: 'Can add contextual links, sidebar related posts, breadcrumbs already implemented',
    },
  },

  'seo-specialist-competitor-serp-analyzer': {
    skillId: 'seo-specialist-competitor-serp-analyzer',
    defaultTestCaseId: 'serp-analysis-default-1',
    description: 'Analyzing competitor SERP presence',
    inputPayload: {
      targetKeywords: 'project management software, best project management tools, project management for teams',
      competitors: 'monday.com, asana.com, clickup.com, notion.so',
      analysisGoals: 'Understand why competitors rank, identify content gaps, find featured snippet opportunities',
      currentRankings: 'Not ranking on page 1 for any target keywords',
      serpFeatures: 'Want to understand which SERP features are available and how to win them',
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
      trainingTopic: 'Giving Effective Feedback: A Manager\'s Guide',
      audience: '25 first-time managers, promoted from individual contributor roles in past 6 months',
      duration: '3-hour workshop with breaks',
      learningObjectives: '1. Understand the SBI (Situation-Behavior-Impact) feedback model, 2. Practice delivering constructive criticism, 3. Handle defensive reactions professionally, 4. Create a feedback-rich team culture',
      format: 'Mix of presentation, discussion, role-play exercises, and action planning',
      constraints: 'Remote delivery via Zoom. Need engaging activities to maintain attention.',
    },
  },

  'trainer-workshop-event-marketing-promotion': {
    skillId: 'trainer-workshop-event-marketing-promotion',
    defaultTestCaseId: 'workshop-marketing-default-1',
    description: 'Creating marketing for public workshop',
    inputPayload: {
      workshopTitle: 'AI for Business Leaders: Practical Applications & Strategy',
      targetAudience: 'C-suite and VP-level executives at mid-market companies. Decision makers evaluating AI investments.',
      format: '1-day in-person workshop, $1,500 per attendee, includes lunch and networking',
      capacityGoal: '30 attendees minimum, 50 maximum',
      timeline: 'Workshop in 8 weeks, need to sell 20 seats in first 4 weeks',
      differentiator: 'Hands-on with real AI tools, not theoretical. Led by former Fortune 500 CTO.',
    },
  },

  'trainer-training-content-copy-editor': {
    skillId: 'trainer-training-content-copy-editor',
    defaultTestCaseId: 'training-editor-default-1',
    description: 'Editing training materials for clarity',
    inputPayload: {
      contentType: 'E-learning module script',
      contentToEdit: `This module will help you to understand the various aspects of project management methodologies and their application in real-world scenarios. We will be covering Waterfall, Agile, and Hybrid approaches. It is important to note that there is no one-size-fits-all solution and the methodology you choose should be dependent on various factors including but not limited to team size, project complexity, stakeholder expectations, and organizational culture.`,
      audience: 'Mid-level professionals taking self-paced online course',
      guidelines: 'Keep sentences under 20 words. Use active voice. Write at 8th grade reading level. Make it conversational.',
      goalDuration: 'Script should support 5-minute video segment',
    },
  },

  'trainer-workshop-curriculum-designer': {
    skillId: 'trainer-workshop-curriculum-designer',
    defaultTestCaseId: 'curriculum-default-1',
    description: 'Designing multi-session training curriculum',
    inputPayload: {
      programTitle: 'New Manager Development Program',
      targetAudience: 'Newly promoted managers (0-12 months in role) across all departments',
      duration: '12-week program, 2-hour sessions weekly',
      learningGoals: 'Build core management skills: delegation, feedback, performance management, team building, conflict resolution, time management',
      deliveryFormat: 'Cohort-based, hybrid (in-person kickoff, virtual sessions, in-person graduation)',
      resources: 'Internal trainers available. Budget for external facilitator for 2 sessions. LMS for assignments.',
    },
  },

  'trainer-training-needs-assessment-generator': {
    skillId: 'trainer-training-needs-assessment-generator',
    defaultTestCaseId: 'needs-assessment-default-1',
    description: 'Conducting training needs assessment',
    inputPayload: {
      organizationContext: 'Fast-growing tech company, 500 employees, doubled in size last year. Seeing issues with manager effectiveness.',
      assessmentScope: 'Management and leadership development needs across all people managers (85 total)',
      symptoms: 'High turnover on certain teams, inconsistent performance reviews, employee survey shows "manager effectiveness" as bottom quartile',
      existingTraining: 'Ad hoc lunch-and-learns, no formal management development program',
      constraints: 'Need recommendations within 4 weeks. Limited L&D team (2 people).',
    },
  },

  'trainer-interactive-exercise-activity-generator': {
    skillId: 'trainer-interactive-exercise-activity-generator',
    defaultTestCaseId: 'exercise-default-1',
    description: 'Creating interactive training exercises',
    inputPayload: {
      topic: 'Active Listening Skills',
      context: 'Part of a 2-hour communication skills workshop for customer service representatives',
      groupSize: '20 participants',
      timeAllocation: '30 minutes for activity + debrief',
      format: 'In-person, classroom setting with movable furniture',
      learningGoal: 'Participants should be able to demonstrate active listening techniques: paraphrasing, asking clarifying questions, non-verbal cues',
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
      engagement: 'Market entry strategy for US healthcare company expanding to UK market',
      client: 'Mid-size healthcare technology company, $200M revenue, strong US presence, no international operations',
      keyFindings: `Market size: £15B UK digital health market growing 12% annually
Regulatory: NHS procurement complex, MHRA approval needed
Competition: 3 established players, fragmented market otherwise
Entry options analyzed: Direct entry, partnership, acquisition`,
      recommendation: 'Recommend partnership strategy with established NHS supplier, followed by acquisition of UK-based competitor in 18-24 months',
      audience: 'CEO and Board of Directors',
    },
  },

  'consultant-client-proposal-generator': {
    skillId: 'consultant-client-proposal-generator',
    defaultTestCaseId: 'proposal-default-1',
    description: 'Writing consulting engagement proposal',
    inputPayload: {
      opportunity: 'Digital transformation assessment for regional bank',
      clientContext: '$5B asset regional bank, 50 branches, legacy core banking system. CEO wants to compete with digital-first challengers.',
      scopeDiscussed: '8-week assessment of current state, competitive analysis, roadmap development, business case for transformation',
      competingFirms: 'Competing against Big 4 firm and boutique fintech consultancy',
      differentiator: 'Our banking technology expertise, similar project delivered for comparable bank last year',
      budget: 'Client budget: $400-500K. Our target: $450K.',
    },
  },

  'consultant-executive-memo-recommendation-writer': {
    skillId: 'consultant-executive-memo-recommendation-writer',
    defaultTestCaseId: 'exec-memo-default-1',
    description: 'Writing executive recommendation memo',
    inputPayload: {
      topic: 'Recommendation to Restructure Sales Organization',
      context: 'Engaged to assess sales effectiveness. Found significant issues with territory alignment, comp structure, and sales/marketing coordination.',
      keyAnalysis: `Current state: 45 reps, $50M quota, 72% attainment
Territory overlap causing deal conflicts (15% of deals disputed)
Comp plan rewards individual over team (no collaboration incentive)
Marketing leads not followed up (40% SLA breach)`,
      recommendation: 'Restructure into pod model, realign territories, revise compensation, implement SLA with marketing',
      audience: 'CEO, CRO, CFO',
      constraints: 'Must be implementable without major headcount changes. Q1 implementation target.',
    },
  },

  'consultant-client-workshop-facilitator-guide': {
    skillId: 'consultant-client-workshop-facilitator-guide',
    defaultTestCaseId: 'workshop-guide-default-1',
    description: 'Creating workshop facilitator guide',
    inputPayload: {
      workshopPurpose: 'Strategy alignment session - get executive team agreement on 3-year strategic priorities',
      participants: '12 executives (CEO + direct reports), history of disagreement on priorities',
      duration: 'Full-day session (9am-5pm) at offsite venue',
      desiredOutcomes: 'Agreed top 5 strategic priorities, resource allocation principles, next steps with owners',
      knownDynamics: 'CFO and CRO historically at odds. CEO tends to dominate. Some participants not vocal.',
      prework: 'Participants submitted individual priority lists in advance (significant divergence observed)',
    },
  },

  'consultant-business-case-roi-analysis': {
    skillId: 'consultant-business-case-roi-analysis',
    defaultTestCaseId: 'business-case-default-1',
    description: 'Building business case for technology investment',
    inputPayload: {
      initiative: 'Enterprise CRM implementation (Salesforce)',
      currentState: 'Using spreadsheets and basic contact database. No pipeline visibility. Manual reporting.',
      proposedInvestment: 'Salesforce Enterprise: $300K year 1 (licenses + implementation), $150K/year ongoing',
      benefitHypotheses: '1. Increased sales productivity (15%), 2. Improved win rates (5pp), 3. Reduced admin time (10 hrs/rep/month), 4. Better forecasting',
      stakeholders: 'CFO (skeptical of tech ROI), CRO (champion), CEO (wants data-driven decision)',
      constraints: 'Payback period must be under 18 months. Need conservative assumptions.',
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
      company: 'AI-powered legal document automation for SMBs',
      stage: 'Raising $8M Series A',
      traction: '$1.2M ARR, 150 customers, 15% MoM growth, 120% NRR, $8K ACV',
      team: 'CEO (ex-Google PM), CTO (Stanford CS PhD), COO (ex-McKinsey). 12 FTEs total.',
      market: 'Legal tech market, $25B TAM. SMB segment underserved.',
      ask: '$8M for 18 months runway. Use: 60% engineering, 25% GTM, 15% G&A',
      competition: 'DocuSign (enterprise focus), LegalZoom (consumer), several early-stage competitors',
    },
  },

  'entrepreneur-business-plan-generator': {
    skillId: 'entrepreneur-business-plan-generator',
    defaultTestCaseId: 'business-plan-default-1',
    description: 'Creating comprehensive business plan',
    inputPayload: {
      businessConcept: 'Subscription meal kit service for people with dietary restrictions (celiac, diabetes, kidney disease)',
      stage: 'Pre-launch, seeking $500K seed funding',
      founders: '2 founders: one former healthcare dietitian, one operations/logistics background from Blue Apron',
      targetMarket: '35M Americans with dietary restrictions. Initial focus: celiac/gluten-free market (3M people).',
      goToMarket: 'D2C subscription, physician/dietitian referrals, health system partnerships',
      funding: 'Seeking $500K to launch pilot in 3 metro areas, prove unit economics, then raise Series A',
    },
  },

  'entrepreneur-go-to-market-strategy-builder': {
    skillId: 'entrepreneur-go-to-market-strategy-builder',
    defaultTestCaseId: 'gtm-strategy-default-1',
    description: 'Building go-to-market strategy',
    inputPayload: {
      product: 'B2B SaaS - AI meeting assistant that records, transcribes, and extracts action items',
      targetCustomer: 'Initially: sales teams at tech companies (100-1000 employees). ICP: VP Sales, Sales Ops.',
      currentState: 'Product ready, 10 beta customers (free), $0 revenue',
      pricing: 'Considering: $15/user/month or $200/user/year',
      budget: '$100K for first 6 months GTM',
      goal: 'Reach $100K ARR in first 12 months',
    },
  },

  'entrepreneur-startup-financial-model-builder': {
    skillId: 'entrepreneur-startup-financial-model-builder',
    defaultTestCaseId: 'financial-model-default-1',
    description: 'Building startup financial model',
    inputPayload: {
      businessModel: 'B2B SaaS, subscription revenue, land-and-expand model',
      currentMetrics: 'Pre-revenue, 5 pilot customers, expected $5K ACV at launch',
      assumptions: `Customer acquisition: 10 new customers month 1, growing 20% MoM
ACV: $5K year 1, expanding to $8K year 2
Churn: 5% monthly initially, improving to 3%
CAC: $2,000 (paid channels), $500 (organic)
Team: 2 founders now, hiring 1 engineer month 3, 1 salesperson month 6`,
      projectionPeriod: '3 years (36 months)',
      purpose: 'Fundraising model for $1M seed round',
    },
  },

  'entrepreneur-investor-update-email-generator': {
    skillId: 'entrepreneur-investor-update-email-generator',
    defaultTestCaseId: 'investor-update-default-1',
    description: 'Writing monthly investor update',
    inputPayload: {
      period: 'November 2024 Monthly Update',
      highlights: 'Closed first enterprise deal ($50K ACV), launched v2.0 with AI features, hired VP Sales',
      metrics: `MRR: $45K (up from $32K)
Customers: 28 (up from 22)
Burn: $120K/month
Runway: 14 months
Pipeline: $300K (up from $180K)`,
      challenges: 'Sales cycle longer than expected for enterprise (90+ days). One key engineer gave notice.',
      asks: 'Looking for intros to: enterprise SaaS sales leaders, senior ML engineers',
      nextMonth: 'Enterprise pilot go-lives, team offsite, beginning Series A prep',
    },
  },

  'entrepreneur-investor-due-diligence-q-a-prep': {
    skillId: 'entrepreneur-investor-due-diligence-q-a-prep',
    defaultTestCaseId: 'dd-prep-default-1',
    description: 'Preparing for investor due diligence',
    inputPayload: {
      round: 'Series A - $10M target',
      leadInvestor: 'Top-tier SaaS-focused VC, have term sheet contingent on DD',
      companyContext: '$2M ARR, 18 months old, 20 employees, burning $200K/month',
      knownConcerns: 'Customer concentration (top 3 = 40% revenue), co-founder departed 6 months ago, pivot from original idea',
      ddAreas: 'Financial, legal, technical, customer references, market/competitive',
      timeline: '3 weeks to close, DD starting immediately',
    },
  },

  'entrepreneur-market-analysis-competitor-intelligence': {
    skillId: 'entrepreneur-market-analysis-competitor-intelligence',
    defaultTestCaseId: 'market-analysis-default-1',
    description: 'Conducting market and competitor analysis',
    inputPayload: {
      market: 'Employee engagement and recognition software',
      purpose: 'Series A pitch preparation - need market sizing and competitive landscape',
      knownCompetitors: 'Lattice, 15Five, Culture Amp, Bonusly, Motivosity',
      ourPosition: 'Focus on frontline/deskless workers (60% of workforce, underserved by current solutions)',
      neededInsights: 'TAM/SAM/SOM, competitor positioning, pricing benchmarks, market trends, gaps we can exploit',
    },
  },

  'entrepreneur-financial-projections-scenario-modeler': {
    skillId: 'entrepreneur-financial-projections-scenario-modeler',
    defaultTestCaseId: 'scenario-model-default-1',
    description: 'Building financial scenario models',
    inputPayload: {
      currentState: '$1M ARR, $150K MRR, 100 customers, $15K burn/month',
      scenarioContext: 'Board wants to see 3 scenarios: aggressive growth (raise now), moderate (extend runway), conservative (path to profitability)',
      keyVariables: 'Hiring pace, marketing spend, sales capacity, pricing changes',
      constraints: 'Current cash: $2M. Cannot raise for 6+ months (market conditions).',
      decisionPoints: 'Need to make hiring decisions for Q1. Board meeting in 2 weeks.',
    },
  },

  'entrepreneur-investor-outreach-communication-suite': {
    skillId: 'entrepreneur-investor-outreach-communication-suite',
    defaultTestCaseId: 'investor-outreach-default-1',
    description: 'Creating investor outreach campaign',
    inputPayload: {
      round: 'Seed round, targeting $2M',
      company: 'Climate tech - SaaS platform helping companies measure and reduce carbon footprint',
      stage: 'Product launched, $100K ARR, 15 customers',
      targetInvestors: 'Climate-focused VCs, impact investors, angels with climate/enterprise background',
      approach: 'Warm intros preferred but need cold outreach strategy too',
      timeline: 'Want to close in 10 weeks',
    },
  },

  'entrepreneur-executive-summary-one-pager-creator': {
    skillId: 'entrepreneur-executive-summary-one-pager-creator',
    defaultTestCaseId: 'exec-summary-default-1',
    description: 'Creating investor one-pager',
    inputPayload: {
      company: 'Developer productivity platform - AI code assistant for enterprise',
      pitch: 'Enterprise-grade AI coding assistant that integrates with existing developer workflows, trained on company codebase',
      traction: '$500K ARR, 20 enterprise customers (pilot and paid), 3 Fortune 500 in pipeline',
      team: 'Founding team from Google Brain and Microsoft (VSCode team)',
      raise: 'Series A, $15M at $60M pre',
      use: 'Scale sales (hire 10 AEs), expand engineering (ML team), enterprise security features',
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
      pipelineSnapshot: `Total Pipeline: $25M
Stage Distribution:
- Qualification: $8M (125 opps, avg age 45 days)
- Discovery: $6M (80 opps, avg age 60 days)
- Proposal: $5M (40 opps, avg age 75 days)
- Negotiation: $4M (25 opps, avg age 90 days)
- Verbal: $2M (10 opps, avg age 30 days)`,
      hygieneIssues: 'No activity in 30+ days: 45 opps. Past close date: 30 opps. No next step: 60 opps. No decision maker: 25 opps.',
      quarterlyGoal: '$8M closed, currently at $3M with 6 weeks left',
      teamSize: '12 AEs, 3 managers',
      cleanupPriority: 'Focus on closing gap to quota while maintaining realistic pipeline',
    },
  },

  'revenue-operations-manager-forecast-variance-explainer': {
    skillId: 'revenue-operations-manager-forecast-variance-explainer',
    defaultTestCaseId: 'forecast-variance-default-1',
    description: 'Explaining forecast miss to leadership',
    inputPayload: {
      period: 'Q3 2024',
      forecast: 'Commit: $5M, Best Case: $6.5M, Pipeline: $8M',
      actual: '$4.2M closed',
      missAnalysis: `Slipped deals: 3 deals ($800K) pushed to Q4 due to customer budget cycles
Lost deals: 2 deals ($400K) lost to competitor in final stages
Reduced scope: 4 deals closed at lower value than forecasted ($300K delta)
New business shortfall: 5 fewer new logos than planned`,
      forecastProcess: 'Weekly calls with reps, stage-weighted pipeline, manager judgment overlay',
      audience: 'CRO, CFO, CEO',
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
      useCase: 'Customer support email response generation',
      businessContext: 'Fortune 500 financial services company, strict compliance requirements, customer-facing content',
      requirements: 'Must be brand-consistent, compliant with financial regulations, include required disclosures',
      guardrails: 'Cannot provide investment advice, must include compliance disclaimers, cannot discuss competitors',
      approvalProcess: 'Legal review required for template changes. Compliance must sign off on guardrails.',
    },
  },

  'ai-solutions-architect-ai-vendor-evaluation-matrix': {
    skillId: 'ai-solutions-architect-ai-vendor-evaluation-matrix',
    defaultTestCaseId: 'ai-vendor-eval-default-1',
    description: 'Evaluating AI vendors for enterprise deployment',
    inputPayload: {
      useCase: 'Document processing and extraction for insurance claims',
      requirements: `Functional: Process 10K documents/day, support PDFs and images, 95%+ accuracy
Technical: On-premise or private cloud deployment, API integration, audit logging
Security: SOC 2, data residency in US, no data retention by vendor`,
      vendors: 'AWS Textract, Google Document AI, Microsoft Azure Form Recognizer, ABBYY, Hyperscience',
      budget: '$200K annual budget',
      timeline: 'Decision in 6 weeks, POC with shortlisted vendors',
    },
  },

  'ai-solutions-architect-ai-use-case-prioritization-framework': {
    skillId: 'ai-solutions-architect-ai-use-case-prioritization-framework',
    defaultTestCaseId: 'ai-prioritization-default-1',
    description: 'Prioritizing AI use cases for roadmap',
    inputPayload: {
      useCases: `1. Customer service chatbot
2. Document classification and routing
3. Fraud detection enhancement
4. Sales forecasting improvement
5. Automated report generation
6. Code review assistance
7. Marketing content generation
8. HR resume screening`,
      evaluationCriteria: 'Business value, technical feasibility, data readiness, risk level, strategic alignment',
      constraints: 'Limited AI/ML team (3 people). Budget: $500K for year 1. Need quick wins to build momentum.',
      strategicPriorities: 'Customer experience improvement, operational efficiency, cost reduction',
    },
  },

  'ai-solutions-architect-ai-data-readiness-audit': {
    skillId: 'ai-solutions-architect-ai-data-readiness-audit',
    defaultTestCaseId: 'data-readiness-default-1',
    description: 'Assessing data readiness for AI project',
    inputPayload: {
      aiProject: 'Customer churn prediction model',
      dataAvailable: `Customer data: 3 years history, 500K customers
Usage data: Product analytics from last 18 months
Support data: Zendesk tickets (unstructured)
Financial data: Billing and payment history
Survey data: NPS and satisfaction surveys (quarterly)`,
      dataQualityConcerns: 'Missing values in customer demographics (30%), inconsistent product naming, no data dictionary',
      modelRequirements: 'Need to predict churn 90 days in advance with >80% accuracy',
    },
  },

  'ai-solutions-architect-ai-risk-assessment-mitigation-plan': {
    skillId: 'ai-solutions-architect-ai-risk-assessment-mitigation-plan',
    defaultTestCaseId: 'ai-risk-default-1',
    description: 'Assessing AI implementation risks',
    inputPayload: {
      aiSystem: 'Automated loan underwriting assistant',
      systemDescription: 'AI system that provides loan approval recommendations to human underwriters. Factors in credit score, income, employment, debt ratios.',
      riskCategories: 'Bias/fairness, regulatory compliance, model drift, explainability, security, business continuity',
      regulatoryContext: 'Subject to ECOA, Fair Housing Act, FCRA. OCC and CFPB oversight.',
      deploymentScope: 'Start with 10% of applications, human review of all decisions',
    },
  },

  'ai-solutions-architect-ai-integration-architecture-blueprint': {
    skillId: 'ai-solutions-architect-ai-integration-architecture-blueprint',
    defaultTestCaseId: 'ai-architecture-default-1',
    description: 'Designing AI integration architecture',
    inputPayload: {
      aiCapability: 'Real-time product recommendations for e-commerce platform',
      currentArchitecture: 'Monolithic e-commerce platform on AWS, PostgreSQL database, Redis cache, 50K DAU',
      integrationPoints: 'Product catalog, user behavior events, shopping cart, checkout, email marketing',
      requirements: '<100ms latency, handle traffic spikes (10x during sales), A/B testing capability',
      constraints: 'Cannot modify core commerce platform significantly. Limited DevOps bandwidth.',
    },
  },

  'ai-solutions-architect-ai-cost-benefit-analysis-calculator': {
    skillId: 'ai-solutions-architect-ai-cost-benefit-analysis-calculator',
    defaultTestCaseId: 'ai-cost-benefit-default-1',
    description: 'Calculating AI project ROI',
    inputPayload: {
      aiProject: 'Intelligent document processing for accounts payable',
      currentProcess: '5 FTEs processing 3,000 invoices/month manually. Error rate 3%. Processing time 15 min/invoice.',
      proposedSolution: 'AI-powered invoice extraction with human-in-the-loop for exceptions',
      costs: 'Software: $50K/year, Implementation: $100K one-time, Training: $20K, Ongoing support: $30K/year',
      expectedBenefits: '80% automation rate, 0.5% error rate, 2 FTE reallocation possible',
      timeframe: '3-year analysis',
    },
  },

  'ai-solutions-architect-ai-change-management-playbook': {
    skillId: 'ai-solutions-architect-ai-change-management-playbook',
    defaultTestCaseId: 'ai-change-mgmt-default-1',
    description: 'Creating AI change management plan',
    inputPayload: {
      aiInitiative: 'AI-powered customer service assistant deployment',
      impactedRoles: 'Customer service agents (150), supervisors (15), QA team (8)',
      changeScope: 'AI will handle tier-1 inquiries, agents focus on complex issues, new workflows and KPIs',
      concerns: 'Job security fears, resistance to new tools, skill gaps, union considerations',
      timeline: 'Pilot in 2 months, full rollout in 6 months',
      successMetrics: 'Adoption rate >90%, CSAT maintained, agent satisfaction stable',
    },
  },

  'ai-solutions-architect-ai-pilot-program-designer': {
    skillId: 'ai-solutions-architect-ai-pilot-program-designer',
    defaultTestCaseId: 'ai-pilot-default-1',
    description: 'Designing AI pilot program',
    inputPayload: {
      aiSolution: 'Generative AI for internal knowledge management and Q&A',
      pilotScope: 'IT Help Desk team (25 people) using AI to answer employee questions about policies, procedures, systems',
      duration: '8 weeks',
      successCriteria: 'Reduce ticket resolution time by 20%, user satisfaction >80%, <5% hallucination rate',
      riskMitigation: 'Human review of AI responses initially, clear escalation path, feedback mechanism',
      resources: '1 AI engineer, 1 product manager, IT Help Desk lead, $25K pilot budget',
    },
  },

  'ai-solutions-architect-ai-performance-monitoring-dashboard-spec': {
    skillId: 'ai-solutions-architect-ai-performance-monitoring-dashboard-spec',
    defaultTestCaseId: 'ai-monitoring-default-1',
    description: 'Specifying AI monitoring dashboard',
    inputPayload: {
      aiSystem: 'Production ML model for credit scoring',
      monitoringNeeds: 'Model performance (accuracy, precision, recall), data drift, prediction distribution, latency, error rates',
      stakeholders: 'Data science team (technical metrics), Risk team (fairness metrics), Ops team (system health)',
      alertingRequirements: 'Immediate alert on accuracy drop >5%, daily drift reports, weekly model health summary',
      integration: 'Existing monitoring: Datadog for infra, custom dashboards in Looker',
    },
  },

  'ai-solutions-architect-ai-security-privacy-compliance-checker': {
    skillId: 'ai-solutions-architect-ai-security-privacy-compliance-checker',
    defaultTestCaseId: 'ai-compliance-default-1',
    description: 'Checking AI security and privacy compliance',
    inputPayload: {
      aiSystem: 'Customer-facing AI chatbot for healthcare company',
      dataProcessed: 'Customer names, account info, potentially PHI in conversation',
      deploymentModel: 'Cloud-based (Azure), third-party AI vendor (OpenAI)',
      regulatoryScope: 'HIPAA, state privacy laws, FDA (if clinical advice), SOC 2',
      securityRequirements: 'Data encryption, access controls, audit logging, incident response',
      vendorConsiderations: 'Data processing agreement needed, BAA for HIPAA, data residency',
    },
  },

  'ai-solutions-architect-ai-stakeholder-communication-package': {
    skillId: 'ai-solutions-architect-ai-stakeholder-communication-package',
    defaultTestCaseId: 'ai-comm-package-default-1',
    description: 'Creating AI communication materials',
    inputPayload: {
      aiInitiative: 'Enterprise-wide AI assistant rollout (like ChatGPT for work)',
      audiences: 'Executive team, middle management, end users, IT team, legal/compliance, union',
      messagingGoals: 'Build excitement, address concerns, explain governance, drive adoption',
      keyMessages: 'AI augments not replaces, data stays private, guardrails in place, training available',
      deliverables: 'Executive presentation, manager talking points, employee FAQ, training announcement, governance summary',
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
      accountName: 'Enterprise Manufacturing Co',
      accountContext: '$2M ARR, 5-year customer, using 3 product modules. Key strategic account.',
      quarterHighlights: 'Successful rollout to APAC region (+500 users), achieved 99.5% uptime, completed custom integration',
      challenges: 'Adoption in European subsidiary lagging (40% vs 85% target). Support tickets up 25%.',
      stakeholders: 'CIO (exec sponsor), VP Operations (champion), IT Director (day-to-day), Procurement (renewal)',
      agenda: 'Value delivered, roadmap preview, adoption plan for EU, renewal discussion (due in 6 months)',
    },
  },

  'customer-success-leader-renewal-risk-mitigator': {
    skillId: 'customer-success-leader-renewal-risk-mitigator',
    defaultTestCaseId: 'renewal-risk-default-1',
    description: 'Mitigating renewal risk for key account',
    inputPayload: {
      accountName: 'TechStart Solutions',
      renewalContext: '$500K ARR renewal in 60 days. Contract is 15% price increase (standard). Customer pushed back.',
      riskSignals: `Health score dropped from 85 to 62
Executive sponsor departed
Competitor demo scheduled
Usage declined 30% after layoffs
Budget review ongoing`,
      relationshipHistory: '3-year customer, was reference customer, expanded 2x. New VP making changes.',
      availableLevers: 'Pricing flexibility (up to 10%), extended term discount, professional services credits, product roadmap influence',
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
      complianceFramework: 'SOC 2 Type II',
      policyArea: 'Access Control',
      existingPolicy: `Access Control Policy v2.1:
- All access requires manager approval
- Quarterly access reviews required
- MFA required for all systems
- Privileged access requires additional approval
- Access removed within 24 hours of termination`,
      controls: 'Need to map policy to specific technical and operational controls with evidence requirements',
      systems: 'Primary systems: AWS, Okta, GitHub, Salesforce, Slack',
      auditTimeline: 'SOC 2 audit in 3 months',
    },
  },

  'security-compliance-analyst-security-incident-communicator': {
    skillId: 'security-compliance-analyst-security-incident-communicator',
    defaultTestCaseId: 'incident-comm-default-1',
    description: 'Creating security incident communications',
    inputPayload: {
      incidentSummary: 'Unauthorized access to customer data detected. Attacker gained access via compromised employee credentials. 500 customer records potentially exposed.',
      incidentTimeline: 'Detected: 2pm today. Contained: 5pm. Investigation ongoing.',
      impactAssessment: 'Customer PII (names, emails, phone numbers). No financial data or passwords exposed. Affected customers identified.',
      audiences: 'Internal leadership, affected customers, regulators (if required), employees',
      regulatoryContext: 'GDPR applies (EU customers affected). State breach notification laws may apply.',
      communicationTiming: 'Internal within 24 hours, external within 72 hours per GDPR',
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
      campaignScope: 'Q4 product launch campaign - paid social, paid search, email, webinar',
      trackingSetup: `UTM Structure: utm_source/medium/campaign/content/term
Landing pages: 5 unique pages with form submissions
Attribution model: First-touch for MQLs, multi-touch for pipeline
Tools: HubSpot (marketing automation), Salesforce (CRM), GA4, Segment`,
      knownIssues: 'Some leads showing "direct" source. LinkedIn data not syncing to Salesforce. Webinar attribution unclear.',
      auditGoals: 'Ensure accurate campaign ROI reporting before Q4 close. Fix attribution gaps.',
    },
  },

  'marketing-operations-specialist-marketing-automation-flow-builder': {
    skillId: 'marketing-operations-specialist-marketing-automation-flow-builder',
    defaultTestCaseId: 'automation-flow-default-1',
    description: 'Building marketing automation workflow',
    inputPayload: {
      workflowGoal: 'Lead nurture sequence for trial signups who have not converted after 14 days',
      triggerCondition: 'Trial signup date was 14+ days ago AND status is not "Converted" AND has not unsubscribed',
      desiredFlow: `Day 0: Check product usage score
High usage → Path A (close to conversion)
Low usage → Path B (needs education)
No usage → Path C (re-engagement)
Each path has 3-5 emails over 14 days with exit conditions`,
      platform: 'HubSpot Marketing Hub Enterprise',
      integration: 'Product usage data synced from Segment, updated daily',
      constraints: 'Must respect send frequency limits (max 2 emails/week per contact)',
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
      problemStatement: 'Users are abandoning our onboarding flow at 60% rate. Need to understand why and identify solutions.',
      teamComposition: '1 PM, 2 designers, 3 engineers, 1 data analyst. Team is new to structured discovery.',
      timeline: '2-week discovery sprint',
      constraints: 'Limited access to users (can schedule 5-8 interviews). Engineering capacity for prototyping is 1 engineer for 1 week.',
      existingData: 'Analytics showing drop-off points, 3 support tickets about onboarding confusion, one customer churn exit survey mention',
      desiredOutcome: 'Validated solution hypothesis ready for design sprint or direct implementation',
    },
  },

  'product-discovery-lead-research-insight-synthesizer': {
    skillId: 'product-discovery-lead-research-insight-synthesizer',
    defaultTestCaseId: 'insight-synthesizer-default-1',
    description: 'Synthesizing discovery research findings',
    inputPayload: {
      researchConducted: `8 user interviews (mix of churned and active users)
Competitive analysis of 5 competitors
Analytics review of last 90 days
Support ticket analysis (50 tickets reviewed)
Sales call recordings (10 calls)`,
      rawFindings: `Interviews: Users confused by pricing tiers, want simpler setup, value integrations most
Competitive: Competitors offer guided setup wizards, better mobile experience
Analytics: 70% drop at step 3 of onboarding, mobile users 2x more likely to abandon
Support: Top issue is integration setup, second is billing questions
Sales: Prospects ask about time-to-value, compare us to Competitor X`,
      synthesisGoal: 'Identify top 3 opportunities with supporting evidence and confidence levels',
      audience: 'Product leadership and stakeholders for roadmap planning',
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
};
