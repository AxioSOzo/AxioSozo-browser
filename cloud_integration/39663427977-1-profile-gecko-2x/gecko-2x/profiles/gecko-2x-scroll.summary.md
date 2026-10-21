### gecko-2x scroll (profile pass)

**parent pid 2846** — 1554 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1112 | 55.2 | Graphics 1048, Idle 63, Profiler 1, Other 0 | 0 / 0 / 1112 | ipc 1103, webrender_render 1049, webrender_sw_raster 979, poll_wait 64 |
| SwComposite | 187 | 9.3 | Other 187 | 0 / 0 / 187 | webrender_render 187, poll_wait 152, webrender_sw_raster 34, memcpy_memset 33 |
| GeckoMain | 117 | 5.8 | Idle 63, GC / CC 27, Other 10, Graphics 9 | 0 / 6 / 111 | ipc 117, poll_wait 77, gc_cc 29, paint_layout 11 |
| WRRenderBackend#0 | 76 | 3.8 | Other 76 | 0 / 0 / 76 | webrender_render 3, memcpy_memset 1, poll_wait 0 |
| Compositor | 29 | 1.4 | Idle 28, Other 1, Profiler 0 | 0 / 0 / 29 | ipc 29, poll_wait 28, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 | webrender_scene 22, webrender_render 1, poll_wait 1, memcpy_memset 0 |
| IPC I/O Parent | 7 | 0.3 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 63; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, char const*` 2; `js::gc::BufferAllocator::bumpAlloc(unsigned long, unsigned long, unsig` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `mozilla::nsDisplayItem::GetBounds(mozilla::nsDisplayListBuilder*, bool` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2

**tab pid 3106** — 107 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 94 | 4.7 | Idle 59, Graphics 11, Other 8, GC / CC 7 | 0 / 3 / 91 | ipc 91, poll_wait 61, paint_layout 16, gc_cc 8 |
| IPC I/O Child | 12 | 0.6 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 60; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `sendmsg [libc.so.6]` 2; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [libxul.` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned int, mozilla` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1

**tab pid 3004** — 0 ms CPU in the window

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

**tab pid 3044** — 0 ms CPU in the window

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

