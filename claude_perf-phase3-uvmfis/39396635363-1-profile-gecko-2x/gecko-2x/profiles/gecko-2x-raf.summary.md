### gecko-2x raf (profile pass)

**parent pid 2854** — 443 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 206 | 6.7 | Graphics 114, Idle 90, Other 1 | 0 / 0 / 206 | ipc 206, webrender_render 116, poll_wait 94, webrender_sw_raster 93 |
| SwComposite | 65 | 2.1 | Other 65 | 0 / 0 / 65 | webrender_render 65, poll_wait 56, memcpy_memset 8, webrender_sw_raster 8 |
| WRRenderBackend#0 | 55 | 1.8 | Other 55 | 0 / 0 / 55 | webrender_render 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 40 | 1.3 | Other 40, Profiler 0 | 0 / 0 / 40 | webrender_scene 40, webrender_render 1, poll_wait 0, paint_layout 0 |
| Compositor | 35 | 1.1 | Idle 34, Other 1 | 0 / 0 / 35 | ipc 35, poll_wait 34, paint_layout 0, webrender_render 0 |
| GeckoMain | 24 | 0.8 | Idle 18, JavaScript 2, Other 1, Graphics 1 | 0 / 2 / 22 | ipc 24, poll_wait 18, paint_layout 3, gc_cc 2 |
| IPC I/O Parent | 9 | 0.3 | Idle 8, Other 0 | 0 / 0 / 9 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 18; `mozilla::ComputedStyle::HasAnchorPosReference() const [libxul.so]` 1; `nsFlexContainerFrame::UnionInFlowChildOverflow(mozilla::OverflowAreas&` 1; `sendmsg [libc.so.6]` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 1; `js::SavedStacks::getOrCreateSavedFrame(JSContext*, JS::Handle<js::Save` 1; `mprotect [libc.so.6]` 1; `recvmsg [libc.so.6]` 0

**tab pid 3126** — 153 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 139 | 4.5 | Idle 93, Graphics 15, Layout 14, Other 9 | 0 / 5 / 134 | ipc 136, poll_wait 94, paint_layout 37, gc_cc 2 |
| IPC I/O Child | 13 | 0.4 | Idle 13, Other 0 | 0 / 0 / 13 | poll_wait 13, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 92; `sendmsg [libc.so.6]` 3; `[]` 2; `[linux-vdso.so.1]` 1; `void IPC::WriteSequenceParam<unsigned long const>(IPC::MessageWriter*,` 1; `nsIXPConnect::XPConnect() [libxul.so]` 1; `mozilla::nsDisplayListBuilder::MarkOutOfFlowFrameForDisplay(nsIFrame*,` 1; `mozilla::dom::PWindowGlobalChild::OnMessageReceived(IPC::Message const` 1

**tab pid 3012** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3052** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

