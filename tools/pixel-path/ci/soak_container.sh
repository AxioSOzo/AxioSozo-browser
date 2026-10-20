#!/bin/sh
# Pixel-path soak + multi-tab measurement in the pinned debian:13 image (.github/workflows/linux-perf.yml,
# job `soak`). /src = this checkout (read-only), /artifact = the Linux Zen app artifact, /out = evidence.
# Same environment as zen_ab_webkit_container.sh (pinned WPE packages, unprivileged user, WebKit's
# bubblewrap sandbox on) plus the pinned CEF host built in the same build root (as
# scripts/webkit_zen_container.sh CEF=1), so one Zen window has a WebKit and a Chromium tab.
# Then tools/pixel-path/soak.py as that user, once per entry of $SOAKS ("label:minutes:transport").
# WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS is never set; Chromium's namespace sandbox stays on.
set -eu
OUT=/out
mkdir -p "$OUT"
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$OUT/container.log"; }
export DEBIAN_FRONTEND=noninteractive
rm -f /etc/apt/apt.conf.d/docker-clean
log "apt bootstrap"
apt-get update >"$OUT/apt-update.log" 2>&1
apt-get install -y --no-install-recommends python3 ca-certificates procps xz-utils git >"$OUT/apt-bootstrap.log" 2>&1
useradd -m -u 1500 axio
chown axio:axio "$OUT"
cp -a /src /home/axio/cand
chown -R axio:axio /home/axio/cand
REPO=/home/axio/cand
export AXIOSOZO_BUILD_ROOT=/home/axio/build
install -d -m 0700 -o axio -g axio "$AXIOSOZO_BUILD_ROOT"
P="python3 -I $REPO/native/webkit-host/probe.py"
log "pinned WPE packages (probe.py setup --apt)"
if ! $P setup --apt >"$OUT/webkit-setup.log" 2>&1; then
  STAMP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["webkit"]["debian"]["snapshot"])' "$REPO/upstreams.lock.json")
  log "retrying from snapshot.debian.org/archive/debian/$STAMP"
  cat >/etc/apt/sources.list.d/debian.sources <<SRC
Types: deb
URIs: https://snapshot.debian.org/archive/debian/$STAMP
Suites: trixie trixie-updates
Components: main
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
Check-Valid-Until: no

Types: deb
URIs: https://snapshot.debian.org/archive/debian-security/$STAMP
Suites: trixie-security
Components: main
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
Check-Valid-Until: no
SRC
  $P setup --apt >"$OUT/webkit-setup-snapshot.log" 2>&1 || { log "WebKit setup FAILED"; tail -40 "$OUT/webkit-setup-snapshot.log"; exit 1; }
fi
log "Zen runtime + GUI packages, CEF build/runtime packages"
# shellcheck disable=SC2046
apt-get install -y --no-install-recommends bash $(python3 "$REPO/scripts/linux_packages.py" gui) >"$OUT/apt-gui.log" 2>&1
apt-get install -y --no-install-recommends cmake ninja-build g++ zlib1g-dev bzip2 curl openssl \
  libnss3 libnspr4 libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 libcups2t64 libdrm2 libgbm1 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libxshmfence1 libasound2t64 \
  fonts-liberation >"$OUT/apt-cef.log" 2>&1 || log "CEF apt packages FAILED (see apt-cef.log)"
chown -R axio:axio "$AXIOSOZO_BUILD_ROOT"
dpkg-query -W -f='${Package}\t${Version}\n' | grep -E 'wpe|webkit|mesa|bubblewrap|xvfb|libnss3' | sort >"$OUT/dpkg-engine.tsv"
as_axio() { setpriv --reuid=axio --regid=axio --init-groups --reset-env -- env HOME=/home/axio \
  PATH=/usr/bin:/bin AXIOSOZO_BUILD_ROOT="$AXIOSOZO_BUILD_ROOT" LANG=C.UTF-8 "$@"; }
as_axio git config --global --add safe.directory '*'
log "CEF host (probe.py setup, pinned + sha256-checked)"
as_axio python3 "$REPO/native/chromium-host/probe.py" setup >"$OUT/cef-setup.log" 2>&1 || log "cef setup exit $? (the Chromium tab will be BLOCKED_ENV)"
as_axio python3 "$REPO/native/chromium-host/probe.py" check >"$OUT/cef-check.log" 2>&1 || log "cef check exit $?"
as_axio $P check >"$OUT/webkit-check.log" 2>&1 || log "webkit check exit $?"
log "unpack the Linux Zen app"
as_axio python3 "$REPO/scripts/linux_build.py" fetch-build --from-dir /artifact --run "${ZEN_RUN_ID:-artifact}" >"$OUT/fetch-build.log" 2>&1 \
  || { log "fetch-build FAILED"; cat "$OUT/fetch-build.log"; exit 1; }
APP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["directory"])' "$AXIOSOZO_BUILD_ROOT/linux-app/current.json")
log "TEST-ONLY chrome overlay of the prebuilt app"
as_axio python3 "$REPO/scripts/webkit_package.py" overlay-chrome --app "$APP" --out "$OUT/chrome-overlay.json" >"$OUT/overlay.log" 2>&1 \
  || { log "overlay FAILED"; cat "$OUT/overlay.log"; exit 1; }
status=0
for spec in ${SOAKS:-"memfd:10:memfd pipe:4:pipe"}; do
  label=${spec%%:*}; rest=${spec#*:}; minutes=${rest%%:*}; transport=${rest#*:}
  extra=""; [ "$transport" = memfd ] && extra="--pref axiosozo.engines.linux.memfd_frames=true"
  [ "$transport" = pipe ] && extra="--pref axiosozo.engines.linux.memfd_frames=false"
  install -d -o axio -g axio "$OUT/$label"
  log "soak $label: $minutes min, transport $transport ${SCALE:+at ${SCALE}x}"
  scale=""; [ -n "${SCALE:-}" ] && [ "${SCALE}" != 1 ] && scale="--device-scale $SCALE --size 2304x1440"
  # shellcheck disable=SC2086
  as_axio timeout -k 10 $(( minutes * 60 + 900 )) python3 "$REPO/tools/pixel-path/soak.py" --app fetched --out "$OUT/$label" \
    --label "$label" --minutes "$minutes" --expect-transport "$transport" --chrome-overlay "$OUT/chrome-overlay.json" \
    $extra $scale >"$OUT/$label/soak.log" 2>&1 || status=1
  tail -n 3 "$OUT/$label/soak.log" | tee -a "$OUT/container.log"
  cat "$OUT/$label/soak-$label.md" 2>/dev/null | tee -a "$OUT/container.log" || true
done
ps -eo pid,ppid,user,comm,args >"$OUT/ps-after.txt"
chmod -R a+rX "$OUT"
exit "$status"
