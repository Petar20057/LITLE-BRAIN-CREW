import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: { root: import.meta.dirname },
  // The free quiz was removed; old links and ads land on the plans. Crew Club Lite was removed too:
  // its old offer page goes straight to the order.
  async redirects() {
    return [
      { source: "/quiz", destination: "/#plans", permanent: false },
      { source: "/offer/club-lite", destination: "/thank-you", permanent: false },
    ];
  },
};

export default nextConfig;
