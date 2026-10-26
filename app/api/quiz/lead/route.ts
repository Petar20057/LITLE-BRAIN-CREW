import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { isSessionId } from "@/lib/quiz-track";
import { quizData } from "@/lib/quiz";
import { quizResult } from "@/lib/quiz-plan";
import { sendEmail } from "@/lib/email/send";
import { quizResultEmail } from "@/lib/email/templates";

// The /code email gate: saves the parent's email (one row per address) and sends the result they're about to see.
// The screen shows the result whatever happens here, so only a bad email address is reported back.
type Body = { sid?: unknown; email?: unknown; consent?: unknown; age?: unknown; moments?: unknown };

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please check your email address." }, { status: 400 });
  }
  const sid = isSessionId(body.sid) ? body.sid : null;
  const consent = body.consent === true;
  const moments = Array.isArray(body.moments) ? body.moments.filter((m): m is string => typeof m === "string").slice(0, 3) : [];
  const result = quizResult(quizData(), typeof body.age === "string" ? body.age : null, moments);

  // One result email per quiz visit, and only for a visit we saw: a script can't use this to mail strangers.
  let send = !supabaseConfigured;
  if (supabaseConfigured) {
    try {
      const db = createAdminClient();
      const now = new Date().toISOString();
      const { data: session } = sid ? await db.from("quiz_sessions").select("emailed_at").eq("id", sid).maybeSingle() : { data: null };
      send = Boolean(session && !session.emailed_at);
      const { data: known } = await db.from("quiz_leads").select("tips_consent").eq("email", email).maybeSingle();
      // A second quiz never takes back a "yes" to tips; unticking isn't an unsubscribe.
      const row = { email, session_id: session ? sid : null, ...(consent && !known?.tips_consent ? { tips_consent: true, consent_at: now } : {}) };
      const { error } = known ? await db.from("quiz_leads").update(row).eq("email", email) : await db.from("quiz_leads").insert(row);
      if (error) throw error;
      if (session) await db.from("quiz_sessions").update({ emailed_at: now }).eq("id", sid!);
    } catch (err) {
      console.error("[quiz] lead not saved", err);
    }
  }

  if (result && send) {
    try {
      await sendEmail(email, quizResultEmail(result), { tag: "quiz-result" });
    } catch (err) {
      console.error("[quiz] result email failed", err);
    }
  }
  return NextResponse.json({ ok: true });
}
