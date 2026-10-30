import { AdminHeader, TopTable } from "@/components/admin/Admin";
import { num, pct, rangeFrom, requireAdmin } from "@/lib/admin";
import { looseAdmin } from "@/lib/supabase/loose";

// Journey: where visits come from, how far they get toward paying, and where on the site they stop.
// Data: page_views and funnel_events through funnel_by, page_engagement and section_reach
// (supabase/migrations/20261030120000_attribution_engagement_experiments.sql).

export const metadata = { title: "Journey · Admin" };
// Reads the sign-in cookie and live numbers on every request.
export const instant = false;

const DIMS = [
  { key: "source", label: "UTM source" },
  { key: "content", label: "Video / post" },
  { key: "app", label: "App browser" },
  { key: "referrer", label: "Referrer" },
  { key: "landing", label: "Landing page" },
  { key: "device", label: "Device" },
] as const;

type FunnelRow = { label: string; visits: number; buy_clicks: number; checkouts: number; pay_clicks: number; purchases: number; revenue_cents: number };
type PageRow = { path: string; views: number; visitors: number; median_seconds: number | null; avg_scroll: number | null; exits: number };
type SectionRow = { path: string; section: string; visits: number; page_visits: number };

const usdCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const seconds = (s: number | null) => (s === null ? "–" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`);

export default async function Page({ searchParams }: PageProps<"/admin/journey">) {
  const { email } = await requireAdmin();
  const params = await searchParams;
  const { days, since } = rangeFrom(params.days);
  const dim = DIMS.find((d) => d.key === params.by) ?? DIMS[0];

  const db = looseAdmin();
  const [funnel, pages, sections] = await Promise.all([
    db.rpc("funnel_by", { since, dim: dim.key }),
    db.rpc("page_engagement", { since }),
    db.rpc("section_reach", { since }),
  ]);
  const failed = funnel.error ?? pages.error ?? sections.error;
  if (failed) {
    console.error("[admin journey]", failed);
    return <p className="fx-card">Couldn’t read the numbers. Is supabase/migrations/20261030120000_attribution_engagement_experiments.sql applied?</p>;
  }
  const rows = ((funnel.data ?? []) as FunnelRow[]).map((r) => ({
    label: r.label,
    visits: Number(r.visits),
    buy: Number(r.buy_clicks),
    checkout: Number(r.checkouts),
    pay: Number(r.pay_clicks),
    bought: Number(r.purchases),
    cents: Number(r.revenue_cents),
  }));
  const pageRows = (pages.data ?? []) as PageRow[];
  const byPage = new Map<string, SectionRow[]>();
  for (const s of (sections.data ?? []) as SectionRow[]) byPage.set(s.path, [...(byPage.get(s.path) ?? []), s]);

  return (
    <div className="adm-page">
      <AdminHeader tab="/admin/journey" days={days} email={email} query={`&by=${dim.key}`} />
      <h1>Journey</h1>

      <h2>Funnel by {dim.label.toLowerCase()}</h2>
      <p className="fx-sub">
        Group by:{" "}
        {DIMS.map((d, i) => (
          <span key={d.key}>
            {i > 0 && " · "}
            {d.key === dim.key ? <b>{d.label}</b> : <a className="link" href={`/admin/journey?days=${days}&by=${d.key}`}>{d.label}</a>}
          </span>
        ))}
      </p>
      <div className="table-wrap">
        <table className="learn-table">
          <caption>Each visit counts once, under where it started. The % under each step is how many of the step before made it. Sales show here from the day purchases started carrying the visit (2026-10-30).</caption>
          <thead>
            <tr><th scope="col"></th><th scope="col">Visits</th><th scope="col">Buy clicks</th><th scope="col">Checkouts</th><th scope="col">Pay clicks</th><th scope="col">Purchases</th><th scope="col">Revenue</th><th scope="col">$ per visit</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8}>Nothing yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td>{num(r.visits)}</td>
                <td>{num(r.buy)} <small>{pct(r.buy, r.visits)}</small></td>
                <td>{num(r.checkout)} <small>{pct(r.checkout, r.buy)}</small></td>
                <td>{num(r.pay)} <small>{pct(r.pay, r.checkout)}</small></td>
                <td>{num(r.bought)} <small>{pct(r.bought, r.pay)}</small></td>
                <td>{usdCents(r.cents)}</td>
                <td>{usdCents(r.cents / Math.max(1, r.visits))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Pages: time, scroll and exits</h2>
      <div className="table-wrap">
        <table className="learn-table">
          <caption>Time is how long the page was on screen (median). Scroll is how far down it got (average). Exit rate is the share of views that ended the visit.</caption>
          <thead>
            <tr><th scope="col">Page</th><th scope="col">Views</th><th scope="col">Visitors</th><th scope="col">Time</th><th scope="col">Scroll</th><th scope="col">Exits</th><th scope="col">Exit rate</th></tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && <tr><td colSpan={7}>Nothing yet.</td></tr>}
            {pageRows.map((p) => (
              <tr key={p.path}>
                <th scope="row">{p.path}</th>
                <td>{num(Number(p.views))}</td>
                <td>{num(Number(p.visitors))}</td>
                <td>{seconds(p.median_seconds === null ? null : Number(p.median_seconds))}</td>
                <td>{p.avg_scroll === null ? "–" : `${Number(p.avg_scroll)}%`}</td>
                <td>{num(Number(p.exits))}</td>
                <td>{pct(Number(p.exits), Number(p.views))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Where on the page people stop</h2>
      <p className="fx-sub">Share of the page’s visits that reached each section, most seen first (top of the page first, as a rule). A big drop between two sections is where to look first.</p>
      {byPage.size === 0 && <p className="fine">Nothing yet.</p>}
      <div className="adm-grid">
        {[...byPage].map(([path, list]) => (
          <TopTable
            key={path}
            title={path}
            rows={list.map((s) => ({ label: `${s.section} · ${pct(Number(s.visits), Number(s.page_visits))}`, values: [Number(s.visits)] }))}
            cols={["Visits"]}
          />
        ))}
      </div>
      <p className="fine">Counted by our own script, no cookies. Time and scroll come from a beacon sent when the page is hidden or left; some phones drop it, so those columns cover most views, not all.</p>
    </div>
  );
}
