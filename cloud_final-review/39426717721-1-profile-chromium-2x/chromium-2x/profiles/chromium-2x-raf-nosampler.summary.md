### chromium-2x raf-nosampler (profile pass)

**parent pid 3139** — 981 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 247 | 8.2 | JavaScript 238, Profiler 5, Other 4 | 0 / 0 / 247 | subprocess_pipe_io 247, worker_messaging 247, ipc 247, js_ctypes 226 |
| Renderer | 183 | 6.0 | Graphics 93, Idle 90, Other 1, Profiler 0 | 0 / 0 / 183 | ipc 183, poll_wait 97, webrender_render 94, webrender_sw_raster 79 |
| GeckoMain | 177 | 5.8 | Idle 106, JavaScript 45, Other 17, DOM 9 | 5 / 45 / 127 | ipc 177, poll_wait 113, gc_cc 49, worker_messaging 29 |
| SwComposite | 151 | 5.0 | Other 151 | 0 / 0 / 151 | webrender_render 151, poll_wait 107, webrender_sw_raster 44, memcpy_memset 41 |
| BackgroundThreadPool #3 | 117 | 3.9 | Idle 88, Other 26, Graphics 2, Profiler 1 | 0 / 0 / 117 | ipc 117, poll_wait 88, native_receiver 28, memcpy_memset 26 |
| WRRenderBackend#0 | 46 | 1.5 | Other 46 | 0 / 0 / 46 | webrender_render 0, poll_wait 0 |
| Compositor | 35 | 1.1 | Idle 34, Other 1, Graphics 0 | 0 / 0 / 35 | ipc 35, poll_wait 34, webrender_render 0, memcpy_memset 0 |
| ImageBridgeChld | 14 | 0.5 | Idle 14, Other 0 | 0 / 0 / 14 | ipc 14, poll_wait 14, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 107; `[unknown]` 11; `recvmsg [libc.so.6]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[axiosozo-dev]` 2; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.so]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2

**tab pid 3831** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 0

**tab pid 3294** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 0, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0

**tab pid 4015** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[]` 0

