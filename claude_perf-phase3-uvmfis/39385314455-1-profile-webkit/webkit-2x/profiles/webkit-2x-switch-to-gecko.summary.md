### webkit-2x switch-to-gecko (profile pass)

**parent pid 8674** — 139 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 68 | 24.1 | JavaScript 32, Layout 10, Other 8, DOM 7 | 3 / 39 / 26 | ipc 68, gc_cc 19, array_buffer_copy 18, paint_layout 15 |
| Renderer | 36 | 12.7 | Graphics 31, Idle 5 | 0 / 0 / 36 | ipc 35, webrender_render 31, webrender_sw_raster 30, poll_wait 5 |
| DOM Worker | 12 | 4.1 | JavaScript 11, Idle 0 | 0 / 0 / 12 | subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 11 |
| BgIOThreadPool #3 | 9 | 3.1 | Other 8, Idle 0 | 0 / 0 / 9 | ipc 9, poll_wait 0 |
| SwComposite | 4 | 1.6 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| Compositor | 3 | 1.0 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRRenderBackend#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | memcpy_memset 0 |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `PLDHashTable::Iterator::Iterator(PLDHashTable*) [libxul.so]` 4; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 4; `goSetCommandEnabled (chrome://global/content/globalOverlay.js:133:29)[` 3; `js::jit::CallIRGenerator::tryAttachFunCallBound(JS::Handle<JSFunction*` 3; `JS::GetDeflatedUTF8StringLength(JSLinearString*) [libxul.so]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2

**tab pid 9079** — 27 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 25 | 9.0 | Other 9, JavaScript 6, Idle 3, Graphics 2 | 0 / 7 / 18 | ipc 23, paint_layout 13, gc_cc 11, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom const*, b` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 1; `__lll_lock_wait [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 1; `nsTSubstring<char16_t>::StartBulkWriteImpl(unsigned long, unsigned lon` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 1; `js::gc::BufferAllocator::updateFreeListsAfterAlloc(js::gc::BufferAlloc` 1

**tab pid 8765** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.3 | Idle 2, JavaScript 1, Other 1 | 0 / 1 / 3 | ipc 4, poll_wait 2, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::CallObject::createForFrame(JSContext*, js::AbstractFramePtr, js::g` 1; `xpc::AutoScriptActivity::~AutoScriptActivity() [libxul.so]` 0; `mozilla::CCGCScheduler::MaybePokeCC(mozilla::TimeStamp, unsigned int) ` 0; `[unknown]` 0

**tab pid 8826** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

