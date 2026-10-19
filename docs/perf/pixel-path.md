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

(filled in from linux-perf runs; see "Runs")

## Next step: Linux shared-memory frame transport (design)

Goal: no pixel bytes through the pipe and **no JS pixel work**, the Linux analogue of the
macOS IOSurface path. Reuses the platform-neutral Gecko hook the mac path already patches in
(`HTMLCanvasElement::SetAxioExternalImageContainer`, patches/zen/firefox-native.json: frames
reach WebRender through the ImageBridge without the main thread).

- **Receiver** (new, Linux-only XPCOM, `apps/browser/native/engine-view/linux/`,
  `moz.build` branch `MOZ_WIDGET_TOOLKIT == "gtk"`, same IDL shape as
  `nsIAxioEngineSurfaceService`): `createEndpoint()` returns a one-shot Unix socket path in the
  session runtime directory (0700) plus a single-use token, `expectHostPid(pid)` (SO_PEERCRED
  check), `bindCanvas(canvas, target)`.
- **Hello** (additive, engine-stream-v1 §6.3 / cef-v1): `frame_transport:"shm"`,
  `shm_socket`, `shm_token`. The host connects, authenticates with the token, and passes one
  `memfd` (sealed `F_SEAL_SHRINK|F_SEAL_GROW`, sized 3 × max frame) with `SCM_RIGHTS`.
- **Frames**: the host renders into ring slot *k*, then sends `{slot, frame_id, target,
  width, height, damage}` over the socket (or the AXCF pipe as a kind-3 item); the receiver's
  IO thread maps the slot read-only, wraps it as `gfx::DataSourceSurface` (B8G8R8A8 —
  premultiplied BGRA is Gecko's native format, so **no swizzle at all**), sets it on the
  canvas's `ImageContainer` and returns the slot (`release {slot}`) once the compositor has
  uploaded it. Credit = free slots (2 in flight), so the host never blocks on a vsync.
- **Fallback**: the pipe path above stays the default and the fallback (pref
  `axiosozo.engines.linux.shm_frames`, default false until measured), exactly as the mac path
  falls back to the pipe when the engine-view component is absent.
- **Security**: the socket lives in the private session directory, accepts one connection from
  the expected PID with the token, the memfd is sealed and mapped read-only in Zen; the host
  sandboxes are unchanged.
- **Cost model** (from the numbers above): removes the Subprocess transfer of 2.3 MB (1×) /
  9.4 MB (2×) per frame and the JS conversion; leaves one ImageBridge upload per frame in
  software WebRender (a `memcpy`-class copy off the main thread).

Status: design only (NOT_VERIFIED); needs a Zen rebuild (compiled Gecko code, ~20 min warm on
Actions via `linux-zen-reusable.yml`).

## Runs

| Run | What | Result |
| --- | --- | --- |
