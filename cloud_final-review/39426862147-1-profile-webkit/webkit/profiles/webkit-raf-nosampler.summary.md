### webkit raf-nosampler (profile pass)

**parent pid 7188** — 634 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 206 | 6.8 | JavaScript 199, Profiler 4, Other 4 | 0 / 0 / 206 | subprocess_pipe_io 206, worker_messaging 204, ipc 204, js_ctypes 185 |
| GeckoMain | 160 | 5.3 | Idle 93, JavaScript 42, Other 9, DOM 8 | 8 / 43 / 109 | ipc 160, poll_wait 97, gc_cc 53, engine_stream_read 34 |
| Renderer | 78 | 2.6 | Idle 61, Graphics 17, Other 1 | 0 / 0 / 78 | ipc 78, poll_wait 63, webrender_render 18, webrender_sw_raster 13 |
| SwComposite | 50 | 1.7 | Other 50 | 0 / 0 / 50 | webrender_render 50, poll_wait 47, memcpy_memset 2, webrender_sw_raster 2 |
| BackgroundThreadPool #1 | 49 | 1.6 | Idle 44, Other 5, Profiler 0, Graphics 0 | 0 / 0 / 49 | ipc 49, poll_wait 44, native_receiver 5, memcpy_memset 4 |
| WRRenderBackend#0 | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 1, poll_wait 0, array_buffer_copy 0 |
| Compositor | 32 | 1.1 | Idle 31, Other 1, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | ipc 12, poll_wait 12, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 99; `[unknown]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `bool js::detail::OrderedHashTableImpl<js::OrderedHashMapImpl<js::PreBa` 1; `PreprocessFastValue(JSContext*, JS::Value*, (anonymous namespace)::Str` 1; `presentNativeFrame (chrome://browser/content/axiosozo/EngineFrameSurfa` 1; `mozilla::EventTargetChainItem::HandleEventTargetChain(nsTArray<mozilla` 1; `NativeFrameSinks.prototype.apply/< ([System Principal]:145:21)[3]` 1

**tab pid 7740** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, Other 1, GC / CC 1 | 0 / 0 / 4 | ipc 4, poll_wait 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObjectEdge(JSO` 0; `__lll_lock_wake [libc.so.6]` 0

**tab pid 7746** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsITimerCallba` 0

**tab pid 7338** — 1 ms CPU in the window

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

