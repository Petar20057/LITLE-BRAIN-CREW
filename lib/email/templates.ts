import { ITEMS, MOMENTS, PRODUCTS, total, usd, type Item } from "@/lib/funnel";
import { renderEmail, type Block, type Email } from "./layout";
import { hoursLabel, offerLinks, type QuizResult } from "@/lib/quiz-plan";
import { DISCLAIMER } from "@/content/quiz";
import { PLAN_FIELDS, PLAN_REPLY_DAYS, UNPAID_KEEP_DAYS, answerLabel, momentTitle } from "@/lib/personal-plan-form";

// Every email we send. Copy follows the site (English, calm, no hype, no promises about a child): words like
// "free", "guaranteed", ALL CAPS and piles of exclamation marks are spam signals as much as they're off-brand.
//
// What each one is tuned for (tests/email.test.ts keeps the numbers honest):
//  - open rate: a subject that says what's inside, front-loaded (a phone shows about 40 characters), and a preheader that
//    adds something the subject doesn't; the quiz result and the order receipt name the crew or the product.
//  - click rate: one coral button per email, a white one for a second choice, a bold text link for a soft offer; links to
//    the Toolkit land on the page for the moment the reader came for.
//  - delivery: replies are invited (a reply is the strongest "wanted" signal a mailbox sees) and the first list email asks
//    for a contact, so the rest stay out of Promotions. Every link to our site carries UTM tags (layout.ts tag()).

/** The address every email comes from (lib/email/send.ts). */
const HELLO = "hello@littlebraincrew.com";

/** The Toolkit, opened on the screen-endings page: where the free list and the challenge point, because that's what they're about. */
const SCREEN_OFF = MOMENTS["screen-off"];
const SCREEN_OFF_CHECKOUT = "/checkout/guide?crew=dopa&moment=screen-off";

const ART: Record<string, string> = { guide: PRODUCTS.guide.art, program: "endo", upgrade: "endo", "bedtime-kit": PRODUCTS.bedtime.art, "screen-off-week": "dopa" };
const TONIGHT: Record<string, string> = {
  "bedtime-kit": "Tonight: try Day 1 of Screen-Off Week, then read The Crew Goes to Sleep together.",
  guide: "Tonight: find what’s hardest at home right now on The code on one page (p. 4 of the Toolkit) and read that moment’s page. Ten minutes. Tomorrow: Day 0 of the 30-Day Reset, and the Complete Crew Guide for the character behind any moment.",
  program: "Tonight: read Day 1 of the Reset and choose your bedtime. 10 minutes.",
  upgrade: "Tonight: read Day 1 of the Reset and choose your bedtime. 10 minutes.",
  "screen-off-week": "Tonight: watch evening 1 with your kid before the screen goes off. 3 minutes.",
};

/** One group of download links in the receipt: `label` is the group's name, each file a button with its own link. */
export type ReceiptSection = { label: string; files: { name: string; url: string }[] };

/** For one-time purchases: the order, then one download link per file (lib/delivery.ts builds the links per buyer). */
export function orderReceipt(items: Item[], sections: ReceiptSection[], amountCents = Math.round(total(items) * 100)): Email {
  const main = items.find((i) => ART[i.id]) ?? items[0];
  const adjustment = amountCents - Math.round(total(items) * 100);
  const rows = items.map((i): [string, string] => [i.name, usd(i.price)]);
  if (adjustment) rows.push(["Discounts & taxes", `${adjustment < 0 ? "−" : "+"}${usd(Math.abs(adjustment) / 100)}`]);
  const blocks: Block[] = [
    { rows, total: ["Total paid", usd(amountCents / 100)] },
    { p: "Your files are ready. The links are personal, so please keep them to yourself." },
  ];
  // The first file is the coral button (where to start); the rest are white ones, so a long list doesn't shout.
  let first = true;
  const file = (label: string, url: string): Block => {
    const button = { label, url, ...(first ? {} : { secondary: true }) };
    first = false;
    return { button };
  };
  for (const s of sections) {
    if (s.files.length === 1) {
      blocks.push(file(s.label, s.files[0].url));
    } else {
      blocks.push({ note: s.label });
      for (const f of s.files) blocks.push(file(f.name, f.url));
    }
  }
  if (main && TONIGHT[main.id]) blocks.push({ note: TONIGHT[main.id] });
  blocks.push({ p: "Trouble with a download? Just reply to this email and we’ll fix it. Creem, our payment partner, sends your official payment receipt in a separate email." });
  return renderEmail({
    subject: `${main?.name ?? "Your order"}: your download links`,
    preheader: "Your files are ready, plus one small thing to try tonight.",
    kick: "thank you",
    title: "Your order is ready",
    art: main ? ART[main.id] : undefined,
    blocks,
    reason: "You’re getting this email because you bought from littlebraincrew.com.",
    campaign: "order-receipt",
  });
}

/** After a paid Personal plan (lib/personal-plan.ts): what was paid and what happens next. No files, no button: the plan
 *  itself arrives by email within PLAN_REPLY_DAYS working days. */
export function planConfirmation(name: string | undefined, amountCents = ITEMS.personalPlan.price * 100): Email {
  const item = ITEMS.personalPlan;
  const adjustment = amountCents - item.price * 100;
  const rows: [string, string][] = [[item.name, usd(item.price)]];
  if (adjustment) rows.push(["Discounts & taxes", `${adjustment < 0 ? "−" : "+"}${usd(Math.abs(adjustment) / 100)}`]);
  const days = `${PLAN_REPLY_DAYS} working days`;
  return renderEmail({
    subject: "Your Personal plan: we got your answers",
    preheader: `We read every word. Your plan lands within ${days}, from hello@littlebraincrew.com.`,
    kick: "thank you",
    title: "We’ve got your answers",
    art: "fronti",
    blocks: [
      { rows, total: ["Total paid", usd(amountCents / 100)] },
      { p: `Thanks${name ? `, ${name}` : ""}. Here’s what happens next:` },
      {
        list: [
          "We read your answers and write your plan: the crew member behind the moment, one small move for each evening and the exact words for your kid’s age.",
          `It lands in this inbox within ${days}, from ${HELLO}. Add us to your contacts so it doesn’t end up in Promotions.`,
          "Questions once you have it? Reply to that email. We answer every one.",
        ],
      },
      { note: "Something to add? Reply to this email and we’ll put it in the plan." },
      { p: "Creem, our payment partner, sends your official payment receipt in a separate email." },
    ],
    reason: "You’re getting this email because you ordered a Personal plan at littlebraincrew.com.",
    campaign: "plan-confirmation",
  });
}

/** Right after a parent saves the Personal plan form (app/api/personal-plan). Nothing is paid yet: the button opens the payment
 *  step for this request (lib/personal-plan-form.ts planPayPath). `payable` false while the Creem product doesn't exist yet. */
export function planSaved(name: string | undefined, moment: string, payUrl: string, payable = true): Email {
  const days = `${PLAN_REPLY_DAYS} working days`;
  return renderEmail({
    subject: "Your Personal plan answers are saved",
    preheader: payable ? `Nothing is charged yet. Continue to payment whenever you’re ready, and your plan lands within ${days}.` : "Nothing is charged yet. We’ll email you as soon as you can continue to payment.",
    kick: "answers saved",
    title: "We’ve got your answers",
    art: "toci",
    blocks: [
      { p: `Thanks${name ? `, ${name}` : ""}. Your answers about “${momentTitle(moment)}” are saved. Nothing has been charged.` },
      ...(payable
        ? [
            { p: `When you’re ready, the Personal plan is ${usd(ITEMS.personalPlan.price)}, once. A person writes it from your answers and it lands in this inbox within ${days} of payment.` },
            { button: { label: `Continue to payment · ${usd(ITEMS.personalPlan.price)}`, url: payUrl } },
          ]
        : [{ p: "Payment for the Personal plan opens in a few days. We’ll email you as soon as it does, and this link will take you straight to it." }, { link: { label: "Open my saved plan", url: payUrl } }]),
      { note: `Changed your mind? Do nothing: unpaid answers are deleted after ${UNPAID_KEEP_DAYS} days. Something to add? Reply to this email.` },
    ],
    reason: "You’re getting this email because you filled in the Personal plan form at littlebraincrew.com.",
    campaign: "plan-saved",
  });
}

/** What the team needs to write one plan: who paid, and every answer from the form. */
export type PlanSummary = { name: string; kid_age: number; moment: string; answers: Record<string, string | string[]> };

/** To the team inbox after a paid Personal plan (lib/personal-plan.ts TEAM_EMAIL). `request` is null when the form behind the
 *  payment wasn't found: the email then says so, with the Creem order to look up. */
export function planTeamNotification(o: { request: PlanSummary | null; email: string; amountCents: number; providerOrderId: string; requestId: string | null }): Email {
  const r = o.request;
  const rows: [string, string][] = [
    ["Name", r?.name ?? "—"],
    ["Email", o.email],
    ["Kid’s age", r ? String(r.kid_age) : "—"],
    ["Hardest moment", r ? momentTitle(r.moment) : "—"],
    ["Paid", usd(o.amountCents / 100)],
    ["Creem order", o.providerOrderId],
    ["Form", o.requestId ?? "none in the checkout metadata"],
  ];
  const blocks: Block[] = [{ rows }];
  if (r) {
    blocks.push(...planAnswerBlocks(r));
  } else {
    blocks.push({ p: "The form for this payment was not found. Look up the Creem order above and write to the parent at this email before the reply deadline." });
  }
  blocks.push({ button: { label: "Open in admin", url: "/admin/personal-plans" } });
  return renderEmail({
    subject: `Personal plan paid: ${o.email}`.slice(0, 62),
    preheader: `New Personal plan request. The answers are below; the plan is due within ${PLAN_REPLY_DAYS} working days.`,
    kick: "team",
    title: "New Personal plan request",
    art: "duo",
    blocks,
    reason: "Sent to the team inbox for every paid Personal plan.",
    campaign: "plan-team",
  });
}

/** Every answer from the form, label then answer, in the order the form asks. */
function planAnswerBlocks(r: PlanSummary): Block[] {
  return PLAN_FIELDS.flatMap((f): Block[] => {
    const v = r.answers[f.key];
    if (v == null || (Array.isArray(v) && v.length === 0)) return [];
    return [{ note: f.label }, { p: answerLabel(f, v) }];
  });
}

/** To the team inbox (lib/personal-plan.ts TEAM_EMAIL) the moment a parent sends the Personal plan form, paid or not. Sent with
 *  the parent's address as Reply-To, so "Reply" in the inbox answers the parent. `requestId` null: the database row couldn't be
 *  saved (or the table isn't there yet), so this email is the only copy of the answers. */
export function planRequestTeam(o: { request: PlanSummary; email: string; requestId: string | null }): Email {
  const r = o.request;
  const rows: [string, string][] = [
    ["Name", r.name],
    ["Email", o.email],
    ["Kid’s age", String(r.kid_age)],
    ["Hardest moment", momentTitle(r.moment)],
    ["Paid", "not yet"],
    ["Saved in admin", o.requestId ? "yes" : "no: this email is the only copy"],
  ];
  return renderEmail({
    subject: `New Personal plan request: ${o.email}`.slice(0, 62),
    preheader: `${r.name}, kid aged ${r.kid_age}, “${momentTitle(r.moment)}”. All the answers are below; reply to write to the parent.`.slice(0, 120),
    kick: "team",
    title: "New Personal plan request",
    art: "duo",
    blocks: [
      { rows },
      ...planAnswerBlocks(r),
      { note: "The parent got a thank-you email saying we’ll send the plan as soon as possible. Reply to this email to write to them." },
      ...(o.requestId ? [{ button: { label: "Open in admin", url: "/admin/personal-plans" } }] : []),
    ],
    reason: "Sent to the team inbox for every Personal plan form.",
    campaign: "plan-request-team",
  });
}

/** To the parent right after they send the Personal plan form while there is no online payment for it: thank you, we have your
 *  answers, the plan comes as soon as possible. (With online payment the form sends planSaved, which links to the payment.) */
export function planThanks(name: string | undefined, moment: string): Email {
  return renderEmail({
    subject: "Thank you for ordering your Personal plan",
    preheader: "We have your answers, and a person on our team is already on it. Your plan comes as soon as possible.",
    kick: "thank you",
    title: `Thank you${name ? `, ${name}` : ""}`,
    art: "toci",
    blocks: [
      { p: `Thank you for ordering your Personal plan. We have your answers about “${momentTitle(moment)}”, and a person on our team reads every word.` },
      { p: `We’ll send your plan to this address as soon as possible, within ${PLAN_REPLY_DAYS} working days at the latest: the crew member behind the moment, one small move for each evening and the exact words for your kid’s age.` },
      { note: "Something to add, or a question? Just reply to this email. A real person answers." },
    ],
    reason: "You’re getting this email because you filled in the Personal plan form at littlebraincrew.com.",
    campaign: "plan-thanks",
  });
}

/** The /code quiz result, sent when a parent leaves their email at the gate. Same result and offers as the screen
 *  (lib/quiz-plan.ts). confirmTipsUrl: the parent ticked the weekly tips; nothing is sent until they confirm with this link
 *  (double opt-in). sid: the quiz visit, so a purchase from this email counts on /admin/quiz. */
export function quizResultEmail(r: QuizResult, { confirmTipsUrl, sid }: { confirmTipsUrl?: string; sid?: string | null } = {}): Email {
  const links = offerLinks(r, sid);
  const page = MOMENTS[r.lead.toolkit];
  // The crew behind the moments they picked, up front: a name in the subject is what makes this one stand out in an inbox.
  const names = [...new Set(r.picks.map((m) => m.char.name))];
  const who = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : `${names[0]}, ${names[1]} and more`;
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
    { p: `Want the habits behind it? The Kid Brain Toolkit: the 12 hardest moments decoded with the exact words, the 30-day plan with the fridge tracker, the Science Edition and all 214 crew members in the Complete Crew Guide, with printable bonuses.${page ? ` “${page.title}”: the plan is on page ${page.page}.` : ""}` },
    { button: { label: `Get the Toolkit · ${usd(ITEMS.guide.price)}`, url: links.guide } },
    { p: "Not ready to buy? Start with the free printable: 15 ways to end screen time without tears." },
    { link: { label: "Get the free screen-time printable", url: "/#free" } },
  );
  if (confirmTipsUrl) {
    blocks.push(
      { p: "You also asked for one short crew tip a week. Tap below to confirm it’s you. Until you do, we won’t send any." },
      { button: { label: "Yes, send me the weekly tip", url: confirmTipsUrl, secondary: true } },
    );
  }
  blocks.push({ note: DISCLAIMER });
  return renderEmail({
    subject: `${who}: your kid’s crew and 3-night plan`,
    preheader: `Who’s behind “${r.lead.label}”, and what to try tonight.`,
    kick: "your quiz results",
    title: "Meet the crew behind your hard moments",
    art: r.lead.char.key,
    blocks,
    reason: "You’re getting this email because you asked for your quiz results at littlebraincrew.com/code.",
    campaign: "quiz-result",
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
    { note: "This is the only reminder we send about this order." },
  );
  return renderEmail({
    subject: `Pick up where you left off: ${main.name}`,
    preheader: "You didn’t finish paying, so nothing was charged. Your order is still here.",
    kick: "still here",
    title: "You were one step away",
    art: ART[main.id] ?? "duo",
    blocks,
    reason: "You’re getting this email because you entered this address at checkout on littlebraincrew.com.",
    unsubscribe: unsubscribeUrl,
    campaign: "checkout-reminder",
  });
}

/** What each newsletter form promised, for its confirmation email (lib/analytics.ts NEWSLETTER_FORMS). */
type Confirm = { what: string; art: string; subject: string; preheader: string; title: string; button: string };
const CONFIRM_FOR: Record<string, Confirm> = {
  "free-screen-list": {
    what: "the free list: 15 ways to end screen time without tears",
    art: "dopa",
    subject: "One tap to get your screen-time list",
    preheader: "Four printable pages. One small change for a calmer screen-off tonight.",
    title: "Your list is one tap away",
    button: "Confirm and get the list",
  },
  "sticker-pack": {
    what: "the free crew sticker pack and a few tips",
    art: "toci",
    subject: "One tap to get your crew stickers",
    preheader: "Tap confirm and the 12 stickers arrive right away.",
    title: "Your stickers are one tap away",
    button: "Confirm and get the stickers",
  },
  "screen-off-challenge": {
    what: "the 5-day Screen-Off Challenge with Dopa",
    art: "dopa",
    subject: "One tap to start your 5-day challenge",
    preheader: "Tap confirm and Day 1 arrives right away. About 5 minutes a day.",
    title: "Ready for Day 1?",
    button: "Confirm and start Day 1",
  },
};
const CONFIRM_ANY: Confirm = { what: "crew tips by email", art: "duo", subject: "One tap to confirm your email", preheader: "Tap confirm so we know it’s really you.", title: "One tap to confirm", button: "Confirm my email" };

/** Double opt-in: sent when someone signs up on a newsletter form. Nothing else is sent until they tap the button. */
export function confirmSignup(form: string, url: string): Email {
  const c = CONFIRM_FOR[form] ?? CONFIRM_ANY;
  return renderEmail({
    subject: c.subject,
    preheader: c.preheader,
    kick: "one tap",
    title: c.title,
    art: c.art,
    blocks: form === "free-screen-list" ? [
      { p: "Your screen-time printable is ready. Confirm your email and we’ll send all four pages straight to your inbox." },
      { button: { label: c.button, url } },
      { preview: { src: "/email/screen-time-list-preview.png", alt: "Preview of the 15 ways to end screen time printable", caption: "4 pages · ages 3–17 · print it or keep it on your phone" } },
      { list: ["Before the screen goes on: agree on an ending", "When it’s time to stop: the words and small choices", "After the screen goes off: help them land somewhere"] },
      { note: "Didn’t ask for this? Just ignore this email. We won’t send the list until you confirm." },
    ] : [
      { p: `You asked littlebraincrew.com for ${c.what}.` },
      { p: "Tap the button to confirm it’s you, and it lands in your inbox right away. Until you do, we won’t send anything else." },
      { button: { label: c.button, url } },
      { note: "Didn’t ask for this? Just ignore this email and we won’t write again." },
    ],
    reason: "You’re getting this email because this address was entered in a form at littlebraincrew.com.",
    campaign: "confirm",
  });
}

// ---------- Free offers on /free, sent once the address is confirmed (lib/free-offers.ts) ----------

// No other domains in list emails (README: Email): links or bare domains of other sites are a spam signal.
const FOLLOW = "The crew posts a short cartoon explainer most days. Find us as Little Brain Crew on Instagram and TikTok.";

/** The free printable: 15 ways to end screen time without tears (public/downloads, built by products/build.mjs). */
export function freeScreenList(unsubscribe: string): Email {
  return renderEmail({
    subject: "Your list: 15 ways to end screen time without tears",
    preheader: "Your four-page printable is here, with one small thing to try tonight.",
    kick: "here it is",
    title: "15 ways to end screen time without tears",
    art: "dopa",
    blocks: [
      { p: "Here it is: 15 practical ways to make the end of screen time easier, in four pages you can print or keep on your phone." },
      { button: { label: "Get my 4-page printable", url: "/downloads/15-ways-to-end-screen-time.pdf" } },
      { preview: { src: "/email/screen-time-list-preview.png", alt: "The first page of your 15 ways to end screen time printable", caption: "Before the screen · time to stop · what comes next" } },
      { note: "Try this tonight: number 5. Warn at 5 minutes and at 1 minute, with a timer your kid can see. Same warnings, same words, each evening." },
      { p: `Want the exact words for the moment it goes wrong? Page ${SCREEN_OFF.page} of the Kid Brain Toolkit has it, word for word (${SCREEN_OFF.plan}).` },
      { link: { label: `See page ${SCREEN_OFF.page} in the Toolkit · ${usd(ITEMS.guide.price)}`, url: SCREEN_OFF_CHECKOUT } },
      { note: `One small favor: add ${HELLO} to your contacts so the next ones land in your inbox, not Promotions. And hit reply any time: we read every email.` },
      { p: FOLLOW },
    ],
    reason: "You’re getting this email because you asked for the free list at littlebraincrew.com.",
    unsubscribe,
    campaign: "free-list",
  });
}

/** The free crew sticker pack (public/downloads/crew-stickers.zip, built by scripts/build-sticker-zip.mjs). */
export function freeStickerPack(unsubscribe: string): Email {
  return renderEmail({
    subject: "Your 12 crew stickers are here",
    preheader: "12 stickers for your family chats: “5 more min?”, “Hug?” and more.",
    kick: "for your chats",
    title: "Your crew sticker pack",
    art: "toci",
    blocks: [
      { p: "Thanks for confirming. Here are the 12 crew stickers, 512 × 512 px." },
      { button: { label: "Get your 12 stickers", url: "/downloads/crew-stickers.zip" } },
      {
        list: [
          "iMessage and Telegram: open the png folder and send them like any picture.",
          "WhatsApp: add the webp files with a sticker app (Sticker Maker or similar).",
          "On a phone, open the email on the device you chat from.",
        ],
      },
      { p: "Want something for the tough moments too? Get the free printable: 15 ways to end screen time without tears." },
      { link: { label: "Get the free screen-time printable", url: "/#free" } },
      { note: `One small favor: add ${HELLO} to your contacts so the next ones land in your inbox, not Promotions. And hit reply any time: we read every email.` },
      { p: FOLLOW },
    ],
    reason: "You’re getting this email because you asked for the free sticker pack at littlebraincrew.com.",
    unsubscribe,
    campaign: "free-stickers",
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

/** What goes after a day's own blocks: the contact favor on Day 1 (Days 2 to 5 have to reach the inbox), the page that has
 *  the exact words on Day 4, and the two ways forward on Day 5, when the reader has just finished the challenge. */
function challengeExtras(day: number): Block[] {
  if (day === 1) {
    return [{ p: `One small favor: add ${HELLO} to your contacts so tomorrow’s email lands in your inbox, not Promotions. And if you’d like to tell us your kid’s age, or how screen endings go at your house, just hit reply.` }];
  }
  if (day === 4) {
    return [{ link: { label: `The exact words, step by step: Toolkit p. ${SCREEN_OFF.page}`, url: SCREEN_OFF_CHECKOUT } }];
  }
  if (day === 5) {
    return [
      { button: { label: `Get the Toolkit · ${usd(ITEMS.guide.price)}`, url: SCREEN_OFF_CHECKOUT } },
    ];
  }
  return [];
}

export function challengeDay(day: number, unsubscribe: string): Email {
  const d = CHALLENGE_DAYS[day - 1];
  return renderEmail({
    subject: d.subject,
    preheader: d.preheader,
    kick: "screen-off challenge",
    title: `Day ${day}: ${d.name}`,
    art: "dopa",
    blocks: [
      { steps: { current: day, total: CHALLENGE_DAYS.length, label: `Day ${day} of ${CHALLENGE_DAYS.length}` } },
      ...d.blocks,
      ...challengeExtras(day),
      { p: day < 5 ? `Tomorrow: Day ${day + 1}, ${CHALLENGE_DAYS[day].name}. ${FOLLOW}` : FOLLOW },
    ],
    reason: "You’re getting this email because you joined the 5-day Screen-Off Challenge at littlebraincrew.com. It ends after Day 5.",
    unsubscribe,
    campaign: `challenge-day-${day}`,
  });
}
