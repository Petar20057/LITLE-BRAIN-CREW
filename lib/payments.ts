"use client";

import { PREVIEW, type Item } from "./funnel";

// Payments are not connected yet: every button walks through the funnel without charging anything.
// Connecting them means replacing charge() with:
//   card   → POST /api/checkout (Stripe Checkout Session; save the card for one-click upsells)
//   paypal → PayPal JS SDK order + capture (vaulted for upsells, or ask again on each offer)
// and making the offer pages charge the saved payment method instead of starting a new checkout.

export type Method = "card" | "paypal";

export async function charge(method: Method, items: Item[], email: string): Promise<void> {
  if (!PREVIEW) throw new Error(`Payments (${method}) are not connected yet`);
  console.info("[preview] would charge", { method, email, items });
  await new Promise((r) => setTimeout(r, 350));
}
