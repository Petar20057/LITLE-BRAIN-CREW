import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { SITE_URL } from "@/lib/design";
import Track from "@/components/Track";
import Clarity from "@/components/Clarity";
import "../public/assets/site.css";
import "../public/assets/additions.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    other: {
      "msvalidate.01": "F195393389168270B5DD28097565A0B5",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      // Google Search shows a favicon only if one is a multiple of 48px square.
      { url: "/assets/brand/favicon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/assets/brand/favicon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/assets/brand/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/assets/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/assets/brand/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/assets/brand/lbc-app-icon-180.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FF5A36",
};

// Fonts the first phone screen needs (headline, body, buttons): fetch them with the HTML instead of after the CSS.
const FIRST_SCREEN_FONTS = [
  "bricolage-grotesque-latin-800-normal",
  "figtree-latin-400-normal",
  "figtree-latin-700-normal",
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  for (const f of FIRST_SCREEN_FONTS) {
    preload(`/assets/fonts/${f}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <Track />
        <Clarity />
      </body>
    </html>
  );
}
