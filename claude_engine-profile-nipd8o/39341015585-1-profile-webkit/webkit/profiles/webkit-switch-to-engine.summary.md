### webkit switch-to-engine (profile pass)

**parent pid 7167** — 170 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 81 | 10.7 | JavaScript 68, Profiler 5, Other 5, GC / CC 2 | 0 / 0 / 81 | subprocess_pipe_io 81, poll_wait 45, gc_cc 2, worker_messaging 1 |
| GeckoMain | 64 | 8.4 | Idle 22, JavaScript 20, DOM 8, GC / CC 3 | 4 / 26 / 34 | poll_wait 24, engine_stream_read 11, bgra_to_rgba 6, subprocess_pipe_io 4 |
| Renderer | 12 | 1.5 | Graphics 9, Idle 2 | 0 / 0 / 12 | webrender_render 9, poll_wait 2 |
| IPC I/O Parent | 3 | 0.5 | Idle 3, Profiler 1, Other 0 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 3 | 0.4 | Other 3 | 0 / 0 / 3 |  |
| Compositor | 2 | 0.3 | Idle 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2 |
| WRRenderBackend#0 | 2 | 0.3 | Other 2 | 0 / 0 / 2 |  |
| SwComposite | 2 | 0.2 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `[libxul.so]` 26; `[libc.so.6]` 25; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 4; `[unknown]` 3; `[axiosozo-dev]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 7792** — 55 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 53 | 8.0 | Other 43, DOM 5, JavaScript 3, Profiler 1 | 0 / 6 / 47 | memcpy_memset 1, gc_cc 1, poll_wait 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 28; `[libc.so.6]` 7; `[]` 5; `[libexpat.so.1]` 3; `syscall@@GLIBC_2.2.5 [libc.so.6]` 2; `access@@GLIBC_2.2.5 [libc.so.6]` 2; `[libfontconfig.so.1]` 2; `PR_CallOnce [libnspr4.so]` 1

**tab pid 7797** — 51 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 50 | 7.4 | Other 40, JavaScript 4, DOM 4, Profiler 1 | 0 / 6 / 45 | poll_wait 1, gc_cc 1, memcpy_memset 0 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 18; `[libc.so.6]` 15; `[]` 6; `[libexpat.so.1]` 5; `__read_nocancel@@GLIBC_PRIVATE [libc.so.6]` 2; `[unknown]` 1; `fstatat@@GLIBC_2.33 [libc.so.6]` 1; `readlink@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 7705** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.2 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 2; `[libxul.so]` 0

