/**
 * Admin Audit Logging
 *
 * Tracks admin actions for compliance and debugging.
 * Logs email sends, filter applications, and subscription changes.
 */

import { supabase } from '../supabase';
import type { AdminAuditLog, AdminActionType, SegmentationFilter } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE KEY
// ═══════════════════════════════════════════════════════════════════════════

const AUDIT_LOG_KEY = 'skillengine_admin_audit_log';

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log an admin action
 */
export async function logAdminAction(
  adminUserId: string,
  adminEmail: string,
  actionType: AdminActionType,
  actionDetails: Record<string, unknown>,
  targetUserIds?: string[],
  recipientCount?: number
): Promise<AdminAuditLog> {
  const log: AdminAuditLog = {
    id: crypto.randomUUID(),
    adminUserId,
    adminEmail,
    actionType,
    actionDetails,
    targetUserIds,
    recipientCount,
    timestamp: new Date().toISOString(),
  };

  // Try Supabase first
  if (supabase) {
    const { error } = await supabase
      .from('admin_audit_logs')
      .insert({
        id: log.id,
        admin_user_id: log.adminUserId,
        admin_email: log.adminEmail,
        action_type: log.actionType,
        action_details: log.actionDetails,
        target_user_ids: log.targetUserIds,
        recipient_count: log.recipientCount,
        timestamp: log.timestamp,
      });

    if (!error) {
      return log;
    }
    console.warn('Failed to save audit log to Supabase, falling back to localStorage', error);
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(AUDIT_LOG_KEY);
  const logs: AdminAuditLog[] = stored ? JSON.parse(stored) : [];

  logs.push(log);

  // Keep only last 1000 entries
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }

  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));

  return log;
}

/**
 * Log email send action
 */
export async function logEmailSend(
  adminUserId: string,
  adminEmail: string,
  subject: string,
  recipientIds: string[],
  filter: SegmentationFilter
): Promise<AdminAuditLog> {
  return logAdminAction(
    adminUserId,
    adminEmail,
    'email_send',
    {
      subject,
      filter,
    },
    recipientIds,
    recipientIds.length
  );
}

/**
 * Log email preview action
 */
export async function logEmailPreview(
  adminUserId: string,
  adminEmail: string,
  filter: SegmentationFilter,
  recipientCount: number
): Promise<AdminAuditLog> {
  return logAdminAction(
    adminUserId,
    adminEmail,
    'email_preview',
    { filter },
    undefined,
    recipientCount
  );
}

/**
 * Log subscription toggle action
 */
export async function logSubscriptionToggle(
  adminUserId: string,
  adminEmail: string,
  targetUserId: string,
  targetEmail: string,
  newOptInStatus: boolean
): Promise<AdminAuditLog> {
  return logAdminAction(
    adminUserId,
    adminEmail,
    'subscription_toggle',
    {
      targetEmail,
      newOptInStatus,
    },
    [targetUserId]
  );
}

/**
 * Log segment filter application
 */
export async function logSegmentFilter(
  adminUserId: string,
  adminEmail: string,
  filter: SegmentationFilter,
  resultCount: number
): Promise<AdminAuditLog> {
  return logAdminAction(
    adminUserId,
    adminEmail,
    'email_segment_filter',
    { filter },
    undefined,
    resultCount
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(limit: number = 50): Promise<AdminAuditLog[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        adminUserId: row.admin_user_id,
        adminEmail: row.admin_email,
        actionType: row.action_type,
        actionDetails: row.action_details,
        targetUserIds: row.target_user_ids,
        recipientCount: row.recipient_count,
        timestamp: row.timestamp,
      }));
    }
  }

  // Fallback
  const stored = localStorage.getItem(AUDIT_LOG_KEY);
  const logs: AdminAuditLog[] = stored ? JSON.parse(stored) : [];

  return logs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get audit logs by action type
 */
export async function getAuditLogsByType(
  actionType: AdminActionType,
  limit: number = 50
): Promise<AdminAuditLog[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('action_type', actionType)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        adminUserId: row.admin_user_id,
        adminEmail: row.admin_email,
        actionType: row.action_type,
        actionDetails: row.action_details,
        targetUserIds: row.target_user_ids,
        recipientCount: row.recipient_count,
        timestamp: row.timestamp,
      }));
    }
  }

  // Fallback
  const all = await getRecentAuditLogs(1000);
  return all.filter(log => log.actionType === actionType).slice(0, limit);
}

/**
 * Get audit logs for a specific admin
 */
export async function getAuditLogsByAdmin(
  adminUserId: string,
  limit: number = 50
): Promise<AdminAuditLog[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('admin_user_id', adminUserId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        adminUserId: row.admin_user_id,
        adminEmail: row.admin_email,
        actionType: row.action_type,
        actionDetails: row.action_details,
        targetUserIds: row.target_user_ids,
        recipientCount: row.recipient_count,
        timestamp: row.timestamp,
      }));
    }
  }

  // Fallback
  const all = await getRecentAuditLogs(1000);
  return all.filter(log => log.adminUserId === adminUserId).slice(0, limit);
}

/**
 * Clear audit logs older than specified days (admin action)
 */
export async function clearOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffTimestamp = cutoffDate.toISOString();

  if (supabase) {
    const { error, count } = await supabase
      .from('admin_audit_logs')
      .delete()
      .lt('timestamp', cutoffTimestamp)
      .select('id', { count: 'exact' });

    if (!error) {
      return count || 0;
    }
  }

  // Fallback
  const stored = localStorage.getItem(AUDIT_LOG_KEY);
  const logs: AdminAuditLog[] = stored ? JSON.parse(stored) : [];

  const originalCount = logs.length;
  const filtered = logs.filter(log => log.timestamp >= cutoffTimestamp);
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(filtered));

  return originalCount - filtered.length;
}
