### chromium-2x scroll (profile pass)

**parent pid 3385** — 1304 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 512 | 23.9 | Idle 282, JavaScript 87, Other 70, Graphics 27 | 7 / 92 / 413 | ipc 512, poll_wait 379, gc_cc 88, paint_layout 65 |
| DOM Worker | 301 | 14.0 | JavaScript 281, Profiler 14, Other 5, GC / CC 1 | 0 / 0 / 301 | subprocess_pipe_io 301, worker_messaging 301, ipc 301, js_ctypes 262 |
| BackgroundThreadPool #3 | 191 | 8.9 | Idle 122, Other 63, Graphics 4, Profiler 1 | 0 / 0 / 191 | ipc 191, poll_wait 124, native_receiver 66, memcpy_memset 60 |
| Renderer | 115 | 5.4 | Idle 69, Graphics 45, Other 1 | 0 / 0 / 115 | ipc 115, poll_wait 77, webrender_render 45, webrender_sw_raster 39 |
| SwComposite | 76 | 3.5 | Other 76 | 0 / 0 / 76 | webrender_render 76, poll_wait 72, webrender_sw_raster 4, memcpy_memset 1 |
| WRRenderBackend#0 | 39 | 1.8 | Other 39 | 0 / 0 / 39 | poll_wait 1, webrender_render 0 |
| Compositor | 28 | 1.3 | Idle 27, Other 1, Graphics 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, webrender_render 1, memcpy_memset 0 |
| Timer | 23 | 1.1 | Other 23 | 0 / 0 / 23 | ipc 23, poll_wait 23, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 289; `recvmsg [libc.so.6]` 10; `mprotect [libc.so.6]` 10; `[unknown]` 10; `[axiosozo-dev]` 9; `write [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 6; `[libgdk-3.so.0]` 6

**tab pid 3472** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.5 | GC / CC 9, Idle 1 | 0 / 0 / 10 | gc_cc 9, ipc 8, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `__lll_lock_wake [libc.so.6]` 1; `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObjectEdge(JSObj` 1; `void js::gc::MarkingTracerT<1u>::markAndTraverse<JS::Symbol>(JS::Symbo` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::dom::ContentChild::GetRemoteType() const [libxul.so]` 0

**tab pid 3953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3541** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

