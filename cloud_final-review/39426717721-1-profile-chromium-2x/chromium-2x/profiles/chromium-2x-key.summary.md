### chromium-2x key (profile pass)

**parent pid 3139** — 884 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 389 | 10.6 | Idle 155, JavaScript 79, Layout 42, Other 35 | 10 / 141 / 239 | ipc 388, poll_wait 196, gc_cc 104, paint_layout 84 |
| DOM Worker | 200 | 5.5 | JavaScript 194, Other 4, Profiler 2 | 0 / 0 / 200 | subprocess_pipe_io 200, worker_messaging 200, ipc 200, js_ctypes 189 |
| Renderer | 118 | 3.2 | Graphics 104, Idle 14 | 0 / 0 / 118 | ipc 116, webrender_render 104, webrender_sw_raster 98, poll_wait 14 |
| SwComposite | 77 | 2.1 | Other 77 | 0 / 0 / 77 | webrender_render 77, webrender_sw_raster 52, memcpy_memset 51, poll_wait 23 |
| Timer | 27 | 0.7 | Other 27, Profiler 0 | 0 / 0 / 27 | ipc 27, poll_wait 27, memcpy_memset 0 |
| WRRenderBackend#0 | 20 | 0.5 | Other 20 | 0 / 0 / 20 | webrender_render 1 |
| Compositor | 17 | 0.5 | Idle 16, Other 1 | 0 / 0 / 17 | ipc 17, poll_wait 16, memcpy_memset 1, canvas_2d 0 |
| WRSceneBuilder#0 | 10 | 0.3 | Other 10 | 0 / 0 / 10 | webrender_scene 10 |

Main thread, top self: `poll [libc.so.6]` 156; `[unknown]` 21; `[axiosozo-dev]` 11; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `write [libc.so.6]` 4; `mprotect [libc.so.6]` 4; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit::CacheIRW` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3

**tab pid 3233** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.2 | Idle 6, JavaScript 1, DOM 0, GC / CC 0 | 0 / 1 / 7 | ipc 8, poll_wait 6, array_buffer_copy 2, gc_cc 1 |
| IPC I/O Child | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `[]` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[1]` 0; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 0; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheIRStubKey::` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 0; `[unknown]` 0

**tab pid 3317** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul.so]` 0

**tab pid 3335** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAutoLock<mozi` 0

