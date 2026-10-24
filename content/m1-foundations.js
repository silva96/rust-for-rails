/*
  CONTENT FORMAT (reference for all module files)
  lesson = { id, title, subtitle, tags, scenes: [...], summary: {...}, quiz: [...], practice: [...] }

  scene types:
    { type:'title', kicker, title, subtitle, beats }
    { title, layout:'stack'|'split'|'center', blocks:[...], beats }      (content scene, default)
    { type:'checkpoint', title, q, code?, lang?, options:[..], answer:idx, explain, beats }
    (a 'recap' scene is auto-generated from summary.points)

  blocks (each needs a unique id inside the scene):
    { id, kind:'code', lang:'rust'|'ruby'|'shell'|'toml'|'sql', label, code, term?, size?, side?:'left'|'right' }
    { id, kind:'bullets', items:[string | {icon,text}], cls?:'sm' }        -> items keyed `${id}.${i}`
    { id, kind:'cards', items:[{icon,title,body,cls?:'ruby'|'rust'|'ok'|'bad'}] }
    { id, kind:'table', head:[..], rows:[[..],..], cls?:'sm' }             -> rows keyed `${id}.${i}`
    { id, kind:'text', html, style?:'big'|'callout'|'ok'|'err'|'quote' }
    { id, kind:'diagram', w, h, boxes:[{id,x,y,w,h,label,sub,cls}], arrows:[{id,from,to,label,cls,bend}] }
       boxes/arrows keyed `${id}.${boxId}` / `${id}.${arrowId}`; box cls: zone|rust|ruby|heap|ok|info|error

  beats: narration + what happens during it. Duration auto-derived from word count.
    say:   narration (also the caption)            show: key | [keys]   (persist once shown)
    type:  { codeBlockId: lineCount | 'all' }        (typewriter to that many lines during this beat)
    lines: { codeBlockId: [1-based line numbers] }   (highlight lines during this beat only)
    hl:    [keys]  (glow during this beat)          cls: { key: 'moved' | 'dropped' | 'error' ... } (persistent)
    note:  sticky-note html for this beat           dur: override seconds
  Elements never referenced by show/type appear immediately with their parent.
*/
COURSE.modules.push({
  order: 1,
  id: 'm1',
  title: 'Foundations',
  blurb: 'Rust from a Rubyist\'s point of view: why it\'s worth learning, Cargo as Bundler + Rake, and how variables and types work when nothing is dynamic.',
  lessons: [
    // ------------------------------------------------------------------ 1.1
    {
      id: 'why-rust',
      title: 'Why Rust, for a Rubyist?',
      subtitle: 'What you gain, what you give up, and why your Rails instincts still help.',
      tags: ['intro', 'performance', 'safety'],
      scenes: [
        {
          type: 'title', kicker: 'Module 1 · Lesson 1', title: 'Why Rust, for a Rubyist?',
          subtitle: 'Same love for developer happiness. Different deal with the machine.',
          beats: [
            { say: 'Welcome to Rust for Rails Devs. You already know how to ship web apps. Now we will teach your instincts a new language.' },
            { say: 'In this first lesson: why Rust is worth your time, and what changes when you move over from Ruby.' },
          ],
        },
        {
          title: 'Two languages, two bargains',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'cards', side: 'left', items: [{ icon: '💎', title: 'Ruby', body: 'Optimized for programmer happiness. Dynamic types, a garbage collector, and you find out about problems at runtime.', cls: 'ruby' }] },
            { id: 'rs', kind: 'cards', side: 'right', items: [{ icon: '🦀', title: 'Rust', body: 'Optimized for correctness and speed. Static types, no garbage collector, and you find out about problems at compile time.', cls: 'rust' }] },
            { id: 'q', kind: 'text', style: 'callout', html: 'Ruby trusts you and checks at runtime. Rust <em>verifies</em> you before the program ever runs.' },
          ],
          beats: [
            { say: 'Ruby makes a bargain: it trusts you, stays out of your way, and catches mistakes while the program runs.', show: 'rb' },
            { say: 'Rust makes the opposite bargain. The compiler checks your work up front, so whole categories of bugs never reach production.', show: 'rs' },
            { say: 'So the friction moves. You stop debugging in production and start negotiating with the compiler.', show: 'q' },
          ],
        },
        {
          title: 'What you actually get',
          blocks: [
            {
              id: 'c', kind: 'cards', items: [
                { icon: '⚡', title: 'Speed', body: 'Compiled to native code. Often 10 to 100× faster than Ruby for CPU-bound work.' },
                { icon: '🧠', title: 'Memory', body: 'No GC. <b>Ownership</b> rules free memory the moment it is no longer used.' },
                { icon: '🛡️', title: 'Safety', body: 'No nil crashes, no data races, no use-after-free. They are compile errors.' },
                { icon: '🔧', title: 'Fearless refactors', body: 'Rename a field and the compiler lists every place you need to fix.' },
                { icon: '📦', title: 'Great tooling', body: 'Cargo, rustfmt, clippy and docs.rs all come standard.' },
                { icon: '🚢', title: 'One binary', body: 'Deploy a single binary file. No Ruby version, no bundle install on the server.' },
              ],
            },
          ],
          beats: [
            { say: 'Here is what that strictness buys you.', show: [] },
            { say: 'Speed. Rust compiles to native machine code. For CPU-heavy work it is commonly ten to a hundred times faster than Ruby.', show: 'c.0' },
            { say: 'Memory. There is no garbage collector. Instead, ownership rules checked at compile time decide exactly when memory is freed. No GC pauses, and a tiny footprint.', show: 'c.1' },
            { say: 'Safety. No undefined method on nil, no data races between threads. They become compile errors instead of pager alerts.', show: 'c.2' },
            { say: 'Refactoring gets fearless. Change a type, and the compiler hands you a to-do list of everything you broke.', show: 'c.3' },
            { say: 'The tooling is excellent and it all comes standard, and you deploy one self-contained binary.', show: ['c.4', 'c.5'] },
          ],
        },
        {
          title: 'The nil you know and love',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'users_controller.rb', code: `user = User.find_by(email: params[:email])
user.name.upcase
# 💥 NoMethodError:
#   undefined method 'name' for nil` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'main.rs', code: `let user: Option<User> = find_by_email(&email);
user.name.to_uppercase();
// ❌ error[E0609]: no field \`name\`
//    on type \`Option<User>\`` },
            { id: 'ok', kind: 'text', style: 'ok', html: 'Rust has no <code>nil</code>. A value that might be missing is an <code>Option</code>, and the compiler makes you handle the <code>None</code> case.' },
          ],
          beats: [
            { say: 'Here is a bug every Rails developer has shipped. find_by returns nil, and calling name on it blows up.', type: { rb: 2 } },
            { say: 'You find out in production, from an exception tracker, at three in the morning.', type: { rb: 'all' }, lines: { rb: [3, 4] } },
            { say: 'In Rust, a lookup that might fail returns an Option: either Some, with the user inside, or None. You cannot reach inside it without first checking which one you got.', type: { rs: 2 } },
            { say: 'So this code does not even compile. The bug is caught on your laptop, in seconds.', type: { rs: 'all' }, lines: { rs: [3, 4] }, note: 'We cover <code>Option</code> fully in Module 3.' },
            { say: 'That is the core idea of this whole course. Things Ruby checks at runtime, Rust checks at compile time.', show: 'ok' },
          ],
        },
        {
          title: 'Where Rust fits next to Rails',
          blocks: [
            {
              id: 'b', kind: 'bullets', items: [
                { icon: '🧩', text: 'Native extensions for hot paths: gems like <code>magnus</code> and <code>rb-sys</code> let you call Rust from Ruby' },
                { icon: '🛰️', text: 'High-throughput services: webhooks, websockets, ingestion, proxies' },
                { icon: '🧰', text: 'CLIs and dev tools: fast, single binary, cross-platform' },
                { icon: '⚙️', text: 'Background workers that crunch data: parsing, image or PDF processing' },
                { icon: '🌐', text: 'Full web apps with Axum + SQLx, which we build in Module 5' },
              ],
            },
          ],
          beats: [
            { say: 'You do not have to throw Rails away. Rust shines right next to it.' },
            { say: 'You can write native extensions for the hot paths of a Rails app. Tools like magnus make Rust callable from Ruby.', show: 'b.0' },
            { say: 'You can carve out high throughput services, like webhook receivers or websocket servers.', show: 'b.1' },
            { say: 'Rust is fantastic for command line tools and for heavy background workers.', show: ['b.2', 'b.3'] },
            { say: 'And yes, you can build full web apps. By Module 5 you will build a JSON API with Axum and SQLx.', show: 'b.4' },
          ],
        },
        {
          type: 'checkpoint', title: 'Quick check',
          q: 'In Rust, when do you find out that you called a method on a value that might be missing?',
          options: ['At runtime, as a panic', 'At compile time, as a type error', 'Only if you write a test for it', 'Never, Rust ignores it silently'],
          answer: 1,
          explain: 'A possibly-missing value is an <code>Option&lt;T&gt;</code>, which is a different type from <code>T</code>, so the compiler rejects using it directly.',
          beats: [{ say: 'Quick check before we move on. Pick an answer to continue.' }],
        },
        {
          title: 'The mindset shift',
          layout: 'center',
          blocks: [
            { id: 't', kind: 'text', style: 'big', html: 'The compiler is not your enemy.<br/>It\'s the <em>pair programmer</em><br/>who never gets tired.' },
            { id: 'b', kind: 'bullets', cls: 'sm', items: ['Read the error messages. They are famously good.', 'Expect a learning curve around ownership. Everyone hits it.', 'Your Rails knowledge of HTTP, SQL, testing and design all still applies.'] },
          ],
          beats: [
            { say: 'One mindset shift to carry through this course.', show: 't' },
            { say: 'The compiler is your pair programmer. Its error messages are famously helpful, often down to the exact fix.', show: 'b.0' },
            { say: 'You will hit a wall around ownership. Everyone does. It passes, and we will take it slowly.', show: 'b.1' },
            { say: 'Everything you know about web apps, HTTP, SQL, testing and design still applies. You are not starting from zero.', show: 'b.2' },
          ],
        },
      ],
      summary: {
        tldr: 'Ruby checks your assumptions at runtime. Rust checks them at compile time. You give up some flexibility and get speed, low memory use, and whole classes of bugs, like nil errors and data races, that can no longer happen.',
        points: [
          'Rust is compiled, statically typed and has no garbage collector.',
          'Bugs that Ruby reports at runtime, like <code>NoMethodError</code> on nil, are compile errors in Rust.',
          'Possibly-missing values are <code>Option&lt;T&gt;</code>. Rust has no <code>nil</code>.',
          'Rust complements Rails: native extensions, fast services, CLIs, workers, or full web apps.',
          'Treat the compiler like a pair programmer and read its error messages.',
        ],
        rosetta: [
          ['<code>nil</code>', '<code>Option::None</code>'],
          ['<code>NoMethodError</code> at runtime', 'Type error at compile time'],
          ['Garbage collector', 'Ownership (compile-time memory management)'],
          ['<code>ruby app.rb</code> (interpreted)', '<code>cargo run</code> (compiled to native)'],
        ],
        gotchas: ['Compile times are slower than starting a Ruby process. Use <code>cargo check</code> for fast feedback.', 'There is no REPL-driven workflow like <code>rails console</code>. Small tests and the Playground fill that role.'],
        links: [['The Rust Book', 'https://doc.rust-lang.org/book/'], ['Rust Playground', 'https://play.rust-lang.org/'], ['magnus: Ruby ↔ Rust bindings', 'https://github.com/matsadler/magnus']],
      },
      quiz: [
        { type: 'mcq', q: 'Which statement best describes Rust\'s approach to memory?', options: ['A tracing garbage collector like Ruby\'s', 'Manual malloc/free like C', 'Ownership rules checked at compile time', 'Reference counting on every value automatically'], answer: 2, explain: 'Rust frees memory deterministically when the owner goes out of scope, and enforces the rules at compile time.' },
        { type: 'mcq', q: 'What does Rust use instead of <code>nil</code>?', options: ['<code>null</code>', '<code>Option&lt;T&gt;</code> with <code>Some</code> / <code>None</code>', '<code>undefined</code>', '<code>Nothing</code>'], answer: 1, explain: '<code>Option&lt;T&gt;</code> makes absence explicit in the type.' },
        { type: 'compiles', q: 'A function returns <code>Option&lt;User&gt;</code>. Does this compile?', code: 'let user = find_by_email(&email); // Option<User>\nlet name = user.name;', answer: false, explain: '<code>user</code> is an <code>Option&lt;User&gt;</code>, which has no <code>name</code> field. You have to unwrap or match first.' },
        { type: 'match', q: 'Match each Ruby world thing with its Rust counterpart.', pairs: [['nil', 'None'], ['NoMethodError in prod', 'compile error'], ['Garbage collector', 'ownership'], ['Ruby + bundle install on the server', 'one self-contained binary']], explain: 'All four came up in the video. You will see these mappings again and again.' },
        { type: 'mcq', q: 'Which is NOT a common way to use Rust alongside a Rails app?', options: ['A native extension for a hot code path', 'A separate high-throughput service', 'Replacing ERB templates inside the Rails view layer at runtime', 'A CLI tool for your team'], answer: 2, explain: 'Rust lives beside Rails as extensions, services or tools. It does not swap into ERB rendering.' },
      ],
      practice: [
        {
          title: 'Hello, Rustacean',
          prompt: 'Nothing to write yet: this is your first run, and the program is already complete. Press <b>Run in Rust Playground</b> and find the output under the code. Then change the text between the quotes in <code>"Rails dev"</code> to your own name and run it again. Expected output: <code>Hello, Rails dev! Welcome to Rust 🦀</code>, with your name in it the second time. <code>println!</code> ends in <code>!</code> because it is a <i>macro</i>; we will see what that means soon.',
          starter: `fn main() {
    let name = "Rails dev";
    println!("Hello, {}! Welcome to Rust 🦀", name);
}
`,
          hints: ['The Run button opens play.rust-lang.org in a new tab with your code already pasted in. Press the blue <b>Run</b> button there, and the output appears at the bottom.', '<code>{}</code> inside the text is a placeholder: <code>println!</code> fills it with the value of <code>name</code>, like <code>#{name}</code> in a Ruby string. You only need to edit what is between the quotes on the <code>let name</code> line.'],
          solution: `fn main() {
    let name = "Benjamin";
    println!("Hello, {}! Welcome to Rust 🦀", name);
}
`,
          explain: 'You just ran Rust. <code>let name = ...</code> creates a variable and <code>{}</code> prints it inside the message. Lesson 3 covers <code>let</code> properly, including a shorter form, <code>{name}</code>, that does the same job.',
        },
      ],
    },

    // ------------------------------------------------------------------ 1.2
    {
      id: 'cargo',
      title: 'Cargo is Bundler + Rake + more',
      subtitle: 'Projects, dependencies, and commands, mapped from the tools you use every day.',
      tags: ['cargo', 'crates', 'tooling', 'bundler', 'gemfile'],
      scenes: [
        {
          type: 'title', kicker: 'Module 1 · Lesson 2', title: 'Cargo is Bundler + Rake + more',
          subtitle: 'One tool to create, build, test, document and publish.',
          beats: [{ say: 'In Ruby you juggle several tools: rails new, bundler, rake, rspec, rubocop. In Rust, one tool does nearly all of it. Cargo.' }],
        },
        {
          title: 'rails new → cargo new',
          layout: 'split',
          blocks: [
            { id: 't', kind: 'code', lang: 'shell', term: true, label: 'terminal', code: `$ cargo new blog
    Creating binary (application) \`blog\` package
$ cd blog && tree
.
├── Cargo.toml
└── src
    └── main.rs` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              { icon: '📄', text: '<code>Cargo.toml</code> is your Gemfile plus your gemspec' },
              { icon: '🚪', text: '<code>src/main.rs</code> is the entry point, <code>fn main()</code>' },
              { icon: '🔒', text: '<code>Cargo.lock</code> is Gemfile.lock, created on the first build' },
              { icon: '🗂️', text: '<code>target/</code> holds build artifacts. Ignore it in git' },
            ] },
          ],
          beats: [
            { say: 'Where you would type rails new, you type cargo new. It scaffolds a project and initializes a git repo.', type: { t: 2 } },
            { say: 'The result is tiny. A manifest file and a source folder with one file.', type: { t: 'all' } },
            { say: 'Cargo dot toml plays the role of your Gemfile and gemspec combined.', show: 'b.0', lines: { t: [5] } },
            { say: 'Main dot r s is the entry point. Execution starts at the function called main.', show: 'b.1', lines: { t: [7] } },
            { say: 'After the first build you also get Cargo dot lock, the equivalent of Gemfile dot lock, and a target folder for compiled output.', show: ['b.2', 'b.3'] },
          ],
        },
        {
          title: 'Gemfile → Cargo.toml',
          layout: 'split',
          blocks: [
            { id: 'g', kind: 'code', lang: 'ruby', label: 'Gemfile', code: `source "https://rubygems.org"

gem "rails", "~> 8.0"
gem "pg"
gem "sidekiq", require: false

group :development, :test do
  gem "rspec-rails"
end` },
            { id: 'c', kind: 'code', lang: 'toml', label: 'Cargo.toml', code: `[package]
name = "blog"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.8"
sqlx = { version = "0.8", features = ["postgres"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
pretty_assertions = "1"` },
          ],
          beats: [
            { say: 'Let us put a Gemfile next to a Cargo manifest.', type: { g: 'all' } },
            { say: 'The package section describes your crate: its name, version, and the Rust edition, which is a bit like targeting a Ruby version.', type: { c: 4 }, lines: { c: [1, 2, 3, 4] } },
            { say: 'Dependencies are your gems. Packages are called crates, and they live on crates dot io instead of rubygems.', type: { c: 9 }, lines: { c: [6, 7, 8, 9], g: [3, 4, 5] } },
            { say: 'Features are a big deal in Rust. They switch optional parts of a crate on or off at compile time, so you only build what you use.', lines: { c: [8, 9] }, note: 'Version <code>"0.8"</code> means <code>^0.8</code>, much like <code>~&gt;</code> in Bundler.' },
            { say: 'And dev dependencies are your development and test group.', type: { c: 'all' }, lines: { c: [11, 12], g: [7, 8, 9] } },
          ],
        },
        {
          title: 'Your daily commands',
          blocks: [
            {
              id: 't', kind: 'table', head: ['Ruby / Rails', 'Cargo', 'What it does'], rows: [
                ['<code>bundle add pg</code>', '<code>cargo add sqlx</code>', 'Add a dependency'],
                ['<code>bundle install</code>', '<i>(automatic)</i>', 'Fetch deps on build'],
                ['<code>ruby app.rb</code>', '<code>cargo run</code>', 'Compile and run'],
                ['<i>(no equivalent)</i>', '<code>cargo check</code>', 'Type-check fast, no binary'],
                ['<code>rspec</code> / <code>rails test</code>', '<code>cargo test</code>', 'Run tests'],
                ['<code>rubocop -a</code>', '<code>cargo fmt</code> + <code>cargo clippy</code>', 'Format and lint'],
                ['<code>yard doc</code>', '<code>cargo doc --open</code>', 'Generate docs'],
              ],
            },
          ],
          beats: [
            { say: 'Here are the commands you will type every day, next to their Ruby equivalents.' },
            { say: 'cargo add adds a dependency, like bundle add. There is no separate install step, because Cargo fetches dependencies when it builds.', show: ['t.0', 't.1'] },
            { say: 'cargo run compiles and runs your program.', show: 't.2' },
            { say: 'cargo check is your new best friend. It type-checks without producing a binary, so it is much faster. Run it constantly.', show: 't.3', hl: ['t.3'] },
            { say: 'cargo test runs your tests. No extra gem needed.', show: 't.4' },
            { say: 'cargo fmt formats your code, clippy lints it, and cargo doc builds browsable documentation for your project and every dependency.', show: ['t.5', 't.6'] },
          ],
        },
        {
          title: 'Debug vs release builds',
          layout: 'split',
          blocks: [
            { id: 't', kind: 'code', lang: 'shell', term: true, label: 'terminal', code: `$ cargo run
   Compiling blog v0.1.0
    Finished \`dev\` profile [unoptimized + debuginfo]
     Running \`target/debug/blog\`
$ cargo build --release
    Finished \`release\` profile [optimized]
$ ./target/release/blog` },
            { id: 'c', kind: 'cards', items: [
              { icon: '🐢', title: 'dev', body: 'Fast to compile, slow to run. Has overflow checks and debug info.' },
              { icon: '🚀', title: 'release', body: 'Slower to compile, fully optimized. This is what you deploy.', cls: 'rust' },
            ] },
          ],
          beats: [
            { say: 'There is one concept Ruby does not have: build profiles.', type: { t: 4 } },
            { say: 'By default you get a debug build. It compiles quickly but runs slower, with extra safety checks.', show: 'c.0', lines: { t: [3] } },
            { say: 'Pass dash dash release for an optimized build. Always benchmark and deploy in release mode. Debug builds can be ten times slower.', type: { t: 'all' }, show: 'c.1', lines: { t: [5, 6, 7] }, note: 'Deploying a Rust app = copying one binary from <code>target/release</code>.' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'You want quick feedback on type errors while editing, without waiting for a full build. Which command?',
          options: ['<code>cargo run --release</code>', '<code>cargo check</code>', '<code>cargo doc</code>', '<code>cargo publish</code>'],
          answer: 1,
          explain: '<code>cargo check</code> runs the compiler front-end, including the type and borrow checker, but skips code generation.',
          beats: [{ say: 'Checkpoint. Which command gives you the fastest feedback loop?' }],
        },
        {
          title: 'Workspaces ≈ a monorepo of engines',
          blocks: [
            { id: 'c', kind: 'code', lang: 'toml', label: 'Cargo.toml (root)', code: `[workspace]
members = ["api", "core", "worker"]
resolver = "2"` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: ['Like a Rails app with engines or packwerk packs: several crates, one lockfile, one <code>target/</code>', '<code>cargo test --workspace</code> tests everything; <code>-p api</code> targets one crate', 'Library crates have <code>src/lib.rs</code>; binaries have <code>src/main.rs</code>'] },
          ],
          beats: [
            { say: 'As apps grow, Rails teams reach for engines or packwerk. Rust has workspaces.', type: { c: 'all' } },
            { say: 'A workspace groups several crates under one lockfile and one build folder.', show: 'b.0' },
            { say: 'You can test them all at once, or target a single package with dash p.', show: 'b.1' },
            { say: 'Shared code goes in library crates with a lib dot r s, and executables have a main dot r s.', show: 'b.2' },
          ],
        },
      ],
      summary: {
        tldr: 'Cargo replaces <code>rails new</code>, Bundler, Rake, the test runner, the formatter and the doc generator. <code>Cargo.toml</code> is your Gemfile. Crates are gems. Use <code>cargo check</code> for fast feedback, and ship <code>--release</code> builds.',
        points: [
          '<code>cargo new</code> scaffolds a project with <code>Cargo.toml</code> and <code>src/main.rs</code>.',
          '<code>Cargo.toml</code> ≈ Gemfile + gemspec, and <code>Cargo.lock</code> ≈ Gemfile.lock. Packages are <b>crates</b> on crates.io.',
          '<b>Features</b> toggle optional parts of a crate at compile time.',
          '<code>cargo check</code> is the fastest feedback loop. <code>cargo run</code>, <code>test</code>, <code>fmt</code>, <code>clippy</code> and <code>doc</code> cover the rest.',
          'Debug builds are for development. Benchmark and deploy with <code>--release</code>.',
        ],
        rosetta: [
          ['<code>rails new app</code>', '<code>cargo new app</code>'],
          ['Gemfile / gemspec', '<code>Cargo.toml</code>'],
          ['Gemfile.lock', '<code>Cargo.lock</code>'],
          ['gem (rubygems.org)', 'crate (crates.io)'],
          ['<code>bundle add x</code>', '<code>cargo add x</code>'],
          ['<code>group :development, :test</code>', '<code>[dev-dependencies]</code>'],
          ['<code>rubocop</code>', '<code>cargo fmt</code> + <code>cargo clippy</code>'],
          ['Rails engines / packwerk', 'Cargo workspaces'],
        ],
        gotchas: ['Commit <code>Cargo.lock</code> for applications, as you do with Gemfile.lock.', 'Do not benchmark debug builds. Their numbers mean nothing.', 'A crate name with a dash, like <code>tower-http</code>, is imported with an underscore: <code>use tower_http::...</code>.'],
        code: `$ cargo new blog && cd blog
$ cargo add serde --features derive
$ cargo check      # fast type-check
$ cargo run        # build + run (debug)
$ cargo test       # run tests
$ cargo clippy     # lint
$ cargo build --release`,
        lang: 'shell',
        links: [['The Cargo Book', 'https://doc.rust-lang.org/cargo/'], ['crates.io', 'https://crates.io'], ['lib.rs (curated crate index)', 'https://lib.rs']],
      },
      quiz: [
        { type: 'match', q: 'Match the Ruby tool with its Cargo counterpart.', pairs: [['Gemfile', 'Cargo.toml'], ['Gemfile.lock', 'Cargo.lock'], ['bundle add', 'cargo add'], ['rubocop', 'cargo clippy'], ['rspec', 'cargo test']] },
        { type: 'mcq', q: 'What does <code>cargo check</code> do?', options: ['Downloads and verifies dependency checksums', 'Type-checks and borrow-checks without producing a binary', 'Runs the test suite', 'Checks for outdated crates'], answer: 1, explain: 'It skips code generation, so it is much faster than <code>cargo build</code>.' },
        { type: 'fill', q: 'Complete the manifest so <code>serde</code> is a regular dependency and <code>mockall</code> is test-only.', lang: 'toml', code: '[___]\nserde = "1"\n\n[___]\nmockall = "0.13"', answers: [['dependencies'], ['dev-dependencies']], explain: '<code>[dev-dependencies]</code> works like Bundler\'s <code>:development, :test</code> group.' },
        { type: 'mcq', q: 'Your Rust API feels slow in a load test. What should you check first?', options: ['Whether you need a JIT', 'Whether it was built with <code>--release</code>', 'Whether the GC is tuned', 'Whether you ran <code>bundle install</code>'], answer: 1, explain: 'Debug builds skip optimizations and can be dramatically slower.' },
        { type: 'order', q: 'Put a typical new-project flow in order.', items: ['cargo new my_api', 'cargo add axum tokio', 'cargo check', 'cargo test', 'cargo build --release'], explain: 'Scaffold, add deps, iterate with check, test, then build for release.' },
      ],
      practice: [
        {
          title: 'Use a crate (serde_json)',
          prompt: 'In a real project you would run <code>cargo add serde_json</code>. That adds one line under <code>[dependencies]</code> in <code>Cargo.toml</code>, just like the <code>axum</code> and <code>tokio</code> lines in the lesson. The Playground already has this crate, so here you only use it. The program builds a JSON object with the <code>json!</code> macro (given). Your job is to change two values: <code>"TODO"</code> becomes <code>"Hello Cargo"</code> and <code>false</code> becomes <code>true</code>. Expected output: a JSON object containing <code>"title":"Hello Cargo"</code>, <code>"published":true</code> and the tags (the keys may print in any order). The last two lines are a given self-check: they panic until both values are right.',
          starter: `// Real project: cargo add serde_json puts this in Cargo.toml:
//   [dependencies]
//   serde_json = "1"
// The Playground already has serde_json, so there is nothing to install here.
use serde_json::json;

fn main() {
    let post = json!({
        "title": "TODO",        // TODO 1: make this "Hello Cargo"
        "published": false,     // TODO 2: make this true
        "tags": ["rails", "rust"]
    });

    println!("{}", post);

    // Given self-check: it panics until both values above are right.
    assert_eq!(post["title"], "Hello Cargo");
    assert_eq!(post["published"], true);
}
`,
          hints: ['The comment at the top is the <code>Cargo.toml</code> line from the lesson: crates are gems, and <code>[dependencies]</code> is your Gemfile. <code>use serde_json::json;</code> is the Rust version of <code>require</code>: it makes the <code>json!</code> macro available in this file.', 'Edit the values inside <code>json!({ ... })</code>. Text goes in double quotes, while <code>true</code> and <code>false</code> are written without quotes, exactly like in JSON.', 'If you see <code>assertion `left == right` failed</code>, a value is still wrong. <code>left</code> is what your program has and <code>right</code> is what it expects, so <code>left: String("TODO")</code> means the title is still <code>"TODO"</code>. The answer: <code>"title": "Hello Cargo"</code> and <code>"published": true</code>.'],
          solution: `// Real project: cargo add serde_json puts this in Cargo.toml:
//   [dependencies]
//   serde_json = "1"
// The Playground already has serde_json, so there is nothing to install here.
use serde_json::json;

fn main() {
    let post = json!({
        "title": "Hello Cargo",
        "published": true,
        "tags": ["rails", "rust"]
    });

    println!("{}", post);

    // Given self-check: it panics until both values above are right.
    assert_eq!(post["title"], "Hello Cargo");
    assert_eq!(post["published"], true);
}
`,
          explain: '<code>json!</code> builds a JSON value from literal syntax, and <code>post["title"]</code> reads a field, a bit like <code>post[:title]</code> in Ruby. What matters for this lesson is how the crate got here: one line under <code>[dependencies]</code> (written by <code>cargo add</code>), and Cargo downloads and builds it the first time you run <code>cargo run</code>. The next lessons teach the Rust syntax around it.',
        },
      ],
    },

    // ------------------------------------------------------------------ 1.3
    {
      id: 'variables-types',
      title: 'Variables, mutability & types',
      subtitle: 'let, mut, shadowing, and the type system Ruby never made you think about.',
      tags: ['let', 'mut', 'types', 'shadowing', 'integers', 'functions'],
      scenes: [
        {
          type: 'title', kicker: 'Module 1 · Lesson 3', title: 'Variables, mutability & types',
          subtitle: 'Immutable by default. Typed always. Inferred mostly.',
          beats: [{ say: 'In Ruby, any variable can be reassigned to anything at any time. Rust is stricter, and that turns out to be a feature.' }],
        },
        {
          title: 'Immutable by default',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `count = 1
count += 1          # fine
count = "two"       # also fine?!` },
            { id: 'rs', kind: 'code', lang: 'rust', code: `let count = 1;
count += 1;         // ❌ cannot assign twice

let mut total = 1;
total += 1;         // ✅ explicitly mutable
total = "two";      // ❌ expected integer` },
            { id: 'e', kind: 'text', style: 'err', html: '<b>error[E0384]</b>: cannot assign twice to immutable variable `count`\n  help: consider making this binding mutable: `let mut count = 1;`' },
          ],
          beats: [
            { say: 'In Ruby, variables are mutable and untyped. You can even change a number into a string.', type: { rb: 'all' } },
            { say: 'In Rust, you declare variables with let, and they are immutable by default.', type: { rs: 2 } },
            { say: 'Try to reassign one, and the compiler stops you, and tells you exactly how to fix it.', show: 'e', lines: { rs: [2] } },
            { say: 'Add the mut keyword when you really mean to change a value. Mutation becomes visible and intentional.', type: { rs: 5 }, lines: { rs: [4, 5] } },
            { say: 'But even a mutable variable keeps its type. Once total is an integer, it stays an integer.', type: { rs: 'all' }, lines: { rs: [6] }, note: 'Think of it as every variable being <code>.freeze</code>d unless you say <code>mut</code>.' },
          ],
        },
        {
          title: 'Type inference: types without the typing',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', code: `let name = "Ada";              // &str
let age = 36;                  // i32 (default integer)
let ratio = 0.75;              // f64 (default float)
let admin = true;              // bool
let ids = vec![1, 2, 3];       // Vec<i32>

let port: u16 = 3000;          // annotate when you want
let big = 10_000_000_000_i64;  // or use a suffix` },
          ],
          beats: [
            { say: 'Rust is statically typed, but you rarely write types for local variables. The compiler infers them.', type: { c: 5 } },
            { say: 'A string literal is a string slice. Whole numbers default to i32, and decimals to f64.', lines: { c: [1, 2, 3] } },
            { say: 'You can annotate types with a colon when you want to be specific, or when the compiler cannot work it out.', type: { c: 'all' }, lines: { c: [7] } },
            { say: 'Numeric literals can take a type suffix, and underscores make big numbers readable, exactly like in Ruby.', lines: { c: [8] } },
          ],
        },
        {
          title: 'Ruby has Integer. Rust has… a few.',
          blocks: [
            {
              id: 't', kind: 'table', head: ['Type', 'Range', 'Use it for'], rows: [
                ['<code>i32</code>', '±2.1 billion', 'Default integer'],
                ['<code>i64</code>', '±9.2 quintillion', 'Database <code>bigint</code> ids'],
                ['<code>u8</code> / <code>u16</code> / <code>u32</code> / <code>u64</code>', '0 … 2ⁿ−1', 'Values that are never negative (bytes, ports, counts)'],
                ['<code>usize</code>', 'pointer-sized', 'Indexes and lengths (<code>vec.len()</code>)'],
                ['<code>f64</code>', 'double precision', 'Floats. Never use for money!'],
              ], cls: 'sm',
            },
            { id: 'n', kind: 'text', style: 'callout', html: 'Ruby integers grow silently into bignums. Rust integers have a <em>fixed size</em>. Overflow panics in debug builds and wraps in release builds.' },
          ],
          beats: [
            { say: 'Ruby has one Integer class that quietly grows as large as it needs. Rust makes you pick a size.', show: [] },
            { say: 'i32 is the default. i64 is what you want for database bigint ids, like Rails primary keys.', show: ['t.0', 't.1'] },
            { say: 'The u types are unsigned and cannot be negative. They are great for ports, bytes and counts.', show: 't.2' },
            { say: 'usize is the type for indexes and lengths. You will see it everywhere with vectors.', show: 't.3' },
            { say: 'And f64 for floats. Just like in Rails, never store money in a float. Use integer cents or a decimal crate.', show: 't.4' },
            { say: 'Because sizes are fixed, overflow is possible. Debug builds panic on overflow, so you catch it during development.', show: 'n' },
          ],
        },
        {
          title: 'Shadowing: re-let, not re-assign',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', code: `let input = "  42  ";           // &str from a form param
let input = input.trim();        // still &str, new binding
let input: i64 = input.parse()?; // now an i64!

println!("{}", input + 1);       // 43` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: ['Each <code>let</code> creates a <b>new</b> variable that hides the old one', 'The type can change, unlike with <code>mut</code>', 'Great for step-by-step transformations, like params → cleaned → parsed'] },
          ],
          beats: [
            { say: 'Here is a Rust idiom that surprises newcomers: shadowing.', type: { c: 1 } },
            { say: 'You can declare a new variable with the same name using let again. The new one shadows the old one.', type: { c: 2 }, show: 'b.0' },
            { say: 'Unlike mut, shadowing can change the type. Here a string becomes a sixty-four bit integer.', type: { c: 3 }, show: 'b.1', lines: { c: [3] }, note: 'The <code>?</code> passes the error up if parsing fails. More in Module 4.' },
            { say: 'It reads like a pipeline of transformations, much like you would clean up params in a Rails controller.', type: { c: 'all' }, show: 'b.2' },
          ],
        },
        {
          title: 'Functions: types at the boundary',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `def full_name(first, last)
  "#{first} #{last}"
end

def discount(cents, pct)
  cents * (100 - pct) / 100
end` },
            { id: 'rs', kind: 'code', lang: 'rust', code: `fn full_name(first: &str, last: &str) -> String {
    format!("{first} {last}")
}

fn discount(cents: u64, pct: u64) -> u64 {
    cents * (100 - pct) / 100   // no semicolon = return
}` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Like Ruby, the <em>last expression</em> is the return value. Add a <code>;</code> and it becomes a statement that returns <code>()</code>.' },
          ],
          beats: [
            { say: 'Inside functions, types are inferred. But function signatures always spell out their types.', type: { rb: 'all' } },
            { say: 'Parameters are annotated with a colon, and the return type comes after an arrow.', type: { rs: 3 }, lines: { rs: [1] } },
            { say: 'format with an exclamation mark is a macro. It works like string interpolation.', lines: { rs: [2] } },
            { say: 'Good news for Rubyists: the last expression is the return value, just like Ruby. No return keyword needed.', type: { rs: 'all' }, lines: { rs: [6] } },
            { say: 'One catch: a trailing semicolon turns an expression into a statement. A classic beginner error.', show: 'n' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'Which line fails to compile?',
          code: `let a = 5;          // line 1
let a = a * 2;      // line 2
let mut b = 1;      // line 3
b = b + a;          // line 4
a = 0;              // line 5`,
          options: ['Line 2', 'Line 4', 'Line 5', 'None, it all compiles'],
          answer: 2,
          explain: 'Line 2 is shadowing, which is allowed. <code>b</code> is <code>mut</code>, so line 4 is fine. But <code>a</code> was never declared <code>mut</code>, so line 5 is rejected.',
          beats: [{ say: 'Checkpoint! Read carefully: shadowing, mutation, or neither?' }],
        },
        {
          title: 'Constants that are really constant',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `MAX_UPLOAD = 10 * 1024 * 1024
API_VERSION = "v2"
MAX_UPLOAD = 5  # warning: already
                # initialized constant` },
            { id: 'rs', kind: 'code', lang: 'rust', code: `const MAX_UPLOAD: usize = 10 * 1024 * 1024;
const API_VERSION: &str = "v2";

// truly immutable, inlined at compile time
// type annotation is mandatory` },
          ],
          beats: [
            { say: 'Ruby constants are not really constant. Reassigning one only gives you a warning.', type: { rb: 'all' }, lines: { rb: [3, 4] } },
            { say: 'Rust constants use const, are SCREAMING snake case like Ruby, and must always have a type annotation.', type: { rs: 2 } },
            { say: 'They are evaluated at compile time and can never change. Constant really means constant.', type: { rs: 'all' } },
          ],
        },
      ],
      summary: {
        tldr: 'Variables are immutable by default (<code>let</code>). Opt into change with <code>let mut</code>. Types are inferred locally but fixed, so a variable can\'t change type unless you <i>shadow</i> it with a new <code>let</code>. Function signatures always declare their types, and the last expression is the return value, as in Ruby.',
        points: [
          '<code>let</code> bindings are immutable. <code>let mut</code> lets you change them, but never their type.',
          'Local types are inferred. Function parameters and return types are always written out.',
          'Integers have fixed sizes: <code>i32</code> is the default, <code>i64</code> for DB ids, <code>usize</code> for indexes.',
          'Shadowing (<code>let x = ...</code> again) creates a new variable and can change its type.',
          'The last expression without a <code>;</code> is the return value, as in Ruby.',
        ],
        rosetta: [
          ['<code>x = 1</code> (always mutable)', '<code>let x = 1;</code> (immutable) / <code>let mut x = 1;</code>'],
          ['<code>obj.freeze</code>', 'The default for every <code>let</code>'],
          ['<code>Integer</code> (auto bignum)', '<code>i32</code>, <code>i64</code>, <code>u64</code>, <code>usize</code>, … (fixed size)'],
          ['<code>"#{a} #{b}"</code>', '<code>format!("{a} {b}")</code>'],
          ['<code>def f(a, b)</code>', '<code>fn f(a: T, b: U) -> R</code>'],
          ['Implicit return of last expression', 'Same! (no trailing <code>;</code>)'],
          ['<code>CONST = 1</code> (reassignable w/ warning)', '<code>const CONST: i32 = 1;</code>'],
        ],
        gotchas: ['A trailing <code>;</code> on the last line makes a function return <code>()</code>, which gives you a "mismatched types" error.', 'Integer division truncates: <code>7 / 2 == 3</code>, as in Ruby.', 'Rust has no implicit numeric conversion. Use <code>x as i64</code> or <code>i64::from(x)</code>.'],
        code: `const MAX: u32 = 100;

fn main() {
    let name = "Ada";            // immutable, inferred &str
    let mut visits: u32 = 0;     // mutable, annotated
    visits += 1;
    let visits = visits.to_string(); // shadow: u32 -> String
    println!("{name}: {visits}/{MAX}");
}`,
        links: [['The Book, ch. 3: Common Concepts', 'https://doc.rust-lang.org/book/ch03-00-common-programming-concepts.html']],
      },
      quiz: [
        { type: 'compiles', code: 'let total = 10;\ntotal = total + 5;', answer: false, explain: '<code>total</code> is immutable. You need <code>let mut total</code>, or shadow it with <code>let total = total + 5;</code>.' },
        { type: 'compiles', code: 'let total = 5;\nlet total = format!("{total} items");\nprintln!("{}", total);', answer: true, explain: 'Each <code>let</code> creates a new variable, so shadowing can change the type: <code>total</code> goes from an integer to a <code>String</code>. With <code>mut</code> that would be rejected.' },
        { type: 'fill', q: 'Make this function compile and return the sum.', code: 'fn add(a: i32, b: i32) ___ i32 {\n    ___\n}', answers: [['->'], ['a + b', 'b + a', 'return a + b;', 'return a + b']], explain: 'Return types follow <code>-&gt;</code>. The body is just the expression <code>a + b</code>, with <b>no</b> semicolon.' },
        { type: 'mcq', q: 'Which type would you use for a Rails <code>bigint</code> primary key?', options: ['<code>i32</code>', '<code>i64</code>', '<code>usize</code>', '<code>f64</code>'], answer: 1, explain: 'Postgres <code>bigint</code> is a signed 64-bit integer, which is <code>i64</code>.' },
        { type: 'mcq', q: 'What does this return?', code: 'fn double(x: i32) -> i32 {\n    x * 2;\n}', options: ['<code>x * 2</code>', '<code>0</code>', 'Nothing. It is a compile error: expected i32, found ()', '<code>nil</code>'], answer: 2, explain: 'The semicolon turns <code>x * 2</code> into a statement, so the body evaluates to <code>()</code>.' },
      ],
      practice: [
        {
          title: 'Price calculator',
          prompt: 'Fill in the body of <code>price_with_tax</code> so it returns the price including tax, in <b>integer cents</b> (no floats). Look at the <code>discount</code> function from the video: it has the same shape. 1999 cents at 19% tax must print <code>Total: 2378 cents</code> (integer division drops the fraction). The <code>assert_eq!</code> line at the bottom is a given self-check: it panics until your function is right.',
          starter: `fn price_with_tax(cents: u64, tax_pct: u64) -> u64 {
    // TODO: return the price including tax, in integer cents
    0
}

fn main() {
    let total = price_with_tax(1999, 19);
    println!("Total: {} cents", total);
    // Given self-check: it panics until your function is right.
    assert_eq!(total, 2378);
}
`,
          hints: ['It is the same shape as <code>discount</code> in the video: <code>cents * (100 - pct) / 100</code>. Here the tax is added instead of taken off.', 'Use <code>100 + tax_pct</code> instead of <code>100 - pct</code>: <code>cents * (100 + tax_pct) / 100</code>.', 'The last expression of a function is its return value, so write it <b>without</b> a semicolon, and delete the placeholder <code>0</code>.'],
          solution: `fn price_with_tax(cents: u64, tax_pct: u64) -> u64 {
    cents * (100 + tax_pct) / 100
}

fn main() {
    let total = price_with_tax(1999, 19);
    println!("Total: {} cents", total);
    // Given self-check: it panics until your function is right.
    assert_eq!(total, 2378);
}
`,
          explain: '1999 × 119 / 100 = 2378 (integer division truncates 2378.81). In a real app you would pick a rounding strategy on purpose.',
        },
        {
          title: 'Shadowing pipeline',
          prompt: 'A form sends <code>"  25  "</code> with spaces around it. Use shadowing to clean it up and show the quantity as text. There are two small TODOs: (1) shadow <code>qty</code> with its trimmed version, and (2) after the number has been parsed and incremented (given), shadow it once more into a <code>String</code> using <code>format!</code>. Expected output: <code>26 items</code>. The line with <code>.parse().unwrap()</code> is given: <code>parse</code> turns text into a number (you saw <code>parse()?</code> in the video, and <code>unwrap()</code> is its simpler cousin that crashes when the text is not a number; Module 4 explains both). Until TODO 1 is done the program panics with <code>ParseIntError</code>, because the spaces keep the text from being a number.',
          starter: `fn main() {
    let qty = "  25  "; // raw value from a form param

    // TODO 1: shadow qty with the trimmed text (qty.trim())

    let qty: u32 = qty.parse().unwrap(); // given: turns the text into a number
    let qty = qty + 1;

    // TODO 2: shadow qty once more, into a String like "26 items" (format!)

    println!("{}", qty); // should print: 26 items
}
`,
          hints: ['Shadowing is just another <code>let</code> with the same name, like in the video: <code>let input = input.trim();</code>.', 'TODO 1 is <code>let qty = qty.trim();</code>. Once it is in, the panic goes away and the program prints <code>26</code>.', 'TODO 2 works like <code>format!("{first} {last}")</code> in the video: <code>let qty = format!("{qty} items");</code>. The type changes from a number to a <code>String</code>, which is allowed because it is a new variable.'],
          solution: `fn main() {
    let qty = "  25  "; // raw value from a form param

    let qty = qty.trim();

    let qty: u32 = qty.parse().unwrap(); // given: turns the text into a number
    let qty = qty + 1;

    let qty = format!("{qty} items");

    println!("{}", qty); // should print: 26 items
}
`,
          explain: 'The same name ends up holding a <code>&amp;str</code>, then a <code>u32</code>, then a <code>String</code>. That is only possible with shadowing: a <code>mut</code> variable keeps its type.',
        },
      ],
    },
  ],
});
