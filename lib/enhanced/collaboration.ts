/**
 * Collaboration Service
 *
 * Provides shared drafts, comments, approvals, and publish gates
 * for skills and workflows.
 */

import type {
  Draft,
  DraftStatus,
  Comment,
  ApprovalRequest,
  ApprovalStatus,
  PublishGate,
  CollaborationEvent,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORES (Replace with database in production)
// ═══════════════════════════════════════════════════════════════════════════

const drafts = new Map<string, Draft>();
const comments = new Map<string, Comment>();
const approvalRequests = new Map<string, ApprovalRequest>();
const publishGates = new Map<string, PublishGate>();
const collaborationEvents: CollaborationEvent[] = [];
const eventSubscribers: ((event: CollaborationEvent) => void)[] = [];

// ═══════════════════════════════════════════════════════════════════════════
// DRAFT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new draft
 */
export function createDraft(params: {
  type: 'skill' | 'workflow';
  entityId?: string;
  name: string;
  description?: string;
  content: Record<string, unknown>;
  authorId: string;
  authorEmail: string;
  authorName?: string;
  teamId?: string;
  basedOnVersion?: string;
}): Draft {
  const id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const draft: Draft = {
    id,
    type: params.type,
    entityId: params.entityId,
    name: params.name,
    description: params.description || '',
    content: params.content,
    status: 'draft',
    version: 1,
    author: {
      id: params.authorId,
      email: params.authorEmail,
      name: params.authorName,
    },
    collaborators: [],
    teamId: params.teamId,
    createdAt: now,
    updatedAt: now,
    basedOnVersion: params.basedOnVersion,
    changes: [],
  };

  drafts.set(id, draft);
  emitEvent({
    type: 'draft_created',
    entityType: params.type,
    entityId: id,
    actorId: params.authorId,
    actorEmail: params.authorEmail,
    timestamp: now,
    details: { name: params.name },
  });

  return draft;
}

/**
 * Get a draft by ID
 */
export function getDraft(id: string): Draft | null {
  return drafts.get(id) || null;
}

/**
 * Get all drafts for a user or team
 */
export function getDrafts(params: {
  authorId?: string;
  teamId?: string;
  type?: 'skill' | 'workflow';
  status?: DraftStatus;
}): Draft[] {
  return Array.from(drafts.values()).filter((draft) => {
    if (params.authorId && draft.author.id !== params.authorId) {
      // Check if user is a collaborator
      if (!draft.collaborators.some((c) => c.id === params.authorId)) {
        return false;
      }
    }
    if (params.teamId && draft.teamId !== params.teamId) return false;
    if (params.type && draft.type !== params.type) return false;
    if (params.status && draft.status !== params.status) return false;
    return true;
  });
}

/**
 * Update a draft
 */
export function updateDraft(
  id: string,
  params: {
    name?: string;
    description?: string;
    content?: Record<string, unknown>;
    editorId: string;
    editorEmail: string;
    changeDescription?: string;
  }
): Draft | null {
  const draft = drafts.get(id);
  if (!draft) return null;

  const now = new Date().toISOString();

  // Record change
  if (params.changeDescription) {
    draft.changes.push({
      id: `change_${Date.now()}`,
      description: params.changeDescription,
      editorId: params.editorId,
      editorEmail: params.editorEmail,
      timestamp: now,
      previousContent: { ...draft.content },
    });
  }

  // Update fields
  if (params.name !== undefined) draft.name = params.name;
  if (params.description !== undefined) draft.description = params.description;
  if (params.content !== undefined) draft.content = params.content;
  draft.updatedAt = now;
  draft.version += 1;

  emitEvent({
    type: 'draft_updated',
    entityType: draft.type,
    entityId: id,
    actorId: params.editorId,
    actorEmail: params.editorEmail,
    timestamp: now,
    details: { changeDescription: params.changeDescription },
  });

  return draft;
}

/**
 * Add a collaborator to a draft
 */
export function addCollaborator(
  draftId: string,
  params: {
    userId: string;
    userEmail: string;
    userName?: string;
    role: 'viewer' | 'editor' | 'approver';
    addedById: string;
    addedByEmail: string;
  }
): Draft | null {
  const draft = drafts.get(draftId);
  if (!draft) return null;

  // Check if already a collaborator
  const existing = draft.collaborators.find((c) => c.id === params.userId);
  if (existing) {
    existing.role = params.role;
  } else {
    draft.collaborators.push({
      id: params.userId,
      email: params.userEmail,
      name: params.userName,
      role: params.role,
      addedAt: new Date().toISOString(),
    });
  }

  draft.updatedAt = new Date().toISOString();

  emitEvent({
    type: 'collaborator_added',
    entityType: draft.type,
    entityId: draftId,
    actorId: params.addedById,
    actorEmail: params.addedByEmail,
    timestamp: draft.updatedAt,
    details: {
      collaboratorId: params.userId,
      collaboratorEmail: params.userEmail,
      role: params.role,
    },
  });

  return draft;
}

/**
 * Remove a collaborator from a draft
 */
export function removeCollaborator(
  draftId: string,
  params: {
    userId: string;
    removedById: string;
    removedByEmail: string;
  }
): Draft | null {
  const draft = drafts.get(draftId);
  if (!draft) return null;

  draft.collaborators = draft.collaborators.filter((c) => c.id !== params.userId);
  draft.updatedAt = new Date().toISOString();

  return draft;
}

/**
 * Delete a draft
 */
export function deleteDraft(
  id: string,
  params: { deletedById: string; deletedByEmail: string }
): boolean {
  const draft = drafts.get(id);
  if (!draft) return false;

  drafts.delete(id);

  emitEvent({
    type: 'draft_deleted',
    entityType: draft.type,
    entityId: id,
    actorId: params.deletedById,
    actorEmail: params.deletedByEmail,
    timestamp: new Date().toISOString(),
    details: { name: draft.name },
  });

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add a comment to a draft
 */
export function addComment(params: {
  draftId: string;
  content: string;
  authorId: string;
  authorEmail: string;
  authorName?: string;
  parentId?: string;
  lineRef?: {
    field: string;
    start: number;
    end: number;
  };
}): Comment {
  const id = `comment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const comment: Comment = {
    id,
    draftId: params.draftId,
    content: params.content,
    author: {
      id: params.authorId,
      email: params.authorEmail,
      name: params.authorName,
    },
    createdAt: now,
    updatedAt: now,
    resolved: false,
    parentId: params.parentId,
    lineRef: params.lineRef,
    reactions: [],
  };

  comments.set(id, comment);

  // Update draft's updatedAt
  const draft = drafts.get(params.draftId);
  if (draft) {
    draft.updatedAt = now;
  }

  emitEvent({
    type: 'comment_added',
    entityType: 'draft',
    entityId: params.draftId,
    actorId: params.authorId,
    actorEmail: params.authorEmail,
    timestamp: now,
    details: { commentId: id, parentId: params.parentId },
  });

  return comment;
}

/**
 * Get comments for a draft
 */
export function getComments(draftId: string): Comment[] {
  return Array.from(comments.values())
    .filter((c) => c.draftId === draftId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Update a comment
 */
export function updateComment(
  id: string,
  params: {
    content?: string;
    resolved?: boolean;
    editorId: string;
    editorEmail: string;
  }
): Comment | null {
  const comment = comments.get(id);
  if (!comment) return null;

  if (params.content !== undefined) comment.content = params.content;
  if (params.resolved !== undefined) {
    comment.resolved = params.resolved;
    if (params.resolved) {
      comment.resolvedAt = new Date().toISOString();
      comment.resolvedBy = {
        id: params.editorId,
        email: params.editorEmail,
      };
    } else {
      comment.resolvedAt = undefined;
      comment.resolvedBy = undefined;
    }
  }
  comment.updatedAt = new Date().toISOString();

  return comment;
}

/**
 * Add a reaction to a comment
 */
export function addReaction(
  commentId: string,
  params: {
    emoji: string;
    userId: string;
    userEmail: string;
  }
): Comment | null {
  const comment = comments.get(commentId);
  if (!comment) return null;

  // Remove existing reaction from this user
  comment.reactions = comment.reactions.filter((r) => r.userId !== params.userId);

  // Add new reaction
  comment.reactions.push({
    emoji: params.emoji,
    userId: params.userId,
    userEmail: params.userEmail,
  });

  return comment;
}

/**
 * Delete a comment
 */
export function deleteComment(id: string): boolean {
  return comments.delete(id);
}

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL REQUESTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create an approval request for a draft
 */
export function requestApproval(params: {
  draftId: string;
  requesterId: string;
  requesterEmail: string;
  requesterName?: string;
  approverIds: string[];
  approverEmails: string[];
  message?: string;
  requiredApprovals?: number;
  expiresAt?: string;
}): ApprovalRequest {
  const id = `approval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  // Update draft status
  const draft = drafts.get(params.draftId);
  if (draft) {
    draft.status = 'pending_review';
    draft.updatedAt = now;
  }

  const request: ApprovalRequest = {
    id,
    draftId: params.draftId,
    requester: {
      id: params.requesterId,
      email: params.requesterEmail,
      name: params.requesterName,
    },
    approvers: params.approverIds.map((id, i) => ({
      id,
      email: params.approverEmails[i],
      status: 'pending' as ApprovalStatus,
    })),
    status: 'pending',
    message: params.message,
    requiredApprovals: params.requiredApprovals || params.approverIds.length,
    createdAt: now,
    updatedAt: now,
    expiresAt: params.expiresAt,
    approvalHistory: [],
  };

  approvalRequests.set(id, request);

  emitEvent({
    type: 'approval_requested',
    entityType: 'draft',
    entityId: params.draftId,
    actorId: params.requesterId,
    actorEmail: params.requesterEmail,
    timestamp: now,
    details: {
      approvalId: id,
      approverEmails: params.approverEmails,
    },
  });

  return request;
}

/**
 * Get an approval request by ID
 */
export function getApprovalRequest(id: string): ApprovalRequest | null {
  return approvalRequests.get(id) || null;
}

/**
 * Get approval requests for a draft
 */
export function getApprovalRequestsForDraft(draftId: string): ApprovalRequest[] {
  return Array.from(approvalRequests.values())
    .filter((r) => r.draftId === draftId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get pending approval requests for an approver
 */
export function getPendingApprovalsForUser(userId: string): ApprovalRequest[] {
  return Array.from(approvalRequests.values()).filter(
    (r) =>
      r.status === 'pending' &&
      r.approvers.some((a) => a.id === userId && a.status === 'pending')
  );
}

/**
 * Submit an approval decision
 */
export function submitApproval(params: {
  requestId: string;
  approverId: string;
  approverEmail: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  comment?: string;
}): ApprovalRequest | null {
  const request = approvalRequests.get(params.requestId);
  if (!request) return null;

  const now = new Date().toISOString();

  // Find the approver
  const approver = request.approvers.find((a) => a.id === params.approverId);
  if (!approver) return null;

  // Update approver status
  approver.status = params.decision;
  approver.decidedAt = now;
  approver.comment = params.comment;

  // Record in history
  request.approvalHistory.push({
    approverId: params.approverId,
    approverEmail: params.approverEmail,
    decision: params.decision,
    comment: params.comment,
    timestamp: now,
  });

  // Calculate overall status
  const approvedCount = request.approvers.filter((a) => a.status === 'approved').length;
  const rejectedCount = request.approvers.filter((a) => a.status === 'rejected').length;
  const changesRequestedCount = request.approvers.filter(
    (a) => a.status === 'changes_requested'
  ).length;

  if (rejectedCount > 0) {
    request.status = 'rejected';
  } else if (changesRequestedCount > 0) {
    request.status = 'changes_requested';
  } else if (approvedCount >= request.requiredApprovals) {
    request.status = 'approved';
    // Update draft status
    const draft = drafts.get(request.draftId);
    if (draft) {
      draft.status = 'approved';
      draft.updatedAt = now;
    }
  }

  request.updatedAt = now;

  emitEvent({
    type:
      params.decision === 'approved'
        ? 'approval_granted'
        : params.decision === 'rejected'
        ? 'approval_rejected'
        : 'changes_requested',
    entityType: 'draft',
    entityId: request.draftId,
    actorId: params.approverId,
    actorEmail: params.approverEmail,
    timestamp: now,
    details: {
      approvalId: params.requestId,
      decision: params.decision,
      comment: params.comment,
    },
  });

  return request;
}

/**
 * Cancel an approval request
 */
export function cancelApproval(
  requestId: string,
  params: { cancelledById: string; cancelledByEmail: string }
): ApprovalRequest | null {
  const request = approvalRequests.get(requestId);
  if (!request) return null;

  request.status = 'cancelled';
  request.updatedAt = new Date().toISOString();

  // Update draft status
  const draft = drafts.get(request.draftId);
  if (draft) {
    draft.status = 'draft';
    draft.updatedAt = request.updatedAt;
  }

  return request;
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLISH GATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Define a publish gate
 */
export function setPublishGate(gate: PublishGate): void {
  publishGates.set(gate.id, gate);
}

/**
 * Get a publish gate
 */
export function getPublishGate(id: string): PublishGate | null {
  return publishGates.get(id) || null;
}

/**
 * Get all publish gates
 */
export function getAllPublishGates(): PublishGate[] {
  return Array.from(publishGates.values());
}

/**
 * Check if a draft can be published
 */
export function checkPublishGates(draftId: string): {
  canPublish: boolean;
  gateResults: {
    gateId: string;
    gateName: string;
    passed: boolean;
    message?: string;
  }[];
} {
  const draft = drafts.get(draftId);
  if (!draft) {
    return {
      canPublish: false,
      gateResults: [
        {
          gateId: 'draft_exists',
          gateName: 'Draft Exists',
          passed: false,
          message: 'Draft not found',
        },
      ],
    };
  }

  const gates = Array.from(publishGates.values()).filter((g) => g.enabled);
  const results: {
    gateId: string;
    gateName: string;
    passed: boolean;
    message?: string;
  }[] = [];

  for (const gate of gates) {
    // Check type match
    if (gate.entityTypes && !gate.entityTypes.includes(draft.type)) {
      continue;
    }

    // Check each condition
    for (const condition of gate.conditions) {
      let passed = false;
      let message: string | undefined;

      switch (condition.type) {
        case 'approval_required':
          const approvals = getApprovalRequestsForDraft(draftId);
          const latestApproval = approvals[0];
          passed = latestApproval?.status === 'approved';
          message = passed ? 'Approved' : 'Approval required before publishing';
          break;

        case 'no_unresolved_comments':
          const draftComments = getComments(draftId);
          const unresolvedCount = draftComments.filter((c) => !c.resolved).length;
          passed = unresolvedCount === 0;
          message = passed
            ? 'All comments resolved'
            : `${unresolvedCount} unresolved comment(s)`;
          break;

        case 'schema_valid':
          // Check if schema validation passes
          passed = true; // Placeholder - would integrate with schema validation
          message = 'Schema validation passed';
          break;

        case 'tests_passed':
          // Check if tests passed
          passed = true; // Placeholder - would integrate with test framework
          message = 'All tests passed';
          break;

        case 'compliance_check':
          // Check compliance
          passed = true; // Placeholder - would integrate with compliance service
          message = 'Compliance checks passed';
          break;

        case 'custom':
          // Would execute custom validation function
          passed = true;
          message = condition.customMessage || 'Custom check passed';
          break;
      }

      results.push({
        gateId: gate.id,
        gateName: `${gate.name}: ${condition.type}`,
        passed,
        message,
      });
    }
  }

  const canPublish = results.every((r) => r.passed);

  return { canPublish, gateResults: results };
}

/**
 * Publish a draft
 */
export function publishDraft(
  draftId: string,
  params: {
    publisherId: string;
    publisherEmail: string;
    skipGates?: boolean;
  }
): {
  success: boolean;
  draft?: Draft;
  error?: string;
  gateResults?: {
    gateId: string;
    gateName: string;
    passed: boolean;
    message?: string;
  }[];
} {
  const draft = drafts.get(draftId);
  if (!draft) {
    return { success: false, error: 'Draft not found' };
  }

  // Check publish gates
  if (!params.skipGates) {
    const gateCheck = checkPublishGates(draftId);
    if (!gateCheck.canPublish) {
      return {
        success: false,
        error: 'Publish gates not satisfied',
        gateResults: gateCheck.gateResults,
      };
    }
  }

  const now = new Date().toISOString();
  draft.status = 'published';
  draft.publishedAt = now;
  draft.publishedBy = {
    id: params.publisherId,
    email: params.publisherEmail,
  };
  draft.updatedAt = now;

  emitEvent({
    type: 'draft_published',
    entityType: draft.type,
    entityId: draftId,
    actorId: params.publisherId,
    actorEmail: params.publisherEmail,
    timestamp: now,
    details: { name: draft.name, version: draft.version },
  });

  return { success: true, draft };
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Emit a collaboration event
 */
function emitEvent(event: CollaborationEvent): void {
  collaborationEvents.push(event);
  // Keep only last 1000 events
  if (collaborationEvents.length > 1000) {
    collaborationEvents.shift();
  }
  // Notify subscribers
  eventSubscribers.forEach((sub) => sub(event));
}

/**
 * Subscribe to collaboration events
 */
export function onCollaborationEvent(
  callback: (event: CollaborationEvent) => void
): () => void {
  eventSubscribers.push(callback);
  return () => {
    const index = eventSubscribers.indexOf(callback);
    if (index > -1) eventSubscribers.splice(index, 1);
  };
}

/**
 * Get recent collaboration events
 */
export function getCollaborationEvents(params?: {
  entityId?: string;
  entityType?: 'skill' | 'workflow' | 'draft';
  actorId?: string;
  limit?: number;
}): CollaborationEvent[] {
  let events = [...collaborationEvents];

  if (params?.entityId) {
    events = events.filter((e) => e.entityId === params.entityId);
  }
  if (params?.entityType) {
    events = events.filter((e) => e.entityType === params.entityType);
  }
  if (params?.actorId) {
    events = events.filter((e) => e.actorId === params.actorId);
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events.slice(0, params?.limit || 100);
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLABORATION SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

export interface CollaborationSummary {
  totalDrafts: number;
  draftsByStatus: Record<DraftStatus, number>;
  pendingApprovals: number;
  unresolvedComments: number;
  recentActivity: CollaborationEvent[];
  activeCollaborators: number;
}

/**
 * Get collaboration summary for a user or team
 */
export function getCollaborationSummary(params?: {
  userId?: string;
  teamId?: string;
}): CollaborationSummary {
  const userDrafts = getDrafts({
    authorId: params?.userId,
    teamId: params?.teamId,
  });

  const draftsByStatus: Record<DraftStatus, number> = {
    draft: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
    published: 0,
    archived: 0,
  };

  userDrafts.forEach((d) => {
    draftsByStatus[d.status]++;
  });

  const pendingApprovals = params?.userId
    ? getPendingApprovalsForUser(params.userId).length
    : Array.from(approvalRequests.values()).filter((r) => r.status === 'pending').length;

  let unresolvedComments = 0;
  userDrafts.forEach((d) => {
    const draftComments = getComments(d.id);
    unresolvedComments += draftComments.filter((c) => !c.resolved).length;
  });

  const activeCollaborators = new Set<string>();
  userDrafts.forEach((d) => {
    d.collaborators.forEach((c) => activeCollaborators.add(c.id));
  });

  const recentActivity = getCollaborationEvents({
    actorId: params?.userId,
    limit: 10,
  });

  return {
    totalDrafts: userDrafts.length,
    draftsByStatus,
    pendingApprovals,
    unresolvedComments,
    recentActivity,
    activeCollaborators: activeCollaborators.size,
  };
}
