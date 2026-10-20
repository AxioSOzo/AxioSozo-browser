### gecko-debian key (profile pass)

**parent pid 8116** — 297 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 185 | 4.9 | Idle 46, Layout 39, GC / CC 29, Graphics 21 | 5 / 19 / 161 | ipc 184, paint_layout 66, poll_wait 59, gc_cc 42 |
| Renderer | 43 | 1.1 | Idle 23, Graphics 20 | 0 / 0 / 43 | ipc 43, poll_wait 24, webrender_render 20, webrender_sw_raster 17 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 18 | 0.5 | Idle 17, Other 1, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 17, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_scene 13, array_buffer_copy 0, webrender_render 0 |
| IPC I/O Parent | 8 | 0.2 | Idle 7, Other 0, Profiler 0 | 0 / 0 / 8 | poll_wait 7, ipc 0 |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 5, memcpy_memset 0, webrender_sw_raster 0 |
| DOM Worker | 4 | 0.1 | GC / CC 3, Idle 1 | 0 / 0 / 4 | worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 51; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `mozilla::nsDisplayListBuilder::IsAnimatedGeometryRoot(nsIFrame*, nsIFr` 3; `void mozilla::WriteULEB128<unsigned int, mozilla::ProfileBufferEntryWr` 3; `nsIFrame::IsReplaced() const [libxul.so]` 3; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `[unknown]` 2

**tab pid 8370** — 72 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 66 | 1.8 | Idle 25, GC / CC 11, Other 9, Layout 7 | 0 / 6 / 60 | ipc 61, poll_wait 27, paint_layout 15, gc_cc 13 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 29; `[linux-vdso.so.1]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `[]` 1; `nsTextNode::QueryInterface(nsID const&, void**) [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `XPCJSRuntime::NoteCustomGCThingXPCOMChildren(JSClass const*, JSObject*` 1; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 1

**tab pid 8205** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, JavaScript 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `xpc::XrayWrapper<js::CrossCompartmentWrapper, xpc::JSXrayTraits>::getO` 0; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0; `[]` 0

**tab pid 8267** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

