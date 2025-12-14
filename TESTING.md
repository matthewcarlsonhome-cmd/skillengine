# Testing Infrastructure

This document describes the testing infrastructure for AI Career Skills / Skill Engine, including default test data, the Developer Playground, and automated evaluation.

## Architecture Overview

```
lib/testing/
├── index.ts                 # Main exports
├── defaultTestData.ts       # Curated default test data for skills/workflows
├── testCaseGenerator.ts     # Auto-generates test suites
├── grader.ts                # AI-powered output grading
├── evalStorage.ts           # IndexedDB storage for eval records
├── testRunner.ts            # Batch test execution
├── promptOptimizer.ts       # Prompt optimization tools
├── registrySnapshot.ts      # Schema extraction utilities
└── apiHelper.ts             # Gemini API wrapper

components/
└── TestOutputButton.tsx     # Reusable test data UI components

pages/
├── DevPlaygroundPage.tsx    # Developer Test Playground
├── SkillRunnerPage.tsx      # Individual skill runner (with test banner)
└── WorkflowRunnerPage.tsx   # Workflow runner (with test banner)
```

## Default Test Data

### Structure

Each skill and workflow can have curated default test data defined in `lib/testing/defaultTestData.ts`:

```typescript
// For Skills
interface SkillDefaultTestData {
  skillId: string;                    // Must match skill.id
  defaultTestCaseId: string;          // Unique test case identifier
  description: string;                // Human-readable description
  inputPayload: Record<string, string>; // Form field values
}

// For Workflows
interface WorkflowDefaultTestData {
  workflowId: string;                 // Must match workflow.id
  defaultTestCaseId: string;          // Unique test case identifier
  description: string;                // Human-readable description
  inputPayload: Record<string, string>; // Global input values
}
```

### Adding New Default Test Data

1. **Open** `lib/testing/defaultTestData.ts`

2. **Locate the appropriate section** (Job Seeker, Enterprise, Excel, or Workflow)

3. **Add your test data entry**:

```typescript
// In the appropriate section (e.g., JOB_SEEKER_DEFAULT_TEST_DATA)
'your-skill-id': {
  skillId: 'your-skill-id',
  defaultTestCaseId: 'your-skill-id-default-001',
  description: 'Brief description of this test scenario',
  inputPayload: {
    inputField1: 'Value for field 1',
    inputField2: 'Value for field 2',
    // Include ALL required fields
  },
},
```

4. **Verify field IDs match the skill schema**:
   - Check `lib/skills/static.ts`, `enterprise.ts`, etc. for input field IDs
   - Every required field must have a value in `inputPayload`

5. **Test your changes**:
```bash
npm run build  # Verify compilation
npm test       # Run test suite
```

### Shared Sample Data

For reusable test content (resumes, job descriptions), use the constants at the top of `defaultTestData.ts`:

```typescript
const SAMPLE_RESUME = `...`;
const SAMPLE_JOB_DESCRIPTION = `...`;
const SAMPLE_LINKEDIN_SUMMARY = `...`;
const SAMPLE_COMPANY_INFO = `...`;
```

Reference these in your test data to maintain consistency.

## Test Output Button

### SkillRunnerPage / WorkflowRunnerPage

The `TestDataBanner` component appears automatically on skill/workflow pages when curated test data exists:

```tsx
import { TestDataBanner } from '../components/TestOutputButton';

// In your page component:
<TestDataBanner
  skillId={skillId}           // OR workflowId={workflowId}
  onLoadTestData={handleLoadTestData}
/>
```

When clicked, it populates all form fields with the default test values.

### TestOutputButton Component

For more control, use the full `TestOutputButton` component:

```tsx
<TestOutputButton
  skillId="resume-optimizer"
  onLoadTestData={(data) => setFormState(data)}
  onExecute={() => handleExecute()}
  autoExecute={true}           // Auto-run after loading
  showDetails={true}           // Show expanded panel
/>
```

## Developer Playground

Located at `/dev-playground`, the Developer Playground provides:

1. **Skill/Workflow Selection** - Browse all available skills and workflows
2. **Test Case Management** - View, select, and regenerate test cases
3. **Input Form** - Edit test inputs before execution
4. **Execution** - Run skills with the Gemini API
5. **AI Grading** - Evaluate outputs against rubric criteria
6. **History** - Track evaluation scores over time

### Visual Indicators

- **Flask icon** next to skill/workflow name: Curated test data available
- **"Curated" badge** on test cases: Hand-crafted (not auto-generated)
- **"Load Curated Test Data" button**: One-click load of default data

## Test Case Generation

The `generateSkillTestSuite()` and `generateWorkflowTestSuite()` functions automatically create test suites:

```typescript
import { generateSkillTestSuite, getSkillSchema } from '../lib/testing';

const schema = getSkillSchema('resume-optimizer');
const suite = generateSkillTestSuite(schema);
// suite.tests contains: happy-path, edge-case, and variant tests
```

### Priority Order

1. **Curated default data** (from `defaultTestData.ts`) is used for happy-path tests when available
2. **Auto-generated data** fills in when no curated data exists
3. **Edge-case and variant tests** are always auto-generated for comprehensive coverage

## Safety Guardrails

### Test Data Guidelines

1. **Use synthetic/fictional data only**
   - Never include real personal information
   - Use obviously fake names ("Alex Johnson", "TechCorp")
   - Avoid real email addresses, phone numbers, or addresses

2. **Keep test data professional**
   - Appropriate for workplace demonstration
   - No sensitive or controversial content
   - Focus on realistic but generic scenarios

3. **Validate against schemas**
   - All required fields must have values
   - Values must match expected types (text, select, etc.)
   - Select fields must use valid option values

### Developer Testing UI

The testing components include safeguards:

- **Banner text**: "This is a developer testing feature. Test data is synthetic and for verification purposes only."
- **Visual distinction**: Amber/yellow color scheme indicates test mode
- **No production exposure**: Test components should be hidden or access-controlled in production

### Evaluation Storage

- Eval records are stored in IndexedDB (client-side only)
- No test data or results are sent to external servers (except the AI API call)
- Use `clearAllTestingData()` to purge stored evaluations

## API Usage

### Helper Functions

```typescript
// Check if default data exists
hasSkillDefaultTestData(skillId: string): boolean
hasWorkflowDefaultTestData(workflowId: string): boolean

// Get default data
getSkillDefaultTestData(skillId: string): SkillDefaultTestData | undefined
getWorkflowDefaultTestData(workflowId: string): WorkflowDefaultTestData | undefined

// List all skills/workflows with default data
getSkillsWithDefaultTestData(): string[]
getWorkflowsWithDefaultTestData(): string[]

// Apply to form state
applyDefaultTestDataToForm(
  currentState: Record<string, unknown>,
  defaultData: SkillDefaultTestData | WorkflowDefaultTestData,
  inputIds?: string[]  // Optional validation
): Record<string, unknown>

// Convert to TestCase format
defaultTestDataToTestCase(
  defaultData: SkillDefaultTestData | WorkflowDefaultTestData,
  rubricCriteria: RubricCriterion[]
): TestCase
```

## Extending the System

### Adding a New Skill Category

1. Create test data constants in `defaultTestData.ts`:
```typescript
export const MY_CATEGORY_DEFAULT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  'skill-1': { ... },
  'skill-2': { ... },
};
```

2. Merge into `ALL_SKILL_DEFAULT_TEST_DATA`:
```typescript
export const ALL_SKILL_DEFAULT_TEST_DATA: Record<string, SkillDefaultTestData> = {
  ...JOB_SEEKER_DEFAULT_TEST_DATA,
  ...ENTERPRISE_DEFAULT_TEST_DATA,
  ...MY_CATEGORY_DEFAULT_TEST_DATA,  // Add here
};
```

3. Export from `lib/testing/index.ts`:
```typescript
export { MY_CATEGORY_DEFAULT_TEST_DATA } from './defaultTestData';
```

### Custom Rubric Criteria

Override the default rubric in `testCaseGenerator.ts` by implementing `getRubricForSkill()`:

```typescript
function getRubricForSkill(skillId: string): RubricCriterion[] {
  const customRubrics: Record<string, RubricCriterion[]> = {
    'my-skill': [
      { id: 'accuracy', description: 'Information is factually accurate', weight: 2 },
      { id: 'formatting', description: 'Output follows required format', weight: 1 },
    ],
  };
  return customRubrics[skillId] || DEFAULT_RUBRIC;
}
```

## Troubleshooting

### "Test data not loading"
- Verify `skillId` matches exactly (case-sensitive)
- Check that all required input fields have values
- Look for console warnings about unknown field IDs

### "Form values not updating"
- Ensure `onLoadTestData` callback properly updates state
- For React, use `setFormState((prev) => ({ ...prev, ...inputPayload }))`

### "Test case not marked as curated"
- The `defaultTestCaseId` must match the test case ID exactly
- Regenerate test suite to pick up new default data

### "Build errors after adding test data"
- Validate TypeScript types
- Ensure all string values are properly quoted
- Check for trailing commas in object literals
