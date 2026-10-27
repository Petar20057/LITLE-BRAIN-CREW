import type { LearnEntry } from "./types.ts";

// Sources cited here all live in content/learn/sources.ts (S01–S65). Claims were checked against them on 2026-10-26.

export const MYTHS: LearnEntry[] = [
  {
    section: "myths",
    slug: "does-sugar-make-kids-hyper",
    h1: "Does sugar make kids hyper?",
    metaTitle: "Does Sugar Make Kids Hyper? What the Research Shows",
    description: "No. A 1995 JAMA review of 23 blinded experiments found no effect of sugar on behavior, and a 1994 study found parents’ beliefs did the work.",
    kicker: "Myths · Sugar and behavior",
    answer: "No. In blinded experiments, kids who ate sugar behaved the same as kids who got a sugar-free placebo. A 1995 JAMA analysis of 23 such experiments found no effect on behavior or thinking, and a 1994 study found that mothers who merely believed their sons had eaten sugar rated them as more hyperactive.",
    kidVersion: "Parties are loud, late and full of friends, and that’s what makes your body zoom. The cake just happens to be there. After the party, let’s find a quiet corner and take three slow breaths, so your body can come back down.",
    myth: {
      claim: "Sugar makes kids hyper.",
      verdict: "Myth",
      truth: "When nobody knows who got sugar and who got a placebo, kids’ behavior and thinking don’t differ. What does change the picture is the party, the late hour and what the adults expect to see.",
    },
    sections: [
      {
        h2: "What did the studies actually find?",
        paras: [
          "The biggest check is a 1995 meta-analysis in JAMA by Wolraich and colleagues. It pooled 16 reports containing 23 experiments in which each child had a known amount of sugar in one session and an artificial-sweetener placebo in another. Children, parents and staff were all blinded, so nobody knew which session was which.",
          "The researchers compared 14 kinds of measures, from direct observation of behavior to school-style tests. For every one of them, the confidence interval included zero, which means the results were consistent with no effect at all. Their conclusion: sugar does not affect children’s behavior or cognitive performance.",
          "They were careful to add that a very small effect, or an effect in a small subset of kids, can’t be ruled out. That’s fair, and it’s a long way from “sugar makes kids hyper.”",
        ],
      },
      {
        h2: "If it isn’t the sugar, why does it look so real?",
        paras: [
          "A 1994 experiment by Hoover and Milich explains a lot. They recruited 35 boys, ages 5 to 7, whose mothers said they were sensitive to sugar. Every boy was given a sugar-free drink sweetened with aspartame. But half of the mothers were told their son had just had a large amount of sugar.",
          "Those mothers rated their sons as more hyperactive than the other mothers did. Observers also saw them stay physically closer, control more and, as a trend, criticize and talk to their sons more. For several measures, the effect was stronger in mothers whose thinking style was more rigid.",
          "Nobody in that study was a bad parent. We all notice what we expect to notice, especially at the end of a long day. If you’re braced for a wild kid, every cartwheel looks like evidence.",
        ],
      },
      {
        h2: "What is really going on at the birthday party?",
        paras: [
          "Sugar almost never arrives alone. Picture a Saturday party: ten friends, loud music, no nap, a late finish and a lot of freedom. Halloween night and holiday dinners work the same way. Dopa, the gold-star giver, is getting stars from every direction, and a kid running laps around the yard is simply a kid enjoying the stars.",
          "The meltdown that comes after the party often has a simpler explanation too. The fun ended, the day was long, and a tired or hungry body has fewer brakes. That’s Fronti, the brake-builder, running low. For the after-school version of this pattern, see the page on hangry kids.",
        ],
      },
      {
        h2: "Does that mean sweets don’t matter?",
        paras: [
          "This page is only about behavior. Sweets can still matter for teeth, and for how hungry your kid is at dinner. But if your goal is a calmer evening, skipping dessert is the wrong lever. Steady routines, a real meal before the party and a quiet landing afterward are better ones.",
        ],
      },
      {
        h2: "What helps instead?",
        paras: [
          "Change the setting, not the label. We don’t have a study on this, so take it as a hunch: kids who keep hearing “you’re wired on sugar” may start to see themselves that way. A neutral line works better.",
        ],
        bullets: [
          "Feed a normal meal before the party, so nobody arrives running on empty.",
          "Build in a quiet corner or a 10-minute walk outside halfway through.",
          "Keep the usual bedtime, even on party nights.",
          "Say what you see: “Your body is excited. Let’s take a breather.”",
        ],
      },
    ],
    atHome: [
      "Zoomies at birthday parties, Halloween and holiday gatherings",
      "You catching yourself saying “no more sweets, you’re bouncing off the walls”",
      "A tearful crash once the party is over",
      "Friends or cousins who get just as wild, with or without dessert",
    ],
    tryTonight: [
      "At the next party, jot down the time, the noise level and when your kid last had a real meal, before you blame the cake.",
      "Swap “you’re hyper from sugar” for “Your body is excited. Let’s take a breather.”",
      "Plan a quiet landing for after the party: dim lights, snack at the table, and a calm activity.",
    ],
    whenToTalk: "Wildness at one party is just a party. Talk to your pediatrician if restlessness, trouble sitting still or trouble paying attention show up everywhere (home and school) for months, if sleep stays hard for weeks, or if the pattern is getting worse. Bring a one- to two-week log of when it happens, not a theory about sugar.",
    faqs: [
      {
        q: "Does sugar affect kids’ attention at school?",
        a: "In the 1995 meta-analysis, the measures of thinking and school-style performance did not show a reliable effect either. Some averages leaned slightly positive and some slightly negative, but every range included zero. A sleepless night is a much better bet for a foggy school day.",
      },
      {
        q: "Why do I see it so clearly in my own kid?",
        a: "Because sugar and excitement travel together. Cake comes at parties, candy comes on Halloween and sweets come at holidays, all of which are exciting by themselves. And once you’ve spotted the pattern, your brain files every future example as confirmation.",
      },
      {
        q: "Could some kids still be sensitive to sugar?",
        a: "The 1995 authors said they couldn’t rule out a small effect in a subset of children. The way to find out is to watch for a pattern across several ordinary days, not just party days, and to talk with your pediatrician if you’re worried.",
      },
      {
        q: "Should I stop saying it in front of my kids?",
        a: "It’s worth a try. Describing the situation (“It’s been a loud, exciting day”) gives your kid a more accurate story about their body than blaming a snack does. It also keeps you from watching them through a sugar lens.",
      },
    ],
    sources: ["S51", "S52"],
    related: [
      "/myths",
      "/why/kid-gets-hangry",
      "/why/kid-melts-down-after-school",
      "/why/second-wind-at-bedtime",
      "/brain-parts/prefrontal-cortex-for-kids",
      "/habits/irregular-bedtimes",
    ],
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "do-we-only-use-10-percent-of-our-brain",
    h1: "Do we only use 10 percent of our brain?",
    metaTitle: "Do We Only Use 10 Percent of Our Brain? No: Here’s Why",
    description: "No. Brain imaging shows activity all over the brain, and the 10 percent claim has no research behind it. Where it came from and what matters for kids.",
    kicker: "Myths · Brain basics",
    answer: "No. Brain imaging shows activity across the whole brain over a day, damage to particular areas causes particular problems, and stimulating areas during surgery gets a response. The 10 percent figure has no research behind it. Most writers trace it to a 1936 self-help book, not to a lab.",
    kidVersion: "Your whole brain is a busy town, and it’s working all day. Fronti plans, Migo watches for danger, and at night Kampi the librarian files the day’s memories. Nobody in town is on a permanent day off.",
    myth: {
      claim: "We only use 10 percent of our brains.",
      verdict: "Myth",
      truth: "All parts of the brain are active across a normal day, though not all at the same moment. Different jobs switch on different areas. The 10 percent number comes from self-help folklore, not from research.",
    },
    sections: [
      {
        h2: "Where did the 10 percent number come from?",
        paras: [
          "Nobody knows for sure. According to a 2021 Discover magazine piece by Avery Hurt, most writers trace the number to Dale Carnegie’s 1936 self-help book How to Win Friends and Influence People. Carnegie likely expanded on an idea from psychologist William James, who wrote in a 1907 article in Science about untapped human potential. James’s passage doesn’t mention 10 percent at all.",
          "The article suggests the exact number is what made the myth stick. “10 percent” sounds like a measurement, and it’s also flattering: it promises that you have a huge reserve of power just waiting to be unlocked. That’s our reading of why it spreads, not a study finding.",
        ],
      },
      {
        h2: "What does the evidence say instead?",
        paras: [
          "Three separate lines of evidence point the same way. Functional MRI scans show that all parts of the brain are active across different activities, though not all at once. Studies of injured soldiers after World War II, which tested what people could and couldn’t do based on where the damage was, were among the earliest efforts to map what each area does. And when surgeons electrically stimulate different spots during epilepsy surgery, they get a response. As one researcher quoted by Discover put it, what never happens is nothing.",
          "There’s also plain reasoning, which is not a study: it would be odd for the body to build and feed a brain where nine-tenths sits idle.",
        ],
      },
      {
        h2: "Why do some parts light up while others look quiet?",
        paras: [
          "Because different jobs need different workers. Think of a kitchen at dinnertime: the oven, stove and sink all get used, but not at the same second. When your kid does math, planning areas get busy. When they hear a loud bang, Migo, the smoke detector, jumps in. During sleep, Kampi, the memory librarian, goes to work.",
          "A brain scan shows which areas are working harder than usual for one task. It was never showing that the other areas were switched off.",
        ],
      },
      {
        h2: "What’s the real story for kids’ brains?",
        paras: [
          "It’s better than the myth. The National Institute of Mental Health notes that the brain stops growing in size by early adolescence, while the fine-tuning of how it works goes on for years afterward. Part of that fine-tuning is synaptic pruning: through childhood and adolescence, connections that get used are kept and strengthened while unused ones are trimmed back, which is why what your kid repeats really matters.",
          "So the useful question isn’t how to unlock the other 90 percent. It’s what your kid is practicing, and whether they’re getting the sleep that lets Kampi file it.",
        ],
      },
    ],
    atHome: [
      "Your kid (or a classmate) saying “we only use 10 percent of our brains” and asking if it’s true",
      "Movies and cartoons where someone “unlocks” the rest of their brain",
      "Questions at bedtime about what the brain is doing while we sleep",
    ],
    tryTonight: [
      "Ask your kid: “If you only used one tenth of your brain, how would you ride a bike and tell a joke at the same time?” Then let them guess.",
      "Pick one skill they’re practicing, such as a piano piece or a jump shot, and say: “That’s your brain getting stronger where you use it.”",
      "Protect tonight’s bedtime. Sleep is when memories get filed.",
    ],
    whenToTalk: "This is a curiosity myth, not a worry. If a child is losing skills they already had, such as speech, balance or school performance, or if you notice a sudden change in how they think or move, talk to your pediatrician promptly. A change that lasts more than about two weeks is worth a conversation.",
    faqs: [
      {
        q: "Is there any truth in the 10 percent idea?",
        a: "Only a loose one. At any single moment, only some areas are working especially hard, and most of us could learn more than we have. But that’s about practice and sleep, not about hidden unused brain tissue.",
      },
      {
        q: "Do brain scans show unused areas?",
        a: "They show areas that are more or less active during one task compared with rest. That’s not the same as unused. Across different tasks, the activity moves around the whole brain.",
      },
      {
        q: "Where did Dale Carnegie get 10 percent?",
        a: "Writers who have traced it can’t point to a study. Carnegie probably built on a 1907 article by William James that talked about untapped potential without giving a number, and the percentage stuck as it was repeated.",
      },
      {
        q: "What should I tell my child who asks?",
        a: "You can say: “Your whole brain is working all the time. Different parts take the lead for different jobs. And the parts you practice get stronger.” It’s short, true and gives them something to do with the idea.",
      },
    ],
    sources: ["S63", "S56", "S42"],
    related: [
      "/myths",
      "/myths/left-brain-right-brain-myth",
      "/brain-parts/neuroplasticity-for-kids",
      "/brain-parts/prefrontal-cortex-for-kids",
      "/guides/sleep-hours-by-age",
    ],
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "left-brain-right-brain-myth",
    h1: "Is my child left-brained or right-brained?",
    metaTitle: "Left-Brained or Right-Brained Kids? A Myth, Checked",
    description: "Neither. A 2013 study of 1,011 brain scans found no left-brained or right-brained people. What’s true about the two halves, and how to drop the labels.",
    kicker: "Myths · Brain halves",
    answer: "Neither. A 2013 PLOS ONE study analyzed brain scans of 1,011 people aged 7 to 29 and found no evidence that people lean toward a mostly left or mostly right brain network. Some functions do favor one side, such as language on the left, but that’s a feature of every brain, not a personality type.",
    kidVersion: "Your brain has two halves, and they’re best friends. Kalo, the bridge in the middle, carries messages back and forth all day. You don’t have a “math side” or an “art side.” You have a whole team, and you get to practice anything you like.",
    myth: {
      claim: "Some kids are left-brained (logical) and some are right-brained (creative).",
      verdict: "Myth",
      truth: "Some skills lean toward one side, but no whole-brain “type” has been found. In a study of 1,011 scans, people did not favor one half of the brain overall.",
    },
    sections: [
      {
        h2: "What did the brain scans show?",
        paras: [
          "In 2013, Jared Nielsen and colleagues at the University of Utah went looking for the left-brain and right-brain person. They analyzed resting-state MRI scans from 1,011 people between the ages of 7 and 29, from public research databases. For each person, they measured how strongly roughly 7,000 small patches of the brain’s gray matter connected with the patches on the same side versus the opposite side.",
          "If some people were truly “left-brained,” their scans would show a stronger left-side network overall. They didn’t. The team found some lateralized hubs: language-related areas leaned left in most people, and attention-control areas leaned right. But the data did not support a whole-brain “type.” In the authors’ words, lateralization looks like a local property of brain networks, not a global one: it varies connection by connection.",
          "The study also found no difference between males and females, and only small shifts with age.",
        ],
      },
      {
        h2: "Why does the idea feel true?",
        paras: [
          "Because it starts with something true. Some jobs do lean to one side. Language areas sit mostly on the left in most people, and some attention systems lean right. The myth takes that fact and stretches it into a personality quiz: logical or creative, organized or artsy.",
          "That stretch has a cost. A kid who hears “I’m right-brained, I’m not a math person” has a ready excuse for stopping when something gets hard. Labels also stick to siblings. The “creative one” and the “smart one” can hold those roles for years.",
        ],
      },
      {
        h2: "So what do the two halves really do?",
        paras: [
          "They talk, constantly. Kalo, the bridge, is a thick band of fibers connecting the halves, and almost everything your kid does uses both. Reading a story uses language and picture-making. Playing soccer uses planning and body control. Drawing uses attention, memory and fine movement.",
          "A useful rule of thumb: the task is what lights up the brain, not the kid’s type.",
        ],
      },
      {
        h2: "What helps instead of a label?",
        paras: [
          "Praise what they did, not who they are. Mueller and Dweck’s 1998 research on praise found that children praised for intelligence later avoided challenges more than those praised for effort. A “you’re a right-brain kid” label works the same way as “you’re so smart”: it tells a child what they are, not what they can grow.",
          "Plasti, the character for neuroplasticity, has a better message: the brain changes from what’s repeated. Math facts, drawing and kicking a ball all get easier with practice, for everyone.",
        ],
      },
    ],
    atHome: [
      "A kid who says “I’m a right-brain person, I’m bad at math” (or the reverse)",
      "A school or relative who calls one child “the artist” and another “the scientist”",
      "Online quizzes for kids that sort them into left or right",
      "A kid who gives up quickly on tasks outside their label",
    ],
    tryTonight: [
      "Catch one label tonight (“the artistic one,” “the logical one”) and swap it for a description of what your kid did: “You kept trying different colors until it looked right.”",
      "Pick something your kid thinks they’re bad at and say: “Not yet. Let’s do five minutes.”",
      "Do an activity that uses both sides, such as drawing a map of your street, and ask them to explain it out loud.",
    ],
    whenToTalk: "A label isn’t a worry. But if your child avoids a whole area of school, such as reading or math, and the struggle has lasted months or shows up at home and at school, talk to your pediatrician or ask the school for an evaluation of the specific skill. A change that lasts more than about two weeks, or school avoidance that keeps going, is also worth a conversation.",
    faqs: [
      {
        q: "Do some kids really prefer logic or art?",
        a: "Of course, and that’s good to notice. Interests and strengths are real. They just aren’t a left-brain or right-brain type, and they change with practice, so it’s worth offering both.",
      },
      {
        q: "Is it true that language is on the left side?",
        a: "In most people, yes. Nielsen’s team found language-related hubs leaning left and attention-control hubs leaning right. That’s one reason brain injuries on different sides cause different problems. It doesn’t make a person left- or right-brained.",
      },
      {
        q: "Are left-handed kids right-brained?",
        a: "No. Handedness is a separate trait, and it doesn’t sort children into creative and logical types. Your lefty has the same two-sided team as everyone else.",
      },
      {
        q: "Where does this leave learning styles?",
        a: "In the same boat. Both ideas sort kids into types and then teach to the type. The separate learning-styles myth is covered on its own page.",
      },
    ],
    sources: ["S53", "S54", "S16"],
    related: [
      "/myths",
      "/myths/learning-styles-myth",
      "/brain-parts/neuroplasticity-for-kids",
      "/what-to-say/instead-of-youre-so-smart",
      "/ages/brain-age-8-to-10",
    ],
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "learning-styles-myth",
    h1: "Are visual, auditory and kinesthetic learners real?",
    metaTitle: "Visual vs Auditory Learners: The Learning Styles Myth",
    description: "Kids have preferences, but teaching to a “style” hasn’t been shown to help. A major review found almost no good evidence. What to do instead.",
    kicker: "Myths · How kids learn",
    answer: "Not as separate types. Kids do have preferences, but there’s almost no good evidence that teaching to a “style” (visual, auditory, kinesthetic) helps them learn more. A major 2008 review by Pashler and colleagues looked for studies showing that matching instruction to style improves results and found very few adequate ones.",
    kidVersion: "Everybody’s brain likes to learn in lots of ways. If you want to remember something, Kampi the librarian likes it when you see it, say it, draw it and try it, all four. Let’s do the same fact two ways tonight and see which one sticks.",
    myth: {
      claim: "Every child has a learning style (visual, auditory, kinesthetic), and they learn best when taught in that style.",
      verdict: "Myth",
      truth: "Children do prefer different formats, but the key test, in which matching teaching to a style produces better results, has almost never been run well, and when it has, it has not worked.",
    },
    sections: [
      {
        h2: "What would it take to show a learning style is real?",
        paras: [
          "The idea is called the “meshing hypothesis”: instruction works best when it matches a learner’s preferred style. In 2008, psychologists Harold Pashler, Mark McDaniel, Doug Rohrer and Robert Bjork reviewed the research in Psychological Science in the Public Interest, and they were specific about what a real test would look like.",
          "You sort learners by style, randomly assign them to different teaching methods, and give everyone the same final test. For the idea to hold up, there has to be a crossover: visual learners must do best with the visual method, while auditory learners must do best with the auditory one.",
        ],
      },
      {
        h2: "What did the review find?",
        paras: [
          "Plenty of evidence that people have preferences about how information is presented, and that people vary in certain abilities. But the authors found almost no studies that showed the crossover pattern. Few studies used a design that could show it at all, and some that did contradicted the idea.",
          "Their conclusion was measured, not harsh: the evidence wasn’t adequate to justify using learning-style tests in schools, and the time and money would be better spent on approaches with stronger support. They also noted that many versions of the idea remain untested, so more research could still be useful.",
        ],
      },
      {
        h2: "If kids do have preferences, why not follow them?",
        paras: [
          "You can, for fun and motivation. Nothing wrong with a kid who likes drawing a diagram. The problem comes when a preference becomes a rule: “I’m a visual learner, so I can’t learn from listening.” It can narrow what a kid is willing to try.",
          "It also ignores what the subject itself needs. Our reading, not a study finding: geometry is easier with a picture, pronunciation needs listening, and swimming needs water. The material picks the format more than the kid does.",
        ],
      },
      {
        h2: "What helps kids learn better?",
        paras: [
          "Skip the quiz and make the habits better. These are widely recommended study habits rather than the result of a single trial, so consider them good bets.",
        ],
        bullets: [
          "Quiz first, look second. Ask “What do you remember?” before opening the book.",
          "Spread it out. Ten minutes on three evenings beats thirty minutes the night before.",
          "Use more than one door. Say it, draw it, act it out, teach it to a stuffed animal.",
          "Praise the strategy, not the style: “You tried explaining it out loud, and it helped.” Mueller and Dweck’s 1998 praise research supports praising effort and process.",
          "Sleep after studying. Kampi files memories while your kid sleeps.",
        ],
      },
    ],
    atHome: [
      "A child (or a teacher’s note) describing your kid as “a visual learner” or “a hands-on learner”",
      "Your kid dodging reading aloud or note-taking because it’s “not their style”",
      "Learning-style quizzes sent home or found online",
      "Study sessions that are one long cram the night before a test",
    ],
    tryTonight: [
      "For a school-age kid, pick one fact from tonight’s homework. Have your kid say it, then draw it, then explain it to you, in that order.",
      "Close the book and ask: “What do you remember?” Then check together.",
      "For school-age kids, plan homework in two short sessions on different evenings this week instead of one long one.",
    ],
    whenToTalk: "Preferences aren’t a concern. But if your child has trouble learning in every format, such as reading, listening and hands-on tasks, for months, or if school struggles show up everywhere and are getting worse, talk to your pediatrician and the school. Struggles with school that keep going, or new refusal to go to school, deserve a conversation.",
    faqs: [
      {
        q: "Is it wrong to ask my child how they like to study?",
        a: "Not at all. Preferences matter for motivation. Just take the answer as one option to try, not a rule the child has to live by.",
      },
      {
        q: "What about kids who need to move to learn?",
        a: "Movement can help many kids stay alert, and that’s different from a learning style. Moving for a few minutes before homework is a good habit for lots of children, because it helps with focus.",
      },
      {
        q: "Why do so many teachers and books still use learning styles?",
        a: "The idea feels respectful of every child, it’s easy to explain and there are many commercial tests. The 2008 review noted how widely used they are. A popular idea can outlive its evidence.",
      },
      {
        q: "Does multiple-format teaching help anyone?",
        a: "Using more than one format can be a good habit for everybody, because each pass is another chance to remember. That’s different from picking one format per kid.",
      },
    ],
    sources: ["S54", "S16"],
    related: [
      "/myths",
      "/myths/left-brain-right-brain-myth",
      "/why/kid-cant-focus-on-homework",
      "/what-to-say/instead-of-youre-so-smart",
      "/brain-parts/neuroplasticity-for-kids",
    ],
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "is-the-brain-done-at-25",
    h1: "Is the brain fully developed at 25?",
    metaTitle: "Is the Brain Fully Developed at 25? Fact vs Myth",
    description: "No finish line exists. The brain keeps maturing into the twenties, and the prefrontal cortex settles late. What “under construction” means for teens.",
    kicker: "Myths · Teen brain",
    char: "fronti",
    charCaption: "Fronti: plans, waits and works the brakes, still under construction",
    answer: "No, not on a set date. The brain keeps maturing into the twenties, and the prefrontal cortex is one of the last parts to settle, but researchers describe a gradual process with no switch that flips at 25. The number is popular shorthand. “Still under construction” is the accurate version.",
    kidVersion: "Fronti is the part of your brain that plans, waits and works the brakes. Fronti is still being built, and that’s normal, because it takes years. Until then, you can borrow my brakes, and every time you practice waiting, you help build yours.",
    myth: {
      claim: "The brain is fully developed at 25.",
      verdict: "Myth",
      truth: "The brain matures gradually through the teens and into the twenties, with the prefrontal cortex among the last to settle. There is no exact finish line, and it doesn’t mean teens can’t make good choices.",
    },
    sections: [
      {
        h2: "Where does the number 25 come from?",
        paras: [
          "No study found a finish line at 25. The number is popular shorthand for a real finding, that the brain keeps maturing into the twenties, and it traveled much further than the research behind it. Researchers who study adolescence describe a gradual process with no sharp cutoff.",
          "Brain-imaging studies of teens really did find that development continued well past childhood. In one well-known project, 13 healthy children were scanned about every two years for 8 to 10 years, between the ages of 4 and 21 (Gogtay and colleagues, 2004, published in PNAS). It showed that higher-order areas that integrate information matured after the basic sensory areas they depend on.",
        ],
      },
      {
        h2: "What does current research say?",
        paras: [
          "The National Institute of Mental Health describes the brain as finishing its development “in the mid-to-late 20s,” and calls the prefrontal cortex “one of the last parts to mature.” That’s a range, not a line. It also says that after brain size stops growing in early adolescence, refinement of how the brain works continues for years.",
          "In practice, researchers talk about a long, uneven process. Different regions mature at different speeds, and people differ a lot from one another. Age is a rough guide, not a deadline.",
        ],
      },
      {
        h2: "What does “still under construction” mean for my kid?",
        paras: [
          "It means Fronti is working with some brakes missing. Planning ahead, waiting, weighing consequences and stopping an impulse mid-swing are all skills in progress. The same kid who explains the rules of a complicated video game can still melt down when the tablet goes off.",
          "It does not mean teens can’t reason, can’t be trusted or are excused. The practical read is gentler: expect the brakes to be unreliable when your kid is tired, hungry, stressed or with friends, and help them practice.",
        ],
      },
      {
        h2: "How can I help Fronti grow?",
        paras: [
          "The habits that help are small and boring, which is good news. Sleep comes first: the NIMH notes that insufficient sleep makes it harder for teens to focus, control impulses and do well in school, and that teens’ body clocks run later. Carskadon and Tarokh’s 2014 review of adolescent sleep biology says the same about the later body clock.",
          "Beyond sleep, keep rules short, practice waiting a few seconds at a time, offer two choices rather than ten, and lend your calm when theirs runs out. For teens, make deals rather than orders: it gives Fronti real decisions to practice on.",
        ],
      },
    ],
    atHome: [
      "A teen who plans an elaborate project and forgets the one thing due tomorrow",
      "Great self-control one day and big impulses the next, especially when tired",
      "Impulsive choices in front of friends that the same kid would never make alone",
      "A younger child who can’t wait their turn, which is normal at that age",
    ],
    tryTonight: [
      "Play a waiting game with a younger kid, such as Freeze or Simon Says. With a teen, agree on one small deal, like phone-off time for a later weekend curfew.",
      "Offer two choices instead of ten: “Homework before or after a snack?” for a school-age kid, or “Puzzle or blocks first?” for a 3 to 5 year old.",
      "Agree on a phone-off time that gives your teen a full night’s sleep, and put the charger outside the bedroom.",
    ],
    whenToTalk: "Slow brakes are normal. Talk to your pediatrician if problems with attention or impulse control show up everywhere (home and school) for months, or if a change in mood, sleep or appetite lasts more than about two weeks or is getting worse. If your teen talks about hurting themselves, act the same day. Ask directly and stay close. Call or text 988 (Suicide & Crisis Lifeline). In an emergency, call 911.",
    faqs: [
      {
        q: "So when is the brain actually done?",
        a: "Researchers don’t give a single age. The NIMH range is the mid-to-late twenties, and the brain keeps adapting through adult life. A better question is what each stage is building.",
      },
      {
        q: "Does this mean my 16-year-old can’t make good decisions?",
        a: "No. Teens can reason well, especially when they’re calm and have time. Decisions in the heat of the moment, with friends watching, are where brakes are still being built. Giving them real decisions with a safety net is how that grows.",
      },
      {
        q: "Is it fair to use “brain isn’t finished” as an excuse for a teen?",
        a: "It’s an explanation, not an excuse. A teen can understand why impulse control is harder and still be responsible for repairing what happened. Both can be true.",
      },
      {
        q: "Why does the prefrontal cortex take so long?",
        a: "It manages some of the most complex jobs: planning, weighing options and holding back. Studies of cortical development, such as Gogtay’s 13-child scan study, found that areas that combine information from other regions mature after the basic sensory areas.",
      },
    ],
    sources: ["S56", "S64", "S14", "S12"],
    related: [
      "/myths",
      "/brain-parts/prefrontal-cortex-for-kids",
      "/why/kid-cant-wait",
      "/why/teen-takes-risks-with-friends",
      "/ages/brain-age-14-to-17",
      "/guides/sleep-hours-by-age",
    ],
    entity: { name: "Prefrontal cortex", sameAs: "https://en.wikipedia.org/wiki/Prefrontal_cortex" },
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "dopamine-detox-for-kids",
    h1: "Does a dopamine detox work for kids?",
    metaTitle: "Dopamine Detox for Kids: Why It Doesn’t Work",
    description: "A “dopamine detox” isn’t a real thing, and dopamine isn’t a toxin. What the idea gets half right, and the small habit changes that actually help kids.",
    kicker: "Myths · Dopamine and screens",
    char: "dopa",
    charCaption: "Dopa: gives out gold stars when you finish something",
    answer: "No. There’s no such thing as a true dopamine detox: dopamine isn’t a toxin, and you can’t empty it out of a body that needs it. The idea hides a useful kernel, changing one or two specific habits, and a small, steady change tends to work better than a dramatic all-or-nothing break.",
    kidVersion: "Dopa isn’t a bad guy, and she can’t be sent away. She’s the one who gives out gold stars when you finish things. Right now the screen hands out stars way too fast, so let’s find some slower stars together: a puzzle, a ball, a drawing.",
    myth: {
      claim: "A dopamine detox will clear out the brain, and kids need one after too much screen time.",
      verdict: "Myth",
      truth: "Dopamine can’t be emptied out, and it isn’t a toxin. The useful part of the idea is ordinary habit change around one or two behaviors, with something better to do instead.",
    },
    sections: [
      {
        h2: "What is a dopamine detox supposed to be?",
        paras: [
          "On social media, a “dopamine detox” usually means a day or a week of cutting out anything pleasant, from phones and snacks to music and chatting, so that the brain’s chemistry supposedly settles down. Parents sometimes wonder whether their kids need one after a screen-heavy week.",
          "Cleveland Clinic’s 2024 explainer puts it bluntly: there is no such thing as a true dopamine detox. Dopamine is a chemical your brain makes naturally and needs. It isn’t a toxin that builds up. Everyday things like eating and being with friends release dopamine too, so cutting out everything pleasant doesn’t lower it in the way the claim suggests.",
        ],
      },
      {
        h2: "Where did the idea come from?",
        paras: [
          "According to Cleveland Clinic, the term was coined by psychologist Cameron Sepah in a 2019 LinkedIn article as “dopamine fasting.” The clinic describes it as a rebranding of cognitive behavioral therapy, in which a person picks a habit they want to change and limits it. The catchy chemistry name stuck, even though it’s scientifically inaccurate.",
          "The same article warns that the all-or-nothing social-media version can backfire, much like a crash diet. For a child, a sudden total ban can also feel like a punishment, which makes the next negotiation harder.",
        ],
      },
      {
        h2: "What is the useful part?",
        paras: [
          "The kernel is simple. Pick one specific habit, set a limit or a window, put something better in its place, and watch what happens. Cleveland Clinic’s suggested steps are to choose one habit, run a time-limited experiment, replace it with a soothing, still enjoyable activity such as a walk, keep notes on triggers, and review.",
          "For kids, that translates into a few unglamorous moves, many of which match the 2026 American Academy of Pediatrics statement. It notes that endless scrolls and autoplay are common on video platforms and says autoplay should be off by default. It also advises avoiding screens an hour before bedtime and keeping devices out of the bedroom.",
        ],
        bullets: [
          "Turn autoplay off. Pick the episode before you press play.",
          "Use a window, not a ban: “Tablet after homework, until dinner” for a school-age kid, or “Tablet after we clean up, until dinner” for a younger one.",
          "Name the replacement before the screen goes off: a game they can win, a walk, a drawing.",
          "Phones charge outside the bedroom, yours included.",
        ],
      },
      {
        h2: "Why do screens feel so hard to stop?",
        paras: [
          "Short videos and games hand out rewards fast and often. Dopa, the gold-star giver, loves finishing things, and when stars come every few seconds, a body can get used to quick stars. When they stop, Dopa panics, and you see it as tears. That is a picture, not a measurement: nobody can see your child’s dopamine.",
          "The cause is usually the design. The 2026 AAP statement singles out autoplay and endless feeds as features that keep kids watching. So the most effective step is often to change the setup, not to purge anything.",
        ],
      },
    ],
    atHome: [
      "Tears or yelling when the tablet or game goes off",
      "“Just one more!” again and again",
      "A kid who seems bored by anything slower than a screen",
      "A relative or video telling you your kid needs a “detox”",
    ],
    tryTonight: [
      "Turn autoplay off on the app your kid uses most, and pick tonight’s show together.",
      "Warn at 5 minutes and at 1 minute before screens go off, and name what comes next.",
      "Swap one video for a short game they can win: a puzzle, cards or a race to the end of the street.",
    ],
    whenToTalk: "Habit changes are not a medical plan. Talk to your pediatrician if screen use is crowding out sleep, school, friends or meals for weeks, if your child seems persistently low or withdrawn, or if there are big mood changes that last more than about two weeks. Words like “addicted” are used loosely online; a pediatrician can help sort out what is going on in your family.",
    faqs: [
      {
        q: "Is my child addicted to screens?",
        a: "“Addicted” gets used loosely, and it’s not a label we can put on your child. What we can say is that apps are designed to keep going, and kids’ brakes are still being built. If screens are crowding out sleep, school or friends, take it to your pediatrician.",
      },
      {
        q: "Should I take away all screens for a week?",
        a: "Cleveland Clinic cautions that all-or-nothing approaches can backfire. Many families do better with one specific change, such as no screens in the bedroom, held steadily for a few weeks.",
      },
      {
        q: "Is there anything to the idea at all?",
        a: "Yes, the habit-change part. Choosing one behavior, setting a limit and replacing it with something satisfying is a sound approach. It’s the chemistry story attached to it that doesn’t hold up.",
      },
      {
        q: "How long before I see a change?",
        a: "Expect a bumpy first week. Warnings and routines work once your kid can predict them, and that takes repetition. If nothing eases after several weeks, ask your pediatrician.",
      },
    ],
    sources: ["S55", "S31", "S01", "S02"],
    related: [
      "/myths",
      "/myths/is-dopamine-the-pleasure-chemical",
      "/brain-chemicals/dopamine-for-kids",
      "/why/kid-cries-when-screen-time-ends",
      "/habits/autoplay",
      "/what-to-say/screen-time-warning",
    ],
    entity: { name: "Dopamine", sameAs: "https://en.wikipedia.org/wiki/Dopamine" },
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "is-dopamine-the-pleasure-chemical",
    h1: "Is dopamine the pleasure chemical?",
    metaTitle: "Is Dopamine the Pleasure Chemical? Wanting vs Liking",
    description: "Mostly no. Research by Berridge and Robinson links dopamine to wanting and learning what pays off, more than to enjoyment. Why that matters for kids.",
    kicker: "Myths · Dopamine",
    char: "dopa",
    charCaption: "Dopa: gives out gold stars when you finish something",
    answer: "Mostly no. Research by Kent Berridge and Terry Robinson suggests dopamine drives wanting, the pull toward a reward, and learning what pays off, more than it creates enjoyment itself. In the animal experiments they review, raising dopamine made animals seek rewards harder without making them like the reward more.",
    kidVersion: "Dopa is the one who says “go get it!” more than the one who says “yum!” That’s why you can want one more video even when the last one wasn’t very fun. Let’s check: are we still enjoying it, or do we just want more?",
    myth: {
      claim: "Dopamine is the brain’s pleasure chemical.",
      verdict: "Mostly myth",
      truth: "Dopamine is more about wanting, motivation and learning from rewards than about enjoyment. Liking depends on smaller brain systems that don’t rely on dopamine, though this evidence comes largely from animal studies.",
    },
    sections: [
      {
        h2: "Where did the “pleasure chemical” idea come from?",
        paras: [
          "For decades, dopamine was described as the molecule of pleasure. Early experiments that blocked dopamine in animals seemed to support it: the animals stopped working for rewards, so researchers assumed the fun had been taken away.",
          "Neuroscientist Kent Berridge, working with Terry Robinson at the University of Michigan, noticed a problem with that reading. Blocking dopamine removed rats’ motivation to eat, but their faces still showed they enjoyed sweet food when it was given to them. Even after more complete depletion of dopamine, rats still showed signs of liking sweet tastes. They just no longer went after them.",
        ],
      },
      {
        h2: "What is the difference between wanting and liking?",
        paras: [
          "In their 2016 review in American Psychologist, Berridge and Robinson describe wanting, which they call incentive salience, as running on large brain systems that include dopamine pathways. Liking, the actual enjoyment, depends on smaller, more fragile systems that don’t rely on dopamine.",
          "In animal experiments they describe, raising dopamine increased how hard the animals worked for a sweet reward without increasing their signs of enjoying it. So “wanting” and “liking” can come apart. Most of this evidence is from animals, so it’s a strong clue about humans, not a final answer.",
        ],
      },
      {
        h2: "Why does this matter for kids?",
        paras: [
          "Because it explains the most familiar scene of the evening. “Just one more!” doesn’t mean your kid is enjoying the fifth video more than the first. It can mean the pull is stronger than the fun. When the next video starts by itself, Lupi, the autoplay villain, keeps feeding that pull.",
          "It also fits the way we describe Dopa: she’s about wanting, trying and feeling proud, which makes her the one who nudges kids to keep going toward a goal. That’s why finishing something small can feel good, and why easy stars stop being satisfying.",
        ],
      },
      {
        h2: "What can I do with that?",
        paras: [
          "Help your kid notice the difference. “Are you still enjoying it, or do you just want more?” gives them a way to catch the pull. You can also make the ending part of the plan: pick the episode before play, set a stopping point, warn at 5 minutes and 1 minute.",
          "A related idea from research on motivation: Deci, Koestner and Ryan’s 1999 meta-analysis found that expected rewards for activities people already enjoy can reduce later interest. Our reading is that prizes can add pull while taking some fun away. Keep stars for effort and finishing, and let fun be fun.",
        ],
      },
    ],
    atHome: [
      "“Just one more!” when the last video didn’t even look fun",
      "A kid who keeps scrolling while saying they’re bored",
      "Chasing the next level or prize more than enjoying the game",
      "Real excitement before something (a trip, a new game) that fades quickly once it arrives",
    ],
    tryTonight: [
      "Ask once tonight: “Are you still enjoying it, or do you just want more?” Don’t argue with the answer.",
      "Pick the show or level before pressing play, and agree on where it ends.",
      "Do a small task with a clear end, such as a puzzle or tidying one shelf, and cheer the finish.",
    ],
    whenToTalk: "A strong pull toward screens or sweets is common at every age. Talk to your pediatrician if the pull is crowding out sleep, meals, school or friends for weeks, if your child seems unhappy or flat when away from screens, or if mood changes last more than about two weeks. “Addicted” is a loose online word, not something we can say about a child here.",
    faqs: [
      {
        q: "So what does dopamine do?",
        a: "In the Berridge and Robinson account, it helps the brain notice which cues predict rewards and pushes the body toward them. It also helps with learning what pays off. Dopa is the character for that wanting, trying and feeling proud.",
      },
      {
        q: "Does dopamine make things feel good at all?",
        a: "That’s still debated. The animal research suggests liking comes mostly from other systems, which don’t depend on dopamine. We try not to say dopamine equals pleasure, because the best evidence points to wanting.",
      },
      {
        q: "Is wanting bad?",
        a: "Not at all. Wanting gets kids to try, practice and finish things. The trouble starts when something gives you wanting without much liking, like an endless feed.",
      },
      {
        q: "Can I measure my child’s dopamine?",
        a: "No, and neither can an app or a quiz. The crew are characters that explain what a body does, never a reading of your child. Be wary of any product that claims to measure or balance it.",
      },
    ],
    sources: ["S31", "S15", "S01"],
    related: [
      "/myths",
      "/myths/dopamine-detox-for-kids",
      "/brain-chemicals/dopamine-for-kids",
      "/habits/autoplay",
      "/why/five-more-minutes-never-ends",
      "/brain-chemicals/endorphins-for-kids",
    ],
    entity: { name: "Dopamine", sameAs: "https://en.wikipedia.org/wiki/Dopamine" },
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "is-cortisol-bad",
    h1: "Is cortisol bad for kids?",
    metaTitle: "Is Cortisol Bad for Kids? The Stress Hormone, Explained",
    description: "No. Cortisol wakes the body up and rings the alarm in real danger. The problem is stress that never stops and kids facing it without a supportive adult.",
    kicker: "Myths · Stress hormone",
    char: "corti",
    charCaption: "Corti: rings the alarm when there’s danger",
    answer: "No. Cortisol is a hormone your child’s body needs: it helps wake them up each morning and sounds the alarm when something is wrong. The trouble starts when the alarm rings for too long with no calm adult to help it settle, which the Harvard Center on the Developing Child calls toxic stress.",
    kidVersion: "Corti is your alarm bell, and she’s not a bad guy. She helps you jump out of the way of a ball, and she helps you wake up in the morning. If she keeps ringing, we’ll breathe together until she settles down.",
    myth: {
      claim: "Cortisol is the bad guy hormone, and a stressed kid has too much of it.",
      verdict: "Mostly myth",
      truth: "Cortisol is essential and rises naturally after waking. The harm comes from stress that is strong, frequent and prolonged without a supportive adult nearby, not from cortisol itself.",
    },
    sections: [
      {
        h2: "What does cortisol do all day?",
        paras: [
          "Cortisol is made by the body’s stress system, and it has a normal daily rhythm. It is highest just after waking and then falls through the day. In a small 2012 study of seven children aged 2 to 4, cortisol rose by about half in the first 15 to 30 minutes after waking from a night’s sleep, then declined. Researchers call this the cortisol awakening response.",
          "In the same study, after a night with about two hours less sleep, waking cortisol and total morning output were lower, though the size of the rise itself did not change significantly. With only seven children, it’s a hint, not a rule. It does fit our picture: Corti wakes the body up in the morning, while Mela, the sleepy-time hormone, puts it to bed.",
        ],
      },
      {
        h2: "So why is cortisol called the stress hormone?",
        paras: [
          "Because it also helps the body respond to challenges. The Harvard Center on the Developing Child explains that stress systems release hormones such as cortisol to get the body ready to deal with something hard. That is useful: a barking dog, a first day at school or a big test all call for it.",
          "Harvard describes three kinds of stress response. Positive stress is a brief, normal reaction that is essential for development, like the sting of a vaccine with a caregiver’s comfort. Tolerable stress is time-limited and buffered by relationships with adults. Toxic stress comes from strong, frequent, prolonged adversity without that buffering.",
        ],
      },
      {
        h2: "What turns a useful alarm into a problem?",
        paras: [
          "Duration and support. Harvard notes that with caring adults nearby, a child’s stress response is brief and returns to normal quickly. Without support, the response can stay switched on at high levels for long periods. In our language: Corti is fine; Corti that never gets turned off is tiring.",
          "That is why co-regulation matters more than avoiding every stress. Your calm voice, your slow breathing and your presence are what tell the alarm it can stop. A kid who feels a little nervous before a recital is practicing, not being harmed.",
        ],
      },
      {
        h2: "What calms Corti at home?",
        paras: [
          "The same routines each day, slow breathing together, moving the body after school and a quiet last hour before bed. Rushing, fights, bad sleep and late-night screens tend to set Corti off.",
          "Please don’t try to measure it. Cortisol levels aren’t something a parent can read from behavior, and our characters are metaphors for what a body does, never a measured level. A stressed kid doesn’t need a lab number. They need a calm grown-up, a steady routine and enough sleep.",
        ],
      },
    ],
    atHome: [
      "A kid who’s cranky and slow in the first minutes after waking",
      "Tummy aches or headaches before big days, such as tests and school mornings",
      "A body on high alert: fast breathing, fidgeting, hard to settle",
      "Sleep that’s hard on stressful days, and a morning that’s harder after it",
    ],
    tryTonight: [
      "Take 3 slow breaths together: smell the flower, blow out the candle.",
      "Turn screens off one hour before bed, and keep the last hour calm.",
      "Lay out tomorrow’s clothes tonight, so the morning isn’t a rush.",
    ],
    whenToTalk: "Everyday stress is normal and manageable. Talk to your pediatrician if worry, physical complaints with no clear cause or school avoidance keep going, if sleep stays hard for weeks, if a change in mood or appetite lasts more than about two weeks, or if your child has been through something frightening or hard that keeps showing up in their behavior.",
    faqs: [
      {
        q: "Should I worry that my child has too much cortisol?",
        a: "You can’t tell from behavior, and a number wouldn’t be useful at home. Focus on what you can see: sleep, routines, how long hard moments last and whether a calm adult is available. Ask your pediatrician if you’re worried.",
      },
      {
        q: "Is all stress harmful for kids?",
        a: "No. Harvard describes positive stress, such as a first day of school or a shot with a hug, as a normal part of development. What matters is whether the stress is brief and supported.",
      },
      {
        q: "Why is my child groggy in the morning if cortisol wakes them up?",
        a: "Grogginess has several causes, and short sleep is a big one. In the small 2012 study, morning cortisol ran lower after a short night, which fits the idea that a rested body wakes more smoothly. An earlier bedtime and a calm start often help more than anything else.",
      },
      {
        q: "What is toxic stress?",
        a: "It is the Harvard Center’s term for strong, frequent, prolonged adversity without the buffer of supportive relationships. It describes what the stress response does to the body over time, not any single bad day. Ordinary hard days with a caring adult nearby are a different thing.",
      },
    ],
    sources: ["S09", "S65", "S10"],
    related: [
      "/myths",
      "/brain-chemicals/cortisol-for-kids",
      "/brain-chemicals/melatonin-for-kids",
      "/why/kid-cant-fall-asleep",
      "/why/tummy-aches-before-school",
      "/brain-parts/co-regulation-explained",
    ],
    entity: { name: "Cortisol", sameAs: "https://en.wikipedia.org/wiki/Cortisol" },
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "does-testosterone-cause-aggression",
    h1: "Does testosterone cause aggression in teen boys?",
    metaTitle: "Does Testosterone Cause Aggression in Teens?",
    description: "Barely. A 2020 meta-analysis found a very weak link between testosterone and aggression. What drives teen anger is sleep, stress and a growing brain.",
    kicker: "Myths · Testosterone (teen material)",
    char: "teo",
    charCaption: "Teo: builds strength, energy and confidence in the teen years",
    teenOnly: true,
    answer: "Very little. A 2020 meta-analysis in Hormones and Behavior found only a weak link between testosterone and aggression (a correlation of about 0.05 in baseline levels). Teen anger is better explained by sleep, stress, still-developing brakes and the situation than by one hormone.",
    kidVersion: "Teo helps your body get stronger, with more energy and confidence. Teo doesn’t make you angry. Big feelings in the teen years come from lots of things at once, and sleep, sports and a friend to talk to can help them settle.",
    myth: {
      claim: "Testosterone makes teenage boys aggressive.",
      verdict: "Mostly myth",
      truth: "Meta-analyses find only a weak link between testosterone and aggression. A teen’s anger is better explained by tiredness, stress, social situations and brakes that are still being built than by testosterone.",
    },
    sections: [
      {
        h2: "What does the research find?",
        paras: [
          "The most recent big check is a 2020 meta-analysis by Geniole and colleagues in Hormones and Behavior. It pooled many studies and looked at three kinds of evidence: baseline testosterone levels, changes in testosterone in response to a challenge, and experiments where testosterone was given to people on purpose.",
          "The results were small across the board. For baseline levels, the correlation with aggression was r = 0.054. That is so small that, by our arithmetic, differences in testosterone account for well under one percent of the differences in aggression. The link was a little larger for men (r = 0.071) and essentially zero for women (r = 0.002). For studies that changed testosterone on purpose, the effect was not statistically significant.",
          "Earlier meta-analyses, including one by Book and colleagues in 2001, also reported weak links. These are pooled results from published research, not a reading of any one teen.",
        ],
      },
      {
        h2: "Why does the myth stick?",
        paras: [
          "Puberty brings two real things at once: a rise in testosterone and a stretch of bigger feelings, more conflict with parents and louder friendships. When two things happen together, it is easy to say one causes the other.",
          "The myth also hands everyone an easy line: “it’s just hormones.” That can sound kind, but it puts a teen’s behavior in the category of things nobody can do anything about. In truth, there’s a lot we can do.",
        ],
      },
      {
        h2: "What really sits behind teen anger?",
        paras: [
          "Several things, and they stack. Teens’ body clocks shift later, and Carskadon and Tarokh’s 2014 review describes how those changes in sleep biology can affect adolescent behavior. Sleep debt shortens tempers. The prefrontal cortex is still being built, so brakes are less reliable under stress.",
          "Friends matter more than ever, and in a 2011 experiment by Chein and colleagues, teens showed more risk-taking when peers were watching, along with more activity in reward circuitry. Context matters: a teen who is calm at home may be explosive after a humiliating day, or just after a loss on the field.",
        ],
      },
      {
        h2: "What helps?",
        paras: [
          "Teo’s own job list is a good start: deep sleep, sports and strength games, daylight and real food. Protect sleep first. Then give big energy somewhere to go. Choose a conversation time when no one is upset, and talk side by side, in a car or on a walk, instead of face to face.",
          "Name the feeling rather than the hormone. “You seem really frustrated” works better than “is it your hormones?” And if anger ever turns into hurting someone, that’s a safety question for a professional, not a hormone question.",
        ],
      },
    ],
    atHome: [
      "Quick irritation at small things, especially late in the evening or after a bad night of sleep",
      "More conflict with parents and siblings during early puberty",
      "A teen who’s calm alone and explosive in front of friends, or the other way around",
      "Big energy that needs somewhere to go: slammed doors, pacing, restless legs",
    ],
    tryTonight: [
      "Agree on a phone-off time that allows a full night’s sleep.",
      "Plan one sport or workout this week, ideally something your teen picks.",
      "Skip “is it your hormones?” and try: “Rough day? I’m around if you want to talk, no rush.”",
    ],
    whenToTalk: "Moodiness is common in puberty. Talk to your pediatrician if anger is frequent, intense or dangerous, if your teen hurts people or breaks things, if a change in mood, sleep or appetite lasts more than about two weeks, or if puberty signs appear before age 8 or have not started by 15. If your teen talks about hurting themselves, act the same day. Ask directly and stay close. Call or text 988 (Suicide & Crisis Lifeline). In an emergency, call 911.",
    faqs: [
      {
        q: "Do girls have testosterone too?",
        a: "Yes. Both boys’ and girls’ bodies make testosterone, in different amounts. In the 2020 meta-analysis, the link to aggression was essentially absent for women.",
      },
      {
        q: "Does that mean hormones don’t matter in puberty?",
        a: "They do. Puberty changes growth, sleep timing and energy. The point is only that testosterone alone doesn’t explain aggression, and that blaming hormones can hide the fixable parts, like sleep.",
      },
      {
        q: "What about testosterone changing after a competition?",
        a: "The 2020 meta-analysis found that changes in testosterone in response to a challenge had a slightly larger link (r = 0.108), which the authors suggest may matter for specific situations. It’s still small, and it describes situations like competition, not a personality.",
      },
      {
        q: "What should I say to a teen who says they can’t help it?",
        a: "Try: “Big feelings are real, and so is practice.” It calls the feeling normal while keeping the behavior in their hands. Repair afterward matters as much as what happens in the moment.",
      },
    ],
    sources: ["S20", "S08", "S14", "S19"],
    related: [
      "/myths",
      "/brain-chemicals/testosterone-in-teens",
      "/brain-parts/amygdala-for-kids",
      "/ages/brain-age-12-to-14",
      "/ages/brain-age-14-to-17",
      "/what-to-say/after-a-meltdown",
    ],
    entity: { name: "Testosterone", sameAs: "https://en.wikipedia.org/wiki/Testosterone" },
    published: "2026-10-26",
    updated: "2026-10-26",
  },

  {
    section: "myths",
    slug: "aap-one-hour-screen-time-rule",
    h1: "Does the AAP still say 1 hour of screen time?",
    metaTitle: "Does the AAP Still Say 1 Hour of Screen Time?",
    description: "Not as a fixed rule. The AAP’s January 2026 policy swapped the 2016 one-hour advice for family media plans, the 5 Cs and loose example ranges.",
    kicker: "Myths · Screen time rules",
    answer: "Not as a fixed rule. The American Academy of Pediatrics replaced its 2016 advice (about one hour a day for ages 2 to 5) with a January 2026 policy that has no fixed daily cap. It gives only hedged example ranges, such as under 1 hour for preschoolers, and puts content, sleep and what screens crowd out first.",
    kidVersion: "We’re making a family plan for screens, and everyone’s in it, grown-ups too. We’ll decide when screens are off, like at dinner and before bed, and what we’ll do instead. It’s not about the clock; it’s about making room for sleep, play and each other.",
    myth: {
      claim: "The AAP says 1 hour of screens a day for ages 2 to 5, and about 2 hours for everyone else.",
      verdict: "Mostly myth",
      truth: "That was the 2016 headline. The AAP’s 2026 policy replaced it with no fixed daily cap, a hedged example range (under 1 hour for toddlers and preschoolers, 1 to 2 hours or more of entertainment media for older kids) and more weight on content, sleep and a family media plan.",
    },
    sections: [
      {
        h2: "What did the AAP say before?",
        paras: [
          "In 2016, the AAP advised limiting children aged 2 to 5 to about one hour a day of high-quality programming, and recommended avoiding screens other than video chat for children under 18 months. A “no more than two hours” figure for older kids also circulated for years. Those numbers got repeated in doctors’ offices, school newsletters and blog posts long after the guidance moved on.",
        ],
      },
      {
        h2: "What does the 2026 policy say?",
        paras: [
          "The new statement is titled “Digital Ecosystems, Children, and Adolescents.” It was released in late January 2026 and appears in the February 2026 issue of Pediatrics. Its authors, from the AAP Council on Communications and Media, argue that the digital world can no longer be thought of as “screen time” for families to manage, and that media cannot be viewed only through screen limits.",
          "It sets no fixed daily cap and says the amount of screen time “might vary based on each family.” For caregivers who want a specific number, it says practitioners can discuss limits that fit the family’s routine, and that these might range from under 1 hour a day for toddlers and preschoolers to 1 to 2 hours a day or more of entertainment (not school-related) media for school-aged children and teens. So numbers have not vanished. They are now a hedged example, and the statement says the most important considerations are high-quality content and prioritizing healthy activities.",
        ],
      },
      {
        h2: "What are the 5 Cs?",
        paras: [
          "The AAP framework gives pediatricians five prompts for talking about media with families: Child (your child’s strengths and needs), Content (what they’re watching or playing), Calm (whether media is used to calm down), Crowding out (what screens are getting in the way of, such as sleep, play, movement and reading), and Communication (how your family talks about media).",
          "The question at the center is simple: what is digital media getting in the way of? That’s a question you can answer at your own table.",
        ],
      },
      {
        h2: "What does the AAP actually suggest doing?",
        paras: [
          "Practical habits come first. The statement advises avoiding screens an hour before bedtime and keeping devices out of the bedroom, setting phone-free zones during meals, in bedrooms, before bed and during homework, and turning off autoplay on streaming platforms. The AAP’s Family Media Plan tool helps families set these up together.",
          "So if a relative quotes “one hour,” they may be remembering the old 2016 advice, or the new example range for toddlers and preschoolers. Either way, the 2026 statement puts content, sleep and what screens crowd out ahead of the clock.",
        ],
      },
    ],
    atHome: [
      "Relatives, teachers or articles quoting “one hour for little kids, two for big kids”",
      "Guilt when screen time on a sick day or a long trip goes over “the limit”",
      "Arguments about minutes that skip the question of what the screen is replacing",
      "Autoplay and devices in the bedroom quietly eating into sleep",
    ],
    tryTonight: [
      "Pick two screen-free zones for your home, such as the dinner table and the hour before bed, and tell everyone, parents included.",
      "Turn autoplay off on the app your kid uses most.",
      "Ask: “What is screen time getting in the way of this week?” Write the answer down, and use it to decide your plan.",
    ],
    whenToTalk: "A family plan is a good conversation for any pediatrician visit. Bring it up sooner if screens are crowding out sleep, school, meals or friends for weeks, if your child is upset or withdrawn when screens go off, or if mood changes last more than about two weeks.",
    faqs: [
      {
        q: "So is there no limit at all?",
        a: "There’s no fixed AAP cap that applies to every family. The statement mentions example ranges for families who want a number, but it asks you to weigh content, sleep and what else is happening in the day. The practical limits are the screen-free times and places you choose.",
      },
      {
        q: "Is it okay to go over an hour for a little kid?",
        a: "The 2026 statement doesn’t draw a hard line at an hour. Its example range for toddlers and preschoolers is under 1 hour a day, with quality, co-viewing and what the screen replaces mattering more. A flight or a sick day isn’t a failure.",
      },
      {
        q: "Where can I find the AAP’s tool for families?",
        a: "The Family Media Plan is at HealthyChildren.org. It helps families pick screen-free zones and times, such as meals, homework and bedtime, and set priorities for the whole household.",
      },
      {
        q: "Does this apply to teens too?",
        a: "Yes. For school-aged kids and teens, the statement emphasizes sleep, activity, in-person time and content, plus the same phone-free zones. Letting a teen help write the plan is also a chance for them to practice making deals.",
      },
    ],
    sources: ["S01", "S02", "S57"],
    related: [
      "/myths",
      "/guides/aap-screen-time-guidelines-2026",
      "/habits/autoplay",
      "/habits/phone-in-bed",
      "/habits/screens-before-bed",
      "/what-to-say/screen-time-warning",
    ],
    published: "2026-10-26",
    updated: "2026-10-26",
  },
];
