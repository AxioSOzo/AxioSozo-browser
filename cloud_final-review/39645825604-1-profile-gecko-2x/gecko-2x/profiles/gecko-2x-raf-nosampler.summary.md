### gecko-2x raf-nosampler (profile pass)

**parent pid 2925** — 333 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 174 | 5.8 | Idle 89, Graphics 85 | 0 / 0 / 174 | ipc 173, poll_wait 90, webrender_render 85, webrender_sw_raster 74 |
| WRRenderBackend#0 | 36 | 1.2 | Other 35, Profiler 0 | 0 / 0 / 36 | webrender_render 0, poll_wait 0, webrender_scene 0, memcpy_memset 0 |
| GeckoMain | 34 | 1.1 | GC / CC 23, Idle 7, JavaScript 1, Other 1 | 1 / 1 / 32 | ipc 34, gc_cc 24, poll_wait 11, harness_diagnostics 2 |
| WRSceneBuilder#0 | 27 | 0.9 | Other 27 | 0 / 0 / 27 | webrender_scene 27, webrender_render 1, poll_wait 0, paint_layout 0 |
| Compositor | 25 | 0.8 | Idle 24, Other 1, Profiler 0 | 0 / 0 / 25 | ipc 25, poll_wait 24, webrender_render 0, paint_layout 0 |
| SwComposite | 22 | 0.7 | Other 22 | 0 / 0 / 22 | webrender_render 22, poll_wait 22, webrender_sw_raster 0, memcpy_memset 0 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `poll [libc.so.6]` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `evaluate.sandbox/promise< (chrome://remote/content/marionette/evaluate` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScriptEdge(js::B` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1; `js::gc::TraceCycleCollectorChildren(JSTracer*, js::Shape*) [libxul.so]` 1

**tab pid 3182** — 101 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 92 | 3.0 | Idle 67, Graphics 12, Other 5, Layout 4 | 0 / 1 / 91 | ipc 89, poll_wait 68, paint_layout 19, gc_cc 3 |
| IPC I/O Child | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 66; `[]` 2; `write [libc.so.6]` 2; `nsIContent::GetFlattenedTreeParent() const [libxul.so]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1; `sendmsg [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `nsTextFrame::BuildDisplayList(mozilla::nsDisplayListBuilder*, mozilla:` 1

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

**tab pid 3266** — 0 ms CPU in the window

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

