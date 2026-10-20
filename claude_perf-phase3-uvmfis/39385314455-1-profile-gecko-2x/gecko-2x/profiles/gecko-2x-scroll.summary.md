### gecko-2x scroll (profile pass)

**parent pid 2847** — 1810 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 948 | 46.2 | Graphics 876, Idle 71, Other 1 | 0 / 0 / 948 | ipc 946, webrender_render 877, webrender_sw_raster 818, poll_wait 71 |
| GeckoMain | 346 | 16.9 | Idle 104, JavaScript 85, DOM 76, Other 43 | 15 / 127 / 204 | ipc 346, poll_wait 156, gc_cc 147, array_buffer_copy 62 |
| DOM Worker | 275 | 13.4 | JavaScript 106, Idle 57, GC / CC 53, DOM 43 | 25 / 160 / 90 | worker_messaging 275, ipc 275, gc_cc 70, poll_wait 61 |
| WRRenderBackend#0 | 87 | 4.2 | Other 87 | 0 / 0 / 87 | webrender_render 3, poll_wait 1, webrender_scene 0, memcpy_memset 0 |
| SwComposite | 81 | 3.9 | Other 81 | 0 / 0 / 81 | webrender_render 81, poll_wait 76, webrender_sw_raster 4, memcpy_memset 4 |
| Compositor | 30 | 1.5 | Idle 30, Other 1 | 0 / 0 / 30 | ipc 30, poll_wait 30, webrender_render 0, webrender_scene 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 | webrender_scene 22, webrender_render 1, poll_wait 0, gc_cc 0 |
| Socket Thread | 9 | 0.4 | Other 9 | 0 / 0 / 9 | ipc 8, poll_wait 8 |

Main thread, top self: `poll [libc.so.6]` 107; `__memmove_avx512_unaligned_erms [libc.so.6]` 12; `[unknown]` 11; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 8; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 6; `read [libc.so.6]` 6; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 6; `mozilla::dom::CallbackObject::Release() [libxul.so]` 6

**tab pid 3114** — 130 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 112 | 5.5 | Idle 82, Graphics 12, JavaScript 7, Other 6 | 0 / 7 / 105 | ipc 109, poll_wait 82, paint_layout 20, gc_cc 3 |
| IPC I/O Child | 17 | 0.8 | Idle 16, Other 1, Profiler 0 | 0 / 0 / 17 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 82; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 2; `[]` 1; `mozilla::AppShutdown::IsShutdownImpending() [libxul.so]` 1; `sendmsg [libc.so.6]` 1; `mozilla::dom::FontFaceSetImpl::CheckLoadingFinished() [libxul.so]` 1; `nsRegion::Sub(nsRegion const&, nsRegion const&) [libxul.so]` 1; `js::ResolvePromiseInternal(JSContext*, JS::Handle<JSObject*>, JS::Hand` 1

**tab pid 3039** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObject*) [libxu` 0

**tab pid 2947** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 0

