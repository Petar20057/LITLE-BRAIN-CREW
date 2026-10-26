// Crew art for emails. Email clients (Gmail, Outlook) don't show SVG, so the same drawings the site uses
// (content/art.json, from design/assets/crew-art.js) are rendered to small PNGs in public/email/crew/.
//
//   npm run email:art     (macOS: uses QuickLook to render; rerun after changing the crew art, then commit the PNGs)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const web = path.resolve(import.meta.dirname, "..");
const art = JSON.parse(fs.readFileSync(path.join(web, "content", "art.json"), "utf8"));
const out = path.join(web, "public", "email", "crew");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lbc-email-art-"));
const SIZE = 240; // shown at 120 px, so it stays sharp on retina screens

fs.mkdirSync(out, { recursive: true });
for (const [key, moods] of Object.entries(art)) {
  const svg = path.join(tmp, `${key}.svg`);
  fs.writeFileSync(svg, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${SIZE}" height="${SIZE}">${moods.happy}</svg>`);
  execFileSync("qlmanage", ["-t", "-s", String(SIZE), "-o", tmp, svg], { stdio: "ignore" });
  fs.renameSync(`${svg}.png`, path.join(out, `${key}.png`));
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`email art  ${Object.keys(art).length} characters -> public/email/crew/*.png (${SIZE} px)`);
