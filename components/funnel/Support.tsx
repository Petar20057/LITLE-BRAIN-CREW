"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { usd } from "@/lib/funnel";
import { saveOrder } from "@/lib/order";
import { charge, type Method } from "@/lib/payments";
import CrewArt from "./CrewArt";

const AMOUNTS = [3, 5, 10, 20];

// Pay-what-you-want support. Deliberately not called a donation: Little Brain Crew is a company, not a charity.
export default function Support() {
  const router = useRouter();
  const [amount, setAmount] = useState(5);
  const [other, setOther] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<Method | null>(null);
  const [error, setError] = useState("");
  const value = other ? Number(other) : amount;

  async function pay(method: Method, e?: FormEvent) {
    e?.preventDefault();
    if (!(value >= 1 && value <= 1000)) return setError("Pick an amount between $1 and $1,000.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter your email for the receipt.");
    setError("");
    setBusy(method);
    try {
      const item = { id: "support", name: "Support the crew", price: value };
      await charge(method, [item], email);
      saveOrder({ email, items: [item], support: value });
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn’t go through. Please try again.");
      setBusy(null);
    }
  }

  return (
    <div className="fx-narrow" style={{ margin: "24px auto 0" }}>
      <form className="fx-card" onSubmit={(e) => pay("card", e)} noValidate>
        <div className="oto">
          <CrewArt k="toci" mood="happy" className="art" />
          <h1>Support the crew</h1>
          <p className="fx-sub">We’re a small team making free cartoons and tips for tired parents. If something here made one evening easier, you can chip in. It goes straight into the next free cartoon.</p>
        </div>

        <div className="amounts" role="group" aria-label="Amount">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" aria-pressed={!other && amount === a} onClick={() => { setAmount(a); setOther(""); }}>{usd(a)}</button>
          ))}
        </div>
        <label className="amount-other">Other amount: $
          <input type="number" min={1} max={1000} inputMode="numeric" value={other} onChange={(e) => setOther(e.target.value)} placeholder="25" aria-label="Other amount in dollars" />
        </label>

        <label className="fx-field" style={{ marginTop: 16 }}>
          Your email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <small>Only for your receipt.</small>
        </label>

        <div className="pay">
          <button className="btn btn-main btn-lg" type="submit" disabled={busy !== null}>{busy === "card" ? "One moment…" : `Give ${usd(value || 0)} with card`}</button>
          <span className="pay-or">or</span>
          <button className="btn btn-paypal" type="button" disabled={busy !== null} onClick={() => pay("paypal")}>{busy === "paypal" ? "One moment…" : "Give with PayPal"}</button>
        </div>
        {error && <p className="fx-err" role="alert">{error}</p>}
        <p className="fine" style={{ marginTop: 16 }}>
          This is a payment to Little Brain Crew, a company. It is not a charitable donation and is not tax-deductible. You don’t get a product for it, just our thanks. <span className="draft">company name</span>
        </p>
      </form>
    </div>
  );
}
