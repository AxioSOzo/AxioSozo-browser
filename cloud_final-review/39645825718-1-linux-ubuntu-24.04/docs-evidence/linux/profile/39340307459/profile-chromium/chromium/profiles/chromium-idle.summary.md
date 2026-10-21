### chromium idle (profile pass)

**parent pid 3296** — 204 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 100 | 4.7 | JavaScript 100 | 0 / 0 / 100 | subprocess_pipe_io 100, poll_wait 99 |
| GeckoMain | 83 | 3.9 | Idle 69, Other 7, JavaScript 6, DOM 1 | 1 / 5 / 77 | poll_wait 72, engine_stream_read 1 |
| Timer | 21 | 1.0 | Other 21, Profiler 0 | 0 / 0 / 21 | poll_wait 21 |
| IPC I/O Parent | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 0 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Compositor | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Renderer | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| WRWorker#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 |  |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 69; `[libxul.so]` 7; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 1; `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 4105** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3988** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3443** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0

