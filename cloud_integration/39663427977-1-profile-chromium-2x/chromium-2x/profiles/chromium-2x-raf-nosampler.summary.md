### chromium-2x raf-nosampler (profile pass)

**parent pid 3450** — 987 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 255 | 8.4 | JavaScript 248, Profiler 5, Other 2 | 0 / 0 / 255 | subprocess_pipe_io 255, worker_messaging 255, ipc 255, js_ctypes 242 |
| GeckoMain | 206 | 6.7 | Idle 119, JavaScript 55, Other 18, DOM 13 | 4 / 61 / 141 | ipc 206, poll_wait 128, gc_cc 63, worker_messaging 40 |
| Renderer | 157 | 5.2 | Idle 85, Graphics 72 | 0 / 0 / 157 | ipc 157, poll_wait 93, webrender_render 72, webrender_sw_raster 64 |
| BackgroundThreadPool #1 | 135 | 4.4 | Idle 100, Other 34, Graphics 1 | 0 / 0 / 135 | ipc 135, poll_wait 99, native_receiver 35, memcpy_memset 33 |
| SwComposite | 118 | 3.9 | Other 118 | 0 / 0 / 118 | webrender_render 118, poll_wait 99, webrender_sw_raster 20, memcpy_memset 18 |
| WRRenderBackend#0 | 51 | 1.7 | Other 51 | 0 / 0 / 51 | webrender_render 1, poll_wait 1, memcpy_memset 1 |
| Compositor | 37 | 1.2 | Idle 36, Other 1, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 36, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 15 | 0.5 | Idle 15, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, image_container 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 122; `[unknown]` 9; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `js::Nursery::reallocateBuffer(JS::Zone*, js::gc::Cell*, void*, unsigne` 2; `[linux-vdso.so.1]` 2; `write [libc.so.6]` 2; `recvmsg [libc.so.6]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 1

**tab pid 3647** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 4368** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3629** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

