### webkit idle (profile pass)

**parent pid 7188** — 279 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 173 | 8.4 | Idle 113, JavaScript 26, DOM 21, Other 9 | 0 / 38 / 134 | ipc 173, poll_wait 118, gc_cc 24, array_buffer_copy 16 |
| DOM Worker | 81 | 3.9 | JavaScript 81, Profiler 0 | 0 / 0 / 81 | subprocess_pipe_io 81, js_ctypes 81, worker_messaging 81, ipc 81 |
| Timer | 16 | 0.8 | Other 16, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 16 |
| DOM Worker | 3 | 0.1 | JavaScript 3, Idle 0 | 0 / 0 / 3 | worker_messaging 3, ipc 3, array_buffer_copy 3, gc_cc 3 |
| Compositor | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, memcpy_memset 0 |
| Socket Thread | 1 | 0.1 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| DOM Worker | 1 | 0.0 | JavaScript 1, Idle 0 | 0 / 1 / 0 | worker_messaging 1, ipc 1, gc_cc 0, poll_wait 0 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 116; `__lll_lock_wait [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `js::AbstractGeneratorObject::resume(JSContext*, js::InterpreterActivat` 2; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::AdvanceAcrossSeg` 2; `[unknown]` 2

**tab pid 7380** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0

**tab pid 7285** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7599** — 1 ms CPU in the window

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

