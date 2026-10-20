#!/bin/sh
# Runs inside a debian:13 container (see .github/workflows/linux-webkit-host.yml).
# /src = read-only repository checkout, /out = evidence directory published to ci-results.
# Installs the pinned WPE packages (sha256-checked by probe.py), builds the host as root,
# then runs every test as an unprivileged user so WebKit's bubblewrap sandbox runs the
# way it does on a desktop. WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS is never set.
set -eu
OUT=/out
mkdir -p "$OUT"
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$OUT/steps.log"; }

rm -f /etc/apt/apt.conf.d/docker-clean   # keep downloaded .debs for the sha256 check
export DEBIAN_FRONTEND=noninteractive
log "apt bootstrap (python3, ca-certificates)"
apt-get update >"$OUT/apt-update.log" 2>&1
apt-get install -y --no-install-recommends python3 ca-certificates procps >"$OUT/apt-bootstrap.log" 2>&1

useradd -m -u 1500 axio
cp -a /src /home/axio/repo
chown -R axio:axio /home/axio/repo
REPO=/home/axio/repo
P="python3 -I $REPO/native/webkit-host/probe.py"

log "setup --apt (pinned Debian 13 packages, deb.debian.org)"
if ! $P setup --apt >"$OUT/setup.log" 2>&1; then
  # A Debian point release can supersede a pin: freeze every source to the lockfile's snapshot.
  STAMP=$(python3 -I -c 'import json,sys; d=json.load(open(sys.argv[1]))["webkit"]["debian"]; print(d["snapshot"])' "$REPO/upstreams.lock.json")
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
  $P setup --apt >"$OUT/setup-snapshot.log" 2>&1 || { log "setup FAILED"; tail -40 "$OUT/setup-snapshot.log"; exit 1; }
fi
# The host binary was built as root into the user's build root; hand it over.
chown -R axio:axio "$REPO/.local"

dpkg-query -W -f='${Package}\t${Version}\t${Architecture}\n' | sort >"$OUT/dpkg-installed.tsv"
# Pin drift: the archive's current candidate (from apt's signed indexes) for every pinned
# package, so a newer Debian (security) update is visible with its Filename and SHA256.
python3 -I -c 'import json,sys; d=json.load(open(sys.argv[1]))["webkit"]["debian"]["packages"]; print("\n".join(sorted({**d["runtime"], **d["build"]})))' "$REPO/upstreams.lock.json" |
  while read -r pkg; do
    printf '== %s\n' "$pkg"
    apt-cache policy "$pkg" | sed -n '2,3p'
    apt-cache show "$pkg" | grep -E '^(Version|Filename|SHA256|Size):'
  done >"$OUT/pin-drift.txt" 2>&1 || true
( cd /var/cache/apt/archives && sha256sum ./*.deb 2>/dev/null | sed 's#\./##' ) >"$OUT/deb-sha256.txt" || true
{
  echo "{"
  echo "  \"nproc\": $(nproc),"
  echo "  \"mem_kib\": $(awk '/MemTotal/{print $2}' /proc/meminfo),"
  echo "  \"kernel\": \"$(uname -r)\","
  echo "  \"os\": \"$(. /etc/os-release && echo "$PRETTY_NAME")\","
  echo "  \"debian_version\": \"$(cat /etc/debian_version)\","
  echo "  \"max_user_namespaces\": $(cat /proc/sys/user/max_user_namespaces)"
  echo "}"
} >"$OUT/machine.json"

as_axio() { setpriv --reuid=axio --regid=axio --init-groups --reset-env -- env HOME=/home/axio ${AXIOSOZO_WEBKIT_UPSTREAM_PREFIX:+AXIOSOZO_WEBKIT_UPSTREAM_PREFIX=$AXIOSOZO_WEBKIT_UPSTREAM_PREFIX} ${AXIOSOZO_WEBKIT_UPSTREAM_KEY:+AXIOSOZO_WEBKIT_UPSTREAM_KEY=$AXIOSOZO_WEBKIT_UPSTREAM_KEY} "$@"; }

status=0
log "check (pins, build fingerprint, bubblewrap user namespaces)"
as_axio $P check >"$OUT/check.log" 2>&1 || status=$?
log "check exit $status"
log "test (unit + stream + input + security + cleanup)"
tstatus=0
as_axio $P test >"$OUT/test.log" 2>&1 || tstatus=$?
log "test exit $tstatus"
[ "$status" = 0 ] || tstatus=$status

# Evidence: result JSON, logs and PNGs of real engine frames.
if [ -d "$REPO/docs/evidence/linux/webkit/runs" ]; then
  cp -a "$REPO/docs/evidence/linux/webkit/runs" "$OUT/runs"
fi
cp "$REPO/.local/build/webkit/build.json" "$OUT/build.json" 2>/dev/null || true
ps -eo pid,ppid,user,comm,args >"$OUT/ps-after.txt"
chmod -R a+rX "$OUT"
exit "$tstatus"
