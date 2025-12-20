/**
 * Rate Limiting Utility for Edge Functions
 *
 * Implements a sliding window rate limiter using Supabase's database
 * to track request counts per user/IP.
 *
 * SECURITY BENEFITS:
 * - Prevents API abuse and enumeration attacks
 * - Protects against brute-force attempts
 * - Limits resource consumption per user
 * - Provides visibility into potential attacks
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rate limit configuration
export interface RateLimitConfig {
  // Maximum requests allowed in the window
  maxRequests: number;
  // Window size in seconds
  windowSeconds: number;
  // Identifier for this rate limit (e.g., 'ai-proxy', 'platform-status')
  endpoint: string;
}

// Default rate limits for different endpoints
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'ai-proxy': {
    maxRequests: 30,
    windowSeconds: 60, // 30 requests per minute
    endpoint: 'ai-proxy',
  },
  'ai-proxy-burst': {
    maxRequests: 5,
    windowSeconds: 10, // 5 requests per 10 seconds (burst protection)
    endpoint: 'ai-proxy-burst',
  },
  'platform-status': {
    maxRequests: 60,
    windowSeconds: 60, // 60 requests per minute (less sensitive)
    endpoint: 'platform-status',
  },
  'auth': {
    maxRequests: 10,
    windowSeconds: 300, // 10 attempts per 5 minutes
    endpoint: 'auth',
  },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // seconds until next request allowed
}

/**
 * In-memory rate limit store for Edge Functions
 * Uses a Map with automatic cleanup of expired entries
 */
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowSeconds: number): void {
  const now = Date.now();

  // Only cleanup periodically
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }

  lastCleanup = now;
  const expiredBefore = now - windowSeconds * 1000;

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.windowStart < expiredBefore) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check rate limit for a given identifier
 * Uses in-memory storage (appropriate for Edge Functions)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `${config.endpoint}:${identifier}`;

  // Cleanup periodically
  cleanupExpiredEntries(config.windowSeconds);

  // Get or create entry
  let entry = rateLimitStore.get(key);

  // If no entry or window expired, create new window
  if (!entry || now - entry.windowStart >= windowMs) {
    entry = { count: 0, windowStart: now };
    rateLimitStore.set(key, entry);
  }

  // Calculate remaining and reset time
  const windowEnd = entry.windowStart + windowMs;
  const resetAt = new Date(windowEnd);

  // Check if rate limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((windowEnd - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt,
  };
}

/**
 * Get user identifier from request
 * Prefers user ID from auth, falls back to IP address
 */
export function getIdentifier(req: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if there are multiple
    return `ip:${forwardedFor.split(',')[0].trim()}`;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }

  // Fallback to a hash of user-agent and other headers
  const ua = req.headers.get('user-agent') || 'unknown';
  const acceptLang = req.headers.get('accept-language') || '';
  return `anon:${simpleHash(ua + acceptLang)}`;
}

/**
 * Simple string hash for anonymous identifier generation
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };

  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitExceededResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: result.retryAfter,
      resetAt: result.resetAt.toISOString(),
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        ...getRateLimitHeaders(result),
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Middleware function for rate limiting
 * Returns null if allowed, or a Response if rate limited
 */
export function rateLimitMiddleware(
  req: Request,
  userId: string | undefined,
  endpoint: string,
  corsHeaders: Record<string, string>
): Response | null {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    console.warn(`No rate limit config for endpoint: ${endpoint}`);
    return null;
  }

  const identifier = getIdentifier(req, userId);
  const result = checkRateLimit(identifier, config);

  if (!result.allowed) {
    console.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`);
    return rateLimitExceededResponse(result, corsHeaders);
  }

  return null;
}
