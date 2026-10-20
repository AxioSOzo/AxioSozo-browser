### webkit switch-to-engine (profile pass)

**parent pid 7188** — 81 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 10.4 | JavaScript 15, Layout 6, Idle 5, DOM 5 | 0 / 24 / 13 | ipc 37, gc_cc 20, array_buffer_copy 11, paint_layout 9 |
| DOM Worker | 23 | 6.5 | JavaScript 22, Profiler 1 | 0 / 0 / 23 | subprocess_pipe_io 23, worker_messaging 23, ipc 23, js_ctypes 22 |
| Renderer | 7 | 2.1 | Graphics 7, Idle 1 | 0 / 0 / 7 | ipc 7, webrender_render 7, webrender_sw_raster 6, poll_wait 1 |
| BackgroundThreadPool #2 | 4 | 1.1 | Idle 2, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 2, native_receiver 1, memcpy_memset 1 |
| IPC I/O Parent | 3 | 0.7 | Idle 2, Other 0 | 0 / 0 / 3 | poll_wait 2, ipc 0 |
| Compositor | 2 | 0.5 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 2 | 0.5 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 1 | 0.4 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `nsBlockFrame::ReflowBlockFrame(mozilla::BlockReflowState&, GenericLine` 2; `js::frontend::BytecodeEmitter::updateSourceCoordNotes(unsigned int) [l` 2; `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifIXsr3stdE9i` 2; `v8::internal::ExternalReference::TopOfRegexpStack(v8::internal::Isolat` 2; `[axiosozo-dev]` 1; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*, JS::Hand` 1; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 1

**tab pid 7735** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 16.8 | Other 36, JavaScript 5, Profiler 3, DOM 3 | 1 / 3 / 44 | ipc 38, array_buffer_copy 17, gc_cc 10, subprocess_pipe_io 3 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 6; `__syscall_cancel_arch [libc.so.6]` 4; `js::SharedPropMap::addPropertyInternal(JSContext*, JS::MutableHandle<j` 3; `mmap64 [libc.so.6]` 2; `[libexpat.so.1]` 2; `access [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `[libfontconfig.so.1]` 1

**tab pid 7741** — 46 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 45 | 17.5 | Other 33, Profiler 4, DOM 3, JavaScript 3 | 0 / 4 / 41 | ipc 33, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 2; `[libfontconfig.so.1]` 2; `[libexpat.so.1]` 2; `fstat64 [libc.so.6]` 1; `js::frontend::TDZCheckCache::needsTDZCheck(js::frontend::BytecodeEmitt` 1

**tab pid 7593** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.5 | Idle 1, Other 1, Profiler 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `g_poll [libglib-2.0.so.0]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 0

