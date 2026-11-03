import { Suspense } from "react";
import type { CharKey } from "@/content/learn";
import { CLUB_OPEN, PACK_CHECKOUT_OPEN, PACK_PRICE, ageLabel, canRead, groupTitle, isUrl, packLabel, paragraphs, parseSayPairs, sortByWave, splitReference, type Character, type Pack } from "@/lib/character-rules";
import { SOURCE_BY_KEY } from "@/content/learn";
import { PUBLIC_CHARACTERS, characterPath, packAt } from "@/lib/characters";
import { ITEMS, usd } from "@/lib/funnel";
import { breadcrumbLd, webPageLd, type Crumb } from "@/lib/jsonld";
import { charPage } from "@/lib/learn";
import { currentViewer } from "@/lib/viewer";
import Breadcrumbs from "./Breadcrumbs";
import CrewCard, { CrewFace } from "./CrewCard";
import { DISCLAIMER } from "./EntryArticle";
import JsonLd from "./JsonLd";
import LearnShell from "./LearnShell";
import PediatricianBox from "./PediatricianBox";
import SayThis from "./SayThis";
import TellMeForm from "./TellMeForm";
import Text from "./Text";

// One character's page (/crew/<slug>). Public for everyone: the card, the short answer, "When to talk to your
// pediatrician" and safety. A locked character's explanation, "What to say", printable and cartoon render only
// inside <Suspense> after lib/viewer.ts has checked the reader (Crew Club or the pack), so that text never reaches
// a browser without the right. An unpublished character shows only the card and "Tell me when it's ready".

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

function LockBox({ c, pack }: { c: Character; pack: Pack | undefined }) {
  return (
    <aside className="lock-box" aria-labelledby="lock-h">
      <h2 id="lock-h">Unlock {c.name}</h2>
      <p>
        The full explanation, what to say, the printable and the cartoon are for Crew Club members
        {pack ? ` and everyone who has the ${packLabel(pack.name)}` : ""}.
      </p>
      <ul>
        <li>
          <b>The Crew Club</b>
          <span>{usd(ITEMS.clubMonthly.price)} a month or {usd(ITEMS.clubYearly.price)} a year. Every character and every pack, as they come.</span>
          <a className="btn btn-main" href={CLUB_OPEN ? "/checkout/club" : "/pricing#club"}>{CLUB_OPEN ? "Join the Crew Club" : "Join the Club waitlist"}</a>
        </li>
        {pack ? (
          <li>
            <b>{packLabel(pack.name)}</b>
            <span>
              {usd(PACK_PRICE)}, yours forever. {pack.onSale ? `All ${pack.total} characters are ready.` : `${pack.ready} of ${pack.total} characters ready.`}
            </span>
            {pack.onSale && PACK_CHECKOUT_OPEN ? (
              <a className="btn" href={`/checkout/pack/${pack.slug}`}>Get the {packLabel(pack.name)}</a>
            ) : (
              <TellMeForm details={{ character: c.slug, pack: pack.slug }} />
            )}
          </li>
        ) : null}
      </ul>
    </aside>
  );
}

async function Unlocked({ c, pack }: { c: Character; pack: Pack | undefined }) {
  const viewer = await currentViewer();
  return canRead(c, viewer) ? <FullContent c={c} /> : <LockBox c={c} pack={pack} />;
}

async function Face({ c }: { c: Character }) {
  const viewer = await currentViewer();
  return <CrewFace c={c} silhouette={!canRead(c, viewer)} />;
}

export default function CharacterPage({ c }: { c: Character }) {
  const pack = c.packSlug ? packAt(c.packSlug) : undefined;
  const color = c.color ?? "var(--dopa)";
  const path = characterPath(c);
  const locked = c.access === "locked";
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Meet the crew", path: "/crew" }, { name: c.name }];
  const kicker = [pack?.name ?? groupTitle(c.group), c.real].filter(Boolean).join(" · ");
  const age = ageLabel(c.ageFlag);
  const deep = c.artKey ? charPage(c.artKey as CharKey) : undefined;
  const siblings = sortByWave(PUBLIC_CHARACTERS.filter((s) => s.slug !== c.slug && (pack ? s.packSlug === pack.slug : !s.packSlug && s.group === c.group))).slice(0, 6);

  const figure = (
    <div className="figure">
      {locked ? <Suspense fallback={<CrewFace c={c} silhouette />}><Face c={c} /></Suspense> : <CrewFace c={c} />}
      <div className="figure-text">
        <p className="figure-cap">{c.name}: {c.real}</p>
        {c.kidVersion && c.published ? <p><span className="kid-say">Say it to your kid</span><Text>{c.kidVersion}</Text></p> : null}
        {pack ? <p>Part of the {packLabel(pack.name)}{pack.onSale ? "" : `, ${pack.ready} of ${pack.total} characters ready`}.</p> : null}
      </div>
    </div>
  );

  return (
    <LearnShell>
      <JsonLd
        data={[
          webPageLd({ path, name: `${c.name}: ${c.real}`, description: c.sentence }),
          breadcrumbLd(crumbs.map((x, i) => (i === crumbs.length - 1 ? { name: x.name, path } : x))),
        ]}
      />
      <div className="learn-sheet s-white" data-c={color} style={{ "--c": color } as React.CSSProperties}>
        <article className={`article character${locked ? " is-locked" : ""}`} data-access={c.access}>
          <Breadcrumbs crumbs={crumbs} />
          <p className="meta">
            {kicker}
            {!c.published ? <span className="lock-tag soon">Coming</span> : locked ? <span className="lock-tag">Club · pack</span> : <span className="lock-tag free">Free</span>}
            {age ? <span className="teen-badge">{age}</span> : null}
          </p>
          <h1>{c.name}</h1>
          <p className="dek"><Text>{c.sentence}</Text></p>
          {figure}

          {!c.published ? (
            <aside className="lock-box coming" aria-labelledby="soon-h">
              <h2 id="soon-h">{locked ? "Coming to the Club" : "Coming soon, free"}</h2>
              <p>{c.name} isn’t finished yet. Leave your email and we’ll tell you the moment it’s ready.</p>
              <TellMeForm details={{ character: c.slug, ...(pack ? { pack: pack.slug } : {}) }} />
            </aside>
          ) : (
            <>
              {c.shortAnswer ? <section><h2>The short answer</h2><Paras text={c.shortAnswer} /></section> : null}
              {locked ? <Suspense fallback={<LockBox c={c} pack={pack} />}><Unlocked c={c} pack={pack} /></Suspense> : <FullContent c={c} />}
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
              <h2 id="more-h">{pack ? `More in the ${packLabel(pack.name)}` : "More of the crew"}</h2>
              <ul className="hub-grid crew-grid">{siblings.map((s) => <CrewCard key={s.slug} c={s} />)}</ul>
              <p><a href={pack ? `/crew#pack-${pack.slug}` : "/crew"}>See the whole crew →</a></p>
            </section>
          ) : null}

          <p className="fine disclaimer">{DISCLAIMER}</p>
        </article>
      </div>
    </LearnShell>
  );
}
