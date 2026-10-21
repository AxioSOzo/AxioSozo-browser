### chromium-2x raf-nosampler (profile pass)

**parent pid 3249** — 1117 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 303 | 10.0 | Idle 129, Network 61, JavaScript 57, DOM 28 | 8 / 78 / 218 | ipc 303, poll_wait 139, gc_cc 85, array_buffer_copy 52 |
| DOM Worker | 213 | 7.0 | JavaScript 208, Profiler 4, Other 1 | 0 / 0 / 213 | subprocess_pipe_io 213, worker_messaging 213, ipc 213, js_ctypes 202 |
| Renderer | 138 | 4.5 | Idle 80, Graphics 54, Other 2, Profiler 1 | 0 / 0 / 138 | ipc 138, poll_wait 89, webrender_render 57, webrender_sw_raster 48 |
| SwComposite | 103 | 3.4 | Other 103 | 0 / 0 / 103 | webrender_render 103, poll_wait 89, webrender_sw_raster 14, memcpy_memset 12 |
| BackgroundThreadPool #3 | 92 | 3.0 | Idle 78, Other 12, Graphics 2 | 0 / 0 / 92 | ipc 92, poll_wait 79, native_receiver 14, memcpy_memset 12 |
| BgIOThreadPool #2 | 65 | 2.1 | Other 59, Idle 6 | 0 / 0 / 65 | ipc 65, poll_wait 6, array_buffer_copy 4 |
| Socket Thread | 56 | 1.9 | Other 56, Profiler 0 | 0 / 0 / 56 | ipc 55, poll_wait 21, memcpy_memset 1 |
| WRRenderBackend#0 | 45 | 1.5 | Other 45 | 0 / 0 / 45 | memcpy_memset 0, webrender_render 0, array_buffer_copy 0 |

Main thread, top self: `poll [libc.so.6]` 130; `__memmove_avx512_unaligned_erms [libc.so.6]` 18; `__memset_avx512_unaligned_erms [libc.so.6]` 16; `zlib_rs::inflate::inflate_fast_help_avx2 [libxul.so]` 15; `[unknown]` 11; `decltype (((std::declval<mozilla::dom::TypedArray_base<JS::TypedArray<` 10; `write [libc.so.6]` 5; `recvmsg [libc.so.6]` 4

**tab pid 3429** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3411** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4108** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

