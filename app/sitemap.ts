import type { MetadataRoute } from "next";
import { ENTRIES, SECTIONS, SITE_PAGES, pathOf } from "@/content/learn";
import { PAGES, SITE_URL, isIndexable, type PageName } from "@/lib/design";
import { entriesOf } from "@/lib/learn";

const url = (path: string) => `${SITE_URL}${path}`;
const newest = (dates: string[]) => dates.toSorted().at(-1);
const when = (iso: string | undefined) => (iso ? new Date(iso) : undefined);

export default function sitemap(): MetadataRoute.Sitemap {
  const all = ENTRIES.map((e) => e.updated);

  // Pages from design/ (the home page is "index"); pages with robots noindex (the /dopa ad page) are left out.
  const design = (Object.keys(PAGES) as PageName[]).filter(isIndexable).map((name) => ({ url: url(PAGES[name].route) }));

  const hubs = SECTIONS.filter((s) => entriesOf(s.key).length > 0).map((s) => ({
    url: url(`/${s.key}`),
    lastModified: when(newest(entriesOf(s.key).map((e) => e.updated))),
  }));
  const entries = ENTRIES.map((e) => ({ url: url(pathOf(e)), lastModified: when(e.updated) }));
  const fixed = ["/learn", "/crew", "/glossary", "/sources"].map((p) => ({ url: url(p), lastModified: when(newest(all)) }));
  const site = SITE_PAGES.map((p) => ({ url: url(`/${p.slug}`), lastModified: when(p.updated) }));

  return [...design, ...fixed, ...hubs, ...entries, ...site];
}
