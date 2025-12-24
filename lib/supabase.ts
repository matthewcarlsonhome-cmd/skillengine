// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { logger } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Supabase environment variables not configured. Community features will be disabled.');
}

// Create Supabase client (will be null if not configured)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// ═══════════════════════════════════════════════════════════════════════════
// REDIRECT URL VALIDATION (Prevents Open Redirect Attacks)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Allowed redirect hosts for OAuth callbacks
 * This prevents open redirect vulnerabilities by only allowing
 * redirects to known, trusted domains.
 */
const ALLOWED_REDIRECT_HOSTS = [
  'localhost',
  '127.0.0.1',
  'skillengine.netlify.app',
  // Add your production domain here
];

/**
 * Validate that a redirect URL is safe
 * Prevents open redirect attacks by ensuring the URL is on an allowed host
 */
function validateRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Check against allowed hosts
    const hostname = parsed.hostname.toLowerCase();

    // Allow localhost and 127.0.0.1 for development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    // Check if hostname matches or is a subdomain of allowed hosts
    for (const allowed of ALLOWED_REDIRECT_HOSTS) {
      if (hostname === allowed || hostname.endsWith(`.${allowed}`)) {
        return true;
      }
    }

    // Also allow the current origin (handles dynamic Netlify preview URLs)
    if (typeof window !== 'undefined') {
      const currentOrigin = new URL(window.location.origin);
      if (hostname === currentOrigin.hostname) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Get a safe redirect URL for OAuth
 * Falls back to a safe default if the current origin is not allowed
 */
function getSafeRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return '/auth/callback';
  }

  const redirectUrl = `${window.location.origin}/auth/callback`;

  if (validateRedirectUrl(redirectUrl)) {
    return redirectUrl;
  }

  // If current origin is not allowed, log a warning
  logger.warn('Current origin not in allowed redirect hosts', { origin: window.location.origin });

  // Return just the path - Supabase will use the configured site URL
  return '/auth/callback';
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured');

  const redirectTo = getSafeRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Community Skills API
export interface CommunitySkill {
  id: string;
  created_by: string | null;
  name: string;
  description: string | null;
  long_description: string | null;
  category: string;
  estimated_time_saved: string | null;
  role_title: string | null;
  role_department: string | null;
  role_level: string | null;
  system_instruction: string;
  user_prompt_template: string;
  output_format: string;
  recommended_model: string;
  max_tokens: number;
  temperature: number;
  inputs: unknown[];
  use_count: number;
  rating_sum: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  // Joined data
  creator_name?: string;
  tags?: string[];
}

export async function fetchCommunitySkills(options?: {
  roleTitle?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<CommunitySkill[]> {
  if (!supabase) return [];

  let query = supabase
    .from('skill_templates')
    .select('*')
    .eq('is_public', true)
    .order('use_count', { ascending: false });

  // Security: Escape special characters in search inputs to prevent filter injection
  const escapePostgresLike = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/%/g, '\\%')    // Escape wildcards
      .replace(/_/g, '\\_')    // Escape single-char wildcards
      .replace(/,/g, '')       // Remove commas (could inject filter operators)
      .replace(/\./g, '')      // Remove dots (could inject operators)
      .substring(0, 200);       // Limit length
  };

  if (options?.roleTitle) {
    const escapedRole = escapePostgresLike(options.roleTitle);
    query = query.ilike('role_title', `%${escapedRole}%`);
  }

  if (options?.category) {
    // Category should be an exact match - validate against known categories
    const safeCategory = options.category.replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 50);
    query = query.eq('category', safeCategory);
  }

  if (options?.search) {
    const escapedSearch = escapePostgresLike(options.search);
    query = query.or(`name.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching community skills', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }

  return data as CommunitySkill[];
}

export async function publishSkillToCommunity(skill: {
  name: string;
  description: string;
  longDescription: string;
  category: string;
  estimatedTimeSaved: string;
  roleTitle?: string;
  roleDepartment?: string;
  roleLevel?: string;
  systemInstruction: string;
  userPromptTemplate: string;
  outputFormat: string;
  recommendedModel: string;
  maxTokens: number;
  temperature: number;
  inputs: unknown[];
}): Promise<CommunitySkill | null> {
  if (!supabase) throw new Error('Supabase not configured');

  const user = await getCurrentUser();
  if (!user) throw new Error('Must be signed in to publish skills');

  // Ensure user profile exists (upsert to handle first-time users)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      display_name: user.user_metadata?.full_name || user.email || 'Anonymous',
      avatar_url: user.user_metadata?.avatar_url || null,
    }, { onConflict: 'id' });

  if (profileError) {
    logger.error('Error ensuring profile exists', { error: profileError instanceof Error ? profileError.message : String(profileError) });
    // Continue anyway - profile might already exist
  }

  const { data, error } = await supabase
    .from('skill_templates')
    .insert({
      created_by: user.id,
      name: skill.name,
      description: skill.description,
      long_description: skill.longDescription,
      category: skill.category,
      estimated_time_saved: skill.estimatedTimeSaved,
      role_title: skill.roleTitle || null,
      role_department: skill.roleDepartment || null,
      role_level: skill.roleLevel || null,
      system_instruction: skill.systemInstruction,
      user_prompt_template: skill.userPromptTemplate,
      output_format: skill.outputFormat,
      recommended_model: skill.recommendedModel,
      max_tokens: skill.maxTokens,
      temperature: skill.temperature,
      inputs: skill.inputs,
      is_public: true,
    })
    .select()
    .single();

  if (error) {
    logger.error('Error publishing skill', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to publish skill: ${error.message}`);
  }

  logger.info('Skill published successfully', { skillId: data.id, skillName: data.name });
  return data as CommunitySkill;
}

export async function incrementSkillUseCount(skillId: string): Promise<void> {
  if (!supabase) return;

  try {
    // Try RPC first (uses SECURITY DEFINER to bypass RLS)
    const { error: rpcError } = await supabase.rpc('increment_skill_use_count', { skill_id: skillId });

    if (rpcError) {
      logger.warn('RPC increment failed', { error: rpcError.message });
      // Fall back: fetch current count and update
      const { data: skill } = await supabase
        .from('skill_templates')
        .select('use_count')
        .eq('id', skillId)
        .single();

      if (skill) {
        await supabase
          .from('skill_templates')
          .update({ use_count: (skill.use_count || 0) + 1 })
          .eq('id', skillId);
      }
    }
  } catch (err) {
    logger.error('Failed to increment use count', { error: err instanceof Error ? err.message : String(err) });
  }
}

export async function rateSkill(skillId: string, rating: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const user = await getCurrentUser();
  if (!user) throw new Error('Must be signed in to rate skills');

  logger.debug('Rating skill', { skillId, rating });

  // Check if user has already rated this skill
  const { data: existingRating, error: fetchError } = await supabase
    .from('skill_ratings')
    .select('id, rating')
    .eq('skill_id', skillId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    logger.error('Error checking existing rating', { error: fetchError instanceof Error ? fetchError.message : String(fetchError) });
  }

  const oldRating = existingRating?.rating || 0;
  const isNewRating = !existingRating;

  logger.debug('Existing rating check', { existingRating, isNewRating });

  // Use INSERT for new ratings, UPDATE for existing
  if (isNewRating) {
    const { error: insertError } = await supabase
      .from('skill_ratings')
      .insert({
        skill_id: skillId,
        user_id: user.id,
        rating,
      });

    if (insertError) {
      logger.error('Error inserting rating', { error: insertError instanceof Error ? insertError.message : String(insertError) });
      throw insertError;
    }
    logger.debug('Rating inserted successfully');

    // Update skill_templates: increment count and add to sum
    const { data: skill } = await supabase
      .from('skill_templates')
      .select('rating_sum, rating_count')
      .eq('id', skillId)
      .single();

    if (skill) {
      const newSum = (skill.rating_sum || 0) + rating;
      const newCount = (skill.rating_count || 0) + 1;
      logger.debug('Updating rating aggregates', { rating_sum: newSum, rating_count: newCount });

      const { error: updateError } = await supabase
        .from('skill_templates')
        .update({
          rating_sum: newSum,
          rating_count: newCount,
        })
        .eq('id', skillId);

      if (updateError) {
        logger.error('Error updating skill rating aggregates', { error: updateError instanceof Error ? updateError.message : String(updateError) });
      } else {
        logger.debug('Rating aggregates updated successfully');
      }
    }
  } else {
    // Update existing rating
    const { error: updateRatingError } = await supabase
      .from('skill_ratings')
      .update({ rating })
      .eq('id', existingRating.id);

    if (updateRatingError) {
      logger.error('Error updating rating', { error: updateRatingError instanceof Error ? updateRatingError.message : String(updateRatingError) });
      throw updateRatingError;
    }
    logger.debug('Rating updated successfully');

    // Update skill_templates: adjust the sum (count stays same)
    const { data: skill } = await supabase
      .from('skill_templates')
      .select('rating_sum')
      .eq('id', skillId)
      .single();

    if (skill) {
      const newSum = (skill.rating_sum || 0) - oldRating + rating;
      logger.debug('Updating rating sum', { oldSum: skill.rating_sum, newSum });

      const { error: updateError } = await supabase
        .from('skill_templates')
        .update({
          rating_sum: newSum,
        })
        .eq('id', skillId);

      if (updateError) {
        logger.error('Error updating skill rating sum', { error: updateError instanceof Error ? updateError.message : String(updateError) });
      } else {
        logger.debug('Rating sum updated successfully');
      }
    }
  }
}

export async function deleteCommunitySkill(skillId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const user = await getCurrentUser();
  if (!user) throw new Error('Must be signed in to delete skills');

  const { error } = await supabase
    .from('skill_templates')
    .delete()
    .eq('id', skillId)
    .eq('created_by', user.id); // RLS also enforces this, but double-check

  if (error) {
    logger.error('Error deleting skill', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to delete skill: ${error.message}`);
  }
}
