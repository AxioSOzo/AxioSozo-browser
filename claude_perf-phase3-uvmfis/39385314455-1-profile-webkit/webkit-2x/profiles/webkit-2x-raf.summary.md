### webkit-2x raf (profile pass)

**parent pid 8674** — 1333 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 407 | 13.1 | Idle 281, JavaScript 68, Other 32, DOM 16 | 11 / 74 / 322 | ipc 407, poll_wait 293, gc_cc 60, engine_stream_read 42 |
| DOM Worker | 238 | 7.7 | JavaScript 225, Other 7, Profiler 6 | 0 / 0 / 238 | subprocess_pipe_io 238, worker_messaging 238, ipc 238, js_ctypes 210 |
| Renderer | 181 | 5.8 | Idle 113, Graphics 66, Profiler 1, Other 0 | 0 / 0 / 181 | ipc 181, poll_wait 141, webrender_render 68, webrender_sw_raster 58 |
| BackgroundThreadPool #3 | 152 | 8.5 | Other 80, Idle 70, Graphics 2 | 0 / 0 / 152 | ipc 152, native_receiver 82, memcpy_memset 78, poll_wait 71 |
| SwComposite | 116 | 3.7 | Other 116 | 0 / 0 / 116 | webrender_render 116, poll_wait 104, webrender_sw_raster 12, memcpy_memset 11 |
| BackgroundThreadPool #2 | 107 | 3.5 | Other 67, Idle 40, Profiler 1 | 0 / 0 / 107 | ipc 105, native_receiver 68, memcpy_memset 67, poll_wait 38 |
| WRRenderBackend#0 | 48 | 1.5 | Other 48 | 0 / 0 / 48 | webrender_render 0, poll_wait 0 |
| Compositor | 35 | 1.1 | Idle 34, Other 0, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 34, webrender_render 0, canvas_2d 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 290; `[unknown]` 18; `__lll_lock_wait [libc.so.6]` 5; `__lll_lock_wake [libc.so.6]` 4; `[axiosozo-dev]` 3; `js::jit::CacheIRCompiler::addFailurePath(js::jit::FailurePath**) [libx` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3

**tab pid 8848** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `std::_Rb_tree<RefPtr<mozilla::Task>, RefPtr<mozilla::Task>, std::_Iden` 0; `mozilla::ipc::NodeController::ForwardEvent(mojo::core::ports::NodeName` 0

**tab pid 9085** — 1 ms CPU in the window

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

**tab pid 8875** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mojo::core::ports::PortRef::PortRef(mojo::core::ports::PortRef const&)` 0

