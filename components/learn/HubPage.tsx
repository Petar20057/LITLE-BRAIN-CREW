import type { Section } from "@/content/learn/sections.ts";
import { CHARS, SECTION_LABEL, charOf, entriesOf, sectionChar } from "@/lib/learn";
import { pathOf } from "@/content/learn";
import { breadcrumbLd, hubLd, type Crumb } from "@/lib/jsonld";
import Breadcrumbs from "./Breadcrumbs";
import CharArt from "./CharArt";
import JsonLd from "./JsonLd";
import LearnShell from "./LearnShell";

/** One card grid used by hubs and /learn. */
export function CardGrid({ items }: { items: { path: string; title: string; blurb?: string; char: import("@/content/learn").CharKey; teen?: boolean }[] }) {
  return (
    <ul className="hub-grid">
      {items.map((it) => (
        <li key={it.path} style={{ "--c": CHARS[it.char].color } as React.CSSProperties}>
          <a href={it.path}>
            <CharArt char={it.char} mood="happy" />
            <span>
              <b>{it.title}</b>
              {it.blurb ? <small>{it.blurb}</small> : null}
              {it.teen ? <em className="teen-badge">Teens 13–17</em> : null}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function HubPage({ section }: { section: Section }) {
  const entries = entriesOf(section.key);
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: SECTION_LABEL[section.key] }];
  const char = sectionChar(section.key);
  return (
    <LearnShell>
      <JsonLd
        data={[
          ...hubLd(section, entries.map((e) => ({ path: pathOf(e), name: e.h1 }))),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: SECTION_LABEL[section.key], path: `/${section.key}` }]),
        ]}
      />
      <section className="sec s-white learn-hub" data-c={CHARS[char].color}>
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <span className="kick">{section.kicker}</span>
          <h1>{section.h1}</h1>
          <p className="lede">{section.intro}</p>
          <CardGrid
            items={entries.map((e) => ({ path: pathOf(e), title: e.h1, blurb: e.description, char: charOf(e), teen: e.teenOnly }))}
          />
          <p className="fine hub-note">
            Educational content only, not medical advice. New pages are added as we write them. <a href="/learn">All guides</a> ·{" "}
            <a href="/crew">Meet the crew</a>
          </p>
        </div>
      </section>
    </LearnShell>
  );
}
