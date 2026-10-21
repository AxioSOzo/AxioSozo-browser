### webkit key (profile pass)

**parent pid 7154** — 471 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 275 | 7.6 | Idle 150, JavaScript 40, Graphics 23, Other 23 | 8 / 60 / 207 | ipc 274, poll_wait 166, gc_cc 48, paint_layout 45 |
| DOM Worker | 91 | 2.5 | JavaScript 88, Other 2, Profiler 1 | 0 / 0 / 91 | subprocess_pipe_io 91, worker_messaging 91, ipc 91, js_ctypes 82 |
| Renderer | 30 | 0.8 | Graphics 16, Idle 14 | 0 / 0 / 30 | ipc 30, webrender_render 16, poll_wait 15, webrender_sw_raster 14 |
| Timer | 18 | 0.5 | Other 18, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 18, memcpy_memset 0 |
| WRRenderBackend#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 | webrender_render 0 |
| SwComposite | 10 | 0.3 | Other 10 | 0 / 0 / 10 | webrender_render 10, poll_wait 9, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | ipc 9, poll_wait 9, paint_layout 0 |
| DOM Worker | 8 | 0.4 | Other 6, GC / CC 2, Idle 0 | 0 / 0 / 8 | ipc 8, gc_cc 8, memcpy_memset 2, worker_messaging 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 157; `[unknown]` 9; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 3; `[axiosozo-dev]` 3; `__lll_lock_wait [libc.so.6]` 3; `nsLayoutUtils::FindNearestCommonAncestorFrame(nsIFrame const*, nsIFram` 2; `nsIFrame::GetTransformMatrix(mozilla::ViewportType, mozilla::RelativeT` 2; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozilla::LayoutF` 2

**tab pid 7246** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.1 | Idle 5, JavaScript 1, Other 0 | 0 / 0 / 5 | ipc 5, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `lazyGetter (resource://gre/modules/XPCOMUtils.sys.mjs:237:24)[4]` 0; `__memcmp_evex_movbe [libc.so.6]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `mozilla::dom::ReceiveMessageArgument::ReceiveMessageArgument() [libxul` 0; `nsMemoryReporterManager::QueryInterface(nsID const&, void**) [libxul.s` 0; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry const*) [lib` 0; `mozilla::dom::PWindowGlobalChild::OnMessageReceived(IPC::Message const` 0

**tab pid 7341** — 1 ms CPU in the window

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

**tab pid 7322** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

