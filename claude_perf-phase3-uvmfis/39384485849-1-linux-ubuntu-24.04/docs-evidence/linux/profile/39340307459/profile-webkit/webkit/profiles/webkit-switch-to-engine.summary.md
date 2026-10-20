### webkit switch-to-engine (profile pass)

**parent pid 7167** — 173 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 86 | 12.2 | JavaScript 73, Other 6, Profiler 5, GC / CC 2 | 0 / 0 / 86 | subprocess_pipe_io 86, poll_wait 46, gc_cc 2, memcpy_memset 1 |
| GeckoMain | 65 | 9.1 | JavaScript 31, Idle 14, Layout 6, Other 6 | 9 / 29 / 27 | poll_wait 17, engine_stream_read 15, bgra_to_rgba 6, subprocess_pipe_io 4 |
| Renderer | 13 | 1.8 | Graphics 10, Idle 3 | 0 / 0 / 13 | webrender_render 10, poll_wait 3 |
| WRRenderBackend#0 | 3 | 0.4 | Other 3 | 0 / 0 / 3 |  |
| Compositor | 2 | 0.3 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| SwComposite | 2 | 0.2 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 |  |
| Socket Thread | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `[libxul.so]` 27; `[libc.so.6]` 20; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 6; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 4; `[unknown]` 3; `[libX11.so.6]` 1; `[Symbol.iterator] (self-hosted:1341:26)[1]` 1; `handleEvent (resource:///modules/zen/ZenWindowSync.sys.mjs:384:14)[26]` 1

**tab pid 7700** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.3 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 2; `[libxul.so]` 0

**tab pid 7251** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 0

**tab pid 7706** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 0

