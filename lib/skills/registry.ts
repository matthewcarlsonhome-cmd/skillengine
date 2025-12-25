// Unified Skill Registry - Combines static and dynamic skills

import { SKILLS } from './static';
import { db } from '../storage';
import type { Skill } from '../../types';
import type { DynamicSkill } from '../storage/types';
import { logger } from '../logger';

export type SkillSource = 'static' | 'dynamic';

export interface UnifiedSkill {
  skill: Skill | DynamicSkill;
  source: SkillSource;
  workspaceId?: string;
}

// Type guard to check if a skill is dynamic
export function isDynamicSkill(skill: Skill | DynamicSkill): skill is DynamicSkill {
  return 'workspaceId' in skill && 'prompts' in skill;
}

// Get all skills (static + dynamic)
export async function getAllSkills(): Promise<UnifiedSkill[]> {
  // Static skills (always available)
  const staticSkills: UnifiedSkill[] = Object.values(SKILLS).map(s => ({
    skill: s,
    source: 'static' as const
  }));

  // Dynamic skills (from storage)
  try {
    const dynamicSkills = await db.getAllDynamicSkills();
    const dynamicUnified: UnifiedSkill[] = dynamicSkills.map(s => ({
      skill: s,
      source: 'dynamic' as const,
      workspaceId: s.workspaceId
    }));

    return [...staticSkills, ...dynamicUnified];
  } catch (error) {
    logger.error('Failed to load dynamic skills', { error: error instanceof Error ? error.message : String(error) });
    return staticSkills;
  }
}

// Get a specific skill by ID
export async function getSkill(id: string): Promise<UnifiedSkill | null> {
  // Check static first (faster, no async)
  if (SKILLS[id]) {
    return { skill: SKILLS[id], source: 'static' };
  }

  // Check dynamic storage
  try {
    const dynamic = await db.getDynamicSkill(id);
    if (dynamic) {
      return { skill: dynamic, source: 'dynamic', workspaceId: dynamic.workspaceId };
    }
  } catch (error) {
    logger.error('Failed to load dynamic skill', { error: error instanceof Error ? error.message : String(error) });
  }

  return null;
}

// Get only static skills (the original 15)
export function getStaticSkills(): Skill[] {
  return Object.values(SKILLS);
}

// Get static skill by ID
export function getStaticSkill(id: string): Skill | undefined {
  return SKILLS[id];
}

// Get dynamic skills by workspace
export async function getDynamicSkillsByWorkspace(workspaceId: string): Promise<DynamicSkill[]> {
  try {
    return await db.getSkillsByWorkspace(workspaceId);
  } catch (error) {
    logger.error('Failed to load workspace skills', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

// Get all dynamic skills
export async function getAllDynamicSkills(): Promise<DynamicSkill[]> {
  try {
    return await db.getAllDynamicSkills();
  } catch (error) {
    logger.error('Failed to load dynamic skills', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

// Save a dynamic skill
export async function saveDynamicSkill(skill: DynamicSkill): Promise<void> {
  await db.saveDynamicSkill(skill);
}

// Delete a dynamic skill
export async function deleteDynamicSkill(id: string): Promise<void> {
  await db.deleteDynamicSkill(id);
}

// Search skills by name or description
export async function searchSkills(query: string): Promise<UnifiedSkill[]> {
  const all = await getAllSkills();
  const lowerQuery = query.toLowerCase();

  return all.filter(({ skill }) => {
    const name = skill.name.toLowerCase();
    const description = skill.description.toLowerCase();
    return name.includes(lowerQuery) || description.includes(lowerQuery);
  });
}

// Get skills by category
export async function getSkillsByCategory(
  category: string,
  source?: SkillSource
): Promise<UnifiedSkill[]> {
  const all = await getAllSkills();

  return all.filter(({ skill, source: s }) => {
    if (source && s !== source) return false;
    if (isDynamicSkill(skill)) {
      return skill.category === category;
    }
    // Static skills don't have category field, could add logic here
    return false;
  });
}
