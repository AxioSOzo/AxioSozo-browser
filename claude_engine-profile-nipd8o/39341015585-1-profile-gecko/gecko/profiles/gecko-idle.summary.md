### gecko idle (profile pass)

**parent pid 2948** — 976 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 582 | 27.6 | JavaScript 246, Idle 100, GC / CC 99, DOM 88 | 62 / 353 / 167 | worker_messaging 333, poll_wait 111, gc_cc 99, memcpy_memset 8 |
| GeckoMain | 375 | 17.8 | JavaScript 140, DOM 116, Idle 52, Other 40 | 20 / 206 / 149 | poll_wait 73, array_buffer_copy 15, gc_cc 12, memcpy_memset 2 |
| Socket Thread | 10 | 0.5 | Other 10, Profiler 1 | 0 / 0 / 10 | poll_wait 8 |
| Compositor | 3 | 0.1 | Idle 3 | 0 / 0 / 3 | poll_wait 3 |
| BackgroundThreadPool #1 | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| DOM Worker | 1 | 0.0 | JavaScript 0, Idle 0 | 0 / 0 / 0 | worker_messaging 0, poll_wait 0 |

Main thread, top self: `[libxul.so]` 194; `poll@@GLIBC_2.2.5 [libc.so.6]` 53; `[unknown]` 30; `[libc.so.6]` 22; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 14; `[axiosozo-dev]` 14; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7

**tab pid 3201** — 47 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 39 | 1.8 | Idle 27, GC / CC 7, JavaScript 3, Other 1 | 0 / 3 / 36 | poll_wait 27, gc_cc 7 |
| IPC I/O Child | 7 | 0.3 | Idle 7, Other 0 | 0 / 0 / 7 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 27; `[libxul.so]` 10; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 0; `[unknown]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libc.so.6]` 0

**tab pid 3138** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 3037** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2

