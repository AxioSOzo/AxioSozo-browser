### webkit-2x switch-to-engine (profile pass)

**parent pid 8806** — 152 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 89 | 26.2 | GC / CC 46, JavaScript 25, Idle 8, Layout 4 | 1 / 32 / 57 | ipc 88, gc_cc 71, harness_diagnostics 11, array_buffer_copy 11 |
| DOM Worker | 22 | 6.4 | JavaScript 21, Profiler 1 | 0 / 0 / 22 | subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 20 |
| Renderer | 17 | 4.8 | Graphics 16, Idle 0 | 0 / 0 / 17 | ipc 17, webrender_render 16, webrender_sw_raster 12, poll_wait 1 |
| BackgroundThreadPool #2 | 9 | 2.7 | Other 5, Idle 5 | 0 / 0 / 9 | ipc 9, native_receiver 5, poll_wait 5, image_container 3 |
| SwComposite | 4 | 1.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 2, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 3 | 0.9 | Idle 2, Other 1 | 0 / 0 / 3 | ipc 3, poll_wait 2, memcpy_memset 1 |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| WRRenderBackend#0 | 2 | 0.5 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 3; `nsINode::GetExistingListenerManager() const [libxul.so]` 3; `js::ConstantStrictEqual(JS::Value const&, unsigned short) [libxul.so]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3

**tab pid 9493** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 15.3 | Other 38, JavaScript 4, DOM 3, Profiler 3 | 0 / 5 / 43 | ipc 37, array_buffer_copy 16, gc_cc 12, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.so]` 3; `mprotect [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `[libfontconfig.so.1]` 2; `[libexpat.so.1]` 2; `__strlen_evex [libc.so.6]` 2

**tab pid 9499** — 47 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 46 | 17.9 | Other 36, DOM 3, Profiler 3, JavaScript 2 | 0 / 4 / 42 | ipc 36, array_buffer_copy 14, gc_cc 9, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 3; `__lll_lock_wake [libc.so.6]` 3; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `IPC::ParamTraits<nsRect>::Read(IPC::MessageReader*, nsRect*) [libxul.s` 2; `bool mozilla::dom::binding_detail::FindEnumStringIndex<true>(mozilla::` 1; `[libexpat.so.1]` 1

**tab pid 9357** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.5 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

