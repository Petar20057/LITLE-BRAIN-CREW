import { NextResponse, type NextRequest } from "next/server";
import { ITEMS } from "@/lib/funnel";
import { keyForProduct, verifyWebhook, webhookConfigured } from "@/lib/creem";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

// Creem → us. Set this URL as the webhook in the Creem dashboard: <site>/api/creem/webhook.
// Mirrors Crew Club subscriptions into Supabase (the source of truth stays Creem), so pages can check access with
// has_club_access(). One-time products (Toolkit, Reset, ...) are only logged: emailing the files is not built yet.
// Any failure answers 500 so Creem retries; writes are idempotent (one row per Creem subscription id).

type Status = Database["public"]["Enums"]["subscription_status"];
type Plan = Database["public"]["Enums"]["club_plan"];

const STATUSES: Status[] = ["trialing", "active", "past_due", "unpaid", "paused", "scheduled_cancel", "expired", "canceled"];
const PLANS: Record<string, { plan: Plan; cents: number; interval: "month" | "year" }> = {
  "club-monthly": { plan: "club_monthly", cents: ITEMS.clubMonthly.price * 100, interval: "month" },
  "club-yearly": { plan: "club_yearly", cents: ITEMS.clubYearly.price * 100, interval: "year" },
};

type Ref = string | { id?: string; email?: string } | null | undefined;
type CreemSubscription = {
  id?: string;
  status?: string;
  product?: Ref;
  customer?: Ref;
  current_period_start_date?: string | null;
  current_period_end_date?: string | null;
  canceled_at?: string | null;
  metadata?: Record<string, unknown> | null;
};
type CreemEvent = { id?: string; eventType?: string; object?: Record<string, unknown> };

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
    if (type.startsWith("subscription.")) {
      await syncSubscription(obj as CreemSubscription);
    } else if (type === "checkout.completed") {
      const sub = obj.subscription as CreemSubscription | undefined;
      if (sub?.id) {
        // The checkout carries the product, customer and metadata; its subscription only has id and status.
        await syncSubscription({ ...sub, product: obj.product as Ref, customer: obj.customer as Ref, metadata: obj.metadata as CreemSubscription["metadata"] });
      } else {
        console.info("[creem] one-time order", { event: event.id, product: idOf(obj.product as Ref), metadata: obj.metadata });
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

async function syncSubscription(sub: CreemSubscription) {
  const key = keyForProduct(idOf(sub.product) ?? "");
  const plan = key ? PLANS[key] : undefined;
  const status = STATUSES.find((s) => s === sub.status);
  if (!sub.id || !plan || !status) {
    console.info("[creem] subscription skipped", { id: sub.id, product: idOf(sub.product), status: sub.status });
    return;
  }

  const admin = createAdminClient();
  const fields = {
    plan: plan.plan,
    status,
    price_cents: plan.cents,
    billing_interval: plan.interval,
    current_period_start: sub.current_period_start_date ?? null,
    current_period_end: sub.current_period_end_date ?? null,
    canceled_at: sub.canceled_at ?? null,
    cancel_at_period_end: status === "scheduled_cancel",
  };

  const { data: existing, error: findError } = await admin
    .from("subscriptions")
    .select("id")
    .eq("provider", "creem")
    .eq("provider_subscription_id", sub.id)
    .maybeSingle();
  if (findError) throw findError;

  if (existing) {
    const { error } = await admin.from("subscriptions").update(fields).eq("id", existing.id);
    if (error) throw error;
    return;
  }

  // First time we see this subscription: it needs the parent and the renewal consent from checkout metadata.
  const consent = sub.metadata?.renewal_consent_at;
  const email = typeof sub.customer === "object" ? sub.customer?.email : undefined;
  if (typeof consent !== "string" || !email) {
    console.info("[creem] new subscription without consent or email, waiting for checkout.completed", { id: sub.id });
    return;
  }
  const memberId = await memberFor(admin, email, idOf(sub.customer));
  const { error } = await admin.from("subscriptions").insert({
    ...fields,
    member_id: memberId,
    provider: "creem",
    provider_subscription_id: sub.id,
    renewal_consent_at: consent,
  });
  if (error) throw error;
}

// The parent's member row, by email. A first-time buyer gets a Supabase user (the members row follows from the
// on_auth_user_created trigger); they sign in later with that email.
async function memberFor(admin: ReturnType<typeof createAdminClient>, email: string, creemCustomerId?: string) {
  const address = email.trim().toLowerCase();
  const { data: found, error } = await admin.from("members").select("id, creem_customer_id").eq("email", address).maybeSingle();
  if (error) throw error;

  let id = found?.id;
  if (!id) {
    const { data, error: createError } = await admin.auth.admin.createUser({ email: address, email_confirm: true });
    if (createError || !data.user) throw createError ?? new Error("createUser returned no user");
    id = data.user.id;
  }
  if (creemCustomerId && !found?.creem_customer_id) {
    const { error: linkError } = await admin.from("members").update({ creem_customer_id: creemCustomerId }).eq("id", id);
    if (linkError) throw linkError;
  }
  return id;
}
