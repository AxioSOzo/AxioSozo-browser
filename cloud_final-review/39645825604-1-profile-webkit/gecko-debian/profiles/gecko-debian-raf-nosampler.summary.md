### gecko-debian raf-nosampler (profile pass)

**parent pid 8187** — 276 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 152 | 5.1 | Idle 83, Graphics 69 | 0 / 0 / 152 | ipc 152, poll_wait 82, webrender_render 69, webrender_sw_raster 61 |
| WRRenderBackend#0 | 31 | 1.0 | Other 31 | 0 / 0 / 31 | webrender_render 0 |
| GeckoMain | 30 | 1.0 | GC / CC 20, Idle 6, DOM 2, Profiler 1 | 0 / 2 / 28 | ipc 30, gc_cc 23, poll_wait 9, harness_diagnostics 2 |
| WRSceneBuilder#0 | 23 | 0.8 | Other 23 | 0 / 0 / 23 | webrender_scene 23, webrender_render 1, memcpy_memset 0, poll_wait 0 |
| Compositor | 23 | 0.7 | Idle 22, Other 0 | 0 / 0 / 23 | ipc 23, poll_wait 22, webrender_render 0, memcpy_memset 0 |
| IPC I/O Parent | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4, memcpy_memset 0, webrender_sw_raster 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::ProfilerStringV` 1; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 1

**tab pid 8454** — 89 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 80 | 2.7 | Idle 61, Graphics 7, Other 4, Layout 3 | 0 / 1 / 79 | ipc 77, poll_wait 61, paint_layout 12, gc_cc 3 |
| IPC I/O Child | 8 | 0.3 | Idle 8, Other 0, Profiler 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 62; `[]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onScopeEdge(js::Sc` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::gc::TraceExternalEdge(JSTracer*, JS::PropertyKey*, char const*) [l` 1; `mozilla::ImplCycleCollectionTraverse(nsCycleCollectionTraversalCallbac` 1; `mozilla::nsDisplayText::RenderToContext(gfxContext*, mozilla::nsDispla` 1; `[linux-vdso.so.1]` 0

**tab pid 8368** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8327** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

