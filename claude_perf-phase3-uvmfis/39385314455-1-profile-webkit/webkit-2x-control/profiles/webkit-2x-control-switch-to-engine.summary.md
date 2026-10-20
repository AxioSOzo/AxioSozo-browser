### webkit-2x-control switch-to-engine (profile pass)

**parent pid 10383** — 130 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 49 | 7.9 | JavaScript 46, Other 2, Profiler 1, Idle 0 | 0 / 0 / 49 | subprocess_pipe_io 49, worker_messaging 49, ipc 49, js_ctypes 34 |
| GeckoMain | 43 | 6.9 | JavaScript 17, Idle 11, Layout 5, DOM 3 | 1 / 22 / 19 | ipc 38, gc_cc 14, harness_diagnostics 11, poll_wait 9 |
| Renderer | 15 | 2.4 | Graphics 14, Idle 1 | 0 / 0 / 15 | ipc 15, webrender_render 14, webrender_sw_raster 13, poll_wait 1 |
| BackgroundThreadPool #3 | 9 | 1.5 | Other 6, Idle 3 | 0 / 0 / 9 | ipc 9, native_receiver 6, memcpy_memset 5, poll_wait 3 |
| DOM Worker | 3 | 0.4 | Other 2, Idle 0 | 0 / 0 / 3 | worker_messaging 3, ipc 3, poll_wait 3, gc_cc 2 |
| SwComposite | 2 | 0.4 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 2 | 0.4 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Parent | 2 | 0.3 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit::CacheIRW` 2; `[libxul.so]` 2; `[linux-vdso.so.1]` 2; `JS::loader::ModuleLoaderBase::EvaluateModuleInContext(JSContext*, JS::` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2

**tab pid 10884** — 44 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 44 | 9.3 | Other 35, JavaScript 5, DOM 2, Idle 1 | 0 / 3 / 41 | ipc 32, array_buffer_copy 16, gc_cc 10, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `[libexpat.so.1]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `uhash_geti_78 [libxul.so]` 2; `__strlen_evex [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `mprotect [libc.so.6]` 1

**tab pid 10778** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.3 | Idle 2, Profiler 0, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `[]` 0; `__memset_evex_unaligned_erms [libc.so.6]` 0; `IPC::ReadResult<std::remove_cv<mozilla::WidgetMouseEvent>::type, (std:` 0

**tab pid 10881** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.2 | Idle 1, GC / CC 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::GCRuntime::purgeRuntimeForMinorGC() [libxul.so]` 0

