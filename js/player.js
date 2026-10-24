// Seekable "motion video" player. A lesson is a list of scenes, each made of narrated beats.
// Everything visible is a pure function of time t, so scrubbing / jumping is always exact.
(function () {
  const STAGE_W = 1280, STAGE_H = 720;
  const WPS = 2.55; // narration pace, words per second
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const fmt = (s) => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const ENT = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ', rarr: '→', larr: '←' };
  const plain = (html) => String(html || '').replace(/<[^>]+>/g, '').replace(/&(#\d+|[a-z]+);/g, (m, e) => (e[0] === '#' ? String.fromCharCode(+e.slice(1)) : ENT[e] != null ? ENT[e] : ' '));
  const asArr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const parentKey = (k) => (k.includes('.') ? k.slice(0, k.lastIndexOf('.')) : null);
  const t = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const lang = () => (window.I18N ? window.I18N.lang : 'en');

  // Text the narrator actually speaks. tools/export-narration.js uses this same function,
  // so the hash below matches the pre-generated audio files in audio/<lang>/.
  function speechText(say) {
    return plain(say).replace(/`/g, '').replace(/::/g, ' ').replace(/&mut\b/g, 'ref mut ').replace(/&(?=\w)/g, 'ref ')
      .replace(/&/g, ' and ').replace(/->/g, ' returns ').replace(/=>/g, ' ').replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  // FNV-1a 32-bit over UTF-16 code units.
  function hashText(s) {
    let x = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; }
    return x.toString(16).padStart(8, '0');
  }
  function clipFor(say, lg) {
    const m = window.AUDIO_MANIFEST && window.AUDIO_MANIFEST[lg];
    const text = speechText(say);
    if (!m || !text) return null;
    const key = hashText(text), dur = m[key];
    return dur ? { url: `audio/${lg}/${key}.mp3`, dur } : null;
  }

  // With a recorded clip, the beat lasts as long as the clip plus a short breath; otherwise estimate from word count.
  function beatDuration(b, lg) {
    if (b.fixedDur) return b.fixedDur;
    b.clip = clipFor(b.say, lg);
    if (b.clip) return Math.max(2.2, b.clip.dur + 0.55);
    const w = plain(b.say).trim().split(/\s+/).filter(Boolean).length;
    return Math.max(2.4, w / WPS + 0.8);
  }

  // ---------- Timeline ----------
  function buildTimeline(lesson, lg = lang()) {
    const scenes = lesson.scenes.slice();
    if (lesson.summary && lesson.summary.points && !scenes.some((s) => s.type === 'recap')) {
      scenes.push({
        type: 'recap', title: t('recap'), points: lesson.summary.points,
        beats: [{ say: t('recapIntro') }].concat(lesson.summary.points.map((p, i) => ({ say: p, show: `r.${i}` }))),
      });
    }
    let clock = 0;
    for (const s of scenes) {
      s.start = clock;
      if (!s.beats || !s.beats.length) s.beats = [{ say: '', dur: 3 }];
      for (const b of s.beats) {
        if (b.fixedDur === undefined) b.fixedDur = b.dur || null; // author override survives rebuilds
        b.start = clock - s.start; b.dur = beatDuration(b, lg); clock += b.dur; b.end = clock - s.start;
      }
      s.end = clock; s.dur = s.end - s.start;
    }
    return { scenes, total: clock };
  }

  // ---------- Block renderers ----------
  function renderCode(b, ctx) {
    const wrap = h('div', `block code ${b.term ? 'term' : ''} ${b.cls || ''}`);
    wrap.dataset.key = b.id;
    const lang = b.lang || 'rust';
    const label = b.label || ({ rust: 'main.rs', ruby: 'app.rb', shell: 'terminal', toml: 'Cargo.toml', sql: 'query.sql' }[lang] || lang);
    const badge = { rust: 'Rust', ruby: 'Ruby', shell: 'Shell', toml: 'TOML', sql: 'SQL' }[lang] || lang;
    wrap.appendChild(h('div', 'code-head', `<i></i><i></i><i></i><span class="label">${HL.esc(label)}</span><span class="badge ${lang}">${badge}</span>`));
    const pre = h('div', 'code-body');
    if (b.size) pre.style.fontSize = b.size + 'px';
    const lines = b.code.replace(/^\n+|\s+$/g, '').split('\n');
    const lineEls = lines.map((l, i) => {
      const le = h('div', 'ln');
      le.innerHTML = `<span class="no">${i + 1}</span><span class="src">${HL.highlightLine(l, lang) || ' '}</span>`;
      pre.appendChild(le);
      return le;
    });
    wrap.appendChild(pre);
    ctx.codes.set(b.id, { id: b.id, lang, lines, lineEls, wrap, typed: null });
    return wrap;
  }

  function renderItems(b, ctx, tag, cls, itemFn) {
    const wrap = h(tag, `block ${cls} ${b.cls || ''}`);
    wrap.dataset.key = b.id;
    b.items.forEach((it, i) => {
      const e = itemFn(it, i);
      e.dataset.key = `${b.id}.${i}`;
      e.style.setProperty('--i', i);
      wrap.appendChild(e);
    });
    return wrap;
  }

  function renderDiagram(b) {
    const W = b.w || 1100, H = b.h || 380;
    const wrap = h('div', `block diagram ${b.cls || ''}`);
    wrap.dataset.key = b.id;
    wrap.style.width = W + 'px'; wrap.style.height = H + 'px';
    const boxes = {};
    for (const bx of b.boxes || []) {
      boxes[bx.id] = bx;
      const e = h('div', `dbox ${bx.cls || ''}`, `<div class="dl">${bx.label || ''}</div>${bx.sub ? `<div class="ds">${bx.sub}</div>` : ''}`);
      Object.assign(e.style, { left: bx.x + 'px', top: bx.y + 'px', width: (bx.w || 160) + 'px', height: (bx.h || 64) + 'px' });
      e.dataset.key = `${b.id}.${bx.id}`;
      wrap.appendChild(e);
    }
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.classList.add('darrows');
    svg.innerHTML = `<defs><marker id="ah-${b.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>`;
    const center = (bx) => [bx.x + (bx.w || 160) / 2, bx.y + (bx.h || 64) / 2];
    const clip = (bx, from, to) => {
      const [cx, cy] = from, dx = to[0] - cx, dy = to[1] - cy;
      const hw = (bx.w || 160) / 2 + 6, hh = (bx.h || 64) / 2 + 6;
      const s = Math.min(Math.abs(dx) > 1e-6 ? hw / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? hh / Math.abs(dy) : Infinity);
      return [cx + dx * s, cy + dy * s];
    };
    for (const a of b.arrows || []) {
      const A = boxes[a.from], B = boxes[a.to];
      if (!A || !B) continue;
      const ca = center(A), cb = center(B);
      const p1 = clip(A, ca, cb), p2 = clip(B, cb, ca);
      const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
      const bend = a.bend || 0, nx = -(p2[1] - p1[1]), ny = p2[0] - p1[0], nl = Math.hypot(nx, ny) || 1;
      const qx = mx + (nx / nl) * bend, qy = my + (ny / nl) * bend;
      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', `darrow ${a.cls || ''}`);
      g.dataset.key = `${b.id}.${a.id || a.from + '-' + a.to}`;
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M${p1[0]},${p1[1]} Q${qx},${qy} ${p2[0]},${p2[1]}`);
      path.setAttribute('marker-end', `url(#ah-${b.id})`);
      path.setAttribute('pathLength', '1');
      g.appendChild(path);
      if (a.label) {
        const t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', (mx + qx) / 2); t.setAttribute('y', (my + qy) / 2 - 8);
        t.setAttribute('text-anchor', 'middle'); t.textContent = a.label;
        g.appendChild(t);
      }
      svg.appendChild(g);
    }
    wrap.appendChild(svg);
    return wrap;
  }

  function renderBlock(b, ctx) {
    switch (b.kind) {
      case 'code': return renderCode(b, ctx);
      case 'bullets':
        return renderItems(b, ctx, 'ul', 'bullets', (it) => {
          const o = typeof it === 'string' ? { text: it } : it;
          return h('li', '', `${o.icon ? `<span class="ic">${o.icon}</span>` : '<span class="dot"></span>'}<span>${o.text}</span>`);
        });
      case 'cards':
        return renderItems(b, ctx, 'div', `cards n${b.items.length}`, (it) =>
          h('div', `card ${it.cls || ''}`, `${it.icon ? `<div class="cicon">${it.icon}</div>` : ''}<div class="ctitle">${it.title || ''}</div><div class="cbody">${it.body || ''}</div>`));
      case 'table': {
        const wrap = h('div', `block table ${b.cls || ''}`);
        wrap.dataset.key = b.id;
        if (b.head) wrap.appendChild(h('div', 'tr th', b.head.map((c) => `<div>${c}</div>`).join('')));
        b.rows.forEach((r, i) => {
          const e = h('div', 'tr', r.map((c) => `<div>${c}</div>`).join(''));
          e.dataset.key = `${b.id}.${i}`; e.style.setProperty('--i', i);
          wrap.appendChild(e);
        });
        return wrap;
      }
      case 'diagram': return renderDiagram(b);
      case 'text': default: {
        const e = h('div', `block text ${b.style || ''} ${b.cls || ''}`, b.html || '');
        e.dataset.key = b.id;
        return e;
      }
    }
  }

  // ---------- Scene renderers ----------
  function renderScene(scene, lesson, ctx) {
    const el = h('div', `scene scene-${scene.type || 'content'} ${scene.cls || ''}`);
    const key = (e, k) => { e.dataset.key = k; return e; };
    if (scene.type === 'title') {
      el.appendChild(h('div', 'title-orbs', '<span class="orb ruby">◆</span><span class="arrow">→</span><span class="orb crab">🦀</span>'));
      el.appendChild(key(h('div', 'kicker', scene.kicker || ''), 'kicker'));
      el.appendChild(key(h('h1', 'big', scene.title), 'title'));
      if (scene.subtitle) el.appendChild(key(h('p', 'sub', scene.subtitle), 'subtitle'));
    } else if (scene.type === 'recap') {
      el.appendChild(h('h2', 'stitle', `<span class="tag">${t('recap')}</span> ` + HL.esc(plain(lesson.title))));
      const ul = h('ul', 'block recap-list');
      scene.points.forEach((p, i) => { const li = h('li', '', `<span class="chk">✓</span><span>${p}</span>`); li.dataset.key = `r.${i}`; ul.appendChild(li); });
      el.appendChild(ul);
    } else if (scene.type === 'checkpoint') {
      el.appendChild(h('h2', 'stitle', `<span class="tag cp">${t('checkpoint')}</span> ` + (scene.title || t('quickCheck'))));
      el.appendChild(h('p', 'cp-q', scene.q));
      if (scene.code) el.appendChild(renderCode({ id: '__cp', kind: 'code', code: scene.code, lang: scene.lang || 'rust', label: scene.label }, ctx));
      const opts = h('div', 'cp-opts');
      const fb = h('div', 'cp-fb');
      scene.options.forEach((o, i) => {
        const btn = h('button', 'cp-opt', `<span class="k">${'ABCD'[i]}</span><span>${o}</span>`);
        btn.addEventListener('click', (ev) => { ev.stopPropagation(); ctx.answerCheckpoint(scene, i, opts, fb); });
        opts.appendChild(btn);
      });
      el.appendChild(opts); el.appendChild(fb);
      if (ctx.cpState.has(scene)) ctx.showCheckpoint(scene, ctx.cpState.get(scene), opts, fb);
    } else {
      if (scene.title) el.appendChild(h('h2', 'stitle', scene.title));
      const blocks = scene.blocks || [];
      if (scene.layout === 'split') {
        const cols = h('div', 'cols');
        const L = h('div', 'col'), R = h('div', 'col');
        cols.appendChild(L); cols.appendChild(R);
        const below = [];
        blocks.forEach((b, i) => {
          const side = b.side || (i === 0 ? 'left' : i === 1 ? 'right' : null);
          if (side === 'left') L.appendChild(renderBlock(b, ctx));
          else if (side === 'right') R.appendChild(renderBlock(b, ctx));
          else below.push(b);
        });
        el.appendChild(cols);
        below.forEach((b) => el.appendChild(renderBlock(b, ctx)));
      } else {
        const body = h('div', `stack ${scene.layout === 'center' ? 'center' : ''}`);
        blocks.forEach((b) => body.appendChild(renderBlock(b, ctx)));
        el.appendChild(body);
      }
    }
    return el;
  }

  // ---------- Player ----------
  class Player {
    constructor(root, lesson, opts = {}) {
      this.root = root; this.lesson = lesson; this.opts = opts;
      const tl = buildTimeline(lesson);
      this.scenes = tl.scenes; this.total = tl.total;
      this.t = 0; this.playing = false; this.rate = +(localStorage.getItem('r4r-rate') || 1);
      this.cc = localStorage.getItem('r4r-cc') !== '0';
      const hasAudio = !!(window.AUDIO_MANIFEST && window.AUDIO_MANIFEST[lang()]);
      const v = localStorage.getItem('r4r-voice');
      this.voice = v == null ? hasAudio : v === '1';
      this.audio = new Audio(); this.audio.preload = 'auto';
      this.audioBeat = null;
      this.cur = -1; this.curBeatKey = null; this.cpState = new Map(); this.ended = false;
      this.build();
      this.seek(Math.min(opts.startAt || 0, this.total - 0.1), true);
      this.loop = this.loop.bind(this);
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }

    build() {
      const r = this.root;
      r.innerHTML = '';
      r.className = 'player';
      r.tabIndex = 0;
      this.viewport = h('div', 'viewport');
      this.stage = h('div', 'stage');
      this.stage.innerHTML = `<div class="bg"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><div class="grid"></div></div>`;
      this.sceneHost = h('div', 'scene-host');
      this.noteEl = h('div', 'note');
      this.capEl = h('div', `captions ${this.cc ? '' : 'off'}`);
      this.waitEl = h('div', 'waitmsg', t('waitMsg'));
      this.waitEl.addEventListener('click', (e) => { e.stopPropagation(); this.waiting = false; this.cpSkip = this.scenes[this.cur]; });
      this.stage.append(this.sceneHost, this.noteEl, this.capEl, this.waitEl);
      this.bigPlay = h('div', 'bigplay', '<div class="bp"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>');
      this.flash = h('div', 'flash');
      this.viewport.append(this.stage, this.bigPlay, this.flash);
      this.viewport.addEventListener('click', () => this.toggle());
      this.viewport.addEventListener('dblclick', (e) => { e.preventDefault(); this.fullscreen(); });

      const c = h('div', 'controls');
      this.bar = h('div', 'bar');
      this.barFill = h('div', 'fill'); this.barKnob = h('div', 'knob'); this.barHover = h('div', 'hovertip');
      this.bar.append(h('div', 'segs'), this.barFill, this.barKnob, this.barHover);
      const segs = this.bar.firstChild;
      this.scenes.forEach((s) => {
        const seg = h('div', `seg ${s.type === 'checkpoint' ? 'cp' : ''}`);
        seg.style.left = (s.start / this.total) * 100 + '%';
        seg.style.width = (s.dur / this.total) * 100 + '%';
        segs.appendChild(seg);
      });
      const seekFromEvent = (e) => {
        const rc = this.bar.getBoundingClientRect();
        return Math.max(0, Math.min(1, (e.clientX - rc.left) / rc.width)) * this.total;
      };
      this.bar.addEventListener('pointerdown', (e) => {
        e.preventDefault(); this.bar.setPointerCapture(e.pointerId); this.dragging = true; this.seek(seekFromEvent(e));
      });
      this.bar.addEventListener('pointermove', (e) => {
        const t = seekFromEvent(e);
        const s = this.scenes[this.sceneIndexAt(t)];
        this.barHover.textContent = `${fmt(t)} · ${plain(s.title || (s.type === 'title' ? t('intro') : ''))}`;
        this.barHover.style.left = (t / this.total) * 100 + '%';
        if (this.dragging) this.seek(t);
      });
      this.bar.addEventListener('pointerup', () => { this.dragging = false; this.stopClip(); if (this.playing && this.voice) this.speakBeat(true); });

      const row = h('div', 'crow');
      const btn = (cls, title, svg, fn) => { const b = h('button', `cb ${cls}`, svg); b.title = title; b.addEventListener('click', (e) => { e.stopPropagation(); fn(); }); return b; };
      this.playBtn = btn('play', t('tPlay'), '', () => this.toggle());
      const back = btn('', t('tBack'), '<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="12" y="16" font-size="7" text-anchor="middle" fill="currentColor">10</text></svg>', () => this.seek(this.t - 10));
      const fwd = btn('', t('tFwd'), '<svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/><text x="12" y="16" font-size="7" text-anchor="middle" fill="currentColor">10</text></svg>', () => this.seek(this.t + 10));
      const prevS = btn('', t('tPrevS'), '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>', () => this.prevScene());
      const nextS = btn('', t('tNextS'), '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>', () => this.nextScene());
      this.timeEl = h('div', 'time');
      this.sceneName = h('div', 'scname');
      const spacer = h('div', 'sp');
      // Speed scales the whole clock: animations, beat timing and narration together.
      this.rateBtn = btn('txt', t('tSpeed'), '', () => {
        const rates = [0.75, 1, 1.25, 1.5, 2];
        this.rate = rates[(rates.indexOf(this.rate) + 1) % rates.length] || 1;
        localStorage.setItem('r4r-rate', this.rate); this.updateButtons();
        this.audio.playbackRate = this.rate;
        this.stage.style.setProperty('--rate', this.rate);
        if (this.voice && this.playing && !this.currentBeat().b.clip) this.speakBeat(true);
      });
      this.ccBtn = btn('txt', t('tCC'), 'CC', () => this.toggleCC());
      this.voiceBtn = btn('', t('tVoice'), '', () => this.toggleVoice());
      this.chapBtn = btn('', t('chapters'), '<svg viewBox="0 0 24 24"><path d="M3 5h2v2H3zm4 0h14v2H7zM3 11h2v2H3zm4 0h14v2H7zm-4 6h2v2H3zm4 0h14v2H7z"/></svg>', () => this.toggleChapters());
      const fs = btn('', t('tFS'), '<svg viewBox="0 0 24 24"><path d="M5 5h5V3H3v7h2zm9-2v2h5v5h2V3zm5 16h-5v2h7v-7h-2zM5 14H3v7h7v-2H5z"/></svg>', () => this.fullscreen());
      row.append(this.playBtn, back, fwd, prevS, nextS, this.timeEl, this.sceneName, spacer, this.rateBtn, this.ccBtn, this.voiceBtn, this.chapBtn, fs);
      c.append(this.bar, row);

      this.chapters = h('div', 'chapters');
      this.chapters.addEventListener('click', (e) => e.stopPropagation());
      this.chapters.innerHTML = `<div class="chh">${t('chapters')}</div>`;
      this.scenes.forEach((s, i) => {
        const it = h('button', 'chi', `<span class="ct">${fmt(s.start)}</span><span class="cn">${s.type === 'checkpoint' ? '❓ ' : ''}${s.title || (s.type === 'title' ? t('intro') : t('scene', { n: i + 1 }))}</span>`);
        it.addEventListener('click', (e) => { e.stopPropagation(); this.seek(s.start + 0.01); this.toggleChapters(false); });
        this.chapters.appendChild(it);
      });
      this.viewport.appendChild(this.chapters);

      r.append(this.viewport, c);
      this.ro = new ResizeObserver(() => this.fit());
      this.ro.observe(this.viewport);
      this.fit();

      this.keyHandler = (e) => {
        if (!document.body.contains(this.root)) return;
        if (e.target.closest('input,textarea,select,[contenteditable]')) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key.toLowerCase();
        const map = {
          ' ': () => this.toggle(), k: () => this.toggle(),
          arrowleft: () => this.seek(this.t - 5), arrowright: () => this.seek(this.t + 5),
          j: () => this.seek(this.t - 10), l: () => this.seek(this.t + 10),
          n: () => this.nextScene(), p: () => this.prevScene(),
          c: () => this.toggleCC(), v: () => this.toggleVoice(), f: () => this.fullscreen(),
        };
        if (map[k]) { e.preventDefault(); map[k](); }
        else if (/^[0-9]$/.test(k)) this.seek((this.total * +k) / 10);
      };
      document.addEventListener('keydown', this.keyHandler);
      this.updateButtons();
    }

    fit() {
      const w = this.viewport.clientWidth;
      const s = Math.min(w / STAGE_W, (this.viewport.clientHeight || w * 9 / 16) / STAGE_H);
      this.stage.style.transform = `scale(${s})`;
      this.stage.style.left = (w - STAGE_W * s) / 2 + 'px';
      this.stage.style.top = ((this.viewport.clientHeight || 0) - STAGE_H * s) / 2 + 'px';
    }

    destroy() {
      cancelAnimationFrame(this.raf);
      document.removeEventListener('keydown', this.keyHandler);
      this.ro.disconnect();
      if (window.speechSynthesis) speechSynthesis.cancel();
      this.stopClip(); this.audio.removeAttribute('src');
    }

    sceneIndexAt(t) {
      for (let i = this.scenes.length - 1; i >= 0; i--) if (t >= this.scenes[i].start) return i;
      return 0;
    }

    // --- transport ---
    play() {
      // a finished video stays finished: play shows the end card again instead of restarting.
      // Restarting is explicit (the end card's Replay button, or seeking back).
      if (this.ended || this.t >= this.total - 0.05) { this.ended = true; this.opts.onEnded && this.opts.onEnded(); return; }
      this.playing = true; this.ended = false; this.last = performance.now();
      this.stopClip();
      if (this.voice && !this.currentBeat().b.clip) { this.rewindToBeat(); this.speakBeat(true); }
      this.updateButtons(); this.flashIcon('play');
    }
    pause() {
      this.playing = false;
      this.stopSpeech(); this.stopClip();
      this.updateButtons(); this.flashIcon('pause');
      this.opts.onProgress && this.opts.onProgress(this.t, this.total);
    }
    toggle() { this.playing ? this.pause() : this.play(); }
    seek(t, silent) {
      this.t = Math.max(0, Math.min(this.total - 0.001, t));
      if (this.t < this.total - 0.05) this.ended = false;
      this.waiting = false;
      this.stopClip();
      this.render();
      if (this.playing && this.voice && !this.dragging && !this.currentBeat().b.clip) this.speakBeat(true);
      if (!silent) this.opts.onProgress && this.opts.onProgress(this.t, this.total);
    }
    nextScene() { const i = this.sceneIndexAt(this.t); if (i < this.scenes.length - 1) this.seek(this.scenes[i + 1].start + 0.01); }
    prevScene() {
      const i = this.sceneIndexAt(this.t), s = this.scenes[i];
      this.seek(this.t - s.start > 2 || i === 0 ? s.start + 0.01 : this.scenes[i - 1].start + 0.01);
    }
    jumpToScene(i) { this.seek(this.scenes[i].start + 0.01); }
    toggleCC() { this.cc = !this.cc; localStorage.setItem('r4r-cc', this.cc ? '1' : '0'); this.capEl.classList.toggle('off', !this.cc); this.updateButtons(); }
    toggleVoice() {
      const hasClip = !!this.currentBeat().b.clip;
      if (!hasClip && !window.speechSynthesis) { alert(t('noSpeech')); return; }
      this.voice = !this.voice; localStorage.setItem('r4r-voice', this.voice ? '1' : '0');
      this.stopClip();
      if (!this.voice) this.stopSpeech(); else if (this.playing && !hasClip) { this.rewindToBeat(); this.speakBeat(true); }
      this.updateButtons();
    }
    toggleChapters(force) { this.chapters.classList.toggle('open', force != null ? force : !this.chapters.classList.contains('open')); }
    fullscreen() {
      if (document.fullscreenElement) document.exitFullscreen();
      else this.root.requestFullscreen && this.root.requestFullscreen();
    }
    flashIcon(kind) {
      this.flash.innerHTML = kind === 'play' ? '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
      this.flash.classList.remove('go'); void this.flash.offsetWidth; this.flash.classList.add('go');
    }
    updateButtons() {
      this.playBtn.innerHTML = this.playing ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      this.rateBtn.textContent = this.rate + '×';
      this.ccBtn.classList.toggle('on', this.cc);
      this.voiceBtn.classList.toggle('on', this.voice);
      this.voiceBtn.innerHTML = this.voice
        ? '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z"/></svg>';
      this.root.classList.toggle('is-playing', this.playing);
    }

    // --- narration ---
    currentBeat() {
      const s = this.scenes[this.sceneIndexAt(this.t)], local = this.t - s.start;
      let bi = s.beats.findIndex((b) => local < b.end);
      if (bi < 0) bi = s.beats.length - 1;
      return { s, b: s.beats[bi], bi };
    }
    rewindToBeat() { const { s, b } = this.currentBeat(); this.t = s.start + b.start + 0.001; this.render(); }
    stopSpeech() {
      if (window.speechSynthesis) speechSynthesis.cancel();
      this.utter = null; this.speaking = null; this.spokenBeat = null;
    }
    // Speak the current beat once. `spokenBeat` remembers what was already narrated so a beat
    // is never repeated; `speaking` is only set while the utterance is actually playing.
    speakBeat(force) {
      if (!this.voice || !window.speechSynthesis) return;
      const { b } = this.currentBeat();
      if (b.clip) { if (this.spokenBeat) this.stopSpeech(); return; }
      if (!force && this.spokenBeat === b) return;
      speechSynthesis.cancel();
      this.spokenBeat = b;
      this.speaking = null; this.utter = null;
      const text = plain(b.say);
      if (!text.trim()) return;
      const u = new SpeechSynthesisUtterance(text.replace(/`/g, '').replace(/::/g, ' ').replace(/&mut\b/g, 'ref mut ').replace(/&(?=\w)/g, 'ref ').replace(/&/g, ' and ').replace(/->/g, ' returns ').replace(/<|>/g, ' '));
      u.rate = Math.min(2, 1.02 * this.rate);
      const voices = speechSynthesis.getVoices();
      const lg = lang();
      const mine = voices.filter((v) => v.lang.toLowerCase().startsWith(lg));
      const pref = mine.find((v) => /natural|neural|google|premium|enhanced/i.test(v.name)) || mine[0];
      u.lang = (window.I18N && window.I18N.langs[lg] && window.I18N.langs[lg].speech) || lg;
      if (pref) u.voice = pref;
      u.onend = u.onerror = () => { if (this.utter === u) { this.speaking = null; this.utter = null; } };
      this.utter = u; this.speaking = b; this.speakStart = performance.now();
      speechSynthesis.speak(u);
    }

    // Keep the <audio> element on the current beat's clip at the right offset.
    // Returns the clock time implied by the audio, the current time while the clip is
    // loading (hold the visuals), or null once the clip has finished (clock runs freely).
    syncClip(s, b, now) {
      const a = this.audio, clip = b.clip, base = s.start + b.start;
      const off = this.t - base;
      if (off >= clip.dur - 0.03) return null;
      if (this.audioBeat !== b) {
        this.audioBeat = b; this.clipWaitSince = now; this.audioFailed = false;
        // every load gets a token: a late callback from an older load (fast seeking, pause) is ignored
        const token = ++this.clipToken;
        a.src = clip.url;
        a.playbackRate = this.rate;
        const start = Math.max(0, off);
        const go = () => {
          if (token !== this.clipToken) return;
          a.currentTime = start; a.playbackRate = this.rate;
          a.play().catch((e) => { if (token === this.clipToken && e.name !== 'AbortError') this.audioFailed = true; });
        };
        if (a.readyState >= 1) go(); else a.addEventListener('loadedmetadata', go, { once: true });
        return this.t;
      }
      if (this.audioFailed) return null;
      if (a.ended) return null;
      if (!a.paused && a.readyState >= 3) { this.clipWaitSince = now; return base + a.currentTime; }
      // still loading or buffering: hold, but never longer than 2s
      return now - this.clipWaitSince < 2000 ? this.t : null;
    }

    // Stop the narration clip and invalidate any load still in flight.
    stopClip() {
      this.clipToken = (this.clipToken || 0) + 1;
      this.audioBeat = null;
      this.audio.pause();
    }

    // --- main loop ---
    loop(now) {
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      if (this.playing && !this.dragging) {
        let nt = this.t + dt * this.rate;
        const { s, b } = this.currentBeat();
        const beatEnd = s.start + b.start + b.dur;
        // recorded narration drives the clock while it plays, so voice and visuals never drift
        if (this.voice && b.clip) {
          const clock = this.syncClip(s, b, now);
          if (clock != null) nt = Math.max(this.t, clock);
        }
        // hold at beat end while the narrator is still talking
        // (safety cap: never hold longer than 3× the beat, in case onend never fires)
        if (this.voice && this.speaking === b && nt >= beatEnd && now - this.speakStart < b.dur * 3000 / this.rate) nt = beatEnd - 0.001;
        // hold at checkpoint end until answered
        if (s.type === 'checkpoint' && !this.cpState.has(s) && this.cpSkip !== s && nt >= s.end) { nt = s.end - 0.001; this.waiting = true; }
        if (nt >= this.total) {
          nt = this.total - 0.001; this.playing = false; this.ended = true; this.updateButtons();
          this.opts.onEnd && this.opts.onEnd();
        }
        this.t = nt;
        this.render();
        if (this.voice && !this.currentBeat().b.clip) this.speakBeat(false);
        if ((this._pt = (this._pt || 0) + dt) > 3) { this._pt = 0; this.opts.onProgress && this.opts.onProgress(this.t, this.total); }
      }
      this.raf = requestAnimationFrame(this.loop);
    }

    mount(i) {
      const scene = this.scenes[i];
      const ctx = {
        codes: new Map(), cpState: this.cpState,
        answerCheckpoint: (sc, idx, opts, fb) => {
          if (this.cpState.has(sc)) return;
          this.cpState.set(sc, idx); this.showCheckpoint(sc, idx, opts, fb);
          this.opts.onCheckpoint && this.opts.onCheckpoint(sc, idx === sc.answer);
          if (this.waiting) { this.waiting = false; this.waitEl.classList.remove('show'); }
        },
        showCheckpoint: (sc, idx, opts, fb) => this.showCheckpoint(sc, idx, opts, fb),
      };
      const el = renderScene(scene, this.lesson, ctx);
      const old = this.sceneHost.querySelector('.scene:not(.leaving)');
      if (old) { old.classList.add('leaving'); setTimeout(() => old.remove(), 450); }
      this.sceneHost.querySelectorAll('.scene.leaving').forEach((o) => { if (o !== old) o.remove(); });
      el.classList.add(`enter-${scene.enter || ['rise', 'zoom', 'slide'][i % 3]}`);
      this.sceneHost.appendChild(el);
      // auto-fit: shrink recap text until the list fits above the captions
      if (scene.type === 'recap') {
        const ul = el.querySelector('.recap-list');
        let fs = 24;
        while (ul.offsetTop + ul.offsetHeight > STAGE_H - 170 && fs > 15) { fs -= 1; ul.style.fontSize = fs + 'px'; ul.style.gap = Math.round(fs * 0.5) + 'px'; }
      }
      // auto-fit: shrink code font until the widest line fits its panel
      for (const cs of ctx.codes.values()) {
        const body = cs.wrap.querySelector('.code-body');
        let fs = parseFloat(getComputedStyle(body).fontSize);
        while (body.scrollWidth > body.clientWidth + 1 && fs > 12) { fs -= 0.5; body.style.fontSize = fs + 'px'; }
      }
      // index keyed elements
      const keyed = new Map();
      el.querySelectorAll('[data-key]').forEach((e) => keyed.set(e.dataset.key, e));
      const referenced = new Set();
      const addRef = (k) => { for (let x = k; x; x = parentKey(x)) referenced.add(x); };
      scene.beats.forEach((b) => {
        asArr(b.show).forEach(addRef);
        Object.keys(b.type || {}).forEach(addRef);
      });
      this.ms = { scene, el, keyed, referenced, codes: ctx.codes, cls: new Map() };
      this.cur = i;
      this.lastNote = null;
    }

    showCheckpoint(sc, idx, opts, fb) {
      [...opts.children].forEach((b, i) => {
        b.disabled = true;
        b.classList.toggle('right', i === sc.answer);
        b.classList.toggle('wrong', i === idx && idx !== sc.answer);
      });
      fb.innerHTML = `<b>${idx === sc.answer ? '✅ Correct!' : '❌ Not quite.'}</b> ${sc.explain || ''}`;
      fb.classList.add('show');
    }

    render() {
      const i = this.sceneIndexAt(this.t);
      if (i !== this.cur) this.mount(i);
      const { scene, keyed, referenced, codes } = this.ms;
      const local = this.t - scene.start;
      let bi = scene.beats.findIndex((b) => local < b.end);
      if (bi < 0) bi = scene.beats.length - 1;
      const beat = scene.beats[bi];
      const p = Math.max(0, Math.min(1, (local - beat.start) / beat.dur));

      // reveals
      const shown = new Set();
      const addShown = (k) => { for (let x = k; x; x = parentKey(x)) shown.add(x); };
      const clsNow = new Map();
      for (let j = 0; j <= bi; j++) {
        const b = scene.beats[j];
        asArr(b.show).forEach(addShown);
        Object.keys(b.type || {}).forEach(addShown);
        for (const [k, c] of Object.entries(b.cls || {})) clsNow.set(k, c);
        for (const k of asArr(b.uncls)) clsNow.delete(k);
      }
      const visCache = new Map();
      const visible = (k) => {
        if (!k) return true;
        if (visCache.has(k)) return visCache.get(k);
        const v = shown.has(k) || (!referenced.has(k) && visible(parentKey(k)));
        visCache.set(k, v); return v;
      };
      for (const [k, e] of keyed) e.classList.toggle('in', visible(k));

      // persistent classes
      for (const [k, c] of this.ms.cls) if (clsNow.get(k) !== c) keyed.get(k) && keyed.get(k).classList.remove(...c.split(' '));
      for (const [k, c] of clsNow) keyed.get(k) && keyed.get(k).classList.add(...c.split(' '));
      this.ms.cls = clsNow;

      // glow highlights (current beat only)
      const glow = new Set(asArr(beat.hl));
      for (const [k, e] of keyed) e.classList.toggle('glow', glow.has(k));

      // code typing + line highlights
      for (const [id, cs] of codes) {
        let from = 0, target = null;
        for (let j = 0; j <= bi; j++) {
          const ty = scene.beats[j].type;
          if (ty && ty[id] != null) {
            const n = ty[id] === 'all' ? cs.lines.length : ty[id];
            if (j < bi) from = n; else target = n;
          }
        }
        const anyType = scene.beats.some((b) => b.type && b.type[id] != null);
        let chars;
        const lineLen = (n) => cs.lines.slice(0, n).reduce((a, l) => a + l.length + 1, 0);
        if (!anyType) chars = Infinity;
        else if (target == null) chars = lineLen(from);
        else { const q = Math.min(1, p / 0.82); chars = Math.round(lineLen(from) + (lineLen(target) - lineLen(from)) * q); }
        if (cs.typed !== chars) {
          cs.typed = chars;
          let rem = chars;
          cs.lineEls.forEach((le, li) => {
            const L = cs.lines[li], src = le.lastChild;
            if (rem >= L.length + 1 || rem === Infinity) {
              if (le.dataset.st !== 'full') { src.innerHTML = HL.highlightLine(L, cs.lang) || ' '; le.dataset.st = 'full'; }
              le.classList.remove('hidden');
            } else if (rem > 0) {
              src.innerHTML = (HL.highlightLine(L.slice(0, rem), cs.lang)) + '<span class="caret"></span>';
              le.dataset.st = 'part'; le.classList.remove('hidden');
            } else {
              le.classList.add('hidden'); le.dataset.st = '';
            }
            if (rem !== Infinity) rem = Math.max(0, rem - (L.length + 1));
          });
        }
        const hl = beat.lines && beat.lines[id];
        cs.wrap.classList.toggle('has-hl', !!hl);
        cs.lineEls.forEach((le, li) => le.classList.toggle('hl', !!hl && hl.includes(li + 1)));
      }

      // note + captions
      const noteHtml = beat.note || '';
      if (noteHtml !== this.lastNote) {
        this.lastNote = noteHtml;
        this.noteEl.classList.remove('show');
        if (noteHtml) { this.noteEl.innerHTML = `<span class="ni">💡</span><span>${noteHtml}</span>`; void this.noteEl.offsetWidth; this.noteEl.classList.add('show'); }
      }
      const capKey = scene.start + ':' + bi;
      if (capKey !== this.curBeatKey) {
        this.curBeatKey = capKey;
        this.capEl.innerHTML = beat.say ? `<span>${beat.say}</span>` : '';
        this.capEl.classList.toggle('empty', !beat.say);
        this.opts.onBeat && this.opts.onBeat(this.cur, bi);
      }
      this.waitEl.classList.toggle('show', !!this.waiting);

      // chrome
      const pct = (this.t / this.total) * 100;
      this.barFill.style.width = pct + '%';
      this.barKnob.style.left = pct + '%';
      this.timeEl.textContent = `${fmt(this.t)} / ${fmt(this.total)}`;
      this.sceneName.textContent = plain(scene.title || (scene.type === 'title' ? this.lesson.title : ''));
      [...this.chapters.querySelectorAll('.chi')].forEach((c, j) => c.classList.toggle('cur', j === this.cur));
      this.bigPlay.classList.toggle('show', !this.playing);
    }
  }

  window.CoursePlayer = { Player, buildTimeline, fmt, plain, speechText, hashText };
})();
