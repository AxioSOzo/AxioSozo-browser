### chromium scroll (profile pass)

**parent pid 3367** — 1099 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 554 | 26.2 | Idle 282, JavaScript 110, Other 62, GC / CC 30 | 13 / 114 / 427 | ipc 553, poll_wait 370, gc_cc 135, paint_layout 57 |
| DOM Worker | 294 | 13.9 | JavaScript 279, Profiler 9, Other 6 | 0 / 0 / 294 | subprocess_pipe_io 294, worker_messaging 294, ipc 294, js_ctypes 249 |
| BackgroundThreadPool #3 | 61 | 2.9 | Idle 53, Other 7, Graphics 0, Profiler 0 | 0 / 0 / 61 | ipc 61, poll_wait 53, native_receiver 8, memcpy_memset 7 |
| Renderer | 57 | 2.7 | Idle 46, Graphics 11, Profiler 1 | 0 / 0 / 57 | ipc 57, poll_wait 49, webrender_render 11, webrender_sw_raster 6 |
| WRRenderBackend#0 | 35 | 1.6 | Other 35 | 0 / 0 / 35 | webrender_render 0, poll_wait 0 |
| Compositor | 28 | 1.3 | Idle 28, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 28 | ipc 28, poll_wait 28, webrender_render 0, canvas_2d 0 |
| SwComposite | 27 | 1.3 | Other 27 | 0 / 0 / 27 | webrender_render 27, poll_wait 27, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 23 | 1.1 | Other 23 | 0 / 0 / 23 | ipc 23, poll_wait 23, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 285; `[unknown]` 14; `write [libc.so.6]` 12; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 7; `read [libc.so.6]` 7; `recvmsg [libc.so.6]` 7; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 5; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 4

**tab pid 4245** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 4039** — 1 ms CPU in the window

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

**tab pid 4250** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `nsJSContext::MaybePokeGC() [libxul.so]` 0

