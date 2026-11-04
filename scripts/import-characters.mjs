#!/usr/bin/env node
// Imports Luka's character CSV (lbc-likovi.csv, 214 rows) into content/characters.json and copies each character's
// SVG from the parent project (../characters/svg/<id>.svg) into public/crew-art/. The CSV is the only source of the
// text on the character pages: nothing is typed in by hand.
//
//   node scripts/import-characters.mjs                    content/characters.csv -> content/characters.json
//   node scripts/import-characters.mjs <other.csv>        the same from another CSV (then copy it to content/)
//   node scripts/import-characters.mjs --dry              report only
//
// The written text of a character lives next to the CSV, one file per character: content/characters/<slug>.json
// with the fields in PUBLIC_CONTENT_FIELDS and LOCKED_CONTENT_FIELDS (lib/character-rules.ts). A file's field
// replaces the CSV column of the same name; `published: true` in the file publishes the page.
//
// Column names are matched after normalising (lower case, no diacritics, spaces -> _), in English or Serbian:
// see ALIASES. Unknown columns are reported and kept out. Yes/no columns accept yes/no, da/ne, true/false, 1/0, x.
// The JSON is written only when the rules in lib/character-rules.ts pass (validate()).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { LOCKED_CONTENT_FIELDS, PUBLIC_CONTENT_FIELDS, isUnlocked, slugify, validate } = await import("../lib/character-rules.ts");

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(web, "content", "characters.json");
const DEFAULT_CSV = path.join(web, "content", "characters.csv");
const CONTENT_DIR = path.join(web, "content", "characters");
const ART_DIR = path.join(web, "public", "crew-art");
const SVG_SRC = path.resolve(web, "..", "characters", "svg");
const REGISTRY = path.resolve(web, "..", "characters", "registry.json");
const INLINE_ART = path.join(web, "content", "art.json");
const GLOSSARY_TS = path.join(web, "content", "learn", "glossary.ts");

/** CSV ids whose SVG in ../characters/svg has another spelling. */
const ART_ALIASES = { beshi: "besi", uchi: "uci" };

export const ALIASES = {
  slug: ["slug", "id", "key", "kljuc", "url"],
  name: ["name", "ime", "character", "lik", "ime_lika"],
  real: ["real", "real_name", "science_name", "science", "scientific", "scientific_name", "stands_for", "stvarno", "naucni_naziv", "sta_je", "meaning"],
  group: ["group", "grupa", "category", "kategorija", "type", "tip"],
  pack: ["pack", "package", "paket", "pack_name", "naziv_paketa"],
  access: ["access", "pristup"],
  sample: ["sample", "probni", "free_sample", "uzorak", "probni_lik"],
  inGlossary: ["in_glossary", "glossary", "recnik", "u_recniku", "rečnik"],
  published: ["published", "objavljen", "objavljeno", "ready", "gotov", "gotovo", "done", "status", "has_page_now", "has_page", "page"],
  sentence: ["sentence", "teaser", "teaser_en", "card", "card_sentence", "kartica", "recenica", "one_liner", "tagline", "line", "job"],
  shortAnswer: ["short_answer", "short", "kratak_odgovor", "answer", "odgovor", "summary"],
  whenToTalk: ["when_to_talk", "pediatrician", "when_to_talk_to_your_pediatrician", "when_to_talk_to_pediatrician", "pedijatar", "kad_pedijatru", "kada_lekaru"],
  safety: ["safety", "bezbednost", "safety_note", "safety_notes", "sigurnost"],
  explanation: ["explanation", "explain", "objasnjenje", "long", "full", "body", "full_explanation"],
  whatToSay: ["what_to_say", "say", "sta_reci", "what_to_say_to_your_kid", "words", "sta_da_kazem"],
  print: ["print", "printable", "stampa", "pdf", "print_url", "za_stampu"],
  cartoon: ["cartoon", "video", "crtani", "cartoon_url", "video_url"],
  kidVersion: ["kid_version", "kid", "say_it_to_your_kid", "za_dete", "decja_verzija"],
  sources: ["sources", "source", "izvori", "izvor", "references"],
  num: ["num", "number", "broj", "no", "row"],
  wave: ["wave", "talas", "priority", "prioritet"],
  ageFlag: ["age_flag", "age", "ages", "uzrast"],
  color: ["color", "colour", "boja"],
  art: ["art", "svg", "image", "slika", "art_id"],
};

export const normHeader = (h) =>
  h.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** RFC 4180 CSV: quoted fields may hold commas, quotes ("") and line breaks. Returns rows of strings. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = ""; rows.push(row); row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

const YES = /^(yes|y|da|true|1|x|✓|✔|ok|ready|gotov|gotovo|done|published|objavljen|objavljeno)$/i;
export const yes = (v) => YES.test((v ?? "").trim());
export function accessOf(v) {
  const s = (v ?? "").trim().toLowerCase();
  if (/^(free|slobodno|besplatno|otvoreno|open)$/.test(s)) return "free";
  if (/^(locked|zakljucano|zaključano|paid|pack|paket|club|zatvoreno)$/.test(s)) return "locked";
  return s;
}

/** Which CSV column feeds each field, by normalised header. */
export function mapHeaders(headers) {
  const norm = headers.map(normHeader);
  const map = {};
  const used = new Set();
  for (const [field, names] of Object.entries(ALIASES)) {
    const i = norm.findIndex((h, idx) => !used.has(idx) && names.includes(h));
    if (i >= 0) { map[field] = i; used.add(i); }
  }
  const unknown = headers.filter((_, i) => !used.has(i));
  return { map, unknown };
}

export function rowToCharacter(row, map) {
  const get = (f) => (map[f] === undefined ? "" : (row[map[f]] ?? "").trim());
  const name = get("name");
  const pack = get("pack");
  const c = {
    slug: slugify(get("slug") || name),
    name,
    real: get("real"),
    group: get("group") || undefined,
    pack,
    packSlug: slugify(pack),
    access: accessOf(get("access")),
    sample: yes(get("sample")),
    inGlossary: yes(get("inGlossary")),
    published: yes(get("published")),
    sentence: get("sentence"),
    shortAnswer: get("shortAnswer"),
    whenToTalk: get("whenToTalk"),
    safety: get("safety") || undefined,
    kidVersion: get("kidVersion") || undefined,
    sources: get("sources") ? get("sources").split(/\r?\n|;/).map((x) => x.trim()).filter(Boolean) : undefined,
    num: get("num") || undefined,
    wave: get("wave") || undefined,
    ageFlag: get("ageFlag") || undefined,
    color: get("color") || undefined,
    locked: {},
  };
  for (const f of ["explanation", "whatToSay", "print", "cartoon"]) {
    const v = get(f);
    if (v) c.locked[f] = v;
  }
  const art = get("art");
  if (art) c.art = art;
  for (const k of Object.keys(c)) if (c[k] === undefined) delete c[k];
  return c;
}

function registryIds() {
  if (!fs.existsSync(REGISTRY)) return new Map();
  const reg = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  const m = new Map();
  for (const ch of reg.characters ?? []) {
    m.set(ch.id, ch.id);
    m.set(slugify(ch.name), ch.id);
  }
  return m;
}

/** Inline art for the first 26 (content/art.json) or an SVG copied from ../characters/svg. Returns what was missing. */
function attachArt(chars, { write }) {
  const inline = fs.existsSync(INLINE_ART) ? new Set(Object.keys(JSON.parse(fs.readFileSync(INLINE_ART, "utf8")))) : new Set();
  const ids = registryIds();
  const missing = [];
  if (write) fs.mkdirSync(ART_DIR, { recursive: true });
  for (const c of chars) {
    const wanted = c.art ? slugify(c.art) : c.slug;
    delete c.art;
    if (inline.has(wanted)) { c.artKey = wanted; continue; }
    const id = ART_ALIASES[wanted] ?? ids.get(wanted) ?? ids.get(slugify(c.name)) ?? wanted;
    const src = path.join(SVG_SRC, `${id}.svg`);
    if (fs.existsSync(src)) {
      if (write) fs.copyFileSync(src, path.join(ART_DIR, `${c.slug}.svg`));
      c.artFile = `/crew-art/${c.slug}.svg`;
    } else missing.push(c);
  }
  return missing;
}

/** Merges content/characters/<slug>.json into a character. Returns the problems found (unknown keys, wrong types). */
export function applyContent(c, obj, where = c.slug) {
  const problems = [];
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [`${where}: the content file must hold one object`];
  for (const [k, v] of Object.entries(obj)) {
    if (k === "published") {
      if (typeof v !== "boolean") problems.push(`${where}: "published" must be true or false`);
      else c.published = v;
    } else if (k === "sources") {
      if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) problems.push(`${where}: "sources" must be a list of strings`);
      else c.sources = v.map((x) => x.trim()).filter(Boolean);
    } else if (PUBLIC_CONTENT_FIELDS.includes(k)) {
      if (typeof v !== "string") problems.push(`${where}: "${k}" must be text`);
      else if (v.trim()) c[k] = v.trim();
    } else if (LOCKED_CONTENT_FIELDS.includes(k)) {
      if (typeof v !== "string") problems.push(`${where}: "${k}" must be text`);
      else if (v.trim()) c.locked[k] = v.trim();
    } else problems.push(`${where}: unknown field "${k}"`);
  }
  return problems;
}

/** Reads every content/characters/<slug>.json. Files without a CSV row are reported. */
function readContentFiles(chars) {
  const problems = [];
  let used = 0;
  if (!fs.existsSync(CONTENT_DIR)) return { used, problems };
  const bySlug = new Map(chars.map((c) => [c.slug, c]));
  for (const name of fs.readdirSync(CONTENT_DIR).filter((n) => n.endsWith(".json")).sort()) {
    const slug = name.slice(0, -5);
    const c = bySlug.get(slug);
    const file = path.join(CONTENT_DIR, name);
    if (!c) { problems.push(`${name}: no character "${slug}" in the CSV`); continue; }
    let obj;
    try { obj = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { problems.push(`${name}: not valid JSON (${e.message})`); continue; }
    problems.push(...applyContent(c, obj, name));
    used += 1;
  }
  return { used, problems };
}

/** Names in the site glossary (content/learn/glossary.ts `char` fields), for CSVs without an in_glossary column. */
function glossaryNames() {
  if (!fs.existsSync(GLOSSARY_TS)) return new Set();
  return new Set([...fs.readFileSync(GLOSSARY_TS, "utf8").matchAll(/^\s*char:\s*"([^"]+)"/gm)].map((m) => m[1]));
}

export function report(chars, { unknown, missingArt, problems, warn = [], contentFiles = 0 }) {
  const free = chars.filter((c) => c.access === "free");
  const lines = [
    `content files: ${contentFiles} (content/characters/<slug>.json)`,
    `${chars.length} characters: ${free.length} free, ${chars.length - free.length} locked, ${chars.filter((c) => c.published).length} published, ${chars.filter((c) => c.inGlossary).length} in the glossary`,
    `samples: ${free.filter((c) => c.sample).length}`,
  ];
  lines.push(`open on the site: ${chars.filter(isUnlocked).length} (free or published), silhouettes in the Complete Crew Guide: ${chars.filter((c) => !isUnlocked(c)).length}`);
  if (unknown.length) lines.push(`columns not used: ${unknown.join(", ")}`);
  if (missingArt.length) {
    const freeMissing = missingArt.filter((c) => c.access === "free");
    lines.push(`no art for ${missingArt.length} (${freeMissing.length} of them free): ${missingArt.map((c) => c.name).join(", ")}`);
  }
  if (warn.length) lines.push("warnings:", ...warn.map((w) => `  - ${w}`));
  if (problems.length) lines.push("PROBLEMS:", ...problems.map((p) => `  - ${p}`));
  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const file = args.find((a) => !a.startsWith("--")) ?? DEFAULT_CSV;
  if (!fs.existsSync(file)) {
    console.error(`no CSV at ${file}\nusage: node scripts/import-characters.mjs [lbc-likovi.csv] [--dry]`);
    process.exit(2);
  }
  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  const [headers, ...body] = rows;
  const { map, unknown } = mapHeaders(headers);
  for (const must of ["name", "access"]) if (map[must] === undefined) {
    console.error(`the CSV has no "${must}" column (headers: ${headers.join(", ")})`);
    process.exit(2);
  }
  const chars = body.map((r) => rowToCharacter(r, map));
  if (map.inGlossary === undefined) {
    const names = glossaryNames();
    for (const c of chars) c.inGlossary = names.has(c.name);
  }
  // The 26 drawn in crew-art.js keep their site text (lib/characters.ts), so the CSV needn't carry it.
  const siteBacked = fs.existsSync(INLINE_ART) ? new Set(Object.keys(JSON.parse(fs.readFileSync(INLINE_ART, "utf8")))) : new Set();
  const content = readContentFiles(chars);
  const problems = [...content.problems, ...validate(chars, siteBacked)];
  const missingArt = attachArt(chars, { write: !dry && problems.length === 0 });
  console.log(report(chars, { unknown, missingArt, problems, contentFiles: content.used }));
  if (problems.length) {
    console.error(`\nnot written: fix the ${problems.length} problem(s) in the CSV first`);
    process.exit(1);
  }
  if (dry) return;
  fs.writeFileSync(OUT, JSON.stringify(chars, null, 2) + "\n");
  console.log(`\nwrote ${path.relative(web, OUT)} and ${chars.filter((c) => c.artFile).length} files in public/crew-art/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
