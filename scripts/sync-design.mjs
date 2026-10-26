// Turns the static design in design/ into what the Next.js app serves.
//
//   npm run sync            (same as: node scripts/sync-design.mjs design)
//
// - copies design/assets, stickers, og.jpg and favicon.svg into public/
// - every design/<name>.html becomes the route /<name> (index.html is /):
//   content/pages/<name>.json holds its metadata, robots, JSON-LD, body attributes, scripts and body HTML
// - <!-- include:partials/x.html --> pulls in a shared piece (header, footer) before anything else
// - content/pages/manifest.ts lists all pages for the app
// - content/partials/header.json and footer.json ({ html }): the same header and footer, link-rewritten, for the
//   React templates (components/learn/LearnShell.tsx). Learn routes are not in design/, so partials link to them
//   with absolute paths (/crew, /why, ...).
// - content/art.json: the crew drawn on the server, { [key]: { main, happy, tired } }. Each value is the INNER
//   SVG markup (everything inside <svg viewBox="0 0 120 120">), so components can wrap it with their own
//   <svg role="img"><title>. Empty <div data-char="k" data-mood="m"></div> in the design pages are filled with
//   the full <svg> at sync time so crawlers see the art (site.js re-fills them in the browser, harmless).
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const web = path.resolve(import.meta.dirname, "..");
const src = path.resolve(web, process.argv[2] || "design");

for (const item of ["assets", "stickers", "og.jpg", "favicon.svg"]) {
  const from = path.join(src, item);
  if (!fs.existsSync(from)) throw new Error(`missing ${from}`);
  const to = path.join(web, "public", item);
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
}

const names = fs.readdirSync(src).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5)).sort();
const routeOf = (name) => (name === "index" ? "/" : `/${name}`);

const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const meta = (raw, key, value) => {
  const tag = raw.match(new RegExp(`<meta[^>]*${key}="${value}"[^>]*>`))?.[0];
  return tag ? attr(tag, "content") : undefined;
};
const include = (html) =>
  html.replace(/<!--\s*include:([\w/.-]+)\s*-->/g, (_, file) => fs.readFileSync(path.join(src, file), "utf8"));

// ---------- crew art, rendered on the server ----------
const win = {};
vm.runInNewContext(fs.readFileSync(path.join(src, "assets", "crew-art.js"), "utf8"), { window: win }, { filename: "crew-art.js" });
if (typeof win.svg !== "function" || !win.CREW_ART) throw new Error("crew-art.js did not define window.svg / window.CREW_ART");
const MOODS = ["main", "happy", "tired"];
const SVG_WRAP = /^<svg [^>]*>([\s\S]*)<\/svg>$/;
const art = {};
for (const key of Object.keys(win.CREW_ART).sort()) {
  art[key] = {};
  for (const mood of MOODS) {
    const inner = win.svg(key, mood).match(SVG_WRAP)?.[1];
    if (!inner) throw new Error(`crew-art.js: unexpected svg() output for ${key}/${mood}`);
    art[key][mood] = inner;
  }
}
fs.mkdirSync(path.join(web, "content"), { recursive: true });
fs.writeFileSync(path.join(web, "content", "art.json"), JSON.stringify(art) + "\n");
console.log(`art        ${Object.keys(art).length} characters x ${MOODS.length} moods -> content/art.json`);

// Fill empty <div ... data-char="k" data-mood="m"></div> with the drawn svg.
const fillArt = (html) =>
  html.replace(/(<div\b[^>]*\bdata-char="([\w-]+)"[^>]*>)(<\/div>)/g, (m, open, key, close) => {
    if (!win.CREW_ART[key]) throw new Error(`data-char="${key}" is not a character in crew-art.js`);
    const mood = open.match(/\bdata-mood="(\w+)"/)?.[1] ?? "main";
    return `${open}${win.svg(key, mood)}${close}`;
  });

// Same link rewriting for pages and partials.
const rewrite = (html) =>
  html
    .replace(/href="([\w-]+)\.html(#[^"]*)?"/g, (m, page, hash = "") => (names.includes(page) ? `href="${routeOf(page)}${hash}"` : m))
    .replace(/href="\.\/(#[^"]*)?"/g, (_, hash = "") => `href="/${hash}"`)
    .replace(/(src|href)="(stickers|assets)\//g, '$1="/$2/');

// Strip what Next renders itself (JSON-LD, title, meta, link, comments) and refuse inline scripts.
const clean = (html, label) => {
  html = html
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace(/<script src="assets\/[^"]*"[^>]*><\/script>/g, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<(meta|link)\b[^>]*>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  if (/<script\b/.test(html)) throw new Error(`${label} has an inline script the sync does not handle`);
  return html;
};

// ---------- shared header and footer for the React templates ----------
const partialsDir = path.join(web, "content", "partials");
fs.rmSync(partialsDir, { recursive: true, force: true });
fs.mkdirSync(partialsDir, { recursive: true });
for (const part of ["header", "footer"]) {
  const html = rewrite(clean(fs.readFileSync(path.join(src, "partials", `${part}.html`), "utf8"), `partials/${part}.html`))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  fs.writeFileSync(path.join(partialsDir, `${part}.json`), JSON.stringify({ html }, null, 2) + "\n");
  console.log(`partial    ${part} ${html.length} chars`);
}

const outDir = path.join(web, "content", "pages");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const name of names) {
  const raw = include(fs.readFileSync(path.join(src, `${name}.html`), "utf8"));

  const bodyTag = [...raw.matchAll(/<body([^>]*)>/g)].at(-1);
  let html = raw.slice(bodyTag.index + bodyTag[0].length, raw.lastIndexOf("</body>"));
  const bodyData = Object.fromEntries([...bodyTag[1].matchAll(/data-([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

  const jsonLd = [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const scripts = [...html.matchAll(/<script src="assets\/([^"?]+)[^"]*"[^>]*><\/script>/g)].map((m) => m[1]);

  html = fillArt(rewrite(clean(html, `${name}.html`)))
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const page = {
    route: routeOf(name),
    title: raw.match(/<title>([\s\S]*?)<\/title>/)[1],
    description: meta(raw, "name", "description"),
    robots: meta(raw, "name", "robots"),
    ogType: meta(raw, "property", "og:type") ?? "website",
    ogImageAlt: meta(raw, "property", "og:image:alt"),
    bodyData,
    scripts,
    jsonLd,
    html,
  };
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(page, null, 2) + "\n");
  console.log(`${page.route.padEnd(10)} scripts=[${scripts.join(", ")}]  body=${JSON.stringify(bodyData)}  robots=${page.robots ?? "-"}  ${html.length} chars`);
}

const id = (n) => n.replace(/-(\w)/g, (_, c) => c.toUpperCase());
fs.writeFileSync(
  path.join(outDir, "manifest.ts"),
  "// Generated by scripts/sync-design.mjs. Do not edit.\n" +
    names.map((n) => `import ${id(n)} from "./${n}.json";`).join("\n") +
    `\n\nexport const PAGES = { ${names.map((n) => (id(n) === n ? n : `"${n}": ${id(n)}`)).join(", ")} };\n`,
);
