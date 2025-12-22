/**
 * Skill Improver Edge Function
 *
 * Handles AI-powered skill prompt improvement based on user feedback.
 * Called when a skill's scores fall below threshold after 50+ ratings.
 *
 * Endpoints:
 * - POST { action: 'generate', requestId } - Generate improvement for a pending request
 * - POST { action: 'approve', requestId } - Approve an improvement request
 * - POST { action: 'reject', requestId, reason } - Reject an improvement request
 * - POST { action: 'apply', requestId } - Apply an approved improvement
 * - POST { action: 'rollback', skillId, reason } - Rollback to previous version
 * - POST { action: 'status', skillId } - Get improvement status for a skill
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY')!;

    if (!claudeApiKey) {
      return jsonResponse({ error: 'CLAUDE_API_KEY not configured' }, 503);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const body = await req.json();
    const { action, requestId, skillId, reason, reviewerId } = body;

    // Route to appropriate handler
    switch (action) {
      case 'generate':
        return await generateImprovement(supabase, claudeApiKey, requestId);

      case 'approve':
        return await approveImprovement(supabase, requestId, reviewerId);

      case 'reject':
        return await rejectImprovement(supabase, requestId, reason, reviewerId);

      case 'apply':
        return await applyImprovement(supabase, requestId);

      case 'rollback':
        return await rollbackVersion(supabase, skillId, reason);

      case 'status':
        return await getImprovementStatus(supabase, skillId);

      case 'pending':
        return await getPendingImprovements(supabase);

      default:
        return jsonResponse({ error: `Invalid action: ${action}` }, 400);
    }
  } catch (error) {
    console.error('Skill Improver Error:', error);
    return jsonResponse({ error: error.message || 'Internal server error' }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate an AI-improved prompt for a pending improvement request
 */
async function generateImprovement(
  supabase: ReturnType<typeof createClient>,
  claudeApiKey: string,
  requestId: string
): Promise<Response> {
  // 1. Get the improvement request
  const { data: request, error: reqError } = await supabase
    .from('skill_improvement_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (reqError || !request) {
    return jsonResponse({ error: 'Improvement request not found' }, 404);
  }

  if (request.status !== 'pending') {
    return jsonResponse({ error: `Request is not pending (status: ${request.status})` }, 400);
  }

  // 2. Get the current skill
  const { data: skill, error: skillError } = await supabase
    .from('skill_registry')
    .select('*')
    .eq('id', request.skill_id)
    .single();

  if (skillError || !skill) {
    return jsonResponse({ error: 'Skill not found' }, 404);
  }

  // 3. Build the improvement prompt
  const improvementPrompt = buildImprovementPrompt(skill, request);

  // 4. Call Claude to generate improved prompt
  console.log(`Generating improvement for skill: ${skill.id}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: IMPROVEMENT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: improvementPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', errorText);
    return jsonResponse({ error: 'Failed to call Claude API' }, 502);
  }

  const claudeResponse = await response.json();
  const improvedContent = claudeResponse.content?.[0]?.text;

  if (!improvedContent) {
    return jsonResponse({ error: 'Empty response from Claude' }, 500);
  }

  // 5. Parse the improved prompt from Claude's response
  const parsed = parseImprovementResponse(improvedContent);

  if (!parsed.systemInstruction || !parsed.userPromptTemplate) {
    return jsonResponse({
      error: 'Failed to parse improvement response',
      rawResponse: improvedContent.slice(0, 500),
    }, 500);
  }

  // 6. Update the improvement request with proposed changes
  const { error: updateError } = await supabase
    .from('skill_improvement_requests')
    .update({
      proposed_system_instruction: parsed.systemInstruction,
      proposed_user_prompt_template: parsed.userPromptTemplate,
      improvement_rationale: parsed.rationale,
      status: 'generated',
    })
    .eq('id', requestId);

  if (updateError) {
    console.error('Failed to update request:', updateError);
    return jsonResponse({ error: 'Failed to save improvement' }, 500);
  }

  return jsonResponse({
    success: true,
    requestId,
    proposed: {
      systemInstruction: parsed.systemInstruction.slice(0, 500) + '...',
      userPromptTemplate: parsed.userPromptTemplate.slice(0, 500) + '...',
      rationale: parsed.rationale,
    },
  });
}

/**
 * Approve an improvement request (admin action)
 */
async function approveImprovement(
  supabase: ReturnType<typeof createClient>,
  requestId: string,
  reviewerId?: string
): Promise<Response> {
  const { data: request, error } = await supabase
    .from('skill_improvement_requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (error || !request) {
    return jsonResponse({ error: 'Improvement request not found' }, 404);
  }

  if (request.status !== 'generated') {
    return jsonResponse({ error: `Cannot approve request with status: ${request.status}` }, 400);
  }

  const { error: updateError } = await supabase
    .from('skill_improvement_requests')
    .update({
      status: 'approved',
      reviewed_by: reviewerId || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) {
    return jsonResponse({ error: 'Failed to approve request' }, 500);
  }

  return jsonResponse({ success: true, status: 'approved' });
}

/**
 * Reject an improvement request (admin action)
 */
async function rejectImprovement(
  supabase: ReturnType<typeof createClient>,
  requestId: string,
  reason: string,
  reviewerId?: string
): Promise<Response> {
  const { error: updateError } = await supabase
    .from('skill_improvement_requests')
    .update({
      status: 'rejected',
      review_notes: reason || 'Rejected by admin',
      reviewed_by: reviewerId || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) {
    return jsonResponse({ error: 'Failed to reject request' }, 500);
  }

  // Clear pending flag on skill
  const { data: request } = await supabase
    .from('skill_improvement_requests')
    .select('skill_id')
    .eq('id', requestId)
    .single();

  if (request) {
    await supabase
      .from('skill_registry')
      .update({ improvement_pending: false })
      .eq('id', request.skill_id);
  }

  return jsonResponse({ success: true, status: 'rejected' });
}

/**
 * Apply an approved improvement
 */
async function applyImprovement(
  supabase: ReturnType<typeof createClient>,
  requestId: string
): Promise<Response> {
  // Use the database function to apply the improvement
  const { data, error } = await supabase.rpc('apply_skill_improvement', {
    p_request_id: requestId,
  });

  if (error) {
    console.error('Failed to apply improvement:', error);
    return jsonResponse({ error: error.message }, 500);
  }

  const result = data?.[0];
  if (!result?.success) {
    return jsonResponse({ error: result?.error_message || 'Unknown error' }, 400);
  }

  return jsonResponse({
    success: true,
    newVersion: result.new_version,
  });
}

/**
 * Rollback to previous version
 */
async function rollbackVersion(
  supabase: ReturnType<typeof createClient>,
  skillId: string,
  reason: string
): Promise<Response> {
  if (!skillId) {
    return jsonResponse({ error: 'skillId is required' }, 400);
  }

  // Use the database function to rollback
  const { data, error } = await supabase.rpc('rollback_skill_version', {
    p_skill_id: skillId,
    p_reason: reason || 'Manual rollback',
  });

  if (error) {
    console.error('Failed to rollback:', error);
    return jsonResponse({ error: error.message }, 500);
  }

  const result = data?.[0];
  if (!result?.success) {
    return jsonResponse({ error: result?.error_message || 'No previous version available' }, 400);
  }

  return jsonResponse({
    success: true,
    restoredVersion: result.restored_version,
  });
}

/**
 * Get improvement status for a skill
 */
async function getImprovementStatus(
  supabase: ReturnType<typeof createClient>,
  skillId: string
): Promise<Response> {
  if (!skillId) {
    return jsonResponse({ error: 'skillId is required' }, 400);
  }

  // Get skill info
  const { data: skill, error: skillError } = await supabase
    .from('skill_registry')
    .select('*')
    .eq('id', skillId)
    .single();

  if (skillError || !skill) {
    return jsonResponse({ error: 'Skill not found' }, 404);
  }

  // Get pending/active improvement requests
  const { data: requests } = await supabase
    .from('skill_improvement_requests')
    .select('*')
    .eq('skill_id', skillId)
    .in('status', ['pending', 'generated', 'approved'])
    .order('triggered_at', { ascending: false })
    .limit(1);

  // Get version history
  const { data: history } = await supabase
    .from('skill_version_history')
    .select('*')
    .eq('skill_id', skillId)
    .order('version_number', { ascending: false })
    .limit(5);

  // Check if improvement is needed
  const { data: checkResult } = await supabase.rpc('check_skill_improvement_needed', {
    p_skill_id: skillId,
  });

  return jsonResponse({
    skill: {
      id: skill.id,
      name: skill.name,
      currentVersion: skill.current_version,
      totalGrades: skill.total_grades,
      minGradesRequired: skill.min_grades_for_improvement,
      gradesUntilEligible: Math.max(0, skill.min_grades_for_improvement - skill.total_grades),
      improvementPending: skill.improvement_pending,
      lastImprovedAt: skill.last_improved_at,
    },
    scores: {
      overall: skill.avg_overall_score,
      relevance: skill.avg_relevance,
      accuracy: skill.avg_accuracy,
      completeness: skill.avg_completeness,
      clarity: skill.avg_clarity,
      actionability: skill.avg_actionability,
      professionalism: skill.avg_professionalism,
      threshold: skill.improvement_threshold,
    },
    improvementCheck: checkResult?.[0] || null,
    activeRequest: requests?.[0] || null,
    versionHistory: history || [],
  });
}

/**
 * Get all pending improvement requests
 */
async function getPendingImprovements(
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const { data: requests, error } = await supabase
    .from('skill_improvement_requests')
    .select(`
      *,
      skill:skill_registry(id, name, skill_type, current_version)
    `)
    .in('status', ['pending', 'generated', 'approved'])
    .order('triggered_at', { ascending: false });

  if (error) {
    return jsonResponse({ error: 'Failed to fetch pending improvements' }, 500);
  }

  return jsonResponse({
    requests: requests || [],
    count: requests?.length || 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT ENGINEERING
// ═══════════════════════════════════════════════════════════════════════════

const IMPROVEMENT_SYSTEM_PROMPT = `You are an expert prompt engineer specializing in improving AI skill prompts based on user feedback data.

Your task is to analyze a skill's current prompt, its performance scores across 6 quality dimensions, and user feedback to generate an improved version that addresses the identified weaknesses.

QUALITY DIMENSIONS:
1. Relevance (1-5): Output matches what the user asked for
2. Accuracy (1-5): Information is correct and reliable
3. Completeness (1-5): All aspects of the request are addressed
4. Clarity (1-5): Output is clear and well-organized
5. Actionability (1-5): Output provides actionable guidance
6. Professionalism (1-5): Tone and format are appropriate

IMPROVEMENT GUIDELINES:
1. Preserve the core intent and structure of the original prompt
2. Make targeted improvements based on the specific weak dimensions
3. Add explicit instructions to address common complaints from feedback
4. Keep improvements focused and minimal - don't over-engineer
5. Maintain the same output format expectations
6. Preserve all {{placeholders}} exactly as they appear in the original

DIMENSION-SPECIFIC IMPROVEMENTS:
- Low Relevance: Add explicit intent-matching instructions, require output to reference user's specific inputs
- Low Accuracy: Add verification requirements, source citation guidelines, confidence indicators
- Low Completeness: Add checklists, require addressing all input fields, add "before submitting" verification
- Low Clarity: Add formatting requirements (headers, bullets, bold), structure guidelines, length constraints
- Low Actionability: Require specific steps, concrete examples, implementation guidance for each recommendation
- Low Professionalism: Add tone guidelines, formatting standards, audience-appropriate language requirements

OUTPUT FORMAT:
Return your response in this exact XML structure:

<system_instruction>
[The complete improved system instruction - include ALL original content plus your improvements]
</system_instruction>

<user_prompt_template>
[The improved user prompt template with {{placeholders}} preserved exactly]
</user_prompt_template>

<rationale>
[2-3 sentences explaining what was changed and why, referencing specific scores/feedback]
</rationale>`;

function buildImprovementPrompt(skill: any, request: any): string {
  const scores = request.score_snapshot || {};
  const feedback = request.sample_feedback || [];

  // Identify weakest dimensions
  const dimensions = [
    { name: 'overall', score: scores.overall },
    { name: 'relevance', score: scores.relevance },
    { name: 'accuracy', score: scores.accuracy },
    { name: 'completeness', score: scores.completeness },
    { name: 'clarity', score: scores.clarity },
    { name: 'actionability', score: scores.actionability },
    { name: 'professionalism', score: scores.professionalism },
  ].filter(d => d.score !== null && d.score !== undefined);

  const weakDimensions = dimensions
    .filter(d => d.score < 3.5)
    .sort((a, b) => a.score - b.score)
    .map(d => `${d.name} (${d.score.toFixed(1)})`);

  return `
SKILL: ${skill.name}
ID: ${skill.id}
TYPE: ${skill.skill_type}
CURRENT VERSION: ${skill.current_version}
TOTAL GRADES: ${scores.total_grades || skill.total_grades || 'Unknown'}

═══════════════════════════════════════════════════════════════════════════
CURRENT SYSTEM INSTRUCTION:
═══════════════════════════════════════════════════════════════════════════
${skill.current_system_instruction}

═══════════════════════════════════════════════════════════════════════════
CURRENT USER PROMPT TEMPLATE:
═══════════════════════════════════════════════════════════════════════════
${skill.current_user_prompt_template}

═══════════════════════════════════════════════════════════════════════════
PERFORMANCE SCORES (out of 5.0):
═══════════════════════════════════════════════════════════════════════════
Overall:        ${scores.overall?.toFixed(2) || 'N/A'}
Relevance:      ${scores.relevance?.toFixed(2) || 'N/A'}
Accuracy:       ${scores.accuracy?.toFixed(2) || 'N/A'}
Completeness:   ${scores.completeness?.toFixed(2) || 'N/A'}
Clarity:        ${scores.clarity?.toFixed(2) || 'N/A'}
Actionability:  ${scores.actionability?.toFixed(2) || 'N/A'}
Professionalism: ${scores.professionalism?.toFixed(2) || 'N/A'}

TRIGGER REASON: ${request.trigger_reason}
WEAK DIMENSIONS: ${weakDimensions.join(', ') || 'None identified'}

═══════════════════════════════════════════════════════════════════════════
USER FEEDBACK SAMPLES (anonymized):
═══════════════════════════════════════════════════════════════════════════
${feedback.length > 0
    ? feedback.map((f: string, i: number) => `${i + 1}. "${f}"`).join('\n')
    : 'No written feedback provided - rely on dimension scores for guidance'}

═══════════════════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════════════════
Improve this skill's prompts to address the weak scores and user feedback.
Focus especially on improving: ${weakDimensions.slice(0, 3).join(', ') || request.trigger_reason}

Remember:
- Preserve all {{placeholder}} syntax exactly
- Keep the core structure and intent
- Add targeted improvements, don't rewrite everything
- The improved prompt should help future outputs score higher on the weak dimensions
`;
}

function parseImprovementResponse(response: string): {
  systemInstruction: string;
  userPromptTemplate: string;
  rationale: string;
} {
  const systemMatch = response.match(/<system_instruction>([\s\S]*?)<\/system_instruction>/);
  const templateMatch = response.match(/<user_prompt_template>([\s\S]*?)<\/user_prompt_template>/);
  const rationaleMatch = response.match(/<rationale>([\s\S]*?)<\/rationale>/);

  return {
    systemInstruction: systemMatch?.[1]?.trim() || '',
    userPromptTemplate: templateMatch?.[1]?.trim() || '',
    rationale: rationaleMatch?.[1]?.trim() || 'No rationale provided',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
