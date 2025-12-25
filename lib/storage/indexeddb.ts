/**
 * indexeddb.ts - IndexedDB Storage Implementation for SkillEngine
 *
 * This module provides a client-side database layer using IndexedDB, the browser's
 * built-in NoSQL database. IndexedDB allows the app to store significant amounts
 * of structured data locally, enabling offline functionality and fast data access.
 *
 * WHY INDEXEDDB?
 * ==============
 * - Larger storage capacity than localStorage (typically 50MB+ vs 5MB)
 * - Supports complex queries via indexes
 * - Asynchronous API doesn't block the main thread
 * - Persists across browser sessions
 * - Works offline without network connectivity
 *
 * DATABASE SCHEMA:
 * ================
 * Database Name: 'skillengine'
 * Version: 2
 *
 * Object Stores (Tables):
 * ┌─────────────────────┬─────────────┬────────────────────────────────────────┐
 * │ Store Name          │ Key Path    │ Indexes                                │
 * ├─────────────────────┼─────────────┼────────────────────────────────────────┤
 * │ workspaces          │ id          │ createdAt, roleType, updatedAt         │
 * │ dynamicSkills       │ id          │ workspaceId, category, createdAt       │
 * │ skillExecutions     │ id          │ skillId, workspaceId, createdAt        │
 * │ userPreferences     │ id          │ (none)                                 │
 * │ savedOutputs        │ id          │ skillId, createdAt, isFavorite         │
 * │ favoriteSkills      │ id          │ skillId, createdAt                     │
 * └─────────────────────┴─────────────┴────────────────────────────────────────┘
 *
 * ARCHITECTURE PATTERN:
 * =====================
 * This module uses the Singleton pattern - only one instance of SkillEngineDB
 * exists throughout the application lifetime. This ensures:
 * - Single database connection
 * - Consistent state across all components
 * - Efficient resource usage
 *
 * USAGE:
 * ======
 * import { db } from './indexeddb';
 *
 * // Initialize (automatically called on first operation)
 * await db.init();
 *
 * // Create a workspace
 * await db.createWorkspace({ id: 'abc', name: 'My Workspace', ... });
 *
 * // Query workspaces
 * const workspaces = await db.getAllWorkspaces();
 */

import type {
  Workspace,
  DynamicSkill,
  SkillExecution,
  UserPreferences,
  SavedOutput,
  FavoriteSkill,
  WorkflowExecution,
  CustomWorkflow
} from './types';
import { logger } from '../logger';

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/** Database name - used to identify this database in IndexedDB */
const DB_NAME = 'skillengine';

/**
 * Database version - increment this when schema changes
 * IndexedDB will trigger onupgradeneeded when version increases
 */
const DB_VERSION = 4;

/**
 * Object store names - constants to prevent typos and enable refactoring
 * Each store is like a table in a relational database
 */
export const STORES = {
  WORKSPACES: 'workspaces',           // Job analysis workspaces
  DYNAMIC_SKILLS: 'dynamicSkills',    // User-created custom skills
  SKILL_EXECUTIONS: 'skillExecutions', // History of skill runs
  USER_PREFERENCES: 'userPreferences', // User settings
  SAVED_OUTPUTS: 'savedOutputs',       // Saved AI responses
  FAVORITE_SKILLS: 'favoriteSkills',   // Bookmarked skills
  WORKFLOW_EXECUTIONS: 'workflowExecutions', // Workflow run history
  CUSTOM_WORKFLOWS: 'customWorkflows'  // User-created custom workflows
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE CLASS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SkillEngineDB - Main database access class
 *
 * Wraps IndexedDB's callback-based API in a Promise-based interface
 * for easier async/await usage throughout the application.
 */
class SkillEngineDB {
  /** The IndexedDB database connection (null until initialized) */
  private db: IDBDatabase | null = null;

  /** Promise that resolves when initialization completes (prevents race conditions) */
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database connection
   *
   * This method:
   * 1. Opens (or creates) the IndexedDB database
   * 2. Creates object stores and indexes if needed (on upgrade)
   * 3. Stores the connection for future operations
   *
   * Safe to call multiple times - subsequent calls return immediately
   * if already initialized or wait for in-progress initialization.
   */
  async init(): Promise<void> {
    // Already initialized - return immediately
    if (this.db) return;

    // Initialization in progress - wait for it
    if (this.initPromise) return this.initPromise;

    // Start initialization
    this.initPromise = new Promise((resolve, reject) => {
      // Open database with specified name and version
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      // Handle errors (e.g., user denied storage permission)
      request.onerror = () => {
        logger.error('Failed to open database', { error: request.error instanceof Error ? request.error.message : String(request.error) });
        reject(request.error);
      };

      // Database opened successfully
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      /**
       * Schema migration handler
       *
       * Called when:
       * - Database doesn't exist (new user)
       * - Database version is lower than DB_VERSION (schema update)
       *
       * This is where we create object stores and indexes.
       * IndexedDB schema changes can ONLY happen in this event.
       */
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // ─────────────────────────────────────────────────────────────────────
        // WORKSPACES STORE
        // Stores job analysis workspaces created from job descriptions
        // ─────────────────────────────────────────────────────────────────────
        if (!db.objectStoreNames.contains(STORES.WORKSPACES)) {
          const workspaceStore = db.createObjectStore(STORES.WORKSPACES, { keyPath: 'id' });
          // Indexes allow efficient queries by these fields
          workspaceStore.createIndex('createdAt', 'createdAt');   // Sort by creation date
          workspaceStore.createIndex('roleType', 'roleType');     // Filter by role type
          workspaceStore.createIndex('updatedAt', 'updatedAt');   // Sort by last update
        }

        // ─────────────────────────────────────────────────────────────────────
        // DYNAMIC SKILLS STORE
        // Stores user-created AI skills generated from workspace analysis
        // ─────────────────────────────────────────────────────────────────────
        if (!db.objectStoreNames.contains(STORES.DYNAMIC_SKILLS)) {
          const skillStore = db.createObjectStore(STORES.DYNAMIC_SKILLS, { keyPath: 'id' });
          skillStore.createIndex('workspaceId', 'workspaceId');   // Get skills by workspace
          skillStore.createIndex('category', 'category');         // Filter by category
          skillStore.createIndex('createdAt', 'createdAt');       // Sort by creation date
        }

        // ─────────────────────────────────────────────────────────────────────
        // SKILL EXECUTIONS STORE
        // Records history of all skill runs with inputs/outputs
        // ─────────────────────────────────────────────────────────────────────
        if (!db.objectStoreNames.contains(STORES.SKILL_EXECUTIONS)) {
          const execStore = db.createObjectStore(STORES.SKILL_EXECUTIONS, { keyPath: 'id' });
          execStore.createIndex('skillId', 'skillId');           // Get runs by skill
          execStore.createIndex('workspaceId', 'workspaceId');   // Get runs by workspace
          execStore.createIndex('createdAt', 'createdAt');       // Sort by date
        }

        // ─────────────────────────────────────────────────────────────────────
        // USER PREFERENCES STORE
        // Stores user settings (theme, default API, etc.)
        // Uses 'default' as the single key for all preferences
        // ─────────────────────────────────────────────────────────────────────
        if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
          db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'id' });
        }

        // ─────────────────────────────────────────────────────────────────────
        // SAVED OUTPUTS STORE (Added in v2)
        // Stores AI-generated outputs that users want to keep
        // ─────────────────────────────────────────────────────────────────────
        if (!db.objectStoreNames.contains(STORES.SAVED_OUTPUTS)) {
          const savedStore = db.createObjectStore(STORES.SAVED_OUTPUTS, { keyPath: 'id' });
          savedStore.createIndex('skillId', 'skillId');         // Get outputs by skill
          savedStore.createIndex('createdAt', 'createdAt');     // Sort by date
          savedStore.createIndex('isFavorite', 'isFavorite');   // Filter favorites
        }

        // ─────────────────────────────────────────────────────────────────────
        // FAVORITE SKILLS STORE (Added in v2)
        // Tracks which skills the user has bookmarked
        // ─────────────────────────────────────────────────────────────────────
        if (!db.objectStoreNames.contains(STORES.FAVORITE_SKILLS)) {
          const favStore = db.createObjectStore(STORES.FAVORITE_SKILLS, { keyPath: 'id' });
          favStore.createIndex('skillId', 'skillId');           // Lookup by skill ID
          favStore.createIndex('createdAt', 'createdAt');       // Sort by date added
        }

        // ─────────────────────────────────────────────────────────────────────
        // WORKFLOW EXECUTIONS STORE (Added in v3)
        // Stores completed workflow runs for history and reuse
        // ─────────────────────────────────────────────────────────────────────
        if (!db.objectStoreNames.contains(STORES.WORKFLOW_EXECUTIONS)) {
          const wfExecStore = db.createObjectStore(STORES.WORKFLOW_EXECUTIONS, { keyPath: 'id' });
          wfExecStore.createIndex('workflowId', 'workflowId');   // Get executions by workflow
          wfExecStore.createIndex('startedAt', 'startedAt');     // Sort by start time
          wfExecStore.createIndex('status', 'status');           // Filter by status
          wfExecStore.createIndex('isFavorite', 'isFavorite');   // Filter favorites
        }

        // ─────────────────────────────────────────────────────────────────────
        // CUSTOM WORKFLOWS STORE (Added in v4)
        // User-created custom workflows
        // ─────────────────────────────────────────────────────────────────────
        if (!db.objectStoreNames.contains(STORES.CUSTOM_WORKFLOWS)) {
          const cwStore = db.createObjectStore(STORES.CUSTOM_WORKFLOWS, { keyPath: 'id' });
          cwStore.createIndex('createdAt', 'createdAt');         // Sort by creation time
          cwStore.createIndex('updatedAt', 'updatedAt');         // Sort by update time
          cwStore.createIndex('sourceWorkflowId', 'sourceWorkflowId'); // Find duplicates
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get the database connection, throwing if not initialized
   *
   * This is a safety method to ensure all operations have a valid
   * database connection before attempting to use it.
   */
  private ensureDb(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKSPACE OPERATIONS
  // Workspaces contain job description analysis and skill recommendations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new workspace
   * @param workspace - The workspace object to store
   */
  async createWorkspace(workspace: Workspace): Promise<void> {
    return this.put(STORES.WORKSPACES, workspace);
  }

  /**
   * Update an existing workspace
   * Automatically updates the updatedAt timestamp
   * @param workspace - The workspace with updated fields
   */
  async updateWorkspace(workspace: Workspace): Promise<void> {
    return this.put(STORES.WORKSPACES, { ...workspace, updatedAt: new Date().toISOString() });
  }

  /**
   * Get a single workspace by ID
   * @param id - The workspace ID
   * @returns The workspace or undefined if not found
   */
  async getWorkspace(id: string): Promise<Workspace | undefined> {
    return this.get(STORES.WORKSPACES, id);
  }

  /**
   * Get all workspaces, sorted by most recently updated
   * @returns Array of all workspaces
   */
  async getAllWorkspaces(): Promise<Workspace[]> {
    const workspaces = await this.getAll<Workspace>(STORES.WORKSPACES);
    // Sort by updatedAt descending (newest first)
    return workspaces.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Delete a workspace and all associated data
   *
   * This performs cascading deletes:
   * 1. Delete all skills in the workspace
   * 2. Delete all executions for those skills
   * 3. Delete the workspace itself
   *
   * @param id - The workspace ID to delete
   */
  async deleteWorkspace(id: string): Promise<void> {
    // Delete associated skills first (prevents orphaned records)
    const skills = await this.getSkillsByWorkspace(id);
    for (const skill of skills) {
      await this.deleteDynamicSkill(skill.id);
    }

    // Delete associated executions
    const executions = await this.getExecutionsByWorkspace(id);
    for (const exec of executions) {
      await this.delete(STORES.SKILL_EXECUTIONS, exec.id);
    }

    // Finally delete the workspace
    return this.delete(STORES.WORKSPACES, id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DYNAMIC SKILL OPERATIONS
  // Dynamic skills are AI skills created by users from workspace analysis
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a dynamic skill (create or update)
   * @param skill - The skill object to save
   */
  async saveDynamicSkill(skill: DynamicSkill): Promise<void> {
    return this.put(STORES.DYNAMIC_SKILLS, skill);
  }

  /**
   * Get a single dynamic skill by ID
   * @param id - The skill ID
   * @returns The skill or undefined if not found
   */
  async getDynamicSkill(id: string): Promise<DynamicSkill | undefined> {
    return this.get(STORES.DYNAMIC_SKILLS, id);
  }

  /**
   * Get all skills belonging to a specific workspace
   * Uses the workspaceId index for efficient lookup
   * @param workspaceId - The workspace ID
   * @returns Array of skills in that workspace
   */
  async getSkillsByWorkspace(workspaceId: string): Promise<DynamicSkill[]> {
    return this.getAllByIndex(STORES.DYNAMIC_SKILLS, 'workspaceId', workspaceId);
  }

  /**
   * Get all dynamic skills across all workspaces
   * @returns Array of all dynamic skills
   */
  async getAllDynamicSkills(): Promise<DynamicSkill[]> {
    return this.getAll(STORES.DYNAMIC_SKILLS);
  }

  /**
   * Delete a dynamic skill
   * @param id - The skill ID to delete
   */
  async deleteDynamicSkill(id: string): Promise<void> {
    return this.delete(STORES.DYNAMIC_SKILLS, id);
  }

  /**
   * Increment the execution count for a skill
   *
   * Called each time a skill is run to track usage statistics.
   * Also updates lastExecutedAt timestamp.
   *
   * @param id - The skill ID
   */
  async updateSkillExecutionCount(id: string): Promise<void> {
    const skill = await this.getDynamicSkill(id);
    if (skill) {
      skill.executionCount = (skill.executionCount || 0) + 1;
      skill.lastExecutedAt = new Date().toISOString();
      await this.saveDynamicSkill(skill);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTION HISTORY
  // Tracks every skill execution with inputs, outputs, and metadata
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a skill execution record
   * @param execution - The execution data to save
   */
  async saveExecution(execution: SkillExecution): Promise<void> {
    return this.put(STORES.SKILL_EXECUTIONS, execution);
  }

  /**
   * Get a single execution by ID
   * @param id - The execution ID
   * @returns The execution or undefined if not found
   */
  async getExecution(id: string): Promise<SkillExecution | undefined> {
    return this.get(STORES.SKILL_EXECUTIONS, id);
  }

  /**
   * Get all executions for a specific skill
   * @param skillId - The skill ID
   * @returns Array of executions for that skill
   */
  async getExecutionsBySkill(skillId: string): Promise<SkillExecution[]> {
    return this.getAllByIndex(STORES.SKILL_EXECUTIONS, 'skillId', skillId);
  }

  /**
   * Get all executions within a workspace
   * @param workspaceId - The workspace ID
   * @returns Array of executions in that workspace
   */
  async getExecutionsByWorkspace(workspaceId: string): Promise<SkillExecution[]> {
    return this.getAllByIndex(STORES.SKILL_EXECUTIONS, 'workspaceId', workspaceId);
  }

  /**
   * Get recent executions across all skills
   * @param limit - Maximum number of executions to return (default: 50)
   * @returns Array of recent executions, sorted newest first
   */
  async getRecentExecutions(limit: number = 50): Promise<SkillExecution[]> {
    const all = await this.getAll<SkillExecution>(STORES.SKILL_EXECUTIONS);
    return all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Delete an execution record
   * @param id - The execution ID to delete
   */
  async deleteExecution(id: string): Promise<void> {
    return this.delete(STORES.SKILL_EXECUTIONS, id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // USER PREFERENCES
  // Stores app-wide settings like theme, default API, etc.
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get user preferences
   *
   * Uses 'default' as the key since there's only one preferences record.
   * @returns The preferences object or undefined if not set
   */
  async getPreferences(): Promise<UserPreferences | undefined> {
    return this.get(STORES.USER_PREFERENCES, 'default');
  }

  /**
   * Save user preferences
   * @param prefs - The preferences object to save
   */
  async savePreferences(prefs: UserPreferences): Promise<void> {
    return this.put(STORES.USER_PREFERENCES, prefs);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVED OUTPUTS
  // Stores AI-generated outputs that users want to keep
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save an AI output
   * @param output - The output data to save
   */
  async saveOutput(output: SavedOutput): Promise<void> {
    return this.put(STORES.SAVED_OUTPUTS, output);
  }

  /**
   * Get a saved output by ID
   * @param id - The output ID
   * @returns The output or undefined if not found
   */
  async getSavedOutput(id: string): Promise<SavedOutput | undefined> {
    return this.get(STORES.SAVED_OUTPUTS, id);
  }

  /**
   * Get all saved outputs, sorted by creation date (newest first)
   * @returns Array of all saved outputs
   */
  async getAllSavedOutputs(): Promise<SavedOutput[]> {
    const outputs = await this.getAll<SavedOutput>(STORES.SAVED_OUTPUTS);
    return outputs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get all saved outputs for a specific skill
   * @param skillId - The skill ID
   * @returns Array of outputs generated by that skill
   */
  async getSavedOutputsBySkill(skillId: string): Promise<SavedOutput[]> {
    return this.getAllByIndex(STORES.SAVED_OUTPUTS, 'skillId', skillId);
  }

  /**
   * Get only favorited outputs
   * @returns Array of outputs marked as favorites
   */
  async getFavoriteSavedOutputs(): Promise<SavedOutput[]> {
    const all = await this.getAll<SavedOutput>(STORES.SAVED_OUTPUTS);
    return all
      .filter(o => o.isFavorite)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Update a saved output (partial update)
   *
   * Automatically updates the updatedAt timestamp.
   *
   * @param id - The output ID to update
   * @param updates - Object containing fields to update
   */
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

  /**
   * Delete a saved output
   * @param id - The output ID to delete
   */
  async deleteSavedOutput(id: string): Promise<void> {
    return this.delete(STORES.SAVED_OUTPUTS, id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAVORITE SKILLS
  // Tracks which skills the user has bookmarked for quick access
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add a skill to favorites
   * @param favorite - The favorite record to add
   */
  async addFavoriteSkill(favorite: FavoriteSkill): Promise<void> {
    return this.put(STORES.FAVORITE_SKILLS, favorite);
  }

  /**
   * Get a favorite record by ID
   * @param id - The favorite record ID
   * @returns The favorite or undefined if not found
   */
  async getFavoriteSkill(id: string): Promise<FavoriteSkill | undefined> {
    return this.get(STORES.FAVORITE_SKILLS, id);
  }

  /**
   * Get all favorited skills, sorted by date added (newest first)
   * @returns Array of all favorite records
   */
  async getAllFavoriteSkills(): Promise<FavoriteSkill[]> {
    const favorites = await this.getAll<FavoriteSkill>(STORES.FAVORITE_SKILLS);
    return favorites.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Find a favorite record by skill ID
   *
   * Since the favorite record ID is different from the skill ID,
   * this method looks up the favorite by the skillId index.
   *
   * @param skillId - The skill ID to look up
   * @returns The favorite record or undefined if not favorited
   */
  async getFavoriteBySkillId(skillId: string): Promise<FavoriteSkill | undefined> {
    const favorites = await this.getAllByIndex<FavoriteSkill>(STORES.FAVORITE_SKILLS, 'skillId', skillId);
    return favorites[0]; // There should only be one favorite per skill
  }

  /**
   * Check if a skill is favorited
   * @param skillId - The skill ID to check
   * @returns true if the skill is favorited, false otherwise
   */
  async isSkillFavorited(skillId: string): Promise<boolean> {
    const favorite = await this.getFavoriteBySkillId(skillId);
    return !!favorite;
  }

  /**
   * Remove a skill from favorites by favorite record ID
   * @param id - The favorite record ID
   */
  async removeFavoriteSkill(id: string): Promise<void> {
    return this.delete(STORES.FAVORITE_SKILLS, id);
  }

  /**
   * Remove a skill from favorites by skill ID
   *
   * Looks up the favorite record by skill ID and deletes it.
   *
   * @param skillId - The skill ID to unfavorite
   */
  async removeFavoriteBySkillId(skillId: string): Promise<void> {
    const favorite = await this.getFavoriteBySkillId(skillId);
    if (favorite) {
      await this.delete(STORES.FAVORITE_SKILLS, favorite.id);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW EXECUTIONS
  // Stores completed workflow runs for history and reuse
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a workflow execution
   * @param execution - The workflow execution to save
   */
  async saveWorkflowExecution(execution: WorkflowExecution): Promise<void> {
    return this.put(STORES.WORKFLOW_EXECUTIONS, execution);
  }

  /**
   * Get a workflow execution by ID
   * @param id - The execution ID
   * @returns The execution or undefined if not found
   */
  async getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined> {
    return this.get(STORES.WORKFLOW_EXECUTIONS, id);
  }

  /**
   * Get all workflow executions, sorted by start time (newest first)
   * @param limit - Maximum number of executions to return
   * @returns Array of workflow executions
   */
  async getAllWorkflowExecutions(limit?: number): Promise<WorkflowExecution[]> {
    const executions = await this.getAll<WorkflowExecution>(STORES.WORKFLOW_EXECUTIONS);
    const sorted = executions.sort((a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get workflow executions for a specific workflow
   * @param workflowId - The workflow ID
   * @returns Array of executions for that workflow
   */
  async getWorkflowExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    const executions = await this.getAllByIndex<WorkflowExecution>(
      STORES.WORKFLOW_EXECUTIONS,
      'workflowId',
      workflowId
    );
    return executions.sort((a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  /**
   * Get favorite workflow executions
   * @returns Array of favorited executions
   */
  async getFavoriteWorkflowExecutions(): Promise<WorkflowExecution[]> {
    const all = await this.getAll<WorkflowExecution>(STORES.WORKFLOW_EXECUTIONS);
    return all
      .filter(e => e.isFavorite)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  /**
   * Update a workflow execution
   * @param id - The execution ID
   * @param updates - Fields to update
   */
  async updateWorkflowExecution(id: string, updates: Partial<WorkflowExecution>): Promise<void> {
    const execution = await this.getWorkflowExecution(id);
    if (execution) {
      await this.put(STORES.WORKFLOW_EXECUTIONS, { ...execution, ...updates });
    }
  }

  /**
   * Delete a workflow execution
   * @param id - The execution ID to delete
   */
  async deleteWorkflowExecution(id: string): Promise<void> {
    return this.delete(STORES.WORKFLOW_EXECUTIONS, id);
  }

  /**
   * Search workflow executions by title or tags
   * @param query - Search query
   * @returns Array of matching executions
   */
  async searchWorkflowExecutions(query: string): Promise<WorkflowExecution[]> {
    const all = await this.getAll<WorkflowExecution>(STORES.WORKFLOW_EXECUTIONS);
    const lowerQuery = query.toLowerCase();
    return all
      .filter(e =>
        e.title?.toLowerCase().includes(lowerQuery) ||
        e.workflowName.toLowerCase().includes(lowerQuery) ||
        e.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOM WORKFLOWS
  // User-created custom workflows
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a custom workflow
   * @param workflow - The custom workflow to save
   */
  async saveCustomWorkflow(workflow: CustomWorkflow): Promise<void> {
    return this.put(STORES.CUSTOM_WORKFLOWS, workflow);
  }

  /**
   * Get a custom workflow by ID
   * @param id - The workflow ID
   * @returns The workflow or undefined if not found
   */
  async getCustomWorkflow(id: string): Promise<CustomWorkflow | undefined> {
    return this.get(STORES.CUSTOM_WORKFLOWS, id);
  }

  /**
   * Get all custom workflows, sorted by update time (newest first)
   * @returns Array of custom workflows
   */
  async getAllCustomWorkflows(): Promise<CustomWorkflow[]> {
    const workflows = await this.getAll<CustomWorkflow>(STORES.CUSTOM_WORKFLOWS);
    return workflows.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Update a custom workflow
   * @param id - The workflow ID
   * @param updates - Fields to update
   */
  async updateCustomWorkflow(id: string, updates: Partial<CustomWorkflow>): Promise<void> {
    const workflow = await this.getCustomWorkflow(id);
    if (workflow) {
      await this.put(STORES.CUSTOM_WORKFLOWS, {
        ...workflow,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete a custom workflow
   * @param id - The workflow ID to delete
   */
  async deleteCustomWorkflow(id: string): Promise<void> {
    return this.delete(STORES.CUSTOM_WORKFLOWS, id);
  }

  /**
   * Duplicate a workflow (built-in or custom) as a new custom workflow
   * @param sourceWorkflow - The workflow to duplicate
   * @param newName - Name for the new workflow
   * @returns The new custom workflow
   */
  async duplicateWorkflow(sourceWorkflow: CustomWorkflow | { id: string; name: string; description: string; longDescription?: string; icon: string; color: string; estimatedTime: string; outputs: string[]; globalInputs: any[]; steps: any[] }, newName: string): Promise<CustomWorkflow> {
    const now = new Date().toISOString();
    const newWorkflow: CustomWorkflow = {
      id: `custom-${crypto.randomUUID()}`,
      name: newName,
      description: sourceWorkflow.description,
      longDescription: sourceWorkflow.longDescription,
      icon: sourceWorkflow.icon,
      color: sourceWorkflow.color,
      estimatedTime: sourceWorkflow.estimatedTime,
      outputs: [...sourceWorkflow.outputs],
      globalInputs: JSON.parse(JSON.stringify(sourceWorkflow.globalInputs)),
      steps: JSON.parse(JSON.stringify(sourceWorkflow.steps)),
      createdAt: now,
      updatedAt: now,
      sourceWorkflowId: sourceWorkflow.id,
    };

    await this.saveCustomWorkflow(newWorkflow);
    return newWorkflow;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT / IMPORT
  // Allows users to export workspaces and reimport them
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Export a workspace with all its skills
   *
   * Creates a portable data package that can be imported elsewhere.
   *
   * @param workspaceId - The workspace ID to export
   * @returns Object containing workspace and skills, or null if not found
   */
  async exportWorkspace(workspaceId: string): Promise<{
    workspace: Workspace;
    skills: DynamicSkill[];
  } | null> {
    const workspace = await this.getWorkspace(workspaceId);
    if (!workspace) return null;

    const skills = await this.getSkillsByWorkspace(workspaceId);
    return { workspace, skills };
  }

  /**
   * Import a workspace from exported data
   *
   * Generates new IDs to avoid conflicts with existing data.
   * This allows the same workspace to be imported multiple times.
   *
   * @param data - The exported workspace data
   */
  async importWorkspace(data: {
    workspace: Workspace;
    skills: DynamicSkill[];
  }): Promise<void> {
    // Generate new IDs to avoid conflicts
    const newWorkspaceId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create workspace with new ID and timestamps
    const workspace: Workspace = {
      ...data.workspace,
      id: newWorkspaceId,
      createdAt: now,
      updatedAt: now,
    };

    await this.createWorkspace(workspace);

    // Import each skill with new IDs
    for (const skill of data.skills) {
      const newSkill: DynamicSkill = {
        ...skill,
        id: crypto.randomUUID(),
        workspaceId: newWorkspaceId, // Link to new workspace
        createdAt: now,
        updatedAt: now,
        executionCount: 0,           // Reset usage stats
        lastExecutedAt: undefined,
      };
      await this.saveDynamicSkill(newSkill);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERIC HELPERS
  // Low-level methods that wrap IndexedDB operations with Promises
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Put (insert or update) an item in a store
   *
   * Uses 'put' which updates if key exists, inserts if not.
   *
   * @param storeName - The object store name
   * @param item - The item to store
   */
  private async put<T>(storeName: string, item: T): Promise<void> {
    await this.init(); // Ensure database is initialized
    return new Promise((resolve, reject) => {
      // Create a read-write transaction
      const tx = this.ensureDb().transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get a single item by key
   *
   * @param storeName - The object store name
   * @param key - The key to look up
   * @returns The item or undefined if not found
   */
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

  /**
   * Get all items in a store
   *
   * @param storeName - The object store name
   * @returns Array of all items
   */
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

  /**
   * Get all items matching an index value
   *
   * Indexes allow efficient queries by non-key fields.
   *
   * @param storeName - The object store name
   * @param indexName - The index to query
   * @param value - The value to match
   * @returns Array of matching items
   */
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

  /**
   * Delete an item by key
   *
   * @param storeName - The object store name
   * @param key - The key of the item to delete
   */
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

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR ALL DATA
  // Destructive operation to wipe all data (useful for testing/reset)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Clear all data from all stores
   *
   * WARNING: This permanently deletes all stored data!
   * Used for "Reset All Data" functionality.
   */
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

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// Export a single instance used throughout the application
// ─────────────────────────────────────────────────────────────────────────────

export const db = new SkillEngineDB();
