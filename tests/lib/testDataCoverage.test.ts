/**
 * Test Data Coverage Audit
 *
 * Validates that every skill has test data with all required inputs filled.
 * Identifies gaps and missing fields.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ROLE_TEMPLATES } from '../../lib/roleTemplates';
import { SKILLS } from '../../lib/skills/static';
import { getAllLibrarySkills, getLibrarySkill } from '../../lib/skillLibrary';

// Import all test data sources
import { ROLE_TEMPLATE_DEFAULT_TEST_DATA } from '../../lib/testing/roleTemplateTestData';
import { PROMPT_ENGINEERING_DEFAULT_TEST_DATA } from '../../lib/testing/promptEngineeringTestData';

// Read the main test data file to get ALL_SKILL_DEFAULT_TEST_DATA
import { ALL_SKILL_DEFAULT_TEST_DATA } from '../../lib/testing/defaultTestData';

interface SkillInfo {
  id: string;
  name: string;
  source: string;
  roleId?: string;
  inputs: { id: string; required: boolean; type: string; label: string }[];
}

interface CoverageGap {
  skillId: string;
  skillName: string;
  source: string;
  roleId?: string;
  hasTestData: boolean;
  missingRequiredFields: string[];
  allInputs: string[];
}

// Helper to generate skill ID like the skillLibrary does
function generateSkillId(roleId: string, skillName: string): string {
  return `${roleId}-${skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

describe('Test Data Coverage Audit', () => {
  let allSkills: SkillInfo[] = [];
  let coverageGaps: CoverageGap[] = [];
  let skillsWithTestData = 0;
  let skillsWithoutTestData = 0;
  let skillsWithMissingRequiredFields = 0;

  beforeAll(() => {
    // Collect all skills from role templates using the correct ID format
    ROLE_TEMPLATES.forEach((role) => {
      role.dynamicSkills.forEach((skill) => {
        const skillId = generateSkillId(role.id, skill.name);
        const inputs = (skill.inputs || []).map((input) => ({
          id: input.id,
          required: input.validation?.required === true,
          type: input.type,
          label: input.label,
        }));

        allSkills.push({
          id: skillId,
          name: skill.name,
          source: 'role-template',
          roleId: role.id,
          inputs,
        });
      });
    });

    // Collect static skills
    Object.entries(SKILLS).forEach(([id, skill]) => {
      allSkills.push({
        id,
        name: skill.name,
        source: 'static',
        inputs: [], // Static skills have hardcoded inputs, we'd need to check separately
      });
    });

    // Analyze coverage
    allSkills.forEach((skill) => {
      // Check all test data sources
      const testData = ALL_SKILL_DEFAULT_TEST_DATA[skill.id] ||
                       ROLE_TEMPLATE_DEFAULT_TEST_DATA[skill.id] ||
                       PROMPT_ENGINEERING_DEFAULT_TEST_DATA[skill.id];
      const hasTestData = !!testData;

      let missingRequiredFields: string[] = [];

      if (hasTestData && skill.inputs.length > 0) {
        // Check if all required fields are filled
        const requiredInputs = skill.inputs.filter((i) => i.required);
        requiredInputs.forEach((input) => {
          const value = testData.inputPayload?.[input.id];
          if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            missingRequiredFields.push(`${input.id} (${input.label})`);
          }
        });
      } else if (!hasTestData && skill.inputs.length > 0) {
        // No test data at all - all required fields are missing
        missingRequiredFields = skill.inputs
          .filter((i) => i.required)
          .map((i) => `${i.id} (${i.label})`);
      }

      if (hasTestData) {
        skillsWithTestData++;
      } else {
        skillsWithoutTestData++;
      }

      if (missingRequiredFields.length > 0) {
        skillsWithMissingRequiredFields++;
      }

      coverageGaps.push({
        skillId: skill.id,
        skillName: skill.name,
        source: skill.source,
        roleId: skill.roleId,
        hasTestData,
        missingRequiredFields,
        allInputs: skill.inputs.map((i) => i.id),
      });
    });
  });

  it('generates coverage report', () => {
    console.log('\n\n=== TEST DATA COVERAGE REPORT ===\n');
    console.log(`Total skills analyzed: ${allSkills.length}`);
    console.log(`Skills with test data: ${skillsWithTestData}`);
    console.log(`Skills without test data: ${skillsWithoutTestData}`);
    console.log(`Skills with missing required fields: ${skillsWithMissingRequiredFields}`);
    console.log(`Coverage rate: ${((skillsWithTestData / allSkills.length) * 100).toFixed(1)}%`);

    expect(true).toBe(true);
  });

  it('lists skills without test data', () => {
    const missing = coverageGaps.filter((g) => !g.hasTestData && g.allInputs.length > 0);

    if (missing.length > 0) {
      console.log('\n\n=== SKILLS WITHOUT TEST DATA ===\n');

      // Group by role
      const byRole: Record<string, CoverageGap[]> = {};
      missing.forEach((g) => {
        const key = g.roleId || 'static';
        if (!byRole[key]) byRole[key] = [];
        byRole[key].push(g);
      });

      Object.entries(byRole).forEach(([roleId, gaps]) => {
        console.log(`\n--- ${roleId} (${gaps.length} skills) ---`);
        gaps.forEach((g) => {
          console.log(`  • ${g.skillName} [${g.skillId}]`);
          if (g.missingRequiredFields.length > 0) {
            console.log(`    Required: ${g.missingRequiredFields.join(', ')}`);
          }
        });
      });
    }

    console.log(`\nTotal skills needing test data: ${missing.length}`);
    expect(true).toBe(true);
  });

  it('lists skills with incomplete test data (missing required fields)', () => {
    const incomplete = coverageGaps.filter(
      (g) => g.hasTestData && g.missingRequiredFields.length > 0
    );

    if (incomplete.length > 0) {
      console.log('\n\n=== SKILLS WITH INCOMPLETE TEST DATA ===\n');
      incomplete.forEach((g) => {
        console.log(`• ${g.skillName} [${g.skillId}]`);
        console.log(`  Missing: ${g.missingRequiredFields.join(', ')}`);
      });
    }

    console.log(`\nTotal skills with incomplete data: ${incomplete.length}`);
    expect(true).toBe(true);
  });

  it('validates all required fields have test values', () => {
    const problemSkills = coverageGaps.filter(
      (g) => g.missingRequiredFields.length > 0
    );

    if (problemSkills.length > 0) {
      console.log('\n\n=== ALL SKILLS WITH MISSING REQUIRED FIELDS ===\n');
      problemSkills.forEach((g) => {
        console.log(`• ${g.skillName} [${g.skillId}]`);
        console.log(`  Has test data: ${g.hasTestData}`);
        console.log(`  Missing: ${g.missingRequiredFields.join(', ')}`);
      });
    }

    // This test will fail if there are gaps - intentionally
    expect(problemSkills.length).toBe(0);
  });

  it('exports gap summary for fixing', () => {
    const gapsToFix = coverageGaps
      .filter((g) => !g.hasTestData || g.missingRequiredFields.length > 0)
      .map((g) => ({
        skillId: g.skillId,
        skillName: g.skillName,
        roleId: g.roleId,
        needsTestData: !g.hasTestData,
        missingFields: g.missingRequiredFields,
      }));

    console.log('\n\n=== GAPS SUMMARY ===');
    console.log(`Total gaps to fix: ${gapsToFix.length}`);

    // Group by type of problem
    const noTestData = gapsToFix.filter((g) => g.needsTestData);
    const incompleteData = gapsToFix.filter((g) => !g.needsTestData && g.missingFields.length > 0);

    console.log(`  Skills without any test data: ${noTestData.length}`);
    console.log(`  Skills with incomplete test data: ${incompleteData.length}`);

    if (noTestData.length > 0) {
      console.log('\nFirst 10 skills without test data:');
      noTestData.slice(0, 10).forEach((g) => {
        console.log(`  - ${g.skillId}`);
      });
    }

    expect(true).toBe(true);
  });
});
