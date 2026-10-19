#!/bin/sh
# Inside the pinned debian:13 image: build an upstream WPE WebKit release from the
# sha256-pinned wpewebkit.org tarball (upstreams.lock.json webkit.upstream), install
# it to /usr/local/wpe-upstream, then run the host suites against it (container_test.sh, upstream mode).
# /src = repo (ro), /out = evidence, /ccache = persisted compiler cache.
# usage: build.sh <lock key: upstream | upstream.previous_stable>
set -eu
OUT=/out; mkdir -p "$OUT"
KEY=${1:-upstream}
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$OUT/build-steps.log"; }
export DEBIAN_FRONTEND=noninteractive
rm -f /etc/apt/apt.conf.d/docker-clean
sed -i 's/^Types: deb$/Types: deb deb-src/' /etc/apt/sources.list.d/debian.sources
apt-get update >"$OUT/build-apt-update.log" 2>&1
apt-get install -y --no-install-recommends python3 ca-certificates curl xz-utils ccache cmake ninja-build clang lld unifdef >"$OUT/build-apt.log" 2>&1
log "build-dep wpewebkit (Debian 13 source package deps)"
apt-get build-dep -y wpewebkit >>"$OUT/build-apt.log" 2>&1
# Newer releases default-enable features 2.48's build-deps do not cover (2.52: libhyphen).
for pkg in libhyphen-dev libwoff-dev libmanette-0.2-dev libgbm-dev libdrm-dev libinput-dev libudev-dev \
           libxkbcommon-dev libepoxy-dev libsystemd-dev libgudev-1.0-dev libjxl-dev libavif-dev liblcms2-dev \
           libseccomp-dev libgstreamer-plugins-bad1.0-dev libsysprof-capture-4-dev libwebp-dev libopenjp2-7-dev \
           libtasn1-6-dev libgcrypt20-dev libxslt1-dev libsqlite3-dev libharfbuzz-dev libicu-dev libjpeg-dev \
           libegl-dev libgles-dev gperf ruby unifdef libatk1.0-dev libatk-bridge2.0-dev libenchant-2-dev; do
  if apt-get install -y --no-install-recommends "$pkg" >>"$OUT/build-apt.log" 2>&1; then echo "$pkg ok"; else echo "$pkg MISSING"; fi
done >"$OUT/build-extra-deps.txt"
read VERSION URL SHA <<V
$(python3 -I -c 'import json,sys; u=json.load(open(sys.argv[1]))["webkit"]
for k in sys.argv[2].split("."): u=u[k]
print(u["version"], u["url"], u["sha256"])' /src/upstreams.lock.json "$KEY")
V
log "download $URL"
mkdir -p /work && cd /work
curl -fsSL "$URL" -o wpe.tar.xz
echo "$SHA  wpe.tar.xz" | sha256sum -c - | tee -a "$OUT/build-steps.log"
tar -xJf wpe.tar.xz
SRC=/work/wpewebkit-$VERSION
export CCACHE_DIR=/ccache CCACHE_MAXSIZE=6G CCACHE_COMPRESS=1 CCACHE_BASEDIR=/work CCACHE_SLOPPINESS=pch_defines,time_macros,include_file_mtime,include_file_ctime
ccache -z >/dev/null
log "configure $VERSION"
start=$(date +%s)
cmake -S "$SRC" -B /work/build -G Ninja -DPORT=WPE -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local/wpe-upstream \
  -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ -DUSE_LD_LLD=ON \
  -DCMAKE_C_COMPILER_LAUNCHER=ccache -DCMAKE_CXX_COMPILER_LAUNCHER=ccache \
  -DENABLE_DOCUMENTATION=OFF -DENABLE_INTROSPECTION=OFF -DENABLE_MINIBROWSER=OFF -DENABLE_API_TESTS=OFF \
  -DENABLE_WPE_QT_API=OFF -DENABLE_WEBDRIVER=OFF -DUSE_LIBBACKTRACE=OFF -DENABLE_JOURNALD_LOG=OFF \
  -DENABLE_WPE_LEGACY_API=ON -DENABLE_BUBBLEWRAP_SANDBOX=ON >"$OUT/cmake.log" 2>&1 || { tail -60 "$OUT/cmake.log"; exit 1; }
configured=$(date +%s)
log "build (ninja -j$(nproc))"
ninja -C /work/build -j"$(nproc)" >"$OUT/ninja.log" 2>&1 || { tail -80 "$OUT/ninja.log"; status=1; }
built=$(date +%s)
ccache -s >"$OUT/ccache-stats.txt" 2>&1 || true
tail -c 400000 "$OUT/ninja.log" >"$OUT/ninja-tail.log"; rm -f "$OUT/ninja.log"
printf '{"version":"%s","configure_s":%s,"build_s":%s,"nproc":%s,"ok":%s}\n' "$VERSION" $((configured-start)) $((built-configured)) "$(nproc)" "${status:-0}" | sed 's/"ok":0/"ok":true/;s/"ok":1/"ok":false/' >"$OUT/build-time.json"
cat "$OUT/build-time.json"
[ "${status:-0}" = 0 ] || exit 1
ninja -C /work/build install >"$OUT/install.log" 2>&1
log "installed $VERSION to /usr/local/wpe-upstream; running host suites against it"
export AXIOSOZO_WEBKIT_UPSTREAM_PREFIX=/usr/local/wpe-upstream
sh /src/native/webkit-host/ci/container_test.sh
