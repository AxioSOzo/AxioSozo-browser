### chromium raf-nosampler (profile pass)

**parent pid 3165** — 542 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 122 | 4.0 | JavaScript 119, Profiler 3, Other 1 | 0 / 0 / 122 | subprocess_pipe_io 122, worker_messaging 122, ipc 122, js_ctypes 112 |
| Renderer | 116 | 3.8 | Idle 82, Graphics 34, Other 0 | 0 / 0 / 116 | ipc 116, poll_wait 83, webrender_render 34, webrender_sw_raster 30 |
| GeckoMain | 112 | 3.7 | Idle 76, JavaScript 19, Other 9, DOM 5 | 3 / 20 / 88 | ipc 112, poll_wait 80, gc_cc 25, engine_stream_read 15 |
| SwComposite | 87 | 2.9 | Other 87 | 0 / 0 / 87 | webrender_render 87, poll_wait 72, webrender_sw_raster 14, memcpy_memset 1 |
| WRRenderBackend#0 | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 0, memcpy_memset 0 |
| BackgroundThreadPool #2 | 31 | 1.0 | Idle 28, Other 2, Graphics 0 | 0 / 0 / 31 | ipc 31, poll_wait 28, native_receiver 2, memcpy_memset 2 |
| Compositor | 22 | 0.7 | Idle 21, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 21, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | ipc 9, poll_wait 9, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 78; `[unknown]` 5; `write [libc.so.6]` 4; `js::gc::TenuringTracer::collectToObjectFixedPoint() [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*, JS::Hand` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeBarePtr<JSO` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::ProfilerStringV` 1

**tab pid 3953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3958** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3356** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0

