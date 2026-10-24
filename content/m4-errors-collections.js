// Module 4: Errors, Strings & Collections. Format documented in m1-foundations.js.
COURSE.modules.push({
  order: 4,
  id: 'm4',
  title: 'Errors, Strings & Collections',
  blurb: 'The everyday stuff: rescue becomes Result and ?, Ruby\'s one String becomes String and &amp;str, and Enumerable becomes zero-cost iterators.',
  lessons: [
    // ------------------------------------------------------------------ 4.1
    {
      id: 'result-errors',
      title: 'Result & ? (rescue, but typed)',
      subtitle: 'Errors are values you return, and the ? operator propagates them in one character.',
      tags: ['result', 'errors', 'rescue', 'raise', 'unwrap', 'expect', 'thiserror', 'anyhow', 'panic'],
      scenes: [
        {
          type: 'title', kicker: 'Module 4 · Lesson 1', title: 'Result & ? (rescue, but typed)',
          subtitle: 'No exceptions. Failure is part of the return type.',
          beats: [
            { say: 'In Ruby, anything can raise, and you find out by reading the docs or by getting paged.' },
            { say: 'Rust has no exceptions. A function that can fail says so in its signature, and the compiler makes sure you deal with it.' },
          ],
        },
        {
          title: 'raise / rescue → Result',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'age.rb', size: 16, code: `def parse_age(str)
  Integer(str)
rescue ArgumentError => e
  puts "bad: #{e.message}"
  nil
end

parse_age("abc")  # => nil` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'age.rs', size: 16, code: `use std::num::ParseIntError;

fn parse_age(s: &str) -> Result<u8, ParseIntError> {
    s.parse::<u8>()
}

match parse_age("abc") {
    Ok(age) => println!("age {age}"),
    Err(e) => println!("bad: {e}"),
}` },
          ],
          beats: [
            { say: 'Here is a familiar Ruby pattern. Integer raises on bad input, so we rescue it and return nil.', type: { rb: 'all' }, lines: { rb: [2, 3, 4, 5] } },
            { say: 'Nothing in the method signature warns callers that it can fail. You have to read the body to know.', lines: { rb: [1] } },
            { say: 'In Rust, the return type says it out loud. This returns a Result: either a u8 age, or a ParseIntError.', type: { rs: 5 }, lines: { rs: [3] } },
            { say: 'Callers handle both cases with match. Ok carries the value, Err carries the error. Forget a branch and it will not compile.', type: { rs: 'all' }, lines: { rs: [7, 8, 9, 10] }, note: 'Think of <code>match</code> on a Result as a <code>begin/rescue</code> the compiler checks for you.' },
          ],
        },
        {
          title: 'Result is just an enum',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'std (simplified)', code: `enum Result<T, E> {
    Ok(T),    // success, holding a T
    Err(E),   // failure, holding an E
}` },
            { id: 'k', kind: 'cards', items: [
              { icon: '✅', title: 'Ok(T)', body: 'The happy path. The value you wanted is inside.', cls: 'ok' },
              { icon: '🧯', title: 'Err(E)', body: 'An expected failure: not found, invalid, timeout. It is a value, not a jump.', cls: 'bad' },
              { icon: '📜', title: 'In the signature', body: 'Callers see <code>-&gt; Result&lt;User, DbError&gt;</code> and know what can go wrong.', cls: 'rust' },
            ] },
          ],
          beats: [
            { say: 'There is no magic here. Result is an ordinary enum from the standard library, with two variants.', type: { c: 'all' } },
            { say: 'Ok wraps the success value.', show: 'k.0', lines: { c: [2] } },
            { say: 'Err wraps the failure. It is just data you return. Nothing is thrown and the stack does not unwind.', show: 'k.1', lines: { c: [3] } },
            { say: 'Because it lives in the type, every caller can see exactly how a function can fail. It is documentation the compiler enforces.', show: 'k.2' },
          ],
        },
        {
          title: 'The ? operator: early return on Err',
          blocks: [
            { id: 'long', kind: 'code', lang: 'rust', label: 'without ?', size: 18, code: `fn load_config(path: &str) -> Result<String, io::Error> {
    let text = match fs::read_to_string(path) {
        Ok(t) => t,
        Err(e) => return Err(e),
    };
    Ok(text.trim().to_string())
}` },
            { id: 'short', kind: 'code', lang: 'rust', label: 'with ?', size: 18, code: `fn load_config(path: &str) -> Result<String, io::Error> {
    let text = fs::read_to_string(path)?;
    Ok(text.trim().to_string())
}` },
          ],
          beats: [
            { say: 'Matching every Result by hand gets noisy fast. Look at this: four lines just to say "if it failed, pass the error up".', type: { long: 'all' }, lines: { long: [2, 3, 4, 5] } },
            { say: 'The question mark operator does exactly that in one character.', type: { short: 'all' }, lines: { short: [2] } },
            { say: 'If the Result is Ok, question mark unwraps the value and carries on. If it is Err, it returns that error from the current function immediately.', lines: { short: [2] }, note: '<code>?</code> is an exception bubbling up, but visible in the code and in the signature.' },
            { say: 'So question mark only works inside a function that itself returns a Result. You get the ergonomics of exceptions, with every exit point marked.', lines: { short: [1] } },
          ],
        },
        {
          type: 'checkpoint',
          q: 'This does not compile. Why?',
          code: `fn main() {
    let n: i32 = "42".parse()?;
    println!("{n}");
}`,
          options: ['<code>parse</code> needs a turbofish', '<code>main</code> returns <code>()</code>, so <code>?</code> has nowhere to send the error', '<code>?</code> only works on <code>Option</code>', 'You cannot parse a string literal'],
          answer: 1,
          explain: '<code>?</code> returns the error from the enclosing function, so that function must return a <code>Result</code> (or <code>Option</code>). Fix it with <code>fn main() -&gt; Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt;</code> and add <code>Ok(())</code> at the end.',
          beats: [{ say: 'Checkpoint. The question mark is right there. So why does the compiler complain?' }],
        },
        {
          title: 'unwrap & expect: the bang methods',
          layout: 'split',
          blocks: [
            { id: 't', kind: 'table', side: 'left', cls: 'sm', head: ['Rails', 'Rust'], rows: [
              ['<code>User.find(id)</code> raises', '<code>.unwrap()</code> panics'],
              ['<code>save!</code> with a message', '<code>.expect("why")</code>'],
              ['<code>find_by</code> + check', '<code>?</code> / <code>match</code>'],
              ['<code>x || default</code>', '<code>.unwrap_or(default)</code>'],
            ] },
            { id: 'c', kind: 'code', lang: 'rust', side: 'right', label: 'main.rs', size: 16, code: `// at boot: crashing early is fine
let port: u16 = env::var("PORT")
    .unwrap_or_else(|_| "3000".into())
    .parse()
    .expect("PORT must be a number");

// in a request: never unwrap input!
let id: i64 = params.id.parse()?;` },
            { id: 'b', kind: 'text', style: 'callout', html: '<code>unwrap</code> is fine in tests, prototypes and at boot. In request-handling code, return the error with <code>?</code>.' },
          ],
          beats: [
            { say: 'Sometimes you know a failure is a bug, not a situation to handle. Rails has bang methods for that, and Rust has unwrap and expect.', show: 't.0' },
            { say: 'unwrap takes the Ok value or panics. expect does the same, with a message you choose. It is like save with a bang.', show: 't.1' },
            { say: 'When failure is a normal outcome, like find_by, use question mark or match instead. And unwrap_or is your double pipe default.', show: ['t.2', 't.3'] },
            { say: 'Reading config at boot is a fine place to expect. If the port is garbage, crash loudly before taking traffic.', type: { c: 5 }, lines: { c: [2, 3, 4, 5] } },
            { say: 'But inside a request, never unwrap user input. One bad parameter would panic the handler. Propagate the error instead.', type: { c: 'all' }, lines: { c: [8] }, show: 'b' },
          ],
        },
        {
          title: 'Custom errors: exception classes → enums',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'errors.rb', size: 16, code: `class SignupError < StandardError; end
class EmailTaken < SignupError; end
class WeakPassword < SignupError; end

begin
  signup!(params)
rescue EmailTaken
  render :taken
rescue WeakPassword
  render :weak
end` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'errors.rs', size: 16, code: `#[derive(Debug)]
enum SignupError {
    EmailTaken,
    WeakPassword { min: usize },
    Io(std::io::Error),
}

impl From<std::io::Error> for SignupError {
    fn from(e: std::io::Error) -> Self {
        SignupError::Io(e)
    }
}` },
          ],
          beats: [
            { say: 'In Ruby you model failure kinds with a hierarchy of exception classes, and rescue them one by one.', type: { rb: 'all' } },
            { say: 'In Rust, the idiomatic version is one enum, with a variant per failure.', type: { rs: 6 }, lines: { rs: [2, 3, 4, 5, 6] } },
            { say: 'Variants can carry data, like the minimum password length, or a lower-level error that caused this one.', lines: { rs: [4, 5] } },
            { say: 'Implementing From lets question mark convert automatically. An io Error hit inside signup becomes a SignupError on the way out.', type: { rs: 'all' }, lines: { rs: [8, 9, 10, 11, 12] }, note: '<code>?</code> calls <code>From::from</code> on the error for you. That is how different error types compose.' },
            { say: 'And because it is an enum, a match over SignupError must cover every variant. Add a new failure, and the compiler shows you every caller to update.' },
          ],
        },
        {
          title: 'thiserror for libraries, anyhow for apps',
          layout: 'split',
          blocks: [
            { id: 'te', kind: 'code', lang: 'rust', label: 'lib: thiserror', size: 16, code: `use thiserror::Error;

#[derive(Debug, Error)]
enum SignupError {
    #[error("email {0} is taken")]
    EmailTaken(String),
    #[error("password too short")]
    WeakPassword,
    #[error(transparent)]
    Io(#[from] std::io::Error),
}` },
            { id: 'ah', kind: 'code', lang: 'rust', label: 'app: anyhow', size: 16, code: `use anyhow::{Context, Result};

fn main() -> Result<()> {
    let raw = std::fs::read_to_string("app.toml")
        .context("reading app.toml")?;
    println!("{} bytes", raw.len());
    Ok(())
}` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Callers need to <em>match</em> on it? Use <b>thiserror</b>. You only need to <em>report</em> it? Use <b>anyhow</b>.' },
          ],
          beats: [
            { say: 'Writing Display and From implementations by hand is boilerplate. Two crates remove nearly all of it.', show: [] },
            { say: 'thiserror derives everything for your error enums. The error attribute is the message, and hash from generates the From conversion.', type: { te: 'all' }, lines: { te: [5, 6, 9, 10] } },
            { say: 'Use it in libraries and domain code, where callers need to match on specific failures, like rescuing a specific exception class.', lines: { te: [3, 4] } },
            { say: 'anyhow is for application code. Its Result accepts any error, and context adds a human-readable breadcrumb, like a wrapped exception message.', type: { ah: 'all' }, lines: { ah: [3, 4, 5] } },
            { say: 'The rule of thumb is simple.', show: 'n' },
          ],
        },
        {
          title: 'panic! vs Result',
          blocks: [
            { id: 'k', kind: 'cards', items: [
              { icon: '🧯', title: 'Result', body: 'Expected failures: validation, not found, network down, bad input. The caller decides what to do.', cls: 'ok' },
              { icon: '💥', title: 'panic!', body: 'Bugs and broken invariants: index out of bounds, an "impossible" state. Like an unhandled exception and a 500.', cls: 'bad' },
            ] },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              { icon: '🌐', text: 'Web frameworks catch a panicking handler, but treat it as a crash, not as control flow' },
              { icon: '🚫', text: 'Never use panics for flow control the way some Rails code uses <code>raise</code>/<code>rescue</code>' },
              { icon: '🔜', text: 'In Module 5, your error enum becomes HTTP responses: <code>NotFound</code> → 404' },
            ] },
          ],
          beats: [
            { say: 'So when do you return a Result, and when do you panic?' },
            { say: 'Return a Result for anything that can reasonably happen: bad input, a missing record, a dropped connection.', show: 'k.0' },
            { say: 'Panic is for bugs, when the program reaches a state that should be impossible. It is the unhandled exception that becomes a five hundred.', show: 'k.1' },
            { say: 'Do not use panics as control flow, the way Rails code sometimes rescues its way through logic.', show: ['b.0', 'b.1'] },
            { say: 'And in Module 5 you will see your error enums map straight onto HTTP status codes.', show: 'b.2' },
          ],
        },
      ],
      summary: {
        tldr: 'Rust has no exceptions. Fallible functions return <code>Result&lt;T, E&gt;</code>, which is <code>Ok(value)</code> or <code>Err(error)</code>. The <code>?</code> operator returns the error early and converts it with <code>From</code>. Use <code>unwrap</code>/<code>expect</code> only where a failure is a bug. Model your errors as enums, with <b>thiserror</b> for libraries and <b>anyhow</b> for apps.',
        points: [
          '<code>Result&lt;T, E&gt;</code> is an ordinary enum: <code>Ok(T)</code> or <code>Err(E)</code>. Failure is part of the signature.',
          '<code>match</code> handles both cases. <code>?</code> unwraps <code>Ok</code> or returns <code>Err</code> early from the current function.',
          '<code>?</code> converts errors with <code>From</code>, so lower-level errors compose into your own error enum.',
          '<code>unwrap</code>/<code>expect</code> panic on failure. They are like bang methods: fine at boot and in tests, not on user input.',
          'Use custom error enums with <b>thiserror</b> in libraries, and <b>anyhow</b> + <code>.context()</code> in applications.',
          'Panics are for bugs. Expected failures are <code>Result</code>s.',
        ],
        rosetta: [
          ['<code>raise ArgumentError</code>', '<code>return Err(MyError::Invalid)</code>'],
          ['<code>rescue ArgumentError =&gt; e</code>', '<code>match r { Err(e) =&gt; … }</code>'],
          ['Exception bubbling up the stack', '<code>?</code> operator'],
          ['<code>User.find(id)</code> / <code>save!</code>', '<code>.unwrap()</code> / <code>.expect("…")</code>'],
          ['<code>value || default</code>', '<code>.unwrap_or(default)</code> / <code>.unwrap_or_default()</code>'],
          ['<code>class EmailTaken &lt; SignupError</code>', '<code>enum SignupError { EmailTaken, … }</code>'],
          ['<code>raise Wrapped, "ctx"</code> (cause)', '<code>.context("ctx")?</code> (anyhow)'],
          ['Unhandled exception → 500', '<code>panic!</code>'],
        ],
        gotchas: [
          '<code>?</code> only works inside functions that return <code>Result</code> (or <code>Option</code>). <code>main</code> can return <code>Result</code> too.',
          '<code>?</code> on a <code>Result</code> inside a function returning <code>Option</code> does not compile. Convert with <code>.ok()?</code>.',
          'A forgotten <code>Result</code> triggers an <code>unused_must_use</code> warning. Do not ignore it.',
          'Calling <code>.unwrap()</code> in a web handler turns a bad request into a crash. Use <code>?</code>.',
        ],
        code: `use anyhow::{Context, Result};

fn port() -> Result<u16> {
    let raw = std::env::var("PORT").context("PORT not set")?;
    let port = raw.parse().context("PORT must be a number")?;
    Ok(port)
}

fn main() {
    match port() {
        Ok(p) => println!("listening on {p}"),
        Err(e) => eprintln!("config error: {e:#}"),
    }
}`,
        links: [['The Book, ch. 9: Error Handling', 'https://doc.rust-lang.org/book/ch09-00-error-handling.html'], ['thiserror', 'https://docs.rs/thiserror'], ['anyhow', 'https://docs.rs/anyhow']],
      },
      quiz: [
        { type: 'mcq', q: 'What does <code>?</code> do when applied to an <code>Err(e)</code>?', options: ['Panics with the error message', 'Returns <code>Err(From::from(e))</code> from the current function', 'Replaces it with a default value', 'Logs the error and continues'], answer: 1, explain: '<code>?</code> is early return plus a <code>From</code> conversion of the error.' },
        { type: 'compiles', code: `fn double(s: &str) -> i32 {
    let n: i32 = s.parse()?;
    n * 2
}`, answer: false, explain: '<code>?</code> returns the error from the current function, so that function must itself return a <code>Result</code>. This one returns a plain <code>i32</code>. Change it to <code>Result&lt;i32, ParseIntError&gt;</code> and return <code>Ok(n * 2)</code>.' },
        { type: 'fill', q: 'Complete the function so it propagates parse errors and returns the sum.', code: `fn total(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {
    let x: i32 = a.parse()___;
    let y: i32 = b.parse()?;
    ___(x + y)
}`, answers: [['?'], ['Ok', 'Result::Ok']], explain: '<code>?</code> propagates the error, and the success value must be wrapped in <code>Ok(...)</code>.' },
        { type: 'match', q: 'Match the Ruby idiom to its Rust counterpart.', pairs: [['<code>rescue =&gt; e</code>', 'match … Err(e) =>'], ['<code>raise NotFound</code>', 'return Err(NotFound)'], ['<code>save!</code> (raises)', '.expect("…")'], ['<code>value || default</code>', '.unwrap_or(default)'], ['<code>class MyError &lt; StandardError</code>', 'enum MyError + thiserror']] },
        { type: 'order', q: 'Put the steps of <code>let v = thing()?;</code> in order, for the case where <code>thing()</code> fails.', items: ['Evaluate thing() to a Result', 'See that it is Err(e)', 'Convert e with From::from', 'Return Err(converted) from the enclosing function'], explain: 'The code after the <code>?</code> never runs on the error path.' },
        { type: 'mcq', q: 'You are building a web app binary and just want errors with context in your logs. Which crate fits best?', options: ['<code>thiserror</code>', '<code>anyhow</code>', '<code>serde</code>', 'None. Use <code>unwrap</code> everywhere.'], answer: 1, explain: '<b>anyhow</b> is designed for applications. <b>thiserror</b> is for typed errors that callers match on, usually in libraries or domain modules.' },
      ],
      practice: [
        {
          title: 'Return a Result and use ?',
          prompt: 'Two tiny functions, both from the video. <code>parse_port</code> returns the <code>Result</code> from <code>parse</code>. <code>next_port</code> calls it with <code>?</code> and adds one. Fill in the two TODOs. Expected output: <code>next port: 3001</code> then <code>bad port: invalid digit found in string</code>. Until you finish, it prints <code>next port: 0</code> twice.',
          starter: `use std::num::ParseIntError;

// The signature says out loud that this can fail.
fn parse_port(s: &str) -> Result<u16, ParseIntError> {
    // TODO 1: parse \`s\` as a u16 and return the Result as it is
    Ok(0)
}

fn next_port(s: &str) -> Result<u16, ParseIntError> {
    // TODO 2: get the port with \`?\`, then return Ok(port + 1)
    Ok(0)
}

fn main() {
    for s in ["3000", "abc"] {
        match next_port(s) {
            Ok(p) => println!("next port: {p}"),
            Err(e) => println!("bad port: {e}"),
        }
    }
}
`,
          hints: [
            'In the first scene of the lesson, the whole body of <code>parse_age</code> is just <code>s.parse::&lt;u8&gt;()</code>. Do the same with <code>u16</code>.',
            'In <code>next_port</code>, write <code>let port = parse_port(s)?;</code>. If it fails, <code>?</code> returns the error from <code>next_port</code> right away.',
            'Finish with <code>Ok(port + 1)</code>: put the good value back inside <code>Ok</code>.',
          ],
          solution: `use std::num::ParseIntError;

// The signature says out loud that this can fail.
fn parse_port(s: &str) -> Result<u16, ParseIntError> {
    s.parse::<u16>()
}

fn next_port(s: &str) -> Result<u16, ParseIntError> {
    let port = parse_port(s)?;
    Ok(port + 1)
}

fn main() {
    for s in ["3000", "abc"] {
        match next_port(s) {
            Ok(p) => println!("next port: {p}"),
            Err(e) => println!("bad port: {e}"),
        }
    }
}
`,
          explain: 'The <code>?</code> on <code>parse_port(s)</code> unwraps the <code>Ok</code> value, or returns the <code>Err</code> from <code>next_port</code> immediately. That is why <code>"abc"</code> never reaches <code>port + 1</code>. Both functions use the same error type, <code>ParseIntError</code>, so no conversion was needed. The next exercise adds one.',
        },
        {
          title: 'Your own error type',
          prompt: 'Now the function can fail in two ways, so it returns your own enum, like <code>SignupError</code> in the video. The starter does not compile on purpose: the compiler says <code>?</code> couldn\'t convert the error to <code>PortError</code>, because <code>PortError</code> does not implement <code>From&lt;ParseIntError&gt;</code>. TODO 1: add that impl. TODO 2: return <code>Err(PortError::TooLow)</code> for ports below 1024. Expected output: <code>port 3000</code>, <code>too low</code>, <code>not a number: invalid digit found in string</code>.',
          starter: `use std::num::ParseIntError;

#[derive(Debug)]
enum PortError {
    NotANumber(ParseIntError),
    TooLow,
}

// TODO 1: implement From<ParseIntError> for PortError, so \`?\` can convert the error
//         (same shape as the SignupError example in the video)

fn parse_port(s: &str) -> Result<u16, PortError> {
    let port = s.parse::<u16>()?;
    // TODO 2: if the port is below 1024, return Err(PortError::TooLow)
    Ok(port)
}

fn main() {
    for s in ["3000", "80", "abc"] {
        match parse_port(s) {
            Ok(p) => println!("port {p}"),
            Err(PortError::TooLow) => println!("too low"),
            Err(PortError::NotANumber(e)) => println!("not a number: {e}"),
        }
    }
}
`,
          hints: [
            'Copy the shape of <code>impl From&lt;std::io::Error&gt; for SignupError</code> from the video. Here the input type is <code>ParseIntError</code>.',
            'The body of <code>from</code> wraps the error in your variant: <code>PortError::NotANumber(e)</code>.',
            'TODO 2: <code>if port &lt; 1024 { return Err(PortError::TooLow); }</code>. This is the longhand <code>return Err(e)</code> from the <code>?</code> scene.',
          ],
          solution: `use std::num::ParseIntError;

#[derive(Debug)]
enum PortError {
    NotANumber(ParseIntError),
    TooLow,
}

impl From<ParseIntError> for PortError {
    fn from(e: ParseIntError) -> Self {
        PortError::NotANumber(e)
    }
}

fn parse_port(s: &str) -> Result<u16, PortError> {
    let port = s.parse::<u16>()?;
    if port < 1024 {
        return Err(PortError::TooLow);
    }
    Ok(port)
}

fn main() {
    for s in ["3000", "80", "abc"] {
        match parse_port(s) {
            Ok(p) => println!("port {p}"),
            Err(PortError::TooLow) => println!("too low"),
            Err(PortError::NotANumber(e)) => println!("not a number: {e}"),
        }
    }
}
`,
          explain: 'With <code>From</code> in place, <code>?</code> converts the <code>ParseIntError</code> into <code>PortError::NotANumber</code> for you. The <code>match</code> in <code>main</code> has to cover every variant, so adding a new one later makes the compiler point at every caller.',
        },
        {
          title: 'The same, with thiserror',
          prompt: 'Same enum, less boilerplate: let the <code>thiserror</code> crate write <code>Display</code> and <code>From</code> for you, as in the video. The starter does not compile on purpose: it needs <code>Display</code> for <code>{e}</code> and a <code>From</code> for <code>?</code>. Three small edits fix both. Expected output: <code>port 3000</code>, <code>error: port must be 1024 or higher</code>, <code>error: not a number: invalid digit found in string</code>.',
          starter: `use std::num::ParseIntError;
use thiserror::Error;

// TODO 1: derive Error next to Debug
#[derive(Debug)]
enum PortError {
    // TODO 2: add #[error("not a number: {0}")] above this variant,
    //         and put #[from] on the ParseIntError (this replaces the hand-written From impl)
    NotANumber(ParseIntError),
    // TODO 3: add #[error("port must be 1024 or higher")] above this variant
    TooLow,
}

fn parse_port(s: &str) -> Result<u16, PortError> {
    let port = s.parse::<u16>()?;
    if port < 1024 {
        return Err(PortError::TooLow);
    }
    Ok(port)
}

fn main() {
    for s in ["3000", "80", "abc"] {
        match parse_port(s) {
            Ok(p) => println!("port {p}"),
            Err(e) => println!("error: {e}"),
        }
    }
}
`,
          hints: [
            '<code>#[derive(Debug, Error)]</code> on the enum, like <code>SignupError</code> in the thiserror scene.',
            '<code>#[error("not a number: {0}")]</code> goes above the variant, and <code>NotANumber(#[from] ParseIntError)</code> generates the <code>From</code> impl. <code>{0}</code> prints the inner error.',
            '<code>#[error("port must be 1024 or higher")]</code> goes above <code>TooLow</code>.',
          ],
          solution: `use std::num::ParseIntError;
use thiserror::Error;

#[derive(Debug, Error)]
enum PortError {
    #[error("not a number: {0}")]
    NotANumber(#[from] ParseIntError),
    #[error("port must be 1024 or higher")]
    TooLow,
}

fn parse_port(s: &str) -> Result<u16, PortError> {
    let port = s.parse::<u16>()?;
    if port < 1024 {
        return Err(PortError::TooLow);
    }
    Ok(port)
}

fn main() {
    for s in ["3000", "80", "abc"] {
        match parse_port(s) {
            Ok(p) => println!("port {p}"),
            Err(e) => println!("error: {e}"),
        }
    }
}
`,
          explain: 'Same behaviour with a fraction of the code: <code>#[from]</code> replaced the hand-written <code>impl From</code> and <code>#[error(...)]</code> replaced <code>impl Display</code>. Reach for thiserror in libraries and domain code, where callers match on specific errors.',
        },
      ],
    },

    // ------------------------------------------------------------------ 4.2
    {
      id: 'strings',
      title: 'String vs &str (and why there are two)',
      subtitle: 'Owned text and borrowed views, UTF-8 for real, and your favourite String methods translated.',
      tags: ['string', 'str', 'utf-8', 'slices', 'format', 'to_string'],
      scenes: [
        {
          type: 'title', kicker: 'Module 4 · Lesson 2', title: 'String vs &str',
          subtitle: 'Why Rust has two string types, and which one to reach for.',
          beats: [
            { say: 'Every Rubyist trips over this in week one. Ruby has one String class. Rust has two string types that show up everywhere.' },
            { say: 'By the end of this lesson you will know which is which, and which one to use in each situation.' },
          ],
        },
        {
          title: 'One String in Ruby, two in Rust',
          blocks: [
            { id: 'k', kind: 'cards', items: [
              { icon: '💎', title: 'Ruby String', body: 'One type. Heap-allocated, mutable (unless frozen), and passed around by reference.', cls: 'ruby' },
              { icon: '📦', title: 'String', body: '<b>Owned</b>, growable text on the heap. You can push to it, and it is freed when its owner goes away.', cls: 'rust' },
              { icon: '🔍', title: '&amp;str', body: 'A <b>borrowed view</b> into some text: a pointer plus a length. It is read-only and cheap to copy.', cls: 'ok' },
            ] },
            { id: 'q', kind: 'text', style: 'callout', html: '<code>String</code> is the document. <code>&amp;str</code> is a window onto part of it.' },
          ],
          beats: [
            { say: 'In Ruby, a string is a string. It lives on the heap and everything shares references to it.', show: 'k.0' },
            { say: 'Rust\'s String is the owned version. It owns a heap buffer, can grow, and is freed when its owner goes out of scope.', show: 'k.1' },
            { say: 'Ampersand str, called a string slice, is a borrowed view. It points at some UTF-8 bytes it does not own, and cannot change them.', show: 'k.2' },
            { say: 'A good mental model: the String is the document, and the str slice is a window looking at part of it.', show: 'q' },
          ],
        },
        {
          title: 'What they look like in memory',
          blocks: [
            {
              id: 'd', kind: 'diagram', w: 1150, h: 410,
              boxes: [
                { id: 'stack', x: 10, y: 0, w: 420, h: 400, label: 'Stack', cls: 'zone' },
                { id: 'heap', x: 600, y: 0, w: 540, h: 400, label: 'Heap', cls: 'zone' },
                { id: 's', x: 45, y: 80, w: 350, h: 84, label: 's: String', sub: 'ptr · len 5 · cap 5', cls: 'rust' },
                { id: 't', x: 45, y: 250, w: 350, h: 84, label: 't: &str', sub: 'ptr · len 3', cls: 'info' },
                { id: 'b0', x: 640, y: 150, w: 80, h: 70, label: 'h', sub: '0', cls: 'heap' },
                { id: 'b1', x: 735, y: 150, w: 80, h: 70, label: 'e', sub: '1', cls: 'heap' },
                { id: 'b2', x: 830, y: 150, w: 80, h: 70, label: 'l', sub: '2', cls: 'heap' },
                { id: 'b3', x: 925, y: 150, w: 80, h: 70, label: 'l', sub: '3', cls: 'heap' },
                { id: 'b4', x: 1020, y: 150, w: 80, h: 70, label: 'o', sub: '4', cls: 'heap' },
                { id: 'sl', x: 735, y: 270, w: 270, h: 56, label: '&s[1..4] = "ell"', cls: 'info' },
              ],
              arrows: [
                { id: 'ps', from: 's', to: 'b0', label: 'ptr', cls: 'rust', bend: -30 },
                { id: 'pt', from: 't', to: 'b1', label: 'ptr', cls: 'ok', bend: 40 },
              ],
            },
          ],
          beats: [
            { say: 'Let us look under the hood. We create a String with String from hello.', show: ['d.stack', 'd.heap', 'd.s'], note: '<code>let s = String::from("hello");</code>' },
            { say: 'The String itself is three numbers on the stack: a pointer, a length and a capacity. The actual bytes live on the heap.', show: ['d.b0', 'd.b1', 'd.b2', 'd.b3', 'd.b4', 'd.ps'], hl: ['d.s'] },
            { say: 'Now we take a slice of bytes one to four. That is a str: just a pointer and a length, aimed into the same heap buffer.', show: ['d.t', 'd.pt', 'd.sl'], hl: ['d.t'], note: '<code>let t: &amp;str = &amp;s[1..4];</code>' },
            { say: 'No bytes were copied. That is why string slices are so cheap, and why they cannot outlive the String they point into.', hl: ['d.b1', 'd.b2', 'd.b3'] },
          ],
        },
        {
          title: 'Where each one comes from',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', size: 18, code: `let a: &str = "hello";               // literal: baked into the binary
let b: String = String::from("hi");  // owned, on the heap
let c: String = "hi".to_string();    // same thing
let d: String = format!("{a}!");     // build a new String
let e: &str = &b;                    // borrow a String as &str
let f: &str = &d[0..3];              // slice of a String
let g: String = e.to_owned();        // copy a &str into a new String` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Going <b>&amp;str → String</b> allocates and copies (<code>to_string</code>, <code>to_owned</code>, <code>String::from</code>). Going <b>String → &amp;str</b> is free (<code>&amp;s</code>, <code>s.as_str()</code>).' },
          ],
          beats: [
            { say: 'String literals are str slices. The text is baked into your compiled binary, and the slice points at it.', type: { c: 1 }, lines: { c: [1] } },
            { say: 'To get an owned String, use String from, or to string. They do the same thing.', type: { c: 3 }, lines: { c: [2, 3] } },
            { say: 'format is your interpolation, and it always produces a new owned String.', type: { c: 4 }, lines: { c: [4] } },
            { say: 'Going the other way is cheap. Borrow a String with an ampersand and you get a str, or slice part of it with a range.', type: { c: 6 }, lines: { c: [5, 6] } },
            { say: 'And to owned copies a slice into a brand new String.', type: { c: 'all' }, lines: { c: [7] } },
            { say: 'Remember the direction. Making a String costs an allocation. Borrowing one is free.', show: 'n' },
          ],
        },
        {
          title: 'Take &str, return String',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'greeter.rb', code: `def greet(name)
  "Hello, #{name}!"
end

greet("Grace")
greet(user.name)` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'greeter.rs', size: 18, code: `fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

let owned = String::from("Ada");
greet(&owned);  // &String -> &str
greet("Grace"); // literal works too` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              { icon: '📥', text: 'Parameters: <code>&amp;str</code> accepts literals <i>and</i> borrowed Strings' },
              { icon: '🏗️', text: 'Struct fields: <code>String</code>, because the struct owns its data' },
              { icon: '📤', text: 'Returning new text: <code>String</code>' },
            ] },
          ],
          beats: [
            { say: 'In Ruby you never think about this. Pass a string in, get a string back.', type: { rb: 'all' } },
            { say: 'In Rust the idiom is: take a str slice as a parameter, and return an owned String when you build new text.', type: { rs: 3 }, lines: { rs: [1] } },
            { say: 'A str parameter accepts both literals and borrowed Strings. The compiler turns a reference to a String into a str automatically. That is called deref coercion.', type: { rs: 'all' }, lines: { rs: [6, 7] } },
            { say: 'Rules of thumb: str slices for parameters,', show: 'b.0' },
            { say: 'owned Strings for struct fields and for return values.', show: ['b.1', 'b.2'] },
          ],
        },
        {
          title: 'UTF-8 for real: no s[0]',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'irb', code: `s = "héllo"
s[1]        # => "é"
s.length    # => 5
s.bytesize  # => 6` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'main.rs', size: 16, code: `let s = "héllo";
s.len();               // 6 (bytes!)
s.chars().count();     // 5
s.chars().nth(1);      // Some('é')
&s[0..1];              // "h" (byte range)
// s[1];               // ❌ compile error
// &s[1..2];           // 💥 not a char boundary` },
            { id: 'e', kind: 'text', style: 'err', html: '<b>error[E0277]</b>: the type `str` cannot be indexed by `{integer}`' },
          ],
          beats: [
            { say: 'Ruby hides string encoding from you. Index one gives you the second character, even when it takes two bytes.', type: { rb: 'all' } },
            { say: 'Rust strings are always valid UTF-8, and len counts bytes, not characters. The e with an accent takes two bytes.', type: { rs: 2 }, lines: { rs: [2] } },
            { say: 'For characters, iterate with chars. To count them, or grab the nth one, go through that iterator.', type: { rs: 4 }, lines: { rs: [3, 4] } },
            { say: 'Indexing with a single integer is simply not allowed. It would be ambiguous, and it could not be done in constant time.', type: { rs: 'all' }, lines: { rs: [6] }, show: 'e' },
            { say: 'You can slice with a byte range, but if the range cuts a character in half, it panics at runtime. Prefer chars, or methods like split and find. And if you really want raw bytes, as bytes gives you them.', lines: { rs: [5, 7] } },
          ],
        },
        {
          type: 'checkpoint',
          q: 'Which call compiles?',
          code: `fn shout(s: &str) -> String {
    s.to_uppercase()
}
let name = String::from("ada");`,
          options: ['<code>shout(name)</code>', '<code>shout(&amp;name)</code>', '<code>shout(*name)</code>', '<code>shout(name.len())</code>'],
          answer: 1,
          explain: '<code>&amp;name</code> is a <code>&amp;String</code>, which coerces to <code>&amp;str</code>. Passing <code>name</code> by value would give a <code>String</code> where a <code>&amp;str</code> is expected: mismatched types.',
          beats: [{ say: 'Checkpoint. The function wants a str slice, and we have a String. Which call works?' }],
        },
        {
          title: 'Your String methods, translated',
          blocks: [
            { id: 't', kind: 'table', cls: 'sm', head: ['Ruby', 'Rust', 'Note'], rows: [
              ['<code>s.upcase</code>', '<code>s.to_uppercase()</code>', 'returns new String'],
              ['<code>s.strip</code>', '<code>s.trim()</code>', 'returns &amp;str, no alloc'],
              ['<code>s.split(",")</code>', '<code>s.split(\',\')</code>', 'returns an iterator'],
              ['<code>s.include?("x")</code>', '<code>s.contains("x")</code>', ''],
              ['<code>s.gsub("a", "b")</code>', '<code>s.replace("a", "b")</code>', 'regex: <code>regex</code> crate'],
              ['<code>s.start_with?("x")</code>', '<code>s.starts_with("x")</code>', ''],
              ['<code>s.empty?</code>', '<code>s.is_empty()</code>', ''],
              ['<code>s.to_i</code>', '<code>s.parse::&lt;i64&gt;()</code>', 'returns a Result!'],
            ] },
          ],
          beats: [
            { say: 'Good news: most of your favourite String methods have direct equivalents. Mostly the names change.' },
            { say: 'upcase becomes to uppercase, and strip becomes trim. Trim returns a slice of the original, so it allocates nothing.', show: ['t.0', 't.1'] },
            { say: 'split returns a lazy iterator instead of an array. Call collect if you need a Vec.', show: 't.2' },
            { say: 'include question mark becomes contains, gsub becomes replace, start with becomes starts with.', show: ['t.3', 't.4', 't.5'] },
            { say: 'Predicates lose the question mark and gain an is prefix. And to i becomes parse, which returns a Result instead of silently giving you zero.', show: ['t.6', 't.7'], hl: ['t.7'] },
          ],
        },
        {
          title: 'Building strings',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'list.rb', code: `html = +"<ul>"
%w[rust rails].each do |t|
  html << "<li>#{t}</li>"
end
html << "</ul>"` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'list.rs', size: 17, code: `let mut html = String::from("<ul>");
for t in ["rust", "rails"] {
    html.push_str(&format!("<li>{t}</li>"));
}
html.push('\\n');
let full = html + "</ul>"; // moves html

let tags = ["a", "b"].join(", ");` },
          ],
          beats: [
            { say: 'Building strings up piece by piece looks familiar. Ruby uses the shovel operator.', type: { rb: 'all' } },
            { say: 'In Rust, you need a mutable String, and push str appends a slice. push appends a single character.', type: { rs: 5 }, lines: { rs: [1, 3, 5] } },
            { say: 'The plus operator takes an owned String on the left and a str on the right. It reuses the left buffer, which means the original variable is moved.', type: { rs: 6 }, lines: { rs: [6] }, note: 'After <code>html + "…"</code> you can no longer use <code>html</code>. Ownership again!' },
            { say: 'And join works on slices of strings, just like Array join in Ruby.', type: { rs: 'all' }, lines: { rs: [8] } },
          ],
        },
      ],
      summary: {
        tldr: '<code>String</code> is owned, growable, heap-allocated text. <code>&amp;str</code> is a borrowed, read-only view: a pointer plus a length. Take <code>&amp;str</code> in parameters, store <code>String</code> in structs, return <code>String</code> from functions that build text. Strings are UTF-8, so <code>len()</code> counts bytes and you iterate characters with <code>.chars()</code>.',
        points: [
          '<code>String</code> owns its buffer. <code>&amp;str</code> borrows a view into one (or into a literal in the binary).',
          'Converting <code>&amp;str → String</code> allocates (<code>to_string</code>, <code>to_owned</code>, <code>String::from</code>, <code>format!</code>). <code>String → &amp;str</code> is free (<code>&amp;s</code>).',
          'Take <code>&amp;str</code> parameters. <code>&amp;String</code> coerces to them automatically.',
          'No integer indexing. <code>len()</code> is bytes, so use <code>.chars()</code> for characters and byte ranges only on char boundaries.',
          'Most Ruby String methods map 1:1: <code>trim</code>, <code>split</code>, <code>contains</code>, <code>replace</code>, <code>to_uppercase</code>, <code>parse</code>.',
        ],
        rosetta: [
          ['<code>String</code> (one type)', '<code>String</code> (owned) + <code>&amp;str</code> (borrowed)'],
          ['<code>"Hi #{name}"</code>', '<code>format!("Hi {name}")</code>'],
          ['<code>s.upcase</code> / <code>s.downcase</code>', '<code>s.to_uppercase()</code> / <code>s.to_lowercase()</code>'],
          ['<code>s.strip</code>', '<code>s.trim()</code>'],
          ['<code>s.include?("x")</code>', '<code>s.contains("x")</code>'],
          ['<code>s.gsub("a", "b")</code>', '<code>s.replace("a", "b")</code>'],
          ['<code>s.length</code>', '<code>s.chars().count()</code> (<code>len()</code> is bytes)'],
          ['<code>s &lt;&lt; "x"</code>', '<code>s.push_str("x")</code>'],
          ['<code>s.to_i</code>', '<code>s.parse::&lt;i64&gt;()?</code>'],
          ['<code>arr.join(", ")</code>', '<code>arr.join(", ")</code>'],
        ],
        gotchas: [
          '<code>s[0]</code> does not compile. Use <code>s.chars().next()</code>.',
          'Slicing <code>&amp;s[a..b]</code> panics if <code>a</code> or <code>b</code> is not on a character boundary.',
          '<code>a + &amp;b</code> moves <code>a</code>. Use <code>format!("{a}{b}")</code> if you need both afterwards.',
          'Prefer <code>&amp;str</code> over <code>&amp;String</code> in signatures. It accepts more callers.',
        ],
        code: `fn slug(title: &str) -> String {          // borrow in
    title.trim().to_lowercase().replace(' ', "-") // own out
}

fn main() {
    let t = String::from("  Hello Rust ");
    let s = slug(&t);                       // &String -> &str
    println!("{s} ({} chars)", s.chars().count());
}`,
        links: [['The Book, 8.2: Strings', 'https://doc.rust-lang.org/book/ch08-02-strings.html'], ['std::string::String', 'https://doc.rust-lang.org/std/string/struct.String.html'], ['primitive str', 'https://doc.rust-lang.org/std/primitive.str.html']],
      },
      quiz: [
        { type: 'compiles', code: `let s = String::from("hello");
let first = s[0];`, answer: false, explain: 'Strings cannot be indexed by an integer. Use <code>s.chars().next()</code> or a byte-range slice like <code>&amp;s[0..1]</code>.' },
        { type: 'mcq', q: 'What is the most flexible parameter type for a function that only <i>reads</i> some text?', options: ['<code>String</code>', '<code>&amp;String</code>', '<code>&amp;str</code>', '<code>Vec&lt;char&gt;</code>'], answer: 2, explain: '<code>&amp;str</code> accepts string literals, slices and (through deref coercion) <code>&amp;String</code>.' },
        { type: 'mcq', q: 'What does <code>"héllo".len()</code> return?', options: ['4', '5', '6', 'It does not compile'], answer: 2, explain: '<code>len()</code> counts bytes. <code>é</code> is 2 bytes in UTF-8, so the total is 6. <code>.chars().count()</code> is 5.' },
        { type: 'fill', q: 'Complete the idiomatic signature: borrow in, own out.', code: 'fn greet(name: ___) -> ___ {\n    format!("Hello, {name}!")\n}', answers: [['&str'], ['String']], explain: 'Read text via <code>&amp;str</code>. <code>format!</code> builds a new owned <code>String</code>.' },
        { type: 'match', q: 'Match the Ruby String method to Rust.', pairs: [['<code>upcase</code>', 'to_uppercase()'], ['<code>strip</code>', 'trim()'], ['<code>include?</code>', 'contains()'], ['<code>gsub</code> (plain text)', 'replace()'], ['<code>empty?</code>', 'is_empty()']] },
        { type: 'compiles', code: `fn label(s: &str) -> &str {
    s.trim()
}
let owned = String::from("  hi ");
println!("[{}]", label(&owned));`, answer: true, explain: '<code>&amp;owned</code> coerces to <code>&amp;str</code>, and returning a sub-slice of the input is fine. Lifetime elision ties the output to the input.' },
      ],
      practice: [
        {
          title: 'Take &amp;str, return String',
          prompt: 'Rails: <code>"  rust for rails  ".strip.upcase + "!"</code>. In Rust the function <em>borrows</em> its input as <code>&amp;str</code> and returns a new <code>String</code>. Fill in the two TODOs using the methods from the translation table in the lesson. When it works, <code>main</code> prints <code>all good ✅</code>. Until then an <code>assert_eq!</code> stops it and shows the two values it compared.',
          starter: `// Parameters borrow (&str). Results that are new text are owned Strings.
fn shout(title: &str) -> String {
    // TODO 1: trim the spaces, make it uppercase, and add a "!" at the end
    String::new()
}

fn mentions_rust(title: &str) -> bool {
    // TODO 2: return true when the title contains "Rust"
    false
}

fn main() {
    let owned = String::from("  rust for rails  ");
    // assert_eq! / assert! stop the program with an error if the check is false
    assert_eq!(shout(&owned), "RUST FOR RAILS!"); // &String works where &str is expected
    assert_eq!(shout("hi"), "HI!");
    assert!(mentions_rust("I love Rust"));
    assert!(!mentions_rust("I love Ruby"));
    println!("all good ✅");
}
`,
          hints: [
            'In the "Your String methods, translated" table, <code>strip</code> becomes <code>trim()</code> and <code>upcase</code> becomes <code>to_uppercase()</code>. Chain them: <code>title.trim().to_uppercase()</code>.',
            '<code>format!</code> builds a new <code>String</code>: <code>format!("{}!", ...)</code>. Or make the String <code>mut</code> and use <code>push(&#39;!&#39;)</code>.',
            'For <code>mentions_rust</code>, the same table has <code>include?</code> → <code>contains("x")</code>.',
          ],
          solution: `// Parameters borrow (&str). Results that are new text are owned Strings.
fn shout(title: &str) -> String {
    format!("{}!", title.trim().to_uppercase())
}

fn mentions_rust(title: &str) -> bool {
    title.contains("Rust")
}

fn main() {
    let owned = String::from("  rust for rails  ");
    // assert_eq! / assert! stop the program with an error if the check is false
    assert_eq!(shout(&owned), "RUST FOR RAILS!"); // &String works where &str is expected
    assert_eq!(shout("hi"), "HI!");
    assert!(mentions_rust("I love Rust"));
    assert!(!mentions_rust("I love Ruby"));
    println!("all good ✅");
}
`,
          explain: 'Both parameters are <code>&amp;str</code>, so <code>shout(&amp;owned)</code> (a borrowed <code>String</code>) and <code>shout("hi")</code> (a literal) both work. <code>trim()</code> returns a slice of the original, <code>to_uppercase()</code> creates a new <code>String</code>, and <code>format!</code> returns an owned <code>String</code>.',
        },
      ],
    },

    // ------------------------------------------------------------------ 4.3
    {
      id: 'collections-iterators',
      title: 'Collections & iterators',
      subtitle: 'Enumerable, compiled: Vec, HashMap, HashSet and lazy iterator chains.',
      tags: ['vec', 'hashmap', 'hashset', 'iterator', 'map', 'filter', 'fold', 'collect', 'enumerable', 'closures'],
      scenes: [
        {
          type: 'title', kicker: 'Module 4 · Lesson 3', title: 'Collections & iterators',
          subtitle: 'Everything you love about Enumerable, compiled down to tight loops.',
          beats: [
            { say: 'If there is one Ruby feature you will miss least in Rust, it is Enumerable, because Rust has it too. With a few twists.' },
          ],
        },
        {
          title: 'Array → Vec',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'irb', code: `tags = ["rust", "rails"]
tags << "sql"
tags.first    # => "rust"
tags[10]      # => nil
tags.length   # => 3` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'main.rs', size: 18, code: `let mut tags = vec!["rust", "rails"];
tags.push("sql");
tags.first();   // Some(&"rust")
tags.get(10);   // None
tags[10];       // 💥 panic: out of bounds
tags.len();     // 3` },
            { id: 'n', kind: 'text', style: 'callout', html: 'A <code>Vec&lt;T&gt;</code> holds <b>one</b> element type. Mixing strings and numbers like a Ruby Array is not allowed. Use an enum when you need variety.' },
          ],
          beats: [
            { say: 'Ruby\'s Array becomes Vec, short for vector. The vec macro is the literal syntax.', type: { rb: 'all', rs: 1 } },
            { say: 'It must be declared mut to push onto it. Push is your shovel operator.', type: { rs: 2 }, lines: { rs: [1, 2] } },
            { say: 'first and get return an Option, because the element might not exist. Get is the safe version of indexing, like Ruby returning nil.', type: { rs: 4 }, lines: { rs: [3, 4] } },
            { say: 'Square-bracket indexing out of bounds does not return nil. It panics. Use get whenever the index comes from outside.', type: { rs: 'all' }, lines: { rs: [5] } },
            { say: 'And a Vec holds exactly one type of element.', show: 'n' },
          ],
        },
        {
          title: 'Enumerable → Iterator',
          blocks: [
            { id: 't', kind: 'table', cls: 'sm', head: ['Ruby Enumerable', 'Rust Iterator'], rows: [
              ['<code>map { |x| … }</code>', '<code>.map(|x| …)</code>'],
              ['<code>select</code> / <code>reject</code>', '<code>.filter(|x| …)</code> / <code>.filter(|x| !…)</code>'],
              ['<code>reduce(0) { |acc, x| … }</code>', '<code>.fold(0, |acc, x| …)</code>'],
              ['<code>each_with_index</code>', '<code>.enumerate()</code>'],
              ['<code>find</code> / <code>any?</code> / <code>all?</code>', '<code>.find()</code> / <code>.any()</code> / <code>.all()</code>'],
              ['<code>sum</code> / <code>count</code> / <code>max_by</code>', '<code>.sum()</code> / <code>.count()</code> / <code>.max_by_key()</code>'],
              ['<code>first(3)</code> / <code>flat_map</code> / <code>zip</code>', '<code>.take(3)</code> / <code>.flat_map()</code> / <code>.zip()</code>'],
            ] },
          ],
          beats: [
            { say: 'Here is the Rosetta Stone for Enumerable. The names are almost all the same.' },
            { say: 'Blocks become closures. Pipes around the parameters, then an expression, written inside parentheses.', show: 't.0', hl: ['t.0'] },
            { say: 'select becomes filter. There is no reject, you just negate the condition. And reduce becomes fold, with the initial value first.', show: ['t.1', 't.2'] },
            { say: 'each with index becomes enumerate, which yields index and value pairs.', show: 't.3' },
            { say: 'And the rest are old friends: find, any, all, sum, count, take, flat map and zip.', show: ['t.4', 't.5', 't.6'] },
          ],
        },
        {
          title: 'A chain, side by side',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'report.rb', code: `revenue = orders
  .select { |o| o.paid? }
  .map { |o| o.total_cents }
  .sum` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'report.rs', code: `let revenue: u64 = orders
    .iter()
    .filter(|o| o.paid)
    .map(|o| o.total_cents)
    .sum();` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              { icon: '🚪', text: '<code>.iter()</code> starts the chain, borrowing each element' },
              { icon: '💤', text: 'Adapters (<code>filter</code>, <code>map</code>) are <b>lazy</b>, like Ruby\'s <code>.lazy</code>' },
              { icon: '🏁', text: 'A consumer (<code>sum</code>, <code>collect</code>, <code>count</code>) drives the loop' },
              { icon: '⚡', text: 'Compiles to one tight loop, with no intermediate arrays' },
            ] },
          ],
          beats: [
            { say: 'Here is a classic Rails report: paid orders, mapped to totals, summed.', type: { rb: 'all' } },
            { say: 'The Rust version reads almost the same. The main extra is a call to iter at the start.', type: { rs: 'all' }, lines: { rs: [2] }, show: 'b.0' },
            { say: 'Here is the big difference. In Ruby, each step builds a whole new array. Rust iterator adapters are lazy, so they do nothing on their own.', lines: { rs: [3, 4] }, show: 'b.1' },
            { say: 'Work only happens when a consumer like sum pulls values through the chain, one element at a time.', lines: { rs: [5] }, show: 'b.2' },
            { say: 'The compiler fuses the whole chain into a single loop. It is as fast as the for loop you would write by hand, so there is no reason to avoid this style.', show: 'b.3', note: 'Zero-cost abstraction: high-level code with hand-written loop performance.' },
          ],
        },
        {
          title: 'collect: back to a collection',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'users.rs', size: 18, code: `let names: Vec<String> = users.iter()
    .map(|u| u.name.clone())
    .collect();

let ids = users.iter().map(|u| u.id).collect::<Vec<i64>>();

let by_id: HashMap<i64, &User> = users.iter()   // index_by(&:id)
    .map(|u| (u.id, u))
    .collect();` },
            { id: 'n', kind: 'text', style: 'callout', html: '<code>collect</code> can build a <code>Vec</code>, <code>HashMap</code>, <code>HashSet</code>, <code>String</code>, or even a <code>Result&lt;Vec&lt;_&gt;, E&gt;</code>. You tell it which one with the type.' },
          ],
          beats: [
            { say: 'Ruby map returns an array right away. In Rust you end a chain with collect, to gather the results into a collection.', type: { c: 3 }, lines: { c: [1, 2, 3] } },
            { say: 'collect can build many kinds of collection, so it needs to know which one. Either annotate the variable, or use the turbofish: colon colon, angle brackets.', type: { c: 5 }, lines: { c: [5] }, note: '<code>::&lt;&gt;</code> is lovingly called the <b>turbofish</b>.' },
            { say: 'Collect pairs into a HashMap, and you have Rails index by.', type: { c: 'all' }, lines: { c: [7, 8, 9] } },
            { say: 'There is a neat trick too. Collecting an iterator of Results into a Result of a Vec stops at the first error.', show: 'n' },
          ],
        },
        {
          title: 'iter, iter_mut, into_iter',
          layout: 'split',
          blocks: [
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'left', items: [
              { icon: '👀', text: '<code>.iter()</code> / <code>for x in &amp;v</code><br/>borrows: <code>&amp;T</code>, v still usable' },
              { icon: '✏️', text: '<code>.iter_mut()</code> / <code>for x in &amp;mut v</code><br/>edits in place: <code>&amp;mut T</code> (like <code>map!</code>)' },
              { icon: '📦', text: '<code>.into_iter()</code> / <code>for x in v</code><br/>consumes: <code>T</code>, v is gone afterwards' },
            ] },
            { id: 'c', kind: 'code', lang: 'rust', side: 'right', label: 'prices.rs', size: 16, code: `let mut prices = vec![100, 250, 999];

for p in prices.iter_mut() {
    *p = *p * 110 / 100;   // like map!
}
for p in &prices {         // same as .iter()
    println!("{p}");
}
for p in prices {          // into_iter()
    println!("owned {p}");
}
// prices was moved, can't use it here` },
          ],
          beats: [
            { say: 'Ruby\'s each always hands you a reference to the element. Rust makes you choose between three ways to iterate, and it is ownership again.', show: [] },
            { say: 'iter borrows each element. You can look but not touch, and the vector is still there afterwards.', show: 'b.0', type: { c: 8 }, lines: { c: [6, 7, 8] } },
            { say: 'iter mut gives mutable references, so you can change elements in place, like Ruby map with a bang. Note the star to write through the reference.', show: 'b.1', lines: { c: [3, 4, 5] } },
            { say: 'into iter takes ownership of each element. A plain for loop over the vector does this, so the vector is consumed and gone afterwards.', show: 'b.2', type: { c: 'all' }, lines: { c: [9, 10, 11, 12] }, note: 'Most of the time you want <code>for x in &amp;v</code>.' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'What happens here?',
          code: `let names = vec![String::from("a"), String::from("b")];
for n in names {
    println!("{n}");
}
println!("{}", names.len());`,
          options: ['Prints a, b, then 2', 'Compile error: <code>names</code> was moved by the <code>for</code> loop', 'Runtime panic', 'Prints a, b, then 0'],
          answer: 1,
          explain: '<code>for n in names</code> calls <code>into_iter()</code>, which consumes the Vec. Write <code>for n in &amp;names</code> to borrow it instead.',
          beats: [{ say: 'Checkpoint. Look closely at how the loop iterates.' }],
        },
        {
          title: 'Hash → HashMap',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'counts.rb', code: `counts = Hash.new(0)
words.each { |w| counts[w] += 1 }

counts["rust"]   # => 3
counts["go"]     # => 0
counts.fetch("go") # KeyError` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'counts.rs', size: 16, code: `use std::collections::HashMap;

let mut counts: HashMap<&str, u32> = HashMap::new();
for w in words {
    *counts.entry(w).or_insert(0) += 1;
}

counts.get("rust");                     // Some(&3)
counts.get("go").copied().unwrap_or(0); // 0
counts["go"];                           // 💥 panic` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Ruby Hashes keep insertion order. <code>HashMap</code> iteration order is <b>arbitrary</b>. Use <code>BTreeMap</code> for sorted keys, or the <code>indexmap</code> crate for insertion order. For unique values, use <code>HashSet</code>.' },
          ],
          beats: [
            { say: 'The classic Ruby word counter uses Hash new with a default of zero.', type: { rb: 2 } },
            { say: 'In Rust, HashMap lives in std collections. You import it with use.', type: { rs: 3 }, lines: { rs: [1, 3] } },
            { say: 'The entry API is the idiomatic way to insert or update. entry finds the slot, or insert puts in zero if it is missing, and the star lets you modify the value.', type: { rs: 6 }, lines: { rs: [5] } },
            { say: 'get returns an Option. Combine it with copied and unwrap or to get Ruby\'s default value behaviour.', type: { rb: 'all', rs: 9 }, lines: { rs: [8, 9] } },
            { say: 'Bracket indexing a missing key panics, much like fetch raises a KeyError.', type: { rs: 'all' }, lines: { rs: [10], rb: [6] } },
            { say: 'One big surprise for Rubyists: the iteration order of a HashMap is not insertion order.', show: 'n' },
          ],
        },
        {
          title: 'sort_by, uniq, group_by',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'users.rs', size: 17, code: `users.sort_by_key(|u| u.age);               // sort_by(&:age)
users.sort_by(|a, b| b.name.cmp(&a.name));  // sort_by + reverse

let mut tags = vec!["b", "a", "b"];
tags.sort();
tags.dedup();                               // uniq (needs sorted!)

let mut by_role: HashMap<Role, Vec<User>> = HashMap::new();
for u in users {
    by_role.entry(u.role).or_default().push(u); // group_by(&:role)
}` },
            { id: 'n', kind: 'text', style: 'callout', html: 'These sort <b>in place</b> and need a <code>mut</code> Vec. They are like <code>sort_by!</code>, not <code>sort_by</code>.' },
          ],
          beats: [
            { say: 'A few more favourites. sort by key sorts by a field, like sort by with a symbol to proc.', type: { c: 1 }, lines: { c: [1] } },
            { say: 'sort by with a comparator gives you full control. Here, names in descending order.', type: { c: 2 }, lines: { c: [2] } },
            { say: 'dedup is uniq, with a catch: it only removes consecutive duplicates. Sort first, or collect into a HashSet.', type: { c: 6 }, lines: { c: [4, 5, 6] } },
            { say: 'There is no group by in the standard library, but the entry API makes it a three-line loop. The itertools crate adds many more Ruby-style helpers.', type: { c: 'all' }, lines: { c: [8, 9, 10, 11] } },
            { say: 'And note that all of these mutate in place, like the bang versions in Ruby.', show: 'n' },
          ],
        },
      ],
      summary: {
        tldr: 'Array → <code>Vec&lt;T&gt;</code>, Hash → <code>HashMap&lt;K, V&gt;</code>, Set → <code>HashSet&lt;T&gt;</code>. Enumerable becomes iterator chains: <code>.iter().filter().map().sum()</code>. They are lazy until a consumer like <code>sum</code> or <code>collect</code> runs them, and they compile to plain loops. Choose <code>iter</code> (borrow), <code>iter_mut</code> (edit) or <code>into_iter</code> (consume).',
        points: [
          '<code>Vec</code> holds one element type. <code>get(i)</code> returns an Option, while <code>v[i]</code> panics when out of bounds.',
          'Closures <code>|x| expr</code> replace blocks. Most Enumerable methods keep their names. The big renames are <code>select</code> → <code>filter</code> and <code>reduce</code> → <code>fold</code>.',
          'Iterator adapters are lazy. A consumer (<code>sum</code>, <code>count</code>, <code>collect</code>) runs the whole chain in one fused loop.',
          '<code>collect</code> needs a target type: annotate the variable or use the turbofish <code>::&lt;Vec&lt;_&gt;&gt;</code>.',
          '<code>for x in &amp;v</code> borrows, <code>&amp;mut v</code> edits, and <code>for x in v</code> consumes the Vec.',
          'Use the <code>HashMap</code> entry API for counting and grouping. Iteration order is not insertion order.',
        ],
        rosetta: [
          ['<code>[1, 2, 3]</code>', '<code>vec![1, 2, 3]</code>'],
          ['<code>arr &lt;&lt; x</code>', '<code>v.push(x)</code>'],
          ['<code>arr[i]</code> (nil if missing)', '<code>v.get(i)</code> → <code>Option</code>'],
          ['<code>map { |x| x * 2 }</code>', '<code>.iter().map(|x| x * 2)</code>'],
          ['<code>select</code> / <code>reject</code>', '<code>.filter(…)</code>'],
          ['<code>inject(0) { |s, x| s + x }</code>', '<code>.fold(0, |s, x| s + x)</code>'],
          ['<code>each_with_index</code>', '<code>.iter().enumerate()</code>'],
          ['<code>index_by(&amp;:id)</code>', '<code>.map(|u| (u.id, u)).collect::&lt;HashMap&lt;_, _&gt;&gt;()</code>'],
          ['<code>Hash.new(0)</code> + <code>h[k] += 1</code>', '<code>*h.entry(k).or_insert(0) += 1</code>'],
          ['<code>uniq</code>', '<code>sort()</code> + <code>dedup()</code> or a <code>HashSet</code>'],
        ],
        gotchas: [
          'A lazy chain with no consumer does nothing. The compiler warns you that iterators are lazy and do nothing unless consumed.',
          '<code>.iter()</code> yields references. In <code>filter</code> you often see <code>&amp;&amp;x</code>, so dereference or use <code>.copied()</code>.',
          '<code>dedup()</code> only removes <i>consecutive</i> duplicates.',
          '<code>for x in v</code> moves <code>v</code>. Write <code>for x in &amp;v</code> if you need it later.',
        ],
        code: `use std::collections::HashMap;

fn main() {
    let words = "the cat and the hat".split_whitespace();
    let mut counts: HashMap<&str, usize> = HashMap::new();
    for w in words {
        *counts.entry(w).or_insert(0) += 1;
    }
    let mut top: Vec<_> = counts.into_iter().collect();
    top.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));
    println!("{:?}", &top[..2]); // [("the", 2), ("and", 1)]
}`,
        links: [['The Book, ch. 13.2: Iterators', 'https://doc.rust-lang.org/book/ch13-02-iterators.html'], ['std::iter::Iterator (all methods)', 'https://doc.rust-lang.org/std/iter/trait.Iterator.html'], ['itertools', 'https://docs.rs/itertools']],
      },
      quiz: [
        { type: 'match', q: 'Match the Enumerable method with its Rust iterator equivalent.', pairs: [['<code>select</code>', 'filter'], ['<code>inject</code> / <code>reduce</code>', 'fold'], ['<code>each_with_index</code>', 'enumerate'], ['<code>any?</code>', 'any'], ['<code>first(3)</code>', 'take(3)']] },
        { type: 'compiles', code: `let v = vec![1, 2, 3];
let doubled: Vec<i32> = v.iter().map(|x| x * 2).collect();
println!("{:?} {:?}", v, doubled);`, answer: true, explain: '<code>.iter()</code> only borrows <code>v</code>, so it is still usable afterwards. <code>&amp;i32 * i32</code> works and yields an <code>i32</code>.' },
        { type: 'fill', q: 'Sum only the positive numbers.', code: 'let nums = vec![3, -1, 4, -5];\nlet total: i32 = nums.into_iter().___(|n| *n > 0).___();', answers: [['filter'], ['sum']], explain: '<code>filter</code> keeps matching items, and <code>sum</code> consumes the iterator. Total: 7.' },
        { type: 'mcq', q: 'What does this line do at runtime?', code: 'users.iter().map(|u| send_email(u));', options: ['Sends an email to every user', 'Nothing. Iterators are lazy and there is no consumer.', 'Sends one email', 'Panics'], answer: 1, explain: '<code>map</code> is lazy. Use a <code>for</code> loop or <code>.for_each(...)</code> for side effects. The compiler even warns you here.' },
        { type: 'mcq', q: 'You iterate over a <code>HashMap</code> you filled with keys a, b, c in that order. What order do you get?', options: ['a, b, c (insertion order)', 'c, b, a', 'Alphabetical', 'Unspecified. It can be any order.'], answer: 3, explain: 'Unlike Ruby Hashes, <code>HashMap</code> has no defined order. Use <code>BTreeMap</code> (sorted) or <code>indexmap</code> (insertion order).' },
        { type: 'order', q: 'Assemble: the sorted emails of active admins.', code: true, items: ['let mut emails: Vec<&str> = users', '.iter()', '.filter(|u| u.active && u.admin)', '.map(|u| u.email.as_str())', '.collect();', 'emails.sort();'], explain: 'Filter while you still have the user, then map to the email, collect, and sort in place.' },
      ],
      practice: [
        {
          title: 'Port this Ruby report',
          prompt: 'Translate these two Ruby one-liners into iterator chains, like the <code>revenue</code> chain in the video:<br/><code>orders.select(&amp;:paid).sum(&amp;:total_cents)</code><br/><code>orders.select { |o| o.total_cents &gt;= 10_000 }.map(&amp;:id)</code><br/>Fill in the two TODOs. When both work, <code>main</code> prints <code>report ok ✅</code>. Until then an <code>assert_eq!</code> stops it and shows what your function returned.',
          starter: `struct Order {
    id: u32,
    paid: bool,
    total_cents: u64,
}

// &[Order] is a borrowed list of orders, like &str is borrowed text.
fn revenue(orders: &[Order]) -> u64 {
    // Ruby: orders.select(&:paid).sum(&:total_cents)
    // TODO 1: orders.iter(), then filter the paid ones, map to total_cents, and sum
    0
}

fn big_order_ids(orders: &[Order]) -> Vec<u32> {
    // Ruby: orders.select { |o| o.total_cents >= 10_000 }.map(&:id)
    // TODO 2: same idea, but map to the id and end with collect()
    vec![]
}

fn main() {
    let orders = vec![
        Order { id: 1, paid: true, total_cents: 2_500 },
        Order { id: 2, paid: false, total_cents: 12_000 },
        Order { id: 3, paid: true, total_cents: 15_000 },
    ];
    assert_eq!(revenue(&orders), 17_500);
    assert_eq!(big_order_ids(&orders), vec![2, 3]);
    println!("report ok ✅");
}
`,
          hints: [
            'Start each chain with <code>orders.iter()</code>, like the revenue example in the video.',
            'First: <code>.filter(|o| o.paid).map(|o| o.total_cents).sum()</code>. Second: filter on <code>o.total_cents &gt;= 10_000</code> and map to <code>o.id</code>.',
            'End the second chain with <code>.collect()</code>. Like <code>let names: Vec&lt;String&gt; = ... .collect()</code> in the video, the return type <code>Vec&lt;u32&gt;</code> tells it what to build.',
          ],
          solution: `struct Order {
    id: u32,
    paid: bool,
    total_cents: u64,
}

// &[Order] is a borrowed list of orders, like &str is borrowed text.
fn revenue(orders: &[Order]) -> u64 {
    orders.iter().filter(|o| o.paid).map(|o| o.total_cents).sum()
}

fn big_order_ids(orders: &[Order]) -> Vec<u32> {
    orders
        .iter()
        .filter(|o| o.total_cents >= 10_000)
        .map(|o| o.id)
        .collect()
}

fn main() {
    let orders = vec![
        Order { id: 1, paid: true, total_cents: 2_500 },
        Order { id: 2, paid: false, total_cents: 12_000 },
        Order { id: 3, paid: true, total_cents: 15_000 },
    ];
    assert_eq!(revenue(&orders), 17_500);
    assert_eq!(big_order_ids(&orders), vec![2, 3]);
    println!("report ok ✅");
}
`,
          explain: '<code>&amp;[Order]</code> is a slice: a borrowed list, like <code>&amp;str</code> is borrowed text. The return types (<code>u64</code> and <code>Vec&lt;u32&gt;</code>) tell <code>sum</code> and <code>collect</code> what to produce. Both chains compile to single loops.',
        },
        {
          title: 'Count the words',
          prompt: 'The Ruby word counter from the video: <code>counts = Hash.new(0); words.each { |w| counts[w] += 1 }</code>. TODO 1: count the words with the entry API. TODO 2: look up <code>"go"</code>, which is not in the list, and get <code>0</code> instead of a panic. When it works, <code>main</code> prints <code>rust x3, go x0</code>. Until then it panics with "no entry found for key", because <code>counts</code> is still empty.',
          starter: `use std::collections::HashMap;

fn main() {
    let words = vec!["rust", "rails", "rust", "sql", "rust"];

    // Ruby: counts = Hash.new(0); words.each { |w| counts[w] += 1 }
    let mut counts: HashMap<&str, u32> = HashMap::new();
    for w in words {
        // TODO 1: add 1 to this word's count (the entry API from the video)
    }

    // TODO 2: look up "go" without panicking: 0 when it is missing
    let go = 99;

    // assert_eq! stops the program with an error if the two sides differ
    assert_eq!(counts["rust"], 3);
    assert_eq!(counts.get("rails"), Some(&1));
    assert_eq!(go, 0);
    println!("rust x{}, go x{}", counts["rust"], go);
}
`,
          hints: [
            'In the HashMap scene: <code>*counts.entry(w).or_insert(0) += 1;</code> goes inside the loop. <code>entry</code> finds the slot, <code>or_insert(0)</code> creates it if it is missing, and the <code>*</code> lets you change the value.',
            'For TODO 2 use <code>get</code> instead of brackets, because <code>get</code> returns an <code>Option</code>: <code>counts.get("go")</code>.',
            'Finish with <code>.copied().unwrap_or(0)</code>: Ruby\'s default value behaviour, as in the video.',
          ],
          solution: `use std::collections::HashMap;

fn main() {
    let words = vec!["rust", "rails", "rust", "sql", "rust"];

    // Ruby: counts = Hash.new(0); words.each { |w| counts[w] += 1 }
    let mut counts: HashMap<&str, u32> = HashMap::new();
    for w in words {
        *counts.entry(w).or_insert(0) += 1;
    }

    let go = counts.get("go").copied().unwrap_or(0);

    // assert_eq! stops the program with an error if the two sides differ
    assert_eq!(counts["rust"], 3);
    assert_eq!(counts.get("rails"), Some(&1));
    assert_eq!(go, 0);
    println!("rust x{}, go x{}", counts["rust"], go);
}
`,
          explain: '<code>entry(w).or_insert(0)</code> is your <code>Hash.new(0)</code>, and <code>get(...).copied().unwrap_or(0)</code> reads from it without a <code>KeyError</code>. Remember: bracket indexing a missing key panics.',
        },
      ],
    },
  ],
});
