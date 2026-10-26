import CharArt from "./CharArt";
import { CHARS, resolvePath } from "@/lib/learn";

/** Cards for related pages. Paths that do not exist yet are left out, so no card is a dead link. */
export default function RelatedCards({ paths, heading = "Keep reading" }: { paths: string[]; heading?: string }) {
  const refs = paths.map(resolvePath).filter((r) => r !== undefined);
  if (refs.length === 0) return null;
  return (
    <section aria-labelledby="related-h">
      <h2 id="related-h">{heading}</h2>
      <ul className="rel-grid">
        {refs.map((r) => (
          <li key={r.path} style={{ "--c": r.char ? CHARS[r.char].color : "var(--dopa)" } as React.CSSProperties}>
            <a href={r.path}>
              {r.char ? <CharArt char={r.char} mood="happy" /> : <span className="rel-dot" aria-hidden="true">→</span>}
              <span><b>{r.title}</b>{r.blurb ? <small>{r.blurb}</small> : null}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
