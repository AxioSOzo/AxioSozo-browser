### chromium-2x switch-to-gecko (profile pass)

**parent pid 3450** — 115 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 40 | 20.0 | JavaScript 14, Layout 12, Idle 10, DOM 2 | 1 / 27 / 12 | ipc 40, paint_layout 15, gc_cc 12, harness_diagnostics 11 |
| Renderer | 38 | 18.7 | Graphics 38, Idle 0 | 0 / 0 / 38 | webrender_render 38, ipc 36, webrender_sw_raster 32, poll_wait 0 |
| DOM Worker | 12 | 6.0 | JavaScript 11, Idle 1 | 0 / 0 / 12 | subprocess_pipe_io 12, worker_messaging 12, ipc 12, poll_wait 9 |
| BgIOThreadPool #2 | 12 | 5.9 | Other 11, Idle 1 | 0 / 0 / 12 | ipc 12, poll_wait 1 |
| Compositor | 4 | 2.0 | Idle 4, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4, paint_layout 0 |
| SwComposite | 3 | 1.3 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 2, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 2 | 1.2 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 1.0 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `poll [libc.so.6]` 9; `mozilla::SVGObserverUtils::InvalidateDirectRenderingObservers(nsIFrame` 3; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc<(js::Allo` 2; `apply (self-hosted:2805:23)[8]` 1; `__lll_lock_wake [libc.so.6]` 1; `js::CloneFunctionReuseScript(JSContext*, JS::Handle<JSFunction*>, JS::` 1; `mozilla::net::nsIOService::LookupProtocolHandler(nsTSubstring<char> co` 1; `mozilla::layers::SharedSurfacesChild::ShareInternal(mozilla::gfx::Sour` 1

**tab pid 4231** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 2.1 | Idle 3, Profiler 1, Layout 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 1, memcpy_memset 0 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `nsContentUtils::AppendNativeAnonymousChildren(nsIContent const*, nsTAr` 0; `getcontext [libc.so.6]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0

**tab pid 3555** — 1 ms CPU in the window

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

**utility pid 3702** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

