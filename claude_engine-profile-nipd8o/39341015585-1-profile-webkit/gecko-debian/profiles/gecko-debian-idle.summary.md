### gecko-debian idle (profile pass)

**parent pid 8090** — 759 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 420 | 20.0 | JavaScript 143, DOM 92, Idle 92, GC / CC 56 | 39 / 231 / 149 | worker_messaging 190, poll_wait 99, gc_cc 57, memcpy_memset 8 |
| GeckoMain | 323 | 15.4 | JavaScript 142, DOM 86, Idle 41, Other 39 | 25 / 184 / 114 | poll_wait 57, array_buffer_copy 9, gc_cc 5, memcpy_memset 2 |
| Socket Thread | 10 | 0.5 | Other 10 | 0 / 0 / 10 | poll_wait 7 |
| Compositor | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 |  |
| BackgroundThreadPool #3 | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| DOM Worker | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | worker_messaging 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `[libxul.so]` 168; `[libc.so.6]` 70; `[unknown]` 26; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 12; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 11; `[axiosozo-dev]` 9; `syscall@@GLIBC_2.2.5 [libc.so.6]` 5; `#getSearchModesObject (chrome://browser/content/urlbar/UrlbarInputBase` 2

**tab pid 8336** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 41 | 2.0 | Idle 24, GC / CC 7, JavaScript 4, Other 2 | 0 / 6 / 35 | poll_wait 24, gc_cc 7, memcpy_memset 0 |
| IPC I/O Child | 8 | 0.4 | Idle 7, Other 0 | 0 / 0 / 8 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 25; `[libxul.so]` 13; `[]` 2; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 0; `tick (http://127.0.0.1:38527/engine.html?page=2:4:14)[5]` 0; `pthread_mutex_destroy@@GLIBC_2.2.5 [libc.so.6]` 0; `[linux-vdso.so.1]` 0

**tab pid 8176** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1; `[libxul.so]` 0; `[linux-vdso.so.1]` 0

**tab pid 8270** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 1, Other 0 | 0 / 0 / 2 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1; `[]` 0

