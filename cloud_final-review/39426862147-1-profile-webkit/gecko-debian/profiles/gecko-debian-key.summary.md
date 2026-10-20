### gecko-debian key (profile pass)

**parent pid 8214** — 244 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 148 | 3.9 | Idle 41, Layout 35, Other 23, JavaScript 22 | 4 / 24 / 120 | ipc 146, poll_wait 61, paint_layout 56, gc_cc 16 |
| Renderer | 33 | 0.9 | Idle 20, Graphics 13 | 0 / 0 / 33 | ipc 33, poll_wait 21, webrender_render 13, webrender_sw_raster 11 |
| Compositor | 17 | 0.5 | Idle 15, Other 2, Profiler 0 | 0 / 0 / 17 | ipc 17, poll_wait 15, memcpy_memset 2, webrender_render 0 |
| WRRenderBackend#0 | 17 | 0.4 | Other 17 | 0 / 0 / 17 | webrender_render 0, webrender_scene 0 |
| WRSceneBuilder#0 | 13 | 0.3 | Other 13 | 0 / 0 / 13 | webrender_scene 13, webrender_render 0, paint_layout 0 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 4 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 46; `[unknown]` 7; `[axiosozo-dev]` 3; `mozilla::nsDisplayList::HitTest(mozilla::nsDisplayListBuilder*, nsRect` 2; `nsIFrame::CanBeDynamicReflowRoot() const [libxul.so]` 2; `mozilla::ReflowInput::ComputeContainingBlockRectangle(nsPresContext*, ` 2; `__lll_lock_wait [libc.so.6]` 2; `[libX11.so.6]` 2

**tab pid 8469** — 64 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 59 | 1.6 | Idle 24, Other 12, JavaScript 6, Graphics 6 | 0 / 5 / 53 | ipc 53, poll_wait 24, paint_layout 17, gc_cc 5 |
| IPC I/O Child | 5 | 0.1 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 27; `[]` 2; `[linux-vdso.so.1]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libxul.so]` 1; `mozilla::nsDisplayListBuilder::CreateClipChainIntersection(mozilla::Di` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 1; `nsCycleCollector::CollectWhite() [libxul.so]` 1

**tab pid 8309** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, GC / CC 0, DOM 0 | 0 / 1 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `firefox_on_glean::private::timing_distribution::TimingDistributionMetr` 0; `xpc::JSXrayTraits::getOwnPropertyFromTargetIfSafe(JSContext*, JS::Hand` 0; `js::Proxy::getElements(JSContext*, JS::Handle<JSObject*>, unsigned int` 0; `[unknown]` 0; `[]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[6` 0

**tab pid 8400** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

