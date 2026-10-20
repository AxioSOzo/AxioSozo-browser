### chromium switch-to-engine (profile pass)

**parent pid 3133** — 84 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 44 | 31.2 | JavaScript 12, Layout 9, Idle 7, Other 6 | 3 / 22 / 19 | ipc 44, paint_layout 20, gc_cc 16, poll_wait 12 |
| Renderer | 21 | 14.5 | Graphics 17, Idle 3 | 0 / 0 / 21 | ipc 21, webrender_render 17, webrender_sw_raster 13, poll_wait 11 |
| DOM Worker | 7 | 4.9 | JavaScript 7, Profiler 0 | 0 / 0 / 7 | subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 7 |
| WRRenderBackend#0 | 3 | 1.9 | Other 3 | 0 / 0 / 3 |  |
| BackgroundThreadPool #2 | 2 | 1.6 | Idle 2, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 2, native_receiver 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 2 | 1.5 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 0 |
| Compositor | 2 | 1.5 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| SwComposite | 1 | 0.6 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `poll [libc.so.6]` 7; `write [libc.so.6]` 5; `recvmsg [libc.so.6]` 5; `#getClosableTabs/remainingTabs< (resource:///modules/zen/ZenSpaceManag` 3; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `nsStyleOutline::EffectiveOffsetFor(nsRect const&) const [libxul.so]` 2; `style::matching::PrivateMatchMethods::accumulate_damage_for [libxul.so` 1

**tab pid 3811** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 1.6 | Idle 1, Other 1 | 0 / 0 / 2 | poll_wait 2, ipc 2 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1

**tab pid 3994** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.7 | GC / CC 1, Idle 0 | 0 / 0 / 1 | ipc 1, gc_cc 1, poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `hashbrown::raw::RawTable<T,A>::reserve_rehash [libxul.so]` 1; `poll [libc.so.6]` 0

**tab pid 3227** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

