### gecko scroll (profile pass)

**parent pid 2968** — 972 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 646 | 30.9 | Graphics 584, Idle 62 | 0 / 0 / 646 | ipc 643, webrender_render 584, webrender_sw_raster 551, poll_wait 65 |
| GeckoMain | 140 | 6.7 | Idle 72, GC / CC 31, Other 12, JavaScript 8 | 1 / 7 / 132 | ipc 140, poll_wait 94, gc_cc 33, paint_layout 11 |
| WRRenderBackend#0 | 77 | 3.7 | Other 77, Profiler 0 | 0 / 0 / 77 | webrender_render 1 |
| SwComposite | 40 | 1.9 | Other 40 | 0 / 0 / 40 | webrender_render 40, poll_wait 37, webrender_sw_raster 3, memcpy_memset 3 |
| Compositor | 32 | 1.5 | Idle 32, Other 0, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 32, canvas_2d 0, webrender_render 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 | webrender_scene 22, webrender_render 1, memcpy_memset 0, paint_layout 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 8, Other 0 | 0 / 0 / 9 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 73; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JS::Symbol>(JS::Symbo` 3; `auto JS::MapGCThingTyped<js::gc::MarkingTracerT<6u>::markAndTraversePr` 3; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, nsSize, nsSt` 2; `recvmsg [libc.so.6]` 2; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2

**tab pid 3222** — 124 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 107 | 5.1 | Idle 64, Graphics 18, GC / CC 9, Other 7 | 0 / 3 / 104 | ipc 105, poll_wait 64, paint_layout 24, gc_cc 12 |
| IPC I/O Child | 16 | 0.7 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 64; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 4; `[]` 2; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder*, mozilla` 1; `gfxTextRun::Draw(gfxTextRun::Range, mozilla::gfx::PointTyped<mozilla::` 1; `getcontext [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `DescendIntoChild(mozilla::nsDisplayListBuilder*, nsIFrame const*, nsRe` 1

**tab pid 3133** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3308** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[]` 0

