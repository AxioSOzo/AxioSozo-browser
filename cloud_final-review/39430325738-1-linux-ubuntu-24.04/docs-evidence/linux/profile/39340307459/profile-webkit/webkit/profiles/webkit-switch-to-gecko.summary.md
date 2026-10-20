### webkit switch-to-gecko (profile pass)

**parent pid 7167** — 152 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 99 | 32.1 | JavaScript 43, GC / CC 16, Layout 12, Other 8 | 9 / 42 / 48 | paint_layout 18, gc_cc 16, poll_wait 10, engine_stream_read 4 |
| Renderer | 23 | 7.4 | Graphics 20, Idle 2 | 0 / 0 / 23 | webrender_render 20, poll_wait 4 |
| DOM Worker | 16 | 5.2 | JavaScript 15, Other 1 | 0 / 0 / 16 | subprocess_pipe_io 16, poll_wait 14 |
| Compositor | 4 | 1.2 | Other 2, Idle 2 | 0 / 0 / 4 | poll_wait 2, memcpy_memset 1, webrender_render 0, paint_layout 0 |
| WRRenderBackend#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 |  |
| IPC I/O Parent | 2 | 0.7 | Idle 2 | 0 / 0 / 2 |  |
| SwComposite | 2 | 0.5 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `[libxul.so]` 57; `[libc.so.6]` 14; `[axiosozo-dev]` 8; `[unknown]` 4; `trackRunListenerPromise (resource://gre/modules/ExtensionParent.sys.mj` 3; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 3; `madvise@@GLIBC_2.2.5 [libc.so.6]` 2; `next (self-hosted:392:27)[1]` 2

**tab pid 7700** — 29 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 27 | 8.8 | JavaScript 10, Other 8, Idle 4, Layout 2 | 0 / 11 / 16 | poll_wait 4, paint_layout 1 |
| IPC I/O Child | 2 | 0.5 | Idle 1, Other 0 | 0 / 0 / 2 | poll_wait 0 |
| Socket Thread | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 20; `[libc.so.6]` 5; `[]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 7251** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 1.7 | Idle 3, JavaScript 1, DOM 1, Other 0 | 0 / 2 / 3 | poll_wait 3 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 3; `[libxul.so]` 2; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 7789** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 0

