# API Documentation

> SkillEngine Backend API Reference
> Version: 1.0.0
> Base URL: `https://<project>.supabase.co/functions/v1`

---

## Overview

SkillEngine uses Supabase Edge Functions (Deno) as the backend API layer. All endpoints require authentication via Supabase JWT tokens.

### Authentication

All requests must include an `Authorization` header:

```
Authorization: Bearer <supabase_jwt_token>
```

---

## Endpoints

### 1. AI Proxy

Secure proxy for LLM API calls using platform-managed API keys.

**Endpoint:** `POST /ai-proxy`

#### Request

```json
{
  "model": "string",        // Required: Model identifier
  "prompt": "string",       // Required: User prompt
  "systemPrompt": "string", // Optional: System instructions
  "maxTokens": 4096,        // Optional: Max response tokens
  "temperature": 0.7,       // Optional: Sampling temperature
  "stream": false           // Optional: Enable streaming (not yet implemented)
}
```

#### Supported Models

| Model ID | Provider | API Model | Max Tokens |
|----------|----------|-----------|------------|
| `gemini-2.0-flash` | Google | gemini-2.0-flash-exp | 8,192 |
| `gemini-1.5-pro` | Google | gemini-1.5-pro | 8,192 |
| `haiku` | Anthropic | claude-3-haiku-20240307 | 8,192 |
| `sonnet` | Anthropic | claude-3-5-sonnet-20241022 | 8,192 |
| `opus` | Anthropic | claude-3-opus-20240229 | 4,096 |
| `gpt-4o-mini` | OpenAI | gpt-4o-mini | 16,384 |
| `gpt-4o` | OpenAI | gpt-4o | 16,384 |

#### Response

```json
{
  "output": "string",       // Generated text
  "usage": {
    "inputTokens": 150,
    "outputTokens": 200,
    "costCents": 5
  },
  "model": "string"         // Actual API model used
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required fields | `model` or `prompt` not provided |
| 400 | Unknown model | Invalid model identifier |
| 401 | Missing authorization header | No JWT token |
| 401 | Invalid authentication | Invalid/expired JWT |
| 402 | Insufficient credits | User has no credits remaining |
| 503 | Platform key not configured | Server missing API key for provider |

#### Example

```bash
curl -X POST 'https://<project>.supabase.co/functions/v1/ai-proxy' \
  -H 'Authorization: Bearer <jwt>' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "sonnet",
    "prompt": "Write a cover letter for a software engineer position",
    "systemPrompt": "You are a professional career coach.",
    "maxTokens": 1000
  }'
```

---

### 2. Email Send

Send targeted emails to opted-in users (admin only).

**Endpoint:** `POST /email-send`

#### Request

```json
{
  "subject": "string",       // Required: Email subject
  "body": "string",          // Required: Plain text body (markdown supported)
  "bodyHtml": "string",      // Optional: HTML body (auto-generated if omitted)
  "recipientIds": ["uuid"],  // Required: Array of user IDs
  "fromName": "string",      // Optional: Sender name (default: "SkillEngine")
  "replyTo": "string"        // Optional: Reply-to email address
}
```

#### Response

```json
{
  "success": true,
  "campaignId": "uuid",      // Campaign tracking ID
  "recipientCount": 50,      // Number of emails sent
  "failedRecipients": []     // Array of failed user IDs (if any)
}
```

#### Email Providers

Configure via `EMAIL_PROVIDER` environment variable:

| Provider | Required Env Vars |
|----------|-------------------|
| `mock` | None (logs to console) |
| `sendgrid` | `SENDGRID_API_KEY` |
| `resend` | `RESEND_API_KEY` |
| `mailgun` | `MAILGUN_API_KEY`, `MAILGUN_DOMAIN` |

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required fields | `subject`, `body`, or `recipientIds` missing |
| 400 | No valid opted-in recipients | No recipients found or none opted in |
| 500 | Failed to fetch recipients | Database error |
| 500 | Provider error | Email provider returned error |

---

### 3. Platform Status

Health check endpoint for monitoring.

**Endpoint:** `GET /platform-status`

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-12-19T12:00:00Z",
  "services": {
    "database": "connected",
    "ai_providers": {
      "gemini": "available",
      "claude": "available",
      "openai": "available"
    }
  }
}
```

---

## Database Schema

### Core Tables

```sql
-- User credits for AI usage
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  balance INTEGER DEFAULT 0,  -- Balance in cents
  tier TEXT DEFAULT 'free',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage logging
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email preferences
CREATE TABLE user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  marketing_email_opt_in BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,
  recipient_count INTEGER,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

All tables use Row Level Security. Users can only read/write their own data. Admin functions use service role keys.

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| ai-proxy | 100 requests | per minute |
| email-send | 10 requests | per minute |
| platform-status | 1000 requests | per minute |

*Note: Rate limiting is currently client-side. Server-side limits are planned.*

---

## Error Format

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",      // Optional
  "details": {}              // Optional additional context
}
```

---

## Changelog

### v1.0.0 (2024-12-19)
- Initial API documentation
- Documented ai-proxy, email-send, platform-status endpoints
