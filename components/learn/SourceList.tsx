import { SOURCE_BY_KEY } from "@/content/learn";
import type { SourceKey } from "@/content/learn";

/** Numbered sources. Linked when the source has a URL. */
export default function SourceList({ keys }: { keys: SourceKey[] }) {
  const sources = keys.map((k) => SOURCE_BY_KEY[k]).filter(Boolean);
  return (
    <ol className="src sources">
      {sources.map((s) => (
        <li key={s.key} id={`src-${s.key}`}>
          {s.url ? <a href={s.url} rel="noopener" target="_blank">{s.title}</a> : s.title}
        </li>
      ))}
    </ol>
  );
}
