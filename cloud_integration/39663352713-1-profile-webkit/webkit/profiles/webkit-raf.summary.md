### webkit raf (profile pass)

**parent pid 7154** — 951 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 403 | 13.0 | Idle 275, JavaScript 62, Other 37, DOM 22 | 8 / 74 / 321 | ipc 402, poll_wait 296, gc_cc 67, engine_stream_read 46 |
| DOM Worker | 250 | 8.0 | JavaScript 240, Profiler 6, Other 4 | 0 / 0 / 250 | subprocess_pipe_io 250, worker_messaging 250, ipc 250, js_ctypes 227 |
| Renderer | 82 | 2.7 | Idle 70, Graphics 12, Other 1 | 0 / 0 / 82 | ipc 82, poll_wait 73, webrender_render 12, webrender_sw_raster 7 |
| WRRenderBackend#0 | 48 | 1.5 | Other 48 | 0 / 0 / 48 | array_buffer_copy 0, webrender_render 0 |
| SwComposite | 40 | 1.3 | Other 40 | 0 / 0 / 40 | webrender_render 40, poll_wait 38, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 38 | 1.2 | Idle 37, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 38 | ipc 38, poll_wait 37, webrender_render 1, image_container 0 |
| BackgroundThreadPool #3 | 32 | 1.0 | Idle 29, Other 3, Graphics 0 | 0 / 0 / 32 | ipc 32, poll_wait 29, native_receiver 3, image_container 2 |
| Timer | 31 | 1.0 | Other 31, Profiler 0 | 0 / 0 / 31 | ipc 31, poll_wait 31 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 12; `mprotect [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc<(js::Allo` 2

**tab pid 7351** — 1 ms CPU in the window

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

**tab pid 7700** — 1 ms CPU in the window

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

**tab pid 7696** — 1 ms CPU in the window

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

