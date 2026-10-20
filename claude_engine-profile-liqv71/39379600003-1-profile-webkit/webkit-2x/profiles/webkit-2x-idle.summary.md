### webkit-2x idle (profile pass)

**parent pid 8750** — 317 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 175 | 8.4 | Idle 127, JavaScript 19, Other 14, DOM 7 | 2 / 23 / 151 | ipc 174, poll_wait 132, harness_diagnostics 19, gc_cc 15 |
| DOM Worker | 109 | 5.2 | JavaScript 109 | 0 / 0 / 109 | subprocess_pipe_io 109, js_ctypes 109, worker_messaging 109, ipc 109 |
| Timer | 23 | 1.1 | Other 23, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23, memcpy_memset 0 |
| Renderer | 2 | 0.1 | Idle 2, Graphics 1 | 0 / 0 / 2 | ipc 2, poll_wait 2, memcpy_memset 1, webrender_render 1 |
| SwComposite | 2 | 0.1 | Other 2 | 0 / 0 / 2 | webrender_render 2, webrender_sw_raster 1, poll_wait 1 |
| Compositor | 2 | 0.1 | Idle 1, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 0 |
| BgIOThreadPool #2 | 1 | 0.1 | Other 1, Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| DOM Worker | 1 | 0.1 | Other 1, Idle 0 | 0 / 0 / 1 | worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 132; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `nsTHashtable<nsBaseHashtableET<nsCStringHashKey, RefPtr<mozilla::dom::` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::CycleCollec` 2; `mprotect [libc.so.6]` 2; `[unknown]` 2

**tab pid 8911** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9283** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8930** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

