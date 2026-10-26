import type { Metadata } from "next";

// The /code quiz (sent in Instagram DMs) and its stats page: no menu and not in search, like the funnel,
// but without the payments preview note, which has nothing to do with the quiz.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function QuizLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="fx">
      <header className="fx-top">
        <span className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-img" src="/assets/brand/lbc-logo-horizontal.svg" alt="Little Brain Crew" width={133} height={48} />
        </span>
      </header>
      <main className="fx-wrap">{children}</main>
    </div>
  );
}
