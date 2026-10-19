#!/bin/sh
# WebKit inside Zen, end to end, in the pinned debian:13 image
# (.github/workflows/linux-webkit-zen.yml). /src = read-only checkout, /artifact = the
# downloaded Linux Zen build artifact (axiosozo-zen-linux-x86_64), /out = evidence.
#
# 1. pinned WPE packages (sha256-checked by native/webkit-host/probe.py) and the host build;
# 2. runtime libraries of the Zen app and the GUI harness tools (Debian trixie, versions
#    and .deb sha256 recorded in /out);
# 3. as an unprivileged user: verify/unpack the app, TEST-ONLY chrome overlay
#    (scripts/webkit_package.py) when the app predates this commit, then the GUI harness
#    with --engine webkit and the Gecko -> WebKit -> Gecko round trip.
# WebKit's bubblewrap sandbox stays on; WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS is never set.
set -eu
OUT=/out
mkdir -p "$OUT"
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$OUT/steps.log"; }
export DEBIAN_FRONTEND=noninteractive
rm -f /etc/apt/apt.conf.d/docker-clean   # keep the .debs for the sha256 record
log "apt bootstrap"
apt-get update >"$OUT/apt-update.log" 2>&1
apt-get install -y --no-install-recommends python3 ca-certificates procps xz-utils git >"$OUT/apt-bootstrap.log" 2>&1

useradd -m -u 1500 axio
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

if [ "${MODE:-e2e}" = adapter ]; then
  # Zen's WebKit client (apps/browser/chrome) against the real host, with the pinned CI Node.
  chown -R axio:axio "$AXIOSOZO_BUILD_ROOT" "$REPO"
  mkdir -p "$OUT/adapter" && chown axio:axio "$OUT/adapter"
  # The pinned Node arrives read-only from the runner's private build root: copy it for the test user.
  cp -a /opt/node /home/axio/node && chown -R axio:axio /home/axio/node && chmod -R u+rwX,go+rX /home/axio/node
  setpriv --reuid=axio --regid=axio --init-groups --reset-env -- env HOME=/home/axio PATH=/usr/bin:/bin \
    AXIOSOZO_BUILD_ROOT="$AXIOSOZO_BUILD_ROOT" $P check >"$OUT/webkit-check.log" 2>&1 || log "webkit check exit $?"
  astatus=0
  setpriv --reuid=axio --regid=axio --init-groups --reset-env -- env HOME=/home/axio PATH=/home/axio/node/bin:/usr/bin:/bin \
    AXIOSOZO_BUILD_ROOT="$AXIOSOZO_BUILD_ROOT" AXIOSOZO_WEBKIT_LIVE_HOST="$AXIOSOZO_BUILD_ROOT/webkit/AxioWebKitHost" \
    AXIOSOZO_WEBKIT_LIVE_EVIDENCE="$OUT/adapter" \
    timeout -k 10 240 node --test --test-reporter=spec "$REPO/apps/browser/tests/webkit-host-live.test.mjs" >"$OUT/adapter/node.log" 2>&1 || astatus=$?
  log "live adapter test exit $astatus"
  tail -n 30 "$OUT/adapter/node.log"
  ps -eo pid,ppid,user,comm,args >"$OUT/ps-after.txt"
  chmod -R a+rX "$OUT"
  exit "$astatus"
fi

log "Zen runtime libraries + GUI harness tools (scripts/linux_packages.py gui)"
# shellcheck disable=SC2046
apt-get install -y --no-install-recommends $(python3 "$REPO/scripts/linux_packages.py" gui) >"$OUT/apt-gui.log" 2>&1
chown -R axio:axio "$AXIOSOZO_BUILD_ROOT" "$REPO"
dpkg-query -W -f='${Package}\t${Version}\t${Architecture}\n' | sort >"$OUT/dpkg-installed.tsv"
( cd /var/cache/apt/archives && sha256sum ./*.deb 2>/dev/null | sed 's#\./##' ) >"$OUT/deb-sha256.txt" || true
{
  echo "{"
  echo "  \"nproc\": $(nproc),"
  echo "  \"mem_kib\": $(awk '/MemTotal/{print $2}' /proc/meminfo),"
  echo "  \"kernel\": \"$(uname -r)\","
  echo "  \"os\": \"$(. /etc/os-release && echo "$PRETTY_NAME")\","
  echo "  \"glibc\": \"$(ldd --version | head -1 | awk '{print $NF}')\""
  echo "}"
} >"$OUT/machine.json"

as_axio() { setpriv --reuid=axio --regid=axio --init-groups --reset-env -- env HOME=/home/axio \
  PATH=/usr/bin:/bin AXIOSOZO_BUILD_ROOT="$AXIOSOZO_BUILD_ROOT" LANG=C.UTF-8 "$@"; }

log "check (pins, build fingerprint, bubblewrap user namespaces)"
status=0
as_axio $P check >"$OUT/webkit-check.log" 2>&1 || status=$?
log "webkit check exit $status"

log "unpack the Linux Zen app"
as_axio python3 "$REPO/scripts/linux_build.py" fetch-build --from-dir /artifact --run "${ZEN_RUN_ID:-artifact}" >"$OUT/fetch-build.log" 2>&1 \
  || { log "fetch-build FAILED"; cat "$OUT/fetch-build.log"; exit 1; }
APP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["directory"])' "$AXIOSOZO_BUILD_ROOT/linux-app/current.json")
if [ "${CHROME_OVERLAY:-1}" = 1 ]; then
  log "TEST-ONLY chrome overlay of the prebuilt app (scripts/webkit_package.py)"
  as_axio python3 "$REPO/scripts/webkit_package.py" overlay-chrome --app "$APP" --out "$OUT/chrome-overlay.json" >"$OUT/chrome-overlay.log" 2>&1 \
    || { log "overlay FAILED"; cat "$OUT/chrome-overlay.log"; exit 1; }
fi
as_axio python3 "$REPO/scripts/webkit_package.py" host >"$OUT/webkit-host.json" 2>&1 || true

gstatus=0
log "GUI harness --engine webkit (launch, chrome, fixture, input)"
as_axio python3 "$REPO/scripts/gui_test.py" --app fetched --engine webkit --scenario launch,chrome,fixture,input \
  --evidence-dir "$OUT/harness" --screenshot "$OUT/harness-final.png" >"$OUT/harness.log" 2>&1 || gstatus=$?
log "harness exit $gstatus"
rstatus=0
log "round trip Gecko -> WebKit -> Gecko"
as_axio python3 "$REPO/scripts/webkit_zen_e2e.py" --app fetched --evidence-dir "$OUT/roundtrip" \
  >"$OUT/roundtrip.log" 2>&1 || rstatus=$?
log "roundtrip exit $rstatus"
ps -eo pid,ppid,user,comm,args >"$OUT/ps-after.txt"
chmod -R a+rX "$OUT"
[ "$gstatus" = 0 ] || exit "$gstatus"
exit "$rstatus"
