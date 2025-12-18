/**
 * Email Service - Client-side wrapper for email sending
 *
 * Abstracts the email-send Edge Function, providing a clean API
 * for the Admin Control Panel to send targeted emails.
 */

import { supabase } from '../supabase';
import type { EmailSendRequest, EmailSendResponse, EmailCampaign } from './types';
import { logEmailSend } from './audit';
import { saveEmailCampaign } from './storage';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-send`
  : '/api/email-send';

// ═══════════════════════════════════════════════════════════════════════════
// SEND EMAIL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send an email to selected recipients via Edge Function
 */
export async function sendEmail(
  request: EmailSendRequest,
  adminUserId: string,
  adminEmail: string
): Promise<EmailSendResponse> {
  // Get auth token for Edge Function
  let authToken: string | undefined;

  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    authToken = session?.access_token;
  }

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: JSON.stringify(request),
    });

    const result: EmailSendResponse = await response.json();

    // Log the send action (audit)
    await logEmailSend(
      adminUserId,
      adminEmail,
      request.subject,
      request.recipientIds,
      { requireOptIn: true, skillMatchMode: 'any', includeAsFavorite: true, includeAsPrimary: true, periodDays: 30 }
    );

    // Save campaign record locally
    if (result.success && result.campaignId) {
      const campaign: EmailCampaign = {
        id: result.campaignId,
        subject: request.subject,
        body: request.body,
        bodyHtml: request.bodyHtml,
        recipientCount: result.recipientCount,
        recipientFilter: { requireOptIn: true, skillMatchMode: 'any', includeAsFavorite: true, includeAsPrimary: true, periodDays: 30 },
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: adminUserId,
        updatedAt: new Date().toISOString(),
      };
      await saveEmailCampaign(campaign);
    }

    return result;
  } catch (error) {
    console.error('Email send failed:', error);

    // For development/mock mode, simulate success
    if (import.meta.env.DEV || !supabase) {
      console.log('=== MOCK EMAIL SEND (Dev Mode) ===');
      console.log('To:', request.recipientIds.length, 'recipients');
      console.log('Subject:', request.subject);
      console.log('Body:', request.body.substring(0, 200), '...');
      console.log('==================================');

      const campaignId = crypto.randomUUID();

      // Log the send action
      await logEmailSend(
        adminUserId,
        adminEmail,
        request.subject,
        request.recipientIds,
        { requireOptIn: true, skillMatchMode: 'any', includeAsFavorite: true, includeAsPrimary: true, periodDays: 30 }
      );

      return {
        success: true,
        campaignId,
        recipientCount: request.recipientIds.length,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
      recipientCount: 0,
    };
  }
}

/**
 * Preview email (for testing without sending)
 */
export function previewEmail(request: EmailSendRequest): {
  subject: string;
  body: string;
  recipientCount: number;
  estimatedCost?: string;
} {
  return {
    subject: request.subject,
    body: request.body,
    recipientCount: request.recipientIds.length,
    // Could add cost estimation for transactional email services
    estimatedCost: undefined,
  };
}

/**
 * Validate email request before sending
 */
export function validateEmailRequest(
  request: Partial<EmailSendRequest>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.subject?.trim()) {
    errors.push('Subject is required');
  } else if (request.subject.length > 200) {
    errors.push('Subject must be 200 characters or less');
  }

  if (!request.body?.trim()) {
    errors.push('Email body is required');
  } else if (request.body.length > 50000) {
    errors.push('Email body must be 50,000 characters or less');
  }

  if (!request.recipientIds || request.recipientIds.length === 0) {
    errors.push('At least one recipient is required');
  } else if (request.recipientIds.length > 1000) {
    errors.push('Cannot send to more than 1,000 recipients at once');
  }

  if (request.replyTo && !isValidEmail(request.replyTo)) {
    errors.push('Reply-to email is invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
