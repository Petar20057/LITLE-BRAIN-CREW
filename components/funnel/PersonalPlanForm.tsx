"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { trackAdCheckout } from "@/lib/ad-pixels";
import { ITEMS, usd } from "@/lib/funnel";
import { saveOrder } from "@/lib/order";
import { AGE_MAX, AGE_MIN, MOMENT_OPTIONS, NAME_MAX, PLAN_FIELDS, PLAN_REPLY_DAYS, momentTitle, type PlanField } from "@/lib/personal-plan-form";
import { trackEvent } from "@/lib/track-event";

// The Personal plan intake form (/personal-plan). The answers go to POST /api/personal-plan, which stores them and answers
// the Creem checkout URL; the browser then leaves for Creem. Like lib/payments.ts, the order is kept in sessionStorage so the
// thanks page can confirm the payment. Nothing is sent until every required answer is there.

type Answers = Record<string, string | string[]>;
type Reply = { url?: string; delivery?: string; error?: string; field?: string };

const EMAIL = /^\S+@\S+\.\S+$/;
const AGES = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);

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

export default function PersonalPlanForm({ open }: { open: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [moment, setMoment] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bad, setBad] = useState("");
  const detectedZone = useSyncExternalStore(noop, zoneNow, () => "");

  useEffect(() => {
    if (open) trackEvent("checkout_view", "personal-plan");
  }, [open]);

  if (!open) {
    return (
      <div className="fx-card" id="plan-form">
        <h2 style={{ marginTop: 0 }}>The Personal plan opens in a few days.</h2>
        <p className="fx-sub">Want one now? Email <a href="mailto:hello@littlebraincrew.com?subject=Personal%20plan">hello@littlebraincrew.com</a> with your kid’s age and the moment that keeps going wrong, and we’ll take it from there.</p>
      </div>
    );
  }

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
    if (!name.trim()) return fail("Please tell us your first name.", "name");
    if (!EMAIL.test(email.trim())) return fail("Please enter a valid email.", "email");
    if (!age) return fail("Please choose your kid’s age.", "kid_age");
    if (!moment) return fail("Please pick the moment you want help with.", "moment");
    for (const f of PLAN_FIELDS) {
      const required = f.required || (f.key === "moment_other" && moment === "other");
      if (required && empty(answers[f.key])) return fail(`Please fill in “${f.label}”.`, f.key);
    }
    setBusy(true);
    trackEvent("checkout_submit", "personal-plan");
    trackAdCheckout([ITEMS.personalPlan]);
    let visitor: string | undefined;
    let session: string | undefined;
    let utm: string | undefined;
    try {
      visitor = localStorage.getItem("lbc-vid") ?? undefined;
      session = sessionStorage.getItem("lbc-sid") ?? undefined;
      utm = JSON.parse(sessionStorage.getItem("lbc-origin") || "null")?.utm_source || undefined;
    } catch {
      // Storage blocked: the form still goes through.
    }
    const sent = Object.fromEntries(Object.entries(answers).filter(([k, v]) => (k !== "moment_other" || moment === "other") && !empty(v)));
    if (!sent.timezone && detectedZone) sent.timezone = detectedZone;
    let res: Response;
    try {
      res = await fetch("/api/personal-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), kid_age: Number(age), moment, answers: sent, visitor, session, utm_source: utm }),
      });
    } catch {
      return fail("That didn’t go through. Please check your connection and try again.");
    }
    const data = (await res.json().catch(() => ({}))) as Reply;
    if (res.status === 429) return fail("Too many tries from this connection. Please wait a few minutes and try again.");
    if (!res.ok || !data.url) return fail(data.error || "That didn’t go through on our side. Please try again in a minute.", data.field);
    saveOrder({ email: email.trim(), items: [ITEMS.personalPlan], deliveries: data.delivery ? [{ token: data.delivery, items: [ITEMS.personalPlan.id] }] : [] });
    window.location.assign(data.url);
    // Leaving for Creem: the button stays busy.
  }

  const invalid = (key: string) => (bad === key ? true : undefined);

  return (
    <form className="fx-card pp-form" id="plan-form" onSubmit={submit} noValidate>
      <h2 style={{ marginTop: 0 }}>Tell us about your kid</h2>
      <p className="fx-sub">About 10 minutes. The more concrete, the better the plan. You pay on the next page.</p>
      <div className="pp-grid">
        <label className="fx-field" htmlFor="pp-name">
          Your first name
          <input id="pp-name" type="text" autoComplete="given-name" maxLength={NAME_MAX} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={invalid("name")} required />
        </label>
        <label className="fx-field" htmlFor="pp-email">
          Your email
          <input id="pp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={invalid("email")} required />
          <small>Your plan arrives here. No list, no spam.</small>
        </label>
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
      <div className="pay">
        <button className="btn btn-main btn-lg" type="submit" disabled={busy}>{busy ? "One moment…" : `Continue to payment · ${usd(ITEMS.personalPlan.price)}`}</button>
      </div>
      {error && <p className="fx-err" role="alert">{error}</p>}
      <ul className="fx-trust">
        <li>Secure checkout by Creem, our payment partner: card, Apple Pay or Google Pay. We never see your card.</li>
        <li>Your answers are stored with your order so we can write your plan. See our <a href="/privacy">Privacy policy</a>.</li>
        <li>Your plan by email within {PLAN_REPLY_DAYS} working days.</li>
      </ul>
      <p className="fine">All sales are final: we start working the moment you pay. The plan is educational guidance about habits and words, not medical advice, therapy or a diagnosis. If something about your child’s health worries you, call your pediatrician first.</p>
    </form>
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
