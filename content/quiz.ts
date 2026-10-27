// The parent quiz at /code: the lead magnet ManyChat sends in Instagram DMs (keyword CODE). Not linked from the site.
// Everything a parent reads here comes from the site: the 12 moments and their lines are the home page decoder
// (design/index.html), lessons and "try tonight" tips come from the Learn entries (content/learn), the two rules
// are the home page copy. Change a moment there first, then here. lib/quiz.ts joins this with the Learn entries.

import type { CharKey, SectionKey } from "./learn/types.ts";

/** Every screen of the quiz, in order. Also the only step names the tracking API accepts. */
export const STEPS = [
  "intro", "age", "stage", "moments", "lesson-1", "lesson-2", "lesson-3",
  "sleep", "villains", "myth-1", "myth-2", "myth-3", "plasti", "duo", "duo-card", "gate", "result",
] as const;
export type StepId = (typeof STEPS)[number];

/** A/B tests. A visitor gets one variant at random (or ?v=b), kept for the whole session. Add a variant here,
 *  then compare it on /admin/quiz. Only the intro headline changes for now. */
export const VARIANTS = {
  a: { headline: "Crack your kid’s code in 5 minutes.", sub: "Tell us what happens at your house. Guess who’s behind it, check your kid’s sleep, find the villains at home, and get a 3-night plan for your kid’s age." },
  b: { headline: "Why does your kid do that? Find out in 5 minutes.", sub: "Pick the moments you see at home. Meet the crew behind them, spot the villains in your house, and get a 3-night plan for your kid’s age." },
} as const;
export type Variant = keyof typeof VARIANTS;

/** Recommended sleep per 24 hours (AASM 2016, the table on /guides/sleep-hours-by-age, source S03). */
export type SleepRange = { min: number; max: number; says: string };
const SLEEP = {
  preschool: { min: 10, max: 13, says: "10 to 13 hours for ages 3 to 5, naps included" },
  school: { min: 9, max: 12, says: "9 to 12 hours for ages 6 to 12" },
  // 12-year-olds fall in the school-age range, 13-year-olds in the teen one: the bucket spans both.
  bridge: { min: 8, max: 12, says: "9 to 12 hours at 12, and 8 to 10 from 13" },
  teen: { min: 8, max: 10, says: "8 to 10 hours for teens 13 to 18" },
} satisfies Record<string, SleepRange>;

/** Age buttons → the stage character, its Learn page and the sleep range. Ranges follow the site (Whyzi 3–6 … Seki 14–17). */
export const AGES: { id: string; label: string; stage: CharKey; slug: string; teen: boolean; /** Under 6: no homework or phone examples. */ young: boolean; sleep: SleepRange }[] = [
  { id: "3-5", label: "3–5", stage: "whyzi", slug: "brain-age-3-to-6", teen: false, young: true, sleep: SLEEP.preschool },
  { id: "6-7", label: "6–7", stage: "skuli", slug: "brain-age-6-to-8", teen: false, young: false, sleep: SLEEP.school },
  { id: "8-9", label: "8–9", stage: "ruli", slug: "brain-age-8-to-10", teen: false, young: false, sleep: SLEEP.school },
  { id: "10-11", label: "10–11", stage: "tweeni", slug: "brain-age-10-to-12", teen: false, young: false, sleep: SLEEP.school },
  { id: "12-13", label: "12–13", stage: "sprouti", slug: "brain-age-12-to-14", teen: true, young: false, sleep: SLEEP.bridge },
  { id: "14-17", label: "14–17", stage: "seki", slug: "brain-age-14-to-17", teen: true, young: false, sleep: SLEEP.teen },
];

export type MomentDef = {
  id: string;
  /** The decoder card's bold line. */
  label: string;
  /** The decoder card's small line. */
  line: string;
  /** The crew member behind it (its color, art and the Toolkit's starting point). */
  char: CharKey;
  villain?: CharKey;
  /** Learn entry with the lesson, tips, kid version and sources. */
  entry: { section: SectionKey; slug: string };
  /** Which of the entry's three "try tonight" tips goes first. */
  tip: number;
  /** Shown only for kids 12 and up. */
  teen?: boolean;
  /** Wording for kids under 6, who have no homework. */
  young?: { label: string };
};

export const MOMENTS: MomentDef[] = [
  { id: "screens", label: "Tears or yelling when screen time ends", line: "Dopa just lost its easy rewards. Villain: Lupi.", char: "dopa", villain: "lupi", entry: { section: "why", slug: "kid-cries-when-screen-time-ends" }, tip: 1 },
  { id: "bored", label: "“I’m bored.” Won’t start homework.", line: "Nora’s spotlight won’t switch on. Villain: Pingi.", char: "nora", villain: "pingi", entry: { section: "why", slug: "kid-cant-focus-on-homework" }, tip: 0, young: { label: "“I’m bored.” Won’t start a task or clean-up." } },
  { id: "explodes", label: "Explodes over small things", line: "Migo yelled “danger!” before Fronti had time to think.", char: "migo", entry: { section: "why", slug: "kid-explodes-over-small-things" }, tip: 0 },
  { id: "cant-wait", label: "Can’t wait: grabs, interrupts, blurts it out", line: "Fronti’s brakes are still under construction.", char: "fronti", entry: { section: "why", slug: "kid-cant-wait" }, tip: 1 },
  { id: "after-school", label: "Melts down the minute they’re home from school", line: "Greli is ringing the hunger bell, and Corti held it in all day.", char: "greli", entry: { section: "why", slug: "kid-melts-down-after-school" }, tip: 0 },
  { id: "wired", label: "Wired at bedtime, grumpy at breakfast", line: "Mela showed up late. Villains: Glo and Bedi.", char: "mela", villain: "glo", entry: { section: "why", slug: "second-wind-at-bedtime" }, tip: 0 },
  { id: "cant-sleep", label: "Can’t fall asleep, worries at night", line: "Gabi can’t find the brake while Corti is still on.", char: "gabi", villain: "bedi", entry: { section: "why", slug: "kid-cant-fall-asleep" }, tip: 1 },
  { id: "bouncing", label: "Bouncing off the walls at 9 p.m.", line: "Endo never got to run today.", char: "endo", entry: { section: "why", slug: "kid-always-jumping-and-crashing" }, tip: 0 },
  { id: "not-listening", label: "Doesn’t listen until you yell", line: "Toci needs a moment of connection before the instruction.", char: "toci", entry: { section: "why", slug: "kid-behaves-worse-with-parents" }, tip: 1 },
  { id: "siblings", label: "Sibling fights, every single day", line: "Toci feels there isn’t enough of you to go around.", char: "toci", entry: { section: "why", slug: "siblings-fight-all-the-time" }, tip: 0 },
  { id: "routine", label: "Cranky all week when the routine falls apart", line: "Sero likes days that look the same. Villain: Lati.", char: "sero", villain: "lati", entry: { section: "habits", slug: "irregular-bedtimes" }, tip: 0 },
  { id: "teen", label: "A teen with no energy and no confidence", line: "Teo needs sleep, sport and daylight.", char: "teo", entry: { section: "brain-chemicals", slug: "testosterone-in-teens" }, tip: 0, teen: true },
];

/** How many moments a parent can pick (one lesson screen each). */
export const MAX_MOMENTS = 3;

/** Sleep check: school-night times to pick from, as minutes after midnight (bedtimes past midnight are 24:00+). */
export const BEDTIMES = Array.from({ length: 11 }, (_, i) => 19 * 60 + i * 30); // 7:00 p.m. … 12:00 a.m.
export const WAKE_TIMES = Array.from({ length: 8 }, (_, i) => 5 * 60 + 30 + i * 30); // 5:30 … 9:00 a.m.
/** What to say after the sleep check. Tips are from the sleep Learn pages. */
export const SLEEP_VERDICT = {
  short: { title: "That’s under the range for this age.", body: "Plenty of kids fall short on school nights, and it can show up as meltdowns, a second wind at bedtime and grumpy mornings. Mela needs a dark, calm evening to show up on time.", tip: { slug: "second-wind-at-bedtime", i: 1 } },
  ok: { title: "That’s inside the range. Nice.", body: "Protect it: the same bedtime and wake-up time on weekends too, give or take an hour. Lati, the villain who moves bedtimes around, hates that.", tip: { slug: "irregular-bedtimes", i: 0 } },
  long: { title: "That’s above the range for this age.", body: "Some kids simply need more. If your kid sleeps this long and still seems tired, it’s worth mentioning to your pediatrician.", tip: { slug: "irregular-bedtimes", i: 1 } },
} as const;
export type SleepVerdict = keyof typeof SLEEP_VERDICT;

/** Villain check: one plain habit per villain (the Habits Learn pages), and the tip that beats it. */
export const VILLAIN_CHECK: { villain: CharKey; label: string; slug: string; tip: number }[] = [
  { villain: "bedi", label: "A phone or tablet sleeps in your kid’s room", slug: "phone-in-bed", tip: 0 },
  { villain: "glo", label: "Screens in the last hour before bed", slug: "screens-before-bed", tip: 1 },
  { villain: "lupi", label: "The next episode or video plays by itself", slug: "autoplay", tip: 0 },
  { villain: "pingi", label: "A phone buzzes nearby while your kid is trying to focus", slug: "notifications-and-homework", tip: 1 },
  { villain: "lati", label: "Bedtime moves by more than an hour from night to night", slug: "irregular-bedtimes", tip: 0 },
  { villain: "kafi", label: "Soda, iced tea or energy drinks after lunch", slug: "caffeine-and-kids", tip: 1 },
];

/** Myth or fact: three Learn myth pages. They lead into Rule 1 (Plasti). */
export const MYTHS: { slug: string; ask: string }[] = [
  { slug: "does-sugar-make-kids-hyper", ask: "Sugar makes kids hyper." },
  { slug: "dopamine-detox-for-kids", ask: "After too much screen time, a ‘dopamine detox’ resets a kid’s brain." },
  { slug: "is-the-brain-done-at-25", ask: "The brain is fully developed at 25." },
];

/** The two rules, word for word from the home page. */
export const RULES = {
  plasti: {
    kick: "Rule 1 · Plasti",
    title: "The brain changes from what’s repeated.",
    body: "Every bedtime at the same time and every screen ending done the same way carves the path a little deeper. Scientists call it neuroplasticity, and it’s strongest in childhood. That’s why one small habit, repeated, beats one big talk.",
    entry: { section: "brain-parts" as SectionKey, slug: "neuroplasticity-for-kids" },
  },
  duo: {
    kick: "Rule 2 · Duo",
    title: "Kids borrow your calm before they can make their own.",
    body: "A calm grown-up close by helps a child’s body settle. Scientists call it co-regulation. Your kid learns to calm down by doing it with you, hundreds of times. In this crew, that’s you. You’re Duo.",
    entry: { section: "brain-parts" as SectionKey, slug: "co-regulation-explained" },
  },
};

/** "When it blows up, you usually…": no right answer, the card after it says so. The answers are tracked. */
export const DUO_QUESTION = "When a big feeling blows up at your house, what do you usually do first?";
export const DUO_OPTIONS: { id: string; label: string }[] = [
  { id: "explain", label: "Explain why it’s not a big deal" },
  { id: "louder", label: "Get louder so they hear me" },
  { id: "space", label: "Give them space and step away" },
  { id: "close", label: "Get close, get low and go quiet" },
];
export const DUO_LEAD = "Every parent does all four. The one the research keeps coming back to is the last one.";

export const DISCLAIMER =
  "The characters are a way to explain behavior, not a measurement of your child’s chemistry. Educational only, not medical advice. If you are worried about your child’s sleep, mood, growth or behavior, talk to your pediatrician.";
