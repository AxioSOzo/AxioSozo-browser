### gecko raf-nosampler (profile pass)

**parent pid 3045** — 640 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 371 | 12.1 | Graphics 286, Idle 84, Profiler 1, Other 0 | 0 / 0 / 371 | ipc 367, webrender_render 287, webrender_sw_raster 248, poll_wait 88 |
| WRRenderBackend#0 | 85 | 2.8 | Other 85 | 0 / 0 / 85 | memcpy_memset 1, webrender_render 1 |
| WRSceneBuilder#0 | 57 | 1.9 | Other 56, Profiler 0 | 0 / 0 / 57 | webrender_scene 57, webrender_render 3, poll_wait 0, array_buffer_copy 0 |
| Compositor | 54 | 1.8 | Idle 53, Other 1, Profiler 0 | 0 / 0 / 54 | ipc 54, poll_wait 52, webrender_render 1, paint_layout 0 |
| GeckoMain | 38 | 1.3 | GC / CC 20, Idle 12, JavaScript 5, Other 2 | 1 / 4 / 34 | ipc 38, gc_cc 22, poll_wait 13, harness_diagnostics 5 |
| SwComposite | 15 | 0.5 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 14, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 12 | 0.4 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 2; `js::SavedStacks::insertFrames(JSContext*, JS::MutableHandle<js::SavedF` 1; `execute (chrome://remote/content/marionette/server.sys.mjs:284:16)[22]` 1; `void js::jit::TryAttachStub<js::jit::GetPropIRGenerator, js::jit::Cach` 1; `mozilla::EventListenerManager::TraceListeners(JSTracer*) [libxul.so]` 1

**tab pid 3297** — 238 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 215 | 7.0 | Idle 102, Graphics 46, Layout 39, Other 15 | 0 / 10 / 205 | ipc 202, poll_wait 102, paint_layout 101, canvas_2d 5 |
| IPC I/O Child | 21 | 0.7 | Idle 21, Other 0 | 0 / 0 / 21 | poll_wait 21, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 101; `[]` 9; `sendmsg [libc.so.6]` 6; `getcontext [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `webrender_api::display_list::DisplayListBuilder::push_iter [libxul.so]` 2; `write [libc.so.6]` 2; `bool gfxFont::DrawGlyphs<(gfxFont::FontComplexityT)0, (gfxFont::Spacin` 2

**tab pid 3300** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[libglib-2.0.so.0]` 0

**tab pid 3385** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 0

