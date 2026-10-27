import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { UNTRACKED } from "@/lib/analytics";
import { isSessionId } from "@/lib/quiz-track";
import { SITE_URL } from "@/lib/design";
import { allow } from "@/lib/rate-limit";

// One page view (components/Track.tsx, sent with sendBeacon). Anonymous and fire-and-forget: every failure answers
// 204 and is only logged. Bots are skipped, values are capped, and only the referrer's host is kept. No IP address
// or user agent is stored: the country comes from Vercel's header, the device type from the user agent.
// Rate-limited per IP (lib/rate-limit.ts), so a script can't fill the table or the numbers.

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch/i;
const SITE_HOST = new URL(SITE_URL).hostname.replace(/^www\./, "");

const text = (v: unknown, max = 80) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

function referrerHost(v: unknown) {
  if (typeof v !== "string" || !v) return null;
  try {
    const host = new URL(v).hostname.replace(/^www\./, "");
    return host === SITE_HOST || host === "localhost" ? null : host.slice(0, 80);
  } catch {
    return null;
  }
}

function device(ua: string) {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(request: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  if (!supabaseConfigured) return done;
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return done;

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done;
  }
  const { visitor, session, path } = body;
  if (!isSessionId(visitor) || !isSessionId(session)) return done;
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 200 || UNTRACKED.test(path)) return done;
  if (!(await allow("track", request))) return done;

  try {
    const { error } = await createAdminClient()
      .from("page_views")
      .insert({
        visitor_id: visitor,
        session_id: session,
        path,
        referrer: referrerHost(body.referrer),
        utm_source: text(body.utm_source)?.toLowerCase() ?? null,
        utm_medium: text(body.utm_medium)?.toLowerCase() ?? null,
        utm_campaign: text(body.utm_campaign),
        device: device(ua),
        country: text(request.headers.get("x-vercel-ip-country"), 2),
      });
    if (error) throw error;
  } catch (err) {
    console.error("[track] page view not saved", err);
  }
  return done;
}
