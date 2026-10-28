"use client";

import { useState, type FormEvent } from "react";

// The free-tips email form, the same one as /free (form "free-screen-list"). It posts what design/assets/site.js post()
// sends, so the email is stored and the confirmation email goes out. A failed try keeps what was typed.
export default function FreeListForm() {
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
        body: JSON.stringify({ form: "free-screen-list", email: email.trim(), page: window.location.pathname, details: {}, visitor, utm_source: utm }),
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

  return (
    <form className="lead-form" onSubmit={submit} style={{ justifyContent: "center" }}>
      <input
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Your email"
        autoComplete="email"
      />
      <button className="btn btn-main" type="submit" disabled={busy || sent}>Send me the list</button>
      {error ? <p className="form-err" role="alert">{error}</p> : null}
      {sent ? <span className="ok" role="status" style={{ display: "block" }}>Almost done: tap the link in the email we just sent ✓</span> : null}
    </form>
  );
}
