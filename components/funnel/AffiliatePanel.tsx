"use client";

import { useState } from "react";
import { AFFILIATE, ITEMS, commission, usd } from "@/lib/funnel";
import CrewArt from "./CrewArt";

// Members-only affiliate area, preview. The program itself runs on Creem (invite-only, manual approval):
// a member asks here, we check the membership and send the Creem invite from the Affiliate Hub. Their link,
// clicks, earnings and payouts then live in Creem's affiliate dashboard, not on our site.
const PCT = `${Math.round(AFFILIATE.rate * 100)}%`;

const RULES = [
  `You earn ${PCT} of every payment from parents who buy through your link, figured after the ${Math.round(AFFILIATE.creemFee * 100)}% fee Creem keeps on affiliate sales. Your link counts for ${AFFILIATE.cookieDays} days.`,
  "Always say you earn a commission, in every post or message (“I earn a commission if you buy”, or #ad). US law (FTC) requires it.",
  "Share only your own honest experience. No made-up results, no medical claims, no promises about a child’s health or behavior.",
  "No buying through your own link, no coupon sites, no ads on our name, no spam, and never aim posts at kids.",
  `Creem pays out on ${AFFILIATE.payoutDays} of the month from ${usd(AFFILIATE.minPayout)}, after a ${AFFILIATE.holdDays} day wait and a one-time ID check, by bank transfer or USDC. Creem charges its own payout fee.`,
];

const CAPTIONS = [
  "We’ve been learning about our kid’s brain with the Little Brain Crew: cartoon characters for the brain chemicals behind sleep, screens and meltdowns. If screen-off is a fight at your house too, take a look: [your link] (I’m a Crew Club member and I earn a commission if you buy.)",
  "Why does screen time end in tears? The Little Brain Crew explains it with a character called Dopa, in 3 minutes, for parents of kids 3–17. [your link] #ad, I earn a commission",
  "The crew that explains my kid’s brain → [your link] (#ad: I earn a commission if you buy)",
];

export default function AffiliatePanel() {
  const [agree, setAgree] = useState(false);
  const [asked, setAsked] = useState(false);
  const [copied, setCopied] = useState(-1);

  async function copy(i: number) {
    try {
      await navigator.clipboard.writeText(CAPTIONS[i]);
      setCopied(i);
    } catch {
      setCopied(-1);
    }
  }

  return (
    <div className="fx-card">
      <div className="fx-product">
        <CrewArt k="toci" mood="happy" />
        <div><b>Share the crew, earn {PCT}</b><small>Preview · only for Crew Club members</small></div>
      </div>

      {!asked ? (
        <>
          <p className="fx-sub">When a parent buys through your link, you earn {PCT} of what they pay: {usd(commission(ITEMS.clubMonthly.price))} from a new member’s {usd(ITEMS.clubMonthly.price)} month, {usd(commission(ITEMS.program.price))} from a 30-Day Reset, {usd(commission(ITEMS.guide.price))} from a Toolkit. The program runs on Creem, our payment partner, and you stay in it even if you later cancel your Club.</p>
          <h2>The rules</h2>
          <ul className="stack" style={{ margin: "8px 0 16px" }}>
            {RULES.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <label className="bump" style={{ background: "#fff" }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I agree to these rules and the <a className="link" href="/terms">terms</a>.</span>
          </label>
          <button className="btn btn-main" type="button" disabled={!agree} onClick={() => setAsked(true)}>Send me my invite</button>
        </>
      ) : (
        <>
          <div className="save-offer">
            <h3>Your invite is on its way</h3>
            <p>We check your membership, then Creem emails you an invite to the Little Brain Crew affiliate program. Click “Join Program” in that email. Your link, clicks, earnings and payouts all live in your Creem affiliate dashboard.</p>
          </div>

          <h2>Ready to share</h2>
          <p className="fine">Put your link where it says [your link], and change the words so they sound like you. Keep the part that says you earn a commission.</p>
          {CAPTIONS.map((c, i) => (
            <div className="save-offer" key={c} style={{ background: "var(--paper)" }}>
              <p>{c}</p>
              <button className="btn btn-quiet" type="button" onClick={() => copy(i)}>{copied === i ? "Copied ✓" : "Copy"}</button>
            </div>
          ))}
        </>
      )}
      <p className="fine" style={{ marginTop: 16 }}><a className="link" href="/account">← Back to my account</a> · <a className="link" href="/affiliate">How the program works</a></p>
    </div>
  );
}
