"use client";

import { PREVIEW, type CrewKey, type Item } from "./funnel";

// Payments go through Creem, the merchant of record: it is the seller on the receipt and handles tax, cards,
// Apple Pay and Google Pay. While PREVIEW is on, every button walks through the funnel without charging anything.
// Live: POST /api/checkout (server picks the Creem product and price) → redirect to Creem's checkout_url → Creem
// sends the parent back to `next`. Access is granted from the Creem webhook, never from that redirect.
// Creem's docs show no one-click upsell with a saved card and no order bump, so each "yes" on an offer page
// opens a new prefilled Creem checkout, and a bump is a combined Creem product (lib/creem.ts).
// Affiliate attribution is Creem's own (its referral link sets the cookie, its checkout reads it): nothing to pass here.

type Options = {
  /** Where Creem sends the parent after paying. */
  next: string;
  consent?: boolean;
  crew?: CrewKey;
  /** Quiz session id from /code, passed to Creem as metadata. */
  quiz?: string;
  /** Saves what was bought for the next pages. Runs before we leave for Creem, or right away in preview. */
  commit: () => void;
};

export async function charge(items: Item[], email: string, { next, consent, crew, quiz, commit }: Options): Promise<void> {
  if (PREVIEW) {
    console.info("[preview] would open a Creem checkout", { email, items, next });
    await new Promise((r) => setTimeout(r, 350));
    commit();
    return;
  }
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: items.map((i) => i.id), email, next, consent, crew, quiz }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "Payment couldn’t start. Please try again.");
  commit();
  window.location.assign(data.url);
  // Leaving the page: keep the button busy instead of letting the caller continue.
  await new Promise(() => {});
}
