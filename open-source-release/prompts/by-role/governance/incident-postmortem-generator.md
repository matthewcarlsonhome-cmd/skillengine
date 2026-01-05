# Incident Postmortem Generator

## Metadata
- **ID**: incident-postmortem-generator
- **Category**: AI Governance
- **Time Saved**: Not specified
- **Recommended Model**: Any

## Description
Create comprehensive, blameless incident postmortem documents with root cause analysis and actionable improvements.

Generate professional incident postmortem reports that follow best practices from Google, Netflix, and other industry leaders. Emphasizes blameless culture, systematic root cause analysis, and actionable improvements. Perfect for IT operations, security incidents, and service outages.

## What You Get
- Blameless Postmortem Document
- Root Cause Analysis
- Action Items with Owners
- Timeline Visualization
- Communication Templates

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| incidentTitle | text | Yes | e.g., "Production Database Outage - Order Processing System" |
| severity | select | Yes | Severity Level: SEV1 - Critical (major outage, data loss), SEV2 - Major (significant impact, degraded service), SEV3 - Minor (limited impact, workaround available), SEV4 - Low (minimal impact, cosmetic issues) |
| incidentTimeline | textarea | Yes | Chronological events with timestamps |
| impactDescription | textarea | Yes | Business impact, customers affected, revenue implications |
| rootCauseAnalysis | textarea | Yes | What caused the incident? Apply 5 Whys |
| responseActions | textarea | Yes | What did the team do to resolve it? |
| contributingFactors | textarea | No | Other factors that contributed to the incident |
| lessonsLearned | textarea | No | What did the team learn? |

## System Instruction
The system instruction for this skill is a comprehensive guide (2,945 lines) that includes:

- **Role**: Senior Site Reliability Engineer and Incident Management Expert specializing in blameless postmortems
- **Expertise**: 12+ years in SRE, DevOps, and incident management, trained by Google SRE practices, Netflix chaos engineering
- **Key Frameworks**:
  - Blameless Culture Framework (Systems-focused language, never blame individuals)
  - Severity Classification (SEV1-SEV4 with response requirements)
  - The 5 Whys Technique (Systematic root cause analysis)
  - Contributing Factor Categories (Process, Technology, People/Training, Communication, Environment)
  - Detection & Response Analysis (6-phase incident response review)
- **Output Structure**: Creates comprehensive postmortems with executive summaries, key metrics, detailed timelines, impact assessments, 5 Whys root cause analysis, "what went well/wrong" sections, prioritized action items (P1/P2/P3), lessons learned, and communication templates

The instruction emphasizes factual, objective language that is systems-focused (never blames individuals), with action-oriented recommendations and balanced honesty with constructive framing.

## User Prompt Template
```
Based on the user's request, please now perform the Incident Postmortem analysis.

**Incident Title:**
```
{incidentTitle}
```

**Severity:**
```
{severity}
```

**Timeline:**
```
{incidentTimeline}
```

**Impact:**
```
{impactDescription}
```

**Root Cause Analysis:**
```
{rootCauseAnalysis}
```

**Response Actions:**
```
{responseActions}
```

**Contributing Factors:**
```
{contributingFactors}
```

**Lessons Learned:**
```
{lessonsLearned}
```
```
