import { connection } from "next/server";
import { Fragment } from "react";
import { AdminHeader, Tiles } from "@/components/admin/Admin";
import { rangeFrom, requireAdmin } from "@/lib/admin";
import { ITEMS, usd } from "@/lib/funnel";
import type { PlanRequestRow } from "@/lib/personal-plan";
import { PLAN_FIELDS, PLAN_REPLY_DAYS, answerLabel, momentTitle, type PlanStatus } from "@/lib/personal-plan-form";
import { looseAdmin } from "@/lib/supabase/loose";
import { setPlanStatus } from "./actions";

// Every Personal plan request (plan_requests): who paid and is waiting for a plan, the answers to write it from, and the
// two buttons that move a request on (actions.ts). A paid request also reaches the team inbox (lib/personal-plan.ts).

export const metadata = { title: "Personal plans · Admin" };
export const instant = false;

const LATEST = 100;
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Belgrade" }) : "");
const STATUS: Record<PlanStatus, string> = {
  new: "Form saved, no checkout yet",
  checkout: "At checkout, not paid",
  paid: "Paid · waiting for the plan",
  replied: "Plan sent",
  closed: "Closed",
};

export default async function Page({ searchParams }: PageProps<"/admin/personal-plans">) {
  // Auth and the list must be read for the current request, including right after a status button.
  await connection();
  const { email } = await requireAdmin();
  const { days, since } = rangeFrom((await searchParams).days);

  const db = looseAdmin();
  const [latest, waiting, sent, paidAll, unpaid] = await Promise.all([
    db.from("plan_requests").select("*").order("created_at", { ascending: false }).limit(LATEST),
    db.from("plan_requests").select("id", { count: "exact", head: true }).eq("status", "paid"),
    db.from("plan_requests").select("id", { count: "exact", head: true }).eq("status", "replied").gte("replied_at", since),
    db.from("plan_requests").select("id", { count: "exact", head: true }).in("status", ["paid", "replied", "closed"]),
    db.from("plan_requests").select("id", { count: "exact", head: true }).in("status", ["new", "checkout"]),
  ]);
  const failed = latest.error ?? waiting.error ?? sent.error ?? paidAll.error ?? unpaid.error;
  if (failed) {
    console.error("[admin personal-plans]", failed);
    return (
      <div className="adm-page">
        <AdminHeader tab="/admin/personal-plans" days={days} email={email} />
        <p className="fx-card">Couldn’t read the requests. Is supabase/migrations/20261103120000_plan_requests.sql applied?</p>
      </div>
    );
  }
  const rows = (latest.data ?? []) as PlanRequestRow[];

  return (
    <div className="adm-page">
      <AdminHeader tab="/admin/personal-plans" days={days} email={email} />
      <h1>Personal plans</h1>
      <Tiles
        items={[
          { label: "Waiting for a plan", value: waiting.count ?? 0, note: `paid, plan not sent yet · due within ${PLAN_REPLY_DAYS} working days` },
          { label: `Plans sent, ${days} days`, value: sent.count ?? 0 },
          { label: "Paid, all time", value: paidAll.count ?? 0, note: `${usd(ITEMS.personalPlan.price)} each before discounts` },
          { label: "Unpaid forms", value: unpaid.count ?? 0, note: "saved or at checkout; deleted after 30 days" },
        ]}
      />
      <p className="fine">Every paid request also lands in the team inbox with all its answers. Write the plan, send it from hello@littlebraincrew.com, then mark it sent here. A form that never reached payment still shows its checkout link, in case the parent asks for it.</p>

      <div className="table-wrap">
        <table className="learn-table adm-list adm-plans">
          <caption>Latest {LATEST} requests</caption>
          <thead>
            <tr><th scope="col">When</th><th scope="col">Parent</th><th scope="col">Kid</th><th scope="col">Moment</th><th scope="col">Status</th><th scope="col">Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6}>No requests yet.</td></tr>}
            {rows.map((r) => {
              const other = r.moment === "other" && typeof r.answers?.moment_other === "string" ? r.answers.moment_other : "";
              return (
                <Fragment key={r.id}>
                  <tr>
                    <td>{when(r.created_at)}</td>
                    <th scope="row">{r.name}<br /><a href={`mailto:${r.email}`}>{r.email}</a></th>
                    <td>{r.kid_age}</td>
                    <td>{momentTitle(r.moment)}{other && <><br /><small>{other}</small></>}</td>
                    <td>
                      {STATUS[r.status] ?? r.status}
                      {r.paid_at && <><br /><small>paid {when(r.paid_at)}</small></>}
                      {r.replied_at && <><br /><small>sent {when(r.replied_at)}</small></>}
                    </td>
                    <td className="adm-plan-actions">
                      {r.status === "paid" && (
                        <form action={setPlanStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="replied" /><button type="submit" className="adm-link">Mark plan sent</button></form>
                      )}
                      {(r.status === "paid" || r.status === "replied") && (
                        <form action={setPlanStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="closed" /><button type="submit" className="adm-link">Close</button></form>
                      )}
                      {(r.status === "new" || r.status === "checkout") && r.checkout_url && <a href={r.checkout_url} rel="noreferrer">Checkout link</a>}
                    </td>
                  </tr>
                  <tr className="adm-plan-answers">
                    <td colSpan={6}>
                      <details>
                        <summary>Answers</summary>
                        <dl>
                          {PLAN_FIELDS.map((f) => {
                            const v = r.answers?.[f.key];
                            if (v == null || (Array.isArray(v) && v.length === 0)) return null;
                            return <Fragment key={f.key}><dt>{f.label}</dt><dd>{answerLabel(f, v)}</dd></Fragment>;
                          })}
                          {r.utm_source && <><dt>Source</dt><dd>{r.utm_source}</dd></>}
                        </dl>
                      </details>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
