"use client";

import { useEffect, useSyncExternalStore } from "react";

// The /crew filter chips: All / Free / Locked. The cards are rendered on the server; this only hides the ones that
// don't match. The choice lives in the URL hash (/crew#free, /crew#locked), so a filtered view can be linked and survives a reload.
const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

export default function CrewFilters({ counts }: { counts: { all: number; free: number; locked: number } }) {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const filter = hash === "free" || hash === "locked" ? hash : "all";

  useEffect(() => {
    const list = document.getElementById("crew-list");
    if (!list) return;
    list.querySelectorAll<HTMLElement>("li[data-access]").forEach((li) => {
      li.hidden = !(filter === "all" || filter === li.dataset.access);
    });
    list.querySelectorAll<HTMLElement>(".pack-block").forEach((block) => {
      block.hidden = !block.querySelector("li[data-access]:not([hidden])");
    });
  }, [filter]);

  function choose(next: string) {
    window.history.replaceState(null, "", next === "all" ? window.location.pathname : `${window.location.pathname}#${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  const chip = (key: string, label: string, n: number) => (
    <button key={key} type="button" aria-pressed={filter === key} onClick={() => choose(key)}>
      {label}<small>{n}</small>
    </button>
  );
  return (
    <div className="crew-filters" role="group" aria-label="Show">
      {chip("all", "All", counts.all)}
      {chip("free", "Free", counts.free)}
      {chip("locked", "Locked", counts.locked)}
    </div>
  );
}
