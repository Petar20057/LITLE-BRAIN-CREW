import "server-only";

import { createHmac } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";

// Requests per client IP for the public API routes (rate_limits, supabase/migrations/20261027120000_…).
// The IP comes from x-forwarded-for, which Vercel overwrites with the real client address (a browser can't fake it:
// vercel.com/docs/headers/request-headers). It is stored only as an HMAC keyed with the Supabase secret, and rows
// older than a day are pruned. If the check itself fails (database down) the request is allowed and the error logged:
// the per-address and per-visit caps in the routes still hold.

export const LIMITS = {
  /** /code email gate: a parent does the quiz once, maybe twice. */
  quizLead: { max: 5, windowSeconds: 3600 },
  /** New /code quiz visits (the first event of a visit). */
  quizSession: { max: 20, windowSeconds: 3600 },
  /** Every /code quiz click (a full quiz is about 40). */
  quizEvent: { max: 400, windowSeconds: 3600 },
  /** Email forms on the design pages. */
  signup: { max: 10, windowSeconds: 3600 },
  /** Page views. */
  track: { max: 600, windowSeconds: 3600 },
  /** New Creem checkouts. */
  checkout: { max: 20, windowSeconds: 3600 },
} as const;

export type Bucket = keyof typeof LIMITS;

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
}

const keyFor = (bucket: Bucket, ip: string) => {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return `${bucket}:${createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32)}`;
};

/** Counts this request and says whether it may go ahead. Always true when Supabase isn't configured (preview). */
export async function allow(bucket: Bucket, request: Request): Promise<boolean> {
  if (!supabaseConfigured) return true;
  const { max, windowSeconds } = LIMITS[bucket];
  try {
    const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
      p_key: keyFor(bucket, clientIp(request)),
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data !== false;
  } catch (err) {
    console.error("[rate-limit] check failed, allowing", { bucket }, err);
    return true;
  }
}

export const tooMany = () =>
  Response.json({ error: "Too many tries from this connection. Please wait a few minutes and try again." }, { status: 429 });
