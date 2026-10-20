### gecko-2x raf (profile pass)

**parent pid 2847** — 498 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 185 | 6.0 | Idle 93, Graphics 91, Other 1 | 0 / 0 / 185 | ipc 185, poll_wait 97, webrender_render 91, webrender_sw_raster 58 |
| WRRenderBackend#0 | 78 | 2.5 | Other 78 | 0 / 0 / 78 | webrender_render 0, memcpy_memset 0, webrender_scene 0 |
| GeckoMain | 67 | 2.2 | GC / CC 32, Idle 26, JavaScript 4, Other 2 | 0 / 4 / 63 | ipc 67, gc_cc 34, poll_wait 28, harness_diagnostics 4 |
| WRSceneBuilder#0 | 53 | 1.7 | Other 52, Profiler 0 | 0 / 0 / 53 | webrender_scene 53, webrender_render 3, memcpy_memset 1, poll_wait 0 |
| SwComposite | 52 | 1.7 | Other 52 | 0 / 0 / 52 | webrender_render 52, poll_wait 48, memcpy_memset 4, webrender_sw_raster 4 |
| Compositor | 45 | 1.4 | Idle 43, Other 1, Profiler 0 | 0 / 0 / 45 | ipc 45, poll_wait 43, webrender_render 1, paint_layout 0 |
| IPC I/O Parent | 11 | 0.3 | Idle 10, Other 0 | 0 / 0 / 11 | poll_wait 10, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 14; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `mprotect [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::CycleCollec` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 1; `nsWindowRoot::cycleCollection::TraceWrapper(void*, TraceCallbacks cons` 1

**tab pid 3114** — 261 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 240 | 7.8 | Idle 101, Graphics 48, Layout 47, Other 26 | 0 / 12 / 227 | ipc 222, paint_layout 113, poll_wait 104, gc_cc 12 |
| IPC I/O Child | 17 | 0.5 | Idle 16, Other 0 | 0 / 0 / 17 | poll_wait 16, ipc 0 |
| Timer | 5 | 0.2 | Other 5 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 100; `sendmsg [libc.so.6]` 6; `[]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisplayListBui` 2; `__lll_lock_wait [libc.so.6]` 2; `read [libc.so.6]` 2; `getcontext [libc.so.6]` 2

**tab pid 3021** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0

**tab pid 3186** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsTimerEvent::Run() [libxul.so]` 0

