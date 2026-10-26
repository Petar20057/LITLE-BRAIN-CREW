import { AdminHeader, DailyBars, Tiles, TopTable } from "@/components/admin/Admin";
import { NEWSLETTER_FORMS } from "@/lib/analytics";
import { pct, rangeFrom, requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const [totals, daily, top, subscribers, quiz] = await Promise.all([
    db.rpc("traffic_totals", { since }),
    db.rpc("traffic_daily", { since }),
    db.rpc("traffic_top", { since }),
    db.rpc("newsletter_subscribers", { forms: NEWSLETTER_FORMS }),
    db.from("quiz_sessions").select("id", { count: "exact", head: true }).gte("started_at", since),
  ]);
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
      <div className="adm-grid">
        {BREAKDOWNS.map((b) => (
          <TopTable key={b.kind} title={b.title} rows={rows(b.kind)} cols={"cols" in b ? [...b.cols] : undefined} />
        ))}
      </div>
      <p className="fine">Counted by our own script: no cookies, bots skipped, the team’s /admin pages not counted. A visitor is one browser (cleared storage or a second device counts again). Counting started with this panel, so earlier visits aren’t here.</p>
    </div>
  );
}
