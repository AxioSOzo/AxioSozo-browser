### gecko raf-nosampler (profile pass)

**parent pid 2850** — 760 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 414 | 13.6 | Graphics 333, Idle 79, Other 2, Profiler 1 | 0 / 0 / 414 | ipc 411, webrender_render 335, webrender_sw_raster 270, poll_wait 84 |
| WRRenderBackend#0 | 106 | 3.5 | Other 106 | 0 / 0 / 106 | webrender_render 5, poll_wait 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 68 | 2.2 | Other 67, Profiler 1 | 0 / 0 / 68 | webrender_scene 68, webrender_render 3, poll_wait 1, paint_layout 1 |
| GeckoMain | 66 | 2.2 | GC / CC 42, Idle 19, JavaScript 3, Graphics 1 | 0 / 4 / 62 | ipc 66, gc_cc 44, poll_wait 21, harness_diagnostics 4 |
| Compositor | 59 | 1.9 | Idle 57, Other 2, Profiler 0 | 0 / 0 / 59 | ipc 59, poll_wait 57, webrender_render 1, paint_layout 0 |
| SwComposite | 23 | 0.8 | Other 23 | 0 / 0 / 23 | webrender_render 23, poll_wait 21, memcpy_memset 2, webrender_sw_raster 2 |
| IPC I/O Parent | 13 | 0.4 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 13 | poll_wait 13, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 7 | 0.2 | Other 7 | 0 / 0 / 7 |  |

Main thread, top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 3; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2

**tab pid 3112** — 292 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 267 | 8.8 | Idle 101, Layout 58, Graphics 52, Other 22 | 0 / 18 / 249 | ipc 244, paint_layout 138, poll_wait 102, canvas_2d 9 |
| IPC I/O Child | 23 | 0.8 | Idle 22, Other 1 | 0 / 0 / 23 | poll_wait 22, ipc 1, memcpy_memset 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 101; `[]` 12; `sendmsg [libc.so.6]` 8; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisplayListBui` 2; `getcontext [libc.so.6]` 2; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 2

**tab pid 3017** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 0

**tab pid 3043** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0

