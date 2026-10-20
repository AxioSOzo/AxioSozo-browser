### chromium-control raf-nosampler (profile pass)

**parent pid 4588** — 985 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 318 | 10.4 | JavaScript 265, GC / CC 26, Other 24, Profiler 3 | 0 / 0 / 318 | subprocess_pipe_io 318, worker_messaging 317, ipc 317, js_ctypes 246 |
| Renderer | 196 | 6.4 | Idle 102, Graphics 92, Other 1, Profiler 1 | 0 / 0 / 196 | ipc 196, poll_wait 104, webrender_render 94, webrender_sw_raster 79 |
| GeckoMain | 177 | 5.8 | Idle 103, JavaScript 43, Other 16, DOM 11 | 4 / 47 / 126 | ipc 177, poll_wait 110, gc_cc 58, worker_messaging 34 |
| SwComposite | 153 | 5.0 | Other 153 | 0 / 0 / 153 | webrender_render 153, webrender_sw_raster 77, poll_wait 76, memcpy_memset 3 |
| WRRenderBackend#0 | 50 | 1.6 | Other 50 | 0 / 0 / 50 | memcpy_memset 0, webrender_render 0 |
| Compositor | 34 | 1.1 | Idle 34, Other 0, Graphics 0 | 0 / 0 / 34 | ipc 34, poll_wait 34, webrender_render 0, canvas_2d 0 |
| BackgroundThreadPool #1 | 30 | 1.0 | Idle 29, Graphics 1, Other 0 | 0 / 0 / 30 | ipc 30, poll_wait 29, native_receiver 1, image_container 1 |
| ImageBridgeChld | 15 | 0.5 | Idle 15, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 103; `[unknown]` 10; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `__lll_lock_wait [libc.so.6]` 2; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 2

**tab pid 4746** — 1 ms CPU in the window

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

**tab pid 5360** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

**tab pid 4725** — 1 ms CPU in the window

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

