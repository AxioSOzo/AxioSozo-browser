### webkit raf (profile pass)

**parent pid 7188** — 1385 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 542 | 17.4 | Idle 281, GC / CC 98, JavaScript 77, Other 55 | 8 / 91 / 443 | ipc 539, poll_wait 312, gc_cc 174, engine_stream_read 55 |
| DOM Worker | 259 | 8.3 | JavaScript 251, Profiler 5, Other 4 | 0 / 0 / 259 | subprocess_pipe_io 259, worker_messaging 259, ipc 259, js_ctypes 233 |
| Renderer | 221 | 7.1 | Idle 134, Graphics 82, Other 3, Profiler 2 | 0 / 0 / 221 | ipc 221, poll_wait 149, webrender_render 85, webrender_sw_raster 72 |
| SwComposite | 147 | 4.7 | Other 147 | 0 / 0 / 147 | webrender_render 147, poll_wait 112, webrender_sw_raster 35, memcpy_memset 3 |
| BackgroundThreadPool #3 | 62 | 2.0 | Idle 53, Other 9, Graphics 1 | 0 / 0 / 62 | ipc 62, poll_wait 53, native_receiver 10, memcpy_memset 8 |
| WRRenderBackend#0 | 56 | 1.8 | Other 56 | 0 / 0 / 56 | array_buffer_copy 0, webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 39 | 1.3 | Idle 38, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 39 | ipc 39, poll_wait 38, webrender_render 1, canvas_2d 0 |
| Timer | 32 | 1.0 | Other 32, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 32 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 309; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 16; `[unknown]` 14; `[axiosozo-dev]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `NS_CycleCollectorSuspect3 [libxul.so]` 5; `mprotect [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4

**tab pid 7712** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 4, Idle 2 | 0 / 0 / 6 | ipc 6, gc_cc 4, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObjectEdge(JSObj` 1; `js::gc::StoreBuffer::SlotsEdge::trace(js::gc::TenuringTracer&) const [` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 1; `non-virtual thunk to nsDocShell::GetInProcessChildCount(int*) [libxul.` 0

**tab pid 7718** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7350** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `JSAutoRealm::~JSAutoRealm() [libxul.so]` 0

