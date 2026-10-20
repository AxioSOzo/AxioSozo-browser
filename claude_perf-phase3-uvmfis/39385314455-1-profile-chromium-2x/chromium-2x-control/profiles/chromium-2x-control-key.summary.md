### chromium-2x-control key (profile pass)

**parent pid 4435** — 923 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 385 | 10.4 | Idle 161, JavaScript 85, Layout 42, Other 37 | 11 / 135 / 238 | ipc 385, poll_wait 202, gc_cc 105, paint_layout 79 |
| DOM Worker | 264 | 7.1 | JavaScript 259, Profiler 4, Other 2 | 0 / 0 / 264 | subprocess_pipe_io 264, worker_messaging 264, ipc 264, js_ctypes 253 |
| Renderer | 94 | 2.5 | Graphics 65, Idle 27, Profiler 1, Other 1 | 0 / 0 / 94 | ipc 94, webrender_render 67, webrender_sw_raster 53, poll_wait 27 |
| SwComposite | 82 | 2.2 | Other 82 | 0 / 0 / 82 | webrender_render 82, webrender_sw_raster 53, poll_wait 29, memcpy_memset 17 |
| Timer | 36 | 1.0 | Other 36, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 35, memcpy_memset 0 |
| BackgroundThreadPool #3 | 19 | 0.5 | Idle 17, Other 2, Profiler 1 | 0 / 0 / 19 | ipc 19, poll_wait 17, native_receiver 2, memcpy_memset 2 |
| Compositor | 15 | 0.4 | Idle 14, Other 0, Graphics 0 | 0 / 0 / 15 | ipc 15, poll_wait 14, memcpy_memset 0, image_container 0 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 166; `[unknown]` 13; `[axiosozo-dev]` 8; `recvmsg [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 4; `mprotect [libc.so.6]` 4; `write [libc.so.6]` 4

**tab pid 4533** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1 | 0 / 1 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 0; `js::fun_apply(JSContext*, unsigned int, JS::Value*) [libxul.so]` 0; `[unknown]` 0; `js::jit::DoGetPropFallback(JSContext*, js::jit::BaselineFrame*, js::ji` 0; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 0

**tab pid 4627** — 1 ms CPU in the window

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

**tab pid 4609** — 1 ms CPU in the window

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

