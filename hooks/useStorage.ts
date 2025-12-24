// React hooks for storage operations

import { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/storage';
import type { Workspace, DynamicSkill, SkillExecution } from '../lib/storage/types';
import { logger } from '../lib/logger';

// Hook to initialize storage
export function useStorageInit() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    db.init()
      .then(() => setIsReady(true))
      .catch(setError);
  }, []);

  return { isReady, error };
}

// Hook for workspace management
export function useWorkspaces() {
  const { isReady } = useStorageInit();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadWorkspaces = useCallback(async () => {
    if (!isReady) return;
    try {
      setLoading(true);
      const data = await db.getAllWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load workspaces'));
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const createWorkspace = useCallback(async (workspace: Workspace) => {
    await db.createWorkspace(workspace);
    setWorkspaces(prev => [workspace, ...prev]);
    return workspace;
  }, []);

  const updateWorkspace = useCallback(async (workspace: Workspace) => {
    await db.updateWorkspace(workspace);
    setWorkspaces(prev => prev.map(w => w.id === workspace.id ? workspace : w));
  }, []);

  const deleteWorkspace = useCallback(async (id: string) => {
    await db.deleteWorkspace(id);
    setWorkspaces(prev => prev.filter(w => w.id !== id));
  }, []);

  const getWorkspace = useCallback(async (id: string) => {
    return db.getWorkspace(id);
  }, []);

  return {
    workspaces,
    loading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getWorkspace,
    refresh: loadWorkspaces,
  };
}

// Hook for a single workspace
export function useWorkspace(workspaceId: string | undefined) {
  const { isReady } = useStorageInit();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [skills, setSkills] = useState<DynamicSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!isReady || !workspaceId) return;
    try {
      setLoading(true);
      const [ws, sk] = await Promise.all([
        db.getWorkspace(workspaceId),
        db.getSkillsByWorkspace(workspaceId),
      ]);
      setWorkspace(ws || null);
      setSkills(sk);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load workspace'));
    } finally {
      setLoading(false);
    }
  }, [isReady, workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateWorkspace = useCallback(async (updates: Partial<Workspace>) => {
    if (!workspace) return;
    const updated = { ...workspace, ...updates, updatedAt: new Date().toISOString() };
    await db.updateWorkspace(updated);
    setWorkspace(updated);
  }, [workspace]);

  const addSkill = useCallback(async (skill: DynamicSkill) => {
    await db.saveDynamicSkill(skill);
    setSkills(prev => [...prev, skill]);
  }, []);

  const addSkills = useCallback(async (newSkills: DynamicSkill[]) => {
    for (const skill of newSkills) {
      await db.saveDynamicSkill(skill);
    }
    setSkills(prev => [...prev, ...newSkills]);
  }, []);

  const deleteSkill = useCallback(async (skillId: string) => {
    await db.deleteDynamicSkill(skillId);
    setSkills(prev => prev.filter(s => s.id !== skillId));
  }, []);

  return {
    workspace,
    skills,
    loading,
    error,
    updateWorkspace,
    addSkill,
    addSkills,
    deleteSkill,
    refresh: load,
  };
}

// Hook for dynamic skills (all or by workspace)
export function useDynamicSkills(workspaceId?: string) {
  const { isReady } = useStorageInit();
  const [skills, setSkills] = useState<DynamicSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSkills = useCallback(async () => {
    if (!isReady) return;
    try {
      setLoading(true);
      const data = workspaceId
        ? await db.getSkillsByWorkspace(workspaceId)
        : await db.getAllDynamicSkills();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load skills'));
    } finally {
      setLoading(false);
    }
  }, [isReady, workspaceId]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const saveSkill = useCallback(async (skill: DynamicSkill) => {
    await db.saveDynamicSkill(skill);
    setSkills(prev => {
      const exists = prev.find(s => s.id === skill.id);
      if (exists) {
        return prev.map(s => s.id === skill.id ? skill : s);
      }
      return [...prev, skill];
    });
  }, []);

  const deleteSkill = useCallback(async (id: string) => {
    await db.deleteDynamicSkill(id);
    setSkills(prev => prev.filter(s => s.id !== id));
  }, []);

  return {
    skills,
    loading,
    error,
    saveSkill,
    deleteSkill,
    refresh: loadSkills,
  };
}

// Hook for execution history
export function useExecutionHistory(skillId?: string, limit: number = 50) {
  const { isReady } = useStorageInit();
  const [executions, setExecutions] = useState<SkillExecution[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExecutions = useCallback(async () => {
    if (!isReady) return;
    try {
      setLoading(true);
      const data = skillId
        ? await db.getExecutionsBySkill(skillId)
        : await db.getRecentExecutions(limit);
      setExecutions(data);
    } catch (err) {
      logger.error('Failed to load executions', { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }, [isReady, skillId, limit]);

  useEffect(() => {
    loadExecutions();
  }, [loadExecutions]);

  const saveExecution = useCallback(async (execution: SkillExecution) => {
    await db.saveExecution(execution);
    setExecutions(prev => [execution, ...prev].slice(0, limit));
  }, [limit]);

  return {
    executions,
    loading,
    saveExecution,
    refresh: loadExecutions,
  };
}
