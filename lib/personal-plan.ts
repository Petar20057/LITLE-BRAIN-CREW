import "server-only";

import { tokenHash } from "./delivery";
import { CURRENT_CATALOG_VERSION } from "./delivery-files";
import { sendEmail } from "./email/send";
import { planConfirmation, planTeamNotification } from "./email/templates";
import { ITEMS } from "./funnel";
import { recordServerEvent, type Visit } from "./funnel-events";
import { AGE_MAX, AGE_MIN, MAX_ANSWERS_BYTES, MOMENT_OPTIONS, NAME_MAX, PLAN_FIELDS, type PlanStatus } from "./personal-plan-form";
import { looseAdmin } from "./supabase/loose";
import { supabaseConfigured } from "./supabase/env";

// The Personal plan ($199): a parent fills in the form on /personal-plan and leaves an email, the row is saved
// (app/api/personal-plan, status new) and they get an "answers saved" email with a link to pay. Paying is a second, optional
// step (app/api/personal-plan/checkout → Creem, status checkout); the webhook (app/api/creem/webhook) lands here to mark the
// form paid, record the order and tell the team.
// plan_requests is read with the loose client until supabase/migrations/20261103120000_plan_requests.sql is applied and
// `npm run db:types` has run (lib/supabase/loose.ts).

/** Whether the form can be saved: Supabase is configured and plan_requests exists (the migration is applied). Checked at most
 *  once a minute per server instance; once true it stays true. Until then /personal-plan shows the "email us" card instead of
 *  a form that would fail after ten minutes of answers. */
let formReady = false;
let formCheckedAt = 0;
export async function planFormReady(): Promise<boolean> {
  if (formReady) return true;
  // Local design work without a database (the web-nodb preview): show the form; saving answers 503 there.
  if (!supabaseConfigured && process.env.NODE_ENV === "development") return true;
  if (!supabaseConfigured || Date.now() - formCheckedAt < 60_000) return false;
  formCheckedAt = Date.now();
  try {
    const { error } = await looseAdmin().from("plan_requests").select("id", { count: "exact", head: true }).limit(1);
    if (error) console.info("[personal-plan] form closed: plan_requests is not readable", error.code);
    formReady = !error;
  } catch (err) {
    console.info("[personal-plan] form closed", err);
  }
  return formReady;
}

/** Where every paid request is announced, with the parent's answers. Empty env = the hello@ inbox. */
export const TEAM_EMAIL = process.env.TEAM_NOTIFY_EMAIL || "hello@littlebraincrew.com";

export type PlanAnswers = Record<string, string | string[]>;

/** One row of plan_requests. */
export type PlanRequestRow = {
  id: string;
  email: string;
  name: string;
  kid_age: number;
  moment: string;
  answers: PlanAnswers;
  status: PlanStatus;
  order_id: string | null;
  checkout_url: string | null;
  visitor_id: string | null;
  session_id: string | null;
  utm_source: string | null;
  created_at: string;
  checkout_at: string | null;
  paid_at: string | null;
  replied_at: string | null;
  closed_at: string | null;
};

export type PlanRequestInput = { name: string; email: string; kid_age: number; moment: string; answers: PlanAnswers };
export type ParsedPlanRequest = { ok: true; value: PlanRequestInput } | { ok: false; error: string; field?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** What the form says when a required answer is missing (the field names are for the browser to focus). */
const MISSING: Record<string, string> = {
  moment_other: "Please tell us about the moment in a sentence or two.",
  when_happens: "Please tell us when it happens.",
  tried: "Please tell us what you’ve tried, even if it was nothing.",
  good_week: "Please tell us what a good week would look like.",
};

/** Checks and trims what the browser sent. Unknown keys are dropped, long text is cut at the field's maximum, and a value
 *  that isn't one of a select's options is ignored. Only what the parent is asked for is stored. */
export function parsePlanRequest(body: unknown): ParsedPlanRequest {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Bad request." };
  const b = body as Record<string, unknown>;
  const name = text(b.name, NAME_MAX);
  if (!name) return { ok: false, error: "Please tell us your first name.", field: "name" };
  const email = text(b.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: "Please enter a valid email.", field: "email" };
  const age = b.kid_age;
  if (typeof age !== "number" || !Number.isInteger(age) || age < AGE_MIN || age > AGE_MAX) {
    return { ok: false, error: `Please choose your kid’s age (${AGE_MIN} to ${AGE_MAX}).`, field: "kid_age" };
  }
  const moment = text(b.moment, 40);
  if (!MOMENT_OPTIONS.includes(moment)) return { ok: false, error: "Please pick the moment you want help with.", field: "moment" };

  const raw = b.answers && typeof b.answers === "object" && !Array.isArray(b.answers) ? (b.answers as Record<string, unknown>) : {};
  const answers: PlanAnswers = {};
  for (const f of PLAN_FIELDS) {
    const v = raw[f.key];
    if (f.kind === "multi") {
      const list = (Array.isArray(v) ? v : v == null ? [] : [v]).filter((x): x is string => typeof x === "string");
      const valid = [...new Set(list.filter((x) => f.options!.some((o) => o.value === x)))];
      if (valid.length) answers[f.key] = valid;
    } else if (f.kind === "select") {
      const s = text(v, f.max);
      if (s && f.options!.some((o) => o.value === s)) answers[f.key] = s;
    } else {
      const s = text(v, f.max);
      if (s) answers[f.key] = s;
    }
    const required = f.required || (f.key === "moment_other" && moment === "other");
    if (required && !answers[f.key]) return { ok: false, error: MISSING[f.key] ?? `Please fill in “${f.label}”.`, field: f.key };
  }
  if (Buffer.byteLength(JSON.stringify(answers)) > MAX_ANSWERS_BYTES) return { ok: false, error: "That’s a lot of text. Please shorten your answers a little." };
  return { ok: true, value: { name, email, kid_age: age, moment, answers } };
}

export type PlanPurchase = {
  providerOrderId: string;
  email: string;
  /** Actual amount from Creem's signed event, including discounts. Zero must stay zero. */
  amountCents?: number;
  /** The delivery token from checkout metadata: only its hash is stored, so /api/order can confirm the payment to the thanks page. */
  token: string | null;
  /** plan_requests.id from checkout metadata; null when the webhook carries none (the team email says so). */
  requestId: string | null;
  visit?: Visit;
};

/** After a paid Personal plan (Creem checkout.completed): one `orders` row (idempotent on the Creem order id), the form row
 *  marked paid, the purchase event, then one email to the parent and one to the team. A retried webhook writes and sends
 *  nothing; a retry after a failure between the two writes still sends both emails once. */
export async function recordPlanPurchase(p: PlanPurchase): Promise<void> {
  const admin = looseAdmin();
  const address = p.email.trim().toLowerCase();
  const amountCents = p.amountCents ?? ITEMS.personalPlan.price * 100;
  const { data: inserted, error } = await admin
    .from("orders")
    .upsert(
      {
        provider_order_id: p.providerOrderId,
        email: address,
        order_key: ITEMS.personalPlan.id,
        items: [ITEMS.personalPlan.id],
        amount_cents: amountCents,
        delivery_hash: p.token ? tokenHash(p.token) : null,
        catalog_version: CURRENT_CATALOG_VERSION,
        parent_order_id: null,
      },
      { onConflict: "provider_order_id", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw error;
  const isNew = Boolean(inserted?.length);
  let orderId: string | undefined = inserted?.[0]?.id;
  if (!orderId) {
    const { data: existing, error: findError } = await admin.from("orders").select("id").eq("provider_order_id", p.providerOrderId).maybeSingle();
    if (findError) throw findError;
    orderId = existing?.id;
  }

  // The form row, marked paid once: a row already paid (or replied) matches nothing and stays as the team left it.
  let request: PlanRequestRow | null = null;
  let changed = false;
  if (p.requestId) {
    const { data: rows, error: updateError } = await admin
      .from("plan_requests")
      .update({ status: "paid", paid_at: new Date().toISOString(), order_id: orderId ?? null })
      .eq("id", p.requestId)
      .or("status.eq.new,status.eq.checkout")
      .select("*");
    if (updateError) throw updateError;
    changed = Boolean(rows?.length);
    request = (rows?.[0] as PlanRequestRow | undefined) ?? null;
    if (!request) {
      const { data: found, error: readError } = await admin.from("plan_requests").select("*").eq("id", p.requestId).maybeSingle();
      if (readError) throw readError;
      request = (found as PlanRequestRow | null) ?? null;
    }
  }

  if (isNew) {
    try {
      await recordServerEvent("purchase", ITEMS.personalPlan.id, amountCents, p.visit);
    } catch (err) {
      console.error("[funnel] purchase event not saved", { order: p.providerOrderId }, err);
    }
  }
  if (!isNew && !changed) return; // a retried webhook: all of this was done the first time

  // Failed emails are only logged: the order and the paid form are saved, and Creem must not retry work that's done.
  try {
    await sendEmail(address, planConfirmation(request?.name, amountCents), { tag: "plan-confirmation" });
  } catch (err) {
    console.error("[email] plan confirmation failed", { order: p.providerOrderId }, err);
  }
  try {
    await sendEmail(TEAM_EMAIL, planTeamNotification({ request, email: address, amountCents, providerOrderId: p.providerOrderId, requestId: p.requestId }), { tag: "plan-team" });
  } catch (err) {
    console.error("[email] plan team notification failed", { order: p.providerOrderId }, err);
  }
}
