#!/bin/bash
# Same-job A/B of the pipe pixel path inside the Linux Zen app (.github/workflows/linux-perf.yml).
#
#   zen_ab.sh ENGINE BASE_TREE CAND_TREE OUT
#
# ENGINE chromium (on the runner) or webkit (inside the pinned debian:13 container, as
# tools/engine-bench/ci/zen_webkit_container.sh; run as the unprivileged user). The Zen app
# must already be unpacked (./dev fetch-build) under $AXIOSOZO_BUILD_ROOT. Per variant the
# engine host is rebuilt from that tree (probe.py setup) and that tree's apps/browser/chrome is
# overlaid onto the prebuilt app (TEST-ONLY, scripts/webkit_package.py overlay-chrome, labelled
# in every result). The harness (tools/engine-bench/zen_bench.py) is always the candidate's.
# Rounds alternate base/cand on one machine: $ROUNDS rounds × $SCALES × $REPS repetitions.
# Sandboxes stay on (CEF SUID helper / WebKit bubblewrap); nothing security-relevant changes.
set -u
ENGINE=$1 BASE=$2 CAND=$3 OUT=$4
REPS=${REPS:-3} ROUNDS=${ROUNDS:-2} SCALES=${SCALES:-"1 2"}
# Variants: base = BASE_TREE as is; every other variant = CAND_TREE with TEST-ONLY prefs (prefs_for):
# cand (its defaults), pipe / memfd (axiosozo.engines.linux.memfd_frames off / on, engine-stream-v1 §6.3),
# worker / jsmain (axiosozo.engines.linux.frame_worker on / off), native (axiosozo.engines.linux.native_receiver
# on), imagedata (axiosozo.engines.linux.frame_upload=imagedata).
VARIANTS=${VARIANTS:-"base cand memfd"}
prefs_for() {
  case $1 in
    memfd) echo "--pref axiosozo.engines.linux.memfd_frames=true" ;;
    pipe) echo "--pref axiosozo.engines.linux.memfd_frames=false" ;;
    worker) echo "--pref axiosozo.engines.linux.frame_worker=true" ;;
    jsmain) echo "--pref axiosozo.engines.linux.frame_worker=false" ;;
    nativeworker) echo "--pref axiosozo.engines.linux.frame_worker=true --pref axiosozo.engines.linux.native_receiver=true" ;;
    native) echo "--pref axiosozo.engines.linux.native_receiver=true" ;;
    imagedata) echo "--pref axiosozo.engines.linux.frame_upload=imagedata" ;;
    *) ;;
  esac
}
SUDO=${SUDO-sudo}
mkdir -p "$OUT"
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$OUT/steps.log"; }
APP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["directory"])' "$AXIOSOZO_BUILD_ROOT/linux-app/current.json")

prepare() {  # $1 variant tree
  local tree=$1 name=$2
  log "$name: host + chrome from $(cat "$tree/.ab-commit" 2>/dev/null || git -C "$tree" rev-parse --short HEAD)"
  if [ "$ENGINE" = chromium ]; then
    # CMake refuses a cache made from the other variant's source directory.
    rm -rf "$AXIOSOZO_BUILD_ROOT/cef/cmake-linux64"
    python3 "$tree/native/chromium-host/probe.py" setup > "$OUT/setup-$name.log" 2>&1 || { log "setup FAILED"; tail -30 "$OUT/setup-$name.log"; return 1; }
    if [ -n "$SUDO" ]; then python3 "$tree/native/chromium-host/probe.py" install-sandbox >> "$OUT/setup-$name.log" 2>&1 || true; fi
    python3 "$tree/native/chromium-host/probe.py" check >> "$OUT/setup-$name.log" 2>&1 || true
  else
    python3 -I "$tree/native/webkit-host/probe.py" setup > "$OUT/setup-$name.log" 2>&1 || { log "setup FAILED"; tail -30 "$OUT/setup-$name.log"; return 1; }
    python3 -I "$tree/native/webkit-host/probe.py" check >> "$OUT/setup-$name.log" 2>&1 || true
  fi
  python3 "$tree/scripts/webkit_package.py" overlay-chrome --app "$APP" --out "$OUT/chrome-overlay-$name.json" > "$OUT/overlay-$name.log" 2>&1 \
    || { log "overlay FAILED"; cat "$OUT/overlay-$name.log"; return 1; }
}

size_for() { if [ "$1" = 1 ]; then echo 1280x800; else echo 2304x1440; fi; }
status=0
for round in $(seq 1 "$ROUNDS"); do
  for variant in $VARIANTS; do
    tree=$BASE tree_name=base; [ "$variant" != base ] && tree=$CAND tree_name=cand
    read -r -a prefs <<< "$(prefs_for "$variant")"
    # One host build + chrome overlay per tree switch serves every variant of that tree.
    if [ "${prepared:-}" != "$tree-r$round" ]; then
      prepare "$tree" "$tree_name-r$round" || { status=1; continue; }
      prepared=$tree-r$round
    fi
    overlay_name=$tree_name-r$round
    for scale in $SCALES; do
      dir="$OUT/$variant-r$round-${scale}x"; mkdir -p "$dir"
      extra=(); [ "$scale" != 1 ] && extra=(--device-scale "$scale")
      log "zen_bench $ENGINE $variant round $round at ${scale}x ($REPS reps)"
      timeout -k 10 1800 python3 "$CAND/tools/engine-bench/zen_bench.py" --engine "$ENGINE" --app fetched --out "$dir" \
        --reps "$REPS" --size "$(size_for "$scale")" --chrome-overlay "$OUT/chrome-overlay-$overlay_name.json" "${extra[@]}" "${prefs[@]}" \
        > "$dir/zen-bench.log" 2>&1 || status=1
      tail -n 3 "$dir/zen-bench.log" | tee -a "$OUT/steps.log"
    done
  done
done
python3 "$CAND/tools/pixel-path/ab_table.py" "$OUT" --out "$OUT/ab.md" --json "$OUT/ab.json" > /dev/null || status=1
cat "$OUT/ab.md"
exit $status
