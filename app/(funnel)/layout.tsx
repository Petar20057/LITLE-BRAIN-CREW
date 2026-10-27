import type { Metadata } from "next";
import { COMING_SOON, PREVIEW } from "@/lib/funnel";

// Checkout, offers, thank you, support and account: no menu, nothing to click away to.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function FunnelLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="fx">
      <header className="fx-top">
        <a href="/" className="logo" aria-label="Little Brain Crew home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-img" src="/assets/brand/lbc-logo-horizontal.svg" alt="" width={133} height={48} />
        </a>
      </header>
      {PREVIEW && !COMING_SOON && <p className="fx-preview">Preview: no real payment is taken. Creem checkout gets connected next.</p>}
      <main className="fx-wrap">{children}</main>
    </div>
  );
}
