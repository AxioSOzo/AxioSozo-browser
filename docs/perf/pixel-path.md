# Pixel path: engine host → pixels in Zen (Linux pipe path)

Owner: cloud/perf-pixel-path. Scope: how a Chromium (CEF) or WebKit (WPE) frame travels from
its host process into a Zen tab's chrome `<canvas>` on Linux, what it costs, and what was changed.
Software rendering only (GitHub runners have no GPU). Never E1/E2, never READY. The macOS
IOSurface path (contracts/engine-surface-v1, apps/browser/native/engine-view) is untouched:
in surface mode no frame reaches JS.

Measurements: `.github/workflows/linux-perf.yml` (results on `ci-results` under
`cloud_perf-pixel-path/<run>-1-<job>/`), methodology in docs/PERFORMANCE.md (cloud/engine-bench).

## The path before this work (cloud/integration 6c05cac)

1. Host renders BGRA (CEF OnPaint / WPE fdo SHM export) and copies it into its transport queue
   (one frame in flight, newest pending frame per target replaces older ones).
2. Writer thread writes AXCF: 16-byte header, JSON metadata, **the whole frame** (9.4 MB at
   1800×1300) into a **64 KiB** stdout pipe, even with `frame_damage` negotiated.
3. Zen reads it with Firefox `Subprocess` (`pipe.read(size)`). Subprocess's worker does one
   `read(2)` per poll wakeup into a fresh `ArrayBuffer` and posts each chunk to the main
   thread, which then asks for the rest: with a 64 KiB pipe that is ~145 worker round trips and
   chunk allocations per 2× frame, and a final main-thread concatenation copy.
   (toolkit/modules/subprocess: `subprocess_unix.worker.js` `readBuffer`, `subprocess_common.sys.mjs`
   `InputPipe.fillBuffer` / `checkPendingReads`.)
4. The presenter (`#draw`, synchronously before the `frame_ack`) converted BGRA → RGBA per byte
   (≈7 ms Firefox / 9 ms V8 per 1800×1300 frame) — CEF whole frame in place, WebKit damage rect
   into a new buffer — wrapped it in a new `ImageData` and called `putImageData`.
5. Only then was the ack written, so the host could not start sending the next frame while Zen
   painted.

## What changed

| # | Change | Where | Effect (mechanism) |
| --- | --- | --- | --- |
| 1 | **u32 swizzle** for opaque pixels, unpremultiply only for 0 < α < 255; byte-identical output | `EngineFrameSurface.sys.mjs` `convertBGRARect` | ≈2× faster conversion (V8 local: 12.8 → 6.0 ms per 1800×1300 frame; CI numbers below) |
| 2 | **One shared surface module** for both presenters: persistent `ImageData` per canvas, damage-rect conversion into it, `putImageData(image, 0, 0, x, y, w, h)` | `EngineFrameSurface` + `CEFPresenter#draw` / `WebKitPresenter#draw` | no per-frame allocation; work ∝ damage |
| 3 | **rAF-paced presentation**: frames are accepted (and acked) at once; conversion + upload happen once per refresh tick for the union of damage since the last paint; superseded frames cost nothing | `EngineFrameSurface.accept/paint` | ack no longer waits for paint (host pipelines the next frame); ≤ 1 upload per vsync; `supersededFrames` in diagnostics |
| 4 | **1 MiB stdout pipe** (`F_SETPIPE_SZ`, Linux, best effort ≤ `fs.pipe-max-size`) | `native/{chromium,webkit}-host/transport.hpp` | ~16× fewer Subprocess round trips per frame |
| 5 | **`damage_payload`** (additive hello key, needs `frame_damage`): the payload is only the damage rectangle's rows; Zen rebuilds the whole frame per target (`DamagePayloadAssembler`) before the presenter | contracts engine-stream-v1 §6.2, cef-v1; hosts; `CEFEngineAdapter`/`EngineStreamClient` readers | pipe bytes ∝ damage (rAF pages: host damage share 0.21–0.24 → ~4× fewer bytes) |
| 7 | **memfd frames** (EXPERIMENTAL, pref `axiosozo.engines.linux.memfd_frames`, default off): pixels in a sealed host memfd slot, read by Zen with one `IOUtils.read` of `/proc/<pid>/fd/<fd>` | contracts §6.3; host transports; adapters | no pixel bytes through the Subprocess pipe (see below) |
| 6 | Bench support: `zen_bench.py --device-scale` (TEST-ONLY `layout.css.devPixelsPerPx`), `bench.py --damage-payload`, same-job base/cand A/B (`tools/pixel-path/`) | tools | 2× in Zen measurable; A/B immune to runner variance |

Host-side coalescing was already in place and is kept: one frame in flight across the host,
the newest pending frame per target replaces the older one with merged damage (§6). With (3)
the ack returns right after the frame is read, so the host's rate is bounded by its own render
rate and the pipe, and Zen draws at most once per vsync. The 2× cap policy is unchanged and
matches Gecko's (`device_scale` = the window's `devicePixelRatio`, capped by the 4096 px /
32 MiB surface bound in `fitCEFRenderSurface` / `fitStreamSurface`).

Invariants kept: the presenter never sees a partial frame (the assembler applies every
delivered frame, presented or not, so §6.1's "previous frame delivered" stays the reference);
a partial payload without a whole frame of its target and size is a protocol error; macOS
never negotiates damage or payloads; no TLS, sandbox or isolation setting changes.

## Measurements

All in-Zen numbers: linux-perf run **39342063334**, same-job A/B on one runner per engine. Base =
cloud/integration `5f8b1d0` chrome JS + host; cand = this branch `9833f88`; memfd = cand with the
EXPERIMENTAL pref. The app is the prebuilt Linux Zen artifact (linux-zen-build run 39337785340,
`b14bad7`); chrome JS is overlaid per variant (TEST-ONLY `chrome-overlay`, labelled in every
result). 2× = TEST-ONLY `layout.css.devPixelsPerPx=2` on a 2304×1440 Xvfb screen, so the engine
surface is 837×632 CSS px at scale 2 (1674×1264 physical), close to the component bench's 2×.
Rounds alternate base/cand/memfd (2 rounds × 3 repetitions each); both rounds agree. Full tables:
`docs/perf/evidence/zen-ab-{chromium,webkit}-39342063334.md`. All 24 bench runs PASS.

### Inside Zen, Chromium tabs (AMD EPYC 7763)

| Metric (median, round 1 / round 2) | base | cand | memfd |
| --- | --- | --- | --- |
| 1× rAF presented fps | 42.6 / 42.9 | **59.0 / 59.0** | 59.0 / 58.7 |
| 1× rAF frame interval p99 | 38.5 / 39.5 ms | **19.0 / 20.8 ms** | 29.1 / 29.2 ms |
| 1× rAF CPU, whole browser | 159 / 159 % | **75 / 75 %** | 69 / 71 % |
| 1× key → presented frame | 29.1 / 28.8 ms | **19.9 / 18.6 ms** | 20.3 / 20.1 ms |
| 1× static page navigate → visible | 80 / 87 ms | 48 / 61 ms | 42 / 48 ms |
| 2× rAF presented fps | 10.5 / 10.3 | **58.0 / 57.6** | **59.0 / 59.0** |
| 2× rAF frame interval p99 | 125 / 125 ms | 31.1 / 30.6 ms | **22.0 / 21.8 ms** |
| 2× rAF CPU, whole browser | 165 / 165 % | 162 / 164 % (at 5.5× the fps) | 133 / 131 % |
| 2× presenter draw per frame | 6.35 / 6.21 ms | **3.54 / 3.68 ms** | 3.58 / 3.59 ms |
| 2× key → presented frame | 90.7 / 89.6 ms | **21.1 / 20.9 ms** | 18.7 / 21.0 ms |
| 2× static page navigate → visible | 254 / 282 ms | 77 / 87 ms | 67 / 48 ms |
| 2× Gecko → Chromium switch | 567 / 601 ms | 469 / 526 ms | 471 / 502 ms |

### Inside Zen, WebKit tabs (debian:13, AMD EPYC 9V74)

| Metric (median, round 1 / round 2) | base | cand | memfd |
| --- | --- | --- | --- |
| 1× rAF presented fps | 39.1 / 38.9 | **57.9 / 57.6** | 57.7 / 57.7 |
| 1× rAF frame interval p99 | 42.3 / 45.1 ms | **22.6 / 22.8 ms** | 24.2 / 22.8 ms |
| 1× rAF CPU, whole browser | 201 / 202 % | 123 / 125 % | **115 / 114 %** |
| 1× presenter draw per frame | 1.50 / 1.53 ms | 0.79 / 0.81 ms | 0.82 / 0.82 ms |
| 1× key → presented frame | 32.4 / 32.0 ms | **24.1 / 23.7 ms** | 24.4 / 24.6 ms |
| 2× rAF presented fps | 6.0 / 6.0 | 48.7 / 48.8 | **56.6 / 56.6** |
| 2× rAF frame interval p99 | 220 / 209 ms | 47.3 / 37.8 ms | **33.0 / 30.9 ms** |
| 2× rAF CPU, whole browser | 302 / 303 % | 330 / 331 % (at 8× the fps) | 306 / 306 % |
| 2× presenter draw per frame | 8.91 / 8.55 ms | **3.73 / 3.76 ms** | 4.07 / 4.02 ms |
| 2× key → presented frame | 98.2 / 98.4 ms | **29.5 / 29.8 ms** | 29.8 / 30.2 ms |
| 2× static page navigate → visible | 215 / 256 ms | 87 / 105 ms | **67 / 70 ms** |

Reading the tables:

- At 1× the pipe path alone (u32 swizzle, rAF pacing, early ack, 1 MiB pipe, damage payload)
  takes both engines to the display rate with p99 ≈ 20 ms and halves the browser's CPU; memfd
  adds little there (frames are 2.3 MB and mostly 24 % damage).
- At 2× the base path was transport-bound (10 fps Chromium / 6 fps WebKit with p99 > 120 ms,
  key → frame 90–98 ms). The candidate presents 58 / 49 fps; **memfd** brings WebKit to 56.6 fps
  and Chromium's p99 to 22 ms, with less CPU per frame (both stay CPU-saturated on 4 vCPUs in
  software rendering, so total CPU % is flat while fps rises 5–9×).
- Presenter draw at 2×: 6.3 → 3.6 ms (Chromium) and 8.7 → 3.7 ms (WebKit) per frame; at 1×
  1.6 → 1.15 ms / 1.5 → 0.8 ms.
- Wheel scroll windows are rows of the bench too (up to +600 %) but are dominated by the known
  xdotool pacing artefact (docs/PERFORMANCE.md bottleneck 3); not claimed.
- Memory: unchanged within noise (RSS −0…−9 %).
- Not measured: GPU machines, macOS (surface path untouched), multi-tab.

### Component and presenter benches

- Presenter same-process A/B (`presenter` job, run 39342063334, Firefox 157, 1800×1300, identical
  output): full draw 12.42 → 7.04 ms; `bgraToRGBA` 10.74 → 5.60 ms; EngineFrameSurface paint of a
  10 % damage band 0.90 ms. Chrome 155 and V8 the same direction (run 39340129366: Chrome full draw
  15.07 → 7.62 ms, V8 11.57 → 4.77 ms).
- CEF host alone at 2× (`docs/perf/evidence/component-chromium-39340129366-vs-39330954155.md`):
  client read 15.6 → 4.4 ms (1 MiB pipe) → 0.43 ms (+damage_payload), bytes/frame 9.36 → 2.21 MB,
  client CPU 81 → 26 → 4.9 %, key → frame 17.0 → 7.1 → 2.0 ms.
- WPE host alone at 2×, same CPU model (`docs/perf/evidence/component-webkit-39342063334-vs-39330954155.md`):
  rAF 46.2 → 58.0 fps, p99 36.3 → 20.0 ms, client read 17.3 → 6.6 → 1.2 ms, client CPU 73.7 → 31.8 →
  9.5 %, key → frame 35.5 → 21.8 ms.

## memfd frames (implemented, EXPERIMENTAL, pref-gated)

engine-stream-v1 §6.3, pref `axiosozo.engines.linux.memfd_frames` (default **false**). No Gecko
rebuild: chrome JS + both hosts.

- Host: one sealed `memfd` ring (2 slots × 32 MiB virtual; only touched pages are resident),
  `MFD_CLOEXEC` so CEF/WPE helpers never inherit it. The writer thread copies each frame (or,
  with `damage_payload`, the compacted damage rows) into the next slot and writes an AXCF frame
  with **no payload**, metadata `+{slot, payload_bytes}`. `ready.capabilities.memfd = {fd,
  slot_bytes, slots}`.
- Zen: `IOUtils.read("/proc/<host pid>/fd/<fd>", {offset, maxBytes})` — one positioned read on
  IOUtils' background thread, then the same `DamagePayloadAssembler` / `EngineFrameSurface`
  path. The read completes before the frame's `frame_ack`; with one frame in flight the ack is
  the slot's reuse barrier. The pid is Zen's own direct child (Subprocess), the fd number comes
  only from the authenticated ready event; `/proc/<pid>/fd` needs ptrace-read access (same uid,
  dumpable) — granted for a direct child under Yama scope 1.
- Pipe bytes per frame: ~200 bytes of metadata instead of 2.3 MB (1×) / 9.4 MB (2×).
- Fallback: the pipe path is the default; a host that cannot create the ring rejects the hello.
- Verified: `native/chromium-host/tests/transport_memfd_test.cc` (parent reads slots through
  /proc exactly like Zen), WebKit core `memfd` scenario (fake host, rebuilt frame byte-identical
  to a forced whole frame), adapter tests (slot read before ack, refusal of hosts without the
  ring, never on macOS). In-Zen: linux-perf A/B variant `memfd`.

### Still open: no JS pixel work at all

Two further steps, in order of cost:

1. **Off-main-thread conversion (no Gecko rebuild)**: a ChromeWorker with
   `IOUtils.openFileForSyncReading` + `SyncReadFile.readBytesInto` reads the slot into a persistent
   buffer, converts the damage into a persistent `ImageData` and draws into the presenter canvas
   through `transferControlToOffscreen()`; the main thread only validates metadata and acks.
   Blocker to solve first: `captureFixtureFrame()` uses `canvas.toDataURL`, which an offscreen-
   controlled canvas refuses (the GUI/E2E evidence harness depends on it) — it would move to
   `OffscreenCanvas.convertToBlob` in the worker.
2. **Native receiver (Gecko rebuild)**: a Linux-only XPCOM component under
   `apps/browser/native/engine-view/linux/` (`moz.build` branch `MOZ_WIDGET_TOOLKIT == "gtk"`,
   IDL shape of `nsIAxioEngineSurfaceService`) maps the memfd read-only and, on its own thread,
   copies the slot into a `gfx::DataSourceSurface` (`SurfaceFormat::B8G8R8A8` — premultiplied
   BGRA is Gecko's native format, **no swizzle**) wrapped in a `layers::SourceSurfaceImage` and
   set on an async `ImageContainer` bound with the already patched, platform-neutral
   `HTMLCanvasElement::SetAxioExternalImageContainer` (patches/zen/firefox-native.json). Frames
   then reach WebRender through the ImageBridge without the main thread, like the macOS
   IOSurface path's copy mode. Generation holding (frames of a newer document held until chrome
   processed the navigation) must mirror `AxioEngineEndpoint::setTargetGenerations`.

### Native prototype numbers (session machine, not a runner)

`tools/pixel-path/shm_proto.cc`, evidence `docs/perf/evidence/shm_proto-session-20261019.jsonl`
(Intel Xeon @ 2.80 GHz, 4 vCPU; receiver ends with the whole frame in its memory; the pipe
receiver models Subprocess: one `read(2)` per wakeup into a fresh buffer, then one concatenation;
it omits Subprocess's worker→main-thread message hop, so real Zen costs are higher):

| 1800×1300 frame | receive ms (median) | receiver CPU ms/frame | wakeups/frame |
| --- | --- | --- | --- |
| pipe, 64 KiB (before) | 15.5 | 10.5 | 143 |
| pipe, 1 MiB | 6.8 | 4.5 | 9 |
| pipe, 64 KiB, damage payload 24 % | 2.5 | 1.5 | 36 |
| pipe, 1 MiB, damage payload 24 % | 1.3 | 1.0 | 3 |
| memfd ring, whole frame | 1.36 | 1.4 | 1 |
| memfd ring, 24 % damage | 0.24 | 0.29 | 1 |

At 900×650: 64 KiB pipe 2.7 ms / 36 wakeups → 1 MiB 1.2 ms / 3 → memfd 0.17 ms / 1. The 64 KiB
2× figure (15.5 ms) matches the component bench's measured client read time (15.6 ms, run
39330954155), which supports the model.

## Runs

| Run | What | Result |
| --- | --- | --- |
| 39342063334 | linux-perf at 9833f88: presenter A/B, component benches (both engines, 3 passes), in-Zen A/B base/cand/memfd at 1×/2× | all green; tables above |
| 39340129366 | linux-perf at 6e08ff3: presenter A/B, CEF component bench; A/B harness bugs (fixed in d8c923c); cancelled after the component job | partial, used for the CEF component table |
| 39341140946, 39342063401 | linux-cef-host at 3137181 / 9833f88: x86_64 + arm64 every gate PASS (E0, stream, security, input, web, damage, native tests incl. damage-payload and memfd); `zen-gui-chromium` setup step fails on the known `probe.py check` exit code (also on cloud/integration) | PASS |
| 39341141004, 39342063286 | linux-webkit-host at 3137181 / 9833f88: real WPE unit + stream + input + security + cleanup; damage_payload and memfd scenarios byte-identical to a forced whole frame | PASS |
| 39341141669, 39342063487 | linux-webkit-zen at 3137181 / 9833f88: unit, adapter, E2E (launch, chrome, Gecko→WebKit→Gecko round trip, host failure, three engines) | E2E PASS |
| 39340175745 | Linux check and test (PR #10) | green |

# Phase 2 (cloud/perf-phase2)

Owner: cloud/perf-phase2 (PR #14). Same rules as above: software rendering on GitHub runners,
same-job A/B, never E1/E2, never READY; macOS surface path untouched.

## memfd fallback, soak, default on

- **Fallback** (contracts engine-stream-v1 §6.3 "Fallback"): before the hello Zen lists
  `/proc/<host pid>/fd` (the same ptrace-read access a slot read needs); if that fails it asks for
  the pipe and latches the session. A slot read that fails twice (one retry) drops that frame,
  forgets its target's assembled frame and acknowledges it with
  `frame_ack {frame_id, frame_transport:"pipe"}`: the host switches its writer to the pipe before
  the credit returns, makes every pending frame whole (CEF) or re-sends every target whole
  (WebKit, from its `latest` copy), and CEF repaints every view. Tests: node (both readers),
  `native/chromium-host/tests/transport_memfd_test.cc` (fallback scenario),
  `native/chromium-host/damage_test.py` (real CEF: 8 memfd frames, frame 9 dropped, the next pipe
  frame whole 1800×1300, then 80×80 damage payloads — run 39351072238), WebKit
  `stream_test.py` `memfd_fallback` (real WPE in linux-webkit-host 39349713944: PASS).
- **Soak** (`tools/pixel-path/soak.py`, linux-perf job `soak`, debian:13, one Zen window with a
  WebKit tab, a Chromium tab and a Gecko tab; each cycle: rAF window, XTest wheel window, static
  navigation, key → frame, Gecko rAF), run **39349238042**:

  | | cycles / min | rAF fps WebKit / Chromium / Gecko | rAF p99 ms | scroll fps WK / Cr | key → frame ms WK / Cr | parent CPU % WK / Cr | problems |
  | --- | --- | --- | --- | --- | --- | --- | --- |
  | memfd | 30 / 10 | 56.4 / 57.5 / 59.0 | 34.9 / 34.3 | 51.6 / 55.5 | 21.6 / 16.6 | 131 / 142 | none |
  | pipe | 13 / 4 | 56.7 / 58.4 / 59.0 | 35.2 / 33.3 | 48.0 / 50.9 | 20.5 / 15.8 | 133 / 146 | none |

  memfd: no fallback, transport stayed memfd in every window, WebKit host descriptors 38 → 38,
  Chromium host 333–339; the hosts' RSS flat (WPEWebProcess 256 MB, CEF renderer ~250 MB); the
  Zen parent's RSS oscillates 690–1104 MB with GC (per-frame slot buffers) without a trend
  beyond that band. These medians are also the **multi-tab** numbers (2 engine tabs + 1 Gecko
  tab in one window, 1×).
- **Default**: `MEMFD_FRAMES_DEFAULT = true` (Linux pipe mode only; macOS never negotiates it).

## Scroll fps is claimable now

`zen_bench.py` injects wheel clicks with XTest (`XTestWheel`, ctypes libXtst) on the monotonic
clock, flushed per event, and records the pacing (`input_pacing`: span, interval p99, late events).
`xdotool click --repeat 120 --delay 16` had taken 17 s instead of 1.9 s from the second window on
(docs/PERFORMANCE.md bottleneck 3). The soak's 60 scroll windows per transport all had a 1.9 s
input span.

## Upload without the JS swizzle: BGRX VideoFrame

`EngineFrameSurface` uploads with `drawImage(new VideoFrame(rows, {format: "BGRX"}))` where the
window draws BGRX VideoFrames exactly (probed once per process on a 3×2 scratch canvas), else the
JS swizzle + `putImageData` (pref `axiosozo.engines.linux.frame_upload=imagedata`). Whole damaged
rows from a `Uint8Array` view of the frame (no JS copy): Gecko 156's
`dom/media/webcodecs/VideoFrame.cpp` ignores `VideoFrameBufferInit.layout` and assumes a tight
stride, so a narrower rectangle cannot be described without a copy.

## Off the main thread: frame worker and native receiver

Both implement one "sink" per native target (applyFrame / bindCanvas / present), chosen by the
readers in this order, with the main-thread JS path as the fallback:

1. **Native receiver** (pref `axiosozo.engines.linux.native_receiver`, needs an app built from this
   branch, `.github/workflows/linux-perf-build.yml`): `apps/browser/native/engine-view/linux`
   (`nsIAxioFrameReceiverService`, GTK only) maps the host's ring read-only (direct child only,
   exact size, seals checked); a background task queue copies each delivered frame's rows into the
   target's whole frame, and each presented frame into a recycled B8G8R8X8 `SharedRGBImage` set on
   the canvas's async `ImageContainer` (`HTMLCanvasElement::SetAxioExternalImageContainer`, the
   platform-neutral patch the macOS path already uses). No pixel crosses JS, no swizzle, and the
   frame reaches WebRender through the ImageBridge. Capture: `copyFrame()` → PNG.
2. **Frame worker** (pref `axiosozo.engines.linux.frame_worker`): one ChromeWorker per target
   (`EngineFrameWorker.js` loads `runFrameWorker` from EngineFrameSurface into its own global)
   opens the memfd with `IOUtils.openFileForSyncReading`, reads slots with `readBytesInto` into a
   persistent buffer (no per-frame allocation), keeps the whole frame and draws into the presenter
   canvas through `transferControlToOffscreen()`. The main thread validates metadata, posts and
   acks. After a memfd fallback it also takes the pipe payloads. Capture: Gecko's placeholder
   snapshot (`toDataURL`).
