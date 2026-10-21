### webkit-2x switch-to-gecko (profile pass)

**parent pid 8775** — 158 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 76 | 25.7 | JavaScript 22, Layout 13, DOM 11, Other 9 | 3 / 35 / 38 | ipc 76, paint_layout 20, array_buffer_copy 16, gc_cc 16 |
| Renderer | 42 | 14.1 | Graphics 40, Idle 2 | 0 / 0 / 42 | ipc 41, webrender_render 40, webrender_sw_raster 39, poll_wait 3 |
| DOM Worker | 15 | 4.9 | JavaScript 14, Idle 1 | 0 / 0 / 15 | subprocess_pipe_io 15, worker_messaging 15, ipc 15, poll_wait 13 |
| BgIOThreadPool #2 | 10 | 3.5 | Other 10, Idle 0 | 0 / 0 / 10 | ipc 10, poll_wait 0 |
| WRRenderBackend#0 | 4 | 1.3 | Other 4 | 0 / 0 / 4 | memcpy_memset 0 |
| Compositor | 3 | 0.9 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRSceneBuilder#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |
| IPC I/O Parent | 2 | 0.8 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `mozilla::AbsoluteContainingBlock::ReflowAbsoluteFrame(nsContainerFrame` 4; `[unknown]` 4; `mozilla::net::nsHttpChannel::CallOnStartRequest() [libxul.so]` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `nsINode::GetMutationObservers() [libxul.so]` 3; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 3; `mozilla::nsDisplayItem::GetClippedBounds(mozilla::nsDisplayListBuilder` 2

**tab pid 9340** — 29 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 27 | 9.3 | JavaScript 10, Other 9, Idle 4, GC / CC 2 | 1 / 9 / 18 | ipc 23, paint_layout 9, gc_cc 8, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.5 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 3; `mozJSModuleLoader::GetSourceFile(nsIURI*, nsIFile**) [libxul.so]` 3; `RemoveSkippableVisitor::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [` 1; `js::SharedPropMap::addPropertyInternal(JSContext*, JS::MutableHandle<j` 1; `js::frontend::BytecodeEmitter::emitJumpTargetOp(JSOp, js::frontend::By` 1; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::Handle<JS::` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 1

**tab pid 8861** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 1.5 | Idle 4, DOM 1, Other 0 | 0 / 1 / 4 | ipc 5, poll_wait 4, array_buffer_copy 1 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 9483** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

