### chromium raf-nosampler (profile pass)

**parent pid 3349** — 542 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 195 | 6.4 | JavaScript 189, Other 4, Profiler 2 | 0 / 0 / 195 | subprocess_pipe_io 195, worker_messaging 194, ipc 194, js_ctypes 184 |
| GeckoMain | 145 | 4.8 | Idle 92, JavaScript 29, Other 12, DOM 8 | 4 / 30 / 111 | ipc 144, poll_wait 98, gc_cc 40, worker_messaging 21 |
| Renderer | 58 | 1.9 | Idle 49, Graphics 8 | 0 / 0 / 58 | ipc 58, poll_wait 50, webrender_render 8, webrender_sw_raster 6 |
| WRRenderBackend#0 | 34 | 1.1 | Other 34 | 0 / 0 / 34 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| BackgroundThreadPool #1 | 33 | 1.1 | Idle 32, Other 1, Graphics 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, native_receiver 1, memcpy_memset 0 |
| SwComposite | 31 | 1.0 | Other 31 | 0 / 0 / 31 | webrender_render 31, poll_wait 30, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 27 | 0.9 | Idle 27, Other 0, Graphics 0 | 0 / 0 / 27 | ipc 27, poll_wait 27, webrender_render 0, image_container 0 |
| ImageBridgeChld | 12 | 0.4 | Idle 12 | 0 / 0 / 12 | ipc 12, poll_wait 12 |

Main thread, top self: `poll [libc.so.6]` 92; `[unknown]` 6; `recvmsg [libc.so.6]` 3; `write [libc.so.6]` 2; `[axiosozo-dev]` 1; `now ([System Principal]:37:15)[2]` 1; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1; `nsIGlobalObject::SetWebTaskSchedulingState(mozilla::dom::WebTaskSchedu` 1

**tab pid 4039** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 2 | 0 / 0 / 3 | ipc 3, poll_wait 2, gc_cc 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `nsTSubstring<char>::~nsTSubstring() [libxul.so]` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 0; `mozilla::detail::SprintfAppend::append(char const*, unsigned long) [li` 0

**tab pid 3555** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4229** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

