#!/bin/sh
# In-Zen WebKit profile in the pinned debian:13 image (.github/workflows/linux-engine-profile.yml,
# job profile-webkit). Copy of tools/engine-bench/ci/zen_webkit_container.sh (owned by engine-bench;
# not modified) whose last steps run tools/engine-bench/profile/zen_profile.py instead of zen_bench.py. /src = read-only checkout, /artifact = the downloaded Linux Zen app artifact
# (axiosozo-zen-linux-x86_64), /out = evidence.
#
# Same environment as scripts/webkit_zen_container.sh (owned by webkit-zen; not modified): the
# WPE host links the pinned Debian 13 packages, so the Ubuntu-built Zen app runs next to it here
# (Debian 13's glibc 2.41 runs it). Steps: pinned WPE packages + host build, Zen runtime/GUI
# packages, unprivileged user: unpack the app, TEST-ONLY chrome overlay of this checkout's
# apps/browser/chrome (scripts/webkit_package.py, labelled `chrome-overlay` in the evidence),
# then tools/engine-bench/profile/zen_profile.py --engine webkit (and --engine gecko in the same
# container, so Gecko and WebKit tabs are compared on one machine and OS), then report.py process.
# WebKit's bubblewrap sandbox stays on; WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS is never set.
set -eu
OUT=/out
PASSES=${PROFILE_PASSES:-plain,trace,profile}
mkdir -p "$OUT"
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$OUT/steps.log"; }
export DEBIAN_FRONTEND=noninteractive
rm -f /etc/apt/apt.conf.d/docker-clean
log "apt bootstrap"
apt-get update >"$OUT/apt-update.log" 2>&1
apt-get install -y --no-install-recommends python3 ca-certificates procps xz-utils git binutils libc6-dbg >"$OUT/apt-bootstrap.log" 2>&1

useradd -m -u 1500 axio
chown axio:axio "$OUT"   # the unprivileged steps write the overlay report and bench results here
cp -a /src /home/axio/repo
chown -R axio:axio /home/axio/repo
REPO=/home/axio/repo
export AXIOSOZO_BUILD_ROOT=/home/axio/build
install -d -m 0700 -o axio -g axio "$AXIOSOZO_BUILD_ROOT"
git config --global --add safe.directory "$REPO"

log "WPE host: pinned Debian 13 packages + build (probe.py setup --apt)"
P="python3 -I $REPO/native/webkit-host/probe.py"
if ! $P setup --apt >"$OUT/webkit-setup.log" 2>&1; then
  STAMP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["webkit"]["debian"]["snapshot"])' "$REPO/upstreams.lock.json")
  log "pinned versions not on deb.debian.org; retrying from snapshot.debian.org/archive/debian/$STAMP"
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
  $P setup --apt >"$OUT/webkit-setup-snapshot.log" 2>&1 || { log "WebKit host setup FAILED"; tail -40 "$OUT/webkit-setup-snapshot.log"; exit 1; }
fi
cp "$AXIOSOZO_BUILD_ROOT/webkit/build.json" "$OUT/webkit-build.json" 2>/dev/null || true

log "Zen runtime libraries + GUI harness tools (scripts/linux_packages.py gui)"
# shellcheck disable=SC2046
apt-get install -y --no-install-recommends $(python3 "$REPO/scripts/linux_packages.py" gui) >"$OUT/apt-gui.log" 2>&1
chown -R axio:axio "$AXIOSOZO_BUILD_ROOT" "$REPO"
dpkg-query -W -f='${Package}\t${Version}\n' | grep -E 'wpe|webkit|mesa|bubblewrap|xvfb' | sort >"$OUT/dpkg-engine.tsv"

as_axio() { setpriv --reuid=axio --regid=axio --init-groups --reset-env -- env HOME=/home/axio \
  PATH=/usr/bin:/bin AXIOSOZO_BUILD_ROOT="$AXIOSOZO_BUILD_ROOT" LANG=C.UTF-8 "$@"; }

status=0
as_axio $P check >"$OUT/webkit-check.log" 2>&1 || status=$?
log "webkit check exit $status"

log "unpack the Linux Zen app"
as_axio python3 "$REPO/scripts/linux_build.py" fetch-build --from-dir /artifact --run "${ZEN_RUN_ID:-artifact}" >"$OUT/fetch-build.log" 2>&1 \
  || { log "fetch-build FAILED"; cat "$OUT/fetch-build.log"; exit 1; }
APP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["directory"])' "$AXIOSOZO_BUILD_ROOT/linux-app/current.json")
log "TEST-ONLY chrome overlay of the prebuilt app (scripts/webkit_package.py)"
as_axio python3 "$REPO/scripts/webkit_package.py" overlay-chrome --app "$APP" --out "$OUT/chrome-overlay.json" >"$OUT/chrome-overlay.log" 2>&1 \
  || { log "overlay FAILED"; cat "$OUT/chrome-overlay.log"; exit 1; }

install -d -o axio -g axio "$OUT/webkit" "$OUT/gecko-debian"
wstatus=0
log "zen_profile --engine webkit ($PASSES)"
as_axio timeout -k 10 2400 python3 "$REPO/tools/engine-bench/profile/zen_profile.py" --engine webkit --app fetched --chrome-overlay "$OUT/chrome-overlay.json" \
  --out "$OUT/webkit" --passes "$PASSES" >"$OUT/zen-profile-webkit.log" 2>&1 || wstatus=$?
log "webkit profile exit $wstatus"
tail -n 15 "$OUT/zen-profile-webkit.log"
gstatus=0
log "zen_profile --engine gecko in the same container ($PASSES)"
as_axio timeout -k 10 1800 python3 "$REPO/tools/engine-bench/profile/zen_profile.py" --engine gecko --label gecko-debian --app fetched --chrome-overlay "$OUT/chrome-overlay.json" \
  --out "$OUT/gecko-debian" --passes "$PASSES" >"$OUT/zen-profile-gecko-debian.log" 2>&1 || gstatus=$?
log "gecko (debian) profile exit $gstatus"
log "summarize profiles (report.py process)"
as_axio python3 "$REPO/tools/engine-bench/profile/report.py" process "$OUT/webkit" >>"$OUT/steps.log" 2>&1 || log "report webkit FAILED"
as_axio python3 "$REPO/tools/engine-bench/profile/report.py" process "$OUT/gecko-debian" >>"$OUT/steps.log" 2>&1 || log "report gecko-debian FAILED"
ps -eo pid,ppid,user,comm,args >"$OUT/ps-after.txt"
chmod -R a+rX "$OUT"
exit "$wstatus"
