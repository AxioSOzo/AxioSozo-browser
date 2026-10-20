### chromium raf (profile pass)

**parent pid 3144** — 694 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 255 | 8.2 | Idle 188, JavaScript 38, Other 18, DOM 7 | 5 / 36 / 214 | ipc 255, poll_wait 200, gc_cc 43, engine_stream_read 23 |
| DOM Worker | 203 | 6.5 | JavaScript 198, Other 2, Profiler 2 | 0 / 0 / 203 | subprocess_pipe_io 203, worker_messaging 202, ipc 202, js_ctypes 193 |
| Renderer | 62 | 2.0 | Idle 52, Graphics 10 | 0 / 0 / 62 | ipc 62, poll_wait 53, webrender_render 10, webrender_sw_raster 8 |
| WRRenderBackend#0 | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 0, poll_wait 0, array_buffer_copy 0 |
| SwComposite | 33 | 1.1 | Other 33 | 0 / 0 / 33 | webrender_render 33, poll_wait 32, memcpy_memset 1, webrender_sw_raster 1 |
| BackgroundThreadPool #2 | 32 | 1.0 | Idle 30, Other 1 | 0 / 0 / 32 | ipc 32, poll_wait 30, native_receiver 1, memcpy_memset 1 |
| Compositor | 29 | 0.9 | Idle 28, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 29 | ipc 29, poll_wait 28, webrender_render 0, canvas_2d 0 |
| Timer | 23 | 0.8 | Other 23 | 0 / 0 / 23 | ipc 23, poll_wait 23 |

Main thread, top self: `poll [libc.so.6]` 189; `[unknown]` 8; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `write [libc.so.6]` 3; `JS::GetExecutionGlobalFromJSMicroTask(JSObject*) [libxul.so]` 2; `[linux-vdso.so.1]` 2; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 1

**tab pid 3799** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | GC / CC 3, Idle 2 | 0 / 0 / 5 | ipc 4, poll_wait 3, gc_cc 3, memcpy_memset 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `nsINode::UnoptimizableCCNode() const [libxul.so]` 0

**tab pid 3301** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::default_del` 0

**tab pid 3804** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 0

