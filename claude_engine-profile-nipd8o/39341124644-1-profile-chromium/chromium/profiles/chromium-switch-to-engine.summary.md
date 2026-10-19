### chromium switch-to-engine (profile pass)

**parent pid 3294** — 232 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 101 | 18.3 | JavaScript 72, Idle 13, Profiler 7, Other 7 | 0 / 0 / 101 | subprocess_pipe_io 101, poll_wait 52, worker_messaging 13, memcpy_memset 6 |
| GeckoMain | 90 | 16.2 | JavaScript 26, Layout 24, Idle 22, DOM 7 | 3 / 36 / 51 | poll_wait 25, paint_layout 9, engine_stream_read 7, subprocess_pipe_io 7 |
| Renderer | 28 | 5.0 | Graphics 24, Idle 4 | 0 / 0 / 28 | webrender_render 24, poll_wait 4, memcpy_memset 2 |
| Compositor | 4 | 0.7 | Idle 3, Other 1 | 0 / 0 / 4 | poll_wait 3, memcpy_memset 1 |
| WRRenderBackend#0 | 3 | 0.6 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 3 | 0.6 | Other 3 | 0 / 0 / 3 |  |
| SwComposite | 2 | 0.4 | Other 2 | 0 / 0 / 2 |  |
| Socket Thread | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 49; `poll [libc.so.6]` 22; `[axiosozo-dev]` 5; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:161` 3; `mprotect [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 1; `[unknown]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1

**tab pid 3962** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.6 | Idle 2, Other 1 | 0 / 0 / 3 | poll_wait 2, paint_layout 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `[libxul.so]` 1; `[]` 0; `[linux-vdso.so.1]` 0

**tab pid 4072** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[]` 0

**tab pid 3479** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

