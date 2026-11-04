import { NextResponse, type NextRequest } from "next/server";
import { creemConfigured, productIdFor } from "@/lib/creem";
import { SITE_URL } from "@/lib/design";
import { emailConfigured, sendEmail } from "@/lib/email/send";
import { planRequestTeam, planSaved, planThanks } from "@/lib/email/templates";
import { ITEMS } from "@/lib/funnel";
import { TEAM_EMAIL, parsePlanRequest } from "@/lib/personal-plan";
import { planPayPath } from "@/lib/personal-plan-form";
import { isSessionId } from "@/lib/quiz-track";
import { allow, tooMany } from "@/lib/rate-limit";
import { supabaseConfigured } from "@/lib/supabase/env";
import { looseAdmin } from "@/lib/supabase/loose";

// The Personal plan form (components/funnel/PersonalPlanForm.tsx). Every form goes to the team inbox by email (Amazon SES,
// TEAM_EMAIL, Reply-To = the parent) with all the answers, and the parent gets an email right away:
//   - no online payment yet (no Creem product, or no saved row): "Thank you for ordering your Personal plan, we'll send it
//     as soon as possible" (planThanks);
//   - online payment open and the row saved: "answers saved" with a link to pay whenever they want (planSaved); paying is the
//     optional step 2, app/api/personal-plan/checkout.
// The row is also saved in plan_requests (status new) when the table exists; if it doesn't (or the insert fails), the team
// email is the copy. The request fails only when neither the database nor the email could take the answers.

export async function POST(request: NextRequest) {
  if (!supabaseConfigured && !emailConfigured) return NextResponse.json({ error: "Not available right now. Please email hello@littlebraincrew.com." }, { status: 503 });
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
  const p = parsed.value;

  let id: string | null = null;
  if (supabaseConfigured) {
    try {
      const { data, error } = await looseAdmin()
        .from("plan_requests")
        .insert({
          ...p,
          status: "new",
          visitor_id: isSessionId(b.visitor) ? b.visitor : null,
          session_id: isSessionId(b.session) ? b.session : null,
          utm_source: typeof b.utm_source === "string" && b.utm_source.trim() ? b.utm_source.trim().slice(0, 80).toLowerCase() : null,
        })
        .select("id");
      if (error) throw error;
      id = (data?.[0]?.id as string | undefined) ?? null;
    } catch (err) {
      // Not saved (the table may not exist yet): the team email below is the copy of the answers.
      console.error("[personal-plan] not saved in the database, sending by email only", err);
    }
  }
  const payable = Boolean(id) && creemConfigured && Boolean(productIdFor(ITEMS.personalPlan.id));

  let teamSent = false;
  try {
    teamSent = Boolean(await sendEmail(TEAM_EMAIL, planRequestTeam({ request: p, email: p.email, requestId: id }), { tag: "plan-request-team", replyTo: p.email }));
  } catch (err) {
    console.error("[email] plan request to the team failed", { request: id }, err);
  }
  if (!id && !teamSent) {
    return NextResponse.json({ error: "That didn’t go through on our side. Please try again in a minute, or email hello@littlebraincrew.com." }, { status: 500 });
  }
  // A failed parent email is only logged: the team has the answers and writes back anyway.
  try {
    const mail = payable && id ? planSaved(p.name, p.moment, `${SITE_URL}${planPayPath(id)}`, true) : planThanks(p.name, p.moment);
    await sendEmail(p.email, mail, { tag: payable ? "plan-saved" : "plan-thanks" });
  } catch (err) {
    console.error("[email] plan thank-you failed", { request: id }, err);
  }
  return NextResponse.json({ id, payable });
}
