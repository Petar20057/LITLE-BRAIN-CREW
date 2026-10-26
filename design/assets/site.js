/* Little Brain Crew · site logic. Needs crew-art.js first. Every block checks that its section exists,
   so the same file works on every page. */
(function () {
const gi = id => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ===================== SETTINGS (owner fills these in) ===================== */
// Web3Forms access key: once it's here, every form emails you. The form name goes in the subject.
const W3F_KEY = '';
// Checkout, upsells and downsells live in the Next.js app (/checkout/<product>, /offer/...). Prices: web/lib/funnel.ts.
// Early-bird deadline. Timers, the old price and "early" wording stay HIDDEN until the owner confirms a real date.
const EARLY_BIRD_CONFIRMED = false;
const OPEN = new Date('2026-12-02T18:00:00+01:00'); // placeholder date
if (EARLY_BIRD_CONFIRMED) document.documentElement.classList.add('early-on');
/* ========================================================================= */

/* ---------- the crew ---------- */
const CREW = {
  dopa: { name: 'Dopa', real: 'Dopamine', group: 'Messenger', color: '#FFD84D', job: 'gives out gold stars when you finish something',
    what: 'Dopa is about wanting, trying and feeling proud. Dopa is why finishing something feels good.',
    upL: 'Helps Dopa', up: ['Finishing small tasks', 'Small, clear goals', 'Learning a skill step by step'],
    downL: 'Upsets Dopa', down: ['Scrolling with no end', 'Lots of short videos', 'Prizes that come too easily'],
    fix: 'Cut big jobs into small ones. Cheer every finish. Warn 5 minutes before the screen goes off. That’s why tears come when the tablet stops: Dopa just lost its easy stars.',
    tonight: ['Give one small job with a clear end. Then cheer.', 'Warn at 5 minutes and at 1 minute before screens go off.', 'Swap one video for a short game they can win.'] },
  sero: { name: 'Sero', real: 'Serotonin', group: 'Messenger', color: '#FFB86B', job: 'opens the curtains and keeps the mood steady',
    what: 'Sero is about calm and feeling okay. Sero likes days that are bright and that look the same each day.',
    upL: 'Helps Sero', up: ['Morning daylight', 'The same sleep times', 'Meals at regular times', 'Time outside'],
    downL: 'Upsets Sero', down: ['Going to bed late', 'Messy, rushed days', 'Staying inside all day'],
    fix: 'Get 10 minutes of morning daylight. Keep the same bedtime each night. Eat at steady times. Go outside every day.',
    tonight: ['Pick tomorrow’s wake-up time and bedtime. Stick to both.', 'Plan 10 minutes outside before school.', 'Have dinner at the same time as yesterday.'] },
  endo: { name: 'Endo', real: 'Endorphin', group: 'Messenger', color: '#A8E6C8', job: 'turns jumping and laughing into good feelings',
    what: 'Endo is the body’s own feel-good helper. Endo shows up when kids run, get out of breath and giggle.',
    upL: 'Helps Endo', up: ['Running and jumping', 'Dancing', 'Big belly laughs'],
    downL: 'Upsets Endo', down: ['Sitting most of the day', 'No time for wild play'],
    fix: 'Every day, do something that makes them out of breath and laughing: chase, dance, jump, be silly together.',
    tonight: ['Have a 5-minute kitchen dance party.', 'Race to the end of the street and back.', 'Tell your worst jokes until someone snorts.'] },
  toci: { name: 'Toci', real: 'Oxytocin', group: 'Hormone', color: '#FFC6D3', job: 'builds the feeling “I’m safe, I belong”',
    what: 'Toci is about feeling close and safe. Toci grows each time your kid feels you really see them.',
    upL: 'Helps Toci', up: ['Hugs', 'Looking each other in the eyes', 'Eating together', 'Time alone with you'],
    downL: 'Upsets Toci', down: ['Phones at the table', 'Busy days with no real time together'],
    fix: 'Put phones away at the table. Give a long hug. Spend 10 minutes alone together, doing what your kid picks.',
    tonight: ['Put phones in another room during dinner.', 'Give a hug that lasts longer than you think it should.', 'Spend 10 minutes doing what they pick, just you two.'] },
  corti: { name: 'Corti', real: 'Cortisol', group: 'Hormone', color: '#FF7A5C', job: 'rings the alarm when there’s danger',
    what: 'Corti is the stress alarm. It helps in a real emergency. It wears everyone out when it never stops ringing.',
    upL: 'Calms Corti', up: ['The same routines each day', 'Slow breathing', 'Moving the body', 'Quiet evenings'],
    downL: 'Sets off Corti', down: ['Rushing', 'Fights', 'Bad sleep', 'Screens late at night'],
    fix: 'Keep routines the same. Breathe slowly together. Move after school. Keep the last hour before bed calm and screen-free.',
    tonight: ['Turn screens off one hour before bed.', 'Take 3 slow breaths together: smell the flower, blow out the candle.', 'Lay out tomorrow’s clothes tonight, so the morning isn’t a rush.'] },
  teo: { name: 'Teo', real: 'Testosterone', group: 'Hormone', color: '#BFE6FF', job: 'builds strength, energy and confidence in the teen years', teen: true,
    what: 'Teo is about strength, energy and confidence. Teo only joins the crew in our teen material.',
    upL: 'Helps Teo', up: ['Deep sleep', 'Sports and strength games', 'Daylight', 'Real food'],
    downL: 'Upsets Teo', down: ['Short sleep', 'Sitting all day', 'Lots of junk food'],
    fix: 'Protect their sleep. Make time for sport. Get daylight. Choose real food over junk snacks most of the time.',
    tonight: ['Agree on a phone-off time that allows a full night’s sleep.', 'Plan one sport or workout this week.', 'Swap one junk snack for real food.'] },

  /* wave 2 (from the character map: Nora, Gabi, Mela, Greli, Migo, Fronti) */
  nora: { name: 'Nora', real: 'Noradrenaline', group: 'Messenger', color: '#8FD3D9', job: 'switches on the spotlight when something matters', isNew: true,
    what: 'Nora is about alertness and attention. Nora turns the spotlight on, so the brain notices what counts right now.',
    upL: 'Helps Nora', up: ['Moving before focus time', 'One task at a time', 'A clear start signal', 'Short breaks'],
    downL: 'Throws Nora off', down: ['Notifications in the middle of a task', 'Sitting for a long time', 'Too many things at once'],
    fix: 'Move for a few minutes before homework. Put the phone in another room. Work in short blocks with a clear start and a short break.',
    tonight: ['Do 20 jumping jacks together before homework.', 'Phone in another room until the first task is done.', 'Work 10 minutes, break 2, repeat.'] },
  gabi: { name: 'Gabi', real: 'GABA', group: 'Messenger', color: '#C5B4F5', job: 'presses the brain’s brake and turns the volume down', isNew: true,
    what: 'Gabi is the brain’s main brake. After a big feeling, Gabi quiets the signals so the body can settle. Nora switches the lights on, Gabi dims them.',
    upL: 'Helps Gabi', up: ['Slow breathing', 'A calm grown-up close by', 'Quiet, dim evenings', 'Routines that look the same'],
    downL: 'Throws Gabi off', down: ['Rushing', 'Loud, busy evenings', 'Screens right before bed'],
    fix: 'After a big feeling: lower your voice, breathe slowly together and give it time. Keep evenings quiet and predictable.',
    tonight: ['Take 3 slow breaths together: smell the flower, blow out the candle.', 'Lights and volume down one hour before bed.', 'After a meltdown, sit close and say less.'] },
  mela: { name: 'Mela', real: 'Melatonin', group: 'Hormone', color: '#8C9EEB', job: 'whispers “night is coming” so the body gets sleepy', isNew: true,
    what: 'Mela is the body’s “night is coming” message. Bright light in the evening turns Mela down, so sleep shows up later. Corti wakes the body in the morning, Mela puts it to bed.',
    upL: 'Helps Mela', up: ['Dim, warm light in the evening', 'Screens off an hour before bed', 'The same bedtime', 'Daylight in the morning'],
    downL: 'Throws Mela off', down: ['Bright screens at night', 'A phone in the bedroom', 'Late bedtimes that change every night'],
    fix: 'Dim the house an hour before bed. Screens off, phones charge outside the bedroom. Get daylight in the morning.',
    tonight: ['Lights low and warm one hour before bed.', 'Phones charge in the kitchen tonight, yours too.', 'Same bedtime as yesterday.'] },
  greli: { name: 'Greli', real: 'Ghrelin', group: 'Hormone', color: '#C9E66E', job: 'rings the hunger bell from the stomach', isNew: true,
    what: 'Greli is the hunger signal from the stomach. When Greli rings and nobody answers, small problems feel huge. You know it as “hangry.”',
    upL: 'Helps Greli', up: ['Meals and snacks at steady times', 'A real snack right after school', 'Water through the day'],
    downL: 'Throws Greli off', down: ['A skipped lunch', 'Long gaps between meals', 'Only quick snacks, no real food'],
    fix: 'Answer Greli before you ask for anything. A real snack right after school, meals at steady times, and water.',
    tonight: ['Have a snack ready at the door after school.', 'Keep dinner at the same time as yesterday.', 'Pack a snack for the car ride home.'] },
  migo: { name: 'Migo', real: 'Amygdala', group: 'Brain part', color: '#E89AC7', job: 'the smoke detector that yells “danger!” in a flash', isNew: true,
    what: 'Migo spots danger and big feelings fast. Migo often yells before Fronti has time to think. That’s what most meltdowns look like from the inside.',
    upL: 'Calms Migo', up: ['A calm voice', 'Feeling safe and close', 'Naming the feeling', 'Enough sleep'],
    downL: 'Sets off Migo', down: ['Yelling back', 'Being tired or hungry', 'Surprises and rushing'],
    fix: 'Calm and close first. Name the feeling. Talk and solve only after Migo quiets down.',
    tonight: ['When it starts: get low, go quiet, say one short sentence.', 'Name it: “That felt really unfair.”', 'Talk about it later, when everyone is calm.'] },
  fronti: { name: 'Fronti', real: 'Prefrontal cortex', group: 'Brain part', color: '#F2C094', job: 'plans, waits and works the brakes, still under construction', isNew: true,
    what: 'Fronti plans, waits and stops impulses. It’s one of the last parts of the brain to finish building, through the teen years and into the twenties. So for now, kids borrow yours.',
    upL: 'Helps Fronti', up: ['Sleep', 'Practicing waiting in small steps', 'Games with rules', 'Short, clear routines'],
    downL: 'Throws Fronti off', down: ['Being tired', 'Too many choices', 'Stress and rushing'],
    fix: 'Expect brakes that are still being built. Keep rules short, practice waiting in small doses, and lend your calm when theirs runs out.',
    tonight: ['Play a waiting game: Freeze or Simon Says.', 'Give 2 choices, not 10.', 'Make a picture checklist for the bedtime routine.'] }
};
// Messengers, then hormones, then brain parts. New crew members join from the character map over time.
const ORDER = ['dopa', 'sero', 'endo', 'nora', 'gabi', 'toci', 'corti', 'mela', 'greli', 'teo', 'migo', 'fronti'];
window.CREW = CREW; window.CREW_ORDER = ORDER;

// fill any element with data-char="dopa" (optional data-mood)
$$('[data-char]').forEach(el => { el.innerHTML = svg(el.dataset.char, el.dataset.mood || 'main'); });

const roster = gi('roster'), card = gi('card');
if (roster) {
  roster.innerHTML = ORDER.map(k => `<button class="mate" role="tab" data-k="${k}" style="--c:${CREW[k].color}" aria-selected="false">${CREW[k].teen ? '<span class="teen">TEENS</span>' : CREW[k].isNew ? '<span class="teen new">NEW</span>' : ''}${svg(k)}<b>${CREW[k].name}</b><span>${CREW[k].real}</span></button>`).join('');
  const show = k => {
    const c = CREW[k];
    $$('.mate', roster).forEach(b => b.setAttribute('aria-selected', b.dataset.k === k));
    card.style.setProperty('--c', c.color);
    card.innerHTML = `<div class="card-top">${svg(k)}<div><span class="real">${c.group} · ${c.real}</span><h3>${c.name}</h3><div class="job">Job: ${c.job}</div></div></div>
      <p class="what">${c.what}</p>
      <div class="lists"><div class="up"><h4>${c.upL}</h4><ul>${c.up.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="down"><h4>${c.downL}</h4><ul>${c.down.map(x => `<li>${x}</li>`).join('')}</ul></div></div>
      <div class="fix"><h4>Back to calm</h4>${c.fix}</div>
      ${c.teen ? '<p class="teen-note">Only in our teen material (ages 13–17).</p>' : ''}`;
  };
  roster.addEventListener('click', e => { const b = e.target.closest('.mate'); if (b) show(b.dataset.k); });
  show('dopa');
}

/* ---------- villains: habits and things that get in the crew's way (never a person, a food or a body) ---------- */
const VILLAINS = [
  ['bedi', 'Bedi', 'Phone in bed', 'A phone in the bedroom is linked with worse sleep, even when nobody’s using it.', 'Phones sleep in the kitchen.', 'Mela'],
  ['glo', 'Glo', 'Bright light late at night', 'Bright evening light turns Mela down and pushes sleep later, most of all in little kids.', 'Lamps low and warm after dinner.', 'Mela'],
  ['lupi', 'Lupi', 'Autoplay and the endless feed', 'The next video starts by itself, so the ending never comes.', 'Autoplay off. Pick the episode before you press play.', 'Dopa, Fronti'],
  ['pingi', 'Pingi', 'Notifications', 'Every ping pulls the spotlight off homework and back to the screen.', 'Phone in another room until the task is done.', 'Nora'],
  ['lati', 'Lati', 'Late bedtimes that change every night', 'Irregular bedtimes are linked with more behavior struggles in kids.', 'Same bedtime every night, give or take an hour.', 'Sero, Mela'],
  ['kafi', 'Kafi', 'Caffeine: energy drinks, cola, iced tea', 'Caffeine can keep a body awake for hours. Pediatricians advise no energy drinks for kids.', 'No caffeine after lunch. Energy drinks never.', 'Mela']
];
if (gi('villains-grid')) gi('villains-grid').innerHTML = VILLAINS.map(([k, n, what, how, beat, who]) => `<article class="villain">
    <div class="v-art" data-k="${k}">${svg(k)}</div>
    <div><span class="v-tag">${what}</span><h3>${n}</h3><p>${how}</p>
    <p class="v-beat"><b>Beat it:</b> ${beat}</p><p class="v-who">Bothers ${who}</p></div></article>`).join('');
// Hover a villain to see it beaten.
$$('.v-art').forEach(el => {
  el.parentElement.addEventListener('mouseenter', () => { el.innerHTML = svg(el.dataset.k, 'tired'); });
  el.parentElement.addEventListener('mouseleave', () => { el.innerHTML = svg(el.dataset.k); });
});

/* ---------- ages & stages: what's normal now ---------- */
const AGES = [
  ['whyzi', 'Whyzi', '3–6', 'The “why?” years. Huge imagination, “I do it myself!”, and naps fading out between 3 and 5. Waiting and following rules are just starting to grow.', 'Routines, play, and practicing waiting in tiny steps.'],
  ['skuli', 'Skuli', '6–8', 'School, rules and friends. Some kids notice body smell or first hairs, an early hormone step called adrenarche.', 'Sleep, a calm after-school buffer, small jobs they can finish.'],
  ['ruli', 'Ruli', '8–10', 'Fairness, skills and hobbies. Logic works best on real, concrete things. In some girls, the first signs of puberty.', 'Let them get good at something. Talk about what’s fair.'],
  ['tweeni', 'Tweeni', '10–12', 'Puberty starts for most girls and many boys. Friends start to matter more than they used to.', 'Stay close, keep one-on-one time, phones out of the bedroom.'],
  ['sprouti', 'Sprouti', '12–14', 'Fast growth. The body clock shifts later, and rewards feel bigger than ever.', 'Protect sleep, expect later nights, talk side by side.'],
  ['seki', 'Seki', '14–17', 'Friends’ opinions peak. The brain trims what isn’t used and strengthens what is, and Fronti is still building.', 'Deals, not orders. Real wins. Sleep before screens.']
];
if (gi('ages-row')) gi('ages-row').innerHTML = AGES.map(([k, n, age, normal, focus]) => `<article class="age">
    ${svg(k, 'happy')}<span class="a-age">${age}</span><h3>${n}</h3><p>${normal}</p><p class="a-focus"><b>Focus:</b> ${focus}</p></article>`).join('');

/* ---------- forms ---------- */
function post(f) {
  const fd = new FormData(f);
  // Every email form lands in our database (app/api/signup), shown on /admin. The gift form is a checkout: never store the friend's email.
  if (f.dataset.form && f.dataset.form !== 'gift') {
    const details = {};
    fd.forEach((v, k) => { if (k !== 'email' && typeof v === 'string' && v) details[k] = k in details ? [].concat(details[k], v) : v; });
    let visitor = null, utm = null;
    try { visitor = localStorage.getItem('lbc-vid'); utm = JSON.parse(sessionStorage.getItem('lbc-origin') || 'null')?.utm_source || null; } catch (err) { /* storage blocked: still store the email */ }
    fetch('/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ form: f.dataset.form, email: fd.get('email'), page: location.pathname, details, visitor, utm_source: utm }) }).catch(() => {});
  }
  if (!W3F_KEY) return;
  fd.append('access_key', W3F_KEY);
  fd.append('subject', 'Little Brain Crew · ' + (f.dataset.form || 'signup'));
  fd.append('page', location.pathname);
  fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd }).catch(() => {});
}
function sent(f) {
  post(f);
  const ok = f.querySelector('.ok'), btn = f.querySelector('button[type=submit]') || f.querySelector('button');
  if (ok) ok.style.display = 'block';
  if (btn) btn.disabled = true;
  if (f.dataset.form === 'sticker-pack' && gi('st-dl')) gi('st-dl').classList.add('on');
  return false;
}
window.sent = sent;
$$('form[data-form]').forEach(f => { if (f.id !== 'gift-form') f.addEventListener('submit', e => { e.preventDefault(); sent(f); }); });

/* ---------- buying: checkout, upsells and downsells live in the Next.js app ---------- */
const PRODUCTS = { guide: { name: 'The Kid Brain Toolkit', price: 9 }, program: { name: 'The 30-Day Reset', price: 39 } };
// <button data-buy="guide"> anywhere opens /checkout/guide.
document.addEventListener('click', e => { const b = e.target.closest('[data-buy]'); if (b) { e.preventDefault(); location.href = '/checkout/' + b.dataset.buy; } });

/* ---------- Crew Club billing ---------- */
$$('[data-bill]').forEach(b => b.addEventListener('click', () => {
  $$('[data-bill]').forEach(x => x.setAttribute('aria-pressed', x === b));
  const y = b.dataset.bill === 'y';
  gi('club-price').innerHTML = y ? '$199<small>/year</small>' : '$19<small>/month</small>';
  gi('club-save').textContent = y ? 'about $16.58 a month, or $0.55 a day · save $29 a year' : 'about $0.63 a day';
  if (gi('club-cta')) gi('club-cta').href = '/checkout/club?plan=' + (y ? 'yearly' : 'monthly');
}));

/* ---------- shop: magnets on the fridge door ---------- */
if (gi('door')) gi('door').innerHTML = ORDER.map((k, i) => `<div class="mag" style="--c:${CREW[k].color};--rot:${[-6, 4, -3, 5, -4, 3][i]}deg">${svg(k)}</div>`).join('')
  + '<div class="hboard"><b>This week</b><span>Mon ⭐</span><span>Tue ⭐</span><span>Wed ⭐</span><span>Thu ☐</span><span>Fri ☐</span></div>';

/* ---------- gift ---------- */
if (gi('g-item')) {
  const DEFAULT_MSG = 'You’re doing better than you think. This is for the 2 a.m. googling.';
  const upd = () => {
    gi('g-to-out').textContent = gi('g-to').value.trim() || 'Your friend';
    gi('g-from-out').textContent = gi('g-from').value.trim() || 'you';
    gi('g-msg-out').textContent = gi('g-msg').value.trim() || DEFAULT_MSG;
    gi('g-item-out').textContent = PRODUCTS[gi('g-item').value].name;
  };
  ['g-to', 'g-from', 'g-msg', 'g-item'].forEach(id => gi(id).addEventListener('input', upd));
  upd();
  gi('g-chars').innerHTML = ['dopa', 'sero', 'endo', 'toci', 'corti'].map(k => svg(k, 'happy')).join('');
  const t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  gi('g-date').min = gi('g-date').value = t.toISOString().slice(0, 10);
  gi('gift-form').addEventListener('submit', e => {
    e.preventDefault(); post(e.target);
    const g = Object.fromEntries(new FormData(e.target));
    try { sessionStorage.setItem('vlc-gift', JSON.stringify(g)); } catch (err) { /* checkout still works without the card details */ }
    location.href = '/checkout/' + g.gift_item + '?gift=1';
  });
}

/* ---------- B2B tabs ---------- */
const PANES = {
  school: { ico: 'dopa', title: 'A class pack for the crew', form: 'Get the class pack details', size: 'How many kids?',
    text: 'Help kids understand their own focus, mood and energy, with characters they remember.',
    list: ['Posters and crew cards for the classroom', 'Ready-to-use lessons for teachers', 'A parent evening, online or in person', 'Licenses for a class, a school or a kindergarten'] },
  work: { ico: 'corti', title: 'A benefit working parents really use', form: 'Get team prices', size: 'How many parents on your team?',
    text: 'Calmer evenings at home mean calmer days at work. Give the parents on your team the tools.',
    list: ['The 30-day reset for every parent on your team', 'A lunch talk with the crew', 'Team prices and one invoice'] },
  clinic: { ico: 'toci', title: 'A free poster for your waiting room', form: 'Ask for the free poster', size: 'What kind of practice?',
    text: 'Give parents something useful to do while they wait: a QR code to free tips for hard moments, with a clear note to ask their doctor about any worry.',
    list: ['Free printable poster with a QR code', 'Leaflets for parents', 'Habits only: no products, no medical claims'] },
  partner: { ico: 'endo', title: 'Share the crew, earn a share', form: 'Apply to be a partner', size: 'Where is your audience? (link)',
    text: 'Parent bloggers, coaches, teachers and creators: share the crew and earn money on every sale from your link.',
    list: ['Your own link', 'A share of every sale', 'Ready-made pictures and short videos'] }
};
if (gi('pane')) {
  const showPane = t => {
    const p = PANES[t];
    $$('.tab').forEach(b => b.setAttribute('aria-selected', b.dataset.t === t));
    gi('pane').innerHTML = `${svg(p.ico, 'happy')}<h3>${p.title}</h3><p>${p.text}</p><ul>${p.list.map(x => `<li>${x}</li>`).join('')}</ul>`;
    gi('b2b-type').value = t; gi('b2b-size').placeholder = p.size; gi('b2b-title').textContent = p.form;
  };
  $$('.tab').forEach(b => b.addEventListener('click', () => showPane(b.dataset.t)));
  showPane('school');
}

/* ---------- mom / dad switch (every page; remembered between pages) ---------- */
const lead = gi('lead');
const LEAD = {
  mom: 'Meltdowns. Bad sleep. “I’m bored.” The 5 p.m. hangry explosion. A teen who stopped talking. It looks like a dozen different problems. It’s the same few messengers, hormones and brain parts, plus a handful of habits getting in their way. We turned the science into a cartoon crew, so you can see what’s going on and know what to try tonight. No pills. No guesswork. No 300-page books.',
  dad: 'Screen time that ends in a war. Bedtimes that drag past 10. A teen who only says “fine.” It’s not that you’re too soft or too strict. Behind every one of those moments is a small crew of messengers, hormones and brain parts, and a few villains getting in their way. Learn the code, and you know what to do tonight. Habits only, no pills.'
};
const setWho = who => {
  $$('.toggle button').forEach(x => x.setAttribute('aria-pressed', x.dataset.who === who));
  if (lead) lead.textContent = LEAD[who];
  document.documentElement.classList.toggle('dad', who === 'dad');
  const tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.content = who === 'dad' ? '#3457D5' : '#FF5A36';
};
$$('.toggle button').forEach(b => b.addEventListener('click', () => {
  setWho(b.dataset.who);
  try { localStorage.setItem('vlc-who', b.dataset.who); } catch (err) { /* private mode: the switch just isn't remembered */ }
}));
try { if (localStorage.getItem('vlc-who') === 'dad') setWho('dad'); } catch (err) { /* ignore */ }

/* ---------- countdown ---------- */
const pad = n => String(n).padStart(2, '0');
function tick() {
  let s = Math.max(0, (OPEN - new Date()) / 1000);
  const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60);
  [['d', pad(d)], ['h', pad(h)], ['m', pad(m)], ['bar-days', d], ['d2', d]].forEach(([id, v]) => { if (gi(id)) gi(id).textContent = v; });
}
tick(); setInterval(tick, 30000);
$$('.check').forEach(c => c.addEventListener('click', () => c.classList.toggle('on')));

/* ---------- RedNote-style tip cards ---------- */
const TIPS = [
  ['dopa', 'Tears when the tablet turns off?', 'Warn at 5 minutes and at 1 minute. The surprise ending is what hurts.'],
  ['corti', 'Bedtime turns into a fight?', 'Screens off 1 hour before bed. Then the same 3 steps: bath, book, lights out.'],
  ['sero', 'Grumpy every single morning?', 'Open the curtains right away. Get 10 minutes of daylight before school.'],
  ['endo', 'Bouncing off the walls at 9 p.m.?', 'Move the wild play to the afternoon. A 5-minute dance party counts.'],
  ['toci', 'They don’t listen when you talk?', 'Kneel down, look in their eyes, then say one short sentence.'],
  ['teo', 'Teen up all night on the phone?', 'Make a deal, not a rule: phones charge outside the bedroom.']
];
window.CREW_TIPS = TIPS;
if (gi('tips-row')) gi('tips-row').innerHTML = TIPS.map(([k, h, t]) => `<article class="tip" style="--ct:var(--${k}-t)"><span class="t-tag">${CREW[k].name} tip</span><h3>${h}</h3>${svg(k, k === 'corti' ? 'main' : 'happy')}<p>${t}</p></article>`).join('');
$$('[data-faces]').forEach(el => { el.innerHTML = ORDER.map(k => svg(k, 'happy')).join(''); });

/* ---------- reveal once + scroll progress in the section's character color ---------- */
if ('IntersectionObserver' in window) {
  const rv = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); } }), { threshold: .2 });
  $$('[data-reveal], .draw').forEach(el => rv.observe(el));
  const bar = gi('progress');
  if (bar) {
    const secs = $$('[data-c]');
    const sio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) bar.style.setProperty('--pc', en.target.dataset.c); }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(el => sio.observe(el));
    const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
} else $$('[data-reveal], .draw').forEach(el => el.classList.add('in'));

/* ---------- sticky "See the plans" bar (phone only) ---------- */
const sticky = gi('sticky');
if (sticky) {
  document.body.classList.add('has-sticky');
  const hideWhen = ['plans', 'site-foot'].map(gi).filter(Boolean);
  const vis = new Map();
  let typing = false;
  const update = () => {
    const pastFirst = scrollY > innerHeight * 0.85;
    const blocked = [...vis.values()].some(Boolean) || document.body.classList.contains('modal-open') || typing;
    sticky.classList.toggle('show', pastFirst && !blocked);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { es.forEach(en => vis.set(en.target, en.isIntersecting)); update(); });
    hideWhen.forEach(el => io.observe(el));
  }
  document.addEventListener('focusin', e => { if (e.target.matches('input,textarea,select')) { typing = true; update(); } });
  document.addEventListener('focusout', () => { typing = false; setTimeout(update, 50); });
  new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  addEventListener('scroll', update, { passive: true });
  update();
}
})();
