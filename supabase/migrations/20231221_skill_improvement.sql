-- ═══════════════════════════════════════════════════════════════════════════
-- SKILL SELF-IMPROVEMENT SCHEMA
-- Recursive improvement system for skills based on user feedback
-- ═══════════════════════════════════════════════════════════════════════════

-- Skill Version History
-- Tracks all versions of a skill's prompts for A/B testing and rollback
CREATE TABLE IF NOT EXISTS skill_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skill_templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,

    -- Prompt content at this version
    system_instruction TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,

    -- Version metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL CHECK (created_by IN ('system', 'user', 'ai-improvement')),
    change_reason TEXT,

    -- Whether this version is currently active
    is_active BOOLEAN NOT NULL DEFAULT false,

    -- Reference to previous version for rollback
    previous_version_id UUID REFERENCES skill_versions(id),

    UNIQUE(skill_id, version_number)
);

-- Index for quick active version lookup
CREATE INDEX idx_skill_versions_active ON skill_versions(skill_id, is_active) WHERE is_active = true;
CREATE INDEX idx_skill_versions_skill ON skill_versions(skill_id);

-- Skill Grades
-- Detailed user feedback on skill outputs
CREATE TABLE IF NOT EXISTS skill_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skill_templates(id) ON DELETE CASCADE,
    skill_version_id UUID NOT NULL REFERENCES skill_versions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Execution context
    execution_id TEXT NOT NULL,
    inputs_hash TEXT NOT NULL, -- For deduplication

    -- Scores (1-5 scale)
    overall_score INTEGER NOT NULL CHECK (overall_score >= 1 AND overall_score <= 5),

    -- Dimension scores (JSONB array)
    dimension_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Format: [{"dimension": "relevance", "score": 4}, ...]

    -- Qualitative feedback
    feedback TEXT,
    improvement_suggestion TEXT,

    -- Expected vs actual
    expected_output TEXT,
    was_output_used BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    executed_at TIMESTAMPTZ NOT NULL,

    -- One grade per execution
    UNIQUE(execution_id, user_id)
);

-- Indexes for grade aggregation
CREATE INDEX idx_skill_grades_skill ON skill_grades(skill_id);
CREATE INDEX idx_skill_grades_version ON skill_grades(skill_version_id);
CREATE INDEX idx_skill_grades_user ON skill_grades(user_id);
CREATE INDEX idx_skill_grades_score ON skill_grades(overall_score);
CREATE INDEX idx_skill_grades_date ON skill_grades(graded_at);

-- Skill Version Scores (Aggregated)
-- Pre-computed aggregate scores for quick lookup
CREATE TABLE IF NOT EXISTS skill_version_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_version_id UUID NOT NULL REFERENCES skill_versions(id) ON DELETE CASCADE,

    -- Grade counts
    grade_count INTEGER NOT NULL DEFAULT 0,
    required_grades INTEGER NOT NULL DEFAULT 10,

    -- Aggregate scores
    average_overall_score NUMERIC(3,2) NOT NULL DEFAULT 0,

    -- Dimension aggregates (JSONB)
    dimension_averages JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Format: {"relevance": 4.2, "accuracy": 3.8, ...}

    -- Improvement settings
    improvement_threshold NUMERIC(3,2) NOT NULL DEFAULT 3.5,

    last_graded_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(skill_version_id)
);

CREATE INDEX idx_skill_version_scores_version ON skill_version_scores(skill_version_id);

-- Improvement Requests
-- Track proposed and implemented improvements
CREATE TABLE IF NOT EXISTS improvement_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skill_templates(id) ON DELETE CASCADE,
    skill_version_id UUID NOT NULL REFERENCES skill_versions(id) ON DELETE CASCADE,

    -- Trigger information
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    trigger_reason TEXT NOT NULL CHECK (trigger_reason IN (
        'low-score-threshold',
        'dimension-weakness',
        'user-feedback-pattern',
        'manual-request',
        'periodic-review'
    )),

    -- Analysis (JSONB)
    issue_analysis JSONB NOT NULL,
    -- Contains: commonIssues, weakestDimensions, feedbackThemes, etc.

    -- Proposed changes (JSONB array)
    proposed_changes JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'approved',
        'rejected',
        'implemented',
        'rolled-back'
    )),

    -- If implemented, link to new version
    new_version_id UUID REFERENCES skill_versions(id),

    -- Review information
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_improvement_requests_skill ON improvement_requests(skill_id);
CREATE INDEX idx_improvement_requests_status ON improvement_requests(status);
CREATE INDEX idx_improvement_requests_date ON improvement_requests(triggered_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to update aggregate scores when a new grade is added
CREATE OR REPLACE FUNCTION update_version_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert aggregate scores
    INSERT INTO skill_version_scores (skill_version_id, grade_count, average_overall_score, last_graded_at)
    SELECT
        NEW.skill_version_id,
        COUNT(*),
        AVG(overall_score),
        MAX(graded_at)
    FROM skill_grades
    WHERE skill_version_id = NEW.skill_version_id
    ON CONFLICT (skill_version_id)
    DO UPDATE SET
        grade_count = EXCLUDED.grade_count,
        average_overall_score = EXCLUDED.average_overall_score,
        last_graded_at = EXCLUDED.last_graded_at,
        updated_at = now();

    -- Update dimension averages
    WITH dim_avgs AS (
        SELECT
            skill_version_id,
            jsonb_object_agg(
                dim->>'dimension',
                (SELECT AVG((d->>'score')::numeric)
                 FROM skill_grades g2,
                      jsonb_array_elements(g2.dimension_scores) d
                 WHERE g2.skill_version_id = NEW.skill_version_id
                   AND d->>'dimension' = dim->>'dimension')
            ) as averages
        FROM skill_grades g,
             jsonb_array_elements(g.dimension_scores) dim
        WHERE g.skill_version_id = NEW.skill_version_id
        GROUP BY skill_version_id
    )
    UPDATE skill_version_scores svs
    SET dimension_averages = COALESCE(da.averages, '{}'::jsonb)
    FROM dim_avgs da
    WHERE svs.skill_version_id = da.skill_version_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update scores
DROP TRIGGER IF EXISTS trigger_update_version_scores ON skill_grades;
CREATE TRIGGER trigger_update_version_scores
    AFTER INSERT OR UPDATE ON skill_grades
    FOR EACH ROW
    EXECUTE FUNCTION update_version_scores();

-- Function to check if improvement should be triggered
CREATE OR REPLACE FUNCTION check_improvement_trigger(p_skill_version_id UUID)
RETURNS TABLE(should_trigger BOOLEAN, trigger_reason TEXT) AS $$
DECLARE
    v_scores skill_version_scores%ROWTYPE;
    v_threshold NUMERIC := 3.5;
    v_min_grades INTEGER := 10;
BEGIN
    SELECT * INTO v_scores
    FROM skill_version_scores
    WHERE skill_version_id = p_skill_version_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::TEXT;
        RETURN;
    END IF;

    -- Check if enough grades
    IF v_scores.grade_count < v_min_grades THEN
        RETURN QUERY SELECT false, 'insufficient-grades'::TEXT;
        RETURN;
    END IF;

    -- Check overall score threshold
    IF v_scores.average_overall_score < v_scores.improvement_threshold THEN
        RETURN QUERY SELECT true, 'low-score-threshold'::TEXT;
        RETURN;
    END IF;

    -- Check dimension weaknesses
    IF EXISTS (
        SELECT 1
        FROM jsonb_each_text(v_scores.dimension_averages)
        WHERE value::numeric < 3.0
    ) THEN
        RETURN QUERY SELECT true, 'dimension-weakness'::TEXT;
        RETURN;
    END IF;

    RETURN QUERY SELECT false, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE skill_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_version_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_requests ENABLE ROW LEVEL SECURITY;

-- Skill versions are readable by all, writable by admins
CREATE POLICY "Skill versions are viewable by all"
    ON skill_versions FOR SELECT
    USING (true);

-- Grades: users can see their own, admins can see all
CREATE POLICY "Users can view own grades"
    ON skill_grades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grades"
    ON skill_grades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Version scores are viewable by all
CREATE POLICY "Version scores are viewable by all"
    ON skill_version_scores FOR SELECT
    USING (true);

-- Improvement requests viewable by all, manageable by admins
CREATE POLICY "Improvement requests are viewable by all"
    ON improvement_requests FOR SELECT
    USING (true);
