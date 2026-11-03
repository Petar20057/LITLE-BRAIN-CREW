"use client";

import { useState, type FormEvent } from "react";

// "Tell me when it's ready" under a character or pack that isn't finished. Posts to /api/signup like the design forms
// (form "character-waitlist", no confirmation email), with the character and pack in `details`.
export default function TellMeForm({
  details,
  button = "Tell me when it’s ready",
  sentText = "Done. We’ll email you when it’s ready ✓",
}: {
  details: Record<string, string>;
  button?: string;
  sentText?: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    let visitor: string | null = null;
    let utm: string | null = null;
    try {
      visitor = localStorage.getItem("lbc-vid");
      utm = JSON.parse(sessionStorage.getItem("lbc-origin") || "null")?.utm_source || null;
    } catch {
      // Storage blocked: the email is still stored.
    }
    let res: Response;
    try {
      res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ form: "character-waitlist", email: email.trim(), page: window.location.pathname, details, visitor, utm_source: utm }),
      });
    } catch {
      return fail("That didn’t go through. Please check your connection and try again.");
    }
    if (res.status === 400) return fail("Please check your email address.");
    if (res.status === 429) return fail("Too many tries from this connection. Please wait a few minutes and try again.");
    if (!res.ok) return fail("That didn’t go through on our side. Please try again in a minute.");
    setBusy(false);
    setSent(true);
  }

  function fail(message: string) {
    setError(message);
    setBusy(false);
  }

  if (sent) return <p className="tell-sent" role="status">{sentText}</p>;
  return (
    <form className="tell-form" onSubmit={submit}>
      <label className="sr-only" htmlFor={`tell-${details.character ?? "x"}`}>Your email</label>
      <input
        id={`tell-${details.character ?? "x"}`}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : button}</button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  );
}
