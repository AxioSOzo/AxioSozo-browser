### chromium-2x-control raf (profile pass)

**parent pid 4356** — 1437 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 402 | 13.1 | Graphics 248, Idle 151, Other 2, Profiler 1 | 0 / 0 / 402 | ipc 402, webrender_render 250, webrender_sw_raster 227, poll_wait 155 |
| SwComposite | 354 | 11.6 | Other 354 | 0 / 0 / 354 | webrender_render 354, webrender_sw_raster 201, poll_wait 150, memcpy_memset 28 |
| DOM Worker | 251 | 8.2 | JavaScript 208, Other 21, GC / CC 21, Profiler 1 | 0 / 0 / 251 | subprocess_pipe_io 251, worker_messaging 251, ipc 251, js_ctypes 193 |
| GeckoMain | 244 | 8.0 | Idle 184, JavaScript 36, Other 18, DOM 4 | 5 / 33 / 206 | ipc 243, poll_wait 191, gc_cc 31, engine_stream_read 17 |
| BackgroundThreadPool #2 | 80 | 2.6 | Idle 66, Other 13, Graphics 1 | 0 / 0 / 80 | ipc 80, poll_wait 67, native_receiver 14, memcpy_memset 13 |
| WRRenderBackend#0 | 38 | 1.2 | Other 38 | 0 / 0 / 38 | webrender_render 1, memcpy_memset 0 |
| Compositor | 27 | 0.9 | Idle 26, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 27 | ipc 27, poll_wait 26, webrender_render 0, image_container 0 |
| Timer | 24 | 0.8 | Other 24 | 0 / 0 / 24 | ipc 24, poll_wait 23, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 185; `[unknown]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 3; `write [libc.so.6]` 2; `recvmsg [libc.so.6]` 2; `XPCCallContext::CanCallNow() [libxul.so]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 1

**tab pid 5031** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1 | 0 / 0 / 3 | poll_wait 2, ipc 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `non-virtual thunk to ExpirationTrackerImpl<gfxFont, 3u, mozilla::Stati` 0

**tab pid 5036** — 1 ms CPU in the window

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

**tab pid 4546** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `g_main_context_iteration [libglib-2.0.so.0]` 0; `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint(bool) [li` 0

