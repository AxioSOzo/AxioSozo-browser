### webkit raf-nosampler (profile pass)

**parent pid 7188** — 600 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 216 | 7.1 | JavaScript 207, Profiler 6, Other 3 | 0 / 0 / 216 | subprocess_pipe_io 216, worker_messaging 215, ipc 215, js_ctypes 192 |
| GeckoMain | 148 | 4.9 | Idle 97, JavaScript 26, Other 18, DOM 5 | 4 / 27 / 117 | ipc 147, poll_wait 102, gc_cc 34, engine_stream_read 24 |
| Renderer | 73 | 2.4 | Idle 58, Graphics 14, Other 0, Profiler 0 | 0 / 0 / 73 | ipc 73, poll_wait 63, webrender_render 14, webrender_sw_raster 9 |
| BackgroundThreadPool #3 | 39 | 1.3 | Idle 37, Other 2 | 0 / 0 / 39 | ipc 39, poll_wait 37, native_receiver 2, memcpy_memset 2 |
| SwComposite | 36 | 1.2 | Other 36 | 0 / 0 / 36 | webrender_render 36, poll_wait 35, webrender_sw_raster 2, memcpy_memset 2 |
| WRRenderBackend#0 | 35 | 1.2 | Other 35 | 0 / 0 / 35 | webrender_render 0, poll_wait 0 |
| Compositor | 32 | 1.1 | Idle 31, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 32, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 13 | 0.4 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 13 | ipc 13, poll_wait 13, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 103; `[unknown]` 6; `__lll_lock_wake [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:34` 1; `bool PropertyEnumerator::enumerateNativeProperties<false>(JSContext*) ` 1; `ProfilingStack::pushLabelFrame(char const*, char const*, void*, JS::Pr` 1; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*> const, mo` 1

**tab pid 7735** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | GC / CC 2, Idle 1, Other 0 | 0 / 0 / 3 | ipc 3, gc_cc 2, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `nsIGlobalObject::UnlinkObjectsInGlobal() [libxul.so]` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0

**tab pid 7738** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 7335** — 1 ms CPU in the window

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

