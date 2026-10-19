### gecko-debian idle (profile pass)

**parent pid 8091** — 879 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 492 | 23.4 | JavaScript 187, Idle 99, DOM 91, GC / CC 73 | 59 / 281 / 153 | worker_messaging 263, poll_wait 114, gc_cc 73, memcpy_memset 20 |
| GeckoMain | 367 | 17.4 | JavaScript 162, DOM 99, Idle 47, Other 38 | 20 / 217 / 130 | poll_wait 62, memcpy_memset 15, array_buffer_copy 11, gc_cc 9 |
| Socket Thread | 10 | 0.5 | Other 10, Profiler 0 | 0 / 0 / 10 | poll_wait 7, memcpy_memset 0 |
| BackgroundThreadPool #2 | 5 | 0.2 | Idle 3, Other 2 | 0 / 0 / 5 | poll_wait 3 |
| Compositor | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | poll_wait 1, memcpy_memset 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 0 |
| DOM Worker | 1 | 0.0 | Idle 0, JavaScript 0 | 0 / 0 / 0 | worker_messaging 0, poll_wait 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `[libxul.so]` 204; `__syscall_cancel_arch [libc.so.6]` 54; `[unknown]` 29; `[axiosozo-dev]` 11; `mprotect [libc.so.6]` 10; `__memmove_avx_unaligned_erms [libc.so.6]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 6

**tab pid 8343** — 42 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 36 | 1.7 | Idle 23, GC / CC 6, JavaScript 3, Other 1 | 0 / 4 / 31 | poll_wait 23, gc_cc 6, memcpy_memset 0 |
| IPC I/O Child | 7 | 0.3 | Idle 6, Other 0 | 0 / 0 / 7 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 23; `[libxul.so]` 12; `[]` 0; `__lll_lock_wake [libc.so.6]` 0; `pthread_mutex_destroy@@GLIBC_2.2.5 [libc.so.6]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 8281** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

**tab pid 8177** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `__memcmp_avx2_movbe [libc.so.6]` 0

