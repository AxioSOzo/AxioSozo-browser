### gecko-2x scroll (profile pass)

**parent pid 2918** — 1486 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1126 | 55.4 | Graphics 1070, Idle 56, Profiler 0 | 0 / 0 / 1126 | ipc 1111, webrender_render 1070, webrender_sw_raster 1004, poll_wait 57 |
| SwComposite | 123 | 6.0 | Other 123 | 0 / 0 / 123 | webrender_render 123, poll_wait 109, webrender_sw_raster 13, memcpy_memset 12 |
| GeckoMain | 115 | 5.7 | Idle 64, GC / CC 31, Other 8, Graphics 5 | 0 / 2 / 113 | ipc 115, poll_wait 77, gc_cc 32, paint_layout 9 |
| WRRenderBackend#0 | 68 | 3.3 | Other 68, Profiler 0 | 0 / 0 / 68 | webrender_render 1, poll_wait 0, memcpy_memset 0, array_buffer_copy 0 |
| Compositor | 24 | 1.2 | Idle 24, Other 0, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 24, paint_layout 0 |
| WRSceneBuilder#0 | 19 | 0.9 | Other 19 | 0 / 0 / 19 | webrender_scene 19, webrender_render 1, poll_wait 0, memcpy_memset 0 |
| IPC I/O Parent | 7 | 0.3 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 65; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3; `[axiosozo-dev]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 2; `JSObject2WrappedJSMap::UpdateWeakPointersAfterGC(JSTracer*) [libxul.so` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2

**tab pid 3167** — 94 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 80 | 4.0 | Idle 58, Graphics 7, Other 5, GC / CC 5 | 0 / 3 / 78 | ipc 78, poll_wait 58, paint_layout 11, gc_cc 8 |
| IPC I/O Child | 11 | 0.6 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 57; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::layers::WebRenderBridgeChild::GetFontKeyForScaledFont(mozilla` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::jit::Assembler::movq(js::jit::Register, js::jit::Operand const&) [` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1

**tab pid 3189** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3087** — 1 ms CPU in the window

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

