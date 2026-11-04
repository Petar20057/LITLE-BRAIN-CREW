import type { CharKey } from "@/content/learn";
import { ageLabel, groupTitle, isUnlocked, isUrl, paragraphs, parseSayPairs, sortByWave, splitReference, type Character } from "@/lib/character-rules";
import { SOURCE_BY_KEY } from "@/content/learn";
import { PUBLIC_CHARACTERS, characterPath } from "@/lib/characters";
import { breadcrumbLd, webPageLd, type Crumb } from "@/lib/jsonld";
import { charPage } from "@/lib/learn";
import Breadcrumbs from "./Breadcrumbs";
import CrewCard, { CrewFace } from "./CrewCard";
import { DISCLAIMER } from "./EntryArticle";
import JsonLd from "./JsonLd";
import LearnShell from "./LearnShell";
import PediatricianBox from "./PediatricianBox";
import SayThis from "./SayThis";
import TellMeForm from "./TellMeForm";
import Text from "./Text";

// One open character's page (/crew/<slug>): the card, the short answer, the written page (explanation, "What to say",
// printable, cartoon when they exist), "When to talk to your pediatrician" and safety. A locked character has no page
// (app/(learn)/crew/[slug] answers 404): it is a silhouette on /crew and a card in the Complete Crew Guide PDF.
// An unpublished open character shows only the card and "Tell me when it's ready".

/** Paragraphs; a paragraph that starts with "## " is a sub-heading. */
const Paras = ({ text }: { text: string | undefined }) =>
  paragraphs(text).map((p, i) => (p.startsWith("## ") ? <h3 key={i}>{p.slice(3)}</h3> : <p key={i}><Text>{p}</Text></p>));

function WhatToSay({ text }: { text: string }) {
  const pairs = parseSayPairs(text);
  return pairs ? <SayThis pairs={pairs} /> : <Paras text={text} />;
}

function Sources({ sources }: { sources: string[] }) {
  const refs = sources.map((s) => {
    const known = SOURCE_BY_KEY[s];
    return known ? { title: known.title, url: known.url } : splitReference(s);
  });
  return (
    <section aria-labelledby="src-h">
      <h2 id="src-h">Sources</h2>
      <ol className="sources">
        {refs.map((r, i) => (
          <li key={i}>{r.title}{r.url ? <> <a href={r.url} rel="noopener">{r.url.replace(/^https?:\/\//, "")}</a></> : null}</li>
        ))}
      </ol>
    </section>
  );
}

function FullContent({ c }: { c: Character }) {
  const l = c.locked;
  return (
    <>
      {l.explanation ? <section><h2>What’s going on</h2><Paras text={l.explanation} /></section> : null}
      {l.whatToSay ? <section><h2>What to say</h2><WhatToSay text={l.whatToSay} /></section> : null}
      {l.print ? (
        <section>
          <h2>Print it</h2>
          {isUrl(l.print) ? <p><a className="btn" href={l.print}>Download the printable</a></p> : <Paras text={l.print} />}
        </section>
      ) : null}
      {l.cartoon ? (
        <section>
          <h2>Watch the cartoon</h2>
          {isUrl(l.cartoon) ? <p><a className="btn" href={l.cartoon}>Watch the cartoon</a></p> : <Paras text={l.cartoon} />}
        </section>
      ) : null}
    </>
  );
}

export default function CharacterPage({ c }: { c: Character }) {
  const color = c.color ?? "var(--dopa)";
  const path = characterPath(c);
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Meet the crew", path: "/crew" }, { name: c.name }];
  const kicker = [groupTitle(c.group), c.real].filter(Boolean).join(" · ");
  const age = ageLabel(c.ageFlag);
  const deep = c.artKey ? charPage(c.artKey as CharKey) : undefined;
  const siblings = sortByWave(PUBLIC_CHARACTERS.filter((s) => s.slug !== c.slug && s.group === c.group && isUnlocked(s))).slice(0, 6);

  return (
    <LearnShell>
      <JsonLd
        data={[
          webPageLd({ path, name: `${c.name}: ${c.real}`, description: c.sentence }),
          breadcrumbLd(crumbs.map((x, i) => (i === crumbs.length - 1 ? { name: x.name, path } : x))),
        ]}
      />
      <div className="learn-sheet s-white" data-c={color} style={{ "--c": color } as React.CSSProperties}>
        <article className="article character" data-access="free">
          <Breadcrumbs crumbs={crumbs} />
          <p className="meta">
            {kicker}
            {!c.published ? <span className="lock-tag soon">Coming</span> : <span className="lock-tag free">Free</span>}
            {age ? <span className="teen-badge">{age}</span> : null}
          </p>
          <h1>{c.name}</h1>
          <p className="dek"><Text>{c.sentence}</Text></p>
          <div className="figure">
            <CrewFace c={c} />
            <div className="figure-text">
              <p className="figure-cap">{c.name}: {c.real}</p>
              {c.kidVersion && c.published ? <p><span className="kid-say">Say it to your kid</span><Text>{c.kidVersion}</Text></p> : null}
            </div>
          </div>

          {!c.published ? (
            <aside className="lock-box coming" aria-labelledby="soon-h">
              <h2 id="soon-h">Coming soon, free</h2>
              <p>{c.name} isn’t finished yet. Leave your email and we’ll tell you the moment it’s ready. Until then, {c.name}’s card is in The Complete Crew Guide, which comes with the Toolkit.</p>
              <TellMeForm details={{ character: c.slug }} />
            </aside>
          ) : (
            <>
              {c.shortAnswer ? <section><h2>The short answer</h2><Paras text={c.shortAnswer} /></section> : null}
              <FullContent c={c} />
            </>
          )}

          {c.whenToTalk ? <PediatricianBox>{c.whenToTalk}</PediatricianBox> : null}
          {c.safety ? (
            <aside className="ped-box safety-box" aria-labelledby="safety-h">
              <h2 id="safety-h">Safety first</h2>
              <Paras text={c.safety} />
            </aside>
          ) : null}

          {c.sources?.length && c.published ? <Sources sources={c.sources} /> : null}

          {deep ? (
            <section>
              <h2>Read more</h2>
              <p><a href={deep.path}>{deep.title} →</a></p>
            </section>
          ) : null}

          {siblings.length ? (
            <section aria-labelledby="more-h">
              <h2 id="more-h">More of the crew</h2>
              <ul className="hub-grid crew-grid">{siblings.map((s) => <CrewCard key={s.slug} c={s} />)}</ul>
              <p><a href="/crew">See the whole crew →</a></p>
            </section>
          ) : null}

          <p className="fine disclaimer">{DISCLAIMER}</p>
        </article>
      </div>
    </LearnShell>
  );
}
