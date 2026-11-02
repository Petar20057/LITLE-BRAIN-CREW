import { SECTIONS, SITE_PAGES, pathOf } from "@/content/learn";
import { SITE_URL } from "@/lib/design";
import { entriesOf, plain } from "@/lib/learn";

// llms.txt: a plain-text map of the site for AI assistants. Built from content/learn, so it is always current.
export function GET() {
  const lines: string[] = [
    "# Little Brain Crew",
    "",
    "> Short cartoon explainers for parents of kids 3–17. Brain chemicals, brain parts and everyday habits are characters, so a hard moment (screen time ends in tears, bedtime drags on, a meltdown after school) makes sense and comes with one thing to try tonight. Educational content only, built on everyday habits: not medical advice, and we never sell supplements, hormones or medicine.",
    "",
    `Pages cite vetted sources (${SITE_URL}/sources) and follow ${SITE_URL}/editorial-policy. Characters are metaphors, never measured levels in a child.`,
    "",
  ];
  for (const s of SECTIONS) {
    const entries = entriesOf(s.key);
    if (!entries.length) continue;
    lines.push(`## ${s.h1}`, "", `- [Hub: ${s.metaTitle}](${SITE_URL}/${s.key}): ${s.intro}`);
    for (const e of entries) lines.push(`- [${plain(e.h1)}](${SITE_URL}${pathOf(e)}): ${plain(e.description)}`);
    lines.push("");
  }
  lines.push(
    "## About",
    "",
    `- [Meet the crew](${SITE_URL}/crew): all 26 characters and what each one stands for.`,
    `- [All guides](${SITE_URL}/learn): every hub in one place.`,
    `- [Glossary](${SITE_URL}/glossary): the brain words we use, in plain English.`,
    `- [Sources](${SITE_URL}/sources): every source our pages cite.`,
  );
  for (const p of SITE_PAGES) lines.push(`- [${plain(p.h1)}](${SITE_URL}/${p.slug}): ${plain(p.description)}`);
  lines.push("");
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
