"use client";

import { useEffect } from "react";

// Something broke while rendering a page. The visitor sees a calm message and a way to retry, never the error itself;
// the details go to the browser console and, on the server side, to the Vercel logs.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="fx">
      <main className="fx-wrap">
        <div className="fx-card fx-narrow" style={{ margin: "24px auto 0" }} role="alert">
          <h1>Something went wrong</h1>
          <p className="fx-sub">It’s on our side, not yours. Please try again. If it keeps happening, write to hello@littlebraincrew.com.</p>
          <p>
            <button className="btn btn-main" type="button" onClick={reset}>Try again</button> <a className="btn" href="/">Go to the home page</a>
          </p>
        </div>
      </main>
    </div>
  );
}
