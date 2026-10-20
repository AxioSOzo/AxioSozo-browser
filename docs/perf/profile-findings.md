# Zen parent-process profile findings (engine-profile)

MEASUREMENT ONLY. Where the Zen parent spends CPU and time when a Chromium or WebKit tab
animates, scrolls, takes keys or is switched to, against a Gecko tab running the same fixtures.
Tooling: `tools/engine-bench/profile/` (zen_profile.py drives zen_bench's scenarios on the real
Linux app; hooks.js = TEST-ONLY chrome timing hooks; gecko_profile.py / report.py summarize the
Gecko profiler JSON), workflow `.github/workflows/linux-engine-profile.yml`, results on the
`ci-results` branch.

Current defaults (cloud/integration cad019b: memfd frames + native receiver + frame worker
fallback): **linux-engine-profile run 39379600003** (all 7 jobs green; app linux-perf-build
39362552105 with `engine-view/linux` compiled in; every engine window reported
`frameTransport: memfd`, `frameUpload: native`). Pre-phase-2 baseline: run 39363370750.
Results: `ci-results` → `claude_engine-profile-liqv71/39379600003-1-*/<label>/report-<label>.md`
(+ `.json`, per-window `profiles/*.summary.md`, trimmed `*.trimmed.json.gz`).

## Summary (current defaults)

1. **Software WebRender compositing of the engine canvas is now the largest parent-side cost**:
   Renderer + SwComposite = 31.7 % of a core in a Chromium 2× rAF tab (Gecko 2× control:
   13.3 %), 31.8 % in WebKit 2×. Hot code: `blendTextureNearestFast`, `scale_blit`, `memmove`.
2. **Native receiver (AxioFrameRing queue on BackgroundThreadPool)**: ≈ 6 % of a core at 2×
   (apply 0.21 ms + present 0.78 ms per frame; present copies the whole frame into a new
   SharedRGBImage). 1×: ≈ 1 % (0.02 + 0.12 ms).
3. **Subprocess worker (DOM Worker)**: ≈ 4 % at 2× — the AXCF header/metadata pipe reads
   (poll + js-ctypes); no pixels cross it any more.
4. **Main thread**: 6.6–7.3 % in rAF (no sampler) — mostly idle poll, ~40 ms JS / 3 s, GC 50 ms;
   **wheel scroll raises it to 21–22 %** (per-event JSON writes to the host + GC).
5. **The harness itself** (zen_bench's 2 ms chrome sampler calling `diagnostics()`) adds
   2.4–7.3 points of parent CPU; earlier published parent-CPU numbers include it.
6. **Key → frame: the parent's share is < 1 ms**; the rest is the host (Chromium 2× 7.8 ms,
   WebKit 1× 12.8 ms, WebKit 2× 22 ms from key write to the first frame header).
7. **Gecko → engine switch: the parent's share is ~35–50 ms** (pre-spawn + spawn); 450–550 ms are
   host start-up (CEF init 240 ms + first frame 185 ms; WPE web process + first load 488 ms).

## Method

- App: prebuilt Linux Zen artifact (`axiosozo-zen-linux-x86_64`) + TEST-ONLY chrome overlay of
  the checkout (so chrome JS and hosts are the branch's), software WebRender under Xvfb on
  GitHub `ubuntu-24.04` runners (4 vCPU AMD EPYC, no GPU). WebKit runs in the pinned debian:13
  image. Sandboxes on.
- Three passes per engine, each in a fresh tab: **plain** (no instrumentation; per-thread CPU
  from `/proc/<pid>/task/*/stat` of every process in the app tree), **trace** (+ chrome timing
  hooks), **profile** (+ Gecko profiler, 1 ms, `js,stackwalk,cpu,processcpu,ipcmessages`, threads
  GeckoMain / DOM Worker / IPC I/O / Compositor / Renderer / WR* / SwComposite / background
  pools). CPU numbers come from **plain**; attribution from **profile**; the profile pass adds
  SamplerThread (~5–12 %) and inflates the first window after start (Gecko profile idle ~120 %).
- Windows: switch-to-engine, idle (2 s), raf (3 s rAF fixture), raf-nosampler (control without
  zen_bench's 2 ms chrome sampler; added for the phase-2 run), scroll (XTest wheel), key, switch-to-gecko.

## Baseline: EngineFrameSurface path, before perf-phase2 (run 39363370750)

App linux-zen-build 39346931130; chrome JS = cloud/integration after perf-pixel-path (JS swizzle +
putImageData through EngineFrameSurface, Subprocess pipe frames, 1 MiB pipes, damage payloads).

| tab (plain pass) | raf fps | Zen parent CPU % raf | scroll CPU % | key→frame ms | Gecko→engine switch ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gecko 1× | 59.0 | 30.8 (Renderer 16.6) | 52.8 | 8.0 | — |
| Gecko 2× | 59.0 | 36.1 (Renderer 20.8) | 94.1 (Renderer 68.5) | 9.0 | — |
| Chromium 2× | 58.4 | 117.8 (main 46, DOM Worker 26, Renderer 19, SwComposite 17) | 139.7 | 21.0 | 789 (trace 444) |
| WebKit 2× | 42.1 | 126.7 (main 47, DOM Worker 33, Renderer 22, SwComposite 16) | 112.7 | 32.2 | 565 |

Profile attribution (Chromium 2× raf, 3.2 s window, parent CPU ms): main 1567 (JS 611: the
EngineFrameSurface `swizzleRun` 262 self, `memmove` 379 self, `Premultiply_AVX2` 76 in
putImageData; GC 222 ms major), Subprocess DOM Worker 980 (pipe `read` 150, `memmove` 131,
poll), Renderer 572 + SwComposite 530 (software WR compositing the canvas: `scale_blit`,
`blendTextureNearestFast`). WebKit 2× raf is the same shape (main 1475 with swizzle 340 +
memmove 321; worker 929; Renderer 557 + SwComposite 499; GC 591 ms).

Key → frame (trace pass, median): Chromium 1× keydown→send 0.5 ms, send→first frame header
(host input + render) 7.5 ms, transport 0.5 ms, then the presenter; WebKit 1× host 14.4 ms +
rAF tick wait 8.9 ms. WebKit 2× host 27.6 ms. The host side dominates key latency.

Switch (trace, Chromium 1×): spawn 21→66 ms, hello→first host reply 67→287 ms (CEF init),
create→first frame 291→458 ms (first navigation + paint), first paint 472 ms. WebKit 1×: spawn
11→24, hello→reply 26→81, create→first frame 82→473 ms (WPE web process start + first load).
The parent's own share of the switch is < 20 ms; the rest is host/engine start-up.


## Current defaults (run 39379600003)

### (a) Steady-state parent CPU (plain pass, /proc, % of one core)

| tab | raf fps / p99 | raf | raf, sampler off | scroll | top threads (raf, sampler off) |
| --- | --- | ---: | ---: | ---: | --- |
| Gecko 1× | 59.0 / 17.2 | 26.8 | 19.5 | 43.0 | Renderer 9.6, WRRenderBackend 2.0 |
| Gecko 2× | 59.0 / 17.1 | 34.3 | 21.9 | 79.2 | Renderer 11.6, SwComposite 1.7 |
| Gecko 1× (debian:13) | 59.0 / 17.1 | 29.1 | 18.9 | 42.8 | Renderer 9.3 |
| Chromium 1× | 60.0 / 21.9 | 17.3 | 15.8 | 26.4 | Renderer 3.7, main 3.3, SwComposite 2.7 |
| Chromium 2× | 60.0 / 25.3 | 57.2 | 54.8 | 78.9 | Renderer 16.5, SwComposite 15.2, main 6.6, BgPool 6.3, DOM Worker 4.0 |
| WebKit 1× | 58.1 / 21.6 | 36.4 | 28.1 | 45.3 | Renderer 6.3, main 6.0, SwComposite 4.6, DOM Worker 3.0, BgPool 2.3 |
| WebKit 2× | 58.1 / 25.7 | 61.5 | 55.3 | 79.6 | Renderer 17.9, SwComposite 13.9, main 7.3, BgPool 5.3, DOM Worker 4.3 |

Baseline → now (2×, raf, with sampler): Chromium 117.8 → 57.2 %, WebKit 126.7 → 61.5 %; the
JS swizzle/putImageData (≈ 260–340 ms/3 s self) and the pixel pipe reads are gone from the
profiles. Other processes at 2× raf: WPEWebProcess ≈ 180 %, cef:gpu-process 15 %, cef:renderer
11 %, AxioCEFProbe 11 % — the engines, not the parent, are now the bulk of the machine's CPU
for WebKit.

Attribution (profile pass, Chromium 2× raf-nosampler, 3.06 s, parent CPU ms; the profile's
CPU-weighted samples agree with /proc within ~2 points):

| cost | ms / 3 s | share of a core | evidence |
| --- | ---: | ---: | --- |
| Renderer (SWGL) | 571 | 18.7 % | `blendTextureNearestFast` 163, `draw_quad_spans` 70 (Gecko 2× control Renderer ≈ 12 %) |
| SwComposite | 509 | 16.6 % | `scale_blit<true>` 251, `memmove` 81 |
| DOM Worker (Subprocess) | 297 | 9.7 %* | poll 270, js-ctypes; metadata reads only |
| main thread | 211 | 6.9 % | idle poll 138, JS 41, GC/CC 50, engine_stream_read 25, JSON 14 |
| BackgroundThreadPool (native receiver) | 196 | 6.4 % | `memmove` 78; statsJSON: apply 0.21 + present 0.78 ms/frame, 184 frames |
| WRRenderBackend + Compositor + ImageBridge | 120 | 3.9 % | syscalls / wake-ups |

\* includes profiler-induced wake-ups; /proc says 4.0 % in the plain pass.
WebKit 2× raf-nosampler is the same shape: Renderer 550, SwComposite 451 (`scale_blit` 168),
DOM Worker 259, main 217, BgPool 169 (`memmove` 48).

Wheel scroll (Chromium 2×, 2.2 s): main 515 ms (23.7 %): idle poll 306, JS 102, GC 106,
`write` 17 — the per-wheel-event input forwarding (chrome handler → JSON → host stdin) is what
raises the main thread from 7 % to 21–22 % in both engines. Gecko's own scroll costs Renderer
62 % at 2× (it re-rasterizes the page), so engine-tab scroll (79 %) is not worse in total.

### (b) Key → paint (trace pass, median ms; 20 keys per run)

| tab | keydown→send (chrome+adapter) | send→first frame header (host input+render) | metadata read | native apply | apply→ack (present) | zen_bench key→frame (plain) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gecko 1× / 2× | — | — | — | — | — | 8.5 / 9.0 |
| Chromium 1× | 0.3 | 4.6 | 0.0 | (counters: 0.008) | (0.17 present) | 9.4 |
| Chromium 2× | 0.5 | 7.8 | 0.0 | (0.06) | (0.84) | 12.1 |
| WebKit 1× | 0.4 | 12.8 | 0.0 | 0.09 | 0.31 | 16.2 |
| WebKit 2× | 0.4 | 22.0 | 0.0 | 0.10 | 0.35 | 25.3 |

The remaining ~3–4 ms between the parent's ack and zen_bench's "frame presented" are the
async ImageContainer → compositor → SWGL composite and the 2 ms sampler granularity. The
hooks' `keydown→MozAfterPaint` (≈ 86–159 ms) is NOT latency: a natively presented canvas
reaches the compositor through its async ImageContainer without a chrome paint, so the next
MozAfterPaint is unrelated (labelled as such here; use zen_bench's key→frame).
Chromium rows show apply/present from the receiver counters: the hooks wrapped the shared and
the Marionette-sandbox ("current") instances of EngineFrameSurface in both jobs
(`hooks.installed` in the JSON), which is the instance the WebKit adapter uses, but the CEF
adapter (statically imported by AxioSozoStartup.mjs in the window's module graph) uses a third
instance the hooks cannot reach. The native counters cover both engines.

**Conclusion**: engine-tab key latency is host-bound. Chromium 2× is now 3 ms above Gecko;
WebKit 1×/2× are 7/16 ms above Gecko, all inside WPE (input dispatch + software paint at
≈ 180 % CPU).

### (c) Gecko → engine switch (trace pass, ms after the switch call)

| step | Chromium 1× | Chromium 2× | WebKit 1× | WebKit 2× |
| --- | ---: | ---: | ---: | ---: |
| spawn called (chrome + adapter before spawn) | 11.7 | 34.3 | 19.2 | 23.4 |
| spawn resolved | 20.1 | 50.5 | 30.2 | 35.3 |
| hello written → first host reply | 22.0 → 179.6 | 53.7 → 294.0 | 41.8 → 98.5 | 37.8 → 100.8 |
| create written → first frame (ack) | 180.7 → 272.1 | 295.2 → 479.9 | 99.9 → 560.5 | 104.6 → 593.1 |
| zen_bench switch ms (plain) | — | 569.7 | — | 595.3 |

Parent share ≈ 35–60 ms (tab/engine-switch chrome work, adapter setup, Subprocess spawn,
focus/visibility writes ~5 ms after the first frame). Host share: CEF browser-process
initialisation 160–240 ms + first navigation/paint 90–185 ms; WPE 60 ms to hello, then
≈ 460–490 ms for the web/network processes to start and paint the first frame.
Engine → Gecko: 121–133 ms (Chromium), 213 ms (WebKit) (Gecko tab re-paint + host shutdown).

## Ranked parent-side costs and recommendations

| # | cost (2×, rAF) | size | owner | recommendation |
| --- | --- | --- | --- | --- |
| 1 | SWGL compositing of the engine canvas (Renderer + SwComposite) | ≈ 32 % of a core (Gecko control 13 %) | perf-pixel-path (+ linux-platform) | Check why the 1:1 device-pixel canvas goes through `scale_blit<true>` + `blendTextureNearestFast` (filtering/blend each frame): mark the image opaque (B8G8R8X8 already) and present it as a compositor surface (`external image` / WR native surface) so SwComposite copies once without blend; only re-upload the damage rect. On GPU machines this cost mostly disappears (NOT_VERIFIED). |
| 2 | Native receiver: two copies per frame (ring → whole frame on apply, whole frame → new SharedRGBImage on present) | ≈ 6 % (0.21 + 0.78 ms/frame) | perf-pixel-path | Copy the damage straight from the ring into a recycled texture (one copy, damage only); the present copy is whole-frame even for 24 % damage. |
| 3 | Subprocess worker for AXCF header/metadata | ≈ 4 % | perf-pixel-path | Read the control pipe natively (engine-view/linux fd watcher delivering parsed metadata) or batch metadata; Subprocess's poll/js-ctypes per 16 B header is the remaining per-frame JS-thread hop. |
| 4 | Main thread per-frame JS (adapter read loop, validation, ack, GC) | ≈ 3–5 % (rAF) | perf-pixel-path | Fewer allocations per frame (GC 50 ms / 3 s); ack from the native side once metadata is native. |
| 5 | Wheel input forwarding | +14 points main thread while scrolling | cef-zen-feel / webkit-feel | Coalesce wheel deltas per refresh tick (one `scroll` message per frame), reuse the JSON buffer. |
| 6 | Engine start-up on switch | 450–550 ms (host) vs ~50 ms parent | cef-zen-feel / webkit-feel | Pre-spawn + `hello` a warm host at idle (or on tab hover); keep one spare WPE web process. |
| 7 | WebKit key latency | +7 / +16 ms vs Gecko (1× / 2×), all in WPE | webkit-feel / webkit-host | Profile WPEWebProcess (≈ 180 % CPU in rAF at 2×) — software paint dominates; GPU path on real hardware. |
| 8 | Measurement harness | 2.4–7.3 points | engine-bench / anyone citing CPU numbers | Quote `raf-nosampler` (or lower the sampler to rAF-driven sampling) when comparing parent CPU. |

## Verified vs NOT_VERIFIED

- PASS (run 39379600003, 39363370750): everything in the tables above; WebKit sandbox
  (bubblewrap) and CEF SUID sandbox on; TEST-ONLY pieces: Marionette harness, chrome overlay,
  hooks, `layout.css.devPixelsPerPx=2` for 2× windows.
- NOT_VERIFIED: GPU machines (all numbers are software WebRender on 4-vCPU runners); macOS;
  per-frame native apply timing for Chromium (counters only); host-internal attribution
  (inside CEF/WPE processes — only their total CPU is measured here).

## Runs

| run | what | result |
| --- | --- | --- |
| 39379600003 | linux-engine-profile, current defaults (memfd + native receiver), 1×/2×, Gecko / Chromium / WebKit + Gecko debian control | all jobs success |
| 39363370750 | same, EngineFrameSurface path before perf-phase2 (app 39346931130) | all jobs success |
| 39340307459 … 39341862039 | earlier iterations (claude/engine-profile-nipd8o) | superseded |
