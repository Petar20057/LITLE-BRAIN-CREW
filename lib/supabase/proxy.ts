import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

// Keeps the parent's sign-in fresh. Server Components can read cookies but not write them, so the
// refreshed token is written here, before the page renders. Called from /proxy.ts.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseConfigured) return response;

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Auth responses must not be cached by a CDN, or one parent's session could reach another.
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Nothing may run between createServerClient and getClaims: this call is what refreshes the token.
  await supabase.auth.getClaims();

  return response;
}
