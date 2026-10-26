// The parent quiz at /code: the lead magnet ManyChat sends in Instagram DMs (keyword CODE). Not linked from the site.
// Everything a parent reads here comes from the site: the 12 moments and their lines are the home page decoder
// (design/index.html), lessons and "try tonight" tips come from the Learn entries (content/learn), the two rules
// are the home page copy. Change a moment there first, then here. lib/quiz.ts joins this with the Learn entries.

import type { CharKey, SectionKey } from "./learn/types.ts";

/** Every screen of the quiz, in order. Also the only step names the tracking API accepts. */
export const STEPS = [
  "intro", "age", "stage", "moments", "lesson-1", "lesson-2", "lesson-3",
  "myth-1", "myth-2", "plasti", "duo", "duo-card", "gate", "result",
] as const;
export type StepId = (typeof STEPS)[number];

/** A/B tests. A visitor gets one variant at random (or ?v=b), kept for the whole session. Add a variant here,
 *  then compare it on /stats/quiz. Only the intro headline changes for now. */
export const VARIANTS = {
  a: { headline: "Crack your kid’s code in 3 minutes.", sub: "Tell us what happens at your house. Learn who’s behind it, and get a 3-night plan for your kid’s age." },
  b: { headline: "Why does your kid do that? Find out in 3 minutes.", sub: "Pick the moments you see at home. Meet the crew behind them, and get a 3-night plan for your kid’s age." },
} as const;
export type Variant = keyof typeof VARIANTS;

/** Age buttons → the stage character and its Learn page. Ranges follow the site (Whyzi 3–6 … Seki 14–17). */
export const AGES: { id: string; label: string; stage: CharKey; slug: string; teen: boolean }[] = [
  { id: "4-5", label: "4–5", stage: "whyzi", slug: "brain-age-3-to-6", teen: false },
  { id: "6-7", label: "6–7", stage: "skuli", slug: "brain-age-6-to-8", teen: false },
  { id: "8-9", label: "8–9", stage: "ruli", slug: "brain-age-8-to-10", teen: false },
  { id: "10-11", label: "10–11", stage: "tweeni", slug: "brain-age-10-to-12", teen: false },
  { id: "12-13", label: "12–13", stage: "sprouti", slug: "brain-age-12-to-14", teen: true },
  { id: "14-17", label: "14–17", stage: "seki", slug: "brain-age-14-to-17", teen: true },
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
};

export const MOMENTS: MomentDef[] = [
  { id: "screens", label: "Tears or yelling when screen time ends", line: "Dopa just lost its easy rewards. Villain: Lupi.", char: "dopa", villain: "lupi", entry: { section: "why", slug: "kid-cries-when-screen-time-ends" }, tip: 1 },
  { id: "bored", label: "“I’m bored.” Won’t start homework.", line: "Nora’s spotlight won’t switch on. Villain: Pingi.", char: "nora", villain: "pingi", entry: { section: "why", slug: "kid-cant-focus-on-homework" }, tip: 0 },
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

/** Myth or fact: two Learn myth pages. Both lead into Rule 1 (Plasti). */
export const MYTHS: { slug: string; ask: string }[] = [
  { slug: "does-sugar-make-kids-hyper", ask: "Sugar makes kids hyper." },
  { slug: "dopamine-detox-for-kids", ask: "After too much screen time, a ‘dopamine detox’ resets a kid’s brain." },
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
