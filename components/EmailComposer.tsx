/**
 * EmailComposer - Email Composition and Send UI
 *
 * Provides a rich text editor for composing emails,
 * recipient preview, and send confirmation.
 */

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Mail,
  Send,
  Eye,
  Edit3,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { cn } from '../lib/theme';
import type { EmailRecipient, EmailSendRequest, EmailSendResponse } from '../lib/emailSegmentation/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface EmailComposerProps {
  recipients: EmailRecipient[];
  onSend: (request: EmailSendRequest) => Promise<EmailSendResponse>;
  onCancel: () => void;
  isLoading?: boolean;
}

type ViewMode = 'edit' | 'preview' | 'confirm';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const RecipientBadge: React.FC<{ recipient: EmailRecipient }> = ({ recipient }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
    <Mail className="h-3 w-3" />
    {recipient.email}
  </span>
);

const ConfirmationDialog: React.FC<{
  recipientCount: number;
  subject: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ recipientCount, subject, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-card rounded-xl border shadow-lg w-full max-w-md mx-4 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold">Confirm Email Send</h3>
          <p className="text-sm text-muted-foreground">This action cannot be undone</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Subject</p>
          <p className="font-medium">{subject}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Recipients</p>
          <p className="font-medium">{recipientCount.toLocaleString()} user{recipientCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </div>
  </div>
);

const SuccessDialog: React.FC<{
  recipientCount: number;
  onClose: () => void;
}> = ({ recipientCount, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-card rounded-xl border shadow-lg w-full max-w-md mx-4 p-6 text-center">
      <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>

      <h3 className="font-semibold text-lg mb-2">Email Sent Successfully!</h3>
      <p className="text-muted-foreground mb-6">
        Your email has been sent to {recipientCount.toLocaleString()} recipient{recipientCount !== 1 ? 's' : ''}.
      </p>

      <Button onClick={onClose} className="min-w-32">
        Done
      </Button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const EmailComposer: React.FC<EmailComposerProps> = ({
  recipients,
  onSend,
  onCancel,
  isLoading: externalLoading = false,
}) => {
  // Form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fromName, setFromName] = useState('SkillEngine');
  const [replyTo, setReplyTo] = useState('');

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Validation
  const isValid = useMemo(() => {
    return subject.trim().length > 0 && body.trim().length > 0 && recipients.length > 0;
  }, [subject, body, recipients]);

  // Preview first few recipients
  const previewRecipients = useMemo(
    () => recipients.slice(0, 5),
    [recipients]
  );

  const handleSend = async () => {
    setIsSending(true);
    setSendError(null);

    try {
      const request: EmailSendRequest = {
        subject: subject.trim(),
        body: body.trim(),
        recipientIds: recipients.map(r => r.userId),
        fromName: fromName.trim() || undefined,
        replyTo: replyTo.trim() || undefined,
      };

      const response = await onSend(request);

      if (response.success) {
        setShowConfirm(false);
        setShowSuccess(true);
      } else {
        setSendError(response.error || 'Failed to send email');
        setShowConfirm(false);
      }
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'An error occurred');
      setShowConfirm(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onCancel(); // Return to segmentation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h2 className="font-semibold text-lg">Compose Email</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('edit')}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {sendError && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 flex items-center justify-between">
          <span>{sendError}</span>
          <button onClick={() => setSendError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Recipients Summary */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Recipients</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {recipients.length.toLocaleString()} user{recipients.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {previewRecipients.map(recipient => (
            <RecipientBadge key={recipient.userId} recipient={recipient} />
          ))}
          {recipients.length > 5 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
              +{recipients.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border bg-card">
        {viewMode === 'edit' ? (
          <div className="p-6 space-y-4">
            {/* From Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Name</label>
                <Input
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="SkillEngine"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reply-To (optional)</label>
                <Input
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className={cn(!subject.trim() && 'border-red-500/50')}
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Body (Markdown) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-muted-foreground">
                  {body.length} characters
                </span>
              </div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email content here... (Markdown supported)"
                rows={12}
                className={cn(
                  'font-mono text-sm',
                  !body.trim() && 'border-red-500/50'
                )}
              />
              <p className="text-xs text-muted-foreground">
                Supports Markdown formatting: **bold**, *italic*, [links](url), lists, etc.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-muted-foreground">Subject</p>
              <h3 className="text-lg font-semibold">{subject || '(No subject)'}</h3>
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert">
              {body ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">No content yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
        <div className="text-sm text-muted-foreground">
          {!isValid && (
            <span className="text-yellow-600">
              Please fill in subject and body to send
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={!isValid || externalLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            Send to {recipients.length} Recipient{recipients.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <ConfirmationDialog
          recipientCount={recipients.length}
          subject={subject}
          onConfirm={handleSend}
          onCancel={() => setShowConfirm(false)}
          isLoading={isSending}
        />
      )}

      {/* Success Dialog */}
      {showSuccess && (
        <SuccessDialog
          recipientCount={recipients.length}
          onClose={handleSuccessClose}
        />
      )}
    </div>
  );
};

export default EmailComposer;
