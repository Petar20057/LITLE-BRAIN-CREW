"use client";

import { useState } from "react";
import { useQueryParam } from "@/lib/order";
import CrewArt from "./CrewArt";

// Churn: ask why → one save offer that fits the reason → confirm. "Cancel now" is visible on every step,
// so saving never blocks leaving (auto-renewal laws require easy online cancellation).
type Reason = "price" | "time" | "done" | "age" | "broken" | "other";

const REASONS: [Reason, string][] = [
  ["price", "It costs too much right now"],
  ["time", "I don’t have time to use it"],
  ["done", "We got what we needed"],
  ["age", "It doesn’t fit my kid’s age anymore"],
  ["broken", "Something isn’t working"],
  ["other", "Something else"],
];

type Step = "why" | "offer" | "saved" | "cancelled";

export default function CancelFlow() {
  const pauseLink = useQueryParam("pause") === "1";
  const [reasonPick, setReason] = useState<Reason | null>(null);
  const reason = reasonPick ?? (pauseLink ? "time" : null);
  const [stepPick, setStep] = useState<Step | null>(null);
  const step: Step = stepPick ?? (pauseLink ? "offer" : "why");
  const [saved, setSaved] = useState("");
  const [note, setNote] = useState("");

  // Preview: these would call the billing API (Stripe: pause_collection, coupon, price change, cancel_at_period_end).
  const keep = (what: string) => { setSaved(what); setStep("saved"); };
  const cancel = () => setStep("cancelled");

  const cancelBar = (
    <div className="cancel-anyway">
      <span className="fine">Changed your mind about saving? No hard feelings.</span>
      <button className="btn btn-quiet" type="button" onClick={cancel}>Cancel now</button>
    </div>
  );

  if (step === "saved")
    return (
      <div className="fx-card oto">
        <CrewArt k="endo" mood="happy" className="art" />
        <h1>Done. Glad you’re staying.</h1>
        <p className="fx-sub">{saved} You’ll get an email confirming it.</p>
        <a className="btn btn-main" href="/account">Back to my account</a>
      </div>
    );

  if (step === "cancelled")
    return (
      <div className="fx-card">
        <div className="oto">
          <CrewArt k="toci" mood="tired" className="art" />
          <h1>Your membership is cancelled</h1>
          <p className="fx-sub">You keep everything until the end of this billing period, and you won’t be charged again. The cartoons you watched, your streak and your notes stay saved if you ever come back.</p>
        </div>
        <label className="fx-field">
          One thing we could do better? (optional)
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="It helps us more than you’d think." />
        </label>
        <div className="acct-actions">
          <button className="btn" type="button" disabled={!note.trim()} onClick={() => setNote("")}>Send</button>
          <a className="btn btn-quiet" href="/account">Restart my membership</a>
        </div>
      </div>
    );

  if (step === "offer" && reason)
    return (
      <div className="fx-card">
        <h1>{reason === "time" ? "Pause instead?" : "Before you go"}</h1>
        <SaveOffer reason={reason} onKeep={keep} />
        {cancelBar}
      </div>
    );

  return (
    <div className="fx-card">
      <h1>Sorry to see you go</h1>
      <p className="fx-sub">What’s the main reason? One click, and we’ll show you what we can do.</p>
      <div className="reasons" role="radiogroup">
        {REASONS.map(([r, label]) => (
          <label key={r}><input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} />{label}</label>
        ))}
      </div>
      <button className="btn btn-main" type="button" disabled={!reason} onClick={() => setStep(reason === "other" ? "cancelled" : "offer")}>Continue</button>
      {cancelBar}
    </div>
  );
}

function SaveOffer({ reason, onKeep }: { reason: Reason; onKeep: (what: string) => void }) {
  switch (reason) {
    case "price":
      return (
        <div className="save-offer">
          <h3>Stay for half price</h3>
          <p>$4.50 a month for the next 3 months, then back to $9. Everything stays the same.</p>
          <button className="btn btn-main" type="button" onClick={() => onKeep("You’re on $4.50 a month for the next 3 months.")}>Keep it for $4.50 a month</button>
        </div>
      );
    case "time":
      return (
        <div className="save-offer">
          <h3>Take a break. Everything waits for you.</h3>
          <p>No charge while you’re paused. Your streak and saved cartoons stay right where they are.</p>
          <div className="pause-opts">
            {[1, 2, 3].map((m) => (
              <button key={m} className="btn" type="button" onClick={() => onKeep(`Your membership is paused for ${m} month${m > 1 ? "s" : ""}. No charge until then.`)}>Pause {m} month{m > 1 ? "s" : ""}</button>
            ))}
          </div>
        </div>
      );
    case "done":
      return (
        <div className="save-offer">
          <h3>Keep a small nudge for $4</h3>
          <p>Switch to Crew Club Lite: one family challenge and one bedtime story a month, so the habits don’t slide back.</p>
          <button className="btn btn-main" type="button" onClick={() => onKeep("You’re now on Crew Club Lite, $4 a month.")}>Switch to Lite for $4 a month</button>
        </div>
      );
    case "age":
      return (
        <div className="save-offer">
          <h3>The crew grows up too</h3>
          <p>Switch your Club to your kid’s age group (4–7, 8–12 or 13–17 with Teo), and get next month free while you try it.</p>
          <button className="btn btn-main" type="button" onClick={() => onKeep("Your Club now follows your kid’s age group, and next month is free.")}>Switch my age group</button>
        </div>
      );
    case "broken":
      return (
        <div className="save-offer">
          <h3>Let us fix it, and the next month is on us</h3>
          <p>Tell us what broke. A real person answers within one working day. <span className="draft">support email</span></p>
          <button className="btn btn-main" type="button" onClick={() => onKeep("We’ve got your report, and your next month is free.")}>Fix it and give me a free month</button>
        </div>
      );
    default:
      return null;
  }
}
