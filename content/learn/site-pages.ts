import type { SitePage } from "./types.ts";

// /about, /editorial-policy, /privacy, /terms
// Authorship is brand-only: "Little Brain Crew editorial team". No named people, no invented credentials.
// Pages marked draft wait for the owner's OK (company details, contact email, legal review).
export const SITE_PAGES: SitePage[] = [
  {
    slug: "about",
    h1: "About Little Brain Crew",
    metaTitle: "About Little Brain Crew",
    description: "Little Brain Crew turns the science of kids’ brains into a cartoon crew for parents of kids 4 to 17. What we make, why characters, and what we are not.",
    dek: "Short cartoon explainers that turn the science of everyday kid behavior into something you can see, remember and use tonight.",
    draft: true,
    updated: "2026-10-26",
    sections: [
      {
        h2: "What is Little Brain Crew?",
        paras: [
          "Little Brain Crew makes short cartoon explainers and plain-language guides for parents of kids aged 4 to 17 in the United States. Meltdowns, bad sleep, “I’m bored,” the 5 p.m. hangry explosion, a teen who stopped talking: it can look like a dozen different problems. Often it is the same few brain messengers, hormones and brain parts, plus a handful of habits getting in their way.",
          "We turn that science into a cartoon crew, so you can see what is going on and know what to try tonight. Habits only: sleep, daylight, food, movement, play, closeness and smarter screen time.",
        ],
      },
      {
        h2: "Why characters?",
        paras: [
          "A paragraph about the amygdala is easy to forget. Migo, the smoke detector that yells “danger!” before the thinking part of the brain can speak, is not. Characters give you and your kid a shared language for hard moments, and a shared language makes it easier to stay calm and kind.",
          "Every character is a **metaphor** for what a body does. Dopa, Sero, Corti and the rest are never a measurement of your kid, and we never say your child has “low” or “high” levels of anything. They are a picture of how the body works, not a test result.",
        ],
        bullets: [
          "Messengers and hormones, like Dopa (dopamine), Sero (serotonin), Corti (cortisol) and Mela (melatonin).",
          "Brain parts, like Migo (the amygdala) and Fronti (the prefrontal cortex).",
          "Habits that get in the way, like Bedi (phone in bed), Lupi (autoplay) and Kafi (caffeine). Our villains are always a habit or a thing, never a person, a food or a body.",
          "Age stages, from Whyzi (3 to 6) to Seki (14 to 17).",
        ],
      },
      {
        h2: "What we are not",
        paras: [
          "We are not a medical service, and this is not medical care. We don’t diagnose, and we don’t promise results. We don’t sell, recommend or explain supplements, medicine or dosing. If something about your child’s health, sleep, mood or behavior worries you, call your pediatrician first.",
          "We are also not a rulebook. Every kid has their own pace, and ranges and ages on our pages overlap on purpose.",
        ],
      },
      {
        h2: "How we make our pages",
        paras: [
          "Our team writes each page and checks it against the sources listed at its bottom. We use pediatric and public-health guidelines and published research, and we keep every claim no bigger than the study behind it. Our editorial policy explains the rules in detail, and our sources page lists every source we use.",
        ],
      },
      {
        h2: "How to reach us",
        paras: [
          "Questions, corrections or ideas for the next crew member? Our contact email and company details will be published here before launch.",
        ],
      },
    ],
  },
  {
    slug: "editorial-policy",
    h1: "Editorial policy: how we write and check our pages",
    metaTitle: "Editorial Policy | Little Brain Crew",
    description: "How Little Brain Crew pages are written and sourced: vetted sources, primary sources first, characters as metaphors, banned claims and corrections.",
    dek: "The rules behind every page, so you can see what we claim, where it comes from and what we will never say.",
    updated: "2026-10-26",
    sections: [
      {
        h2: "Who writes these pages?",
        paras: [
          "Pages are published by the Little Brain Crew editorial team. We don’t put individual names on pages, and we don’t claim credentials we don’t have. Every page is written and checked by the Little Brain Crew team against the sources listed on that page.",
          "To be plain about it: our pages are not reviewed by a physician or other medical professional, and we do not present them as medical advice. They are learning material for parents. For anything about your own child’s health, your pediatrician is the right first call.",
        ],
      },
      {
        h2: "Where does the information come from?",
        paras: [
          "We use only vetted sources: pediatric and public-health organizations such as the American Academy of Pediatrics, the American Academy of Sleep Medicine, the CDC, the WHO and NICHD; university research centers; and peer-reviewed studies. Primary sources come first. When a page says what a policy or a study says, we open the policy or the paper itself, not just a news summary of it.",
          "Each page lists its sources at the bottom, and the sources page lists everything we use. Before a study, a quote or a number goes on a page, we open the source and check that it says what we say it does. We never invent studies, experts, testimonials or “a mom told us” stories. When we describe a scene, such as “picture 5:40 p.m., the tablet goes dark,” it is labeled as a made-up example.",
        ],
      },
      {
        h2: "How careful are the claims?",
        paras: [
          "We keep every claim no bigger than the evidence behind it. That is why you will see phrases like “is linked to,” “may help” and “in one study of 2,048 children,” with the size and type of the study named when we cite one. Most research on kids and screens or sleep is observational. It shows patterns, not proof that one thing caused another, and we say so.",
          "When guidance changes, we change the page. In 2026, for example, the American Academy of Pediatrics replaced its older screen-time guidance, so we don’t present the old one-hour and two-hour limits as current policy.",
        ],
      },
      {
        h2: "Why characters, and what they mean",
        paras: [
          "Our characters are metaphors for what a body or brain part does. They help you picture and remember how things work. They are never a measurement of your child. We don’t say a kid acted out because of “low serotonin,” and we don’t guess at your child’s hormone levels.",
        ],
      },
      {
        h2: "What we will never publish",
        paras: ["Some things are off-limits on every page:"],
        bullets: [
          "Diagnoses, or condition labels for a child. Behavior is explained, never diagnosed.",
          "Medical claims of any kind, and promises about results.",
          "Supplements, medicine, melatonin dosing or cleanse-style plans. Our advice is about habits only.",
          "Fear-based or shame-based claims, such as “you are damaging your child’s brain.”",
          "Fake reviews or testimonials.",
          "Villains that are people, foods or bodies. Our villains are habits and things, like autoplay or a phone in bed.",
        ],
      },
      {
        h2: "How often do we update?",
        paras: [
          "Every page shows the date it was last updated. We update a page when a major source changes or we find a mistake, and we plan to review every page at least once a year, even when nothing has changed.",
        ],
      },
      {
        h2: "How do we handle mistakes?",
        paras: [
          "If you find an error, an out-of-date claim or a source that doesn’t say what we say it does, tell us using the contact details on our About page. We check it against the source, fix the page and update the date.",
        ],
      },
      {
        h2: "Do you sell anything?",
        paras: [
          "Yes. We sell digital products for parents, like the Kid Brain Toolkit and the 30-Day Reset, and a membership called the Crew Club. That is a commercial interest and we want you to know it. Our learning pages are free to read, carry no ads, and don’t recommend third-party products.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    h1: "Privacy policy",
    metaTitle: "Privacy Policy | Little Brain Crew",
    description: "What Little Brain Crew collects, what stays in your browser, how forms and payments work, and why we never ask for kids’ names. Draft.",
    dek: "Plain words about what this site collects and what it doesn’t. This is a draft and will be updated before launch.",
    draft: true,
    updated: "2026-10-26",
    sections: [
      {
        h2: "The short version",
        paras: [
          "Little Brain Crew is for parents and other adults. We don’t collect children’s names, photos or other personal details. We use no advertising trackers and no analytics tools on this site today. We collect an email address and a few details only when you fill in a form or buy something, and we use them for the reason you gave us.",
          "Parts of this page describe features that are not switched on yet. We mark those as planned, and we will update this page when they go live.",
        ],
      },
      {
        h2: "What we collect when you fill in a form",
        paras: [
          "Several pages have forms: free tips and challenges, the sticker pack, the founding-parents program, “what’s coming next” and shop waitlists, school and business inquiries, and gift cards. Depending on the form, we ask for:",
        ],
        bullets: [
          "Your email address.",
          "For school and business inquiries, your name, your organization, the type and size of your group, and a message.",
          "For the founding-parents form, an age range for your child (such as 4 to 7), and whether you would be open to recording a short video. We don’t ask for children’s names, birthdays, photos or schools.",
          "For the “coming next” form, which topics and language you want.",
          "For gifts, your name, the recipient’s name and email, a short message and the date to send it.",
        ],
      },
      {
        h2: "How form entries reach us",
        paras: [
          "Form entries are meant to be delivered to us by email through Web3Forms, a third-party form service. Along with what you type, the service receives the name of the form and the page you were on. This connection is planned and is not switched on yet, so forms do not send anything today.",
          "We use your information to answer you, send what you asked for, and, if you signed up for updates, send occasional emails. Every marketing email will have an unsubscribe link (planned).",
        ],
      },
      {
        h2: "What stays in your browser",
        paras: [
          "Some things are saved only in your own browser and are not sent to us:",
        ],
        bullets: [
          "A setting that remembers whether you chose the “mom” or “dad” view of the home page (local storage, key “vlc-who”). It stays until you clear your browser data.",
          "The details of a gift card you are designing, held until you finish checkout (session storage, key “vlc-gift”). It disappears when you close the tab.",
          "Your order while you move through checkout, including your email and the items you picked (session storage, key “vlc-order”). It disappears when you close the tab.",
        ],
      },
      {
        h2: "Crew Club accounts (planned)",
        paras: [
          "Crew Club members will get an account. This is not switched on yet. When it is, checking out creates an account with your email address. The account may also hold a display name you choose, the age groups of your children (such as 3 to 6 or 10 to 12, never names or birthdays), your plan and its payment status, and, if you cancel, the reason you pick, so we can learn what to improve.",
          "Accounts will be stored with Supabase, the database and sign-in service we use. Signing in sets a cookie that keeps you signed in. That cookie is needed for the account to work, and it is not used for advertising.",
        ],
      },
      {
        h2: "Payments",
        paras: [
          "Payments are in preview today: the buttons walk through the checkout steps, and nothing is charged. Card and PayPal payments will be handled by Stripe and PayPal (planned). We won’t see or store your card number. We will receive your email, what you bought and the payment status, so we can send your files and manage memberships.",
          "If we later add other tools, such as an email service to deliver your purchase, we will name them here.",
        ],
      },
      {
        h2: "Ask the Crew",
        paras: [
          "The Ask the Crew helper currently runs in your browser on simple rules. What you type is not sent to our servers today. If we connect it to an AI service later, we will say so here and on the page before it starts, and we will tell you what is sent.",
        ],
      },
      {
        h2: "Cookies, ads and tracking",
        paras: [
          "We don’t use advertising cookies, tracking pixels or analytics tools today. The only cookie we plan is the sign-in cookie for Crew Club accounts, described above. Like any website, our hosting provider may keep standard server logs, such as IP address and pages requested, to keep the site running and secure. If we add analytics later, we will describe them here first.",
          "We don’t sell your personal information.",
        ],
      },
      {
        h2: "Children",
        paras: [
          "This site is for adults. It is not directed to children under 13, and we don’t knowingly collect personal information from them. If you think a child has sent us personal information, contact us and we will delete it.",
        ],
      },
      {
        h2: "Your choices",
        paras: [
          "You can ask us what we have about you, ask us to correct or delete it, or unsubscribe at any time. Depending on where you live, for example California, you may have additional rights under state privacy laws. We keep email signups until you unsubscribe or ask us to delete them, and purchase records for as long as we need them for taxes and support.",
        ],
      },
      {
        h2: "Contact and changes",
        paras: [
          "Our company name, address and contact email will be published here before launch. When we change this policy we will update the date at the top of the page and, for big changes, tell subscribers by email.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    h1: "Terms of use and sale",
    metaTitle: "Terms of Use and Sale | Little Brain Crew",
    description: "The rules for using Little Brain Crew and buying our digital products: educational use only, all sales final, Crew Club membership and US audience.",
    dek: "What you can expect from us and what we ask of you. This is a draft and will be reviewed before launch.",
    draft: true,
    updated: "2026-10-26",
    sections: [
      {
        h2: "Using this site",
        paras: [
          "By using Little Brain Crew you agree to these terms. Little Brain Crew is intended for adults in the United States, and our prices are in US dollars. You must be 18 or older to buy anything.",
        ],
      },
      {
        h2: "Educational only, not medical advice",
        paras: [
          "Everything we publish or sell is for learning. It is not medical advice, and we don’t diagnose or provide medical care for any condition. Our characters are metaphors, not measurements. If something worries you about your child, talk to your pediatrician. In an emergency, call 911.",
          "We make no promise that any habit, tip or program will change your child’s behavior, sleep, mood or focus. Every child is different, and results vary.",
        ],
      },
      {
        h2: "Digital products",
        paras: [
          "We sell digital products, such as the Kid Brain Toolkit and the 30-Day Reset, and may sell more over time. You get a link or files by email after you pay. A purchase gives you a personal, non-transferable license to use the content with your own family. Please don’t resell, share, copy or post it. Classroom, school and business use needs a separate license.",
          "Prices and what is included are shown at checkout. Gifts are delivered by email to the recipient on the date you choose.",
        ],
      },
      {
        h2: "All sales are final",
        paras: [
          "Because you get instant access to digital content, all sales are final. We do not offer refunds, money-back terms or guarantees of any kind, including any guarantee of results. If a link or a file doesn’t work, contact us and we will fix it or resend it.",
          "A one-time “support” payment to Little Brain Crew is a payment to a company. It is not a charitable donation and is not tax-deductible.",
        ],
      },
      {
        h2: "Crew Club membership",
        paras: [
          "The Crew Club is a membership that renews on a monthly or yearly basis, at the price shown at checkout, until you cancel. A short trial, if offered, converts to the regular price when it ends. We will email you before a trial ends and before every yearly renewal.",
          "You can pause or cancel any time in your account, in two clicks. Cancelling stops future charges. Charges already made are not refunded, in line with our final-sales policy.",
        ],
      },
      {
        h2: "How payments work",
        paras: [
          "Payments are in preview today and nothing is charged. When they go live, card and PayPal payments will be handled by Stripe and PayPal (planned). By paying, you also agree to the terms of the payment provider you use.",
        ],
      },
      {
        h2: "Our content and your use of it",
        paras: [
          "The characters, cartoons, text, guides and artwork are owned by Little Brain Crew. You may read our pages, share a link to them and quote short passages with credit. You may not copy whole pages, scrape the site, or use our characters for another product without written permission.",
        ],
      },
      {
        h2: "Limits and changes",
        paras: [
          "We try hard to keep our pages accurate and up to date, and we name our sources. We provide the site and our products “as is.” To the extent the law allows, we are not liable for indirect or consequential losses from using them. Nothing in these terms limits any rights you have that cannot be limited by law.",
          "We may update these terms and will change the date on this page. Which state’s law applies, our company name and address, and our contact email will be published here before launch.",
        ],
      },
    ],
  },
];
