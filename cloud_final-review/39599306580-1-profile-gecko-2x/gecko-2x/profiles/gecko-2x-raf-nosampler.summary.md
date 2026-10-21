### gecko-2x raf-nosampler (profile pass)

**parent pid 3050** — 625 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 354 | 11.6 | Graphics 255, Idle 97, Other 2 | 0 / 0 / 354 | ipc 353, webrender_render 257, webrender_sw_raster 231, poll_wait 96 |
| WRRenderBackend#0 | 58 | 1.9 | Other 58 | 0 / 0 / 58 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| SwComposite | 58 | 1.9 | Other 58 | 0 / 0 / 58 | webrender_render 58, poll_wait 51, memcpy_memset 7, webrender_sw_raster 7 |
| WRSceneBuilder#0 | 46 | 1.5 | Other 46 | 0 / 0 / 46 | webrender_scene 46, webrender_render 3, poll_wait 1, gc_cc 0 |
| GeckoMain | 45 | 1.5 | GC / CC 27, Idle 12, DOM 4, Other 1 | 0 / 5 / 40 | ipc 45, gc_cc 28, poll_wait 13, harness_diagnostics 5 |
| Compositor | 43 | 1.4 | Idle 42, Other 1, Profiler 0 | 0 / 0 / 43 | ipc 43, poll_wait 41, paint_layout 1, webrender_render 0 |
| IPC I/O Parent | 11 | 0.3 | Idle 10, Other 0, Profiler 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `Native2WrappedNativeMap::Find(nsISupports*) const [libxul.so]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 2; `bool js::gc::UnmarkGrayTracer<8u>::onChild<js::BaseScript>(js::BaseScr` 2

**tab pid 3293** — 166 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 148 | 4.9 | Idle 95, Graphics 20, Layout 13, Other 7 | 0 / 3 / 145 | ipc 137, poll_wait 95, paint_layout 39, gc_cc 5 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 95; `[]` 6; `sendmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `write [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1

**tab pid 3188** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3227** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0

