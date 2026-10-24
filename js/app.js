// App shell: routing, TOC, progress, lesson pages, glossary.
(function () {
  const { t, lang } = window.I18N;
  // Pick the course for the current language; fall back to English per module if a translation is missing.
  const C = (() => {
    const en = window.COURSE, tr = lang !== 'en' && window['COURSE_' + lang.toUpperCase()];
    if (!tr) return en;
    return { ...en, ...tr, modules: en.modules.map((m) => tr.modules.find((x) => x.id === m.id) || m) };
  })();
  const { Player, buildTimeline, fmt, plain } = window.CoursePlayer;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const $ = (s, r = document) => r.querySelector(s);

  // ---------- flatten ----------
  C.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
  const lessons = [];
  C.modules.forEach((m, mi) => m.lessons.forEach((l, li) => {
    l.module = m; l.mi = mi; l.li = li; l.n = lessons.length;
    l.duration = buildTimeline(l).total;
    lessons.push(l);
  }));
  const byId = Object.fromEntries(lessons.map((l) => [l.id, l]));

  // ---------- progress ----------
  const KEY = 'r4r-progress-v1';
  let P;
  try { P = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { P = {}; }
  P.lessons = P.lessons || {};
  const save = () => localStorage.setItem(KEY, JSON.stringify(P));
  const lp = (id) => (P.lessons[id] = P.lessons[id] || {});
  const status = (l) => {
    const s = P.lessons[l.id] || {};
    const quizOk = !l.quiz || !l.quiz.length || (s.quiz || 0) >= 70;
    if (s.watched && quizOk) return 'done';
    if (s.watched || s.pos > 5 || s.quiz != null) return 'started';
    return 'new';
  };
  const overall = () => Math.round((lessons.filter((l) => status(l) === 'done').length / lessons.length) * 100);
  const xp = () => lessons.reduce((a, l) => {
    const s = P.lessons[l.id] || {};
    return a + (s.watched ? 50 : 0) + Math.round((s.quiz || 0) / 2) + Object.values(s.practice || {}).filter(Boolean).length * 25 + (s.cp || 0) * 5;
  }, 0);

  // ---------- donations ----------
  const DONATE_URL = 'https://www.paypal.com/donate/?hosted_button_id=8BKEMESVG3XS2';
  const donateBtn = (cls = 'btn donate') => `<a class="${cls}" href="${DONATE_URL}" target="_blank" rel="noopener noreferrer">♥ ${t('donateBtn')}</a>`;
  // "Enjoying the course?" prompt shown when a module (or the whole course) is finished
  const donatePrompt = (title, cls = '') => `<div class="donate-prompt ${cls}"><div><b>${title}</b><span>${t('donateAsk')}</span></div>${donateBtn()}</div>`;

  // ---------- confetti ----------
  window.confetti = function (anchor) {
    const rc = (anchor || document.body).getBoundingClientRect();
    const colors = ['#f74c00', '#cc342d', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff'];
    for (let i = 0; i < 70; i++) {
      const p = h('i', 'confetti');
      p.style.left = rc.left + rc.width / 2 + 'px'; p.style.top = rc.top + 30 + 'px';
      p.style.background = colors[i % colors.length];
      const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
      p.style.setProperty('--dx', Math.cos(a) * v + 'px'); p.style.setProperty('--dy', Math.sin(a) * v - 160 + 'px');
      p.style.setProperty('--r', Math.random() * 720 + 'deg');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }
  };

  // ---------- sidebar / TOC ----------
  const sidebar = $('#toc');
  function renderTOC() {
    const cur = currentLessonId();
    sidebar.innerHTML = '';
    const top = h('div', 'toc-top');
    top.innerHTML = `<a href="#/" class="brand"><span class="logo">◆→🦀</span><span>${C.title}</span></a>
      <div class="prog"><div class="pbar"><i style="width:${overall()}%"></i></div><div class="pmeta"><span>${t('complete', { n: overall() })}</span><span>⚡ ${xp()} XP</span></div></div>
      <input class="tsearch" placeholder="${t('searchLessons')}" />`;
    sidebar.appendChild(top);
    const list = h('nav', 'toc-list');
    C.modules.forEach((m, mi) => {
      const done = m.lessons.filter((l) => status(l) === 'done').length;
      const mod = h('div', `tmod ${m.lessons.some((l) => l.id === cur) || !cur ? 'open' : ''}`);
      const mh = h('button', 'tmh', `<span class="mn">${mi + 1}</span><span class="mt">${m.title}</span><span class="mc">${done}/${m.lessons.length}</span><span class="chev">▾</span>`);
      mh.onclick = () => mod.classList.toggle('open');
      mod.appendChild(mh);
      const ul = h('div', 'tls');
      m.lessons.forEach((l) => {
        const st = status(l);
        const a = h('a', `tl ${st} ${l.id === cur ? 'cur' : ''}`, `<span class="st">${st === 'done' ? '✓' : st === 'started' ? '◐' : '○'}</span><span class="ltitle">${l.title}</span><span class="du">${fmt(l.duration)}</span>`);
        a.href = `#/lesson/${l.id}`;
        a.dataset.search = (l.title + ' ' + m.title + ' ' + (l.summary?.points || []).join(' ') + ' ' + (l.tags || []).join(' ')).toLowerCase();
        ul.appendChild(a);
      });
      mod.appendChild(ul);
      list.appendChild(mod);
    });
    const extra = h('div', 'tmod open extra');
    extra.innerHTML = `<div class="tls"><a class="tl" href="#/glossary"><span class="st">📖</span><span class="ltitle">${t('rosettaTitle')}</span></a><a class="tl" href="#/shortcuts"><span class="st">⌨️</span><span class="ltitle">${t('shortcutsTitle')}</span></a><a class="tl" href="${DONATE_URL}" target="_blank" rel="noopener noreferrer"><span class="st donate-link">♥</span><span class="ltitle">${t('donateShort')} <span class="donate-link">${t('donateBtn')}</span></span></a></div>`;
    list.appendChild(extra);
    sidebar.appendChild(list);
    const search = $('.tsearch', sidebar);
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase().trim();
      sidebar.querySelectorAll('.tmod').forEach((m) => {
        let any = false;
        m.querySelectorAll('.tl').forEach((a) => { const ok = !q || (a.dataset.search || a.textContent.toLowerCase()).includes(q); a.style.display = ok ? '' : 'none'; any = any || ok; });
        m.style.display = any ? '' : 'none';
        if (q) m.classList.add('open');
      });
    });
  }

  // ---------- routing ----------
  const main = $('#main');
  let player = null;
  const currentLessonId = () => (location.hash.match(/^#\/lesson\/([\w-]+)/) || [])[1];

  function route() {
    if (player) { player.destroy(); player = null; }
    document.body.classList.remove('toc-open');
    const hash = location.hash || '#/';
    main.scrollTop = 0; window.scrollTo(0, 0);
    const m = hash.match(/^#\/lesson\/([\w-]+)(?:\/(\w+))?/);
    if (m && byId[m[1]]) renderLesson(byId[m[1]], m[2]);
    else if (hash.startsWith('#/glossary')) renderGlossary();
    else if (hash.startsWith('#/shortcuts')) renderShortcuts();
    else renderHome();
    renderTOC();
  }

  // ---------- home ----------
  function renderHome() {
    const next = lessons.find((l) => status(l) !== 'done') || lessons[0];
    const totalDur = lessons.reduce((a, l) => a + l.duration, 0);
    const totalQ = lessons.reduce((a, l) => a + (l.quiz || []).length, 0);
    main.innerHTML = '';
    const hero = h('section', 'hero');
    hero.innerHTML = `
      <div class="hero-bg"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
      <div class="hero-in">
        <div class="eyebrow">${t('eyebrow')}</div>
        <h1>${C.title}</h1>
        <p class="lede">${C.tagline}</p>
        <div class="hero-cta">
          <a class="btn big" href="#/lesson/${next.id}">${overall() ? t('continue', { t: next.title }) : t('start')}</a>
          <a class="btn ghost big" href="#/glossary">${t('cheatsheet')}</a>
        </div>
        <div class="stats">
          <div><b>${C.modules.length}</b><span>${t('modules')}</span></div>
          <div><b>${lessons.length}</b><span>${t('lessons')}</span></div>
          <div><b>${Math.round(totalDur / 60)} min</b><span>${t('minVideo')}</span></div>
          <div><b>${totalQ}</b><span>${t('quizQuestions')}</span></div>
          <div><b>${overall()}%</b><span>${t('completeLbl')}</span></div>
        </div>
      </div>
      <div class="hero-art">
        <pre class="ha ruby">${HL.highlight('class User < ApplicationRecord\n  def admin?\n    role == "admin"\n  end\nend', 'ruby')}</pre>
        <div class="ha-arrow">⟶</div>
        <pre class="ha rust">${HL.highlight('struct User { role: Role }\n\nimpl User {\n    fn is_admin(&self) -> bool {\n        matches!(self.role, Role::Admin)\n    }\n}', 'rust')}</pre>
      </div>`;
    main.appendChild(hero);
    if (overall() === 100) main.appendChild(h('section', 'course-done', donatePrompt(t('courseDone'), 'big')));

    const how = h('section', 'how');
    how.innerHTML = `<h2>${t('howTitle')}</h2><div class="how-grid">${t('how').map(([i, b, p]) => `<div><span>${i}</span><b>${b}</b><p>${p}</p></div>`).join('')}</div>`;
    main.appendChild(how);

    const mods = h('section', 'mods');
    mods.innerHTML = `<h2>${t('curriculum')}</h2>`;
    C.modules.forEach((m, mi) => {
      const card = h('div', 'mod');
      const done = m.lessons.filter((l) => status(l) === 'done').length;
      card.innerHTML = `<div class="modh"><span class="mnum">${t('module', { n: mi + 1 })}</span><h3>${m.title}</h3><p>${m.blurb || ''}</p><div class="mp"><i style="width:${(done / m.lessons.length) * 100}%"></i></div></div>`;
      const ul = h('div', 'modl');
      m.lessons.forEach((l) => {
        const st = status(l);
        ul.insertAdjacentHTML('beforeend', `<a href="#/lesson/${l.id}" class="ml ${st}"><span class="st">${st === 'done' ? '✓' : st === 'started' ? '◐' : l.n + 1}</span><span class="t">${l.title}</span><span class="d">${fmt(l.duration)}</span></a>`);
      });
      card.appendChild(ul);
      if (done === m.lessons.length) card.appendChild(h('div', 'mod-done', donatePrompt(t('moduleDone', { n: mi + 1 }))));
      mods.appendChild(card);
    });
    main.appendChild(mods);
    const ps = h('section', 'persist');
    ps.innerHTML = `<div><b>${t('persistTitle')}</b><p class="muted">${t('persistBody')}</p></div>
      <div class="pbtns"><button class="btn ghost" data-a="reset">${t('reset')}</button></div>`;
    ps.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'reset' && confirm(t('resetConfirm'))) { Object.keys(localStorage).filter((k) => k.startsWith('r4r-') && !/^r4r-(lang|theme|voice|rate|cc)$/.test(k)).forEach((k) => localStorage.removeItem(k)); location.reload(); }
    });
    main.appendChild(ps);
  }

  // ---------- lesson ----------
  function renderLesson(l, tab) {
    const s = lp(l.id);
    main.innerHTML = '';
    const prev = lessons[l.n - 1], next = lessons[l.n + 1];
    const head = h('header', 'lhead');
    head.innerHTML = `<div class="crumbs"><a href="#/">${t('course')}</a> / <span>${t('module', { n: l.mi + 1 })}: ${l.module.title}</span></div>
      <h1><span class="lnum">${l.n + 1}</span>${l.title}</h1>
      ${l.subtitle ? `<p class="lsub">${l.subtitle}</p>` : ''}`;
    main.appendChild(head);

    const pwrap = h('div', 'pwrap');
    main.appendChild(pwrap);
    const endCard = h('div', 'endcard');
    let transcript = null, follow = null, activeTab = tab || 'summary';
    player = window.__player = new Player(pwrap, l, {
      startAt: s.pos && !s.watched ? s.pos : 0,
      onProgress: (t, total) => { s.pos = t; save(); if (t < total - 0.05) endCard.classList.remove('show'); },
      onEnd: () => {
        const first = !s.watched;
        s.watched = true; s.pos = 0; save(); renderTOC();
        updateDonateSlot();
        endCard.classList.add('show');
        if (first) window.confetti(pwrap);
      },
      onEnded: () => { updateDonateSlot(); endCard.classList.add('show'); },
      onCheckpoint: (sc, ok) => { if (ok) { s.cp = (s.cp || 0) + 1; save(); } },
      onBeat: (si, bi) => {
        if (!transcript) return;
        const cur = transcript.querySelector('.tb.cur'); if (cur) cur.classList.remove('cur');
        const e = transcript.querySelector(`.tb[data-s="${si}"][data-b="${bi}"]`);
        if (e) { e.classList.add('cur'); if (activeTab === 'transcript' && follow.checked) e.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      },
    });
    endCard.innerHTML = `<div class="ec"><div class="ect">${t('videoComplete')}</div><div class="ecb">
      <button class="btn" data-go="quiz">${t('takeQuiz')}</button>
      ${(l.practice || []).length ? `<button class="btn" data-go="practice">${t('goPractice')}</button>` : ''}
      <button class="btn ghost" data-go="summary">${t('readSummary')}</button>
      ${next ? `<a class="btn ghost" href="#/lesson/${next.id}">${t('nextLesson')}</a>` : ''}
      <button class="btn ghost" data-go="replay">${t('replay')}</button></div>
      <div class="ec-donate-slot"></div></div>`;
    // "Module complete" / "course complete" only when every OTHER lesson in it is really done
    // (video watched and quiz passed). The lesson on screen only needs its video, which just ended.
    // Evaluated each time the card is shown, because progress changes while the page is open.
    const updateDonateSlot = () => {
      const othersDone = (list) => list.every((x) => x === l || status(x) === 'done');
      let html = '';
      if (l.li === l.module.lessons.length - 1 && othersDone(l.module.lessons)) {
        html = donatePrompt(!next && othersDone(lessons) ? t('courseDone') : t('moduleDone', { n: l.mi + 1 }), 'ec-donate');
      }
      endCard.querySelector('.ec-donate-slot').innerHTML = html;
    };
    endCard.addEventListener('click', (e) => {
      e.stopPropagation(); // clicks on the end card must never reach the video (which would toggle play)
      const g = e.target.closest('[data-go]'); if (!g) return;
      endCard.classList.remove('show');
      if (g.dataset.go === 'replay') { player.seek(0); player.play(); } else { setTab(g.dataset.go); tabsEl.scrollIntoView({ behavior: 'smooth' }); }
    });
    pwrap.querySelector('.viewport').appendChild(endCard);

    // tabs
    const tabsEl = h('div', 'tabs');
    const panes = h('div', 'panes');
    const T = [['summary', t('tabSummary')], ['quiz', `${t('tabQuiz')}${s.quiz != null ? ` · ${s.quiz}%` : ''}`], ['practice', t('tabPractice', { n: (l.practice || []).length })], ['transcript', t('tabTranscript')], ['chapters', t('tabChapters')]];
    const setTab = (k) => {
      activeTab = k;
      tabsEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      panes.querySelectorAll('.pane').forEach((p) => p.classList.toggle('on', p.dataset.k === k));
      history.replaceState(null, '', `#/lesson/${l.id}${k === 'summary' ? '' : '/' + k}`);
    };
    T.forEach(([k, label]) => { const b = h('button', '', label); b.dataset.k = k; b.onclick = () => setTab(k); tabsEl.appendChild(b); });
    const pane = (k) => { const p = h('section', 'pane'); p.dataset.k = k; panes.appendChild(p); return p; };

    // summary
    const sum = pane('summary');
    const S = l.summary || {};
    sum.innerHTML = `
      ${S.tldr ? `<div class="tldr"><b>TL;DR</b> ${S.tldr}</div>` : ''}
      <h3>${t('keyTakeaways')}</h3><ul class="takeaways">${(S.points || []).map((p) => `<li>${p}</li>`).join('')}</ul>
      ${S.rosetta && S.rosetta.length ? `<h3>${t('railsToRust')}</h3><div class="rosetta"><div class="rr hd"><div>${t('inRails')}</div><div>${t('inRust')}</div></div>${S.rosetta.map(([a, b]) => `<div class="rr"><div>${a}</div><div>${b}</div></div>`).join('')}</div>` : ''}
      ${S.gotchas && S.gotchas.length ? `<h3>${t('gotchas')}</h3><ul class="gotchas">${S.gotchas.map((g) => `<li>${g}</li>`).join('')}</ul>` : ''}
      ${S.code ? `<h3>${t('cheat')}</h3>${Quiz.codeBlock(S.code, S.lang || 'rust')}` : ''}
      ${S.links && S.links.length ? `<h3>${t('deeper')}</h3><ul class="links">${S.links.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t} ↗</a></li>`).join('')}</ul>` : ''}`;

    // quiz
    const qp = pane('quiz');
    const hasPractice = (l.practice || []).length > 0;
    Quiz.renderQuiz(qp, l, {
      best: s.quiz,
      // after the quiz, the natural next step is the lesson's practice (or the next lesson if it has none)
      nextLabel: hasPractice ? t('toPractice') : next ? t('nextLesson') : t('backOverview'),
      onNext: () => {
        if (hasPractice) { setTab('practice'); tabsEl.scrollIntoView({ behavior: 'smooth' }); }
        else location.hash = next ? `#/lesson/${next.id}` : '#/';
      },
      onScore: (pct) => {
        s.quiz = Math.max(s.quiz || 0, pct); save(); renderTOC();
        tabsEl.querySelector('[data-k="quiz"]').textContent = `${t('tabQuiz')} · ${s.quiz}%`;
      },
    });

    // practice
    const pp = pane('practice');
    Quiz.renderPractice(pp, l, { done: s.practice, onDone: (i) => { s.practice = s.practice || {}; s.practice[i] = true; save(); renderTOC(); } });

    // transcript
    const tp = pane('transcript');
    follow = h('input'); follow.type = 'checkbox'; follow.checked = true;
    const fl = h('label', 'follow'); fl.append(follow, document.createTextNode(t('autoScroll')));
    tp.appendChild(fl);
    transcript = h('div', 'transcript');
    player.scenes.forEach((sc, si) => {
      const blk = h('div', 'tscene', `<h4><span>${fmt(sc.start)}</span>${sc.title || t('intro')}</h4>`);
      sc.beats.forEach((b, bi) => {
        if (!b.say) return;
        const p = h('p', 'tb', `<span class="ts">${fmt(sc.start + b.start)}</span> ${b.say}`);
        p.dataset.s = si; p.dataset.b = bi;
        p.onclick = () => { player.seek(sc.start + b.start + 0.01); pwrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        blk.appendChild(p);
      });
      transcript.appendChild(blk);
    });
    tp.appendChild(transcript);

    // chapters
    const cp = pane('chapters');
    const cl = h('div', 'chaplist');
    player.scenes.forEach((sc, si) => {
      const b = h('button', `chap ${sc.type || ''}`, `<span class="ci">${sc.type === 'checkpoint' ? '❓' : sc.type === 'recap' ? '✓' : sc.type === 'title' ? '🎬' : si}</span><span class="cn">${sc.title || (sc.type === 'title' ? t('intro') : t('scene', { n: si }))}</span><span class="ct">${fmt(sc.start)} · ${Math.round(sc.dur)}s</span>`);
      b.onclick = () => { player.jumpToScene(si); player.play(); pwrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      cl.appendChild(b);
    });
    cp.appendChild(cl);

    main.append(tabsEl, panes);
    setTab(T.some(([k]) => k === activeTab) ? activeTab : 'summary');

    const nav = h('div', 'lnav');
    nav.innerHTML = `${prev ? `<a class="navc" href="#/lesson/${prev.id}"><span>${t('prev')}</span><b>${prev.title}</b></a>` : '<span></span>'}
      ${next ? `<a class="navc r" href="#/lesson/${next.id}"><span>${t('next')}</span><b>${next.title}</b></a>` : `<a class="navc r" href="#/"><span>${t('finish')}</span><b>${t('backOverview')}</b></a>`}`;
    main.appendChild(nav);
    document.title = `${l.title} · ${C.title}`;
    setTimeout(() => pwrap.focus({ preventScroll: true }), 50);
  }

  // ---------- glossary ----------
  function renderGlossary() {
    document.title = `${t('rosettaTitle')} · ${C.title}`;
    const rows = [];
    lessons.forEach((l) => (l.summary?.rosetta || []).forEach(([a, b]) => rows.push({ a, b, l })));
    main.innerHTML = `<header class="lhead"><div class="crumbs"><a href="#/">${t('course')}</a> / ${t('reference')}</div><h1>📖 ${t('rosettaTitle')}</h1><p class="lsub">${t('rosettaSub', { n: rows.length })}</p></header>`;
    const inp = h('input', 'gsearch'); inp.placeholder = t('filter');
    main.appendChild(inp);
    const tbl = h('div', 'rosetta big');
    const draw = () => {
      const q = inp.value.toLowerCase();
      tbl.innerHTML = `<div class="rr hd"><div>${t('railsRuby')}</div><div>${t('rust')}</div><div>${t('lesson')}</div></div>` +
        rows.filter((r) => !q || plain(r.a + ' ' + r.b).toLowerCase().includes(q)).map((r) => `<div class="rr"><div>${r.a}</div><div>${r.b}</div><div><a href="#/lesson/${r.l.id}">${r.l.title}</a></div></div>`).join('');
    };
    inp.oninput = draw; draw();
    main.appendChild(tbl);
  }

  function renderShortcuts() {
    document.title = `${t('shortcutsTitle')} · ${C.title}`;
    const k = t('keys');
    main.innerHTML = `<header class="lhead"><div class="crumbs"><a href="#/">${t('course')}</a> / ${t('help')}</div><h1>⌨️ ${t('shortcutsTitle')}</h1></header><div class="keys">${k.map(([a, b]) => `<div><kbd>${a}</kbd><span>${b}</span></div>`).join('')}</div>`;
  }

  // ---------- global ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.closest('input,textarea')) { e.preventDefault(); document.body.classList.add('toc-open'); const s = $('.tsearch'); s && s.focus(); }
    if (e.key === 'Escape') document.body.classList.remove('toc-open');
  });
  $('#menu').onclick = () => document.body.classList.toggle('toc-open');
  $('#scrim').onclick = () => document.body.classList.remove('toc-open');
  const theme = localStorage.getItem('r4r-theme');
  if (theme) document.documentElement.dataset.theme = theme;
  $('#themeBtn').onclick = () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const nx = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nx; localStorage.setItem('r4r-theme', nx);
  };
  // language switcher
  const langSel = $('#langSel');
  for (const [code, meta] of Object.entries(window.I18N.langs)) {
    const o = h('option', '', code.toUpperCase()); o.value = code; o.title = meta.name;
    o.selected = code === lang; langSel.appendChild(o);
  }
  langSel.title = window.I18N.langs[lang].name;
  langSel.onchange = () => window.I18N.setLang(langSel.value);
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', () => { if (player) { const id = currentLessonId(); if (id && !lp(id).watched) lp(id).pos = player.t; } save(); });
  window.addEventListener('storage', (e) => { if (e.key === KEY) { try { P = JSON.parse(e.newValue) || { lessons: {} }; P.lessons = P.lessons || {}; renderTOC(); } catch {} } });
  route();
})();
