// Verifies that a translated course mirrors the English one structurally.
// Usage: node tools/check-i18n.js [es] [moduleId]
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const lang = process.argv[2] || 'es', only = process.argv[3];
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
load('content/course.js');
fs.readdirSync(path.join(root, 'content')).filter((f) => /^m\d.*\.js$/.test(f)).sort().forEach((f) => load('content/' + f));
load(`content/${lang}/course.js`);
fs.readdirSync(path.join(root, 'content', lang)).filter((f) => /^m\d.*\.js$/.test(f)).sort().forEach((f) => load(`content/${lang}/${f}`));
const EN = ctx.COURSE, TR = ctx['COURSE_' + lang.toUpperCase()];
const probs = [];
const P = (where, msg) => probs.push(`${where}: ${msg}`);
const keysOf = (b) => JSON.stringify({ show: [].concat(b.show || []), type: b.type || {}, lines: b.lines || {}, hl: [].concat(b.hl || []), cls: b.cls || {}, uncls: [].concat(b.uncls || []), note: !!b.note });
const lineCount = (c) => String(c).replace(/^\n+|\s+$/g, '').split('\n').length;
for (const m of EN.modules) {
  if (only && m.id !== only) continue;
  const tm = TR.modules.find((x) => x.id === m.id);
  if (!tm) { P(m.id, 'module missing'); continue; }
  if (tm.order !== m.order) P(m.id, 'order differs');
  if (tm.lessons.length !== m.lessons.length) P(m.id, 'lesson count differs');
  m.lessons.forEach((l, li) => {
    const tl = tm.lessons[li], W = `${m.id}/${l.id}`;
    if (!tl || tl.id !== l.id) return P(W, 'lesson id/order differs');
    if (tl.scenes.length !== l.scenes.length) return P(W, `scene count ${tl.scenes.length} vs ${l.scenes.length}`);
    l.scenes.forEach((s, si) => {
      const ts = tl.scenes[si], S = `${W} scene ${si}`;
      if ((ts.type || '') !== (s.type || '')) P(S, 'type differs');
      if ((ts.layout || '') !== (s.layout || '')) P(S, 'layout differs');
      if ((ts.beats || []).length !== (s.beats || []).length) return P(S, `beat count ${(ts.beats || []).length} vs ${(s.beats || []).length}`);
      s.beats.forEach((b, bi) => { if (keysOf(b) !== keysOf(ts.beats[bi])) P(`${S} beat ${bi}`, 'show/type/lines/hl/cls/note differ'); if (!ts.beats[bi].say) P(`${S} beat ${bi}`, 'missing say'); });
      const bl = s.blocks || [], tbl = ts.blocks || [];
      if (bl.length !== tbl.length) return P(S, 'block count differs');
      bl.forEach((b, bi) => {
        const tb = tbl[bi];
        if (tb.id !== b.id || tb.kind !== b.kind || (tb.side || '') !== (b.side || '')) P(`${S} block ${b.id}`, 'id/kind/side differs');
        if (b.kind === 'code' && lineCount(b.code) !== lineCount(tb.code)) P(`${S} block ${b.id}`, `code line count ${lineCount(tb.code)} vs ${lineCount(b.code)}`);
        for (const k of ['items', 'rows']) if (b[k] && (!tb[k] || tb[k].length !== b[k].length)) P(`${S} block ${b.id}`, `${k} length differs`);
        if (b.boxes && JSON.stringify(b.boxes.map((x) => x.id)) !== JSON.stringify((tb.boxes || []).map((x) => x.id))) P(`${S} block ${b.id}`, 'boxes differ');
        if (b.arrows && JSON.stringify(b.arrows.map((x) => x.id || x.from + x.to)) !== JSON.stringify((tb.arrows || []).map((x) => x.id || x.from + x.to))) P(`${S} block ${b.id}`, 'arrows differ');
      });
      if (s.type === 'checkpoint') {
        if (ts.answer !== s.answer || ts.options.length !== s.options.length) P(S, 'checkpoint answer/options differ');
        if (s.code && lineCount(s.code) !== lineCount(ts.code || '')) P(S, 'checkpoint code lines differ');
      }
    });
    const q = l.quiz || [], tq = tl.quiz || [];
    if (q.length !== tq.length) P(W, 'quiz count differs');
    q.forEach((x, i) => {
      const y = tq[i] || {}, Q = `${W} quiz ${i}`;
      if (x.type !== y.type) return P(Q, 'type differs');
      if (x.answer !== y.answer) P(Q, 'answer differs');
      if (x.options && x.options.length !== (y.options || []).length) P(Q, 'options differ');
      if (x.type === 'fill') { if ((y.code.split('___').length) !== x.code.split('___').length || JSON.stringify(x.answers) !== JSON.stringify(y.answers)) P(Q, 'fill blanks/answers differ'); }
      if (x.items && x.items.length !== (y.items || []).length) P(Q, 'order items differ');
      if (x.pairs && x.pairs.length !== (y.pairs || []).length) P(Q, 'match pairs differ');
      if (x.code && x.type !== 'fill' && lineCount(x.code) !== lineCount(y.code || '')) P(Q, 'code lines differ');
    });
    if ((l.practice || []).length !== (tl.practice || []).length) P(W, 'practice count differs');
    const sp = l.summary || {}, tsp = tl.summary || {};
    if ((sp.points || []).length !== (tsp.points || []).length) P(W, 'summary points count differs');
  });
}
console.log(probs.length ? probs.join('\n') : `OK: ${lang} mirrors English${only ? ' for ' + only : ''}`);
process.exit(probs.length ? 1 : 0);
