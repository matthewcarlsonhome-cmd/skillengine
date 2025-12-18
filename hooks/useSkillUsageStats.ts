/**
 * useSkillUsageStats Hook
 *
 * Provides skill usage statistics for users, including
 * aggregates, breakdowns, and trend data.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  SkillUsageStat,
  UserUsageStats,
  SkillUsageBreakdown,
} from '../lib/emailSegmentation/types';
import {
  getAllUsageStats,
  getUserUsageStats,
  recordSkillUsage,
} from '../lib/emailSegmentation/storage';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillAggregate {
  skillId: string;
  skillName: string;
  totalRuns: number;
  uniqueUsers: number;
  lastUsedAt: string;
}

export interface UseSkillUsageStatsReturn {
  // Raw stats
  allStats: SkillUsageStat[];
  userStats: Map<string, SkillUsageStat[]>;

  // Aggregates
  skillAggregates: SkillAggregate[];
  topSkills: SkillAggregate[];

  // User-specific
  getUserStats: (userId: string) => UserUsageStats | null;
  getUserTopSkills: (userId: string, topN?: number) => SkillUsageBreakdown[];

  // Actions
  recordUsage: (userId: string, skillId: string, skillName: string) => Promise<void>;
  refresh: () => Promise<void>;

  // State
  isLoading: boolean;
  error: string | null;

  // Period filtering
  filterByPeriod: (days: number) => SkillUsageStat[];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function aggregateBySkill(stats: SkillUsageStat[]): SkillAggregate[] {
  const aggregateMap = new Map<string, SkillAggregate>();

  for (const stat of stats) {
    const existing = aggregateMap.get(stat.skillId);

    if (existing) {
      existing.totalRuns += stat.runCount;
      existing.uniqueUsers += 1;
      if (stat.lastUsedAt > existing.lastUsedAt) {
        existing.lastUsedAt = stat.lastUsedAt;
      }
    } else {
      aggregateMap.set(stat.skillId, {
        skillId: stat.skillId,
        skillName: stat.skillName,
        totalRuns: stat.runCount,
        uniqueUsers: 1,
        lastUsedAt: stat.lastUsedAt,
      });
    }
  }

  return Array.from(aggregateMap.values());
}

function buildUserUsageStats(stats: SkillUsageStat[]): UserUsageStats | null {
  if (stats.length === 0) return null;

  let totalRuns = 0;
  let lastActiveAt: string | null = null;

  for (const stat of stats) {
    totalRuns += stat.runCount;
    if (!lastActiveAt || stat.lastUsedAt > lastActiveAt) {
      lastActiveAt = stat.lastUsedAt;
    }
  }

  // Build breakdown
  const breakdown: SkillUsageBreakdown[] = stats
    .sort((a, b) => b.runCount - a.runCount)
    .map(stat => ({
      skillId: stat.skillId,
      skillName: stat.skillName,
      runCount: stat.runCount,
      percentage: totalRuns > 0 ? (stat.runCount / totalRuns) * 100 : 0,
      lastUsedAt: stat.lastUsedAt,
    }));

  return {
    userId: stats[0].userId,
    totalRuns,
    skillBreakdown: breakdown,
    lastActiveAt,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export function useSkillUsageStats(): UseSkillUsageStatsReturn {
  const [allStats, setAllStats] = useState<SkillUsageStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build user stats map
  const userStats = useMemo(() => {
    const map = new Map<string, SkillUsageStat[]>();
    for (const stat of allStats) {
      const existing = map.get(stat.userId) || [];
      existing.push(stat);
      map.set(stat.userId, existing);
    }
    return map;
  }, [allStats]);

  // Skill aggregates
  const skillAggregates = useMemo(() => aggregateBySkill(allStats), [allStats]);

  // Top skills by total runs
  const topSkills = useMemo(
    () => [...skillAggregates].sort((a, b) => b.totalRuns - a.totalRuns).slice(0, 10),
    [skillAggregates]
  );

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stats = await getAllUsageStats();
      setAllStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load usage stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get stats for a specific user
  const getUserStatsFunc = useCallback(
    (userId: string): UserUsageStats | null => {
      const stats = userStats.get(userId);
      if (!stats || stats.length === 0) return null;
      return buildUserUsageStats(stats);
    },
    [userStats]
  );

  // Get top skills for a user
  const getUserTopSkills = useCallback(
    (userId: string, topN: number = 3): SkillUsageBreakdown[] => {
      const stats = getUserStatsFunc(userId);
      if (!stats) return [];
      return stats.skillBreakdown.slice(0, topN);
    },
    [getUserStatsFunc]
  );

  // Record usage
  const recordUsageFunc = useCallback(
    async (userId: string, skillId: string, skillName: string) => {
      await recordSkillUsage(userId, skillId, skillName);
      // Refresh to get updated stats
      await loadData();
    },
    [loadData]
  );

  // Filter by period
  const filterByPeriod = useCallback(
    (days: number): SkillUsageStat[] => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffTimestamp = cutoff.toISOString();

      return allStats.filter(stat => stat.lastUsedAt >= cutoffTimestamp);
    },
    [allStats]
  );

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    allStats,
    userStats,
    skillAggregates,
    topSkills,
    getUserStats: getUserStatsFunc,
    getUserTopSkills,
    recordUsage: recordUsageFunc,
    refresh,
    isLoading,
    error,
    filterByPeriod,
  };
}

export default useSkillUsageStats;
