"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OFFERS } from "@/lib/funnel";
import { addPaid, useOrder } from "@/lib/order";
import { charge } from "@/lib/payments";
import { trackEvent } from "@/lib/track-event";
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
  const owned = Boolean(o.skipIfOwned && order.items.some((i) => i.id === o.skipIfOwned));

  // Already in the order (the Bedtime Kit taken as the bump): don't offer it twice. Seen offers are counted for /admin;
  // a yes is counted by the Creem webhook when it's paid.
  useEffect(() => {
    if (owned) router.replace(o.next.no);
    else trackEvent("offer_view", slug);
  }, [owned, o.next.no, router, slug]);

  async function yes() {
    if (o.consent && !consent) return setError("Please tick the box to confirm how it renews.");
    setBusy(true);
    try {
      await charge([o.item], order.email, { next: o.next.yes, consent: o.consent ? consent : undefined, commit: (delivery) => addPaid(o.item, delivery) });
      router.push(o.next.yes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn’t go through. Please try again.");
      setBusy(false);
    }
  }

  function no() {
    trackEvent("offer_no", slug);
    router.push(o.next.no);
  }

  if (owned) return null;

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
        <button className="no-thanks" type="button" onClick={no} disabled={busy}>{o.no}</button>
        {o.fine && <p className="fine">{o.fine}</p>}
      </div>
    </div>
  );
}
