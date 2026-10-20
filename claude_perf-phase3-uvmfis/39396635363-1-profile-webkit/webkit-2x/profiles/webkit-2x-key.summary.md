### webkit-2x key (profile pass)

**parent pid 8806** — 906 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 433 | 11.8 | Idle 222, JavaScript 89, Layout 32, Graphics 27 | 15 / 129 / 290 | ipc 432, poll_wait 258, gc_cc 84, paint_layout 76 |
| DOM Worker | 188 | 5.1 | JavaScript 183, Profiler 3, Other 1 | 0 / 0 / 188 | subprocess_pipe_io 188, worker_messaging 187, ipc 187, js_ctypes 172 |
| Renderer | 117 | 3.2 | Graphics 80, Idle 36, Other 1 | 0 / 0 / 117 | ipc 117, webrender_render 81, webrender_sw_raster 71, poll_wait 36 |
| SwComposite | 79 | 2.1 | Other 79 | 0 / 0 / 79 | webrender_render 79, webrender_sw_raster 42, memcpy_memset 41, poll_wait 36 |
| Timer | 27 | 0.8 | Other 27, Profiler 0 | 0 / 0 / 27 | ipc 27, poll_wait 27 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 |  |
| Compositor | 15 | 0.4 | Idle 15, Other 1 | 0 / 0 / 15 | ipc 15, poll_wait 15, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 8, Graphics 1 | 0 / 0 / 9 | webrender_scene 9, poll_wait 1, webrender_sw_raster 1, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 236; `[unknown]` 14; `[axiosozo-dev]` 7; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc<(js::Allo` 6; `js::jit::CacheIRWriter::callDOMGetterResult(js::jit::ObjOperandId, voi` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `nsIFrame::ComputeBorderRadii(mozilla::StyleGenericBorderRadius<mozilla` 4

**tab pid 8901** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, DOM 0, JavaScript 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::ResolvePromiseInternal(JSContext*, JS::Handle<JSObject*>, JS::Hand` 0; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*, JS::Hand` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `mozilla::dom::JSActor::ReceiveQuery(JSContext*, mozilla::dom::JSActorM` 0

**tab pid 9363** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInternal(mozil` 0

**tab pid 8994** — 1 ms CPU in the window

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

