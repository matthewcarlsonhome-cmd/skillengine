# Secure AI Usage Playbook Builder

## Metadata
- **ID**: secure-ai-usage-playbook
- **Category**: AI Governance
- **Time Saved**: Not specified
- **Recommended Model**: Any

## Description
Generate comprehensive AI usage guidelines and policies tailored to your organization's approved tools and risk tolerance.

Create practical, employee-ready guidelines for using AI tools safely. This skill generates acceptable use policies, data handling rules, decision trees for appropriate AI use, and training outlines. Output is ready for HR/Legal review and employee distribution.

## What You Get
- Acceptable Use Guidelines
- Data Classification Quick Reference
- Decision Tree for AI Use
- Employee Acknowledgment Template
- Training Outline

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| approvedAITools | textarea | Yes | List the AI tools approved for use (e.g., ChatGPT Enterprise, GitHub Copilot) |
| commonUseCases | textarea | Yes | What do employees typically use AI for? |
| prohibitedActivities | textarea | Yes | What should employees NEVER do with AI? |
| dataHandlingRules | textarea | Yes | What data restrictions apply to AI usage? |
| regulatoryContext | textarea | No | Any specific regulations affecting AI usage? |
| audienceLevel | select | Yes | Target Audience: All Employees, Technical Staff Only, Management Only, Specific Departments, Contractors/Vendors |

## System Instruction
The system instruction for this skill is a comprehensive guide (920 lines) that includes:

- **Role**: Senior AI Policy Architect specializing in enterprise AI governance and workforce enablement
- **Expertise**: 12+ years in corporate policy development, expert in translating technical requirements into accessible guidelines
- **Key Frameworks**:
  - Policy Design Principles (Enablement-Safety Balance)
  - Data Classification Framework (Public, Internal, Confidential, Restricted)
  - Use Case Decision Framework (Decision tree for appropriate AI use)
  - Tool-Specific Guidelines Template
  - Disclosure and Attribution Standards
- **Output Structure**: Creates a complete AI Usage Playbook with quick reference cards, acceptable use guidelines, tool-specific rules, data classification tables, decision trees, and employee acknowledgment forms

The instruction emphasizes creating policies that are specific, actionable, realistic, enforceable, and understandable (8th-grade reading level target), while balancing productivity enablement with risk management.

## User Prompt Template
```
Based on the user's request, please now perform the Secure AI Usage Playbook analysis.

**Approved AI Tools:**
```
{approvedAITools}
```

**Common Use Cases:**
```
{commonUseCases}
```

**Prohibited Activities:**
```
{prohibitedActivities}
```

**Data Handling Rules:**
```
{dataHandlingRules}
```

**Regulatory Context:**
```
{regulatoryContext}
```

**Target Audience:**
```
{audienceLevel}
```
```
