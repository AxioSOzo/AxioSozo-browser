### webkit-2x key (profile pass)

**parent pid 8750** — 962 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 464 | 12.6 | Idle 248, JavaScript 83, Layout 39, Other 39 | 12 / 132 / 320 | ipc 462, poll_wait 283, gc_cc 86, paint_layout 68 |
| DOM Worker | 217 | 5.9 | JavaScript 212, Other 3, Profiler 2 | 0 / 0 / 217 | subprocess_pipe_io 217, worker_messaging 217, ipc 217, js_ctypes 206 |
| Renderer | 99 | 2.7 | Graphics 59, Idle 39 | 0 / 0 / 99 | ipc 99, webrender_render 59, webrender_sw_raster 49, poll_wait 41 |
| SwComposite | 86 | 2.3 | Other 86 | 0 / 0 / 86 | webrender_render 86, webrender_sw_raster 49, poll_wait 37, memcpy_memset 16 |
| Timer | 38 | 1.0 | Other 38, Profiler 0 | 0 / 0 / 38 | ipc 38, poll_wait 38 |
| Compositor | 15 | 0.4 | Idle 15, Other 0, Graphics 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, webrender_render 0, paint_layout 0 |
| BackgroundThreadPool #5 | 14 | 0.4 | Idle 8, Other 6, Graphics 1 | 0 / 0 / 14 | ipc 14, poll_wait 9, native_receiver 6, memcpy_memset 6 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_render 0, array_buffer_copy 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 259; `[unknown]` 8; `[axiosozo-dev]` 7; `mprotect [libc.so.6]` 6; `__memmove_avx_unaligned_erms [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4; `nsFlexContainerFrame::MoveFlexItemToFinalPosition(nsFlexContainerFrame` 3

**tab pid 8836** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, Other 0, JavaScript 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, gc_cc 0, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(unsigned int)` 0; `[unknown]` 0; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandle<JS::Valu` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInternal(mozil` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

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

