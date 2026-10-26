// Metadata for the Learn pages. Titles are "<metaTitle> · Little Brain Crew"; canonicals are paths (metadataBase is SITE_URL).
import type { Metadata } from "next";
import type { LearnEntry } from "@/content/learn";
import type { Section } from "@/content/learn/sections.ts";
import { pathOf } from "@/content/learn";
import { BRAND, OG_SIZE, ogPath } from "@/lib/learn";

const withBrand = (t: string) => `${t} · ${BRAND}`;
const OG_FALLBACK_ALT = "The Little Brain Crew: 12 cartoon characters for the messengers, hormones and brain parts behind a kid’s mood, sleep and focus.";

/** An entry page (article). The og:image is the generated card at /og/<section>/<slug>. */
export function learnMetadata(e: LearnEntry): Metadata {
  const title = withBrand(e.metaTitle);
  const url = pathOf(e);
  return {
    title,
    description: e.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      siteName: BRAND,
      title,
      description: e.description,
      url,
      publishedTime: e.published,
      modifiedTime: e.updated,
      authors: [BRAND],
      images: [{ url: ogPath(e), ...OG_SIZE, alt: `${e.h1} · ${BRAND}` }],
    },
    twitter: { card: "summary_large_image", title, description: e.description, images: [ogPath(e)] },
  };
}

/** A section hub such as /brain-chemicals. */
export function hubMetadata(s: Section): Metadata {
  const title = withBrand(s.metaTitle);
  const url = `/${s.key}`;
  return {
    title,
    description: s.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: BRAND,
      title,
      description: s.description,
      url,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: OG_FALLBACK_ALT }],
    },
    twitter: { card: "summary_large_image", title, description: s.description },
  };
}

/** /learn, /crew, /glossary, /sources, /about, /editorial-policy, /privacy, /terms. */
export function simpleMetadata(o: { metaTitle: string; description: string; path: string; noindex?: boolean }): Metadata {
  const title = withBrand(o.metaTitle);
  return {
    title,
    description: o.description,
    alternates: { canonical: o.path },
    robots: { index: !o.noindex, follow: true },
    openGraph: {
      type: "website",
      siteName: BRAND,
      title,
      description: o.description,
      url: o.path,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: OG_FALLBACK_ALT }],
    },
    twitter: { card: "summary_large_image", title, description: o.description },
  };
}
