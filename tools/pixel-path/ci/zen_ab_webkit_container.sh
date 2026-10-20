#!/bin/sh
# WebKit-tab A/B of the pixel path in the pinned debian:13 image (.github/workflows/linux-perf.yml).
# /src = candidate checkout (read-only), /base = cloud/integration worktree (read-only),
# /artifact = the Linux Zen app artifact, /out = evidence. Same environment and setup as
# tools/engine-bench/ci/zen_webkit_container.sh (pinned WPE packages, unprivileged user, WebKit's
# bubblewrap sandbox on; WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS is never set), then
# tools/pixel-path/ci/zen_ab.sh webkit as that user.
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
cp -a /src /home/axio/cand; cp -a /base /home/axio/base
chown -R axio:axio /home/axio/cand /home/axio/base
export AXIOSOZO_BUILD_ROOT=/home/axio/build
install -d -m 0700 -o axio -g axio "$AXIOSOZO_BUILD_ROOT"
P="python3 -I /home/axio/cand/native/webkit-host/probe.py"
log "pinned WPE packages (probe.py setup --apt)"
if ! $P setup --apt >"$OUT/webkit-setup.log" 2>&1; then
  STAMP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["webkit"]["debian"]["snapshot"])' /home/axio/cand/upstreams.lock.json)
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
log "Zen runtime + GUI packages"
# shellcheck disable=SC2046
apt-get install -y --no-install-recommends bash $(python3 /home/axio/cand/scripts/linux_packages.py gui) >"$OUT/apt-gui.log" 2>&1
chown -R axio:axio "$AXIOSOZO_BUILD_ROOT"
dpkg-query -W -f='${Package}\t${Version}\n' | grep -E 'wpe|webkit|mesa|bubblewrap|xvfb' | sort >"$OUT/dpkg-engine.tsv"
as_axio() { setpriv --reuid=axio --regid=axio --init-groups --reset-env -- env HOME=/home/axio \
  PATH=/usr/bin:/bin AXIOSOZO_BUILD_ROOT="$AXIOSOZO_BUILD_ROOT" LANG=C.UTF-8 REPS="${REPS:-3}" ROUNDS="${ROUNDS:-2}" \
  SCALES="${SCALES:-1 2}" SUDO= "$@"; }
as_axio git config --global --add safe.directory '*'
log "unpack the Linux Zen app"
as_axio python3 /home/axio/cand/scripts/linux_build.py fetch-build --from-dir /artifact --run "${ZEN_RUN_ID:-artifact}" >"$OUT/fetch-build.log" 2>&1 \
  || { log "fetch-build FAILED"; cat "$OUT/fetch-build.log"; exit 1; }
install -d -o axio -g axio "$OUT/ab"
status=0
as_axio bash /home/axio/cand/tools/pixel-path/ci/zen_ab.sh webkit /home/axio/base /home/axio/cand "$OUT/ab" || status=$?
ps -eo pid,ppid,user,comm,args >"$OUT/ps-after.txt"
chmod -R a+rX "$OUT"
exit "$status"
