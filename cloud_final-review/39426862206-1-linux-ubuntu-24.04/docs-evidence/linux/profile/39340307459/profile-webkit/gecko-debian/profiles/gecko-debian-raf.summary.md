### gecko-debian raf (profile pass)

**parent pid 8088** — 1683 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 507 | 16.4 | JavaScript 205, Idle 98, GC / CC 97, DOM 66 | 61 / 306 / 141 | worker_messaging 384, poll_wait 106, gc_cc 97, memcpy_memset 2 |
| Renderer | 476 | 15.4 | Graphics 358, Idle 115, Profiler 3, Other 1 | 0 / 0 / 476 | webrender_render 360, poll_wait 118 |
| GeckoMain | 467 | 15.1 | Idle 101, DOM 95, JavaScript 95, Other 75 | 7 / 150 / 310 | poll_wait 137, gc_cc 75, array_buffer_copy 9, memcpy_memset 6 |
| WRRenderBackend#0 | 76 | 2.5 | Other 76 | 0 / 0 / 76 | poll_wait 0 |
| WRSceneBuilder#0 | 51 | 1.6 | Other 51 | 0 / 0 / 51 | poll_wait 1 |
| Compositor | 45 | 1.4 | Idle 44, Other 1, Profiler 0 | 0 / 0 / 45 | poll_wait 44, paint_layout 1 |
| SwComposite | 20 | 0.7 | Other 20 | 0 / 0 / 20 |  |
| Socket Thread | 15 | 0.5 | Other 15 | 0 / 0 / 15 | poll_wait 15 |

Main thread, top self: `[libxul.so]` 255; `[libc.so.6]` 157; `[axiosozo-dev]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `[unknown]` 9; `syscall@@GLIBC_2.2.5 [libc.so.6]` 6; `[libglib-2.0.so.0]` 3; `PR_Now [libnspr4.so]` 2

**tab pid 8336** — 201 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 182 | 5.9 | Idle 110, Graphics 23, Layout 18, Other 10 | 0 / 10 / 171 | poll_wait 113, paint_layout 35, gc_cc 6, mozafterpaint_events 0 |
| IPC I/O Child | 17 | 0.5 | Idle 17, Other 0, Profiler 0 | 0 / 0 / 17 |  |
| Timer | 3 | 0.1 | Other 3 | 0 / 0 / 3 | poll_wait 3 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 120; `[libxul.so]` 54; `[]` 5; `g_source_ref [libglib-2.0.so.0]` 1; `[linux-vdso.so.1]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 0; `__tls_get_addr@@GLIBC_2.3 [ld-linux-x86-64.so.2]` 0; `g_ptr_array_set_size [libglib-2.0.so.0]` 0

**tab pid 8280** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 4; `[libxul.so]` 0

**utility pid 8326** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |

Main thread, top self: `[libc.so.6]` 2

