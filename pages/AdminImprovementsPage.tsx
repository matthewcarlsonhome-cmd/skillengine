/**
 * AdminImprovementsPage - Skill Improvement Dashboard
 *
 * Admin interface for managing AI-powered skill prompt improvements:
 * - View skills below quality threshold
 * - Review pending improvement requests
 * - Compare current vs proposed prompts side-by-side
 * - Approve/reject/apply improvements
 * - Rollback to previous versions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  GitCompare,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  TrendingDown,
  Clock,
  Hash,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { isAdminEmail, getCurrentAppUser } from '../lib/admin';
import { supabase } from '../lib/supabase';
import {
  getAllRegisteredSkills,
  getPendingImprovementRequests,
  type SkillRegistryEntry,
  type ImprovementRequest,
} from '../lib/selfImprovement/supabaseGrading';
import { logger } from '../lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SkillWithScores extends SkillRegistryEntry {
  needsImprovement: boolean;
  weakestDimension: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const AdminImprovementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Auth check
  const currentUser = getCurrentAppUser();
  const isAdmin = currentUser?.isAdmin || (user?.email && isAdminEmail(user.email));

  // State
  const [skills, setSkills] = useState<SkillWithScores[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ImprovementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ImprovementRequest | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      addToast('Admin access required', 'error');
    }
  }, [isAdmin, navigate, addToast]);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [skillsData, requestsData] = await Promise.all([
        getAllRegisteredSkills(),
        getPendingImprovementRequests(),
      ]);

      // Process skills to add needsImprovement flag
      const processedSkills: SkillWithScores[] = skillsData.map((skill) => {
        const { scores } = skill;
        let needsImprovement = false;
        let weakestDimension: string | null = null;

        // Check if below threshold
        if (
          scores.totalGrades >= scores.minGradesForImprovement &&
          scores.averageOverall !== null &&
          scores.averageOverall < scores.improvementThreshold
        ) {
          needsImprovement = true;
        }

        // Find weakest dimension
        const dims = Object.entries(scores.dimensions).filter(
          ([, v]) => v !== null
        ) as [string, number][];
        if (dims.length > 0) {
          const weakest = dims.reduce((a, b) => (a[1] < b[1] ? a : b));
          if (weakest[1] < 3.0) {
            weakestDimension = weakest[0];
            needsImprovement = true;
          }
        }

        return { ...skill, needsImprovement, weakestDimension };
      });

      // Sort: needs improvement first, then by average score
      processedSkills.sort((a, b) => {
        if (a.needsImprovement && !b.needsImprovement) return -1;
        if (!a.needsImprovement && b.needsImprovement) return 1;
        return (a.scores.averageOverall ?? 5) - (b.scores.averageOverall ?? 5);
      });

      setSkills(processedSkills);
      setPendingRequests(requestsData);
    } catch (err) {
      logger.error('Failed to load data', { error: err instanceof Error ? err.message : String(err) });
      addToast('Failed to load improvement data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  const callEdgeFunction = async (action: string, params: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('skill-improver', {
      body: { action, ...params },
    });
    if (error) throw error;
    return data;
  };

  const handleGenerateImprovement = async (requestId: string) => {
    setActionInProgress(requestId);
    try {
      await callEdgeFunction('generate', { requestId });
      addToast('Improvement generated! Review the proposed changes.', 'success');
      await loadData();
    } catch (err) {
      logger.error('Generate failed', { error: err instanceof Error ? err.message : String(err) });
      addToast('Failed to generate improvement', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApprove = async (requestId: string) => {
    setActionInProgress(requestId);
    try {
      await callEdgeFunction('approve', { requestId, reviewerId: user?.id });
      addToast('Improvement approved', 'success');
      await loadData();
    } catch (err) {
      logger.error('Approve failed', { error: err instanceof Error ? err.message : String(err) });
      addToast('Failed to approve improvement', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    setActionInProgress(requestId);
    try {
      await callEdgeFunction('reject', { requestId, reason, reviewerId: user?.id });
      addToast('Improvement rejected', 'success');
      await loadData();
    } catch (err) {
      logger.error('Reject failed', { error: err instanceof Error ? err.message : String(err) });
      addToast('Failed to reject improvement', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApply = async (requestId: string) => {
    if (!confirm('Apply this improvement? The skill prompt will be updated for all users.')) {
      return;
    }
    setActionInProgress(requestId);
    try {
      const result = await callEdgeFunction('apply', { requestId });
      addToast(`Improvement applied! New version: ${result.newVersion}`, 'success');
      await loadData();
    } catch (err) {
      logger.error('Apply failed', { error: err instanceof Error ? err.message : String(err) });
      addToast('Failed to apply improvement', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRollback = async (skillId: string) => {
    const reason = prompt('Reason for rollback:');
    if (!reason) return;

    setActionInProgress(skillId);
    try {
      const result = await callEdgeFunction('rollback', { skillId, reason });
      addToast(`Rolled back to version ${result.restoredVersion}`, 'success');
      await loadData();
    } catch (err) {
      logger.error('Rollback failed', { error: err instanceof Error ? err.message : String(err) });
      addToast('Failed to rollback', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleSkillExpand = (skillId: string) => {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const skillsNeedingAttention = skills.filter((s) => s.needsImprovement);
  const pendingCount = pendingRequests.filter((r) => r.status === 'pending').length;
  const generatedCount = pendingRequests.filter((r) => r.status === 'generated').length;
  const approvedCount = pendingRequests.filter((r) => r.status === 'approved').length;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Skill Improvement Dashboard</h1>
            <p className="text-muted-foreground">
              Review and approve AI-generated prompt improvements
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-muted-foreground">Needs Attention</span>
          </div>
          <p className="text-3xl font-bold">{skillsNeedingAttention.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">Pending Generation</span>
          </div>
          <p className="text-3xl font-bold">{pendingCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Ready for Review</span>
          </div>
          <p className="text-3xl font-bold">{generatedCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Approved (Apply)</span>
          </div>
          <p className="text-3xl font-bold">{approvedCount}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Skills List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Skill Scores ({skills.length})
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {skills.map((skill) => {
                const isExpanded = expandedSkills.has(skill.id);
                const request = pendingRequests.find((r) => r.skillId === skill.id);

                return (
                  <div
                    key={skill.id}
                    className={`rounded-xl border bg-card transition-all ${
                      skill.needsImprovement
                        ? 'border-red-500/50 bg-red-500/5'
                        : skill.scores.improvementPending
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleSkillExpand(skill.id)}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{skill.name}</span>
                          {skill.needsImprovement && (
                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                          {skill.scores.improvementPending && (
                            <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {skill.scores.totalGrades} grades
                          </span>
                          <span
                            className={`font-medium ${
                              (skill.scores.averageOverall ?? 5) < 3.5
                                ? 'text-red-500'
                                : 'text-green-500'
                            }`}
                          >
                            {skill.scores.averageOverall?.toFixed(2) ?? 'N/A'} avg
                          </span>
                          {skill.weakestDimension && (
                            <span className="text-red-400">
                              Weak: {skill.weakestDimension}
                            </span>
                          )}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t pt-4 space-y-4">
                        {/* Dimension Scores */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Dimension Scores</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(skill.scores.dimensions).map(([dim, score]) => (
                              <div key={dim} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">{dim}:</span>
                                <span
                                  className={
                                    score !== null && score < 3.0
                                      ? 'text-red-500 font-medium'
                                      : ''
                                  }
                                >
                                  {score?.toFixed(2) ?? 'N/A'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Progress to improvement */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress to improvement eligibility</span>
                            <span>
                              {skill.scores.totalGrades} / {skill.scores.minGradesForImprovement}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                skill.scores.totalGrades >= skill.scores.minGradesForImprovement
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (skill.scores.totalGrades / skill.scores.minGradesForImprovement) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {request && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <GitCompare className="h-4 w-4 mr-1" />
                              View Request
                            </Button>
                          )}
                          {skill.currentVersion > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRollback(skill.id)}
                              disabled={actionInProgress === skill.id}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {skills.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No skills registered yet.</p>
                  <p className="text-sm mt-2">Skills are automatically registered when users grade them.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Improvement Requests */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Improvement Requests ({pendingRequests.length})
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {pendingRequests.map((request) => {
                const skill = skills.find((s) => s.id === request.skillId);
                const isProcessing = actionInProgress === request.id;

                return (
                  <div
                    key={request.id}
                    className={`rounded-xl border bg-card p-4 ${
                      selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{skill?.name || request.skillId}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>v{request.fromVersion}</span>
                          <span>•</span>
                          <span>{request.triggerReason.replace(/-/g, ' ')}</span>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-600'
                            : request.status === 'generated'
                            ? 'bg-blue-500/20 text-blue-600'
                            : request.status === 'approved'
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-gray-500/20 text-gray-600'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {/* Score snapshot */}
                    <div className="text-xs text-muted-foreground mb-3">
                      Overall: {request.scoreSnapshot.overall?.toFixed(2) ?? 'N/A'}
                    </div>

                    {/* Rationale (if generated) */}
                    {request.improvementRationale && (
                      <div className="text-sm bg-muted/50 p-3 rounded-lg mb-3">
                        <p className="font-medium text-xs text-muted-foreground mb-1">
                          AI Rationale:
                        </p>
                        <p>{request.improvementRationale}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateImprovement(request.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          Generate
                        </Button>
                      )}

                      {request.status === 'generated' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <GitCompare className="h-4 w-4 mr-1" />
                            Compare
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing}
                            className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {request.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleApply(request.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Apply to Production
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {pendingRequests.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No pending improvement requests.
                  <br />
                  <span className="text-sm">
                    Requests are created automatically when skill scores drop below threshold.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diff Modal */}
      {selectedRequest && (
        <PromptDiffModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT DIFF MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface PromptDiffModalProps {
  request: ImprovementRequest;
  onClose: () => void;
}

const PromptDiffModal: React.FC<PromptDiffModalProps> = ({ request, onClose }) => {
  const [currentPrompt, setCurrentPrompt] = useState<{
    systemInstruction: string;
    userPromptTemplate: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentPrompt = async () => {
      try {
        const { data } = await supabase
          .from('skill_registry')
          .select('current_system_instruction, current_user_prompt_template')
          .eq('id', request.skillId)
          .single();

        if (data) {
          setCurrentPrompt({
            systemInstruction: data.current_system_instruction,
            userPromptTemplate: data.current_user_prompt_template,
          });
        }
      } catch (err) {
        logger.error('Failed to fetch current prompt', { error: err instanceof Error ? err.message : String(err) });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentPrompt();
  }, [request.skillId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Prompt Comparison
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {request.skillId} • v{request.fromVersion} → v{request.fromVersion + 1}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* System Instruction Comparison */}
              <div>
                <h3 className="text-lg font-semibold mb-4">System Instruction</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Current (v{request.fromVersion})
                    </h4>
                    <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                      {currentPrompt?.systemInstruction || 'Loading...'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Proposed (v{request.fromVersion + 1})
                    </h4>
                    <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                      {request.proposedSystemInstruction || 'Not generated yet'}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Prompt Template Comparison */}
              <div>
                <h3 className="text-lg font-semibold mb-4">User Prompt Template</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Current
                    </h4>
                    <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {currentPrompt?.userPromptTemplate || 'Loading...'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Proposed
                    </h4>
                    <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {request.proposedUserPromptTemplate || 'Not generated yet'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              {request.improvementRationale && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Rationale</h3>
                  <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                    <p>{request.improvementRationale}</p>
                  </div>
                </div>
              )}

              {/* Score Snapshot */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Scores at Time of Request</h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(request.scoreSnapshot).map(([key, value]) => (
                    <div key={key} className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      <p
                        className={`text-lg font-bold ${
                          typeof value === 'number' && value < 3.5 ? 'text-red-500' : ''
                        }`}
                      >
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Feedback */}
              {request.sampleFeedback && request.sampleFeedback.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sample User Feedback</h3>
                  <div className="space-y-2">
                    {request.sampleFeedback.slice(0, 5).map((feedback, i) => (
                      <div
                        key={i}
                        className="bg-muted/50 p-3 rounded-lg text-sm italic text-muted-foreground"
                      >
                        "{feedback}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminImprovementsPage;
