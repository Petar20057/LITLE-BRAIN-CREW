// The box at the end of each learn article (components/learn/ToolkitCta.tsx), by the article's group. Groups, slugs and
// headings come from the Toolkit conversion plan, section 4. The texts describe the 72-page Toolkit (2026-10-28 edition):
// chapter and page numbers are that PDF's.

export type BoxGroup = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export const BOX_GROUPS: Record<BoxGroup, { heading: string; text: string }> = {
  A: {
    heading: "The screen-time fight, decoded.",
    text: "Chapter 6 of The Kid Brain Toolkit (p. 32) is about screens and the reward system: what is actually measured, where screens belong at home, and how to end screen time with fewer fights, with a version for every age.",
  },
  B: {
    heading: "Bedtime, decoded.",
    text: "Two chapters of the Toolkit are about this: light and the body clock (p. 11) and sleep (p. 16), with how many hours each age needs and what to change in the last hour before bed. At checkout you can add the Bedtime & Screen-Off Kit: a crew bedtime story and the exact screen-off timer scripts.",
  },
  C: {
    heading: "For the next meltdown.",
    text: "Chapter 8 of the Toolkit (p. 43) is about stress and calm: why a calm adult close by is the most powerful calming tool, and what to try when it all blows up. Plus calm meals (p. 27), and the 60-Second Meltdown Plan for your fridge, included.",
  },
  D: {
    heading: "Get through to them without yelling.",
    text: "The Toolkit has a chapter on focus and motivation (p. 38), on how praise and rewards change how hard kids try, and one on movement (p. 22), because a single bout of activity sharpens attention. Plus 24 script cards with the exact words.",
  },
  E: {
    heading: "Fewer fights at home.",
    text: "Chapter 9 of the Toolkit (p. 49) is about connection: why warmth is one of the most consistent things linked to how kids do, and how ten minutes of special time a day helps. Plus 24 script cards with the exact words.",
  },
  F: {
    heading: "For the teen who stopped talking.",
    text: "Chapter 10 of the Toolkit (p. 54) is about the teen years: puberty, the later body clock, and how the same daily habits work for a teen. Plus when to talk to your pediatrician, all the signs in one place (p. 66).",
  },
  G: {
    heading: "What’s normal at every age.",
    text: "The Toolkit starts with a map of the growing brain (p. 6), and every chapter has a version of each habit for ages 4–7, 8–12 and 13–17. Plus when to talk to your pediatrician, all the signs in one place (p. 66).",
  },
};

/** Article path → group, for the 63 articles in the plan. Any other path gets the generic box. */
export const ARTICLE_GROUP: Partial<Record<string, BoxGroup>> = {
  // A · Screens
  "/why/kid-cries-when-screen-time-ends": "A",
  "/why/five-more-minutes-never-ends": "A",
  "/what-to-say/screen-time-warning": "A",
  "/habits/autoplay": "A",
  "/habits/notifications-and-homework": "A",
  "/brain-chemicals/dopamine-for-kids": "A",
  "/myths/dopamine-detox-for-kids": "A",
  "/myths/is-dopamine-the-pleasure-chemical": "A",
  "/myths/aap-one-hour-screen-time-rule": "A",
  "/guides/aap-screen-time-guidelines-2026": "A",
  // B · Sleep
  "/why/second-wind-at-bedtime": "B",
  "/why/kid-cant-fall-asleep": "B",
  "/why/school-mornings-are-a-battle": "B",
  "/what-to-say/when-your-kid-cant-sleep": "B",
  "/habits/phone-in-bed": "B",
  "/habits/screens-before-bed": "B",
  "/habits/irregular-bedtimes": "B",
  "/habits/caffeine-and-kids": "B",
  "/brain-chemicals/melatonin-for-kids": "B",
  "/guides/sleep-hours-by-age": "B",
  // C · Meltdowns and stress
  "/why/kid-explodes-over-small-things": "C",
  "/why/kid-melts-down-after-school": "C",
  "/why/kid-gets-hangry": "C",
  "/why/tummy-aches-before-school": "C",
  "/what-to-say/instead-of-calm-down": "C",
  "/what-to-say/when-your-kid-hits": "C",
  "/what-to-say/after-a-meltdown": "C",
  "/what-to-say/to-yourself-after-a-hard-day": "C",
  "/brain-parts/amygdala-for-kids": "C",
  "/brain-parts/co-regulation-explained": "C",
  "/brain-chemicals/cortisol-for-kids": "C",
  "/brain-chemicals/ghrelin-for-kids": "C",
  "/brain-chemicals/gaba-for-kids": "C",
  "/myths/is-cortisol-bad": "C",
  // D · Focus, waiting, listening
  "/why/kid-cant-focus-on-homework": "D",
  "/why/kid-cant-wait": "D",
  "/why/kid-doesnt-listen-until-i-yell": "D",
  "/why/kid-always-jumping-and-crashing": "D",
  "/what-to-say/instead-of-youre-so-smart": "D",
  "/brain-parts/prefrontal-cortex-for-kids": "D",
  "/brain-parts/neuroplasticity-for-kids": "D",
  "/brain-chemicals/norepinephrine-for-kids": "D",
  "/brain-chemicals/endorphins-for-kids": "D",
  "/myths/does-sugar-make-kids-hyper": "D",
  "/myths/learning-styles-myth": "D",
  "/myths/left-brain-right-brain-myth": "D",
  "/myths/do-we-only-use-10-percent-of-our-brain": "D",
  // E · Family and closeness
  "/why/siblings-fight-all-the-time": "E",
  "/why/kid-behaves-worse-with-parents": "E",
  "/why/kid-wont-try-new-foods": "E",
  "/brain-chemicals/oxytocin-for-kids": "E",
  "/brain-chemicals/serotonin-for-kids": "E",
  // F · Teens
  "/why/teen-takes-risks-with-friends": "F",
  "/what-to-say/talking-about-puberty": "F",
  "/brain-chemicals/testosterone-in-teens": "F",
  "/myths/does-testosterone-cause-aggression": "F",
  "/myths/is-the-brain-done-at-25": "F",
  "/ages/brain-age-12-to-14": "F",
  "/ages/brain-age-14-to-17": "F",
  // G · Ages 3 to 12
  "/ages/brain-age-3-to-6": "G",
  "/ages/brain-age-6-to-8": "G",
  "/ages/brain-age-8-to-10": "G",
  "/ages/brain-age-10-to-12": "G",
};
