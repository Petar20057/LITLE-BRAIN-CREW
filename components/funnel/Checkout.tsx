"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CREW_NAMES, ITEMS, PRODUCTS, per, total, usd, type CrewKey, type Item, type Product } from "@/lib/funnel";
import { saveOrder, useQueryParam, useStored } from "@/lib/order";
import { charge, type Method } from "@/lib/payments";
import CrewArt from "./CrewArt";
import Steps from "./Steps";

export default function Checkout({ slug }: { slug: Product["slug"] }) {
  const p = PRODUCTS[slug];
  const router = useRouter();
  const crewParam = useQueryParam("crew");
  const crew = crewParam && crewParam in CREW_NAMES ? (crewParam as CrewKey) : undefined;
  const isGift = useQueryParam("gift") === "1";
  const giftRaw = useStored("vlc-gift");
  const gift = isGift ? parseGift(giftRaw) : undefined;
  const planParam = useQueryParam("plan");
  const [planPick, setPlan] = useState<"monthly" | "yearly" | null>(null);
  const plan = planPick ?? (planParam === "yearly" ? "yearly" : "monthly");

  const [bump, setBump] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<Method | null>(null);
  const [error, setError] = useState("");

  const main: Item = slug === "club" ? (plan === "yearly" ? ITEMS.clubYearly : ITEMS.clubMonthly) : slug === "guide" ? ITEMS.guide : ITEMS.program;
  const items = [main, ...(bump && p.bump ? [p.bump.item] : [])];
  const recurring = items.some((i) => i.every);

  async function pay(method: Method, e?: FormEvent) {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter the email where we should send your link.");
    if (recurring && !consent) return setError("Please tick the box to confirm how the membership renews.");
    setError("");
    setBusy(method);
    try {
      await charge(method, items, email);
      saveOrder({ email, items, crew, gift });
      router.push(gift ? "/thank-you" : p.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment didn’t go through. Please try again.");
      setBusy(null);
    }
  }

  return (
    <>
      <Steps current="Order" />
      <div className="fx-grid">
        <form className="fx-card" onSubmit={(e) => pay("card", e)} noValidate>
          <h1>{gift ? `A gift for ${gift.to || "a friend"}` : "Your order"}</h1>
          <p className="fx-sub">{p.sub}</p>

          <div className="fx-product">
            <CrewArt k={crew ?? p.art} mood="happy" />
            <div>
              <b>{p.title}</b>
              <small>{crew && slug === "guide" ? `Starting with ${CREW_NAMES[crew]}’s moments` : gift ? `Sent to ${gift.to_email} on ${gift.send_on}` : "Instant access by email"}</small>
            </div>
          </div>

          {slug === "club" && (
            <div className="bill" role="group" aria-label="Billing" style={{ marginBottom: 12 }}>
              <button type="button" aria-pressed={plan === "monthly"} onClick={() => setPlan("monthly")}>Monthly · $9</button>
              <button type="button" aria-pressed={plan === "yearly"} onClick={() => setPlan("yearly")}>Yearly · $79 (save 27%)</button>
            </div>
          )}

          <ul className="stack" style={{ margin: "12px 0 8px" }}>
            {p.get.map((g) => <li key={g}>{g}</li>)}
          </ul>

          <div style={{ marginTop: 16 }}>
            {items.map((i) => (
              <div className="line-item" key={i.id}><span>{i.name}</span><span>{per(i)}</span></div>
            ))}
          </div>

          {p.bump && !gift && (
            <label className="bump">
              <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} />
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
            <button className="btn btn-main btn-lg" type="submit" disabled={busy !== null}>{busy === "card" ? "One moment…" : `Pay ${usd(total(items))} with card`}</button>
            <span className="pay-or">or</span>
            <button className="btn btn-paypal" type="button" disabled={busy !== null} onClick={() => pay("paypal")}>{busy === "paypal" ? "One moment…" : "Pay with PayPal"}</button>
          </div>
          {error && <p className="fx-err" role="alert">{error}</p>}

          <ul className="fx-trust">
            <li>Safe payment by Stripe or PayPal. We never see your card.</li>
            <li>{recurring ? "Pause or cancel yourself, anytime" : "One payment, yours to keep"}</li>
            {!recurring && <li>Digital product, instant access. All sales are final.</li>}
          </ul>
        </form>

        <aside className="fx-aside">
          <div className="fx-card">
            <h3>What happens next</h3>
            <ol>
              <li>Your link lands in your inbox within a minute.</li>
              <li>{slug === "club" ? "Watch this week’s cartoon tonight." : slug === "program" ? "Tonight: watch Day 1 with your kid. 10 minutes." : "Tonight: read the moment you see most at home. 5 minutes."}</li>
              <li>Try one small habit. That’s it.</li>
            </ol>
          </div>
          <div className="fx-card fx-note">
            <h3>{recurring ? "No traps" : "Instant access"}</h3>
            <p>{recurring ? "Cancel or pause yourself, in your account, in 2 clicks. We email you before every yearly renewal." : "Your files land in your inbox within a minute. If a link or file won’t open, email us and we’ll fix it fast."}</p>
          </div>
          <p className="fine">For learning only. Not medical advice. If you are worried about your child, talk to your pediatrician.</p>
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
