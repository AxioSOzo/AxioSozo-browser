### webkit key (profile pass)

**parent pid 7188** — 1029 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 598 | 16.2 | Idle 242, JavaScript 91, GC / CC 81, Other 54 | 9 / 154 / 435 | ipc 597, poll_wait 288, gc_cc 179, paint_layout 93 |
| DOM Worker | 255 | 6.9 | JavaScript 245, Other 7, Profiler 3 | 0 / 0 / 255 | subprocess_pipe_io 255, worker_messaging 255, ipc 255, js_ctypes 242 |
| Renderer | 57 | 1.6 | Graphics 36, Idle 22, Other 0 | 0 / 0 / 57 | ipc 57, webrender_render 36, webrender_sw_raster 29, poll_wait 22 |
| Timer | 35 | 0.9 | Other 35, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 35 |
| SwComposite | 20 | 0.5 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 17, webrender_sw_raster 3, memcpy_memset 3 |
| Compositor | 18 | 0.5 | Idle 16, Other 2 | 0 / 0 / 18 | ipc 18, poll_wait 16, memcpy_memset 2, paint_layout 0 |
| WRRenderBackend#0 | 17 | 0.5 | Other 17 | 0 / 0 / 17 | webrender_render 1, poll_wait 0, webrender_scene 0 |
| WRSceneBuilder#0 | 10 | 0.3 | Other 9, Graphics 1 | 0 / 0 / 10 | webrender_scene 10, webrender_sw_raster 1, webrender_render 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 264; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 18; `[axiosozo-dev]` 14; `[unknown]` 9; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 6; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5

**tab pid 7274** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Other 0, DOM 0 | 0 / 1 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::RunScript(JSContext*, js::RunState&) [libxul.so]` 0; `non-virtual thunk to nsDocShell::GetWindow() [libxul.so]` 0; `mozilla::dom::WindowContext_Binding::get_isInBFCache(JSContext*, JS::H` 0; `NS_CycleCollectorSuspect3 [libxul.so]` 0; `[]` 0

**tab pid 7360** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::NodeController::ForwardEvent(mojo::core::ports::NodeName` 0

**tab pid 7745** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

