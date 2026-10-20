### chromium-2x raf-nosampler (profile pass)

**parent pid 3348** — 973 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 263 | 8.6 | JavaScript 255, Other 5, Profiler 3 | 0 / 0 / 263 | subprocess_pipe_io 263, worker_messaging 263, ipc 263, js_ctypes 243 |
| GeckoMain | 225 | 7.4 | Idle 128, JavaScript 57, Other 21, DOM 16 | 8 / 60 / 157 | ipc 225, poll_wait 140, gc_cc 72, worker_messaging 36 |
| Renderer | 149 | 4.9 | Idle 95, Graphics 54, Other 0, Profiler 0 | 0 / 0 / 149 | ipc 149, poll_wait 101, webrender_render 54, webrender_sw_raster 47 |
| SwComposite | 106 | 3.5 | Other 106 | 0 / 0 / 106 | webrender_render 106, poll_wait 90, webrender_sw_raster 16, memcpy_memset 13 |
| BackgroundThreadPool #2 | 104 | 3.4 | Idle 86, Other 18, Profiler 0 | 0 / 0 / 104 | ipc 104, poll_wait 86, native_receiver 18, memcpy_memset 16 |
| WRRenderBackend#0 | 53 | 1.7 | Other 53 | 0 / 0 / 53 | webrender_render 0, memcpy_memset 0 |
| Compositor | 42 | 1.4 | Idle 41, Other 1, Graphics 0 | 0 / 0 / 42 | ipc 42, poll_wait 41, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 18 | 0.6 | Idle 17, Other 0 | 0 / 0 / 18 | ipc 18, poll_wait 17, image_container 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 130; `[unknown]` 12; `recvmsg [libc.so.6]` 5; `write [libc.so.6]` 4; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 2; `js::jit::BytecodeAnalysis::init() [libxul.so]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1

**tab pid 4035** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3529** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3508** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0

