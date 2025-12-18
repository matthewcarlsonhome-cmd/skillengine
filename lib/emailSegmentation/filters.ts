/**
 * Email Segmentation Filters
 *
 * Core filtering logic for user segmentation based on
 * skill preferences, usage stats, and email opt-in status.
 */

import type {
  EmailRecipient,
  SegmentationFilter,
  UserEmailPreference,
  UserSkillPreferences,
  SkillUsageStat,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// FILTER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a user passes the opt-in filter
 */
export function passesOptInFilter(
  recipient: EmailRecipient,
  filter: SegmentationFilter
): boolean {
  if (!filter.requireOptIn) {
    return true;
  }
  return recipient.marketingEmailOptIn === true;
}

/**
 * Check if a user passes the skill filter
 */
export function passesSkillFilter(
  recipient: EmailRecipient,
  filter: SegmentationFilter
): boolean {
  // No skill filter applied
  if (!filter.skillIds || filter.skillIds.length === 0) {
    return true;
  }

  // Build set of user's relevant skills based on filter settings
  const userSkills = new Set<string>();

  if (filter.includeAsFavorite) {
    recipient.favoriteSkillIds.forEach(id => userSkills.add(id));
  }

  if (filter.includeAsPrimary) {
    recipient.primarySkillIds.forEach(id => userSkills.add(id));
  }

  // Check skill match mode
  if (filter.skillMatchMode === 'all') {
    // User must have ALL selected skills
    return filter.skillIds.every(skillId => userSkills.has(skillId));
  } else {
    // User must have ANY of the selected skills
    return filter.skillIds.some(skillId => userSkills.has(skillId));
  }
}

/**
 * Check if a user passes the usage filter
 */
export function passesUsageFilter(
  recipient: EmailRecipient,
  filter: SegmentationFilter,
  usageStats: Map<string, SkillUsageStat[]>
): boolean {
  // No minimum runs filter
  if (!filter.minRunsInPeriod || filter.minRunsInPeriod <= 0) {
    return true;
  }

  const userStats = usageStats.get(recipient.userId);
  if (!userStats || userStats.length === 0) {
    return false; // No usage data means they don't meet threshold
  }

  // Calculate period cutoff
  const periodCutoff = new Date();
  periodCutoff.setDate(periodCutoff.getDate() - filter.periodDays);
  const cutoffTimestamp = periodCutoff.toISOString();

  // Sum runs within the period
  let totalRunsInPeriod = 0;

  // If skill filter is active, only count runs for those skills
  const targetSkillIds = filter.skillIds && filter.skillIds.length > 0
    ? new Set(filter.skillIds)
    : null;

  for (const stat of userStats) {
    // Check if stat is within period
    if (stat.lastUsedAt < cutoffTimestamp) {
      continue;
    }

    // Check if we're filtering by specific skills
    if (targetSkillIds && !targetSkillIds.has(stat.skillId)) {
      continue;
    }

    totalRunsInPeriod += stat.runCount;
  }

  return totalRunsInPeriod >= filter.minRunsInPeriod;
}

/**
 * Check if a user passes the activity filter
 */
export function passesActivityFilter(
  recipient: EmailRecipient,
  filter: SegmentationFilter
): boolean {
  if (!filter.activeInLastDays || filter.activeInLastDays <= 0) {
    return true;
  }

  if (!recipient.lastActiveAt) {
    return false;
  }

  const activityCutoff = new Date();
  activityCutoff.setDate(activityCutoff.getDate() - filter.activeInLastDays);

  return new Date(recipient.lastActiveAt) >= activityCutoff;
}

/**
 * Apply all filters to a list of recipients
 */
export function filterRecipients(
  recipients: EmailRecipient[],
  filter: SegmentationFilter,
  usageStats: Map<string, SkillUsageStat[]>
): EmailRecipient[] {
  return recipients.filter(recipient => {
    // Apply all filters
    if (!passesOptInFilter(recipient, filter)) return false;
    if (!passesSkillFilter(recipient, filter)) return false;
    if (!passesUsageFilter(recipient, filter, usageStats)) return false;
    if (!passesActivityFilter(recipient, filter)) return false;

    return true;
  }).map(recipient => {
    // Add matched skills info
    if (filter.skillIds && filter.skillIds.length > 0) {
      const userSkills = new Set([
        ...(filter.includeAsFavorite ? recipient.favoriteSkillIds : []),
        ...(filter.includeAsPrimary ? recipient.primarySkillIds : []),
      ]);

      recipient.matchedSkills = filter.skillIds.filter(id => userSkills.has(id));
    }

    return recipient;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get skill IDs that appear most frequently in a user's usage
 */
export function calculatePrimarySkills(
  usageStats: SkillUsageStat[],
  topN: number = 3
): string[] {
  // Sort by run count descending
  const sorted = [...usageStats].sort((a, b) => b.runCount - a.runCount);

  // Take top N
  return sorted.slice(0, topN).map(stat => stat.skillId);
}

/**
 * Merge user data from multiple sources into EmailRecipient
 */
export function buildEmailRecipient(
  preference: UserEmailPreference,
  skillPrefs: UserSkillPreferences | null,
  usageStats: SkillUsageStat[]
): EmailRecipient {
  // Calculate total runs and last active
  let totalRuns = 0;
  let lastActiveAt: string | null = null;

  for (const stat of usageStats) {
    totalRuns += stat.runCount;
    if (!lastActiveAt || stat.lastUsedAt > lastActiveAt) {
      lastActiveAt = stat.lastUsedAt;
    }
  }

  return {
    userId: preference.userId,
    email: preference.email,
    marketingEmailOptIn: preference.marketingEmailOptIn,
    favoriteSkillIds: skillPrefs?.favoriteSkillIds || [],
    primarySkillIds: skillPrefs?.primarySkillIds || calculatePrimarySkills(usageStats),
    totalRuns,
    lastActiveAt,
  };
}

/**
 * Generate a human-readable description of a filter
 */
export function describeFilter(filter: SegmentationFilter): string {
  const parts: string[] = [];

  if (filter.requireOptIn) {
    parts.push('opted-in users');
  } else {
    parts.push('all users');
  }

  if (filter.skillIds && filter.skillIds.length > 0) {
    const skillText = filter.skillMatchMode === 'all' ? 'all of' : 'any of';
    const sourceText = [];
    if (filter.includeAsFavorite) sourceText.push('favorites');
    if (filter.includeAsPrimary) sourceText.push('primary');
    parts.push(`with ${skillText} ${filter.skillIds.length} selected skill(s) in ${sourceText.join(' or ')}`);
  }

  if (filter.minRunsInPeriod && filter.minRunsInPeriod > 0) {
    parts.push(`≥${filter.minRunsInPeriod} runs in last ${filter.periodDays} days`);
  }

  if (filter.activeInLastDays && filter.activeInLastDays > 0) {
    parts.push(`active in last ${filter.activeInLastDays} days`);
  }

  return parts.join(', ');
}

/**
 * Validate a segmentation filter
 */
export function validateFilter(filter: SegmentationFilter): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (filter.periodDays < 1) {
    errors.push('Period days must be at least 1');
  }

  if (filter.periodDays > 365) {
    errors.push('Period days cannot exceed 365');
  }

  if (filter.minRunsInPeriod !== undefined && filter.minRunsInPeriod < 0) {
    errors.push('Minimum runs cannot be negative');
  }

  if (filter.activeInLastDays !== undefined && filter.activeInLastDays < 0) {
    errors.push('Active days cannot be negative');
  }

  if (filter.skillIds && filter.skillIds.length > 0) {
    if (!filter.includeAsFavorite && !filter.includeAsPrimary) {
      errors.push('Must include at least one skill source (favorites or primary)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
