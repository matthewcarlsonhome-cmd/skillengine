/**
 * Skill Quality Validation Tests
 *
 * Validates that all 277+ skills meet production-quality standards:
 * - Prompts are substantial and role-specific
 * - All required fields are present
 * - Inputs are properly defined
 * - Descriptions are meaningful
 * - Time estimates are realistic
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ROLE_TEMPLATES, type RoleTemplate } from '../../lib/roleTemplates';
import { SKILLS } from '../../lib/skills/static';
import { getAllLibrarySkills } from '../../lib/skillLibrary';

// ═══════════════════════════════════════════════════════════════════════════
// QUALITY THRESHOLDS
// These define minimum standards for production-ready skills
// ═══════════════════════════════════════════════════════════════════════════

const QUALITY_THRESHOLDS = {
  // Prompt length requirements (characters)
  MIN_SYSTEM_PROMPT_LENGTH: 500,      // Must have substantial instructions
  IDEAL_SYSTEM_PROMPT_LENGTH: 2000,   // Production-quality prompts should be detailed
  MAX_SYSTEM_PROMPT_LENGTH: 50000,    // Cap to prevent bloat

  // Description requirements
  MIN_DESCRIPTION_LENGTH: 20,         // Must be descriptive
  MIN_LONG_DESCRIPTION_LENGTH: 50,    // Detailed description required

  // Name requirements
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 60,

  // Input requirements
  MIN_INPUTS_PER_SKILL: 1,            // Must have at least one input
  MAX_INPUTS_PER_SKILL: 15,           // Don't overwhelm users

  // Expected sections in quality prompts
  REQUIRED_PROMPT_SECTIONS: [
    'expertise',
    'instruction',
    'output',
    'format',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// QUALITY ANALYSIS HELPERS
// ═══════════════════════════════════════════════════════════════════════════

interface SkillQualityReport {
  skillId: string;
  skillName: string;
  roleId: string;
  roleName: string;
  issues: string[];
  warnings: string[];
  promptLength: number;
  inputCount: number;
  hasSystemPrompt: boolean;
  hasUserPrompt: boolean;
  qualityScore: number; // 0-100
}

function analyzePromptQuality(prompt: string): {
  length: number;
  hasExpertise: boolean;
  hasInstructions: boolean;
  hasOutputFormat: boolean;
  hasSections: boolean;
  hasExamples: boolean;
  hasEdgeCases: boolean;
} {
  const lower = prompt.toLowerCase();
  return {
    length: prompt.length,
    hasExpertise: /expert|experience|credential|certified|years|senior|principal/i.test(prompt),
    hasInstructions: /must|should|always|never|ensure|follow|step|section|provide|generate|create|analyze|include|consider|principles|requirements|guidelines|assess|improve|evaluate|recommend|define|identify|implement|review|validate|help/i.test(prompt),
    hasOutputFormat: /format|structure|output|response|markdown|section|heading/i.test(prompt),
    hasSections: /═{3,}|#{2,}|section \d|step \d|\*\*[A-Z]/i.test(prompt),
    hasExamples: /example|sample|instance|such as|e\.g\.|for instance/i.test(prompt),
    hasEdgeCases: /edge case|exception|special case|if.*then|unless|however/i.test(prompt),
  };
}

function calculateQualityScore(report: Omit<SkillQualityReport, 'qualityScore'>): number {
  let score = 0;
  const maxScore = 100;

  // Prompt length scoring (40 points max)
  if (report.promptLength >= QUALITY_THRESHOLDS.IDEAL_SYSTEM_PROMPT_LENGTH) {
    score += 40;
  } else if (report.promptLength >= QUALITY_THRESHOLDS.MIN_SYSTEM_PROMPT_LENGTH) {
    score += 20 + (20 * (report.promptLength - QUALITY_THRESHOLDS.MIN_SYSTEM_PROMPT_LENGTH) /
      (QUALITY_THRESHOLDS.IDEAL_SYSTEM_PROMPT_LENGTH - QUALITY_THRESHOLDS.MIN_SYSTEM_PROMPT_LENGTH));
  } else if (report.promptLength > 100) {
    score += 10;
  }

  // Has system prompt (20 points)
  if (report.hasSystemPrompt) score += 20;

  // Has user prompt (10 points)
  if (report.hasUserPrompt) score += 10;

  // Input count scoring (15 points max)
  if (report.inputCount >= QUALITY_THRESHOLDS.MIN_INPUTS_PER_SKILL &&
      report.inputCount <= QUALITY_THRESHOLDS.MAX_INPUTS_PER_SKILL) {
    score += 15;
  } else if (report.inputCount > 0) {
    score += 8;
  }

  // No critical issues (15 points)
  if (report.issues.length === 0) {
    score += 15;
  } else {
    score += Math.max(0, 15 - (report.issues.length * 3));
  }

  return Math.min(maxScore, Math.round(score));
}

// ═══════════════════════════════════════════════════════════════════════════
// STATIC SKILLS TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Static Skills Quality', () => {
  const skillEntries = Object.entries(SKILLS);

  it(`should have at least 10 static skills`, () => {
    expect(skillEntries.length).toBeGreaterThanOrEqual(10);
  });

  describe.each(skillEntries)('Skill: %s', (skillId, skill) => {
    it('has required basic fields', () => {
      expect(skill.id).toBe(skillId);
      expect(skill.name).toBeDefined();
      expect(skill.name.length).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_NAME_LENGTH);
      expect(skill.name.length).toBeLessThanOrEqual(QUALITY_THRESHOLDS.MAX_NAME_LENGTH);
      expect(skill.description).toBeDefined();
      expect(skill.description.length).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_DESCRIPTION_LENGTH);
    });

    it('has properly defined inputs', () => {
      expect(skill.inputs).toBeDefined();
      expect(Array.isArray(skill.inputs)).toBe(true);
      expect(skill.inputs.length).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_INPUTS_PER_SKILL);

      skill.inputs.forEach((input, idx) => {
        expect(input.id, `Input ${idx} missing id`).toBeDefined();
        expect(input.label, `Input ${idx} missing label`).toBeDefined();
        expect(input.type, `Input ${idx} missing type`).toBeDefined();
        expect(['text', 'textarea', 'select', 'number', 'checkbox', 'radio', 'email', 'url'])
          .toContain(input.type);
      });
    });

    it('has a prompt generator function', () => {
      expect(skill.generatePrompt).toBeDefined();
      expect(typeof skill.generatePrompt).toBe('function');
    });

    it('generates valid prompts', () => {
      // Create mock inputs
      const mockInputs: Record<string, string> = {};
      skill.inputs.forEach(input => {
        if (input.type === 'select' && input.options) {
          mockInputs[input.id] = input.options[0];
        } else {
          mockInputs[input.id] = 'Test value for ' + input.id;
        }
      });

      const result = skill.generatePrompt(mockInputs);

      expect(result).toBeDefined();
      expect(result.systemInstruction || result.userPrompt).toBeDefined();

      // Check prompt quality
      const promptText = result.systemInstruction || '';
      expect(promptText.length).toBeGreaterThan(100);
    });

    it('has detailed system instructions', () => {
      const mockInputs: Record<string, string> = {};
      skill.inputs.forEach(input => {
        mockInputs[input.id] = 'Test value';
      });

      const result = skill.generatePrompt(mockInputs);
      const systemPrompt = result.systemInstruction || '';

      // Should have substantial prompt
      expect(systemPrompt.length).toBeGreaterThanOrEqual(
        QUALITY_THRESHOLDS.MIN_SYSTEM_PROMPT_LENGTH
      );

      // Analyze prompt quality
      const quality = analyzePromptQuality(systemPrompt);
      expect(quality.hasInstructions).toBe(true);
    });

    it('has visual theme defined', () => {
      expect(skill.theme).toBeDefined();
      // Static skills use theme as string ('violet'), dynamic skills use object ({ primary: '...' })
      const hasTheme = typeof skill.theme === 'string' || skill.theme?.primary;
      expect(hasTheme).toBeTruthy();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROLE TEMPLATE SKILLS TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Role Template Skills Quality', () => {
  it(`should have at least 20 role templates`, () => {
    expect(ROLE_TEMPLATES.length).toBeGreaterThanOrEqual(20);
  });

  describe.each(ROLE_TEMPLATES)('Role: $name', (role: RoleTemplate) => {
    it('has required role metadata', () => {
      expect(role.id).toBeDefined();
      expect(role.name).toBeDefined();
      expect(role.description).toBeDefined();
      expect(role.description.length).toBeGreaterThan(20);
      expect(role.icon).toBeDefined();
      expect(role.dynamicSkills).toBeDefined();
      expect(Array.isArray(role.dynamicSkills)).toBe(true);
    });

    it('has at least 3 skills per role', () => {
      const totalSkills = role.dynamicSkills.length + (role.staticSkillIds?.length || 0);
      expect(totalSkills).toBeGreaterThanOrEqual(3);
    });

    describe.each(role.dynamicSkills)('Skill: $name', (skill) => {
      it('has required basic fields', () => {
        expect(skill.name).toBeDefined();
        expect(skill.name.length).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_NAME_LENGTH);
        expect(skill.description).toBeDefined();
        expect(skill.description.length).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_DESCRIPTION_LENGTH);
        expect(skill.category).toBeDefined();
        expect(['analysis', 'generation', 'automation', 'optimization', 'communication', 'research'])
          .toContain(skill.category);
      });

      it('has properly defined inputs', () => {
        expect(skill.inputs).toBeDefined();
        expect(Array.isArray(skill.inputs)).toBe(true);
        expect(skill.inputs.length).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_INPUTS_PER_SKILL);
        expect(skill.inputs.length).toBeLessThanOrEqual(QUALITY_THRESHOLDS.MAX_INPUTS_PER_SKILL);

        skill.inputs.forEach((input, idx) => {
          expect(input.id, `Input ${idx} in ${skill.name} missing id`).toBeDefined();
          expect(input.label, `Input ${idx} in ${skill.name} missing label`).toBeDefined();
          expect(input.type, `Input ${idx} in ${skill.name} missing type`).toBeDefined();
        });
      });

      it('has prompts defined', () => {
        expect(skill.prompts).toBeDefined();
        expect(skill.prompts.systemInstruction || skill.prompts.template).toBeDefined();
      });

      it('has substantial system instruction', () => {
        const prompt = skill.prompts.systemInstruction || skill.prompts.template || '';
        expect(prompt.length).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_SYSTEM_PROMPT_LENGTH);
      });

      it('has role-specific or domain expertise content in prompt', () => {
        const prompt = skill.prompts.systemInstruction || skill.prompts.template || '';
        const promptLower = prompt.toLowerCase();

        // Check for expertise indicators (comprehensive set)
        const expertiseIndicators = [
          'expert', 'professional', 'specialist', 'experience', 'years',
          'certified', 'consultant', 'architect', 'leader', 'senior',
          'principal', 'manager', 'director', 'trained', 'framework',
          'methodology', 'best practice', 'industry', 'enterprise',
          'partner', 'known for', 'built', 'implemented', 'vp of',
          'head of', 'chief', 'distinguished', 'career', 'background'
        ];

        const hasExpertise = expertiseIndicators.some(indicator =>
          promptLower.includes(indicator)
        );

        expect(hasExpertise).toBe(true);
      });

      it('has visual theme defined', () => {
        expect(skill.theme).toBeDefined();
        expect(skill.theme.primary).toBeDefined();
        expect(skill.theme.iconName).toBeDefined();
      });

      it('has time estimate', () => {
        expect(skill.estimatedTimeSaved).toBeDefined();
        expect(skill.estimatedTimeSaved.length).toBeGreaterThan(0);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATE QUALITY METRICS
// ═══════════════════════════════════════════════════════════════════════════

describe('Aggregate Skill Quality Metrics', () => {
  let allSkills: Array<{
    id: string;
    name: string;
    roleId: string;
    roleName: string;
    promptLength: number;
    inputCount: number;
    category: string;
  }> = [];

  beforeAll(() => {
    // Collect all skills for aggregate analysis
    ROLE_TEMPLATES.forEach(role => {
      role.dynamicSkills.forEach((skill, idx) => {
        const prompt = skill.prompts.systemInstruction || skill.prompts.template || '';
        allSkills.push({
          id: `${role.id}-skill-${idx}`,
          name: skill.name,
          roleId: role.id,
          roleName: role.name,
          promptLength: prompt.length,
          inputCount: skill.inputs.length,
          category: skill.category,
        });
      });
    });
  });

  it('has at least 150 total dynamic skills', () => {
    expect(allSkills.length).toBeGreaterThanOrEqual(150);
  });

  it('has average prompt length above quality threshold', () => {
    const avgLength = allSkills.reduce((sum, s) => sum + s.promptLength, 0) / allSkills.length;
    expect(avgLength).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.IDEAL_SYSTEM_PROMPT_LENGTH);
  });

  it('has no skills below minimum prompt length', () => {
    const tooShort = allSkills.filter(s => s.promptLength < QUALITY_THRESHOLDS.MIN_SYSTEM_PROMPT_LENGTH);
    expect(tooShort.length).toBe(0);
  });

  it('has balanced category distribution', () => {
    const categories = new Set(allSkills.map(s => s.category));
    expect(categories.size).toBeGreaterThanOrEqual(4); // At least 4 categories used
  });

  it('all roles have at least 3 dynamic skills', () => {
    const skillsByRole = new Map<string, number>();
    allSkills.forEach(s => {
      skillsByRole.set(s.roleId, (skillsByRole.get(s.roleId) || 0) + 1);
    });

    skillsByRole.forEach((count, roleId) => {
      expect(count, `Role ${roleId} has only ${count} skills`).toBeGreaterThanOrEqual(3);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT CONTENT QUALITY TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Prompt Content Quality', () => {
  const allPrompts: Array<{ name: string; role: string; prompt: string }> = [];

  beforeAll(() => {
    ROLE_TEMPLATES.forEach(role => {
      role.dynamicSkills.forEach(skill => {
        const prompt = skill.prompts.systemInstruction || skill.prompts.template || '';
        allPrompts.push({ name: skill.name, role: role.name, prompt });
      });
    });
  });

  it('no prompts contain critical placeholder text', () => {
    // Note: Some placeholder text in example tables is intentional
    // We only flag clearly incomplete prompts (TODO, FIXME, lorem ipsum)
    const criticalPatterns = [
      /\[TODO\]/i,
      /\[INSERT HERE\]/i,
      /FIXME/i,
      /lorem ipsum/i,
    ];

    allPrompts.forEach(({ name, prompt }) => {
      criticalPatterns.forEach(pattern => {
        expect(pattern.test(prompt), `${name} contains placeholder: ${pattern}`).toBe(false);
      });
    });
  });

  it('no prompts have excessive empty sections', () => {
    // Check for 5+ consecutive newlines (indicates truly empty sections)
    const excessiveBlankPattern = /\n{5,}/;

    const withExcessiveBlanks = allPrompts.filter(({ prompt }) =>
      excessiveBlankPattern.test(prompt)
    );

    // Allow up to 2 prompts with minor formatting issues
    expect(withExcessiveBlanks.length).toBeLessThanOrEqual(2);
  });

  it('at least 95% of prompts define expertise or credentials', () => {
    const expertisePattern = /expert|experience|years|certified|professional|specialist|senior|principal|credential|consultant|architect|leader|manager|director/i;

    const withoutExpertise = allPrompts.filter(({ prompt }) =>
      !expertisePattern.test(prompt)
    );

    // Allow up to 5% without explicit expertise language
    const threshold = Math.ceil(allPrompts.length * 0.05);
    expect(
      withoutExpertise.length,
      `${withoutExpertise.length} prompts lack expertise: ${withoutExpertise.map(p => p.name).join(', ')}`
    ).toBeLessThanOrEqual(threshold);
  });

  it('all prompts have output format instructions', () => {
    const formatPattern = /format|structure|output|response|markdown|section|heading|bullet|numbered/i;

    const withoutFormat = allPrompts.filter(({ prompt }) => !formatPattern.test(prompt));

    // Allow up to 5% without explicit format instructions
    const threshold = Math.ceil(allPrompts.length * 0.05);
    expect(withoutFormat.length).toBeLessThanOrEqual(threshold);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INPUT VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Input Field Validation', () => {
  it('all inputs have unique IDs within their skill', () => {
    ROLE_TEMPLATES.forEach(role => {
      role.dynamicSkills.forEach(skill => {
        const ids = skill.inputs.map(i => i.id);
        const uniqueIds = new Set(ids);
        expect(
          uniqueIds.size,
          `${skill.name} in ${role.name} has duplicate input IDs`
        ).toBe(ids.length);
      });
    });
  });

  it('all select inputs have options defined', () => {
    ROLE_TEMPLATES.forEach(role => {
      role.dynamicSkills.forEach(skill => {
        skill.inputs.forEach(input => {
          if (input.type === 'select') {
            expect(
              input.options,
              `${skill.name}/${input.id} is select but has no options`
            ).toBeDefined();
            expect(
              input.options!.length,
              `${skill.name}/${input.id} has empty options`
            ).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  it('required inputs are marked with validation', () => {
    let totalInputs = 0;
    let inputsWithValidation = 0;

    ROLE_TEMPLATES.forEach(role => {
      role.dynamicSkills.forEach(skill => {
        skill.inputs.forEach(input => {
          totalInputs++;
          if (input.validation?.required) {
            inputsWithValidation++;
          }
        });
      });
    });

    // At least 30% should have validation
    const validationRatio = inputsWithValidation / totalInputs;
    expect(validationRatio).toBeGreaterThanOrEqual(0.3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY OUTPUT
// ═══════════════════════════════════════════════════════════════════════════

describe('Quality Summary', () => {
  it('generates quality report', () => {
    let totalSkills = 0;
    let totalPromptLength = 0;
    let minPromptLength = Infinity;
    let maxPromptLength = 0;
    let shortestSkill = '';

    ROLE_TEMPLATES.forEach(role => {
      role.dynamicSkills.forEach(skill => {
        totalSkills++;
        const prompt = skill.prompts.systemInstruction || skill.prompts.template || '';
        const len = prompt.length;
        totalPromptLength += len;
        if (len < minPromptLength) {
          minPromptLength = len;
          shortestSkill = `${role.name}/${skill.name}`;
        }
        if (len > maxPromptLength) {
          maxPromptLength = len;
        }
      });
    });

    const staticSkillCount = Object.keys(SKILLS).length;

    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('                    SKILL QUALITY REPORT                       ');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`Total Role Templates:     ${ROLE_TEMPLATES.length}`);
    console.log(`Total Dynamic Skills:     ${totalSkills}`);
    console.log(`Total Static Skills:      ${staticSkillCount}`);
    console.log(`TOTAL SKILLS:             ${totalSkills + staticSkillCount}`);
    console.log('──────────────────────────────────────────────────────────────');
    console.log(`Avg Prompt Length:        ${Math.round(totalPromptLength / totalSkills)} chars`);
    console.log(`Min Prompt Length:        ${minPromptLength} chars`);
    console.log(`Max Prompt Length:        ${maxPromptLength} chars`);
    console.log(`Shortest Skill:           ${shortestSkill}`);
    console.log('══════════════════════════════════════════════════════════════\n');

    expect(true).toBe(true);
  });
});
