### gecko-debian scroll (profile pass)

**parent pid 8162** — 906 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 614 | 30.1 | Graphics 560, Idle 53, Profiler 1 | 0 / 0 / 614 | ipc 605, webrender_render 561, webrender_sw_raster 537, poll_wait 56 |
| GeckoMain | 128 | 6.3 | Idle 64, GC / CC 37, Other 11, Graphics 7 | 1 / 4 / 123 | ipc 127, poll_wait 79, gc_cc 38, paint_layout 10 |
| WRRenderBackend#0 | 67 | 3.3 | Other 67 | 0 / 0 / 67 | webrender_render 2, gc_cc 1, poll_wait 1, memcpy_memset 0 |
| SwComposite | 33 | 1.6 | Other 33 | 0 / 0 / 33 | webrender_render 33, poll_wait 32, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 28 | 1.4 | Idle 28, Other 0, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 28, memcpy_memset 0, canvas_2d 0 |
| WRSceneBuilder#0 | 21 | 1.0 | Other 21 | 0 / 0 / 21 | webrender_scene 21, webrender_render 1, paint_layout 1, poll_wait 0 |
| IPC I/O Parent | 8 | 0.4 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 69; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 3; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 2; `[libgobject-2.0.so.0]` 1; `[linux-vdso.so.1]` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1

**tab pid 8404** — 105 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 90 | 4.4 | Idle 59, Other 10, Graphics 9, GC / CC 5 | 0 / 3 / 88 | ipc 86, poll_wait 59, paint_layout 14, gc_cc 7 |
| IPC I/O Child | 14 | 0.7 | Idle 14, Other 0 | 0 / 0 / 14 | poll_wait 14, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 61; `[]` 2; `nsIFrame::GetOverflowRect(mozilla::OverflowType) const [libxul.so]` 2; `[linux-vdso.so.1]` 1; `js::jit::CacheIRCompiler::emitGuardToObject(js::jit::ValOperandId) [li` 1; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 1; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::CycleCollec` 1; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder*, mozilla` 1

**tab pid 8325** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8303** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `js::Nursery::wantEagerCollection() const [libxul.so]` 0

