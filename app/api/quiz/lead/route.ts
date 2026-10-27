import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { isSessionId } from "@/lib/quiz-track";
import { quizData } from "@/lib/quiz";
import { quizResult } from "@/lib/quiz-plan";
import { sendEmail } from "@/lib/email/send";
import { quizResultEmail } from "@/lib/email/templates";
import { allow, tooMany } from "@/lib/rate-limit";
import { confirmUrl } from "@/lib/consent";

// The /code email gate: saves the parent's email (one row per address) and sends the result they're about to see.
// The screen shows the result whatever happens here, so only a bad email address (and too many tries) is reported back.
// A script can't use this to mail strangers: one result email per quiz visit we saw (claimed atomically), one per
// address a day, a few per IP an hour. Ticking the weekly tips only asks: the email carries the confirm link.
type Body = { sid?: unknown; email?: unknown; consent?: unknown; age?: unknown; moments?: unknown; sleep?: unknown; villains?: unknown };

const DAY = 86_400_000;

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
  if (!(await allow("quizLead", request))) return tooMany();

  const sid = isSessionId(body.sid) ? body.sid : null;
  const consent = body.consent === true;
  const moments = Array.isArray(body.moments) ? body.moments.filter((m): m is string => typeof m === "string").slice(0, 3) : [];
  const s = body.sleep as { bed?: unknown; wake?: unknown } | null | undefined;
  const sleep = s && Number.isInteger(s.bed) && Number.isInteger(s.wake) ? { bed: s.bed as number, wake: s.wake as number } : null;
  const villains = Array.isArray(body.villains) ? body.villains.filter((v): v is string => typeof v === "string").slice(0, 6) : null;
  const result = quizResult(quizData(), { age: typeof body.age === "string" ? body.age : null, moments, sleep, villains });

  // Without Supabase (local preview) there is nothing to check against: send, if SES is configured at all.
  let send = !supabaseConfigured;
  let tipsUrl: string | undefined;
  if (supabaseConfigured) {
    try {
      const db = createAdminClient();
      const now = new Date().toISOString();

      // This visit's one result email. The update only matches a visit we saw that hasn't been emailed yet.
      const { data: claimed, error: claimError } = sid
        ? await db.from("quiz_sessions").update({ emailed_at: now }).eq("id", sid).is("emailed_at", null).select("id")
        : { data: [], error: null };
      if (claimError) throw claimError;
      const session = Boolean(claimed?.length);

      const { data: known, error: knownError } = await db.from("quiz_leads").select("tips_consent").eq("email", email).maybeSingle();
      if (knownError) throw knownError;
      // A second quiz never takes back a "yes" to tips; unticking isn't an unsubscribe.
      const wantsTips = consent && !known?.tips_consent;
      const row = { email, ...(session ? { session_id: sid } : {}), ...(wantsTips ? { tips_requested_at: now } : {}) };
      const { error } = known ? await db.from("quiz_leads").update(row).eq("email", email) : await db.from("quiz_leads").insert(row);
      if (error) throw error;

      if (session) {
        // One result email per address a day, however many visits ask for it.
        const dayAgo = new Date(Date.now() - DAY).toISOString();
        const { data: mine, error: capError } = await db
          .from("quiz_leads")
          .update({ result_emailed_at: now })
          .eq("email", email)
          .or(`result_emailed_at.is.null,result_emailed_at.lt."${dayAgo}"`)
          .select("token");
        if (capError) throw capError;
        send = Boolean(mine?.length);
        if (send && wantsTips) tipsUrl = confirmUrl(mine![0].token);
      }
    } catch (err) {
      console.error("[quiz] lead not saved", err);
    }
  }

  if (result && send) {
    try {
      await sendEmail(email, quizResultEmail(result, { confirmTipsUrl: tipsUrl }), { tag: "quiz-result" });
    } catch (err) {
      console.error("[quiz] result email failed", err);
    }
  }
  return NextResponse.json({ ok: true });
}
