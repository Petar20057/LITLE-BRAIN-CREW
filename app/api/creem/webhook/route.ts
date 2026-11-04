import { NextResponse, type NextRequest } from "next/server";
import { ITEMS } from "@/lib/funnel";
import { keyForProduct, verifyWebhook, webhookConfigured } from "@/lib/creem";
import { recordPaidOrder } from "@/lib/delivery";
import { recordPlanPurchase } from "@/lib/personal-plan";
import { catalogVersion } from "@/lib/delivery-files";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSessionId } from "@/lib/quiz-track";

// Creem → us. Set this URL as the webhook in the Creem dashboard: <site>/api/creem/webhook.
// One-time products (Toolkit, Bedtime Kit, Reset, the upgrade) are saved to `orders` once, with their purchase event and
// receipt email (lib/delivery.ts); a paid Personal plan marks its form row paid and emails the team instead
// (lib/personal-plan.ts). Nothing we sell renews: the Crew Club membership was removed on 2026-11-04, so subscription
// events (and a checkout that carries a subscription) are logged and ignored. The `subscriptions` table it used to
// mirror stays in the database, unused.
// Any failure answers 500 so Creem retries; writes are idempotent (one row per Creem order).

type Ref = string | { id?: string; email?: string } | null | undefined;
type CreemEvent = { id?: string; eventType?: string; created_at?: number; object?: Record<string, unknown> };

const idOf = (r: Ref) => (typeof r === "string" ? r : r?.id);

export async function POST(request: NextRequest) {
  if (!webhookConfigured) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const raw = await request.text();
  if (!verifyWebhook(raw, request.headers.get("creem-signature"))) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  let event: CreemEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  const type = event.eventType ?? "";
  const obj = event.object ?? {};

  try {
    if (type === "checkout.completed") {
      await markQuizPurchase(obj.metadata as Record<string, unknown> | null | undefined);
      if ((obj.subscription as { id?: string } | undefined)?.id) {
        console.info("[creem] subscription checkout ignored: nothing we sell renews", { event: event.id });
      } else {
        await oneTimeOrder(obj, event.id ?? "");
      }
    } else {
      console.info("[creem] ignored", { event: event.id, type });
    }
  } catch (err) {
    console.error("[creem] webhook failed", { event: event.id, type }, err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

// A one-time order (Toolkit, Bedtime Kit): saved once, with its purchase event and receipt (lib/delivery.ts).
async function oneTimeOrder(obj: Record<string, unknown>, eventId: string) {
  const metadata = (obj.metadata ?? {}) as Record<string, unknown>;
  const customer = obj.customer as Ref;
  const email = typeof customer === "object" ? customer?.email : undefined;
  const orderKey = typeof metadata.order === "string" ? metadata.order : "";
  if (!orderKey || !email) {
    console.error("[creem] one-time order without order key or email", { event: eventId });
    return;
  }
  const checkoutId = typeof obj.id === "string" ? obj.id : undefined;
  const orderId = (obj.order as { id?: string } | undefined)?.id ?? checkoutId ?? eventId;
  const payment = obj.order as { amount_paid?: unknown; amount_due?: unknown } | undefined;
  const amount = payment?.amount_paid ?? payment?.amount_due;
  // Only signed provider data can set the amount. In particular, zero is a completed free order.
  if (amount != null && (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount < 0)) throw new Error("Invalid order payment amount");
  const amountCents = typeof amount === "number" ? amount : undefined;
  const token = typeof metadata.delivery === "string" ? metadata.delivery : null;
  const version = catalogVersion(metadata.catalog_version);
  if (version === 2 && keyForProduct(idOf(obj.product as Ref) ?? "") !== orderKey) throw new Error("Checkout product does not match the order");
  const visit = { visitor: isSessionId(metadata.visitor) ? metadata.visitor : null, session: isSessionId(metadata.session) ? metadata.session : null };
  if (orderKey === ITEMS.personalPlan.id) {
    // A paid Personal plan has no files: the form row is marked paid and the team gets the answers (lib/personal-plan.ts).
    await recordPlanPurchase({ providerOrderId: orderId, email, amountCents, token, requestId: isSessionId(metadata.request_id) ? metadata.request_id : null, visit });
    return;
  }
  const recorded = await recordPaidOrder({ providerOrderId: orderId, email, orderKey, token, visit, amountCents,
    catalogVersion: version,
    parentOrderId: typeof metadata.parent_order_id === "string" ? metadata.parent_order_id : undefined,
  });
  if (!recorded) console.info("[creem] one-time order not recognised", { event: eventId, orderKey });
}

/** An order that started on the /code quiz (metadata.quiz_session from /api/checkout): count it on /stats/quiz. */
async function markQuizPurchase(metadata: Record<string, unknown> | null | undefined) {
  const sid = metadata?.quiz_session;
  if (!isSessionId(sid)) return;
  const order = typeof metadata?.order === "string" ? metadata.order : null;
  const { error } = await createAdminClient()
    .from("quiz_sessions")
    .update({ purchased_at: new Date().toISOString(), purchase_order: order })
    .eq("id", sid)
    .is("purchased_at", null);
  if (error) throw error;
}
