import { AdminHeader, DailyBars, Tiles, TopTable } from "@/components/admin/Admin";
import { NEWSLETTER_FORMS } from "@/lib/analytics";
import { num, pct, rangeFrom, requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { looseAdmin } from "@/lib/supabase/loose";

// Traffic: who came to the site, from where, and what they looked at. Data: page_views
// (supabase/migrations/20261026170000_admin_analytics.sql), filled by components/Track.tsx.

export const metadata = { title: "Traffic · Admin" };
// Reads the sign-in cookie and live numbers on every request.
export const instant = false;

const BREAKDOWNS = [
  { kind: "page", title: "Top pages" },
  { kind: "landing", title: "Landing pages (first page of a visit)", cols: ["Visits", "Visitors"] },
  { kind: "referrer", title: "Sites that sent visitors" },
  { kind: "source", title: "UTM source" },
  { kind: "campaign", title: "UTM campaign" },
  { kind: "device", title: "Device" },
  { kind: "country", title: "Country" },
] as const;

export default async function Page({ searchParams }: PageProps<"/admin">) {
  const { email } = await requireAdmin();
  const { days, since } = rangeFrom((await searchParams).days);

  const db = createAdminClient();
  const [totals, daily, top, subscribers, quiz, funnel] = await Promise.all([
    db.rpc("traffic_totals", { since }),
    db.rpc("traffic_daily", { since }),
    db.rpc("traffic_top", { since }),
    db.rpc("newsletter_subscribers", { forms: NEWSLETTER_FORMS }),
    db.from("quiz_sessions").select("id", { count: "exact", head: true }).gte("started_at", since),
    looseAdmin().rpc("funnel_daily", { since }),
  ]);
  if (funnel.error) console.error("[admin funnel]", funnel.error);
  const failed = totals.error ?? daily.error ?? top.error ?? subscribers.error;
  if (failed) {
    console.error("[admin traffic]", failed);
    return <p className="fx-card">Couldn’t read the numbers. Is supabase/migrations/20261026170000_admin_analytics.sql applied?</p>;
  }

  const t = totals.data?.[0] ?? { views: 0, visitors: 0, sessions: 0, bounced: 0, returning_visitors: 0 };
  const rows = (kind: string) => (top.data ?? []).filter((r) => r.kind === kind).map((r) => ({ label: r.label, values: [Number(r.views), Number(r.visitors)] }));

  return (
    <div className="adm-page">
      <AdminHeader tab="/admin" days={days} email={email} />
      <h1>Traffic</h1>
      <Tiles
        items={[
          { label: "Visitors", value: Number(t.visitors), note: `${Number(t.returning_visitors)} came back from before` },
          { label: "Visits", value: Number(t.sessions), note: `${(Number(t.views) / Math.max(1, Number(t.sessions))).toFixed(1)} pages per visit` },
          { label: "Page views", value: Number(t.views) },
          { label: "Left after one page", value: pct(Number(t.bounced), Number(t.sessions)), note: "bounce rate" },
          { label: "Newsletter subscribers", value: Number(subscribers.data ?? 0), note: "all time, unique emails" },
          { label: "Quiz visits", value: quiz.count ?? 0, note: "/code, this period" },
        ]}
      />
      <DailyBars title={days > 90 ? "Visitors per day, last 90 days (UTC)" : "Visitors per day (UTC)"} days={Math.min(days, 90)} rows={(daily.data ?? []).map((d) => ({ day: d.day, value: Number(d.visitors) }))} />
      <h2>Purchase funnel per day</h2>
      {funnel.error ? (
        <p className="fx-card">Couldn’t read the funnel numbers. Is supabase/migrations/20261028120000_orders_and_funnel_events.sql applied?</p>
      ) : (
        <div className="table-wrap">
          <table className="learn-table">
            <caption>Visits → buy clicks → checkouts → purchases (UTC), newest first</caption>
            <thead>
              <tr><th scope="col">Day</th><th scope="col">Visits</th><th scope="col">Buy clicks</th><th scope="col">Checkouts</th><th scope="col">Purchases</th><th scope="col">$7 bump</th></tr>
            </thead>
            <tbody>
              {(funnel.data ?? []).length === 0 && <tr><td colSpan={6}>Nothing yet.</td></tr>}
              {[...(funnel.data ?? [])].reverse().map((r) => (
                <tr key={String(r.day)}>
                  <th scope="row">{String(r.day)}</th>
                  <td>{num(Number(r.visits))}</td>
                  <td>{num(Number(r.buy_clicks))}</td>
                  <td>{num(Number(r.checkouts))}</td>
                  <td>{num(Number(r.purchases))}</td>
                  <td>{pct(Number(r.bump_purchases), Number(r.purchases))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="adm-grid">
        {BREAKDOWNS.map((b) => (
          <TopTable key={b.kind} title={b.title} rows={rows(b.kind)} cols={"cols" in b ? [...b.cols] : undefined} />
        ))}
      </div>
      <p className="fine">Counted by our own script: no cookies, bots skipped, the team’s /admin pages not counted. A visitor is one browser (cleared storage or a second device counts again). Counting started with this panel, so earlier visits aren’t here.</p>
    </div>
  );
}
