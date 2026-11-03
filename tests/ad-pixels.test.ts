import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { PaidPurchase } from "@/lib/delivery-files";

let pixels: typeof import("@/lib/ad-pixels");
let storage: Map<string, string>;
const meta = vi.fn();
const tiktok = vi.fn();
const page = vi.fn();
const purchase: PaidPurchase = { items: ["guide", "bedtime-kit"], catalogVersion: 2, amountCents: 1300, eventId: "confirmed-order-a" };

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "1234567890");
  vi.stubEnv("NEXT_PUBLIC_TIKTOK_PIXEL_ID", "ABCDEFGHIJ1234567890");
  storage = new Map([["lbc-ad-consent", "granted"]]);
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
  vi.stubGlobal("location", { pathname: "/thank-you" });
  vi.stubGlobal("window", { fbq: meta, ttq: { track: tiktok, page } });
  meta.mockClear(); tiktok.mockClear(); page.mockClear();
  pixels = await import("@/lib/ad-pixels");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("advertising purchase measurement", () => {
  it("sends the confirmed discounted amount and currency to both platforms without personal data", () => {
    pixels.trackAdPurchase(purchase);
    expect(meta).toHaveBeenCalledWith("track", "Purchase", { value: 13, currency: "USD", content_ids: ["guide", "bedtime-kit"], content_type: "product" }, { eventID: purchase.eventId });
    expect(tiktok).toHaveBeenCalledWith("Purchase", expect.objectContaining({ value: 13, currency: "USD", contents: [{ content_id: "guide", quantity: 1 }, { content_id: "bedtime-kit", quantity: 1 }] }), { event_id: purchase.eventId });
    expect(JSON.stringify(meta.mock.calls)).not.toMatch(/email|token|quiz/);
  });

  it("does not send events before consent or after a decline", () => {
    for (const consent of ["", "denied"]) {
      storage.set("lbc-ad-consent", consent);
      pixels.trackAdPurchase(purchase);
      pixels.trackAdCheckout([{ id: "guide", price: 19 }]);
      pixels.trackAdPage("/");
    }
    expect(meta).not.toHaveBeenCalled();
    expect(tiktok).not.toHaveBeenCalled();
    expect(page).not.toHaveBeenCalled();
  });

  it("ignores an unconfirmed basket without a server event id", () => {
    pixels.trackAdPurchase({ ...purchase, eventId: undefined });
    expect(meta).not.toHaveBeenCalled();
    expect(tiktok).not.toHaveBeenCalled();
  });

  it("deduplicates repeated polls, reloads and remounts, keeping each paid upgrade separate", async () => {
    pixels.trackAdPurchase(purchase);
    pixels.trackAdPurchase(purchase);
    vi.resetModules();
    pixels = await import("@/lib/ad-pixels");
    pixels.trackAdPurchase(purchase);
    pixels.trackAdPurchase({ ...purchase, items: ["upgrade"], amountCents: 2000, eventId: "confirmed-upgrade-b" });
    expect(meta).toHaveBeenCalledTimes(2);
    expect(tiktok).toHaveBeenCalledTimes(2);
  });

  it("waits for a pixel to be available and preserves a zero-dollar confirmed order", () => {
    vi.stubGlobal("window", {});
    pixels.trackAdPurchase(purchase);
    expect(storage.size).toBe(1);
    vi.stubGlobal("window", { fbq: meta, ttq: { track: tiktok } });
    pixels.trackAdPurchase({ ...purchase, amountCents: 0 });
    expect(meta).toHaveBeenCalledWith("track", "Purchase", expect.objectContaining({ value: 0 }), expect.anything());
  });

  it("keeps team, account, quiz and token-bearing confirmation pages untracked", () => {
    for (const path of ["/admin", "/stats/quiz", "/api/order", "/dev/emails", "/account", "/confirm", "/unsubscribe", "/code", "/ask"]) {
      vi.stubGlobal("location", { pathname: path });
      pixels.trackAdPage(path);
      pixels.trackAdPurchase(purchase);
      pixels.trackAdCheckout([{ id: "guide", price: 19 }]);
    }
    expect(meta).not.toHaveBeenCalled();
    expect(tiktok).not.toHaveBeenCalled();
  });

  it("stays off with no configured IDs", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "");
    vi.stubEnv("NEXT_PUBLIC_TIKTOK_PIXEL_ID", "");
    pixels = await import("@/lib/ad-pixels");
    expect(pixels.ADS_CONFIGURED).toBe(false);
    pixels.trackAdPurchase(purchase);
    expect(meta).not.toHaveBeenCalled();
    expect(tiktok).not.toHaveBeenCalled();
  });
});
