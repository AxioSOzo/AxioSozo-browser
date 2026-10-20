### gecko-debian scroll (profile pass)

**parent pid 8116** — 1113 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 717 | 35.8 | Graphics 659, Idle 58 | 0 / 0 / 717 | ipc 712, webrender_render 659, webrender_sw_raster 638, poll_wait 68 |
| GeckoMain | 145 | 7.2 | Idle 75, GC / CC 28, Other 19, Graphics 7 | 0 / 7 / 138 | ipc 144, poll_wait 97, gc_cc 33, paint_layout 13 |
| WRRenderBackend#0 | 81 | 4.0 | Other 81 | 0 / 0 / 81 | webrender_render 2, memcpy_memset 2, poll_wait 1, webrender_sw_raster 0 |
| SwComposite | 59 | 2.9 | Other 59 | 0 / 0 / 59 | webrender_render 59, poll_wait 50, webrender_sw_raster 8, memcpy_memset 8 |
| DOM Worker | 45 | 2.3 | GC / CC 45, Other 0, Idle 0 | 0 / 0 / 45 | gc_cc 45, worker_messaging 44, ipc 44, memcpy_memset 14 |
| Compositor | 31 | 1.6 | Idle 31, Other 0 | 0 / 0 / 31 | ipc 31, poll_wait 31, paint_layout 0, canvas_2d 0 |
| WRSceneBuilder#0 | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_scene 23, webrender_render 1, paint_layout 0, webrender_sw_raster 0 |
| IPC I/O Parent | 8 | 0.4 | Idle 7, Other 0, Profiler 0 | 0 / 0 / 8 | poll_wait 7, ipc 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 84; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `[axiosozo-dev]` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 1; `madvise [libc.so.6]` 1; `mozilla::dom::Document::UpdateIntersections(mozilla::TimeStamp) [libxu` 1

**tab pid 8370** — 115 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 100 | 5.0 | Idle 70, Graphics 14, Other 8, Profiler 2 | 0 / 3 / 97 | ipc 97, poll_wait 70, paint_layout 20, array_buffer_copy 2 |
| IPC I/O Child | 14 | 0.7 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 14 | poll_wait 14, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 73; `[]` 2; `nsTextFrame::PaintText(nsTextFrame::PaintTextParams const&, int, int, ` 2; `GetTrimmableWhitespaceCount(mozilla::dom::CharacterDataBuffer const&, ` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1; `nsSliderFrame::QueryFrame(nsQueryFrame::FrameIID) const [libxul.so]` 1; `mozilla::layers::PAPZChild::OnMessageReceived(IPC::Message const&) [li` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuffer::PutObj` 1

**tab pid 8289** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8463** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

