// IndexedDB storage implementation for Skill Engine

import type {
  Workspace,
  DynamicSkill,
  SkillExecution,
  UserPreferences,
  SavedOutput,
  FavoriteSkill
} from './types';

const DB_NAME = 'skillengine';
const DB_VERSION = 2;

export const STORES = {
  WORKSPACES: 'workspaces',
  DYNAMIC_SKILLS: 'dynamicSkills',
  SKILL_EXECUTIONS: 'skillExecutions',
  USER_PREFERENCES: 'userPreferences',
  SAVED_OUTPUTS: 'savedOutputs',
  FAVORITE_SKILLS: 'favoriteSkills'
} as const;

class SkillEngineDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Workspaces store
        if (!db.objectStoreNames.contains(STORES.WORKSPACES)) {
          const workspaceStore = db.createObjectStore(STORES.WORKSPACES, { keyPath: 'id' });
          workspaceStore.createIndex('createdAt', 'createdAt');
          workspaceStore.createIndex('roleType', 'roleType');
          workspaceStore.createIndex('updatedAt', 'updatedAt');
        }

        // Dynamic Skills store
        if (!db.objectStoreNames.contains(STORES.DYNAMIC_SKILLS)) {
          const skillStore = db.createObjectStore(STORES.DYNAMIC_SKILLS, { keyPath: 'id' });
          skillStore.createIndex('workspaceId', 'workspaceId');
          skillStore.createIndex('category', 'category');
          skillStore.createIndex('createdAt', 'createdAt');
        }

        // Skill Executions store
        if (!db.objectStoreNames.contains(STORES.SKILL_EXECUTIONS)) {
          const execStore = db.createObjectStore(STORES.SKILL_EXECUTIONS, { keyPath: 'id' });
          execStore.createIndex('skillId', 'skillId');
          execStore.createIndex('workspaceId', 'workspaceId');
          execStore.createIndex('createdAt', 'createdAt');
        }

        // User Preferences store
        if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
          db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'id' });
        }

        // Saved Outputs store (new in v2)
        if (!db.objectStoreNames.contains(STORES.SAVED_OUTPUTS)) {
          const savedStore = db.createObjectStore(STORES.SAVED_OUTPUTS, { keyPath: 'id' });
          savedStore.createIndex('skillId', 'skillId');
          savedStore.createIndex('createdAt', 'createdAt');
          savedStore.createIndex('isFavorite', 'isFavorite');
        }

        // Favorite Skills store (new in v2)
        if (!db.objectStoreNames.contains(STORES.FAVORITE_SKILLS)) {
          const favStore = db.createObjectStore(STORES.FAVORITE_SKILLS, { keyPath: 'id' });
          favStore.createIndex('skillId', 'skillId');
          favStore.createIndex('createdAt', 'createdAt');
        }
      };
    });

    return this.initPromise;
  }

  private ensureDb(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // ─── WORKSPACE OPERATIONS ─────────────────────────────────────────

  async createWorkspace(workspace: Workspace): Promise<void> {
    return this.put(STORES.WORKSPACES, workspace);
  }

  async updateWorkspace(workspace: Workspace): Promise<void> {
    return this.put(STORES.WORKSPACES, { ...workspace, updatedAt: new Date().toISOString() });
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    return this.get(STORES.WORKSPACES, id);
  }

  async getAllWorkspaces(): Promise<Workspace[]> {
    const workspaces = await this.getAll<Workspace>(STORES.WORKSPACES);
    return workspaces.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async deleteWorkspace(id: string): Promise<void> {
    // Delete associated skills first
    const skills = await this.getSkillsByWorkspace(id);
    for (const skill of skills) {
      await this.deleteDynamicSkill(skill.id);
    }
    // Delete associated executions
    const executions = await this.getExecutionsByWorkspace(id);
    for (const exec of executions) {
      await this.delete(STORES.SKILL_EXECUTIONS, exec.id);
    }
    return this.delete(STORES.WORKSPACES, id);
  }

  // ─── DYNAMIC SKILL OPERATIONS ─────────────────────────────────────

  async saveDynamicSkill(skill: DynamicSkill): Promise<void> {
    return this.put(STORES.DYNAMIC_SKILLS, skill);
  }

  async getDynamicSkill(id: string): Promise<DynamicSkill | undefined> {
    return this.get(STORES.DYNAMIC_SKILLS, id);
  }

  async getSkillsByWorkspace(workspaceId: string): Promise<DynamicSkill[]> {
    return this.getAllByIndex(STORES.DYNAMIC_SKILLS, 'workspaceId', workspaceId);
  }

  async getAllDynamicSkills(): Promise<DynamicSkill[]> {
    return this.getAll(STORES.DYNAMIC_SKILLS);
  }

  async deleteDynamicSkill(id: string): Promise<void> {
    return this.delete(STORES.DYNAMIC_SKILLS, id);
  }

  async updateSkillExecutionCount(id: string): Promise<void> {
    const skill = await this.getDynamicSkill(id);
    if (skill) {
      skill.executionCount = (skill.executionCount || 0) + 1;
      skill.lastExecutedAt = new Date().toISOString();
      await this.saveDynamicSkill(skill);
    }
  }

  // ─── EXECUTION HISTORY ────────────────────────────────────────────

  async saveExecution(execution: SkillExecution): Promise<void> {
    return this.put(STORES.SKILL_EXECUTIONS, execution);
  }

  async getExecution(id: string): Promise<SkillExecution | undefined> {
    return this.get(STORES.SKILL_EXECUTIONS, id);
  }

  async getExecutionsBySkill(skillId: string): Promise<SkillExecution[]> {
    return this.getAllByIndex(STORES.SKILL_EXECUTIONS, 'skillId', skillId);
  }

  async getExecutionsByWorkspace(workspaceId: string): Promise<SkillExecution[]> {
    return this.getAllByIndex(STORES.SKILL_EXECUTIONS, 'workspaceId', workspaceId);
  }

  async getRecentExecutions(limit: number = 50): Promise<SkillExecution[]> {
    const all = await this.getAll<SkillExecution>(STORES.SKILL_EXECUTIONS);
    return all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async deleteExecution(id: string): Promise<void> {
    return this.delete(STORES.SKILL_EXECUTIONS, id);
  }

  // ─── USER PREFERENCES ─────────────────────────────────────────────

  async getPreferences(): Promise<UserPreferences | undefined> {
    return this.get(STORES.USER_PREFERENCES, 'default');
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    return this.put(STORES.USER_PREFERENCES, prefs);
  }

  // ─── SAVED OUTPUTS ─────────────────────────────────────────────────

  async saveOutput(output: SavedOutput): Promise<void> {
    return this.put(STORES.SAVED_OUTPUTS, output);
  }

  async getSavedOutput(id: string): Promise<SavedOutput | undefined> {
    return this.get(STORES.SAVED_OUTPUTS, id);
  }

  async getAllSavedOutputs(): Promise<SavedOutput[]> {
    const outputs = await this.getAll<SavedOutput>(STORES.SAVED_OUTPUTS);
    return outputs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSavedOutputsBySkill(skillId: string): Promise<SavedOutput[]> {
    return this.getAllByIndex(STORES.SAVED_OUTPUTS, 'skillId', skillId);
  }

  async getFavoriteSavedOutputs(): Promise<SavedOutput[]> {
    const all = await this.getAll<SavedOutput>(STORES.SAVED_OUTPUTS);
    return all
      .filter(o => o.isFavorite)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateSavedOutput(id: string, updates: Partial<SavedOutput>): Promise<void> {
    const output = await this.getSavedOutput(id);
    if (output) {
      await this.put(STORES.SAVED_OUTPUTS, {
        ...output,
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }
  }

  async deleteSavedOutput(id: string): Promise<void> {
    return this.delete(STORES.SAVED_OUTPUTS, id);
  }

  // ─── FAVORITE SKILLS ───────────────────────────────────────────────

  async addFavoriteSkill(favorite: FavoriteSkill): Promise<void> {
    return this.put(STORES.FAVORITE_SKILLS, favorite);
  }

  async getFavoriteSkill(id: string): Promise<FavoriteSkill | undefined> {
    return this.get(STORES.FAVORITE_SKILLS, id);
  }

  async getAllFavoriteSkills(): Promise<FavoriteSkill[]> {
    const favorites = await this.getAll<FavoriteSkill>(STORES.FAVORITE_SKILLS);
    return favorites.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getFavoriteBySkillId(skillId: string): Promise<FavoriteSkill | undefined> {
    const favorites = await this.getAllByIndex<FavoriteSkill>(STORES.FAVORITE_SKILLS, 'skillId', skillId);
    return favorites[0];
  }

  async isSkillFavorited(skillId: string): Promise<boolean> {
    const favorite = await this.getFavoriteBySkillId(skillId);
    return !!favorite;
  }

  async removeFavoriteSkill(id: string): Promise<void> {
    return this.delete(STORES.FAVORITE_SKILLS, id);
  }

  async removeFavoriteBySkillId(skillId: string): Promise<void> {
    const favorite = await this.getFavoriteBySkillId(skillId);
    if (favorite) {
      await this.delete(STORES.FAVORITE_SKILLS, favorite.id);
    }
  }

  // ─── EXPORT / IMPORT ──────────────────────────────────────────────

  async exportWorkspace(workspaceId: string): Promise<{
    workspace: Workspace;
    skills: DynamicSkill[];
  } | null> {
    const workspace = await this.getWorkspace(workspaceId);
    if (!workspace) return null;

    const skills = await this.getSkillsByWorkspace(workspaceId);
    return { workspace, skills };
  }

  async importWorkspace(data: {
    workspace: Workspace;
    skills: DynamicSkill[];
  }): Promise<void> {
    // Generate new IDs to avoid conflicts
    const newWorkspaceId = crypto.randomUUID();
    const now = new Date().toISOString();

    const workspace: Workspace = {
      ...data.workspace,
      id: newWorkspaceId,
      createdAt: now,
      updatedAt: now,
    };

    await this.createWorkspace(workspace);

    for (const skill of data.skills) {
      const newSkill: DynamicSkill = {
        ...skill,
        id: crypto.randomUUID(),
        workspaceId: newWorkspaceId,
        createdAt: now,
        updatedAt: now,
        executionCount: 0,
        lastExecutedAt: undefined,
      };
      await this.saveDynamicSkill(newSkill);
    }
  }

  // ─── GENERIC HELPERS ──────────────────────────────────────────────

  private async put<T>(storeName: string, item: T): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.ensureDb().transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async get<T>(storeName: string, key: string): Promise<T | undefined> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.ensureDb().transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.ensureDb().transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private async getAllByIndex<T>(
    storeName: string,
    indexName: string,
    value: string
  ): Promise<T[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.ensureDb().transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private async delete(storeName: string, key: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.ensureDb().transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // ─── CLEAR ALL DATA ───────────────────────────────────────────────

  async clearAll(): Promise<void> {
    await this.init();
    const storeNames = Object.values(STORES);
    for (const storeName of storeNames) {
      await new Promise<void>((resolve, reject) => {
        const tx = this.ensureDb().transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  }
}

// Singleton instance
export const db = new SkillEngineDB();
