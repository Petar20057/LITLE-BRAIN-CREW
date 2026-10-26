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
