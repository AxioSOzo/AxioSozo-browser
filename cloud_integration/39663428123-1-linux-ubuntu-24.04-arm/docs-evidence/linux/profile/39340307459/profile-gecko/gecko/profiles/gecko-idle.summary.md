### gecko idle (profile pass)

**parent pid 2809** — 235 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 152 | 7.1 | JavaScript 84, DOM 30, Other 14, Idle 13 | 14 / 98 / 40 | poll_wait 19, gc_cc 8, array_buffer_copy 4, memcpy_memset 1 |
| DOM Worker | 74 | 3.4 | JavaScript 56, GC / CC 11, DOM 4, Idle 3 | 15 / 50 / 9 | gc_cc 11, worker_messaging 7, poll_wait 3 |
| Socket Thread | 4 | 0.2 | Other 4, Profiler 0 | 0 / 0 / 4 | poll_wait 2 |
| Compositor | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | memcpy_memset 1, poll_wait 1 |
| BackgroundThreadPool #2 | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Renderer | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| DOM Worker | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | worker_messaging 1, poll_wait 1 |

Main thread, top self: `[libxul.so]` 80; `[unknown]` 17; `poll@@GLIBC_2.2.5 [libc.so.6]` 13; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 7; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 5; `[libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 3

**tab pid 3049** — 34 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 29 | 1.4 | Idle 20, GC / CC 6, JavaScript 2, Profiler 0 | 0 / 3 / 26 | poll_wait 21, gc_cc 6 |
| IPC I/O Child | 5 | 0.2 | Idle 5, Other 0 | 0 / 0 / 5 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 20; `[libxul.so]` 7; `[libc.so.6]` 1; `[]` 0; `getrusage@@GLIBC_2.2.5 [libc.so.6]` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0; `[unknown]` 0

**tab pid 2988** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 2901** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

