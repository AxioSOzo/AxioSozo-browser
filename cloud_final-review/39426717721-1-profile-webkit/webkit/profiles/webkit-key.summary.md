### webkit key (profile pass)

**parent pid 7188** — 1014 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 593 | 16.1 | Idle 240, GC / CC 92, JavaScript 88, Other 45 | 15 / 150 / 428 | ipc 592, poll_wait 283, gc_cc 186, paint_layout 85 |
| DOM Worker | 260 | 7.1 | JavaScript 253, Other 5, Profiler 3 | 0 / 0 / 260 | subprocess_pipe_io 260, worker_messaging 259, ipc 259, js_ctypes 244 |
| Renderer | 53 | 1.4 | Graphics 30, Idle 23 | 0 / 0 / 53 | ipc 52, webrender_render 30, poll_wait 26, webrender_sw_raster 25 |
| Timer | 33 | 0.9 | Other 33 | 0 / 0 / 33 | ipc 33, poll_wait 32, memcpy_memset 0 |
| Compositor | 18 | 0.5 | Idle 15, Other 3 | 0 / 0 / 18 | ipc 18, poll_wait 15, memcpy_memset 3, image_container 0 |
| SwComposite | 16 | 0.4 | Other 16 | 0 / 0 / 16 | webrender_render 16, poll_wait 11, memcpy_memset 5, webrender_sw_raster 5 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8, Graphics 1 | 0 / 0 / 8 | webrender_scene 8, webrender_sw_raster 1, poll_wait 1, array_buffer_copy 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 262; `[unknown]` 13; `[axiosozo-dev]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `mprotect [libc.so.6]` 5; `getcontext [libc.so.6]` 5; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 5

**tab pid 7280** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, DOM 0, JavaScript 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[linux-vdso.so.1]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JSStructuredCloneData::discardTransferables() [libxul.so]` 0; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 0; `mozilla::PerformanceCounterState::RunnableWillRun(mozilla::TimeStamp, ` 0

**tab pid 7364** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 0

**tab pid 7383** — 1 ms CPU in the window

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

