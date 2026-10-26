// Shared shape for the Learn pages (/brain-chemicals, /why, /myths, ...).
// Section files (crew.ts, why.ts, ...) export arrays of LearnEntry; app/(learn) renders them
// with the global design classes, and scripts/check-learn.mjs checks them.

/** Characters drawn in design/assets/crew-art.js (server-rendered from content/art.json). */
export type CharKey =
  | "dopa" | "sero" | "endo" | "nora" | "gabi" | "toci" | "corti" | "teo" | "mela" | "greli" | "migo" | "fronti"
  | "bedi" | "glo" | "lupi" | "pingi" | "lati" | "kafi"
  | "whyzi" | "skuli" | "ruli" | "tweeni" | "sprouti" | "seki"
  | "plasti" | "duo";

export type SectionKey =
  | "brain-chemicals" | "brain-parts" | "habits" | "ages" | "why" | "what-to-say" | "myths" | "guides";

/** Keys of content/learn/sources.ts, e.g. "S03". */
export type SourceKey = string;

export type Block = {
  h2: string;
  /** Plain-text paragraphs. Use **double asterisks** for bold, nothing else. */
  paras: string[];
  /** Optional bullet list shown after the paragraphs. */
  bullets?: string[];
};

export type Table = { caption: string; head: string[]; rows: string[][] };

export type LearnEntry = {
  section: SectionKey;
  /** URL segment: /<section>/<slug>. Must match the registry in sections.ts. */
  slug: string;
  /** Visible H1, usually the question a parent types. */
  h1: string;
  /** <title> without the brand suffix, ≤ 60 characters. */
  metaTitle: string;
  /** Meta description, 120–155 characters. */
  description: string;
  /** Small uppercase line above the H1, e.g. "Brain chemicals · Dopamine". */
  kicker: string;
  /** Answer-first paragraph, 40–60 words, directly answers the H1. */
  answer: string;
  /** Featured character (optional for guides). */
  char?: CharKey;
  /** One caption next to the character art, e.g. "Dopa: the gold-star giver". */
  charCaption?: string;
  /** How you'd explain it to the kid, 2–4 sentences, said out loud. */
  kidVersion?: string;
  /** Main body. Together with the other text fields the page must reach ≥ 700 words. */
  sections: Block[];
  /** "What you'll see at home" signs. */
  atHome?: string[];
  /** 3 concrete things to try tonight. */
  tryTonight?: string[];
  /** Instead of X, say Y. Required on /what-to-say pages. */
  whatToSay?: { instead: string; say: string; why?: string }[];
  /** Myth pages only. */
  myth?: { claim: string; verdict: "Myth" | "Mostly myth" | "Half true"; truth: string };
  /** Optional data table (sleep hours, ages...). */
  table?: Table;
  /** Page-specific "talk to your pediatrician if..." text. */
  whenToTalk: string;
  /** 3–5 questions; answers 2–4 sentences. */
  faqs: { q: string; a: string }[];
  /** ≥ 2 keys from sources.ts. */
  sources: SourceKey[];
  /** ≥ 3 internal paths, e.g. "/why/kid-melts-down-after-school". */
  related: string[];
  /** Wikipedia URL for the real-world entity (chemicals, brain parts). Used as about.sameAs. */
  entity?: { name: string; sameAs: string };
  /** Teen-only material (Teo). */
  teenOnly?: boolean;
  /** ISO dates. */
  published: string;
  updated: string;
};

/** Simple text pages: /about, /editorial-policy, /privacy, /terms. */
export type SitePage = {
  slug: string;
  h1: string;
  metaTitle: string;
  description: string;
  dek: string;
  sections: Block[];
  /** Shows the yellow .draft label: text waits for Luka's OK. */
  draft?: boolean;
  updated: string;
};

export type GlossaryTerm = {
  /** Anchor id on /glossary. */
  id: string;
  term: string;
  /** Character name if the term has one, e.g. "Dopa". */
  char?: string;
  /** One-sentence definition a parent can repeat, ≤ 35 words. */
  definition: string;
  /** Kid-sized line, ≤ 20 words. */
  kid?: string;
  /** Internal page with more, if any. */
  link?: string;
};
