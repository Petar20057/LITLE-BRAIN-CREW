/* "Ask the Crew" · a habits-only helper. Today it runs on simple rules, in the browser.
   LATER (real AI): replace the body of crewReply() with a fetch() to your own server, e.g.
     const r = await fetch('/api/ask', {method:'POST', body: JSON.stringify(state)}); return await r.json();
   The server keeps the AI key secret. It must return the same shape as below and keep the same rules:
   habits only, no diagnosis, no supplements, and the safety check first. */
(function () {
  const log = document.getElementById('chat-log'), form = document.getElementById('chat-form');
  if (!log || !form) return;
  const input = form.querySelector('input');
  const DISC = 'Educational content only. If something worries you, talk to your pediatrician.';

  /* ---------- safety first: serious words stop the habit advice ---------- */
  // '*' = also match longer words (injur* = injury, injured). Others match whole words only.
  const SERIOUS = [
    'pain', 'hurts', 'hurting', 'hurt himself', 'hurt herself', 'hurt themselves', 'injur*', 'bleed*', 'blood', 'broken bone', 'head injury', 'fever', 'seizure*', 'faint*', 'unconscious', 'can’t breathe', "can't breathe", 'not breathing',
    'self-harm', 'self harm', 'cuts himself', 'cuts herself', 'suicid*', 'kill', 'killing myself', 'want to die', 'wants to die', 'die',
    'not eating', 'stopped eating', 'won’t eat', "won't eat", 'refuses to eat', 'starving', 'losing weight', 'lost weight', 'throwing up', 'vomit*',
    'violence', 'violent', 'hits me', 'hitting', 'abuse*', 'bruise*', 'weapon', 'knife', 'gun', 'danger', 'emergency', 'overdos*', 'poison*', 'swallowed'
  ];
  const SERIOUS_RE = new RegExp(SERIOUS.map(w => '\\b' + w.replace('*', '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (w.endsWith('*') ? '' : '\\b')).join('|'), 'i');
  const isSerious = t => SERIOUS_RE.test(t);

  /* ---------- topics ---------- */
  const TOPICS = {
    screens: { label: 'Screens', when: ['When it’s time to stop', 'Before bed', 'All day, they keep asking'] },
    sleep: { label: 'Sleep', when: ['Falling asleep', 'Waking up at night', 'Hard to wake up'] },
    mood: { label: 'Mood and anger', when: ['When they don’t get their way', 'After school', 'Out of nowhere'] },
    focus: { label: 'Focus and tasks', when: ['Homework', 'Chores', 'Listening when I talk'] },
    energy: { label: 'Energy and moving', when: ['They sit a lot', 'Too much energy at bedtime', 'They seem tired all day'] },
    teen: { label: 'Teen confidence', when: ['Low confidence', 'Up late on the phone', 'Always tired'], teenOnly: true }
  };
  const KEYS = {
    screens: ['screen', 'tablet', 'ipad', 'phone', 'game', 'youtube', 'tiktok', 'tv', 'video', 'switch', 'console'],
    sleep: ['sleep', 'bed', 'night', 'nap', 'wake', 'asleep', 'nightmare'],
    mood: ['angry', 'anger', 'tantrum', 'meltdown', 'cry', 'crying', 'mood', 'yell', 'scream', 'upset', 'grumpy', 'moody'],
    focus: ['focus', 'homework', 'school', 'attention', 'concentrat', 'distract', 'listen', 'chore', 'clean'],
    energy: ['energy', 'lazy', 'sit', 'sitting', 'move', 'sport', 'active', 'bored', 'hyper', 'tired'],
    teen: ['teen', 'confiden', 'puberty', 'shy', 'self-esteem', 'self esteem']
  };
  const AGES = ['3–5 years', '6–12 years', '13–17 years'];
  // Preschool wording: kids under 6 have no homework, so the Focus topic swaps in tasks and clean-up.
  const WHEN_YOUNG = { focus: ['Getting started on a task', 'Chores and clean-up', 'Listening when I talk'] };
  const A_YOUNG = {
    focus: [
      ['dopa', 'A big job feels too big to start. Cut it into one small step with a clear finish line, so it gives a win.', 'Pick one tiny job tonight, like putting the blocks in the bin. Cheer when it is done.', 'program']
    ]
  };
  const AGE_TIP = ['For little ones, keep your words short and do it together.', 'Kids this age like having a say, so let them help plan it.', 'Teens push back on orders, so make it a deal, not a rule.'];

  // answers[topic][whenIndex] = [crew, text, tryTonight, cta]
  const A = {
    screens: [
      ['dopa', 'This is very common. Games and videos give fast, easy rewards. When they stop all at once, the brain protests. Warnings make the end feel less like a shock.', 'Warn at 5 minutes and at 1 minute. Then go straight to a small task together.', 'plans'],
      ['corti', 'Screens late in the evening keep the mind busy when it should slow down. A calm last hour helps the whole house settle.', 'Turn screens off one hour before bed tonight. Read, draw or talk instead.', 'program'],
      ['dopa', 'When screens are always on offer, everything else feels boring next to them. Clear screen times help the asking stop, because the answer is already known.', 'Pick two screen times for tomorrow. Write them where your kid can see them.', 'plans']
    ],
    sleep: [
      ['corti', 'A busy or bright evening can keep the stress alarm on. Kids often settle faster when the hour before bed is calm and the same every night.', 'Do the same 3 steps tonight: bath, book, lights out.', 'program'],
      ['toci', 'Night waking has many causes, so if it happens a lot, ask your pediatrician. A calm, close bedtime can help kids feel safe.', 'Spend 10 quiet minutes together before lights out. No phones.', 'plans'],
      ['sero', 'Late bedtimes and dark mornings make waking up hard. Sero likes the same sleep times and bright mornings.', 'Open the curtains right away tomorrow and get 10 minutes outside.', 'program']
    ],
    mood: [
      ['corti', 'Big feelings over a “no” are normal, especially for younger kids. Stay calm and keep it short. Name the feeling, keep the limit, and breathe slowly together.', 'Try: “You’re really mad. That’s okay. The answer is still no.” Then take 3 slow breaths together.', 'plans'],
      ['endo', 'Many kids hold it together all day and let it out at home. Moving and a snack before questions can help them reset.', 'After school today: snack first, then 10 minutes of wild play, then talk.', 'program'],
      ['sero', 'When moods swing for no clear reason, look at the basics first: sleep, meals and time outside. Tired, hungry kids feel everything bigger. If big moods happen a lot or hurt anyone, talk to your pediatrician.', 'Keep dinner and bedtime at the same time as yesterday.', 'plans']
    ],
    focus: [
      ['dopa', 'A big job feels too big to start. Cut it into small pieces with a clear finish line, so each one gives a win. Put phones away and add a short movement break.', 'Split tonight’s homework into 3 small parts. Cheer after each one.', 'program'],
      ['dopa', 'Kids start faster when the job is small and clear. “Tidy your room” is too big. “Put all the cars in the box” is doable.', 'Give one tiny job with a clear end tonight. Then cheer.', 'plans'],
      ['toci', 'Kids listen better when they feel close first. Get down to their level, look in their eyes, then say one short thing.', 'Before you ask, kneel down, make eye contact and say one short sentence.', 'plans']
    ],
    energy: [
      ['endo', 'Kids feel better when they move every day. It doesn’t have to be a sport. It just has to be fun and make them out of breath.', 'Have a 5-minute kitchen dance party tonight.', 'program'],
      ['endo', 'A burst of energy at night can mean they didn’t move enough earlier. Move the wild play to the afternoon, then keep the evening calm.', 'Plan 20 minutes of running or play outside tomorrow afternoon.', 'plans'],
      ['sero', 'Feeling tired all day often comes back to sleep times, meals and daylight. Check those first. If the tiredness goes on for weeks, talk to your pediatrician.', 'Set a bedtime and a wake-up time, and keep them all week.', 'plans']
    ],
    teen: [
      ['teo', 'Confidence grows from doing hard things and getting better at them. Sport, strength games or any skill they can practice can help. Praise the effort, not just the result.', 'Ask what they’d like to get better at. Help them plan one practice this week.', 'program'],
      ['teo', 'Teens need a lot of sleep, and phones in bed take it away. A deal works better than an order.', 'Make a deal tonight: phones charge outside the bedroom, at a time you choose together.', 'plans'],
      ['teo', 'Teen tiredness is often about short sleep. Late phones, early school and junk snacks add up. Protect sleep first.', 'Agree on a bedtime that gives a full night’s sleep, even on school nights.', 'plans']
    ]
  };

  const URGENT = 'This sounds serious, so I won’t give habit tips here. Please talk to your pediatrician today. If your child is hurt or in danger right now, call your local emergency number.';

  /* ---------- the one function to swap for real AI later ---------- */
  async function crewReply(state) {
    if (state.text && isSerious(state.text)) return { kind: 'urgent', text: URGENT };
    if (state.text && !state.topic) {
      const t = state.text.toLowerCase();
      const hit = Object.keys(KEYS).find(k => KEYS[k].some(w => t.includes(w)));
      if (!hit) return { kind: 'topics', text: 'I can help with everyday habits. Pick the closest topic:' };
      state.topic = hit;
    }
    if (!state.topic) return { kind: 'topics', text: 'Hi! What’s hard at your house right now?' };
    const T = TOPICS[state.topic];
    if (state.age == null && !T.teenOnly) return { kind: 'ask', field: 'age', text: 'How old is your child?', options: AGES };
    if (state.when == null) return { kind: 'ask', field: 'when', text: 'When does it happen most?', options: (state.age === 0 && WHEN_YOUNG[state.topic]) || T.when };
    const young = state.age === 0 && A_YOUNG[state.topic] && A_YOUNG[state.topic][state.when];
    const [crew, text, tryTonight, cta] = young || A[state.topic][state.when];
    const ageTip = T.teenOnly ? '' : ' ' + AGE_TIP[state.age];
    return { kind: 'answer', crew, text: text + ageTip, tryTonight, cta };
  }

  /* ---------- chat UI ---------- */
  let state = {};
  const scroll = () => { log.scrollTop = log.scrollHeight; };
  const bot = (html, cls = '') => { log.insertAdjacentHTML('beforeend', `<div class="msg-b ${cls}">${html}</div>`); scroll(); };
  const user = t => { const d = document.createElement('div'); d.className = 'msg-u'; d.textContent = t; log.appendChild(d); scroll(); };
  const chips = (items, attr) => `<div class="chips" style="margin-top:8px">${items.map(([v, l]) => `<button type="button" class="chip" ${attr}="${v}">${l}</button>`).join('')}</div>`;
  const topicChips = () => chips(Object.entries(TOPICS).map(([k, t]) => [k, t.label]), 'data-topic');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  async function step() {
    const r = await crewReply(state);
    state.text = null;
    if (r.kind === 'urgent') { bot(`<b>Please don’t wait.</b> ${r.text}`, 'urgent'); state = {}; bot(`Anything else about everyday habits? ${topicChips()}`); return; }
    if (r.kind === 'topics') { bot(`${r.text} ${topicChips()}`); return; }
    if (r.kind === 'ask') { bot(`${r.text} ${chips(r.options.map((o, i) => [i, o]), 'data-' + r.field)}`); return; }
    const c = window.CREW[r.crew];
    const cta = r.cta === 'program'
      ? `<a class="btn btn-main" href="/pricing">See the 30-Day Reset</a><button class="btn" type="button" data-again>Ask something else</button>`
      : `<a class="btn btn-main" href="/#plans">See the plans</a><button class="btn" type="button" data-again>Ask something else</button>`;
    bot(`<div class="who">${svg(r.crew, 'happy')}<span>${c.name} is on this one</span></div>${r.text}<div class="try"><b>Try tonight:</b> ${r.tryTonight}</div><div class="acts">${cta}</div><span class="disc">${DISC}</span>`);
    state = {};
  }

  log.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.again !== undefined) { bot(`Sure. What else? ${topicChips()}`); return; }
    if (b.dataset.topic) { state = { topic: b.dataset.topic }; user(b.textContent); step(); return; }
    if (b.dataset.age !== undefined) { state.age = +b.dataset.age; user(b.textContent); step(); return; }
    if (b.dataset.when !== undefined) { state.when = +b.dataset.when; user(b.textContent); step(); }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const t = input.value.trim(); if (!t) return;
    input.value = '';
    user(t);
    state = { text: t };
    step();
  });

  /* ---------- 8-second demo, plays once when the chat comes on screen ---------- */
  const DEMO = [
    ['u', 'Bedtime is a fight every night.'],
    ['b', '<div class="who">' + svg('corti', 'happy') + '<span>Corti is on this one</span></div>That sounds like Corti’s stress alarm. A calm, same-every-night last hour helps it switch off.<div class="try"><b>Try tonight:</b> screens off one hour before bed, then bath, book, lights out.</div>']
  ];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let played = false;
  function playDemo() {
    if (played) return; played = true;
    log.innerHTML = '<span class="demo-tag">Example chat</span>';
    const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
    (async () => {
      await wait(500); user(DEMO[0][1]);
      await wait(700);
      if (!reduce) { log.insertAdjacentHTML('beforeend', '<div class="typing" aria-hidden="true"><i></i><i></i><i></i></div>'); scroll(); }
      await wait(1800);
      const t = log.querySelector('.typing'); if (t) t.remove();
      bot(DEMO[1][1]);
      await wait(2600);
      log.insertAdjacentHTML('beforeend', '<span class="demo-tag">Your turn</span>');
      bot(`Hi! I’m Toci. What’s hard at your house right now? ${topicChips()}`);
    })();
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { playDemo(); io.disconnect(); } }, { threshold: .4 });
    io.observe(log);
  } else playDemo();
  input.addEventListener('focus', playDemo);
})();
