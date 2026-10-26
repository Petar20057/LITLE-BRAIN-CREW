// Hubs and the full URL registry for the Learn pages. Every LearnEntry must use a slug listed here,
// and every `related` link must resolve to a path in ALL_PATHS (checked by scripts/check-learn.mjs).
import type { CharKey, SectionKey } from "./types.ts";

export type Section = {
  key: SectionKey;
  /** Hub H1. */
  h1: string;
  metaTitle: string;
  description: string;
  kicker: string;
  /** Hub intro, 1–2 sentences. */
  intro: string;
  /** Planned pages: slug → featured character (if any) and target query. */
  pages: { slug: string; char?: CharKey; query: string }[];
};

export const SECTIONS: Section[] = [
  {
    key: "brain-chemicals",
    h1: "Brain chemicals for kids, explained with cartoons",
    metaTitle: "Brain Chemicals for Kids, Explained Simply",
    description: "Dopamine, serotonin, cortisol, oxytocin and more, explained for parents and kids with one cartoon character each. What they do and what helps.",
    kicker: "the messengers and hormones",
    intro: "Each chemical is a character in the crew. They are metaphors for what a body does, never a measurement of your kid.",
    pages: [
      { slug: "dopamine-for-kids", char: "dopa", query: "dopamine for kids" },
      { slug: "serotonin-for-kids", char: "sero", query: "serotonin for kids" },
      { slug: "endorphins-for-kids", char: "endo", query: "endorphins for kids" },
      { slug: "norepinephrine-for-kids", char: "nora", query: "norepinephrine / noradrenaline for kids, attention" },
      { slug: "gaba-for-kids", char: "gabi", query: "GABA for kids, the brain's brake" },
      { slug: "oxytocin-for-kids", char: "toci", query: "oxytocin for kids" },
      { slug: "cortisol-for-kids", char: "corti", query: "cortisol for kids, stress hormone explained for kids" },
      { slug: "melatonin-for-kids", char: "mela", query: "what does melatonin do (the body's own hormone), for kids" },
      { slug: "ghrelin-for-kids", char: "greli", query: "hunger hormone for kids, hangry kids" },
      { slug: "testosterone-in-teens", char: "teo", query: "testosterone in teen boys and girls explained" },
    ],
  },
  {
    key: "brain-parts",
    h1: "Parts of the brain for kids: the crew that runs the show",
    metaTitle: "Parts of the Brain for Kids, Explained",
    description: "The amygdala, the prefrontal cortex, neuroplasticity and co-regulation, explained for parents and kids with simple pictures and things to try tonight.",
    kicker: "brain town",
    intro: "Where the big feelings start, where the brakes live, and the two rules that shape every habit.",
    pages: [
      { slug: "amygdala-for-kids", char: "migo", query: "how to explain the amygdala to a child" },
      { slug: "prefrontal-cortex-for-kids", char: "fronti", query: "prefrontal cortex explained for kids" },
      { slug: "neuroplasticity-for-kids", char: "plasti", query: "neuroplasticity for kids" },
      { slug: "co-regulation-explained", char: "duo", query: "what is co-regulation, co-regulation for kids" },
    ],
  },
  {
    key: "habits",
    h1: "The habit villains that mess with kids’ sleep and focus",
    metaTitle: "Habits That Hurt Kids’ Sleep and Focus",
    description: "Phones in bed, late bright light, autoplay, notifications, changing bedtimes and caffeine: why each one gets in the way and how to beat it.",
    kicker: "the villains",
    intro: "Our villains are always a habit or a thing, never a person, a food or a body.",
    pages: [
      { slug: "phone-in-bed", char: "bedi", query: "phone in bedroom kids sleep" },
      { slug: "screens-before-bed", char: "glo", query: "screens before bed kids melatonin" },
      { slug: "autoplay", char: "lupi", query: "turn off autoplay kids, why kids can't stop watching" },
      { slug: "notifications-and-homework", char: "pingi", query: "phone notifications homework focus kids" },
      { slug: "irregular-bedtimes", char: "lati", query: "irregular bedtime kids behavior" },
      { slug: "caffeine-and-kids", char: "kafi", query: "caffeine energy drinks kids" },
    ],
  },
  {
    key: "ages",
    h1: "Your kid’s brain, age by age (3 to 17)",
    metaTitle: "Kids’ Brain Development by Age, 3 to 17",
    description: "What’s normal for a kid’s brain at 3–6, 6–8, 8–10, 10–12, 12–14 and 14–17, and what to focus on at home at each stage.",
    kicker: "ages & stages",
    intro: "Six stages, six characters. Ranges overlap and every kid has their own pace.",
    pages: [
      { slug: "brain-age-3-to-6", char: "whyzi", query: "4 year old / 5 year old brain development behavior" },
      { slug: "brain-age-6-to-8", char: "skuli", query: "7 year old behavior brain development" },
      { slug: "brain-age-8-to-10", char: "ruli", query: "9 year old behavior, 8 year old brain development" },
      { slug: "brain-age-10-to-12", char: "tweeni", query: "tween brain development 11 year old" },
      { slug: "brain-age-12-to-14", char: "sprouti", query: "13 year old brain, early teen brain development" },
      { slug: "brain-age-14-to-17", char: "seki", query: "teenage brain development 15 16 year old" },
    ],
  },
  {
    key: "why",
    h1: "Why does my kid…? The brain behind everyday struggles",
    metaTitle: "Why Does My Kid Do That? Brain-Based Answers",
    description: "Screen-off tears, after-school meltdowns, bedtime second winds, sibling fights: what’s going on in your kid’s brain and what to try tonight.",
    kicker: "why does my kid…",
    intro: "The hard moments every parent knows, decoded by the crew, with one thing to try tonight.",
    pages: [
      { slug: "kid-cries-when-screen-time-ends", char: "dopa", query: "why does my child get angry when screen time ends" },
      { slug: "five-more-minutes-never-ends", char: "lupi", query: "why does 5 more minutes turn into an hour, kids screens" },
      { slug: "kid-explodes-over-small-things", char: "migo", query: "why does my child explode over small things" },
      { slug: "kid-melts-down-after-school", char: "greli", query: "why does my child melt down after school" },
      { slug: "second-wind-at-bedtime", char: "mela", query: "why does my child get a second wind at bedtime" },
      { slug: "kid-cant-fall-asleep", char: "corti", query: "why can't my child fall asleep at night" },
      { slug: "school-mornings-are-a-battle", char: "sero", query: "school mornings battle kids" },
      { slug: "kid-gets-hangry", char: "greli", query: "hangry kids, my kid gets angry when hungry" },
      { slug: "kid-behaves-worse-with-parents", char: "toci", query: "why is my child worse with me than anyone else" },
      { slug: "kid-cant-focus-on-homework", char: "nora", query: "why can't my child focus on homework" },
      { slug: "kid-cant-wait", char: "fronti", query: "why does my child interrupt, can't wait their turn" },
      { slug: "siblings-fight-all-the-time", char: "corti", query: "why do my kids fight all the time" },
      { slug: "kid-always-jumping-and-crashing", char: "endo", query: "why is my kid always jumping, crashing into things" },
      { slug: "kid-wont-try-new-foods", char: "greli", query: "why won't my child try new foods" },
      { slug: "tummy-aches-before-school", char: "corti", query: "child stomach ache every morning before school" },
      { slug: "teen-takes-risks-with-friends", char: "fronti", query: "why do teenagers take more risks with friends" },
      { slug: "kid-doesnt-listen-until-i-yell", char: "migo", query: "why doesn't my child listen until I yell" },
    ],
  },
  {
    key: "what-to-say",
    h1: "What to say when… scripts for the hardest moments",
    metaTitle: "What to Say to Your Kid: Scripts That Work",
    description: "Short, brain-friendly words for screen-off time, meltdowns, hitting, bedtime worries and more. Instead of this, say that, and why it works.",
    kicker: "say this, not that",
    intro: "Fewer words, more presence. Each script is short enough to remember mid-meltdown.",
    pages: [
      { slug: "screen-time-warning", char: "dopa", query: "what to say when screen time is over, how to end screen time without a meltdown" },
      { slug: "instead-of-calm-down", char: "migo", query: "what to say instead of calm down" },
      { slug: "when-your-kid-hits", char: "migo", query: "what to say when your child hits you" },
      { slug: "instead-of-youre-so-smart", char: "plasti", query: "what to say instead of you're so smart, praise effort" },
      { slug: "when-your-kid-cant-sleep", char: "mela", query: "what to say when your child says I can't sleep" },
      { slug: "after-a-meltdown", char: "duo", query: "what to say after a meltdown, repair" },
      { slug: "talking-about-puberty", char: "tweeni", query: "how to talk to your child about puberty" },
      { slug: "to-yourself-after-a-hard-day", char: "duo", query: "parent guilt after yelling at kids, what to say to yourself" },
    ],
  },
  {
    key: "myths",
    h1: "Kids’ brain myths, checked against the science",
    metaTitle: "Kids’ Brain Myths vs. What Science Says",
    description: "Does sugar make kids hyper? Is the brain done at 25? Is dopamine the pleasure chemical? Ten popular claims about kids’ brains, checked.",
    kicker: "myth vs science",
    intro: "Ten things parents hear all the time, and what the research actually says.",
    pages: [
      { slug: "does-sugar-make-kids-hyper", query: "does sugar make kids hyper" },
      { slug: "do-we-only-use-10-percent-of-our-brain", query: "10 percent of brain myth" },
      { slug: "left-brain-right-brain-myth", query: "left brain right brain myth kids" },
      { slug: "learning-styles-myth", query: "visual auditory learner myth" },
      { slug: "is-the-brain-done-at-25", char: "fronti", query: "is the brain fully developed at 25" },
      { slug: "dopamine-detox-for-kids", char: "dopa", query: "dopamine detox for kids" },
      { slug: "is-dopamine-the-pleasure-chemical", char: "dopa", query: "is dopamine the pleasure chemical" },
      { slug: "is-cortisol-bad", char: "corti", query: "is cortisol bad, stress hormone kids" },
      { slug: "does-testosterone-cause-aggression", char: "teo", query: "does testosterone cause aggression in boys" },
      { slug: "aap-one-hour-screen-time-rule", query: "does the AAP still say 1 hour / 2 hours screen time" },
    ],
  },
  {
    key: "guides",
    h1: "Guides for parents",
    metaTitle: "Parent Guides: Screens and Sleep by Age",
    description: "The 2026 AAP screen-time guidance explained, and how much sleep kids need at every age, with sources.",
    kicker: "the big guides",
    intro: "The long reads: what the guidelines actually say, in plain words.",
    pages: [
      { slug: "aap-screen-time-guidelines-2026", query: "AAP screen time guidelines 2026" },
      { slug: "sleep-hours-by-age", char: "mela", query: "how much sleep does my child need by age" },
    ],
  },
];

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((s) => [s.key, s])) as Record<SectionKey, Section>;

/** Standalone pages outside the sections. */
export const EXTRA_PATHS = [
  "/learn", "/crew", "/glossary", "/about", "/editorial-policy", "/sources", "/privacy", "/terms",
  "/", "/pricing", "/faq", "/free", "/ask", "/#plans",
];

export const ALL_PATHS = [
  ...SECTIONS.map((s) => `/${s.key}`),
  ...SECTIONS.flatMap((s) => s.pages.map((p) => `/${s.key}/${p.slug}`)),
  ...EXTRA_PATHS,
];
