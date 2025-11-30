-- Skill Engine Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor → New Query

-- ============================================
-- 1. PROFILES TABLE (extends Supabase auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Anonymous'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. SKILL TEMPLATES TABLE (community library)
-- ============================================
CREATE TABLE IF NOT EXISTS public.skill_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Skill metadata
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL,
  estimated_time_saved TEXT,

  -- Role targeting
  role_title TEXT,
  role_department TEXT,
  role_level TEXT,

  -- The actual prompts
  system_instruction TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  output_format TEXT DEFAULT 'markdown',

  -- Config
  recommended_model TEXT DEFAULT 'any',
  max_tokens INTEGER DEFAULT 4096,
  temperature NUMERIC DEFAULT 0.4,

  -- Form inputs as JSON array
  inputs JSONB NOT NULL DEFAULT '[]',

  -- Community metrics
  use_count INTEGER DEFAULT 0,
  rating_sum INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Visibility
  is_public BOOLEAN DEFAULT true
);

-- ============================================
-- 3. SKILL TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.skill_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID REFERENCES public.skill_templates(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

-- ============================================
-- 4. SKILL RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.skill_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID REFERENCES public.skill_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skill_id, user_id)
);

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_skills_role ON public.skill_templates(role_title, role_department);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skill_templates(category);
CREATE INDEX IF NOT EXISTS idx_skills_public ON public.skill_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_skills_use_count ON public.skill_templates(use_count DESC);
CREATE INDEX IF NOT EXISTS idx_skill_tags_tag ON public.skill_tags(tag);
CREATE INDEX IF NOT EXISTS idx_skill_tags_skill ON public.skill_tags(skill_id);

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Function to increment use count
CREATE OR REPLACE FUNCTION public.increment_skill_use_count(skill_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.skill_templates
  SET use_count = use_count + 1
  WHERE id = skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update rating aggregates
CREATE OR REPLACE FUNCTION public.update_skill_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.skill_templates
    SET rating_sum = rating_sum + NEW.rating,
        rating_count = rating_count + 1
    WHERE id = NEW.skill_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.skill_templates
    SET rating_sum = rating_sum - OLD.rating + NEW.rating
    WHERE id = NEW.skill_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.skill_templates
    SET rating_sum = rating_sum - OLD.rating,
        rating_count = rating_count - 1
    WHERE id = OLD.skill_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update ratings
DROP TRIGGER IF EXISTS on_skill_rating_change ON public.skill_ratings;
CREATE TRIGGER on_skill_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.skill_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_skill_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skill_templates_updated_at ON public.skill_templates;
CREATE TRIGGER skill_templates_updated_at
  BEFORE UPDATE ON public.skill_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (allows re-running this script)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public skills are viewable by everyone" ON public.skill_templates;
DROP POLICY IF EXISTS "Authenticated users can create skills" ON public.skill_templates;
DROP POLICY IF EXISTS "Users can update own skills" ON public.skill_templates;
DROP POLICY IF EXISTS "Users can delete own skills" ON public.skill_templates;
DROP POLICY IF EXISTS "Tags for public skills are viewable" ON public.skill_tags;
DROP POLICY IF EXISTS "Skill owners can manage tags" ON public.skill_tags;
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.skill_ratings;
DROP POLICY IF EXISTS "Authenticated users can rate skills" ON public.skill_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.skill_ratings;

-- Profiles: Users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Skills: Anyone can read public skills
CREATE POLICY "Public skills are viewable by everyone"
  ON public.skill_templates FOR SELECT
  USING (is_public = true);

-- Skills: Authenticated users can create skills
CREATE POLICY "Authenticated users can create skills"
  ON public.skill_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Skills: Users can update their own skills
CREATE POLICY "Users can update own skills"
  ON public.skill_templates FOR UPDATE
  USING (auth.uid() = created_by);

-- Skills: Users can delete their own skills
CREATE POLICY "Users can delete own skills"
  ON public.skill_templates FOR DELETE
  USING (auth.uid() = created_by);

-- Tags: Anyone can read tags for public skills
CREATE POLICY "Tags for public skills are viewable"
  ON public.skill_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.skill_templates
      WHERE skill_templates.id = skill_tags.skill_id
      AND skill_templates.is_public = true
    )
  );

-- Tags: Skill owners can manage tags
CREATE POLICY "Skill owners can manage tags"
  ON public.skill_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.skill_templates
      WHERE skill_templates.id = skill_tags.skill_id
      AND skill_templates.created_by = auth.uid()
    )
  );

-- Ratings: Anyone can read ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON public.skill_ratings FOR SELECT
  USING (true);

-- Ratings: Authenticated users can rate skills
CREATE POLICY "Authenticated users can rate skills"
  ON public.skill_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ratings: Users can update their own ratings
CREATE POLICY "Users can update own ratings"
  ON public.skill_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.skill_templates TO anon, authenticated;
GRANT SELECT ON public.skill_tags TO anon, authenticated;
GRANT SELECT ON public.skill_ratings TO anon, authenticated;

GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skill_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skill_tags TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skill_ratings TO authenticated;

GRANT EXECUTE ON FUNCTION public.increment_skill_use_count TO anon, authenticated;
