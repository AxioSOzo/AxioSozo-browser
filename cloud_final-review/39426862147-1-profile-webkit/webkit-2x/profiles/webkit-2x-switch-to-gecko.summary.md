### webkit-2x switch-to-gecko (profile pass)

**parent pid 8838** — 148 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 84 | 30.3 | JavaScript 32, GC / CC 23, Layout 9, Idle 6 | 5 / 36 / 43 | ipc 84, gc_cc 40, array_buffer_copy 16, paint_layout 16 |
| Renderer | 33 | 12.1 | Graphics 30, Idle 3 | 0 / 0 / 33 | ipc 32, webrender_render 30, webrender_sw_raster 28, poll_wait 3 |
| DOM Worker | 11 | 3.9 | JavaScript 10, Idle 1 | 0 / 0 / 11 | subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 9 |
| Compositor | 5 | 1.7 | Idle 4, Other 1 | 0 / 0 / 5 | ipc 5, poll_wait 4, memcpy_memset 1 |
| SwComposite | 4 | 1.4 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 2, memcpy_memset 1, webrender_sw_raster 1 |
| BgIOThreadPool #2 | 4 | 1.4 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3 |
| WRRenderBackend#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 | webrender_render 0, poll_wait 0 |
| WRSceneBuilder#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 9; `mprotect [libc.so.6]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `[unknown]` 3; `nsBlockFrame::ReflowDirtyLines(mozilla::BlockReflowState&) [libxul.so]` 2; `_send (resource://gre/modules/ConduitsParent.sys.mjs:317:8)[144]` 2; `CanAttachNativeGetProp(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 2

**tab pid 9377** — 23 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 22 | 7.9 | Other 8, JavaScript 5, Idle 4, Layout 2 | 0 / 6 / 16 | ipc 21, poll_wait 4, gc_cc 4, subprocess_pipe_io 3 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `__memcmp_evex_movbe [libc.so.6]` 1; `nsTSubstring<char>::~nsTSubstring() [libxul.so]` 1; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 1; `[]` 1; `mozilla::detail::HashTable<void* const, mozilla::HashSet<void*, mozill` 1; `mozilla::SchedulerGroup::Dispatch(already_AddRefed<nsIRunnable>, nsIEv` 1; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 1

**tab pid 8924** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.6 | Idle 3, JavaScript 1, Other 0 | 0 / 1 / 3 | ipc 4, poll_wait 3, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 0 | 0.2 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::Assembler::finish() [libxul.so]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::Value>, js:` 0

**tab pid 9520** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

