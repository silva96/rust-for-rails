# 🦀 Rust for Rails Devs: an interactive motion course

A self-contained, offline-capable course that teaches Rust to Ruby on Rails developers through
animated "video" lessons you can pause, scrub and jump around in, plus checkpoints, quizzes,
summaries and hands-on exercises.

[![Donate with PayPal](https://img.shields.io/badge/%E2%99%A5%20Donate-PayPal-e0245e?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=8BKEMESVG3XS2)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Enjoying the course?** It is free and open source. If it helped you,
> [a donation](https://www.paypal.com/donate/?hosted_button_id=8BKEMESVG3XS2) helps keep it going.

## Open it

There is no build step and there are no dependencies. Open `index.html` in a browser:

```sh
xdg-open index.html            # Linux
open index.html                # macOS
# or serve it, if you prefer:
python3 -m http.server 8000    # then visit http://localhost:8000
```

## Deploy (Cloudflare Pages or any static host)

The site is plain static files. To build a clean bundle without the tools and model files:

```sh
tools/build-dist.sh     # → dist/site/ and dist/rust-for-rails-devs.zip
```

On Cloudflare Pages, go to **Workers & Pages → Create → Pages → Upload assets** and drop in the zip.
To use the CLI instead, run `npx wrangler pages deploy dist/site --project-name rust-for-rails-devs`.
The bundle includes a `_headers` file that caches the narration clips for a year. Their file names are hashes of
their text, so a changed line always gets a new URL.

## Languages

The whole course is available in **English** and **Spanish**. That covers the UI, every lesson, the narration,
quizzes, summaries and practice. Switch with the language selector in the top-right corner. Your choice is remembered,
and it defaults to your browser's language. Progress is shared between languages.
Want to add another language? See [Adding a language](#adding-a-language).

## What's inside

| Module | Lessons |
| --- | --- |
| 1. Foundations | Why Rust · Cargo vs Bundler/Rake · Variables, mutability & types |
| 2. Ownership & Borrowing | Ownership & moves · Borrowing & references · Lifetimes, Rc & RefCell |
| 3. Modeling Data | Structs & impl · Enums & pattern matching · Traits & generics |
| 4. Errors, Strings & Collections | Result & `?` · String vs &str · Collections & iterators |
| 5. Building a Web API | Async & Tokio · Axum routing · SQLx database · Testing & shipping |

Every lesson has:

- **Motion video**: animated scenes with typewriter code, Ruby ↔ Rust side-by-side comparisons, animated
  memory diagrams, highlights and sticky notes. Play/pause, seek, chapters, speed (0.75–2×),
  captions, a **neural narrator voice** and fullscreen. Speed changes scale the animation and the voice together.
- **In-video checkpoints**: the video pauses until you answer.
- **Recap scene, summary tab, Rails → Rust mapping, gotchas, and a cheat snippet.**
- **Quiz** with multiple choice, "does it compile?", fill-in-the-blank, ordering and matching questions.
- **Practice**: an editor with syntax highlighting, hints and solutions, and a one-click **Run in Rust Playground**.
- **Transcript**: click any line to jump to that moment.
- **Chapters**: jump straight to any scene.

There's also a searchable **Rails → Rust Rosetta Stone** built from every lesson.

## Progress

Progress is saved automatically in `localStorage` under keys prefixed with `r4r-`. That covers
watched lessons, the resume position in each video, best quiz scores, checkpoint answers, XP,
practice code and player settings. Use "Reset progress" on the home page to start over.

## Keyboard shortcuts

`Space`/`K` play/pause · `←`/`→` ±5s · `J`/`L` ±10s · `N`/`P` next/prev scene · `0–9` jump ·
`C` captions · `V` narrator · `F` fullscreen · `/` search lessons

## Narration (neural TTS)

Narration is pre-generated with [Kokoro](https://github.com/thewh1teagle/kokoro-onnx), a small neural TTS
model that runs locally on the CPU. The output is one MP3 per narrated line in `audio/<lang>/`, plus a `manifest.js`
of clip durations. Each beat lasts as long as its clip, and the audio drives the video clock while it plays,
so the voice and the visuals stay in sync through pausing, seeking and speed changes. If a clip is missing,
the player falls back to the browser's built-in speech.

After editing narration, regenerate it. This needs `uv` and `ffmpeg`. Only changed lines are re-rendered:

```sh
# one-time: download the model (~350 MB) into tools/tts/models/
curl -L -o tools/tts/models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o tools/tts/models/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

node tools/export-narration.js en && uv run tools/tts/generate.py en --prune
node tools/export-narration.js es && uv run tools/tts/generate.py es --prune
# other voices: --voice am_michael | bm_george | em_alex | ...
```

The defaults are `af_heart` for English and `ef_dora` for Spanish. Spanish uses Latin-American pronunciation (espeak `es-419`).
A full language takes about 2–3 minutes on a 32-core CPU.

**English terms inside Spanish narration.** Words like *Rust*, *Rails*, *borrow checker*, *garbage collector*,
*crate* or *IntoResponse* are pronounced the English way, as a Spanish-speaking dev would say them. Each sentence is
phonemized in Spanish with English terms masked out, then the English phonemes are spliced back in. The list lives in
`tools/tts/english-terms-es.txt`. Edit it and re-run `uv run tools/tts/generate.py es`, and every clip is
regenerated automatically. To preview a sentence's phonemes: `uv run tools/tts/generate.py es --show "Rust usa el borrow checker"`.

## Authoring

Lessons are plain data in `content/*.js`. The format is documented at the top of
`content/m1-foundations.js`. A scene is a list of **beats**. Each beat has narration (`say`) and the
things that happen while it plays: `show`, `type`, `lines`, `hl`, `cls` and `note`. Beat durations come
from the narration length, and every frame is a pure function of time, so seeking is always exact.

```
index.html
css/app.css          styles + motion
js/highlight.js      tiny Rust/Ruby/TOML/SQL/shell highlighter
js/player.js         the seekable scene/beat "video" engine
js/quiz.js           quiz + practice widgets
js/app.js            routing, table of contents, progress, lesson pages, glossary
content/*.js         course content, English (one file per module)
content/es/*.js      Spanish translation, mirroring the English structure exactly
js/i18n.js           UI strings (en/es)
audio/<lang>/        generated narration clips + manifest.js
tools/               export-narration.js, check-i18n.js (translation parity), tts/generate.py
```

To check that a translation still lines up with the English structure (scenes, beats, keys, code line counts,
quiz answers), run `node tools/check-i18n.js es`.

## Adding a language

Contributions of new languages are very welcome. A language has three layers, and only the first is required to get
started. Anything you don't translate yet falls back to English automatically:

| Layer | Files | Required? |
| --- | --- | --- |
| 1. Interface strings | `js/lang/<code>.js` | yes |
| 2. Course content | `content/<code>/*.js` | recommended (per module; untranslated modules show in English) |
| 3. Narration audio | `audio/<code>/` (generated) | optional (without it, the browser's built-in voice reads the captions) |

Use a short lowercase code such as `fr`, `pt`, `de` or `it`. The code becomes part of a JavaScript identifier
(`COURSE_FR`), so keep it to letters only. Regional variants are handled by the `speech` and `espeak` settings below,
not by the code. The steps below use French (`fr`) as the example.

### 1. Interface strings

```sh
cp js/lang/en.js js/lang/fr.js
```

In `js/lang/fr.js`:

- Change the first line to `I18N.register('fr', { name: 'Français', speech: 'fr-FR' }, {`.
  - `name` is shown in the language selector.
  - `speech` is the [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag) tag used to pick a browser voice when no recorded narration exists.
- Translate the values only. Never change the keys.
- Keep `{placeholders}` such as `{n}` or `{t}` as they are.
- Keep the HTML inside strings, such as `<b class="best">` or `<u>`.
- Arrays like `how` and `keys` must keep their shape.

Then register the file in `index.html`, next to the others:

```html
<script src="js/lang/fr.js"></script>
```

The new language now appears in the selector.

### 2. Course content

Create `content/fr/course.js`:

```js
window.COURSE_FR = {
  title: 'Rust pour les devs Rails',
  tagline: '…',
  modules: [],
};
```

Then translate each module. Start from the English file, because it's the source of truth:

```sh
cp content/m1-foundations.js content/fr/m1-foundations.js
```

In the copy, change `COURSE.modules.push(` to `COURSE_FR.modules.push(`, delete the big format comment at the top,
and translate.

**Translate:**
- `title`, `subtitle`, `kicker`, `blurb`
- every `say` (narration, which is also the caption)
- `html`, bullet/card/table text, `note`, diagram `label`/`sub` text
- checkpoint and quiz `q` / `options` / `explain` / `pairs`
- summaries
- practice `title` / `prompt` / `hints` / `explain`
- comments and harmless printed strings inside code

**Never change:**
- `id`s, `order`, `layout`, `type`/`kind`, `side`
- the number and order of scenes, beats and blocks
- the keys in `show`, `type`, `lines`, `hl` and `cls`
- quiz `answer` indexes and fill-in `answers`
- identifiers or syntax in code
- **the number of lines in any code block**, because `lines` highlights point at line numbers
- diagram geometry

**Narration (`say`) is read aloud**, so write it to be spoken. Spell out symbols as words: "ampersand mut self",
"Cargo dot toml" (in your language), "i sixty-four". Keep sentences about as long as the English ones.

Register the files in `index.html` after the English content:

```html
<script src="content/fr/course.js"></script>
<script src="content/fr/m1-foundations.js"></script>
<!-- … one per translated module -->
```

Then check your work:

```sh
node tools/check-i18n.js fr        # structure must mirror English: prints "OK: fr mirrors English"
node tools/check-i18n.js fr m1     # or one module at a time (modules you haven't translated yet are reported as missing)

# layout: nothing may overflow the stage or run into the captions (translations are often longer)
npm i --no-save playwright-core
node tools/audit-layout.js fr      # set CHROME=/path/to/chrome if needed
```

### 3. Narration audio (optional)

Narration uses [Kokoro](https://github.com/thewh1teagle/kokoro-onnx). Check that Kokoro has a voice for your
language. Its voice ids start with a language letter:

| Prefix | Language | Examples |
| --- | --- | --- |
| `a`, `b` | English (US, UK) | `af_heart`, `am_michael`, `bf_emma`, `bm_george` |
| `e` | Spanish | `ef_dora`, `em_alex` |
| `f` | French | `ff_siwis` |
| `i` | Italian | `if_sara`, `im_nicola` |
| `p` | Portuguese (Brazil) | `pf_dora`, `pm_alex` |
| `h` | Hindi | `hf_alpha`, `hm_omega` |
| `j` | Japanese | `jf_alpha`, `jm_kumo` |
| `z` | Mandarin | `zf_xiaobei`, `zm_yunxi` |

`uv run tools/tts/generate.py en --list-voices` prints every voice in the model. Quality varies by voice, so listen before you commit.

1. Add your language to `tools/tts/voices.json`:
   ```json
   "fr": { "voice": "ff_siwis", "espeak": "fr-fr", "speed": 1.0 }
   ```
   `espeak` is the [espeak-ng language](https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md) used to
   turn text into phonemes. Pick the variant you want spoken, e.g. `es-419` (Latin American) vs `es` (Spain), or
   `pt-br` vs `pt`.
2. Optional, but it makes a big difference: create `tools/tts/english-terms-fr.txt` with the English words that
   should keep their English pronunciation inside your narration (Rust, Rails, borrow checker, crate…). Copy
   `english-terms-es.txt` as a starting point and remove anything that is a normal word in your language.
   To preview the phonemes for a sentence:
   `uv run tools/tts/generate.py fr --show "Rust utilise le borrow checker"`.
3. Download the model once (see [Narration](#narration-neural-tts)) and generate:
   ```sh
   node tools/export-narration.js fr && uv run tools/tts/generate.py fr
   ```
4. Register the manifest in `index.html`:
   ```html
   <script src="audio/fr/manifest.js"></script>
   ```

If Kokoro has no voice for your language, skip this layer. The course still works: captions are shown and the
browser's own voice for your `speech` tag reads them.

### Keeping translations in sync

When the English content changes, `node tools/check-i18n.js <code>` points to every place where the structure has
diverged. Changed narration only needs `export-narration.js` + `generate.py` again, and only lines whose text changed
are re-rendered.

Please open one pull request per language. Mention which modules are translated, and whether you listened to the
generated narration.

## Support

[![Donate with PayPal](https://img.shields.io/badge/%E2%99%A5%20Donate-PayPal-e0245e?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=8BKEMESVG3XS2)

The course is free and open source. If it helped you, a donation helps keep it going. In the app, the donate
button is always visible (top bar and sidebar), and the course also asks once you finish a module and when you
finish the whole course.

## License

[MIT](LICENSE). That covers the code and the course content, including translations you contribute.
The narration audio in `audio/` was generated with [Kokoro](https://github.com/hexgrad/kokoro) (Apache-2.0).
The model files are downloaded separately and are not part of this repository.
