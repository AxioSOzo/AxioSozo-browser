### gecko-2x raf (profile pass)

**parent pid 3036** — 611 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 283 | 9.1 | Graphics 190, Idle 91, Profiler 2, Other 0 | 0 / 0 / 283 | ipc 280, webrender_render 191, webrender_sw_raster 156, poll_wait 97 |
| SwComposite | 76 | 2.4 | Other 76 | 0 / 0 / 76 | webrender_render 76, poll_wait 70, webrender_sw_raster 5, memcpy_memset 5 |
| WRRenderBackend#0 | 68 | 2.2 | Other 68 | 0 / 0 / 68 | webrender_render 1, array_buffer_copy 0 |
| GeckoMain | 62 | 2.0 | GC / CC 27, Idle 26, JavaScript 6, Layout 2 | 1 / 5 / 57 | ipc 62, gc_cc 30, poll_wait 27, harness_diagnostics 4 |
| WRSceneBuilder#0 | 52 | 1.7 | Other 52 | 0 / 0 / 52 | webrender_scene 51, webrender_render 4, poll_wait 1, memcpy_memset 0 |
| Compositor | 46 | 1.5 | Idle 44, Other 2, Profiler 0 | 0 / 0 / 46 | ipc 46, poll_wait 44, paint_layout 1, webrender_render 0 |
| IPC I/O Parent | 12 | 0.4 | Idle 11, Other 0 | 0 / 0 / 12 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `mprotect [libc.so.6]` 1; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry const*) [lib` 1

**tab pid 3304** — 205 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 185 | 5.9 | Idle 111, Graphics 23, Layout 21, Other 9 | 0 / 10 / 175 | ipc 176, poll_wait 111, paint_layout 59, gc_cc 9 |
| IPC I/O Child | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 | poll_wait 17, ipc 0 |
| Timer | 3 | 0.1 | Other 3 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 111; `sendmsg [libc.so.6]` 5; `[]` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 3395** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

**tab pid 3203** — 1 ms CPU in the window

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

