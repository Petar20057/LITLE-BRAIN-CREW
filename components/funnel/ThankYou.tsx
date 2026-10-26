"use client";

import { useState } from "react";
import { CREW_NAMES, per, total, usd } from "@/lib/funnel";
import { useOrder } from "@/lib/order";
import CrewArt from "./CrewArt";
import Steps from "./Steps";

export default function ThankYou() {
  const order = useOrder();
  const [copied, setCopied] = useState(false);
  const has = (id: string) => order.items.some((i) => i.id === id);
  const program = has("program") || has("upgrade") || has("screen-off-week");
  const club = order.items.some((i) => i.id.startsWith("club"));

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
          <p className="fx-sub">{order.gift ? `Your gift card goes to ${order.gift.to_email} on ${order.gift.send_on}.` : order.email ? `Your link is on its way to ${order.email}.` : "Your link is on its way to your inbox."}</p>
        </div>

        {order.items.length > 0 && (
          <>
            <h2>Your order</h2>
            <ul className="ty-list">
              {order.items.map((i) => (
                <li key={i.id}><span>{i.name}{i.note && <small style={{ display: "block", color: "var(--ink-soft)", fontWeight: 500 }}>{i.note}</small>}</span><span>{per(i)}</span></li>
              ))}
              <li><span>Paid today</span><span>{usd(total(order.items))}</span></li>
            </ul>
          </>
        )}

        <h2>Your next 3 steps</h2>
        <ol className="ty-next">
          <li>Open the email from Little Brain Crew. Not there in 5 minutes? Check Promotions or Spam. <span className="draft">sender address</span></li>
          <li>{program ? "Tonight: watch Day 1 with your kid. It takes 10 minutes." : `Tonight: read ${order.crew ? `${CREW_NAMES[order.crew]}’s moments` : "the moment you see most at home"} in The Kid Brain Toolkit. It takes 5 minutes.`}</li>
          <li>Pick one small habit for tomorrow, and stick the poster on the fridge.</li>
        </ol>
        {club && <p className="fine">Your Crew Club membership is in your account. Pause or cancel anytime there: <a href="/account">manage membership</a>.</p>}

        <div className="next-step" style={{ marginTop: 24 }}>
          <span>Know a parent who’s running on empty? <b>Send them the crew.</b></span>
          <button className="btn" type="button" onClick={shareSite}>{copied ? "Link copied ✓" : "Copy the link"}</button>
        </div>
        <p className="fine" style={{ marginTop: 16 }}>Want to do more? <a href="/support">Support the crew</a> and help us make the next free cartoon.</p>
      </div>
    </div>
  );
}
