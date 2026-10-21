### gecko-2x raf (profile pass)

**parent pid 3050** — 578 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 267 | 8.6 | Graphics 165, Idle 102, Other 0 | 0 / 0 / 267 | ipc 267, webrender_render 165, webrender_sw_raster 141, poll_wait 105 |
| SwComposite | 69 | 2.2 | Other 69 | 0 / 0 / 69 | webrender_render 69, poll_wait 63, webrender_sw_raster 6, memcpy_memset 6 |
| GeckoMain | 62 | 2.0 | GC / CC 28, Idle 19, JavaScript 6, Other 5 | 0 / 6 / 57 | ipc 62, gc_cc 34, poll_wait 21, harness_diagnostics 5 |
| WRRenderBackend#0 | 62 | 2.0 | Other 62 | 0 / 0 / 62 | memcpy_memset 0, poll_wait 0, webrender_render 0 |
| WRSceneBuilder#0 | 49 | 1.6 | Other 49, Profiler 0 | 0 / 0 / 49 | webrender_scene 49, webrender_render 3, poll_wait 1, memcpy_memset 1 |
| Compositor | 44 | 1.4 | Idle 42, Other 2 | 0 / 0 / 44 | ipc 44, poll_wait 42, webrender_render 1, paint_layout 0 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `bool mozilla::detail::HashTable<char const* const, mozilla::HashSet<ch` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `[axiosozo-dev]` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint(bool) [li` 1

**tab pid 3293** — 182 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 164 | 5.2 | Idle 104, Graphics 18, Layout 13, Other 9 | 0 / 9 / 154 | ipc 157, poll_wait 105, paint_layout 43, gc_cc 10 |
| IPC I/O Child | 17 | 0.5 | Idle 16, Other 0 | 0 / 0 / 17 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 104; `[]` 4; `sendmsg [libc.so.6]` 3; `getcontext [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 1; `IPC::ChannelPosix::ProcessOutgoingMessages() [libxul.so]` 1

**tab pid 3385** — 1 ms CPU in the window

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

**tab pid 3382** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0

