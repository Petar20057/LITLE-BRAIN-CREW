import type { NextConfig } from "next";

// No payment processor is connected yet: the Toolkit, the 30-Day Reset and the Crew Club show "Coming soon" and the
// checkout and offer pages send visitors back to the plans. Set to false once Creem is live (lib/funnel.ts PREVIEW too).
const COMING_SOON = true;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: { root: import.meta.dirname },
  // The free quiz was removed; old links and ads land on the plans. Crew Club Lite was removed too:
  // its old offer page goes straight to the order.
  async redirects() {
    return [
      ...(COMING_SOON
        ? [
            { source: "/checkout/:path*", destination: "/#plans", permanent: false },
            { source: "/offer/:path*", destination: "/#plans", permanent: false },
          ]
        : []),
      { source: "/quiz", destination: "/#plans", permanent: false },
      { source: "/offer/club-lite", destination: "/thank-you", permanent: false },
      // The quiz numbers moved into the admin panel.
      { source: "/stats/quiz", destination: "/admin/quiz", permanent: false },
    ];
  },
};

export default nextConfig;
