### gecko-2x idle (profile pass)

**parent pid 2846** — 96 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 2.3 | GC / CC 30, Other 7, Idle 5, JavaScript 4 | 0 / 5 / 43 | ipc 48, gc_cc 33, poll_wait 10, harness_diagnostics 4 |
| DOM Worker | 38 | 1.9 | Other 34, GC / CC 4, Idle 0 | 0 / 0 / 38 | worker_messaging 38, ipc 38, gc_cc 38, memcpy_memset 16 |
| DOM Worker | 2 | 0.1 | GC / CC 1, Other 1, Idle 0 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 2, poll_wait 0 |
| Renderer | 2 | 0.1 | Graphics 1, Idle 0 | 0 / 0 / 2 | ipc 2, webrender_render 1, webrender_sw_raster 1, memcpy_memset 1 |
| SwComposite | 2 | 0.1 | Other 2 | 0 / 0 / 2 | webrender_render 2, memcpy_memset 1, webrender_sw_raster 1, poll_wait 0 |
| DOM Worker | 1 | 0.1 | Other 1, Idle 1 | 0 / 0 / 1 | worker_messaging 1, ipc 1, gc_cc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `void js::gc::MarkingTracerT<6u>::markAndTraverse<js::BaseScript>(js::B` 2; `syscall [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1

**tab pid 3106** — 23 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 19 | 0.9 | Idle 15, JavaScript 3, Other 1, Layout 0 | 0 / 3 / 16 | ipc 19, poll_wait 15, harness_diagnostics 3, gc_cc 2 |
| IPC I/O Child | 4 | 0.2 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 15; `js::jit::DoTypeOfFallback(JSContext*, js::jit::BaselineFrame*, js::jit` 2; `js::jit::JitHintsMap::mightHaveEagerBaselineHint(JSScript*) const [lib` 1; `write [libc.so.6]` 0; `firefox_on_glean::private::timing_distribution::TimingDistributionMetr` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0; `[]` 0; `[libxul.so]` 0

**tab pid 3044** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__memcmp_evex_movbe [libc.so.6]` 0

**tab pid 3004** — 1 ms CPU in the window

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

