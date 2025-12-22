-- ═══════════════════════════════════════════════════════════════════════════
-- SKILL SCORING SYSTEM V2
-- Supports both built-in skills (code-defined) and dynamic skills
-- Implements anonymous grade collection and AI-powered prompt improvement
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1. SKILL REGISTRY
-- Master list of all skills with current prompt state and aggregate scores
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_registry (
    id TEXT PRIMARY KEY,  -- e.g., 'resume-customizer', 'cover-letter-generator'
    name TEXT NOT NULL,
    skill_type TEXT NOT NULL CHECK (skill_type IN ('built-in', 'dynamic', 'community', 'library')),

    -- Current active prompt content
    current_system_instruction TEXT NOT NULL,
    current_user_prompt_template TEXT NOT NULL,

    -- Versioning
    current_version INTEGER NOT NULL DEFAULT 1,

    -- Aggregate scores (denormalized for fast reads)
    total_grades INTEGER NOT NULL DEFAULT 0,
    avg_overall_score NUMERIC(3,2) DEFAULT NULL,
    avg_relevance NUMERIC(3,2) DEFAULT NULL,
    avg_accuracy NUMERIC(3,2) DEFAULT NULL,
    avg_completeness NUMERIC(3,2) DEFAULT NULL,
    avg_clarity NUMERIC(3,2) DEFAULT NULL,
    avg_actionability NUMERIC(3,2) DEFAULT NULL,
    avg_professionalism NUMERIC(3,2) DEFAULT NULL,

    -- Improvement settings
    improvement_threshold NUMERIC(3,2) NOT NULL DEFAULT 3.5,
    min_grades_for_improvement INTEGER NOT NULL DEFAULT 50,
    improvement_pending BOOLEAN NOT NULL DEFAULT false,
    last_improved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_skill_registry_type ON skill_registry(skill_type);
CREATE INDEX IF NOT EXISTS idx_skill_registry_improvement ON skill_registry(improvement_pending) WHERE improvement_pending = true;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. SKILL GRADES (Individual user feedback - anonymized)
-- No user_id stored to ensure privacy
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_grades_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id TEXT NOT NULL REFERENCES skill_registry(id) ON DELETE CASCADE,
    skill_version INTEGER NOT NULL,  -- Version when grade was given

    -- Scores (1-5 scale)
    overall_score INTEGER NOT NULL CHECK (overall_score >= 1 AND overall_score <= 5),
    relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 5),
    accuracy_score INTEGER CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
    completeness_score INTEGER CHECK (completeness_score >= 1 AND completeness_score <= 5),
    clarity_score INTEGER CHECK (clarity_score >= 1 AND clarity_score <= 5),
    actionability_score INTEGER CHECK (actionability_score >= 1 AND actionability_score <= 5),
    professionalism_score INTEGER CHECK (professionalism_score >= 1 AND professionalism_score <= 5),

    -- Qualitative feedback (anonymized - no user ID stored)
    feedback TEXT,
    improvement_suggestion TEXT,
    was_output_used BOOLEAN NOT NULL DEFAULT false,

    -- Deduplication (hash of inputs to prevent gaming)
    inputs_hash TEXT,

    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for aggregation queries
CREATE INDEX IF NOT EXISTS idx_skill_grades_v2_skill ON skill_grades_v2(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_grades_v2_version ON skill_grades_v2(skill_id, skill_version);
CREATE INDEX IF NOT EXISTS idx_skill_grades_v2_date ON skill_grades_v2(graded_at);
CREATE INDEX IF NOT EXISTS idx_skill_grades_v2_overall ON skill_grades_v2(overall_score);

-- ───────────────────────────────────────────────────────────────────────────
-- 3. SKILL VERSION HISTORY
-- Audit trail of prompt changes for rollback capability
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id TEXT NOT NULL REFERENCES skill_registry(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,

    -- Prompt content at this version
    system_instruction TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL CHECK (created_by IN ('system', 'admin', 'ai-improvement')),
    change_reason TEXT,

    -- Scores when this version was active
    grades_received INTEGER NOT NULL DEFAULT 0,
    avg_score_when_active NUMERIC(3,2),

    -- Rollback tracking
    was_rolled_back BOOLEAN NOT NULL DEFAULT false,
    rolled_back_at TIMESTAMPTZ,
    rollback_reason TEXT,

    UNIQUE(skill_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_skill_version_history_skill ON skill_version_history(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_version_history_version ON skill_version_history(skill_id, version_number);

-- ───────────────────────────────────────────────────────────────────────────
-- 4. IMPROVEMENT REQUESTS
-- Tracks AI-generated improvements awaiting approval
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_improvement_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id TEXT NOT NULL REFERENCES skill_registry(id) ON DELETE CASCADE,
    from_version INTEGER NOT NULL,

    -- Trigger info
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    trigger_reason TEXT NOT NULL,  -- 'low-overall-score', 'weak-relevance', etc.

    -- Current scores that triggered improvement
    score_snapshot JSONB NOT NULL,
    -- Format: {"overall": 3.2, "relevance": 2.8, "accuracy": 3.5, ...}

    -- Feedback analysis
    common_complaints TEXT[],  -- ['too verbose', 'not specific enough']
    sample_feedback TEXT[],    -- Anonymized examples

    -- AI-generated improvement
    proposed_system_instruction TEXT,
    proposed_user_prompt_template TEXT,
    improvement_rationale TEXT,

    -- Status workflow
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Awaiting AI generation
        'generated',    -- AI has proposed changes
        'approved',     -- Admin approved
        'rejected',     -- Admin rejected
        'implemented',  -- Changes applied
        'rolled-back'   -- Performance declined, reverted
    )),

    -- Review tracking
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- Implementation tracking
    new_version INTEGER,
    implemented_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_improvement_requests_skill ON skill_improvement_requests(skill_id);
CREATE INDEX IF NOT EXISTS idx_improvement_requests_status ON skill_improvement_requests(status);
CREATE INDEX IF NOT EXISTS idx_improvement_requests_pending ON skill_improvement_requests(status) WHERE status IN ('pending', 'generated');

-- ───────────────────────────────────────────────────────────────────────────
-- 5. FUNCTION: Update aggregate scores when grade is inserted
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_skill_aggregate_scores()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE skill_registry
    SET
        total_grades = (
            SELECT COUNT(*) FROM skill_grades_v2 WHERE skill_id = NEW.skill_id
        ),
        avg_overall_score = (
            SELECT ROUND(AVG(overall_score)::numeric, 2) FROM skill_grades_v2 WHERE skill_id = NEW.skill_id
        ),
        avg_relevance = (
            SELECT ROUND(AVG(relevance_score)::numeric, 2) FROM skill_grades_v2
            WHERE skill_id = NEW.skill_id AND relevance_score IS NOT NULL
        ),
        avg_accuracy = (
            SELECT ROUND(AVG(accuracy_score)::numeric, 2) FROM skill_grades_v2
            WHERE skill_id = NEW.skill_id AND accuracy_score IS NOT NULL
        ),
        avg_completeness = (
            SELECT ROUND(AVG(completeness_score)::numeric, 2) FROM skill_grades_v2
            WHERE skill_id = NEW.skill_id AND completeness_score IS NOT NULL
        ),
        avg_clarity = (
            SELECT ROUND(AVG(clarity_score)::numeric, 2) FROM skill_grades_v2
            WHERE skill_id = NEW.skill_id AND clarity_score IS NOT NULL
        ),
        avg_actionability = (
            SELECT ROUND(AVG(actionability_score)::numeric, 2) FROM skill_grades_v2
            WHERE skill_id = NEW.skill_id AND actionability_score IS NOT NULL
        ),
        avg_professionalism = (
            SELECT ROUND(AVG(professionalism_score)::numeric, 2) FROM skill_grades_v2
            WHERE skill_id = NEW.skill_id AND professionalism_score IS NOT NULL
        ),
        updated_at = now()
    WHERE id = NEW.skill_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_skill_scores ON skill_grades_v2;
CREATE TRIGGER trigger_update_skill_scores
    AFTER INSERT ON skill_grades_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_aggregate_scores();

-- ───────────────────────────────────────────────────────────────────────────
-- 6. FUNCTION: Check if skill needs improvement
-- Returns improvement status and reason
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_skill_improvement_needed(p_skill_id TEXT)
RETURNS TABLE(
    needs_improvement BOOLEAN,
    trigger_reason TEXT,
    current_scores JSONB
) AS $$
DECLARE
    v_skill skill_registry%ROWTYPE;
    v_scores JSONB;
BEGIN
    SELECT * INTO v_skill FROM skill_registry WHERE id = p_skill_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'skill-not-found'::TEXT, '{}'::JSONB;
        RETURN;
    END IF;

    -- Build current scores object
    v_scores := jsonb_build_object(
        'overall', v_skill.avg_overall_score,
        'relevance', v_skill.avg_relevance,
        'accuracy', v_skill.avg_accuracy,
        'completeness', v_skill.avg_completeness,
        'clarity', v_skill.avg_clarity,
        'actionability', v_skill.avg_actionability,
        'professionalism', v_skill.avg_professionalism,
        'total_grades', v_skill.total_grades
    );

    -- Not enough grades yet
    IF v_skill.total_grades < v_skill.min_grades_for_improvement THEN
        RETURN QUERY SELECT
            false,
            'insufficient-grades'::TEXT,
            v_scores;
        RETURN;
    END IF;

    -- Already has pending improvement
    IF v_skill.improvement_pending THEN
        RETURN QUERY SELECT false, 'improvement-already-pending'::TEXT, v_scores;
        RETURN;
    END IF;

    -- Check overall score threshold
    IF v_skill.avg_overall_score IS NOT NULL AND v_skill.avg_overall_score < v_skill.improvement_threshold THEN
        RETURN QUERY SELECT true, 'low-overall-score'::TEXT, v_scores;
        RETURN;
    END IF;

    -- Check for weak dimensions (below 3.0)
    IF v_skill.avg_relevance IS NOT NULL AND v_skill.avg_relevance < 3.0 THEN
        RETURN QUERY SELECT true, 'weak-relevance'::TEXT, v_scores;
        RETURN;
    END IF;
    IF v_skill.avg_accuracy IS NOT NULL AND v_skill.avg_accuracy < 3.0 THEN
        RETURN QUERY SELECT true, 'weak-accuracy'::TEXT, v_scores;
        RETURN;
    END IF;
    IF v_skill.avg_completeness IS NOT NULL AND v_skill.avg_completeness < 3.0 THEN
        RETURN QUERY SELECT true, 'weak-completeness'::TEXT, v_scores;
        RETURN;
    END IF;
    IF v_skill.avg_clarity IS NOT NULL AND v_skill.avg_clarity < 3.0 THEN
        RETURN QUERY SELECT true, 'weak-clarity'::TEXT, v_scores;
        RETURN;
    END IF;
    IF v_skill.avg_actionability IS NOT NULL AND v_skill.avg_actionability < 3.0 THEN
        RETURN QUERY SELECT true, 'weak-actionability'::TEXT, v_scores;
        RETURN;
    END IF;
    IF v_skill.avg_professionalism IS NOT NULL AND v_skill.avg_professionalism < 3.0 THEN
        RETURN QUERY SELECT true, 'weak-professionalism'::TEXT, v_scores;
        RETURN;
    END IF;

    -- No improvement needed
    RETURN QUERY SELECT false, 'scores-acceptable'::TEXT, v_scores;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────────────
-- 7. FUNCTION: Create improvement request when threshold met
-- Called automatically after grade insert
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION maybe_trigger_improvement()
RETURNS TRIGGER AS $$
DECLARE
    v_check RECORD;
    v_sample_feedback TEXT[];
BEGIN
    -- Check if improvement is needed
    SELECT * INTO v_check FROM check_skill_improvement_needed(NEW.skill_id);

    IF v_check.needs_improvement THEN
        -- Get sample feedback from recent grades
        SELECT array_agg(feedback) INTO v_sample_feedback
        FROM (
            SELECT feedback
            FROM skill_grades_v2
            WHERE skill_id = NEW.skill_id
              AND feedback IS NOT NULL
              AND feedback != ''
            ORDER BY graded_at DESC
            LIMIT 10
        ) recent;

        -- Mark skill as having pending improvement
        UPDATE skill_registry
        SET improvement_pending = true,
            updated_at = now()
        WHERE id = NEW.skill_id;

        -- Create improvement request
        INSERT INTO skill_improvement_requests (
            skill_id,
            from_version,
            trigger_reason,
            score_snapshot,
            sample_feedback,
            status
        )
        SELECT
            NEW.skill_id,
            current_version,
            v_check.trigger_reason,
            v_check.current_scores,
            v_sample_feedback,
            'pending'
        FROM skill_registry WHERE id = NEW.skill_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_maybe_improvement ON skill_grades_v2;
CREATE TRIGGER trigger_maybe_improvement
    AFTER INSERT ON skill_grades_v2
    FOR EACH ROW
    EXECUTE FUNCTION maybe_trigger_improvement();

-- ───────────────────────────────────────────────────────────────────────────
-- 8. FUNCTION: Apply an approved improvement
-- Called by Edge Function after admin approval
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION apply_skill_improvement(
    p_request_id UUID,
    p_reviewer_id UUID DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_version INTEGER, error_message TEXT) AS $$
DECLARE
    v_request skill_improvement_requests%ROWTYPE;
    v_skill skill_registry%ROWTYPE;
    v_new_version INTEGER;
BEGIN
    -- Get the improvement request
    SELECT * INTO v_request
    FROM skill_improvement_requests
    WHERE id = p_request_id AND status = 'approved';

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 'Approved improvement request not found'::TEXT;
        RETURN;
    END IF;

    -- Get current skill
    SELECT * INTO v_skill FROM skill_registry WHERE id = v_request.skill_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 'Skill not found'::TEXT;
        RETURN;
    END IF;

    v_new_version := v_skill.current_version + 1;

    -- Save current version to history
    INSERT INTO skill_version_history (
        skill_id,
        version_number,
        system_instruction,
        user_prompt_template,
        created_by,
        change_reason,
        grades_received,
        avg_score_when_active
    ) VALUES (
        v_skill.id,
        v_skill.current_version,
        v_skill.current_system_instruction,
        v_skill.current_user_prompt_template,
        'system',
        'Archived before AI improvement',
        v_skill.total_grades,
        v_skill.avg_overall_score
    );

    -- Update skill with new prompts and reset scores
    UPDATE skill_registry
    SET
        current_system_instruction = v_request.proposed_system_instruction,
        current_user_prompt_template = v_request.proposed_user_prompt_template,
        current_version = v_new_version,
        improvement_pending = false,
        last_improved_at = now(),
        -- Reset scores for new version
        total_grades = 0,
        avg_overall_score = NULL,
        avg_relevance = NULL,
        avg_accuracy = NULL,
        avg_completeness = NULL,
        avg_clarity = NULL,
        avg_actionability = NULL,
        avg_professionalism = NULL,
        updated_at = now()
    WHERE id = v_request.skill_id;

    -- Update improvement request
    UPDATE skill_improvement_requests
    SET
        status = 'implemented',
        new_version = v_new_version,
        implemented_at = now(),
        reviewed_by = COALESCE(reviewed_by, p_reviewer_id),
        reviewed_at = COALESCE(reviewed_at, now())
    WHERE id = p_request_id;

    RETURN QUERY SELECT true, v_new_version, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────────────
-- 9. FUNCTION: Rollback to previous version
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rollback_skill_version(
    p_skill_id TEXT,
    p_reason TEXT DEFAULT 'Performance declined'
)
RETURNS TABLE(success BOOLEAN, restored_version INTEGER, error_message TEXT) AS $$
DECLARE
    v_previous skill_version_history%ROWTYPE;
    v_current_version INTEGER;
BEGIN
    -- Get current version
    SELECT current_version INTO v_current_version
    FROM skill_registry WHERE id = p_skill_id;

    -- Get previous version from history
    SELECT * INTO v_previous
    FROM skill_version_history
    WHERE skill_id = p_skill_id
      AND was_rolled_back = false
      AND version_number < v_current_version
    ORDER BY version_number DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 'No previous version to rollback to'::TEXT;
        RETURN;
    END IF;

    -- Restore previous version
    UPDATE skill_registry
    SET
        current_system_instruction = v_previous.system_instruction,
        current_user_prompt_template = v_previous.user_prompt_template,
        current_version = v_previous.version_number,
        improvement_pending = false,
        total_grades = 0,
        avg_overall_score = NULL,
        avg_relevance = NULL,
        avg_accuracy = NULL,
        avg_completeness = NULL,
        avg_clarity = NULL,
        avg_actionability = NULL,
        avg_professionalism = NULL,
        updated_at = now()
    WHERE id = p_skill_id;

    -- Mark the rolled-back version in history
    UPDATE skill_version_history
    SET
        was_rolled_back = true,
        rolled_back_at = now(),
        rollback_reason = p_reason
    WHERE skill_id = p_skill_id AND version_number = v_current_version;

    RETURN QUERY SELECT true, v_previous.version_number, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────────────
-- 10. ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE skill_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_grades_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_version_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_improvement_requests ENABLE ROW LEVEL SECURITY;

-- Skill registry: public read, service role write
CREATE POLICY "Skill registry is publicly readable"
    ON skill_registry FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage skill registry"
    ON skill_registry FOR ALL
    USING (auth.role() = 'service_role');

-- Grades: anyone can insert (anonymized), authenticated can read
CREATE POLICY "Anyone can submit grades"
    ON skill_grades_v2 FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view grades"
    ON skill_grades_v2 FOR SELECT
    USING (true);  -- Public for transparency

-- Version history: public read
CREATE POLICY "Version history is publicly readable"
    ON skill_version_history FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage version history"
    ON skill_version_history FOR ALL
    USING (auth.role() = 'service_role');

-- Improvement requests: public read, service role write
CREATE POLICY "Improvement requests are publicly readable"
    ON skill_improvement_requests FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage improvement requests"
    ON skill_improvement_requests FOR ALL
    USING (auth.role() = 'service_role');

-- ───────────────────────────────────────────────────────────────────────────
-- 11. HELPER VIEW: Skills needing attention
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW skills_needing_improvement AS
SELECT
    sr.id,
    sr.name,
    sr.skill_type,
    sr.current_version,
    sr.total_grades,
    sr.avg_overall_score,
    sr.avg_relevance,
    sr.avg_accuracy,
    sr.avg_completeness,
    sr.avg_clarity,
    sr.avg_actionability,
    sr.avg_professionalism,
    sr.improvement_threshold,
    sr.min_grades_for_improvement,
    sr.improvement_pending,
    CASE
        WHEN sr.total_grades < sr.min_grades_for_improvement THEN
            sr.min_grades_for_improvement - sr.total_grades
        ELSE 0
    END as grades_until_eligible,
    CASE
        WHEN sr.avg_overall_score < sr.improvement_threshold THEN 'low-overall-score'
        WHEN sr.avg_relevance < 3.0 THEN 'weak-relevance'
        WHEN sr.avg_accuracy < 3.0 THEN 'weak-accuracy'
        WHEN sr.avg_completeness < 3.0 THEN 'weak-completeness'
        WHEN sr.avg_clarity < 3.0 THEN 'weak-clarity'
        WHEN sr.avg_actionability < 3.0 THEN 'weak-actionability'
        WHEN sr.avg_professionalism < 3.0 THEN 'weak-professionalism'
        ELSE NULL
    END as weakness_detected
FROM skill_registry sr
ORDER BY
    sr.improvement_pending DESC,
    sr.avg_overall_score ASC NULLS LAST;
