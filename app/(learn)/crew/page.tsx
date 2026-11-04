import Breadcrumbs from "@/components/learn/Breadcrumbs";
import CrewCard, { LockedCard } from "@/components/learn/CrewCard";
import CrewFilters from "@/components/learn/CrewFilters";
import JsonLd from "@/components/learn/JsonLd";
import LearnShell from "@/components/learn/LearnShell";
import { countsOf, groupTitle, isUnlocked, sortByWave } from "@/lib/character-rules";
import { PUBLIC_CHARACTERS, characterPath } from "@/lib/characters";
import { ITEMS, usd } from "@/lib/funnel";
import { breadcrumbLd, collectionLd, itemListLd } from "@/lib/jsonld";
import { simpleMetadata } from "@/lib/seo";

export const instant = false;

// Every crew member, grouped the way the CSV groups them. An open character (free, or with a finished page) is a card
// with its name and one sentence; a locked one is a grey silhouette with a padlock and no name, and its click goes to
// the Toolkit checkout: the Complete Crew Guide (all 214, one card each) arrives in the same email as the Toolkit.
const n = PUBLIC_CHARACTERS.length;
const counts = countsOf(PUBLIC_CHARACTERS);
const TITLE = `Meet the crew: ${n} characters inside your kid’s brain`;
const DESCRIPTION =
  "Brain chemicals, brain parts, habits, foods and one character for every age. Who they are, what each one does, which ones are free to read, and how to unlock the rest.";

export const metadata = simpleMetadata({ metaTitle: "Meet the Crew: Kids’ Brain Characters", description: DESCRIPTION, path: "/crew" });

function UnlockBox({ place }: { place: string }) {
  return (
    <aside className="unlock-box" aria-labelledby={`unlock-${place}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a real page of the guide, rendered from the sold PDF */}
      <img src="/assets/samples/guide-p05.jpg" alt="A page of The Complete Crew Guide: four crew member cards with what each one does, what helps it and what to say to your kid" width={1020} height={1320} loading="lazy" />
      <div>
        <span className="kick">unlock all {n}</span>
        <h2 id={`unlock-${place}`}>The Complete Crew Guide comes with the Toolkit.</h2>
        <p>Every grey silhouette below is a crew member in the guide: one card each, what it does, what helps it, what throws it off, and what to say to your kid. 74 pages, and it arrives in the same email as your Toolkit.</p>
        <a className="btn btn-main" href={`/checkout/guide?utm_source=crew-${place}`}>Get the Toolkit · {usd(ITEMS.guide.price)}</a>
        <p className="fine">One download, one payment: the Toolkit, the 30-Day Reset, the Science Edition, the Complete Crew Guide and the printable bonuses.</p>
      </div>
    </aside>
  );
}

export default function Page() {
  const codes = [...new Set(PUBLIC_CHARACTERS.map((c) => c.group ?? ""))];
  const groups = codes.map((code) => {
    const chars = PUBLIC_CHARACTERS.filter((c) => (c.group ?? "") === code);
    return {
      key: `group-${code || "crew"}`,
      title: groupTitle(code || undefined),
      open: sortByWave(chars.filter(isUnlocked)),
      locked: chars.filter((c) => !isUnlocked(c)),
    };
  });
  const linked = PUBLIC_CHARACTERS.filter((c) => c.published && isUnlocked(c)).map((c) => ({ path: characterPath(c), name: `${c.name}: ${c.real}` }));

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
            {` ${counts.free} are open to read here. The other ${counts.locked} are in The Complete Crew Guide, which comes with the Toolkit.`}
          </p>
          <UnlockBox place="top" />
          <CrewFilters counts={counts} />
          <div id="crew-list">
            {groups.map((g) => (
              <div key={g.key} className="learn-block pack-block" id={g.key}>
                <div className="pack-head">
                  <h2>{g.title}</h2>
                  <p className="pack-meta">{g.open.length} open · {g.locked.length} in the guide</p>
                </div>
                {g.open.length ? <ul className="hub-grid crew-grid">{g.open.map((c) => <CrewCard key={c.slug} c={c} />)}</ul> : null}
                {g.locked.length ? <ul className="locked-grid" aria-label={`${g.locked.length} locked crew members in ${g.title}`}>{g.locked.map((c) => <LockedCard key={c.slug} c={c} />)}</ul> : null}
              </div>
            ))}
          </div>
          <UnlockBox place="bottom" />
          <p className="fine hub-note">
            Educational content only, not medical advice. See <a href="/learn">all guides</a> or the <a href="/glossary">glossary</a>.
          </p>
        </div>
      </section>
    </LearnShell>
  );
}
