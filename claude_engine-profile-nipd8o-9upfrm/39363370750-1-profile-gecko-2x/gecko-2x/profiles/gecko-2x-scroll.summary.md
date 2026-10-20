### gecko-2x scroll (profile pass)

**parent pid 3089** — 2023 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1518 | 73.1 | Graphics 1472, Idle 45, Profiler 1 | 0 / 0 / 1518 | ipc 1496, webrender_render 1473, webrender_sw_raster 1388, poll_wait 45 |
| GeckoMain | 173 | 8.3 | Idle 76, GC / CC 38, Other 34, Graphics 8 | 1 / 7 / 165 | ipc 173, poll_wait 113, gc_cc 42, paint_layout 15 |
| SwComposite | 154 | 7.4 | Other 154 | 0 / 0 / 154 | webrender_render 154, poll_wait 137, webrender_sw_raster 17, memcpy_memset 17 |
| WRRenderBackend#0 | 102 | 4.9 | Other 102 | 0 / 0 / 102 | memcpy_memset 1, webrender_render 1, poll_wait 0 |
| Compositor | 36 | 1.7 | Idle 35, Other 1, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 35, webrender_scene 0, webrender_render 0 |
| WRSceneBuilder#0 | 24 | 1.1 | Other 24 | 0 / 0 / 24 | webrender_scene 24, webrender_render 1 |
| IPC I/O Parent | 10 | 0.5 | Idle 9, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| DOM Worker | 2 | 0.1 | GC / CC 1, Idle 1 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 79; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 6; `recvmsg [libc.so.6]` 3; `write [libc.so.6]` 3; `mozilla::detail::Maybe_CopyMove_Enabler<nsTString<char>, false, true, ` 2; `[axiosozo-dev]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2

**tab pid 3330** — 128 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 109 | 5.2 | Idle 72, Graphics 17, Other 13, Layout 3 | 0 / 3 / 106 | ipc 106, poll_wait 74, paint_layout 22, array_buffer_copy 2 |
| IPC I/O Child | 18 | 0.9 | Idle 18, Other 0, Profiler 0 | 0 / 0 / 18 | poll_wait 18, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 72; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 2; `gfxTextRun::Draw(gfxTextRun::Range, mozilla::gfx::PointTyped<mozilla::` 2; `[]` 1; `nsIFrame::RemoveDisplayItem(mozilla::nsDisplayItem*) [libxul.so]` 1; `sendmsg [libc.so.6]` 1; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 1; `nsIFrame::IsTransformed() const [libxul.so]` 1

**tab pid 3416** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3254** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

