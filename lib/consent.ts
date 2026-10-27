import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSessionId } from "@/lib/quiz-track";

// Double opt-in and unsubscribe for the mailing lists: the newsletter forms (signups.confirm_token) and the /code
// weekly tips (quiz_leads.token). The token in an emailed link is the only key, so a script can't confirm or remove
// someone else's address. Links open a page with a button (app/(funnel)/confirm, /unsubscribe): mail scanners that
// open every link never confirm or unsubscribe anyone. /api/unsubscribe is the one-click List-Unsubscribe POST.

export const confirmUrl = (token: string) => `/confirm?t=${token}`;
export const unsubscribeUrl = (token: string) => `/unsubscribe?t=${token}`;

export type ConsentResult = "done" | "already" | "unknown";

/** The click on "confirm" in a newsletter or weekly-tips email. */
export async function confirmToken(token: unknown): Promise<ConsentResult> {
  if (!isSessionId(token)) return "unknown";
  const db = createAdminClient();
  const now = new Date().toISOString();

  const { data: signup, error } = await db.from("signups").select("id, confirmed_at").eq("confirm_token", token).maybeSingle();
  if (error) throw error;
  if (signup) {
    if (signup.confirmed_at) return "already";
    const { error: e } = await db.from("signups").update({ confirmed_at: now, unsubscribed_at: null }).eq("id", signup.id);
    if (e) throw e;
    return "done";
  }

  const { data: lead, error: leadError } = await db.from("quiz_leads").select("id, tips_consent, tips_requested_at").eq("token", token).maybeSingle();
  if (leadError) throw leadError;
  if (!lead || !lead.tips_requested_at) return "unknown";
  if (lead.tips_consent) return "already";
  const { error: e } = await db.from("quiz_leads").update({ tips_consent: true, consent_at: now, unsubscribed_at: null }).eq("id", lead.id);
  if (e) throw e;
  return "done";
}

/** Unsubscribes the address behind the token from every list: all its form signups and the quiz tips. */
export async function unsubscribeToken(token: unknown): Promise<ConsentResult> {
  if (!isSessionId(token)) return "unknown";
  const db = createAdminClient();

  const [signup, lead] = await Promise.all([
    db.from("signups").select("email").eq("confirm_token", token).maybeSingle(),
    db.from("quiz_leads").select("email").eq("token", token).maybeSingle(),
  ]);
  if (signup.error) throw signup.error;
  if (lead.error) throw lead.error;
  const email = signup.data?.email ?? lead.data?.email;
  if (!email) return "unknown";

  const now = new Date().toISOString();
  const [a, b] = await Promise.all([
    db.from("signups").update({ unsubscribed_at: now }).eq("email", email).is("unsubscribed_at", null).select("id"),
    db.from("quiz_leads").update({ unsubscribed_at: now }).eq("email", email).is("unsubscribed_at", null).select("id"),
  ]);
  if (a.error) throw a.error;
  if (b.error) throw b.error;
  return (a.data?.length ?? 0) + (b.data?.length ?? 0) ? "done" : "already";
}
