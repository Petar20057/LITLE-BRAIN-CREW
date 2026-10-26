"use client";

import { useEffect } from "react";

// Runs the design's own scripts (public/assets/*.js) after the page HTML is in place.
// async=false keeps them executing in order: crew-art.js has to run before site.js.
export default function PageScripts({ scripts, bodyData }: { scripts: string[]; bodyData: Record<string, string> }) {
  useEffect(() => {
    Object.assign(document.body.dataset, bodyData);
    for (const name of scripts) {
      const src = `/assets/${name}`;
      if (document.querySelector(`script[src="${src}"]`)) continue;
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      document.body.appendChild(s);
    }
  }, [scripts, bodyData]);

  return null;
}
