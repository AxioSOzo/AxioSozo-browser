### webkit-2x-control scroll (profile pass)

**parent pid 10383** — 1751 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 469 | 22.7 | Idle 274, JavaScript 80, Other 50, DOM 34 | 11 / 104 / 354 | ipc 467, poll_wait 333, gc_cc 80, engine_stream_read 62 |
| Renderer | 391 | 18.9 | Graphics 253, Idle 136, Other 2 | 0 / 0 / 391 | ipc 391, webrender_render 253, webrender_sw_raster 219, poll_wait 138 |
| SwComposite | 340 | 16.4 | Other 340 | 0 / 0 / 340 | webrender_render 340, webrender_sw_raster 184, poll_wait 152, memcpy_memset 35 |
| DOM Worker | 260 | 12.6 | JavaScript 238, Profiler 18, Other 4 | 0 / 0 / 260 | subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 210 |
| BackgroundThreadPool #5 | 194 | 9.4 | Idle 115, Other 73, Graphics 6 | 0 / 0 / 194 | ipc 193, poll_wait 120, native_receiver 74, memcpy_memset 66 |
| WRRenderBackend#0 | 43 | 2.1 | Other 43 | 0 / 0 / 43 | webrender_render 1, array_buffer_copy 0, memcpy_memset 0 |
| Compositor | 21 | 1.0 | Idle 20, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 21 | ipc 21, poll_wait 20, webrender_render 0, canvas_2d 0 |
| Timer | 17 | 0.8 | Other 17, Profiler 0 | 0 / 0 / 17 | ipc 17, poll_wait 17 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 298; `[unknown]` 20; `__lll_lock_wake [libc.so.6]` 7; `__lll_lock_wait [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `webrtc::internal::(anonymous namespace)::WebRtcRecordableEncodedFrame:` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `mprotect [libc.so.6]` 3

**tab pid 10566** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 10546** — 1 ms CPU in the window

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

**tab pid 10524** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `CrashReporter::SetEventloopNestingLevel(unsigned int) [libxul.so]` 0

