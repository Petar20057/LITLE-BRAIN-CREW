import { ENTRIES, SOURCES, pathOf } from "@/content/learn";
import Breadcrumbs from "@/components/learn/Breadcrumbs";
import JsonLd from "@/components/learn/JsonLd";
import LearnShell from "@/components/learn/LearnShell";
import { breadcrumbLd, webPageLd } from "@/lib/jsonld";
import { simpleMetadata } from "@/lib/seo";

export const instant = false;

const DESCRIPTION = "Every source behind Little Brain Crew pages: pediatric guidelines, sleep and child development research, and which pages cite each one.";

export const metadata = simpleMetadata({ metaTitle: "Sources Behind Our Pages", description: DESCRIPTION, path: "/sources" });

export default function Page() {
  return (
    <LearnShell>
      <JsonLd
        data={[
          webPageLd({ path: "/sources", name: "Sources behind our pages", description: DESCRIPTION }),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Sources", path: "/sources" }]),
        ]}
      />
      <div className="learn-sheet s-white" data-c="var(--teo)">
        <article className="article">
          <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Sources" }]} />
          <p className="meta">Where it comes from</p>
          <h1>Sources behind our pages</h1>
          <p className="dek">
            Pages cite only sources from this list, and a source is added only after we have opened it and checked it. How we choose them is on{" "}
            <a href="/editorial-policy">How we write</a>.
          </p>
          <ol className="src sources sources-all">
            {SOURCES.map((s) => {
              const cited = ENTRIES.filter((e) => e.sources.includes(s.key));
              return (
                <li key={s.key} id={`src-${s.key}`}>
                  {s.url ? <a href={s.url} rel="noopener" target="_blank">{s.title}</a> : s.title}
                  {cited.length ? (
                    <span className="cited">
                      Cited on:{" "}
                      {cited.map((e, i) => (
                        <span key={pathOf(e)}>{i > 0 ? ", " : ""}<a href={pathOf(e)}>{e.metaTitle}</a></span>
                      ))}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
          <p className="fine disclaimer">
            Educational content only, built on everyday habits. It’s not medical advice, a diagnosis or a treatment.
          </p>
        </article>
      </div>
    </LearnShell>
  );
}
