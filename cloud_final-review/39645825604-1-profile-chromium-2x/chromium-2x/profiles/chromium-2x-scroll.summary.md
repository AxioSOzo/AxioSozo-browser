### chromium-2x scroll (profile pass)

**parent pid 3512** — 1191 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 493 | 23.2 | Idle 275, JavaScript 107, Other 51, Graphics 23 | 20 / 106 / 367 | ipc 493, poll_wait 348, gc_cc 106, paint_layout 60 |
| DOM Worker | 289 | 13.6 | JavaScript 270, Other 10, Profiler 10 | 0 / 0 / 289 | subprocess_pipe_io 289, worker_messaging 289, ipc 289, js_ctypes 252 |
| BackgroundThreadPool #3 | 151 | 7.1 | Idle 97, Other 52, Graphics 1, Profiler 1 | 0 / 0 / 151 | ipc 151, poll_wait 99, native_receiver 54, memcpy_memset 50 |
| Renderer | 92 | 4.3 | Idle 53, Graphics 39 | 0 / 0 / 92 | ipc 92, poll_wait 65, webrender_render 39, webrender_sw_raster 32 |
| SwComposite | 61 | 2.9 | Other 61 | 0 / 0 / 61 | webrender_render 61, poll_wait 58, webrender_sw_raster 2, memcpy_memset 1 |
| WRRenderBackend#0 | 37 | 1.7 | Other 36, Profiler 0 | 0 / 0 / 37 | webrender_render 1 |
| Compositor | 27 | 1.3 | Idle 25, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 27 | ipc 26, poll_wait 25, webrender_render 1, image_container 0 |
| Timer | 23 | 1.1 | Other 23, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23 |

Main thread, top self: `poll [libc.so.6]` 278; `[unknown]` 19; `recvmsg [libc.so.6]` 10; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 7; `[axiosozo-dev]` 5; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 5; `write [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4

**tab pid 4174** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4318** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[linux-vdso.so.1]` 0; `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3674** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

