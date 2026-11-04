import type { NextConfig } from "next";

// Payments are live through Creem (2026-10-28). Set back to true to show "Coming soon" again and send the checkout and
// offer pages back to the plans (lib/funnel.ts COMING_SOON and PREVIEW too).
const COMING_SOON = false;

// The offers after a Toolkit order (/offer/upgrade, then /offer/bedtime). Keep in step with UPSELL_OPEN in lib/funnel.ts.
const UPSELL_OPEN = true;

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
  // The free quiz was removed; old links and ads land on the plans. The Crew Club (a membership, removed 2026-11-04)
  // and Club Lite before it: their old checkout and offer links go to the plans or the order, the old cancel page to
  // the account.
  async redirects() {
    return [
      { source: "/schools", destination: "/", permanent: true },
      { source: "/founding", destination: "/", permanent: true },
      { source: "/gift", destination: "/", permanent: true },
      { source: "/free", destination: "/#free", permanent: true },
      ...(COMING_SOON
        ? [
            { source: "/checkout/:path*", destination: "/#plans", permanent: false },
            { source: "/offer/:path*", destination: "/#plans", permanent: false },
          ]
        : []),
      { source: "/checkout/club", destination: "/#plans", permanent: true },
      // Since 2026-11-04 the Toolkit is everything: the Reset, its page and the $20 upgrade are no longer sold on their own.
      { source: "/checkout/program", destination: "/checkout/guide", permanent: true },
      { source: "/reset", destination: "/toolkit", permanent: true },
      { source: "/offer/upgrade", destination: "/thank-you", permanent: false },
      { source: "/quiz", destination: "/#plans", permanent: false },
      { source: "/offer/club-lite", destination: "/thank-you", permanent: false },
      { source: "/account/cancel", destination: "/account", permanent: true },
      // The affiliate program (a Club perk) went with the Club.
      { source: "/affiliate", destination: "/", permanent: true },
      { source: "/account/affiliate", destination: "/account", permanent: true },
      // Until UPSELL_OPEN no offer is sold (the Toolkit goes straight to the thank-you page). After it, only the Bedtime
      // Kit is: the old Club offer and Screen-Off Week (no cartoons yet) still go to the order.
      ...(UPSELL_OPEN
        ? [{ source: "/offer/:slug(club|screen-off-week)", destination: "/thank-you", permanent: false }]
        : [{ source: "/offer/:path*", destination: "/#plans", permanent: false }]),
      // "Support the crew" is hidden: Creem doesn't allow payments with no product behind them.
      { source: "/support", destination: "/", permanent: false },
      // The quiz numbers moved into the admin panel.
      { source: "/stats/quiz", destination: "/admin/quiz", permanent: false },
    ];
  },
};

export default nextConfig;
