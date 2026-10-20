### gecko scroll (profile pass)

**parent pid 3047** — 1095 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 703 | 33.9 | Graphics 644, Idle 57, Other 2, Profiler 1 | 0 / 0 / 703 | ipc 700, webrender_render 647, webrender_sw_raster 610, poll_wait 60 |
| GeckoMain | 178 | 8.6 | Idle 81, GC / CC 40, Other 25, Graphics 12 | 1 / 9 / 168 | ipc 178, poll_wait 114, gc_cc 50, paint_layout 19 |
| WRRenderBackend#0 | 93 | 4.5 | Other 92, Profiler 1 | 0 / 0 / 93 | webrender_render 5, memcpy_memset 2, poll_wait 2 |
| SwComposite | 43 | 2.1 | Other 43 | 0 / 0 / 43 | webrender_render 43, poll_wait 38, webrender_sw_raster 4, memcpy_memset 4 |
| Compositor | 39 | 1.9 | Idle 38, Other 1, Profiler 0 | 0 / 0 / 39 | ipc 39, poll_wait 38, webrender_render 0, canvas_2d 0 |
| WRSceneBuilder#0 | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_scene 23, webrender_render 0, poll_wait 0, memcpy_memset 0 |
| IPC I/O Parent | 10 | 0.5 | Idle 10, Other 0, Profiler 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 81; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `write [libc.so.6]` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `[axiosozo-dev]` 3; `recvmsg [libc.so.6]` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2

**tab pid 3287** — 147 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 125 | 6.0 | Idle 72, Graphics 22, Other 10, GC / CC 8 | 0 / 5 / 120 | ipc 120, poll_wait 75, paint_layout 30, gc_cc 12 |
| IPC I/O Child | 21 | 1.0 | Idle 20, Other 1 | 0 / 0 / 21 | poll_wait 20, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 73; `[]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `sendmsg [libc.so.6]` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1

**tab pid 3372** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `xpc::SelfHostedShmem::Handle() const [libxul.so]` 0

**tab pid 3210** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

