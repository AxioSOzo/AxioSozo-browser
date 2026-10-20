### webkit-2x-control raf (profile pass)

**parent pid 10383** — 2149 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 593 | 19.1 | Graphics 367, Idle 224, Profiler 2, Other 0 | 0 / 0 / 593 | ipc 593, webrender_render 369, webrender_sw_raster 335, poll_wait 240 |
| SwComposite | 526 | 17.0 | Other 526 | 0 / 0 / 526 | webrender_render 526, webrender_sw_raster 307, poll_wait 218, memcpy_memset 65 |
| GeckoMain | 404 | 13.1 | Idle 281, JavaScript 58, Other 36, DOM 21 | 4 / 71 / 328 | ipc 403, poll_wait 303, gc_cc 62, engine_stream_read 42 |
| BackgroundThreadPool #5 | 255 | 8.2 | Idle 138, Other 110, Graphics 6, Profiler 0 | 0 / 0 / 255 | ipc 254, poll_wait 141, native_receiver 117, memcpy_memset 110 |
| DOM Worker | 225 | 7.3 | JavaScript 214, Profiler 7, Other 4 | 0 / 0 / 225 | subprocess_pipe_io 225, worker_messaging 223, ipc 223, js_ctypes 201 |
| WRRenderBackend#0 | 64 | 2.1 | Other 64 | 0 / 0 / 64 | webrender_render 2, poll_wait 0, memcpy_memset 0 |
| Compositor | 33 | 1.1 | Idle 32, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 33, webrender_render 0, image_container 0 |
| Timer | 27 | 0.9 | Other 27 | 0 / 0 / 27 | ipc 27, poll_wait 27 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 296; `[unknown]` 9; `__lll_lock_wake [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4; `g_mutex_lock [libglib-2.0.so.0]` 3; `js::EnvironmentIter::settle() [libxul.so]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2

**tab pid 10524** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 10546** — 1 ms CPU in the window

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

**tab pid 10566** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0

