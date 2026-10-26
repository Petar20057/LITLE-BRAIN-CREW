"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { UNTRACKED } from "@/lib/analytics";

// Counts one page view per page shown, for /admin. No cookie: a random visitor id in localStorage and a random
// visit id in sessionStorage. Where the visit came from (referrer, UTM tags) is read on its first page and sent
// with every page of that visit. If storage is blocked nothing is sent.

const idIn = (store: Storage, key: string) => {
  let id = store.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    store.setItem(key, id);
  }
  return id;
};

export default function Track() {
  const path = usePathname();

  useEffect(() => {
    if (UNTRACKED.test(path)) return;
    try {
      const visitor = idIn(localStorage, "lbc-vid");
      const session = idIn(sessionStorage, "lbc-sid");
      let origin = sessionStorage.getItem("lbc-origin");
      if (!origin) {
        const q = new URLSearchParams(location.search);
        origin = JSON.stringify({
          referrer: document.referrer || null,
          utm_source: q.get("utm_source"),
          utm_medium: q.get("utm_medium"),
          utm_campaign: q.get("utm_campaign"),
        });
        sessionStorage.setItem("lbc-origin", origin);
      }
      navigator.sendBeacon("/api/track", JSON.stringify({ visitor, session, path, ...JSON.parse(origin) }));
    } catch {
      // Private mode or blocked storage: the visit just isn't counted.
    }
  }, [path]);

  return null;
}
