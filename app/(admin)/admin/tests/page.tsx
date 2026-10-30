import { AdminHeader } from "@/components/admin/Admin";
import { confidence, num, pct, rangeFrom, requireAdmin } from "@/lib/admin";
import { EXPERIMENTS, isExperiment } from "@/lib/experiments";
import { looseAdmin } from "@/lib/supabase/loose";

// A/B tests (lib/experiments.ts): per test and version, the visitors who saw it and what they did afterwards.
// Data: experiment_results (supabase/migrations/20261030120000_attribution_engagement_experiments.sql).
// The winner is the version with more money per visitor, once both have enough visitors (web/FUNNEL.md).

export const metadata = { title: "A/B tests · Admin" };
// Reads the sign-in cookie and live numbers on every request.
export const instant = false;

/** Visitors per version before a result means anything. */
const ENOUGH = 300;

type Row = {
  test: string; variant: string; visitors: number; buy_clickers: number; checkouts: number; pay_clickers: number;
  purchasers: number; purchases: number; revenue_cents: number;
};

const usdCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function verdict(a: Row | undefined, b: Row | undefined) {
  if (!a || !b) return "Waiting for both versions to be seen.";
  const [na, nb] = [Number(a.visitors), Number(b.visitors)];
  if (Math.min(na, nb) < ENOUGH) return `Too early: ${num(Math.min(na, nb))} of ${ENOUGH} visitors on the smaller version.`;
  const perA = Number(a.revenue_cents) / na, perB = Number(b.revenue_cents) / nb;
  const sure = confidence(Number(a.purchasers), na, Number(b.purchasers), nb) ?? 0;
  const better = perB > perA ? "B" : "A";
  const lift = perA ? Math.round(((perB - perA) / perA) * 100) : null;
  const how = sure >= 0.95 ? "very likely real" : sure >= 0.8 ? "leaning, keep it running" : "could still be chance";
  return `${better} earns more per visitor${lift !== null ? ` (B vs A: ${lift > 0 ? "+" : ""}${lift}%)` : ""}. Buyer rates differ with ${Math.round(sure * 100)}% confidence: ${how}.`;
}

export default async function Page({ searchParams }: PageProps<"/admin/tests">) {
  const { email } = await requireAdmin();
  const { days, since } = rangeFrom((await searchParams).days);

  const { data, error } = await looseAdmin().rpc("experiment_results", { since });
  if (error) {
    console.error("[admin tests]", error);
    return <p className="fx-card">Couldn’t read the numbers. Is supabase/migrations/20261030120000_attribution_engagement_experiments.sql applied?</p>;
  }
  const rows = (data ?? []) as Row[];

  return (
    <div className="adm-page">
      <AdminHeader tab="/admin/tests" days={days} email={email} />
      <h1>A/B tests</h1>
      <p className="fx-sub">Each visitor keeps one version per test. Judge a test on <b>$ per visitor</b>, and only after {ENOUGH} visitors per version. Tests and their copy live in lib/experiments.ts and design/*.html.</p>
      {Object.entries(EXPERIMENTS).map(([id, e]) => {
        if (!isExperiment(id)) return null;
        const list = rows.filter((r) => r.test === id);
        return (
          <section key={id} className="table-wrap">
            <table className="learn-table">
              <caption>
                <b>{e.label}</b> · {e.active ? "running" : "off"} · {verdict(list.find((r) => r.variant === "a"), list.find((r) => r.variant === "b"))}
              </caption>
              <thead>
                <tr><th scope="col">Version</th><th scope="col">Visitors</th><th scope="col">Clicked buy</th><th scope="col">Opened checkout</th><th scope="col">Pressed pay</th><th scope="col">Bought</th><th scope="col">Revenue</th><th scope="col">$ per visitor</th></tr>
              </thead>
              <tbody>
                {list.length === 0 && <tr><td colSpan={8}>{e.active ? "No visitors yet." : "Not running. Turn it on in lib/experiments.ts once its B copy is approved."}</td></tr>}
                {list.map((r) => {
                  const n = Number(r.visitors);
                  return (
                    <tr key={r.variant}>
                      <th scope="row">{r.variant.toUpperCase()}</th>
                      <td>{num(n)}</td>
                      <td>{pct(Number(r.buy_clickers), n)}</td>
                      <td>{pct(Number(r.checkouts), n)}</td>
                      <td>{pct(Number(r.pay_clickers), n)}</td>
                      <td>{num(Number(r.purchasers))} ({pct(Number(r.purchasers), n)})</td>
                      <td>{usdCents(Number(r.revenue_cents))}</td>
                      <td>{usdCents(Number(r.revenue_cents) / Math.max(1, n))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}
      <p className="fine">A visitor counts from the first time they see a test, and everything they do afterwards counts for that version, on any later visit from the same browser.</p>
    </div>
  );
}
