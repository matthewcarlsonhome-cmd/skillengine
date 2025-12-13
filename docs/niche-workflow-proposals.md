# Niche Workflow Proposals: Net-New Skills for Selected Niches

**Date:** 2025-12-13
**Purpose:** Detailed specifications for new skills/workflows targeting profitable niches

---

## Selection Criteria

Skills selected for implementation must:
- Not duplicate existing skills
- Address high-frequency, high-pain workflows
- Have clear input/output structure suitable for AI
- Provide measurable time/cost savings
- Be implementable with current platform architecture

---

# NICHE 1: AI Governance & Data Security

## Skill 1.1: AI Governance Readiness Assessment

**ID:** `ai-governance-readiness-assessment`

**Target Niche & Roles:**
- Enterprise: Security teams, Compliance officers, IT leadership, Legal
- Mid-market: Technology leaders, Operations directors

**Business Problem:**
Organizations are rapidly adopting AI tools (ChatGPT, Copilot, internal LLMs) without governance frameworks. This creates legal, security, and reputational risks. Most organizations don't know where to start with AI governance, and consulting engagements cost $50K-200K+.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| organizationSize | select | Yes | Options: 1-100, 101-500, 501-2000, 2001-10000, 10000+ |
| industry | select | Yes | Options: Technology, Financial Services, Healthcare, Manufacturing, Retail, Professional Services, Government, Other |
| currentAIUsage | textarea | Yes | "Using ChatGPT for marketing copy, GitHub Copilot for developers, exploring customer service chatbot" |
| dataClassifications | textarea | Yes | "Public, Internal, Confidential, Restricted; handle PII, some PHI" |
| existingPolicies | textarea | No | "Have IT security policy, acceptable use policy, no AI-specific policies" |
| keyConcerns | textarea | Yes | "Data leakage to AI vendors, compliance with GDPR, employee misuse" |
| regulatoryRequirements | textarea | No | "GDPR, SOC2, HIPAA for some clients" |

**Outputs:**
- **Governance Maturity Snapshot** - Current state assessment (1-5 scale across dimensions)
- **Gap Analysis** - What's missing vs. best practices
- **Risk Heat Map** - Prioritized risks by likelihood and impact
- **Recommendations Roadmap** - Phased action plan (Quick Wins, Short-term, Medium-term)
- **Policy Framework Outline** - Key policies needed with scope descriptions
- **Stakeholder Roles** - Who should own what in AI governance
- **Resource Estimates** - Rough effort/investment needed

**Time/Cost Impact:**
- Replaces $50K+ consulting engagement for initial assessment
- Reduces governance planning from months to days
- Provides structured starting point vs. blank page

---

## Skill 1.2: Secure AI Usage Playbook Builder

**ID:** `secure-ai-usage-playbook`

**Target Niche & Roles:**
- Enterprise: Security, HR, Legal, IT
- SMB: Operations leads, Technology managers

**Business Problem:**
After deciding to allow AI, organizations need practical guidelines for employees. Current approaches are either too restrictive (blocking innovation) or too loose (creating risk). Most playbooks are copy-pasted from the internet and don't fit organizational context.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| approvedAITools | textarea | Yes | "ChatGPT Enterprise, Microsoft Copilot, Midjourney (marketing only)" |
| commonUseCases | textarea | Yes | "Customer support drafting, code assistance, content creation, data analysis, translation" |
| prohibitedActivities | textarea | Yes | "Processing customer PII, generating legal documents, making hiring decisions" |
| dataHandlingRules | textarea | Yes | "No customer names, no financial data, no source code in free tiers" |
| regulatoryContext | textarea | No | "Financial services, must maintain audit trails" |
| audienceLevel | select | Yes | Options: All Employees, Technical Staff Only, Management Only, Specific Departments |

**Outputs:**
- **Acceptable Use Guidelines** - Clear do's and don'ts
- **Tool-Specific Rules** - What's allowed per approved tool
- **Data Classification Quick Reference** - What can/cannot go into AI
- **Use Case Decision Tree** - Is this AI use appropriate?
- **Required Disclosures** - When to disclose AI assistance
- **Escalation Procedures** - Who to ask when uncertain
- **Acknowledgment Form Template** - Employee sign-off document
- **Training Outline** - Key topics for employee education

**Time/Cost Impact:**
- Playbook development from 4-8 weeks to 2-4 hours
- Ensures comprehensive coverage vs. ad-hoc policies
- Customized to organization vs. generic templates

---

## Skill 1.3: AI Data Flow Risk Mapper

**ID:** `ai-data-flow-risk-map`

**Target Niche & Roles:**
- Enterprise: Security architects, Data protection officers, IT leadership
- Compliance: Privacy teams, Risk management

**Business Problem:**
Organizations don't have visibility into how data flows through AI systems. They can't answer: Where does our data go? What AI systems touch sensitive data? What are the egress points? This makes compliance attestation and risk assessment impossible.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| keySystemsInventory | textarea | Yes | "Salesforce CRM, SAP ERP, Zendesk ticketing, SharePoint, AWS S3" |
| dataTypesProcessed | textarea | Yes | "Customer PII (names, emails), Financial transactions, Employee HR data, Product IP" |
| aiIntegrations | textarea | Yes | "Salesforce Einstein, ChatGPT via Zapier, GitHub Copilot, custom RAG chatbot" |
| dataResidencyRequirements | textarea | No | "EU customer data must stay in EU, HIPAA data cannot leave US" |
| currentSecurityControls | textarea | No | "SSO, DLP on email, no AI-specific controls" |
| plannedAIExpansions | textarea | No | "Considering AI customer service bot, AI document processing" |

**Outputs:**
- **Data Flow Diagram Description** - Textual map of AI touchpoints
- **Risk Point Inventory** - Where sensitive data meets AI
- **Control Gap Analysis** - Missing security controls by risk point
- **Third-Party AI Risk Summary** - External AI vendors and their data access
- **Recommended Mitigations** - Encryption, access control, logging suggestions
- **Data Minimization Opportunities** - Where to reduce AI data exposure
- **Compliance Checkpoint Matrix** - Requirements mapped to current state
- **Monitoring Recommendations** - What to track for ongoing risk management

**Time/Cost Impact:**
- Data flow mapping from weeks to hours
- Identifies risks often missed in manual reviews
- Provides structured format for compliance documentation

---

## Skill 1.4: AI Governance Client Brief Generator

**ID:** `ai-governance-client-brief`

**Target Niche & Roles:**
- Enterprise: Sales engineers, Account managers, Customer success
- Consulting: Advisors helping clients adopt AI
- Vendors: AI tool companies addressing customer concerns

**Business Problem:**
When selling to or advising enterprise clients, AI governance questions are now standard. "How do you handle our data?" "What's your AI policy?" "How do we explain this to our board?" Sales and advisory teams need ready-to-use materials that address concerns without creating fear.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| clientIndustry | select | Yes | Options: Financial Services, Healthcare, Government, Technology, Manufacturing, Retail, Other |
| clientRiskPosture | select | Yes | Options: Very Conservative, Conservative, Moderate, Progressive |
| mainObjections | textarea | Yes | "Worried about data being used to train models, concerned about regulatory compliance, board asking about AI risks" |
| yourAICapabilities | textarea | Yes | "Use GPT-4 for document analysis, customer data never leaves our environment, SOC2 certified" |
| dataHandlingPractices | textarea | Yes | "Data encrypted at rest/transit, no data retention by AI vendors, anonymization before processing" |
| complianceCertifications | textarea | No | "SOC2 Type II, GDPR compliant, HIPAA BAA available" |

**Outputs:**
- **Executive Summary Brief** - Non-technical explanation of AI governance approach
- **Data Handling Explainer** - Clear description of what happens to client data
- **Security Controls Summary** - Technical safeguards in accessible language
- **Compliance Alignment Matrix** - How capabilities map to common frameworks
- **FAQ Document** - Anticipated questions with prepared answers
- **Talking Points** - Key messages for different stakeholder conversations
- **Risk Mitigation Summary** - How concerns are addressed
- **Next Steps Recommendations** - Path forward for engagement

**Time/Cost Impact:**
- Client brief preparation from hours to minutes
- Consistent, professional responses to AI concerns
- Enables sales teams to handle governance discussions confidently

---

# NICHE 2: Compliance & Audit Operations

## Skill 2.1: Compliance Audit Preparation Assistant

**ID:** `compliance-audit-prep-assistant`

**Target Niche & Roles:**
- Enterprise: Compliance managers, Internal audit, IT security
- Regulated industries: Financial services, Healthcare, Technology

**Business Problem:**
Audit preparation is panic-driven chaos. Teams scramble to locate evidence, discover gaps too late, and spend nights before audits assembling materials. Audits cost $100K-500K+ in internal effort, and findings lead to costly remediation.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| auditType | select | Yes | Options: SOC2 Type II, ISO 27001, HIPAA, PCI-DSS, GDPR, Internal Audit, Custom Framework |
| auditScope | textarea | Yes | "Cloud infrastructure, customer data handling, access management, incident response" |
| auditTimeline | text | Yes | "Audit fieldwork begins March 15, 2025" |
| controlFramework | textarea | Yes | "TSC criteria for SOC2: CC1-CC9, availability, confidentiality" |
| availableEvidence | textarea | Yes | "AWS CloudTrail logs, Okta access reviews, Jira tickets, Confluence policies" |
| knownGaps | textarea | No | "Missing quarterly access reviews for Q2, incomplete BCP testing documentation" |
| previousFindings | textarea | No | "Last year: 2 observations on access review timeliness, 1 on vendor management" |

**Outputs:**
- **Audit Readiness Score** - Percentage ready by control area
- **Evidence Checklist** - Required items with availability status
- **Gap Remediation Plan** - Prioritized actions before audit
- **Control-to-Evidence Matrix** - What proves each control
- **Interview Preparation Guide** - Likely questions by control area
- **Document Request List** - What auditors will ask for
- **Risk Areas Summary** - Where findings are most likely
- **Daily Prep Timeline** - Countdown activities to audit date

**Time/Cost Impact:**
- Audit prep from 3-month scramble to organized 4-week effort
- Reduces audit findings by 20-40% through early gap identification
- Cuts internal audit prep cost by 50%+

---

## Skill 2.2: Policy Document Generator

**ID:** `policy-document-generator`

**Target Niche & Roles:**
- Enterprise: Compliance, Legal, HR, IT Security
- SMB: Operations managers wearing compliance hats

**Business Problem:**
Organizations need dozens of policies (security, privacy, acceptable use, data retention, etc.) but writing them is tedious. Policies become outdated, inconsistent in format, and don't reflect actual practices. Policy updates triggered by audits become emergency projects.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| policyType | select | Yes | Options: Information Security, Data Privacy, Acceptable Use, Data Retention, Incident Response, Access Control, Vendor Management, Business Continuity, Remote Work, AI/ML Usage |
| organizationContext | textarea | Yes | "500-person technology company, SOC2 certified, handles customer PII" |
| regulatoryRequirements | textarea | Yes | "Must comply with GDPR, CCPA, SOC2 trust criteria" |
| existingPractices | textarea | Yes | "Use Okta for SSO, 90-day password rotation, annual security training" |
| approvalAuthority | text | Yes | "CISO with CEO sign-off" |
| reviewCycle | select | Yes | Options: Annual, Semi-annual, Quarterly, As Needed |
| audienceScope | select | Yes | Options: All Employees, IT Staff, Management, Contractors, Specific Departments |

**Outputs:**
- **Complete Policy Document** - Formatted, professional policy
- **Policy Summary** - One-page executive overview
- **Implementation Checklist** - Actions to operationalize policy
- **Training Requirements** - What employees need to know
- **Exception Process** - How to request policy exceptions
- **Metrics and Monitoring** - How to measure compliance
- **Related Policies** - Cross-references to other documents
- **Version Control Template** - Change history format

**Time/Cost Impact:**
- Policy writing from 2-4 days to 2-4 hours
- Ensures comprehensive coverage of required elements
- Consistent format across all organizational policies

---

## Skill 2.3: Regulatory Change Impact Analyzer

**ID:** `regulatory-change-impact-analyzer`

**Target Niche & Roles:**
- Enterprise: Compliance, Legal, Risk, Privacy
- Regulated industries: All

**Business Problem:**
New regulations and regulatory updates appear constantly (GDPR updates, state privacy laws, industry rules). Compliance teams must assess impact, determine required changes, and coordinate responses. This is reactive, manual, and often delayed.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| regulatoryChange | textarea | Yes | "California CPRA amendments effective January 2025 expand definition of sensitive personal information and require new opt-out mechanisms" |
| currentCompliance | textarea | Yes | "Currently CCPA compliant with privacy policy, cookie consent, DSAR process" |
| affectedSystems | textarea | Yes | "Customer database, marketing automation, website, mobile app" |
| businessOperations | textarea | Yes | "B2B SaaS, collect customer employee data, marketing to CA businesses" |
| existingControls | textarea | No | "Privacy by design reviews, DPIAs for new products, consent management platform" |
| implementationTimeline | text | No | "Regulation effective Jan 1, 2025; internal deadline Nov 15, 2024" |

**Outputs:**
- **Impact Assessment Summary** - How this affects the organization
- **Gap Analysis** - Current state vs. new requirements
- **Required Changes List** - Specific modifications needed
- **Priority Matrix** - Urgency vs. effort for each change
- **Stakeholder Impact Map** - Who needs to be involved
- **Implementation Roadmap** - Phased approach to compliance
- **Resource Estimate** - Effort and potential cost
- **Risk of Non-Compliance** - What happens if not addressed

**Time/Cost Impact:**
- Regulatory analysis from weeks to hours
- Ensures comprehensive impact identification
- Enables proactive vs. reactive compliance

---

# NICHE 3: IT Operations & Service Management

## Skill 3.1: Incident Postmortem Generator

**ID:** `incident-postmortem-generator`

**Target Niche & Roles:**
- Enterprise: SRE, IT Operations, DevOps, Engineering leadership
- Any organization with production systems

**Business Problem:**
After incidents, teams are exhausted and postmortems are rushed or skipped. Quality varies wildly—some teams produce excellent analyses while others write two paragraphs. Root causes are shallow, action items lack owners, and the same incidents recur.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| incidentTitle | text | Yes | "Production Database Outage - Order Processing" |
| severity | select | Yes | Options: SEV1 (Critical), SEV2 (Major), SEV3 (Minor), SEV4 (Low) |
| incidentTimeline | textarea | Yes | "14:32 - Alert fired for DB connection errors\n14:35 - On-call paged\n14:45 - Identified connection pool exhaustion..." |
| impactDescription | textarea | Yes | "Order processing unavailable for 47 minutes, ~$50K revenue impact, 1,200 customers affected" |
| rootCauseAnalysis | textarea | Yes | "Connection pool sized for 100 connections, traffic spike caused 300 concurrent requests, no autoscaling" |
| responseActions | textarea | Yes | "Increased connection pool to 500, added monitoring for connection count, implemented circuit breaker" |
| contributingFactors | textarea | No | "No load testing for Black Friday traffic, monitoring threshold too high, runbook outdated" |
| lessonsLearned | textarea | No | "Need capacity planning for peak events, improve alert thresholds, update runbooks quarterly" |

**Outputs:**
- **Executive Summary** - Non-technical incident overview
- **Timeline Visualization** - Structured chronological view
- **Impact Analysis** - Quantified business impact
- **5 Whys Analysis** - Structured root cause investigation
- **Contributing Factors** - Human, process, and technical elements
- **Action Items** - Specific, owned, time-bound improvements
- **Prevention Recommendations** - How to avoid recurrence
- **Metrics to Track** - Leading indicators for monitoring

**Time/Cost Impact:**
- Postmortem creation from 4-8 hours to 1-2 hours
- Consistent quality across all incidents
- Better action items lead to fewer repeat incidents

---

## Skill 3.2: Change Request Documentation Builder

**ID:** `change-request-doc-builder`

**Target Niche & Roles:**
- Enterprise: IT Operations, Release Management, DevOps
- Any organization with change management processes

**Business Problem:**
Change Advisory Board (CAB) reviews require extensive documentation—risk assessments, rollback plans, testing evidence, stakeholder notifications. Teams copy-paste from previous changes, miss required sections, and CAB rejects incomplete submissions. Failed changes cost $5K-50K+ per incident.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| changeSummary | textarea | Yes | "Deploy new authentication microservice to production, replacing legacy auth module" |
| changeType | select | Yes | Options: Standard (pre-approved), Normal (requires approval), Emergency |
| systemsAffected | textarea | Yes | "Auth service, user database, API gateway, mobile apps, web portal" |
| implementationSteps | textarea | Yes | "1. Deploy to staging (2h)\n2. Run integration tests (1h)\n3. Deploy to prod with canary (2h)\n4. Full rollout (1h)" |
| testingEvidence | textarea | Yes | "Unit tests: 98% pass, Integration tests: 95% pass, Load test: handled 2x expected traffic" |
| rollbackPlan | textarea | Yes | "Revert container image to previous version, rollback database migration, restore from snapshot if needed" |
| scheduledWindow | text | Yes | "Saturday 2:00 AM - 6:00 AM EST, low traffic period" |
| riskAssessment | textarea | No | "Medium risk: affects all logins, mitigated by canary deployment and quick rollback capability" |

**Outputs:**
- **CAB-Ready Summary** - One-page executive view
- **Risk Assessment Matrix** - Likelihood x impact analysis
- **Implementation Checklist** - Step-by-step with time estimates
- **Rollback Decision Tree** - When and how to rollback
- **Stakeholder Notification List** - Who to inform and when
- **Go/No-Go Criteria** - Conditions for proceeding
- **Post-Implementation Verification** - How to confirm success
- **Communication Templates** - Start, complete, rollback messages

**Time/Cost Impact:**
- Change documentation from 2-4 hours to 30-60 minutes
- Higher CAB approval rate through complete submissions
- Reduced change-related incidents through better planning

---

## Skill 3.3: IT Runbook Creator

**ID:** `it-runbook-creator`

**Target Niche & Roles:**
- Enterprise: IT Operations, SRE, DevOps, Support
- Any organization with operational procedures

**Business Problem:**
Operational knowledge lives in engineers' heads. When they leave or are unavailable, teams struggle. Runbooks exist but are outdated, incomplete, or scattered across wikis. New team members take months to become effective.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| procedureName | text | Yes | "Database Failover to Secondary Region" |
| procedureType | select | Yes | Options: Routine Maintenance, Incident Response, Disaster Recovery, Deployment, Monitoring, Troubleshooting |
| triggerConditions | textarea | Yes | "Primary database region unavailable >5 minutes, or planned maintenance requiring region switchover" |
| systemsInvolved | textarea | Yes | "PostgreSQL primary (us-east), PostgreSQL replica (us-west), PgBouncer, application servers" |
| procedureSteps | textarea | Yes | "1. Verify primary is actually unavailable\n2. Promote replica to primary\n3. Update DNS/connection strings\n4. Verify application connectivity\n5. Notify stakeholders" |
| prerequisites | textarea | No | "VPN access, database admin credentials, AWS console access, PagerDuty admin" |
| rollbackSteps | textarea | No | "Demote new primary back to replica, restore original primary, update DNS back" |
| estimatedDuration | text | No | "15-30 minutes for failover, 1-2 hours for full validation" |

**Outputs:**
- **Formatted Runbook Document** - Professional, structured procedure
- **Quick Reference Card** - One-page summary for urgent situations
- **Prerequisites Checklist** - What's needed before starting
- **Step-by-Step Instructions** - Detailed, numbered steps with expected outputs
- **Verification Commands** - How to confirm each step succeeded
- **Troubleshooting Guide** - Common issues and resolutions
- **Escalation Paths** - Who to contact if stuck
- **Related Runbooks** - Cross-references to related procedures

**Time/Cost Impact:**
- Runbook creation from days to hours
- Consistent format across all procedures
- Faster onboarding for new team members
- Reduced mean time to resolution (MTTR)

---

# NICHE 4: Legal Operations

## Skill 4.1: Legal Intake Triage Assistant

**ID:** `legal-intake-triage-assistant`

**Target Niche & Roles:**
- Enterprise: Legal operations, In-house counsel, Paralegals
- Any organization with internal legal function

**Business Problem:**
Business teams submit legal requests via email, Slack, or ad-hoc conversations. Legal can't prioritize effectively, requests lack needed information, and requestors don't know status. High-value work gets delayed by low-priority requests.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| requestDescription | textarea | Yes | "Need contract review for new cloud vendor, they want us to sign their paper" |
| requestType | select | Yes | Options: Contract Review, Legal Advice, Litigation Support, Regulatory Question, Employment Matter, IP Question, Other |
| requestor | text | Yes | "Jane Smith, VP Engineering" |
| businessContext | textarea | Yes | "Vendor provides CI/CD pipeline tools, $50K annual contract, want to start using in 2 weeks" |
| urgency | select | Yes | Options: Emergency (same day), Urgent (2-3 days), Standard (1-2 weeks), Low (when available) |
| attachments | textarea | No | "Vendor MSA attached, 35 pages, their standard terms" |
| previousRelated | textarea | No | "We've worked with similar vendors before, had issues with data handling terms" |

**Outputs:**
- **Triage Assessment** - Priority classification with rationale
- **Information Completeness** - What's provided vs. what's needed
- **Follow-up Questions** - Specific clarifications required
- **Preliminary Risk Flags** - Initial concerns to investigate
- **Estimated Effort** - Rough hours for legal review
- **Recommended Assignee Profile** - Seniority/expertise needed
- **SLA Recommendation** - Expected turnaround based on priority
- **Requestor Response Template** - Acknowledgment message

**Time/Cost Impact:**
- Intake processing from 30+ minutes to 5 minutes
- Consistent prioritization across all requests
- Better resource allocation to high-value work

---

## Skill 4.2: Legal Matter Status Summarizer

**ID:** `legal-matter-status-summarizer`

**Target Niche & Roles:**
- Enterprise: Legal operations, General counsel, Business stakeholders
- Any organization tracking legal matters

**Business Problem:**
Business leaders ask "what's the status of X?" and legal must dig through files, emails, and systems to respond. Status updates are manual, inconsistent, and time-consuming. Stakeholders feel uninformed and make repeated requests.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| matterName | text | Yes | "Acme Corp. Contract Negotiation" |
| matterType | select | Yes | Options: Contract, Litigation, Regulatory, Employment, IP, Corporate, Other |
| currentStatus | textarea | Yes | "In negotiation round 3, awaiting their response to our redlines on indemnification and liability caps" |
| keyMilestones | textarea | Yes | "Draft received Jan 5, First redlines sent Jan 12, Their response Jan 18, Our counter Jan 25" |
| openIssues | textarea | Yes | "1. Uncapped indemnification (we want cap)\n2. Broad IP assignment (we want narrow)\n3. Audit rights (we want limited)" |
| nextSteps | textarea | Yes | "Awaiting their response by Feb 1, then likely one more round before signature" |
| audienceLevel | select | Yes | Options: Executive Summary, Business Stakeholder, Legal Team, Detailed |
| riskAssessment | textarea | No | "Medium risk on indemnification if we can't get cap, may need business decision" |

**Outputs:**
- **Executive Summary** - 2-3 sentence status
- **Current Phase Description** - Where we are in the process
- **Progress Timeline** - Visual-ready milestone summary
- **Open Issues Summary** - Prioritized outstanding items
- **Risk Assessment** - Current risk posture
- **Next Steps** - Specific upcoming actions with dates
- **Decision Points** - What requires business input
- **Projected Timeline** - Expected completion estimate

**Time/Cost Impact:**
- Status updates from 30 minutes to 5 minutes
- Consistent information across all stakeholders
- Reduced status request interruptions

---

# NICHE 5: Procurement & Vendor Management

## Skill 5.1: RFP Document Generator

**ID:** `rfp-document-generator`

**Target Niche & Roles:**
- Enterprise: Procurement, Sourcing, IT, Business units
- Any organization that issues RFPs

**Business Problem:**
Creating RFPs is tedious and inconsistent. Teams copy from old RFPs, miss important requirements, and produce documents that don't effectively evaluate vendors. Poor RFPs lead to poor vendor selections.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| projectName | text | Yes | "Enterprise CRM Platform Selection" |
| projectDescription | textarea | Yes | "Replace legacy CRM with modern cloud platform, support 500 sales users, integrate with ERP" |
| requirements | textarea | Yes | "Contact management, opportunity tracking, forecasting, mobile access, Salesforce-like UX" |
| technicalRequirements | textarea | Yes | "Cloud-hosted, SOC2 certified, SSO integration, API access, 99.9% uptime SLA" |
| evaluationCriteria | textarea | Yes | "Functionality 40%, Price 25%, Implementation 20%, Support 15%" |
| timeline | text | Yes | "RFP issued Feb 1, responses due Feb 28, selection by March 31" |
| budgetRange | text | No | "$200K-400K annual" |
| complianceRequirements | textarea | No | "GDPR compliant, data residency in US" |

**Outputs:**
- **Complete RFP Document** - Formatted, professional RFP
- **Executive Summary Section** - Project overview for vendors
- **Technical Requirements Matrix** - Detailed must-have/nice-to-have
- **Evaluation Scorecard Template** - How responses will be scored
- **Vendor Response Template** - Structured format for responses
- **Timeline and Process** - Key dates and evaluation process
- **Terms and Conditions** - Standard procurement terms
- **Q&A Process Description** - How vendor questions will be handled

**Time/Cost Impact:**
- RFP creation from 2-4 days to 2-4 hours
- Comprehensive coverage of requirements
- Better vendor responses through clear structure

---

## Skill 5.2: Vendor Evaluation Scorecard

**ID:** `vendor-evaluation-scorecard`

**Target Niche & Roles:**
- Enterprise: Procurement, Sourcing, Business stakeholders
- Any organization evaluating vendors

**Business Problem:**
Vendor evaluation is subjective and inconsistent. Different evaluators weight factors differently, documentation is scattered, and decisions are hard to defend. Selection mistakes cost organizations hundreds of thousands in switching costs.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| procurementCategory | text | Yes | "Enterprise CRM Platform" |
| vendorResponses | textarea | Yes | "Vendor A: Salesforce, strong functionality, $350K/yr\nVendor B: HubSpot, good value, $180K/yr\nVendor C: Microsoft Dynamics, deep ERP integration, $220K/yr" |
| evaluationCriteria | textarea | Yes | "Functionality (40%), Price (25%), Implementation (20%), Support (15%)" |
| mustHaveRequirements | textarea | Yes | "Cloud-hosted, SOC2, SSO, mobile access, API availability" |
| evaluatorNotes | textarea | Yes | "Salesforce: Best UX but expensive. HubSpot: Missing advanced forecasting. Dynamics: Integration advantage but dated UI" |
| referenceFeedback | textarea | No | "Salesforce refs: high satisfaction. HubSpot refs: good for SMB. Dynamics refs: complex implementation" |
| riskFactors | textarea | No | "Vendor A: vendor lock-in. Vendor B: might outgrow. Vendor C: resource availability" |

**Outputs:**
- **Comparative Scorecard** - Side-by-side vendor comparison
- **Criteria-by-Criteria Analysis** - Detailed scoring breakdown
- **Strengths and Weaknesses Matrix** - Key differentiators
- **Risk Assessment** - Vendor-specific risks
- **Total Cost of Ownership** - Full cost comparison
- **Recommendation Summary** - Suggested selection with rationale
- **Negotiation Points** - Leverage areas for final negotiation
- **Decision Documentation** - Audit-ready selection justification

**Time/Cost Impact:**
- Evaluation documentation from days to hours
- Objective, defensible selection process
- Better decisions through structured analysis

---

# NICHE 6: HR Business Partners

## Skill 6.1: Headcount Business Case Builder

**ID:** `headcount-business-case-builder`

**Target Niche & Roles:**
- Enterprise: HRBP, Hiring managers, Finance partners, HR leadership
- Any organization with structured hiring approval

**Business Problem:**
Headcount requests vary wildly in quality. Some managers provide detailed justification while others submit one-liners. HR and Finance waste time requesting more information, and approvals are delayed. Poor business cases lead to bad hiring decisions.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| roleTitles | textarea | Yes | "2x Senior Software Engineers, 1x Engineering Manager" |
| department | text | Yes | "Platform Engineering" |
| businessJustification | textarea | Yes | "Current team at 120% capacity, two major projects at risk, customer escalations increasing" |
| currentTeamComposition | textarea | Yes | "5 engineers, 1 manager, 3 senior, 2 mid-level, losing 1 senior to internal transfer" |
| workloadEvidence | textarea | Yes | "Sprint velocity down 20%, bug backlog up 40%, customer response time increased from 4h to 12h" |
| financialImpact | textarea | No | "Each day of delay costs $5K in customer penalties, 3 deals worth $500K waiting on features" |
| alternativesConsidered | textarea | No | "Contractors: $180/hr vs $100/hr fully loaded. Automation: 6 months to build. Outsourcing: quality concerns" |
| targetCompensation | text | No | "Senior: $180K base + 15% bonus. Manager: $200K base + 20% bonus" |

**Outputs:**
- **Executive Summary** - One-page business case
- **Current State Analysis** - Team capacity and workload
- **Business Impact Quantification** - Revenue/cost impact of not hiring
- **Role-by-Role Justification** - Why each role is needed
- **Financial Analysis** - Cost vs. return
- **Alternatives Analysis** - Why other options don't work
- **Timeline Urgency** - Consequences of delay
- **Risk Assessment** - What happens if not approved
- **Approval Recommendation** - Clear ask with supporting evidence

**Time/Cost Impact:**
- Business case development from days to hours
- Higher approval rate through complete justification
- Faster hiring cycles through better documentation

---

## Skill 6.2: Organizational Change Communication Pack

**ID:** `org-change-communication-pack`

**Target Niche & Roles:**
- Enterprise: HR, Communications, Leadership, Change management
- Any organization undergoing restructuring

**Business Problem:**
Organizational changes (reorgs, M&A, layoffs, strategy shifts) require multi-channel communications. Messages must be consistent yet tailored to audiences. Teams rush to create materials under pressure, leading to confusion and damaged trust.

**Inputs:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| changeDescription | textarea | Yes | "Consolidating three product teams into two, eliminating PM layer, 12 roles affected" |
| changeRationale | textarea | Yes | "Market conditions require faster decision-making, reduce management overhead, improve efficiency" |
| affectedGroups | textarea | Yes | "Product team (directly affected), Engineering (new structure), Sales (different contacts)" |
| leadershipMessages | textarea | Yes | "CEO: market adaptation. CPO: product excellence. CHRO: support for transitions" |
| supportResources | textarea | Yes | "Severance package, career transition support, internal mobility program, EAP" |
| timeline | text | Yes | "Announce Monday 9 AM, town hall Monday 2 PM, manager Q&A Tuesday, individual conversations Wednesday-Friday" |
| sensitivePoints | textarea | No | "Avoid promising future no layoffs, acknowledge difficulty, focus on support" |

**Outputs:**
- **All-Hands Announcement Script** - CEO/leader prepared remarks
- **Manager Talking Points** - Cascade communication guide
- **Employee FAQ Document** - Anticipated questions with answers
- **Affected Employee Communication** - Personal notification template
- **Broader Team Communication** - Non-affected employee message
- **External Statement** - If needed for press/customers
- **Communication Timeline** - Who hears what when
- **Escalation Procedures** - How to handle difficult questions
- **Follow-up Communication Plan** - Post-announcement cadence

**Time/Cost Impact:**
- Communication development from weeks to days
- Consistent messaging reduces confusion
- Professional handling protects employer brand

---

# Summary: Proposed Skills by Niche

| Niche | Skill ID | Name | Priority |
|-------|----------|------|----------|
| **AI Governance** | ai-governance-readiness-assessment | AI Governance Readiness Assessment | P1 |
| **AI Governance** | secure-ai-usage-playbook | Secure AI Usage Playbook Builder | P1 |
| **AI Governance** | ai-data-flow-risk-map | AI Data Flow Risk Mapper | P1 |
| **AI Governance** | ai-governance-client-brief | AI Governance Client Brief Generator | P1 |
| **Compliance** | compliance-audit-prep-assistant | Compliance Audit Preparation Assistant | P1 |
| **Compliance** | policy-document-generator | Policy Document Generator | P1 |
| **Compliance** | regulatory-change-impact-analyzer | Regulatory Change Impact Analyzer | P2 |
| **IT Operations** | incident-postmortem-generator | Incident Postmortem Generator | P1 |
| **IT Operations** | change-request-doc-builder | Change Request Documentation Builder | P1 |
| **IT Operations** | it-runbook-creator | IT Runbook Creator | P2 |
| **Legal Ops** | legal-intake-triage-assistant | Legal Intake Triage Assistant | P2 |
| **Legal Ops** | legal-matter-status-summarizer | Legal Matter Status Summarizer | P2 |
| **Procurement** | rfp-document-generator | RFP Document Generator | P2 |
| **Procurement** | vendor-evaluation-scorecard | Vendor Evaluation Scorecard | P2 |
| **HR** | headcount-business-case-builder | Headcount Business Case Builder | P2 |
| **HR** | org-change-communication-pack | Organizational Change Communication Pack | P2 |

---

## Recommended First Wave Implementation (8 Skills)

**Priority 1 - Implement Now:**
1. `ai-governance-readiness-assessment` - AI Governance Assessment
2. `secure-ai-usage-playbook` - AI Usage Playbook Builder
3. `ai-data-flow-risk-map` - AI Data Flow Risk Map
4. `ai-governance-client-brief` - AI Governance Client Brief
5. `compliance-audit-prep-assistant` - Compliance Audit Prep
6. `policy-document-generator` - Policy Document Generator
7. `incident-postmortem-generator` - Incident Postmortem
8. `change-request-doc-builder` - Change Request Builder

**Rationale:**
- AI Governance suite addresses urgent, unmet market need
- Compliance tools have clear enterprise ROI
- IT Operations skills build technical credibility
- All have high frequency use and measurable time savings
