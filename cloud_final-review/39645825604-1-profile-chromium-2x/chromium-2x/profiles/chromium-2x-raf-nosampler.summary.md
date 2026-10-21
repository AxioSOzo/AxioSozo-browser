### chromium-2x raf-nosampler (profile pass)

**parent pid 3512** — 948 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 273 | 8.9 | JavaScript 265, Profiler 5, Other 4 | 0 / 0 / 273 | subprocess_pipe_io 273, worker_messaging 273, ipc 273, js_ctypes 255 |
| GeckoMain | 213 | 7.0 | Idle 115, JavaScript 59, Other 18, DOM 17 | 7 / 64 / 142 | ipc 212, poll_wait 123, gc_cc 75, engine_stream_read 38 |
| Renderer | 141 | 4.6 | Idle 74, Graphics 67, Other 1, Profiler 0 | 0 / 0 / 141 | ipc 141, poll_wait 83, webrender_render 67, webrender_sw_raster 55 |
| SwComposite | 105 | 3.4 | Other 105 | 0 / 0 / 105 | webrender_render 105, poll_wait 97, memcpy_memset 7, webrender_sw_raster 7 |
| BackgroundThreadPool #3 | 98 | 3.2 | Idle 86, Other 10, Graphics 1, Profiler 0 | 0 / 0 / 98 | ipc 98, poll_wait 86, native_receiver 10, memcpy_memset 8 |
| WRRenderBackend#0 | 51 | 1.7 | Other 51 | 0 / 0 / 51 | webrender_render 0 |
| Compositor | 40 | 1.3 | Idle 38, Other 2, Graphics 0, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 38, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, image_container 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 116; `[unknown]` 11; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS::Value con` 4; `recvmsg [libc.so.6]` 4; `write [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `mprotect [libc.so.6]` 2; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::MarkerTiming>::` 2

**tab pid 3692** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, DOM 1, JavaScript 1 | 0 / 2 / 2 | ipc 4, poll_wait 2, gc_cc 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::emitNextIC` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 0

**tab pid 4329** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4174** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::RunnableTask::Run() [libxul.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

