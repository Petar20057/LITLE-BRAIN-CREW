"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { BEDTIMES, DISCLAIMER, DUO_LEAD, DUO_OPTIONS, DUO_QUESTION, MAX_MOMENTS, VARIANTS, WAKE_TIMES, type StepId } from "@/content/quiz";
import type { QuizChar, QuizData, QuizSource } from "@/lib/quiz";
import { crewOf, hoursLabel, quizResult, sleepCheck, type QuizAnswers } from "@/lib/quiz-plan";
import CrewArt from "@/components/funnel/CrewArt";
import { START, getSession, markStep, onStep, save, subscribe, track, type Progress } from "./session";

// The /code quiz: a 5-minute walk through everything the site teaches (age stages, the 12 moments with a
// "who's behind it?" guess, sleep, the villains, myths, the two rules), an email gate, then the parent's crew
// profile and a 3-night plan. Every screen view, answer, back click and exit goes to /api/quiz/event so
// /admin/quiz can show where parents drop off.

export default function Quiz({ data }: { data: QuizData }) {
  const session = useSyncExternalStore(subscribe, getSession, () => null);
  const p = session?.progress ?? START;

  const lessons = Math.max(1, p.moments.length);
  const order: StepId[] = [
    "intro", "age", "stage", "moments",
    ...(["lesson-1", "lesson-2", "lesson-3"] as const).slice(0, lessons),
    "sleep", "villains", "myth-1", "myth-2", "myth-3", "plasti", "duo", "duo-card", "gate", "result",
  ];
  const at = Math.max(0, order.indexOf(p.step));

  // First screen of this page load, and the exit beacon.
  const step = p.step;
  const ready = Boolean(session);
  useEffect(() => {
    if (!ready) return;
    markStep();
    track("view", getSession().progress.step);
    const leave = () => track("leave", getSession().progress.step, undefined, onStep());
    addEventListener("pagehide", leave);
    return () => removeEventListener("pagehide", leave);
  }, [ready]);

  const go = (next: StepId, patch: Partial<Progress> = {}) => {
    save({ ...p, ...patch, step: next });
    markStep();
    track("view", next);
    scrollTo({ top: 0 });
  };
  const next = (patch: Partial<Progress> = {}) => {
    let to = order[at + 1] ?? "result";
    if (to === "gate" && p.emailed) to = "result";
    go(to, patch);
  };
  const answer = (value: unknown, patch: Partial<Progress> = {}, advance = true) => {
    track("answer", step, value, onStep());
    if (advance) next(patch);
    else save({ ...p, ...patch });
  };
  const back = () => {
    track("back", step, undefined, onStep());
    go(order[at - 1] ?? "intro");
  };

  const age = data.ages.find((a) => a.id === p.age);
  const moments = data.moments.filter((m) => !m.teen || !age || age.teen);
  const result = quizResult(data, answersOf(p));
  const v = session ? VARIANTS[session.variant] : null;

  let screen: ReactNode;
  switch (step) {
    case "intro":
      screen = (
        <div className="q-intro">
          <div className="q-arts">{(["dopa", "migo", "mela", "toci"] as const).map((k) => <CrewArt key={k} k={k} mood="happy" />)}</div>
          <p className="kick">free · for parents of kids 4–17</p>
          <h1 className={v ? "" : "q-wait"}>{v?.headline ?? VARIANTS.a.headline}</h1>
          <p className="fx-sub">{v?.sub ?? VARIANTS.a.sub}</p>
          <button className="btn btn-main" type="button" disabled={!session} onClick={() => answer("start")}>Start →</button>
          <p className="fine">About 5 minutes · 12 moments · 6 villains · 2 rules that run every kid’s brain</p>
        </div>
      );
      break;

    case "age":
      screen = (
        <Ask kick="Your kid" title="How old is your kid?" sub="More than one? Pick the one on your mind tonight.">
          <div className="opts q-ages">
            {data.ages.map((a) => (
              <button key={a.id} className="opt" type="button" aria-pressed={p.age === a.id} onClick={() => answer(a.id, { age: a.id, moments: p.moments.filter((id) => a.teen || id !== "teen") })}>
                {a.label}
              </button>
            ))}
          </div>
        </Ask>
      );
      break;

    case "stage":
      screen = age && (
        <Lesson kick="Every age has its own character" char={age.stage} title={`Meet ${age.stage.name}`} line={`${capFirst(age.stage.job)}.`}>
          <p>{age.lesson}</p>
          <Next onClick={() => next()}>Next: what happens at your house</Next>
        </Lesson>
      );
      break;

    case "moments": {
      const toggle = (id: string) => {
        const has = p.moments.includes(id);
        if (!has && p.moments.length >= MAX_MOMENTS) return;
        save({ ...p, moments: has ? p.moments.filter((m) => m !== id) : [...p.moments, id] });
      };
      screen = (
        <Ask kick="12 hard moments" title="Which moments happen at your house?" sub={`Pick up to ${MAX_MOMENTS}, the ones you see most. We’ll show you who’s behind each one.`}>
          <div className="opts">
            {moments.map((m) => (
              <button key={m.id} className="opt q-moment" type="button" style={{ ["--c" as string]: m.char.color }} aria-pressed={p.moments.includes(m.id)} disabled={!p.moments.includes(m.id) && p.moments.length >= MAX_MOMENTS} onClick={() => toggle(m.id)}>
                <i aria-hidden="true" />{m.label}
              </button>
            ))}
          </div>
          <Next disabled={!p.moments.length} onClick={() => answer(p.moments)}>
            {p.moments.length ? `Show me who’s behind ${p.moments.length === 1 ? "it" : "them"}` : "Pick at least one"}
          </Next>
        </Ask>
      );
      break;
    }

    case "lesson-1":
    case "lesson-2":
    case "lesson-3": {
      const i = Number(step.slice(-1)) - 1;
      const m = data.moments.find((x) => x.id === p.moments[i]);
      const guessed = p.guesses[i];
      const kick = `Moment ${i + 1} of ${p.moments.length}`;
      const pick = (key: string) => {
        const guesses = [...p.guesses];
        guesses[i] = key;
        answer({ guess: key, right: key === m?.char.key }, { guesses }, false);
      };
      screen = m && !guessed ? (
        <Ask kick={kick} title={m.label} sub="Who’s behind it? Take a guess.">
          <div className="q-guess">
            {m.guess.map((c) => (
              <button key={c.key} className="opt" type="button" style={{ ["--c" as string]: c.color }} onClick={() => pick(c.key)}>
                <CrewArt k={c.key} />
                <b>{c.name}</b>
                <span>{c.real}</span>
              </button>
            ))}
          </div>
        </Ask>
      ) : m && (
        <Lesson kick={kick} char={m.char} title={m.label} line={m.line} lead={guessed === m.char.key ? `You got it: it’s ${m.char.name}.` : `Good guess. It’s ${m.char.name}.`}>
          <h3>What’s going on</h3>
          <p>{m.lesson}</p>
          <div className="q-tonight"><b>Try tonight</b>{m.tips[0]}</div>
          <Source s={m.source} />
          <Next onClick={() => next()}>Next</Next>
        </Lesson>
      );
      break;
    }

    case "sleep": {
      const { bed, wake, checked } = p.sleep;
      const set = (patch: Partial<Progress["sleep"]>) => save({ ...p, sleep: { ...p.sleep, ...patch } });
      const check = bed != null && wake != null ? sleepCheck(data, p.age, { bed, wake }) : undefined;
      if (!checked || !check) {
        screen = (
          <Ask kick="Sleep check" title="On school nights, when does your kid usually fall asleep and wake up?" sub="Your best guess is fine.">
            <div className="q-sleep">
              <label className="fx-field">
                Falls asleep around
                <select value={bed ?? ""} onChange={(e) => set({ bed: Number(e.target.value) })}>
                  <option value="" disabled>Pick a time</option>
                  {BEDTIMES.map((t) => <option key={t} value={t}>{clock(t)}</option>)}
                </select>
              </label>
              <label className="fx-field">
                Wakes up around
                <select value={wake ?? ""} onChange={(e) => set({ wake: Number(e.target.value) })}>
                  <option value="" disabled>Pick a time</option>
                  {WAKE_TIMES.map((t) => <option key={t} value={t}>{clock(t)}</option>)}
                </select>
              </label>
            </div>
            <Next disabled={!check} onClick={() => check && answer({ bed, wake, hours: check.hours, verdict: check.verdict }, { sleep: { bed, wake, checked: true } }, false)}>
              Check my kid’s sleep
            </Next>
          </Ask>
        );
      } else {
        const v = data.sleep[check.verdict];
        screen = (
          <Lesson kick="Sleep check" char={data.sleep.char} title={`About ${hoursLabel(check.hours)} hours a night`} line={`Sleep doctors (AASM) recommend ${check.says}.`}>
            <p className="q-big"><b>{v.title}</b></p>
            <p>{v.body}</p>
            <div className="q-tonight"><b>Try tonight</b>{v.tip}</div>
            <Source s={data.sleep.source} />
            <Next onClick={() => next()}>Next: the villains</Next>
          </Lesson>
        );
      }
      break;
    }

    case "villains": {
      const { picks, checked } = p.villains;
      const home = data.villains.filter((v) => picks.includes(v.char.key));
      const toggle = (key: string) => save({ ...p, villains: { picks: picks.includes(key) ? picks.filter((k) => k !== key) : [...picks, key], checked: false } });
      if (!checked) {
        screen = (
          <Ask kick="The villains" title="Which of these happen at your house?" sub="Tick all that apply. No judgment: every house has a few.">
            <div className="opts">
              {data.villains.map((v) => (
                <button key={v.char.key} className="opt q-moment" type="button" style={{ ["--c" as string]: v.char.color }} aria-pressed={picks.includes(v.char.key)} onClick={() => toggle(v.char.key)}>
                  <i aria-hidden="true" />{v.label}
                </button>
              ))}
            </div>
            <Next onClick={() => answer(picks, { villains: { picks, checked: true } }, false)}>{picks.length ? "Show me the villains" : "None of these"}</Next>
          </Ask>
        );
      } else {
        const first = home[0];
        screen = (
          <div className="qstep">
            <small>The villains</small>
            <h1 className="q-title">{home.length ? `${home.length} of ${data.villains.length} villains live at your house` : "No villains found at your house"}</h1>
            <p className="fx-sub">They’re not people, and they’re not your kid. They’re habits and things that sneak into every house. Each one has a simple way to beat it.</p>
            {home.length > 0 && (
              <ul className="q-crew">
                {home.map((v) => (
                  <li key={v.char.key} style={{ ["--ct" as string]: tint(v.char.color) }}>
                    <CrewArt k={v.char.key} />
                    <div><b>{v.char.name} · {v.char.real}</b><span>{capFirst(v.char.job)}.</span></div>
                  </li>
                ))}
              </ul>
            )}
            {first ? (
              <>
                <h3>Beat {first.char.name} first</h3>
                <p><b>{first.question}</b> {first.lesson}</p>
                <div className="q-tonight"><b>Try tonight</b>{first.tip}</div>
                <Source s={first.source} />
              </>
            ) : (
              <p>Keep it that way: phones charge outside the bedroom, screens go off an hour before bed, and bedtime stays steady.</p>
            )}
            <Next onClick={() => next()}>Next: myth or fact?</Next>
          </div>
        );
      }
      break;
    }

    case "myth-1":
    case "myth-2":
    case "myth-3": {
      const i = Number(step.slice(-1)) - 1;
      const m = data.myths[i];
      const said = p.myths[i];
      const pick = (myth: boolean) => {
        const myths = [...p.myths];
        myths[i] = myth;
        answer({ said: myth ? "myth" : "fact", right: myth === m.isMyth }, { myths }, false);
      };
      screen = (
        <Ask kick={`Myth or fact? ${i + 1} of ${data.myths.length}`} title={`“${m.ask}”`}>
          {said === null ? (
            <div className="q-two">
              <button className="btn" type="button" onClick={() => pick(true)}>Myth</button>
              <button className="btn" type="button" onClick={() => pick(false)}>Fact</button>
            </div>
          ) : (
            <div className="q-reveal">
              <p className="q-verdict">{said === m.isMyth ? "You got it." : "Lots of parents believe this one."} The science says: <b>{m.verdict}.</b></p>
              <p>{m.truth}</p>
              <Source s={m.source} />
              <Next onClick={() => next()}>Next</Next>
            </div>
          )}
        </Ask>
      );
      break;
    }

    case "plasti":
    case "duo-card": {
      const r = data.rules[step === "plasti" ? "plasti" : "duo"];
      screen = (
        <Lesson kick={r.kick} char={r.char} title={r.title} lead={step === "duo-card" ? DUO_LEAD : undefined}>
          <p>{r.body}</p>
          <Next onClick={() => next()}>{step === "plasti" ? "Next: the second rule" : "See my kid’s crew"}</Next>
        </Lesson>
      );
      break;
    }

    case "duo":
      screen = (
        <Ask kick="The second rule" title={DUO_QUESTION} sub="No wrong answer. Pick what really happens.">
          <div className="opts">
            {DUO_OPTIONS.map((o) => (
              <button key={o.id} className="opt" type="button" aria-pressed={p.duo === o.id} onClick={() => answer(o.id, { duo: o.id })}>{o.label}</button>
            ))}
          </div>
        </Ask>
      );
      break;

    case "gate":
      screen = result && session && <Gate sid={session.sid} variant={session.variant} p={p} crew={crewOf(result)} ageLabel={result.age.label} onDone={(consent) => answer({ consent }, { emailed: true })} />;
      break;

    case "result":
      screen = result && session && <Result data={data} p={p} />;
      break;
  }

  // A step whose answers are missing (an old session, a hand-edited URL): start that part again.
  if (session && !screen) screen = <Ask kick="Oops" title="Let’s pick that again."><Next onClick={() => go("age")}>Back to the start</Next></Ask>;

  return (
    <div className="qbox quiz">
      {step !== "intro" && step !== "result" && <div className="prog" aria-hidden="true"><i style={{ width: `${Math.round((at / (order.length - 1)) * 100)}%` }} /></div>}
      {screen}
      {step !== "intro" && step !== "result" && step !== "gate" && (
        <div className="qnav">
          <button type="button" onClick={back}>← Back</button>
          <span>{at} of {order.length - 2}</span>
        </div>
      )}
    </div>
  );
}

function Ask({ kick, title, sub, children }: { kick: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="qstep">
      <small>{kick}</small>
      <h1 className="q-title">{title}</h1>
      {sub && <p className="fx-sub">{sub}</p>}
      {children}
    </div>
  );
}

function Lesson({ kick, char, title, line, lead, children }: { kick: string; char: QuizChar; title: string; line?: string; lead?: string; children: ReactNode }) {
  return (
    <div className="qstep q-lesson">
      <small>{kick}</small>
      {lead && <p className="q-lead">{lead}</p>}
      <div className="res-top" style={{ ["--ct" as string]: tint(char.color) }}>
        <CrewArt k={char.key} mood="main" />
        <div>
          <small>{char.name} · {char.real}</small>
          <h1 className="q-title">{title}</h1>
          {line && <p>{line}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Next({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return <div className="q-next"><button className="btn btn-main" type="button" disabled={disabled} onClick={onClick}>{children}</button></div>;
}

function Source({ s }: { s: QuizSource }) {
  return <p className="fine q-src">Source: {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> : s.title}</p>;
}

/** A pale version of a crew color for card backgrounds. */
const tint = (hex: string) => `color-mix(in srgb, ${hex} 30%, #fff)`;

function Gate({ sid, variant, p, crew, ageLabel, onDone }: { sid: string; variant: string; p: Progress; crew: QuizChar[]; ageLabel: string; onDone: (consent: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please check your email address.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/quiz/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid, variant, email: email.trim(), consent, ...answersOf(p) }),
      });
      if (res.status === 400) {
        setBusy(false);
        return setError(((await res.json().catch(() => ({}))) as { error?: string }).error || "Please check your email address.");
      }
    } catch {}
    // Saving can fail (offline, database down): the parent still gets the result on screen.
    onDone(consent);
  };

  return (
    <div className="qstep q-gate">
      <small>Your results are ready</small>
      <h1 className="q-title">Your kid’s crew profile and 3-night plan</h1>
      <div className="q-arts">{crew.map((c) => <CrewArt key={c.key} k={c.key} mood="happy" />)}</div>
      <ul className="fx-trust">
        <li>Who’s behind the moments you picked</li>
        <li>Your kid’s sleep check</li>
        <li>The villains at your house, and which to beat first</li>
        <li>A 3-night plan for ages {ageLabel}</li>
        <li>What to say to your kid, word for word</li>
      </ul>
      <form className="q-form" onSubmit={submit} noValidate>
        <label className="fx-field">
          Where should we send your copy?
          <input type="email" name="email" autoComplete="email" inputMode="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="q-check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>Also send me one short crew tip a week. Unsubscribe anytime.</span>
        </label>
        {error && <p className="q-error" role="alert">{error}</p>}
        <button className="btn btn-main" type="submit" disabled={busy}>{busy ? "One second…" : "Show my results"}</button>
        <p className="fine">We never ask for your kid’s name. <a href="/privacy" target="_blank" rel="noopener">Privacy</a></p>
      </form>
    </div>
  );
}

function Result({ data, p }: { data: QuizData; p: Progress }) {
  const click = (to: string) => () => track("click", "result", { to });
  const r = quizResult(data, answersOf(p));
  if (!r) return null;

  return (
    <div className="qstep q-result">
      <small>Your kid’s crew · ages {r.age.label}</small>
      <h1 className="q-title">Meet the crew behind your hard moments</h1>
      <p className="fx-sub">Not a bad kid. Not bad parenting. A small crew doing its job, and a few villains getting in the way.</p>

      <ul className="q-crew">
        {r.picks.map((m) => (
          <li key={m.id} style={{ ["--ct" as string]: tint(m.char.color) }}>
            <CrewArt k={m.char.key} mood="tired" />
            <div><b>{m.label}</b><span>{m.line}</span></div>
          </li>
        ))}
      </ul>

      <div className="q-row q-row-3">
        <div className="q-mini" style={{ ["--ct" as string]: tint(r.age.stage.color) }}>
          <CrewArt k={r.age.stage.key} />
          <div><small>Your kid’s stage</small><b>{r.age.stage.name} · {r.age.stage.real}</b><span>{capFirst(r.age.stage.job)}.</span></div>
        </div>
        {r.villain && (
          <div className="q-mini" style={{ ["--ct" as string]: tint(r.villain.color) }}>
            <CrewArt k={r.villain.key} />
            <div><small>Villain to beat first</small><b>{r.villain.name} · {r.villain.real}</b><span>{capFirst(r.villain.job)}.</span></div>
          </div>
        )}
        {r.sleep && (
          <div className="q-mini" style={{ ["--ct" as string]: tint(data.sleep.char.color) }}>
            <CrewArt k={data.sleep.char.key} />
            <div><small>Sleep check</small><b>About {hoursLabel(r.sleep.hours)} hours</b><span>{data.sleep[r.sleep.verdict].title} Recommended: {r.sleep.says}.</span></div>
          </div>
        )}
      </div>

      {r.home.length > 1 && (
        <p className="fine">Villains at your house: {r.home.map((v) => `${v.char.name} (${v.char.real.toLowerCase()})`).join(", ")}.</p>
      )}

      <h2>Your 3-night plan</h2>
      <ol className="tonight">
        {r.nights.map((n, i) => <li key={i}><b>Night {i + 1}.</b> {n}</li>)}
      </ol>
      <p className="fine">Same time, same words, three nights in a row. That’s Plasti: the brain changes from what’s repeated.</p>

      {r.lead.kid && (
        <div className="q-say">
          <b>Say it to your kid</b>
          <p>{r.lead.kid}</p>
        </div>
      )}

      <div className="q-offer">
        <CrewArt k={r.lead.char.key} mood="happy" />
        <div>
          <h2>Want all 12 moments decoded?</h2>
          <p>The Kid Brain Toolkit: all 12 crew members, the 12 hardest moments with the exact words to say, the 6 villains, and what’s normal at every age, Whyzi (3) to Seki (17). Read it in one evening.</p>
          <button className="btn btn-main" type="button" disabled>Coming soon</button>
          <p className="fine">The Toolkit will start with {r.lead.char.name}’s moments. Opening soon.</p>
        </div>
      </div>

      <h3>Read more, free</h3>
      <ul className="q-more">
        {r.picks.map((m) => <li key={m.id}><a href={m.path} target="_blank" rel="noopener" onClick={click(m.path)}>{m.label}</a></li>)}
        <li><a href={r.age.path} target="_blank" rel="noopener" onClick={click(r.age.path)}>What’s normal at {r.age.label}</a></li>
        {r.sleep && <li><a href={data.sleep.path} target="_blank" rel="noopener" onClick={click(data.sleep.path)}>How much sleep kids need, by age</a></li>}
        {r.home.slice(0, 2).map((v) => <li key={v.char.key}><a href={v.path} target="_blank" rel="noopener" onClick={click(v.path)}>Beat {v.char.name}: {v.char.real.toLowerCase()}</a></li>)}
      </ul>

      <p className="disclaim">{DISCLAIMER}</p>
    </div>
  );
}

const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The answers that shape the result, from the saved progress. */
function answersOf(p: Progress): QuizAnswers {
  const { bed, wake, checked } = p.sleep;
  return {
    age: p.age,
    moments: p.moments,
    sleep: checked && bed != null && wake != null ? { bed, wake } : null,
    villains: p.villains.checked ? p.villains.picks : null,
  };
}

/** Minutes after midnight → "8:30 p.m." (24:00 and later is past midnight). */
function clock(min: number) {
  const m = min % (24 * 60);
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "a.m." : "p.m."}`;
}
