### chromium-2x raf (profile pass)

**parent pid 3450** — 1264 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 386 | 12.1 | Idle 257, JavaScript 74, Other 29, DOM 21 | 6 / 84 / 296 | ipc 385, poll_wait 272, gc_cc 79, worker_messaging 43 |
| DOM Worker | 285 | 8.9 | JavaScript 276, Other 4, Profiler 4 | 0 / 0 / 285 | subprocess_pipe_io 285, worker_messaging 285, ipc 285, js_ctypes 267 |
| Renderer | 169 | 5.3 | Idle 104, Graphics 64, Other 1 | 0 / 0 / 169 | ipc 169, poll_wait 113, webrender_render 65, webrender_sw_raster 57 |
| BackgroundThreadPool #1 | 135 | 4.2 | Idle 104, Other 30, Profiler 1, Graphics 1 | 0 / 0 / 135 | ipc 135, poll_wait 101, native_receiver 30, memcpy_memset 27 |
| SwComposite | 127 | 4.0 | Other 127 | 0 / 0 / 127 | webrender_render 127, poll_wait 102, webrender_sw_raster 25, memcpy_memset 22 |
| WRRenderBackend#0 | 58 | 1.8 | Other 58 | 0 / 0 / 58 | webrender_render 0, array_buffer_copy 0 |
| Compositor | 42 | 1.3 | Idle 41, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 42 | ipc 42, poll_wait 41, webrender_render 1, canvas_2d 0 |
| Timer | 33 | 1.0 | Other 32, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 259; `[unknown]` 14; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 5; `[linux-vdso.so.1]` 4; `__lll_lock_wait [libc.so.6]` 3

**tab pid 3647** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, JavaScript 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, array_buffer_copy 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `js::jit::CacheIRCompiler::emitIsObjectResult(js::jit::ValOperandId) [l` 0; `[linux-vdso.so.1]` 0

**tab pid 4373** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 4368** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsTimerImpl::CancelImpl(bool) [libxul.so]` 0

