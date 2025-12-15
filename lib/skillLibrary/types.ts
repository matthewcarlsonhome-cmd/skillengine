/**
 * Skill Library Types
 *
 * Unified schema for all skills in the library - builtin, role-template, and community.
 * Skills are browsable and filterable by multiple dimensions (tags, roles, categories, use cases).
 */

import type { DynamicFormInput } from '../storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// SKILL CATEGORIES & TAGS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Primary skill categories (what the skill does)
 */
export type SkillCategory =
  | 'analysis'       // Analyze data, code, documents
  | 'generation'     // Generate content, documents, code
  | 'automation'     // Automate repetitive tasks
  | 'optimization'   // Improve/optimize existing content
  | 'communication'  // Help with communication tasks
  | 'research';      // Research and information gathering

/**
 * Use case contexts (when to use the skill)
 */
export type SkillUseCase =
  | 'job-search'     // Active job searching
  | 'interview-prep' // Preparing for interviews
  | 'daily-work'     // Day-to-day job tasks
  | 'onboarding'     // Starting a new role
  | 'career-growth'  // Career development
  | 'networking';    // Professional networking

/**
 * Experience level required
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Where the skill comes from
 */
export type SkillSource = 'builtin' | 'role-template' | 'community';

// ═══════════════════════════════════════════════════════════════════════════
// SKILL TAGS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Multi-dimensional tagging for flexible filtering
 */
export interface SkillTags {
  /** Job roles this skill is useful for (optional, multiple allowed) */
  roles: string[];

  /** Primary category */
  category: SkillCategory;

  /** Use case contexts */
  useCases: SkillUseCase[];

  /** Experience level */
  level: SkillLevel;

  /** Custom tags for additional filtering */
  custom?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY SKILL (UNIFIED SCHEMA)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unified skill definition for the Skill Library
 * Merges builtin, role-template, and community skill formats
 */
export interface LibrarySkill {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Short description for cards */
  description: string;

  /** Detailed description for detail view */
  longDescription?: string;

  /** What the user gets from this skill */
  whatYouGet?: string[];

  /** Estimated time saved */
  estimatedTimeSaved?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // TAGGING
  // ─────────────────────────────────────────────────────────────────────────

  /** Multi-dimensional tags for filtering */
  tags: SkillTags;

  /** Where this skill comes from */
  source: SkillSource;

  /** For role-template skills, which template it came from */
  sourceRoleId?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // VISUAL
  // ─────────────────────────────────────────────────────────────────────────

  /** Theme styling */
  theme: {
    primary: string;      // e.g., 'text-blue-400'
    secondary: string;    // e.g., 'bg-blue-900/20'
    gradient: string;     // e.g., 'from-blue-500/20 to-transparent'
    iconName?: string;    // Lucide icon name
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EXECUTION
  // ─────────────────────────────────────────────────────────────────────────

  /** Form inputs */
  inputs: DynamicFormInput[];

  /** Prompt configuration */
  prompts: {
    systemInstruction: string;
    userPromptTemplate: string;
    outputFormat: 'markdown' | 'json' | 'table';
  };

  /** Execution config */
  config: {
    recommendedModel: 'gemini' | 'claude' | 'any';
    useWebSearch: boolean;
    maxTokens: number;
    temperature: number;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // METRICS
  // ─────────────────────────────────────────────────────────────────────────

  /** Usage count */
  useCount: number;

  /** Rating info */
  rating: {
    sum: number;
    count: number;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ATTRIBUTION
  // ─────────────────────────────────────────────────────────────────────────

  /** For community skills */
  author?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };

  /** Creation date */
  createdAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CURATED COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A themed collection of skills
 */
export interface SkillCollection {
  id: string;
  name: string;
  description: string;
  icon: string;        // Lucide icon name
  color: string;       // Tailwind color
  skillIds: string[];  // Skills in this collection

  /** Sort priority (lower = shown first) */
  priority: number;

  /** Featured on homepage? */
  featured?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE DEFINITIONS (FOR FILTERING)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Role definition for the filter sidebar
 */
export interface RoleDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  skillCount?: number;  // Computed at runtime
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER STATE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Current filter state for the library
 */
export interface LibraryFilters {
  search: string;
  categories: SkillCategory[];
  roles: string[];
  useCases: SkillUseCase[];
  levels: SkillLevel[];
  sources: SkillSource[];
  /** Filter to specific skill IDs (for collections) */
  skillIds: string[];
}

/**
 * Sort options
 */
export type LibrarySortOption =
  | 'popular'     // By use count
  | 'rating'      // By average rating
  | 'newest'      // By creation date
  | 'name';       // Alphabetical

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const SKILL_CATEGORIES: { value: SkillCategory; label: string; icon: string }[] = [
  { value: 'analysis', label: 'Analysis', icon: 'BarChart3' },
  { value: 'generation', label: 'Generation', icon: 'Sparkles' },
  { value: 'automation', label: 'Automation', icon: 'Zap' },
  { value: 'optimization', label: 'Optimization', icon: 'TrendingUp' },
  { value: 'communication', label: 'Communication', icon: 'MessageSquare' },
  { value: 'research', label: 'Research', icon: 'Search' },
];

export const SKILL_USE_CASES: { value: SkillUseCase; label: string; icon: string }[] = [
  { value: 'job-search', label: 'Job Search', icon: 'Briefcase' },
  { value: 'interview-prep', label: 'Interview Prep', icon: 'Users' },
  { value: 'daily-work', label: 'Daily Work', icon: 'Calendar' },
  { value: 'onboarding', label: 'Onboarding', icon: 'Rocket' },
  { value: 'career-growth', label: 'Career Growth', icon: 'TrendingUp' },
  { value: 'networking', label: 'Networking', icon: 'Network' },
];

export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const SKILL_SOURCES: { value: SkillSource; label: string }[] = [
  { value: 'builtin', label: 'Built-in' },
  { value: 'role-template', label: 'Role Templates' },
  { value: 'community', label: 'Community' },
];

/**
 * Default empty filters
 */
export const DEFAULT_FILTERS: LibraryFilters = {
  search: '',
  categories: [],
  roles: [],
  useCases: [],
  levels: [],
  sources: [],
  skillIds: [],
};
