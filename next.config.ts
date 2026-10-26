import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: { root: import.meta.dirname },
  // The free quiz was removed; old links and ads land on the plans.
  async redirects() {
    return [{ source: "/quiz", destination: "/#plans", permanent: false }];
  },
};

export default nextConfig;
