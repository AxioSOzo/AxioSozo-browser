### gecko raf (profile pass)

**parent pid 2968** — 576 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 320 | 10.3 | Graphics 229, Idle 89, Other 2, Profiler 1 | 0 / 0 / 320 | ipc 318, webrender_render 230, webrender_sw_raster 204, poll_wait 93 |
| WRRenderBackend#0 | 63 | 2.0 | Other 63 | 0 / 0 / 63 | webrender_render 0, memcpy_memset 0, poll_wait 0 |
| GeckoMain | 62 | 2.0 | GC / CC 30, Idle 20, JavaScript 5, Graphics 3 | 0 / 5 / 57 | ipc 62, gc_cc 33, poll_wait 21, paint_layout 4 |
| WRSceneBuilder#0 | 45 | 1.4 | Other 45 | 0 / 0 / 45 | webrender_scene 45, webrender_render 1, paint_layout 0, memcpy_memset 0 |
| Compositor | 44 | 1.4 | Idle 43, Other 1, Profiler 0 | 0 / 0 / 44 | ipc 44, poll_wait 43, webrender_render 0, paint_layout 0 |
| SwComposite | 19 | 0.6 | Other 19 | 0 / 0 / 19 | webrender_render 19, poll_wait 17, memcpy_memset 1, webrender_sw_raster 1 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0, Profiler 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 20; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3; `JS::GCThingTraceKind(void*) [libxul.so]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `[unknown]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1

**tab pid 3222** — 175 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 156 | 5.0 | Idle 98, Graphics 19, Layout 17, Other 11 | 0 / 7 / 149 | ipc 150, poll_wait 100, paint_layout 46, harness_diagnostics 4 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 98; `sendmsg [libc.so.6]` 4; `[linux-vdso.so.1]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[]` 2; `__sincos_fma [libm.so.6]` 1; `mozilla::ScrollContainerFrame::BuildDisplayList(mozilla::nsDisplayList` 1; `read [libc.so.6]` 1

**tab pid 3151** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[]` 0

**tab pid 3112** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::gfx::VRManagerChild::GetIdleDeadlineHint(mozilla::TimeStamp) ` 0

