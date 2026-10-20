### chromium-2x-control key (profile pass)

**parent pid 4356** — 574 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 252 | 7.0 | Idle 123, JavaScript 57, Layout 20, Graphics 15 | 5 / 81 / 166 | ipc 251, poll_wait 137, gc_cc 68, worker_messaging 54 |
| DOM Worker | 151 | 4.2 | JavaScript 149, Profiler 2, Other 1 | 0 / 0 / 151 | subprocess_pipe_io 151, worker_messaging 151, ipc 151, js_ctypes 143 |
| Renderer | 62 | 1.7 | Graphics 44, Idle 18 | 0 / 0 / 62 | ipc 62, webrender_render 44, webrender_sw_raster 41, poll_wait 18 |
| SwComposite | 54 | 1.5 | Other 54 | 0 / 0 / 54 | webrender_render 54, webrender_sw_raster 31, poll_wait 22, memcpy_memset 5 |
| Timer | 23 | 0.6 | Other 23, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23 |
| Compositor | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | ipc 9, poll_wait 9, memcpy_memset 0, paint_layout 0 |
| WRRenderBackend#0 | 7 | 0.2 | Other 7 | 0 / 0 / 7 |  |
| BackgroundThreadPool #2 | 6 | 0.2 | Idle 4, Other 3 | 0 / 0 / 6 | ipc 6, poll_wait 4, native_receiver 3, memcpy_memset 3 |

Main thread, top self: `poll [libc.so.6]` 123; `[unknown]` 16; `__lll_lock_wait [libc.so.6]` 3; `write [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 4456** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4, JavaScript 0 | 0 / 0 / 4 | ipc 4, poll_wait 4, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 0; `get cloneScope (resource://gre/modules/ExtensionPageChild.sys.mjs:173:` 0

**tab pid 4528** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `XRE_GetAsyncIOEventTarget() [libxul.so]` 0

**tab pid 4507** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

