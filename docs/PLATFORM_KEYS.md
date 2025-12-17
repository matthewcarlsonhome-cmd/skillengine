# Platform API Keys & Billing Configuration

This document explains how to configure platform-managed API keys for SkillEngine, enabling users to run skills without providing their own keys.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KEY MODES                                           │
│                                                                             │
│  ┌─────────────────────────┐      ┌─────────────────────────┐              │
│  │   PLATFORM KEY MODE     │      │   PERSONAL KEY MODE     │              │
│  │                         │      │                         │              │
│  │  User → SkillEngine →   │      │  User → SkillEngine →   │              │
│  │    API Proxy →          │      │    Direct API Call →    │              │
│  │      AI Provider        │      │      AI Provider        │              │
│  │                         │      │                         │              │
│  │  Billing: Platform      │      │  Billing: User          │              │
│  │  Credits: Platform pool │      │  Credits: User's key    │              │
│  └─────────────────────────┘      └─────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Security Model

### Where to Store Platform API Keys

**IMPORTANT**: Platform API keys must NEVER be exposed in client-side JavaScript.

#### Option 1: Supabase Edge Functions (Recommended)

Store keys in Supabase secrets and access via Edge Functions:

```bash
# Set secrets via Supabase CLI
supabase secrets set GEMINI_API_KEY=your-key-here
supabase secrets set ANTHROPIC_API_KEY=your-key-here
supabase secrets set OPENAI_API_KEY=your-key-here
```

Create an Edge Function to proxy AI requests:

```typescript
// supabase/functions/ai-proxy/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { provider, model, messages } = await req.json()

  // Get key from environment (never exposed to client)
  const apiKey = Deno.env.get(`${provider.toUpperCase()}_API_KEY`)

  // Verify user authentication
  const authHeader = req.headers.get('Authorization')
  // ... validate JWT token

  // Check user credits/permissions
  // ... check billing

  // Make AI call
  // ... forward to provider

  // Record usage
  // ... log to database

  return new Response(JSON.stringify(result))
})
```

#### Option 2: Environment Variables (Server Deployment)

For server-side Next.js or similar:

```bash
# .env.local (never commit to git!)
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
```

#### Option 3: Secrets Manager (Production)

For production deployments, use a secrets manager:

- **AWS Secrets Manager**
- **Google Cloud Secret Manager**
- **HashiCorp Vault**
- **Doppler**

### Key Storage Locations Summary

| Environment | Storage Location | Access Method |
|-------------|------------------|---------------|
| Development | `.env.local` | `process.env` |
| Supabase | Secrets | `Deno.env.get()` |
| Vercel | Environment Variables | `process.env` |
| AWS | Secrets Manager | AWS SDK |
| GCP | Secret Manager | GCP SDK |

## Enabling Platform Keys

### Step 1: Configure Environment

Add your API keys to your secure storage:

```env
# Required keys (add the ones you want to enable)
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### Step 2: Enable in Admin Panel

1. Navigate to `/admin`
2. Go to the "Platform Keys" tab
3. Enable each provider you've configured
4. Set initial credit balance (in cents)

Or programmatically:

```typescript
import { adminEnablePlatformKey, adminAddCredits } from '../lib/platformKeys';

// Enable Gemini with $50 initial balance
adminEnablePlatformKey('gemini', 5000);

// Add more credits later
adminAddCredits('gemini', 2500); // Add $25
```

### Step 3: Create API Proxy (Required for Security)

Create a server-side endpoint that:

1. Validates user authentication
2. Checks user permissions/credits
3. Makes the AI API call with platform key
4. Records usage for billing
5. Returns response to client

Example Supabase Edge Function:

```typescript
// supabase/functions/run-skill/index.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  // 1. Verify JWT
  const authHeader = req.headers.get('Authorization')
  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '')
  )
  if (error || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Check credits
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (profile.credits <= 0) {
    return new Response('Insufficient credits', { status: 402 })
  }

  // 3. Get request data
  const { provider, model, systemPrompt, userPrompt } = await req.json()

  // 4. Get platform API key
  const apiKey = Deno.env.get(`${provider.toUpperCase()}_API_KEY`)
  if (!apiKey) {
    return new Response('Provider not configured', { status: 503 })
  }

  // 5. Make AI call
  let response
  if (provider === 'gemini') {
    response = await callGemini(apiKey, model, systemPrompt, userPrompt)
  } else if (provider === 'claude') {
    response = await callClaude(apiKey, model, systemPrompt, userPrompt)
  } else if (provider === 'chatgpt') {
    response = await callOpenAI(apiKey, model, systemPrompt, userPrompt)
  }

  // 6. Record usage and deduct credits
  const cost = estimateCost(provider, model, response.usage)
  await supabase
    .from('user_profiles')
    .update({ credits: profile.credits - cost })
    .eq('id', user.id)

  await supabase
    .from('usage_log')
    .insert({
      user_id: user.id,
      provider,
      model,
      input_tokens: response.usage.input,
      output_tokens: response.usage.output,
      cost,
      timestamp: new Date().toISOString(),
    })

  // 7. Return response
  return new Response(JSON.stringify(response.content))
})
```

## Billing Configuration

### Cost Estimation

The system estimates costs based on token usage:

| Provider | Model | Input (per 1M) | Output (per 1M) |
|----------|-------|----------------|-----------------|
| Gemini | 2.0 Flash | $0.075 | $0.30 |
| Gemini | 1.5 Pro | $1.25 | $5.00 |
| Claude | Haiku | $0.80 | $4.00 |
| Claude | Sonnet | $3.00 | $15.00 |
| Claude | Opus | $15.00 | $75.00 |
| ChatGPT | GPT-4o-mini | $0.15 | $0.60 |
| ChatGPT | GPT-4o | $5.00 | $15.00 |
| ChatGPT | o1-mini | $3.00 | $12.00 |
| ChatGPT | o1-preview | $15.00 | $60.00 |

### Credit System

Credits are stored in cents (1 credit = $0.01):

```typescript
// Add $100 in credits
adminAddCredits('gemini', 10000);

// Check remaining balance
const balance = getPlatformBalance('gemini');
console.log(`$${(balance / 100).toFixed(2)} remaining`);
```

### Budget Alerts

The system triggers alerts at these thresholds:

- **Warning**: $5.00 remaining
- **Critical**: $1.00 remaining
- **Exceeded**: $0.00 remaining

## User Experience

### Key Mode Selection

Users see a toggle on skill runner pages:

```
┌─────────────────────────────────────────────┐
│  API Key Mode                               │
│                                             │
│  [Platform Key]     [My Key]                │
│   $12.50 credits    Configured ✓            │
│                                             │
└─────────────────────────────────────────────┘
```

### Model Selection

Each provider shows available models with cost/speed indicators:

```
┌─────────────────────────────────────────────┐
│  Model                                      │
│                                             │
│  ○ Claude 3.5 Haiku      ⚡ Fast   $0.08/1k │
│  ● Claude 3.5 Sonnet     ⚡ Med    $0.30/1k │
│  ○ Claude 3 Opus         👑 Best   $1.50/1k │
│                                             │
└─────────────────────────────────────────────┘
```

## Testing

### Test Plan

1. **Platform Key Mode**
   - [ ] Toggle to "Platform Key" mode
   - [ ] Verify platform balance displays correctly
   - [ ] Run a skill and verify credits deducted
   - [ ] Verify usage recorded in ledger

2. **Personal Key Mode**
   - [ ] Toggle to "My Key" mode
   - [ ] Enter personal API key
   - [ ] Run a skill and verify no platform credits used
   - [ ] Verify key persists across sessions

3. **Model Selection**
   - [ ] Change models for each provider
   - [ ] Verify model persists across pages
   - [ ] Verify cost estimates update with model changes

4. **Budget Alerts**
   - [ ] Set low balance and verify warning displays
   - [ ] Deplete balance and verify "exceeded" state

5. **Usage Ledger**
   - [ ] Run multiple skills
   - [ ] Verify all executions recorded
   - [ ] Check summary calculations

## Files Reference

| File | Purpose |
|------|---------|
| `lib/platformKeys.ts` | Platform key management, model configs |
| `lib/usageLedger.ts` | Usage tracking and billing |
| `components/ProviderConfig.tsx` | UI for key/model selection |
| `lib/apiKeyStorage.ts` | Personal key storage |

## Admin Setup (Quick Start)

### Step 1: Access the Account Page

Navigate to `/account` in your browser.

### Step 2: Grant Yourself Admin Access

**Option A - Add Your Email to Admin List:**
1. In the Account page, click "Admin Settings"
2. Enter your email address in the "Admin Users" section
3. Click "Add"
4. Refresh the page - you should now see "Admin Access" badge

**Option B - Set Admin Tier:**
1. On the Account page, select "Team" or "Custom" tier
2. This automatically grants admin access

### Step 3: Configure API Keys

Once you have admin access:

1. Click "Admin Settings" to expand the section
2. Enter your API keys for each provider:
   - **Google Gemini**: Get from [Google AI Studio](https://aistudio.google.com/)
   - **Anthropic Claude**: Get from [Anthropic Console](https://console.anthropic.com/)
   - **OpenAI ChatGPT**: Get from [OpenAI Platform](https://platform.openai.com/)
3. Click "Save" for each key

### Step 4: Test Your Setup

1. Go to any skill (e.g., `/skill/resume-customizer`)
2. Verify you see "Admin Access • All models unlocked"
3. Select any model from any provider
4. Run a test to confirm everything works

### Admin vs Regular User Experience

| Feature | Regular User | Admin User |
|---------|--------------|------------|
| Model Access | Tier-limited | All models |
| Output Tokens | Tier-limited (2K-16K) | Full (32K+) |
| Tier Display | Shows "Free/Starter/Pro" | Shows "Admin Access" |
| Settings | Standard | + Admin Settings section |

### Programmatic Admin Setup

```javascript
// In browser console (for initial setup)
import { addAdminEmail, setUserTier } from './lib/billing';

// Option 1: Add admin by email
addAdminEmail('your.email@example.com');

// Option 2: Set tier
setUserTier('team'); // or 'custom'
```

## Migration from Current System

The new system is backwards-compatible:

1. Users with existing personal keys continue to work
2. Platform mode defaults to OFF until admin configures
3. No database migrations required (uses IndexedDB)

## Future Enhancements

- [ ] Stripe integration for automated top-ups
- [ ] Per-user credit tracking (vs. global pool)
- [ ] Usage dashboards in admin panel
- [ ] Rate limiting per user
- [ ] Model allowlists per user role
