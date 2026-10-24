COURSE.modules.push({
  order: 5,
  id: 'm5',
  title: 'Building a Web API',
  blurb: 'Put it all together: async with Tokio, routing with Axum, Postgres with SQLx, then testing and shipping a small Docker image. This is the Rust version of <code>rails g scaffold Post</code>.',
  lessons: [
    // ------------------------------------------------------------------ 5.1
    {
      id: 'async-tokio',
      title: 'Async & Tokio (no GVL here)',
      subtitle: 'How Rust serves thousands of requests without Puma threads, the GVL, or Sidekiq processes.',
      tags: ['async', 'await', 'tokio', 'concurrency', 'threads', 'gvl', 'sidekiq', 'arc', 'mutex'],
      scenes: [
        {
          type: 'title', kicker: 'Module 5 · Lesson 1', title: 'Async & Tokio (no GVL here)',
          subtitle: 'Thousands of concurrent requests, a handful of threads, and real parallelism.',
          beats: [
            { say: 'Welcome to the final module. We are going to build the Rust version of a Rails scaffold: a JSON API for posts.' },
            { say: 'But first we need the engine every Rust web framework runs on: async Rust and the Tokio runtime.' },
          ],
        },
        {
          title: 'How Rails does concurrency today',
          blocks: [
            {
              id: 'c', kind: 'cards', items: [
                { icon: '🧵', title: 'Puma threads', body: 'A few threads per process. They wait on I/O well, but the GVL lets only one run Ruby code at a time.', cls: 'ruby' },
                { icon: '🏭', title: 'More processes', body: 'For real parallelism you fork workers, and every one of them carries its own copy of the app in memory.', cls: 'ruby' },
                { icon: '📬', title: 'Sidekiq', body: 'Slow work moves to a separate process with Redis in the middle.', cls: 'ruby' },
                { icon: '🦀', title: 'Tokio', body: 'One process. A worker thread per CPU core runs thousands of lightweight tasks in parallel, with no global lock.', cls: 'rust' },
              ],
            },
          ],
          beats: [
            { say: 'Let us be honest about how a Rails app handles concurrency.' },
            { say: 'Puma gives you a few threads per process. They are fine for waiting on the database, but the global VM lock means only one thread runs Ruby code at a time.', show: 'c.0' },
            { say: 'So for real parallelism you add processes, and every process carries its own copy of the whole app in memory.', show: 'c.1' },
            { say: 'Anything slow goes to Sidekiq: yet another process, with Redis in the middle.', show: 'c.2' },
            { say: 'Rust with Tokio is different. One process, a worker thread per core, and thousands of lightweight tasks running truly in parallel. There is no global lock.', show: 'c.3', hl: ['c.3'] },
          ],
        },
        {
          title: 'async fn and .await',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', size: 18, code: `use std::time::Duration;
use tokio::time::sleep;

async fn fetch_title(id: u32) -> String {
    sleep(Duration::from_millis(100)).await; // fake I/O
    format!("Post #{id}")
}

#[tokio::main]
async fn main() {
    let title = fetch_title(1).await;
    println!("{title}");
}` },
          ],
          beats: [
            { say: 'Here is async Rust in its smallest form.', type: { c: 3 } },
            { say: 'Marking a function async means it can pause while it waits for I/O, such as a database query, an HTTP call or a timer.', type: { c: 7 }, lines: { c: [4] } },
            { say: 'Dot await is the pause point. While this task waits, the thread is free to run other tasks. No thread sits blocked.', lines: { c: [5] }, note: 'In Rust, <code>.await</code> is written <i>after</i> the expression, so you can chain it.' },
            { say: 'Async code needs a runtime to drive it. The tokio main attribute starts one and runs your async main function on it.', type: { c: 'all' }, lines: { c: [9, 10] } },
            { say: 'Inside, you call async functions and await them. It reads almost like ordinary sequential code. One rule: dot await only works inside an async function or block, which is why main is async too.', lines: { c: [11, 12] } },
          ],
        },
        {
          title: 'Futures are lazy',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'lazy.rb', code: `job = -> { fetch_title(1) }
# nothing has run yet…

job.call  # now it runs` },
            { id: 'rs', kind: 'code', lang: 'rust', code: `let fut = fetch_title(1);
// nothing has run yet!

let title = fut.await;
// now it runs to completion` },
            { id: 'w', kind: 'text', style: 'err', html: '<b>warning</b>: unused implementer of `Future` that must be used\n  note: futures do nothing unless you `.await` or poll them' },
          ],
          beats: [
            { say: 'Here is the number one surprise for newcomers. Calling an async function does not run it.', type: { rs: 2 } },
            { say: 'It returns a future, a value that describes work still to be done. It behaves like a Ruby lambda you have not called yet.', type: { rb: 'all' } },
            { say: 'The work only happens when you await the future.', type: { rs: 'all' }, lines: { rs: [4] } },
            { say: 'Forget the await and the compiler warns you. The future was created and then thrown away, so your code never ran.', show: 'w' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'A handler calls <code>send_welcome_email(user).await</code> but you remove the <code>.await</code> to "make it faster". What happens?',
          options: ['The email sends in the background', 'The email is never sent, and the compiler warns about an unused future', 'It panics at runtime', 'It sends twice'],
          answer: 1,
          explain: 'Futures are lazy. Without <code>.await</code>, or <code>tokio::spawn</code>, the future is created, dropped, and never runs.',
          beats: [{ say: 'Checkpoint. This is a classic bug. What happens if you drop the await?' }],
        },
        {
          title: 'Concurrency: join! and spawn',
          layout: 'split',
          blocks: [
            { id: 'j', kind: 'code', lang: 'rust', label: 'join.rs', size: 17, code: `// sequential: ~200ms
let a = fetch_title(1).await;
let b = fetch_title(2).await;

// concurrent: ~100ms
let (a, b) = tokio::join!(
    fetch_title(1),
    fetch_title(2),
);` },
            { id: 's', kind: 'code', lang: 'rust', label: 'spawn.rs', size: 17, code: `// ≈ perform_later, but in-process
let handle = tokio::spawn(async move {
    send_welcome_email(user_id).await
});

// optional: wait for it like Thread#join
let result = handle.await?;` },
          ],
          beats: [
            { say: 'Awaiting one thing after another is sequential. Two one-hundred-millisecond calls take two hundred milliseconds.', type: { j: 3 } },
            { say: 'tokio join runs several futures concurrently and waits for all of them, so the total is about one hundred milliseconds.', type: { j: 'all' }, lines: { j: [5, 6, 7, 8, 9] } },
            { say: 'tokio spawn starts an independent background task. It works like perform later, but it runs inside your process, with no Redis.', type: { s: 4 } },
            { say: 'Spawn returns a join handle. Await it if you need the result, as you would join a Ruby thread.', type: { s: 'all' }, lines: { s: [7] } },
            { say: 'Notice async move. A spawned task can outlive the function that created it, so it must own its data. The compiler calls this requirement static, and it also requires Send so the task can move between threads.', lines: { s: [2] }, note: 'Spawned tasks are lost if the process dies. Durable jobs still need a queue (e.g. <code>apalis</code> or Postgres-backed jobs).' },
          ],
        },
        {
          title: "Don't block the runtime",
          layout: 'split',
          blocks: [
            { id: 'bad', kind: 'code', lang: 'rust', label: '❌ blocks a worker thread', size: 17, code: `async fn sign_up(pw: String) -> String {
    // CPU-heavy, ~250ms, no .await
    bcrypt::hash(pw, 12).unwrap()
}

async fn slow() {
    std::thread::sleep(ONE_SEC); // ❌
}` },
            { id: 'good', kind: 'code', lang: 'rust', label: '✅ offload it', size: 17, code: `async fn sign_up(pw: String) -> String {
    tokio::task::spawn_blocking(move || {
        bcrypt::hash(pw, 12).unwrap()
    })
    .await
    .unwrap()
}

async fn slow() {
    tokio::time::sleep(ONE_SEC).await; // ✅
}` },
          ],
          beats: [
            { say: 'Async has one big rule: never block. A worker thread stuck on heavy computation cannot run any other tasks.', type: { bad: 4 } },
            { say: 'Hashing a password is pure CPU work with nothing to await. Run it inside an async function and every request on that thread stalls.', lines: { bad: [2, 3] } },
            { say: 'Blocking sleep from the standard library is even worse. Always use the async version from Tokio.', type: { bad: 'all' }, lines: { bad: [7] } },
            { say: 'For CPU-heavy or blocking work, wrap it in spawn blocking. Tokio runs it on a separate thread pool made for exactly this.', type: { good: 7 }, lines: { good: [2, 3, 4] } },
            { say: 'And wait with tokio time sleep, which yields the thread instead of holding it.', type: { good: 'all' }, lines: { good: [10] }, note: 'Rule of thumb: if it takes more than ~100µs without an <code>.await</code>, offload it.' },
          ],
        },
        {
          title: 'Shared state: Arc + Mutex',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'hits.rb', code: `# class-level state 😬
class Stats
  @@hits = 0
  def self.hit! = @@hits += 1
end
# or Rails.cache.increment("hits")` },
            { id: 'rs', kind: 'code', lang: 'rust', size: 17, code: `use std::sync::{Arc, Mutex};

let hits = Arc::new(Mutex::new(0u64));

for _ in 0..10 {
    let hits = Arc::clone(&hits);
    tokio::spawn(async move {
        *hits.lock().unwrap() += 1;
    });
}` },
            { id: 'b', kind: 'bullets', cls: 'sm', side: 'left', items: [
              { icon: '🔗', text: '<code>Arc</code> = shared ownership across threads (atomic reference count)' },
              { icon: '🔒', text: '<code>Mutex</code> = one writer at a time; the lock unlocks itself when dropped' },
              { icon: '🛑', text: 'Forget either one and the code <b>does not compile</b>. Data races are type errors' },
            ] },
          ],
          beats: [
            { say: 'Sometimes tasks need to share state, like a counter or an in-memory cache.', type: { rb: 'all' } },
            { say: 'In Ruby you might reach for a class variable. With several threads that is a quiet race condition, and nothing warns you.', lines: { rb: [3, 4] } },
            { say: 'In Rust you wrap the value in a Mutex, so only one task can change it at a time, and in an Arc, so many tasks can own it together.', type: { rs: 3 }, show: ['b.0', 'b.1'], lines: { rs: [3] } },
            { say: 'Each task gets its own clone of the Arc. Cloning an Arc is cheap: it only increments a counter.', type: { rs: 'all' }, lines: { rs: [6, 7, 8] } },
            { say: 'And here is the payoff. Leave out the Arc or the Mutex and the program will not compile. Data races are type errors in Rust.', show: 'b.2' },
          ],
        },
      ],
      summary: {
        tldr: 'An <code>async fn</code> returns a lazy <b>future</b>. Nothing happens until you <code>.await</code> it. <code>#[tokio::main]</code> starts a multi-threaded runtime with no GVL. Use <code>join!</code> for concurrency, <code>tokio::spawn</code> for background tasks, <code>spawn_blocking</code> for CPU-heavy work, and <code>Arc&lt;Mutex&lt;T&gt;&gt;</code> for shared state.',
        points: [
          '<code>async fn</code> returns a future. It is lazy and does nothing until <code>.await</code>ed.',
          '<code>#[tokio::main]</code> starts a runtime: worker threads running many tasks truly in parallel (no GVL).',
          '<code>tokio::join!</code> runs futures concurrently. <code>tokio::spawn</code> starts an independent task, like an in-process <code>perform_later</code>.',
          'Never block inside async code. Use <code>spawn_blocking</code> for CPU work and <code>tokio::time::sleep</code> for waiting.',
          'Shared mutable state needs <code>Arc&lt;Mutex&lt;T&gt;&gt;</code>. Without it you get a compile error, not a data race.',
        ],
        rosetta: [
          ['Puma threads + GVL', 'Tokio worker threads, no global lock'],
          ['Puma workers (forked processes)', 'One process, a thread per core'],
          ['<code>-&gt; { work }</code> (lambda, not yet called)', 'A future (not yet awaited)'],
          ['<code>SomeJob.perform_later</code>', '<code>tokio::spawn(async move { … })</code>'],
          ['<code>Thread#join</code>', '<code>handle.await</code>'],
          ['<code>Concurrent::Promises.zip</code>', '<code>tokio::join!(a, b)</code>'],
          ['<code>@@counter</code> / <code>Rails.cache.increment</code>', '<code>Arc&lt;Mutex&lt;u64&gt;&gt;</code> (or <code>AtomicU64</code>)'],
          ['<code>sleep(1)</code>', '<code>tokio::time::sleep(d).await</code>'],
        ],
        gotchas: [
          '<code>.await</code> only works inside an <code>async</code> fn or block. <code>main</code> needs <code>#[tokio::main]</code>.',
          'Spawned tasks need <code>async move</code> and owned (<code>\'static</code>), <code>Send</code> data. Clone what you need first.',
          'Don\'t hold a <code>std::sync::Mutex</code> guard across an <code>.await</code>. Lock, update, and drop it quickly.',
          '<code>tokio::spawn</code> is not durable. If the process restarts, the task is gone. Use a real job queue for important work.',
        ],
        code: `#[tokio::main]
async fn main() {
    // concurrent
    let (a, b) = tokio::join!(fetch(1), fetch(2));

    // background task
    let h = tokio::spawn(async move { fetch(3).await });
    let c = h.await.unwrap();

    // CPU-heavy work off the async threads
    let hash = tokio::task::spawn_blocking(|| expensive())
        .await
        .unwrap();
}`,
        links: [['Tokio tutorial', 'https://tokio.rs/tokio/tutorial'], ['Async Book', 'https://rust-lang.github.io/async-book/'], ['Alice Ryhl: Async: What is blocking?', 'https://ryhl.io/blog/async-what-is-blocking/']],
      },
      quiz: [
        { type: 'mcq', q: 'Why can a single Rust process use every CPU core for request handling while one Puma process cannot?', options: ['Rust has a faster GVL', 'Rust has no global interpreter lock. Tokio worker threads run tasks truly in parallel', 'Tokio forks a process per request', 'Rust uses green threads that run on one core'], answer: 1, explain: 'Ruby\'s GVL lets only one thread execute Ruby code at a time. Rust has no such lock, and the type system prevents data races instead.' },
        { type: 'compiles', q: 'Does this compile?', code: 'async fn get_count() -> u32 { 42 }\n\nfn main() {\n    let n = get_count().await;\n    println!("{n}");\n}', answer: false, explain: '<code>.await</code> is only allowed inside <code>async</code> functions or blocks. Use <code>#[tokio::main] async fn main()</code>.' },
        { type: 'fill', q: 'Complete the program so it runs on Tokio and actually executes the future.', code: '#[tokio::___]\nasync fn main() {\n    let t = fetch_title(1).___;\n    println!("{t}");\n}', answers: [['main'], ['await']], explain: '<code>#[tokio::main]</code> sets up the runtime, and <code>.await</code> drives the future.' },
        { type: 'match', q: 'Match the Ruby/Rails concept to its async Rust counterpart.', pairs: [['SomeJob.perform_later', 'tokio::spawn'], ['Thread#join', 'handle.await'], ['@@counter shared by threads', 'Arc<Mutex<T>>'], ['Puma worker threads', 'Tokio worker threads']], explain: 'Same ideas, different guarantees: the Rust versions are checked by the compiler.' },
        { type: 'mcq', q: 'A handler must run bcrypt (≈250ms of pure CPU). What is the right approach?', options: ['Call it directly; it is inside an async fn so it is fine', 'Wrap it in <code>tokio::task::spawn_blocking</code> and await the handle', 'Add <code>.await</code> after the bcrypt call', 'Use <code>std::thread::sleep</code> to yield'], answer: 1, explain: 'CPU-heavy or blocking work stalls a Tokio worker. <code>spawn_blocking</code> moves it to a pool built for that.' },
        { type: 'order', q: 'Order what happens with <code>let h = tokio::spawn(fut); let v = h.await;</code>', items: ['tokio::spawn hands the future to the runtime as a background task', 'A worker thread runs the task until it reaches an .await', 'While the task waits on I/O, the thread is free to run other tasks', 'The task finishes', 'h.await gives your code the result, like joining a Ruby thread'], explain: 'Each .await is a pause point where the thread can switch to other work, and awaiting the join handle is like Thread#join.' },
      ],
      practice: [
        {
          title: 'Make it concurrent',
          prompt: 'This program fetches three posts one after another, so it takes about 900ms. Use <code>tokio::join!</code> (from the <i>Concurrency: join! and spawn</i> scene) so they run <b>concurrently</b>. When it works, it prints the three titles and a time near <b>300ms</b>. Until then the last line panics: that check is given, so you can tell when you are done.',
          starter: `use std::time::{Duration, Instant}; // Instant is given: it is just a stopwatch
use tokio::time::sleep;

async fn fetch_title(id: u32) -> String {
    sleep(Duration::from_millis(300)).await; // fake I/O, like in the lesson
    format!("Post #{id}")
}

#[tokio::main]
async fn main() {
    let start = Instant::now();

    // TODO: these three run one after another (~900ms).
    // Run them concurrently with tokio::join! instead.
    let a = fetch_title(1).await;
    let b = fetch_title(2).await;
    let c = fetch_title(3).await;

    println!("{a}, {b}, {c} in {:?}", start.elapsed());

    // given: this check panics if it took 600ms or more
    assert!(start.elapsed() < Duration::from_millis(600));
}
`,
          hints: ['Look at the join! slide: <code>let (a, b) = tokio::join!(fetch_title(1), fetch_title(2));</code>. You are doing the same with three futures.', 'You do <b>not</b> <code>.await</code> each call anymore. Put the three calls inside <code>tokio::join!(...)</code> and delete the three <code>let ... = ... .await;</code> lines.', '<code>let (a, b, c) = tokio::join!(fetch_title(1), fetch_title(2), fetch_title(3));</code>'],
          solution: `use std::time::{Duration, Instant}; // Instant is given: it is just a stopwatch
use tokio::time::sleep;

async fn fetch_title(id: u32) -> String {
    sleep(Duration::from_millis(300)).await; // fake I/O, like in the lesson
    format!("Post #{id}")
}

#[tokio::main]
async fn main() {
    let start = Instant::now();

    let (a, b, c) = tokio::join!(fetch_title(1), fetch_title(2), fetch_title(3));

    println!("{a}, {b}, {c} in {:?}", start.elapsed());

    // given: this check panics if it took 600ms or more
    assert!(start.elapsed() < Duration::from_millis(600));
}
`,
          explain: 'All three futures wait on their timers at the same time, so the total is about the slowest one (300ms), not the sum (900ms). <code>Instant</code> and the <code>assert!</code> were only there to measure and check you.',
        },
        {
          title: 'A thread-safe hit counter',
          prompt: 'Spawn 100 tasks that each add 1 to a shared counter. Write only the <b>loop body</b>: three lines, the same pattern as the <i>Shared state: Arc + Mutex</i> slide, plus keeping each handle. The code that waits for the tasks and checks the total is given. When it works it prints <code>hits = 100</code>. Until then it prints <code>hits = 0</code> and panics, and that is expected.',
          starter: `use std::sync::{Arc, Mutex};

#[tokio::main]
async fn main() {
    let hits = Arc::new(Mutex::new(0u64));
    // given: a list where we keep the join handles, so we can wait for the tasks below
    let mut handles: Vec<tokio::task::JoinHandle<()>> = Vec::new();

    for _ in 0..100 {
        // TODO: write the loop body, the same pattern as the Arc + Mutex slide:
        //   1. clone the Arc into a new variable that is also called \`hits\`
        //   2. tokio::spawn an \`async move\` task that adds 1 to the counter
        //   3. push the handle that tokio::spawn returns into \`handles\`
    }

    // given: wait until all 100 tasks have finished
    for h in handles {
        h.await.unwrap();
    }

    let total = *hits.lock().unwrap();
    println!("hits = {total}");
    assert_eq!(total, 100); // given: panics if the count is wrong
}
`,
          hints: ['Slide pattern: <code>let hits = Arc::clone(&amp;hits);</code> goes first inside the loop, so each task gets its own handle on the counter.', 'Then <code>tokio::spawn(async move { *hits.lock().unwrap() += 1; })</code>. It returns a join handle.', '<code>handles.push(tokio::spawn(async move { *hits.lock().unwrap() += 1; }));</code>'],
          solution: `use std::sync::{Arc, Mutex};

#[tokio::main]
async fn main() {
    let hits = Arc::new(Mutex::new(0u64));
    // given: a list where we keep the join handles, so we can wait for the tasks below
    let mut handles: Vec<tokio::task::JoinHandle<()>> = Vec::new();

    for _ in 0..100 {
        let hits = Arc::clone(&hits);
        handles.push(tokio::spawn(async move {
            *hits.lock().unwrap() += 1;
        }));
    }

    // given: wait until all 100 tasks have finished
    for h in handles {
        h.await.unwrap();
    }

    let total = *hits.lock().unwrap();
    println!("hits = {total}");
    assert_eq!(total, 100); // given: panics if the count is wrong
}
`,
          explain: 'Try deleting the <code>Arc::clone</code> line: the compiler refuses (E0382), because the first task would take the counter away from all the others. Sharing mutable state across tasks without synchronization is a type error.',
        },
      ],
    },

    // ------------------------------------------------------------------ 5.2
    {
      id: 'axum-routing',
      title: 'Axum: routes, controllers & JSON',
      subtitle: 'routes.rb, controllers, params and render json, rebuilt as a typed Router, handlers and extractors.',
      tags: ['axum', 'routing', 'controllers', 'json', 'serde', 'extractors', 'middleware', 'tower'],
      scenes: [
        {
          type: 'title', kicker: 'Module 5 · Lesson 2', title: 'Axum: routes, controllers & JSON',
          subtitle: 'Your first Rust scaffold: GET /posts, GET /posts/{id}, POST /posts.',
          beats: [
            { say: 'Time to build the API. We will use Axum, the most popular Rust web framework, built by the Tokio team.' },
            { say: 'Our goal is the Rust version of a Rails scaffold for posts, starting with routes and controllers.' },
          ],
        },
        {
          title: 'routes.rb → Router',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'config/routes.rb', code: `Rails.application.routes.draw do
  resources :posts,
    only: [:index, :show, :create]
end` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'src/main.rs', size: 16, code: `let app = Router::new()
    .route("/posts", get(index).post(create))
    .route("/posts/{id}", get(show))
    .with_state(state);

let listener =
    TcpListener::bind("0.0.0.0:3000").await?;

axum::serve(listener, app).await?;` },
          ],
          beats: [
            { say: 'In Rails, one resources line generates the routes. It is convenient, and a little magic.', type: { rb: 'all' } },
            { say: 'Axum has no resources macro. You build a Router and list every path yourself.', type: { rs: 1 } },
            { say: 'Each route maps an HTTP method to a handler function. Get index and post create both share the posts path.', type: { rs: 2 }, lines: { rs: [2] } },
            { say: 'Path parameters go in curly braces, so slash posts slash id becomes the show route.', type: { rs: 3 }, lines: { rs: [3] }, note: 'Axum 0.8 uses <code>{id}</code>. Older tutorials use <code>:id</code>, which now panics at startup.' },
            { say: 'Then you attach shared state, bind a TCP listener, and serve. That is your whole config dot ru.', type: { rs: 'all' }, lines: { rs: [4, 6, 7, 9] } },
          ],
        },
        {
          title: 'The life of a request',
          blocks: [
            {
              id: 'd', kind: 'diagram', w: 1150, h: 330,
              boxes: [
                { id: 'rq', x: 0, y: 30, w: 165, h: 86, label: 'GET', sub: '/posts/42', cls: 'info' },
                { id: 'rt', x: 197, y: 30, w: 165, h: 86, label: 'Router', sub: 'match path', cls: 'rust' },
                { id: 'ex', x: 394, y: 30, w: 165, h: 86, label: 'Extractors', sub: 'Path(42), State', cls: 'rust' },
                { id: 'hd', x: 591, y: 30, w: 165, h: 86, label: 'show()', sub: 'your handler', cls: 'rust' },
                { id: 'ir', x: 788, y: 30, w: 165, h: 86, label: 'IntoResponse', sub: 'Json / StatusCode', cls: 'rust' },
                { id: 'rs', x: 985, y: 30, w: 165, h: 86, label: '200 OK', sub: 'application/json', cls: 'ok' },
                { id: 'r1', x: 0, y: 220, w: 165, h: 86, label: 'Rack', sub: 'middleware', cls: 'ruby' },
                { id: 'r2', x: 197, y: 220, w: 165, h: 86, label: 'routes.rb', sub: 'resources', cls: 'ruby' },
                { id: 'r3', x: 394, y: 220, w: 165, h: 86, label: 'params', sub: 'params[:id]', cls: 'ruby' },
                { id: 'r4', x: 591, y: 220, w: 165, h: 86, label: '#show', sub: 'PostsController', cls: 'ruby' },
                { id: 'r5', x: 788, y: 220, w: 165, h: 86, label: 'render', sub: 'json: @post', cls: 'ruby' },
                { id: 'r6', x: 985, y: 220, w: 165, h: 86, label: '200 OK', sub: 'as_json', cls: 'ok' },
              ],
              arrows: [
                { id: 'a1', from: 'rq', to: 'rt', cls: 'rust' },
                { id: 'a2', from: 'rt', to: 'ex', cls: 'rust' },
                { id: 'a3', from: 'ex', to: 'hd', cls: 'rust' },
                { id: 'a4', from: 'hd', to: 'ir', cls: 'rust' },
                { id: 'a5', from: 'ir', to: 'rs', cls: 'ok' },
                { id: 'b1', from: 'r1', to: 'r2', cls: 'dash' },
                { id: 'b2', from: 'r2', to: 'r3', cls: 'dash' },
                { id: 'b3', from: 'r3', to: 'r4', cls: 'dash' },
                { id: 'b4', from: 'r4', to: 'r5', cls: 'dash' },
                { id: 'b5', from: 'r5', to: 'r6', cls: 'dash' },
              ],
            },
            { id: 't', kind: 'text', style: 'callout', html: 'Same pipeline as Rails. The difference: each step is <em>typed</em>, so a bad <code>id</code> is rejected with 400 before your handler ever runs.' },
          ],
          beats: [
            { say: 'Let us follow one request through Axum: get slash posts slash forty-two.', show: ['d.rq'] },
            { say: 'First the router matches the method and path, just like routes dot r b.', show: ['d.rt', 'd.a1'] },
            { say: 'Next come extractors. They pull typed values out of the request: the path parameter as a number, and your shared app state.', show: ['d.ex', 'd.a2'], hl: ['d.ex'] },
            { say: 'Then your handler runs. It is a plain async function, the equivalent of a controller action.', show: ['d.hd', 'd.a3'] },
            { say: 'Whatever it returns is converted into an HTTP response through the IntoResponse trait.', show: ['d.ir', 'd.a4', 'd.rs', 'd.a5'] },
            { say: 'Put Rails underneath and the shapes match: Rack, routes, params, controller, render.', show: ['d.r1', 'd.r2', 'd.r3', 'd.r4', 'd.r5', 'd.r6', 'd.b1', 'd.b2', 'd.b3', 'd.b4', 'd.b5'] },
            { say: 'The big difference is types. If the id is not a number, the extractor rejects the request with a four hundred before your code runs.', show: 't' },
          ],
        },
        {
          title: 'Controller action → handler',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'posts_controller.rb', size: 17, code: `class PostsController < ApplicationController
  def show
    post = Post.find(params[:id])
    render json: post
  end
end` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'handlers.rs', size: 17, code: `async fn show(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Post>, StatusCode> {
    state.repo
        .find(id)
        .await
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}` },
          ],
          beats: [
            { say: 'Here is a classic show action. It reads the id from params, finds the post, and renders JSON.', type: { rb: 'all' } },
            { say: 'In Axum, a handler is an async function. Its parameters are extractors, and Axum fills them in from the request.', type: { rs: 4 }, lines: { rs: [1, 2, 3] } },
            { say: 'Path of i64 is params id, already parsed into a number. State gives you shared things such as the database pool.', lines: { rs: [2, 3] }, note: 'The <code>Path(id)</code> pattern destructures the extractor right in the argument list.' },
            { say: 'The return type documents every outcome: JSON of a post, or an error status code.', lines: { rs: [4] } },
            { say: 'find returns an Option. We wrap a found post in Json, and turn None into a four oh four. That is Rails\' record not found, made explicit.', type: { rs: 'all' }, lines: { rs: [8, 9] } },
          ],
        },
        {
          title: 'Strong params & as_json → serde',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'posts_controller.rb', code: `def post_params
  params.require(:post)
        .permit(:title, :body,
                :published)
end

# render json: post
#   → post.as_json` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'models.rs', size: 15, code: `#[derive(Serialize)]       // → JSON out
struct Post {
    id: i64,
    title: String,
    body: String,
    published: bool,
}

#[derive(Deserialize)]     // ← JSON in
struct NewPost {
    title: String,
    body: String,
    #[serde(default)]      // optional, false
    published: bool,
}` },
          ],
          beats: [
            { say: 'Rails needs strong params to whitelist input, and as json to shape output.', type: { rb: 'all' } },
            { say: 'Rust uses serde for both. Derive Serialize on a struct, and it can be turned into JSON.', type: { rs: 7 }, lines: { rs: [1] } },
            { say: 'Derive Deserialize on an input struct, and that struct is your strong params. Only these fields, with these types, are accepted.', type: { rs: 'all' }, lines: { rs: [9, 10, 11, 12] } },
            { say: 'Attributes tune the behavior. With serde default, published is optional and falls back to false.', lines: { rs: [13, 14] }, note: 'Unknown fields are ignored by default. Add <code>#[serde(deny_unknown_fields)]</code> to reject them.' },
          ],
        },
        {
          title: 'Creating: Json in, 201 out',
          layout: 'split',
          blocks: [
            { id: 'rs', kind: 'code', lang: 'rust', label: 'handlers.rs', size: 17, code: `async fn create(
    State(state): State<AppState>,
    Json(input): Json<NewPost>,  // last!
) -> (StatusCode, Json<Post>) {
    let post = state.repo.insert(input).await;
    (StatusCode::CREATED, Json(post))
}

async fn index(
    State(state): State<AppState>,
    Query(page): Query<Pagination>,
) -> Json<Vec<Post>> {
    Json(state.repo.list(page).await)
}` },
            { id: 't', kind: 'table', cls: 'sm', head: ['Bad request', 'Axum replies'], rows: [
              ['Malformed JSON', '<code>400</code> Bad Request'],
              ['Missing / wrong-typed field', '<code>422</code> Unprocessable'],
              ['No JSON content-type', '<code>415</code> Unsupported'],
              ['<code>/posts/abc</code>', '<code>400</code> (Path parse)'],
            ] },
          ],
          beats: [
            { say: 'The create action takes a Json extractor, which deserializes the request body into the New Post struct.', type: { rs: 3 }, lines: { rs: [3] } },
            { say: 'Order matters. The body can only be read once, so a body extractor like Json must be the last argument.', lines: { rs: [3] }, note: 'Body extractors (<code>Json</code>, <code>Form</code>, <code>String</code>) must come last.' },
            { say: 'Returning a tuple of a status code and JSON gives you a two oh one Created, like render json with status created.', type: { rs: 7 }, lines: { rs: [4, 6] } },
            { say: 'For index, the Query extractor parses the query string, which is handy for pagination params.', type: { rs: 'all' }, lines: { rs: [11] } },
            { say: 'And bad input never reaches your code. Axum rejects it with the right status automatically.', show: ['t.0', 't.1', 't.2', 't.3'] },
          ],
        },
        {
          type: 'checkpoint',
          q: 'Which route definition is correct in <b>Axum 0.8</b>?',
          options: ['<code>.route("/posts/:id", get(show))</code>', '<code>.route("/posts/{id}", get(show))</code>', '<code>.route("/posts/&lt;id&gt;", get(show))</code>', '<code>resources!(posts)</code>'],
          answer: 1,
          explain: 'Axum 0.8 switched to <code>{param}</code> (and <code>{*rest}</code> for wildcards). The old <code>:id</code> syntax panics when the router is built.',
          beats: [{ say: 'Checkpoint. You will meet older tutorials online, so which syntax is current?' }],
        },
        {
          title: 'State & middleware',
          layout: 'split',
          blocks: [
            { id: 'rs', kind: 'code', lang: 'rust', size: 16, code: `#[derive(Clone)]
struct AppState {
    repo: Arc<PostRepo>,
}

let app = Router::new()
    .route("/posts", get(index).post(create))
    .route("/posts/{id}", get(show))
    .layer(TraceLayer::new_for_http())
    .layer(CorsLayer::permissive())
    .with_state(AppState {
        repo: Arc::new(repo),
    });` },
            { id: 't', kind: 'table', cls: 'sm', head: ['Rails', 'Axum / tower'], rows: [
              ['Rack middleware', '<code>tower</code> Layer'],
              ['<code>config.middleware.use</code>', '<code>.layer(…)</code>'],
              ['<code>rack-cors</code>', '<code>CorsLayer</code>'],
              ['Request logging', '<code>TraceLayer</code>'],
              ['<code>before_action</code>', '<code>middleware::from_fn</code>'],
            ] },
          ],
          beats: [
            { say: 'Shared state is a struct that derives Clone. Axum clones it for every request, so wrap the expensive parts in an Arc to make cloning cheap.', type: { rs: 4 }, lines: { rs: [1, 2, 3] } },
            { say: 'Middleware comes from the tower ecosystem and is added with layer. It is the Rack of Rust.', type: { rs: 'all' }, lines: { rs: [9, 10] }, show: ['t.0', 't.1'] },
            { say: 'The tower http crate gives you ready-made layers: CORS like rack cors, request tracing, compression, timeouts.', show: ['t.2', 't.3'] },
            { say: 'And a before action becomes a middleware function, or a custom extractor that authenticates the user.', show: 't.4', note: 'An extractor like <code>CurrentUser</code> that fails with 401 is the idiomatic <code>authenticate_user!</code>.' },
          ],
        },
      ],
      summary: {
        tldr: 'An Axum app is a <code>Router</code> that maps <code>method + path</code> to async <b>handlers</b>. Handler arguments are <b>extractors</b> (<code>Path</code>, <code>Query</code>, <code>Json</code>, <code>State</code>) that replace <code>params</code>. Return values implement <code>IntoResponse</code>. serde\'s <code>Serialize</code>/<code>Deserialize</code> replace <code>as_json</code> and strong params. Middleware is a tower <code>Layer</code>.',
        points: [
          '<code>Router::new().route("/posts/{id}", get(show))</code>: explicit routes, and Axum 0.8 uses <code>{param}</code>.',
          'Handlers are async fns. Extractors in their arguments parse the request into typed values and reject bad input automatically.',
          'Body extractors such as <code>Json&lt;T&gt;</code> must be the <b>last</b> argument.',
          '<code>#[derive(Deserialize)]</code> input structs are strong params, and <code>#[derive(Serialize)]</code> replaces <code>as_json</code>.',
          'Return anything that implements <code>IntoResponse</code>. Share state with <code>.with_state</code>, and add middleware with <code>.layer(...)</code>.',
        ],
        rosetta: [
          ['<code>config/routes.rb</code>', '<code>Router::new().route(...)</code>'],
          ['<code>resources :posts</code>', 'Explicit <code>.route("/posts", get(index).post(create))</code>'],
          ['Controller action', '<code>async fn</code> handler'],
          ['<code>params[:id]</code>', '<code>Path(id): Path&lt;i64&gt;</code>'],
          ['<code>params[:page]</code> (query string)', '<code>Query(p): Query&lt;Pagination&gt;</code>'],
          ['Strong params', '<code>#[derive(Deserialize)] struct NewPost</code>'],
          ['<code>render json: post, status: :created</code>', '<code>(StatusCode::CREATED, Json(post))</code>'],
          ['<code>as_json</code> / serializers', '<code>#[derive(Serialize)]</code>'],
          ['Rack middleware', 'tower <code>Layer</code> via <code>.layer()</code>'],
        ],
        gotchas: [
          '<code>"/posts/:id"</code> from older tutorials panics on Axum 0.8. Use <code>"/posts/{id}"</code>.',
          'A handler whose argument order is wrong (e.g. <code>Json</code> before <code>State</code>) gives a confusing "trait <code>Handler</code> is not implemented" error. Add <code>#[axum::debug_handler]</code> for a clearer message.',
          'Your state type must be <code>Clone</code>. Wrap non-Clone things in <code>Arc</code>.',
        ],
        code: `use axum::{extract::{Path, State}, http::StatusCode, routing::get, Json, Router};

#[tokio::main]
async fn main() {
    let state = AppState::new();
    let app = Router::new()
        .route("/posts", get(index).post(create))
        .route("/posts/{id}", get(show))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}`,
        links: [['Axum docs', 'https://docs.rs/axum/latest/axum/'], ['Axum examples', 'https://github.com/tokio-rs/axum/tree/main/examples'], ['serde guide', 'https://serde.rs/'], ['tower-http', 'https://docs.rs/tower-http/']],
      },
      quiz: [
        { type: 'match', q: 'Match the Rails concept to its Axum counterpart.', pairs: [['params[:id]', 'Path(id)'], ['Strong params', '#[derive(Deserialize)] struct'], ['render json: post', 'Json(post)'], ['Rack middleware', 'tower Layer'], ['config/routes.rb', 'Router::new().route(...)']] },
        { type: 'fill', q: 'Complete the show route and its extractor (Axum 0.8).', code: '.route("/posts/___", get(show))\n\nasync fn show(___(id): Path<i64>) -> String {\n    format!("post {id}")\n}', answers: [['{id}'], ['Path']], explain: 'Path params use <code>{name}</code>, and the <code>Path(id)</code> pattern destructures the extractor.' },
        { type: 'compiles', q: 'This handler is registered with <code>.route("/posts", post(create))</code>. Does it compile?', code: 'async fn create(\n    Json(input): Json<NewPost>,\n    State(state): State<AppState>,\n) -> StatusCode {\n    StatusCode::CREATED\n}', answer: false, explain: '<code>Json</code> consumes the request body, so it must be the last argument. In this order the function does not implement <code>Handler</code>.' },
        { type: 'mcq', q: 'A client POSTs <code>{"body": "hi"}</code> (no <code>title</code>) to a handler taking <code>Json&lt;NewPost&gt;</code>. What happens?', options: ['Your handler runs with <code>title</code> set to an empty string', 'Axum responds 422 Unprocessable Entity before your handler runs', 'The server panics', 'Axum responds 500'], answer: 1, explain: 'The JSON parses but does not match the struct, so the <code>Json</code> extractor rejects it with 422.' },
        { type: 'order', q: 'Order the steps Axum takes to handle <code>GET /posts/42</code>.', items: ['The Router matches method + path', 'Extractors parse Path(42) and State', 'The handler runs', 'The return value is converted with IntoResponse', 'The client gets 200 OK with JSON'], explain: 'This is the pipeline from the request diagram: router, extractors, handler, IntoResponse, response.' },
        { type: 'mcq', q: 'Which return type gives the client a <b>201 Created</b> with the post as JSON?', options: ['<code>Json&lt;Post&gt;</code>', '<code>(StatusCode, Json&lt;Post&gt;)</code> returning <code>(StatusCode::CREATED, Json(post))</code>', '<code>Result&lt;Post, ()&gt;</code>', '<code>String</code>'], answer: 1, explain: 'Tuples of <code>(StatusCode, impl IntoResponse)</code> implement <code>IntoResponse</code> and override the status.' },
      ],
      practice: [
        {
          title: 'Write two handlers',
          prompt: 'You cannot run Axum in the Playground, so the axum types are small stand-ins and the repository is faked. Both are given, so most of the file is scaffolding you can skip: only the two <code>TODO</code>s are yours. Your job is the two handler bodies, the same shapes as the <i>Controller action → handler</i> and <i>Creating: Json in, 201 out</i> scenes.<br/>• <code>show</code>: the post as JSON, or <code>404</code> if it is missing.<br/>• <code>create</code>: insert, then answer <code>201 Created</code> with the new post as JSON.<br/>When both work it prints:<br/><code>Ok(Json(Post { id: 1, title: "First post" }))</code><br/><code>Err(StatusCode(404))</code><br/><code>(StatusCode(201), Json(Post { id: 2, title: "Hello" }))</code><br/>Until then <code>todo!()</code> panics with “not yet implemented”.',
          starter: `// --- given: tiny stand-ins for the axum types, so this runs in the Playground ---
#[derive(Debug, PartialEq)]
struct StatusCode(u16);
impl StatusCode {
    const CREATED: StatusCode = StatusCode(201);
    const NOT_FOUND: StatusCode = StatusCode(404);
}

#[derive(Debug, PartialEq)]
struct Json<T>(T);

#[derive(Debug, PartialEq)]
struct Post {
    id: i64,
    title: String,
}

struct NewPost {
    title: String,
}

// --- given: a fake repository (the real one would talk to the database) ---
struct PostRepo;

impl PostRepo {
    async fn find(&self, id: i64) -> Option<Post> {
        if id == 1 {
            Some(Post { id: 1, title: "First post".to_string() })
        } else {
            None
        }
    }

    async fn insert(&self, input: NewPost) -> Post {
        Post { id: 2, title: input.title }
    }
}

// TODO 1: like Rails' \`show\`. Look the post up and answer Json(post), or 404 if it is missing.
// (\`todo!()\` is a placeholder: it compiles, but panics if it runs. Replace it with your code.)
async fn show(repo: &PostRepo, id: i64) -> Result<Json<Post>, StatusCode> {
    todo!()
}

// TODO 2: like Rails' \`create\`. Insert the post and answer 201 Created with the new post as JSON.
async fn create(repo: &PostRepo, input: NewPost) -> (StatusCode, Json<Post>) {
    todo!()
}

#[tokio::main]
async fn main() {
    let repo = PostRepo;

    let found = show(&repo, 1).await;
    let missing = show(&repo, 99).await;
    let created = create(&repo, NewPost { title: "Hello".to_string() }).await;
    println!("{found:?}");
    println!("{missing:?}");
    println!("{created:?}");

    // given: these panic if a handler is wrong
    assert_eq!(found, Ok(Json(Post { id: 1, title: "First post".to_string() })));
    assert_eq!(missing, Err(StatusCode::NOT_FOUND));
    assert_eq!(created.0, StatusCode::CREATED);
}
`,
          hints: ['<code>repo.find(id).await</code> gives an <code>Option&lt;Post&gt;</code>. The <i>Controller action → handler</i> scene turns it into the answer with one chain.', 'Chain <code>.map(Json)</code> to wrap a found post, then <code>.ok_or(StatusCode::NOT_FOUND)</code> to turn <code>None</code> into the error.', '<code>show</code>: <code>repo.find(id).await.map(Json).ok_or(StatusCode::NOT_FOUND)</code>. <code>create</code>: <code>let post = repo.insert(input).await;</code> and then return the tuple <code>(StatusCode::CREATED, Json(post))</code>.'],
          solution: `// --- given: tiny stand-ins for the axum types, so this runs in the Playground ---
#[derive(Debug, PartialEq)]
struct StatusCode(u16);
impl StatusCode {
    const CREATED: StatusCode = StatusCode(201);
    const NOT_FOUND: StatusCode = StatusCode(404);
}

#[derive(Debug, PartialEq)]
struct Json<T>(T);

#[derive(Debug, PartialEq)]
struct Post {
    id: i64,
    title: String,
}

struct NewPost {
    title: String,
}

// --- given: a fake repository (the real one would talk to the database) ---
struct PostRepo;

impl PostRepo {
    async fn find(&self, id: i64) -> Option<Post> {
        if id == 1 {
            Some(Post { id: 1, title: "First post".to_string() })
        } else {
            None
        }
    }

    async fn insert(&self, input: NewPost) -> Post {
        Post { id: 2, title: input.title }
    }
}

async fn show(repo: &PostRepo, id: i64) -> Result<Json<Post>, StatusCode> {
    repo.find(id).await.map(Json).ok_or(StatusCode::NOT_FOUND)
}

async fn create(repo: &PostRepo, input: NewPost) -> (StatusCode, Json<Post>) {
    let post = repo.insert(input).await;
    (StatusCode::CREATED, Json(post))
}

#[tokio::main]
async fn main() {
    let repo = PostRepo;

    let found = show(&repo, 1).await;
    let missing = show(&repo, 99).await;
    let created = create(&repo, NewPost { title: "Hello".to_string() }).await;
    println!("{found:?}");
    println!("{missing:?}");
    println!("{created:?}");

    // given: these panic if a handler is wrong
    assert_eq!(found, Ok(Json(Post { id: 1, title: "First post".to_string() })));
    assert_eq!(missing, Err(StatusCode::NOT_FOUND));
    assert_eq!(created.0, StatusCode::CREATED);
}
`,
          explain: 'In the real app the parameters would be extractors (<code>State(state)</code>, <code>Path(id)</code>, <code>Json(input)</code>) and the types would come from <code>axum</code>. The bodies stay the same. The return types are the documentation: <code>Result&lt;Json&lt;Post&gt;, StatusCode&gt;</code> lists every possible outcome.',
        },
      ],
    },

    // ------------------------------------------------------------------ 5.3
    {
      id: 'sqlx-database',
      title: 'SQLx: SQL without the ActiveRecord',
      subtitle: 'Migrations, a connection pool, compile-time checked queries, and errors that become 404s.',
      tags: ['sqlx', 'database', 'postgres', 'activerecord', 'migrations', 'orm', 'transactions'],
      scenes: [
        {
          type: 'title', kicker: 'Module 5 · Lesson 3', title: 'SQLx: SQL without the ActiveRecord',
          subtitle: 'You write the SQL. The compiler checks it against your real database.',
          beats: [
            { say: 'Every Rails developer has a relationship with ActiveRecord. In this lesson we connect our posts API to Postgres the Rust way, with SQLx.' },
          ],
        },
        {
          title: 'No ORM, on purpose',
          blocks: [
            {
              id: 'c', kind: 'cards', items: [
                { icon: '💎', title: 'ActiveRecord', body: 'Models that know their table. Chainable scopes, callbacks, lazy loading. You mostly don\'t see the SQL.', cls: 'ruby' },
                { icon: '🦀', title: 'SQLx', body: 'Plain SQL strings, checked at compile time against your schema. Results map straight into structs. Fully async.', cls: 'rust' },
                { icon: '🧱', title: 'Alternatives', body: '<b>Diesel</b>: a type-safe query builder, synchronous. <b>SeaORM</b>: the closest feel to ActiveRecord, async.' },
              ],
            },
          ],
          beats: [
            { say: 'ActiveRecord is an ORM. Models know their tables, scopes chain, and the SQL mostly stays hidden.', show: 'c.0' },
            { say: 'SQLx makes a different trade. You write real SQL, and the macros check it against your actual database schema when you compile.', show: 'c.1', hl: ['c.1'] },
            { say: 'If you miss the ORM style, Diesel offers a type-safe query builder and SeaORM feels closest to ActiveRecord. We use SQLx because it is the most popular choice with Axum.', show: 'c.2' },
          ],
        },
        {
          title: 'rails db:migrate → sqlx migrate',
          layout: 'split',
          blocks: [
            { id: 't', kind: 'code', lang: 'shell', term: true, label: 'terminal', size: 16, code: `$ cargo install sqlx-cli
$ export DATABASE_URL=postgres://localhost/blog
$ sqlx database create
$ sqlx migrate add create_posts
Creating migrations/20261023120000_create_posts.sql
$ sqlx migrate run
Applied 20261023120000/migrate create posts` },
            { id: 's', kind: 'code', lang: 'sql', label: 'migrations/…_create_posts.sql', size: 17, code: `CREATE TABLE posts (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  published  BOOLEAN NOT NULL
             DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL
             DEFAULT now()
);` },
          ],
          beats: [
            { say: 'First, the schema. Install the sqlx command line tool, which plays the role of the rails db tasks.', type: { t: 1 } },
            { say: 'Point it at your database with the DATABASE URL variable, then create the database, like rails db create.', type: { t: 3 }, lines: { t: [2, 3] } },
            { say: 'sqlx migrate add creates a timestamped migration file, like rails generate migration.', type: { t: 5 }, lines: { t: [4, 5] } },
            { say: 'The difference: migrations are plain SQL, with no Ruby DSL. A big serial id, not-null columns and defaults, written by hand.', type: { s: 'all' } },
            { say: 'Then sqlx migrate run applies it, just like rails db migrate.', type: { t: 'all' }, lines: { t: [6, 7] }, note: 'Need a down migration? <code>sqlx migrate add -r name</code> creates <code>.up.sql</code> + <code>.down.sql</code>.' },
          ],
        },
        {
          title: 'The pool lives in your state',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'config/database.yml', code: `production:
  adapter: postgresql
  url: <%= ENV["DATABASE_URL"] %>
  pool: 5` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'main.rs', size: 16, code: `#[derive(Clone)]
struct AppState {
    db: PgPool,
}

let db = PgPoolOptions::new()
    .max_connections(5)
    .connect(&std::env::var("DATABASE_URL")?)
    .await?;

sqlx::migrate!().run(&db).await?;

let app = router().with_state(AppState { db });` },
          ],
          beats: [
            { say: 'In Rails, database yml configures a connection pool that ActiveRecord manages behind the scenes.', type: { rb: 'all' } },
            { say: 'In Rust the pool is an ordinary value. A PgPool goes into your app state, and handlers receive it through the State extractor.', type: { rs: 4 }, lines: { rs: [1, 2, 3, 4] } },
            { say: 'You build it with pool options: max connections, then connect with the URL from the environment.', type: { rs: 9 }, lines: { rs: [6, 7, 8, 9] } },
            { say: 'The migrate macro embeds your migration files in the binary, so the app can migrate itself on boot.', type: { rs: 11 }, lines: { rs: [11] } },
            { say: 'Cloning a pool is cheap, because it is reference counted inside, which is why the state can derive Clone.', type: { rs: 'all' }, lines: { rs: [13] }, note: 'No global <code>ActiveRecord::Base.connection</code>: the pool is passed explicitly wherever it\'s needed.' },
          ],
        },
        {
          title: 'Finders → fetch_*',
          blocks: [
            {
              id: 't', kind: 'table', head: ['ActiveRecord', 'SQLx', 'Returns'], rows: [
                ['<code>Post.all</code>', '<code>SELECT …</code> + <code>.fetch_all(&amp;db)</code>', '<code>Vec&lt;Post&gt;</code>'],
                ['<code>Post.find(id)</code>', '<code>WHERE id = $1</code> + <code>.fetch_one</code>', '<code>Post</code> or <code>RowNotFound</code>'],
                ['<code>Post.find_by(slug:)</code>', '<code>.fetch_optional</code>', '<code>Option&lt;Post&gt;</code>'],
                ['<code>Post.where(published: true)</code>', '<code>WHERE published = $1</code> + <code>.fetch_all</code>', '<code>Vec&lt;Post&gt;</code>'],
                ['<code>Post.create!(…)</code>', '<code>INSERT … RETURNING *</code> + <code>.fetch_one</code>', '<code>Post</code>'],
                ['<code>post.destroy</code>', '<code>DELETE …</code> + <code>.execute</code>', 'rows affected'],
              ], cls: 'sm',
            },
          ],
          beats: [
            { say: 'Your ActiveRecord finders map onto a small set of fetch methods.' },
            { say: 'fetch all returns a vector, like Post dot all.', show: 't.0' },
            { say: 'fetch one expects exactly one row. If there is none you get a row not found error, much like find raising record not found.', show: 't.1' },
            { say: 'fetch optional returns an Option, the Rust version of find by returning nil.', show: 't.2', hl: ['t.2'] },
            { say: 'Where clauses are just SQL with numbered parameters. Parameters are always bound, never interpolated, so you get SQL injection safety for free.', show: 't.3' },
            { say: 'Creates use insert with returning, so Postgres hands back the new row with its id. Deletes and updates use execute.', show: ['t.4', 't.5'] },
          ],
        },
        {
          title: 'query_as!: compile-time checked SQL',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'repo.rs', size: 16, code: `#[derive(Serialize, sqlx::FromRow)]
struct Post { id: i64, title: String, body: String, published: bool }

async fn find_post(db: &PgPool, id: i64) -> sqlx::Result<Option<Post>> {
    sqlx::query_as!(
        Post,
        "SELECT id, title, body, published FROM posts WHERE id = $1",
        id
    )
    .fetch_optional(db)
    .await
}` },
            { id: 'e', kind: 'text', style: 'err', html: '<b>error</b>: error returned from database: column "titel" does not exist\n  --> src/repo.rs:5:5' },
          ],
          beats: [
            { say: 'Here is the star feature. The query as macro takes a target struct, a SQL string and the bind parameters.', type: { c: 9 }, lines: { c: [5, 6, 7, 8] } },
            { say: 'At compile time, SQLx sends this query to your development database and checks it: the columns exist, the types match the struct fields, and the parameter is an i64.', lines: { c: [7] } },
            { say: 'Make a typo in a column name, and the build fails. You find the problem at compile time, not in production.', show: 'e' },
            { say: 'Then fetch optional runs it and maps the row into a Post, giving you an Option.', type: { c: 'all' }, lines: { c: [10, 11] }, note: 'CI without a database? Run <code>cargo sqlx prepare</code>, commit <code>.sqlx/</code>, and build with <code>SQLX_OFFLINE=true</code>.' },
            { say: 'FromRow is only needed for the non-macro query as function. It is handy for dynamic queries that cannot be checked at compile time.', lines: { c: [1] } },
          ],
        },
        {
          type: 'checkpoint',
          q: 'You\'re porting <code>Post.find_by(slug: params[:slug])</code>, which may legitimately find nothing. Which SQLx method should end the query?',
          options: ['<code>.fetch_all(&amp;db)</code>', '<code>.fetch_one(&amp;db)</code>', '<code>.fetch_optional(&amp;db)</code>', '<code>.execute(&amp;db)</code>'],
          answer: 2,
          explain: '<code>fetch_optional</code> returns <code>Option&lt;Post&gt;</code>: <code>None</code> where Rails would give <code>nil</code>. <code>fetch_one</code> would treat "not found" as an error, like <code>find</code>.',
          beats: [{ say: 'Checkpoint. Find by, the nil-returning finder. Which fetch method matches?' }],
        },
        {
          title: 'Transactions',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'publish.rb', code: `ActiveRecord::Base.transaction do
  post.update!(published: true)
  AuditLog.create!(post_id: post.id, action: "publish")
end` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'publish.rs', size: 16, code: `let mut tx = db.begin().await?;

sqlx::query!("UPDATE posts SET published = true WHERE id = $1", id)
    .execute(&mut *tx).await?;
sqlx::query!("INSERT INTO audit_logs (post_id, action) VALUES ($1, 'publish')", id)
    .execute(&mut *tx).await?;

tx.commit().await?;  // dropped without commit → ROLLBACK` },
          ],
          beats: [
            { say: 'Transactions in Rails use a block. Raise inside it and everything rolls back.', type: { rb: 'all' } },
            { say: 'In SQLx you begin a transaction and get a transaction value.', type: { rs: 1 }, lines: { rs: [1] } },
            { say: 'Each query executes against the transaction instead of the pool.', type: { rs: 6 }, lines: { rs: [4, 6] } },
            { say: 'Then you commit. Here is where ownership shines: if any question mark returns early, the transaction is dropped without a commit, and SQLx rolls it back automatically.', type: { rs: 'all' }, lines: { rs: [8] }, note: 'That\'s RAII from Module 2: cleanup happens when the owner goes out of scope.' },
          ],
        },
        {
          title: 'rescue_from → impl IntoResponse',
          layout: 'split',
          blocks: [
            { id: 'a', kind: 'code', lang: 'rust', label: 'error.rs', size: 15, code: `enum AppError {
    NotFound,
    Invalid(String),
    Db(sqlx::Error),
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        match e {
            sqlx::Error::RowNotFound =>
                AppError::NotFound,
            other => AppError::Db(other),
        }
    }
}` },
            { id: 'b', kind: 'code', lang: 'rust', label: 'error.rs', size: 15, code: `impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::NotFound =>
                StatusCode::NOT_FOUND.into_response(),
            AppError::Invalid(msg) =>
                (StatusCode::UNPROCESSABLE_ENTITY, msg)
                    .into_response(),
            AppError::Db(_) =>
                StatusCode::INTERNAL_SERVER_ERROR
                    .into_response(),
        }
    }
}` },
          ],
          beats: [
            { say: 'Last piece: error handling. Rails has rescue from, which turns record not found into a four oh four.', type: { a: 5 } },
            { say: 'In Rust you define an app error enum. Implementing From for sqlx errors maps row not found to Not Found and wraps everything else.', type: { a: 'all' }, lines: { a: [7, 10, 11] } },
            { say: 'Then you implement IntoResponse, deciding the HTTP status for each variant. Not found is four oh four, invalid is four twenty-two, and anything else is a five hundred.', type: { b: 'all' } },
          ],
        },
        {
          title: 'Handlers that just use ?',
          blocks: [
            { id: 'h', kind: 'code', lang: 'rust', label: 'handlers.rs', size: 16, code: `async fn show(
    State(s): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Post>, AppError> {
    let post = sqlx::query_as!(
        Post,
        "SELECT id, title, body, published FROM posts WHERE id = $1",
        id
    )
    .fetch_one(&s.db)
    .await?;   // RowNotFound → AppError::NotFound → 404

    Ok(Json(post))
}` },
          ],
          beats: [
            { say: 'Now handlers return a Result with your app error as the error type.', type: { h: 4 }, lines: { h: [4] } },
            { say: 'Inside, you just write the happy path. fetch one either gives you a post or an error.', type: { h: 11 } },
            { say: 'The question mark operator converts a database error into an app error through your From implementation, and returns early.', lines: { h: [11] } },
            { say: 'Axum then calls into response on it. A missing post becomes a four oh four: rescue from, checked by the type system.', type: { h: 'all' }, lines: { h: [11, 13] }, note: 'For less boilerplate, crates like <code>thiserror</code> derive <code>Display</code>/<code>From</code> for you.' },
          ],
        },
      ],
      summary: {
        tldr: 'SQLx is not an ORM. You write SQL and <code>query_as!</code> checks it against your database at compile time, mapping rows into structs. Migrations are plain SQL run with <code>sqlx migrate</code>. A <code>PgPool</code> lives in your Axum state. Choose <code>fetch_one</code>, <code>fetch_optional</code> or <code>fetch_all</code> to match <code>find</code>, <code>find_by</code> or <code>where</code>. A custom <code>AppError</code> implementing <code>IntoResponse</code> replaces <code>rescue_from</code>.',
        points: [
          '<code>sqlx migrate add</code> / <code>run</code> replace <code>rails g migration</code> / <code>db:migrate</code>. Migrations are plain SQL.',
          'A <code>PgPool</code> is cheap to clone. Store it in <code>AppState</code> and pull it out with <code>State</code>.',
          '<code>query_as!(Post, "SELECT …", args)</code> is checked at compile time against your schema.',
          '<code>fetch_one</code> ≈ <code>find</code> (errors if missing), <code>fetch_optional</code> ≈ <code>find_by</code> (<code>Option</code>), <code>fetch_all</code> ≈ <code>where</code>/<code>all</code>.',
          'Transactions roll back if dropped without <code>commit()</code>. Map <code>sqlx::Error</code> into your own <code>AppError</code> with <code>From</code>, and to HTTP statuses with <code>IntoResponse</code>.',
        ],
        rosetta: [
          ['ActiveRecord model', 'Plain struct + <code>query_as!</code>'],
          ['<code>rails g migration</code>', '<code>sqlx migrate add name</code>'],
          ['<code>rails db:migrate</code>', '<code>sqlx migrate run</code> / <code>sqlx::migrate!()</code>'],
          ['<code>database.yml</code> pool', '<code>PgPoolOptions::new().max_connections(5)</code>'],
          ['<code>Post.find(id)</code>', '<code>.fetch_one(&amp;db)</code>'],
          ['<code>Post.find_by(...)</code> → nil', '<code>.fetch_optional(&amp;db)</code> → <code>None</code>'],
          ['<code>Post.where(...)</code>', '<code>WHERE … $1</code> + <code>.fetch_all(&amp;db)</code>'],
          ['<code>ActiveRecord::Base.transaction do</code>', '<code>db.begin()</code> … <code>tx.commit()</code>'],
          ['<code>rescue_from RecordNotFound</code>', '<code>impl From&lt;sqlx::Error&gt;</code> + <code>IntoResponse</code>'],
        ],
        gotchas: [
          'The <code>query!</code>/<code>query_as!</code> macros need <code>DATABASE_URL</code> at compile time, or offline data from <code>cargo sqlx prepare</code> plus <code>SQLX_OFFLINE=true</code>.',
          'Nullable columns map to <code>Option&lt;T&gt;</code>. If your struct field isn\'t an <code>Option</code>, the macro will tell you.',
          'There is no lazy loading and no N+1 magic either way: you write the JOIN or the second query yourself.',
          'Postgres placeholders are <code>$1, $2</code>. MySQL/SQLite use <code>?</code>.',
        ],
        code: `async fn list_published(db: &PgPool) -> sqlx::Result<Vec<Post>> {
    sqlx::query_as!(
        Post,
        "SELECT id, title, body, published
         FROM posts WHERE published = $1
         ORDER BY id DESC LIMIT 20",
        true
    )
    .fetch_all(db)
    .await
}`,
        links: [['SQLx on GitHub', 'https://github.com/launchbadge/sqlx'], ['sqlx-cli', 'https://github.com/launchbadge/sqlx/tree/main/sqlx-cli'], ['Diesel', 'https://diesel.rs/'], ['SeaORM', 'https://www.sea-ql.org/SeaORM/']],
      },
      quiz: [
        { type: 'match', q: 'Match each ActiveRecord call with its SQLx equivalent.', pairs: [['Post.find(id)', 'fetch_one'], ['Post.find_by(slug: s)', 'fetch_optional'], ['Post.where(published: true)', 'fetch_all'], ['post.destroy', 'execute'], ['rails db:migrate', 'sqlx migrate run']] },
        { type: 'mcq', q: 'What does <code>sqlx::query_as!</code> verify at <b>compile time</b>?', options: ['Nothing, it is just string formatting', 'That the SQL is valid for your schema and the column/parameter types match your struct and arguments', 'That the query is fast', 'That the database is reachable in production'], answer: 1, explain: 'The macro prepares the query against your dev database (or cached offline metadata) and type-checks it.' },
        { type: 'fill', q: 'Complete the lookup that returns <code>Option&lt;Post&gt;</code>.', code: 'let post = sqlx::query_as!(Post, "SELECT id, title, body, published FROM posts WHERE id = ___", id)\n    .___(&db)\n    .await?;', answers: [['$1'], ['fetch_optional']], explain: 'Postgres uses numbered placeholders, and <code>fetch_optional</code> yields <code>Option</code>.' },
        { type: 'mcq', q: 'A function begins a transaction, runs two queries, but the second query fails and <code>?</code> returns early before <code>tx.commit()</code>. What happens to the first query\'s change?', options: ['It is committed', 'It is rolled back when the transaction is dropped', 'The connection leaks', 'It depends on <code>autocommit</code>'], answer: 1, explain: 'Dropping an uncommitted <code>Transaction</code> rolls it back. That is ownership-based cleanup (RAII).' },
        { type: 'order', q: 'Order the workflow for adding a <code>comments</code> table and querying it.', items: ['sqlx migrate add create_comments', 'Write the CREATE TABLE SQL', 'sqlx migrate run', 'Write a query_as! in your repo', 'cargo build (the query is checked)'], explain: 'Migrations first, so the compile-time checker can see the new table.' },
        { type: 'mcq', q: 'How do you make <code>sqlx::Error::RowNotFound</code> become an HTTP 404 automatically when using <code>?</code> in handlers?', options: ['Add <code>rescue_from</code> to the router', 'Implement <code>From&lt;sqlx::Error&gt;</code> for your <code>AppError</code> and <code>IntoResponse</code> for <code>AppError</code>', 'Wrap every query in <code>catch_unwind</code>', 'Return <code>Option</code> from every handler'], answer: 1, explain: '<code>?</code> calls <code>From::from</code> on the error, and Axum calls <code>into_response</code> on your error type.' },
      ],
      practice: [
        {
          title: 'Map errors to statuses',
          prompt: 'The Playground has no Postgres or SQLx, so <code>DbError</code> stands in for <code>sqlx::Error</code> and <code>fetch_one</code> fakes a query (most of the file is that given scaffolding: only the two <code>TODO</code>s are yours). Write the two pieces from the <i>rescue_from → impl IntoResponse</i> scene: the <code>From</code> conversion, and the HTTP status of each error. The handler <code>show</code> is given: it only uses <code>?</code>, which calls your <code>From</code>. When both work it prints:<br/><code>Ok(Post { id: 1, title: "Hello SQLx" })</code><br/><code>404</code><br/><code>500</code><br/>Until then it panics with “not yet implemented”.',
          starter: `// --- given: stand-in for sqlx::Error (the Playground has no Postgres or sqlx) ---
#[derive(Debug, PartialEq)]
enum DbError {
    RowNotFound,
    Other(String),
}

#[derive(Debug, PartialEq)]
struct Post {
    id: i64,
    title: String,
}

// --- given: stand-in for sqlx::query_as!(Post, "... WHERE id = $1", id).fetch_one(&db).await ---
fn fetch_one(id: i64) -> Result<Post, DbError> {
    match id {
        1 => Ok(Post { id: 1, title: "Hello SQLx".to_string() }),
        13 => Err(DbError::Other("connection reset".to_string())),
        _ => Err(DbError::RowNotFound),
    }
}

#[derive(Debug, PartialEq)]
enum AppError {
    NotFound,
    Db(DbError),
}

// TODO 1: like the lesson's \`impl From<sqlx::Error> for AppError\`.
// RowNotFound becomes AppError::NotFound. Anything else gets wrapped in AppError::Db(...).
impl From<DbError> for AppError {
    fn from(e: DbError) -> Self {
        todo!() // (a placeholder: it compiles, but panics if it runs)
    }
}

impl AppError {
    // TODO 2: like the lesson's \`impl IntoResponse\`. Pick the HTTP status:
    // NotFound is 404 and Db is 500.
    fn status(&self) -> u16 {
        todo!()
    }
}

// --- given: the handler only writes the happy path; \`?\` calls your From impl on the error ---
fn show(id: i64) -> Result<Post, AppError> {
    let post = fetch_one(id)?;
    Ok(post)
}

fn main() {
    println!("{:?}", show(1));
    println!("{:?}", show(99).unwrap_err().status());
    println!("{:?}", show(13).unwrap_err().status());

    // given: these panic if your code is wrong
    assert_eq!(show(99), Err(AppError::NotFound));
    assert_eq!(show(13), Err(AppError::Db(DbError::Other("connection reset".to_string()))));
    assert_eq!(AppError::NotFound.status(), 404);
}
`,
          hints: ['<code>match e { ... }</code> with two arms: one for <code>DbError::RowNotFound</code>, and one catch-all that names the value, like <code>other =&gt; ...</code>, as in the lesson.', '<code>RowNotFound =&gt; AppError::NotFound</code>, and <code>other =&gt; AppError::Db(other)</code>. For <code>status</code>, match on <code>self</code>: <code>AppError::NotFound</code> and <code>AppError::Db(_)</code>.', 'from: <code>match e { DbError::RowNotFound =&gt; AppError::NotFound, other =&gt; AppError::Db(other) }</code>. status: <code>match self { AppError::NotFound =&gt; 404, AppError::Db(_) =&gt; 500 }</code>'],
          solution: `// --- given: stand-in for sqlx::Error (the Playground has no Postgres or sqlx) ---
#[derive(Debug, PartialEq)]
enum DbError {
    RowNotFound,
    Other(String),
}

#[derive(Debug, PartialEq)]
struct Post {
    id: i64,
    title: String,
}

// --- given: stand-in for sqlx::query_as!(Post, "... WHERE id = $1", id).fetch_one(&db).await ---
fn fetch_one(id: i64) -> Result<Post, DbError> {
    match id {
        1 => Ok(Post { id: 1, title: "Hello SQLx".to_string() }),
        13 => Err(DbError::Other("connection reset".to_string())),
        _ => Err(DbError::RowNotFound),
    }
}

#[derive(Debug, PartialEq)]
enum AppError {
    NotFound,
    Db(DbError),
}

impl From<DbError> for AppError {
    fn from(e: DbError) -> Self {
        match e {
            DbError::RowNotFound => AppError::NotFound,
            other => AppError::Db(other),
        }
    }
}

impl AppError {
    fn status(&self) -> u16 {
        match self {
            AppError::NotFound => 404,
            AppError::Db(_) => 500,
        }
    }
}

// --- given: the handler only writes the happy path; \`?\` calls your From impl on the error ---
fn show(id: i64) -> Result<Post, AppError> {
    let post = fetch_one(id)?;
    Ok(post)
}

fn main() {
    println!("{:?}", show(1));
    println!("{:?}", show(99).unwrap_err().status());
    println!("{:?}", show(13).unwrap_err().status());

    // given: these panic if your code is wrong
    assert_eq!(show(99), Err(AppError::NotFound));
    assert_eq!(show(13), Err(AppError::Db(DbError::Other("connection reset".to_string()))));
    assert_eq!(AppError::NotFound.status(), 404);
}
`,
          explain: 'Swap <code>DbError</code> for <code>sqlx::Error</code>, <code>fetch_one</code> for a real <code>query_as!</code>, and <code>status()</code> for <code>impl IntoResponse</code>, and this is the real architecture: the handler stays the happy path, and <code>?</code> plus <code>From</code> turn a missing row into a 404.',
        },
      ],
    },

    // ------------------------------------------------------------------ 5.4
    {
      id: 'testing-deploy',
      title: 'Testing & shipping',
      subtitle: 'cargo test instead of RSpec, request specs without a server, and a Docker image a fraction the size of your Rails one.',
      tags: ['testing', 'rspec', 'cargo test', 'docker', 'deploy', 'tracing', 'logging', 'config'],
      scenes: [
        {
          type: 'title', kicker: 'Module 5 · Lesson 4', title: 'Testing & shipping',
          subtitle: 'From green tests to a ~100 MB production image.',
          beats: [
            { say: 'The final lesson. We test our posts API, then ship it, and finish with where to go next on your Rust journey.' },
          ],
        },
        {
          title: 'RSpec → #[test]',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'spec/models/post_spec.rb', size: 16, code: `RSpec.describe Post do
  it "builds a slug" do
    post = Post.new(title: "Hello World")
    expect(post.slug).to eq("hello-world")
  end
end` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'src/post.rs', size: 16, code: `pub fn slugify(title: &str) -> String {
    title.to_lowercase().replace(' ', "-")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_a_slug() {
        assert_eq!(slugify("Hello World"), "hello-world");
    }
}` },
          ],
          beats: [
            { say: 'Here is a familiar model spec: describe, it, expect to eq.', type: { rb: 'all' } },
            { say: 'In Rust, unit tests live in the same file as the code they test, inside a module called tests.', type: { rs: 3 } },
            { say: 'The cfg test attribute means this module is compiled only when you run cargo test. It never ships in your release binary.', type: { rs: 7 }, lines: { rs: [5, 6] } },
            { say: 'use super star brings the parent module into scope. Because tests live inside the module, they can even test private functions.', lines: { rs: [7] } },
            { say: 'Each test is a function marked with the test attribute. assert eq is your expect to eq, and on failure it prints both values.', type: { rs: 'all' }, lines: { rs: [9, 10, 11] } },
          ],
        },
        {
          title: 'Running tests',
          layout: 'split',
          blocks: [
            { id: 't', kind: 'code', lang: 'shell', term: true, label: 'terminal', size: 16, code: `$ cargo test
running 3 tests
test post::tests::builds_a_slug ... ok
test post::tests::rejects_blank ... ok
test api::show_returns_404 ... ok

test result: ok. 3 passed; 0 failed
$ cargo test slug   # filter by name` },
            { id: 'tb', kind: 'table', cls: 'sm', head: ['Rails', 'Rust'], rows: [
              ['<code>spec/models/*</code>', '<code>#[cfg(test)] mod tests</code> in the file'],
              ['<code>spec/requests/*</code>', '<code>tests/*.rs</code> (integration)'],
              ['<code>expect(x).to eq(y)</code>', '<code>assert_eq!(x, y)</code>'],
              ['<code>expect { }.to raise_error</code>', '<code>#[should_panic]</code> / <code>is_err()</code>'],
              ['FactoryBot', 'builder fns / <code>Default</code>'],
            ] },
          ],
          beats: [
            { say: 'cargo test compiles your project in test mode and runs every test, in parallel by default.', type: { t: 'all' } },
            { say: 'Pass part of a name to filter, like running rspec on a single file.', lines: { t: [8] } },
            { say: 'Unit tests sit next to the code. Integration tests, the equivalent of request specs, go in a top-level tests folder and use your crate from the outside.', show: ['tb.0', 'tb.1'] },
            { say: 'Assertions are macros. For errors, check is err on the Result, or mark the test should panic.', show: ['tb.2', 'tb.3'] },
            { say: 'There is no FactoryBot. Small builder functions, or the Default trait, do the job.', show: 'tb.4' },
          ],
        },
        {
          title: 'Request specs without a server',
          blocks: [
            { id: 'c', kind: 'code', lang: 'rust', label: 'tests/posts_api.rs', size: 16, code: `use axum::{body::Body, http::{Request, StatusCode}};
use tower::ServiceExt; // for .oneshot()

#[sqlx::test]  // fresh database per test, migrations applied
async fn unknown_post_is_404(db: PgPool) {
    let app = blog::app(AppState { db });

    let res = app
        .oneshot(Request::get("/posts/999").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}` },
          ],
          beats: [
            { say: 'Now the API itself. Rails request specs fire fake requests at your app without a real server. Axum can do the same thing.', type: { c: 2 } },
            { say: 'The sqlx test attribute creates a fresh test database for each test, applies your migrations, and hands you a pool. It works like transactional fixtures, but fully isolated.', type: { c: 5 }, lines: { c: [4, 5] } },
            { say: 'Build the same router your main function uses, then call oneshot with a request. No port, no HTTP server, just a function call.', type: { c: 11 }, lines: { c: [6, 8, 9] } },
            { say: 'And assert on the response status, or read the body and parse the JSON.', type: { c: 'all' }, lines: { c: [13] }, note: 'For async tests without a DB, use <code>#[tokio::test]</code>.' },
          ],
        },
        {
          type: 'checkpoint',
          q: 'What happens to code inside <code>#[cfg(test)] mod tests { … }</code> when you run <code>cargo build --release</code>?',
          options: ['It is compiled and runs at startup', 'It is compiled but never called', 'It is not compiled at all, so it adds nothing to the binary', 'The build fails unless tests pass'],
          answer: 2,
          explain: '<code>cfg(test)</code> is conditional compilation: the module exists only when building with the test harness (<code>cargo test</code>).',
          beats: [{ say: 'Checkpoint. Do your tests end up inside your production binary?' }],
        },
        {
          title: 'Shipping: a multi-stage Dockerfile',
          layout: 'split',
          blocks: [
            { id: 'd', kind: 'code', lang: 'shell', label: 'Dockerfile', size: 16, code: `# --- build stage ---
FROM rust:1-bookworm AS build
WORKDIR /app
COPY . .
ENV SQLX_OFFLINE=true
RUN cargo build --release

# --- runtime stage ---
FROM debian:bookworm-slim
WORKDIR /app
COPY --from=build /app/target/release/blog .
ENV RUST_LOG=info
EXPOSE 3000
CMD ["./blog"]` },
            { id: 'c', kind: 'cards', items: [
              { icon: '🐘', title: 'Typical Rails image', body: 'Ruby + gems + node/assets: 500 MB to 1 GB. Boots in seconds.', cls: 'ruby' },
              { icon: '🪶', title: 'This Rust image', body: 'Slim Debian + one binary: ~80 to 100 MB, under 20 MB with musl. Boots in milliseconds.', cls: 'rust' },
            ] },
          ],
          beats: [
            { say: 'Deployment. In Rails, your production image needs Ruby, every gem, maybe Node for assets, and a bundle install.', show: 'c.0' },
            { say: 'Rust uses a multi-stage build. The first stage has the full compiler toolchain and builds a release binary.', type: { d: 6 }, lines: { d: [2, 6] } },
            { say: 'SQLX OFFLINE tells the query macros to use the cached metadata from cargo sqlx prepare, so the build needs no database.', lines: { d: [5] } },
            { say: 'The second stage starts from a slim Debian image and copies in one file, the binary. No compiler, no source code, no gems.', type: { d: 'all' }, lines: { d: [9, 11, 14] }, show: 'c.1' },
            { say: 'The result is a small image that boots in milliseconds and runs comfortably on the smallest instance you can rent.', note: 'Speed up rebuilds by caching dependencies with <code>cargo-chef</code>. Go smaller with musl + <code>scratch</code> or distroless.' },
          ],
        },
        {
          title: 'Config & logging',
          layout: 'split',
          blocks: [
            { id: 'rb', kind: 'code', lang: 'ruby', label: 'rails', size: 16, code: `# secrets & config
Rails.application.credentials.api_key
ENV.fetch("DATABASE_URL")

# logging
Rails.logger.info(
  "Created post #{post.id}"
)` },
            { id: 'rs', kind: 'code', lang: 'rust', label: 'main.rs', size: 16, code: `// .env in development only
dotenvy::dotenv().ok();
let url = std::env::var("DATABASE_URL")?;

// RUST_LOG=info,blog=debug
tracing_subscriber::fmt()
    .with_env_filter(EnvFilter::from_default_env())
    .init();

tracing::info!(post_id = post.id, "created post");` },
          ],
          beats: [
            { say: 'Configuration. Rails has encrypted credentials and environment variables.', type: { rb: 3 } },
            { say: 'Rust apps follow twelve-factor style: read environment variables, and in development load a dot env file with the dotenvy crate.', type: { rs: 3 }, lines: { rs: [2, 3] } },
            { say: 'For logging, the standard is the tracing crate. Install a subscriber once at startup and control verbosity with the RUST LOG variable.', type: { rb: 'all', rs: 8 }, lines: { rs: [5, 6, 7, 8] }, note: '<code>EnvFilter</code> needs the <code>env-filter</code> feature of <code>tracing-subscriber</code>.' },
            { say: 'Log calls are structured. Fields like post id are real key-value pairs, ready for JSON logs and your observability tools.', type: { rs: 'all' }, lines: { rs: [10] } },
          ],
        },
        {
          title: 'You made it. What next?',
          blocks: [
            {
              id: 'c', kind: 'cards', items: [
                { icon: '🦀', title: 'Practice', body: '<b>Rustlings</b> exercises and <b>Exercism</b>\'s Rust track, a little every day.' },
                { icon: '📗', title: 'Go deeper', body: '<b>Zero To Production in Rust</b>: a production web API (actix-web + sqlx), end to end.' },
                { icon: '💎', title: 'Bridge back', body: 'Speed up a hot path in your Rails app with a native gem via <b>magnus</b>.' },
                { icon: '🧰', title: 'Learn the crates', body: '<code>thiserror</code>, <code>anyhow</code>, <code>reqwest</code>, <code>clap</code>, <code>chrono</code>, <code>uuid</code>.' },
                { icon: '🔁', title: 'Revisit ownership', body: 'Re-watch Module 2 after building something. It clicks the second time.' },
                { icon: '🚀', title: 'Ship something', body: 'Port one small internal service. Real code teaches fastest.' },
              ],
            },
          ],
          beats: [
            { say: 'That is the whole journey: ownership, borrowing, enums, traits, errors, async, and a real web API with a database, tests and a Docker image.' },
            { say: 'Keep the momentum. Do Rustlings or the Exercism track a little every day.', show: 'c.0' },
            { say: 'For a book-length version of what we just built, read Zero to Production in Rust.', show: 'c.1' },
            { say: 'Or bring Rust back home: write a native gem with magnus to speed up a hot path in your Rails app.', show: 'c.2' },
            { say: 'Learn the everyday crates, and re-watch the ownership module. It clicks the second time.', show: ['c.3', 'c.4'] },
            { say: 'Most of all, ship something small and real. Thanks for taking Rust for Rails Devs. Welcome, Rustacean.', show: 'c.5', note: 'Welcome, <b>Rustacean</b>. 🦀' },
          ],
        },
      ],
      summary: {
        tldr: 'Unit tests live next to the code in <code>#[cfg(test)] mod tests</code>. Integration tests go in <code>tests/</code>. <code>assert_eq!</code> replaces <code>expect().to eq</code>. Test Axum handlers in-process with <code>tower::ServiceExt::oneshot</code> and get an isolated DB with <code>#[sqlx::test]</code>. Ship with a multi-stage Dockerfile that copies one release binary into a slim image. Configure with env vars (<code>dotenvy</code> in dev) and log with <code>tracing</code>.',
        points: [
          '<code>#[cfg(test)] mod tests { use super::*; #[test] fn … }</code>: compiled only for <code>cargo test</code>.',
          'Integration tests in <code>tests/*.rs</code> use your crate like an outside user, the equivalent of request specs.',
          '<code>app.oneshot(request)</code> tests the full router without a server. <code>#[sqlx::test]</code> gives each test a fresh migrated database.',
          'A multi-stage Docker build ships just the release binary: small images and millisecond boots.',
          'Config comes from env vars (<code>dotenvy</code> for local <code>.env</code>). <code>tracing</code> gives structured logs controlled by <code>RUST_LOG</code>.',
        ],
        rosetta: [
          ['<code>it "…" do … end</code>', '<code>#[test] fn …() { … }</code>'],
          ['<code>expect(x).to eq(y)</code>', '<code>assert_eq!(x, y)</code>'],
          ['<code>spec/requests</code> + <code>get "/posts/1"</code>', '<code>tests/</code> + <code>app.oneshot(Request::get(...))</code>'],
          ['Transactional fixtures', '<code>#[sqlx::test]</code> (DB per test)'],
          ['<code>bundle exec rspec</code>', '<code>cargo test</code>'],
          ['Rails Docker image with gems + assets', 'Multi-stage build → one binary'],
          ['<code>Rails.application.credentials</code> / <code>ENV</code>', '<code>std::env::var</code> + <code>dotenvy</code>'],
          ['<code>Rails.logger.info</code>', '<code>tracing::info!(key = value, "msg")</code>'],
        ],
        gotchas: [
          'Tests in <code>mod tests</code> need <code>use super::*;</code> to see the code under test.',
          'Tests run in parallel by default. Shared external state (files, ports) needs care. <code>-- --test-threads=1</code> serializes them.',
          'Build and run images on the same Debian release (e.g. both <code>bookworm</code>) to avoid glibc mismatches.',
          '<code>debian:bookworm-slim</code> has no CA certificates. If your app makes TLS connections (HTTPS APIs, a managed Postgres), <code>apt-get install ca-certificates</code> in the runtime stage.',
          'Without <code>SQLX_OFFLINE=true</code> and a committed <code>.sqlx/</code> dir, Docker builds fail because the macros can\'t reach a database.',
        ],
        code: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slug() {
        assert_eq!(slugify("Hello World"), "hello-world");
    }

    #[tokio::test]
    async fn async_works() {
        assert_eq!(fetch_title(1).await, "Post #1");
    }
}`,
        links: [['The Book, ch. 11: Writing Tests', 'https://doc.rust-lang.org/book/ch11-00-testing.html'], ['Zero To Production in Rust', 'https://www.zero2prod.com/'], ['cargo-chef', 'https://github.com/LukeMathWalker/cargo-chef'], ['tracing', 'https://docs.rs/tracing/'], ['Rustlings', 'https://github.com/rust-lang/rustlings']],
      },
      quiz: [
        { type: 'match', q: 'Match the Rails testing/ops concept with its Rust counterpart.', pairs: [['expect(x).to eq(y)', 'assert_eq!(x, y)'], ['spec/requests', 'tests/ + oneshot'], ['Transactional fixtures', '#[sqlx::test]'], ['Rails.logger.info', 'tracing::info!'], ['ENV.fetch("X")', 'std::env::var("X")']] },
        { type: 'compiles', q: 'Running <code>cargo test</code>: does this compile?', code: 'fn double(x: i32) -> i32 {\n    x * 2\n}\n\n#[cfg(test)]\nmod tests {\n    #[test]\n    fn doubles() {\n        assert_eq!(double(2), 4);\n    }\n}', answer: false, explain: '<code>tests</code> is a child module. Without <code>use super::*;</code> (or <code>super::double</code>), <code>double</code> is not in scope.' },
        { type: 'fill', q: 'Complete the async handler test.', code: 'use tower::___; // brings .oneshot() into scope\n\n#[tokio::___]\nasync fn index_is_ok() {\n    let res = app().oneshot(Request::get("/posts").body(Body::empty()).unwrap()).await.unwrap();\n    assert_eq!(res.status(), StatusCode::OK);\n}', answers: [['ServiceExt'], ['test']], explain: '<code>oneshot</code> is a <code>ServiceExt</code> method, and async tests need <code>#[tokio::test]</code>.' },
        { type: 'order', q: 'Order the lines of a minimal multi-stage Dockerfile.', items: ['FROM rust:1-bookworm AS build', 'COPY . .', 'RUN cargo build --release', 'FROM debian:bookworm-slim', 'COPY --from=build /app/target/release/blog .', 'CMD ["./blog"]'], explain: 'Build everything in a fat image, then copy only the binary into a slim one.' },
        { type: 'mcq', q: 'Why set <code>SQLX_OFFLINE=true</code> in the Docker build stage?', options: ['To disable the database in production', 'So <code>query!</code> macros use the cached metadata from <code>cargo sqlx prepare</code> instead of connecting to a database at compile time', 'To make the binary smaller', 'To skip running migrations'], answer: 1, explain: 'The compile-time checks normally need a live DB. Offline mode uses the committed <code>.sqlx/</code> data.' },
        { type: 'mcq', q: 'What is the main reason a Rust production image is so much smaller than a typical Rails image?', options: ['Rust compresses images', 'The final stage contains just one compiled binary: no interpreter, gems, or build tools', 'Docker treats Rust specially', 'Rust apps don\'t need an OS'], answer: 1, explain: 'Everything is compiled ahead of time into a self-contained executable.' },
      ],
      practice: [
        {
          title: 'Write the specs',
          prompt: 'Here is a validation function for our posts. Add two more tests next to the finished one, following its pattern: a <b>blank title</b> gives <code>Err("title can\'t be blank".to_string())</code> and a <b>blank body</b> gives <code>Err("body can\'t be blank".to_string())</code>. There is no <code>fn main</code>, so the Playground runs the <b>tests</b> (you can also pick <i>Test</i> from its menu). When you are done it reports <code>3 passed</code> (the starter already shows <code>1 passed</code>). Every test needs an <code>assert_eq!</code> inside: an empty test passes too, but proves nothing.',
          starter: `pub fn validate(title: &str, body: &str) -> Result<(), String> {
    if title.trim().is_empty() {
        return Err("title can't be blank".to_string());
    }
    if body.trim().is_empty() {
        return Err("body can't be blank".to_string());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // given: one finished test to copy the pattern from
    #[test]
    fn accepts_a_valid_post() {
        assert_eq!(validate("Hello", "World"), Ok(()));
    }

    // TODO 1: a test that a blank title ("   ") gives Err("title can't be blank".to_string())

    // TODO 2: a test that a blank body gives Err("body can't be blank".to_string())
}
`,
          hints: ['Copy the given test and change its name and its arguments. Each test is a <code>#[test] fn</code> inside <code>mod tests</code>.', '<code>assert_eq!(validate("   ", "World"), Err("title can\'t be blank".to_string()));</code>', '<code>#[test] fn rejects_a_blank_title() { assert_eq!(validate("   ", "World"), Err("title can\'t be blank".to_string())); }</code> and the same for the body, e.g. <code>validate("Hello", "")</code>.'],
          solution: `pub fn validate(title: &str, body: &str) -> Result<(), String> {
    if title.trim().is_empty() {
        return Err("title can't be blank".to_string());
    }
    if body.trim().is_empty() {
        return Err("body can't be blank".to_string());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // given: one finished test to copy the pattern from
    #[test]
    fn accepts_a_valid_post() {
        assert_eq!(validate("Hello", "World"), Ok(()));
    }

    #[test]
    fn rejects_a_blank_title() {
        assert_eq!(validate("   ", "World"), Err("title can't be blank".to_string()));
    }

    #[test]
    fn rejects_a_blank_body() {
        assert_eq!(validate("Hello", ""), Err("body can't be blank".to_string()));
    }
}
`,
          explain: 'Each <code>#[test]</code> is an independent function, and <code>cargo test</code> runs them in parallel and reports each one, like RSpec examples. Bonus: delete the blank-title <code>if</code> in <code>validate</code> and run again. Your new test fails, which proves that it really guards that rule.',
        },
      ],
    },
  ],
});
