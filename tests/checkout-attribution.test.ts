import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/checkout-reminders", () => ({ recordCheckoutStart: vi.fn(async () => {}) }));
const createCheckout = vi.fn<(input: { metadata: Record<string, string> }) => Promise<string>>(async () => "https://checkout.creem.io/test");
vi.mock("@/lib/creem", async (original) => ({
  ...(await original<typeof import("@/lib/creem")>()),
  creemConfigured: true,
  productIdFor: () => "prod_test",
  createCheckout: (input: { metadata: Record<string, string> }) => createCheckout(input),
}));

const { POST } = await import("@/app/api/checkout/route");

const VISITOR = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const SESSION = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

let ip = 0;
function start(body: Record<string, unknown>) {
  return POST(
    new Request("https://www.littlebraincrew.com/api/checkout", {
      method: "POST",
      body: JSON.stringify({ items: ["guide"], email: "mom@example.com", next: "/thank-you", ...body }),
      headers: { "content-type": "application/json", "x-forwarded-for": `192.0.2.${++ip}` },
    }) as NextRequest,
  );
}

beforeEach(() => {
  fake.reset();
  createCheckout.mockClear();
});

describe("checkout start: visit attribution", () => {
  it("sends the visitor and visit ids to Creem as metadata", async () => {
    expect((await start({ visitor: VISITOR, session: SESSION })).status).toBe(200);
    expect(createCheckout.mock.calls[0][0].metadata).toMatchObject({ order: "guide", visitor: VISITOR, session: SESSION });
  });

  it("leaves out ids that aren't ids, and still starts the checkout", async () => {
    expect((await start({ visitor: "<script>", session: 12 })).status).toBe(200);
    const { metadata } = createCheckout.mock.calls[0][0];
    expect(metadata).not.toHaveProperty("visitor");
    expect(metadata).not.toHaveProperty("session");
  });
});
