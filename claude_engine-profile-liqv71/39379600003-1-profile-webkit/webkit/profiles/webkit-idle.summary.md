### webkit idle (profile pass)

**parent pid 7188** — 289 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 152 | 7.3 | Idle 122, JavaScript 13, Other 10, DOM 4 | 1 / 16 / 136 | ipc 152, poll_wait 126, harness_diagnostics 15, gc_cc 6 |
| DOM Worker | 110 | 5.3 | JavaScript 110 | 0 / 0 / 110 | subprocess_pipe_io 110, js_ctypes 110, worker_messaging 110, ipc 110 |
| Timer | 21 | 1.0 | Other 21, Profiler 0 | 0 / 0 / 21 | ipc 21, poll_wait 21 |
| Compositor | 1 | 0.1 | Idle 1, Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1, memcpy_memset 1 |
| DOM Worker | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | worker_messaging 1, ipc 1, poll_wait 1, gc_cc 0 |
| Renderer | 1 | 0.0 | Graphics 0, Idle 0 | 0 / 0 / 1 | ipc 1, webrender_render 0, webrender_sw_raster 0, poll_wait 0 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| SwComposite | 1 | 0.0 | Other 1 | 0 / 0 / 1 | webrender_render 1, webrender_sw_raster 1, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 125; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[unknown]` 1; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeObject*>, JS` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::BaseShape*>, js::BaseS` 1; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAllocPolicy<(` 1; `js::NativeObject::changeProperty(JSContext*, JS::Handle<js::NativeObje` 1; `js::frontend::NameOpEmitter::prepareForRhs() [libxul.so]` 1

**tab pid 7350** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 7369** — 1 ms CPU in the window

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

**tab pid 7712** — 1 ms CPU in the window

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

