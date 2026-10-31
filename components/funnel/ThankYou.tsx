"use client";

import { useState } from "react";
import { per, total, usd } from "@/lib/funnel";
import { downloadPath, ownedProducts, sectionsFor } from "@/lib/delivery-files";
import { useOrder } from "@/lib/order";
import { trackEvent } from "@/lib/track-event";
import CrewArt from "./CrewArt";
import Steps from "./Steps";

export default function ThankYou() {
  const order = useOrder();
  const [copied, setCopied] = useState(false);
  const [skipBedtime, setSkipBedtime] = useState(false);
  const has = (id: string) => order.items.some((i) => i.id === id);
  const program = has("program") || has("upgrade") || has("screen-off-week");
  const club = order.items.some((i) => i.id.startsWith("club"));
  const toolkit = has("guide");
  const bedtime = has("bedtime-kit");

  // The download token of the paid order that bought a product (kept in this tab by components/funnel/Checkout.tsx).
  // A Reset order also owns the Toolkit it includes (lib/delivery-files.ts).
  const tokenFor = (product: string) => order.deliveries?.find((d) => ownedProducts(d.items).includes(product))?.token;
  const sections = sectionsFor(order.items.map((i) => i.id)).filter((s) => tokenFor(s.product));
  const toolkitToken = tokenFor("guide");

  if (order.support) {
    return (
      <div className="fx-narrow" style={{ margin: "0 auto" }}>
        <div className="fx-card oto">
          <CrewArt k="toci" mood="happy" className="art" />
          <h1>Thank you. Truly.</h1>
          <p className="fx-sub">Your {usd(order.support)} goes straight into the next free cartoon. The whole crew says thanks.</p>
          <a className="btn btn-main" href="/">Back to the crew</a>
        </div>
      </div>
    );
  }

  const shareSite = () => {
    const url = location.origin;
    navigator.clipboard?.writeText(url).then(() => setCopied(true), () => setCopied(false));
  };

  return (
    <div className="fx-narrow" style={{ margin: "0 auto" }}>
      <Steps current="Done" />
      <div className="fx-card">
        <div className="oto">
          <CrewArt k="endo" mood="happy" className="art" />
          <h1>You’re in. Welcome to the crew!</h1>
          {toolkitToken && (
            <a className="btn btn-main btn-lg" href={downloadPath(toolkitToken, "toolkit-pdf")}>Open the Toolkit now</a>
          )}
          <p className="fx-sub">{order.gift ? `Your gift card goes to ${order.gift.to_email} on ${order.gift.send_on}.` : order.email ? `Your link is on its way to ${order.email}.` : "Your link is on its way to your inbox."}</p>
        </div>

        {order.items.length > 0 && (
          <>
            <h2>Your order</h2>
            <ul className="ty-list">
              {order.items.map((i) => (
                <li key={i.id}><span>{i.name}{i.note && <small style={{ display: "block", color: "var(--ink-soft)", fontWeight: 500 }}>{i.note}</small>}</span><span>{per(i)}</span></li>
              ))}
              <li><span>Subtotal before discounts</span><span>{usd(total(order.items))}</span></li>
            </ul>
            <p className="fine">Your payment receipt shows the final total, including any discounts and taxes.</p>
          </>
        )}

        {sections.length > 0 && (
          <>
            <h2>Your files</h2>
            <ul className="ty-files">
              {sections.map((s) => {
                const token = tokenFor(s.product)!;
                if (s.files.length === 1) {
                  return <li key={s.label}><a href={downloadPath(token, s.files[0].id)}>{s.label}</a></li>;
                }
                return (
                  <li key={s.label}>
                    <b>{s.label}</b>
                    <ul>
                      {s.files.map((f) => <li key={f.id}><a href={downloadPath(token, f.id)}>{f.name}</a></li>)}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <h2>Your next 3 steps</h2>
        <ol className="ty-next">
          <li>Open the email from Little Brain Crew (hello@littlebraincrew.com). Not there in 5 minutes? Check Promotions or Spam.</li>
          <li>{program ? "Tonight: read Day 1 of the 30-Day Reset and choose your bedtime. It takes 10 minutes." : "Tonight: read the chapter for what’s hardest at home right now in The Kid Brain Toolkit. Start with The whole toolkit on one page (p. 5)."}</li>
          <li>{program ? "Print the fridge tracker and stick it where the whole family can see it." : "Pick one small habit for tomorrow, and stick the poster on the fridge."}</li>
        </ol>
        {club && <p className="fine">Your Crew Club membership is in your account. Pause or cancel anytime there: <a href="/account">manage membership</a>.</p>}

        {toolkit && !bedtime && !skipBedtime && (
          <div className="fx-card" style={{ marginTop: 24 }}>
            <h2>Bedtime still a battle?</h2>
            <p>Add the Bedtime & Screen-Off Kit for $7: a crew bedtime story to play at lights-out, plus the exact timer scripts for ending screen time without a fight.</p>
            <a className="btn btn-main" href="/checkout/bedtime" onClick={() => trackEvent("buy_click", "thank-you-bedtime")}>Add it for $7</a>
            <button className="no-thanks" type="button" onClick={() => setSkipBedtime(true)}>No thanks</button>
          </div>
        )}

        {toolkit && !program && (
          <div className="fx-card" style={{ marginTop: 24 }}>
            <h2>Want to turn the code into habits?</h2>
            <p>The 30-Day Reset is open: one 10-minute habit a day for 30 days, with the exact words to say. Your $9 counts toward it: email hello@littlebraincrew.com and we’ll send you a $9 code.</p>
            <a className="btn" href="/pricing" onClick={() => trackEvent("cta_click", "thank-you-reset")}>See the 30-Day Reset</a>
          </div>
        )}

        <div className="next-step" style={{ marginTop: 24 }}>
          <span>Know a parent who’s running on empty? <b>Send them the crew.</b></span>
          <button className="btn" type="button" onClick={shareSite}>{copied ? "Link copied ✓" : "Copy the link"}</button>
        </div>
      </div>
    </div>
  );
}
