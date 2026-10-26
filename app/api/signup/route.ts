import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { isSignupForm } from "@/lib/analytics";
import { isSessionId } from "@/lib/quiz-track";
import type { Json } from "@/lib/supabase/database.types";

// An email form on the design pages (design/assets/site.js → post()): free tips, stickers, the challenge, waitlists,
// founding parents, schools. One row per email per form; signing up twice keeps the first. The page has already
// shown "thank you", so this only answers whether it was stored.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY = /^[a-z_]{1,30}$/;

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

  const { error } = await createAdminClient()
    .from("signups")
    .upsert(
      {
        email,
        form: body.form,
        page: text(body.page, 200),
        details: details(body.details),
        utm_source: text(body.utm_source)?.toLowerCase() ?? null,
        visitor_id: isSessionId(body.visitor) ? body.visitor : null,
      },
      { onConflict: "email,form", ignoreDuplicates: true },
    );
  if (error) {
    console.error("[signup] not saved", { form: body.form }, error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
