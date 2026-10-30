import "server-only";

import { looseAdmin } from "@/lib/supabase/loose";
import { unsubscribeUrl } from "@/lib/consent";
import { EMAIL_BASE } from "@/lib/email/layout";
import { sendEmail } from "@/lib/email/send";
import { challengeDay, freeScreenList, freeStickerPack } from "@/lib/email/templates";

// What the /free forms promise, sent once the address is confirmed (lib/consent.ts confirmToken calls deliverFreeOffer):
//   free-screen-list      the "15 ways" PDF        public/downloads/15-ways-to-end-screen-time.pdf
//   sticker-pack          the 12 crew stickers     public/downloads/crew-stickers.zip
//   screen-off-challenge  Day 1 now, then Days 2–5 once a day from the cron (app/api/cron/challenge → sendChallengeEmails)
// Challenge progress lives on the signup row: signups.challenge_day / challenge_sent_at
// (supabase/migrations/20261030140000_screen_off_challenge.sql).

export const CHALLENGE_LENGTH = 5;
/** The cron runs once a day; this margin keeps a day's email from slipping to the day after when the run is early. */
const NEXT_DAY_AFTER_MS = 20 * 60 * 60 * 1000;

type Signup = { id: string; email: string; form: string; confirm_token: string };

const listOptions = (token: string, tag: string) => ({ unsubscribeUrl: `${EMAIL_BASE}/api/unsubscribe?t=${token}`, tag });

/** Sends what the form promised. A failure is only logged: confirming must still work. */
export async function deliverFreeOffer(s: Signup, now = Date.now()): Promise<void> {
  try {
    if (s.form === "free-screen-list") {
      await sendEmail(s.email, freeScreenList(unsubscribeUrl(s.confirm_token)), listOptions(s.confirm_token, "free-list"));
    } else if (s.form === "sticker-pack") {
      await sendEmail(s.email, freeStickerPack(unsubscribeUrl(s.confirm_token)), listOptions(s.confirm_token, "free-stickers"));
    } else if (s.form === "screen-off-challenge") {
      // Stamp first: if sending fails, Day 2 still follows tomorrow rather than Day 1 twice.
      const { error } = await looseAdmin().from("signups").update({ challenge_day: 1, challenge_sent_at: new Date(now).toISOString() }).eq("id", s.id);
      if (error) throw error;
      await sendEmail(s.email, challengeDay(1, unsubscribeUrl(s.confirm_token)), listOptions(s.confirm_token, "challenge"));
    }
  } catch (err) {
    console.error("[free offer] not sent", { form: s.form }, err);
  }
}

type ChallengeRow = Signup & { challenge_day: number | null; challenge_sent_at: string | null; unsubscribed_at: string | null; confirmed_at: string | null };

/** The next challenge email for everyone due one. Returns how many went out. */
export async function sendChallengeEmails(now = Date.now()): Promise<{ sent: number }> {
  const db = looseAdmin();
  const { data, error } = await db.from("signups").select().eq("form", "screen-off-challenge").is("unsubscribed_at", null);
  if (error) throw error;
  const due = ((data ?? []) as ChallengeRow[]).filter(
    (r) =>
      r.confirmed_at &&
      r.challenge_day &&
      r.challenge_day < CHALLENGE_LENGTH &&
      r.challenge_sent_at &&
      now - Date.parse(r.challenge_sent_at) >= NEXT_DAY_AFTER_MS,
  );

  let sent = 0;
  for (const r of due) {
    const day = r.challenge_day! + 1;
    // Stamp first: if sending fails, the parent misses a day rather than getting it twice.
    const { error: e } = await db.from("signups").update({ challenge_day: day, challenge_sent_at: new Date(now).toISOString() }).eq("id", r.id);
    if (e) throw e;
    try {
      await sendEmail(r.email, challengeDay(day, unsubscribeUrl(r.confirm_token)), listOptions(r.confirm_token, "challenge"));
      sent++;
    } catch (err) {
      console.error("[challenge] not sent", { id: r.id, day }, err);
    }
  }
  return { sent };
}
