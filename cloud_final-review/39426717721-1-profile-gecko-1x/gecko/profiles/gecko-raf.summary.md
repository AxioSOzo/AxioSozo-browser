### gecko raf (profile pass)

**parent pid 2850** — 816 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 419 | 13.4 | Graphics 326, Idle 92, Profiler 1, Other 1 | 0 / 0 / 419 | ipc 417, webrender_render 327, webrender_sw_raster 273, poll_wait 95 |
| WRRenderBackend#0 | 113 | 3.6 | Other 113 | 0 / 0 / 113 | webrender_render 3, webrender_sw_raster 1, memcpy_memset 1, poll_wait 0 |
| GeckoMain | 88 | 2.8 | GC / CC 42, Idle 33, JavaScript 4, Other 4 | 0 / 6 / 82 | ipc 88, gc_cc 47, poll_wait 36, harness_diagnostics 5 |
| WRSceneBuilder#0 | 72 | 2.3 | Other 72 | 0 / 0 / 72 | webrender_scene 72, webrender_render 5, memcpy_memset 2, poll_wait 1 |
| Compositor | 61 | 1.9 | Idle 58, Other 3, Profiler 0 | 0 / 0 / 61 | ipc 61, poll_wait 58, paint_layout 1, webrender_render 1 |
| SwComposite | 36 | 1.2 | Other 36 | 0 / 0 / 36 | webrender_render 36, poll_wait 31, memcpy_memset 5, webrender_sw_raster 5 |
| IPC I/O Parent | 14 | 0.4 | Idle 13, Other 1 | 0 / 0 / 14 | poll_wait 13, ipc 1 |
| WRSceneBuilderLP#0 | 7 | 0.2 | Other 7 | 0 / 0 / 7 |  |

Main thread, top self: `poll [libc.so.6]` 33; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 15; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `mozilla::ReflowInput::ComputeMinMaxValues(mozilla::LogicalSize const&)` 2; `mprotect [libc.so.6]` 1

**tab pid 3112** — 327 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 296 | 9.5 | Idle 106, Layout 70, Graphics 60, Other 26 | 0 / 24 / 272 | ipc 273, paint_layout 154, poll_wait 106, gc_cc 15 |
| IPC I/O Child | 23 | 0.7 | Idle 22, Other 1, Profiler 0 | 0 / 0 / 23 | poll_wait 22, ipc 1, memcpy_memset 0 |
| Timer | 7 | 0.2 | Other 7 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 104; `[]` 13; `sendmsg [libc.so.6]` 7; `__memset_avx512_unaligned_erms [libc.so.6]` 6; `[linux-vdso.so.1]` 3; `__lll_lock_wait [libc.so.6]` 3; `mozilla::RetainedDisplayListBuilder::PreProcessDisplayList(mozilla::Re` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 3115** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3187** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0

