import type { LearnEntry } from "@/content/learn";
import { SECTION_BY_KEY, pathOf } from "@/content/learn";
import { CHARS, SECTION_LABEL, charOf, formatDate } from "@/lib/learn";
import { articleLd, breadcrumbLd, faqLd, type Crumb } from "@/lib/jsonld";
import Breadcrumbs from "./Breadcrumbs";
import CharArt from "./CharArt";
import DataTable from "./DataTable";
import FaqList from "./FaqList";
import JsonLd from "./JsonLd";
import LearnShell from "./LearnShell";
import MythVerdict from "./MythVerdict";
import PediatricianBox from "./PediatricianBox";
import RelatedCards from "./RelatedCards";
import SayThis from "./SayThis";
import SourceList from "./SourceList";
import Text from "./Text";
import ToolkitCta from "./ToolkitCta";

export const DISCLAIMER =
  "Educational content only, built on everyday habits. It’s not medical advice, a diagnosis or a treatment. If something about your child’s sleep, mood, growth or behavior worries you, talk to your pediatrician.";

export default function EntryArticle({ entry: e }: { entry: LearnEntry }) {
  const char = charOf(e);
  const color = CHARS[char].color;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: SECTION_LABEL[e.section], path: `/${e.section}` },
    { name: e.h1 },
  ];
  const section = SECTION_BY_KEY[e.section];

  return (
    <LearnShell>
      <JsonLd data={[articleLd(e), breadcrumbLd(crumbs.map((c, i) => (i === crumbs.length - 1 ? { name: c.name, path: pathOf(e) } : c))), faqLd(e.faqs)]} />
      <div className="learn-sheet s-white" data-c={color} style={{ "--c": color } as React.CSSProperties}>
        <article className="article" data-section={section.key}>
          <Breadcrumbs crumbs={crumbs} />
          <p className="meta">
            {e.kicker}
            {e.teenOnly ? <span className="teen-badge">Teens 13–17</span> : null}
          </p>
          <h1>{e.h1}</h1>
          <p className="dek"><Text>{e.answer}</Text></p>
          <p className="byline">
            Updated <time dateTime={e.updated}>{formatDate(e.updated)}</time> · Little Brain Crew editorial team ·{" "}
            <a href="/editorial-policy">How we write</a>
          </p>

          {e.char || e.charCaption || e.kidVersion ? (
            <div className="figure">
              <CharArt char={char} mood="happy" />
              <div className="figure-text">
                {e.charCaption ? <p className="figure-cap"><Text>{e.charCaption}</Text></p> : null}
                {e.kidVersion ? <p><span className="kid-say">Say it to your kid</span><Text>{e.kidVersion}</Text></p> : null}
              </div>
            </div>
          ) : null}

          {e.sections.map((b) => (
            <section key={b.h2}>
              <h2>{b.h2}</h2>
              {b.paras.map((p, i) => <p key={i}><Text>{p}</Text></p>)}
              {b.bullets?.length ? <ul className="learn-list">{b.bullets.map((x, i) => <li key={i}><Text>{x}</Text></li>)}</ul> : null}
            </section>
          ))}

          {e.myth ? <MythVerdict myth={e.myth} /> : null}
          {e.table ? <DataTable table={e.table} /> : null}

          {e.atHome?.length ? (
            <section>
              <h2>What you’ll see at home</h2>
              <ul className="learn-list">{e.atHome.map((x, i) => <li key={i}><Text>{x}</Text></li>)}</ul>
            </section>
          ) : null}

          {e.tryTonight?.length ? (
            <section>
              <h2>Try tonight</h2>
              <ol className="steps">{e.tryTonight.map((x, i) => <li key={i}><Text>{x}</Text></li>)}</ol>
            </section>
          ) : null}

          {e.whatToSay?.length ? (
            <section>
              <h2>What to say</h2>
              <SayThis pairs={e.whatToSay} />
            </section>
          ) : null}

          <PediatricianBox>{e.whenToTalk}</PediatricianBox>
          <ToolkitCta />

          <section>
            <h2>Questions parents ask</h2>
            <FaqList faqs={e.faqs} />
          </section>

          <RelatedCards paths={e.related} />

          <section>
            <h2>Sources</h2>
            <SourceList keys={e.sources} />
          </section>

          <p className="fine disclaimer">{DISCLAIMER}</p>
        </article>
      </div>
    </LearnShell>
  );
}
