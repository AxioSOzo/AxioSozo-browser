### gecko-2x raf-nosampler (profile pass)

**parent pid 2918** — 473 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 266 | 8.8 | Graphics 172, Idle 92, Other 2 | 0 / 0 / 266 | ipc 265, webrender_render 173, webrender_sw_raster 156, poll_wait 93 |
| WRRenderBackend#0 | 46 | 1.5 | Other 46 | 0 / 0 / 46 | webrender_render 0 |
| SwComposite | 44 | 1.4 | Other 44 | 0 / 0 / 44 | webrender_render 44, poll_wait 40, memcpy_memset 3, webrender_sw_raster 3 |
| GeckoMain | 39 | 1.3 | GC / CC 26, Idle 9, JavaScript 3, Other 1 | 0 / 2 / 37 | ipc 39, gc_cc 29, poll_wait 11, harness_diagnostics 2 |
| WRSceneBuilder#0 | 33 | 1.1 | Other 33 | 0 / 0 / 33 | webrender_scene 33, webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 32 | 1.0 | Idle 31, Other 1, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, paint_layout 0, webrender_render 0 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `poll [libc.so.6]` 9; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::UnmarkGrayTracer<1u>::unmark(JS::GCCellPtr) [libxul.so]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1

**tab pid 3167** — 125 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 112 | 3.7 | Idle 83, Graphics 10, Other 8, Layout 7 | 0 / 3 / 110 | ipc 110, poll_wait 84, paint_layout 22, gc_cc 1 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 83; `sendmsg [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `mozilla::dom::FragmentDirective::QueryInterface(nsID const&, void**) [` 1; `nsIFrame::GetCompositorHitTestInfoWithoutPointerEvents(mozilla::nsDisp` 1; `[]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 1

**tab pid 3066** — 1 ms CPU in the window

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

**tab pid 3105** — 1 ms CPU in the window

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

