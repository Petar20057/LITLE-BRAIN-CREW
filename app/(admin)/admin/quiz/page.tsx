import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Admin";
import { DUO_OPTIONS, MOMENTS, STEPS, VARIANTS, type StepId } from "@/content/quiz";
import { pct, rangeFrom, requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// Where parents drop off in the /code quiz, which variant converts better, and what they answer.
// Reads the quiz_* functions from supabase/migrations/20261026150000_quiz.sql. Was /stats/quiz (now redirects here).

export const metadata: Metadata = { title: "Quiz /code · Admin" };
// Reads the sign-in cookie and live numbers on every request.
export const instant = false;

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

const secs = (ms: number | null | undefined) => (ms == null ? "–" : `${Math.round(ms / 1000)} s`);

export default async function Page({ searchParams }: PageProps<"/admin/quiz">) {
  const { email } = await requireAdmin();
  const q = await searchParams;
  const { days, since } = rangeFrom(q.days);
  const source = typeof q.source === "string" && q.source ? q.source.slice(0, 80) : null;

  const db = createAdminClient();
  const [totals, funnel, answers] = await Promise.all([
    db.rpc("quiz_totals", { since }),
    db.rpc("quiz_funnel", source ? { since, src: source } : { since }),
    db.rpc("quiz_answers", { since }),
  ]);
  const failed = totals.error ?? funnel.error ?? answers.error;
  if (failed) {
    console.error("[quiz stats]", failed);
    return <p className="fx-card">Couldn’t read the numbers. Is supabase/migrations/20261026150000_quiz.sql applied?</p>;
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
  const link = (d: number, src: string | null) => `/admin/quiz?days=${d}${src ? `&source=${encodeURIComponent(src)}` : ""}`;
  const questions = [...new Set((answers.data ?? []).map((a) => a.question))];

  return (
    <div className="q-stats adm-page">
      <AdminHeader tab="/admin/quiz" days={days} email={email} query={source ? `&source=${encodeURIComponent(source)}` : ""} />
      <h1>Quiz /code</h1>
      <p className="fx-sub">
        Source:{" "}
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
