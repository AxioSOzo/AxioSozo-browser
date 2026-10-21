### gecko-2x raf (profile pass)

**parent pid 2872** — 417 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 180 | 5.9 | Idle 99, Graphics 78, Profiler 2 | 0 / 0 / 180 | ipc 180, poll_wait 101, webrender_render 80, webrender_sw_raster 58 |
| GeckoMain | 58 | 1.9 | GC / CC 31, Idle 18, Other 4, JavaScript 3 | 0 / 3 / 54 | ipc 58, gc_cc 34, poll_wait 20, harness_diagnostics 3 |
| SwComposite | 51 | 1.7 | Other 51 | 0 / 0 / 51 | webrender_render 51, poll_wait 46, memcpy_memset 6, webrender_sw_raster 6 |
| WRRenderBackend#0 | 42 | 1.4 | Other 42 | 0 / 0 / 42 | webrender_render 1, poll_wait 0, webrender_scene 0, memcpy_memset 0 |
| Compositor | 35 | 1.2 | Idle 34, Other 1, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 34, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 35 | 1.2 | Other 35 | 0 / 0 / 35 | webrender_scene 35, webrender_render 2, poll_wait 0, memcpy_memset 0 |
| IPC I/O Parent | 8 | 0.3 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `mozilla::TraceScriptHolder(nsISupports*, JSTracer*) [libxul.so]` 2; `JS::Compartment::findSweepGroupEdges() [libxul.so]` 2; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 2; `[axiosozo-dev]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1

**tab pid 3186** — 140 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 126 | 4.1 | Idle 84, Graphics 13, Layout 10, Other 7 | 0 / 4 / 122 | ipc 118, poll_wait 85, paint_layout 26, gc_cc 9 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 84; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `sendmsg [libc.so.6]` 2; `XPCWrappedNativeScope::TraceWrappedNativesInAllScopes(XPCJSRuntime*, J` 1; `mozilla::PointerEventHandler::GetLastMouseInfo(mozilla::PresShell cons` 1; `js::LiveSavedFrameCache::~LiveSavedFrameCache() [libxul.so]` 1

**tab pid 3261** — 1 ms CPU in the window

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

**tab pid 3072** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0

