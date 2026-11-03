# Writing a character page — brief for writers

One file per character: `web/content/characters/<slug>.json`. The import (`node scripts/import-characters.mjs`) merges it
with the row in `content/characters.csv`; the site renders it at `/crew/<slug>`. Write in English, for US parents of
kids 4–17 (the Puberty pack is for parents of kids 10+). Readable, warm, concrete. One idea per sentence.

## The file

```json
{
  "shortAnswer": "40–60 words. Answers “what is X and what does it do in my kid?” in plain words, names the character once as the metaphor. Public.",
  "kidVersion": "2–3 sentences a parent can say out loud to a 10–13 year old, first person, no lecture. Public.",
  "whenToTalk": "1–3 sentences: the concrete signs that belong with a pediatrician (ages, durations). Public, always.",
  "safety": "Optional, 1–3 sentences: anything about safety (products, privacy, supplements, red flags). Public.",
  "explanation": "500–800 words for the parent. Paragraphs separated by one blank line. A paragraph that starts with `## ` is a sub-heading (use 3–5). **bold** allowed, nothing else. Locked.",
  "whatToSay": "4–6 pairs, one per paragraph, exactly this shape: Instead of: “…” | Say: “…” | Why: … . Locked.",
  "sources": ["S08", "Author/Org, year. Title. https://exact.url/you-opened"],
  "published": false
}
```

Leave `print` and `cartoon` out (they are made later). Keep `published: false`; the reviewer flips it.

## Voice (copy the site, not a textbook)

Read first, in this order:
1. `content/learn/brain-chemicals.ts`, the entry with `char: "teo"` (testosterone): answer-first, metaphor named once,
   what’s normal, the myth, what helps, when to talk. That is the register.
2. `content/learn/ages.ts`, the entries `brain-age-10-to-12` and `brain-age-12-to-14` (what we already say about puberty).
3. `content/learn/sources.ts`: cite these keys when they fit (S08 = NICHD puberty + NHS early/delayed puberty).
4. The knowledge base, sections 1.3 (brand rules), 2.6 (Teo), 4.15 (teens and puberty), 5.8 (puberty timing) and 7
   (when to get help): `/private/tmp/claude-501/-Users-luka-Desktop-vibe-life-code/930855b4-dd9d-4a11-a0f9-b14f82c336d4/scratchpad/baza-znanja.txt`.

Rules that never bend:
- Every character is a **metaphor for what a body does, never a measurement of a child**. Never read a hormone level
  from behavior (“her estrogen must be high” is banned). Say “Estra stands for…”, “in the crew, …”.
- No diagnoses, no treatment, no supplements, no promises, no “studies prove”. Say “is linked with”, “in one study of N…”.
- Numbers only with a source you opened. Checked 2026-11-03: puberty typically starts 8–13 in girls and 9–14 in boys,
  and signs before 8 in girls or 9 in boys are “early” (NICHD); the NHS gives one range for everyone, 8–14, calls it
  early before 8 and delayed if nothing has started by 15; the AAP says to contact the pediatrician if a girl has no
  changes by 13 or a boy none by 14; the first period comes about 2–3 years after breast budding, at about 12 on average
  (HHS Office on Women’s Health), and cycles are often irregular for the first 2–3 years (AAP). **House rule for every
  “when to talk” line:** before 8 in girls or 9 in boys, or none by 13 in girls or 14 in boys (the NHS draws its line
  at 15 for everyone). Precocious puberty is uncommon, “about 1% or less of the U.S. population”, many more girls than
  boys (NICHD fact sheet). Verify each number on the NICHD,
  NHS, AAP (HealthyChildren.org), MedlinePlus or HHS page before you use it, and cite that page.
- Puberty talk is “a hundred small talks, not one big one”; side by side beats sit-down. Timing differs for everyone;
  nobody’s is a race. No shame about bodies, periods, odor, acne or growth. Boys and girls both get the real words.
- Inclusive and plain: “most girls”, “most boys”, “bodies”. Real anatomy words are fine (ovaries, testes, uterus,
  period); nothing graphic, nothing about sex education beyond the body’s own changes.
- Teo exists already (testosterone, teens). Estra is the counterpart for estrogen. Don’t rewrite Teo; link to him.
- Testosterone is only weakly linked to aggression; estrogen and progesterone do not “make girls moody”. Sleep, stress,
  friends and a brain under construction explain more. Say so.
- Villains are habits or things, never people, foods or bodies. The Puberty pack has no villains.

## The seven characters (from the CSV; keep these names and one-line teasers)

| slug | name | stands for | teaser (public card line) |
|---|---|---|---|
| estra | Estra | Estrogen | Leads puberty changes, mostly in girls. |
| progi | Progi | Progesterone | Estra’s partner in the monthly cycle. |
| pepi | Pepi | Kisspeptin | Flips the puberty switch in the brain. |
| rela | Rela | GnRH | Sends the start signal for puberty. |
| elfi | Elfi | LH and FSH | Carries puberty messages from brain to body. |
| gona | Gona | Gonads (ovaries and testes) | Make puberty hormones. |
| ciklo | Ciklo | Menstrual cycle | The monthly rhythm that starts in puberty. |

The chain, in crew language: Pepi (kisspeptin) flips the switch in the hypothalamus → Rela (GnRH) sends the start
signal in pulses → Elfi (LH and FSH, from the pituitary) carries it through the blood → Gona (ovaries, testes) makes
Estra, Progi and Teo → the body changes. Ciklo is the rhythm Estra and Progi keep once periods start. Each page
explains its own link in that chain and names its neighbours once, so a reader can follow the whole story.

Each explanation should cover, in the site’s question style (sub-headings as questions parents ask):
what it is in plain words · what it does in puberty (girls and boys where relevant) · what’s normal and when
(ages, order of changes) · the myth or worry parents bring · what helps at home (habits only: sleep, daylight, food
without diets, movement, talks) · a line that hands the next question to the pediatrician.
