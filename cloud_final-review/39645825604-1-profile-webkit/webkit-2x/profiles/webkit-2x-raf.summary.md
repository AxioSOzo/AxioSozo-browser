### webkit-2x raf (profile pass)

**parent pid 8817** — 815 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 317 | 10.2 | Idle 213, JavaScript 55, Other 29, DOM 15 | 10 / 58 / 249 | ipc 315, poll_wait 232, gc_cc 48, engine_stream_read 33 |
| DOM Worker | 140 | 4.5 | JavaScript 135, Other 3, Profiler 2 | 0 / 0 / 140 | subprocess_pipe_io 140, worker_messaging 140, ipc 140, js_ctypes 127 |
| Renderer | 118 | 3.8 | Idle 78, Graphics 40, Other 1 | 0 / 0 / 118 | ipc 118, poll_wait 91, webrender_render 41, webrender_sw_raster 30 |
| SwComposite | 58 | 1.9 | Other 58 | 0 / 0 / 58 | webrender_render 58, poll_wait 56, webrender_sw_raster 1, memcpy_memset 1 |
| BackgroundThreadPool #2 | 56 | 1.8 | Idle 50, Other 5, Graphics 1, Profiler 0 | 0 / 0 / 56 | ipc 56, poll_wait 51, native_receiver 6, memcpy_memset 4 |
| WRRenderBackend#0 | 45 | 1.5 | Other 45 | 0 / 0 / 45 | array_buffer_copy 0, webrender_render 0 |
| Compositor | 32 | 1.0 | Idle 31, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, webrender_render 1, canvas_2d 0 |
| Timer | 19 | 0.6 | Other 19 | 0 / 0 / 19 | ipc 19, poll_wait 19, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 227; `[unknown]` 10; `[axiosozo-dev]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `xpc::InitializeValue(nsXPTType const&, void*) [libxul.so]` 2; `js::RunScript(JSContext*, js::RunState&) [libxul.so]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2

**tab pid 9361** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1 | 0 / 0 / 3 | ipc 3, poll_wait 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `nsQueryReferent::operator()(nsID const&, void**) const [libxul.so]` 0

**tab pid 9367** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

**tab pid 9016** — 1 ms CPU in the window

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

