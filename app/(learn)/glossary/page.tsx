import { GLOSSARY } from "@/content/learn";
import Breadcrumbs from "@/components/learn/Breadcrumbs";
import JsonLd from "@/components/learn/JsonLd";
import LearnShell from "@/components/learn/LearnShell";
import { breadcrumbLd, glossaryLd } from "@/lib/jsonld";
import { pathExists } from "@/lib/learn";
import { simpleMetadata } from "@/lib/seo";

export const instant = false;

const DESCRIPTION = "The brain words on Little Brain Crew in plain English, each with a one-line definition for parents and a kid-sized version.";

export const metadata = simpleMetadata({ metaTitle: "Kids’ Brain Glossary in Plain English", description: DESCRIPTION, path: "/glossary" });

export default function Page() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <LearnShell>
      <JsonLd data={[glossaryLd(terms), breadcrumbLd([{ name: "Home", path: "/" }, { name: "Glossary", path: "/glossary" }])]} />
      <div className="learn-sheet s-white" data-c="var(--endo)">
        <article className="article">
          <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Glossary" }]} />
          <p className="meta">Plain English</p>
          <h1>Kids’ brain glossary</h1>
          <p className="dek">The words we use, one line each. Characters are cartoons for real things, never a measurement of your kid.</p>
          {terms.length === 0 ? <p>The glossary is coming soon.</p> : null}
          <dl className="glossary">
            {terms.map((t) => (
              <div key={t.id} id={t.id} className="gloss-item">
                <dt>
                  {t.term}
                  {t.char ? <span className="gloss-char">{t.char}</span> : null}
                </dt>
                <dd>{t.definition}</dd>
                {t.kid ? <dd className="gloss-kid"><span className="kid-say">Say it to your kid</span>{t.kid}</dd> : null}
                {t.link && pathExists(t.link) ? <dd><a href={t.link}>Read more →</a></dd> : null}
              </div>
            ))}
          </dl>
          <p className="fine disclaimer">
            Educational content only, built on everyday habits. It’s not medical advice, a diagnosis or a treatment.
          </p>
        </article>
      </div>
    </LearnShell>
  );
}
