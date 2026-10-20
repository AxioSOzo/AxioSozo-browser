### chromium-2x switch-to-engine (profile pass)

**parent pid 3139** — 210 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 86 | 40.0 | Graphics 85, Idle 1 | 0 / 0 / 86 | ipc 86, webrender_render 85, webrender_sw_raster 72, poll_wait 7 |
| GeckoMain | 66 | 30.7 | DOM 18, JavaScript 13, Layout 12, Idle 12 | 4 / 35 / 26 | ipc 66, paint_layout 24, gc_cc 17, array_buffer_copy 15 |
| BackgroundThreadPool #3 | 19 | 9.0 | Other 14, Idle 6 | 0 / 0 / 19 | ipc 19, native_receiver 14, memcpy_memset 7, image_container 6 |
| DOM Worker | 14 | 6.4 | JavaScript 13, Profiler 1 | 0 / 0 / 14 | subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 11 |
| SwComposite | 10 | 4.9 | Other 10 | 0 / 0 / 10 | webrender_render 10, poll_wait 8, memcpy_memset 2, webrender_sw_raster 2 |
| WRRenderBackend#0 | 5 | 2.5 | Other 5 | 0 / 0 / 5 | webrender_render 0 |
| Compositor | 4 | 1.7 | Idle 4 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| WRSceneBuilder#0 | 3 | 1.4 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |

Main thread, top self: `poll [libc.so.6]` 12; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 7; `mozilla::net::nsStandardURL::nsStandardURL(bool, bool) [libxul.so]` 7; `<style::values::specified::corner_shape::CornerShape as style::parser:` 5; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS::MutableHa` 4; `mozilla::nsCSSGradientRenderer::TryPaintTilesWithExtendMode(gfxContext` 4; `windowBackground (chrome://browser/content/axiosozo/EngineFrameSurface` 4; `__lll_lock_wake [libc.so.6]` 2

**tab pid 3826** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.4 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, webrender_render 0 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::dom::BrowserChild::GetFrom(mozilla::layers::LayersId) [libxul` 0

**tab pid 4020** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3335** — 0 ms CPU in the window

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

