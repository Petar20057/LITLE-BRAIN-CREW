import { NextResponse, type NextRequest } from "next/server";
import { createCheckout, creemConfigured, productIdFor } from "@/lib/creem";
import { newDeliveryToken } from "@/lib/delivery";
import { CURRENT_CATALOG_VERSION } from "@/lib/delivery-files";
import { SITE_URL } from "@/lib/design";
import { ITEMS } from "@/lib/funnel";
import { isSessionId } from "@/lib/quiz-track";
import { allow, tooMany } from "@/lib/rate-limit";
import { supabaseConfigured } from "@/lib/supabase/env";
import { looseAdmin } from "@/lib/supabase/loose";

// Step 2 of the Personal plan, optional: the parent saved the form (app/api/personal-plan) and now wants to pay. Starts a
// $199 Creem checkout for the saved request, prefilled with the email they left, and answers its URL. The id comes from the
// form's response or from the "answers saved" email link (/personal-plan?r=<id>). The payment is confirmed by the webhook
// (lib/personal-plan.ts), never by the redirect back.

const CLOSED = "Payment opens in a few days. Your answers are saved, and we’ll email you as soon as you can pay.";

export async function POST(request: NextRequest) {
  if (!supabaseConfigured) return NextResponse.json({ error: "Not available right now. Please try again in a minute." }, { status: 503 });
  if (!(await allow("checkout", request))) return tooMany();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = body?.id;
  if (!isSessionId(id)) return NextResponse.json({ error: "We couldn’t find your answers. Please fill in the form again." }, { status: 400 });
  const productId = productIdFor(ITEMS.personalPlan.id);
  if (!creemConfigured || !productId) return NextResponse.json({ error: CLOSED, closed: true }, { status: 503 });

  const db = looseAdmin();
  const { data: row, error } = await db.from("plan_requests").select("id, email, status").eq("id", id).maybeSingle();
  if (error) {
    console.error("[personal-plan] checkout lookup failed", { request: id }, error);
    return NextResponse.json({ error: "That didn’t go through on our side. Please try again in a minute." }, { status: 500 });
  }
  if (!row) return NextResponse.json({ error: "We couldn’t find your answers. Unpaid answers are kept for 30 days; please fill in the form again." }, { status: 404 });
  if (row.status !== "new" && row.status !== "checkout") {
    return NextResponse.json({ error: "This plan is already paid. Your plan arrives by email; reply to the confirmation if you have a question." }, { status: 409 });
  }

  // The webhook gets the form's id back in the metadata and marks it paid; the token lets the thanks page confirm the payment.
  const delivery = newDeliveryToken();
  const metadata: Record<string, string> = { order: ITEMS.personalPlan.id, catalog_version: String(CURRENT_CATALOG_VERSION), request_id: row.id, delivery };
  if (isSessionId(body?.visitor)) metadata.visitor = body.visitor;
  if (isSessionId(body?.session)) metadata.session = body.session;
  let url: string;
  try {
    url = await createCheckout({ productId, email: row.email, successUrl: `${SITE_URL}/personal-plan/thanks`, requestId: `plan-${row.id}`, metadata });
  } catch (err) {
    console.error("[personal-plan] checkout failed", { request: row.id }, err);
    return NextResponse.json({ error: "Payment couldn’t start. Please try again." }, { status: 502 });
  }
  const { error: stateError } = await db.from("plan_requests").update({ status: "checkout", checkout_at: new Date().toISOString(), checkout_url: url }).eq("id", row.id);
  if (stateError) console.error("[personal-plan] checkout state not saved", { request: row.id }, stateError);
  return NextResponse.json({ url, delivery, email: row.email });
}
