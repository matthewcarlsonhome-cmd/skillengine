// Skill Export/Import - Export skills as JSON and import from files

import type { DynamicSkill } from './storage/types';
import { db } from './storage/indexeddb';

export interface ExportedSkill {
  version: '1.0';
  exportedAt: string;
  skill: Omit<DynamicSkill, 'id' | 'workspaceId' | 'executionCount' | 'lastExecutedAt'>;
}

export interface ExportedSkillBundle {
  version: '1.0';
  exportedAt: string;
  bundleName: string;
  skills: ExportedSkill['skill'][];
}

// Export a single skill
export function exportSkill(skill: DynamicSkill): ExportedSkill {
  const { id, workspaceId, executionCount, lastExecutedAt, ...exportableSkill } = skill;
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    skill: exportableSkill,
  };
}

// Export multiple skills as a bundle
export function exportSkillBundle(skills: DynamicSkill[], bundleName: string): ExportedSkillBundle {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    bundleName,
    skills: skills.map(skill => {
      const { id, workspaceId, executionCount, lastExecutedAt, ...exportableSkill } = skill;
      return exportableSkill;
    }),
  };
}

// Download skill as JSON file
export function downloadSkillAsJson(skill: DynamicSkill): void {
  const exported = exportSkill(skill);
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${skill.name.toLowerCase().replace(/\s+/g, '-')}-skill.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download bundle as JSON file
export function downloadBundleAsJson(skills: DynamicSkill[], bundleName: string): void {
  const exported = exportSkillBundle(skills, bundleName);
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${bundleName.toLowerCase().replace(/\s+/g, '-')}-bundle.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Validate imported skill data
export function validateImportedSkill(data: unknown): data is ExportedSkill {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  if (obj.version !== '1.0') return false;
  if (!obj.skill || typeof obj.skill !== 'object') return false;

  const skill = obj.skill as Record<string, unknown>;
  if (!skill.name || typeof skill.name !== 'string') return false;
  if (!skill.description || typeof skill.description !== 'string') return false;
  if (!skill.prompts || typeof skill.prompts !== 'object') return false;

  return true;
}

// Validate imported bundle data
export function validateImportedBundle(data: unknown): data is ExportedSkillBundle {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  if (obj.version !== '1.0') return false;
  if (!obj.bundleName || typeof obj.bundleName !== 'string') return false;
  if (!Array.isArray(obj.skills)) return false;

  return obj.skills.length > 0;
}

// Import a single skill from JSON
export async function importSkillFromJson(data: ExportedSkill): Promise<DynamicSkill> {
  await db.init();

  const newSkill: DynamicSkill = {
    ...data.skill,
    id: crypto.randomUUID(),
    workspaceId: 'imported-' + Date.now(),
    executionCount: 0,
  };

  await db.saveDynamicSkill(newSkill);
  return newSkill;
}

// Import a bundle of skills
export async function importBundleFromJson(data: ExportedSkillBundle): Promise<DynamicSkill[]> {
  await db.init();

  const importedSkills: DynamicSkill[] = [];
  const workspaceId = 'imported-bundle-' + Date.now();

  for (const skillData of data.skills) {
    const newSkill: DynamicSkill = {
      ...skillData,
      id: crypto.randomUUID(),
      workspaceId,
      executionCount: 0,
    };

    await db.saveDynamicSkill(newSkill);
    importedSkills.push(newSkill);
  }

  return importedSkills;
}

// Read and parse JSON file
export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
