"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { UNTRACKED, clarityTag } from "@/lib/analytics";

// Counts one page view per page shown, for /admin. No cookie: a random visitor id in localStorage and a random
// visit id in sessionStorage. Where the visit came from (referrer, UTM tags) is read on its first page and sent
// with every page of that visit. If storage is blocked nothing is sent.
// Each page view also gets a random view id. When the page is hidden or left, a second beacon sends, for that view,
// the seconds it was visible and how far down it was scrolled (0–100), so /admin can show time on page and exits.

const idIn = (store: Storage, key: string) => {
  let id = store.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    store.setItem(key, id);
  }
  return id;
};

const scrolled = () => {
  const el = document.documentElement;
  const max = el.scrollHeight - window.innerHeight;
  return max <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / max) * 100));
};

export default function Track() {
  const path = usePathname();

  useEffect(() => {
    if (UNTRACKED.test(path)) return;
    let session: string;
    const view = crypto.randomUUID();
    try {
      const visitor = idIn(localStorage, "lbc-vid");
      session = idIn(sessionStorage, "lbc-sid");
      let origin = sessionStorage.getItem("lbc-origin");
      if (!origin) {
        const q = new URLSearchParams(location.search);
        origin = JSON.stringify({
          referrer: document.referrer || null,
          utm_source: q.get("utm_source"),
          utm_medium: q.get("utm_medium"),
          utm_campaign: q.get("utm_campaign"),
          utm_content: q.get("utm_content"),
        });
        sessionStorage.setItem("lbc-origin", origin);
      }
      const from = JSON.parse(origin) as Record<string, string | null>;
      navigator.sendBeacon("/api/track", JSON.stringify({ visitor, session, view, path, ...from }));
      if (from.utm_source) clarityTag("utm_source", from.utm_source);
      if (from.utm_content) clarityTag("utm_content", from.utm_content);
    } catch {
      // Private mode or blocked storage: the visit just isn't counted.
      return;
    }

    // Visible time and deepest scroll of this page view. Sent on every hide and when the page is left; the
    // numbers only grow, so the last beacon to arrive is the right one.
    let shown = 0;
    let since = document.visibilityState === "visible" ? Date.now() : 0;
    let deepest = scrolled();
    const onScroll = () => {
      deepest = Math.max(deepest, scrolled());
    };
    const leave = () => {
      if (since) shown += Date.now() - since;
      since = 0;
      const seconds = Math.min(3600, Math.round(shown / 1000));
      navigator.sendBeacon("/api/track", JSON.stringify({ kind: "leave", session, view, seconds, scroll: deepest }));
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") leave();
      else since = Date.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
      // Moving to another page inside the app: this view ends here.
      if (since) leave();
    };
  }, [path]);

  return null;
}
