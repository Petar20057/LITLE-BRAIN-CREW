"use client";

import { useSyncExternalStore } from "react";
import type { CrewKey, Item } from "./funnel";

// The order being built across checkout → offers → thank you. Lives in sessionStorage for the tab,
// so a refresh on an offer page keeps it. When real payments are wired, the server's order is the source of truth.
export type Order = {
  email: string;
  items: Item[];
  crew?: CrewKey;
  gift?: Record<string, string>;
  support?: number;
  /** Download tokens of the paid one-time orders in this tab, with the items each one bought (lib/delivery-files.ts). */
  deliveries?: { token: string; items: string[] }[];
};

const KEY = "vlc-order";
const EMPTY: Order = { email: "", items: [] };
const listeners = new Set<() => void>();
let cache: { raw: string | null; order: Order } = { raw: null, order: EMPTY };

function read(): Order {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    // storage blocked: the funnel still works, it just forgets on refresh
  }
  if (raw !== cache.raw) {
    let order = EMPTY;
    try {
      order = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    } catch {
      // corrupted entry: start clean
    }
    cache = { raw, order };
  }
  return cache.order;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useOrder() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function saveOrder(order: Order) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    // see read()
  }
  cache = { raw: null, order: EMPTY };
  listeners.forEach((l) => l());
}

export function addItem(item: Item) {
  const order = read();
  if (!order.items.some((i) => i.id === item.id)) saveOrder({ ...order, items: [...order.items, item] });
}

/** A value from sessionStorage written by the design's scripts (e.g. the gift card details). */
export function useStored(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

/** One query-string value, read on the client after hydration. */
export function useQueryParam(name: string) {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(location.search).get(name),
    () => null,
  );
}
