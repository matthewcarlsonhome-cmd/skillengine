/**
 * Email Segmentation Storage
 *
 * Handles persistence of user email preferences, skill preferences,
 * and usage statistics. Uses Supabase when available, falls back
 * to localStorage for development.
 */

import { supabase } from '../supabase';
import type {
  UserEmailPreference,
  UserSkillPreferences,
  SkillUsageStat,
  EmailRecipient,
  EmailCampaign,
  SegmentationFilter,
} from './types';
import { buildEmailRecipient, filterRecipients, calculatePrimarySkills } from './filters';

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE KEYS (Development fallback)
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  emailPreferences: 'skillengine_email_preferences',
  skillPreferences: 'skillengine_skill_preferences',
  usageStats: 'skillengine_usage_stats',
  emailCampaigns: 'skillengine_email_campaigns',
};

// ═══════════════════════════════════════════════════════════════════════════
// USER EMAIL PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all user email preferences
 */
export async function getAllEmailPreferences(): Promise<UserEmailPreference[]> {
  // Try Supabase first
  if (supabase) {
    const { data, error } = await supabase
      .from('user_email_preferences')
      .select('*');

    if (!error && data) {
      return data.map(row => ({
        userId: row.user_id,
        email: row.email,
        marketingEmailOptIn: row.marketing_email_opt_in ?? false,
        optInUpdatedAt: row.opt_in_updated_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(STORAGE_KEYS.emailPreferences);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get email preference for a specific user
 */
export async function getEmailPreference(userId: string): Promise<UserEmailPreference | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('user_email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return {
        userId: data.user_id,
        email: data.email,
        marketingEmailOptIn: data.marketing_email_opt_in ?? false,
        optInUpdatedAt: data.opt_in_updated_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  }

  // Fallback
  const all = await getAllEmailPreferences();
  return all.find(p => p.userId === userId) || null;
}

/**
 * Update user's marketing opt-in status
 */
export async function updateMarketingOptIn(
  userId: string,
  email: string,
  optIn: boolean
): Promise<UserEmailPreference> {
  const now = new Date().toISOString();

  if (supabase) {
    const { data, error } = await supabase
      .from('user_email_preferences')
      .upsert({
        user_id: userId,
        email,
        marketing_email_opt_in: optIn,
        opt_in_updated_at: now,
        updated_at: now,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error && data) {
      return {
        userId: data.user_id,
        email: data.email,
        marketingEmailOptIn: data.marketing_email_opt_in,
        optInUpdatedAt: data.opt_in_updated_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  }

  // Fallback to localStorage
  const all = await getAllEmailPreferences();
  const existing = all.find(p => p.userId === userId);

  const updated: UserEmailPreference = {
    userId,
    email,
    marketingEmailOptIn: optIn,
    optInUpdatedAt: now,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  const newList = existing
    ? all.map(p => p.userId === userId ? updated : p)
    : [...all, updated];

  localStorage.setItem(STORAGE_KEYS.emailPreferences, JSON.stringify(newList));
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER SKILL PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all user skill preferences
 */
export async function getAllSkillPreferences(): Promise<UserSkillPreferences[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('user_skill_preferences')
      .select('*');

    if (!error && data) {
      return data.map(row => ({
        userId: row.user_id,
        favoriteSkillIds: row.favorite_skill_ids || [],
        primarySkillIds: row.primary_skill_ids || [],
        updatedAt: row.updated_at,
      }));
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.skillPreferences);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get skill preferences for a specific user
 */
export async function getSkillPreferences(userId: string): Promise<UserSkillPreferences | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('user_skill_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return {
        userId: data.user_id,
        favoriteSkillIds: data.favorite_skill_ids || [],
        primarySkillIds: data.primary_skill_ids || [],
        updatedAt: data.updated_at,
      };
    }
  }

  const all = await getAllSkillPreferences();
  return all.find(p => p.userId === userId) || null;
}

/**
 * Update user's favorite skills
 */
export async function updateFavoriteSkills(
  userId: string,
  favoriteSkillIds: string[]
): Promise<UserSkillPreferences> {
  const now = new Date().toISOString();

  if (supabase) {
    // Get current to preserve primary skills
    const current = await getSkillPreferences(userId);

    const { data, error } = await supabase
      .from('user_skill_preferences')
      .upsert({
        user_id: userId,
        favorite_skill_ids: favoriteSkillIds,
        primary_skill_ids: current?.primarySkillIds || [],
        updated_at: now,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error && data) {
      return {
        userId: data.user_id,
        favoriteSkillIds: data.favorite_skill_ids,
        primarySkillIds: data.primary_skill_ids,
        updatedAt: data.updated_at,
      };
    }
  }

  // Fallback
  const all = await getAllSkillPreferences();
  const existing = all.find(p => p.userId === userId);

  const updated: UserSkillPreferences = {
    userId,
    favoriteSkillIds,
    primarySkillIds: existing?.primarySkillIds || [],
    updatedAt: now,
  };

  const newList = existing
    ? all.map(p => p.userId === userId ? updated : p)
    : [...all, updated];

  localStorage.setItem(STORAGE_KEYS.skillPreferences, JSON.stringify(newList));
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL USAGE STATS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all usage stats
 */
export async function getAllUsageStats(): Promise<SkillUsageStat[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('skill_usage_stats')
      .select('*');

    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        skillId: row.skill_id,
        skillName: row.skill_name,
        runCount: row.run_count,
        lastUsedAt: row.last_used_at,
        periodStart: row.period_start,
        periodEnd: row.period_end,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.usageStats);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get usage stats for a specific user
 */
export async function getUserUsageStats(userId: string): Promise<SkillUsageStat[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('skill_usage_stats')
      .select('*')
      .eq('user_id', userId);

    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        skillId: row.skill_id,
        skillName: row.skill_name,
        runCount: row.run_count,
        lastUsedAt: row.last_used_at,
        periodStart: row.period_start,
        periodEnd: row.period_end,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }
  }

  const all = await getAllUsageStats();
  return all.filter(s => s.userId === userId);
}

/**
 * Record a skill usage (increment or create)
 */
export async function recordSkillUsage(
  userId: string,
  skillId: string,
  skillName: string
): Promise<void> {
  const now = new Date().toISOString();

  if (supabase) {
    // Use upsert with ON CONFLICT to increment
    const { error } = await supabase.rpc('increment_skill_usage', {
      p_user_id: userId,
      p_skill_id: skillId,
      p_skill_name: skillName,
    });

    if (!error) return;

    // Fallback to manual upsert
    const { data: existing } = await supabase
      .from('skill_usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .single();

    if (existing) {
      await supabase
        .from('skill_usage_stats')
        .update({
          run_count: existing.run_count + 1,
          last_used_at: now,
          updated_at: now,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('skill_usage_stats')
        .insert({
          user_id: userId,
          skill_id: skillId,
          skill_name: skillName,
          run_count: 1,
          last_used_at: now,
        });
    }
    return;
  }

  // Fallback to localStorage
  const all = await getAllUsageStats();
  const existing = all.find(s => s.userId === userId && s.skillId === skillId);

  if (existing) {
    existing.runCount += 1;
    existing.lastUsedAt = now;
    existing.updatedAt = now;
  } else {
    all.push({
      id: crypto.randomUUID(),
      userId,
      skillId,
      skillName,
      runCount: 1,
      lastUsedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  localStorage.setItem(STORAGE_KEYS.usageStats, JSON.stringify(all));

  // Update primary skills
  const userStats = all.filter(s => s.userId === userId);
  const primarySkillIds = calculatePrimarySkills(userStats);
  await updatePrimarySkills(userId, primarySkillIds);
}

/**
 * Update user's primary skills (auto-calculated from usage)
 */
async function updatePrimarySkills(
  userId: string,
  primarySkillIds: string[]
): Promise<void> {
  const now = new Date().toISOString();

  if (supabase) {
    await supabase
      .from('user_skill_preferences')
      .upsert({
        user_id: userId,
        primary_skill_ids: primarySkillIds,
        updated_at: now,
      }, { onConflict: 'user_id' });
    return;
  }

  // Fallback
  const all = await getAllSkillPreferences();
  const existing = all.find(p => p.userId === userId);

  if (existing) {
    existing.primarySkillIds = primarySkillIds;
    existing.updatedAt = now;
  } else {
    all.push({
      userId,
      favoriteSkillIds: [],
      primarySkillIds,
      updatedAt: now,
    });
  }

  localStorage.setItem(STORAGE_KEYS.skillPreferences, JSON.stringify(all));
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL RECIPIENTS (Combined Query)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all potential email recipients with their full data
 */
export async function getAllEmailRecipients(): Promise<EmailRecipient[]> {
  const [emailPrefs, skillPrefs, usageStats] = await Promise.all([
    getAllEmailPreferences(),
    getAllSkillPreferences(),
    getAllUsageStats(),
  ]);

  // Build maps for efficient lookup
  const skillPrefsMap = new Map(skillPrefs.map(p => [p.userId, p]));
  const usageStatsMap = new Map<string, SkillUsageStat[]>();

  for (const stat of usageStats) {
    const existing = usageStatsMap.get(stat.userId) || [];
    existing.push(stat);
    usageStatsMap.set(stat.userId, existing);
  }

  // Build recipients
  return emailPrefs.map(pref =>
    buildEmailRecipient(
      pref,
      skillPrefsMap.get(pref.userId) || null,
      usageStatsMap.get(pref.userId) || []
    )
  );
}

/**
 * Get filtered email recipients based on segmentation criteria
 */
export async function getFilteredRecipients(
  filter: SegmentationFilter
): Promise<EmailRecipient[]> {
  const [recipients, usageStats] = await Promise.all([
    getAllEmailRecipients(),
    getAllUsageStats(),
  ]);

  // Build usage stats map
  const usageStatsMap = new Map<string, SkillUsageStat[]>();
  for (const stat of usageStats) {
    const existing = usageStatsMap.get(stat.userId) || [];
    existing.push(stat);
    usageStatsMap.set(stat.userId, existing);
  }

  return filterRecipients(recipients, filter, usageStatsMap);
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL CAMPAIGNS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save an email campaign
 */
export async function saveEmailCampaign(campaign: EmailCampaign): Promise<void> {
  if (supabase) {
    await supabase
      .from('email_campaigns')
      .upsert({
        id: campaign.id,
        subject: campaign.subject,
        body: campaign.body,
        body_html: campaign.bodyHtml,
        recipient_count: campaign.recipientCount,
        recipient_filter: campaign.recipientFilter,
        status: campaign.status,
        scheduled_at: campaign.scheduledAt,
        sent_at: campaign.sentAt,
        created_at: campaign.createdAt,
        created_by: campaign.createdBy,
        updated_at: campaign.updatedAt,
      });
    return;
  }

  // Fallback
  const stored = localStorage.getItem(STORAGE_KEYS.emailCampaigns);
  const campaigns: EmailCampaign[] = stored ? JSON.parse(stored) : [];

  const index = campaigns.findIndex(c => c.id === campaign.id);
  if (index >= 0) {
    campaigns[index] = campaign;
  } else {
    campaigns.push(campaign);
  }

  localStorage.setItem(STORAGE_KEYS.emailCampaigns, JSON.stringify(campaigns));
}

/**
 * Get recent email campaigns
 */
export async function getRecentCampaigns(limit: number = 10): Promise<EmailCampaign[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        subject: row.subject,
        body: row.body,
        bodyHtml: row.body_html,
        recipientCount: row.recipient_count,
        recipientFilter: row.recipient_filter,
        status: row.status,
        scheduledAt: row.scheduled_at,
        sentAt: row.sent_at,
        createdAt: row.created_at,
        createdBy: row.created_by,
        updatedAt: row.updated_at,
      }));
    }
  }

  // Fallback
  const stored = localStorage.getItem(STORAGE_KEYS.emailCampaigns);
  const campaigns: EmailCampaign[] = stored ? JSON.parse(stored) : [];
  return campaigns
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
