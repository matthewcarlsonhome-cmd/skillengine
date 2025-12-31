-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Fix SECURITY DEFINER on skills_needing_improvement view
-- Issue: View was running with owner privileges, bypassing RLS
-- Fix: Recreate with SECURITY INVOKER (caller's privileges)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop and recreate the view with explicit SECURITY INVOKER
-- This ensures the view respects the querying user's permissions and RLS policies

DROP VIEW IF EXISTS skills_needing_improvement;

CREATE VIEW skills_needing_improvement
WITH (security_invoker = true) AS
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

-- Grant appropriate access (adjust roles as needed for your setup)
-- The view will now respect RLS policies on skill_registry
GRANT SELECT ON skills_needing_improvement TO authenticated;
GRANT SELECT ON skills_needing_improvement TO service_role;

-- Add comment explaining the security model
COMMENT ON VIEW skills_needing_improvement IS
'Helper view for identifying skills that need improvement based on grading scores.
Uses SECURITY INVOKER to respect caller permissions and RLS policies on skill_registry.';
