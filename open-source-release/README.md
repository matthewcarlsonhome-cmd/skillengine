# AI Prompt Library

**124 production-ready AI prompts for professionals across every role.**

Free. Open source. No strings attached.

---

## What's Inside

| Category | Prompts | Use Cases |
|----------|---------|-----------|
| **Job Seeker** | 16 | Resume optimization, interview prep, salary negotiation, LinkedIn |
| **Marketing** | 8 | Campaign strategy, brand positioning, GTM, content planning |
| **Digital Marketing** | 8 | SEO, paid media, social strategy, email marketing |
| **AI Governance** | 8 | Compliance, risk assessment, policy generation, audits |
| **Executive** | 4 | C-suite communication, steering committees, contract review |
| **Extended Professional** | 20 | Decision memos, retrospectives, board presentations, crisis comms |
| **Sales** | 4 | Call prep, proposals, battle cards, customer health |
| **Product** | 4 | PRDs, market sizing, competitive analysis, OKRs |
| **Technical** | 4 | Tech specs, postmortems, code review, security |
| **HR** | 4 | Job descriptions, performance reviews, onboarding, exit interviews |
| **Operations** | 4 | SOPs, vendor management, meeting minutes, policy analysis |
| **Excel/Analytics** | 5 | Data analysis, cleaning, dashboards, visualization |
| **Project Management** | 7 | Status reports, risk management, stakeholder comms |
| **Business Analysis** | 7 | Requirements, process mapping, feasibility studies |
| **Prompt Engineering** | 11 | Meta-prompts for building better prompts |
| **Claude Skills** | 10 | Specialized Claude Code integrations |

**Total: 124 prompts**

---

## Quick Start

### Using with ChatGPT, Claude, or Gemini

1. Navigate to the category folder for your role
2. Open the prompt markdown file
3. Copy the **System Instruction** into your AI's system prompt (if available)
4. Copy the **User Prompt Template** and fill in the `{{placeholders}}`
5. Run it

### Example

```markdown
# From: prompts/marketing/campaign-strategy-builder.md

## System Instruction
You are a Chief Marketing Officer and Campaign Strategist with 20+ years...

## User Prompt
Create a comprehensive campaign strategy for:
**Campaign Goal:** Lead Generation
**Target Audience:** B2B SaaS decision makers, 25-45, VP+ titles...
```

---

## Directory Structure

```
prompts/
├── by-role/
│   ├── job-seeker/
│   ├── marketing/
│   ├── sales/
│   ├── product/
│   ├── technical/
│   ├── hr/
│   ├── operations/
│   ├── executive/
│   └── governance/
│
├── by-use-case/
│   ├── content-generation/
│   ├── analysis/
│   ├── optimization/
│   ├── communication/
│   └── automation/
│
└── by-level/
    ├── individual-contributor/
    ├── manager/
    ├── director/
    └── executive/
```

---

## Prompt Anatomy

Each prompt includes:

### 1. Metadata
- **Name**: Descriptive title
- **Description**: One-line summary
- **Category**: Functional classification
- **Estimated Time Saved**: ROI indicator
- **Recommended Model**: Best AI to use

### 2. System Instruction
Expert persona with 10-20+ years of experience. Includes:
- Professional background and credentials
- Frameworks and methodologies to apply
- Output structure and requirements
- Quality standards

### 3. Inputs
Structured form fields with:
- Labels and placeholders
- Validation rules
- Options (for dropdowns)

### 4. User Prompt Template
Ready-to-use template with `{{placeholders}}` for your inputs.

### 5. Output Format
Expected deliverable structure (markdown, tables, JSON, etc.)

---

## Featured Prompts

### For Job Seekers
| Prompt | What It Does |
|--------|--------------|
| **Resume Customizer** | Tailors your resume to specific job descriptions, optimizing for ATS |
| **Interview Prep Pro** | Generates company-specific questions and STAR-format answers |
| **Salary Negotiation Master** | Creates data-backed negotiation scripts with anchoring strategies |
| **LinkedIn Optimizer** | Rewrites your profile for recruiter visibility and keyword optimization |

### For Marketing
| Prompt | What It Does |
|--------|--------------|
| **Campaign Strategy Builder** | Full campaign strategy using SOSTAC & RACE frameworks |
| **Brand Positioning Framework** | Competitive positioning, messaging architecture, brand voice |
| **Go-to-Market Strategy** | Complete GTM with TAM/SAM/SOM, channel strategy, launch plan |
| **Content Strategy Planner** | Editorial calendar, content pillars, SEO integration |

### For Executives
| Prompt | What It Does |
|--------|--------------|
| **Executive Decision Memo** | One-page decision documents for C-suite |
| **Board Presentation Builder** | Investor-ready board deck narratives |
| **Crisis Communication Playbook** | Multi-stakeholder crisis response plans |
| **Steering Committee Pack** | Executive briefing materials with recommendations |

---

## Frameworks Used

These prompts leverage industry-standard frameworks:

- **SOSTAC** - Marketing planning
- **RACE** - Digital marketing
- **Porter's Five Forces** - Competitive analysis
- **SWOT** - Strategic assessment
- **Jobs-to-be-Done** - Customer research
- **STAR** - Interview responses
- **OKRs** - Goal setting
- **RACI** - Responsibility assignment
- **SMART** - Goal definition
- **70-20-10** - Budget allocation

---

## Contributing

We welcome contributions! To add a prompt:

1. Fork this repository
2. Create a new markdown file in the appropriate category
3. Follow the prompt template structure
4. Submit a pull request

### Prompt Template

```markdown
# [Prompt Name]

## Metadata
- **Category**: [generation/analysis/optimization/communication/automation]
- **Role**: [Job Seeker/Marketing/Sales/etc.]
- **Level**: [IC/Manager/Director/Executive]
- **Time Saved**: [X-Y hours]
- **Recommended Model**: [claude/gemini/gpt-4/any]

## Description
[One paragraph describing what this prompt does and who it's for]

## System Instruction
[Full system prompt with expert persona, frameworks, and output requirements]

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field_name | text/textarea/select | Yes/No | Description |

## User Prompt Template
[Template with {{placeholders}}]

## Example Output
[Optional: sample output to show expected quality]
```

---

## License

MIT License - Use freely, modify freely, share freely.

See [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with love by the SkillEngine team.

These prompts represent hundreds of hours of iteration, testing, and refinement. We hope they help you work smarter.

---

## Support

- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions
- **Twitter/X**: [@skillengine](https://twitter.com/skillengine)

---

*If these prompts help you land a job, close a deal, or ship faster—that's the win.*
