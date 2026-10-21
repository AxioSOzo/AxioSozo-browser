### chromium key (profile pass)

**parent pid 3349** — 602 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 300 | 8.2 | Idle 133, JavaScript 58, Layout 29, Graphics 28 | 11 / 95 / 194 | ipc 300, poll_wait 165, gc_cc 64, paint_layout 62 |
| DOM Worker | 168 | 4.6 | JavaScript 164, Other 3, Profiler 1 | 0 / 0 / 168 | subprocess_pipe_io 168, worker_messaging 168, ipc 168, js_ctypes 162 |
| Renderer | 46 | 1.2 | Graphics 23, Idle 22 | 0 / 0 / 46 | ipc 46, webrender_render 23, poll_wait 22, webrender_sw_raster 21 |
| Timer | 26 | 0.7 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 25 |
| SwComposite | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 12, webrender_sw_raster 3, memcpy_memset 2 |
| WRRenderBackend#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | webrender_render 0, memcpy_memset 0 |
| Compositor | 12 | 0.3 | Idle 12, Other 0 | 0 / 0 / 12 | ipc 12, poll_wait 12, paint_layout 0 |
| WRSceneBuilder#0 | 7 | 0.2 | Other 7, Graphics 0 | 0 / 0 / 7 | webrender_scene 7, webrender_sw_raster 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 134; `[unknown]` 12; `[axiosozo-dev]` 8; `recvmsg [libc.so.6]` 5; `write [libc.so.6]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `mprotect [libc.so.6]` 2

**tab pid 3455** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 1 | 0 / 0 / 6 | ipc 6, poll_wait 5, gc_cc 0, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `JS::MaybeGetHostDefinedDataFromJSMicroTask(JSObject*, JS::MutableHandl` 0; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 0; `JSString::tryReplaceWithAtomRef(JSAtom*) [libxul.so]` 0; `JSRuntime::getHostDefinedData(JSContext*, JS::MutableHandle<JSObject*>` 0

**tab pid 3529** — 1 ms CPU in the window

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

**tab pid 3508** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

