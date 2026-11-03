// Rules for the 214-character crew (content/characters.json, imported from Luka's CSV by scripts/import-characters.mjs).
// Pure functions only, no data and no imports, so the import script (Node) and the tests can use them as well as the pages.

export type Access = "free" | "locked";

/** The parts of a page that only members and pack buyers may read. Never sent to the browser for a locked character. */
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
  /** Free text from the CSV ("group"), for the kicker. */
  group?: string;
  /** The pack that sells this character ("" for the free core crew). */
  pack: string;
  packSlug: string;
  access: Access;
  /** The free sample of its pack (one per pack). */
  sample: boolean;
  /** A glossary row links to this page. */
  inGlossary: boolean;
  /** false: nothing is sold or shown but the card and "Coming to the Club · Tell me when ready". */
  published: boolean;
  /** Public: the card line, the short answer, "When to talk to your pediatrician" and anything about safety. */
  sentence: string;
  shortAnswer: string;
  whenToTalk: string;
  safety?: string;
  color?: string;
  /** Inline art from content/art.json (the first 26). */
  artKey?: string;
  /** A file under public/ (public/crew-art/<slug>.svg, copied by the import script). */
  artFile?: string;
  locked: LockedContent;
};

/** What a card or a locked page may show: everything but the locked content. */
export type PublicCharacter = Omit<Character, "locked">;

/** Who is reading: an active Crew Club member and/or the owner of some packs (lib/viewer.ts). */
export type Viewer = { club: boolean; packs: readonly string[] };
export const NO_VIEWER: Viewer = { club: false, packs: [] };

/** Every pack costs the same, forever. The Club prices live in lib/funnel.ts (ITEMS). */
export const PACK_PRICE = 7;
/** Pack checkouts arrive with phase 5 (Creem products per pack); until then a pack is "coming". */
export const PACK_CHECKOUT_OPEN = false;
/** The Crew Club is a waitlist until phases 4–6 (next.config.ts sends /checkout/club back to the plans). */
export const CLUB_OPEN = false;

export const canRead = (c: Pick<Character, "access" | "published" | "packSlug">, v: Viewer): boolean =>
  c.published && (c.access === "free" || v.club || (c.packSlug !== "" && v.packs.includes(c.packSlug)));

export function publicOf(c: Character): PublicCharacter {
  const { locked: _locked, ...rest } = c;
  void _locked;
  return rest;
}

export type Pack = {
  slug: string;
  name: string;
  total: number;
  /** Characters with published = true. */
  ready: number;
  /** A pack goes on sale only when every character in it is ready. */
  onSale: boolean;
  /** Slugs of the free samples in this pack. */
  samples: string[];
};

/** Packs in order of first appearance. The free core crew (pack "") is not a pack. */
export function packsOf(chars: readonly Pick<Character, "pack" | "packSlug" | "published" | "sample" | "slug">[]): Pack[] {
  const out: Pack[] = [];
  for (const c of chars) {
    if (!c.packSlug) continue;
    let p = out.find((x) => x.slug === c.packSlug);
    if (!p) {
      p = { slug: c.packSlug, name: c.pack, total: 0, ready: 0, onSale: false, samples: [] };
      out.push(p);
    }
    p.total += 1;
    if (c.published) p.ready += 1;
    if (c.sample) p.samples.push(c.slug);
  }
  for (const p of out) p.onSale = p.total > 0 && p.ready === p.total;
  return out;
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

/** Problems that must be fixed in the CSV before the data goes live. Empty = fine. */
export function validate(chars: readonly Character[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const c of chars) {
    const where = `${c.name || "?"} (${c.slug || "no slug"})`;
    if (!c.slug) problems.push(`${where}: no slug`);
    else if (seen.has(c.slug)) problems.push(`${where}: duplicate slug`);
    seen.add(c.slug);
    if (!c.name) problems.push(`${where}: no name`);
    if (c.access !== "free" && c.access !== "locked") problems.push(`${where}: access must be free or locked, got "${String(c.access)}"`);
    if (c.access === "locked" && !c.packSlug) problems.push(`${where}: locked but in no pack`);
    if (c.sample && c.access !== "free") problems.push(`${where}: a sample must be free`);
    if (!c.sentence) problems.push(`${where}: no card sentence`);
    if (c.published) {
      if (!c.shortAnswer) problems.push(`${where}: published but no short answer`);
      if (!c.whenToTalk) problems.push(`${where}: published but no "When to talk to your pediatrician"`);
    }
  }
  for (const p of packsOf(chars)) {
    if (p.samples.length !== 1) problems.push(`pack ${p.name}: ${p.samples.length} samples, expected exactly one`);
  }
  return problems;
}

/** Counts for the /crew filters. */
export function countsOf(chars: readonly Pick<Character, "access">[]) {
  const free = chars.filter((c) => c.access === "free").length;
  return { all: chars.length, free, locked: chars.length - free };
}

/** Plain text with blank lines (or single line breaks) between paragraphs -> paragraphs. */
export const paragraphs = (text: string | undefined): string[] =>
  (text ?? "").split(/\n\s*\n|\r?\n/).map((p) => p.trim()).filter(Boolean);

export const isUrl = (s: string | undefined): s is string => typeof s === "string" && /^https?:\/\/\S+$/i.test(s.trim());
