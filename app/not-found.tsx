import type { Metadata } from "next";
import LearnShell from "@/components/learn/LearnShell";
import CharArt from "@/components/learn/CharArt";

// Any page that doesn't exist (and every notFound()): the site's header and footer, and ways back in.
export const metadata: Metadata = { title: "Page not found · Little Brain Crew", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <LearnShell>
      <section className="sec s-white learn-hub">
        <div className="wrap">
          <div style={{ width: 140, marginBottom: 8 }}>
            <CharArt char="nora" mood="tired" />
          </div>
          <span className="kick">404</span>
          <h1>This page wandered off</h1>
          <p className="lede">Nora looked everywhere and couldn’t find it. The link may be old or mistyped.</p>
          <p>
            <a className="btn btn-main" href="/">Go to the home page</a> <a className="btn" href="/learn">Browse the guides</a>
          </p>
        </div>
      </section>
    </LearnShell>
  );
}
