### webkit-2x key (profile pass)

**parent pid 8674** — 959 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 458 | 12.5 | Idle 227, JavaScript 82, Other 44, Layout 30 | 9 / 131 / 318 | ipc 453, poll_wait 271, gc_cc 88, paint_layout 70 |
| DOM Worker | 187 | 5.1 | JavaScript 180, Profiler 3, Other 3 | 0 / 0 / 187 | subprocess_pipe_io 187, worker_messaging 187, ipc 187, js_ctypes 175 |
| Renderer | 121 | 3.3 | Graphics 79, Idle 41, Other 1 | 0 / 0 / 121 | ipc 121, webrender_render 80, webrender_sw_raster 61, poll_wait 44 |
| SwComposite | 79 | 2.2 | Other 79 | 0 / 0 / 79 | webrender_render 79, webrender_sw_raster 44, memcpy_memset 44, poll_wait 34 |
| Timer | 28 | 0.8 | Other 28, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 28 |
| BackgroundThreadPool #3 | 27 | 0.7 | Other 13, Idle 13, Graphics 1 | 0 / 0 / 27 | ipc 27, native_receiver 14, memcpy_memset 13, poll_wait 13 |
| WRRenderBackend#0 | 20 | 0.5 | Other 20 | 0 / 0 / 20 | memcpy_memset 1, webrender_render 0, poll_wait 0, webrender_scene 0 |
| Compositor | 16 | 0.4 | Idle 15, Other 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, webrender_render 0, canvas_2d 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 237; `[unknown]` 13; `[axiosozo-dev]` 9; `nsTArrayInfallibleAllocator::ResultTypeProxy nsTArray_base<nsTArray_Re` 5; `xpc::WindowGlobalOrNull(JSObject*) [libxul.so]` 5; `[linux-vdso.so.1]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 4

**tab pid 8765** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, JavaScript 0, DOM 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Profiler 0, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*>, JS::Han` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*, js::Maybe` 0; `mozilla::dom::XPCOMObjectToJsval(JSContext*, JS::Handle<JSObject*>, xp` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandle<JS::Valu` 0; `mozilla::dom::PContentChild::OnMessageReceived(IPC::Message const&) [l` 0

**tab pid 8826** — 1 ms CPU in the window

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

**tab pid 8875** — 1 ms CPU in the window

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

