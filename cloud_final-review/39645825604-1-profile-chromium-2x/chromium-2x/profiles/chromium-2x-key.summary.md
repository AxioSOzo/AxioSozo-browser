### chromium-2x key (profile pass)

**parent pid 3512** — 854 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 374 | 10.1 | Idle 169, JavaScript 68, Layout 44, Other 33 | 8 / 122 / 243 | ipc 374, poll_wait 209, paint_layout 82, gc_cc 78 |
| DOM Worker | 235 | 6.4 | JavaScript 228, Other 4, Profiler 2 | 0 / 0 / 235 | subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 220 |
| Renderer | 109 | 3.0 | Graphics 101, Idle 8 | 0 / 0 / 109 | ipc 106, webrender_render 101, webrender_sw_raster 87, poll_wait 11 |
| SwComposite | 38 | 1.0 | Other 38 | 0 / 0 / 38 | webrender_render 38, poll_wait 22, webrender_sw_raster 16, memcpy_memset 16 |
| Timer | 38 | 1.0 | Other 38, Profiler 0 | 0 / 0 / 38 | ipc 38, poll_wait 37 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 |  |
| Compositor | 15 | 0.4 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 14, memcpy_memset 0, webrender_render 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9, Graphics 0 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 0, poll_wait 0, array_buffer_copy 0 |

Main thread, top self: `poll [libc.so.6]` 169; `[unknown]` 14; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 4; `mprotect [libc.so.6]` 4; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 4

**tab pid 3603** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Other 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[0` 0; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, JS::CallArg` 0; `GetExistingDataProperty(JSContext*, JS::Handle<js::NativeObject*>, JS:` 0; `[unknown]` 0; `JSStructuredCloneReader::readObjectField(JS::Handle<JSObject*>, JS::Ha` 0

**tab pid 4174** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsTimer::InitWithNamedFuncCallback(void (*)(nsITimer*, void*), void*, ` 0

**tab pid 3653** — 1 ms CPU in the window

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

