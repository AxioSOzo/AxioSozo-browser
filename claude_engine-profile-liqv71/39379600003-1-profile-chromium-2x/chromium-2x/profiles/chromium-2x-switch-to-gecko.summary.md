### chromium-2x switch-to-gecko (profile pass)

**parent pid 3371** — 114 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 40 | 18.6 | Graphics 39, Idle 1 | 0 / 0 / 40 | ipc 40, webrender_render 39, webrender_sw_raster 38, poll_wait 1 |
| GeckoMain | 37 | 17.1 | JavaScript 15, Layout 12, Idle 6, Graphics 2 | 2 / 26 / 9 | ipc 37, paint_layout 14, array_buffer_copy 12, gc_cc 10 |
| DOM Worker | 16 | 7.4 | JavaScript 16, Idle 0 | 0 / 0 / 16 | subprocess_pipe_io 16, worker_messaging 16, ipc 16, poll_wait 15 |
| BgIOThreadPool #1 | 10 | 4.6 | Other 9, Idle 1 | 0 / 0 / 10 | ipc 10, poll_wait 1 |
| Compositor | 3 | 1.5 | Other 2, Idle 1 | 0 / 0 / 3 | ipc 3, poll_wait 1, memcpy_memset 0 |
| WRRenderBackend#0 | 2 | 1.0 | Other 2 | 0 / 0 / 2 |  |
| SwComposite | 2 | 0.9 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 6; `write [libc.so.6]` 3; `#logEvent (resource://gre/modules/EventEmitter.sys.mjs:164:12)[56]` 2; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, nsSize, nsSt` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2; `<style::properties_and_values::value::Value<Component> as core::cmp::P` 1; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit::CacheIRW` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1

**tab pid 4035** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.8 | Idle 2, Other 1, Graphics 1 | 0 / 0 / 4 | ipc 3, poll_wait 2, paint_layout 1 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `[]` 1; `mozilla::ipc::NodeController::SerializeEventMessage(std::unique_ptr<mo` 0; `sendmsg [libc.so.6]` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message const&) [l` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3458** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**rdd pid 3466** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

