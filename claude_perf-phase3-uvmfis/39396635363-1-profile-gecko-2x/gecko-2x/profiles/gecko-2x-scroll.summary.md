### gecko-2x scroll (profile pass)

**parent pid 2854** — 1533 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1151 | 56.6 | Graphics 1091, Idle 59 | 0 / 0 / 1151 | ipc 1140, webrender_render 1091, webrender_sw_raster 1030, poll_wait 60 |
| SwComposite | 132 | 6.5 | Other 132 | 0 / 0 / 132 | webrender_render 132, poll_wait 119, webrender_sw_raster 13, memcpy_memset 12 |
| GeckoMain | 123 | 6.0 | Idle 64, GC / CC 33, Graphics 9, Other 9 | 0 / 2 / 121 | ipc 123, poll_wait 81, gc_cc 34, paint_layout 13 |
| WRRenderBackend#0 | 72 | 3.5 | Other 72 | 0 / 0 / 72 | webrender_render 1, memcpy_memset 1, poll_wait 0 |
| Compositor | 25 | 1.2 | Idle 25, Other 1, Profiler 0 | 0 / 0 / 25 | ipc 25, poll_wait 25, paint_layout 0 |
| WRSceneBuilder#0 | 19 | 0.9 | Other 19, Profiler 0 | 0 / 0 / 19 | webrender_scene 19, webrender_render 1, poll_wait 0, paint_layout 0 |
| IPC I/O Parent | 7 | 0.3 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 64; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `[axiosozo-dev]` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `PLDHashTable::Iterator::Iterator(PLDHashTable*) [libxul.so]` 2; `recvmsg [libc.so.6]` 2; `nsCSSRendering::CreateBorderRendererForNonThemedOutline(nsPresContext*` 2

**tab pid 3126** — 99 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 86 | 4.2 | Idle 58, Graphics 10, Other 6, GC / CC 5 | 0 / 3 / 83 | ipc 83, poll_wait 60, paint_layout 14, gc_cc 7 |
| IPC I/O Child | 12 | 0.6 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 59; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `js::frontend::PerHandlerParser<js::frontend::FullParseHandler>::propag` 1; `nsIFrame::GetOverflowRect(mozilla::OverflowType) const [libxul.so]` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1; `std::chrono::_V2::steady_clock::now()@@GLIBCXX_3.4.19 [libstdc++.so.6]` 1

**tab pid 3159** — 1 ms CPU in the window

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

**tab pid 3052** — 1 ms CPU in the window

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

