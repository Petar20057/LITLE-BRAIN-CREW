"use client";

import { useEffect, useState } from "react";
import type { PaidPurchase } from "@/lib/delivery-files";
import { AD_READY_EVENT, trackAdPurchase } from "@/lib/ad-pixels";

type Delivery = { token: string; items: string[] };
type State = { key: string; byToken: Record<string, PaidPurchase[]>; pending: boolean; error: string };

/** Session storage only identifies the order; its paid contents always come from the server. */
export function usePaidPurchases(deliveries: Delivery[] | undefined, waitForUpgrade = false) {
  const key = JSON.stringify([...new Set((deliveries ?? []).map((d) => d.token))]);
  const [state, setState] = useState<State>({ key: "", byToken: {}, pending: true, error: "" });
  useEffect(() => {
    const tokens = JSON.parse(key) as string[];
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let attempt = 0;
    let confirmed: Record<string, PaidPurchase[]> = {};
    async function poll() {
      let pending = false;
      let error = "";
      await Promise.all(tokens.map(async (token) => {
        try {
          const response = await fetch("/api/order", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }), signal: controller.signal,
          });
          const data = await response.json();
          if (response.ok && Array.isArray(data.purchases)) confirmed = { ...confirmed, [token]: data.purchases };
          else if (response.status !== 410) pending = true;
          if (data.error) error = data.error;
        } catch {
          pending = true;
          error = "Your payment is still being confirmed. Your email will have the download links.";
        }
      }));
      if (waitForUpgrade && !Object.values(confirmed).flat().some((p) => p.items.includes("upgrade"))) pending = true;
      if (controller.signal.aborted) return;
      setState({ key, byToken: confirmed, pending: pending && attempt < 14, error });
      if (pending && ++attempt < 14) timer = setTimeout(poll, 1500);
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [key, waitForUpgrade]);
  useEffect(() => {
    if (state.key !== key) return;
    const track = () => Object.values(state.byToken).flat().forEach(trackAdPurchase);
    track();
    window.addEventListener(AD_READY_EVENT, track);
    return () => window.removeEventListener(AD_READY_EVENT, track);
  }, [state.key, state.byToken, key]);
  return state.key === key ? state : { key, byToken: {}, pending: true, error: "" };
}
