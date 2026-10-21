### webkit-2x raf-nosampler (profile pass)

**parent pid 8775** — 894 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 226 | 7.4 | JavaScript 222, Profiler 4, Other 1 | 0 / 0 / 226 | subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 206 |
| GeckoMain | 211 | 6.9 | Idle 125, JavaScript 48, Other 26, DOM 7 | 8 / 46 / 156 | ipc 210, poll_wait 141, gc_cc 60, engine_stream_read 41 |
| Renderer | 163 | 5.4 | Idle 103, Graphics 60, Profiler 1 | 0 / 0 / 163 | ipc 163, poll_wait 116, webrender_render 61, webrender_sw_raster 51 |
| SwComposite | 92 | 3.0 | Other 92 | 0 / 0 / 92 | webrender_render 92, poll_wait 85, webrender_sw_raster 7, memcpy_memset 6 |
| BackgroundThreadPool #2 | 82 | 2.7 | Idle 71, Other 10, Graphics 1 | 0 / 0 / 82 | ipc 81, poll_wait 72, native_receiver 10, memcpy_memset 9 |
| WRRenderBackend#0 | 51 | 1.7 | Other 51 | 0 / 0 / 51 | webrender_render 2, poll_wait 1, webrender_scene 0 |
| Compositor | 41 | 1.3 | Idle 40, Other 1, Graphics 0 | 0 / 0 / 41 | ipc 41, poll_wait 40, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 141; `[unknown]` 7; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 3; `mozilla::dom::Event::SetOwner(mozilla::dom::EventTarget*) [libxul.so]` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 2; `[axiosozo-dev]` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 8980** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libglib-2.0.so.0]` 0; `[]` 0

**tab pid 9478** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `NS_GetMainThread(nsIThread**) [libxul.so]` 0

**tab pid 9344** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

