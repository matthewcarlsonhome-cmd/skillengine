# Compliance Audit Prep Assistant

## Metadata
- **ID**: compliance-audit-prep-assistant
- **Category**: AI Governance
- **Time Saved**: Not specified
- **Recommended Model**: Any

## Description
Prepare for compliance audits by analyzing your current state, identifying gaps, and generating evidence checklists.

This skill helps organizations prepare for SOC2, ISO 27001, HIPAA, PCI-DSS, and other compliance audits. It analyzes your current controls against requirements, identifies gaps, and creates actionable preparation materials including evidence checklists and interview guides.

## What You Get
- Audit Readiness Score
- Gap Analysis Report
- Evidence Checklist
- Interview Preparation Guide
- Remediation Priorities

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| auditType | select | Yes | Audit Type: SOC2 Type II, SOC2 Type I, ISO 27001, HIPAA, PCI-DSS, GDPR Assessment, Internal Audit, Custom Framework |
| auditScope | textarea | Yes | What is included in the audit scope? |
| auditTimeline | text | Yes | e.g., "Audit fieldwork begins in 8 weeks" |
| controlFramework | textarea | Yes | What controls or criteria apply? |
| availableEvidence | textarea | Yes | What documentation and evidence do you have? |
| knownGaps | textarea | No | What gaps are you already aware of? |
| previousFindings | textarea | No | What did previous audits find? |

## System Instruction
The system instruction for this skill is a comprehensive guide (2,130 lines) that includes:

- **Role**: Senior Compliance & Audit Readiness Consultant specializing in enterprise compliance frameworks
- **Expertise**: 15+ years in compliance, audit, and risk management, CISA, CISSP, CRISC certifications, former Big 4 external auditor
- **Key Frameworks**:
  - Audit Type Frameworks (SOC2, ISO 27001, HIPAA, PCI-DSS with detailed mappings)
  - Gap Analysis Methodology (Severity classification: Critical, High, Medium, Low)
  - Evidence Requirements (Quality criteria, common evidence types)
  - Interview Preparation (Coaching framework, common questions by role)
  - Remediation Complexity (Quick Fix to Major changes with effort estimates)
- **Output Structure**: Creates comprehensive audit preparation guides with readiness scores, timeline assessments, control gap analysis, evidence checklists, interview preparation guides, remediation priorities, and audit day checklists

The instruction emphasizes practical, action-oriented guidance that is risk-aware but solution-focused, with specific requirements and realistic timelines.

## User Prompt Template
```
Based on the user's request, please now perform the Compliance Audit Prep analysis.

**Audit Type:**
```
{auditType}
```

**Audit Scope:**
```
{auditScope}
```

**Audit Timeline:**
```
{auditTimeline}
```

**Control Framework:**
```
{controlFramework}
```

**Available Evidence:**
```
{availableEvidence}
```

**Known Gaps:**
```
{knownGaps}
```

**Previous Findings:**
```
{previousFindings}
```
```
