### webkit-2x key (profile pass)

**parent pid 8720** — 1017 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 453 | 12.3 | Idle 222, JavaScript 84, Graphics 40, Other 35 | 12 / 131 / 310 | ipc 450, poll_wait 261, paint_layout 93, gc_cc 83 |
| DOM Worker | 221 | 6.0 | JavaScript 219, Profiler 2, Other 1 | 0 / 0 / 221 | subprocess_pipe_io 221, worker_messaging 221, ipc 221, js_ctypes 208 |
| Renderer | 144 | 3.9 | Graphics 103, Idle 41, Other 0, Profiler 0 | 0 / 0 / 144 | ipc 144, webrender_render 103, webrender_sw_raster 92, poll_wait 45 |
| SwComposite | 131 | 3.6 | Other 131 | 0 / 0 / 131 | webrender_render 131, webrender_sw_raster 89, poll_wait 42, memcpy_memset 32 |
| Timer | 29 | 0.8 | Other 29 | 0 / 0 / 29 | ipc 29, poll_wait 28, memcpy_memset 0 |
| Compositor | 15 | 0.4 | Idle 15, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, webrender_scene 0, paint_layout 0 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | array_buffer_copy 0 |
| WRSceneBuilder#0 | 7 | 0.2 | Other 7 | 0 / 0 / 7 | webrender_scene 7, memcpy_memset 0, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 235; `__memmove_evex_unaligned_erms [libc.so.6]` 23; `[unknown]` 15; `[axiosozo-dev]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `__memset_evex_unaligned_erms [libc.so.6]` 5; `nsFlexContainerFrame::QueryFrame(nsQueryFrame::FrameIID) const [libxul` 4; `mprotect [libc.so.6]` 3

**tab pid 8810** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, Other 1, JavaScript 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 0; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Ini` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozilla::dom::JS` 0; `g_mutex_lock [libglib-2.0.so.0]` 0

**tab pid 8882** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0

**tab pid 8905** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0

