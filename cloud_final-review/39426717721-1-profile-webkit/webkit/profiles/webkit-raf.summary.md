### webkit raf (profile pass)

**parent pid 7188** — 924 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 392 | 12.5 | Idle 261, JavaScript 75, Other 31, DOM 18 | 7 / 85 / 300 | ipc 391, poll_wait 278, gc_cc 74, engine_stream_read 49 |
| DOM Worker | 253 | 8.1 | JavaScript 246, Other 4, Profiler 4 | 0 / 0 / 253 | subprocess_pipe_io 253, worker_messaging 253, ipc 253, js_ctypes 234 |
| Renderer | 78 | 2.5 | Idle 62, Graphics 15, Other 0 | 0 / 0 / 78 | ipc 78, poll_wait 66, webrender_render 16, webrender_sw_raster 9 |
| WRRenderBackend#0 | 45 | 1.4 | Other 45 | 0 / 0 / 45 | memcpy_memset 0 |
| Compositor | 36 | 1.2 | Idle 35, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 36 | ipc 36, poll_wait 35, webrender_render 0, canvas_2d 0 |
| SwComposite | 36 | 1.1 | Other 36 | 0 / 0 / 36 | webrender_render 36, poll_wait 35, memcpy_memset 1, webrender_sw_raster 1 |
| Timer | 29 | 0.9 | Other 29, Profiler 0 | 0 / 0 / 29 | ipc 29, poll_wait 29, memcpy_memset 0 |
| BackgroundThreadPool #3 | 29 | 0.9 | Idle 27, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 29 | ipc 29, poll_wait 27, native_receiver 2, memcpy_memset 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 274; `[unknown]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4; `mprotect [libc.so.6]` 3; `encoding_rs::utf_8::convert_utf16_to_utf8_partial_inner [libxul.so]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `JS::Compartment::wrap(JSContext*, JS::MutableHandle<JS::Value>) [libxu` 2

**tab pid 7736** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, gc_cc 1, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `madvise [libc.so.6]` 0

**tab pid 7364** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7742** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(unsigned int)` 0

