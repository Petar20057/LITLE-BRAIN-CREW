// Supabase settings, read in one place. NEXT_PUBLIC_* values are inlined at build time, so they
// must be read as literal process.env.NEXT_PUBLIC_X (no dynamic keys).
// The publishable key (sb_publishable_…) replaces the old anon JWT; the anon key is the fallback.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** False until the URL and publishable key are set: callers skip Supabase and keep the preview working. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export function requireSupabaseEnv() {
  if (!supabaseConfigured) {
    throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  return { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY };
}
