import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { isEvent, isSessionId, isStep, isVariant } from "@/lib/quiz-track";
import { AGES, DUO_OPTIONS, MAX_MOMENTS, MOMENTS } from "@/content/quiz";
import type { Database } from "@/lib/supabase/database.types";

// One click in the /code quiz (components/quiz/session.ts → track()). Anonymous and fire-and-forget: the browser
// never waits for it, so every failure answers 204 and is only logged. Only known steps, events and answers are
// stored, and values are capped, so the tables can't be filled with arbitrary text.

type Session = Database["public"]["Tables"]["quiz_sessions"]["Update"];
const ORIGIN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "keyword", "referrer", "device"] as const;
const CHECKOUTS = ["guide", "program"];

const text = (v: unknown, max = 80) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

export async function POST(request: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  if (!supabaseConfigured) return done;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return done;
  }
  const { sid, variant, step, event, value } = body;
  if (!isSessionId(sid) || !isVariant(variant) || !isStep(step) || !isEvent(event)) return done;
  const json = value === undefined ? null : JSON.stringify(value);
  if (json && json.length > 500) return done;
  const ms = typeof body.ms === "number" && body.ms >= 0 ? Math.min(Math.round(body.ms), 3_600_000) : null;

  try {
    const db = createAdminClient();

    // The first event of a page load carries where the visit came from; the first one ever creates the session.
    if (body.origin && typeof body.origin === "object") {
      const o = body.origin as Record<string, unknown>;
      const row = Object.fromEntries(ORIGIN_KEYS.map((k) => [k, text(o[k])]));
      const { error } = await db.from("quiz_sessions").upsert({ id: sid, variant, ...row }, { onConflict: "id", ignoreDuplicates: true });
      if (error) throw error;
    }

    const { error } = await db.from("quiz_events").insert({ session_id: sid, step, event, value: json ? JSON.parse(json) : null, ms });
    if (error) throw error;

    // Keep the session row current, so totals don't need to scan every event.
    const patch: Session = {};
    if (event === "view") {
      patch.last_step = step;
      if (step === "result") {
        await db.from("quiz_sessions").update({ result_at: new Date().toISOString() }).eq("id", sid).is("result_at", null);
      }
    }
    if (event === "answer") {
      if (step === "age" && AGES.some((a) => a.id === value)) patch.age = value as string;
      if (step === "moments" && Array.isArray(value)) patch.moments = value.filter((m) => MOMENTS.some((x) => x.id === m)).slice(0, MAX_MOMENTS);
      if (step === "duo" && DUO_OPTIONS.some((d) => d.id === value)) patch.duo = value as string;
    }
    if (event === "click" && step === "result") {
      const to = (value as { to?: unknown } | null)?.to;
      if (typeof to === "string" && CHECKOUTS.includes(to)) Object.assign(patch, { checkout_at: new Date().toISOString(), checkout_product: to });
    }
    if (Object.keys(patch).length) await db.from("quiz_sessions").update(patch).eq("id", sid);
  } catch (err) {
    console.error("[quiz] event not saved", { step, event }, err);
  }
  return done;
}
