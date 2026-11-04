import { NextResponse, type NextRequest } from "next/server";
import { creemConfigured, productIdFor } from "@/lib/creem";
import { SITE_URL } from "@/lib/design";
import { sendEmail } from "@/lib/email/send";
import { planSaved } from "@/lib/email/templates";
import { ITEMS } from "@/lib/funnel";
import { parsePlanRequest } from "@/lib/personal-plan";
import { planPayPath } from "@/lib/personal-plan-form";
import { isSessionId } from "@/lib/quiz-track";
import { allow, tooMany } from "@/lib/rate-limit";
import { supabaseConfigured } from "@/lib/supabase/env";
import { looseAdmin } from "@/lib/supabase/loose";

// Step 1 of the Personal plan (components/funnel/PersonalPlanForm.tsx): saves the parent's answers and email as a
// plan_requests row (status new) and emails them an "answers saved" note with a link to pay whenever they want. Nothing is
// charged here. Paying is step 2, optional: app/api/personal-plan/checkout. Unpaid rows are deleted after 30 days.

export async function POST(request: NextRequest) {
  if (!supabaseConfigured) return NextResponse.json({ error: "Not available right now. Please try again in a minute." }, { status: 503 });
  if (!(await allow("planRequest", request))) return tooMany();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const parsed = parsePlanRequest(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error, field: parsed.field }, { status: 400 });
  const b = body as Record<string, unknown>;

  const { data, error } = await looseAdmin()
    .from("plan_requests")
    .insert({
      ...parsed.value,
      status: "new",
      visitor_id: isSessionId(b.visitor) ? b.visitor : null,
      session_id: isSessionId(b.session) ? b.session : null,
      utm_source: typeof b.utm_source === "string" && b.utm_source.trim() ? b.utm_source.trim().slice(0, 80).toLowerCase() : null,
    })
    .select("id");
  if (error || !data?.length) {
    console.error("[personal-plan] not saved", error);
    return NextResponse.json({ error: "That didn’t go through on our side. Please try again in a minute." }, { status: 500 });
  }
  const id = data[0].id as string;
  const payable = creemConfigured && Boolean(productIdFor(ITEMS.personalPlan.id));

  // A failed email is only logged: the answers are saved and the next screen offers the payment anyway.
  try {
    await sendEmail(parsed.value.email, planSaved(parsed.value.name, parsed.value.moment, `${SITE_URL}${planPayPath(id)}`, payable), { tag: "plan-saved" });
  } catch (err) {
    console.error("[email] plan saved failed", { request: id }, err);
  }
  return NextResponse.json({ id, payable });
}
