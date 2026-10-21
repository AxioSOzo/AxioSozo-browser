#!/bin/sh
# Runs inside the pinned debian:13 container (see .github/workflows/linux-engine-bench.yml).
# /src = read-only checkout, /out = evidence directory published to ci-results.
# Same setup as native/webkit-host/ci/container_test.sh (pinned, sha256-checked WPE packages,
# host build as root), then the benchmark as an unprivileged user so WebKit's bubblewrap
# sandbox runs as on a desktop. WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS is never set.
set -eu
OUT=/out
REPS=${BENCH_REPS:-5}
mkdir -p "$OUT"
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$OUT/steps.log"; }

rm -f /etc/apt/apt.conf.d/docker-clean
export DEBIAN_FRONTEND=noninteractive
log "apt bootstrap"
apt-get update >"$OUT/apt-update.log" 2>&1
apt-get install -y --no-install-recommends python3 ca-certificates procps >"$OUT/apt-bootstrap.log" 2>&1
useradd -m -u 1500 axio
cp -a /src /home/axio/repo
chown -R axio:axio /home/axio/repo
REPO=/home/axio/repo
P="python3 -I $REPO/native/webkit-host/probe.py"

log "setup --apt (pinned Debian 13 packages)"
if ! $P setup --apt >"$OUT/setup.log" 2>&1; then
  STAMP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["webkit"]["debian"]["snapshot"])' "$REPO/upstreams.lock.json")
  log "pinned versions not on deb.debian.org; retrying from snapshot.debian.org ($STAMP)"
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
  $P setup --apt >"$OUT/setup-snapshot.log" 2>&1 || { log "setup FAILED"; tail -40 "$OUT/setup-snapshot.log"; exit 1; }
fi
chown -R axio:axio "$REPO/.local"
dpkg-query -W -f='${Package}\t${Version}\n' | grep -E 'wpe|webkit|mesa|bubblewrap' | sort >"$OUT/dpkg-engine.tsv"

as_axio() { setpriv --reuid=axio --regid=axio --init-groups --reset-env -- env HOME=/home/axio "$@"; }
status=0
log "check"
as_axio $P check >"$OUT/check.log" 2>&1 || status=$?
[ "$status" = 0 ] || { log "check failed ($status)"; cat "$OUT/check.log"; exit "$status"; }
mkdir -p "$OUT/bench" && chown axio:axio "$OUT/bench"
B="python3 -I $REPO/tools/engine-bench/bench.py --engine webkit"
log "bench: $REPS repetitions, no damage (what Zen negotiates today), + 1 MiB pipe A/B"
as_axio $B --out "$OUT/bench" --reps "$REPS" --pipe-experiment >"$OUT/bench.log" 2>&1 || status=$?
log "bench exit $status"
log "bench: $REPS repetitions with hello.frame_damage"
dstatus=0
as_axio $B --out "$OUT/bench" --reps "$REPS" --frame-damage >"$OUT/bench-damage.log" 2>&1 || dstatus=$?
log "bench damage exit $dstatus"
if grep -q damage_payload "$REPO/native/webkit-host/stream_core.hpp"; then
  log "bench: $REPS repetitions with hello.frame_damage + damage_payload"
  as_axio $B --out "$OUT/bench" --reps "$REPS" --frame-damage --damage-payload >"$OUT/bench-payload.log" 2>&1 || dstatus=$?
  log "bench payload exit $dstatus"
fi
ps -eo pid,ppid,user,comm,args >"$OUT/ps-after.txt"
chmod -R a+rX "$OUT"
[ "$status" = 0 ] || exit "$status"
exit "$dstatus"
