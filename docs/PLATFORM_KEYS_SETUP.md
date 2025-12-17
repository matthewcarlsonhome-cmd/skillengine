# Platform Keys Setup Guide

This guide explains how to set up platform-managed API keys so users can run skills without providing their own keys.

## Overview

With Platform Keys enabled:
- Users choose "Platform Key" mode in Account Settings
- API calls are routed through your Supabase Edge Function
- Usage is tracked and deducted from user credits
- You manage a single API key per provider

## Prerequisites

1. **Supabase Project** - Create one at [supabase.com](https://supabase.com)
2. **Supabase CLI** - Install: `npm install -g supabase`
3. **API Keys** from providers you want to support:
   - [Google AI Studio](https://aistudio.google.com/) - Get Gemini key
   - [Anthropic Console](https://console.anthropic.com/) - Get Claude key
   - [OpenAI Platform](https://platform.openai.com/) - Get ChatGPT key

---

## Step 1: Set Up Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- User credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,  -- Balance in cents
  tier TEXT DEFAULT 'free',
  monthly_allocation INTEGER DEFAULT 0,
  used_this_month INTEGER DEFAULT 0,
  reset_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE user_credits
  SET
    balance = balance - p_amount,
    used_this_month = used_this_month + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_credits.balance + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own credits
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
```

---

## Step 2: Store API Keys as Secrets

In your terminal, run these commands (replace with your actual keys):

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Set API keys as secrets
supabase secrets set GEMINI_API_KEY=AIzaSy...your-key
supabase secrets set CLAUDE_API_KEY=sk-ant-...your-key
supabase secrets set OPENAI_API_KEY=sk-...your-key
```

**Security Note**: These keys are stored encrypted and only accessible to Edge Functions. They are never exposed to the client.

---

## Step 3: Deploy the Edge Function

The Edge Function is already created at `supabase/functions/ai-proxy/index.ts`.

Deploy it:

```bash
# Deploy the function
supabase functions deploy ai-proxy

# Verify it's running
supabase functions list
```

---

## Step 4: Configure Platform Key Availability

After deploying, create a simple endpoint to check if platform keys are available:

```bash
# Create the status function
mkdir -p supabase/functions/platform-status
```

Create `supabase/functions/platform-status/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Check which providers have keys configured
  const providers = {
    gemini: !!Deno.env.get('GEMINI_API_KEY'),
    claude: !!Deno.env.get('CLAUDE_API_KEY'),
    openai: !!Deno.env.get('OPENAI_API_KEY'),
  };

  const anyAvailable = Object.values(providers).some(v => v);

  return new Response(
    JSON.stringify({
      available: anyAvailable,
      providers,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
```

Deploy:
```bash
supabase functions deploy platform-status
```

---

## Step 5: Update Environment Variables

In your app's `.env` file, add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PLATFORM_KEYS_ENABLED=true
```

---

## Step 6: Test the Setup

### Test Platform Status
```bash
curl https://your-project.supabase.co/functions/v1/platform-status
```

Expected response:
```json
{
  "available": true,
  "providers": {
    "gemini": true,
    "claude": true,
    "openai": false
  }
}
```

### Test AI Proxy (requires auth token)
```bash
curl -X POST https://your-project.supabase.co/functions/v1/ai-proxy \
  -H "Authorization: Bearer YOUR_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "prompt": "Say hello in one word"
  }'
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Flow                                │
└─────────────────────────────────────────────────────────────────┘

1. User selects "Platform Key" mode in Account Settings
                           │
                           ▼
2. User runs a skill
                           │
                           ▼
3. Client calls: POST /functions/v1/ai-proxy
   ├── Authorization: Bearer <user-jwt>
   └── Body: { model, prompt, systemPrompt }
                           │
                           ▼
4. Edge Function:
   ├── Validates JWT → Gets user ID
   ├── Checks user_credits table → Has enough balance?
   ├── Gets API key from secrets (GEMINI_API_KEY, etc.)
   ├── Makes API call to provider
   ├── Calculates actual cost from token usage
   ├── Deducts credits from user balance
   ├── Logs usage to usage_logs table
   └── Returns response to client
                           │
                           ▼
5. Client displays result, user credits updated
```

---

## Cost Calculation

The proxy calculates costs based on actual token usage:

| Model | Input (per 1M) | Output (per 1M) | ~Cost/Skill |
|-------|---------------|-----------------|-------------|
| Gemini Flash | $0.075 | $0.30 | $0.0006 |
| Claude Haiku | $0.25 | $1.25 | $0.002 |
| Claude Sonnet | $3.00 | $15.00 | $0.03 |
| GPT-4o Mini | $0.15 | $0.60 | $0.001 |
| GPT-4o | $2.50 | $10.00 | $0.02 |

---

## Monitoring & Analytics

Query usage in Supabase:

```sql
-- Total usage by user (last 30 days)
SELECT
  user_id,
  SUM(cost_cents) as total_cost_cents,
  SUM(input_tokens) as total_input,
  SUM(output_tokens) as total_output,
  COUNT(*) as request_count
FROM usage_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_cost_cents DESC;

-- Usage by model
SELECT
  model,
  COUNT(*) as requests,
  SUM(cost_cents) as total_cost
FROM usage_logs
GROUP BY model
ORDER BY total_cost DESC;
```

---

## Troubleshooting

### "Platform key not configured"
- Check secrets: `supabase secrets list`
- Redeploy function after adding secrets

### "Insufficient credits"
- Add credits: `SELECT add_credits('user-uuid', 1000);`
- Check balance: `SELECT * FROM user_credits WHERE user_id = 'user-uuid';`

### "Invalid authentication"
- Ensure user is logged in
- Check JWT is being passed in Authorization header

---

## Security Checklist

- [x] API keys stored as encrypted secrets (not in code)
- [x] Row Level Security enabled on all tables
- [x] User can only access their own data
- [x] Credits checked before making API calls
- [x] All usage is logged for auditing
