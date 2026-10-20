### webkit key (profile pass)

**parent pid 7188** — 819 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 461 | 12.6 | Idle 212, JavaScript 67, Other 42, GC / CC 38 | 8 / 121 / 332 | ipc 459, poll_wait 258, gc_cc 115, paint_layout 71 |
| DOM Worker | 187 | 5.1 | JavaScript 180, Profiler 3, Other 3 | 0 / 0 / 187 | subprocess_pipe_io 187, worker_messaging 187, ipc 187, js_ctypes 175 |
| Renderer | 54 | 1.5 | Graphics 28, Idle 27 | 0 / 0 / 54 | ipc 54, webrender_render 28, poll_wait 24, webrender_sw_raster 23 |
| Timer | 26 | 0.7 | Other 26 | 0 / 0 / 26 | ipc 26, poll_wait 26 |
| SwComposite | 26 | 0.7 | Other 26 | 0 / 0 / 26 | webrender_render 26, poll_wait 14, webrender_sw_raster 11, memcpy_memset 9 |
| Compositor | 16 | 0.4 | Idle 15, Other 1 | 0 / 0 / 16 | ipc 16, poll_wait 15, memcpy_memset 0, paint_layout 0 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 |  |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 | webrender_scene 9, paint_layout 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 230; `[unknown]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 9; `[axiosozo-dev]` 8; `mprotect [libc.so.6]` 6; `mozilla::nsDisplayImage::CreateWebRenderCommands(mozilla::wr::DisplayL` 4; `__lll_lock_wait [libc.so.6]` 4

**tab pid 7285** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Other 1 | 0 / 1 / 7 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `g_source_ref [libglib-2.0.so.0]` 1; `nsArrayCC::AddRef() [libxul.so]` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::PropertyKe` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 0; `[unknown]` 0; `mozilla::dom::GetPerInterfaceObjectHandle(JSContext*, unsigned long, v` 0; `nsTSubstring<char16_t>::EnsureMutable(unsigned long) [libxul.so]` 0

**tab pid 7599** — 1 ms CPU in the window

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

**tab pid 7339** — 1 ms CPU in the window

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

