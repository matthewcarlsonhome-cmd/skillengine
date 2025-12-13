# Skill & Workflow Change Log

This document tracks fixes, improvements, and changes made to skills and workflows.

---

## 2025-12-13 (Update 3)

### AI Governance & Operations Suite Added

Added 8 new enterprise-focused skills and 4 new workflows targeting AI governance, compliance, and IT operations use cases. This expansion addresses high-ROI niches identified in the strategic niche analysis.

#### New AI Governance Skills (4)

Located in `lib/skills/governance.ts`:

| Skill ID | Name | Target Audience |
|----------|------|-----------------|
| `ai-governance-readiness-assessment` | AI Governance Readiness Assessment | Security/Compliance leaders, executives |
| `secure-ai-usage-playbook` | Secure AI Usage Playbook Builder | HR, Legal, IT teams |
| `ai-data-flow-risk-map` | AI Data Flow Risk Mapper | Security architects, DPOs |
| `ai-governance-client-brief` | AI Governance Client Brief Generator | Sales engineers, consultants |

#### New Compliance & IT Operations Skills (4)

Located in `lib/skills/operations.ts`:

| Skill ID | Name | Target Audience |
|----------|------|-----------------|
| `compliance-audit-prep-assistant` | Compliance Audit Preparation Assistant | Compliance officers, auditors |
| `policy-document-generator` | Policy Document Generator | Compliance, legal, CISO |
| `incident-postmortem-generator` | Incident Postmortem Generator | SRE, IT operations, DevOps |
| `change-request-doc-builder` | Change Request Documentation Builder | IT operations, change managers |

#### New Governance & Operations Workflows (4)

Located in `lib/workflows/governanceOps.ts`:

1. **AI Governance Implementation Pack** (`ai-governance-implementation`)
   - Assessment → Playbook → Client Brief
   - Target: Organizations starting AI governance programs
   - Estimated time: 25-35 minutes

2. **AI Data Protection Assessment** (`ai-data-protection-assessment`)
   - Risk mapping → Data-specific usage guidelines
   - Target: Security architects, DPOs preparing for audits
   - Estimated time: 20-30 minutes

3. **Compliance Program Builder** (`compliance-program-builder`)
   - Audit prep → Policy generation
   - Target: Teams preparing for SOC2, ISO 27001, HIPAA audits
   - Estimated time: 25-35 minutes

4. **Incident to Improvement Workflow** (`incident-to-improvement`)
   - Postmortem → Change request for remediation
   - Target: SRE/DevOps teams turning incidents into improvements
   - Estimated time: 20-30 minutes

#### Test Data Added

Created test data files in `testdata/skills/` for all 8 new skills:
- Each skill has 3 test cases (happy-path, edge-case, variant)
- All test cases include rubrics with weighted evaluation criteria
- Covers realistic enterprise scenarios

#### Strategic Analysis Documentation

Created planning documents in `docs/`:
- `niche-analysis.md` - Strategic positioning and gap analysis
- `niche-opportunities.md` - Evaluated 15 niches, selected 7 for development
- `niche-workflow-proposals.md` - Detailed specs for 16 skills, 8 selected for first wave

#### Infrastructure Updates

- Updated `lib/testing/registrySnapshot.ts` to include governance and operations skills
- Updated `lib/workflows/index.ts` to import and export governance workflows
- All tests passing (91 tests)

#### Updated Totals

| Category | Previous | New | Total |
|----------|----------|-----|-------|
| Static/Enterprise Skills | 27 | 8 | 35 |
| Workflows | 19 | 4 | 23 |

---

## 2025-12-13 (Update 2)

### Enterprise Skills and Workflows Added

Added 11 new enterprise-focused skills and 5 new workflows for large organization use cases.

#### New Enterprise Skills (5)

Located in `lib/skills/enterprise.ts`:

| Skill ID | Name | Category |
|----------|------|----------|
| `contract-review-accelerator` | Contract Review Accelerator | enterprise-legal |
| `budget-variance-narrator` | Budget Variance Narrator | enterprise-finance |
| `steering-committee-pack` | Steering Committee Pack Generator | enterprise-governance |
| `executive-communication-pack` | Executive Communication Pack | enterprise-hr |
| `automation-opportunity-assessment` | Automation Opportunity Assessment | enterprise-operations |

#### New Excel Skills (6)

Located in `lib/skills/excel.ts`:

| Skill ID | Name | Use Case |
|----------|------|----------|
| `excel-data-analyzer` | Excel Data Analyzer | Data analysis with insights |
| `excel-formula-builder` | Excel Formula Builder | Complex formula generation |
| `excel-chart-designer` | Excel Chart Designer | Visualization design |
| `excel-pivot-architect` | Excel Pivot Table Architect | Pivot table design |
| `excel-marketing-dashboard` | Excel Marketing Dashboard Builder | Marketing KPI dashboards |
| `excel-data-cleaner` | Excel Data Cleaner | Data quality and cleaning |

#### New Enterprise Workflows (5)

Located in `lib/workflows/enterprise.ts`:

1. **Financial Analysis Pack** (`financial-analysis-pack`)
   - Data analysis → Budget variance → Executive communication
   - Target: FP&A teams during close cycles

2. **Marketing Analytics Dashboard** (`marketing-analytics-dashboard`)
   - Data cleaning → Analysis → Dashboard design → Chart specifications
   - Target: Marketing teams building performance dashboards

3. **Program Governance Pack** (`program-governance-pack`)
   - Steering committee pack → Executive communications
   - Target: PMO teams managing enterprise programs

4. **Contract Review Workflow** (`contract-review-workflow`)
   - Contract analysis → Approval communication
   - Target: Legal and procurement teams

5. **Automation Discovery Workflow** (`automation-discovery-workflow`)
   - Metrics analysis → Automation assessment → Business case
   - Target: Digital transformation teams

#### Infrastructure Updates

- Added `SkillDefinition` type to `lib/storage/types.ts`
- Updated `lib/testing/registrySnapshot.ts` to include enterprise and Excel skills
- Updated `lib/workflows/index.ts` to export enterprise workflows

#### Updated Totals

| Category | Previous | New | Total |
|----------|----------|-----|-------|
| Static Skills | 16 | 11 | 27 |
| Workflows | 14 | 5 | 19 |

---

## 2025-12-13

### Test Fix: Dynamic Workflow Count

**Issue:** Workflow registry test in `tests/lib/workflows.test.ts` had a hardcoded assertion expecting exactly 3 workflows, but the codebase now contains 14 workflows.

**Root Cause:** The test at line 95 expected `WORKFLOW_LIST.length` to equal 3, which was valid when only the original 3 core workflows existed. After adding 11 new role-based workflows, the test failed.

**Fix:** Updated the test to be dynamic:
- Checks that `WORKFLOW_LIST.length` matches `Object.keys(WORKFLOWS).length`
- Ensures at least 3 workflows exist (preserving original intent)

**Files Changed:**
- `tests/lib/workflows.test.ts:92-99`

---

### Codebase Scan Results

**TODO/FIXME Search:** No blocking TODO or FIXME comments found in skills/workflows code.

**Compilation Check:** Build passes successfully (`npm run build`).

**Skill Registration Verification:**
| Check | Status |
|-------|--------|
| All workflow-referenced skills exist | Pass |
| All 16 static skills properly defined | Pass |
| All 57 role-based skills mapped correctly | Pass |
| No broken skill routes | Pass |
| No UI references to non-existent skills | Pass |

**Standalone Skills (not in workflows but intentional):**
- `day-in-the-life-generator`
- `healthcare-resume-parser`
- `linkedin-optimizer-pro`
- `offer-evaluation-pro`
- `role-ai-automation-analyzer`

These 5 skills are available through the library UI and can be used independently.

---

## Workflow Inventory (14 total)

### Core Workflows (3)
1. `job-application` - Complete job application workflow
2. `interview-prep` - Interview preparation workflow
3. `post-interview` - Post-interview follow-up workflow

### Role-Based Workflows (11)
4. `software-engineer-productivity` - Software Engineer productivity workflow
5. `trainer-content-development` - Trainer content development workflow
6. `seo-specialist-audit` - SEO audit workflow
7. `sales-representative-pipeline` - Sales pipeline workflow
8. `marketing-specialist-campaign` - Marketing campaign workflow
9. `entrepreneur-venture-launch` - Entrepreneur venture launch workflow
10. `financial-analyst-reporting` - Financial analysis workflow
11. `customer-success-manager-health-check` - Customer success workflow
12. `consultant-engagement` - Consultant engagement workflow
13. `business-analyst-requirements` - Business requirements workflow
14. `content-writer-creation` - Content creation workflow

---

## Skills Inventory

### Static Skills (16)
Located in `lib/skills/static.ts`

### Role-Based Skills (57)
Generated dynamically from role templates in `lib/roleTemplates.ts`

### Total: 73 skills

---

## Developer Test Playground (NEW)

### Added 2025-12-13

A comprehensive testing infrastructure for skills and workflows was added.

**Route:** `/dev/playground`

### Features

1. **Registry Snapshot** (`lib/testing/registrySnapshot.ts`)
   - Programmatic enumeration of all skills and workflows
   - Input schema extraction for test data generation
   - Categorization by source (static vs role-template)

2. **Test Case Generator** (`lib/testing/testCaseGenerator.ts`)
   - Auto-generates 3 test cases per skill/workflow:
     - Happy path (typical user scenario)
     - Edge case (sparse/complex inputs)
     - Variant (different industry/role)
   - Rubric-based evaluation criteria with weights

3. **AI-Powered Grading** (`lib/testing/grader.ts`)
   - Uses AI as judge to score outputs (1-5 scale per criterion)
   - Produces weighted overall scores (0-100)
   - Identifies strengths and improvement areas

4. **Evaluation Storage** (`lib/testing/evalStorage.ts`)
   - IndexedDB-based storage for eval records
   - Test suite persistence
   - Prompt version tracking
   - Statistics and trend analysis

5. **Automated Test Runner** (`lib/testing/testRunner.ts`)
   - Batch execution of skill tests
   - Structural validation without AI calls
   - Progress tracking and reporting
   - Markdown report generation

6. **Prompt Optimization** (`lib/testing/promptOptimizer.ts`)
   - Analyzes eval records for systematic issues
   - Identifies weak criteria across test types
   - AI-assisted prompt improvement proposals
   - Safety validation for proposed changes
   - Version tracking for prompt changes

### Developer Playground UI

**Page:** `pages/DevPlaygroundPage.tsx`

Features:
- Skill/workflow selection with search
- Dynamic form generation from input schemas
- Test case loading (happy path, edge, variant)
- Skill execution with output display
- AI grading with detailed criterion breakdowns
- Evaluation history with trends

### Safety Constraints

- Prompt optimizer validates changes don't remove safety keywords
- Rubrics focus on structure, clarity, relevance, actionability
- Never modifies guardrails for legal/medical/financial advice

### Files Created

```
lib/testing/
├── index.ts           # Module exports
├── registrySnapshot.ts # Skill/workflow schema extraction
├── testCaseGenerator.ts # Auto test case generation
├── grader.ts          # AI grading system
├── evalStorage.ts     # IndexedDB storage
├── testRunner.ts      # Automated test execution
├── promptOptimizer.ts # Prompt improvement system
└── apiHelper.ts       # Non-streaming API wrapper

pages/
└── DevPlaygroundPage.tsx # Developer playground UI
```
