### gecko-2x scroll (profile pass)

**parent pid 2872** — 1211 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 898 | 44.6 | Graphics 843, Idle 54, Other 1 | 0 / 0 / 898 | ipc 892, webrender_render 844, webrender_sw_raster 800, poll_wait 55 |
| SwComposite | 113 | 5.6 | Other 113 | 0 / 0 / 113 | webrender_render 113, poll_wait 102, webrender_sw_raster 10, memcpy_memset 10 |
| GeckoMain | 99 | 4.9 | Idle 49, GC / CC 26, Other 11, JavaScript 5 | 0 / 7 / 92 | ipc 99, poll_wait 61, gc_cc 32, harness_diagnostics 6 |
| WRRenderBackend#0 | 54 | 2.7 | Other 54 | 0 / 0 / 54 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 24 | 1.2 | Idle 24, Other 1, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 23, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 15 | 0.7 | Other 15 | 0 / 0 / 15 | webrender_scene 15, webrender_render 1, memcpy_memset 1, poll_wait 0 |
| IPC I/O Parent | 6 | 0.3 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 49; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `recvmsg [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::NewArrayIterator(JSContext*) [libxul.so]` 2

**tab pid 3186** — 76 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 65 | 3.2 | Idle 51, Graphics 5, Other 4, JavaScript 4 | 0 / 4 / 61 | ipc 63, poll_wait 51, paint_layout 7, gc_cc 3 |
| IPC I/O Child | 11 | 0.5 | Idle 10, Other 0, Profiler 0 | 0 / 0 / 11 | poll_wait 10, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 51; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const [libxul.so` 1; `webrtc::LogSink::OnLogMessage(std::basic_string_view<char, std::char_t` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `js::frontend::SpecificParserAtomLookup<char16_t>::equalsEntry(js::Well` 1; `[]` 1; `js::frontend::TaggedParserAtomIndex js::frontend::WellKnownParserAtoms` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1

**tab pid 3261** — 0 ms CPU in the window

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

**tab pid 3093** — 0 ms CPU in the window

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

