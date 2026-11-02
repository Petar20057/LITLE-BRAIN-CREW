import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn(async () => "sent") }));
const createCheckout = vi.fn<(input: unknown) => Promise<string>>(async () => "https://checkout.creem.io/one-upgrade");
vi.mock("@/lib/creem", async (original) => ({
  ...(await original<typeof import("@/lib/creem")>()),
  productIdFor: () => "prod_upgrade",
  createCheckout: (input: unknown) => createCheckout(input),
}));
const { startResetUpgrade } = await import("@/lib/upgrades");
const { recordPaidOrder, tokenHash } = await import("@/lib/delivery");
const { paidOrderForToken } = await import("@/lib/paid-order");
const { sectionsForPurchases } = await import("@/lib/delivery-files");
const token = "a-real-buyer-token";

beforeEach(() => {
  fake.reset();
  createCheckout.mockClear();
  fake.seed("orders", { id: "parent-1", provider_order_id: "paid-toolkit", email: "parent@example.com", items: ["guide"], amount_cents: 1900, catalog_version: 2, delivery_hash: tokenHash(token) });
});

describe("verified Reset upgrade", () => {
  it("uses the paid buyer's email and a fixed product, then reuses the same checkout", async () => {
    const first = await startResetUpgrade(token);
    expect(first.url).toBe("https://checkout.creem.io/one-upgrade");
    expect(await startResetUpgrade(token)).toEqual(first);
    expect(createCheckout).toHaveBeenCalledOnce();
    expect(createCheckout).toHaveBeenCalledWith(expect.objectContaining({
      email: "parent@example.com", productId: "prod_upgrade",
      metadata: { order: "upgrade", delivery: token, parent_order_id: "parent-1", catalog_version: "2" },
    }));
    expect(fake.table("orders")).toHaveLength(1);
    expect(sectionsForPurchases((await paidOrderForToken(token))!.purchases).flatMap((s) => s.files).map((f) => f.id)).not.toContain("reset-pdf");
  });

  it("only lets one concurrent request create a checkout", async () => {
    const results = await Promise.allSettled([startResetUpgrade(token), startResetUpgrade(token)]);
    expect(results.some((r) => r.status === "fulfilled")).toBe(true);
    expect(createCheckout).toHaveBeenCalledOnce();
  });

  it("rejects an unknown token and a buyer who only owns the Bedtime Kit", async () => {
    await expect(startResetUpgrade("forged-token")).rejects.toMatchObject({ status: 409 });
    fake.table("orders")[0].items = ["bedtime-kit"];
    await expect(startResetUpgrade(token)).rejects.toMatchObject({ status: 403 });
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it("unlocks the new Reset under the original token only after payment, once", async () => {
    await startResetUpgrade(token);
    const paid = { providerOrderId: "paid-upgrade", email: "parent@example.com", orderKey: "upgrade", token, catalogVersion: 2 as const, parentOrderId: "parent-1", amountCents: 2000 };
    await recordPaidOrder(paid);
    await recordPaidOrder(paid);
    expect(fake.table("orders")).toHaveLength(2);
    expect(fake.table("orders")[1]).toMatchObject({ parent_order_id: "parent-1", delivery_hash: null, catalog_version: 2 });
    const order = (await paidOrderForToken(token))!;
    const files = sectionsForPurchases(order.purchases).flatMap((s) => s.files);
    expect(files.find((f) => f.id === "reset-pdf")?.path).toBe("v2/30-Day-Reset/The-30-Day-Reset.pdf");
    expect(files.filter((f) => f.id === "science-edition-pdf")).toHaveLength(1);
    expect(await startResetUpgrade(token)).toEqual({ complete: true });
    expect(createCheckout).toHaveBeenCalledOnce();
  });

  it("refuses an upgrade attached to someone else's order or without a parent", async () => {
    const paid = { providerOrderId: "forged-upgrade", email: "parent@example.com", orderKey: "upgrade", token, catalogVersion: 2 as const, amountCents: 2000 };
    await expect(recordPaidOrder(paid)).rejects.toThrow("Missing upgrade parent");
    await expect(recordPaidOrder({ ...paid, token: "another-token", parentOrderId: "parent-1" })).rejects.toThrow("Invalid upgrade parent");
    expect(fake.table("orders")).toHaveLength(1);
  });
});
