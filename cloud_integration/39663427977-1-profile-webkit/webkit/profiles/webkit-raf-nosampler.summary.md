### webkit raf-nosampler (profile pass)

**parent pid 7154** — 570 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 194 | 6.4 | JavaScript 189, Profiler 4, Other 1 | 0 / 0 / 194 | subprocess_pipe_io 194, worker_messaging 194, ipc 194, js_ctypes 179 |
| GeckoMain | 145 | 4.8 | Idle 86, JavaScript 31, Other 18, DOM 4 | 1 / 32 / 112 | ipc 144, poll_wait 94, gc_cc 32, worker_messaging 24 |
| Renderer | 69 | 2.3 | Idle 57, Graphics 12, Other 0, Profiler 0 | 0 / 0 / 69 | ipc 69, poll_wait 60, webrender_render 12, webrender_sw_raster 8 |
| BackgroundThreadPool #2 | 45 | 1.5 | Idle 43, Other 2, Graphics 0 | 0 / 0 / 45 | ipc 45, poll_wait 43, native_receiver 2, memcpy_memset 2 |
| SwComposite | 39 | 1.3 | Other 39 | 0 / 0 / 39 | webrender_render 39, poll_wait 38, webrender_sw_raster 1, memcpy_memset 1 |
| WRRenderBackend#0 | 31 | 1.0 | Other 31 | 0 / 0 / 31 | webrender_render 0, poll_wait 0, array_buffer_copy 0, memcpy_memset 0 |
| Compositor | 29 | 1.0 | Idle 28, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 29 | ipc 29, poll_wait 28, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | ipc 12, poll_wait 11, image_container 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 94; `[unknown]` 7; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 2; `MessageLoop::ProcessNextDelayedNonNestableTask() [libxul.so]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 1; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 1

**tab pid 7698** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1 | 0 / 0 / 3 | ipc 2, poll_wait 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObjectEdge(JSObj` 0; `js::PropMap::traceChildren(JSTracer*) [libxul.so]` 0

**tab pid 7704** — 1 ms CPU in the window

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

**tab pid 7297** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libxul.so]` 0; `TimerThreadWrapper::RemoveTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0

