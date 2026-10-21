### webkit-2x scroll (profile pass)

**parent pid 8775** — 1182 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 539 | 25.4 | Idle 315, JavaScript 91, Other 46, DOM 40 | 10 / 117 / 412 | ipc 538, poll_wait 384, gc_cc 84, engine_stream_read 71 |
| DOM Worker | 245 | 11.5 | JavaScript 230, Profiler 10, Other 6 | 0 / 0 / 245 | subprocess_pipe_io 245, worker_messaging 245, ipc 245, js_ctypes 209 |
| BackgroundThreadPool #2 | 149 | 7.0 | Idle 100, Other 48, Graphics 1 | 0 / 0 / 149 | ipc 149, poll_wait 100, native_receiver 49, memcpy_memset 47 |
| Renderer | 102 | 4.8 | Idle 61, Graphics 42, Other 0 | 0 / 0 / 102 | ipc 102, poll_wait 72, webrender_render 42, webrender_sw_raster 31 |
| SwComposite | 47 | 2.2 | Other 47 | 0 / 0 / 47 | webrender_render 47, poll_wait 46, memcpy_memset 1, webrender_sw_raster 1 |
| WRRenderBackend#0 | 34 | 1.6 | Other 34 | 0 / 0 / 34 | webrender_render 1, array_buffer_copy 0, memcpy_memset 0 |
| Compositor | 26 | 1.2 | Idle 26, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, webrender_render 0, image_container 0 |
| Timer | 21 | 1.0 | Other 21, Profiler 0 | 0 / 0 / 21 | ipc 21, poll_wait 20 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 335; `[unknown]` 18; `__lll_lock_wait [libc.so.6]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 6; `[axiosozo-dev]` 5; `mozilla::nsDisplayListBuilder::MarkOutOfFlowFrameForDisplay(nsIFrame*,` 5; `JS::Compartment::firstGlobal() const [libxul.so]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4

**tab pid 9478** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 9344** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

