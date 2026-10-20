### gecko scroll (profile pass)

**parent pid 3048** — 886 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 610 | 29.4 | Graphics 548, Idle 63, Other 0 | 0 / 0 / 610 | ipc 601, webrender_render 548, webrender_sw_raster 507, poll_wait 66 |
| GeckoMain | 119 | 5.7 | Idle 60, GC / CC 28, Other 13, JavaScript 7 | 1 / 4 / 114 | ipc 119, poll_wait 75, gc_cc 33, paint_layout 10 |
| WRRenderBackend#0 | 64 | 3.1 | Other 64, Profiler 0 | 0 / 0 / 64 | webrender_render 1, memcpy_memset 1, poll_wait 0 |
| Compositor | 30 | 1.5 | Idle 30, Other 0, Profiler 0 | 0 / 0 / 30 | ipc 30, poll_wait 30, webrender_render 0, canvas_2d 0 |
| SwComposite | 28 | 1.4 | Other 28 | 0 / 0 / 28 | webrender_render 28, poll_wait 27, memcpy_memset 1, webrender_sw_raster 1 |
| WRSceneBuilder#0 | 20 | 0.9 | Other 20 | 0 / 0 / 20 | webrender_scene 20, webrender_render 0, poll_wait 0, memcpy_memset 0 |
| IPC I/O Parent | 8 | 0.4 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 61; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `mozilla::IdleTaskRunner::Run() [libxul.so]` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `recvmsg [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2

**tab pid 3312** — 103 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 86 | 4.1 | Idle 56, Graphics 11, GC / CC 8, Other 6 | 0 / 3 / 83 | ipc 85, poll_wait 57, paint_layout 14, gc_cc 10 |
| IPC I/O Child | 15 | 0.7 | Idle 15, Other 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 56; `[]` 1; `[linux-vdso.so.1]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `write [libc.so.6]` 1; `js::gc::PretenuringNursery::doPretenuring(js::gc::GCRuntime*, JS::GCRe` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::GenericTracerImpl<TraversalTracer>::onObjectEdge(JSObject**, char ` 1

**tab pid 3247** — 1 ms CPU in the window

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

**tab pid 3229** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

