### gecko raf-nosampler (profile pass)

**parent pid 2911** — 491 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 277 | 9.1 | Graphics 183, Idle 92, Profiler 2, Other 0 | 0 / 0 / 277 | ipc 275, webrender_render 185, webrender_sw_raster 158, poll_wait 94 |
| WRRenderBackend#0 | 58 | 1.9 | Other 58, Profiler 0 | 0 / 0 / 58 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| GeckoMain | 46 | 1.5 | GC / CC 31, Idle 11, JavaScript 3, Other 2 | 0 / 3 / 43 | ipc 45, gc_cc 33, poll_wait 12, harness_diagnostics 3 |
| WRSceneBuilder#0 | 40 | 1.3 | Other 40, Profiler 0 | 0 / 0 / 40 | webrender_scene 40, webrender_render 2, poll_wait 1, memcpy_memset 0 |
| Compositor | 39 | 1.3 | Idle 38, Other 1, Profiler 0 | 0 / 0 / 39 | ipc 39, poll_wait 38, webrender_render 0, paint_layout 0 |
| SwComposite | 15 | 0.5 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 14, webrender_sw_raster 0, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.3 | Idle 8, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::MapObject::get(JSContext*, JS::Value const&, JS::MutableHandle<JS:` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScopeEdge(js::Sc` 1

**tab pid 3176** — 155 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 140 | 4.6 | Idle 100, Graphics 14, Layout 9, Profiler 7 | 0 / 3 / 137 | ipc 130, poll_wait 102, paint_layout 27, gc_cc 5 |
| IPC I/O Child | 14 | 0.4 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 14 | poll_wait 13, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 100; `[]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1; `write [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3219** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[libgcc_s.so.1]` 0

**tab pid 3262** — 1 ms CPU in the window

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

