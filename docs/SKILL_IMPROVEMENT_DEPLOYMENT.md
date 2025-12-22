# Skill Self-Improvement System - Deployment Guide

This guide walks you through deploying the Supabase-backed skill self-improvement system.

## Overview

The self-improvement system enables skills to automatically improve their prompts based on aggregated user feedback:

1. **Users rate skill outputs** (1-5 stars + 6 quality dimensions)
2. **Grades are anonymously stored** in Supabase (no user tracking)
3. **Database triggers auto-aggregate** scores in real-time
4. **When scores drop below 3.5** after 50+ ratings, improvement is triggered
5. **AI generates improved prompts** via Edge Function
6. **Admin reviews and approves** changes
7. **Improved prompts are served** to all users

---

## Step 1: Apply Database Migration

### Option A: Via Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of:
   ```
   supabase/migrations/20251222_skill_scoring_v2.sql
   ```
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify no errors in the output

### Option B: Via Supabase CLI

```bash
# If you have Supabase CLI installed and linked
supabase db push

# Or run migration directly
supabase migration up
```

### Verify Tables Were Created

Run this query in SQL Editor to verify:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'skill_registry',
  'skill_grades_v2',
  'skill_version_history',
  'skill_improvement_requests'
);
```

You should see all 4 tables listed.

---

## Step 2: Deploy Edge Function

### Option A: Via Supabase Dashboard

1. Navigate to **Edge Functions** (left sidebar)
2. Click **Create a new function**
3. Name it: `skill-improver`
4. Copy the contents of:
   ```
   supabase/functions/skill-improver/index.ts
   ```
5. Paste into the editor
6. Click **Deploy**

### Option B: Via Supabase CLI

```bash
# Deploy the function
supabase functions deploy skill-improver

# Verify deployment
supabase functions list
```

### Set Required Secrets

The Edge Function needs the Claude API key:

**Via Dashboard:**
1. Go to **Project Settings** → **Edge Functions**
2. Click on `skill-improver`
3. Add secret: `CLAUDE_API_KEY` = your Anthropic API key

**Via CLI:**
```bash
supabase secrets set CLAUDE_API_KEY=sk-ant-xxx
```

---

## Step 3: Initialize Skill Registry

Seed the database with your existing skills:

```bash
# Set environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run initialization script
npx ts-node scripts/initializeSkillRegistry.ts
```

**Where to find these values:**
- `SUPABASE_URL`: Project Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API → service_role key (keep secret!)

### Verify Skills Were Registered

```sql
SELECT id, name, skill_type, current_version, total_grades
FROM skill_registry
ORDER BY name
LIMIT 20;
```

---

## Step 4: Configure Row Level Security (RLS)

The migration includes RLS policies, but verify they're enabled:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'skill_registry',
  'skill_grades_v2',
  'skill_version_history',
  'skill_improvement_requests'
);
```

All should show `rowsecurity = true`.

---

## Step 5: Test the System

### Test Grade Submission

```sql
-- Insert a test grade
INSERT INTO skill_grades_v2 (
  skill_id, skill_version, overall_score,
  relevance_score, accuracy_score, completeness_score,
  clarity_score, actionability_score, professionalism_score,
  feedback, was_output_used
) VALUES (
  'resume-customizer', 1, 4,
  5, 4, 4, 5, 3, 5,
  'Test grade - please delete',
  true
);

-- Verify aggregation trigger worked
SELECT id, total_grades, avg_overall_score
FROM skill_registry
WHERE id = 'resume-customizer';

-- Clean up test data
DELETE FROM skill_grades_v2 WHERE feedback = 'Test grade - please delete';
```

### Test Edge Function

```bash
# Test the status endpoint
curl -X POST \
  'https://your-project.supabase.co/functions/v1/skill-improver' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"action": "status", "skillId": "resume-customizer"}'
```

---

## Configuration Options

### Adjust Improvement Thresholds

```sql
-- Change minimum grades required (default: 50)
UPDATE skill_registry
SET min_grades_for_improvement = 100
WHERE skill_type = 'built-in';

-- Change score threshold (default: 3.5)
UPDATE skill_registry
SET improvement_threshold = 3.0
WHERE skill_type = 'built-in';
```

### Reset Scores for a Skill

```sql
-- Reset a skill's scores (e.g., after major prompt change)
UPDATE skill_registry
SET
  total_grades = 0,
  avg_overall_score = NULL,
  avg_relevance = NULL,
  avg_accuracy = NULL,
  avg_completeness = NULL,
  avg_clarity = NULL,
  avg_actionability = NULL,
  avg_professionalism = NULL,
  improvement_pending = false
WHERE id = 'skill-id-here';
```

---

## Admin Workflow: Managing Improvements

### View Pending Improvements

```sql
SELECT
  sir.id,
  sr.name as skill_name,
  sir.trigger_reason,
  sir.score_snapshot,
  sir.status,
  sir.triggered_at
FROM skill_improvement_requests sir
JOIN skill_registry sr ON sr.id = sir.skill_id
WHERE sir.status IN ('pending', 'generated')
ORDER BY sir.triggered_at DESC;
```

### Generate AI Improvement

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/skill-improver' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"action": "generate", "requestId": "uuid-here"}'
```

### Approve and Apply Improvement

```bash
# Approve
curl -X POST \
  'https://your-project.supabase.co/functions/v1/skill-improver' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"action": "approve", "requestId": "uuid-here"}'

# Apply
curl -X POST \
  'https://your-project.supabase.co/functions/v1/skill-improver' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"action": "apply", "requestId": "uuid-here"}'
```

### Rollback If Needed

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/skill-improver' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"action": "rollback", "skillId": "resume-customizer", "reason": "New version scored worse"}'
```

---

## Monitoring & Analytics

### Skills Needing Attention

```sql
SELECT * FROM skills_needing_improvement
WHERE total_grades >= 10
ORDER BY avg_overall_score ASC
LIMIT 20;
```

### Score Distribution by Skill

```sql
SELECT
  skill_id,
  overall_score,
  COUNT(*) as count
FROM skill_grades_v2
GROUP BY skill_id, overall_score
ORDER BY skill_id, overall_score;
```

### Improvement Success Rate

```sql
SELECT
  status,
  COUNT(*) as count
FROM skill_improvement_requests
GROUP BY status;
```

---

## Troubleshooting

### "skill not found in registry"

The skill hasn't been registered yet. Either:
1. Run the initialization script
2. Manually register the skill:

```sql
INSERT INTO skill_registry (id, name, skill_type, current_system_instruction, current_user_prompt_template)
VALUES ('skill-id', 'Skill Name', 'built-in', 'System prompt...', 'User prompt...');
```

### Grades not aggregating

Check if the trigger exists:

```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_skill_scores';
```

### Edge Function timeout

The AI improvement generation can take 30-60 seconds. If timing out:
1. Check Supabase Edge Function logs
2. Verify CLAUDE_API_KEY is set correctly
3. Try with a smaller/simpler skill prompt

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                            │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐ │
│  │  SkillGrading    │───▶│ submitGrade()    │───▶│   Supabase    │ │
│  │    Component     │    │ (supabaseGrading)│    │    Client     │ │
│  └──────────────────┘    └──────────────────┘    └───────┬───────┘ │
└──────────────────────────────────────────────────────────┼─────────┘
                                                           │
┌──────────────────────────────────────────────────────────▼─────────┐
│                        Supabase Backend                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     skill_grades_v2                          │  │
│  │  INSERT triggers:                                            │  │
│  │    1. update_skill_aggregate_scores() ──▶ skill_registry     │  │
│  │    2. maybe_trigger_improvement() ──▶ skill_improvement_req  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│  │  skill_registry  │    │ skill_version_   │    │ improvement_ │ │
│  │  (current state) │    │    history       │    │   requests   │ │
│  └──────────────────┘    └──────────────────┘    └──────────────┘ │
│                                    ▲                    │          │
│                                    │                    ▼          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              skill-improver Edge Function                    │  │
│  │  • generate: Call Claude API to generate improved prompts   │  │
│  │  • approve: Mark request as approved                        │  │
│  │  • apply: Update skill_registry with new prompts            │  │
│  │  • rollback: Restore previous version from history          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Files Changed

| File | Description |
|------|-------------|
| `supabase/migrations/20251222_skill_scoring_v2.sql` | Database schema, triggers, functions |
| `supabase/functions/skill-improver/index.ts` | Edge Function for AI improvement |
| `lib/selfImprovement/supabaseGrading.ts` | Supabase client for grades |
| `lib/selfImprovement/promptResolver.ts` | Prompt resolution from registry |
| `lib/selfImprovement/index.ts` | Module exports |
| `components/SkillGrading.tsx` | Updated to use Supabase |
| `scripts/initializeSkillRegistry.ts` | Skill registry seeding |

---

## Next Steps

1. **Build Admin Dashboard**: Create UI for reviewing/approving improvements
2. **Add Notifications**: Alert admins when improvements are triggered
3. **A/B Testing**: Split traffic between prompt versions
4. **Analytics Dashboard**: Visualize score trends over time
