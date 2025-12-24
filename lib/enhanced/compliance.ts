/**
 * Compliance Service
 *
 * Provides policy checks, audit logging, and PII detection/redaction
 * for skills and workflows.
 */

import { logger } from '../logger';
import type {
  CompliancePolicy,
  PolicyRule,
  PolicyCheckResult,
  PolicyViolation,
  PolicyWarning,
  AuditLogEntry,
  AuditAction,
  PIIConfig,
  PIIType,
  PIIPattern,
  PIIDetectionResult,
  PIIDetection,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// POLICY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const policies: Map<string, CompliancePolicy> = new Map();

/**
 * Create or update a compliance policy
 */
export function setPolicy(policy: CompliancePolicy): void {
  policies.set(policy.id, policy);
}

/**
 * Get policy by ID
 */
export function getPolicy(policyId: string): CompliancePolicy | null {
  return policies.get(policyId) || null;
}

/**
 * Get all policies
 */
export function getAllPolicies(): CompliancePolicy[] {
  return Array.from(policies.values());
}

/**
 * Get policies applicable to a skill or workflow
 */
export function getApplicablePolicies(params: {
  skillId?: string;
  workflowId?: string;
  userRole?: string;
}): CompliancePolicy[] {
  return Array.from(policies.values()).filter(policy => {
    if (!policy.enabled) return false;

    // Check skill scope
    if (params.skillId && policy.scope.skills) {
      const matches = policy.scope.skills.includes('*') ||
        policy.scope.skills.includes(params.skillId);
      if (!matches) return false;
    }

    // Check workflow scope
    if (params.workflowId && policy.scope.workflows) {
      const matches = policy.scope.workflows.includes('*') ||
        policy.scope.workflows.includes(params.workflowId);
      if (!matches) return false;
    }

    // Check role scope
    if (params.userRole && policy.scope.roles) {
      const matches = policy.scope.roles.includes(params.userRole);
      if (!matches) return false;
    }

    return true;
  });
}

/**
 * Delete a policy
 */
export function deletePolicy(policyId: string): boolean {
  return policies.delete(policyId);
}

// ═══════════════════════════════════════════════════════════════════════════
// POLICY CHECKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check inputs/outputs against applicable policies
 */
export function checkPolicies(params: {
  skillId?: string;
  workflowId?: string;
  userRole?: string;
  inputs: Record<string, unknown>;
  outputs?: string;
}): PolicyCheckResult[] {
  const applicablePolicies = getApplicablePolicies({
    skillId: params.skillId,
    workflowId: params.workflowId,
    userRole: params.userRole,
  });

  return applicablePolicies.map(policy => checkPolicy(policy, params.inputs, params.outputs));
}

/**
 * Check a single policy
 */
function checkPolicy(
  policy: CompliancePolicy,
  inputs: Record<string, unknown>,
  outputs?: string
): PolicyCheckResult {
  const violations: PolicyViolation[] = [];
  const warnings: PolicyWarning[] = [];

  for (const rule of policy.rules) {
    const result = evaluateRule(rule, inputs, outputs);

    if (result.violated) {
      if (rule.action === 'warn') {
        warnings.push({
          ruleId: rule.id,
          message: result.message,
          suggestion: result.suggestion,
        });
      } else {
        violations.push({
          ruleId: rule.id,
          ruleType: rule.type,
          message: result.message,
          path: result.path,
          action: mapRuleActionToViolationAction(rule.action),
          originalValue: result.originalValue,
          redactedValue: result.redactedValue,
        });
      }
    }
  }

  return {
    policyId: policy.id,
    policyName: policy.name,
    passed: violations.length === 0,
    violations,
    warnings,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Evaluate a single policy rule
 */
function evaluateRule(
  rule: PolicyRule,
  inputs: Record<string, unknown>,
  outputs?: string
): {
  violated: boolean;
  message: string;
  path?: string;
  originalValue?: string;
  redactedValue?: string;
  suggestion?: string;
} {
  switch (rule.type) {
    case 'pii_check':
      return evaluatePIIRule(rule, inputs, outputs);

    case 'content_filter':
      return evaluateContentFilterRule(rule, inputs, outputs);

    case 'rate_limit':
      return { violated: false, message: '' }; // Handled separately

    case 'cost_limit':
      return { violated: false, message: '' }; // Handled separately

    case 'approval_required':
      return {
        violated: true,
        message: rule.message,
        suggestion: 'This action requires approval before proceeding.',
      };

    default:
      return { violated: false, message: '' };
  }
}

/**
 * Evaluate PII detection rule
 */
function evaluatePIIRule(
  rule: PolicyRule,
  inputs: Record<string, unknown>,
  outputs?: string
): {
  violated: boolean;
  message: string;
  path?: string;
  originalValue?: string;
  redactedValue?: string;
} {
  const textsToCheck: { path: string; text: string }[] = [];

  // Collect input texts
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      textsToCheck.push({ path: `inputs.${key}`, text: value });
    }
  }

  // Check outputs
  if (outputs) {
    textsToCheck.push({ path: 'outputs', text: outputs });
  }

  // Detect PII
  for (const { path, text } of textsToCheck) {
    const detection = detectPII(text);
    if (detection.found && detection.detections.length > 0) {
      const firstDetection = detection.detections[0];
      return {
        violated: true,
        message: `${rule.message}. Found ${firstDetection.type} in ${path}`,
        path,
        originalValue: firstDetection.value,
        redactedValue: firstDetection.redactedValue,
      };
    }
  }

  return { violated: false, message: '' };
}

/**
 * Evaluate content filter rule
 */
function evaluateContentFilterRule(
  rule: PolicyRule,
  inputs: Record<string, unknown>,
  outputs?: string
): {
  violated: boolean;
  message: string;
  path?: string;
} {
  const blockedPatterns = (rule.metadata?.patterns as string[]) || [];

  // Check inputs
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      for (const pattern of blockedPatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(value)) {
          return {
            violated: true,
            message: `${rule.message}. Blocked content found in inputs.${key}`,
            path: `inputs.${key}`,
          };
        }
      }
    }
  }

  // Check outputs
  if (outputs) {
    for (const pattern of blockedPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(outputs)) {
        return {
          violated: true,
          message: `${rule.message}. Blocked content found in outputs`,
          path: 'outputs',
        };
      }
    }
  }

  return { violated: false, message: '' };
}

/**
 * Map rule action to violation action
 */
function mapRuleActionToViolationAction(
  action: PolicyRule['action']
): PolicyViolation['action'] {
  switch (action) {
    case 'block':
      return 'blocked';
    case 'redact':
      return 'redacted';
    default:
      return 'flagged';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PII DETECTION & REDACTION
// ═══════════════════════════════════════════════════════════════════════════

let piiConfig: PIIConfig = {
  enabled: true,
  detectOnInput: true,
  detectOnOutput: true,
  redactionMode: 'mask',
  piiTypes: ['email', 'phone', 'ssn', 'credit_card'],
  customPatterns: [],
  excludeFields: [],
  excludeSkills: [],
};

// PII detection patterns
const PII_PATTERNS: Record<PIIType, RegExp> = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  credit_card: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  address: /\b\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct)\b/gi,
  name: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // Simple name pattern - would need improvement
  date_of_birth: /\b(?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g,
  ip_address: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  driver_license: /\b[A-Z]{1,2}\d{5,8}\b/g,
  bank_account: /\b\d{8,17}\b/g, // Basic pattern
  medical_record: /\b(?:MRN|MR#|Patient ID)[:\s]?\d{6,10}\b/gi,
};

/**
 * Configure PII settings
 */
export function setPIIConfig(config: Partial<PIIConfig>): void {
  piiConfig = { ...piiConfig, ...config };
}

/**
 * Get current PII config
 */
export function getPIIConfig(): PIIConfig {
  return { ...piiConfig };
}

/**
 * Detect PII in text
 */
export function detectPII(text: string, customConfig?: Partial<PIIConfig>): PIIDetectionResult {
  const config = { ...piiConfig, ...customConfig };

  if (!config.enabled) {
    return { found: false, detections: [] };
  }

  const detections: PIIDetection[] = [];

  // Check built-in patterns
  for (const piiType of config.piiTypes) {
    const pattern = PII_PATTERNS[piiType];
    if (!pattern) continue;

    // Reset regex state
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      detections.push({
        type: piiType,
        value: match[0],
        redactedValue: redactValue(match[0], config.redactionMode),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.85, // Default confidence
      });
    }
  }

  // Check custom patterns
  for (const customPattern of config.customPatterns || []) {
    const regex = new RegExp(customPattern.pattern, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      detections.push({
        type: 'custom',
        value: match[0],
        redactedValue: customPattern.redactionLabel || redactValue(match[0], config.redactionMode),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.9,
      });
    }
  }

  // Sort by start index and remove overlaps
  detections.sort((a, b) => a.startIndex - b.startIndex);
  const uniqueDetections = removeOverlappingDetections(detections);

  // Generate redacted text if detections found
  let redactedText: string | undefined;
  if (uniqueDetections.length > 0) {
    redactedText = applyRedactions(text, uniqueDetections);
  }

  return {
    found: uniqueDetections.length > 0,
    detections: uniqueDetections,
    redactedText,
  };
}

/**
 * Redact PII from text
 */
export function redactPII(text: string, customConfig?: Partial<PIIConfig>): string {
  const result = detectPII(text, customConfig);
  return result.redactedText || text;
}

/**
 * Redact a single value based on mode
 */
function redactValue(value: string, mode: PIIConfig['redactionMode']): string {
  switch (mode) {
    case 'mask':
      return '*'.repeat(value.length);
    case 'hash':
      return `[HASH:${simpleHash(value)}]`;
    case 'remove':
      return '';
    case 'placeholder':
      return '[REDACTED]';
    default:
      return '[REDACTED]';
  }
}

/**
 * Simple hash function for redaction
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Remove overlapping detections, keeping higher confidence
 */
function removeOverlappingDetections(detections: PIIDetection[]): PIIDetection[] {
  const result: PIIDetection[] = [];

  for (const detection of detections) {
    const overlaps = result.some(
      existing =>
        (detection.startIndex >= existing.startIndex && detection.startIndex < existing.endIndex) ||
        (detection.endIndex > existing.startIndex && detection.endIndex <= existing.endIndex)
    );

    if (!overlaps) {
      result.push(detection);
    }
  }

  return result;
}

/**
 * Apply redactions to text
 */
function applyRedactions(text: string, detections: PIIDetection[]): string {
  // Sort by start index descending to apply from end to start
  const sorted = [...detections].sort((a, b) => b.startIndex - a.startIndex);

  let result = text;
  for (const detection of sorted) {
    result =
      result.substring(0, detection.startIndex) +
      detection.redactedValue +
      result.substring(detection.endIndex);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGGING
// ═══════════════════════════════════════════════════════════════════════════

const auditLog: AuditLogEntry[] = [];
const MAX_AUDIT_ENTRIES = 10000;
const auditCallbacks: ((entry: AuditLogEntry) => void)[] = [];

/**
 * Log an audit entry
 */
export function logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  auditLog.unshift(fullEntry);

  // Trim old entries
  if (auditLog.length > MAX_AUDIT_ENTRIES) {
    auditLog.pop();
  }

  // Notify callbacks
  auditCallbacks.forEach(cb => {
    try {
      cb(fullEntry);
    } catch (e) {
      logger.error('Audit callback error', { error: e instanceof Error ? e.message : String(e) });
    }
  });

  return fullEntry;
}

/**
 * Get audit log entries
 */
export function getAuditLog(params?: {
  actorId?: string;
  actorEmail?: string;
  resourceType?: AuditLogEntry['resourceType'];
  resourceId?: string;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): AuditLogEntry[] {
  let entries = [...auditLog];

  if (params?.actorId) {
    entries = entries.filter(e => e.actorId === params.actorId);
  }
  if (params?.actorEmail) {
    entries = entries.filter(e => e.actorEmail === params.actorEmail);
  }
  if (params?.resourceType) {
    entries = entries.filter(e => e.resourceType === params.resourceType);
  }
  if (params?.resourceId) {
    entries = entries.filter(e => e.resourceId === params.resourceId);
  }
  if (params?.action) {
    entries = entries.filter(e => e.action === params.action);
  }
  if (params?.startDate) {
    entries = entries.filter(e => e.timestamp >= params.startDate!);
  }
  if (params?.endDate) {
    entries = entries.filter(e => e.timestamp <= params.endDate!);
  }

  return entries.slice(0, params?.limit || 100);
}

/**
 * Register audit callback
 */
export function onAuditLog(callback: (entry: AuditLogEntry) => void): () => void {
  auditCallbacks.push(callback);
  return () => {
    const index = auditCallbacks.indexOf(callback);
    if (index >= 0) auditCallbacks.splice(index, 1);
  };
}

/**
 * Export audit log to JSON
 */
export function exportAuditLog(params?: {
  startDate?: string;
  endDate?: string;
}): string {
  const entries = getAuditLog({
    startDate: params?.startDate,
    endDate: params?.endDate,
    limit: MAX_AUDIT_ENTRIES,
  });

  return JSON.stringify(entries, null, 2);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT POLICIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize default compliance policies
 */
export function initializeDefaultPolicies(): void {
  // PII Detection Policy
  setPolicy({
    id: 'default-pii-policy',
    name: 'Default PII Detection',
    description: 'Detects and warns about PII in inputs and outputs',
    version: '1.0.0',
    enabled: true,
    scope: {
      skills: ['*'],
      workflows: ['*'],
    },
    rules: [
      {
        id: 'pii-detection',
        type: 'pii_check',
        condition: '*',
        action: 'warn',
        message: 'Potential PII detected',
      },
    ],
    enforcement: 'warn',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  });

  // Content Filter Policy
  setPolicy({
    id: 'default-content-filter',
    name: 'Default Content Filter',
    description: 'Filters potentially inappropriate content',
    version: '1.0.0',
    enabled: false, // Disabled by default
    scope: {
      skills: ['*'],
      workflows: ['*'],
    },
    rules: [
      {
        id: 'profanity-filter',
        type: 'content_filter',
        condition: '*',
        action: 'block',
        message: 'Content policy violation detected',
        metadata: {
          patterns: [], // Add patterns as needed
        },
      },
    ],
    enforcement: 'block',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  });
}

// Initialize defaults
initializeDefaultPolicies();
