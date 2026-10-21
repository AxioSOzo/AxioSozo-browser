Status: DONE

# engine-bench handoff (cloud session, 19 Oct 2026)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/5 (draft, `cloud/engine-bench` → `cloud/integration`)

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU, ~15 GiB; no Zen app, no Actions artifacts/logs reachable;
  all bench evidence comes from GitHub Actions runs (results on `ci-results`, `cloud_engine-bench/`).
- Runners: GitHub `ubuntu-24.04`, 4 vCPU, 16 GB, no GPU; CPU model varies per job (EPYC 7763 /
  9V74 / 9V45, Xeon 8573C). WebKit jobs in pinned `debian:13`.

## What changed
- Merged `origin/cloud/integration` (clean).
- `tools/engine-bench/zen_bench.py`: in-Zen bench for **Chromium and WebKit tabs** via Zen's own
  engine switch (fixture-mode facade, `switchToChromium/WebKit/Gecko`), measured from Zen's chrome
  side (presenter frame counter + title sampled by a 2 ms chrome timer; chrome keydown → next
  presented frame; switch promise durations). Tab-switch time for every engine (TabSwitchDone,
  else first chrome MozAfterPaint). `input_wall_s` per input window. `--label`, `--chrome-overlay`.
- `tools/engine-bench/compare.py` (new): regression gate, baseline vs candidate (run id,
  `ci-results:<folder>`, summary.json, results dir), noise thresholds
  `max(rel·|base|, k·stdev, unit floor)`, rel raised to 25 % across different runner CPUs,
  `--fail-on-regression`.
- Presenter same-process A/B: `node_bench.mjs` (`BASELINE_PRESENTER=`) and `run_browser.py
  --baseline-presenter` measure an older `CEFPresenter.sys.mjs`'s `bgraToRGBA` next to the
  current one, with an identical-output check.
- `tools/engine-bench/ci/zen_webkit_container.sh` (new): Zen app + WPE host + zen_bench in debian:13
  (WebKit tabs, plus Gecko tabs as `gecko-debian` on the same machine).
- `.github/workflows/linux-engine-bench.yml`: CEF from this checkout (integrated code; the
  cloud/linux-cef `CEF_REF` pin is gone), `zen-source` picks the newest unexpired
  `axiosozo-zen-linux-x86_64` artifact (or `zen_build_run_id`), `zen` matrix (gecko, chromium)
  with a TEST-ONLY chrome overlay (`scripts/webkit_package.py overlay-chrome`, labelled in every
  result), `zen-webkit`, `workflow_call` inputs (`jobs`, `baseline`, `presenter_baseline_ref`,
  `zen_build_run_id`, `reps`), `compare.py` in the summary job (default baseline 39330954155).
- `.github/workflows/linux-engine-bench-gate.yml` (new): self-test of the reusable gate.
- `docs/PERFORMANCE.md` (new): methodology, machine bias, baselines, ranked bottlenecks with
  fixes, regression-gate usage incl. the caller workflow for cloud/perf-pixel-path.
- `docs/evidence/linux/bench/`: summary.md/json, compare.md, jobs.json of run 39330954155.

## Runs (linux-engine-bench unless noted)
| Run | Result |
| --- | --- |
| 39330954155 | **all 8 jobs green — reference**. In-Zen PASS 5/5: Gecko, Chromium tab, WebKit tab, Gecko on debian:13. App: linux-zen-build run 39325384904 (commit 832ac3e) + chrome overlay of 0b2c44b |
| 39334729960 | all green again (in-Zen 5/5 all engines) + `input_wall_s` |
| 39334995906 (linux-engine-bench-gate) | green: `workflow_call` path, presenter A/B vs cloud/integration 6c05cac (identical output), compare vs 39330954155 |
| 39328932408, 39327040692 | first Chromium-in-Zen / WebKit-in-Zen PASS (rep 1); reps 2–5 hit a harness bug (closed tab), fixed |
| 39326741061 | first in-Zen Gecko PASS 5/5; Chromium facade had no `switchTo` (fixed), zen-webkit `/out` permission (fixed) |
| 39335003079 (Linux check and test, PR) | green |

Headline numbers (39330954155, median): Gecko tab 59 fps, key→paint 9 ms, tab switch 23 ms,
browser 1.5 GB RSS / 750 MB PSS. Chromium tab 49.3 fps (p99 36 ms), key→paint 28.5 ms,
Gecko→Chromium 385 ms, Chromium→Gecko 129 ms, 2.85 GB RSS. WebKit tab 47.9 fps (p99 37 ms),
key→paint 32.9 ms, Gecko→WebKit 479 ms, WebKit→Gecko 211 ms, 2.24 GB RSS / 1.10 GB PSS. Zen
parent 117–151 % CPU in engine tabs while presenter draw is 1.5–2.6 ms/frame.

## Verified vs NOT_VERIFIED
- PASS (Actions): component benches CEF + WPE, presenter benches, in-Zen bench for all three
  engines, reusable gate + A/B, compare in the summary job.
- EXPERIMENTAL: engine-tab numbers use the TEST-ONLY chrome overlay on a prebuilt app (compiled
  code from 832ac3e, chrome JS from this branch).
- NOT_VERIFIED: the attribution of the parent-process cost inside Zen (no Gecko profile yet);
  engine-tab scroll fps under wheel (xdotool bursts take 17 s after the first window, also in
  Gecko on the image page — harness artefact; only rep-1 windows are valid: Chromium 47 fps,
  WebKit 30 fps); anything with a GPU; macOS; E1/E2 (never claimed); READY (never).

## Blockers / notes for other workstreams
- cloud/linux-cef: `native/chromium-host/probe.py check` prints PASS but exits 1 on Linux (at
  cloud/integration too), so `scripts/gui_engines/chromium.py` `prepare` reports BLOCKED_ENV
  even though the host works (`engine_prepare` in zen-bench-chromium.json). The bench proceeds.
- cloud/webkit-zen: `scripts/webkit_zen_container.sh` runs `overlay-chrome --out "$OUT/…"` as the
  unprivileged `axio` user while `/out` is root-owned → it will fail with PermissionError once an
  artifact exists (same bug fixed in my copy with `chown axio:axio "$OUT"`).
- Engine facades: the Chromium-only facade (EngineProbeControls) has no `switchTo(engine)`; use
  `switchToChromium/switchToGecko` (and `switchToWebKit` on the three-engine facade).
- TabSwitchDone never fires for a tab whose Gecko browser is hidden behind an engine presenter.
- cloud/perf-pixel-path: follow docs/PERFORMANCE.md "How cloud/perf-pixel-path should run it"
  (caller workflow with `jobs: presenter,zen`, `presenter_baseline_ref: cloud/integration`,
  `baseline: '39330954155'`). Gate on the same-job A/B; cross-run numbers vary up to ~20 % with
  the runner CPU and with runner-image browser versions.

## Next steps
1. Gecko profile of the parent while an engine tab animates (MOZ_PROFILER_STARTUP in zen_bench,
   profile JSON to ci-results) to confirm bottleneck 1 (Subprocess pipe reads vs other work).
2. Prototype the Linux shared-memory frame transport (memfd ring + slot messages) or, first, the
   1 MiB `F_SETPIPE_SZ` + single-read change, and measure with `compare.py --only zen-chromium/ zen-webkit/`.
3. Fix the wheel-injection pacing in zen_bench (per-event timing) so engine-tab scroll fps is
   measured in every repetition.
4. Multi-tab memory (≥2 Chromium / WebKit tabs) and warm-host switch time.
5. When a Zen build of a commit containing the integrated chrome code exists, run with
   `zen_build_run_id` and drop the overlay label.
