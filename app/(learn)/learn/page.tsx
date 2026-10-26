import { SECTION_BY_KEY, SECTIONS, pathOf } from "@/content/learn";
import Breadcrumbs from "@/components/learn/Breadcrumbs";
import { CardGrid } from "@/components/learn/HubPage";
import JsonLd from "@/components/learn/JsonLd";
import LearnShell from "@/components/learn/LearnShell";
import { breadcrumbLd, collectionLd, itemListLd } from "@/lib/jsonld";
import { SECTION_LABEL, charOf, entriesOf } from "@/lib/learn";
import { simpleMetadata } from "@/lib/seo";

export const instant = false;

const TITLE = "All guides: the brain, habits and what to say";
const DESCRIPTION =
  "Every Little Brain Crew guide in one place: brain chemicals, brain parts, habits, ages, why kids do what they do, what to say, and myths checked.";

export const metadata = simpleMetadata({ metaTitle: "All Guides for Parents", description: DESCRIPTION, path: "/learn" });

export default function Page() {
  const hubs = SECTIONS.filter((s) => entriesOf(s.key).length > 0);
  return (
    <LearnShell>
      <JsonLd
        data={[
          collectionLd({ path: "/learn", name: TITLE, description: DESCRIPTION }),
          itemListLd(hubs.map((s) => ({ path: `/${s.key}`, name: SECTION_BY_KEY[s.key].h1 }))),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "All guides", path: "/learn" }]),
        ]}
      />
      <section className="sec s-white learn-hub" data-c="var(--dopa)">
        <div className="wrap">
          <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "All guides" }]} />
          <span className="kick">everything in one place</span>
          <h1>{TITLE}</h1>
          <p className="lede">
            Short answers first, then the brain behind them and one thing to try tonight. Educational content only, not medical advice.
          </p>
          <ul className="ref-links">
            <li><a href="/crew">Meet the crew</a></li>
            <li><a href="/glossary">Glossary</a></li>
            <li><a href="/sources">Sources</a></li>
            <li><a href="/editorial-policy">How we write</a></li>
          </ul>
          {hubs.map((s) => (
            <div key={s.key} className="learn-block" id={s.key}>
              <h2><a href={`/${s.key}`}>{SECTION_LABEL[s.key]}</a></h2>
              <p className="lede">{s.intro}</p>
              <CardGrid items={entriesOf(s.key).map((e) => ({ path: pathOf(e), title: e.h1, char: charOf(e), teen: e.teenOnly }))} />
              <p className="more-faq"><a href={`/${s.key}`}>All in {SECTION_LABEL[s.key]} →</a></p>
            </div>
          ))}
          {hubs.length === 0 ? <p className="lede">New guides are on the way. Meet <a href="/crew">the crew</a> in the meantime.</p> : null}
        </div>
      </section>
    </LearnShell>
  );
}

