"use client";

import { ITEMS, usd } from "@/lib/funnel";
import { trackEvent } from "@/lib/track-event";

/** One line under a Toolkit or Bedtime Kit order: the written-for-you plan is a separate purchase (/personal-plan). */
export default function PersonalPlanLink({ place }: { place: string }) {
  return (
    <p className="fine pp-link">
      Want a plan written for your family? <a href="/personal-plan" onClick={() => trackEvent("cta_click", place)}>The Personal plan · {usd(ITEMS.personalPlan.price)} →</a>
    </p>
  );
}
