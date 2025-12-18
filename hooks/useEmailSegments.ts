/**
 * useEmailSegments Hook
 *
 * Manages email recipient segmentation with filtering,
 * preview, and selection state for the Admin Control Panel.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DEFAULT_SEGMENTATION_FILTER,
  type EmailRecipient,
  type SegmentationFilter,
  type SkillUsageStat,
} from '../lib/emailSegmentation/types';
import {
  validateFilter,
  describeFilter,
  filterRecipients,
} from '../lib/emailSegmentation/filters';
import {
  getAllEmailRecipients,
  getAllUsageStats,
  getFilteredRecipients,
} from '../lib/emailSegmentation/storage';
import { logSegmentFilter, logEmailPreview } from '../lib/emailSegmentation/audit';
import { useAuth } from './useAuth';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseEmailSegmentsReturn {
  // State
  recipients: EmailRecipient[];
  filteredRecipients: EmailRecipient[];
  selectedRecipientIds: Set<string>;
  filter: SegmentationFilter;
  isLoading: boolean;
  error: string | null;

  // Filter management
  setFilter: (filter: SegmentationFilter) => void;
  updateFilter: (updates: Partial<SegmentationFilter>) => void;
  resetFilter: () => void;
  filterDescription: string;
  filterValidation: { valid: boolean; errors: string[] };

  // Selection management
  selectRecipient: (userId: string) => void;
  deselectRecipient: (userId: string) => void;
  toggleRecipient: (userId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectFiltered: () => void;

  // Actions
  applyFilter: () => Promise<void>;
  previewRecipients: () => Promise<EmailRecipient[]>;
  refresh: () => Promise<void>;

  // Stats
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  optedInCount: number;
  stats: {
    totalCount: number;
    filteredCount: number;
    selectedCount: number;
    optedInCount: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export function useEmailSegments(): UseEmailSegmentsReturn {
  const { user, appUser } = useAuth();

  // State
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [usageStats, setUsageStats] = useState<Map<string, SkillUsageStat[]>>(new Map());
  const [filter, setFilterState] = useState<SegmentationFilter>(DEFAULT_SEGMENTATION_FILTER);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const filteredRecipients = useMemo(() => {
    return filterRecipients(recipients, filter, usageStats);
  }, [recipients, filter, usageStats]);

  const filterDescription = useMemo(() => describeFilter(filter), [filter]);
  const filterValidation = useMemo(() => validateFilter(filter), [filter]);

  // Stats
  const totalCount = recipients.length;
  const filteredCount = filteredRecipients.length;
  const selectedCount = selectedRecipientIds.size;
  const optedInCount = useMemo(
    () => recipients.filter(r => r.marketingEmailOptIn).length,
    [recipients]
  );

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [recipientData, statsData] = await Promise.all([
        getAllEmailRecipients(),
        getAllUsageStats(),
      ]);

      setRecipients(recipientData);

      // Build usage stats map
      const statsMap = new Map<string, SkillUsageStat[]>();
      for (const stat of statsData) {
        const existing = statsMap.get(stat.userId) || [];
        existing.push(stat);
        statsMap.set(stat.userId, existing);
      }
      setUsageStats(statsMap);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load recipients');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter management
  const setFilter = useCallback((newFilter: SegmentationFilter) => {
    setFilterState(newFilter);
  }, []);

  const updateFilter = useCallback((updates: Partial<SegmentationFilter>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_SEGMENTATION_FILTER);
  }, []);

  // Selection management
  const selectRecipient = useCallback((userId: string) => {
    setSelectedRecipientIds(prev => new Set(prev).add(userId));
  }, []);

  const deselectRecipient = useCallback((userId: string) => {
    setSelectedRecipientIds(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const toggleRecipient = useCallback((userId: string) => {
    setSelectedRecipientIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedRecipientIds(new Set(recipients.map(r => r.userId)));
  }, [recipients]);

  const deselectAll = useCallback(() => {
    setSelectedRecipientIds(new Set());
  }, []);

  const selectFiltered = useCallback(() => {
    setSelectedRecipientIds(new Set(filteredRecipients.map(r => r.userId)));
  }, [filteredRecipients]);

  // Actions
  const applyFilter = useCallback(async () => {
    if (!filterValidation.valid) {
      setError(filterValidation.errors.join(', '));
      return;
    }

    // Log filter application
    const adminId = appUser?.id || user?.id || 'unknown';
    const adminEmail = appUser?.email || user?.email || 'unknown';

    await logSegmentFilter(adminId, adminEmail, filter, filteredCount);
  }, [filter, filterValidation, filteredCount, appUser, user]);

  const previewRecipients = useCallback(async (): Promise<EmailRecipient[]> => {
    const adminId = appUser?.id || user?.id || 'unknown';
    const adminEmail = appUser?.email || user?.email || 'unknown';

    await logEmailPreview(adminId, adminEmail, filter, filteredCount);

    return filteredRecipients;
  }, [filter, filteredCount, filteredRecipients, appUser, user]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    // State
    recipients,
    filteredRecipients,
    selectedRecipientIds,
    filter,
    isLoading,
    error,

    // Filter management
    setFilter,
    updateFilter,
    resetFilter,
    filterDescription,
    filterValidation,

    // Selection management
    selectRecipient,
    deselectRecipient,
    toggleRecipient,
    selectAll,
    deselectAll,
    selectFiltered,

    // Actions
    applyFilter,
    previewRecipients,
    refresh,

    // Stats
    totalCount,
    filteredCount,
    selectedCount,
    optedInCount,
    stats: {
      totalCount,
      filteredCount,
      selectedCount,
      optedInCount,
    },
  };
}

export default useEmailSegments;
