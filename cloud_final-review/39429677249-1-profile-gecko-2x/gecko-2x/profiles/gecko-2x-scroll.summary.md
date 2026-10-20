### gecko-2x scroll (profile pass)

**parent pid 3067** — 1853 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1464 | 70.0 | Graphics 1413, Idle 49, Other 1, Profiler 1 | 0 / 0 / 1464 | ipc 1451, webrender_render 1415, webrender_sw_raster 1352, poll_wait 51 |
| SwComposite | 132 | 6.3 | Other 132 | 0 / 0 / 132 | webrender_render 132, poll_wait 121, memcpy_memset 10, webrender_sw_raster 10 |
| GeckoMain | 101 | 4.8 | Idle 70, Other 10, Graphics 7, JavaScript 4 | 0 / 7 / 94 | ipc 101, poll_wait 88, paint_layout 11, gc_cc 4 |
| WRRenderBackend#0 | 90 | 4.3 | Other 90 | 0 / 0 / 90 | memcpy_memset 1, webrender_render 0 |
| Compositor | 31 | 1.5 | Idle 30, Other 1 | 0 / 0 / 31 | ipc 31, poll_wait 30, webrender_render 0, webrender_scene 0 |
| WRSceneBuilder#0 | 22 | 1.0 | Other 22 | 0 / 0 / 22 | webrender_scene 22, webrender_render 1, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 8, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 71; `nsPresContext::UpdateContainerQueryStylesAndAnchorPosLayout() [libxul.` 2; `[axiosozo-dev]` 1; `__lll_lock_wait [libc.so.6]` 1; `writev [libc.so.6]` 1; `js::Stringify(JSContext*, JS::MutableHandle<JS::Value>, JSObject*, JS:` 1; `[unknown]` 1; `syscall [libc.so.6]` 1

**tab pid 3307** — 109 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 93 | 4.5 | Idle 62, Graphics 15, Other 7, JavaScript 3 | 0 / 4 / 90 | ipc 89, poll_wait 63, paint_layout 20, gc_cc 2 |
| IPC I/O Child | 15 | 0.7 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 63; `[]` 3; `sendmsg [libc.so.6]` 2; `mozilla::FlattenedDisplayListIterator::GetNextItem() [libxul.so]` 1; `[linux-vdso.so.1]` 1; `js::LifoAlloc::mark() [libxul.so]` 1; `style::properties::generated::longhands::zoom::cascade_property [libxu` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3242** — 1 ms CPU in the window

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

**tab pid 3402** — 1 ms CPU in the window

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

