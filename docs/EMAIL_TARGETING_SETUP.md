# Email Targeting & User Segmentation - Implementation Guide

Complete setup guide for the Admin Control Panel email targeting feature.

---

## Overview

This feature enables:
- User segmentation by skills, usage patterns, and preferences
- Marketing email opt-in management
- Targeted email campaigns with filtering
- Multi-provider email delivery (SendGrid, Resend, Mailgun)
- Admin audit logging

---

## 1. Database Setup (Supabase)

Run these SQL statements in your Supabase SQL Editor (`Database > SQL Editor`):

### Create Tables

```sql
-- ============================================================================
-- TABLE 1: User Email Preferences (opt-in tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  marketing_email_opt_in BOOLEAN DEFAULT false,
  opt_in_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own preferences
CREATE POLICY "Users can view own email preferences"
  ON user_email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON user_email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON user_email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE 2: User Skill Preferences (favorites & primary skills)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_skill_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_skill_ids TEXT[] DEFAULT '{}',
  primary_skill_ids TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_skill_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill preferences"
  ON user_skill_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skill preferences"
  ON user_skill_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill preferences"
  ON user_skill_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE 3: Skill Usage Statistics
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  run_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Enable RLS
ALTER TABLE skill_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage stats"
  ON skill_usage_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage stats"
  ON skill_usage_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage stats"
  ON skill_usage_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_skill_usage_user ON skill_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_usage_skill ON skill_usage_stats(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_usage_last_used ON skill_usage_stats(last_used_at);

-- ============================================================================
-- TABLE 4: Email Campaigns (history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,
  recipient_count INTEGER,
  recipient_filter JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (admin only via service role)
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 5: Admin Audit Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'email_segment_filter',
    'email_preview',
    'email_send',
    'subscription_toggle',
    'usage_stats_view'
  )),
  action_details JSONB,
  target_user_ids TEXT[],
  recipient_count INTEGER,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (admin only via service role)
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Index for querying logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON admin_audit_logs(timestamp DESC);

-- ============================================================================
-- FUNCTION: Increment Skill Usage (atomic operation)
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_skill_usage(
  p_user_id UUID,
  p_skill_id TEXT,
  p_skill_name TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO skill_usage_stats (user_id, skill_id, skill_name, run_count, last_used_at)
  VALUES (p_user_id, p_skill_id, p_skill_name, 1, now())
  ON CONFLICT (user_id, skill_id)
  DO UPDATE SET
    run_count = skill_usage_stats.run_count + 1,
    last_used_at = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 2. Edge Function Setup

### Deploy the Email Send Function

The Edge Function is already created at `supabase/functions/email-send/index.ts`.

**Deploy it:**

```bash
# From project root
supabase functions deploy email-send --project-ref YOUR_PROJECT_REF
```

Or via Supabase Dashboard:
1. Go to `Edge Functions` in your Supabase dashboard
2. Click `New Function`
3. Name it `email-send`
4. Copy contents from `supabase/functions/email-send/index.ts`

---

## 3. Environment Variables

### Supabase Edge Function Secrets

Set these via CLI or Dashboard (`Settings > Edge Functions > Secrets`):

```bash
# Required: At least one email provider
supabase secrets set SENDGRID_API_KEY=SG.xxxxx --project-ref YOUR_PROJECT_REF
# OR
supabase secrets set RESEND_API_KEY=re_xxxxx --project-ref YOUR_PROJECT_REF
# OR
supabase secrets set MAILGUN_API_KEY=key-xxxxx --project-ref YOUR_PROJECT_REF
supabase secrets set MAILGUN_DOMAIN=mg.yourdomain.com --project-ref YOUR_PROJECT_REF

# Required: From email address
supabase secrets set EMAIL_FROM=noreply@yourdomain.com --project-ref YOUR_PROJECT_REF

# Optional: For mock mode (testing without sending)
supabase secrets set EMAIL_PROVIDER=mock --project-ref YOUR_PROJECT_REF
```

### Frontend Environment Variables

Add to your `.env.local`:

```bash
# Supabase (already configured)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 4. Email Provider Setup

Choose ONE provider and configure:

### Option A: SendGrid (Recommended)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key (`Settings > API Keys > Create API Key`)
3. Verify your sender domain (`Settings > Sender Authentication`)
4. Set `SENDGRID_API_KEY` secret

### Option B: Resend
1. Sign up at [resend.com](https://resend.com)
2. Create an API key (`API Keys > Create API Key`)
3. Verify your domain (`Domains > Add Domain`)
4. Set `RESEND_API_KEY` secret

### Option C: Mailgun
1. Sign up at [mailgun.com](https://mailgun.com)
2. Get API key from dashboard
3. Add and verify your domain
4. Set `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` secrets

### Option D: Mock Mode (Development)
For testing without sending real emails:
```bash
supabase secrets set EMAIL_PROVIDER=mock
```

---

## 5. Admin Access Configuration

Admins are configured in the Admin Control Panel Settings tab. Ensure your email is in the admin list to access the Email Targeting feature.

---

## 6. File Structure Reference

```
skillengine/
├── lib/emailSegmentation/
│   ├── index.ts          # Module exports
│   ├── types.ts          # TypeScript interfaces
│   ├── filters.ts        # Segmentation filter logic
│   ├── storage.ts        # Supabase + localStorage persistence
│   ├── audit.ts          # Admin action logging
│   └── emailService.ts   # Client-side email API wrapper
├── hooks/
│   ├── useEmailSegments.ts    # Segmentation state management
│   └── useSkillUsageStats.ts  # Usage statistics hook
├── components/
│   ├── EmailSegmentationPanel.tsx  # Filter UI
│   └── EmailComposer.tsx           # Email composition
├── pages/
│   └── AdminPage.tsx      # Admin panel with Email Targeting tab
├── supabase/functions/
│   └── email-send/
│       └── index.ts       # Edge Function for email delivery
└── tests/lib/
    └── emailSegmentation.test.ts  # 42 filter tests
```

---

## 7. Quick Start Checklist

- [ ] **Database**: Run SQL to create 5 tables + 1 function
- [ ] **Edge Function**: Deploy `email-send` function
- [ ] **Email Provider**: Configure at least one (SendGrid/Resend/Mailgun)
- [ ] **Secrets**: Set `EMAIL_FROM` and provider API key(s)
- [ ] **Admin Access**: Add your email to admin list in Settings tab
- [ ] **Test**: Use mock mode first, then test with real provider

---

## 8. Testing the Feature

### Local Development (Mock Mode)

1. Start the dev server: `npm run dev`
2. Navigate to Admin Panel → Email Targeting
3. The feature uses localStorage fallback when Supabase tables don't exist
4. Filter users, select recipients, compose email
5. In mock mode, emails log to console instead of sending

### Production Testing

1. Deploy database tables
2. Deploy Edge Function with real provider secrets
3. Send a test email to yourself first
4. Check audit logs in `admin_audit_logs` table

---

## 9. API Reference

### Edge Function: `email-send`

**Endpoint:** `POST /functions/v1/email-send`

**Request Body:**
```json
{
  "subject": "Email subject",
  "body": "Markdown content",
  "recipientIds": ["user-uuid-1", "user-uuid-2"],
  "fromName": "SkillEngine",
  "replyTo": "support@example.com",
  "adminUserId": "admin-uuid",
  "adminEmail": "admin@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "campaignId": "campaign-uuid",
  "recipientCount": 2,
  "failedRecipients": []
}
```

---

## 10. Segmentation Filter Options

| Filter | Type | Description |
|--------|------|-------------|
| `requireOptIn` | boolean | Only include users who opted in |
| `skillIds` | string[] | Filter by specific skills |
| `skillMatchMode` | 'any' \| 'all' | Match any or all skills |
| `includeAsFavorite` | boolean | Include skills from favorites |
| `includeAsPrimary` | boolean | Include skills from primary (most used) |
| `minRunsInPeriod` | number | Minimum skill runs required |
| `periodDays` | number | Period for usage calculation |
| `activeInLastDays` | number | Activity recency filter |

---

## Troubleshooting

### "No recipients found"
- Check if `user_email_preferences` table has data
- Verify users have `marketing_email_opt_in = true` if filtering by opt-in
- Check localStorage fallback data in browser DevTools

### "Edge Function error"
- Check function logs: `supabase functions logs email-send`
- Verify secrets are set correctly
- Test with mock mode first

### "Permission denied on table"
- Ensure RLS policies are created
- For admin operations, use service role key in Edge Function

---

## Support

Run tests to verify filter logic:
```bash
npm test -- --run tests/lib/emailSegmentation.test.ts
```
