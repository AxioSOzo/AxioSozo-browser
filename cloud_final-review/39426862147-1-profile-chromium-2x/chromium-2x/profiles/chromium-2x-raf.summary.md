### chromium-2x raf (profile pass)

**parent pid 3331** — 1195 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 367 | 11.6 | Idle 247, JavaScript 83, Other 23, DOM 10 | 7 / 82 / 279 | ipc 367, poll_wait 263, gc_cc 74, worker_messaging 33 |
| DOM Worker | 275 | 8.7 | JavaScript 268, Profiler 4, Other 3, GC / CC 1 | 0 / 0 / 275 | subprocess_pipe_io 275, worker_messaging 275, ipc 275, js_ctypes 258 |
| Renderer | 161 | 5.1 | Idle 99, Graphics 62, Profiler 0 | 0 / 0 / 161 | ipc 160, poll_wait 109, webrender_render 62, webrender_sw_raster 50 |
| BackgroundThreadPool #3 | 121 | 3.8 | Idle 98, Other 23 | 0 / 0 / 121 | ipc 121, poll_wait 96, native_receiver 23, memcpy_memset 21 |
| SwComposite | 115 | 3.6 | Other 115 | 0 / 0 / 115 | webrender_render 115, poll_wait 99, webrender_sw_raster 15, memcpy_memset 14 |
| WRRenderBackend#0 | 55 | 1.7 | Other 55 | 0 / 0 / 55 | webrender_render 1, poll_wait 0 |
| Compositor | 41 | 1.3 | Idle 39, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 41 | ipc 41, poll_wait 39, webrender_render 1, canvas_2d 0 |
| Timer | 30 | 0.9 | Other 30 | 0 / 0 / 30 | ipc 30, poll_wait 29 |

Main thread, top self: `poll [libc.so.6]` 249; `[unknown]` 15; `mprotect [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `write [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 2

**tab pid 3533** — 1 ms CPU in the window

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

**tab pid 4027** — 1 ms CPU in the window

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

**tab pid 3494** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAutoLock<mozi` 0

