### chromium scroll (profile pass)

**parent pid 3299** — 625 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 319 | 15.6 | Idle 197, JavaScript 58, Other 36, DOM 12 | 9 / 55 / 255 | ipc 319, poll_wait 243, gc_cc 53, worker_messaging 31 |
| DOM Worker | 157 | 7.7 | JavaScript 145, Profiler 8, Other 4 | 0 / 0 / 157 | subprocess_pipe_io 157, worker_messaging 157, ipc 157, js_ctypes 140 |
| Renderer | 35 | 1.7 | Idle 29, Graphics 5, Other 1, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 30, webrender_render 6, webrender_sw_raster 3 |
| BackgroundThreadPool #2 | 29 | 1.4 | Idle 27, Other 2 | 0 / 0 / 29 | ipc 29, poll_wait 27, native_receiver 2, memcpy_memset 1 |
| WRRenderBackend#0 | 28 | 1.4 | Other 28 | 0 / 0 / 28 | webrender_scene 0, webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 19 | 0.9 | Idle 19, Other 0, Graphics 0 | 0 / 0 / 19 | ipc 19, poll_wait 19, webrender_render 0, canvas_2d 0 |
| SwComposite | 13 | 0.6 | Other 13 | 0 / 0 / 13 | webrender_render 13, poll_wait 13, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 12 | 0.6 | Other 12 | 0 / 0 / 12 | ipc 12, poll_wait 12 |

Main thread, top self: `poll [libc.so.6]` 198; `[unknown]` 9; `write [libc.so.6]` 7; `recvmsg [libc.so.6]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `[linux-vdso.so.1]` 2; `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:680:` 2

**tab pid 3483** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `TimerThread::RemoveTimer(nsTimerImpl*, mozilla::detail::BaseAutoLock<m` 0

**tab pid 3978** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3973** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

