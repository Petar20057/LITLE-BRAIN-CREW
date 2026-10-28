"use client";

import { trackEvent } from "@/lib/track-event";

/** "Get the Toolkit · $9". The click is counted before the browser follows the link (sendBeacon outlives the page). */
export default function BuyToolkitButton({ place }: { place: string }) {
  return (
    <a href="/checkout/guide" className="btn btn-main btn-lg" onClick={() => trackEvent("buy_click", place)}>
      Get the Toolkit · $9
    </a>
  );
}
