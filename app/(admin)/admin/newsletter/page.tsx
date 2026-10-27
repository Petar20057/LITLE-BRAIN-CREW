import { AdminHeader, DailyBars, Tiles, TopTable } from "@/components/admin/Admin";
import { NEWSLETTER_FORMS, SIGNUP_FORMS, isSignupForm } from "@/lib/analytics";
import { rangeFrom, requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// Newsletter and every email form on the site (signups), plus the emails the /code quiz collects (quiz_leads).
// The CSV export (./export) has every address for sending.

export const metadata = { title: "Newsletter & forms · Admin" };
// Reads the sign-in cookie and live numbers on every request.
export const instant = false;

const LATEST = 100;
const label = (form: string) => (form === "quiz" ? "Quiz /code (weekly tips ticked = subscribed)" : isSignupForm(form) ? SIGNUP_FORMS[form].label : form);
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Belgrade" });

function detailText(details: unknown) {
  if (!details || typeof details !== "object") return "";
  return Object.entries(details as Record<string, string | string[]>)
    .map(([k, v]) => `${k}: ${[v].flat().join(", ")}`)
    .join(" · ");
}

export default async function Page({ searchParams }: PageProps<"/admin/newsletter">) {
  const { email } = await requireAdmin();
  const { days, since } = rangeFrom((await searchParams).days);

  const db = createAdminClient();
  const [summary, daily, subscribers, latest, leads] = await Promise.all([
    db.rpc("signups_summary", { since }),
    db.rpc("signups_daily", { since }),
    db.rpc("newsletter_subscribers", { forms: NEWSLETTER_FORMS }),
    db.from("signups").select("email, form, page, details, utm_source, created_at, unsubscribed_at").order("created_at", { ascending: false }).limit(LATEST),
    db.from("quiz_leads").select("email, tips_consent, created_at, unsubscribed_at").order("created_at", { ascending: false }).limit(LATEST),
  ]);
  const failed = summary.error ?? daily.error ?? subscribers.error ?? latest.error ?? leads.error;
  if (failed) {
    console.error("[admin newsletter]", failed);
    return <p className="fx-card">Couldn’t read the numbers. Is supabase/migrations/20261026170000_admin_analytics.sql applied?</p>;
  }

  const forms = summary.data ?? [];
  const newInPeriod = forms.reduce((n, f) => n + Number(f.in_period), 0);
  const allTime = forms.reduce((n, f) => n + Number(f.total), 0);
  const perDay = new Map<string, number>();
  for (const d of daily.data ?? []) perDay.set(d.day, (perDay.get(d.day) ?? 0) + Number(d.signups));

  const recent = [
    ...(latest.data ?? []).map((s) => ({ ...s, form: s.form as string })),
    ...(leads.data ?? []).map((l) => ({ email: l.email, form: "quiz", page: "/code", details: l.tips_consent ? { tips: "yes" } : null, utm_source: null, created_at: l.created_at, unsubscribed_at: l.unsubscribed_at })),
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, LATEST);

  return (
    <div className="adm-page">
      <AdminHeader tab="/admin/newsletter" days={days} email={email} />
      <h1>Newsletter &amp; forms</h1>
      <Tiles
        items={[
          { label: "Newsletter subscribers", value: Number(subscribers.data ?? 0), note: "unique emails, confirmed, still subscribed" },
          { label: `New signups, ${days} days`, value: newInPeriod, note: "all forms and the quiz" },
          { label: "Signups all time", value: allTime, note: "one email can be on several forms" },
        ]}
      />
      <p className="adm-actions">
        <a className="btn" href="/admin/newsletter/export">Download all emails (CSV)</a>
      </p>
      <DailyBars title={days > 90 ? "New signups per day, last 90 days (UTC)" : "New signups per day (UTC)"} days={Math.min(days, 90)} rows={[...perDay].map(([day, value]) => ({ day, value }))} />
      <TopTable
        title="By form"
        cols={[`New, ${days} days`, "All time", "Subscribed"]}
        rows={forms.sort((a, b) => Number(b.in_period) - Number(a.in_period) || Number(b.total) - Number(a.total)).map((f) => ({ label: label(f.form), values: [Number(f.in_period), Number(f.total), Number(f.subscribed)] }))}
        empty="No signups yet."
      />
      <p className="fine">Newsletter = the free screen-time list, the sticker pack, the 5-day challenge, and quiz parents who ticked the weekly tips. Waitlists, founding parents and schools are counted per form but aren’t the newsletter. Since 27 Oct 2026 a newsletter signup or a quiz tips tick counts as subscribed only after the person taps the link in the confirmation email.</p>

      <div className="table-wrap">
        <table className="learn-table adm-list">
          <caption>Latest {LATEST} signups</caption>
          <thead>
            <tr><th scope="col">When</th><th scope="col">Email</th><th scope="col">Form</th><th scope="col">Details</th><th scope="col">Source</th></tr>
          </thead>
          <tbody>
            {recent.length === 0 && <tr><td colSpan={5}>No signups yet.</td></tr>}
            {recent.map((r) => (
              <tr key={`${r.form}:${r.email}`}>
                <td>{when(r.created_at)}</td>
                <th scope="row">{r.email}{r.unsubscribed_at && <small> (left)</small>}</th>
                <td>{label(r.form)}</td>
                <td>{detailText(r.details)}</td>
                <td>{r.utm_source ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
