import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/supabase/env", () => ({ supabaseConfigured: true }));
vi.mock("@/lib/checkout-reminders", () => ({ recordCheckoutStart: vi.fn(async () => {}) }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn(async () => "message-id") }));
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
const { POST: pay } = await import("@/app/api/personal-plan/checkout/route");
const { POST: checkout } = await import("@/app/api/checkout/route");
const { sendEmail } = await import("@/lib/email/send");

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

function payFor(id: unknown, from = `203.0.113.${++ip}`) {
  return pay(
    new Request("https://www.littlebraincrew.com/api/personal-plan/checkout", {
      method: "POST",
      body: JSON.stringify({ id, visitor: VISITOR }),
      headers: { "content-type": "application/json", "x-forwarded-for": from },
    }) as NextRequest,
  );
}

beforeEach(() => {
  fake.reset();
  createCheckout.mockClear();
  vi.mocked(sendEmail).mockClear();
  planProductId = "prod_plan";
});

describe("Personal plan form", () => {
  it("saves the answers and the email without charging, and emails a link to pay later", async () => {
    const res = await send(valid());
    expect(res.status).toBe(200);
    const data = await res.json();
    const [row] = fake.table("plan_requests");
    expect(data).toEqual({ id: row.id, payable: true });
    expect(row).toMatchObject({ status: "new", email: "ana@example.com", name: "Ana", kid_age: 7, moment: "screen-off", visitor_id: VISITOR, checkout_url: null });
    // Only the fields the form asks for are kept, and only options that exist.
    expect(row.answers).toEqual({
      when_happens: "Most school nights, right after the tablet goes off.",
      how_long: "months",
      tried: "Timers and a five-minute warning.",
      good_week: "Screens off at 7 with grumbling but no tears.",
      owns: ["toolkit"],
      timezone: "Europe/Belgrade",
    });
    expect(createCheckout).not.toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledOnce();
    const [to, mail] = vi.mocked(sendEmail).mock.calls[0];
    expect(to).toBe("ana@example.com");
    expect(mail.subject).toContain("answers are saved");
    expect(mail.text).toContain(`/personal-plan?r=${row.id}`);
    expect(mail.text).toContain("Continue to payment · $199");
  });

  it("the optional second step starts the $199 checkout for the saved answers, with the form's id in the metadata", async () => {
    const { id } = await (await send(valid())).json();
    const res = await payFor(id);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe("https://checkout.creem.io/plan");
    expect(data.email).toBe("ana@example.com");
    expect(typeof data.delivery).toBe("string");
    const [row] = fake.table("plan_requests");
    expect(row).toMatchObject({ status: "checkout", checkout_url: "https://checkout.creem.io/plan" });
    expect(row.checkout_at).toBeTruthy();
    expect(createCheckout).toHaveBeenCalledOnce();
    const input = createCheckout.mock.calls[0][0];
    expect(input.productId).toBe("prod_plan");
    expect(input.email).toBe("ana@example.com");
    expect(input.successUrl).toMatch(/\/personal-plan\/thanks$/);
    expect(input.requestId).toBe(`plan-${id}`);
    expect(input.metadata).toEqual({ order: "personal-plan", catalog_version: "2", request_id: id, delivery: data.delivery, visitor: VISITOR });
    // Coming back from the email link later starts a fresh checkout for the same answers.
    expect((await payFor(id)).status).toBe(200);
    expect(fake.table("plan_requests")).toHaveLength(1);
  });

  it("the payment step refuses an unknown or malformed id and a request that is already paid", async () => {
    expect((await payFor("not-an-id")).status).toBe(400);
    expect((await payFor("0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d")).status).toBe(404);
    const { id } = await (await send(valid())).json();
    fake.table("plan_requests")[0].status = "paid";
    const res = await payFor(id);
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain("already paid");
    expect(createCheckout).not.toHaveBeenCalled();
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

  it("saves the answers while the Creem product id is empty; only the payment step waits", async () => {
    planProductId = "";
    const res = await send(valid());
    expect(res.status).toBe(200);
    const { id, payable } = await res.json();
    expect(payable).toBe(false);
    expect(fake.table("plan_requests")).toMatchObject([{ status: "new" }]);
    expect(vi.mocked(sendEmail).mock.calls[0][1].text).toContain("Payment for the Personal plan opens in a few days");
    const paid = await payFor(id);
    expect(paid.status).toBe(503);
    expect(await paid.json()).toMatchObject({ closed: true, error: expect.stringContaining("Payment opens in a few days") });
    expect(fake.table("plan_requests")).toMatchObject([{ status: "new" }]);
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it("keeps the saved form when Creem can't start the checkout", async () => {
    const { id } = await (await send(valid())).json();
    createCheckout.mockRejectedValueOnce(new Error("creem down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await payFor(id)).status).toBe(502);
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
