// One layout for every email, in the site's look (design/assets/site.css tokens): paper background, white card with a
// hero band in the crew member's own color, ink text, Bricolage Grotesque headings, Figtree body, the coral pill button
// (and the white outlined one for a second choice) and the crew drawings.
// Built for email clients, not browsers: tables, inline styles, PNG images with width/height/alt, web-safe
// font fallbacks (Gmail ignores web fonts), no SVG, no scripts, well under Gmail's 102 KB clipping limit.
// Every email gets a matching plain-text part from the same blocks, so the two can never drift apart.
// Dark mode: clients that honor prefers-color-scheme (Apple Mail, iOS, Outlook.com) get a dark card and the white logo;
// the crew art stays on a white disc so its ink outline never disappears. Gmail does its own inversion.
// Links to our own site get UTM tags (see tag()), so /admin/journey can count clicks and sales per email without a
// tracking redirect: those redirects are what spam filters distrust.

import { CHARS } from "@/lib/learn";

export type Email = { subject: string; preheader: string; html: string; text: string };

export type Block =
  | { p: string }
  | { list: string[] }
  | { rows: [string, string][]; total?: [string, string] }
  /** `secondary`: the white outlined button for the second choice; only one coral button per email. */
  | { button: { label: string; url: string; secondary?: boolean } }
  /** A bold text link, for a soft offer that shouldn't compete with the button. */
  | { link: { label: string; url: string } }
  /** Progress through a series, e.g. Day 2 of 5. */
  | { steps: { current: number; total: number; label: string } }
  | { note: string };

export type Message = {
  subject: string;
  /** The grey preview line next to the subject in the inbox. */
  preheader: string;
  /** Small handwritten line above the title, like the site's "kick". */
  kick?: string;
  title: string;
  /** Crew key from content/art.json; shown as public/email/crew/<key>.png, and its color tints the hero and notes. */
  art?: string;
  blocks: Block[];
  /** Why this person got this email (footer). */
  reason: string;
  /** Mail people signed up for (lists, the challenge): the /unsubscribe?t= page, shown as a link in the footer. */
  unsubscribe?: string;
  /** utm_campaign for links to our site (e.g. "challenge-day-2"). Without it links are left as they are. */
  campaign?: string;
};

// Public origin for links and images. Never localhost: an email link has to work from any inbox.
export const EMAIL_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.littlebraincrew.com").replace(/\/$/, "");

// A physical mailing address in every email's footer: US law (CAN-SPAM) requires one in commercial and list email.
// A PO box or virtual mailbox is fine. Empty = no address line (fine for receipts, not for the lists).
export const POSTAL_ADDRESS = process.env.EMAIL_POSTAL_ADDRESS ?? "";

const C = { paper: "#FFFBF4", white: "#FFFFFF", ink: "#1F1B2E", soft: "#57536A", hair: "#EDE4D6", cta: "#FF5A36", ctaEdge: "#C9401C", edge: "#D9CCB8", tick: "#A8E6C8", link: "#2F4BC4", dopaTint: "#FFF5CC" };
const BODY = "Figtree,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const HEAD = "'Bricolage Grotesque',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const HAND = `Caveat,'Segoe Print','Comic Sans MS',${BODY}`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (base: string, url: string) => (url.startsWith("/") ? `${base}${url}` : url);

/** A crew member's pale card color: its color at 30% on white, the same mix the quiz and site cards use. */
export function tint(hex: string, amount = 0.3): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(255 - (255 - c) * amount);
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map((c) => mix(c).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/** The crew member's color (its card tint and progress bars), or the site's default yellow. */
function colorOf(art: string | undefined) {
  const hex = art && art in CHARS ? CHARS[art as keyof typeof CHARS].color : "#FFD84D";
  return { hex, pale: art && art in CHARS ? tint(hex) : C.dopaTint };
}

// Pages whose links carry a token or a file, or that aren't "visits" worth counting: never tagged.
const UNTAGGED = /^\/(confirm|unsubscribe|api|downloads|privacy|terms)(\/|$)/;

/** Adds utm_source=email, utm_medium, utm_campaign and utm_content (the button's label) to a link to our own site. A link
 *  that already has utm_source (the checkout reminder's) keeps its own. */
export function tag(url: string, campaign: string | undefined, label: string, base = EMAIL_BASE): string {
  const full = abs(base, url);
  if (!campaign) return full;
  let u: URL;
  try {
    u = new URL(full);
  } catch {
    return full;
  }
  if (u.origin !== new URL(base).origin || UNTAGGED.test(u.pathname) || u.searchParams.has("utm_source")) return full;
  u.searchParams.set("utm_source", "email");
  u.searchParams.set("utm_medium", "lifecycle");
  u.searchParams.set("utm_campaign", campaign);
  u.searchParams.set("utm_content", label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "link");
  return u.toString();
}

type Ctx = { base: string; hex: string; pale: string; campaign?: string };

function blockHtml(b: Block, c: Ctx): string {
  if ("p" in b) return `<p class="ink" style="margin:0 0 16px;font:400 17px/1.6 ${BODY};color:${C.ink}">${esc(b.p)}</p>`;
  if ("note" in b) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px"><tr><td class="note ink" style="background:${c.pale};border-radius:20px;padding:16px 20px;font:400 15px/1.55 ${BODY};color:${C.ink}">${esc(b.note)}</td></tr></table>`;
  }
  if ("list" in b) {
    const rows = b.list
      .map((item) => `<tr><td width="34" valign="top" style="padding:2px 0 10px"><div style="width:22px;height:22px;border-radius:11px;background:${C.tick};text-align:center;font:800 13px/22px ${BODY};color:${C.ink}">&#10003;</div></td><td class="ink" valign="top" style="padding:0 0 10px;font:400 16px/1.5 ${BODY};color:${C.ink}">${esc(item)}</td></tr>`)
      .join("");
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px">${rows}</table>`;
  }
  if ("rows" in b) {
    const line = ([k, v]: [string, string], bold = false) =>
      `<tr><td class="${bold ? "ink" : "soft"} dash" style="padding:12px 0;border-bottom:2px dashed ${C.hair};font:${bold ? 700 : 400} 16px/1.4 ${BODY};color:${bold ? C.ink : C.soft}">${esc(k)}</td><td class="ink dash" align="right" style="padding:12px 0 12px 16px;border-bottom:2px dashed ${C.hair};font:700 16px/1.4 ${BODY};color:${C.ink};white-space:nowrap">${esc(v)}</td></tr>`;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${b.rows.map((r) => line(r)).join("")}${b.total ? line(b.total, true) : ""}</table>`;
  }
  if ("link" in b) {
    const url = esc(tag(b.link.url, c.campaign, b.link.label, c.base));
    return `<p style="margin:0 0 18px;font:700 16px/1.5 ${BODY}"><a class="a-link" href="${url}" style="color:${C.link};text-decoration:underline">${esc(b.link.label)} &rarr;</a></p>`;
  }
  if ("steps" in b) {
    const { current, total, label } = b.steps;
    const bars = Array.from({ length: total }, (_, i) => `<td height="8" bgcolor="${i < current ? c.hex : C.hair}" ${i < current ? "" : 'class="bar-off"'} style="height:8px;line-height:8px;font-size:1px;border-radius:4px;background:${i < current ? c.hex : C.hair}">&nbsp;</td>`).join(`<td width="6" style="width:6px;font-size:1px">&nbsp;</td>`);
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr>${bars}</tr><tr><td colspan="${total * 2 - 1}" class="soft" style="padding:8px 0 0;font:700 13px/1.2 ${BODY};letter-spacing:.07em;text-transform:uppercase;color:${C.soft}">${esc(label)}</td></tr></table>`;
  }
  // Bulletproof button: a table cell with the link filling it, so it works in Outlook too. On a phone it spans the card.
  const url = esc(tag(b.button.url, c.campaign, b.button.label, c.base));
  if (b.button.secondary) {
    return `<table role="presentation" class="btn" cellpadding="0" cellspacing="0" style="margin:6px 0 18px"><tr><td class="btn2" style="background:${C.white};border:2px solid ${C.ink};border-radius:999px"><a class="btn-a ink" href="${url}" style="display:inline-block;padding:14px 28px;font:700 17px/1.1 ${BODY};color:${C.ink};text-decoration:none;border-radius:999px;text-align:center">${esc(b.button.label)}</a></td></tr></table>`;
  }
  return `<table role="presentation" class="btn" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td style="background:${C.cta};border-radius:999px;border-bottom:4px solid ${C.ctaEdge}"><a class="btn-a" href="${url}" style="display:inline-block;padding:16px 32px;font:700 18px/1.1 ${BODY};color:${C.ink};text-decoration:none;border-radius:999px;text-align:center">${esc(b.button.label)}</a></td></tr></table>`;
}

function blockText(b: Block, c: Ctx): string {
  if ("p" in b) return b.p;
  if ("note" in b) return b.note;
  if ("list" in b) return b.list.map((i) => `- ${i}`).join("\n");
  if ("rows" in b) return [...b.rows, ...(b.total ? [b.total] : [])].map(([k, v]) => `${k}: ${v}`).join("\n");
  if ("steps" in b) return b.steps.label;
  if ("link" in b) return `${b.link.label}: ${tag(b.link.url, c.campaign, b.link.label, c.base)}`;
  return `${b.button.label}: ${tag(b.button.url, c.campaign, b.button.label, c.base)}`;
}

export function renderEmail(m: Message, base = EMAIL_BASE): Email {
  const { hex, pale } = colorOf(m.art);
  const ctx: Ctx = { base, hex, pale, campaign: m.campaign };
  const home = esc(tag("/", m.campaign, "logo", base));
  const art = m.art
    ? `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 14px"><tr><td style="background:#FFFFFF;border-radius:999px;padding:6px"><img src="${base}/email/crew/${esc(m.art)}.png" width="120" height="120" alt="" style="display:block;width:120px;height:120px;border:0;border-radius:60px"></td></tr></table>`
    : "";
  const kick = m.kick ? `<p class="soft" style="margin:0 0 4px;font:700 26px/1.1 ${HAND};color:${C.soft};text-align:center">${esc(m.kick)}</p>` : "";
  // Invisible filler after the preheader keeps inbox previews from pulling in body text.
  const filler = "&#847;&zwnj;&nbsp;".repeat(40);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(m.subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Caveat:wght@700&family=Figtree:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root{color-scheme:light dark;supported-color-schemes:light dark}
  body{margin:0;padding:0;background:${C.paper};-webkit-text-size-adjust:100%}
  a{color:${C.link}}
  .logo-dark{display:none}
  @media (max-width:600px){
    .outer{padding:20px 12px!important}
    .band{padding:26px 20px 20px!important}
    .body-pad{padding:24px 22px 4px!important}
    .title{font-size:27px!important}
    table.btn{width:100%!important}
    table.btn td{display:block!important;text-align:center!important}
    a.btn-a{display:block!important;padding-left:12px!important;padding-right:12px!important}
  }
  @media (prefers-color-scheme:dark){
    body,.page{background:#16131F!important}
    .card{background:#211D30!important;border-color:#352F49!important}
    .band{background:#2D2744!important}
    .ink,.title{color:#F4EFFF!important}
    .soft{color:#B9B3CC!important}
    .note{background:#2D2744!important}
    .dash{border-color:#352F49!important}
    .bar-off{background:#352F49!important}
    .btn2{background:#211D30!important;border-color:#F4EFFF!important}
    a.a-link{color:#9DB2FF!important}
    .foot a{color:#B9B3CC!important}
    .logo-light{display:none!important}
    .logo-dark{display:block!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(m.preheader)}${filler}</div>
<table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}">
<tr><td class="outer" align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">
    <tr><td align="center" style="padding:0 0 20px"><a href="${home}" style="text-decoration:none"><img class="logo-light" src="${base}/email/logo.png" width="160" height="58" alt="Little Brain Crew" style="display:block;width:160px;height:auto;border:0;font:700 18px ${BODY};color:${C.ink}"><img class="logo-dark" src="${base}/email/logo-white.png" width="160" height="58" alt="" style="display:none;width:160px;height:auto;border:0;mso-hide:all"></a></td></tr>
    <tr><td>
      <table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" style="background:${C.white};border:1px solid ${C.hair};border-radius:28px;border-collapse:separate;box-shadow:0 10px 28px -14px rgba(92,52,18,.24)">
        <tr><td class="band" bgcolor="${pale}" style="background:${pale};border-radius:27px 27px 0 0;padding:32px 36px 26px;text-align:center">
          ${art}${kick}<h1 class="title ink" style="margin:0;font:800 31px/1.15 ${HEAD};color:${C.ink};text-align:center">${esc(m.title)}</h1>
        </td></tr>
        <tr><td class="body-pad" style="padding:30px 40px 8px">${m.blocks.map((b) => blockHtml(b, ctx)).join("\n")}</td></tr>
      </table>
    </td></tr>
    <tr><td class="foot soft" align="center" style="padding:24px 8px 0;font:400 13px/1.6 ${BODY};color:${C.soft}">
      <p style="margin:0 0 8px">${esc(m.reason)}</p>
      <p style="margin:0 0 8px">Educational only, not medical advice. If you are worried about your child, talk to your pediatrician.</p>
      <p style="margin:0"><a href="${home}" style="color:${C.soft}">Little Brain Crew</a> · <a href="${base}/privacy" style="color:${C.soft}">Privacy</a> · <a href="${base}/terms" style="color:${C.soft}">Terms</a>${m.unsubscribe ? ` · <a href="${esc(abs(base, m.unsubscribe))}" style="color:${C.soft}">Unsubscribe</a>` : ""}</p>
      ${POSTAL_ADDRESS ? `<p style="margin:8px 0 0">${esc(POSTAL_ADDRESS)}</p>` : ""}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    m.title,
    "",
    ...m.blocks.map((b) => `${blockText(b, ctx)}\n`),
    "--",
    m.reason,
    "Educational only, not medical advice. If you are worried about your child, talk to your pediatrician.",
    `Little Brain Crew · ${tag("/", m.campaign, "text-footer", base)}`,
    ...(m.unsubscribe ? [`Unsubscribe: ${abs(base, m.unsubscribe)}`] : []),
    ...(POSTAL_ADDRESS ? [POSTAL_ADDRESS] : []),
  ].join("\n");

  return { subject: m.subject, preheader: m.preheader, html, text };
}
