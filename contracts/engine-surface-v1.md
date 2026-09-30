# Engine surface transport v1 (Mach + IOSurface)

Engine-neutral, zero-copy-to-Zen frame delivery from an out-of-process engine host
(CEF today, WebKit later) to the Zen/Gecko native presenter on macOS. The binary
layout is defined in C by `native/chromium-host/engine_surface_v1.h`; this document
is normative for semantics. Control, input, lifecycle and navigation stay on the
engine's authenticated JSON pipe (for CEF: [cef-v1](cef-v1.md)). Only frames,
frame releases and begin-frame ticks use Mach. A PASS of the standalone receiver
(`native/chromium-host/surface_test.py`) proves the native component and wire
protocol only; it is never E1/E2 evidence inside Zen.

## Roles and setup

1. **Zen (native component, in the process that spawns the host)** creates a receive
   right with `bootstrap_check_in(bootstrap_port, name, &port)` under a fresh random
   name (recommended `dev.axiosozo.surface.<32 hex>`; allowed characters
   `[A-Za-z0-9._-]`, 8..127 bytes), and sets its queue limit to
   `MACH_PORT_QLIMIT_LARGE` (at least `3 × max_targets + 1`, i.e. ≥ 97 for CEF).
   It generates a one-time 256-bit `surface_token` distinct from the pipe token.
2. Zen spawns the host and sends, **only** in the authenticated stdin `hello`
   (never argv, environment, files or logs), the extra keys:
   - `surface_service`: the bootstrap name;
   - `surface_token`: 64 hex characters;
   - optional `surface_begin_frames: true` (external begin frames, see below);
   - optional `frame_rate`: `60` (default) or `120` (ProMotion). Also valid without
     `surface_service`, where it sets the pipe fallback's paint rate.
   `surface_service` and `surface_token` come together; unknown keys still fail.
3. The host, before starting the engine, `bootstrap_look_up`s the name, allocates a
   private reply receive right and sends **CONNECT** to Zen's port: raw 32-byte
   token, `host_pid`, and a send right to the reply port (`MAKE_SEND`, received as
   `MACH_MSG_TYPE_PORT_SEND`).
4. Zen accepts exactly one CONNECT: exact size, one port descriptor, magic/version,
   constant-time token comparison, and audit-trailer pid (`MACH_RCV_TRAILER_AUDIT`)
   equal to the child pid it spawned (also equal to `host_pid`). Any other CONNECT
   is destroyed (`mach_msg_destroy`) and ignored; after acceptance the token is
   void. Zen then sends **CONNECTED** to the reply port.
5. The host waits at most 5 s for CONNECTED, requiring the audit pid to equal
   `getppid()`. Timeout or any mismatch exits the host with code 64 before the
   engine starts (tested: `negative-no-connected`). There is no reconnect.

The ready event then reports `render_path:"native-osr-iosurface"` and capabilities
`surface:true`, `external_begin_frame:<bool>`, `frame_rate:<int>`. Without
`surface_service` everything is unchanged: `render_path:"native-osr-bgra"` and
AXCF pipe frames.

## Messages

All integers are native little-endian (both ends are the same arm64 Mac). Message
sizes are exact; receivers reject other sizes. `magic = 0x46535841` ("AXSF"),
`version = 1`.

| msgh_id | Name | Direction | Rights | Body |
| --- | --- | --- | --- | --- |
| 0x41585301 | CONNECT | host → Zen port | 1 port descriptor: send right to host reply port | magic, version, token[32], host_pid |
| 0x41585302 | CONNECTED | Zen → reply port | none | magic, version |
| 0x41585310 | FRAME | host → Zen port | 1 port descriptor: IOSurface send right (`IOSurfaceCreateMachPort`, sent `MOVE_SEND`) | see below |
| 0x41585320 | RELEASE | Zen → reply port | none | magic, version, native_target_id u64, frame_id u64 |
| 0x41585321 | BEGIN_FRAME | Zen → reply port | none | magic, version, native_target_id u64, sequence u64, frame_time u64 (mach_absolute_time of vsync), interval_ns u64 |

FRAME body (`axio_surface_frame_body_t`, 232 bytes): `native_target_id`,
`document_generation`, `navigation_generation` (the target's values when the frame
was painted), `frame_id` (host-global, strictly increasing, gaps allowed),
`paint_time` and `send_time` (`mach_absolute_time`), `begin_frame_sequence` (last
BEGIN_FRAME applied to the target, 0 with internal pacing), physical `width`,
`height`, logical `logical_width`, `logical_height`, `device_scale` (double),
`format` (1 = BGRA8, premultiplied alpha, sRGB-tagged IOSurface), `surface_id`
(diagnostic only), `flags` (bit0 = a popup widget is composited into this frame),
`dirty_count` (0..8; 0 = whole frame) and `dirty[8]` rectangles in physical pixels
relative to the previous frame **sent for that target**.

`native_target_id` is the decimal JSON `native_target_id` of cef-v1 as u64. Zen
matches frames to the current BrowserTarget by id **and** both generations and
discards (then releases) frames of stale generations, exactly like AXCF frames.

## Frame lifetime and backpressure

- Zen, on FRAME: validate size/descriptor/magic, `IOSurfaceLookupFromMachPort`, then
  `mach_port_deallocate` the port; verify the IOSurface's width, height and pixel
  format `'BGRA'` equal the metadata; present it (e.g. as `CALayer.contents` or a
  Metal texture). IOSurfaces are never sent to web content.
- Zen sends RELEASE for a frame once nothing reads it any more, typically when the
  next frame for that target has been committed to the screen (present-then-release),
  or immediately for discarded/stale frames. After RELEASE the host may overwrite it.
  Zen may keep its IOSurface reference longer; it must not read it after RELEASE.
- The host owns a ring of 3 IOSurfaces per target, so at most 3 frames per target
  are in flight. If none is free, the paint is dropped and the host requests a
  refresh as soon as a RELEASE arrives; the next frame then reports a full dirty
  area. A ring surface that `IOSurfaceIsInUse` (e.g. still on screen) is skipped even
  after RELEASE. Resize reallocates ring surfaces lazily as they become free.
- RELEASE for a frame not in flight on a live target, unknown/complex messages,
  messages carrying rights, and messages whose audit pid is not the host's parent are
  protocol errors: the host emits `error {code:"surface_failed", reason}` on the pipe
  and exits 64 (tested: `negative-bogus-release`). RELEASE for an already-closed
  target is ignored if that frame id was issued.
- The host sends with a zero timeout. Because Zen's queue limit exceeds the maximum
  frames in flight, a full queue is a Zen protocol violation and fails the channel
  (`surface_queue_full`); the engine UI thread never blocks on Zen.

## Pacing

- **Internal** (default): the engine paces itself at `frame_rate` (CEF:
  `windowless_frame_rate`, which also sets its compositor vsync interval and the
  capture period).
- **External** (`surface_begin_frames:true`): the engine produces frames only on
  BEGIN_FRAME. Zen sends one tick per display refresh (CVDisplayLink /
  `CADisplayLink`) for every target that is visible **or awaiting its first frame**,
  with a strictly increasing `sequence` per target. Hidden targets receive no ticks
  (they are also `visibility:false` on the pipe). Replayed or non-increasing
  sequences are protocol errors; ticks for unknown targets are ignored. `frame_rate`
  should equal the tick rate: CEF's capture period still limits delivery. When a
  window moves to a display with another refresh rate, Zen renegotiates per target
  with the cef-v1 `frame_rate` command.
  BEGIN_FRAME when external pacing was not requested is a protocol error.

## Security properties

- The service name and token travel only over the authenticated private pipe.
  The token is single-use and distinct from the pipe token; the reply port's only
  send right is given to Zen's checked-in port, and each side additionally checks
  the peer pid from the kernel audit trailer.
- Mach port rights are per task: `posix_spawn`/`exec` does not transfer port rights
  except task special ports (bootstrap, exception ports) explicitly set by the
  spawner. The host's service lookup, reply port and IOSurface ports are ordinary
  rights, and the name is never in argv/env, so Chromium helpers cannot inherit or
  look them up (their sandbox also denies arbitrary `mach-lookup`). This is by
  construction; `lsmp` cross-task inspection needs root and was not run.
- Engine helpers built from the same source compile inert stubs and link neither
  Metal nor IOSurface (verified with `dyld_info -dependents`).
- Frames never contain page-controlled pointers; all sizes are bounded (1..4096 px
  per dimension, so at most 64 MiB per BGRA surface and 3 in flight per target; 32
  targets, 8 dirty rects). 4096 px is a quarter of the 16384 px Metal 2D-texture
  limit on Apple silicon. The engine pipe's 32 MiB frame cap does not apply here.

## CEF 154 implementation notes (pinned 154.0.23 / 062ebe4)

Research behind the host implementation; paths relative to the CEF/Chromium trees.

- `shared_texture_enabled` works on macOS although `include/internal/cef_types_mac.h:133-135`
  still says "Currently only supported on Windows": `libcef/browser/osr/video_consumer_osr.cc:178-185`
  fills `shared_texture_io_surface` from the GPU memory buffer handle's IOSurface,
  and `browser_platform_delegate_create.cc:112-119` passes both window-info flags to
  the OSR view; popups inherit them (`web_contents_view_osr.cc:110-124`).
- Both OSR paths use viz `FrameSinkVideoCapturer` when GPU compositing is enabled
  (`render_widget_host_view_osr.cc:427-435`); shared textures request
  `kPreferMappableSharedImage` (`video_consumer_osr.cc:49-59`). The capturer pool
  holds `kDesignLimitMaxFrames + 1 = 11` buffers
  (`frame_sink_video_capturer_impl.h:174-179`). `Done()` runs when
  `OnFrameCaptured` returns (`video_consumer_osr.cc:96`), returning the IOSurface to
  the pool, as the header demands (`include/cef_render_handler.h:152-173`). Hence
  the host copies every frame on the GPU (Metal blit, awaited) into its own ring
  before returning; forwarding CEF's IOSurface would race viz reuse.
- Completeness: capture blits set `populates_mappable_shared_image=true`
  (`frame_sink_video_capturer_impl.cc:1135-1143`), so the result is delivered only
  after the GPU work finished (`skia_output_surface_impl_on_gpu.cc:1062-1069`). The
  pooled IOSurface is complete when `OnAcceleratedPaint` runs.
- Format: BGRA for ARGB with mappable shared images on macOS
  (`frame_sink_video_capturer_impl.cc:85-96`, `video_consumer_osr.cc:128-133`).
- Dirty rects: CEF passes exactly one rect, the capture update rect relative to the
  previous capture counter, or the full frame (`video_consumer_osr.cc:98-120`,
  `render_widget_host_view_osr.cc:1653-1690`); the capturer still blits the whole
  frame (`frame_sink_video_capturer_impl.cc:1137-1138` TODO). The host forwards the
  rect only when the capture counter is contiguous with the last frame it sent.
- Frame rate: `osr_util.cc:17-23` clamps only values below 1 (default 30); there is
  no upper clamp. `SetFrameRate` applies it once to the compositor vsync and the
  capture period (`render_widget_host_view_osr.cc:1702-1730`).
- External begin frames: `SendExternalBeginFrame` ignores a tick while one is
  pending, uses `BeginFrameArgs::DefaultInterval()` and forwards to a visible popup
  (`render_widget_host_view_osr.cc:1182-1217`).
- Hidden views never paint (`render_widget_host_view_osr.cc:1660`). Invalidate
  requests a refresh capture (`render_widget_host_view_osr.cc:1891-1896`).
- Device-scale changes: new-size frames arrive after the first compositor frame at
  the new size; old-size captures are dropped by the host's size check.
