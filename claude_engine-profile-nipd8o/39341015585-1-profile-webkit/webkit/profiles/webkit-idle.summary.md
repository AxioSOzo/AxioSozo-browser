### webkit idle (profile pass)

**parent pid 7167** — 273 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 144 | 6.9 | Idle 117, Other 10, JavaScript 10, Profiler 4 | 2 / 8 / 134 | poll_wait 123, paint_layout 2, engine_stream_read 1, memcpy_memset 1 |
| DOM Worker | 101 | 4.8 | JavaScript 101 | 0 / 0 / 101 | subprocess_pipe_io 101, poll_wait 101 |
| Timer | 23 | 1.1 | Other 23, Profiler 0 | 0 / 0 / 23 | poll_wait 23 |
| Compositor | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | poll_wait 1, memcpy_memset 1 |
| Renderer | 1 | 0.0 | Graphics 1, Idle 0 | 0 / 0 / 1 | webrender_render 1, poll_wait 0 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| SwComposite | 1 | 0.0 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `[libc.so.6]` 122; `[libxul.so]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[unknown]` 1; `[axiosozo-dev]` 1; `slice (self-hosted:4456:22)[17]` 1; `mozilla::detail::ConditionVariableImpl::notify_one() [axiosozo-dev]` 0; `onPacket (chrome://remote/content/marionette/server.sys.mjs:237:11)[19` 0

**tab pid 7711** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

**tab pid 7316** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

**tab pid 7366** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1; `[libxul.so]` 0; `[libglib-2.0.so.0]` 0

