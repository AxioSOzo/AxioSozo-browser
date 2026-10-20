### webkit switch-to-engine (profile pass)

**parent pid 7188** — 86 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 14.7 | JavaScript 9, DOM 8, Idle 6, Layout 4 | 0 / 25 / 12 | ipc 37, gc_cc 18, harness_diagnostics 15, array_buffer_copy 13 |
| Renderer | 17 | 6.9 | Graphics 12, Idle 5 | 0 / 0 / 17 | ipc 17, webrender_render 12, webrender_sw_raster 12, poll_wait 5 |
| DOM Worker | 14 | 5.6 | JavaScript 13, Profiler 1 | 0 / 0 / 14 | subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 14 |
| BackgroundThreadPool #1 | 6 | 2.3 | Other 4, Idle 2 | 0 / 0 / 6 | ipc 6, native_receiver 4, memcpy_memset 3, image_container 2 |
| IPC I/O Parent | 2 | 0.9 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Compositor | 2 | 0.8 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 |  |
| SwComposite | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 5; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObjectEdge(JSO` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3; `js::DefineDataProperty(JSContext*, JS::Handle<JSObject*>, JS::Handle<J` 2; `nsIFrame::GetAspectRatio() const [libxul.so]` 1; `__lll_lock_wake [libc.so.6]` 1; `Servo_MaybeGCRuleTree [libxul.so]` 1

**tab pid 7881** — 42 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 41 | 24.8 | Other 31, JavaScript 3, Profiler 3, DOM 3 | 0 / 5 / 36 | ipc 31, array_buffer_copy 13, gc_cc 10, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libfontconfig.so.1]` 4; `[]` 3; `__lll_lock_wake [libc.so.6]` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 1; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 1; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 1

**tab pid 7887** — 39 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 38 | 24.6 | Other 30, JavaScript 4, Profiler 2, DOM 1 | 0 / 3 / 35 | ipc 30, array_buffer_copy 11, gc_cc 6, subprocess_pipe_io 2 |
| IPC I/O Child | 1 | 0.6 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__strcmp_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::net::LoadInfo::~LoadInfo() [libxul.so]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `uhash_geti_78 [libxul.so]` 2; `[libfontconfig.so.1]` 2; `[libexpat.so.1]` 2

**tab pid 7740** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.8 | Idle 2, Profiler 0, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 0

