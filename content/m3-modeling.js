COURSE.modules.push({
  order: 3,
  id: 'm3',
  title: 'Modeling Data',
  blurb: 'Where did my classes go? Structs and impl blocks, enums that carry data, exhaustive pattern matching, and traits: duck typing the compiler can check.',
  lessons: [
    // ------------------------------------------------------------------ 3.1
    {
      id: 'structs-impl',
      title: 'Structs & impl (where are my classes?)',
      subtitle: 'Data and behavior, declared separately and composed on purpose.',
      tags: ['struct', 'impl', 'methods', 'derive', 'pub', 'mod', 'classes'],
      scenes: [
        {
          type: 'title', kicker: 'Module 3 · Lesson 1', title: 'Structs & impl',
          subtitle: 'Where are my classes? Spoiler: split in two, on purpose.',
          beats: [
            { say: 'In Ruby, everything is an object and everything has a class. Rust has no classes at all.' },
            { say: 'Instead it splits a class into two pieces: a struct for the data, and an impl block for the behavior.' },
          ],
        },
        {
          title: 'A PORO becomes a struct',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'app/models/user.rb', code: `class User
  attr_reader :name, :email
  attr_accessor :admin

  def initialize(name, email)
    @name = name
    @email = email
    @admin = false
  end
end` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'src/user.rs', code: `struct User {
    name: String,
    email: String,
    admin: bool,
}

let u = User {
    name: String::from("Ada"),
    email: "ada@example.com".into(),
    admin: false,
};` },
          ],
          beats: [
            { say: 'Here is a plain old Ruby object. Instance variables appear the first time initialize assigns them.', type: { rb: 'all' } },
            { say: 'In Rust, the fields are declared up front, each with a type. This is a struct. It is pure data, with no methods yet.', type: { rs: 5 }, lines: { rs: [1, 2, 3, 4, 5] } },
            { say: 'You build one with a struct literal. Every field must be given a value. Rust has no implicit nil defaults.', type: { rs: 'all' }, lines: { rs: [7, 8, 9, 10, 11] }, note: 'Missing a field is a compile error, not a <code>nil</code> you discover later.' },
            { say: 'Notice there are no attribute readers. Visibility is decided per field, which we will get to in a minute.', lines: { rb: [2, 3] } },
          ],
        },
        {
          title: 'impl: where the methods live',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 18, code: `impl User {
    // associated function: no self, called User::new(..)
    fn new(name: &str, email: &str) -> Self {
        Self { name: name.to_string(), email: email.to_string(), admin: false }
    }

    fn display_name(&self) -> String {        // read-only borrow
        format!("{} <{}>", self.name, self.email)
    }

    fn promote(&mut self) { self.admin = true }   // mutable borrow

    fn into_email(self) -> String { self.email }  // takes ownership
}` },
          ],
          beats: [
            { say: 'Behavior goes in an impl block for the type. You can have several impl blocks, even in different files.', type: { c: 1 } },
            { say: 'A function without self is an associated function, like a Ruby class method. By convention, new is the constructor. Rust has no special initialize.', type: { c: 5 }, lines: { c: [2, 3, 4, 5] }, note: '<code>Self</code> is an alias for the type being implemented, here <code>User</code>.' },
            { say: 'Methods take self as the first parameter, and how they take it matters. Ampersand self borrows the value read-only.', type: { c: 9 }, lines: { c: [7, 8, 9] } },
            { say: 'Ampersand mut self borrows it mutably, so the method can change fields. The caller must have a mutable variable.', type: { c: 11 }, lines: { c: [11] } },
            { say: 'And plain self takes ownership. The value is consumed, and the caller cannot use it afterwards.', type: { c: 'all' }, lines: { c: [13] } },
          ],
        },
        {
          title: 'The three flavors of self',
          blocks: [
            {
              id: 't', kind: 'table', head: ['Signature', 'Means', 'Ruby analogy'], rows: [
                ['<code>fn f(&amp;self)</code>', 'Read-only access', 'A reader / query method'],
                ['<code>fn f(&amp;mut self)</code>', 'May modify fields', 'An in-place bang method, like <code>upcase!</code> or <code>map!</code>'],
                ['<code>fn f(self)</code>', 'Consumes the value', '<i>(none)</i>. Like <code>to_s</code>, if the original then vanished'],
                ['<code>fn f() -&gt; Self</code>', 'No instance', '<code>def self.build</code>'],
              ], cls: 'sm',
            },
            { id: 'c', kind: 'code', lang: 'rust', size: 18, code: `let mut u = User::new("Ada", "ada@example.com");
u.promote();                 // needs \`let mut\`
println!("{}", u.display_name());` },
          ],
          beats: [
            { say: 'Let us line those up. Ampersand self is a reader: it looks but never touches.', show: 't.0' },
            { say: 'Ampersand mut self is for methods that change state. In Ruby you might mark these with a bang.', show: 't.1' },
            { say: 'Plain self consumes the value. Ruby has no real equivalent, because the garbage collector keeps everything alive.', show: 't.2' },
            { say: 'And a function with no self is a class method, called with two colons.', show: 't.3' },
            { say: 'Calling methods looks just like Ruby, with a dot. Rust borrows automatically when you call them.', type: { c: 'all' }, lines: { c: [2] } },
          ],
        },
        {
          title: 'derive: free behavior, opt-in',
          layout: 'split',
          blocks: [
            { id: 'rs', kind: 'code', lang: 'rust', size: 18, code: `#[derive(Debug, Clone, PartialEq, Default)]
struct Settings {
    theme: String,
    per_page: u32,
    beta: bool,
}

let a = Settings::default();
let b = a.clone();
assert_eq!(a, b);
println!("{:?}", a);` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              { icon: '🔍', text: '<code>Debug</code> → <code>inspect</code>: print with <code>{:?}</code>' },
              { icon: '📄', text: '<code>Clone</code> → <code>dup</code>: explicit <code>.clone()</code>' },
              { icon: '⚖️', text: '<code>PartialEq</code> → <code>==</code> comparing all fields' },
              { icon: '0️⃣', text: '<code>Default</code> → zero values: <code>""</code>, <code>0</code>, <code>false</code>' },
            ] },
          ],
          beats: [
            { say: 'Every Ruby object gets inspect, dup and double-equals for free. A Rust struct starts with none of them.', type: { rs: 6 } },
            { say: 'You opt in with the derive attribute. The compiler writes the implementation for you.', lines: { rs: [1] } },
            { say: 'Debug is inspect. It lets you print the struct with colon question mark.', show: 'b.0', type: { rs: 'all' }, lines: { rs: [11] } },
            { say: 'Clone is dup. Copies are always explicit with dot clone, so you can see where they happen.', show: 'b.1', lines: { rs: [9] } },
            { say: 'PartialEq gives you double equals comparing every field. Default builds an instance with zero values.', show: ['b.2', 'b.3'], lines: { rs: [8, 10] } },
          ],
        },
        {
          title: 'No inheritance. Composition instead.',
          blocks: [
            {
              id: 'd', kind: 'diagram', w: 1100, h: 350,
              boxes: [
                { id: 'ar', x: 40, y: 0, w: 300, h: 64, label: 'ApplicationRecord', cls: 'ruby' },
                { id: 'user', x: 40, y: 140, w: 300, h: 64, label: 'User', sub: '< ApplicationRecord', cls: 'ruby' },
                { id: 'admin', x: 40, y: 280, w: 300, h: 64, label: 'Admin', sub: '< User', cls: 'ruby' },
                { id: 'acc', x: 560, y: 20, w: 240, h: 70, label: 'Account', sub: 'struct', cls: 'rust' },
                { id: 'prof', x: 840, y: 20, w: 240, h: 70, label: 'Profile', sub: 'struct', cls: 'rust' },
                { id: 'ru', x: 690, y: 200, w: 260, h: 90, label: 'User', sub: '{ account, profile }', cls: 'rust' },
              ],
              arrows: [
                { id: 'i1', from: 'user', to: 'ar', label: 'is a', bend: -70 },
                { id: 'i2', from: 'admin', to: 'user', label: 'is a', bend: -70 },
                { id: 'h1', from: 'ru', to: 'acc', label: 'has a', cls: 'rust', bend: 50 },
                { id: 'h2', from: 'ru', to: 'prof', label: 'has a', cls: 'rust', bend: -50 },
              ],
            },
          ],
          beats: [
            { say: 'Rails leans on inheritance. Your model is an ApplicationRecord, and maybe Admin inherits from User.', show: ['d.ar', 'd.user', 'd.i1'] },
            { say: 'Single table inheritance stacks up another layer.', show: ['d.admin', 'd.i2'] },
            { say: 'Rust structs cannot inherit from anything. Instead you compose: a struct holds other structs as fields.', show: ['d.acc', 'd.prof', 'd.ru', 'd.h1', 'd.h2'] },
            { say: 'Shared behavior comes from traits, which we cover in lesson three. Think "has a" and "can do", never "is a".', hl: ['d.ru'], note: 'The Rails rule "prefer composition over inheritance" is the only option in Rust.' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'Which method signature lets <code>deactivate</code> change the <code>active</code> field of a user the caller keeps using?',
          options: ['<code>fn deactivate(&amp;self)</code>', '<code>fn deactivate(&amp;mut self)</code>', '<code>fn deactivate(self)</code>', '<code>fn deactivate()</code>'],
          answer: 1,
          explain: '<code>&amp;mut self</code> borrows the value mutably and hands it back afterwards. <code>self</code> would also allow mutation, but it consumes the user.',
          beats: [{ say: 'Checkpoint. Which flavor of self lets you mutate while the caller keeps the value?' }],
        },
        {
          title: 'Visibility & modules (no Zeitwerk)',
          layout: 'split',
          blocks: [
            { id: 'rs', kind: 'code', lang: 'rust', size: 16, label: 'src/models/user.rs', code: `pub struct User {
    pub name: String,
    password_digest: String, // private
}

impl User {
    pub fn new(name: &str) -> Self { /* .. */ }
    fn hash(pw: &str) -> String { /* .. */ }
}` },
            { id: 'm', kind: 'code', lang: 'rust', size: 17, label: 'src/main.rs', code: `mod models;            // src/models/mod.rs
use models::user::User;

fn main() {
    let u = User::new("Ada");
    println!("{}", u.name);
    // u.password_digest  ❌ private
}` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Everything is <em>private by default</em>, even struct fields. Files are not autoloaded: you declare modules with <code>mod</code> and import with <code>use</code>.' },
          ],
          beats: [
            { say: 'In Ruby everything is public unless you write private. Rust flips that. Everything is private unless marked pub.', type: { rs: 4 } },
            { say: 'That includes fields. A private field can only be touched by code in the same module. Outside it, you cannot read the field, or even build the struct with a literal. You go through a pub constructor like new, so your invariants stay safe.', lines: { rs: [3] } },
            { say: 'Methods are the same. A pub fn is your public API, and the rest are private helpers.', type: { rs: 'all' }, lines: { rs: [7, 8] } },
            { say: 'There is no Zeitwerk autoloading. You declare the module tree with mod, and bring names into scope with use, a bit like require.', type: { m: 'all' }, lines: { m: [1, 2] } },
            { say: 'Private by default, and explicit about where code lives. Refactors get much safer.', show: 'n' },
          ],
        },
      ],
      summary: {
        tldr: 'A Ruby class becomes a <code>struct</code> for the data plus an <code>impl</code> block for the behavior. Constructors are ordinary associated functions, by convention <code>new</code>. Methods borrow (<code>&amp;self</code>, <code>&amp;mut self</code>) or consume (<code>self</code>). Common behavior is opted into with <code>#[derive]</code>. There is no inheritance, and everything is private by default.',
        points: [
          '<code>struct</code> declares typed fields up front, and every field must be set when you build one.',
          '<code>impl Type { ... }</code> holds methods. Functions without <code>self</code> are associated functions, like class methods: <code>User::new(..)</code>.',
          '<code>&amp;self</code> reads, <code>&amp;mut self</code> modifies, and <code>self</code> consumes the value.',
          '<code>#[derive(Debug, Clone, PartialEq, Default)]</code> gives you <code>inspect</code>, <code>dup</code>, <code>==</code> and defaults.',
          'No inheritance: compose structs, and share behavior with traits.',
          'Items and fields are private unless marked <code>pub</code>. Modules are declared with <code>mod</code> and imported with <code>use</code>.',
        ],
        rosetta: [
          ['<code>class User</code>', '<code>struct User { .. }</code> + <code>impl User { .. }</code>'],
          ['<code>def initialize</code>', '<code>fn new(..) -&gt; Self</code> (convention)'],
          ['<code>def self.find</code>', '<code>fn find(..)</code> without <code>self</code>, called <code>User::find(..)</code>'],
          ['<code>attr_reader :name</code>', '<code>pub name: String</code> or a <code>pub fn name(&amp;self)</code>'],
          ['<code>obj.inspect</code>', '<code>#[derive(Debug)]</code> + <code>{:?}</code>'],
          ['<code>obj.dup</code>', '<code>#[derive(Clone)]</code> + <code>.clone()</code>'],
          ['<code>class Admin &lt; User</code>', 'Composition + traits'],
          ['Zeitwerk autoloading', '<code>mod</code> + <code>use</code>'],
        ],
        gotchas: [
          'Forgetting <code>let mut</code> before calling a <code>&amp;mut self</code> method gives you "cannot borrow as mutable".',
          'A struct with even one private field cannot be built with a literal outside its module. Provide a <code>new</code>.',
          '<code>{}</code> needs the <code>Display</code> trait. <code>{:?}</code> needs <code>Debug</code>. Derive <code>Debug</code> almost everywhere.',
        ],
        code: `#[derive(Debug, Clone, PartialEq)]
pub struct User {
    pub name: String,
    admin: bool,
}

impl User {
    pub fn new(name: &str) -> Self {
        Self { name: name.to_string(), admin: false }
    }
    pub fn is_admin(&self) -> bool { self.admin }
    pub fn promote(&mut self) { self.admin = true }
}`,
        links: [['The Book, ch. 5: Structs', 'https://doc.rust-lang.org/book/ch05-00-structs.html'], ['The Book, ch. 7: Modules', 'https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html'], ['Rust by Example: derive', 'https://doc.rust-lang.org/rust-by-example/trait/derive.html']],
      },
      quiz: [
        { type: 'match', q: 'Match the Ruby idiom with its Rust counterpart.', pairs: [['def initialize', 'fn new() -> Self'], ['def self.find', 'associated fn (no self)'], ['inspect', '#[derive(Debug)]'], ['dup', '.clone()'], ['class Admin < User', 'composition + traits']] },
        { type: 'compiles', code: 'struct Counter { n: u32 }\n\nimpl Counter {\n    fn bump(&mut self) { self.n += 1; }\n}\n\nfn main() {\n    let c = Counter { n: 0 };\n    c.bump();\n}', answer: false, explain: '<code>bump</code> needs <code>&amp;mut self</code>, but <code>c</code> is not declared <code>mut</code>. Write <code>let mut c</code>.' },
        { type: 'fill', q: 'Complete the constructor.', code: 'impl User {\n    fn new(name: &str) -> ___ {\n        Self { name: name.to_string() }\n    }\n}\n\nlet u = User___new("Ada");', answers: [['Self', 'User'], ['::']], explain: 'Associated functions return <code>Self</code> and are called with <code>::</code>.' },
        { type: 'mcq', q: 'What happens to <code>order</code> after calling <code>order.into_receipt()</code>, where <code>fn into_receipt(self) -&gt; Receipt</code>?', options: ['Nothing, it is still usable', 'It is set to nil', 'It has been moved, and using it again is a compile error', 'It is cloned automatically'], answer: 2, explain: 'A method taking <code>self</code> consumes the value. The <code>into_</code> prefix is the naming convention for that.' },
        { type: 'mcq', q: 'Without any <code>derive</code>, which of these works on a struct?', options: ['<code>println!("{:?}", s)</code>', '<code>s == other</code>', '<code>s.clone()</code>', 'Reading a field in the same module: <code>s.name</code>'], answer: 3, explain: 'Debug, PartialEq and Clone must be derived or implemented. Field access always works inside the module.' },
        { type: 'compiles', q: 'In <code>main.rs</code>, with <code>User</code> defined in <code>mod models</code> as <code>pub struct User { name: String }</code>:', code: 'let u = models::User { name: "Ada".to_string() };', answer: false, explain: 'The struct is <code>pub</code> but the field <code>name</code> is private, so outside the module you cannot build it with a literal or read the field.' },
      ],
      practice: [
        {
          title: 'Three flavors of self: BankAccount',
          prompt: 'A <code>BankAccount</code> struct and two methods are done for you: <code>new</code> (an associated function) and <code>balance(&amp;self)</code> (read-only). Two other methods are stubs with the <b>wrong</b> flavor of <code>self</code>. Fix them. <b>1)</b> <code>deposit</code> must change the account: make it <code>&amp;mut self</code> and add <code>cents</code> to the balance. <b>2)</b> <code>close</code> must consume the account and return what was left in it: make it plain <code>self</code>. The starter compiles, but the asserts fail until you are done. When it works it prints the account and then <code>Paid out 1750 cents ✅</code>.',
          starter: `#[derive(Debug)]
struct BankAccount {
    owner: String,
    balance_cents: u64,
}

impl BankAccount {
    // done for you: a constructor (an associated function: no self)
    fn new(owner: &str) -> Self {
        Self { owner: owner.to_string(), balance_cents: 0 }
    }

    // done for you: a read-only method
    fn balance(&self) -> u64 {
        self.balance_cents
    }

    // TODO 1: deposit must CHANGE the account. Which flavor of self is that? Add cents to the balance.
    fn deposit(&self, cents: u64) {
    }

    // TODO 2: close must CONSUME the account and return what was left in it.
    fn close(&self) -> u64 {
        0
    }
}

fn main() {
    let mut acct = BankAccount::new("Ada");
    acct.deposit(1_500);
    acct.deposit(250);
    println!("{:?}", acct);
    assert_eq!(acct.balance(), 1_750);
    let payout = acct.close();
    assert_eq!(payout, 1_750);
    println!("Paid out {payout} cents ✅");
    // BONUS: uncomment the next line. Which error do you get, and why?
    // println!("{}", acct.balance());
}
`,
          hints: ['Open the scene "The three flavors of self" in the video: changing fields needs <code>&amp;mut self</code>, and consuming the value is plain <code>self</code>.', 'deposit: <code>fn deposit(&amp;mut self, cents: u64) { self.balance_cents += cents; }</code>', 'close: <code>fn close(self) -&gt; u64 { self.balance_cents }</code>'],
          solution: `#[derive(Debug)]
struct BankAccount {
    owner: String,
    balance_cents: u64,
}

impl BankAccount {
    // done for you: a constructor (an associated function: no self)
    fn new(owner: &str) -> Self {
        Self { owner: owner.to_string(), balance_cents: 0 }
    }

    // done for you: a read-only method
    fn balance(&self) -> u64 {
        self.balance_cents
    }

    fn deposit(&mut self, cents: u64) {
        self.balance_cents += cents;
    }

    fn close(self) -> u64 {
        self.balance_cents
    }
}

fn main() {
    let mut acct = BankAccount::new("Ada");
    acct.deposit(1_500);
    acct.deposit(250);
    println!("{:?}", acct);
    assert_eq!(acct.balance(), 1_750);
    let payout = acct.close();
    assert_eq!(payout, 1_750);
    println!("Paid out {payout} cents ✅");
    // BONUS: uncomment the next line. Which error do you get, and why?
    // println!("{}", acct.balance());
}
`,
          explain: 'Each flavor of <code>self</code> says what a method may do with the account. After <code>close(self)</code> the account has been moved into the method, so the commented-out line at the end fails with E0382, "borrow of moved value: <code>acct</code>". Try it: a closed account cannot be used by mistake.',
        },
      ],
    },

    // ------------------------------------------------------------------ 3.2
    {
      id: 'enums-match',
      title: 'Enums & pattern matching',
      subtitle: 'Rails enums on steroids, case/when that can\'t forget a case, and the end of nil.',
      tags: ['enum', 'match', 'option', 'if let', 'pattern', 'state machine', 'nil'],
      scenes: [
        {
          type: 'title', kicker: 'Module 3 · Lesson 2', title: 'Enums & pattern matching',
          subtitle: 'The feature Rubyists miss most when they go back.',
          beats: [
            { say: 'If you only remember one Rust feature from this course, make it this one. Enums plus match.' },
            { say: 'They replace Rails enums, state machines, case when, and nil, all with one idea.' },
          ],
        },
        {
          title: 'Rails enum → Rust enum',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'app/models/order.rb', code: `class Order < ApplicationRecord
  enum :status, {
    pending: 0,
    paid: 1,
    shipped: 2,
    cancelled: 3,
  }
end

order.status   # => "paid" (a String!)` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'src/order.rs', code: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Status {
    Pending,
    Paid,
    Shipped,
    Cancelled,
}

let s = Status::Paid;   // a real type` },
          ],
          beats: [
            { say: 'A Rails enum maps names to integers in the database. Ask for the status and you get back a string.', type: { rb: 'all' }, lines: { rb: [10] } },
            { say: 'A Rust enum is a type that is exactly one of a fixed set of variants.', type: { rs: 7 } },
            { say: 'A typo like Status colon colon Payed is a compile error, not a silent nil or an ArgumentError at runtime.', type: { rs: 'all' }, lines: { rs: [9] } },
          ],
        },
        {
          title: 'Variants can carry data',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 16, code: `enum Payment {
    Cash,
    Card { last4: String, brand: String },
    PayPal(String),            // the account email
    Crypto { coin: String, tx: String },
}

let p = Payment::Card {
    last4: "4242".into(),
    brand: "visa".into(),
};` },
            { id: 'n', kind: 'text', style: 'callout', html: 'In Rails this would be polymorphism, STI, or a <code>kind</code> column plus nullable columns. Here each variant has <em>exactly</em> the fields it needs.' },
          ],
          beats: [
            { say: 'Here is where Rust enums leave Rails enums behind. Each variant can carry its own data.', type: { c: 2 } },
            { say: 'A card payment has the last four digits and a brand. Cash has nothing.', type: { c: 3 }, lines: { c: [3] } },
            { say: 'Variants can hold unnamed fields like a tuple, or named fields like a struct.', type: { c: 6 }, lines: { c: [4, 5] } },
            { say: 'In Rails you might reach for single table inheritance, with half the columns null for each type. Here an invalid combination is impossible to build.', type: { c: 'all' }, show: 'n' },
          ],
        },
        {
          title: 'match: case/when that can\'t forget',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `case payment.kind
when "cash"
  "Pay at the counter"
when "card"
  "Card ending #{payment.last4}"
end
# paypal? → returns nil 🤷` },
            { id: 'rs', kind: 'code', lang: 'rust', size: 17, code: `let msg: String = match &p {
    Payment::Cash => "At the counter".into(),
    Payment::Card { last4, .. } =>
        format!("Card ending {last4}"),
    Payment::PayPal(email) =>
        format!("PayPal: {email}"),
    Payment::Crypto { coin, .. } =>
        format!("{coin} wallet"),
};` },
          ],
          beats: [
            { say: 'Ruby\'s case when quietly returns nil when nothing matches. Forget a branch and you will not know until production.', type: { rb: 'all' }, lines: { rb: [7] } },
            { say: 'Rust\'s match is an expression too, so it returns a value. Each arm is a pattern, a fat arrow, and an expression.', type: { rs: 2 } },
            { say: 'Patterns destructure. This arm pulls last four out of the card, and dot dot ignores the other fields.', type: { rs: 4 }, lines: { rs: [3, 4] } },
            { say: 'The big one: match must be exhaustive. Leave out a variant and the code does not compile.', type: { rs: 'all' }, lines: { rs: [5, 6, 7, 8] }, note: 'An underscore <code>_ =&gt;</code> arm is the "else". Use it sparingly, or it hides new variants.' },
          ],
        },
        {
          title: 'Add a variant, and the compiler finds every case',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', code: `enum Status { Pending, Paid, Shipped, Cancelled, Refunded }
//                                              ^^^^^^^^ new!` },
            { id: 'e', kind: 'text', style: 'err', html: '<b>error[E0004]</b>: non-exhaustive patterns: `Status::Refunded` not covered\n  --> src/emails.rs:12:11\n<b>error[E0004]</b>: non-exhaustive patterns: `Status::Refunded` not covered\n  --> src/reports.rs:40:15\n<b>error[E0004]</b>: non-exhaustive patterns: `Status::Refunded` not covered\n  --> src/api/orders.rs:88:9' },
            { id: 'ok', kind: 'text', style: 'ok', html: 'A free to-do list of every place that handles order status. Try getting that from <code>grep "shipped"</code> in a Rails app.' },
          ],
          beats: [
            { say: 'Here is why teams fall in love with this. Product asks for a new order state: refunded.', type: { c: 'all' } },
            { say: 'You add the variant and run cargo check. Every match on Status that does not handle refunded is now an error, with its file and line.', show: 'e' },
            { say: 'For a state machine, that is gold. You cannot ship a half-handled new state.', show: 'ok' },
          ],
        },
        {
          title: 'Option<T>: nil, but honest',
          layout: 'split',
          blocks: [
            { id: 'def', kind: 'code', lang: 'rust', label: 'std (simplified)', code: `enum Option<T> {
    Some(T),
    None,
}` },
            { id: 'rs', kind: 'code', lang: 'rust', size: 17, code: `let user: Option<User> = find_by_email(&email);

match user {
    Some(u) => println!("Hi {}", u.name),
    None => println!("No such user"),
}

if let Some(u) = find_by_email(&email) {
    println!("Hi {}", u.name);
}` },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'left', items: ['Just an ordinary enum from the standard library', '<code>Option&lt;User&gt;</code> and <code>User</code> are different types', '<code>if let</code> handles one pattern and ignores the rest'] },
          ],
          beats: [
            { say: 'Remember Option from lesson one? It is not magic. It is a plain enum with two variants: Some holding a value, or None.', type: { def: 'all' }, show: 'b.0' },
            { say: 'Because Option of User is a different type from User, you cannot accidentally call a user method on a maybe-missing value.', show: 'b.1' },
            { say: 'You open it with match, handling both cases explicitly.', type: { rs: 6 }, lines: { rs: [3, 4, 5, 6] } },
            { say: 'When you only care about one case, if let is the short form. It reads like Ruby\'s if user equals find by.', type: { rs: 'all' }, show: 'b.2', lines: { rs: [8, 9, 10] } },
          ],
        },
        {
          title: 'Option helpers: your safe-navigation toolkit',
          blocks: [
            {
              id: 't', kind: 'table', cls: 'sm', head: ['Ruby', 'Rust', 'Meaning'], rows: [
                ['<code>user&amp;.name</code>', '<code>user.map(|u| u.name)</code>', 'Transform if present'],
                ['<code>name || "Guest"</code>', '<code>name.unwrap_or("Guest")</code>', 'Fallback value'],
                ['<code>user.present?</code>', '<code>user.is_some()</code>', 'Presence check'],
                ['<code>find_by!(..)</code>', '<code>.expect("user must exist")</code>', 'Crash if missing'],
                ['<code>return unless user</code>', '<code>let Some(u) = user else { return };</code>', 'Early exit'],
                ['<code>user&amp;.account&amp;.plan</code>', '<code>user?.account?.plan</code> (in fns returning <code>Option</code>)', 'Chain lookups'],
              ],
            },
          ],
          beats: [
            { say: 'You will rarely write a full match on an Option. There is a method for almost every Ruby idiom you know.' },
            { say: 'The safe navigation operator becomes map. Fallbacks with a double pipe become unwrap or.', show: ['t.0', 't.1'] },
            { say: 'present question mark becomes is some. find by bang, which raises, becomes expect. That panics with your message.', show: ['t.2', 't.3'] },
            { say: 'The guard clause, return unless user, becomes let else. It binds the value or leaves the function.', show: 't.4', hl: ['t.4'] },
            { say: 'And inside a function that returns an Option, the question mark operator chains lookups like a safe navigation chain.', show: 't.5' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'What does this print?',
          code: `let n: Option<i32> = None;
let v = n.map(|x| x * 2).unwrap_or(0);
println!("{v}");`,
          options: ['<code>0</code>', '<code>None</code>', 'It panics', 'It does not compile'],
          answer: 0,
          explain: '<code>map</code> on <code>None</code> stays <code>None</code>, so <code>unwrap_or(0)</code> supplies the fallback, <code>0</code>.',
          beats: [{ say: 'Checkpoint. Follow the None through the chain.' }],
        },
        {
          title: 'Patterns everywhere: guards, ranges, matches!',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 18, code: `fn shipping(weight_kg: u32, country: &str) -> u32 {
    match (weight_kg, country) {
        (0, _) => 0,
        (1..=5, "CL") => 3_000,
        (w, "CL") if w > 5 => 3_000 + (w - 5) * 500,
        (_, "US" | "CA") => 15_000,
        _ => 25_000,
    }
}

let can_cancel = matches!(status, Status::Pending | Status::Paid);` },
          ],
          beats: [
            { say: 'Patterns are much richer than case when. You can match on a tuple of values at once.', type: { c: 3 }, lines: { c: [2, 3] } },
            { say: 'Ranges match numbers, and string literals match strings.', type: { c: 4 }, lines: { c: [4] } },
            { say: 'An if after a pattern is a guard, an extra condition for that arm. A vertical bar means or.', type: { c: 6 }, lines: { c: [5, 6] } },
            { say: 'Underscore catches everything else. Arms are checked top to bottom, like when clauses.', type: { c: 9 }, lines: { c: [7] } },
            { say: 'And when you just need a yes or no, the matches macro returns a boolean. It is perfect for predicates like can cancel.', type: { c: 'all' }, lines: { c: [11] } },
          ],
        },
      ],
      summary: {
        tldr: 'Rust enums are closed sets of variants, and each variant can carry its own data. <code>match</code> destructures them and must cover every variant, so adding a state flags every place that needs updating. <code>Option&lt;T&gt;</code> is just an enum (<code>Some</code>/<code>None</code>) that replaces <code>nil</code>, with helpers like <code>map</code>, <code>unwrap_or</code>, <code>if let</code> and <code>let else</code>.',
        points: [
          'An <code>enum</code> value is exactly one of its variants, and variants can carry tuple or struct-like data.',
          '<code>match</code> is an expression, destructures patterns, and is checked for <b>exhaustiveness</b>.',
          'Adding a variant turns every unhandled <code>match</code> into a compile error, which is ideal for state machines.',
          '<code>Option&lt;T&gt;</code> = <code>Some(T)</code> | <code>None</code>. Use <code>if let</code>, <code>let ... else</code>, <code>map</code>, <code>unwrap_or</code> and <code>?</code>.',
          'Patterns support tuples, ranges, <code>|</code>, guards (<code>if</code>), <code>..</code> and <code>_</code>. <code>matches!</code> returns a bool.',
        ],
        rosetta: [
          ['<code>enum :status, {...}</code>', '<code>enum Status { .. }</code>'],
          ['STI / polymorphic <code>kind</code> column', 'Enum variants carrying data'],
          ['<code>case ... when</code>', '<code>match</code> (exhaustive)'],
          ['<code>else</code> in <code>case</code>', '<code>_ =&gt;</code>'],
          ['<code>nil</code>', '<code>None</code>'],
          ['<code>user&amp;.name</code>', '<code>user.map(|u| u.name)</code>'],
          ['<code>x || default</code>', '<code>x.unwrap_or(default)</code>'],
          ['<code>return unless x</code>', '<code>let Some(x) = x else { return };</code>'],
        ],
        gotchas: [
          'A catch-all <code>_ =&gt;</code> arm disables the "new variant" safety net for that match. Prefer listing variants.',
          '<code>.unwrap()</code> on <code>None</code> panics, just like <code>find_by!</code> raising. Fine in tests, suspicious in handlers.',
          'Matching on <code>&amp;value</code> borrows the fields. Matching on <code>value</code> moves them out.',
        ],
        code: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Status { Pending, Paid, Shipped, Cancelled }

impl Status {
    fn label(self) -> &'static str {
        match self {
            Status::Pending => "Awaiting payment",
            Status::Paid => "Preparing",
            Status::Shipped => "On the way",
            Status::Cancelled => "Cancelled",
        }
    }
}`,
        links: [['The Book, ch. 6: Enums and Pattern Matching', 'https://doc.rust-lang.org/book/ch06-00-enums.html'], ['The Book, ch. 19: Patterns', 'https://doc.rust-lang.org/book/ch19-00-patterns.html'], ['Option docs', 'https://doc.rust-lang.org/std/option/enum.Option.html']],
      },
      quiz: [
        { type: 'compiles', code: 'enum Light { Red, Yellow, Green }\n\nfn next(l: Light) -> Light {\n    match l {\n        Light::Red => Light::Green,\n        Light::Green => Light::Yellow,\n    }\n}', answer: false, explain: '<code>Light::Yellow</code> is not covered. <code>match</code> must be exhaustive (error E0004).' },
        { type: 'mcq', q: 'In Ruby you wrote <code>user&amp;.email || "unknown"</code>. With <code>user: Option&lt;User&gt;</code>, which Rust version is equivalent?', options: ['<code>user.email.unwrap_or("unknown")</code>', '<code>user.map(|u| u.email).unwrap_or("unknown".to_string())</code>', '<code>user?.email || "unknown"</code>', '<code>user.unwrap().email</code>'], answer: 1, explain: '<code>map</code> transforms the inner value if it is present, and <code>unwrap_or</code> provides the fallback. The types must match, so the fallback is a <code>String</code>.' },
        { type: 'fill', q: 'Complete the guard clause: bind the user or return early.', code: 'fn greet(user: Option<User>) {\n    let ___(u) = user ___ { return };\n    println!("Hi {}", u.name);\n}', answers: [['Some'], ['else']], explain: '<code>let Some(u) = user else { return };</code> is Rust\'s <code>return unless user</code>.' },
        { type: 'match', q: 'Match the Ruby construct to the Rust one.', pairs: [['case/when', 'match'], ['nil', 'None'], ['else branch in case', '_ =>'], ['enum :status (Rails)', 'enum Status'], ['STI subclasses', 'variants with data']] },
        { type: 'mcq', q: 'What does <code>matches!(s, Status::Paid | Status::Shipped)</code> return?', options: ['The matched variant', 'A <code>bool</code>', 'An <code>Option&lt;Status&gt;</code>', 'Nothing. It panics if there is no match'], answer: 1, explain: '<code>matches!</code> expands to a <code>match</code> that returns <code>true</code> or <code>false</code>.' },
        { type: 'compiles', code: 'enum Shape { Circle(f64), Rect { w: f64, h: f64 } }\n\nfn area(s: Shape) -> f64 {\n    match s {\n        Shape::Circle(r) => 3.14 * r * r,\n        Shape::Rect { w, h } => w * h,\n    }\n}', answer: true, explain: 'Both variants are covered, so the match is exhaustive, and the patterns pull the data out of each variant into <code>r</code>, <code>w</code> and <code>h</code>.' },
      ],
      practice: [
        {
          title: 'Order state machine',
          prompt: 'The enums <code>Status</code> and <code>Event</code>, and the first rule of <code>transition</code>, are done for you. Add the other two rules to the <code>match</code>. <b>1)</b> Paid + Ship gives Shipped. <b>2)</b> Pending <em>or</em> Paid + Cancel gives Cancelled (use <code>|</code> inside the pattern). Everything else is an illegal transition and returns <code>None</code>: that is what the final <code>_</code> arm is for. The starter compiles, but the asserts fail until you add the arms. When it works it prints <code>All transitions OK ✅</code>. Bonus: add a <code>Refunded</code> variant to <code>Status</code>. Does the compiler complain? Why, or why not?',
          starter: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Status { Pending, Paid, Shipped, Cancelled }

#[derive(Debug, Clone, Copy)]
enum Event { Pay, Ship, Cancel }

fn transition(s: Status, e: Event) -> Option<Status> {
    match (s, e) {
        (Status::Pending, Event::Pay) => Some(Status::Paid), // done for you
        // TODO 1: (Status::Paid, Event::Ship) => ...
        // TODO 2: (Status::Pending | Status::Paid, Event::Cancel) => ...
        _ => None, // everything else is illegal
    }
}

fn main() {
    assert_eq!(transition(Status::Pending, Event::Pay), Some(Status::Paid));
    assert_eq!(transition(Status::Paid, Event::Ship), Some(Status::Shipped));
    assert_eq!(transition(Status::Paid, Event::Cancel), Some(Status::Cancelled));
    assert_eq!(transition(Status::Pending, Event::Cancel), Some(Status::Cancelled));
    assert_eq!(transition(Status::Shipped, Event::Cancel), None);
    assert_eq!(transition(Status::Pending, Event::Ship), None);
    println!("All transitions OK ✅");
}
`,
          hints: ['Each arm is <code>pattern =&gt; value</code>. Copy the shape of the first arm. The scene "Patterns everywhere" shows <code>|</code> inside a pattern.', 'TODO 1: <code>(Status::Paid, Event::Ship) =&gt; Some(Status::Shipped),</code>', 'TODO 2: <code>(Status::Pending | Status::Paid, Event::Cancel) =&gt; Some(Status::Cancelled),</code>'],
          solution: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Status { Pending, Paid, Shipped, Cancelled }

#[derive(Debug, Clone, Copy)]
enum Event { Pay, Ship, Cancel }

fn transition(s: Status, e: Event) -> Option<Status> {
    match (s, e) {
        (Status::Pending, Event::Pay) => Some(Status::Paid), // done for you
        (Status::Paid, Event::Ship) => Some(Status::Shipped),
        (Status::Pending | Status::Paid, Event::Cancel) => Some(Status::Cancelled),
        _ => None, // everything else is illegal
    }
}

fn main() {
    assert_eq!(transition(Status::Pending, Event::Pay), Some(Status::Paid));
    assert_eq!(transition(Status::Paid, Event::Ship), Some(Status::Shipped));
    assert_eq!(transition(Status::Paid, Event::Cancel), Some(Status::Cancelled));
    assert_eq!(transition(Status::Pending, Event::Cancel), Some(Status::Cancelled));
    assert_eq!(transition(Status::Shipped, Event::Cancel), None);
    assert_eq!(transition(Status::Pending, Event::Ship), None);
    println!("All transitions OK ✅");
}
`,
          explain: 'The catch-all <code>_ =&gt; None</code> is deliberate here: "everything else is illegal". The trade-off, which is the bonus question: a new <code>Refunded</code> status gets no complaint about the <code>match</code> (at most an unused-variant warning), because the <code>_</code> arm quietly swallows it. Without the <code>_</code>, the compiler would list every missing combination, like the E0004 errors in the video.',
        },
        {
          title: 'Option helpers',
          prompt: 'Three tiny functions take a nickname that may be missing (<code>Option&lt;&amp;str&gt;</code>). Replace each placeholder with one line, using the Ruby-to-Rust table from the video. <b>1)</b> <code>display_name</code>: the nickname, or <code>"Guest"</code> if it is missing. Ruby: <code>nickname || "Guest"</code>, so use <code>unwrap_or</code>. <b>2)</b> <code>has_nickname</code>: true if there is one. Ruby: <code>nickname.present?</code>, so use <code>is_some</code>. <b>3)</b> <code>shout</code>: the uppercased nickname, still wrapped in an Option. Ruby: <code>nickname&amp;.upcase</code>, so use <code>map</code>. No <code>match</code> needed. The starter compiles, but the asserts fail until you are done. When it works it prints <code>OK</code>.',
          starter: `// 1. Ruby: nickname || "Guest"
fn display_name(nickname: Option<&str>) -> String {
    String::new() // TODO: unwrap_or with "Guest", then .to_string()
}

// 2. Ruby: nickname.present?
fn has_nickname(nickname: Option<&str>) -> bool {
    false // TODO: is_some
}

// 3. Ruby: nickname&.upcase
fn shout(nickname: Option<&str>) -> Option<String> {
    None // TODO: map with a closure that calls to_uppercase
}

fn main() {
    assert_eq!(display_name(Some("Ada")), "Ada");
    assert_eq!(display_name(None), "Guest");
    assert_eq!(has_nickname(Some("Ada")), true);
    assert_eq!(has_nickname(None), false);
    assert_eq!(shout(Some("ada")), Some("ADA".to_string()));
    assert_eq!(shout(None), None);
    println!("OK");
}
`,
          hints: ['All three are one-liners. The table in the video has them: <code>name.unwrap_or("Guest")</code>, <code>user.is_some()</code> and <code>user.map(|u| u.name)</code>.', '<code>nickname.unwrap_or("Guest").to_string()</code> and <code>nickname.is_some()</code>', '<code>nickname.map(|n| n.to_uppercase())</code>'],
          solution: `// 1. Ruby: nickname || "Guest"
fn display_name(nickname: Option<&str>) -> String {
    nickname.unwrap_or("Guest").to_string()
}

// 2. Ruby: nickname.present?
fn has_nickname(nickname: Option<&str>) -> bool {
    nickname.is_some()
}

// 3. Ruby: nickname&.upcase
fn shout(nickname: Option<&str>) -> Option<String> {
    nickname.map(|n| n.to_uppercase())
}

fn main() {
    assert_eq!(display_name(Some("Ada")), "Ada");
    assert_eq!(display_name(None), "Guest");
    assert_eq!(has_nickname(Some("Ada")), true);
    assert_eq!(has_nickname(None), false);
    assert_eq!(shout(Some("ada")), Some("ADA".to_string()));
    assert_eq!(shout(None), None);
    println!("OK");
}
`,
          explain: 'Each helper replaces a Ruby idiom: <code>||</code> becomes <code>unwrap_or</code>, <code>present?</code> becomes <code>is_some</code>, and safe navigation <code>&amp;.</code> becomes <code>map</code>. <code>map</code> only runs its closure when there is a value, and <code>None</code> stays <code>None</code>, just like <code>nil&amp;.upcase</code>.',
        },
      ],
    },

    // ------------------------------------------------------------------ 3.3
    {
      id: 'traits-generics',
      title: 'Traits & generics (duck typing, but checked)',
      subtitle: 'Mixins and duck typing, rebuilt so the compiler can prove it quacks.',
      tags: ['trait', 'generics', 'impl trait', 'dyn', 'display', 'from', 'serde', 'mixins', 'duck typing'],
      scenes: [
        {
          type: 'title', kicker: 'Module 3 · Lesson 3', title: 'Traits & generics',
          subtitle: 'Duck typing, but checked before it quacks.',
          beats: [
            { say: 'Ruby runs on duck typing. If it responds to the method, it is good enough. You find out it does not at runtime.' },
            { say: 'Rust keeps that flexibility with traits, and checks every duck at compile time.' },
          ],
        },
        {
          title: 'A module becomes a trait',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'notifiers.rb', code: `class EmailNotifier
  def deliver(msg) = puts "📧 #{msg}"
end

class SmsNotifier
  def deliver(msg) = puts "📱 #{msg}"
end

# anything with #deliver works…
notifier.deliver("Shipped!")` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'notifiers.rs', code: `trait Notifier {
    fn deliver(&self, msg: &str);
}

struct Email;
impl Notifier for Email {
    fn deliver(&self, msg: &str) {
        println!("📧 {msg}");
    }
}` },
          ],
          beats: [
            { say: 'In Ruby, two unrelated classes can both have a deliver method. Code that calls deliver works with either, until someone passes an object without it.', type: { rb: 'all' }, lines: { rb: [9, 10] } },
            { say: 'In Rust you write the contract down. A trait lists the method signatures a type must provide.', type: { rs: 3 }, lines: { rs: [1, 2, 3] } },
            { say: 'Then each type opts in with impl Notifier for Email, and the compiler checks it supplies every required method.', type: { rs: 'all' }, lines: { rs: [6, 7, 8, 9] }, note: 'It is like an interface, but you can add a trait to a type <em>after the fact</em>, like reopening a class.' },
          ],
        },
        {
          title: 'Default methods: the mixin part',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `module Sluggable
  def slug
    title.downcase.tr(" ", "-")
  end
end

class Post
  include Sluggable
  def title = "Hello World"
end` },
            { id: 'rs', kind: 'code', lang: 'rust', size: 16, code: `trait Sluggable {
    fn title(&self) -> String; // required
    fn slug(&self) -> String { // provided
        self.title()
            .to_lowercase()
            .replace(' ', "-")
    }
}

struct Post;
impl Sluggable for Post {
    fn title(&self) -> String {
        "Hello World".into()
    }
}` },
          ],
          beats: [
            { say: 'Ruby modules give you mixins. Sluggable quietly assumes that whoever includes it has a title method.', type: { rb: 'all' }, lines: { rb: [3] } },
            { say: 'A Rust trait can do the same with a default method, and the assumption becomes explicit. Title is a required method.', type: { rs: 2 }, lines: { rs: [2] } },
            { say: 'Slug has a body, so every implementor gets it for free, just like include.', type: { rs: 8 }, lines: { rs: [3, 4, 5, 6, 7] } },
            { say: 'Post only implements title, and it gets slug automatically. Forget title, and it is a compile error, not a NoMethodError.', type: { rs: 'all' }, lines: { rs: [11, 12, 13, 14, 15] } },
          ],
        },
        {
          title: 'Generics: accept anything that implements the trait',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 18, code: `// "T can be any type, as long as it implements Notifier"
fn alert<T: Notifier>(n: &T, order_id: u64) {
    n.deliver(&format!("Order #{order_id} shipped"));
}

// same thing, shorter
fn alert2(n: &impl Notifier, order_id: u64) { /* .. */ }

// several bounds, using where
fn audit<T>(item: &T) where T: Notifier + std::fmt::Debug { /* .. */ }

alert(&Email, 42);   // ✅
alert(&42, 42);      // ❌ the trait \`Notifier\` is not implemented for \`{integer}\`` },
          ],
          beats: [
            { say: 'Now write a function that works with any notifier. That is a generic, with a trait bound.', type: { c: 4 }, lines: { c: [1, 2, 3, 4] } },
            { say: 'T colon Notifier reads as "any type T that implements Notifier". Ruby\'s implicit "responds to deliver" is now explicit.', lines: { c: [2] } },
            { say: 'impl Notifier in argument position is shorthand for the same thing.', type: { c: 7 }, lines: { c: [7] } },
            { say: 'Combine bounds with a plus, and move them into a where clause when they get long.', type: { c: 10 }, lines: { c: [10] } },
            { say: 'Pass in something that does not quack, and the compiler names the missing trait.', type: { c: 'all' }, lines: { c: [13] }, note: 'Generics are compiled to specialized code for each type. There is zero runtime cost.' },
          ],
        },
        {
          title: 'dyn Trait: a mixed bag of ducks',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 16, code: `let channels: Vec<Box<dyn Notifier>> =
    vec![
        Box::new(Email),
        Box::new(Sms { phone: "+1555".into() }),
        Box::new(Slack { channel: "#ops".into() }),
    ];

for ch in &channels {
    ch.deliver("Deploy finished ✅");
}` },
            { id: 'd', kind: 'diagram', w: 560, h: 400, boxes: [
              { id: 'stack', x: 0, y: 0, w: 240, h: 400, label: 'Stack', cls: 'zone' },
              { id: 'heap', x: 300, y: 0, w: 260, h: 400, label: 'Heap', cls: 'zone' },
              { id: 'v', x: 20, y: 150, w: 200, h: 90, label: 'Vec', sub: '3 × Box&lt;dyn Notifier&gt;', cls: 'rust' },
              { id: 'e', x: 340, y: 50, w: 180, h: 64, label: 'Email', cls: 'heap' },
              { id: 's', x: 340, y: 163, w: 180, h: 64, label: 'Sms', sub: 'phone', cls: 'heap' },
              { id: 'k', x: 340, y: 276, w: 180, h: 64, label: 'Slack', sub: 'channel', cls: 'heap' },
            ], arrows: [{ id: 'a1', from: 'v', to: 'e', cls: 'rust' }, { id: 'a2', from: 'v', to: 's', cls: 'rust' }, { id: 'a3', from: 'v', to: 'k', cls: 'rust' }] },
          ],
          beats: [
            { say: 'Generics fix one concrete type at compile time. But sometimes you want a list of different types, like a Ruby array of notifiers.', type: { c: 1 } },
            { say: 'For that, use dyn Notifier: a trait object. Each value is boxed on the heap, because they have different sizes.', type: { c: 6 }, lines: { c: [1, 2, 3, 4, 5, 6] }, show: ['d.v', 'd.e', 'd.s', 'd.k', 'd.a1', 'd.a2', 'd.a3'] },
            { say: 'Calls are dispatched at runtime through a lookup table. This is the closest thing to Ruby\'s dynamic dispatch, and it is still type-checked.', type: { c: 'all' }, lines: { c: [8, 9, 10] } },
            { say: 'Rule of thumb: use generics by default, and reach for dyn when you need a mixed collection or a plugin point.' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'You need a <code>Vec</code> holding both <code>Email</code> and <code>Sms</code> notifiers. Which type works?',
          options: ['<code>Vec&lt;Notifier&gt;</code>', '<code>Vec&lt;impl Notifier&gt;</code>', '<code>Vec&lt;Box&lt;dyn Notifier&gt;&gt;</code>', '<code>Vec&lt;T: Notifier&gt;</code>'],
          answer: 2,
          explain: 'A <code>Vec</code> needs one element type. A boxed trait object, <code>Box&lt;dyn Notifier&gt;</code>, can hold any type that implements the trait. <code>impl Notifier</code> would still mean a single concrete type.',
          beats: [{ say: 'Checkpoint. One vector, different notifier types. What goes inside?' }],
        },
        {
          title: 'Standard traits you\'ll implement',
          blocks: [
            {
              id: 'c', kind: 'cards', items: [
                { icon: '🖨️', title: 'Display', body: '<code>to_s</code>. Lets you use <code>{}</code> in <code>format!</code> and gives you <code>.to_string()</code>.', cls: 'rust' },
                { icon: '🔁', title: 'From / Into', body: 'Conversions, like <code>Money::from(cents)</code>. Implement <code>From</code> and you get <code>.into()</code> free.', cls: 'rust' },
                { icon: '🔍', title: 'Debug', body: '<code>inspect</code>. Usually derived, used with <code>{:?}</code>.' },
                { icon: '⚖️', title: 'PartialEq / Ord', body: '<code>==</code> and <code>&lt;=&gt;</code> (Comparable). Needed for sorting.' },
                { icon: '#️⃣', title: 'Hash + Eq', body: '<code>hash</code>/<code>eql?</code>. Required for HashMap keys.' },
                { icon: '📦', title: 'Serialize', body: '<code>as_json</code> via serde. Derive it, done.' },
              ],
            },
          ],
          beats: [
            { say: 'Much of Ruby\'s object protocol maps onto standard traits.' },
            { say: 'Display is to s. Implement it, and your type works with curly braces in format strings.', show: 'c.0' },
            { say: 'From and Into are conversions. Implement From, and you get into for free in the other direction.', show: 'c.1' },
            { say: 'Debug is inspect. PartialEq and Ord are double equals and the spaceship operator, like Comparable.', show: ['c.2', 'c.3'] },
            { say: 'Hash and Eq let a type be a hash map key. And Serialize from serde is your as json.', show: ['c.4', 'c.5'] },
          ],
        },
        {
          title: 'Display + From in practice',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 15, code: `use std::fmt;

struct Money { cents: i64 }

impl fmt::Display for Money {           // def to_s
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "\${}.{:02}", self.cents / 100, self.cents % 100)
    }
}

impl From<i64> for Money {              // Money(cents)
    fn from(cents: i64) -> Self { Money { cents } }
}

let m: Money = 1999.into();
println!("Total: {m}");                 // Total: $19.99` },
          ],
          beats: [
            { say: 'Let us implement two of these for a Money type.', type: { c: 3 } },
            { say: 'Display has one method, fmt. You write into a formatter, the same way you would build a string in to s.', type: { c: 9 }, lines: { c: [5, 6, 7, 8] } },
            { say: 'From i64 says how to build Money from a plain integer of cents.', type: { c: 13 }, lines: { c: [11, 12, 13] } },
            { say: 'Now we can call into on an integer, and print Money directly with curly braces.', type: { c: 'all' }, lines: { c: [15, 16] } },
          ],
        },
        {
          title: 'serde: as_json, derived',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `class User
  def as_json(*)
    { id:, name:, admin: }
  end
end

user.to_json
JSON.parse(body)` },
            { id: 'rs', kind: 'code', lang: 'rust', size: 18, code: `use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct User {
    id: i64,
    name: String,
    #[serde(rename = "isAdmin")]
    admin: bool,
}

let json = serde_json::to_string(&user)?;
let u: User = serde_json::from_str(body)?;` },
          ],
          beats: [
            { say: 'Finally, the trait you will derive more than any other: serde\'s Serialize and Deserialize.', type: { rb: 'all' } },
            { say: 'Derive them on a struct, and serde generates the JSON code at compile time. No reflection, and very fast.', type: { rs: 9 }, lines: { rs: [3] } },
            { say: 'Attributes customize the output, like renaming a field to camel case.', lines: { rs: [7] } },
            { say: 'Parsing is typed. If the JSON has the wrong shape, you get an error instead of a hash with surprise nils.', type: { rs: 'all' }, lines: { rs: [11, 12] }, note: 'This is the derive-macro superpower: traits implemented for you by code generation.' },
          ],
        },
      ],
      summary: {
        tldr: 'Traits are named, compiler-checked contracts. They replace duck typing and modules: required methods are the duck\'s "quack", and default methods are the mixin. Use generics (<code>&lt;T: Trait&gt;</code> / <code>impl Trait</code>) for zero-cost static dispatch, and <code>Box&lt;dyn Trait&gt;</code> for mixed collections. Standard traits like <code>Display</code>, <code>From</code> and serde\'s <code>Serialize</code> map onto Ruby\'s <code>to_s</code>, conversions and <code>as_json</code>.',
        points: [
          'A <code>trait</code> declares methods a type must provide. <code>impl Trait for Type</code> opts the type in, and the compiler checks it.',
          'Default methods in a trait behave like a Ruby module mixed in with <code>include</code>.',
          'Generics with trait bounds (<code>fn f&lt;T: Notifier&gt;</code>, <code>impl Notifier</code>) are compiled per type, with no runtime cost.',
          '<code>Box&lt;dyn Trait&gt;</code> enables heterogeneous collections with runtime dispatch.',
          'Implement <code>Display</code> for <code>{}</code>/<code>to_string()</code>, and <code>From</code> to get <code>.into()</code>. Derive <code>Serialize</code>/<code>Deserialize</code> for JSON.',
        ],
        rosetta: [
          ['Duck typing (<code>respond_to?</code>)', 'Trait bounds checked at compile time'],
          ['<code>module Foo</code> + <code>include Foo</code>', '<code>trait Foo</code> with default methods + <code>impl Foo for T</code>'],
          ['<code>def to_s</code>', '<code>impl Display</code>'],
          ['<code>def inspect</code>', '<code>#[derive(Debug)]</code>'],
          ['<code>include Comparable</code> + <code>&lt;=&gt;</code>', '<code>PartialOrd</code>/<code>Ord</code>'],
          ['<code>as_json</code> / <code>to_json</code>', '<code>#[derive(Serialize)]</code> + <code>serde_json::to_string</code>'],
          ['Array of mixed objects', '<code>Vec&lt;Box&lt;dyn Trait&gt;&gt;</code>'],
          ['Conversion methods (<code>Money(cents)</code>)', '<code>impl From&lt;i64&gt; for Money</code>'],
        ],
        gotchas: [
          'To call a trait method, the trait must be in scope (<code>use</code> it). This is a common "method not found" puzzle.',
          'You can only implement a trait for a type if your crate owns the trait <b>or</b> the type (the orphan rule).',
          'Not every trait can be a <code>dyn</code> trait. For example, generic methods block it. Start with generics.',
        ],
        code: `trait Notifier {
    fn deliver(&self, msg: &str);
    fn deliver_all(&self, msgs: &[&str]) {      // default method
        for m in msgs { self.deliver(m) }
    }
}

struct Email;
impl Notifier for Email {
    fn deliver(&self, msg: &str) { println!("📧 {msg}") }
}

fn notify(n: &impl Notifier) { n.deliver("hi") }  // static
fn notify_all(ns: &[Box<dyn Notifier>]) {          // dynamic
    for n in ns { n.deliver("hi") }
}`,
        links: [['The Book, ch. 10: Generics & Traits', 'https://doc.rust-lang.org/book/ch10-00-generics.html'], ['The Book, ch. 17: Trait Objects', 'https://doc.rust-lang.org/book/ch17-02-trait-objects.html'], ['serde.rs', 'https://serde.rs/']],
      },
      quiz: [
        { type: 'compiles', code: 'trait Greet { fn hi(&self) -> String; }\n\nstruct Bot;\nimpl Greet for Bot {}\n', answer: false, explain: '<code>hi</code> has no default body, so every implementor must define it. The error is "missing <code>hi</code> in implementation".' },
        { type: 'mcq', q: 'Which Ruby concept is closest to a trait method <b>with a default body</b>?', options: ['A method in a superclass', 'A method in a module that you <code>include</code>', '<code>method_missing</code>', 'A singleton method'], answer: 1, explain: 'Default methods are shared behavior that any implementor gets, like a mixin.' },
        { type: 'fill', q: 'Make <code>print_all</code> accept any slice of items that can be shown with <code>{}</code>.', code: 'fn print_all<T: std::fmt::___>(items: &[T]) {\n    for i in items { println!("{i}"); }\n}', answers: [['Display']], explain: '<code>{}</code> requires <code>Display</code>. <code>{:?}</code> would require <code>Debug</code>.' },
        { type: 'match', q: 'Match the Ruby method with the Rust trait.', pairs: [['to_s', 'Display'], ['inspect', 'Debug'], ['as_json', 'Serialize'], ['<=> (Comparable)', 'Ord'], ['hash / eql?', 'Hash + Eq']] },
        { type: 'mcq', q: 'When should you prefer <code>Box&lt;dyn Trait&gt;</code> over generics?', options: ['Always. It is faster.', 'When you need a collection or field holding different concrete types', 'When the trait has default methods', 'Never. dyn is deprecated.'], answer: 1, explain: 'Generics are monomorphized (static, zero-cost). <code>dyn</code> trades a small runtime cost for heterogeneity.' },
        { type: 'order', q: 'Order the steps to make <code>println!("{}", money)</code> work for your own type, building it from the outside in, as in the video.', items: ['Define struct Money { cents: i64 }', 'impl fmt::Display for Money', 'Inside it, write fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result', 'Inside fmt, call write!(f, ...)', 'Call println!("{}", money)'], explain: 'Define the type, open the <code>impl Display</code> block, write its one required method <code>fmt</code>, fill it with <code>write!</code>, then use it with <code>{}</code>.' },
      ],
      practice: [
        {
          title: 'Notifier fan-out',
          prompt: 'The <code>Notifier</code> trait (one required method, <code>deliver</code>, and one default method, <code>name</code>) and the <code>Email</code> impl are done for you. <code>Email</code> only provides <code>deliver</code> and gets <code>name</code> for free, like a mixin. Your turn: <b>1)</b> write <code>impl Notifier for Sms</code> with a <code>deliver</code> that returns <code>format!("📱 SMS to {}: {msg}", self.phone)</code>. <b>2)</b> In the same impl, override <code>name</code> so it returns <code>"sms"</code>. The starter does not compile yet. The compiler says that <code>Sms</code> does not implement <code>Notifier</code> (E0277), because <code>Sms</code> is in the list of channels but has no impl. When it works it prints <code>[notifier] 📧 email: Order shipped</code>, then <code>[sms] 📱 SMS to +1555: Order shipped</code>, then <code>All channels OK ✅</code>.',
          starter: `trait Notifier {
    fn deliver(&self, msg: &str) -> String;      // required
    fn name(&self) -> String {                    // default: implementors get it for free
        "notifier".into()
    }
}

struct Email;
struct Sms { phone: String }

// done for you: Email only provides deliver, and gets name for free
impl Notifier for Email {
    fn deliver(&self, msg: &str) -> String {
        format!("📧 email: {msg}")
    }
}

// TODO 1: impl Notifier for Sms. deliver returns format!("📱 SMS to {}: {msg}", self.phone)
// TODO 2: in the same impl, override name so it returns "sms"

fn main() {
    let channels: Vec<Box<dyn Notifier>> = vec![
        Box::new(Email),
        Box::new(Sms { phone: "+1555".into() }),
    ];
    for c in &channels {
        println!("[{}] {}", c.name(), c.deliver("Order shipped"));
    }
    assert_eq!(channels[0].name(), "notifier");
    assert_eq!(channels[1].name(), "sms");
    println!("All channels OK ✅");
}
`,
          hints: ['Copy the shape of the <code>Email</code> impl: <code>impl Notifier for Sms { fn deliver(&amp;self, msg: &amp;str) -&gt; String { ... } }</code>', 'A default method can be overridden: write <code>fn name(&amp;self) -&gt; String { "sms".into() }</code> inside the impl.', 'Inside <code>deliver</code>, <code>self.phone</code> is the phone number: <code>format!("📱 SMS to {}: {msg}", self.phone)</code>'],
          solution: `trait Notifier {
    fn deliver(&self, msg: &str) -> String;      // required
    fn name(&self) -> String {                    // default: implementors get it for free
        "notifier".into()
    }
}

struct Email;
struct Sms { phone: String }

// done for you: Email only provides deliver, and gets name for free
impl Notifier for Email {
    fn deliver(&self, msg: &str) -> String {
        format!("📧 email: {msg}")
    }
}

impl Notifier for Sms {
    fn deliver(&self, msg: &str) -> String {
        format!("📱 SMS to {}: {msg}", self.phone)
    }
    fn name(&self) -> String {
        "sms".into()
    }
}

fn main() {
    let channels: Vec<Box<dyn Notifier>> = vec![
        Box::new(Email),
        Box::new(Sms { phone: "+1555".into() }),
    ];
    for c in &channels {
        println!("[{}] {}", c.name(), c.deliver("Order shipped"));
    }
    assert_eq!(channels[0].name(), "notifier");
    assert_eq!(channels[1].name(), "sms");
    println!("All channels OK ✅");
}
`,
          explain: 'Email inherits the default <code>name</code> like a mixin. Sms overrides it. The <code>Vec</code> holds different types behind <code>Box&lt;dyn Notifier&gt;</code>, and each call goes to the right impl at runtime.',
        },
        {
          title: 'as_json with serde',
          prompt: 'Two small edits make <code>Product</code> JSON-ready. <b>1)</b> Add <code>Serialize</code> and <code>Deserialize</code> to the <code>derive</code> line. <b>2)</b> Rename the <code>price_cents</code> field to <code>"priceCents"</code> in the JSON, using the <code>#[serde(rename = "...")]</code> attribute from the video. The rest is done for you: it turns the product into JSON and back, and checks that they match. (The Playground includes serde and serde_json.) The starter does not compile yet: <code>to_string</code> complains that <code>Product</code> does not implement <code>Serialize</code> (E0277) until you add the derives. When it works it prints <code>{"id":1,"title":"Rust mug","priceCents":1500}</code>.',
          starter: `use serde::{Deserialize, Serialize};

// TODO 1: add Serialize and Deserialize to this derive line
#[derive(Debug, PartialEq)]
struct Product {
    id: i64,
    title: String,
    // TODO 2: rename this field to "priceCents" in the JSON
    price_cents: i64,
}

fn main() {
    let p = Product { id: 1, title: "Rust mug".into(), price_cents: 1500 };
    let json = serde_json::to_string(&p).expect("to json");
    println!("{json}");
    assert!(json.contains("priceCents"));
    let back: Product = serde_json::from_str(&json).expect("from json");
    assert_eq!(p, back);
}
`,
          hints: ['It is the same derive line as in the video: <code>#[derive(Debug, PartialEq, Serialize, Deserialize)]</code>', 'The attribute goes on the line right above the field: <code>#[serde(rename = "priceCents")]</code>'],
          solution: `use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct Product {
    id: i64,
    title: String,
    #[serde(rename = "priceCents")]
    price_cents: i64,
}

fn main() {
    let p = Product { id: 1, title: "Rust mug".into(), price_cents: 1500 };
    let json = serde_json::to_string(&p).expect("to json");
    println!("{json}");
    assert!(json.contains("priceCents"));
    let back: Product = serde_json::from_str(&json).expect("from json");
    assert_eq!(p, back);
}
`,
          explain: 'For every field at once, use <code>#[serde(rename_all = "camelCase")]</code> on the struct. That is the Rust version of a Jbuilder key_format setting.',
        },
      ],
    },
  ],
});
