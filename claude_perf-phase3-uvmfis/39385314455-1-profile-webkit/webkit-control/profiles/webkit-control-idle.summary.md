### webkit-control idle (profile pass)

**parent pid 9563** — 779 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 370 | 18.0 | Idle 125, JavaScript 114, DOM 81, Other 32 | 14 / 163 / 194 | ipc 367, gc_cc 167, poll_wait 138, array_buffer_copy 63 |
| DOM Worker | 275 | 13.4 | JavaScript 125, GC / CC 53, DOM 41, Idle 38 | 35 / 165 / 75 | worker_messaging 273, ipc 273, gc_cc 83, poll_wait 41 |
| DOM Worker | 101 | 4.9 | JavaScript 101 | 0 / 0 / 101 | subprocess_pipe_io 101, js_ctypes 101, worker_messaging 101, ipc 101 |
| Timer | 16 | 0.8 | Other 16, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 16 |
| Socket Thread | 8 | 0.4 | Other 8 | 0 / 0 / 8 | ipc 8, poll_wait 6, memcpy_memset 0 |
| Compositor | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 1 |
| BackgroundThreadPool #2 | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| BgIOThreadPool #2 | 1 | 0.1 | Idle 1, Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 18; `__memmove_evex_unaligned_erms [libc.so.6]` 14; `[axiosozo-dev]` 10; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 6; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 6; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5

**tab pid 9653** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9749** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**utility pid 9810** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

