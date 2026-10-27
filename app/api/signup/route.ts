import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SIGNUP_FORMS, isSignupForm } from "@/lib/analytics";
import { isSessionId } from "@/lib/quiz-track";
import type { Json } from "@/lib/supabase/database.types";
import { allow, tooMany } from "@/lib/rate-limit";
import { confirmUrl } from "@/lib/consent";
import { sendEmail } from "@/lib/email/send";
import { confirmSignup } from "@/lib/email/templates";

// An email form on the design pages (design/assets/site.js → post()): free tips, stickers, the challenge, waitlists,
// founding parents, schools. One row per email per form; signing up twice keeps the first. The page shows "thank you"
// only when this answers ok. Newsletter forms are double opt-in: the row counts once the emailed link is clicked
// (lib/consent.ts), and that email goes out at most once a day per address and form, a few signups per IP an hour.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY = /^[a-z_]{1,30}$/;
const DAY = 86_400_000;

const text = (v: unknown, max = 80) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** The form's other fields (age, video yes/no, what they want next, organization…), capped. */
function details(v: unknown): Json | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, string | string[]> = {};
  for (const [k, raw] of Object.entries(v).slice(0, 12)) {
    if (!KEY.test(k)) continue;
    const list = (Array.isArray(raw) ? raw : [raw]).map((x) => text(x, 500)).filter((x): x is string => Boolean(x)).slice(0, 10);
    if (list.length) out[k] = list.length === 1 ? list[0] : list;
  }
  return Object.keys(out).length ? out : null;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isSignupForm(body.form) || email.length > 254 || !EMAIL.test(email)) return NextResponse.json({ ok: false }, { status: 400 });
  if (!supabaseConfigured) return NextResponse.json({ ok: false }, { status: 503 });
  if (!(await allow("signup", request))) return tooMany();

  const form = body.form;
  const newsletter = SIGNUP_FORMS[form].newsletter;
  const db = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await db.from("signups").upsert(
    {
      email,
      form,
      page: text(body.page, 200),
      details: details(body.details),
      utm_source: text(body.utm_source)?.toLowerCase() ?? null,
      visitor_id: isSessionId(body.visitor) ? body.visitor : null,
      // Waitlists, founding parents and schools have nothing to confirm.
      confirmed_at: newsletter ? null : now,
    },
    { onConflict: "email,form", ignoreDuplicates: true },
  );
  if (error) {
    console.error("[signup] not saved", { form }, error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (newsletter) {
    // Claims this address's confirmation email for the day: a new row, or an unconfirmed one last asked over a day ago.
    const dayAgo = new Date(Date.now() - DAY).toISOString();
    const { data: claimed, error: claimError } = await db
      .from("signups")
      .update({ confirm_sent_at: now })
      .eq("email", email)
      .eq("form", form)
      .is("confirmed_at", null)
      .or(`confirm_sent_at.is.null,confirm_sent_at.lt."${dayAgo}"`)
      .select("confirm_token");
    if (claimError) console.error("[signup] confirmation not claimed", { form }, claimError);
    if (claimed?.length) {
      try {
        await sendEmail(email, confirmSignup(form, confirmUrl(claimed[0].confirm_token)), { tag: "confirm-signup" });
      } catch (err) {
        console.error("[signup] confirmation email failed", { form }, err);
      }
    }
  }
  return NextResponse.json({ ok: true });
}
