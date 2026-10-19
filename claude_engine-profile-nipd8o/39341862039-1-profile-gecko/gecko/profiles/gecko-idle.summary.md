### gecko idle (profile pass)

**parent pid 3095** — 814 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 461 | 21.9 | JavaScript 196, Idle 83, GC / CC 78, DOM 69 | 52 / 276 / 133 | worker_messaging 257, poll_wait 90, gc_cc 78, memcpy_memset 19 |
| GeckoMain | 337 | 16.0 | JavaScript 128, DOM 94, Other 49, Idle 42 | 21 / 175 / 142 | poll_wait 66, memcpy_memset 21, gc_cc 13, array_buffer_copy 12 |
| Socket Thread | 11 | 0.5 | Other 11 | 0 / 0 / 11 | poll_wait 7, memcpy_memset 0 |
| BackgroundThreadPool #2 | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| DOM Worker | 1 | 0.0 | Profiler 1, Idle 0 | 0 / 0 / 1 | worker_messaging 0, poll_wait 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Renderer | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 167; `poll [libc.so.6]` 47; `[unknown]` 25; `__memmove_avx_unaligned_erms [libc.so.6]` 17; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 13; `[axiosozo-dev]` 11; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4

**tab pid 3344** — 38 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 31 | 1.5 | Idle 20, GC / CC 6, JavaScript 2, Other 1 | 0 / 3 / 28 | poll_wait 20, gc_cc 6, memcpy_memset 0 |
| IPC I/O Child | 6 | 0.3 | Idle 6, Other 0 | 0 / 0 / 6 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 20; `[libxul.so]` 10; `sendmsg [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0; `getcontext [libc.so.6]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0

**tab pid 3286** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3183** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[libxul.so]` 0; `__strlen_avx2 [libc.so.6]` 0; `write [libc.so.6]` 0

