### webkit-control raf (profile pass)

**parent pid 9829** — 1195 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 399 | 13.0 | Idle 273, JavaScript 68, Other 25, DOM 16 | 8 / 69 / 323 | ipc 398, poll_wait 284, gc_cc 68, engine_stream_read 34 |
| Renderer | 227 | 7.4 | Graphics 116, Idle 110, Other 1 | 0 / 0 / 227 | ipc 227, poll_wait 120, webrender_render 117, webrender_sw_raster 102 |
| DOM Worker | 227 | 7.4 | JavaScript 219, Profiler 6, Other 2 | 0 / 0 / 227 | subprocess_pipe_io 227, worker_messaging 227, ipc 227, js_ctypes 212 |
| SwComposite | 172 | 5.6 | Other 172 | 0 / 0 / 172 | webrender_render 172, poll_wait 100, webrender_sw_raster 72, memcpy_memset 8 |
| WRRenderBackend#0 | 50 | 1.6 | Other 50 | 0 / 0 / 50 | memcpy_memset 1, webrender_render 0, array_buffer_copy 0 |
| BackgroundThreadPool #2 | 37 | 1.2 | Idle 33, Other 4, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 32, native_receiver 3, memcpy_memset 3 |
| Compositor | 33 | 1.1 | Idle 33, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 33, webrender_render 0, canvas_2d 0 |
| Timer | 26 | 0.9 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 280; `[unknown]` 12; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `__lll_lock_wait [libc.so.6]` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 2; `js::InterpreterActivation::pushInlineFrame(JS::CallArgs const&, JS::Ha` 2

**tab pid 9971** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::IdleSchedulerChild::RecvIdleTime(unsigned long, mozilla:` 0

**tab pid 10376** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(unsigned lon` 0

**tab pid 10012** — 1 ms CPU in the window

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

