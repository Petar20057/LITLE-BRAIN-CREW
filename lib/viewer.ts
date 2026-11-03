import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { NO_VIEWER, type Viewer } from "./character-rules";

// Who is reading a locked character page. Reads the Supabase session cookie, so call it only inside a <Suspense>
// boundary (the public part of the page stays static). A signed-in parent with an active Crew Club subscription
// (has_club_access(), supabase/migrations/20261026120000_crew_club.sql) reads everything. One lookup per request
// (React cache), however many parts of a page ask. Packs come with phase 4:
// until an entitlement table exists nobody owns a pack. Anything that fails means "no access", never an error page.
export const currentViewer = cache(async (): Promise<Viewer> => {
  if (!supabaseConfigured) return NO_VIEWER;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) return NO_VIEWER;
    const { data: club } = await supabase.rpc("has_club_access");
    return { club: club === true, packs: [] };
  } catch {
    return NO_VIEWER;
  }
});
