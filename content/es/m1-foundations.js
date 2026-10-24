// Módulo 1 (español): espejo exacto de content/m1-foundations.js
COURSE_ES.modules.push({
  order: 1,
  id: 'm1',
  title: 'Fundamentos',
  blurb: 'Rust desde la mirada de un rubyista: por qué vale la pena, Cargo como Bundler + Rake, y cómo funcionan las variables y los tipos cuando nada es dinámico.',
  lessons: [
    // ------------------------------------------------------------------ 1.1
    {
      id: 'why-rust',
      title: '¿Por qué Rust, si vienes de Ruby?',
      subtitle: 'Qué ganas, a qué renuncias y por qué tus instintos de Rails te siguen sirviendo.',
      tags: ['intro', 'rendimiento', 'seguridad'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 1 · Lección 1', title: '¿Por qué Rust, si vienes de Ruby?',
          subtitle: 'El mismo amor por la felicidad del desarrollador. Otro trato con la máquina.',
          beats: [
            { say: 'Te damos la bienvenida a Rust para devs de Rails. Ya sabes construir aplicaciones web. Ahora vamos a enseñarle un nuevo lenguaje a tus instintos.' },
            { say: 'En esta primera lección: por qué Rust vale tu tiempo, y qué cambia cuando llegas desde Ruby.' },
          ],
        },
        {
          title: 'Dos lenguajes, dos tratos',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'cards', side: 'left', items: [{ icon: '💎', title: 'Ruby', body: 'Optimizado para la felicidad del programador. Tipos dinámicos, recolector de basura, y los problemas aparecen en tiempo de ejecución.', cls: 'ruby' }] },
            { id: 'rs', kind: 'cards', side: 'right', items: [{ icon: '🦀', title: 'Rust', body: 'Optimizado para la corrección y la velocidad. Tipos estáticos, sin recolector de basura, y los problemas aparecen al compilar.', cls: 'rust' }] },
            { id: 'q', kind: 'text', style: 'callout', html: 'Ruby confía en ti y revisa en ejecución. Rust te <em>verifica</em> antes de que el programa siquiera corra.' },
          ],
          beats: [
            { say: 'Ruby hace un trato: confía en ti, no se mete en tu camino, y atrapa los errores mientras el programa corre.', show: 'rb' },
            { say: 'Rust hace el trato contrario. El compilador revisa tu trabajo antes, así que categorías enteras de bugs nunca llegan a producción.', show: 'rs' },
            { say: 'Entonces la fricción se mueve. Dejas de depurar en producción y empiezas a negociar con el compilador.', show: 'q' },
          ],
        },
        {
          title: 'Lo que realmente obtienes',
          blocks: [
            {
              id: 'c', kind: 'cards', items: [
                { icon: '⚡', title: 'Velocidad', body: 'Compila a código nativo. A menudo de 10 a 100× más rápido que Ruby en trabajo intensivo de CPU.' },
                { icon: '🧠', title: 'Memoria', body: 'Sin GC. Las reglas de <b>ownership</b> liberan la memoria apenas deja de usarse.' },
                { icon: '🛡️', title: 'Seguridad', body: 'Nada de crashes por nil, data races ni use-after-free. Son errores de compilación.' },
                { icon: '🔧', title: 'Refactors sin miedo', body: 'Renombra un campo y el compilador te lista cada lugar que debes arreglar.' },
                { icon: '📦', title: 'Gran tooling', body: 'Cargo, rustfmt, clippy y docs.rs vienen de serie.' },
                { icon: '🚢', title: 'Un solo binario', body: 'Despliegas un único archivo binario. Sin versión de Ruby ni bundle install en el servidor.' },
              ],
            },
          ],
          beats: [
            { say: 'Esto es lo que te compra toda esa rigurosidad.', show: [] },
            { say: 'Velocidad. Rust compila a código máquina nativo. En trabajo pesado de CPU suele ser de diez a cien veces más rápido que Ruby.', show: 'c.0' },
            { say: 'Memoria. No hay recolector de basura. En su lugar, las reglas de ownership, verificadas al compilar, deciden exactamente cuándo se libera la memoria. Sin pausas de GC, y con un consumo mínimo.', show: 'c.1' },
            { say: 'Seguridad. Nada de undefined method para nil, nada de data races entre hilos. Se vuelven errores de compilación en vez de alertas a las tres de la mañana.', show: 'c.2' },
            { say: 'Refactorizar deja de dar miedo. Cambias un tipo y el compilador te entrega la lista de todo lo que rompiste.', show: 'c.3' },
            { say: 'Las herramientas son excelentes y vienen incluidas, y despliegas un solo binario autocontenido.', show: ['c.4', 'c.5'] },
          ],
        },
        {
          title: 'El nil que conoces y amas',
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
            { id: 'ok', kind: 'text', style: 'ok', html: 'Rust no tiene <code>nil</code>. Un valor que puede faltar es un <code>Option</code>, y el compilador te obliga a manejar el caso <code>None</code>.' },
          ],
          beats: [
            { say: 'Este es un bug que todo dev de Rails ha subido a producción. find by devuelve nil, y llamar a name sobre eso explota.', type: { rb: 2 } },
            { say: 'Te enteras en producción, por el rastreador de excepciones, a las tres de la mañana.', type: { rb: 'all' }, lines: { rb: [3, 4] } },
            { say: 'En Rust, una búsqueda que puede fallar devuelve un Option: o Some, con el usuario adentro, o None. No puedes meter la mano adentro sin revisar primero cuál de los dos te tocó.', type: { rs: 2 } },
            { say: 'Así que este código ni siquiera compila. El bug se detecta en tu laptop, en segundos.', type: { rs: 'all' }, lines: { rs: [3, 4] }, note: 'Vemos <code>Option</code> a fondo en el Módulo 3.' },
            { say: 'Esa es la idea central de todo el curso. Lo que Ruby revisa en ejecución, Rust lo revisa al compilar.', show: 'ok' },
          ],
        },
        {
          title: 'Dónde encaja Rust junto a Rails',
          blocks: [
            {
              id: 'b', kind: 'bullets', items: [
                { icon: '🧩', text: 'Extensiones nativas para las rutas críticas: gems como <code>magnus</code> y <code>rb-sys</code> te dejan llamar Rust desde Ruby' },
                { icon: '🛰️', text: 'Servicios de alto rendimiento: webhooks, websockets, ingesta de datos, proxies' },
                { icon: '🧰', text: 'CLIs y herramientas de desarrollo: rápidas, un solo binario, multiplataforma' },
                { icon: '⚙️', text: 'Workers en segundo plano que procesan datos: parsing, imágenes o PDFs' },
                { icon: '🌐', text: 'Aplicaciones web completas con Axum + SQLx, que construimos en el Módulo 5' },
              ],
            },
          ],
          beats: [
            { say: 'No tienes que botar Rails. Rust brilla justo a su lado.' },
            { say: 'Puedes escribir extensiones nativas para las partes críticas de una app Rails. Herramientas como magnus hacen que Rust se pueda llamar desde Ruby.', show: 'b.0' },
            { say: 'Puedes separar servicios de alto rendimiento, como receptores de webhooks o servidores de websockets.', show: 'b.1' },
            { say: 'Rust es fantástico para herramientas de línea de comandos y para workers pesados en segundo plano.', show: ['b.2', 'b.3'] },
            { say: 'Y sí, puedes construir aplicaciones web completas. En el Módulo 5 vas a construir una API JSON con Axum y SQLx.', show: 'b.4' },
          ],
        },
        {
          type: 'checkpoint', title: 'Revisión rápida',
          q: 'En Rust, ¿cuándo te enteras de que llamaste un método sobre un valor que podría faltar?',
          options: ['En ejecución, como un panic', 'Al compilar, como un error de tipos', 'Solo si escribes un test para eso', 'Nunca, Rust lo ignora en silencio'],
          answer: 1,
          explain: 'Un valor que puede faltar es un <code>Option&lt;T&gt;</code>, que es un tipo distinto de <code>T</code>, así que el compilador rechaza usarlo directamente.',
          beats: [{ say: 'Revisión rápida antes de seguir. Elige una respuesta para continuar.' }],
        },
        {
          title: 'El cambio de mentalidad',
          layout: 'center',
          blocks: [
            { id: 't', kind: 'text', style: 'big', html: 'El compilador no es tu enemigo.<br/>Es el <em>pair programmer</em><br/>que nunca se cansa.' },
            { id: 'b', kind: 'bullets', cls: 'sm', items: ['Lee los mensajes de error. Son famosos por lo buenos.', 'Espera una curva de aprendizaje con ownership. A todos nos pasa.', 'Lo que sabes de Rails sobre HTTP, SQL, testing y diseño sigue aplicando.'] },
          ],
          beats: [
            { say: 'Un cambio de mentalidad para llevar durante todo el curso.', show: 't' },
            { say: 'El compilador es tu pair programmer. Sus mensajes de error son famosos por lo útiles, muchas veces con el arreglo exacto.', show: 'b.0' },
            { say: 'Te vas a topar con una pared con el ownership. A todos nos pasa. Se supera, y lo vamos a tomar con calma.', show: 'b.1' },
            { say: 'Todo lo que sabes de aplicaciones web, HTTP, SQL, testing y diseño sigue aplicando. No partes de cero.', show: 'b.2' },
          ],
        },
      ],
      summary: {
        tldr: 'Ruby revisa tus supuestos en ejecución. Rust los revisa al compilar. Renuncias a algo de flexibilidad y ganas velocidad, poco uso de memoria, y clases enteras de bugs, como errores por nil y data races, que ya no pueden ocurrir.',
        points: [
          'Rust es compilado, de tipado estático y no tiene recolector de basura.',
          'Los bugs que Ruby reporta en ejecución, como <code>NoMethodError</code> sobre nil, son errores de compilación en Rust.',
          'Los valores que pueden faltar son <code>Option&lt;T&gt;</code>. Rust no tiene <code>nil</code>.',
          'Rust complementa a Rails: extensiones nativas, servicios rápidos, CLIs, workers o apps web completas.',
          'Trata al compilador como un pair programmer y lee sus mensajes de error.',
        ],
        rosetta: [
          ['<code>nil</code>', '<code>Option::None</code>'],
          ['<code>NoMethodError</code> en ejecución', 'Error de tipos al compilar'],
          ['Recolector de basura', 'Ownership (manejo de memoria en tiempo de compilación)'],
          ['<code>ruby app.rb</code> (interpretado)', '<code>cargo run</code> (compilado a nativo)'],
        ],
        gotchas: ['Compilar es más lento que arrancar un proceso de Ruby. Usa <code>cargo check</code> para feedback rápido.', 'No hay un flujo basado en REPL como <code>rails console</code>. Los tests pequeños y el Playground cumplen ese rol.'],
        links: [['El libro de Rust (traducción al español)', 'https://book.rustlang-es.org/'], ['The Rust Book (original en inglés)', 'https://doc.rust-lang.org/book/'], ['Rust Playground', 'https://play.rust-lang.org/'], ['magnus: bindings Ruby ↔ Rust', 'https://github.com/matsadler/magnus']],
      },
      quiz: [
        { type: 'mcq', q: '¿Qué frase describe mejor el enfoque de Rust para la memoria?', options: ['Un recolector de basura con tracing como el de Ruby', 'malloc/free manual como en C', 'Reglas de ownership verificadas al compilar', 'Conteo de referencias automático en cada valor'], answer: 2, explain: 'Rust libera la memoria de forma determinista cuando el dueño sale de scope, y hace cumplir las reglas al compilar.' },
        { type: 'mcq', q: '¿Qué usa Rust en lugar de <code>nil</code>?', options: ['<code>null</code>', '<code>Option&lt;T&gt;</code> con <code>Some</code> / <code>None</code>', '<code>undefined</code>', '<code>Nothing</code>'], answer: 1, explain: '<code>Option&lt;T&gt;</code> hace explícita la ausencia en el tipo.' },
        { type: 'compiles', q: 'Una función devuelve <code>Option&lt;User&gt;</code>. ¿Esto compila?', code: 'let user = find_by_email(&email); // Option<User>\nlet name = user.name;', answer: false, explain: '<code>user</code> es un <code>Option&lt;User&gt;</code>, que no tiene campo <code>name</code>. Primero tienes que hacer unwrap o match.' },
        { type: 'match', q: 'Une cada cosa del mundo Ruby con su equivalente en Rust.', pairs: [['nil', 'None'], ['NoMethodError en prod', 'error de compilación'], ['Recolector de basura', 'ownership'], ['Ruby + bundle install en el servidor', 'un solo binario autocontenido']], explain: 'Las cuatro aparecieron en el video. Vas a ver estas equivalencias una y otra vez.' },
        { type: 'mcq', q: '¿Cuál NO es una forma común de usar Rust junto a una app Rails?', options: ['Una extensión nativa para una ruta crítica', 'Un servicio separado de alto rendimiento', 'Reemplazar las plantillas ERB dentro de la capa de vistas de Rails en ejecución', 'Una herramienta CLI para tu equipo'], answer: 2, explain: 'Rust vive al lado de Rails como extensiones, servicios o herramientas. No se mete en el renderizado de ERB.' },
      ],
      practice: [
        {
          title: 'Hola, Rustacean',
          prompt: 'Todavía no hay nada que escribir: esta es tu primera ejecución y el programa ya está completo. Presiona <b>Ejecutar en Rust Playground</b> y busca la salida debajo del código. Luego cambia el texto entre comillas de <code>"dev de Rails"</code> por tu propio nombre y ejecútalo otra vez. Salida esperada: <code>¡Hola, dev de Rails! Te damos la bienvenida a Rust 🦀</code>, con tu nombre la segunda vez. <code>println!</code> termina en <code>!</code> porque es una <i>macro</i>; pronto veremos qué significa eso.',
          starter: `fn main() {
    let name = "dev de Rails";
    println!("¡Hola, {}! Te damos la bienvenida a Rust 🦀", name);
}
`,
          hints: ['El botón de ejecutar abre play.rust-lang.org en una pestaña nueva con tu código ya pegado. Presiona el botón azul <b>Run</b> ahí y la salida aparece abajo.', '<code>{}</code> dentro del texto es un marcador: <code>println!</code> lo rellena con el valor de <code>name</code>, como <code>#{name}</code> en un string de Ruby. Solo necesitas editar lo que está entre comillas en la línea de <code>let name</code>.'],
          solution: `fn main() {
    let name = "Benjamin";
    println!("¡Hola, {}! Te damos la bienvenida a Rust 🦀", name);
}
`,
          explain: 'Acabas de ejecutar Rust. <code>let name = ...</code> crea una variable y <code>{}</code> la imprime dentro del mensaje. La lección 3 explica <code>let</code> a fondo, incluida una forma más corta, <code>{name}</code>, que hace el mismo trabajo.',
        },
      ],
    },

    // ------------------------------------------------------------------ 1.2
    {
      id: 'cargo',
      title: 'Cargo es Bundler + Rake + más',
      subtitle: 'Proyectos, dependencias y comandos, mapeados desde las herramientas que usas a diario.',
      tags: ['cargo', 'crates', 'herramientas', 'bundler', 'gemfile'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 1 · Lección 2', title: 'Cargo es Bundler + Rake + más',
          subtitle: 'Una sola herramienta para crear, compilar, testear, documentar y publicar.',
          beats: [{ say: 'En Ruby haces malabares con varias herramientas: rails new, bundler, rake, rspec, rubocop. En Rust, una sola herramienta hace casi todo. Cargo.' }],
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
              { icon: '📄', text: '<code>Cargo.toml</code> es tu Gemfile más tu gemspec' },
              { icon: '🚪', text: '<code>src/main.rs</code> es el punto de entrada, <code>fn main()</code>' },
              { icon: '🔒', text: '<code>Cargo.lock</code> es el Gemfile.lock, se crea en el primer build' },
              { icon: '🗂️', text: '<code>target/</code> guarda lo compilado. Ignóralo en git' },
            ] },
          ],
          beats: [
            { say: 'Donde escribirías rails new, escribes cargo new. Crea el esqueleto del proyecto e inicializa un repo de git.', type: { t: 2 } },
            { say: 'El resultado es mínimo. Un archivo manifiesto y una carpeta de código con un solo archivo.', type: { t: 'all' } },
            { say: 'Cargo punto toml cumple el rol de tu Gemfile y tu gemspec juntos.', show: 'b.0', lines: { t: [5] } },
            { say: 'Main punto r s es el punto de entrada. La ejecución parte en la función llamada main.', show: 'b.1', lines: { t: [7] } },
            { say: 'Después del primer build también tienes Cargo punto lock, el equivalente de Gemfile punto lock, y una carpeta target con lo compilado.', show: ['b.2', 'b.3'] },
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
            { say: 'Pongamos un Gemfile al lado de un manifiesto de Cargo.', type: { g: 'all' } },
            { say: 'La sección package describe tu crate: su nombre, versión y la edición de Rust, que es algo así como apuntar a una versión de Ruby.', type: { c: 4 }, lines: { c: [1, 2, 3, 4] } },
            { say: 'Las dependencias son tus gems. Los paquetes se llaman crates, y viven en crates punto io en vez de rubygems.', type: { c: 9 }, lines: { c: [6, 7, 8, 9], g: [3, 4, 5] } },
            { say: 'Las features son muy importantes en Rust. Activan o desactivan partes opcionales de un crate al compilar, así solo compilas lo que usas.', lines: { c: [8, 9] }, note: 'La versión <code>"0.8"</code> significa <code>^0.8</code>, muy parecido a <code>~&gt;</code> en Bundler.' },
            { say: 'Y las dev dependencies son tu grupo de development y test.', type: { c: 'all' }, lines: { c: [11, 12], g: [7, 8, 9] } },
          ],
        },
        {
          title: 'Tus comandos de cada día',
          blocks: [
            {
              id: 't', kind: 'table', head: ['Ruby / Rails', 'Cargo', 'Qué hace'], rows: [
                ['<code>bundle add pg</code>', '<code>cargo add sqlx</code>', 'Agregar una dependencia'],
                ['<code>bundle install</code>', '<i>(automático)</i>', 'Descarga deps al compilar'],
                ['<code>ruby app.rb</code>', '<code>cargo run</code>', 'Compilar y ejecutar'],
                ['<i>(sin equivalente)</i>', '<code>cargo check</code>', 'Revisar tipos rápido, sin binario'],
                ['<code>rspec</code> / <code>rails test</code>', '<code>cargo test</code>', 'Correr los tests'],
                ['<code>rubocop -a</code>', '<code>cargo fmt</code> + <code>cargo clippy</code>', 'Formatear y lintear'],
                ['<code>yard doc</code>', '<code>cargo doc --open</code>', 'Generar documentación'],
              ],
            },
          ],
          beats: [
            { say: 'Estos son los comandos que vas a escribir todos los días, junto a sus equivalentes en Ruby.' },
            { say: 'cargo add agrega una dependencia, como bundle add. No hay un paso de install aparte, porque Cargo descarga las dependencias al compilar.', show: ['t.0', 't.1'] },
            { say: 'cargo run compila y ejecuta tu programa.', show: 't.2' },
            { say: 'cargo check es tu nuevo mejor amigo. Revisa los tipos sin producir un binario, así que es mucho más rápido. Úsalo todo el tiempo.', show: 't.3', hl: ['t.3'] },
            { say: 'cargo test corre tus tests. No necesitas ninguna gem extra.', show: 't.4' },
            { say: 'cargo fmt formatea tu código, clippy le pasa el linter, y cargo doc genera documentación navegable de tu proyecto y de cada dependencia.', show: ['t.5', 't.6'] },
          ],
        },
        {
          title: 'Builds de debug vs release',
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
              { icon: '🐢', title: 'dev', body: 'Compila rápido, corre lento. Tiene chequeos de overflow e info de debug.' },
              { icon: '🚀', title: 'release', body: 'Compila más lento, totalmente optimizado. Es lo que despliegas.', cls: 'rust' },
            ] },
          ],
          beats: [
            { say: 'Hay un concepto que Ruby no tiene: los perfiles de build.', type: { t: 4 } },
            { say: 'Por defecto obtienes un build de debug. Compila rápido pero corre más lento, con chequeos de seguridad extra.', show: 'c.0', lines: { t: [3] } },
            { say: 'Agrega guion guion release para un build optimizado. Siempre mide y despliega en modo release. Los builds de debug pueden ser diez veces más lentos.', type: { t: 'all' }, show: 'c.1', lines: { t: [5, 6, 7] }, note: 'Desplegar una app Rust = copiar un binario desde <code>target/release</code>.' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'Quieres feedback rápido sobre errores de tipos mientras editas, sin esperar un build completo. ¿Qué comando usas?',
          options: ['<code>cargo run --release</code>', '<code>cargo check</code>', '<code>cargo doc</code>', '<code>cargo publish</code>'],
          answer: 1,
          explain: '<code>cargo check</code> corre la primera parte del compilador, incluido el chequeo de tipos y el borrow checker, pero se salta la generación de código.',
          beats: [{ say: 'Checkpoint. ¿Qué comando te da el ciclo de feedback más rápido?' }],
        },
        {
          title: 'Workspaces ≈ un monorepo de engines',
          blocks: [
            { id: 'c', kind: 'code', lang: 'toml', label: 'Cargo.toml (raíz)', code: `[workspace]
members = ["api", "core", "worker"]
resolver = "2"` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: ['Como una app Rails con engines o packs de packwerk: varios crates, un lockfile, un <code>target/</code>', '<code>cargo test --workspace</code> testea todo; <code>-p api</code> apunta a un solo crate', 'Los crates de librería tienen <code>src/lib.rs</code>; los binarios tienen <code>src/main.rs</code>'] },
          ],
          beats: [
            { say: 'Cuando las apps crecen, los equipos de Rails recurren a engines o a packwerk. Rust tiene workspaces.', type: { c: 'all' } },
            { say: 'Un workspace agrupa varios crates bajo un solo lockfile y una sola carpeta de build.', show: 'b.0' },
            { say: 'Puedes testearlos todos a la vez, o apuntar a un solo paquete con guion p.', show: 'b.1' },
            { say: 'El código compartido va en crates de librería con un lib punto r s, y los ejecutables tienen un main punto r s.', show: 'b.2' },
          ],
        },
      ],
      summary: {
        tldr: 'Cargo reemplaza a <code>rails new</code>, Bundler, Rake, el test runner, el formateador y el generador de docs. <code>Cargo.toml</code> es tu Gemfile. Los crates son gems. Usa <code>cargo check</code> para feedback rápido, y despliega builds con <code>--release</code>.',
        points: [
          '<code>cargo new</code> crea un proyecto con <code>Cargo.toml</code> y <code>src/main.rs</code>.',
          '<code>Cargo.toml</code> ≈ Gemfile + gemspec, y <code>Cargo.lock</code> ≈ Gemfile.lock. Los paquetes son <b>crates</b> en crates.io.',
          'Las <b>features</b> activan partes opcionales de un crate al compilar.',
          '<code>cargo check</code> es el ciclo de feedback más rápido. <code>cargo run</code>, <code>test</code>, <code>fmt</code>, <code>clippy</code> y <code>doc</code> cubren el resto.',
          'Los builds de debug son para desarrollar. Mide y despliega con <code>--release</code>.',
        ],
        rosetta: [
          ['<code>rails new app</code>', '<code>cargo new app</code>'],
          ['Gemfile / gemspec', '<code>Cargo.toml</code>'],
          ['Gemfile.lock', '<code>Cargo.lock</code>'],
          ['gem (rubygems.org)', 'crate (crates.io)'],
          ['<code>bundle add x</code>', '<code>cargo add x</code>'],
          ['<code>group :development, :test</code>', '<code>[dev-dependencies]</code>'],
          ['<code>rubocop</code>', '<code>cargo fmt</code> + <code>cargo clippy</code>'],
          ['Engines de Rails / packwerk', 'Workspaces de Cargo'],
        ],
        gotchas: ['Haz commit de <code>Cargo.lock</code> en aplicaciones, igual que con Gemfile.lock.', 'No midas el rendimiento de builds de debug. Esos números no significan nada.', 'Un crate con guion, como <code>tower-http</code>, se importa con guion bajo: <code>use tower_http::...</code>.'],
        code: `$ cargo new blog && cd blog
$ cargo add serde --features derive
$ cargo check      # revisión de tipos rápida
$ cargo run        # compilar + ejecutar (debug)
$ cargo test       # correr los tests
$ cargo clippy     # lint
$ cargo build --release`,
        lang: 'shell',
        links: [['The Cargo Book', 'https://doc.rust-lang.org/cargo/'], ['crates.io', 'https://crates.io'], ['lib.rs (índice curado de crates)', 'https://lib.rs']],
      },
      quiz: [
        { type: 'match', q: 'Une cada herramienta de Ruby con su equivalente en Cargo.', pairs: [['Gemfile', 'Cargo.toml'], ['Gemfile.lock', 'Cargo.lock'], ['bundle add', 'cargo add'], ['rubocop', 'cargo clippy'], ['rspec', 'cargo test']] },
        { type: 'mcq', q: '¿Qué hace <code>cargo check</code>?', options: ['Descarga y verifica los checksums de las dependencias', 'Revisa tipos y borrows sin producir un binario', 'Corre la suite de tests', 'Busca crates desactualizados'], answer: 1, explain: 'Se salta la generación de código, así que es mucho más rápido que <code>cargo build</code>.' },
        { type: 'fill', q: 'Completa el manifiesto para que <code>serde</code> sea una dependencia normal y <code>mockall</code> solo de tests.', lang: 'toml', code: '[___]\nserde = "1"\n\n[___]\nmockall = "0.13"', answers: [['dependencies'], ['dev-dependencies']], explain: '<code>[dev-dependencies]</code> funciona como el grupo <code>:development, :test</code> de Bundler.' },
        { type: 'mcq', q: 'Tu API en Rust se siente lenta en una prueba de carga. ¿Qué revisas primero?', options: ['Si necesitas un JIT', 'Si se compiló con <code>--release</code>', 'Si el GC está bien ajustado', 'Si corriste <code>bundle install</code>'], answer: 1, explain: 'Los builds de debug no aplican optimizaciones y pueden ser muchísimo más lentos.' },
        { type: 'order', q: 'Ordena el flujo típico de un proyecto nuevo.', items: ['cargo new my_api', 'cargo add axum tokio', 'cargo check', 'cargo test', 'cargo build --release'], explain: 'Crear el esqueleto, agregar deps, iterar con check, testear y luego compilar para release.' },
      ],
      practice: [
        {
          title: 'Usa un crate (serde_json)',
          prompt: 'En un proyecto real correrías <code>cargo add serde_json</code>. Eso agrega una línea bajo <code>[dependencies]</code> en <code>Cargo.toml</code>, igual que las líneas de <code>axum</code> y <code>tokio</code> de la lección. El Playground ya trae este crate, así que aquí solo lo usas. El programa construye un objeto JSON con la macro <code>json!</code> (ya está hecho). Tu trabajo es cambiar dos valores: <code>"TODO"</code> pasa a ser <code>"Hola Cargo"</code> y <code>false</code> pasa a ser <code>true</code>. Salida esperada: un objeto JSON que contiene <code>"title":"Hola Cargo"</code>, <code>"published":true</code> y los tags (las claves pueden salir en cualquier orden). Las dos últimas líneas son una autoverificación ya incluida: hacen panic hasta que los dos valores estén bien.',
          starter: `// Proyecto real: cargo add serde_json pone esto en Cargo.toml:
//   [dependencies]
//   serde_json = "1"
// El Playground ya trae serde_json, así que aquí no hay nada que instalar.
use serde_json::json;

fn main() {
    let post = json!({
        "title": "TODO",        // TODO 1: cámbialo por "Hola Cargo"
        "published": false,     // TODO 2: cámbialo por true
        "tags": ["rails", "rust"]
    });

    println!("{}", post);

    // Autoverificación incluida: hace panic hasta que los dos valores de arriba estén bien.
    assert_eq!(post["title"], "Hola Cargo");
    assert_eq!(post["published"], true);
}
`,
          hints: ['El comentario de arriba es la línea de <code>Cargo.toml</code> de la lección: los crates son gems y <code>[dependencies]</code> es tu Gemfile. <code>use serde_json::json;</code> es la versión en Rust de <code>require</code>: deja disponible la macro <code>json!</code> en este archivo.', 'Edita los valores dentro de <code>json!({ ... })</code>. El texto va entre comillas dobles, mientras que <code>true</code> y <code>false</code> se escriben sin comillas, igual que en JSON.', 'Si ves <code>assertion `left == right` failed</code>, algún valor sigue mal. <code>left</code> es lo que tiene tu programa y <code>right</code> es lo que espera, así que <code>left: String("TODO")</code> significa que el título sigue siendo <code>"TODO"</code>. La respuesta: <code>"title": "Hola Cargo"</code> y <code>"published": true</code>.'],
          solution: `// Proyecto real: cargo add serde_json pone esto en Cargo.toml:
//   [dependencies]
//   serde_json = "1"
// El Playground ya trae serde_json, así que aquí no hay nada que instalar.
use serde_json::json;

fn main() {
    let post = json!({
        "title": "Hola Cargo",
        "published": true,
        "tags": ["rails", "rust"]
    });

    println!("{}", post);

    // Autoverificación incluida: hace panic hasta que los dos valores de arriba estén bien.
    assert_eq!(post["title"], "Hola Cargo");
    assert_eq!(post["published"], true);
}
`,
          explain: '<code>json!</code> construye un valor JSON a partir de sintaxis literal, y <code>post["title"]</code> lee un campo, algo parecido a <code>post[:title]</code> en Ruby. Lo importante para esta lección es cómo llegó el crate hasta aquí: una línea bajo <code>[dependencies]</code> (escrita por <code>cargo add</code>), y Cargo lo descarga y lo compila la primera vez que corres <code>cargo run</code>. Las próximas lecciones enseñan la sintaxis de Rust que lo rodea.',
        },
      ],
    },

    // ------------------------------------------------------------------ 1.3
    {
      id: 'variables-types',
      title: 'Variables, mutabilidad y tipos',
      subtitle: 'let, mut, shadowing y el sistema de tipos en el que Ruby nunca te hizo pensar.',
      tags: ['let', 'mut', 'tipos', 'shadowing', 'enteros', 'funciones'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 1 · Lección 3', title: 'Variables, mutabilidad y tipos',
          subtitle: 'Inmutable por defecto. Siempre tipado. Casi siempre inferido.',
          beats: [{ say: 'En Ruby, cualquier variable se puede reasignar a cualquier cosa en cualquier momento. Rust es más estricto, y eso resulta ser una ventaja.' }],
        },
        {
          title: 'Inmutable por defecto',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `count = 1
count += 1          # bien
count = "two"       # ¿¡también bien!?` },
            { id: 'rs', kind: 'code', lang: 'rust', code: `let count = 1;
count += 1;         // ❌ no se puede asignar dos veces

let mut total = 1;
total += 1;         // ✅ mutable explícitamente
total = "two";      // ❌ se esperaba un entero` },
            { id: 'e', kind: 'text', style: 'err', html: '<b>error[E0384]</b>: cannot assign twice to immutable variable `count`\n  help: consider making this binding mutable: `let mut count = 1;`' },
          ],
          beats: [
            { say: 'En Ruby, las variables son mutables y no tienen tipo. Hasta puedes convertir un número en un string.', type: { rb: 'all' } },
            { say: 'En Rust declaras variables con let, y son inmutables por defecto.', type: { rs: 2 } },
            { say: 'Si intentas reasignar una, el compilador te detiene, y te dice exactamente cómo arreglarlo.', show: 'e', lines: { rs: [2] } },
            { say: 'Agrega la palabra mut cuando de verdad quieras cambiar un valor. La mutación se vuelve visible e intencional.', type: { rs: 5 }, lines: { rs: [4, 5] } },
            { say: 'Pero incluso una variable mutable mantiene su tipo. Si total es un entero, sigue siendo un entero.', type: { rs: 'all' }, lines: { rs: [6] }, note: 'Piénsalo como si cada variable tuviera <code>.freeze</code> a menos que digas <code>mut</code>.' },
          ],
        },
        {
          title: 'Inferencia de tipos: tipos sin tipearlos',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', code: `let name = "Ada";              // &str
let age = 36;                  // i32 (entero por defecto)
let ratio = 0.75;              // f64 (float por defecto)
let admin = true;              // bool
let ids = vec![1, 2, 3];       // Vec<i32>

let port: u16 = 3000;          // anota cuando quieras
let big = 10_000_000_000_i64;  // o usa un sufijo` },
          ],
          beats: [
            { say: 'Rust tiene tipado estático, pero rara vez escribes los tipos de las variables locales. El compilador los infiere.', type: { c: 5 } },
            { say: 'Un literal de string es un string slice. Los números enteros son i treinta y dos por defecto, y los decimales f sesenta y cuatro.', lines: { c: [1, 2, 3] } },
            { say: 'Puedes anotar tipos con dos puntos cuando quieras ser específico, o cuando el compilador no puede deducirlo.', type: { c: 'all' }, lines: { c: [7] } },
            { say: 'Los literales numéricos aceptan un sufijo de tipo, y los guiones bajos hacen legibles los números grandes, igual que en Ruby.', lines: { c: [8] } },
          ],
        },
        {
          title: 'Ruby tiene Integer. Rust tiene… unos cuantos.',
          blocks: [
            {
              id: 't', kind: 'table', head: ['Tipo', 'Rango', 'Úsalo para'], rows: [
                ['<code>i32</code>', '±2.100 millones', 'Entero por defecto'],
                ['<code>i64</code>', '±9,2 trillones', 'Ids <code>bigint</code> de la base de datos'],
                ['<code>u8</code> / <code>u16</code> / <code>u32</code> / <code>u64</code>', '0 … 2ⁿ−1', 'Valores nunca negativos (bytes, puertos, conteos)'],
                ['<code>usize</code>', 'tamaño de puntero', 'Índices y largos (<code>vec.len()</code>)'],
                ['<code>f64</code>', 'doble precisión', 'Floats. ¡Nunca para dinero!'],
              ], cls: 'sm',
            },
            { id: 'n', kind: 'text', style: 'callout', html: 'Los enteros de Ruby crecen en silencio a bignums. Los de Rust tienen un <em>tamaño fijo</em>. El overflow hace panic en debug y da la vuelta en release.' },
          ],
          beats: [
            { say: 'Ruby tiene una sola clase Integer que crece en silencio todo lo que necesite. Rust te hace elegir un tamaño.', show: [] },
            { say: 'i treinta y dos es el tipo por defecto. i sesenta y cuatro es el que quieres para ids bigint de la base de datos, como las llaves primarias de Rails.', show: ['t.0', 't.1'] },
            { say: 'Los tipos u no tienen signo y no pueden ser negativos. Son ideales para puertos, bytes y conteos.', show: 't.2' },
            { say: 'usize es el tipo para índices y largos. Lo vas a ver en todas partes con los vectores.', show: 't.3' },
            { say: 'Y f sesenta y cuatro para floats. Igual que en Rails, nunca guardes dinero en un float. Usa centavos enteros o un crate de decimales.', show: 't.4' },
            { say: 'Como los tamaños son fijos, el overflow es posible. Los builds de debug hacen panic con el overflow, así lo atrapas mientras desarrollas.', show: 'n' },
          ],
        },
        {
          title: 'Shadowing: volver a hacer let, no reasignar',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', code: `let input = "  42  ";           // &str de un param del form
let input = input.trim();        // sigue siendo &str, nuevo binding
let input: i64 = input.parse()?; // ¡ahora es un i64!

println!("{}", input + 1);       // 43` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: ['Cada <code>let</code> crea una variable <b>nueva</b> que oculta a la anterior', 'El tipo puede cambiar, a diferencia de <code>mut</code>', 'Ideal para transformaciones paso a paso, como params → limpios → parseados'] },
          ],
          beats: [
            { say: 'Este es un modismo de Rust que sorprende a los recién llegados: el shadowing.', type: { c: 1 } },
            { say: 'Puedes declarar una variable nueva con el mismo nombre usando let otra vez. La nueva oculta a la anterior.', type: { c: 2 }, show: 'b.0' },
            { say: 'A diferencia de mut, el shadowing puede cambiar el tipo. Aquí un string se convierte en un entero de sesenta y cuatro bits.', type: { c: 3 }, show: 'b.1', lines: { c: [3] }, note: 'El <code>?</code> propaga el error si el parseo falla. Más en el Módulo 4.' },
            { say: 'Se lee como un pipeline de transformaciones, muy parecido a cómo limpiarías params en un controller de Rails.', type: { c: 'all' }, show: 'b.2' },
          ],
        },
        {
          title: 'Funciones: tipos en el borde',
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
    cents * (100 - pct) / 100   // sin punto y coma = return
}` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Como en Ruby, la <em>última expresión</em> es el valor de retorno. Agrega un <code>;</code> y se vuelve una sentencia que devuelve <code>()</code>.' },
          ],
          beats: [
            { say: 'Dentro de las funciones, los tipos se infieren. Pero las firmas de las funciones siempre declaran sus tipos.', type: { rb: 'all' } },
            { say: 'Los parámetros se anotan con dos puntos, y el tipo de retorno va después de una flecha.', type: { rs: 3 }, lines: { rs: [1] } },
            { say: 'format con signo de exclamación es una macro. Funciona como la interpolación de strings.', lines: { rs: [2] } },
            { say: 'Buena noticia para los rubyistas: la última expresión es el valor de retorno, igual que en Ruby. No necesitas la palabra return.', type: { rs: 'all' }, lines: { rs: [6] } },
            { say: 'Un detalle: un punto y coma al final convierte una expresión en una sentencia. Es un error clásico de principiante.', show: 'n' },
          ],
        },
        {
          type: 'checkpoint',
          q: '¿Qué línea no compila?',
          code: `let a = 5;          // línea 1
let a = a * 2;      // línea 2
let mut b = 1;      // línea 3
b = b + a;          // línea 4
a = 0;              // línea 5`,
          options: ['Línea 2', 'Línea 4', 'Línea 5', 'Ninguna, todo compila'],
          answer: 2,
          explain: 'La línea 2 es shadowing, y está permitido. <code>b</code> es <code>mut</code>, así que la línea 4 está bien. Pero <code>a</code> nunca se declaró <code>mut</code>, así que la línea 5 se rechaza.',
          beats: [{ say: '¡Checkpoint! Lee con cuidado: ¿shadowing, mutación, o ninguna de las dos?' }],
        },
        {
          title: 'Constantes que de verdad son constantes',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', code: `MAX_UPLOAD = 10 * 1024 * 1024
API_VERSION = "v2"
MAX_UPLOAD = 5  # warning: already
                # initialized constant` },
            { id: 'rs', kind: 'code', lang: 'rust', code: `const MAX_UPLOAD: usize = 10 * 1024 * 1024;
const API_VERSION: &str = "v2";

// realmente inmutable, se inserta al compilar
// la anotación de tipo es obligatoria` },
          ],
          beats: [
            { say: 'Las constantes de Ruby no son realmente constantes. Reasignar una solo te da un warning.', type: { rb: 'all' }, lines: { rb: [3, 4] } },
            { say: 'Las constantes de Rust usan const, van en mayúsculas con guiones bajos como en Ruby, y siempre deben tener anotación de tipo.', type: { rs: 2 } },
            { say: 'Se evalúan al compilar y nunca pueden cambiar. Constante de verdad significa constante.', type: { rs: 'all' } },
          ],
        },
      ],
      summary: {
        tldr: 'Las variables son inmutables por defecto (<code>let</code>). Para poder cambiarlas usas <code>let mut</code>. Los tipos locales se infieren pero quedan fijos, así que una variable no puede cambiar de tipo a menos que la <i>ocultes</i> (shadowing) con un nuevo <code>let</code>. Las firmas de funciones siempre declaran sus tipos, y la última expresión es el valor de retorno, como en Ruby.',
        points: [
          'Los bindings <code>let</code> son inmutables. <code>let mut</code> te deja cambiarlos, pero nunca su tipo.',
          'Los tipos locales se infieren. Los parámetros y tipos de retorno siempre se escriben.',
          'Los enteros tienen tamaño fijo: <code>i32</code> por defecto, <code>i64</code> para ids de BD, <code>usize</code> para índices.',
          'El shadowing (<code>let x = ...</code> otra vez) crea una variable nueva y puede cambiar su tipo.',
          'La última expresión sin <code>;</code> es el valor de retorno, como en Ruby.',
        ],
        rosetta: [
          ['<code>x = 1</code> (siempre mutable)', '<code>let x = 1;</code> (inmutable) / <code>let mut x = 1;</code>'],
          ['<code>obj.freeze</code>', 'Lo normal para cada <code>let</code>'],
          ['<code>Integer</code> (bignum automático)', '<code>i32</code>, <code>i64</code>, <code>u64</code>, <code>usize</code>, … (tamaño fijo)'],
          ['<code>"#{a} #{b}"</code>', '<code>format!("{a} {b}")</code>'],
          ['<code>def f(a, b)</code>', '<code>fn f(a: T, b: U) -> R</code>'],
          ['Retorno implícito de la última expresión', '¡Igual! (sin <code>;</code> al final)'],
          ['<code>CONST = 1</code> (reasignable con warning)', '<code>const CONST: i32 = 1;</code>'],
        ],
        gotchas: ['Un <code>;</code> al final de la última línea hace que la función devuelva <code>()</code>, y te da un error de "mismatched types".', 'La división entera trunca: <code>7 / 2 == 3</code>, como en Ruby.', 'Rust no tiene conversión numérica implícita. Usa <code>x as i64</code> o <code>i64::from(x)</code>.'],
        code: `const MAX: u32 = 100;

fn main() {
    let name = "Ada";            // inmutable, &str inferido
    let mut visits: u32 = 0;     // mutable, anotado
    visits += 1;
    let visits = visits.to_string(); // shadow: u32 -> String
    println!("{name}: {visits}/{MAX}");
}`,
        links: [['The Book, cap. 3: Conceptos comunes', 'https://doc.rust-lang.org/book/ch03-00-common-programming-concepts.html']],
      },
      quiz: [
        { type: 'compiles', code: 'let total = 10;\ntotal = total + 5;', answer: false, explain: '<code>total</code> es inmutable. Necesitas <code>let mut total</code>, o hacer shadowing con <code>let total = total + 5;</code>.' },
        { type: 'compiles', code: 'let total = 5;\nlet total = format!("{total} items");\nprintln!("{}", total);', answer: true, explain: 'Cada <code>let</code> crea una variable nueva, así que el shadowing puede cambiar el tipo: <code>total</code> pasa de entero a <code>String</code>. Con <code>mut</code> eso sería rechazado.' },
        { type: 'fill', q: 'Haz que esta función compile y devuelva la suma.', code: 'fn add(a: i32, b: i32) ___ i32 {\n    ___\n}', answers: [['->'], ['a + b', 'b + a', 'return a + b;', 'return a + b']], explain: 'El tipo de retorno va después de <code>-&gt;</code>. El cuerpo es solo la expresión <code>a + b</code>, <b>sin</b> punto y coma.' },
        { type: 'mcq', q: '¿Qué tipo usarías para una llave primaria <code>bigint</code> de Rails?', options: ['<code>i32</code>', '<code>i64</code>', '<code>usize</code>', '<code>f64</code>'], answer: 1, explain: 'El <code>bigint</code> de Postgres es un entero con signo de 64 bits, o sea <code>i64</code>.' },
        { type: 'mcq', q: '¿Qué devuelve esto?', code: 'fn double(x: i32) -> i32 {\n    x * 2;\n}', options: ['<code>x * 2</code>', '<code>0</code>', 'Nada. Es un error de compilación: expected i32, found ()', '<code>nil</code>'], answer: 2, explain: 'El punto y coma convierte <code>x * 2</code> en una sentencia, así que el cuerpo evalúa a <code>()</code>.' },
      ],
      practice: [
        {
          title: 'Calculadora de precios',
          prompt: 'Completa el cuerpo de <code>price_with_tax</code> para que devuelva el precio con impuesto, en <b>centavos enteros</b> (sin floats). Mira la función <code>discount</code> del video: tiene la misma forma. 1999 centavos con 19% de impuesto deben imprimir <code>Total: 2378 centavos</code> (la división entera descarta la fracción). La línea <code>assert_eq!</code> del final es una autoverificación ya incluida: hace panic hasta que tu función esté bien.',
          starter: `fn price_with_tax(cents: u64, tax_pct: u64) -> u64 {
    // TODO: devuelve el precio con impuesto, en centavos enteros
    0
}

fn main() {
    let total = price_with_tax(1999, 19);
    println!("Total: {} centavos", total);
    // Autoverificación incluida: hace panic hasta que tu función esté bien.
    assert_eq!(total, 2378);
}
`,
          hints: ['Tiene la misma forma que <code>discount</code> en el video: <code>cents * (100 - pct) / 100</code>. Aquí el impuesto se suma en lugar de restarse.', 'Usa <code>100 + tax_pct</code> en lugar de <code>100 - pct</code>: <code>cents * (100 + tax_pct) / 100</code>.', 'La última expresión de una función es su valor de retorno, así que escríbela <b>sin</b> punto y coma, y borra el <code>0</code> de relleno.'],
          solution: `fn price_with_tax(cents: u64, tax_pct: u64) -> u64 {
    cents * (100 + tax_pct) / 100
}

fn main() {
    let total = price_with_tax(1999, 19);
    println!("Total: {} centavos", total);
    // Autoverificación incluida: hace panic hasta que tu función esté bien.
    assert_eq!(total, 2378);
}
`,
          explain: '1999 × 119 / 100 = 2378 (la división entera trunca 2378,81). En una app real elegirías una estrategia de redondeo a propósito.',
        },
        {
          title: 'Pipeline con shadowing',
          prompt: 'Un formulario envía <code>"  25  "</code> con espacios alrededor. Usa shadowing para limpiarlo y mostrar la cantidad como texto. Hay dos TODO pequeños: (1) haz shadowing de <code>qty</code> con su versión sin espacios, y (2) después de que el número ya fue parseado e incrementado (ya está hecho), haz shadowing una vez más hacia un <code>String</code> usando <code>format!</code>. Salida esperada: <code>26 unidades</code>. La línea con <code>.parse().unwrap()</code> ya viene hecha: <code>parse</code> convierte texto en número (viste <code>parse()?</code> en el video, y <code>unwrap()</code> es su primo más simple que se cae cuando el texto no es un número; el Módulo 4 explica ambos). Mientras no hagas el TODO 1, el programa hace panic con <code>ParseIntError</code>, porque los espacios impiden que el texto sea un número.',
          starter: `fn main() {
    let qty = "  25  "; // valor crudo de un param de formulario

    // TODO 1: haz shadowing de qty con el texto sin espacios (qty.trim())

    let qty: u32 = qty.parse().unwrap(); // ya hecho: convierte el texto en número
    let qty = qty + 1;

    // TODO 2: haz shadowing de qty otra vez, hacia un String como "26 unidades" (format!)

    println!("{}", qty); // debería imprimir: 26 unidades
}
`,
          hints: ['El shadowing es solo otro <code>let</code> con el mismo nombre, como en el video: <code>let input = input.trim();</code>.', 'El TODO 1 es <code>let qty = qty.trim();</code>. Cuando lo pongas, el panic desaparece y el programa imprime <code>26</code>.', 'El TODO 2 funciona como <code>format!("{first} {last}")</code> en el video: <code>let qty = format!("{qty} unidades");</code>. El tipo cambia de número a <code>String</code>, y eso se permite porque es una variable nueva.'],
          solution: `fn main() {
    let qty = "  25  "; // valor crudo de un param de formulario

    let qty = qty.trim();

    let qty: u32 = qty.parse().unwrap(); // ya hecho: convierte el texto en número
    let qty = qty + 1;

    let qty = format!("{qty} unidades");

    println!("{}", qty); // debería imprimir: 26 unidades
}
`,
          explain: 'El mismo nombre termina guardando un <code>&amp;str</code>, luego un <code>u32</code> y luego un <code>String</code>. Eso solo es posible con shadowing: una variable <code>mut</code> conserva su tipo.',
        },
      ],
    },
  ],
});
