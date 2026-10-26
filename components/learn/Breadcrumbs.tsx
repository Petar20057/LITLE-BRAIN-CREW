import type { Crumb } from "@/lib/jsonld";

/** Visible breadcrumb trail. The last crumb is the current page. Plain links: each page load starts the design scripts fresh. */
export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.name}>
              {c.path && !last ? <a href={c.path}>{c.name}</a> : <span aria-current={last ? "page" : undefined}>{c.name}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
