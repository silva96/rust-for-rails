#!/usr/bin/env sh
# Builds dist/site (a static site, ready for Cloudflare Pages / any static host) and dist/rust-for-rails-devs.zip.
# Cloudflare Pages: dashboard → Workers & Pages → Create → Pages → "Upload assets" → drop the zip.
set -eu
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist/site
cp index.html dist/site/
cp -r css js content dist/site/
for d in audio/*/; do
  lang=$(basename "$d")
  mkdir -p "dist/site/audio/$lang"
  cp "$d"manifest.js "$d"*.mp3 "dist/site/audio/$lang/"
done
# Narration clips are named by a hash of their text, so they never change: cache them for a year.
cat > dist/site/_headers <<'H'
/audio/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
H
# Cloudflare Pages limits: 20,000 files, 25 MiB per file.
files=$(find dist/site -type f | wc -l)
big=$(find dist/site -type f -size +25M | wc -l)
[ "$files" -le 20000 ] && [ "$big" -eq 0 ] || { echo "exceeds Cloudflare Pages limits ($files files, $big over 25 MiB)"; exit 1; }
(cd dist/site && zip -qr -9 ../rust-for-rails-devs.zip .)
echo "dist/site: $files files, $(du -sh dist/site | cut -f1)  →  dist/rust-for-rails-devs.zip ($(du -h dist/rust-for-rails-devs.zip | cut -f1))"
