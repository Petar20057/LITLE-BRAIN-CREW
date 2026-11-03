import { ITEMS, MOMENTS } from "@/lib/funnel";
import type { Email } from "./layout";
import { challengeDay, checkoutReminder, clubWelcome, confirmSignup, freeScreenList, freeStickerPack, orderReceipt, planConfirmation, planTeamNotification, quizResultEmail, renewalReminder } from "./templates";
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
        { label: "For tonight: a calmer bedtime and screen-off", files: [{ name: "Seven evenings, the screen-off scripts and a bedtime story", url: "https://www.littlebraincrew.com/api/download" }] },
      ],
    ),
  "renewal-reminder": () => renewalReminder("November 26, 2026"),
  "plan-confirmation": () => planConfirmation("Ana"),
  "plan-team": () =>
    planTeamNotification({
      request: {
        name: "Ana", kid_age: 7, moment: "screen-off",
        answers: {
          when_happens: "Most school nights, right after the tablet goes off. Weekends are fine.",
          how_long: "months",
          tried: "Timers, a 5-minute warning, taking the tablet away. The warning helps a little; taking it away ends in a 20-minute meltdown.",
          good_week: "Screens off at 7 with some grumbling but no tears, and in bed by 8:30.",
          owns: ["toolkit"],
          timezone: "America/New_York",
        },
      },
      email: "ana@example.com", amountCents: 19900, providerOrderId: "ord_sample", requestId: "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
    }),
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

