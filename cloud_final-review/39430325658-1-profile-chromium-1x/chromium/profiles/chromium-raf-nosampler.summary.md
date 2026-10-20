### chromium raf-nosampler (profile pass)

**parent pid 3144** — 589 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 199 | 6.5 | JavaScript 194, Other 2, Profiler 2, GC / CC 1 | 0 / 0 / 199 | subprocess_pipe_io 199, worker_messaging 199, ipc 199, js_ctypes 188 |
| GeckoMain | 167 | 5.5 | Idle 104, JavaScript 35, Other 11, DOM 10 | 10 / 34 / 122 | ipc 167, poll_wait 111, gc_cc 50, worker_messaging 29 |
| Renderer | 62 | 2.1 | Idle 50, Graphics 12, Other 0, Profiler 0 | 0 / 0 / 62 | ipc 62, poll_wait 53, webrender_render 12, webrender_sw_raster 8 |
| WRRenderBackend#0 | 38 | 1.3 | Other 38 | 0 / 0 / 38 | memcpy_memset 0, webrender_render 0, poll_wait 0 |
| BackgroundThreadPool #2 | 37 | 1.2 | Idle 36, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 36, native_receiver 1, memcpy_memset 1 |
| SwComposite | 33 | 1.1 | Other 33 | 0 / 0 / 33 | webrender_render 33, poll_wait 31, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 30 | 1.0 | Idle 30, Other 0, Graphics 0 | 0 / 0 / 30 | ipc 30, poll_wait 30, webrender_render 0, image_container 0 |
| ImageBridgeChld | 12 | 0.4 | Idle 12, Other 0 | 0 / 0 / 12 | ipc 12, poll_wait 12, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 105; `[unknown]` 5; `recvmsg [libc.so.6]` 3; `[axiosozo-dev]` 2; `[linux-vdso.so.1]` 2; `XPC_WN_CallMethod(JSContext*, unsigned int, JS::Value*) [libxul.so]` 2; `mprotect [libc.so.6]` 1; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1

**tab pid 3799** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | GC / CC 2, Idle 1 | 0 / 0 / 4 | ipc 3, gc_cc 2, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::GCCellPtr,` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `__strnlen_evex [libc.so.6]` 0

**tab pid 3301** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3990** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

