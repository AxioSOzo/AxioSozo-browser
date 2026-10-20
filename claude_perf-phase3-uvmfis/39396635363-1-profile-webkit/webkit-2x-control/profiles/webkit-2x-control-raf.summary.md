### webkit-2x-control raf (profile pass)

**parent pid 10786** — 2059 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 628 | 20.3 | Graphics 388, Idle 239, Profiler 0 | 0 / 0 / 628 | ipc 628, webrender_render 388, webrender_sw_raster 363, poll_wait 264 |
| SwComposite | 529 | 17.1 | Other 529 | 0 / 0 / 529 | webrender_render 529, webrender_sw_raster 308, poll_wait 214, memcpy_memset 67 |
| GeckoMain | 396 | 12.8 | Idle 285, JavaScript 62, Other 29, DOM 16 | 9 / 68 / 319 | ipc 395, poll_wait 300, gc_cc 56, engine_stream_read 42 |
| DOM Worker | 229 | 7.4 | JavaScript 218, Profiler 8, Other 4 | 0 / 0 / 229 | subprocess_pipe_io 229, worker_messaging 229, ipc 229, js_ctypes 202 |
| BackgroundThreadPool #1 | 128 | 4.1 | Idle 91, Other 32, Graphics 5 | 0 / 0 / 128 | ipc 127, poll_wait 93, native_receiver 36, memcpy_memset 31 |
| WRRenderBackend#0 | 65 | 2.1 | Other 65 | 0 / 0 / 65 | webrender_render 1, poll_wait 0, array_buffer_copy 0 |
| Compositor | 34 | 1.1 | Idle 33, Other 1, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 33, webrender_render 0, canvas_2d 0 |
| Timer | 26 | 0.8 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `[axiosozo-dev]` 5; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 3; `mprotect [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `[libglib-2.0.so.0]` 2

**tab pid 10971** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 10930** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0; `nsTSubstring<char>::Assign(nsTSubstring<char> const&) [libxul.so]` 0

**tab pid 11436** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::IdleTaskManager::DidRunTask() [libxul.so]` 0; `[]` 0

