/**
 * evalStorage.ts - Evaluation Records Storage
 *
 * Manages storage and retrieval of evaluation records using IndexedDB.
 */

import type { EvalRecord } from './grader';
import type { SkillTestSuite, WorkflowTestSuite } from './testCaseGenerator';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const DB_NAME = 'skillengine-testing';
const DB_VERSION = 1;

const STORES = {
  EVAL_RECORDS: 'evalRecords',
  SKILL_TESTS: 'skillTests',
  WORKFLOW_TESTS: 'workflowTests',
  PROMPT_VERSIONS: 'promptVersions',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

let dbInstance: IDBDatabase | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Eval records store
      if (!db.objectStoreNames.contains(STORES.EVAL_RECORDS)) {
        const evalStore = db.createObjectStore(STORES.EVAL_RECORDS, { keyPath: 'id' });
        evalStore.createIndex('skillId', 'skillId', { unique: false });
        evalStore.createIndex('workflowId', 'workflowId', { unique: false });
        evalStore.createIndex('timestamp', 'timestamp', { unique: false });
        evalStore.createIndex('testType', 'testType', { unique: false });
      }

      // Skill test suites store
      if (!db.objectStoreNames.contains(STORES.SKILL_TESTS)) {
        db.createObjectStore(STORES.SKILL_TESTS, { keyPath: 'skillId' });
      }

      // Workflow test suites store
      if (!db.objectStoreNames.contains(STORES.WORKFLOW_TESTS)) {
        db.createObjectStore(STORES.WORKFLOW_TESTS, { keyPath: 'workflowId' });
      }

      // Prompt versions store (for optimization tracking)
      if (!db.objectStoreNames.contains(STORES.PROMPT_VERSIONS)) {
        const promptStore = db.createObjectStore(STORES.PROMPT_VERSIONS, { keyPath: 'id' });
        promptStore.createIndex('skillId', 'skillId', { unique: false });
        promptStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// EVAL RECORDS CRUD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save an eval record
 */
export async function saveEvalRecord(record: EvalRecord): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.EVAL_RECORDS, 'readwrite');
    const store = tx.objectStore(STORES.EVAL_RECORDS);
    const request = store.put(record);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all eval records for a skill
 */
export async function getEvalRecordsForSkill(skillId: string): Promise<EvalRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.EVAL_RECORDS, 'readonly');
    const store = tx.objectStore(STORES.EVAL_RECORDS);
    const index = store.index('skillId');
    const request = index.getAll(skillId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Get all eval records for a workflow
 */
export async function getEvalRecordsForWorkflow(workflowId: string): Promise<EvalRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.EVAL_RECORDS, 'readonly');
    const store = tx.objectStore(STORES.EVAL_RECORDS);
    const index = store.index('workflowId');
    const request = index.getAll(workflowId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Get recent eval records (all types)
 */
export async function getRecentEvalRecords(limit: number = 50): Promise<EvalRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.EVAL_RECORDS, 'readonly');
    const store = tx.objectStore(STORES.EVAL_RECORDS);
    const index = store.index('timestamp');
    const records: EvalRecord[] = [];

    const request = index.openCursor(null, 'prev');

    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && records.length < limit) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        resolve(records);
      }
    };
  });
}

/**
 * Delete an eval record
 */
export async function deleteEvalRecord(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.EVAL_RECORDS, 'readwrite');
    const store = tx.objectStore(STORES.EVAL_RECORDS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all eval records for a skill
 */
export async function clearEvalRecordsForSkill(skillId: string): Promise<void> {
  const records = await getEvalRecordsForSkill(skillId);
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.EVAL_RECORDS, 'readwrite');
    const store = tx.objectStore(STORES.EVAL_RECORDS);

    let completed = 0;
    const total = records.length;

    if (total === 0) {
      resolve();
      return;
    }

    for (const record of records) {
      const request = store.delete(record.id);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(request.error);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITES CRUD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save a skill test suite
 */
export async function saveSkillTestSuite(suite: SkillTestSuite): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SKILL_TESTS, 'readwrite');
    const store = tx.objectStore(STORES.SKILL_TESTS);
    const request = store.put(suite);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get a skill test suite
 */
export async function getSkillTestSuite(skillId: string): Promise<SkillTestSuite | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SKILL_TESTS, 'readonly');
    const store = tx.objectStore(STORES.SKILL_TESTS);
    const request = store.get(skillId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get all skill test suites
 */
export async function getAllSkillTestSuites(): Promise<SkillTestSuite[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SKILL_TESTS, 'readonly');
    const store = tx.objectStore(STORES.SKILL_TESTS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Save a workflow test suite
 */
export async function saveWorkflowTestSuite(suite: WorkflowTestSuite): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.WORKFLOW_TESTS, 'readwrite');
    const store = tx.objectStore(STORES.WORKFLOW_TESTS);
    const request = store.put(suite);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get a workflow test suite
 */
export async function getWorkflowTestSuite(workflowId: string): Promise<WorkflowTestSuite | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.WORKFLOW_TESTS, 'readonly');
    const store = tx.objectStore(STORES.WORKFLOW_TESTS);
    const request = store.get(workflowId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get all workflow test suites
 */
export async function getAllWorkflowTestSuites(): Promise<WorkflowTestSuite[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.WORKFLOW_TESTS, 'readonly');
    const store = tx.objectStore(STORES.WORKFLOW_TESTS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT VERSION TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export interface PromptVersion {
  id: string;
  skillId: string;
  version: number;
  timestamp: string;
  promptContent: string;
  changeDescription: string;
  evalScoreBefore?: number;
  evalScoreAfter?: number;
}

/**
 * Save a prompt version
 */
export async function savePromptVersion(version: PromptVersion): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PROMPT_VERSIONS, 'readwrite');
    const store = tx.objectStore(STORES.PROMPT_VERSIONS);
    const request = store.put(version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get prompt versions for a skill
 */
export async function getPromptVersionsForSkill(skillId: string): Promise<PromptVersion[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PROMPT_VERSIONS, 'readonly');
    const store = tx.objectStore(STORES.PROMPT_VERSIONS);
    const index = store.index('skillId');
    const request = index.getAll(skillId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Get latest prompt version for a skill
 */
export async function getLatestPromptVersion(skillId: string): Promise<PromptVersion | undefined> {
  const versions = await getPromptVersionsForSkill(skillId);
  if (versions.length === 0) return undefined;
  return versions.sort((a, b) => b.version - a.version)[0];
}

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICS & AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillEvalStats {
  skillId: string;
  totalEvals: number;
  averageScore: number;
  lastEvalDate: string | null;
  scoresByType: Record<string, number>;
  trend: 'improving' | 'declining' | 'stable' | 'unknown';
}

/**
 * Get evaluation statistics for a skill
 */
export async function getSkillEvalStats(skillId: string): Promise<SkillEvalStats> {
  const records = await getEvalRecordsForSkill(skillId);

  if (records.length === 0) {
    return {
      skillId,
      totalEvals: 0,
      averageScore: 0,
      lastEvalDate: null,
      scoresByType: {},
      trend: 'unknown',
    };
  }

  // Sort by timestamp
  const sorted = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Calculate average score
  const averageScore =
    records.reduce((sum, r) => sum + r.gradingResult.overallScore, 0) / records.length;

  // Group by test type
  const scoresByType: Record<string, number[]> = {};
  for (const record of records) {
    if (!scoresByType[record.testType]) {
      scoresByType[record.testType] = [];
    }
    scoresByType[record.testType].push(record.gradingResult.overallScore);
  }

  const avgScoresByType: Record<string, number> = {};
  for (const [type, scores] of Object.entries(scoresByType)) {
    avgScoresByType[type] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  // Determine trend (compare first half vs second half)
  let trend: 'improving' | 'declining' | 'stable' | 'unknown' = 'unknown';
  if (records.length >= 4) {
    const midpoint = Math.floor(records.length / 2);
    const olderRecords = sorted.slice(midpoint);
    const newerRecords = sorted.slice(0, midpoint);

    const olderAvg = olderRecords.reduce((s, r) => s + r.gradingResult.overallScore, 0) / olderRecords.length;
    const newerAvg = newerRecords.reduce((s, r) => s + r.gradingResult.overallScore, 0) / newerRecords.length;

    const diff = newerAvg - olderAvg;
    if (diff > 5) trend = 'improving';
    else if (diff < -5) trend = 'declining';
    else trend = 'stable';
  }

  return {
    skillId,
    totalEvals: records.length,
    averageScore: Math.round(averageScore),
    lastEvalDate: sorted[0]?.timestamp || null,
    scoresByType: avgScoresByType,
    trend,
  };
}

/**
 * Get summary stats for all skills
 */
export async function getAllSkillEvalStats(): Promise<Map<string, SkillEvalStats>> {
  const records = await getRecentEvalRecords(1000);
  const skillIds = new Set(records.filter((r) => r.skillId).map((r) => r.skillId!));

  const stats = new Map<string, SkillEvalStats>();
  for (const skillId of skillIds) {
    const skillStats = await getSkillEvalStats(skillId);
    stats.set(skillId, skillStats);
  }

  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT/IMPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Export all eval data as JSON
 */
export async function exportAllEvalData(): Promise<string> {
  const [evalRecords, skillTests, workflowTests] = await Promise.all([
    getRecentEvalRecords(10000),
    getAllSkillTestSuites(),
    getAllWorkflowTestSuites(),
  ]);

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      evalRecords,
      skillTests,
      workflowTests,
    },
    null,
    2
  );
}

/**
 * Clear all testing data
 */
export async function clearAllTestingData(): Promise<void> {
  const db = await openDatabase();

  const storeNames = [STORES.EVAL_RECORDS, STORES.SKILL_TESTS, STORES.WORKFLOW_TESTS, STORES.PROMPT_VERSIONS];

  for (const storeName of storeNames) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
