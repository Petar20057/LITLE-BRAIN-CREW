import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/design";
import Track from "@/components/Track";
import "../public/assets/site.css";
import "../public/assets/additions.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <Track />
      </body>
    </html>
  );
}
