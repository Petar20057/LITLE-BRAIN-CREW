import type { Metadata } from "next";
import Quiz from "@/components/quiz/Quiz";
import { quizData } from "@/lib/quiz";

// The lead magnet ManyChat sends for the keyword CODE. Not linked from the site and not in the sitemap.
export const metadata: Metadata = {
  title: "Crack your kid’s code · Little Brain Crew",
  description: "A 3-minute quiz for parents of kids 4–17: the crew behind your hard moments, and a 3-night plan.",
};

export default function Page() {
  return <Quiz data={quizData()} />;
}
