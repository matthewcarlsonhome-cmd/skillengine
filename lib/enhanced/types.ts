/**
 * Enhanced Types for SkillEngine
 *
 * This module extends the base types with:
 * - Schema validation and lineage tracking
 * - Observability (tracing, latency budgets, alerting)
 * - Compliance (policy checks, audit logging, PII redaction)
 * - Cost controls (estimates, budget caps, provider routing)
 * - A/B testing framework
 * - Collaboration features (drafts, comments, approvals)
 * - Advanced workflow chaining with conditional logic and retries
 */

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION & LINEAGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * JSON Schema definition for input/output validation
 */
export interface SchemaDefinition {
  $id: string;
  version: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  items?: SchemaProperty;
  additionalProperties?: boolean;
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: (string | number)[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: 'email' | 'uri' | 'date' | 'date-time' | 'uuid' | 'pii';
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  default?: unknown;
}

/**
 * Schema validation result
 */
export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  warnings: SchemaValidationWarning[];
}

export interface SchemaValidationError {
  path: string;
  message: string;
  expected: string;
  received: string;
}

export interface SchemaValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

/**
 * Lineage tracking for data flow
 */
export interface LineageNode {
  id: string;
  type: 'skill' | 'workflow' | 'input' | 'output' | 'transform';
  name: string;
  version?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface LineageEdge {
  source: string;
  target: string;
  relationship: 'produces' | 'consumes' | 'transforms' | 'depends_on';
  dataFields?: string[];
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  rootNodes: string[];
  leafNodes: string[];
}

/**
 * Schema drift detection
 */
export interface SchemaDriftReport {
  skillId: string;
  previousSchema: SchemaDefinition;
  currentSchema: SchemaDefinition;
  driftType: 'breaking' | 'non-breaking' | 'none';
  changes: SchemaDriftChange[];
  canAutoMigrate: boolean;
  migrationPath?: string;
}

export interface SchemaDriftChange {
  path: string;
  changeType: 'added' | 'removed' | 'modified' | 'type_changed';
  previousValue?: unknown;
  newValue?: unknown;
  isBreaking: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// OBSERVABILITY: TRACING, LATENCY, ALERTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trace span for distributed tracing
 */
export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'success' | 'error' | 'timeout';
  tags: Record<string, string | number | boolean>;
  logs: TraceLog[];
  baggage?: Record<string, string>;
}

export interface TraceLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, unknown>;
}

/**
 * Execution trace for skills and workflows
 */
export interface ExecutionTrace {
  id: string;
  type: 'skill' | 'workflow' | 'step';
  entityId: string;
  entityName: string;

  // Timing
  startedAt: string;
  completedAt?: string;
  durationMs?: number;

  // Performance
  inputTokens?: number;
  outputTokens?: number;
  modelLatencyMs?: number;
  totalLatencyMs?: number;

  // Status
  status: 'pending' | 'running' | 'success' | 'error' | 'timeout' | 'retrying';
  retryCount: number;
  error?: ExecutionError;

  // Context
  userId?: string;
  sessionId?: string;
  parentTraceId?: string;
  childTraceIds: string[];

  // Cost
  estimatedCost?: number;
  actualCost?: number;
  provider: string;
  model: string;
}

export interface ExecutionError {
  code: string;
  message: string;
  stack?: string;
  retryable: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Latency budget configuration
 */
export interface LatencyBudget {
  id: string;
  name: string;
  targetP50Ms: number;
  targetP95Ms: number;
  targetP99Ms: number;
  maxMs: number;
  windowMinutes: number;

  // Current status
  currentP50Ms?: number;
  currentP95Ms?: number;
  currentP99Ms?: number;
  withinBudget: boolean;
  lastUpdated?: string;
}

/**
 * Error budget configuration
 */
export interface ErrorBudget {
  id: string;
  name: string;
  targetSuccessRate: number; // 0.0 to 1.0
  windowDays: number;

  // Current status
  currentSuccessRate?: number;
  errorCount?: number;
  totalCount?: number;
  budgetRemaining?: number; // percentage
  lastUpdated?: string;
}

/**
 * Alert configuration
 */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;

  // Conditions
  metric: 'latency_p95' | 'latency_p99' | 'error_rate' | 'cost' | 'throughput' | 'custom';
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  threshold: number;
  windowMinutes: number;

  // Actions
  severity: 'info' | 'warning' | 'critical';
  webhookUrl?: string;
  emailRecipients?: string[];
  slackChannel?: string;

  // State
  lastTriggered?: string;
  triggerCount: number;
  silencedUntil?: string;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  triggeredAt: string;
  resolvedAt?: string;
  message: string;
  metricValue: number;
  threshold: number;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE: POLICY, AUDIT, PII REDACTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compliance policy definition
 */
export interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;

  // Scope
  scope: {
    skills?: string[];      // Specific skill IDs or '*' for all
    workflows?: string[];   // Specific workflow IDs or '*' for all
    roles?: string[];       // User roles this applies to
  };

  // Rules
  rules: PolicyRule[];

  // Enforcement
  enforcement: 'block' | 'warn' | 'log';

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PolicyRule {
  id: string;
  type: 'pii_check' | 'content_filter' | 'rate_limit' | 'cost_limit' | 'approval_required' | 'custom';
  condition: string; // JSON path or expression
  action: 'block' | 'redact' | 'warn' | 'require_approval' | 'log';
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Policy check result
 */
export interface PolicyCheckResult {
  policyId: string;
  policyName: string;
  passed: boolean;
  violations: PolicyViolation[];
  warnings: PolicyWarning[];
  timestamp: string;
}

export interface PolicyViolation {
  ruleId: string;
  ruleType: string;
  message: string;
  path?: string;
  action: 'blocked' | 'redacted' | 'flagged';
  originalValue?: string;
  redactedValue?: string;
}

export interface PolicyWarning {
  ruleId: string;
  message: string;
  suggestion?: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;

  // Actor
  actorId: string;
  actorEmail: string;
  actorRole: string;
  actorIp?: string;

  // Action
  action: AuditAction;
  resourceType: 'skill' | 'workflow' | 'execution' | 'policy' | 'user' | 'config' | 'approval';
  resourceId: string;
  resourceName?: string;

  // Details
  details: Record<string, unknown>;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;

  // Result
  result: 'success' | 'failure' | 'blocked';
  errorMessage?: string;

  // Compliance
  policyChecks?: PolicyCheckResult[];
  piiRedacted: boolean;
}

export type AuditAction =
  | 'create' | 'read' | 'update' | 'delete'
  | 'execute' | 'approve' | 'reject'
  | 'export' | 'import' | 'share'
  | 'login' | 'logout'
  | 'config_change' | 'policy_change';

/**
 * PII detection and redaction
 */
export interface PIIConfig {
  enabled: boolean;
  detectOnInput: boolean;
  detectOnOutput: boolean;
  redactionMode: 'mask' | 'hash' | 'remove' | 'placeholder';

  // PII types to detect
  piiTypes: PIIType[];

  // Custom patterns
  customPatterns?: PIIPattern[];

  // Exclusions
  excludeFields?: string[];
  excludeSkills?: string[];
}

export type PIIType =
  | 'email' | 'phone' | 'ssn' | 'credit_card'
  | 'address' | 'name' | 'date_of_birth'
  | 'ip_address' | 'passport' | 'driver_license'
  | 'bank_account' | 'medical_record';

export interface PIIPattern {
  name: string;
  pattern: string; // Regex pattern
  type: 'custom';
  redactionLabel: string;
}

export interface PIIDetectionResult {
  found: boolean;
  detections: PIIDetection[];
  redactedText?: string;
}

export interface PIIDetection {
  type: PIIType | 'custom';
  value: string;
  redactedValue: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COST CONTROLS: ESTIMATES, BUDGETS, ROUTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cost estimation for a skill/workflow run
 */
export interface CostEstimate {
  skillId?: string;
  workflowId?: string;

  // Token estimates
  estimatedInputTokens: number;
  estimatedOutputTokens: number;

  // Cost breakdown
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: 'USD';

  // Provider info
  provider: string;
  model: string;
  pricePerInputToken: number;
  pricePerOutputToken: number;

  // Confidence
  confidence: 'high' | 'medium' | 'low';
  estimatedAt: string;
}

/**
 * Budget configuration
 */
export interface BudgetConfig {
  id: string;
  name: string;

  // Limits
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  perRunLimit: number;

  // Scope
  scope: {
    userId?: string;
    teamId?: string;
    skills?: string[];
    workflows?: string[];
  };

  // Actions
  onLimitReached: 'block' | 'warn' | 'notify' | 'downgrade_model';
  notifyAt: number[]; // Percentages, e.g., [50, 80, 90, 100]

  // Current usage
  currentDailyUsage: number;
  currentWeeklyUsage: number;
  currentMonthlyUsage: number;
  lastResetAt: string;
}

/**
 * Provider routing configuration
 */
export interface ProviderRoutingConfig {
  id: string;
  name: string;
  enabled: boolean;

  // Priority order
  providerPriority: ProviderConfig[];

  // Routing rules
  rules: RoutingRule[];

  // Fallback behavior
  fallbackProvider: string;
  fallbackOnError: boolean;
  fallbackOnRateLimit: boolean;
  fallbackOnBudget: boolean;
}

export interface ProviderConfig {
  provider: 'claude' | 'gemini' | 'openai' | 'anthropic';
  model: string;
  enabled: boolean;
  weight: number; // For load balancing
  maxConcurrent: number;

  // Cost
  inputTokenPrice: number;
  outputTokenPrice: number;

  // Limits
  rateLimit: number; // Requests per minute
  maxTokens: number;
}

export interface RoutingRule {
  id: string;
  name: string;
  condition: RoutingCondition;
  action: RoutingAction;
  priority: number;
}

export interface RoutingCondition {
  type: 'skill_category' | 'estimated_cost' | 'token_count' | 'time_of_day' | 'user_tier' | 'custom';
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'not_in' | 'matches';
  value: unknown;
}

export interface RoutingAction {
  type: 'use_provider' | 'use_model' | 'block' | 'queue';
  provider?: string;
  model?: string;
  reason?: string;
}

/**
 * Cost tracking record
 */
export interface CostRecord {
  id: string;
  timestamp: string;

  // Execution
  executionId: string;
  skillId?: string;
  workflowId?: string;

  // User
  userId: string;
  teamId?: string;

  // Cost
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  currency: 'USD';

  // Provider
  provider: string;
  model: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// A/B TESTING FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A/B test experiment
 */
export interface ABExperiment {
  id: string;
  name: string;
  description: string;

  // Status
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  startedAt?: string;
  endedAt?: string;

  // Configuration
  targetSkillId?: string;
  targetWorkflowId?: string;
  targetStepId?: string;

  // Variants
  variants: ABVariant[];
  controlVariantId: string;

  // Traffic allocation
  trafficPercentage: number; // 0-100, percentage of traffic in experiment

  // Success metrics
  primaryMetric: ABMetric;
  secondaryMetrics: ABMetric[];

  // Statistical settings
  minSampleSize: number;
  confidenceLevel: number; // e.g., 0.95 for 95%

  // Results
  winner?: string;
  winnerConfidence?: number;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABVariant {
  id: string;
  name: string;
  description?: string;

  // Configuration override
  type: 'prompt' | 'model' | 'config' | 'workflow_step';
  changes: Record<string, unknown>;

  // Traffic
  trafficWeight: number; // Relative weight for allocation

  // Results
  sampleSize: number;
  conversions: number;
  metricValues: Record<string, number>;
}

export interface ABMetric {
  id: string;
  name: string;
  type: 'conversion' | 'value' | 'duration' | 'custom';
  higherIsBetter: boolean;

  // For custom metrics
  calculation?: string;
}

export interface ABAssignment {
  experimentId: string;
  variantId: string;
  userId: string;
  sessionId?: string;
  assignedAt: string;

  // Tracking
  exposed: boolean;
  converted: boolean;
  metricValues?: Record<string, number>;
}

export interface ABResult {
  experimentId: string;
  calculatedAt: string;

  variantResults: {
    variantId: string;
    sampleSize: number;
    conversionRate?: number;
    meanValue?: number;
    standardDeviation?: number;
    confidenceInterval: [number, number];
  }[];

  // Statistical analysis
  pValue?: number;
  isSignificant: boolean;
  recommendedVariant?: string;
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLABORATION: DRAFTS, COMMENTS, APPROVALS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Draft status
 */
export type DraftStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'archived';

/**
 * Approval status
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'cancelled' | 'expired';

/**
 * Draft for skills and workflows (simplified for collaboration service)
 */
export interface Draft {
  id: string;
  type: 'skill' | 'workflow';
  entityId?: string;
  name: string;
  description: string;
  content: Record<string, unknown>;
  status: DraftStatus;
  version: number;
  author: {
    id: string;
    email: string;
    name?: string;
  };
  collaborators: {
    id: string;
    email: string;
    name?: string;
    role: 'viewer' | 'editor' | 'approver';
    addedAt: string;
  }[];
  teamId?: string;
  createdAt: string;
  updatedAt: string;
  basedOnVersion?: string;
  publishedAt?: string;
  publishedBy?: {
    id: string;
    email: string;
  };
  changes: {
    id: string;
    description: string;
    editorId: string;
    editorEmail: string;
    timestamp: string;
    previousContent?: Record<string, unknown>;
  }[];
}

/**
 * Draft/versioning for skills and workflows (generic version)
 */
export interface DraftGeneric<T> {
  id: string;
  entityType: 'skill' | 'workflow';
  entityId?: string; // Undefined for new entities

  // Version info
  version: number;
  status: DraftStatus;

  // Content
  content: T;
  diff?: DraftDiff[];

  // Author
  authorId: string;
  authorName: string;

  // Review
  reviewers?: string[];
  approvedBy?: string[];
  rejectedBy?: string;
  rejectionReason?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;

  // Comments
  commentCount: number;
}

export interface DraftDiff {
  path: string;
  operation: 'add' | 'remove' | 'replace';
  oldValue?: unknown;
  newValue?: unknown;
}

/**
 * Comment on a draft or entity
 */
export interface Comment {
  id: string;
  draftId: string;
  content: string;
  author: {
    id: string;
    email: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: {
    id: string;
    email: string;
  };
  parentId?: string;
  lineRef?: {
    field: string;
    start: number;
    end: number;
  };
  reactions: {
    emoji: string;
    userId: string;
    userEmail: string;
  }[];
}

/**
 * Comment on a draft or entity (extended version)
 */
export interface CommentExtended {
  id: string;
  entityType: 'skill' | 'workflow' | 'draft' | 'execution';
  entityId: string;

  // Parent comment for threads
  parentId?: string;

  // Content
  content: string;
  mentions?: string[]; // User IDs

  // Author
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;

  // Status
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;

  // Reactions
  reactions: Record<string, string[]>; // emoji -> user IDs

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Thread
  replyCount: number;
}

/**
 * Approval request
 */
export interface ApprovalRequest {
  id: string;
  draftId: string;
  requester: {
    id: string;
    email: string;
    name?: string;
  };
  approvers: {
    id: string;
    email: string;
    status: ApprovalStatus;
    decidedAt?: string;
    comment?: string;
  }[];
  status: ApprovalStatus;
  message?: string;
  requiredApprovals: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  approvalHistory: {
    approverId: string;
    approverEmail: string;
    decision: 'approved' | 'rejected' | 'changes_requested';
    comment?: string;
    timestamp: string;
  }[];
}

/**
 * Approval request (extended version)
 */
export interface ApprovalRequestExtended {
  id: string;
  type: 'skill_publish' | 'workflow_publish' | 'execution' | 'config_change' | 'budget_increase';

  // Target
  entityType: string;
  entityId: string;
  entityName: string;
  draftId?: string;

  // Requester
  requesterId: string;
  requesterName: string;
  reason?: string;

  // Approvers
  requiredApprovers: string[];
  approvedBy: ApprovalDecision[];
  rejectedBy?: ApprovalDecision;

  // Status
  status: ApprovalStatus;

  // Settings
  expiresAt?: string;
  autoApproveAfter?: number; // Hours

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ApprovalDecision {
  userId: string;
  userName: string;
  decision: 'approve' | 'reject';
  comment?: string;
  timestamp: string;
}

/**
 * Collaboration event for activity tracking
 */
export interface CollaborationEvent {
  type:
    | 'draft_created'
    | 'draft_updated'
    | 'draft_deleted'
    | 'draft_published'
    | 'collaborator_added'
    | 'comment_added'
    | 'comment_resolved'
    | 'approval_requested'
    | 'approval_granted'
    | 'approval_rejected'
    | 'changes_requested';
  entityType: 'skill' | 'workflow' | 'draft';
  entityId: string;
  actorId: string;
  actorEmail: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * Publish gate configuration
 */
export interface PublishGate {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  entityTypes?: ('skill' | 'workflow')[];
  conditions: PublishGateCondition[];
}

export interface PublishGateCondition {
  type:
    | 'approval_required'
    | 'no_unresolved_comments'
    | 'schema_valid'
    | 'tests_passed'
    | 'compliance_check'
    | 'custom';
  customMessage?: string;
}

/**
 * Publish gate configuration (extended version)
 */
export interface PublishGateExtended {
  id: string;
  name: string;
  description: string;
  enabled: boolean;

  // Scope
  scope: {
    entityTypes: ('skill' | 'workflow')[];
    categories?: string[];
  };

  // Requirements
  requirements: PublishRequirement[];

  // Approval settings
  approvalRequired: boolean;
  minApprovers: number;
  approverRoles?: string[];
}

export interface PublishRequirement {
  id: string;
  type: 'test_pass' | 'schema_valid' | 'policy_check' | 'review_complete' | 'custom';
  name: string;
  description: string;
  required: boolean;

  // For custom requirements
  validator?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED WORKFLOW CHAINING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Enhanced workflow step with retry and rollback
 */
export interface EnhancedWorkflowStep {
  id: string;
  skillId: string;
  name: string;
  description: string;

  // Input mappings
  inputMappings: Record<string, import('../storage/types').WorkflowInputSource>;
  outputKey: string;

  // Execution settings
  optional?: boolean;
  reviewRequired?: boolean;

  // Dependencies
  dependsOn?: string[];

  // Conditional execution
  condition?: import('../storage/types').StepCondition;

  // ═══════ NEW: Retry configuration ═══════
  retry?: RetryConfig;

  // ═══════ NEW: Timeout ═══════
  timeoutMs?: number;

  // ═══════ NEW: Rollback ═══════
  rollback?: RollbackConfig;

  // ═══════ NEW: A/B test slot ═══════
  abTestSlot?: string; // Experiment ID

  // ═══════ NEW: Schema validation ═══════
  inputSchema?: string;  // Schema ID
  outputSchema?: string; // Schema ID

  // ═══════ NEW: Cost controls ═══════
  maxCost?: number;
  budgetId?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffType: 'fixed' | 'exponential' | 'linear';
  initialDelayMs: number;
  maxDelayMs: number;
  retryableErrors?: string[]; // Error codes to retry on
}

export interface RollbackConfig {
  enabled: boolean;
  type: 'revert_output' | 'compensating_action' | 'notify';
  compensatingSkillId?: string;
  compensatingInputMappings?: Record<string, unknown>;
  notifyOnRollback?: string[]; // User IDs or emails
}

/**
 * Enhanced workflow with advanced features
 */
export interface EnhancedWorkflow extends Omit<import('../storage/types').Workflow, 'steps'> {
  steps: EnhancedWorkflowStep[];

  // ═══════ NEW: Shared context ═══════
  sharedContext?: SharedContextConfig;

  // ═══════ NEW: Error handling ═══════
  errorHandling?: WorkflowErrorHandling;

  // ═══════ NEW: Schema definitions ═══════
  inputSchema?: SchemaDefinition;
  outputSchema?: SchemaDefinition;

  // ═══════ NEW: Cost controls ═══════
  maxTotalCost?: number;
  budgetId?: string;

  // ═══════ NEW: Compliance ═══════
  policyIds?: string[];
  piiConfig?: PIIConfig;

  // ═══════ NEW: Observability ═══════
  latencyBudgetId?: string;
  alertRuleIds?: string[];

  // ═══════ NEW: Collaboration ═══════
  publishGateId?: string;

  // ═══════ NEW: Version control ═══════
  version: number;
  changelog?: string;
}

export interface SharedContextConfig {
  enabled: boolean;

  // Context that persists across steps
  persistentFields: string[];

  // Context accumulation
  accumulateOutputs: boolean;
  maxContextTokens?: number;

  // Summarization
  summarizeContext: boolean;
  summaryPrompt?: string;
}

export interface WorkflowErrorHandling {
  strategy: 'fail_fast' | 'continue_on_error' | 'retry_failed';

  // Global retry settings (can be overridden per step)
  defaultRetry?: RetryConfig;

  // Notification
  notifyOnError?: string[];
  webhookOnError?: string;

  // Cleanup
  cleanupOnFailure?: boolean;
  rollbackAll?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// REUSE GRAPH & DUPLICATION DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Skill/Workflow reuse tracking
 */
export interface ReuseGraph {
  nodes: ReuseNode[];
  edges: ReuseEdge[];

  // Statistics
  mostUsedSkills: { skillId: string; usageCount: number }[];
  duplicateClusters: DuplicateCluster[];
  orphanedSkills: string[];
}

export interface ReuseNode {
  id: string;
  type: 'skill' | 'workflow' | 'step';
  name: string;
  category?: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface ReuseEdge {
  source: string;
  target: string;
  type: 'contains' | 'uses' | 'similar_to';
  weight?: number;
}

export interface DuplicateCluster {
  id: string;
  type: 'skill' | 'prompt' | 'workflow';
  similarity: number; // 0.0 to 1.0
  members: DuplicateMember[];
  suggestedAction: 'merge' | 'refactor' | 'review';
  canonicalId?: string;
}

export interface DuplicateMember {
  entityId: string;
  entityName: string;
  similarity: number;
  diffFields?: string[];
}

export interface DuplicationAlert {
  id: string;
  type: 'exact_duplicate' | 'near_duplicate' | 'similar_prompt';
  severity: 'info' | 'warning' | 'high';

  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;

  similarity: number;
  message: string;
  suggestedAction: string;

  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STARTER KITS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Role-specific starter kit
 */
export interface StarterKit {
  id: string;
  roleId: string;
  roleName: string;
  description: string;

  // Included resources
  skills: StarterKitSkill[];
  workflows: StarterKitWorkflow[];
  testPayloads: StarterKitTestPayload[];

  // UI configuration
  uiHooks?: UIHook[];
  dashboardWidgets?: DashboardWidget[];

  // Documentation
  gettingStartedGuide: string;
  bestPractices?: string;

  // Metadata
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface StarterKitSkill {
  skillId: string;
  required: boolean;
  customization?: Record<string, unknown>;
}

export interface StarterKitWorkflow {
  workflowId: string;
  required: boolean;
  customization?: Record<string, unknown>;
}

export interface StarterKitTestPayload {
  skillId?: string;
  workflowId?: string;
  name: string;
  description: string;
  payload: Record<string, unknown>;
  expectedOutputPattern?: string;
}

export interface UIHook {
  id: string;
  type: 'button' | 'menu_item' | 'quick_action' | 'dashboard_widget';
  location: string;
  label: string;
  icon?: string;
  action: {
    type: 'run_skill' | 'run_workflow' | 'navigate' | 'custom';
    target?: string;
    params?: Record<string, unknown>;
  };
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'status';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  position: { row: number; col: number; width: number; height: number };
}
