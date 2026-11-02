"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OFFERS } from "@/lib/funnel";
import { addPaid, useOrder } from "@/lib/order";
import { charge } from "@/lib/payments";
import { trackEvent } from "@/lib/track-event";
import CrewArt from "./CrewArt";
import Steps from "./Steps";
import { usePaidPurchases } from "./usePaidPurchases";

// An upsell or downsell shown after payment: one offer, one yes, one honest no.
export default function OneTimeOffer({ slug }: { slug: string }) {
  const o = OFFERS[slug];
  const router = useRouter();
  const order = useOrder();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const paid = usePaidPurchases(order.deliveries);
  const paidIds = Object.values(paid.byToken).flat().flatMap((p) => p.items);
  const owned = Boolean(o.skipIfOwned && paidIds.includes(o.skipIfOwned));
  const alreadyReset = paidIds.includes("program") || paidIds.includes("upgrade");
  const toolkitToken = Object.entries(paid.byToken).find(([, purchases]) => purchases.some((p) => p.items.includes("guide")))?.[0];

  // Already in the order (the Bedtime Kit taken as the bump): don't offer it twice. Seen offers are counted for /admin;
  // a yes is counted by the Creem webhook when it's paid.
  useEffect(() => {
    if (paid.pending) return;
    if (slug === "upgrade" && alreadyReset) router.replace("/thank-you");
    else if (owned) router.replace(o.next.no);
    else trackEvent("offer_view", slug);
  }, [owned, alreadyReset, paid.pending, o.next.no, router, slug]);

  async function yes() {
    if (o.consent && !consent) return setError("Please tick the box to confirm how it renews.");
    setBusy(true);
    setError("");
    try {
      if (slug === "upgrade") {
        const response = await fetch("/api/upgrade", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: toolkitToken }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Your upgrade couldn’t start. Please try again.");
        if (data.complete) return router.replace("/thank-you");
        if (!data.url) throw new Error("Your checkout is still being prepared. Please try again.");
        window.location.assign(data.url);
        return;
      }
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
        <button className="btn btn-main" type="button" onClick={yes} disabled={busy || paid.pending || (slug === "upgrade" && !toolkitToken)}>{busy ? "One moment…" : paid.pending ? "Confirming your payment…" : o.yes}</button>
        {slug === "upgrade" && !paid.pending && !toolkitToken && <p className="fine">Open this offer from your paid Toolkit order. Your download links are in your email.</p>}
        {error && <p className="fx-err" role="alert">{error}</p>}
        <button className="no-thanks" type="button" onClick={no} disabled={busy}>{o.no}</button>
        {o.fine && <p className="fine">{o.fine}</p>}
      </div>
    </div>
  );
}
