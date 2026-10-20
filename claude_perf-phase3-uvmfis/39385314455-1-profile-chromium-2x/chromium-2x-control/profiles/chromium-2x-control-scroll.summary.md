### chromium-2x-control scroll (profile pass)

**parent pid 4435** — 1936 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 521 | 24.0 | Idle 310, JavaScript 95, Other 61, DOM 19 | 10 / 100 / 411 | ipc 521, poll_wait 391, gc_cc 94, paint_layout 54 |
| Renderer | 429 | 19.7 | Idle 235, Graphics 190, Other 4 | 0 / 0 / 429 | ipc 429, poll_wait 258, webrender_render 194, webrender_sw_raster 156 |
| SwComposite | 369 | 17.0 | Other 369 | 0 / 0 / 369 | webrender_render 369, poll_wait 231, webrender_sw_raster 139, memcpy_memset 17 |
| DOM Worker | 288 | 13.3 | JavaScript 274, Profiler 11, Other 3 | 0 / 0 / 288 | subprocess_pipe_io 288, worker_messaging 288, ipc 288, js_ctypes 257 |
| BackgroundThreadPool #3 | 201 | 9.2 | Idle 129, Other 69, Graphics 4 | 0 / 0 / 201 | ipc 201, poll_wait 129, native_receiver 72, memcpy_memset 65 |
| WRRenderBackend#0 | 55 | 2.5 | Other 55 | 0 / 0 / 55 | webrender_render 2, poll_wait 1, memcpy_memset 1, array_buffer_copy 0 |
| Compositor | 29 | 1.4 | Idle 28, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 29 | ipc 29, poll_wait 28, webrender_render 1, canvas_2d 0 |
| Timer | 22 | 1.0 | Other 22 | 0 / 0 / 22 | ipc 22, poll_wait 22 |

Main thread, top self: `poll [libc.so.6]` 324; `[unknown]` 18; `[axiosozo-dev]` 10; `recvmsg [libc.so.6]` 8; `write [libc.so.6]` 4; `getcontext [libc.so.6]` 4; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 4; `ResolvePromise(JSContext*, JS::Handle<js::PromiseObject*>, JS::Handle<` 3

**tab pid 4533** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 11 | 0.5 | GC / CC 9, Idle 1, Other 0 | 0 / 0 / 11 | ipc 10, gc_cc 9, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObjectEdge(JSObj` 2; `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObjectEdge(JSObj` 1; `js::gc::BufferAllocator::startMajorCollection(js::gc::MaybeLockBufferA` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<js::GetterSetter>(js:` 1

**tab pid 4588** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.2 | GC / CC 2, Idle 1, Other 1 | 0 / 0 / 4 | ipc 3, gc_cc 2, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `nsComponentManagerImpl::GetServiceLocked(mozilla::Maybe<mozilla::Monit` 0; `bool js::gc::UnmarkGrayTracer<1u>::onChild<js::Shape>(js::Shape*) [lib` 0; `sendmsg [libc.so.6]` 0

**tab pid 4893** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0

