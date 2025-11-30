// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Community features will be disabled.');
}

// Create Supabase client (will be null if not configured)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// Auth helpers
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
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

  if (options?.roleTitle) {
    query = query.ilike('role_title', `%${options.roleTitle}%`);
  }

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching community skills:', error);
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
    console.error('Error ensuring profile exists:', profileError);
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
    console.error('Error publishing skill:', error);
    throw new Error(`Failed to publish skill: ${error.message}`);
  }

  console.log('Skill published successfully:', data);
  return data as CommunitySkill;
}

export async function incrementSkillUseCount(skillId: string): Promise<void> {
  if (!supabase) return;

  try {
    // Try RPC first (uses SECURITY DEFINER to bypass RLS)
    const { error: rpcError } = await supabase.rpc('increment_skill_use_count', { skill_id: skillId });

    if (rpcError) {
      console.warn('RPC increment failed:', rpcError.message);
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
    console.error('Failed to increment use count:', err);
  }
}

export async function rateSkill(skillId: string, rating: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const user = await getCurrentUser();
  if (!user) throw new Error('Must be signed in to rate skills');

  console.log('Rating skill:', skillId, 'with rating:', rating);

  // Check if user has already rated this skill
  const { data: existingRating, error: fetchError } = await supabase
    .from('skill_ratings')
    .select('id, rating')
    .eq('skill_id', skillId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking existing rating:', fetchError);
  }

  const oldRating = existingRating?.rating || 0;
  const isNewRating = !existingRating;

  console.log('Existing rating:', existingRating, 'isNewRating:', isNewRating);

  // Upsert the rating
  const { error: upsertError } = await supabase
    .from('skill_ratings')
    .upsert({
      skill_id: skillId,
      user_id: user.id,
      rating,
    });

  if (upsertError) {
    console.error('Error upserting rating:', upsertError);
    throw upsertError;
  }

  console.log('Rating upserted successfully');

  // Directly update skill_templates rating aggregates
  // This ensures ratings work even if the trigger isn't set up
  if (isNewRating) {
    // New rating: increment count and add to sum
    const { data: skill, error: skillFetchError } = await supabase
      .from('skill_templates')
      .select('rating_sum, rating_count')
      .eq('id', skillId)
      .single();

    if (skillFetchError) {
      console.error('Error fetching skill for rating update:', skillFetchError);
    }

    console.log('Current skill rating data:', skill);

    if (skill) {
      const newSum = (skill.rating_sum || 0) + rating;
      const newCount = (skill.rating_count || 0) + 1;
      console.log('Updating to:', { rating_sum: newSum, rating_count: newCount });

      const { error: updateError } = await supabase
        .from('skill_templates')
        .update({
          rating_sum: newSum,
          rating_count: newCount,
        })
        .eq('id', skillId);

      if (updateError) {
        console.error('Error updating skill rating aggregates:', updateError);
      } else {
        console.log('Rating aggregates updated successfully');
      }
    }
  } else {
    // Updated rating: adjust the sum (count stays same)
    const { data: skill, error: skillFetchError } = await supabase
      .from('skill_templates')
      .select('rating_sum')
      .eq('id', skillId)
      .single();

    if (skillFetchError) {
      console.error('Error fetching skill for rating update:', skillFetchError);
    }

    if (skill) {
      const newSum = (skill.rating_sum || 0) - oldRating + rating;
      console.log('Updating sum from', skill.rating_sum, 'to', newSum);

      const { error: updateError } = await supabase
        .from('skill_templates')
        .update({
          rating_sum: newSum,
        })
        .eq('id', skillId);

      if (updateError) {
        console.error('Error updating skill rating sum:', updateError);
      } else {
        console.log('Rating sum updated successfully');
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
    console.error('Error deleting skill:', error);
    throw new Error(`Failed to delete skill: ${error.message}`);
  }
}
