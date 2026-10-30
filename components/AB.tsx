import type { ReactNode } from "react";
import type { ExperimentId } from "@/lib/experiments";

// One spot of an A/B test on a React page (lib/experiments.ts): both versions are rendered, and the CSS from the
// <head> shows the visitor's. Same markup on the server and in the browser, so hydration never mismatches.
// Without a "b" (the test has no approved copy yet) only "a" is rendered, as plain content.

export default function AB({ test, a, b }: { test: ExperimentId; a: ReactNode; b?: ReactNode }) {
  if (b === undefined) return <>{a}</>;
  return (
    <>
      <span data-ab={test} data-v="a">{a}</span>
      <span data-ab={test} data-v="b">{b}</span>
    </>
  );
}
