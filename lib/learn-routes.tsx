// Shared by the thin route files in app/(learn)/<section>/[slug]/: static params, metadata and the page itself.
// Only entries that exist in content/learn get pages; planned-but-unwritten slugs from sections.ts are not built.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SECTION_BY_KEY, entriesIn, entryAt, type SectionKey } from "@/content/learn";
import EntryArticle from "@/components/learn/EntryArticle";
import HubPage from "@/components/learn/HubPage";
import { hubMetadata, learnMetadata } from "@/lib/seo";

/**
 * Slugs to prerender for a section. With cacheComponents Next refuses an empty list, so a section with no written
 * entries yet falls back to its first planned slug; that page answers 404 (see entryOr404).
 */
export function sectionStaticParams(section: SectionKey) {
  const slugs = entriesIn(section).map((e) => e.slug);
  return (slugs.length ? slugs : SECTION_BY_KEY[section].pages.slice(0, 1).map((p) => p.slug)).map((slug) => ({ slug }));
}

export function entryMetadata(section: SectionKey, slug: string): Metadata {
  const e = entryAt(section, slug);
  return e ? learnMetadata(e) : {};
}

export function EntryRoute({ section, slug }: { section: SectionKey; slug: string }) {
  const e = entryAt(section, slug);
  if (!e) notFound();
  return <EntryArticle entry={e} />;
}

export const hubMeta = (section: SectionKey): Metadata => hubMetadata(SECTION_BY_KEY[section]);
export const HubRoute = ({ section }: { section: SectionKey }) => <HubPage section={SECTION_BY_KEY[section]} />;
