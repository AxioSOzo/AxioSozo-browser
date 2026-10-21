### gecko-2x scroll (profile pass)

**parent pid 2925** — 1048 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 778 | 38.2 | Graphics 718, Idle 60, Other 0 | 0 / 0 / 778 | ipc 772, webrender_render 718, webrender_sw_raster 685, poll_wait 60 |
| GeckoMain | 101 | 4.9 | Idle 54, GC / CC 26, JavaScript 7, Other 5 | 0 / 6 / 94 | ipc 100, poll_wait 64, gc_cc 27, paint_layout 7 |
| SwComposite | 65 | 3.2 | Other 65 | 0 / 0 / 65 | webrender_render 65, poll_wait 61, memcpy_memset 4, webrender_sw_raster 4 |
| WRRenderBackend#0 | 59 | 2.9 | Other 59 | 0 / 0 / 59 | webrender_render 1, webrender_scene 1, poll_wait 0 |
| Compositor | 20 | 1.0 | Idle 20, Other 0, Profiler 0 | 0 / 0 / 20 | ipc 20, poll_wait 20, paint_layout 0, webrender_scene 0 |
| WRSceneBuilder#0 | 17 | 0.8 | Other 17 | 0 / 0 / 17 | webrender_scene 17, webrender_render 1, poll_wait 0 |
| IPC I/O Parent | 6 | 0.3 | Idle 5, Other 0 | 0 / 0 / 6 | poll_wait 5, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 54; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, JS::Handle<` 2; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `recvmsg [libc.so.6]` 2; `mozilla::nsDisplayOutline::CreateWebRenderCommands(mozilla::wr::Displa` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1

**tab pid 3182** — 80 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 70 | 3.4 | Idle 54, Other 7, Graphics 5, JavaScript 3 | 0 / 3 / 67 | ipc 69, poll_wait 55, paint_layout 9, harness_diagnostics 2 |
| IPC I/O Child | 10 | 0.5 | Idle 9, Other 0 | 0 / 0 / 10 | poll_wait 9, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 55; `sendmsg [libc.so.6]` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const [libxul.so` 1; `JS::ForOfIterator::next(JS::MutableHandle<JS::Value>, bool*) [libxul.s` 1; `js::frontend::GeneralParser<js::frontend::SyntaxParseHandler, char16_t` 1; `__memcmp_evex_movbe [libc.so.6]` 1; `nsIFrame::Extend3DContext(nsStyleDisplay const*, nsStyleEffects const*` 1

**tab pid 3110** — 1 ms CPU in the window

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

**tab pid 3071** — 0 ms CPU in the window

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

