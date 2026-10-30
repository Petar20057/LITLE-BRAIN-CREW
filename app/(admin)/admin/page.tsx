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
  { kind: "exit", title: "Exit pages (last page of a visit)", cols: ["Visits", "Visitors"] },
  { kind: "content", title: "Videos and posts (utm_content)" },
  { kind: "app", title: "App browser (TikTok, Instagram…)" },
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
  const [totals, daily, top, subscribers, quiz, funnel, depth] = await Promise.all([
    db.rpc("traffic_totals", { since }),
    db.rpc("traffic_daily", { since }),
    db.rpc("traffic_top", { since }),
    db.rpc("newsletter_subscribers", { forms: NEWSLETTER_FORMS }),
    db.from("quiz_sessions").select("id", { count: "exact", head: true }).gte("started_at", since),
    looseAdmin().rpc("funnel_daily", { since }),
    looseAdmin().rpc("scroll_depth", { since }),
  ]);
  if (funnel.error) console.error("[admin funnel]", funnel.error);
  if (depth.error) console.error("[admin scroll depth]", depth.error);
  const funnelRows = (funnel.data ?? []) as Record<string, unknown>[];
  const sum = (key: string) => funnelRows.reduce((s, r) => s + Number(r[key] ?? 0), 0);
  const usdCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const depthRows = (depth.data ?? []) as { mark: string; visits: number }[];
  const failed = totals.error ?? daily.error ?? top.error ?? subscribers.error;
  if (failed) {
    console.error("[admin traffic]", failed);
    return <p className="fx-card">Couldn’t read the numbers. Is supabase/migrations/20261026170000_admin_analytics.sql applied?</p>;
  }

  const t = totals.data?.[0] ?? { views: 0, visitors: 0, sessions: 0, bounced: 0, returning_visitors: 0 };
  const rows = (kind: string) => (top.data ?? []).filter((r) => r.kind === kind).map((r) => ({ label: r.label, values: [Number(r.views ?? 0), Number(r.visitors ?? 0)] }));

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
        <p className="fx-card">Couldn’t read the funnel numbers. Is supabase/migrations/20261029120000_funnel_offers_scroll.sql applied?</p>
      ) : (
        <div className="table-wrap">
          <table className="learn-table">
            <caption>Visits → buy clicks → checkouts → pay clicks → purchases → upsells (UTC), newest first. Money per visit is the number to grow.</caption>
            <thead>
              <tr><th scope="col">Day</th><th scope="col">Visits</th><th scope="col">Buy clicks</th><th scope="col">Checkouts</th><th scope="col">Pay clicks</th><th scope="col">Purchases</th><th scope="col">$7 bump</th><th scope="col">Upsell seen</th><th scope="col">Upsells bought</th><th scope="col">Revenue</th><th scope="col">$ per visit</th></tr>
            </thead>
            <tbody>
              {funnelRows.length === 0 && <tr><td colSpan={11}>Nothing yet.</td></tr>}
              {funnelRows.length > 0 && (
                <tr>
                  <th scope="row">All {days} days</th>
                  <td>{num(sum("visits"))}</td>
                  <td>{num(sum("buy_clicks"))}</td>
                  <td>{num(sum("checkouts"))}</td>
                  <td>{num(sum("pay_clicks"))}</td>
                  <td>{num(sum("purchases"))} ({pct(sum("purchases"), sum("visits"))})</td>
                  <td>{pct(sum("bump_purchases"), sum("purchases"))}</td>
                  <td>{num(sum("offer_views"))}</td>
                  <td>{num(sum("post_purchases"))}</td>
                  <td>{usdCents(sum("revenue_cents"))}</td>
                  <td>{usdCents(sum("revenue_cents") / Math.max(1, sum("visits")))}</td>
                </tr>
              )}
              {[...funnelRows].reverse().map((r) => (
                <tr key={String(r.day)}>
                  <th scope="row">{String(r.day)}</th>
                  <td>{num(Number(r.visits ?? 0))}</td>
                  <td>{num(Number(r.buy_clicks ?? 0))}</td>
                  <td>{num(Number(r.checkouts ?? 0))}</td>
                  <td>{num(Number(r.pay_clicks ?? 0))}</td>
                  <td>{num(Number(r.purchases ?? 0))}</td>
                  <td>{pct(Number(r.bump_purchases ?? 0), Number(r.purchases ?? 0))}</td>
                  <td>{num(Number(r.offer_views ?? 0))}</td>
                  <td>{num(Number(r.post_purchases ?? 0))}</td>
                  <td>{usdCents(Number(r.revenue_cents ?? 0))}</td>
                  <td>{usdCents(Number(r.revenue_cents ?? 0) / Math.max(1, Number(r.visits ?? 0)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {depthRows.length > 0 && (
        <TopTable title="How far down the home page visits get" rows={depthRows.map((d) => ({ label: `${d.mark}% of the page`, values: [Number(d.visits)] }))} cols={["Visits"]} />
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
