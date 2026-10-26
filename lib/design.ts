import type { Metadata } from "next";
import { PAGES } from "@/content/pages/manifest";

// Pages synced from design/ by scripts/sync-design.mjs (npm run sync).
export { PAGES };
export type PageName = keyof typeof PAGES;

// Public origin of the site. NEXT_PUBLIC_SITE_URL wins (e.g. a preview deployment); otherwise production builds use
// https://littlebraincrew.com and local development uses http://localhost:3000.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://littlebraincrew.com" : "http://localhost:3000")
).replace(/\/$/, "");

// "noindex,follow" from a page's <meta name="robots"> -> Next's robots object. Pages without one are indexable.
function robotsOf(content: string | undefined): Metadata["robots"] {
  if (!content) return { index: true, follow: true };
  const flags = content.toLowerCase().split(",").map((x) => x.trim());
  return { index: !flags.includes("noindex"), follow: !flags.includes("nofollow") };
}

/** True when the page's robots meta lets search engines index it (used by the sitemap). */
export const isIndexable = (name: PageName) => !/noindex/i.test((PAGES[name] as { robots?: string }).robots ?? "");

export function pageMetadata(name: PageName): Metadata {
  const p = PAGES[name];
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.route },
    robots: robotsOf((p as { robots?: string }).robots),
    openGraph: {
      type: p.ogType as "website" | "article",
      siteName: "Little Brain Crew",
      title: p.title,
      description: p.description,
      url: p.route,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: p.ogImageAlt }],
    },
    twitter: { card: "summary_large_image" },
  };
}
