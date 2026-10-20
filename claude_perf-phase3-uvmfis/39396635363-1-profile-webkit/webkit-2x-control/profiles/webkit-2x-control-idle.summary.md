### webkit-2x-control idle (profile pass)

**parent pid 10786** — 232 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 132 | 6.4 | Idle 108, JavaScript 10, DOM 6, Other 5 | 2 / 13 / 117 | ipc 131, poll_wait 111, harness_diagnostics 13, array_buffer_copy 6 |
| DOM Worker | 76 | 3.7 | JavaScript 76 | 0 / 0 / 76 | subprocess_pipe_io 76, js_ctypes 76, worker_messaging 76, ipc 76 |
| Timer | 15 | 0.7 | Other 15 | 0 / 0 / 15 | ipc 15, poll_wait 15 |
| Renderer | 3 | 0.2 | Graphics 2, Idle 1 | 0 / 0 / 3 | ipc 3, webrender_render 2, webrender_sw_raster 2, memcpy_memset 1 |
| SwComposite | 3 | 0.2 | Other 3 | 0 / 0 / 3 | webrender_render 3, webrender_sw_raster 2, memcpy_memset 1, poll_wait 1 |
| Compositor | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | ipc 2, memcpy_memset 1, poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 109; `[unknown]` 1; `[axiosozo-dev]` 1; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNative::CallMo` 1; `PrintfAppend<char>::append(char const*, unsigned long) [libxul.so]` 1; `bool js::SCInput::readArray<unsigned char>(unsigned char*, unsigned lo` 1; `mprotect [libc.so.6]` 1; `JS::RunJSMicroTask(JSContext*, JS::Handle<JSObject*>) [libxul.so]` 1

**tab pid 11336** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 10971** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 10930** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

