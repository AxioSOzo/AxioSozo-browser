### chromium-2x scroll (profile pass)

**parent pid 3314** — 952 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 444 | 21.3 | Idle 236, JavaScript 100, Other 50, DOM 24 | 10 / 106 / 327 | ipc 443, poll_wait 309, gc_cc 95, paint_layout 51 |
| DOM Worker | 196 | 9.4 | JavaScript 179, Profiler 12, Other 4 | 0 / 0 / 196 | subprocess_pipe_io 196, worker_messaging 196, ipc 196, js_ctypes 171 |
| BackgroundThreadPool #3 | 116 | 5.6 | Idle 77, Other 39 | 0 / 0 / 116 | ipc 116, poll_wait 76, native_receiver 38, memcpy_memset 37 |
| Renderer | 69 | 3.3 | Idle 48, Graphics 21, Other 1 | 0 / 0 / 69 | ipc 69, poll_wait 57, webrender_render 21, webrender_sw_raster 12 |
| SwComposite | 37 | 1.8 | Other 37 | 0 / 0 / 37 | webrender_render 37, poll_wait 37, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 34 | 1.6 | Other 34 | 0 / 0 / 34 | webrender_render 0, poll_wait 0 |
| Compositor | 25 | 1.2 | Idle 24, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 25 | ipc 24, poll_wait 24, webrender_render 0, canvas_2d 0 |
| Timer | 16 | 0.7 | Other 15, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 240; `[unknown]` 25; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 4; `mozilla::Vector<unsigned char, 80ul, js::StringBuilderAllocPolicy>::gr` 4; `mozilla::dom::Event::SetOwner(mozilla::dom::EventTarget*) [libxul.so]` 4; `[axiosozo-dev]` 4; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 4

**tab pid 3459** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::TaskController::ExecuteNextTaskOnlyMainThreadInternal(mozilla` 0; `mozilla::CycleCollectedJSRuntime::FinalizeDeferredThings(mozilla::Cycl` 0

**tab pid 4015** — 1 ms CPU in the window

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

**tab pid 4200** — 1 ms CPU in the window

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

