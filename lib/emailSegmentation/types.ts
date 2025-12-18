/**
 * Email Segmentation Types
 *
 * TypeScript types for user segmentation, email targeting,
 * and skill usage tracking in the Admin Control Panel.
 */

// ═══════════════════════════════════════════════════════════════════════════
// USER PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User's email marketing preferences
 */
export interface UserEmailPreference {
  userId: string;
  email: string;
  marketingEmailOptIn: boolean;
  optInUpdatedAt: string | null; // ISO date
  createdAt: string;
  updatedAt: string;
}

/**
 * User's skill preferences - favorites and primary skills
 */
export interface UserSkillPreferences {
  userId: string;
  favoriteSkillIds: string[]; // Ordered list of favorite skill IDs
  primarySkillIds: string[]; // Top 3 most-used skills (auto-calculated)
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL USAGE TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Individual skill usage statistic
 */
export interface SkillUsageStat {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  runCount: number;
  lastUsedAt: string; // ISO date
  periodStart?: string; // For rollups (e.g., week/month start)
  periodEnd?: string; // For rollups (e.g., week/month end)
  createdAt: string;
  updatedAt: string;
}

/**
 * Aggregated usage stats for a user
 */
export interface UserUsageStats {
  userId: string;
  totalRuns: number;
  skillBreakdown: SkillUsageBreakdown[];
  lastActiveAt: string | null;
  periodStart?: string;
  periodEnd?: string;
}

/**
 * Skill usage breakdown within a period
 */
export interface SkillUsageBreakdown {
  skillId: string;
  skillName: string;
  runCount: number;
  percentage: number; // Percentage of total runs
  lastUsedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL RECIPIENTS & TARGETING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Email recipient with relevant metadata for targeting
 */
export interface EmailRecipient {
  userId: string;
  email: string;
  displayName?: string;
  marketingEmailOptIn: boolean;
  favoriteSkillIds: string[];
  primarySkillIds: string[];
  totalRuns: number;
  lastActiveAt: string | null;
  matchedSkills?: string[]; // Skills that matched the filter criteria
}

/**
 * Segmentation filter criteria
 */
export interface SegmentationFilter {
  // Opt-in filter
  requireOptIn: boolean;

  // Skill-based filters
  skillIds?: string[]; // Filter by users who have these as favorites/primary
  skillMatchMode: 'any' | 'all'; // Match any or all selected skills
  includeAsFavorite: boolean; // Include users with skill as favorite
  includeAsPrimary: boolean; // Include users with skill as primary

  // Usage-based filters
  minRunsInPeriod?: number; // Minimum runs in the period
  periodDays: number; // Period for usage calculation (e.g., 30 days)

  // Activity filters
  activeInLastDays?: number; // Users active in last N days
}

/**
 * Default segmentation filter values
 */
export const DEFAULT_SEGMENTATION_FILTER: SegmentationFilter = {
  requireOptIn: true,
  skillMatchMode: 'any',
  includeAsFavorite: true,
  includeAsPrimary: true,
  periodDays: 30,
};

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Email campaign/message
 */
export interface EmailCampaign {
  id: string;
  subject: string;
  body: string; // Markdown content
  bodyHtml?: string; // Rendered HTML
  recipientCount: number;
  recipientFilter: SegmentationFilter;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string; // Admin user ID
  updatedAt: string;
}

/**
 * Email send request payload
 */
export interface EmailSendRequest {
  subject: string;
  body: string;
  bodyHtml?: string;
  recipientIds: string[];
  fromName?: string;
  replyTo?: string;
}

/**
 * Email send response
 */
export interface EmailSendResponse {
  success: boolean;
  campaignId?: string;
  recipientCount: number;
  failedRecipients?: string[];
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGGING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Admin action types for audit logging
 */
export type AdminActionType =
  | 'email_segment_filter'
  | 'email_preview'
  | 'email_send'
  | 'subscription_toggle'
  | 'usage_stats_view';

/**
 * Audit log entry
 */
export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  adminEmail: string;
  actionType: AdminActionType;
  actionDetails: Record<string, unknown>;
  targetUserIds?: string[];
  recipientCount?: number;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Segment preview response
 */
export interface SegmentPreviewResponse {
  recipients: EmailRecipient[];
  totalCount: number;
  filter: SegmentationFilter;
  generatedAt: string;
}
