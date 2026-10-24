// Módulo 2: Ownership y Borrowing (traducción al español). Refleja exactamente content/m2-ownership.js.
COURSE_ES.modules.push({
  order: 2,
  id: 'm2',
  title: 'Ownership y Borrowing',
  blurb: 'El gran tema. Cómo Rust maneja la memoria sin garbage collector: dueños, moves, préstamos, lifetimes y los smart pointers que te devuelven parte de la flexibilidad de Ruby.',
  lessons: [
    // ------------------------------------------------------------------ 2.1
    {
      id: 'ownership',
      title: 'Ownership y moves (adiós, GC)',
      subtitle: 'Cada valor tiene exactamente un dueño. Cuando el dueño se va, el valor se va con él.',
      tags: ['ownership', 'move', 'drop', 'copy', 'clone', 'stack', 'heap', 'gc', 'propiedad'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 2 · Lección 1', title: 'Ownership y moves',
          subtitle: 'Adiós, garbage collector. Hola, manejo de memoria en tiempo de compilación.',
          beats: [
            { say: 'Bienvenido al Módulo 2. Esta es la idea que hace que Rust sea Rust: el ownership, o propiedad.' },
            { say: 'Reemplaza al garbage collector en el que confiaste en Ruby durante toda tu carrera. Tómalo con calma, vale la pena.' },
          ],
        },
        {
          title: '¿Quién limpia la memoria?',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'cards', side: 'left', items: [{ icon: '🗑️', title: 'Ruby: garbage collector', body: 'El runtime rastrea cada objeto. Cada cierto tiempo se pausa, busca objetos que nadie puede alcanzar y los libera. Fácil para ti, pero cuesta CPU, memoria y latencia.', cls: 'ruby' }] },
            { id: 'rs', kind: 'cards', side: 'right', items: [{ icon: '🦀', title: 'Rust: ownership', body: 'Cada valor tiene un dueño. Cuando el dueño sale de su scope, el valor se libera ahí mismo. El compilador lo calcula por adelantado, así que el costo en runtime es cero.', cls: 'rust' }] },
            { id: 'q', kind: 'text', style: 'callout', html: 'Ruby pregunta <em>"¿alguien sigue usando esto?"</em> en runtime. Rust responde esa pregunta al compilar.' },
          ],
          beats: [
            { say: 'Todo programa tiene que responder una pregunta: ¿cuándo es seguro liberar un pedazo de memoria?', show: [] },
            { say: 'Ruby la responde en runtime. El garbage collector revisa periódicamente qué objetos ya nadie referencia y los libera. Nunca piensas en eso, pero lo pagas en pausas y memoria.', show: 'rb' },
            { say: 'Rust la responde al compilar. Cada valor tiene exactamente un dueño, y en el momento en que ese dueño sale de su scope, la memoria se libera.', show: 'rs' },
            { say: 'Sin collector, sin pausas y sin trabajo extra en runtime. La contabilidad vive en el compilador.', show: 'q' },
          ],
        },
        {
          title: 'Las tres reglas del ownership',
          layout: 'center',
          blocks: [
            {
              id: 'b', kind: 'bullets', items: [
                { icon: '1️⃣', text: 'Cada valor en Rust tiene un <b>dueño</b>: la variable que lo contiene.' },
                { icon: '2️⃣', text: 'Solo puede haber <b>un dueño a la vez</b>.' },
                { icon: '3️⃣', text: 'Cuando el dueño sale de su <b>scope</b>, el valor se <b>libera</b> (drop).' },
              ],
            },
            { id: 'n', kind: 'text', style: 'callout', html: 'Apréndelas de memoria. Cada error de este módulo es una de estas reglas haciéndose cumplir.' },
          ],
          beats: [
            { say: 'El ownership se resume en tres reglas.' },
            { say: 'Uno. Cada valor tiene un dueño, la variable que lo contiene.', show: 'b.0' },
            { say: 'Dos. Solo puede haber un dueño a la vez. No dos, ni un grupo compartido. Uno.', show: 'b.1' },
            { say: 'Tres. Cuando el dueño sale de su scope, el valor se libera, es decir, su memoria se devuelve de inmediato.', show: 'b.2' },
            { say: 'Cada error del borrow checker que veas en este módulo se reduce a estas tres reglas.', show: 'n' },
          ],
        },
        {
          title: 'Stack vs heap, en 60 segundos',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', code: `fn main() {
    let age: u32 = 36;
    let name = String::from("Ada");
} // ambos se liberan aquí` },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'left', items: [
              'Stack: valores de tamaño fijo, muy rápido, se libera al terminar la función',
              'Heap: datos que crecen como <code>String</code> o <code>Vec</code>, accesibles mediante un puntero',
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
            { say: 'Para entender el ownership necesitas una imagen rápida de dónde viven los valores.', type: { c: 1 }, show: ['d.stack', 'd.heap'] },
            { say: 'Los valores simples y de tamaño fijo, como un u treinta y dos, viven en el stack. Son baratos de crear y copiar.', type: { c: 2 }, show: ['d.age', 'b.0'], lines: { c: [2] } },
            { say: 'Un String puede crecer, así que sus caracteres viven en el heap. El stack solo guarda un pequeño encabezado: un puntero, un largo y una capacidad.', type: { c: 3 }, show: ['d.name', 'd.buf', 'd.p', 'b.1'], lines: { c: [3] } },
            { say: 'Cuando main termina, ambos dueños salen de su scope. Rust libera el espacio en el stack y el buffer del heap de inmediato, sin ningún collector.', type: { c: 'all' }, lines: { c: [4] }, cls: { 'd.age': 'dropped', 'd.name': 'dropped', 'd.buf': 'dropped', 'd.p': 'cut' } },
          ],
        },
        {
          title: 'La asignación <em>mueve</em> el ownership',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', code: `let s1 = String::from("hello");
let s2 = s1;        // ¡move!
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
            { say: 'Aquí es donde Rust realmente se separa de Ruby. Creamos un String llamado s uno. Es dueño de un buffer en el heap que contiene hello.', type: { c: 1 }, show: ['d.stack', 'd.heap', 'd.s1', 'd.buf', 'd.a1'] },
            { say: 'Ahora asignamos s uno a s dos. En Ruby, ambas variables apuntarían al mismo objeto. Rust copia solo el pequeño encabezado, así que s dos apunta al mismo buffer.', type: { c: 2 }, show: ['d.s2', 'd.a2'], lines: { c: [2] } },
            { say: 'Pero dos dueños de un mismo buffer romperían la regla dos, y el buffer se liberaría dos veces. Así que Rust mueve el ownership. s uno ya no es válido.', cls: { 'd.s1': 'moved', 'd.a1': 'cut' }, hl: ['d.s2'] },
            { say: 'Usa s uno después del move y el compilador se niega. Borrow of moved value. Vas a ver este error muchas veces, y ahora sabes exactamente qué significa.', type: { c: 'all' }, show: 'e', lines: { c: [3] }, note: 'No se copia nada en el heap. Un move son solo unos pocos bytes en el stack.' },
          ],
        },
        {
          title: 'Tipos Copy y <code>.clone()</code>',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', size: 18, code: `let a = 5;
let b = a;              // Copy
println!("{a} {b}");    // ✅

let s1 = String::from("hi");
let s2 = s1.clone();    // copia profunda
println!("{s1} {s2}");  // ✅` },
            { id: 't', kind: 'table', side: 'right', cls: 'sm', head: ['Copy (se duplica)', 'Move (se transfiere)'], rows: [
              ['<code>i32</code>, <code>u64</code>, <code>f64</code>', '<code>String</code>'],
              ['<code>bool</code>, <code>char</code>', '<code>Vec&lt;T&gt;</code>'],
              ['<code>&amp;T</code> (refs compartidas)', '<code>HashMap&lt;K, V&gt;</code>'],
              ['Tuplas de tipos Copy', 'Tus structs (por defecto)'],
            ] },
          ],
          beats: [
            { say: 'No todo se mueve. Los tipos pequeños y de tamaño fijo, como los enteros, implementan el trait Copy.', type: { c: 3 }, show: ['t.0', 't.1'] },
            { say: 'Asignar un valor Copy duplica los bits, así que a y b siguen siendo válidos. Por eso los números se sienten igual que en Ruby.', lines: { c: [2, 3] }, show: 't.2' },
            { say: 'Todo lo que es dueño de memoria en el heap, como String, Vec o HashMap, se mueve.', show: 't.3' },
            { say: 'Cuando de verdad quieres dos copias independientes, llama a clone. Es una copia profunda de los datos, parecida a dup en Ruby, pero explícita y visible en el código.', type: { c: 'all' }, lines: { c: [6, 7] }, note: 'Usar <code>.clone()</code> está bien mientras aprendes. Primero haz que funcione, después quita los clones.' },
          ],
        },
        {
          type: 'checkpoint', title: 'Pregunta rápida',
          q: '¿Qué pasa cuando compilas esto?',
          code: `let names = vec![String::from("ada")];
let copy = names;
println!("{}", names.len());`,
          options: ['Imprime 1', 'Error de compilación: <code>names</code> se movió a <code>copy</code>', 'Hace panic en runtime', 'Imprime 0'],
          answer: 1,
          explain: '<code>Vec</code> no es <code>Copy</code>, así que <code>let copy = names;</code> mueve el ownership. Usar <code>names</code> después es el error E0382.',
          beats: [{ say: 'Checkpoint. Un vector se asigna a una nueva variable. Luego usamos la anterior. ¿Qué pasa?' }],
        },
        {
          title: 'Pasar a una función también es un move',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'mailer.rs', side: 'left', size: 17, code: `fn send_welcome(email: String) {
    println!("Enviando a {email}");
} // email se libera aquí

fn main() {
    let email = String::from("ada@x.io");
    send_welcome(email);
    send_welcome(email); // ❌ movido
}` },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'right', items: [
              { icon: '🧬', text: 'Pasa una copia: <code>send_welcome(email.clone())</code>' },
              { icon: '↩️', text: 'Devuélvelo: retorna el <code>String</code> desde la función' },
              { icon: '🤝', text: 'Lo mejor: <b>préstalo</b> con <code>&amp;str</code>, que es la próxima lección' },
            ] },
          ],
          beats: [
            { say: 'Llamar a una función funciona exactamente igual que asignar. Pasar un String lo mueve al parámetro de la función.', type: { c: 3 } },
            { say: 'El parámetro se convierte en el nuevo dueño, así que el string se libera cuando la función retorna.', lines: { c: [3] } },
            { say: 'Por eso llamar a send welcome por segunda vez falla. Email ya se había movido en la primera llamada.', type: { c: 'all' }, lines: { c: [7, 8] } },
            { say: 'Tienes tres opciones. Pasar un clone.', show: 'b.0' },
            { say: 'Devolver el valor a quien llamó, lo que funciona pero se vuelve incómodo rápido.', show: 'b.1' },
            { say: 'O, la respuesta real: dejar que la función tome prestado el valor en lugar de ser su dueña. Esa es nuestra próxima lección.', show: 'b.2' },
          ],
        },
        {
          title: 'Drop: como un bloque que siempre se cierra',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'log.rb', size: 18, code: `File.open("log.txt", "w") do |f|
  f.puts "hello"
end # el archivo se cierra aquí

user = User.new
# se libera... algún día,
# cuando corra el GC` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'log.rs', size: 18, code: `{
    let mut f = File::create("log.txt")?;
    writeln!(f, "hello")?;
} // drop de f: archivo cerrado YA

let user = User::new();
// se libera al final del scope.
// Siempre. De forma determinista.` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Hacer drop ejecuta la lógica <code>Drop</code> del tipo: memoria, archivos, sockets y conexiones a la base de datos se limpian en un punto predecible.' },
          ],
          beats: [
            { say: 'Los rubyistas ya conocen una versión de esto. File open con un bloque garantiza que el archivo se cierre cuando termina el bloque.', type: { rb: 3 } },
            { say: 'Pero los objetos normales se liberan cuando el garbage collector se acuerda de ellos. No puedes saber cuándo.', type: { rb: 'all' }, lines: { rb: [5, 6, 7] } },
            { say: 'En Rust, cada scope se comporta como ese bloque de archivo. Cuando f sale de su scope, se hace drop y el archivo se cierra ahí mismo.', type: { rs: 4 }, lines: { rs: [4] } },
            { say: 'Lo mismo aplica a todo: memoria, sockets, conexiones a la base de datos, locks de mutex. La limpieza es determinista.', type: { rs: 'all' }, show: 'n' },
          ],
        },
      ],
      summary: {
        tldr: 'Rust no tiene garbage collector. Cada valor tiene exactamente un dueño, y se libera (drop) en el momento en que ese dueño sale de su scope. Asignar o pasar un valor que es dueño de memoria en el heap lo <b>mueve</b>, y la variable anterior queda inutilizable. Los tipos pequeños como los enteros son <b>Copy</b>. Usa <code>.clone()</code> cuando de verdad necesites una segunda copia.',
        points: [
          'Cada valor tiene un solo dueño a la vez, y se libera cuando ese dueño sale de su scope.',
          'La asignación y las llamadas a funciones <b>mueven</b> valores con memoria en el heap como <code>String</code> y <code>Vec</code>. Usar la variable anterior es el error E0382.',
          'Enteros, floats, <code>bool</code>, <code>char</code> y las referencias compartidas son <b>Copy</b>, así que se duplican en vez de moverse.',
          '<code>.clone()</code> hace una copia profunda explícita. Está bien usarlo mientras aprendes.',
          'El drop es determinista, como un bloque <code>File.open</code> que siempre se cierra.',
        ],
        rosetta: [
          ['Garbage collector', 'Ownership + <code>Drop</code> al final del scope'],
          ['<code>b = a</code> (ambos apuntan al mismo objeto)', '<code>let b = a;</code> mueve (tipos que no son Copy)'],
          ['<code>obj.dup</code> / <code>deep_dup</code>', '<code>value.clone()</code>'],
          ['<code>File.open(...) do |f| ... end</code>', 'Cualquier scope <code>{ ... }</code>: los valores se liberan en <code>}</code>'],
          ['<code>ObjectSpace</code> / ajustar el GC', 'Nada que ajustar: no hay GC'],
          ['Los enteros son valores inmediatos', 'Los enteros son <code>Copy</code>'],
        ],
        gotchas: [
          'Un move no copia los datos del heap. Transfiere el ownership, así que es barato.',
          'Mover dentro de un loop es un error clásico: <code>for _ in 0..3 { consume(s) }</code> mueve <code>s</code> en la primera iteración, así que el compilador rechaza el loop (E0382).',
          'No le temas a <code>.clone()</code> en strings pequeños, pero evita clonar colecciones grandes en loops críticos.',
        ],
        code: `fn consume(s: String) { println!("{s}"); } // s se libera aquí

fn main() {
    let a = String::from("hi");
    let b = a.clone();   // copia profunda explícita
    consume(a);          // a se mueve a consume
    // println!("{a}");  // ❌ E0382: a fue movido
    println!("{b}");     // ✅ b es su propio valor

    let x = 5;
    let y = x;           // Copy: ambos utilizables
    println!("{x} {y}");
}`,
        links: [['El Libro, cap. 4.1: ¿Qué es el ownership? (inglés)', 'https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html'], ['Rust by Example: Ownership y moves (inglés)', 'https://doc.rust-lang.org/rust-by-example/scope/move.html']],
      },
      quiz: [
        { type: 'compiles', code: 'let a = String::from("rails");\nlet b = a;\nprintln!("{a}");', answer: false, explain: 'El <code>String</code> se mueve a <code>b</code>, así que <code>a</code> ya no se puede usar (E0382).' },
        { type: 'compiles', code: 'let a = 10;\nlet b = a;\nprintln!("{a} {b}");', answer: true, explain: '<code>i32</code> es <code>Copy</code>, así que <code>a</code> se duplica, no se mueve.' },
        { type: 'mcq', q: '¿Cuándo se libera la memoria del heap de un <code>String</code>?', options: ['Cuando corre el garbage collector', 'Cuando su dueño sale de su scope', 'Cuando llamas a <code>free()</code>', 'Solo cuando el programa termina'], answer: 1, explain: 'Regla tres: cuando el dueño sale de su scope, se hace drop del valor.' },
        { type: 'fill', q: 'Haz que ambas variables se puedan usar creando una copia independiente.', code: 'let s1 = String::from("hello");\nlet s2 = s1.___();\nprintln!("{s1} {s2}");', answers: [['clone']], explain: '<code>.clone()</code> hace una copia profunda, así que <code>s1</code> conserva su propio valor.' },
        { type: 'match', q: 'Relaciona la idea de Ruby con su equivalente en Rust.', pairs: [['Garbage collector', 'reglas de ownership verificadas al compilar'], ['obj.dup', '.clone()'], ['Bloque File.open que cierra el archivo', 'Drop al final del scope'], ['Asignar un número deja ambas variables usables', 'Tipos Copy']] },
        { type: 'order', q: 'Ordena la vida de un <code>String</code>.', items: ['let s = String::from("hi") reserva memoria en el heap', 'let t = s mueve el ownership a t', 't sale de su scope', 'Se ejecuta Drop y se libera el buffer del heap'], explain: 'Reservar, mover, salir del scope, drop.' },
      ],
      practice: [
        {
          title: 'Arregla el move con clone',
          prompt: 'Ejecuta el starter: falla con <b>E0382</b>, <i>use of moved value: `email`</i>. La primera llamada a <code>send_welcome</code> movió el String, igual que en el video. Arréglalo para que imprima <code>Enviando a ada@x.io</code> <b>dos veces</b>. Solo necesitas cambiar una línea.',
          starter: `fn send_welcome(email: String) {
    println!("Enviando a {email}");
}

fn main() {
    let email = String::from("ada@x.io");
    send_welcome(email); // ❌ mueve email a la función
    send_welcome(email);
}
`,
          hints: ['El error apunta a la segunda llamada: <code>email</code> ya se movió en la primera.', 'Si quieres seguir usando un valor, pasa una copia: <code>.clone()</code>.', 'Cambia solo la primera llamada a <code>send_welcome(email.clone());</code>. El último uso puede mover el original.'],
          solution: `fn send_welcome(email: String) {
    println!("Enviando a {email}");
}

fn main() {
    let email = String::from("ada@x.io");
    send_welcome(email.clone());
    send_welcome(email);
}
`,
          explain: 'La primera llamada recibe su propia copia (<code>.clone()</code>), así que el <code>email</code> original sigue siendo nuestro para la segunda, que puede moverlo sin problema. Clonar está bien mientras aprendes. En la próxima lección verás cómo prestar el valor en vez de copiarlo.',
        },
        {
          title: 'Devuelve el String',
          prompt: 'El mismo programa, otro arreglo: en vez de clonar, haz que <code>send_welcome</code> le <b>devuelva el String</b> a quien lo llamó. Son dos ediciones pequeñas (mira los TODO). El starter falla con E0382 hasta que las hagas. Salida esperada: <code>Enviando a ada@x.io</code> dos veces.',
          starter: `// TODO 1: haz que esta función devuelva el String
fn send_welcome(email: String) {
    println!("Enviando a {email}");
}

fn main() {
    let email = String::from("ada@x.io");
    // TODO 2: recibe el String que devuelve, para poder usarlo otra vez
    send_welcome(email);
    send_welcome(email);
}
`,
          hints: ['Una función puede devolver su argumento: cambia la firma a <code>-&gt; String</code> y deja <code>email</code> como última expresión (sin punto y coma).', 'En <code>main</code>, recibe el valor devuelto con <code>let email = send_welcome(email);</code>. Eso es shadowing, del Módulo 1.', 'La segunda llamada puede quedarse como <code>send_welcome(email);</code>.'],
          solution: `fn send_welcome(email: String) -> String {
    println!("Enviando a {email}");
    email
}

fn main() {
    let email = String::from("ada@x.io");
    let email = send_welcome(email);
    send_welcome(email);
}
`,
          explain: 'El ownership entra a la función y vuelve a salir por el valor de retorno. Funciona, pero se ve por qué se vuelve torpe: cada función auxiliar tendría que devolver las cosas. Justamente eso resuelve el borrowing en la próxima lección.',
        },
      ],
    },

    // ------------------------------------------------------------------ 2.2
    {
      id: 'borrowing',
      title: 'Borrowing y referencias',
      subtitle: 'Usa un valor sin quitárselo a nadie, y deja que la firma diga quién puede cambiarlo.',
      tags: ['borrow', 'reference', '&mut', 'borrow checker', 'slices', '&str', 'préstamo', 'referencias'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 2 · Lección 2', title: 'Borrowing y referencias',
          subtitle: 'Muchos lectores o un solo escritor, verificado antes de que tu código corra.',
          beats: [
            { say: 'Mover valores por todos lados sería agotador. La mayoría de las veces, una función solo quiere mirar algo, o ajustarlo, y devolverlo.' },
            { say: 'Eso es el borrowing, o préstamo. Es la habilidad cotidiana más importante en Rust.' },
          ],
        },
        {
          title: 'En Ruby, cualquiera puede mutar cualquier cosa',
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
            { id: 'rs', kind: 'code', lang: 'rust', label: 'defaults.rs', size: 17, code: `// puede cambiar opts. ¡Y lo dice!
fn apply_defaults(opts: &mut Opts) {
    opts.per_page.get_or_insert(25);
}

// solo lectura. Garantizado.
fn render(opts: &Opts) {
    println!("{}", opts.title);
}` },
          ],
          beats: [
            { say: 'Ruby pasa referencias a objetos en todas partes. Cualquier método que reciba tu hash puede cambiarlo.', type: { rb: 7 } },
            { say: 'Así, un service object de apariencia inofensiva puede mutar en silencio los params de quien lo llama. Todos hemos depurado esto alguna vez.', type: { rb: 'all' }, lines: { rb: [3, 4, 11] } },
            { say: 'En Rust, la firma de la función te lo dice. Ampersand mut significa que esta función puede cambiar tu valor.', type: { rs: 4 }, lines: { rs: [2] } },
            { say: 'Un ampersand simple significa solo lectura, y el compilador lo garantiza. La mutación pasa a ser parte del contrato.', type: { rs: 'all' }, lines: { rs: [7] }, note: 'Como <code>params.freeze</code>, pero impuesto por el sistema de tipos, en cada llamada.' },
          ],
        },
        {
          title: 'Préstamos compartidos: <code>&amp;T</code>',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', size: 17, code: `fn word_count(text: &String) -> usize {
    text.split_whitespace().count()
}

fn main() {
    let post = String::from("hi rust");
    let n = word_count(&post);
    println!("{post}: {n} palabras"); // ✅
}` },
            {
              id: 'd', kind: 'diagram', side: 'right', w: 560, h: 400,
              boxes: [
                { id: 'stack', x: 0, y: 0, w: 260, h: 400, label: 'Stack', cls: 'zone' },
                { id: 'heap', x: 300, y: 0, w: 260, h: 400, label: 'Heap', cls: 'zone' },
                { id: 'post', x: 20, y: 70, w: 220, h: 86, label: 'post', sub: 'dueño', cls: 'rust' },
                { id: 'text', x: 20, y: 260, w: 220, h: 86, label: 'text', sub: '&amp;String (préstamo)', cls: 'info' },
                { id: 'buf', x: 320, y: 78, w: 220, h: 70, label: '"hi rust"', cls: 'heap' },
              ],
              arrows: [
                { id: 'own', from: 'post', to: 'buf', cls: 'rust' },
                { id: 'ref', from: 'text', to: 'post', label: '&', cls: 'ok' },
              ],
            },
          ],
          beats: [
            { say: 'En lugar de entregar el ownership, podemos prestar una referencia. La función recibe un ampersand String.', type: { c: 3 }, lines: { c: [1] } },
            { say: 'Post es el dueño del buffer en el heap.', type: { c: 6 }, show: ['d.stack', 'd.heap', 'd.post', 'd.buf', 'd.own'] },
            { say: 'Llamamos a word count con ampersand post. Eso crea una referencia: un puntero a post que no es dueño de nada.', type: { c: 7 }, show: ['d.text', 'd.ref'], lines: { c: [7] } },
            { say: 'Cuando la función retorna, el préstamo termina y la referencia desaparece. El String no se libera, porque la referencia nunca fue su dueña.', cls: { 'd.text': 'dropped', 'd.ref': 'cut' } },
            { say: 'Así que post sigue siendo nuestro, y lo podemos seguir usando. Sin clone.', type: { c: 'all' }, lines: { c: [8] }, hl: ['d.post'] },
          ],
        },
        {
          title: 'Préstamos mutables: <code>&amp;mut T</code>',
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
            { id: 'n', kind: 'text', style: 'callout', html: '<code>mut</code> aparece tres veces: en la variable, en el préstamo y en el tipo del parámetro. La mutación nunca es una sorpresa.' },
          ],
          beats: [
            { say: 'Cuando una función necesita cambiar algo, pide un préstamo mutable: ampersand mut.', type: { c: 3 }, lines: { c: [1] } },
            { say: 'Quien llama tiene que aceptarlo dos veces. La variable debe declararse mut, y la llamada escribe ampersand mut de forma explícita.', type: { c: 'all' }, lines: { c: [6, 7, 8] } },
            { say: 'Al leer el código, ves cada lugar que podría cambiar tags. Compáralo con buscar métodos bang en Ruby.', show: 'n' },
          ],
        },
        {
          title: 'Las reglas del borrowing',
          blocks: [
            { id: 'c', kind: 'cards', items: [
              { icon: '👀', title: 'Muchos lectores…', body: 'Cualquier cantidad de referencias compartidas <code>&amp;T</code> al mismo tiempo.', cls: 'ok' },
              { icon: '✍️', title: '…O un escritor', body: 'Exactamente una <code>&amp;mut T</code>, y ningún lector mientras exista.', cls: 'rust' },
              { icon: '⏳', title: 'Siempre válidas', body: 'Una referencia nunca puede vivir más que los datos a los que apunta. Sin punteros colgantes.', cls: 'bad' },
            ] },
            { id: 'n', kind: 'text', style: 'callout', html: 'Es un lock de lectura/escritura verificado <em>al compilar</em>, sin costo en runtime. Por eso el Rust seguro no tiene data races.' },
          ],
          beats: [
            { say: 'Todo el borrowing se reduce a estas reglas.' },
            { say: 'En cualquier momento, puedes tener todas las referencias compartidas, de solo lectura, que quieras.', show: 'c.0' },
            { say: 'O puedes tener exactamente una referencia mutable, sin lectores al mismo tiempo. Nunca ambas.', show: 'c.1' },
            { say: 'Y una referencia nunca debe vivir más que el valor al que apunta.', show: 'c.2' },
            { say: 'Si has usado un lock de lectura y escritura en una base de datos, es la misma idea. El compilador lo verifica, así que no cuesta nada en runtime y los data races no pueden ocurrir.', show: 'n' },
          ],
        },
        {
          title: 'Por qué existen las reglas: E0502',
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
            { say: 'Este es el error clásico del borrow checker. Un vector, y una referencia a su primer elemento.', type: { c: 2 }, show: ['d.stack', 'd.heap', 'd.v', 'd.old', 'd.a1', 'd.first', 'd.a2'] },
            { say: 'Luego hacemos push. Pero el push puede necesitar más espacio, así que el vector puede realocar: copiar todo a un buffer nuevo y más grande, y liberar el anterior.', type: { c: 3 }, lines: { c: [3] }, show: ['d.new', 'd.a3'], cls: { 'd.old': 'dropped', 'd.a1': 'cut' } },
            { say: 'Ahora first apunta a memoria liberada. En C eso es un bug de uso después de liberar. Un agujero de seguridad.', cls: { 'd.a2': 'bad', 'd.first': 'error' } },
            { say: 'Rust se niega a compilarlo. No puedes mutar v mientras un préstamo compartido de v siga en uso.', type: { c: 'all' }, show: 'e', lines: { c: [4] }, note: 'Ruby lo evita con un GC y copias. Rust lo evita al compilar, y sigue siendo rápido.' },
          ],
        },
        {
          title: 'Cómo arreglarlo: los préstamos terminan en su último uso',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', code: `let mut v = vec![1, 2, 3];

let first = v[0];       // copia el i32 afuera
v.push(4);              // ✅ ningún préstamo vivo

let first = &v[0];
println!("{first}");    // último uso del préstamo
v.push(5);              // ✅ el préstamo ya terminó` },
          ],
          beats: [
            { say: 'Hay dos soluciones comunes.', type: { c: 1 } },
            { say: 'Uno. Copia el valor afuera en vez de pedirlo prestado. Un i treinta y dos es Copy, así que no queda ninguna referencia viva.', type: { c: 4 }, lines: { c: [3, 4] } },
            { say: 'Dos. Reordena tu código. Un préstamo dura solo hasta su último uso, no hasta el final del bloque.', type: { c: 'all' }, lines: { c: [6, 7, 8] } },
            { say: 'Así que cuando hacemos push del cinco, nadie está mirando el vector, y el compilador queda contento.', lines: { c: [8] }, note: 'La mayoría de los errores de borrowing se arreglan reordenando, clonando un valor pequeño o acotando un scope.' },
          ],
        },
        {
          type: 'checkpoint', title: 'Pregunta rápida',
          q: '¿Esto compila?',
          code: `let mut s = String::from("hi");
let a = &mut s;
let b = &mut s;
a.push('!');`,
          options: ['Sí, imprime <code>hi!</code>', 'No: hay dos préstamos mutables de <code>s</code> vivos a la vez (E0499)', 'Compila pero hace panic en runtime', 'Sí, porque <code>b</code> nunca se usa'],
          answer: 1,
          explain: '<code>a</code> todavía se usa en la última línea, así que ambos préstamos <code>&amp;mut</code> se superponen. Eso rompe la regla de un solo escritor: error E0499.',
          beats: [{ say: 'Checkpoint. Dos préstamos mutables del mismo string. ¿Lo permitirá el compilador?' }],
        },
        {
          title: 'Slices: prestar una parte de un valor',
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
              { icon: '✂️', text: '<code>&amp;str</code> es una vista de datos de texto que pertenecen a otro' },
              { icon: '📏', text: '<code>&amp;[T]</code> es una vista de una parte o de todo un <code>Vec</code> o arreglo' },
              { icon: '🔁', text: '<code>&amp;String</code> se convierte solo en <code>&amp;str</code>, y <code>&amp;Vec&lt;T&gt;</code> en <code>&amp;[T]</code>' },
              { icon: '✅', text: 'Idioma: recibe <code>&amp;str</code> y <code>&amp;[T]</code> como parámetros, porque aceptan más entradas' },
            ] },
          ],
          beats: [
            { say: 'Un tipo más de préstamo: los slices. Un string slice, ampersand str, toma prestada una parte o todo un string.', type: { c: 3 }, show: 'b.0' },
            { say: 'La palabra que se devuelve no es un string nuevo. Apunta directamente al texto original. Sin copias.', lines: { c: [1, 2] } },
            { say: 'Los slices de arreglos funcionan igual para los vectores.', type: { c: 7 }, show: 'b.1', lines: { c: [5, 6, 7] } },
            { say: 'Una referencia a un String se convierte automáticamente en un string slice, y una referencia a un Vec se convierte en un slice.', type: { c: 'all' }, show: 'b.2', lines: { c: [10, 11] } },
            { say: 'Así que lo idiomático es aceptar ampersand str y slices en tus funciones. Funcionan con más entradas, incluidos los literales de texto.', show: 'b.3' },
          ],
        },
      ],
      summary: {
        tldr: 'Una referencia te permite usar un valor sin ser su dueño. <code>&amp;T</code> es un préstamo compartido de solo lectura, y <code>&amp;mut T</code> es un préstamo exclusivo de lectura y escritura. Puedes tener <b>muchos lectores o un escritor</b>, nunca ambos, y una referencia nunca puede vivir más que sus datos. Ahora las firmas de las funciones documentan quién puede mutar qué.',
        points: [
          '<code>&amp;valor</code> presta una referencia de solo lectura. El dueño conserva el ownership y puede usar el valor después.',
          '<code>&amp;mut valor</code> presta acceso exclusivo de escritura. Requiere <code>let mut</code> en el dueño.',
          'Regla: muchas <code>&amp;T</code> <b>o</b> una <code>&amp;mut T</code> a la vez. Es un lock de lectura/escritura al compilar, así que no hay data races.',
          'Un préstamo dura hasta su <b>último uso</b>. Reordenar el código arregla la mayoría de los errores de borrowing.',
          'Los slices (<code>&amp;str</code>, <code>&amp;[T]</code>) toman prestada una parte de una colección. Prefiérelos como tipos de parámetro.',
        ],
        rosetta: [
          ['Pasar un objeto (referencia compartida y mutable)', '<code>&amp;T</code> (compartida, solo lectura) o <code>&amp;mut T</code> (exclusiva)'],
          ['<code>opts.freeze</code> antes de pasarlo', 'Pasar <code>&amp;opts</code>'],
          ['Los métodos bang insinúan mutación (<code>merge!</code>)', '<code>&amp;mut self</code> / <code>&amp;mut T</code> en la firma'],
          ['<code>str[0, 5]</code> (crea un String nuevo)', '<code>&amp;s[0..5]</code> (préstamo, sin reservar memoria)'],
          ['<code>array[1..]</code> (Array nuevo)', '<code>&amp;v[1..]</code> (una vista slice)'],
          ['Mutex alrededor de estado compartido', 'El borrow checker para datos con un solo dueño'],
        ],
        gotchas: [
          'No puedes tomar <code>&amp;mut</code> de una variable que no está declarada con <code>let mut</code>.',
          'Llamar a un método <code>&amp;mut self</code> mientras tienes una referencia dentro del mismo valor es el clásico E0502.',
          'Los string slices indexan <b>bytes</b>: <code>&amp;s[0..1]</code> sobre <code>"é"</code> hace panic porque cortaría un carácter por la mitad.',
        ],
        code: `fn len_of(s: &str) -> usize { s.len() }          // préstamo de solo lectura
fn shout(s: &mut String) { s.push_str("!"); }    // préstamo exclusivo

fn main() {
    let mut msg = String::from("hello");
    let n = len_of(&msg);   // muchos & están bien
    shout(&mut msg);        // un &mut, ningún & vivo
    println!("{msg} ({n})"); // hello! (5)
}`,
        links: [['El Libro, cap. 4.2: Referencias y borrowing (inglés)', 'https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html'], ['El Libro, cap. 4.3: El tipo slice (inglés)', 'https://doc.rust-lang.org/book/ch04-03-slices.html']],
      },
      quiz: [
        { type: 'mcq', q: '¿Qué combinación de referencias al mismo valor se permite a la vez?', options: ['Dos <code>&amp;mut T</code>', 'Una <code>&amp;T</code> y una <code>&amp;mut T</code>', 'Cualquier cantidad de <code>&amp;T</code>', 'Ilimitadas de ambas, si tienes cuidado'], answer: 2, explain: 'Muchos lectores <b>o</b> un escritor.' },
        { type: 'compiles', code: 'let mut v = vec![1, 2, 3];\nlet first = &v[0];\nv.push(4);\nprintln!("{first}");', answer: false, explain: '<code>first</code> todavía se usa después del <code>push</code>, que necesita <code>&amp;mut v</code>. Eso es E0502.' },
        { type: 'compiles', code: 'let mut v = vec![1, 2, 3];\nlet len = v.len();\nv.push(4);\nprintln!("{len}");', answer: true, explain: '<code>v.len()</code> devuelve un <code>usize</code> (Copy). No hay ningún préstamo vivo cuando hacemos push.' },
        { type: 'fill', q: 'Completa la firma y la llamada para que la función pueda agregar al vector.', code: 'fn add_one(list: ___ Vec<i32>) {\n    list.push(1);\n}\n\nlet mut nums = vec![];\nadd_one(___ nums);', answers: [['&mut'], ['&mut']], explain: 'Los préstamos mutables son explícitos tanto en el tipo del parámetro como en la llamada.' },
        { type: 'mcq', q: 'En Ruby, un service object mutó por accidente el hash de quien lo llamó. ¿Qué firma de Rust deja que quien llama <b>siga usando</b> sus opciones y <b>garantiza</b> que la función no pueda cambiarlas?', options: ['<code>fn call(opts: &amp;mut Opts)</code>', '<code>fn call(opts: &amp;Opts)</code>', '<code>fn call(mut opts: Opts)</code>', 'Ninguna: Rust no puede garantizarlo'], answer: 1, explain: 'Una referencia compartida <code>&amp;</code> es de solo lectura, y quien llama conserva el ownership. (La opción A puede mutar. La opción C toma el ownership, así que quien llama ya no puede usar sus opciones.)' },
        { type: 'match', q: 'Relaciona cada tipo con lo que significa.', pairs: [['T', 'valor con dueño'], ['&T', 'préstamo compartido, solo lectura'], ['&mut T', 'préstamo exclusivo, lectura y escritura'], ['&str', 'string slice prestado']] },
      ],
      practice: [
        {
          title: 'Mira, no te lo lleves',
          prompt: 'Ejecuta el starter y lee los errores. <code>count_words</code> solo necesita <i>mirar</i> el texto, así que debería tomarlo prestado. Completa el tipo del parámetro (TODO 1) y presta el post en la llamada (TODO 2). El starter no compila hasta que lo hagas. Salida esperada: <code>ownership makes rust rust: 4 palabras</code>.',
          starter: `fn count_words(text: /* TODO 1 */) -> usize {
    text.split_whitespace().count()
}

fn main() {
    let post = String::from("ownership makes rust rust");
    let n = count_words(post); // TODO 2
    println!("{post}: {n} palabras");
}
`,
          hints: ['Un préstamo de solo lectura se escribe con un ampersand. En el video, el idioma para parámetros de texto era <code>&amp;str</code> (<code>&amp;String</code> también sirve).', 'En la llamada también escribes el ampersand: prestas <code>post</code>, no lo regalas.', 'TODO 1 es <code>&amp;str</code> y TODO 2 es <code>count_words(&amp;post)</code>. Después <code>post</code> sigue usable en la última línea.'],
          solution: `fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

fn main() {
    let post = String::from("ownership makes rust rust");
    let n = count_words(&post);
    println!("{post}: {n} palabras");
}
`,
          explain: '<code>&amp;post</code> es un <code>&amp;String</code>, que se convierte solo en <code>&amp;str</code>. La función toma el texto prestado y lo devuelve, así que <code>post</code> sigue funcionando después. No hace falta clonar.',
        },
        {
          title: 'Préstalo como mutable',
          prompt: 'Esta vez la función necesita <i>cambiar</i> el vector, así que necesita un préstamo <b>mutable</b>. Arregla los tres TODO. La última llamada a <code>add_tag</code> ya es correcta, copia su estilo. El starter no compila hasta que lo hagas. Salida esperada: <code>["rust", "rails"]</code>.',
          starter: `fn add_tag(tags: /* TODO 1 */, tag: &str) {
    tags.push(tag.to_string());
}

fn main() {
    let tags = Vec::new();         // TODO 2
    add_tag(tags, "rust");         // TODO 3
    add_tag(&mut tags, "rails");   // ya es correcta: copia este estilo
    println!("{tags:?}");
}
`,
          hints: ['Mutar requiere <code>&amp;mut</code>. El video dijo que <code>mut</code> aparece tres veces: en la variable, en el préstamo y en el tipo del parámetro.', 'TODO 1 es el tipo del parámetro: <code>&amp;mut Vec&lt;String&gt;</code>. TODO 2 es <code>let mut tags</code>.', 'TODO 3: escribe <code>&amp;mut tags</code> en la primera llamada, como hace la segunda.'],
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
          explain: 'Quien llama tiene que aceptar dos veces: <code>let mut tags</code> y <code>&amp;mut tags</code>. La firma le dice a cualquiera que lea que <code>add_tag</code> puede cambiar el vector, y el préstamo termina cuando la llamada retorna, así que la siguiente llamada puede volver a prestar.',
        },
        {
          title: 'Un préstamo termina en su último uso',
          prompt: 'Este es el clásico <b>E0502</b> del video: <code>first</code> toma prestado el vector y luego <code>push</code> intenta cambiarlo. Cambia el <b>orden</b> de las líneas (o copia el valor) para que compile. Salida esperada: <code>first = 1</code> y luego <code>[1, 2, 3, 4]</code>.',
          starter: `fn main() {
    let mut v = vec![1, 2, 3];
    let first = &v[0];
    v.push(4); // ❌ E0502
    println!("first = {first}");
    println!("{v:?}");
}
`,
          hints: ['El préstamo <code>first</code> dura hasta su último uso, que es el primer <code>println!</code>.', 'Mueve <code>v.push(4);</code> debajo de la línea que imprime <code>first</code>.', 'Alternativa del video: copia el número con <code>let first = v[0];</code> para que no quede ningún préstamo vivo.'],
          solution: `fn main() {
    let mut v = vec![1, 2, 3];
    let first = &v[0];
    println!("first = {first}");
    v.push(4);
    println!("{v:?}");
}
`,
          explain: 'Tras reordenar, nadie mira el vector cuando corre <code>push</code>, así que puede reubicarse con seguridad. Copiar el <code>i32</code> también funciona, porque un valor Copy no toma nada prestado.',
        },
      ],
    },

    // ------------------------------------------------------------------ 2.3
    {
      id: 'lifetimes-smart-pointers',
      title: 'Lifetimes, Rc y RefCell',
      subtitle: 'Cómo se prueba que las referencias siguen siendo válidas, y las salidas de emergencia para datos compartidos y mutables.',
      tags: ['lifetimes', "'a", 'Box', 'Rc', 'Arc', 'RefCell', 'smart pointers', 'tiempos de vida'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 2 · Lección 3', title: 'Lifetimes, Rc y RefCell',
          subtitle: 'Cómo Rust prueba que las referencias son válidas, y qué usar cuando un solo dueño no basta.',
          beats: [
            { say: 'Las dos últimas piezas del rompecabezas del ownership. Los lifetimes, que mantienen honestas a las referencias.' },
            { say: 'Y los smart pointers como Rc y RefCell, que te devuelven parte de la flexibilidad para compartir a la que estás acostumbrado en Ruby.' },
          ],
        },
        {
          title: 'El bug que evitan los lifetimes',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', code: `let r;
{
    let x = 5;
    r = &x;
}           // x se libera aquí
println!("{r}");  // ❌` },
            { id: 'e', kind: 'text', style: 'err', side: 'left', html: '<b>error[E0597]</b>: `x` does not live long enough\n  borrowed value does not live long enough' },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'right', items: [
              { icon: '💎', text: 'Ruby: el GC mantiene vivo a <code>x</code> mientras algo lo referencie' },
              { icon: '🦀', text: 'Rust: no hay GC, así que el compilador debe <b>probar</b> que <code>r</code> nunca vive más que <code>x</code>' },
              { icon: '⏳', text: 'Esa prueba es el <b>lifetime</b>: el tramo de código donde una referencia es válida' },
            ] },
          ],
          beats: [
            { say: 'Aquí está el bug. r se declara fuera de un bloque, y dentro del bloque toma prestado x.', type: { c: 4 } },
            { say: 'Pero x se libera en la llave de cierre. Después de eso, r apuntaría a memoria liberada.', type: { c: 5 }, lines: { c: [5] } },
            { say: 'En Ruby esto no puede pasar. El garbage collector mantiene vivo a x mientras alguien lo referencie.', show: 'b.0' },
            { say: 'Rust no tiene collector, así que el compilador debe probar que cada referencia se queda dentro del lifetime de sus datos.', show: 'b.1' },
            { say: 'Aquí no puede. Error, x no vive lo suficiente. El tramo donde una referencia es válida se llama su lifetime, o tiempo de vida.', type: { c: 'all' }, show: ['e', 'b.2'], lines: { c: [6] } },
          ],
        },
        {
          title: 'Anotaciones de lifetime: <code>\'a</code>',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'longest.rs', code: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

let winner = longest("ruby", "rust-lang");` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              '<code>\'a</code> es un <b>nombre</b> para "alguna región de código", como un parámetro de tipo genérico',
              'Se lee así: el resultado no vive más que <b>ambas</b> entradas',
              'Las anotaciones <b>describen</b> relaciones. Nunca hacen que algo viva más',
            ] },
          ],
          beats: [
            { say: 'Normalmente el compilador deduce los lifetimes solo. Pero mira esta función. Devuelve una de dos referencias.', type: { c: 3 } },
            { say: '¿De cuál entrada toma prestado el resultado? El compilador no lo puede saber solo con la firma, así que lo anotamos.', lines: { c: [1] } },
            { say: 'Tick a es un parámetro de lifetime. Es un nombre para alguna región de código, declarado entre ángulos como un genérico.', show: 'b.0' },
            { say: 'Usarlo en ambas entradas y en la salida dice que el resultado es válido solo mientras ambas entradas lo sean.', show: 'b.1', type: { c: 'all' } },
            { say: 'Importante: las anotaciones no cambian cuánto vive nada. Solo describen relaciones para que el compilador las verifique.', show: 'b.2', note: 'Lee <code>\'a</code> en voz alta como "tick a" o "lifetime a".' },
          ],
        },
        {
          title: 'La mayoría de las veces no escribes ninguna',
          blocks: [
            { id: 't', kind: 'table', cls: 'sm', head: ['Firma', 'Regla (elisión)', '¿Anotar?'], rows: [
              ['<code>fn trim(s: &amp;str) -&gt; &amp;str</code>', 'Una referencia de entrada, así que la salida la toma prestada', 'No'],
              ['<code>fn name(&amp;self) -&gt; &amp;str</code>', 'Métodos: la salida toma prestado de <code>self</code>', 'No'],
              ['<code>fn len(a: &amp;str, b: &amp;str) -&gt; usize</code>', 'No se devuelve ninguna referencia', 'No'],
              ['<code>fn pick(a: &amp;str, b: &amp;str) -&gt; &amp;str</code>', 'Ambiguo: ¿cuál entrada?', '<b>Sí</b>'],
            ] },
            { id: 'n', kind: 'text', style: 'ok', html: 'En el código de aplicación del día a día escribirás <code>\'a</code> muy pocas veces. Cuando el compilador necesite una, te dirá exactamente dónde.' },
          ],
          beats: [
            { say: 'Buenas noticias. Gracias a las reglas de elisión de lifetimes, casi nunca escribes anotaciones.' },
            { say: 'Si una función recibe una sola referencia y devuelve una, la salida obviamente toma prestado de esa entrada.', show: 't.0' },
            { say: 'En los métodos, se asume que una referencia devuelta toma prestado de self. Eso cubre los getters.', show: 't.1' },
            { say: 'Si no se devuelve ninguna referencia, no hay nada que relacionar.', show: 't.2' },
            { say: 'Solo cuando es realmente ambiguo necesitas anotar, y el error del compilador te lo va a señalar.', show: ['t.3', 'n'] },
          ],
        },
        {
          title: 'Structs: sé dueño de tus datos (casi siempre)',
          layout: 'split',
          blocks: [
            { id: 'rs', kind: 'code', lang: 'rust', label: 'owned.rs', code: `// ✅ la opción por defecto
struct User {
    name: String,
    email: String,
}` },
            { id: 'lt', kind: 'code', lang: 'rust', label: 'borrowed.rs', code: `// préstamo: necesita un lifetime
struct Excerpt<'a> {
    text: &'a str,
}
// no puede vivir más que el texto` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Regla práctica: los structs son <em>dueños</em> de sus campos (<code>String</code>, <code>Vec</code>), igual que un modelo de ActiveRecord es dueño de sus atributos. Los structs que toman prestado son una optimización, para cosas como parsers sin copias.' },
          ],
          beats: [
            { say: 'Los lifetimes aparecen sobre todo en los structs. El camino fácil es un struct que sea dueño de sus datos, con campos String en vez de string slices.', type: { rs: 'all' } },
            { say: 'Un struct puede contener referencias, pero entonces necesita un parámetro de lifetime, y nunca puede vivir más que los datos que toma prestados.', type: { lt: 'all' }, lines: { lt: [2, 3] } },
            { say: 'El consejo para devs de aplicaciones: sé dueño de tus datos. Trata tus structs como modelos de ActiveRecord dueños de sus atributos, y usa structs con préstamos solo cuando el profiling te lo pida.', show: 'n' },
          ],
        },
        {
          title: 'Smart pointers: cuando un dueño no basta',
          blocks: [
            { id: 't', kind: 'table', cls: 'sm', head: ['Tipo', 'Qué te da', 'Piénsalo como'], rows: [
              ['<code>Box&lt;T&gt;</code>', 'Un dueño, el valor vive en el heap', 'Un objeto normal, reservado en el heap'],
              ['<code>Rc&lt;T&gt;</code>', 'Muchos dueños, un hilo, con conteo de referencias', 'Objeto compartido, contado en vez de recolectado'],
              ['<code>Arc&lt;T&gt;</code>', 'Muchos dueños, <b>entre hilos</b> (conteo atómico)', '<code>Rc</code> para Tokio / hilos'],
              ['<code>RefCell&lt;T&gt;</code>', 'Mutar a través de una referencia compartida, verificado en runtime', 'Mutación estilo Ruby, opcional'],
              ['<code>Mutex&lt;T&gt;</code>', 'Como <code>RefCell</code>, pero seguro entre hilos', '<code>Mutex.new</code> / <code>synchronize</code>'],
            ] },
          ],
          beats: [
            { say: 'A veces la regla de un solo dueño es demasiado estricta. Piensa en un objeto de configuración que comparten muchas partes de la app. Rust tiene smart pointers para esto.' },
            { say: 'Box pone un solo valor en el heap. Sigue teniendo un dueño, y es útil para tipos recursivos y trait objects.', show: 't.0' },
            { say: 'Rc significa conteo de referencias. Muchos dueños comparten un valor, y se libera cuando se va el último dueño.', show: 't.1' },
            { say: 'Arc es la versión atómica de Rc, segura para compartir entre hilos. La vas a usar todo el tiempo en servidores web async.', show: 't.2' },
            { say: 'RefCell te deja mutar a través de una referencia compartida. Las reglas de borrowing se verifican en runtime en vez de al compilar. Mutex hace lo mismo entre hilos.', show: ['t.3', 't.4'] },
          ],
        },
        {
          title: '<code>Rc</code>: ownership compartido contando',
          layout: 'split',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', side: 'left', size: 17, code: `use std::rc::Rc;

let config = Rc::new(Config::load());
let a = Rc::clone(&config); // cuenta 2
let b = Rc::clone(&config); // cuenta 3
drop(a);                    // cuenta 2
// se libera cuando la cuenta llega a 0` },
            {
              id: 'd', kind: 'diagram', side: 'right', w: 560, h: 400,
              boxes: [
                { id: 'stack', x: 0, y: 0, w: 230, h: 400, label: 'Stack', cls: 'zone' },
                { id: 'heap', x: 270, y: 0, w: 290, h: 400, label: 'Heap', cls: 'zone' },
                { id: 'cfg', x: 20, y: 50, w: 190, h: 76, label: 'config', sub: 'Rc&lt;Config&gt;', cls: 'rust' },
                { id: 'a', x: 20, y: 170, w: 190, h: 76, label: 'a', sub: 'Rc&lt;Config&gt;', cls: 'rust' },
                { id: 'b', x: 20, y: 290, w: 190, h: 76, label: 'b', sub: 'Rc&lt;Config&gt;', cls: 'rust' },
                { id: 'obj', x: 290, y: 155, w: 250, h: 106, label: 'Config', sub: 'conteo fuerte + datos', cls: 'heap' },
              ],
              arrows: [
                { id: 'p0', from: 'cfg', to: 'obj', cls: 'rust' },
                { id: 'p1', from: 'a', to: 'obj', cls: 'rust' },
                { id: 'p2', from: 'b', to: 'obj', cls: 'rust' },
              ],
            },
          ],
          beats: [
            { say: 'Rc new pone la configuración en el heap, junto a un contador de cuántos dueños tiene. Por ahora, uno.', type: { c: 3 }, show: ['d.stack', 'd.heap', 'd.cfg', 'd.obj', 'd.p0'], note: 'conteo fuerte = 1' },
            { say: 'Rc clone no copia la configuración. Copia el puntero y sube el contador. Dos dueños.', type: { c: 4 }, show: ['d.a', 'd.p1'], lines: { c: [4] }, note: 'conteo fuerte = 2' },
            { say: 'Y un tercero.', type: { c: 5 }, show: ['d.b', 'd.p2'], lines: { c: [5] }, note: 'conteo fuerte = 3' },
            { say: 'Liberar un dueño baja el contador. Cuando llega a cero, se libera la configuración. Como un pequeño garbage collector predecible, solo para este valor.', type: { c: 'all' }, lines: { c: [6, 7] }, cls: { 'd.a': 'dropped', 'd.p1': 'cut' }, note: 'conteo fuerte = 2' },
          ],
        },
        {
          title: '<code>RefCell</code>: mutación verificada en runtime',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'cart.rs', size: 18, code: `use std::{cell::RefCell, rc::Rc};

let cart = Rc::new(RefCell::new(vec![]));
let same_cart = Rc::clone(&cart);

same_cart.borrow_mut().push("book");
println!("{:?}", cart.borrow()); // ["book"]` },
            { id: 't', kind: 'text', style: 'big', html: 'Todo objeto de Ruby ≈ <em>Rc&lt;RefCell&lt;T&gt;&gt;</em> + un GC' },
          ],
          beats: [
            { say: 'Rc te da muchos dueños, pero solo acceso compartido de solo lectura. Para mutar datos compartidos, envuélvelos en un RefCell.', type: { c: 4 } },
            { say: 'borrow mut entrega un préstamo mutable en runtime. Si ya hay uno activo, el programa hace panic en vez de fallar al compilar.', type: { c: 'all' }, lines: { c: [6] } },
            { say: 'Todo junto, así funciona básicamente cualquier objeto de Ruby: compartido por muchas referencias, mutable por cualquiera y limpiado automáticamente.', show: 't' },
            { say: 'Rust te hace pedir esa flexibilidad de forma explícita, así que solo la pagas donde la necesitas.', note: 'Usar <code>Rc&lt;RefCell&gt;</code> en todas partes es una mala señal. Prueba primero con ownership simple.' },
          ],
        },
        {
          type: 'checkpoint', title: 'Pregunta rápida',
          q: 'Tu servidor web con Axum necesita compartir un <code>AppConfig</code> de solo lectura entre muchos handlers concurrentes que corren en varios hilos. ¿Qué usas?',
          options: ['<code>Box&lt;AppConfig&gt;</code>', '<code>Rc&lt;AppConfig&gt;</code>', '<code>Arc&lt;AppConfig&gt;</code>', '<code>RefCell&lt;AppConfig&gt;</code>'],
          answer: 2,
          explain: 'Muchos dueños entre hilos significa <code>Arc</code>. <code>Rc</code> no es seguro entre hilos (el compilador no lo deja cruzarlos), y los datos de solo lectura no necesitan <code>RefCell</code> ni <code>Mutex</code>.',
          beats: [{ say: 'Checkpoint. Configuración compartida, muchos hilos. ¿Qué smart pointer?' }],
        },
      ],
      summary: {
        tldr: 'Un lifetime es el tramo donde una referencia es válida. El compilador verifica que ninguna referencia viva más que sus datos, y gracias a las reglas de elisión casi nunca escribes <code>\'a</code>. Haz que tus structs sean dueños de sus datos. Cuando un dueño no basta, usa smart pointers: <code>Box</code> (heap, un dueño), <code>Rc</code>/<code>Arc</code> (compartido, con conteo) y <code>RefCell</code>/<code>Mutex</code> (mutación a través de referencias compartidas).',
        points: [
          'Los lifetimes evitan referencias colgantes. Una referencia nunca puede vivir más que el valor que toma prestado.',
          '<code>\'a</code> <b>describe</b> cómo se relacionan entradas y salidas. Gracias a la elisión, casi nunca la escribes.',
          'Prefiere structs dueños de sus datos (<code>String</code>, no <code>&amp;str</code>).',
          '<code>Rc</code>/<code>Arc</code> dan ownership compartido con conteo de referencias, y <code>Arc</code> funciona entre hilos.',
          '<code>RefCell</code>/<code>Mutex</code> permiten mutar a través de referencias compartidas. <code>Rc&lt;RefCell&lt;T&gt;&gt;</code> es básicamente un objeto de Ruby.',
        ],
        rosetta: [
          ['El GC mantiene vivos los objetos referenciados', 'Los lifetimes prueban que las referencias siguen siendo válidas'],
          ['Atributos del modelo (pertenecen al objeto)', 'Struct con campos dueños <code>String</code> / <code>Vec</code>'],
          ['Muchas variables referenciando un objeto', '<code>Rc&lt;T&gt;</code> / <code>Arc&lt;T&gt;</code>'],
          ['Mutar un objeto compartido', '<code>Rc&lt;RefCell&lt;T&gt;&gt;</code> / <code>Arc&lt;Mutex&lt;T&gt;&gt;</code>'],
          ['<code>Mutex.new.synchronize { }</code>', '<code>mutex.lock().unwrap()</code> (se desbloquea en el drop)'],
          ['Cualquier objeto de Ruby', '≈ <code>Rc&lt;RefCell&lt;T&gt;&gt;</code> + un garbage collector'],
        ],
        gotchas: [
          'Los ciclos de <code>Rc</code> filtran memoria, porque los contadores nunca llegan a cero. Rompe los ciclos con <code>Weak</code>.',
          'Llamar a <code>borrow_mut()</code> dos veces al mismo tiempo sobre un <code>RefCell</code> hace <b>panic</b> en runtime.',
          '¿Peleando con lifetimes en un struct? Cambia el campo a un tipo dueño (<code>String</code>) y sigue adelante.',
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

    let config = Arc::new(String::from("prod")); // compartir entre hilos
    let c2 = Arc::clone(&config);
    std::thread::spawn(move || println!("{c2}")).join().unwrap();
}`,
        links: [['El Libro, cap. 10.3: Lifetimes (inglés)', 'https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html'], ['El Libro, cap. 15: Smart pointers (inglés)', 'https://doc.rust-lang.org/book/ch15-00-smart-pointers.html']],
      },
      quiz: [
        { type: 'compiles', code: 'let r;\n{\n    let x = 5;\n    r = &x;\n}\nprintln!("{r}");', answer: false, explain: '<code>x</code> se libera en la <code>}</code> interna mientras <code>r</code> todavía lo referencia: E0597.' },
        { type: 'mcq', q: '¿Qué hace la anotación <code>\'a</code> en <code>fn longest&lt;\'a&gt;(a: &amp;\'a str, b: &amp;\'a str) -&gt; &amp;\'a str</code>?', options: ['Mantiene vivos ambos strings hasta el final del programa', 'Le dice al compilador que el resultado es válido solo mientras ambas entradas lo sean', 'Copia los strings al heap', 'Hace que la función sea genérica sobre tipos de string'], answer: 1, explain: 'Las anotaciones de lifetime describen relaciones. Nunca cambian cuánto viven los valores.' },
        { type: 'fill', q: 'Agrega la declaración del parámetro de lifetime que falta.', code: "fn longest<___>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() >= b.len() { a } else { b }\n}", answers: [["'a"]], explain: 'Los parámetros de lifetime se declaran entre ángulos, igual que los tipos genéricos.' },
        { type: 'compiles', code: 'struct Post {\n    title: &str,\n}', answer: false, explain: 'Un campo referencia necesita un lifetime: <code>struct Post&lt;\'a&gt; { title: &amp;\'a str }</code>. O, la opción habitual, usa <code>String</code>.' },
        { type: 'match', q: 'Relaciona cada smart pointer con su trabajo.', pairs: [['Box<T>', 'un dueño, reservado en el heap'], ['Rc<T>', 'ownership compartido, un hilo'], ['Arc<T>', 'ownership compartido entre hilos'], ['RefCell<T>', 'mutación verificada en runtime']] },
        { type: 'mcq', q: '¿Qué pasa si llamas a <code>borrow_mut()</code> sobre un <code>RefCell</code> mientras otro <code>borrow_mut()</code> del mismo sigue vivo?', options: ['Error de compilación', 'La segunda llamada espera', 'El programa hace panic en runtime', 'Ambos préstamos funcionan'], answer: 2, explain: '<code>RefCell</code> traslada las reglas de borrowing al runtime. Romperlas produce un panic con "already borrowed".' },
      ],
      practice: [
        {
          title: 'x no vive lo suficiente',
          prompt: 'Este es el bug del inicio del video. <code>r</code> toma prestado <code>x</code>, pero <code>x</code> se libera en el <code>}</code> interior mientras <code>r</code> se sigue usando: <b>E0597</b>. Cambia el código para que <code>x</code> viva al menos tanto como <code>r</code>. Salida esperada: <code>5</code>.',
          starter: `fn main() {
    let r;
    {
        let x = 5;
        r = &x;
    }
    println!("{r}"); // ❌ E0597
}
`,
          hints: ['Una referencia nunca puede vivir más que el valor al que apunta, así que <code>x</code> debe liberarse <i>después</i> del último uso de <code>r</code>.', 'Declara <code>let x = 5;</code> <i>fuera</i> del bloque interior, antes de <code>let r;</code>.', 'Otra forma: imprime <code>r</code> dentro del bloque, antes de la llave que cierra.'],
          solution: `fn main() {
    let x = 5;
    let r;
    {
        r = &x;
    }
    println!("{r}");
}
`,
          explain: 'Ahora <code>x</code> vive en el scope exterior, más que <code>r</code>, así que el compilador puede demostrar que la referencia siempre es válida. Esa demostración es lo que es un lifetime. El otro arreglo, imprimir dentro del bloque, también funciona porque <code>r</code> nunca se usa cuando <code>x</code> ya no existe.',
        },
        {
          title: 'Arregla longest()',
          prompt: 'El compilador no puede saber de cuál entrada devuelve la referencia <code>longest</code>: <b>E0106</b>, <i>missing lifetime specifier</i>. Agrega las anotaciones de lifetime del video para que compile. Salida esperada: <code>Ruby on Rails</code>.',
          starter: `fn longest(a: &str, b: &str) -> &str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    let framework = String::from("Ruby on Rails");
    let lang = "Rust";
    println!("{}", longest(&framework, lang));
}
`,
          hints: ['Declara el lifetime entre ángulos después del nombre: <code>fn longest&lt;\'a&gt;(…)</code>.', 'Pon <code>\'a</code> en los dos parámetros y en el tipo de retorno.', 'Firma completa: <code>fn longest&lt;\'a&gt;(a: &amp;\'a str, b: &amp;\'a str) -&gt; &amp;\'a str</code>'],
          solution: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    let framework = String::from("Ruby on Rails");
    let lang = "Rust";
    println!("{}", longest(&framework, lang));
}
`,
          explain: 'La anotación dice que el resultado es válido solo mientras lo sean <b>ambas</b> entradas. No cambia cuánto vive nada, solo le explica al compilador cómo se relacionan las referencias. En <code>main</code> ambas entradas siguen vivas cuando <code>println!</code> usa el resultado, así que la verificación pasa.',
        },
        {
          title: 'Un carrito compartido',
          prompt: 'Dos sesiones, <code>alice</code> y <code>bob</code>, comparten un carrito mediante <code>Rc</code>, y el <code>RefCell</code> de adentro permite que cualquiera lo cambie. Completa los tres TODO. Salida esperada: <code>["book", "pen"]</code>.',
          starter: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    // el tipo está escrito por ti: aún no se ha hecho push, así que Rust no puede adivinarlo
    let cart: Rc<RefCell<Vec<&str>>> = Rc::new(RefCell::new(vec![]));
    let alice = Rc::clone(&cart);
    let bob = Rc::clone(&cart);

    // TODO 1: alice agrega "book"
    // TODO 2: bob agrega "pen"
    // TODO 3: imprime el carrito con {:?}
}
`,
          hints: ['Mutar a través de un <code>Rc</code> compartido pasa por el <code>RefCell</code>: <code>alice.borrow_mut().push("book");</code>', 'Haz lo mismo con <code>bob</code> y <code>"pen"</code>.', 'Para imprimir, toma prestado el carrito solo para leer: <code>println!("{:?}", cart.borrow());</code>'],
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
          explain: 'Cada <code>borrow_mut()</code> es un temporal que termina en el punto y coma, así que los dos push nunca se solapan (si se solaparan, habría panic). Tres handles <code>Rc</code> comparten un carrito: es la semántica de "objeto Ruby", pero tuviste que pedirla explícitamente.',
        },
      ],
    },
  ],
});
