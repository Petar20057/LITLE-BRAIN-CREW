import "server-only";

import { looseAdmin } from "@/lib/supabase/loose";
import { itemsFor } from "@/lib/creem";
import { MOMENTS } from "@/lib/funnel";
import { unsubscribeUrl } from "@/lib/consent";
import { EMAIL_BASE } from "@/lib/email/layout";
import { sendEmail } from "@/lib/email/send";
import { checkoutReminder } from "@/lib/email/templates";

// Abandoned checkout: ONE reminder to a parent who typed their email on our checkout and didn't pay
// (table checkout_starts, supabase/migrations/20261029130000_checkout_reminders.sql).
// Off until CHECKOUT_REMINDERS is "true": the privacy policy has to say we do this first. The cron route
// (app/api/cron/checkout-reminders) calls sendCheckoutReminders() once a day (vercel.json).

export const remindersOn = process.env.CHECKOUT_REMINDERS === "true";

/** Wait this long before reminding: most people who are still paying finish well within it. */
export const REMIND_AFTER_MS = 2 * 60 * 60 * 1000;
/** Older than this, a reminder would be out of the blue. */
export const REMIND_UNTIL_MS = 48 * 60 * 60 * 1000;
/** At most one reminder per address in this window, however many checkouts it starts. */
const ONE_PER_MS = 7 * 24 * 60 * 60 * 1000;

// Where "Finish my order" goes for each order key. Offers after a payment (upgrade, Screen-Off Week) get no reminder.
const CHECKOUT_FOR: Record<string, string> = {
  guide: "guide",
  "guide+bedtime-kit": "guide",
  program: "program",
  "program+cards": "program",
  "bedtime-kit": "bedtime",
};

/** Saved when the parent presses "Continue to payment". A failure is only logged: it must never block a payment. */
export async function recordCheckoutStart(start: { email: string; orderKey: string; crew?: string; moment?: string }) {
  if (!CHECKOUT_FOR[start.orderKey]) return;
  try {
    const { error } = await looseAdmin().from("checkout_starts").insert({
      email: start.email.trim().toLowerCase(),
      order_key: start.orderKey,
      crew: start.crew ?? null,
      moment: start.moment && start.moment in MOMENTS ? start.moment : null,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[checkout reminder] start not saved", err);
  }
}

type Start = { id: number; email: string; order_key: string; crew: string | null; moment: string | null; token: string; created_at: string; reminded_at: string | null };

/** Sends the reminders that are due. Returns how many went out and how many were skipped (paid, unsubscribed, recent). */
export async function sendCheckoutReminders(now = Date.now()): Promise<{ sent: number; skipped: number }> {
  const db = looseAdmin();
  const { data, error } = await db.from("checkout_starts").select().is("reminded_at", null).is("unsubscribed_at", null);
  if (error) throw error;
  const due = ((data ?? []) as Start[]).filter((s) => {
    const age = now - Date.parse(s.created_at);
    return age >= REMIND_AFTER_MS && age <= REMIND_UNTIL_MS;
  });

  let sent = 0;
  let skipped = 0;
  const done = new Set<string>();
  // Newest first, so a parent who started twice is reminded about the last thing they picked.
  for (const s of due.sort((a, b) => b.created_at.localeCompare(a.created_at))) {
    const stamp = () => db.from("checkout_starts").update({ reminded_at: new Date(now).toISOString() }).eq("id", s.id);
    if (done.has(s.email) || !(await shouldRemind(s, now))) {
      // Settled either way: never look at this start again.
      await stamp();
      skipped++;
      continue;
    }
    const items = itemsFor(s.order_key.split("+"));
    const slug = CHECKOUT_FOR[s.order_key];
    if (!items || !slug) {
      await stamp();
      skipped++;
      continue;
    }
    const params = new URLSearchParams({ utm_source: "reminder" });
    if (s.crew) params.set("crew", s.crew);
    if (s.moment) params.set("moment", s.moment);
    const email = checkoutReminder(items, `/checkout/${slug}?${params}`, s.moment ? MOMENTS[s.moment] : undefined, unsubscribeUrl(s.token));
    // Stamp first: if sending fails, the parent gets no reminder rather than two.
    const { error: e } = await stamp();
    if (e) throw e;
    try {
      await sendEmail(s.email, email, { unsubscribeUrl: `${EMAIL_BASE}/api/unsubscribe?t=${s.token}`, tag: "checkout-reminder" });
      sent++;
    } catch (err) {
      console.error("[checkout reminder] not sent", { id: s.id }, err);
    }
    done.add(s.email);
  }
  return { sent, skipped };
}

/** No reminder if they paid since, unsubscribed from anything of ours, or got a reminder this week. */
async function shouldRemind(s: Start, now: number): Promise<boolean> {
  const db = looseAdmin();
  const [orders, starts, signups, leads] = await Promise.all([
    db.from("orders").select().eq("email", s.email),
    db.from("checkout_starts").select().eq("email", s.email),
    db.from("signups").select().eq("email", s.email),
    db.from("quiz_leads").select().eq("email", s.email),
  ]);
  for (const r of [orders, starts, signups, leads]) if (r.error) throw r.error;
  const paid = (orders.data ?? []).some((o: { created_at: string }) => o.created_at >= s.created_at);
  const optedOut = [...(starts.data ?? []), ...(signups.data ?? []), ...(leads.data ?? [])].some((r: { unsubscribed_at?: string | null }) => r.unsubscribed_at);
  const recent = (starts.data ?? []).some((r: { reminded_at: string | null }) => r.reminded_at && now - Date.parse(r.reminded_at) < ONE_PER_MS);
  return !paid && !optedOut && !recent;
}
