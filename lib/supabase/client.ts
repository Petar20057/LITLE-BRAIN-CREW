"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { requireSupabaseEnv } from "./env";

// Supabase in Client Components. Runs as the signed-in parent, so row level security decides
// what it can read. createBrowserClient reuses one instance per tab.
export function createClient() {
  const { url, key } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, key);
}
