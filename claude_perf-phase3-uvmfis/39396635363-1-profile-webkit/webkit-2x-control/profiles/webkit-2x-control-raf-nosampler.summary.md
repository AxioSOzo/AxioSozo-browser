### webkit-2x-control raf-nosampler (profile pass)

**parent pid 10786** — 1763 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 584 | 19.3 | Graphics 388, Idle 196, Other 0 | 0 / 0 / 584 | ipc 584, webrender_render 388, webrender_sw_raster 349, poll_wait 222 |
| SwComposite | 511 | 16.9 | Other 511 | 0 / 0 / 511 | webrender_render 511, webrender_sw_raster 303, poll_wait 206, memcpy_memset 63 |
| DOM Worker | 219 | 7.2 | JavaScript 213, Other 4, Profiler 3 | 0 / 0 / 219 | subprocess_pipe_io 219, worker_messaging 219, ipc 219, js_ctypes 202 |
| GeckoMain | 191 | 6.3 | Idle 120, JavaScript 37, Other 21, DOM 8 | 4 / 36 / 150 | ipc 189, poll_wait 131, gc_cc 48, engine_stream_read 32 |
| BackgroundThreadPool #1 | 142 | 4.7 | Idle 97, Other 42, Graphics 2, Profiler 1 | 0 / 0 / 142 | ipc 142, poll_wait 97, native_receiver 44, memcpy_memset 37 |
| WRRenderBackend#0 | 60 | 2.0 | Other 60 | 0 / 0 / 60 | webrender_render 1, memcpy_memset 0, array_buffer_copy 0 |
| Compositor | 33 | 1.1 | Idle 32, Other 1, Graphics 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 14 | 0.4 | Idle 13, Other 0 | 0 / 0 / 14 | ipc 14, poll_wait 13, image_container 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 132; `[unknown]` 7; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `mozilla::dom::MessageEvent::cycleCollection::Unlink(void*) [libxul.so]` 2; `[linux-vdso.so.1]` 2; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigned long*) [libxul.so]` 1; `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:34` 1; `js::IndirectBindingMap::lookup(JS::PropertyKey, js::ModuleEnvironmentO` 1

**tab pid 11430** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 11436** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 10971** — 1 ms CPU in the window

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

