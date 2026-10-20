### webkit switch-to-engine (profile pass)

**parent pid 7188** — 87 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 36 | 11.5 | JavaScript 14, Idle 7, GC / CC 4, Layout 4 | 0 / 24 / 12 | ipc 36, gc_cc 19, array_buffer_copy 13, paint_layout 9 |
| DOM Worker | 28 | 8.9 | JavaScript 28 | 0 / 0 / 28 | subprocess_pipe_io 28, worker_messaging 28, ipc 28, js_ctypes 27 |
| Renderer | 9 | 2.8 | Graphics 7, Idle 2 | 0 / 0 / 9 | ipc 9, webrender_render 7, webrender_sw_raster 7, poll_wait 2 |
| BackgroundThreadPool #3 | 4 | 1.1 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3, native_receiver 1, memcpy_memset 1 |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Profiler 0, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 1 |
| Compositor | 2 | 0.6 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 1 | 0.5 | Other 1 | 0 / 0 / 1 |  |
| SwComposite | 1 | 0.5 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 9; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 4; `js::jit::DoToBoolFallback(JSContext*, js::jit::BaselineFrame*, js::jit` 3; `CanAttachNativeGetProp(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 2; `[unknown]` 1; `js::jit::GetPropIRGenerator::GetPropIRGenerator(JSContext*, JS::Handle` 1; `nsBlockFrame::ReflowDirtyLines(mozilla::BlockReflowState&) [libxul.so]` 1; `js::jit::CacheIRStubInfo::stubDataSize() const [libxul.so]` 1

**tab pid 7881** — 48 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 47 | 20.5 | Other 37, JavaScript 4, Profiler 3, DOM 3 | 1 / 4 / 42 | ipc 36, array_buffer_copy 15, gc_cc 12, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, image_container 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 5; `[libexpat.so.1]` 4; `__strlen_evex [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `access [libc.so.6]` 2; `char* mozilla::detail::DuplicateString<char, 4096ul, 1ul>(char const*,` 1

**tab pid 7875** — 46 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 45 | 27.0 | Other 34, Profiler 5, DOM 3, JavaScript 2 | 0 / 3 / 43 | ipc 34, array_buffer_copy 15, gc_cc 9, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__lll_lock_wake [libc.so.6]` 4; `__strlen_evex [libc.so.6]` 3; `[]` 3; `[libexpat.so.1]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `access [libc.so.6]` 1; `NSSUTIL_ArgFetchValue@@NSSUTIL_3.14 [libnssutil3.so]` 1

**tab pid 7735** — 2 ms CPU in the window

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

