"use client";

import { ITEMS } from "@/lib/funnel";
import { useOrder } from "@/lib/order";
import { PLAN_REPLY_DAYS } from "@/lib/personal-plan-form";
import CrewArt from "./CrewArt";
import { usePaidPurchases } from "./usePaidPurchases";

// Where Creem sends the parent after paying for a Personal plan. The payment is confirmed by polling /api/order with the
// token the form kept (usePaidPurchases also counts the ad purchase); opened in another browser there is no token, so the
// page simply says what happens next. The confirmation email covers both cases.
export default function PersonalPlanThanks() {
  const order = useOrder();
  const paid = usePaidPurchases(order.deliveries);
  const confirmed = Object.values(paid.byToken).flat().some((p) => p.items.includes(ITEMS.personalPlan.id));
  const waiting = Boolean(order.deliveries?.length) && paid.pending && !confirmed;
  return (
    <div className="fx-card">
      <div className="oto">
        <CrewArt k="fronti" mood="happy" className="art" />
        <h1>Thank you. We’ve got your answers.</h1>
        {confirmed ? (
          <p className="fx-sub" role="status">Payment confirmed ✓ {order.email ? `A confirmation is on its way to ${order.email}.` : "A confirmation is on its way to your inbox."}</p>
        ) : waiting ? (
          <p className="fine" role="status">Confirming your payment… This takes a few seconds.</p>
        ) : (
          <p className="fx-sub">Your confirmation email is on its way.</p>
        )}
        {paid.error && !confirmed && <p className="fine" role="status">{paid.error}</p>}
      </div>
      <h2>What happens next</h2>
      <ol className="ty-next">
        <li>Within a minute: an email from Little Brain Crew (hello@littlebraincrew.com) confirming we have your answers. Check Promotions or Spam if it hasn’t arrived.</li>
        <li>Within {PLAN_REPLY_DAYS} working days: your plan, in the same inbox. The crew member behind the moment, one small move for each evening and the exact words for your kid’s age.</li>
        <li>Anything to add? Reply to the confirmation email and we’ll put it in the plan.</li>
      </ol>
    </div>
  );
}
