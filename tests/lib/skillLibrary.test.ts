/**
 * Skill Library Unit Tests
 *
 * Tests for the skill library filtering, sorting, and retrieval functions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllLibrarySkills,
  getLibrarySkill,
  getSkillsByRole,
  getCollectionSkills,
  filterSkills,
  sortSkills,
  getSkillCountByRole,
  getSkillCountByCategory,
  ROLE_DEFINITIONS,
  SKILL_COLLECTIONS,
} from '../../lib/skillLibrary';
import type { LibrarySkill, LibraryFilters } from '../../lib/skillLibrary/types';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function createEmptyFilters(): LibraryFilters {
  return {
    search: '',
    categories: [],
    roles: [],
    useCases: [],
    levels: [],
    sources: [],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// getAllLibrarySkills TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('getAllLibrarySkills', () => {
  it('returns an array of skills', () => {
    const skills = getAllLibrarySkills();
    expect(Array.isArray(skills)).toBe(true);
    expect(skills.length).toBeGreaterThan(0);
  });

  it('returns at least 150 skills', () => {
    const skills = getAllLibrarySkills();
    expect(skills.length).toBeGreaterThanOrEqual(150);
  });

  it('returns consistent results (cached)', () => {
    const skills1 = getAllLibrarySkills();
    const skills2 = getAllLibrarySkills();
    expect(skills1).toBe(skills2); // Same reference (cached)
  });

  it('includes both builtin and template skills', () => {
    const skills = getAllLibrarySkills();
    const builtinSkills = skills.filter((s) => s.source === 'builtin');
    const templateSkills = skills.filter((s) => s.source === 'role-template');

    expect(builtinSkills.length).toBeGreaterThan(0);
    expect(templateSkills.length).toBeGreaterThan(0);
  });

  it('all skills have required fields', () => {
    const skills = getAllLibrarySkills();

    for (const skill of skills) {
      expect(skill.id).toBeDefined();
      expect(skill.name).toBeDefined();
      expect(skill.description).toBeDefined();
      expect(skill.tags).toBeDefined();
      expect(skill.tags.category).toBeDefined();
      expect(skill.source).toBeDefined();
    }
  });

  it('all skill IDs are unique', () => {
    const skills = getAllLibrarySkills();
    const ids = skills.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getLibrarySkill TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('getLibrarySkill', () => {
  it('returns a skill by ID', () => {
    const skill = getLibrarySkill('job-readiness-score');
    expect(skill).toBeDefined();
    expect(skill?.id).toBe('job-readiness-score');
  });

  it('returns undefined for non-existent ID', () => {
    const skill = getLibrarySkill('non-existent-skill-id');
    expect(skill).toBeUndefined();
  });

  it('finds dynamic skills from role templates', () => {
    const skills = getAllLibrarySkills();
    const templateSkill = skills.find((s) => s.source === 'role-template');
    if (templateSkill) {
      const found = getLibrarySkill(templateSkill.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(templateSkill.id);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getSkillsByRole TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('getSkillsByRole', () => {
  it('returns skills for a valid role', () => {
    const roleId = ROLE_DEFINITIONS[0]?.id;
    if (roleId) {
      const skills = getSkillsByRole(roleId);
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
    }
  });

  it('includes universal skills (empty roles array)', () => {
    const roleId = 'any-role-id';
    const skills = getSkillsByRole(roleId);
    const universalSkills = skills.filter((s) => s.tags.roles.length === 0);
    expect(universalSkills.length).toBeGreaterThan(0);
  });

  it('includes role-specific skills', () => {
    // Get a role that has specific skills
    const roleId = ROLE_DEFINITIONS[0]?.id;
    if (roleId) {
      const allSkills = getAllLibrarySkills();
      const roleSpecificSkills = allSkills.filter(
        (s) => s.tags.roles.includes(roleId)
      );

      const skillsForRole = getSkillsByRole(roleId);

      // All role-specific skills should be included
      for (const specific of roleSpecificSkills) {
        expect(skillsForRole.some((s) => s.id === specific.id)).toBe(true);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getCollectionSkills TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('getCollectionSkills', () => {
  it('returns skills for a valid collection', () => {
    const collection = SKILL_COLLECTIONS[0];
    if (collection) {
      const skills = getCollectionSkills(collection.id);
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
    }
  });

  it('returns empty array for non-existent collection', () => {
    const skills = getCollectionSkills('non-existent-collection');
    expect(skills).toEqual([]);
  });

  it('returns skills in order defined by collection', () => {
    const collection = SKILL_COLLECTIONS[0];
    if (collection && collection.skillIds.length > 1) {
      const skills = getCollectionSkills(collection.id);
      // Skills should be in same order as collection.skillIds
      for (let i = 0; i < skills.length; i++) {
        expect(skills[i].id).toBe(collection.skillIds[i]);
      }
    }
  });

  it('handles missing skills gracefully', () => {
    // This tests that the filter removes undefined entries
    const collection = SKILL_COLLECTIONS[0];
    if (collection) {
      const skills = getCollectionSkills(collection.id);
      // All returned skills should be defined
      expect(skills.every((s) => s !== undefined)).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// filterSkills TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('filterSkills', () => {
  let allSkills: LibrarySkill[];

  beforeEach(() => {
    allSkills = getAllLibrarySkills();
  });

  describe('search filter', () => {
    it('filters by name', () => {
      const filters = { ...createEmptyFilters(), search: 'resume' };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every(
          (s) =>
            s.name.toLowerCase().includes('resume') ||
            s.description.toLowerCase().includes('resume') ||
            s.longDescription?.toLowerCase().includes('resume')
        )
      ).toBe(true);
    });

    it('search is case-insensitive', () => {
      const filtersLower = { ...createEmptyFilters(), search: 'interview' };
      const filtersUpper = { ...createEmptyFilters(), search: 'INTERVIEW' };
      const filtersMixed = { ...createEmptyFilters(), search: 'Interview' };

      const resultLower = filterSkills(allSkills, filtersLower);
      const resultUpper = filterSkills(allSkills, filtersUpper);
      const resultMixed = filterSkills(allSkills, filtersMixed);

      expect(resultLower.length).toBe(resultUpper.length);
      expect(resultLower.length).toBe(resultMixed.length);
    });

    it('returns all skills with empty search', () => {
      const filters = { ...createEmptyFilters(), search: '' };
      const filtered = filterSkills(allSkills, filters);
      expect(filtered.length).toBe(allSkills.length);
    });

    it('returns empty for no matches', () => {
      const filters = {
        ...createEmptyFilters(),
        search: 'xyz123nonexistentterm',
      };
      const filtered = filterSkills(allSkills, filters);
      expect(filtered.length).toBe(0);
    });
  });

  describe('category filter', () => {
    it('filters by single category', () => {
      const filters = { ...createEmptyFilters(), categories: ['analysis' as const] };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((s) => s.tags.category === 'analysis')).toBe(true);
    });

    it('filters by multiple categories', () => {
      const filters = {
        ...createEmptyFilters(),
        categories: ['analysis' as const, 'generation' as const],
      };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every(
          (s) =>
            s.tags.category === 'analysis' || s.tags.category === 'generation'
        )
      ).toBe(true);
    });

    it('returns all with empty categories array', () => {
      const filters = { ...createEmptyFilters(), categories: [] };
      const filtered = filterSkills(allSkills, filters);
      expect(filtered.length).toBe(allSkills.length);
    });
  });

  describe('role filter', () => {
    it('filters by role (includes universal skills)', () => {
      const roleId = ROLE_DEFINITIONS[0]?.id || 'software-engineer';
      const filters = { ...createEmptyFilters(), roles: [roleId] };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every(
          (s) => s.tags.roles.length === 0 || s.tags.roles.includes(roleId)
        )
      ).toBe(true);
    });
  });

  describe('use case filter', () => {
    it('filters by use case', () => {
      const filters = {
        ...createEmptyFilters(),
        useCases: ['job-search' as const],
      };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every((s) => s.tags.useCases.includes('job-search'))
      ).toBe(true);
    });
  });

  describe('level filter', () => {
    it('filters by level', () => {
      const filters = {
        ...createEmptyFilters(),
        levels: ['beginner' as const],
      };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((s) => s.tags.level === 'beginner')).toBe(true);
    });
  });

  describe('source filter', () => {
    it('filters by builtin source', () => {
      const filters = {
        ...createEmptyFilters(),
        sources: ['builtin' as const],
      };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((s) => s.source === 'builtin')).toBe(true);
    });

    it('filters by role-template source', () => {
      const filters = {
        ...createEmptyFilters(),
        sources: ['role-template' as const],
      };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((s) => s.source === 'role-template')).toBe(true);
    });
  });

  describe('combined filters', () => {
    it('applies multiple filters (AND logic)', () => {
      const filters: LibraryFilters = {
        ...createEmptyFilters(),
        categories: ['analysis' as const],
        sources: ['builtin' as const],
      };
      const filtered = filterSkills(allSkills, filters);

      expect(
        filtered.every(
          (s) => s.tags.category === 'analysis' && s.source === 'builtin'
        )
      ).toBe(true);
    });

    it('search + category combined', () => {
      const filters: LibraryFilters = {
        ...createEmptyFilters(),
        search: 'job',
        categories: ['analysis' as const],
      };
      const filtered = filterSkills(allSkills, filters);

      expect(
        filtered.every(
          (s) =>
            s.tags.category === 'analysis' &&
            (s.name.toLowerCase().includes('job') ||
              s.description.toLowerCase().includes('job') ||
              s.longDescription?.toLowerCase().includes('job'))
        )
      ).toBe(true);
    });
  });

  describe('skillIds filter', () => {
    it('filters by specific skill IDs', () => {
      const skillIds = ['job-readiness-score', 'skills-gap-analyzer'];
      const filters = { ...createEmptyFilters(), skillIds };
      const filtered = filterSkills(allSkills, filters);

      expect(filtered.length).toBe(2);
      expect(filtered.every((s) => skillIds.includes(s.id))).toBe(true);
    });

    it('skillIds combined with search (AND logic)', () => {
      const skillIds = ['job-readiness-score', 'skills-gap-analyzer'];
      const filters: LibraryFilters = {
        ...createEmptyFilters(),
        skillIds,
        search: 'readiness', // Only matches one of the two
      };
      const filtered = filterSkills(allSkills, filters);

      // Both filters applied as AND - only skill matching both conditions
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('job-readiness-score');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// sortSkills TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('sortSkills', () => {
  let allSkills: LibrarySkill[];

  beforeEach(() => {
    allSkills = getAllLibrarySkills();
  });

  it('sorts by name alphabetically', () => {
    const sorted = sortSkills(allSkills, 'name');

    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].name.localeCompare(sorted[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it('sorts by popularity (useCount descending)', () => {
    // Add some use counts for testing
    const skillsWithCounts = allSkills.map((s, i) => ({
      ...s,
      useCount: i % 10,
    }));

    const sorted = sortSkills(skillsWithCounts, 'popular');

    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].useCount).toBeGreaterThanOrEqual(sorted[i].useCount);
    }
  });

  it('sorts by rating descending', () => {
    // Add some ratings for testing
    const skillsWithRatings = allSkills.map((s, i) => ({
      ...s,
      rating: { sum: i * 4, count: i > 0 ? i : 1 },
    }));

    const sorted = sortSkills(skillsWithRatings, 'rating');

    for (let i = 1; i < sorted.length; i++) {
      const ratingA =
        sorted[i - 1].rating.count > 0
          ? sorted[i - 1].rating.sum / sorted[i - 1].rating.count
          : 0;
      const ratingB =
        sorted[i].rating.count > 0
          ? sorted[i].rating.sum / sorted[i].rating.count
          : 0;
      expect(ratingA).toBeGreaterThanOrEqual(ratingB);
    }
  });

  it('sorts by newest (createdAt descending)', () => {
    // Add some dates for testing
    const now = Date.now();
    const skillsWithDates = allSkills.map((s, i) => ({
      ...s,
      createdAt: new Date(now - i * 1000000).toISOString(),
    }));

    const sorted = sortSkills(skillsWithDates, 'newest');

    for (let i = 1; i < sorted.length; i++) {
      const dateA = sorted[i - 1].createdAt
        ? new Date(sorted[i - 1].createdAt!).getTime()
        : 0;
      const dateB = sorted[i].createdAt
        ? new Date(sorted[i].createdAt!).getTime()
        : 0;
      expect(dateA).toBeGreaterThanOrEqual(dateB);
    }
  });

  it('does not mutate original array', () => {
    const original = [...allSkills];
    sortSkills(allSkills, 'name');
    expect(allSkills).toEqual(original);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getSkillCountByRole TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('getSkillCountByRole', () => {
  it('returns counts for all roles', () => {
    const counts = getSkillCountByRole();

    expect(Object.keys(counts).length).toBeGreaterThan(0);

    for (const role of ROLE_DEFINITIONS) {
      expect(counts[role.id]).toBeDefined();
      expect(typeof counts[role.id]).toBe('number');
    }
  });

  it('all counts are positive', () => {
    const counts = getSkillCountByRole();

    for (const count of Object.values(counts)) {
      expect(count).toBeGreaterThan(0);
    }
  });

  it('counts include universal skills', () => {
    const counts = getSkillCountByRole();
    const universalSkillCount = getAllLibrarySkills().filter(
      (s) => s.tags.roles.length === 0
    ).length;

    // Each role should have at least the universal skills
    for (const count of Object.values(counts)) {
      expect(count).toBeGreaterThanOrEqual(universalSkillCount);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getSkillCountByCategory TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('getSkillCountByCategory', () => {
  it('returns counts for all categories', () => {
    const counts = getSkillCountByCategory();

    expect(counts.analysis).toBeDefined();
    expect(counts.generation).toBeDefined();
    expect(counts.automation).toBeDefined();
    expect(counts.optimization).toBeDefined();
    expect(counts.communication).toBeDefined();
    expect(counts.research).toBeDefined();
  });

  it('total equals total skills', () => {
    const counts = getSkillCountByCategory();
    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    const allSkillsCount = getAllLibrarySkills().length;

    expect(total).toBe(allSkillsCount);
  });

  it('all counts are non-negative', () => {
    const counts = getSkillCountByCategory();

    for (const count of Object.values(counts)) {
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  it('at least analysis and generation have skills', () => {
    const counts = getSkillCountByCategory();

    expect(counts.analysis).toBeGreaterThan(0);
    expect(counts.generation).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROLE_DEFINITIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('ROLE_DEFINITIONS', () => {
  it('has at least 20 roles', () => {
    expect(ROLE_DEFINITIONS.length).toBeGreaterThanOrEqual(20);
  });

  it('all roles have required fields', () => {
    for (const role of ROLE_DEFINITIONS) {
      expect(role.id).toBeDefined();
      expect(role.name).toBeDefined();
      expect(role.icon).toBeDefined();
      expect(role.color).toBeDefined();
    }
  });

  it('all role IDs are unique', () => {
    const ids = ROLE_DEFINITIONS.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SKILL_COLLECTIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SKILL_COLLECTIONS', () => {
  it('has at least 3 collections', () => {
    expect(SKILL_COLLECTIONS.length).toBeGreaterThanOrEqual(3);
  });

  it('all collections have required fields', () => {
    for (const collection of SKILL_COLLECTIONS) {
      expect(collection.id).toBeDefined();
      expect(collection.name).toBeDefined();
      expect(collection.description).toBeDefined();
      expect(collection.icon).toBeDefined();
      expect(collection.skillIds).toBeDefined();
      expect(Array.isArray(collection.skillIds)).toBe(true);
    }
  });

  it('all collection skill IDs reference existing skills', () => {
    const allSkillIds = new Set(getAllLibrarySkills().map((s) => s.id));

    for (const collection of SKILL_COLLECTIONS) {
      for (const skillId of collection.skillIds) {
        expect(allSkillIds.has(skillId)).toBe(true);
      }
    }
  });

  it('featured collections have priority set', () => {
    const featuredCollections = SKILL_COLLECTIONS.filter((c) => c.featured);
    for (const collection of featuredCollections) {
      expect(collection.priority).toBeDefined();
      expect(typeof collection.priority).toBe('number');
    }
  });
});
