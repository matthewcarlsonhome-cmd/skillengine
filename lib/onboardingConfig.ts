/**
 * Onboarding Configuration
 *
 * Defines the options available during user onboarding for:
 * - Automation interest selection
 * - Role category selection
 * - Workflow interest selection
 */

import type {
  AutomationInterest,
  RoleCategory,
  WorkflowCategory,
} from './storage/types';

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: Automation Interest Options
// ═══════════════════════════════════════════════════════════════════════════

export interface AutomationInterestOption {
  value: AutomationInterest;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  color: string;
}

export const AUTOMATION_INTEREST_OPTIONS: AutomationInterestOption[] = [
  {
    value: 'work',
    label: 'For My Job',
    description: 'Automate tasks and workflows at work',
    icon: 'Briefcase',
    color: 'blue',
  },
  {
    value: 'business',
    label: 'For My Business',
    description: 'Grow and streamline my own business',
    icon: 'Building2',
    color: 'purple',
  },
  {
    value: 'education',
    label: 'For Learning',
    description: 'Help with studies, research, or courses',
    icon: 'GraduationCap',
    color: 'green',
  },
  {
    value: 'personal',
    label: 'Personal Projects',
    description: 'Side projects, hobbies, and personal productivity',
    icon: 'Home',
    color: 'amber',
  },
  {
    value: 'general',
    label: 'Just Exploring',
    description: 'Curious to see what AI automation can do',
    icon: 'Compass',
    color: 'gray',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: Role Category Options
// ═══════════════════════════════════════════════════════════════════════════

export interface RoleCategoryOption {
  value: RoleCategory;
  label: string;
  description: string;
  icon: string;
}

export const ROLE_CATEGORY_OPTIONS: RoleCategoryOption[] = [
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Campaigns, SEO, social media, content',
    icon: 'Megaphone',
  },
  {
    value: 'sales',
    label: 'Sales & BD',
    description: 'Proposals, prospecting, account management',
    icon: 'Target',
  },
  {
    value: 'copywriting',
    label: 'Copywriting',
    description: 'Content writing, ads, messaging',
    icon: 'PenTool',
  },
  {
    value: 'management',
    label: 'Management',
    description: 'Project management, leadership, planning',
    icon: 'Users',
  },
  {
    value: 'analysis',
    label: 'Analysis',
    description: 'Data analysis, research, insights',
    icon: 'BarChart3',
  },
  {
    value: 'engineering',
    label: 'Engineering',
    description: 'Software, systems, technical work',
    icon: 'Code',
  },
  {
    value: 'design',
    label: 'Design',
    description: 'UX/UI, product design, creative',
    icon: 'Palette',
  },
  {
    value: 'operations',
    label: 'Operations',
    description: 'Process, logistics, efficiency',
    icon: 'Settings',
  },
  {
    value: 'hr',
    label: 'HR & People',
    description: 'Recruiting, training, culture',
    icon: 'Heart',
  },
  {
    value: 'finance',
    label: 'Finance',
    description: 'Budgeting, analysis, reporting',
    icon: 'DollarSign',
  },
  {
    value: 'consulting',
    label: 'Consulting',
    description: 'Advisory, strategy, client work',
    icon: 'Lightbulb',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else entirely',
    icon: 'MoreHorizontal',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: Workflow Category Options
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkflowCategoryOption {
  value: WorkflowCategory;
  label: string;
  description: string;
  icon: string;
  exampleWorkflows: string[];
}

export const WORKFLOW_CATEGORY_OPTIONS: WorkflowCategoryOption[] = [
  {
    value: 'job-search',
    label: 'Job Search & Career',
    description: 'Applications, interviews, career planning',
    icon: 'Briefcase',
    exampleWorkflows: [
      'Job Application Package',
      'Interview Preparation',
      'Post-Interview Follow-Up',
    ],
  },
  {
    value: 'marketing-campaigns',
    label: 'Marketing & SEO',
    description: 'Campaigns, content, social media, SEO',
    icon: 'Megaphone',
    exampleWorkflows: [
      'Digital Marketing Campaign Launch',
      'SEO Client Onboarding',
      'Marketing Campaign Planning',
    ],
  },
  {
    value: 'sales-business',
    label: 'Sales & Business Dev',
    description: 'Proposals, pitches, client acquisition',
    icon: 'Target',
    exampleWorkflows: [
      'Sales Account Pursuit',
      'Startup Investor Pitch',
      'RFP Response Center',
    ],
  },
  {
    value: 'project-management',
    label: 'Project Management',
    description: 'Planning, tracking, delivery',
    icon: 'CheckSquare',
    exampleWorkflows: [
      'Project Initiation',
      'Sprint Delivery',
      'Program Governance',
    ],
  },
  {
    value: 'content-creation',
    label: 'Content Creation',
    description: 'Writing, copywriting, creative content',
    icon: 'FileText',
    exampleWorkflows: [
      'Content Strategy Planning',
      'Email Campaign Design',
      'Social Media Calendar',
    ],
  },
  {
    value: 'data-analysis',
    label: 'Data & Analytics',
    description: 'Research, insights, reporting',
    icon: 'BarChart3',
    exampleWorkflows: [
      'Financial Analysis',
      'Marketing Analytics',
      'Competitive Intelligence',
    ],
  },
  {
    value: 'business-strategy',
    label: 'Business Strategy',
    description: 'Business cases, strategy, consulting',
    icon: 'Lightbulb',
    exampleWorkflows: [
      'Business Case Development',
      'Consulting Engagement',
      'Process Improvement',
    ],
  },
  {
    value: 'training-education',
    label: 'Training & Education',
    description: 'Workshops, courses, learning materials',
    icon: 'GraduationCap',
    exampleWorkflows: [
      'Training Workshop Setup',
      'Course Content Development',
    ],
  },
  {
    value: 'governance-compliance',
    label: 'Governance & Compliance',
    description: 'Policies, risk, compliance programs',
    icon: 'Shield',
    exampleWorkflows: [
      'AI Governance Implementation',
      'Compliance Program Setup',
      'Incident to Improvement',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getAutomationInterestLabel(value: AutomationInterest): string {
  return AUTOMATION_INTEREST_OPTIONS.find(o => o.value === value)?.label || 'General';
}

export function getRoleCategoryLabel(value: RoleCategory): string {
  return ROLE_CATEGORY_OPTIONS.find(o => o.value === value)?.label || value;
}

export function getWorkflowCategoryLabel(value: WorkflowCategory): string {
  return WORKFLOW_CATEGORY_OPTIONS.find(o => o.value === value)?.label || value;
}

/**
 * Get a user-friendly summary of the user's profile
 */
export function getProfileSummary(
  automationInterest?: AutomationInterest,
  roleCategories?: RoleCategory[],
  workflowInterests?: WorkflowCategory[]
): string {
  const parts: string[] = [];

  if (automationInterest && automationInterest !== 'general') {
    parts.push(getAutomationInterestLabel(automationInterest));
  }

  if (roleCategories && roleCategories.length > 0) {
    const roleLabels = roleCategories.slice(0, 2).map(getRoleCategoryLabel);
    parts.push(roleLabels.join(' & '));
  }

  if (parts.length === 0) {
    return 'General User';
  }

  return parts.join(' - ');
}
