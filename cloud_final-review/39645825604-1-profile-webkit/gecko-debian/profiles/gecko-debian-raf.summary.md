### gecko-debian raf (profile pass)

**parent pid 8187** — 329 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 151 | 4.9 | Idle 86, Graphics 64 | 0 / 0 / 151 | ipc 150, poll_wait 87, webrender_render 64, webrender_sw_raster 57 |
| GeckoMain | 51 | 1.7 | GC / CC 25, Idle 16, Other 4, JavaScript 3 | 1 / 2 / 48 | ipc 51, gc_cc 29, poll_wait 18, harness_diagnostics 2 |
| WRRenderBackend#0 | 33 | 1.1 | Other 33 | 0 / 0 / 33 | webrender_render 0, webrender_sw_raster 0, memcpy_memset 0 |
| DOM Worker | 26 | 0.9 | Other 23, GC / CC 2, Idle 1 | 0 / 0 / 26 | worker_messaging 26, ipc 26, gc_cc 25, memcpy_memset 9 |
| WRSceneBuilder#0 | 25 | 0.8 | Other 25 | 0 / 0 / 25 | webrender_scene 25, webrender_render 1, memcpy_memset 0, poll_wait 0 |
| Compositor | 24 | 0.8 | Idle 23, Other 0, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 23, memcpy_memset 0, paint_layout 0 |
| IPC I/O Parent | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| SwComposite | 6 | 0.2 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 6, webrender_sw_raster 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `__lll_lock_wait [libc.so.6]` 2; `nsTHashtable<nsBaseHashtableET<nsStringHashKey, nsCOMPtr<nsIVariant> >` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 1

**tab pid 8454** — 100 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 91 | 3.0 | Idle 64, Graphics 7, Other 7, Layout 5 | 0 / 4 / 87 | ipc 86, poll_wait 64, paint_layout 15, gc_cc 5 |
| IPC I/O Child | 8 | 0.3 | Idle 8, Other 0, Profiler 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 66; `[]` 3; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*, unsigned ` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<js::HeapPtr<js::` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `mozilla::RestyleManager::AttributeChanged(mozilla::dom::Element*, int,` 1; `JS::UnhideScriptedCaller(JSContext*) [libxul.so]` 1

**tab pid 8327** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

**tab pid 8532** — 0 ms CPU in the window

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

