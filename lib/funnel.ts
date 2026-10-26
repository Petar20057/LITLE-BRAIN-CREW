// Everything you sell, and the order people see it in. Change prices and offer copy here.
//
//   home / pricing / Dopa article ──► /checkout/guide ──► /offer/upgrade ──yes──► /offer/club ──yes──► /thank-you
//                                                              └─no──► /offer/screen-off-week ──► /offer/club ──no──► /offer/club-lite ──► /thank-you
//   home / pricing ──► /checkout/program ──────────────────────────────► /offer/club (same as above)
//   home / pricing ──► /checkout/club ────────────────────────────────────────────────────────────────► /thank-you
//   gift page ───► /checkout/<guide|program>?gift=1 ────────────────────────────────────────► /thank-you

// True until Stripe and PayPal are connected (lib/payments.ts): buttons walk the funnel without charging.
export const PREVIEW = true;

export type CrewKey = "dopa" | "sero" | "endo" | "toci" | "corti" | "teo" | "nora" | "gabi" | "mela" | "greli" | "migo" | "fronti" | "plasti" | "duo";
export const CREW_NAMES: Record<CrewKey, string> = {
  dopa: "Dopa", sero: "Sero", endo: "Endo", toci: "Toci", corti: "Corti", teo: "Teo",
  nora: "Nora", gabi: "Gabi", mela: "Mela", greli: "Greli", migo: "Migo", fronti: "Fronti", plasti: "Plasti", duo: "Duo",
};

export type Item = {
  id: string;
  name: string;
  price: number;
  /** Recurring items renew until cancelled. */
  every?: "month" | "year";
  /** Shown under the line item, e.g. what happens after a trial. */
  note?: string;
};

export const ITEMS = {
  guide: { id: "guide", name: "The Kid Brain Toolkit", price: 9 },
  program: { id: "program", name: "The 30-Day Reset", price: 39 },
  bedtimeKit: { id: "bedtime-kit", name: "Bedtime & Screen-Off Kit", price: 7 },
  cardsProgram: { id: "cards", name: "Printable Crew Habit Cards", price: 7 },
  upgrade: { id: "upgrade", name: "Upgrade to The 30-Day Reset", price: 30 },
  screenOffWeek: { id: "screen-off-week", name: "Screen-Off Week · 7 days", price: 12, note: "counts toward the 30-Day Reset if you upgrade later" },
  clubMonthly: { id: "club-monthly", name: "The Crew Club · monthly", price: 9, every: "month" },
  clubYearly: { id: "club-yearly", name: "The Crew Club · yearly", price: 79, every: "year" },
  clubTrial: { id: "club-trial", name: "The Crew Club · 14-day trial", price: 1, note: "then $9 a month until you cancel" },
  clubLite: { id: "club-lite", name: "Crew Club Lite", price: 4, every: "month" },
} satisfies Record<string, Item>;

/* ---------- checkout pages ---------- */

export type Product = {
  slug: "guide" | "program" | "club";
  title: string;
  sub: string;
  art: CrewKey;
  get: string[];
  bump?: { item: Item; headline: string; text: string };
  /** Where a normal (non-gift) order goes after paying. */
  next: string;
};

export const PRODUCTS: Record<Product["slug"], Product> = {
  guide: {
    slug: "guide",
    title: "The Kid Brain Toolkit",
    sub: "The science of your kid’s brain in one evening: the whole crew, the 12 hardest moments, the villains, and what’s normal at every age. Ages 4–17.",
    art: "fronti",
    get: [
      "All 12 crew members: what each one does, what helps it, what throws it off",
      "The 12 hardest moments decoded: who’s behind it, what to say, what to try tonight",
      "The 6 villains (Bedi, Glo, Lupi, Pingi, Lati, Kafi), and how to beat each one",
      "What’s normal at every age, from Whyzi (3–6) to Seki (14–17)",
      "The research behind it, with sources",
      "Bonuses: 24 “Say This, Not That” cards, the 60-Second Meltdown Plan, the crew poster, crew cartoons to watch together",
    ],
    bump: {
      item: ITEMS.bedtimeKit,
      headline: "Yes! Add the Bedtime & Screen-Off Kit for just $7",
      text: "A crew bedtime audio story, plus the exact timer scripts for ending screen time without a fight. The two hardest moments of the day, covered. Only with this order.",
    },
    next: "/offer/upgrade",
  },
  program: {
    slug: "program",
    title: "The 30-Day Reset",
    sub: "The protocol: one 10-minute habit a day for 30 days, one part of the crew each week. Sleep, screens and focus, meltdowns and hunger, moving and connecting.",
    art: "endo",
    get: [
      "Week 1, sleep: Mela and Corti vs. Glo and Bedi",
      "Week 2, screens and focus: Dopa and Nora vs. Lupi and Pingi",
      "Week 3, meltdowns and hunger: Migo, Fronti, Greli and Gabi",
      "Week 4, move and connect: Endo, Toci, Sero and you",
      "A 3-minute cartoon and one habit a day, with the exact words, plus kid versions",
      "Fridge tracker and a teen track with Teo (13–17)",
      "The Kid Brain Toolkit and all its bonuses, included",
    ],
    bump: {
      item: ITEMS.cardsProgram,
      headline: "Yes! Add 30 printable Crew Habit Cards for just $7",
      text: "One card for every day of the reset, with its character. Your kid picks the card, you both tick it off. Only with this order.",
    },
    next: "/offer/club",
  },
  club: {
    slug: "club",
    title: "The Crew Club",
    sub: "The community where the code keeps growing: a new crew member every month, answers to your questions, and parents doing the same thing.",
    art: "duo",
    get: [
      "A new crew member every month, from our map of 156",
      "A monthly Q&A episode: your questions, answered by the crew",
      "A private community of parents doing the same thing",
      "Ages & stages guides as your kid grows",
      "A family challenge and bedtime stories every month",
      "Pause or cancel yourself, in 2 clicks",
    ],
    next: "/thank-you",
  },
};

/* ---------- one-time offers (upsells and downsells) ---------- */

export type Offer = {
  slug: string;
  step: string;
  hand: string;
  title: string;
  sub: string;
  art: CrewKey;
  stack: string[];
  item: Item;
  price: string;
  was?: string;
  per: string;
  yes: string;
  no: string;
  next: { yes: string; no: string };
  /** Recurring offers need a clear "I agree it renews" tick before the yes button works. */
  consent?: string;
  fine?: string;
};

export const OFFERS: Record<string, Offer> = {
  upgrade: {
    slug: "upgrade",
    step: "Upgrade",
    hand: "wait, your $9 counts",
    title: "Turn the code into a 30-day protocol, for $30 more",
    sub: "The Toolkit shows you the crew. The 30-Day Reset runs it with you: one 10-minute habit a day, one part of the crew each week, short cartoons your kid watches with you. You already paid $9, so you only pay the difference.",
    art: "endo",
    stack: ["Week 1 sleep, week 2 screens and focus, week 3 meltdowns and hunger, week 4 move and connect", "A 3-minute cartoon and one habit a day, with the exact words", "Fridge tracker, plus a teen track with Teo"],
    item: ITEMS.upgrade,
    price: "$30",
    was: "$39",
    per: "one payment · added to the order you just paid",
    yes: "Yes, upgrade me for $30",
    no: "No thanks, just the Toolkit",
    next: { yes: "/offer/club", no: "/offer/screen-off-week" },
    fine: "This $30 price is only on this page. On its own, the 30-Day Reset is $39.",
  },
  // Feature downsell: less work for less money, and it rolls into the full reset later.
  "screen-off-week": {
    slug: "screen-off-week",
    step: "Upgrade",
    hand: "want to start smaller?",
    title: "Start with one week: Screen-Off Week",
    sub: "Seven evenings with Dopa, built around the hardest moment of the day: turning the screen off. One 3-minute cartoon and one small habit each evening. If you go for the full 30-Day Reset later, your $12 counts toward it.",
    art: "dopa",
    stack: ["7 short cartoons with Dopa, plus kid versions", "One small screen-off habit each evening, with the exact words to say", "Your $12 counts toward the 30-Day Reset later"],
    item: ITEMS.screenOffWeek,
    price: "$12",
    per: "one payment · start tonight",
    yes: "Yes, start Screen-Off Week for $12",
    no: "No thanks, continue",
    next: { yes: "/offer/club", no: "/offer/club" },
  },
  club: {
    slug: "club",
    step: "One more thing",
    hand: "the code keeps growing",
    title: "Join the crew that grows with your kid",
    sub: "Habits stick when something new keeps showing up. In the Crew Club, a new crew member joins every month, the crew answers your questions in a monthly Q&A episode, and you’re in a private community of parents doing the same thing.",
    art: "duo",
    stack: ["A new crew member every month, from our map of 156", "A monthly Q&A episode: your questions, answered", "A private community of parents", "Ages & stages guides as your kid grows"],
    item: ITEMS.clubTrial,
    price: "$1 for 14 days",
    per: "then $9 a month · we email you 3 days before the trial ends · cancel in 2 clicks",
    yes: "Yes, try it for $1",
    no: "No thanks",
    next: { yes: "/thank-you", no: "/offer/club-lite" },
    consent: "I understand that after 14 days the Crew Club renews at $9 a month until I cancel, and that I can cancel anytime in my account.",
  },
  "club-lite": {
    slug: "club-lite",
    step: "One more thing",
    hand: "no problem",
    title: "Just want the monthly challenge?",
    sub: "Crew Club Lite: one printable family challenge and one bedtime story a month. A small nudge that keeps the habits going after day 30.",
    art: "sero",
    stack: ["One printable family challenge a month", "One bedtime story with the crew a month", "Upgrade to the full Club or cancel anytime"],
    item: ITEMS.clubLite,
    price: "$4 a month",
    per: "cancel anytime, in 2 clicks",
    yes: "Yes, add Lite for $4 a month",
    no: "No thanks, take me to my order",
    next: { yes: "/thank-you", no: "/thank-you" },
    consent: "I understand that Crew Club Lite renews at $4 a month until I cancel, and that I can cancel anytime in my account.",
  },
};

/* ---------- money helpers ---------- */

export const total = (items: Item[]) => items.reduce((sum, i) => sum + i.price, 0);
export const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
export const per = (i: Item) => (i.every ? `${usd(i.price)}/${i.every}` : usd(i.price));
