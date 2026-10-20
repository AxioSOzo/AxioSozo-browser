### gecko idle (profile pass)

**parent pid 2850** — 80 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 73 | 3.5 | GC / CC 48, Other 8, Idle 8, JavaScript 7 | 0 / 8 / 65 | ipc 73, gc_cc 53, poll_wait 11, harness_diagnostics 6 |
| Compositor | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Renderer | 1 | 0.0 | Graphics 0, Idle 0 | 0 / 0 / 1 | ipc 1, memcpy_memset 0, webrender_render 0, webrender_sw_raster 0 |
| WRSceneBuilder#0 | 1 | 0.0 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |
| SwComposite | 0 | 0.0 | Other 0 | 0 / 0 / 0 | webrender_render 0, poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 15; `poll [libc.so.6]` 8; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `recvmsg [libc.so.6]` 2; `syscall [libc.so.6]` 2

**tab pid 3112** — 60 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 51 | 2.4 | Idle 34, GC / CC 9, JavaScript 2, DOM 2 | 0 / 5 / 45 | ipc 50, poll_wait 34, gc_cc 11, paint_layout 4 |
| IPC I/O Child | 8 | 0.4 | Idle 8, Other 0, Profiler 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 34; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `encoding_rs::mem::convert_latin1_to_utf8_partial [libxul.so]` 1; `mozilla::ProfileBufferChunkManagerSingle::SetChunkDestroyedCallback(st` 1

**tab pid 2940** — 1 ms CPU in the window

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

**tab pid 3115** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

