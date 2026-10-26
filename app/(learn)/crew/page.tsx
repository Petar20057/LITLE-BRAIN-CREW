import Breadcrumbs from "@/components/learn/Breadcrumbs";
import CharArt from "@/components/learn/CharArt";
import JsonLd from "@/components/learn/JsonLd";
import LearnShell from "@/components/learn/LearnShell";
import { breadcrumbLd, collectionLd, itemListLd } from "@/lib/jsonld";
import { CHARS, CREW_GROUPS, charPage } from "@/lib/learn";
import { simpleMetadata } from "@/lib/seo";

export const instant = false;

const TITLE = "Meet the crew: 26 characters inside your kid’s brain";
const DESCRIPTION =
  "Brain chemicals, brain parts, the two rules, the habit villains and one character for every age from 3 to 17. Who they are and what each one does.";

export const metadata = simpleMetadata({ metaTitle: "Meet the Crew: Kids’ Brain Characters", description: DESCRIPTION, path: "/crew" });

export default function Page() {
  const linked = CREW_GROUPS.flatMap((g) => g.keys).flatMap((k) => {
    const p = charPage(k);
    return p ? [{ path: p.path, name: `${CHARS[k].name}: ${CHARS[k].real}` }] : [];
  });
  return (
    <LearnShell>
      <JsonLd
        data={[
          collectionLd({ path: "/crew", name: TITLE, description: DESCRIPTION }),
          ...(linked.length ? [itemListLd(linked)] : []),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Meet the crew", path: "/crew" }]),
        ]}
      />
      <section className="sec s-white learn-hub" data-c="var(--sero)">
        <div className="wrap">
          <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Meet the crew" }]} />
          <span className="kick">who’s who</span>
          <h1>{TITLE}</h1>
          <p className="lede">
            Every character is a cartoon for something real. They are metaphors for what a body does, never a measurement of your kid.
          </p>
          {CREW_GROUPS.map((g) => (
            <div key={g.group} className="learn-block" id={g.group}>
              <h2>{g.title}</h2>
              <p className="lede">{g.blurb}</p>
              <ul className="hub-grid crew-grid">
                {g.keys.map((k) => {
                  const c = CHARS[k];
                  const page = charPage(k);
                  const inner = (
                    <>
                      <CharArt char={k} mood="happy" />
                      <span>
                        <b>{c.name}</b>
                        <small className="crew-real">{c.real}</small>
                        <small>{c.job.charAt(0).toUpperCase() + c.job.slice(1)}.</small>
                        {k === "teo" ? <em className="teen-badge">Teens 13–17</em> : null}
                      </span>
                    </>
                  );
                  return (
                    <li key={k} style={{ "--c": c.color } as React.CSSProperties}>
                      {page ? <a href={page.path}>{inner}</a> : <div className="card-static">{inner}</div>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="fine hub-note">
            Educational content only, not medical advice. See <a href="/learn">all guides</a> or the <a href="/glossary">glossary</a>.
          </p>
        </div>
      </section>
    </LearnShell>
  );
}
