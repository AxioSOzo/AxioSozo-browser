### webkit-2x raf (profile pass)

**parent pid 8806** — 1307 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 448 | 14.5 | Idle 293, JavaScript 57, GC / CC 37, Other 28 | 6 / 75 / 367 | ipc 439, poll_wait 302, gc_cc 89, engine_stream_read 41 |
| DOM Worker | 312 | 10.1 | JavaScript 231, Other 39, GC / CC 39, Profiler 3 | 0 / 0 / 312 | subprocess_pipe_io 312, worker_messaging 308, ipc 308, js_ctypes 212 |
| Renderer | 180 | 5.8 | Idle 111, Graphics 65, Other 3, Profiler 1 | 0 / 0 / 180 | ipc 180, poll_wait 129, webrender_render 67, webrender_sw_raster 52 |
| BackgroundThreadPool #2 | 135 | 4.4 | Idle 97, Other 38 | 0 / 0 / 135 | ipc 135, poll_wait 97, native_receiver 36, memcpy_memset 36 |
| SwComposite | 106 | 3.4 | Other 106 | 0 / 0 / 106 | webrender_render 106, poll_wait 97, memcpy_memset 10, webrender_sw_raster 10 |
| WRRenderBackend#0 | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_render 0, poll_wait 0 |
| Compositor | 33 | 1.1 | Idle 32, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, webrender_render 1, canvas_2d 0 |
| Timer | 26 | 0.9 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `[axiosozo-dev]` 11; `[linux-vdso.so.1]` 9; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 3

**tab pid 8901** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.3 | GC / CC 7, Idle 2, Other 0 | 0 / 0 / 9 | ipc 8, gc_cc 7, poll_wait 3, memcpy_memset 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `__syscall_cancel_arch [libc.so.6]` 3; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `nsDocShell::cycleCollection::TraverseNative(void*, nsCycleCollectionTr` 1; `mozilla::dom::BrowsingContext::SweepWindowProxies(JSTracer*) [libxul.s` 0; `__lll_lock_wake [libc.so.6]` 0; `madvise [libc.so.6]` 0; `nsQueryReferent::operator()(nsID const&, void**) const [libxul.so]` 0

**tab pid 8994** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.3 | GC / CC 7, Idle 2 | 0 / 0 / 9 | ipc 7, gc_cc 7, poll_wait 3, memcpy_memset 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mmap64 [libc.so.6]` 1; `TraceCallbackFunc::Trace(JS::Heap<JSObject*>*, char const*, void*) con` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 0; `bool js::gc::UnmarkGrayTracer<8u>::onChild<JSObject>(JSObject*) [libxu` 0

**tab pid 8953** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `bool js::gc::UnmarkGrayTracer<8u>::onChild<js::GetterSetter>(js::Gette` 0; `core::hash::BuildHasher::hash_one [libxul.so]` 0

