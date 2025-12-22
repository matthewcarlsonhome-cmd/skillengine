/**
 * Self-Improvement Module
 *
 * Exports the recursive self-improvement system for skills.
 * This system allows skills to improve based on user feedback.
 *
 * Architecture:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Users rate skill outputs (1-5 stars + dimension scores)
 * 2. Grades are stored in Supabase (skill_grades_v2 table)
 * 3. Database triggers auto-aggregate scores to skill_registry
 * 4. When scores drop below threshold after 50+ grades, improvement is triggered
 * 5. Admin reviews and approves AI-generated prompt improvements
 * 6. Improved prompts are stored in skill_registry and served to all users
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Core types
export * from './types';

// Legacy localStorage engine (deprecated - use supabaseGrading instead)
export * from './engine';

// Supabase-backed grading system (recommended)
export {
  submitGrade,
  getSkillScores,
  getSkillPrompt,
  getSkillVersion,
  skillExistsInRegistry,
  registerSkill,
  getAllRegisteredSkills,
  getPendingImprovementRequests,
  getImprovementHistory,
  hashInputs,
  type GradeSubmission,
  type SkillScores,
  type SkillPrompt,
  type SkillRegistryEntry,
  type ImprovementRequest,
} from './supabaseGrading';

// Prompt resolution (for skill execution)
export {
  getEffectivePrompt,
  hasImprovedPrompt,
  getPromptVersion,
  interpolateTemplate,
  createRegistryAwarePromptGenerator,
  type ResolvedPrompt,
} from './promptResolver';

/**
 * Quick-start guide (Supabase-backed):
 *
 * 1. RECORDING GRADES:
 *    import { submitGrade, hashInputs } from './selfImprovement';
 *    await submitGrade({
 *      skillId: 'resume-customizer',
 *      skillVersion: 1,
 *      overallScore: 4,
 *      dimensionScores: {
 *        relevance: 5,
 *        accuracy: 4,
 *        completeness: 4,
 *        clarity: 5,
 *        actionability: 3,
 *        professionalism: 5,
 *      },
 *      feedback: 'Great output, but could be more concise',
 *      wasOutputUsed: true,
 *      inputsHash: hashInputs(inputs),
 *    });
 *
 * 2. GETTING SKILL SCORES:
 *    import { getSkillScores } from './selfImprovement';
 *    const scores = await getSkillScores('resume-customizer');
 *    console.log(`Average score: ${scores.averageOverall}`);
 *    console.log(`Grades until improvement: ${scores.gradesUntilEligible}`);
 *
 * 3. GETTING IMPROVED PROMPTS:
 *    import { getEffectivePrompt } from './selfImprovement';
 *    const prompt = await getEffectivePrompt(skillId, fallbackPrompt);
 *    // Uses registry version if available, falls back to code-defined
 *
 * 4. CHECKING PENDING IMPROVEMENTS (Admin):
 *    import { getPendingImprovementRequests } from './selfImprovement';
 *    const pending = await getPendingImprovementRequests();
 *    // Review and approve via admin dashboard
 */
