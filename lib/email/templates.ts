import { ITEMS, PRODUCTS, per, total, usd, type Item } from "@/lib/funnel";
import { EMAIL_BASE, renderEmail, type Block, type Email } from "./layout";
import { hoursLabel, type QuizResult } from "@/lib/quiz-plan";
import { DISCLAIMER } from "@/content/quiz";

// Every email we send. Copy follows the site (English, calm, no hype, no promises about a child): words like
// "free", "guaranteed", ALL CAPS and piles of exclamation marks are spam signals as much as they're off-brand.

/** Sent once, when a parent's Crew Club subscription first shows up in the Creem webhook. */
export function clubWelcome(plan: "monthly" | "yearly"): Email {
  const item = plan === "yearly" ? ITEMS.clubYearly : ITEMS.clubMonthly;
  const includes = PRODUCTS.club.get.filter((g) => !g.startsWith("Pause or cancel"));
  return renderEmail({
    subject: "Welcome to the Crew Club",
    preheader: "What your membership includes, and how to pause or cancel anytime.",
    kick: "you're in",
    title: "Welcome to the Crew Club",
    art: "duo",
    blocks: [
      { p: "Thanks for joining. The crew keeps growing with your kid, and members meet every new crew member first." },
      { p: "Here’s what your membership includes:" },
      { list: includes },
      { rows: [["Your plan", plan === "yearly" ? "Yearly" : "Monthly"], ["Price", per(item)]] },
      { button: { label: "Open my account", url: "/account" } },
      {
        note:
          plan === "yearly"
            ? "We email you a week before your membership renews. Pause or cancel anytime in your account, in 2 clicks."
            : "Pause or cancel anytime in your account, in 2 clicks. No calls, no emails needed.",
      },
    ],
    reason: "You’re getting this email because you joined the Crew Club at littlebraincrew.com.",
  });
}

const ART: Record<string, string> = { guide: PRODUCTS.guide.art, program: PRODUCTS.program.art, upgrade: PRODUCTS.program.art, "screen-off-week": "dopa" };
const TONIGHT: Record<string, string> = {
  guide: "Tonight: read the chapter for what’s hardest at home right now. Start with the whole toolkit on one page (p. 5).",
  program: "Tonight: read Day 1 of the Reset and choose your bedtime. 10 minutes.",
  upgrade: "Tonight: read Day 1 of the Reset and choose your bedtime. 10 minutes.",
  "screen-off-week": "Tonight: watch evening 1 with your kid before the screen goes off. 3 minutes.",
};

/** One group of download links in the receipt: `label` is the group's name, each file a button with its own link. */
export type ReceiptSection = { label: string; files: { name: string; url: string }[] };

/** For one-time purchases: the order, then one download link per file (lib/delivery.ts builds the links per buyer). */
export function orderReceipt(items: Item[], sections: ReceiptSection[]): Email {
  const main = items.find((i) => ART[i.id]) ?? items[0];
  const blocks: Block[] = [
    { rows: items.map((i): [string, string] => [i.name, usd(i.price)]), total: ["Total", usd(total(items))] },
    { p: "Your files are ready. The links are personal, so please keep them to yourself." },
  ];
  for (const s of sections) {
    if (s.files.length === 1) {
      blocks.push({ button: { label: s.label, url: s.files[0].url } });
    } else {
      blocks.push({ note: s.label });
      for (const f of s.files) blocks.push({ button: { label: f.name, url: f.url } });
    }
  }
  if (main && TONIGHT[main.id]) blocks.push({ note: TONIGHT[main.id] });
  blocks.push({ p: "Creem, our payment partner, sends your official payment receipt in a separate email." });
  return renderEmail({
    subject: "Your Little Brain Crew order",
    preheader: "Your download links, and one small thing to try tonight.",
    kick: "thank you",
    title: "Your order is ready",
    art: main ? ART[main.id] : undefined,
    blocks,
    reason: "You’re getting this email because you bought from littlebraincrew.com.",
  });
}

/** Before every yearly renewal (the site promises it). Needs a daily job to send; not scheduled yet. */
export function renewalReminder(renewsOn: string): Email {
  return renderEmail({
    subject: `Your Crew Club renews on ${renewsOn}`,
    preheader: "Nothing to do if you want to stay. Here’s how to change or cancel.",
    kick: "a quick heads-up",
    title: "Your Crew Club renews soon",
    art: "teo",
    blocks: [
      { p: `Your yearly membership renews on ${renewsOn} for ${usd(ITEMS.clubYearly.price)}.` },
      { p: "If you want to keep it, there’s nothing to do." },
      { button: { label: "Manage my membership", url: "/account" } },
      { note: "Want to pause or cancel? Do it in your account, in 2 clicks, before that date and you won’t be charged." },
    ],
    reason: "You’re getting this email because you have a yearly Crew Club membership. We send it before every renewal.",
  });
}

/** The /code quiz result, sent when a parent leaves their email at the gate. Same result as the screen (lib/quiz-plan.ts).
 *  confirmTipsUrl: the parent ticked the weekly tips; nothing is sent until they confirm with this link (double opt-in). */
export function quizResultEmail(r: QuizResult, { confirmTipsUrl }: { confirmTipsUrl?: string } = {}): Email {
  const blocks: Block[] = [
    { p: "Here’s what you saw in the quiz, to keep. These are the crew members behind the moments you picked:" },
    { list: r.picks.map((m) => `${m.label}: ${m.line}`) },
    { p: `Your kid’s stage: ${r.age.stage.name} (${r.age.stage.real}), ${r.age.stage.job}.` },
  ];
  if (r.sleep) blocks.push({ p: `Sleep check: about ${hoursLabel(r.sleep.hours)} hours a night. Sleep doctors (AASM) recommend ${r.sleep.says}.` });
  if (r.home.length) blocks.push({ p: `Villains at your house: ${r.home.map((v) => `${v.char.name} (${v.char.real.toLowerCase()})`).join(", ")}.` });
  if (r.villain) blocks.push({ p: `The villain to beat first: ${r.villain.name} (${r.villain.real}).` });
  blocks.push(
    { p: "Your 3-night plan. Same time, same words, three nights in a row:" },
    { list: r.nights.map((n, i) => `Night ${i + 1}: ${n}`) },
  );
  if (r.lead.kid) blocks.push({ note: `Say it to your kid: ${r.lead.kid}` });
  blocks.push(
    { p: "Want the habits behind it? The Kid Brain Toolkit is open now: what science really knows about sleep, focus, mood and energy in kids, in 10 chapters with a version of every habit for ages 4–7, 8–12 and 13–17. $9, instant download at littlebraincrew.com." },
  );
  if (confirmTipsUrl) {
    blocks.push(
      { p: "You also asked for one short crew tip a week. Tap below to confirm it’s you. Until you do, we won’t send any." },
      { button: { label: "Yes, send me the weekly tip", url: confirmTipsUrl } },
    );
  }
  blocks.push({ note: DISCLAIMER });
  return renderEmail({
    subject: "Your kid’s crew and 3-night plan",
    preheader: `${r.lead.char.name} and the crew behind your hard moments, plus what to try tonight.`,
    kick: "your quiz results",
    title: "Meet the crew behind your hard moments",
    art: r.lead.char.key,
    blocks,
    reason: "You’re getting this email because you asked for your quiz results at littlebraincrew.com/code.",
  });
}

/** The one abandoned-checkout reminder (lib/checkout-reminders.ts): what they picked, a button back, and no pressure. */
export function checkoutReminder(
  items: Item[],
  checkoutUrl: string,
  moment: { title: string; page: number; plan: string } | undefined,
  unsubscribeUrl: string,
): Email {
  const main = items[0];
  const blocks: Block[] = [
    { p: `You started an order for ${main.name} but didn’t finish paying, so nothing was charged.` },
    { rows: items.map((i): [string, string] => [i.name, usd(i.price)]), total: ["Total", usd(total(items))] },
  ];
  if (moment) blocks.push({ p: `You were looking at “${moment.title}”. The plan for it is on page ${moment.page} of the Toolkit (${moment.plan}).` });
  blocks.push(
    { button: { label: "Finish my order", url: checkoutUrl } },
    { p: "If the payment page gave you trouble, just reply to this email and we’ll sort it out." },
    { note: `This is the only reminder we send about this order. Don’t want emails like this? Unsubscribe here: ${EMAIL_BASE}${unsubscribeUrl}` },
  );
  return renderEmail({
    subject: `Your ${main.name} is one step away`,
    preheader: "You didn’t finish paying, so nothing was charged. Your order is still here.",
    kick: "still here",
    title: "You were one step away",
    art: ART[main.id] ?? "duo",
    blocks,
    reason: "You’re getting this email because you entered this address at checkout on littlebraincrew.com.",
  });
}

/** What each newsletter form promised, for its confirmation email (lib/analytics.ts NEWSLETTER_FORMS). */
const CONFIRM_FOR: Record<string, { what: string; art: string }> = {
  "free-screen-list": { what: "the free list: 15 ways to end screen time without tears", art: "dopa" },
  "sticker-pack": { what: "the free crew sticker pack and a few tips", art: "toci" },
  "screen-off-challenge": { what: "the 5-day Screen-Off Challenge with Dopa", art: "dopa" },
};

/** Double opt-in: sent when someone signs up on a newsletter form. Nothing else is sent until they tap the button. */
export function confirmSignup(form: string, url: string): Email {
  const c = CONFIRM_FOR[form] ?? { what: "crew tips by email", art: "duo" };
  return renderEmail({
    subject: "Please confirm your email",
    preheader: "One tap, so we know it’s really you.",
    kick: "one tap",
    title: "Is this you?",
    art: c.art,
    blocks: [
      { p: `Someone, hopefully you, asked littlebraincrew.com for ${c.what}.` },
      { p: "Tap the button to confirm. Until you do, we won’t send anything else." },
      { button: { label: "Yes, that’s me", url } },
      { note: "Didn’t ask for this? Just ignore this email and we won’t write again." },
    ],
    reason: "You’re getting this email because this address was entered in a form at littlebraincrew.com.",
  });
}

// ---------- Free offers on /free, sent once the address is confirmed (lib/free-offers.ts) ----------

// No other domains in list emails (README: Email): links or bare domains of other sites are a spam signal.
const FOLLOW = "The crew posts a short cartoon explainer most days. Find us as Little Brain Crew on Instagram and TikTok.";

/** The free printable: 15 ways to end screen time without tears (public/downloads, built by products/build.mjs). */
export function freeScreenList(unsubscribe: string): Email {
  return renderEmail({
    subject: "Your list: 15 ways to end screen time without tears",
    preheader: "Two pages to print and stick on the fridge.",
    kick: "here it is",
    title: "15 ways to end screen time without tears",
    art: "dopa",
    blocks: [
      { p: "Thanks for confirming. Here’s your list: two pages, made to print and keep on the fridge." },
      { button: { label: "Open the list (PDF)", url: "/downloads/15-ways-to-end-screen-time.pdf" } },
      { p: "If you only try one thing this week, try number 5: warn twice, at 5 minutes and at 1 minute, with a timer your kid can see. Surprise endings are the hardest ones." },
      { p: FOLLOW },
    ],
    reason: "You’re getting this email because you asked for the free list at littlebraincrew.com/free.",
    unsubscribe,
  });
}

/** The free crew sticker pack (public/downloads/crew-stickers.zip, built by scripts/build-sticker-zip.mjs). */
export function freeStickerPack(unsubscribe: string): Email {
  return renderEmail({
    subject: "Your crew sticker pack",
    preheader: "12 stickers for your family chats: “5 more min?”, “Hug?” and more.",
    kick: "for your chats",
    title: "Your crew sticker pack",
    art: "toci",
    blocks: [
      { p: "Thanks for confirming. Here are the 12 crew stickers, 512 × 512 px." },
      { button: { label: "Download the stickers (ZIP)", url: "/downloads/crew-stickers.zip" } },
      {
        list: [
          "iMessage and Telegram: open the png folder and send them like any picture.",
          "WhatsApp: add the webp files with a sticker app (Sticker Maker or similar).",
          "On a phone, open the email on the device you chat from.",
        ],
      },
      { p: FOLLOW },
    ],
    reason: "You’re getting this email because you asked for the free sticker pack at littlebraincrew.com/free.",
    unsubscribe,
  });
}

/** The 5-day Screen-Off Challenge with Dopa: one email and one small task a day (lib/free-offers.ts sends them). */
export const CHALLENGE_DAYS = [
  {
    name: "Notice",
    subject: "Day 1 of 5: just notice",
    preheader: "Today’s task takes no willpower at all.",
    blocks: [
      { p: "Welcome to the Screen-Off Challenge. Five days, one small step a day, about five minutes each." },
      { p: "Here’s why screen endings are so hard: shows and apps hand out quick, easy rewards, and most have no natural finish line. On the site we draw that “want more” feeling as Dopa. When the screen goes dark, Dopa suddenly loses its easy stars. Nothing is wrong with your kid." },
      { note: "Today’s task: watch one screen ending and notice three things. What was on the screen when it ended (an episode, a game, an endless feed)? Did it end by surprise? What came right after? Write it down. No changes yet." },
    ] as Block[],
  },
  {
    name: "Warn",
    subject: "Day 2 of 5: warn twice",
    preheader: "Surprise endings are the hardest ones.",
    blocks: [
      { p: "Yesterday you watched. Today, one change: no more surprise endings." },
      { list: ["Set a timer your kid can see, so the timer ends it, not you.", "Warn at 5 minutes, then at 1 minute. Some families use 10 and 2: pick one and keep it.", "Before you speak, touch a shoulder and wait for eye contact. Words don’t reach a kid who’s still inside the screen."] },
      { note: "Today’s task: give both warnings at today’s screen ending, with the timer in sight." },
    ] as Block[],
  },
  {
    name: "Swap",
    subject: "Day 3 of 5: land somewhere",
    preheader: "Going to something is easier than leaving something.",
    blocks: [
      { p: "A screen that ends into nothing feels like a loss. A screen that ends into something is a step." },
      { p: "Decide what comes right after: a snack, a small job, a game outside, a song in the kitchen. Say it before the screen goes on: “Two episodes, then we turn it off and make popcorn.”" },
      { note: "Today’s task: with your kid, write an “instead” list of ten things to do that aren’t screens, in their words. Put it on the fridge." },
    ] as Block[],
  },
  {
    name: "Win",
    subject: "Day 4 of 5: hold the line, kindly",
    preheader: "The exact words for when the tears come anyway.",
    blocks: [
      { p: "Some days the tears come anyway. That’s normal, and it isn’t a sign the plan failed." },
      { list: ["Offer a small choice: “Do you want to turn it off, or should I?”", "Name the feeling and keep the limit: “Two things are true: screen time is over, and you’re allowed to be upset.”", "Say less. One short sentence, repeated, and stay close."] },
      { p: "What not to do: give the screen back to stop the crying, or debate a rule you’ve already set. Pushback often fades within a week or two of steady endings." },
      { note: "Today’s task: use the “two things are true” line once, out loud, even if it feels a bit strange." },
    ] as Block[],
  },
  {
    name: "Celebrate",
    subject: "Day 5 of 5: notice what changed",
    preheader: "Praise the effort, then keep the same ending.",
    blocks: [
      { p: "Last day. Look back at your notes from Day 1. What’s different now, even a little?" },
      { p: "Tell your kid what you noticed, and praise the effort, not the result: “You turned it off when the timer rang, even though you were in the middle of a level. That was hard.”" },
      { p: "Then keep the same ending tomorrow: same warnings, same words, same next step. Kids handle limits better when they can predict them. If your kid is older, make a deal, not a rule: write a family media plan together, parents’ phones included." },
      { note: "Today’s task: say one specific “I noticed” sentence to your kid about this week." },
      { p: "If you want the whole map behind this (sleep, focus, meltdowns, the teen years), that’s what the Kid Brain Toolkit is for. And if this week helped, reply and tell us. We read every email." },
    ] as Block[],
  },
];

export function challengeDay(day: number, unsubscribe: string): Email {
  const d = CHALLENGE_DAYS[day - 1];
  return renderEmail({
    subject: d.subject,
    preheader: d.preheader,
    kick: "screen-off challenge",
    title: `Day ${day}: ${d.name}`,
    art: "dopa",
    blocks: [
      ...d.blocks,
      ...(day === 5 ? [{ button: { label: "See the Toolkit", url: "/#plans" } }] : []),
      { p: day < 5 ? `Tomorrow: Day ${day + 1}, ${CHALLENGE_DAYS[day].name}. ${FOLLOW}` : FOLLOW },
    ],
    reason: "You’re getting this email because you joined the 5-day Screen-Off Challenge at littlebraincrew.com/free. It ends after Day 5.",
    unsubscribe,
  });
}
