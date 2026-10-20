### webkit-2x scroll (profile pass)

**parent pid 8806** — 1187 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 476 | 23.3 | Idle 267, JavaScript 91, Other 44, GC / CC 26 | 12 / 95 / 369 | ipc 473, poll_wait 313, gc_cc 111, engine_stream_read 56 |
| DOM Worker | 248 | 12.2 | JavaScript 238, Profiler 8, Other 2 | 0 / 0 / 248 | subprocess_pipe_io 248, worker_messaging 247, ipc 247, js_ctypes 221 |
| BackgroundThreadPool #2 | 200 | 9.8 | Idle 128, Other 69, Graphics 2 | 0 / 0 / 200 | ipc 200, poll_wait 130, native_receiver 71, memcpy_memset 67 |
| Renderer | 109 | 5.3 | Idle 61, Graphics 48 | 0 / 0 / 109 | ipc 109, poll_wait 71, webrender_render 48, webrender_sw_raster 36 |
| SwComposite | 71 | 3.5 | Other 71 | 0 / 0 / 71 | webrender_render 71, poll_wait 63, webrender_sw_raster 8, memcpy_memset 6 |
| WRRenderBackend#0 | 31 | 1.5 | Other 31 | 0 / 0 / 31 | webrender_render 0 |
| Compositor | 21 | 1.0 | Idle 21, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 21 | ipc 21, poll_wait 21, webrender_render 0, canvas_2d 0 |
| Timer | 17 | 0.8 | Other 17 | 0 / 0 / 17 | ipc 17, poll_wait 17, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 293; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `__lll_lock_wake [libc.so.6]` 8; `[axiosozo-dev]` 5; `mprotect [libc.so.6]` 5; `__memset_evex_unaligned_erms [libc.so.6]` 4; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 4

**tab pid 8953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9363** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 9493** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*) [libxul.s` 0

