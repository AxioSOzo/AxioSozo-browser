### webkit-control raf (profile pass)

**parent pid 9563** — 1365 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 430 | 14.0 | Idle 281, JavaScript 73, Other 32, DOM 20 | 4 / 88 / 338 | ipc 429, poll_wait 299, gc_cc 77, engine_stream_read 49 |
| Renderer | 241 | 7.8 | Idle 134, Graphics 107, Other 0 | 0 / 0 / 241 | ipc 241, poll_wait 138, webrender_render 107, webrender_sw_raster 93 |
| DOM Worker | 238 | 7.8 | JavaScript 230, Profiler 5, Other 3 | 0 / 0 / 238 | subprocess_pipe_io 238, worker_messaging 238, ipc 238, js_ctypes 215 |
| SwComposite | 180 | 5.9 | Other 180 | 0 / 0 / 180 | webrender_render 180, poll_wait 111, webrender_sw_raster 69, memcpy_memset 11 |
| BackgroundThreadPool #2 | 82 | 2.7 | Idle 68, Other 13, Graphics 1 | 0 / 0 / 82 | ipc 82, poll_wait 69, native_receiver 13, memcpy_memset 12 |
| WRRenderBackend#0 | 57 | 1.8 | Other 57 | 0 / 0 / 57 | webrender_render 1, memcpy_memset 0, array_buffer_copy 0 |
| DOM Worker | 48 | 1.6 | Other 48, Idle 0 | 0 / 0 / 48 | worker_messaging 48, ipc 48, gc_cc 46, memcpy_memset 17 |
| Compositor | 36 | 1.2 | Idle 35, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 36 | ipc 36, poll_wait 35, webrender_render 1, canvas_2d 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `[axiosozo-dev]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2

**tab pid 9972** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9708** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuffer::PutObj` 0

**tab pid 9730** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

