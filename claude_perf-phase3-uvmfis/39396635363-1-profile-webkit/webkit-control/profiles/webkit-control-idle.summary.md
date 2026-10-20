### webkit-control idle (profile pass)

**parent pid 9829** — 235 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 136 | 6.6 | Idle 114, JavaScript 12, Other 5, DOM 3 | 1 / 14 / 122 | ipc 136, poll_wait 117, harness_diagnostics 13, gc_cc 5 |
| DOM Worker | 78 | 3.8 | JavaScript 78 | 0 / 0 / 78 | subprocess_pipe_io 78, js_ctypes 78, worker_messaging 78, ipc 78 |
| Timer | 15 | 0.7 | Other 15, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 15 |
| Compositor | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 1 |
| Renderer | 1 | 0.0 | Idle 1, Graphics 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, canvas_2d 0, webrender_render 0 |
| SwComposite | 1 | 0.0 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 3; `[axiosozo-dev]` 1; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js::SharedShape*> cons` 1; `js::frontend::EmitterScope::lookupInCache(js::frontend::BytecodeEmitte` 1; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*> const, mo` 1; `js::frontend::BytecodeEmitter::emitShortCircuit(js::frontend::ListNode` 1; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13ReserveAndP` 1

**tab pid 9993** — 1 ms CPU in the window

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

**tab pid 10012** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `IPC::ReadResult<std::remove_cv<unsigned long>::type, (std::is_default_` 0

**tab pid 9971** — 1 ms CPU in the window

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

