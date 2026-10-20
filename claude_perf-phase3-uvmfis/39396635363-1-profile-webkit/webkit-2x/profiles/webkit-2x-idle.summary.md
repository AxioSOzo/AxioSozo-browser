### webkit-2x idle (profile pass)

**parent pid 8806** — 236 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 136 | 6.6 | Idle 111, JavaScript 13, Other 7, DOM 3 | 1 / 15 / 120 | ipc 136, poll_wait 114, harness_diagnostics 13, gc_cc 6 |
| DOM Worker | 70 | 3.4 | JavaScript 70, Profiler 0 | 0 / 0 / 70 | subprocess_pipe_io 70, worker_messaging 70, ipc 70, js_ctypes 70 |
| Timer | 16 | 0.8 | Other 16 | 0 / 0 / 16 | ipc 15, poll_wait 15 |
| DOM Worker | 8 | 0.5 | Other 7, GC / CC 1, Idle 0 | 0 / 0 / 8 | ipc 8, gc_cc 8, worker_messaging 0, poll_wait 0 |
| Renderer | 1 | 0.1 | Graphics 1, Idle 1 | 0 / 0 / 1 | ipc 1, memcpy_memset 1, webrender_render 1, webrender_sw_raster 1 |
| SwComposite | 1 | 0.0 | Other 1 | 0 / 0 / 1 | webrender_render 1, memcpy_memset 1, webrender_sw_raster 1, poll_wait 0 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Compositor | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 113; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 1; `[unknown]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, char16_t>:` 1; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 1; `JS_ValueToObject(JSContext*, JS::Handle<JS::Value>, JS::MutableHandle<` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, char16_t>:` 1

**tab pid 9499** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [libxul.so]` 0

**tab pid 9493** — 1 ms CPU in the window

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

**tab pid 8975** — 1 ms CPU in the window

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

