import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { itemsFor, keyForProduct, orderKey, verifyWebhook } from "@/lib/creem";

const sign = (body: string, secret = "test-webhook-secret") => createHmac("sha256", secret).update(body).digest("hex");

describe("verifyWebhook", () => {
  const body = JSON.stringify({ id: "evt_1", eventType: "checkout.completed" });

  it("accepts the HMAC of the raw body", () => {
    expect(verifyWebhook(body, sign(body))).toBe(true);
  });
  it("rejects a signature made with another secret", () => {
    expect(verifyWebhook(body, sign(body, "someone-else"))).toBe(false);
  });
  it("rejects a body changed after signing", () => {
    expect(verifyWebhook(body.replace("evt_1", "evt_2"), sign(body))).toBe(false);
  });
  it("rejects a missing or wrong-length signature without throwing", () => {
    expect(verifyWebhook(body, null)).toBe(false);
    expect(verifyWebhook(body, "abc")).toBe(false);
  });
});

describe("products and prices", () => {
  it("never maps an empty product id to a product (ids not filled in yet)", () => {
    expect(keyForProduct("")).toBeUndefined();
  });
  it("prices come from the server's list; unknown ids are refused", () => {
    expect(itemsFor(["guide"])?.[0].price).toBeGreaterThan(0);
    expect(itemsFor(["guide", "made-up"])).toBeNull();
  });
  it("an order key keeps the order items were added in", () => {
    expect(orderKey(["guide", "bedtime-kit"])).toBe("guide+bedtime-kit");
  });
});
