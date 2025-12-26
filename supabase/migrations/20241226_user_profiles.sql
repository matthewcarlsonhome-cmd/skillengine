-- ═══════════════════════════════════════════════════════════════════════════
-- USER PROFILES TABLE MIGRATION
-- Adds user profile storage with onboarding data, preferences, and Stripe info
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- ENUM TYPES
-- ═══════════════════════════════════════════════════════════════════════════

-- User subscription roles
CREATE TYPE user_role AS ENUM ('free', 'pro', 'team', 'custom');

-- Automation interest categories
CREATE TYPE automation_interest AS ENUM ('work', 'education', 'personal', 'business', 'general');

-- Professional role categories
CREATE TYPE role_category AS ENUM (
  'marketing', 'sales', 'copywriting', 'management', 'analysis',
  'engineering', 'design', 'operations', 'hr', 'finance', 'consulting', 'other'
);

-- Workflow interest categories
CREATE TYPE workflow_category AS ENUM (
  'job-search', 'marketing-campaigns', 'sales-business', 'project-management',
  'content-creation', 'data-analysis', 'business-strategy', 'training-education',
  'governance-compliance'
);

-- Subscription status for Stripe
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Email frequency preference
CREATE TYPE email_frequency AS ENUM ('realtime', 'daily', 'weekly', 'monthly', 'never');

-- ═══════════════════════════════════════════════════════════════════════════
-- USER PROFILES TABLE
-- Extends Supabase auth.users with application-specific data
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_profiles (
  -- Primary key links to Supabase auth.users
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info (synced from auth on login)
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,

  -- Role & subscription
  role user_role NOT NULL DEFAULT 'free',
  role_assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role_expires_at TIMESTAMPTZ,

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status subscription_status,

  -- Usage tracking
  skill_runs_today INTEGER NOT NULL DEFAULT 0,
  skill_runs_this_month INTEGER NOT NULL DEFAULT 0,
  last_skill_run_at TIMESTAMPTZ,
  usage_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Admin flags
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- USER ONBOARDING TABLE
-- Stores onboarding preferences and interests
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_onboarding (
  -- Foreign key to user_profiles
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Step 1: Primary automation interest
  automation_interest automation_interest,

  -- Step 2: Role categories (stored as array)
  role_categories role_category[],

  -- Step 3: Workflow interests (stored as array)
  workflow_interests workflow_category[],

  -- Specific selections (optional)
  specific_role_title TEXT,
  specific_skill_ids TEXT[],
  specific_workflow_ids TEXT[],

  -- Onboarding status
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_skipped_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- USER EMAIL PREFERENCES TABLE
-- Marketing and notification preferences
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_email_preferences (
  -- Foreign key to user_profiles
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Email for sending (could differ from auth email)
  email TEXT NOT NULL,

  -- Opt-in preferences
  marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  product_updates BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_digest BOOLEAN NOT NULL DEFAULT FALSE,

  -- Frequency preference
  frequency email_frequency NOT NULL DEFAULT 'weekly',

  -- Unsubscribe tracking
  unsubscribed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX idx_user_profiles_last_login ON user_profiles(last_login_at);

-- Onboarding indexes
CREATE INDEX idx_user_onboarding_interest ON user_onboarding(automation_interest);
CREATE INDEX idx_user_onboarding_completed ON user_onboarding(onboarding_completed);

-- Email preferences indexes
CREATE INDEX idx_user_email_prefs_opt_in ON user_email_preferences(marketing_opt_in);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Onboarding policies
CREATE POLICY "Users can manage own onboarding"
  ON user_onboarding FOR ALL
  USING (auth.uid() = user_id);

-- Email preferences policies
CREATE POLICY "Users can manage own email preferences"
  ON user_email_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS AND TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_email_preferences_updated_at
  BEFORE UPDATE ON user_email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to reset daily usage counts
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET skill_runs_today = 0,
      usage_reset_date = CURRENT_DATE
  WHERE usage_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage counts (call on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET skill_runs_this_month = 0
  WHERE EXTRACT(MONTH FROM usage_reset_date) != EXTRACT(MONTH FROM CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile on signup (trigger from auth.users)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Also create email preferences with email
  INSERT INTO user_email_preferences (user_id, email)
  VALUES (NEW.id, NEW.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS FOR ADMIN
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM user_profiles),
    'users_by_role', (
      SELECT json_object_agg(role, count)
      FROM (
        SELECT role, COUNT(*) as count
        FROM user_profiles
        GROUP BY role
      ) t
    ),
    'onboarding_completion_rate', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE onboarding_completed) * 100.0 / NULLIF(COUNT(*), 0))::numeric,
        1
      )
      FROM user_onboarding
    ),
    'users_by_interest', (
      SELECT json_object_agg(automation_interest, count)
      FROM (
        SELECT automation_interest, COUNT(*) as count
        FROM user_onboarding
        WHERE automation_interest IS NOT NULL
        GROUP BY automation_interest
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export users with onboarding data (for admin)
CREATE OR REPLACE FUNCTION export_users_with_onboarding()
RETURNS TABLE (
  email TEXT,
  display_name TEXT,
  role user_role,
  automation_interest automation_interest,
  role_categories role_category[],
  workflow_interests workflow_category[],
  onboarding_completed BOOLEAN,
  marketing_opt_in BOOLEAN,
  created_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Only admins can call this
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.email,
    p.display_name,
    p.role,
    o.automation_interest,
    o.role_categories,
    o.workflow_interests,
    COALESCE(o.onboarding_completed, FALSE),
    COALESCE(e.marketing_opt_in, FALSE),
    p.created_at,
    p.last_login_at
  FROM user_profiles p
  LEFT JOIN user_onboarding o ON p.id = o.user_id
  LEFT JOIN user_email_preferences e ON p.id = e.user_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS FOR DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE user_profiles IS 'Extended user profiles with role, subscription, and usage tracking';
COMMENT ON TABLE user_onboarding IS 'User onboarding preferences and interests';
COMMENT ON TABLE user_email_preferences IS 'Email marketing and notification preferences';
COMMENT ON FUNCTION get_user_stats() IS 'Returns aggregated user statistics for admin dashboard';
COMMENT ON FUNCTION export_users_with_onboarding() IS 'Exports all users with onboarding data for admin';
