### chromium-2x raf-nosampler (profile pass)

**parent pid 3314** — 626 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 173 | 5.7 | Idle 105, JavaScript 41, Other 14, DOM 9 | 4 / 46 / 124 | ipc 173, poll_wait 109, gc_cc 54, worker_messaging 31 |
| DOM Worker | 152 | 5.0 | JavaScript 150, Profiler 2, Other 0 | 0 / 0 / 152 | subprocess_pipe_io 152, worker_messaging 152, ipc 152, js_ctypes 146 |
| Renderer | 90 | 3.0 | Idle 61, Graphics 27, Other 1, Profiler 1 | 0 / 0 / 90 | ipc 90, poll_wait 62, webrender_render 28, webrender_sw_raster 20 |
| BackgroundThreadPool #3 | 59 | 2.0 | Idle 56, Other 3, Graphics 0 | 0 / 0 / 59 | ipc 59, poll_wait 56, native_receiver 4, memcpy_memset 3 |
| SwComposite | 58 | 1.9 | Other 58 | 0 / 0 / 58 | webrender_render 58, poll_wait 55, memcpy_memset 2, webrender_sw_raster 2 |
| WRRenderBackend#0 | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_render 0 |
| Compositor | 30 | 1.0 | Idle 29, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 30 | ipc 30, poll_wait 29, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 12 | 0.4 | Idle 12, Other 0 | 0 / 0 / 12 | ipc 12, poll_wait 12, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 103; `[unknown]` 9; `recvmsg [libc.so.6]` 3; `[axiosozo-dev]` 3; `write [libc.so.6]` 2; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 2; `[linux-vdso.so.1]` 2; `JSAtom* js::AtomizeChars<char16_t>(JSContext*, char16_t const*, unsign` 1

**tab pid 4200** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `nsTHashtable<nsBaseHashtableET<nsIntegralHashKey<long, 0>, RefPtr<mozi` 0

**tab pid 3480** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 4205** — 1 ms CPU in the window

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

