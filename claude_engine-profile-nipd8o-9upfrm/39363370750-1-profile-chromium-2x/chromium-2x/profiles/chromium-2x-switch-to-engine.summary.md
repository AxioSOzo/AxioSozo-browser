### chromium-2x switch-to-engine (profile pass)

**parent pid 3347** — 289 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 121 | 21.3 | JavaScript 33, Layout 28, Idle 23, GC / CC 14 | 6 / 53 / 62 | ipc 121, paint_layout 46, gc_cc 45, worker_messaging 41 |
| Renderer | 78 | 13.9 | Graphics 75, Idle 4 | 0 / 0 / 78 | ipc 78, webrender_render 75, webrender_sw_raster 68, poll_wait 4 |
| DOM Worker | 67 | 11.8 | JavaScript 58, Profiler 6, Idle 2, GC / CC 1 | 0 / 0 / 67 | subprocess_pipe_io 67, worker_messaging 64, ipc 64, js_ctypes 46 |
| SwComposite | 7 | 1.2 | Other 7 | 0 / 0 / 7 | webrender_render 7, poll_wait 6, webrender_sw_raster 1, memcpy_memset 0 |
| WRRenderBackend#0 | 6 | 1.0 | Other 6 | 0 / 0 / 6 |  |
| Compositor | 5 | 0.8 | Idle 4, Other 0 | 0 / 0 / 5 | ipc 5, poll_wait 4 |
| WRSceneBuilder#0 | 4 | 0.7 | Other 4 | 0 / 0 / 4 | webrender_scene 4 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 23; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 6; `style::properties::cascade::iter_declarations [libxul.so]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `__memmove_avx_unaligned_erms [libc.so.6]` 5; `cssparser::parser::Parser::parse_entirely [libxul.so]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 3

**tab pid 4001** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.7 | Idle 4 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4

**tab pid 3512** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Other 0, Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3538** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

