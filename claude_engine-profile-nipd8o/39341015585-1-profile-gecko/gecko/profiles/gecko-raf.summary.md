### gecko raf (profile pass)

**parent pid 2948** — 1392 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 499 | 16.0 | Graphics 386, Idle 111, Other 2, Profiler 1 | 0 / 0 / 499 | webrender_render 387, poll_wait 114, memcpy_memset 1 |
| GeckoMain | 371 | 11.9 | Idle 91, JavaScript 68, GC / CC 66, DOM 60 | 8 / 103 / 260 | poll_wait 124, gc_cc 66, memcpy_memset 2, paint_layout 2 |
| DOM Worker | 273 | 8.7 | JavaScript 140, Idle 50, GC / CC 33, DOM 30 | 37 / 150 / 85 | worker_messaging 205, poll_wait 52, gc_cc 33, array_buffer_copy 2 |
| WRRenderBackend#0 | 82 | 2.6 | Other 82 | 0 / 0 / 82 | poll_wait 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 56 | 1.8 | Other 56 | 0 / 0 / 56 | poll_wait 0, memcpy_memset 0 |
| Compositor | 50 | 1.6 | Idle 49, Other 1, Profiler 0 | 0 / 0 / 50 | poll_wait 48, paint_layout 0 |
| SwComposite | 23 | 0.7 | Other 23 | 0 / 0 / 23 |  |
| Socket Thread | 14 | 0.4 | Other 14 | 0 / 0 / 14 | poll_wait 13 |

Main thread, top self: `[libxul.so]` 183; `poll@@GLIBC_2.2.5 [libc.so.6]` 97; `[libc.so.6]` 15; `[unknown]` 13; `[axiosozo-dev]` 8; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 7; `write@@GLIBC_2.2.5 [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5

**tab pid 3201** — 221 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 200 | 6.4 | Idle 109, Graphics 33, Layout 25, Profiler 12 | 0 / 11 / 189 | poll_wait 111, paint_layout 43, gc_cc 10, mozafterpaint_events 0 |
| IPC I/O Child | 19 | 0.6 | Idle 18, Other 0, Profiler 0 | 0 / 0 / 19 |  |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 108; `[libxul.so]` 68; `[libc.so.6]` 8; `[]` 3; `[linux-vdso.so.1]` 3; `write@@GLIBC_2.2.5 [libc.so.6]` 2; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3138** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[]` 0; `[libc.so.6]` 0

**utility pid 3190** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |
| GeckoMain | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2

