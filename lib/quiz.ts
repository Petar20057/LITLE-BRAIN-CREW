// Builds what the /code quiz shows from content/quiz.ts and the Learn entries, on the server, so the browser
// gets plain data and never the whole Learn content. Tracking rules live in lib/quiz-track.ts.
import { AGES, MOMENTS, MYTHS, RULES } from "@/content/quiz";
import { SOURCE_BY_KEY, entryAt, pathOf, type CharKey, type LearnEntry, type SectionKey } from "@/content/learn";
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
};

export type QuizData = {
  ages: { id: string; label: string; teen: boolean; stage: QuizChar; lesson: string; path: string }[];
  moments: QuizMoment[];
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

function source(e: LearnEntry): QuizSource {
  const s = SOURCE_BY_KEY[e.sources[0]];
  return { title: s?.title ?? e.sources[0], url: s?.url };
}

export function quizData(): QuizData {
  return {
    ages: AGES.map((a) => {
      const e = entry("ages", a.slug);
      return { id: a.id, label: a.label, teen: a.teen, stage: char(a.stage), lesson: e.answer, path: pathOf(e) };
    }),
    moments: MOMENTS.map((m) => {
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
