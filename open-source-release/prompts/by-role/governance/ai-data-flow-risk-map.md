# AI Data Flow Risk Mapper

## Metadata
- **ID**: ai-data-flow-risk-map
- **Category**: AI Governance
- **Time Saved**: Not specified
- **Recommended Model**: Any

## Description
Map how your data flows through AI systems and identify security risks, control gaps, and compliance concerns.

This skill creates a comprehensive view of AI touchpoints in your data ecosystem. It identifies where sensitive data meets AI systems, highlights risk points, and recommends mitigations. Essential for security architects, DPOs, and compliance teams preparing for audits or AI expansion.

## What You Get
- Data Flow Overview
- Risk Point Inventory
- Third-Party AI Risk Summary
- Control Gap Analysis
- Mitigation Recommendations

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| keySystemsInventory | textarea | Yes | List major systems: CRM, ERP, data warehouse, document management |
| dataTypesProcessed | textarea | Yes | Customer PII, financial data, healthcare data, IP, etc. |
| aiIntegrations | textarea | Yes | How is AI integrated with your systems? |
| dataResidencyRequirements | textarea | No | Geographic restrictions on data (EU data stays in EU, etc.) |
| currentSecurityControls | textarea | No | SSO/MFA, DLP, encryption, network segmentation |
| plannedAIExpansions | textarea | No | Upcoming AI initiatives to assess |

## System Instruction
The system instruction for this skill is a comprehensive guide (1,340 lines) that includes:

- **Role**: Senior Security Architect specializing in AI systems, data protection, and enterprise risk management
- **Expertise**: 15+ years in enterprise security architecture, CISSP, CISM, and cloud security certifications
- **Key Frameworks**:
  - Data Flow Analysis Framework (5-phase methodology)
  - Risk Assessment Framework (7 AI-specific risk categories)
  - Third-Party AI Vendor Assessment (contractual requirements: DPA, BAA, SCC)
  - Control Framework (Technical and Process Controls)
  - Risk Scoring Methodology (0-10 scale)
- **Output Structure**: Creates detailed AI Data Flow Risk Maps with system inventories, integration points, risk heat maps, vendor assessments, control gap analysis, and mitigation recommendations

The instruction emphasizes technical precision with executive accessibility, actionable recommendations, and clear visual representations of data flows and risk points.

## User Prompt Template
```
Based on the user's request, please now perform the AI Data Flow Risk Map analysis.

**Key Systems Inventory:**
```
{keySystemsInventory}
```

**Data Types Processed:**
```
{dataTypesProcessed}
```

**Current AI Integrations:**
```
{aiIntegrations}
```

**Data Residency Requirements:**
```
{dataResidencyRequirements}
```

**Current Security Controls:**
```
{currentSecurityControls}
```

**Planned AI Expansions:**
```
{plannedAIExpansions}
```
```
