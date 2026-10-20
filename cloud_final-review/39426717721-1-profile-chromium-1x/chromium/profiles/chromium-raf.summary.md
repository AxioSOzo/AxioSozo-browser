### chromium raf (profile pass)

**parent pid 3133** — 528 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 211 | 6.8 | Idle 148, JavaScript 36, Other 15, DOM 6 | 7 / 32 / 172 | ipc 211, poll_wait 159, gc_cc 38, worker_messaging 18 |
| DOM Worker | 130 | 4.2 | JavaScript 128, Profiler 1, Other 1 | 0 / 0 / 130 | subprocess_pipe_io 130, worker_messaging 130, ipc 130, js_ctypes 124 |
| Renderer | 47 | 1.5 | Idle 41, Graphics 5, Other 0, Profiler 0 | 0 / 0 / 47 | ipc 47, poll_wait 43, webrender_render 6, webrender_sw_raster 4 |
| WRRenderBackend#0 | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| Compositor | 26 | 0.8 | Idle 26, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, webrender_render 0, image_container 0 |
| BackgroundThreadPool #2 | 21 | 0.7 | Idle 21, Other 0, Graphics 0 | 0 / 0 / 21 | ipc 21, poll_wait 21, native_receiver 1, memcpy_memset 0 |
| SwComposite | 20 | 0.6 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 19, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 17 | 0.6 | Other 17 | 0 / 0 / 17 | ipc 17, poll_wait 17, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 149; `[unknown]` 6; `recvmsg [libc.so.6]` 5; `mprotect [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1; `write [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3317** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 0

**tab pid 3816** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<mozilla::Prof` 0

**tab pid 3993** — 1 ms CPU in the window

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

