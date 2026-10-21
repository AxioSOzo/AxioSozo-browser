### webkit-2x raf (profile pass)

**parent pid 8803** — 1097 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 354 | 11.5 | Idle 245, JavaScript 64, Other 22, DOM 16 | 6 / 65 / 283 | ipc 353, poll_wait 256, gc_cc 51, engine_stream_read 35 |
| DOM Worker | 201 | 6.6 | JavaScript 194, Other 4, Profiler 3 | 0 / 0 / 201 | subprocess_pipe_io 201, worker_messaging 201, ipc 201, js_ctypes 187 |
| Renderer | 187 | 6.1 | Idle 99, Graphics 89, Profiler 0 | 0 / 0 / 187 | ipc 187, poll_wait 117, webrender_render 89, webrender_sw_raster 77 |
| SwComposite | 131 | 4.3 | Other 131 | 0 / 0 / 131 | webrender_render 131, poll_wait 104, webrender_sw_raster 26, memcpy_memset 25 |
| BackgroundThreadPool #1 | 107 | 3.5 | Idle 76, Other 29, Graphics 2, Profiler 0 | 0 / 0 / 107 | ipc 107, poll_wait 77, native_receiver 30, memcpy_memset 29 |
| WRRenderBackend#0 | 42 | 1.4 | Other 42 | 0 / 0 / 42 | webrender_render 0, poll_wait 0, array_buffer_copy 0 |
| Compositor | 32 | 1.0 | Idle 31, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, webrender_render 1, canvas_2d 0 |
| Timer | 24 | 0.8 | Other 24, Profiler 0 | 0 / 0 / 24 | ipc 23, poll_wait 23, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 252; `[unknown]` 9; `IID2NativeInterfaceMap::Find(nsID const&) const [libxul.so]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 3; `mozilla::dom::Document::GetUnretargetedFocusedContent(mozilla::dom::Do` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2

**tab pid 9348** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInternal(mozil` 0; `mozilla::MainThreadIdlePeriod::GetIdlePeriodHint(mozilla::TimeStamp*) ` 0

**tab pid 8967** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 8986** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

