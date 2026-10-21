### webkit-2x key (profile pass)

**parent pid 8775** — 1043 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 476 | 12.9 | Idle 233, JavaScript 97, Layout 40, Other 37 | 11 / 149 / 316 | ipc 474, poll_wait 260, gc_cc 88, paint_layout 80 |
| DOM Worker | 223 | 6.1 | JavaScript 217, Profiler 4, Other 2 | 0 / 0 / 223 | subprocess_pipe_io 223, worker_messaging 223, ipc 223, js_ctypes 211 |
| Renderer | 110 | 3.0 | Graphics 84, Idle 26 | 0 / 0 / 110 | ipc 110, webrender_render 84, webrender_sw_raster 79, poll_wait 26 |
| BgIOThreadPool #2 | 86 | 2.3 | Other 85, Idle 1 | 0 / 0 / 86 | ipc 86, poll_wait 1 |
| SwComposite | 49 | 1.3 | Other 49 | 0 / 0 / 49 | webrender_render 49, poll_wait 31, webrender_sw_raster 18, memcpy_memset 17 |
| Timer | 36 | 1.0 | Other 36 | 0 / 0 / 36 | ipc 36, poll_wait 36 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | memcpy_memset 0 |
| Compositor | 15 | 0.4 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, webrender_render 0, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 239; `[unknown]` 19; `[axiosozo-dev]` 8; `syscall [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4; `IsTwiceTheRequiredBytesRepresentableAsUint32(unsigned long, unsigned l` 3; `bool mozilla::FrameProperties::Remove<nsTextFrame>(mozilla::FramePrope` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3

**tab pid 8861** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 1, DOM 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `mozilla::dom::JSActor::QueryHandler::SendReply(JSContext*, mozilla::do` 0; `[linux-vdso.so.1]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advance(mozilla:` 0; `nsDocShell::EnsureScriptEnvironment() [libxul.so]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::AllocateSegment(unsigned l` 0; `IPC::ReadResult<mozilla::dom::JSActorMessageMeta, true>::ReadResult<ns` 0

**tab pid 8980** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, DOM 1, JavaScript 1 | 0 / 2 / 2 | ipc 4, poll_wait 2, gc_cc 1, memcpy_memset 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `bool mozilla::detail::HashTable<js::MapAndIndex<js::PropMap> const, mo` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `nsContentUtils::GetCurrentJSContext() [libxul.so]` 0

**tab pid 8953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::ShmemDestroyed::~ShmemDestroyed() [libxul.so]` 0

