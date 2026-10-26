import CrewArt from "@/components/funnel/CrewArt";
import { AFFILIATE, ITEMS, commission, usd } from "@/lib/funnel";

export const metadata = { title: "Your Crew Club · Little Brain Crew" };

const MONTHLY = ITEMS.clubMonthly.price;
const YEARLY = ITEMS.clubYearly.price;

// Member area preview. Real data comes from Supabase (member) and Creem (subscription) once they're connected.
export default function Page() {
  return (
    <div className="fx-narrow" style={{ margin: "24px auto 0" }}>
      <div className="fx-card">
        <div className="fx-product">
          <CrewArt k="toci" mood="happy" />
          <div><b>Your Crew Club</b><small>Preview with example data</small></div>
        </div>

        <div className="next-step" style={{ margin: "8px 0 20px" }}>
          <span><b>This week:</b> “Why Corti hates mornings”, a 3-minute cartoon. Your streak: 9 cartoons in a row 🔥</span>
          <a className="btn" href="#">Watch now</a>
        </div>

        <div className="acct-row"><span>Plan</span><span>Monthly · {usd(MONTHLY)}</span></div>
        <div className="acct-row"><span>Next payment</span><span>{usd(MONTHLY)} on the 14th</span></div>
        <div className="acct-row"><span>Member since</span><span>3 months</span></div>

        <div className="save-offer">
          <h3>Save {usd(MONTHLY * 12 - YEARLY)} a year</h3>
          <p>Switch to yearly: {usd(YEARLY)} instead of {usd(MONTHLY * 12)}. We email you a week before it renews.</p>
          <a className="btn btn-main" href="#">Switch to yearly</a>
        </div>

        <div className="save-offer">
          <h3>Share the crew · earn {Math.round(AFFILIATE.rate * 100)}%</h3>
          <p>Members only: join our affiliate program and earn {Math.round(AFFILIATE.rate * 100)}% of what parents on your link pay, like {usd(commission(MONTHLY))} from a new member’s {usd(MONTHLY)} month.</p>
          <a className="btn" href="/account/affiliate">Join the program</a>
        </div>

        <div className="acct-actions">
          <a className="btn btn-quiet" href="/account/cancel?pause=1">Pause for a while</a>
          <a className="btn btn-quiet" href="/account/cancel">Cancel membership</a>
        </div>
        <p className="fine" style={{ marginTop: 16 }}>Pausing or cancelling takes 2 clicks, right here. No calls, no emails needed.</p>
      </div>
    </div>
  );
}
