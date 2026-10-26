import CrewArt from "@/components/funnel/CrewArt";

export const metadata = { title: "Your Crew Club · Little Brain Crew" };

// Member area preview. Real data comes from Supabase (member) and Stripe (subscription) once they're connected.
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

        <div className="acct-row"><span>Plan</span><span>Monthly · $9</span></div>
        <div className="acct-row"><span>Next payment</span><span>$9 on the 14th</span></div>
        <div className="acct-row"><span>Member since</span><span>3 months</span></div>

        <div className="save-offer">
          <h3>Save $29 a year</h3>
          <p>Switch to yearly: $79 instead of $108. We email you a week before it renews.</p>
          <a className="btn btn-main" href="#">Switch to yearly</a>
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
