### webkit-2x-control raf-nosampler (profile pass)

**parent pid 10383** — 1869 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 583 | 19.2 | Graphics 373, Idle 211, Other 0 | 0 / 0 / 583 | ipc 583, webrender_render 373, webrender_sw_raster 344, poll_wait 226 |
| SwComposite | 497 | 16.4 | Other 497 | 0 / 0 / 497 | webrender_render 497, webrender_sw_raster 267, poll_wait 229, memcpy_memset 64 |
| BackgroundThreadPool #5 | 255 | 8.4 | Idle 130, Other 118, Graphics 7 | 0 / 0 / 255 | ipc 254, poll_wait 132, native_receiver 125, memcpy_memset 115 |
| DOM Worker | 224 | 7.4 | JavaScript 209, Profiler 14, Other 1 | 0 / 0 / 224 | subprocess_pipe_io 224, worker_messaging 224, ipc 224, js_ctypes 197 |
| GeckoMain | 191 | 6.3 | Idle 131, JavaScript 31, Other 17, DOM 10 | 2 / 37 / 152 | ipc 190, poll_wait 138, gc_cc 43, engine_stream_read 28 |
| WRRenderBackend#0 | 63 | 2.1 | Other 63 | 0 / 0 / 63 | memcpy_memset 2, webrender_render 1, array_buffer_copy 1, poll_wait 0 |
| Compositor | 33 | 1.1 | Idle 32, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 14 | 0.4 | Idle 13, Other 0 | 0 / 0 / 14 | ipc 14, poll_wait 13, image_container 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 6; `JSStructuredCloneWriter::writeString(unsigned int, JSString*) [libxul.` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `bool mozilla::HashSet<js::jit::ExecutablePool*, mozilla::DefaultHasher` 2; `JS::Compartment::firstGlobal() const [libxul.so]` 1

**tab pid 10524** — 1 ms CPU in the window

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
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::IToplevelProtocol::Lookup(long) [libxul.so]` 0

**tab pid 10781** — 1 ms CPU in the window

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

