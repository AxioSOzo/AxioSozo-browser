#!/bin/sh
# Pin discovery for an upstream WPE WebKit release: reads only the official
# wpewebkit.org release index and checksum files (no tarball). Output feeds the
# `webkit.upstream` entry of upstreams.lock.json, which build.sh then enforces.
set -eu
OUT=${1:?out dir}
mkdir -p "$OUT"
curl -fsSL https://wpewebkit.org/releases/ -o "$OUT/releases-index.html"
# Stable series have an even minor version.
grep -oE 'wpewebkit-2\.[0-9]+\.[0-9]+\.tar\.xz' "$OUT/releases-index.html" | sort -u -V > "$OUT/tarballs.txt"
awk -F'[-.]' '$3 % 2 == 0' "$OUT/tarballs.txt" | tail -n 3 > "$OUT/stable-latest.txt"
for t in $(cat "$OUT/stable-latest.txt") libwpe-1.16.2.tar.xz wpebackend-fdo-1.16.0.tar.xz; do
  for ext in sums asc; do
    curl -fsSL "https://wpewebkit.org/releases/$t.$ext" -o "$OUT/$t.$ext" || rm -f "$OUT/$t.$ext"
  done
  curl -fsSIL "https://wpewebkit.org/releases/$t" | grep -iE '^(content-length|last-modified):' > "$OUT/$t.headers" || true
done
grep -oE '(libwpe|wpebackend-fdo)-[0-9.]+\.tar\.xz' "$OUT/releases-index.html" | sort -u -V | tail -n 6 > "$OUT/libs.txt"
ls -la "$OUT"
