import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Verifies the Supabase JWT from the Authorization header.
 * Returns the authenticated user, or null if invalid/missing.
 * Uses the service-role client to call getUser() which validates against Supabase's auth server.
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  // Use a scoped anon client that verifies the JWT via Supabase Auth API
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data?.user) return null;

  return { id: data.user.id, email: data.user.email! };
}

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const user = await getAuthenticatedUser(request);
  return user?.id ?? null;
}

/** Shared service-role admin client for server-side mutations */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Fallback in-memory rate limiter */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function fallbackRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxRequests) return false; // blocked

  entry.count++;
  return true; // allowed
}

/** Redis-based rate limiter if configured, otherwise fallback */
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '60s'),
  });
}

export async function rateLimit(key: string): Promise<boolean> {
  if (ratelimit) {
    const { success } = await ratelimit.limit(key);
    return success;
  } else {
    // Fallback to in-memory rate limiting
    return fallbackRateLimit(key, 10, 60_000);
  }
}
