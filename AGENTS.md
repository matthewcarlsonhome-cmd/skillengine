# AGENTS.md - AI Assistant Instructions

This file provides context for AI coding assistants (Codex, Claude Code, Cursor, etc.) working on this repository.

## Project Overview

**SkillEngine** is a React/TypeScript web application that provides 270+ AI-powered professional skills. Users configure their API keys once, then run any skill instantly.

## Key Architecture

```
skillengine/
├── pages/           # React page components
├── components/      # Reusable UI components
├── lib/             # Core business logic
│   ├── billing.ts   # Model pricing & cost calculations
│   ├── platformKeys.ts # Provider/model configurations
│   └── apiKeyStorage.ts # Browser localStorage for API keys
├── hooks/           # React hooks
└── docs/            # Documentation
```

## Critical Files for API Key & Billing

### 1. AI Configuration Flow (Unified Setup)
- **`pages/AccountPage.tsx`** - Central AI configuration (AIConfigurationSection component)
  - **Step 1**: Key Mode toggle (Platform Key vs Personal/BYOK)
  - **Step 2**: Provider selection (Gemini/Claude/ChatGPT)
  - **Step 3**: Model selection with cost per skill shown
  - **Step 4**: API Key input (only for Personal mode)
  - Keys stored in browser localStorage
  - Shows model costs table below configuration

### 2. Model Pricing (`lib/billing.ts`)
```typescript
// Prices per 1 MILLION tokens in DOLLARS
MODEL_PRICING = {
  'gemini-2.0-flash': { input: 0.075, output: 0.30 },  // ~$0.0006/skill
  'haiku': { input: 0.25, output: 1.25 },              // ~$0.002/skill
  'sonnet': { input: 3.00, output: 15.00 },            // ~$0.03/skill
  'opus': { input: 15.00, output: 75.00 },             // ~$0.14/skill
  'gpt-4o-mini': { input: 0.15, output: 0.60 },        // ~$0.001/skill
  'gpt-4o': { input: 2.50, output: 10.00 },            // ~$0.02/skill
}
```

### 3. Provider Configuration (`lib/platformKeys.ts`)
- Model definitions for each provider
- Cost per 1K tokens
- Speed/quality tiers

### 4. User-Facing Components
- **`pages/HomePage.tsx`** - Setup flow banner for unconfigured users
- **`components/ProviderConfig.tsx`** - Status indicator on skill pages
- **`pages/SkillRunnerPage.tsx`** - Individual skill execution
- **`pages/LibrarySkillRunnerPage.tsx`** - Library skill execution

## Design Decisions

### Centralized API Key Setup
- All API keys configured once at `/account`
- Skill pages show ONLY status (no config dropdowns)
- `ProviderConfigStatus` component shows ready/setup-needed state

### Billing Model
- **Personal Key (BYOK)**: Users bring their own API keys, pay provider directly
- **Platform Key**: Server-side proxy via Supabase Edge Functions
- Credits system with tiers (free/starter/pro/power/team)

### Platform Keys Setup (Admin)
See `/docs/PLATFORM_KEYS_SETUP.md` for complete instructions:
1. Create database tables for credits/usage
2. Store API keys as Supabase secrets
3. Deploy `ai-proxy` Edge Function
4. Deploy `platform-status` Edge Function
5. Enable via `VITE_PLATFORM_KEYS_ENABLED=true`

### Cost Calculation
```typescript
// Cost in cents = (tokens / 1M) * price_per_M * 100
const inputCost = (inputTokens / 1_000_000) * pricing.input * 100;
```

## Common Tasks

### Adding a New Model
1. Add to `MODEL_PRICING` in `lib/billing.ts`
2. Add to provider array in `lib/platformKeys.ts`
3. Update tier access in `TIER_CONFIGS`

### Modifying Skill Pages
- Use `ProviderConfigStatus` component (no full config)
- Get state from `useProviderConfig()` hook
- Link to `/account` for setup

## Environment

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context + IndexedDB
- **Build**: Vite
- **Backend**: Supabase (auth, storage)

## No Sandbox Required

This is a frontend-only React app. File operations are:
- Read-only for source files
- Write to browser localStorage/IndexedDB
- No server-side file operations

All AI model API calls go directly to provider APIs (Google, Anthropic, OpenAI) from the browser using user-provided API keys.
