### webkit switch-to-gecko (profile pass)

**parent pid 7167** — 118 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 72 | 24.0 | JavaScript 32, Layout 14, Other 7, Graphics 6 | 4 / 42 / 26 | paint_layout 14, poll_wait 7, engine_stream_read 2 |
| Renderer | 19 | 6.2 | Graphics 16, Idle 2, Other 1 | 0 / 0 / 19 | webrender_render 16, poll_wait 2 |
| DOM Worker | 14 | 4.8 | JavaScript 14, Idle 0 | 0 / 0 / 14 | subprocess_pipe_io 14, poll_wait 13, worker_messaging 0 |
| Compositor | 4 | 1.2 | Idle 3, Other 1 | 0 / 0 / 4 | poll_wait 3 |
| IPC I/O Parent | 2 | 0.8 | Idle 2, Other 0 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 |  |
| WRRenderBackend#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 |  |
| SwComposite | 1 | 0.4 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `[libxul.so]` 45; `[libc.so.6]` 10; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[unknown]` 2; `sameFacts (chrome://browser/content/axiosozo/ConsoleErrorsNativeRuntim` 1; `forEach (self-hosted:145:22)[15]` 1; `[libnss3.so]` 1

**tab pid 7705** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 27 | 8.9 | JavaScript 10, Other 5, Idle 5, Layout 4 | 0 / 9 / 17 | poll_wait 5, paint_layout 1 |
| IPC I/O Child | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 17; `[libc.so.6]` 6; `[]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1

**tab pid 7257** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 1.8 | Idle 4, JavaScript 1, Other 0 | 0 / 0 / 5 | poll_wait 4 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 4; `[libxul.so]` 1; `[]` 0

**tab pid 7797** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 0

