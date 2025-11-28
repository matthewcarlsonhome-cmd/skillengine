// Skills module - exports both static and dynamic skills

// Re-export static skills (the original 15 job applicant skills)
export { SKILLS } from './static';

// Re-export registry functions for unified skill access
export {
  getAllSkills,
  getSkill,
  getStaticSkills,
  getStaticSkill,
  getDynamicSkillsByWorkspace,
  getAllDynamicSkills,
  saveDynamicSkill,
  deleteDynamicSkill,
  searchSkills,
  getSkillsByCategory,
  isDynamicSkill,
  type UnifiedSkill,
  type SkillSource,
} from './registry';

// Re-export dynamic skill generation functions
export {
  analyzeJobDescription,
  generateSkillRecommendations,
  buildSkill,
  buildMultipleSkills,
  executeDynamicSkill,
  executeDynamicSkillComplete,
  interpolateTemplate,
  type BuildProgress,
  type BuildSkillOptions,
} from './dynamic';
