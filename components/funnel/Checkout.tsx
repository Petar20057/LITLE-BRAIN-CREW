"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CREW_NAMES, ITEMS, MOMENTS, PRODUCTS, per, total, usd, type CrewKey, type Item, type Product } from "@/lib/funnel";
import { saveOrder, useOrder, useQueryParam, useStored } from "@/lib/order";
import { charge } from "@/lib/payments";
import { trackEvent } from "@/lib/track-event";
import { copyB } from "@/lib/experiments";
import AB from "@/components/AB";
import CrewArt from "./CrewArt";
import Steps from "./Steps";

// Gifts are closed (design/gift.html): nothing sends the gift card yet, so ?gift=1 is ignored until it does.
const GIFTS_OPEN = false;

export default function Checkout({ slug }: { slug: Product["slug"] }) {
  // A/B test checkout-button (lib/experiments.ts): the "b" label, with {price} for the total, once its copy is approved.
  const buttonB = copyB("checkout-button", "button");
  const p = PRODUCTS[slug];
  const router = useRouter();
  const order = useOrder();
  // Where the visitor came from (utm_source), kept short and plain for the funnel numbers.
  const source = (useQueryParam("utm_source") ?? "").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 20);
  useEffect(() => {
    trackEvent("checkout_view", source ? `${slug}:${source}` : slug);
  }, [slug, source]);
  const crewParam = useQueryParam("crew");
  const crew = crewParam && crewParam in CREW_NAMES ? (crewParam as CrewKey) : undefined;
  // The decoder card the visitor came from (home page), so the order names their moment and its page.
  const momentParam = useQueryParam("moment");
  const moment = slug === "guide" && momentParam && momentParam in MOMENTS ? MOMENTS[momentParam] : undefined;
  // The /code quiz visit this order came from (?qs=), so /stats/quiz can count the purchase.
  const quiz = useQueryParam("qs") ?? undefined;
  const giftParam = useQueryParam("gift");
  const isGift = GIFTS_OPEN && giftParam === "1";
  const giftRaw = useStored("vlc-gift");
  const gift = isGift ? parseGift(giftRaw) : undefined;
  const planParam = useQueryParam("plan");
  const [planPick, setPlan] = useState<"monthly" | "yearly" | null>(null);
  const plan = planPick ?? (planParam === "yearly" ? "yearly" : "monthly");
  const yearlySave = ITEMS.clubMonthly.price * 12 - ITEMS.clubYearly.price;

  const [bump, setBump] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const main: Item =
    slug === "club" ? (plan === "yearly" ? ITEMS.clubYearly : ITEMS.clubMonthly) : slug === "guide" ? ITEMS.guide : slug === "bedtime" ? ITEMS.bedtimeKit : ITEMS.program;
  const items = [main, ...(bump && p.bump ? [p.bump.item] : [])];
  const recurring = items.some((i) => i.every);

  async function pay(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter the email where we should send your link.");
    if (recurring && !consent) return setError("Please tick the box to confirm how the membership renews.");
    setError("");
    setBusy(true);
    trackEvent("checkout_submit", items.map((i) => i.id).join("+"));
    try {
      const next = gift ? "/thank-you" : p.next;
      // The Bedtime Kit page adds to the order already in this tab (the Toolkit bought before it); anything else starts fresh.
      const prior = slug === "bedtime" ? order : undefined;
      await charge(items, email, {
        next,
        consent: recurring ? consent : undefined,
        crew,
        quiz,
        moment: moment ? momentParam ?? undefined : undefined,
        commit: (delivery) =>
          saveOrder({
            email,
            crew,
            gift,
            items: prior ? [...prior.items, ...items.filter((i) => !prior.items.some((x) => x.id === i.id))] : items,
            deliveries: [
              ...(prior?.deliveries ?? []),
              ...(delivery ? [{ token: delivery, items: items.map((i) => i.id) }] : []),
            ],
          }),
      });
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment didn’t go through. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Steps current="Order" />
      <div className="fx-grid">
        <form className="fx-card" onSubmit={pay} noValidate>
          <h1>{gift ? `A gift for ${gift.to || "a friend"}` : "Your order"}</h1>
          <div className="fx-product">
            <CrewArt k={crew ?? p.art} mood="happy" />
            <div>
              <b>{p.title}</b>
              <small>{moment ? `${moment.title}: the plan is on p. ${moment.page} (${moment.plan})` : crew && slug === "guide" ? `Starting with ${CREW_NAMES[crew]}’s moments` : gift ? `Sent to ${gift.to_email} on ${gift.send_on}` : "Instant access by email"}</small>
            </div>
          </div>

          {slug === "club" && (
            <div className="bill" role="group" aria-label="Billing" style={{ marginBottom: 12 }}>
              <button type="button" aria-pressed={plan === "monthly"} onClick={() => setPlan("monthly")}>Monthly · {usd(ITEMS.clubMonthly.price)}</button>
              <button type="button" aria-pressed={plan === "yearly"} onClick={() => setPlan("yearly")}>Yearly · {usd(ITEMS.clubYearly.price)} (save {usd(yearlySave)})</button>
            </div>
          )}

          {/* One item is already named above and priced in the total; the lines only show once the bump adds a second. */}
          {(items.length > 1 || recurring) && (
            <div style={{ marginTop: 16 }}>
              {items.map((i) => (
                <div className="line-item" key={i.id}><span>{i.name}</span><span>{per(i)}</span></div>
              ))}
            </div>
          )}

          {p.bump && !gift && (
            <label className="bump">
              <input
                type="checkbox"
                checked={bump}
                onChange={(e) => {
                  setBump(e.target.checked);
                  if (e.target.checked) trackEvent("bump_checked", slug);
                }}
              />
              <span><b>{p.bump.headline}</b>{p.bump.text}</span>
            </label>
          )}

          <div className="total"><span>Total today</span><span>{usd(total(items))}</span></div>

          <label className="fx-field" style={{ marginTop: 16 }}>
            Your email
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <small>Your link goes here. No spam, ever.</small>
          </label>

          {recurring && (
            <label className="bump" style={{ background: "#fff" }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I understand the Crew Club renews at {per(main)} until I cancel, and that I can pause or cancel anytime in my account, in 2 clicks.</span>
            </label>
          )}

          <div className="pay">
            <button className="btn btn-main btn-lg" type="submit" disabled={busy}>{busy ? "One moment…" : <AB test="checkout-button" a={`Continue to payment · ${usd(total(items))}`} b={buttonB?.replace("{price}", usd(total(items)))} />}</button>
          </div>
          {error && <p className="fx-err" role="alert">{error}</p>}

          <ul className="fx-trust">
            <li><AB test="checkout-button" a="Secure checkout by Creem, our payment partner: card, Apple Pay or Google Pay. We never see your card." b={recurring ? undefined : copyB("checkout-button", "trust")} /></li>
            <li>{recurring ? "Pause or cancel yourself, anytime" : "One payment, yours to keep. Instant access by email."}</li>
          </ul>
          {!recurring && <p className="fine">Digital product with instant access, so all sales are final.</p>}

          {/* What's inside sits below the button, so on a phone the email field and the button are on the first screen. */}
          <details className="fx-inside">
            <summary>What’s inside</summary>
            <p className="fx-sub">{p.sub}</p>
            <ul className="stack" style={{ margin: "12px 0 8px" }}>
              {p.get.map((g) => <li key={g}>{g}</li>)}
            </ul>
          </details>
        </form>

        <aside className="fx-aside">
          <div className="fx-card">
            <h3>What happens next</h3>
            <ol>
              <li>Your link lands in your inbox within a minute.</li>
              <li>{slug === "club" ? "Watch this week’s cartoon tonight." : slug === "program" ? "Tonight: read Day 1 of the Reset and choose your bedtime. 10 minutes." : slug === "bedtime" ? "Tonight: play Mela and the Soft-Light Night at lights-out. 5 minutes." : "Tonight: read the chapter for what’s hardest at home right now. 5 minutes."}</li>
              <li>Try one small habit. That’s it.</li>
            </ol>
          </div>
          <div className="fx-card fx-note">
            <h3>{recurring ? "No traps" : "Instant access"}</h3>
            <p>{recurring ? "Cancel or pause yourself, in your account, in 2 clicks. We email you before every yearly renewal." : "Your files land in your inbox within a minute. If a link or file won’t open, email us and we’ll fix it fast."}</p>
          </div>
          <p className="fine">Educational only, not medical advice. If you are worried about your child, talk to your pediatrician.</p>
        </aside>
      </div>
    </>
  );
}

// Gift card details saved by the gift page (design/assets/site.js).
function parseGift(raw: string | null): Record<string, string> | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
