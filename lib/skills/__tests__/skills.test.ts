/**
 * Comprehensive Skill Tests
 *
 * These tests verify that all skills are properly defined, accessible,
 * and functioning correctly throughout the application.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SKILLS } from '../static';
import {
  getAllSkills,
  getSkill,
  getStaticSkills,
  getStaticSkill,
  searchSkills,
  getSkillsByCategory,
} from '../registry';
import type { Skill } from '../../../types';

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL STRUCTURE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Skill Definitions', () => {
  const skillIds = Object.keys(SKILLS);

  it('should have skills defined', () => {
    expect(skillIds.length).toBeGreaterThan(0);
    expect(skillIds.length).toBeGreaterThanOrEqual(16); // At least the original 16 job seeker skills
  });

  it('should have no duplicate skill IDs', () => {
    const uniqueIds = new Set(skillIds);
    expect(uniqueIds.size).toBe(skillIds.length);
  });

  describe.each(skillIds)('Skill: %s', (skillId) => {
    const skill = SKILLS[skillId];

    it('should have required properties', () => {
      expect(skill).toBeDefined();
      expect(skill.id).toBe(skillId);
      expect(skill.name).toBeDefined();
      expect(typeof skill.name).toBe('string');
      expect(skill.name.length).toBeGreaterThan(0);
    });

    it('should have description', () => {
      expect(skill.description).toBeDefined();
      expect(typeof skill.description).toBe('string');
      expect(skill.description.length).toBeGreaterThan(0);
    });

    it('should have theme configuration', () => {
      expect(skill.theme).toBeDefined();
      // Theme can be either an object with primary/secondary or a string color name
      if (typeof skill.theme === 'object') {
        expect(skill.theme.primary).toBeDefined();
        expect(skill.theme.secondary).toBeDefined();
      } else {
        // String theme like 'violet', 'blue', etc.
        expect(typeof skill.theme).toBe('string');
      }
    });

    it('should have icon component', () => {
      expect(skill.icon).toBeDefined();
    });

    it('should have inputs array', () => {
      expect(skill.inputs).toBeDefined();
      expect(Array.isArray(skill.inputs)).toBe(true);
    });

    it('should have valid inputs structure', () => {
      skill.inputs.forEach((input, index) => {
        expect(input.id).toBeDefined();
        expect(input.label).toBeDefined();
        expect(input.type).toBeDefined();
        expect(['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'file', 'range', 'slider'])
          .toContain(input.type);
      });
    });

    it('should have generatePrompt function', () => {
      expect(skill.generatePrompt).toBeDefined();
      expect(typeof skill.generatePrompt).toBe('function');
    });

    it('should generate valid prompt structure', () => {
      // Create mock inputs based on skill inputs
      const mockInputs: Record<string, string> = {};
      skill.inputs.forEach((input) => {
        mockInputs[input.id] = `Test value for ${input.id}`;
      });

      const result = skill.generatePrompt(mockInputs);
      expect(result).toBeDefined();
      expect(result.systemInstruction).toBeDefined();
      expect(typeof result.systemInstruction).toBe('string');
      expect(result.systemInstruction.length).toBeGreaterThan(0);
      expect(result.userPrompt).toBeDefined();
      expect(typeof result.userPrompt).toBe('string');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL REGISTRY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Skill Registry', () => {
  describe('getAllSkills (async)', () => {
    it('should return all skills', async () => {
      const skills = await getAllSkills();
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.length).toBeGreaterThanOrEqual(Object.keys(SKILLS).length);
    });

    it('should return unified skill objects', async () => {
      const skills = await getAllSkills();
      skills.forEach((unified) => {
        expect(unified.skill).toBeDefined();
        expect(unified.skill.id).toBeDefined();
        expect(unified.skill.name).toBeDefined();
        expect(unified.source).toBeDefined();
        expect(['static', 'dynamic']).toContain(unified.source);
      });
    });
  });

  describe('getSkill (async)', () => {
    it('should retrieve skill by ID', async () => {
      const result = await getSkill('job-readiness-score');
      expect(result).toBeDefined();
      expect(result?.skill.id).toBe('job-readiness-score');
      expect(result?.source).toBe('static');
    });

    it('should return null for non-existent skill', async () => {
      const result = await getSkill('non-existent-skill-id');
      expect(result).toBeNull();
    });
  });

  describe('getStaticSkills', () => {
    it('should return all static skills', () => {
      const skills = getStaticSkills();
      expect(skills.length).toBe(Object.keys(SKILLS).length);
    });
  });

  describe('getStaticSkill', () => {
    it('should retrieve static skill by ID', () => {
      const skill = getStaticSkill('resume-customizer');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('resume-customizer');
    });
  });

  describe('searchSkills (async)', () => {
    it('should find skills by name', async () => {
      const results = await searchSkills('resume');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((unified) => {
        expect(unified.skill.name.toLowerCase()).toContain('resume');
      });
    });

    it('should find skills by description', async () => {
      const results = await searchSkills('interview');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', async () => {
      const results = await searchSkills('xyznonexistent123');
      expect(results.length).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIFIC SKILL CATEGORY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Job Seeker Skills', () => {
  const jobSeekerSkillIds = [
    'job-readiness-score',
    'skills-gap-analyzer',
    'linkedin-optimizer-pro',
    'ats-optimization-checker',
    'resume-customizer',
    'cover-letter-generator',
    'networking-script-generator',
    'company-research',
    'interview-prep',
    'thank-you-note-generator',
    'offer-evaluation-pro',
    'salary-negotiation-master',
    'onboarding-accelerator-pro',
    'day-in-the-life-generator',
    'role-ai-automation-analyzer',
    'healthcare-resume-parser',
  ];

  it('should have all 16 original job seeker skills', () => {
    jobSeekerSkillIds.forEach((skillId) => {
      const skill = SKILLS[skillId];
      expect(skill).toBeDefined();
      expect(skill.id).toBe(skillId);
    });
  });

  it('should use shared job seeker inputs', () => {
    // Most job seeker skills should have jobDescription and userBackground inputs
    const coreSkills = ['resume-customizer', 'cover-letter-generator', 'interview-prep'];
    coreSkills.forEach((skillId) => {
      const skill = SKILLS[skillId];
      const inputIds = skill.inputs.map((i) => i.id);
      expect(inputIds).toContain('jobDescription');
      expect(inputIds).toContain('userBackground');
    });
  });
});

describe('AI Governance Skills', () => {
  const governanceSkillIds = [
    'ai-governance-readiness-assessment',
    'secure-ai-usage-playbook',
    'ai-data-flow-risk-map',
    'ai-governance-client-brief',
    'compliance-audit-prep-assistant',
    'policy-document-generator',
    'incident-postmortem-generator',
    'change-request-doc-builder',
  ];

  it('should have governance skills defined', () => {
    governanceSkillIds.forEach((skillId) => {
      const skill = SKILLS[skillId];
      expect(skill).toBeDefined();
    });
  });
});

describe('Excel & Analytics Skills', () => {
  const excelSkillIds = [
    'excel-data-analyzer',
    'excel-data-cleaner',
    'excel-marketing-dashboard',
    'excel-chart-designer',
    'budget-variance-narrator',
  ];

  it('should have excel/analytics skills defined', () => {
    excelSkillIds.forEach((skillId) => {
      const skill = SKILLS[skillId];
      expect(skill).toBeDefined();
    });
  });
});

describe('Enterprise Skills', () => {
  const enterpriseSkillIds = [
    'executive-communication-pack',
    'steering-committee-pack',
    'contract-review-accelerator',
    'automation-opportunity-assessment',
    'executive-decision-memo',
    'board-presentation-builder',
  ];

  it('should have enterprise skills defined', () => {
    enterpriseSkillIds.forEach((skillId) => {
      const skill = SKILLS[skillId];
      expect(skill).toBeDefined();
    });
  });
});

describe('Technical Skills', () => {
  const technicalSkillIds = [
    'prompt-engineering-optimizer',
    'sql-query-optimizer',
    'api-documentation-generator',
    'adr-writer',
    'ml-model-card-generator',
    'rag-system-design',
    'ai-ethics-review',
  ];

  it('should have technical skills defined', () => {
    technicalSkillIds.forEach((skillId) => {
      const skill = SKILLS[skillId];
      expect(skill).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT GENERATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Prompt Generation', () => {
  it('should generate non-empty system instructions', () => {
    const skillIds = Object.keys(SKILLS);
    skillIds.forEach((skillId) => {
      const skill = SKILLS[skillId];
      const mockInputs: Record<string, string> = {};
      skill.inputs.forEach((input) => {
        mockInputs[input.id] = `Test ${input.id}`;
      });

      const { systemInstruction } = skill.generatePrompt(mockInputs);
      expect(systemInstruction.length).toBeGreaterThan(100);
    });
  });

  it('should include user input values in user prompt', () => {
    const skill = SKILLS['resume-customizer'];
    const mockInputs = {
      jobTitle: 'Software Engineer',
      companyName: 'Google',
      jobDescription: 'Build amazing products',
      userBackground: 'Experienced developer',
    };

    const { userPrompt } = skill.generatePrompt(mockInputs);
    expect(userPrompt).toContain('Software Engineer');
    expect(userPrompt).toContain('Google');
  });

  it('should handle empty optional inputs', () => {
    const skill = SKILLS['job-readiness-score'];
    const mockInputs = {
      jobTitle: 'PM',
      companyName: 'Meta',
      jobDescription: 'Lead products',
      userBackground: 'Background info',
      // additionalContext is optional and not provided
    };

    const result = skill.generatePrompt(mockInputs);
    expect(result).toBeDefined();
    expect(result.systemInstruction).toBeDefined();
    expect(result.userPrompt).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL COUNT VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Skill Count Verification', () => {
  it('should have expected minimum number of skills', () => {
    const count = Object.keys(SKILLS).length;
    // We expect at least 50 skills based on the current codebase
    expect(count).toBeGreaterThanOrEqual(50);
  });

  it('should export skills through registry', () => {
    const registrySkills = getStaticSkills();
    const directSkills = Object.values(SKILLS);
    expect(registrySkills.length).toBe(directSkills.length);
  });
});
