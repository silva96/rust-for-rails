COURSE_ES.modules.push({
  order: 3,
  id: 'm3',
  title: 'Modelando datos',
  blurb: '¿Dónde quedaron mis clases? Structs y bloques impl, enums que llevan datos, pattern matching exhaustivo y traits: duck typing que el compilador puede verificar.',
  lessons: [
    // ------------------------------------------------------------------ 3.1
    {
      id: 'structs-impl',
      title: 'Structs e impl (¿dónde están mis clases?)',
      subtitle: 'Datos y comportamiento, declarados por separado y combinados a propósito.',
      tags: ['struct', 'impl', 'métodos', 'derive', 'pub', 'mod', 'clases'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 3 · Lección 1', title: 'Structs e impl',
          subtitle: '¿Dónde están mis clases? Spoiler: divididas en dos, a propósito.',
          beats: [
            { say: 'En Ruby, todo es un objeto y todo tiene una clase. Rust no tiene clases en absoluto.' },
            { say: 'En cambio, divide una clase en dos piezas: un struct para los datos y un bloque impl para el comportamiento.' },
          ],
        },
        {
          title: 'Un PORO se convierte en struct',
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
            { say: 'Este es un objeto Ruby simple. Las variables de instancia aparecen la primera vez que initialize las asigna.', type: { rb: 'all' } },
            { say: 'En Rust, los campos se declaran de antemano, cada uno con su tipo. Esto es un struct. Son datos puros, todavía sin métodos.', type: { rs: 5 }, lines: { rs: [1, 2, 3, 4, 5] } },
            { say: 'Lo construyes con un struct literal. Hay que darle un valor a cada campo. Rust no tiene valores nil implícitos por defecto.', type: { rs: 'all' }, lines: { rs: [7, 8, 9, 10, 11] }, note: 'Olvidar un campo es un error de compilación, no un <code>nil</code> que descubres después.' },
            { say: 'Fíjate que no hay attribute readers. La visibilidad se decide campo por campo, y lo veremos en un minuto.', lines: { rb: [2, 3] } },
          ],
        },
        {
          title: 'impl: donde viven los métodos',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 18, code: `impl User {
    // función asociada: sin self, se llama User::new(..)
    fn new(name: &str, email: &str) -> Self {
        Self { name: name.to_string(), email: email.to_string(), admin: false }
    }

    fn display_name(&self) -> String {        // préstamo de solo lectura
        format!("{} <{}>", self.name, self.email)
    }

    fn promote(&mut self) { self.admin = true }   // préstamo mutable

    fn into_email(self) -> String { self.email }  // toma ownership
}` },
          ],
          beats: [
            { say: 'El comportamiento va en un bloque impl para el tipo. Puedes tener varios bloques impl, incluso en archivos distintos.', type: { c: 1 } },
            { say: 'Una función sin self es una función asociada, como un método de clase en Ruby. Por convención, new es el constructor. Rust no tiene un initialize especial.', type: { c: 5 }, lines: { c: [2, 3, 4, 5] }, note: '<code>Self</code> es un alias del tipo que se implementa, aquí <code>User</code>.' },
            { say: 'Los métodos reciben self como primer parámetro, y la forma en que lo reciben importa. Ampersand self toma prestado el valor en modo solo lectura.', type: { c: 9 }, lines: { c: [7, 8, 9] } },
            { say: 'Ampersand mut self lo toma prestado de forma mutable, así que el método puede cambiar campos. Quien lo llama debe tener una variable mutable.', type: { c: 11 }, lines: { c: [11] } },
            { say: 'Y self a secas toma ownership. El valor se consume, y quien lo llamó ya no puede usarlo después.', type: { c: 'all' }, lines: { c: [13] } },
          ],
        },
        {
          title: 'Los tres sabores de self',
          blocks: [
            {
              id: 't', kind: 'table', head: ['Firma', 'Significa', 'Analogía en Ruby'], rows: [
                ['<code>fn f(&amp;self)</code>', 'Acceso de solo lectura', 'Un método lector o de consulta'],
                ['<code>fn f(&amp;mut self)</code>', 'Puede modificar campos', 'Un método bang que modifica en el lugar, como <code>upcase!</code> o <code>map!</code>'],
                ['<code>fn f(self)</code>', 'Consume el valor', '<i>(ninguna)</i>. Como <code>to_s</code>, si el original desapareciera después'],
                ['<code>fn f() -&gt; Self</code>', 'Sin instancia', '<code>def self.build</code>'],
              ], cls: 'sm',
            },
            { id: 'c', kind: 'code', lang: 'rust', size: 18, code: `let mut u = User::new("Ada", "ada@example.com");
u.promote();                 // necesita \`let mut\`
println!("{}", u.display_name());` },
          ],
          beats: [
            { say: 'Pongámoslos lado a lado. Ampersand self es un lector: mira pero nunca toca.', show: 't.0' },
            { say: 'Ampersand mut self es para métodos que cambian el estado. En Ruby quizás los marcarías con un bang.', show: 't.1' },
            { say: 'Self a secas consume el valor. Ruby no tiene un equivalente real, porque el garbage collector mantiene todo vivo.', show: 't.2' },
            { say: 'Y una función sin self es un método de clase, que se llama con dos puntos dobles.', show: 't.3' },
            { say: 'Llamar métodos se ve igual que en Ruby, con un punto. Rust hace el préstamo automáticamente al llamarlos.', type: { c: 'all' }, lines: { c: [2] } },
          ],
        },
        {
          title: 'derive: comportamiento gratis, opcional',
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
              { icon: '🔍', text: '<code>Debug</code> → <code>inspect</code>: imprime con <code>{:?}</code>' },
              { icon: '📄', text: '<code>Clone</code> → <code>dup</code>: <code>.clone()</code> explícito' },
              { icon: '⚖️', text: '<code>PartialEq</code> → <code>==</code> comparando todos los campos' },
              { icon: '0️⃣', text: '<code>Default</code> → valores cero: <code>""</code>, <code>0</code>, <code>false</code>' },
            ] },
          ],
          beats: [
            { say: 'Todo objeto de Ruby trae inspect, dup y doble igual gratis. Un struct de Rust empieza sin ninguno de ellos.', type: { rs: 6 } },
            { say: 'Los activas con el atributo derive. El compilador escribe la implementación por ti.', lines: { rs: [1] } },
            { say: 'Debug es inspect. Te permite imprimir el struct con dos puntos y signo de interrogación.', show: 'b.0', type: { rs: 'all' }, lines: { rs: [11] } },
            { say: 'Clone es dup. Las copias siempre son explícitas con punto clone, así que ves dónde ocurren.', show: 'b.1', lines: { rs: [9] } },
            { say: 'PartialEq te da doble igual comparando cada campo. Default construye una instancia con valores cero.', show: ['b.2', 'b.3'], lines: { rs: [8, 10] } },
          ],
        },
        {
          title: 'Sin herencia. Composición en su lugar.',
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
                { id: 'i1', from: 'user', to: 'ar', label: 'es un', bend: -70 },
                { id: 'i2', from: 'admin', to: 'user', label: 'es un', bend: -70 },
                { id: 'h1', from: 'ru', to: 'acc', label: 'tiene un', cls: 'rust', bend: 50 },
                { id: 'h2', from: 'ru', to: 'prof', label: 'tiene un', cls: 'rust', bend: -50 },
              ],
            },
          ],
          beats: [
            { say: 'Rails se apoya en la herencia. Tu modelo es un ApplicationRecord, y quizás Admin hereda de User.', show: ['d.ar', 'd.user', 'd.i1'] },
            { say: 'Single table inheritance agrega otra capa más.', show: ['d.admin', 'd.i2'] },
            { say: 'Los structs de Rust no pueden heredar de nada. En cambio, compones: un struct contiene otros structs como campos.', show: ['d.acc', 'd.prof', 'd.ru', 'd.h1', 'd.h2'] },
            { say: 'El comportamiento compartido viene de los traits, que veremos en la lección tres. Piensa en "tiene un" y "puede hacer", nunca en "es un".', hl: ['d.ru'], note: 'La regla de Rails "prefiere composición sobre herencia" es la única opción en Rust.' },
          ],
        },
        {
          type: 'checkpoint',
          q: '¿Qué firma de método permite que <code>deactivate</code> cambie el campo <code>active</code> de un usuario que quien llama sigue usando?',
          options: ['<code>fn deactivate(&amp;self)</code>', '<code>fn deactivate(&amp;mut self)</code>', '<code>fn deactivate(self)</code>', '<code>fn deactivate()</code>'],
          answer: 1,
          explain: '<code>&amp;mut self</code> toma prestado el valor de forma mutable y lo devuelve al terminar. <code>self</code> también permitiría mutarlo, pero consume al usuario.',
          beats: [{ say: 'Checkpoint. ¿Qué sabor de self te deja mutar mientras quien llama conserva el valor?' }],
        },
        {
          title: 'Visibilidad y módulos (sin Zeitwerk)',
          layout: 'split',
          blocks: [
            { id: 'rs', kind: 'code', lang: 'rust', size: 16, label: 'src/models/user.rs', code: `pub struct User {
    pub name: String,
    password_digest: String, // privado
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
    // u.password_digest  ❌ privado
}` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Todo es <em>privado por defecto</em>, incluso los campos de un struct. Los archivos no se cargan solos: declaras módulos con <code>mod</code> e importas con <code>use</code>.' },
          ],
          beats: [
            { say: 'En Ruby todo es público a menos que escribas private. Rust lo invierte. Todo es privado a menos que lo marques con pub.', type: { rs: 4 } },
            { say: 'Eso incluye los campos. Un campo privado solo lo puede tocar el código del mismo módulo. Fuera de él, no puedes leer el campo, ni siquiera construir el struct con un literal. Pasas por un constructor pub como new, así tus invariantes quedan protegidas.', lines: { rs: [3] } },
            { say: 'Con los métodos pasa lo mismo. Una pub fn es tu API pública, y el resto son helpers privados.', type: { rs: 'all' }, lines: { rs: [7, 8] } },
            { say: 'No hay autoloading de Zeitwerk. Declaras el árbol de módulos con mod, y traes nombres al scope con use, un poco como require.', type: { m: 'all' }, lines: { m: [1, 2] } },
            { say: 'Privado por defecto, y explícito sobre dónde vive el código. Los refactors se vuelven mucho más seguros.', show: 'n' },
          ],
        },
      ],
      summary: {
        tldr: 'Una clase de Ruby se convierte en un <code>struct</code> para los datos más un bloque <code>impl</code> para el comportamiento. Los constructores son funciones asociadas comunes, por convención <code>new</code>. Los métodos toman prestado (<code>&amp;self</code>, <code>&amp;mut self</code>) o consumen (<code>self</code>). El comportamiento común se activa con <code>#[derive]</code>. No hay herencia, y todo es privado por defecto.',
        points: [
          '<code>struct</code> declara campos con tipo de antemano, y hay que asignar cada campo al construir uno.',
          '<code>impl Type { ... }</code> contiene los métodos. Las funciones sin <code>self</code> son funciones asociadas, como métodos de clase: <code>User::new(..)</code>.',
          '<code>&amp;self</code> lee, <code>&amp;mut self</code> modifica, y <code>self</code> consume el valor.',
          '<code>#[derive(Debug, Clone, PartialEq, Default)]</code> te da <code>inspect</code>, <code>dup</code>, <code>==</code> y valores por defecto.',
          'Sin herencia: compón structs y comparte comportamiento con traits.',
          'Los items y campos son privados a menos que se marquen <code>pub</code>. Los módulos se declaran con <code>mod</code> y se importan con <code>use</code>.',
        ],
        rosetta: [
          ['<code>class User</code>', '<code>struct User { .. }</code> + <code>impl User { .. }</code>'],
          ['<code>def initialize</code>', '<code>fn new(..) -&gt; Self</code> (convención)'],
          ['<code>def self.find</code>', '<code>fn find(..)</code> sin <code>self</code>, se llama <code>User::find(..)</code>'],
          ['<code>attr_reader :name</code>', '<code>pub name: String</code> o una <code>pub fn name(&amp;self)</code>'],
          ['<code>obj.inspect</code>', '<code>#[derive(Debug)]</code> + <code>{:?}</code>'],
          ['<code>obj.dup</code>', '<code>#[derive(Clone)]</code> + <code>.clone()</code>'],
          ['<code>class Admin &lt; User</code>', 'Composición + traits'],
          ['Autoloading de Zeitwerk', '<code>mod</code> + <code>use</code>'],
        ],
        gotchas: [
          'Olvidar <code>let mut</code> antes de llamar a un método <code>&amp;mut self</code> te da "cannot borrow as mutable".',
          'Un struct con aunque sea un campo privado no se puede construir con un literal fuera de su módulo. Ofrece un <code>new</code>.',
          '<code>{}</code> necesita el trait <code>Display</code>. <code>{:?}</code> necesita <code>Debug</code>. Deriva <code>Debug</code> casi en todas partes.',
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
        links: [['The Book, cap. 5: Structs', 'https://doc.rust-lang.org/book/ch05-00-structs.html'], ['The Book, cap. 7: Módulos', 'https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html'], ['Rust by Example: derive', 'https://doc.rust-lang.org/rust-by-example/trait/derive.html']],
      },
      quiz: [
        { type: 'match', q: 'Relaciona el modismo de Ruby con su contraparte en Rust.', pairs: [['def initialize', 'fn new() -> Self'], ['def self.find', 'fn asociada (sin self)'], ['inspect', '#[derive(Debug)]'], ['dup', '.clone()'], ['class Admin < User', 'composición + traits']] },
        { type: 'compiles', code: 'struct Counter { n: u32 }\n\nimpl Counter {\n    fn bump(&mut self) { self.n += 1; }\n}\n\nfn main() {\n    let c = Counter { n: 0 };\n    c.bump();\n}', answer: false, explain: '<code>bump</code> necesita <code>&amp;mut self</code>, pero <code>c</code> no está declarado como <code>mut</code>. Escribe <code>let mut c</code>.' },
        { type: 'fill', q: 'Completa el constructor.', code: 'impl User {\n    fn new(name: &str) -> ___ {\n        Self { name: name.to_string() }\n    }\n}\n\nlet u = User___new("Ada");', answers: [['Self', 'User'], ['::']], explain: 'Las funciones asociadas devuelven <code>Self</code> y se llaman con <code>::</code>.' },
        { type: 'mcq', q: '¿Qué le pasa a <code>order</code> después de llamar a <code>order.into_receipt()</code>, donde <code>fn into_receipt(self) -&gt; Receipt</code>?', options: ['Nada, se puede seguir usando', 'Queda en nil', 'Fue movido, y usarlo otra vez es un error de compilación', 'Se clona automáticamente'], answer: 2, explain: 'Un método que recibe <code>self</code> consume el valor. El prefijo <code>into_</code> es la convención de nombres para eso.' },
        { type: 'mcq', q: 'Sin ningún <code>derive</code>, ¿cuál de estos funciona sobre un struct?', options: ['<code>println!("{:?}", s)</code>', '<code>s == other</code>', '<code>s.clone()</code>', 'Leer un campo en el mismo módulo: <code>s.name</code>'], answer: 3, explain: 'Debug, PartialEq y Clone hay que derivarlos o implementarlos. Acceder a un campo siempre funciona dentro del módulo.' },
        { type: 'compiles', q: 'En <code>main.rs</code>, con <code>User</code> definido en <code>mod models</code> como <code>pub struct User { name: String }</code>:', code: 'let u = models::User { name: "Ada".to_string() };', answer: false, explain: 'El struct es <code>pub</code> pero el campo <code>name</code> es privado, así que fuera del módulo no puedes construirlo con un literal ni leer el campo.' },
      ],
      practice: [
        {
          title: 'Los tres tipos de self: BankAccount',
          prompt: 'Un struct <code>BankAccount</code> y dos métodos ya están hechos: <code>new</code> (una función asociada) y <code>balance(&amp;self)</code> (solo lectura). Otros dos métodos son borradores con el tipo de <code>self</code> <b>equivocado</b>. Arréglalos. <b>1)</b> <code>deposit</code> debe cambiar la cuenta: hazlo <code>&amp;mut self</code> y suma <code>cents</code> al saldo. <b>2)</b> <code>close</code> debe consumir la cuenta y devolver lo que quedaba en ella: hazlo <code>self</code> a secas. El código inicial compila, pero los asserts fallan hasta que termines. Cuando funcione, imprime la cuenta y luego <code>Pagado: 1750 centavos ✅</code>.',
          starter: `#[derive(Debug)]
struct BankAccount {
    owner: String,
    balance_cents: u64,
}

impl BankAccount {
    // ya hecho: un constructor (una función asociada: sin self)
    fn new(owner: &str) -> Self {
        Self { owner: owner.to_string(), balance_cents: 0 }
    }

    // ya hecho: un método de solo lectura
    fn balance(&self) -> u64 {
        self.balance_cents
    }

    // TODO 1: deposit debe CAMBIAR la cuenta. ¿Qué tipo de self es ese? Suma cents al saldo.
    fn deposit(&self, cents: u64) {
    }

    // TODO 2: close debe CONSUMIR la cuenta y devolver lo que quedaba en ella.
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
    println!("Pagado: {payout} centavos ✅");
    // BONUS: descomenta la línea siguiente. ¿Qué error obtienes y por qué?
    // println!("{}", acct.balance());
}
`,
          hints: ['Abre la escena "Los tres sabores de self" del video: cambiar campos necesita <code>&amp;mut self</code>, y consumir el valor es <code>self</code> a secas.', 'deposit: <code>fn deposit(&amp;mut self, cents: u64) { self.balance_cents += cents; }</code>', 'close: <code>fn close(self) -&gt; u64 { self.balance_cents }</code>'],
          solution: `#[derive(Debug)]
struct BankAccount {
    owner: String,
    balance_cents: u64,
}

impl BankAccount {
    // ya hecho: un constructor (una función asociada: sin self)
    fn new(owner: &str) -> Self {
        Self { owner: owner.to_string(), balance_cents: 0 }
    }

    // ya hecho: un método de solo lectura
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
    println!("Pagado: {payout} centavos ✅");
    // BONUS: descomenta la línea siguiente. ¿Qué error obtienes y por qué?
    // println!("{}", acct.balance());
}
`,
          explain: 'Cada tipo de <code>self</code> dice qué puede hacer un método con la cuenta. Después de <code>close(self)</code> la cuenta se movió dentro del método, así que la línea comentada del final falla con E0382, "borrow of moved value: <code>acct</code>". Pruébalo: una cuenta cerrada no se puede usar por error.',
        },
      ],
    },

    // ------------------------------------------------------------------ 3.2
    {
      id: 'enums-match',
      title: 'Enums y pattern matching',
      subtitle: 'Enums de Rails con esteroides, un case/when que no puede olvidar un caso, y el fin de nil.',
      tags: ['enum', 'match', 'option', 'if let', 'patrones', 'máquina de estados', 'nil'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 3 · Lección 2', title: 'Enums y pattern matching',
          subtitle: 'La característica que los Rubyistas más extrañan cuando vuelven.',
          beats: [
            { say: 'Si recuerdas una sola característica de Rust de este curso, que sea esta. Enums más match.' },
            { say: 'Reemplazan los enums de Rails, las máquinas de estado, case when y nil, todo con una sola idea.' },
          ],
        },
        {
          title: 'Enum de Rails → enum de Rust',
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

order.status   # => "paid" (¡un String!)` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'src/order.rs', code: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Status {
    Pending,
    Paid,
    Shipped,
    Cancelled,
}

let s = Status::Paid;   // un tipo de verdad` },
          ],
          beats: [
            { say: 'Un enum de Rails asocia nombres a enteros en la base de datos. Pides el status y te devuelve un string.', type: { rb: 'all' }, lines: { rb: [10] } },
            { say: 'Un enum de Rust es un tipo que es exactamente una de un conjunto fijo de variantes.', type: { rs: 7 } },
            { say: 'Un error de tipeo como Status dos puntos dobles Payed es un error de compilación, no un nil silencioso ni un ArgumentError en runtime.', type: { rs: 'all' }, lines: { rs: [9] } },
          ],
        },
        {
          title: 'Las variantes pueden llevar datos',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 16, code: `enum Payment {
    Cash,
    Card { last4: String, brand: String },
    PayPal(String),            // el email de la cuenta
    Crypto { coin: String, tx: String },
}

let p = Payment::Card {
    last4: "4242".into(),
    brand: "visa".into(),
};` },
            { id: 'n', kind: 'text', style: 'callout', html: 'En Rails esto sería polimorfismo, STI, o una columna <code>kind</code> más columnas que aceptan null. Aquí cada variante tiene <em>exactamente</em> los campos que necesita.' },
          ],
          beats: [
            { say: 'Aquí es donde los enums de Rust dejan atrás a los de Rails. Cada variante puede llevar sus propios datos.', type: { c: 2 } },
            { say: 'Un pago con tarjeta tiene los últimos cuatro dígitos y una marca. El efectivo no tiene nada.', type: { c: 3 }, lines: { c: [3] } },
            { say: 'Las variantes pueden tener campos sin nombre, como una tupla, o campos con nombre, como un struct.', type: { c: 6 }, lines: { c: [4, 5] } },
            { say: 'En Rails quizás usarías single table inheritance, con la mitad de las columnas en null para cada tipo. Aquí es imposible construir una combinación inválida.', type: { c: 'all' }, show: 'n' },
          ],
        },
        {
          title: 'match: un case/when que no olvida',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `case payment.kind
when "cash"
  "Paga en caja"
when "card"
  "Tarjeta terminada en #{payment.last4}"
end
# ¿paypal? → devuelve nil 🤷` },
            { id: 'rs', kind: 'code', lang: 'rust', size: 17, code: `let msg: String = match &p {
    Payment::Cash => "En caja".into(),
    Payment::Card { last4, .. } =>
        format!("Tarjeta terminada en {last4}"),
    Payment::PayPal(email) =>
        format!("PayPal: {email}"),
    Payment::Crypto { coin, .. } =>
        format!("Billetera {coin}"),
};` },
          ],
          beats: [
            { say: 'El case when de Ruby devuelve nil en silencio cuando nada coincide. Olvidas una rama y no te enteras hasta producción.', type: { rb: 'all' }, lines: { rb: [7] } },
            { say: 'El match de Rust también es una expresión, así que devuelve un valor. Cada rama es un patrón, una flecha gruesa y una expresión.', type: { rs: 2 } },
            { say: 'Los patrones desestructuran. Esta rama saca last four de la tarjeta, y el punto punto ignora los demás campos.', type: { rs: 4 }, lines: { rs: [3, 4] } },
            { say: 'Lo más importante: match debe ser exhaustivo. Si dejas fuera una variante, el código no compila.', type: { rs: 'all' }, lines: { rs: [5, 6, 7, 8] }, note: 'Una rama con guion bajo <code>_ =&gt;</code> es el "else". Úsala con moderación, o esconde variantes nuevas.' },
          ],
        },
        {
          title: 'Agrega una variante y el compilador encuentra cada caso',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', code: `enum Status { Pending, Paid, Shipped, Cancelled, Refunded }
//                                              ^^^^^^^^ ¡nuevo!` },
            { id: 'e', kind: 'text', style: 'err', html: '<b>error[E0004]</b>: non-exhaustive patterns: `Status::Refunded` not covered\n  --> src/emails.rs:12:11\n<b>error[E0004]</b>: non-exhaustive patterns: `Status::Refunded` not covered\n  --> src/reports.rs:40:15\n<b>error[E0004]</b>: non-exhaustive patterns: `Status::Refunded` not covered\n  --> src/api/orders.rs:88:9' },
            { id: 'ok', kind: 'text', style: 'ok', html: 'Una lista de tareas gratis con cada lugar que maneja el status de la orden. Intenta conseguir eso con <code>grep "shipped"</code> en una app Rails.' },
          ],
          beats: [
            { say: 'Por esto los equipos se enamoran de Rust. Producto pide un nuevo estado para las órdenes: reembolsada.', type: { c: 'all' } },
            { say: 'Agregas la variante y corres cargo check. Cada match sobre Status que no maneja refunded ahora es un error, con su archivo y línea.', show: 'e' },
            { say: 'Para una máquina de estados, eso vale oro. No puedes publicar un estado nuevo manejado a medias.', show: 'ok' },
          ],
        },
        {
          title: 'Option<T>: nil, pero honesto',
          layout: 'split',
          blocks: [
            { id: 'def', kind: 'code', lang: 'rust', label: 'std (simplificado)', code: `enum Option<T> {
    Some(T),
    None,
}` },
            { id: 'rs', kind: 'code', lang: 'rust', size: 17, code: `let user: Option<User> = find_by_email(&email);

match user {
    Some(u) => println!("Hola {}", u.name),
    None => println!("No existe ese usuario"),
}

if let Some(u) = find_by_email(&email) {
    println!("Hola {}", u.name);
}` },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'left', items: ['Es solo un enum común de la biblioteca estándar', '<code>Option&lt;User&gt;</code> y <code>User</code> son tipos distintos', '<code>if let</code> maneja un patrón e ignora el resto'] },
          ],
          beats: [
            { say: '¿Recuerdas Option de la lección uno? No es magia. Es un enum simple con dos variantes: Some con un valor, o None.', type: { def: 'all' }, show: 'b.0' },
            { say: 'Como Option de User es un tipo distinto de User, no puedes llamar por accidente un método de usuario sobre un valor que podría faltar.', show: 'b.1' },
            { say: 'Lo abres con match, manejando ambos casos de forma explícita.', type: { rs: 6 }, lines: { rs: [3, 4, 5, 6] } },
            { say: 'Cuando solo te importa un caso, if let es la forma corta. Se lee como el if user igual find by de Ruby.', type: { rs: 'all' }, show: 'b.2', lines: { rs: [8, 9, 10] } },
          ],
        },
        {
          title: 'Helpers de Option: tu kit de navegación segura',
          blocks: [
            {
              id: 't', kind: 'table', cls: 'sm', head: ['Ruby', 'Rust', 'Significado'], rows: [
                ['<code>user&amp;.name</code>', '<code>user.map(|u| u.name)</code>', 'Transforma si existe'],
                ['<code>name || "Guest"</code>', '<code>name.unwrap_or("Guest")</code>', 'Valor de respaldo'],
                ['<code>user.present?</code>', '<code>user.is_some()</code>', 'Chequeo de presencia'],
                ['<code>find_by!(..)</code>', '<code>.expect("user must exist")</code>', 'Falla si no existe'],
                ['<code>return unless user</code>', '<code>let Some(u) = user else { return };</code>', 'Salida temprana'],
                ['<code>user&amp;.account&amp;.plan</code>', '<code>user?.account?.plan</code> (en fns que devuelven <code>Option</code>)', 'Encadenar búsquedas'],
              ],
            },
          ],
          beats: [
            { say: 'Rara vez escribirás un match completo sobre un Option. Hay un método para casi cada modismo de Ruby que conoces.' },
            { say: 'El operador de navegación segura se convierte en map. Los valores de respaldo con doble barra se convierten en unwrap or.', show: ['t.0', 't.1'] },
            { say: 'present con signo de interrogación se convierte en is some. find by con bang, que lanza una excepción, se convierte en expect, que hace panic con tu mensaje.', show: ['t.2', 't.3'] },
            { say: 'La guard clause, return unless user, se convierte en let else. Asigna el valor o sale de la función.', show: 't.4', hl: ['t.4'] },
            { say: 'Y dentro de una función que devuelve un Option, el operador signo de interrogación encadena búsquedas como una cadena de navegación segura.', show: 't.5' },
          ],
        },
        {
          type: 'checkpoint',
          q: '¿Qué imprime esto?',
          code: `let n: Option<i32> = None;
let v = n.map(|x| x * 2).unwrap_or(0);
println!("{v}");`,
          options: ['<code>0</code>', '<code>None</code>', 'Hace panic', 'No compila'],
          answer: 0,
          explain: '<code>map</code> sobre <code>None</code> sigue siendo <code>None</code>, así que <code>unwrap_or(0)</code> entrega el valor de respaldo, <code>0</code>.',
          beats: [{ say: 'Checkpoint. Sigue el None a través de la cadena.' }],
        },
        {
          title: 'Patrones en todas partes: guards, rangos, matches!',
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
            { say: 'Los patrones son mucho más ricos que case when. Puedes hacer match sobre una tupla de valores a la vez.', type: { c: 3 }, lines: { c: [2, 3] } },
            { say: 'Los rangos coinciden con números, y los literales de string coinciden con strings.', type: { c: 4 }, lines: { c: [4] } },
            { say: 'Un if después de un patrón es un guard, una condición extra para esa rama. Una barra vertical significa o.', type: { c: 6 }, lines: { c: [5, 6] } },
            { say: 'El guion bajo atrapa todo lo demás. Las ramas se revisan de arriba hacia abajo, como las cláusulas when.', type: { c: 9 }, lines: { c: [7] } },
            { say: 'Y cuando solo necesitas un sí o un no, la macro matches devuelve un booleano. Es perfecta para predicados como can cancel.', type: { c: 'all' }, lines: { c: [11] } },
          ],
        },
      ],
      summary: {
        tldr: 'Los enums de Rust son conjuntos cerrados de variantes, y cada variante puede llevar sus propios datos. <code>match</code> los desestructura y debe cubrir cada variante, así que agregar un estado marca cada lugar que hay que actualizar. <code>Option&lt;T&gt;</code> es solo un enum (<code>Some</code>/<code>None</code>) que reemplaza a <code>nil</code>, con helpers como <code>map</code>, <code>unwrap_or</code>, <code>if let</code> y <code>let else</code>.',
        points: [
          'Un valor <code>enum</code> es exactamente una de sus variantes, y las variantes pueden llevar datos tipo tupla o tipo struct.',
          '<code>match</code> es una expresión, desestructura patrones y se verifica que sea <b>exhaustivo</b>.',
          'Agregar una variante convierte cada <code>match</code> sin manejarla en un error de compilación, ideal para máquinas de estado.',
          '<code>Option&lt;T&gt;</code> = <code>Some(T)</code> | <code>None</code>. Usa <code>if let</code>, <code>let ... else</code>, <code>map</code>, <code>unwrap_or</code> y <code>?</code>.',
          'Los patrones admiten tuplas, rangos, <code>|</code>, guards (<code>if</code>), <code>..</code> y <code>_</code>. <code>matches!</code> devuelve un bool.',
        ],
        rosetta: [
          ['<code>enum :status, {...}</code>', '<code>enum Status { .. }</code>'],
          ['STI / columna polimórfica <code>kind</code>', 'Variantes de enum que llevan datos'],
          ['<code>case ... when</code>', '<code>match</code> (exhaustivo)'],
          ['<code>else</code> en <code>case</code>', '<code>_ =&gt;</code>'],
          ['<code>nil</code>', '<code>None</code>'],
          ['<code>user&amp;.name</code>', '<code>user.map(|u| u.name)</code>'],
          ['<code>x || default</code>', '<code>x.unwrap_or(default)</code>'],
          ['<code>return unless x</code>', '<code>let Some(x) = x else { return };</code>'],
        ],
        gotchas: [
          'Una rama comodín <code>_ =&gt;</code> desactiva la red de seguridad de "variante nueva" para ese match. Prefiere listar las variantes.',
          '<code>.unwrap()</code> sobre <code>None</code> hace panic, igual que <code>find_by!</code> lanzando una excepción. Está bien en tests, es sospechoso en handlers.',
          'Hacer match sobre <code>&amp;value</code> toma prestados los campos. Hacer match sobre <code>value</code> los mueve hacia afuera.',
        ],
        code: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Status { Pending, Paid, Shipped, Cancelled }

impl Status {
    fn label(self) -> &'static str {
        match self {
            Status::Pending => "Esperando el pago",
            Status::Paid => "En preparación",
            Status::Shipped => "En camino",
            Status::Cancelled => "Cancelada",
        }
    }
}`,
        links: [['The Book, cap. 6: Enums y pattern matching', 'https://doc.rust-lang.org/book/ch06-00-enums.html'], ['The Book, cap. 19: Patrones', 'https://doc.rust-lang.org/book/ch19-00-patterns.html'], ['Documentación de Option', 'https://doc.rust-lang.org/std/option/enum.Option.html']],
      },
      quiz: [
        { type: 'compiles', code: 'enum Light { Red, Yellow, Green }\n\nfn next(l: Light) -> Light {\n    match l {\n        Light::Red => Light::Green,\n        Light::Green => Light::Yellow,\n    }\n}', answer: false, explain: '<code>Light::Yellow</code> no está cubierto. <code>match</code> debe ser exhaustivo (error E0004).' },
        { type: 'mcq', q: 'En Ruby escribiste <code>user&amp;.email || "unknown"</code>. Con <code>user: Option&lt;User&gt;</code>, ¿qué versión en Rust es equivalente?', options: ['<code>user.email.unwrap_or("unknown")</code>', '<code>user.map(|u| u.email).unwrap_or("unknown".to_string())</code>', '<code>user?.email || "unknown"</code>', '<code>user.unwrap().email</code>'], answer: 1, explain: '<code>map</code> transforma el valor interno si existe, y <code>unwrap_or</code> entrega el respaldo. Los tipos deben coincidir, así que el respaldo es un <code>String</code>.' },
        { type: 'fill', q: 'Completa la guard clause: asigna el usuario o sal temprano.', code: 'fn greet(user: Option<User>) {\n    let ___(u) = user ___ { return };\n    println!("Hola {}", u.name);\n}', answers: [['Some'], ['else']], explain: '<code>let Some(u) = user else { return };</code> es el <code>return unless user</code> de Rust.' },
        { type: 'match', q: 'Relaciona la construcción de Ruby con la de Rust.', pairs: [['case/when', 'match'], ['nil', 'None'], ['rama else en case', '_ =>'], ['enum :status (Rails)', 'enum Status'], ['subclases STI', 'variantes con datos']] },
        { type: 'mcq', q: '¿Qué devuelve <code>matches!(s, Status::Paid | Status::Shipped)</code>?', options: ['La variante que coincidió', 'Un <code>bool</code>', 'Un <code>Option&lt;Status&gt;</code>', 'Nada. Hace panic si no hay coincidencia'], answer: 1, explain: '<code>matches!</code> se expande a un <code>match</code> que devuelve <code>true</code> o <code>false</code>.' },
        { type: 'compiles', code: 'enum Shape { Circle(f64), Rect { w: f64, h: f64 } }\n\nfn area(s: Shape) -> f64 {\n    match s {\n        Shape::Circle(r) => 3.14 * r * r,\n        Shape::Rect { w, h } => w * h,\n    }\n}', answer: true, explain: 'Ambas variantes están cubiertas, así que el match es exhaustivo, y los patrones sacan los datos de cada variante en <code>r</code>, <code>w</code> y <code>h</code>.' },
      ],
      practice: [
        {
          title: 'Máquina de estados de un pedido',
          prompt: 'Los enums <code>Status</code> y <code>Event</code>, y la primera regla de <code>transition</code>, ya están hechos. Agrega las otras dos reglas al <code>match</code>. <b>1)</b> Paid + Ship da Shipped. <b>2)</b> Pending <em>o</em> Paid + Cancel da Cancelled (usa <code>|</code> dentro del patrón). Todo lo demás es una transición ilegal y devuelve <code>None</code>: para eso sirve el último brazo <code>_</code>. El código inicial compila, pero los asserts fallan hasta que agregues los brazos. Cuando funcione, imprime <code>All transitions OK ✅</code>. Bonus: agrega una variante <code>Refunded</code> a <code>Status</code>. ¿Se queja el compilador? ¿Por qué sí o por qué no?',
          starter: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Status { Pending, Paid, Shipped, Cancelled }

#[derive(Debug, Clone, Copy)]
enum Event { Pay, Ship, Cancel }

fn transition(s: Status, e: Event) -> Option<Status> {
    match (s, e) {
        (Status::Pending, Event::Pay) => Some(Status::Paid), // ya hecho
        // TODO 1: (Status::Paid, Event::Ship) => ...
        // TODO 2: (Status::Pending | Status::Paid, Event::Cancel) => ...
        _ => None, // todo lo demás es ilegal
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
          hints: ['Cada brazo es <code>patrón =&gt; valor</code>. Copia la forma del primer brazo. La escena "Patrones por todos lados" muestra <code>|</code> dentro de un patrón.', 'TODO 1: <code>(Status::Paid, Event::Ship) =&gt; Some(Status::Shipped),</code>', 'TODO 2: <code>(Status::Pending | Status::Paid, Event::Cancel) =&gt; Some(Status::Cancelled),</code>'],
          solution: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Status { Pending, Paid, Shipped, Cancelled }

#[derive(Debug, Clone, Copy)]
enum Event { Pay, Ship, Cancel }

fn transition(s: Status, e: Event) -> Option<Status> {
    match (s, e) {
        (Status::Pending, Event::Pay) => Some(Status::Paid), // ya hecho
        (Status::Paid, Event::Ship) => Some(Status::Shipped),
        (Status::Pending | Status::Paid, Event::Cancel) => Some(Status::Cancelled),
        _ => None, // todo lo demás es ilegal
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
          explain: 'El comodín <code>_ =&gt; None</code> es deliberado aquí: "todo lo demás es ilegal". El costo, que es la pregunta del bonus: un nuevo estado <code>Refunded</code> no recibe ninguna queja del <code>match</code> (a lo sumo una advertencia de variante sin usar), porque el brazo <code>_</code> se lo traga en silencio. Sin el <code>_</code>, el compilador listaría cada combinación faltante, como los errores E0004 del video.',
        },
        {
          title: 'Helpers de Option',
          prompt: 'Tres funciones pequeñas reciben un apodo que puede faltar (<code>Option&lt;&amp;str&gt;</code>). Reemplaza cada marcador con una línea, usando la tabla Ruby-a-Rust del video. <b>1)</b> <code>display_name</code>: el apodo, o <code>"Guest"</code> si falta. En Ruby: <code>nickname || "Guest"</code>, así que usa <code>unwrap_or</code>. <b>2)</b> <code>has_nickname</code>: true si hay uno. En Ruby: <code>nickname.present?</code>, así que usa <code>is_some</code>. <b>3)</b> <code>shout</code>: el apodo en mayúsculas, todavía envuelto en un Option. En Ruby: <code>nickname&amp;.upcase</code>, así que usa <code>map</code>. No necesitas <code>match</code>. El código inicial compila, pero los asserts fallan hasta que termines. Cuando funcione, imprime <code>OK</code>.',
          starter: `// 1. Ruby: nickname || "Guest"
fn display_name(nickname: Option<&str>) -> String {
    String::new() // TODO: unwrap_or con "Guest", y luego .to_string()
}

// 2. Ruby: nickname.present?
fn has_nickname(nickname: Option<&str>) -> bool {
    false // TODO: is_some
}

// 3. Ruby: nickname&.upcase
fn shout(nickname: Option<&str>) -> Option<String> {
    None // TODO: map con un closure que llame a to_uppercase
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
          hints: ['Las tres son de una línea. La tabla del video las tiene: <code>name.unwrap_or("Guest")</code>, <code>user.is_some()</code> y <code>user.map(|u| u.name)</code>.', '<code>nickname.unwrap_or("Guest").to_string()</code> y <code>nickname.is_some()</code>', '<code>nickname.map(|n| n.to_uppercase())</code>'],
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
          explain: 'Cada helper reemplaza un modismo de Ruby: <code>||</code> pasa a ser <code>unwrap_or</code>, <code>present?</code> pasa a ser <code>is_some</code>, y la navegación segura <code>&amp;.</code> pasa a ser <code>map</code>. <code>map</code> solo ejecuta su closure cuando hay valor, y <code>None</code> sigue siendo <code>None</code>, igual que <code>nil&amp;.upcase</code>.',
        },
      ],
    },

    // ------------------------------------------------------------------ 3.3
    {
      id: 'traits-generics',
      title: 'Traits y genéricos (duck typing, pero verificado)',
      subtitle: 'Mixins y duck typing, reconstruidos para que el compilador pueda probar que hace cuac.',
      tags: ['trait', 'genéricos', 'impl trait', 'dyn', 'display', 'from', 'serde', 'mixins', 'duck typing'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 3 · Lección 3', title: 'Traits y genéricos',
          subtitle: 'Duck typing, pero verificado antes de que haga cuac.',
          beats: [
            { say: 'Ruby funciona con duck typing. Si responde al método, es suficiente. Si no responde, te enteras en runtime.' },
            { say: 'Rust mantiene esa flexibilidad con traits, y verifica cada pato en tiempo de compilación.' },
          ],
        },
        {
          title: 'Un módulo se convierte en trait',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'notifiers.rb', code: `class EmailNotifier
  def deliver(msg) = puts "📧 #{msg}"
end

class SmsNotifier
  def deliver(msg) = puts "📱 #{msg}"
end

# cualquier cosa con #deliver funciona…
notifier.deliver("¡Enviado!")` },
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
            { say: 'En Ruby, dos clases sin relación pueden tener ambas un método deliver. El código que llama a deliver funciona con cualquiera, hasta que alguien pasa un objeto que no lo tiene.', type: { rb: 'all' }, lines: { rb: [9, 10] } },
            { say: 'En Rust escribes el contrato. Un trait lista las firmas de métodos que un tipo debe proveer.', type: { rs: 3 }, lines: { rs: [1, 2, 3] } },
            { say: 'Luego cada tipo se suma con impl Notifier for Email, y el compilador verifica que provea cada método requerido.', type: { rs: 'all' }, lines: { rs: [6, 7, 8, 9] }, note: 'Es como una interfaz, pero puedes agregarle un trait a un tipo <em>después</em>, como reabrir una clase.' },
          ],
        },
        {
          title: 'Métodos por defecto: la parte del mixin',
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
    fn title(&self) -> String; // requerido
    fn slug(&self) -> String { // provisto
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
            { say: 'Los módulos de Ruby te dan mixins. Sluggable asume en silencio que quien lo incluya tiene un método title.', type: { rb: 'all' }, lines: { rb: [3] } },
            { say: 'Un trait de Rust puede hacer lo mismo con un método por defecto, y la suposición se vuelve explícita. Title es un método requerido.', type: { rs: 2 }, lines: { rs: [2] } },
            { say: 'Slug tiene cuerpo, así que cada implementador lo recibe gratis, igual que con include.', type: { rs: 8 }, lines: { rs: [3, 4, 5, 6, 7] } },
            { say: 'Post solo implementa title, y recibe slug automáticamente. Olvida title y es un error de compilación, no un NoMethodError.', type: { rs: 'all' }, lines: { rs: [11, 12, 13, 14, 15] } },
          ],
        },
        {
          title: 'Genéricos: acepta cualquier cosa que implemente el trait',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 18, code: `// "T puede ser cualquier tipo, siempre que implemente Notifier"
fn alert<T: Notifier>(n: &T, order_id: u64) {
    n.deliver(&format!("Orden #{order_id} enviada"));
}

// lo mismo, más corto
fn alert2(n: &impl Notifier, order_id: u64) { /* .. */ }

// varios bounds, usando where
fn audit<T>(item: &T) where T: Notifier + std::fmt::Debug { /* .. */ }

alert(&Email, 42);   // ✅
alert(&42, 42);      // ❌ the trait \`Notifier\` is not implemented for \`{integer}\`` },
          ],
          beats: [
            { say: 'Ahora escribe una función que funcione con cualquier notificador. Eso es un genérico, con un trait bound.', type: { c: 4 }, lines: { c: [1, 2, 3, 4] } },
            { say: 'T dos puntos Notifier se lee como "cualquier tipo T que implemente Notifier". El "responde a deliver" implícito de Ruby ahora es explícito.', lines: { c: [2] } },
            { say: 'impl Notifier en la posición del argumento es una forma abreviada de lo mismo.', type: { c: 7 }, lines: { c: [7] } },
            { say: 'Combina bounds con un signo más, y muévelos a una cláusula where cuando se alarguen.', type: { c: 10 }, lines: { c: [10] } },
            { say: 'Pasa algo que no hace cuac, y el compilador nombra el trait que falta.', type: { c: 'all' }, lines: { c: [13] }, note: 'Los genéricos se compilan a código especializado para cada tipo. El costo en runtime es cero.' },
          ],
        },
        {
          title: 'dyn Trait: una bolsa mixta de patos',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 16, code: `let channels: Vec<Box<dyn Notifier>> =
    vec![
        Box::new(Email),
        Box::new(Sms { phone: "+1555".into() }),
        Box::new(Slack { channel: "#ops".into() }),
    ];

for ch in &channels {
    ch.deliver("Deploy terminado ✅");
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
            { say: 'Los genéricos fijan un tipo concreto en tiempo de compilación. Pero a veces quieres una lista de tipos distintos, como un array de notificadores en Ruby.', type: { c: 1 } },
            { say: 'Para eso, usa dyn Notifier: un trait object. Cada valor va en una caja en el heap, porque tienen tamaños distintos.', type: { c: 6 }, lines: { c: [1, 2, 3, 4, 5, 6] }, show: ['d.v', 'd.e', 'd.s', 'd.k', 'd.a1', 'd.a2', 'd.a3'] },
            { say: 'Las llamadas se despachan en runtime mediante una tabla de búsqueda. Es lo más parecido al dispatch dinámico de Ruby, y aun así tiene verificación de tipos.', type: { c: 'all' }, lines: { c: [8, 9, 10] } },
            { say: 'Regla práctica: usa genéricos por defecto, y recurre a dyn cuando necesites una colección mixta o un punto de extensión para plugins.' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'Necesitas un <code>Vec</code> que contenga notificadores <code>Email</code> y <code>Sms</code>. ¿Qué tipo funciona?',
          options: ['<code>Vec&lt;Notifier&gt;</code>', '<code>Vec&lt;impl Notifier&gt;</code>', '<code>Vec&lt;Box&lt;dyn Notifier&gt;&gt;</code>', '<code>Vec&lt;T: Notifier&gt;</code>'],
          answer: 2,
          explain: 'Un <code>Vec</code> necesita un único tipo de elemento. Un trait object en caja, <code>Box&lt;dyn Notifier&gt;</code>, puede contener cualquier tipo que implemente el trait. <code>impl Notifier</code> seguiría significando un único tipo concreto.',
          beats: [{ say: 'Checkpoint. Un vector, distintos tipos de notificador. ¿Qué va adentro?' }],
        },
        {
          title: 'Traits estándar que vas a implementar',
          blocks: [
            {
              id: 'c', kind: 'cards', items: [
                { icon: '🖨️', title: 'Display', body: '<code>to_s</code>. Te deja usar <code>{}</code> en <code>format!</code> y te da <code>.to_string()</code>.', cls: 'rust' },
                { icon: '🔁', title: 'From / Into', body: 'Conversiones, como <code>Money::from(cents)</code>. Implementa <code>From</code> y obtienes <code>.into()</code> gratis.', cls: 'rust' },
                { icon: '🔍', title: 'Debug', body: '<code>inspect</code>. Normalmente se deriva, se usa con <code>{:?}</code>.' },
                { icon: '⚖️', title: 'PartialEq / Ord', body: '<code>==</code> y <code>&lt;=&gt;</code> (Comparable). Necesarios para ordenar.' },
                { icon: '#️⃣', title: 'Hash + Eq', body: '<code>hash</code>/<code>eql?</code>. Requeridos para claves de HashMap.' },
                { icon: '📦', title: 'Serialize', body: '<code>as_json</code> vía serde. Lo derivas y listo.' },
              ],
            },
          ],
          beats: [
            { say: 'Gran parte del protocolo de objetos de Ruby se mapea a traits estándar.' },
            { say: 'Display es to s. Impleméntalo, y tu tipo funciona con llaves en los format strings.', show: 'c.0' },
            { say: 'From e Into son conversiones. Implementa From, y obtienes into gratis en la otra dirección.', show: 'c.1' },
            { say: 'Debug es inspect. PartialEq y Ord son el doble igual y el operador nave espacial, como Comparable.', show: ['c.2', 'c.3'] },
            { say: 'Hash y Eq permiten que un tipo sea clave de un hash map. Y Serialize de serde es tu as json.', show: ['c.4', 'c.5'] },
          ],
        },
        {
          title: 'Display + From en la práctica',
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
            { say: 'Implementemos dos de estos para un tipo Money.', type: { c: 3 } },
            { say: 'Display tiene un solo método, fmt. Escribes en un formatter, igual que construirías un string en to s.', type: { c: 9 }, lines: { c: [5, 6, 7, 8] } },
            { say: 'From i64 dice cómo construir un Money a partir de un entero simple de centavos.', type: { c: 13 }, lines: { c: [11, 12, 13] } },
            { say: 'Ahora podemos llamar into sobre un entero, e imprimir Money directamente con llaves.', type: { c: 'all' }, lines: { c: [15, 16] } },
          ],
        },
        {
          title: 'serde: as_json, derivado',
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
            { say: 'Finalmente, el trait que vas a derivar más que cualquier otro: Serialize y Deserialize de serde.', type: { rb: 'all' } },
            { say: 'Derívalos en un struct, y serde genera el código JSON en tiempo de compilación. Sin reflexión, y muy rápido.', type: { rs: 9 }, lines: { rs: [3] } },
            { say: 'Los atributos personalizan la salida, como renombrar un campo a camel case.', lines: { rs: [7] } },
            { say: 'El parseo tiene tipos. Si el JSON tiene la forma equivocada, obtienes un error en vez de un hash con nils sorpresa.', type: { rs: 'all' }, lines: { rs: [11, 12] }, note: 'Este es el superpoder de las macros derive: traits que se implementan solos mediante generación de código.' },
          ],
        },
      ],
      summary: {
        tldr: 'Los traits son contratos con nombre, verificados por el compilador. Reemplazan al duck typing y a los módulos: los métodos requeridos son el "cuac" del pato, y los métodos por defecto son el mixin. Usa genéricos (<code>&lt;T: Trait&gt;</code> / <code>impl Trait</code>) para dispatch estático sin costo, y <code>Box&lt;dyn Trait&gt;</code> para colecciones mixtas. Traits estándar como <code>Display</code>, <code>From</code> y <code>Serialize</code> de serde se mapean al <code>to_s</code>, las conversiones y el <code>as_json</code> de Ruby.',
        points: [
          'Un <code>trait</code> declara métodos que un tipo debe proveer. <code>impl Trait for Type</code> adhiere el tipo al trait, y el compilador lo verifica.',
          'Los métodos por defecto de un trait se comportan como un módulo de Ruby incluido con <code>include</code>.',
          'Los genéricos con trait bounds (<code>fn f&lt;T: Notifier&gt;</code>, <code>impl Notifier</code>) se compilan por tipo, sin costo en runtime.',
          '<code>Box&lt;dyn Trait&gt;</code> permite colecciones heterogéneas con dispatch en runtime.',
          'Implementa <code>Display</code> para <code>{}</code>/<code>to_string()</code>, y <code>From</code> para obtener <code>.into()</code>. Deriva <code>Serialize</code>/<code>Deserialize</code> para JSON.',
        ],
        rosetta: [
          ['Duck typing (<code>respond_to?</code>)', 'Trait bounds verificados en compilación'],
          ['<code>module Foo</code> + <code>include Foo</code>', '<code>trait Foo</code> con métodos por defecto + <code>impl Foo for T</code>'],
          ['<code>def to_s</code>', '<code>impl Display</code>'],
          ['<code>def inspect</code>', '<code>#[derive(Debug)]</code>'],
          ['<code>include Comparable</code> + <code>&lt;=&gt;</code>', '<code>PartialOrd</code>/<code>Ord</code>'],
          ['<code>as_json</code> / <code>to_json</code>', '<code>#[derive(Serialize)]</code> + <code>serde_json::to_string</code>'],
          ['Array de objetos mixtos', '<code>Vec&lt;Box&lt;dyn Trait&gt;&gt;</code>'],
          ['Métodos de conversión (<code>Money(cents)</code>)', '<code>impl From&lt;i64&gt; for Money</code>'],
        ],
        gotchas: [
          'Para llamar a un método de un trait, el trait debe estar en scope (impórtalo con <code>use</code>). Es un acertijo común de "method not found".',
          'Solo puedes implementar un trait para un tipo si tu crate es dueño del trait <b>o</b> del tipo (la orphan rule).',
          'No todo trait puede ser un trait <code>dyn</code>. Por ejemplo, los métodos genéricos lo impiden. Empieza con genéricos.',
        ],
        code: `trait Notifier {
    fn deliver(&self, msg: &str);
    fn deliver_all(&self, msgs: &[&str]) {      // método por defecto
        for m in msgs { self.deliver(m) }
    }
}

struct Email;
impl Notifier for Email {
    fn deliver(&self, msg: &str) { println!("📧 {msg}") }
}

fn notify(n: &impl Notifier) { n.deliver("hola") }  // estático
fn notify_all(ns: &[Box<dyn Notifier>]) {          // dinámico
    for n in ns { n.deliver("hola") }
}`,
        links: [['The Book, cap. 10: Genéricos y traits', 'https://doc.rust-lang.org/book/ch10-00-generics.html'], ['The Book, cap. 17: Trait objects', 'https://doc.rust-lang.org/book/ch17-02-trait-objects.html'], ['serde.rs', 'https://serde.rs/']],
      },
      quiz: [
        { type: 'compiles', code: 'trait Greet { fn hi(&self) -> String; }\n\nstruct Bot;\nimpl Greet for Bot {}\n', answer: false, explain: '<code>hi</code> no tiene un cuerpo por defecto, así que cada implementador debe definirlo. El error es "missing <code>hi</code> in implementation".' },
        { type: 'mcq', q: '¿Qué concepto de Ruby se parece más a un método de trait <b>con cuerpo por defecto</b>?', options: ['Un método en una superclase', 'Un método en un módulo que incluyes con <code>include</code>', '<code>method_missing</code>', 'Un singleton method'], answer: 1, explain: 'Los métodos por defecto son comportamiento compartido que recibe cualquier implementador, como un mixin.' },
        { type: 'fill', q: 'Haz que <code>print_all</code> acepte cualquier slice de items que se puedan mostrar con <code>{}</code>.', code: 'fn print_all<T: std::fmt::___>(items: &[T]) {\n    for i in items { println!("{i}"); }\n}', answers: [['Display']], explain: '<code>{}</code> requiere <code>Display</code>. <code>{:?}</code> requeriría <code>Debug</code>.' },
        { type: 'match', q: 'Relaciona el método de Ruby con el trait de Rust.', pairs: [['to_s', 'Display'], ['inspect', 'Debug'], ['as_json', 'Serialize'], ['<=> (Comparable)', 'Ord'], ['hash / eql?', 'Hash + Eq']] },
        { type: 'mcq', q: '¿Cuándo deberías preferir <code>Box&lt;dyn Trait&gt;</code> por sobre genéricos?', options: ['Siempre. Es más rápido.', 'Cuando necesitas una colección o un campo que contenga distintos tipos concretos', 'Cuando el trait tiene métodos por defecto', 'Nunca. dyn está deprecado.'], answer: 1, explain: 'Los genéricos se monomorfizan (estáticos, sin costo). <code>dyn</code> cambia un pequeño costo en runtime por heterogeneidad.' },
        { type: 'order', q: 'Ordena los pasos para que <code>println!("{}", money)</code> funcione con tu propio tipo, construyéndolo de afuera hacia adentro, como en el video.', items: ['Definir struct Money { cents: i64 }', 'impl fmt::Display for Money', 'Adentro, escribir fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result', 'Dentro de fmt, llamar write!(f, ...)', 'Llamar println!("{}", money)'], explain: 'Define el tipo, abre el bloque <code>impl Display</code>, escribe su único método requerido <code>fmt</code>, llénalo con <code>write!</code>, y luego úsalo con <code>{}</code>.' },
      ],
      practice: [
        {
          title: 'Notifier para varios canales',
          prompt: 'El trait <code>Notifier</code> (un método obligatorio, <code>deliver</code>, y uno por defecto, <code>name</code>) y el impl de <code>Email</code> ya están hechos. <code>Email</code> solo da <code>deliver</code> y recibe <code>name</code> gratis, como un mixin. Te toca: <b>1)</b> escribe <code>impl Notifier for Sms</code> con un <code>deliver</code> que devuelva <code>format!("📱 SMS to {}: {msg}", self.phone)</code>. <b>2)</b> En el mismo impl, sobrescribe <code>name</code> para que devuelva <code>"sms"</code>. El código inicial todavía no compila. El compilador dice que <code>Sms</code> no implementa <code>Notifier</code> (E0277), porque <code>Sms</code> está en la lista de canales pero no tiene impl. Cuando funcione, imprime <code>[notifier] 📧 email: Order shipped</code>, luego <code>[sms] 📱 SMS to +1555: Order shipped</code>, y luego <code>All channels OK ✅</code>.',
          starter: `trait Notifier {
    fn deliver(&self, msg: &str) -> String;      // obligatorio
    fn name(&self) -> String {                    // por defecto: quien implemente lo recibe gratis
        "notifier".into()
    }
}

struct Email;
struct Sms { phone: String }

// ya hecho: Email solo da deliver, y recibe name gratis
impl Notifier for Email {
    fn deliver(&self, msg: &str) -> String {
        format!("📧 email: {msg}")
    }
}

// TODO 1: impl Notifier for Sms. deliver devuelve format!("📱 SMS to {}: {msg}", self.phone)
// TODO 2: en el mismo impl, sobrescribe name para que devuelva "sms"

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
          hints: ['Copia la forma del impl de <code>Email</code>: <code>impl Notifier for Sms { fn deliver(&amp;self, msg: &amp;str) -&gt; String { ... } }</code>', 'Un método por defecto se puede sobrescribir: escribe <code>fn name(&amp;self) -&gt; String { "sms".into() }</code> dentro del impl.', 'Dentro de <code>deliver</code>, <code>self.phone</code> es el teléfono: <code>format!("📱 SMS to {}: {msg}", self.phone)</code>'],
          solution: `trait Notifier {
    fn deliver(&self, msg: &str) -> String;      // obligatorio
    fn name(&self) -> String {                    // por defecto: quien implemente lo recibe gratis
        "notifier".into()
    }
}

struct Email;
struct Sms { phone: String }

// ya hecho: Email solo da deliver, y recibe name gratis
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
          explain: 'Email hereda el <code>name</code> por defecto como un mixin. Sms lo sobrescribe. El <code>Vec</code> guarda tipos distintos detrás de <code>Box&lt;dyn Notifier&gt;</code>, y cada llamada va al impl correcto en tiempo de ejecución.',
        },
        {
          title: 'as_json con serde',
          prompt: 'Dos ediciones pequeñas dejan <code>Product</code> listo para JSON. <b>1)</b> Agrega <code>Serialize</code> y <code>Deserialize</code> a la línea de <code>derive</code>. <b>2)</b> Renombra el campo <code>price_cents</code> a <code>"priceCents"</code> en el JSON, con el atributo <code>#[serde(rename = "...")]</code> del video. Lo demás ya está hecho: convierte el producto a JSON y de vuelta, y comprueba que coinciden. (El Playground incluye serde y serde_json.) El código inicial todavía no compila: <code>to_string</code> se queja de que <code>Product</code> no implementa <code>Serialize</code> (E0277) hasta que agregues los derives. Cuando funcione, imprime <code>{"id":1,"title":"Rust mug","priceCents":1500}</code>.',
          starter: `use serde::{Deserialize, Serialize};

// TODO 1: agrega Serialize y Deserialize a esta línea de derive
#[derive(Debug, PartialEq)]
struct Product {
    id: i64,
    title: String,
    // TODO 2: renombra este campo a "priceCents" en el JSON
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
          hints: ['Es la misma línea de derive del video: <code>#[derive(Debug, PartialEq, Serialize, Deserialize)]</code>', 'El atributo va en la línea justo encima del campo: <code>#[serde(rename = "priceCents")]</code>'],
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
          explain: 'Para todos los campos a la vez, usa <code>#[serde(rename_all = "camelCase")]</code> en el struct. Es la versión en Rust de la opción key_format de Jbuilder.',
        },
      ],
    },
  ],
});
