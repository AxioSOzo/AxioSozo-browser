### webkit-2x switch-to-gecko (profile pass)

**parent pid 8806** — 149 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 82 | 29.1 | JavaScript 34, GC / CC 19, Layout 7, Idle 6 | 3 / 37 / 41 | ipc 82, gc_cc 32, paint_layout 17, array_buffer_copy 16 |
| Renderer | 31 | 11.0 | Graphics 28, Idle 3 | 0 / 0 / 31 | ipc 31, webrender_render 28, webrender_sw_raster 27, poll_wait 3 |
| DOM Worker | 13 | 4.8 | JavaScript 13, Idle 0 | 0 / 0 / 13 | subprocess_pipe_io 13, worker_messaging 13, ipc 13, js_ctypes 13 |
| SwComposite | 6 | 2.3 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 6, memcpy_memset 0, webrender_sw_raster 0 |
| BgIOThreadPool #2 | 5 | 1.8 | Other 5, Idle 0 | 0 / 0 / 5 | ipc 5, poll_wait 0 |
| Compositor | 4 | 1.3 | Idle 2, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 2, memcpy_memset 1, canvas_2d 0 |
| WRRenderBackend#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 |  |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5; `[axiosozo-dev]` 3; `array_includes(JSContext*, unsigned int, JS::Value*) [libxul.so]` 3; `listener (resource://gre/modules/ExtensionParent.sys.mjs:1339:26)` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `mozilla::net::SubstitutingProtocolHandler::NewURI(nsTSubstring<char> c` 2

**tab pid 9357** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 9.2 | Other 7, JavaScript 6, Idle 4, Layout 3 | 1 / 5 / 20 | ipc 21, gc_cc 13, paint_layout 10, subprocess_pipe_io 7 |
| IPC I/O Child | 1 | 0.5 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 3; `[]` 2; `nsRefreshDriver::GetNextTickHint() [libxul.so]` 2; `js::frontend::BytecodeEmitter::emitTree(js::frontend::ParseNode*, js::` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 1; `mozilla::EventListenerManager::HandleEventInternal(nsPresContext*, moz` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 1

**tab pid 8901** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 1.6 | Idle 2, JavaScript 2, DOM 0, Profiler 0 | 0 / 2 / 3 | ipc 5, array_buffer_copy 2, poll_wait 2, gc_cc 1 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::jit::DoGetPropFallback(JSContext*, js::jit::BaselineFrame*, js::ji` 1; `void mozilla::detail::HashTable<mozilla::HashMapEntry<js::jit::CacheIR` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 0; `__lll_lock_wake [libc.so.6]` 0

**tab pid 9499** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0, Profiler 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, memcpy_memset 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_evex_unaligned_erms [libc.so.6]` 0

