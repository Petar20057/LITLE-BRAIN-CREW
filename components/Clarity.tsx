"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { UNTRACKED } from "@/lib/analytics";

// Microsoft Clarity (heatmaps and session recordings), described on /privacy. Live site only, and never on the
// team's own pages (admin, stats, dev), so their data is not recorded.

const CLARITY_ID = "z5piuz6rpb";

export default function Clarity() {
  const path = usePathname();
  if (process.env.NODE_ENV !== "production" || UNTRACKED.test(path)) return null;
  return (
    <Script id="clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
    </Script>
  );
}
