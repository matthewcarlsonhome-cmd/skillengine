/**
 * Tests for lib/emailSegmentation/filters.ts
 *
 * Tests cover:
 * - Opt-in filter logic
 * - Skill-based filters (favorites, primary)
 * - Usage-based filters (run count, period)
 * - Activity filters
 * - Combined filter logic
 * - Helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  passesOptInFilter,
  passesSkillFilter,
  passesUsageFilter,
  passesActivityFilter,
  filterRecipients,
  calculatePrimarySkills,
  buildEmailRecipient,
  describeFilter,
  validateFilter,
} from '../../lib/emailSegmentation/filters';
import {
  DEFAULT_SEGMENTATION_FILTER,
  type EmailRecipient,
  type SegmentationFilter,
  type SkillUsageStat,
  type UserEmailPreference,
  type UserSkillPreferences,
} from '../../lib/emailSegmentation/types';

// ═══════════════════════════════════════════════════════════════════════════
// TEST FIXTURES
// ═══════════════════════════════════════════════════════════════════════════

const createRecipient = (overrides: Partial<EmailRecipient> = {}): EmailRecipient => ({
  userId: 'user-1',
  email: 'test@example.com',
  marketingEmailOptIn: true,
  favoriteSkillIds: [],
  primarySkillIds: [],
  totalRuns: 0,
  lastActiveAt: null,
  ...overrides,
});

const createUsageStat = (overrides: Partial<SkillUsageStat> = {}): SkillUsageStat => ({
  id: 'stat-1',
  userId: 'user-1',
  skillId: 'skill-1',
  skillName: 'Test Skill',
  runCount: 1,
  lastUsedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createFilter = (overrides: Partial<SegmentationFilter> = {}): SegmentationFilter => ({
  ...DEFAULT_SEGMENTATION_FILTER,
  ...overrides,
});

// ═══════════════════════════════════════════════════════════════════════════
// OPT-IN FILTER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('passesOptInFilter', () => {
  it('passes when requireOptIn is false', () => {
    const recipient = createRecipient({ marketingEmailOptIn: false });
    const filter = createFilter({ requireOptIn: false });
    expect(passesOptInFilter(recipient, filter)).toBe(true);
  });

  it('passes when requireOptIn is true and user opted in', () => {
    const recipient = createRecipient({ marketingEmailOptIn: true });
    const filter = createFilter({ requireOptIn: true });
    expect(passesOptInFilter(recipient, filter)).toBe(true);
  });

  it('fails when requireOptIn is true and user not opted in', () => {
    const recipient = createRecipient({ marketingEmailOptIn: false });
    const filter = createFilter({ requireOptIn: true });
    expect(passesOptInFilter(recipient, filter)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SKILL FILTER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('passesSkillFilter', () => {
  it('passes when no skill filter applied', () => {
    const recipient = createRecipient();
    const filter = createFilter({ skillIds: [] });
    expect(passesSkillFilter(recipient, filter)).toBe(true);
  });

  it('passes when no skill filter defined', () => {
    const recipient = createRecipient();
    const filter = createFilter({ skillIds: undefined });
    expect(passesSkillFilter(recipient, filter)).toBe(true);
  });

  describe('skillMatchMode: any', () => {
    it('passes when user has any of the selected skills as favorite', () => {
      const recipient = createRecipient({
        favoriteSkillIds: ['skill-1', 'skill-2'],
      });
      const filter = createFilter({
        skillIds: ['skill-2', 'skill-3'],
        skillMatchMode: 'any',
        includeAsFavorite: true,
        includeAsPrimary: false,
      });
      expect(passesSkillFilter(recipient, filter)).toBe(true);
    });

    it('passes when user has any of the selected skills as primary', () => {
      const recipient = createRecipient({
        primarySkillIds: ['skill-1', 'skill-3'],
      });
      const filter = createFilter({
        skillIds: ['skill-2', 'skill-3'],
        skillMatchMode: 'any',
        includeAsFavorite: false,
        includeAsPrimary: true,
      });
      expect(passesSkillFilter(recipient, filter)).toBe(true);
    });

    it('fails when user has none of the selected skills', () => {
      const recipient = createRecipient({
        favoriteSkillIds: ['skill-1'],
        primarySkillIds: ['skill-2'],
      });
      const filter = createFilter({
        skillIds: ['skill-3', 'skill-4'],
        skillMatchMode: 'any',
        includeAsFavorite: true,
        includeAsPrimary: true,
      });
      expect(passesSkillFilter(recipient, filter)).toBe(false);
    });
  });

  describe('skillMatchMode: all', () => {
    it('passes when user has all of the selected skills', () => {
      const recipient = createRecipient({
        favoriteSkillIds: ['skill-1', 'skill-2', 'skill-3'],
      });
      const filter = createFilter({
        skillIds: ['skill-1', 'skill-2'],
        skillMatchMode: 'all',
        includeAsFavorite: true,
        includeAsPrimary: false,
      });
      expect(passesSkillFilter(recipient, filter)).toBe(true);
    });

    it('fails when user is missing any of the selected skills', () => {
      const recipient = createRecipient({
        favoriteSkillIds: ['skill-1'],
      });
      const filter = createFilter({
        skillIds: ['skill-1', 'skill-2'],
        skillMatchMode: 'all',
        includeAsFavorite: true,
        includeAsPrimary: false,
      });
      expect(passesSkillFilter(recipient, filter)).toBe(false);
    });

    it('can match skills across both favorites and primary', () => {
      const recipient = createRecipient({
        favoriteSkillIds: ['skill-1'],
        primarySkillIds: ['skill-2'],
      });
      const filter = createFilter({
        skillIds: ['skill-1', 'skill-2'],
        skillMatchMode: 'all',
        includeAsFavorite: true,
        includeAsPrimary: true,
      });
      expect(passesSkillFilter(recipient, filter)).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// USAGE FILTER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('passesUsageFilter', () => {
  it('passes when no minimum runs required', () => {
    const recipient = createRecipient();
    const filter = createFilter({ minRunsInPeriod: undefined });
    const usageStats = new Map<string, SkillUsageStat[]>();
    expect(passesUsageFilter(recipient, filter, usageStats)).toBe(true);
  });

  it('passes when minRunsInPeriod is 0', () => {
    const recipient = createRecipient();
    const filter = createFilter({ minRunsInPeriod: 0 });
    const usageStats = new Map<string, SkillUsageStat[]>();
    expect(passesUsageFilter(recipient, filter, usageStats)).toBe(true);
  });

  it('fails when user has no usage stats', () => {
    const recipient = createRecipient();
    const filter = createFilter({ minRunsInPeriod: 5, periodDays: 30 });
    const usageStats = new Map<string, SkillUsageStat[]>();
    expect(passesUsageFilter(recipient, filter, usageStats)).toBe(false);
  });

  it('passes when user meets minimum runs', () => {
    const recipient = createRecipient({ userId: 'user-1' });
    const filter = createFilter({ minRunsInPeriod: 5, periodDays: 30 });
    const usageStats = new Map<string, SkillUsageStat[]>([
      ['user-1', [createUsageStat({ userId: 'user-1', runCount: 10 })]],
    ]);
    expect(passesUsageFilter(recipient, filter, usageStats)).toBe(true);
  });

  it('fails when user does not meet minimum runs', () => {
    const recipient = createRecipient({ userId: 'user-1' });
    const filter = createFilter({ minRunsInPeriod: 20, periodDays: 30 });
    const usageStats = new Map<string, SkillUsageStat[]>([
      ['user-1', [createUsageStat({ userId: 'user-1', runCount: 5 })]],
    ]);
    expect(passesUsageFilter(recipient, filter, usageStats)).toBe(false);
  });

  it('excludes old usage stats outside the period', () => {
    const recipient = createRecipient({ userId: 'user-1' });
    const filter = createFilter({ minRunsInPeriod: 5, periodDays: 7 });

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 14); // 14 days ago

    const usageStats = new Map<string, SkillUsageStat[]>([
      ['user-1', [createUsageStat({
        userId: 'user-1',
        runCount: 100,
        lastUsedAt: oldDate.toISOString(),
      })]],
    ]);
    expect(passesUsageFilter(recipient, filter, usageStats)).toBe(false);
  });

  it('filters by specific skills when skillIds is set', () => {
    const recipient = createRecipient({ userId: 'user-1' });
    const filter = createFilter({
      skillIds: ['skill-1'],
      minRunsInPeriod: 5,
      periodDays: 30,
    });

    const usageStats = new Map<string, SkillUsageStat[]>([
      ['user-1', [
        createUsageStat({ userId: 'user-1', skillId: 'skill-1', runCount: 3 }),
        createUsageStat({ userId: 'user-1', skillId: 'skill-2', runCount: 100 }),
      ]],
    ]);

    // Should fail because only skill-1 runs are counted (3), not skill-2
    expect(passesUsageFilter(recipient, filter, usageStats)).toBe(false);
  });

  it('counts multiple skill runs when skillIds is set', () => {
    const recipient = createRecipient({ userId: 'user-1' });
    const filter = createFilter({
      skillIds: ['skill-1', 'skill-2'],
      minRunsInPeriod: 10,
      periodDays: 30,
    });

    const usageStats = new Map<string, SkillUsageStat[]>([
      ['user-1', [
        createUsageStat({ userId: 'user-1', skillId: 'skill-1', runCount: 6 }),
        createUsageStat({ userId: 'user-1', skillId: 'skill-2', runCount: 5 }),
      ]],
    ]);

    // Should pass: 6 + 5 = 11 >= 10
    expect(passesUsageFilter(recipient, filter, usageStats)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY FILTER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('passesActivityFilter', () => {
  it('passes when no activity filter applied', () => {
    const recipient = createRecipient();
    const filter = createFilter({ activeInLastDays: undefined });
    expect(passesActivityFilter(recipient, filter)).toBe(true);
  });

  it('passes when activeInLastDays is 0', () => {
    const recipient = createRecipient();
    const filter = createFilter({ activeInLastDays: 0 });
    expect(passesActivityFilter(recipient, filter)).toBe(true);
  });

  it('fails when user has no lastActiveAt', () => {
    const recipient = createRecipient({ lastActiveAt: null });
    const filter = createFilter({ activeInLastDays: 7 });
    expect(passesActivityFilter(recipient, filter)).toBe(false);
  });

  it('passes when user was recently active', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);
    const recipient = createRecipient({ lastActiveAt: recentDate.toISOString() });
    const filter = createFilter({ activeInLastDays: 7 });
    expect(passesActivityFilter(recipient, filter)).toBe(true);
  });

  it('fails when user was not recently active', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 30);
    const recipient = createRecipient({ lastActiveAt: oldDate.toISOString() });
    const filter = createFilter({ activeInLastDays: 7 });
    expect(passesActivityFilter(recipient, filter)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED FILTER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('filterRecipients', () => {
  it('returns all recipients when using default filter', () => {
    const recipients = [
      createRecipient({ userId: 'user-1', marketingEmailOptIn: true }),
      createRecipient({ userId: 'user-2', marketingEmailOptIn: true }),
    ];
    const filter = createFilter({ requireOptIn: false });
    const usageStats = new Map<string, SkillUsageStat[]>();

    const result = filterRecipients(recipients, filter, usageStats);
    expect(result).toHaveLength(2);
  });

  it('filters out non-opted-in users', () => {
    const recipients = [
      createRecipient({ userId: 'user-1', marketingEmailOptIn: true }),
      createRecipient({ userId: 'user-2', marketingEmailOptIn: false }),
    ];
    const filter = createFilter({ requireOptIn: true });
    const usageStats = new Map<string, SkillUsageStat[]>();

    const result = filterRecipients(recipients, filter, usageStats);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('user-1');
  });

  it('combines multiple filters', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);

    const recipients = [
      createRecipient({
        userId: 'user-1',
        marketingEmailOptIn: true,
        favoriteSkillIds: ['skill-1'],
        lastActiveAt: recentDate.toISOString(),
      }),
      createRecipient({
        userId: 'user-2',
        marketingEmailOptIn: true,
        favoriteSkillIds: [],
        lastActiveAt: recentDate.toISOString(),
      }),
      createRecipient({
        userId: 'user-3',
        marketingEmailOptIn: false,
        favoriteSkillIds: ['skill-1'],
        lastActiveAt: recentDate.toISOString(),
      }),
    ];

    const filter = createFilter({
      requireOptIn: true,
      skillIds: ['skill-1'],
      skillMatchMode: 'any',
      includeAsFavorite: true,
      activeInLastDays: 7,
    });

    const usageStats = new Map<string, SkillUsageStat[]>();

    const result = filterRecipients(recipients, filter, usageStats);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('user-1');
  });

  it('adds matched skills to recipients', () => {
    const recipients = [
      createRecipient({
        userId: 'user-1',
        favoriteSkillIds: ['skill-1', 'skill-2', 'skill-3'],
      }),
    ];

    const filter = createFilter({
      requireOptIn: false,
      skillIds: ['skill-1', 'skill-3', 'skill-5'],
      skillMatchMode: 'any',
      includeAsFavorite: true,
    });

    const usageStats = new Map<string, SkillUsageStat[]>();

    const result = filterRecipients(recipients, filter, usageStats);
    expect(result[0].matchedSkills).toEqual(['skill-1', 'skill-3']);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('calculatePrimarySkills', () => {
  it('returns empty array for no stats', () => {
    expect(calculatePrimarySkills([])).toEqual([]);
  });

  it('returns top 3 skills by run count', () => {
    const stats = [
      createUsageStat({ skillId: 'skill-1', runCount: 50 }),
      createUsageStat({ skillId: 'skill-2', runCount: 100 }),
      createUsageStat({ skillId: 'skill-3', runCount: 25 }),
      createUsageStat({ skillId: 'skill-4', runCount: 75 }),
    ];
    expect(calculatePrimarySkills(stats)).toEqual(['skill-2', 'skill-4', 'skill-1']);
  });

  it('respects topN parameter', () => {
    const stats = [
      createUsageStat({ skillId: 'skill-1', runCount: 50 }),
      createUsageStat({ skillId: 'skill-2', runCount: 100 }),
      createUsageStat({ skillId: 'skill-3', runCount: 75 }),
    ];
    expect(calculatePrimarySkills(stats, 2)).toEqual(['skill-2', 'skill-3']);
  });
});

describe('buildEmailRecipient', () => {
  it('builds recipient from preferences and stats', () => {
    const emailPref: UserEmailPreference = {
      userId: 'user-1',
      email: 'test@example.com',
      marketingEmailOptIn: true,
      optInUpdatedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const skillPrefs: UserSkillPreferences = {
      userId: 'user-1',
      favoriteSkillIds: ['skill-1', 'skill-2'],
      primarySkillIds: ['skill-3'],
      updatedAt: new Date().toISOString(),
    };

    const lastUsed = new Date().toISOString();
    const usageStats: SkillUsageStat[] = [
      createUsageStat({ runCount: 10, lastUsedAt: lastUsed }),
      createUsageStat({ runCount: 5 }),
    ];

    const recipient = buildEmailRecipient(emailPref, skillPrefs, usageStats);

    expect(recipient.userId).toBe('user-1');
    expect(recipient.email).toBe('test@example.com');
    expect(recipient.marketingEmailOptIn).toBe(true);
    expect(recipient.favoriteSkillIds).toEqual(['skill-1', 'skill-2']);
    expect(recipient.primarySkillIds).toEqual(['skill-3']);
    expect(recipient.totalRuns).toBe(15);
    expect(recipient.lastActiveAt).toBe(lastUsed);
  });

  it('calculates primary skills when not provided', () => {
    const emailPref: UserEmailPreference = {
      userId: 'user-1',
      email: 'test@example.com',
      marketingEmailOptIn: true,
      optInUpdatedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const usageStats: SkillUsageStat[] = [
      createUsageStat({ skillId: 'skill-1', runCount: 50 }),
      createUsageStat({ skillId: 'skill-2', runCount: 100 }),
    ];

    const recipient = buildEmailRecipient(emailPref, null, usageStats);

    expect(recipient.favoriteSkillIds).toEqual([]);
    expect(recipient.primarySkillIds).toEqual(['skill-2', 'skill-1']);
  });
});

describe('describeFilter', () => {
  it('describes opt-in requirement', () => {
    const filter = createFilter({ requireOptIn: true });
    expect(describeFilter(filter)).toContain('opted-in users');
  });

  it('describes skill filter', () => {
    const filter = createFilter({
      skillIds: ['skill-1', 'skill-2'],
      skillMatchMode: 'any',
      includeAsFavorite: true,
      includeAsPrimary: false,
    });
    expect(describeFilter(filter)).toContain('2 selected skill(s)');
    expect(describeFilter(filter)).toContain('favorites');
  });

  it('describes usage filter', () => {
    const filter = createFilter({
      minRunsInPeriod: 10,
      periodDays: 30,
    });
    expect(describeFilter(filter)).toContain('≥10 runs');
    expect(describeFilter(filter)).toContain('30 days');
  });

  it('describes activity filter', () => {
    const filter = createFilter({ activeInLastDays: 7 });
    expect(describeFilter(filter)).toContain('active in last 7 days');
  });
});

describe('validateFilter', () => {
  it('validates valid filter', () => {
    const filter = createFilter();
    const result = validateFilter(filter);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid periodDays', () => {
    const filter = createFilter({ periodDays: 0 });
    const result = validateFilter(filter);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Period days must be at least 1');
  });

  it('rejects periodDays over 365', () => {
    const filter = createFilter({ periodDays: 500 });
    const result = validateFilter(filter);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Period days cannot exceed 365');
  });

  it('rejects negative minRunsInPeriod', () => {
    const filter = createFilter({ minRunsInPeriod: -5 });
    const result = validateFilter(filter);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Minimum runs cannot be negative');
  });

  it('rejects skill filter without source', () => {
    const filter = createFilter({
      skillIds: ['skill-1'],
      includeAsFavorite: false,
      includeAsPrimary: false,
    });
    const result = validateFilter(filter);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Must include at least one skill source (favorites or primary)');
  });
});
