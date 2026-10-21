### webkit idle (profile pass)

**parent pid 7154** — 121 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 76 | 3.7 | Idle 63, JavaScript 6, DOM 2, Other 2 | 0 / 8 / 68 | ipc 76, poll_wait 64, harness_diagnostics 7, gc_cc 5 |
| DOM Worker | 34 | 1.6 | JavaScript 34 | 0 / 0 / 34 | subprocess_pipe_io 34, worker_messaging 34, ipc 34, js_ctypes 34 |
| Timer | 9 | 0.4 | Other 9 | 0 / 0 / 9 | ipc 9, poll_wait 9 |
| DOM Worker | 1 | 0.0 | Other 1, Idle 0 | 0 / 0 / 1 | worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0 |
| BgIOThreadPool #3 | 1 | 0.0 | Other 0, Idle 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Parent | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, memcpy_memset 0, ipc 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 64; `[unknown]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeBarePtr<JSO` 1; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<js::frontend::Ta` 1; `nsDocShell::QueryInterface(nsID const&, void**) [libxul.so]` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 1; `XPCConvert::NativeData2JS(JSContext*, JS::MutableHandle<JS::Value>, vo` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 1

**tab pid 7341** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 7860** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::GetCpuTimeSinceProcessStartInMs(unsigned long*) [libxul.so]` 0

**tab pid 7300** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

