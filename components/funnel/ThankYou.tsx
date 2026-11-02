"use client";

import { useState } from "react";
import { ITEMS, usd, type Item } from "@/lib/funnel";
import { downloadPath, sectionsForPurchases } from "@/lib/delivery-files";
import { useOrder, useQueryParam } from "@/lib/order";
import { trackEvent } from "@/lib/track-event";
import CrewArt from "./CrewArt";
import Steps from "./Steps";
import { usePaidPurchases } from "./usePaidPurchases";

export default function ThankYou() {
  const order = useOrder();
  const waitForUpgrade = useQueryParam("upgrade") === "1";
  const paid = usePaidPurchases(order.deliveries, waitForUpgrade);
  const [copied, setCopied] = useState(false);
  const [skipBedtime, setSkipBedtime] = useState(false);
  const purchases = Object.values(paid.byToken).flat();
  const ids = purchases.flatMap((p) => p.items);
  const program = ids.includes("program") || ids.includes("upgrade");
  const toolkit = ids.includes("guide");
  const bedtime = ids.includes("bedtime-kit");
  const downloads = Object.entries(paid.byToken).flatMap(([token, owned]) =>
    sectionsForPurchases(owned).map((section) => ({ token, section })),
  );
  const first = (program ? downloads.find((d) => d.section.product === "program") : undefined) ?? downloads[0];
  const items: Item[] = Object.values(ITEMS);
  const names = (itemIds: string[]) => itemIds.map((id) => items.find((item) => item.id === id)?.name ?? id).join(" + ");
  const shareSite = () => {
    navigator.clipboard?.writeText(location.origin).then(() => setCopied(true), () => setCopied(false));
  };

  return (
    <div className="fx-narrow" style={{ margin: "0 auto" }}>
      <Steps current="Done" />
      <div className="fx-card">
        <div className="oto">
          <CrewArt k="endo" mood="happy" className="art" />
          <h1>Thank you. Welcome to the crew!</h1>
          {first && <a className="btn btn-main btn-lg" href={downloadPath(first.token, first.section.files[0].id)}>{program ? "Open the Reset now" : toolkit ? "Open the Toolkit now" : "Open your kit"}</a>}
          <p className="fx-sub">{order.email ? `Your download links are on their way to ${order.email}.` : "Your download links are on their way to your inbox."}</p>
          {(paid.pending || (waitForUpgrade && !program)) && <p className="fine" role="status">Confirming your payment… Your files appear here as soon as it is confirmed.</p>}
          {paid.error && <p className="fine" role="status">{paid.error}</p>}
        </div>
        {purchases.length > 0 && <>
          <h2>Your order</h2>
          <ul className="ty-list">
            {purchases.map((purchase, i) => <li key={i}><span>{names(purchase.items)}</span><span>{usd(purchase.amountCents / 100)}</span></li>)}
            <li><span>Total paid</span><span>{usd(purchases.reduce((sum, p) => sum + p.amountCents, 0) / 100)}</span></li>
          </ul>
          <p className="fine">Your Creem receipt has the full payment details, including discounts and taxes.</p>
        </>}
        {downloads.length > 0 && <>
          <h2>Your files</h2>
          <ul className="ty-files">
            {downloads.map(({ token, section }) => <li key={`${token}:${section.label}`}>
              <b>{section.label}</b>
              <ul>{section.files.map((file) => <li key={file.id}><a href={downloadPath(token, file.id)}>{file.name}</a></li>)}</ul>
            </li>)}
          </ul>
        </>}
        <h2>Your next 3 steps</h2>
        <ol className="ty-next">
          <li>Open the email from Little Brain Crew (hello@littlebraincrew.com). Check Promotions or Spam if it hasn’t arrived in 5 minutes.</li>
          <li>{program ? "Tonight: read Day 1 of the 30-Day Reset and choose your bedtime. About 10 minutes." : bedtime && !toolkit ? "Tonight: try Day 1 of Screen-Off Week, then read The Crew Goes to Sleep together." : "Tonight: find your hardest moment on The code on one page (Toolkit p. 4), then read that moment’s page."}</li>
          <li>{program ? "Print the fridge tracker and put it where the whole family can see it. The Science Edition explains the habits behind the plan." : "Choose one small habit to try tomorrow."}</li>
        </ol>
        {toolkit && !program && !waitForUpgrade && <div className="fx-card" style={{ marginTop: 24 }}>
          <h2>Put the Toolkit into practice</h2>
          <p>Add the 30-Day Reset for $20: the Reset guide, fridge tracker and Science Edition. No discount code needed.</p>
          <a className="btn btn-main" href="/offer/upgrade" onClick={() => trackEvent("cta_click", "thank-you-reset")}>Add the Reset · $20</a>
        </div>}
        {toolkit && !bedtime && !skipBedtime && <div className="fx-card" style={{ marginTop: 24 }}>
          <h2>Make the hardest hour easier</h2>
          <p>The Bedtime &amp; Screen-Off Kit: seven evenings of habits, the exact words for every age, a routine card and a story to read together. One PDF.</p>
          <a className="btn" href="/checkout/bedtime" onClick={() => trackEvent("buy_click", "thank-you-bedtime")}>Add the kit · $7</a>
          <button className="no-thanks" type="button" onClick={() => setSkipBedtime(true)}>No thanks</button>
        </div>}
        <div className="next-step" style={{ marginTop: 24 }}>
          <span>Know a parent who’s running on empty? <b>Send them the crew.</b></span>
          <button className="btn" type="button" onClick={shareSite}>{copied ? "Link copied ✓" : "Copy the link"}</button>
        </div>
      </div>
    </div>
  );
}
