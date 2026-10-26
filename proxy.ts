import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Refreshes the Supabase sign-in only where a parent is signed in. The marketing pages and the
// funnel stay untouched (no auth round-trip on every ad click). Add paths here as they need a member.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/account/:path*"],
};
