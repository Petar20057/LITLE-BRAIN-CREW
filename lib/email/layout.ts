// One layout for every email, in the site's look (design/assets/site.css tokens): paper background, white card,
// ink text, Bricolage Grotesque headings, Figtree body, the coral pill button and the crew drawings.
// Built for email clients, not browsers: tables, inline styles, PNG images with width/height/alt, web-safe
// font fallbacks (Gmail ignores web fonts), no SVG, no scripts, well under Gmail's 102 KB clipping limit.
// Every email gets a matching plain-text part from the same blocks, so the two can never drift apart.

export type Email = { subject: string; preheader: string; html: string; text: string };

export type Block =
  | { p: string }
  | { list: string[] }
  | { rows: [string, string][]; total?: [string, string] }
  | { button: { label: string; url: string } }
  | { note: string };

export type Message = {
  subject: string;
  /** The grey preview line next to the subject in the inbox. */
  preheader: string;
  /** Small handwritten line above the title, like the site's "kick". */
  kick?: string;
  title: string;
  /** Crew key from content/art.json; shown as public/email/crew/<key>.png. */
  art?: string;
  blocks: Block[];
  /** Why this person got this email (footer). */
  reason: string;
};

// Public origin for links and images. Never localhost: an email link has to work from any inbox.
export const EMAIL_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.littlebraincrew.com").replace(/\/$/, "");

const C = { paper: "#FFFBF4", white: "#FFFFFF", ink: "#1F1B2E", soft: "#57536A", hair: "#EDE4D6", cta: "#FF5A36", ctaEdge: "#C9401C", tick: "#A8E6C8", note: "#FFEEF2", link: "#2F4BC4" };
const BODY = "Figtree,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const HEAD = "'Bricolage Grotesque',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const HAND = `Caveat,${BODY}`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (base: string, url: string) => (url.startsWith("/") ? `${base}${url}` : url);

function blockHtml(b: Block, base: string): string {
  if ("p" in b) return `<p style="margin:0 0 16px;font:400 17px/1.6 ${BODY};color:${C.ink}">${esc(b.p)}</p>`;
  if ("note" in b) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px"><tr><td style="background:${C.note};border-radius:20px;padding:16px 20px;font:400 15px/1.55 ${BODY};color:${C.ink}">${esc(b.note)}</td></tr></table>`;
  }
  if ("list" in b) {
    const rows = b.list
      .map((item) => `<tr><td width="34" valign="top" style="padding:2px 0 10px"><div style="width:22px;height:22px;border-radius:11px;background:${C.tick};text-align:center;font:800 13px/22px ${BODY};color:${C.ink}">&#10003;</div></td><td valign="top" style="padding:0 0 10px;font:400 16px/1.5 ${BODY};color:${C.ink}">${esc(item)}</td></tr>`)
      .join("");
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px">${rows}</table>`;
  }
  if ("rows" in b) {
    const line = ([k, v]: [string, string], bold = false) =>
      `<tr><td style="padding:12px 0;border-bottom:2px dashed ${C.hair};font:${bold ? 700 : 400} 16px/1.4 ${BODY};color:${bold ? C.ink : C.soft}">${esc(k)}</td><td align="right" style="padding:12px 0 12px 16px;border-bottom:2px dashed ${C.hair};font:700 16px/1.4 ${BODY};color:${C.ink};white-space:nowrap">${esc(v)}</td></tr>`;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${b.rows.map((r) => line(r)).join("")}${b.total ? line(b.total, true) : ""}</table>`;
  }
  // Bulletproof button: a table cell with the link filling it, so it works in Outlook too.
  const url = esc(abs(base, b.button.url));
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td style="background:${C.cta};border-radius:999px;border-bottom:4px solid ${C.ctaEdge}"><a href="${url}" style="display:inline-block;padding:15px 28px;font:700 17px/1.1 ${BODY};color:${C.ink};text-decoration:none;border-radius:999px">${esc(b.button.label)}</a></td></tr></table>`;
}

function blockText(b: Block, base: string): string {
  if ("p" in b) return b.p;
  if ("note" in b) return b.note;
  if ("list" in b) return b.list.map((i) => `- ${i}`).join("\n");
  if ("rows" in b) return [...b.rows, ...(b.total ? [b.total] : [])].map(([k, v]) => `${k}: ${v}`).join("\n");
  return `${b.button.label}: ${abs(base, b.button.url)}`;
}

export function renderEmail(m: Message, base = EMAIL_BASE): Email {
  const art = m.art
    ? `<tr><td align="center" style="padding:0 0 8px"><img src="${base}/email/crew/${esc(m.art)}.png" width="120" height="120" alt="" style="display:block;width:120px;height:120px;border:0"></td></tr>`
    : "";
  const kick = m.kick ? `<p style="margin:0 0 4px;font:700 24px/1.1 ${HAND};color:${C.soft};text-align:center">${esc(m.kick)}</p>` : "";
  // Invisible filler after the preheader keeps inbox previews from pulling in body text.
  const filler = "&#847;&zwnj;&nbsp;".repeat(40);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(m.subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Caveat:wght@700&family=Figtree:wght@400;700&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;background:${C.paper};-webkit-text-size-adjust:100%}
  a{color:${C.link}}
  @media (max-width:600px){.card{padding:28px 20px!important}.title{font-size:26px!important}}
</style>
</head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(m.preheader)}${filler}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}">
<tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td align="center" style="padding:0 0 20px"><a href="${base}/" style="text-decoration:none"><img src="${base}/email/logo.png" width="160" height="58" alt="Little Brain Crew" style="display:block;width:160px;height:auto;border:0;font:700 18px ${BODY};color:${C.ink}"></a></td></tr>
    <tr><td class="card" style="background:${C.white};border:1px solid ${C.hair};border-radius:28px;padding:40px 40px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${art}
        <tr><td style="padding:0 0 20px;text-align:center">${kick}<h1 class="title" style="margin:0;font:800 30px/1.15 ${HEAD};color:${C.ink};text-align:center">${esc(m.title)}</h1></td></tr>
        <tr><td>${m.blocks.map((b) => blockHtml(b, base)).join("\n")}</td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:24px 8px 0;font:400 13px/1.6 ${BODY};color:${C.soft}">
      <p style="margin:0 0 8px">${esc(m.reason)}</p>
      <p style="margin:0 0 8px">For learning only. Not medical advice. If you are worried about your child, talk to your pediatrician.</p>
      <p style="margin:0"><a href="${base}/" style="color:${C.soft}">Little Brain Crew</a> · <a href="${base}/privacy" style="color:${C.soft}">Privacy</a> · <a href="${base}/terms" style="color:${C.soft}">Terms</a></p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    m.title,
    "",
    ...m.blocks.map((b) => `${blockText(b, base)}\n`),
    "--",
    m.reason,
    "For learning only. Not medical advice. If you are worried about your child, talk to your pediatrician.",
    `Little Brain Crew · ${base}`,
  ].join("\n");

  return { subject: m.subject, preheader: m.preheader, html, text };
}
