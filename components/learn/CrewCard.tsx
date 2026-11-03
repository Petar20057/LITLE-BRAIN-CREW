import type { CharKey } from "@/content/learn";
import { ageLabel, packLabel, type PublicCharacter } from "@/lib/character-rules";
import { characterPath } from "@/lib/characters";
import CharArt from "./CharArt";

/** A character's face: inline art for the first 26, an SVG file for the rest, a blank for one with no art yet.
 *  `silhouette` draws it as a dark shape (locked characters). */
export function CrewFace({ c, silhouette = false }: { c: Pick<PublicCharacter, "artKey" | "artFile" | "name" | "real">; silhouette?: boolean }) {
  const inner = c.artKey ? (
    <CharArt char={c.artKey as CharKey} mood="happy" />
  ) : c.artFile ? (
    // eslint-disable-next-line @next/next/no-img-element -- a static SVG under public/, no optimisation needed
    <img src={c.artFile} alt={silhouette ? "" : `${c.name} (${c.real})`} width={72} height={72} loading="lazy" />
  ) : (
    <span className="crew-blank" aria-hidden="true">?</span>
  );
  return <span className={`crew-face${silhouette ? " is-silhouette" : ""}`}>{inner}</span>;
}

/** One card on /crew and in "More in the pack": always public (face or silhouette, name, one sentence). */
export default function CrewCard({ c }: { c: PublicCharacter }) {
  const locked = c.access === "locked";
  const tag = !c.published ? (
    <em className="lock-tag soon">Coming</em>
  ) : locked ? (
    <em className="lock-tag">Club · {packLabel(c.pack)}</em>
  ) : c.sample ? (
    <em className="lock-tag free">Free sample</em>
  ) : null;
  return (
    <li
      className={locked ? "is-locked" : "is-free"}
      data-access={c.access}
      data-pack={c.packSlug}
      style={{ "--c": c.color ?? "var(--dopa)" } as React.CSSProperties}
    >
      <a href={characterPath(c)}>
        <CrewFace c={c} silhouette={locked} />
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
