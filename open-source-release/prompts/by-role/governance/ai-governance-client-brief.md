# AI Governance Client Brief Generator

## Metadata
- **ID**: ai-governance-client-brief
- **Category**: AI Governance
- **Time Saved**: Not specified
- **Recommended Model**: Any

## Description
Create professional materials to address client concerns about AI governance, data handling, and security in your products or services.

When selling to or advising enterprise clients, AI governance questions are now standard. This skill generates client-ready materials including executive briefs, FAQ documents, talking points, and technical summaries that address concerns without creating fear. Perfect for sales engineers, consultants, and customer success teams.

## What You Get
- Executive Summary Brief
- Data Handling Explainer
- Security Controls Summary
- FAQ Document
- Talking Points

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| clientIndustry | select | Yes | Client Industry: Financial Services, Healthcare, Government/Public Sector, Technology, Manufacturing, Retail/E-commerce, Professional Services, Education, Other |
| clientRiskPosture | select | Yes | Client Risk Posture: Very Conservative (extensive due diligence), Conservative (thorough review required), Moderate (standard security review), Progressive (early AI adopters) |
| mainObjections | textarea | Yes | What concerns has the client raised about AI? |
| yourAICapabilities | textarea | Yes | How does your product/service use AI? |
| dataHandlingPractices | textarea | Yes | How do you handle client data with AI? |
| complianceCertifications | textarea | No | SOC2, GDPR, HIPAA, ISO 27001, etc. |

## System Instruction
The system instruction for this skill is a comprehensive guide (1,720 lines) that includes:

- **Role**: Senior AI Governance Communications Specialist helping organizations address enterprise client concerns
- **Expertise**: 12+ years in enterprise B2B sales and customer success, deep expertise in security, compliance, and procurement processes
- **Key Frameworks**:
  - Client Psychology Framework (Understanding underlying fears)
  - Risk Posture Calibration (Tone and detail level by client type)
  - Industry-Specific Sensitivities (Financial Services, Healthcare, Government, etc.)
  - The A.C.E. Method (Acknowledge, Clarify, Evidence)
  - Objection Handling Scripts
- **Output Structure**: Creates comprehensive client briefs with executive summaries, data handling explainers, security controls summaries, compliance alignment matrices, FAQs by stakeholder type, talking points, and objection handling scripts

The instruction emphasizes being confident but not dismissive, transparent about limitations, evidence-based and specific, while addressing concerns without creating fear.

## User Prompt Template
```
Based on the user's request, please now perform the AI Governance Client Brief analysis.

**Client Industry:**
```
{clientIndustry}
```

**Client Risk Posture:**
```
{clientRiskPosture}
```

**Main Objections/Concerns:**
```
{mainObjections}
```

**Your AI Capabilities:**
```
{yourAICapabilities}
```

**Data Handling Practices:**
```
{dataHandlingPractices}
```

**Compliance Certifications:**
```
{complianceCertifications}
```
```
