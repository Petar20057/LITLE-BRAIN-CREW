import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { ITEMS, type Item } from "./funnel";

// Creem: payments (merchant of record) and the affiliate program. Server only: the API key never reaches the browser.
// Every key is EMPTY until Creem is connected, and then nothing here runs (the routes answer 503).
// Test store by default: the live API is used only when CREEM_LIVE is exactly "true" (money policy: going live is Luka's call).

const API_KEY = process.env.CREEM_API_KEY ?? "";
const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET ?? "";
export const CREEM_LIVE = process.env.CREEM_LIVE === "true";
const BASE = CREEM_LIVE ? "https://api.creem.io" : "https://test-api.creem.io";

export const creemConfigured = Boolean(API_KEY);
export const webhookConfigured = Boolean(WEBHOOK_SECRET);
const DISCOUNTS_API_KEY = process.env.CREEM_DISCOUNTS_API_KEY || API_KEY;
export const discountsConfigured = Boolean(DISCOUNTS_API_KEY);

export class CreemError extends Error {
  constructor(public status: number) {
    super(`Creem request failed (${status}).`);
  }
}

/** Server-side management requests. Never include a provider response or API key in an error shown to an admin. */
export async function creemRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  if (!discountsConfigured) throw new CreemError(503);
  const response = await fetch(`${BASE}/v1/${path}`, {
    method,
    headers: { "x-api-key": DISCOUNTS_API_KEY, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new CreemError(response.status);
  return response.json() as Promise<T>;
}

// Creem product id for everything we sell, keyed by the item ids in lib/funnel.ts. Creem has no order bump, so an
// order with a bump is its own combined product ("guide+bedtime-kit" = Toolkit + Bedtime Kit, $16).
// Fill these from the Creem dashboard; the test and live stores have different ids. Empty = not for sale yet.
// "Support the crew" (any amount) is missing on purpose until Creem confirms pay-what-you-want.
const PRODUCTS: Record<string, { test: string; live: string }> = {
  guide: { test: "prod_6RLkxpWxFb7axxq5A2xo3N", live: "prod_3uRNXgUJ7KoJE2lw3Lk2Ym" },
  "bedtime-kit": { test: "prod_1aPzq7XExzFTjsj2SmjXZY", live: "prod_6UNUaVPQLo8zhL20cWb7vp" },
  "guide+bedtime-kit": { test: "prod_3wPWFIXUGHNSvHaaM8L4OT", live: "prod_1vCgpOUX7izA3p25ptKpoD" },
  program: { test: "prod_28QdxP9IYPKap1RkguCJla", live: "prod_4ADqrO8Tr3QY7hXWwJ67id" },
  "program+cards": { test: "prod_4zjcDzIb3Lf1QqC0EXlQBL", live: "prod_5XFZf5YtSV01F0FVLxfreg" },
  upgrade: { test: "", live: "" },
  "screen-off-week": { test: "", live: "" },
  "club-monthly": { test: "", live: "" },
  "club-yearly": { test: "", live: "" },
};

const ALL_ITEMS: Item[] = Object.values(ITEMS);

/** The key PRODUCTS uses for an order: item ids joined with "+", in the order they were added. */
export const orderKey = (itemIds: string[]) => itemIds.join("+");

/** Items we sell, looked up by id. Prices always come from here, never from the browser. */
export function itemsFor(itemIds: string[]): Item[] | null {
  const items = itemIds.map((id) => ALL_ITEMS.find((i) => i.id === id));
  return items.every(Boolean) ? (items as Item[]) : null;
}

export function productIdFor(key: string): string {
  const p = PRODUCTS[key];
  return (p && (CREEM_LIVE ? p.live : p.test)) || "";
}

/** Includes combined products, so an order bump cannot accidentally lose its discount. */
export function discountProducts() {
  return Object.keys(PRODUCTS).flatMap((key) => {
    const id = productIdFor(key);
    return id ? [{ id, name: itemsFor(key.split("+"))!.map((item) => item.name).join(" + ") }] : [];
  });
}

/** Which of our items a Creem product id is (for webhooks), or undefined for a product we don't know. */
export function keyForProduct(productId: string): string | undefined {
  // An empty id must never match a product whose id isn't filled in yet.
  if (!productId) return undefined;
  return Object.keys(PRODUCTS).find((k) => productIdFor(k) === productId);
}

export async function createCheckout(input: {
  productId: string;
  email: string;
  successUrl: string;
  metadata: Record<string, string>;
}): Promise<string> {
  const res = await fetch(`${BASE}/v1/checkouts`, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: input.productId,
      customer: { email: input.email },
      success_url: input.successUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Creem checkout failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { checkout_url?: string };
  if (!data.checkout_url) throw new Error("Creem checkout failed: no checkout_url");
  return data.checkout_url;
}

/** creem-signature is the hex HMAC-SHA256 of the raw body, keyed with the webhook secret. */
export function verifyWebhook(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = Buffer.from(createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex"));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
