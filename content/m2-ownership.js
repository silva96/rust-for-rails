// Module 2: Ownership & Borrowing. See content/m1-foundations.js for the content format.
COURSE.modules.push({
  order: 2,
  id: 'm2',
  title: 'Ownership & Borrowing',
  blurb: 'The big one. How Rust manages memory without a garbage collector: owners, moves, borrows, lifetimes, and the smart pointers that bring back some of Ruby\'s flexibility.',
  lessons: [
    // ------------------------------------------------------------------ 2.1
    {
      id: 'ownership',
      title: 'Ownership & moves (goodbye, GC)',
      subtitle: 'Every value has exactly one owner. When the owner leaves, the value goes too.',
      tags: ['ownership', 'move', 'drop', 'copy', 'clone', 'stack', 'heap', 'gc'],
      scenes: [
        {
          type: 'title', kicker: 'Module 2 · Lesson 1', title: 'Ownership & moves',
          subtitle: 'Goodbye, garbage collector. Hello, compile-time memory management.',
          beats: [
            { say: 'Welcome to Module 2. This is the idea that makes Rust Rust: ownership.' },
            { say: 'It replaces the garbage collector you have relied on in Ruby for your whole career. Take it slowly, it is worth it.' },
          ],
        },
        {
          title: 'Who cleans up the memory?',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'cards', side: 'left', items: [{ icon: '🗑️', title: 'Ruby: garbage collector', body: 'The runtime tracks every object. Every so often it pauses, finds objects nobody can reach, and frees them. Easy for you, but it costs CPU, memory and latency.', cls: 'ruby' }] },
            { id: 'rs', kind: 'cards', side: 'right', items: [{ icon: '🦀', title: 'Rust: ownership', body: 'Every value has one owner. When the owner goes out of scope, the value is freed right there. The compiler works this out ahead of time, so there is zero runtime cost.', cls: 'rust' }] },
            { id: 'q', kind: 'text', style: 'callout', html: 'Ruby asks <em>"is anyone still using this?"</em> at runtime. Rust answers that question at compile time.' },
          ],
          beats: [
            { say: 'Every program has to answer one question: when is it safe to free a piece of memory?', show: [] },
            { say: 'Ruby answers it at runtime. The garbage collector periodically scans for objects nobody references and frees them. You never think about it, but you pay for it in pauses and memory.', show: 'rb' },
            { say: 'Rust answers it at compile time. Each value has exactly one owner, and the moment that owner goes out of scope, the memory is freed.', show: 'rs' },
            { say: 'No collector, no pauses, and nothing extra to do at runtime. The bookkeeping lives in the compiler.', show: 'q' },
          ],
        },
        {
          title: 'The three rules of ownership',
          layout: 'center',
          blocks: [
            {
              id: 'b', kind: 'bullets', items: [
                { icon: '1️⃣', text: 'Each value in Rust has an <b>owner</b>, the variable that holds it.' },
                { icon: '2️⃣', text: 'There can only be <b>one owner at a time</b>.' },
                { icon: '3️⃣', text: 'When the owner goes <b>out of scope</b>, the value is <b>dropped</b> (freed).' },
              ],
            },
            { id: 'n', kind: 'text', style: 'callout', html: 'Learn these by heart. Every error in this module is one of these rules being enforced.' },
          ],
          beats: [
            { say: 'Ownership boils down to three rules.' },
            { say: 'One. Each value has an owner, the variable that holds it.', show: 'b.0' },
            { say: 'Two. There can only be one owner at a time. Not two, not a shared bunch. One.', show: 'b.1' },
            { say: 'Three. When the owner goes out of scope, the value is dropped, which means its memory is freed immediately.', show: 'b.2' },
            { say: 'Every borrow checker error you will meet in this module comes back to these three rules.', show: 'n' },
          ],
        },
        {
          title: 'Stack vs heap, in 60 seconds',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', code: `fn main() {
    let age: u32 = 36;
    let name = String::from("Ada");
} // both freed here` },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'left', items: [
              'Stack: fixed-size values, very fast, freed when the function returns',
              'Heap: growable data like <code>String</code> or <code>Vec</code>, reached through a pointer',
            ] },
            {
              id: 'd', kind: 'diagram', side: 'right', w: 560, h: 400,
              boxes: [
                { id: 'stack', x: 0, y: 0, w: 260, h: 400, label: 'Stack', cls: 'zone' },
                { id: 'heap', x: 300, y: 0, w: 260, h: 400, label: 'Heap', cls: 'zone' },
                { id: 'age', x: 20, y: 60, w: 220, h: 76, label: 'age = 36', sub: 'u32 · 4 bytes' },
                { id: 'name', x: 20, y: 200, w: 220, h: 90, label: 'name', sub: 'ptr · len 3 · cap 3', cls: 'rust' },
                { id: 'buf', x: 320, y: 210, w: 220, h: 70, label: '"Ada"', sub: '3 bytes', cls: 'heap' },
              ],
              arrows: [{ id: 'p', from: 'name', to: 'buf', label: 'ptr', cls: 'rust' }],
            },
          ],
          beats: [
            { say: 'To understand ownership you need a quick picture of where values live.', type: { c: 1 }, show: ['d.stack', 'd.heap'] },
            { say: 'Simple, fixed size values like a u32 live on the stack. They are cheap to create and copy.', type: { c: 2 }, show: ['d.age', 'b.0'], lines: { c: [2] } },
            { say: 'A String can grow, so its characters live on the heap. The stack only holds a small header: a pointer, a length and a capacity.', type: { c: 3 }, show: ['d.name', 'd.buf', 'd.p', 'b.1'], lines: { c: [3] } },
            { say: 'When main ends, both owners go out of scope. Rust frees the stack slot and the heap buffer immediately, with no collector involved.', type: { c: 'all' }, lines: { c: [4] }, cls: { 'd.age': 'dropped', 'd.name': 'dropped', 'd.buf': 'dropped', 'd.p': 'cut' } },
          ],
        },
        {
          title: 'Assignment <em>moves</em> ownership',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', code: `let s1 = String::from("hello");
let s2 = s1;        // move!
println!("{s1}");   // ❌` },
            { id: 'e', kind: 'text', style: 'err', side: 'left', html: '<b>error[E0382]</b>: borrow of moved value: `s1`\n  value moved here: `let s2 = s1;`' },
            {
              id: 'd', kind: 'diagram', side: 'right', w: 560, h: 400,
              boxes: [
                { id: 'stack', x: 0, y: 0, w: 260, h: 400, label: 'Stack', cls: 'zone' },
                { id: 'heap', x: 300, y: 0, w: 260, h: 400, label: 'Heap', cls: 'zone' },
                { id: 's1', x: 20, y: 70, w: 220, h: 86, label: 's1', sub: 'ptr · len 5 · cap 5', cls: 'rust' },
                { id: 's2', x: 20, y: 250, w: 220, h: 86, label: 's2', sub: 'ptr · len 5 · cap 5', cls: 'rust' },
                { id: 'buf', x: 320, y: 165, w: 220, h: 70, label: '"hello"', cls: 'heap' },
              ],
              arrows: [
                { id: 'a1', from: 's1', to: 'buf', cls: 'rust' },
                { id: 'a2', from: 's2', to: 'buf', cls: 'rust' },
              ],
            },
          ],
          beats: [
            { say: 'Here is where Rust really departs from Ruby. We create a String called s1. It owns a heap buffer containing hello.', type: { c: 1 }, show: ['d.stack', 'd.heap', 'd.s1', 'd.buf', 'd.a1'] },
            { say: 'Now we assign s1 to s2. In Ruby, both variables would point to the same object. Rust copies only the small header, so s2 points at the same buffer.', type: { c: 2 }, show: ['d.s2', 'd.a2'], lines: { c: [2] } },
            { say: 'But two owners of one buffer would break rule two, and the buffer would be freed twice. So Rust moves ownership. s1 is now invalid.', cls: { 'd.s1': 'moved', 'd.a1': 'cut' }, hl: ['d.s2'] },
            { say: 'Use s1 after the move and the compiler refuses. Borrow of moved value. You will see this error a lot, and now you know exactly what it means.', type: { c: 'all' }, show: 'e', lines: { c: [3] }, note: 'Nothing is copied on the heap. A move is just a few bytes on the stack.' },
          ],
        },
        {
          title: 'Copy types and <code>.clone()</code>',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', size: 18, code: `let a = 5;
let b = a;              // Copy
println!("{a} {b}");    // ✅

let s1 = String::from("hi");
let s2 = s1.clone();    // deep copy
println!("{s1} {s2}");  // ✅` },
            { id: 't', kind: 'table', side: 'right', cls: 'sm', head: ['Copy (duplicated)', 'Move (transferred)'], rows: [
              ['<code>i32</code>, <code>u64</code>, <code>f64</code>', '<code>String</code>'],
              ['<code>bool</code>, <code>char</code>', '<code>Vec&lt;T&gt;</code>'],
              ['<code>&amp;T</code> (shared refs)', '<code>HashMap&lt;K, V&gt;</code>'],
              ['Tuples of Copy types', 'Your structs (by default)'],
            ] },
          ],
          beats: [
            { say: 'Not everything moves. Small, fixed size types like integers implement the Copy trait.', type: { c: 3 }, show: ['t.0', 't.1'] },
            { say: 'Assigning a Copy value duplicates the bits, so both a and b stay valid. That is why numbers feel just like Ruby.', lines: { c: [2, 3] }, show: 't.2' },
            { say: 'Anything that owns heap memory, like String, Vec or HashMap, moves instead.', show: 't.3' },
            { say: 'When you really want two independent copies, call clone. It is a deep copy of the data, a bit like dup in Ruby, but explicit and visible in the code.', type: { c: 'all' }, lines: { c: [6, 7] }, note: '<code>.clone()</code> is fine to use while learning. Make it work first, then remove clones later.' },
          ],
        },
        {
          type: 'checkpoint', title: 'Quick check',
          q: 'What happens when you compile this?',
          code: `let names = vec![String::from("ada")];
let copy = names;
println!("{}", names.len());`,
          options: ['It prints 1', 'Compile error: <code>names</code> was moved into <code>copy</code>', 'It panics at runtime', 'It prints 0'],
          answer: 1,
          explain: '<code>Vec</code> is not <code>Copy</code>, so <code>let copy = names;</code> moves ownership. Using <code>names</code> afterwards is error E0382.',
          beats: [{ say: 'Checkpoint. A vector is assigned to a new variable. Then we use the old one. What happens?' }],
        },
        {
          title: 'Passing to a function is a move too',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'mailer.rs', side: 'left', size: 17, code: `fn send_welcome(email: String) {
    println!("Sending to {email}");
} // email dropped here

fn main() {
    let email = String::from("ada@x.io");
    send_welcome(email);
    send_welcome(email); // ❌ moved
}` },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'right', items: [
              { icon: '🧬', text: 'Pass a copy: <code>send_welcome(email.clone())</code>' },
              { icon: '↩️', text: 'Give it back: return the <code>String</code> from the function' },
              { icon: '🤝', text: 'Best: <b>borrow it</b> with <code>&amp;str</code>, which is the next lesson' },
            ] },
          ],
          beats: [
            { say: 'Calling a function works exactly like assignment. Passing a String moves it into the function parameter.', type: { c: 3 } },
            { say: 'The parameter becomes the new owner, so the string is dropped when the function returns.', lines: { c: [3] } },
            { say: 'So calling send welcome a second time fails. Email was already moved away on the first call.', type: { c: 'all' }, lines: { c: [7, 8] } },
            { say: 'You have three options. Pass a clone.', show: 'b.0' },
            { say: 'Return the value back to the caller, which works but gets clumsy fast.', show: 'b.1' },
            { say: 'Or, the real answer: let the function borrow the value instead of owning it. That is our next lesson.', show: 'b.2' },
          ],
        },
        {
          title: 'Drop: like a block that always closes',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'log.rb', size: 18, code: `File.open("log.txt", "w") do |f|
  f.puts "hello"
end # file closed here

user = User.new
# freed... someday,
# whenever the GC runs` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'log.rs', size: 18, code: `{
    let mut f = File::create("log.txt")?;
    writeln!(f, "hello")?;
} // f dropped: file closed NOW

let user = User::new();
// freed at end of scope.
// Always. Deterministically.` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Dropping runs the type\'s <code>Drop</code> logic: memory, files, sockets and DB connections all get cleaned up at a predictable point.' },
          ],
          beats: [
            { say: 'Rubyists already know a version of this. File open with a block guarantees the file is closed when the block ends.', type: { rb: 3 } },
            { say: 'But plain objects are freed whenever the garbage collector gets around to it. You cannot know when.', type: { rb: 'all' }, lines: { rb: [5, 6, 7] } },
            { say: 'In Rust, every scope behaves like that file block. When f goes out of scope, it is dropped and the file is closed right there.', type: { rs: 4 }, lines: { rs: [4] } },
            { say: 'The same applies to everything: memory, sockets, database connections, mutex locks. Cleanup is deterministic.', type: { rs: 'all' }, show: 'n' },
          ],
        },
      ],
      summary: {
        tldr: 'Rust has no garbage collector. Every value has exactly one owner, and it is dropped (freed) the moment its owner goes out of scope. Assigning or passing a heap-owning value <b>moves</b> it, which makes the old variable unusable. Small types like integers are <b>Copy</b>. Use <code>.clone()</code> when you really need a second copy.',
        points: [
          'Each value has one owner at a time, and it is dropped when that owner goes out of scope.',
          'Assignment and function calls <b>move</b> heap-owning values like <code>String</code> and <code>Vec</code>. Using the old variable is error E0382.',
          'Integers, floats, <code>bool</code>, <code>char</code> and shared refs are <b>Copy</b>, so they are duplicated instead of moved.',
          '<code>.clone()</code> makes an explicit deep copy. It is fine while learning.',
          'Dropping is deterministic, like a <code>File.open</code> block that always closes.',
        ],
        rosetta: [
          ['Garbage collector', 'Ownership + <code>Drop</code> at end of scope'],
          ['<code>b = a</code> (both point to same object)', '<code>let b = a;</code> moves (non-Copy types)'],
          ['<code>obj.dup</code> / <code>deep_dup</code>', '<code>value.clone()</code>'],
          ['<code>File.open(...) do |f| ... end</code>', 'Any scope <code>{ ... }</code>: values dropped at <code>}</code>'],
          ['<code>ObjectSpace</code> / GC tuning', 'Nothing to tune: no GC'],
          ['Integers are immediate values', 'Integers are <code>Copy</code>'],
        ],
        gotchas: [
          'A move does not copy heap data. It transfers ownership, so it is cheap.',
          'Moving inside a loop is a classic mistake: <code>for _ in 0..3 { consume(s) }</code> moves <code>s</code> on the first iteration, so the compiler rejects the loop (E0382).',
          'Do not fear <code>.clone()</code> on small strings, but avoid cloning big collections in hot loops.',
        ],
        code: `fn consume(s: String) { println!("{s}"); } // s dropped here

fn main() {
    let a = String::from("hi");
    let b = a.clone();   // explicit deep copy
    consume(a);          // a moved into consume
    // println!("{a}");  // ❌ E0382: a was moved
    println!("{b}");     // ✅ b is its own value

    let x = 5;
    let y = x;           // Copy: both usable
    println!("{x} {y}");
}`,
        links: [['The Book, ch. 4.1: What is Ownership?', 'https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html'], ['Rust by Example: Ownership and moves', 'https://doc.rust-lang.org/rust-by-example/scope/move.html']],
      },
      quiz: [
        { type: 'compiles', code: 'let a = String::from("rails");\nlet b = a;\nprintln!("{a}");', answer: false, explain: '<code>String</code> is moved into <code>b</code>, so <code>a</code> can no longer be used (E0382).' },
        { type: 'compiles', code: 'let a = 10;\nlet b = a;\nprintln!("{a} {b}");', answer: true, explain: '<code>i32</code> is <code>Copy</code>, so <code>a</code> is duplicated, not moved.' },
        { type: 'mcq', q: 'When is the heap memory of a <code>String</code> freed?', options: ['When the garbage collector runs', 'When its owner goes out of scope', 'When you call <code>free()</code>', 'Only when the program exits'], answer: 1, explain: 'Rule three: when the owner goes out of scope, the value is dropped.' },
        { type: 'fill', q: 'Make both variables usable by creating an independent copy.', code: 'let s1 = String::from("hello");\nlet s2 = s1.___();\nprintln!("{s1} {s2}");', answers: [['clone']], explain: '<code>.clone()</code> makes a deep copy, so <code>s1</code> keeps its own value.' },
        { type: 'match', q: 'Match the Ruby idea with its Rust counterpart.', pairs: [['Garbage collector', 'ownership rules checked at compile time'], ['obj.dup', '.clone()'], ['File.open block closing the file', 'Drop at end of scope'], ['Assigning a number keeps both variables usable', 'Copy types']] },
        { type: 'order', q: 'Put the life of a <code>String</code> in order.', items: ['let s = String::from("hi") allocates on the heap', 'let t = s moves ownership to t', 't goes out of scope', 'Drop runs and the heap buffer is freed'], explain: 'Allocate, move, leave scope, drop.' },
      ],
      practice: [
        {
          title: 'Fix the move with clone',
          prompt: 'Run the starter: it fails with <b>E0382</b>, <i>use of moved value: `email`</i>. The first call to <code>send_welcome</code> moved the String away, just like in the video. Fix it so the program prints <code>Sending to ada@x.io</code> <b>twice</b>. You only need to change one line.',
          starter: `fn send_welcome(email: String) {
    println!("Sending to {email}");
}

fn main() {
    let email = String::from("ada@x.io");
    send_welcome(email); // ❌ moves email into the function
    send_welcome(email);
}
`,
          hints: ['The error points at the second call: <code>email</code> was already moved by the first one.', 'When you want to keep using a value, pass a copy: <code>.clone()</code>.', 'Change only the first call to <code>send_welcome(email.clone());</code>. The last use can still move the original.'],
          solution: `fn send_welcome(email: String) {
    println!("Sending to {email}");
}

fn main() {
    let email = String::from("ada@x.io");
    send_welcome(email.clone());
    send_welcome(email);
}
`,
          explain: 'The first call gets its own copy (<code>.clone()</code>), so the original <code>email</code> is still ours for the second call, which can safely move it. Cloning is fine while you learn. In the next lesson you will see how to lend the value instead of copying it.',
        },
        {
          title: 'Give the String back',
          prompt: 'Same program, different fix: instead of cloning, let <code>send_welcome</code> <b>hand the String back</b> to its caller. Two small edits (see the TODOs). The starter fails with E0382 until you do them. Expected output: <code>Sending to ada@x.io</code> twice.',
          starter: `// TODO 1: make this function give the String back
fn send_welcome(email: String) {
    println!("Sending to {email}");
}

fn main() {
    let email = String::from("ada@x.io");
    // TODO 2: catch the String it gives back, so we can use it again
    send_welcome(email);
    send_welcome(email);
}
`,
          hints: ['A function can return its argument: change the signature to <code>-&gt; String</code> and make <code>email</code> the last expression (no semicolon).', 'In <code>main</code>, catch the returned value with <code>let email = send_welcome(email);</code>. That is shadowing, from Module 1.', 'The second call can simply stay <code>send_welcome(email);</code>.'],
          solution: `fn send_welcome(email: String) -> String {
    println!("Sending to {email}");
    email
}

fn main() {
    let email = String::from("ada@x.io");
    let email = send_welcome(email);
    send_welcome(email);
}
`,
          explain: 'Ownership goes into the function and comes back out through the return value. It works, but you can see why it gets clumsy: every helper would have to hand things back. That is exactly the problem borrowing solves in the next lesson.',
        },
      ],
    },

    // ------------------------------------------------------------------ 2.2
    {
      id: 'borrowing',
      title: 'Borrowing & references',
      subtitle: 'Use a value without taking it, and let the signature say who may change it.',
      tags: ['borrow', 'reference', '&mut', 'borrow checker', 'slices', '&str'],
      scenes: [
        {
          type: 'title', kicker: 'Module 2 · Lesson 2', title: 'Borrowing & references',
          subtitle: 'Many readers or one writer, checked before your code ever runs.',
          beats: [
            { say: 'Moving values everywhere would be exhausting. Most of the time, a function just wants to look at something, or tweak it, and give it back.' },
            { say: 'That is borrowing. It is the most important everyday skill in Rust.' },
          ],
        },
        {
          title: 'In Ruby, everyone can mutate everything',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'apply_defaults.rb', size: 17, code: `class ApplyDefaults
  def self.call(opts)
    opts[:per_page] ||= 25
    opts.delete(:debug)
    opts
  end
end

params = { debug: true }
ApplyDefaults.call(params)
params # => { per_page: 25 } 😱` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'defaults.rs', size: 17, code: `// may change opts. Says so!
fn apply_defaults(opts: &mut Opts) {
    opts.per_page.get_or_insert(25);
}

// read-only. Guaranteed.
fn render(opts: &Opts) {
    println!("{}", opts.title);
}` },
          ],
          beats: [
            { say: 'Ruby passes object references everywhere. Any method that receives your hash can change it.', type: { rb: 7 } },
            { say: 'So a harmless looking service object can quietly mutate the caller\'s params. We have all debugged this one.', type: { rb: 'all' }, lines: { rb: [3, 4, 11] } },
            { say: 'In Rust, the function signature tells you. Ampersand mut means this function may change your value.', type: { rs: 4 }, lines: { rs: [2] } },
            { say: 'A plain ampersand means read only, and the compiler guarantees it. Mutation becomes part of the contract.', type: { rs: 'all' }, lines: { rs: [7] }, note: 'Like <code>params.freeze</code>, but enforced by the type system, per call.' },
          ],
        },
        {
          title: 'Shared borrows: <code>&amp;T</code>',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', size: 17, code: `fn word_count(text: &String) -> usize {
    text.split_whitespace().count()
}

fn main() {
    let post = String::from("hi rust");
    let n = word_count(&post);
    println!("{post}: {n} words"); // ✅
}` },
            {
              id: 'd', kind: 'diagram', side: 'right', w: 560, h: 400,
              boxes: [
                { id: 'stack', x: 0, y: 0, w: 260, h: 400, label: 'Stack', cls: 'zone' },
                { id: 'heap', x: 300, y: 0, w: 260, h: 400, label: 'Heap', cls: 'zone' },
                { id: 'post', x: 20, y: 70, w: 220, h: 86, label: 'post', sub: 'owner', cls: 'rust' },
                { id: 'text', x: 20, y: 260, w: 220, h: 86, label: 'text', sub: '&amp;String (borrow)', cls: 'info' },
                { id: 'buf', x: 320, y: 78, w: 220, h: 70, label: '"hi rust"', cls: 'heap' },
              ],
              arrows: [
                { id: 'own', from: 'post', to: 'buf', cls: 'rust' },
                { id: 'ref', from: 'text', to: 'post', label: '&', cls: 'ok' },
              ],
            },
          ],
          beats: [
            { say: 'Instead of handing over ownership, we can lend a reference. The function takes an ampersand String.', type: { c: 3 }, lines: { c: [1] } },
            { say: 'Post is the owner of the heap buffer.', type: { c: 6 }, show: ['d.stack', 'd.heap', 'd.post', 'd.buf', 'd.own'] },
            { say: 'We call word count with ampersand post. That creates a reference: a pointer to post that does not own anything.', type: { c: 7 }, show: ['d.text', 'd.ref'], lines: { c: [7] } },
            { say: 'When the function returns, the borrow ends and the reference itself goes away. The String is not dropped, because the reference never owned it.', cls: { 'd.text': 'dropped', 'd.ref': 'cut' } },
            { say: 'So post is still ours, and we can keep using it. No clone needed.', type: { c: 'all' }, lines: { c: [8] }, hl: ['d.post'] },
          ],
        },
        {
          title: 'Mutable borrows: <code>&amp;mut T</code>',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'tags.rs', size: 17, code: `fn add_tag(tags: &mut Vec<String>, t: &str) {
    tags.push(t.to_string());
}

fn main() {
    let mut tags = Vec::new();
    add_tag(&mut tags, "rust");
    add_tag(&mut tags, "rails");
    println!("{tags:?}"); // ["rust", "rails"]
}` },
            { id: 'n', kind: 'text', style: 'callout', html: '<code>mut</code> appears three times: on the binding, on the borrow, and in the parameter type. Mutation is never a surprise.' },
          ],
          beats: [
            { say: 'When a function needs to change something, it asks for a mutable borrow: ampersand mut.', type: { c: 3 }, lines: { c: [1] } },
            { say: 'The caller has to opt in twice. The variable must be declared mut, and the call site writes ampersand mut explicitly.', type: { c: 'all' }, lines: { c: [6, 7, 8] } },
            { say: 'Reading the code, you can see every place that might change tags. Compare that to hunting for bang methods in Ruby.', show: 'n' },
          ],
        },
        {
          title: 'The borrowing rules',
          blocks: [
            { id: 'c', kind: 'cards', items: [
              { icon: '👀', title: 'Many readers…', body: 'Any number of <code>&amp;T</code> shared references at the same time.', cls: 'ok' },
              { icon: '✍️', title: '…OR one writer', body: 'Exactly one <code>&amp;mut T</code>, and no readers while it exists.', cls: 'rust' },
              { icon: '⏳', title: 'Always valid', body: 'A reference can never outlive the data it points to. No dangling pointers.', cls: 'bad' },
            ] },
            { id: 'n', kind: 'text', style: 'callout', html: 'It\'s a read/write lock checked at <em>compile time</em>, with zero runtime cost. It is also why safe Rust has no data races.' },
          ],
          beats: [
            { say: 'All of borrowing comes down to these rules.' },
            { say: 'At any moment, you can have as many shared, read only references as you like.', show: 'c.0' },
            { say: 'Or you can have exactly one mutable reference, with no readers at the same time. Never both.', show: 'c.1' },
            { say: 'And a reference must never outlive the value it points to.', show: 'c.2' },
            { say: 'If you have used a database read write lock, this is the same idea. The compiler checks it, so it costs nothing at runtime and data races cannot happen.', show: 'n' },
          ],
        },
        {
          title: 'Why the rules exist: E0502',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', code: `let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);
println!("{first}");` },
            { id: 'e', kind: 'text', style: 'err', side: 'left', html: '<b>error[E0502]</b>: cannot borrow `v` as mutable because it is also borrowed as immutable' },
            {
              id: 'd', kind: 'diagram', side: 'right', w: 560, h: 400,
              boxes: [
                { id: 'stack', x: 0, y: 0, w: 220, h: 400, label: 'Stack', cls: 'zone' },
                { id: 'heap', x: 260, y: 0, w: 300, h: 400, label: 'Heap', cls: 'zone' },
                { id: 'v', x: 20, y: 250, w: 180, h: 80, label: 'v', sub: 'ptr · len · cap', cls: 'rust' },
                { id: 'first', x: 20, y: 70, w: 180, h: 80, label: 'first', sub: '&amp;i32', cls: 'info' },
                { id: 'old', x: 280, y: 75, w: 260, h: 70, label: '[1, 2, 3]', cls: 'heap' },
                { id: 'new', x: 280, y: 280, w: 260, h: 70, label: '[1, 2, 3, 4]', cls: 'heap' },
              ],
              arrows: [
                { id: 'a1', from: 'v', to: 'old', cls: 'rust' },
                { id: 'a2', from: 'first', to: 'old', cls: 'ok' },
                { id: 'a3', from: 'v', to: 'new', cls: 'rust' },
              ],
            },
          ],
          beats: [
            { say: 'Here is the classic borrow checker error. A vector, and a reference to its first element.', type: { c: 2 }, show: ['d.stack', 'd.heap', 'd.v', 'd.old', 'd.a1', 'd.first', 'd.a2'] },
            { say: 'Then we push. But pushing may need more room, so the vector can reallocate: copy everything into a new, bigger buffer, and free the old one.', type: { c: 3 }, lines: { c: [3] }, show: ['d.new', 'd.a3'], cls: { 'd.old': 'dropped', 'd.a1': 'cut' } },
            { say: 'Now first points into freed memory. In C that is a use after free bug. A security hole.', cls: { 'd.a2': 'bad', 'd.first': 'error' } },
            { say: 'Rust refuses to compile it. You cannot mutate v while a shared borrow of it is still in use.', type: { c: 'all' }, show: 'e', lines: { c: [4] }, note: 'Ruby avoids this with a GC and copying. Rust avoids it at compile time, and stays fast.' },
          ],
        },
        {
          title: 'Fixing it: borrows end at their last use',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', code: `let mut v = vec![1, 2, 3];

let first = v[0];       // copy the i32 out
v.push(4);              // ✅ no borrow alive

let first = &v[0];
println!("{first}");    // last use of the borrow
v.push(5);              // ✅ borrow already ended` },
          ],
          beats: [
            { say: 'There are two common fixes.', type: { c: 1 } },
            { say: 'One. Copy the value out instead of borrowing it. An i32 is Copy, so no reference stays alive.', type: { c: 4 }, lines: { c: [3, 4] } },
            { say: 'Two. Reorder your code. A borrow lasts only until its last use, not until the end of the block.', type: { c: 'all' }, lines: { c: [6, 7, 8] } },
            { say: 'So by the time we push five, nobody is looking at the vector anymore, and the compiler is happy.', lines: { c: [8] }, note: 'Most borrow errors are fixed by reordering, cloning a small value, or narrowing a scope.' },
          ],
        },
        {
          type: 'checkpoint', title: 'Quick check',
          q: 'Does this compile?',
          code: `let mut s = String::from("hi");
let a = &mut s;
let b = &mut s;
a.push('!');`,
          options: ['Yes, it prints <code>hi!</code>', 'No: two mutable borrows of <code>s</code> are alive at once (E0499)', 'It compiles but panics at runtime', 'Yes, because <code>b</code> is never used'],
          answer: 1,
          explain: '<code>a</code> is still used on the last line, so both <code>&amp;mut</code> borrows overlap. That breaks the one-writer rule: error E0499.',
          beats: [{ say: 'Checkpoint. Two mutable borrows of the same string. Will the compiler allow it?' }],
        },
        {
          title: 'Slices: borrowing part of a value',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'slices.rs', side: 'left', size: 18, code: `fn first_word(s: &str) -> &str {
    s.split(' ').next().unwrap_or("")
}

fn total(prices: &[u64]) -> u64 {
    prices.iter().sum()
}

let title = String::from("Hello world");
first_word(&title);  // "Hello"
total(&vec![5, 10]); // 15` },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'right', items: [
              { icon: '✂️', text: '<code>&amp;str</code> is a view into string data that someone else owns' },
              { icon: '📏', text: '<code>&amp;[T]</code> is a view into part or all of a <code>Vec</code> or array' },
              { icon: '🔁', text: '<code>&amp;String</code> automatically becomes <code>&amp;str</code>, and <code>&amp;Vec&lt;T&gt;</code> becomes <code>&amp;[T]</code>' },
              { icon: '✅', text: 'Idiom: take <code>&amp;str</code> and <code>&amp;[T]</code> as parameters, since they accept more inputs' },
            ] },
          ],
          beats: [
            { say: 'One more kind of borrow: slices. A string slice, ampersand str, borrows some or all of a string.', type: { c: 3 }, show: 'b.0' },
            { say: 'The returned word is not a new string. It points right into the original text. No copying.', lines: { c: [1, 2] } },
            { say: 'Array slices work the same way for vectors.', type: { c: 7 }, show: 'b.1', lines: { c: [5, 6, 7] } },
            { say: 'A reference to a String converts to a string slice automatically, and a reference to a Vec converts to a slice.', type: { c: 'all' }, show: 'b.2', lines: { c: [10, 11] } },
            { say: 'So the idiom is to accept ampersand str and slices in your functions. They work with more inputs, including string literals.', show: 'b.3' },
          ],
        },
      ],
      summary: {
        tldr: 'A reference lets you use a value without owning it. <code>&amp;T</code> is a shared, read-only borrow, and <code>&amp;mut T</code> is an exclusive, read-write borrow. You can have <b>many readers or one writer</b>, never both, and a reference can never outlive its data. Function signatures now document who may mutate what.',
        points: [
          '<code>&amp;value</code> lends a read-only reference. The owner keeps ownership and can use the value afterwards.',
          '<code>&amp;mut value</code> lends exclusive write access. It needs <code>let mut</code> on the owner.',
          'Rule: many <code>&amp;T</code> <b>or</b> one <code>&amp;mut T</code> at a time. That is a compile-time read/write lock, so there are no data races.',
          'A borrow lasts until its <b>last use</b>. Reordering code fixes most borrow errors.',
          'Slices (<code>&amp;str</code>, <code>&amp;[T]</code>) borrow part of a collection. Prefer them as parameter types.',
        ],
        rosetta: [
          ['Passing an object (shared, mutable reference)', '<code>&amp;T</code> (shared, read-only) or <code>&amp;mut T</code> (exclusive)'],
          ['<code>opts.freeze</code> before passing', 'Pass <code>&amp;opts</code>'],
          ['Bang methods hint at mutation (<code>merge!</code>)', '<code>&amp;mut self</code> / <code>&amp;mut T</code> in the signature'],
          ['<code>str[0, 5]</code> (allocates a new String)', '<code>&amp;s[0..5]</code> (borrows, no allocation)'],
          ['<code>array[1..]</code> (new Array)', '<code>&amp;v[1..]</code> (a slice view)'],
          ['Mutex around shared state', 'The borrow checker for single-owner data'],
        ],
        gotchas: [
          'You can\'t take <code>&amp;mut</code> of a variable that isn\'t declared <code>let mut</code>.',
          'Calling a <code>&amp;mut self</code> method while you hold a reference into the same value is the classic E0502.',
          'String slices index <b>bytes</b>: <code>&amp;s[0..1]</code> on <code>"é"</code> panics because it would cut a character in half.',
        ],
        code: `fn len_of(s: &str) -> usize { s.len() }          // read-only borrow
fn shout(s: &mut String) { s.push_str("!"); }    // exclusive borrow

fn main() {
    let mut msg = String::from("hello");
    let n = len_of(&msg);   // many & are fine
    shout(&mut msg);        // one &mut, no & alive
    println!("{msg} ({n})"); // hello! (5)
}`,
        links: [['The Book, ch. 4.2: References and Borrowing', 'https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html'], ['The Book, ch. 4.3: The Slice Type', 'https://doc.rust-lang.org/book/ch04-03-slices.html']],
      },
      quiz: [
        { type: 'mcq', q: 'Which combination of references to the same value is allowed at one time?', options: ['Two <code>&amp;mut T</code>', 'One <code>&amp;T</code> and one <code>&amp;mut T</code>', 'Any number of <code>&amp;T</code>', 'Unlimited of both, as long as you are careful'], answer: 2, explain: 'Many readers <b>or</b> one writer.' },
        { type: 'compiles', code: 'let mut v = vec![1, 2, 3];\nlet first = &v[0];\nv.push(4);\nprintln!("{first}");', answer: false, explain: '<code>first</code> is still used after <code>push</code>, which needs <code>&amp;mut v</code>. That is E0502.' },
        { type: 'compiles', code: 'let mut v = vec![1, 2, 3];\nlet len = v.len();\nv.push(4);\nprintln!("{len}");', answer: true, explain: '<code>v.len()</code> returns a <code>usize</code> (Copy). No borrow is alive when we push.' },
        { type: 'fill', q: 'Complete the signature and call so the function can append to the vector.', code: 'fn add_one(list: ___ Vec<i32>) {\n    list.push(1);\n}\n\nlet mut nums = vec![];\nadd_one(___ nums);', answers: [['&mut'], ['&mut']], explain: 'Mutable borrows are explicit in both the parameter type and the call site.' },
        { type: 'mcq', q: 'In Ruby a service object accidentally mutated the caller\'s hash. Which Rust signature lets the caller <b>keep using</b> its options and <b>guarantees</b> the function can\'t change them?', options: ['<code>fn call(opts: &amp;mut Opts)</code>', '<code>fn call(opts: &amp;Opts)</code>', '<code>fn call(mut opts: Opts)</code>', 'None: Rust can\'t guarantee that'], answer: 1, explain: 'A shared <code>&amp;</code> reference is read-only, and the caller keeps ownership. (Option A may mutate. Option C takes ownership, so the caller can\'t use its options afterwards.)' },
        { type: 'match', q: 'Match each type with what it means.', pairs: [['T', 'owned value'], ['&T', 'shared, read-only borrow'], ['&mut T', 'exclusive, read-write borrow'], ['&str', 'borrowed string slice']] },
      ],
      practice: [
        {
          title: 'Look, don\'t take',
          prompt: 'Run the starter and read the errors. <code>count_words</code> only needs to <i>look</i> at the text, so it should borrow it. Fill in the parameter type (TODO 1) and lend the post at the call site (TODO 2). The starter doesn\'t compile until you do. Expected output: <code>ownership makes rust rust: 4 words</code>.',
          starter: `fn count_words(text: /* TODO 1 */) -> usize {
    text.split_whitespace().count()
}

fn main() {
    let post = String::from("ownership makes rust rust");
    let n = count_words(post); // TODO 2
    println!("{post}: {n} words");
}
`,
          hints: ['A read-only borrow is written with an ampersand. In the video, the idiom for text parameters was <code>&amp;str</code> (<code>&amp;String</code> works too).', 'At the call site you also write the ampersand: you lend <code>post</code>, you don\'t give it away.', 'TODO 1 is <code>&amp;str</code> and TODO 2 is <code>count_words(&amp;post)</code>. Afterwards <code>post</code> is still usable on the last line.'],
          solution: `fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

fn main() {
    let post = String::from("ownership makes rust rust");
    let n = count_words(&post);
    println!("{post}: {n} words");
}
`,
          explain: '<code>&amp;post</code> is a <code>&amp;String</code>, which turns into a <code>&amp;str</code> automatically. The function borrows the text and gives it back, so <code>post</code> still works afterwards. No clone needed.',
        },
        {
          title: 'Lend it mutably',
          prompt: 'This time the function needs to <i>change</i> the vector, so it needs a <b>mutable</b> borrow. Fix the three TODOs. The last <code>add_tag</code> call is already correct, so copy its style. The starter doesn\'t compile until you do. Expected output: <code>["rust", "rails"]</code>.',
          starter: `fn add_tag(tags: /* TODO 1 */, tag: &str) {
    tags.push(tag.to_string());
}

fn main() {
    let tags = Vec::new();         // TODO 2
    add_tag(tags, "rust");         // TODO 3
    add_tag(&mut tags, "rails");   // already correct: copy this style
    println!("{tags:?}");
}
`,
          hints: ['Mutation takes <code>&amp;mut</code>. The video said <code>mut</code> appears three times: on the binding, on the borrow, and in the parameter type.', 'TODO 1 is the parameter type: <code>&amp;mut Vec&lt;String&gt;</code>. TODO 2 is <code>let mut tags</code>.', 'TODO 3: write <code>&amp;mut tags</code> in the first call, like the second call does.'],
          solution: `fn add_tag(tags: &mut Vec<String>, tag: &str) {
    tags.push(tag.to_string());
}

fn main() {
    let mut tags = Vec::new();
    add_tag(&mut tags, "rust");
    add_tag(&mut tags, "rails");
    println!("{tags:?}");
}
`,
          explain: 'The caller has to opt in twice: <code>let mut tags</code> and <code>&amp;mut tags</code>. The signature tells every reader that <code>add_tag</code> may change the vector, and the borrow ends when the call returns, so the next call can borrow again.',
        },
        {
          title: 'A borrow ends at its last use',
          prompt: 'This is the classic <b>E0502</b> from the video: <code>first</code> borrows the vector, then <code>push</code> tries to change it. Change the <b>order</b> of the lines (or copy the value out) so it compiles. Expected output: <code>first = 1</code> and then <code>[1, 2, 3, 4]</code>.',
          starter: `fn main() {
    let mut v = vec![1, 2, 3];
    let first = &v[0];
    v.push(4); // ❌ E0502
    println!("first = {first}");
    println!("{v:?}");
}
`,
          hints: ['The borrow <code>first</code> lasts until its last use, which is the first <code>println!</code>.', 'Move <code>v.push(4);</code> below the line that prints <code>first</code>.', 'Alternative from the video: copy the number out with <code>let first = v[0];</code> so no borrow stays alive.'],
          solution: `fn main() {
    let mut v = vec![1, 2, 3];
    let first = &v[0];
    println!("first = {first}");
    v.push(4);
    println!("{v:?}");
}
`,
          explain: 'After the reorder, nobody is looking at the vector when <code>push</code> runs, so it can reallocate safely. Copying the <code>i32</code> out also works, since a Copy value doesn\'t borrow anything.',
        },
      ],
    },

    // ------------------------------------------------------------------ 2.3
    {
      id: 'lifetimes-smart-pointers',
      title: 'Lifetimes, Rc & RefCell',
      subtitle: 'Proving references stay valid, and the escape hatches for shared, mutable data.',
      tags: ['lifetimes', "'a", 'Box', 'Rc', 'Arc', 'RefCell', 'smart pointers'],
      scenes: [
        {
          type: 'title', kicker: 'Module 2 · Lesson 3', title: 'Lifetimes, Rc & RefCell',
          subtitle: 'How Rust proves references are valid, and what to use when one owner isn\'t enough.',
          beats: [
            { say: 'Two final pieces of the ownership puzzle. Lifetimes, which keep references honest.' },
            { say: 'And smart pointers like Rc and RefCell, which bring back some of the flexible sharing you are used to in Ruby.' },
          ],
        },
        {
          title: 'The bug lifetimes prevent',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', code: `let r;
{
    let x = 5;
    r = &x;
}           // x dropped here
println!("{r}");  // ❌` },
            { id: 'e', kind: 'text', style: 'err', side: 'left', html: '<b>error[E0597]</b>: `x` does not live long enough\n  borrowed value does not live long enough' },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'right', items: [
              { icon: '💎', text: 'Ruby: the GC keeps <code>x</code> alive for as long as anything refers to it' },
              { icon: '🦀', text: 'Rust: no GC, so the compiler must <b>prove</b> that <code>r</code> never outlives <code>x</code>' },
              { icon: '⏳', text: 'That proof is the <b>lifetime</b>: the span of code where a reference is valid' },
            ] },
          ],
          beats: [
            { say: 'Here is the bug. r is declared outside a block, and inside the block it borrows x.', type: { c: 4 } },
            { say: 'But x is dropped at the closing brace. After that, r would point at freed memory.', type: { c: 5 }, lines: { c: [5] } },
            { say: 'In Ruby this cannot happen. The garbage collector keeps x alive as long as anyone references it.', show: 'b.0' },
            { say: 'Rust has no collector, so the compiler must prove that every reference stays within the lifetime of its data.', show: 'b.1' },
            { say: 'Here it cannot. Error, x does not live long enough. The span where a reference is valid is called its lifetime.', type: { c: 'all' }, show: ['e', 'b.2'], lines: { c: [6] } },
          ],
        },
        {
          title: 'Lifetime annotations: <code>\'a</code>',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'longest.rs', code: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

let winner = longest("ruby", "rust-lang");` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              '<code>\'a</code> is a <b>name</b> for "some region of code", like a generic type parameter',
              'This reads: the result lives no longer than <b>both</b> inputs',
              'Annotations <b>describe</b> relationships. They never make anything live longer',
            ] },
          ],
          beats: [
            { say: 'Usually the compiler figures lifetimes out by itself. But look at this function. It returns one of two references.', type: { c: 3 } },
            { say: 'Which input does the result borrow from? The compiler cannot tell from the signature alone, so we annotate it.', lines: { c: [1] } },
            { say: 'Tick a is a lifetime parameter. It is a name for some region of code, declared in angle brackets like a generic.', show: 'b.0' },
            { say: 'Using it on both inputs and the output says the result is valid only as long as both inputs are.', show: 'b.1', type: { c: 'all' } },
            { say: 'Important: annotations do not change how long anything lives. They only describe relationships so the compiler can check them.', show: 'b.2', note: 'Read <code>\'a</code> out loud as "tick a" or "lifetime a".' },
          ],
        },
        {
          title: 'Most of the time, you write none',
          blocks: [
            { id: 't', kind: 'table', cls: 'sm', head: ['Signature', 'Rule (elision)', 'Annotate?'], rows: [
              ['<code>fn trim(s: &amp;str) -&gt; &amp;str</code>', 'One input reference, so the output borrows from it', 'No'],
              ['<code>fn name(&amp;self) -&gt; &amp;str</code>', 'Methods: the output borrows from <code>self</code>', 'No'],
              ['<code>fn len(a: &amp;str, b: &amp;str) -&gt; usize</code>', 'No reference is returned', 'No'],
              ['<code>fn pick(a: &amp;str, b: &amp;str) -&gt; &amp;str</code>', 'Ambiguous: which input?', '<b>Yes</b>'],
            ] },
            { id: 'n', kind: 'text', style: 'ok', html: 'In everyday app code you\'ll write <code>\'a</code> only rarely. When the compiler needs one, it tells you exactly where.' },
          ],
          beats: [
            { say: 'Good news. Thanks to lifetime elision rules, you rarely write annotations at all.' },
            { say: 'If a function takes a single reference and returns one, the output obviously borrows from that input.', show: 't.0' },
            { say: 'For methods, a returned reference is assumed to borrow from self. That covers getters.', show: 't.1' },
            { say: 'If no reference is returned, there is nothing to relate.', show: 't.2' },
            { say: 'Only when it is truly ambiguous do you need to annotate, and the compiler error will point it out for you.', show: ['t.3', 'n'] },
          ],
        },
        {
          title: 'Structs: own your data (usually)',
          layout: 'split',
          blocks: [
            { id: 'rs', kind: 'code', lang: 'rust', label: 'owned.rs', code: `// ✅ the default choice
struct User {
    name: String,
    email: String,
}` },
            { id: 'lt', kind: 'code', lang: 'rust', label: 'borrowed.rs', code: `// borrowing: needs a lifetime
struct Excerpt<'a> {
    text: &'a str,
}
// can't outlive the source text` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Rule of thumb: structs <em>own</em> their fields (<code>String</code>, <code>Vec</code>), just like an ActiveRecord model owns its attributes. Borrowing structs are an optimization, for things like zero-copy parsers.' },
          ],
          beats: [
            { say: 'Lifetimes show up most in structs. The easy path is a struct that owns its data, with String fields instead of string slices.', type: { rs: 'all' } },
            { say: 'A struct can hold references, but then it needs a lifetime parameter, and the struct can never outlive the data it borrows from.', type: { lt: 'all' }, lines: { lt: [2, 3] } },
            { say: 'The advice for app developers: own your data. Treat your structs like ActiveRecord models that own their attributes, and reach for borrowing structs only when profiling tells you to.', show: 'n' },
          ],
        },
        {
          title: 'Smart pointers: when one owner isn\'t enough',
          blocks: [
            { id: 't', kind: 'table', cls: 'sm', head: ['Type', 'What it gives you', 'Think of it as'], rows: [
              ['<code>Box&lt;T&gt;</code>', 'One owner, value lives on the heap', 'A plain object, allocated on the heap'],
              ['<code>Rc&lt;T&gt;</code>', 'Many owners, one thread, reference counted', 'Shared object, counted instead of GC\'d'],
              ['<code>Arc&lt;T&gt;</code>', 'Many owners, <b>across threads</b> (atomic count)', '<code>Rc</code> for Tokio / threads'],
              ['<code>RefCell&lt;T&gt;</code>', 'Mutate through a shared reference, checked at runtime', 'Opt-in Ruby-style mutation'],
              ['<code>Mutex&lt;T&gt;</code>', 'Like <code>RefCell</code>, but thread-safe', '<code>Mutex.new</code> / <code>synchronize</code>'],
            ] },
          ],
          beats: [
            { say: 'Sometimes the single owner rule is too strict. Think of a config object that many parts of the app share. Rust has smart pointers for this.' },
            { say: 'Box puts a single value on the heap. It still has one owner, and it is handy for recursive types and trait objects.', show: 't.0' },
            { say: 'Rc means reference counted. Many owners share one value, and it is freed when the last owner goes away.', show: 't.1' },
            { say: 'Arc is the atomic version of Rc, safe to share across threads. You will use it constantly in async web servers.', show: 't.2' },
            { say: 'RefCell lets you mutate through a shared reference. The borrow rules are checked at runtime instead of compile time. Mutex does the same across threads.', show: ['t.3', 't.4'] },
          ],
        },
        {
          title: '<code>Rc</code>: shared ownership by counting',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', size: 17, code: `use std::rc::Rc;

let config = Rc::new(Config::load());
let a = Rc::clone(&config); // count 2
let b = Rc::clone(&config); // count 3
drop(a);                    // count 2
// freed when count hits 0` },
            {
              id: 'd', kind: 'diagram', side: 'right', w: 560, h: 400,
              boxes: [
                { id: 'stack', x: 0, y: 0, w: 230, h: 400, label: 'Stack', cls: 'zone' },
                { id: 'heap', x: 270, y: 0, w: 290, h: 400, label: 'Heap', cls: 'zone' },
                { id: 'cfg', x: 20, y: 50, w: 190, h: 76, label: 'config', sub: 'Rc&lt;Config&gt;', cls: 'rust' },
                { id: 'a', x: 20, y: 170, w: 190, h: 76, label: 'a', sub: 'Rc&lt;Config&gt;', cls: 'rust' },
                { id: 'b', x: 20, y: 290, w: 190, h: 76, label: 'b', sub: 'Rc&lt;Config&gt;', cls: 'rust' },
                { id: 'obj', x: 290, y: 155, w: 250, h: 106, label: 'Config', sub: 'strong count + data', cls: 'heap' },
              ],
              arrows: [
                { id: 'p0', from: 'cfg', to: 'obj', cls: 'rust' },
                { id: 'p1', from: 'a', to: 'obj', cls: 'rust' },
                { id: 'p2', from: 'b', to: 'obj', cls: 'rust' },
              ],
            },
          ],
          beats: [
            { say: 'Rc new puts the config on the heap, next to a counter of how many owners it has. Right now, one.', type: { c: 3 }, show: ['d.stack', 'd.heap', 'd.cfg', 'd.obj', 'd.p0'], note: 'strong count = 1' },
            { say: 'Rc clone does not copy the config. It copies the pointer and bumps the count. Two owners.', type: { c: 4 }, show: ['d.a', 'd.p1'], lines: { c: [4] }, note: 'strong count = 2' },
            { say: 'And a third.', type: { c: 5 }, show: ['d.b', 'd.p2'], lines: { c: [5] }, note: 'strong count = 3' },
            { say: 'Dropping an owner decrements the count. When it reaches zero, the config itself is freed. Like a tiny, predictable garbage collector for just this value.', type: { c: 'all' }, lines: { c: [6, 7] }, cls: { 'd.a': 'dropped', 'd.p1': 'cut' }, note: 'strong count = 2' },
          ],
        },
        {
          title: '<code>RefCell</code>: mutation, checked at runtime',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'cart.rs', size: 18, code: `use std::{cell::RefCell, rc::Rc};

let cart = Rc::new(RefCell::new(vec![]));
let same_cart = Rc::clone(&cart);

same_cart.borrow_mut().push("book");
println!("{:?}", cart.borrow()); // ["book"]` },
            { id: 't', kind: 'text', style: 'big', html: 'Every Ruby object ≈ <em>Rc&lt;RefCell&lt;T&gt;&gt;</em> + a GC' },
          ],
          beats: [
            { say: 'Rc gives you many owners, but only shared, read only access. To mutate shared data, wrap it in a RefCell.', type: { c: 4 } },
            { say: 'borrow mut hands out a mutable borrow at runtime. If one is already active, the program panics instead of failing to compile.', type: { c: 'all' }, lines: { c: [6] } },
            { say: 'Put together, this is basically how every Ruby object works: shared by many references, mutable by anyone, and cleaned up automatically.', show: 't' },
            { say: 'Rust makes you ask for that flexibility explicitly, so you only pay for it where you need it.', note: 'Reaching for <code>Rc&lt;RefCell&gt;</code> everywhere is a smell. Try plain ownership first.' },
          ],
        },
        {
          type: 'checkpoint', title: 'Quick check',
          q: 'Your Axum web server needs to share one read-only <code>AppConfig</code> across many concurrent request handlers running on multiple threads. Which do you reach for?',
          options: ['<code>Box&lt;AppConfig&gt;</code>', '<code>Rc&lt;AppConfig&gt;</code>', '<code>Arc&lt;AppConfig&gt;</code>', '<code>RefCell&lt;AppConfig&gt;</code>'],
          answer: 2,
          explain: 'Many owners across threads means <code>Arc</code>. <code>Rc</code> isn\'t thread-safe (the compiler won\'t let it cross threads), and read-only data needs no <code>RefCell</code> or <code>Mutex</code>.',
          beats: [{ say: 'Checkpoint. Shared config, many threads. Which smart pointer?' }],
        },
      ],
      summary: {
        tldr: 'A lifetime is the span where a reference is valid. The compiler checks that no reference outlives its data, and elision rules mean you rarely write <code>\'a</code> yourself. Own your data in structs. When one owner isn\'t enough, use smart pointers: <code>Box</code> (heap, one owner), <code>Rc</code>/<code>Arc</code> (shared, counted), and <code>RefCell</code>/<code>Mutex</code> (mutation through shared references).',
        points: [
          'Lifetimes stop dangling references. A reference can never outlive the value it borrows.',
          '<code>\'a</code> <b>describes</b> how inputs and outputs relate. Elision means you rarely write it.',
          'Prefer structs that own their data (<code>String</code>, not <code>&amp;str</code>).',
          '<code>Rc</code>/<code>Arc</code> give shared ownership by reference counting, and <code>Arc</code> works across threads.',
          '<code>RefCell</code>/<code>Mutex</code> allow mutation through shared refs. <code>Rc&lt;RefCell&lt;T&gt;&gt;</code> is basically a Ruby object.',
        ],
        rosetta: [
          ['GC keeps referenced objects alive', 'Lifetimes prove references stay valid'],
          ['Model attributes (owned by the object)', 'Struct with owned <code>String</code> / <code>Vec</code> fields'],
          ['Many variables referencing one object', '<code>Rc&lt;T&gt;</code> / <code>Arc&lt;T&gt;</code>'],
          ['Mutating a shared object', '<code>Rc&lt;RefCell&lt;T&gt;&gt;</code> / <code>Arc&lt;Mutex&lt;T&gt;&gt;</code>'],
          ['<code>Mutex.new.synchronize { }</code>', '<code>mutex.lock().unwrap()</code> (unlocks on drop)'],
          ['Every Ruby object', '≈ <code>Rc&lt;RefCell&lt;T&gt;&gt;</code> + a garbage collector'],
        ],
        gotchas: [
          '<code>Rc</code> cycles leak memory, because counts never reach zero. Break cycles with <code>Weak</code>.',
          'Calling <code>borrow_mut()</code> twice at the same time on a <code>RefCell</code> <b>panics</b> at runtime.',
          'Fighting lifetimes in a struct? Switch the field to an owned type (<code>String</code>) and move on.',
        ],
        code: `use std::{cell::RefCell, rc::Rc, sync::Arc};

fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    println!("{}", longest("ruby", "rust"));

    let shared = Rc::new(RefCell::new(Vec::new()));
    let other = Rc::clone(&shared);
    other.borrow_mut().push(1);
    println!("{:?} owners={}", shared.borrow(), Rc::strong_count(&shared));

    let config = Arc::new(String::from("prod")); // share across threads
    let c2 = Arc::clone(&config);
    std::thread::spawn(move || println!("{c2}")).join().unwrap();
}`,
        links: [['The Book, ch. 10.3: Lifetimes', 'https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html'], ['The Book, ch. 15: Smart Pointers', 'https://doc.rust-lang.org/book/ch15-00-smart-pointers.html']],
      },
      quiz: [
        { type: 'compiles', code: 'let r;\n{\n    let x = 5;\n    r = &x;\n}\nprintln!("{r}");', answer: false, explain: '<code>x</code> is dropped at the inner <code>}</code> while <code>r</code> still refers to it: E0597.' },
        { type: 'mcq', q: 'What does the <code>\'a</code> annotation in <code>fn longest&lt;\'a&gt;(a: &amp;\'a str, b: &amp;\'a str) -&gt; &amp;\'a str</code> do?', options: ['Keeps both strings alive until the end of the program', 'Tells the compiler the result is valid only as long as both inputs are', 'Copies the strings onto the heap', 'Makes the function generic over string types'], answer: 1, explain: 'Lifetime annotations describe relationships. They never change how long values live.' },
        { type: 'fill', q: 'Add the missing lifetime parameter declaration.', code: "fn longest<___>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() >= b.len() { a } else { b }\n}", answers: [["'a"]], explain: 'Lifetime parameters are declared in angle brackets, just like generic types.' },
        { type: 'compiles', code: 'struct Post {\n    title: &str,\n}', answer: false, explain: 'A reference field needs a lifetime: <code>struct Post&lt;\'a&gt; { title: &amp;\'a str }</code>. Or, the usual choice, use <code>String</code>.' },
        { type: 'match', q: 'Match the smart pointer with its job.', pairs: [['Box<T>', 'single owner, heap-allocated'], ['Rc<T>', 'shared ownership, one thread'], ['Arc<T>', 'shared ownership across threads'], ['RefCell<T>', 'mutation checked at runtime']] },
        { type: 'mcq', q: 'What happens if you call <code>borrow_mut()</code> on a <code>RefCell</code> while another <code>borrow_mut()</code> from it is still alive?', options: ['Compile error', 'The second call waits', 'The program panics at runtime', 'Both borrows succeed'], answer: 2, explain: '<code>RefCell</code> moves the borrow rules to runtime. Breaking them panics with "already borrowed".' },
      ],
      practice: [
        {
          title: 'x doesn\'t live long enough',
          prompt: 'This is the bug from the start of the video. <code>r</code> borrows <code>x</code>, but <code>x</code> is dropped at the inner <code>}</code> while <code>r</code> is still used: <b>E0597</b>. Change the code so <code>x</code> lives at least as long as <code>r</code>. Expected output: <code>5</code>.',
          starter: `fn main() {
    let r;
    {
        let x = 5;
        r = &x;
    }
    println!("{r}"); // ❌ E0597
}
`,
          hints: ['A reference can never outlive the value it points to, so <code>x</code> must be dropped <i>after</i> the last use of <code>r</code>.', 'Declare <code>let x = 5;</code> <i>outside</i> the inner block, before <code>let r;</code>.', 'Another way: print <code>r</code> inside the block, before the closing brace.'],
          solution: `fn main() {
    let x = 5;
    let r;
    {
        r = &x;
    }
    println!("{r}");
}
`,
          explain: 'Now <code>x</code> lives in the outer scope, longer than <code>r</code>, so the compiler can prove the reference is always valid. That proof is what a lifetime is. The other fix, printing inside the block, also works because <code>r</code> is never used after <code>x</code> is gone.',
        },
        {
          title: 'Fix longest()',
          prompt: 'The compiler can\'t tell which input <code>longest</code> returns a reference from: <b>E0106</b>, <i>missing lifetime specifier</i>. Add the lifetime annotations from the video so it compiles. Expected output: <code>Ruby on Rails</code>.',
          starter: `fn longest(a: &str, b: &str) -> &str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    let framework = String::from("Ruby on Rails");
    let lang = "Rust";
    println!("{}", longest(&framework, lang));
}
`,
          hints: ['Declare the lifetime in angle brackets after the name: <code>fn longest&lt;\'a&gt;(…)</code>.', 'Put <code>\'a</code> on both parameters and on the return type.', 'Full signature: <code>fn longest&lt;\'a&gt;(a: &amp;\'a str, b: &amp;\'a str) -&gt; &amp;\'a str</code>'],
          solution: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    let framework = String::from("Ruby on Rails");
    let lang = "Rust";
    println!("{}", longest(&framework, lang));
}
`,
          explain: 'The annotation says the result is valid only as long as <b>both</b> inputs are. It doesn\'t change how long anything lives, it just tells the compiler how the references relate. In <code>main</code> both inputs are still alive when <code>println!</code> uses the result, so the check passes.',
        },
        {
          title: 'A shared shopping cart',
          prompt: 'Two sessions, <code>alice</code> and <code>bob</code>, share one cart through <code>Rc</code>, and the <code>RefCell</code> inside lets either of them change it. Fill in the three TODOs. Expected output: <code>["book", "pen"]</code>.',
          starter: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    // the type is spelled out for you: nothing has been pushed yet, so Rust can't guess it
    let cart: Rc<RefCell<Vec<&str>>> = Rc::new(RefCell::new(vec![]));
    let alice = Rc::clone(&cart);
    let bob = Rc::clone(&cart);

    // TODO 1: alice adds "book"
    // TODO 2: bob adds "pen"
    // TODO 3: print the cart with {:?}
}
`,
          hints: ['Mutating through a shared <code>Rc</code> goes through the <code>RefCell</code>: <code>alice.borrow_mut().push("book");</code>', 'Do the same for <code>bob</code> with <code>"pen"</code>.', 'To print, borrow the cart read-only: <code>println!("{:?}", cart.borrow());</code>'],
          solution: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let cart: Rc<RefCell<Vec<&str>>> = Rc::new(RefCell::new(vec![]));
    let alice = Rc::clone(&cart);
    let bob = Rc::clone(&cart);

    alice.borrow_mut().push("book");
    bob.borrow_mut().push("pen");
    println!("{:?}", cart.borrow());
}
`,
          explain: 'Each <code>borrow_mut()</code> is a temporary that ends at the semicolon, so the two pushes never overlap (overlapping ones would panic). Three <code>Rc</code> handles share one cart: this is "Ruby object" semantics, but you had to ask for it explicitly.',
        },
      ],
    },
  ],
});
