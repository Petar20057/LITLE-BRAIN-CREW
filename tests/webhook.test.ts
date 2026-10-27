import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn(async () => "message-id") }));
// Product ids stay empty in lib/creem.ts until the Creem dashboard has them; the tests use two made-up ones.
vi.mock("@/lib/creem", async (original) => ({
  ...(await original<typeof import("@/lib/creem")>()),
  keyForProduct: (id: string) => ({ prod_monthly: "club-monthly", prod_yearly: "club-yearly" })[id],
}));

const { POST } = await import("@/app/api/creem/webhook/route");
const { sendEmail } = await import("@/lib/email/send");

const T0 = Date.parse("2026-11-01T10:00:00Z");

function deliver(event: Record<string, unknown>, signature?: string) {
  const body = JSON.stringify(event);
  const sig = signature ?? createHmac("sha256", "test-webhook-secret").update(body).digest("hex");
  return POST(new Request("https://www.littlebraincrew.com/api/creem/webhook", { method: "POST", body, headers: { "creem-signature": sig } }) as NextRequest);
}

const checkoutCompleted = {
  id: "evt_checkout",
  eventType: "checkout.completed",
  created_at: T0,
  object: {
    product: { id: "prod_monthly" },
    customer: { id: "cust_1", email: "Parent@Example.com" },
    metadata: { order: "club-monthly", renewal_consent_at: "2026-11-01T09:59:00Z" },
    subscription: { id: "sub_1", status: "active" },
  },
};

const subscriptionEvent = (id: string, status: string, at: number, extra: Record<string, unknown> = {}) => ({
  id,
  eventType: `subscription.${status}`,
  created_at: at,
  object: { id: "sub_1", status, product: { id: "prod_monthly" }, customer: { id: "cust_1", email: "parent@example.com" }, ...extra },
});

beforeEach(() => {
  fake.reset();
  vi.mocked(sendEmail).mockClear();
});

describe("Creem webhook", () => {
  it("refuses a request that isn't signed by Creem", async () => {
    const res = await deliver(checkoutCompleted, "0".repeat(64));
    expect(res.status).toBe(401);
    expect(fake.table("subscriptions")).toHaveLength(0);
  });

  it("first checkout creates the parent, the subscription and one welcome email", async () => {
    const res = await deliver(checkoutCompleted);
    expect(res.status).toBe(200);
    expect(fake.table("members")).toMatchObject([{ email: "parent@example.com", creem_customer_id: "cust_1" }]);
    expect(fake.table("subscriptions")).toMatchObject([{ status: "active", plan: "club_monthly", price_cents: 1900, renewal_consent_at: "2026-11-01T09:59:00Z" }]);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("a retried delivery changes nothing and sends no second email", async () => {
    await deliver(checkoutCompleted);
    await deliver(checkoutCompleted);
    expect(fake.table("subscriptions")).toHaveLength(1);
    expect(fake.table("members")).toHaveLength(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("an older event arriving late doesn't undo a newer cancellation", async () => {
    await deliver(checkoutCompleted);
    await deliver(subscriptionEvent("evt_cancel", "canceled", T0 + 60_000, { canceled_at: "2026-11-01T10:01:00Z" }));
    await deliver(subscriptionEvent("evt_active", "active", T0 + 30_000));
    expect(fake.table("subscriptions")[0]).toMatchObject({ status: "canceled", canceled_at: "2026-11-01T10:01:00Z" });
  });

  it("an event without period dates keeps the dates already stored", async () => {
    await deliver(checkoutCompleted);
    await deliver(subscriptionEvent("evt_paid", "active", T0 + 1000, { current_period_start_date: "2026-11-01T10:00:00Z", current_period_end_date: "2026-12-01T10:00:00Z" }));
    await deliver({ ...checkoutCompleted, id: "evt_checkout_again", created_at: T0 + 2000 });
    expect(fake.table("subscriptions")[0]).toMatchObject({ current_period_end: "2026-12-01T10:00:00Z" });
  });

  it("a subscription for a product we don't sell is skipped", async () => {
    const event = subscriptionEvent("evt_other", "active", T0, { product: { id: "prod_unknown" }, metadata: { renewal_consent_at: "x" } });
    expect((await deliver(event)).status).toBe(200);
    expect(fake.table("subscriptions")).toHaveLength(0);
  });

  it("marks the /code quiz visit an order came from as bought", async () => {
    const sid = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
    fake.seed("quiz_sessions", { id: sid });
    await deliver({ ...checkoutCompleted, object: { ...checkoutCompleted.object, subscription: undefined, metadata: { order: "guide", quiz_session: sid } } });
    expect(fake.table("quiz_sessions")[0]).toMatchObject({ purchase_order: "guide" });
    expect(fake.table("quiz_sessions")[0].purchased_at).toBeTruthy();
  });
});
