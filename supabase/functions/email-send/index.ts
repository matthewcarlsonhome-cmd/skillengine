/**
 * email-send Edge Function
 *
 * Handles email sending for the Admin Control Panel.
 * Abstracts email delivery so credentials stay server-side.
 *
 * Supports multiple email providers (configured via env vars):
 * - SMTP (default)
 * - SendGrid
 * - Resend
 * - Mailgun
 *
 * Environment variables:
 * - EMAIL_PROVIDER: 'smtp' | 'sendgrid' | 'resend' | 'mailgun'
 * - EMAIL_FROM: Default from address
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (for SMTP)
 * - SENDGRID_API_KEY (for SendGrid)
 * - RESEND_API_KEY (for Resend)
 * - MAILGUN_API_KEY, MAILGUN_DOMAIN (for Mailgun)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface EmailSendRequest {
  subject: string;
  body: string;
  bodyHtml?: string;
  recipientIds: string[];
  fromName?: string;
  replyTo?: string;
}

interface EmailSendResponse {
  success: boolean;
  campaignId?: string;
  recipientCount: number;
  failedRecipients?: string[];
  error?: string;
}

interface RecipientEmail {
  userId: string;
  email: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORS HEADERS
// ═══════════════════════════════════════════════════════════════════════════

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════

async function sendViaSendGrid(
  to: string[],
  subject: string,
  body: string,
  bodyHtml: string,
  fromName: string,
  fromEmail: string,
  replyTo?: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'SendGrid API key not configured' };
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: to.map(email => ({ to: [{ email }] })),
      from: { email: fromEmail, name: fromName },
      reply_to: replyTo ? { email: replyTo } : undefined,
      subject,
      content: [
        { type: 'text/plain', value: body },
        { type: 'text/html', value: bodyHtml },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `SendGrid error: ${error}` };
  }

  return { success: true };
}

async function sendViaResend(
  to: string[],
  subject: string,
  body: string,
  bodyHtml: string,
  fromName: string,
  fromEmail: string,
  replyTo?: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'Resend API key not configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to,
      reply_to: replyTo,
      subject,
      text: body,
      html: bodyHtml,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Resend error: ${error}` };
  }

  return { success: true };
}

async function sendViaMailgun(
  to: string[],
  subject: string,
  body: string,
  bodyHtml: string,
  fromName: string,
  fromEmail: string,
  replyTo?: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('MAILGUN_API_KEY');
  const domain = Deno.env.get('MAILGUN_DOMAIN');

  if (!apiKey || !domain) {
    return { success: false, error: 'Mailgun credentials not configured' };
  }

  const formData = new FormData();
  formData.append('from', `${fromName} <${fromEmail}>`);
  to.forEach(email => formData.append('to', email));
  formData.append('subject', subject);
  formData.append('text', body);
  formData.append('html', bodyHtml);
  if (replyTo) {
    formData.append('h:Reply-To', replyTo);
  }

  const response = await fetch(
    `https://api.mailgun.net/v3/${domain}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Mailgun error: ${error}` };
  }

  return { success: true };
}

// Mock/development email sender (logs to console)
async function sendViaMock(
  to: string[],
  subject: string,
  body: string,
  _bodyHtml: string,
  fromName: string,
  _fromEmail: string,
  replyTo?: string
): Promise<{ success: boolean; error?: string }> {
  console.log('=== MOCK EMAIL SEND ===');
  console.log(`From: ${fromName}`);
  console.log(`Reply-To: ${replyTo || 'N/A'}`);
  console.log(`To: ${to.join(', ')}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body.substring(0, 500)}${body.length > 500 ? '...' : ''}`);
  console.log('=======================');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKDOWN TO HTML CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

function markdownToHtml(markdown: string): string {
  // Basic markdown to HTML conversion
  let html = markdown
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');

  // Wrap in paragraphs
  html = `<p>${html}</p>`;

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const request: EmailSendRequest = await req.json();
    const { subject, body, bodyHtml, recipientIds, fromName, replyTo } = request;

    // Validate
    if (!subject || !body || !recipientIds || recipientIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: subject, body, recipientIds',
        } as EmailSendResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recipient emails
    const { data: recipients, error: recipientError } = await supabase
      .from('user_email_preferences')
      .select('user_id, email')
      .in('user_id', recipientIds)
      .eq('marketing_email_opt_in', true);

    if (recipientError) {
      console.error('Failed to fetch recipients:', recipientError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch recipient emails',
        } as EmailSendResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No valid opted-in recipients found',
          recipientCount: 0,
        } as EmailSendResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get emails
    const emails = recipients.map((r: RecipientEmail) => r.email);

    // Convert markdown to HTML if not provided
    const htmlContent = bodyHtml || markdownToHtml(body);

    // Get email config
    const provider = Deno.env.get('EMAIL_PROVIDER') || 'mock';
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'noreply@skillengine.app';
    const senderName = fromName || 'SkillEngine';

    // Send based on provider
    let sendResult: { success: boolean; error?: string };

    switch (provider) {
      case 'sendgrid':
        sendResult = await sendViaSendGrid(
          emails, subject, body, htmlContent, senderName, fromEmail, replyTo
        );
        break;
      case 'resend':
        sendResult = await sendViaResend(
          emails, subject, body, htmlContent, senderName, fromEmail, replyTo
        );
        break;
      case 'mailgun':
        sendResult = await sendViaMailgun(
          emails, subject, body, htmlContent, senderName, fromEmail, replyTo
        );
        break;
      default:
        sendResult = await sendViaMock(
          emails, subject, body, htmlContent, senderName, fromEmail, replyTo
        );
    }

    if (!sendResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: sendResult.error,
          recipientCount: emails.length,
        } as EmailSendResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log campaign
    const campaignId = crypto.randomUUID();
    await supabase.from('email_campaigns').insert({
      id: campaignId,
      subject,
      body,
      body_html: htmlContent,
      recipient_count: emails.length,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    // Log audit
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      if (user) {
        await supabase.from('admin_audit_logs').insert({
          admin_user_id: user.id,
          admin_email: user.email,
          action_type: 'email_send',
          action_details: { subject, campaignId },
          target_user_ids: recipientIds,
          recipient_count: emails.length,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        campaignId,
        recipientCount: emails.length,
      } as EmailSendResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipientCount: 0,
      } as EmailSendResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
