### webkit-control raf-nosampler (profile pass)

**parent pid 9829** — 917 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 226 | 7.5 | JavaScript 219, Profiler 3, Other 3 | 0 / 0 / 226 | subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 209 |
| Renderer | 210 | 7.0 | Graphics 105, Idle 105, Profiler 0, Other 0 | 0 / 0 / 210 | ipc 210, poll_wait 108, webrender_render 105, webrender_sw_raster 93 |
| SwComposite | 173 | 5.7 | Other 173 | 0 / 0 / 173 | webrender_render 173, poll_wait 94, webrender_sw_raster 78, memcpy_memset 6 |
| GeckoMain | 160 | 5.3 | Idle 104, JavaScript 30, Other 19, DOM 5 | 3 / 31 / 126 | ipc 160, poll_wait 113, gc_cc 33, engine_stream_read 27 |
| WRRenderBackend#0 | 48 | 1.6 | Other 48 | 0 / 0 / 48 | webrender_render 0, memcpy_memset 0 |
| BackgroundThreadPool #2 | 44 | 1.4 | Idle 41, Other 2 | 0 / 0 / 44 | ipc 44, poll_wait 41, native_receiver 2, memcpy_memset 2 |
| Compositor | 34 | 1.1 | Idle 32, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 34 | ipc 33, poll_wait 32, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 14 | 0.5 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 14 | ipc 14, poll_wait 14, image_container 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 115; `[unknown]` 4; `bool mozilla::dom::binding_detail::GenericMethod<mozilla::dom::binding` 1; `js::WeakMap<JS::Value, JS::Value, js::BufferAllocPolicy>::writeBarrier` 1; `TimerThread::AddTimerInternal(nsTimerImpl&) [libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1; `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:34` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<mozilla::bas` 1

**tab pid 10372** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<geckoprofile` 0; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(unsigned int)` 0

**tab pid 9993** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_mutex_lock [libglib-2.0.so.0]` 0

**tab pid 10376** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

