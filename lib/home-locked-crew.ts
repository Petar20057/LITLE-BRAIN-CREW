import "server-only";

import { countsOf, isUnlocked } from "@/lib/character-rules";
import { PUBLIC_CHARACTERS } from "@/lib/characters";
import { ITEMS, usd } from "@/lib/funnel";

// Home page, under "Meet the Little Brain Crew": the crew members the roster doesn't open, as the same grey padlocked
// silhouettes as on /crew (components/learn/CrewCard.tsx, LockedCard). Each one leads to the Toolkit checkout, because the
// Complete Crew Guide comes with it. It is an HTML string because the home page is a synced design page
// (design/index.html, the `locked-crew` slot, see components/DesignPage.tsx), not a React tree. The padlock icon
// (#i-lock) comes from the header partial, the styles from design/assets/additions.css (.home-locked).

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Same picture as CrewFace with `silhouette`: the character's art drawn grey by CSS, or a generic head when it has none. */
const GENERIC_HEAD =
  '<svg class="crew-blank generic" viewBox="0 0 120 120" aria-hidden="true"><path d="M60 14c-26 0-42 18-42 42 0 12 5 22 12 30-8 4-14 11-14 20h88c0-9-6-16-14-20 7-8 12-18 12-30 0-24-16-42-42-42z" fill="#333"/></svg>';

const tile = (artFile: string | undefined) =>
  `<li class="is-locked" data-access="locked"><a href="/checkout/guide?utm_source=home-crew-tile" aria-label="A locked crew member. Unlock all ${PUBLIC_CHARACTERS.length} with The Kid Brain Toolkit.">` +
  `<span class="crew-face is-silhouette">${artFile ? `<img src="${esc(artFile)}" alt="" width="72" height="72" loading="lazy">` : GENERIC_HEAD}</span>` +
  `<span class="lock-badge" aria-hidden="true"><svg><use href="#i-lock"></use></svg></span></a></li>`;

export function homeLockedCrewHtml(): string {
  const locked = PUBLIC_CHARACTERS.filter((c) => !isUnlocked(c));
  if (!locked.length) return "";
  const { all } = countsOf(PUBLIC_CHARACTERS);
  return (
    `<div class="home-locked" id="crew-locked"><div class="home-locked-head"><div>` +
    `<span class="kick">behind the padlock</span><h3>${locked.length} more are waiting in the guide.</h3>` +
    `<p>All ${all} crew members are in The Complete Crew Guide, which comes with the Toolkit: one card each, what it does, what helps it, what throws it off, and what to say to your kid.</p></div>` +
    `<a class="btn btn-main" href="/checkout/guide?utm_source=home-crew">Unlock all ${all} · ${usd(ITEMS.guide.price)}</a></div>` +
    `<ul class="locked-grid" aria-label="${locked.length} locked crew members">${locked.map((c) => tile(c.artKey ? undefined : c.artFile)).join("")}</ul></div>`
  );
}
