import { signOut } from "@/app/(admin)/admin/actions";
import { RANGES, num } from "@/lib/admin";

// Building blocks of the /admin pages: header with tabs and date range, number tiles, a daily bar chart and
// ranked tables. Server components, no client JS: the bar chart's hover text is the SVG <title>.

const TABS = [
  { href: "/admin", label: "Traffic" },
  { href: "/admin/newsletter", label: "Newsletter & forms" },
  { href: "/admin/quiz", label: "Quiz /code" },
  { href: "/admin/members", label: "Crew Club" },
] as const;

export function AdminHeader({ tab, days, email, query = "" }: { tab: (typeof TABS)[number]["href"]; days?: number; email: string; query?: string }) {
  return (
    <div className="adm-head">
      <nav className="adm-tabs" aria-label="Admin">
        {TABS.map((t) => (
          <a key={t.href} href={`${t.href}${days ? `?days=${days}` : ""}`} className={t.href === tab ? "on" : ""} aria-current={t.href === tab ? "page" : undefined}>{t.label}</a>
        ))}
      </nav>
      <div className="adm-bar">
        {days && (
          <p className="adm-range">
            Last{" "}
            {RANGES.map((d) => (
              <a key={d} className={d === days ? "on" : ""} href={`${tab}?days=${d}${query}`}>{d === 365 ? "year" : `${d} days`}</a>
            ))}
          </p>
        )}
        <form action={signOut} className="adm-who">
          <span>{email}</span>
          <button type="submit" className="adm-link">Sign out</button>
        </form>
      </div>
    </div>
  );
}

export function Tiles({ items }: { items: { label: string; value: string | number; note?: string }[] }) {
  return (
    <div className="adm-tiles">
      {items.map((t) => (
        <div key={t.label} className="adm-tile">
          <span>{t.label}</span>
          <b>{typeof t.value === "number" ? num(t.value) : t.value}</b>
          {t.note && <small>{t.note}</small>}
        </div>
      ))}
    </div>
  );
}

/** One bar per day for the whole range (days without data show as empty), with the total on hover. */
export function DailyBars({ title, days, rows }: { title: string; days: number; rows: { day: string; value: number }[] }) {
  const byDay = new Map(rows.map((r) => [r.day, r.value]));
  const today = new Date();
  const list = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (days - 1 - i)));
    const key = d.toISOString().slice(0, 10);
    return { key, value: byDay.get(key) ?? 0 };
  });
  const peak = Math.max(0, ...list.map((d) => d.value));
  const max = Math.max(1, peak);
  const W = 1000, H = 220, pad = 24, gap = 2;
  const bw = (W - gap * (list.length - 1)) / list.length;
  const fmt = (k: string) => new Date(`${k}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <figure className="adm-chart">
      <figcaption>{title} <small>· best day {num(peak)}</small></figcaption>
      <svg viewBox={`0 0 ${W} ${H + pad}`} role="img" aria-label={`${title}, ${list.length} days`} preserveAspectRatio="none">
        <line x1="0" x2={W} y1={H} y2={H} className="adm-axis" />
        {list.map((d, i) => {
          const h = d.value ? Math.max(4, (d.value / max) * (H - 8)) : 0;
          return (
            <g key={d.key} className="adm-barg">
              <rect x={i * (bw + gap)} y={0} width={bw} height={H} className="adm-hit" />
              {h > 0 && <rect x={i * (bw + gap)} y={H - h} width={bw} height={h} rx={Math.min(4, bw / 2)} className="adm-barfill" />}
              <title>{`${fmt(d.key)}: ${num(d.value)}`}</title>
            </g>
          );
        })}
      </svg>
      <div className="adm-chart-x"><span>{fmt(list[0].key)}</span><span>{fmt(list[list.length - 1].key)}</span></div>
    </figure>
  );
}

/** A ranked list with a bar behind each count, for top pages, referrers, sources… */
export function TopTable({ title, rows, cols = ["Views", "Visitors"], empty = "Nothing yet." }: { title: string; rows: { label: string; values: number[] }[]; cols?: string[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.values[0] ?? 0));
  return (
    <div className="table-wrap adm-top">
      <table className="learn-table">
        <caption>{title}</caption>
        {rows.length > 0 && (
          <thead>
            <tr><th scope="col"></th>{cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
          </thead>
        )}
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length + 1}>{empty}</td></tr>}
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" style={{ "--w": `${((r.values[0] ?? 0) / max) * 100}%` } as React.CSSProperties}>{r.label}</th>
              {r.values.map((v, i) => <td key={i}>{num(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
