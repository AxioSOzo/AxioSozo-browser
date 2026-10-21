### webkit raf-nosampler (profile pass)

**parent pid 7154** — 382 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 113 | 3.8 | JavaScript 112, Profiler 2 | 0 / 0 / 113 | subprocess_pipe_io 113, worker_messaging 113, ipc 113, js_ctypes 108 |
| GeckoMain | 112 | 3.7 | Idle 75, JavaScript 20, Other 9, DOM 5 | 5 / 20 / 88 | ipc 112, poll_wait 79, gc_cc 25, engine_stream_read 21 |
| Renderer | 46 | 1.5 | Idle 42, Graphics 4 | 0 / 0 / 46 | ipc 46, poll_wait 43, webrender_render 4, webrender_sw_raster 3 |
| WRRenderBackend#0 | 31 | 1.0 | Other 31 | 0 / 0 / 31 | webrender_render 0, webrender_scene 0, poll_wait 0 |
| Compositor | 22 | 0.7 | Idle 22, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 22, webrender_render 0, canvas_2d 0 |
| BackgroundThreadPool #3 | 22 | 0.7 | Idle 21, Other 1 | 0 / 0 / 22 | ipc 22, poll_wait 21, native_receiver 1, memcpy_memset 1 |
| SwComposite | 19 | 0.6 | Other 19 | 0 / 0 / 19 | webrender_render 19, poll_wait 18, memcpy_memset 1, webrender_sw_raster 1 |
| ImageBridgeChld | 9 | 0.3 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | ipc 9, poll_wait 9, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 81; `[unknown]` 3; `write (resource://gre/modules/subprocess/subprocess_common.sys.mjs:251` 1; `xpt::detail::InterfaceByName(char const*) [libxul.so]` 1; `[linux-vdso.so.1]` 1; `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:45` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 1; `nsXPCComponents_Utils::GetClassName(JS::Handle<JS::Value>, bool, JSCon` 1

**tab pid 7709** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1, Profiler 0 | 0 / 0 / 3 | ipc 2, poll_wait 2, gc_cc 1, memcpy_memset 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `mmap64 [libc.so.6]` 1; `(anonymous namespace)::CipherSuiteChangeObserver::QueryInterface(nsID ` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 7341** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 7322** — 1 ms CPU in the window

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

