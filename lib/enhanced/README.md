# Enhanced SkillEngine Module

This module provides enterprise-grade features for the SkillEngine platform.

## Features

### 1. Schema Validation & Lineage Tracking (`types.ts`)
- JSON Schema definitions for inputs/outputs
- Data lineage tracking across workflows
- Schema drift detection and migration paths

### 2. Observability (`observability.ts`)
- **Distributed Tracing**: Track execution across skills and workflows
- **Latency Budgets**: P50, P95, P99 targets with monitoring
- **Error Budgets**: SLI/SLO pattern for reliability tracking
- **Alerting**: Configurable rules with webhook, email, Slack integration

```typescript
import { startTrace, setLatencyBudget, setAlertRule } from './enhanced';

// Start tracing an execution
const trace = startTrace({
  type: 'skill',
  entityId: 'skill_123',
  entityName: 'Content Generator',
  provider: 'claude',
  model: 'claude-3-haiku',
});

// Set latency budget
setLatencyBudget({
  id: 'content-gen-budget',
  name: 'Content Generation Latency',
  targetP95Ms: 3000,
  targetP99Ms: 5000,
  maxMs: 10000,
  windowMinutes: 60,
});
```

### 3. Compliance (`compliance.ts`)
- **Policy Management**: Define and enforce policies per skill/role
- **PII Detection**: Automatic detection of emails, SSNs, credit cards, etc.
- **PII Redaction**: Multiple modes (mask, hash, remove, placeholder)
- **Audit Logging**: Complete audit trail with export capabilities

```typescript
import { setPolicy, detectPII, redactPII, logAudit } from './enhanced';

// Set a compliance policy
setPolicy({
  id: 'pii-protection',
  name: 'PII Protection Policy',
  scope: { skills: ['*'] },
  rules: [{
    type: 'pii_check',
    action: 'redact',
    message: 'PII must be redacted',
  }],
  enforcement: 'block',
});

// Detect PII in text
const result = detectPII('Contact john@example.com for details');
// result.found === true
// result.detections[0].type === 'email'

// Redact PII
const redacted = redactPII('My SSN is 123-45-6789');
// redacted.redactedText === 'My SSN is [SSN REDACTED]'
```

### 4. Cost Controls (`costControls.ts`)
- **Cost Estimation**: Pre-execution cost estimates by provider/model
- **Budget Management**: Daily/weekly/monthly limits per user/team
- **Provider Routing**: Intelligent routing based on cost, availability, rules
- **Cost Tracking**: Detailed cost records and summaries

```typescript
import { estimateSkillCost, setBudget, selectProvider } from './enhanced';

// Estimate cost before execution
const estimate = estimateSkillCost({
  skillId: 'skill_123',
  inputs: { content: 'Generate a blog post about...' },
  provider: 'claude',
  model: 'claude-3-haiku',
});
// estimate.totalCost, estimate.estimatedInputTokens, etc.

// Set a budget
setBudget({
  id: 'team-budget',
  name: 'Marketing Team Budget',
  scope: { teamId: 'team_123' },
  dailyLimit: 10,
  monthlyLimit: 200,
  onLimitReached: 'warn',
});

// Select optimal provider
const provider = selectProvider({ userTier: 'premium' });
```

### 5. Collaboration (`collaboration.ts`)
- **Drafts**: Shared drafts with version control
- **Comments**: Inline comments with threading and reactions
- **Approvals**: Multi-approver workflows with history
- **Publish Gates**: Configurable requirements before publishing

```typescript
import { createDraft, addComment, requestApproval, publishDraft } from './enhanced';

// Create a draft
const draft = createDraft({
  type: 'skill',
  name: 'New Email Generator',
  content: { prompt: '...' },
  authorId: 'user_123',
  authorEmail: 'user@example.com',
});

// Add a comment
addComment({
  draftId: draft.id,
  content: 'Should we add tone selection?',
  authorId: 'reviewer_456',
  authorEmail: 'reviewer@example.com',
});

// Request approval
requestApproval({
  draftId: draft.id,
  requesterId: 'user_123',
  approverIds: ['manager_789'],
  approverEmails: ['manager@example.com'],
});

// Publish after approval
publishDraft(draft.id, {
  publisherId: 'user_123',
  publisherEmail: 'user@example.com',
});
```

### 6. A/B Testing (`abTesting.ts`)
- **Experiment Management**: Create, start, pause, complete experiments
- **Variant Assignment**: Consistent user-variant assignment
- **Exposure Tracking**: Record when users see variants
- **Conversion Tracking**: Track success metrics
- **Statistical Analysis**: P-values and confidence intervals

```typescript
import { createExperiment, getVariantAssignment, recordConversion } from './enhanced';

// Create an experiment
const experiment = createExperiment({
  name: 'Prompt A/B Test',
  description: 'Testing new prompt format',
  targetSkillId: 'skill_123',
  variants: [
    { id: 'control', name: 'Original', type: 'prompt', changes: {}, trafficWeight: 50 },
    { id: 'treatment', name: 'New Format', type: 'prompt', changes: { promptStyle: 'v2' }, trafficWeight: 50 },
  ],
  controlVariantId: 'control',
  trafficPercentage: 100,
  primaryMetric: { id: 'completion', name: 'Completion Rate', type: 'conversion', higherIsBetter: true },
  createdBy: 'user_123',
});

// Start the experiment
startExperiment(experiment.id);

// Get variant for a user
const assignment = getVariantAssignment({
  experimentId: experiment.id,
  userId: 'user_456',
});
// assignment.variant.changes contains the config overrides

// Record conversion
recordConversion({
  experimentId: experiment.id,
  userId: 'user_456',
});

// Get results
const results = calculateResults(experiment.id);
// results.isSignificant, results.recommendedVariant, results.pValue
```

## Convenience Functions

### Pre-execution Check
```typescript
import { preExecutionCheck } from './enhanced';

const check = await preExecutionCheck({
  skillId: 'skill_123',
  skillName: 'Content Generator',
  inputs: { topic: 'AI trends' },
  userId: 'user_456',
  userRole: 'premium',
});

if (!check.allowed) {
  console.log('Blocked:', check.blockedReason);
} else {
  // Proceed with execution using check.provider, check.model
}
```

### Health Status
```typescript
import { getHealthStatus } from './enhanced';

const health = getHealthStatus();
// health.overall: 'healthy' | 'degraded' | 'unhealthy'
// health.components: individual component statuses
// health.metrics: success rate, latency, cost, alerts
```

## Type Definitions

All types are exported from `./types.ts`:

- Schema: `SchemaDefinition`, `SchemaValidationResult`, `LineageGraph`
- Observability: `ExecutionTrace`, `LatencyBudget`, `ErrorBudget`, `AlertRule`
- Compliance: `CompliancePolicy`, `PIIConfig`, `AuditLogEntry`
- Cost: `CostEstimate`, `BudgetConfig`, `ProviderRoutingConfig`, `CostRecord`
- A/B Testing: `ABExperiment`, `ABVariant`, `ABResult`
- Collaboration: `Draft`, `Comment`, `ApprovalRequest`, `PublishGate`
- Workflow: `EnhancedWorkflowStep`, `RetryConfig`, `RollbackConfig`
