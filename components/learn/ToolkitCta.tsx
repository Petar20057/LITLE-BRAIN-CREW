import { ITEMS } from "@/lib/funnel";

/** The one soft sell on every entry. Habits and learning only, no health claims. */
export default function ToolkitCta() {
  return (
    <div className="cta-box surface">
      <h3>Want the whole crew on your side?</h3>
      <p>
        {ITEMS.guide.name}: the 12 hardest moments decoded, from screens off to bedtime, with what to say and what to try tonight.
        Read it in one evening.
      </p>
      <a href="/#plans" className="btn btn-main btn-lg">See the plans</a>
      <p className="fine" style={{ marginTop: 12 }}>The Toolkit is ${ITEMS.guide.price}, one payment. For learning only, not medical advice.</p>
    </div>
  );
}
