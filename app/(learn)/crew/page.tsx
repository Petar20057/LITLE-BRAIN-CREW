import Breadcrumbs from "@/components/learn/Breadcrumbs";
import CrewCard from "@/components/learn/CrewCard";
import CrewFilters from "@/components/learn/CrewFilters";
import JsonLd from "@/components/learn/JsonLd";
import LearnShell from "@/components/learn/LearnShell";
import { PACK_PRICE, countsOf, groupTitle, sortByWave } from "@/lib/character-rules";
import { PACKS, PUBLIC_CHARACTERS, characterPath } from "@/lib/characters";
import { usd } from "@/lib/funnel";
import { breadcrumbLd, collectionLd, itemListLd } from "@/lib/jsonld";
import { simpleMetadata } from "@/lib/seo";

export const instant = false;

// Every character, grouped: the free core crew by kind, then one block per pack. The cards are public (a locked
// character shows its silhouette, name and one sentence); the filters (All / Free / Locked / pack) only hide cards.
const n = PUBLIC_CHARACTERS.length;
const TITLE = `Meet the crew: ${n} characters inside your kid’s brain`;
const DESCRIPTION =
  "Brain chemicals, brain parts, habits, foods and one character for every age. Who they are, what each one does, and which ones are free.";

export const metadata = simpleMetadata({ metaTitle: "Meet the Crew: Kids’ Brain Characters", description: DESCRIPTION, path: "/crew" });

export default function Page() {
  const core = PUBLIC_CHARACTERS.filter((c) => !c.packSlug);
  const coreGroups = [...new Set(core.map((c) => c.group ?? ""))].map((group) => ({
    key: `group-${group || "crew"}`,
    title: groupTitle(group || undefined),
    note: "",
    chars: core.filter((c) => (c.group ?? "") === group),
  }));
  const packGroups = PACKS.map((p) => ({
    key: `pack-${p.slug}`,
    title: p.name,
    note: p.onSale ? `${p.total} characters · ${usd(PACK_PRICE)}, yours forever, or in the Crew Club` : `${p.ready} of ${p.total} characters ready · coming to the Club`,
    chars: sortByWave(PUBLIC_CHARACTERS.filter((c) => c.packSlug === p.slug)),
  }));
  const groups = [...coreGroups, ...packGroups];
  const linked = PUBLIC_CHARACTERS.filter((c) => c.published).map((c) => ({ path: characterPath(c), name: `${c.name}: ${c.real}` }));

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
            {PACKS.length ? " The free ones are open to everyone; the rest unlock with the Crew Club or their pack." : ""}
          </p>
          <CrewFilters packs={PACKS.map((p) => ({ slug: p.slug, name: p.name, total: p.total }))} counts={countsOf(PUBLIC_CHARACTERS)} />
          <div id="crew-list">
            {groups.map((g) => (
              <div key={g.key} className="learn-block pack-block" id={g.key}>
                <div className="pack-head">
                  <h2>{g.title}</h2>
                  {g.note ? <p className="pack-meta">{g.note}</p> : null}
                </div>
                <ul className="hub-grid crew-grid">{g.chars.map((c) => <CrewCard key={c.slug} c={c} />)}</ul>
              </div>
            ))}
          </div>
          <p className="fine hub-note">
            Educational content only, not medical advice. See <a href="/learn">all guides</a> or the <a href="/glossary">glossary</a>.
          </p>
        </div>
      </section>
    </LearnShell>
  );
}
