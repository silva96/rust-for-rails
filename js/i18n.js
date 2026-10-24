// Tiny i18n registry. Each language lives in js/lang/<code>.js and calls I18N.register(...).
// The active language is: the saved choice, else the browser's preferred language, else English.
window.I18N = (function () {
  const langs = {}; // code -> { name, speech, strings }
  let current = null;

  function register(code, meta, strings) { langs[code] = { ...meta, strings }; }

  function pick() {
    const saved = localStorage.getItem('r4r-lang');
    if (langs[saved]) return saved;
    for (const l of navigator.languages || [navigator.language || '']) {
      const base = String(l).toLowerCase().split('-')[0];
      if (langs[base]) return base;
    }
    return 'en';
  }

  function lang() {
    if (!current) { current = pick(); document.documentElement.lang = current; }
    return current;
  }

  function t(key, vars) {
    const mine = langs[lang()] && langs[lang()].strings, en = langs.en && langs.en.strings;
    let s = mine && mine[key] != null ? mine[key] : en && en[key];
    if (s == null) return key;
    if (typeof s === 'string' && vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }

  function setLang(code) { if (langs[code]) { localStorage.setItem('r4r-lang', code); location.reload(); } }

  return { register, t, setLang, get lang() { return lang(); }, get langs() { return langs; } };
})();
