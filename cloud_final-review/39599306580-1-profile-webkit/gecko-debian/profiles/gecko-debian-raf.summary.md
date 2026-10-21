### gecko-debian raf (profile pass)

**parent pid 8168** — 660 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 353 | 11.4 | Graphics 252, Idle 100, Profiler 2, Other 0 | 0 / 0 / 353 | ipc 351, webrender_render 254, webrender_sw_raster 226, poll_wait 99 |
| WRRenderBackend#0 | 81 | 2.6 | Other 81, Profiler 0 | 0 / 0 / 81 | webrender_render 2, poll_wait 1, memcpy_memset 0 |
| GeckoMain | 72 | 2.3 | GC / CC 34, Idle 25, JavaScript 7, Other 3 | 0 / 7 / 65 | ipc 72, gc_cc 40, poll_wait 27, harness_diagnostics 5 |
| WRSceneBuilder#0 | 54 | 1.7 | Other 53, Profiler 0 | 0 / 0 / 54 | webrender_scene 54, webrender_render 2, poll_wait 0, memcpy_memset 0 |
| Compositor | 52 | 1.7 | Idle 51, Other 1, Profiler 0 | 0 / 0 / 52 | ipc 52, poll_wait 50, webrender_render 0, paint_layout 0 |
| SwComposite | 22 | 0.7 | Other 22 | 0 / 0 / 22 | webrender_render 22, poll_wait 21, memcpy_memset 1, webrender_sw_raster 1 |
| IPC I/O Parent | 13 | 0.4 | Idle 13, Other 0 | 0 / 0 / 13 | poll_wait 13, ipc 0 |
| WRSceneBuilderLP#0 | 7 | 0.2 | Other 7 | 0 / 0 / 7 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 27; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `[axiosozo-dev]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `syscall [libc.so.6]` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 2; `mprotect [libc.so.6]` 1

**tab pid 8417** — 236 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 212 | 6.8 | Idle 104, Graphics 36, Layout 27, Other 23 | 1 / 12 / 198 | ipc 199, poll_wait 107, paint_layout 89, gc_cc 5 |
| IPC I/O Child | 20 | 0.6 | Idle 19, Other 0 | 0 / 0 / 20 | poll_wait 19, ipc 0 |
| Timer | 5 | 0.2 | Other 5 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 115; `[]` 5; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `mozilla::FlattenedDisplayListIterator::GetNextItem() [libxul.so]` 2; `mozilla::nsCSSGradientRenderer::Create(nsPresContext*, mozilla::Comput` 2

**tab pid 8358** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8331** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

