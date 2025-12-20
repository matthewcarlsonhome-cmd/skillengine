/**
 * Zod Validation Schemas
 *
 * Runtime validation for user inputs and API responses.
 * Provides type-safe validation with detailed error messages.
 */

import { z } from 'zod';

// ============================================================================
// API Key Validation
// ============================================================================

export const ApiProviderSchema = z.enum(['gemini', 'claude', 'chatgpt']);
export type ApiProvider = z.infer<typeof ApiProviderSchema>;

export const ApiKeySchema = z.object({
  provider: ApiProviderSchema,
  key: z
    .string()
    .min(10, 'API key must be at least 10 characters')
    .max(500, 'API key exceeds maximum length'),
});

export const StoredKeysSchema = z.record(
  ApiProviderSchema,
  z.string().optional()
);

// ============================================================================
// User Profile Validation
// ============================================================================

export const UserProfileSchema = z.object({
  fullName: z.string().max(200, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone number too long').optional(),
  professionalTitle: z.string().max(200, 'Title too long').optional(),
  linkedinUrl: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  resumeText: z.string().max(100000, 'Resume text too long').optional(),
  skills: z.array(z.string().max(100)).max(100, 'Too many skills').optional(),
  experience: z.string().max(50000, 'Experience text too long').optional(),
  education: z.string().max(20000, 'Education text too long').optional(),
  targetRoles: z.array(z.string().max(200)).max(20).optional(),
  targetCompanies: z.array(z.string().max(200)).max(50).optional(),
  salaryExpectation: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  remotePreference: z
    .enum(['remote', 'hybrid', 'onsite', 'flexible', ''])
    .optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ============================================================================
// Skill Input Validation
// ============================================================================

export const SkillInputSchema = z.object({
  id: z.string().min(1, 'Skill ID is required'),
  inputs: z.record(z.string(), z.unknown()),
});

export const FormInputValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
  z.undefined(),
]);

export const FormInputsSchema = z.record(z.string(), FormInputValueSchema);

// ============================================================================
// Job Description Analysis
// ============================================================================

export const JobDescriptionSchema = z.object({
  rawText: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(50000, 'Job description exceeds maximum length'),
  companyName: z.string().max(200).optional(),
  roleTitle: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
});

export const AnalyzedJobSchema = z.object({
  role: z.object({
    title: z.string(),
    level: z.string(),
    department: z.string().optional(),
  }),
  company: z.object({
    name: z.string(),
    industry: z.string().optional(),
    size: z.string().optional(),
  }),
  requirements: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    experience: z.string().optional(),
    education: z.string().optional(),
  }),
  keywords: z.array(z.string()),
});

export type AnalyzedJob = z.infer<typeof AnalyzedJobSchema>;

// ============================================================================
// Workspace Validation
// ============================================================================

export const WorkspaceSchema = z.object({
  id: z.string().uuid('Invalid workspace ID'),
  name: z.string().min(1, 'Workspace name required').max(200),
  createdAt: z.string().datetime().or(z.number()),
  updatedAt: z.string().datetime().or(z.number()),
  jdAnalysis: AnalyzedJobSchema,
  selectedSkillIds: z.array(z.string()),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

// ============================================================================
// Community Skill Validation
// ============================================================================

export const CommunitySkillSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  systemPrompt: z.string().min(50, 'System prompt must be at least 50 characters').max(50000),
  category: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed'),
  inputs: z.array(
    z.object({
      name: z.string().min(1).max(100),
      label: z.string().min(1).max(200),
      type: z.enum(['text', 'textarea', 'select', 'number', 'checkbox']),
      required: z.boolean().optional(),
      placeholder: z.string().max(500).optional(),
      options: z.array(z.string()).optional(),
    })
  ),
  isPublic: z.boolean().default(true),
});

export type CommunitySkill = z.infer<typeof CommunitySkillSchema>;

// ============================================================================
// Billing & Credits Validation
// ============================================================================

export const CreditTransactionSchema = z.object({
  amount: z.number().int().positive('Amount must be positive'),
  type: z.enum(['purchase', 'usage', 'refund', 'bonus']),
  description: z.string().max(500).optional(),
});

// ============================================================================
// URL & Security Validation
// ============================================================================

export const SafeUrlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'URL must use http or https protocol' }
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        // Block localhost and private IPs to prevent SSRF
        const hostname = parsed.hostname.toLowerCase();
        const blockedPatterns = [
          'localhost',
          '127.0.0.1',
          '0.0.0.0',
          '::1',
          '10.',
          '172.16.',
          '172.17.',
          '172.18.',
          '172.19.',
          '172.20.',
          '172.21.',
          '172.22.',
          '172.23.',
          '172.24.',
          '172.25.',
          '172.26.',
          '172.27.',
          '172.28.',
          '172.29.',
          '172.30.',
          '172.31.',
          '192.168.',
          '169.254.',
        ];
        return !blockedPatterns.some(
          (pattern) => hostname === pattern || hostname.startsWith(pattern)
        );
      } catch {
        return false;
      }
    },
    { message: 'URL points to a blocked address' }
  );

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate data against a schema with detailed error reporting
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Handle Zod v4 error format (issues array)
  const errors: string[] = [];
  if (result.error && 'issues' in result.error) {
    for (const issue of result.error.issues) {
      const path = issue.path?.join('.') || '';
      errors.push(path ? `${path}: ${issue.message}` : issue.message);
    }
  } else if (result.error && 'errors' in result.error) {
    // Zod v3 compatibility
    for (const err of (result.error as { errors: Array<{ path: (string | number)[]; message: string }> }).errors) {
      const path = err.path.join('.');
      errors.push(path ? `${path}: ${err.message}` : err.message);
    }
  } else {
    errors.push('Validation failed');
  }

  return { success: false, errors };
}

/**
 * Validate and throw if invalid
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: string[] = [];
    if (result.error && 'issues' in result.error) {
      for (const issue of result.error.issues) {
        const path = issue.path?.join('.') || '';
        errors.push(path ? `${path}: ${issue.message}` : issue.message);
      }
    } else {
      errors.push('Unknown validation error');
    }
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return result.data;
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  return SafeUrlSchema.safeParse(url).success;
}
