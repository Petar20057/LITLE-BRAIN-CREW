// Helpers for the Learn pages (everything under app/(learn)): character data, path lookups, text and dates.
import art from "@/content/art.json";
import {
  ENTRIES, GLOSSARY, SECTIONS, SECTION_BY_KEY, entryAt, pathOf,
  type CharKey, type LearnEntry, type SectionKey,
} from "@/content/learn";
import type { Section } from "@/content/learn/sections.ts";

/** Open Graph card size, and where an entry's card is served (app/(learn)/og/[section]/[slug]/route.tsx). */
export const OG_SIZE = { width: 1200, height: 630 };
export const ogPath = (e: Pick<LearnEntry, "section" | "slug">) => `/og/${e.section}/${e.slug}`;

export type Mood = "main" | "happy" | "tired";
export const BRAND = "Little Brain Crew";

/** Inner SVG markup of a character (see scripts/sync-design.mjs). */
export const artOf = (key: CharKey, mood: Mood = "main"): string =>
  (art as unknown as Record<string, Record<Mood, string>>)[key]?.[mood] ?? "";

export type CharGroup = "chemical" | "brain-part" | "rule" | "villain" | "age";
export type CharInfo = {
  name: string;
  /** What the character stands for in real life. */
  real: string;
  /** The character's color (same as the crew colors in site.js and the art). */
  color: string;
  group: CharGroup;
  /** One line, as on the home page. */
  job: string;
};

export const CHARS: Record<CharKey, CharInfo> = {
  dopa: { name: "Dopa", real: "Dopamine", color: "#FFD84D", group: "chemical", job: "gives out gold stars when you finish something" },
  sero: { name: "Sero", real: "Serotonin", color: "#FFB86B", group: "chemical", job: "opens the curtains and keeps the mood steady" },
  endo: { name: "Endo", real: "Endorphins", color: "#A8E6C8", group: "chemical", job: "turns jumping and laughing into good feelings" },
  nora: { name: "Nora", real: "Norepinephrine", color: "#8FD3D9", group: "chemical", job: "switches on the spotlight when something matters" },
  gabi: { name: "Gabi", real: "GABA", color: "#C5B4F5", group: "chemical", job: "presses the brain’s brake and turns the volume down" },
  toci: { name: "Toci", real: "Oxytocin", color: "#FFC6D3", group: "chemical", job: "builds the feeling “I’m safe, I belong”" },
  corti: { name: "Corti", real: "Cortisol", color: "#FF7A5C", group: "chemical", job: "rings the alarm when there’s danger" },
  mela: { name: "Mela", real: "Melatonin", color: "#8C9EEB", group: "chemical", job: "whispers “night is coming” so the body gets sleepy" },
  greli: { name: "Greli", real: "Ghrelin", color: "#C9E66E", group: "chemical", job: "rings the hunger bell from the stomach" },
  teo: { name: "Teo", real: "Testosterone", color: "#BFE6FF", group: "chemical", job: "builds strength, energy and confidence in the teen years" },
  migo: { name: "Migo", real: "Amygdala", color: "#E89AC7", group: "brain-part", job: "the smoke detector that yells “danger!” in a flash" },
  fronti: { name: "Fronti", real: "Prefrontal cortex", color: "#F2C094", group: "brain-part", job: "plans, waits and works the brakes, still under construction" },
  plasti: { name: "Plasti", real: "Neuroplasticity", color: "#FF9EAA", group: "rule", job: "the brain changes from what’s repeated" },
  duo: { name: "Duo", real: "Co-regulation", color: "#FFD8BE", group: "rule", job: "kids borrow your calm before they can make their own" },
  bedi: { name: "Bedi", real: "Phone in bed", color: "#6C6A9E", group: "villain", job: "a phone in the bedroom is linked with worse sleep, even when nobody’s using it" },
  glo: { name: "Glo", real: "Bright light late at night", color: "#FFE066", group: "villain", job: "bright evening light turns Mela down and pushes sleep later" },
  lupi: { name: "Lupi", real: "Autoplay and the endless feed", color: "#F46FA3", group: "villain", job: "the next video starts by itself, so the ending never comes" },
  pingi: { name: "Pingi", real: "Notifications", color: "#F2A541", group: "villain", job: "every ping pulls the spotlight off homework and back to the screen" },
  lati: { name: "Lati", real: "Late bedtimes that change every night", color: "#9C8FD0", group: "villain", job: "irregular bedtimes are linked with more behavior struggles in kids" },
  kafi: { name: "Kafi", real: "Caffeine", color: "#6FD18A", group: "villain", job: "caffeine can keep a body awake for hours" },
  whyzi: { name: "Whyzi", real: "Ages 3–6", color: "#FFD6A5", group: "age", job: "the “why?” years: huge imagination and “I do it myself!”" },
  skuli: { name: "Skuli", real: "Ages 6–8", color: "#FDFFB6", group: "age", job: "school, rules and friends" },
  ruli: { name: "Ruli", real: "Ages 8–10", color: "#CAFFBF", group: "age", job: "fairness, skills and hobbies" },
  tweeni: { name: "Tweeni", real: "Ages 10–12", color: "#9BF6FF", group: "age", job: "puberty starts for many, and friends start to matter more" },
  sprouti: { name: "Sprouti", real: "Ages 12–14", color: "#A0C4FF", group: "age", job: "fast growth, a body clock that shifts later, and rewards that feel bigger" },
  seki: { name: "Seki", real: "Ages 14–17", color: "#BDB2FF", group: "age", job: "friends’ opinions peak while the brakes are still being built" },
};

/** How /crew groups the 26 characters, in order. `section` is the Learn section that has their pages. */
export const CREW_GROUPS: { group: CharGroup; title: string; blurb: string; section: SectionKey; keys: CharKey[] }[] = [
  { group: "chemical", title: "Brain chemicals", blurb: "Messengers and hormones. Cartoons for what a body does, never a measurement of your kid.", section: "brain-chemicals",
    keys: ["dopa", "sero", "endo", "nora", "gabi", "toci", "corti", "mela", "greli", "teo"] },
  { group: "brain-part", title: "Brain parts", blurb: "Where the big feelings start and where the brakes live.", section: "brain-parts", keys: ["migo", "fronti"] },
  { group: "rule", title: "The two rules", blurb: "The two ideas behind every habit.", section: "brain-parts", keys: ["plasti", "duo"] },
  { group: "villain", title: "The villains", blurb: "Always a habit or a thing. Never a person, a food or a body.", section: "habits", keys: ["bedi", "glo", "lupi", "pingi", "lati", "kafi"] },
  { group: "age", title: "Ages and stages", blurb: "One character for each stage, 3 to 17. Ranges overlap and every kid has their own pace.", section: "ages",
    keys: ["whyzi", "skuli", "ruli", "tweeni", "sprouti", "seki"] },
];

/** Short names for breadcrumbs and menus. */
export const SECTION_LABEL: Record<SectionKey, string> = {
  "brain-chemicals": "Brain chemicals",
  "brain-parts": "Brain parts",
  habits: "Habits",
  ages: "Ages",
  why: "Why does my kid…",
  "what-to-say": "What to say",
  myths: "Myths",
  guides: "Guides",
};

/** Art for pages that have no featured character. */
const SECTION_CHAR: Record<SectionKey, CharKey> = {
  "brain-chemicals": "dopa", "brain-parts": "fronti", habits: "bedi", ages: "whyzi",
  why: "migo", "what-to-say": "duo", myths: "plasti", guides: "fronti",
};
export const charOf = (e: Pick<LearnEntry, "char" | "section">): CharKey => e.char ?? SECTION_CHAR[e.section];
export const sectionChar = (s: SectionKey): CharKey => SECTION_CHAR[s];

/** The planned page for a character in its group's section, but only if it is written. */
export function charPage(key: CharKey): { path: string; title: string } | undefined {
  const g = CREW_GROUPS.find((x) => x.keys.includes(key));
  const planned = g && SECTION_BY_KEY[g.section].pages.find((p) => p.char === key);
  const e = planned && entryAt(g.section, planned.slug);
  return e ? { path: pathOf(e), title: e.h1 } : undefined;
}

// ---------- paths ----------
export type PageRef = { path: string; title: string; blurb?: string; char?: CharKey };

const EXTRA_REFS: Record<string, { title: string; blurb: string }> = {
  "/learn": { title: "All guides", blurb: "Every hub in one place." },
  "/crew": { title: "Meet the crew", blurb: "All 26 characters, grouped." },
  "/glossary": { title: "Glossary", blurb: "The words in this site, in plain English." },
  "/about": { title: "About Little Brain Crew", blurb: "Who we are and what we teach." },
  "/editorial-policy": { title: "How we write", blurb: "Sources, checks and what we never claim." },
  "/sources": { title: "Sources", blurb: "Every source our pages cite." },
  "/pricing": { title: "The 30-Day Reset", blurb: "One 10-minute habit a day, for 30 days." },
  "/faq": { title: "Parent FAQ", blurb: "Short answers about screens, sleep and mood." },
  "/free": { title: "Free tips and stickers", blurb: "Printable crew stickers and tips." },
  "/ask": { title: "Ask the crew", blurb: "Ask a question and get a crew answer." },
  "/": { title: "Little Brain Crew", blurb: "The crew inside your kid’s brain, made simple." },
};

export const pathExists = (path: string) => resolvePath(path) !== undefined;

/** A path that points at a page that exists today: an entry, a hub, a glossary anchor or a fixed page. Else undefined. */
export function resolvePath(path: string): PageRef | undefined {
  const [base, hash] = path.split("#");
  if (base === "/glossary" && hash) {
    const t = GLOSSARY.find((g) => g.id === hash);
    return t ? { path, title: t.term, blurb: t.definition } : undefined;
  }
  const section = SECTIONS.find((s) => `/${s.key}` === base);
  if (section) return { path: base, title: section.h1, blurb: section.intro, char: sectionChar(section.key) };
  const entry = ENTRIES.find((e) => pathOf(e) === base);
  if (entry) return { path: base, title: entry.h1, blurb: entry.description, char: charOf(entry) };
  if (path in EXTRA_REFS) return { path, ...EXTRA_REFS[path] };
  return undefined;
}

export const entriesOf = (section: SectionKey) => ENTRIES.filter((e) => e.section === section);
export const sectionsWithEntries = (): Section[] => SECTIONS.filter((s) => entriesOf(s.key).length > 0);

// ---------- text and dates ----------
/** "**bold**" -> segments, so components can render <strong> without raw HTML. */
export function boldParts(text: string): { text: string; bold: boolean }[] {
  return text.split("**").map((t, i) => ({ text: t, bold: i % 2 === 1 })).filter((p) => p.text !== "");
}
/** Text with the ** markers removed (for JSON-LD, llms.txt, image text). */
export const plain = (text: string) => text.replaceAll("**", "");

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
