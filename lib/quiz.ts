// Builds what the /code quiz shows from content/quiz.ts and the Learn entries, on the server, so the browser
// gets plain data and never the whole Learn content. Tracking rules live in lib/quiz-track.ts.
import { AGES, MOMENTS, MYTHS, RULES, SLEEP_VERDICT, VILLAIN_CHECK, type SleepRange, type SleepVerdict } from "@/content/quiz";
import { ENTRIES, SOURCE_BY_KEY, entryAt, pathOf, type CharKey, type LearnEntry, type SectionKey } from "@/content/learn";
import { CHARS } from "@/lib/learn";

export type QuizChar = { key: CharKey; name: string; real: string; color: string; job: string };
export type QuizSource = { title: string; url?: string };

export type QuizMoment = {
  id: string;
  label: string;
  line: string;
  char: QuizChar;
  villain?: QuizChar;
  teen: boolean;
  /** Answer-first paragraph of the Learn entry. */
  lesson: string;
  /** The entry's "try tonight" tips, the chosen one first. */
  tips: string[];
  kid?: string;
  source: QuizSource;
  path: string;
  /** "Who's behind it?": the right crew member and two others, in name order. */
  guess: QuizChar[];
};

/** `question` is the Learn page title, which the answer-first `lesson` replies to ("Should kids…?" → "No. …"). */
export type QuizVillain = { char: QuizChar; label: string; question: string; lesson: string; tip: string; source: QuizSource; path: string };

export type QuizData = {
  ages: { id: string; label: string; teen: boolean; stage: QuizChar; lesson: string; path: string; sleep: SleepRange }[];
  moments: QuizMoment[];
  sleep: Record<SleepVerdict, { title: string; body: string; tip: string }> & { char: QuizChar; source: QuizSource; path: string };
  villains: QuizVillain[];
  myths: { ask: string; isMyth: boolean; verdict: string; truth: string; source: QuizSource; path: string }[];
  rules: Record<"plasti" | "duo", { kick: string; title: string; body: string; char: QuizChar; path: string }>;
};

const char = (key: CharKey): QuizChar => {
  const c = CHARS[key];
  return { key, name: c.name, real: c.real, color: c.color, job: c.job };
};

function entry(section: SectionKey, slug: string): LearnEntry {
  const e = entryAt(section, slug);
  if (!e) throw new Error(`content/quiz.ts points at a missing Learn entry: /${section}/${slug}`);
  return e;
}

/** A Learn entry by slug alone (the sleep tips point at /why and /habits pages). */
function entryBySlug(slug: string): LearnEntry {
  const e = ENTRIES.find((x) => x.slug === slug);
  if (!e) throw new Error(`content/quiz.ts points at a missing Learn entry: ${slug}`);
  return e;
}

function source(e: LearnEntry): QuizSource {
  const s = SOURCE_BY_KEY[e.sources[0]];
  return { title: s?.title ?? e.sources[0], url: s?.url };
}

/** The right crew member plus the next two different ones in the decoder, so every moment has fixed choices.
 *  A crew member the moment's own line names ("before Fronti had time to think") is never a wrong answer. */
function guessFor(i: number): QuizChar[] {
  const keys: CharKey[] = [MOMENTS[i].char];
  for (let j = 1; keys.length < 3 && j < MOMENTS.length; j++) {
    const k = MOMENTS[(i + j) % MOMENTS.length].char;
    if (!keys.includes(k) && !MOMENTS[i].line.includes(CHARS[k].name)) keys.push(k);
  }
  return keys.map(char).sort((a, b) => a.name.localeCompare(b.name));
}

const tipOf = (e: LearnEntry, i: number) => e.tryTonight?.[i] ?? e.tryTonight?.[0] ?? "";

export function quizData(): QuizData {
  const sleepGuide = entry("guides", "sleep-hours-by-age");
  const sleepTip = (v: SleepVerdict) => {
    const t = SLEEP_VERDICT[v].tip;
    return tipOf(entryBySlug(t.slug), t.i);
  };
  return {
    ages: AGES.map((a) => {
      const e = entry("ages", a.slug);
      return { id: a.id, label: a.label, teen: a.teen, stage: char(a.stage), lesson: e.answer, path: pathOf(e), sleep: a.sleep };
    }),
    sleep: {
      short: { title: SLEEP_VERDICT.short.title, body: SLEEP_VERDICT.short.body, tip: sleepTip("short") },
      ok: { title: SLEEP_VERDICT.ok.title, body: SLEEP_VERDICT.ok.body, tip: sleepTip("ok") },
      long: { title: SLEEP_VERDICT.long.title, body: SLEEP_VERDICT.long.body, tip: sleepTip("long") },
      char: char("mela"),
      source: source(sleepGuide),
      path: pathOf(sleepGuide),
    },
    villains: VILLAIN_CHECK.map((v) => {
      const e = entry("habits", v.slug);
      return { char: char(v.villain), label: v.label, question: e.h1, lesson: e.answer, tip: tipOf(e, v.tip), source: source(e), path: pathOf(e) };
    }),
    moments: MOMENTS.map((m, i) => {
      const e = entry(m.entry.section, m.entry.slug);
      const tips = e.tryTonight ?? [];
      return {
        id: m.id,
        label: m.label,
        line: m.line,
        char: char(m.char),
        villain: m.villain ? char(m.villain) : undefined,
        teen: Boolean(m.teen),
        lesson: e.answer,
        tips: [tips[m.tip], ...tips.filter((_, i) => i !== m.tip)].filter(Boolean),
        kid: e.kidVersion,
        source: source(e),
        path: pathOf(e),
        guess: guessFor(i),
      };
    }),
    myths: MYTHS.map((m) => {
      const e = entry("myths", m.slug);
      if (!e.myth) throw new Error(`/myths/${m.slug} has no myth verdict`);
      return { ask: m.ask, isMyth: e.myth.verdict !== "Half true", verdict: e.myth.verdict, truth: e.myth.truth, source: source(e), path: pathOf(e) };
    }),
    rules: {
      plasti: { ...RULES.plasti, char: char("plasti"), path: pathOf(entry(RULES.plasti.entry.section, RULES.plasti.entry.slug)) },
      duo: { ...RULES.duo, char: char("duo"), path: pathOf(entry(RULES.duo.entry.section, RULES.duo.entry.slug)) },
    },
  };
}
