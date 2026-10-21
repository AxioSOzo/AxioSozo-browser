### chromium raf (profile pass)

**parent pid 3461** — 1002 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 398 | 12.6 | Idle 226, JavaScript 81, Other 38, GC / CC 35 | 3 / 85 / 310 | ipc 398, poll_wait 251, gc_cc 118, worker_messaging 45 |
| DOM Worker | 299 | 9.4 | JavaScript 291, Profiler 4, Other 4 | 0 / 0 / 299 | subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 278 |
| Renderer | 78 | 2.4 | Idle 61, Graphics 16, Other 0, Profiler 0 | 0 / 0 / 78 | ipc 78, poll_wait 63, webrender_render 17, webrender_sw_raster 11 |
| WRRenderBackend#0 | 48 | 1.5 | Other 48 | 0 / 0 / 48 | webrender_render 0, poll_wait 0 |
| SwComposite | 41 | 1.3 | Other 41 | 0 / 0 / 41 | webrender_render 41, poll_wait 40, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 41 | 1.3 | Idle 40, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 41 | ipc 41, poll_wait 40, webrender_render 1, canvas_2d 0 |
| BackgroundThreadPool #3 | 37 | 1.2 | Idle 33, Other 4, Graphics 0 | 0 / 0 / 37 | ipc 37, poll_wait 33, native_receiver 4, memcpy_memset 3 |
| Timer | 32 | 1.0 | Other 32 | 0 / 0 / 32 | ipc 32, poll_wait 32 |

Main thread, top self: `poll [libc.so.6]` 229; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `[axiosozo-dev]` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3

**tab pid 3640** — 12 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 11 | 0.3 | GC / CC 8, Idle 3, Other 0 | 0 / 0 / 11 | ipc 9, gc_cc 8, poll_wait 4 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::gc::GCRuntime::sweepPropMapTree(JS::GCContext*, JS::SliceBudget&) ` 1; `js::AtomsTable::sweepIncrementally(mozilla::detail::HashTable<js::Weak` 1; `[]` 1

**tab pid 3551** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.3 | GC / CC 7, Idle 2 | 0 / 0 / 9 | ipc 8, gc_cc 7, poll_wait 3, array_buffer_copy 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `nsTHashtable<nsBaseHashtableET<nsPtrHashKey<nsIMemoryReporter>, bool> ` 1; `[]` 0; `zen::nsZenWindowDragUtils::AddRef() [libxul.so]` 0

**tab pid 3600** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, GC / CC 2, Other 0 | 0 / 0 / 4 | ipc 3, poll_wait 3, gc_cc 2, memcpy_memset 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 1; `madvise [libc.so.6]` 0

