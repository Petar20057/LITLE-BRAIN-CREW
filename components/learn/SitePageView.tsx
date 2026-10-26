import { SITE_PAGES } from "@/content/learn";
import { notFound } from "next/navigation";
import { breadcrumbLd, webPageLd, type Crumb } from "@/lib/jsonld";
import { formatDate } from "@/lib/learn";
import Breadcrumbs from "./Breadcrumbs";
import JsonLd from "./JsonLd";
import LearnShell from "./LearnShell";
import Text from "./Text";

/** /about, /editorial-policy, /privacy, /terms: plain text pages from content/learn/site-pages.ts. */
export default function SitePageView({ slug }: { slug: string }) {
  const p = SITE_PAGES.find((x) => x.slug === slug);
  if (!p) notFound();
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: p.h1 }];
  return (
    <LearnShell>
      <JsonLd
        data={[
          webPageLd({ path: `/${p.slug}`, name: p.h1, description: p.description, type: p.slug === "about" ? "AboutPage" : "WebPage", dateModified: p.updated }),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: p.h1, path: `/${p.slug}` }]),
        ]}
      />
      <div className="learn-sheet s-white" data-c="var(--dopa)">
        <article className="article">
          <Breadcrumbs crumbs={crumbs} />
          <h1>{p.h1}</h1>
          {p.draft ? <p><span className="draft">draft · waiting for OK</span></p> : null}
          <p className="dek"><Text>{p.dek}</Text></p>
          <p className="byline">Updated <time dateTime={p.updated}>{formatDate(p.updated)}</time></p>
          {p.sections.map((b) => (
            <section key={b.h2}>
              <h2>{b.h2}</h2>
              {b.paras.map((t, i) => <p key={i}><Text>{t}</Text></p>)}
              {b.bullets?.length ? <ul className="learn-list">{b.bullets.map((x, i) => <li key={i}><Text>{x}</Text></li>)}</ul> : null}
            </section>
          ))}
        </article>
      </div>
    </LearnShell>
  );
}
