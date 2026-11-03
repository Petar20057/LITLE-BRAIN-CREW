import { NextResponse, type NextRequest } from "next/server";
import { createCheckout, creemConfigured, productIdFor } from "@/lib/creem";
import { newDeliveryToken } from "@/lib/delivery";
import { CURRENT_CATALOG_VERSION } from "@/lib/delivery-files";
import { SITE_URL } from "@/lib/design";
import { ITEMS } from "@/lib/funnel";
import { parsePlanRequest } from "@/lib/personal-plan";
import { isSessionId } from "@/lib/quiz-track";
import { allow, tooMany } from "@/lib/rate-limit";
import { supabaseConfigured } from "@/lib/supabase/env";
import { looseAdmin } from "@/lib/supabase/loose";

// The Personal plan form (components/funnel/PersonalPlanForm.tsx): saves the parent's answers as a plan_requests row, then
// starts the $199 Creem checkout for them and answers its URL (the browser goes there). The payment is confirmed by the
// webhook (lib/personal-plan.ts), never by the redirect back. While the Creem product id is empty the plan is closed and
// nothing is stored: we don't collect a family's details for something that can't be bought.

const CLOSED = "The Personal plan opens in a few days. Email hello@littlebraincrew.com if you’d like one now.";

export async function POST(request: NextRequest) {
  const productId = productIdFor(ITEMS.personalPlan.id);
  if (!creemConfigured || !productId) return NextResponse.json({ error: CLOSED }, { status: 503 });
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
  const visitor = isSessionId(b.visitor) ? b.visitor : null;
  const session = isSessionId(b.session) ? b.session : null;

  const db = looseAdmin();
  const { data, error } = await db
    .from("plan_requests")
    .insert({
      ...parsed.value,
      status: "new",
      visitor_id: visitor,
      session_id: session,
      utm_source: typeof b.utm_source === "string" && b.utm_source.trim() ? b.utm_source.trim().slice(0, 80).toLowerCase() : null,
    })
    .select("id");
  if (error || !data?.length) {
    console.error("[personal-plan] not saved", error);
    return NextResponse.json({ error: "That didn’t go through on our side. Please try again in a minute." }, { status: 500 });
  }
  const id = data[0].id as string;

  // The webhook gets the form's id back in the metadata and marks it paid; the token lets the thanks page confirm the payment.
  const delivery = newDeliveryToken();
  const metadata: Record<string, string> = { order: ITEMS.personalPlan.id, catalog_version: String(CURRENT_CATALOG_VERSION), request_id: id, delivery };
  if (visitor) metadata.visitor = visitor;
  if (session) metadata.session = session;
  let url: string;
  try {
    url = await createCheckout({ productId, email: parsed.value.email, successUrl: `${SITE_URL}/personal-plan/thanks`, requestId: `plan-${id}`, metadata });
  } catch (err) {
    // The answers are saved (status new): the team sees them in /admin/personal-plans and can send the link by hand.
    console.error("[personal-plan] checkout failed", { request: id }, err);
    return NextResponse.json({ error: "Payment couldn’t start. Please try again." }, { status: 502 });
  }
  const { error: stateError } = await db.from("plan_requests").update({ status: "checkout", checkout_at: new Date().toISOString(), checkout_url: url }).eq("id", id);
  if (stateError) console.error("[personal-plan] checkout state not saved", { request: id }, stateError);
  return NextResponse.json({ url, delivery });
}
