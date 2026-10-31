import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreemError, discountProducts } from "@/lib/creem";

const request = vi.fn();
vi.mock("@/lib/creem", async (original) => ({
  ...(await original<typeof import("@/lib/creem")>()),
  creemConfigured: true,
  discountsConfigured: true,
  creemRequest: (...args: unknown[]) => request(...args),
}));
const requireAdmin = vi.fn(async () => ({ email: "admin@example.com" }));
vi.mock("@/lib/admin", () => ({ requireAdmin: () => requireAdmin() }));
const revalidate = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (path: string) => revalidate(path) }));

const { createDiscount, discountStatus, listDiscounts, validateDiscount } = await import("@/lib/discounts");
const { addDiscount } = await import("@/app/(admin)/admin/discounts/actions");
const products = discountProducts().map((product) => product.id);
const input = { name: "Crew gift", code: "CREW100", percentage: 100, maxRedemptions: 25, products, expiry: "" };
const discount = { id: "disc_1", mode: "test", name: input.name, code: input.code, type: "percentage" as const, percentage: 100, status: "active", redeem_count: 0, max_redemptions: 25 };

beforeEach(() => {
  request.mockReset().mockResolvedValue(discount);
  requireAdmin.mockReset().mockResolvedValue({ email: "admin@example.com" });
  revalidate.mockReset();
});
afterEach(() => vi.restoreAllMocks());

function form(overrides: Record<string, string> = {}) {
  const form = new FormData();
  Object.entries({ name: input.name, code: " crew100 ", percentage: "100", maxRedemptions: "25", expiry: "", ...overrides }).forEach(([key, value]) => form.set(key, value));
  products.forEach((product) => form.append("products", product));
  return form;
}

describe("discount creation", () => {
  it("makes a 100% code with a shared cap of 25 and covers combined orders", async () => {
    expect(discountProducts().some((p) => p.name.includes(" + "))).toBe(true);
    await createDiscount(input);
    expect(request).toHaveBeenCalledWith("discounts", "POST", {
      name: "Crew gift", code: "CREW100", type: "percentage", percentage: 100, duration: "once",
      max_redemptions: 25, applies_to_products: products,
    });
  });

  it.each([0, -1, 101, 1.5, NaN, Infinity])("rejects percentage %s before contacting payments", async (percentage) => {
    await expect(createDiscount({ ...input, percentage })).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.2, NaN, Infinity, 1_000_001])("rejects maximum uses %s", (maxRedemptions) => {
    expect(validateDiscount({ ...input, maxRedemptions })).not.toBeNull();
  });

  it("rejects missing, unavailable and wrong-store products", () => {
    expect(validateDiscount({ ...input, products: [] })).not.toBeNull();
    expect(validateDiscount({ ...input, products: ["prod_unavailable"] })).not.toBeNull();
  });

  it("rejects malformed codes and past or invalid expiry dates", () => {
    for (const code of ["", "AB", "<script>", "A B", "A-B", "A_B", "A".repeat(15)]) expect(validateDiscount({ ...input, code })).not.toBeNull();
    for (const expiry of ["2020-01-01", "nonsense", "2035-99-99", "2035-02-30"]) expect(validateDiscount({ ...input, expiry })).not.toBeNull();
  });

  it("passes the expiry in UTC and removes duplicate product IDs", async () => {
    await createDiscount({ ...input, products: [products[0], products[0]], expiry: "2035-12-31" });
    expect(request.mock.calls[0][2]).toMatchObject({ expiry_date: "2035-12-31T23:59:59Z", applies_to_products: [products[0]] });
  });

  it("shows the boundary: active at 24, fully used at 25 and above", () => {
    expect(discountStatus({ ...discount, redeem_count: 24 })).toBe("active");
    expect(discountStatus({ ...discount, redeem_count: 25 })).toBe("fully used");
    expect(discountStatus({ ...discount, redeem_count: 26 })).toBe("fully used");
    expect(discountStatus({ ...discount, status: "deleted" })).toBe("deleted");
    expect(discountStatus({ ...discount, expiry_date: "2020-01-01T00:00:00Z" })).toBe("expired");
  });

  it("requests paginated live usage counts", async () => {
    await listDiscounts(2);
    expect(request).toHaveBeenCalledWith("discounts/search?page_number=2&page_size=20");
  });
});

describe("admin action", () => {
  it("checks the admin, normalizes the code and refreshes the list", async () => {
    expect(await addDiscount({}, form())).toEqual({ success: expect.stringContaining("CREW100 created: 100% off, maximum 25") });
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(request.mock.calls[0][2].code).toBe("CREW100");
    expect(revalidate).toHaveBeenCalledWith("/admin/discounts");
  });

  it("cannot create a discount without admin authorization", async () => {
    requireAdmin.mockRejectedValueOnce(new Error("redirect to login"));
    await expect(addDiscount({}, form())).rejects.toThrow("redirect to login");
    expect(request).not.toHaveBeenCalled();
  });

  it("rejects tampered input on the server", async () => {
    expect(await addDiscount({}, form({ maxRedemptions: "0" }))).toHaveProperty("error");
    expect(request).not.toHaveBeenCalled();
  });

  it("shows a duplicate-code error without leaking provider details", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    request.mockRejectedValueOnce(new CreemError(409));
    expect(await addDiscount({}, form())).toEqual({ error: expect.stringContaining("may already exist") });
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("does not announce success when the provider is unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    request.mockRejectedValueOnce(new Error("provider unavailable"));
    expect(await addDiscount({}, form())).toEqual({ error: expect.stringContaining("Refresh the list") });
  });

  it("explains missing permissions when the checkout key cannot manage discounts", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    request.mockRejectedValueOnce(new CreemError(403));
    expect(await addDiscount({}, form())).toEqual({ error: expect.stringContaining("discounts:read and discounts:write") });
  });
});
