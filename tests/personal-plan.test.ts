import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/supabase/env", () => ({ supabaseConfigured: true }));
vi.mock("@/lib/checkout-reminders", () => ({ recordCheckoutStart: vi.fn(async () => {}) }));
// Provider fixtures are isolated from the production product catalogue: the plan is on sale unless a test closes it.
let planProductId = "prod_plan";
const createCheckout = vi.fn<(input: { productId: string; email: string; successUrl: string; requestId?: string; metadata: Record<string, string> }) => Promise<string>>(async () => "https://checkout.creem.io/plan");
vi.mock("@/lib/creem", async (original) => ({
  ...(await original<typeof import("@/lib/creem")>()),
  creemConfigured: true,
  productIdFor: (key: string) => (key === "personal-plan" ? planProductId : "prod_other"),
  createCheckout: (input: { productId: string; email: string; successUrl: string; requestId?: string; metadata: Record<string, string> }) => createCheckout(input),
}));

const { POST } = await import("@/app/api/personal-plan/route");
const { POST: checkout } = await import("@/app/api/checkout/route");

const VISITOR = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
let ip = 0;
const valid = () => ({
  name: " Ana ",
  email: "Ana@Example.com",
  kid_age: 7,
  moment: "screen-off",
  answers: {
    when_happens: "Most school nights, right after the tablet goes off.",
    how_long: "months",
    tried: "Timers and a five-minute warning.",
    good_week: "Screens off at 7 with grumbling but no tears.",
    owns: ["toolkit", "not-a-product"],
    timezone: "Europe/Belgrade",
    bogus: "dropped",
  },
  visitor: VISITOR,
});
function send(body: unknown, from = `198.51.100.${++ip}`) {
  return POST(
    new Request("https://www.littlebraincrew.com/api/personal-plan", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json", "x-forwarded-for": from },
    }) as NextRequest,
  );
}

beforeEach(() => {
  fake.reset();
  createCheckout.mockClear();
  planProductId = "prod_plan";
});

describe("Personal plan form", () => {
  it("stores the answers, starts the $199 checkout with the form's id in the metadata, and answers its URL", async () => {
    const res = await send(valid());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe("https://checkout.creem.io/plan");
    expect(typeof data.delivery).toBe("string");

    const [row] = fake.table("plan_requests");
    expect(row).toMatchObject({ status: "checkout", email: "ana@example.com", name: "Ana", kid_age: 7, moment: "screen-off", visitor_id: VISITOR, checkout_url: "https://checkout.creem.io/plan" });
    expect(row.checkout_at).toBeTruthy();
    // Only the fields the form asks for are kept, and only options that exist.
    expect(row.answers).toEqual({
      when_happens: "Most school nights, right after the tablet goes off.",
      how_long: "months",
      tried: "Timers and a five-minute warning.",
      good_week: "Screens off at 7 with grumbling but no tears.",
      owns: ["toolkit"],
      timezone: "Europe/Belgrade",
    });

    expect(createCheckout).toHaveBeenCalledOnce();
    const input = createCheckout.mock.calls[0][0];
    expect(input.productId).toBe("prod_plan");
    expect(input.email).toBe("ana@example.com");
    expect(input.successUrl).toMatch(/\/personal-plan\/thanks$/);
    expect(input.requestId).toBe(`plan-${row.id}`);
    expect(input.metadata).toEqual({ order: "personal-plan", catalog_version: "2", request_id: row.id, delivery: data.delivery, visitor: VISITOR });
  });

  it("cuts long text at the field's maximum instead of refusing it", async () => {
    const body = valid();
    body.answers.tried = "x".repeat(2000);
    expect((await send(body)).status).toBe(200);
    expect((fake.table("plan_requests")[0].answers as Record<string, string>).tried).toHaveLength(1500);
  });

  it.each([
    ["name", { name: "" }],
    ["email", { email: "not-an-email" }],
    ["kid_age", { kid_age: 2 }],
    ["kid_age", { kid_age: "7" }],
    ["moment", { moment: "nope" }],
    ["tried", { answers: { ...valid().answers, tried: "" } }],
    ["moment_other", { moment: "other" }],
  ])("refuses a form without a valid %s, naming the field, and stores nothing", async (field, patch) => {
    const res = await send({ ...valid(), ...patch });
    expect(res.status).toBe(400);
    expect((await res.json()).field).toBe(field);
    expect(fake.table("plan_requests")).toHaveLength(0);
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it("accepts 'something else' once the parent describes the moment", async () => {
    const body = valid();
    expect((await send({ ...body, moment: "other", answers: { ...body.answers, moment_other: "Leaving grandma's house." } })).status).toBe(200);
    expect(fake.table("plan_requests")[0]).toMatchObject({ moment: "other", answers: expect.objectContaining({ moment_other: "Leaving grandma's house." }) });
  });

  it("is closed, and stores nothing, while the Creem product id is empty", async () => {
    planProductId = "";
    const res = await send(valid());
    expect(res.status).toBe(503);
    expect((await res.json()).error).toContain("opens in a few days");
    expect(fake.table("plan_requests")).toHaveLength(0);
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it("keeps the saved form when Creem can't start the checkout", async () => {
    createCheckout.mockRejectedValueOnce(new Error("creem down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await send(valid())).status).toBe(502);
    spy.mockRestore();
    expect(fake.table("plan_requests")).toMatchObject([{ status: "new", checkout_url: null }]);
  });

  it("limits one connection to five forms an hour", async () => {
    for (let i = 0; i < 5; i++) expect((await send(valid(), "192.0.2.9")).status).toBe(200);
    expect((await send(valid(), "192.0.2.9")).status).toBe(429);
    expect(fake.table("plan_requests")).toHaveLength(5);
  });

  it("the generic checkout refuses to sell the plan without the form", async () => {
    const res = await checkout(
      new Request("https://www.littlebraincrew.com/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: ["personal-plan"], email: "ana@example.com", next: "/thank-you" }),
        headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.77" },
      }) as NextRequest,
    );
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("/personal-plan");
    expect(createCheckout).not.toHaveBeenCalled();
  });
});
