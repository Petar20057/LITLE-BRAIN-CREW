// Rules for the crew of 214 (content/characters.json, imported from Luka's CSV by scripts/import-characters.mjs).
// Pure functions only, no data and no imports, so the import script (Node) and the tests can use them as well as the pages.

export type Access = "free" | "locked";

/** The parts of a character that live only in the Complete Crew Guide PDF (it comes with the Toolkit). Never sent to the browser. */
export type LockedContent = {
  explanation?: string;
  whatToSay?: string;
  print?: string;
  cartoon?: string;
};

export type Character = {
  /** URL segment: /crew/<slug>. */
  slug: string;
  name: string;
  /** What the character stands for in real life. */
  real: string;
  /** The CSV's group code ("messengers", "brain", "habit_helpers"...); groupTitle() makes it readable. */
  group?: string;
  /** The CSV's pack name ("" for the core crew). Packs stopped being sold on 2026-11-04; the field is kept for the data. */
  pack: string;
  packSlug: string;
  access: Access;
  /** The CSV's "sample" flag (one free character per former pack). */
  sample: boolean;
  /** A glossary row links to this page. */
  inGlossary: boolean;
  /** false: nothing is sold or shown but the card and "Tell me when it's ready". */
  published: boolean;
  /** Public: the card line, the short answer, "When to talk to your pediatrician" and anything about safety. */
  sentence: string;
  shortAnswer: string;
  whenToTalk: string;
  safety?: string;
  /** "Say it to your kid": 2–3 sentences said out loud (public). */
  kidVersion?: string;
  /** Public: keys of content/learn/sources.ts ("S08") or full references, a URL at the end becomes a link. */
  sources?: string[];
  /** The CSV's row number ("F12", "107"). */
  num?: string;
  /** Priority inside the pack: ★ first, then ○, then ·. */
  wave?: string;
  /** "10+", "13+": the character is for older kids. */
  ageFlag?: string;
  color?: string;
  /** Inline art from content/art.json (the first 26). */
  artKey?: string;
  /** A file under public/ (public/crew-art/<slug>.svg, copied by the import script). */
  artFile?: string;
  locked: LockedContent;
};

/** The fields a per-character content file (content/characters/<slug>.json) may set; the rest comes from the CSV. */
export const PUBLIC_CONTENT_FIELDS = ["shortAnswer", "whenToTalk", "safety", "kidVersion", "sources", "published"] as const;
export const LOCKED_CONTENT_FIELDS = ["explanation", "whatToSay", "print", "cartoon"] as const;

/** What a card or a locked page may show: everything but the locked content. */
export type PublicCharacter = Omit<Character, "locked">;

/** A character is open on the site when the CSV marks it free or it has a finished page. Everything else is locked
 *  (2026-11-04, Luka): on /crew it is a grey silhouette with a padlock and no name, its card leads to the Toolkit checkout,
 *  and its text is only in the Complete Crew Guide PDF that comes with the Toolkit. No packs, no Club, no sign-in. */
export const isUnlocked = (c: Pick<Character, "access" | "published">): boolean => c.access === "free" || c.published;

/** Readable names for the CSV's group codes (the free crew is grouped by these on /crew). */
export const GROUP_TITLES: Record<string, string> = {
  messengers: "Brain chemicals",
  brain: "Brain parts",
  senses: "Senses",
  rules: "The rules",
  ages: "Ages and stages",
  villains: "The villains",
  body: "The body",
  development: "Growing up",
  habit_helpers: "Habit helpers",
  sleep: "Sleep",
  food: "Food",
  feelings_family: "Feelings and family",
};
export const groupTitle = (group: string | undefined): string => (group ? (GROUP_TITLES[group] ?? group) : "The crew");

/** "Fuel & Body" -> "Fuel & Body pack"; a name that already ends in "Pack" stays as it is. */
export const packLabel = (name: string): string => (/\bpack$/i.test(name.trim()) ? name : `${name} pack`);

/** "13+" -> "Teens 13+", "10+" -> "Ages 10+". */
export const ageLabel = (flag: string | undefined): string | undefined =>
  !flag ? undefined : flag.startsWith("13") ? `Teens ${flag}` : `Ages ${flag}`;

const WAVES = ["★", "○", "·"];
export const waveRank = (wave: string | undefined): number => {
  const i = WAVES.indexOf((wave ?? "").trim());
  return i === -1 ? WAVES.length : i;
};
/** ★ first, then ○, then ·, keeping the CSV order inside a wave. */
export const sortByWave = <T extends Pick<Character, "wave">>(chars: readonly T[]): T[] =>
  chars.map((c, i) => ({ c, i })).sort((a, b) => waveRank(a.c.wave) - waveRank(b.c.wave) || a.i - b.i).map((x) => x.c);

export function publicOf(c: Character): PublicCharacter {
  const { locked: _locked, ...rest } = c;
  void _locked;
  return rest;
}

/** "Vitamin D" -> "vitamin-d"; Serbian letters become ASCII (Đ -> dj). */
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "dj")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Problems that must be fixed in the CSV before the data goes live. Empty = fine.
 *  `siteBacked`: slugs whose page text the site already has (the 26 in lib/learn.ts), so the CSV may leave it out. */
export function validate(chars: readonly Character[], siteBacked: ReadonlySet<string> = new Set()): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const c of chars) {
    const where = `${c.name || "?"} (${c.slug || "no slug"})`;
    if (!c.slug) problems.push(`${where}: no slug`);
    else if (seen.has(c.slug)) problems.push(`${where}: duplicate slug`);
    seen.add(c.slug);
    if (!c.name) problems.push(`${where}: no name`);
    if (c.access !== "free" && c.access !== "locked") problems.push(`${where}: access must be free or locked, got "${String(c.access)}"`);
    if (c.sample && c.access !== "free") problems.push(`${where}: a sample must be free`);
    if (!c.sentence) problems.push(`${where}: no card sentence`);
    if (c.published && !siteBacked.has(c.slug)) {
      if (!c.shortAnswer) problems.push(`${where}: published but no short answer`);
      if (!c.whenToTalk) problems.push(`${where}: published but no "When to talk to your pediatrician"`);
    }
  }
  return problems;
}

/** Counts for the /crew filters: open on the site vs. locked (in the Complete Crew Guide). */
export function countsOf(chars: readonly Pick<Character, "access" | "published">[]) {
  const free = chars.filter(isUnlocked).length;
  return { all: chars.length, free, locked: chars.length - free };
}

/** Plain text with blank lines (or single line breaks) between paragraphs -> paragraphs. */
export const paragraphs = (text: string | undefined): string[] =>
  (text ?? "").split(/\n\s*\n|\r?\n/).map((p) => p.trim()).filter(Boolean);

export const isUrl = (s: string | undefined): s is string => typeof s === "string" && /^https?:\/\/\S+$/i.test(s.trim());

export type SayPair = { instead: string; say: string; why?: string };
/** "What to say" written as one pair per paragraph: `Instead of: … | Say: … | Why: …`. Null when any paragraph
 *  doesn't follow that shape (the page then shows plain paragraphs). */
export function parseSayPairs(text: string | undefined): SayPair[] | null {
  const paras = paragraphs(text);
  if (paras.length === 0) return null;
  const pairs: SayPair[] = [];
  for (const p of paras) {
    const parts = p.split("|").map((x) => x.trim());
    const instead = parts.find((x) => /^instead(?: of)?\s*:/i.test(x))?.replace(/^instead(?: of)?\s*:\s*/i, "");
    const say = parts.find((x) => /^say\s*:/i.test(x))?.replace(/^say\s*:\s*/i, "");
    const why = parts.find((x) => /^why\s*:/i.test(x))?.replace(/^why\s*:\s*/i, "");
    if (!instead || !say) return null;
    pairs.push(why ? { instead, say, why } : { instead, say });
  }
  return pairs;
}

/** A reference line: "Title. https://…" -> { title, url }. */
export function splitReference(line: string): { title: string; url?: string } {
  const m = line.trim().match(/^(.*?)\s*(https?:\/\/\S+)\s*$/);
  return m ? { title: m[1].replace(/[\s,;:–-]+$/, ""), url: m[2] } : { title: line.trim() };
}
