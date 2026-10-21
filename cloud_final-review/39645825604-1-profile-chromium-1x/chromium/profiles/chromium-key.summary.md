### chromium key (profile pass)

**parent pid 3299** — 471 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 258 | 7.1 | Idle 96, JavaScript 58, Layout 30, Other 23 | 9 / 98 / 151 | ipc 258, poll_wait 122, gc_cc 74, paint_layout 62 |
| DOM Worker | 101 | 2.8 | JavaScript 99, Profiler 2, Other 0 | 0 / 0 / 101 | subprocess_pipe_io 101, worker_messaging 101, ipc 101, js_ctypes 97 |
| Renderer | 34 | 0.9 | Idle 20, Graphics 13 | 0 / 0 / 34 | ipc 34, poll_wait 20, webrender_render 13, webrender_sw_raster 13 |
| Timer | 20 | 0.5 | Other 20 | 0 / 0 / 20 | ipc 20, poll_wait 20, memcpy_memset 0 |
| WRRenderBackend#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | memcpy_memset 0 |
| Compositor | 11 | 0.3 | Idle 11, Other 0 | 0 / 0 / 11 | ipc 11, poll_wait 11, paint_layout 0 |
| SwComposite | 10 | 0.3 | Other 10 | 0 / 0 / 10 | webrender_render 10, poll_wait 9, memcpy_memset 1, webrender_sw_raster 1 |
| WRSceneBuilder#0 | 7 | 0.2 | Other 7, Graphics 0 | 0 / 0 / 7 | webrender_scene 7, webrender_sw_raster 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 96; `[axiosozo-dev]` 9; `[unknown]` 7; `write [libc.so.6]` 4; `mprotect [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `recvmsg [libc.so.6]` 2; `nsIFrame::GetUsedMargin() const [libxul.so]` 2

**tab pid 3414** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 4, JavaScript 1, DOM 0, Other 0 | 0 / 1 / 5 | ipc 6, poll_wait 4, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `mozilla::dom::JSIPCValueUtils::FromJSVal(mozilla::dom::JSIPCValueUtils` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Ini` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*, js::Maybe` 0; `_registerShims/< (moz-extension://9a310967-e580-48bf-b3e8-4eafebbc122d` 0; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAllocPolicy<(` 0; `js::jit::ObjectIsCallable(JSObject*) [libxul.so]` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 0

**tab pid 4158** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[]` 0

**tab pid 4163** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

