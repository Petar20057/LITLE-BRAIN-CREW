import type { CharKey } from "@/content/learn";
import { ageLabel, isUnlocked, type PublicCharacter } from "@/lib/character-rules";
import { characterPath } from "@/lib/characters";
import CharArt from "./CharArt";

/** A character's face: inline art for the first 26, an SVG file for the rest, a generic shape for one with no art yet.
 *  `locked` draws the real art in black and white with no name in its alt text (locked characters). */
export function CrewFace({ c, locked = false }: { c: Pick<PublicCharacter, "artKey" | "artFile" | "name" | "real">; locked?: boolean }) {
  const inner = c.artKey ? (
    <CharArt char={c.artKey as CharKey} mood="happy" />
  ) : c.artFile ? (
    // eslint-disable-next-line @next/next/no-img-element -- a static SVG under public/, no optimisation needed
    <img src={c.artFile} alt={locked ? "" : `${c.name} (${c.real})`} width={72} height={72} loading="lazy" />
  ) : locked ? (
    <svg className="crew-blank generic" viewBox="0 0 120 120" aria-hidden="true"><path d="M60 14c-26 0-42 18-42 42 0 12 5 22 12 30-8 4-14 11-14 20h88c0-9-6-16-14-20 7-8 12-18 12-30 0-24-16-42-42-42z" fill="#333" /></svg>
  ) : (
    <span className="crew-blank" aria-hidden="true">?</span>
  );
  return <span className={`crew-face${locked ? " is-locked-art" : ""}`}>{inner}</span>;
}

/** A locked crew member on /crew: the same card as an open one, but the art is black and white and a padlock stands
 *  where the name and the sentence would be (2026-11-08, Luka). The click goes to the Toolkit checkout, because the
 *  Complete Crew Guide (all 214, one card each) arrives in the same email as the Toolkit. */
export function LockedCard({ c }: { c: PublicCharacter }) {
  return (
    <li className="is-locked" data-access="locked">
      <a href="/checkout/guide?utm_source=crew" aria-label="A locked crew member. Unlock all 214 with The Kid Brain Toolkit.">
        <CrewFace c={c} locked />
        <span className="lock-slot" aria-hidden="true"><svg><use href="#i-lock" /></svg></span>
      </a>
    </li>
  );
}

/** One open card on /crew and in "More of the crew": face, name, one sentence. */
export default function CrewCard({ c }: { c: PublicCharacter }) {
  if (!isUnlocked(c)) return <LockedCard c={c} />;
  const tag = c.published && c.sample ? <em className="lock-tag free">Free sample</em> : null;
  return (
    <li className="is-free" data-access="free" style={{ "--c": c.color ?? "var(--dopa)" } as React.CSSProperties}>
      <a href={characterPath(c)}>
        <CrewFace c={c} />
        <span>
          <b>{c.name}</b>
          <small className="crew-real">{c.real}</small>
          <small>{c.sentence}</small>
          {tag}
          {c.ageFlag ? <em className="teen-badge">{ageLabel(c.ageFlag)}</em> : null}
        </span>
      </a>
    </li>
  );
}
