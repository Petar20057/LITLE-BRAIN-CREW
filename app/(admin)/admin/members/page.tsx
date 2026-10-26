import { AdminHeader, Tiles, TopTable } from "@/components/admin/Admin";
import { pct, rangeFrom, requireAdmin } from "@/lib/admin";
import { usd } from "@/lib/funnel";
import { createAdminClient } from "@/lib/supabase/admin";

// Crew Club: members, subscriptions (mirrored from Creem by the webhook) and why people cancel (/account/cancel).
// Tables from supabase/migrations/20261026120000_crew_club.sql. Small enough to read whole.

export const metadata = { title: "Crew Club · Admin" };
// Reads the sign-in cookie and live numbers on every request.
export const instant = false;

const LIVE = ["trialing", "active", "past_due", "unpaid", "paused", "scheduled_cancel"];
const PAYING = ["active", "past_due", "scheduled_cancel"];
const REASON: Record<string, string> = {
  too_expensive: "Too expensive", no_time: "No time", got_what_we_needed: "Got what we needed", wrong_age: "Wrong age", something_broken: "Something broken", other: "Other",
};

export default async function Page({ searchParams }: PageProps<"/admin/members">) {
  const { email } = await requireAdmin();
  const { days, since } = rangeFrom((await searchParams).days);

  const db = createAdminClient();
  const [members, newMembers, subs, cancels] = await Promise.all([
    db.from("members").select("id", { count: "exact", head: true }),
    db.from("members").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("subscriptions").select("plan, status, price_cents, billing_interval, created_at, canceled_at"),
    db.from("cancel_feedback").select("reason, offer_shown, offer_accepted, created_at").gte("created_at", since),
  ]);
  const failed = members.error ?? newMembers.error ?? subs.error ?? cancels.error;
  if (failed) {
    console.error("[admin members]", failed);
    return <p className="fx-card">Couldn’t read the Crew Club tables.</p>;
  }

  const all = subs.data ?? [];
  const live = all.filter((s) => LIVE.includes(s.status));
  const paying = all.filter((s) => PAYING.includes(s.status));
  const mrrCents = paying.reduce((n, s) => n + (s.billing_interval === "year" ? s.price_cents / 12 : s.price_cents), 0);
  const startedInPeriod = all.filter((s) => s.created_at >= since).length;
  const endedInPeriod = all.filter((s) => s.canceled_at && s.canceled_at >= since).length;

  const count = <T,>(list: T[], key: (x: T) => string) => {
    const m = new Map<string, number>();
    for (const x of list) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  const feedback = cancels.data ?? [];

  return (
    <div className="adm-page">
      <AdminHeader tab="/admin/members" days={days} email={email} />
      <h1>Crew Club</h1>
      <Tiles
        items={[
          { label: "Paying members", value: paying.length, note: `${live.length} live incl. paused and unpaid` },
          { label: "Monthly revenue (MRR)", value: usd(Math.round(mrrCents) / 100), note: "yearly plans counted as 1/12" },
          { label: `New subscriptions, ${days} days`, value: startedInPeriod },
          { label: `Cancelled, ${days} days`, value: endedInPeriod, note: `churn ${pct(endedInPeriod, paying.length + endedInPeriod)}` },
          { label: "Accounts", value: members.count ?? 0, note: `${newMembers.count ?? 0} new in ${days} days` },
        ]}
      />
      <div className="adm-grid">
        <TopTable title="Subscriptions by status" cols={["Subscriptions"]} rows={count(all, (s) => s.status.replaceAll("_", " ")).map(([label, n]) => ({ label, values: [n] }))} empty="No subscriptions yet." />
        <TopTable title="Live subscriptions by plan" cols={["Subscriptions"]} rows={count(live, (s) => (s.plan === "club_yearly" ? "Yearly $199" : "Monthly $19")).map(([label, n]) => ({ label, values: [n] }))} empty="No live subscriptions." />
        <TopTable title={`Why they cancel, ${days} days`} cols={["Answers"]} rows={count(feedback, (f) => REASON[f.reason] ?? f.reason).map(([label, n]) => ({ label, values: [n] }))} empty="No cancellations." />
        <TopTable
          title={`Save offers, ${days} days`}
          cols={["Shown", "Accepted"]}
          rows={count(feedback.filter((f) => f.offer_shown), (f) => (f.offer_shown ?? "").replaceAll("_", " ")).map(([label, n]) => ({
            label,
            values: [n, feedback.filter((f) => (f.offer_shown ?? "").replaceAll("_", " ") === label && f.offer_accepted).length],
          }))}
          empty="No save offers shown."
        />
      </div>
      <p className="fine">Subscriptions are written by the Creem webhook, so this stays empty until Creem is live. Sales of the Toolkit and the Reset are in the Creem dashboard.</p>
    </div>
  );
}
