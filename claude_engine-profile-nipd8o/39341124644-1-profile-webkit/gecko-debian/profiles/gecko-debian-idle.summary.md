### gecko-debian idle (profile pass)

**parent pid 8094** — 659 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 325 | 15.6 | JavaScript 125, DOM 96, Idle 44, Other 41 | 21 / 180 / 124 | poll_wait 60, memcpy_memset 16, array_buffer_copy 13, gc_cc 6 |
| DOM Worker | 315 | 15.1 | JavaScript 156, Idle 60, DOM 39, GC / CC 36 | 48 / 171 / 96 | worker_messaging 158, poll_wait 64, gc_cc 36, memcpy_memset 14 |
| Socket Thread | 11 | 0.5 | Other 11 | 0 / 0 / 11 | poll_wait 8 |
| Compositor | 3 | 0.1 | Other 2, Idle 0 | 0 / 0 / 3 | memcpy_memset 1, poll_wait 0 |
| BackgroundThreadPool #2 | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| DOM Worker | 1 | 0.0 | JavaScript 1, Idle 0 | 0 / 1 / 0 | worker_messaging 0, poll_wait 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `[libxul.so]` 166; `__syscall_cancel_arch [libc.so.6]` 59; `[unknown]` 20; `__memmove_avx_unaligned_erms [libc.so.6]` 15; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 9; `mprotect [libc.so.6]` 8; `[axiosozo-dev]` 7; `syscall [libc.so.6]` 5

**tab pid 8342** — 36 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 31 | 1.5 | Idle 18, GC / CC 7, JavaScript 2, Profiler 1 | 0 / 5 / 25 | poll_wait 18, gc_cc 7, memcpy_memset 0 |
| IPC I/O Child | 5 | 0.3 | Idle 5 | 0 / 0 / 5 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 19; `[libxul.so]` 11; `getcontext [libc.so.6]` 1; `[]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 8286** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

**tab pid 8180** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0

