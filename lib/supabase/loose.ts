import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./admin";

// The admin client without the generated table types. Used only for the tables and functions added by
// supabase/migrations/20261028120000_orders_and_funnel_events.sql (orders, funnel_events, funnel_daily), which
// lib/supabase/database.types.ts doesn't know yet. After the migration is applied and `npm run db:types` has run,
// these call sites can switch back to createAdminClient() and the types will check them.
export const looseAdmin = () => createAdminClient() as unknown as SupabaseClient;
