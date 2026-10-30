import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

// /admin is for the team only. An admin is a Supabase auth user with app_metadata.role = "admin", which only the
// secret key can set (scripts/create-admin.mjs). Parents who sign in to their Club account never have it.

export async function getAdmin() {
  if (!supabaseConfigured) return null;
  const { data } = await (await createClient()).auth.getClaims();
  const claims = data?.claims;
  return claims?.app_metadata?.role === "admin" ? { email: claims.email ?? "" } : null;
}

/** Call at the top of every /admin page and route before reading any numbers. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export const RANGES = [7, 30, 90, 365] as const;

/** ?days= from the URL, one of RANGES (default 30), and the matching start time. */
export function rangeFrom(days: unknown) {
  const d = RANGES.find((r) => String(r) === days) ?? 30;
  return { days: d, since: new Date(Date.now() - d * 86_400_000).toISOString() };
}

export const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}%` : "–");
export const num = (n: number) => n.toLocaleString("en-US");

/** Two-sided confidence (0–1) that two rates really differ: a two-proportion z-test, x of n against y of m.
 *  Good enough to say "too early" or "probably real" on /admin/tests; not a substitute for waiting for enough visitors. */
export function confidence(x: number, n: number, y: number, m: number): number | null {
  if (n < 1 || m < 1) return null;
  const p = (x + y) / (n + m);
  const se = Math.sqrt(p * (1 - p) * (1 / n + 1 / m));
  if (!se) return null;
  const z = Math.abs(x / n - y / m) / se;
  return 1 - 2 * (1 - normalCdf(z));
}

/** Standard normal CDF (Abramowitz–Stegun 7.1.26 erf approximation, error below 1.5e-7). */
function normalCdf(z: number) {
  const t = 1 / (1 + 0.3275911 * (z / Math.SQRT2));
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-(z * z) / 2);
  return 0.5 * (1 + erf);
}
