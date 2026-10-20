### gecko scroll (profile pass)

**parent pid 2850** — 1111 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 712 | 34.4 | Graphics 648, Idle 63, Other 1 | 0 / 0 / 712 | ipc 698, webrender_render 648, webrender_sw_raster 584, poll_wait 66 |
| GeckoMain | 149 | 7.2 | Idle 83, Other 24, Graphics 22, Layout 9 | 1 / 5 / 143 | ipc 149, poll_wait 134, paint_layout 34, harness_diagnostics 5 |
| WRRenderBackend#0 | 103 | 5.0 | Other 103 | 0 / 0 / 103 | webrender_render 4, memcpy_memset 3, webrender_sw_raster 1, poll_wait 0 |
| SwComposite | 68 | 3.3 | Other 68 | 0 / 0 / 68 | webrender_render 68, poll_wait 58, memcpy_memset 10, webrender_sw_raster 10 |
| Compositor | 37 | 1.8 | Idle 36, Other 1, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 36, paint_layout 0, webrender_render 0 |
| WRSceneBuilder#0 | 27 | 1.3 | Other 27 | 0 / 0 / 27 | webrender_scene 27, webrender_render 3, paint_layout 0 |
| IPC I/O Parent | 10 | 0.5 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 85; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 8; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 3; `__strnlen_evex [libc.so.6]` 2; `[libgtk-3.so.0]` 2; `sendmsg [libc.so.6]` 2; `writev [libc.so.6]` 2; `recvmsg [libc.so.6]` 2

**tab pid 3112** — 155 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 134 | 6.5 | Idle 77, Graphics 26, Other 12, JavaScript 7 | 1 / 6 / 127 | ipc 126, poll_wait 79, paint_layout 39, harness_diagnostics 3 |
| IPC I/O Child | 19 | 0.9 | Idle 19, Other 0, Profiler 0 | 0 / 0 / 19 | poll_wait 19, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 76; `[]` 6; `sendmsg [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1; `style::color::convert::hsl_to_rgb [libxul.so]` 1

**tab pid 3182** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3187** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

