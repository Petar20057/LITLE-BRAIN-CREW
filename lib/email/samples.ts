import { ITEMS, MOMENTS } from "@/lib/funnel";
import type { Email } from "./layout";
import { challengeDay, checkoutReminder, clubWelcome, confirmSignup, freeScreenList, freeStickerPack, orderReceipt, quizResultEmail, renewalReminder } from "./templates";
import { quizData } from "@/lib/quiz";
import { quizResult } from "@/lib/quiz-plan";

// Sample data for the /dev/emails previews. The receipt's download links point at the account page only because file delivery isn't built yet.
const SAMPLE_CONFIRM = "/confirm?t=00000000-0000-4000-8000-000000000000";
const SAMPLE_UNSUBSCRIBE = "/unsubscribe?t=00000000-0000-4000-8000-000000000000";

export const SAMPLES: Record<string, () => Email> = {
  "club-welcome": () => clubWelcome("monthly"),
  "club-welcome-yearly": () => clubWelcome("yearly"),
  "order-receipt": () =>
    orderReceipt(
      [ITEMS.guide, ITEMS.bedtimeKit],
      [
        { label: "Start here: The Kid Brain Toolkit", files: [{ name: "Start here: The Kid Brain Toolkit", url: "https://www.littlebraincrew.com/api/download" }] },
        { label: "For tonight: a calmer bedtime and screen-off", files: [{ name: "The words and routine for lights-out and screen-off", url: "https://www.littlebraincrew.com/api/download" }, { name: "Listen: Mela and the Soft-Light Night", url: "https://www.littlebraincrew.com/api/download" }] },
      ],
    ),
  "renewal-reminder": () => renewalReminder("November 26, 2026"),
  "quiz-result": () => quizResultEmail(quizResult(quizData(), { age: "6-7", moments: ["screens", "after-school", "wired"], sleep: { bed: 21 * 60 + 30, wake: 6 * 60 + 30 }, villains: ["bedi", "lupi"] })!),
  "quiz-result-tips": () =>
    quizResultEmail(quizResult(quizData(), { age: "8-9", moments: ["screens", "cant-sleep"], sleep: null, villains: null })!, { confirmTipsUrl: SAMPLE_CONFIRM }),
  "checkout-reminder": () => checkoutReminder([ITEMS.guide], "/checkout/guide?utm_source=reminder&crew=dopa&moment=screen-off", MOMENTS["screen-off"], SAMPLE_UNSUBSCRIBE),
  "confirm-free-screen-list": () => confirmSignup("free-screen-list", SAMPLE_CONFIRM),
  "confirm-sticker-pack": () => confirmSignup("sticker-pack", SAMPLE_CONFIRM),
  "confirm-screen-off-challenge": () => confirmSignup("screen-off-challenge", SAMPLE_CONFIRM),
  "free-screen-list": () => freeScreenList(SAMPLE_UNSUBSCRIBE),
  "free-sticker-pack": () => freeStickerPack(SAMPLE_UNSUBSCRIBE),
  ...Object.fromEntries([1, 2, 3, 4, 5].map((d) => [`challenge-day-${d}`, () => challengeDay(d, SAMPLE_UNSUBSCRIBE)])),
};

