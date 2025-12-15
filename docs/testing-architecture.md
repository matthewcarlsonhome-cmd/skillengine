# Testing & Test-Data Architecture

> Comprehensive guide to testing infrastructure in SkillEngine

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Testing Strategy](#testing-strategy)
4. [Data Fixtures](#data-fixtures)
5. [Test Data Flow](#test-data-flow)
6. [LLM Interaction Testing](#llm-interaction-testing)
7. [Developer Experience](#developer-experience)
8. [CI/CD Integration](#cicd-integration)
9. [Validation Checklist](#validation-checklist)

---

## Quick Start

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Interactive UI mode
npm run test:ui

# With coverage report
npm run test:coverage
```

### Loading Test Data in UI

1. Navigate to any skill or workflow page
2. Look for the amber **"Test data available"** banner
3. Click **"Load Test Data"** to populate all fields
4. Click **"Execute"** to run with test inputs

### Adding New Test Data

```typescript
// lib/testing/defaultTestData.ts

'your-skill-id': {
  skillId: 'your-skill-id',
  defaultTestCaseId: 'your-skill-default-001',
  description: 'Brief scenario description',
  inputPayload: {
    fieldId1: 'value1',
    fieldId2: 'value2',
  },
},
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TESTING ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    │
│   │   Unit Tests     │    │  Integration     │    │  UI Components   │    │
│   │   (Vitest)       │    │  Tests           │    │  (Testing Lib)   │    │
│   └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘    │
│            │                       │                       │               │
│            └───────────────────────┼───────────────────────┘               │
│                                    │                                       │
│                          ┌─────────▼─────────┐                            │
│                          │   Test Setup      │                            │
│                          │  (tests/setup.ts) │                            │
│                          └─────────┬─────────┘                            │
│                                    │                                       │
│   ┌────────────────────────────────┼────────────────────────────────┐     │
│   │                    TESTING LIBRARY                               │     │
│   │                   (lib/testing/)                                 │     │
│   │                                                                  │     │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │     │
│   │  │ defaultTest │  │ testCase    │  │ grader.ts   │             │     │
│   │  │ Data.ts     │  │ Generator   │  │ AI grading  │             │     │
│   │  └─────────────┘  └─────────────┘  └─────────────┘             │     │
│   │                                                                  │     │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │     │
│   │  │ evalStorage │  │ testRunner  │  │ apiHelper   │             │     │
│   │  │ IndexedDB   │  │ Batch exec  │  │ Gemini API  │             │     │
│   │  └─────────────┘  └─────────────┘  └─────────────┘             │     │
│   └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │                    TEST DATA FIXTURES                               │   │
│   │                   (testdata/skills/)                                │   │
│   │                                                                     │   │
│   │  ├── ai-data-flow-risk-map.json                                    │   │
│   │  ├── ai-governance-readiness-assessment.json                       │   │
│   │  ├── compliance-audit-prep-assistant.json                          │   │
│   │  ├── incident-postmortem-generator.json                            │   │
│   │  └── ... (8 total fixture files)                                   │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
skillengine/
├── tests/
│   ├── setup.ts                    # Global test setup, mocks
│   └── lib/
│       ├── admin.test.ts           # Admin functionality tests
│       ├── apiKeyStorage.test.ts   # API key management tests
│       └── workflows.test.ts       # Workflow structure tests
│
├── lib/testing/
│   ├── index.ts                    # Public API exports
│   ├── defaultTestData.ts          # Curated test data for skills
│   ├── testCaseGenerator.ts        # Auto-generate test suites
│   ├── grader.ts                   # AI-powered output grading
│   ├── evalStorage.ts              # IndexedDB for eval records
│   ├── testRunner.ts               # Batch test execution
│   ├── promptOptimizer.ts          # Prompt optimization tools
│   ├── registrySnapshot.ts         # Schema extraction
│   └── apiHelper.ts                # Gemini API wrapper
│
├── testdata/
│   └── skills/
│       └── *.json                  # Extended test fixtures
│
├── components/
│   └── TestOutputButton.tsx        # TestDataBanner, TestOutputButton
│
└── vitest.config.ts                # Vitest configuration
```

---

## Testing Strategy

### Test Pyramid

```
                    ┌─────────────┐
                   /    E2E       \         (Not yet implemented)
                  /   (Planned)    \
                 ┌─────────────────┐
                /   Integration     \       tests/lib/*.test.ts
               /    (Workflows)      \      ~30 tests
              ┌───────────────────────┐
             /        Unit Tests       \    tests/lib/*.test.ts
            /     (Functions, Utils)    \   ~70+ tests
           └─────────────────────────────┘
```

### Unit Tests (100+ cases)

**Location:** `tests/lib/*.test.ts`

| File | Coverage Area | Test Count |
|------|---------------|------------|
| `admin.test.ts` | Admin emails, roles, feature gating, exports | ~50 |
| `apiKeyStorage.test.ts` | API key storage, obfuscation, retrieval | ~20 |
| `workflows.test.ts` | Workflow structure, mappings, validation | ~30 |

**Example Unit Test:**

```typescript
// tests/lib/workflows.test.ts
import { describe, it, expect } from 'vitest';
import { JOB_APPLICATION_WORKFLOW } from '../../lib/workflows';

describe('Job Application Workflow', () => {
  it('has valid structure', () => {
    expect(workflow.id).toBe('job-application');
    expect(workflow.steps).toHaveLength(5);
  });

  it('all steps reference valid skills', () => {
    for (const step of workflow.steps) {
      expect(step.skillId in SKILLS).toBe(true);
    }
  });

  it('has valid input mappings', () => {
    expect(() => validateInputMappings(workflow)).not.toThrow();
  });
});
```

### Integration Tests

Test workflows end-to-end structure validation:
- Input/output mappings between steps
- Skill reference validity
- Cross-workflow consistency

### E2E Tests (Planned)

Not yet configured. Future implementation will use Playwright or Cypress.

---

## Data Fixtures

### Fixture Types

#### 1. Default Test Data (Curated)

**Location:** `lib/testing/defaultTestData.ts`

Hand-crafted test scenarios for skills and workflows. Used by:
- `TestDataBanner` component in UI
- Developer Playground
- Automated test generation

```typescript
// Structure
interface SkillDefaultTestData {
  skillId: string;                      // Must match skill.id
  defaultTestCaseId: string;            // Unique identifier
  description: string;                  // Human-readable scenario
  inputPayload: Record<string, string>; // Field values
}
```

#### 2. Extended Test Suites (JSON)

**Location:** `testdata/skills/*.json`

Comprehensive test suites with multiple scenarios:

```json
{
  "skillId": "incident-postmortem-generator",
  "skillName": "Incident Postmortem Generator",
  "generatedAt": "2025-12-13T00:00:00.000Z",
  "tests": [
    {
      "id": "postmortem-happy-1",
      "type": "happy-path",
      "description": "Production database outage",
      "inputPayload": { ... },
      "rubric": {
        "criteria": [
          {"id": "executive-summary", "weight": 15},
          {"id": "timeline-clarity", "weight": 15},
          {"id": "root-cause-depth", "weight": 25}
        ]
      }
    },
    {
      "id": "postmortem-edge-1",
      "type": "edge-case",
      "description": "Security incident with data exposure",
      "inputPayload": { ... },
      "rubric": { ... }
    }
  ]
}
```

### Test Case Types

| Type | Purpose | Generation |
|------|---------|------------|
| `happy-path` | Standard successful scenario | Manual or auto |
| `edge-case` | Boundary conditions, unusual inputs | Auto-generated |
| `variant` | Alternative valid scenarios | Auto-generated |

### Shared Test Templates

Common data reused across fixtures:

```typescript
// lib/testing/defaultTestData.ts

const SAMPLE_RESUME = `...`;           // Standard resume format
const SAMPLE_JOB_DESCRIPTION = `...`;  // Typical job posting
const SAMPLE_LINKEDIN_PROFILE = `...`; // LinkedIn profile text
const SAMPLE_COMPANY_INFO = `...`;     // Company research context
```

---

## Test Data Flow

### UI Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         TEST DATA LIFECYCLE                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  1. USER VISITS SKILL/WORKFLOW PAGE                                        │
│     │                                                                      │
│     ▼                                                                      │
│  ┌──────────────────────────────────────────────────────┐                 │
│  │ TestDataBanner Component                              │                 │
│  │ ┌──────────────────────────────────────────────────┐ │                 │
│  │ │ hasSkillDefaultTestData(skillId) ? show : hide   │ │                 │
│  │ └──────────────────────────────────────────────────┘ │                 │
│  └────────────────────────┬─────────────────────────────┘                 │
│                           │                                                │
│  2. USER CLICKS "LOAD TEST DATA"                                          │
│     │                                                                      │
│     ▼                                                                      │
│  ┌──────────────────────────────────────────────────────┐                 │
│  │ getSkillDefaultTestData(skillId)                      │                 │
│  │ Returns: { skillId, description, inputPayload }       │                 │
│  └────────────────────────┬─────────────────────────────┘                 │
│                           │                                                │
│  3. FORM FIELDS POPULATED                                                 │
│     │                                                                      │
│     ▼                                                                      │
│  ┌──────────────────────────────────────────────────────┐                 │
│  │ onLoadTestData(inputPayload)                          │                 │
│  │ setFormState({ ...formState, ...inputPayload })       │                 │
│  └────────────────────────┬─────────────────────────────┘                 │
│                           │                                                │
│  4. USER EXECUTES (OPTIONAL)                                              │
│     │                                                                      │
│     ▼                                                                      │
│  ┌──────────────────────────────────────────────────────┐                 │
│  │ Skill generates prompt → Gemini API → Streaming output│                 │
│  └──────────────────────────────────────────────────────┘                 │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Integration

#### SkillRunnerPage.tsx

```tsx
import { TestDataBanner } from '../components/TestOutputButton';

const SkillRunnerPage = ({ skillId }) => {
  const [formState, setFormState] = useState({});

  const handleLoadTestData = (inputPayload: Record<string, string>) => {
    setFormState(prev => ({ ...prev, ...inputPayload }));
  };

  return (
    <div>
      {/* Banner appears when test data exists */}
      <TestDataBanner
        skillId={skillId}
        onLoadTestData={handleLoadTestData}
      />

      {/* Form fields populated with test data */}
      <SkillInputForm values={formState} />
    </div>
  );
};
```

#### TestDataBanner Component

```tsx
// components/TestOutputButton.tsx

export const TestDataBanner: React.FC<Props> = ({ skillId, onLoadTestData }) => {
  // Check if test data exists
  const hasTestData = hasSkillDefaultTestData(skillId);
  const testData = getSkillDefaultTestData(skillId);

  if (!hasTestData || !testData) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-600/10">
      <FlaskConical className="h-5 w-5 text-amber-600" />
      <p>Test data available: {testData.description}</p>
      <Button onClick={() => onLoadTestData(testData.inputPayload)}>
        Load Test Data
      </Button>
    </div>
  );
};
```

### Helper Functions API

```typescript
// lib/testing/index.ts exports

// Check availability
hasSkillDefaultTestData(skillId: string): boolean
hasWorkflowDefaultTestData(workflowId: string): boolean

// Retrieve data
getSkillDefaultTestData(skillId: string): SkillDefaultTestData | undefined
getWorkflowDefaultTestData(workflowId: string): WorkflowDefaultTestData | undefined

// List all available
getSkillsWithDefaultTestData(): string[]
getWorkflowsWithDefaultTestData(): string[]

// Apply to form
applyDefaultTestDataToForm(
  currentState: Record<string, unknown>,
  defaultData: SkillDefaultTestData,
  inputIds?: string[]  // Optional field ID validation
): Record<string, unknown>
```

---

## LLM Interaction Testing

### API Integration

**Primary API:** Google Gemini (`@google/generative-ai`)

```typescript
// lib/testing/apiHelper.ts

export async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  model: string = 'gemini-1.5-flash-latest'
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });
  const result = await genModel.generateContent(prompt);
  return result.response.text();
}
```

### AI-Powered Grading

The grading system evaluates LLM outputs against rubric criteria:

```typescript
// lib/testing/grader.ts

interface GradingResult {
  overallScore: number;        // 1-5 scale
  criterionScores: CriterionScore[];
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// Generate grading prompt
const gradingPrompt = generateGradingPrompt(output, rubric);

// Parse AI response
const result = parseGradingResponse(aiResponse);
```

### Mocking Strategy

Currently, tests use:

1. **localStorage Mock** - Full API simulation in `tests/setup.ts`
2. **crypto.randomUUID Mock** - Deterministic UUID generation
3. **Manual Mocks** - Per-test setup when needed

```typescript
// tests/setup.ts

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
```

### Future: Response Recording

Planned approach for deterministic LLM testing:

```typescript
// Proposed: recorded response fixtures
const recordedResponses = {
  'skill-id-test-001': {
    input: { /* input payload */ },
    output: '/* recorded LLM response */',
    timestamp: '2025-01-01T00:00:00Z',
    model: 'gemini-1.5-flash',
  },
};
```

---

## Developer Experience

### Adding New Skill Test Data

#### Step 1: Identify Input Fields

```typescript
// Check lib/skills/static.ts or relevant skill file
const skill = SKILLS['your-skill-id'];
const inputIds = skill.inputs.map(i => i.id);
// e.g., ['jobTitle', 'companyName', 'jobDescription']
```

#### Step 2: Add Default Test Data

```typescript
// lib/testing/defaultTestData.ts

export const JOB_SEEKER_DEFAULT_TEST_DATA = {
  // ... existing entries ...

  'your-skill-id': {
    skillId: 'your-skill-id',
    defaultTestCaseId: 'your-skill-default-001',
    description: 'Clear description of test scenario',
    inputPayload: {
      jobTitle: 'Software Engineer',
      companyName: 'TechCorp',
      jobDescription: SAMPLE_JOB_DESCRIPTION, // Use shared template
      // Include ALL required fields
    },
  },
};
```

#### Step 3: (Optional) Add Extended Test Suite

Create `testdata/skills/your-skill-id.json`:

```json
{
  "skillId": "your-skill-id",
  "skillName": "Your Skill Name",
  "generatedAt": "2025-01-01T00:00:00.000Z",
  "tests": [
    {
      "id": "your-skill-happy-1",
      "type": "happy-path",
      "description": "Standard scenario",
      "inputPayload": { ... },
      "rubric": {
        "criteria": [
          {"id": "accuracy", "description": "...", "weight": 25},
          {"id": "completeness", "description": "...", "weight": 25}
        ]
      }
    }
  ]
}
```

#### Step 4: Verify

```bash
# Build to check for TypeScript errors
npm run build

# Run tests
npm test

# Manual verification in UI
npm run dev
# Navigate to skill page, verify banner appears
```

### Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Skill ID | kebab-case | `resume-optimizer` |
| Test Case ID | `{skillId}-{type}-{number}` | `resume-optimizer-happy-1` |
| Fixture File | `{skillId}.json` | `resume-optimizer.json` |
| Test File | `{module}.test.ts` | `workflows.test.ts` |

### Deterministic Testing Tips

1. **Use shared templates** - Reference `SAMPLE_RESUME`, etc.
2. **Avoid timestamps** - Don't include dates in test payloads
3. **Seed random values** - Use `vi.fn()` mocks
4. **Isolate state** - `beforeEach` clears localStorage

---

## CI/CD Integration

### Current Status

**CI/CD is not yet configured.** The following is the planned implementation:

### Proposed GitHub Actions

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'lib/**/*.ts',
        'pages/**/*.tsx',
        'hooks/**/*.tsx',
        'components/**/*.tsx'
      ],
      exclude: [
        'lib/database.types.ts',
        '**/*.d.ts',
      ],
    },
  },
});
```

---

## Validation Checklist

### New Skill/Workflow Validation

Use this checklist when adding or modifying skills and workflows:

#### Input Validation

- [ ] All required fields defined in skill schema
- [ ] Field IDs are unique and use kebab-case
- [ ] Select fields have valid `options` array
- [ ] Placeholder text is helpful and descriptive
- [ ] Input validation (if any) is working

#### Test Data

- [ ] Default test data added to `defaultTestData.ts`
- [ ] All required fields have values in `inputPayload`
- [ ] Field IDs match skill schema exactly (case-sensitive)
- [ ] Description clearly explains test scenario
- [ ] Test data uses synthetic/fictional information only

#### UI Components

- [ ] `TestDataBanner` appears on skill page
- [ ] "Load Test Data" button works
- [ ] Form fields populate correctly
- [ ] No console errors when loading

#### Streaming Output

- [ ] Output renders correctly while streaming
- [ ] Markdown formatting displays properly
- [ ] No flickering or layout jumps
- [ ] Loading states show during generation
- [ ] Error states display if API fails

#### Error States

- [ ] Missing required fields show validation errors
- [ ] API errors display user-friendly messages
- [ ] Network failures show retry options
- [ ] Rate limiting handled gracefully

#### Accessibility

- [ ] Form labels associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Focus management during loading states
- [ ] Keyboard navigation works

### Quick Verification Script

```bash
#!/bin/bash
# verify-skill.sh

SKILL_ID=$1

echo "Verifying skill: $SKILL_ID"

# 1. Check skill exists
grep -q "\"$SKILL_ID\"" lib/skills/*.ts && echo "✓ Skill defined" || echo "✗ Skill not found"

# 2. Check test data exists
grep -q "\"$SKILL_ID\"" lib/testing/defaultTestData.ts && echo "✓ Test data exists" || echo "✗ No test data"

# 3. Build check
npm run build 2>/dev/null && echo "✓ Build passes" || echo "✗ Build fails"

# 4. Test check
npm test 2>/dev/null && echo "✓ Tests pass" || echo "✗ Tests fail"
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Test data not loading | Field ID mismatch | Verify IDs match skill schema exactly |
| Banner not appearing | Missing from registry | Add to `ALL_SKILL_DEFAULT_TEST_DATA` |
| Form not updating | State not merged | Use `setFormState(prev => ({...prev, ...payload}))` |
| TypeScript errors | Invalid payload | Ensure all values are strings |
| Build fails | Missing export | Add to `lib/testing/index.ts` |

### Debug Mode

```typescript
// Enable verbose logging in test components
if (process.env.NODE_ENV === 'development') {
  console.log('[TestData] Loading:', skillId);
  console.log('[TestData] Payload:', testData.inputPayload);
}
```

### Getting Help

1. Check existing tests in `tests/lib/` for patterns
2. Review `TESTING.md` in project root
3. Examine `testdata/skills/*.json` for fixture format
4. Use Developer Playground (`/dev-playground`) for interactive testing

---

## Appendix: API Reference

### Testing Library Exports

```typescript
// Full list from lib/testing/index.ts

// Registry & Schema
generateRegistrySnapshot, getAllSkillSchemas, getSkillSchema,
getAllWorkflowSchemas, getWorkflowSchema, getSkillsByCategory

// Test Generation
generateSkillTestSuite, generateWorkflowTestSuite,
generateAllSkillTestSuites, generateAllWorkflowTestSuites

// Grading
generateGradingPrompt, parseGradingResponse, createEvalRecord,
validateOutputStructure, analyzeEvalRecords

// Storage
saveEvalRecord, getEvalRecordsForSkill, getRecentEvalRecords,
saveSkillTestSuite, getSkillTestSuite, clearAllTestingData

// Test Runner
runSkillTests, runAllSkillTests, runStructuralValidation,
generateTestReport

// Prompt Optimizer
analyzeSkillForOptimization, generateOptimizationProposal,
validatePromptSafety

// Default Test Data
getSkillDefaultTestData, hasSkillDefaultTestData,
getSkillsWithDefaultTestData, applyDefaultTestDataToForm,
ALL_SKILL_DEFAULT_TEST_DATA
```

---

*Last updated: December 2024*
