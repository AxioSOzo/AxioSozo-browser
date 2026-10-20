#!/bin/sh
# TEMPORARY (cloud/webkit-feel): dump the pinned WPE WebKit API (headers, GIR signal signatures).
set -e
apt-get update >/dev/null
apt-get install -y --no-install-recommends python3 libwpewebkit-2.0-dev libwpe-1.0-dev libwpebackend-fdo-1.0-dev gir1.2-wpewebkit-2.0 >/out/apt.log 2>&1 || \
  apt-get install -y --no-install-recommends python3 libwpewebkit-2.0-dev libwpe-1.0-dev libwpebackend-fdo-1.0-dev >>/out/apt.log 2>&1 || true
dpkg -l | grep -i wpe > /out/versions.txt || true
ls -R /usr/include/wpe-webkit-2.0 > /out/headers-list.txt 2>&1 || true
for p in $(find /usr/include/wpe-webkit-2.0 -name '*.h' | sort); do echo "==== $p"; grep -v '^ \*\|^/\*\*\|^$\|^ \*/' "$p"; done > /out/headers.txt
cp /usr/include/wpe-1.0/wpe/input.h /out/libwpe-input.h 2>/dev/null || true
find / -name '*.gir' 2>/dev/null > /out/girs.txt || true
g=$(grep -i 'WPEWebKit' /out/girs.txt | head -1)
[ -n "$g" ] && python3 /src/native/webkit-host/ci/api_signals.py "$g" > /out/signals.txt || echo "no gir" > /out/signals.txt
