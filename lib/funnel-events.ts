import "server-only";

import { looseAdmin } from "@/lib/supabase/loose";
import { EVENT_NAMES, type EventName } from "@/lib/track-event";

// Funnel events (table funnel_events, supabase/migrations/20261028120000_orders_and_funnel_events.sql).
// The browser may send every name in EVENT_NAMES except the two purchase events: those come from the server
// (the Creem webhook, lib/delivery.ts), so a closed tab or a blocked script can't lose them and a visitor can't fake them.

export const SERVER_EVENTS: readonly EventName[] = ["purchase", "post_bump_purchase"];
export const BROWSER_EVENTS: readonly EventName[] = EVENT_NAMES.filter((n) => !SERVER_EVENTS.includes(n));

export const isBrowserEvent = (s: unknown): s is EventName => typeof s === "string" && (BROWSER_EVENTS as readonly string[]).includes(s);

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch/i;
export const isBot = (ua: string) => BOT.test(ua);

/** `place` says where it happened: "hero", "plans", "guide", "moment-3", "guide+bedtime-kit"… Anything else is dropped. */
export const cleanPlace = (v: unknown) => (typeof v === "string" && /^[A-Za-z0-9:_+./-]{1,40}$/.test(v) ? v : null);

/** The visitor and visit ids of components/Track.tsx, when the browser had them. */
export type Visit = { visitor: string | null; session: string | null };

/** Writes one server-side event. Throws on failure so the caller decides (the webhook logs it). */
export async function recordServerEvent(name: (typeof SERVER_EVENTS)[number], place: string, amountCents: number, visit?: Visit) {
  const { error } = await looseAdmin()
    .from("funnel_events")
    .insert({ name, place, amount_cents: amountCents, visitor_id: visit?.visitor ?? null, session_id: visit?.session ?? null });
  if (error) throw error;
}
