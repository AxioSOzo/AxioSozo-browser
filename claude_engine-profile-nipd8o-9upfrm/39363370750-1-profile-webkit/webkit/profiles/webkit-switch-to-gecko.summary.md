### webkit switch-to-gecko (profile pass)

**parent pid 7188** — 109 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 67 | 24.1 | JavaScript 29, Layout 9, Other 8, DOM 8 | 5 / 41 / 21 | ipc 67, array_buffer_copy 18, gc_cc 15, paint_layout 15 |
| Renderer | 18 | 6.3 | Graphics 16, Idle 2 | 0 / 0 / 18 | ipc 18, webrender_render 16, webrender_sw_raster 14, poll_wait 2 |
| DOM Worker | 13 | 4.6 | JavaScript 12, Idle 1 | 0 / 0 / 13 | subprocess_pipe_io 13, worker_messaging 13, ipc 13, poll_wait 12 |
| Compositor | 3 | 1.1 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, paint_layout 0 |
| WRRenderBackend#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| SwComposite | 1 | 0.5 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBarrier(js::` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 2; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<mozilla::dom` 2; `__memset_evex_unaligned_erms [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `XPCWrappedNative::GetNewOrUsed(JSContext*, xpcObjectHelper&, XPCWrappe` 2; `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifIXsr3stdE9i` 2

**tab pid 7731** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 9.3 | JavaScript 9, Other 8, Idle 4, Layout 3 | 0 / 9 / 17 | ipc 24, gc_cc 8, poll_wait 5, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(js::fronte` 1; `js::SharedImmutableScriptData::createWith(js::FrontendContext*, std::u` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 1; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 1; `non-virtual thunk to nsINode::WrapObject(JSContext*, JS::Handle<JSObje` 1

**tab pid 7285** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 1.7 | Idle 4, DOM 1, Other 0 | 0 / 1 / 4 | ipc 4, poll_wait 4, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 1; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `mozilla::dom::WindowGlobalChild::RecvRawMessage(mozilla::dom::JSActorM` 0

**tab pid 7817** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

