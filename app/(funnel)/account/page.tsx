import CrewArt from "@/components/funnel/CrewArt";
import { ITEMS, usd } from "@/lib/funnel";

export const metadata = { title: "Your account · Little Brain Crew" };

// Account preview. Real data (what was bought, and the character packs it unlocks on /crew) comes with phase 4 of
// FUNNEL.md §18: the email sign-in and the entitlements table. Nothing here renews: everything we sell is one payment
// (the Crew Club membership, with its plan, pause and cancel flow, was removed on 2026-11-04).

export default function Page() {
  return (
    <div className="fx-narrow" style={{ margin: "24px auto 0" }}>
      <div className="fx-card">
        <div className="fx-product">
          <CrewArt k="toci" mood="happy" />
          <div><b>Your account</b><small>Preview with example data</small></div>
        </div>

        <div className="next-step" style={{ margin: "8px 0 20px" }}>
          <span><b>Tonight:</b> read the moment that’s hardest at home right now in your Toolkit. 5 minutes.</span>
          <a className="btn" href="#">Open my files</a>
        </div>

        <div className="acct-row"><span>The Kid Brain Toolkit</span><span>{usd(ITEMS.guide.price)} · yours to keep</span></div>
        <div className="acct-row"><span>Inside it</span><span>the 30-Day Reset, the Science Edition, the Complete Crew Guide, the bonuses</span></div>
        <div className="acct-row"><span>The whole crew</span><span>all 214 in your guide · <a className="link" href="/crew">meet the crew</a></span></div>

        <p className="fine" style={{ marginTop: 16 }}>Everything you buy here is one payment, yours to keep. Nothing renews. Need a file resent? Email <a className="link" href="mailto:hello@littlebraincrew.com">hello@littlebraincrew.com</a>.</p>
      </div>
    </div>
  );
}
