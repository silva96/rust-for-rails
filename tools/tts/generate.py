# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["kokoro-onnx>=0.4", "soundfile", "onnxruntime"]
# ///
"""Generate neural narration for the course with Kokoro (runs locally, offline).

    node tools/export-narration.js en && uv run tools/tts/generate.py en
    node tools/export-narration.js es && uv run tools/tts/generate.py es

Writes audio/<lang>/<hash>.mp3 for every narrated line plus audio/<lang>/manifest.js
(hash -> duration in seconds). Existing clips are reused; pass --force to redo all,
--prune to delete clips no longer referenced. Models live in tools/tts/models/.
"""
import argparse, hashlib, json, os, re, subprocess, sys, tempfile
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODELS = Path(__file__).resolve().parent / "models"
VOICES = {k: (v["voice"], v["espeak"], v.get("speed", 1.0)) for k, v in json.loads((Path(__file__).resolve().parent / "voices.json").read_text()).items() if not k.startswith("_")}
# Words inside non-English narration that should keep their English pronunciation (Rust, Rails, borrow checker...).
TERMS_FILE = Path(__file__).resolve().parent / "english-terms-{lang}.txt"

_k = None
_tok = None
_terms = set()


def _load_terms(lang):
    f = Path(str(TERMS_FILE).format(lang=lang))
    if lang == "en" or not f.exists():
        return set()
    return {l.strip().lower() for l in f.read_text().splitlines() if l.strip() and not l.startswith("#")}


WORD = re.compile(r"[^\W\d]+(?:[_'][^\W\d]+)*")


PLACEHOLDER = "Kiwiki"  # a nonsense word espeak renders the same way in any context


def english_runs(text):
    """Spans of consecutive English terms ("borrow checker"), as (start, end) pairs."""
    runs = []
    for m in WORD.finditer(text):
        if m.group().lower() not in _terms:
            continue
        if runs and re.fullmatch(r"[\s-]*", text[runs[-1][1]:m.start()]):
            runs[-1][1] = m.end()
        else:
            runs.append([m.start(), m.end()])
    return runs


def english_ph(phrase):
    words = re.sub(r"([a-z])([A-Z])", r"\1 \2", phrase.replace("_", " ").replace("-", " "))  # IntoResponse -> Into Response
    return _tok.phonemize(words, "en-us")


def mixed_phonemes(text, lang):
    """Phonemize `text` in `lang`, but give runs of English terms English phonemes.

    The sentence is phonemized as a whole with each English run swapped for a placeholder,
    so Spanish stress and flow stay natural; then the placeholders are replaced.
    """
    runs = english_runs(text)
    if not runs:
        return _tok.phonemize(text, lang)
    masked, pos = [], 0
    for s0, e0 in runs:
        masked.append(text[pos:s0] + PLACEHOLDER)
        pos = e0
    masked.append(text[pos:])
    ph = _tok.phonemize("".join(masked), lang)
    marker = _tok.phonemize(PLACEHOLDER, lang)
    parts = ph.split(marker)
    if len(parts) != len(runs) + 1:  # espeak merged something: fall back to per-segment phonemization
        out, pos = [], 0
        for s0, e0 in runs:
            if text[pos:s0].strip():
                out.append(_tok.phonemize(text[pos:s0].strip(), lang))
            out.append(english_ph(text[s0:e0]))
            pos = e0
        if text[pos:].strip():
            out.append(_tok.phonemize(text[pos:].strip(), lang))
        return re.sub(r"\s+([,.;:!?])", r"\1", " ".join(out))
    out = parts[0]
    for (s0, e0), rest in zip(runs, parts[1:]):
        out += english_ph(text[s0:e0]) + rest
    return out


def _init(threads, lang):
    global _k, _tok, _terms
    import onnxruntime as ort
    from kokoro_onnx import Kokoro
    from kokoro_onnx.tokenizer import Tokenizer
    _tok, _terms = Tokenizer(), _load_terms(lang)
    so = ort.SessionOptions()
    so.intra_op_num_threads = threads
    sess = ort.InferenceSession(str(MODELS / "kokoro-v1.0.onnx"), so, providers=["CPUExecutionProvider"])
    _k = Kokoro.from_session(sess, str(MODELS / "voices-v1.0.bin"))


def _render(job):
    import soundfile as sf
    key, text, out, voice, lang, speed = job
    if _terms:
        samples, sr = _k.create(mixed_phonemes(text, lang), voice=voice, lang=lang, speed=speed, is_phonemes=True)
    else:
        samples, sr = _k.create(text, voice=voice, lang=lang, speed=speed)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sf.write(tmp.name, samples, sr)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-b:a", "64k", out], check=True)
        os.unlink(tmp.name)
    return key, round(len(samples) / sr, 3)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lang", choices=sorted(VOICES), help="a language configured in tools/tts/voices.json")
    ap.add_argument("--voice", help="override voice (e.g. am_michael, em_alex)")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--prune", action="store_true")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--show", metavar="TEXT", help="print the mixed phonemes for TEXT and exit")
    ap.add_argument("--list-voices", action="store_true", help="print every voice in the Kokoro model and exit")
    a = ap.parse_args()

    if a.list_voices:
        from kokoro_onnx import Kokoro
        print(" ".join(sorted(Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin")).get_voices())))
        return
    voice, lang, speed = VOICES[a.lang]
    if a.show:
        global _tok, _terms
        from kokoro_onnx.tokenizer import Tokenizer
        _tok, _terms = Tokenizer(), _load_terms(a.lang)
        print(mixed_phonemes(a.show, lang) if _terms else _tok.phonemize(a.show, lang))
        return
    voice = a.voice or voice
    lines = json.loads((ROOT / "tools" / "tts" / f"narration-{a.lang}.json").read_text())
    outdir = ROOT / "audio" / a.lang
    outdir.mkdir(parents=True, exist_ok=True)
    man_path = outdir / "manifest.json"
    manifest = {} if a.force or not man_path.exists() else json.loads(man_path.read_text())
    # regenerate everything when the voice, the espeak language or the English-terms list changes
    sig = hashlib.sha1("\n".join([voice, lang, str(speed)] + sorted(_load_terms(a.lang))).encode()).hexdigest()[:12]
    if manifest.get("_sig") != sig:
        manifest = {}
    manifest["_sig"] = sig

    todo = [(l["key"], l["text"], str(outdir / f"{l['key']}.mp3"), voice, lang, speed)
            for l in lines if l["key"] not in manifest or not (outdir / f"{l['key']}.mp3").exists()]
    print(f"{a.lang}/{voice}: {len(lines)} lines, {len(todo)} to render", flush=True)
    if todo:
        threads = max(1, (os.cpu_count() or 4) // a.workers)
        with ProcessPoolExecutor(a.workers, initializer=_init, initargs=(threads, a.lang)) as ex:
            futs = [ex.submit(_render, j) for j in todo]
            for i, f in enumerate(as_completed(futs), 1):
                key, dur = f.result()
                manifest[key] = dur
                if i % 25 == 0 or i == len(todo):
                    print(f"  {i}/{len(todo)}", flush=True)
                    man_path.write_text(json.dumps(manifest))

    keys = {l["key"] for l in lines}
    if a.prune:
        for p in outdir.glob("*.mp3"):
            if p.stem not in keys:
                p.unlink()
        manifest = {k: v for k, v in manifest.items() if k in keys or k.startswith("_")}
    man_path.write_text(json.dumps(manifest))
    live = {k: v for k, v in manifest.items() if k in keys}
    (outdir / "manifest.js").write_text(
        "// generated by tools/tts/generate.py: narration clip durations (seconds) keyed by text hash\n"
        f"(window.AUDIO_MANIFEST = window.AUDIO_MANIFEST || {{}})[{json.dumps(a.lang)}] = {json.dumps(live, separators=(',', ':'))};\n")
    total = sum(live.values())
    print(f"done: {len(live)} clips, {total / 60:.1f} min of narration -> {outdir.relative_to(ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
