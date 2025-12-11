# SkillEngine Architecture Documentation

> **Last Updated:** December 2024
> **Version:** 2.0
> **Application:** AI-Powered Career Skills Platform

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Application Structure](#application-structure)
4. [Core Concepts](#core-concepts)
5. [Skill System Architecture](#skill-system-architecture)
6. [Data Layer](#data-layer)
7. [State Management](#state-management)
8. [AI Provider Integration](#ai-provider-integration)
9. [Routing & Navigation](#routing--navigation)
10. [Component Architecture](#component-architecture)
11. [Workflow System](#workflow-system)
12. [Authentication & Authorization](#authentication--authorization)
13. [Export System](#export-system)
14. [Data Flow Diagrams](#data-flow-diagrams)
15. [File Structure Reference](#file-structure-reference)
16. [Extension Points](#extension-points)

---

## Executive Summary

SkillEngine is a client-side React application that provides AI-powered productivity tools for job seekers and working professionals. The application enables users to:

- **Run pre-built AI skills** (16 static skills for job seekers)
- **Browse role-specific skill libraries** (20+ professional roles with 80+ skills)
- **Generate custom skills** by analyzing job descriptions
- **Chain skills into workflows** for automated multi-step processes
- **Export skills** for use in external AI platforms

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | React 18 + TypeScript | Type safety, ecosystem, component model |
| **Routing** | HashRouter | Static hosting compatibility (Netlify) |
| **Styling** | Tailwind CSS | Rapid development, consistent design |
| **Storage** | IndexedDB | Large data, offline support, no backend required |
| **AI Providers** | Gemini + Claude | User choice, different capabilities |
| **Auth** | Supabase (optional) | Community features, user tracking |
| **Build** | Vite | Fast development, optimized builds |

---

## Technology Stack

### Frontend Core
```
React 18.3.1          - UI framework with hooks
TypeScript 5.4.5      - Type safety and developer experience
Vite 5.2.13           - Build tool and dev server
Tailwind CSS 3.4.4    - Utility-first styling
```

### Routing & Navigation
```
react-router-dom 6.23.1  - Client-side routing (HashRouter)
```

### AI & API Integration
```
@google/generative-ai 0.24.1  - Gemini API SDK
Anthropic Claude              - Direct REST API (fetch)
```

### Backend & Storage
```
@supabase/supabase-js 2.86.0  - Auth & community features
IndexedDB (native)             - Local data persistence
localStorage                   - Settings & preferences
```

### UI Components
```
lucide-react 0.395.0   - Icon library
react-markdown 9.0.1   - Markdown rendering
remark-gfm 4.0.0       - GitHub-flavored markdown
```

### Testing
```
Vitest 4.0.15                - Test runner
@testing-library/react 16.3  - Component testing
jsdom 27.2.0                 - DOM simulation
```

---

## Application Structure

```
skillengine/
├── App.tsx                    # Root component, providers, routing
├── index.tsx                  # React DOM entry point
├── index.html                 # HTML template
├── index.css                  # Global styles (Tailwind base)
├── types.ts                   # Core TypeScript interfaces
│
├── lib/                       # Core business logic
│   ├── skills/                # Skill system
│   │   ├── index.ts           # Public exports
│   │   ├── static.ts          # 16 built-in skills
│   │   ├── registry.ts        # Unified skill access
│   │   └── dynamic/           # Dynamic skill generation
│   │       ├── index.ts       # Module exports
│   │       ├── analyzer.ts    # JD analysis
│   │       ├── builder.ts     # Skill generation
│   │       └── executor.ts    # Skill execution
│   │
│   ├── skillLibrary/          # Unified skill library
│   │   ├── index.ts           # Library functions
│   │   └── types.ts           # Library types
│   │
│   ├── roleTemplates.ts       # 20+ role templates (80+ skills)
│   ├── workflows/             # Multi-step workflows
│   │   └── index.ts           # 3 pre-built workflows
│   │
│   ├── storage/               # Data persistence
│   │   ├── index.ts           # Storage exports
│   │   ├── types.ts           # All data types
│   │   └── indexeddb.ts       # IndexedDB implementation
│   │
│   ├── gemini.ts              # Gemini API integration
│   ├── claude.ts              # Claude API integration
│   ├── supabase.ts            # Supabase client
│   ├── admin.ts               # Admin & user management
│   ├── apiKeyStorage.ts       # API key management
│   └── skillExport.ts         # Export functionality
│
├── hooks/                     # React hooks
│   ├── useAppContext.tsx      # Global app state
│   ├── useAuth.tsx            # Authentication state
│   ├── useSkillExecution.tsx  # AI execution hook
│   ├── useTheme.tsx           # Dark/light mode
│   ├── useToast.tsx           # Notifications
│   ├── useStorage.ts          # IndexedDB hook
│   └── useKeyboardShortcuts.ts
│
├── pages/                     # Route components (35+ pages)
│   ├── HomePage.tsx           # Landing page
│   ├── DashboardPage.tsx      # User dashboard
│   ├── BrowseSkillsPage.tsx   # Static skill browser
│   ├── SkillRunnerPage.tsx    # Execute static skills
│   ├── SkillLibraryPage.tsx   # Unified library browser
│   ├── RoleTemplatesPage.tsx  # Role-based skills
│   ├── AnalyzeRolePage.tsx    # JD analysis
│   ├── WorkspacePage.tsx      # Workspace view
│   ├── BuildSkillsPage.tsx    # Skill generation
│   ├── WorkflowRunnerPage.tsx # Workflow execution
│   ├── SkillExportPage.tsx    # Export skills
│   └── ... (30+ more pages)
│
├── components/                # Reusable components
│   ├── Header.tsx             # Navigation header
│   ├── Footer.tsx             # Page footer
│   ├── SkillCard.tsx          # Skill display card
│   ├── FormBuilder.tsx        # Dynamic form generation
│   ├── FileUploader.tsx       # File upload handling
│   ├── CommandPalette.tsx     # Cmd+K navigation
│   ├── ErrorBoundary.tsx      # Error handling
│   ├── Analytics.tsx          # Usage tracking
│   ├── icons.tsx              # Custom SVG icons
│   └── ui/                    # Base UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       ├── Select.tsx
│       ├── Checkbox.tsx
│       └── Progress.tsx
│
└── tests/                     # Test files
    ├── setup.ts               # Test configuration
    └── lib/                   # Unit tests
```

---

## Core Concepts

### 1. Skills

A **Skill** is a reusable AI-powered tool that:
- Takes structured user input
- Generates AI prompts (system + user)
- Produces actionable output

```
┌─────────────────────────────────────────────────────────┐
│                         SKILL                           │
├─────────────────────────────────────────────────────────┤
│  Metadata                                               │
│  ├── id, name, description                              │
│  ├── category (analysis, generation, optimization...)   │
│  ├── estimatedTimeSaved                                 │
│  └── theme (colors, icon)                               │
├─────────────────────────────────────────────────────────┤
│  Inputs (Form Definition)                               │
│  ├── id, label, type                                    │
│  ├── placeholder, helpText                              │
│  ├── options (for select)                               │
│  └── validation rules                                   │
├─────────────────────────────────────────────────────────┤
│  Prompts                                                │
│  ├── systemInstruction (AI persona & rules)             │
│  ├── userPromptTemplate (with {{placeholders}})         │
│  └── outputFormat (markdown, json, table)               │
├─────────────────────────────────────────────────────────┤
│  Config                                                 │
│  ├── recommendedModel (gemini, claude, any)             │
│  ├── useWebSearch                                       │
│  ├── maxTokens                                          │
│  └── temperature                                        │
└─────────────────────────────────────────────────────────┘
```

### 2. Skill Sources

Skills come from three sources:

| Source | Description | Storage | Count |
|--------|-------------|---------|-------|
| **Builtin (Static)** | Pre-built job seeker skills | `lib/skills/static.ts` | 16 |
| **Role Templates** | Professional role skill bundles | `lib/roleTemplates.ts` | 80+ |
| **Dynamic (User)** | AI-generated from job descriptions | IndexedDB | Variable |
| **Community** | Shared by other users | Supabase | Variable |

### 3. Workspaces

A **Workspace** is a container for:
- Original job description
- AI analysis of the JD
- Skill recommendations
- User-generated dynamic skills

```typescript
interface Workspace {
  id: string;
  name: string;
  jobDescription: string;
  jdAnalysis: JDAnalysis;      // Parsed job requirements
  recommendations: SkillRecommendation[];
  selectedSkillIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 4. Workflows

A **Workflow** chains multiple skills together:

```
Global Inputs → Skill 1 → Skill 2 → Skill 3 → Combined Output
                   ↓          ↓
              (output passes to next skill as input)
```

---

## Skill System Architecture

### Skill Type Hierarchy

```
                    ┌─────────────────────┐
                    │    LibrarySkill     │  ← Unified schema
                    │  (skillLibrary/     │
                    │   types.ts)         │
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌───────────────┐
│    Skill      │   │  DynamicSkill   │   │ CommunitySkill│
│  (types.ts)   │   │ (storage/       │   │  (Supabase)   │
│               │   │  types.ts)      │   │               │
│ - Static 16   │   │ - User created  │   │ - Shared      │
│ - In code     │   │ - In IndexedDB  │   │ - Rated       │
└───────────────┘   └─────────────────┘   └───────────────┘
```

### Skill Registry (`lib/skills/registry.ts`)

The registry provides unified access to all skill types:

```typescript
// Get skills from any source
const allSkills = await getAllSkills();  // Returns UnifiedSkill[]

// Get specific skill by ID
const skill = await getSkill('resume-customizer');  // Checks static first, then dynamic

// Type guard for skill type checking
if (isDynamicSkill(skill)) {
  // Has workspaceId, prompts object, etc.
}
```

### Static Skills (`lib/skills/static.ts`)

The 16 built-in job seeker skills:

| Category | Skills |
|----------|--------|
| **Assessment** | Job Readiness Score, Skills Gap Analyzer |
| **Optimization** | LinkedIn Optimizer, ATS Checker, Resume Customizer |
| **Outreach** | Cover Letter Generator, Networking Scripts |
| **Research** | Company Research, Day in the Life, AI Automation Analyzer |
| **Interview** | Interview Prep, Thank You Notes |
| **Negotiation** | Offer Evaluation, Salary Negotiation |
| **Transition** | Onboarding Accelerator |
| **Specialty** | Resume Parser |

Each skill defines:
```typescript
{
  id: 'resume-customizer',
  name: 'Resume Customizer Pro',
  description: 'ATS-optimized resume rewrite...',
  longDescription: '...',
  whatYouGet: ['Improved ATS Score', ...],
  theme: { primary: 'text-sky-400', ... },
  icon: ResumeIcon,
  inputs: [...sharedJobSeekerInputs],
  generatePrompt: (inputs) => ({
    systemInstruction: `You are an expert resume writer...`,
    userPrompt: createUserPrompt("Resume Customizer", inputs, {...})
  }),
}
```

### Role Templates (`lib/roleTemplates.ts`)

20+ professional roles, each with 3-4 production-quality skills:

```typescript
interface RoleTemplate {
  id: string;                    // 'software-engineer'
  name: string;                  // 'Software Engineer'
  description: string;
  icon: string;                  // Lucide icon name
  color: string;                 // Tailwind color
  staticSkillIds: string[];      // Which builtin skills apply
  dynamicSkills: DynamicSkill[]; // Role-specific skills
}
```

**Available Roles:**
- Software Engineer, Business Analyst, Project Manager
- Product Manager, UX Designer, Data Analyst
- Marketing Manager, Sales Representative, HR Professional
- Financial Analyst, Operations Manager, Content Strategist
- Customer Success Manager, Executive Assistant, Legal Professional
- Healthcare Professional, Educator, Research Scientist
- Supply Chain Manager, Quality Assurance, Creative Director
- SEO Specialist

### Skill Library (`lib/skillLibrary/`)

Unified browsing interface with multi-dimensional filtering:

```typescript
// Categories
type SkillCategory = 'analysis' | 'generation' | 'automation' |
                     'optimization' | 'communication' | 'research';

// Use Cases
type SkillUseCase = 'job-search' | 'interview-prep' | 'daily-work' |
                    'onboarding' | 'career-growth' | 'networking';

// Skill Levels
type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

// Sources
type SkillSource = 'builtin' | 'role-template' | 'community';
```

**Library Functions:**
```typescript
getAllLibrarySkills()           // Get all skills from all sources
getLibrarySkill(id)             // Get single skill
getSkillsByRole(roleId)         // Filter by role
filterSkills(skills, filters)   // Multi-dimensional filter
sortSkills(skills, sortBy)      // Sort by popular, rating, name, newest
```

### Dynamic Skill Generation (`lib/skills/dynamic/`)

Three-phase process for creating custom skills:

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: ANALYZE                                               │
│  analyzer.ts                                                    │
├─────────────────────────────────────────────────────────────────┤
│  Input: Job Description (text)                                  │
│                                                                 │
│  Output: JDAnalysis                                             │
│  ├── role: { title, department, level, type }                   │
│  ├── responsibilities: [ { task, frequency, automationPotential } ]│
│  ├── toolsAndPlatforms: [ { name, category, proficiency } ]     │
│  ├── workflows: [ { name, steps, painPoints } ]                 │
│  ├── stakeholders: [ { type, interactionType } ]                │
│  ├── skills: [ { name, category, importance } ]                 │
│  └── automationOpportunities: [ { area, proposedSkill, impact } ]│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: RECOMMEND                                             │
│  analyzer.ts                                                    │
├─────────────────────────────────────────────────────────────────┤
│  Input: JDAnalysis                                              │
│                                                                 │
│  Output: SkillRecommendation[]                                  │
│  ├── id, name, description                                      │
│  ├── category (automation, analysis, generation, etc.)          │
│  ├── automationPotential (high, medium, low)                    │
│  ├── complexity (simple, moderate, complex)                     │
│  ├── estimatedTimeSaved                                         │
│  └── valueProposition                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 3: BUILD                                                 │
│  builder.ts                                                     │
├─────────────────────────────────────────────────────────────────┤
│  Input: SkillRecommendation + JDAnalysis + original JD          │
│                                                                 │
│  Process:                                                       │
│  1. Send to AI with SKILL_BUILDER_SYSTEM_PROMPT                 │
│  2. AI generates full skill definition as JSON                  │
│  3. Parse and validate response                                 │
│  4. Assign random theme from THEME_PALETTE                      │
│  5. Save to IndexedDB                                           │
│                                                                 │
│  Output: DynamicSkill (full skill definition)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Skill Execution (`lib/skills/dynamic/executor.ts`)

Template interpolation and AI execution:

```typescript
// Template interpolation
interpolateTemplate(
  "Create a report for {{projectName}} by {{deadline}}",
  { projectName: "Q4 Launch", deadline: "Friday" }
)
// → "Create a report for Q4 Launch by Friday"

// Streaming execution
for await (const chunk of executeDynamicSkill({
  skill: mySkill,
  formInputs: { projectName: "Q4 Launch", ... },
  apiKey: "...",
  provider: "gemini"
})) {
  output += chunk;
  updateUI(output);
}
```

---

## Data Layer

### IndexedDB Schema (`lib/storage/indexeddb.ts`)

```
Database: 'skillengine'
Version: 2

┌─────────────────────┬──────────────┬─────────────────────────────────┐
│ Object Store        │ Key Path     │ Indexes                         │
├─────────────────────┼──────────────┼─────────────────────────────────┤
│ workspaces          │ id           │ createdAt, roleType, updatedAt  │
│ dynamicSkills       │ id           │ workspaceId, category, createdAt│
│ skillExecutions     │ id           │ skillId, workspaceId, createdAt │
│ userPreferences     │ id           │ (none)                          │
│ savedOutputs        │ id           │ skillId, createdAt, isFavorite  │
│ favoriteSkills      │ id           │ skillId, createdAt              │
└─────────────────────┴──────────────┴─────────────────────────────────┘
```

### Data Types (`lib/storage/types.ts`)

**Core Entities:**

```typescript
// Workspace - Container for job analysis
interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  jobDescription: string;
  jdAnalysis: JDAnalysis;
  recommendations: SkillRecommendation[];
  selectedSkillIds: string[];
  roleType: string;
  company?: string;
  industry?: string;
}

// DynamicSkill - User-generated skill
interface DynamicSkill {
  id: string;
  workspaceId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  longDescription: string;
  category: 'automation' | 'analysis' | 'generation' | 'optimization' | 'communication';
  estimatedTimeSaved: string;
  theme: { primary, secondary, gradient, iconName };
  inputs: DynamicFormInput[];
  prompts: {
    systemInstruction: string;
    userPromptTemplate: string;
    outputFormat: 'markdown' | 'json' | 'table';
  };
  config: {
    recommendedModel: 'gemini' | 'claude' | 'any';
    useWebSearch: boolean;
    maxTokens: number;
    temperature: number;
  };
  executionCount: number;
  lastExecutedAt?: string;
}

// SkillExecution - History record
interface SkillExecution {
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

// SavedOutput - Bookmarked AI outputs
interface SavedOutput {
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
```

### Database Singleton Pattern

```typescript
// lib/storage/indexeddb.ts
class SkillEngineDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        // Create object stores and indexes
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
    });
  }

  // CRUD operations with automatic init
  async createWorkspace(workspace: Workspace): Promise<void> {
    await this.init();
    return this.put(STORES.WORKSPACES, workspace);
  }
  // ... more methods
}

export const db = new SkillEngineDB();  // Singleton export
```

### localStorage Usage

```typescript
// API Keys (encrypted in apiKeyStorage.ts)
localStorage.getItem('skillengine_gemini_key')
localStorage.getItem('skillengine_claude_key')

// User Profile
localStorage.getItem('skillengine_user_profile')

// Theme preference
localStorage.getItem('skillengine_theme')

// App User (for admin features)
localStorage.getItem('skillengine_app_user')
```

---

## State Management

### Provider Hierarchy

```
<AuthProvider>              ← Supabase auth state
  <AppProvider>             ← Global app state (resume, JD, API)
    <Router>                ← HashRouter for navigation
      <ThemeProvider>       ← Dark/light mode
        <ToastProvider>     ← Notification system
          <App Layout>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  </AppProvider>
</AuthProvider>
```

### Context: AppContext (`hooks/useAppContext.tsx`)

Global application state shared across pages:

```typescript
interface AppContextState {
  // AI Provider Selection
  selectedApi: 'gemini' | 'claude' | 'chatgpt';
  setSelectedApi: (api) => void;

  // Document State (session-scoped)
  resumeText: string;
  setResumeText: (text) => void;
  resumeFilename: string;
  setResumeFilename: (name) => void;

  jobDescriptionText: string;
  setJobDescriptionText: (text) => void;
  jobDescriptionFilename: string;
  setJobDescriptionFilename: (name) => void;

  additionalInfoText: string;
  setAdditionalInfoText: (text) => void;

  // User Profile (persisted to localStorage)
  userProfile: UserProfile;
  updateUserProfile: (updates) => void;
  refreshProfileFromStorage: () => void;

  // Computed
  getBackgroundText: () => string;  // Combined resume + profile
}
```

**UserProfile Schema:**
```typescript
interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl: string;
  portfolioUrl: string;
  professionalTitle: string;
  yearsExperience: string;
  targetRoles: string;
  targetIndustries: string;
  resumeText: string;           // Persisted resume
  resumeFilename: string;
  currentCompany: string;
  currentTitle: string;
  keyAchievements: string;
  highestDegree: string;
  university: string;
  graduationYear: string;
  certifications: string;
  technicalSkills: string;
  softSkills: string;
  languages: string;
  careerGoals: string;
  salaryExpectations: string;
  workPreference: string;
  lastUpdated: string;
}
```

### Context: AuthContext (`hooks/useAuth.tsx`)

Supabase authentication state:

```typescript
interface AuthContextType {
  user: User | null;          // Supabase user
  session: Session | null;    // Supabase session
  appUser: AppUser | null;    // Local user with role
  loading: boolean;
  isConfigured: boolean;      // Is Supabase configured?
  isAdmin: boolean;           // Admin privileges
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => void;
}
```

### Context: ThemeContext (`hooks/useTheme.tsx`)

Dark/light mode with system preference:

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme) => void;
  effectiveTheme: 'light' | 'dark';  // Resolved value
}
```

### Context: ToastContext (`hooks/useToast.tsx`)

Global notification system:

```typescript
interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}
```

### Hook: useSkillExecution (`hooks/useSkillExecution.tsx`)

Unified AI execution with streaming:

```typescript
interface UseSkillExecutionReturn {
  execute: (promptData, config, metadata, inputs?) => Promise<ExecutionResult>;
  cancel: () => void;
  output: string;           // Streaming output
  citations: Citation[];    // Web search citations
  isLoading: boolean;
  progress: number;         // 0-100
  error: string | null;
  reset: () => void;
}

// Usage
const { execute, output, isLoading } = useSkillExecution({
  onChunk: (chunk) => console.log(chunk),
  onComplete: (result) => saveResult(result),
  trackUsage: true,
  saveExecution: true,
});

await execute(
  { systemInstruction: "...", userPrompt: "..." },
  { apiProvider: 'gemini', apiKey: '...' },
  { id: 'resume-customizer', name: 'Resume Customizer', source: 'static' }
);
```

---

## AI Provider Integration

### Gemini Integration (`lib/gemini.ts`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function runSkillStream(
  apiKey: string,
  promptData: { systemInstruction: string; userPrompt: string },
  useGoogleSearch: boolean = false
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: promptData.systemInstruction,
  });

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: promptData.userPrompt }] }],
  });

  return result;  // AsyncIterable<Chunk>
}
```

### Claude Integration (`lib/claude.ts`)

Direct REST API with streaming:

```typescript
const CLAUDE_MODELS = {
  haiku: 'claude-3-5-haiku-latest',   // Fastest
  sonnet: 'claude-3-5-sonnet-latest', // Balanced
  opus: 'claude-3-opus-latest',       // Most capable
};

export async function runSkillStream(
  apiKey: string,
  promptData: { systemInstruction: string; userPrompt: string },
  modelType: 'haiku' | 'sonnet' | 'opus' = 'haiku'
): Promise<Response> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',  // Required for browser
    },
    body: JSON.stringify({
      model: CLAUDE_MODELS[modelType],
      max_tokens: 4096,
      system: promptData.systemInstruction,
      messages: [{ role: 'user', content: promptData.userPrompt }],
      stream: true,
    }),
  });

  return response;  // SSE stream
}
```

### API Key Storage (`lib/apiKeyStorage.ts`)

Secure client-side key storage:

```typescript
const STORAGE_KEYS = {
  gemini: 'skillengine_gemini_key',
  claude: 'skillengine_claude_key',
};

export function saveApiKey(provider: 'gemini' | 'claude', key: string): void {
  localStorage.setItem(STORAGE_KEYS[provider], key);
}

export function getApiKey(provider: 'gemini' | 'claude'): string | null {
  return localStorage.getItem(STORAGE_KEYS[provider]);
}

export function clearApiKey(provider: 'gemini' | 'claude'): void {
  localStorage.removeItem(STORAGE_KEYS[provider]);
}
```

---

## Routing & Navigation

### HashRouter Configuration

```typescript
// App.tsx
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Why HashRouter?
// - Static hosting (Netlify) doesn't handle server-side routing
// - URLs like /#/skills work without server config
// - Avoids 404 on page refresh
```

### Route Categories

```typescript
// Core Pages
<Route path="/" element={<HomePage />} />
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/welcome" element={<WelcomePage />} />
<Route path="/profile" element={<UserProfilePage />} />

// Static AI Skills (16 built-in)
<Route path="/skills" element={<BrowseSkillsPage />} />
<Route path="/skill/:skillId" element={<SkillRunnerPage />} />

// Skill Library (unified)
<Route path="/library" element={<SkillLibraryPage />} />
<Route path="/library-skill-runner" element={<LibrarySkillRunnerPage />} />
<Route path="/role-templates" element={<RoleTemplatesPage />} />
<Route path="/my-skills" element={<MySkillsPage />} />

// Dynamic Skill Generation
<Route path="/analyze" element={<AnalyzeRolePage />} />
<Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
<Route path="/workspace/:workspaceId/build" element={<BuildSkillsPage />} />
<Route path="/workspace/:workspaceId/skill/:skillId" element={<DynamicSkillRunnerPage />} />

// Community Features
<Route path="/community" element={<CommunitySkillsPage />} />
<Route path="/community/import" element={<ImportSkillPage />} />
<Route path="/community-skill-runner" element={<CommunitySkillRunnerPage />} />

// Workflows
<Route path="/workflow/:workflowId" element={<WorkflowRunnerPage />} />

// Batch & Export
<Route path="/batch" element={<BatchProcessingPage />} />
<Route path="/export-skills" element={<SkillExportPage />} />

// Job Search Tools (14 pages)
<Route path="/job-tracker" element={<JobTrackerPage />} />
<Route path="/interview-bank" element={<InterviewBankPage />} />
// ... more

// Utility Pages
<Route path="/api-keys" element={<ApiKeyInstructionsPage />} />
<Route path="/settings" element={<SettingsPage />} />
<Route path="/admin" element={<AdminPage />} />
```

### Command Palette (`components/CommandPalette.tsx`)

Quick navigation with Cmd+K / Ctrl+K:

```
┌─────────────────────────────────────────┐
│ 🔍 Search pages, skills, or actions...  │
├─────────────────────────────────────────┤
│ > Resume Customizer                     │
│ > Job Tracker                           │
│ > Analyze Job Description               │
│ > Export Skills                         │
│ > Settings                              │
└─────────────────────────────────────────┘
```

---

## Component Architecture

### Layout Components

```
┌─────────────────────────────────────────────────────────────────┐
│  <Header />                                                     │
│  ├── Logo + Navigation Links                                    │
│  ├── Mobile hamburger menu                                      │
│  └── User dropdown (sign in/out, settings)                      │
├─────────────────────────────────────────────────────────────────┤
│  <main className="flex-1">                                      │
│    <Routes>                                                     │
│      {/* Page content */}                                       │
│    </Routes>                                                    │
│  </main>                                                        │
├─────────────────────────────────────────────────────────────────┤
│  <Footer />                                                     │
│  └── Links, copyright                                           │
├─────────────────────────────────────────────────────────────────┤
│  <CommandPalette />  ← Overlay, activated by Cmd+K              │
└─────────────────────────────────────────────────────────────────┘
```

### SkillCard Component

Reusable skill display:

```typescript
interface SkillCardProps {
  skill: Skill | DynamicSkill | LibrarySkill;
  onClick?: () => void;
  showBadge?: boolean;          // "Static", "Dynamic", etc.
  showTimeSaved?: boolean;
  showCopyPrompt?: boolean;     // Copy system prompt button
  compact?: boolean;
}
```

### FormBuilder Component

Dynamic form generation from skill inputs:

```typescript
interface FormBuilderProps {
  inputs: FormInput[] | DynamicFormInput[];
  values: Record<string, unknown>;
  onChange: (id: string, value: unknown) => void;
  prefillData?: {
    resume?: string;
    jobDescription?: string;
    additionalContext?: string;
  };
}
```

### UI Components (`components/ui/`)

Base components with consistent styling:

| Component | Purpose |
|-----------|---------|
| `Button` | Primary, secondary, outline, ghost variants |
| `Input` | Text input with label and error state |
| `Textarea` | Multi-line input with auto-resize |
| `Select` | Dropdown selection |
| `Checkbox` | Boolean toggle |
| `Progress` | Progress bar (for AI execution) |

---

## Workflow System

### Workflow Definition (`lib/workflows/index.ts`)

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;              // Lucide icon
  color: string;             // Tailwind color
  estimatedTime: string;     // "8-12 minutes"
  outputs: string[];         // What user receives
  globalInputs: WorkflowGlobalInput[];
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  skillId: string;           // References SKILLS
  name: string;
  description: string;
  inputMappings: {
    [skillInputId: string]: WorkflowInputSource;
  };
  outputKey: string;         // Store output for later steps
  optional?: boolean;
  reviewRequired?: boolean;
}

type WorkflowInputSource =
  | { type: 'global'; inputId: string }              // From global inputs
  | { type: 'previous'; stepId: string; outputKey: string }  // From earlier step
  | { type: 'static'; value: string }                // Hardcoded
  | { type: 'computed'; template: string };          // Template interpolation
```

### Pre-built Workflows

```
┌─────────────────────────────────────────────────────────────────┐
│  JOB APPLICATION PACKAGE                                        │
│  id: 'job-application'                                          │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Job Readiness Score      → readinessAnalysis           │
│  Step 2: Resume Customizer        → customizedResume            │
│  Step 3: ATS Optimization         → atsOptimizedResume          │
│  Step 4: Cover Letter Generator   → coverLetter                 │
│  Step 5: Company Research         → companyResearch             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  INTERVIEW PREPARATION                                          │
│  id: 'interview-prep'                                           │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Company Research         → companyResearch             │
│  Step 2: Interview Prep           → interviewQuestions          │
│  Step 3: Salary Research          → salaryResearch              │
│  Step 4: Questions to Ask         → questionsToAsk              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  POST-INTERVIEW FOLLOW-UP                                       │
│  id: 'post-interview'                                           │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Thank You Notes          → thankYouNotes               │
│  Step 2: Self-Assessment          → selfAssessment              │
│  Step 3: Follow-Up Strategy       → followUpStrategy            │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Data Flow

```
                    ┌──────────────────┐
                    │  Global Inputs   │
                    │  (collected once)│
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ Step 1  │────────▶│ Step 2  │────────▶│ Step 3  │
   │         │ output  │         │ output  │         │
   └─────────┘         └─────────┘         └─────────┘
        │                    │                    │
        ▼                    ▼                    ▼
   stepOutputs['step1']  stepOutputs['step2']  stepOutputs['step3']
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Final Package   │
                    │  (all outputs)   │
                    └──────────────────┘
```

---

## Authentication & Authorization

### Supabase Integration (`lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => supabase !== null;
```

### User Roles (`lib/storage/types.ts`)

```typescript
type UserRole = 'free' | 'pro' | 'team' | 'custom';

interface RoleFeatures {
  canAccessAllSkills: boolean;
  canCreateCustomSkills: boolean;
  canAccessCommunitySkills: boolean;
  canExportPrompts: boolean;
  canUseBatchProcessing: boolean;
  canUseWorkflows: boolean;
  canAccessAdminPanel: boolean;
  canViewAnalytics: boolean;
  canInviteTeamMembers: boolean;
  canDownloadOutputs: boolean;
  canExportToCSV: boolean;
}

interface RoleLimits {
  skillRunsPerDay: number;     // -1 = unlimited
  skillRunsPerMonth: number;
  savedOutputsLimit: number;
  workspacesLimit: number;
  customSkillsLimit: number;
  batchRowsLimit: number;
  teamMembersLimit: number;
}
```

### Role Configurations

| Role | Price | Key Limits |
|------|-------|------------|
| **Free** | $0 | 10 runs/day, 100/month, 2 workspaces |
| **Pro** | $19 | Unlimited runs, 50 custom skills, batch processing |
| **Team** | $49 | Everything + 10 team members, 500 batch rows |
| **Custom** | Variable | Admin-defined |

### Admin Features (`lib/admin.ts`)

```typescript
// Admin email check
const ADMIN_EMAILS = ['admin@example.com'];
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// User sign-in handling
export function handleUserSignIn(
  userId: string,
  email: string,
  displayName?: string,
  avatarUrl?: string
): AppUser;

// Usage tracking
export function trackSkillUsage(
  userId: string,
  userEmail: string,
  skillId: string,
  skillName: string,
  skillSource: 'static' | 'dynamic' | 'community'
): void;
```

---

## Export System

### Skill Export (`lib/skillExport.ts` + `pages/SkillExportPage.tsx`)

Export skills to CSV or TXT format:

```typescript
interface ExportableSkill {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  source: 'builtin' | 'role-template';
  roleId?: string;
  roleName?: string;
}

// CSV Format
"Name","Description","Source","Role","System Prompt"
"Code Review Assistant","Analyze code for bugs...","role-template","Software Engineer","You are a Principal..."

// TXT Format
================================================================================
SKILL: Code Review Assistant
================================================================================
Source: role-template
Role: Software Engineer

DESCRIPTION:
Analyze code for bugs, security issues, and best practices...

SYSTEM PROMPT:
You are a Principal Software Engineer with 18+ years of experience...
================================================================================
```

### Export Page Features

- **Two sections:** Core Skills (16 builtin) + Skill Library (role-template)
- **Role filtering:** Filter Skill Library by role
- **Section selection:** Select/deselect entire sections
- **Format choice:** CSV or TXT
- **Export preview:** Shows count breakdown before download

---

## Data Flow Diagrams

### Static Skill Execution

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User fills  │────▶│  Generate    │────▶│  Execute     │
│  form inputs │     │  prompts     │     │  with AI     │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                     skill.generatePrompt()   useSkillExecution.execute()
                     returns {                       │
                       systemInstruction,            ▼
                       userPrompt            ┌──────────────┐
                     }                       │  Streaming   │
                                             │  response    │
                                             └──────────────┘
                                                    │
                                                    ▼
                                             ┌──────────────┐
                                             │  Save to     │
                                             │  IndexedDB   │
                                             └──────────────┘
```

### Dynamic Skill Creation

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Paste JD    │────▶│  Analyze     │────▶│  Get skill   │
│  (text)      │     │  with AI     │     │  recommendations│
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  User selects│
                                          │  skills      │
                                          └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Skills saved│◀────│  AI builds   │◀────│  Build       │
│  to IndexedDB│     │  full defs   │     │  selected    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Workflow Execution

```
┌──────────────┐
│  Collect     │
│  global      │
│  inputs      │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Step 1      │────▶│  Step 2      │────▶│  Step N      │
│  execute     │     │  execute     │     │  execute     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
  output stored        uses previous        uses previous
  in stepOutputs       step's output        step's output
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Display all │
                     │  outputs     │
                     └──────────────┘
```

---

## File Structure Reference

### Key Files by Purpose

| Purpose | File(s) |
|---------|---------|
| **App Entry** | `App.tsx`, `index.tsx` |
| **Core Types** | `types.ts`, `lib/storage/types.ts` |
| **Static Skills** | `lib/skills/static.ts` |
| **Role Templates** | `lib/roleTemplates.ts` |
| **Skill Library** | `lib/skillLibrary/index.ts`, `lib/skillLibrary/types.ts` |
| **Dynamic Skills** | `lib/skills/dynamic/*.ts` |
| **Skill Registry** | `lib/skills/registry.ts` |
| **Workflows** | `lib/workflows/index.ts` |
| **Database** | `lib/storage/indexeddb.ts` |
| **AI: Gemini** | `lib/gemini.ts` |
| **AI: Claude** | `lib/claude.ts` |
| **Auth** | `lib/supabase.ts`, `lib/admin.ts`, `hooks/useAuth.tsx` |
| **State** | `hooks/useAppContext.tsx`, `hooks/useSkillExecution.tsx` |
| **Export** | `lib/skillExport.ts`, `pages/SkillExportPage.tsx` |

### Page Count by Category

| Category | Pages | Examples |
|----------|-------|----------|
| Core | 4 | Home, Dashboard, Welcome, Profile |
| Skills | 6 | Browse, Run, Library, My Skills, Role Templates, Library Runner |
| Dynamic | 4 | Analyze, Workspace, Build, Dynamic Runner |
| Community | 3 | Browse, Import, Run |
| Workflows | 1 | Workflow Runner |
| Batch/Export | 2 | Batch Processing, Export Skills |
| Job Tools | 14 | Tracker, Interview Bank, Salary Calc, etc. |
| Utility | 4 | API Keys, Settings, Pricing, Admin |
| **Total** | **~38** | |

---

## Extension Points

### Adding a New Static Skill

1. **Create icon** in `components/icons.tsx`:
```typescript
export function MyNewSkillIcon(props: SVGProps) {
  return <svg {...props}>...</svg>;
}
```

2. **Add to SKILLS** in `lib/skills/static.ts`:
```typescript
'my-new-skill': {
  id: 'my-new-skill',
  name: 'My New Skill',
  description: '...',
  longDescription: '...',
  whatYouGet: ['...'],
  theme: { primary: 'text-blue-400', ... },
  icon: MyNewSkillIcon,
  inputs: [...],
  generatePrompt: (inputs) => ({
    systemInstruction: `...`,
    userPrompt: createUserPrompt("My New Skill", inputs, {...})
  }),
}
```

3. **Skill auto-appears** at `/skills` and `/skill/my-new-skill`

### Adding a New Role Template

Add to `ROLE_TEMPLATES` array in `lib/roleTemplates.ts`:

```typescript
{
  id: 'new-role',
  name: 'New Role',
  description: '...',
  icon: 'Briefcase',  // Lucide icon name
  color: 'text-blue-500',
  staticSkillIds: ['job-readiness-score', ...],
  dynamicSkills: [
    {
      name: 'Role-Specific Skill',
      description: '...',
      longDescription: '...',
      category: 'generation',
      estimatedTimeSaved: '2-3 hours',
      theme: { ... },
      inputs: [ ... ],
      prompts: {
        systemInstruction: `...`,
        userPromptTemplate: `...`,
        outputFormat: 'markdown',
      },
      config: {
        recommendedModel: 'claude',
        useWebSearch: false,
        maxTokens: 8192,
        temperature: 0.3,
      },
    },
  ],
}
```

### Adding a New Workflow

Add to `lib/workflows/index.ts`:

```typescript
export const MY_NEW_WORKFLOW: Workflow = {
  id: 'my-workflow',
  name: 'My Workflow',
  description: '...',
  longDescription: '...',
  icon: 'Workflow',
  color: 'blue',
  estimatedTime: '10 minutes',
  outputs: ['...'],
  globalInputs: [ ... ],
  steps: [
    {
      id: 'step-1',
      skillId: 'some-skill-id',
      name: 'Step 1',
      description: '...',
      inputMappings: {
        inputField: { type: 'global', inputId: 'globalInputId' },
      },
      outputKey: 'step1Output',
    },
    // More steps...
  ],
};

// Add to registry
export const WORKFLOWS = {
  // existing...
  'my-workflow': MY_NEW_WORKFLOW,
};
```

### Adding a New AI Provider

1. **Create API module** `lib/newprovider.ts`:
```typescript
export async function runSkillStream(
  apiKey: string,
  promptData: { systemInstruction: string; userPrompt: string }
): Promise<AsyncIterable<string>> {
  // Implementation
}
```

2. **Update useSkillExecution** to support new provider

3. **Add API key storage** in `lib/apiKeyStorage.ts`

4. **Update type definitions** in `types.ts`

---

## Performance Considerations

### Bundle Size
- Vite tree-shaking removes unused code
- Dynamic imports for AI SDKs
- Component-level code splitting possible

### IndexedDB Performance
- Indexes on frequently queried fields
- Singleton pattern prevents multiple connections
- Async operations don't block UI

### AI Streaming
- Responses stream chunk-by-chunk
- UI updates incrementally
- Progress indicator during generation

### Caching
- Role templates computed once, cached
- Skill library singleton pattern
- User profile cached in state

---

## Security Considerations

### API Keys
- Stored in localStorage (user's device only)
- Never sent to backend
- User provides their own keys

### Data Privacy
- All data stored client-side (IndexedDB + localStorage)
- Supabase optional for community features
- No analytics without user content

### Content Security
- No server-side code execution
- AI responses rendered as markdown (sanitized)
- CORS handled by AI providers

---

## Testing

### Test Setup (`tests/setup.ts`)
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IndexedDB, localStorage, fetch, etc.
```

### Running Tests
```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
npm run test:ui     # Visual test UI
npm run test:coverage  # Coverage report
```

### Test Coverage
- Unit tests for lib functions
- Component tests with Testing Library
- Integration tests for workflows

---

## Deployment

### Build Process
```bash
npm run build     # Creates dist/ folder
```

### Static Hosting (Netlify)
- HashRouter eliminates server routing needs
- Single `index.html` serves all routes
- Assets served from `dist/`

### Environment Variables
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Conclusion

SkillEngine is a comprehensive, client-side application with:

- **Modular skill system** supporting static, dynamic, and community skills
- **Flexible AI integration** with Gemini and Claude
- **Robust local storage** using IndexedDB
- **Clear separation of concerns** between data, logic, and presentation
- **Extensible architecture** for adding new skills, roles, and workflows

The architecture prioritizes:
- **User privacy** (all data local, bring-your-own API keys)
- **Developer experience** (TypeScript, clear patterns)
- **Scalability** (modular design, async operations)
- **Maintainability** (well-documented, consistent structure)
