### chromium raf (profile pass)

**parent pid 4064** — 1949 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 929 | 29.4 | Idle 344, JavaScript 266, GC / CC 125, Other 100 | 75 / 323 / 531 | ipc 929, poll_wait 380, gc_cc 326, worker_messaging 294 |
| DOM Worker | 462 | 14.7 | JavaScript 429, Other 19, Profiler 8, GC / CC 6 | 0 / 0 / 462 | subprocess_pipe_io 462, worker_messaging 462, ipc 462, js_ctypes 370 |
| Renderer | 235 | 7.5 | Idle 128, Graphics 108, Other 0 | 0 / 0 / 235 | ipc 235, poll_wait 135, webrender_render 108, webrender_sw_raster 86 |
| SwComposite | 180 | 5.7 | Other 180 | 0 / 0 / 180 | webrender_render 180, poll_wait 152, webrender_sw_raster 26, memcpy_memset 2 |
| WRRenderBackend#0 | 64 | 2.0 | Other 64 | 0 / 0 / 64 | webrender_render 1 |
| Compositor | 36 | 1.1 | Idle 34, Other 2, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 34, webrender_render 1, webrender_scene 0 |
| Timer | 29 | 0.9 | Other 29, Profiler 0 | 0 / 0 / 29 | ipc 29, poll_wait 29, memcpy_memset 0 |
| WRSceneBuilder#0 | 12 | 0.4 | Other 12 | 0 / 0 / 12 | webrender_scene 12 |

Main thread, top self: `poll [libc.so.6]` 348; `__memmove_avx_unaligned_erms [libc.so.6]` 122; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 63; `[unknown]` 21; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 18; `mprotect [libc.so.6]` 14; `[axiosozo-dev]` 12; `__memset_avx2_unaligned_erms [libc.so.6]` 12

**tab pid 4741** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 4, Idle 2 | 0 / 0 / 6 | ipc 4, gc_cc 4, poll_wait 3 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::NukedObjectRealm(JSObject*) [libxul.so]` 1; `[]` 0

**tab pid 4859** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 4254** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

