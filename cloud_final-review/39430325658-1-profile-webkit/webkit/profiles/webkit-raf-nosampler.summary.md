### webkit raf-nosampler (profile pass)

**parent pid 7188** — 766 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 261 | 8.6 | JavaScript 252, Other 5, Profiler 4 | 0 / 0 / 261 | subprocess_pipe_io 261, worker_messaging 261, ipc 261, js_ctypes 238 |
| GeckoMain | 213 | 7.0 | Idle 104, JavaScript 67, DOM 21, Other 16 | 7 / 82 / 125 | ipc 212, poll_wait 113, gc_cc 83, engine_stream_read 67 |
| Renderer | 83 | 2.7 | Idle 64, Graphics 19, Profiler 0 | 0 / 0 / 83 | ipc 83, poll_wait 69, webrender_render 19, webrender_sw_raster 14 |
| WRRenderBackend#0 | 48 | 1.6 | Other 48 | 0 / 0 / 48 | webrender_render 0, memcpy_memset 0 |
| SwComposite | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_render 43, poll_wait 41, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 40 | 1.3 | Idle 38, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 38, webrender_render 1, canvas_2d 1 |
| BackgroundThreadPool #2 | 37 | 1.2 | Idle 35, Other 2, Graphics 0 | 0 / 0 / 37 | ipc 37, poll_wait 35, native_receiver 2, memcpy_memset 2 |
| ImageBridgeChld | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, image_container 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 113; `[unknown]` 15; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 2; `js::jit::X86Encoding::BaseAssembler::X86InstructionFormatter::memoryMo` 2; `js::BlockLexicalEnvironmentObject::create(JSContext*, JS::Handle<js::L` 2

**tab pid 7337** — 1 ms CPU in the window

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

**tab pid 7379** — 1 ms CPU in the window

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

**tab pid 7360** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

