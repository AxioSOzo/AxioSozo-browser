### webkit-2x raf-nosampler (profile pass)

**parent pid 8817** — 637 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 166 | 5.5 | Idle 99, JavaScript 46, DOM 10, Other 8 | 7 / 49 / 110 | ipc 164, poll_wait 103, gc_cc 56, engine_stream_read 46 |
| DOM Worker | 139 | 4.6 | JavaScript 138, Profiler 2 | 0 / 0 / 139 | subprocess_pipe_io 139, worker_messaging 139, ipc 139, js_ctypes 130 |
| Renderer | 112 | 3.7 | Idle 78, Graphics 34, Other 1, Profiler 0 | 0 / 0 / 112 | ipc 112, poll_wait 88, webrender_render 35, webrender_sw_raster 27 |
| SwComposite | 62 | 2.1 | Other 62 | 0 / 0 / 62 | webrender_render 62, poll_wait 59, memcpy_memset 3, webrender_sw_raster 3 |
| BackgroundThreadPool #2 | 60 | 2.0 | Idle 52, Other 8 | 0 / 0 / 60 | ipc 60, poll_wait 52, native_receiver 7, memcpy_memset 7 |
| WRRenderBackend#0 | 44 | 1.5 | Other 44 | 0 / 0 / 44 | memcpy_memset 0, webrender_render 0, array_buffer_copy 0 |
| Compositor | 31 | 1.0 | Idle 31, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 31 | ipc 31, poll_wait 31, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 13 | 0.4 | Idle 13, Other 0 | 0 / 0 / 13 | ipc 13, poll_wait 13, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 102; `[unknown]` 19; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `nsTSubstring<char>::Assign(char const*, unsigned long, std::nothrow_t ` 1; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 1; `js::jit::ICScript::initICEntries(JSContext*, JSScript*) [libxul.so]` 1

**tab pid 8989** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 8967** — 1 ms CPU in the window

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

**tab pid 9367** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `void mozilla::WriteULEB128<unsigned int, mozilla::ProfileBufferEntryWr` 0

