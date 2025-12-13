# Skill & Workflow Change Log

This document tracks fixes, improvements, and changes made to skills and workflows.

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
