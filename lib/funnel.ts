// Everything you sell, and the order people see it in. Change prices and offer copy here.
//
//   home / pricing / Dopa article ──► /checkout/guide ──► /offer/upgrade ($20) ──yes──────────────────► /thank-you
//                                     (UPSELL_OPEN)            └─no──► /offer/bedtime ($7, skipped if bump taken) ─► /thank-you
//   home / pricing ──► /checkout/program ──────────────────────────────────────────────────────► /thank-you
//   Club, /offer/club and /offer/screen-off-week stay closed (next.config.ts redirects) until the Club opens.
//   member's Creem referral link ──► home (Creem's cookie credits the member at its checkout, see AFFILIATE)

// True until Creem is connected (lib/payments.ts): buttons walk the funnel without charging.
export const PREVIEW = false;

// The offers after a Toolkit order: the $20 upgrade to the Reset, then the Bedtime Kit for $7 if the bump wasn't taken.
// The verified $20 offer is live. Its provider product is configured in lib/creem-products.json.
// Keep in step with UPSELL_OPEN in next.config.ts.
export const UPSELL_OPEN = true;

// True until a payment processor is live: Support the crew shows "Coming soon". Keep in step with COMING_SOON in next.config.ts.
export const COMING_SOON = false;

export type CrewKey = "dopa" | "sero" | "endo" | "toci" | "corti" | "teo" | "nora" | "gabi" | "mela" | "greli" | "migo" | "fronti" | "plasti" | "duo";
export const CREW_NAMES: Record<CrewKey, string> = {
  dopa: "Dopa", sero: "Sero", endo: "Endo", toci: "Toci", corti: "Corti", teo: "Teo",
  nora: "Nora", gabi: "Gabi", mela: "Mela", greli: "Greli", migo: "Migo", fronti: "Fronti", plasti: "Plasti", duo: "Duo",
};

/** The 12 hard moments of the home page decoder (design/index.html, data-moment), with where each one's page is in
 *  The Kid Brain Toolkit PDF: Part 2, "Moment N of 12" (what's going on, the move for tonight, the exact words). A decoder
 *  card opens /checkout/guide?crew=…&moment=…, and the checkout names the moment and its page. Pages checked against
 *  products/delivery/Kid-Brain-Toolkit/The-Kid-Brain-Toolkit.pdf (43 pages, 2026-11-02). The Science Edition in the Reset bundle keeps the chapter pages of the 10-chapter book (screens ch. 6 p. 32, stress ch. 8 p. 43 …), see lib/article-boxes.ts. */
export const MOMENTS: Record<string, { title: string; page: number; plan: string }> = {
  "screen-off": { title: "Tears when screen time ends", page: 19, plan: "Moment 1 · the 4-step screen-off" },
  homework: { title: "“I’m bored” and homework that won’t start", page: 20, plan: "Moment 2 · snack, move, one tiny first step" },
  explodes: { title: "Explodes over small things", page: 21, plan: "Moment 3 · calm first, talk later" },
  "cant-wait": { title: "Can’t wait: grabs, interrupts, blurts it out", page: 22, plan: "Moment 4 · make waiting visible" },
  "after-school": { title: "The after-school meltdown", page: 23, plan: "Moment 5 · snack at the door, questions later" },
  "wired-bedtime": { title: "Wired at bedtime, grumpy at breakfast", page: 24, plan: "Moment 6 · dim evenings, devices out of the bedroom" },
  "cant-sleep": { title: "Can’t fall asleep, worries at night", page: 25, plan: "Moment 7 · worry time, then the same calm routine" },
  "bedtime-energy": { title: "Bouncing off the walls at 9 p.m.", page: 26, plan: "Moment 8 · big movement before dinner, quiet after" },
  "doesnt-listen": { title: "Doesn’t listen until you yell", page: 27, plan: "Moment 9 · connection before the instruction" },
  siblings: { title: "Sibling fights, every day", page: 28, plan: "Moment 10 · ten minutes of special time, each" },
  routine: { title: "Cranky when the routine falls apart", page: 29, plan: "Moment 11 · fixed anchors, weekends close to weekdays" },
  "teen-energy": { title: "A teen with no energy", page: 30, plan: "Moment 12 · the phone sleeps outside the bedroom" },
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
  guide: { id: "guide", name: "The Kid Brain Toolkit", price: 19 },
  program: { id: "program", name: "The 30-Day Reset", price: 39 },
  bedtimeKit: { id: "bedtime-kit", name: "Bedtime & Screen-Off Kit", price: 7 },
  cardsProgram: { id: "cards", name: "Printable Crew Habit Cards", price: 7 },
  // The Reset minus the Toolkit ("your $19 counts"): change it with either price.
  upgrade: { id: "upgrade", name: "Upgrade to The 30-Day Reset", price: 20 },
  screenOffWeek: { id: "screen-off-week", name: "Screen-Off Week · 7 days", price: 12, note: "counts toward the 30-Day Reset if you upgrade later" },
  // Two months free on the yearly plan: 10 × $8, saving $16.
  clubMonthly: { id: "club-monthly", name: "The Crew Club · monthly", price: 8, every: "month" },
  clubYearly: { id: "club-yearly", name: "The Crew Club · yearly", price: 80, every: "year" },
} satisfies Record<string, Item>;

/* ---------- checkout pages ---------- */

export type Product = {
  slug: "guide" | "program" | "club" | "bedtime";
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
    sub: "12 crew members, the 12 hardest moments decoded with the exact words, 6 villains, and what’s normal at every age. 43 pages you can read in one evening, with printable bonuses and 4 crew cartoons. Ages 3–17.",
    art: "fronti",
    // The parts of the Toolkit with their pages (same PDF as MOMENTS and the home page card), then the printable bonuses.
    get: [
      "The code on one page: find your hard moment and the crew member behind it (p. 4)",
      "Meet the crew: 12 members, what helps each one and what throws it off (p. 5)",
      "The 12 hard moments decoded, each with what’s going on, the move for tonight and the exact words: screen-off tears (p. 19), homework that won’t start (p. 20), blow-ups (p. 21), the after-school meltdown (p. 23), wired at bedtime (p. 24) and 7 more",
      "The 6 villains (the phone in bed, autoplay, late bedtimes and 3 more) and how to beat each one (p. 31)",
      "What’s normal at every age, Whyzi (3) to Seki (17) (p. 35), and when to talk to your pediatrician (p. 42)",
      "When you don’t know what to say: 24 “Say This, Not That” cards, plus the 60-Second Meltdown Plan for the fridge",
      "Also inside: the crew poster and 4 crew cartoons to watch together",
    ],
    bump: {
      item: ITEMS.bedtimeKit,
      headline: "Add the Bedtime & Screen-Off Kit, $7",
      text: "One 20-page PDF: seven evenings of small screen-off habits, the exact words for every age, a bedtime routine card and a story to read together. Only with this order.",
    },
    // The $20 upgrade to the Reset once it's on sale in Creem (UPSELL_OPEN); until then straight to the thank-you page.
    next: UPSELL_OPEN ? "/offer/upgrade" : "/thank-you",
  },
  program: {
    slug: "program",
    title: "The 30-Day Reset",
    sub: "The protocol: one 10-minute habit a day for 30 days, one part of the crew each week. Sleep, screens and focus, meltdowns and hunger, moving and connecting.",
    art: "endo",
    get: [
      "Week 1, sleep: Mela and Corti vs. Glo, Bedi and Lati",
      "Week 2, screens and focus: Dopa and Nora vs. Lupi and Pingi",
      "Week 3, meltdowns and hunger: Migo, Fronti, Greli and Gabi",
      "Week 4, move and connect: Endo, Toci, Sero and you",
      "One 10-minute habit a day, with the exact words to say and a line for your kid",
      "A teen track with Teo (13–17): four weeks adapted to the teen years",
      "Keep it going: a 3-day mini reset and printables for your family",
      "Instant download: the 61-page Reset guide and the one-page fridge tracker",
      "The 67-page Science Edition: 10 chapters on the science behind every habit, with a version for ages 3–7, 8–12 and 13–17",
    ],
    bump: {
      item: ITEMS.cardsProgram,
      headline: "Add 30 printable Crew Habit Cards, $7",
      text: "One card for every day of the Reset, with its character. Your kid picks the card, you both tick it off. Only with this order.",
    },
    next: "/thank-you",
  },
  // Bedtime & Screen-Off Kit on its own ($7). Also the $7 add-on on the Toolkit order (guide.bump).
  bedtime: {
    slug: "bedtime",
    title: "The Bedtime & Screen-Off Kit",
    sub: "Seven calmer evenings, the exact words for screen-off, and a bedtime story to read together. One 20-page PDF, for ages 3–17. Instant download.",
    art: "mela",
    get: [
      "Screen-Off Week: seven evenings, one small habit at a time",
      "Timer scripts for ages 3–7, 8–12 and 13–17",
      "The three-step bedtime routine card to print and keep",
      "The Crew Goes to Sleep: a bedtime story to read together",
    ],
    next: "/thank-you",
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
  /** Skip this offer (straight to next.no) when the order already has this item, e.g. the Bedtime Kit taken as the bump. */
  skipIfOwned?: string;
  /** Recurring offers need a clear "I agree it renews" tick before the yes button works. */
  consent?: string;
  fine?: string;
};

export const OFFERS: Record<string, Offer> = {
  upgrade: {
    slug: "upgrade",
    step: "Upgrade",
    hand: "one small habit a day",
    title: "Add the 30-Day Reset for $20",
    sub: "Put the Toolkit into practice: one small habit a day, with the exact words for your kid’s age. Add the Reset guide, fridge tracker and Science Edition to your Toolkit order.",
    art: "endo",
    stack: ["The 61-page Reset: sleep, screens and focus, meltdowns and hunger, move and connect", "One 10-minute habit a day, plus a four-week teen track and a 3-day mini reset", "The printable fridge tracker and the 67-page Science Edition"],
    item: ITEMS.upgrade,
    price: "$20",
    was: "$39",
    per: "one payment · quick checkout, your email is already filled in",
    yes: "Yes, upgrade me for $20",
    no: "No thanks, just the Toolkit",
    // The Club is still a waitlist, so a yes ends the funnel. A no gets the Bedtime Kit (it exists; Screen-Off Week's
    // cartoons don't yet, so that downsell stays off).
    next: { yes: "/thank-you", no: "/offer/bedtime" },
    fine: "This $20 price is only on this page. On its own, the 30-Day Reset is $39.",
  },
  // Downsell after a declined upgrade: the hardest hour of the day, for $7. Skipped when the bump already added it.
  bedtime: {
    slug: "bedtime",
    step: "Upgrade",
    hand: "just the hardest hour?",
    title: "Then make tonight’s bedtime easier, for $7",
    sub: "One PDF for the hardest hour of the day: seven evenings of screen-off habits, the words for every age, a bedtime routine card and a story to read together.",
    art: "mela",
    stack: [
      "Seven evenings with Dopa, one small screen-off habit a night",
      "The exact timer scripts for ending screen time, with the words to say",
      "The three-step bedtime routine card and The Crew Goes to Sleep story",
    ],
    item: ITEMS.bedtimeKit,
    price: "$7",
    per: "one payment · quick checkout, your email is already filled in",
    yes: "Yes, add the Bedtime Kit for $7",
    no: "No thanks, take me to my order",
    next: { yes: "/thank-you", no: "/thank-you" },
    skipIfOwned: "bedtime-kit",
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
    price: "$8 a month",
    per: "renews monthly until you cancel · pause or cancel in 2 clicks",
    yes: "Yes, join for $8 a month",
    no: "No thanks, take me to my order",
    next: { yes: "/thank-you", no: "/thank-you" },
    consent: "I understand that the Crew Club renews at $8 a month until I cancel, and that I can pause or cancel anytime in my account.",
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
