import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/design";
import "../public/assets/site.css";
import "../public/assets/additions.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
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
      <body>{children}</body>
    </html>
  );
}
