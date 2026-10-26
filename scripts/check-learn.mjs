// Checks every Learn page, the glossary and the site pages in content/learn. Exit code 1 lists every problem.
//
//   npm run check:learn
//
// Imports the TypeScript data directly (Node strips the types; imports inside content/learn use explicit .ts).
// Errors fail the run. Warnings (planned slugs with no page yet) do not.
import fs from "node:fs";
import path from "node:path";

// Node warns that the .ts files have no "type" in package.json (the app is bundled by Next, not run by Node). Silence only that.
process.removeAllListeners("warning");
const { ALL_PATHS, ENTRIES, GLOSSARY, SECTIONS, SITE_PAGES, SOURCE_BY_KEY } = await import("../content/learn/index.ts");

const web = path.resolve(import.meta.dirname, "..");
const artPath = path.join(web, "content", "art.json");
const CHAR_KEYS = fs.existsSync(artPath) ? new Set(Object.keys(JSON.parse(fs.readFileSync(artPath, "utf8")))) : null;

const errors = []; // { where, msg }
const warnings = [];
const err = (where, msg) => errors.push({ where, msg });

const words = (t) => t.replaceAll("**", "").split(/\s+/).filter(Boolean).length;
const isIso = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d) && !Number.isNaN(Date.parse(d));
const GLOSS_IDS = new Set(GLOSSARY.map((g) => g.id));
const KNOWN_PATHS = new Set(ALL_PATHS);
const resolves = (p) => KNOWN_PATHS.has(p) || (p.startsWith("/glossary#") && GLOSS_IDS.has(p.slice("/glossary#".length)));

/** Every text field of an entry as { field, text }. */
function textsOf(e) {
  const out = [];
  const add = (field, text) => { if (typeof text === "string" && text) out.push({ field, text }); };
  add("answer", e.answer);
  add("charCaption", e.charCaption);
  add("kidVersion", e.kidVersion);
  (e.sections ?? []).forEach((b, i) => {
    add(`sections[${i}].h2`, b.h2);
    (b.paras ?? []).forEach((p, j) => add(`sections[${i}].paras[${j}]`, p));
    (b.bullets ?? []).forEach((p, j) => add(`sections[${i}].bullets[${j}]`, p));
  });
  (e.atHome ?? []).forEach((t, i) => add(`atHome[${i}]`, t));
  (e.tryTonight ?? []).forEach((t, i) => add(`tryTonight[${i}]`, t));
  (e.whatToSay ?? []).forEach((p, i) => { add(`whatToSay[${i}].instead`, p.instead); add(`whatToSay[${i}].say`, p.say); add(`whatToSay[${i}].why`, p.why); });
  if (e.myth) { add("myth.claim", e.myth.claim); add("myth.truth", e.myth.truth); }
  if (e.table) {
    add("table.caption", e.table.caption);
    e.table.head.forEach((h, i) => add(`table.head[${i}]`, h));
    e.table.rows.forEach((r, i) => r.forEach((c, j) => add(`table.rows[${i}][${j}]`, c)));
  }
  add("whenToTalk", e.whenToTalk);
  (e.faqs ?? []).forEach((f, i) => { add(`faqs[${i}].q`, f.q); add(`faqs[${i}].a`, f.a); });
  return out;
}

// ---------- banned words ----------
// only: sections where the term is allowed. strip: phrases removed before testing.
const BANNED = [
  { re: /\bcure(?:d|s)?\b/i, name: "cure" },
  { re: /\btreat(?:s|ment|ing)?\b/i, name: "treat/treatment" },
  { re: /\bdiagnos\w*/i, name: "diagnos*", strip: /\b(?:is not|isn[’']t|not) a diagnosis\b/gi },
  { re: /\bdetox\w*/i, name: "detox", onlyIn: "myths" },
  { re: /\baddict\w*/i, name: "addict*", onlyIn: "myths" },
  { re: /\bstudies prove\b/i, name: "studies prove" },
  { re: /\bscience says\b/i, name: "science says" },
  { re: /\bfry\b/i, name: "fry" },
  { re: /\brewir(?:e|es|ed|ing)\b/i, name: "rewire" },
  { re: /\breset the brain\b/i, name: "reset the brain" },
  { re: /\breptile brain\b/i, name: "reptile brain" },
  { re: /\bpleasure chemical\b/i, name: "pleasure chemical", onlyIn: "myths" },
  { re: /\b20-second hug\b/i, name: "20-second hug" },
  { re: /\b\d+\s?mg\b/i, name: "mg amount" },
  { re: /\b(?:dose|doses|dosage)\b/i, name: "dose/dosage" },
  { re: /\bADHD\b/i, name: "ADHD" },
  { re: /\bhas anxiety\b/i, name: "has anxiety" },
  { re: /\bdepressed\b/i, name: "depressed" },
  { re: /\bautistic\b/i, name: "autistic" },
];

// ---------- registry ----------
const registry = new Map(); // "section/slug" -> { char, query }
for (const s of SECTIONS) for (const p of s.pages) registry.set(`${s.key}/${p.slug}`, { ...p, section: s.key });

// ---------- entries ----------
const seenKeys = new Set();
const byTitle = new Map();
const byDesc = new Map();
const sentenceOwners = new Map(); // normalized sentence -> Set(entry key)
const stats = [];

for (const e of ENTRIES) {
  const key = `${e.section}/${e.slug}`;
  const where = `/${key}`;

  if (seenKeys.has(key)) err(where, "duplicate entry (same section and slug)");
  seenKeys.add(key);

  const reg = registry.get(key);
  if (!reg) err(where, "slug is not in the registry in content/learn/sections.ts");
  else if (reg.char && e.char !== reg.char) err(where, `char is ${e.char ?? "missing"} but the registry says ${reg.char}`);
  if (e.char && CHAR_KEYS && !CHAR_KEYS.has(e.char)) err(where, `char "${e.char}" is not drawn in crew-art.js`);

  for (const f of ["h1", "kicker", "answer", "whenToTalk"]) if (!e[f]?.trim()) err(where, `${f} is empty`);
  if (!isIso(e.published)) err(where, `published is not an ISO date: ${e.published}`);
  if (!isIso(e.updated)) err(where, `updated is not an ISO date: ${e.updated}`);

  // titles and descriptions
  if ((e.metaTitle ?? "").length > 60) err(where, `metaTitle is ${e.metaTitle.length} characters (max 60)`);
  if (!e.metaTitle) err(where, "metaTitle is empty");
  const dl = (e.description ?? "").length;
  if (dl < 110 || dl > 160) err(where, `description is ${dl} characters (110-160)`);
  const t = (e.metaTitle ?? "").trim().toLowerCase();
  const d = (e.description ?? "").trim().toLowerCase();
  if (byTitle.has(t)) err(where, `metaTitle duplicates /${byTitle.get(t)}`); else byTitle.set(t, key);
  if (byDesc.has(d)) err(where, `description duplicates /${byDesc.get(d)}`); else byDesc.set(d, key);

  // answer
  const aw = words(e.answer ?? "");
  if (aw < 38 || aw > 62) err(where, `answer is ${aw} words (38-62)`);

  // length
  const texts = textsOf(e);
  const total = texts.reduce((n, x) => n + words(x.text), 0);
  if (total < 700) err(where, `${total} words in total (min 700)`);
  stats.push({ section: e.section, key, total });

  // sources
  if ((e.sources ?? []).length < 2) err(where, `${(e.sources ?? []).length} sources (min 2)`);
  for (const k of e.sources ?? []) if (!SOURCE_BY_KEY[k]) err(where, `unknown source key ${k}`);
  if (new Set(e.sources).size !== (e.sources ?? []).length) err(where, "a source is listed twice");

  // related
  if ((e.related ?? []).length < 3) err(where, `${(e.related ?? []).length} related links (min 3)`);
  for (const p of e.related ?? []) {
    if (!resolves(p)) err(where, `related "${p}" is not in ALL_PATHS or a glossary anchor`);
    if (p === where) err(where, "related links to the page itself");
  }

  // faqs, steps, say-this, myth
  const fq = (e.faqs ?? []).length;
  if (fq < 3 || fq > 5) err(where, `${fq} FAQs (3-5)`);
  for (const [i, f] of (e.faqs ?? []).entries()) if (!f.q?.trim() || !f.a?.trim()) err(where, `faqs[${i}] has an empty question or answer`);
  if (e.tryTonight && e.tryTonight.length !== 3) err(where, `tryTonight has ${e.tryTonight.length} items (exactly 3)`);
  if (e.section === "what-to-say" && (e.whatToSay ?? []).length < 4) err(where, `${(e.whatToSay ?? []).length} whatToSay pairs (min 4)`);
  if (e.section === "myths" && !e.myth) err(where, "myth page without a myth block");
  if (e.myth && !["Myth", "Mostly myth", "Half true"].includes(e.myth.verdict)) err(where, `bad myth verdict "${e.myth.verdict}"`);
  if (!(e.sections ?? []).length) err(where, "no sections");
  for (const [i, b] of (e.sections ?? []).entries()) if (!b.h2?.trim() || !(b.paras ?? []).length) err(where, `sections[${i}] needs an h2 and at least one paragraph`);
  const knownKeys = new Set([
    "section", "slug", "h1", "metaTitle", "description", "kicker", "answer", "char", "charCaption", "kidVersion", "sections", "atHome",
    "tryTonight", "whatToSay", "myth", "table", "whenToTalk", "faqs", "sources", "related", "entity", "teenOnly", "published", "updated",
  ]);
  for (const k of Object.keys(e)) if (!knownKeys.has(k)) err(where, `unknown field "${k}" (not in LearnEntry)`);
  if (e.table) {
    const w = e.table.head.length;
    e.table.rows.forEach((r, i) => { if (r.length !== w) err(where, `table row ${i} has ${r.length} cells, header has ${w}`); });
  }

  // banned words
  for (const { field, text } of [...texts, { field: "h1", text: e.h1 ?? "" }, { field: "metaTitle", text: e.metaTitle ?? "" }, { field: "description", text: e.description ?? "" }]) {
    for (const b of BANNED) {
      if (b.onlyIn && e.section === b.onlyIn) continue;
      const hay = b.strip ? text.replace(b.strip, " ") : text;
      const m = hay.match(b.re);
      if (m) err(where, `banned "${b.name}" in ${field}: "…${hay.slice(Math.max(0, m.index - 25), m.index + m[0].length + 25).replace(/\s+/g, " ")}…"`);
    }
  }

  // repeated long sentences (scaled-content guard)
  for (const { text } of texts) {
    for (const s of text.replaceAll("**", "").split(/(?<=[.!?])\s+/)) {
      const norm = s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
      // The crisis-line wording is meant to be identical everywhere it appears.
      if (norm.split(" ").length < 12 || /\b988\b/.test(norm)) continue;
      if (!sentenceOwners.has(norm)) sentenceOwners.set(norm, new Set());
      sentenceOwners.get(norm).add(key);
    }
  }
}
for (const [s, owners] of sentenceOwners) {
  if (owners.size > 1) err([...owners].map((k) => `/${k}`).join(" + "), `same sentence on ${owners.size} pages: "${s.slice(0, 110)}${s.length > 110 ? "…" : ""}"`);
}

// ---------- glossary ----------
const seenIds = new Set();
for (const g of GLOSSARY) {
  const where = `glossary:${g.id}`;
  if (!g.id || !/^[a-z0-9-]+$/.test(g.id)) err(where, `id "${g.id}" must be lowercase letters, digits and dashes`);
  if (seenIds.has(g.id)) err(where, "duplicate id");
  seenIds.add(g.id);
  if (!g.term?.trim()) err(where, "term is empty");
  const dw = words(g.definition ?? "");
  if (!dw) err(where, "definition is empty"); else if (dw > 35) err(where, `definition is ${dw} words (max 35)`);
  if (g.kid && words(g.kid) > 20) err(where, `kid line is ${words(g.kid)} words (max 20)`);
  if (g.link && !resolves(g.link)) err(where, `link "${g.link}" is not in ALL_PATHS`);
  for (const b of BANNED) {
    if (b.onlyIn) continue;
    const text = `${g.term} ${g.definition} ${g.kid ?? ""}`;
    const hay = b.strip ? text.replace(b.strip, " ") : text;
    if (b.re.test(hay)) err(where, `banned "${b.name}"`);
  }
}

// ---------- site pages ----------
const SITE_SLUGS = ["about", "editorial-policy", "privacy", "terms"];
const seenSlugs = new Set();
for (const p of SITE_PAGES) {
  const where = `site-page:${p.slug}`;
  if (!SITE_SLUGS.includes(p.slug)) err(where, `unknown slug (expected one of ${SITE_SLUGS.join(", ")})`);
  if (seenSlugs.has(p.slug)) err(where, "duplicate slug");
  seenSlugs.add(p.slug);
  for (const f of ["h1", "metaTitle", "description", "dek"]) if (!p[f]?.trim()) err(where, `${f} is empty`);
  if ((p.metaTitle ?? "").length > 60) err(where, `metaTitle is ${p.metaTitle.length} characters (max 60)`);
  const dl = (p.description ?? "").length;
  if (dl < 110 || dl > 160) err(where, `description is ${dl} characters (110-160)`);
  if (!isIso(p.updated)) err(where, `updated is not an ISO date: ${p.updated}`);
  if (!(p.sections ?? []).length) err(where, "no sections");
  for (const [i, b] of (p.sections ?? []).entries()) if (!b.h2?.trim() || !(b.paras ?? []).length) err(where, `sections[${i}] needs an h2 and at least one paragraph`);
}
for (const s of SITE_SLUGS) if (!seenSlugs.has(s)) warnings.push(`site page /${s} is not written yet`);

// ---------- planned but unwritten ----------
for (const s of SECTIONS) {
  const missing = s.pages.filter((p) => !seenKeys.has(`${s.key}/${p.slug}`)).map((p) => p.slug);
  if (missing.length) warnings.push(`/${s.key}: ${missing.length} planned page(s) not written: ${missing.join(", ")}`);
}
if (GLOSSARY.length === 0) warnings.push("glossary is empty");

// ---------- report ----------
console.log("\nLearn content summary");
console.log("section".padEnd(18) + "pages".padStart(7) + "planned".padStart(9) + "min words".padStart(11) + "avg words".padStart(11));
for (const s of SECTIONS) {
  const rows = stats.filter((x) => x.section === s.key);
  const min = rows.length ? Math.min(...rows.map((r) => r.total)) : 0;
  const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.total, 0) / rows.length) : 0;
  console.log(s.key.padEnd(18) + String(rows.length).padStart(7) + String(s.pages.length).padStart(9) + String(min || "-").padStart(11) + String(avg || "-").padStart(11));
}
console.log(`${"total".padEnd(18)}${String(ENTRIES.length).padStart(7)}${String(SECTIONS.reduce((n, s) => n + s.pages.length, 0)).padStart(9)}`);
console.log(`glossary terms: ${GLOSSARY.length} · site pages: ${SITE_PAGES.length}/${SITE_SLUGS.length} · sources: ${Object.keys(SOURCE_BY_KEY).length}`);
console.log("\nWords per page");
for (const r of stats) console.log(`  ${String(r.total).padStart(5)}  /${r.key}`);

if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length})`);
  for (const w of warnings) console.log(`  - ${w}`);
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length})`);
  const byWhere = new Map();
  for (const { where, msg } of errors) byWhere.set(where, [...(byWhere.get(where) ?? []), msg]);
  for (const [where, msgs] of byWhere) {
    console.log(`  ${where}`);
    for (const m of msgs) console.log(`    - ${m}`);
  }
  console.log(`\ncheck:learn FAILED with ${errors.length} problem(s)`);
  process.exit(1);
}
console.log("\ncheck:learn OK");
