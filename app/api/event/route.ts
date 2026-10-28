import { NextResponse, type NextRequest } from "next/server";
import { looseAdmin } from "@/lib/supabase/loose";
import { supabaseConfigured } from "@/lib/supabase/env";
import { isSessionId } from "@/lib/quiz-track";
import { UNTRACKED } from "@/lib/analytics";
import { allow } from "@/lib/rate-limit";
import { cleanPlace, isBot, isBrowserEvent } from "@/lib/funnel-events";

// One funnel step from the browser (lib/track-event.ts, sent with sendBeacon): buy_click, checkout_view, bump_checked,
// email_signup, moment_click. Anonymous and fire-and-forget: every failure answers 204 and is only logged. Only the
// names in EVENT_NAMES are kept, except purchase and post_bump_purchase, which only the server writes (Creem webhook).
// Rate-limited per IP (the "event" bucket in lib/rate-limit.ts).

export async function POST(request: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  if (!supabaseConfigured) return done;
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || isBot(ua)) return done;

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done;
  }
  const { name, visitor, session, path } = body;
  if (!isBrowserEvent(name)) return done;
  if (!isSessionId(visitor) || !isSessionId(session)) return done;
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 200 || UNTRACKED.test(path)) return done;
  if (!(await allow("event", request))) return done;

  try {
    const { error } = await looseAdmin()
      .from("funnel_events")
      .insert({ name, visitor_id: visitor, session_id: session, place: cleanPlace(body.place), path });
    if (error) throw error;
  } catch (err) {
    console.error("[event] not saved", { name }, err);
  }
  return done;
}
