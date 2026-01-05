# Change Request Document Builder

## Metadata
- **ID**: change-request-doc-builder
- **Category**: AI Governance
- **Time Saved**: Not specified
- **Recommended Model**: Any

## Description
Generate CAB-ready change request documents with implementation plans, risk assessments, and rollback procedures.

Create professional change request documents that satisfy Change Advisory Board (CAB) requirements. Includes implementation steps, risk assessment, testing evidence, rollback plans, and stakeholder communication. Follows ITIL best practices.

## What You Get
- CAB-Ready Change Request
- Implementation Plan
- Risk Assessment Matrix
- Rollback Procedure
- Communication Plan

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| changeSummary | textarea | Yes | Describe the change being requested |
| changeType | select | Yes | Change Type: Standard (pre-approved), Normal (requires CAB approval), Emergency (expedited approval), Major (significant impact) |
| systemsAffected | textarea | Yes | List all systems, applications, and infrastructure affected |
| implementationSteps | textarea | Yes | Detailed steps for implementing the change |
| testingEvidence | textarea | Yes | What testing has been completed? Results? |
| rollbackPlan | textarea | Yes | How will you roll back if the change fails? |
| scheduledWindow | text | Yes | e.g., "Saturday 2:00 AM - 4:00 AM EST" |
| riskAssessment | textarea | No | Identify potential risks and mitigations |

## System Instruction
The system instruction for this skill is a comprehensive guide (3,365 lines) that includes:

- **Role**: Senior IT Change Manager and ITIL Expert specializing in enterprise change control
- **Expertise**: 15+ years in IT service management and change control, ITIL 4 Expert certification, experience with CAB processes at Fortune 500 companies
- **Key Frameworks**:
  - Change Type Framework (Standard, Normal, Emergency, Major with approval processes)
  - Risk-Based Categorization (Low to Critical with approval requirements)
  - Risk Scoring Matrix (Likelihood × Impact = Overall Risk Rating)
  - Common Risk Categories (Technical, Operational, Data, Security, Integration, Resource)
  - ITIL Best Practices (Complete change lifecycle management)
- **Output Structure**: Creates comprehensive change requests with document control, change overview, business justification, technical descriptions, impact assessments, risk matrices, detailed implementation plans with pre/post verification, testing summaries, rollback procedures, communication plans with templates, and approval signatures

The instruction emphasizes clear, professional documentation that is accessible to non-technical CAB members while being thorough but concise, and risk-aware but not alarmist.

## User Prompt Template
```
Based on the user's request, please now perform the Change Request analysis.

**Change Summary:**
```
{changeSummary}
```

**Change Type:**
```
{changeType}
```

**Systems Affected:**
```
{systemsAffected}
```

**Implementation Steps:**
```
{implementationSteps}
```

**Testing Evidence:**
```
{testingEvidence}
```

**Rollback Plan:**
```
{rollbackPlan}
```

**Scheduled Window:**
```
{scheduledWindow}
```

**Risk Assessment:**
```
{riskAssessment}
```
```
