### chromium switch-to-gecko (profile pass)

**parent pid 3278** — 95 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 23.2 | Layout 16, JavaScript 11, Other 7, Idle 6 | 1 / 28 / 20 | ipc 48, paint_layout 25, poll_wait 11, harness_diagnostics 9 |
| Renderer | 16 | 7.7 | Graphics 14, Idle 2 | 0 / 0 / 16 | ipc 16, webrender_render 14, webrender_sw_raster 14, poll_wait 2 |
| DOM Worker | 11 | 5.4 | JavaScript 10, Idle 1 | 0 / 0 / 11 | subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 11 |
| BgIOThreadPool #2 | 10 | 5.0 | Other 10, Idle 1 | 0 / 0 / 10 | ipc 10, poll_wait 1 |
| Compositor | 3 | 1.4 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |
| WRRenderBackend#0 | 1 | 0.6 | Other 1 | 0 / 0 / 1 |  |
| SwComposite | 1 | 0.4 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `poll [libc.so.6]` 7; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNative::CallMo` 4; `[libgtk-3.so.0]` 3; `core::ptr::drop_in_place<style::values::specified::border::BorderSideW` 3; `SerializeJSONArray(JSContext*, JS::Handle<JSObject*>, (anonymous names` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `[libxul.so]` 1; `mozilla::StyleGenericInset<mozilla::StylePercentage, mozilla::StyleLen` 1

**tab pid 3950** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.8 | Idle 3, Layout 0, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 1 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `PresShell::DoFlushPendingNotifications InterruptibleLayout` 0; `[libfreeblpriv3.so]` 0

**tab pid 3368** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**socket pid 3357** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

