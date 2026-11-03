import type { PaidPurchase } from "./delivery-files";
import { UNTRACKED } from "./analytics";

export const AD_CONSENT_KEY = "lbc-ad-consent";
export const AD_READY_EVENT = "lbc-ad-ready";
export const META_PIXEL_ID = /^\d+$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "") ? process.env.NEXT_PUBLIC_META_PIXEL_ID! : "";
export const TIKTOK_PIXEL_ID = /^[A-Za-z0-9]{10,40}$/.test(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? "") ? process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID! : "";
export const ADS_CONFIGURED = Boolean(META_PIXEL_ID || TIKTOK_PIXEL_ID);

type PixelWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  ttq?: { page: () => void; track: (...args: unknown[]) => void };
};

export const adPathAllowed = (path: string) => !UNTRACKED.test(path) && !/^\/(account|login|confirm|unsubscribe|code|ask)(\/|$)/.test(path);

export function adConsent() {
  try {
    return localStorage.getItem(AD_CONSENT_KEY);
  } catch {
    return null;
  }
}

const viewed: Record<string, string> = {};
export function trackAdPage(path: string) {
  if (adConsent() !== "granted" || !adPathAllowed(path)) return;
  const w = window as PixelWindow;
  if (META_PIXEL_ID && w.fbq && viewed.meta !== path) {
    w.fbq("track", "PageView");
    viewed.meta = path;
  }
  if (TIKTOK_PIXEL_ID && w.ttq && viewed.tiktok !== path) {
    w.ttq.page();
    viewed.tiktok = path;
  }
}

/** Only use purchases returned by /api/order after the signed payment webhook. Never the browser's order basket. */
export function trackAdPurchase(purchase: PaidPurchase) {
  if (adConsent() !== "granted" || !purchase.eventId || !adPathAllowed(location.pathname)) return;
  const w = window as PixelWindow;
  const properties = { value: purchase.amountCents / 100, currency: "USD", content_ids: purchase.items, content_type: "product" };
  if (META_PIXEL_ID && w.fbq) once(`meta:${META_PIXEL_ID}:${purchase.eventId}`, () =>
    w.fbq!("track", "Purchase", properties, { eventID: purchase.eventId }),
  );
  if (TIKTOK_PIXEL_ID && w.ttq) once(`tiktok:${TIKTOK_PIXEL_ID}:${purchase.eventId}`, () =>
    w.ttq!.track("Purchase", { ...properties, contents: purchase.items.map((id) => ({ content_id: id, quantity: 1 })) }, { event_id: purchase.eventId }),
  );
}

const sent = new Set<string>();
function once(id: string, send: () => void) {
  const key = `lbc-ad-purchase:${id}`;
  if (sent.has(key)) return;
  try {
    if (localStorage.getItem(key)) return;
  } catch { /* In-memory deduplication still works when storage is blocked. */ }
  try {
    send();
    sent.add(key);
    localStorage.setItem(key, "1");
  } catch { /* Advertising must never interrupt checkout or downloads. */ }
}

export function trackAdCheckout(items: { id: string; price: number }[]) {
  if (adConsent() !== "granted" || !adPathAllowed(location.pathname)) return;
  const properties = { value: items.reduce((sum, item) => sum + item.price, 0), currency: "USD", content_ids: items.map((item) => item.id), content_type: "product" };
  const w = window as PixelWindow;
  try {
    if (META_PIXEL_ID) w.fbq?.("track", "InitiateCheckout", properties);
    if (TIKTOK_PIXEL_ID) w.ttq?.track("InitiateCheckout", properties);
  } catch { /* Advertising must never interrupt checkout. */ }
}
