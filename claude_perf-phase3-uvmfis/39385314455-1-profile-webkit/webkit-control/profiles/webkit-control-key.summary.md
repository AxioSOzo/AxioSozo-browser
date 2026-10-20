### webkit-control key (profile pass)

**parent pid 9563** — 798 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 449 | 12.3 | Idle 208, JavaScript 81, Other 39, Layout 31 | 9 / 133 / 308 | ipc 449, poll_wait 250, gc_cc 103, paint_layout 74 |
| DOM Worker | 193 | 5.3 | JavaScript 184, Profiler 6, Other 3 | 0 / 0 / 193 | subprocess_pipe_io 193, worker_messaging 193, ipc 193, js_ctypes 175 |
| Renderer | 44 | 1.2 | Idle 24, Graphics 20 | 0 / 0 / 44 | ipc 43, poll_wait 25, webrender_render 20, webrender_sw_raster 17 |
| SwComposite | 34 | 0.9 | Other 34 | 0 / 0 / 34 | webrender_render 34, poll_wait 18, webrender_sw_raster 16, memcpy_memset 3 |
| Timer | 27 | 0.7 | Other 27 | 0 / 0 / 27 | ipc 27, poll_wait 26, memcpy_memset 0 |
| Compositor | 15 | 0.4 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 14, canvas_2d 0, webrender_render 0 |
| WRRenderBackend#0 | 13 | 0.3 | Other 13 | 0 / 0 / 13 | webrender_render 1, poll_wait 1, memcpy_memset 0, webrender_scene 0 |
| BackgroundThreadPool #2 | 9 | 0.2 | Idle 8, Other 1 | 0 / 0 / 9 | ipc 9, poll_wait 8, native_receiver 1, memcpy_memset 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 221; `[unknown]` 16; `[axiosozo-dev]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4; `nsLayoutUtils::GetTransformToAncestor(mozilla::RelativeTo, mozilla::Re` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `__lll_lock_wait [libc.so.6]` 4

**tab pid 9653** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Other 0, DOM 0 | 0 / 1 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `__strlen_evex [libc.so.6]` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::PropertyKe` 0; `[unknown]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0

**tab pid 9708** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9972** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

