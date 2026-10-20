### gecko raf (profile pass)

**parent pid 3045** — 703 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 374 | 12.0 | Graphics 279, Idle 93, Other 2, Profiler 0 | 0 / 0 / 374 | ipc 372, webrender_render 279, webrender_sw_raster 240, poll_wait 99 |
| WRRenderBackend#0 | 92 | 2.9 | Other 92 | 0 / 0 / 92 | webrender_render 1, memcpy_memset 0, poll_wait 0 |
| GeckoMain | 75 | 2.4 | GC / CC 32, Idle 26, JavaScript 8, Layout 3 | 0 / 8 / 67 | ipc 75, gc_cc 38, poll_wait 29, harness_diagnostics 7 |
| WRSceneBuilder#0 | 58 | 1.9 | Other 58 | 0 / 0 / 58 | webrender_scene 58, webrender_render 2, poll_wait 0, paint_layout 0 |
| Compositor | 55 | 1.8 | Idle 54, Other 1, Profiler 0 | 0 / 0 / 55 | ipc 55, poll_wait 54, webrender_render 1, paint_layout 0 |
| SwComposite | 21 | 0.7 | Other 21 | 0 / 0 / 21 | webrender_render 21, poll_wait 20, webrender_sw_raster 1, memcpy_memset 1 |
| IPC I/O Parent | 13 | 0.4 | Idle 13, Other 0 | 0 / 0 / 13 | poll_wait 13, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 7 | 0.2 | Other 7 | 0 / 0 / 7 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 27; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `mprotect [libc.so.6]` 3; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 2; `read [libc.so.6]` 2; `nsRect::Intersect(nsRect const&) const [libxul.so]` 1

**tab pid 3297** — 274 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 246 | 7.9 | Idle 108, Layout 46, Graphics 45, Other 17 | 0 / 15 / 230 | ipc 228, paint_layout 114, poll_wait 111, gc_cc 11 |
| IPC I/O Child | 22 | 0.7 | Idle 21, Other 0 | 0 / 0 / 22 | poll_wait 21, ipc 0 |
| Timer | 7 | 0.2 | Other 7 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 109; `sendmsg [libc.so.6]` 9; `[]` 7; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `getcontext [libc.so.6]` 3; `__strlen_avx2 [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `std::__detail::_Map_base<unsigned long, std::pair<unsigned long const,` 2

**tab pid 3190** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3387** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

