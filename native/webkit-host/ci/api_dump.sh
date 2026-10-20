#!/bin/sh
# TEMPORARY (cloud/webkit-feel): quick compile check of host_wpe.cpp against the pinned
# Debian 13 WPE -dev packages (the cloud session cannot reach Debian). Evidence only.
set -e
apt-get update >/dev/null
apt-get install -y --no-install-recommends python3 g++ pkg-config libwpewebkit-2.0-dev libwpe-1.0-dev libwpebackend-fdo-1.0-dev libwayland-dev >/out/apt.log 2>&1
dpkg -l | grep -i wpe > /out/versions.txt || true
cd /src/native/webkit-host
set +e
g++ -std=c++20 -O1 -Wall -Wextra -fsyntax-only host_wpe.cpp $(pkg-config --cflags wpe-webkit-2.0 wpebackend-fdo-1.0 wayland-server) > /out/compile.log 2>&1
code=$?
echo "{\"compile_exit\": $code}" > /out/compile.json
cat /out/compile.json
[ "$code" = 0 ] || { tail -40 /out/compile.log; exit 1; }
