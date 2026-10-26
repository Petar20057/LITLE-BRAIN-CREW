/* LITTLE BRAIN CREW · the crew, drawn in SVG. svg(name, mood) returns markup.
   Moods: 'main' (signature face), 'happy', 'tired'. Villains use 'tired' for "beaten by the crew". */
(function (w) {
  const INK = '#1B1A33';
  const S = `stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  const eyes = (y, x1 = 46, x2 = 74) =>
    `<g class="eyes"><circle cx="${x1}" cy="${y}" r="7" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="${x2}" cy="${y}" r="7" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="${x1 + 1.5}" cy="${y + 1}" r="3.2" fill="${INK}"/><circle cx="${x2 + 1.5}" cy="${y + 1}" r="3.2" fill="${INK}"/></g>`;
  const happyEyes = (y, x1 = 46, x2 = 74) => `<path d="M${x1 - 8} ${y + 2}q8-8 16 0M${x2 - 8} ${y + 2}q8-8 16 0" fill="none" ${S}/>`;
  const sleepyEyes = (y, x1 = 46, x2 = 74) => `<path d="M${x1 - 7} ${y}q7 6 14 0M${x2 - 7} ${y}q7 6 14 0" fill="none" ${S}/>`;
  const cheeks = (y, a = 38, b = 82) => `<circle cx="${a}" cy="${y}" r="5" fill="#FF8FA8" opacity=".7"/><circle cx="${b}" cy="${y}" r="5" fill="#FF8FA8" opacity=".7"/>`;
  const smile = (y, w = 12) => `<path d="M${60 - w} ${y}q${w} ${w * .9} ${w * 2} 0" fill="none" ${S}/>`;
  const flat = (y) => `<path d="M53 ${y}q7-3 14 0" fill="none" ${S}/>`;
  const frown = (y) => `<path d="M51 ${y + 4}q9-8 18 0" fill="none" ${S}/>`;
  const sweat = (x, y) => `<path d="M${x} ${y}q-6 9 0 12q6-3 0-12z" fill="#8FD3FF" ${S}/>`;
  const tear = (x, y) => `<path d="M${x} ${y}q-5 8 0 10q5-2 0-10z" fill="#8FD3FF" stroke="${INK}" stroke-width="2"/>`;
  // A full face for one mood, centered between the two eye positions.
  const face = (y, m, x1 = 46, x2 = 74) => {
    const c = (x1 + x2) / 2, ck = cheeks(y + 12, x1 - 8, x2 + 8);
    if (m === 'tired') return `${sleepyEyes(y, x1, x2)}${ck}<path d="M${c - 7} ${y + 18}q7-3 14 0" fill="none" ${S}/>`;
    if (m === 'happy') return `${happyEyes(y, x1, x2)}${ck}<path d="M${c - 12} ${y + 14}q12 11 24 0" fill="none" ${S}/>`;
    return `${eyes(y, x1, x2)}${ck}<path d="M${c - 10} ${y + 15}q10 9 20 0" fill="none" ${S}/>`;
  };
  // Villains: sly brows and a smirk. 'tired' = beaten (dizzy and deflated).
  const villain = (y, m, x1 = 46, x2 = 74) => {
    const c = (x1 + x2) / 2;
    if (m === 'tired') return `${sleepyEyes(y, x1, x2)}<path d="M${c - 9} ${y + 16}q4-4 9 0t9 0" fill="none" ${S}/>`;
    return `<path d="M${x1 - 9} ${y - 13}l14 5M${x2 + 9} ${y - 13}l-14 5" ${S}/>${eyes(y, x1, x2)}<path d="M${c - 11} ${y + 14}q13 8 23-5" fill="none" ${S}/>`;
  };
  const zz = (x, y) => `<text x="${x}" y="${y}" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="18" fill="${INK}">z</text><text x="${x + 12}" y="${y - 12}" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="13" fill="${INK}">z</text>`;

  const ART = {
    dopa: m => `<g class="bob"><path d="M60 10l5.5 11.5 12.5 1.8-9 8.8 2.1 12.4L60 38.6l-11.1 5.9 2.1-12.4-9-8.8 12.5-1.8z" fill="${m === 'tired' ? '#FFB86B' : '#FF5A36'}" ${S}/><circle cx="60" cy="74" r="36" fill="#FFD84D" ${S}/>`
      + (m === 'tired' ? `${sleepyEyes(68)}${cheeks(80)}${flat(86)}${sweat(92, 52)}` : `${m === 'happy' ? happyEyes(68) : eyes(68)}${cheeks(80)}${smile(84)}`)
      + `<path d="M24 78q-10-8-6-20M96 78q10-8 6-20" fill="none" ${S}/></g>`,
    sero: m => `<g class="rays">${Array.from({ length: 10 }, (_, i) => { const a = i * 36 * Math.PI / 180; return `<line x1="${(60 + 44 * Math.cos(a)).toFixed(1)}" y1="${(66 + 44 * Math.sin(a)).toFixed(1)}" x2="${(60 + 54 * Math.cos(a)).toFixed(1)}" y2="${(66 + 54 * Math.sin(a)).toFixed(1)}" ${S}/>`; }).join('')}</g><g class="bob"><circle cx="60" cy="66" r="36" fill="#FFB86B" ${S}/>`
      + (m === 'tired' ? `${sleepyEyes(60)}${cheeks(72)}${flat(80)}${zz(92, 34)}` : `${happyEyes(58)}${cheeks(72)}<path d="M50 78q10 8 20 0" fill="none" ${S}/>`) + `</g>`,
    endo: m => `<g class="bob"><path d="M30 40l-10-18M90 40l10-18" ${S}/><ellipse cx="60" cy="64" rx="32" ry="40" fill="#A8E6C8" ${S}/>`
      + (m === 'tired' ? `${sleepyEyes(54)}${cheeks(66)}<path d="M50 76q5-4 10 0t10 0" fill="none" ${S}/>${sweat(88, 34)}` : `${m === 'happy' ? happyEyes(54) : eyes(54)}${cheeks(66)}<path d="M46 70q14 18 28 0z" fill="#fff" ${S}/>`)
      + `<ellipse cx="44" cy="108" rx="12" ry="6" fill="#FF5A36" ${S}/><ellipse cx="76" cy="108" rx="12" ry="6" fill="#FF5A36" ${S}/></g>`,
    toci: m => `<g class="bob"><path d="M60 104C22 80 12 48 34 34c12-7 22 0 26 10 4-10 14-17 26-10 22 14 12 46-26 70z" fill="#FFC6D3" ${S}/>`
      + (m === 'tired' ? `${eyes(58)}${tear(44, 68)}${frown(74)}` : `${m === 'happy' ? happyEyes(58) : eyes(58)}${cheeks(70)}<path d="M50 74q10 9 20 0" fill="none" ${S}/>`)
      + `<path d="M22 66q-10 6-6 16M98 66q10 6 6 16" fill="none" ${S}/></g>`,
    corti: m => `<g class="bob"><path d="M42 102l-8 10M78 102l8 10" ${S}/><circle cx="30" cy="34" r="12" fill="#FFD84D" ${S}/><circle cx="90" cy="34" r="12" fill="#FFD84D" ${S}/><line x1="60" y1="22" x2="60" y2="30" ${S}/><circle cx="60" cy="68" r="38" fill="${m === 'happy' ? '#FFA48F' : '#FF7A5C'}" ${S}/>`
      + (m === 'happy' ? `${happyEyes(64)}${cheeks(76)}${smile(82, 10)}` : `<path d="M38 56l14 4M82 56l-14 4" ${S}/>${eyes(66)}<ellipse cx="60" cy="86" rx="6" ry="7" fill="${INK}"/>`) + `</g>`,
    teo: m => `<g class="bob"><rect x="24" y="30" width="72" height="76" rx="24" fill="#BFE6FF" ${S}/><rect x="24" y="40" width="72" height="12" fill="#FF5A36" ${S}/><path d="M96 46l12-6M96 46l12 4" ${S}/>`
      + (m === 'tired' ? `${sleepyEyes(66)}${cheeks(78)}<ellipse cx="60" cy="86" rx="7" ry="8" fill="${INK}"/>${zz(84, 26)}` : `${m === 'happy' ? happyEyes(66) : eyes(66)}${cheeks(78)}<path d="M48 84q12 9 24 0" fill="none" ${S}/>`)
      + `<path d="M24 80q-14-2-14-16M10 64h-6v-8h18v8h-6" fill="#FFD84D" ${S}/></g>`,

    /* ---------- wave 2 ---------- */
    // Mela · melatonin: "night is coming". Round night-blue body in a nightcap.
    mela: m => `<g class="bob"><circle cx="60" cy="72" r="34" fill="#8C9EEB" ${S}/>`
      + `<path d="M24 58Q34 22 70 22Q100 24 108 60Q98 52 88 54Q60 38 24 58Z" fill="#C5B4F5" ${S}/><path d="M38 40l4 6M58 30l2 7M78 30l-1 7" ${S}/><circle cx="108" cy="62" r="7" fill="#FFD84D" ${S}/>`
      + face(76, m === 'main' ? 'happy' : m) + `<path d="M84 96a8 8 0 1 0 8-12a6 6 0 1 1-8 12z" fill="#FFD84D" stroke="${INK}" stroke-width="2"/></g>`,
    // Migo · amygdala: the smoke detector. An almond with a siren on top.
    migo: m => `<g class="bob"><path d="M60 28C88 32 100 62 90 88C82 108 38 108 30 88C20 62 32 32 60 28Z" fill="#E89AC7" ${S}/>`
      + `<rect x="47" y="24" width="26" height="7" rx="3" fill="#B9B2A6" ${S}/><path d="M51 24q9-18 18 0z" fill="${m === 'happy' ? '#FFB86B' : '#FF5A36'}" ${S}/>`
      + (m === 'happy' ? '' : `<path d="M40 8l6 7M80 8l-6 7M60 0v7" ${S}/>`)
      + (m === 'main' ? `${eyes(66)}${cheeks(78)}<ellipse cx="60" cy="86" rx="6" ry="7" fill="${INK}"/>` : face(66, m)) + `</g>`,
    // Fronti · prefrontal cortex: the planner and the brakes, still under construction. Hard hat and a stop sign.
    fronti: m => `<g class="bob"><rect x="22" y="42" width="76" height="66" rx="28" fill="#F2C094" ${S}/>`
      + `<path d="M28 48Q30 20 60 18Q90 20 92 48Z" fill="#FFD84D" ${S}/><rect x="18" y="44" width="84" height="9" rx="4.5" fill="#FFD84D" ${S}/><path d="M60 18v26" ${S}/>`
      + face(74, m) + `<path d="M98 84l8 22" ${S}/><path d="M100 64l8-3 7 4 1 8-5 7-8 1-6-5z" fill="#FF5A36" ${S}/></g>`,
    // Greli · ghrelin: the hunger signal from the stomach. A bean-shaped stomach holding a fork.
    greli: m => `<g class="bob"><path d="M40 30C70 20 96 34 92 60C88 82 70 82 66 94C62 108 34 108 28 90C22 72 22 40 40 30Z" fill="#C9E66E" ${S}/>`
      + `<path d="M104 36v44M98 36v12q6 6 12 0V36" fill="none" ${S}/><path d="M8 62q4-5 8 0t8 0M10 76q4-5 8 0t8 0" fill="none" ${S}/>`
      + (m === 'tired' ? `<path d="M38 50l14 5M78 50l-14 5" ${S}/>${eyes(60)}${frown(74)}` : m === 'happy' ? face(60, 'happy') : `${eyes(60)}${cheeks(72)}<ellipse cx="60" cy="78" rx="7" ry="8" fill="${INK}"/>`) + `</g>`,
    // Gabi · GABA: the brain's main brake. A soft cloud that slows things down.
    gabi: m => `<g class="bob"><path d="M28 88C10 88 10 62 26 58C24 38 46 30 58 42C66 24 94 28 94 50C112 52 112 80 94 88Z" fill="#C5B4F5" ${S}/>`
      + face(66, m === 'main' ? 'happy' : m) + `<path d="M32 98h56" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"/></g>`,
    // Nora · noradrenaline: the spotlight that switches on attention. A headlamp with a beam.
    nora: m => `<g class="bob">${m === 'tired' ? '' : `<path d="M53 30L34 2h52L67 30Z" fill="#FFF3B0" opacity=".9"/>`}<circle cx="60" cy="72" r="34" fill="#8FD3D9" ${S}/>`
      + `<path d="M28 58q32-14 64 0" fill="none" stroke="#FF5A36" stroke-width="7" stroke-linecap="round"/><circle cx="60" cy="40" r="10" fill="${m === 'tired' ? '#B9B2A6' : '#FFD84D'}" ${S}/>`
      + face(76, m) + `</g>`,

    /* ---------- villains: always a habit or a thing ---------- */
    // Bedi · phone in bed
    bedi: m => `<g class="bob"><rect x="32" y="14" width="56" height="88" rx="12" fill="#6C6A9E" ${S}/><rect x="39" y="22" width="42" height="56" rx="6" fill="#7FE3FF" ${S}/>`
      + villain(46, m) + `<path d="M14 82Q60 66 106 82V110Q60 118 14 110Z" fill="#FFC6D3" ${S}/><path d="M30 92q8-4 16 0M64 90q8-4 16 0" fill="none" ${S}/></g>`,
    // Glo · bright light late at night
    glo: m => `<g class="rays">${m === 'tired' ? '' : `<path d="M60 4v8M24 18l6 6M96 18l-6 6M12 52h8M100 52h8" ${S}/>`}</g><g class="bob"><circle cx="60" cy="52" r="32" fill="${m === 'tired' ? '#E8E2D6' : '#FFF3B0'}" ${S}/>`
      + `<rect x="46" y="82" width="28" height="22" rx="5" fill="#B9B2A6" ${S}/><path d="M46 90h28M46 97h28" ${S}/>` + villain(52, m) + `</g>`,
    // Lupi · autoplay and the endless feed
    lupi: m => `<g class="bob"><circle cx="60" cy="62" r="34" fill="#F46FA3" ${S}/>`
      + `<path d="M18 50A44 44 0 0 1 96 28" fill="none" ${S}/><path d="M96 28l-12-1M96 28l-1 12" ${S}/><path d="M102 74A44 44 0 0 1 24 96" fill="none" ${S}/><path d="M24 96l12 1M24 96l1-12" ${S}/>`
      + villain(56, m) + `<path d="M55 86v12l10-6z" fill="#fff" ${S}/></g>`,
    // Pingi · notifications
    pingi: m => `<g class="bob"><path d="M60 18C80 18 88 36 88 56V74L98 86H22L32 74V56C32 36 40 18 60 18Z" fill="#F2A541" ${S}/><circle cx="60" cy="96" r="7" fill="#F2A541" ${S}/>`
      + (m === 'tired' ? '' : `<circle cx="88" cy="26" r="11" fill="#FF3B30" ${S}/><text x="88" y="31" text-anchor="middle" font-family="Figtree,system-ui,sans-serif" font-weight="800" font-size="13" fill="#fff">3</text><path d="M10 44q-4 10 0 20M110 44q4 10 0 20" fill="none" ${S}/>`)
      + villain(54, m) + `</g>`,
    // Lati · late, irregular bedtimes
    lati: m => `<g class="bob"><rect x="24" y="12" width="72" height="10" rx="5" fill="#B9B2A6" ${S}/><rect x="24" y="102" width="72" height="10" rx="5" fill="#B9B2A6" ${S}/>`
      + `<path d="M30 22H90L68 62L90 102H30L52 62Z" fill="#9C8FD0" ${S}/><path d="M48 92h24l-12-14z" fill="#FFD84D" ${S}/>` + villain(42, m, 50, 70) + `</g>`,
    // Kafi · caffeine (energy drinks, cola)
    kafi: m => `<g class="bob"><rect x="34" y="18" width="52" height="88" rx="10" fill="#6FD18A" ${S}/><path d="M38 26h44" ${S}/><ellipse cx="60" cy="18" rx="20" ry="4" fill="#B9B2A6" ${S}/>`
      + `<path d="M64 64l-12 18h10l-6 16 18-22H64l6-12z" fill="#FFD84D" ${S}/>`
      + (m === 'tired' ? villain(46, m) : `<path d="M38 34l14 5M82 34l-14 5" ${S}/><circle cx="46" cy="46" r="7" fill="#fff" ${S}/><circle cx="74" cy="46" r="7" fill="#fff" ${S}/><circle cx="46" cy="46" r="2.5" fill="${INK}"/><circle cx="74" cy="46" r="2.5" fill="${INK}"/><path d="M50 58l5-3 5 3 5-3 5 3" fill="none" ${S}/>`) + `</g>`,

    /* ---------- ages & stages (a pastel rainbow, 3 to 17) ---------- */
    whyzi: m => `<g class="bob"><path d="M50 22q0-14 12-14q12 0 12 11q0 9-11 11v6" fill="none" ${S}/><circle cx="63" cy="42" r="3" fill="${INK}"/><circle cx="60" cy="76" r="32" fill="#FFD6A5" ${S}/>` + face(76, m) + `</g>`,
    skuli: m => `<g class="bob"><rect x="16" y="54" width="18" height="38" rx="6" fill="#FF7A5C" ${S}/><rect x="86" y="54" width="18" height="38" rx="6" fill="#FF7A5C" ${S}/><circle cx="60" cy="70" r="34" fill="#FDFFB6" ${S}/><path d="M40 40l-8 16M80 40l8 16" stroke="#FF7A5C" stroke-width="6" stroke-linecap="round"/>` + face(66, m) + `</g>`,
    ruli: m => `<g class="bob"><circle cx="60" cy="70" r="34" fill="#CAFFBF" ${S}/><rect x="70" y="14" width="40" height="12" rx="3" transform="rotate(32 90 20)" fill="#FFD84D" ${S}/>` + face(70, m) + `</g>`,
    tweeni: m => `<g class="bob"><circle cx="60" cy="70" r="34" fill="#9BF6FF" ${S}/><path d="M24 66Q22 26 60 26Q98 26 96 66" fill="none" ${S}/><rect x="14" y="58" width="16" height="24" rx="7" fill="#FF5A36" ${S}/><rect x="90" y="58" width="16" height="24" rx="7" fill="#FF5A36" ${S}/>` + face(70, m) + `</g>`,
    sprouti: m => `<g class="bob"><path d="M60 30v-12" ${S}/><path d="M60 22q-20-14-26 2q16 6 26-2zM60 18q16-16 26-2q-12 10-26 2z" fill="#A8E6C8" ${S}/><ellipse cx="60" cy="72" rx="30" ry="40" fill="#A0C4FF" ${S}/>` + face(66, m) + `</g>`,
    seki: m => `<g class="bob"><path d="M22 106V64Q22 26 60 26Q98 26 98 64V106Z" fill="#BDB2FF" ${S}/><path d="M34 74Q34 44 60 44Q86 44 86 74Q86 98 60 98Q34 98 34 74Z" fill="#FFE8D6" ${S}/><path d="M48 100v10M72 100v10" ${S}/>`
      + (m === 'main' ? `<path d="M42 70h12M66 70h12" ${S}/><circle cx="49" cy="74" r="3" fill="${INK}"/><circle cx="73" cy="74" r="3" fill="${INK}"/>${flat(86)}` : face(72, m, 48, 72)) + `</g>`,

    /* ---------- the two ideas behind every habit ---------- */
    // Plasti · neuroplasticity: the brain changes from what's repeated. A lump of clay with a path pressed into it.
    plasti: m => `<g class="bob"><path d="M22 92C10 70 22 36 52 30C82 24 108 44 102 74C98 98 76 106 56 104C40 104 28 102 22 92Z" fill="#FF9EAA" ${S}/>`
      + `<path d="M30 92c14-4 18-12 32-10s22 8 34-2" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>` + face(60, m) + `</g>`,
    // Duo · co-regulation: a calm grown-up lends their calm. A big friend and a small one, side by side.
    duo: m => `<g class="bob"><circle cx="46" cy="60" r="32" fill="#FFD8BE" ${S}/><circle cx="90" cy="86" r="20" fill="#FFC6D3" ${S}/><path d="M70 78q8 4 12 0" fill="none" ${S}/>`
      + (m === 'tired' ? `${sleepyEyes(56, 36, 56)}${flat(70).replace('M53', 'M39')}` : `${happyEyes(56, 36, 56)}<path d="M36 70q10 8 20 0" fill="none" ${S}/>`)
      + `<circle cx="34" cy="68" r="4" fill="#FF8FA8" opacity=".7"/><circle cx="58" cy="68" r="4" fill="#FF8FA8" opacity=".7"/>`
      + `<path d="M80 82q4-4 8 0M92 82q4-4 8 0" fill="none" ${S}/><path d="M86 94q4 3 8 0" fill="none" ${S}/></g>`,
  };

  w.CREW_ART = ART;
  w.CREW_INK = INK;
  w.CREW_STROKE = S;
  w.svg = (k, mood = 'main', cls = '') =>
    `<svg class="ch ch-${k} ${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${ART[k](mood)}</svg>`;
})(window);
