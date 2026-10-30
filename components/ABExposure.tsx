"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { clarityTag } from "@/lib/analytics";
import { assignedVariant, isExperiment } from "@/lib/experiments";
import { trackEvent } from "@/lib/track-event";

// Counts who saw which version of an A/B test (lib/experiments.ts): once per visit and test, when the page shows a
// spot of an active test, it sends ab_view with place "test:variant" and tags the visit in Clarity.
// Mounted after <Track /> in the root layout, so the visitor and visit ids exist by the time this runs.

export default function ABExposure() {
  const path = usePathname();

  useEffect(() => {
    let seen: string[] = [];
    try {
      seen = JSON.parse(sessionStorage.getItem("lbc-ab-seen") || "[]");
    } catch {
      return;
    }
    const tests = new Set(Array.from(document.querySelectorAll<HTMLElement>("[data-ab]"), (el) => el.dataset.ab));
    for (const test of tests) {
      if (!isExperiment(test)) continue;
      const variant = assignedVariant(test);
      if (!variant) continue;
      clarityTag(`ab_${test}`, variant);
      if (seen.includes(test)) continue;
      trackEvent("ab_view", `${test}:${variant}`);
      seen.push(test);
    }
    try {
      sessionStorage.setItem("lbc-ab-seen", JSON.stringify(seen));
    } catch {
      // Storage blocked: nothing was sent either.
    }
  }, [path]);

  return null;
}
