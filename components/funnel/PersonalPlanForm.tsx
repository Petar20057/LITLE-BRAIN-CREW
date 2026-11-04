"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { trackAdCheckout } from "@/lib/ad-pixels";
import { ITEMS, usd } from "@/lib/funnel";
import { saveOrder, useQueryParam } from "@/lib/order";
import { AGE_MAX, AGE_MIN, MOMENT_OPTIONS, NAME_MAX, PLAN_FIELDS, PLAN_REPLY_DAYS, UNPAID_KEEP_DAYS, momentTitle, type PlanField } from "@/lib/personal-plan-form";
import { trackEvent } from "@/lib/track-event";

// The Personal plan form (/personal-plan):
//   1. the answers about the kid and the moment, then the parent's first name and email → POST /api/personal-plan, which
//      emails the answers to the team inbox and a thank-you to the parent (and saves the row when the table exists);
//   2. without online payment (`payable` false, today): a thank-you, "we'll send your plan as soon as possible";
//      with it: optional "Continue to payment" → POST /api/personal-plan/checkout → Creem, or "Not now".
// The email link (/personal-plan?r=<id>) opens step 2 directly. Like lib/payments.ts, the order is kept in sessionStorage so
// the thanks page can confirm the payment.

type Answers = Record<string, string | string[]>;
type Saved = { id: string; email?: string; name?: string; payable?: boolean };

const EMAIL = /^\S+@\S+\.\S+$/;
const AGES = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);
const PRICE = usd(ITEMS.personalPlan.price);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The parent's time zone, read in the browser after hydration (the server can't know it): the placeholder of the
// time-zone field, and what is sent when the parent leaves that field empty.
const noop = () => () => {};
function zoneNow() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

/** The visit ids of components/Track.tsx and the first utm_source, or nothing if storage is blocked. */
function visit() {
  try {
    return {
      visitor: localStorage.getItem("lbc-vid") ?? undefined,
      session: sessionStorage.getItem("lbc-sid") ?? undefined,
      utm_source: JSON.parse(sessionStorage.getItem("lbc-origin") || "null")?.utm_source || undefined,
    };
  } catch {
    return {};
  }
}

export default function PersonalPlanForm({ payable }: { payable: boolean }) {
  const resumeId = useQueryParam("r");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    trackEvent("checkout_view", "personal-plan");
  }, []);

  const current = saved ?? (resumeId && UUID.test(resumeId) && !fresh ? { id: resumeId } : null);
  if (current) return <PayStep saved={current} payable={payable} resumed={!saved} onNew={() => { setSaved(null); setFresh(true); }} />;
  return <AnswersStep onSaved={setSaved} payable={payable} />;
}

function AnswersStep({ onSaved, payable }: { onSaved: (s: Saved) => void; payable: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [moment, setMoment] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bad, setBad] = useState("");
  const detectedZone = useSyncExternalStore(noop, zoneNow, () => "");

  const set = (key: string, value: string | string[]) => setAnswers((a) => ({ ...a, [key]: value }));
  const empty = (v: string | string[] | undefined) => v == null || (Array.isArray(v) ? v.length === 0 : !v.trim());

  function fail(message: string, field = "") {
    setError(message);
    setBad(field);
    setBusy(false);
    if (field) document.getElementById(`pp-${field}`)?.focus();
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBad("");
    if (!age) return fail("Please choose your kid’s age.", "kid_age");
    if (!moment) return fail("Please pick the moment you want help with.", "moment");
    for (const f of PLAN_FIELDS) {
      const required = f.required || (f.key === "moment_other" && moment === "other");
      if (required && empty(answers[f.key])) return fail(`Please fill in “${f.label}”.`, f.key);
    }
    if (!name.trim()) return fail("Please tell us your first name.", "name");
    if (!EMAIL.test(email.trim())) return fail("Please enter a valid email.", "email");
    setBusy(true);
    const sent = Object.fromEntries(Object.entries(answers).filter(([k, v]) => (k !== "moment_other" || moment === "other") && !empty(v)));
    if (!sent.timezone && detectedZone) sent.timezone = detectedZone;
    let res: Response;
    try {
      res = await fetch("/api/personal-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), kid_age: Number(age), moment, answers: sent, ...visit() }),
      });
    } catch {
      return fail("That didn’t go through. Please check your connection and try again.");
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string | null; payable?: boolean; error?: string; field?: string };
    if (res.status === 429) return fail("Too many tries from this connection. Please wait a few minutes and try again.");
    if (!res.ok) return fail(data.error || "That didn’t go through on our side. Please try again in a minute.", data.field);
    trackEvent("email_signup", "personal-plan");
    setBusy(false);
    onSaved({ id: data.id ?? "", email: email.trim(), name: name.trim(), payable: Boolean(data.payable && data.id) });
    document.getElementById("plan-form")?.scrollIntoView({ block: "start" });
  }

  const invalid = (key: string) => (bad === key ? true : undefined);

  return (
    <form className="fx-card pp-form" id="plan-form" onSubmit={submit} noValidate>
      <h2 style={{ marginTop: 0 }}>Tell us about your kid</h2>
      <p className="fx-sub">About 10 minutes. The more concrete, the better the plan.{payable ? " Nothing to pay at this step." : ""}</p>
      <div className="pp-grid">
        <label className="fx-field" htmlFor="pp-kid_age">
          Your kid’s age
          <select id="pp-kid_age" value={age} onChange={(e) => setAge(e.target.value)} aria-invalid={invalid("kid_age")} required>
            <option value="">Choose</option>
            {AGES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <small>More than one kid? Pick the one this plan is for.</small>
        </label>
        <label className="fx-field" htmlFor="pp-moment">
          The moment that keeps going wrong
          <select id="pp-moment" value={moment} onChange={(e) => setMoment(e.target.value)} aria-invalid={invalid("moment")} required>
            <option value="">Choose</option>
            {MOMENT_OPTIONS.map((m) => <option key={m} value={m}>{momentTitle(m)}</option>)}
          </select>
        </label>
      </div>
      {PLAN_FIELDS.filter((f) => f.key !== "moment_other" || moment === "other").map((f) => (
        <Field key={f.key} f={f} value={answers[f.key]} onChange={(v) => set(f.key, v)} invalid={invalid(f.key)} required={f.required || (f.key === "moment_other" && moment === "other")} placeholder={f.key === "timezone" ? detectedZone : undefined} />
      ))}

      <h3 className="pp-step">Where should we send your plan?</h3>
      <div className="pp-grid">
        <label className="fx-field" htmlFor="pp-name">
          Your first name
          <input id="pp-name" type="text" autoComplete="given-name" maxLength={NAME_MAX} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={invalid("name")} required />
        </label>
        <label className="fx-field" htmlFor="pp-email">
          Your email
          <input id="pp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={invalid("email")} required />
          <small>We email you that your answers are saved, and your plan if you order it. No list, no spam.</small>
        </label>
      </div>
      <div className="pay">
        <button className="btn btn-main btn-lg" type="submit" disabled={busy}>{busy ? "Sending…" : payable ? "Save my answers" : "Send my answers"}</button>
      </div>
      {error && <p className="fx-err" role="alert">{error}</p>}
      <ul className="fx-trust">
        {payable ? (
          <>
            <li>Nothing is charged at this step. Next, you choose: continue to payment ({PRICE} once), or not now.</li>
            <li>Unpaid answers are deleted after {UNPAID_KEEP_DAYS} days. See our <a href="/privacy">Privacy policy</a>.</li>
          </>
        ) : (
          <>
            <li>Your answers go straight to our team. You get a thank-you email right away, and your plan as soon as possible.</li>
            <li>We use your answers only to write your plan. See our <a href="/privacy">Privacy policy</a>.</li>
          </>
        )}
      </ul>
      <p className="fine">The plan is educational guidance about habits and words, not medical advice, therapy or a diagnosis. If something about your child’s health worries you, call your pediatrician first.</p>
    </form>
  );
}

function PayStep({ saved, payable: pagePayable, resumed, onNew }: { saved: Saved; payable: boolean; resumed: boolean; onNew: () => void }) {
  // After sending, the server says whether this request can be paid online; a link from the email goes by the page.
  const payable = saved.payable ?? pagePayable;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [later, setLater] = useState(false);

  async function pay() {
    setBusy(true);
    setError("");
    trackEvent("checkout_submit", "personal-plan");
    trackAdCheckout([ITEMS.personalPlan]);
    let res: Response;
    try {
      res = await fetch("/api/personal-plan/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: saved.id, ...visit() }),
      });
    } catch {
      setBusy(false);
      return setError("That didn’t go through. Please check your connection and try again.");
    }
    const data = (await res.json().catch(() => ({}))) as { url?: string; delivery?: string; email?: string; error?: string };
    if (!res.ok || !data.url) {
      setBusy(false);
      return setError(res.status === 429 ? "Too many tries from this connection. Please wait a few minutes and try again." : data.error || "Payment couldn’t start. Please try again.");
    }
    saveOrder({ email: data.email ?? saved.email ?? "", items: [ITEMS.personalPlan], deliveries: data.delivery ? [{ token: data.delivery, items: [ITEMS.personalPlan.id] }] : [] });
    window.location.assign(data.url);
    // Leaving for Creem: the button stays busy.
  }

  return (
    <div className="fx-card pp-form pp-pay" id="plan-form">
      <p className="pp-saved" role="status">✓ {resumed ? "Your answers are saved." : "Your answers are with us."}</p>
      {later ? (
        <>
          <h2 style={{ marginTop: 0 }}>No problem.</h2>
          <p className="fx-sub">Your answers stay saved for {UNPAID_KEEP_DAYS} days. {saved.email ? `We’ve emailed ${saved.email} a link` : "The email we sent you has a link"} that brings you straight back here when you’re ready.</p>
          <button className="btn" type="button" onClick={() => setLater(false)}>Actually, I’m ready</button>
        </>
      ) : payable ? (
        <>
          <h2 style={{ marginTop: 0 }}>Want your plan written?</h2>
          <p className="fx-sub">{PRICE}, once. A person writes it from your answers: the crew member behind the moment, one small move for each evening and the exact words for your kid’s age. In your inbox within {PLAN_REPLY_DAYS} working days of payment.</p>
          <div className="pay">
            <button className="btn btn-main btn-lg" type="button" onClick={pay} disabled={busy}>{busy ? "One moment…" : `Continue to payment · ${PRICE}`}</button>
          </div>
          {error && <p className="fx-err" role="alert">{error}</p>}
          <button className="no-thanks" type="button" onClick={() => { setLater(true); trackEvent("offer_no", "personal-plan"); }} disabled={busy}>Not now, keep my answers</button>
          <ul className="fx-trust">
            <li>Secure checkout by Creem, our payment partner: card, Apple Pay or Google Pay. We never see your card.</li>
            <li>All sales are final: work on your plan starts the moment you pay.</li>
          </ul>
        </>
      ) : (
        <>
          <h2 style={{ marginTop: 0 }}>Thank you{saved.name ? `, ${saved.name}` : ""}!</h2>
          <p className="fx-sub">Thank you for ordering your Personal plan. A person on our team is already reading your answers. We’ll send your plan to {saved.email ?? "your inbox"} as soon as possible, within {PLAN_REPLY_DAYS} working days at the latest.</p>
          <p className="fine">A thank-you email is on its way from hello@littlebraincrew.com. Something to add? Reply to it, a real person answers.</p>
        </>
      )}
      <p className="fine" style={{ marginTop: 16 }}>A plan for another kid, or want to start over? <button className="link-button" type="button" onClick={onNew}>Fill in a new form</button></p>
    </div>
  );
}

function Field({ f, value, onChange, invalid, required, placeholder }: { f: PlanField; value: string | string[] | undefined; onChange: (v: string | string[]) => void; invalid: true | undefined; required?: boolean; placeholder?: string }) {
  const id = `pp-${f.key}`;
  const hint = f.hint ? <small>{f.hint}</small> : null;
  if (f.kind === "multi") {
    const picked = Array.isArray(value) ? value : [];
    return (
      <fieldset className="fx-field" aria-invalid={invalid}>
        <legend>{f.label}</legend>
        {f.options!.map((o) => (
          <label key={o.value} className="pp-check">
            <input type="checkbox" checked={picked.includes(o.value)} onChange={(e) => onChange(e.target.checked ? [...picked, o.value] : picked.filter((v) => v !== o.value))} />
            {o.label}
          </label>
        ))}
        {hint}
      </fieldset>
    );
  }
  const text = typeof value === "string" ? value : "";
  return (
    <label className="fx-field" htmlFor={id}>
      {f.label}{required ? "" : <span className="pp-opt"> (optional)</span>}
      {f.kind === "select" ? (
        <select id={id} value={text} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid}>
          <option value="">Choose</option>
          {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : f.kind === "textarea" ? (
        <textarea id={id} rows={4} maxLength={f.max} value={text} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} required={required} />
      ) : (
        <input id={id} type="text" maxLength={f.max} value={text} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} required={required} placeholder={placeholder} />
      )}
      {hint}
    </label>
  );
}
