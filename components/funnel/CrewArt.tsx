"use client";

import { useSyncExternalStore } from "react";
import type { CrewKey } from "@/lib/funnel";

declare global {
  interface Window {
    svg?: (k: string, mood?: string, cls?: string) => string;
  }
}

// The design's crew-art.js draws the characters; load it once, on the client.
let ready = false;
const subs = new Set<() => void>();
function subscribe(cb: () => void) {
  subs.add(cb);
  if (!ready)
    import("@/design/assets/crew-art.js").then(() => {
      ready = true;
      subs.forEach((s) => s());
    });
  return () => subs.delete(cb);
}

export default function CrewArt({ k, mood = "main", className }: { k: CrewKey; mood?: "main" | "happy" | "tired"; className?: string }) {
  const html = useSyncExternalStore(subscribe, () => (ready && window.svg ? window.svg(k, mood) : ""), () => "");
  return <div className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}
