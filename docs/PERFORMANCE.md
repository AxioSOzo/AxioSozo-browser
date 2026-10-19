# Engine performance on Linux (tools/engine-bench)

Status: measurements on GitHub-hosted Linux runners, software rendering only. Not E1/E2
evidence and not a macOS statement; never READY. Every number below comes from an Actions
run whose results are on the `ci-results` branch (`cloud_engine-bench/<run>-1-<job>/`).

Reference run: **39330954155** (all seven jobs green; in-Zen PASS 5/5 for Gecko, Chromium
and WebKit tabs). Earlier component baseline: 39303324088 (CEF from cloud/linux-cef
`ae99a09`, before integration). Default `compare.py` baseline for pushes: 39330954155.

## What is measured

| Layer | Tool | Engines | What it isolates |
| --- | --- | --- | --- |
| Component | `bench.py` | Chromium (CEF 154, `native/chromium-host`), WebKit (WPE 2.48.3, `native/webkit-host`) | The host alone over its authenticated AXCF stdin/stdout pipe, exactly as Zen's adapters speak it. The client acks each frame right after reading it, so these are upper bounds for what a presenter can get. 1× (900×650) and 2× (1800×1300), with/without `hello.frame_damage`, plus a 1 MiB-pipe A/B. |
| Pixel path | `presenter/node_bench.mjs`, `presenter/run_browser.py` + `page.html` | V8, Firefox, Chrome on the runner image | The real `bgraToRGBA` (imported/extracted from `apps/browser/chrome/CEFPresenter.sys.mjs`) + `putImageData`, and candidate replacements; optional same-process A/B against an older presenter. |
| Integrated | `zen_bench.py` | Gecko, Chromium, WebKit tabs **inside the Linux Zen app** | The real app under Xvfb (GUI harness: owned throwaway profile, Marionette, xdotool). Gecko tabs measure in-page. Chromium/WebKit tabs are switched with Zen's own engine switch (fixture-mode facade `window.AxioSozo.engineProbe`, the same one the GUI plug-ins use) and measured from Zen's chrome side: the presenter's frame counter + title sampled by a 2 ms chrome timer, chrome `keydown` timestamps for keys routed to the presenter canvas, and the switch promises. |

Integrated metrics (per repetition, 5 repetitions, each in a fresh tab):

- **page-load-to-visible**: Gecko — navigation timing (FCP, loadEventEnd; content timers are
  1 ms-coarsened) and wall time to the fixture title. Engine tabs — `navigate()` to the engine's
  title event, and to the first presented frame after it (`navigate_to_visible_ms`).
- **frame cadence + jitter** on a rAF-animated page (3 s) and under real X11 wheel input
  (120 × button 5, 16 ms apart): fps, interval median/p99, share of intervals > 25 ms. Gecko via
  in-page rAF; engine tabs via presented-frame changes (`fps` over the active span,
  `fps_whole_window` over the whole window).
- **input-to-paint**: 20 real X11 key presses into a focused text field with a transparent
  caret. Gecko: keydown → second rAF after it. Engine tabs: chrome keydown → next presented
  engine frame.
- **switch times**: Gecko → engine (`switchToChromium/WebKit()` resolves after the first
  presented frame), engine → Gecko, and tab switches (TabSwitchDone; for engine-presented tabs,
  which never fire it, the first chrome MozAfterPaint).
- **memory/CPU of the whole browser**: RSS (and PSS where readable) and CPU% of the app's whole
  process tree, engine hosts and helpers included (they are descendants of the Zen parent),
  split by process kind.

Test-only pieces, all labelled in the JSON: the GUI harness switches (`-marionette`,
`--remote-allow-system-access`, throwaway profile), fixture mode of the engine facade, the
WebKit pref `axiosozo.engines.webkit.enabled` in the throwaway profile, and the
**chrome-overlay**: the prebuilt app (`linux-zen-build` artifact, run 39325384904, commit
`832ac3e`) predates the integrated CEF/WebKit chrome code, so `scripts/webkit_package.py
overlay-chrome` replaces its `apps/browser/chrome` files in `omni.ja` with this checkout's
(8 replaced, 5 added; compiled code untouched). A full build of the same commit replaces this.
No TLS, sandbox or isolation setting is changed; WebKit's bubblewrap sandbox and CEF's SUID
sandbox run.

## Machines and bias

GitHub `ubuntu-24.04` runners: 4 vCPU (2 cores × 2 threads), 16 GB, Azure kernel 6.17, **no
GPU** (`/dev/dri/card1` on some runners is the Hyper-V virtual display, not a GPU). The CPU model
varies per job: AMD EPYC 7763, AMD EPYC 9V74, AMD EPYC 9V45, Intel Xeon Platinum 8573C were all
seen in one evening. The WebKit and in-Zen WebKit jobs run in the pinned `debian:13` image.

Consequences:

- **Software rendering everywhere.** Gecko uses WebRender software, CEF its SwiftShader/software
  OSR path, WPE the fdo SHM path, presenter WebGL SwiftShader or none. CPU% and frame times are
  therefore much higher than on a GPU desktop, and the macOS IOSurface zero-copy path
  (contracts/engine-surface-v1) is not exercised at all. Treat absolute numbers as a CPU-bound
  worst case; use the ratios and the bottleneck ranking.
- **4 vCPUs saturate.** WebKit at 2× needs ~230 % CPU for the host alone, so it is very
  sensitive to the runner: rAF at 2× was 58.0 fps on EPYC 9V74 (39303324088) and 46.1 fps on
  EPYC 7763 (39330954155) with identical host code and packages.
- **Runner images change.** Chrome on the image moved 155.0.8059.39 → .84 between runs and its
  `bgraToRGBA` at 1800×1300 went from 14–15 ms to 5.8 ms. Cross-run presenter numbers are only
  comparable with the same browser version (recorded in each result).
- Cross-run noise, measured: identical WebKit host code on two runs on different CPUs
  (39301948003 Intel 8573C vs 39303324088 EPYC 9V74) differed by up to ~20 % in CPU% and memory;
  on the same CPU model (39303324088 vs 39326741061, both EPYC 9V74) 2× WebKit fps still differed
  by 12 %. Hence the thresholds and the same-job A/B in the regression gate below.

## Baseline (run 39330954155; 5 repetitions; median [p95])

### Inside Zen

Window 1152×720 at 1×, content area about 1100×600 CSS px. Gecko on the runner (EPYC 7763),
Chromium on the runner (Xeon 8573C), WebKit and Gecko-on-Debian in debian:13 (Xeon 8573C).

| Metric | Gecko | Gecko (debian:13) | Chromium tab | WebKit tab |
| --- | --- | --- | --- | --- |
| Load → visible, static page | FCP 21 ms [83] | FCP 18 ms [54] | 73 ms [175] | 76 ms [82] |
| Load → visible, image page | FCP 125 ms [143] | FCP 110 ms [115] | 164 ms [168] | 432 ms [488] |
| Load → visible, 2 000-row DOM page | FCP 179 ms [184] | FCP 127 ms [141] | 256 ms [288] | 462 ms [468] |
| rAF page: presented fps | 59.0 | 59.0 | **49.3** [50.6] | **47.9** [48.9] |
| rAF page: frame interval p99 | 17.2 ms | 17.2 ms | 36.0 ms [37.5] | 37.0 ms [40.8] |
| rAF page: intervals > 25 ms | 0 % | 0 % | 7 % | 7 % [18] |
| rAF page: CPU, whole browser | 30 % [39] | 22 % [25] | **151 %** [153] | **182 %** [187] |
| Wheel scroll: fps (Gecko in-page) | 59.0, 13 300 px scrolled | 59.0 | input-bound, see bottleneck 3 | input-bound |
| Key → paint | 9 ms [10.5] (keydown → 2nd rAF) | 8 ms [10] | **28.5 ms** [28.8] | **32.9 ms** [33.7] |
| Gecko → engine switch | — | — | 385 ms [567] | 479 ms [614] |
| Engine → Gecko switch | — | — | 129 ms [134] | 211 ms [211] |
| Tab switch to/from a Gecko tab | 23 ms / 23 ms | 23 ms / 23 ms | 54 ms / 30 ms | 21 ms / 22 ms |
| Memory, whole browser (RSS) | 1 532 MB [1 592], 12 processes | 1 733 MB, 13 proc. | 2 854 MB [2 928], 23 proc. | 2 235 MB [2 331], 18 proc. |
| Memory, whole browser (PSS) | 750 MB | 768 MB | — (CEF helpers' smaps unreadable) | 1 098 MB |
| Memory after switching back to Gecko | — | — | 1 529 MB (host exited) | 1 662 MB (host exited) |
| Presenter draw per frame (`meanDrawMilliseconds`) | — | — | 1.7 ms (rAF), 2.6 ms (scroll) | 1.5 ms, 2.0 ms |

CPU split in the engine-tab rAF window (rep 1 of runs 39328932408 / 39327040692, same shape in
39330954155): Chromium — Zen parent 131 %, CEF renderer 11 %, CEF GPU process 8 %, host 12 %;
WebKit — Zen parent 117 %, WPEWebProcess 74 %, host 15 %. The Zen parent, not the engine, is the
dominant cost.

### Component (host alone over the pipe)

| Metric | Chromium 1× | Chromium 2× | WebKit 1× | WebKit 2× |
| --- | --- | --- | --- | --- |
| Spawn → ready | 262 ms [540] | | 41 ms [43] | |
| Create → first painted frame | 219 ms [642] | | 436 ms [457] | |
| rAF fps | 60.0 | 59.6 | 58.0 | 46.1 [47.4] |
| rAF interval p99 | 18.4 ms | 19.7 ms | 18.6 ms | 36.3 ms |
| Pipe throughput (rAF) | 140 MB/s | 558 MB/s | 136 MB/s | 432 MB/s |
| Client read time per frame | 1.7 ms | **15.6 ms** | 1.9 ms | **17.3 ms** |
| Key → changed frame | 4.4 ms | 18.0 ms | 7.7 ms | 36.4 ms |
| CPU host + helpers (rAF) | 20 % | 44 % | 62 % | **233 %** |
| RSS host + helpers | 869 MB | 1 263 MB | 407 MB | 575 MB |
| Changed-row band / host damage share (rAF) | 0.42 / 0.24 | 0.42 / 0.24 | 0.42 / 0.21 | 0.42 / 0.21 |
| 1 MiB pipe A/B: read per frame | | 15.6 → 12.1 ms | | 17.3 → 16.3 ms |
| 1 MiB pipe A/B: scroll CPU | | 77 → 56 % | | 225 → 236 % |

### Presenter pixel path (ms per frame, 1800×1300)

| Step | Firefox 158 | Chrome 155.0.8059.84 | V8 22 (Node) |
| --- | --- | --- | --- |
| `bgraToRGBA` (current) | 7.0 [13.4] | 5.8 | 9.3 |
| candidate u32 opaque fast path (identical output) | 3.3 | 2.7 | 3.0 |
| `putImageData` full frame | 0.36 | 0.20 | — |
| current full draw (convert + put) | 6.9 | 6.3 | — |
| candidate: convert + put only a 10 % damage band | 0.8 | 0.7 | — |

## Bottlenecks, ranked

1. **The Zen parent process caps engine tabs at ~48–49 fps and adds ~20 ms input latency.**
   In-Zen, a page that animates at 60 fps in the host alone (component rAF 58–60 fps at 1×)
   presents at 49.3 (Chromium) / 47.9 (WebKit) fps with p99 intervals of 36–37 ms, while the Zen
   parent uses 117–131 % CPU and the presenter's draw is only 1.5–2.6 ms per frame. Key → paint is
   28–33 ms in engine tabs vs 9 ms in Gecko tabs and 4–8 ms for the host alone. So the cost is
   the frame *transport into* the parent, not conversion: each frame (2.3 MB at 1×, 9.4 MB at 2×)
   is read through Firefox's `Subprocess` pipe (`pipe.read(size)` in
   `EngineStreamClient`/`CEFEngineAdapter`), which reads in a ChromeWorker in bounded chunks
   and hands buffers to the main thread, and the 64 KiB kernel pipe forces many wakeups per
   frame (the 1 MiB-pipe A/B cut client read time 15.6 → 12.1 ms and Chromium scroll CPU 77 →
   56 % in the component bench). The exact split inside the parent is NOT_VERIFIED (no Gecko
   profile yet).
   **Fixes**, in order of payoff: (a) a shared-memory frame transport on Linux, the analogue of
   the macOS IOSurface path: the host writes BGRA into a `memfd` ring (2–3 slots) shared once at
   `create`, and the pipe carries only `{slot, frame_id, damage}`; the presenter wraps the slot
   without a copy. This removes ~9 MB/frame of pipe traffic at 2× and every per-chunk wakeup.
   (b) Until then: enlarge the host's stdout pipe with `F_SETPIPE_SZ` to 1 MiB (measured −22 %
   read time, Chromium) and read each frame with one `read(size)` into a preallocated buffer.
   (c) Negotiate `hello.frame_damage` in Zen and send only damaged rows (host damage share is
   0.21–0.24 on the rAF page): ~4× less data per animated frame.
2. **Full-frame conversion on the main thread at 2×.** The current `bgraToRGBA` costs 7.0 ms
   (Firefox) / 9.3 ms (V8) per 1800×1300 frame — 40–55 % of a 16.7 ms budget — and the presenter
   converts and uploads the whole frame even when little changed (in-Zen `uploadedPixelShare`
   0.28–0.58 for Chromium shows the presenter already limits uploads; the conversion before it is
   still full-frame). **Fixes**: the u32 opaque fast path (identical output, 3.3 ms in Firefox,
   −53 %; already measured as a candidate); convert and `putImageData` only the damage rect
   (0.8 ms for a 10 % band); longer term, upload BGRA directly (WebGL `texSubImage2D` with a
   swizzle in the shader, or `VideoFrame` with format `BGRA`) so no CPU swizzle remains — the
   WebGL candidate is SwiftShader-bound on these runners (10.6 ms) and must be judged on a GPU.
   This is what cloud/perf-pixel-path is working on; gate it with the A/B below.
3. **Wheel input to engine tabs is slow to dispatch.** In engine tabs a 120-click wheel burst
   produced ~77 (Chromium) / ~155 (WebKit) presented frames, but after the first repetition the
   burst took ~17 s of wall time (frames ÷ `fps_whole_window`) instead of ~2 s (`fps_whole_window` 4.5 / 9.3 fps; Gecko
   tabs: 59 fps, 13 300 px). The X11 wheel events queue behind the parent's frame handling
   (bottleneck 1) and/or a per-wheel round trip in the presenter's input forwarding. Run
   39330954155 lacks the input wall time; later runs record `input_wall_s` so this is measured
   directly. **Fixes**: coalesce wheel deltas per animation frame in the presenter instead of one
   host request per event; do not await a reply per wheel event; then re-measure (this item
   probably shrinks with fix 1).
4. **WebKit host CPU at 2×.** WPE renders in software at ~230 % CPU of 4 vCPUs and drops to
   46 fps at 2× on slower runners (58 fps on faster ones); in-Zen WPEWebProcess takes ~74 % at
   1×. **Fixes**: confirm WPE's GPU path on real hardware (not available on runners); keep the
   2× render scale off for WebKit tabs when the host reports it cannot hold 60 fps
   (`renderScaleLimited` exists in the presenter); damage-only frames (fix 1c).
5. **Engine switch and first frame.** Gecko → Chromium 385 ms, → WebKit 479 ms (host spawn +
   create + first frame; component: CEF spawn 262 ms + create 219 ms, WebKit spawn 41 ms +
   create 436 ms). WebKit's image/DOM page loads are 2–3× Gecko's (432/462 ms vs 125/179 ms FCP).
   **Fixes**: pre-spawn one host per engine after the first switch intent (hover on the engine
   glyph) or keep a warm host per window; for WebKit, investigate the 436 ms create (web process
   + network process start under bubblewrap).
6. **Memory of an engine tab.** One Chromium tab adds ~1.3 GB RSS to the browser vs the Gecko run (23 processes;
   CEF renderer 375 MB, GPU process 189 MB, zygote/utility ~300 MB) and one WebKit tab ~0.5 GB
   (PSS +330 MB vs Gecko on the same debian:13 runner). Both are released when the tab returns to Gecko (hosts exit). **Fixes**: share
   one CEF host per window across Chromium tabs (check what cef-v1's target model allows), and
   `--renderer-process-limit` sized to the tab count; measure with ≥2 engine tabs next.

Gecko itself is not a bottleneck here: 59 fps with p99 17.2 ms on rAF and scroll pages, 9 ms
key → paint, 23 ms tab switch, 1.5 GB RSS / 750 MB PSS for the whole browser with two tabs.

## Regression gate (`compare.py`)

```sh
git fetch origin ci-results
python3 tools/engine-bench/compare.py BASELINE CANDIDATE [--only zen-chromium/ presenter-firefox/] \
    [--rel 0.05] [--k 2] [--cross-machine-rel 0.25] [--all] [--fail-on-regression] [--out compare.md]
```

`BASELINE`/`CANDIDATE`: a run id of this workflow on cloud/engine-bench (e.g. `39330954155`), a
`ci-results:<folder>` (a summary folder or any job folder of raw results, e.g.
`ci-results:cloud_engine-bench/39330954155-1-presenter`), a `summary.json`, or a local results
directory. Metrics are medians over repetitions. A difference counts only beyond
`max(rel × |baseline|, k × max(stdev_base, stdev_cand), unit floor)` (floors 0.5 ms, 1 fps,
3 CPU-%, 10 MB, 0.02 share); when the two results ran on different CPU models the relative part
is raised to 25 % and the row is marked `(different CPU)`. Direction comes from the metric name
(fps, MB/s higher is better; ms, CPU, MB, long-interval shares lower is better; process counts
and byte sizes are descriptive). Every push to cloud/engine-bench compares its summary with the
default baseline in the `summary` job (`compare.md` on ci-results).

Cross-run comparisons on these runners are noisy (see "Machines and bias"): trust a cross-run
REGRESSION only if it is well above its threshold, holds on the same CPU model, or reproduces on
a second run. For pixel-path work use the **same-job A/B**, which removes runner and browser
variance:

### How cloud/perf-pixel-path should run it

1. Merge `cloud/engine-bench` (or `cloud/integration` once this is merged) so
   `.github/workflows/linux-engine-bench.yml` and `tools/engine-bench/` exist on the branch.
2. Add a small caller workflow on the branch (pushes there do not trigger this workflow
   directly):

   ```yaml
   # .github/workflows/perf-pixel-path-bench.yml
   name: perf-pixel-path-bench
   on:
     push:
       branches: [cloud/perf-pixel-path]
       paths: [apps/browser/chrome/**, tools/engine-bench/**]
   jobs:
     bench:
       permissions: { contents: write, actions: read }
       uses: ./.github/workflows/linux-engine-bench.yml
       with:
         jobs: presenter,zen          # presenter A/B (~2 min) + Gecko/Chromium tabs in Zen (~3–6 min each, run 39330954155)
         presenter_baseline_ref: cloud/integration
         baseline: '39330954155'
   ```

   Add `zen-webkit` for WebKit tabs and `chromium,webkit` for the hosts if the change touches
   them. `zen_build_run_id` pins the Zen app artifact; by default the newest unexpired one is
   used and the branch's `apps/browser/chrome` is overlaid onto it (TEST-ONLY, labelled), so
   chrome-JS presenter changes are measured inside Zen without a rebuild.
3. Read the results from a session: `git fetch origin ci-results` and
   `git show origin/ci-results:cloud_perf-pixel-path/<run>-1-summary/compare.md`; the presenter
   job's `presenter-*.json` carries `baseline_bgraToRGBA_ms` / `baseline_draw_full_ms` next to
   `presenter_bgraToRGBA_ms` / `presenter_draw_full_ms` (same process, same machine) and
   `baseline_identical_output` (must stay `true` unless the output is meant to change).
4. Accept a pixel-path change when (a) the same-job A/B improves `presenter_draw_full_ms` in
   Firefox at 1800×1300 and the output is identical, and (b) `compare.py` shows no REGRESSION on
   `zen-chromium/` and `zen-webkit/` rows that holds on the same CPU model; the in-Zen numbers to
   move are `raf.window.fps`, `raf.window.usage.cpu_percent`,
   `raf.window.presenter.meanDrawMilliseconds` and `key.keydown_to_presented_frame_ms.median`.
   Locally, the A/B runs without Actions:
   `git archive cloud/integration apps/browser/chrome | tar -x -C /tmp/base &&
   BASELINE_PRESENTER=/tmp/base/apps/browser/chrome/CEFPresenter.sys.mjs node tools/engine-bench/presenter/node_bench.mjs`.

## Runs

| Run | Result | Notes |
| --- | --- | --- |
| 39330954155 | all green | **reference**: in-Zen Gecko/Chromium/WebKit PASS 5/5, Gecko on debian:13 PASS 5/5, integrated CEF, app run 39325384904 + chrome overlay |
| 39328932408 | zen (chromium) FAIL 1/5 | first in-Zen Chromium PASS (rep 1); reps 2–5 hit a harness bug (closed tab), fixed |
| 39327040692 | zen-webkit FAIL 1/5 | first in-Zen WebKit PASS (rep 1); same harness bug; Gecko on debian:13 PASS 5/5 |
| 39326741061 | zen (gecko) PASS 5/5 | first in-Zen Gecko run; Chromium facade has no `switchTo` (fixed: `switchToX`); zen-webkit could not write `/out` (fixed) |
| 39303324088 | green, zen BLOCKED_ENV | component baseline with CEF at cloud/linux-cef `ae99a09`; no Zen artifact existed yet |
| 39301948003 | presenter timer coarse | component only; used for the cross-CPU noise measurement |

Integrated CEF (cloud/integration) vs the linux-cef pin: within noise on every component metric
(compare 39303324088 → 39326741061, `--only chromium/`).

## Reproducing

```sh
# component (needs a built host; see native/*/README.md)
python3 tools/engine-bench/bench.py --engine chromium --cef-root . --out OUT --reps 5 [--frame-damage] [--pipe-experiment]
# in Zen (needs ./dev fetch-build and, for engine tabs, the host; Linux, Xvfb)
python3 tools/engine-bench/zen_bench.py --engine gecko|chromium|webkit --app fetched --out OUT --reps 5
python3 tools/engine-bench/summarize.py OUT --out summary.md --json summary.json
python3 tools/engine-bench/compare.py 39330954155 summary.json
```
