### gecko-2x raf-nosampler (profile pass)

**parent pid 2846** — 570 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 298 | 9.9 | Graphics 213, Idle 85 | 0 / 0 / 298 | ipc 296, webrender_render 213, webrender_sw_raster 162, poll_wait 90 |
| SwComposite | 75 | 2.5 | Other 75 | 0 / 0 / 75 | webrender_render 75, poll_wait 58, memcpy_memset 16, webrender_sw_raster 16 |
| WRRenderBackend#0 | 60 | 2.0 | Other 60 | 0 / 0 / 60 | webrender_render 1, poll_wait 1, memcpy_memset 0, array_buffer_copy 0 |
| WRSceneBuilder#0 | 44 | 1.4 | Other 44 | 0 / 0 / 44 | webrender_scene 44, webrender_render 2, poll_wait 1, memcpy_memset 0 |
| Compositor | 39 | 1.3 | Idle 38, Other 1, Profiler 0 | 0 / 0 / 39 | ipc 39, poll_wait 38, webrender_render 0, paint_layout 0 |
| GeckoMain | 39 | 1.3 | GC / CC 25, Idle 10, JavaScript 3, Other 2 | 1 / 2 / 37 | ipc 39, gc_cc 27, poll_wait 10, harness_diagnostics 3 |
| IPC I/O Parent | 8 | 0.3 | Idle 8, Other 0, Profiler 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.1 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScriptEdge(js::B` 2; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 2; `nsWindowRoot::AddRef() [libxul.so]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1; `mozilla::detail::MutexImpl::MutexImpl() [axiosozo-dev]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 1

**tab pid 3106** — 158 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 144 | 4.8 | Idle 102, Graphics 15, Layout 12, Profiler 7 | 0 / 4 / 140 | ipc 139, poll_wait 102, paint_layout 34, gc_cc 4 |
| IPC I/O Child | 13 | 0.4 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 13 | poll_wait 13, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 102; `[]` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 1; `sendmsg [libc.so.6]` 1; `mozilla::layers::apz::GetDisplayportAlignmentMultiplier(mozilla::gfx::` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1; `__lll_lock_wait [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1

**tab pid 3145** — 1 ms CPU in the window

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

**tab pid 3044** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

