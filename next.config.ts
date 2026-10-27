import type { NextConfig } from "next";

// No payment processor is connected yet: the Toolkit, the 30-Day Reset and the Crew Club show "Coming soon" and the
// checkout and offer pages send visitors back to the plans. Set to false once Creem is live (lib/funnel.ts PREVIEW too).
const COMING_SOON = true;

// Sent with every response. Vercel adds HSTS itself. No script CSP yet: Next's inline bootstrap scripts would need a
// nonce on every request, which turns the static pages dynamic. So this sticks to what can't break a page: no framing
// by other sites (clickjacking), no MIME sniffing, no plugins, forms only to us, no camera, microphone or location.
// Payment Request stays off on our pages; Creem's checkout runs on its own domain.
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
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
