### chromium-2x switch-to-gecko (profile pass)

**parent pid 3115** — 95 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 28.7 | GC / CC 14, Layout 13, JavaScript 9, Idle 6 | 0 / 18 / 30 | ipc 47, gc_cc 19, paint_layout 15, array_buffer_copy 7 |
| Renderer | 29 | 17.3 | Graphics 28, Idle 1 | 0 / 0 / 29 | ipc 29, webrender_render 28, webrender_sw_raster 28, poll_wait 1 |
| DOM Worker | 7 | 3.9 | JavaScript 6, Idle 0 | 0 / 0 / 7 | subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 6 |
| BgIOThreadPool #1 | 4 | 2.3 | Other 4, Idle 0 | 0 / 0 / 4 | ipc 4, poll_wait 0 |
| SwComposite | 4 | 2.3 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| WRRenderBackend#0 | 1 | 0.8 | Other 1 | 0 / 0 / 1 |  |
| WRSceneBuilder#0 | 1 | 0.7 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |
| Compositor | 1 | 0.6 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[axiosozo-dev]` 3; `Gecko_CopyConstruct_nsStyleBackground [libxul.so]` 3; `mozilla::ReflowInput::ReflowInput(nsPresContext*, mozilla::ReflowInput` 2; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `nsDiscriminatedUnion::Cleanup() [libxul.so]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 2

**tab pid 3772** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.6 | Idle 2, Layout 1, Profiler 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, memcpy_memset 1, paint_layout 1 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `js::BaseShape::get(JSContext*, JSClass const*, JS::Realm*, JS::Handle<` 0

**tab pid 3207** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3777** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

