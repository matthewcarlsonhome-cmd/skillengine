// Storage types for Skill Engine

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  // Source material
  jobDescription: string;
  jdAnalysis: JDAnalysis;

  // Skill tracking
  recommendations: SkillRecommendation[];
  selectedSkillIds: string[];

  // Metadata
  roleType: string;
  company?: string;
  industry?: string;
}

export interface JDAnalysis {
  role: {
    title: string;
    department: string;
    level: string;
    type: string;
  };

  responsibilities: {
    task: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad-hoc';
    automationPotential: 'high' | 'medium' | 'low';
    category: string;
  }[];

  toolsAndPlatforms: {
    name: string;
    category: string;
    proficiencyRequired: string;
  }[];

  workflows: {
    name: string;
    steps: string[];
    painPoints: string[];
  }[];

  stakeholders: {
    type: string;
    interactionType: string;
  }[];

  skills: {
    name: string;
    category: 'technical' | 'soft' | 'domain';
    importance: 'required' | 'preferred' | 'nice-to-have';
  }[];

  automationOpportunities: {
    area: string;
    currentProcess: string;
    proposedSkill: string;
    impactEstimate: string;
  }[];
}

export interface SkillRecommendation {
  id: string;
  name: string;
  description: string;
  category: 'automation' | 'analysis' | 'generation' | 'optimization' | 'communication';
  automationPotential: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTimeSaved: string;
  valueProposition: string;
  selected?: boolean;
}

export interface DynamicFormInput {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  placeholder?: string;
  helpText?: string;
  options?: string[];
  defaultValue?: string | boolean | number;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
}

export interface DynamicSkill {
  id: string;
  workspaceId: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  // Skill definition
  name: string;
  description: string;
  longDescription: string;
  category: 'automation' | 'analysis' | 'generation' | 'optimization' | 'communication';
  estimatedTimeSaved: string;

  // Visual
  theme: {
    primary: string;
    secondary: string;
    gradient: string;
    iconName: string;
  };

  // Form definition
  inputs: DynamicFormInput[];

  // Prompts
  prompts: {
    systemInstruction: string;
    userPromptTemplate: string;
    outputFormat: 'markdown' | 'json' | 'table';
  };

  // Execution config
  config: {
    recommendedModel: 'gemini' | 'claude' | 'any';
    useWebSearch: boolean;
    maxTokens: number;
    temperature: number;
  };

  // Usage tracking
  executionCount: number;
  lastExecutedAt?: string;
}

export interface SkillExecution {
  id: string;
  skillId: string;
  skillName: string;
  skillSource: 'static' | 'dynamic' | 'community';
  workspaceId?: string;
  createdAt: string;

  inputs: Record<string, unknown>;
  output: string;

  model: 'gemini' | 'claude';
  durationMs: number;
}

export interface UserPreferences {
  id: 'default';
  preferredApi: 'gemini' | 'claude';
  theme: 'light' | 'dark' | 'system';
  defaultResume?: string;
  defaultJobDescription?: string;
}

export interface SavedOutput {
  id: string;
  title: string;
  notes?: string;
  skillId: string;
  skillName: string;
  skillSource: 'static' | 'dynamic' | 'community';
  output: string;
  inputs: Record<string, unknown>;
  model: 'gemini' | 'claude';
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isFavorite: boolean;
}

export interface FavoriteSkill {
  id: string;
  skillId: string;
  skillName: string;
  skillDescription: string;
  skillSource: 'static' | 'dynamic' | 'community';
  category: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW TYPES
// For chaining multiple skills together in automated sequences
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Defines how an input field gets its value
 */
export type WorkflowInputSource =
  | { type: 'global'; inputId: string }           // From workflow's global inputs
  | { type: 'previous'; stepId: string; outputKey: string }  // From a previous step's output
  | { type: 'static'; value: string }             // Hardcoded value
  | { type: 'computed'; template: string };       // Template with {{placeholders}}

/**
 * A single step in a workflow that runs one skill
 */
export interface WorkflowStep {
  id: string;
  skillId: string;              // Reference to skill in SKILLS
  name: string;                 // Display name for this step
  description: string;          // What this step accomplishes

  // Map skill inputs to their sources
  inputMappings: {
    [skillInputId: string]: WorkflowInputSource;
  };

  // Key to store this step's output for later steps
  outputKey: string;

  // Optional settings
  optional?: boolean;           // Can be skipped
  reviewRequired?: boolean;     // Pause for user review before continuing
}

/**
 * Global input collected at workflow start
 */
export interface WorkflowGlobalInput {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  helpText?: string;
  options?: string[];           // For select type
  required: boolean;
  rows?: number;                // For textarea
  prefillFrom?: 'resume' | 'jobDescription' | 'companyName';  // Auto-fill from context
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;                 // Lucide icon name
  color: string;                // Tailwind color class
  estimatedTime: string;        // e.g., "10-15 minutes"

  // What the user will receive
  outputs: string[];

  // Inputs collected once at the start
  globalInputs: WorkflowGlobalInput[];

  // Ordered sequence of skills to run
  steps: WorkflowStep[];
}

/**
 * Runtime state for a workflow execution
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'collecting_inputs' | 'running' | 'paused' | 'completed' | 'error';
  currentStepIndex: number;

  // Collected global inputs
  globalInputs: Record<string, string>;

  // Outputs from each completed step
  stepOutputs: Record<string, string>;  // stepId -> output

  // Step statuses
  stepStatuses: Record<string, 'pending' | 'running' | 'completed' | 'skipped' | 'error'>;

  // Error info if failed
  error?: string;

  // Timestamps
  startedAt: string;
  completedAt?: string;
}
