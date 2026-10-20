### chromium switch-to-gecko (profile pass)

**parent pid 3144** — 410 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| BgIOThreadPool #4 | 275 | 1.8 | Other 275, Idle 0 | 0 / 0 / 275 | ipc 275, poll_wait 0 |
| DOM Worker | 55 | 0.4 | GC / CC 28, Other 19, JavaScript 7, Idle 2 | 0 / 0 / 55 | subprocess_pipe_io 55, worker_messaging 55, ipc 55, gc_cc 47 |
| GeckoMain | 51 | 0.3 | Idle 15, Layout 14, JavaScript 10, Other 4 | 1 / 22 / 28 | ipc 51, paint_layout 20, poll_wait 15, harness_diagnostics 8 |
| Renderer | 13 | 0.1 | Graphics 11, Idle 2 | 0 / 0 / 13 | ipc 13, webrender_render 11, webrender_sw_raster 10, poll_wait 2 |
| IPC I/O Parent | 5 | 0.0 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Compositor | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, webrender_render 0 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `poll [libc.so.6]` 14; `[axiosozo-dev]` 3; `core::ptr::drop_in_place<style::values::generics::length::GenericMargi` 2; `madvise [libc.so.6]` 2; `nsRegion::Sub(nsRegion const&, nsRegion const&) [libxul.so]` 2; `core::ptr::drop_in_place<style::values::generics::image::GenericGradie` 2; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS::MutableHa` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3280** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `write [libc.so.6]` 0

**tab pid 3799** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, DOM 0, Layout 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `PLDHashTable::MakeEntryHandle(void const*, std::nothrow_t const&) [lib` 0; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozilla::LayoutF` 0

**tab pid 3301** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `[]` 0

