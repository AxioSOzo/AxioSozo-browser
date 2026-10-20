### gecko raf (profile pass)

**parent pid 2850** — 455 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 264 | 8.6 | Graphics 165, Idle 99 | 0 / 0 / 264 | ipc 264, webrender_render 165, webrender_sw_raster 150, poll_wait 101 |
| WRRenderBackend#0 | 49 | 1.6 | Other 49 | 0 / 0 / 49 | memcpy_memset 0, webrender_render 0, array_buffer_copy 0 |
| GeckoMain | 47 | 1.5 | GC / CC 23, Idle 19, JavaScript 1, Profiler 1 | 0 / 1 / 46 | ipc 47, gc_cc 24, poll_wait 20, paint_layout 2 |
| WRSceneBuilder#0 | 34 | 1.1 | Other 34 | 0 / 0 / 34 | webrender_scene 34, webrender_render 1, memcpy_memset 0, paint_layout 0 |
| Compositor | 32 | 1.0 | Idle 32, Other 0 | 0 / 0 / 32 | ipc 32, poll_wait 32, paint_layout 0, webrender_scene 0 |
| SwComposite | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_render 14, poll_wait 13, webrender_sw_raster 1, memcpy_memset 1 |
| IPC I/O Parent | 8 | 0.3 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 19; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `JS::GCThingTraceKind(void*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 1; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 1; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 1

**tab pid 3089** — 139 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 126 | 4.1 | Idle 84, Graphics 13, Layout 9, GC / CC 6 | 0 / 6 / 120 | ipc 121, poll_wait 85, paint_layout 30, gc_cc 8 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 84; `[]` 3; `sendmsg [libc.so.6]` 3; `getcontext [libc.so.6]` 1; `CCGraphBuilder::DescribeRefCountedNode(unsigned long, char const*) [li` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::jit::CallIRGenerator::tryAttachStub() [libxul.so]` 1

**tab pid 3012** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint(bool) [li` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3030** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsIEventTarget::IsOnCurrentThread() [libxul.so]` 0

