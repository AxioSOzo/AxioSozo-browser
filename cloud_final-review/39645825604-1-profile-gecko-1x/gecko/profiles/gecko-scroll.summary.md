### gecko scroll (profile pass)

**parent pid 3126** — 970 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 638 | 30.7 | Graphics 575, Idle 64 | 0 / 0 / 638 | ipc 634, webrender_render 575, webrender_sw_raster 546, poll_wait 66 |
| GeckoMain | 144 | 7.0 | Idle 74, GC / CC 32, Other 16, Graphics 7 | 1 / 6 / 137 | ipc 144, poll_wait 100, gc_cc 36, paint_layout 13 |
| WRRenderBackend#0 | 79 | 3.8 | Other 79 | 0 / 0 / 79 | memcpy_memset 1, webrender_render 1, poll_wait 1 |
| SwComposite | 39 | 1.9 | Other 39 | 0 / 0 / 39 | webrender_render 39, poll_wait 37, memcpy_memset 2, webrender_sw_raster 2 |
| Compositor | 33 | 1.6 | Idle 32, Other 1 | 0 / 0 / 33 | ipc 33, poll_wait 32, paint_layout 0, webrender_render 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 | webrender_scene 22, webrender_render 1, memcpy_memset 0, poll_wait 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 75; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `recvmsg [libc.so.6]` 4; `__lll_lock_wake [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `mozilla::ThreadEventTarget::Dispatch(already_AddRefed<nsIRunnable>, ns` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2

**tab pid 3359** — 122 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 105 | 5.1 | Idle 64, Graphics 16, Other 8, GC / CC 8 | 0 / 3 / 102 | ipc 101, poll_wait 64, paint_layout 22, gc_cc 10 |
| IPC I/O Child | 16 | 0.8 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 64; `sendmsg [libc.so.6]` 3; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 1; `bool gfxFont::DrawGlyphs<(gfxFont::FontComplexityT)0, (gfxFont::Spacin` 1; `UpdateCurrentHitTestInfo(mozilla::nsDisplayListBuilder*, nsIFrame*) [l` 1; `[]` 1; `js::WeakMapBase::traceAllMappings(js::WeakMapTracer*) [libxul.so]` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 1

**tab pid 3385** — 1 ms CPU in the window

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

**tab pid 3284** — 1 ms CPU in the window

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

