// Funnel events for /admin: buy clicks, checkout steps, purchases, signups. Sent with sendBeacon to /api/event, which
// keeps only the names listed here. Fire-and-forget: if storage is blocked the event just isn't counted.
// Plain JS on the design pages (design/assets/site.js) sends the same body.

export const EVENT_NAMES = [
  "buy_click",
  "checkout_view",
  "bump_checked",
  "purchase",
  "post_bump_purchase",
  "email_signup",
  "moment_click",
  "checkout_submit",
  "offer_view",
  "offer_no",
  "scroll_depth",
  "cta_click",
  "section_view",
  "ab_view",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/** `place` says where the event happened: "hero", "plans", "sticky", "article-A", "moment-3", "thank-you"…
 *  For ab_view it is "test:variant" (lib/experiments.ts). */
export function trackEvent(name: EventName, place?: string): void {
  try {
    const visitor = localStorage.getItem("lbc-vid");
    const session = sessionStorage.getItem("lbc-sid");
    if (!visitor || !session) return;
    navigator.sendBeacon("/api/event", JSON.stringify({ visitor, session, name, place: place ?? null, path: location.pathname }));
  } catch {
    // Storage blocked: the event isn't counted.
  }
}
