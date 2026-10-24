// Quiz + practice widgets.
(function () {
  const t = (k, v) => window.I18N.t(k, v);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const norm = (s) => String(s).trim().replace(/\s+/g, ' ').replace(/\s*([(){}<>&:;,.=])\s*/g, '$1');
  const codeBlock = (code, lang) => `<pre class="qcode"><code>${HL.highlight(code.replace(/^\n+|\s+$/g, ''), lang || 'rust')}</code></pre>`;

  // Each builder returns { el, check() -> bool|null (null = incomplete), reveal(ok), get() -> JSON-able answer, set(answer) }
  const builders = {
    mcq(q) {
      const el = h('div', 'qbody');
      if (q.code) el.insertAdjacentHTML('beforeend', codeBlock(q.code, q.lang));
      const opts = h('div', 'qopts');
      let sel = null;
      q.options.forEach((o, i) => {
        const b = h('button', 'qopt', `<span class="k">${'ABCDEF'[i]}</span><span>${o}</span>`);
        b.onclick = () => { if (el.dataset.locked) return; sel = i; [...opts.children].forEach((c, j) => c.classList.toggle('sel', j === i)); };
        opts.appendChild(b);
      });
      el.appendChild(opts);
      return {
        el,
        get: () => sel,
        set: (v) => { sel = v; [...opts.children].forEach((c, j) => c.classList.toggle('sel', j === v)); },
        check: () => (sel == null ? null : sel === q.answer),
        reveal: () => [...opts.children].forEach((c, j) => { c.classList.toggle('right', j === q.answer); c.classList.toggle('wrong', j === sel && sel !== q.answer); }),
      };
    },
    compiles(q) {
      return builders.mcq({ ...q, options: [t('yesCompiles'), t('noCompiles')], answer: q.answer ? 0 : 1 });
    },
    fill(q) {
      const el = h('div', 'qbody');
      const pre = h('pre', 'qcode fill');
      const parts = q.code.replace(/^\n+|\s+$/g, '').split('___');
      const inputs = [];
      parts.forEach((p, i) => {
        const span = h('span', '', HL.highlight(p, q.lang || 'rust'));
        pre.appendChild(span);
        if (i < parts.length - 1) {
          const inp = h('input', 'blank');
          inp.spellcheck = false; inp.autocomplete = 'off';
          const longest = Math.max(...(q.answers[i] || ['xxxx']).map((a) => a.length));
          inp.style.width = Math.max(3, longest + 1) + 'ch';
          inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') el.closest('.q').querySelector('.qcheck').click(); });
          inputs.push(inp); pre.appendChild(inp);
        }
      });
      el.appendChild(pre);
      return {
        el,
        get: () => inputs.map((i) => i.value),
        set: (v) => inputs.forEach((inp, i) => { inp.value = (v && v[i]) || ''; }),
        check: () => {
          if (inputs.some((i) => !i.value.trim())) return null;
          return inputs.every((inp, i) => q.answers[i].some((a) => norm(a) === norm(inp.value)));
        },
        reveal: () => inputs.forEach((inp, i) => {
          const ok = q.answers[i].some((a) => norm(a) === norm(inp.value));
          inp.classList.add(ok ? 'right' : 'wrong');
          if (!ok) inp.title = t('answer', { a: q.answers[i][0] });
          if (!ok) inp.insertAdjacentHTML('afterend', `<span class="fix">${HL.esc(q.answers[i][0])}</span>`);
        }),
      };
    },
    order(q) {
      const el = h('div', 'qbody');
      const pool = h('div', 'opool'), picked = h('div', 'opicked');
      picked.innerHTML = `<div class="ph">${t('clickOrder')}</div>`;
      const order = [];
      const items = shuffle(q.items.map((t, i) => ({ t, i })));
      const draw = () => {
        pool.innerHTML = ''; picked.querySelectorAll('.oi').forEach((n) => n.remove());
        picked.querySelector('.ph').style.display = order.length ? 'none' : '';
        items.forEach((it) => {
          if (order.includes(it)) return;
          const b = h('button', 'oi', q.code ? `<code>${HL.highlightLine(it.t, q.lang || 'rust')}</code>` : it.t);
          b.onclick = () => { if (el.dataset.locked) return; order.push(it); draw(); };
          pool.appendChild(b);
        });
        order.forEach((it, n) => {
          const b = h('button', 'oi in', `<span class="n">${n + 1}</span>${q.code ? `<code>${HL.highlightLine(it.t, q.lang || 'rust')}</code>` : it.t}`);
          b.onclick = () => { if (el.dataset.locked) return; order.splice(n, 1); draw(); };
          picked.appendChild(b);
        });
      };
      draw();
      el.append(picked, pool);
      return {
        el,
        get: () => order.map((it) => it.i),
        set: (v) => { order.length = 0; (v || []).forEach((i) => { const it = items.find((x) => x.i === i); if (it) order.push(it); }); draw(); },
        check: () => (order.length < q.items.length ? null : order.every((it, n) => it.i === n)),
        reveal: () => {
          [...picked.querySelectorAll('.oi')].forEach((b, n) => b.classList.add(order[n].i === n ? 'right' : 'wrong'));
          if (!order.every((it, n) => it.i === n)) el.insertAdjacentHTML('beforeend', `<div class="solution"><b>${t('correctOrder')}</b><ol>${q.items.map((t) => `<li>${q.code ? `<code>${HL.highlightLine(t, q.lang || 'rust')}</code>` : t}</li>`).join('')}</ol></div>`);
        },
      };
    },
    match(q) {
      const el = h('div', 'qbody');
      const rights = shuffle(q.pairs.map((p) => p[1]));
      const grid = h('div', 'mgrid');
      const sels = q.pairs.map(([l]) => {
        const row = h('div', 'mrow', `<div class="ml">${l}</div><div class="marrow">→</div>`);
        const s = h('select', 'msel', `<option value="">${t('choose')}</option>` + rights.map((r) => `<option>${HL.esc(r)}</option>`).join(''));
        row.appendChild(s); grid.appendChild(row);
        return s;
      });
      el.appendChild(grid);
      return {
        el,
        get: () => sels.map((s) => s.value),
        set: (v) => sels.forEach((s, i) => { s.value = (v && v[i]) || ''; }),
        check: () => (sels.some((s) => !s.value) ? null : sels.every((s, i) => s.value === q.pairs[i][1])),
        reveal: () => sels.forEach((s, i) => {
          const ok = s.value === q.pairs[i][1];
          s.classList.add(ok ? 'right' : 'wrong'); s.disabled = true;
          if (!ok) s.insertAdjacentHTML('afterend', `<span class="fix">${HL.esc(q.pairs[i][1])}</span>`);
        }),
      };
    },
  };

  function renderQuiz(root, lesson, { onScore, onNext, nextLabel, best }) {
    root.innerHTML = '';
    const qs = lesson.quiz || [];
    const head = h('div', 'quiz-head', `<div><h3>${t('lessonQuiz')}</h3><p>${t('quizMeta', { n: qs.length, b: best != null ? best + '%' : '—' })}</p></div>`);
    const scoreEl = h('div', 'quiz-score');
    head.appendChild(scoreEl);
    root.appendChild(head);
    const results = new Array(qs.length).fill(undefined);

    // Checked answers are saved per lesson (and language), together with a fingerprint of the quiz so that
    // saved answers are dropped if the questions change. Restoring replays them as already checked.
    const storeKey = `r4r-quiz-${window.I18N.lang}-${lesson.id}`;
    const quizFp = fingerprint(JSON.stringify(qs.map((q) => [q.type, q.q, q.answer, q.answers, q.items, q.pairs, q.options, q.code])));
    let saved = {};
    try {
      const obj = JSON.parse(localStorage.getItem(storeKey) || 'null');
      if (obj && obj.fp === quizFp && obj.a) saved = obj.a;
    } catch {}
    const persist = () => { try { localStorage.setItem(storeKey, JSON.stringify({ fp: quizFp, a: saved })); } catch {} };
    let restoring = false;

    const update = () => {
      const done = results.filter((r) => r !== undefined).length;
      const right = results.filter(Boolean).length;
      const pct = Math.round((right / qs.length) * 100);
      scoreEl.innerHTML = `<div class="ring" style="--p:${(done ? right / qs.length : 0) * 100}"><span>${right}/${qs.length}</span></div>`;
      if (done === qs.length) {
        onScore && onScore(pct);
        const pass = pct >= 70;
        const fin = h('div', `quiz-final ${pass ? 'pass' : 'fail'}`, `<div class="big">${pass ? '🎉' : '🔁'} ${pct}%</div><div>${pass ? t('passed') : t('failed')}</div>`);
        const retry = h('button', 'btn ghost', t('retry'));
        retry.onclick = () => {
          try { localStorage.removeItem(storeKey); } catch {}
          renderQuiz(root, lesson, { onScore, onNext, nextLabel, best: Math.max(best || 0, pct) });
        };
        if (onNext) {
          const next = h('button', 'btn big', nextLabel);
          next.onclick = onNext;
          const row = h('div', 'quiz-final-actions');
          row.append(...(pass ? [next, retry] : [retry, next]));
          fin.appendChild(row);
          if (pass) next.focus({ preventScroll: true });
        } else fin.appendChild(retry);
        root.appendChild(fin);
        if (!restoring) {
          if (pass) window.confetti && window.confetti(fin);
          fin.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };
    qs.forEach((q, i) => {
      const card = h('div', 'q');
      const label = { mcq: t('qMcq'), compiles: t('qCompiles'), fill: t('qFill'), order: t('qOrder'), match: t('qMatch') }[q.type] || '';
      card.innerHTML = `<div class="qn"><span class="num">${i + 1}</span><span class="qt">${label}</span></div><div class="qq">${q.q || (q.type === 'compiles' ? t('willCompile') : '')}</div>`;
      const w = builders[q.type](q);
      card.appendChild(w.el);
      const foot = h('div', 'qfoot');
      const btn = h('button', 'btn qcheck', t('checkAnswer'));
      const fb = h('div', 'qfb');
      // lock the question, show the correction and feedback, and record the result
      const finish = (r) => {
        w.el.dataset.locked = '1'; btn.disabled = true; w.reveal(r);
        fb.innerHTML = `<b>${r ? t('correctDot') : t('notQuiteDot')}</b> ${q.explain || ''}`;
        card.classList.add(r ? 'ok' : 'bad');
        results[i] = r;
      };
      btn.onclick = () => {
        const r = w.check();
        if (r == null) { fb.innerHTML = `<span class="warn">${t('answerAll')}</span>`; return; }
        saved[i] = w.get(); persist();
        finish(r); update();
      };
      foot.append(btn, fb);
      card.appendChild(foot);
      root.appendChild(card);
      if (saved[i] !== undefined) {
        w.set(saved[i]);
        const r = w.check();
        if (r != null) finish(r); else delete saved[i];
      }
    });
    restoring = true; update(); restoring = false;
  }

  function playgroundUrl(code) {
    return 'https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=' + encodeURIComponent(code);
  }

  // FNV-1a hash, enough to tell whether an exercise starter has changed.
  function fingerprint(s) {
    let x = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; }
    return x.toString(16);
  }

  function renderPractice(root, lesson, { done, onDone }) {
    root.innerHTML = '';
    const list = lesson.practice || [];
    if (!list.length) { root.innerHTML = `<p class="muted">${t('noPractice')}</p>`; return; }
    list.forEach((ex, i) => {
      const card = h('div', 'ex');
      card.innerHTML = `<div class="exh"><span class="num">${i + 1}</span><h4>${ex.title}</h4></div><div class="exp">${ex.prompt}</div>`;
      const ed = h('div', 'editor');
      const ta = h('textarea', '');
      ta.spellcheck = false;
      const key = `r4r-ex-${window.I18N.lang}-${lesson.id}-${i}`;
      const starter = ex.starter.replace(/^\n+/, '');
      // Saved code is stored with a fingerprint of the starter it was written for. If the exercise has
      // changed since, the old code no longer matches the prompt/solution, so it is discarded.
      const base = fingerprint(starter);
      let saved = null, outdated = false;
      try {
        const raw = localStorage.getItem(key);
        if (raw != null) {
          let obj = null; try { obj = JSON.parse(raw); } catch {}
          if (obj && obj.b === base && typeof obj.c === 'string') saved = obj.c; else outdated = true;
        }
      } catch {}
      ta.value = saved != null ? saved : starter;
      const hl = h('pre', 'edhl');
      const sync = () => {
        hl.innerHTML = HL.highlight(ta.value, 'rust') + '\n';
        try { localStorage.setItem(key, JSON.stringify({ b: base, c: ta.value })); } catch {}
      };
      ta.addEventListener('input', sync);
      ta.addEventListener('scroll', () => { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; });
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('    ', s, ta.selectionEnd, 'end'); sync(); }
      });
      ed.append(hl, ta); sync();
      if (outdated) card.appendChild(h('div', 'exnote', t('exUpdated')));
      card.appendChild(ed);
      const bar = h('div', 'exbar');
      const run = h('a', 'btn', t('runPg'));
      run.target = '_blank'; run.rel = 'noopener';
      run.onmousedown = run.onfocus = () => { run.href = playgroundUrl(ta.value); };
      run.href = playgroundUrl(ta.value);
      const hintBtn = h('button', 'btn ghost', t('hint', { n: (ex.hints || []).length }));
      const solBtn = h('button', 'btn ghost', t('showSol'));
      const reset = h('button', 'btn ghost', t('resetCode'));
      const doneBtn = h('button', `btn ${done && done[i] ? 'ok' : 'ghost'}`, done && done[i] ? t('done') : t('markDone'));
      const out = h('div', 'exout');
      let hi = 0;
      hintBtn.onclick = () => {
        if (!ex.hints || hi >= ex.hints.length) return;
        out.insertAdjacentHTML('beforeend', `<div class="hint"><b>${t('hintN', { n: hi + 1 })}</b> ${ex.hints[hi++]}</div>`);
        hintBtn.textContent = t('hintsLeft', { n: ex.hints.length - hi });
      };
      solBtn.onclick = () => {
        if (out.querySelector('.sol')) return;
        out.insertAdjacentHTML('beforeend', `<div class="sol"><b>${t('solution')}</b>${codeBlock(ex.solution, 'rust')}${ex.explain ? `<p>${ex.explain}</p>` : ''}</div>`);
        const a = h('a', 'btn ghost sm', t('runSol')); a.target = '_blank'; a.rel = 'noopener'; a.href = playgroundUrl(ex.solution.replace(/^\n+/, ''));
        out.querySelector('.sol').appendChild(a);
      };
      reset.onclick = () => { if (confirm(t('resetCodeConfirm'))) { ta.value = ex.starter.replace(/^\n+/, ''); sync(); } };
      doneBtn.onclick = () => { doneBtn.className = 'btn ok'; doneBtn.textContent = t('done'); onDone && onDone(i); };
      bar.append(run, hintBtn, solBtn, reset, doneBtn);
      card.append(bar, out);
      root.appendChild(card);
    });
  }

  window.Quiz = { renderQuiz, renderPractice, playgroundUrl, codeBlock };
})();
