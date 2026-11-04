import { createHash, createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn(async () => "message-id") }));
// Provider fixtures are isolated from the production product catalogue.
vi.mock("@/lib/creem", async (original) => ({
  ...(await original<typeof import("@/lib/creem")>()),
  keyForProduct: (id: string) => ({ prod_guide_v2: "guide", prod_plan: "personal-plan" })[id],
}));

const { POST } = await import("@/app/api/creem/webhook/route");
const { sendEmail } = await import("@/lib/email/send");

const T0 = Date.parse("2026-11-01T10:00:00Z");

function deliver(event: Record<string, unknown>, signature?: string) {
  const body = JSON.stringify(event);
  const sig = signature ?? createHmac("sha256", "test-webhook-secret").update(body).digest("hex");
  return POST(new Request("https://www.littlebraincrew.com/api/creem/webhook", { method: "POST", body, headers: { "creem-signature": sig } }) as NextRequest);
}

const guideOrder = {
  id: "evt_guide",
  eventType: "checkout.completed",
  created_at: T0,
  object: { id: "chk_guide", customer: { id: "cust_1", email: "Parent@Example.com" }, metadata: { order: "guide", delivery: "tok-guide" } },
};

beforeEach(() => {
  fake.reset();
  vi.mocked(sendEmail).mockClear();
});

describe("Creem webhook", () => {
  it("refuses a request that isn't signed by Creem", async () => {
    const res = await deliver(guideOrder, "0".repeat(64));
    expect(res.status).toBe(401);
    expect(fake.table("orders")).toHaveLength(0);
  });

  it("a subscription event is answered and ignored: nothing we sell renews", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const res = await deliver({
      id: "evt_sub",
      eventType: "subscription.active",
      created_at: T0,
      object: { id: "sub_1", status: "active", product: { id: "prod_monthly" }, customer: { id: "cust_1", email: "parent@example.com" } },
    });
    expect(res.status).toBe(200);
    expect(fake.table("orders")).toHaveLength(0);
    expect(fake.table("members")).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("a checkout that carries a subscription is ignored too, and creates no account", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const res = await deliver({
      ...guideOrder,
      id: "evt_sub_checkout",
      object: { ...guideOrder.object, product: { id: "prod_monthly" }, metadata: { order: "club-monthly" }, subscription: { id: "sub_1", status: "active" } },
    });
    expect(res.status).toBe(200);
    expect(fake.table("orders")).toHaveLength(0);
    expect(fake.table("members")).toHaveLength(0);
    expect(fake.table("funnel_events")).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("a paid order's purchase event carries the visit that bought, from the checkout metadata", async () => {
    const visitor = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
    const session = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
    const order = {
      id: "evt_visit",
      eventType: "checkout.completed",
      created_at: T0,
      object: { id: "chk_visit", customer: { id: "cust_3", email: "dad@example.com" }, metadata: { order: "guide", delivery: "tok-v", visitor, session } },
    };
    expect((await deliver(order)).status).toBe(200);
    expect(fake.table("funnel_events")).toMatchObject([{ name: "purchase", place: "guide", amount_cents: 1900, visitor_id: visitor, session_id: session }]);
  });

  it("ignores visit ids in the metadata that aren't ids", async () => {
    const order = {
      id: "evt_badvisit",
      eventType: "checkout.completed",
      created_at: T0,
      object: { id: "chk_bad", customer: { id: "cust_4", email: "x@example.com" }, metadata: { order: "guide", delivery: "tok-b", visitor: "drop table", session: 7 } },
    };
    expect((await deliver(order)).status).toBe(200);
    expect(fake.table("funnel_events")).toMatchObject([{ name: "purchase", visitor_id: null, session_id: null }]);
    expect(fake.table("orders")).toHaveLength(1);
  });

  it("a paid Toolkit + Bedtime Kit order is saved once, with its purchase event and a receipt with the download links", async () => {
    const order = {
      id: "evt_order",
      eventType: "checkout.completed",
      created_at: T0,
      object: { id: "chk_1", customer: { id: "cust_2", email: "Mom@Example.com" }, metadata: { order: "guide+bedtime-kit", delivery: "tok-abc" } },
    };
    expect((await deliver(order)).status).toBe(200);
    expect(fake.table("orders")).toMatchObject([
      { provider_order_id: "chk_1", email: "mom@example.com", order_key: "guide+bedtime-kit", items: ["guide", "bedtime-kit"], amount_cents: 2600 },
    ]);
    expect(fake.table("orders")[0].delivery_hash).toBe(createHash("sha256").update("tok-abc").digest("hex"));
    expect(fake.table("funnel_events")).toMatchObject([{ name: "purchase", place: "guide+bedtime-kit", amount_cents: 2600 }]);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const [to, email] = vi.mocked(sendEmail).mock.calls[0];
    expect(to).toBe("mom@example.com");
    expect(email.text).toContain("/api/download?t=tok-abc&f=toolkit-pdf");
    expect(email.text).toContain("/api/download?t=tok-abc&f=bedtime-audio");
  });

  it("a retried order delivery changes nothing and sends no second receipt", async () => {
    const order = {
      id: "evt_order_retry",
      eventType: "checkout.completed",
      created_at: T0,
      object: { id: "chk_2", customer: { email: "dad@example.com" }, metadata: { order: "guide", delivery: "tok-def" } },
    };
    await deliver(order);
    await deliver(order);
    expect(fake.table("orders")).toHaveLength(1);
    expect(fake.table("funnel_events")).toHaveLength(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it.each([0, 450])("a discounted order records the actual %s cents and still delivers the files", async (amount) => {
    const order = {
      id: "evt_discounted",
      eventType: "checkout.completed",
      object: {
        id: "chk_discounted", order: { id: "ord_discounted", amount_paid: amount, amount_due: 900 },
        customer: { email: "parent@example.com" }, metadata: { order: "guide", delivery: "tok-discount" },
      },
    };
    expect((await deliver(order)).status).toBe(200);
    expect(fake.table("orders")).toMatchObject([{ amount_cents: amount }]);
    expect(fake.table("funnel_events")).toMatchObject([{ amount_cents: amount }]);
    const receipt = vi.mocked(sendEmail).mock.calls[0][1];
    expect(receipt.text).toContain("/api/download?t=tok-discount&f=toolkit-pdf");
    expect(receipt.text).toContain(`Total paid: $${amount === 0 ? "0" : "4.50"}`);
    expect(receipt.text).toContain("Discounts & taxes");
    await deliver(order);
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("uses a zero amount due when a free order has no amount_paid field", async () => {
    await deliver({ id: "evt_free_due", eventType: "checkout.completed", object: {
      id: "chk_free_due", order: { amount_due: 0 }, customer: { email: "parent@example.com" },
      metadata: { order: "guide", delivery: "tok-free" },
    } });
    expect(fake.table("orders")).toMatchObject([{ amount_cents: 0 }]);
  });

  it.each([-1, 1.5, "0"])("refuses an invalid signed payment amount %s instead of inventing a paid total", async (amount) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await deliver({ id: "evt_invalid_amount", eventType: "checkout.completed", object: {
      id: "chk_invalid_amount", order: { amount_paid: amount }, customer: { email: "parent@example.com" },
      metadata: { order: "guide", delivery: "tok-invalid" },
    } });
    expect(response.status).toBe(500);
    expect(fake.table("orders")).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("the Bedtime Kit bought on its own is a post-bump purchase, for $7", async () => {
    await deliver({
      id: "evt_bedtime",
      eventType: "checkout.completed",
      created_at: T0,
      object: { id: "chk_3", customer: { email: "dad@example.com" }, metadata: { order: "bedtime-kit", delivery: "tok-ghi" } },
    });
    expect(fake.table("funnel_events")).toMatchObject([{ name: "post_bump_purchase", place: "bedtime-kit", amount_cents: 700 }]);
  });

  it("an order key we don't sell as a one-time product is not recorded", async () => {
    await deliver({
      id: "evt_unknown",
      eventType: "checkout.completed",
      created_at: T0,
      object: { id: "chk_4", customer: { email: "dad@example.com" }, metadata: { order: "guide+cards-unknown" } },
    });
    expect(fake.table("orders")).toHaveLength(0);
    expect(fake.table("funnel_events")).toHaveLength(0);
  });

  it("marks the /code quiz visit an order came from as bought", async () => {
    const sid = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
    fake.seed("quiz_sessions", { id: sid });
    await deliver({ ...guideOrder, object: { ...guideOrder.object, metadata: { order: "guide", quiz_session: sid } } });
    expect(fake.table("quiz_sessions")[0]).toMatchObject({ purchase_order: "guide" });
    expect(fake.table("quiz_sessions")[0].purchased_at).toBeTruthy();
  });

  it("records the v2 catalogue and the receipt links everything the Toolkit holds now", async () => {
    const response = await deliver({ id: "evt_v2", eventType: "checkout.completed", object: {
      id: "chk_v2", product: { id: "prod_guide_v2" }, order: { amount_paid: 1900 },
      customer: { email: "parent@example.com" }, metadata: { order: "guide", delivery: "tok-v2", catalog_version: "2" },
    } });
    expect(response.status).toBe(200);
    expect(fake.table("orders")[0].catalog_version).toBe(2);
    const receipt = vi.mocked(sendEmail).mock.calls[0][1];
    expect(receipt.text).toContain("toolkit-pdf");
    expect(receipt.text).toContain("reset-pdf");
    expect(receipt.text).toContain("science-edition-pdf");
    expect(receipt.text).toContain("crew-guide-pdf");
  });

  it("does not deliver a v2 Reset when the paid provider product is the Toolkit", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await deliver({ id: "evt_wrong_v2_product", eventType: "checkout.completed", object: {
      id: "chk_wrong_v2_product", product: { id: "prod_guide_v2" }, order: { amount_paid: 1900 },
      customer: { email: "parent@example.com" }, metadata: { order: "program", delivery: "tok-v2", catalog_version: "2" },
    } });
    expect(response.status).toBe(500);
    expect(fake.table("orders")).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("Creem webhook: a paid Personal plan", () => {
  const REQUEST = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
  const VISITOR = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
  const planPaid = (metadata: Record<string, unknown> = {}, object: Record<string, unknown> = {}) => ({
    id: "evt_plan",
    eventType: "checkout.completed",
    created_at: T0,
    object: {
      id: "chk_plan", product: { id: "prod_plan" }, order: { id: "ord_plan", amount_paid: 19900 },
      customer: { id: "cust_p", email: "Ana@Example.com" },
      metadata: { order: "personal-plan", catalog_version: "2", request_id: REQUEST, delivery: "tok-plan", visitor: VISITOR, ...metadata },
      ...object,
    },
  });
  const seedForm = () =>
    fake.seed("plan_requests", {
      id: REQUEST, email: "ana@example.com", name: "Ana", kid_age: 7, moment: "screen-off", status: "checkout",
      answers: { when_happens: "Most school nights, right after the tablet goes off.", tried: "Timers and a warning.", good_week: "No tears by Friday.", owns: ["toolkit"] },
    });

  it("records the order, marks the form paid, counts the purchase and emails the parent and the team", async () => {
    seedForm();
    expect((await deliver(planPaid())).status).toBe(200);
    const [order] = fake.table("orders");
    expect(order).toMatchObject({ provider_order_id: "ord_plan", email: "ana@example.com", order_key: "personal-plan", items: ["personal-plan"], amount_cents: 19900, catalog_version: 2 });
    expect(order.delivery_hash).toBe(createHash("sha256").update("tok-plan").digest("hex"));
    expect(fake.table("funnel_events")).toMatchObject([{ name: "purchase", place: "personal-plan", amount_cents: 19900, visitor_id: VISITOR }]);
    expect(fake.table("plan_requests")[0]).toMatchObject({ status: "paid", order_id: order.id });
    expect(fake.table("plan_requests")[0].paid_at).toBeTruthy();

    expect(sendEmail).toHaveBeenCalledTimes(2);
    const [[parentTo, parentMail], [teamTo, teamMail]] = vi.mocked(sendEmail).mock.calls;
    expect(parentTo).toBe("ana@example.com");
    expect(parentMail.subject).toContain("Personal plan");
    expect(parentMail.text).toContain("3 working days");
    expect(parentMail.text).toContain("Total paid: $199");
    expect(teamTo).toBe("hello@littlebraincrew.com");
    expect(teamMail.subject).toContain("ana@example.com");
    expect(teamMail.text).toContain("Most school nights, right after the tablet goes off.");
    expect(teamMail.text).toContain("Tears when screen time ends");
    expect(teamMail.text).toContain("The Kid Brain Toolkit");
  });

  it("a retried delivery writes nothing more and sends nothing twice", async () => {
    seedForm();
    await deliver(planPaid());
    await deliver(planPaid());
    expect(fake.table("orders")).toHaveLength(1);
    expect(fake.table("funnel_events")).toHaveLength(1);
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(fake.table("plan_requests")[0]).toMatchObject({ status: "paid" });
  });

  it("a payment whose form can't be found still records the order and tells the team", async () => {
    expect((await deliver(planPaid({ request_id: "ffffffff-ffff-4fff-8fff-ffffffffffff" }))).status).toBe(200);
    expect(fake.table("orders")).toHaveLength(1);
    expect(sendEmail).toHaveBeenCalledTimes(2);
    const teamMail = vi.mocked(sendEmail).mock.calls[1][1];
    expect(teamMail.text).toContain("was not found");
    expect(teamMail.text).toContain("ord_plan");
  });

  it("a cheaper product cannot be passed off as a Personal plan", async () => {
    seedForm();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await deliver(planPaid({}, { product: { id: "prod_guide_v2" } }))).status).toBe(500);
    spy.mockRestore();
    expect(fake.table("orders")).toHaveLength(0);
    expect(fake.table("plan_requests")[0]).toMatchObject({ status: "checkout" });
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
