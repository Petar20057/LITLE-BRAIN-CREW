import { NextResponse, type NextRequest } from "next/server";
import { createCheckout, creemConfigured, itemsFor, orderKey, productIdFor } from "@/lib/creem";
import { CREW_NAMES } from "@/lib/funnel";
import { SITE_URL } from "@/lib/design";
import { isSessionId } from "@/lib/quiz-track";
import { allow, tooMany } from "@/lib/rate-limit";

// Starts a Creem checkout for what the funnel page asks for and returns its URL (lib/payments.ts redirects there).
// The browser only names item ids; prices and the Creem product come from the server. Access is granted later
// by the webhook (app/api/creem/webhook), never by the redirect back.
type Body = { items?: unknown; email?: unknown; next?: unknown; consent?: unknown; crew?: unknown; quiz?: unknown };

const NEXT = /^\/[a-z0-9/-]*$/;

export async function POST(request: NextRequest) {
  if (!creemConfigured) return NextResponse.json({ error: "Payments are not connected yet." }, { status: 503 });
  if (!(await allow("checkout", request))) return tooMany();

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const ids = Array.isArray(body.items) && body.items.every((i) => typeof i === "string") ? (body.items as string[]) : [];
  const items = ids.length ? itemsFor(ids) : null;
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const next = typeof body.next === "string" && NEXT.test(body.next) ? body.next : "/thank-you";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  // Unknown ids include "support" (any amount): not sold through Creem until it confirms pay-what-you-want.
  if (!items) return NextResponse.json({ error: "This isn’t on sale yet." }, { status: 404 });

  const recurring = items.some((i) => i.every);
  // Auto-renewal laws: the membership needs the "I understand it renews" tick, stored with the subscription.
  if (recurring && body.consent !== true) {
    return NextResponse.json({ error: "Please tick the box to confirm how the membership renews." }, { status: 400 });
  }

  const key = orderKey(ids);
  const productId = productIdFor(key);
  if (!productId) return NextResponse.json({ error: "This isn’t on sale yet." }, { status: 404 });

  const metadata: Record<string, string> = { order: key };
  if (recurring) metadata.renewal_consent_at = new Date().toISOString();
  if (typeof body.crew === "string" && body.crew in CREW_NAMES) metadata.crew = body.crew;
  // The webhook marks the /code quiz visit as bought (quiz_sessions.purchased_at).
  if (isSessionId(body.quiz)) metadata.quiz_session = body.quiz;

  try {
    const url = await createCheckout({ productId, email, successUrl: `${SITE_URL}${next}`, metadata });
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Payment couldn’t start. Please try again." }, { status: 502 });
  }
}
