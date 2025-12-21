/**
 * Self-Improvement Module
 *
 * Exports the recursive self-improvement system for skills.
 * This system allows skills to improve based on user feedback.
 */

export * from './types';
export * from './engine';

// Quick-start guide:
//
// 1. RECORDING GRADES:
//    import { recordGrade } from './selfImprovement';
//    await recordGrade({
//      skillId: 'resume-customizer',
//      skillVersionId: 'v1',
//      userId: 'user-123',
//      executionId: 'exec-456',
//      inputsHash: hashInputs(inputs),
//      overallScore: 4,
//      dimensionScores: [
//        { dimension: 'relevance', score: 5 },
//        { dimension: 'accuracy', score: 4 },
//        ...
//      ],
//      feedback: 'Great output, but could be more concise',
//      wasOutputUsed: true,
//      executedAt: new Date().toISOString(),
//    });
//
// 2. CHECKING IMPROVEMENT STATUS:
//    import { getImprovementHistory } from './selfImprovement';
//    const history = getImprovementHistory('resume-customizer');
//    console.log(`Current version: ${history.currentVersion}`);
//    console.log(`Grades until review: ${history.gradesUntilNextReview}`);
//
// 3. APPLYING IMPROVEMENTS:
//    import { applyImprovements } from './selfImprovement';
//    const newVersion = await applyImprovements(requestId);
//
// 4. ROLLBACK IF NEEDED:
//    import { rollbackVersion } from './selfImprovement';
//    await rollbackVersion('resume-customizer', 'New version scored lower');
