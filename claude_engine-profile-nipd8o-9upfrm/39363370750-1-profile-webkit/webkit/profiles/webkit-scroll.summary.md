### webkit scroll (profile pass)

**parent pid 7188** — 4336 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2156 | 12.6 | Idle 987, JavaScript 508, Other 238, GC / CC 165 | 174 / 563 / 1419 | ipc 2142, poll_wait 1133, gc_cc 434, paint_layout 393 |
| DOM Worker | 1381 | 8.1 | JavaScript 1266, Other 68, GC / CC 26, Profiler 21 | 0 / 0 / 1381 | subprocess_pipe_io 1381, worker_messaging 1378, ipc 1378, js_ctypes 1076 |
| Renderer | 305 | 1.8 | Idle 159, Graphics 146, Other 0, Profiler 0 | 0 / 0 / 305 | ipc 305, poll_wait 167, webrender_render 146, webrender_sw_raster 125 |
| SwComposite | 231 | 1.3 | Other 231 | 0 / 0 / 231 | webrender_render 230, poll_wait 155, webrender_sw_raster 75, memcpy_memset 11 |
| Timer | 125 | 0.7 | Other 125, Profiler 0 | 0 / 0 / 125 | ipc 125, poll_wait 124, memcpy_memset 0 |
| WRRenderBackend#0 | 65 | 0.4 | Other 65 | 0 / 0 / 65 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 44 | 0.3 | Idle 43, Other 1, Profiler 0 | 0 / 0 / 44 | ipc 44, poll_wait 43, webrender_render 1, canvas_2d 0 |
| WRSceneBuilder#0 | 13 | 0.1 | Other 13 | 0 / 0 / 13 | webrender_scene 13, webrender_render 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1072; `__memmove_evex_unaligned_erms [libc.so.6]` 160; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 144; `[unknown]` 58; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned char const*, ` 46; `[axiosozo-dev]` 42; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 35; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 20

**tab pid 7386** — 14 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 11 | 0.1 | GC / CC 6, Idle 5, Other 0, Profiler 0 | 0 / 0 / 11 | ipc 11, gc_cc 6, poll_wait 5 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObjectEdge(JSObj` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onScriptEdge(js::B` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 1

**tab pid 7285** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.0 | GC / CC 6, Idle 2 | 0 / 0 / 8 | ipc 7, gc_cc 6, poll_wait 3, array_buffer_copy 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `unsigned long js::gc::Arena::finalize<JSObject, (js::gc::FinalizeKind)` 1; `__printf_buffer_write [libc.so.6]` 0

**tab pid 7345** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.0 | Idle 4, GC / CC 2, Other 0 | 0 / 0 / 6 | ipc 5, poll_wait 4, gc_cc 2 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `std::io::impls::<impl std::io::Write for &mut W>::write_all [libxul.so` 1; `firefox_on_glean::private::labeled::LabeledMetric<T,E>::get_submetric_` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 1; `__lll_lock_wake [libc.so.6]` 0; `nsTimer::Cancel() [libxul.so]` 0

