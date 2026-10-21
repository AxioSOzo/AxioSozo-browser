### chromium scroll (profile pass)

**parent pid 3349** — 733 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 362 | 17.5 | Idle 215, JavaScript 56, Other 46, DOM 14 | 7 / 62 / 293 | ipc 361, poll_wait 270, gc_cc 63, worker_messaging 31 |
| DOM Worker | 193 | 9.4 | JavaScript 184, Profiler 8, Other 1 | 0 / 0 / 193 | subprocess_pipe_io 193, worker_messaging 193, ipc 193, js_ctypes 175 |
| Renderer | 44 | 2.1 | Idle 33, Graphics 11, Other 0 | 0 / 0 / 44 | ipc 44, poll_wait 36, webrender_render 11, webrender_sw_raster 6 |
| BackgroundThreadPool #1 | 36 | 1.7 | Idle 32, Other 3, Graphics 1 | 0 / 0 / 36 | ipc 36, poll_wait 32, native_receiver 4, memcpy_memset 3 |
| WRRenderBackend#0 | 27 | 1.3 | Other 27 | 0 / 0 / 27 | webrender_render 0, memcpy_memset 0 |
| SwComposite | 21 | 1.0 | Other 21 | 0 / 0 / 21 | webrender_render 21, poll_wait 21, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 20 | 1.0 | Idle 19, Other 0, Profiler 0 | 0 / 0 / 20 | ipc 20, poll_wait 20, canvas_2d 0, webrender_render 0 |
| Timer | 15 | 0.7 | Other 15, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 216; `recvmsg [libc.so.6]` 10; `[unknown]` 8; `write [libc.so.6]` 5; `[linux-vdso.so.1]` 4; `[axiosozo-dev]` 4; `mprotect [libc.so.6]` 2; `getcontext [libc.so.6]` 2

**tab pid 3555** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.2 | Idle 2, DOM 1, JavaScript 1 | 0 / 1 / 2 | ipc 4, poll_wait 2, gc_cc 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*, unsigned ` 1; `js::jit::ICScript::initICEntries(JSContext*, JSScript*) [libxul.so]` 1; `[linux-vdso.so.1]` 0; `js::InterpreterFrame::prologue(JSContext*) [libxul.so]` 0

**tab pid 3529** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 4229** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

