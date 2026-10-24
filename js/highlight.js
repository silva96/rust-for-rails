// Tiny dependency-free syntax highlighter for rust / ruby / shell / toml / sql / erb-ish text.
(function () {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const RUST_KW = 'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while';
  const RUST_TY = 'i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char str';
  const RUBY_KW = 'alias and begin break case class def defined? do else elsif end ensure false for if in module next nil not or redo rescue retry return self super then true undef unless until when while yield raise attr_accessor attr_reader attr_writer private protected require include extend lambda proc puts';
  const SQL_KW = 'SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE PRIMARY KEY NOT NULL RETURNING ORDER BY LIMIT AND OR JOIN ON AS TEXT INTEGER BIGSERIAL SERIAL BOOLEAN TIMESTAMPTZ DEFAULT now';

  const words = (s) => new Set(s.split(/\s+/));
  const sets = { rustKw: words(RUST_KW), rustTy: words(RUST_TY), rubyKw: words(RUBY_KW), sqlKw: words(SQL_KW) };

  // Each language: ordered list of [regex(sticky), className | fn(match)->className]
  const L = {
    rust: [
      [/\/\/[^\n]*/y, 'c'],
      [/"(?:\\.|[^"\\])*"?/y, 's'],
      [/'(?:\\.|[^'\\])'/y, 's'],
      [/'[a-z_]\w*/y, 'lt'],
      [/#!?\[[^\]]*\]?/y, 'at'],
      [/\b\d[\d_]*(?:\.\d+)?(?:[iuf](?:8|16|32|64|128|size))?\b/y, 'n'],
      [/[A-Za-z_]\w*!/y, 'm'],
      [/[A-Za-z_]\w*/y, (w, rest) => sets.rustKw.has(w) ? 'k' : sets.rustTy.has(w) ? 't' : /^[A-Z]/.test(w) ? 't' : /^\s*\(/.test(rest) ? 'f' : ''],
      [/::|->|=>|[&*?]/y, 'o'],
    ],
    ruby: [
      [/#[^\n{][^\n]*|#$/y, 'c'],
      [/"(?:\\.|[^"\\])*"?/y, 's'],
      [/'(?:\\.|[^'\\])*'?/y, 's'],
      [/:[a-z_]\w*[?!]?/y, 'sy'],
      [/[a-z_]\w*:(?!:)/y, 'sy'],
      [/@{1,2}\w+/y, 'iv'],
      [/\b\d[\d_]*(?:\.\d+)?\b/y, 'n'],
      [/[A-Za-z_]\w*[?!]?/y, (w, rest) => sets.rubyKw.has(w) ? 'k' : /^[A-Z]/.test(w) ? 't' : /^\(/.test(rest) ? 'f' : ''],
      [/=>|->|&\.|\|\||&&/y, 'o'],
    ],
    shell: [
      [/^\$ /y, 'p'],
      [/#[^\n]*/y, 'c'],
      [/"(?:\\.|[^"\\])*"?/y, 's'],
      [/--?[\w-]+/y, 'at'],
      [/\b(?:cargo|rails|bundle|gem|rustup|curl|cd|git|psql|sqlx|rake|rspec|docker|fly)\b/y, 'k'],
    ],
    toml: [
      [/#[^\n]*/y, 'c'],
      [/^\s*\[[^\]]*\]/y, 'k'],
      [/"(?:\\.|[^"\\])*"?/y, 's'],
      [/\b\d[\d.]*\b/y, 'n'],
      [/^\s*[\w-]+(?=\s*=)/y, 'f'],
      [/\b(?:true|false)\b/y, 'k'],
    ],
    sql: [
      [/--[^\n]*/y, 'c'],
      [/'(?:''|[^'])*'?/y, 's'],
      [/\$\d+/y, 'iv'],
      [/\b\d+\b/y, 'n'],
      [/[A-Za-z_]\w*/y, (w) => sets.sqlKw.has(w.toUpperCase()) && w === w.toUpperCase() ? 'k' : ''],
    ],
  };
  L.rb = L.ruby; L.rs = L.rust; L.sh = L.shell; L.bash = L.shell; L.erb = L.ruby; L.yaml = L.toml;

  function highlightLine(line, lang) {
    const rules = L[lang];
    if (!rules) return esc(line);
    let out = '', i = 0, plain = '';
    const flush = () => { if (plain) { out += esc(plain); plain = ''; } };
    outer: while (i < line.length) {
      for (const [re, cls] of rules) {
        re.lastIndex = i;
        // anchored rules (^) only apply at col 0
        if (re.source.startsWith('^') && i !== 0) continue;
        const m = re.exec(line);
        if (m && m.index === i && m[0].length) {
          const c = typeof cls === 'function' ? cls(m[0], line.slice(i + m[0].length)) : cls;
          flush();
          out += c ? `<span class="tk-${c}">${esc(m[0])}</span>` : esc(m[0]);
          i += m[0].length;
          continue outer;
        }
      }
      plain += line[i++];
    }
    flush();
    return out;
  }

  function highlight(code, lang) {
    return code.split('\n').map((l) => highlightLine(l, lang)).join('\n');
  }

  window.HL = { highlight, highlightLine, esc };
})();
