### chromium-2x raf-nosampler (profile pass)

**parent pid 3371** — 1915 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 571 | 18.6 | Graphics 376, Idle 194, Profiler 1, Other 0 | 0 / 0 / 571 | ipc 570, webrender_render 377, webrender_sw_raster 349, poll_wait 197 |
| SwComposite | 509 | 16.6 | Other 509 | 0 / 0 / 509 | webrender_render 509, webrender_sw_raster 333, poll_wait 176, memcpy_memset 81 |
| DOM Worker | 297 | 9.7 | JavaScript 288, Profiler 6, Other 3 | 0 / 0 / 297 | subprocess_pipe_io 297, worker_messaging 297, ipc 297, js_ctypes 276 |
| GeckoMain | 211 | 6.9 | Idle 138, JavaScript 41, Other 19, DOM 11 | 5 / 45 / 160 | ipc 211, poll_wait 152, gc_cc 50, worker_messaging 29 |
| BackgroundThreadPool #1 | 196 | 6.4 | Idle 111, Other 81, Graphics 3, Profiler 1 | 0 / 0 / 196 | ipc 196, poll_wait 114, native_receiver 82, memcpy_memset 78 |
| WRRenderBackend#0 | 63 | 2.1 | Other 63 | 0 / 0 / 63 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 40 | 1.3 | Idle 39, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 40 | ipc 40, poll_wait 39, webrender_render 1, memcpy_memset 0 |
| ImageBridgeChld | 16 | 0.5 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 16, image_container 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 140; `[unknown]` 8; `recvmsg [libc.so.6]` 4; `read [libc.so.6]` 3; `js::SharedImmutableStringsCache::getOrCreate(std::unique_ptr<char [], ` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `mprotect [libc.so.6]` 2; `[axiosozo-dev]` 2

**tab pid 4035** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 3, GC / CC 1, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `fog_timing_distribution_accumulate_raw_nanos [libxul.so]` 1; `getrusage [libc.so.6]` 0; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*) [libxul.s` 0

**tab pid 3542** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3520** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

