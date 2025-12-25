/**
 * Improvement Dashboard Page
 *
 * Admin interface for reviewing and managing skill improvement requests.
 * Shows pending improvements, allows approval/rejection, and displays history.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Target,
  BookOpen,
  Zap,
  Award,
  BarChart3,
  History,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { cn } from '../lib/theme';
import type {
  ImprovementRequest,
  IssueAnalysis,
  ProposedChange,
  SkillImprovementHistory,
  QualityDimension,
} from '../lib/selfImprovement/types';
import {
  applyImprovements,
  rollbackVersion,
  getImprovementHistory,
} from '../lib/selfImprovement';
import { logger } from '../lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const StatusBadge: React.FC<{ status: ImprovementRequest['status'] }> = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    approved: 'bg-blue-500/20 text-blue-500',
    rejected: 'bg-red-500/20 text-red-500',
    implemented: 'bg-green-500/20 text-green-500',
    'rolled-back': 'bg-orange-500/20 text-orange-500',
  };

  const icons = {
    pending: <Clock className="h-3 w-3" />,
    approved: <CheckCircle className="h-3 w-3" />,
    rejected: <XCircle className="h-3 w-3" />,
    implemented: <CheckCircle className="h-3 w-3" />,
    'rolled-back': <RotateCcw className="h-3 w-3" />,
  };

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', styles[status])}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

const DimensionIcon: React.FC<{ dimension: QualityDimension }> = ({ dimension }) => {
  const icons: Record<QualityDimension, React.ReactNode> = {
    relevance: <Target className="h-4 w-4" />,
    accuracy: <CheckCircle className="h-4 w-4" />,
    completeness: <BookOpen className="h-4 w-4" />,
    clarity: <Sparkles className="h-4 w-4" />,
    actionability: <Zap className="h-4 w-4" />,
    professionalism: <Award className="h-4 w-4" />,
  };
  return <>{icons[dimension]}</>;
};

const ScoreBar: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const percentage = (score / 5) * 100;
  const color = score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score.toFixed(1)}/5</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE ANALYSIS PANEL
// ═══════════════════════════════════════════════════════════════════════════

const IssueAnalysisPanel: React.FC<{ analysis: IssueAnalysis }> = ({ analysis }) => {
  return (
    <div className="space-y-4">
      {/* Score overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold">{analysis.averageScore.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Average Score</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold">{analysis.sampleSize}</div>
          <div className="text-sm text-muted-foreground">Total Grades</div>
        </div>
      </div>

      {/* Score distribution */}
      <div className="p-4 rounded-lg border">
        <h4 className="font-medium mb-3">Score Distribution</h4>
        <div className="flex items-end gap-2 h-24">
          {analysis.scoreDistribution.map(({ score, count }) => {
            const maxCount = Math.max(...analysis.scoreDistribution.map((d) => d.count), 1);
            const height = (count / maxCount) * 100;
            return (
              <div key={score} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full rounded-t transition-all',
                    score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-muted-foreground">{score}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weakest dimensions */}
      {analysis.weakestDimensions.length > 0 && (
        <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <h4 className="font-medium mb-2 flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="h-4 w-4" />
            Weak Dimensions
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.weakestDimensions.map((dim) => (
              <span key={dim} className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm capitalize">
                <DimensionIcon dimension={dim} />
                {dim}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Common issues */}
      {analysis.commonIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Common Issues</h4>
          <ul className="space-y-1">
            {analysis.commonIssues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-500 mt-0.5">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback themes */}
      {analysis.feedbackThemes.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">User Feedback Themes</h4>
          {analysis.feedbackThemes.map((theme, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{theme.theme}</span>
                <span className="text-xs text-muted-foreground">{theme.frequency} mentions</span>
              </div>
              {theme.exampleFeedback.length > 0 && (
                <div className="text-xs text-muted-foreground italic">
                  "{theme.exampleFeedback[0]}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PROPOSED CHANGES PANEL
// ═══════════════════════════════════════════════════════════════════════════

const ProposedChangesPanel: React.FC<{ changes: ProposedChange[] }> = ({ changes }) => {
  const [expandedChange, setExpandedChange] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {changes.map((change) => (
        <div key={change.id} className="rounded-lg border overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            onClick={() => setExpandedChange(expandedChange === change.id ? null : change.id)}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  change.confidence === 'high' && 'bg-green-500/20 text-green-500',
                  change.confidence === 'medium' && 'bg-yellow-500/20 text-yellow-500',
                  change.confidence === 'low' && 'bg-red-500/20 text-red-500'
                )}
              >
                {change.confidence} confidence
              </span>
              <span className="font-medium capitalize">{change.changeType.replace('-', ' ')}</span>
            </div>
            {expandedChange === change.id ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedChange === change.id && (
            <div className="px-4 pb-4 space-y-4 border-t pt-4">
              <div>
                <h5 className="text-sm font-medium mb-1">Rationale</h5>
                <p className="text-sm text-muted-foreground">{change.rationale}</p>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-1">Expected Impact</h5>
                <p className="text-sm text-muted-foreground">{change.expectedImpact}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-1 text-red-500">Before (excerpt)</h5>
                  <pre className="text-xs bg-red-500/10 p-3 rounded overflow-auto max-h-32">
                    {change.oldValue}
                  </pre>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1 text-green-500">After (excerpt)</h5>
                  <pre className="text-xs bg-green-500/10 p-3 rounded overflow-auto max-h-32">
                    {change.newValue}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// IMPROVEMENT REQUEST CARD
// ═══════════════════════════════════════════════════════════════════════════

interface RequestCardProps {
  request: ImprovementRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
  isProcessing: boolean;
}

const ImprovementRequestCard: React.FC<RequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isProcessing,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const handleReject = () => {
    onReject(request.id, rejectNotes);
    setShowRejectForm(false);
    setRejectNotes('');
  };

  const triggerLabels: Record<string, string> = {
    'low-score-threshold': 'Low Score Threshold',
    'dimension-weakness': 'Dimension Weakness',
    'user-feedback-pattern': 'User Feedback Pattern',
    'manual-request': 'Manual Request',
    'periodic-review': 'Periodic Review',
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Skill: {request.skillId}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{triggerLabels[request.triggerReason] || request.triggerReason}</span>
              <span>•</span>
              <span>{new Date(request.triggeredAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 divide-x border-b">
        <div className="p-3 text-center">
          <div className="text-lg font-semibold">{request.issueAnalysis.averageScore.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Avg Score</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold">{request.issueAnalysis.sampleSize}</div>
          <div className="text-xs text-muted-foreground">Grades</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold">{request.proposedChanges.length}</div>
          <div className="text-xs text-muted-foreground">Changes</div>
        </div>
      </div>

      {/* Expandable details */}
      <button
        className="w-full flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Eye className="h-4 w-4" />
        {expanded ? 'Hide Details' : 'View Details'}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-6 border-t">
          {/* Issue Analysis */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Issue Analysis
            </h4>
            <IssueAnalysisPanel analysis={request.issueAnalysis} />
          </div>

          {/* Proposed Changes */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Proposed Changes
            </h4>
            <ProposedChangesPanel changes={request.proposedChanges} />
          </div>
        </div>
      )}

      {/* Actions */}
      {request.status === 'pending' && (
        <div className="p-4 border-t bg-muted/30">
          {showRejectForm ? (
            <div className="space-y-3">
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Why are you rejecting this improvement?"
                rows={2}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowRejectForm(false)} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
                  Confirm Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => onApprove(request.id)} disabled={isProcessing}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Apply
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRejectForm(true)}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Review info */}
      {request.reviewedAt && (
        <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
          Reviewed by {request.reviewedBy || 'Admin'} on {new Date(request.reviewedAt).toLocaleString()}
          {request.reviewNotes && <span> - {request.reviewNotes}</span>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL HISTORY PANEL
// ═══════════════════════════════════════════════════════════════════════════

const SkillHistoryPanel: React.FC<{
  history: SkillImprovementHistory;
  onRollback: (skillId: string) => void;
}> = ({ history, onRollback }) => {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <History className="h-5 w-5" />
        {history.skillName || history.skillId}
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="text-xl font-bold">v{history.currentVersion}</div>
          <div className="text-xs text-muted-foreground">Current</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="text-xl font-bold">{history.currentScore.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="text-xl font-bold">{history.successfulImprovements}</div>
          <div className="text-xs text-muted-foreground">Improvements</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="text-xl font-bold">{history.gradesUntilNextReview}</div>
          <div className="text-xs text-muted-foreground">Until Review</div>
        </div>
      </div>

      {/* Score trajectory chart (simple text version) */}
      {history.scoreTrajectory.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Score Over Time</h4>
          <div className="h-20 flex items-end gap-1">
            {history.scoreTrajectory.slice(-20).map((point, i) => {
              const height = (point.score / 5) * 100;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-t transition-all',
                    point.score >= 4 ? 'bg-green-500' : point.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ height: `${height}%` }}
                  title={`${point.date}: ${point.score.toFixed(1)}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Version history */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Version History</h4>
        {history.versions.slice(-5).reverse().map((version) => (
          <div
            key={version.versionId}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border',
              version.wasRolledBack && 'opacity-50'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">v{version.version}</span>
              <ScoreBar score={version.averageScore} label="" />
              <span className="text-xs text-muted-foreground">({version.gradeCount} grades)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(version.createdAt).toLocaleDateString()}</span>
              {version.wasRolledBack && (
                <span className="text-orange-500">Rolled back</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rollback button */}
      {history.versions.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => onRollback(history.skillId)}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Rollback to Previous Version
        </Button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

const ImprovementDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [requests, setRequests] = useState<ImprovementRequest[]>([]);
  const [histories, setHistories] = useState<SkillImprovementHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'history'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      // Load from localStorage (would be API in production)
      const storedRequests = localStorage.getItem('improvement_requests');
      if (storedRequests) {
        setRequests(JSON.parse(storedRequests));
      }

      // Load skill histories
      const storedVersions = localStorage.getItem('skill_versions');
      if (storedVersions) {
        const versions = JSON.parse(storedVersions);
        const skillIds = [...new Set(versions.map((v: any) => v.skillId))];
        const loadedHistories = skillIds.map((id) => getImprovementHistory(id as string));
        setHistories(loadedHistories);
      }
    } catch (e) {
      logger.error('Failed to load improvement data', { error: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle approve
  const handleApprove = async (requestId: string) => {
    setIsProcessing(true);
    try {
      await applyImprovements(requestId);
      loadData(); // Reload to get updated state
    } catch (e) {
      logger.error('Failed to apply improvements', { error: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject
  const handleReject = (requestId: string, notes: string) => {
    try {
      const storedRequests = localStorage.getItem('improvement_requests');
      if (storedRequests) {
        const allRequests: ImprovementRequest[] = JSON.parse(storedRequests);
        const updated = allRequests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'rejected' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'admin',
                reviewNotes: notes,
              }
            : r
        );
        localStorage.setItem('improvement_requests', JSON.stringify(updated));
        setRequests(updated);
      }
    } catch (e) {
      logger.error('Failed to reject improvement', { error: e instanceof Error ? e.message : String(e) });
    }
  };

  // Handle rollback
  const handleRollback = async (skillId: string) => {
    if (!confirm('Are you sure you want to rollback to the previous version?')) return;

    setIsProcessing(true);
    try {
      await rollbackVersion(skillId, 'Manual rollback from dashboard');
      loadData();
    } catch (e) {
      logger.error('Failed to rollback', { error: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter requests
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const displayedRequests = activeTab === 'pending' ? pendingRequests : requests;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Skill Improvement Dashboard
            </h1>
            <p className="text-muted-foreground">Review and manage AI-proposed skill improvements</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {requests.filter((r) => r.status === 'implemented').length}
              </div>
              <div className="text-sm text-muted-foreground">Implemented</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {requests.filter((r) => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{histories.length}</div>
              <div className="text-sm text-muted-foreground">Skills Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingRequests.length})
        </Button>
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          All Requests
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
        >
          <History className="h-4 w-4 mr-2" />
          Skill History
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'history' ? (
        <div className="space-y-6">
          {histories.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Skill History Yet</h3>
              <p className="text-sm text-muted-foreground">
                Skill versions and improvement history will appear here as users grade skill outputs.
              </p>
            </div>
          ) : (
            histories.map((history) => (
              <SkillHistoryPanel key={history.skillId} history={history} onRollback={handleRollback} />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayedRequests.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">
                {activeTab === 'pending' ? 'No Pending Improvements' : 'No Improvement Requests'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'pending'
                  ? 'All improvement requests have been reviewed.'
                  : 'Improvement requests will appear here as skills collect user feedback.'}
              </p>
            </div>
          ) : (
            displayedRequests.map((request) => (
              <ImprovementRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ImprovementDashboardPage;
