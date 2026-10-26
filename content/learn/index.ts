// Everything the Learn routes, sitemap, llms.txt and scripts/check-learn.mjs read.
import type { LearnEntry, SectionKey } from "./types.ts";
import { BRAIN_CHEMICALS } from "./brain-chemicals.ts";
import { BRAIN_PARTS } from "./brain-parts.ts";
import { HABITS } from "./habits.ts";
import { AGES } from "./ages.ts";
import { WHY_A } from "./why-a.ts";
import { WHY_B } from "./why-b.ts";
import { WHAT_TO_SAY } from "./what-to-say.ts";
import { MYTHS } from "./myths.ts";
import { GUIDES } from "./guides.ts";

export * from "./types.ts";
export { SECTIONS, SECTION_BY_KEY, ALL_PATHS } from "./sections.ts";
export { SOURCES, SOURCE_BY_KEY } from "./sources.ts";
export { GLOSSARY } from "./glossary.ts";
export { SITE_PAGES } from "./site-pages.ts";

export const ENTRIES: LearnEntry[] = [
  ...BRAIN_CHEMICALS, ...BRAIN_PARTS, ...HABITS, ...AGES, ...WHY_A, ...WHY_B, ...WHAT_TO_SAY, ...MYTHS, ...GUIDES,
];

export const entriesIn = (section: SectionKey) => ENTRIES.filter((e) => e.section === section);
export const entryAt = (section: SectionKey, slug: string) => ENTRIES.find((e) => e.section === section && e.slug === slug);
export const pathOf = (e: Pick<LearnEntry, "section" | "slug">) => `/${e.section}/${e.slug}`;
