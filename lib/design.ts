import type { Metadata } from "next";
import { PAGES } from "@/content/pages/manifest";

// Pages synced from design/ by scripts/sync-design.mjs (npm run sync).
export { PAGES };
export type PageName = keyof typeof PAGES;

// Public origin of the site, e.g. https://vibelifecode.com. Empty locally.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function pageMetadata(name: PageName): Metadata {
  const p = PAGES[name];
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.route },
    robots: { index: true, follow: true },
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
