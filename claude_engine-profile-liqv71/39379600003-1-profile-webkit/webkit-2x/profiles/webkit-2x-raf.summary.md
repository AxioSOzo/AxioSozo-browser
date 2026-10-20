### webkit-2x raf (profile pass)

**parent pid 8750** — 2223 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 595 | 18.5 | Idle 352, JavaScript 109, Other 53, GC / CC 41 | 13 / 123 / 459 | ipc 592, poll_wait 382, gc_cc 138, engine_stream_read 78 |
| Renderer | 567 | 17.6 | Idle 287, Graphics 279, Other 0 | 0 / 0 / 567 | ipc 567, poll_wait 299, webrender_render 279, webrender_sw_raster 253 |
| SwComposite | 441 | 13.7 | Other 441 | 0 / 0 / 441 | webrender_render 441, poll_wait 249, webrender_sw_raster 192, memcpy_memset 26 |
| DOM Worker | 278 | 8.6 | JavaScript 266, Profiler 10, Other 2 | 0 / 0 / 278 | subprocess_pipe_io 278, worker_messaging 277, ipc 277, js_ctypes 241 |
| BackgroundThreadPool #4 | 153 | 4.8 | Idle 109, Other 41, Graphics 3 | 0 / 0 / 153 | ipc 153, poll_wait 110, native_receiver 42, memcpy_memset 36 |
| WRRenderBackend#0 | 63 | 1.9 | Other 63 | 0 / 0 / 63 | webrender_render 1, memcpy_memset 0 |
| Compositor | 44 | 1.4 | Idle 42, Other 2, Profiler 0, Graphics 0 | 0 / 0 / 44 | ipc 44, poll_wait 42, webrender_render 1, canvas_2d 1 |
| Timer | 33 | 1.0 | Other 33, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 383; `[unknown]` 17; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 11; `[axiosozo-dev]` 6; `mozilla::EventListenerManager::HandleEventInternal(nsPresContext*, moz` 6; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 5; `__lll_lock_wake [libc.so.6]` 5; `JS::WeakCache<JS::GCHashMap<js::WeakHeapPtr<JSObject*>, std::unique_pt` 5

**tab pid 9277** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 4, Idle 2, Profiler 0 | 0 / 0 / 6 | gc_cc 4, ipc 4, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__lll_lock_wake [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 0; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 0; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObjectEdge(JSO` 0; `firefox_on_glean::metrics::__glean_metric_maps::labeled_enum_to_str [l` 0; `getrusage [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0

**tab pid 8911** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsTimerEvent::Run() [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 8889** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

