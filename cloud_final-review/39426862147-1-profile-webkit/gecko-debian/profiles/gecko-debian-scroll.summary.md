### gecko-debian scroll (profile pass)

**parent pid 8214** — 750 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 464 | 23.2 | Graphics 411, Idle 52, Other 2 | 0 / 0 / 464 | ipc 459, webrender_render 411, webrender_sw_raster 381, poll_wait 59 |
| GeckoMain | 116 | 5.8 | Idle 58, GC / CC 28, Other 13, JavaScript 5 | 0 / 6 / 109 | ipc 115, poll_wait 75, gc_cc 31, paint_layout 10 |
| WRRenderBackend#0 | 58 | 2.9 | Other 58 | 0 / 0 / 58 | webrender_render 2, poll_wait 1, memcpy_memset 0 |
| SwComposite | 54 | 2.7 | Other 54 | 0 / 0 / 54 | webrender_render 54, poll_wait 47, webrender_sw_raster 8, memcpy_memset 6 |
| Compositor | 27 | 1.4 | Idle 26, Other 1, Profiler 0 | 0 / 0 / 27 | ipc 27, poll_wait 26, paint_layout 0, webrender_scene 0 |
| WRSceneBuilder#0 | 21 | 1.1 | Other 21 | 0 / 0 / 21 | webrender_scene 21, webrender_render 1, memcpy_memset 0 |
| IPC I/O Parent | 7 | 0.3 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 64; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `[axiosozo-dev]` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 1

**tab pid 8469** — 96 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 83 | 4.2 | Idle 59, Graphics 10, Other 7, Profiler 3 | 0 / 2 / 81 | ipc 79, poll_wait 60, paint_layout 16, gc_cc 2 |
| IPC I/O Child | 12 | 0.6 | Idle 11, Other 0 | 0 / 0 / 12 | poll_wait 11, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 62; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `already_AddRefed<mozilla::layers::WebRenderAPZAnimationData> mozilla::` 1; `__strlen_evex [libc.so.6]` 1; `syscall [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `[]` 1; `mozilla::dom::PerformanceMainThread::InsertEventTimingEntry(mozilla::d` 1

**tab pid 8381** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8509** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

