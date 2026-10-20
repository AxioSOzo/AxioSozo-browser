### webkit-2x raf (profile pass)

**parent pid 8838** — 1145 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 358 | 11.6 | Idle 251, JavaScript 56, Other 32, DOM 14 | 7 / 60 / 291 | ipc 355, poll_wait 269, gc_cc 53, engine_stream_read 38 |
| DOM Worker | 206 | 6.7 | JavaScript 199, Profiler 5, Other 1 | 0 / 0 / 206 | subprocess_pipe_io 206, worker_messaging 206, ipc 206, js_ctypes 192 |
| Renderer | 203 | 6.6 | Idle 119, Graphics 83, Other 1 | 0 / 0 / 203 | ipc 203, poll_wait 136, webrender_render 84, webrender_sw_raster 79 |
| SwComposite | 137 | 4.4 | Other 137 | 0 / 0 / 137 | webrender_render 137, poll_wait 112, webrender_sw_raster 22, memcpy_memset 19 |
| BackgroundThreadPool #2 | 116 | 3.8 | Idle 84, Other 32, Graphics 1 | 0 / 0 / 116 | ipc 116, poll_wait 85, native_receiver 32, memcpy_memset 30 |
| WRRenderBackend#0 | 44 | 1.4 | Other 44 | 0 / 0 / 44 | webrender_scene 0, array_buffer_copy 0, webrender_render 0 |
| Compositor | 32 | 1.0 | Idle 32, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 32, webrender_render 0, canvas_2d 0 |
| Timer | 24 | 0.8 | Other 24, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 24 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 266; `[unknown]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 3; `[linux-vdso.so.1]` 3; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*, js::Maybe` 3; `mprotect [libc.so.6]` 2; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 2

**tab pid 9377** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 1, GC / CC 1, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 1, gc_cc 1, array_buffer_copy 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `void mozilla::CycleCollectedJSRuntime::TraverseJSHolders<mozilla::JSHo` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::gcstats::Statistics::renderJsonSlice(unsigned long) const [libxul.` 0

**tab pid 9005** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 8983** — 1 ms CPU in the window

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

