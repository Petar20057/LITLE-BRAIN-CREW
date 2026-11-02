"use client";

import { ITEMS, usd } from "@/lib/funnel";
import { trackEvent } from "@/lib/track-event";

/** "Get the Toolkit · $19" (the price from lib/funnel.ts). The click is counted before the browser follows the link (sendBeacon outlives the page). */
export default function BuyToolkitButton({ place }: { place: string }) {
  return (
    <a href="/checkout/guide" className="btn btn-main btn-lg" onClick={() => trackEvent("buy_click", place)}>
      Get the Toolkit · {usd(ITEMS.guide.price)}
    </a>
  );
}
