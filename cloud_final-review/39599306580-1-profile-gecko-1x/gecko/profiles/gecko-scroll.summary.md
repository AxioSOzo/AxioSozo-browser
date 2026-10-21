### gecko scroll (profile pass)

**parent pid 3086** — 985 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 654 | 31.5 | Graphics 596, Idle 58 | 0 / 0 / 654 | ipc 648, webrender_render 596, webrender_sw_raster 562, poll_wait 62 |
| GeckoMain | 144 | 7.0 | Idle 75, GC / CC 28, Other 13, Graphics 10 | 0 / 9 / 135 | ipc 144, poll_wait 98, gc_cc 34, paint_layout 18 |
| WRRenderBackend#0 | 79 | 3.8 | Other 79 | 0 / 0 / 79 | webrender_render 2, poll_wait 0 |
| SwComposite | 39 | 1.9 | Other 39 | 0 / 0 / 39 | webrender_render 39, poll_wait 37, memcpy_memset 2, webrender_sw_raster 2 |
| Compositor | 33 | 1.6 | Idle 32, Other 1 | 0 / 0 / 33 | ipc 33, poll_wait 32, webrender_scene 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 21 | 1.0 | Other 21 | 0 / 0 / 21 | webrender_scene 21, webrender_render 2, poll_wait 0, paint_layout 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 2 | 0.1 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 76; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 2; `write [libc.so.6]` 2; `writev [libc.so.6]` 2; `sendmsg [libc.so.6]` 1

**tab pid 3315** — 124 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 107 | 5.1 | Idle 63, Graphics 16, Other 10, GC / CC 7 | 0 / 4 / 102 | ipc 102, poll_wait 65, paint_layout 24, gc_cc 11 |
| IPC I/O Child | 16 | 0.8 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 64; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 3; `[]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::jit::CompilerFrameInfo::storeStackValue(int, js::jit::Address cons` 1

**tab pid 3248** — 1 ms CPU in the window

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

**tab pid 3408** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

