// The free crew sticker pack (/free → public/downloads/crew-stickers.zip): the 12 stickers shown on /free, drawn again
// at 512 px (the size WhatsApp and Telegram want) from the site's crew art (content/art.json), as PNG and WebP.
//
//   node scripts/build-sticker-zip.mjs     (macOS, needs Google Chrome; rerun after changing the art, then commit the zip)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const web = path.resolve(import.meta.dirname, "..");
const art = JSON.parse(fs.readFileSync(path.join(web, "content", "art.json"), "utf8"));
const fonts = path.join(web, "design", "assets", "fonts");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SIZE = 512;

// Same names, moods and words as the stickers on design/free.html.
const STICKERS = [
  ["01-dopa-happy", "dopa", "happy", "Great job!"],
  ["02-dopa-tired", "dopa", "tired", "5 more min?"],
  ["03-sero-main", "sero", "main", "Good morning!"],
  ["04-sero-tired", "sero", "tired", "Bedtime!"],
  ["05-endo-main", "endo", "main", "Let’s move!"],
  ["06-endo-tired", "endo", "tired", "Need a break"],
  ["07-toci-main", "toci", "main", "Hug?"],
  ["08-toci-tired", "toci", "tired", "Miss you"],
  ["09-corti-happy", "corti", "happy", "Deep breath"],
  ["10-corti-main", "corti", "main", "Too loud!"],
  ["11-teo-main", "teo", "main", "Game on!"],
  ["12-teo-tired", "teo", "tired", "Sleep first"],
];
const COLOR = { dopa: "#FFD84D", sero: "#FFB86B", endo: "#A8E6C8", toci: "#FFC6D3", corti: "#FF7A5C", teo: "#BFE6FF" };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lbc-stickers-"));
const list = STICKERS.map(([name, key, mood, words]) => ({
  name,
  words,
  color: COLOR[key],
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="300" height="300">${art[key][mood]}</svg>`,
}));

// Headless Chrome draws each sticker on a canvas (the art as an image, the words with the site's font) and writes the
// PNG and WebP data URLs into the page, which --dump-dom prints.
const page = `<!doctype html><meta charset="utf-8"><body><script>
const S = ${SIZE}, list = ${JSON.stringify(list)};
const img = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
(async () => {
  const font = new FontFace("Bricolage", "url(${pathToFileURL(path.join(fonts, "bricolage-grotesque-latin-800-normal.woff2"))})", { weight: "800" });
  document.fonts.add(await font.load());
  const out = [];
  for (const s of list) {
    const c = document.createElement("canvas"); c.width = c.height = S;
    const g = c.getContext("2d");
    // white die-cut card with a soft shadow, the crew member, then the words on a pill in their color
    g.shadowColor = "rgba(31,27,46,.18)"; g.shadowBlur = 14; g.shadowOffsetY = 4;
    g.fillStyle = "#fff"; g.beginPath(); g.roundRect(16, 16, S - 32, S - 32, 64); g.fill();
    g.shadowColor = "transparent";
    g.drawImage(await img("data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.svg)), (S - 300) / 2, 34, 300, 300);
    g.font = "800 46px Bricolage";
    const w = Math.min(S - 72, g.measureText(s.words).width + 64);
    g.fillStyle = s.color; g.strokeStyle = "#1F1B2E"; g.lineWidth = 5;
    g.beginPath(); g.roundRect((S - w) / 2, 360, w, 84, 42); g.fill(); g.stroke();
    g.fillStyle = "#1F1B2E"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(s.words, S / 2, 404, S - 100);
    out.push({ name: s.name, png: c.toDataURL("image/png"), webp: c.toDataURL("image/webp", 0.9) });
  }
  const pre = document.createElement("pre"); pre.id = "out"; pre.textContent = JSON.stringify(out); document.body.append(pre);
})().catch((e) => { const pre = document.createElement("pre"); pre.id = "err"; pre.textContent = String(e); document.body.append(pre); });
</script>`;
const html = path.join(tmp, "stickers.html");
fs.writeFileSync(html, page);
const dom = execFileSync(
  CHROME,
  ["--headless", "--disable-gpu", "--allow-file-access-from-files", "--virtual-time-budget=15000", "--dump-dom", pathToFileURL(html).href],
  { maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
).toString();
const json = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/)?.[1];
if (!json) throw new Error(`Chrome didn't draw the stickers: ${dom.match(/<pre id="err">([\s\S]*?)<\/pre>/)?.[1] ?? "no output"}`);
const drawn = JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

const pack = path.join(tmp, "Little-Brain-Crew-Stickers");
for (const kind of ["png", "webp"]) fs.mkdirSync(path.join(pack, kind), { recursive: true });
for (const s of drawn) {
  for (const kind of ["png", "webp"]) {
    fs.writeFileSync(path.join(pack, kind, `${s.name}.${kind}`), Buffer.from(s[kind].split(",")[1], "base64"));
  }
}
fs.writeFileSync(
  path.join(pack, "README.txt"),
  [
    "Little Brain Crew stickers",
    "",
    "12 crew stickers, 512 x 512 px.",
    "png/   for Telegram, iMessage, or to send as a picture anywhere.",
    "webp/  for WhatsApp sticker apps (Sticker Maker and similar).",
    "",
    "Free for your family chats. Please don't sell them.",
    "littlebraincrew.com · hello@littlebraincrew.com",
    "",
  ].join("\n"),
);

const zip = path.join(web, "public", "downloads", "crew-stickers.zip");
fs.mkdirSync(path.dirname(zip), { recursive: true });
fs.rmSync(zip, { force: true });
execFileSync("zip", ["-rqX", zip, "Little-Brain-Crew-Stickers"], { cwd: tmp });
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`stickers  ${drawn.length} x png + webp (${SIZE} px) -> public/downloads/crew-stickers.zip`);
