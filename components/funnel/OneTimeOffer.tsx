"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OFFERS } from "@/lib/funnel";
import { addItem, useOrder } from "@/lib/order";
import { charge } from "@/lib/payments";
import CrewArt from "./CrewArt";
import Steps from "./Steps";

// An upsell or downsell shown after payment: one offer, one yes, one honest no.
export default function OneTimeOffer({ slug }: { slug: string }) {
  const o = OFFERS[slug];
  const router = useRouter();
  const order = useOrder();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function yes() {
    if (o.consent && !consent) return setError("Please tick the box to confirm how it renews.");
    setBusy(true);
    try {
      await charge([o.item], order.email, { next: o.next.yes, consent: o.consent ? consent : undefined, commit: () => addItem(o.item) });
      router.push(o.next.yes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn’t go through. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="fx-narrow" style={{ margin: "0 auto" }}>
      <Steps current={o.step} />
      <div className="fx-card oto">
        <span className="hand">{o.hand}</span>
        <h1>{o.title}</h1>
        <p className="fx-sub">{o.sub}</p>
        <CrewArt k={o.art} mood="happy" className="art" />
        <ul className="stack">{o.stack.map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="price">{o.price}{o.was && <s>{o.was}</s>}</div>
        <p className="per">{o.per}</p>
        {o.consent && (
          <label className="bump" style={{ background: "#fff", textAlign: "left", maxWidth: 520, margin: "0 auto 16px" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{o.consent}</span>
          </label>
        )}
        <button className="btn btn-main" type="button" onClick={yes} disabled={busy}>{busy ? "One moment…" : o.yes}</button>
        {error && <p className="fx-err" role="alert">{error}</p>}
        <button className="no-thanks" type="button" onClick={() => router.push(o.next.no)} disabled={busy}>{o.no}</button>
        {o.fine && <p className="fine">{o.fine}</p>}
      </div>
    </div>
  );
}
