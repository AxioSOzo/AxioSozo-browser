### chromium key (profile pass)

**parent pid 3144** — 609 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 305 | 8.3 | Idle 134, JavaScript 56, Layout 35, Other 30 | 15 / 98 / 193 | ipc 305, poll_wait 168, gc_cc 71, paint_layout 67 |
| DOM Worker | 171 | 4.7 | JavaScript 164, Profiler 4, Other 3 | 0 / 0 / 171 | subprocess_pipe_io 171, worker_messaging 171, ipc 171, js_ctypes 158 |
| Renderer | 45 | 1.2 | Graphics 25, Idle 20 | 0 / 0 / 45 | ipc 45, webrender_render 25, webrender_sw_raster 21, poll_wait 20 |
| Timer | 26 | 0.7 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 25 |
| SwComposite | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 12, memcpy_memset 3, webrender_sw_raster 3 |
| WRRenderBackend#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | memcpy_memset 0 |
| Compositor | 12 | 0.3 | Idle 12 | 0 / 0 / 12 | ipc 12, poll_wait 12 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 7, Graphics 1 | 0 / 0 / 8 | webrender_scene 8, webrender_sw_raster 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 136; `[unknown]` 8; `[axiosozo-dev]` 7; `write [libc.so.6]` 4; `recvmsg [libc.so.6]` 3; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<nsFrameList` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `read [libc.so.6]` 2

**tab pid 3234** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, GC / CC 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, gc_cc 0, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 0; `JSAutoStructuredCloneBuffer::clear() [libxul.so]` 0

**tab pid 3804** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0

**tab pid 3319** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

