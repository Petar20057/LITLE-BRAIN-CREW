// JSON-LD builders for the Learn pages. @ids hang off SITE_URL: /#org and /#website are defined on the home page.
import type { GlossaryTerm, LearnEntry } from "@/content/learn";
import type { Section } from "@/content/learn/sections.ts";
import { SOURCE_BY_KEY, pathOf } from "@/content/learn";
import { SITE_URL } from "@/lib/design";
import { BRAND, ogPath, plain } from "@/lib/learn";

export const ORG_ID = `${SITE_URL}/#org`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
const abs = (path: string) => `${SITE_URL}${path === "/" ? "/" : path}`;
const CTX = "https://schema.org";
const org = { "@type": "Organization", "@id": ORG_ID, name: BRAND, url: `${SITE_URL}/` };
const website = { "@type": "WebSite", "@id": WEBSITE_ID, name: BRAND, url: `${SITE_URL}/` };

export type Crumb = { name: string; path?: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": CTX,
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: abs(c.path) } : {}),
    })),
  };
}

export function articleLd(e: LearnEntry) {
  const url = abs(pathOf(e));
  return {
    "@context": CTX,
    "@type": "Article",
    "@id": `${url}#article`,
    headline: e.h1,
    description: e.description,
    datePublished: e.published,
    dateModified: e.updated,
    inLanguage: "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    author: org,
    publisher: org,
    image: abs(ogPath(e)),
    isPartOf: website,
    ...(e.entity ? { about: { "@type": "Thing", name: e.entity.name, sameAs: e.entity.sameAs } } : {}),
    citation: e.sources
      .map((k) => SOURCE_BY_KEY[k])
      .filter(Boolean)
      .map((s) => ({ "@type": "CreativeWork", name: s.title, ...(s.url ? { url: s.url } : {}) })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": CTX,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plain(f.a) } })),
  };
}

export function hubLd(s: Section, items: { path: string; name: string }[]) {
  const url = abs(`/${s.key}`);
  return [
    {
      "@context": CTX,
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      name: s.h1,
      description: s.description,
      url,
      inLanguage: "en-US",
      isPartOf: website,
      publisher: org,
    },
    itemListLd(items),
  ];
}

export function itemListLd(items: { path: string; name: string }[]) {
  return {
    "@context": CTX,
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: abs(it.path) })),
  };
}

export function collectionLd(o: { path: string; name: string; description: string }) {
  return {
    "@context": CTX,
    "@type": "CollectionPage",
    "@id": `${abs(o.path)}#page`,
    name: o.name,
    description: o.description,
    url: abs(o.path),
    inLanguage: "en-US",
    isPartOf: website,
    publisher: org,
  };
}

export function webPageLd(o: { path: string; name: string; description: string; type?: "WebPage" | "AboutPage"; dateModified?: string }) {
  return {
    "@context": CTX,
    "@type": o.type ?? "WebPage",
    "@id": `${abs(o.path)}#page`,
    name: o.name,
    description: o.description,
    url: abs(o.path),
    inLanguage: "en-US",
    isPartOf: website,
    publisher: org,
    ...(o.dateModified ? { dateModified: o.dateModified } : {}),
  };
}

export function glossaryLd(terms: GlossaryTerm[]) {
  const url = abs("/glossary");
  return {
    "@context": CTX,
    "@type": "DefinedTermSet",
    "@id": `${url}#set`,
    name: "Little Brain Crew glossary",
    url,
    inLanguage: "en-US",
    publisher: org,
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${url}#${t.id}`,
      name: t.term,
      description: t.definition,
      url: `${url}#${t.id}`,
      inDefinedTermSet: `${url}#set`,
    })),
  };
}
