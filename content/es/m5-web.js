// Spanish translation of content/m5-web.js. Generated to mirror the English module exactly
// (same ids, scenes, beats, keys and code line counts); see tools/check-i18n.js.
COURSE_ES.modules.push({
  "order": 5,
  "id": "m5",
  "title": "Construyendo una API web",
  "blurb": "Junta todo lo aprendido: async con Tokio, rutas con Axum, Postgres con SQLx, y luego testing y despliegue de una imagen Docker pequeña. Es la versión en Rust de <code>rails g scaffold Post</code>.",
  "lessons": [
    {
      "id": "async-tokio",
      "title": "Async y Tokio (aquí no hay GVL)",
      "subtitle": "Cómo Rust atiende miles de requests sin threads de Puma, sin GVL y sin procesos de Sidekiq.",
      "tags": [
        "async",
        "await",
        "tokio",
        "concurrency",
        "threads",
        "gvl",
        "sidekiq",
        "arc",
        "mutex"
      ],
      "scenes": [
        {
          "type": "title",
          "kicker": "Módulo 5 · Lección 1",
          "title": "Async y Tokio (aquí no hay GVL)",
          "subtitle": "Miles de requests concurrentes, un puñado de threads y paralelismo real.",
          "beats": [
            {
              "say": "Te damos la bienvenida al módulo final. Vamos a construir la versión en Rust de un scaffold de Rails: una API JSON para posts."
            },
            {
              "say": "Pero primero necesitamos el motor sobre el que corre todo framework web de Rust: async Rust y el runtime Tokio."
            }
          ]
        },
        {
          "title": "Cómo maneja Rails la concurrencia hoy",
          "blocks": [
            {
              "id": "c",
              "kind": "cards",
              "items": [
                {
                  "icon": "🧵",
                  "title": "Threads de Puma",
                  "body": "Unos pocos threads por proceso. Esperan bien el I/O, pero el GVL deja que solo uno ejecute código Ruby a la vez.",
                  "cls": "ruby"
                },
                {
                  "icon": "🏭",
                  "title": "Más procesos",
                  "body": "Para tener paralelismo real haces fork de workers, y cada uno carga su propia copia de la app en memoria.",
                  "cls": "ruby"
                },
                {
                  "icon": "📬",
                  "title": "Sidekiq",
                  "body": "El trabajo lento se va a otro proceso, con Redis en medio.",
                  "cls": "ruby"
                },
                {
                  "icon": "🦀",
                  "title": "Tokio",
                  "body": "Un solo proceso. Un worker thread por núcleo de CPU ejecuta miles de tareas livianas en paralelo, sin lock global.",
                  "cls": "rust"
                }
              ]
            }
          ],
          "beats": [
            {
              "say": "Seamos honestos sobre cómo una app Rails maneja la concurrencia."
            },
            {
              "say": "Puma te da unos pocos threads por proceso. Sirven para esperar a la base de datos, pero el lock global de la VM hace que solo un thread ejecute código Ruby a la vez.",
              "show": "c.0"
            },
            {
              "say": "Así que, para tener paralelismo real, agregas procesos, y cada proceso carga su propia copia de toda la app en memoria.",
              "show": "c.1"
            },
            {
              "say": "Todo lo lento se va a Sidekiq: otro proceso más, con Redis en medio.",
              "show": "c.2"
            },
            {
              "say": "Rust con Tokio es distinto. Un solo proceso, un worker thread por núcleo y miles de tareas livianas corriendo de verdad en paralelo. No hay lock global.",
              "show": "c.3",
              "hl": [
                "c.3"
              ]
            }
          ]
        },
        {
          "title": "async fn y .await",
          "blocks": [
            {
              "id": "c",
              "kind": "code",
              "lang": "rust",
              "size": 18,
              "code": "use std::time::Duration;\nuse tokio::time::sleep;\n\nasync fn fetch_title(id: u32) -> String {\n    sleep(Duration::from_millis(100)).await; // I/O simulado\n    format!(\"Post #{id}\")\n}\n\n#[tokio::main]\nasync fn main() {\n    let title = fetch_title(1).await;\n    println!(\"{title}\");\n}"
            }
          ],
          "beats": [
            {
              "say": "Este es async Rust en su forma más pequeña.",
              "type": {
                "c": 3
              }
            },
            {
              "say": "Marcar una función como async significa que puede pausarse mientras espera I/O, como una consulta a la base de datos, una llamada HTTP o un timer.",
              "type": {
                "c": 7
              },
              "lines": {
                "c": [
                  4
                ]
              }
            },
            {
              "say": "Punto await es el punto de pausa. Mientras esta tarea espera, el thread queda libre para ejecutar otras tareas. Ningún thread se queda bloqueado.",
              "lines": {
                "c": [
                  5
                ]
              },
              "note": "En Rust, <code>.await</code> se escribe <i>después</i> de la expresión, así que puedes encadenarlo."
            },
            {
              "say": "El código async necesita un runtime que lo ejecute. El atributo tokio main inicia uno y corre tu función main async sobre él.",
              "type": {
                "c": "all"
              },
              "lines": {
                "c": [
                  9,
                  10
                ]
              }
            },
            {
              "say": "Adentro, llamas funciones async y les haces await. Se lee casi como código secuencial normal. Una regla: punto await solo funciona dentro de una función o bloque async, por eso main también es async.",
              "lines": {
                "c": [
                  11,
                  12
                ]
              }
            }
          ]
        },
        {
          "title": "Los futures son perezosos",
          "layout": "split",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "lazy.rb",
              "code": "job = -> { fetch_title(1) }\n# todavía no se ejecutó nada…\n\njob.call  # ahora se ejecuta"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "code": "let fut = fetch_title(1);\n// ¡todavía no se ejecutó nada!\n\nlet title = fut.await;\n// ahora se ejecuta hasta terminar"
            },
            {
              "id": "w",
              "kind": "text",
              "style": "err",
              "html": "<b>warning</b>: unused implementer of `Future` that must be used\n  note: futures do nothing unless you `.await` or poll them"
            }
          ],
          "beats": [
            {
              "say": "Esta es la sorpresa número uno para quienes recién llegan. Llamar a una función async no la ejecuta.",
              "type": {
                "rs": 2
              }
            },
            {
              "say": "Devuelve un future, un valor que describe trabajo pendiente. Se comporta como una lambda de Ruby que todavía no has llamado.",
              "type": {
                "rb": "all"
              }
            },
            {
              "say": "El trabajo solo ocurre cuando le haces await al future.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  4
                ]
              }
            },
            {
              "say": "Si olvidas el await, el compilador te avisa. El future se creó y luego se descartó, así que tu código nunca se ejecutó.",
              "show": "w"
            }
          ]
        },
        {
          "type": "checkpoint",
          "q": "Un handler llama a <code>send_welcome_email(user).await</code>, pero quitas el <code>.await</code> para \"hacerlo más rápido\". ¿Qué pasa?",
          "options": [
            "El email se envía en segundo plano",
            "El email nunca se envía, y el compilador advierte sobre un future sin usar",
            "Hace panic en tiempo de ejecución",
            "Se envía dos veces"
          ],
          "answer": 1,
          "explain": "Los futures son perezosos. Sin <code>.await</code>, o sin <code>tokio::spawn</code>, el future se crea, se descarta y nunca se ejecuta.",
          "beats": [
            {
              "say": "Checkpoint. Este es un bug clásico. ¿Qué pasa si quitas el await?"
            }
          ]
        },
        {
          "title": "Concurrencia: join! y spawn",
          "layout": "split",
          "blocks": [
            {
              "id": "j",
              "kind": "code",
              "lang": "rust",
              "label": "join.rs",
              "size": 17,
              "code": "// secuencial: ~200ms\nlet a = fetch_title(1).await;\nlet b = fetch_title(2).await;\n\n// concurrente: ~100ms\nlet (a, b) = tokio::join!(\n    fetch_title(1),\n    fetch_title(2),\n);"
            },
            {
              "id": "s",
              "kind": "code",
              "lang": "rust",
              "label": "spawn.rs",
              "size": 17,
              "code": "// ≈ perform_later, pero en el proceso\nlet handle = tokio::spawn(async move {\n    send_welcome_email(user_id).await\n});\n\n// opcional: espéralo como Thread#join\nlet result = handle.await?;"
            }
          ],
          "beats": [
            {
              "say": "Hacer await de una cosa tras otra es secuencial. Dos llamadas de cien milisegundos tardan doscientos milisegundos.",
              "type": {
                "j": 3
              }
            },
            {
              "say": "tokio join ejecuta varios futures en forma concurrente y espera a todos, así que el total es de unos cien milisegundos.",
              "type": {
                "j": "all"
              },
              "lines": {
                "j": [
                  5,
                  6,
                  7,
                  8,
                  9
                ]
              }
            },
            {
              "say": "tokio spawn inicia una tarea independiente en segundo plano. Funciona como perform later, pero corre dentro de tu proceso, sin Redis.",
              "type": {
                "s": 4
              }
            },
            {
              "say": "Spawn devuelve un join handle. Hazle await si necesitas el resultado, igual que harías join a un thread de Ruby.",
              "type": {
                "s": "all"
              },
              "lines": {
                "s": [
                  7
                ]
              }
            },
            {
              "say": "Fíjate en async move. Una tarea lanzada con spawn puede vivir más que la función que la creó, así que debe ser dueña de sus datos. El compilador llama a este requisito static, y además exige Send para que la tarea pueda moverse entre threads.",
              "lines": {
                "s": [
                  2
                ]
              },
              "note": "Las tareas lanzadas con spawn se pierden si el proceso muere. Los jobs durables siguen necesitando una cola (p. ej. <code>apalis</code> o jobs sobre Postgres)."
            }
          ]
        },
        {
          "title": "No bloquees el runtime",
          "layout": "split",
          "blocks": [
            {
              "id": "bad",
              "kind": "code",
              "lang": "rust",
              "label": "❌ bloquea un worker thread",
              "size": 17,
              "code": "async fn sign_up(pw: String) -> String {\n    // pura CPU, ~250ms, sin .await\n    bcrypt::hash(pw, 12).unwrap()\n}\n\nasync fn slow() {\n    std::thread::sleep(ONE_SEC); // ❌\n}"
            },
            {
              "id": "good",
              "kind": "code",
              "lang": "rust",
              "label": "✅ delégalo",
              "size": 17,
              "code": "async fn sign_up(pw: String) -> String {\n    tokio::task::spawn_blocking(move || {\n        bcrypt::hash(pw, 12).unwrap()\n    })\n    .await\n    .unwrap()\n}\n\nasync fn slow() {\n    tokio::time::sleep(ONE_SEC).await; // ✅\n}"
            }
          ],
          "beats": [
            {
              "say": "Async tiene una gran regla: nunca bloquear. Un worker thread atascado en un cálculo pesado no puede ejecutar ninguna otra tarea.",
              "type": {
                "bad": 4
              }
            },
            {
              "say": "Hashear una contraseña es trabajo puro de CPU, sin nada que esperar. Si lo ejecutas dentro de una función async, todas las requests de ese thread se frenan.",
              "lines": {
                "bad": [
                  2,
                  3
                ]
              }
            },
            {
              "say": "El sleep bloqueante de la biblioteca estándar es todavía peor. Usa siempre la versión async de Tokio.",
              "type": {
                "bad": "all"
              },
              "lines": {
                "bad": [
                  7
                ]
              }
            },
            {
              "say": "Para trabajo pesado de CPU o bloqueante, envuélvelo en spawn blocking. Tokio lo ejecuta en un pool de threads aparte, hecho justo para esto.",
              "type": {
                "good": 7
              },
              "lines": {
                "good": [
                  2,
                  3,
                  4
                ]
              }
            },
            {
              "say": "Y para esperar, usa tokio time sleep, que cede el thread en lugar de retenerlo.",
              "type": {
                "good": "all"
              },
              "lines": {
                "good": [
                  10
                ]
              },
              "note": "Regla práctica: si tarda más de ~100µs sin un <code>.await</code>, delégalo."
            }
          ]
        },
        {
          "title": "Estado compartido: Arc + Mutex",
          "layout": "split",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "hits.rb",
              "code": "# estado a nivel de clase 😬\nclass Stats\n  @@hits = 0\n  def self.hit! = @@hits += 1\nend\n# o Rails.cache.increment(\"hits\")"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "size": 17,
              "code": "use std::sync::{Arc, Mutex};\n\nlet hits = Arc::new(Mutex::new(0u64));\n\nfor _ in 0..10 {\n    let hits = Arc::clone(&hits);\n    tokio::spawn(async move {\n        *hits.lock().unwrap() += 1;\n    });\n}"
            },
            {
              "id": "b",
              "kind": "bullets",
              "cls": "sm",
              "side": "left",
              "items": [
                {
                  "icon": "🔗",
                  "text": "<code>Arc</code> = propiedad compartida entre threads (conteo de referencias atómico)"
                },
                {
                  "icon": "🔒",
                  "text": "<code>Mutex</code> = un escritor a la vez; el lock se libera solo cuando se descarta"
                },
                {
                  "icon": "🛑",
                  "text": "Si olvidas cualquiera de los dos, el código <b>no compila</b>. Los data races son errores de tipo"
                }
              ]
            }
          ],
          "beats": [
            {
              "say": "A veces las tareas necesitan compartir estado, como un contador o una caché en memoria.",
              "type": {
                "rb": "all"
              }
            },
            {
              "say": "En Ruby podrías usar una variable de clase. Con varios threads, eso es una race condition silenciosa, y nada te avisa.",
              "lines": {
                "rb": [
                  3,
                  4
                ]
              }
            },
            {
              "say": "En Rust envuelves el valor en un Mutex, para que solo una tarea pueda cambiarlo a la vez, y en un Arc, para que muchas tareas puedan ser dueñas de él al mismo tiempo.",
              "type": {
                "rs": 3
              },
              "show": [
                "b.0",
                "b.1"
              ],
              "lines": {
                "rs": [
                  3
                ]
              }
            },
            {
              "say": "Cada tarea recibe su propio clon del Arc. Clonar un Arc es barato: solo incrementa un contador.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  6,
                  7,
                  8
                ]
              }
            },
            {
              "say": "Y aquí está la recompensa. Si omites el Arc o el Mutex, el programa no compila. En Rust, los data races son errores de tipo.",
              "show": "b.2"
            }
          ]
        }
      ],
      "summary": {
        "tldr": "Una <code>async fn</code> devuelve un <b>future</b> perezoso. No pasa nada hasta que le haces <code>.await</code>. <code>#[tokio::main]</code> inicia un runtime multi-thread sin GVL. Usa <code>join!</code> para concurrencia, <code>tokio::spawn</code> para tareas en segundo plano, <code>spawn_blocking</code> para trabajo pesado de CPU y <code>Arc&lt;Mutex&lt;T&gt;&gt;</code> para estado compartido.",
        "points": [
          "<code>async fn</code> devuelve un future. Es perezoso y no hace nada hasta que le haces <code>.await</code>.",
          "<code>#[tokio::main]</code> inicia un runtime: worker threads que ejecutan muchas tareas en paralelo de verdad (sin GVL).",
          "<code>tokio::join!</code> ejecuta futures en forma concurrente. <code>tokio::spawn</code> inicia una tarea independiente, como un <code>perform_later</code> dentro del proceso.",
          "Nunca bloquees dentro de código async. Usa <code>spawn_blocking</code> para trabajo de CPU y <code>tokio::time::sleep</code> para esperar.",
          "El estado mutable compartido necesita <code>Arc&lt;Mutex&lt;T&gt;&gt;</code>. Sin eso obtienes un error de compilación, no un data race."
        ],
        "rosetta": [
          [
            "Threads de Puma + GVL",
            "Worker threads de Tokio, sin lock global"
          ],
          [
            "Workers de Puma (procesos con fork)",
            "Un proceso, un thread por núcleo"
          ],
          [
            "<code>-&gt; { work }</code> (lambda, aún sin llamar)",
            "Un future (aún sin await)"
          ],
          [
            "<code>SomeJob.perform_later</code>",
            "<code>tokio::spawn(async move { … })</code>"
          ],
          [
            "<code>Thread#join</code>",
            "<code>handle.await</code>"
          ],
          [
            "<code>Concurrent::Promises.zip</code>",
            "<code>tokio::join!(a, b)</code>"
          ],
          [
            "<code>@@counter</code> / <code>Rails.cache.increment</code>",
            "<code>Arc&lt;Mutex&lt;u64&gt;&gt;</code> (o <code>AtomicU64</code>)"
          ],
          [
            "<code>sleep(1)</code>",
            "<code>tokio::time::sleep(d).await</code>"
          ]
        ],
        "gotchas": [
          "<code>.await</code> solo funciona dentro de una fn o un bloque <code>async</code>. <code>main</code> necesita <code>#[tokio::main]</code>.",
          "Las tareas lanzadas con spawn necesitan <code>async move</code> y datos propios (<code>'static</code>) que sean <code>Send</code>. Clona primero lo que necesites.",
          "No mantengas el guard de un <code>std::sync::Mutex</code> a través de un <code>.await</code>. Toma el lock, actualiza y suéltalo rápido.",
          "<code>tokio::spawn</code> no es durable. Si el proceso se reinicia, la tarea se pierde. Usa una cola de jobs real para el trabajo importante."
        ],
        "code": "#[tokio::main]\nasync fn main() {\n    // concurrente\n    let (a, b) = tokio::join!(fetch(1), fetch(2));\n\n    // tarea en segundo plano\n    let h = tokio::spawn(async move { fetch(3).await });\n    let c = h.await.unwrap();\n\n    // trabajo de CPU fuera de los threads async\n    let hash = tokio::task::spawn_blocking(|| expensive())\n        .await\n        .unwrap();\n}",
        "links": [
          [
            "Tutorial de Tokio",
            "https://tokio.rs/tokio/tutorial"
          ],
          [
            "Async Book (en inglés)",
            "https://rust-lang.github.io/async-book/"
          ],
          [
            "Alice Ryhl: Async: What is blocking?",
            "https://ryhl.io/blog/async-what-is-blocking/"
          ]
        ]
      },
      "quiz": [
        {
          "type": "mcq",
          "q": "¿Por qué un solo proceso de Rust puede usar todos los núcleos de CPU para atender requests y un proceso de Puma no?",
          "options": [
            "Rust tiene un GVL más rápido",
            "Rust no tiene un lock global de intérprete. Los worker threads de Tokio ejecutan tareas en paralelo de verdad",
            "Tokio hace fork de un proceso por request",
            "Rust usa green threads que corren en un solo núcleo"
          ],
          "answer": 1,
          "explain": "El GVL de Ruby deja que solo un thread ejecute código Ruby a la vez. Rust no tiene ese lock, y en su lugar el sistema de tipos previene los data races."
        },
        {
          "type": "compiles",
          "q": "¿Compila esto?",
          "code": "async fn get_count() -> u32 { 42 }\n\nfn main() {\n    let n = get_count().await;\n    println!(\"{n}\");\n}",
          "answer": false,
          "explain": "<code>.await</code> solo se permite dentro de funciones o bloques <code>async</code>. Usa <code>#[tokio::main] async fn main()</code>."
        },
        {
          "type": "fill",
          "q": "Completa el programa para que corra sobre Tokio y realmente ejecute el future.",
          "code": "#[tokio::___]\nasync fn main() {\n    let t = fetch_title(1).___;\n    println!(\"{t}\");\n}",
          "answers": [
            [
              "main"
            ],
            [
              "await"
            ]
          ],
          "explain": "<code>#[tokio::main]</code> configura el runtime, y <code>.await</code> ejecuta el future."
        },
        {
          "type": "match",
          "q": "Une cada concepto de Ruby/Rails con su contraparte en async Rust.",
          "pairs": [
            [
              "SomeJob.perform_later",
              "tokio::spawn"
            ],
            [
              "Thread#join",
              "handle.await"
            ],
            [
              "@@counter compartido entre threads",
              "Arc<Mutex<T>>"
            ],
            [
              "Worker threads de Puma",
              "Worker threads de Tokio"
            ]
          ],
          "explain": "Mismas ideas, distintas garantías: las versiones de Rust las verifica el compilador."
        },
        {
          "type": "mcq",
          "q": "Un handler debe ejecutar bcrypt (≈250ms de CPU pura). ¿Cuál es el enfoque correcto?",
          "options": [
            "Llamarlo directamente; está dentro de una async fn, así que no hay problema",
            "Envolverlo en <code>tokio::task::spawn_blocking</code> y hacer await del handle",
            "Agregar <code>.await</code> después de la llamada a bcrypt",
            "Usar <code>std::thread::sleep</code> para ceder el thread"
          ],
          "answer": 1,
          "explain": "El trabajo pesado de CPU o bloqueante frena a un worker de Tokio. <code>spawn_blocking</code> lo mueve a un pool hecho para eso."
        },
        {
          "type": "order",
          "q": "Ordena lo que pasa con <code>let h = tokio::spawn(fut); let v = h.await;</code>",
          "items": [
            "tokio::spawn entrega el future al runtime como una tarea en segundo plano",
            "Un worker thread ejecuta la tarea hasta que llega a un .await",
            "Mientras la tarea espera I/O, el thread queda libre para otras tareas",
            "La tarea termina",
            "h.await le entrega el resultado a tu código, como hacer join de un thread de Ruby"
          ],
          "explain": "Cada .await es un punto de pausa donde el thread puede cambiar a otro trabajo, y hacer await del join handle es como Thread#join."
        }
      ],
      "practice": [
        {
          "title": "Hazlo concurrente",
          "prompt": "Este programa obtiene tres posts uno tras otro, así que tarda unos 900ms. Usa <code>tokio::join!</code> (de la escena <i>Concurrencia: join! y spawn</i>) para que corran en forma <b>concurrente</b>. Cuando funcione, imprime los tres títulos y un tiempo cercano a <b>300ms</b>. Mientras tanto, la última línea hace panic: esa verificación ya viene dada, así que sabrás cuándo terminaste.",
          "starter": "use std::time::{Duration, Instant}; // Instant ya viene dado: es solo un cronómetro\nuse tokio::time::sleep;\n\nasync fn fetch_title(id: u32) -> String {\n    sleep(Duration::from_millis(300)).await; // I/O falsa, como en la lección\n    format!(\"Post #{id}\")\n}\n\n#[tokio::main]\nasync fn main() {\n    let start = Instant::now();\n\n    // TODO: estos tres corren uno tras otro (~900ms).\n    // Hazlos concurrentes con tokio::join! en su lugar.\n    let a = fetch_title(1).await;\n    let b = fetch_title(2).await;\n    let c = fetch_title(3).await;\n\n    println!(\"{a}, {b}, {c} in {:?}\", start.elapsed());\n\n    // dado: esta verificación hace panic si tardó 600ms o más\n    assert!(start.elapsed() < Duration::from_millis(600));\n}\n",
          "hints": [
            "Mira la diapositiva de join!: <code>let (a, b) = tokio::join!(fetch_title(1), fetch_title(2));</code>. Tú haces lo mismo con tres futures.",
            "Ya <b>no</b> le haces <code>.await</code> a cada llamada. Pon las tres llamadas dentro de <code>tokio::join!(...)</code> y borra las tres líneas <code>let ... = ... .await;</code>.",
            "<code>let (a, b, c) = tokio::join!(fetch_title(1), fetch_title(2), fetch_title(3));</code>"
          ],
          "solution": "use std::time::{Duration, Instant}; // Instant ya viene dado: es solo un cronómetro\nuse tokio::time::sleep;\n\nasync fn fetch_title(id: u32) -> String {\n    sleep(Duration::from_millis(300)).await; // I/O falsa, como en la lección\n    format!(\"Post #{id}\")\n}\n\n#[tokio::main]\nasync fn main() {\n    let start = Instant::now();\n\n    let (a, b, c) = tokio::join!(fetch_title(1), fetch_title(2), fetch_title(3));\n\n    println!(\"{a}, {b}, {c} in {:?}\", start.elapsed());\n\n    // dado: esta verificación hace panic si tardó 600ms o más\n    assert!(start.elapsed() < Duration::from_millis(600));\n}\n",
          "explain": "Los tres futures esperan sus timers al mismo tiempo, así que el total es aproximadamente el del más lento (300ms), no la suma (900ms). <code>Instant</code> y el <code>assert!</code> solo estaban para medir y comprobar tu respuesta."
        },
        {
          "title": "Un contador de visitas thread-safe",
          "prompt": "Lanza 100 tareas que sumen 1 a un contador compartido. Escribe solo el <b>cuerpo del loop</b>: tres líneas con el mismo patrón de la diapositiva de <i>Estado compartido: Arc + Mutex</i>, más guardar cada handle. El código que espera a las tareas y revisa el total ya viene dado. Cuando funcione, imprime <code>hits = 100</code>. Mientras tanto imprime <code>hits = 0</code> y hace panic, y eso es lo esperado.",
          "starter": "use std::sync::{Arc, Mutex};\n\n#[tokio::main]\nasync fn main() {\n    let hits = Arc::new(Mutex::new(0u64));\n    // dado: una lista donde guardamos los join handles, para esperar a las tareas más abajo\n    let mut handles: Vec<tokio::task::JoinHandle<()>> = Vec::new();\n\n    for _ in 0..100 {\n        // TODO: escribe el cuerpo del loop, con el mismo patrón de la diapositiva de Arc + Mutex:\n        //   1. clona el Arc en una variable nueva que también se llame `hits`\n        //   2. lanza con tokio::spawn una tarea `async move` que sume 1 al contador\n        //   3. mete en `handles` el handle que devuelve tokio::spawn\n    }\n\n    // dado: espera a que terminen las 100 tareas\n    for h in handles {\n        h.await.unwrap();\n    }\n\n    let total = *hits.lock().unwrap();\n    println!(\"hits = {total}\");\n    assert_eq!(total, 100); // dado: hace panic si la cuenta está mal\n}\n",
          "hints": [
            "Patrón de la diapositiva: <code>let hits = Arc::clone(&amp;hits);</code> va primero dentro del loop, para que cada tarea tenga su propio acceso al contador.",
            "Después <code>tokio::spawn(async move { *hits.lock().unwrap() += 1; })</code>. Devuelve un join handle.",
            "<code>handles.push(tokio::spawn(async move { *hits.lock().unwrap() += 1; }));</code>"
          ],
          "solution": "use std::sync::{Arc, Mutex};\n\n#[tokio::main]\nasync fn main() {\n    let hits = Arc::new(Mutex::new(0u64));\n    // dado: una lista donde guardamos los join handles, para esperar a las tareas más abajo\n    let mut handles: Vec<tokio::task::JoinHandle<()>> = Vec::new();\n\n    for _ in 0..100 {\n        let hits = Arc::clone(&hits);\n        handles.push(tokio::spawn(async move {\n            *hits.lock().unwrap() += 1;\n        }));\n    }\n\n    // dado: espera a que terminen las 100 tareas\n    for h in handles {\n        h.await.unwrap();\n    }\n\n    let total = *hits.lock().unwrap();\n    println!(\"hits = {total}\");\n    assert_eq!(total, 100); // dado: hace panic si la cuenta está mal\n}\n",
          "explain": "Prueba a borrar la línea de <code>Arc::clone</code>: el compilador lo rechaza (E0382), porque la primera tarea se llevaría el contador y las demás se quedarían sin él. Compartir estado mutable entre tareas sin sincronización es un error de tipos."
        }
      ]
    },
    {
      "id": "axum-routing",
      "title": "Axum: rutas, controllers y JSON",
      "subtitle": "routes.rb, controllers, params y render json, reconstruidos como un Router tipado, handlers y extractors.",
      "tags": [
        "axum",
        "routing",
        "controllers",
        "json",
        "serde",
        "extractors",
        "middleware",
        "tower"
      ],
      "scenes": [
        {
          "type": "title",
          "kicker": "Módulo 5 · Lección 2",
          "title": "Axum: rutas, controllers y JSON",
          "subtitle": "Tu primer scaffold en Rust: GET /posts, GET /posts/{id}, POST /posts.",
          "beats": [
            {
              "say": "Es hora de construir la API. Usaremos Axum, el framework web más popular de Rust, creado por el equipo de Tokio."
            },
            {
              "say": "Nuestra meta es la versión en Rust de un scaffold de Rails para posts, empezando por las rutas y los controllers."
            }
          ]
        },
        {
          "title": "routes.rb → Router",
          "layout": "split",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "config/routes.rb",
              "code": "Rails.application.routes.draw do\n  resources :posts,\n    only: [:index, :show, :create]\nend"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "label": "src/main.rs",
              "size": 16,
              "code": "let app = Router::new()\n    .route(\"/posts\", get(index).post(create))\n    .route(\"/posts/{id}\", get(show))\n    .with_state(state);\n\nlet listener =\n    TcpListener::bind(\"0.0.0.0:3000\").await?;\n\naxum::serve(listener, app).await?;"
            }
          ],
          "beats": [
            {
              "say": "En Rails, una sola línea resources genera las rutas. Es cómodo, y un poco mágico.",
              "type": {
                "rb": "all"
              }
            },
            {
              "say": "Axum no tiene un macro resources. Construyes un Router y declaras cada ruta tú mismo.",
              "type": {
                "rs": 1
              }
            },
            {
              "say": "Cada ruta asocia un método HTTP con una función handler. Get index y post create comparten la ruta posts.",
              "type": {
                "rs": 2
              },
              "lines": {
                "rs": [
                  2
                ]
              }
            },
            {
              "say": "Los parámetros de ruta van entre llaves, así que barra posts barra id se convierte en la ruta show.",
              "type": {
                "rs": 3
              },
              "lines": {
                "rs": [
                  3
                ]
              },
              "note": "Axum 0.8 usa <code>{id}</code>. Los tutoriales antiguos usan <code>:id</code>, que ahora hace panic al arrancar."
            },
            {
              "say": "Luego agregas el estado compartido, abres un listener TCP y sirves la app. Ese es todo tu config punto ru.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  4,
                  6,
                  7,
                  9
                ]
              }
            }
          ]
        },
        {
          "title": "La vida de una request",
          "blocks": [
            {
              "id": "d",
              "kind": "diagram",
              "w": 1150,
              "h": 330,
              "boxes": [
                {
                  "id": "rq",
                  "x": 0,
                  "y": 30,
                  "w": 165,
                  "h": 86,
                  "label": "GET",
                  "sub": "/posts/42",
                  "cls": "info"
                },
                {
                  "id": "rt",
                  "x": 197,
                  "y": 30,
                  "w": 165,
                  "h": 86,
                  "label": "Router",
                  "sub": "busca la ruta",
                  "cls": "rust"
                },
                {
                  "id": "ex",
                  "x": 394,
                  "y": 30,
                  "w": 165,
                  "h": 86,
                  "label": "Extractors",
                  "sub": "Path(42), State",
                  "cls": "rust"
                },
                {
                  "id": "hd",
                  "x": 591,
                  "y": 30,
                  "w": 165,
                  "h": 86,
                  "label": "show()",
                  "sub": "tu handler",
                  "cls": "rust"
                },
                {
                  "id": "ir",
                  "x": 788,
                  "y": 30,
                  "w": 165,
                  "h": 86,
                  "label": "IntoResponse",
                  "sub": "Json / StatusCode",
                  "cls": "rust"
                },
                {
                  "id": "rs",
                  "x": 985,
                  "y": 30,
                  "w": 165,
                  "h": 86,
                  "label": "200 OK",
                  "sub": "application/json",
                  "cls": "ok"
                },
                {
                  "id": "r1",
                  "x": 0,
                  "y": 220,
                  "w": 165,
                  "h": 86,
                  "label": "Rack",
                  "sub": "middleware",
                  "cls": "ruby"
                },
                {
                  "id": "r2",
                  "x": 197,
                  "y": 220,
                  "w": 165,
                  "h": 86,
                  "label": "routes.rb",
                  "sub": "resources",
                  "cls": "ruby"
                },
                {
                  "id": "r3",
                  "x": 394,
                  "y": 220,
                  "w": 165,
                  "h": 86,
                  "label": "params",
                  "sub": "params[:id]",
                  "cls": "ruby"
                },
                {
                  "id": "r4",
                  "x": 591,
                  "y": 220,
                  "w": 165,
                  "h": 86,
                  "label": "#show",
                  "sub": "PostsController",
                  "cls": "ruby"
                },
                {
                  "id": "r5",
                  "x": 788,
                  "y": 220,
                  "w": 165,
                  "h": 86,
                  "label": "render",
                  "sub": "json: @post",
                  "cls": "ruby"
                },
                {
                  "id": "r6",
                  "x": 985,
                  "y": 220,
                  "w": 165,
                  "h": 86,
                  "label": "200 OK",
                  "sub": "as_json",
                  "cls": "ok"
                }
              ],
              "arrows": [
                {
                  "id": "a1",
                  "from": "rq",
                  "to": "rt",
                  "cls": "rust"
                },
                {
                  "id": "a2",
                  "from": "rt",
                  "to": "ex",
                  "cls": "rust"
                },
                {
                  "id": "a3",
                  "from": "ex",
                  "to": "hd",
                  "cls": "rust"
                },
                {
                  "id": "a4",
                  "from": "hd",
                  "to": "ir",
                  "cls": "rust"
                },
                {
                  "id": "a5",
                  "from": "ir",
                  "to": "rs",
                  "cls": "ok"
                },
                {
                  "id": "b1",
                  "from": "r1",
                  "to": "r2",
                  "cls": "dash"
                },
                {
                  "id": "b2",
                  "from": "r2",
                  "to": "r3",
                  "cls": "dash"
                },
                {
                  "id": "b3",
                  "from": "r3",
                  "to": "r4",
                  "cls": "dash"
                },
                {
                  "id": "b4",
                  "from": "r4",
                  "to": "r5",
                  "cls": "dash"
                },
                {
                  "id": "b5",
                  "from": "r5",
                  "to": "r6",
                  "cls": "dash"
                }
              ]
            },
            {
              "id": "t",
              "kind": "text",
              "style": "callout",
              "html": "El mismo pipeline que Rails. La diferencia: cada paso es <em>tipado</em>, así que un <code>id</code> inválido se rechaza con 400 antes de que tu handler llegue a ejecutarse."
            }
          ],
          "beats": [
            {
              "say": "Sigamos una request a través de Axum: get barra posts barra cuarenta y dos.",
              "show": [
                "d.rq"
              ]
            },
            {
              "say": "Primero, el router compara el método y la ruta, igual que routes punto r b.",
              "show": [
                "d.rt",
                "d.a1"
              ]
            },
            {
              "say": "Después vienen los extractors. Sacan valores tipados de la request: el parámetro de ruta como número y el estado compartido de tu app.",
              "show": [
                "d.ex",
                "d.a2"
              ],
              "hl": [
                "d.ex"
              ]
            },
            {
              "say": "Luego se ejecuta tu handler. Es una función async común y corriente, el equivalente a una acción de controller.",
              "show": [
                "d.hd",
                "d.a3"
              ]
            },
            {
              "say": "Lo que devuelva se convierte en una respuesta HTTP mediante el trait IntoResponse.",
              "show": [
                "d.ir",
                "d.a4",
                "d.rs",
                "d.a5"
              ]
            },
            {
              "say": "Si pones Rails debajo, las formas coinciden: Rack, routes, params, controller, render.",
              "show": [
                "d.r1",
                "d.r2",
                "d.r3",
                "d.r4",
                "d.r5",
                "d.r6",
                "d.b1",
                "d.b2",
                "d.b3",
                "d.b4",
                "d.b5"
              ]
            },
            {
              "say": "La gran diferencia son los tipos. Si el id no es un número, el extractor rechaza la request con un cuatrocientos antes de que corra tu código.",
              "show": "t"
            }
          ]
        },
        {
          "title": "Acción de controller → handler",
          "layout": "split",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "posts_controller.rb",
              "size": 17,
              "code": "class PostsController < ApplicationController\n  def show\n    post = Post.find(params[:id])\n    render json: post\n  end\nend"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "label": "handlers.rs",
              "size": 17,
              "code": "async fn show(\n    State(state): State<AppState>,\n    Path(id): Path<i64>,\n) -> Result<Json<Post>, StatusCode> {\n    state.repo\n        .find(id)\n        .await\n        .map(Json)\n        .ok_or(StatusCode::NOT_FOUND)\n}"
            }
          ],
          "beats": [
            {
              "say": "Esta es una acción show clásica. Lee el id de params, busca el post y renderiza JSON.",
              "type": {
                "rb": "all"
              }
            },
            {
              "say": "En Axum, un handler es una función async. Sus parámetros son extractors, y Axum los completa a partir de la request.",
              "type": {
                "rs": 4
              },
              "lines": {
                "rs": [
                  1,
                  2,
                  3
                ]
              }
            },
            {
              "say": "Path de i64 es params id, ya convertido a número. State te da cosas compartidas, como el pool de la base de datos.",
              "lines": {
                "rs": [
                  2,
                  3
                ]
              },
              "note": "El patrón <code>Path(id)</code> desestructura el extractor directamente en la lista de argumentos."
            },
            {
              "say": "El tipo de retorno documenta todos los resultados posibles: el JSON de un post, o un código de estado de error.",
              "lines": {
                "rs": [
                  4
                ]
              }
            },
            {
              "say": "find devuelve un Option. Envolvemos el post encontrado en Json y convertimos None en un cuatrocientos cuatro. Es el record not found de Rails, pero explícito.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  8,
                  9
                ]
              }
            }
          ]
        },
        {
          "title": "Strong params y as_json → serde",
          "layout": "split",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "posts_controller.rb",
              "code": "def post_params\n  params.require(:post)\n        .permit(:title, :body,\n                :published)\nend\n\n# render json: post\n#   → post.as_json"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "label": "models.rs",
              "size": 15,
              "code": "#[derive(Serialize)]       // → JSON de salida\nstruct Post {\n    id: i64,\n    title: String,\n    body: String,\n    published: bool,\n}\n\n#[derive(Deserialize)]     // ← JSON de entrada\nstruct NewPost {\n    title: String,\n    body: String,\n    #[serde(default)]      // opcional, false\n    published: bool,\n}"
            }
          ],
          "beats": [
            {
              "say": "Rails necesita strong params para filtrar la entrada, y as json para darle forma a la salida.",
              "type": {
                "rb": "all"
              }
            },
            {
              "say": "Rust usa serde para ambas cosas. Si derivas Serialize en un struct, se puede convertir en JSON.",
              "type": {
                "rs": 7
              },
              "lines": {
                "rs": [
                  1
                ]
              }
            },
            {
              "say": "Si derivas Deserialize en un struct de entrada, ese struct pasa a ser tus strong params. Solo se aceptan estos campos, con estos tipos.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  9,
                  10,
                  11,
                  12
                ]
              }
            },
            {
              "say": "Los atributos ajustan el comportamiento. Con serde default, published es opcional y vale false por defecto.",
              "lines": {
                "rs": [
                  13,
                  14
                ]
              },
              "note": "Por defecto, los campos desconocidos se ignoran. Agrega <code>#[serde(deny_unknown_fields)]</code> para rechazarlos."
            }
          ]
        },
        {
          "title": "Crear: entra Json, sale 201",
          "layout": "split",
          "blocks": [
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "label": "handlers.rs",
              "size": 17,
              "code": "async fn create(\n    State(state): State<AppState>,\n    Json(input): Json<NewPost>,  // ¡al final!\n) -> (StatusCode, Json<Post>) {\n    let post = state.repo.insert(input).await;\n    (StatusCode::CREATED, Json(post))\n}\n\nasync fn index(\n    State(state): State<AppState>,\n    Query(page): Query<Pagination>,\n) -> Json<Vec<Post>> {\n    Json(state.repo.list(page).await)\n}"
            },
            {
              "id": "t",
              "kind": "table",
              "cls": "sm",
              "head": [
                "Request inválida",
                "Axum responde"
              ],
              "rows": [
                [
                  "JSON mal formado",
                  "<code>400</code> Bad Request"
                ],
                [
                  "Campo faltante o con tipo incorrecto",
                  "<code>422</code> Unprocessable"
                ],
                [
                  "Sin content-type JSON",
                  "<code>415</code> Unsupported"
                ],
                [
                  "<code>/posts/abc</code>",
                  "<code>400</code> (parseo de Path)"
                ]
              ]
            }
          ],
          "beats": [
            {
              "say": "La acción create recibe un extractor Json, que deserializa el body de la request en el struct New Post.",
              "type": {
                "rs": 3
              },
              "lines": {
                "rs": [
                  3
                ]
              }
            },
            {
              "say": "El orden importa. El body solo se puede leer una vez, así que un extractor de body como Json debe ser el último argumento.",
              "lines": {
                "rs": [
                  3
                ]
              },
              "note": "Los extractors de body (<code>Json</code>, <code>Form</code>, <code>String</code>) van al final."
            },
            {
              "say": "Devolver una tupla con un código de estado y JSON te da un doscientos uno Created, como render json con status created.",
              "type": {
                "rs": 7
              },
              "lines": {
                "rs": [
                  4,
                  6
                ]
              }
            },
            {
              "say": "Para index, el extractor Query parsea el query string, algo muy útil para los parámetros de paginación.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  11
                ]
              }
            },
            {
              "say": "Y la entrada inválida nunca llega a tu código. Axum la rechaza automáticamente con el status correcto.",
              "show": [
                "t.0",
                "t.1",
                "t.2",
                "t.3"
              ]
            }
          ]
        },
        {
          "type": "checkpoint",
          "q": "¿Qué definición de ruta es correcta en <b>Axum 0.8</b>?",
          "options": [
            "<code>.route(\"/posts/:id\", get(show))</code>",
            "<code>.route(\"/posts/{id}\", get(show))</code>",
            "<code>.route(\"/posts/&lt;id&gt;\", get(show))</code>",
            "<code>resources!(posts)</code>"
          ],
          "answer": 1,
          "explain": "Axum 0.8 cambió a <code>{param}</code> (y <code>{*rest}</code> para comodines). La sintaxis antigua <code>:id</code> hace panic al construir el router.",
          "beats": [
            {
              "say": "Checkpoint. En internet vas a encontrar tutoriales antiguos, así que ¿cuál es la sintaxis actual?"
            }
          ]
        },
        {
          "title": "Estado y middleware",
          "layout": "split",
          "blocks": [
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "size": 16,
              "code": "#[derive(Clone)]\nstruct AppState {\n    repo: Arc<PostRepo>,\n}\n\nlet app = Router::new()\n    .route(\"/posts\", get(index).post(create))\n    .route(\"/posts/{id}\", get(show))\n    .layer(TraceLayer::new_for_http())\n    .layer(CorsLayer::permissive())\n    .with_state(AppState {\n        repo: Arc::new(repo),\n    });"
            },
            {
              "id": "t",
              "kind": "table",
              "cls": "sm",
              "head": [
                "Rails",
                "Axum / tower"
              ],
              "rows": [
                [
                  "Middleware de Rack",
                  "<code>Layer</code> de <code>tower</code>"
                ],
                [
                  "<code>config.middleware.use</code>",
                  "<code>.layer(…)</code>"
                ],
                [
                  "<code>rack-cors</code>",
                  "<code>CorsLayer</code>"
                ],
                [
                  "Logging de requests",
                  "<code>TraceLayer</code>"
                ],
                [
                  "<code>before_action</code>",
                  "<code>middleware::from_fn</code>"
                ]
              ]
            }
          ],
          "beats": [
            {
              "say": "El estado compartido es un struct que deriva Clone. Axum lo clona en cada request, así que envuelve las partes costosas en un Arc para que clonar sea barato.",
              "type": {
                "rs": 4
              },
              "lines": {
                "rs": [
                  1,
                  2,
                  3
                ]
              }
            },
            {
              "say": "El middleware viene del ecosistema tower y se agrega con layer. Es el Rack de Rust.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  9,
                  10
                ]
              },
              "show": [
                "t.0",
                "t.1"
              ]
            },
            {
              "say": "El crate tower http te da layers listos para usar: CORS como rack cors, tracing de requests, compresión y timeouts.",
              "show": [
                "t.2",
                "t.3"
              ]
            },
            {
              "say": "Y un before action se convierte en una función middleware, o en un extractor propio que autentica al usuario.",
              "show": "t.4",
              "note": "Un extractor como <code>CurrentUser</code> que falla con 401 es el <code>authenticate_user!</code> idiomático."
            }
          ]
        }
      ],
      "summary": {
        "tldr": "Una app de Axum es un <code>Router</code> que asocia <code>método + ruta</code> con <b>handlers</b> async. Los argumentos del handler son <b>extractors</b> (<code>Path</code>, <code>Query</code>, <code>Json</code>, <code>State</code>) que reemplazan a <code>params</code>. Los valores de retorno implementan <code>IntoResponse</code>. <code>Serialize</code>/<code>Deserialize</code> de serde reemplazan a <code>as_json</code> y a los strong params. El middleware es un <code>Layer</code> de tower.",
        "points": [
          "<code>Router::new().route(\"/posts/{id}\", get(show))</code>: rutas explícitas, y Axum 0.8 usa <code>{param}</code>.",
          "Los handlers son async fns. Los extractors en sus argumentos convierten la request en valores tipados y rechazan automáticamente la entrada inválida.",
          "Los extractors de body, como <code>Json&lt;T&gt;</code>, deben ser el <b>último</b> argumento.",
          "Los structs de entrada con <code>#[derive(Deserialize)]</code> son strong params, y <code>#[derive(Serialize)]</code> reemplaza a <code>as_json</code>.",
          "Devuelve cualquier cosa que implemente <code>IntoResponse</code>. Comparte estado con <code>.with_state</code> y agrega middleware con <code>.layer(...)</code>."
        ],
        "rosetta": [
          [
            "<code>config/routes.rb</code>",
            "<code>Router::new().route(...)</code>"
          ],
          [
            "<code>resources :posts</code>",
            "<code>.route(\"/posts\", get(index).post(create))</code> explícito"
          ],
          [
            "Acción de controller",
            "Handler <code>async fn</code>"
          ],
          [
            "<code>params[:id]</code>",
            "<code>Path(id): Path&lt;i64&gt;</code>"
          ],
          [
            "<code>params[:page]</code> (query string)",
            "<code>Query(p): Query&lt;Pagination&gt;</code>"
          ],
          [
            "Strong params",
            "<code>#[derive(Deserialize)] struct NewPost</code>"
          ],
          [
            "<code>render json: post, status: :created</code>",
            "<code>(StatusCode::CREATED, Json(post))</code>"
          ],
          [
            "<code>as_json</code> / serializers",
            "<code>#[derive(Serialize)]</code>"
          ],
          [
            "Middleware de Rack",
            "<code>Layer</code> de tower vía <code>.layer()</code>"
          ]
        ],
        "gotchas": [
          "<code>\"/posts/:id\"</code>, de tutoriales antiguos, hace panic en Axum 0.8. Usa <code>\"/posts/{id}\"</code>.",
          "Un handler con los argumentos en el orden equivocado (p. ej. <code>Json</code> antes que <code>State</code>) da un error confuso: \"trait <code>Handler</code> is not implemented\". Agrega <code>#[axum::debug_handler]</code> para obtener un mensaje más claro.",
          "Tu tipo de estado debe ser <code>Clone</code>. Envuelve en <code>Arc</code> lo que no sea Clone."
        ],
        "code": "use axum::{extract::{Path, State}, http::StatusCode, routing::get, Json, Router};\n\n#[tokio::main]\nasync fn main() {\n    let state = AppState::new();\n    let app = Router::new()\n        .route(\"/posts\", get(index).post(create))\n        .route(\"/posts/{id}\", get(show))\n        .with_state(state);\n\n    let listener = tokio::net::TcpListener::bind(\"0.0.0.0:3000\").await.unwrap();\n    axum::serve(listener, app).await.unwrap();\n}",
        "links": [
          [
            "Documentación de Axum",
            "https://docs.rs/axum/latest/axum/"
          ],
          [
            "Ejemplos de Axum",
            "https://github.com/tokio-rs/axum/tree/main/examples"
          ],
          [
            "Guía de serde",
            "https://serde.rs/"
          ],
          [
            "tower-http",
            "https://docs.rs/tower-http/"
          ]
        ]
      },
      "quiz": [
        {
          "type": "match",
          "q": "Une cada concepto de Rails con su contraparte en Axum.",
          "pairs": [
            [
              "params[:id]",
              "Path(id)"
            ],
            [
              "Strong params",
              "#[derive(Deserialize)] struct"
            ],
            [
              "render json: post",
              "Json(post)"
            ],
            [
              "Middleware de Rack",
              "tower Layer"
            ],
            [
              "config/routes.rb",
              "Router::new().route(...)"
            ]
          ]
        },
        {
          "type": "fill",
          "q": "Completa la ruta show y su extractor (Axum 0.8).",
          "code": ".route(\"/posts/___\", get(show))\n\nasync fn show(___(id): Path<i64>) -> String {\n    format!(\"post {id}\")\n}",
          "answers": [
            [
              "{id}"
            ],
            [
              "Path"
            ]
          ],
          "explain": "Los parámetros de ruta usan <code>{nombre}</code>, y el patrón <code>Path(id)</code> desestructura el extractor."
        },
        {
          "type": "compiles",
          "q": "Este handler se registra con <code>.route(\"/posts\", post(create))</code>. ¿Compila?",
          "code": "async fn create(\n    Json(input): Json<NewPost>,\n    State(state): State<AppState>,\n) -> StatusCode {\n    StatusCode::CREATED\n}",
          "answer": false,
          "explain": "<code>Json</code> consume el body de la request, así que debe ser el último argumento. En este orden, la función no implementa <code>Handler</code>."
        },
        {
          "type": "mcq",
          "q": "Un cliente hace POST de <code>{\"body\": \"hi\"}</code> (sin <code>title</code>) a un handler que recibe <code>Json&lt;NewPost&gt;</code>. ¿Qué pasa?",
          "options": [
            "Tu handler se ejecuta con <code>title</code> como string vacío",
            "Axum responde 422 Unprocessable Entity antes de que se ejecute tu handler",
            "El servidor hace panic",
            "Axum responde 500"
          ],
          "answer": 1,
          "explain": "El JSON se parsea, pero no coincide con el struct, así que el extractor <code>Json</code> lo rechaza con 422."
        },
        {
          "type": "order",
          "q": "Ordena los pasos que sigue Axum para atender <code>GET /posts/42</code>.",
          "items": [
            "El Router compara método + ruta",
            "Los extractors parsean Path(42) y State",
            "Se ejecuta el handler",
            "El valor de retorno se convierte con IntoResponse",
            "El cliente recibe un 200 OK con JSON"
          ],
          "explain": "Es el pipeline del diagrama de la request: router, extractors, handler, IntoResponse y respuesta."
        },
        {
          "type": "mcq",
          "q": "¿Qué tipo de retorno le da al cliente un <b>201 Created</b> con el post como JSON?",
          "options": [
            "<code>Json&lt;Post&gt;</code>",
            "<code>(StatusCode, Json&lt;Post&gt;)</code> devolviendo <code>(StatusCode::CREATED, Json(post))</code>",
            "<code>Result&lt;Post, ()&gt;</code>",
            "<code>String</code>"
          ],
          "answer": 1,
          "explain": "Las tuplas <code>(StatusCode, impl IntoResponse)</code> implementan <code>IntoResponse</code> y sobrescriben el status."
        }
      ],
      "practice": [
        {
          "title": "Escribe dos handlers",
          "prompt": "En el Playground no se puede correr Axum, así que los tipos de axum son versiones mínimas y el repositorio es falso. Ambos ya vienen dados, así que casi todo el archivo es andamiaje que puedes saltarte: solo los dos <code>TODO</code> son tuyos. Tu trabajo son los cuerpos de los dos handlers, con las mismas formas de las escenas <i>Acción de controller → handler</i> y <i>Crear: entra Json, sale 201</i>.<br/>• <code>show</code>: el post como JSON, o <code>404</code> si no existe.<br/>• <code>create</code>: inserta y responde <code>201 Created</code> con el post nuevo como JSON.<br/>Cuando ambos funcionen, imprime:<br/><code>Ok(Json(Post { id: 1, title: \"First post\" }))</code><br/><code>Err(StatusCode(404))</code><br/><code>(StatusCode(201), Json(Post { id: 2, title: \"Hello\" }))</code><br/>Mientras tanto, <code>todo!()</code> hace panic con “not yet implemented”.",
          "starter": "// --- dado: versiones mínimas de los tipos de axum, para que corra en el Playground ---\n#[derive(Debug, PartialEq)]\nstruct StatusCode(u16);\nimpl StatusCode {\n    const CREATED: StatusCode = StatusCode(201);\n    const NOT_FOUND: StatusCode = StatusCode(404);\n}\n\n#[derive(Debug, PartialEq)]\nstruct Json<T>(T);\n\n#[derive(Debug, PartialEq)]\nstruct Post {\n    id: i64,\n    title: String,\n}\n\nstruct NewPost {\n    title: String,\n}\n\n// --- dado: un repositorio falso (el real hablaría con la base de datos) ---\nstruct PostRepo;\n\nimpl PostRepo {\n    async fn find(&self, id: i64) -> Option<Post> {\n        if id == 1 {\n            Some(Post { id: 1, title: \"First post\".to_string() })\n        } else {\n            None\n        }\n    }\n\n    async fn insert(&self, input: NewPost) -> Post {\n        Post { id: 2, title: input.title }\n    }\n}\n\n// TODO 1: como el `show` de Rails. Busca el post y responde Json(post), o 404 si no existe.\n// (`todo!()` es un marcador: compila, pero hace panic si se ejecuta. Reemplázalo con tu código.)\nasync fn show(repo: &PostRepo, id: i64) -> Result<Json<Post>, StatusCode> {\n    todo!()\n}\n\n// TODO 2: como el `create` de Rails. Inserta el post y responde 201 Created con el post nuevo como JSON.\nasync fn create(repo: &PostRepo, input: NewPost) -> (StatusCode, Json<Post>) {\n    todo!()\n}\n\n#[tokio::main]\nasync fn main() {\n    let repo = PostRepo;\n\n    let found = show(&repo, 1).await;\n    let missing = show(&repo, 99).await;\n    let created = create(&repo, NewPost { title: \"Hello\".to_string() }).await;\n    println!(\"{found:?}\");\n    println!(\"{missing:?}\");\n    println!(\"{created:?}\");\n\n    // dado: esto hace panic si algún handler está mal\n    assert_eq!(found, Ok(Json(Post { id: 1, title: \"First post\".to_string() })));\n    assert_eq!(missing, Err(StatusCode::NOT_FOUND));\n    assert_eq!(created.0, StatusCode::CREATED);\n}\n",
          "hints": [
            "<code>repo.find(id).await</code> da un <code>Option&lt;Post&gt;</code>. La escena <i>Acción de controller → handler</i> lo convierte en la respuesta con una sola cadena.",
            "Encadena <code>.map(Json)</code> para envolver un post encontrado, y luego <code>.ok_or(StatusCode::NOT_FOUND)</code> para convertir <code>None</code> en el error.",
            "<code>show</code>: <code>repo.find(id).await.map(Json).ok_or(StatusCode::NOT_FOUND)</code>. <code>create</code>: <code>let post = repo.insert(input).await;</code> y luego devuelve la tupla <code>(StatusCode::CREATED, Json(post))</code>."
          ],
          "solution": "// --- dado: versiones mínimas de los tipos de axum, para que corra en el Playground ---\n#[derive(Debug, PartialEq)]\nstruct StatusCode(u16);\nimpl StatusCode {\n    const CREATED: StatusCode = StatusCode(201);\n    const NOT_FOUND: StatusCode = StatusCode(404);\n}\n\n#[derive(Debug, PartialEq)]\nstruct Json<T>(T);\n\n#[derive(Debug, PartialEq)]\nstruct Post {\n    id: i64,\n    title: String,\n}\n\nstruct NewPost {\n    title: String,\n}\n\n// --- dado: un repositorio falso (el real hablaría con la base de datos) ---\nstruct PostRepo;\n\nimpl PostRepo {\n    async fn find(&self, id: i64) -> Option<Post> {\n        if id == 1 {\n            Some(Post { id: 1, title: \"First post\".to_string() })\n        } else {\n            None\n        }\n    }\n\n    async fn insert(&self, input: NewPost) -> Post {\n        Post { id: 2, title: input.title }\n    }\n}\n\nasync fn show(repo: &PostRepo, id: i64) -> Result<Json<Post>, StatusCode> {\n    repo.find(id).await.map(Json).ok_or(StatusCode::NOT_FOUND)\n}\n\nasync fn create(repo: &PostRepo, input: NewPost) -> (StatusCode, Json<Post>) {\n    let post = repo.insert(input).await;\n    (StatusCode::CREATED, Json(post))\n}\n\n#[tokio::main]\nasync fn main() {\n    let repo = PostRepo;\n\n    let found = show(&repo, 1).await;\n    let missing = show(&repo, 99).await;\n    let created = create(&repo, NewPost { title: \"Hello\".to_string() }).await;\n    println!(\"{found:?}\");\n    println!(\"{missing:?}\");\n    println!(\"{created:?}\");\n\n    // dado: esto hace panic si algún handler está mal\n    assert_eq!(found, Ok(Json(Post { id: 1, title: \"First post\".to_string() })));\n    assert_eq!(missing, Err(StatusCode::NOT_FOUND));\n    assert_eq!(created.0, StatusCode::CREATED);\n}\n",
          "explain": "En la app real, los parámetros serían extractors (<code>State(state)</code>, <code>Path(id)</code>, <code>Json(input)</code>) y los tipos vendrían de <code>axum</code>. Los cuerpos serían los mismos. Los tipos de retorno sirven de documentación: <code>Result&lt;Json&lt;Post&gt;, StatusCode&gt;</code> enumera todos los resultados posibles."
        }
      ]
    },
    {
      "id": "sqlx-database",
      "title": "SQLx: SQL sin ActiveRecord",
      "subtitle": "Migraciones, un pool de conexiones, consultas verificadas al compilar y errores que se convierten en 404.",
      "tags": [
        "sqlx",
        "database",
        "postgres",
        "activerecord",
        "migrations",
        "orm",
        "transactions"
      ],
      "scenes": [
        {
          "type": "title",
          "kicker": "Módulo 5 · Lección 3",
          "title": "SQLx: SQL sin ActiveRecord",
          "subtitle": "Tú escribes el SQL. El compilador lo verifica contra tu base de datos real.",
          "beats": [
            {
              "say": "Todo developer de Rails tiene una relación con ActiveRecord. En esta lección conectamos nuestra API de posts a Postgres al estilo de Rust, con SQLx."
            }
          ]
        },
        {
          "title": "Sin ORM, a propósito",
          "blocks": [
            {
              "id": "c",
              "kind": "cards",
              "items": [
                {
                  "icon": "💎",
                  "title": "ActiveRecord",
                  "body": "Modelos que conocen su tabla. Scopes encadenables, callbacks, carga perezosa. Casi nunca ves el SQL.",
                  "cls": "ruby"
                },
                {
                  "icon": "🦀",
                  "title": "SQLx",
                  "body": "Strings de SQL plano, verificados al compilar contra tu esquema. Los resultados se mapean directo a structs. Totalmente async.",
                  "cls": "rust"
                },
                {
                  "icon": "🧱",
                  "title": "Alternativas",
                  "body": "<b>Diesel</b>: un query builder con tipos seguros, síncrono. <b>SeaORM</b>: lo más parecido a ActiveRecord, async."
                }
              ]
            }
          ],
          "beats": [
            {
              "say": "ActiveRecord es un ORM. Los modelos conocen sus tablas, los scopes se encadenan y el SQL queda casi siempre oculto.",
              "show": "c.0"
            },
            {
              "say": "SQLx hace un intercambio distinto. Escribes SQL de verdad, y los macros lo verifican contra el esquema real de tu base de datos al compilar.",
              "show": "c.1",
              "hl": [
                "c.1"
              ]
            },
            {
              "say": "Si extrañas el estilo ORM, Diesel ofrece un query builder con tipos seguros, y SeaORM es lo más parecido a ActiveRecord. Usamos SQLx porque es la opción más popular junto a Axum.",
              "show": "c.2"
            }
          ]
        },
        {
          "title": "rails db:migrate → sqlx migrate",
          "layout": "split",
          "blocks": [
            {
              "id": "t",
              "kind": "code",
              "lang": "shell",
              "term": true,
              "label": "terminal",
              "size": 16,
              "code": "$ cargo install sqlx-cli\n$ export DATABASE_URL=postgres://localhost/blog\n$ sqlx database create\n$ sqlx migrate add create_posts\nCreating migrations/20261023120000_create_posts.sql\n$ sqlx migrate run\nApplied 20261023120000/migrate create posts"
            },
            {
              "id": "s",
              "kind": "code",
              "lang": "sql",
              "label": "migrations/…_create_posts.sql",
              "size": 17,
              "code": "CREATE TABLE posts (\n  id         BIGSERIAL PRIMARY KEY,\n  title      TEXT NOT NULL,\n  body       TEXT NOT NULL,\n  published  BOOLEAN NOT NULL\n             DEFAULT false,\n  created_at TIMESTAMPTZ NOT NULL\n             DEFAULT now()\n);"
            }
          ],
          "beats": [
            {
              "say": "Primero, el esquema. Instala la herramienta de línea de comandos de sqlx, que cumple el rol de las tareas rails db.",
              "type": {
                "t": 1
              }
            },
            {
              "say": "Apúntala a tu base de datos con la variable DATABASE URL, y luego crea la base de datos, como rails db create.",
              "type": {
                "t": 3
              },
              "lines": {
                "t": [
                  2,
                  3
                ]
              }
            },
            {
              "say": "sqlx migrate add crea un archivo de migración con timestamp, como rails generate migration.",
              "type": {
                "t": 5
              },
              "lines": {
                "t": [
                  4,
                  5
                ]
              }
            },
            {
              "say": "La diferencia: las migraciones son SQL plano, sin DSL de Ruby. Un id big serial, columnas not null y valores por defecto, escritos a mano.",
              "type": {
                "s": "all"
              }
            },
            {
              "say": "Luego sqlx migrate run la aplica, igual que rails db migrate.",
              "type": {
                "t": "all"
              },
              "lines": {
                "t": [
                  6,
                  7
                ]
              },
              "note": "¿Necesitas una migración down? <code>sqlx migrate add -r nombre</code> crea <code>.up.sql</code> + <code>.down.sql</code>."
            }
          ]
        },
        {
          "title": "El pool vive en tu estado",
          "layout": "split",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "config/database.yml",
              "code": "production:\n  adapter: postgresql\n  url: <%= ENV[\"DATABASE_URL\"] %>\n  pool: 5"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "label": "main.rs",
              "size": 16,
              "code": "#[derive(Clone)]\nstruct AppState {\n    db: PgPool,\n}\n\nlet db = PgPoolOptions::new()\n    .max_connections(5)\n    .connect(&std::env::var(\"DATABASE_URL\")?)\n    .await?;\n\nsqlx::migrate!().run(&db).await?;\n\nlet app = router().with_state(AppState { db });"
            }
          ],
          "beats": [
            {
              "say": "En Rails, database yml configura un pool de conexiones que ActiveRecord administra tras bambalinas.",
              "type": {
                "rb": "all"
              }
            },
            {
              "say": "En Rust el pool es un valor común y corriente. Un PgPool va en el estado de tu app, y los handlers lo reciben mediante el extractor State.",
              "type": {
                "rs": 4
              },
              "lines": {
                "rs": [
                  1,
                  2,
                  3,
                  4
                ]
              }
            },
            {
              "say": "Lo construyes con las opciones del pool: el máximo de conexiones, y luego te conectas con la URL del entorno.",
              "type": {
                "rs": 9
              },
              "lines": {
                "rs": [
                  6,
                  7,
                  8,
                  9
                ]
              }
            },
            {
              "say": "El macro migrate incrusta tus archivos de migración en el binario, así que la app puede migrarse sola al arrancar.",
              "type": {
                "rs": 11
              },
              "lines": {
                "rs": [
                  11
                ]
              }
            },
            {
              "say": "Clonar un pool es barato, porque por dentro usa conteo de referencias. Por eso el estado puede derivar Clone.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  13
                ]
              },
              "note": "No hay un <code>ActiveRecord::Base.connection</code> global: el pool se pasa explícitamente a donde se necesite."
            }
          ]
        },
        {
          "title": "Finders → fetch_*",
          "blocks": [
            {
              "id": "t",
              "kind": "table",
              "head": [
                "ActiveRecord",
                "SQLx",
                "Devuelve"
              ],
              "rows": [
                [
                  "<code>Post.all</code>",
                  "<code>SELECT …</code> + <code>.fetch_all(&amp;db)</code>",
                  "<code>Vec&lt;Post&gt;</code>"
                ],
                [
                  "<code>Post.find(id)</code>",
                  "<code>WHERE id = $1</code> + <code>.fetch_one</code>",
                  "<code>Post</code> o <code>RowNotFound</code>"
                ],
                [
                  "<code>Post.find_by(slug:)</code>",
                  "<code>.fetch_optional</code>",
                  "<code>Option&lt;Post&gt;</code>"
                ],
                [
                  "<code>Post.where(published: true)</code>",
                  "<code>WHERE published = $1</code> + <code>.fetch_all</code>",
                  "<code>Vec&lt;Post&gt;</code>"
                ],
                [
                  "<code>Post.create!(…)</code>",
                  "<code>INSERT … RETURNING *</code> + <code>.fetch_one</code>",
                  "<code>Post</code>"
                ],
                [
                  "<code>post.destroy</code>",
                  "<code>DELETE …</code> + <code>.execute</code>",
                  "filas afectadas"
                ]
              ],
              "cls": "sm"
            }
          ],
          "beats": [
            {
              "say": "Tus finders de ActiveRecord se corresponden con un pequeño grupo de métodos fetch."
            },
            {
              "say": "fetch all devuelve un vector, como Post punto all.",
              "show": "t.0"
            },
            {
              "say": "fetch one espera exactamente una fila. Si no hay ninguna, obtienes un error row not found, muy parecido a cuando find lanza record not found.",
              "show": "t.1"
            },
            {
              "say": "fetch optional devuelve un Option, la versión en Rust de un find by que devuelve nil.",
              "show": "t.2",
              "hl": [
                "t.2"
              ]
            },
            {
              "say": "Las cláusulas where son simplemente SQL con parámetros numerados. Los parámetros siempre se enlazan, nunca se interpolan, así que la protección contra inyección SQL viene gratis.",
              "show": "t.3"
            },
            {
              "say": "Los creates usan insert con returning, así Postgres te devuelve la fila nueva con su id. Los deletes y updates usan execute.",
              "show": [
                "t.4",
                "t.5"
              ]
            }
          ]
        },
        {
          "title": "query_as!: SQL verificado al compilar",
          "blocks": [
            {
              "id": "c",
              "kind": "code",
              "lang": "rust",
              "label": "repo.rs",
              "size": 16,
              "code": "#[derive(Serialize, sqlx::FromRow)]\nstruct Post { id: i64, title: String, body: String, published: bool }\n\nasync fn find_post(db: &PgPool, id: i64) -> sqlx::Result<Option<Post>> {\n    sqlx::query_as!(\n        Post,\n        \"SELECT id, title, body, published FROM posts WHERE id = $1\",\n        id\n    )\n    .fetch_optional(db)\n    .await\n}"
            },
            {
              "id": "e",
              "kind": "text",
              "style": "err",
              "html": "<b>error</b>: error returned from database: column \"titel\" does not exist\n  --> src/repo.rs:5:5"
            }
          ],
          "beats": [
            {
              "say": "Esta es la característica estrella. El macro query as recibe un struct de destino, un string SQL y los parámetros a enlazar.",
              "type": {
                "c": 9
              },
              "lines": {
                "c": [
                  5,
                  6,
                  7,
                  8
                ]
              }
            },
            {
              "say": "Al compilar, SQLx envía esta consulta a tu base de datos de desarrollo y la verifica: que las columnas existan, que los tipos coincidan con los campos del struct y que el parámetro sea un i64.",
              "lines": {
                "c": [
                  7
                ]
              }
            },
            {
              "say": "Si te equivocas al escribir el nombre de una columna, el build falla. Encuentras el problema al compilar, no en producción.",
              "show": "e"
            },
            {
              "say": "Luego fetch optional la ejecuta y mapea la fila a un Post, dándote un Option.",
              "type": {
                "c": "all"
              },
              "lines": {
                "c": [
                  10,
                  11
                ]
              },
              "note": "¿CI sin base de datos? Ejecuta <code>cargo sqlx prepare</code>, haz commit de <code>.sqlx/</code> y compila con <code>SQLX_OFFLINE=true</code>."
            },
            {
              "say": "FromRow solo se necesita para la función query as sin macro. Es útil para consultas dinámicas que no se pueden verificar al compilar.",
              "lines": {
                "c": [
                  1
                ]
              }
            }
          ]
        },
        {
          "type": "checkpoint",
          "q": "Estás portando <code>Post.find_by(slug: params[:slug])</code>, que legítimamente puede no encontrar nada. ¿Con qué método de SQLx debería terminar la consulta?",
          "options": [
            "<code>.fetch_all(&amp;db)</code>",
            "<code>.fetch_one(&amp;db)</code>",
            "<code>.fetch_optional(&amp;db)</code>",
            "<code>.execute(&amp;db)</code>"
          ],
          "answer": 2,
          "explain": "<code>fetch_optional</code> devuelve <code>Option&lt;Post&gt;</code>: <code>None</code> donde Rails te daría <code>nil</code>. <code>fetch_one</code> trataría el \"no encontrado\" como un error, igual que <code>find</code>.",
          "beats": [
            {
              "say": "Checkpoint. Find by, el finder que devuelve nil. ¿Qué método fetch le corresponde?"
            }
          ]
        },
        {
          "title": "Transacciones",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "publish.rb",
              "code": "ActiveRecord::Base.transaction do\n  post.update!(published: true)\n  AuditLog.create!(post_id: post.id, action: \"publish\")\nend"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "label": "publish.rs",
              "size": 16,
              "code": "let mut tx = db.begin().await?;\n\nsqlx::query!(\"UPDATE posts SET published = true WHERE id = $1\", id)\n    .execute(&mut *tx).await?;\nsqlx::query!(\"INSERT INTO audit_logs (post_id, action) VALUES ($1, 'publish')\", id)\n    .execute(&mut *tx).await?;\n\ntx.commit().await?;  // descartada sin commit → ROLLBACK"
            }
          ],
          "beats": [
            {
              "say": "En Rails, las transacciones usan un bloque. Si lanzas una excepción dentro, todo se revierte.",
              "type": {
                "rb": "all"
              }
            },
            {
              "say": "En SQLx inicias una transacción y obtienes un valor de transacción.",
              "type": {
                "rs": 1
              },
              "lines": {
                "rs": [
                  1
                ]
              }
            },
            {
              "say": "Cada consulta se ejecuta contra la transacción en lugar del pool.",
              "type": {
                "rs": 6
              },
              "lines": {
                "rs": [
                  4,
                  6
                ]
              }
            },
            {
              "say": "Luego haces commit. Aquí es donde brilla el ownership: si algún signo de interrogación retorna antes, la transacción se descarta sin commit, y SQLx la revierte automáticamente.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  8
                ]
              },
              "note": "Es el RAII del Módulo 2: la limpieza ocurre cuando el dueño sale de scope."
            }
          ]
        },
        {
          "title": "rescue_from → impl IntoResponse",
          "layout": "split",
          "blocks": [
            {
              "id": "a",
              "kind": "code",
              "lang": "rust",
              "label": "error.rs",
              "size": 15,
              "code": "enum AppError {\n    NotFound,\n    Invalid(String),\n    Db(sqlx::Error),\n}\n\nimpl From<sqlx::Error> for AppError {\n    fn from(e: sqlx::Error) -> Self {\n        match e {\n            sqlx::Error::RowNotFound =>\n                AppError::NotFound,\n            other => AppError::Db(other),\n        }\n    }\n}"
            },
            {
              "id": "b",
              "kind": "code",
              "lang": "rust",
              "label": "error.rs",
              "size": 15,
              "code": "impl IntoResponse for AppError {\n    fn into_response(self) -> Response {\n        match self {\n            AppError::NotFound =>\n                StatusCode::NOT_FOUND.into_response(),\n            AppError::Invalid(msg) =>\n                (StatusCode::UNPROCESSABLE_ENTITY, msg)\n                    .into_response(),\n            AppError::Db(_) =>\n                StatusCode::INTERNAL_SERVER_ERROR\n                    .into_response(),\n        }\n    }\n}"
            }
          ],
          "beats": [
            {
              "say": "Última pieza: el manejo de errores. Rails tiene rescue from, que convierte record not found en un cuatrocientos cuatro.",
              "type": {
                "a": 5
              }
            },
            {
              "say": "En Rust defines un enum de errores de la app. Implementar From para los errores de sqlx convierte row not found en Not Found y envuelve todo lo demás.",
              "type": {
                "a": "all"
              },
              "lines": {
                "a": [
                  7,
                  10,
                  11
                ]
              }
            },
            {
              "say": "Luego implementas IntoResponse y decides el status HTTP de cada variante. Not found es cuatrocientos cuatro, invalid es cuatrocientos veintidós y todo lo demás es un quinientos.",
              "type": {
                "b": "all"
              }
            }
          ]
        },
        {
          "title": "Handlers que solo usan ?",
          "blocks": [
            {
              "id": "h",
              "kind": "code",
              "lang": "rust",
              "label": "handlers.rs",
              "size": 16,
              "code": "async fn show(\n    State(s): State<AppState>,\n    Path(id): Path<i64>,\n) -> Result<Json<Post>, AppError> {\n    let post = sqlx::query_as!(\n        Post,\n        \"SELECT id, title, body, published FROM posts WHERE id = $1\",\n        id\n    )\n    .fetch_one(&s.db)\n    .await?;   // RowNotFound → AppError::NotFound → 404\n\n    Ok(Json(post))\n}"
            }
          ],
          "beats": [
            {
              "say": "Ahora los handlers devuelven un Result con tu error de app como tipo de error.",
              "type": {
                "h": 4
              },
              "lines": {
                "h": [
                  4
                ]
              }
            },
            {
              "say": "Adentro, solo escribes el camino feliz. fetch one te da un post o un error.",
              "type": {
                "h": 11
              }
            },
            {
              "say": "El operador signo de interrogación convierte un error de base de datos en un error de app mediante tu implementación de From, y retorna antes.",
              "lines": {
                "h": [
                  11
                ]
              }
            },
            {
              "say": "Después Axum llama a into response sobre él. Un post que no existe se convierte en un cuatrocientos cuatro: rescue from, verificado por el sistema de tipos.",
              "type": {
                "h": "all"
              },
              "lines": {
                "h": [
                  11,
                  13
                ]
              },
              "note": "Para menos boilerplate, crates como <code>thiserror</code> derivan <code>Display</code>/<code>From</code> por ti."
            }
          ]
        }
      ],
      "summary": {
        "tldr": "SQLx no es un ORM. Escribes SQL y <code>query_as!</code> lo verifica contra tu base de datos al compilar, mapeando las filas a structs. Las migraciones son SQL plano que se ejecuta con <code>sqlx migrate</code>. Un <code>PgPool</code> vive en el estado de Axum. Elige <code>fetch_one</code>, <code>fetch_optional</code> o <code>fetch_all</code> para equivaler a <code>find</code>, <code>find_by</code> o <code>where</code>. Un <code>AppError</code> propio que implementa <code>IntoResponse</code> reemplaza a <code>rescue_from</code>.",
        "points": [
          "<code>sqlx migrate add</code> / <code>run</code> reemplazan a <code>rails g migration</code> / <code>db:migrate</code>. Las migraciones son SQL plano.",
          "Un <code>PgPool</code> es barato de clonar. Guárdalo en <code>AppState</code> y sácalo con <code>State</code>.",
          "<code>query_as!(Post, \"SELECT …\", args)</code> se verifica al compilar contra tu esquema.",
          "<code>fetch_one</code> ≈ <code>find</code> (error si no existe), <code>fetch_optional</code> ≈ <code>find_by</code> (<code>Option</code>), <code>fetch_all</code> ≈ <code>where</code>/<code>all</code>.",
          "Las transacciones se revierten si se descartan sin <code>commit()</code>. Convierte <code>sqlx::Error</code> en tu propio <code>AppError</code> con <code>From</code>, y en status HTTP con <code>IntoResponse</code>."
        ],
        "rosetta": [
          [
            "Modelo de ActiveRecord",
            "Struct plano + <code>query_as!</code>"
          ],
          [
            "<code>rails g migration</code>",
            "<code>sqlx migrate add nombre</code>"
          ],
          [
            "<code>rails db:migrate</code>",
            "<code>sqlx migrate run</code> / <code>sqlx::migrate!()</code>"
          ],
          [
            "Pool de <code>database.yml</code>",
            "<code>PgPoolOptions::new().max_connections(5)</code>"
          ],
          [
            "<code>Post.find(id)</code>",
            "<code>.fetch_one(&amp;db)</code>"
          ],
          [
            "<code>Post.find_by(...)</code> → nil",
            "<code>.fetch_optional(&amp;db)</code> → <code>None</code>"
          ],
          [
            "<code>Post.where(...)</code>",
            "<code>WHERE … $1</code> + <code>.fetch_all(&amp;db)</code>"
          ],
          [
            "<code>ActiveRecord::Base.transaction do</code>",
            "<code>db.begin()</code> … <code>tx.commit()</code>"
          ],
          [
            "<code>rescue_from RecordNotFound</code>",
            "<code>impl From&lt;sqlx::Error&gt;</code> + <code>IntoResponse</code>"
          ]
        ],
        "gotchas": [
          "Los macros <code>query!</code>/<code>query_as!</code> necesitan <code>DATABASE_URL</code> al compilar, o los datos offline de <code>cargo sqlx prepare</code> más <code>SQLX_OFFLINE=true</code>.",
          "Las columnas nullable se mapean a <code>Option&lt;T&gt;</code>. Si el campo de tu struct no es un <code>Option</code>, el macro te lo dirá.",
          "No hay carga perezosa ni magia contra el N+1: tú escribes el JOIN o la segunda consulta.",
          "Los placeholders de Postgres son <code>$1, $2</code>. MySQL/SQLite usan <code>?</code>."
        ],
        "code": "async fn list_published(db: &PgPool) -> sqlx::Result<Vec<Post>> {\n    sqlx::query_as!(\n        Post,\n        \"SELECT id, title, body, published\n         FROM posts WHERE published = $1\n         ORDER BY id DESC LIMIT 20\",\n        true\n    )\n    .fetch_all(db)\n    .await\n}",
        "links": [
          [
            "SQLx en GitHub",
            "https://github.com/launchbadge/sqlx"
          ],
          [
            "sqlx-cli",
            "https://github.com/launchbadge/sqlx/tree/main/sqlx-cli"
          ],
          [
            "Diesel",
            "https://diesel.rs/"
          ],
          [
            "SeaORM",
            "https://www.sea-ql.org/SeaORM/"
          ]
        ]
      },
      "quiz": [
        {
          "type": "match",
          "q": "Une cada llamada de ActiveRecord con su equivalente en SQLx.",
          "pairs": [
            [
              "Post.find(id)",
              "fetch_one"
            ],
            [
              "Post.find_by(slug: s)",
              "fetch_optional"
            ],
            [
              "Post.where(published: true)",
              "fetch_all"
            ],
            [
              "post.destroy",
              "execute"
            ],
            [
              "rails db:migrate",
              "sqlx migrate run"
            ]
          ]
        },
        {
          "type": "mcq",
          "q": "¿Qué verifica <code>sqlx::query_as!</code> en <b>tiempo de compilación</b>?",
          "options": [
            "Nada, solo es formateo de strings",
            "Que el SQL sea válido para tu esquema y que los tipos de columnas y parámetros coincidan con tu struct y tus argumentos",
            "Que la consulta sea rápida",
            "Que la base de datos sea accesible en producción"
          ],
          "answer": 1,
          "explain": "El macro prepara la consulta contra tu base de datos de desarrollo (o los metadatos offline en caché) y verifica sus tipos."
        },
        {
          "type": "fill",
          "q": "Completa la búsqueda que devuelve <code>Option&lt;Post&gt;</code>.",
          "code": "let post = sqlx::query_as!(Post, \"SELECT id, title, body, published FROM posts WHERE id = ___\", id)\n    .___(&db)\n    .await?;",
          "answers": [
            [
              "$1"
            ],
            [
              "fetch_optional"
            ]
          ],
          "explain": "Postgres usa placeholders numerados, y <code>fetch_optional</code> devuelve un <code>Option</code>."
        },
        {
          "type": "mcq",
          "q": "Una función inicia una transacción y ejecuta dos consultas, pero la segunda falla y <code>?</code> retorna antes de <code>tx.commit()</code>. ¿Qué pasa con el cambio de la primera consulta?",
          "options": [
            "Se hace commit",
            "Se revierte cuando se descarta la transacción",
            "La conexión queda filtrada (leak)",
            "Depende de <code>autocommit</code>"
          ],
          "answer": 1,
          "explain": "Descartar una <code>Transaction</code> sin commit la revierte. Es limpieza basada en ownership (RAII)."
        },
        {
          "type": "order",
          "q": "Ordena el flujo para agregar una tabla <code>comments</code> y consultarla.",
          "items": [
            "sqlx migrate add create_comments",
            "Escribe el SQL CREATE TABLE",
            "sqlx migrate run",
            "Escribe un query_as! en tu repo",
            "cargo build (se verifica la consulta)"
          ],
          "explain": "Primero las migraciones, para que el verificador en compilación pueda ver la tabla nueva."
        },
        {
          "type": "mcq",
          "q": "¿Cómo haces que <code>sqlx::Error::RowNotFound</code> se convierta automáticamente en un HTTP 404 al usar <code>?</code> en los handlers?",
          "options": [
            "Agregando <code>rescue_from</code> al router",
            "Implementando <code>From&lt;sqlx::Error&gt;</code> para tu <code>AppError</code> e <code>IntoResponse</code> para <code>AppError</code>",
            "Envolviendo cada consulta en <code>catch_unwind</code>",
            "Devolviendo <code>Option</code> desde cada handler"
          ],
          "answer": 1,
          "explain": "<code>?</code> llama a <code>From::from</code> sobre el error, y Axum llama a <code>into_response</code> sobre tu tipo de error."
        }
      ],
      "practice": [
        {
          "title": "Convierte errores en códigos de estado",
          "prompt": "El Playground no tiene Postgres ni SQLx, así que <code>DbError</code> hace de <code>sqlx::Error</code> y <code>fetch_one</code> simula una consulta (casi todo el archivo es ese andamiaje dado: solo los dos <code>TODO</code> son tuyos). Escribe las dos piezas de la escena <i>rescue_from → impl IntoResponse</i>: la conversión con <code>From</code> y el código HTTP de cada error. El handler <code>show</code> ya viene dado: solo usa <code>?</code>, que llama a tu <code>From</code>. Cuando ambas funcionen, imprime:<br/><code>Ok(Post { id: 1, title: \"Hello SQLx\" })</code><br/><code>404</code><br/><code>500</code><br/>Mientras tanto, hace panic con “not yet implemented”.",
          "starter": "// --- dado: reemplazo de sqlx::Error (el Playground no tiene Postgres ni sqlx) ---\n#[derive(Debug, PartialEq)]\nenum DbError {\n    RowNotFound,\n    Other(String),\n}\n\n#[derive(Debug, PartialEq)]\nstruct Post {\n    id: i64,\n    title: String,\n}\n\n// --- dado: reemplazo de sqlx::query_as!(Post, \"... WHERE id = $1\", id).fetch_one(&db).await ---\nfn fetch_one(id: i64) -> Result<Post, DbError> {\n    match id {\n        1 => Ok(Post { id: 1, title: \"Hello SQLx\".to_string() }),\n        13 => Err(DbError::Other(\"connection reset\".to_string())),\n        _ => Err(DbError::RowNotFound),\n    }\n}\n\n#[derive(Debug, PartialEq)]\nenum AppError {\n    NotFound,\n    Db(DbError),\n}\n\n// TODO 1: como el `impl From<sqlx::Error> for AppError` de la lección.\n// RowNotFound se vuelve AppError::NotFound. Todo lo demás se envuelve en AppError::Db(...).\nimpl From<DbError> for AppError {\n    fn from(e: DbError) -> Self {\n        todo!() // (un marcador: compila, pero hace panic si se ejecuta)\n    }\n}\n\nimpl AppError {\n    // TODO 2: como el `impl IntoResponse` de la lección. Elige el código HTTP:\n    // NotFound es 404 y Db es 500.\n    fn status(&self) -> u16 {\n        todo!()\n    }\n}\n\n// --- dado: el handler solo escribe el camino feliz; `?` llama a tu impl From con el error ---\nfn show(id: i64) -> Result<Post, AppError> {\n    let post = fetch_one(id)?;\n    Ok(post)\n}\n\nfn main() {\n    println!(\"{:?}\", show(1));\n    println!(\"{:?}\", show(99).unwrap_err().status());\n    println!(\"{:?}\", show(13).unwrap_err().status());\n\n    // dado: esto hace panic si tu código está mal\n    assert_eq!(show(99), Err(AppError::NotFound));\n    assert_eq!(show(13), Err(AppError::Db(DbError::Other(\"connection reset\".to_string()))));\n    assert_eq!(AppError::NotFound.status(), 404);\n}\n",
          "hints": [
            "<code>match e { ... }</code> con dos brazos: uno para <code>DbError::RowNotFound</code> y otro que atrapa todo lo demás dándole nombre al valor, como <code>other =&gt; ...</code>, igual que en la lección.",
            "<code>RowNotFound =&gt; AppError::NotFound</code> y <code>other =&gt; AppError::Db(other)</code>. Para <code>status</code>, haz match sobre <code>self</code>: <code>AppError::NotFound</code> y <code>AppError::Db(_)</code>.",
            "from: <code>match e { DbError::RowNotFound =&gt; AppError::NotFound, other =&gt; AppError::Db(other) }</code>. status: <code>match self { AppError::NotFound =&gt; 404, AppError::Db(_) =&gt; 500 }</code>"
          ],
          "solution": "// --- dado: reemplazo de sqlx::Error (el Playground no tiene Postgres ni sqlx) ---\n#[derive(Debug, PartialEq)]\nenum DbError {\n    RowNotFound,\n    Other(String),\n}\n\n#[derive(Debug, PartialEq)]\nstruct Post {\n    id: i64,\n    title: String,\n}\n\n// --- dado: reemplazo de sqlx::query_as!(Post, \"... WHERE id = $1\", id).fetch_one(&db).await ---\nfn fetch_one(id: i64) -> Result<Post, DbError> {\n    match id {\n        1 => Ok(Post { id: 1, title: \"Hello SQLx\".to_string() }),\n        13 => Err(DbError::Other(\"connection reset\".to_string())),\n        _ => Err(DbError::RowNotFound),\n    }\n}\n\n#[derive(Debug, PartialEq)]\nenum AppError {\n    NotFound,\n    Db(DbError),\n}\n\nimpl From<DbError> for AppError {\n    fn from(e: DbError) -> Self {\n        match e {\n            DbError::RowNotFound => AppError::NotFound,\n            other => AppError::Db(other),\n        }\n    }\n}\n\nimpl AppError {\n    fn status(&self) -> u16 {\n        match self {\n            AppError::NotFound => 404,\n            AppError::Db(_) => 500,\n        }\n    }\n}\n\n// --- dado: el handler solo escribe el camino feliz; `?` llama a tu impl From con el error ---\nfn show(id: i64) -> Result<Post, AppError> {\n    let post = fetch_one(id)?;\n    Ok(post)\n}\n\nfn main() {\n    println!(\"{:?}\", show(1));\n    println!(\"{:?}\", show(99).unwrap_err().status());\n    println!(\"{:?}\", show(13).unwrap_err().status());\n\n    // dado: esto hace panic si tu código está mal\n    assert_eq!(show(99), Err(AppError::NotFound));\n    assert_eq!(show(13), Err(AppError::Db(DbError::Other(\"connection reset\".to_string()))));\n    assert_eq!(AppError::NotFound.status(), 404);\n}\n",
          "explain": "Cambia <code>DbError</code> por <code>sqlx::Error</code>, <code>fetch_one</code> por un <code>query_as!</code> real y <code>status()</code> por <code>impl IntoResponse</code>, y esta es la arquitectura real: el handler sigue siendo el camino feliz, y <code>?</code> más <code>From</code> convierten una fila inexistente en un 404."
        }
      ]
    },
    {
      "id": "testing-deploy",
      "title": "Testing y despliegue",
      "subtitle": "cargo test en lugar de RSpec, request specs sin servidor y una imagen Docker que es una fracción de la de Rails.",
      "tags": [
        "testing",
        "rspec",
        "cargo test",
        "docker",
        "deploy",
        "tracing",
        "logging",
        "config"
      ],
      "scenes": [
        {
          "type": "title",
          "kicker": "Módulo 5 · Lección 4",
          "title": "Testing y despliegue",
          "subtitle": "De tests en verde a una imagen de producción de ~100 MB.",
          "beats": [
            {
              "say": "La lección final. Vamos a testear nuestra API de posts, luego a desplegarla, y terminaremos viendo hacia dónde seguir en tu camino con Rust."
            }
          ]
        },
        {
          "title": "RSpec → #[test]",
          "layout": "split",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "spec/models/post_spec.rb",
              "size": 16,
              "code": "RSpec.describe Post do\n  it \"builds a slug\" do\n    post = Post.new(title: \"Hello World\")\n    expect(post.slug).to eq(\"hello-world\")\n  end\nend"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "label": "src/post.rs",
              "size": 16,
              "code": "pub fn slugify(title: &str) -> String {\n    title.to_lowercase().replace(' ', \"-\")\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn builds_a_slug() {\n        assert_eq!(slugify(\"Hello World\"), \"hello-world\");\n    }\n}"
            }
          ],
          "beats": [
            {
              "say": "Este es un model spec conocido: describe, it, expect to eq.",
              "type": {
                "rb": "all"
              }
            },
            {
              "say": "En Rust, los tests unitarios viven en el mismo archivo que el código que prueban, dentro de un módulo llamado tests.",
              "type": {
                "rs": 3
              }
            },
            {
              "say": "El atributo cfg test significa que este módulo solo se compila cuando ejecutas cargo test. Nunca llega a tu binario de release.",
              "type": {
                "rs": 7
              },
              "lines": {
                "rs": [
                  5,
                  6
                ]
              }
            },
            {
              "say": "use super asterisco trae el módulo padre al scope. Como los tests viven dentro del módulo, incluso pueden probar funciones privadas.",
              "lines": {
                "rs": [
                  7
                ]
              }
            },
            {
              "say": "Cada test es una función marcada con el atributo test. assert eq es tu expect to eq, y si falla imprime ambos valores.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  9,
                  10,
                  11
                ]
              }
            }
          ]
        },
        {
          "title": "Ejecutar los tests",
          "layout": "split",
          "blocks": [
            {
              "id": "t",
              "kind": "code",
              "lang": "shell",
              "term": true,
              "label": "terminal",
              "size": 16,
              "code": "$ cargo test\nrunning 3 tests\ntest post::tests::builds_a_slug ... ok\ntest post::tests::rejects_blank ... ok\ntest api::show_returns_404 ... ok\n\ntest result: ok. 3 passed; 0 failed\n$ cargo test slug   # filtra por nombre"
            },
            {
              "id": "tb",
              "kind": "table",
              "cls": "sm",
              "head": [
                "Rails",
                "Rust"
              ],
              "rows": [
                [
                  "<code>spec/models/*</code>",
                  "<code>#[cfg(test)] mod tests</code> en el archivo"
                ],
                [
                  "<code>spec/requests/*</code>",
                  "<code>tests/*.rs</code> (integración)"
                ],
                [
                  "<code>expect(x).to eq(y)</code>",
                  "<code>assert_eq!(x, y)</code>"
                ],
                [
                  "<code>expect { }.to raise_error</code>",
                  "<code>#[should_panic]</code> / <code>is_err()</code>"
                ],
                [
                  "FactoryBot",
                  "funciones builder / <code>Default</code>"
                ]
              ]
            }
          ],
          "beats": [
            {
              "say": "cargo test compila tu proyecto en modo test y ejecuta todos los tests, en paralelo por defecto.",
              "type": {
                "t": "all"
              }
            },
            {
              "say": "Pasa parte de un nombre para filtrar, como cuando ejecutas rspec sobre un solo archivo.",
              "lines": {
                "t": [
                  8
                ]
              }
            },
            {
              "say": "Los tests unitarios están junto al código. Los tests de integración, el equivalente a los request specs, van en una carpeta tests en la raíz y usan tu crate desde afuera.",
              "show": [
                "tb.0",
                "tb.1"
              ]
            },
            {
              "say": "Las aserciones son macros. Para los errores, revisa is err sobre el Result, o marca el test con should panic.",
              "show": [
                "tb.2",
                "tb.3"
              ]
            },
            {
              "say": "No hay FactoryBot. Pequeñas funciones builder, o el trait Default, hacen el trabajo.",
              "show": "tb.4"
            }
          ]
        },
        {
          "title": "Request specs sin servidor",
          "blocks": [
            {
              "id": "c",
              "kind": "code",
              "lang": "rust",
              "label": "tests/posts_api.rs",
              "size": 16,
              "code": "use axum::{body::Body, http::{Request, StatusCode}};\nuse tower::ServiceExt; // para .oneshot()\n\n#[sqlx::test]  // BD nueva por test, con migraciones aplicadas\nasync fn unknown_post_is_404(db: PgPool) {\n    let app = blog::app(AppState { db });\n\n    let res = app\n        .oneshot(Request::get(\"/posts/999\").body(Body::empty()).unwrap())\n        .await\n        .unwrap();\n\n    assert_eq!(res.status(), StatusCode::NOT_FOUND);\n}"
            }
          ],
          "beats": [
            {
              "say": "Ahora, la API en sí. Los request specs de Rails disparan requests falsas contra tu app sin un servidor real. Axum puede hacer lo mismo.",
              "type": {
                "c": 2
              }
            },
            {
              "say": "El atributo sqlx test crea una base de datos de prueba nueva para cada test, aplica tus migraciones y te entrega un pool. Funciona como los transactional fixtures, pero totalmente aislado.",
              "type": {
                "c": 5
              },
              "lines": {
                "c": [
                  4,
                  5
                ]
              }
            },
            {
              "say": "Construye el mismo router que usa tu función main y luego llama a oneshot con una request. Sin puerto, sin servidor HTTP: solo una llamada a una función.",
              "type": {
                "c": 11
              },
              "lines": {
                "c": [
                  6,
                  8,
                  9
                ]
              }
            },
            {
              "say": "Y verifica el status de la respuesta, o lee el body y parsea el JSON.",
              "type": {
                "c": "all"
              },
              "lines": {
                "c": [
                  13
                ]
              },
              "note": "Para tests async sin BD, usa <code>#[tokio::test]</code>."
            }
          ]
        },
        {
          "type": "checkpoint",
          "q": "¿Qué pasa con el código dentro de <code>#[cfg(test)] mod tests { … }</code> cuando ejecutas <code>cargo build --release</code>?",
          "options": [
            "Se compila y se ejecuta al arrancar",
            "Se compila pero nunca se llama",
            "No se compila en absoluto, así que no agrega nada al binario",
            "El build falla a menos que los tests pasen"
          ],
          "answer": 2,
          "explain": "<code>cfg(test)</code> es compilación condicional: el módulo solo existe al compilar con el harness de tests (<code>cargo test</code>).",
          "beats": [
            {
              "say": "Checkpoint. ¿Tus tests terminan dentro de tu binario de producción?"
            }
          ]
        },
        {
          "title": "Despliegue: un Dockerfile multi-stage",
          "layout": "split",
          "blocks": [
            {
              "id": "d",
              "kind": "code",
              "lang": "shell",
              "label": "Dockerfile",
              "size": 16,
              "code": "# --- etapa de build ---\nFROM rust:1-bookworm AS build\nWORKDIR /app\nCOPY . .\nENV SQLX_OFFLINE=true\nRUN cargo build --release\n\n# --- etapa de runtime ---\nFROM debian:bookworm-slim\nWORKDIR /app\nCOPY --from=build /app/target/release/blog .\nENV RUST_LOG=info\nEXPOSE 3000\nCMD [\"./blog\"]"
            },
            {
              "id": "c",
              "kind": "cards",
              "items": [
                {
                  "icon": "🐘",
                  "title": "Imagen típica de Rails",
                  "body": "Ruby + gems + node/assets: de 500 MB a 1 GB. Arranca en segundos.",
                  "cls": "ruby"
                },
                {
                  "icon": "🪶",
                  "title": "Esta imagen de Rust",
                  "body": "Debian slim + un binario: ~80 a 100 MB, menos de 20 MB con musl. Arranca en milisegundos.",
                  "cls": "rust"
                }
              ]
            }
          ],
          "beats": [
            {
              "say": "Despliegue. En Rails, tu imagen de producción necesita Ruby, todas las gems, quizás Node para los assets, y un bundle install.",
              "show": "c.0"
            },
            {
              "say": "Rust usa un build multi-stage. La primera etapa tiene toda la toolchain del compilador y construye un binario de release.",
              "type": {
                "d": 6
              },
              "lines": {
                "d": [
                  2,
                  6
                ]
              }
            },
            {
              "say": "SQLX OFFLINE le dice a los macros de consultas que usen los metadatos en caché de cargo sqlx prepare, así el build no necesita una base de datos.",
              "lines": {
                "d": [
                  5
                ]
              }
            },
            {
              "say": "La segunda etapa parte de una imagen Debian slim y copia un solo archivo: el binario. Sin compilador, sin código fuente, sin gems.",
              "type": {
                "d": "all"
              },
              "lines": {
                "d": [
                  9,
                  11,
                  14
                ]
              },
              "show": "c.1"
            },
            {
              "say": "El resultado es una imagen pequeña que arranca en milisegundos y corre cómodamente en la instancia más pequeña que puedas contratar.",
              "note": "Acelera los rebuilds cacheando dependencias con <code>cargo-chef</code>. Para algo aún más pequeño, usa musl + <code>scratch</code> o distroless."
            }
          ]
        },
        {
          "title": "Configuración y logging",
          "layout": "split",
          "blocks": [
            {
              "id": "rb",
              "kind": "code",
              "lang": "ruby",
              "label": "rails",
              "size": 16,
              "code": "# secretos y configuración\nRails.application.credentials.api_key\nENV.fetch(\"DATABASE_URL\")\n\n# logging\nRails.logger.info(\n  \"Created post #{post.id}\"\n)"
            },
            {
              "id": "rs",
              "kind": "code",
              "lang": "rust",
              "label": "main.rs",
              "size": 16,
              "code": "// .env solo en desarrollo\ndotenvy::dotenv().ok();\nlet url = std::env::var(\"DATABASE_URL\")?;\n\n// RUST_LOG=info,blog=debug\ntracing_subscriber::fmt()\n    .with_env_filter(EnvFilter::from_default_env())\n    .init();\n\ntracing::info!(post_id = post.id, \"created post\");"
            }
          ],
          "beats": [
            {
              "say": "Configuración. Rails tiene credenciales encriptadas y variables de entorno.",
              "type": {
                "rb": 3
              }
            },
            {
              "say": "Las apps de Rust siguen el estilo twelve-factor: leen variables de entorno, y en desarrollo cargan un archivo punto env con el crate dotenvy.",
              "type": {
                "rs": 3
              },
              "lines": {
                "rs": [
                  2,
                  3
                ]
              }
            },
            {
              "say": "Para logging, el estándar es el crate tracing. Instala un subscriber una vez al arrancar y controla el nivel de detalle con la variable RUST LOG.",
              "type": {
                "rb": "all",
                "rs": 8
              },
              "lines": {
                "rs": [
                  5,
                  6,
                  7,
                  8
                ]
              },
              "note": "<code>EnvFilter</code> necesita la feature <code>env-filter</code> de <code>tracing-subscriber</code>."
            },
            {
              "say": "Las llamadas de log son estructuradas. Campos como post id son pares clave-valor reales, listos para logs en JSON y tus herramientas de observabilidad.",
              "type": {
                "rs": "all"
              },
              "lines": {
                "rs": [
                  10
                ]
              }
            }
          ]
        },
        {
          "title": "¡Lo lograste! ¿Y ahora qué?",
          "blocks": [
            {
              "id": "c",
              "kind": "cards",
              "items": [
                {
                  "icon": "🦀",
                  "title": "Practica",
                  "body": "<b>Rustlings</b> y el track de Rust de <b>Exercism</b>, un poco cada día."
                },
                {
                  "icon": "📗",
                  "title": "Profundiza",
                  "body": "<b>Zero To Production in Rust</b>: una API web de producción (actix-web + sqlx), de punta a punta."
                },
                {
                  "icon": "💎",
                  "title": "Vuelve a Rails",
                  "body": "Acelera un hot path de tu app Rails con una gem nativa usando <b>magnus</b>."
                },
                {
                  "icon": "🧰",
                  "title": "Aprende los crates",
                  "body": "<code>thiserror</code>, <code>anyhow</code>, <code>reqwest</code>, <code>clap</code>, <code>chrono</code>, <code>uuid</code>."
                },
                {
                  "icon": "🔁",
                  "title": "Repasa ownership",
                  "body": "Vuelve a ver el Módulo 2 después de construir algo. La segunda vez todo encaja."
                },
                {
                  "icon": "🚀",
                  "title": "Lanza algo",
                  "body": "Porta un servicio interno pequeño. El código real es lo que más rápido enseña."
                }
              ]
            }
          ],
          "beats": [
            {
              "say": "Ese es todo el recorrido: ownership, borrowing, enums, traits, errores, async y una API web real con base de datos, tests y una imagen Docker."
            },
            {
              "say": "Mantén el impulso. Haz Rustlings o el track de Exercism un poco cada día.",
              "show": "c.0"
            },
            {
              "say": "Para una versión en formato libro de lo que acabamos de construir, lee Zero to Production in Rust.",
              "show": "c.1"
            },
            {
              "say": "O lleva Rust de vuelta a casa: escribe una gem nativa con magnus para acelerar un hot path de tu app Rails.",
              "show": "c.2"
            },
            {
              "say": "Aprende los crates del día a día, y vuelve a ver el módulo de ownership. La segunda vez todo encaja.",
              "show": [
                "c.3",
                "c.4"
              ]
            },
            {
              "say": "Sobre todo, lanza algo pequeño y real. Gracias por tomar Rust para devs de Rails. Te damos la bienvenida, Rustacean.",
              "show": "c.5",
              "note": "Te damos la bienvenida, <b>Rustacean</b>. 🦀"
            }
          ]
        }
      ],
      "summary": {
        "tldr": "Los tests unitarios viven junto al código en <code>#[cfg(test)] mod tests</code>. Los tests de integración van en <code>tests/</code>. <code>assert_eq!</code> reemplaza a <code>expect().to eq</code>. Prueba los handlers de Axum dentro del proceso con <code>tower::ServiceExt::oneshot</code> y obtén una BD aislada con <code>#[sqlx::test]</code>. Despliega con un Dockerfile multi-stage que copia un solo binario de release a una imagen slim. Configura con variables de entorno (<code>dotenvy</code> en desarrollo) y haz logging con <code>tracing</code>.",
        "points": [
          "<code>#[cfg(test)] mod tests { use super::*; #[test] fn … }</code>: solo se compila para <code>cargo test</code>.",
          "Los tests de integración en <code>tests/*.rs</code> usan tu crate como un usuario externo, el equivalente a los request specs.",
          "<code>app.oneshot(request)</code> prueba el router completo sin servidor. <code>#[sqlx::test]</code> le da a cada test una base de datos nueva y migrada.",
          "Un build de Docker multi-stage despliega solo el binario de release: imágenes pequeñas y arranques en milisegundos.",
          "La configuración viene de variables de entorno (<code>dotenvy</code> para el <code>.env</code> local). <code>tracing</code> da logs estructurados controlados por <code>RUST_LOG</code>."
        ],
        "rosetta": [
          [
            "<code>it \"…\" do … end</code>",
            "<code>#[test] fn …() { … }</code>"
          ],
          [
            "<code>expect(x).to eq(y)</code>",
            "<code>assert_eq!(x, y)</code>"
          ],
          [
            "<code>spec/requests</code> + <code>get \"/posts/1\"</code>",
            "<code>tests/</code> + <code>app.oneshot(Request::get(...))</code>"
          ],
          [
            "Transactional fixtures",
            "<code>#[sqlx::test]</code> (una BD por test)"
          ],
          [
            "<code>bundle exec rspec</code>",
            "<code>cargo test</code>"
          ],
          [
            "Imagen Docker de Rails con gems + assets",
            "Build multi-stage → un binario"
          ],
          [
            "<code>Rails.application.credentials</code> / <code>ENV</code>",
            "<code>std::env::var</code> + <code>dotenvy</code>"
          ],
          [
            "<code>Rails.logger.info</code>",
            "<code>tracing::info!(key = value, \"msg\")</code>"
          ]
        ],
        "gotchas": [
          "Los tests en <code>mod tests</code> necesitan <code>use super::*;</code> para ver el código que prueban.",
          "Los tests corren en paralelo por defecto. El estado externo compartido (archivos, puertos) requiere cuidado. <code>-- --test-threads=1</code> los ejecuta en serie.",
          "Compila y ejecuta las imágenes sobre la misma versión de Debian (p. ej. ambas <code>bookworm</code>) para evitar incompatibilidades de glibc.",
          "<code>debian:bookworm-slim</code> no trae certificados CA. Si tu app abre conexiones TLS (APIs por HTTPS, un Postgres administrado), haz <code>apt-get install ca-certificates</code> en la etapa final.",
          "Sin <code>SQLX_OFFLINE=true</code> y un directorio <code>.sqlx/</code> en el repo, los builds de Docker fallan porque los macros no pueden llegar a una base de datos."
        ],
        "code": "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn slug() {\n        assert_eq!(slugify(\"Hello World\"), \"hello-world\");\n    }\n\n    #[tokio::test]\n    async fn async_works() {\n        assert_eq!(fetch_title(1).await, \"Post #1\");\n    }\n}",
        "links": [
          [
            "The Book, cap. 11: Writing Tests",
            "https://doc.rust-lang.org/book/ch11-00-testing.html"
          ],
          [
            "Zero To Production in Rust",
            "https://www.zero2prod.com/"
          ],
          [
            "cargo-chef",
            "https://github.com/LukeMathWalker/cargo-chef"
          ],
          [
            "tracing",
            "https://docs.rs/tracing/"
          ],
          [
            "Rustlings",
            "https://github.com/rust-lang/rustlings"
          ]
        ]
      },
      "quiz": [
        {
          "type": "match",
          "q": "Une cada concepto de testing y operaciones de Rails con su contraparte en Rust.",
          "pairs": [
            [
              "expect(x).to eq(y)",
              "assert_eq!(x, y)"
            ],
            [
              "spec/requests",
              "tests/ + oneshot"
            ],
            [
              "Transactional fixtures",
              "#[sqlx::test]"
            ],
            [
              "Rails.logger.info",
              "tracing::info!"
            ],
            [
              "ENV.fetch(\"X\")",
              "std::env::var(\"X\")"
            ]
          ]
        },
        {
          "type": "compiles",
          "q": "Al ejecutar <code>cargo test</code>: ¿compila esto?",
          "code": "fn double(x: i32) -> i32 {\n    x * 2\n}\n\n#[cfg(test)]\nmod tests {\n    #[test]\n    fn doubles() {\n        assert_eq!(double(2), 4);\n    }\n}",
          "answer": false,
          "explain": "<code>tests</code> es un módulo hijo. Sin <code>use super::*;</code> (o <code>super::double</code>), <code>double</code> no está en scope."
        },
        {
          "type": "fill",
          "q": "Completa el test async del handler.",
          "code": "use tower::___; // trae .oneshot() al scope\n\n#[tokio::___]\nasync fn index_is_ok() {\n    let res = app().oneshot(Request::get(\"/posts\").body(Body::empty()).unwrap()).await.unwrap();\n    assert_eq!(res.status(), StatusCode::OK);\n}",
          "answers": [
            [
              "ServiceExt"
            ],
            [
              "test"
            ]
          ],
          "explain": "<code>oneshot</code> es un método de <code>ServiceExt</code>, y los tests async necesitan <code>#[tokio::test]</code>."
        },
        {
          "type": "order",
          "q": "Ordena las líneas de un Dockerfile multi-stage mínimo.",
          "items": [
            "FROM rust:1-bookworm AS build",
            "COPY . .",
            "RUN cargo build --release",
            "FROM debian:bookworm-slim",
            "COPY --from=build /app/target/release/blog .",
            "CMD [\"./blog\"]"
          ],
          "explain": "Compila todo en una imagen pesada y luego copia solo el binario a una liviana."
        },
        {
          "type": "mcq",
          "q": "¿Por qué definir <code>SQLX_OFFLINE=true</code> en la etapa de build de Docker?",
          "options": [
            "Para desactivar la base de datos en producción",
            "Para que los macros <code>query!</code> usen los metadatos en caché de <code>cargo sqlx prepare</code> en lugar de conectarse a una base de datos al compilar",
            "Para hacer el binario más pequeño",
            "Para saltarse las migraciones"
          ],
          "answer": 1,
          "explain": "Las verificaciones en compilación normalmente necesitan una BD activa. El modo offline usa los datos de <code>.sqlx/</code> guardados en el repo."
        },
        {
          "type": "mcq",
          "q": "¿Cuál es la razón principal de que una imagen de producción de Rust sea mucho más pequeña que una imagen típica de Rails?",
          "options": [
            "Rust comprime las imágenes",
            "La etapa final contiene un solo binario compilado: sin intérprete, gems ni herramientas de build",
            "Docker trata a Rust de forma especial",
            "Las apps de Rust no necesitan un sistema operativo"
          ],
          "answer": 1,
          "explain": "Todo se compila de antemano en un ejecutable autocontenido."
        }
      ],
      "practice": [
        {
          "title": "Escribe los specs",
          "prompt": "Aquí tienes una función de validación para nuestros posts. Agrega dos tests más junto al que ya está terminado, siguiendo su patrón: un <b>título en blanco</b> da <code>Err(\"title can't be blank\".to_string())</code> y un <b>body en blanco</b> da <code>Err(\"body can't be blank\".to_string())</code>. No hay <code>fn main</code>, así que el Playground corre los <b>tests</b> (también puedes elegir <i>Test</i> en su menú). Cuando termines, reporta <code>3 passed</code> (el código inicial ya muestra <code>1 passed</code>). Cada test necesita un <code>assert_eq!</code> adentro: un test vacío también pasa, pero no prueba nada.",
          "starter": "pub fn validate(title: &str, body: &str) -> Result<(), String> {\n    if title.trim().is_empty() {\n        return Err(\"title can't be blank\".to_string());\n    }\n    if body.trim().is_empty() {\n        return Err(\"body can't be blank\".to_string());\n    }\n    Ok(())\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    // dado: un test terminado para copiar el patrón\n    #[test]\n    fn accepts_a_valid_post() {\n        assert_eq!(validate(\"Hello\", \"World\"), Ok(()));\n    }\n\n    // TODO 1: un test de que un título en blanco (\"   \") da Err(\"title can't be blank\".to_string())\n\n    // TODO 2: un test de que un body en blanco da Err(\"body can't be blank\".to_string())\n}\n",
          "hints": [
            "Copia el test que ya está y cambia su nombre y sus argumentos. Cada test es un <code>#[test] fn</code> dentro de <code>mod tests</code>.",
            "<code>assert_eq!(validate(\"   \", \"World\"), Err(\"title can't be blank\".to_string()));</code>",
            "<code>#[test] fn rejects_a_blank_title() { assert_eq!(validate(\"   \", \"World\"), Err(\"title can't be blank\".to_string())); }</code> y lo mismo para el body, por ejemplo <code>validate(\"Hello\", \"\")</code>."
          ],
          "solution": "pub fn validate(title: &str, body: &str) -> Result<(), String> {\n    if title.trim().is_empty() {\n        return Err(\"title can't be blank\".to_string());\n    }\n    if body.trim().is_empty() {\n        return Err(\"body can't be blank\".to_string());\n    }\n    Ok(())\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    // dado: un test terminado para copiar el patrón\n    #[test]\n    fn accepts_a_valid_post() {\n        assert_eq!(validate(\"Hello\", \"World\"), Ok(()));\n    }\n\n    #[test]\n    fn rejects_a_blank_title() {\n        assert_eq!(validate(\"   \", \"World\"), Err(\"title can't be blank\".to_string()));\n    }\n\n    #[test]\n    fn rejects_a_blank_body() {\n        assert_eq!(validate(\"Hello\", \"\"), Err(\"body can't be blank\".to_string()));\n    }\n}\n",
          "explain": "Cada <code>#[test]</code> es una función independiente, y <code>cargo test</code> las corre en paralelo y reporta cada una, como los ejemplos de RSpec. Bonus: borra el <code>if</code> del título en blanco en <code>validate</code> y vuelve a correr. Tu test nuevo falla, lo que prueba que realmente protege esa regla."
        }
      ]
    }
  ]
});
