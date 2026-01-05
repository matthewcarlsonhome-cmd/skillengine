# Policy Document Generator

## Metadata
- **ID**: policy-document-generator
- **Category**: AI Governance
- **Time Saved**: Not specified
- **Recommended Model**: Any

## Description
Generate comprehensive, professionally-structured policy documents for information security, data privacy, and compliance.

Create enterprise-grade policy documents that meet compliance requirements and are ready for legal review. Includes policy purpose, scope, definitions, procedures, roles, enforcement, and review cycles. Supports various policy types including Information Security, Data Privacy, Acceptable Use, and more.

## What You Get
- Complete Policy Document
- Implementation Checklist
- Training Requirements
- Review Schedule

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policyType | select | Yes | Policy Type: Information Security Policy, Data Privacy Policy, Acceptable Use Policy, Data Retention Policy, Incident Response Policy, Access Control Policy, Vendor Management Policy, Business Continuity Policy, Change Management Policy |
| organizationContext | textarea | Yes | Describe your organization (size, industry, data handled...) |
| regulatoryRequirements | textarea | Yes | GDPR, HIPAA, SOC2, PCI-DSS, etc. |
| existingPractices | textarea | Yes | What practices are already in place? |
| approvalAuthority | text | Yes | e.g., CISO, Compliance Officer, Board |
| reviewCycle | select | Yes | Review Cycle: Annual, Semi-annual, Quarterly, As needed |
| audienceScope | select | Yes | Audience Scope: All Employees, IT Staff Only, Management, Specific Departments, Contractors Included |

## System Instruction
The system instruction for this skill is a comprehensive guide (2,540 lines) that includes:

- **Role**: Senior Policy Documentation Specialist with expertise in enterprise governance and compliance
- **Expertise**: 15+ years in corporate policy development, CGEIT, CRISC, CIPP certifications, former GRC consultant
- **Key Frameworks**:
  - The C.L.E.A.R. Framework (Complete, Legal, Enforceable, Accessible, Realistic)
  - Policy Language Standards (must/shall for requirements, should for recommendations)
  - Policy Type Frameworks (detailed templates for 9 policy types)
  - Document Structure (Purpose, Scope, Definitions, Policy Statements, Procedures, Compliance, Enforcement, Exceptions, References)
- **Output Structure**: Creates complete formal policy documents with document control sections, clear policy statements with rationale, specific procedures, roles and responsibilities, compliance monitoring, enforcement mechanisms, exception processes, implementation checklists, training requirements, and acknowledgment forms

The instruction emphasizes formal policy language that is precise, unambiguous, action-oriented, and uses consistent terminology throughout.

## User Prompt Template
```
Based on the user's request, please now perform the Policy Document Generator analysis.

**Policy Type:**
```
{policyType}
```

**Organization Context:**
```
{organizationContext}
```

**Regulatory Requirements:**
```
{regulatoryRequirements}
```

**Existing Practices:**
```
{existingPractices}
```

**Approval Authority:**
```
{approvalAuthority}
```

**Review Cycle:**
```
{reviewCycle}
```

**Audience Scope:**
```
{audienceScope}
```
```
