### chromium key (profile pass)

**parent pid 3402** — 814 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 388 | 10.5 | Idle 158, JavaScript 76, Other 39, Layout 35 | 13 / 135 / 240 | ipc 388, poll_wait 201, gc_cc 96, paint_layout 82 |
| DOM Worker | 258 | 7.0 | JavaScript 252, Profiler 3, Other 3 | 0 / 0 / 258 | subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 242 |
| Renderer | 56 | 1.5 | Graphics 36, Idle 20 | 0 / 0 / 56 | ipc 54, webrender_render 36, webrender_sw_raster 31, poll_wait 21 |
| Timer | 36 | 1.0 | Other 36, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 35, memcpy_memset 0 |
| SwComposite | 16 | 0.4 | Other 16 | 0 / 0 / 16 | webrender_render 16, poll_wait 15, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 15 | 0.4 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, paint_layout 0, webrender_render 0 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_render 0, poll_wait 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9, Graphics 0 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 0, poll_wait 0, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 161; `[unknown]` 20; `recvmsg [libc.so.6]` 9; `[axiosozo-dev]` 9; `write [libc.so.6]` 8; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `syscall [libc.so.6]` 3

**tab pid 3506** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, JavaScript 1, Profiler 0, DOM 0 | 0 / 1 / 6 | ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuffer::PutObj` 0; `nsContentUtils::SubjectPrincipal() [libxul.so]` 0; `XPCWrappedNativeScope::GetExpandoChain(JS::Handle<JSObject*>) [libxul.` 0; `js::fun_apply(JSContext*, unsigned int, JS::Value*) [libxul.so]` 0; `lazyGetter (resource://gre/modules/XPCOMUtils.sys.mjs:237:24)[9]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozilla::dom::JS` 0

**tab pid 4053** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3604** — 1 ms CPU in the window

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

