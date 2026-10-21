### gecko-debian idle (profile pass)

**parent pid 8088** — 473 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 265 | 12.7 | JavaScript 118, DOM 76, Other 31, Idle 27 | 17 / 169 / 79 | poll_wait 38, array_buffer_copy 6, gc_cc 3, memcpy_memset 2 |
| DOM Worker | 192 | 9.2 | JavaScript 88, Idle 34, DOM 33, GC / CC 24 | 28 / 99 / 65 | worker_messaging 50, poll_wait 36, gc_cc 24, array_buffer_copy 1 |
| Socket Thread | 8 | 0.4 | Other 8 | 0 / 0 / 8 | poll_wait 6 |
| Compositor | 3 | 0.1 | Other 2, Idle 1 | 0 / 0 / 3 | memcpy_memset 2, poll_wait 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1, Profiler 0, Other 0 | 0 / 0 / 1 |  |
| BackgroundThreadPool #2 | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| DOM Worker | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | worker_messaging 1, poll_wait 1 |
| Renderer | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `[libxul.so]` 157; `[libc.so.6]` 49; `[unknown]` 16; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 11; `[axiosozo-dev]` 10; `next (self-hosted:392:27)[25]` 3; `[linux-vdso.so.1]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 8336** — 37 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 31 | 1.5 | Idle 20, GC / CC 6, JavaScript 4, Profiler 0 | 0 / 4 / 27 | poll_wait 22, gc_cc 6 |
| IPC I/O Child | 5 | 0.3 | Idle 5, Profiler 0, Other 0 | 0 / 0 / 5 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 22; `[libxul.so]` 7; `[]` 1; `[linux-vdso.so.1]` 0

**tab pid 8182** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1, Other 0, JavaScript 0 | 0 / 0 / 1 | poll_wait 1, memcpy_memset 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0

**tab pid 8280** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

