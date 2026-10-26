import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { requireSupabaseEnv } from "./env";

// Supabase with the secret key: bypasses row level security. Only for trusted server code that
// acts for the business, not for a parent: Creem webhooks writing subscriptions, creating
// a member after checkout, signed links to the PDFs in private storage. Never import it into a page
// that renders user input without checking who is asking first.
export function createAdminClient() {
  const { url } = requireSupabaseEnv();
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Supabase admin is not configured: set SUPABASE_SECRET_KEY");

  return createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
