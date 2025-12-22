/**
 * Supabase-backed Skill Grading
 *
 * Replaces localStorage implementation with persistent backend storage.
 * Grades are anonymized (no user ID stored) and aggregated across all users.
 *
 * Key features:
 * - Anonymous grade submission (privacy-preserving)
 * - Real-time aggregate score updates via database triggers
 * - Automatic improvement trigger detection
 * - Skill prompt versioning and rollback support
 */

import { supabase } from '../supabase';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GradeSubmission {
  skillId: string;
  skillVersion: number;
  overallScore: number;
  dimensionScores?: {
    relevance?: number;
    accuracy?: number;
    completeness?: number;
    clarity?: number;
    actionability?: number;
    professionalism?: number;
  };
  feedback?: string;
  improvementSuggestion?: string;
  wasOutputUsed: boolean;
  inputsHash?: string;
}

export interface SkillScores {
  totalGrades: number;
  averageOverall: number | null;
  dimensions: {
    relevance: number | null;
    accuracy: number | null;
    completeness: number | null;
    clarity: number | null;
    actionability: number | null;
    professionalism: number | null;
  };
  currentVersion: number;
  improvementPending: boolean;
  improvementThreshold: number;
  minGradesForImprovement: number;
  gradesUntilEligible: number;
}

export interface SkillPrompt {
  systemInstruction: string;
  userPromptTemplate: string;
  version: number;
}

export interface SkillRegistryEntry {
  id: string;
  name: string;
  skillType: 'built-in' | 'dynamic' | 'community' | 'library';
  currentVersion: number;
  scores: SkillScores;
  lastImprovedAt: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// GRADE SUBMISSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Submit a grade to Supabase (anonymized - no user tracking)
 * The database trigger will automatically update aggregate scores
 * and check if improvement should be triggered.
 */
export async function submitGrade(
  grade: GradeSubmission
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('skill_grades_v2').insert({
      skill_id: grade.skillId,
      skill_version: grade.skillVersion,
      overall_score: grade.overallScore,
      relevance_score: grade.dimensionScores?.relevance ?? null,
      accuracy_score: grade.dimensionScores?.accuracy ?? null,
      completeness_score: grade.dimensionScores?.completeness ?? null,
      clarity_score: grade.dimensionScores?.clarity ?? null,
      actionability_score: grade.dimensionScores?.actionability ?? null,
      professionalism_score: grade.dimensionScores?.professionalism ?? null,
      feedback: grade.feedback || null,
      improvement_suggestion: grade.improvementSuggestion || null,
      was_output_used: grade.wasOutputUsed,
      inputs_hash: grade.inputsHash || null,
    });

    if (error) {
      console.error('Failed to submit grade:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Grade submission error:', err);
    return { success: false, error: 'Failed to submit grade' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL SCORES & STATUS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current aggregate scores for a skill
 */
export async function getSkillScores(skillId: string): Promise<SkillScores | null> {
  try {
    const { data, error } = await supabase
      .from('skill_registry')
      .select(
        `
        total_grades,
        avg_overall_score,
        avg_relevance,
        avg_accuracy,
        avg_completeness,
        avg_clarity,
        avg_actionability,
        avg_professionalism,
        current_version,
        improvement_pending,
        improvement_threshold,
        min_grades_for_improvement
      `
      )
      .eq('id', skillId)
      .single();

    if (error || !data) {
      console.warn('Skill not found in registry:', skillId);
      return null;
    }

    return {
      totalGrades: data.total_grades,
      averageOverall: data.avg_overall_score,
      dimensions: {
        relevance: data.avg_relevance,
        accuracy: data.avg_accuracy,
        completeness: data.avg_completeness,
        clarity: data.avg_clarity,
        actionability: data.avg_actionability,
        professionalism: data.avg_professionalism,
      },
      currentVersion: data.current_version,
      improvementPending: data.improvement_pending,
      improvementThreshold: data.improvement_threshold,
      minGradesForImprovement: data.min_grades_for_improvement,
      gradesUntilEligible: Math.max(0, data.min_grades_for_improvement - data.total_grades),
    };
  } catch (err) {
    console.error('Failed to get skill scores:', err);
    return null;
  }
}

/**
 * Check if a skill exists in the registry
 */
export async function skillExistsInRegistry(skillId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('skill_registry')
    .select('id')
    .eq('id', skillId)
    .single();

  return !error && !!data;
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL PROMPTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the current system prompt for a skill from the registry
 * This returns the potentially-improved prompt if one exists
 */
export async function getSkillPrompt(skillId: string): Promise<SkillPrompt | null> {
  try {
    const { data, error } = await supabase
      .from('skill_registry')
      .select('current_system_instruction, current_user_prompt_template, current_version')
      .eq('id', skillId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      systemInstruction: data.current_system_instruction,
      userPromptTemplate: data.current_user_prompt_template,
      version: data.current_version,
    };
  } catch (err) {
    console.error('Failed to get skill prompt:', err);
    return null;
  }
}

/**
 * Get the current version number for a skill
 * Falls back to 1 if skill is not in registry
 */
export async function getSkillVersion(skillId: string): Promise<number> {
  const { data } = await supabase
    .from('skill_registry')
    .select('current_version')
    .eq('id', skillId)
    .single();

  return data?.current_version ?? 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL REGISTRY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register a skill in the registry (or update if exists)
 * Used during initialization and when creating new skills
 */
export async function registerSkill(
  skillId: string,
  name: string,
  skillType: 'built-in' | 'dynamic' | 'community' | 'library',
  systemInstruction: string,
  userPromptTemplate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('skill_registry').upsert(
      {
        id: skillId,
        name,
        skill_type: skillType,
        current_system_instruction: systemInstruction,
        current_user_prompt_template: userPromptTemplate,
        current_version: 1,
        min_grades_for_improvement: 50,
        improvement_threshold: 3.5,
      },
      {
        onConflict: 'id',
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error('Failed to register skill:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Skill registration error:', err);
    return { success: false, error: 'Failed to register skill' };
  }
}

/**
 * Get all skills from the registry
 */
export async function getAllRegisteredSkills(): Promise<SkillRegistryEntry[]> {
  const { data, error } = await supabase
    .from('skill_registry')
    .select('*')
    .order('name');

  if (error || !data) {
    return [];
  }

  return data.map((skill) => ({
    id: skill.id,
    name: skill.name,
    skillType: skill.skill_type,
    currentVersion: skill.current_version,
    scores: {
      totalGrades: skill.total_grades,
      averageOverall: skill.avg_overall_score,
      dimensions: {
        relevance: skill.avg_relevance,
        accuracy: skill.avg_accuracy,
        completeness: skill.avg_completeness,
        clarity: skill.avg_clarity,
        actionability: skill.avg_actionability,
        professionalism: skill.avg_professionalism,
      },
      currentVersion: skill.current_version,
      improvementPending: skill.improvement_pending,
      improvementThreshold: skill.improvement_threshold,
      minGradesForImprovement: skill.min_grades_for_improvement,
      gradesUntilEligible: Math.max(0, skill.min_grades_for_improvement - skill.total_grades),
    },
    lastImprovedAt: skill.last_improved_at,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPROVEMENT REQUESTS
// ═══════════════════════════════════════════════════════════════════════════

export interface ImprovementRequest {
  id: string;
  skillId: string;
  fromVersion: number;
  triggerReason: string;
  scoreSnapshot: Record<string, number>;
  sampleFeedback: string[];
  proposedSystemInstruction: string | null;
  proposedUserPromptTemplate: string | null;
  improvementRationale: string | null;
  status: 'pending' | 'generated' | 'approved' | 'rejected' | 'implemented' | 'rolled-back';
  triggeredAt: string;
  reviewedAt: string | null;
  implementedAt: string | null;
}

/**
 * Get pending improvement requests
 */
export async function getPendingImprovementRequests(): Promise<ImprovementRequest[]> {
  const { data, error } = await supabase
    .from('skill_improvement_requests')
    .select('*')
    .in('status', ['pending', 'generated', 'approved'])
    .order('triggered_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((req) => ({
    id: req.id,
    skillId: req.skill_id,
    fromVersion: req.from_version,
    triggerReason: req.trigger_reason,
    scoreSnapshot: req.score_snapshot,
    sampleFeedback: req.sample_feedback || [],
    proposedSystemInstruction: req.proposed_system_instruction,
    proposedUserPromptTemplate: req.proposed_user_prompt_template,
    improvementRationale: req.improvement_rationale,
    status: req.status,
    triggeredAt: req.triggered_at,
    reviewedAt: req.reviewed_at,
    implementedAt: req.implemented_at,
  }));
}

/**
 * Get improvement history for a skill
 */
export async function getImprovementHistory(
  skillId: string
): Promise<ImprovementRequest[]> {
  const { data, error } = await supabase
    .from('skill_improvement_requests')
    .select('*')
    .eq('skill_id', skillId)
    .order('triggered_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((req) => ({
    id: req.id,
    skillId: req.skill_id,
    fromVersion: req.from_version,
    triggerReason: req.trigger_reason,
    scoreSnapshot: req.score_snapshot,
    sampleFeedback: req.sample_feedback || [],
    proposedSystemInstruction: req.proposed_system_instruction,
    proposedUserPromptTemplate: req.proposed_user_prompt_template,
    improvementRationale: req.improvement_rationale,
    status: req.status,
    triggeredAt: req.triggered_at,
    reviewedAt: req.reviewed_at,
    implementedAt: req.implemented_at,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a hash of inputs for deduplication
 * Prevents the same user from rating the same execution multiple times
 */
export function hashInputs(inputs: Record<string, unknown>): string {
  const str = JSON.stringify(inputs, Object.keys(inputs).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}
