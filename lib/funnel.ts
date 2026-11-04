// Everything you sell, and the order people see it in. Change prices and offer copy here.
//
//   home / toolkit / pricing / Dopa article ──► /checkout/guide ──► /offer/bedtime ($7, skipped if the bump was taken) ─► /thank-you
//                                                                   (UPSELL_OPEN)
//   The Toolkit is everything we sell as a download since 2026-11-04 (Luka: "sell it all as the Toolkit"): the 43-page Toolkit,
//   the 30-Day Reset with its tracker, the Science Edition, the Complete Crew Guide (all 214 crew members) and the bonuses.
//   The Reset and the $20 upgrade are no longer sold on their own; their items stay below so old orders still resolve.
//   /offer/screen-off-week stays closed (next.config.ts redirect) until its cartoons exist. Nothing we sell renews:
//   the Crew Club membership was removed on 2026-11-04.
//   home / pricing ──► /personal-plan (the intake form) ──► Creem $199 ──► /personal-plan/thanks (lib/personal-plan.ts)

// True until Creem is connected (lib/payments.ts): buttons walk the funnel without charging.
export const PREVIEW = false;

// The offer after a Toolkit order: the Bedtime Kit for $7 if the bump wasn't taken. Keep in step with UPSELL_OPEN in next.config.ts.
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
  /** Shown under the line item, e.g. that a downsell counts toward a bigger product later. */
  note?: string;
};

export const ITEMS = {
  // Everything in one download (see PRODUCTS.guide). The price is the one place to change it; Creem's product must match.
  guide: { id: "guide", name: "The Kid Brain Toolkit", price: 19 },
  bedtimeKit: { id: "bedtime-kit", name: "Bedtime & Screen-Off Kit", price: 7 },
  // Retired 2026-11-04: the Reset, its cards bump and the $20 upgrade are inside the Toolkit now. Kept so old orders,
  // receipts, the thank-you page and a late webhook still resolve; not sold (no checkout slug, no Creem id for sale).
  program: { id: "program", name: "The 30-Day Reset", price: 39 },
  cardsProgram: { id: "cards", name: "Printable Crew Habit Cards", price: 7 },
  upgrade: { id: "upgrade", name: "Upgrade to The 30-Day Reset", price: 20 },
  screenOffWeek: { id: "screen-off-week", name: "Screen-Off Week · 7 days", price: 12, note: "counts toward the 30-Day Reset if you upgrade later" },
  // A plan written for one family from the /personal-plan form. Sold only through that form (app/api/personal-plan):
  // no checkout slug, and /api/checkout refuses it.
  personalPlan: { id: "personal-plan", name: "The Personal plan", price: 199 },
} satisfies Record<string, Item>;

/* ---------- checkout pages ---------- */

export type Product = {
  slug: "guide" | "bedtime";
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
    sub: "Everything we make, in one download: the code to the 12 hardest moments with the exact words (43 pages), the 30-Day Reset with the fridge tracker (61 pages), the Science Edition (67 pages), the Complete Crew Guide with all 214 crew members (74 pages), and three printable bonuses. For parents of kids 4–17.",
    art: "fronti",
    // What's inside, in the order a parent uses it. Page numbers are the Toolkit PDF's (same as MOMENTS and the home page card).
    get: [
      "The Kid Brain Toolkit (43 pages): the code on one page (p. 4), the 12 hard moments decoded with the move for tonight and the exact words (p. 19–30), the 6 villains (p. 31), what’s normal at every age (p. 35)",
      "The 30-Day Reset (61 pages): one 10-minute habit a day, the exact words for ages 3–7, 8–12 and 13–17, a line for your kid, why it works, the teen track with Teo, and the one-page fridge tracker",
      "The Science Edition (67 pages): the research behind every habit in 10 chapters, with a version for each age",
      "The Complete Crew Guide (74 pages): all 214 crew members, one card each: what it does, what helps, what throws it off, and what to say to your kid",
      "To print: 24 “Say This, Not That” cards, the 60-Second Meltdown Plan for the fridge, and the crew poster",
      "Seven evenings of personal help by email, included",
    ],
    bump: {
      item: ITEMS.bedtimeKit,
      headline: "Add the Bedtime & Screen-Off Kit, $7",
      text: "One PDF for the hardest hour: seven evenings of small screen-off habits, the exact words for every age, a bedtime routine card and a story to read together. Only with this order.",
    },
    // The Bedtime Kit offer when the bump wasn't taken (UPSELL_OPEN); otherwise straight to the thank-you page.
    next: UPSELL_OPEN ? "/offer/bedtime" : "/thank-you",
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
  fine?: string;
};

export const OFFERS: Record<string, Offer> = {
  // After a Toolkit order without the bump: the hardest hour of the day, for $7. Skipped when the bump already added it.
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
    next: { yes: "/thank-you", no: "/thank-you" },
  },
};

/* ---------- money helpers ---------- */

export const total = (items: Item[]) => items.reduce((sum, i) => sum + i.price, 0);
export const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
