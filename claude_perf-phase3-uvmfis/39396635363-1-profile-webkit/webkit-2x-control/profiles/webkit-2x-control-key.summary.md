### webkit-2x-control key (profile pass)

**parent pid 10786** — 924 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 425 | 11.6 | Idle 216, JavaScript 71, Other 37, Layout 35 | 9 / 134 / 282 | ipc 422, poll_wait 258, gc_cc 90, paint_layout 64 |
| DOM Worker | 185 | 5.1 | JavaScript 182, Profiler 2, Other 1 | 0 / 0 / 185 | subprocess_pipe_io 185, worker_messaging 185, ipc 185, js_ctypes 172 |
| Renderer | 124 | 3.4 | Graphics 87, Idle 36, Profiler 1, Other 0 | 0 / 0 / 124 | ipc 124, webrender_render 88, webrender_sw_raster 81, poll_wait 37 |
| SwComposite | 116 | 3.2 | Other 116 | 0 / 0 / 116 | webrender_render 116, webrender_sw_raster 79, poll_wait 37, memcpy_memset 27 |
| Timer | 26 | 0.7 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26 |
| WRRenderBackend#0 | 16 | 0.4 | Other 16 | 0 / 0 / 16 | webrender_render 0, poll_wait 0 |
| Compositor | 14 | 0.4 | Idle 14, Other 0 | 0 / 0 / 14 | ipc 14, poll_wait 14, memcpy_memset 0, webrender_render 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | webrender_scene 8, array_buffer_copy 0, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 238; `[unknown]` 14; `[axiosozo-dev]` 7; `nsLayoutUtils::ComputeScrollMetadata(nsIFrame const*, nsIFrame const*,` 4; `__memmove_evex_unaligned_erms [libc.so.6]` 4; `nsFlexContainerFrame::FlexLine::ResolveFlexibleLengths(int, ComputedFl` 4; `mozilla::OverflowAreas::UnionWith(mozilla::OverflowAreas const&) [libx` 3; `nsIFrame::IsReplaced() const [libxul.so]` 3

**tab pid 10880** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 1, DOM 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::Handle<JSO` 0; `js::MicroTaskQueueSet::popFront() [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `JSStructuredCloneReader::readString(unsigned int, JSStructuredCloneRea` 0; `XPCWrappedNative::QueryInterface(nsID const&, void**) [libxul.so]` 0

**tab pid 10930** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

**tab pid 10971** — 1 ms CPU in the window

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

