import { ITEMS } from "@/lib/funnel";
import type { Email } from "./layout";
import { clubWelcome, orderReceipt, quizResultEmail, renewalReminder } from "./templates";
import { quizData } from "@/lib/quiz";
import { quizResult } from "@/lib/quiz-plan";

// Sample data for the /dev/emails previews. The receipt's download links point at the account page only because file delivery isn't built yet.
export const SAMPLES: Record<string, () => Email> = {
  "club-welcome": () => clubWelcome("monthly"),
  "club-welcome-yearly": () => clubWelcome("yearly"),
  "order-receipt": () => orderReceipt([ITEMS.guide, ITEMS.bedtimeKit], [{ name: "The Kid Brain Toolkit", url: "/account" }, { name: "the Bedtime & Screen-Off Kit", url: "/account" }]),
  "renewal-reminder": () => renewalReminder("November 26, 2026"),
  "quiz-result": () => quizResultEmail(quizResult(quizData(), "6-7", ["screens", "after-school", "wired"])!),
};

