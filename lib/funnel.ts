// Everything you sell, and the order people see it in. Change prices and offer copy here.
//
//   home / pricing / Dopa article ──► /checkout/guide ──► /offer/upgrade ──yes──► /offer/club ──► /thank-you
//                                                              └─no──► /offer/screen-off-week ──► /offer/club
//   home / pricing ──► /checkout/program ──────────────────────────────► /offer/club (same as above)
//   home / pricing ──► /checkout/club ────────────────────────────────────────────────► /thank-you
//   gift page ───► /checkout/<guide|program>?gift=1 ────────────────────────────────────► /thank-you
//   member's Creem referral link ──► home (Creem's cookie credits the member at its checkout, see AFFILIATE)

// True until Creem is connected (lib/payments.ts): buttons walk the funnel without charging.
export const PREVIEW = true;

// True until a payment processor is live: Support the crew shows "Coming soon". Keep in step with COMING_SOON in next.config.ts.
export const COMING_SOON = true;

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
  /** Shown under the line item, e.g. that a downsell counts toward a bigger product later. */
  note?: string;
};

export const ITEMS = {
  guide: { id: "guide", name: "The Kid Brain Toolkit", price: 9 },
  program: { id: "program", name: "The 30-Day Reset", price: 39 },
  bedtimeKit: { id: "bedtime-kit", name: "Bedtime & Screen-Off Kit", price: 7 },
  cardsProgram: { id: "cards", name: "Printable Crew Habit Cards", price: 7 },
  upgrade: { id: "upgrade", name: "Upgrade to The 30-Day Reset", price: 30 },
  screenOffWeek: { id: "screen-off-week", name: "Screen-Off Week · 7 days", price: 12, note: "counts toward the 30-Day Reset if you upgrade later" },
  // The Club is the only membership: $19 a month or $199 a year. No trial, no lighter tier.
  clubMonthly: { id: "club-monthly", name: "The Crew Club · monthly", price: 19, every: "month" },
  clubYearly: { id: "club-yearly", name: "The Crew Club · yearly", price: 199, every: "year" },
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
    sub: "The science of your kid’s brain in one evening: the whole crew, the 12 hardest moments, the villains, and what’s normal at every age. Ages 3–17.",
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
    per: "one payment · quick checkout, your email is already filled in",
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
    item: ITEMS.clubMonthly,
    price: "$19 a month",
    per: "renews monthly until you cancel · pause or cancel in 2 clicks",
    yes: "Yes, join for $19 a month",
    no: "No thanks, take me to my order",
    next: { yes: "/thank-you", no: "/thank-you" },
    consent: "I understand that the Crew Club renews at $19 a month until I cancel, and that I can pause or cancel anytime in my account.",
  },
};

/* ---------- affiliate program (Crew Club members only) ---------- */

// Runs on Creem's built-in affiliate program (Affiliate Hub). These numbers mirror its settings: change them there too,
// and in design/affiliate.html and the Terms (content/learn/site-pages.ts), which spell them out.
// - Invite-only with manual approval, so only Crew Club members get in. Once in, a member keeps earning after they
//   cancel: Creem can't stop or remove a single affiliate.
// - Creem keeps an extra 2% of every affiliate sale; the commission is figured on what's left.
// - Creem sets the referral cookie and its checkout reads it, so nothing on our side tracks or pays anything.
// - "Support the crew" payments don't count: they aren't a sale.
export const AFFILIATE = {
  rate: 0.2,
  creemFee: 0.02,
  cookieDays: 60,
  /** Days a commission waits before it can be paid (set by Creem). */
  holdDays: "7–12",
  minPayout: 50,
  payoutDays: "the 1st and 15th",
};

export const commission = (price: number) => Math.round(price * (1 - AFFILIATE.creemFee) * AFFILIATE.rate * 100) / 100;

/* ---------- money helpers ---------- */

export const total = (items: Item[]) => items.reduce((sum, i) => sum + i.price, 0);
export const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
export const per = (i: Item) => (i.every ? `${usd(i.price)}/${i.every}` : usd(i.price));
