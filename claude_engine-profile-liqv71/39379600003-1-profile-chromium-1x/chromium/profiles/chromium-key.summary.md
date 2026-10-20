### chromium key (profile pass)

**parent pid 3165** — 358 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 192 | 5.3 | Idle 77, JavaScript 46, Layout 21, Graphics 15 | 6 / 72 / 115 | ipc 191, poll_wait 94, gc_cc 50, paint_layout 44 |
| DOM Worker | 88 | 2.4 | JavaScript 85, Other 2, Profiler 1 | 0 / 0 / 88 | subprocess_pipe_io 88, worker_messaging 88, ipc 88, js_ctypes 83 |
| Renderer | 19 | 0.5 | Idle 12, Graphics 6 | 0 / 0 / 19 | ipc 19, poll_wait 12, webrender_render 6, webrender_sw_raster 4 |
| Timer | 18 | 0.5 | Other 18 | 0 / 0 / 18 | ipc 18, poll_wait 17 |
| SwComposite | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_render 13, poll_wait 10, webrender_sw_raster 3, memcpy_memset 1 |
| Compositor | 8 | 0.2 | Idle 8, Other 0 | 0 / 0 / 8 | ipc 8, poll_wait 8, webrender_render 0, canvas_2d 0 |
| WRRenderBackend#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 |  |
| WRSceneBuilder#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 | webrender_scene 6, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 78; `[unknown]` 8; `[axiosozo-dev]` 3; `mprotect [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2; `std::__uniq_ptr_impl<mozilla::ScrollSnapTargetIds, std::default_delete` 2; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&, mozilla::` 2; `recvmsg [libc.so.6]` 2

**tab pid 3259** — 14 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.3 | GC / CC 6, Idle 6, JavaScript 0, Other 0 | 0 / 0 / 12 | ipc 10, poll_wait 8, gc_cc 6, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `FixWeakMappingGrayBitsTracer::trace(JSObject*, JS::GCCellPtr, JS::GCCe` 0; `js::PromiseObject::resolve(JSContext*, JS::Handle<js::PromiseObject*>,` 0; `[]` 0; `JSFunction::needsCallObject() const [libxul.so]` 0

**tab pid 3317** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, GC / CC 1, Profiler 0, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0; `sendmsg [libc.so.6]` 0

**tab pid 3953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

