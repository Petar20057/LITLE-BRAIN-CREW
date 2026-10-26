import type { Metadata } from "next";

// The team's admin panel: no site menu and never in search.
export const metadata: Metadata = { title: "Admin · Little Brain Crew", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="fx adm">
      <header className="fx-top">
        <a href="/admin" className="logo" aria-label="Admin home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-img" src="/assets/brand/lbc-logo-horizontal.svg" alt="" width={133} height={48} />
        </a>
      </header>
      <main className="fx-wrap">{children}</main>
    </div>
  );
}
