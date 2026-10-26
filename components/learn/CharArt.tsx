import { CHARS, artOf, type Mood } from "@/lib/learn";
import type { CharKey } from "@/content/learn";

/** A character drawn on the server (content/art.json). Announced as "Dopa (Dopamine)". */
export default function CharArt({ char, mood = "main", className = "" }: { char: CharKey; mood?: Mood; className?: string }) {
  const c = CHARS[char];
  const label = `${c.name} (${c.real})`;
  return (
    <svg className={`ch ch-${char} ${className}`.trim()} viewBox="0 0 120 120" role="img" aria-label={label} focusable="false">
      <title>{label}</title>
      <g dangerouslySetInnerHTML={{ __html: artOf(char, mood) }} />
    </svg>
  );
}
