// Collects every narrated line (including auto-generated recap beats) for a language,
// using the player's own speechText/hashText so filenames match what the browser looks up.
// Usage: node tools/export-narration.js <lang>   -> writes tools/tts/narration-<lang>.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const lang = process.argv[2] || 'en';
const ctx = { localStorage: { getItem: (k) => (k === 'r4r-lang' ? lang : null), setItem() {} }, navigator: { language: lang }, document: { documentElement: {} } };
ctx.window = ctx; vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
load('js/i18n.js');
fs.readdirSync(path.join(root, 'js', 'lang')).filter((f) => f.endsWith('.js')).forEach((f) => load('js/lang/' + f));
['js/player.js', 'content/course.js'].forEach(load);
fs.readdirSync(path.join(root, 'content')).filter((f) => /^m\d.*\.js$/.test(f)).sort().forEach((f) => load('content/' + f));
let modules = ctx.COURSE.modules;
if (lang !== 'en') {
  load(`content/${lang}/course.js`);
  fs.readdirSync(path.join(root, 'content', lang)).filter((f) => /^m\d.*\.js$/.test(f)).sort().forEach((f) => load(`content/${lang}/${f}`));
  const tr = ctx['COURSE_' + lang.toUpperCase()].modules;
  modules = modules.map((m) => tr.find((x) => x.id === m.id) || m);
}
const { buildTimeline, speechText, hashText } = ctx.CoursePlayer;
const seen = new Map();
for (const m of modules) for (const l of m.lessons) for (const s of buildTimeline(l, lang).scenes) for (const b of s.beats) {
  const text = speechText(b.say);
  if (text) seen.set(hashText(text), text);
}
const out = path.join(root, 'tools', 'tts', `narration-${lang}.json`);
fs.writeFileSync(out, JSON.stringify([...seen].map(([key, text]) => ({ key, text })), null, 1));
console.log(`${lang}: ${seen.size} lines -> ${path.relative(root, out)}`);
