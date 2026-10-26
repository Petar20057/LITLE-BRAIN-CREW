import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DUO_OPTIONS, MOMENTS, STEPS, VARIANTS, type StepId } from "@/content/quiz";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { signIn } from "./actions";
import { STATS_COOKIE, STATS_TOKEN, tokenMatches } from "./auth";

// Where parents drop off in the /code quiz, which variant converts better, and what they answer.
// Reads the quiz_* functions from supabase/migrations/20261026150000_quiz.sql. Password: STATS_TOKEN.

export const metadata: Metadata = { title: "Quiz stats · Little Brain Crew" };
// Reads the sign-in cookie and live numbers on every request.
export const instant = false;

const RANGES = [7, 30, 90] as const;

const STEP_LABEL: Record<StepId, string> = {
  intro: "Intro", age: "Age", stage: "Age stage card", moments: "Pick moments", "lesson-1": "Lesson 1", "lesson-2": "Lesson 2 (picked 2+)",
  "lesson-3": "Lesson 3 (picked 3)", "myth-1": "Myth 1", "myth-2": "Myth 2", plasti: "Rule 1 · Plasti", duo: "Duo question",
  "duo-card": "Rule 2 · Duo", gate: "Email gate", result: "Result",
};
const ANSWER_LABEL: Record<string, string> = {
  ...Object.fromEntries(MOMENTS.map((m) => [m.id, m.label])),
  ...Object.fromEntries(DUO_OPTIONS.map((d) => [d.id, d.label])),
};
const QUESTION_LABEL: Record<string, string> = { age: "Age", moment: "Moments picked", duo: "Duo question", "myth-1": "Myth 1 (sugar)", "myth-2": "Myth 2 (dopamine detox)", tips: "Ticked weekly tips" };

const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}%` : "–");
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const secs = (ms: number | null | undefined) => (ms == null ? "–" : `${Math.round(ms / 1000)} s`);

export default async function Page({ searchParams }: PageProps<"/stats/quiz">) {
  // Cookies first, so the page is always rendered per request, never prerendered with the build's env.
  const signedIn = tokenMatches((await cookies()).get(STATS_COOKIE)?.value);
  if (!STATS_TOKEN) notFound();
  if (!signedIn) {
    return (
      <form className="fx-card fx-narrow" style={{ margin: "24px auto 0" }} action={signIn}>
        <h1>Quiz stats</h1>
        <label className="fx-field">
          Password
          <input type="password" name="token" autoComplete="current-password" required />
        </label>
        <button className="btn btn-main" type="submit">Open</button>
      </form>
    );
  }

  const q = await searchParams;
  const days = RANGES.find((d) => String(d) === q.days) ?? 30;
  const source = typeof q.source === "string" && q.source ? q.source.slice(0, 80) : null;
  const since = daysAgo(days);

  if (!supabaseConfigured) return <p className="fx-card">Supabase isn’t configured.</p>;
  const db = createAdminClient();
  const [totals, funnel, answers] = await Promise.all([
    db.rpc("quiz_totals", { since }),
    db.rpc("quiz_funnel", source ? { since, src: source } : { since }),
    db.rpc("quiz_answers", { since }),
  ]);
  const failed = totals.error ?? funnel.error ?? answers.error;
  if (failed) {
    console.error("[quiz stats]", failed);
    return <p className="fx-card">Couldn’t read the numbers. Is the quiz migration (supabase/migrations/20261026150000_quiz.sql) applied?</p>;
  }

  const variants = Object.keys(VARIANTS) as (keyof typeof VARIANTS)[];
  const rows = (totals.data ?? []).filter((r) => !source || r.source === source);
  const byVariant = variants.map((v) => {
    const mine = rows.filter((r) => r.variant === v);
    const sum = (k: "started" | "emailed" | "results" | "checkouts" | "purchases") => mine.reduce((n, r) => n + Number(r[k]), 0);
    return { v, started: sum("started"), emailed: sum("emailed"), results: sum("results"), checkouts: sum("checkouts"), purchases: sum("purchases") };
  });
  const sources = [...new Set((totals.data ?? []).map((r) => r.source))].sort();
  const step = (v: string, s: StepId) => funnel.data?.find((r) => r.variant === v && r.step === s);
  const link = (d: number, src: string | null) => `/stats/quiz?days=${d}${src ? `&source=${encodeURIComponent(src)}` : ""}`;
  const questions = [...new Set((answers.data ?? []).map((a) => a.question))];

  return (
    <div className="q-stats">
      <h1>Quiz stats · /code</h1>
      <p className="fx-sub">
        Last{" "}
        {RANGES.map((d) => (
          <a key={d} className={d === days ? "on" : ""} href={link(d, source)}>{d} days</a>
        ))}
        {" · "}source:{" "}
        <a className={!source ? "on" : ""} href={link(days, null)}>all</a>
        {sources.map((s) => (
          <a key={s} className={s === source ? "on" : ""} href={link(days, s)}>{s}</a>
        ))}
      </p>

      <div className="table-wrap">
        <table className="learn-table">
          <caption>Conversion by variant</caption>
          <thead>
            <tr><th scope="col">Variant</th><th scope="col">Started</th><th scope="col">Left email</th><th scope="col">Saw result</th><th scope="col">Clicked checkout</th><th scope="col">Bought</th></tr>
          </thead>
          <tbody>
            {byVariant.map((r) => (
              <tr key={r.v}>
                <th scope="row">{r.v}: {VARIANTS[r.v].headline}</th>
                <td>{r.started}</td>
                <td>{r.emailed} · {pct(r.emailed, r.started)}</td>
                <td>{r.results} · {pct(r.results, r.started)}</td>
                <td>{r.checkouts} · {pct(r.checkouts, r.results)} of results</td>
                <td>{r.purchases} · {pct(r.purchases, r.checkouts)} of clicks</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-wrap">
        <table className="learn-table">
          <caption>Where parents drop off (visits that saw each screen, % of started, median time to answer)</caption>
          <thead>
            <tr><th scope="col">Screen</th>{variants.map((v) => <th key={v} scope="col">Variant {v}</th>)}</tr>
          </thead>
          <tbody>
            {STEPS.map((s) => (
              <tr key={s}>
                <th scope="row">{STEP_LABEL[s]}</th>
                {variants.map((v) => {
                  const r = step(v, s);
                  const first = Number(step(v, "intro")?.sessions ?? 0);
                  return <td key={v}>{r ? `${r.sessions} · ${pct(Number(r.sessions), first)} · ${secs(r.median_ms)}` : "–"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {questions.map((qn) => {
        const list = (answers.data ?? []).filter((a) => a.question === qn).sort((a, b) => Number(b.sessions) - Number(a.sessions));
        const all = list.reduce((n, a) => n + Number(a.sessions), 0);
        return (
          <div key={qn} className="table-wrap">
            <table className="learn-table">
              <caption>{QUESTION_LABEL[qn] ?? qn}{source ? " (all sources)" : ""}</caption>
              <tbody>
                {list.map((a) => (
                  <tr key={a.answer}><th scope="row">{ANSWER_LABEL[a.answer] ?? a.answer}</th><td>{a.sessions}</td><td>{pct(Number(a.sessions), all)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      <p className="fine">Lesson 2 and 3 only show for parents who picked 2 or 3 moments, so a lower number there isn’t a drop-off. “Bought” counts once Creem is live.</p>
    </div>
  );
}
