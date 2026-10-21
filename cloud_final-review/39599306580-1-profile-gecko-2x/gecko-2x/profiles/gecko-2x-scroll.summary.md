### gecko-2x scroll (profile pass)

**parent pid 3050** — 1849 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1455 | 69.4 | Graphics 1404, Idle 50, Other 1 | 0 / 0 / 1455 | ipc 1441, webrender_render 1404, webrender_sw_raster 1331, poll_wait 50 |
| SwComposite | 131 | 6.2 | Other 131 | 0 / 0 / 131 | webrender_render 131, poll_wait 119, webrender_sw_raster 12, memcpy_memset 11 |
| GeckoMain | 105 | 5.0 | Idle 74, Other 9, JavaScript 8, Graphics 8 | 0 / 9 / 96 | ipc 105, poll_wait 89, paint_layout 11, gc_cc 8 |
| WRRenderBackend#0 | 88 | 4.2 | Other 88 | 0 / 0 / 88 | memcpy_memset 1, poll_wait 1, webrender_render 1, array_buffer_copy 1 |
| Compositor | 32 | 1.5 | Idle 32, Other 0, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 32, webrender_scene 0, paint_layout 0 |
| WRSceneBuilder#0 | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_scene 23, webrender_render 1, poll_wait 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 2 | 0.1 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 73; `[unknown]` 5; `[linux-vdso.so.1]` 3; `[axiosozo-dev]` 3; `QuoteJSONString(JSContext*, js::StringBuilder&, JSString*) [libxul.so]` 2; `webrtc::videocapturemodule::VideoCaptureImpl::CurrentDeviceName() cons` 1; `mozilla::CycleCollectedJSContext::SetPendingException(mozilla::dom::Ex` 1; `[libgdk-3.so.0]` 1

**tab pid 3293** — 109 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 93 | 4.4 | Idle 65, Graphics 14, Other 7, Profiler 3 | 0 / 3 / 90 | ipc 91, poll_wait 65, paint_layout 17, canvas_2d 2 |
| IPC I/O Child | 15 | 0.7 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 65; `getcontext [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `[]` 1; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder*, mozilla` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `nsIFrame::Extend3DContext(nsStyleDisplay const*, nsStyleEffects const*` 1; `TimerThreadWrapper::RemoveTimer(nsTimerImpl*, mozilla::detail::BaseAut` 1

**tab pid 3209** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0; `[linux-vdso.so.1]` 0

**tab pid 3188** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0

