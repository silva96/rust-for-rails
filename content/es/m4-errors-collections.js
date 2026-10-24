// Módulo 4: Errores, Strings y Colecciones. Espejo en español de content/m4-errors-collections.js.
COURSE_ES.modules.push({
  order: 4,
  id: 'm4',
  title: 'Errores, Strings y Colecciones',
  blurb: 'Lo del día a día: rescue se convierte en Result y ?, el único String de Ruby se convierte en String y &amp;str, y Enumerable se convierte en iterators de costo cero.',
  lessons: [
    // ------------------------------------------------------------------ 4.1
    {
      id: 'result-errors',
      title: 'Result y ? (rescue, pero tipado)',
      subtitle: 'Los errores son valores que retornas, y el operador ? los propaga con un solo carácter.',
      tags: ['result', 'errores', 'rescue', 'raise', 'unwrap', 'expect', 'thiserror', 'anyhow', 'panic'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 4 · Lección 1', title: 'Result y ? (rescue, pero tipado)',
          subtitle: 'Sin excepciones. El fallo es parte del tipo de retorno.',
          beats: [
            { say: 'En Ruby, cualquier cosa puede lanzar una excepción, y te enteras leyendo la documentación o cuando te despiertan de madrugada.' },
            { say: 'Rust no tiene excepciones. Una función que puede fallar lo dice en su firma, y el compilador se asegura de que lo manejes.' },
          ],
        },
        {
          title: 'raise / rescue → Result',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'age.rb', size: 16, code: `def parse_age(str)
  Integer(str)
rescue ArgumentError => e
  puts "inválido: #{e.message}"
  nil
end

parse_age("abc")  # => nil` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'age.rs', size: 16, code: `use std::num::ParseIntError;

fn parse_age(s: &str) -> Result<u8, ParseIntError> {
    s.parse::<u8>()
}

match parse_age("abc") {
    Ok(age) => println!("edad {age}"),
    Err(e) => println!("inválido: {e}"),
}` },
          ],
          beats: [
            { say: 'Aquí tienes un patrón conocido de Ruby. Integer lanza una excepción con una entrada inválida, así que la rescatamos y retornamos nil.', type: { rb: 'all' }, lines: { rb: [2, 3, 4, 5] } },
            { say: 'Nada en la firma del método avisa que puede fallar. Tienes que leer el cuerpo para saberlo.', lines: { rb: [1] } },
            { say: 'En Rust, el tipo de retorno lo dice en voz alta. Esto retorna un Result: o una edad de tipo u8, o un ParseIntError.', type: { rs: 5 }, lines: { rs: [3] } },
            { say: 'Quien la llama maneja ambos casos con match. Ok lleva el valor, Err lleva el error. Si olvidas una rama, no compila.', type: { rs: 'all' }, lines: { rs: [7, 8, 9, 10] }, note: 'Piensa en un <code>match</code> sobre un Result como un <code>begin/rescue</code> que el compilador revisa por ti.' },
          ],
        },
        {
          title: 'Result es solo un enum',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'std (simplificado)', code: `enum Result<T, E> {
    Ok(T),    // éxito, contiene un T
    Err(E),   // fallo, contiene un E
}` },
            { id: 'k', kind: 'cards', items: [
              { icon: '✅', title: 'Ok(T)', body: 'El camino feliz. Adentro está el valor que querías.', cls: 'ok' },
              { icon: '🧯', title: 'Err(E)', body: 'Un fallo esperado: no encontrado, inválido, timeout. Es un valor, no un salto.', cls: 'bad' },
              { icon: '📜', title: 'En la firma', body: 'Quien llama ve <code>-&gt; Result&lt;User, DbError&gt;</code> y sabe qué puede salir mal.', cls: 'rust' },
            ] },
          ],
          beats: [
            { say: 'Aquí no hay magia. Result es un enum común y corriente de la librería estándar, con dos variantes.', type: { c: 'all' } },
            { say: 'Ok envuelve el valor de éxito.', show: 'k.0', lines: { c: [2] } },
            { say: 'Err envuelve el fallo. Son solo datos que retornas. No se lanza nada y el stack no se desenrolla.', show: 'k.1', lines: { c: [3] } },
            { say: 'Como vive en el tipo, cada llamador ve exactamente cómo puede fallar una función. Es documentación que el compilador hace cumplir.', show: 'k.2' },
          ],
        },
        {
          title: 'El operador ?: retorno temprano en Err',
          blocks: [
            { id: 'long', kind: 'code', lang: 'rust', label: 'sin ?', size: 18, code: `fn load_config(path: &str) -> Result<String, io::Error> {
    let text = match fs::read_to_string(path) {
        Ok(t) => t,
        Err(e) => return Err(e),
    };
    Ok(text.trim().to_string())
}` },
            { id: 'short', kind: 'code', lang: 'rust', label: 'con ?', size: 18, code: `fn load_config(path: &str) -> Result<String, io::Error> {
    let text = fs::read_to_string(path)?;
    Ok(text.trim().to_string())
}` },
          ],
          beats: [
            { say: 'Hacer match a mano sobre cada Result se vuelve ruidoso muy rápido. Mira esto: cuatro líneas solo para decir "si falló, pasa el error hacia arriba".', type: { long: 'all' }, lines: { long: [2, 3, 4, 5] } },
            { say: 'El operador signo de interrogación hace exactamente eso con un solo carácter.', type: { short: 'all' }, lines: { short: [2] } },
            { say: 'Si el Result es Ok, el signo de interrogación extrae el valor y sigue. Si es Err, retorna ese error de la función actual de inmediato.', lines: { short: [2] }, note: '<code>?</code> es una excepción que sube, pero visible en el código y en la firma.' },
            { say: 'Por eso el signo de interrogación solo funciona dentro de una función que retorna un Result. Tienes la comodidad de las excepciones, con cada salida marcada.', lines: { short: [1] } },
          ],
        },
        {
          type: 'checkpoint',
          q: 'Esto no compila. ¿Por qué?',
          code: `fn main() {
    let n: i32 = "42".parse()?;
    println!("{n}");
}`,
          options: ['<code>parse</code> necesita un turbofish', '<code>main</code> retorna <code>()</code>, así que <code>?</code> no tiene a dónde enviar el error', '<code>?</code> solo funciona con <code>Option</code>', 'No puedes hacer parse de un string literal'],
          answer: 1,
          explain: '<code>?</code> retorna el error desde la función que lo contiene, así que esa función debe retornar un <code>Result</code> (u <code>Option</code>). Arréglalo con <code>fn main() -&gt; Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt;</code> y agrega <code>Ok(())</code> al final.',
          beats: [{ say: 'Checkpoint. El signo de interrogación está ahí mismo. Entonces, ¿por qué se queja el compilador?' }],
        },
        {
          title: 'unwrap y expect: los métodos bang',
          layout: 'split',
          blocks: [
            { id: 't', kind: 'table', side: 'left', cls: 'sm', head: ['Rails', 'Rust'], rows: [
              ['<code>User.find(id)</code> lanza', '<code>.unwrap()</code> hace panic'],
              ['<code>save!</code> con mensaje', '<code>.expect("por qué")</code>'],
              ['<code>find_by</code> + revisar', '<code>?</code> / <code>match</code>'],
              ['<code>x || default</code>', '<code>.unwrap_or(default)</code>'],
            ] },
            { id: 'c', kind: 'code', lang: 'rust', side: 'right', label: 'main.rs', size: 16, code: `// al arrancar: fallar temprano está bien
let port: u16 = env::var("PORT")
    .unwrap_or_else(|_| "3000".into())
    .parse()
    .expect("PORT debe ser un número");

// en un request: ¡nunca unwrap del input!
let id: i64 = params.id.parse()?;` },
            { id: 'b', kind: 'text', style: 'callout', html: '<code>unwrap</code> está bien en tests, prototipos y al arrancar. En código que atiende requests, retorna el error con <code>?</code>.' },
          ],
          beats: [
            { say: 'A veces sabes que un fallo es un bug, no una situación que manejar. Rails tiene métodos bang para eso, y Rust tiene unwrap y expect.', show: 't.0' },
            { say: 'unwrap toma el valor Ok o hace panic. expect hace lo mismo, con un mensaje que tú eliges. Es como save con bang.', show: 't.1' },
            { say: 'Cuando fallar es un resultado normal, como con find_by, usa el signo de interrogación o match. Y unwrap_or es tu valor por defecto con doble barra.', show: ['t.2', 't.3'] },
            { say: 'Leer la configuración al arrancar es un buen lugar para expect. Si el puerto es basura, falla ruidosamente antes de recibir tráfico.', type: { c: 5 }, lines: { c: [2, 3, 4, 5] } },
            { say: 'Pero dentro de un request, nunca hagas unwrap del input del usuario. Un solo parámetro malo haría panic en el handler. Mejor propaga el error.', type: { c: 'all' }, lines: { c: [8] }, show: 'b' },
          ],
        },
        {
          title: 'Errores propios: clases de excepción → enums',
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
            { say: 'En Ruby modelas los tipos de fallo con una jerarquía de clases de excepción, y las rescatas una por una.', type: { rb: 'all' } },
            { say: 'En Rust, la versión idiomática es un solo enum, con una variante por cada fallo.', type: { rs: 6 }, lines: { rs: [2, 3, 4, 5, 6] } },
            { say: 'Las variantes pueden llevar datos, como el largo mínimo de la contraseña, o un error de más bajo nivel que causó este.', lines: { rs: [4, 5] } },
            { say: 'Implementar From permite que el signo de interrogación convierta automáticamente. Un error de io dentro de signup sale convertido en un SignupError.', type: { rs: 'all' }, lines: { rs: [8, 9, 10, 11, 12] }, note: '<code>?</code> llama a <code>From::from</code> sobre el error por ti. Así se componen distintos tipos de error.' },
            { say: 'Y como es un enum, un match sobre SignupError debe cubrir todas las variantes. Agrega un fallo nuevo y el compilador te muestra cada llamador que debes actualizar.' },
          ],
        },
        {
          title: 'thiserror para librerías, anyhow para apps',
          layout: 'split',
          blocks: [
            { id: 'te', kind: 'code', lang: 'rust', label: 'lib: thiserror', size: 16, code: `use thiserror::Error;

#[derive(Debug, Error)]
enum SignupError {
    #[error("el email {0} ya está en uso")]
    EmailTaken(String),
    #[error("contraseña muy corta")]
    WeakPassword,
    #[error(transparent)]
    Io(#[from] std::io::Error),
}` },
            { id: 'ah', kind: 'code', lang: 'rust', label: 'app: anyhow', size: 16, code: `use anyhow::{Context, Result};

fn main() -> Result<()> {
    let raw = std::fs::read_to_string("app.toml")
        .context("leyendo app.toml")?;
    println!("{} bytes", raw.len());
    Ok(())
}` },
            { id: 'n', kind: 'text', style: 'callout', html: '¿Quien llama necesita hacer <em>match</em> sobre él? Usa <b>thiserror</b>. ¿Solo necesitas <em>reportarlo</em>? Usa <b>anyhow</b>.' },
          ],
          beats: [
            { say: 'Escribir a mano las implementaciones de Display y From es puro boilerplate. Dos crates eliminan casi todo.', show: [] },
            { say: 'thiserror deriva todo para tus enums de error. El atributo error es el mensaje, y el atributo from genera la conversión From.', type: { te: 'all' }, lines: { te: [5, 6, 9, 10] } },
            { say: 'Úsalo en librerías y en código de dominio, donde quien llama necesita hacer match sobre fallos específicos, como rescatar una clase de excepción concreta.', lines: { te: [3, 4] } },
            { say: 'anyhow es para código de aplicación. Su Result acepta cualquier error, y context agrega una pista legible, como el mensaje de una excepción envuelta.', type: { ah: 'all' }, lines: { ah: [3, 4, 5] } },
            { say: 'La regla general es simple.', show: 'n' },
          ],
        },
        {
          title: 'panic! vs Result',
          blocks: [
            { id: 'k', kind: 'cards', items: [
              { icon: '🧯', title: 'Result', body: 'Fallos esperados: validación, no encontrado, red caída, input inválido. Quien llama decide qué hacer.', cls: 'ok' },
              { icon: '💥', title: 'panic!', body: 'Bugs e invariantes rotas: índice fuera de rango, un estado "imposible". Como una excepción no manejada y un 500.', cls: 'bad' },
            ] },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              { icon: '🌐', text: 'Los frameworks web atrapan un handler que hace panic, pero lo tratan como un crash, no como flujo de control' },
              { icon: '🚫', text: 'Nunca uses panics para controlar el flujo como algo de código Rails usa <code>raise</code>/<code>rescue</code>' },
              { icon: '🔜', text: 'En el Módulo 5, tu enum de errores se convierte en respuestas HTTP: <code>NotFound</code> → 404' },
            ] },
          ],
          beats: [
            { say: 'Entonces, ¿cuándo retornas un Result y cuándo haces panic?' },
            { say: 'Retorna un Result para todo lo que razonablemente puede pasar: input inválido, un registro que no existe, una conexión que se cae.', show: 'k.0' },
            { say: 'Panic es para bugs, cuando el programa llega a un estado que debería ser imposible. Es la excepción no manejada que termina en un error quinientos.', show: 'k.1' },
            { say: 'No uses panics como flujo de control, como a veces el código Rails va rescatando excepciones para avanzar en la lógica.', show: ['b.0', 'b.1'] },
            { say: 'Y en el Módulo 5 verás cómo tus enums de error se mapean directamente a códigos de estado HTTP.', show: 'b.2' },
          ],
        },
      ],
      summary: {
        tldr: 'Rust no tiene excepciones. Las funciones que pueden fallar retornan <code>Result&lt;T, E&gt;</code>, que es <code>Ok(valor)</code> o <code>Err(error)</code>. El operador <code>?</code> retorna el error de forma temprana y lo convierte con <code>From</code>. Usa <code>unwrap</code>/<code>expect</code> solo donde un fallo sea un bug. Modela tus errores como enums, con <b>thiserror</b> para librerías y <b>anyhow</b> para apps.',
        points: [
          '<code>Result&lt;T, E&gt;</code> es un enum común: <code>Ok(T)</code> o <code>Err(E)</code>. El fallo es parte de la firma.',
          '<code>match</code> maneja ambos casos. <code>?</code> extrae el <code>Ok</code> o retorna el <code>Err</code> de forma temprana desde la función actual.',
          '<code>?</code> convierte errores con <code>From</code>, así que los errores de bajo nivel se componen en tu propio enum de errores.',
          '<code>unwrap</code>/<code>expect</code> hacen panic si falla. Son como los métodos bang: bien al arrancar y en tests, no con input del usuario.',
          'Usa enums de error propios con <b>thiserror</b> en librerías, y <b>anyhow</b> + <code>.context()</code> en aplicaciones.',
          'Los panics son para bugs. Los fallos esperados son <code>Result</code>s.',
        ],
        rosetta: [
          ['<code>raise ArgumentError</code>', '<code>return Err(MyError::Invalid)</code>'],
          ['<code>rescue ArgumentError =&gt; e</code>', '<code>match r { Err(e) =&gt; … }</code>'],
          ['Excepción que sube por el stack', 'Operador <code>?</code>'],
          ['<code>User.find(id)</code> / <code>save!</code>', '<code>.unwrap()</code> / <code>.expect("…")</code>'],
          ['<code>value || default</code>', '<code>.unwrap_or(default)</code> / <code>.unwrap_or_default()</code>'],
          ['<code>class EmailTaken &lt; SignupError</code>', '<code>enum SignupError { EmailTaken, … }</code>'],
          ['<code>raise Wrapped, "ctx"</code> (causa)', '<code>.context("ctx")?</code> (anyhow)'],
          ['Excepción no manejada → 500', '<code>panic!</code>'],
        ],
        gotchas: [
          '<code>?</code> solo funciona dentro de funciones que retornan <code>Result</code> (u <code>Option</code>). <code>main</code> también puede retornar <code>Result</code>.',
          '<code>?</code> sobre un <code>Result</code> dentro de una función que retorna <code>Option</code> no compila. Convierte con <code>.ok()?</code>.',
          'Un <code>Result</code> olvidado genera la advertencia <code>unused_must_use</code>. No la ignores.',
          'Llamar a <code>.unwrap()</code> en un handler web convierte un request inválido en un crash. Usa <code>?</code>.',
        ],
        code: `use anyhow::{Context, Result};

fn port() -> Result<u16> {
    let raw = std::env::var("PORT").context("PORT no definido")?;
    let port = raw.parse().context("PORT debe ser un número")?;
    Ok(port)
}

fn main() {
    match port() {
        Ok(p) => println!("escuchando en {p}"),
        Err(e) => eprintln!("error de config: {e:#}"),
    }
}`,
        links: [['El Libro, cap. 9: Manejo de errores', 'https://doc.rust-lang.org/book/ch09-00-error-handling.html'], ['thiserror', 'https://docs.rs/thiserror'], ['anyhow', 'https://docs.rs/anyhow']],
      },
      quiz: [
        { type: 'mcq', q: '¿Qué hace <code>?</code> cuando se aplica a un <code>Err(e)</code>?', options: ['Hace panic con el mensaje de error', 'Retorna <code>Err(From::from(e))</code> desde la función actual', 'Lo reemplaza por un valor por defecto', 'Registra el error en el log y continúa'], answer: 1, explain: '<code>?</code> es un retorno temprano más una conversión <code>From</code> del error.' },
        { type: 'compiles', code: `fn double(s: &str) -> i32 {
    let n: i32 = s.parse()?;
    n * 2
}`, answer: false, explain: '<code>?</code> retorna el error desde la función actual, así que esa función también tiene que retornar un <code>Result</code>. Esta retorna un simple <code>i32</code>. Cámbiala a <code>Result&lt;i32, ParseIntError&gt;</code> y retorna <code>Ok(n * 2)</code>.' },
        { type: 'fill', q: 'Completa la función para que propague los errores de parse y retorne la suma.', code: `fn total(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {
    let x: i32 = a.parse()___;
    let y: i32 = b.parse()?;
    ___(x + y)
}`, answers: [['?'], ['Ok', 'Result::Ok']], explain: '<code>?</code> propaga el error, y el valor de éxito debe ir envuelto en <code>Ok(...)</code>.' },
        { type: 'match', q: 'Relaciona el idiom de Ruby con su equivalente en Rust.', pairs: [['<code>rescue =&gt; e</code>', 'match … Err(e) =>'], ['<code>raise NotFound</code>', 'return Err(NotFound)'], ['<code>save!</code> (lanza)', '.expect("…")'], ['<code>value || default</code>', '.unwrap_or(default)'], ['<code>class MyError &lt; StandardError</code>', 'enum MyError + thiserror']] },
        { type: 'order', q: 'Ordena los pasos de <code>let v = thing()?;</code> para el caso en que <code>thing()</code> falla.', items: ['Evaluar thing() a un Result', 'Ver que es Err(e)', 'Convertir e con From::from', 'Retornar Err(convertido) desde la función que lo contiene'], explain: 'El código después del <code>?</code> nunca se ejecuta en el camino de error.' },
        { type: 'mcq', q: 'Estás construyendo el binario de una app web y solo quieres errores con contexto en tus logs. ¿Qué crate encaja mejor?', options: ['<code>thiserror</code>', '<code>anyhow</code>', '<code>serde</code>', 'Ninguno. Usa <code>unwrap</code> en todas partes.'], answer: 1, explain: '<b>anyhow</b> está diseñado para aplicaciones. <b>thiserror</b> es para errores tipados sobre los que quien llama hace match, normalmente en librerías o módulos de dominio.' },
      ],
      practice: [
        {
          title: 'Devuelve un Result y usa ?',
          prompt: 'Dos funciones pequeñas, ambas del video. <code>parse_port</code> devuelve el <code>Result</code> de <code>parse</code>. <code>next_port</code> la llama con <code>?</code> y suma uno. Completa los dos TODO. Salida esperada: <code>siguiente puerto: 3001</code> y luego <code>puerto inválido: invalid digit found in string</code>. Mientras no termines, imprime <code>siguiente puerto: 0</code> dos veces.',
          starter: `use std::num::ParseIntError;

// La firma dice en voz alta que esto puede fallar.
fn parse_port(s: &str) -> Result<u16, ParseIntError> {
    // TODO 1: convierte \`s\` a u16 y devuelve el Result tal cual
    Ok(0)
}

fn next_port(s: &str) -> Result<u16, ParseIntError> {
    // TODO 2: obtén el puerto con \`?\` y devuelve Ok(port + 1)
    Ok(0)
}

fn main() {
    for s in ["3000", "abc"] {
        match next_port(s) {
            Ok(p) => println!("siguiente puerto: {p}"),
            Err(e) => println!("puerto inválido: {e}"),
        }
    }
}
`,
          hints: [
            'En la primera escena de la lección, todo el cuerpo de <code>parse_age</code> es solo <code>s.parse::&lt;u8&gt;()</code>. Haz lo mismo con <code>u16</code>.',
            'En <code>next_port</code>, escribe <code>let port = parse_port(s)?;</code>. Si falla, <code>?</code> devuelve el error desde <code>next_port</code> de inmediato.',
            'Termina con <code>Ok(port + 1)</code>: vuelve a meter el valor bueno dentro de <code>Ok</code>.',
          ],
          solution: `use std::num::ParseIntError;

// La firma dice en voz alta que esto puede fallar.
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
            Ok(p) => println!("siguiente puerto: {p}"),
            Err(e) => println!("puerto inválido: {e}"),
        }
    }
}
`,
          explain: 'El <code>?</code> sobre <code>parse_port(s)</code> saca el valor del <code>Ok</code>, o devuelve el <code>Err</code> desde <code>next_port</code> de inmediato. Por eso <code>"abc"</code> nunca llega a <code>port + 1</code>. Las dos funciones usan el mismo tipo de error, <code>ParseIntError</code>, así que no hizo falta ninguna conversión. El siguiente ejercicio agrega una.',
        },
        {
          title: 'Tu propio tipo de error',
          prompt: 'Ahora la función puede fallar de dos maneras, así que devuelve tu propio enum, como <code>SignupError</code> en el video. El código inicial no compila a propósito: el compilador dice que <code>?</code> no pudo convertir el error a <code>PortError</code>, porque <code>PortError</code> no implementa <code>From&lt;ParseIntError&gt;</code>. TODO 1: agrega ese impl. TODO 2: devuelve <code>Err(PortError::TooLow)</code> para puertos menores que 1024. Salida esperada: <code>puerto 3000</code>, <code>muy bajo</code>, <code>no es un número: invalid digit found in string</code>.',
          starter: `use std::num::ParseIntError;

#[derive(Debug)]
enum PortError {
    NotANumber(ParseIntError),
    TooLow,
}

// TODO 1: implementa From<ParseIntError> for PortError, para que \`?\` pueda convertir el error
//         (misma forma que el ejemplo de SignupError del video)

fn parse_port(s: &str) -> Result<u16, PortError> {
    let port = s.parse::<u16>()?;
    // TODO 2: si el puerto es menor que 1024, devuelve Err(PortError::TooLow)
    Ok(port)
}

fn main() {
    for s in ["3000", "80", "abc"] {
        match parse_port(s) {
            Ok(p) => println!("puerto {p}"),
            Err(PortError::TooLow) => println!("muy bajo"),
            Err(PortError::NotANumber(e)) => println!("no es un número: {e}"),
        }
    }
}
`,
          hints: [
            'Copia la forma de <code>impl From&lt;std::io::Error&gt; for SignupError</code> del video. Aquí el tipo de entrada es <code>ParseIntError</code>.',
            'El cuerpo de <code>from</code> envuelve el error en tu variante: <code>PortError::NotANumber(e)</code>.',
            'TODO 2: <code>if port &lt; 1024 { return Err(PortError::TooLow); }</code>. Es el <code>return Err(e)</code> en versión larga de la escena de <code>?</code>.',
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
            Ok(p) => println!("puerto {p}"),
            Err(PortError::TooLow) => println!("muy bajo"),
            Err(PortError::NotANumber(e)) => println!("no es un número: {e}"),
        }
    }
}
`,
          explain: 'Con <code>From</code> implementado, <code>?</code> convierte el <code>ParseIntError</code> en <code>PortError::NotANumber</code> por ti. El <code>match</code> de <code>main</code> tiene que cubrir todas las variantes, así que agregar una nueva más adelante hace que el compilador señale a cada llamador.',
        },
        {
          title: 'Lo mismo, con thiserror',
          prompt: 'El mismo enum, con menos código repetitivo: deja que el crate <code>thiserror</code> escriba <code>Display</code> y <code>From</code> por ti, como en el video. El código inicial no compila a propósito: necesita <code>Display</code> para <code>{e}</code> y un <code>From</code> para <code>?</code>. Tres ediciones pequeñas arreglan ambas cosas. Salida esperada: <code>puerto 3000</code>, <code>error: el puerto debe ser 1024 o mayor</code>, <code>error: no es un número: invalid digit found in string</code>.',
          starter: `use std::num::ParseIntError;
use thiserror::Error;

// TODO 1: deriva Error junto a Debug
#[derive(Debug)]
enum PortError {
    // TODO 2: agrega #[error("no es un número: {0}")] sobre esta variante,
    //         y pon #[from] en el ParseIntError (reemplaza el impl From escrito a mano)
    NotANumber(ParseIntError),
    // TODO 3: agrega #[error("el puerto debe ser 1024 o mayor")] sobre esta variante
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
            Ok(p) => println!("puerto {p}"),
            Err(e) => println!("error: {e}"),
        }
    }
}
`,
          hints: [
            '<code>#[derive(Debug, Error)]</code> sobre el enum, como <code>SignupError</code> en la escena de thiserror.',
            '<code>#[error("no es un número: {0}")]</code> va sobre la variante, y <code>NotANumber(#[from] ParseIntError)</code> genera el impl de <code>From</code>. <code>{0}</code> imprime el error interno.',
            '<code>#[error("el puerto debe ser 1024 o mayor")]</code> va sobre <code>TooLow</code>.',
          ],
          solution: `use std::num::ParseIntError;
use thiserror::Error;

#[derive(Debug, Error)]
enum PortError {
    #[error("no es un número: {0}")]
    NotANumber(#[from] ParseIntError),
    #[error("el puerto debe ser 1024 o mayor")]
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
            Ok(p) => println!("puerto {p}"),
            Err(e) => println!("error: {e}"),
        }
    }
}
`,
          explain: 'El mismo comportamiento con una fracción del código: <code>#[from]</code> reemplazó el <code>impl From</code> escrito a mano y <code>#[error(...)]</code> reemplazó el <code>impl Display</code>. Usa thiserror en librerías y código de dominio, donde quien llama hace match sobre errores específicos.',
        },
      ],
    },

    // ------------------------------------------------------------------ 4.2
    {
      id: 'strings',
      title: 'String vs &str (y por qué hay dos)',
      subtitle: 'Texto con dueño y vistas prestadas, UTF-8 de verdad, y tus métodos de String favoritos traducidos.',
      tags: ['string', 'str', 'utf-8', 'slices', 'format', 'to_string'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 4 · Lección 2', title: 'String vs &str',
          subtitle: 'Por qué Rust tiene dos tipos de string, y cuál usar.',
          beats: [
            { say: 'Todo Rubyista tropieza con esto la primera semana. Ruby tiene una sola clase String. Rust tiene dos tipos de string que aparecen por todas partes.' },
            { say: 'Al final de esta lección sabrás cuál es cuál, y cuál usar en cada situación.' },
          ],
        },
        {
          title: 'Un String en Ruby, dos en Rust',
          blocks: [
            { id: 'k', kind: 'cards', items: [
              { icon: '💎', title: 'String de Ruby', body: 'Un solo tipo. Vive en el heap, es mutable (salvo que esté congelado) y se pasa por referencia.', cls: 'ruby' },
              { icon: '📦', title: 'String', body: 'Texto <b>con dueño</b> que puede crecer, en el heap. Puedes agregarle contenido, y se libera cuando su dueño desaparece.', cls: 'rust' },
              { icon: '🔍', title: '&amp;str', body: 'Una <b>vista prestada</b> de algún texto: un puntero más un largo. Es de solo lectura y barata de copiar.', cls: 'ok' },
            ] },
            { id: 'q', kind: 'text', style: 'callout', html: '<code>String</code> es el documento. <code>&amp;str</code> es una ventana a una parte de él.' },
          ],
          beats: [
            { say: 'En Ruby, un string es un string. Vive en el heap y todos comparten referencias a él.', show: 'k.0' },
            { say: 'El String de Rust es la versión con dueño. Es dueño de un buffer en el heap, puede crecer, y se libera cuando su dueño sale de scope.', show: 'k.1' },
            { say: 'Ampersand str, llamado string slice, es una vista prestada. Apunta a unos bytes UTF-8 que no le pertenecen, y no puede cambiarlos.', show: 'k.2' },
            { say: 'Un buen modelo mental: el String es el documento, y el str slice es una ventana que mira una parte de él.', show: 'q' },
          ],
        },
        {
          title: 'Cómo se ven en memoria',
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
            { say: 'Miremos bajo el capó. Creamos un String con String from hello.', show: ['d.stack', 'd.heap', 'd.s'], note: '<code>let s = String::from("hello");</code>' },
            { say: 'El String en sí son tres números en el stack: un puntero, un largo y una capacidad. Los bytes de verdad viven en el heap.', show: ['d.b0', 'd.b1', 'd.b2', 'd.b3', 'd.b4', 'd.ps'], hl: ['d.s'] },
            { say: 'Ahora tomamos un slice de los bytes uno a cuatro. Eso es un str: solo un puntero y un largo, apuntando al mismo buffer del heap.', show: ['d.t', 'd.pt', 'd.sl'], hl: ['d.t'], note: '<code>let t: &amp;str = &amp;s[1..4];</code>' },
            { say: 'No se copió ningún byte. Por eso los string slices son tan baratos, y por eso no pueden vivir más que el String al que apuntan.', hl: ['d.b1', 'd.b2', 'd.b3'] },
          ],
        },
        {
          title: 'De dónde sale cada uno',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'main.rs', size: 18, code: `let a: &str = "hello";               // literal: incrustado en el binario
let b: String = String::from("hi");  // con dueño, en el heap
let c: String = "hi".to_string();    // lo mismo
let d: String = format!("{a}!");     // construye un String nuevo
let e: &str = &b;                    // presta un String como &str
let f: &str = &d[0..3];              // slice de un String
let g: String = e.to_owned();        // copia un &str a un String nuevo` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Ir de <b>&amp;str → String</b> reserva memoria y copia (<code>to_string</code>, <code>to_owned</code>, <code>String::from</code>). Ir de <b>String → &amp;str</b> es gratis (<code>&amp;s</code>, <code>s.as_str()</code>).' },
          ],
          beats: [
            { say: 'Los string literals son str slices. El texto queda incrustado en tu binario compilado, y el slice apunta a él.', type: { c: 1 }, lines: { c: [1] } },
            { say: 'Para obtener un String con dueño, usa String from, o to string. Hacen lo mismo.', type: { c: 3 }, lines: { c: [2, 3] } },
            { say: 'format es tu interpolación, y siempre produce un String nuevo con dueño.', type: { c: 4 }, lines: { c: [4] } },
            { say: 'Ir en la otra dirección es barato. Presta un String con un ampersand y obtienes un str, o toma una parte con un rango.', type: { c: 6 }, lines: { c: [5, 6] } },
            { say: 'Y to owned copia un slice a un String completamente nuevo.', type: { c: 'all' }, lines: { c: [7] } },
            { say: 'Recuerda la dirección. Crear un String cuesta una reserva de memoria. Prestar uno es gratis.', show: 'n' },
          ],
        },
        {
          title: 'Recibe &str, retorna String',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'greeter.rb', code: `def greet(name)
  "¡Hola, #{name}!"
end

greet("Grace")
greet(user.name)` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'greeter.rs', size: 18, code: `fn greet(name: &str) -> String {
    format!("¡Hola, {name}!")
}

let owned = String::from("Ada");
greet(&owned);  // &String -> &str
greet("Grace"); // un literal también sirve` },
            { id: 'b', kind: 'bullets', cls: 'sm', items: [
              { icon: '📥', text: 'Parámetros: <code>&amp;str</code> acepta literales <i>y</i> Strings prestados' },
              { icon: '🏗️', text: 'Campos de structs: <code>String</code>, porque el struct es dueño de sus datos' },
              { icon: '📤', text: 'Retornar texto nuevo: <code>String</code>' },
            ] },
          ],
          beats: [
            { say: 'En Ruby nunca piensas en esto. Le pasas un string y recibes un string.', type: { rb: 'all' } },
            { say: 'En Rust el idiom es: recibe un str slice como parámetro, y retorna un String con dueño cuando construyes texto nuevo.', type: { rs: 3 }, lines: { rs: [1] } },
            { say: 'Un parámetro str acepta tanto literales como Strings prestados. El compilador convierte una referencia a String en un str automáticamente. Eso se llama deref coercion.', type: { rs: 'all' }, lines: { rs: [6, 7] } },
            { say: 'Reglas generales: str slices para los parámetros,', show: 'b.0' },
            { say: 'Strings con dueño para los campos de structs y para los valores de retorno.', show: ['b.1', 'b.2'] },
          ],
        },
        {
          title: 'UTF-8 de verdad: no hay s[0]',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'irb', code: `s = "héllo"
s[1]        # => "é"
s.length    # => 5
s.bytesize  # => 6` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'main.rs', size: 16, code: `let s = "héllo";
s.len();               // 6 (¡bytes!)
s.chars().count();     // 5
s.chars().nth(1);      // Some('é')
&s[0..1];              // "h" (rango de bytes)
// s[1];               // ❌ error de compilación
// &s[1..2];           // 💥 no es borde de char` },
            { id: 'e', kind: 'text', style: 'err', html: '<b>error[E0277]</b>: the type `str` cannot be indexed by `{integer}`' },
          ],
          beats: [
            { say: 'Ruby te esconde el encoding de los strings. El índice uno te da el segundo carácter, aunque ocupe dos bytes.', type: { rb: 'all' } },
            { say: 'Los strings de Rust siempre son UTF-8 válido, y len cuenta bytes, no caracteres. La e con tilde ocupa dos bytes.', type: { rs: 2 }, lines: { rs: [2] } },
            { say: 'Para caracteres, itera con chars. Para contarlos, o tomar el enésimo, pasa por ese iterator.', type: { rs: 4 }, lines: { rs: [3, 4] } },
            { say: 'Indexar con un solo entero simplemente no está permitido. Sería ambiguo, y no se podría hacer en tiempo constante.', type: { rs: 'all' }, lines: { rs: [6] }, show: 'e' },
            { say: 'Puedes hacer slice con un rango de bytes, pero si el rango corta un carácter por la mitad, hace panic en tiempo de ejecución. Prefiere chars, o métodos como split y find. Y si de verdad quieres los bytes crudos, as bytes te los da.', lines: { rs: [5, 7] } },
          ],
        },
        {
          type: 'checkpoint',
          q: '¿Qué llamada compila?',
          code: `fn shout(s: &str) -> String {
    s.to_uppercase()
}
let name = String::from("ada");`,
          options: ['<code>shout(name)</code>', '<code>shout(&amp;name)</code>', '<code>shout(*name)</code>', '<code>shout(name.len())</code>'],
          answer: 1,
          explain: '<code>&amp;name</code> es un <code>&amp;String</code>, que se convierte en <code>&amp;str</code>. Pasar <code>name</code> por valor daría un <code>String</code> donde se espera un <code>&amp;str</code>: tipos que no coinciden.',
          beats: [{ say: 'Checkpoint. La función quiere un str slice, y nosotros tenemos un String. ¿Qué llamada funciona?' }],
        },
        {
          title: 'Tus métodos de String, traducidos',
          blocks: [
            { id: 't', kind: 'table', cls: 'sm', head: ['Ruby', 'Rust', 'Nota'], rows: [
              ['<code>s.upcase</code>', '<code>s.to_uppercase()</code>', 'retorna un String nuevo'],
              ['<code>s.strip</code>', '<code>s.trim()</code>', 'retorna &amp;str, sin reservar memoria'],
              ['<code>s.split(",")</code>', '<code>s.split(\',\')</code>', 'retorna un iterator'],
              ['<code>s.include?("x")</code>', '<code>s.contains("x")</code>', ''],
              ['<code>s.gsub("a", "b")</code>', '<code>s.replace("a", "b")</code>', 'regex: crate <code>regex</code>'],
              ['<code>s.start_with?("x")</code>', '<code>s.starts_with("x")</code>', ''],
              ['<code>s.empty?</code>', '<code>s.is_empty()</code>', ''],
              ['<code>s.to_i</code>', '<code>s.parse::&lt;i64&gt;()</code>', '¡retorna un Result!'],
            ] },
          ],
          beats: [
            { say: 'Buenas noticias: casi todos tus métodos de String favoritos tienen equivalentes directos. Sobre todo cambian los nombres.' },
            { say: 'upcase se convierte en to uppercase, y strip se convierte en trim. Trim retorna un slice del original, así que no reserva memoria.', show: ['t.0', 't.1'] },
            { say: 'split retorna un iterator perezoso en vez de un arreglo. Llama a collect si necesitas un Vec.', show: 't.2' },
            { say: 'include con signo de interrogación se convierte en contains, gsub en replace, y start with en starts with.', show: ['t.3', 't.4', 't.5'] },
            { say: 'Los predicados pierden el signo de interrogación y ganan el prefijo is. Y to i se convierte en parse, que retorna un Result en vez de darte un cero en silencio.', show: ['t.6', 't.7'], hl: ['t.7'] },
          ],
        },
        {
          title: 'Construir strings',
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
let full = html + "</ul>"; // mueve html

let tags = ["a", "b"].join(", ");` },
          ],
          beats: [
            { say: 'Construir strings pieza por pieza te resultará familiar. Ruby usa el operador pala.', type: { rb: 'all' } },
            { say: 'En Rust necesitas un String mutable, y push str agrega un slice. push agrega un solo carácter.', type: { rs: 5 }, lines: { rs: [1, 3, 5] } },
            { say: 'El operador más toma un String con dueño a la izquierda y un str a la derecha. Reutiliza el buffer de la izquierda, lo que significa que la variable original se mueve.', type: { rs: 6 }, lines: { rs: [6] }, note: 'Después de <code>html + "…"</code> ya no puedes usar <code>html</code>. ¡Ownership otra vez!' },
            { say: 'Y join funciona sobre slices de strings, igual que Array join en Ruby.', type: { rs: 'all' }, lines: { rs: [8] } },
          ],
        },
      ],
      summary: {
        tldr: '<code>String</code> es texto con dueño, que puede crecer y vive en el heap. <code>&amp;str</code> es una vista prestada de solo lectura: un puntero más un largo. Recibe <code>&amp;str</code> en los parámetros, guarda <code>String</code> en los structs y retorna <code>String</code> desde funciones que construyen texto. Los strings son UTF-8, así que <code>len()</code> cuenta bytes y recorres caracteres con <code>.chars()</code>.',
        points: [
          '<code>String</code> es dueño de su buffer. <code>&amp;str</code> toma prestada una vista de uno (o de un literal en el binario).',
          'Convertir <code>&amp;str → String</code> reserva memoria (<code>to_string</code>, <code>to_owned</code>, <code>String::from</code>, <code>format!</code>). <code>String → &amp;str</code> es gratis (<code>&amp;s</code>).',
          'Recibe parámetros <code>&amp;str</code>. <code>&amp;String</code> se convierte en ellos automáticamente.',
          'No hay indexación con enteros. <code>len()</code> son bytes, así que usa <code>.chars()</code> para caracteres y rangos de bytes solo en bordes de carácter.',
          'La mayoría de los métodos de String de Ruby se mapean 1:1: <code>trim</code>, <code>split</code>, <code>contains</code>, <code>replace</code>, <code>to_uppercase</code>, <code>parse</code>.',
        ],
        rosetta: [
          ['<code>String</code> (un solo tipo)', '<code>String</code> (con dueño) + <code>&amp;str</code> (prestado)'],
          ['<code>"Hi #{name}"</code>', '<code>format!("Hi {name}")</code>'],
          ['<code>s.upcase</code> / <code>s.downcase</code>', '<code>s.to_uppercase()</code> / <code>s.to_lowercase()</code>'],
          ['<code>s.strip</code>', '<code>s.trim()</code>'],
          ['<code>s.include?("x")</code>', '<code>s.contains("x")</code>'],
          ['<code>s.gsub("a", "b")</code>', '<code>s.replace("a", "b")</code>'],
          ['<code>s.length</code>', '<code>s.chars().count()</code> (<code>len()</code> son bytes)'],
          ['<code>s &lt;&lt; "x"</code>', '<code>s.push_str("x")</code>'],
          ['<code>s.to_i</code>', '<code>s.parse::&lt;i64&gt;()?</code>'],
          ['<code>arr.join(", ")</code>', '<code>arr.join(", ")</code>'],
        ],
        gotchas: [
          '<code>s[0]</code> no compila. Usa <code>s.chars().next()</code>.',
          'El slice <code>&amp;s[a..b]</code> hace panic si <code>a</code> o <code>b</code> no están en un borde de carácter.',
          '<code>a + &amp;b</code> mueve <code>a</code>. Usa <code>format!("{a}{b}")</code> si necesitas ambos después.',
          'Prefiere <code>&amp;str</code> sobre <code>&amp;String</code> en las firmas. Acepta más llamadores.',
        ],
        code: `fn slug(title: &str) -> String {          // presta al entrar
    title.trim().to_lowercase().replace(' ', "-") // dueño al salir
}

fn main() {
    let t = String::from("  Hello Rust ");
    let s = slug(&t);                       // &String -> &str
    println!("{s} ({} caracteres)", s.chars().count());
}`,
        links: [['El Libro, 8.2: Strings', 'https://doc.rust-lang.org/book/ch08-02-strings.html'], ['std::string::String', 'https://doc.rust-lang.org/std/string/struct.String.html'], ['primitive str', 'https://doc.rust-lang.org/std/primitive.str.html']],
      },
      quiz: [
        { type: 'compiles', code: `let s = String::from("hello");
let first = s[0];`, answer: false, explain: 'Los strings no se pueden indexar con un entero. Usa <code>s.chars().next()</code> o un slice por rango de bytes como <code>&amp;s[0..1]</code>.' },
        { type: 'mcq', q: '¿Cuál es el tipo de parámetro más flexible para una función que solo <i>lee</i> un texto?', options: ['<code>String</code>', '<code>&amp;String</code>', '<code>&amp;str</code>', '<code>Vec&lt;char&gt;</code>'], answer: 2, explain: '<code>&amp;str</code> acepta string literals, slices y (gracias a deref coercion) <code>&amp;String</code>.' },
        { type: 'mcq', q: '¿Qué retorna <code>"héllo".len()</code>?', options: ['4', '5', '6', 'No compila'], answer: 2, explain: '<code>len()</code> cuenta bytes. <code>é</code> ocupa 2 bytes en UTF-8, así que el total es 6. <code>.chars().count()</code> da 5.' },
        { type: 'fill', q: 'Completa la firma idiomática: presta al entrar, dueño al salir.', code: 'fn greet(name: ___) -> ___ {\n    format!("Hello, {name}!")\n}', answers: [['&str'], ['String']], explain: 'Lee el texto con <code>&amp;str</code>. <code>format!</code> construye un <code>String</code> nuevo con dueño.' },
        { type: 'match', q: 'Relaciona el método de String de Ruby con Rust.', pairs: [['<code>upcase</code>', 'to_uppercase()'], ['<code>strip</code>', 'trim()'], ['<code>include?</code>', 'contains()'], ['<code>gsub</code> (texto plano)', 'replace()'], ['<code>empty?</code>', 'is_empty()']] },
        { type: 'compiles', code: `fn label(s: &str) -> &str {
    s.trim()
}
let owned = String::from("  hi ");
println!("[{}]", label(&owned));`, answer: true, explain: '<code>&amp;owned</code> se convierte en <code>&amp;str</code>, y retornar un sub-slice del input está bien. La elisión de lifetimes ata la salida a la entrada.' },
      ],
      practice: [
        {
          title: 'Recibe &amp;str, devuelve String',
          prompt: 'Rails: <code>"  rust for rails  ".strip.upcase + "!"</code>. En Rust la función <em>presta</em> su entrada como <code>&amp;str</code> y devuelve un <code>String</code> nuevo. Completa los dos TODO con los métodos de la tabla de traducción de la lección. Cuando funcione, <code>main</code> imprime <code>todo bien ✅</code>. Mientras tanto, un <code>assert_eq!</code> lo detiene y muestra los dos valores que comparó.',
          starter: `// Los parámetros prestan (&str). Los resultados que son texto nuevo son Strings propios.
fn shout(title: &str) -> String {
    // TODO 1: quita los espacios, pásalo a mayúsculas y agrega un "!" al final
    String::new()
}

fn mentions_rust(title: &str) -> bool {
    // TODO 2: devuelve true cuando el título contiene "Rust"
    false
}

fn main() {
    let owned = String::from("  rust for rails  ");
    // assert_eq! / assert! detienen el programa con un error si la comprobación es falsa
    assert_eq!(shout(&owned), "RUST FOR RAILS!"); // &String funciona donde se espera &str
    assert_eq!(shout("hi"), "HI!");
    assert!(mentions_rust("Me encanta Rust"));
    assert!(!mentions_rust("Me encanta Ruby"));
    println!("todo bien ✅");
}
`,
          hints: [
            'En la tabla "Tus métodos de String, traducidos", <code>strip</code> pasa a ser <code>trim()</code> y <code>upcase</code> pasa a ser <code>to_uppercase()</code>. Encadénalos: <code>title.trim().to_uppercase()</code>.',
            '<code>format!</code> construye un <code>String</code> nuevo: <code>format!("{}!", ...)</code>. O haz el String <code>mut</code> y usa <code>push(&#39;!&#39;)</code>.',
            'Para <code>mentions_rust</code>, la misma tabla tiene <code>include?</code> → <code>contains("x")</code>.',
          ],
          solution: `// Los parámetros prestan (&str). Los resultados que son texto nuevo son Strings propios.
fn shout(title: &str) -> String {
    format!("{}!", title.trim().to_uppercase())
}

fn mentions_rust(title: &str) -> bool {
    title.contains("Rust")
}

fn main() {
    let owned = String::from("  rust for rails  ");
    // assert_eq! / assert! detienen el programa con un error si la comprobación es falsa
    assert_eq!(shout(&owned), "RUST FOR RAILS!"); // &String funciona donde se espera &str
    assert_eq!(shout("hi"), "HI!");
    assert!(mentions_rust("Me encanta Rust"));
    assert!(!mentions_rust("Me encanta Ruby"));
    println!("todo bien ✅");
}
`,
          explain: 'Los dos parámetros son <code>&amp;str</code>, así que tanto <code>shout(&amp;owned)</code> (un <code>String</code> prestado) como <code>shout("hi")</code> (un literal) funcionan. <code>trim()</code> devuelve un slice del original, <code>to_uppercase()</code> crea un <code>String</code> nuevo y <code>format!</code> devuelve un <code>String</code> propio.',
        },
      ],
    },

    // ------------------------------------------------------------------ 4.3
    {
      id: 'collections-iterators',
      title: 'Colecciones e iterators',
      subtitle: 'Enumerable, compilado: Vec, HashMap, HashSet y cadenas de iterators perezosos.',
      tags: ['vec', 'hashmap', 'hashset', 'iterator', 'map', 'filter', 'fold', 'collect', 'enumerable', 'closures'],
      scenes: [
        {
          type: 'title', kicker: 'Módulo 4 · Lección 3', title: 'Colecciones e iterators',
          subtitle: 'Todo lo que amas de Enumerable, compilado a loops ajustados.',
          beats: [
            { say: 'Si hay una característica de Ruby que menos vas a extrañar en Rust, es Enumerable, porque Rust también la tiene. Con algunos giros.' },
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
tags[10];       // 💥 panic: fuera de rango
tags.len();     // 3` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Un <code>Vec&lt;T&gt;</code> contiene <b>un solo</b> tipo de elemento. No se permite mezclar strings y números como en un Array de Ruby. Usa un enum cuando necesites variedad.' },
          ],
          beats: [
            { say: 'El Array de Ruby se convierte en Vec, abreviatura de vector. La macro vec es la sintaxis literal.', type: { rb: 'all', rs: 1 } },
            { say: 'Debe declararse mut para poder agregarle elementos. Push es tu operador pala.', type: { rs: 2 }, lines: { rs: [1, 2] } },
            { say: 'first y get retornan un Option, porque el elemento podría no existir. Get es la versión segura de indexar, como Ruby retornando nil.', type: { rs: 4 }, lines: { rs: [3, 4] } },
            { say: 'Indexar con corchetes fuera de rango no retorna nil. Hace panic. Usa get siempre que el índice venga de afuera.', type: { rs: 'all' }, lines: { rs: [5] } },
            { say: 'Y un Vec contiene exactamente un tipo de elemento.', show: 'n' },
          ],
        },
        {
          title: 'Enumerable → Iterator',
          blocks: [
            { id: 't', kind: 'table', cls: 'sm', head: ['Enumerable de Ruby', 'Iterator de Rust'], rows: [
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
            { say: 'Aquí está la piedra de Rosetta de Enumerable. Los nombres son casi todos iguales.' },
            { say: 'Los bloques se convierten en closures. Barras verticales alrededor de los parámetros, luego una expresión, todo dentro de paréntesis.', show: 't.0', hl: ['t.0'] },
            { say: 'select se convierte en filter. No hay reject, simplemente niegas la condición. Y reduce se convierte en fold, con el valor inicial primero.', show: ['t.1', 't.2'] },
            { say: 'each with index se convierte en enumerate, que entrega pares de índice y valor.', show: 't.3' },
            { say: 'Y el resto son viejos amigos: find, any, all, sum, count, take, flat map y zip.', show: ['t.4', 't.5', 't.6'] },
          ],
        },
        {
          title: 'Una cadena, lado a lado',
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
              { icon: '🚪', text: '<code>.iter()</code> inicia la cadena, prestando cada elemento' },
              { icon: '💤', text: 'Los adaptadores (<code>filter</code>, <code>map</code>) son <b>perezosos</b>, como el <code>.lazy</code> de Ruby' },
              { icon: '🏁', text: 'Un consumidor (<code>sum</code>, <code>collect</code>, <code>count</code>) hace correr el loop' },
              { icon: '⚡', text: 'Compila a un solo loop ajustado, sin arreglos intermedios' },
            ] },
          ],
          beats: [
            { say: 'Aquí tienes un reporte clásico de Rails: órdenes pagadas, convertidas a totales y sumadas.', type: { rb: 'all' } },
            { say: 'La versión en Rust se lee casi igual. Lo principal que se agrega es una llamada a iter al inicio.', type: { rs: 'all' }, lines: { rs: [2] }, show: 'b.0' },
            { say: 'Aquí está la gran diferencia. En Ruby, cada paso construye un arreglo completo nuevo. Los adaptadores de iterators de Rust son perezosos, así que por sí solos no hacen nada.', lines: { rs: [3, 4] }, show: 'b.1' },
            { say: 'El trabajo solo ocurre cuando un consumidor como sum tira de los valores a través de la cadena, un elemento a la vez.', lines: { rs: [5] }, show: 'b.2' },
            { say: 'El compilador fusiona toda la cadena en un solo loop. Es tan rápido como el loop for que escribirías a mano, así que no hay razón para evitar este estilo.', show: 'b.3', note: 'Abstracción de costo cero: código de alto nivel con el rendimiento de un loop escrito a mano.' },
          ],
        },
        {
          title: 'collect: de vuelta a una colección',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'users.rs', size: 18, code: `let names: Vec<String> = users.iter()
    .map(|u| u.name.clone())
    .collect();

let ids = users.iter().map(|u| u.id).collect::<Vec<i64>>();

let by_id: HashMap<i64, &User> = users.iter()   // index_by(&:id)
    .map(|u| (u.id, u))
    .collect();` },
            { id: 'n', kind: 'text', style: 'callout', html: '<code>collect</code> puede construir un <code>Vec</code>, <code>HashMap</code>, <code>HashSet</code>, <code>String</code>, o incluso un <code>Result&lt;Vec&lt;_&gt;, E&gt;</code>. Le dices cuál con el tipo.' },
          ],
          beats: [
            { say: 'El map de Ruby retorna un arreglo de inmediato. En Rust terminas la cadena con collect, para juntar los resultados en una colección.', type: { c: 3 }, lines: { c: [1, 2, 3] } },
            { say: 'collect puede construir muchos tipos de colección, así que necesita saber cuál. Anota el tipo de la variable, o usa el turbofish: dos veces dos puntos, y luego corchetes angulares.', type: { c: 5 }, lines: { c: [5] }, note: 'A <code>::&lt;&gt;</code> se le llama cariñosamente el <b>turbofish</b>.' },
            { say: 'Junta pares en un HashMap y tienes el index by de Rails.', type: { c: 'all' }, lines: { c: [7, 8, 9] } },
            { say: 'También hay un truco genial. Juntar un iterator de Results en un Result de un Vec se detiene en el primer error.', show: 'n' },
          ],
        },
        {
          title: 'iter, iter_mut, into_iter',
          layout: 'split',
          blocks: [
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'left', items: [
              { icon: '👀', text: '<code>.iter()</code> / <code>for x in &amp;v</code><br/>presta: <code>&amp;T</code>, v sigue disponible' },
              { icon: '✏️', text: '<code>.iter_mut()</code> / <code>for x in &amp;mut v</code><br/>edita en el lugar: <code>&amp;mut T</code> (como <code>map!</code>)' },
              { icon: '📦', text: '<code>.into_iter()</code> / <code>for x in v</code><br/>consume: <code>T</code>, v desaparece después' },
            ] },
            { id: 'c', kind: 'code', lang: 'rust', side: 'right', label: 'prices.rs', size: 16, code: `let mut prices = vec![100, 250, 999];

for p in prices.iter_mut() {
    *p = *p * 110 / 100;   // como map!
}
for p in &prices {         // igual que .iter()
    println!("{p}");
}
for p in prices {          // into_iter()
    println!("con dueño {p}");
}
// prices se movió, no se puede usar aquí` },
          ],
          beats: [
            { say: 'El each de Ruby siempre te entrega una referencia al elemento. Rust te hace elegir entre tres formas de iterar, y otra vez se trata de ownership.', show: [] },
            { say: 'iter presta cada elemento. Puedes mirar pero no tocar, y el vector sigue ahí después.', show: 'b.0', type: { c: 8 }, lines: { c: [6, 7, 8] } },
            { say: 'iter mut entrega referencias mutables, así que puedes cambiar los elementos en el lugar, como el map con bang de Ruby. Fíjate en el asterisco para escribir a través de la referencia.', show: 'b.1', lines: { c: [3, 4, 5] } },
            { say: 'into iter toma ownership de cada elemento. Un loop for simple sobre el vector hace esto, así que el vector se consume y desaparece después.', show: 'b.2', type: { c: 'all' }, lines: { c: [9, 10, 11, 12] }, note: 'La mayoría de las veces quieres <code>for x in &amp;v</code>.' },
          ],
        },
        {
          type: 'checkpoint',
          q: '¿Qué pasa aquí?',
          code: `let names = vec![String::from("a"), String::from("b")];
for n in names {
    println!("{n}");
}
println!("{}", names.len());`,
          options: ['Imprime a, b, y luego 2', 'Error de compilación: el loop <code>for</code> movió <code>names</code>', 'Panic en tiempo de ejecución', 'Imprime a, b, y luego 0'],
          answer: 1,
          explain: '<code>for n in names</code> llama a <code>into_iter()</code>, que consume el Vec. Escribe <code>for n in &amp;names</code> para prestarlo.',
          beats: [{ say: 'Checkpoint. Fíjate bien en cómo itera el loop.' }],
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
            { id: 'n', kind: 'text', style: 'callout', html: 'Los Hash de Ruby mantienen el orden de inserción. El orden de iteración de un <code>HashMap</code> es <b>arbitrario</b>. Usa <code>BTreeMap</code> para llaves ordenadas, o el crate <code>indexmap</code> para el orden de inserción. Para valores únicos, usa <code>HashSet</code>.' },
          ],
          beats: [
            { say: 'El clásico contador de palabras de Ruby usa Hash new con un valor por defecto de cero.', type: { rb: 2 } },
            { say: 'En Rust, HashMap vive en std collections. Lo importas con use.', type: { rs: 3 }, lines: { rs: [1, 3] } },
            { say: 'La API entry es la forma idiomática de insertar o actualizar. entry encuentra el espacio, or insert pone un cero si falta, y el asterisco te deja modificar el valor.', type: { rs: 6 }, lines: { rs: [5] } },
            { say: 'get retorna un Option. Combínalo con copied y unwrap or para obtener el comportamiento de valor por defecto de Ruby.', type: { rb: 'all', rs: 9 }, lines: { rs: [8, 9] } },
            { say: 'Indexar con corchetes una llave que no existe hace panic, muy parecido a cuando fetch lanza un KeyError.', type: { rs: 'all' }, lines: { rs: [10], rb: [6] } },
            { say: 'Una gran sorpresa para los Rubyistas: el orden de iteración de un HashMap no es el orden de inserción.', show: 'n' },
          ],
        },
        {
          title: 'sort_by, uniq, group_by',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'users.rs', size: 17, code: `users.sort_by_key(|u| u.age);               // sort_by(&:age)
users.sort_by(|a, b| b.name.cmp(&a.name));  // sort_by + reverse

let mut tags = vec!["b", "a", "b"];
tags.sort();
tags.dedup();                               // uniq (¡debe estar ordenado!)

let mut by_role: HashMap<Role, Vec<User>> = HashMap::new();
for u in users {
    by_role.entry(u.role).or_default().push(u); // group_by(&:role)
}` },
            { id: 'n', kind: 'text', style: 'callout', html: 'Estos ordenan <b>en el lugar</b> y necesitan un Vec <code>mut</code>. Son como <code>sort_by!</code>, no como <code>sort_by</code>.' },
          ],
          beats: [
            { say: 'Algunos favoritos más. sort by key ordena por un campo, como sort by con symbol to proc.', type: { c: 1 }, lines: { c: [1] } },
            { say: 'sort by con un comparador te da control total. Aquí, nombres en orden descendente.', type: { c: 2 }, lines: { c: [2] } },
            { say: 'dedup es uniq, con una trampa: solo elimina duplicados consecutivos. Ordena primero, o júntalos en un HashSet.', type: { c: 6 }, lines: { c: [4, 5, 6] } },
            { say: 'No hay group by en la librería estándar, pero la API entry lo convierte en un loop de tres líneas. El crate itertools agrega muchos más helpers estilo Ruby.', type: { c: 'all' }, lines: { c: [8, 9, 10, 11] } },
            { say: 'Y fíjate que todos estos mutan en el lugar, como las versiones con bang de Ruby.', show: 'n' },
          ],
        },
      ],
      summary: {
        tldr: 'Array → <code>Vec&lt;T&gt;</code>, Hash → <code>HashMap&lt;K, V&gt;</code>, Set → <code>HashSet&lt;T&gt;</code>. Enumerable se convierte en cadenas de iterators: <code>.iter().filter().map().sum()</code>. Son perezosas hasta que un consumidor como <code>sum</code> o <code>collect</code> las ejecuta, y compilan a loops simples. Elige <code>iter</code> (prestar), <code>iter_mut</code> (editar) o <code>into_iter</code> (consumir).',
        points: [
          '<code>Vec</code> contiene un solo tipo de elemento. <code>get(i)</code> retorna un Option, mientras que <code>v[i]</code> hace panic si está fuera de rango.',
          'Los closures <code>|x| expr</code> reemplazan a los bloques. La mayoría de los métodos de Enumerable mantienen su nombre. Los grandes cambios son <code>select</code> → <code>filter</code> y <code>reduce</code> → <code>fold</code>.',
          'Los adaptadores de iterators son perezosos. Un consumidor (<code>sum</code>, <code>count</code>, <code>collect</code>) ejecuta toda la cadena en un solo loop fusionado.',
          '<code>collect</code> necesita un tipo destino: anota la variable o usa el turbofish <code>::&lt;Vec&lt;_&gt;&gt;</code>.',
          '<code>for x in &amp;v</code> presta, <code>&amp;mut v</code> edita, y <code>for x in v</code> consume el Vec.',
          'Usa la API entry de <code>HashMap</code> para contar y agrupar. El orden de iteración no es el orden de inserción.',
        ],
        rosetta: [
          ['<code>[1, 2, 3]</code>', '<code>vec![1, 2, 3]</code>'],
          ['<code>arr &lt;&lt; x</code>', '<code>v.push(x)</code>'],
          ['<code>arr[i]</code> (nil si no existe)', '<code>v.get(i)</code> → <code>Option</code>'],
          ['<code>map { |x| x * 2 }</code>', '<code>.iter().map(|x| x * 2)</code>'],
          ['<code>select</code> / <code>reject</code>', '<code>.filter(…)</code>'],
          ['<code>inject(0) { |s, x| s + x }</code>', '<code>.fold(0, |s, x| s + x)</code>'],
          ['<code>each_with_index</code>', '<code>.iter().enumerate()</code>'],
          ['<code>index_by(&amp;:id)</code>', '<code>.map(|u| (u.id, u)).collect::&lt;HashMap&lt;_, _&gt;&gt;()</code>'],
          ['<code>Hash.new(0)</code> + <code>h[k] += 1</code>', '<code>*h.entry(k).or_insert(0) += 1</code>'],
          ['<code>uniq</code>', '<code>sort()</code> + <code>dedup()</code> o un <code>HashSet</code>'],
        ],
        gotchas: [
          'Una cadena perezosa sin consumidor no hace nada. El compilador te advierte que los iterators son perezosos y no hacen nada si no se consumen.',
          '<code>.iter()</code> entrega referencias. En <code>filter</code> a menudo ves <code>&amp;&amp;x</code>, así que desreferencia o usa <code>.copied()</code>.',
          '<code>dedup()</code> solo elimina duplicados <i>consecutivos</i>.',
          '<code>for x in v</code> mueve <code>v</code>. Escribe <code>for x in &amp;v</code> si lo necesitas después.',
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
        links: [['El Libro, cap. 13.2: Iterators', 'https://doc.rust-lang.org/book/ch13-02-iterators.html'], ['std::iter::Iterator (todos los métodos)', 'https://doc.rust-lang.org/std/iter/trait.Iterator.html'], ['itertools', 'https://docs.rs/itertools']],
      },
      quiz: [
        { type: 'match', q: 'Relaciona el método de Enumerable con su equivalente en iterators de Rust.', pairs: [['<code>select</code>', 'filter'], ['<code>inject</code> / <code>reduce</code>', 'fold'], ['<code>each_with_index</code>', 'enumerate'], ['<code>any?</code>', 'any'], ['<code>first(3)</code>', 'take(3)']] },
        { type: 'compiles', code: `let v = vec![1, 2, 3];
let doubled: Vec<i32> = v.iter().map(|x| x * 2).collect();
println!("{:?} {:?}", v, doubled);`, answer: true, explain: '<code>.iter()</code> solo presta <code>v</code>, así que sigue disponible después. <code>&amp;i32 * i32</code> funciona y da un <code>i32</code>.' },
        { type: 'fill', q: 'Suma solo los números positivos.', code: 'let nums = vec![3, -1, 4, -5];\nlet total: i32 = nums.into_iter().___(|n| *n > 0).___();', answers: [['filter'], ['sum']], explain: '<code>filter</code> conserva los elementos que cumplen, y <code>sum</code> consume el iterator. Total: 7.' },
        { type: 'mcq', q: '¿Qué hace esta línea en tiempo de ejecución?', code: 'users.iter().map(|u| send_email(u));', options: ['Envía un email a cada usuario', 'Nada. Los iterators son perezosos y no hay consumidor.', 'Envía un solo email', 'Hace panic'], answer: 1, explain: '<code>map</code> es perezoso. Usa un loop <code>for</code> o <code>.for_each(...)</code> para efectos secundarios. El compilador incluso te advierte aquí.' },
        { type: 'mcq', q: 'Recorres un <code>HashMap</code> que llenaste con las llaves a, b, c en ese orden. ¿En qué orden las obtienes?', options: ['a, b, c (orden de inserción)', 'c, b, a', 'Alfabético', 'No especificado. Puede ser cualquier orden.'], answer: 3, explain: 'A diferencia de los Hash de Ruby, <code>HashMap</code> no tiene un orden definido. Usa <code>BTreeMap</code> (ordenado) o <code>indexmap</code> (orden de inserción).' },
        { type: 'order', q: 'Arma: los emails ordenados de los admins activos.', code: true, items: ['let mut emails: Vec<&str> = users', '.iter()', '.filter(|u| u.active && u.admin)', '.map(|u| u.email.as_str())', '.collect();', 'emails.sort();'], explain: 'Filtra mientras todavía tienes al usuario, luego conviértelo al email, haz collect y ordena en el lugar.' },
      ],
      practice: [
        {
          title: 'Traduce este reporte de Ruby',
          prompt: 'Traduce estas dos líneas de Ruby a cadenas de iteradores, como la cadena de <code>revenue</code> del video:<br/><code>orders.select(&amp;:paid).sum(&amp;:total_cents)</code><br/><code>orders.select { |o| o.total_cents &gt;= 10_000 }.map(&amp;:id)</code><br/>Completa los dos TODO. Cuando ambas funcionen, <code>main</code> imprime <code>reporte ok ✅</code>. Mientras tanto, un <code>assert_eq!</code> lo detiene y muestra lo que devolvió tu función.',
          starter: `struct Order {
    id: u32,
    paid: bool,
    total_cents: u64,
}

// &[Order] es una lista prestada de pedidos, como &str es texto prestado.
fn revenue(orders: &[Order]) -> u64 {
    // Ruby: orders.select(&:paid).sum(&:total_cents)
    // TODO 1: orders.iter(), luego filter para los pagados, map a total_cents y sum
    0
}

fn big_order_ids(orders: &[Order]) -> Vec<u32> {
    // Ruby: orders.select { |o| o.total_cents >= 10_000 }.map(&:id)
    // TODO 2: la misma idea, pero map al id y termina con collect()
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
    println!("reporte ok ✅");
}
`,
          hints: [
            'Empieza cada cadena con <code>orders.iter()</code>, como el ejemplo de revenue del video.',
            'La primera: <code>.filter(|o| o.paid).map(|o| o.total_cents).sum()</code>. La segunda: filtra con <code>o.total_cents &gt;= 10_000</code> y haz map a <code>o.id</code>.',
            'Termina la segunda cadena con <code>.collect()</code>. Como en <code>let names: Vec&lt;String&gt; = ... .collect()</code> del video, el tipo de retorno <code>Vec&lt;u32&gt;</code> le dice qué construir.',
          ],
          solution: `struct Order {
    id: u32,
    paid: bool,
    total_cents: u64,
}

// &[Order] es una lista prestada de pedidos, como &str es texto prestado.
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
    println!("reporte ok ✅");
}
`,
          explain: '<code>&amp;[Order]</code> es un slice: una lista prestada, como <code>&amp;str</code> es texto prestado. Los tipos de retorno (<code>u64</code> y <code>Vec&lt;u32&gt;</code>) le dicen a <code>sum</code> y a <code>collect</code> qué producir. Ambas cadenas se compilan a un solo bucle.',
        },
        {
          title: 'Cuenta las palabras',
          prompt: 'El contador de palabras de Ruby del video: <code>counts = Hash.new(0); words.each { |w| counts[w] += 1 }</code>. TODO 1: cuenta las palabras con la API entry. TODO 2: busca <code>"go"</code>, que no está en la lista, y obtén <code>0</code> en vez de un pánico. Cuando funcione, <code>main</code> imprime <code>rust x3, go x0</code>. Mientras tanto entra en pánico con "no entry found for key", porque <code>counts</code> sigue vacío.',
          starter: `use std::collections::HashMap;

fn main() {
    let words = vec!["rust", "rails", "rust", "sql", "rust"];

    // Ruby: counts = Hash.new(0); words.each { |w| counts[w] += 1 }
    let mut counts: HashMap<&str, u32> = HashMap::new();
    for w in words {
        // TODO 1: suma 1 al conteo de esta palabra (la API entry del video)
    }

    // TODO 2: busca "go" sin entrar en pánico: 0 si no existe
    let go = 99;

    // assert_eq! detiene el programa con un error si los dos lados difieren
    assert_eq!(counts["rust"], 3);
    assert_eq!(counts.get("rails"), Some(&1));
    assert_eq!(go, 0);
    println!("rust x{}, go x{}", counts["rust"], go);
}
`,
          hints: [
            'En la escena de HashMap: <code>*counts.entry(w).or_insert(0) += 1;</code> va dentro del bucle. <code>entry</code> encuentra el espacio, <code>or_insert(0)</code> lo crea si falta, y el <code>*</code> te deja cambiar el valor.',
            'Para el TODO 2 usa <code>get</code> en vez de corchetes, porque <code>get</code> devuelve un <code>Option</code>: <code>counts.get("go")</code>.',
            'Termina con <code>.copied().unwrap_or(0)</code>: el comportamiento de valor por defecto de Ruby, como en el video.',
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

    // assert_eq! detiene el programa con un error si los dos lados difieren
    assert_eq!(counts["rust"], 3);
    assert_eq!(counts.get("rails"), Some(&1));
    assert_eq!(go, 0);
    println!("rust x{}, go x{}", counts["rust"], go);
}
`,
          explain: '<code>entry(w).or_insert(0)</code> es tu <code>Hash.new(0)</code>, y <code>get(...).copied().unwrap_or(0)</code> lee de él sin un <code>KeyError</code>. Recuerda: indexar con corchetes una clave que falta entra en pánico.',
        },
      ],
    },
  ],
});
