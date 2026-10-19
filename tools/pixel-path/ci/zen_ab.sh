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
SUDO=${SUDO-sudo}
mkdir -p "$OUT"
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$OUT/steps.log"; }
APP=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["directory"])' "$AXIOSOZO_BUILD_ROOT/linux-app/current.json")

prepare() {  # $1 variant tree
  local tree=$1 name=$2
  log "$name: host + chrome from $(cat "$tree/.ab-commit" 2>/dev/null || git -C "$tree" rev-parse --short HEAD)"
  if [ "$ENGINE" = chromium ]; then
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
  for variant in base cand; do
    tree=$BASE; [ "$variant" = cand ] && tree=$CAND
    prepare "$tree" "$variant-r$round" || { status=1; continue; }
    for scale in $SCALES; do
      dir="$OUT/$variant-r$round-${scale}x"; mkdir -p "$dir"
      extra=(); [ "$scale" != 1 ] && extra=(--device-scale "$scale")
      log "zen_bench $ENGINE $variant round $round at ${scale}x ($REPS reps)"
      timeout -k 10 1800 python3 "$CAND/tools/engine-bench/zen_bench.py" --engine "$ENGINE" --app fetched --out "$dir" \
        --reps "$REPS" --size "$(size_for "$scale")" --chrome-overlay "$OUT/chrome-overlay-$variant-r$round.json" "${extra[@]}" \
        > "$dir/zen-bench.log" 2>&1 || status=1
      tail -n 3 "$dir/zen-bench.log" | tee -a "$OUT/steps.log"
    done
  done
done
python3 "$CAND/tools/pixel-path/ab_table.py" "$OUT" --out "$OUT/ab.md" --json "$OUT/ab.json" > /dev/null || status=1
cat "$OUT/ab.md"
exit $status
